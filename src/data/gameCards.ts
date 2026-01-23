// Kaikki 180 pelikorttia Mongolien Valtakunta -lautapeliin

export type CardType = 'strategy' | 'diplomacy' | 'technology' | 'resource';

export interface GameCard {
  id: string;
  type: CardType;
  name: string;
  description: string;
  effect: string;
  cost?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
}

// STRATEGIAKORTIT (60 kpl)
export const strategyCards: GameCard[] = [
  // Sotilaalliset taktiikat (20)
  { id: 'str-001', type: 'strategy', name: 'Mongolivyöry', description: 'Klassinen ratsuväkihyökkäys', effect: '+3 hyökkäysbonus tällä vuorolla', rarity: 'rare' },
  { id: 'str-002', type: 'strategy', name: 'Teeskennetty Vetäytyminen', description: 'Houkuttele vihollinen ansaan', effect: 'Vetäydy taistelusta, seuraava hyökkäys +2', rarity: 'uncommon' },
  { id: 'str-003', type: 'strategy', name: 'Sivustaisku', description: 'Yllätä vihollinen sivusta', effect: 'Ohita puolustajan maastobonus', rarity: 'uncommon' },
  { id: 'str-004', type: 'strategy', name: 'Yöhyökkäys', description: 'Isku pimeän turvin', effect: '+2 hyökkäys, -1 puolustajalle', rarity: 'uncommon' },
  { id: 'str-005', type: 'strategy', name: 'Täydellinen Saarrostus', description: 'Estä vihollisen vetäytyminen', effect: 'Vihollinen ei voi paeta taistelusta', rarity: 'rare' },
  { id: 'str-006', type: 'strategy', name: 'Jousiampujien Sade', description: 'Massiivinen nuolisade', effect: '+1 hyökkäys per ratsuväkiyksikkö', rarity: 'common' },
  { id: 'str-007', type: 'strategy', name: 'Ratsastava Tuuli', description: 'Salaman nopea hyökkäys', effect: 'Ratsuväki liikkuu +2 tällä vuorolla', rarity: 'common' },
  { id: 'str-008', type: 'strategy', name: 'Kaaoksen Taktikko', description: 'Sekasortoa vihollisen riveissä', effect: 'Vihollinen menettää yhden yksikön ennen taistelua', rarity: 'legendary' },
  { id: 'str-009', type: 'strategy', name: 'Steppin Perintö', description: 'Esi-isien viisaus taistelussa', effect: 'Noppa 3+ on osuma tällä vuorolla', rarity: 'rare' },
  { id: 'str-010', type: 'strategy', name: 'Verivala', description: 'Taistele kuolemaan asti', effect: '+2 puolustus, ei voi vetäytyä', rarity: 'uncommon' },
  { id: 'str-011', type: 'strategy', name: 'Tulihurmio', description: 'Sytytetyt nuolet', effect: 'Tuhoa yksi vihollisen rakennus', rarity: 'uncommon' },
  { id: 'str-012', type: 'strategy', name: 'Sotahuuto', description: 'Pelottava taisteluhuuto', effect: '-1 vihollisen moraaliin', rarity: 'common' },
  { id: 'str-013', type: 'strategy', name: 'Veteraanien Kokemus', description: 'Vanhat soturit johtavat', effect: '+1 kaikille yksiköille taistelussa', rarity: 'uncommon' },
  { id: 'str-014', type: 'strategy', name: 'Vahvistettu Linja', description: 'Tiukka puolustusmuodostelma', effect: '+3 puolustus tällä vuorolla', rarity: 'rare' },
  { id: 'str-015', type: 'strategy', name: 'Nopea Ryhmittyminen', description: 'Uudelleenjärjestäytyminen', effect: 'Siirrä 2 yksikköä ilmaiseksi', rarity: 'common' },
  { id: 'str-016', type: 'strategy', name: 'Ratsuväen Shokki', description: 'Ensimmäinen isku ratkaisee', effect: 'Ensimmäinen taistelu +3, loput +0', rarity: 'uncommon' },
  { id: 'str-017', type: 'strategy', name: 'Ansakuopat', description: 'Maastoon piilotetut ansat', effect: 'Hyökkääjä menettää 1 yksikön ennen taistelua', rarity: 'uncommon' },
  { id: 'str-018', type: 'strategy', name: 'Varjosotilaat', description: 'Vakoojien käyttö', effect: 'Näe vihollisen käsikortti', rarity: 'rare' },
  { id: 'str-019', type: 'strategy', name: 'Khaanin Käsky', description: 'Ehdoton kuuliaisuus', effect: 'Kaikki yksiköt hyökkäävät yhdessä', rarity: 'legendary' },
  { id: 'str-020', type: 'strategy', name: 'Viimeinen Voima', description: 'Epätoivoinen hyökkäys', effect: 'Tuplaa hyökkäys, mutta menetä puolet yksiköistä', rarity: 'rare' },
  
  // Puolustuskortit (15)
  { id: 'str-021', type: 'strategy', name: 'Muurien Vahvistus', description: 'Linnoituksen korjaus', effect: '+2 linnoituksen kestävyys', rarity: 'common' },
  { id: 'str-022', type: 'strategy', name: 'Piiritettyjen Uhmakkuus', description: 'Ei antauduta!', effect: 'Piiritys kestää 2 vuoroa pidempään', rarity: 'uncommon' },
  { id: 'str-023', type: 'strategy', name: 'Salakäytävät', description: 'Maanalaiset pakoreitit', effect: 'Evakuoi yksiköt piirityksestä', rarity: 'rare' },
  { id: 'str-024', type: 'strategy', name: 'Kiehuvat Öljyt', description: 'Puolustustaktiikka', effect: '+3 puolustus piiritystä vastaan', rarity: 'uncommon' },
  { id: 'str-025', type: 'strategy', name: 'Kaupungin Vartijat', description: 'Kansalaismiliisi', effect: 'Saat 2 väliaikaista jalkaväkiyksikköä', rarity: 'common' },
  { id: 'str-026', type: 'strategy', name: 'Skorpionikone', description: 'Puolustuspiiritysase', effect: '+2 puolustus, voi iskeä viereiseen alueeseen', rarity: 'rare' },
  { id: 'str-027', type: 'strategy', name: 'Palomuurit', description: 'Tulimyrsky puolustuksessa', effect: 'Hyökkääjä menettää 1 ratsuväkiyksikön', rarity: 'uncommon' },
  { id: 'str-028', type: 'strategy', name: 'Ruokavarasto', description: 'Pitkäaikainen piiritus', effect: 'Ei ruokakulutusta piirityksen aikana', rarity: 'common' },
  { id: 'str-029', type: 'strategy', name: 'Veteraanigaardit', description: 'Eliittipuolustajat', effect: '+1 puolustus per heimopäällikkö alueella', rarity: 'uncommon' },
  { id: 'str-030', type: 'strategy', name: 'Hälytyskellot', description: 'Ennakkovaroitus', effect: 'Ei yllätys hyökkäyksiä sinua vastaan tällä vuorolla', rarity: 'common' },
  { id: 'str-031', type: 'strategy', name: 'Puolustusliitto', description: 'Naapurien apu', effect: 'Liittolainen voi lähettää yksiköitä puolustukseesi', rarity: 'uncommon' },
  { id: 'str-032', type: 'strategy', name: 'Taistelukokeneet', description: 'Kokemus kantaa', effect: '+2 puolustus omilla alueilla', rarity: 'common' },
  { id: 'str-033', type: 'strategy', name: 'Kylmä Vastarinta', description: 'Talvipuolustus', effect: 'Jos talvi: +4 puolustus', rarity: 'rare' },
  { id: 'str-034', type: 'strategy', name: 'Armeijan Hajottaminen', description: 'Gerillataktiikka', effect: 'Jakaannu 3 alueelle, vihollinen valitsee yhden hyökättäväksi', rarity: 'rare' },
  { id: 'str-035', type: 'strategy', name: 'Viimeinen Muuri', description: 'Kuolema tai voitto', effect: 'Puolustus x2, mutta ei vetäytymistä', rarity: 'legendary' },
  
  // Liikkuminen ja logistiikka (15)
  { id: 'str-036', type: 'strategy', name: 'Pakkomarssit', description: 'Nopeutettu eteneminen', effect: 'Kaikki yksiköt +1 liike tällä vuorolla', rarity: 'common' },
  { id: 'str-037', type: 'strategy', name: 'Silkkitien Opas', description: 'Paikallistuntemus', effect: 'Ohita maastoesteet tällä vuorolla', rarity: 'uncommon' },
  { id: 'str-038', type: 'strategy', name: 'Huoltojuna', description: 'Logistiikkaetu', effect: 'Siirrä resursseja ilman kauppiaita', rarity: 'common' },
  { id: 'str-039', type: 'strategy', name: 'Vakoojat Edellä', description: 'Tiedustelu ennen liikettä', effect: 'Näe viereisten alueiden yksiköt', rarity: 'common' },
  { id: 'str-040', type: 'strategy', name: 'Strateginen Vetäytyminen', description: 'Taktinen perääntyminen', effect: 'Vetäydy ilman tappioita, säilytä asemat', rarity: 'uncommon' },
  { id: 'str-041', type: 'strategy', name: 'Salamasota', description: 'Blitzkrieg-taktiikka', effect: 'Hyökkää, jos voitat voit jatkaa seuraavaan alueeseen', rarity: 'rare' },
  { id: 'str-042', type: 'strategy', name: 'Joenylitys', description: 'Insinööritaito', effect: 'Ohita joet ilman rangaistusta', rarity: 'uncommon' },
  { id: 'str-043', type: 'strategy', name: 'Vuoristoreitit', description: 'Salaiset polut', effect: 'Liiku vuoriston läpi yhdellä liikkeellä', rarity: 'rare' },
  { id: 'str-044', type: 'strategy', name: 'Karavaanireitti', description: 'Kauppiaat tuntevat tiet', effect: 'Seuraa kauppareittejä +2 liike', rarity: 'common' },
  { id: 'str-045', type: 'strategy', name: 'Nomadien Vaellus', description: 'Jatkuva liike', effect: 'Ratsuväki liikkuu taistelun jälkeen', rarity: 'uncommon' },
  { id: 'str-046', type: 'strategy', name: 'Hevosenvaihtoasemat', description: 'Mongolilainen postilaitos', effect: 'Yksi yksikkö liikkuu 2x normaalin', rarity: 'rare' },
  { id: 'str-047', type: 'strategy', name: 'Talvileiritys', description: 'Talvimarssi', effect: 'Ohita talven liikerajoitukset', rarity: 'uncommon' },
  { id: 'str-048', type: 'strategy', name: 'Aavikkokaravaan', description: 'Autiomaatuntemus', effect: 'Gobin läpi ilman vesimaksu', rarity: 'uncommon' },
  { id: 'str-049', type: 'strategy', name: 'Salainen Sotapolku', description: 'Tuntematon reitti', effect: 'Liiku vihollisen alueiden läpi näkymättömänä', rarity: 'legendary' },
  { id: 'str-050', type: 'strategy', name: 'Joukkojen Kokoaminen', description: 'Mobilisaatio', effect: 'Kutsu kaikki yksiköt yhteen alueeseen', rarity: 'rare' },
  
  // Historialliset tapahtumat (10)
  { id: 'str-051', type: 'strategy', name: 'Genghis Khanin Henki', description: 'Suuren valloittajan inspiraatio', effect: 'Kaikki yksiköt +2 tällä vuorolla', rarity: 'legendary' },
  { id: 'str-052', type: 'strategy', name: 'Bagdadin Ryöstö', description: 'Kalifaatin tuho', effect: 'Ryöstä kaupunki: saa 5 kultaa ja 2 teknologiakorttia', rarity: 'legendary' },
  { id: 'str-053', type: 'strategy', name: 'Jalka-ammunta', description: 'Innovatiivinen taktiikka', effect: 'Jalkaväki saa jousiammunnan', rarity: 'rare' },
  { id: 'str-054', type: 'strategy', name: 'Kiinalainen Ruuti', description: 'Uusi teknologia käytössä', effect: 'Tuhoa linnoitus automaattisesti', rarity: 'legendary' },
  { id: 'str-055', type: 'strategy', name: 'Subutain Neuvot', description: 'Mestaristrategin oppi', effect: 'Kopioi vastustajan viimeisin taktiikkakortti', rarity: 'rare' },
  { id: 'str-056', type: 'strategy', name: 'Kurultai-päätös', description: 'Klaanin kokoontuminen', effect: 'Vedä 3 strategiakorttia', rarity: 'uncommon' },
  { id: 'str-057', type: 'strategy', name: 'Silkkitien Varjot', description: 'Kauppareitin hallinta', effect: 'Estä yksi kauppareitti 2 vuoroksi', rarity: 'uncommon' },
  { id: 'str-058', type: 'strategy', name: 'Jasan Laki', description: 'Mongolilainen lakikokoelma', effect: 'Kaikki sopimukset ovat sitovia (ei petoksia) 3 vuoroa', rarity: 'rare' },
  { id: 'str-059', type: 'strategy', name: 'Euroopan Kauhut', description: 'Terrorin maine', effect: '-2 kaikkien vihollisten moraaliin', rarity: 'rare' },
  { id: 'str-060', type: 'strategy', name: 'Imperiumin Jakaminen', description: 'Khaanin perintö', effect: 'Jaa valtakunta: saa 2 voittopistettä per hallittu alue', rarity: 'legendary' },
];

