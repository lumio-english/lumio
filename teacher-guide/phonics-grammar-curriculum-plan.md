# Phonics & Grammar Curriculum Plan

## Phonics — LIVE now (Level 1 & Level 2)

Phonics is a separate skill track from the main 20-lesson vocabulary
curriculum, delivered through the English Hub → Phonics tab
(`phonics-hub/{level}.json`). It follows a standard synthetic-phonics
scope and sequence (the same progression used by Jolly Phonics /
Letters and Sounds), condensed and annotated for Arabic-speaking
learners — each unit includes a `tip` in Arabic flagging sounds that
don't exist in Arabic (p vs. b, v vs. f, English r) or patterns that
transfer easily (th, sh, ch already have close Arabic equivalents).

**Level 1 · First Sounds** (8 units) — single letter-sound
correspondence, building to first blending and first sight words:
Groups 1-5 (s,a,t,p / i,n,m,d / g,o,c,k / ck,e,u,r / h,b,f,l) → CVC
blending practice → first sight words (I, the, a, to, go) → review.

**Level 2 · Sounds & Blends** (9 units) — digraphs, consonant
blends, and vowel teams:
Group 6 (j,v,w,x,y,z) → digraphs (sh, ch, th, ng) → l-blends →
r-blends → s-blends → vowel teams (ai, ee, oa) → more sight words
(he, she, we, they, was, are, you, all) → review.

**Not yet built** — natural next steps once Level 1-2 phonics is
confirmed working well in the classroom:
- Level 3+: r-controlled vowels (ar, er, ir, or, ur), silent e (a_e,
  i_e, o_e), remaining vowel teams (oo, ow, ou, oi, oy), and
  suffixes (-ing, -ed, -s/-es spelling rules)
- A phonics-specific flashcard/worksheet generator (currently only
  vocab lessons have those)
- Possibly a dedicated phonics mini-game (tap-the-sound), separate
  from the vocab-word games

## Grammar — expanded for Level 3, 4, 5 (prepared in advance)

`grammar-hub/level{3,4,5}.json` already existed with 8 topics each;
each has been expanded to 13 topics so the reference material is
substantially ahead of the current lesson curriculum (which only
goes through Level 4). This is intentionally "in advance" — Level 5
lessons don't exist yet, but Level 5's grammar reference is ready for
whenever that level gets built.

**Level 3 · My World** — added: Present Continuous, Superlatives,
Imperatives, Articles (a/an/the), Adverbs of Frequency (intro).

**Level 4 · Every Day** — added: Possessive Pronouns, Countable &
Uncountable Nouns, How much/How many, Would like/Want, Should/
Shouldn't.

**Level 5 · Stories Begin** — added: Past Continuous (intro),
Sequencing Words, Past Simple Questions, Because (reasons), Feelings
in the Past. This sets up Level 5's eventual lesson curriculum,
which (per `curriculum-map.md`) is built around Past Simple
storytelling.

No new UI work was needed for this — the Grammar Hub already reads
these JSON files dynamically, so the expanded content is live
immediately for any level that has grammar unlocked (Level 3+).

## Slide-deck redesign — NOT started yet

The fourth request (restructure Level 1 & 2's Present deck slides to
be richer/more professional/more efficient) is a separate, much
larger effort — it touches ~1,120 existing slides across 40 lessons.
See the response accompanying this build for a proposed direction
and a request for a quick look at a pilot lesson before a full
rebuild.
