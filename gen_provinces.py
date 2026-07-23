#!/usr/bin/env python3
"""Generoi täyden heksaruudukon provinssit ProvinceData.ts:ään.
- Yksi kaupunki per ruutu (neutraali tai faktion omistama)
- Faktiot laudan kulmissa; neutraalit keskellä
- Nimet alue- ja faktiokohtaisia, vuoden 1206 kannalta uskottavia
- Naapuruudet lasketaan odd-r-heksalayoutilla
"""
import unicodedata, re, json
from collections import defaultdict, Counter

# =====================================================================
#  RUUDUKON PARAMETRIT  — nämä tuottaa hex-kalibrointi.html-työkalu.
#  Koordinaatit LAUTA-avaruudessa (0..BOARD_SIZE=130), sama kuin pelissä.
# =====================================================================
BOARD_SIZE = 130.0
NCOLS, NROWS = 17, 13      # sarakkeet × rivit
X0, Y0 = 7.00, 26.75       # vasemman/ylimmän kylän keskipiste
DX, DY = 7.23, 6.44        # vaaka- ja pystyväli viereisiin kyliin
ODD_OFFSET = True          # parittomat rivit siirretty ½ heksiä (odd-r)

def cell_xy(c, r):
    x = X0 + c * DX + ((DX / 2) if (ODD_OFFSET and r % 2) else 0.0)
    y = Y0 + r * DY
    return round(x, 2), round(y, 2)

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

# ---- faktioiden siemenpisteet (kulmat, lasketaan ruudukon koosta) ----
FACTION_SEEDS = {
    'rus':      (1, 1),                 # vasen-ylä  (Novgorod)
    'mongol':   (NCOLS - 2, 1),         # oikea-ylä  (Karakorum)
    'song':     (NCOLS - 2, NROWS - 2), # oikea-ala  (Kiina, Lin'an)
    'khwarezm': (1, NROWS - 2),         # vasen-ala  (Samarkand)
}
FACTION_CAP = 16    # maksimi provinssia per faktio
FACTION_RADIUS = 5  # vain tämä etäisyys siemenestä kuuluu faktiolle

def on_ring(c, r):
    return c <= 1 or c >= NCOLS-2 or r <= 1 or r >= NROWS-2

def grid_dist(a, b):
    return abs(a[0]-b[0]) + abs(a[1]-b[1])

# ---- alue sijainnin mukaan (mukailee kuvitettua lautaa; kaikki RegionId-tyyppejä) ----
def region_for(c, r):
    west = c/(NCOLS-1); north = r/(NROWS-1)
    if west < 0.26 and north < 0.45: return 'rus'
    if west < 0.24 and north < 0.62: return 'kipchak'
    if west < 0.24:                  return 'khwarezm'
    if 0.24 <= west < 0.45 and north > 0.60: return 'transoxiana'
    if west > 0.80 and north < 0.28: return 'manchuria'
    if west > 0.78 and north > 0.52: return 'song_china'
    if west > 0.70:                  return 'jin_china'
    if north < 0.30:                 return 'mongolia'
    if 0.45 < west < 0.70 and north > 0.78: return 'tibet'
    if 0.45 < west < 0.72 and north > 0.60: return 'xixia'
    return 'central_asia'

# ---- maasto sijainnin mukaan (suhteellinen, skaalautuu ruudukon kokoon) ----
def terrain_for(c, r):
    west = c/(NCOLS-1); north = r/(NROWS-1)
    if west < 0.05 and 0.1 < north < 0.9: return 'mountain'
    if 0.30 < west < 0.44 and 0.2 < north < 0.8 and (c+r) % 3 == 0: return 'mountain'
    if west < 0.25 and north < 0.40: return 'forest'
    if west < 0.20 and north > 0.62: return 'marsh'
    if west > 0.80: return 'farmland' if north > 0.42 else 'hills'
    if west > 0.64: return 'grassland' if north > 0.52 else 'steppe'
    if north < 0.30: return 'steppe'
    if north > 0.74: return 'grassland'
    return 'desert' if (0.34 < west < 0.64 and 0.32 < north < 0.70) else 'steppe'

