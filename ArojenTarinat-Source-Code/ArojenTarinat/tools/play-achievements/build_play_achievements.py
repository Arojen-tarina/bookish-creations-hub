"""Builds the Google Play Console achievements import ZIP from the app's achievement catalog.

Inputs (read from the repo):
  - game/achievements/AchievementCatalog.kt and NativeAchievements.kt (ids, category, difficulty, points, threshold)
  - res/values*/strings_achievements.xml (names and descriptions per locale)

Output: store/play-achievements/ArojenTarinat-play-achievements.zip

Format follows https://developer.android.com/games/pgs/integrate-achievements
(no header rows, no commas in Name/Description, flat ZIP, PNG icons of 512x512).

Run from the ArojenTarinat root: python3 tools/play-achievements/build_play_achievements.py
"""

import csv
import math
import re
import sys
import tempfile
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ACH_DIR = ROOT / "app/src/main/java/fi/bookish/creations/arojen/tarinat/game/achievements"
RES_DIR = ROOT / "app/src/main/res"
OUT_ZIP = ROOT / "store/play-achievements/ArojenTarinat-play-achievements.zip"

DEF_RE = re.compile(
    r'^\s*AchievementDef\("(?P<id>[a-z0-9_]+)",\s*AchievementCategory\.(?P<cat>\w+),\s*'
    r'AchievementDifficulty\.(?P<diff>\w+),\s*points = (?P<points>\d+)(?P<rest>.*)$'
)
ATLEAST_RE = re.compile(r"check = atLeast\((\d+)\)")

# Values folder -> Play Console locale code. Only Finnish is translated here, next to the English default.
LOCALES = {
    "values-fi": "fi",
}
# Default locale of the Play listing; Name and Description in the metadata CSV use it.
DEFAULT_LOCALE = "en-US"

# Finnish translation of lifetime_ten_games is identical to challenge_ten_wins, and Play requires unique names per locale.
FI_NAME_OVERRIDES = {
    "lifetime_ten_games": "Kokenut pelaaja",
}

# Play requires the total of all points to be under 2000. Catalog points are scaled by this factor,
# then rounded to the nearest 5 (minimum 5), so every value stays valid.
POINTS_SCALE = 0.5
POINTS_TOTAL_MAX = 2000

# Hidden achievements show "???" in the app until unlocked, but Play needs unique names.
# Their translations stay "???" in the app, so those locale rows are skipped and Play falls back to the default name.
NAME_OVERRIDES = {
    "hidden_comeback": "Phoenix",
    "hidden_underdog": "Underdog",
    "hidden_hoarder": "Treasure Hoard",
    "hidden_flawless": "Unscathed",
    "hidden_diplomat_spy": "Master Diplomat",
    "hidden_night_owl": "Night Owl",
}
MASKED_NAME = "???"

NAME_MAX, DESC_MAX = 100, 500

CATEGORY_COLORS = {
    "TUTORIAL": (88, 133, 186),
    "EARLY_GAME": (96, 160, 96),
    "MID_GAME": (183, 140, 60),
    "END_GAME": (170, 70, 60),
    "HIDDEN": (70, 70, 84),
    "SKILL": (60, 120, 170),
    "EXPLORATION": (50, 150, 150),
    "COLLECTION": (150, 110, 170),
    "CHALLENGE": (190, 90, 120),
    "HISTORICAL": (130, 100, 70),
    "CAMPAIGN": (120, 90, 160),
    "DAILY_WEEKLY": (210, 130, 50),
    "LIFETIME": (100, 100, 100),
}
DIFFICULTY_RINGS = {
    "TRIVIAL": (190, 190, 190),
    "EASY": (110, 200, 110),
    "MEDIUM": (90, 160, 230),
    "HARD": (170, 100, 230),
    "LEGENDARY": (240, 190, 60),
}
SHAPES = ["star", "shield", "crown", "sword", "gem", "flag"]


def parse_catalog():
    entries = []
    for filename in ("AchievementCatalog.kt", "NativeAchievements.kt"):
        for line in (ACH_DIR / filename).read_text(encoding="utf-8").splitlines():
            m = DEF_RE.match(line)
            if not m:
                continue
            threshold = ATLEAST_RE.search(m.group("rest"))
            entries.append({
                "id": m.group("id"),
                "category": m.group("cat"),
                "difficulty": m.group("diff"),
                "points": int(m.group("points")),
                "hidden": "hidden = true" in m.group("rest"),
                "steps": int(threshold.group(1)) if threshold else None,
            })
    return entries


def read_strings(values_dir):
    tree = ET.parse(RES_DIR / values_dir / "strings_achievements.xml")
    out = {}
    for node in tree.getroot().findall("string"):
        name = node.get("name") or ""
        text = (node.text or "").replace("\\'", "'").replace('\\"', '"').replace("\\?", "?").strip()
        text = re.sub(r"(?<=\d),(?=\d{3}\b)", "", text)
        out[name] = text
    return out


def play_points(points):
    return max(5, 5 * round(points * POINTS_SCALE / 5))


def check_text(label, value, limit):
    if len(value) > limit:
        sys.exit(f"{label} is longer than {limit} characters: {value!r}")


