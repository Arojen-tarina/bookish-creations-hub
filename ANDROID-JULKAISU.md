# Arojen Tarinat — Android-julkaisu (APK, allekirjoitettu APK, AAB)

Peli on Capacitor-projekti, ja Android-julkaisut rakennetaan **omalla koneellasi**
(pilviympäristössä ei ole Android SDK:ta eikä pääsyä Googlen/Mavenin palvelimiin,
joten APK/AAB:ia ei voi koota siellä). Projekti on jo synkattu build-valmiiksi.

## 1. Esivaatimukset (asenna kerran)

- **Node.js 18+** — https://nodejs.org
- **JDK 17 tai 21** — tulee Android Studion mukana
- **Android Studio** (sisältää Android SDK:n) — https://developer.android.com/studio
  - Aseta ympäristömuuttuja `ANDROID_HOME`:
    - Windows (PowerShell): `setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"`
    - Linux/mac: `export ANDROID_HOME="$HOME/Android/Sdk"`

## 2. Nopein tapa: valmis skripti

Projektin juuressa (`bookish-creations-hub`):

```bash
bash build-android.sh
```

Skripti rakentaa web-buildin, synkkaa Capacitorin, tekee **debug-APK:n**, ja
ensimmäisellä ajolla luo sinulle **upload-keystoren** sekä pyytää tekemään
`android/keystore.properties`-tiedoston. Kun se on tehty, aja skripti uudelleen —
se tuottaa **allekirjoitetun release-APK:n** ja **AAB:n**.

## 3. Käsin, vaihe vaiheelta

```bash
npm install
npm run build
npx cap sync android
```

### a) Debug-APK (testiin puhelimeen)
```bash
cd android
./gradlew assembleDebug
# -> android/app/build/outputs/apk/debug/app-debug.apk
```

### b) Allekirjoitusavain (kerran — SÄILÖ TURVALLISESTI!)
```bash
keytool -genkeypair -v -keystore arojen-upload-key.jks -alias arojen \
  -keyalg RSA -keysize 2048 -validity 10000
```
Luo sitten `android/keystore.properties` (malli: `android/keystore.properties.example`):
```
storeFile=../arojen-upload-key.jks
storePassword=<salasanasi>
keyAlias=arojen
keyPassword=<salasanasi>
```
> ⚠️ Ota `arojen-upload-key.jks`-tiedostosta ja salasanoista varmuuskopio.
> Jos menetät avaimen, et voi enää päivittää sovellusta Play-kaupassa.
> Tiedostot on jätetty `.gitignore`:en — älä lisää niitä versionhallintaan.

### c) Allekirjoitettu release-APK
```bash
cd android
./gradlew assembleRelease
# -> android/app/build/outputs/apk/release/app-release.apk
```

### d) AAB (Google Play)
```bash
cd android
./gradlew bundleRelease
# -> android/app/build/outputs/bundle/release/app-release.aab
```

## 4. Google Play Console

1. Luo sovellus Play Consolessa (https://play.google.com/console). Sovellus-ID on
   jo asetettu: **`fi.koalabear101.arojen_tarinat`**.
2. Ota käyttöön **Play App Signing** (suositus): lataa `app-release.aab`, ja Google
   hoitaa lopullisen allekirjoituksen; oma `arojen-upload-key.jks` on *upload-avaimesi*.
3. Täytä pakolliset tiedot: kuvaus, kuvakaappaukset, ikäluokitus, tietosuojaseloste,
   sisältöluokitus ja mainos-/tietoturvakyselyt.
4. Julkaise ensin **sisäiseen testaukseen**, sitten tuotantoon.

### Versionumero päivityksiin
Jokaiseen uuteen Play-julkaisuun kasvata `android/app/build.gradle`:ssa:
```
versionCode 2      // aina +1 edellisestä
versionName "1.1"  // näkyvä versio
```

## Sovelluksen tiedot
- **Nimi:** Arojen Tarinat
- **Paketti-ID:** fi.koalabear101.arojen_tarinat
- **minSdk:** 24 · **target/compileSdk:** 36
- Sisältää mainos-SDK:n (AdMob). Muista täyttää Play Consolen mainoskysely ja
  tietosuojaseloste sen mukaisesti.
