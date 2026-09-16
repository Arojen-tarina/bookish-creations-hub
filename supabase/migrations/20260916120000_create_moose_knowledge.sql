CREATE TABLE public.moose_knowledge (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('rules', 'lore')),
  title_fi TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_fi TEXT NOT NULL,
  content_en TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.moose_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read Moose knowledge"
ON public.moose_knowledge
FOR SELECT
USING (true);

CREATE INDEX moose_knowledge_category_idx ON public.moose_knowledge (category);
CREATE INDEX moose_knowledge_keywords_idx ON public.moose_knowledge USING GIN (keywords);

INSERT INTO public.moose_knowledge (id, category, title_fi, title_en, content_fi, content_en, keywords) VALUES
('rules-overview', 'rules', 'Pelin idea ja vuoro', 'Game concept and turn',
 'Arojen Tarinat on vuoropohjainen strategiapeli vuodelta 1206. Pelaaja johtaa yhtä neljästä suurvallasta, hallitsee provinsseja, kerää resursseja, rakentaa, rekrytoi armeijoita, käy diplomatiaa ja pelaa kortteja. Jokainen vuosi on yksi vuoro, joka jakautuu kuuteen vaiheeseen: Resurssit, Kortit, Liike, Taistelu, Rakenna ja Lopeta.',
 'Tales of the Steppe is a turn-based strategy game set in 1206. The player leads one of four great powers, controls provinces, gathers resources, builds, recruits armies, conducts diplomacy, and plays cards. Each year is one turn divided into six phases: Resources, Cards, Move, Battle, Build, and End.',
 ARRAY['vuoro', 'vaihe', 'turn', 'phase', 'game', 'peli']),
('rules-victory', 'rules', 'Voittoehdot', 'Victory conditions',
 'Pelaajan vuoron lopussa tarkistetaan viisi voittotietä. Sotilasvoitto tulee kaikkien vihollisten pääkaupunkien valtauksesta tai vähintään 30 provinssin hallinnasta. Talousvoitto vaatii vähintään 500 kultaa, enemmistön Silkkitien kauppasolmuista ja kultarajan säilyttämisen vähintään kolme peräkkäistä vuoroa. Teknologiavoitto vaatii vähintään 5 teknologiakorttia, diplomaattivoitto vähintään 100 vaikutusvaltaa tai liiton kaikkien elossa olevien vihollisten kanssa, ja kulttuurivoitto vähintään 60 arvovaltaa Ihmeistä.',
 'At the end of the player turn, five victory paths are checked. Military victory comes from capturing every enemy capital or controlling at least 30 provinces. Economic victory requires at least 500 gold, a majority of Silk Road trade nodes, and holding the gold threshold for at least three consecutive turns. Technology victory requires at least 5 technology cards, diplomatic victory at least 100 influence or an alliance with every surviving enemy, and cultural victory at least 60 prestige from Wonders.',
 ARRAY['voitto', 'sotilas', 'talous', 'teknologia', 'diplomatia', 'kulttuuri', 'victory', 'military', 'economic', 'technology', 'diplomatic', 'culture']),
('rules-factions', 'rules', 'Fraktiot ja aloitus', 'Factions and starting setup',
 'Pelattavat fraktiot ovat mongolit, Song-dynastia, Venäjän ruhtinaskunnat ja Khwarezmin valtakunta. Ne sijoittuvat kartan kulmiin: Rus luoteeseen, mongolit koilliseen, Song kaakkoon ja Khwarezm lounaaseen. Jokainen aloittaa 12 provinssilla, pääkaupungilla ja yhdellä perustaja-armeijalla.',
 'The playable factions are the Mongols, Song Dynasty, Rus Principalities, and Khwarezmian Empire. They begin in the corners of the map: Rus in the northwest, Mongols in the northeast, Song in the southeast, and Khwarezm in the southwest. Each starts with 12 provinces, a capital, and one founder army.',
 ARRAY['fraktio', 'valtakunta', 'mongolit', 'song', 'rus', 'khwarezm', 'faction', 'realm', 'mongols']),
('rules-combat', 'rules', 'Armeijat ja taistelu', 'Armies and combat',
 'Armeijassa on ratsuväkeä, jalkaväkeä ja mahdollisesti piiritysyksiköitä sekä moraali ja tarjonta. Taistelu käynnistyy, kun armeija liikkuu vihollisen provinssiin. Voima lasketaan ratsuväestä, jalkaväestä, piirityksestä ja bonuksista sekä nopanheitosta; suurempi tulos voittaa. Kevyt ratsuväki hallitsee avointa maastoa, mutta pitkä piiritys vaatii kuria ja piirityskoneita.',
 'An army contains cavalry, infantry, and possibly siege units, plus morale and supply. Battle begins when an army moves into an enemy province. Strength is calculated from cavalry, infantry, siege, and bonuses plus a dice roll; the higher result wins. Light cavalry dominates open ground, while a long siege requires discipline and proper siege machines.',
 ARRAY['taistelu', 'armeija', 'ratsuväki', 'jalkaväki', 'piiritys', 'combat', 'army', 'cavalry', 'siege']),
('rules-resources', 'rules', 'Resurssit ja Silkkitie', 'Resources and the Silk Road',
 'Resursseja ovat kulta, ruoka, hevoset, miesvoima ja käsityöläiset. Lisäksi vaikutusvalta toimii diplomaattisen voiton mittarina ja arvovalta kulttuurivoiton mittarina. Silkkitien kauppasolmut tuottavat lisätuloa ja vaikutusvaltaa, ja niiden enemmistö tarvitaan talousvoittoon.',
 'Resources are gold, food, horses, manpower, and artisans. Influence is the diplomatic victory meter, while prestige is the cultural victory meter. Silk Road trade nodes generate extra income and influence, and controlling a majority is required for economic victory.',
 ARRAY['resurssi', 'kulta', 'ruoka', 'hevoset', 'kauppa', 'silkkitie', 'resource', 'gold', 'trade', 'silk road']),