// DIPLOMATIAKORTIT (40 kpl)
export const diplomacyCards: GameCard[] = [
  // Liittosopimukset (10)
  { id: 'dip-001', type: 'diplomacy', name: 'Rauhansopimus', description: 'Virallinen rauha', effect: 'Ei hyökkäyksiä 3 vuoroon', rarity: 'common' },
  { id: 'dip-002', type: 'diplomacy', name: 'Puolustusliitto', description: 'Yhteinen puolustus', effect: 'Jos liittolaista hyökätään, voit auttaa', rarity: 'uncommon' },
  { id: 'dip-003', type: 'diplomacy', name: 'Hyökkäysliitto', description: 'Yhteinen sota', effect: 'Molemmat saavat +1 hyökkäys kolmatta osapuolta vastaan', rarity: 'uncommon' },
  { id: 'dip-004', type: 'diplomacy', name: 'Dynastinen Avioliitto', description: 'Perhesuhteet', effect: 'Pysyvä liitto, ei voi hyökätä toisiaan vastaan', rarity: 'rare' },
  { id: 'dip-005', type: 'diplomacy', name: 'Ikuinen Ystävyys', description: 'Veljesliitto', effect: 'Jaettu voitto: molemmat voittavat jos toinen voittaa', rarity: 'legendary' },
  { id: 'dip-006', type: 'diplomacy', name: 'Aselepo', description: 'Väliaikainen rauha', effect: '1 vuoro rauhaa, ei voi hyökätä', rarity: 'common' },
  { id: 'dip-007', type: 'diplomacy', name: 'Salaliitto', description: 'Salainen sopimus', effect: 'Liitto jota muut eivät näe', rarity: 'rare' },
  { id: 'dip-008', type: 'diplomacy', name: 'Vastavuoroisuus', description: 'Tasapuolinen sopimus', effect: 'Molemmat saavat +1 diplomatiapiste', rarity: 'common' },
  { id: 'dip-009', type: 'diplomacy', name: 'Suojelusopimus', description: 'Vahvemman turva', effect: 'Suojele heikompaa: saat tributin', rarity: 'uncommon' },
  { id: 'dip-010', type: 'diplomacy', name: 'Yhteinen Rajalinja', description: 'Rajanmäärittely', effect: 'Ei riitoja rajasta 5 vuoroon', rarity: 'common' },
  
  // Kauppasuhteet (10)
  { id: 'dip-011', type: 'diplomacy', name: 'Kauppasopimus', description: 'Taloudellinen yhteistyö', effect: 'Molemmat +1 kulta per vuoro', rarity: 'common' },
  { id: 'dip-012', type: 'diplomacy', name: 'Monopolisopimus', description: 'Yksinoikeus', effect: 'Hallitse yhtä kauppareittiä yksin', rarity: 'rare' },
  { id: 'dip-013', type: 'diplomacy', name: 'Vaihtokurssi', description: 'Edullinen kauppa', effect: 'Resurssien vaihto 1:1 liittolaisen kanssa', rarity: 'uncommon' },
  { id: 'dip-014', type: 'diplomacy', name: 'Tullivapaus', description: 'Vapaa kauppa', effect: 'Ei maksuja kauppareiteillä liittolaisen alueilla', rarity: 'uncommon' },
  { id: 'dip-015', type: 'diplomacy', name: 'Teknologiavaihto', description: 'Jaettu tieto', effect: 'Vaihda teknologiakortti liittolaisen kanssa', rarity: 'rare' },
  { id: 'dip-016', type: 'diplomacy', name: 'Karavaanituki', description: 'Logistiikka-apu', effect: '+2 kauppiaan liike liittolaisen alueilla', rarity: 'common' },
  { id: 'dip-017', type: 'diplomacy', name: 'Käsityöläisvaihto', description: 'Taitajien liikkuminen', effect: 'Siirrä käsityöläinen liittolaiselta', rarity: 'uncommon' },
  { id: 'dip-018', type: 'diplomacy', name: 'Yhteinen Marketti', description: 'Kauppatorin jakaminen', effect: 'Molemmat +2 kultaa kerran', rarity: 'common' },
  { id: 'dip-019', type: 'diplomacy', name: 'Lainasopimus', description: 'Taloudellinen apu', effect: 'Lainaa 5 kultaa, maksa 7 takaisin 3 vuorossa', rarity: 'common' },
  { id: 'dip-020', type: 'diplomacy', name: 'Silkkimonopoli', description: 'Silkkitien hallinta', effect: 'Hallitse Silkkitietä: +3 kultaa per vuoro', rarity: 'legendary' },
  
  // Uhkaukset ja painostus (10)
  { id: 'dip-021', type: 'diplomacy', name: 'Uhkavaatimus', description: 'Maksa tai sota', effect: 'Vastustaja maksaa 3 resurssia tai julistaa sodan', rarity: 'uncommon' },
  { id: 'dip-022', type: 'diplomacy', name: 'Tributtivaatimus', description: 'Vuosimaksu', effect: 'Vasalli maksaa 2 resurssia per vuoro', rarity: 'rare' },
  { id: 'dip-023', type: 'diplomacy', name: 'Rajasulku', description: 'Kaupan esto', effect: 'Estä yhden pelaajan kauppa 2 vuoroksi', rarity: 'uncommon' },
  { id: 'dip-024', type: 'diplomacy', name: 'Kiristys', description: 'Salaisuuksien käyttö', effect: 'Vastustaja luopuu 1 kortista', rarity: 'rare' },
  { id: 'dip-025', type: 'diplomacy', name: 'Eristäytyminen', description: 'Diplomaattinen pako', effect: 'Katkaise kaikki suhteet yhteen pelaajaan', rarity: 'uncommon' },
  { id: 'dip-026', type: 'diplomacy', name: 'Sabotaasi', description: 'Vahingoittaminen', effect: 'Tuhoa vihollisen 1 rakennus', rarity: 'rare' },
  { id: 'dip-027', type: 'diplomacy', name: 'Kapinan Lietsonta', description: 'Sisäinen sekasorto', effect: 'Aiheuta kapina vihollisen alueella', rarity: 'rare' },
  { id: 'dip-028', type: 'diplomacy', name: 'Vakooja', description: 'Salatieto', effect: 'Näe vastustajan kaikki kortit', rarity: 'uncommon' },
  { id: 'dip-029', type: 'diplomacy', name: 'Lahjonnat', description: 'Korruptiota', effect: 'Osta vihollisen 1 yksikkö (3 kultaa)', rarity: 'rare' },
  { id: 'dip-030', type: 'diplomacy', name: 'Julkinen Häpäisy', description: 'Maineen tuho', effect: 'Vastustaja menettää 2 diplomatiapistettä', rarity: 'uncommon' },
  
  // Erikoiset diplomaattiset toimet (10)
  { id: 'dip-031', type: 'diplomacy', name: 'Suurlähettiläs', description: 'Korkea-arvoinen edustaja', effect: '+2 kaikkiin diplomatiatoimiin tällä vuorolla', rarity: 'uncommon' },
  { id: 'dip-032', type: 'diplomacy', name: 'Rauhanneuvottelut', description: 'Välittäjänä toimiminen', effect: 'Pakota kaksi pelaajaa rauhaan', rarity: 'rare' },
  { id: 'dip-033', type: 'diplomacy', name: 'Kulturaalinen Vaihto', description: 'Sivistyksen levitys', effect: '+1 voittopiste kulttuurista', rarity: 'uncommon' },
  { id: 'dip-034', type: 'diplomacy', name: 'Uskonnollinen Missio', description: 'Uskon levitys', effect: '+1 vaikutus naapurialueilla', rarity: 'common' },
  { id: 'dip-035', type: 'diplomacy', name: 'Kruunausseremonia', description: 'Vallan oikeuttaminen', effect: 'Heimopäällikkö saa +1 kaikkiin toimiin', rarity: 'rare' },
  { id: 'dip-036', type: 'diplomacy', name: 'Panttivanki', description: 'Vakuus sopimukselle', effect: 'Varmista sopimus: rikkominen = heimopäällikkö kuolee', rarity: 'legendary' },
  { id: 'dip-037', type: 'diplomacy', name: 'Salaliittoneuvosto', description: 'Salainen kokous', effect: 'Suunnittele salaa 2 pelaajan kanssa', rarity: 'rare' },
  { id: 'dip-038', type: 'diplomacy', name: 'Julkinen Julistus', description: 'Virallinen kannanotto', effect: '+1 diplomatiapiste kaikkien kanssa TAI -1 yhden kanssa', rarity: 'common' },
  { id: 'dip-039', type: 'diplomacy', name: 'Lunnaiden Maksu', description: 'Vangitun vapautus', effect: 'Vapauta oma heimopäällikkö (5 kultaa)', rarity: 'uncommon' },
  { id: 'dip-040', type: 'diplomacy', name: 'Imperiumin Perillinen', description: 'Kruununperijän nimeäminen', effect: 'Jos kuolet, valitsemasi pelaaja perii puolet', rarity: 'legendary' },
];

