#!/usr/bin/env python3
"""Generate one full-scene image prompt per story page (all levels, all
parts, all pages) from story-content/<level>/partP-pageN.html.

Output: _docs/story-scene-prompts.md — Eslam pastes each prompt into
ChatGPT, saves the image under the exact filename shown, and sends it
back. migrate_story_scenes.py then swaps the composited pages for the
single-image layout (caption overlay + Hide/Show text button unchanged).

Re-run after any story text change: python3 gen_story_scene_prompts.py
"""
import re, html, os, glob

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "_docs", "story-scene-prompts.md")

STORIES = {
    "pre-a":  ("Lumi's Magic Map", ["The Mysterious Map", "The Whispering Forest", "The Family Picnic Village", "The Treasure Celebration"], "young"),
    "level1": ("The Treehouse Club", ["The Big Idea", "Building Day", "Grand Opening Prep", "The Backyard Party"], "young"),
    "level2": ("The Twelve Months Club", ["New Friends, New Family", "School Days", "A Year of Birthdays", "The Big Poster Party"], "young"),
    "level3": ("The Crew", ["Meet the Crew", "Around School", "Game Night", "The Big Match"], "teen"),
}

# ---- character briefs (must match the platform's existing cast) ----------
YOUNG = {
    "lumi":  "Lumi — the Lumio mascot: a round friendly yellow chick with a feather tuft, big expressive eyes, small orange beak, rosy cheeks, stubby arms and legs, cream belly patch, small dark backpack with orange trim (child-height, about as tall as the kids' shoulders)",
    "sara":  "Sara — girl about 8, curly brown hair, round glasses, orange cardigan over a white top and an orange skirt, warm and teacher-like",
    "omar":  "Omar — boy about 8, curly dark hair, warm brown skin, crisp white thobe (long Gulf robe) with subtle orange trim, no headscarf, calm and curious",
    "noor":  "Noor — girl about 8, teal-and-orange patterned hijab (headscarf), green dress, warm brown skin, cheerful and energetic",
    "ziad":  "Ziad — boy about 8, messy dark curly hair, blue zip-up jacket over a plain white T-shirt, jeans, playful gamer energy",
    "hamad": "Hamad — boy about 8, white thobe with white ghutra (headcloth) and black agal (cord), friendly and polite",
}
TEEN = {
    "lumi":  "Lumi — the Lumio mascot: a round friendly yellow chick with a feather tuft, big expressive eyes, small orange beak, rosy cheeks, stubby arms and legs, cream belly patch, small dark backpack with orange trim (drawn with the cleaner teen-track finish, same shape and colors)",
    "sara":  "Sara (teen, 14–15) — warm-orange hijab (headscarf), modest long-sleeve orange-and-white cardigan or top over a long modest skirt, round glasses, warm and encouraging",
    "omar":  "Omar (teen, 14–15) — short black hair, warm brown skin, crisp white thobe with subtle orange trim at collar and cuffs, no headscarf, calm and curious",
    "noor":  "Noor (teen, 14–15) — orange-and-teal patterned hijab, modest long tunic or dress with patterned trim in teal and orange, warm brown skin, cheerful",
    "ziad":  "Ziad (teen, 14–15) — messy dark curly hair, blue zip-up jacket over a plain white T-shirt, jeans, sneakers, upbeat gamer energy",
    "hamad": "Hamad (teen, 14–15) — white thobe with white ghutra and black agal, tall and polite, friendly",
}

POSE_WORDS = {
    "wave": "waving hello", "wave-book": "waving while holding a book", "welcome": "welcoming with open arms",
    "welcome-hero": "welcoming with open arms", "hero": "standing proudly", "explain": "explaining with an open hand",
    "happy": "smiling happily", "point": "pointing", "surprised": "surprised, mouth open", "jump": "jumping with joy",
    "celebrate": "cheering with both arms up", "clap": "clapping", "think": "thinking, finger on chin",
    "thumbs": "giving a thumbs-up", "read": "reading a book", "write": "writing in a notebook", "sit": "sitting",
    "stand": "standing", "run": "running", "look-left": "looking to the left", "look-right": "looking to the right",
    "pencil": "holding a big pencil", "books": "carrying a stack of books", "magnify": "holding a magnifying glass",
    "megaphone": "holding a megaphone", "teach-board": "teaching at a whiteboard", "high-five": "giving a high-five",
    "laugh": "laughing", "shrug": "shrugging", "phone": "looking at a phone", "backpack": "wearing a backpack, ready to go",
    "nervous": "looking nervous", "walk": "walking", "sit": "sitting down",
}

