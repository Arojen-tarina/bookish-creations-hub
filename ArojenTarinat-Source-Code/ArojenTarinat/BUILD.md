# Arojen Tarinat: native Android app, build guide

The game rewritten in Kotlin and Jetpack Compose. It replaces the Capacitor (WebView) build on the same Play listing.

- Package: `fi.bookish.creations.arojen.tarinat`
- Version: versionCode 40, versionName 2.1.4 (the live WebView release is 19; 30 was the first native build)
- Supported: Android 7.0 (API 24) and newer; target and compile SDK 37

## 1. Open the project

1. Install a current Android Studio and use its bundled JDK.
2. Choose *File > Open* and select this folder. Let Gradle sync. Studio offers to install a missing SDK platform; accept.
3. Run the `app` configuration on a phone. This gives the **debug** build.

## 2. Settings in `gradle.properties`

| Property | Purpose |
|---|---|
| `arojen.supabase.url` | Your Supabase project |
| `arojen.supabase.key` | Its public (publishable) key, the same one the web build ships |

These two drive the Moose guide's online answers and the analytics. Leave both empty to turn those features off.

## 3. Sign and build the Play release (your upload key)

Your key never leaves your machine. Create a file named `keystore.properties` in this folder, next to `gradle.properties`:

```
storeFile=C:/path/to/your-upload-key.jks
storePassword=your store password
keyAlias=your key alias
keyPassword=your key password
```

Use the same upload key as the current Play listing. `.gitignore` already excludes this file and all `*.jks` / `*.keystore` files, so they are never committed.

To build:

```
gradlew bundleRelease
```

The bundle is `app/build/outputs/bundle/release/app-release.aab`. Upload it in Play Console as a new release. Without `keystore.properties` the bundle is unsigned and Play rejects it.

R8 (code shrinking) runs on release builds and needs a few minutes. Its extra keep rules are in `app/src/main/keepRules/`.

## 4. Build types

