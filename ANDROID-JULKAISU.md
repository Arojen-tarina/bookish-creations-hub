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

1. Avaa sovellus Play Consolessa (https://play.google.com/console). Sovelluksen
  pakettitunnus on **`fi.bookish.creations.arojen.tarinat`**. Älä muuta sitä:
  Play-listaus on jo julkaistu tällä tunnuksella.
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

## Google Play -julkaisutiedot (en-US)
- App name: Arojen Tarinat
- Package name: fi.bookish.creations.arojen.tarinat
- Release notes (en-US):
  "Arojen Tarinat is a story-driven strategy game set on the plains of a mythical
  steppe. This release includes the first signed Android App Bundle with stable
  package configuration and improved compatibility for Android devices. Enjoy the
  immersive narrative, strategic province control, and updated gameplay polish."

## Google Play -kauppasivun hakutekstit

Play Console -listaus on erillinen julkaisuasetuksista eikä päivity tätä repoa
muuttamalla. Seuraavat tekstit voi lisätä Play Consolen kauppasivulle suomen- ja
englanninkielisinä lokalisointeina. Ne kuvaavat pelin nykyisiä ominaisuuksia ja
sisältävät pelin nimeä sekä luonnollisia strategiapeli-hakutermejä.

### fi-FI
- Nimi: Arojen Tarinat
- Lyhyt kuvaus: Vuoropohjainen strategiapeli arojen valtakunnista vuonna 1206.
- Täysi kuvaus:

  Arojen Tarinat on vuoteen 1206 sijoittuva vuoropohjainen strategiapeli. Valitse
  Mongolien valtakunta, Song-dynastia, Venäjän ruhtinaskunnat tai Khwarezmin
  valtakunta ja johda sitä Euraasian kartalla.

  Laajenna valtakuntaasi provinssi kerrallaan. Kerää kultaa, ruokaa ja hevosia,
  värvää armeijoita, rakenna puolustusta ja pelaa taktiikkakortteja ratkaisevilla
  hetkillä. Diplomatia ja Silkkitien kauppa voivat olla yhtä arvokkaita kuin voitto
  taistelussa.

  Kohtaa tekoälyn ohjaamat valtakunnat yksinpelissä. Valitse vaikeustaso ja tavoittele
  voittoa viidellä tavalla: sotilaallisesti, talouden, teknologian, diplomatian tai
  kulttuurin avulla.

  Arojen Tarinat yhdistää karttapohjaisen strategian, vuoropohjaisen taistelun,
  resurssienhallinnan, kortit ja diplomatian. Laajennatko rajojasi, vahvistatko
  talouttasi vai solmitko liiton?

### en-US
- App name: Arojen Tarinat
- Short description: Turn-based strategy across the steppe in 1206.
- Full description:

  Arojen Tarinat is a turn-based strategy game set in Eurasia in 1206. Choose the
  Mongol Empire, Song Dynasty, Rus Principalities, or Khwarezmian Empire and lead
  your realm across the map.

  Expand province by province. Gather gold, food, and horses, recruit armies, build
  defenses, and play tactical cards at decisive moments. Diplomacy and Silk Road
  trade can be as valuable as victory in battle.

  Face AI-controlled realms in a single-player game. Choose your difficulty and
  pursue victory in five ways: military, economic, technological, diplomatic, or
  cultural.

  Arojen Tarinat combines map-based strategy, turn-based combat, resource
  management, cards, and diplomacy. Will you expand your borders, strengthen your
  economy, or negotiate an alliance?
