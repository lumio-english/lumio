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
  "recipe": "a cartoon recipe card with a small spoon and whisk icon on it (no readable text, just simple lines suggesting writing)",
  "boil": "a cartoon pot of water on a stove with bubbles and steam rising",
  "fry": "a cartoon frying pan with an egg sizzling in it",
  "bake": "a cartoon oven with a tray of cookies inside, warm glow",
  "mix": "a cartoon mixing bowl with a whisk stirring batter, small swirl motion lines",
  "slice": "a cartoon knife slicing through a loaf of bread, one slice falling away",
  "sick": "a cartoon kid in bed with a thermometer in mouth and a sad expression",
  "healthy": "a cartoon kid flexing an arm muscle next to a big red apple, big smile",
  "headache": "a cartoon kid holding both hands to their head with small pain lines around the forehead",
  "fever": "a cartoon thermometer showing a high red reading, small heat wavy lines around it",
  "medicine": "a cartoon medicine bottle and spoon with a dose of syrup",
  "exercise": "a cartoon kid doing a jumping jack, arms and legs spread, energetic pose",
  "left": "a cartoon arrow pointing left, bright teal, rounded style",
  "right": "a cartoon arrow pointing right, bright orange, rounded style",
  "north": "a cartoon compass with the needle pointing up/north, N marked simply with a small triangle (no readable text)",
  "south": "a cartoon compass with the needle pointing down/south, S marked simply with a small triangle (no readable text)",
  "corner": "a cartoon street corner with two paths meeting at a right angle and a small street sign post",
  "near": "two cartoon houses drawn close together side by side",
  "far": "two cartoon houses drawn far apart with a long dotted path between them",
  "computer": "a cartoon laptop computer, screen open, friendly rounded shape",
  "internet": "a cartoon globe with wifi signal waves radiating from the top",
  "screen": "a cartoon rectangular monitor screen glowing softly blue",
  "button": "a single cartoon round push-button, bright red, with a highlight",
  "charger": "a cartoon phone charging cable with a plug and a small lightning bolt icon",
  "video": "a cartoon play-button triangle inside a rounded rectangle frame, like a video player",
  "message": "a cartoon speech-bubble chat icon with three small dots inside",
  "ask": "a cartoon kid raising a hand with a question mark floating above them",
  "answer": "a cartoon kid with hand on chest and a small light bulb glowing above their head",
  "explain": "a cartoon kid gesturing with both hands open next to a simple diagram/chart shape",
  "shout": "a cartoon kid with mouth wide open and bold sound-wave lines bursting outward",
  "whisper": "a cartoon kid cupping a hand near their mouth, leaning in, small soft sound lines",
}

order = ["recipe","boil","fry","bake","mix","slice",
         "sick","healthy","headache","fever","medicine","exercise",
         "left","right","north","south","corner","near","far",
         "computer","internet","screen","button","charger","video","message",
         "ask","answer","explain","shout","whisper"]

missing_desc = [w for w in order if w not in DESC]
if missing_desc:
    print("WARNING missing descriptions:", missing_desc)

out_lines = []
out_lines.append("# Level 4 — Vocab Hub extras (Cooking/Health/Directions/Technology/Communication)\n")
out_lines.append(
    "These 31 words are only used in the English Hub's Vocabulary deck for "
    "Level 4 -- not part of the 20-lesson curriculum, same situation as the "
    "Level 3 hub-extras batch. Transparent background baked into every "
    "prompt. Save each one named exactly as shown and drop into "
    "`assets/vocab/` -- picked up automatically.\n"
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

with open("_docs/level4-vocab-hub-extra-prompts.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

print(f"Wrote {len(order)} prompts across {batch_num} batches (max {BATCH_SIZE}/batch)")