TRADE_BY_TERRAIN = {
    'steppe': 'horses', 'grassland': 'livestock', 'forest': 'fur',
    'farmland': 'grain', 'plains': 'silk', 'desert': 'salt',
    'marsh': 'grain', 'mountain': 'iron', 'taiga': 'fur', 'hills': 'iron',
    'tundra': 'fur',
}

# ---- pääkaupungit (id säilyttää yhteyden FACTION_DATA_1206:een) ----
CAPITAL_NAMES = {
    'rus': ('novgorod', 'Novgorod'),
    'mongol': ('karakorum', 'Karakorum'),
    'song': ('hangzhou', "Lin'an"),
    'khwarezm': ('samarkand', 'Samarkand'),
}

# ---- faktion oma kulttuurialue nimeämistä ja region-kenttää varten ----
FACTION_REGION = {'rus': 'rus', 'mongol': 'mongolia', 'song': 'song_china', 'khwarezm': 'khwarezm'}

# ---- aidot aluekohtaiset nimipoolit (n. vuosi 1206) ----
REGION_NAMES = {
    'rus': ['Pihkova','Tver','Vladimir','Suzdal','Rostov','Jaroslavl','Uglitš','Kostroma','Smolensk',
            'Polotsk','Vitebsk','Minsk','Turov','Pinsk','Kiova','Tšernigov','Perejaslav','Kursk','Rjazan',
            'Murom','Pronsk','Beloozero','Ladoga','Torzhok','Russa','Toropets','Vjazma','Kolomna','Moskova',
            'Dmitrov','Juriev','Galitš','Lutsk','Grodno','Ustjug','Vjatka','Belgorod','Dorogobuž','Mozhaisk','Zvenigorod'],
    'kipchak': ['Sarkel','Itil','Saksin','Sygnak','Jand','Bulgar','Bilär','Suvar','Oşel','Tmutarakan',
                'Sudak','Ukek','Beljamen','Madžar','Šarukan','Sugrov','Tortšesk','Kernek','Samandar','Tana',
                'Azak','Solhat','Kaffa','Perekop','Oleşje','Sarai','Ryn','Balymer','Rukad','Kajala'],
    'khwarezm': ['Kät','Hazarasp','Hiva','Nasa','Abiward','Dehistan','Gorgan','Astarabad','Merv','Sarakhs',
                 'Nišapur','Tus','Sabzevar','Bistam','Damghan','Semnan','Ray','Kazvin','Hamadan','Isfahan',
                 'Kashan','Kum','Sava','Zanjan','Ardabil','Tabriz','Maragha','Urmia','Nahavand','Dinavar',
                 'Shiraz','Yazd','Kerman','Zaranj','Bost'],
    'transoxiana': ['Buhara','Nasaf','Kesh','Dabusiya','Panjikent','Chaganian','Termez','Khuttal','Vakhsh','Khujand',
                    'Osh','Uzgend','Marghinan','Andijan','Isfijab','Sairam','Taraz','Otrar','Sabran','Sauran',
                    'Yasi','Barchkent','Zernuk','Ashnas','Balasagun','Kuba','Sutkent','Karnak','Suzak','Sygnak-Jaxartes'],
    'song_china': ['Shaoxing','Pingjiang','Qingyuan','Huzhou','Jiaxing','Wenzhou','Taizhou','Quanzhou','Fuzhou','Jianning',
                   'Nanchang','Jizhou','Ganzhou','Tanzhou','Hengyang','Jiangling','Ezhou','Xiangyang','Jiankang','Runzhou',
                   'Yangzhou','Chuzhou','Chengdu','Meishan','Jiazhou','Luzhou','Gongzhou','Kuizhou','Jingjiang','Guangzhou',
                   'Chaozhou','Wuzhou','Shaowu','Nanan','Chizhou','Raozhou','Xinzhou','Linjiang','Yongzhou','Daozhou'],
    'manchuria': ['Liaoyang','Guangning','Xianping','Longzhou','Kaiyuan','Huanglong','Ningjiang','Binzhou','Shangjing','Zhaozhou',
                  'Tunmen','Subin','Wuguo','Xianzhou','Hanzhou'],
    'jin_china': ['Zhongdu','Daxing','Bianjing','Xijing','Taiyuan','Zhending','Dongping','Jinan','Yidu','Pingyang',
                  'Hezhong','Jingzhao','Fengxiang','Baoding','Hejian','Cangzhou','Dezhou','Bozhou','Kaizhou','Zhangde',
                  'Huaizhou','Mengzhou','Shanzhou','Xingzhou','Mizhou','Laizhou','Dengzhou','Qingzhou','Zizhou','Xiangzhou',
                  'Fenzhou','Zezhou','Jinzhou','Luzhou-Jin','Weizhou'],
    'mongolia': ['Avarga','Onon','Kerulen','Tuul','Selenga','Orhon','Hangai','Hentii','Baikal','Altai',
                 'Sajan','Uvs','Hövsgöl','Buir','Hulun','Tannu','Barga','Dzungaria','Emil','Kobdo',
                 'Ongi','Tamir','Zavhan','Ider','Noyon','Burkhan-Haldun','Deluun-Boldog','Kökö-Nuur','Ongin','Halha',
                 'Kem','Bulgan','Tosontsengel','Uliastai','Darhan','Baruun','Zuun','Övör','Tarialan','Möörön',
                 'Rashaant','Chuluut','Terhiin','Egiin','Sangiin'],
    'xixia': ['Xingqing','Liangzhou','Ganzhou-Xia','Guazhou','Shazhou','Xiliang','Khara-Khoto','Yinzhou','Xiazhou','Youzhou',
              'Shengzhou','Lingzhou','Yanzhou','Zhenyi','Xuande','Woluohai','Heishan','Wuwei','Zhangye','Jiuquan',
              'Ejina','Helan','Suzhou-Xia','Dingzhou','Huaizhou-Xia'],
    'tibet': ['Lhasa','Xigatse','Gyantse','Sakya','Qamdo','Nagqu','Purang','Guge','Tsang','Amdo','Kham','Nakchu'],
    'central_asia': ['Kašgar','Yarkand','Khotan','Kuqa','Aksu','Turfan','Hami','Beshbalik','Almalik','Suyab',
                     'Barskhan','Karashar','Miran','Loulan','Charchan','Niya','Endere','Yiwu','Gaochang','Jimsar',
                     'Tumshuq','Maralbashi','Yengisar','Tashkurgan','Sarikol','Wakhan','Badakhshan','Pamir','Alai','Naryn',
                     'Ysyk-Köl','Ili','Qayaliq','Pulad','Karghalik','Guma','Polur','Keriya','Uch-Turfan','Bay',
                     'Shahyar','Korla','Toksun','Kelpin','Faizabad','Sanju','Duva','Kokyar','Posgam','Merket',
                     'Chira','Domoko','Qira','Lop','Charkhlik','Kucha-Pohja','Bugur'],
}

