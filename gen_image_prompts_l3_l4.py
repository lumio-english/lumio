# -*- coding: utf-8 -*-
import json, glob, os

STYLE = ("Simple flat vector illustration for a children's English-learning app. "
         "Bright cheerful colors, thick clean black outlines, soft rounded shapes, "
         "one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG "
         "cutout, no background color, no shadow plane, no scenery behind the "
         "subject), no text or letters anywhere in the image, no watermark, "
         "square 1:1 composition, friendly and warm, aimed at Arabic-speaking "
         "kids ages 6-9. If your tool cannot export true transparency, use a "
         "plain solid white background instead so it can be removed cleanly.")

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

def gen(level, desc, out_path, batch_size=12):
    existing = set(os.path.splitext(f)[0] for f in os.listdir("assets/vocab") if f.endswith(".png"))
    seen = set()
    words = []
    lesson_meta = []
    for f in sorted(glob.glob(f"lessons/{level}/lesson*.json")):
        d = json.load(open(f, encoding="utf-8"))
        vw = []
        for w in d["vocab"]:
            key = w["en"].lower()
            if key in seen:
                continue
            seen.add(key)
            s = slug(w["en"])
            if s in existing:
                continue
            vw.append(w["en"])
            words.append(w["en"])
        if vw:
            lesson_meta.append((d["number"], d["title"], vw))

    missing_desc = [w for w in words if w not in desc]
    if missing_desc:
        print("WARNING missing descriptions for:", missing_desc)
        return

    out_lines = []
    out_lines.append(f"# {level.capitalize()} — Vocab Image Prompts for ChatGPT/DALL-E\n")
    out_lines.append(
        "**Transparent background is baked into every prompt below** — no need to "
        "add it yourself. Generate each image, save it named exactly as shown, drop "
        "it into `assets/vocab/`, and it's picked up automatically (no code changes "
        "needed). If what comes back still has a background, that's fine — send it "
        "to me anyway and I'll strip it on my end the same way as the Level 2 batch.\n"
    )
    out_lines.append(f"**Master style (already appended to every prompt below):**\n> {STYLE}\n")
    out_lines.append("---\n")

    batch_num = 0
    buf_words, buf_files = [], []

    def flush():
        nonlocal batch_num, buf_words, buf_files
        if not buf_words:
            return
        batch_num += 1
        out_lines.append(f"## Batch {batch_num} ({len(buf_words)} images)\n")
        for w, fname in zip(buf_words, buf_files):
            prompt = f"{desc[w]}. {STYLE}"
            out_lines.append(f"**`{fname}`** — *{w}*")
            out_lines.append(f"> {prompt}\n")
        buf_words, buf_files = [], []

    for num, title, vw in lesson_meta:
        out_lines.append(f"<!-- Lesson {num:02d}: {title} -->")
        for w in vw:
            buf_words.append(w)
            buf_files.append(f"{slug(w)}.png")
            if len(buf_words) >= batch_size:
                flush()
    flush()

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))
    print(f"Wrote {len(words)} prompts across {batch_num} batches to {out_path}")


