# -*- coding: utf-8 -*-
"""Teen ('grown up') versions of the 4 remaining characters -- Omar,
Sara, Noor, Lumi -- matching the exact same pose set already built for
Ziad-teen and Hamad-teen, so the whole cast has equal-depth teen
representation on Level 3-6. Per direct instruction: teen girl
characters (Sara, Noor) must be veiled (hijab) and dressed in modest
Arabic-appropriate clothing -- Noor already wears a hijab as a young
character so this is a continuation of her existing identity aged up;
Sara does not currently wear one, so her teen version adds it as a
deliberate, instructed identity change, not an inconsistency."""

TEEN_STYLE = ("Flat vector illustration in the same bright cheerful cartoon "
    "style as the platform's teen characters Ziad and Hamad (thick clean "
    "outlines, warm skin tones, expressive but not exaggerated features), "
    "drawn as a teenager around 13-16 years old -- taller, more realistic "
    "proportions than the young child version of this character, "
    "contemporary casual teen styling. ISOLATED ON A FULLY TRANSPARENT "
    "BACKGROUND (PNG cutout, no background color, no shadow plane, no "
    "scenery), no text or letters anywhere in the image, no watermark. "
    "Portrait orientation, character fills the frame top to bottom with "
    "minimal empty margin. Very high quality, clean linework, consistent "
    "with Ziad-teen and Hamad-teen's art quality -- this is for a Teen "
    "Track English-learning app aimed at Arabic-speaking students ages "
    "13-16, so keep the styling age-appropriate, stylish, and modest.")

LUMI_TEEN_STYLE = ("Flat vector illustration matching Lumio English's "
    "existing mascot character exactly in shape and identity -- a round "
    "yellow chick-like creature with a feather tuft, big expressive eye(s), "
    "small orange beak, rosy cheeks, stubby arms and legs, cream belly "
    "patch -- but rendered with the more polished, slightly sharper linework "
    "and confident posing used for the platform's Teen Track (matching "
    "Ziad-teen and Hamad-teen's art quality/energy level), NOT a redesign "
    "of the character itself, just a more mature/confident illustration "
    "treatment appropriate for an older-student-facing screen. ISOLATED ON "
    "A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no "
    "shadow plane, no scenery), no text or letters anywhere in the image, "
    "no watermark. Very high quality, clean linework.")

POSES = {
    "wave":       "waving hello with one raised hand, warm welcoming smile, facing forward",
    "happy":      "standing with a big cheerful open smile, relaxed confident pose",
    "point":      "pointing to the side with one hand, as if directing attention to something off-frame, engaged expression",
    "think":      "one hand resting thoughtfully on chin, slight head tilt, curious thinking expression",
    "thumbs":     "giving an enthusiastic thumbs-up with one hand, big proud smile",
    "surprised":  "wide eyes, eyebrows raised, both hands slightly up near shoulders, mouth open in a surprised 'oh!' expression",
    "celebrate":  "both arms raised straight up in excitement, big joyful open-mouth smile, a little energetic stance",
    "look-left":  "body and head turned to face the left side of the frame, curious/alert expression, one hand maybe shading eyes slightly",
    "look-right": "body and head turned to face the right side of the frame, curious/alert expression, mirrored from the look-left pose",
    "explain":    "both hands open and gesturing outward at chest height, mid-explanation pose, friendly approachable expression",
}
WELCOME_POSE = ("Full body 'welcome hero' pose: one hand/arm raised high in a "
    "big warm wave, the other hand holding an open book at chest height "
    "(pages visible, spine toward the viewer), a playful confident wink, big "
    "open joyful smile, a couple of small sparkle/star accents floating near "
    "the head and raised hand, slight forward-leaning energetic stance. This "
    "is the character's main 'welcome' image for the Teen Track, matching "
    "the composition already used for Ziad-teen-welcome-hero and "
    "Hamad-teen-welcome-hero.")

