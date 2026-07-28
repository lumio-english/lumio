# -*- coding: utf-8 -*-
import json, glob, os

STYLE = ("Simple flat vector illustration for a children's English-learning app. "
         "Bright cheerful colors, thick clean black outlines, soft rounded shapes, "
         "one centered subject, plain white background, no text or letters anywhere "
         "in the image, no watermark, square 1:1 composition, friendly and warm, "
         "aimed at Arabic-speaking kids ages 6-8.")

# visual description for each missing word -> what the image should show
DESC = {
  "please": "a cartoon kid with hands pressed together, smiling and politely asking for something",
  "sorry": "a cartoon kid with a gentle sad-but-kind face, one hand on chest, apologizing",
  "nice to meet you": "two cartoon kids shaking hands and smiling at each other",
  "old": "a cheerful cartoon grandfather with white hair and a cane",
  "young": "a cartoon baby or very young child crawling and smiling",
  "age": "a birthday cake with a big glowing number candle on top",
  "years old": "a cartoon kid proudly holding up fingers to show a number",
  "birthday": "a colorful birthday cake with candles and confetti",
  "grow up": "a fun height chart on a wall showing a kid growing taller in three stages",
  "parents": "a cartoon mom and dad standing together smiling, holding hands",
  "grandparents": "a cartoon grandmother and grandfather standing together smiling",
  "uncle": "a cartoon man smiling and waving, playful uncle style",
  "aunt": "a cartoon woman smiling and waving, friendly aunt style",
  "cousin": "two cartoon kids playing together happily, same age",
  "twins": "two identical cartoon kids in matching outfits standing side by side",
  "he": "a single cartoon boy character standing confidently, three-quarter view, waving",
  "she": "a single cartoon girl character standing confidently, three-quarter view, waving",
  "man": "a friendly cartoon adult man standing and smiling",
  "woman": "a friendly cartoon adult woman standing and smiling",
  "my": "a cartoon kid hugging their own backpack close, pointing to themselves",
  "your": "a cartoon kid pointing toward a friend's backpack",
  "his": "a cartoon boy pointing at a book that belongs to another boy",
  "her": "a cartoon girl pointing at a doll that belongs to another girl",
  "our": "two cartoon kids standing together with both hands on a shared desk",
  "their": "two cartoon kids pointing together at a house in the distance",
  "phone": "a colorful cartoon smartphone with a simple smiling screen icon",
  "watch": "a colorful cartoon wristwatch with a round clock face",
  "glasses": "a pair of round cartoon eyeglasses with colorful frames",
  "wallet": "a small colorful cartoon wallet, slightly open",
  "key": "a shiny colorful cartoon key with a round handle",
  "camera": "a colorful cartoon camera with a big round lens",
  "eyebrow": "a close-up cartoon face zoomed in on one raised eyebrow, playful expression",
  "chin": "a close-up cartoon face zoomed in on the chin, pointing at it with one finger",
  "cheek": "a close-up cartoon face zoomed in on a rosy round cheek",
  "neck": "a close-up cartoon of a kid's head and neck, gently touching their neck",
  "elbow": "a cartoon kid bending their arm to show their elbow clearly",
  "knee": "a cartoon kid touching their bent knee, sitting pose",
  "classroom": "a bright cartoon classroom with desks, a chalkboard, and colorful posters",
  "playground": "a cartoon playground with a slide, swing, and kids playing",
  "principal": "a friendly cartoon adult standing in front of a school building, welcoming",
  "student": "a cartoon kid wearing a backpack, holding a book, smiling",
  "lesson": "an open cartoon notebook with a pencil, a chalkboard with simple shapes behind it",
  "board": "a green cartoon classroom chalkboard with colorful chalk doodles (no readable words)",
  "stand up": "a cartoon kid standing up from a chair with an arrow pointing upward",
  "sit down": "a cartoon kid sitting down on a chair with an arrow pointing downward",
  "listen": "a cartoon kid with a hand cupped to their ear, listening carefully",
  "look": "a cartoon kid with wide eyes pointing at their own eyes, looking forward",
  "open your book": "a cartoon kid opening a colorful storybook on a desk",
  "raise your hand": "a cartoon kid sitting at a desk with one hand raised high",
  "thirty": "the number 30 shown as thirty colorful cartoon stars grouped together",
  "forty": "the number 40 shown as forty colorful cartoon balloons grouped together",
  "fifty": "the number 50 shown as fifty colorful cartoon dots grouped together",
  "eighty": "the number 80 shown as a big cartoon counting chart of dots",
  "hundred": "a cartoon trophy with a big shining '100' star badge (numeral only, no words)",
  "January": "a cartoon winter calendar page scene with snow and a cozy sweater",
  "month": "a cartoon calendar page with a blank grid of days (no readable text)",
  "year": "a cartoon calendar showing four small seasonal scenes in a circle (spring, summer, autumn, winter)",
  "June": "a cartoon summer scene with sun, ice cream, and blue sky",
  "September": "a cartoon back-to-school scene with a backpack and school bus",
  "December": "a cartoon winter holiday scene with snowflakes and a decorated tree",
  "birthday party": "a cartoon birthday party table with cake, balloons, and party hats",
  "candle": "a single lit birthday candle with a warm glowing flame",
  "present": "a colorful cartoon gift box with a big ribbon bow",
  "balloon": "a bunch of colorful cartoon balloons floating with strings",
  "guest": "a cartoon kid ringing a doorbell holding a small gift, smiling",
  "clock": "a round cartoon wall clock with big colorful hands",
  "o'clock": "a round cartoon clock face showing an exact hour with both hands pointing straight up and out",
  "half past": "a round cartoon clock face showing the long hand pointing straight down (half past)",
  "morning": "a cartoon sunrise scene with a smiling sun over hills",
  "afternoon": "a cartoon bright midday sun high in a blue sky over a park",
  "night": "a cartoon night sky scene with a smiling moon and stars",
  "wake up": "a cartoon kid stretching in bed with a sunrise through the window and an alarm clock",
  "brush my teeth": "a cartoon kid brushing their teeth in front of a bathroom mirror, big smile",
  "get dressed": "a cartoon kid putting on a colorful shirt in front of a closet",
  "have breakfast": "a cartoon kid sitting at a table eating breakfast, cereal bowl and juice",
  "put on my shoes": "a cartoon kid sitting on the floor tying colorful sneakers",
  "go to school": "a cartoon kid walking with a backpack toward a school building",
  "come home": "a cartoon kid opening the front door of a house, waving hello",
  "do homework": "a cartoon kid sitting at a desk writing in a notebook with a pencil",
  "take a shower": "a cartoon bathroom scene with a showerhead and water droplets, rubber duck nearby",
  "have dinner": "a cartoon family sitting together at a dinner table with plates of food",
  "read a book": "a cartoon kid sitting cross-legged reading a picture book",
  "go to bed": "a cartoon kid sleeping cozily in bed under blankets with a night lamp",
  "breakfast": "a colorful cartoon breakfast plate with eggs, toast, and orange juice",
  "lunch": "a colorful cartoon lunch plate with rice, chicken, and vegetables",
  "dinner": "a colorful cartoon dinner plate with soup and bread",
  "snack": "a small cartoon plate with fruit slices and crackers",
  "healthy food": "a colorful cartoon bowl overflowing with fruits and vegetables",
  "drawing": "a cartoon kid drawing a colorful picture with crayons on paper",
  "singing": "a cartoon kid singing joyfully into a toy microphone with music notes around",
  "reading": "a cartoon kid curled up reading a big picture book",
  "dancing": "a cartoon kid dancing happily with arms up and motion lines",
  "painting": "a cartoon kid painting on an easel with a paintbrush and palette",
  "cooking": "a cartoon kid in a small chef hat stirring a pot",
  "this": "a cartoon kid pointing at a pencil right in their own hand, close-up",
  "that": "a cartoon kid pointing across the room at a bag far away",
  "these": "a cartoon kid holding two books close to their chest",
  "those": "a cartoon kid pointing at two shoes far away near a door",
  "here": "a cartoon kid standing on a spot marked with a small flag or pin, pointing down at their feet",
  "there": "a cartoon kid pointing far off into the distance at a ball on the ground",
  "boxes": "a stack of colorful cartoon cardboard boxes",
  "children": "a group of three or four diverse cartoon kids playing together, holding hands",
  "watches": "two colorful cartoon wristwatches side by side",
  "babies": "two cartoon babies sitting together, smiling",
  "men": "two friendly cartoon adult men standing together, smiling",
}

