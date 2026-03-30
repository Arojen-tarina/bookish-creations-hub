# Bookish Creations Hub

`Bookish Creations Hub` on selainstrategiapeli, jossa pelaaja rakentaa Mongolien valtakuntaa, käy kauppaa, neuvottelee diplomaattisia sopimuksia ja kohtaa tekoälyn ohjaamia vastustajia.

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

## Huomio

Sovellus on optimoitu hakukoneita varten käyttämällä kuvaavia metatietoja ja kielitunnistusta `index.html`-tiedostossa.
