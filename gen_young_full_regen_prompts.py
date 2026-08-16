# -*- coding: utf-8 -*-
"""Full regeneration of the young-character pose set (Omar, Sara, Noor,
Lumi) at the same high-quality standard already established for the
teen versions and Ziad/Hamad. This covers EVERY pose currently in use
across the platform for these 4 characters, not just the newer
additions -- the goal is one consistent quality bar everywhere, not a
mix of old and new renders."""

YOUNG_STYLE = ("Flat vector cartoon illustration, thick clean black outlines, "
    "warm brown skin tone, simple friendly rounded facial features, big "
    "expressive eyes, rosy cheeks. Character is a child around 6-8 years "
    "old, slightly oversized head, short simple limbs, matching proportions "
    "consistently across every pose. ISOLATED ON A FULLY TRANSPARENT "
    "BACKGROUND (PNG cutout, no background color, no shadow plane, no "
    "scenery), no text or letters anywhere in the image, no watermark. "
    "Portrait orientation, roughly 170x290px proportions (tall and narrow, "
    "character fills the frame top to bottom with minimal empty margin on "
    "the sides). Very high quality, clean confident linework, smooth "
    "shading -- this is a full quality-bar regeneration, so every pose "
    "should look like it belongs to the exact same polished character "
    "sheet, not mixed styles.")

LUMI_STYLE = ("Flat vector cartoon illustration of a round, friendly yellow "
    "chick-like mascot creature: soft rounded blob body, a small feather "
    "tuft on top of the head, one or two large expressive round eyes, a "
    "small orange beak/mouth area, rosy cheek circles, stubby simple arms "
    "and legs, warm golden-yellow color with a cream-colored belly patch, "
    "thick clean black/brown outline. Often wears a small dark backpack "
    "with orange trim as a signature accessory in poses that suit it. "
    "ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background "
    "color, no shadow plane, no scenery), no text or letters anywhere in "
    "the image, no watermark. Very high quality, clean confident linework, "
    "smooth shading -- same mascot design in every pose, consistent "
    "polished quality bar, not mixed styles.")

