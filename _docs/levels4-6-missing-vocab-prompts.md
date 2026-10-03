# Levels 4-6: missing vocab pictures + missing recordings

Generated 3 Oct 2026 from `lessons/level4..6/lesson*.json` against `assets/vocab/` (a vocab entry's `"image"` override is honoured; the file name is the slug: lowercase, apostrophes dropped, every other run of non-letters -> `-`).

**136 vocab entries have no picture** (Level 4: 42, Level 5: 44, Level 6: 50). Every one is **NEW** (no file exists yet). Two of them share a file with an earlier entry, marked *(same file as ...)* below, so there are 134 files to make -- generate those once: `applause.png` (L4 L10 + L16) and `suddenly.png` (L5 L7 and L6 L4).

Pages already fall back gracefully (letter tile / hidden image), so nothing is broken while these are missing. Intake when the images come back: HANDOFF section 1 "VOCAB IMAGE DROP" (rename to the exact target filename, max 600px RGBA PNG, `assets/vocab/`, then `python3.12 regen_level.py <level> --pdfs` for the affected lessons, trial decks included).

Vocab Hub: `vocab-hub/level4.json` "moneybox" now points at the existing `piggy-bank.png` (`"image": "piggy-bank"`). Lesson 9 itself (`lessons/level4/lesson09.json`) still looks for `moneybox.png` -- either generate it below or add the same `"image": "piggy-bank"` override there and run `gen_lessons_data_bundle.py` + `regen_level.py level4`.

## Master style (append to EVERY subject sentence)

> Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

Each prompt below = the subject sentence + a space + the master style text above. Teen levels: draw any people as teenagers (12-16), same flat style.

## Level 4

### Lesson 1 -- Does She Even Sleep?

- **NEW** `assets/vocab/alarm.png` -- *alarm* (منبه). Example: "My alarm goes off at six every morning."
  - Prompt: A round red twin-bell alarm clock ringing, little motion lines around the bells, hands pointing to six o'clock. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/energy.png` -- *energy* (طاقة). Example: "She has so much energy after her run."
  - Prompt: A cheerful teen boy in sportswear jumping with both arms up, small yellow lightning-bolt sparks around him to show lots of energy. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/routine.png` -- *routine* (روتين). Example: "Brushing my teeth is part of my morning routine."
  - Prompt: A neat circular loop of four small icons joined by arrows: a toothbrush, a breakfast bowl, a school backpack and a bed, showing a daily routine. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 2 -- My Routine, My Rules

- **NEW** `assets/vocab/planner.png` -- *planner* (مفكرة). Example: "I write all my homework in my planner."
  - Prompt: An open spiral planner notebook with colourful tabs, ticked checkbox lines and a pencil resting on it (lines only, no writing). Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/limit.png` -- *limit* (حد). Example: "My screen-time limit is two hours a day."
  - Prompt: A smartphone with a big hourglass beside it and a red stop-hand badge, showing a screen-time limit. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/priority.png` -- *priority* (أولوية). Example: "Finishing my project is my top priority tonight."
  - Prompt: A tall stack of three folders with the top one glowing gold and a big gold star pinned to it, showing the top priority. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 3 -- How Often Do You...?

- **NEW** `assets/vocab/twice.png` -- *twice* (مرتين). Example: "I brush my teeth twice a day."
  - Prompt: Two identical toothbrushes side by side, each with a small sun and moon badge above (morning and night), showing twice a day. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 4 -- Before and After

- **NEW** `assets/vocab/calendar.png` -- *calendar* (تقويم). Example: "Mark the trip on the calendar so we don't forget."
  - Prompt: A wall calendar page with an empty date grid and one day circled in red marker, a small airplane sticker on the circled day. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/countdown.png` -- *countdown* (عد تنازلي). Example: "The countdown to summer vacation has started."
  - Prompt: A big digital-style countdown timer shape with three colourful dots counting down beside a beach umbrella and sun. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 5 -- Text Me

- **NEW** `assets/vocab/voicemail.png` -- *voicemail* (بريد صوتي). Example: "He didn't answer, so I left a voicemail."
  - Prompt: A smartphone showing a large voicemail symbol (two circles joined by a line) with a small sound-wave bubble. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/group-call.png` -- *group call* (مكالمة جماعية). Example: "We have a group call planned for tonight."
  - Prompt: A laptop screen split into four video tiles, each with a different smiling teen face, showing a group video call. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/typing.png` -- *typing* (يكتب). Example: "I can see you're typing, just send the message!"
  - Prompt: A chat bubble with three bouncing dots inside, floating above a smartphone held in two hands. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 6 -- That's Mine

- **NEW** `assets/vocab/keychain.png` -- *keychain* (ميدالية مفاتيح). Example: "This keychain was a gift from my grandmother."
  - Prompt: A cute keychain ring holding two keys and a small heart-shaped charm. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/lunchbox.png` -- *lunchbox* (علبة غداء). Example: "I packed a sandwich in my lunchbox."
  - Prompt: An open bright blue lunchbox with a sandwich, an apple slice and carrot sticks in neat compartments. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 7 -- Got Any Snacks?

- **NEW** `assets/vocab/crunchy.png` -- *crunchy* (مقرمش). Example: "These chips are so crunchy."
  - Prompt: A handful of golden potato chips mid-bite with small crunch burst lines around them. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/spicy.png` -- *spicy* (حار). Example: "That sauce is too spicy for me."
  - Prompt: A bright red chili pepper with little flame shapes above it and a tiny sweat drop, showing spicy food. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 8 -- How Much Is That?

- **NEW** `assets/vocab/sale.png` -- *sale* (تخفيضات). Example: "The shoes I wanted are finally on sale."
  - Prompt: A clothes shop price tag hanging from a sneaker, the tag cut diagonally in two with a red percent-off shape (no numbers or letters, use a big red percent symbol shape only). Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 9 -- Saving Up

- **NEW** `assets/vocab/moneybox.png` -- *moneybox* (حصالة). Example: "I keep my coins in a moneybox."
  - Prompt: A small rectangular wooden moneybox with a coin slot on top and a gold coin dropping in. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/bank.png` -- *bank* (بنك). Example: "I put my birthday money in the bank."
  - Prompt: A classic bank building with columns and a triangular roof, a big gold coin emblem on the front. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/goal-jar.png` -- *goal jar* (جرة الهدف). Example: "I keep coins in my goal jar for a new bike."
  - Prompt: A clear glass jar half full of gold coins with a small paper bicycle picture taped to the front. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 10 -- Best in Show

- **NEW** `assets/vocab/audience.png` -- *audience* (جمهور). Example: "The audience clapped loudly after the show."
  - Prompt: Rows of seated cartoon people seen from behind, all facing a small lit stage, clapping happily. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/judge.png` -- *judge* (حكم). Example: "One judge gave our project a perfect score."
  - Prompt: A friendly competition judge sitting at a table holding up a score paddle with a big gold star on it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/applause.png` -- *applause* (تصفيق). Example: "The applause lasted almost a minute."
  - Prompt: Two hands clapping together with bright yellow burst lines and small stars around them. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 11 -- I'd Like...

- **NEW** `assets/vocab/dessert.png` -- *dessert* (حلوى). Example: "Can we order dessert after dinner?"
  - Prompt: A pretty slice of layered chocolate cake on a small plate with a strawberry on top and a dessert fork. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 12 -- You Should Try This

- **NEW** `assets/vocab/patience.png` -- *patience* (صبر). Example: "Learning a new skill takes patience."
  - Prompt: A calm teen girl sitting cross-legged watching a small seedling sprout from a flower pot, an hourglass beside her. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 13 -- Group Chat

- **NEW** `assets/vocab/follow.png` -- *follow* (يتابع). Example: "I decided to follow her new page."
  - Prompt: A smartphone screen showing a round profile picture of a smiling teen and a big blue plus-person button being tapped by a finger. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/caption.png` -- *caption* (تعليق توضيحي). Example: "What caption should I write for this photo?"
  - Prompt: A printed photo of a sunset with an empty speech-bubble strip underneath it and a pencil beside it (no writing). Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/trend.png` -- *trend* (اتجاه رائج). Example: "That dance is the newest trend online."
  - Prompt: A smartphone with an upward zig-zag arrow shooting out of the screen and a small flame icon, showing something trending. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 14 -- Team Player

- **NEW** `assets/vocab/practice-match.png` -- *practice match* (مباراة تدريبية). Example: "We have a practice match on Wednesday."
  - Prompt: A football (soccer) pitch corner with two small orange training cones, a ball and a whistle hanging from a lanyard. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/pass.png` -- *pass* (تمرير). Example: "He made a perfect pass to his teammate."
  - Prompt: A football player's foot kicking the ball along the grass towards a teammate's waiting foot, a dashed arrow showing the pass. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 15 -- Big Decisions

- **NEW** `assets/vocab/pros-and-cons.png` -- *pros and cons* (الإيجابيات والسلبيات). Example: "Let's list the pros and cons before we decide."
  - Prompt: A balance scale with a green thumbs-up on one pan and a red thumbs-down on the other. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/risk.png` -- *risk* (مخاطرة). Example: "There's a small risk we might be late."
  - Prompt: A yellow triangular warning sign with an exclamation-mark shape beside a slippery banana peel. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/regret.png` -- *regret* (ندم). Example: "I don't want to regret not trying out for the team."
  - Prompt: A sad teen boy looking back over his shoulder at a closed door, hand on forehead, a small grey cloud above him. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 16 -- Under Pressure

- **NEW** `assets/vocab/deep-breath.png` -- *deep breath* (نفس عميق). Example: "Take a deep breath before you go on stage."
  - Prompt: A calm teen girl with eyes closed breathing in, soft swirling air lines flowing into her nose, hands on chest. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/stage.png` -- *stage* (مسرح). Example: "My hands were shaking as I walked onto the stage."
  - Prompt: An empty theatre stage with red curtains pulled open and a bright spotlight circle on the wooden floor. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/applause.png` -- *applause* (تصفيق) *(same file as Level 4 Lesson 10 -- already listed, do not generate twice)*

### Lesson 17 -- My Future Self

- **NEW** `assets/vocab/university.png` -- *university* (جامعة). Example: "My sister just started university this year."
  - Prompt: A grand university building with a dome and columns, a graduation cap floating above it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 18 -- Around the World

- **NEW** `assets/vocab/festival.png` -- *festival* (مهرجان). Example: "There's a food festival in the park this weekend."
  - Prompt: A colourful food festival scene in miniature: two festive food stalls with striped awnings and string lights. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/souvenir.png` -- *souvenir* (تذكار). Example: "I bought a small souvenir from every city we visited."
  - Prompt: A small snow globe with a tiny city skyline inside and a little gift ribbon on its base. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 19 -- Reading Adventure: The Group Project

- **NEW** `assets/vocab/research.png` -- *research* (بحث). Example: "We did our research at the library."
  - Prompt: A teen hand holding a magnifying glass over an open book, with a laptop and a small stack of books beside it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/slides.png` -- *slides* (شرائح). Example: "Can you finish the last two slides tonight?"
  - Prompt: A laptop showing a presentation slide with a simple bar chart and a picture placeholder, a clicker remote beside it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/feedback.png` -- *feedback* (تغذية راجعة). Example: "The teacher gave us helpful feedback on our project."
  - Prompt: A school project sheet with a big red tick, a smiling face sticker and a speech bubble with a thumbs-up. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

## Level 5

### Lesson 1 -- What I Did This Weekend

- **NEW** `assets/vocab/visited.png` -- *visited* (زار). Example: "We visited my grandparents on Friday."
  - Prompt: A family of three hugging grandparents at an open front door, a small suitcase beside them. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/baked.png` -- *baked* (خبز). Example: "I baked cookies with my little sister."
  - Prompt: A tray of freshly baked round cookies just out of the oven, with oven mitts beside it and steam curls. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/rested.png` -- *rested* (استراح). Example: "After the long walk, we just rested at home."
  - Prompt: A teen lying relaxed on a sofa with a pillow, eyes closed and a peaceful smile, shoes kicked off on the floor. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 2 -- Yesterday's Adventure

- **NEW** `assets/vocab/bought.png` -- *bought* (اشترى). Example: "I bought a new notebook yesterday."
  - Prompt: A shopping bag with a new notebook peeking out and a paper receipt curling from the top. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/met.png` -- *met* (قابل). Example: "We met our new neighbors this weekend."
  - Prompt: Two smiling families shaking hands across a garden fence, one holding a welcome plant pot. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 3 -- Did You...?

- **NEW** `assets/vocab/deliver.png` -- *deliver* (يسلّم). Example: "The mailman didn't deliver our package today."
  - Prompt: A delivery person in a cap handing a brown cardboard package to someone at a door. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/attend.png` -- *attend* (يحضر). Example: "Did everyone attend the class meeting?"
  - Prompt: A teen raising a hand in a classroom chair with a name badge on a lanyard, showing being present. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 4 -- How It Was

- **NEW** `assets/vocab/noisy.png` -- *noisy* (صاخب). Example: "The classroom was really noisy before the teacher arrived."
  - Prompt: A loud cartoon classroom scene in miniature: a drum, a trumpet and shouting speech bubbles with zig-zag sound lines. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/peaceful.png` -- *peaceful* (هادئ). Example: "The garden felt peaceful early in the morning."
  - Prompt: A quiet garden bench under a tree at sunrise with a few flowers and a butterfly. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 5 -- Back Then

- **NEW** `assets/vocab/queue.png` -- *queue* (طابور). Example: "We stood in a long queue for the roller coaster."
  - Prompt: A line of four cartoon people standing one behind another waiting at a ticket booth for a roller coaster. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/delay.png` -- *delay* (تأخير). Example: "There was a short delay before the show started."
  - Prompt: A clock with a small snail sitting on top of it and a pause symbol beside it, showing a delay. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 6 -- Time Travel

- **NEW** `assets/vocab/recently.png` -- *recently* (مؤخراً). Example: "I recently started learning the guitar."
  - Prompt: A calendar page with the last few days highlighted and a small new guitar leaning against it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/earlier.png` -- *earlier* (في وقت سابق). Example: "I finished my homework earlier than usual today."
  - Prompt: A clock with its hands turning backwards (curved arrow going anticlockwise) and a finished homework sheet with a tick. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/ago.png` -- *ago* (منذ). Example: "We moved to this house three years ago."
  - Prompt: An old photo frame showing a house, with a curved arrow pointing back over three small calendar pages. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 7 -- And Then...

- **NEW** `assets/vocab/suddenly.png` -- *suddenly* (فجأة). Example: "Suddenly, the lights went out."
  - Prompt: A living-room lamp going dark with a surprised cartoon face beside it and a burst of zig-zag lines, the lights just went out. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/at-last.png` -- *at last* (أخيراً). Example: "At last, the bus arrived."
  - Prompt: A happy waiting child jumping beside a bus stop sign as a yellow bus finally pulls up. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 8 -- Why It Happened

- **NEW** `assets/vocab/therefore.png` -- *therefore* (لذلك). Example: "It was raining, therefore we stayed inside."
  - Prompt: Two simple icons joined by a big bold arrow: a rain cloud on the left and a cosy house with a lit window on the right. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/cause.png` -- *cause* (سبب). Example: "The cause of the delay was heavy traffic."
  - Prompt: A row of toppling dominoes with a finger pushing the first one. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/result.png` -- *result* (نتيجة). Example: "As a result, we missed the first ten minutes."
  - Prompt: A row of fallen dominoes ending with a small trophy at the end of the line. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 9 -- How I Felt

- **NEW** `assets/vocab/thrilled.png` -- *thrilled* (مبتهج). Example: "She was thrilled when she saw her test score."
  - Prompt: A teen girl leaping with joy holding a test paper with a big gold star sticker, confetti around her. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 10 -- What Was Happening

- **NEW** `assets/vocab/thunder.png` -- *thunder* (رعد). Example: "We heard thunder in the distance during the picnic."
  - Prompt: A dark storm cloud with a jagged yellow lightning bolt and bold rumble lines. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/shelter.png` -- *shelter* (مأوى). Example: "We took shelter under a big tree."
  - Prompt: Two kids huddled under a big leafy tree while rain falls around (but not on) them. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 11 -- Study Story

- **NEW** `assets/vocab/revision.png` -- *revision* (مراجعة). Example: "I did a full revision the night before the exam."
  - Prompt: A study desk with stacked textbooks, colourful sticky notes, a highlighter pen and a desk lamp at night. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/effort.png` -- *effort* (جهد). Example: "Your effort really showed in this project."
  - Prompt: A teen pushing a big boulder up a gentle hill, sweat drops flying, determined smile. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 12 -- The Big Trip

- **NEW** `assets/vocab/boarding-pass.png` -- *boarding pass* (بطاقة صعود). Example: "Don't lose your boarding pass before the flight."
  - Prompt: An airline boarding pass ticket with a small airplane icon and a barcode stripe (no readable letters or numbers). Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/landmark.png` -- *landmark* (معلم سياحي). Example: "We took a photo in front of the famous landmark."
  - Prompt: A famous-looking tall clock tower landmark with a small camera in front taking its picture. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 13 -- What Went Wrong

- **NEW** `assets/vocab/dropped.png` -- *dropped* (أسقط). Example: "I dropped my phone but it didn't break."
  - Prompt: A smartphone falling in mid-air towards the floor with motion lines and a surprised hand above it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/forgot.png` -- *forgot* (نسي). Example: "He forgot his lunch at home again."
  - Prompt: A lunch bag left alone on a kitchen table with a small thought bubble containing a question mark shape. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/apologized.png` -- *apologized* (اعتذر). Example: "She apologized for being late."
  - Prompt: A teen boy with hand on chest bowing his head slightly to a friend, a small heart and sorry-face bubble. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 14 -- The Party

- **NEW** `assets/vocab/balloons.png` -- *balloons* (بالونات). Example: "We filled the room with colorful balloons."
  - Prompt: A bunch of five colourful party balloons tied together with curly ribbons. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/invitation.png` -- *invitation* (دعوة). Example: "Did you send the invitation to everyone?"
  - Prompt: A decorated party invitation card in an open envelope with balloons and confetti printed on it (no text). Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/playlist.png` -- *playlist* (قائمة أغانٍ). Example: "I made a playlist just for the party."
  - Prompt: A smartphone showing a music list of stacked song rows with little musical notes floating out, earbuds beside it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 15 -- A Day to Remember

- **NEW** `assets/vocab/anniversary.png` -- *anniversary* (ذكرى سنوية). Example: "Today is my parents' wedding anniversary."
  - Prompt: Two interlocked gold wedding rings on a small cushion with a heart-shaped cake beside them. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/photo-album.png` -- *photo album* (ألبوم صور). Example: "We looked through the old photo album together."
  - Prompt: An open photo album with four small family photos on the pages and a corner bookmark ribbon. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 16 -- While It Happened

- **NEW** `assets/vocab/daydreaming.png` -- *daydreaming* (يحلم يقظة). Example: "He was daydreaming instead of listening to the lesson."
  - Prompt: A teen boy resting his chin on his hand at a desk, a big thought cloud above him with a rocket and stars. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/whispering.png` -- *whispering* (يهمس). Example: "The girls were whispering during the movie."
  - Prompt: Two girls leaning close, one cupping a hand to the other's ear, a tiny soft speech bubble. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/giggling.png` -- *giggling* (يقهقه). Example: "The little kids kept giggling at the back."
  - Prompt: Three little kids covering their mouths and laughing, small happy squiggle lines around them. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 17 -- Interview a Classmate

- **NEW** `assets/vocab/turning-point.png` -- *turning point* (نقطة تحول). Example: "That match was the turning point of the season."
  - Prompt: A road sign with a sharp curved arrow turning upward, and a football trophy at the top of the arrow. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 18 -- Movie Night Recap

- **NEW** `assets/vocab/plot-twist.png` -- *plot twist* (تحول في الحبكة). Example: "Nobody expected that plot twist at the end."
  - Prompt: An open storybook with a big curly twisting arrow bursting out of the pages and a surprised face. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/scene.png` -- *scene* (مشهد). Example: "My favorite scene was the chase through the city."
  - Prompt: A film clapperboard (blank, no writing) in front of a tiny city backdrop with a racing car. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/credits.png` -- *credits* (شارة النهاية). Example: "We watched all the way through the credits."
  - Prompt: A cinema screen with blank scrolling lines moving upward and a popcorn bucket in front. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 19 -- Reading Adventure: The Lost Backpack

- **NEW** `assets/vocab/lost-and-found.png` -- *lost and found* (المفقودات). Example: "I checked the lost and found for my jacket."
  - Prompt: A cardboard box overflowing with lost items: a jacket, a cap, a water bottle and a single shoe. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/label.png` -- *label* (بطاقة اسم). Example: "My bag has a label with my name on it."
  - Prompt: A school backpack with a luggage-style tag tied to the handle (blank tag, no writing). Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/panic.png` -- *panic* (هلع). Example: "Try not to panic, we'll find it together."
  - Prompt: A teen with wide eyes and hands on cheeks, sweat drops and swirling lines above the head. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

## Level 6

### Lesson 1 -- My Plans

- **NEW** `assets/vocab/internship.png` -- *internship* (تدريب عملي). Example: "My cousin got an internship at a design studio."
  - Prompt: A teen wearing a visitor badge on a lanyard sitting at a design-studio desk with a drawing tablet. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/scholarship.png` -- *scholarship* (منحة دراسية). Example: "She applied for a scholarship to study abroad."
  - Prompt: A rolled diploma tied with a ribbon next to a graduation cap and a gold coin with a star. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 2 -- I Think It Will...

- **NEW** `assets/vocab/forecast.png` -- *forecast* (توقع). Example: "The forecast says it will be sunny all weekend."
  - Prompt: A TV-style weather map board with sun and cloud icons, a pointer stick resting against it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/certain.png` -- *certain* (متأكد). Example: "I'm certain we packed everything we need."
  - Prompt: A big green tick inside a circle next to a fully packed suitcase with its lid closed. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/unlikely.png` -- *unlikely* (غير محتمل). Example: "It's unlikely to rain during the trip."
  - Prompt: A sunny sky with one tiny faint raindrop crossed out, an umbrella lying folded and unused. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 3 -- This Weekend I'm...

- **NEW** `assets/vocab/booking.png` -- *booking* (حجز). Example: "Our hotel booking is confirmed for Friday."
  - Prompt: A hotel key card next to a smartphone showing a calendar with a green tick on one day. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/guest-list.png` -- *guest list* (قائمة الضيوف). Example: "Are you on the guest list for the party?"
  - Prompt: A clipboard with a list of blank lines, three of them ticked, and a party hat beside it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 4 -- While I Was...

- **NEW** `assets/vocab/suddenly.png` -- *suddenly* (فجأة) *(same file as Level 5 Lesson 7 -- already listed, do not generate twice)*
- **NEW** `assets/vocab/as-soon-as.png` -- *as soon as* (بمجرد أن). Example: "Call me as soon as you land."
  - Prompt: An airplane landing on a runway with a smartphone ringing above it, a small lightning-quick arrow between them. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/by-the-time.png` -- *by the time* (بحلول الوقت). Example: "By the time we arrived, the movie had started."
  - Prompt: A cinema door with a clock beside it showing late hands and a family rushing in, the screen already lit. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 5 -- Rules & Duties

- **NEW** `assets/vocab/mandatory.png` -- *mandatory* (إلزامي). Example: "Wearing a helmet is mandatory on this ride."
  - Prompt: A bright bicycle helmet with a big red exclamation badge and a red must-wear circle around it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 6 -- How You Do It

- **NEW** `assets/vocab/slowly.png` -- *slowly* (ببطء). Example: "Read the instructions slowly so you don't miss a step."
  - Prompt: A snail reading an instruction booklet carefully with a magnifying glass. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/gently.png` -- *gently* (بلطف). Example: "Handle the eggs gently, they break easily."
  - Prompt: Two careful hands holding a white egg very softly, small soft sparkle lines around it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/accurately.png` -- *accurately* (بدقة). Example: "She copied the drawing accurately."
  - Prompt: A pencil tracing over a drawing perfectly on a ruler-lined page, a target bullseye badge beside it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 7 -- Even Better

- **NEW** `assets/vocab/cheaper.png` -- *cheaper* (أرخص). Example: "This backpack is cheaper than the other one."
  - Prompt: Two backpacks side by side, the left one with a big price tag and the right one with a much smaller price tag and a green down-arrow. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/healthier.png` -- *healthier* (أكثر صحة). Example: "Grilled chicken is healthier than fried chicken."
  - Prompt: A grilled chicken plate with salad next to a greasy fried chicken plate, a big green heart above the grilled one. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/the-best.png` -- *the best* (الأفضل). Example: "This is the best pizza in town."
  - Prompt: A pizza slice standing on a winner's podium with a gold medal and a sparkle crown. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 8 -- Weekend Plans

- **NEW** `assets/vocab/brunch.png` -- *brunch* (فطور متأخر). Example: "We're having brunch with my aunt on Saturday."
  - Prompt: A late-morning table with pancakes, eggs, a juice glass and a croissant on a sunny tablecloth. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/road-trip.png` -- *road trip* (رحلة بالسيارة). Example: "Our family is planning a road trip this summer."
  - Prompt: A family car packed with suitcases on the roof driving along a winding road towards hills. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/board-game.png` -- *board game* (لعبة لوحية). Example: "Let's play a board game after dinner."
  - Prompt: An open board game with a winding path, two coloured pawns and a pair of dice. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 9 -- Predictions About Us

- **NEW** `assets/vocab/technology.png` -- *technology* (تقنية). Example: "New technology is changing how we learn."
  - Prompt: A laptop, a tablet and a small robot arm grouped together with glowing circuit lines. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/discover.png` -- *discover* (يكتشف). Example: "Scientists hope to discover a cure one day."
  - Prompt: A scientist's gloved hand holding up a glowing test tube with a big sparkle, a microscope beside it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 10 -- Rules at Home

- **NEW** `assets/vocab/privacy.png` -- *privacy* (خصوصية). Example: "Please knock first, I need some privacy."
  - Prompt: A closed bedroom door with a do-not-disturb hanger shaped like a sleeping moon (no text). Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 11 -- The Way We Talk

- **NEW** `assets/vocab/tone.png` -- *tone* (نبرة). Example: "Watch your tone when you speak to your teacher."
  - Prompt: Two speech bubbles: one with smooth calm wavy lines in blue, one with sharp spiky lines in red. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/body-language.png` -- *body language* (لغة الجسد). Example: "His body language showed he was nervous."
  - Prompt: A nervous teen boy standing with crossed arms, shoulders hunched and eyes looking down. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/eye-contact.png` -- *eye contact* (التواصل البصري). Example: "Making eye contact shows you're listening."
  - Prompt: Two teens facing each other, a dotted line connecting their eyes, one nodding while listening. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 12 -- Which Is Better?

- **NEW** `assets/vocab/affordable.png` -- *affordable* (بسعر معقول). Example: "This phone is affordable and works really well."
  - Prompt: A smartphone with a small friendly price tag and a green thumbs-up badge. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/durable.png` -- *durable* (متين). Example: "These shoes are durable enough for hiking."
  - Prompt: A pair of sturdy hiking boots standing on a rocky path with a shield badge beside them. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/efficient.png` -- *efficient* (فعّال). Example: "The new bus route is much more efficient."
  - Prompt: A bus driving along a straight green route line past a long tangled grey route line, a stopwatch above. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 13 -- Multitasking

- **NEW** `assets/vocab/distraction.png` -- *distraction* (إلهاء). Example: "My phone is a big distraction while I study."
  - Prompt: A teen at a desk with homework while a buzzing smartphone pulls their head sideways with alert lines. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/productive.png` -- *productive* (منتج). Example: "I feel more productive in the morning."
  - Prompt: A morning desk with a coffee mug, a checklist with every box ticked and a rising sun in the window. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/timer.png` -- *timer* (مؤقت). Example: "I set a timer for twenty minutes of reading."
  - Prompt: A round kitchen timer shaped like a tomato with its dial turned and small tick lines around it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 14 -- Next Year

- **NEW** `assets/vocab/milestone.png` -- *milestone* (إنجاز مرحلي). Example: "Finishing the marathon was a big milestone for him."
  - Prompt: A stone road marker with a gold flag on top beside a running path with a finish ribbon. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/progress.png` -- *progress* (تقدم). Example: "I can really see my progress in English now."
  - Prompt: A rising bar chart of five colourful bars with an arrow climbing over them and a small star at the top. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/motivation.png` -- *motivation* (دافع). Example: "Winning last week gave the team more motivation."
  - Prompt: A teen athlete looking up at a shining trophy on a high shelf, fist clenched with determination. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 15 -- Class Debate

- **NEW** `assets/vocab/statistic.png` -- *statistic* (إحصائية). Example: "Here's an interesting statistic about recycling."
  - Prompt: A pie chart and a bar chart side by side next to a recycling bin with the recycling arrows symbol. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/counterargument.png` -- *counterargument* (حجة مضادة). Example: "She had a strong counterargument ready."
  - Prompt: Two speech bubbles facing each other with arrows bouncing back between them, one bubble with a lightbulb. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/conclusion.png` -- *conclusion* (استنتاج). Example: "In conclusion, both sides made good points."
  - Prompt: A finished jigsaw puzzle with the last piece being placed, a small tick badge beside it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 16 -- Getting Ready

- **NEW** `assets/vocab/rehearsal.png` -- *rehearsal* (بروفة). Example: "We have one more rehearsal before the show."
  - Prompt: Teens on a small stage holding blank scripts and practising, an empty audience row in front. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/timeline.png` -- *timeline* (جدول زمني). Example: "Our project timeline is due next Friday."
  - Prompt: A horizontal arrow line with four coloured milestone dots and a small flag at the end. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/backup-plan.png` -- *backup plan* (خطة بديلة). Example: "We need a backup plan in case it rains."
  - Prompt: A picnic basket with an umbrella opened over it as rain clouds gather, a second plan arrow pointing to a cosy indoor tent. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 17 -- Doing It Right

- **NEW** `assets/vocab/instructions.png` -- *instructions* (تعليمات). Example: "Follow the instructions carefully."
  - Prompt: An open instruction booklet showing simple step diagrams of building a small wooden shelf, a screwdriver beside it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/step-by-step.png` -- *step by step* (خطوة بخطوة). Example: "She explained it step by step."
  - Prompt: A staircase of four colourful steps with a small figure climbing, each step with a tick mark. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/double-check.png` -- *double-check* (يتحقق مرتين). Example: "Always double-check your answers before submitting."
  - Prompt: A finger pointing at a worksheet line while a magnifying glass hovers above it, two green tick marks. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 18 -- Comparing Cultures

- **NEW** `assets/vocab/heritage.png` -- *heritage* (تراث). Example: "This festival celebrates our local heritage."
  - Prompt: A traditional Arab coffee pot (dallah) next to a woven palm basket and a carved wooden door. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/cuisine.png` -- *cuisine* (مطبخ). Example: "I love trying different countries' cuisine."
  - Prompt: A world-cuisine plate grouping: a bowl of noodles, a slice of pizza, a taco and a plate of kabsa rice. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/hospitality.png` -- *hospitality* (كرم الضيافة). Example: "We were amazed by their hospitality."
  - Prompt: A smiling host pouring Arabic coffee from a dallah into a small cup offered to a guest, dates on a plate. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

### Lesson 19 -- Reading Adventure: The School Trip

- **NEW** `assets/vocab/chaperone.png` -- *chaperone* (مرافق). Example: "A parent volunteered to chaperone the trip."
  - Prompt: An adult wearing a lanyard leading a short line of three school kids holding hands on a trip. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/itinerary.png` -- *itinerary* (خط سير الرحلة). Example: "Here is the full itinerary for the school trip."
  - Prompt: A folded trip map with a dotted route connecting three pins, a small bus and a clock beside it. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.
- **NEW** `assets/vocab/headcount.png` -- *headcount* (عدّ الأشخاص). Example: "The teacher did a headcount before we left."
  - Prompt: A teacher with a clipboard pointing at a group of four kids standing in a row, little tick marks above each child. Simple flat vector illustration for a children's English-learning app. Bright cheerful colors, thick clean black outlines, soft rounded shapes, one centered subject, ISOLATED ON A FULLY TRANSPARENT BACKGROUND (PNG cutout, no background color, no shadow plane, no scenery behind the subject), no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 6-9. If your tool cannot export true transparency, use a plain solid white background instead so it can be removed cleanly.

## Missing recordings (owner task)

Checked against `assets/audio/` with the audio slug rule (`js/app.js` `slugify`: lowercase, every non-alphanumeric run -> `-`, apostrophes NOT dropped). Every lesson vocab word and example sentence for Pre-A..Level 6 already has a recording. What is missing falls back to the browser voice, after a 404 request each time.

**Could not generate them here:** `pip install piper-tts` worked, but the Amy voice model (`en_US-amy-medium.onnx`, HuggingFace) is blocked by this environment's network proxy (403), and `_docs/generate-audio-piper.py` points at `/home/claude/lumio_voice/...` which does not exist here. A different voice would not match the existing recordings, so nothing was generated. To do it: on a machine with the model, add the lines below to `FIXED_PHRASES` in `_docs/generate-audio-piper.py` (or a small list file), set `PROJECT_ROOT`/`VOICE_MODEL`, run it, and commit the new `assets/audio/*.mp3`.

### Study buddies (student.html "Meet your study buddies" speaks the name)

- `assets/audio/lumi.mp3` -- "Lumi"
- `assets/audio/omar.mp3` -- "Omar"
- `assets/audio/sara.mp3` -- "Sara"
- `assets/audio/noor.mp3` -- "Noor"
- `assets/audio/ziad.mp3` -- "Ziad"
- `assets/audio/hamad.mp3` -- "Hamad"

### Game end lines (games/*.html)

These were spoken at the end of every game and never recorded (404 + browser voice every time). The games now say the existing `amazing.mp3` / `great-job.mp3` instead; record these and switch the line back if you want the full sentence.

- `games/balloon-pop.html` -- "Amazing! You are a balloon pop champion!" -> `assets/audio/amazing-you-are-a-balloon-pop-champion.mp3`
- `games/balloon-pop.html` -- "Great job! Try again to pop even more!" -> `assets/audio/great-job-try-again-to-pop-even-more.mp3`
- `games/crew-chat.html` -- "Amazing chatting! The crew loves you!" -> `assets/audio/amazing-chatting-the-crew-loves-you.mp3`
- `games/crew-chat.html` -- "Good chat! Come back and text again soon!" -> `assets/audio/good-chat-come-back-and-text-again-soon.mp3`
- `games/crystal-ball.html` -- "The crystal ball is glowing! Your future looks amazing!" -> `assets/audio/the-crystal-ball-is-glowing-your-future-looks-amazing.mp3`
- `games/crystal-ball.html` -- "Good vision! Come see the crystal ball again soon!" -> `assets/audio/good-vision-come-see-the-crystal-ball-again-soon.mp3`
- `games/fetch-with-lumi.html` -- "Wonderful! The puppy loved every fetch!" -> `assets/audio/wonderful-the-puppy-loved-every-fetch.mp3`
- `games/fetch-with-lumi.html` -- "Great job! Let's play again soon!" -> `assets/audio/great-job-let-s-play-again-soon.mp3`
- `games/lumis-pocket.html` -- "Wonderful! You found every picture!" -> `assets/audio/wonderful-you-found-every-picture.mp3`
- `games/lumis-pocket.html` -- "Great listening! Let's play again soon!" -> `assets/audio/great-listening-let-s-play-again-soon.mp3`
- `games/match-drag.html` -- "Amazing! You matched them all!" -> `assets/audio/amazing-you-matched-them-all.mp3`
- `games/squad-budget.html` -- "What a haul! Best squad shopping trip ever!" -> `assets/audio/what-a-haul-best-squad-shopping-trip-ever.mp3`
- `games/squad-budget.html` -- "Great shopping! Let's fill the list again soon!" -> `assets/audio/great-shopping-let-s-fill-the-list-again-soon.mp3`
- `games/story-detective.html` -- "Case closed! Great detective work!" -> `assets/audio/case-closed-great-detective-work.mp3`
- `games/story-detective.html` -- "Good clues! Let's crack the next case soon!" -> `assets/audio/good-clues-let-s-crack-the-next-case-soon.mp3`
- `games/treehouse-builder.html` -- "Amazing! The Treehouse Club is open!" -> `assets/audio/amazing-the-treehouse-club-is-open.mp3`
- `games/treehouse-builder.html` -- "Great building! Let's finish the treehouse again soon!" -> `assets/audio/great-building-let-s-finish-the-treehouse-again-soon.mp3`
- `games/twelve-months-calendar.html` -- "Wonderful! Another page in the Twelve Months Club book!" -> `assets/audio/wonderful-another-page-in-the-twelve-months-club-book.mp3`
- `games/twelve-months-calendar.html` -- "Great job! Let's fill more pages soon!" -> `assets/audio/great-job-let-s-fill-more-pages-soon.mp3`

`games/fetch-with-lumi.html` used to ask for "Fetch the <word>!" (one missing file per vocab word, every round); it now says the word itself, which is recorded for every lesson word. Optional: record "Fetch the <word>!" for the Pre-A vocab and switch it back.

### Idioms Hub (phrase + example, hub-present.html speaks both)

From `idioms-hub/<level>.json` (`phrase`, `example`). Levels 7-9 are not built yet and are left out.

**pre-a** (39)

- "A piece of cake" -> `a-piece-of-cake.mp3`
- "The test was a piece of cake!" -> `the-test-was-a-piece-of-cake.mp3`
- "It's raining cats and dogs" -> `it-s-raining-cats-and-dogs.mp3`
- "Take an umbrella — it's raining cats and dogs!" -> `take-an-umbrella-it-s-raining-cats-and-dogs.mp3`
- "Cool as a cucumber" -> `cool-as-a-cucumber.mp3`
- "She stayed cool as a cucumber." -> `she-stayed-cool-as-a-cucumber.mp3`
- "Butterflies in my stomach" -> `butterflies-in-my-stomach.mp3`
- "I have butterflies in my stomach before the show." -> `i-have-butterflies-in-my-stomach-before-the-show.mp3`
- "On top of the world" -> `on-top-of-the-world.mp3`
- "I feel on top of the world today!" -> `i-feel-on-top-of-the-world-today.mp3`
- "Sleep tight" -> `sleep-tight.mp3`
- "Good night, sleep tight!" -> `good-night-sleep-tight.mp3`
- "Busy as a bee" -> `busy-as-a-bee.mp3`
- "Mom is busy as a bee today." -> `mom-is-busy-as-a-bee-today.mp3`
- "Big fish" -> `big-fish.mp3`
- "He is a big fish at school." -> `he-is-a-big-fish-at-school.mp3`
- "Happy as a clam" -> `happy-as-a-clam.mp3`
- "She is happy as a clam with her new toy." -> `she-is-happy-as-a-clam-with-her-new-toy.mp3`
- "Quiet as a mouse" -> `quiet-as-a-mouse.mp3`
- "Be quiet as a mouse in the library." -> `be-quiet-as-a-mouse-in-the-library.mp3`
- "A bookworm" -> `a-bookworm.mp3`
- "My sister is a bookworm." -> `my-sister-is-a-bookworm.mp3`
- "Sweet tooth" -> `sweet-tooth.mp3`
- "I have a sweet tooth — I love cake!" -> `i-have-a-sweet-tooth-i-love-cake.mp3`
- "All ears" -> `all-ears.mp3`
- "Tell me your story — I'm all ears!" -> `tell-me-your-story-i-m-all-ears.mp3`
- "Give a hand" -> `give-a-hand.mp3`
- "Can you give me a hand, please?" -> `can-you-give-me-a-hand-please.mp3`
- "Hold your horses" -> `hold-your-horses.mp3`
- "Hold your horses, we're not ready yet!" -> `hold-your-horses-we-re-not-ready-yet.mp3`
- "I feel under the weather today." -> `i-feel-under-the-weather-today.mp3`
- "A copycat" -> `a-copycat.mp3`
- "Don't be a copycat!" -> `don-t-be-a-copycat.mp3`
- "Fingers crossed" -> `fingers-crossed.mp3`
- "Fingers crossed for the game!" -> `fingers-crossed-for-the-game.mp3`
- "Snug as a bug" -> `snug-as-a-bug.mp3`
- "In my blanket I'm snug as a bug." -> `in-my-blanket-i-m-snug-as-a-bug.mp3`
- "Easy peasy" -> `easy-peasy.mp3`
- "Tying my shoes is easy peasy!" -> `tying-my-shoes-is-easy-peasy.mp3`

**level1** (40)

- "Break a leg" -> `break-a-leg.mp3`
- "Break a leg in your play tonight!" -> `break-a-leg-in-your-play-tonight.mp3`
- "It's a small world" -> `it-s-a-small-world.mp3`
- "You know her too? It's a small world!" -> `you-know-her-too-it-s-a-small-world.mp3`
- "Let the cat out of the bag" -> `let-the-cat-out-of-the-bag.mp3`
- "He let the cat out of the bag about the party." -> `he-let-the-cat-out-of-the-bag-about-the-party.mp3`
- "Once in a blue moon" -> `once-in-a-blue-moon.mp3`
- "We eat out once in a blue moon." -> `we-eat-out-once-in-a-blue-moon.mp3`
- "Costs an arm and a leg" -> `costs-an-arm-and-a-leg.mp3`
- "That toy costs an arm and a leg!" -> `that-toy-costs-an-arm-and-a-leg.mp3`
- "Hit the sack" -> `hit-the-sack.mp3`
- "I'm tired, time to hit the sack." -> `i-m-tired-time-to-hit-the-sack.mp3`
- "Piece of my mind" -> `piece-of-my-mind.mp3`
- "I gave him a piece of my mind." -> `i-gave-him-a-piece-of-my-mind.mp3`
- "Feeling blue" -> `feeling-blue.mp3`
- "I'm feeling blue today." -> `i-m-feeling-blue-today.mp3`
- "A green thumb" -> `a-green-thumb.mp3`
- "Grandma has a green thumb." -> `grandma-has-a-green-thumb.mp3`
- "Catch some Z's" -> `catch-some-z-s.mp3`
- "I need to catch some Z's." -> `i-need-to-catch-some-z-s.mp3`
- "The early bird" -> `the-early-bird.mp3`
- "The early bird catches the worm!" -> `the-early-bird-catches-the-worm.mp3`
- "Two peas in a pod" -> `two-peas-in-a-pod.mp3`
- "The twins are two peas in a pod." -> `the-twins-are-two-peas-in-a-pod.mp3`
- "Blow off steam" -> `blow-off-steam.mp3`
- "I run to blow off steam." -> `i-run-to-blow-off-steam.mp3`
- "Down to earth" -> `down-to-earth.mp3`
- "She is very down to earth." -> `she-is-very-down-to-earth.mp3`
- "Keep an eye on" -> `keep-an-eye-on.mp3`
- "Keep an eye on your little brother." -> `keep-an-eye-on-your-little-brother.mp3`
- "A rainy day" -> `a-rainy-day.mp3`
- "Save money for a rainy day." -> `save-money-for-a-rainy-day.mp3`
- "Call it a day" -> `call-it-a-day.mp3`
- "Let's call it a day." -> `let-s-call-it-a-day.mp3`
- "In hot water" -> `in-hot-water.mp3`
- "He's in hot water with the teacher." -> `he-s-in-hot-water-with-the-teacher.mp3`
- "A bright idea" -> `a-bright-idea.mp3`
- "What a bright idea!" -> `what-a-bright-idea.mp3`
- "Head in the clouds" -> `head-in-the-clouds.mp3`
- "Stop having your head in the clouds!" -> `stop-having-your-head-in-the-clouds.mp3`

**level2** (40)

- "Better late than never" -> `better-late-than-never.mp3`
- "I finished my homework at bedtime — better late than never!" -> `i-finished-my-homework-at-bedtime-better-late-than-never.mp3`
- "Speak of the devil" -> `speak-of-the-devil.mp3`
- "Speak of the devil — here he is!" -> `speak-of-the-devil-here-he-is.mp3`
- "Curiosity killed the cat" -> `curiosity-killed-the-cat.mp3`
- "Don't open that box — curiosity killed the cat!" -> `don-t-open-that-box-curiosity-killed-the-cat.mp3`
- "Give the cold shoulder" -> `give-the-cold-shoulder.mp3`
- "She gave me the cold shoulder." -> `she-gave-me-the-cold-shoulder.mp3`
- "Hit the books" -> `hit-the-books.mp3`
- "Exams are near — time to hit the books." -> `exams-are-near-time-to-hit-the-books.mp3`
- "Practice makes perfect" -> `practice-makes-perfect.mp3`
- "Keep practicing your spelling — practice makes perfect!" -> `keep-practicing-your-spelling-practice-makes-perfect.mp3`
- "Pull someone's leg" -> `pull-someone-s-leg.mp3`
- "Relax, I'm just pulling your leg!" -> `relax-i-m-just-pulling-your-leg.mp3`
- "A blessing in disguise" -> `a-blessing-in-disguise.mp3`
- "Missing the bus was a blessing in disguise." -> `missing-the-bus-was-a-blessing-in-disguise.mp3`
- "It takes two to tango" -> `it-takes-two-to-tango.mp3`
- "They both made the mistake — it takes two to tango." -> `they-both-made-the-mistake-it-takes-two-to-tango.mp3`
- "On cloud nine" -> `on-cloud-nine.mp3`
- "She was on cloud nine after winning." -> `she-was-on-cloud-nine-after-winning.mp3`
- "Bite off more than you can chew" -> `bite-off-more-than-you-can-chew.mp3`
- "I bit off more than I could chew with three clubs." -> `i-bit-off-more-than-i-could-chew-with-three-clubs.mp3`
- "A piece of the pie" -> `a-piece-of-the-pie.mp3`
- "Everyone wants a piece of the pie." -> `everyone-wants-a-piece-of-the-pie.mp3`
- "The apple doesn't fall far from the tree" -> `the-apple-doesn-t-fall-far-from-the-tree.mp3`
- "She loves painting just like her mom — the apple doesn't fall far from the tree." -> `she-loves-painting-just-like-her-mom-the-apple-doesn-t-fall-far-from-the-tree.mp3`
- "Once in a lifetime" -> `once-in-a-lifetime.mp3`
- "This trip is a once-in-a-lifetime chance." -> `this-trip-is-a-once-in-a-lifetime-chance.mp3`
- "Keep your chin up" -> `keep-your-chin-up.mp3`
- "Keep your chin up — you'll pass next time." -> `keep-your-chin-up-you-ll-pass-next-time.mp3`
- "Actions speak louder than words" -> `actions-speak-louder-than-words.mp3`
- "He helps quietly — actions speak louder than words." -> `he-helps-quietly-actions-speak-louder-than-words.mp3`
- "The last straw" -> `the-last-straw.mp3`
- "That rude reply was the last straw." -> `that-rude-reply-was-the-last-straw.mp3`
- "Sit on the fence" -> `sit-on-the-fence.mp3`
- "Don't sit on the fence — choose one." -> `don-t-sit-on-the-fence-choose-one.mp3`
- "Get out of hand" -> `get-out-of-hand.mp3`
- "The game got out of hand." -> `the-game-got-out-of-hand.mp3`
- "A wake-up call" -> `a-wake-up-call.mp3`
- "The low grade was a wake-up call." -> `the-low-grade-was-a-wake-up-call.mp3`

**level3** (38)

- "He told a joke to break the ice." -> `he-told-a-joke-to-break-the-ice.mp3`
- "Let's make sure we're on the same page." -> `let-s-make-sure-we-re-on-the-same-page.mp3`
- "Spill the beans" -> `spill-the-beans.mp3`
- "Come on, spill the beans!" -> `come-on-spill-the-beans.mp3`
- "Hit it off" -> `hit-it-off.mp3`
- "We hit it off right away." -> `we-hit-it-off-right-away.mp3`
- "Ring a bell" -> `ring-a-bell.mp3`
- "That name rings a bell." -> `that-name-rings-a-bell.mp3`
- "Cut corners" -> `cut-corners.mp3`
- "Don't cut corners on safety." -> `don-t-cut-corners-on-safety.mp3`
- "Don't judge a book by its cover" -> `don-t-judge-a-book-by-its-cover.mp3`
- "He seemed shy at first, but don't judge a book by its cover — he's very funny." -> `he-seemed-shy-at-first-but-don-t-judge-a-book-by-its-cover-he-s-very-funny.mp3`
- "Get the ball rolling" -> `get-the-ball-rolling.mp3`
- "Let's get the ball rolling on the project." -> `let-s-get-the-ball-rolling-on-the-project.mp3`
- "Let sleeping dogs lie" -> `let-sleeping-dogs-lie.mp3`
- "They stopped arguing, so let sleeping dogs lie." -> `they-stopped-arguing-so-let-sleeping-dogs-lie.mp3`
- "Miss the boat" -> `miss-the-boat.mp3`
- "Sign up now or miss the boat." -> `sign-up-now-or-miss-the-boat.mp3`
- "Face the music" -> `face-the-music.mp3`
- "He broke it, now he must face the music." -> `he-broke-it-now-he-must-face-the-music.mp3`
- "In the same boat" -> `in-the-same-boat.mp3`
- "We're all in the same boat." -> `we-re-all-in-the-same-boat.mp3`
- "Jump to conclusions" -> `jump-to-conclusions.mp3`
- "Don't jump to conclusions." -> `don-t-jump-to-conclusions.mp3`
- "Keep your cool" -> `keep-your-cool.mp3`
- "Keep your cool during the debate." -> `keep-your-cool-during-the-debate.mp3`
- "Off the top of my head" -> `off-the-top-of-my-head.mp3`
- "Off the top of my head, I'd say fifty." -> `off-the-top-of-my-head-i-d-say-fifty.mp3`
- "Go the extra mile" -> `go-the-extra-mile.mp3`
- "She always goes the extra mile." -> `she-always-goes-the-extra-mile.mp3`
- "Play it by ear" -> `play-it-by-ear.mp3`
- "We'll play it by ear tomorrow." -> `we-ll-play-it-by-ear-tomorrow.mp3`
- "A close call" -> `a-close-call.mp3`
- "That was a close call!" -> `that-was-a-close-call.mp3`
- "Back to square one" -> `back-to-square-one.mp3`
- "The plan failed — back to square one." -> `the-plan-failed-back-to-square-one.mp3`
- "Bend over backwards" -> `bend-over-backwards.mp3`
- "They bent over backwards for us." -> `they-bent-over-backwards-for-us.mp3`

**level4** (40)

- "Time flies" -> `time-flies.mp3`
- "Time flies when you're having fun." -> `time-flies-when-you-re-having-fun.mp3`
- "Save for a rainy day" -> `save-for-a-rainy-day.mp3`
- "I save for a rainy day each month." -> `i-save-for-a-rainy-day-each-month.mp3`
- "Bite the bullet" -> `bite-the-bullet.mp3`
- "I bit the bullet and apologized." -> `i-bit-the-bullet-and-apologized.mp3`
- "A change of heart" -> `a-change-of-heart.mp3`
- "She had a change of heart and stayed." -> `she-had-a-change-of-heart-and-stayed.mp3`
- "Cross that bridge when we come to it" -> `cross-that-bridge-when-we-come-to-it.mp3`
- "We'll cross that bridge when we come to it." -> `we-ll-cross-that-bridge-when-we-come-to-it.mp3`
- "Burn the midnight oil" -> `burn-the-midnight-oil.mp3`
- "I burned the midnight oil before the exam." -> `i-burned-the-midnight-oil-before-the-exam.mp3`
- "Take it with a grain of salt" -> `take-it-with-a-grain-of-salt.mp3`
- "Take that rumor with a grain of salt." -> `take-that-rumor-with-a-grain-of-salt.mp3`
- "Pull yourself together" -> `pull-yourself-together.mp3`
- "Pull yourself together and try again." -> `pull-yourself-together-and-try-again.mp3`
- "On thin ice" -> `on-thin-ice.mp3`
- "You're on thin ice after being late." -> `you-re-on-thin-ice-after-being-late.mp3`
- "A ballpark figure" -> `a-ballpark-figure.mp3`
- "Give me a ballpark figure for the cost." -> `give-me-a-ballpark-figure-for-the-cost.mp3`
- "Cut to the chase" -> `cut-to-the-chase.mp3`
- "Let's cut to the chase." -> `let-s-cut-to-the-chase.mp3`
- "Get cold feet" -> `get-cold-feet.mp3`
- "He got cold feet before the speech." -> `he-got-cold-feet-before-the-speech.mp3`
- "Hit the nail on the head" -> `hit-the-nail-on-the-head.mp3`
- "You hit the nail on the head." -> `you-hit-the-nail-on-the-head.mp3`
- "Keep your options open" -> `keep-your-options-open.mp3`
- "Keep your options open for now." -> `keep-your-options-open-for-now.mp3`
- "A double-edged sword" -> `a-double-edged-sword.mp3`
- "Fame is a double-edged sword." -> `fame-is-a-double-edged-sword.mp3`
- "Learn the ropes" -> `learn-the-ropes.mp3`
- "It takes time to learn the ropes." -> `it-takes-time-to-learn-the-ropes.mp3`
- "Think on your feet" -> `think-on-your-feet.mp3`
- "When the plan changed suddenly, she had to think on her feet." -> `when-the-plan-changed-suddenly-she-had-to-think-on-her-feet.mp3`
- "Weather the storm" -> `weather-the-storm.mp3`
- "The family weathered the storm together." -> `the-family-weathered-the-storm-together.mp3`
- "Put your foot down" -> `put-your-foot-down.mp3`
- "She put her foot down about screen time." -> `she-put-her-foot-down-about-screen-time.mp3`
- "A silver lining" -> `a-silver-lining.mp3`
- "Every cloud has a silver lining." -> `every-cloud-has-a-silver-lining.mp3`

**level5** (40)

- "Long story short" -> `long-story-short.mp3`
- "Long story short, we made it." -> `long-story-short-we-made-it.mp3`
- "Blast from the past" -> `blast-from-the-past.mp3`
- "This song is a blast from the past." -> `this-song-is-a-blast-from-the-past.mp3`
- "Turn over a new leaf" -> `turn-over-a-new-leaf.mp3`
- "He turned over a new leaf this year." -> `he-turned-over-a-new-leaf-this-year.mp3`
- "Catch someone off guard" -> `catch-someone-off-guard.mp3`
- "The question caught me off guard." -> `the-question-caught-me-off-guard.mp3`
- "Water under the bridge" -> `water-under-the-bridge.mp3`
- "That argument is water under the bridge." -> `that-argument-is-water-under-the-bridge.mp3`
- "Bury the hatchet" -> `bury-the-hatchet.mp3`
- "They finally buried the hatchet." -> `they-finally-buried-the-hatchet.mp3`
- "The tip of the iceberg" -> `the-tip-of-the-iceberg.mp3`
- "This issue is just the tip of the iceberg." -> `this-issue-is-just-the-tip-of-the-iceberg.mp3`
- "In the heat of the moment" -> `in-the-heat-of-the-moment.mp3`
- "I said it in the heat of the moment." -> `i-said-it-in-the-heat-of-the-moment.mp3`
- "Come full circle" -> `come-full-circle.mp3`
- "My journey came full circle." -> `my-journey-came-full-circle.mp3`
- "A leap of faith" -> `a-leap-of-faith.mp3`
- "Starting over was a leap of faith." -> `starting-over-was-a-leap-of-faith.mp3`
- "Add fuel to the fire" -> `add-fuel-to-the-fire.mp3`
- "Shouting only added fuel to the fire." -> `shouting-only-added-fuel-to-the-fire.mp3`
- "Bite your tongue" -> `bite-your-tongue.mp3`
- "I had to bite my tongue." -> `i-had-to-bite-my-tongue.mp3`
- "A shot in the dark" -> `a-shot-in-the-dark.mp3`
- "My answer was a shot in the dark." -> `my-answer-was-a-shot-in-the-dark.mp3`
- "Cross your mind" -> `cross-your-mind.mp3`
- "Did it ever cross your mind to ask?" -> `did-it-ever-cross-your-mind-to-ask.mp3`
- "Draw the line" -> `draw-the-line.mp3`
- "You must draw the line somewhere." -> `you-must-draw-the-line-somewhere.mp3`
- "Make ends meet" -> `make-ends-meet.mp3`
- "They work hard to make ends meet." -> `they-work-hard-to-make-ends-meet.mp3`
- "Second nature" -> `second-nature.mp3`
- "Reading is second nature to her." -> `reading-is-second-nature-to-her.mp3`
- "Take the plunge" -> `take-the-plunge.mp3`
- "We took the plunge and moved." -> `we-took-the-plunge-and-moved.mp3`
- "The best of both worlds" -> `the-best-of-both-worlds.mp3`
- "This job gives the best of both worlds." -> `this-job-gives-the-best-of-both-worlds.mp3`
- "Rise to the occasion" -> `rise-to-the-occasion.mp3`
- "She rose to the occasion and led." -> `she-rose-to-the-occasion-and-led.mp3`

**level6** (40)

- "Time will tell" -> `time-will-tell.mp3`
- "Will it work? Time will tell." -> `will-it-work-time-will-tell.mp3`
- "The best is yet to come" -> `the-best-is-yet-to-come.mp3`
- "Don't worry — the best is yet to come." -> `don-t-worry-the-best-is-yet-to-come.mp3`
- "Jump on the bandwagon" -> `jump-on-the-bandwagon.mp3`
- "Everyone jumped on the bandwagon." -> `everyone-jumped-on-the-bandwagon.mp3`
- "Read between the lines" -> `read-between-the-lines.mp3`
- "Read between the lines of the offer." -> `read-between-the-lines-of-the-offer.mp3`
- "Think outside the box" -> `think-outside-the-box.mp3`
- "Great leaders think outside the box." -> `great-leaders-think-outside-the-box.mp3`
- "The ball is in your court" -> `the-ball-is-in-your-court.mp3`
- "I've offered help — the ball is in your court." -> `i-ve-offered-help-the-ball-is-in-your-court.mp3`
- "Get your act together" -> `get-your-act-together.mp3`
- "Get your act together before finals." -> `get-your-act-together-before-finals.mp3`
- "A stepping stone" -> `a-stepping-stone.mp3`
- "This job is a stepping stone to my goal." -> `this-job-is-a-stepping-stone-to-my-goal.mp3`
- "Set the bar high" -> `set-the-bar-high.mp3`
- "Her work sets the bar high." -> `her-work-sets-the-bar-high.mp3`
- "Keep your eyes on the prize" -> `keep-your-eyes-on-the-prize.mp3`
- "Keep your eyes on the prize." -> `keep-your-eyes-on-the-prize.mp3`
- "A game changer" -> `a-game-changer.mp3`
- "This idea is a game changer." -> `this-idea-is-a-game-changer.mp3`
- "Take it to the next level" -> `take-it-to-the-next-level.mp3`
- "Let's take our project to the next level." -> `let-s-take-our-project-to-the-next-level.mp3`
- "On the right track" -> `on-the-right-track.mp3`
- "Your grades show you're on the right track." -> `your-grades-show-you-re-on-the-right-track.mp3`
- "Break new ground" -> `break-new-ground.mp3`
- "Their research breaks new ground." -> `their-research-breaks-new-ground.mp3`
- "Against all odds" -> `against-all-odds.mp3`
- "She succeeded against all odds." -> `she-succeeded-against-all-odds.mp3`
- "A blessing and a curse" -> `a-blessing-and-a-curse.mp3`
- "Talent can be a blessing and a curse." -> `talent-can-be-a-blessing-and-a-curse.mp3`
- "Turn the tide" -> `turn-the-tide.mp3`
- "One goal turned the tide." -> `one-goal-turned-the-tide.mp3`
- "Uncharted territory" -> `uncharted-territory.mp3`
- "We're in uncharted territory now." -> `we-re-in-uncharted-territory-now.mp3`
- "Pave the way" -> `pave-the-way.mp3`
- "Her success paved the way for others." -> `her-success-paved-the-way-for-others.mp3`
- "The sky's the limit" -> `the-sky-s-the-limit.mp3`
- "Work hard — the sky's the limit!" -> `work-hard-the-sky-s-the-limit.mp3`

### Writing Hub prompts (the "Listen" button on each prompt)

From `writing-hub/<level>.json` (`prompts[].en`).

**pre-a** (5)

- "What is your favorite animal?" -> `what-is-your-favorite-animal.mp3`
- "How many fingers do you have? Count them!" -> `how-many-fingers-do-you-have-count-them.mp3`
- "Who is in your family?" -> `who-is-in-your-family.mp3`
- "What is your favorite toy?" -> `what-is-your-favorite-toy.mp3`
- "How do you feel today? Happy, sad, or excited?" -> `how-do-you-feel-today-happy-sad-or-excited.mp3`

**level1** (7)

- "Describe your house. What rooms does it have?" -> `describe-your-house-what-rooms-does-it-have.mp3`
- "What is the weather like today?" -> `what-is-the-weather-like-today.mp3`
- "What can you do well? Use "I can..."" -> `what-can-you-do-well-use-i-can.mp3`
- "Tell me about a pet you have or would like to have." -> `tell-me-about-a-pet-you-have-or-would-like-to-have.mp3`
- "What do you like to do at the park?" -> `what-do-you-like-to-do-at-the-park.mp3`
- "What is your favorite shape? Why do you like it?" -> `what-is-your-favorite-shape-why-do-you-like-it.mp3`
- "Name two things that are opposites, like big and small." -> `name-two-things-that-are-opposites-like-big-and-small.mp3`

**level2** (8)

- "Introduce yourself: what is your name and how old are you?" -> `introduce-yourself-what-is-your-name-and-how-old-are-you.mp3`
- "Describe your family tree. Who is in your family?" -> `describe-your-family-tree-who-is-in-your-family.mp3`
- "What do you do in your classroom every day?" -> `what-do-you-do-in-your-classroom-every-day.mp3`
- "What is your favorite month of the year? Why?" -> `what-is-your-favorite-month-of-the-year-why.mp3`
- "Describe your last birthday party." -> `describe-your-last-birthday-party.mp3`
- "Describe your morning routine, step by step." -> `describe-your-morning-routine-step-by-step.mp3`
- "Describe your evening routine, step by step." -> `describe-your-evening-routine-step-by-step.mp3`
- "What food do you eat every day? Do you like it?" -> `what-food-do-you-eat-every-day-do-you-like-it.mp3`

**level3** (12)

- "Describe your room. What's in it, and what does it say about you?" -> `describe-your-room-what-s-in-it-and-what-does-it-say-about-you.mp3`
- "Write about your crew — who are they, and what do you do together?" -> `write-about-your-crew-who-are-they-and-what-do-you-do-together.mp3`
- "Describe a friend using at least 3 sentences." -> `describe-a-friend-using-at-least-3-sentences.mp3`
- "What's your favorite skill or sport, and why do you enjoy it?" -> `what-s-your-favorite-skill-or-sport-and-why-do-you-enjoy-it.mp3`
- "Write directions from your classroom to the school library." -> `write-directions-from-your-classroom-to-the-school-library.mp3`
- "Compare yourself to a friend — who's faster, taller, or funnier?" -> `compare-yourself-to-a-friend-who-s-faster-taller-or-funnier.mp3`
- "Write 3 classroom rules you think are important, and why." -> `write-3-classroom-rules-you-think-are-important-and-why.mp3`
- "Describe what you and your friends are doing right now." -> `describe-what-you-and-your-friends-are-doing-right-now.mp3`
- "Write about your favorite game night or movie night." -> `write-about-your-favorite-game-night-or-movie-night.mp3`
- "Share an opinion about something at school, and explain why." -> `share-an-opinion-about-something-at-school-and-explain-why.mp3`
- "Describe a new student joining your class. What would you ask them?" -> `describe-a-new-student-joining-your-class-what-would-you-ask-them.mp3`
- "Write about a big match or competition you watched or played in — what happened?" -> `write-about-a-big-match-or-competition-you-watched-or-played-in-what-happened.mp3`

**level4** (13)

- "Describe your daily routine from morning to night." -> `describe-your-daily-routine-from-morning-to-night.mp3`
- "How often do you do your favorite hobby? Write 3 sentences." -> `how-often-do-you-do-your-favorite-hobby-write-3-sentences.mp3`
- "Write a short message to a friend making weekend plans." -> `write-a-short-message-to-a-friend-making-weekend-plans.mp3`
- "Describe something that belongs to you and why it matters to you." -> `describe-something-that-belongs-to-you-and-why-it-matters-to-you.mp3`
- "Write about how you save or spend your money." -> `write-about-how-you-save-or-spend-your-money.mp3`
- "Describe the most talented person you know." -> `describe-the-most-talented-person-you-know.mp3`
- "Write a polite request for something you'd like to order or receive." -> `write-a-polite-request-for-something-you-d-like-to-order-or-receive.mp3`
- "Give a friend 3 pieces of advice using should/shouldn't." -> `give-a-friend-3-pieces-of-advice-using-should-shouldn-t.mp3`
- "Describe your future goal and how you plan to achieve it." -> `describe-your-future-goal-and-how-you-plan-to-achieve-it.mp3`
- "Write about a culture or country you would like to explore." -> `write-about-a-culture-or-country-you-would-like-to-explore.mp3`
- "Describe a difficult decision you had to make and how you decided." -> `describe-a-difficult-decision-you-had-to-make-and-how-you-decided.mp3`
- "Write about how you work well as a team with your friends or classmates." -> `write-about-how-you-work-well-as-a-team-with-your-friends-or-classmates.mp3`
- "Describe a time you felt under pressure. How did you handle it?" -> `describe-a-time-you-felt-under-pressure-how-did-you-handle-it.mp3`

**level5** (12)

- "Describe an adventure you had yesterday or recently." -> `describe-an-adventure-you-had-yesterday-or-recently.mp3`
- "Did you do anything exciting last month? Describe it." -> `did-you-do-anything-exciting-last-month-describe-it.mp3`
- "How was your last vacation or trip?" -> `how-was-your-last-vacation-or-trip.mp3`
- "Think back to when you were younger. What is one memory you have?" -> `think-back-to-when-you-were-younger-what-is-one-memory-you-have.mp3`
- "Tell a story: first this happened, then that happened..." -> `tell-a-story-first-this-happened-then-that-happened.mp3`
- "Describe a time you were late for something. Why were you late?" -> `describe-a-time-you-were-late-for-something-why-were-you-late.mp3`
- "Describe a time you felt proud of yourself. How did it happen?" -> `describe-a-time-you-felt-proud-of-yourself-how-did-it-happen.mp3`
- "What were you doing at 8pm last night? Describe the moment." -> `what-were-you-doing-at-8pm-last-night-describe-the-moment.mp3`
- "Tell about a test or exam you studied hard for." -> `tell-about-a-test-or-exam-you-studied-hard-for.mp3`
- "Write about a time something went wrong. What happened, and how did you fix it?" -> `write-about-a-time-something-went-wrong-what-happened-and-how-did-you-fix-it.mp3`
- "Describe your favorite party or celebration you attended." -> `describe-your-favorite-party-or-celebration-you-attended.mp3`
- "Write about the most unforgettable day of your life so far." -> `write-about-the-most-unforgettable-day-of-your-life-so-far.mp3`

**level6** (14)

- "What are your plans for this weekend?" -> `what-are-your-plans-for-this-weekend.mp3`
- "What do you predict will happen in your life next year?" -> `what-do-you-predict-will-happen-in-your-life-next-year.mp3`
- "Describe something that happened while you were doing something else." -> `describe-something-that-happened-while-you-were-doing-something-else.mp3`
- "What rules do you have to follow at home? Are they fair?" -> `what-rules-do-you-have-to-follow-at-home-are-they-fair.mp3`
- "Compare two of your hobbies. Which one is better, and why?" -> `compare-two-of-your-hobbies-which-one-is-better-and-why.mp3`
- "Describe something you do while multitasking (doing two things at once)." -> `describe-something-you-do-while-multitasking-doing-two-things-at-once.mp3`
- "What do you think your life will be like in five years?" -> `what-do-you-think-your-life-will-be-like-in-five-years.mp3`
- "What household rule would you change if you could? Why?" -> `what-household-rule-would-you-change-if-you-could-why.mp3`
- "Explain how you do something well, step by step, to someone who doesn't know how." -> `explain-how-you-do-something-well-step-by-step-to-someone-who-doesn-t-know-how.mp3`
- "Do you agree or disagree that phones should be allowed at school? Explain your opinion." -> `do-you-agree-or-disagree-that-phones-should-be-allowed-at-school-explain-your-opinion.mp3`
- "Describe a tradition from your culture that you are proud of." -> `describe-a-tradition-from-your-culture-that-you-are-proud-of.mp3`
- "Compare two countries or cultures you know about." -> `compare-two-countries-or-cultures-you-know-about.mp3`
- "What is one thing you have to do this week that you don't want to do?" -> `what-is-one-thing-you-have-to-do-this-week-that-you-don-t-want-to-do.mp3`
- "Describe your plan for your future — what do you want to achieve?" -> `describe-your-plan-for-your-future-what-do-you-want-to-achieve.mp3`

### Grammar Hub examples (tap to hear)

From `grammar-hub/<level>.json` (`topics[].examples[].en`).

None missing.

### Phonics Hub words + stories

From `phonics-hub/<level>.json` (`units[].words[].en`, `units[].story.en`).

**level1** (9)

- "a" -> `a.mp3`
- "The sun is up. A cat sat on a mat. An ant ran to the top. Pat the cat, pat the ant!" -> `the-sun-is-up-a-cat-sat-on-a-mat-an-ant-ran-to-the-top-pat-the-cat-pat-the-ant.mp3`
- "Dad has a map. Dad has a net and some ink. Sam and Dad sit and nap. Dad naps on a mat." -> `dad-has-a-map-dad-has-a-net-and-some-ink-sam-and-dad-sit-and-nap-dad-naps-on-a-mat.mp3`
- "Cat got a kite. An ox got some gum. Cat and ox sit on a log. Cat got the kite up, up, up!" -> `cat-got-a-kite-an-ox-got-some-gum-cat-and-ox-sit-on-a-log-cat-got-the-kite-up-up-up.mp3`
- "A duck ran up a hill. The duck got an egg. Run, duck, run! The duck sat on the egg." -> `a-duck-ran-up-a-hill-the-duck-got-an-egg-run-duck-run-the-duck-sat-on-the-egg.mp3`
- "Dad has a big hat. Dad has a fan on his bed. Dad hurt his leg. Dad naps in his bed with his hat on." -> `dad-has-a-big-hat-dad-has-a-fan-on-his-bed-dad-hurt-his-leg-dad-naps-in-his-bed-with-his-hat-on.mp3`
- "The cat and the dog run in the sun. The dog got a pin. The cat and the dog sit in the sun." -> `the-cat-and-the-dog-run-in-the-sun-the-dog-got-a-pin-the-cat-and-the-dog-sit-in-the-sun.mp3`
- "I go to the sun. I have a cat. The cat and I go to the mat. I go, the cat goes too!" -> `i-go-to-the-sun-i-have-a-cat-the-cat-and-i-go-to-the-mat-i-go-the-cat-goes-too.mp3`
- "The dog has a hat. The cat can run. The sun is up! The dog and the cat run and run. Leg up, leg down!" -> `the-dog-has-a-hat-the-cat-can-run-the-sun-is-up-the-dog-and-the-cat-run-and-run-leg-up-leg-down.mp3`

**level2** (9)

- "Dad has a van. We go to the zoo! Yes, yes, we see a big web. We see a fox in a box. We eat jam at the zoo." -> `dad-has-a-van-we-go-to-the-zoo-yes-yes-we-see-a-big-web-we-see-a-fox-in-a-box-we-eat-jam-at-the-zoo.mp3`
- "Sam sat on a chair. Sam had a chip. Sam saw a ship and a fish. The fish swam past the ship." -> `sam-sat-on-a-chair-sam-had-a-chip-sam-saw-a-ship-and-a-fish-the-fish-swam-past-the-ship.mp3`
- "This king is thin. The king has a gold ring. The king sings this song. This ring is for the king." -> `this-king-is-thin-the-king-has-a-gold-ring-the-king-sings-this-song-this-ring-is-for-the-king.mp3`
- "We clap and clap! We see a black flag. We go on the slide. We eat a plum on the slide. Clap for the black flag!" -> `we-clap-and-clap-we-see-a-black-flag-we-go-on-the-slide-we-eat-a-plum-on-the-slide-clap-for-the-black-flag.mp3`
- "A frog sits in the grass. A crab plays a drum near a tree. We brush the grass. The frog and the crab play by the tree." -> `a-frog-sits-in-the-grass-a-crab-plays-a-drum-near-a-tree-we-brush-the-grass-the-frog-and-the-crab-play-by-the-tree.mp3`
- "We swim and skip! We see a star and a snail. Smile and spin! The snail and the star make us smile." -> `we-swim-and-skip-we-see-a-star-and-a-snail-smile-and-spin-the-snail-and-the-star-make-us-smile.mp3`
- "We see rain by the tree. We sail a boat in the rain. The tree and the boat are wet in the rain." -> `we-see-rain-by-the-tree-we-sail-a-boat-in-the-rain-the-tree-and-the-boat-are-wet-in-the-rain.mp3`
- "He and she are here. We are all here too! They were here, and you are here. All of us are here together." -> `he-and-she-are-here-we-are-all-here-too-they-were-here-and-you-are-here-all-of-us-are-here-together.mp3`
- "The king sees a fish and a frog by the tree. A black star is in the sky. The fish, the frog, and the king all look at the black star." -> `the-king-sees-a-fish-and-a-frog-by-the-tree-a-black-star-is-in-the-sky-the-fish-the-frog-and-the-king-all-look-at-the-black-star.mp3`