SETTINGS = {
    "classroom": "a bright, warm primary-school classroom (wooden desks, a whiteboard, colorful posters, big windows with sunlight)",
    "village": "a sunny Gulf village square with sand-colored houses, palm trees, a small market and warm afternoon light",
    "forest": "a friendly green forest with big leafy trees, dappled sunlight and soft grass",
    "forest-stream": "a friendly forest clearing beside a clear sparkling stream, smooth stones, dappled sunlight",
    "family-interior": "a cozy Gulf family living room (patterned floor cushions, a low table with tea and dates, warm lamps, a window)",
    "celebration": "a festive party scene with colorful balloons, bunting, a decorated table with treats and warm golden light",
    "library": "a cozy school library with tall wooden shelves full of colorful books, reading tables and soft light",
    "map": "an old-looking treasure map with a winding dotted path, small landmark drawings and a big X",
    "map-closeup": "a close-up of the magic treasure map lying on a desk, glowing softly at the edges",
    "toys": "a cheerful playroom full of toys (blocks, a toy car, a kite, a robot, a doll) with soft afternoon light",
    "treehouse-planning": "a backyard under a big leafy tree, with a sheet of paper plans, a pencil, a tape measure and a pile of wooden planks",
    "treehouse-building": "a backyard treehouse under construction on a big tree (planks, a ladder, a toolbox, a paint can), sunny day",
    "treehouse-finished": "a finished, freshly painted wooden treehouse on a big tree, rope ladder, small window, bunting, sunny backyard",
    "hangout-spot": "a relaxed teen hangout spot after school (a shaded bench under trees near the school gate, a small kiosk, skateboards, warm late-afternoon light)",
    "teen-room": "a modern teen bedroom with a desk, laptop, posters, string lights, a beanbag and a window",
    "school-hallway-teen": "a bright secondary-school hallway with lockers, a notice board and big windows",
    "game-night-room": "a cozy living room set up for game night: a big sofa, a TV with a video game paused, snacks, board games and warm lamp light",
    "sports-field": "a green school sports field with white lines, a goal, a small stand and a clear sky",
    "cafeteria": "a busy, bright school cafeteria with long tables, food trays and big windows",
    "gym": "a school gym with a wooden floor, basketball hoop and wall bars",
}

EXTRA_LABEL = {"animals": "animal", "family": "family member", "toys": "toy"}
FAMILY = {"mom": "the mother (modest abaya and hijab, warm smile)", "dad": "the father (white thobe and ghutra)",
          "grandma": "the grandmother (dark abaya, soft headscarf, glasses)", "grandpa": "the grandfather (white thobe, white ghutra, grey beard)",
          "brother": "a younger brother", "sister": "a younger sister (small hijab)", "baby": "a baby"}

MASTER_YOUNG = ("STYLE: warm children's storybook illustration for an English-learning app (ages 5–9) — semi-cel-shaded, "
    "thick clean outlines, soft rounded shapes, bright cheerful colors, warm golden light, gentle painterly backgrounds "
    "(matching Lumio's existing scene art). One consistent cast drawn exactly as described. NO TEXT, letters, numbers, "
    "speech bubbles, logos or watermarks anywhere in the image. Landscape 16:9 (1600x900).")
MASTER_TEEN = ("STYLE: polished, modern teen-friendly cartoon illustration for an English-learning app (ages 13–16) — clean "
    "thick outlines, realistic teen proportions, bright but slightly cooler palette with indigo/purple accents, cinematic "
    "warm-cool lighting, detailed backgrounds. Modest, age-appropriate Gulf styling. One consistent cast drawn exactly as "
    "described. NO TEXT, letters, numbers, speech bubbles, logos or watermarks anywhere in the image. Landscape 16:9 (1600x900).")

COMPOSITION = ("COMPOSITION (important — a caption box is overlaid on the bottom 30% of the picture): keep every face, hand "
    "and key action inside the TOP 65% of the frame; make the bottom third simple, low-detail ground/floor with nothing "
    "important there. Characters mid-shot to full-body, evenly lit, clearly readable expressions. Leave the top-left corner "
    "(where a small badge sits) free of faces.")


def strip_html(s):
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(s).replace("\\'", "'").strip()


def parse_page(path):
    src = open(path, encoding="utf-8").read()
    bgs = re.findall(r"backgrounds/([a-z-]+)\.jpg", src)
    chars = re.findall(r"characters/([a-z]+)-([a-z-]+)\.png", src)
    extras = re.findall(r"story/(animals|family|toys)/([a-z]+)\.png", src)
    m = re.search(r'<div class="caption">(.*?)</div>', src, re.S)
    ps = re.findall(r"<p[^>]*>(.*?)</p>", m.group(1), re.S) if m else []
    en = strip_html(ps[0]) if ps else ""
    interactive = 'id="colorGame"' in src
    return dict(bgs=bgs, chars=chars, extras=extras, en=en, interactive=interactive)


