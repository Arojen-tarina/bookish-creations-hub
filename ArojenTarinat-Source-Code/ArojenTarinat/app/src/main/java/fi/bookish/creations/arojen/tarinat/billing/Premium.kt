package fi.bookish.creations.arojen.tarinat.billing

import android.app.Activity
import android.app.Application
import android.content.Context
import android.content.Intent
import androidx.core.content.edit
import androidx.core.net.toUri
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClient.BillingResponseCode
import com.android.billingclient.api.BillingClient.ProductType
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** What the store shows for the monthly plan, in the player's own currency. */
data class PremiumOffer(
    val product: ProductDetails,
    val offerToken: String,
    /** Recurring price, e.g. "2,49 €". */
    val price: String,
)

/** Outcome of the last purchase attempt, for a one-line note under the subscribe button. */
enum class PremiumNotice { PENDING, FAILED }

/**
 * The "Arojen Premium" monthly subscription (Google Play Billing): while it is
 * active the app shows no adverts at all, and the opt-in rewards come without
 * one. The last known state is cached so a subscriber's cold start never
 * flashes an advert before Play has answered. The price lives in Play Console.
 * When the server ([verifier]) can ask Google about the purchase, its answer wins
 * over the phone's; without it (not set up, offline) the phone's answer stands.
 */