# ============================================================
# LEVEL 3 — visual descriptions
# ============================================================
DESC_L3 = {
  "library": "a cartoon building with tall bookshelves visible through big windows and a small flag on top",
  "zoo": "a cartoon entrance gate with a lion statue and colorful balloons",
  "museum": "a cartoon building with tall columns and stone steps, like a small classical museum",
  "beach": "a cartoon sandy beach scene with a beach ball, a sandcastle, and gentle waves",
  "mountain": "a cartoon snow-capped mountain peak with a winding path",
  "farm": "a cartoon red barn with a fence and a small wheat field",
  "doctor": "a friendly cartoon doctor in a white coat with a stethoscope, waving",
  "police officer": "a friendly cartoon police officer in uniform with a badge, waving",
  "firefighter": "a friendly cartoon firefighter in uniform and helmet holding a hose",
  "farmer": "a friendly cartoon farmer in overalls and a straw hat holding a pitchfork",
  "chef": "a friendly cartoon chef in a white hat and apron holding a wooden spoon",
  "engineer": "a friendly cartoon engineer wearing a hard hat and holding blueprints",
  "pilot": "a friendly cartoon pilot in uniform with a captain's hat, waving",
  "nurse": "a friendly cartoon nurse in scrubs holding a clipboard",
  "driver": "a friendly cartoon bus driver sitting behind a large steering wheel",
  "job": "a cartoon briefcase with a small gear icon on it",
  "work": "a cartoon desk with a laptop and a coffee cup",
  "bus": "a colorful cartoon yellow school bus, three-quarter view",
  "bike": "a colorful cartoon bicycle with a basket",
  "train": "a colorful cartoon steam train with round windows",
  "plane": "a colorful cartoon airplane flying with a few clouds",
  "boat": "a colorful cartoon sailboat with a striped sail",
  "taxi": "a colorful cartoon yellow taxi cab with a light on top",
  "ship": "a large colorful cartoon cruise ship on gentle waves",
  "walk": "a cartoon kid mid-stride walking happily, motion lines behind",
  "motorcycle": "a colorful cartoon motorcycle with a rounded friendly shape",
  "running": "a cartoon kid running fast with motion lines and one foot in the air",
  "jumping": "a cartoon kid jumping high with arms up, mid-air",
  "eating": "a cartoon kid happily eating with a spoon at a bowl",
  "drinking": "a cartoon kid drinking from a cup with a straw",
  "sleeping": "a cartoon kid sleeping peacefully with a little zzz cloud",
  "swimming": "a cartoon kid swimming with arms stretched forward, splash around",
  "cycling": "a cartoon kid riding a bicycle happily",
  "photography": "a colorful cartoon camera with a flash and a small photo popping out",
  "football": "a colorful cartoon soccer ball with black and white pentagon pattern",
  "fishing": "a cartoon fishing rod with a line and a small fish jumping",
  "gardening": "a cartoon watering can pouring water onto a small flower",
  "collecting": "a cartoon jar filled with colorful buttons or stones",
  "basketball": "a colorful cartoon orange basketball with black lines",
  "tennis": "a colorful cartoon tennis racket and a yellow tennis ball",
  "volleyball": "a colorful cartoon volleyball with panel lines, mid-bounce",
  "race": "two cartoon kids racing, running side by side with motion lines",
  "team": "a group of three cartoon kids with arms around each other, smiling",
  "win": "a cartoon gold trophy with stars around it",
  "climb": "a cartoon kid climbing a tree, reaching up to a branch",
  "cook": "a cartoon kid in a small chef hat stirring a pot",
  "ride a bike": "a cartoon kid riding a bicycle with a helmet, big smile",
  "tiger": "a friendly cartoon tiger standing, orange with black stripes",
  "bear": "a friendly cartoon brown bear standing on hind legs, waving",
  "snake": "a friendly cartoon green snake curled in a spiral shape",
  "wolf": "a friendly cartoon grey wolf sitting, one ear up",
  "fox": "a friendly cartoon orange fox with a bushy tail, sitting",
  "wild": "a cartoon jungle silhouette with paw prints in the foreground",
  "cage": "a cartoon empty animal cage with round bars, cheerful colors",
  "bigger": "two cartoon circles side by side, one much larger than the other, with an up arrow on the larger one",
  "smaller": "two cartoon circles side by side, one much smaller than the other, with a down arrow on the smaller one",
  "sheep": "a friendly cartoon fluffy white sheep standing",
  "pig": "a friendly cartoon pink pig standing, curly tail",
  "donkey": "a friendly cartoon grey donkey standing",
  "cow": "a friendly cartoon black and white spotted cow standing",
  "shark": "a friendly cartoon grey shark swimming, rounded not scary",
  "whale": "a friendly cartoon blue whale swimming with a water spout",
  "dolphin": "a friendly cartoon grey dolphin jumping over a wave",
  "octopus": "a friendly cartoon purple octopus with eight curled arms",
  "crab": "a friendly cartoon red crab with big round claws, sideways stance",
  "jellyfish": "a friendly cartoon pink jellyfish with flowing tentacles",
  "spring": "a cartoon tree branch with pink blossoms and a small butterfly",
  "summer": "a cartoon sun wearing sunglasses over a beach umbrella",
  "autumn": "a cartoon tree with orange and red falling leaves",
  "winter": "a cartoon snowman with a scarf and a few snowflakes",
  "season": "a cartoon circle divided into four colorful quarters (sun, flower, leaf, snowflake)",
  "warm": "a cartoon mug of hot cocoa with steam rising, cozy colors",
  "scarf": "a colorful cartoon knitted scarf with a striped pattern",
  "gloves": "a pair of colorful cartoon mittens",
  "boots": "a pair of colorful cartoon rain boots",
  "sweater": "a colorful cartoon knitted sweater, folded",
  "swimsuit": "a colorful cartoon one-piece swimsuit",
  "raincoat": "a colorful cartoon yellow raincoat with a hood",
  "next to": "two cartoon boxes side by side touching, with a small arrow between them",
  "between": "three cartoon boxes in a row, the middle one highlighted with a glow",
  "behind": "a cartoon tree with a small cartoon cat peeking out from directly behind it",
  "in front of": "a cartoon chair with a small cartoon ball sitting directly in front of it",
  "above": "a cartoon cloud floating above a small house, with an up arrow",
  "below": "a cartoon fish swimming below a boat, with a down arrow",
  "who": "a cartoon question mark over a simple silhouette of a person",
  "what": "a cartoon question mark over a mystery gift box",
  "where": "a cartoon question mark over a map with a pin",
  "when": "a cartoon question mark over a clock face",
  "why": "a cartoon question mark over a glowing light bulb",
  "how": "a cartoon question mark over a gear/cog wheel",
  "airport": "a cartoon airport control tower with an airplane taking off behind it",
  "restaurant": "a cartoon restaurant storefront with a table and candle visible through the window",
  "full": "a cartoon glass completely filled to the brim with orange juice",
  "empty": "a cartoon glass that is completely empty, outline only",
  "loud": "a cartoon megaphone with sound wave lines radiating out",
  "quiet": "a cartoon finger in front of lips in a 'shh' gesture",
}

