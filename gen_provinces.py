#!/usr/bin/env python3
"""Generoi täyden heksaruudukon provinssit ProvinceData.ts:ään.
- Yksi kaupunki per ruutu (neutraali tai faktion omistama)
- Faktiot laudan reunoilla, tasaisesti jaettuna; neutraalit keskellä
- Naapuruudet lasketaan odd-r-heksalayoutilla
"""
import unicodedata, re, json

NCOLS, NROWS = 13, 8            # 13x8 = 104 ruutua
# Koordinaatit LAUTA-avaruudessa (0..BOARD_SIZE=130), suoraan lautakuvan
# heksavyöhykkeelle. Vyöhyke mitattu kuvasta: y ~15.5%..84.4%, x ~2%..98%.
# Keskitetään kaupungit KOKONAISTEN heksien sisälle -> reunoihin puolen
# heksan sisennys, jottei yksikään kaupunki jää katkaistun reunaheksan päälle.
BOARD_SIZE = 130.0
CX0, CX1 = 9.0, 121.0    # vasemman parillisrivin .. oikean paritonrivin keskipiste
CY0, CY1 = 26.0, 104.0   # ylin .. alin rivi
dx = (CX1 - CX0) / (NCOLS - 1 + 0.5)
dy = (CY1 - CY0) / (NROWS - 1)

def cell_xy(c, r):
    x = CX0 + c * dx + (r % 2) * (dx / 2)
    y = CY0 + r * dy
    return round(x, 1), round(y, 1)

# ---- odd-r offset -naapurit ----
def neighbors(c, r):
    if r % 2 == 0:
        deltas = [(-1,0),(1,0),(-1,-1),(0,-1),(-1,1),(0,1)]
    else:
        deltas = [(-1,0),(1,0),(0,-1),(1,-1),(0,1),(1,1)]
    out = []
    for dc, dr in deltas:
        nc, nr = c+dc, r+dr
        if 0 <= nc < NCOLS and 0 <= nr < NROWS:
            out.append((nc, nr))
    return out

# ---- faktioiden siemenpisteet reunoilla (c,r) ----
# Vain 4 faktiota (sprite-arkin mukaiset): Mongolit, Kiina (song), Rus, Persia (khwarezm).
# Jin, Xixia ja Kipchak poistettu — niiden alueet jaavat neutraaleiksi.
FACTION_SEEDS = {
    'rus':      (1, 1),    # vasen-ylä  (Novgorod)
    'mongol':   (11, 1),   # oikea-ylä  (Karakorum / paimentolaiset)
    'song':     (11, 6),   # oikea-ala  (Kiina)
    'khwarezm': (1, 6),    # vasen-ala  (Persia / Khwarezm)
}
FACTION_CAP = 12  # maksimi provinssia per faktio
FACTION_RADIUS = 4  # vain tama etaisyys siemenesta kuuluu faktiolle (muuten neutraali)

def on_ring(c, r):
    return c <= 1 or c >= NCOLS-2 or r <= 1 or r >= NROWS-2

def grid_dist(a, b):
    # karkea heksaetäisyys offset-koordinaateissa
    return abs(a[0]-b[0]) + abs(a[1]-b[1])

# ---- terrain sijainnin mukaan (mukailee lautakuvaa) ----
def terrain_for(c, r):
    west = c / (NCOLS-1)
    north = r / (NROWS-1)
    # vuoristo: vasen reuna ja keskinen vyö
    if c == 0 and r not in (0, NROWS-1):
        return 'mountain'
    if c in (4,5) and 2 <= r <= 5 and (c+r) % 3 == 0:
        return 'mountain'
    # NW rus = metsä
    if west < 0.25 and north < 0.4:
        return 'forest'
    # SW = suo/ruohomaa
    if west < 0.2 and north > 0.6:
        return 'marsh'
    # itä (Kiina) = viljelymaa
    if west > 0.78:
        return 'farmland' if north > 0.4 else 'hills'
    if west > 0.62:
        return 'grassland' if north > 0.5 else 'steppe'
    # pohjoinen = steppi
    if north < 0.3:
        return 'steppe'
    # eteläkeskusta = ruohomaa
    if north > 0.72:
        return 'grassland'
    # keskusta = aavikko/steppi
    return 'desert' if 0.35 < west < 0.62 and 0.3 < north < 0.7 else 'steppe'

