# -*- coding: utf-8 -*-

STYLE = ("Simple flat vector illustration for a tween/teen English-learning app. "
         "Bright cheerful colors, thick clean black outlines, soft rounded shapes, "
         "one centered subject or scene, ISOLATED ON A FULLY TRANSPARENT BACKGROUND "
         "(PNG cutout, no background color, no shadow plane), no text or letters "
         "anywhere in the image, no watermark, square 1:1 composition, a little "
         "more mature/stylish than a toddler's storybook (ages 9-13), aimed at "
         "Arabic-speaking students. If your tool cannot export true transparency, "
         "use a plain solid white background instead so it can be removed cleanly.")

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

DESC = {
  "plan": "a cartoon notebook page with a simple checklist and a pencil",
  "visit": "a cartoon teen waving at a front door with a small suitcase",
  "join": "a cartoon hand reaching to connect two puzzle pieces",
  "apply": "a cartoon hand placing a folded paper into a mail slot",
  "move": "a cartoon moving box with a small arrow pointing to a new house",
  "start": "a cartoon glowing 'play' triangle button",
  "predict": "a cartoon crystal ball with a small sparkle",
  "probably": "a cartoon speech bubble with a question mark and a small percent-ish swirl (no letters)",
  "definitely": "a cartoon big checkmark inside a star burst",
  "maybe": "a cartoon speech bubble with a wavy uncertain line inside",
  "future": "a cartoon rocket ship flying upward with stars trailing",
  "believe": "a cartoon hand over a heart with a small glowing star above",
  "meeting": "a cartoon pair of figures shaking hands",
  "traveling": "a cartoon suitcase with a passport and airplane ticket icon nearby",
  "attending": "a cartoon ticket stub with a small star",
  "leaving": "a cartoon figure walking through a doorway with a suitcase",
  "starting": "a cartoon checkered flag at a starting line",
  "hosting": "a cartoon open front door with balloons on either side",
  "interrupted": "a cartoon ringing phone breaking into a scene with a book, small burst lines",
  "noticed": "a cartoon eye with a small sparkle, looking at an object",
  "happened": "a cartoon burst/starburst shape with small motion lines",
  "arrived": "a cartoon teen with a suitcase standing in front of an open door, happy",
  "started raining": "a cartoon cloud suddenly releasing rain drops onto a surprised stick figure",
  "meanwhile": "a cartoon split-screen style panel showing two small scenes side by side",
  "have to": "a cartoon clipboard with a red exclamation mark",
  "don't have to": "a cartoon clipboard with a crossed-out exclamation mark",
  "required": "a cartoon checklist item with a filled checkbox",
  "optional": "a cartoon checklist item with an empty checkbox",
  "responsibility": "a cartoon teen carrying a briefcase-like bag confidently",
  "duty": "a cartoon badge/shield shape with a small star",
  "quickly": "a cartoon sneaker with speed motion lines trailing behind it",
  "carefully": "a cartoon hand gently holding a glass cup with both hands",
  "quietly": "a cartoon finger held up to closed lips in a shushing gesture",
  "loudly": "a cartoon megaphone with sound wave lines bursting out",
  "easily": "a cartoon hand lifting a lightweight feather with one finger",
  "patiently": "a cartoon clock with a calm smiling face",
  "more interesting": "a cartoon open book glowing brighter than a closed dim book beside it",
  "more difficult": "a cartoon steep mountain path next to a flatter, easier path",
  "more expensive": "a cartoon price tag with a taller stack of coins than a smaller price tag nearby",
  "the most popular": "a cartoon figure surrounded by many small admiring stars/fans",
  "the most exciting": "a cartoon rollercoaster loop with sparkle stars",
  "the most comfortable": "a cartoon plush armchair with soft cushions and a small sparkle",
  "sleep in": "a cartoon teen sleeping in bed with bright sunlight already through the window",
  "catch up": "a cartoon stack of notebooks with a checkmark on top",
  "relax": "a cartoon teen lying back in a hammock, eyes closed, peaceful",
  "explore": "a cartoon compass with the needle pointing forward, dotted path behind it",
  "volunteer": "a cartoon hand raised high with a small heart above it",
  "succeed": "a cartoon figure standing on a podium with a trophy",
  "graduate": "a cartoon graduation cap tossed in the air with sparkles",
  "travel": "a cartoon suitcase with a globe sticker on it",
  "invent": "a cartoon light bulb with small gear shapes around it",
  "achieve": "a cartoon flag planted at a mountain summit",
  "chores": "a cartoon broom and dustpan crossed together",
  "curfew": "a cartoon clock with a small moon icon beside it",
  "permission": "a cartoon hand giving a thumbs-up next to a small document",
  "allowed": "a cartoon green checkmark inside a circle",
  "independent": "a cartoon figure standing tall alone with arms confidently on hips",
  "clearly": "a cartoon magnifying glass showing a sharp, in-focus circle",
  "politely": "a cartoon figure with hands folded and a gentle smile",
  "honestly": "a cartoon hand over heart with a small checkmark",
  "nervously": "a cartoon figure biting their lip with a small sweat drop",
  "confidently": "a cartoon figure standing tall with chin up and hands on hips",
  "kindly": "a cartoon heart with small sparkle lines radiating outward",
  "option": "a cartoon signpost with two arrows pointing different ways",
  "reasonable": "a cartoon balance scale perfectly level",
  "convenient": "a cartoon clock with a small green checkmark",
  "the most useful": "a cartoon toolbox glowing with a small star",
  "the most reliable": "a cartoon shield with a checkmark and small stars around it",
  "worth it": "a cartoon treasure chest opening with a sparkle burst",
  "was cooking": "a cartoon teen stirring a pot with steam rising",
  "was chatting": "a cartoon teen with a speech bubble, mid-conversation pose",
  "was driving": "a cartoon car with a steering wheel visible through the window",
  "were studying": "a cartoon pair of figures sitting at a table with open books",
  "was scrolling": "a cartoon smartphone with a finger swiping up the screen, motion lines",
  "focus": "a cartoon target/bullseye with an arrow in the center",
  "goal": "a cartoon target with an arrow stuck in the center circle",
  "improve": "a cartoon upward trending arrow/graph line",
  "challenge myself": "a cartoon figure climbing a steep small hill determinedly",
  "expect": "a cartoon figure looking ahead with a hand shading their eyes",
  "hope": "a cartoon hand releasing a glowing paper airplane",
  "resolution": "a cartoon calendar page with a glowing star on it",
  "argue": "a cartoon pair of speech bubbles with opposite arrows",
  "point of view": "a cartoon eye icon inside a speech bubble",
  "convince": "a cartoon speech bubble with a glowing lightbulb inside",
  "evidence": "a cartoon magnifying glass over a folder/document",
  "agree partly": "a cartoon hand giving a sideways/tilted thumbs-up",
  "fair point": "a cartoon balance scale with a small checkmark above it",
  "prepare": "a cartoon backpack being packed with books and supplies",
  "organize": "a cartoon set of folders being neatly stacked",
  "review": "a cartoon open notebook with a highlighter marking lines",
  "ready": "a cartoon checkered flag with a thumbs-up beside it",
  "properly": "a cartoon checkmark inside a neat square box",
  "safely": "a cartoon shield icon with a small checkmark",
  "neatly": "a cartoon row of perfectly aligned pencils",
  "smoothly": "a cartoon gentle wave line flowing evenly left to right",
  "efficiently": "a cartoon gear turning smoothly with a small clock",
  "correctly": "a cartoon test paper with a big green checkmark",
  "tradition": "a cartoon lantern or ornament with a decorative pattern, warm colors",
  "custom": "a cartoon gift wrapped with a ribbon, festive style",
  "lifestyle": "a cartoon figure balancing a heart and a clock on each hand, symbolizing balance",
  "the most colorful": "a cartoon rainbow burst with confetti",
  "the most traditional": "a cartoon ornate decorative pattern medallion shape",
  "similar": "a cartoon two overlapping matching circles, like a Venn diagram",
  "field trip": "a cartoon school bus with a small map icon beside it",
  "excited": "a cartoon teen jumping with both arms up, big excited smile, sparkles around",
  "unexpected": "a cartoon gift box popping open with a surprised face burst",
  "handled": "a cartoon hand calmly steadying a wobbling stack of blocks",
  "lesson learned": "a cartoon light bulb glowing above an open book",
  "memorable": "a cartoon photo frame with a sparkling star in the corner",
}

order = list(DESC.keys())

out_lines = []
out_lines.append("# Level 6 — Vocab Image Prompts (109 words)\n")
out_lines.append(
    "New Level 6 curriculum ('Looking Ahead' -- future forms + complex "
    "description theme). Transparent background baked into every prompt. "
    "Save each one named exactly as shown and drop into `assets/vocab/` "
    "-- picked up automatically everywhere.\n"
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

with open("_docs/level6-vocab-image-prompts.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

print(f"Wrote {len(order)} prompts across {batch_num} batches (max {BATCH_SIZE}/batch)")