('rules-diplomacy', 'rules', 'Diplomatia ja kortit', 'Diplomacy and cards',
 'Diplomatia-välilehdeltä voi ehdottaa hyökkäämättömyyttä, kauppaa, liittoa tai rauhaa ja julistaa sotaa. Kortit-vaiheessa nostetaan kortti pakasta, ja kortteja voi pelata kädestä milloin tahansa vuoron aikana hyökkäyksen, puolustuksen, kullan, ruoan tai muiden bonusten saamiseksi.',
 'From the Diplomacy tab, players can propose non-aggression, trade, alliance, or peace treaties and declare war. During the Cards phase, draw a card from the deck. Cards can be played from hand at any time during the turn for attack, defense, gold, food, and other bonuses.',
 ARRAY['diplomatia', 'liitto', 'rauha', 'kortti', 'diplomacy', 'alliance', 'peace', 'card']),
('lore-cosmic-song', 'lore', 'Kosminen laulu', 'The Cosmic Song',
 'Handgai, Suuri Hirvas, loi maailman ja ohjasi elämän syntyä. Maailmankaikkeus laulettiin olemassaoloon, ja jokainen kivi, eläin ja ihminen on osa jumalallista sävelmää.',
 'Handgai, the Great Stag, shaped the world and guided life into being. The universe was sung into existence, and every stone, animal, and person remains part of the divine melody.',
 ARRAY['hirvas', 'handgai', 'kosminen', 'laulu', 'world', 'cosmic', 'song', 'stag']),
('lore-divide', 'lore', 'Suuri kahtiajako', 'The Great Divide',
 'Suuri joki jakaa maailman aroihin ja etelän kiviseen valtakuntaan. Pohjoisen liikkuvat klaanit kulkevat karjoineen ja työpajoineen, kun taas etelä nojaa maanviljelyyn, byrokratiaan, paperiin, ammattiarmeijoihin ja valtaviin linnoituksiin.',
 'The Great River divides the world into the steppe and the southern stone empire. Northern mobile clans travel with herds and workshops, while the south relies on farming, bureaucracy, paper, professional armies, and immense fortifications.',
 ARRAY['joki', 'aro', 'etelä', 'kahtiajako', 'river', 'steppe', 'south', 'divide']),
('lore-pantheon', 'lore', 'Eläinten pantheon', 'The Animal Pantheon',
 'Kotka on jumalallinen omatunto, karhu edustaa voimaa ja pidättyväisyyttä, pöllö on ehdoton tabu, kettu on onnettomuuden enne ja rotta taudin, mädän ja petoksen symboli. Handgai on korkein luoja.',
 'The Eagle is the divine conscience, the Bear represents strength and restraint, the Owl is an absolute taboo, the Fox is an omen of disaster, and the Rat represents disease, rot, and treachery. Handgai is the highest creator.',
 ARRAY['jumalat', 'eläimet', 'kotka', 'karhu', 'pöllö', 'kettu', 'rotta', 'gods', 'animals', 'eagle', 'bear', 'owl', 'fox', 'rat']),
('lore-characters', 'lore', 'Rajaseudun henkilöt', 'People of the Borderlands',
 'Temüü on herkkä ja älykäs perillinen, joka voittaa tyranni-isänsä Ganbataarin kaksintaistelussa ja yhdistää heimot. Ganbataar hallitsee pelolla. Qorchi on kosmisten voimien tulkki ja shamaani, joka ohjaa Temüüta kohti valtaa. Bolormaa tuo tiedon, diplomatian ja uudistukset.',
 'Temüü is a sensitive and intelligent heir who defeats his tyrant father Ganbataar in a duel and unites the clans. Ganbataar rules through fear. Qorchi is a shaman and interpreter of cosmic forces who guides Temüü toward power. Bolormaa brings learning, diplomacy, and reform.',
 ARRAY['temüü', 'ganbataar', 'qorchi', 'bolormaa', 'hahmo', 'character', 'shaman', 'reformer']),
('lore-ambush', 'lore', 'Väijytys ja sodan opit', 'Ambush and lessons of war',
 'Batu houkutteli eteläisen armeijan näennäisellä perääntymisellä metsään ja iski sen sivustaan palavilla nuolilla. Piirityksen oppi oli selvä: kevyt ratsuväki hallitsee avomaata, mutta pitkä piiritys vaatii kuria, tiedustelua ja oikeita koneita.',
 'Batu lured a southern army into a forest with a feigned retreat and struck its flank with burning arrows. The lesson of siege was clear: light cavalry dominates open ground, but a long siege requires discipline, scouting, and proper machines.',
 ARRAY['batu', 'väijytys', 'metsä', 'nuoli', 'ambush', 'forest', 'siege']),
('lore-ending', 'lore', 'Rauha ja tasapaino', 'Peace and balance',
 'Temüü ymmärsi, ettei mikään armeija ole voittamaton eikä dynastia ikuinen. Hän palasi Ulanbataariin ja valitsi rauhan, väestön kasvun ja yhtenäisyyden loputtoman valloituksen sijaan. Tarinat yhdistävät kansoja enemmän kuin voitto tai tappio.',
 'Temüü learned that no army is invincible and no dynasty lasts forever. He returned to Ulanbataar and chose peace, population growth, and unity over endless conquest. Stories bind peoples together more deeply than victory or defeat.',
 ARRAY['rauha', 'tasapaino', 'ulanbataar', 'tarina', 'peace', 'balance', 'stories']);