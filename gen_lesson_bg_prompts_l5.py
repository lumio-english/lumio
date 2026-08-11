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
         "this level is about telling stories from the past, lean into a "
         "reflective, 'looking back' / memory-like quality -- slightly "
         "softened edges, like a fond recollection.")

LEVEL5 = {
    1: ("What I Did This Weekend", "A cozy living room at dusk, warm lamp light, a weekend scene glimpsed through a window -- a football and a movie poster suggested softly in the background, reflective mood"),
    2: ("Yesterday's Adventure", "A dreamlike memory-scene of a mall or city street at dusk, warm shop lights glowing, soft motion blur suggesting a day already passed"),
    3: ("Did You...?", "Two silhouettes facing each other in soft conversation at dusk, a speech-bubble-like glow between them, warm streetlight"),
    4: ("How It Was", "A softly blurred memory of a crowded event space -- concert lights, warm stage glow fading into darkness, nostalgic mood"),
    5: ("Back Then", "A quiet empty room with a single warm spotlight on a party decoration left over, suggesting an event that already happened"),
    6: ("Time Travel", "An abstract clock face dissolving into soft swirling light trails, warm-to-cool gradient suggesting looking back through time"),
    7: ("And Then...", "A winding warm-lit path through soft darkness with glowing footprint-like markers leading forward, sequential storytelling mood"),
    8: ("Why It Happened", "A single warm spotlight illuminating a light bulb silhouette connected by a glowing thread to a small question mark shape"),
    9: ("How I Felt", "A soft abstract scene of overlapping translucent emotion-colored clouds (warm orange, cool blue) blending together at dusk"),
    10: ("What Was Happening", "A rain-streaked window at night, warm room light glowing behind it, soft blurred motion suggesting something was in progress"),
    11: ("Study Story", "A cozy desk at night lit by a single warm lamp, an open notebook and a softly glowing clock, quiet focus"),
    12: ("The Big Trip", "A dreamy airport or airplane window view at dusk, warm clouds glowing at sunset, sense of a journey taken"),
    13: ("What Went Wrong", "A softly lit room with one small broken/cracked object catching warm light, gentle rather than dramatic mood"),
    14: ("The Party", "A warmly lit room after a party -- soft string lights, a few balloons, gentle golden glow, nostalgic afterglow feeling"),
    15: ("A Day to Remember", "A sunrise-to-sunset gradient sky compressed into one warm dreamy scene, suggesting a full memorable day"),
    16: ("While It Happened", "Two overlapping soft-focus scenes blending into each other, warm and cool light mixing, suggesting simultaneous action"),
    17: ("Interview a Classmate", "Two silhouettes sitting across from each other at a warm-lit table, soft conversational mood, dusk lighting"),
    18: ("Movie Night Recap", "A cozy room lit only by the warm glow of a screen, a couch with blankets, popcorn bowl, relaxed evening mood"),
    19: ("Reading Adventure: The Lost Backpack", "A school hallway at dusk with a single backpack left under warm hallway light, quiet mystery mood"),
    20: ("Review + My Story Project", "A warm-lit desk scene with an open journal glowing softly, scattered small photo-like light shapes around it, reflective closing mood"),
}

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

out_lines = []
out_lines.append("# Level 5 — Per-Lesson Background Image Prompts\n")
out_lines.append(
    "20 background scenes, one per lesson. Save each one named exactly "
    "as shown and drop into `assets/lesson-bg/level5/` -- picked up "
    "automatically, with graceful fallback to the theme-color background "
    "for any lesson without an image yet.\n"
)
out_lines.append(f"**Master style (already appended to every prompt below):**\n> {STYLE}\n")
out_lines.append("---\n")
batch_size = 10
items = sorted(LEVEL5.items())
for b in range(0, len(items), batch_size):
    chunk = items[b:b + batch_size]
    out_lines.append(f"## Batch {b // batch_size + 1} ({len(chunk)} images)\n")
    for num, (title, desc) in chunk:
        fname = f"{num:02d}.jpg"
        prompt = f"{desc}. {STYLE}"
        out_lines.append(f"**`{fname}`** — *Lesson {num}: {title}*")
        out_lines.append(f"> {prompt}\n")

with open("_docs/level5-lesson-bg-prompts.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))
print(f"level5: {len(items)} prompts written")