CHARACTERS = {
    "omar-teen": {
        "identity": ("Omar as a teenager -- short black hair (styled slightly more grown-up than "
            "his younger self), warm brown skin, wearing a crisp white thobe (long robe) with "
            "subtle orange trim at the collar and cuffs (aged-up version of his signature young "
            "outfit), or a modern casual Gulf-appropriate teen outfit if more natural for an "
            "active pose -- keep the orange accent color as his visual signature either way. "
            "Calm, friendly, curious personality, same as his younger self just older."),
        "style": TEEN_STYLE,
        "reference": "assets/story/characters/omar-wave.png (young version -- match identity/coloring, age up the proportions and styling)",
    },
    "sara-teen": {
        "identity": ("Sara as a teenager -- wearing a hijab (headscarf) in a warm orange or "
            "coordinating color, modest Arabic-appropriate clothing (a long-sleeve top or "
            "cardigan over a modest long skirt or dress, in her signature orange and white "
            "color scheme), may keep her glasses as a signature accessory. This is a deliberate "
            "identity addition for her teen version specifically -- her younger self doesn't "
            "wear a hijab, but her teen version should, dressed modestly and appropriately for "
            "an Arabic-speaking teen audience. Warm, teacher-like, encouraging personality, same "
            "as her younger self just older."),
        "style": TEEN_STYLE,
        "reference": "assets/story/characters/sara-wave.png (young version -- match her coloring/personality/glasses, but ADD the hijab and modest clothing for the teen version, don't just age up her current outfit)",
    },
    "noor-teen": {
        "identity": ("Noor as a teenager -- continuing her existing hijab (headscarf) in her "
            "signature orange and teal patterned style, now styled a bit more grown-up, wearing "
            "modest Arabic-appropriate teen clothing (a longer dress or tunic with patterned "
            "trim, keeping her teal and orange color scheme), warm brown skin. Cheerful, warm, "
            "energetic personality, same as her younger self just older."),
        "style": TEEN_STYLE,
        "reference": "assets/story/characters/noor-wave.png (young version -- she already wears a hijab, so this is a direct age-up of her existing identity and colors, not a new addition)",
    },
    "lumi-teen": {
        "identity": ("Lumi, the platform's mascot character -- a round friendly yellow chick-like "
            "creature with a feather tuft, big expressive eye(s), small orange beak, rosy cheeks, "
            "stubby arms and legs, cream belly patch, often carries a small dark backpack with "
            "orange trim. Same mascot, same identity -- just illustrated with the more polished "
            "teen-track art treatment. Playful, encouraging, endlessly enthusiastic personality."),
        "style": LUMI_TEEN_STYLE,
        "reference": "assets/story/characters/lumi-hero.png (match the mascot's exact shape/colors/proportions -- this is a style-treatment pass, not a redesign)",
    },
}

out_lines = []
out_lines.append("# Teen Versions — Omar, Sara, Noor, Lumi (44 poses total)\n")
out_lines.append(
    "Same pose set already delivered for Ziad-teen and Hamad-teen (10 poses "
    "+ Welcome Hero = 11 each), so all 6 characters have equal-depth Teen "
    "Track representation. **Sara and Noor are veiled (hijab) and dressed "
    "in modest Arabic-appropriate clothing in their teen versions, per "
    "direct instruction** -- Noor already wears a hijab young, so this "
    "continues her existing identity aged up; Sara doesn't currently wear "
    "one, so this is a deliberate addition for her teen version "
    "specifically. For best consistency, attach the reference image noted "
    "for each character alongside the text prompt if your tool supports "
    "image references. Save each result named exactly as shown and drop "
    "into `assets/story/characters/`.\n"
)
out_lines.append("---\n")
for char_key, data in CHARACTERS.items():
    out_lines.append(f"## {char_key} (11 poses)\n")
    out_lines.append(f"**Reference image to attach:** `{data['reference']}`\n")
    out_lines.append(f"**Character identity (include in every prompt):**\n> {data['identity']}\n")
    out_lines.append(f"**Master style (include in every prompt):**\n> {data['style']}\n")
    for pose_key, pose_desc in POSES.items():
        fname = f"{char_key}-{pose_key}.png"
        prompt = f"{data['identity']} {pose_desc}. {data['style']}"
        out_lines.append(f"**`{fname}`** — *{pose_key}*")
        out_lines.append(f"> {prompt}\n")
    fname = f"{char_key}-welcome-hero.png"
    prompt = f"{data['identity']} {WELCOME_POSE} {data['style']}"
    out_lines.append(f"**`{fname}`** — *welcome-hero*")
    out_lines.append(f"> {prompt}\n")
    out_lines.append("---\n")

with open("_docs/teen-versions-omar-sara-noor-lumi.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

total = len(CHARACTERS) * (len(POSES) + 1)
print(f"Wrote {total} prompts across {len(CHARACTERS)} characters -> _docs/teen-versions-omar-sara-noor-lumi.md")