// TEKNOLOGIAKORTIT (30 kpl)
export const technologyCards: GameCard[] = [
  // Sotateknologia (10)
  { id: 'tek-001', type: 'technology', name: 'Yhdistetty Jousi', description: 'Parannettu jousitekniikka', effect: '+1 ratsuväen hyökkäys pysyvästi', cost: '2 käsityöläistä', rarity: 'uncommon' },
  { id: 'tek-002', type: 'technology', name: 'Raskaat Ratsut', description: 'Panssaroidut hevoset', effect: '+1 ratsuväen puolustus pysyvästi', cost: '2 käsityöläistä + 2 hevosta', rarity: 'rare' },
  { id: 'tek-003', type: 'technology', name: 'Piirityskone', description: 'Kiviä singottava kone', effect: 'Linnoitukset -1 puolustus sinua vastaan', cost: '3 käsityöläistä', rarity: 'rare' },
  { id: 'tek-004', type: 'technology', name: 'Kiinalainen Ruuti', description: 'Räjähtävät aseet', effect: 'Tuhoa linnoitus 1 vuorossa', cost: '4 käsityöläistä + 2 kultaa', rarity: 'legendary' },
  { id: 'tek-005', type: 'technology', name: 'Teräshaarniska', description: 'Parannettu panssari', effect: '+1 jalkaväen puolustus pysyvästi', cost: '2 käsityöläistä', rarity: 'uncommon' },
  { id: 'tek-006', type: 'technology', name: 'Tulisaattue', description: 'Polttavat nuolet', effect: 'Voit polttaa rakennuksia taistelun aikana', cost: '1 käsityöläinen', rarity: 'common' },
  { id: 'tek-007', type: 'technology', name: 'Piiritystorni', description: 'Muurien valloitus', effect: '+2 hyökkäys linnoituksia vastaan', cost: '3 käsityöläistä', rarity: 'rare' },
  { id: 'tek-008', type: 'technology', name: 'Signaalijärjestelmä', description: 'Savumerkit ja soihdut', effect: 'Reagoi vihollisen liikkeisiin välittömästi', cost: '1 käsityöläinen', rarity: 'uncommon' },
  { id: 'tek-009', type: 'technology', name: 'Mongolijousimies', description: 'Ammunta ratsastaessa', effect: 'Ratsuväki voi hyökätä ja liikkua samalla vuorolla', cost: '2 käsityöläistä + 1 hevonen', rarity: 'rare' },
  { id: 'tek-010', type: 'technology', name: 'Taktinen Koulutus', description: 'Sotilaskoulutus', effect: 'Uudet yksiköt aloittavat +1 tasolla', cost: '2 käsityöläistä', rarity: 'uncommon' },
  
  // Hallinnolliset innovaatiot (10)
  { id: 'tek-011', type: 'technology', name: 'Verojärjestelmä', description: 'Tehokas veronkeruu', effect: '+1 kulta per hallittu kaupunki', cost: '2 käsityöläistä', rarity: 'uncommon' },
  { id: 'tek-012', type: 'technology', name: 'Viestijärjestelmä', description: 'Nopea tiedonkulku', effect: 'Kortteja voi pelata viereisilläkin alueilla', cost: '3 käsityöläistä', rarity: 'rare' },
  { id: 'tek-013', type: 'technology', name: 'Maanviljelystekniikka', description: 'Parannettu sato', effect: '+1 ruoka per viljelysalue', cost: '1 käsityöläinen', rarity: 'common' },
  { id: 'tek-014', type: 'technology', name: 'Kaupankäyntitaito', description: 'Neuvottelutaidot', effect: 'Resurssien vaihto 2:1 sijaan 3:1', cost: '1 käsityöläinen', rarity: 'common' },
  { id: 'tek-015', type: 'technology', name: 'Kirjoitustaito', description: 'Dokumentointi', effect: '+1 diplomatiapiste per vuoro', cost: '2 käsityöläistä', rarity: 'uncommon' },
  { id: 'tek-016', type: 'technology', name: 'Lakinuudistus', description: 'Jasan laki', effect: '-1 kapinariski alueillasi', cost: '2 käsityöläistä', rarity: 'uncommon' },
  { id: 'tek-017', type: 'technology', name: 'Tieverkosto', description: 'Parannetut tiet', effect: '+1 liike kaikille yksiköille omilla alueilla', cost: '3 käsityöläistä + 2 kultaa', rarity: 'rare' },
  { id: 'tek-018', type: 'technology', name: 'Varastointijärjestelmä', description: 'Tehokas logistiikka', effect: 'Resurssit eivät vanhene', cost: '1 käsityöläinen', rarity: 'common' },
  { id: 'tek-019', type: 'technology', name: 'Väestönlaskenta', description: 'Tarkka hallinto', effect: 'Tiedät tarkkaan kaikki resurssisi', cost: '1 käsityöläinen', rarity: 'common' },
  { id: 'tek-020', type: 'technology', name: 'Diplomaattikoulu', description: 'Lähettiläiden koulutus', effect: '+1 kaikkiin diplomatiatoimiin', cost: '2 käsityöläistä', rarity: 'uncommon' },
  
  // Kulttuuriset ja tieteelliset (10)
  { id: 'tek-021', type: 'technology', name: 'Kirjasto', description: 'Tiedon säilytys', effect: 'Vedä 1 ylimääräinen kortti per vuoro', cost: '3 käsityöläistä + 2 kultaa', rarity: 'rare' },
  { id: 'tek-022', type: 'technology', name: 'Tähtitiede', description: 'Navigointi', effect: 'Ohita maasto-olosuhdehaitat liikkuessa', cost: '2 käsityöläistä', rarity: 'uncommon' },
  { id: 'tek-023', type: 'technology', name: 'Lääketiede', description: 'Parantaminen', effect: 'Palauta 1 menetetty yksikkö per vuoro', cost: '2 käsityöläistä', rarity: 'rare' },
  { id: 'tek-024', type: 'technology', name: 'Metallintyöstö', description: 'Parannetut työkalut', effect: '+1 rakentamisnopeus', cost: '2 käsityöläistä', rarity: 'uncommon' },
  { id: 'tek-025', type: 'technology', name: 'Purjehdus', description: 'Merenkulku', effect: 'Voit käyttää merireittejä', cost: '3 käsityöläistä', rarity: 'rare' },
  { id: 'tek-026', type: 'technology', name: 'Arkkitehtuuri', description: 'Rakennustaito', effect: 'Linnoitukset +1 kestävyys', cost: '2 käsityöläistä', rarity: 'uncommon' },
  { id: 'tek-027', type: 'technology', name: 'Kielitaito', description: 'Tulkkaus', effect: '+1 diplomatiapiste muiden heimojen kanssa', cost: '1 käsityöläinen', rarity: 'common' },
  { id: 'tek-028', type: 'technology', name: 'Uskonto', description: 'Hengellinen voima', effect: '+1 moraali kaikille yksiköille', cost: '2 käsityöläistä', rarity: 'uncommon' },
  { id: 'tek-029', type: 'technology', name: 'Filosofia', description: 'Ajatuksen voima', effect: '+1 voittopiste per 3 teknologiakorttia', cost: '2 käsityöläistä', rarity: 'rare' },
  { id: 'tek-030', type: 'technology', name: 'Universaali Tiede', description: 'Kaikki tieto yhteen', effect: 'Teknologinen voitto mahdollinen', cost: '5 käsityöläistä + 5 kultaa', rarity: 'legendary' },
];

