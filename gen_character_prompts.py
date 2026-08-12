# -*- coding: utf-8 -*-

YOUNG_STYLE = ("Flat vector cartoon illustration matching Lumio English's existing "
    "young-character style exactly (same as Omar, Sara, and Noor): thick clean "
    "black outlines, warm brown skin tone, simple friendly rounded facial "
    "features, big expressive eyes, rosy cheeks. Character is a child around "
    "6-8 years old (same age as the existing Omar/Sara/Noor characters, matching "
    "their proportions -- slightly oversized head, short simple limbs). Full "
    "body, standing, facing forward or as the pose describes. ISOLATED ON A "
    "FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow "
    "plane, no scenery), no text or letters anywhere in the image, no "
    "watermark. Portrait orientation, roughly 170x290px proportions (tall and "
    "narrow, character fills the frame top to bottom with minimal empty margin "
    "on the sides). Modest, simple, colorful clothing appropriate for an "
    "Arabic-speaking Gulf-region children's app.")

TEEN_STYLE = ("Flat vector illustration in the same bright cheerful cartoon "
    "style as the platform's other teen characters (thick clean outlines, "
    "warm skin tones, expressive but not exaggerated features), but drawn as "
    "a teenager around 13-16 years old -- taller, more realistic proportions "
    "than a young child character, contemporary casual teen styling. Full "
    "body, standing, facing forward or as the pose describes. ISOLATED ON A "
    "FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow "
    "plane, no scenery), no text or letters anywhere in the image, no "
    "watermark. Portrait orientation, tall and narrow composition, character "
    "fills the frame top to bottom with minimal empty margin on the sides. "
    "This is for a Teen Track English-learning app aimed at Arabic-speaking "
    "students ages 13-16, so keep the styling age-appropriate, stylish, and "
    "modest.")

ZIAD_IDENTITY_YOUNG = ("A boy named Ziad, a young gamer character -- wears a colorful "
    "hoodie or graphic t-shirt with a simple game-controller or pixel-heart "
    "print, short tousled dark hair, maybe a pair of on-ear headphones resting "
    "around his neck as a signature accessory. Appears throughout tech/gaming "
    "themed lesson content.")
ZIAD_IDENTITY_TEEN = ("A teen boy named Ziad, a gamer character -- wears a modern "
    "graphic hoodie or streetwear-style t-shirt, on-ear gaming headphones "
    "(worn on his head or resting around his neck as his signature "
    "accessory), short trendy hairstyle. Appears throughout tech/gaming "
    "themed lesson content for the Teen Track.")

HAMAD_IDENTITY_YOUNG = ("A boy named Hamad, dressed in traditional Gulf "
    "children's attire -- a white or light-colored thobe (long robe) and a "
    "simple ghutra (headscarf) held with an agal (black cord), warm friendly "
    "expression. Traditional Gulf styling throughout, in every pose.")
HAMAD_IDENTITY_TEEN = ("A teen boy named Hamad, dressed in traditional Gulf "
    "attire appropriate for a teenager -- a crisp white or light-colored "
    "thobe and a ghutra with agal, worn confidently, contemporary but "
    "respectful of tradition. Traditional Gulf styling throughout, in every pose.")

POSES = {
    "wave":      "waving hello with one raised hand, warm welcoming smile, facing forward",
    "happy":     "standing with a big cheerful open smile, relaxed confident pose",
    "point":     "pointing to the side with one hand, as if directing attention to something off-frame, engaged expression",
    "think":     "one hand resting thoughtfully on chin, slight head tilt, curious thinking expression",
    "thumbs":    "giving an enthusiastic thumbs-up with one hand, big proud smile",
    "surprised": "wide eyes, eyebrows raised, both hands slightly up near shoulders, mouth open in a surprised 'oh!' expression",
    "celebrate": "both arms raised straight up in excitement, big joyful open-mouth smile, a little jump/bounce energy",
    "look-left": "body and head turned to face the left side of the frame, curious/alert expression, one hand maybe shading eyes slightly",
    "look-right":"body and head turned to face the right side of the frame, curious/alert expression, mirrored from the look-left pose",
    "explain":   "both hands open and gesturing outward at chest height, mid-explanation pose, friendly approachable expression",
}
ZIAD_SIGNATURE_POSES = {
    "gaming":     "holding a game controller with both hands, focused excited expression, leaning slightly forward",
    "headphones": "wearing on-ear headphones, one hand giving a thumbs-up, cool confident smile",
}
HAMAD_SIGNATURE_POSES = {
    "welcome": "one hand placed over the chest in a warm traditional Gulf welcoming gesture, gracious smile",
}

def build(character_name, identity, style, extra_poses, out_key):
    all_poses = dict(POSES)
    all_poses.update(extra_poses)
    out_lines = []
    out_lines.append(f"# {character_name} — Character Image Prompts ({out_key})\n")
    out_lines.append(f"{len(all_poses)} poses. Save each one named exactly as shown and drop into "
                      f"`assets/story/characters/`. Once uploaded, I'll wire {character_name} into the "
                      f"character rotation across lessons and the dashboard.\n")
    out_lines.append(f"**Character identity (include in every single prompt):**\n> {identity}\n")
    out_lines.append(f"**Master style (include in every single prompt):**\n> {style}\n")
    out_lines.append("---\n")
    items = list(all_poses.items())
    batch_size = 10
    for b in range(0, len(items), batch_size):
        chunk = items[b:b+batch_size]
        out_lines.append(f"## Batch {b//batch_size + 1} ({len(chunk)} poses)\n")
        for pose_key, pose_desc in chunk:
            fname = f"{out_key}-{pose_key}.png"
            prompt = f"{identity} {pose_desc}. {style}"
            out_lines.append(f"**`{fname}`** — *{pose_key}*")
            out_lines.append(f"> {prompt}\n")
    fname = f"_docs/{out_key}-character-prompts.md"
    with open(fname, "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))
    print(f"{out_key}: {len(all_poses)} poses -> {fname}")

build("Ziad (young, Pre-A/Level 1/Level 2)", ZIAD_IDENTITY_YOUNG, YOUNG_STYLE, ZIAD_SIGNATURE_POSES, "ziad")
build("Ziad (teen, Level 3-6)", ZIAD_IDENTITY_TEEN, TEEN_STYLE, ZIAD_SIGNATURE_POSES, "ziad-teen")
build("Hamad (young, Pre-A/Level 1/Level 2)", HAMAD_IDENTITY_YOUNG, YOUNG_STYLE, HAMAD_SIGNATURE_POSES, "hamad")
build("Hamad (teen, Level 3-6)", HAMAD_IDENTITY_TEEN, TEEN_STYLE, HAMAD_SIGNATURE_POSES, "hamad-teen")