def describe_char(name, pose, track):
    briefs = YOUNG if track == "young" else TEEN
    pose = pose.replace("teen-", "")
    p = POSE_WORDS.get(pose, pose.replace("-", " "))
    return f"{briefs[name]}; here: {p}."


def build_prompt(level, part_idx, page, info, track):
    master = MASTER_YOUNG if track == "young" else MASTER_TEEN
    setting_keys = [b for b in info["bgs"] if b not in ("map", "map-closeup")] or info["bgs"] or ["village"]
    setting = SETTINGS.get(setting_keys[0], setting_keys[0].replace("-", " "))
    lines = [master, ""]
    lines.append(f"SETTING: {setting}.")
    if "map" in info["bgs"] and setting_keys[0] != "map":
        lines.append("PROP: the magic treasure map (old paper, winding dotted path, small landmark drawings, a big X) is visible and clearly the center of attention, glowing softly.")
    seen, cl = set(), []
    for name, pose in info["chars"]:
        if name in seen:
            continue
        seen.add(name)
        cl.append(f"- {describe_char(name, pose, track)}")
    if cl:
        lines.append("CHARACTERS (only these, exactly as described — same faces and outfits on every page):")
        lines += cl
    if info["extras"]:
        ex = []
        for kind, item in info["extras"]:
            ex.append(FAMILY.get(item, item) if kind == "family" else f"a friendly cartoon {item}")
        lines.append("ALSO IN THE SCENE: " + ", ".join(dict.fromkeys(ex)) + ".")
    lines.append("")
    lines.append(f'THE MOMENT TO SHOW (illustrate exactly this; quoted lines are what characters are saying — show it through expressions, gestures and props, never as written words): "{info["en"]}"')
    lines.append("")
    lines.append(COMPOSITION)
    if info["interactive"]:
        lines.append("SPECIAL: this page has an interactive color game placed in the middle band. Show the map close-up in the upper third only, and keep the MIDDLE band (35%–70% of the height) a calm, plain, softly lit desk surface with no objects — buttons will be placed there.")
    return "\n".join(lines)


def main():
    out = ["# Lumio Story — Full-Scene Image Prompts (one per page)", "",
           "New approach: every story page becomes ONE generated picture that already contains the setting, the characters "
           "and the action. The platform overlays the bilingual caption (with the Hide/Show text button) on top, so the "
           "picture itself must contain NO text.", "",
           "Save each image with the exact filename shown and put it in `assets/story/scenes/<level>/`. "
           "Ideal size 1600x900 (16:9). If ChatGPT only gives 1536x1024 (3:2) that is fine — it is center-cropped to 16:9 "
           "automatically when integrated, so keep the important content away from the very top and bottom edges.", "",
           "TIP for consistency: start each ChatGPT session by uploading 2–3 existing character images from "
           "`assets/story/characters/` (young: sara-wave, omar-wave, noor-wave, lumi-hero, ziad-wave, hamad-wave; "
           "teen: the *-teen-happy files) and say \"use these as the reference for the cast\". Generate one part (4–10 pages) "
           "per session so the style stays consistent.", ""]
    total = 0
    for level, (title, parts, track) in STORIES.items():
        files = glob.glob(os.path.join(ROOT, "story-content", level, "part*-page*.html"))
        pages = sorted(((int(m.group(1)), int(m.group(2)), f) for f in files
                        for m in [re.search(r"part(\d+)-page(\d+)", f)]))
        out.append(f"\n---\n\n# {level.upper()} — \"{title}\" ({len(pages)} pages, {track} cast)\n")
        cur = None
        for p, n, f in pages:
            if p != cur:
                cur = p
                out.append(f"\n## Part {p} of 4 — {parts[p-1]}\n")
            info = parse_page(f)
            fname = f"assets/story/scenes/{level}/p{p}-{n:02d}.jpg"
            exists = os.path.exists(os.path.join(ROOT, fname))
            out.append(f"### {level} / Part {p} / Page {n}  →  `{fname}`  ({'EXISTS — REPLACE' if exists else 'NEW'})")
            out.append(f"_Caption on this page:_ {info['en']}\n")
            out.append("```")
            out.append(build_prompt(level, p, n, info, track))
            out.append("```\n")
            total += 1
    open(OUT, "w", encoding="utf-8").write("\n".join(out))
    print(f"Wrote {total} prompts -> {OUT}")


if __name__ == "__main__":
    main()