def slug(name):
    s = unicodedata.normalize('NFKD', name).encode('ascii','ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+','_', s).strip('_').lower()
    return s or 'prov'

# ================= GENEROINTI =================
cells = [(c, r) for r in range(NROWS) for c in range(NCOLS)]

# 1) faktio-omistus: reunaruutu kuuluu lähimmälle siemenelle vain jos tarpeeksi lähellä
owner = {}
for (c, r) in cells:
    if on_ring(c, r):
        best, bd = min(((f, grid_dist((c,r), s)) for f, s in FACTION_SEEDS.items()), key=lambda t: t[1])
        owner[(c,r)] = best if bd <= FACTION_RADIUS else None
    else:
        owner[(c,r)] = None

# 2) rajaa jokainen faktio FACTION_CAP:iin (kauimmat -> neutraali)
byfac = defaultdict(list)
for cell, o in owner.items():
    if o: byfac[o].append(cell)
for fac, clist in byfac.items():
    seed = FACTION_SEEDS[fac]
    clist.sort(key=lambda cell: grid_dist(cell, seed))
    for cell in clist[FACTION_CAP:]:
        owner[cell] = None

# 2b) varmista minimikoko
FACTION_MIN = 10
def count(fac):
    return sum(1 for o in owner.values() if o == fac)
