# Materials brief — slides, homework missions and printables for every Bonus Class (12 Oct 2026)

The owner approved the sample: Level 1 Bonus Class 1 (`bonus-classes/level1/bonus01.json`, keys `deck`,
`homeworkMissions`, `printables`). Build the same three blocks for your classes, from the reviewed plan content.
Study the sample first, then the engines:
- Slides: `lib/bonus_deck.py` (read it fully: the BUILDERS and every field each slide type reads). Output via
  `python3 gen_bonus_slides.py <level> <N>` -> `slide-content-v5/<level>/bonus-NN/`. Cover, goals, exit ticket and
  homework slides are added automatically from the plan; do not author them.
- Homework: `js/bonus-homework.js` (mission types: listen-choose, build, sort, true-false, record, mission).
- Printables: `gen_bonus_printables.py` (worksheet section types: draw, picture-gap, odd-one-out, sort-table,
  write-lines, match, sign; cards: {big|image, head, sub, ar, color}).

## Slide list ("deck")
- Follow the class's stages in order; every stage gets at least one slide; a slide's "ribbon" is
  "Section · short title" where Section starts with a word that picks the right chapter card in js/slide-motion.js:
  Warm-up / Sound lab / Grammar lab / Word lab / Arabic bridge / Practice / Listen / Your turn / Game / Quiz /
  Did you know / Story / Talk. Keep ribbons short (max ~34 characters in total).
- Students SEE the slides: put student-facing content on them (examples, questions, tasks), never the teacher script.
  Every exercise in the plan with answers should appear as an interactive slide (listen / reveal / sort / swap)
  with the same answers. 14-28 authored slides per class (Pre-A: 12-20, it is a 45-minute class).
- Text limits so nothing overflows the 1467x825 canvas: concept text <= 160 chars, bullets <= 5 x 70 chars,
  cards 2-4 with sub <= 70 chars, reveal items prompt <= 60 chars / answer <= 40 chars (max 8 per slide; use
  perSlide), chant lines <= 6 x 55 chars, compare tables <= 5 rows x 3 cols, cells <= 45 chars, ladder <= 5 steps.
  Arabic lines <= 110 chars.
- "say" values: plain text is spoken by the voice; "/x/" plays the recorded phonics sound
  (assets/audio/phonics-sound-<x>.mp3: a b bl br c ch ck cl cr d dr e ee f fl fr g gr h i j k l m n ng o oa p pl q r
  s sh sk sl sm sn sp st sw t th tr u v w x y z ai). Only use those.
- Hosts (character art, optional "host" field): kids levels use lumi-point, lumi-teach-board, lumi-megaphone,
  lumi-surprised, lumi-celebrate, lumi-magnify, lumi-read, lumi-books, lumi-pencil, sara-explain, sara-point,
  noor-point, noor-read, omar-point, omar-think, hamad-explain, hamad-point, ziad-explain, ziad-point (no -teen).
  Teen levels (3-6) use the -teen poses: lumi-teen-explain, lumi-teen-point, lumi-teen-think, lumi-teen-read,
  sara-teen-explain, noor-teen-point, omar-teen-think, hamad-teen-explain, ziad-teen-... (check the file exists in
  assets/story/characters/). Do not use a host on slides with wide content (tables, 4 cards, reveals).
- Respect the owner rules in BRIEF.md (American English, General American IPA, Quran rule). Never put a Quran verse on
  a slide.

## Homework missions ("homeworkMissions")
- "Really different" from lesson homework: a mission board of 5-6 missions themed on the class (theme, badge in EN+AR).
- At least 3 auto-marked missions (listen-choose / build / sort / true-false) with correct, unambiguous answers, plus
  one "record" mission (things to say aloud) and one real-world "mission" (teach someone at home, find examples at home,
  interview a family member...). Every string EN + AR. Teen levels: harder items, real-life tasks.
- Build rounds use "frame" with exactly one "_" and options that each give a real word only for the right answer.

## Printables ("printables")
- worksheet: 4-6 sections that fit on 1-2 A4 pages, practising the class content; last section "sign" for Pre-A to
  Level 2 (parent sign-off); teens may end with write-lines.
- cards: 6-12 cut-out cards the class actually uses (the characters/symbols/terms of the class, or picture cards).
- Pictures: only use "image" names that exist as assets/vocab/<name>.png (check!). If the activity really needs a
  picture that does not exist, still write the item without "image" and list the picture in
  `_docs/bonus-review/images-needed.md` (append a row: level | class | file name | what it shows) - the owner will
  generate them.

## When done
- Run: python3 gen_bonus_plans.py --check ; python3 gen_bonus_slides.py <level> ;
  LUMIO_CHROMIUM=/opt/pw-browsers/chromium python3 gen_bonus_printables.py <level>
- Write JSON with json.dump(d, f, ensure_ascii=False, indent=2) + "\n". Only touch your level's bonus-classes files,
  their generated outputs and the images-needed list. Do not commit.