// RESURSSIKORTIT (50 kpl)
export const resourceCards: GameCard[] = [
  // Hevoset (10)
  { id: 'res-001', type: 'resource', name: 'Mongolihevoset', description: '3 hevosta', effect: 'Rekrytoi ratsuväkeä', rarity: 'common' },
  { id: 'res-002', type: 'resource', name: 'Villihevoslauma', description: '5 hevosta', effect: 'Suuri hevosvara', rarity: 'uncommon' },
  { id: 'res-003', type: 'resource', name: 'Sotahevoset', description: '2 koulutettua hevosta', effect: '+1 ratsuväen hyökkäys', rarity: 'uncommon' },
  { id: 'res-004', type: 'resource', name: 'Hevostarha', description: '1 hevonen per vuoro', effect: 'Jatkuva hevostuotanto', rarity: 'rare' },
  { id: 'res-005', type: 'resource', name: 'Steppin Ori', description: '1 erityishevonen', effect: 'Heimopäällikön ratsuksi (+1 liike)', rarity: 'rare' },
  { id: 'res-006', type: 'resource', name: 'Hevosenhoito', description: '2 hevosta + hoito', effect: 'Hevoset eivät kuluta ruokaa', rarity: 'uncommon' },
  { id: 'res-007', type: 'resource', name: 'Varsalauma', description: '4 hevosta', effect: 'Uusia hevosia', rarity: 'common' },
  { id: 'res-008', type: 'resource', name: 'Karavaanihevoset', description: '3 hevosta', effect: 'Kauppakäyttöön', rarity: 'common' },
  { id: 'res-009', type: 'resource', name: 'Persialainen Arabihevonen', description: '2 nopeaa hevosta', effect: '+2 ratsuväen liike', rarity: 'rare' },
  { id: 'res-010', type: 'resource', name: 'Legendaarinen Ori', description: '1 maaginen hevonen', effect: 'Heimopäällikkö +2 kaikissa taisteluissa', rarity: 'legendary' },
  
  // Kulta (10)
  { id: 'res-011', type: 'resource', name: 'Kultakolikot', description: '3 kultaa', effect: 'Maksuväline', rarity: 'common' },
  { id: 'res-012', type: 'resource', name: 'Aarrearkku', description: '5 kultaa', effect: 'Suuri kultavara', rarity: 'uncommon' },
  { id: 'res-013', type: 'resource', name: 'Silkkiraha', description: '4 kultaa', effect: 'Kiinalainen maksuväline', rarity: 'uncommon' },
  { id: 'res-014', type: 'resource', name: 'Ryöstetty Rikkaus', description: '6 kultaa', effect: 'Sotasaalis', rarity: 'rare' },
  { id: 'res-015', type: 'resource', name: 'Kauppiaan Voitot', description: '3 kultaa + 1 per kauppareitti', effect: 'Kauppavoitot', rarity: 'uncommon' },
  { id: 'res-016', type: 'resource', name: 'Tributti', description: '2 kultaa per vasalli', effect: 'Alaisilta saatu', rarity: 'rare' },
  { id: 'res-017', type: 'resource', name: 'Kultakaivos', description: '2 kultaa per vuoro', effect: 'Jatkuva kultatuotanto', rarity: 'legendary' },
  { id: 'res-018', type: 'resource', name: 'Korruptiorahat', description: '4 kultaa', effect: 'Osta vaikutusvaltaa', rarity: 'uncommon' },
  { id: 'res-019', type: 'resource', name: 'Verotulo', description: '1 kulta per hallittu alue', effect: 'Verojärjestelmästä', rarity: 'common' },
  { id: 'res-020', type: 'resource', name: 'Khaanin Aarre', description: '10 kultaa', effect: 'Valtava rikkaus', rarity: 'legendary' },
  
  // Ruoka (10)
  { id: 'res-021', type: 'resource', name: 'Viljasato', description: '4 ruokaa', effect: 'Armeijan ylläpito', rarity: 'common' },
  { id: 'res-022', type: 'resource', name: 'Karjan Liha', description: '3 ruokaa', effect: 'Proteiinivarasto', rarity: 'common' },
  { id: 'res-023', type: 'resource', name: 'Kuivattu Ruoka', description: '5 ruokaa', effect: 'Ei vanhene', rarity: 'uncommon' },
  { id: 'res-024', type: 'resource', name: 'Hedelmätarha', description: '2 ruokaa per vuoro', effect: 'Jatkuva tuotanto', rarity: 'rare' },
  { id: 'res-025', type: 'resource', name: 'Kalastussaalis', description: '4 ruokaa', effect: 'Jokialueilta', rarity: 'uncommon' },
  { id: 'res-026', type: 'resource', name: 'Ruokavarasto', description: '6 ruokaa', effect: 'Hätävarasto', rarity: 'uncommon' },
  { id: 'res-027', type: 'resource', name: 'Metsästyssaalis', description: '2 ruokaa', effect: 'Metsästyksestä', rarity: 'common' },
  { id: 'res-028', type: 'resource', name: 'Maataloustekniikka', description: '+1 ruoka per viljelysalue', effect: 'Parannettu sato', rarity: 'rare' },
  { id: 'res-029', type: 'resource', name: 'Riisipellot', description: '3 ruokaa', effect: 'Kiinalaisesta viljelystä', rarity: 'common' },
  { id: 'res-030', type: 'resource', name: 'Ylenpalttisuus', description: '8 ruokaa', effect: 'Jättimäinen sato', rarity: 'rare' },
  
  // Käsityöläiset (10)
  { id: 'res-031', type: 'resource', name: 'Sepät', description: '2 käsityöläistä', effect: 'Aseiden valmistus', rarity: 'common' },
  { id: 'res-032', type: 'resource', name: 'Kiinalaiset Insinöörit', description: '3 käsityöläistä', effect: 'Piirityskoneiden rakentajat', rarity: 'uncommon' },
  { id: 'res-033', type: 'resource', name: 'Persialaiset Mestarit', description: '4 käsityöläistä', effect: 'Korkealaatuista työtä', rarity: 'rare' },
  { id: 'res-034', type: 'resource', name: 'Kutojat', description: '2 käsityöläistä', effect: 'Tekstiilituotanto', rarity: 'common' },
  { id: 'res-035', type: 'resource', name: 'Rakentajat', description: '3 käsityöläistä', effect: 'Linnoitusten pystytys', rarity: 'uncommon' },
  { id: 'res-036', type: 'resource', name: 'Keramiikantekijät', description: '1 käsityöläinen', effect: 'Kauppatavaraa', rarity: 'common' },
  { id: 'res-037', type: 'resource', name: 'Hopeapajat', description: '2 käsityöläistä', effect: 'Korujen valmistus', rarity: 'uncommon' },
  { id: 'res-038', type: 'resource', name: 'Mestariaseseppä', description: '1 legendaarinen käsityöläinen', effect: '+1 kaikille aseille', rarity: 'legendary' },
  { id: 'res-039', type: 'resource', name: 'Pajagilda', description: '2 käsityöläistä per vuoro', effect: 'Jatkuva tuotanto', rarity: 'legendary' },
  { id: 'res-040', type: 'resource', name: 'Oppipojat', description: '1 käsityöläinen', effect: 'Aloittelija', rarity: 'common' },
  
  // Karja ja muut (10)
  { id: 'res-041', type: 'resource', name: 'Lammaslauma', description: '4 karjaa', effect: 'Villa ja liha', rarity: 'common' },
  { id: 'res-042', type: 'resource', name: 'Nautakarja', description: '3 karjaa', effect: 'Vetojuhtia ja lihaa', rarity: 'common' },
  { id: 'res-043', type: 'resource', name: 'Kamelikaravaani', description: '5 karjaa', effect: 'Aavikkokauppaan', rarity: 'uncommon' },
  { id: 'res-044', type: 'resource', name: 'Vuohilauma', description: '3 karjaa', effect: 'Maitoa ja nahkaa', rarity: 'common' },
  { id: 'res-045', type: 'resource', name: 'Jakintyypit', description: '2 karjaa', effect: 'Vuoristoeläimiä', rarity: 'uncommon' },
  { id: 'res-046', type: 'resource', name: 'Silkkiperhoskasvattamo', description: 'Erikoistuote', effect: '+2 kultaa kaupasta', rarity: 'rare' },
  { id: 'res-047', type: 'resource', name: 'Mausteet', description: 'Harvinaisuus', effect: '+3 kultaa vaihdettaessa', rarity: 'rare' },
  { id: 'res-048', type: 'resource', name: 'Turkikset', description: 'Arvokas', effect: '+2 kultaa kaupasta', rarity: 'uncommon' },
  { id: 'res-049', type: 'resource', name: 'Jalokivet', description: 'Timantteja ja rubiineja', effect: '+4 kultaa', rarity: 'rare' },
  { id: 'res-050', type: 'resource', name: 'Khaanin Tiara', description: 'Kuninkaalliset jalokivet', effect: '+5 voittopistettä', rarity: 'legendary' },
];

