#!/usr/bin/env bash
# =====================================================================
#  Arojen Tarinat — Android-julkaisujen rakennusskripti
#  Tuottaa: debug-APK, allekirjoitettu release-APK ja AAB (Google Play).
#
#  VAATIMUKSET (asenna nämä koneellesi ensin):
#    - Node.js 18+           (https://nodejs.org)
#    - JDK 17 tai 21         (esim. Temurin / Android Studion mukana tuleva)
#    - Android SDK           (helpoiten: asenna Android Studio)
#      -> aseta ANDROID_HOME, esim. Windowsissa:
#         setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
#         (Linux/mac: export ANDROID_HOME="$HOME/Android/Sdk")
#
#  KÄYTTÖ:  bash build-android.sh
# =====================================================================
set -e
cd "$(dirname "$0")"

KEYSTORE="arojen-upload-key.jks"      # sijaitsee projektin juuressa
ALIAS="arojen"
PROPS="android/keystore.properties"

echo "==> 1/6  Asennetaan riippuvuudet (npm install)"
npm install

echo "==> 2/6  Rakennetaan web-build (vite)"
npm run build

echo "==> 3/6  Synkataan Capacitoriin (cap sync android)"
npx cap sync android

echo "==> 4/6  Debug-APK (testiasennukseen puhelimeen)"
( cd android && ./gradlew assembleDebug )
echo "    -> android/app/build/outputs/apk/debug/app-debug.apk"

# --- Release-allekirjoitus ---
if [ ! -f "$KEYSTORE" ]; then
  echo ""
  echo "==> Luodaan UPLOAD-KEYSTORE ($KEYSTORE)."
  echo "    TÄMÄ ON TÄRKEÄ: ota tiedostosta ja salasanoista varmuuskopio!"
  echo "    Jos menetät sen, et voi enää päivittää sovellusta Play-kaupassa."
  keytool -genkeypair -v -keystore "$KEYSTORE" -alias "$ALIAS" \
    -keyalg RSA -keysize 2048 -validity 10000
fi

if [ ! -f "$PROPS" ]; then
  echo ""
  echo "==> Kirjoita android/keystore.properties -tiedosto salasanoillasi."
  echo "    Esimerkki (korvaa SALASANA):"
  cat <<EOF

  storeFile=../$KEYSTORE
  storePassword=SALASANA
  keyAlias=$ALIAS
  keyPassword=SALASANA

EOF
  echo "    Luo se ja aja skripti uudelleen (vaiheet 5–6)."
  exit 0
fi

echo "==> 5/6  Allekirjoitettu release-APK"
( cd android && ./gradlew assembleRelease )
echo "    -> android/app/build/outputs/apk/release/app-release.apk"

echo "==> 6/6  AAB (Google Play -julkaisu)"
( cd android && ./gradlew bundleRelease )
echo "    -> android/app/build/outputs/bundle/release/app-release.aab"

echo ""
echo "VALMIS. Lataa app-release.aab Google Play Consoleen."
