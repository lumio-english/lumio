# -*- coding: utf-8 -*-
"""'Welcome Hero' pose for every character -- the composition currently
used for Lumi on the interface/landing page (index.html): full body,
one hand waving, other hand holding an open book, playful wink,
sparkle accents around the figure. Same composition and energy across
every character so the whole cast can be used interchangeably on
welcome moments (interface page, dashboard, etc.)."""

YOUNG_STYLE = ("Flat vector cartoon illustration matching Lumio English's existing "
    "young-character style exactly: thick clean black outlines, warm brown skin "
    "tone, simple friendly rounded facial features, big expressive eyes, rosy "
    "cheeks. Character is a child around 6-8 years old, slightly oversized head, "
    "short simple limbs, matching proportions. ISOLATED ON A FULLY TRANSPARENT "
    "BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery), "
    "no text or letters anywhere in the image, no watermark. Portrait "
    "orientation, character fills the frame top to bottom with minimal empty "
    "margin. Very high quality, clean linework, consistent with the reference "
    "character's existing appearance -- same character, new pose, not a "
    "redesign.")

TEEN_STYLE = ("Flat vector illustration in the same bright cheerful cartoon "
    "style as the platform's other teen characters (thick clean outlines, warm "
    "skin tones, expressive but not exaggerated features), drawn as a teenager "
    "around 13-16 years old -- taller, more realistic proportions than a young "
    "child character, contemporary casual teen styling. ISOLATED ON A FULLY "
    "TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, "
    "no scenery), no text or letters anywhere in the image, no watermark. "
    "Portrait orientation, character fills the frame top to bottom with "
    "minimal empty margin. Very high quality, clean linework, age-appropriate "
    "and modest styling.")

LUMI_STYLE = ("Flat vector cartoon illustration matching Lumio English's "
    "existing mascot character exactly: a round friendly yellow chick-like "
    "creature with a soft rounded blob body, a small feather tuft on top of "
    "the head, large expressive round eye(s), a small orange beak/mouth area, "
    "rosy cheek circles, stubby simple arms and legs, warm golden-yellow color "
    "with a cream-colored belly patch, thick clean black/brown outline. "
    "ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background "
    "color, no shadow plane, no scenery), no text or letters anywhere in the "
    "image, no watermark. Very high quality, clean linework, same mascot, new "
    "pose, not a redesign.")

WELCOME_POSE = ("Full body 'welcome hero' pose: one hand/arm raised high in a "
    "big warm wave, the other hand holding an open book at chest height "
    "(pages visible, spine toward the viewer), a playful confident wink, big "
    "open joyful smile, a couple of small sparkle/star accents floating near "
    "the head and raised hand, slight forward-leaning energetic stance as if "
    "stepping toward the viewer to say hello. This is the character's main "
    "'welcome' image, used on the platform's homepage -- it should feel "
    "inviting, energetic, and be the single best/most polished image of this "
    "character.")

CHARACTERS = [
    ("omar", "Omar, a young boy character -- short black hair, warm brown skin, wearing a white thobe (long robe) with orange trim at the collar and cuffs, orange sandals. Calm, friendly, curious personality.",
     YOUNG_STYLE, "assets/story/characters/omar-wave.png"),
    ("sara", "Sara, a young girl character -- glasses, brown wavy shoulder-length hair, wearing an orange cardigan over a white collared top and an orange skirt. Warm, teacher-like, encouraging personality.",
     YOUNG_STYLE, "assets/story/characters/sara-wave.png"),
    ("noor", "Noor, a young girl character -- wearing an orange and teal patterned hijab (headscarf), a teal and orange dress with patterned trim, warm brown skin, sometimes wears a small backpack. Cheerful, warm, energetic personality.",
     YOUNG_STYLE, "assets/story/characters/noor-wave.png"),
    ("lumi", "Lumi, the platform's mascot character -- a round friendly yellow chick-like creature with a feather tuft, big expressive eye(s), small orange beak, rosy cheeks, stubby arms and legs, cream belly patch, wears a small dark backpack with orange trim. Playful, encouraging, endlessly enthusiastic personality.",
     LUMI_STYLE, "assets/story/characters/lumi-welcome-hero.png (this is the EXISTING reference for this exact pose -- match it closely, this is a quality/consistency check more than a new pose)"),
    ("ziad", "A boy named Ziad, a young gamer character -- wears a colorful hoodie or graphic t-shirt with a simple game-controller or pixel-heart print, short tousled dark hair, maybe a pair of on-ear headphones resting around his neck as a signature accessory.",
     YOUNG_STYLE, "(no existing reference yet -- use consistent with the other new Ziad pose prompts already provided)"),
    ("hamad", "A boy named Hamad, dressed in traditional Gulf children's attire -- a white or light-colored thobe (long robe) and a simple ghutra (headscarf) held with an agal (black cord), warm friendly expression.",
     YOUNG_STYLE, "(no existing reference yet -- use consistent with the other new Hamad pose prompts already provided)"),
]

TEEN_CHARACTERS = [
    ("ziad-teen", "A teen boy named Ziad, a gamer character -- wears a modern graphic hoodie or streetwear-style t-shirt, on-ear gaming headphones, short trendy hairstyle.",
     TEEN_STYLE, "(no existing reference yet -- use consistent with the other Ziad teen pose prompts already provided)"),
    ("hamad-teen", "A teen boy named Hamad, dressed in traditional Gulf attire appropriate for a teenager -- a crisp white or light-colored thobe and a ghutra with agal, worn confidently.",
     TEEN_STYLE, "(no existing reference yet -- use consistent with the other Hamad teen pose prompts already provided)"),
]

out_lines = []
out_lines.append("# Welcome Hero — One Image Per Character\n")
out_lines.append(
    "Matches the exact composition currently used for Lumi on the interface/"
    "landing page (index.html hero section): waving + holding an open book + "
    "wink + sparkles. This becomes each character's single 'best/main' image "
    "for welcome moments across the platform (interface page, dashboard, "
    "etc). Save each one named exactly as shown and drop into the folder "
    "noted for that group.\n"
)
out_lines.append("---\n")
out_lines.append("## Young characters (Pre-A / Level 1 / Level 2) -- save into `assets/story/characters/`\n")
for key, identity, style, ref in CHARACTERS:
    fname = f"{key}-welcome-hero.png"
    prompt = f"{identity} {WELCOME_POSE}. {style}"
    out_lines.append(f"**`{fname}`** — *{key}*")
    out_lines.append(f"Reference: `{ref}`")
    out_lines.append(f"> {prompt}\n")

out_lines.append("## Teen characters (Level 3-6) -- save into `assets/story/characters/`\n")
for key, identity, style, ref in TEEN_CHARACTERS:
    fname = f"{key}-welcome-hero.png"
    prompt = f"{identity} {WELCOME_POSE}. {style}"
    out_lines.append(f"**`{fname}`** — *{key}*")
    out_lines.append(f"Reference: `{ref}`")
    out_lines.append(f"> {prompt}\n")

with open("_docs/welcome-hero-prompts.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

print(f"Wrote {len(CHARACTERS) + len(TEEN_CHARACTERS)} welcome-hero prompts -> _docs/welcome-hero-prompts.md")