class Premium(
    private val app: Application,
    scope: CoroutineScope,
    private val verifier: PremiumVerifier?,
    private val clock: () -> Long = System::currentTimeMillis,
) {
    private val main = CoroutineScope(scope.coroutineContext + Dispatchers.Main.immediate)
    private val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    private val _active = MutableStateFlow(prefs.getBoolean(KEY_ACTIVE, false))

    /** The subscription is active: no adverts anywhere. */
    val active: StateFlow<Boolean> = _active.asStateFlow()

    private val _offer = MutableStateFlow<PremiumOffer?>(null)

    /** The plan as Play sells it here; null until Play answers, or when the store has none. */
    val offer: StateFlow<PremiumOffer?> = _offer.asStateFlow()

    private val _notice = MutableStateFlow<PremiumNotice?>(null)
    val notice: StateFlow<PremiumNotice?> = _notice.asStateFlow()

    /** Called once per completed purchase (for analytics). */
    var onPurchased: () -> Unit = {}

    private val client: BillingClient = BillingClient.newBuilder(app)
        .setListener(::onPurchasesUpdated)
        .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
        .enableAutoServiceReconnection()
        .build()

    /** Connects to Play and reads the plan and the player's subscription. Safe to call on every resume. */
    fun refresh() {
        if (client.isReady) {
            queryAll()
            return
        }
        client.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                if (result.responseCode == BillingResponseCode.OK) main.launch { queryAll() }
            }

            // Automatic reconnection is on; the next refresh asks again.
            override fun onBillingServiceDisconnected() = Unit
        })
    }

    private fun queryAll() {
        queryOffer()
        queryPurchases()
    }

    private fun queryOffer() {
        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(
                listOf(
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(PRODUCT_ID)
                        .setProductType(ProductType.SUBS)
                        .build(),
                ),
            )
            .build()
        client.queryProductDetailsAsync(params) { result, details ->
            if (result.responseCode != BillingResponseCode.OK) return@queryProductDetailsAsync
            val offer = details.productDetailsList.firstOrNull { it.productId == PRODUCT_ID }?.let(::monthlyOffer)
            main.launch { _offer.value = offer }
        }
    }

    /** The monthly base plan; a trial or intro offer Play says this player may take wins over the plain plan. */
    private fun monthlyOffer(product: ProductDetails): PremiumOffer? {
        val offers = product.subscriptionOfferDetails.orEmpty().filter { it.basePlanId == BASE_PLAN_ID }
        val chosen = offers.minByOrNull { it.pricingPhases.pricingPhaseList.firstOrNull()?.priceAmountMicros ?: Long.MAX_VALUE }
            ?: return null
        val recurring = chosen.pricingPhases.pricingPhaseList.lastOrNull() ?: return null
        return PremiumOffer(product, chosen.offerToken, recurring.formattedPrice)
    }

    private fun queryPurchases() {
        val params = QueryPurchasesParams.newBuilder().setProductType(ProductType.SUBS).build()
        client.queryPurchasesAsync(params) { result, purchases ->
            // No answer (offline, Play busy): the cached state stays.
            if (result.responseCode == BillingResponseCode.OK) main.launch { apply(purchases, fromPurchaseFlow = false) }
        }
    }

    /** Opens Play's purchase sheet for the monthly plan. False when the store has not offered it. */
    fun subscribe(activity: Activity): Boolean {
        val offer = _offer.value ?: return false
        _notice.value = null
        val params = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(
                listOf(
                    BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(offer.product)
                        .setOfferToken(offer.offerToken)
                        .build(),
                ),
            )
            .build()
        return client.launchBillingFlow(activity, params).responseCode == BillingResponseCode.OK
    }

    /** Play's own page for this subscription: cancel, change payment, see the renewal date. */
    fun openManagement(activity: Activity) {
        val uri = "https://play.google.com/store/account/subscriptions?sku=$PRODUCT_ID&package=${app.packageName}".toUri()
        runCatching { activity.startActivity(Intent(Intent.ACTION_VIEW, uri)) }
    }

    private fun onPurchasesUpdated(result: BillingResult, purchases: List<Purchase>?) {
        main.launch {
            when (result.responseCode) {
                BillingResponseCode.OK -> apply(purchases.orEmpty(), fromPurchaseFlow = true)
                BillingResponseCode.ITEM_ALREADY_OWNED -> queryPurchases()
                BillingResponseCode.USER_CANCELED -> Unit
                else -> _notice.value = PremiumNotice.FAILED
            }
        }
    }

    private fun apply(purchases: List<Purchase>, fromPurchaseFlow: Boolean) {
        val ours = purchases.filter { PRODUCT_ID in it.products }
        val owned = ours.filter { it.purchaseState == Purchase.PurchaseState.PURCHASED }
        // A purchase update only lists what just changed; the full list comes from queryPurchases.
        if (owned.isNotEmpty() || !fromPurchaseFlow) setActive(owned.isNotEmpty())
        if (fromPurchaseFlow) {
            _notice.value = if (owned.isEmpty() && ours.any { it.purchaseState == Purchase.PurchaseState.PENDING }) PremiumNotice.PENDING else null
            if (owned.isNotEmpty()) onPurchased()
        }
        // Play refunds a purchase that is not acknowledged within three days.
        for (purchase in owned.filter { !it.isAcknowledged }) {
            val params = AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchase.purchaseToken).build()
            client.acknowledgePurchase(params) {}
        }
        if (owned.isNotEmpty()) verifyOnServer(owned.map { it.purchaseToken }, force = fromPurchaseFlow)
    }

    private var lastVerifiedAt = 0L

    /** Google's answer through the server; only a definite "not active" for every token takes Premium away. */
    private fun verifyOnServer(tokens: List<String>, force: Boolean) {
        val server = verifier ?: return
        if (!force && clock() - lastVerifiedAt < VERIFY_INTERVAL_MS) return
        lastVerifiedAt = clock()
        main.launch {
            val answers = tokens.map { server.isActive(it) }
            when {
                answers.any { it == true } -> setActive(true)
                answers.all { it == false } -> setActive(false)
                // Some unanswered: keep what Play on the phone said.
                else -> lastVerifiedAt = 0L
            }
        }
    }

    private fun setActive(value: Boolean) {
        val forced = debugOverride
        if (forced != null) {
            _active.value = forced
            return
        }
        _active.value = value
        prefs.edit { putBoolean(KEY_ACTIVE, value) }
    }

    /** Debug builds have their own app id, so Play sells them nothing: this pretends the subscription is on or off. */
    private var debugOverride: Boolean? = null

    fun overrideForDebug(active: Boolean) {
        debugOverride = active
        _active.value = active
    }

    companion object {
        /** Subscription product id and its base plan, as created in Play Console. */
        const val PRODUCT_ID = "premium"
        const val BASE_PLAN_ID = "monthly"

        private const val PREFS = "premium"
        private const val VERIFY_INTERVAL_MS = 30 * 60 * 1000L
        private const val KEY_ACTIVE = "active"
    }
}
