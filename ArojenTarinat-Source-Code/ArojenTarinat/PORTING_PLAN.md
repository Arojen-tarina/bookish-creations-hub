# Arojen Tarinat: Native Android Port Plan

This plan covers moving Arojen Tarinat from a Capacitor WebView app (React + TypeScript) to a native Kotlin + Jetpack Compose app.

- **Source of truth:** `bookish-creations-hub` (React + TypeScript). The goal is feature parity, with a redesigned UI.
- **Play listing:** `fi.bookish.creations.arojen.tarinat`. The live WebView build is versionCode 19. The native app uses versionCode **30** (set 2026-10-20 at the user's request, to leave room for any build the owner may still ship from the old project).
- **Stack:** Kotlin, Jetpack Compose, ViewModel + StateFlow, kotlinx.serialization, Media3, Google Mobile Ads + UMP, OkHttp (Supabase REST).

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 0: Foundation
- [x] 0.1 Gradle setup: dependencies, serialization plugin, BuildConfig, versionCode 20, landscape orientation, debug builds use the `.dev` suffix so they install next to the Play Store build
- [x] 0.2 Assets: board, menu background, 30 sprites, 170 card images (`assets/cards`), 7 music tracks; app icon from the old build
- [x] 0.3 Theme: dark war-room palette with gold trim, Cinzel headings, `GameButton`, `OrnamentDivider`, `BoardBackdrop`
- [x] 0.4 Splash screen: system splash (compass emblem) + branded in-app loading screen
- [x] 0.5 App skeleton: navigation (Splash, Menu, Faction Select, Game, Load, Achievements, Codex, Rulebook, Settings), immersive full-screen; main menu designed
- [x] 0.6 Verified on a Pixel 7a (Android 17): splash, menu, all 7 menu buttons and back navigation work with no crashes; cold start 620 ms

## Phase 1: Game engine (pure Kotlin, no Android dependencies)
Package `game/`: `model/` (serializable state), `data/` (static tables; provinces and cards are generated from the TypeScript source), `engine/` (pure rule functions with an injectable `GameRandom`).
- [x] 1.1 Models: Province, Faction, Army, Treaty, Relation, Card, GameState, BattleReport, TurnLogEntry (structured, so it can be localized)
- [x] 1.2 Static data: factions, terrain, trade goods, buildings, victory targets, 221 provinces + adjacency (17 Silk Road hubs)
- [x] 1.3 Cards: 85 active cards with parsed effects, deck/draw/shuffle
- [x] 1.4 Game setup: factions, province balancing, starting armies, deck
- [x] 1.5 Economy: income, resource collection, Silk Road chains, food upkeep
- [x] 1.6 Military: movement rules, combat, surrender, merge, recruit, forts, siege, repair
- [x] 1.7 Buildings, with `buildBlocker` / `recruitBlocker` / `repairFortBlocker` reasons for the UI
- [x] 1.8 Card play and active effects
- [x] 1.9 Diplomacy: treaties, war, alliances
- [x] 1.10 AI turn logic + endTurn
- [x] 1.11 Victory conditions (military, economic, tech, diplomatic, cultural) + defeat
- [x] 1.12 Tests:
  - `EngineParityTest` replays 12 seeded scripted games (4 factions x 3 seeds/difficulties). Every one of the 652 steps is byte-identical to the original TypeScript engine.
  - `GameRulesTest` covers static data, setup balance, each victory type, defeat, the Chief rule, treaties, building caps, save round trip, and 40 random games checked against invariants.

## Known issues inherited from the original rules
The port reproduces these on purpose, so behaviour matches the published game exactly. Each one should be reviewed in Phase 10.

**Clear bugs**
1. The player's defence-card bonus reduces the damage the player *deals* when attacking, and never protects the player when the AI attacks.
2. Bonus totals reset to 0 at every turn start, so multi-turn and permanent card bonuses (e.g. "+2 defence for 3 turns") only work on the turn they are played.
3. Any army move, even a peaceful one, consumes the attack bonus.
4. A surprise war on one rival declares war on *all* rivals and breaks every treaty the player holds.
5. AI "build market" spends 25 gold but no market is built.
6. AI "advance" moves walk into enemy provinces without a battle.
7. If the player's Chief dies in the player's own attack, there is no penalty; only deaths during the AI turn count.
8. Breaking a treaty can push the relation below -100, and duplicate treaties can stack.

**Questionable rules**
9. Permanent tech cards only count toward the tech victory; they never affect combat.
10. A formal war resets the relation to -90 and adds +30 threat every turn it lasts.
11. An AI win always captures the province (forts ignored), while the player must break the walls first.
12. Infantry recruits get up to 2 free cavalry without spending horses.
13. Siege-only armies are removed, because an army needs cavalry + infantry > 0.
14. Morale has no effect in combat (also listed in the developer's own TODO).

**Balance and content**
15. AI realms often win an economic victory around turn 26-28, and a diplomatic (influence) victory is possible by turn ~24.
16. 10 cards (res-041 to res-050) have no artwork; the UI needs a fallback card face.
17. The rulebook is out of date in all 14 languages: § 3.2-3.3 give 30 provinces, 500 gold and a 3-turn streak, but the game uses 130, 2000 and 5. Chapter VI still describes five turn phases, which the original game itself no longer has (it is always "attack" phase).
18. The `moose-chat` Supabase function's system prompt also describes the five phases. It runs on the client's server, so only the client can change it.

**Fixed in the port (the original behaves differently)**
- Moose guide: two-letter words matched inside keywords ("tell me a joke" got the treaty answer, "me" in "agreement"), and "Who is Handgai?" got the cards answer ("hand" in "handgai"). A whole-word match now wins.
- Moose guide: answers about phases, the web top bar, the desktop/mobile switch and session-only saves are replaced with native answers.

## Phase 2: Map (Compose Canvas)
Package `ui/game/map/`: `GameMap` (one Canvas, screen-space drawing, culling), `MapCamera`, `MapAssets` (decoded off the main thread), `MapLayout`, `MapGlyphs` (vector crown, shield, horseshoe and sword: no emoji).
- [x] 2.1 Board art with the original coordinate mapping, province tokens in owner colours, sheen, vignette
- [x] 2.2 Pinch-zoom about the fingers, pan, clamped to the art; zoom in/out/fit buttons; taps with generous hit areas
- [x] 2.3 Army stacks (leader/cavalry/infantry art per realm style, unit pill, movement dot, stack count), faction forts/camps/bridges, resources, capital crown, garrison shield, Silk Road dots, name tabs when zoomed
- [x] 2.4 Selection: tap a stack to select (tap again to cycle or deselect); green rings = move, red = attack; marches can chain while movement remains; tapping a rival stack targets its province
- [x] 2.5 `GameViewModel` (end turn runs off the main thread) and an interim game screen + realm picker; Phase 3/4 replace both
- [x] Verified on a Pixel 7a: start game, zoom/pan, select, move, end turn (AI recruits and marches, supply attrition applied)

Design changes so far: Rus is blue instead of grey (from the developer's own TODO list); name labels sit on a tab directly under their token instead of floating 4.6 units below it.

## Phase 3: In-game UI (redesign)
Packages `ui/game/hud`, `panels`, `cards`, `overlays`. All icons are vector (`GameIcons`) or the game's sprites; no emoji anywhere.

Generated text (from the original TypeScript via `tools/parity`):
- 338 UI strings x 14 languages → `res/values*/strings_ui.xml`
- 85 card texts x 14 languages → `assets/i18n/cards/<lang>.json`
- Strings new to the native app are hand-written in en + fi for now; Phase 9 translates them.

- [x] 3.1 HUD top bar: realm, turn/year, 7 resources (count-up animation, tap for name + per-turn income), Goals and Diplomacy buttons, End turn
- [x] 3.2 Side drawer with 4 tabs. The map slides clear of the drawer, and a tapped province is kept in view.
  - Province tab: owner, terrain, stats, fort durability, trade good, Silk Road, unrest
  - Armies list: select, merge
  - Recruit infantry/cavalry and repair fort, each with the reason when blocked
  - Build list: cost chips, level and wonder badges, built state
- [x] 3.3 Card hand: collapsible tray, card faces with art, rarity gems, short effect; a fallback face for the 10 cards without art; detail dialog with full text and Play
- [x] 3.4 Diplomacy: rival cards with ruler, relation bar, treaties; expanded view with trust/threat, propose and break options; one-proposal-per-turn rule enforced
- [x] 3.5 Battle dialog: clash, rolling dice, power totals, animated losses, outcome (captured / walls hold / repelled); tap to skip
- [x] 3.6 Goals tab (5 victory bars, realm race with gold streak, active bonuses, technologies, statistics) and Chronicle tab (localized AI turn log)
- [x] 3.7 Game over dialog (victory text per win type, defeat by rival or by collapse; Play again / Main menu)
- [x] 3.8 Pause menu (Resume, Rulebook, Settings, Exit with confirmation); back button closes card → drawer → selection → opens pause
- [x] 3.9 Feedback: localized message toasts (built, recruited, card played, treaty accepted/rejected...), income summary each turn, floating gains, land flash, no-loss streak badge, milestone pop-ups, AI-turn overlay
- [x] 3.10 Camera opens on the player's capital below the HUD
- [x] RTL: layouts mirror in Arabic/Urdu. Signed numbers and ratios are wrapped in LTR isolates, so "+52" and "16 / 130" never flip. Every text style uses content direction, so English or numeric text inside an RTL layout reads correctly. The menu gradient and brand title follow the menu side. Verified in Urdu on the device.
- Verified on the Pixel 7a over 8 turns: build, recruit gating, card play, treaty rejection, march, surrender, a battle against a fortified province, pause/exit, Urdu HUD. The game-over dialog is verified by build only; it was not reached in play.

## Phase 4: Menus and meta screens
- [x] 4.1 Main menu: Continue (shows turn and realm of the latest save), New, Load, Achievements, Settings, World chronicle, Rulebook, Moose guide
- [x] 4.2 Faction select: 2x2 realm tiles with leader art, dossier (strengths, special ability, treasury), difficulty, How to play dialog
- [x] 4.3 Settings: language (phone default + 14, per-app locale, switches instantly), music volume and mute (stored for Phase 6), analytics consent (stored for Phase 8)
- [x] 4.4 Save/Load: autosave (every turn, on leaving the app, removed at game over) + 5 slots, save dialog with overwrite confirm, load screen with delete confirm
- [x] 4.5 Achievements: 84 achievements (generated catalog), levels and ranks, category filter, progress bars, unlock banner in game; existing players keep their unlocks
- [x] 4.6 World chronicle and Rulebook (`ui/book`): chapter list + chapter page, previous/next, cards, timeline, tables, quotes
  - Generated from the original pages by `tools/parity/dump-books.ts` into `assets/i18n/{codex,rulebook}/<lang>.json`
  - Finnish gets the full chronicle (20 chapters); other languages the English summary and its translations (19 chapters), as in the original
  - Rulebook search filters chapters by their whole text, highlights matches and opens a chapter at its first match
  - Card pictures became vector icons; Arabic and Urdu paragraphs that open with a Latin name stay right to left
- [x] 4.7 Moose guide (`moose/`, `ui/moose`): gold moose button on the main menu and in the game, chat dialog with topic chips
  - Local answers generated from the original `mooseFaq.ts` / `mooseKnowledge.ts` (`dump-moose.ts`, en + fi); other languages and unknown questions go to the `moose-chat` Supabase function (needs the INTERNET permission, added now), with the local notes as fallback
  - Supabase URL and public key come from `gradle.properties` (`arojen.supabase.url` / `.key`); empty values turn the online part off
  - The conversation lasts for the app session; emoji are stripped from replies
- Verified on the Pixel 7a: codex (English and Finnish, every block type), rulebook search and tables, Urdu right-to-left rulebook and tables, Moose chips, a typed local answer, a remote answer, the keyboard closing after sending.
- Tests: `ContentAssetsTest` (both books in 14 languages decode, same chapters, no emoji; rulebook search; Moose matching in en/fi; every topic chip has an answer). 34 unit tests pass.

## Phase 5: Persistence
- [x] 5.1 Save games: JSON files under `files/saves` (autosave + 5 slots), each with a small meta file; atomic writes (temp file + rename)
  - Versioned: `SaveMeta.version` records `SaveRepository.FORMAT_VERSION`. Saves from a newer app version are refused (bump the number and migrate in `loadNow` when `GameState` changes incompatibly).
  - Validated: a decoded game must be playable (`isPlayable`: the player's realm exists, unique provinces, every capital, owner, neighbour, army and treaty points at something real). A meta file without its game is not listed.
  - A save that cannot be read is dropped from the list. The menu says "This save could not be read" and Continue falls back to the newest other save.
- [x] 5.2 Achievements: the `achievements_prefs` / `unlocked_achievements` SharedPreferences of the old native plugin are reused, so existing players keep their unlocks
- [x] 5.3 Lifetime stats in `files/player_stats.json` (field names match the original); settings in DataStore
- [x] 5.4 Android backup (`data_extraction_rules.xml`, `backup_rules.xml`): saves, stats, settings and achievements follow the player to a new phone or a reinstall; WebView and ad caches do not
- [x] 5.5 One-time import for players updating from the WebView version (`LegacyWebImport`). A hidden WebView on the old origin (`https://localhost`) runs `assets/legacy/read-web-storage.js` against the old localStorage.
  - Carried over: lifetime stats and web-store unlocks (only when the old checksums match, as the original required), language (if the player had picked one other than the phone's), music volume and mute, analytics consent, client id, first-open date and active days (for Phase 8)
  - Not carried over: campaigns in progress. The old saves describe the original web model, so players start a new campaign after the update; achievements and stats stay.
  - Runs only when the old WebView data folder exists, once (`legacy_import_done`); fresh installs never start a WebView
- Verified on the Pixel 7a: WebView reader instrumented tests (old data, tampered checksum, empty storage) pass; a seeded old-app language opened the app in Finnish on first launch and the import did not repeat; a damaged autosave showed the message and Continue opened the manual save instead.
- Tests: `SaveRepositoryTest` (newer version refused, broken references refused, meta without a game, 60 played turns stay playable), `LegacyWebImportTest` (parsing, volume scaling, unlock merge), `LegacyWebReaderTest` (on device). 41 unit tests pass.

## Phase 6: Audio
- [x] 6.1 Music (`audio/GameMusic.kt`, Media3 ExoPlayer): the six tracks in turn on repeat; the combat track loops from the player's first battle of a turn until the turn ends, then the playlist resumes where it stopped (as in the original). Fades between tracks.
  - Volume and mute from Settings apply live (the slider is heard while dragging); a music button next to Resume in the pause menu, as the original HUD had
  - Quiet in the background (ProcessLifecycleOwner, so a language switch does not interrupt it), during calls (audio focus), when headphones come out, and when the player was already listening to their own music as the game came to the front
  - The original's synthesized click sounds were never wired to anything, so there are no sound effects
- Verified on the Pixel 7a through the audio service: the player runs (USAGE_GAME / CONTENT_TYPE_MUSIC) in the menu and the game, pauses on Home and resumes on return, and the pause-menu button mutes and unmutes it. The combat switch was not heard on the device: no battle could be reached on turn 1.

## Phase 7: Ads (AdMob)
Client's AdMob IDs (verified app, received 2026-10-19). Release builds use these; debug builds use Google's test IDs.

| Unit | ID |
|---|---|
| App ID | `ca-app-pub-1848284154496261~2996479757` |
| App open | `ca-app-pub-1848284154496261/8145911802` |
| Banner ("Banneri") | `ca-app-pub-1848284154496261/3145662729` |
| Banner ("Banneri", 2nd) | `ca-app-pub-1848284154496261/7765514723` |
| Interstitial | `ca-app-pub-1848284154496261/2851107119` |
| Rewarded interstitial (amount 1, "Reward") | `ca-app-pub-1848284154496261/2111287813` |

AdMob-side frequency capping is "No cap", so the app enforces its own caps.

Goal: good revenue without hurting the game. Code in `ads/` (`Ads`, `AdPacing`, `AdUnits`, `AdBanner`) and `play/`.

- [x] 7.1 UMP consent (Google's form for GDPR and US states) on every launch, before the SDK starts; "Advert privacy choices" in Settings where the region requires it
- [x] 7.2 Anchored adaptive banners that take no room until an ad loads: main menu (under the art, away from the buttons) and both books ("Banneri" #1), the in-game side drawer ("Banneri" #2). Never over the map.
- [x] 7.3 Interstitial at natural breaks only (`AdPacing`): End turn on every third turn from turn 3 (the rival realms move behind the ad, so it costs no waiting), a lost campaign, exit to the menu. Never in the first minute of a session, never within 2.5 minutes of any other full-screen ad. The turn's income summary waits until the ad is closed.
- [x] 7.4 Silk Road tribute (rewarded interstitial unit, `RewardedInterstitialAd`): a gold chest above the map controls while a tribute is available this turn and an ad is loaded. The dialog is the format's required intro: the player picks +gold (this turn's tax income, min 40) or a card, or declines. Paid after the ad closes, once per turn (`GameState.tributeTurn`, kept in saves).
- [x] 7.5 App-open ad on a cold start for returning players (third launch on), at most every 4 hours, only if it loads while the game is loading (never later in the session)
- [x] 7.6 Test IDs in debug builds (sample app ID via manifest placeholder), real IDs in release builds
- [x] 7.7 Play in-app update (flexible: downloads while playing, the menu offers "Restart"; offered at most every 3 days) and in-app review (after a victory, or for a player back on 3 days with 20 turns; at most every 120 days; never after a defeat)
- Music pauses while any full-screen ad plays and resumes after.
- Verified on the Pixel 7a with Google's test ads: menu banner, drawer banner, tribute dialog, rewarded ad (music paused during it), gold paid after it closed (255 to 310, which also triggered the 300-gold milestone), chest hidden for the rest of the turn. No interstitial on turns 1 and 2; the interstitial at the end of turn 3 covered the rival moves (turn 4 was ready when it closed), the income summary appeared after it, the music paused and resumed, and the chest came back for the new turn. Consent: the UMP request runs (Pakistan: no form required). Not testable outside Play: in-app update and review (they need a Play install).
- Tests: `AdPacingTest` (first minute, every third turn, 2.5-minute gap, app-open rules, review eligibility), `TributeTest` (gold, card with reshuffle, once per turn, not after game over).
- Handover note: in Play Console the client must answer "yes, the app uses an advertising ID" and declare ads in the Data safety form.

## Phase 8: Supabase
The client's "no events from the Play Store app" (investigated 2026-10-19 with his live data, `tools/supabase/*.sql`):
- The server is fine: the live table has the `platform` column and accepts inserts with the anon key.
- The old Play Store app does send events. Rows with `platform = android` and `app_version = 0.1.0` number 319, from 32 players since 2026-10-14. Before that date there was no `platform` column, so every row (3133, from 43 players since 2026-09-22) is "unknown" and phone and web traffic could not be told apart. The first web row (10:16) and the first Android row (10:30) arrived on 14 October, right after the column was added.
- Data quality (`analytics_health.sql`), fixed in the native app:
  - The old app sent the phone's clock as `created_at`. 41 of its 319 Android rows (13%) are dated in the future (up to 7 November), against 0 on the web; they skew the daily and retention views. The native client lets the database set `created_at`.
  - Session ends are recorded well everywhere (Android 78 of 84, web 187 of 194), so `pagehide` was not a problem.
  - The consent banner (`z-[70]`) sat under the startup layers (`z-[9999]`), which may have kept the opt-in rate low (32 Android players opted in). The native app asks in a dialog.

- [x] 8.1 Native analytics client (`analytics/`): the original's events with the same names and payload keys, so the client's Supabase views (DAU, retention cohorts, session lengths, battle balance, campaign outcomes, economy health, feature usage, achievement unlock rates) keep working. Rows carry `platform = "android"`; debug builds tag `app_version` with "-dev".
  - Consent is a hard gate (nothing recorded before "Allow"); withdrawing it deletes the local buffer and active days
  - File buffer (max 300), batches of 25 every 20 s while open and when the app goes to the background; a refused batch (4xx) is dropped, a network failure is retried
  - The anonymous client id, first-open day and active days carry over from the WebView version (Phase 5 import), so updated players are not counted as new
  - Events come from the same state comparison the original used (`Events.fromStateChange`), plus battles, saves and loads, game start and restart, onboarding steps, menu buttons, settings and achievements
- [x] 8.2 First-run consent: a real dialog in the original's words (all 14 languages), asked once on the main menu after Google's advert consent form has closed; can be changed in Settings
- [x] 8.3 Moose chat edge function call (done in Phase 4)
- Verified on the Pixel 7a against the client's live Supabase: consent dialog shown, "Allow", then `session_start` and two `menu_interaction` rows SENT (HTTP 2xx), and `session_end` SENT on Home, with the buffer emptied. These test rows carry app_version "2.0.0-dev".
- Tests: `AnalyticsEventsTest` (recruits, buildings, cards, treaties and wars, progression snapshot and onboarding, game over, every event name allowed by the table, row column names). 55 unit tests pass.

## Phase 9: Localization
- [x] 9.1 Generate `strings.xml` for 14 languages from the TypeScript dictionaries
  - `strings_ui.xml` (333 strings per language) is generated from the original dictionaries by `tools/parity/regenerate.sh`; names written by hand in `values/strings.xml` are skipped.
  - The 200 strings new to the native app (`strings.xml`) are translated by hand into the 12 languages beyond en + fi.
  - The 212 achievement strings (`strings_achievements.xml`, generated from the original catalog in English and Finnish only) are translated by hand into the same 12 languages. Hidden achievement names stay `???` as in the original.
  - Arabic and Urdu: lines that start with a number or name carry a right-to-left mark so the sentence still reads right to left. Numbers inside RTL text are isolated with `ltr()` in `ui/components/Numbers.kt`.
  - Indonesian lives in `values-in` (Android's old code) and is listed as `id` in the locale config.
  - `tools/check_translations.py` checks every language against English: missing and extra names, placeholders, XML and unescaped apostrophes. All 12 pass.
- [x] 9.2 Cards, codex and rulebook text per language (JSON in `assets/i18n/{cards,codex,rulebook,moose}`, 14 languages)
- Fixed on the way, found by lint: `java.time` needs Android 8, so the app would crash on Android 7 (minSdk 24). Core library desugaring is now on (`desugar_jdk_libs` 2.1.5).
- Lint: 0 errors (224 before). The remaining warnings are polish for Phase 10: launcher icon shape and monochrome layer, plural strings ("%d moves"), unused strings from the generated `strings_ui.xml`, and four small Compose hints.
- Verified: the APK carries all 14 languages for every string (aapt dump); build, 55 unit tests and lint pass.
- Verified on the Pixel 7a (2026-10-20): in Urdu, the main menu, settings, achievements, game HUD, pause menu and tribute dialog are all translated and laid out right to left, while the map stays unmirrored. In German, long words fit their buttons, and switching language mid-game keeps the open game and dialog.

## Phase 10: Polish and QA
- [x] 10.1 Phone and tablet layouts, back-button handling, autosave on pause
  - Tablets (2026-10-20, checked on the Pixel with a simulated 1280 x 800 dp screen): Android 16+ ignores orientation locks on screens of 600 dp and wider, so the game opened in portrait there and the menu and faction screens looked stretched. Games are exempt, so the manifest now declares `android:appCategory="game"` and the landscape lock holds on tablets and open foldables too (the API 37 target rules out the other opt-out). Landscape tablet layouts: game, drawer, pause, achievements and rulebook all fit.
  - "First steps" (end your first turn) unlocked the moment a campaign began, as in the original: the stats counted the turn number. They now count turns completed.
  - Done 2026-10-19: coming back to the game from the rulebook or settings keeps the map's zoom and position (`MapCameraState.Saver`) and no longer replays the income summary.
  - Done 2026-10-20: "New game" no longer silently replaces a running campaign (the original did). When an autosave exists, starting asks first and names it ("Turn 4 · Song Dynasty"), with Cancel as the way out.
  - Done 2026-10-20: leaving to the main menu saves first, so Continue picks up exactly there. The leave prompt now says so instead of the original's "progress since your last save will be lost".
  - Done 2026-10-20: the faction screen showed "Starting treasury" with its amounts cut off below the fold on a phone. They now share one line with the label, pinned above the difficulty.
- [x] 10.x "Second chance" rewarded placement (done 2026-10-20): on a defeat, the game-over dialog offers to watch an ad and replay the lost turn from its start (`game/engine/SecondChance.kt`; the state at the start of each turn is kept in memory). It uses the same rewarded unit, only while an ad is ready, at most once per campaign (`GameState.secondChanceUsed`, saved). The defeat counts in the stats only once it stands, so a replay does not count a game twice.
  - Verified on the Pixel 7a with a doomed copy of the autosave (the original was restored afterwards): defeat, the offer, Google's test rewarded ad, "Reward granted", the game back at the start of turn 1 with a toast. A second defeat offers nothing, and leaving showed no interstitial (inside the 150 s gap after the rewarded ad).
  - Tests: `SecondChanceTest`. `ExampleUnitTest` removed. 56 unit tests pass.
- [x] 10.x Signing (done 2026-10-20). Keys stay outside the repository, each described by a git-ignored properties file in the project root (storeFile, storePassword, keyAlias, keyPassword):
  - `keystore.properties`: the owner's Play upload key, used by `release`. Without it the release build is unsigned, so the client signs with his own key on his own machine.
  - `keystore-preview.properties`: our own key (`CN=Arojen Tarinat Preview`, kept with a backup in `../ArojenTarinat-signing/`), used by the `preview` build type.
  - `preview` = release speed (R8, not debuggable), id `fi.bookish.creations.arojen.tarinat.preview` and label "Arojen Preview" so it installs next to the Play Store app, version "2.0.0-preview", Google's sample ads (`BuildConfig.TEST_ADS`; the client tapping his own real ads would count as invalid traffic). Analytics rows say app_version "2.0.0-preview" (debug: "2.0.0-dev").
  - Build: `gradlew assemblePreview` gives `app/build/outputs/apk/preview/app-preview.apk`. On this 8 GB laptop build one R8 variant at a time.
- [x] 10.x Launcher icon (done 2026-10-20, chosen by the user): the gold compass medallion (the splash emblem) over the steppe heart of the board map. Adaptive icon with a vector foreground, a map background layer and a monochrome layer for Android 13+ themed icons; legacy square and round PNGs for Android 7; the 512 px Play Store icon in `store/icon-512.png`. Generated by `tools/icon/make_icon.py` (headless Chrome renders the bitmaps).
- [x] 10.x Lint polish (done 2026-10-20):
  - Plurals: "%d moves left" and the save slot's province count (`army_moves_left`, `save_meta_provinces`) use each language's plural forms (Russian 4, Arabic 6). `tools/check_translations.py` checks them.
  - Removed the unused `build_cost_artisans`.
  - Compose: `SectionTitle`/`ResourceIcon` parameters, `mutableLongStateOf`, `LocalResources`, KTX `SharedPreferences.edit`.
  - Banners use `getLargeAnchoredAdaptiveBannerAdSize`, Google's current replacement for the deprecated size call.
  - `app/lint.xml` leaves the generated `strings_ui.xml` alone (unused entries and the original's "..." are kept for parity) and the `in`/`id` Indonesian false positive.
  - Removed 20 hand-written strings that no screen used, in all 14 languages.
- [x] 10.x Achievement unlocks (reported by the user 2026-10-20): the unlock banner sat in the top-right corner, on top of the open drawer's close button. It is now a toast like the game's other messages (`AchievementToast`), in the map's top-centre column, so it never covers the drawer. Its timer was also broken: the effect was keyed on the toast being shown, so showing it cancelled the countdown and it never went away.
- [x] 10.2 Performance: map rendering, AI turns off the main thread
  - Measured on the Pixel 7a with the preview (R8) build, panning and zooming the map: 643 frames, 0 janky, 99th percentile 14 ms, no slow UI-thread frames. The AI turn runs on a background thread (`Dispatchers.Default`).
- [x] 10.3 R8/ProGuard rules, release build test (done 2026-10-20, with the `preview` build, which is the release build with test ads and our key)
  - Found on the phone: the first R8 build crashed on start ("Failed to create an instance of androidx.work.impl.WorkDatabase"). Room 2.2.5 inside Google Mobile Ads keeps its databases without their constructors, and R8 full mode removed it. Fixed by `app/src/main/keepRules/room.keep` (AGP 9 reads `.keep` files from that folder).
  - Verified in the R8 build on a fresh install: consent dialog, new game, the card hand (JSON and art), End turn and the AI, the achievement toast queue (two at the start, "First steps" after the first End turn, each gone after 3.5 s), save to a slot, leave with autosave, load, the Moose guide (offline notes and the online Supabase answer), test banners and the app-open ad.

## Phase 11: Release and delivery
- [x] 11.1 Signing via `keystore.properties` (owner's upload key), signed AAB (done 2026-10-20)
  - Simulated the owner's build with a separate throwaway upload key: `bundleRelease` gave a signed .aab (owner certificate, appCategory game, real AdMob app ID, TEST_ADS false, not debuggable). All native libraries are 16 KB page aligned.
  - versionCode 30 (the live listing is 19).
  - AdMob verified in the release build with the real unit IDs on this phone registered as an AdMob test device (temporary code, removed and checked afterwards): the menu banner, game banner, interstitial, rewarded interstitial and app-open units all loaded and showed Google's test creatives.
- [x] 11.2 ASO (done 2026-10-20): market analysis (Mongol and grand-strategy titles on Play are mostly online or multiplayer; this is offline single-player), titles with the most-searched niche term ("Genghis Khan"; Finnish "Strategiapeli"), short and full descriptions within Play's metadata policy, in 14 languages, plus release notes in 14 languages and a keyword and A/B testing plan.
- [x] 11.3 Store graphics (done 2026-10-20): 8 screenshots per language (en, fi), 1920 x 1080, with a caption band of at most 20%, made from real captures of a mid-game campaign (`StoreScreenshotStateGen`, debug-only `storeScreenshots` launch switch, `tools/store/make_store_graphics.py`); feature graphic 1024 x 500 (en, fi); 512 px icon (32-bit).
  - Found while making them: the HUD turn label was cut off with three-digit numbers, long Finnish card names broke mid-word and overlapped the rarity gems. Fixed (two-line turn and year, `WordFitText`).
- [x] 11.4 Handover (done 2026-10-20): `BUILD.md` (owner's build guide); the store package with listings, ASO, release notes, graphics, Play Console form answers (Data safety, ads, advertising ID, content rating, target audience), privacy policy (en, fi, web page), the analytics report, a test report and the preview APK.
- Responsive check (2026-10-20): small phone (640 x 360 dp) needed a compact top bar (smaller resource chips, icon-only End turn under 700 dp), map controls stacked with the Moose in one column, a wrapping income summary and shrinking realm names. Tablet in landscape and portrait-shaped displays: the landscape lock holds.
