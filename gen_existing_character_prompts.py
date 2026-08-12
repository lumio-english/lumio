# -*- coding: utf-8 -*-

YOUNG_STYLE = ("Flat vector cartoon illustration matching Lumio English's existing "
    "young-character style exactly: thick clean black outlines, warm brown skin "
    "tone, simple friendly rounded facial features, big expressive eyes, rosy "
    "cheeks. Character is a child around 6-8 years old, slightly oversized head, "
    "short simple limbs, matching proportions. Full body, standing, facing "
    "forward or as the pose describes. ISOLATED ON A FULLY TRANSPARENT "
    "BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery), "
    "no text or letters anywhere in the image, no watermark. Portrait "
    "orientation, roughly 170x290px proportions (tall and narrow, character "
    "fills the frame top to bottom with minimal empty margin on the sides). "
    "Very high quality, clean linework, consistent with the reference character "
    "described below -- this must look like the SAME character in a new pose, "
    "not a new design.")

LUMI_STYLE = ("Flat vector cartoon illustration matching Lumio English's existing "
    "mascot character exactly: a round, friendly yellow chick-like creature "
    "with a soft rounded blob body, a small feather tuft on top of the head, "
    "one large expressive round eye visible in profile/three-quarter views (or "
    "two large round eyes when facing forward), a small orange beak/mouth area, "
    "rosy cheek circles, stubby simple arms and legs, warm golden-yellow color "
    "with a cream-colored belly patch, thick clean black/brown outline. Often "
    "wears a small dark backpack with orange trim as a signature accessory. "
    "ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background "
    "color, no shadow plane, no scenery), no text or letters anywhere in the "
    "image, no watermark. Portrait orientation, character fills the frame top "
    "to bottom with minimal empty margin. Very high quality, clean linework, "
    "consistent with the reference character described below -- this must "
    "look like the SAME mascot in a new pose, not a new design.")

CHARACTERS = {
    "omar": {
        "identity": "Omar, a young boy character -- short black hair, warm brown skin, wearing a white thobe (long robe) with orange trim at the collar and cuffs, orange sandals. Calm, friendly, curious personality.",
        "style": YOUNG_STYLE,
        "poses": {
            "look-left":  "body and head turned to face the left side of the frame, curious/alert expression, one hand maybe shading eyes slightly",
            "look-right": "body and head turned to face the right side of the frame, curious/alert expression, mirrored from the look-left pose",
            "celebrate":  "both arms raised straight up in excitement, big joyful open-mouth smile, a little jump/bounce energy",
        },
    },
    "sara": {
        "identity": "Sara, a young girl character -- glasses, brown wavy shoulder-length hair, wearing an orange cardigan over a white collared top and an orange skirt. Warm, teacher-like, encouraging personality.",
        "style": YOUNG_STYLE,
        "poses": {
            "look-left":  "body and head turned to face the left side of the frame, curious/alert expression, one hand maybe shading eyes slightly",
            "look-right": "body and head turned to face the right side of the frame, curious/alert expression, mirrored from the look-left pose",
            "surprised":  "wide eyes, eyebrows raised, both hands slightly up near shoulders, mouth open in a surprised 'oh!' expression, glasses slightly catching light",
        },
    },
    "noor": {
        "identity": "Noor, a young girl character -- wearing an orange and teal patterned hijab (headscarf), a teal and orange dress with patterned trim, warm brown skin, sometimes wears a small backpack. Cheerful, warm, energetic personality.",
        "style": YOUNG_STYLE,
        "poses": {
            "look-left":  "body and head turned to face the left side of the frame, curious/alert expression, one hand maybe shading eyes slightly",
            "look-right": "body and head turned to face the right side of the frame, curious/alert expression, mirrored from the look-left pose",
            "surprised":  "wide eyes, eyebrows raised, both hands slightly up near shoulders, mouth open in a surprised 'oh!' expression",
        },
    },
    "lumi": {
        "identity": "Lumi, the platform's mascot character -- a round friendly yellow chick-like creature with a feather tuft, big expressive eye(s), small orange beak, rosy cheeks, stubby arms and legs, cream belly patch, often carries a small dark backpack with orange trim. Playful, encouraging, endlessly enthusiastic personality.",
        "style": LUMI_STYLE,
        "poses": {
            "look-left":  "body and head turned to face the left side of the frame, curious/alert expression, one small stubby arm raised slightly as if pointing that way",
            "look-right": "body and head turned to face the right side of the frame, curious/alert expression, mirrored from the look-left pose",
            "surprised":  "eye(s) wide open, both stubby arms up near the sides of the head, beak open in a surprised little 'oh' shape",
            "thumbs":     "one stubby arm giving an enthusiastic thumbs-up gesture, big happy beak-smile, other arm relaxed at the side",
            "point":      "one stubby arm pointing forward/to the side as if directing attention to something off-frame, engaged excited expression",
        },
    },
}

out_lines = []
out_lines.append("# Existing Characters — Missing Pose Prompts (Omar, Sara, Noor, Lumi)\n")
out_lines.append(
    "Same treatment as Ziad and Hamad: look-left/look-right plus a couple of "
    "extra reactions each character was missing, so the whole cast has "
    "consistent range. These are NOT redesigns -- every prompt describes that "
    "character's exact existing appearance. **For the best consistency, "
    "attach one of that character's existing images (listed below) alongside "
    "the text prompt if your tool supports image references** -- e.g. "
    "`assets/story/characters/omar-wave.png` for Omar. Save each result named "
    "exactly as shown and drop into `assets/story/characters/` -- same folder "
    "as the existing set, so they slot in directly.\n"
)
out_lines.append("---\n")
REFERENCE_FILE = {
    "omar": "assets/story/characters/omar-wave.png",
    "sara": "assets/story/characters/sara-wave.png",
    "noor": "assets/story/characters/noor-wave.png",
    "lumi": "assets/story/characters/lumi-hero.png",
}

for char_key, data in CHARACTERS.items():
    out_lines.append(f"## {char_key.title()} ({len(data['poses'])} new poses)\n")
    out_lines.append(f"**Reference image to attach:** `{REFERENCE_FILE[char_key]}`\n")
    out_lines.append(f"**Character identity (include in every prompt for {char_key.title()}):**\n> {data['identity']}\n")
    out_lines.append(f"**Master style (include in every prompt for {char_key.title()}):**\n> {data['style']}\n")
    for pose_key, pose_desc in data["poses"].items():
        fname = f"{char_key}-{pose_key}.png"
        prompt = f"{data['identity']} {pose_desc}. {data['style']}"
        out_lines.append(f"**`{fname}`** — *{pose_key}*")
        out_lines.append(f"> {prompt}\n")
    out_lines.append("---\n")

with open("_docs/existing-characters-missing-poses.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

total = sum(len(d["poses"]) for d in CHARACTERS.values())
print(f"Wrote {total} prompts across {len(CHARACTERS)} characters -> _docs/existing-characters-missing-poses.md")
