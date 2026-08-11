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
  "played": "a cartoon teen kicking a football, mid-action, motion lines",
  "watched": "a cartoon teen sitting and looking at a glowing TV screen, relaxed pose",
  "walked": "a cartoon teen walking with a backpack, mid-stride, small motion lines",
  "helped": "a cartoon teen helping another person carry a box together",
  "cleaned": "a cartoon teen sweeping the floor with a broom, sparkle marks showing clean",
  "cooked": "a cartoon teen stirring a pot on a stove with a chef hat",
  "went": "a cartoon teen walking through an open door with a suitcase",
  "saw": "a cartoon teen with wide eyes looking at a glowing star shape (something amazing seen)",
  "ate": "a cartoon teen taking a big bite of a sandwich, happy expression",
  "had": "a cartoon teen holding a gift box with both hands, smiling",
  "took": "a cartoon teen taking a photo with a camera",
  "got": "a cartoon teen holding up a new smartphone box, excited",
  "finish": "a cartoon checkered flag on a finish line",
  "forget": "a cartoon teen with a confused expression and a small question mark cloud",
  "miss": "a cartoon teen running after a bus that's pulling away",
  "call": "a cartoon smartphone with a green phone icon and sound waves",
  "check": "a cartoon clipboard with a checkmark being drawn",
  "excited": "a cartoon teen jumping with both arms up, big excited smile, sparkles around",
  "crowded": "a cartoon group of many overlapping people silhouettes packed together",
  "amazing": "a cartoon teen with sparkling wide eyes and stars around their head",
  "difficult": "a cartoon exam paper with a furrowed-brow face icon and a sweat drop",
  "crowd": "a cartoon cluster of many small people silhouettes standing together",
  "line": "a cartoon row of people standing one behind another in a queue",
  "traffic": "a cartoon row of cars stuck bumper to bumper with red brake lights",
  "prize": "a cartoon golden trophy with a ribbon",
  "surprise": "a cartoon gift box popping open with confetti and a burst shape",
  "problem": "a cartoon puzzle piece that doesn't fit, with a small question mark",
  "yesterday": "a cartoon calendar page with one day marked with a small backward arrow",
  "last week": "a cartoon calendar showing one full week highlighted, backward arrow",
  "last night": "a cartoon crescent moon and stars with a small backward arrow",
  "two days ago": "a cartoon calendar with two X marks on two days, backward arrow",
  "last summer": "a cartoon sun and beach umbrella with a small backward arrow",
  "a while ago": "a cartoon clock with a swirling backward-time spiral",
  "first": "a cartoon number 1 medal ribbon",
  "then": "a cartoon curved arrow pointing forward",
  "next": "a cartoon forward arrow with a small dot after it",
  "after that": "a cartoon double forward arrow",
  "finally": "a cartoon checkered flag with sparkle stars",
  "in the end": "a cartoon flag planted at the top of a small hill/path",
  "because": "a cartoon light bulb connected by a dotted line to a small gear",
  "so": "a cartoon arrow bending from one shape into a result shape",
  "excuse": "a cartoon teen shrugging with a small speech bubble containing '...'",
  "explain": "a cartoon teen gesturing with open hands next to a simple diagram board",
  "since": "a cartoon calendar with a highlighted starting point and an arrow moving forward from it",
  "relieved": "a cartoon teen wiping their forehead with a small exhale breath cloud, relaxed smile",
  "disappointed": "a cartoon teen with a downturned mouth and slumped shoulders",
  "surprised": "a cartoon teen with wide eyes and raised eyebrows, mouth in an O shape",
  "grateful": "a cartoon teen with hand on heart and a warm smile, small heart shape nearby",
  "was studying": "a cartoon teen at a desk reading a book with a lamp on, focused",
  "was sleeping": "a cartoon teen sleeping in bed with a 'Z Z Z' comic sleep symbol (no letters, just curved sleep marks)",
  "was raining": "a cartoon cloud with rain drops falling",
  "were talking": "a cartoon pair of overlapping speech bubbles between two simple figures",
  "was cooking": "a cartoon teen stirring a pot with steam rising",
  "were waiting": "a cartoon bus stop sign with two people sitting on a bench",
  "reviewed": "a cartoon open notebook with a highlighter marking a line",
  "memorized": "a cartoon head silhouette with a glowing light bulb inside",
  "practiced": "a cartoon teen practicing guitar, focused expression",
  "passed": "a cartoon test paper with a big checkmark and a star",
  "struggled": "a cartoon teen with a strained expression pushing against a heavy box",
  "improved": "a cartoon upward trending arrow/graph line with a star at the top",
  "packed": "a cartoon suitcase being zipped closed, full of folded clothes",
  "flew": "a cartoon airplane flying through clouds",
  "explored": "a cartoon teen holding a map, looking at a new city skyline",
  "arrived": "a cartoon teen with a suitcase standing in front of an open door, happy",
  "stayed": "a cartoon cozy house with a small welcome mat",
  "returned": "a cartoon curved arrow looping back to a house icon",
  "broke": "a cartoon smartphone with a crack across the screen",
  "lost": "a cartoon teen looking around with hands out, question marks nearby",
  "spilled": "a cartoon cup tipped over with juice spilling out",
  "late": "a cartoon clock with hands past the hour, small sweat drop",
  "mistake": "a cartoon paper with a crossed-out X mark and an eraser nearby",
  "fixed": "a cartoon wrench and a smartphone with a checkmark",
  "guests": "a cartoon group of three people waving, arriving at a door",
  "music": "a cartoon musical note with sound wave lines",
  "games": "a cartoon game controller with colorful buttons",
  "gifts": "a cartoon stack of wrapped presents with bows",
  "decorations": "a cartoon string of colorful party bunting flags",
  "woke up": "a cartoon teen stretching in bed with sunlight through a window",
  "got ready": "a cartoon teen looking in a mirror, adjusting their hoodie",
  "left": "a cartoon teen walking out of a front door with a backpack",
  "celebrated": "a cartoon group of teens with party hats and confetti",
  "remembered": "a cartoon head silhouette with a small glowing star/memory bubble",
  "unforgettable": "a cartoon photo frame with a sparkling star in the corner",
  "was texting": "a cartoon teen looking down at a phone, typing, small chat bubble above",
  "was listening": "a cartoon teen wearing headphones with a musical note above their head",
  "was laughing": "a cartoon teen laughing with head tilted back, sparkle marks",
  "were watching": "a cartoon pair of figures sitting facing a glowing screen",
  "was thinking": "a cartoon teen with a hand on chin and a small thought-bubble cloud",
  "were playing": "a cartoon pair of figures playing with a ball together",
  "experience": "a cartoon open book with a small star bursting from the pages",
  "favorite memory": "a cartoon polaroid-style photo with a small heart sticker",
  "achievement": "a cartoon gold medal on a ribbon",
  "challenge": "a cartoon mountain peak with a small flag at the top",
  "adventure": "a cartoon compass with a dotted path trailing behind it",
  "chose": "a cartoon hand pointing to one of two glowing options",
  "laughed": "a cartoon face mid-laugh with tears of joy, comic sparkle marks",
  "fell asleep": "a cartoon teen slumped on a couch with a blanket, eyes closed, sleep marks",
  "shared": "a cartoon bowl of popcorn between two hands reaching in",
  "recommend": "a cartoon thumbs-up inside a speech bubble",
  "searched": "a cartoon magnifying glass hovering over a small object",
  "found": "a cartoon hand holding up a glowing found object with a small sparkle",
  "worried": "a cartoon teen biting their lip with furrowed brows, small sweat drop",
  "careful": "a cartoon teen holding a glass object gently with both hands",
}

