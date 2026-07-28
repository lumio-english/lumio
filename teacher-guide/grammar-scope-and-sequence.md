# Grammar Scope & Sequence — Full Curriculum (Level 3 → Level 9)

## What was actually wrong

You were right, and it was worse than one missing topic. Auditing all
7 grammar-hub files together (I'd only ever edited them one level at
a time before) turned up:

1. **Present Simple was missing from Level 3 entirely.** Present
   Continuous was there instead — backwards. Present Simple (I play,
   she plays) is the foundational sentence pattern everything else in
   English grammar builds on; it has to come first.
2. **No topic anywhere taught Present Simple negatives** (don't/
   doesn't) — a real gap, not just a sequencing issue.
3. **Eight topics were duplicated across levels**, some 3+ levels
   apart with no cross-reference: Superlatives, Imperatives, Present
   Continuous, Should/Shouldn't, Countable & Uncountable Nouns, How
   much/How many, Past Simple Questions, and Past Continuous each
   appeared twice.

This happened because I built/expanded each level's grammar-hub file
in isolation across different turns, without re-checking it against
the others. Fixed now — rebuilt all 7 files together in one pass, so
they were designed as one connected sequence instead of 7 separate
ones. Zero duplicates, verified programmatically before pushing.

## Your question: how many levels does grammar need?

**Levels 3 through 9 — seven levels — to go from zero grammar (A1
foundations) to B1.** Not split evenly into 3-per-stage blocks,
though, and here's the reasoning: proficiency progression isn't
linear. Early levels need to move slowly over fewer, more load-
bearing structures (a beginner needs a lot of practice with "is/are"
before touching conditionals). Later levels can move faster because
each new structure builds on a much bigger base the student already
has. So the honest breakdown is uneven on purpose:

| CEFR stage | Levels | Grammar load | Why |
|---|---|---|---|
| **Pre-A1** | Pre-A, 1, 2 | *(none — vocabulary/functional only)* | Building blocks (nouns, "This is...", "I am...") before formal grammar starts |
| **A1** | 3 – 4 | 14 + 12 = 26 topics | Present Simple/Continuous, basic questions, comparatives, articles — the core toolkit |
| **A2** | 5 – 6 | 10 + 7 = 17 topics | Past Simple/Continuous, future forms — the second major tense system |
| **A2+/B1** | 7 – 9 | 8 + 6 + 8 = 22 topics | Present Perfect, conditionals, passive, reported speech — the "sounding fluent" layer |

65 topics total. If you compare that to the original curriculum-map.md's already-sketched Level 3→9 CEFR labels ("A1" through "B1"), this confirms that outline was directionally right — the problem was never the level count, it was that the content inside those levels hadn't been sequenced or cross-checked as one system.

## The corrected sequence

### Level 3 · My World — A1 foundations (14 topics)
Present Simple (I/you/we/they) → Present Simple (he/she/it + -s) →
Present Simple Negatives → There is/There are → This/That/These/
Those → Plural Nouns → Possessive Adjectives → Prepositions of Place
→ Can/Can't → Wh- Questions → Comparatives → Articles (a/an/the) →
Imperatives → Present Continuous.

*Present Simple now leads, in 3 parts (affirmative for I/you/we/they,
the -s form for he/she/it, then negatives) before anything else is
introduced. Present Continuous moved to the end of the level, once
Present Simple is established, so the contrast between "I play" (habit)
and "I am playing" (right now) actually means something.*

### Level 4 · Every Day — A1 continued (12 topics)
Present Simple Questions (Do/Does) → Present Simple for Routines →
Adverbs of Frequency → Prepositions of Time → Object Pronouns →
Possessive Pronouns → Some/Any → Countable & Uncountable Nouns →
How much/How many → Superlatives → Would like/Want → Should/
Shouldn't.

*Direct continuation of Level 3's Present Simple — now the question
form, then real fluency around routines and frequency.*

### Level 5 · Stories Begin — A2 (10 topics)
Past Simple (regular) → Past Simple (irregular) → Past Simple
Negatives & Questions → Was/Were → There was/There were → Time
Expressions → Sequencing Words → Because → Feelings in the Past →
Past Continuous (intro).

### Level 6 · Growing Up — A2 continued (7 topics)
Going to → Will → Present Continuous for Future Plans → Past
Continuous (full, contrasted with Past Simple) → Have to/Don't have
to → Adverbs of Manner → Comparatives/Superlatives with long
adjectives.

### Level 7 · Wide World — A2+/B1 entry (8 topics)
Present Perfect → Present Perfect vs Past Simple → Present Perfect
with For/Since → First Conditional → Second Conditional → Used to →
Question Tags → Too/Enough.

### Level 8 · Think & Talk — B1 (6 topics)
Modal Verbs (advice & obligation) → Passive Voice (intro) → Gerunds
& Infinitives → As...As → Might/May → Reflexive Pronouns.

### Level 9 · Express Yourself — B1 capstone (8 topics)
Reported Speech → Relative Clauses → Third Conditional → Reported
Questions → Phrasal Verbs → Wish/If Only → Past Perfect → Linking
Words.

## What's live vs. what's prepared

**Live and wired into real lessons:** Level 3 & 4 — their "Grammar
Time!" slides in the Present decks now pull from this corrected list
(regenerated and verified — Level 3 Lesson 1 opens with Present
Simple, confirmed in the browser before this was pushed).

**Prepared, not yet wired:** Level 5-9 grammar-hub content is
correct and ready, but those levels don't have a lesson curriculum
built yet (no `lessons/level5/` etc.), so there's nothing for the
grammar slides to attach to. That's the natural next phase whenever
you're ready to build Level 5 the way we built 3 and 4.
