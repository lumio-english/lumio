#!/usr/bin/env python3
"""Scene-coverage prompts for the Teen Track (Levels 3-6): two extra
illustrated scenes per lesson from lib/teen_scenes_extra.py, in the same
format as _docs/teen-scene-image-prompts-L4-L6.md (the first scene per
lesson). Skips any scene whose image already exists.

Output: _docs/teen-scene-coverage-prompts-L3-L6.md
Re-run after editing lib/teen_scenes_extra.py:  python3 gen_teen_scene_prompts.py
"""
import os, sys, json, glob
ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, "lib"))
from teen_scenes_extra import EXTRA

OUT = os.path.join(ROOT, "_docs", "teen-scene-coverage-prompts-L3-L6.md")

CAST = """## The cast (Teen Track) -- use these descriptions verbatim

- **Omar** -- teen boy, short dark hair, warm brown skin, white thobe with orange trim, white-and-orange sneakers. Friendly, confident.
- **Sara** -- teen girl, orange hijab, glasses, orange cardigan over a white top, long orange skirt, orange-and-white sneakers. Warm, studious.
- **Noor** -- teen girl, orange-and-teal patterned hijab, teal tunic dress with patterned trim over white sleeves, orange-and-white sneakers. Cheerful, energetic.
- **Ziad** -- teen boy, short tousled brown hair, blue-and-yellow zip hoodie over a white t-shirt, dark grey cargo pants, blue-and-white sneakers, on-ear headphones around his neck. The gamer.
- **Hamad** -- teen boy, white ghutra headscarf with black agal, white thobe, plain dark sneakers. Traditional Gulf style. Calm, kind.
- **Lumi** -- the mascot: a round yellow chick with a feather tuft, big eyes, rosy cheeks, small dark backpack with orange trim. Only appears if a prompt names it.
- Adults (a teacher, a parent, a waiter, a grandparent) appear only where a prompt says so, in modest Gulf-appropriate dress, and are never the focus.
"""

STYLE = ("Wide 16:9 illustrated scene in the Lumio English Teen Track style: flat vector cartoon with thick clean dark "
         "outlines, smooth soft shading, bright warm colors (orange, teal, yellow accents), expressive but not exaggerated "
         "faces, characters aged 13-16 with realistic teen proportions. Cinematic framing with a clear focal action in the "
         "center-left or center, a real environment with believable depth, and the bottom fifth of the image kept visually "
         "calm (soft, low-detail) so a caption box can sit over it. Culturally appropriate, modest, and positive. NO text, "
         "letters, numbers, speech bubbles, logos or watermarks anywhere in the image. Very high quality, consistent "
         "character designs exactly as described.")

LEVEL_NAMES = {"level3": "Everyday Life", "level4": "Smart Choices", "level5": "Telling My Story", "level6": "Looking Ahead"}


def lesson_titles(level):
    t = {}
    for f in glob.glob(os.path.join(ROOT, "lessons", level, "lesson*.json")):
        d = json.load(open(f, encoding="utf-8"))
        t[d["number"]] = d["title"]
    return t


def main():
    lines = ["# Teen Track scene coverage -- Levels 3-6 (two more scenes per lesson)", ""]
    lines.append("Every lesson in Levels 3-6 currently has ONE illustrated scene slide. The young levels have about three per "
                 "lesson, so this batch adds two more per lesson (Lessons 1-19; Lesson 20 is review and reuses earlier words). "
                 "Each scene shows one of the lesson's own example sentences acted out by our characters, with the sentence "
                 "in the caption box, its key words highlighted, an Arabic line and a play button -- exactly like the existing "
                 "scene slides. The slides are already wired: each one appears automatically as soon as its image is dropped in, "
                 "so you can send these in any order or batch.")
    lines.append("")
    lines.append("**Save as:** the exact filename shown on each prompt, under `assets/vocab-scenes/<level>/`. "
                 "**Format:** JPEG, 16:9, minimum 1467 x 825 px (larger is fine), no transparency.")
    lines.append("")
    lines.append(CAST)
    lines.append("## Shared style block -- already appended to EVERY prompt below")
    lines.append(f"> {STYLE}")
    lines.append("")
    total = skipped = 0
    for level in ["level3", "level4", "level5", "level6"]:
        titles = lesson_titles(level)
        lines.append("---")
        lines.append("")
        lines.append(f"## {level.upper()} -- {LEVEL_NAMES[level]}")
        lines.append("")
        for num in range(1, 20):
            for i, (en, bold, ar, stage) in enumerate(EXTRA[level].get(num, []), start=2):
                fname = f"{num:02d}-{i}.jpg"
                if os.path.exists(os.path.join(ROOT, "assets", "vocab-scenes", level, fname)):
                    skipped += 1
                    continue
                total += 1
                lines.append(f"**`{level}/{fname}`** -- Lesson {num:02d} · {titles.get(num, '')} -- *{en}*")
                lines.append(f"> {stage} The moment to show is exactly: \"{en}\" -- show it through actions, expressions and props, never as written words. {STYLE}")
                lines.append("")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Wrote {total} prompts ({skipped} already have images) -> {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
