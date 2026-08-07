# -*- coding: utf-8 -*-

STYLE = ("Simple flat vector illustration for a children's/tween's English-learning app. "
         "Bright cheerful colors, thick clean black outlines, soft rounded shapes, "
         "one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG "
         "cutout, no background color, no shadow plane, no scenery behind the "
         "subject), no text or letters anywhere in the image, no watermark, "
         "square 1:1 composition, friendly and a little more mature/stylish than "
         "a toddler's storybook (this is for ages 9-13), aimed at Arabic-speaking "
         "students. If your tool cannot export true transparency, use a plain "
         "solid white background instead so it can be removed cleanly.")

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

DESC = {
  "hang out": "two cartoon teens sitting together on a bench, relaxed and chatting",
  "chat": "two speech bubbles overlapping, one with a smiley face inside",
  "text": "a cartoon smartphone with a chat bubble and a small send arrow on screen",
  "laugh": "a cartoon teen laughing with head tilted back, eyes closed, big smile",
  "joke": "a cartoon speech bubble with a laughing emoji face inside it",
  "crew": "three cartoon teen friends standing together with arms over each other's shoulders",
  "studies": "a cartoon teen sitting at a desk reading an open book, focused expression",
  "listens": "a cartoon teen wearing headphones with a small musical note above their head",
  "practices": "a cartoon teen holding a guitar, mid-strum, focused expression",
  "trains": "a cartoon teen in sportswear jogging, motion lines behind",
  "boring": "a cartoon teen yawning with droopy eyes, resting chin on hand",
  "awesome": "a cartoon teen with both fists raised and sparkles around them, thrilled expression",
  "weird": "a cartoon teen with a puzzled, slightly cross-eyed expression and a question mark",
  "annoying": "a cartoon teen covering their ears with an irritated expression, small buzzing lines nearby",
  "cool": "a cartoon teen wearing sunglasses giving a thumbs up",
  "lame": "a cartoon teen with a flat, unimpressed expression, arms crossed",
  "poster": "a cartoon rolled and pinned poster on a wall corner, colorful abstract design on it",
  "shelf": "a cartoon wooden wall shelf with a few books and a small plant on it",
  "desk": "a cartoon study desk with a laptop and a cup of pencils on it",
  "lamp": "a cartoon desk lamp, bent-neck style, glowing warm light",
  "speaker": "a cartoon bluetooth speaker with sound wave lines coming out",
  "beanbag": "a cartoon round beanbag chair, soft and puffy, bright color",
  "sneakers": "a cartoon pair of colorful high-top sneakers",
  "headphones": "a cartoon pair of over-ear headphones, bright color with padded cushions",
  "backpack": "a cartoon school backpack with front pocket and zippers",
  "hoodie": "a cartoon pullover hoodie with the hood up, drawstrings visible",
  "cap": "a cartoon baseball cap with a curved brim",
  "teammates": "three cartoon teens in matching sports jerseys with arms around each other",
  "classmates": "two cartoon teens sitting side by side at school desks, smiling",
  "siblings": "a cartoon older and younger sibling standing together, arm around shoulder",
  "cousins": "two cartoon teens giving each other a high-five",
  "neighbors": "two cartoon houses side by side with a teen waving from each doorway",
  "followers": "a cartoon phone screen showing a profile icon with small avatar icons around it",
  "charger": "a cartoon phone charging cable with a plug end and a small lightning bolt icon",
  "earbuds": "a cartoon pair of small wireless earbuds with their charging case",
  "password": "a cartoon phone lock screen showing a padlock icon and dots",
  "screen": "a cartoon smartphone screen glowing with colorful app icons",
  "app": "a cartoon rounded-square app icon with a simple star inside",
  "locker": "a cartoon school locker, tall and narrow, with a small padlock",
  "hallway": "a cartoon school hallway view with lockers lining both walls",
  "cafeteria": "a cartoon lunch tray with a sandwich, apple, and juice box",
  "gym": "a cartoon dumbbell and a basketball side by side",
  "skateboard": "a cartoon skateboard with colorful wheels, angled view",
  "code": "a cartoon laptop screen showing simple colorful code lines and brackets",
  "bake": "a cartoon tray of cookies coming out of an oven, steam rising",
  "guess": "a cartoon teen with a thinking pose, finger on chin, question mark above head",
  "clue": "a cartoon magnifying glass hovering over a small footprint",
  "mystery": "a cartoon closed box with a big glowing question mark on it",
  "riddle": "a cartoon scroll of paper with a curly question mark drawn on it",
  "answer": "a cartoon light bulb glowing brightly with a small checkmark beside it",
  "secret": "a cartoon teen with a finger over their lips in a shushing gesture",
  "score": "a cartoon scoreboard showing large glowing numbers",
  "record": "a cartoon trophy with a small star burst behind it",
  "opponent": "two cartoon teens facing each other in a friendly competitive stance",
  "medal": "a cartoon gold medal hanging from a colorful ribbon",
  "faster": "a cartoon sneaker with speed motion lines trailing behind it",
  "newcomer": "a cartoon teen standing alone with a backpack, looking around a new place, hopeful expression",
  "nervous": "a cartoon teen biting their lip with a small sweat drop and raised eyebrows",
  "welcome": "a cartoon teen waving warmly with a big open smile",
  "introduce": "two cartoon teens shaking hands and smiling",
  "stranger": "a cartoon silhouette figure standing alone with a question mark above",
  "be quiet": "a cartoon finger held up to closed lips in a shushing gesture",
  "line up": "three cartoon teens standing one behind another in a straight line",
  "pay attention": "a cartoon teen with wide focused eyes and a raised finger pointing to their own eye",
  "submit": "a cartoon hand placing a folded paper into an inbox tray",
  "participate": "a cartoon teen raising a hand enthusiastically in a classroom setting",
  "texting": "a cartoon teen looking down at a phone with both thumbs typing, small chat bubble above",
  "streaming": "a cartoon phone screen showing a red 'live' circle and a play triangle",
  "scrolling": "a cartoon smartphone with a finger swiping up the screen, motion lines",
  "gaming": "a cartoon game controller with colorful buttons, glowing highlights",
  "chilling": "a cartoon teen lying back on a beanbag chair, relaxed, hands behind head",
  "studying": "a cartoon teen at a desk with an open book and a highlighter, focused",
  "highlight": "a cartoon page of text with a bright yellow highlighter stripe across a line",
  "memorize": "a cartoon head silhouette with a glowing light bulb and small gears inside",
  "quiz": "a cartoon clipboard with a checklist and a pencil beside it",
  "flashcard": "a cartoon index card with a simple icon on one side, slightly flipped up",
  "group project": "three cartoon teens gathered around a table working on a poster together",
  "presentation": "a cartoon teen standing beside a presentation board with a simple chart on it",
  "champion": "a cartoon teen holding a trophy overhead, big triumphant smile",
  "controller": "a cartoon video game controller with colorful buttons and joysticks",
  "teammate": "a cartoon teen giving a high-five, other hand mid-air off-frame",
  "strategy": "a cartoon whiteboard with simple arrows and circles sketched like a game plan",
  "level up": "a cartoon upward arrow bursting through a star with sparkle effects",
  "high score": "a cartoon trophy with the number one and sparkle stars around it",
  "genre": "a cartoon film reel with a small theater mask icon beside it",
  "subtitle": "a cartoon TV screen with a simple text bar along the bottom edge (no readable words)",
  "popcorn": "a cartoon striped popcorn box overflowing with popcorn",
  "trailer": "a cartoon movie clapperboard, black and white stripes",
  "sequel": "a cartoon film reel with a small number 2 badge on it",
  "opinion": "a cartoon speech bubble with a small thumbs-up icon inside",
  "agree": "a cartoon teen nodding with a checkmark above their head",
  "disagree": "a cartoon teen shaking their head with a small x mark above",
  "decide": "a cartoon teen standing at a fork in a path, pointing one direction",
  "choice": "two cartoon arrows pointing in different directions from one starting point",
  "reason": "a cartoon light bulb connected by a dotted line to a small gear",
  "match": "a cartoon whistle and a checkered flag crossed together",
  "cheer": "a cartoon teen with both arms up holding pom-poms, excited expression",
  "proud": "a cartoon teen standing tall with hands on hips and a big confident smile",
  "teamwork": "a cartoon group of hands stacked together in the center, teens' arms visible",
}

order = list(DESC.keys())

out_lines = []
out_lines.append("# Level 3 (New Teen Curriculum) — Vocab Image Prompts\n")
out_lines.append(
    "99 words for the rebuilt teen-native Level 3 curriculum. Transparent "
    "background baked into every prompt. Save each one named exactly as "
    "shown and drop into `assets/vocab/` — picked up automatically "
    "everywhere (Present decks, worksheets, flashcards, homework).\n"
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

with open("_docs/level3-teen-vocab-image-prompts.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

print(f"Wrote {len(order)} prompts across {batch_num} batches (max {BATCH_SIZE}/batch)")
