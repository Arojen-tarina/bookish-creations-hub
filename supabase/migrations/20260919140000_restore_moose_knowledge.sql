CREATE TABLE IF NOT EXISTS public.moose_knowledge (
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

DROP POLICY IF EXISTS "Anyone can read Moose knowledge" ON public.moose_knowledge;
CREATE POLICY "Anyone can read Moose knowledge"
ON public.moose_knowledge
FOR SELECT
USING (true);

CREATE INDEX IF NOT EXISTS moose_knowledge_category_idx ON public.moose_knowledge (category);
CREATE INDEX IF NOT EXISTS moose_knowledge_keywords_idx ON public.moose_knowledge USING GIN (keywords);

INSERT INTO public.moose_knowledge (id, category, title_fi, title_en, content_fi, content_en, keywords) VALUES
('rules-overview', 'rules', 'Pelin idea ja vuoro', 'Game concept and turn',
 'Arojen Tarinat on vuoropohjainen strategiapeli vuodelta 1206. Jokainen vuosi on yksi vuoro, joka jakautuu kuuteen vaiheeseen: Resurssit, Kortit, Liike, Taistelu, Rakenna ja Lopeta.',
 'Tales of the Steppe is a turn-based strategy game set in 1206. Each year is one turn divided into six phases: Resources, Cards, Move, Battle, Build, and End.',
 ARRAY['vuoro', 'vaihe', 'turn', 'phase', 'game', 'peli']),
('rules-victory', 'rules', 'Voittoehdot', 'Victory conditions',
 'Sotilasvoitto tulee kaikkien vihollisten pääkaupunkien valtauksesta tai vähintään 130 provinssin hallinnasta. Talousvoitto vaatii vähintään 2000 kultaa, enemmistön Silkkitien kauppasolmuista ja viisi peräkkäistä kultarajavuoroa. Teknologiavoitto vaatii 5 teknologiakorttia, diplomaattivoitto 100 vaikutusvaltaa tai vähintään 2 liittolaista, ja kulttuurivoitto 60 arvovaltaa Ihmeistä.',
 'Military victory comes from capturing every enemy capital or controlling at least 130 provinces. Economic victory requires at least 2000 gold, a majority of Silk Road trade nodes, and a five-turn treasury streak. Technology requires 5 technology cards, diplomacy requires 100 influence or at least 2 allies, and culture requires 60 prestige from Wonders.',
 ARRAY['voitto', 'sotilas', 'talous', 'teknologia', 'diplomatia', 'kulttuuri', 'victory', 'military', 'economic', 'technology', 'diplomatic', 'culture']),
('rules-combat', 'rules', 'Armeijat ja taistelu', 'Armies and combat',
 'Armeijassa on ratsuväkeä, jalkaväkeä ja mahdollisesti piiritysyksiköitä. Taistelu käynnistyy, kun armeija liikkuu vihollisen provinssiin. Voima lasketaan yksiköistä, bonuksista ja nopanheitosta; suurempi tulos voittaa.',
 'An army contains cavalry, infantry, and possibly siege units. Battle begins when an army moves into an enemy province. Strength is calculated from units, bonuses, and a dice roll; the higher result wins.',
 ARRAY['taistelu', 'armeija', 'ratsuväki', 'jalkaväki', 'piiritys', 'combat', 'army', 'cavalry', 'siege']),
('rules-resources', 'rules', 'Resurssit ja Silkkitie', 'Resources and the Silk Road',
 'Resursseja ovat kulta, ruoka, hevoset, miesvoima ja käsityöläiset. Vaikutusvalta toimii diplomaattisen voiton mittarina ja arvovalta kulttuurivoiton mittarina. Silkkitien kauppasolmut tuottavat lisätuloa ja vaikutusvaltaa.',
 'Resources are gold, food, horses, manpower, and artisans. Influence is the diplomatic victory meter and prestige is the cultural victory meter. Silk Road trade nodes generate extra income and influence.',
 ARRAY['resurssi', 'kulta', 'ruoka', 'hevoset', 'kauppa', 'silkkitie', 'resource', 'gold', 'trade', 'silk road']),
('lore-cosmic-song', 'lore', 'Kosminen laulu', 'The Cosmic Song',
 'Handgai, Suuri Hirvas, loi maailman ja ohjasi elämän syntyä. Maailmankaikkeus laulettiin olemassaoloon, ja jokainen kivi, eläin ja ihminen on osa sävelmää.',
 'Handgai, the Great Stag, shaped the world and guided life into being. The universe was sung into existence, and every stone, animal, and person remains part of the divine melody.',
 ARRAY['hirvas', 'handgai', 'kosminen', 'laulu', 'world', 'cosmic', 'song', 'stag']),
('lore-characters', 'lore', 'Rajaseudun henkilöt', 'People of the Borderlands',
 'Temüü yhdistää heimot. Ganbataar hallitsee pelolla, Qorchi on shamaani ja kosmisten voimien tulkki, ja Bolormaa tuo tiedon, diplomatian ja uudistukset.',
 'Temüü unites the clans. Ganbataar rules through fear, Qorchi is a shaman and interpreter of cosmic forces, and Bolormaa brings learning, diplomacy, and reform.',
 ARRAY['temüü', 'ganbataar', 'qorchi', 'bolormaa', 'hahmo', 'character', 'shaman', 'reformer'])
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  title_fi = EXCLUDED.title_fi,
  title_en = EXCLUDED.title_en,
  content_fi = EXCLUDED.content_fi,
  content_en = EXCLUDED.content_en,
  keywords = EXCLUDED.keywords,
  updated_at = now();