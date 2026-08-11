# -*- coding: utf-8 -*-

STYLE = ("Atmospheric, moody, painterly illustration (digital painting style, "
         "not photographic, no real identifiable people, no readable text or "
         "letters anywhere in the image). Wide landscape format, 16:9 aspect "
         "ratio (e.g. 1600x900 or larger). Dark, night-time-plausible color "
         "palette with deep purples, indigos, and navy shadows, warm accent "
         "lighting (amber, teal, or soft orange glows) picking out key details "
         "-- this sits BEHIND app text and white cards, so keep it moody and "
         "atmospheric rather than bright or busy, with soft/blurred edges and "
         "enough negative space that overlaid text stays readable. Aimed at "
         "ages 9-13, stylish and a little cinematic, never cluttered. Since "
         "this level is about future plans and looking ahead, lean into a "
         "forward-looking, aspirational quality -- horizons, open paths, "
         "dawn light, a sense of possibility rather than looking back.")

LEVEL6 = {
    1: ("My Plans", "A figure silhouette standing at a window looking out at a glowing city skyline at dawn, hopeful forward-looking mood"),
    2: ("I Think It Will...", "An abstract crystal-ball-like glowing orb floating above open hands, soft swirling light suggesting prediction"),
    3: ("This Weekend I'm...", "A calendar page glowing softly with one day highlighted, warm light beaming from it like an event about to happen"),
    4: ("While I Was...", "Two overlapping soft-focus scenes blending, one warm one cool, suggesting an interrupted moment in time"),
    5: ("Rules & Duties", "A softly lit checklist/clipboard shape glowing warm, with a small shield-like badge nearby, orderly calm mood"),
    6: ("How You Do It", "An abstract flowing ribbon of light moving smoothly and gracefully across the frame, suggesting manner and style"),
    7: ("Even Better", "Two glowing paths side by side, one path brighter and more elevated than the other, comparative mood"),
    8: ("Weekend Plans", "A warm dawn scene with a backpack and a path leading toward a distant glowing horizon"),
    9: ("Predictions About Us", "A group of soft glowing orbs/lights floating together above a horizon, symbolizing many possible futures"),
    10: ("Rules at Home", "A cozy house silhouette at dusk with warm window light, a small clock glowing above it"),
    11: ("The Way We Talk", "Soft overlapping speech-bubble-shaped light glows floating gently in warm darkness"),
    12: ("Which Is Better?", "A glowing balance scale silhouette with warm light on one side, cool light on the other"),
    13: ("Multitasking", "Two translucent overlapping scene-glows blending together, suggesting simultaneous action, warm and cool mixing"),
    14: ("Next Year", "A glowing pathway curving up and over a hill toward a bright sunrise horizon, hopeful mood"),
    15: ("Class Debate", "Two glowing speech-bubble shapes facing each other with a balance-scale glow between them"),
    16: ("Getting Ready", "A backpack glowing softly beside a checklist shape, warm dawn light, preparation mood"),
    17: ("Doing It Right", "A glowing checkmark shape formed from soft light strokes, warm and precise, orderly mood"),
    18: ("Comparing Cultures", "A softly glowing globe silhouette with warm light points marking different places, a sense of wonder and comparison"),
    19: ("Reading Adventure: The School Trip", "A school bus silhouette glowing warmly on a road leading toward a bright horizon, adventurous mood"),
    20: ("Review + My Future Plans Project", "A glowing vision-board-like collage of soft light shapes -- a path, a star, a calendar -- warm hopeful dawn light, forward-looking closing mood"),
}

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

out_lines = []
out_lines.append("# Level 6 — Per-Lesson Background Image Prompts\n")
out_lines.append(
    "20 background scenes, one per lesson. Save each one named exactly "
    "as shown and drop into `assets/lesson-bg/level6/` -- picked up "
    "automatically, with graceful fallback to the theme-color background "
    "for any lesson without an image yet.\n"
)
out_lines.append(f"**Master style (already appended to every prompt below):**\n> {STYLE}\n")
out_lines.append("---\n")
batch_size = 10
items = sorted(LEVEL6.items())
for b in range(0, len(items), batch_size):
    chunk = items[b:b + batch_size]
    out_lines.append(f"## Batch {b // batch_size + 1} ({len(chunk)} images)\n")
    for num, (title, desc) in chunk:
        fname = f"{num:02d}.jpg"
        prompt = f"{desc}. {STYLE}"
        out_lines.append(f"**`{fname}`** — *Lesson {num}: {title}*")
        out_lines.append(f"> {prompt}\n")

with open("_docs/level6-lesson-bg-prompts.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))
print(f"level6: {len(items)} prompts written")