for fac, seed in FACTION_SEEDS.items():
    while count(fac) < FACTION_MIN:
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

# 4) nimet (alue-/faktiokohtaiset, dedupattu) + id:t
used_ids = set()
used_names = set(nm for _, nm in CAPITAL_NAMES.values())  # varaa pääkaupunkinimet
region_idx = defaultdict(int)
gen_idx = [1]

def take_name(reg):
    pool = REGION_NAMES.get(reg) or REGION_NAMES['central_asia']
    i = region_idx[reg]
    while i < len(pool) and pool[i] in used_names:
        i += 1
    if i < len(pool):
        region_idx[reg] = i + 1
        nm = pool[i]
    else:
        # ylivuoto -> Keski-Aasian poolista, sitten generoitu
        ca = REGION_NAMES['central_asia']
        j = region_idx['__ca_of']
        while j < len(ca) and ca[j] in used_names:
            j += 1
        if j < len(ca):
            region_idx['__ca_of'] = j + 1
            nm = ca[j]
        else:
            nm = f'Karavaanikeidas {gen_idx[0]}'; gen_idx[0] += 1
    used_names.add(nm)
    return nm

def region_of(c, r, o):
    return FACTION_REGION[o] if o else region_for(c, r)

prov = {}
for (c, r) in cells:
    o = owner[(c,r)]
    if o and capital_cell.get(o) == (c,r):
        pid, name = CAPITAL_NAMES[o]
    else:
        name = take_name(region_of(c, r, o))
        pid = slug(name)
        base = pid; k = 2
        while pid in used_ids:
            pid = f'{base}_{k}'; k += 1
    used_ids.add(pid)
    x, y = cell_xy(c, r)
    prov[(c,r)] = {'id': pid, 'name': name, 'owner': o, 'x': x, 'y': y,
                   'terrain': terrain_for(c,r), 'region': region_of(c, r, o),
                   'cap': capital_cell.get(o)==(c,r)}

# 5) silkkitie: keskirivi lännestä itään
SILK_ROW = NROWS // 2
silk_cells = [(c, SILK_ROW) for c in range(NCOLS)]
for cell in silk_cells:
    prov[cell]['silk'] = True

# 6) tilastot (deterministiset)
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
    if tg and (c*3 + r*5) % 20 < 9:
        opts.append(f"tradeGood: {js(tg)}")
    opts.append(f"center: {{ x: {p['x']}, y: {p['y']} }}")
    owner_js = js(p['owner']) if p['owner'] else 'null'
    prov_lines.append(
        f"  p({js(p['id'])}, {js(p['name'])}, {js(p['region'])}, {js(p['terrain'])}, {owner_js}, {{ " +
        ", ".join(opts) + " }),"
    )

# ---- adjacency ----
adj = {}
for cell in prov:
    pid = prov[cell]['id']
    adj[pid] = [prov[n]['id'] for n in neighbors(*cell)]
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
 * Faktiot laudan kulmissa; neutraalit keskellä. Nimet alue-/faktiokohtaisia.
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
oc = Counter(prov[c]['owner'] or 'NEUTRAL' for c in prov)
print('Provinsseja yhteensä:', len(prov), f'({NCOLS}x{NROWS})')
for k in ['NEUTRAL']+list(FACTION_SEEDS.keys()):
    print(f'  {k:9s}: {oc.get(k,0)}')
print('Silkkitie-solmuja:', len(silk_ids))
print('Pääkaupungit:', {f:prov[cap]["id"] for f,cap in capital_cell.items()})
rc = Counter(prov[c]['region'] for c in prov)
print('Alueet:', dict(rc))
