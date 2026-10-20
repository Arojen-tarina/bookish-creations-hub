"""Builds the Play Store graphics from real device captures.

Usage: python -I tools/store/make_store_graphics.py <captures dir> <out dir> [--render]
- Feature graphic 1024 x 500 (en, fi): the board map, the compass emblem and the name.
- Screenshots 1920 x 1080 (16:9, what Play wants for game promotion): a caption band in
  the top 20% (Play's limit for text) over a 2400 x 1080 phone capture scaled to
  1920 x 864. No device frames, as Play requires.
Captures are PNG files named after SHOTS below, in one folder per language (en, fi), taken
with the game in that language. Headless Chrome renders the pages.
"""
import base64
import html
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RES = ROOT / "app" / "src" / "main" / "res"
CAPTURES, OUT = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
RENDER = "--render" in sys.argv
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# capture file -> caption per language (short: the band holds one line)
SHOTS = [
    ("01-map", {"en": "Lead Genghis Khan's Mongols across Eurasia", "fi": "Johda Tšingis-kaanin mongoleja halki Euraasian"}),
    ("02-attack", {"en": "Command your armies on the hand-painted map", "fi": "Komenna armeijoitasi käsin maalatulla kartalla"}),
    ("03-battle", {"en": "Battles won by terrain, fortresses and morale", "fi": "Maasto, linnoitukset ja moraali ratkaisevat taistelut"}),
    ("04-chronicle", {"en": "A world chronicle and full rulebook inside", "fi": "Maailman kronikka ja täysi sääntökirja mukana"}),
    ("05-build", {"en": "Build markets, stables, fortresses and wonders", "fi": "Rakenna toreja, talleja, linnoituksia ja ihmeitä"}),
    ("06-cards", {"en": "85 strategy cards turn the tide of war", "fi": "85 strategiakorttia kääntää sodan suunnan"}),
    ("07-diplomacy", {"en": "Trade, alliances or war: your choice", "fi": "Kauppaa, liittoja vai sotaa: sinä päätät"}),
    ("08-goals", {"en": "Five paths to victory, 84 achievements", "fi": "Viisi tietä voittoon ja 84 saavutusta"}),
]
FEATURE = {
    "en": ("AROJEN TARINAT", "Genghis Khan · Turn-based strategy · 1206"),
    "fi": ("AROJEN TARINAT", "Tšingis-kaani · Vuoropohjainen strategiapeli · 1206"),
}


def data_uri(path: Path, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


FONT = data_uri(RES / "font" / "cinzel_extrabold.ttf", "font/ttf")
MAP = data_uri(RES / "drawable-nodpi" / "board_map.jpg", "image/jpeg")
BASE_CSS = f"""
@font-face {{ font-family: Cinzel; src: url({FONT}); font-weight: 800; }}
html, body {{ margin: 0; padding: 0; overflow: hidden; background: #14110d; }}
"""

# The compass medallion (same geometry as the launcher icon), as inline SVG.
COMPASS = """<svg viewBox="20 20 68 68" xmlns="http://www.w3.org/2000/svg">
<circle cx="54" cy="54" r="31" fill="#140F0A" fill-opacity=".9" stroke="#E0A944" stroke-width="2.6"/>
<circle cx="54" cy="54" r="28.2" fill="none" stroke="#A8772A" stroke-width=".9"/>
<g id="pt"><path d="M54,27.5 L49.62,49.62 L54,54 Z" fill="#F2C46B"/><path d="M54,27.5 L58.38,49.62 L54,54 Z" fill="#A8772A"/></g>
<use href="#pt" transform="rotate(90 54 54)"/><use href="#pt" transform="rotate(180 54 54)"/><use href="#pt" transform="rotate(270 54 54)"/>
<g id="dg"><path d="M66.37,41.63 L54,49.6 L54,54 Z" fill="#C99A45"/><path d="M66.37,41.63 L58.4,54 L54,54 Z" fill="#8A6122"/></g>
<use href="#dg" transform="rotate(90 54 54)"/><use href="#dg" transform="rotate(180 54 54)"/><use href="#dg" transform="rotate(270 54 54)"/>
<circle cx="54" cy="54" r="2.6" fill="#140F0A"/>
</svg>"""


def feature_page(title: str, subtitle: str) -> str:
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE_CSS}
.fg {{ position: relative; width: 1024px; height: 500px; overflow: hidden;
  background: url({MAP}) no-repeat; background-size: 1700px auto; background-position: -420px -150px; }}
