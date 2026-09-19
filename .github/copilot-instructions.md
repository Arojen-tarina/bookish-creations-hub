# Arojen Tarinat — ohjeet AI-agentille (OWASP Top 10:2025)

Tämä tiedosto ohjaa jokaista koodimuutosta tässä repossa. Lähde: [OWASP Top 10:2025](https://github.com/OWASP/Top10/tree/master/2025/docs/en).

## Sovellus lyhyesti

- **Stack: TypeScript + React + Vite**, paketoitu Androidille **Capacitorilla** (WebView) — **ei Unitya, ei C#:aa**. Älä anna Unity-spesifisiä neuvoja.
- Backend on minimaalinen: **Supabase** (Postgres + Deno-pohjaiset edge-funktiot `supabase/functions/`). Pääpeli (`useProvinceGameState.ts`) on täysin client-puolen tilaa — ei tilipalvelinta, ei moninpeliä (toistaiseksi).
- Pysyvä data (tallennukset, saavutukset, tilastot) elää `localStorage`:ssa `src/lib/secureStorage.ts`-kääreen kautta (tarkistussumma + versio + validointi). Ks. `src/lib/securityLog.ts` (paikallinen väärinkäytösloki).
- Build/tarkistus: `npx tsc --noEmit -p tsconfig.app.json` ja `npx vite build` — aja molemmat merkittävien muutosten jälkeen.

## OWASP Top 10:2025 — sovellettavuus tähän projektiin

| # | Kategoria | Koskee meitä? | Konkreettinen sääntö agentille |
|---|---|---|---|
| A01 | Broken Access Control | **Kyllä** (Supabase RLS) | Uusi taulu/storage-policy EI SAA olla `USING (true)`/`WITH CHECK (true)` ilman `TO service_role`/käyttäjä-id-rajausta — `CREATE POLICY` ilman `TO`-lauseketta koskee PUBLICia (ks. korjattu bugi: `20260919130000_restrict_card_images_storage_insert.sql`). Edge-funktio ei saa luottaa clientin lähettämään id:hen valtuutuksessa. |
| A02 | Security Misconfiguration | **Kyllä** | Älä poista/heikennä RLS:ää olemassa olevista tauluista. Uudet edge-funktiot: CORS `*` vain julkisille, ei-arkaluontoisille endpointeille (nykyinen käytäntö). Älä commitoi oikeita AdMob/production-tunnuksia placeholderien tilalle testauksen ajaksi. `.env` on gitignoressa jatkossa — älä lisää oikeita salaisuuksia sinne uudelleen. |
| A03 | Software Supply Chain Failures | **Kyllä** | Uusi npm-riippuvuus: tarkista ylläpito/tunnettuus, aja `npm audit` mielessä pitäen. `lovable-tagger` on jo scopattu `mode === 'development'`iin (`vite.config.ts`) — pidä kaikki dev-only-työkalut poissa production-buildista samalla tavalla. GitHub Actions -workflow’t käyttävät virallisia `actions/*`-toimintoja versiotagilla — säilytä sama käytäntö uusissa workflow’issa. |
| A04 | Cryptographic Failures | **Osittain** | Ei tilijärjestelmää → ei salasanoja säilytettävänä tänään. `secureStorage.ts`:n checksum on **manipuloinnin tunnistus, ei kryptografinen suoja** — älä koskaan kuvaile sitä "salaukseksi" tai luota siihen kilpailullisessa/moninpeli-yhteydessä. Jos tilit joskus lisätään: käytä Supabase Authia, älä koskaan omaa salasanahajautusta. |
| A05 | Injection | **Kyllä** (edge-funktiot) | Edge-funktioissa: käytä aina Supabase-clientin query buildereita/parametrisoituja kutsuja, ei koskaan SQL-merkkijonojen yhdistelyä käyttäjän syötteestä. Validoi `req.json()`-rungot tyypeittäin ennen käyttöä (kuten `generate-card-image/index.ts` jo tekee). Reactissa: älä käytä `dangerouslySetInnerHTML` käyttäjän/AI:n tuottamalla tekstillä. |
| A06 | Insecure Design | **Kyllä** | Peruslähtökohta: **client ei ole koskaan luotettu minkään arvon (kulta, saavutukset, voitot) suhteen**. Uudet ominaisuudet jotka jakavat palkintoja/valuuttaa: kulkekoot validoitujen apufunktioiden kautta (ks. `useAchievementTracking.ts`:n `clampDelta`/`checkAndUnlock`-malli). Jos moninpeli joskus tulee: suunnittele validointi palvelinpuolelle alusta asti, älä lisää sitä jälkikäteen. |
| A07 | Authentication Failures | **Ei vielä** (ei tilejä) | `supabase.auth` on konfiguroitu mutta käyttämättä. Jos tilit lisätään: käytä Supabase Authin valmiita virtoja (sähköpostivarmennus, istunnon vanheneminen, rate limit), ei omaa kirjautumislogiikkaa, varaudu 2FA:hun arkkitehtuurissa. |
| A08 | Software or Data Integrity Failures | **Kyllä — ydinalue** | Kaikki uusi pelidata joka vaikuttaa pelin/saavutusten eheyteen (tallennukset, tilastot, avaukset, asetukset jotka vaikuttavat pelimekaniikkaan) **PITÄÄ** kulkea `src/lib/secureStorage.ts`:n (`readSecure`/`writeSecure`) kautta — ei koskaan suoraa `localStorage.setItem/getItem` tälläiselle datalle. Saavutukset/tilastot: hylkää manipuloitu/virheellinen data turvallisiin oletuksiin (tiukka), pelitallennukset: loggaa mutta salli lataus (pelaajan oma yksinpeli-tallennus). Ks. `useAchievementTracking.ts`:n turn-jump-suoja tallennuksen lataus -exploitia vastaan. |
| A09 | Security Logging & Alerting Failures | **Kyllä** | Käytä `src/lib/securityLog.ts`:n `logSecurityEvent(...)`-funktiota uusille manipulointi/anomalia-havainnoille. Ei koskaan PII:tä tai salaisuuksia lokiin. Pidä loki kokorajoitettuna (ring buffer, jo toteutettu). |
| A10 | Mishandling of Exceptional Conditions | **Kyllä** | Korruptoitunut `localStorage`-data ei saa kaataa sovellusta — validoi aina ja palaa turvalliseen oletukseen (malli: `playerStats.ts`, `useSaveManager.ts`). Älä "fail open" — virhetilanteen oletusarvo on aina "ei mitään avattu / ei palkintoa", ei koskaan "kaikki sallittu". Edge-funktiot palauttavat aina jäsennellyn JSON-virheen, eivät kaadu paljastaen pinon jäljitystä (stack trace) clientille. |

## Muuta huomioitavaa

- Peli on **yksinpeli AI:ta vastaan** — täydellinen huijaussuoja vaatisi auktoritatiivisen palvelimen, mikä on tarkoituksella jätetty tekemättä (ei ylisuunnittelua soolokehittäjälle). Ks. tarkempi analyysi ja päätökset repo-muistista (`/memories/repo/bookish-creations-hub.md`, "Security hardening pass").
- Älä luo uusia `.md`-dokumentaatiotiedostoja muutosten selittämiseksi ilman erillistä pyyntöä — päivitä tätä tiedostoa vain kun turvallisuuskäytännöt oikeasti muuttuvat.
