import com.google.firebase.crashlytics.buildtools.gradle.CrashlyticsExtension
import com.google.gms.googleservices.GoogleServicesPlugin.MissingGoogleServicesStrategy
import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.google.services)
    alias(libs.plugins.firebase.crashlytics)
}

android {
    namespace = "fi.bookish.creations.arojen.tarinat"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        // Must stay identical to the published Play listing.
        applicationId = "fi.bookish.creations.arojen.tarinat"
        minSdk = 24
        targetSdk = 37
        // The live WebView (Capacitor) release is versionCode 19; 30 was the first native build, 36 adds online play.
        // the owner may still ship from the old project; every later release adds 1.
        versionCode = 40
        versionName = "2.1.4"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        manifestPlaceholders["appLabel"] = "@string/app_name"

        // Set in gradle.properties; empty values turn the online features off.
        val supabaseUrl = providers.gradleProperty("arojen.supabase.url").getOrElse("")
        val supabaseKey = providers.gradleProperty("arojen.supabase.key").getOrElse("")
        buildConfigField("String", "SUPABASE_URL", "\"$supabaseUrl\"")
        buildConfigField("String", "SUPABASE_KEY", "\"$supabaseKey\"")
        val googleWebClientId = providers.gradleProperty("arojen.google.webClientId").getOrElse("")
        buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"$googleWebClientId\"")
        // Google's sample ad units instead of the real ones (see ads/AdUnits.kt).
        buildConfigField("Boolean", "TEST_ADS", "false")
    }

    // Keys stay outside the repository, each described by a properties file in the project root:
    // keystore.properties holds the owner's Play upload key (release), keystore-preview.properties
    // the developer's own key (preview APKs). Without the file that build type stays unsigned.
    signingConfigs {
        for ((name, propsName) in listOf("release" to "keystore.properties", "preview" to "keystore-preview.properties")) {
            val props = rootProject.file(propsName).takeIf { it.exists() }?.let { f -> Properties().apply { f.inputStream().use(::load) } } ?: continue
            create(name) {
                storeFile = file(props.getProperty("storeFile"))
                storePassword = props.getProperty("storePassword")
                keyAlias = props.getProperty("keyAlias")
                keyPassword = props.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        debug {
            // Installs next to the Play Store build instead of replacing it.
            applicationIdSuffix = ".dev"
            versionNameSuffix = "-dev"
            manifestPlaceholders["appLabel"] = "Arojen DEV"
            // Google's sample app ID: debug builds never request real ads.
            manifestPlaceholders["admobAppId"] = "ca-app-pub-3940256099942544~3347511713"
            buildConfigField("Boolean", "TEST_ADS", "true")
        }
        release {
            manifestPlaceholders["admobAppId"] = "ca-app-pub-1848284154496261~2996479757"
            signingConfig = signingConfigs.findByName("release")
            optimization {
                enable = true
                packageScope = setOf("androidx.**", "kotlin.**", "kotlinx.**")
            }
        }
        // The release build (same speed, R8) for testing on a phone, e.g. the owner's: its own id
        // installs next to the Play Store app, the developer's key signs it, and it shows Google's
        // sample ads, since tapping one's own real ads counts as invalid traffic.
        create("preview") {
            initWith(getByName("release"))
            applicationIdSuffix = ".preview"
            versionNameSuffix = "-preview"
            manifestPlaceholders["appLabel"] = "Arojen Preview"
            manifestPlaceholders["admobAppId"] = "ca-app-pub-3940256099942544~3347511713"
            buildConfigField("Boolean", "TEST_ADS", "true")
            signingConfig = signingConfigs.findByName("preview")
            matchingFallbacks += "release"
            // No Firebase app for the .preview id, so there is nowhere to send its R8 mapping.
            (this as ExtensionAware).extensions.configure<CrashlyticsExtension> { mappingFileUploadEnabled = false }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
        // java.time (dates for stats, streaks and analytics) needs API 26; this backports it to Android 7.
        isCoreLibraryDesugaringEnabled = true
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    testOptions {
        // Analytics logs through android.util.Log; unit tests get default return values instead of "not mocked" errors.
        unitTests.isReturnDefaultValues = true
    }
}

dependencies {
    coreLibraryDesugaring(libs.desugar.jdk.libs)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.core.splashscreen)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.process)
    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.play.services.ads)
    implementation(libs.user.messaging.platform)
    implementation(libs.play.app.update)
    implementation(libs.play.review)
    implementation(libs.play.billing)
    implementation(platform(libs.supabase.bom))
    implementation(libs.supabase.auth)
    implementation(libs.supabase.postgrest)
    implementation(libs.supabase.realtime)
    implementation(libs.supabase.storage)
    implementation(libs.ktor.client.okhttp)
    implementation(libs.androidx.credentials)
    implementation(libs.androidx.credentials.play.services)
    implementation(libs.googleid)
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.analytics)
    implementation(libs.firebase.crashlytics)
    implementation(libs.firebase.messaging)
    implementation(libs.firebase.inappmessaging)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)
    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
}

// google-services.json (src/release) covers the Play package only: debug and preview builds run without Firebase.
googleServices {
    missingGoogleServicesStrategy = MissingGoogleServicesStrategy.WARN
}