CHARACTERS = {
    "omar": {
        "identity": ("Omar, a young boy character -- short black hair, warm brown skin, "
            "wearing a white thobe (long robe) with orange trim at the collar and "
            "cuffs, orange sandals. Calm, friendly, curious personality."),
        "style": YOUNG_STYLE,
        "poses": {
            "wave": "waving hello with one raised hand, warm welcoming smile, facing forward",
            "happy": "standing with a big cheerful open smile, relaxed confident pose",
            "point": "pointing to the side with one hand, engaged expression",
            "think": "one hand resting thoughtfully on chin, slight head tilt, curious thinking expression",
            "thumbs": "giving an enthusiastic thumbs-up with one hand, big proud smile",
            "surprised": "wide eyes, eyebrows raised, both hands slightly up near shoulders, mouth open in a surprised 'oh!' expression",
            "celebrate": "both arms raised straight up in excitement, big joyful open-mouth smile, a little jump/bounce energy",
            "look-left": "body and head turned to face the left side of the frame, curious/alert expression",
            "look-right": "body and head turned to face the right side of the frame, curious/alert expression, mirrored from look-left",
            "jump": "mid-air jump, both arms up, legs bent, joyful energetic expression",
            "pencil": "holding a pencil up near chest height, focused/proud expression, as if about to write",
            "read": "holding an open book at chest height, looking down at the pages with interest",
            "run": "mid-stride running pose, one arm forward one back, motion energy, excited expression",
            "sit": "sitting cross-legged on the ground, relaxed friendly expression",
            "stand": "simple neutral standing pose, hands relaxed at sides, gentle smile, facing forward",
        },
    },
    "sara": {
        "identity": ("Sara, a young girl character -- glasses, brown wavy shoulder-length "
            "hair, wearing an orange cardigan over a white collared top and an orange "
            "skirt. Warm, teacher-like, encouraging personality."),
        "style": YOUNG_STYLE,
        "poses": {
            "wave": "waving hello with one raised hand, warm welcoming smile, facing forward",
            "point": "pointing to the side with one hand, engaged expression",
            "think": "one hand resting thoughtfully on chin, slight head tilt, curious thinking expression",
            "thumbs": "giving an enthusiastic thumbs-up with one hand, big proud smile",
            "surprised": "wide eyes, eyebrows raised, both hands slightly up near shoulders, mouth open in a surprised 'oh!' expression, glasses slightly catching light",
            "celebrate": "both arms raised straight up in excitement, big joyful open-mouth smile",
            "look-left": "body and head turned to face the left side of the frame, curious/alert expression",
            "look-right": "body and head turned to face the right side of the frame, curious/alert expression, mirrored from look-left",
            "books": "holding a small stack of books against her chest with both arms, warm smile",
            "clap": "both hands clapping together at chest height, happy encouraging expression",
            "explain": "both hands open and gesturing outward at chest height, mid-explanation pose, friendly approachable expression",
            "read": "holding an open book at chest height, looking down at the pages with interest",
            "sit": "sitting cross-legged on the ground, relaxed friendly expression",
            "teach-board": "standing beside a small whiteboard/easel, one hand gesturing toward it, teaching pose",
            "write": "holding a pencil to a notebook or clipboard, mid-writing, focused expression",
        },
    },
    "noor": {
        "identity": ("Noor, a young girl character -- wearing an orange and teal patterned "
            "hijab (headscarf), a teal and orange dress with patterned trim, warm brown "
            "skin. Cheerful, warm, energetic personality."),
        "style": YOUNG_STYLE,
        "poses": {
            "wave": "waving hello with one raised hand, warm welcoming smile, facing forward",
            "happy": "standing with a big cheerful open smile, relaxed confident pose",
            "point": "pointing to the side with one hand, engaged expression",
            "think": "one hand resting thoughtfully on chin, slight head tilt, curious thinking expression",
            "thumbs": "giving an enthusiastic thumbs-up with one hand, big proud smile",
            "surprised": "wide eyes, eyebrows raised, both hands slightly up near shoulders, mouth open in a surprised 'oh!' expression",
            "celebrate": "both arms raised straight up in excitement, big joyful open-mouth smile",
            "look-left": "body and head turned to face the left side of the frame, curious/alert expression",
            "look-right": "body and head turned to face the right side of the frame, curious/alert expression, mirrored from look-left",
            "backpack": "wearing a small backpack, one strap held with a hand, cheerful ready-for-school expression",
            "jump": "mid-air jump, both arms up, legs bent, joyful energetic expression",
            "read": "holding an open book at chest height, looking down at the pages with interest",
            "sit": "sitting cross-legged on the ground, relaxed friendly expression",
            "stand": "simple neutral standing pose, hands relaxed at sides, gentle smile, facing forward",
            "write": "holding a pencil to a notebook or clipboard, mid-writing, focused expression",
        },
    },
    "lumi": {
        "identity": ("Lumi, the platform's mascot character -- a round friendly yellow "
            "chick-like creature with a feather tuft, big expressive eye(s), small "
            "orange beak, rosy cheeks, stubby arms and legs, cream belly patch. "
            "Playful, encouraging, endlessly enthusiastic personality."),
        "style": LUMI_STYLE,
        "poses": {
            "celebrate": "both stubby arms raised straight up in excitement, big joyful beak-open smile, a little bounce energy",
            "look-left": "body and head turned to face the left side of the frame, curious/alert expression, one stubby arm raised slightly as if pointing that way",
            "look-right": "body and head turned to face the right side of the frame, curious/alert expression, mirrored from look-left",
            "surprised": "eye(s) wide open, both stubby arms up near the sides of the head, beak open in a surprised little 'oh' shape",
            "thumbs": "one stubby arm giving an enthusiastic thumbs-up gesture, big happy beak-smile",
            "point": "one stubby arm pointing forward/to the side as if directing attention to something off-frame, engaged excited expression",
            "books": "holding a small stack of books with both stubby arms, warm happy expression",
            "magnify": "holding a small magnifying glass up near one eye, curious investigating expression",
            "megaphone": "holding a small megaphone/cone to its beak with both arms, excited announcing pose",
            "pencil": "holding a pencil upright with one stubby arm/wing, proud focused expression",
            "read": "sitting with a small open book, looking down at the pages with interest",
            "teach-board": "standing beside a small whiteboard/easel, one stubby arm gesturing toward it, teaching pose",
            "wave-book": "one stubby arm waving hello, the other holding a small open book at chest height, warm welcoming wink, small sparkle accents",
        },
    },
}

out_lines = []
out_lines.append("# Full Quality Regeneration — Omar, Sara, Noor, Lumi (Young Versions)\n")
out_lines.append(
    "Every pose currently used across the platform for these 4 characters "
    "(Pre-A/Level 1/Level 2), regenerated at one consistent high-quality "
    "bar -- this replaces the mix of older and newer renders currently "
    "live with a single matching set. 58 poses total across 4 characters "
    "(`welcome-hero` not included here since that one's already at the "
    "current quality standard). Save each result named exactly as shown "
    "and drop into `assets/story/characters/`, overwriting the existing "
    "file of the same name.\n"
)
out_lines.append("---\n")
total = 0
for char_key, data in CHARACTERS.items():
    out_lines.append(f"## {char_key} ({len(data['poses'])} poses)\n")
    out_lines.append(f"**Character identity (include in every prompt for {char_key}):**\n> {data['identity']}\n")
    out_lines.append(f"**Master style (include in every prompt for {char_key}):**\n> {data['style']}\n")
    for pose_key, pose_desc in data["poses"].items():
        fname = f"{char_key}-{pose_key}.png"
        prompt = f"{data['identity']} {pose_desc}. {data['style']}"
        out_lines.append(f"**`{fname}`** — *{pose_key}*")
        out_lines.append(f"> {prompt}\n")
        total += 1
    out_lines.append("---\n")

with open("_docs/young-characters-full-regeneration.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

print(f"Wrote {total} prompts across {len(CHARACTERS)} characters -> _docs/young-characters-full-regeneration.md")
