"""Checks the hand-written translations against English.

Usage: python tools/check_translations.py [lang ...]
Files: values-xx/strings.xml and values-xx/strings_achievements.xml. For each:
every English key present (app_name excepted), no extra keys, the same
placeholders (%1$s, %2$d ...) as English, valid XML, and no unescaped straight
apostrophe (Android rejects those). Plurals: the same names as English, every
quantity the language's grammar needs, and no placeholder English lacks (Arabic
"one" and "two" may leave the number out). Exit code 1 on any problem.
"""
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

RES = Path(__file__).resolve().parent.parent / "app" / "src" / "main" / "res"
LANGS = ["zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ur", "in", "de", "ja"]
FILES = ["strings.xml", "strings_achievements.xml"]
PLACEHOLDER = re.compile(r"%\d+\$[sd]")
# Plural categories each language's grammar uses (CLDR); the rest have one and other.
QUANTITIES = {
    "zh": {"other"}, "ja": {"other"}, "in": {"other"},
    "ru": {"one", "few", "many", "other"},
    "ar": {"zero", "one", "two", "few", "many", "other"},
}


def strings(path: Path) -> dict:
    root = ET.parse(path).getroot()
    return {e.get("name"): "".join(e.itertext()) for e in root.iter("string") if e.get("translatable") != "false"}


def plurals(path: Path) -> dict:
    root = ET.parse(path).getroot()
    return {p.get("name"): {i.get("quantity"): "".join(i.itertext()) for i in p.iter("item")} for p in root.iter("plurals")}


def plural_problems(lang: str, english: dict, local: dict) -> list:
    out = [f"missing plurals {k}" for k in sorted(set(english) - set(local))]
    out += [f"extra plurals {k}" for k in sorted(set(local) - set(english))]
    need = QUANTITIES.get(lang, {"one", "other"})
    for name in sorted(set(english) & set(local)):
        allowed = set(PLACEHOLDER.findall(english[name]["other"]))
        if lacking := need - set(local[name]):
            out.append(f"{name} lacks {', '.join(sorted(lacking))}")
        for quantity, text in local[name].items():
            if not set(PLACEHOLDER.findall(text)) <= allowed:
                out.append(f"{name}/{quantity} placeholders")
        if set(PLACEHOLDER.findall(local[name].get("other", ""))) != allowed:
            out.append(f"{name}/other placeholders")
    return out


def main() -> int:
    problems = 0
    for lang, file in [(lang, file) for lang in sys.argv[1:] or LANGS for file in FILES]:
        english = strings(RES / "values" / file)
        path = RES / f"values-{lang}" / file
        if not path.exists():
            print(f"{lang}/{file}: missing file")
            problems += 1
            continue
        try:
            local = strings(path)
        except ET.ParseError as e:
            print(f"{lang}/{file}: XML error {e}")
            problems += 1
            continue
        raw = path.read_text(encoding="utf-8")
        missing = sorted(set(english) - set(local))
        extra = sorted(set(local) - set(english))
        bad = [k for k in english if k in local
               and sorted(PLACEHOLDER.findall(english[k])) != sorted(PLACEHOLDER.findall(local[k]))]
        apostrophes = [k for k, v in local.items() if re.search(r"(?<!\\)'", v)]
        for label, items in (("missing", missing), ("extra", extra), ("placeholders", bad), ("unescaped '", apostrophes)):
            if items:
                print(f"{lang}/{file}: {label}: {', '.join(items)}")
                problems += 1
        for problem in plural_problems(lang, plurals(RES / "values" / file), plurals(path)):
            print(f"{lang}/{file}: {problem}")
            problems += 1
        if file == "strings.xml" and "&#x200F;" not in raw and lang in ("ar", "ur"):
            print(f"{lang}: no right-to-left marks on lines that open with a name")
        print(f"{lang}/{file}: {len(local)} / {len(english)} strings")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