def draw_shape(draw, shape, c, r):
    white = (255, 255, 255, 255)
    if shape == "star":
        pts = []
        for i in range(10):
            rad = r if i % 2 == 0 else r * 0.45
            ang = -math.pi / 2 + i * math.pi / 5
            pts.append((c + rad * math.cos(ang), c + rad * math.sin(ang)))
        draw.polygon(pts, fill=white)
    elif shape == "shield":
        draw.polygon([(c - r * .8, c - r), (c + r * .8, c - r), (c + r * .8, c + r * .1),
                      (c, c + r * 1.1), (c - r * .8, c + r * .1)], fill=white)
    elif shape == "crown":
        draw.polygon([(c - r, c + r * .6), (c - r, c - r * .5), (c - r * .5, c),
                      (c, c - r), (c + r * .5, c), (c + r, c - r * .5), (c + r, c + r * .6)], fill=white)
    elif shape == "sword":
        draw.polygon([(c - r * .12, c - r), (c + r * .12, c - r), (c + r * .12, c + r * .5),
                      (c - r * .12, c + r * .5)], fill=white)
        draw.rectangle([c - r * .5, c + r * .5, c + r * .5, c + r * .62], fill=white)
        draw.rectangle([c - r * .1, c + r * .62, c + r * .1, c + r], fill=white)
    elif shape == "gem":
        draw.polygon([(c, c + r), (c - r, c - r * .2), (c - r * .5, c - r * .8),
                      (c + r * .5, c - r * .8), (c + r, c - r * .2)], fill=white)
    elif shape == "flag":
        draw.rectangle([c - r * .7, c - r, c - r * .5, c + r], fill=white)
        draw.polygon([(c - r * .5, c - r), (c + r, c - r * .5), (c - r * .5, c)], fill=white)


def make_icon(path, entry, index):
    """Medallion icon: category colour, difficulty ring, shape per achievement. No text, as Google advises."""
    big = 2048
    c = big / 2
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    base = CATEGORY_COLORS[entry["category"]]
    ring = DIFFICULTY_RINGS[entry["difficulty"]]
    draw.ellipse([0, 0, big - 1, big - 1], fill=ring + (255,))
    inset = 110
    draw.ellipse([inset, inset, big - 1 - inset, big - 1 - inset], fill=base + (255,))
    inner = inset + 80
    draw.ellipse([inner, inner, big - 1 - inner, big - 1 - inner], outline=(255, 255, 255, 90), width=24)
    draw_shape(draw, SHAPES[index % len(SHAPES)], c, big * 0.22)
    img.resize((512, 512), Image.LANCZOS).save(path, "PNG", optimize=True)


def main():
    entries = parse_catalog()
    if len(entries) != 87:
        sys.exit(f"Expected 87 achievements in the catalog, found {len(entries)}")
    english = read_strings("values")

    metadata_rows, icon_rows, locale_rows = [], [], []
    names = {}
    for order, entry in enumerate(entries, start=1):
        aid = entry["id"]
        name = NAME_OVERRIDES.get(aid, english[f"achv_{aid}_name"])
        desc = english[f"achv_{aid}_desc"]
        check_text("Name", name, NAME_MAX)
        check_text("Description", desc, DESC_MAX)
        for field, value in (("Name", name), ("Description", desc)):
            if "," in value:
                sys.exit(f"{aid}: {field} contains a comma, which Google's CSV format forbids: {value!r}")
        if name in names:
            sys.exit(f"Duplicate achievement name {name!r}: {names[name]} and {aid}")
        names[name] = aid
        points = play_points(entry["points"])
        if points % 5 or not 5 <= points <= 200:
            sys.exit(f"{aid}: points must be a multiple of 5 between 5 and 200")

        incremental = entry["steps"] is not None and entry["steps"] > 1
        initial = "Hidden" if entry["hidden"] else "Revealed"
        metadata_rows.append([
            name, desc, str(incremental), str(entry["steps"]) if incremental else "",
            initial, points, order,
        ])
        icon_rows.append([name, f"{aid}.png"])

    total_points = sum(row[5] for row in metadata_rows)
    if total_points >= POINTS_TOTAL_MAX:
        sys.exit(f"Total points {total_points} must be under {POINTS_TOTAL_MAX}")

    for values_dir, code in LOCALES.items():
        strings = read_strings(values_dir)
        local_names = {}
        for entry, meta in zip(entries, metadata_rows):
            aid = entry["id"]
            loc_name = FI_NAME_OVERRIDES.get(aid, strings[f"achv_{aid}_name"]) if code == "fi" else strings[f"achv_{aid}_name"]
            loc_desc = strings[f"achv_{aid}_desc"]
            if loc_name == MASKED_NAME:
                continue
            check_text(f"{code} name {aid}", loc_name, NAME_MAX)
            check_text(f"{code} description {aid}", loc_desc, DESC_MAX)
            if loc_name in local_names:
                sys.exit(f"{code}: duplicate name {loc_name!r} for {local_names[loc_name]} and {aid}")
            local_names[loc_name] = aid
            locale_rows.append([meta[0], loc_name, loc_desc, code])

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        files = []

        def write_csv(filename, rows):
            path = tmp_path / filename
            with path.open("w", encoding="utf-8", newline="") as fh:
                csv.writer(fh, lineterminator="\n").writerows(rows)
            files.append(path)

        write_csv("AchievementsMetadata.csv", metadata_rows)
        write_csv("AchievementsLocalizations.csv", locale_rows)
        write_csv("AchievementsIconsMappings.csv", icon_rows)

        for index, entry in enumerate(entries):
            icon_path = tmp_path / f"{entry['id']}.png"
            make_icon(icon_path, entry, index)
            files.append(icon_path)

        OUT_ZIP.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(OUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zf:
            for path in files:
                zf.write(path, arcname=path.name)

    print(f"Wrote {OUT_ZIP.relative_to(ROOT)}: {len(entries)} achievements, "
          f"{len(LOCALES)} translated locales (default {DEFAULT_LOCALE}), {len(files)} files")


if __name__ == "__main__":
    main()