| Build type | App id suffix | Ads | Signed with | Use |
|---|---|---|---|---|
| `debug` | `.dev` | Google sample ads | Android debug key | Development |
| `preview` | `.preview` | Google sample ads | `keystore-preview.properties` (the developer's own key) | A release-speed APK that installs next to the Play version |
| `release` | none | Your AdMob units | `keystore.properties` (your upload key) | Google Play |

Never tap your own real ads, because AdMob counts that as invalid traffic. Test with `debug` or `preview`.

A debug build started with `adb shell am start -n fi.bookish.creations.arojen.tarinat.dev/fi.bookish.creations.arojen.tarinat.MainActivity --ez premium true` acts as if Premium were active (`false` turns it off). Debug builds have their own app id, so Play sells them nothing; this is how to check the ad-free game there.

## 5. Play Console checklist for this update

- **Ads:** the app contains ads (AdMob: banner, interstitial, rewarded interstitial, app open).
- **Advertising ID:** declare that the app uses it. The Google Mobile Ads SDK adds the `AD_ID` permission.
- **Data safety:** review the form against the Google Mobile Ads SDK's data disclosure and against the anonymous gameplay analytics. Analytics are sent to your Supabase only after the player agrees in the first-run dialog, use a random ID, and can be turned off in Settings.
- **Consent:** the Google UMP consent form appears where the law requires it (EEA, UK). Configure the messages in AdMob under *Privacy & messaging*.
- **Premium subscription (no ads):** create it under *Monetize with Play > Products > Subscriptions*. The ids must match the code (`billing/Premium.kt`):
  - Product id: `premium`, name "Arojen Premium".
  - Base plan id: `monthly`, auto-renewing, billing period 1 month. Suggested price: EUR 2.49, with Play's converted prices for other countries. You can change the price in Play Console at any time without a new app version.
  - Optional: a free trial or an intro offer on the `monthly` base plan. The app picks it up by itself for players who are eligible.
  - While it is active, the app shows no adverts of any kind, and the Silk Road tribute and the second chance are given without an advert. The offer appears in Settings and as a button on the main menu, once Play returns the product.
  - To test buying without being charged, add your Google account under *Settings > License testing* and install the app from a testing track (internal testing is enough), so Play delivers it exactly as players get it.
- **Accounts (version 2.1):** players can sign in with Google or with email and password, and can delete their account in the app (Settings > Account > Delete account). In *App content > Data safety* declare: email address (account management), user IDs, app activity (game progress, kept as a cloud copy), crash logs and diagnostics (Firebase Crashlytics), and audio (voice messages the player chooses to send in multiplayer chat). For the account deletion question, give a web page or email address where players can also ask for deletion.
- **User-generated content:** multiplayer chat (text and 30-second voice messages) has Report and Mute on every message. Reports arrive in the `mp_reports` table in Supabase; review them there.
- **Microphone and notifications:** the app asks for the microphone only when a player records a voice message, and for notifications (Android 13+) once on the main menu.

## 5a. Online services (Supabase, Firebase, links)

**Supabase** (project `qqzyibuwgdcjdjprtwky`). Everything below is already set up; keep it if you ever move the project.

- SQL, run in this order from `supabase/sql/`:
  1. `001_premium_subscriptions.sql`
  2. `002_multiplayer.sql`
  3. `003_analytics_new_events.sql` (must be in place before this version is live, or the database refuses its analytics)
  4. `004_public_rooms.sql`
  5. `005_accounts_cloud_save.sql`
  6. `006_one_lobby_per_player.sql`
- Authentication: anonymous sign-ins ON, Google provider ON (Web client `724101650976-ipc7…`), email ON, "Allow manual linking" ON.
- Edge Functions in `supabase/functions/`:
  - `verify-premium` checks subscriptions with Google Play. It needs the secret `GOOGLE_SERVICE_ACCOUNT_JSON`: the JSON key of a Google Cloud service account that Play Console lists under *Users and permissions* with "View financial data" and "Manage orders and subscriptions". Until that secret is set, the app trusts Play on the phone.
  - `play-notifications` receives Play's real-time developer notifications. It is deployed with `--no-verify-jwt`. Set the secret `PLAY_RTDN_SECRET`, then point a Pub/Sub push subscription at `https://qqzyibuwgdcjdjprtwky.supabase.co/functions/v1/play-notifications?secret=<that secret>`.
  - Deploy: `npx supabase functions deploy verify-premium --project-ref qqzyibuwgdcjdjprtwky --use-api`, and the same command with `--no-verify-jwt` for `play-notifications`.
- Housekeeping: `select public.mp_cleanup()` removes rooms untouched for 14 days; schedule it with pg_cron. Voice files live in the `mp-audio` bucket and are removed in *Storage*.

**Firebase** (project `tales-of-the-steppe`): `app/src/release/google-services.json` covers the Play package only, so Crashlytics, Google Analytics, push notifications (Cloud Messaging, topic `all`) and In-App Messaging run in the release build; debug and preview builds run without Firebase. Google Analytics and in-app message targeting follow the player's usage-analytics choice. Send campaigns from the Firebase console.

**Invite links**: `cloudflare/worker.js` runs at `https://dl.arojentarinat.com/` (and still at `https://arojentarinat.juusohonkonen2004.workers.dev/`, so invites from version 2.1.0 keep working). It serves `/.well-known/assetlinks.json` and the `/join/ABC123` invite page, and sends everything else to the website `https://www.arojentarinat.com`. With the game installed, an invite link opens the game straight into that room. If the app is ever signed with another key, add that key's SHA-256 to `ASSET_LINKS` in the worker.

**Google sign-in** needs an Android OAuth client in Google Cloud (project `tales-of-the-steppe`) for each package and signing key. For `fi.bookish.creations.arojen.tarinat`, add both the Play app signing SHA-1 and the upload key SHA-1. The Web client id is set in `gradle.properties` (`arojen.google.webClientId`).

## 6. What carries over from the WebView version

On the first start after the update, the app reads the old version's saved data once:

- language
- music volume
- achievements and lifetime stats
- analytics consent and anonymous ID

Campaigns in progress do not carry over, because the save format is new.

## 7. Useful tools

| Command | What it does |
|---|---|
| `gradlew testDebugUnitTest` | Unit tests: game rules, saves, ads pacing, analytics events, achievements |
| `python tools/check_translations.py` | Checks the 12 hand-translated languages against English: keys, placeholders, plurals |
| `tools/parity/regenerate.sh` | Regenerates `strings_ui.xml` and the game data from the original web project |
| `tools/supabase/*.sql` | Read-only analytics queries (events per platform and version, session health) |
| `python tools/icon/make_icon.py ...` | Rebuilds the launcher icon and the 512 px store icon (`store/icon-512.png`) |
| `python tools/store/make_store_graphics.py <captures> <out> --render` | Rebuilds the store screenshots (1920x1080 with captions) and the feature graphic from phone captures |
| `python tools/store/png_add_alpha.py <in> <out>` | Turns an RGB PNG into the 32-bit PNG Play wants for the app icon |

### Retaking the store screenshots

1. Make a mid-game save. Set the environment variable `AROJEN_SCREENSHOT_STATE` to an empty folder and run `gradlew testDebugUnitTest --tests "*StoreScreenshotStateGen*"`. It writes `autosave.json` and `autosave.meta.json` for a Mongol campaign at turn 14.
2. Copy both files into the debug app's `files/saves/` folder, e.g. `adb exec-in run-as fi.bookish.creations.arojen.tarinat.dev sh -c "cat > files/saves/autosave.json" < autosave.json`.
3. Start the debug app without adverts: `adb shell am start -n fi.bookish.creations.arojen.tarinat.dev/fi.bookish.creations.arojen.tarinat.MainActivity --ez storeScreenshots true`. This switch only exists in debug builds.
4. Turn off the phone's Game Dashboard shortcut if it shows a tab on the screen edge.
5. Capture the screens with `adb exec-out screencap -p > name.png`, one folder per language.
6. Run `make_store_graphics.py` on those folders.

R8 keep rules beyond the libraries' own are in `app/src/main/keepRules/` (AGP 9 reads `*.keep` files there). `room.keep` is required: without it the release build crashes on start (WorkManager's database inside the Google Mobile Ads SDK).
