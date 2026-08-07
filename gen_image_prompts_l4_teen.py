# -*- coding: utf-8 -*-

STYLE = ("Simple flat vector illustration for a children's/tween's English-learning app. "
         "Bright cheerful colors, thick clean black outlines, soft rounded shapes, "
         "one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG "
         "cutout, no background color, no shadow plane, no scenery behind the "
         "subject), no text or letters anywhere in the image, no watermark, "
         "square 1:1 composition, friendly and a little more mature/stylish than "
         "a toddler's storybook (this is for ages 11-13+), aimed at Arabic-speaking "
         "students. If your tool cannot export true transparency, use a plain "
         "solid white background instead so it can be removed cleanly.")

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

DESC = {
  "study": "a cartoon teen reading a textbook at a desk, focused expression",
  "hang out": "two cartoon teens sitting together on a bench, relaxed and chatting",
  "relax": "a cartoon teen lying back in a hammock, eyes closed, peaceful",
  "chill": "a cartoon teen leaning back in a chair with hands behind head, relaxed",
  "deadline": "a cartoon calendar page with one date circled in red",
  "workout": "a cartoon teen mid-jump doing a jumping jack, energetic pose",
  "screen time": "a cartoon phone with a small clock icon overlapping the screen",
  "bedtime": "a cartoon crescent moon and a few stars above a simple pillow shape",
  "daily": "a cartoon sun rising over a calendar page repeated as a small loop icon",
  "weekly": "a cartoon calendar page showing seven boxes in a row, one highlighted",
  "constantly": "a cartoon phone with several chat bubble icons stacked around it non-stop",
  "occasionally": "a cartoon calendar with just one day lightly circled among many blank ones",
  "appointment": "a cartoon clock face with a small calendar icon beside it",
  "holiday": "a cartoon suitcase with a sun and palm leaf on top",
  "semester": "a cartoon stack of textbooks with a calendar page behind them",
  "break": "a cartoon steaming cup of tea beside a comfy cushion",
  "message": "a cartoon chat bubble with three small dots inside, like typing",
  "reply": "a cartoon chat bubble with a curved return arrow inside it",
  "call": "a cartoon smartphone with a green phone icon and sound waves",
  "invite": "a cartoon envelope with a small star on the flap",
  "meet": "two cartoon teens waving at each other from a short distance",
  "video chat": "a cartoon laptop screen showing a smiling face in a video call window",
  "earbuds": "a cartoon pair of small wireless earbuds with their charging case",
  "notebook": "a cartoon spiral-bound notebook with a pencil resting on top",
  "sneakers": "a cartoon pair of colorful high-top sneakers",
  "leftovers": "a cartoon food container with a lid, half full",
  "groceries": "a cartoon paper grocery bag with a baguette and vegetables peeking out",
  "pantry": "a cartoon small cabinet with shelves showing jars and cans",
  "ingredients": "a cartoon mixing bowl surrounded by an egg, flour bag, and a spoon",
  "allowance": "a cartoon open coin purse with a few coins spilling out",
  "price tag": "a cartoon price tag with a dollar sign on a string",
  "discount": "a cartoon percentage sign inside a starburst shape",
  "budget": "a cartoon notebook page with a simple pie chart drawn on it",
  "savings": "a cartoon piggy bank with a coin dropping into the slot",
  "save": "a cartoon hand dropping a coin into a piggy bank",
  "spend": "a cartoon hand holding out a coin toward a shopping bag",
  "earn": "a cartoon hand receiving a coin, palm up",
  "borrow": "a cartoon hand passing a coin to another hand, dotted arrow showing direction",
  "lend": "a cartoon hand giving a coin to another hand, solid arrow showing direction",
  "coins": "a small stack of cartoon gold coins",
  "talented": "a cartoon teen holding a microphone with musical notes floating around",
  "skilled": "a cartoon teen doing a skateboard trick, confident pose",
  "impressive": "a cartoon crowd of small hands clapping around a spotlight",
  "outstanding": "a cartoon gold star with sparkle lines radiating outward",
  "popular": "a cartoon group of small figures gathered around one smiling teen",
  "unique": "a cartoon single colorful star standing out among plain grey stars",
  "request": "a cartoon raised hand with a small chat bubble containing a question mark",
  "prefer": "a cartoon teen pointing to one of two options with a smile",
  "suggest": "a cartoon light bulb glowing above a raised hand",
  "recommend": "a cartoon thumbs-up inside a speech bubble",
  "choice": "two cartoon arrows pointing in different directions from one starting point",
  "advice": "a cartoon speech bubble with a small light bulb inside",
  "opinion": "a cartoon speech bubble with a small thumbs-up icon inside",
  "suggestion": "a cartoon light bulb with a small exclamation mark beside it",
  "warning": "a cartoon triangle with an exclamation mark inside, bright yellow/orange",
  "tip": "a cartoon small folded note with a star drawn on it",
  "habit": "a cartoon circular arrow forming a loop, like a repeating cycle",
  "post": "a cartoon phone screen showing a photo icon with a heart and comment icon below",
  "comment": "a cartoon speech bubble with a small pencil beside it",
  "like": "a cartoon thumbs-up icon with a small heart beside it",
  "notification": "a cartoon bell icon with a small red dot on top",
  "online": "a cartoon globe icon with a small green dot beside it",
  "cooperate": "two cartoon teens each holding one side of the same puzzle piece",
  "contribute": "a cartoon hand placing one puzzle piece into a larger puzzle",
  "support": "a cartoon hand holding up another hand from below",
  "encourage": "a cartoon teen cheering with both arms raised beside another teen",
  "teamwork": "a cartoon group of hands stacked together in the center, teens' arms visible",
  "leader": "a cartoon teen standing slightly ahead of a small group, pointing forward",
  "decide": "a cartoon teen standing at a fork in a path, pointing one direction",
  "option": "a cartoon signpost with two arrows pointing different ways",
  "consider": "a cartoon teen with hand on chin, thoughtful expression, small thought bubble",
  "consequence": "a cartoon set of dominoes, one falling into the next",
  "compromise": "a cartoon balance scale with two equal sides",
  "nervous": "a cartoon teen biting their lip with a small sweat drop and raised eyebrows",
  "confident": "a cartoon teen standing tall with hands on hips, chin up, big smile",
  "calm": "a cartoon teen sitting cross-legged with closed eyes, peaceful expression",
  "anxious": "a cartoon teen with wide eyes and both hands gripping their own sleeves",
  "relieved": "a cartoon teen wiping their forehead with a small exhale breath cloud",
  "proud": "a cartoon teen standing tall with hands on hips and a big confident smile",
  "goal": "a cartoon target/bullseye with an arrow in the center",
  "dream": "a cartoon thought bubble shaped like a cloud with a small star inside",
  "ambition": "a cartoon rocket ship launching upward with a trail of sparkles",
  "career": "a cartoon briefcase with a small upward graph arrow on it",
  "passion": "a cartoon heart with small sparkle lines radiating outward",
  "achieve": "a cartoon teen reaching the top of a small mountain, flag planted",
  "culture": "a cartoon globe with small decorative pattern lines wrapped around it",
  "tradition": "a cartoon lantern or ornament with a decorative pattern, warm colors",
  "language": "a cartoon speech bubble containing two overlapping different alphabet-like squiggles (no real letters)",
  "custom": "a cartoon gift wrapped with a ribbon, festive style",
  "explore": "a cartoon compass with the needle pointing forward, small dotted path behind it",
  "journey": "a cartoon winding dotted path leading to a small flag on a hill",
  "project": "a cartoon poster board with a simple chart and photos pinned on it",
  "disagree": "a cartoon teen shaking their head with a small x mark above",
}

order = list(DESC.keys())

out_lines = []
out_lines.append("# Level 4 (New Teen Curriculum) — Vocab Image Prompts\n")
out_lines.append(
    "93 words for the rebuilt teen-native Level 4 curriculum. Transparent "
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

with open("_docs/level4-teen-vocab-image-prompts.md", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

print(f"Wrote {len(order)} prompts across {batch_num} batches (max {BATCH_SIZE}/batch)")