LESSON_META = []
for f in sorted(glob.glob("lessons/level2/lesson*.json")):
    d = json.load(open(f, encoding="utf-8"))
    LESSON_META.append((d["number"], d["title"], [w["en"] for w in d["vocab"]]))

existing = set(os.path.splitext(f)[0] for f in os.listdir("assets/vocab") if f.endswith(".png"))

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

seen = set()
out_lines = []
out_lines.append("# Level 2 (\"About Me\") — Vocab Image Prompts for ChatGPT/DALL-E\n")
out_lines.append(
    "Design choice: since several Level 2 words are grammar/pronoun concepts "
    "(he, she, my, this, that...) that don't photograph well, these prompts use a "
    "**consistent flat-illustration style** rather than the real-photo style in "
    "`assets/vocab/`. Generate each image, save it named exactly as shown, drop it "
    "into `assets/vocab/`, and it's picked up automatically — no code changes needed.\n"
)
out_lines.append(f"**Master style (already appended to every prompt below):**\n> {STYLE}\n")
out_lines.append("---\n")

batch_num = 0
words_in_batch = []
batch_words_meta = []

def flush_batch():
    global batch_num, words_in_batch, batch_words_meta
    if not words_in_batch:
        return
    batch_num += 1
    out_lines.append(f"## Batch {batch_num} ({len(words_in_batch)} images)\n")
    for w, fname in zip(words_in_batch, batch_words_meta):
        prompt = f"{DESC[w]}. {STYLE}"
        out_lines.append(f"**`{fname}`** — *{w}*")
        out_lines.append(f"> {prompt}\n")
    words_in_batch = []
    batch_words_meta = []

BATCH_SIZE = 12

for num, title, vocab_words in LESSON_META:
    lesson_new = []
    for w in vocab_words:
        s = slug(w)
        if s in existing or w in seen:
            continue
        seen.add(w)
        lesson_new.append((w, f"{s}.png"))
    if not lesson_new:
        continue
    out_lines.append(f"<!-- Lesson {num:02d}: {title} -->")
    for w, fname in lesson_new:
        words_in_batch.append(w)
        batch_words_meta.append(fname)
        if len(words_in_batch) >= BATCH_SIZE:
            flush_batch()

flush_batch()

with open("_docs/level2-vocab-image-prompts.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

total = len(seen)
print(f"Wrote {total} prompts across {batch_num} batches to _docs/level2-vocab-image-prompts.md")

missing_desc = [w for _, _, vw in LESSON_META for w in vw if slug(w) not in existing and w not in DESC]
if missing_desc:
    print("WARNING missing descriptions for:", set(missing_desc))
