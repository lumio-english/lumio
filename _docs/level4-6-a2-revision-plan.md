# Levels 4-6 (A2) Revision Campaign — Plan

Goal: from Level 4 through Level 6 (A2 — past the foundational phase, into practice and real interaction), every lesson should feel rich: substantial vocabulary, real-life phrases and situations tied to the topic, and grammar practice, with more conversational moments (Crew Talk) than before.

## Where things stood

Checking Level 4's actual lesson data before touching anything: the vocabulary side was already strong — 9-11 words per lesson, each with its own real example sentence, already close to what "rich vocabulary" calls for. What was thin, or actually broken, was everything *around* the vocabulary:

- Only **one Crew Talk** (a 6-line character conversation) per lesson, always in the same spot near the start.
- **No dedicated moment for real-life phrases/idioms** — a student could learn "save," "spend," "budget" as isolated words but never hear "That's a rip-off!" or "It's on sale!" the way people actually talk.
- The **"Notice the Pattern" slide was broken on review lessons** (Lessons 15-19 in most levels): it showed one stray sentence borrowed from an unrelated lesson and the instruction read "Tap every sentence that uses ." — a blank pattern name. That's roughly a quarter of every level's lessons.
- 38 of Level 4's own vocabulary words never had an image made for them.
- A leftover pig ("piggy bank") in the Saving Up lesson.
- The "Today I Learned" recap slide (main lessons *and* trial classes) only showed a subset of what was taught, in every level.

## What's done (Level 4, this pass)

1. **"Notice the Pattern" fixed everywhere** (Levels 3-6, not just Level 4) — review lessons now pull real sentences from their own vocabulary instead of one borrowed line, and the pattern name is never blank. 26 lessons affected across the four levels.
2. **"Today I Learned" / Recap rebuilt** (all levels, including every trial class) — lists every word, every sentence, every grammar example and dialogue line taught, paginated across as many slides as needed instead of silently dropping content past the first 6 words.
3. **Pig removed** from Level 4 Lesson 9 — "piggy bank" renamed to "moneybox" throughout (lesson data, dialogue, worksheets, flashcards, hub); new art prompts sent separately.
4. **Second Crew Talk added** to Lessons 1-19 (`lib/crew_talk_level4.py: CREW_TALK_2`) — a shorter, later conversation using more of the lesson's vocabulary in a fresh situation, not a repeat of the opening scene.
5. **New "Phrase Focus" slide type added** (`lib/deck_template_teen2.py: slide_phrase_focus`) — 3 real, commonly-used phrases per lesson tied to its topic (e.g. Lesson 9/Saving Up: "I'm saving up for...", "Money doesn't grow on trees.", "That's a bargain!"), each with a plain-English gloss and Arabic, for the teacher to pause on. This is deliberately separate from "Notice the Pattern," which stays focused on grammar.
6. **38 missing vocabulary images** — prompts sent (`_docs/level4-a2-campaign-new-vocab-prompts.md`).

Both new slide types are built as reusable, data-driven features (`crew_talk2` / `phrase_focus` parameters on `build_deck_v2`) — the code doesn't need to change again for Levels 5-6, only the content.

## Levels 5 and 6 — done

Same four content pieces, same method, applied to both levels:
1. **Second Crew Talk added** to Lessons 1-19 of both levels (`lib/crew_talk_level5.py` / `lib/crew_talk_level6.py`: `CREW_TALK_2`) — tailored to each level's own register (Level 5: past-tense storytelling; Level 6: plans, predictions, rules, comparatives, debate).
2. **Phrase Focus slides added** to Lessons 1-19 of both levels (`lib/phrase_focus_level5.py` / `lib/phrase_focus_level6.py`) — 3 real everyday phrases per lesson, each with a plain-English gloss and Arabic, tied to that lesson's own topic.
3. **Pig/inappropriate-imagery audit** — clean for both levels, nothing found.
4. **Missing vocab images** — 44 words for Level 5, 50 for Level 6 (all genuinely missing, cross-checked against existing assets and every prompt dict already sent so nothing repeats); prompts drafted in `_docs/level5-a2-campaign-new-vocab-prompts.md` and `_docs/level6-a2-campaign-new-vocab-prompts.md`.

Both levels regenerated and verified (recap pagination checked across all recap slides on both levels — zero overflow) and pushed.

## Note on "richer vocabulary"

Level 4's vocabulary lists were already substantial when I checked (9-11 words/lesson with real example sentences) — most of the specific words in your list (Message, Reply, Cooperate, Teamwork, Wake up, Alarm, Energy, Routine, Budget, Save, Career, Culture, etc.) turned out to already be written into the lessons; the gap was only the missing images for 38 of them, which are now covered above. If you want the vocabulary count itself pushed higher per lesson (beyond what's already there), let me know and I'll treat that as new curriculum authoring rather than an asset gap — it's a bigger job (new words need grammar-consistent example sentences, quiz distractors, worksheet slots, etc.) and worth scoping on its own.