TRADE_BY_TERRAIN = {
    'steppe': 'horses', 'grassland': 'livestock', 'forest': 'fur',
    'farmland': 'grain', 'plains': 'silk', 'desert': 'salt',
    'marsh': 'grain', 'mountain': 'iron', 'taiga': 'fur', 'hills': 'iron',
}

# ---- nimipoolit (oikeita alueellisia nimiä) ----
CAPITAL_NAMES = {
    'rus': ('novgorod', 'Novgorod'),
    'mongol': ('karakorum', 'Karakorum'),
    'jin': ('zhongdu', 'Zhongdu'),
    'song': ('hangzhou', "Lin'an"),
    'xixia': ('xingqing', 'Xingqing'),
    'khwarezm': ('samarkand', 'Samarkand'),
    'kipchak': ('sarkel', 'Sarkel'),
}
NAME_POOL = [
    'Pihkova','Tver','Vladimir','Smolensk','Rjazan','Tšernigov','Kiova','Polotsk','Murom','Suzdal',
    'Bulgar','Sarkel','Itil','Tmutarakan','Belgorod','Galitš','Vitebsk','Minsk','Kursk','Perejaslav',
    'Otrar','Buhara','Urgentš','Merv','Herat','Balkh','Kašgar','Taškent','Talas','Nišapur',
    'Tabriz','Ray','Isfahan','Ganja','Tbilisi','Derbent','Shirvan','Ardabil','Kazvin','Gorgan',
    'Altai','Baikal','Kerulen','Gobi','Dzungaria','Tuva','Selenga','Orhon','Hangai','Uvs',
    'Dunhuang','Turfan','Hami','Kuqa','Khotan','Yarkand','Aksu','Lop','Ejin','Etsina',
    'Datong','Taiyuan','Yanjing','Baoding','Jinan','Kaifeng','Luoyang','Chang’an','Xian','Fenzhou',
    'Hangzhou','Suzhou','Ningbo','Fuzhou','Quanzhou','Nanchang','Changsha','Jiangling','Ezhou','Chengdu',
    'Lhasa','Xigatse','Qamdo','Nagqu','Golmud','Dali','Kunming','Lijiang','Zhongwei','Lanzhou',
    'Kama','Vjatka','Ustjug','Beloozero','Ladoga','Pihkova-Itä','Torzhok','Rostov','Uglitš','Kostroma',
    'Almalik','Suyab','Barskoon','Osh','Khujand','Termez','Ghazna','Bamiyan','Kabul','Kandahar',
    'Emil','Beshbalik','Karashar','Yiwu','Shazhou','Ganzhou','Suzhou-Länsi','Liangzhou','Xiliang','Wuwei',
]

def slug(name):
    s = unicodedata.normalize('NFKD', name).encode('ascii','ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+','_', s).strip('_').lower()
    return s or 'prov'

# ================= GENEROINTI =================
cells = [(c, r) for r in range(NROWS) for c in range(NCOLS)]

# 1) faktio-omistus: reunaruutu kuuluu lähimmälle siemenelle VAIN jos tarpeeksi
#    lähellä (FACTION_RADIUS). Muuten neutraali -> poistettujen faktioiden
#    alueet (Jin NE, Xixia etelä-keskusta) jäävät neutraaleiksi.
owner = {}
for (c, r) in cells:
    if on_ring(c, r):
        best, bd = min(((f, grid_dist((c,r), s)) for f, s in FACTION_SEEDS.items()), key=lambda t: t[1])
        owner[(c,r)] = best if bd <= FACTION_RADIUS else None
    else:
        owner[(c,r)] = None

# 2) tasapainota: rajaa jokainen faktio FACTION_CAP:iin (kauimmat -> neutraali)
from collections import defaultdict
byfac = defaultdict(list)
for cell, o in owner.items():
    if o: byfac[o].append(cell)
for fac, clist in byfac.items():
    seed = FACTION_SEEDS[fac]
    clist.sort(key=lambda cell: grid_dist(cell, seed))
    for cell in clist[FACTION_CAP:]:
        owner[cell] = None

