#!/usr/bin/env python3
"""Bonus Class decks: bonus-classes/<level>/bonusNN.json (its "deck" list) -> slide-content-v5/<level>/bonus-NN/.

    python3 gen_bonus_slides.py              # every class that has a "deck"
    python3 gen_bonus_slides.py level1 1     # one class

Slide counts go to assets/slides-v5/<level>/bonus-manifest.json ({"01": 22, ...}); kept apart from the lesson
manifest.json, which the lesson generators rebuild from scratch. Open with present.html?level=<level>&bonus=N.
"""
import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, "lib"))
import bonus_deck  # noqa: E402


def build(path):
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    if not d.get("deck"):
        return None
    slides = bonus_deck.Deck(d).build()
    level, nn = d["level"], f'{d["bonusNumber"]:02d}'
    out = os.path.join(ROOT, "slide-content-v5", level, f"bonus-{nn}")
    os.makedirs(out, exist_ok=True)
    for old in glob.glob(os.path.join(out, "slide-*.html")):
        os.remove(old)
    for i, html in enumerate(slides, 1):
        with open(os.path.join(out, f"slide-{i:02d}.html"), "w", encoding="utf-8") as f:
            f.write(html)
    mpath = os.path.join(ROOT, "assets", "slides-v5", level, "bonus-manifest.json")
    manifest = {}
    if os.path.exists(mpath):
        with open(mpath, encoding="utf-8") as f:
            manifest = json.load(f)
    manifest[nn] = len(slides)
    os.makedirs(os.path.dirname(mpath), exist_ok=True)
    with open(mpath, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(manifest.items())), f, indent=1)
    return f"{level} bonus {nn}: {len(slides)} slides"


def main():
    args = sys.argv[1:]
    if args:
        paths = [os.path.join(ROOT, "bonus-classes", args[0], f"bonus{int(args[1]):02d}.json")] if len(args) > 1 \
            else sorted(glob.glob(os.path.join(ROOT, "bonus-classes", args[0], "bonus*.json")))
    else:
        paths = sorted(glob.glob(os.path.join(ROOT, "bonus-classes", "*", "bonus*.json")))
    for p in paths:
        msg = build(p)
        if msg:
            print(msg)


if __name__ == "__main__":
    main()
