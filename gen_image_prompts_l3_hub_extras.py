# -*- coding: utf-8 -*-

STYLE = ("Simple flat vector illustration for a children's English-learning app. "
         "Bright cheerful colors, thick clean black outlines, soft rounded shapes, "
         "one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG "
         "cutout, no background color, no shadow plane, no scenery behind the "
         "subject), no text or letters anywhere in the image, no watermark, "
         "square 1:1 composition, friendly and warm, aimed at Arabic-speaking "
         "kids ages 6-9. If your tool cannot export true transparency, use a "
         "plain solid white background instead so it can be removed cleanly.")

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

DESC = {
  "up": "a cartoon arrow pointing straight up, bright orange, with a small cartoon bird flying upward beside it",
  "down": "a cartoon arrow pointing straight down, teal blue, with a small cartoon raindrop falling beside it",
  "out": "a cartoon open door with a small character silhouette stepping outside through it",
  "open": "a cartoon treasure chest with its lid wide open, sparkle inside",
  "closed": "a cartoon treasure chest shut tight with a padlock on it",
  "grass": "a small patch of bright green cartoon grass tufts",
  "river": "a cartoon winding blue river between two green grassy banks, top-down curve view",
  "sea": "a cartoon wave of blue sea water with a small whitecap foam curl",
  "sky": "a cartoon blue sky patch with two fluffy white clouds and a sun peeking in the corner",
  "cloud": "a single fluffy white cartoon cloud, rounded and soft",
  "forest": "a small cluster of three cartoon pine and round-leaf trees together",
  "wood": "a stack of three cartoon brown wooden logs with visible wood-grain rings",
  "plastic": "a cartoon plastic water bottle, bright blue with a cap",
  "metal": "a cartoon shiny metal tin can, silver with a visible seam line",
  "glass": "a cartoon clear drinking glass, empty, with light reflection lines",
  "paper": "a cartoon sheet of white paper with one corner curled up",
  "stone": "a cartoon smooth grey stone/pebble, rounded oval shape",
  "proud": "a cartoon kid standing tall with hands on hips and a big confident smile, chest out",
  "worried": "a cartoon kid biting their lip with furrowed eyebrows and a small sweat drop",
  "confused": "a cartoon kid scratching their head with a big question mark floating above them",
  "shy": "a cartoon kid peeking out from behind their own hands, blushing cheeks",
  "brave": "a cartoon kid standing confidently with a small cape, fist raised",
  "curious": "a cartoon kid leaning forward with wide sparkling eyes and a magnifying glass",
  "first": "a small gold cartoon trophy with a large number 1 medal shape (numeral only, no other text)",
  "second": "a small silver cartoon medal shape with the number 2 on it (numeral only, no other text)",
  "third": "a small bronze cartoon medal shape with the number 3 on it (numeral only, no other text)",
  "last": "a cartoon finish-line flag (checkered pattern) with a small turtle character just arriving",
  "next": "a cartoon curved arrow pointing forward/right, bright orange, playful swoosh style",
}

order = ["up","down","out","open","closed","grass","river","sea","sky","cloud","forest",
         "wood","plastic","metal","glass","paper","stone",
         "proud","worried","confused","shy","brave","curious",
         "first","second","third","last","next"]

missing_desc = [w for w in order if w not in DESC]
if missing_desc:
    print("WARNING missing descriptions:", missing_desc)

out_lines = []
out_lines.append("# Level 3 — Vocab Hub extras (Opposites/Nature/Materials/Feelings/Ordinals)\n")
out_lines.append(
    "These 28 words are only used in the English Hub's Vocabulary deck for "
    "Level 3 (Opposites, Nature, Materials, Feelings & Reactions, Ordinal "
    "Numbers themes) — they're not part of the 20-lesson curriculum, which is "
    "why they weren't in the earlier batches. Transparent background baked "
    "into every prompt, same as before. Save each one named exactly as shown "
    "and drop into `assets/vocab/` — picked up automatically.\n"
)
out_lines.append(f"**Master style (already appended to every prompt below):**\n> {STYLE}\n")
out_lines.append("---\n")

BATCH_SIZE = 10
batch_num = 0
for i in range(0, len(order), BATCH_SIZE):
    batch_num += 1
    chunk = order[i:i+BATCH_SIZE]
    out_lines.append(f"## Batch {batch_num} ({len(chunk)} images)\n")
    for w in chunk:
        fname = f"{slug(w)}.png"
        prompt = f"{DESC[w]}. {STYLE}"
        out_lines.append(f"**`{fname}`** — *{w}*")
        out_lines.append(f"> {prompt}\n")

with open("_docs/level3-vocab-hub-extra-prompts.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

print(f"Wrote {len(order)} prompts across {batch_num} batches (max {BATCH_SIZE}/batch)")
