# Arojen Tarinat

`Arojen Tarinat` on selainstrategiapeli, jossa pelaaja rakentaa valtakuntaa, käy kauppaa, neuvottelee diplomaattisia sopimuksia ja kohtaa tekoälyn ohjaamia vastustajia.

## Tämän projektin sisältö

- `src/App.tsx` – sovelluksen reititys ja juurirakenne
- `src/pages/Digipeli.tsx` – digitaalisen pelin käynnistys
- `src/game/ProvinceGame.tsx` – pelin pääkomponentti ja käyttöliittymä
- `src/game/LegalDisclaimer.tsx` – hyväksyttävä vastuuvapauslauseke ennen pelaamista
- `src/game/AIPrivacyNotice.tsx` – tekoälyn käyttöä ja tietosuojaa selventävä sivu

## Käyttöönotto

Asenna riippuvuudet ja käynnistä kehityspalvelin:

```sh
npm install
npm run dev
```

## Rakennus

Tuotantoversio luodaan komennolla:

```sh
npm run build
```

Web-sovellus pysyy GitHub Pages -julkaisun ja selaimessa pelaamisen lähteenä.
Sama React/TypeScript-koodi toimii myös mobiiliselaimissa.

## Natiivi Android-sovellus

Natiivi Kotlin- ja Jetpack Compose -sovellus on hakemistossa `android-native/`.
Android-versio käyttää tätä projektia; React-sovelluksen GitHub Pages -julkaisu
ja vanha Capacitor-projekti säilyvät erillisinä.

```sh
npm run test:android
npm run build:android
npm run bundle:android
```

Android Studio -kehitystä ja asetuksia varten katso
[android-native/BUILD.md](./android-native/BUILD.md). Web-sovellus on yhteisen
pelidatan ja pelisääntöjen lähde. Natiivin datan, käyttöliittymätekstien ja
pariteettitestausten päivittäminen onnistuu natiiviprojektin hakemistosta:

```sh
bash tools/parity/regenerate.sh .. data
bash tools/parity/regenerate.sh .. goldens
```

Valinnaiset Supabase-asetukset voi lisätä käyttäjäkohtaiseen tiedostoon
`~/.gradle/gradle.properties` ominaisuuksina `arojen.supabase.url` ja
`arojen.supabase.key`; niitä ei tallenneta versionhallintaan.

## Hirvi-avustaja

Hirvi-avustaja käyttää Supabase Edge Functionia ja OpenAI:n `gpt-4o-mini`-
mallia. Aseta OpenAI-avaimesi Supabase-projektin salaisuudeksi ennen
`moose-chat`-funktion julkaisemista:

```sh
npx supabase secrets set OPENAI_API_KEY=your_openai_api_key
npx supabase functions deploy moose-chat
```

Älä lisää API-avainta selaimen ympäristömuuttujiin tai versionhallintaan.
Jos etäavustaja ei ole saatavilla, selain käyttää paikallista sääntö- ja
loretietoa sekä kirjaa yhteysvirheen kehityskonsoliin.

## Huomio

Sovellus on optimoitu hakukoneita varten käyttämällä kuvaavia metatietoja ja kielitunnistusta `index.html`-tiedostossa.