# 2b) tasapainota alaspäin jääneet faktiot: ota lähimmät neutraalit reunaruudut
FACTION_MIN = 7
def count(fac):
    return sum(1 for o in owner.values() if o == fac)
for fac, seed in FACTION_SEEDS.items():
    while count(fac) < FACTION_MIN:
        # ota vain lähellä siementä olevia neutraaleja reunaruutuja (radius+1),
        # jottei poistettujen faktioiden alue täyty
        cands = [cell for cell,o in owner.items()
                 if o is None and on_ring(*cell) and grid_dist(cell, seed) <= FACTION_RADIUS + 1]
        if not cands:
            break
        pick = min(cands, key=lambda cell: grid_dist(cell, seed))
        owner[pick] = fac

# 3) pääkaupungit: kunkin faktion siementä lähin ruutu
capital_cell = {}
for fac, seed in FACTION_SEEDS.items():
    owned = [cell for cell,o in owner.items() if o==fac]
    if owned:
        capital_cell[fac] = min(owned, key=lambda cell: grid_dist(cell, seed))

# 4) nimet + id:t
used_ids = set()
pool = list(NAME_POOL)
pi = 0
prov = {}   # (c,r) -> dict
for (c, r) in cells:
    o = owner[(c,r)]
    if o and capital_cell.get(o) == (c,r):
        pid, name = CAPITAL_NAMES[o]
    else:
        name = pool[pi] if pi < len(pool) else f'Alue {pi+1}'
        pi += 1
        pid = slug(name)
        base = pid; k = 2
        while pid in used_ids:
            pid = f'{base}_{k}'; k += 1
    used_ids.add(pid)
    x, y = cell_xy(c, r)
    prov[(c,r)] = {'id': pid, 'name': name, 'owner': o, 'x': x, 'y': y,
                   'terrain': terrain_for(c,r), 'cap': capital_cell.get(o)==(c,r)}

# 5) silkkitie: keskirivi (r=4) lännestä itään
silk_cells = [(c,4) for c in range(NCOLS)]
for cell in silk_cells:
    prov[cell]['silk'] = True

# 6) region (karkea) sijainnin mukaan
def region_for(c, r):
    west = c/(NCOLS-1); north = r/(NROWS-1)
    if west < 0.28 and north < 0.45: return 'rus'
    if west < 0.20 and north > 0.60: return 'khwarezm'
    if west < 0.28: return 'kipchak'
    if west > 0.75 and north > 0.55: return 'song_china'
    if west > 0.72: return 'jin_china'
    if north < 0.35: return 'mongolia'
    if 0.40 < west < 0.72 and north > 0.55: return 'xixia'
    return 'central_asia'

# 7) tilastot (deterministiset)
def stats(cell):
    p = prov[cell]
    c, r = cell
    cap = p['cap']
    h = (c*7 + r*13) % 5
    baseTax = 2 + (h % 3) + (3 if cap else 0)
    baseMan = 3 + ((c+r) % 4) + (4 if cap else 0)
    dev = 1 + ((c*r) % 3) + (2 if cap else 0)
    fort = (2 if cap else (1 if (c+r) % 5 == 0 and p['owner'] else 0))
    return baseTax, baseMan, min(5,dev), min(3,fort)

# ---- kirjoita provinssioliot ----
def js(v):
    return json.dumps(v, ensure_ascii=False)

prov_lines = []
order = sorted(prov.keys(), key=lambda cr:(cr[1],cr[0]))
for cell in order:
    p = prov[cell]
    baseTax, baseMan, dev, fort = stats(cell)
    c, r = cell
    opts = [f"baseTax: {baseTax}", f"baseManpower: {baseMan}", f"developmentLevel: {dev}"]
    if fort: opts.append(f"fortLevel: {fort}")
    if p['cap']: opts.append("isCapital: true")
    if p.get('silk'): opts.append("hasSilkRoad: true")
    tg = TRADE_BY_TERRAIN.get(p['terrain'])
    # anna kauppatavara ~45%:lle
    if tg and (c*3 + r*5) % 20 < 9:
        opts.append(f"tradeGood: {js(tg)}")
    opts.append(f"center: {{ x: {p['x']}, y: {p['y']} }}")
    owner_js = js(p['owner']) if p['owner'] else 'null'
    reg = region_for(c, r)
    prov_lines.append(
        f"  p({js(p['id'])}, {js(p['name'])}, {js(reg)}, {js(p['terrain'])}, {owner_js}, {{ " +
        ", ".join(opts) + " }),"
    )

