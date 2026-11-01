// Called by the app after a Premium purchase and on every start while a subscription
// is held: Google's own answer decides whether the player has Premium, and every
// subscription is recorded in public.premium_subscriptions.
//
// POST { "purchaseToken": "..." }
// 200  { configured: true, active, state, expiryTime }
// 503  { configured: false }  (no service account yet: the app trusts Play on the phone)
// 502  { configured: true, error }  (Google unreachable or refused the service account)
import { json, serviceAccount, UnknownPurchase, verifyAndStore } from "../_shared/play.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const body = await req.json().catch(() => null);
  const token = body?.purchaseToken;
  if (typeof token !== "string" || token.length < 10 || token.length > 4096) return json({ error: "purchaseToken missing" }, 400);
  if (!serviceAccount()) return json({ configured: false }, 503);
  try {
    const verdict = await verifyAndStore(token);
    return json({ configured: true, ...verdict });
  } catch (e) {
    if (e instanceof UnknownPurchase) return json({ configured: true, active: false, state: "UNKNOWN_PURCHASE", expiryTime: null });
    console.error(e);
    return json({ configured: true, error: "play_api" }, 502);
  }
});