order = list(DESC.keys())
missing_desc = [w for w in ['played', 'watched', 'walked', 'helped', 'cleaned', 'cooked', 'went', 'saw', 'ate', 'had', 'took', 'got', 'finish', 'forget', 'miss', 'call', 'check', 'excited', 'crowded', 'amazing', 'difficult', 'crowd', 'line', 'traffic', 'prize', 'surprise', 'problem', 'yesterday', 'last week', 'last night', 'two days ago', 'last summer', 'a while ago', 'first', 'then', 'next', 'after that', 'finally', 'in the end', 'because', 'so', 'excuse', 'explain', 'since', 'relieved', 'disappointed', 'surprised', 'grateful', 'was studying', 'was sleeping', 'was raining', 'were talking', 'was cooking', 'were waiting', 'reviewed', 'memorized', 'practiced', 'passed', 'struggled', 'improved', 'packed', 'flew', 'explored', 'arrived', 'stayed', 'returned', 'broke', 'lost', 'spilled', 'late', 'mistake', 'fixed', 'guests', 'music', 'games', 'gifts', 'decorations', 'woke up', 'got ready', 'left', 'celebrated', 'remembered', 'unforgettable', 'was texting', 'was listening', 'was laughing', 'were watching', 'was thinking', 'were playing', 'experience', 'favorite memory', 'achievement', 'challenge', 'adventure', 'chose', 'laughed', 'fell asleep', 'shared', 'recommend', 'searched', 'found', 'worried', 'careful'] if w not in DESC]
if missing_desc:
    print("WARNING missing descriptions:", missing_desc)

out_lines = []
out_lines.append("# Level 5 — Vocab Image Prompts (103 words)\n")
out_lines.append(
    "New Level 5 curriculum ('My Story' -- past tense/narrative theme). "
    "Transparent background baked into every prompt. Save each one named "
    "exactly as shown and drop into `assets/vocab/` -- picked up "
    "automatically everywhere.\n"
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

with open("_docs/level5-vocab-image-prompts.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

print(f"Wrote {len(order)} prompts across {batch_num} batches (max {BATCH_SIZE}/batch)")