# ---- adjacency ----
adj = {}
for cell in prov:
    pid = prov[cell]['id']
    ns = [prov[n]['id'] for n in neighbors(*cell)]
    adj[pid] = ns
adj_lines = []
for pid in sorted(adj.keys()):
    adj_lines.append(f"  {js(pid)}: {js(adj[pid])},".replace('"', "'").replace("':", '":').replace("['", "['"))
# yksinkertaisempi: käytä JSON-tyylisiä avaimia
adj_lines = []
for pid in sorted(adj.keys()):
    arr = ", ".join(f"'{n}'" for n in adj[pid])
    adj_lines.append(f"  {pid}: [{arr}],")

silk_ids = [prov[c]['id'] for c in silk_cells]

# ---- koko tiedosto ----
header = '''/**
 * ProvinceData.ts — Provinssidata vuoden 1206 aloitusta varten
 *
 * Täysi heksaruudukko: yksi kaupunki per ruutu (neutraali tai faktion omistama).
 * Faktiot laudan reunoilla, tasaisesti jaettuna; neutraalit keskellä.
 * Generoitu gen_provinces.py:llä. Koordinaatit sovitettu kuvitettuun lautaan.
 */
import { Province, FactionId } from "@/types/province";

const p = (
  id: string,
  name: string,
  region: Province["region"],
  terrain: Province["terrain"],
  ownerId: FactionId | null,
  options: Partial<Province> = {},
): Province => ({
  id, name, region, terrain, ownerId,
  isCoastal: false, isCapital: false, neighbors: [],
  baseTax: 2, baseManpower: 3, supply: 3,
  hasSilkRoad: false, unrest: 0, fortLevel: 0,
  developmentLevel: 1, buildings: [], garrison: 0,
  center: { x: 0, y: 0 },
  ...options,
});

export const ALL_PROVINCES_1206: Province[] = [
'''

tail = '''];

export const PROVINCE_ADJACENCY: Record<string, string[]> = {
''' + "\n".join(adj_lines) + '''
};

// Apply adjacency
ALL_PROVINCES_1206.forEach((province) => {
  province.neighbors = PROVINCE_ADJACENCY[province.id] || [];
});

export const getProvincesWithAdjacency = (): Province[] =>
  ALL_PROVINCES_1206.map((prov) => ({ ...prov, neighbors: PROVINCE_ADJACENCY[prov.id] || [] }));

// ================= SILKKITIE =================
export type SilkRoadNodeType = "province" | "hex" | "city";
export interface SilkRoadNode { id: string; type: SilkRoadNodeType; }
export interface SilkRoadBonus { taxBonus: number; tradePowerBonus: number; supplyBonus: number; unrestReduction: number; }

export const SILK_ROAD_BONUS: SilkRoadBonus = {
  taxBonus: 2, tradePowerBonus: 3, supplyBonus: 2, unrestReduction: 1,
};

export const SILK_ROAD_NODES: SilkRoadNode[] = [
''' + "\n".join(f'  {{ id: {js(sid)}, type: "province" }},' for sid in silk_ids) + '''
];

export const isOnSilkRoad = (provinceId: string): boolean =>
  SILK_ROAD_NODES.some((node) => node.type === "province" && node.id === provinceId);
'''

out = header + "\n".join(prov_lines) + "\n" + tail
open('lovable_src/src/data/ProvinceData.ts','w').write(out)

# yhteenveto
from collections import Counter
oc = Counter(prov[c]['owner'] or 'NEUTRAL' for c in prov)
print('Provinsseja yhteensä:', len(prov))
for k in ['NEUTRAL']+list(FACTION_SEEDS.keys()):
    print(f'  {k:9s}: {oc.get(k,0)}')
print('Silkkitie-solmuja:', len(silk_ids))
print('Pääkaupungit:', {f:prov[cap]["id"] for f,cap in capital_cell.items()})