# ============================================================
# LEVEL 4 — visual descriptions
# ============================================================
DESC_L4 = {
  "wakes up": "a cartoon boy stretching in bed with sunrise through the window",
  "eats": "a cartoon boy eating happily at a table with a fork",
  "sleeps": "a cartoon boy sleeping in bed with a small moon and star above",
  "plays": "a cartoon boy playing with a ball, mid-kick",
  "reads": "a cartoon boy sitting cross-legged reading an open book",
  "works": "a cartoon adult sitting at a desk typing on a laptop",
  "always": "a cartoon clock face with a full circle of small stars around it",
  "usually": "a cartoon clock face with most (not all) of the circle filled with small stars",
  "sometimes": "a cartoon clock face with half the circle filled with small stars",
  "never": "a cartoon clock face with a red circle-slash (prohibition sign) over it",
  "often": "a cartoon clock face with several small stars clustered on one side",
  "rarely": "a cartoon clock face with just one small star on it",
  "money": "a cartoon stack of colorful paper bills and coins",
  "price": "a cartoon price tag with a dollar sign",
  "buy": "a cartoon hand exchanging a coin for a small wrapped gift",
  "sell": "a cartoon market stall with a striped awning and items displayed",
  "expensive": "a cartoon price tag with a very large dollar sign and sparkle, on a fancy item",
  "cheap": "a cartoon price tag with a small dollar sign on a simple item",
  "cash": "a cartoon folded stack of colorful paper money",
  "receipt": "a cartoon paper receipt with printed lines, curling at the bottom",
  "apples": "three colorful cartoon red apples grouped together",
  "eggs": "a cartoon carton with six white eggs inside",
  "sugar": "a cartoon glass jar filled with white sugar cubes",
  "some": "a cartoon bowl with a few round candies in it (not full, not empty)",
  "any": "a cartoon bowl with a question mark floating above it",
  "coin": "a single shiny colorful cartoon gold coin",
  "dollar": "a colorful cartoon dollar bill with a large dollar sign",
  "pay": "a cartoon hand holding out a coin toward a shop counter",
  "change": "a small cartoon pile of coins being handed back",
  "cost": "a cartoon calculator with a dollar sign on the screen",
  "menu": "a cartoon restaurant menu card standing open, with simple food icons (no readable text)",
  "waiter": "a friendly cartoon waiter in a bow tie and apron, holding a tray with a plate",
  "order": "a cartoon speech bubble with a small burger icon inside it",
  "thirsty": "a cartoon kid with tongue out reaching for a glass of water",
  "delicious": "a cartoon kid rubbing their tummy with a big happy smile, plate of food nearby",
  "more": "a cartoon empty plate with a plus sign and a small extra spoonful beside it",
  "bill": "a cartoon small folder holding a printed check/receipt on a restaurant table",
  "yummy": "a cartoon kid with closed eyes and a big smile, holding a spoon up to their mouth",
  "vegetables": "a colorful cartoon mix of broccoli, carrot, and tomato grouped together",
  "fruit": "a colorful cartoon mix of apple, banana, and grapes grouped together",
  "junk food": "a cartoon burger and fries with a small red warning triangle nearby",
  "vitamins": "a cartoon bottle of colorful vitamin pills, a few spilling out",
  "strong": "a cartoon kid flexing an arm muscle, confident smile",
  "diet": "a cartoon plate divided into colorful sections of healthy foods",
  "week": "a cartoon calendar page showing seven small boxes in a row",
  "weekend": "a cartoon calendar with the last two days circled in bright color",
  "schedule": "a cartoon clipboard with a simple checklist and a clock icon",
  "homework": "a cartoon notebook and pencil with a small apple on top",
  "practice": "a cartoon kid practicing piano at a small keyboard",
  "club": "a cartoon banner flag with a star emblem, like a club badge",
  "rest": "a cartoon kid relaxing on a cozy couch with a cushion",
  "free time": "a cartoon kid happily juggling a ball and a book, playful pose",
  "me": "a cartoon kid pointing both thumbs at their own chest, big smile",
  "him": "a cartoon finger pointing at a single boy character standing to the side",
  "us": "a cartoon group of three kids standing together with arms linked",
  "them": "a cartoon finger pointing at a group of two kids standing together",
  "it": "a cartoon finger pointing at a simple round ball (a thing, not a person)",
  "mine": "a cartoon kid hugging a backpack close with a small star label on it",
  "yours": "a cartoon kid handing a backpack toward another kid",
  "hers": "a cartoon girl standing next to a doll with a small heart label on it",
  "ours": "two cartoon kids each with one hand on a shared toy box",
  "theirs": "a cartoon group of two kids standing behind a shared pile of toys",
  "whose": "a cartoon question mark over a mystery backpack with no owner visible",
  "see": "a cartoon eye with sparkle lines, looking at a small star",
  "hear": "a cartoon ear with sound wave lines next to it",
  "smell": "a cartoon nose with wavy scent lines rising from a flower",
  "taste": "a cartoon tongue sticking out near a small ice cream cone",
  "touch": "a cartoon hand reaching out to touch a soft fuzzy ball",
  "sense": "a cartoon head silhouette with five small icons around it (eye, ear, nose, mouth, hand)",
  "hair": "a cartoon head silhouette showing wavy brown hair on top, no face",
  "tall": "a cartoon kid standing very tall next to a small height-measuring chart",
  "short": "a cartoon kid who is noticeably shorter, standing next to the same height chart",
  "curly": "a cartoon head with big bouncy curly hair",
  "straight": "a cartoon head with smooth straight hair",
  "beard": "a cartoon face showing just a friendly rounded brown beard, no other features",
  "kind": "a cartoon kid helping another kid up who has fallen, gentle smile",
  "funny": "a cartoon kid laughing with a big open-mouth smile and a red clown nose",
  "smart": "a cartoon kid with a graduation cap and a glowing light bulb above their head",
  "friendly": "two cartoon kids waving and smiling at each other",
  "polite": "a cartoon kid giving a small bow with a hand on chest",
  "honest": "a cartoon kid with hand over heart and a small checkmark badge",
  "best friend": "two cartoon kids with arms around each other's shoulders, big smiles",
  "generous": "a cartoon kid handing half of a cookie to another kid",
  "share": "two cartoon kids each holding one side of the same book",
  "help": "a cartoon kid extending a hand to pull another kid up",
  "trust": "two cartoon kids doing a pinky promise, smiling",
  "together": "a group of three cartoon kids jumping together, holding hands",
  "story": "a cartoon open storybook with a small castle illustration visible on the page",
  "evening": "a cartoon sunset scene with an orange sky over hills",
  "day": "a cartoon bright sun in a blue sky with a few clouds",
}

gen("level3", DESC_L3, "_docs/level3-vocab-image-prompts.md")
gen("level4", DESC_L4, "_docs/level4-vocab-image-prompts.md")