// Kaikki kortit yhdessä
export const allCards: GameCard[] = [
  ...strategyCards,
  ...diplomacyCards,
  ...technologyCards,
  ...resourceCards,
];

// Korttityyppien värit ja kuvaukset
export const cardTypeInfo = {
  strategy: { 
    name: 'Strategiakortti', 
    color: 'bg-red-600', 
    borderColor: 'border-red-700',
    icon: '⚔️',
    count: 60 
  },
  diplomacy: { 
    name: 'Diplomatiakortti', 
    color: 'bg-blue-600', 
    borderColor: 'border-blue-700',
    icon: '🤝',
    count: 40 
  },
  technology: { 
    name: 'Teknologiakortti', 
    color: 'bg-green-600', 
    borderColor: 'border-green-700',
    icon: '⚙️',
    count: 30 
  },
  resource: { 
    name: 'Resurssikortti', 
    color: 'bg-amber-600', 
    borderColor: 'border-amber-700',
    icon: '📦',
    count: 50 
  },
};

export const rarityInfo = {
  common: { name: 'Yleinen', color: 'bg-gray-500', symbol: '●' },
  uncommon: { name: 'Epätavallinen', color: 'bg-green-500', symbol: '●●' },
  rare: { name: 'Harvinainen', color: 'bg-blue-500', symbol: '●●●' },
  legendary: { name: 'Legendaarinen', color: 'bg-purple-500', symbol: '★' },
};