.shade {{ position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 85% at 50% 50%, rgba(20,15,10,.15), rgba(20,15,10,.85)),
              linear-gradient(180deg, rgba(20,15,10,.35), rgba(20,15,10,.1) 40%, rgba(20,15,10,.55)); }}
.content {{ position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }}
.emblem {{ width: 128px; height: 128px; filter: drop-shadow(0 6px 18px rgba(0,0,0,.7)); }}
h1 {{ font-family: Cinzel; font-weight: 800; font-size: 78px; letter-spacing: 4px; margin: 10px 0 0;
  color: #F2C46B; text-shadow: 0 3px 0 #6b4a17, 0 8px 28px rgba(0,0,0,.9); }}
.rule {{ width: 520px; height: 2px; margin: 10px 0 12px; background: linear-gradient(90deg, transparent, #E0A944, transparent); }}
p {{ font: 600 26px/1.2 system-ui, "Segoe UI", Roboto, sans-serif; color: #F4E9D2; margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,.95); letter-spacing: .5px; }}
</style></head><body><div class="fg"><div class="shade"></div><div class="content">
<div class="emblem">{COMPASS}</div><h1>{html.escape(title)}</h1><div class="rule"></div><p>{html.escape(subtitle)}</p>
</div></div></body></html>"""


def shot_page(capture: Path, caption: str) -> str:
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE_CSS}
.frame {{ position: relative; width: 1920px; height: 1080px; overflow: hidden;
  background: radial-gradient(ellipse 80% 120% at 50% 0%, #3a2a12, #14110d 70%); }}
.band {{ position: absolute; left: 0; top: 0; width: 1920px; height: 216px; display: flex; align-items: center; justify-content: center; gap: 28px; }}
.emblem {{ width: 92px; height: 92px; flex: none; filter: drop-shadow(0 4px 12px rgba(0,0,0,.6)); }}
h1 {{ font-family: Cinzel; font-weight: 800; font-size: 64px; letter-spacing: 1px; margin: 0; color: #F2C46B;
  text-shadow: 0 3px 0 #5a3d12, 0 6px 22px rgba(0,0,0,.8); white-space: nowrap; }}
.shot {{ position: absolute; left: 0; top: 216px; width: 1920px; height: 864px; display: block; }}
.edge {{ position: absolute; left: 0; top: 214px; width: 1920px; height: 3px; background: linear-gradient(90deg, transparent, #E0A944 20%, #E0A944 80%, transparent); }}
</style></head><body><div class="frame"><div class="band"><div class="emblem">{COMPASS}</div><h1>{html.escape(caption)}</h1></div>
<img class="shot" src="{data_uri(capture, 'image/png')}"><div class="edge"></div></div>
<script>
// Long captions (Finnish) shrink until the emblem and the line fit the band.
const h = document.querySelector('h1');
let size = 64;
while (h.scrollWidth > 1720 && size > 34) {{ size -= 2; h.style.fontSize = size + 'px'; }}
</script></body></html>"""


def render(page: str, size: tuple, png: Path, work: Path) -> None:
    png.parent.mkdir(parents=True, exist_ok=True)
    page_file = work / (png.stem + ".html")
    page_file.write_text(page, encoding="utf-8")
    if not RENDER:
        return
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                    f"--user-data-dir={work / 'chrome-profile'}", f"--window-size={size[0]},{size[1]}",
                    f"--screenshot={png}", page_file.as_uri()], check=True, capture_output=True, timeout=120)
    print(f"{png.relative_to(OUT)}")


work = OUT / "_work"
work.mkdir(parents=True, exist_ok=True)
for lang, (title, subtitle) in FEATURE.items():
    render(feature_page(title, subtitle), (1024, 500), OUT / "05-Feature-Graphic" / f"feature-graphic-{lang}.png", work)
for name, captions in SHOTS:
    for lang, caption in captions.items():
        # Captures of the game in each listing language: <captures>/<lang>/<name>.png
        capture = CAPTURES / lang / f"{name}.png"
        if not capture.exists():
            print(f"missing capture {lang}/{capture.name}, skipped")
            continue
        render(shot_page(capture, caption), (1920, 1080), OUT / "04-Screenshots" / lang / f"{name}-{lang}.png", work)
print("done" if RENDER else "pages prepared")
