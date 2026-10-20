# Arojen Tarinat: native Android app, build guide

The game rewritten in Kotlin and Jetpack Compose. It replaces the Capacitor (WebView) build on the same Play listing.

- Package: `fi.bookish.creations.arojen.tarinat`
- Version: versionCode 30 (the live WebView release is 19), versionName 2.0.0
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

## 5. Play Console checklist for this update

- **Ads:** the app contains ads (AdMob: banner, interstitial, rewarded interstitial, app open).
- **Advertising ID:** declare that the app uses it. The Google Mobile Ads SDK adds the `AD_ID` permission.
- **Data safety:** review the form against the Google Mobile Ads SDK's data disclosure and against the anonymous gameplay analytics. Analytics are sent to your Supabase only after the player agrees in the first-run dialog, use a random ID, and can be turned off in Settings.
- **Consent:** the Google UMP consent form appears where the law requires it (EEA, UK). Configure the messages in AdMob under *Privacy & messaging*.

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
