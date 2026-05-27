/**
* If adding or removing cards, update this along with the data in src/data/gameCards.ts and maybe the card images in public/cards/
* This file ISNT a data file containing the cards, but it contains the logic for parsing card effects and applying them in the game
 */
import { GameCard, strategyCards, diplomacyCards, technologyCards, resourceCards } from '@/data/gameCards';

export interface CardEffect {
  type: 'attack_bonus' | 'defense_bonus' | 'movement_bonus' | 'gold' | 'food' | 'horses' | 'artisans' | 'draw_cards' | 'recruit_free' | 'permanent_attack' | 'permanent_defense' | 'terrain_ignore' | 'morale';
  value: number;
  duration: number; // 0 = instant, -1 = permanent, N = N turns
  description: string;
}

export interface PlayableCard extends GameCard {
  parsedEffect: CardEffect;
}

// Parse a card into a playable card with concrete effect based on its name/description
function parseCardEffect(card: GameCard): CardEffect {
  const id = card.id;
  
  // === STRATEGY CARDS ===
  // Sotilaalliset taktiikat
  if (id === 'str-001') return { type: 'attack_bonus', value: 3, duration: 0, description: 'Mongolivyöry: +3 hyökkäys' };
  if (id === 'str-002') return { type: 'attack_bonus', value: 2, duration: 0, description: 'Teeskennetty vetäytyminen: +2 seuraava hyökkäys' };
  if (id === 'str-003') return { type: 'attack_bonus', value: 2, duration: 0, description: 'Sivustaisku: ohita maastobonus' };
  if (id === 'str-004') return { type: 'attack_bonus', value: 2, duration: 0, description: 'Yöhyökkäys: +2 hyökkäys' };
  if (id === 'str-005') return { type: 'attack_bonus', value: 3, duration: 0, description: 'Saarrostus: vihollinen ei voi paeta' };
  if (id === 'str-006') return { type: 'attack_bonus', value: 1, duration: 0, description: 'Nuolisade: +1 per ratsuväki' };
  if (id === 'str-007') return { type: 'movement_bonus', value: 2, duration: 0, description: 'Ratsastava Tuuli: ratsuväki +2 liike' };
  if (id === 'str-008') return { type: 'attack_bonus', value: 4, duration: 0, description: 'Kaaoksen Taktikko: +4 hyökkäys' };
  if (id === 'str-009') return { type: 'attack_bonus', value: 2, duration: 0, description: 'Steppin Perintö: +2 kaikille' };
  if (id === 'str-010') return { type: 'defense_bonus', value: 2, duration: 0, description: 'Verivala: +2 puolustus, ei vetäytymistä' };
  if (id === 'str-011') return { type: 'attack_bonus', value: 2, duration: 0, description: 'Tulihurmio: tuhoa rakennus' };
  if (id === 'str-012') return { type: 'morale', value: -1, duration: 0, description: 'Sotahuuto: -1 vihollisen moraali' };
  if (id === 'str-013') return { type: 'attack_bonus', value: 1, duration: 0, description: 'Veteraanit: +1 kaikille taistelussa' };
  if (id === 'str-014') return { type: 'defense_bonus', value: 3, duration: 0, description: 'Vahvistettu Linja: +3 puolustus' };
  if (id === 'str-015') return { type: 'movement_bonus', value: 1, duration: 0, description: 'Nopea Ryhmittyminen: +1 liike' };
  if (id === 'str-016') return { type: 'attack_bonus', value: 3, duration: 0, description: 'Ratsuväen Shokki: +3 ensimmäinen isku' };
  if (id === 'str-017') return { type: 'defense_bonus', value: 2, duration: 0, description: 'Ansakuopat: +2 puolustus' };
  if (id === 'str-018') return { type: 'attack_bonus', value: 1, duration: 0, description: 'Varjosotilaat: tiedustelu +1' };
  if (id === 'str-019') return { type: 'attack_bonus', value: 3, duration: 0, description: 'Khaanin Käsky: +3 yhteishyökkäys' };
  if (id === 'str-020') return { type: 'attack_bonus', value: 5, duration: 0, description: 'Viimeinen Voima: +5 epätoivoinen hyökkäys' };
  
  // Puolustuskortit
  if (id === 'str-021') return { type: 'defense_bonus', value: 2, duration: 0, description: 'Muurien Vahvistus: +2 linnoitus' };
  if (id === 'str-022') return { type: 'defense_bonus', value: 2, duration: 2, description: 'Uhmakkuus: +2 puolustus 2 vuoroa' };
  if (id === 'str-023') return { type: 'movement_bonus', value: 2, duration: 0, description: 'Salakäytävät: evakuoi piirityksestä' };
  if (id === 'str-024') return { type: 'defense_bonus', value: 3, duration: 0, description: 'Kiehuvat Öljyt: +3 puolustus piiritystä vastaan' };
  if (id === 'str-025') return { type: 'defense_bonus', value: 2, duration: 0, description: 'Kaupungin Vartijat: +2 puolustus' };
  if (id === 'str-026') return { type: 'defense_bonus', value: 2, duration: 0, description: 'Skorpionikone: +2 puolustus' };
  if (id === 'str-027') return { type: 'defense_bonus', value: 2, duration: 0, description: 'Palomuurit: +2 puolustus' };
  if (id === 'str-028') return { type: 'food', value: 3, duration: 0, description: 'Ruokavarasto: +3 ruokaa' };
  if (id === 'str-029') return { type: 'defense_bonus', value: 1, duration: 0, description: 'Veteraanigaardit: +1 per päällikkö' };
  if (id === 'str-030') return { type: 'defense_bonus', value: 1, duration: 0, description: 'Hälytyskellot: ei yllätyksiä' };
  if (id === 'str-031') return { type: 'defense_bonus', value: 2, duration: 0, description: 'Puolustusliitto: +2 puolustus' };
  if (id === 'str-032') return { type: 'defense_bonus', value: 2, duration: 0, description: 'Taistelukokeneet: +2 omilla alueilla' };
  if (id === 'str-033') return { type: 'defense_bonus', value: 4, duration: 0, description: 'Kylmä Vastarinta: +4 talvipuolustus' };
  if (id === 'str-034') return { type: 'defense_bonus', value: 2, duration: 0, description: 'Armeijan Hajottaminen: +2 gerillapuolustus' };
  if (id === 'str-035') return { type: 'defense_bonus', value: 5, duration: 0, description: 'Viimeinen Muuri: +5 puolustus' };
  
  // Liikkuminen ja logistiikka
  if (id === 'str-036') return { type: 'movement_bonus', value: 1, duration: 0, description: 'Pakkomarssit: +1 liike kaikille' };
  if (id === 'str-037') return { type: 'terrain_ignore', value: 1, duration: 0, description: 'Silkkitien Opas: ohita maastoesteet' };
  if (id === 'str-038') return { type: 'gold', value: 2, duration: 0, description: 'Huoltojuna: +2 kultaa logistiikasta' };
  if (id === 'str-039') return { type: 'attack_bonus', value: 1, duration: 0, description: 'Vakoojat Edellä: +1 tiedustelu' };
  if (id === 'str-040') return { type: 'defense_bonus', value: 2, duration: 0, description: 'Strateginen Vetäytyminen: +2 puolustus' };
  if (id === 'str-041') return { type: 'movement_bonus', value: 2, duration: 0, description: 'Salamasota: +2 liike ja hyökkäys' };
  if (id === 'str-042') return { type: 'terrain_ignore', value: 1, duration: 0, description: 'Joenylitys: ohita jokirangaistus' };
  if (id === 'str-043') return { type: 'terrain_ignore', value: 1, duration: 0, description: 'Vuoristoreitit: ohita vuoristo' };
  if (id === 'str-044') return { type: 'movement_bonus', value: 2, duration: 0, description: 'Karavaanireitti: +2 liike Silkkitiellä' };
  if (id === 'str-045') return { type: 'movement_bonus', value: 1, duration: 0, description: 'Nomadien Vaellus: +1 liike taistelun jälkeen' };
  if (id === 'str-046') return { type: 'movement_bonus', value: 3, duration: 0, description: 'Hevosenvaihtoasemat: +3 liike yhdelle yksikölle' };
  if (id === 'str-047') return { type: 'movement_bonus', value: 1, duration: 0, description: 'Talvileiritys: ohita talven rajoitukset' };
  if (id === 'str-048') return { type: 'terrain_ignore', value: 1, duration: 0, description: 'Aavikkokaravaan: ohita aavikkohaitat' };
  if (id === 'str-049') return { type: 'movement_bonus', value: 2, duration: 0, description: 'Salainen Sotapolku: +2 näkymätön liike' };
  if (id === 'str-050') return { type: 'movement_bonus', value: 1, duration: 0, description: 'Joukkojen Kokoaminen: mobilisoi yksiköt' };
  
  // Historialliset tapahtumat
  if (id === 'str-051') return { type: 'attack_bonus', value: 2, duration: 0, description: 'Genghis Khanin Henki: +2 kaikille' };
  if (id === 'str-052') return { type: 'gold', value: 5, duration: 0, description: 'Bagdadin Ryöstö: +5 kultaa' };
  if (id === 'str-053') return { type: 'attack_bonus', value: 2, duration: 0, description: 'Jalka-ammunta: +2 jalkaväen hyökkäys' };
  if (id === 'str-054') return { type: 'attack_bonus', value: 4, duration: 0, description: 'Kiinalainen Ruuti: tuhoa linnoitus' };
  if (id === 'str-055') return { type: 'attack_bonus', value: 2, duration: 0, description: 'Subutain Neuvot: +2 strateginen etu' };
  if (id === 'str-056') return { type: 'draw_cards', value: 3, duration: 0, description: 'Kurultai-päätös: nosta 3 korttia' };
  if (id === 'str-057') return { type: 'gold', value: 3, duration: 0, description: 'Silkkitien Varjot: +3 kultaa hallinnasta' };
  if (id === 'str-058') return { type: 'defense_bonus', value: 2, duration: 3, description: 'Jasan Laki: +2 puolustus 3 vuoroa' };
  if (id === 'str-059') return { type: 'morale', value: -2, duration: 0, description: 'Euroopan Kauhut: -2 vihollisen moraali' };
  if (id === 'str-060') return { type: 'gold', value: 4, duration: 0, description: 'Imperiumin Jakaminen: +4 kultaa perinnöstä' };
  
  // === DIPLOMACY CARDS ===
  if (id === 'dip-001') return { type: 'defense_bonus', value: 2, duration: 3, description: 'Rauhansopimus: +2 puolustus 3 vuoroa' };
  if (id === 'dip-002') return { type: 'defense_bonus', value: 2, duration: 0, description: 'Puolustusliitto: +2 puolustus' };
  if (id === 'dip-003') return { type: 'attack_bonus', value: 1, duration: 0, description: 'Hyökkäysliitto: +1 hyökkäys' };
  if (id === 'dip-004') return { type: 'defense_bonus', value: 3, duration: -1, description: 'Dynastinen Avioliitto: +3 pysyvä puolustus' };
  if (id === 'dip-005') return { type: 'gold', value: 5, duration: 0, description: 'Ikuinen Ystävyys: +5 kultaa liitosta' };
  if (id === 'dip-006') return { type: 'defense_bonus', value: 1, duration: 1, description: 'Aselepo: +1 puolustus' };
  if (id === 'dip-007') return { type: 'attack_bonus', value: 2, duration: 0, description: 'Salaliitto: +2 salainen hyökkäys' };
  if (id === 'dip-008') return { type: 'gold', value: 2, duration: 0, description: 'Vastavuoroisuus: +2 kultaa molemmille' };
  if (id === 'dip-009') return { type: 'gold', value: 3, duration: 0, description: 'Suojelusopimus: +3 tributti' };
  if (id === 'dip-010') return { type: 'defense_bonus', value: 1, duration: 5, description: 'Rajalinja: +1 puolustus 5 vuoroa' };
  if (id === 'dip-011') return { type: 'gold', value: 3, duration: 0, description: 'Verosopimus: +3 kultaa' };
  if (id === 'dip-012') return { type: 'gold', value: 4, duration: 0, description: 'Resurssisopimus: +4 kultaa Silkkitieltä' };
  if (id === 'dip-013') return { type: 'gold', value: 2, duration: 0, description: 'Resurssien jako: +2 kultaa' };
  if (id === 'dip-014') return { type: 'movement_bonus', value: 1, duration: 0, description: 'Vapaa kulku: +1 liike' };
  if (id === 'dip-015') return { type: 'artisans', value: 2, duration: 0, description: 'Teknologiavaihto: +2 käsityöläistä' };
  if (id === 'dip-016') return { type: 'movement_bonus', value: 2, duration: 0, description: 'Huoltotuki: +2 liike liittolaisella' };
  if (id === 'dip-017') return { type: 'artisans', value: 1, duration: 0, description: 'Käsityöläisvaihto: +1 käsityöläinen' };
  if (id === 'dip-018') return { type: 'gold', value: 2, duration: 0, description: 'Yhteinen varasto: +2 kultaa' };
  if (id === 'dip-019') return { type: 'gold', value: 5, duration: 0, description: 'Lainasopimus: +5 kultaa lainaa' };
  if (id === 'dip-020') return { type: 'gold', value: 6, duration: 0, description: 'Silkkitien hallinta: +6 kultaa' };
  if (id === 'dip-021') return { type: 'gold', value: 3, duration: 0, description: 'Uhkavaatimus: +3 resursseja' };
  if (id === 'dip-022') return { type: 'gold', value: 4, duration: 0, description: 'Tributtivaatimus: +4 tributti' };
  if (id === 'dip-023') return { type: 'defense_bonus', value: 2, duration: 2, description: 'Rajasulku: +2 puolustus 2 vuoroa' };
  if (id === 'dip-024') return { type: 'draw_cards', value: 1, duration: 0, description: 'Kiristys: nosta 1 kortti' };
  if (id === 'dip-025') return { type: 'defense_bonus', value: 1, duration: 0, description: 'Eristäytyminen: +1 puolustus' };
  if (id === 'dip-026') return { type: 'attack_bonus', value: 2, duration: 0, description: 'Sabotaasi: tuhoa rakennus' };
  if (id === 'dip-027') return { type: 'morale', value: -2, duration: 0, description: 'Kapinan Lietsonta: -2 moraali' };
  if (id === 'dip-028') return { type: 'attack_bonus', value: 1, duration: 0, description: 'Vakooja: +1 tiedustelu' };
  if (id === 'dip-029') return { type: 'gold', value: -3, duration: 0, description: 'Lahjonnat: osta yksikkö (-3 kultaa)' };
  if (id === 'dip-030') return { type: 'gold', value: 3, duration: 0, description: 'Julkinen Häpäisy: +3 kultaa' };
  if (id === 'dip-031') return { type: 'gold', value: 3, duration: 0, description: 'Suurlähettiläs: +3 verotuloa' };
  if (id === 'dip-032') return { type: 'defense_bonus', value: 2, duration: 2, description: 'Rauhanneuvottelut: +2 puolustus 2v' };
  if (id === 'dip-033') return { type: 'gold', value: 2, duration: 0, description: 'Kulttuurivaihto: +2 kultaa' };
  if (id === 'dip-034') return { type: 'morale', value: 1, duration: 0, description: 'Uskonnollinen Missio: +1 moraali' };
  if (id === 'dip-035') return { type: 'attack_bonus', value: 1, duration: -1, description: 'Kruunausseremonia: +1 pysyvä hyökkäys' };
  if (id === 'dip-036') return { type: 'defense_bonus', value: 3, duration: 0, description: 'Panttivanki: +3 sopimuspuolustus' };
  if (id === 'dip-037') return { type: 'draw_cards', value: 2, duration: 0, description: 'Salaliittoneuvosto: nosta 2 korttia' };
  if (id === 'dip-038') return { type: 'gold', value: 2, duration: 0, description: 'Julkinen Julistus: +2 kultaa' };
  if (id === 'dip-039') return { type: 'gold', value: -5, duration: 0, description: 'Lunnaiden Maksu: vapauta päällikkö (-5 kultaa)' };
  if (id === 'dip-040') return { type: 'gold', value: 4, duration: 0, description: 'Imperiumin Perillinen: +4 kultaa perinnöstä' };
  
  // === TECHNOLOGY CARDS ===
  if (id === 'tek-001') return { type: 'permanent_attack', value: 1, duration: -1, description: 'Yhdistetty Jousi: +1 ratsuväen hyökkäys pysyvästi' };
  if (id === 'tek-002') return { type: 'permanent_defense', value: 1, duration: -1, description: 'Raskaat Ratsut: +1 ratsuväen puolustus pysyvästi' };
  if (id === 'tek-003') return { type: 'attack_bonus', value: 2, duration: -1, description: 'Piirityskone: +2 linnoituksia vastaan' };
  if (id === 'tek-004') return { type: 'attack_bonus', value: 4, duration: 0, description: 'Kiinalainen Ruuti: tuhoa linnoitus' };
  if (id === 'tek-005') return { type: 'permanent_defense', value: 1, duration: -1, description: 'Teräshaarniska: +1 jalkaväen puolustus pysyvästi' };
  if (id === 'tek-006') return { type: 'attack_bonus', value: 1, duration: 0, description: 'Tulisaattue: +1 tulinuolet' };
  if (id === 'tek-007') return { type: 'attack_bonus', value: 2, duration: -1, description: 'Piiritystorni: +2 linnoituksia vastaan' };
  if (id === 'tek-008') return { type: 'defense_bonus', value: 1, duration: -1, description: 'Signaalijärjestelmä: +1 puolustus pysyvästi' };
  if (id === 'tek-009') return { type: 'permanent_attack', value: 1, duration: -1, description: 'Mongolijousimies: +1 ratsuväen hyökkäys' };
  if (id === 'tek-010') return { type: 'permanent_attack', value: 1, duration: -1, description: 'Taktinen Koulutus: uudet yksiköt +1' };
  if (id === 'tek-011') return { type: 'gold', value: 5, duration: 0, description: 'Verojärjestelmä: +5 kultaa' };
  if (id === 'tek-012') return { type: 'movement_bonus', value: 1, duration: -1, description: 'Viestijärjestelmä: +1 liike pysyvästi' };
  if (id === 'tek-013') return { type: 'food', value: 3, duration: 0, description: 'Maanviljelystekniikka: +3 ruokaa' };
  if (id === 'tek-014') return { type: 'gold', value: 2, duration: 0, description: 'Neuvottelutaito: +2 kauppa' };
  if (id === 'tek-015') return { type: 'gold', value: 2, duration: -1, description: 'Kirjoitustaito: +2 kultaa per vuoro' };
  if (id === 'tek-016') return { type: 'defense_bonus', value: 1, duration: -1, description: 'Lakinuudistus: -1 kapinariski' };
  if (id === 'tek-017') return { type: 'movement_bonus', value: 1, duration: -1, description: 'Tieverkosto: +1 liike pysyvästi' };
  if (id === 'tek-018') return { type: 'food', value: 3, duration: 0, description: 'Varastointijärjestelmä: +3 ruokaa' };
  if (id === 'tek-019') return { type: 'gold', value: 2, duration: 0, description: 'Väestönlaskenta: +2 hallintoa' };
  if (id === 'tek-020') return { type: 'gold', value: 2, duration: 0, description: 'Diplomaattikoulu: +2 diplomatiaa' };
  if (id === 'tek-021') return { type: 'draw_cards', value: 1, duration: -1, description: 'Kirjasto: +1 kortti per vuoro pysyvästi' };
  if (id === 'tek-022') return { type: 'terrain_ignore', value: 1, duration: -1, description: 'Tähtitiede: ohita maasto-olosuhteet' };
  if (id === 'tek-023') return { type: 'food', value: 2, duration: -1, description: 'Lääketiede: +2 ruokaa per vuoro' };
  if (id === 'tek-024') return { type: 'artisans', value: 2, duration: 0, description: 'Metallintyöstö: +2 käsityöläistä' };
  if (id === 'tek-025') return { type: 'movement_bonus', value: 2, duration: -1, description: 'Purjehdus: +2 meriliike pysyvästi' };
  if (id === 'tek-026') return { type: 'permanent_defense', value: 1, duration: -1, description: 'Arkkitehtuuri: +1 linnoituksen kestävyys' };
  if (id === 'tek-027') return { type: 'gold', value: 1, duration: -1, description: 'Kielitaito: +1 diplomatiaa per vuoro' };
  if (id === 'tek-028') return { type: 'morale', value: 1, duration: -1, description: 'Uskonto: +1 moraali pysyvästi' };
  if (id === 'tek-029') return { type: 'gold', value: 3, duration: 0, description: 'Filosofia: +3 kultaa' };
  if (id === 'tek-030') return { type: 'gold', value: 10, duration: 0, description: 'Universaali Tiede: +10 kultaa' };
  
  // === RESOURCE CARDS ===
  // Hevoset
  if (id === 'res-001') return { type: 'horses', value: 3, duration: 0, description: 'Mongolihevoset: +3 hevosta' };
  if (id === 'res-002') return { type: 'horses', value: 5, duration: 0, description: 'Villihevoslauma: +5 hevosta' };
  if (id === 'res-003') return { type: 'horses', value: 2, duration: 0, description: 'Sotahevoset: +2 hevosta' };
  if (id === 'res-004') return { type: 'horses', value: 3, duration: 0, description: 'Hevostarha: +3 hevosta' };
  if (id === 'res-005') return { type: 'horses', value: 1, duration: 0, description: 'Steppin Ori: +1 erikoishevonen' };
  if (id === 'res-006') return { type: 'horses', value: 2, duration: 0, description: 'Hevosenhoito: +2 hevosta' };
  if (id === 'res-007') return { type: 'horses', value: 4, duration: 0, description: 'Varsalauma: +4 hevosta' };
  if (id === 'res-008') return { type: 'horses', value: 3, duration: 0, description: 'Karavaanihevoset: +3 hevosta' };
  if (id === 'res-009') return { type: 'horses', value: 2, duration: 0, description: 'Persialainen Arabihevonen: +2 hevosta' };
  if (id === 'res-010') return { type: 'horses', value: 1, duration: 0, description: 'Legendaarinen Ori: +1 erikoishevonen' };
  // Kulta
  if (id === 'res-011') return { type: 'gold', value: 3, duration: 0, description: 'Kultakolikot: +3 kultaa' };
  if (id === 'res-012') return { type: 'gold', value: 5, duration: 0, description: 'Aarrearkku: +5 kultaa' };
  if (id === 'res-013') return { type: 'gold', value: 4, duration: 0, description: 'Silkkiraha: +4 kultaa' };
  if (id === 'res-014') return { type: 'gold', value: 6, duration: 0, description: 'Ryöstetty Rikkaus: +6 kultaa' };
  if (id === 'res-015') return { type: 'gold', value: 3, duration: 0, description: 'Kauppiaan Voitot: +3 kultaa' };
  if (id === 'res-016') return { type: 'gold', value: 4, duration: 0, description: 'Tributti: +4 kultaa' };
  if (id === 'res-017') return { type: 'gold', value: 5, duration: 0, description: 'Kultakaivos: +5 kultaa' };
  if (id === 'res-018') return { type: 'gold', value: 4, duration: 0, description: 'Korruptiorahat: +4 kultaa' };
  if (id === 'res-019') return { type: 'gold', value: 3, duration: 0, description: 'Verotulo: +3 kultaa' };
  if (id === 'res-020') return { type: 'gold', value: 10, duration: 0, description: 'Khaanin Aarre: +10 kultaa' };
  // Ruoka
  if (id === 'res-021') return { type: 'food', value: 4, duration: 0, description: 'Viljasato: +4 ruokaa' };
  if (id === 'res-022') return { type: 'food', value: 3, duration: 0, description: 'Karjan Liha: +3 ruokaa' };
  if (id === 'res-023') return { type: 'food', value: 5, duration: 0, description: 'Kuivattu Ruoka: +5 ruokaa' };
  if (id === 'res-024') return { type: 'food', value: 4, duration: 0, description: 'Hedelmätarha: +4 ruokaa' };
  if (id === 'res-025') return { type: 'food', value: 4, duration: 0, description: 'Kalastussaalis: +4 ruokaa' };
  if (id === 'res-026') return { type: 'food', value: 6, duration: 0, description: 'Ruokavarasto: +6 ruokaa' };
  if (id === 'res-027') return { type: 'food', value: 2, duration: 0, description: 'Metsästyssaalis: +2 ruokaa' };
  if (id === 'res-028') return { type: 'food', value: 3, duration: 0, description: 'Maataloustekniikka: +3 ruokaa' };
  if (id === 'res-029') return { type: 'food', value: 3, duration: 0, description: 'Riisipellot: +3 ruokaa' };
  if (id === 'res-030') return { type: 'food', value: 8, duration: 0, description: 'Ylenpalttisuus: +8 ruokaa' };
  // Käsityöläiset
  if (id === 'res-031') return { type: 'artisans', value: 2, duration: 0, description: 'Sepät: +2 käsityöläistä' };
  if (id === 'res-032') return { type: 'artisans', value: 3, duration: 0, description: 'Kiinalaiset Insinöörit: +3 käsityöläistä' };
  if (id === 'res-033') return { type: 'artisans', value: 4, duration: 0, description: 'Persialaiset Mestarit: +4 käsityöläistä' };
  if (id === 'res-034') return { type: 'artisans', value: 2, duration: 0, description: 'Kutojat: +2 käsityöläistä' };
  if (id === 'res-035') return { type: 'artisans', value: 3, duration: 0, description: 'Rakentajat: +3 käsityöläistä' };
  if (id === 'res-036') return { type: 'artisans', value: 1, duration: 0, description: 'Keramiikantekijät: +1 käsityöläinen' };
  if (id === 'res-037') return { type: 'artisans', value: 2, duration: 0, description: 'Hopeapajat: +2 käsityöläistä' };
  if (id === 'res-038') return { type: 'artisans', value: 3, duration: 0, description: 'Mestariaseseppä: +3 käsityöläistä' };
  if (id === 'res-039') return { type: 'artisans', value: 4, duration: 0, description: 'Pajagilda: +4 käsityöläistä' };
  if (id === 'res-040') return { type: 'artisans', value: 1, duration: 0, description: 'Oppipojat: +1 käsityöläinen' };
  // Karja ja muut
  if (id === 'res-041') return { type: 'food', value: 4, duration: 0, description: 'Lammaslauma: +4 ruokaa' };
  if (id === 'res-042') return { type: 'food', value: 3, duration: 0, description: 'Nautakarja: +3 ruokaa' };
  if (id === 'res-043') return { type: 'food', value: 5, duration: 0, description: 'Kamelikaravaani: +5 ruokaa' };
  if (id === 'res-044') return { type: 'food', value: 3, duration: 0, description: 'Vuohilauma: +3 ruokaa' };
  if (id === 'res-045') return { type: 'food', value: 2, duration: 0, description: 'Jakintyypit: +2 ruokaa' };
  if (id === 'res-046') return { type: 'gold', value: 2, duration: 0, description: 'Silkkiperhoskasvattamo: +2 kultaa' };
  if (id === 'res-047') return { type: 'gold', value: 3, duration: 0, description: 'Mausteet: +3 kultaa' };
  if (id === 'res-048') return { type: 'gold', value: 2, duration: 0, description: 'Turkikset: +2 kultaa' };
  if (id === 'res-049') return { type: 'gold', value: 4, duration: 0, description: 'Jalokivet: +4 kultaa' };
  if (id === 'res-050') return { type: 'gold', value: 8, duration: 0, description: 'Khaanin Tiara: +8 kultaa' };
  
  // Fallback based on type
  if (card.type === 'strategy') return { type: 'attack_bonus', value: 1, duration: 0, description: '+1 hyökkäys' };
  if (card.type === 'diplomacy') return { type: 'gold', value: 2, duration: 0, description: '+2 kultaa diplomatiasta' };
  if (card.type === 'technology') return { type: 'artisans', value: 1, duration: 0, description: '+1 käsityöläinen' };
  return { type: 'gold', value: 2, duration: 0, description: '+2 kultaa' };
}

// Create the full playable deck using ALL 180 cards
export function createPlayableDeck(): PlayableCard[] {
  const allCards = [
    ...strategyCards,
    ...diplomacyCards,
    ...technologyCards,
    ...resourceCards,
  ];
  
  return shuffleDeck(allCards.map(card => ({
    ...card,
    parsedEffect: parseCardEffect(card),
  })));
}

export function shuffleDeck<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawCards(deck: PlayableCard[], count: number): { drawn: PlayableCard[]; remaining: PlayableCard[] } {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}
