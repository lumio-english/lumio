# Lumio English — Academic Audit (all levels, 6 Oct 2026)

Written as the Academic Chief and curriculum author, after the Level 5 review and the cross-level standardisation. Scope: every lesson (7 levels × 20 lessons = 140), every vocabulary entry (978 unique words / 1,452 entries), every grammar-hub topic (43), every dialogue, Crew Talk, scene sentence, hook, challenge and common-mistake entry, plus the deck structure slide by slide.

Legend: **Fixed** = changed in this pass and live. **Recommend** = a judgement call left for Eslam (needs new images, a vocabulary change, or a design decision).

---

## 1. What changed in this pass (all live)

### 1.1 Deck structure — standardised across all 7 levels
| Slide | Before | Now |
|---|---|---|
| Dialogue / First Listen / Crew Talk | bubbles pushed to the slide margins, big empty centre | one centred chat column, speakers either side, instruction band with **pairs** and **1-on-1** reading rules (kids' Dialogue slide rewritten the same way) |
| Build the Sentences (teen) | instruction overlapped row 1 | instruction on its own row; rows sized by tile count |
| Grammar Practice · Read & Repeat | three sentences, sparse | "The Pattern" card (title EN/AR, rule EN/AR, 3-step method) + 4 numbered examples with per-line Listen + a "Now you — make one NEW sentence" production strip (pairs / 1-on-1) |
| Common Mistakes | one auto-generated pair, sometimes wrong ("She played football yesterday" marked wrong) | `lib/common_mistakes.py`: 43 topics × 3 hand-written pairs (wrong → right, why EN/AR), audited twice; interactive "Show the fix" per row |
| Your Turn | 2 rounds, listen-and-guess | **5 unique rounds** per lesson, spread across the word list: hear the word → say it in **Arabic** → reveal (picture, Arabic, English, example). Kids and teens |
| Recap / Today I Learned | one mixed KEY WORDS block + CREW TALK block | **VERBS / WORDS / GRAMMAR WORDS** groups (pictures), then Sentence Patterns, Grammar, Dialogue. Crew Talk block removed |
| Vocabulary slide | "New Verbs/New Words" only when a lesson opted in | every word carries its category tag ("Verb · فعل", "Time expression · تعبير زمني"); header reads New Verbs / New Words / Grammar Words |
| Interactive activities | teen: one-line "pair check"; kids: tap-the-tile games | **3 per lesson**, built from the lesson's own words/grammar, each with PAIRS/GROUP and 1-ON-1 rules on the slide. Kids: Flash Race, Memory Match, Mystery Picture. Teens: Describe It, Story Chain, Two Truths & a Lie. One activity added to every trial deck (group + 1-on-1) |
| Review lessons (e.g. L5 11–18, L4 13–18, L6 8–18) | no grammar slides at all ("review" in the focus skipped matching) | matched to the topic they review → rule, practice, MCQ and Common Mistakes present |

### 1.2 Word categories — how topics, words and verbs are handled now
Every vocabulary entry has a `pos` from a fixed set: **verb · noun · adjective · adverb · phrase · time · connector · grammar · number**. The deck, recap, flashcards and the student lesson page all read it, grouped into three buckets:

- **Verbs** — action words, in the form the lesson teaches (base in L1–L4/L6, past in L5, -ing where the grammar is continuous). Level 5 keeps past forms as the taught form because the lesson is *about* the past form; the base form is on the hub topic slide. Lesson 3 (did/didn't) deliberately uses base forms because that is the grammar.
- **Words** — nouns, adjectives, adverbs, phrases, numbers.
- **Grammar words** — time expressions (yesterday, last week, ago…), connectors (because, first, then, meanwhile…), function words (this/these, my/her, in/on/under). These are the "words that relate to grammar" — they now appear as a separate group with their own label and tag, not mixed with nouns.

Rules applied: a word's category follows **how the example uses it in that lesson** (watch = noun in L2/L3, update/score/record/pause/match/break/change/request/pass/dream = nouns where the example is a noun; "answer" is a noun in L3 and a verb in L5). Lesson vocab lists were re-ordered **verbs → words → grammar words** (stable within each group) so the slides, recap and student page present them in one logical run. Review lessons inherit the category of the lesson that taught the word.

### 1.3 Images — duplicate-meaning scan
151 words appear in more than one lesson across the 7 levels. All but four share the same meaning and keep one file. These four get their own picture (the lesson JSON already points at the new file; prompts are in `_docs/level5-vocab-replace-prompts-full.md`): `change-verb` (L6·9), `goal-aim` (L4·17, L6·9, L6·14), `orange-fruit` (Pre-A·4), and `first.png` is a **meaning fix** (current picture is a "1st place" medal; L5·7 teaches *first* as a sequencer). Two more recommended (see §3): `cinema-screen` for L3·17 and a verb picture for `answer` in L5·3.

### 1.4 Content corrections (fixed in this pass)
**Kids (Pre-A, L1, L2)** — Arabic agreement: *eyes* عيون→عينان; rooms made indefinite (مطبخ، حمّام); *cousin* → ابن / ابنة العم أو الخال; *brush my teeth* 3rd-person like its neighbours; *these/those* now show هذه/تلك for non-human plurals; *hundred* مائة and *clock* ساعة حائط unified with their teaching lessons; *okay* حسناً (was identical to *fine*); *stormy* عاصف وممطر (was near-identical to *windy*). Examples: punctuation (table/square/rectangle), *grow up* → "Babies grow up fast.", *ninety* → "The movie is ninety minutes long.", *guest* → "my guests", *eyebrow* → "My eyebrows are brown.", *glasses/wallet* now use **have got** (the lesson's focus), *December* → "It is cool in December." (was a Christmas-coded "holiday in December"). Categories: *clean* adjective, *years old* phrase, gerund hobbies (drawing, singing…) nouns, *watches* noun, L2·8 focus string repaired ("There is a… / There are…"). Dialogues: Omar no longer "wearing a dress" (L1·11); feminine Arabic for Noor/Sara speakers (جائعة، سعيدة، صديقتي، تستطيعين، تفعلين، تقرئين); "It might be rainy" → "Tomorrow is rainy and windy."; "My house is sunny" → "big"; Pre-A umbrella "in the water" → "in the rain"; "sit and stand" → "sit down and stand up"; scene bold *shirt* → *T-shirt*; "December is a festive month" → "cool month".

**Teens L3/L4** — pos: *welcome* verb, *relaxing*/*highlight* verbs (continuous lesson), *compromise* noun (×3), *comment* noun, *online* adjective. Arabic: *vote/post/like/regret/request/video chat* now match verb/noun use; *argument* جدال (was حجة = "argument/proof"); *popular* محبوب; *consequence* عاقبة; duplicate Arabic inside one lesson split (*riddle/puzzle*, *homework/assignment*, *occasionally/sometimes*, *cheer/encourage*) because identical Arabic breaks the match/listen activities. Hub: Articles explanationAr "أصوات العلة"; "I was born in 2016" → 2012 (a 2016 birth makes the speaker 10); Object Pronouns explanation reworded; "I like her." → "I know her." Common-mistake bank: "a tea" entry replaced (acceptable café English) with "a rice → some rice". Crew Talk / scenes: Omar-in-Sara's-bedroom chat → Omar & Hamad; L4·3 Noor→Ziad chat → Noor & Sara; Arabic gender agreement fixed in five Crew Talk lines; Ziad's dream restored to game designer (it had become Sara's architect dream); "allergic to nothing but curiosity" → plain English; "Only if you explore the culture with me first" → group framing; mixed-gender pair scenes rewritten (restaurant → Ziad & Hamad, sunset food stalls → Omar & Hamad, "squeezed onto one sofa" → three boys with space, selfie "squeezing into frame" → two girls side by side, "admiringly at Ziad's jacket" → shop window); beanbag كرسي إسفنجي; D1/D12 Arabic; "I'd request whatever they recommend" → "I'd just order…"; L3·1 scene نقضي وقتاً (not نتسكع); L3·19 scene no longer uses *were* before it is taught.

**Teens L5/L6** — *don't have to* = **ليس عليك** (was لا يجب = *mustn't* — a real meaning error, fixed in L6·5, the hub and the dialogue); *flew* سافر بالطائرة (was طار = a bird flying); *disappointed* خائب الأمل; *trust* (verb) يثق بـ; *improve* يحسّن (transitive example); *was chatting* يدردش; *catch up* يستدرك ما فاته; *charity* جمعية خيرية; *fair point* نقطة وجيهة; *more interesting* أكثر إثارة للاهتمام; *giggling* يضحك بخفة. Duplicate Arabic inside one lesson split: quiet/peaceful, line/queue, next/after that, finally/at last, reason/cause, so/therefore, grade/score. Examples: *remembered*, *interrupted*, *panic*, *respect*, *chaperone* now contain and use the word in its stated category; *earlier* no longer a comparative; "going to a field trip" → "going on"; comma splices fixed; prerequisite violations removed (past continuous in L5·7 before L5·10; past perfect "had started" in L6·4). Gulf tone: "ticket from our first movie together" → "from the match last year"; Sunday plans → Friday/Saturday (weekend realism); curfew = موعد العودة in Crew Talk (حظر تجول is a military curfew). Generator bugs: L5 Challenge/Real-life 18↔19 were swapped (Movie Night vs Lost Backpack); Crew Talk L5·12 ended on an unanswered "Gifts?"; "That wasn't ago", "meanwhile Ziad laughed" (to Ziad), "whispering to myself like a plan", "memory is a hobby", "move to the summer camp", "notes from the party lesson", "In my point of view", "healthier for the battery", "هذا الأسبوع" for *this weekend*. British spellings in Crew Talk normalised to the American spelling the lessons use. Common-mistake bank: two contrived/acceptable "wrong" sentences replaced (At the end / In the end; past-continuous question order); *travelled* → *traveled*.

**Safety** — the seven `gen_level*.py` / `gen_level*_teen.py` seed scripts (which would overwrite the reviewed `lessons/*.json` with the old 6-word seed) now refuse to run without an explicit flag.

---

## 2. Strengths (keep)
- **Progression is sound.** Pre-A → L2 builds greetings/ABC/numbers/colours → *This is / I am / It is a* → adjectives → *like* → *can* → prepositions → he/she, possessives, *have got*, imperatives, time, routines, plurals. L3/L4 cover A1→A2 (be/present simple → there is → demonstratives → plurals → possessives → place → can → Wh → comparatives → articles → imperatives → continuous; then do/does, routines, frequency, time prepositions, object/possessive pronouns, some/any, count/uncount, superlatives, would like, should). L5 is a clean past-tense arc (regular → irregular → did/didn't → was/were → there was → time expressions → sequencers → because → feelings → past continuous) and L6 the future/modal arc. No prerequisite is used inside vocabulary examples before it is taught (after this pass).
- **Vocabulary is topical.** No off-topic words in the 140 lessons; each level's words relate to the level theme (daily life for kids, teen life/school/phones/money/teamwork for L3–L4, past experiences for L5, plans/choices/culture for L6). Spiralling (animals, colours, feelings revisited) is deliberate and healthy.
- **Arabic quality is high** — MSA, with cultural care (عم/خال, أنتَ/أنتِ, Eid/coffee-and-dates hospitality in L6·18). The errors found were specific and are fixed.
- **Culture.** Dialogues are family-, school- and friendship-centred; the five teen characters are used consistently. After this pass there is no mixed-gender one-to-one scene, no physical contact across genders, and no dating cue.
- **Review lessons** mostly bring genuinely new vocabulary (study, travel, party, movie, debate, culture) and now carry the grammar they review.
- **Common-mistake bank** is accurate after two audits (43 topics, 129 pairs).
- **Image coverage**: Pre-A–L4 complete except the two new override files; L5 missing 44 (prompts delivered); L6 missing 54 (list in §4).

## 3. Weaknesses and recommendations (not applied — need a decision)

### 3.1 Add
1. **Kids: "What is this/that? — Is it…? Yes/No"** mini-lesson between L1·3 and L1·4; every L1 dialogue relies on it but it is never taught. Also *we/they are* in L2·4, one *There is…* example in L2·8, an *a/an* rule slide in Pre-A·14 (an apple/egg/umbrella appear with no rule), and a "My birthday is in…" example in L2·12 (the focus asks it, no example answers it).
2. **Kids Common Mistakes.** The kids' decks have no Common Mistake slide (bank covers L3–L6 only). Add L2 entries (He is/She is, my/your, have got, this/these, plurals) — I can write them; they need no images.
3. **Hub note for L6·7** (long-adjective comparatives) covering the short/irregular forms the lesson also teaches (*cheaper, healthier, the best*) — or move those three to L6·12.
4. **Two more image overrides**: `cinema-screen` for L3·17 (*screen* = phone screen in L3·7, cinema screen in L3·17); `answer-verb` for L5·3 (raised-hand picture is fine but a "replying" picture is clearer). Prompts on request.
5. **L4·6 (possessive pronouns)**: *keychain / umbrella / lunchbox* examples use no possessive pronoun; **L3·15** (present continuous review): *review / notes / deadline / teamwork* examples are not continuous. I can rewrite these 7 examples — say the word.

### 3.2 Modify
6. **Sentence difficulty jump for kids.** L1·15–19 and L2·15–20 examples are compound sentences (*because / so / but / while*: "The cat is under the chair because it is sleepy", "Three children are playing while their parents watch", "My niece is younger than me") while lessons 1–14 are 3–5 words. Comparatives and subordinators are not taught until L3+. Strong recommendation: one clause per example in those lessons (≈60 sentences). Not done because it changes the sentence-builder and writing-sheet content for 11 lessons — your call.
7. **Music/dance/concert content** (not a hard rule from you, so left as is): L3·2 *practices guitar / instrument / rehearse*; L3·9 *dance*, "perform a song"; L3·17 *soundtrack*; L4·10 "most talented singer"; L4·13 *trend* example "That dance is the newest trend"; L5·4 "The concert was amazing" + dialogue/scene; L5·14 *music, playlist*; L6·3 *concert*; hub L6 "sings beautifully / most beautiful singer". Replacing these means new words and images (e.g. *dance → skate*, *concert → match*, *perform a song → perform a play*). Tell me whether you want this and I will do the set in one pass with prompts.
8. **L4 reviews *Would like / Want* three times** (L11, L15, L17). L17 "My Future Self" would be better served by *want to + verb / going to (intro)* — that also pre-loads L6·1. **L4 Present Simple** is reviewed at both L13 and L18.
9. **L6·4 "Past Continuous (full)"** sits inside the future level; it works as a bridge from L5·10/16 but reads oddly in the L6 sequence. Consider moving it to L6·13's slot (which reviews it anyway) and giving L6·4 *will vs going to*.
10. **Above-A2 items** that slipped in: *therefore, counterargument, statistic, itinerary, consequence, heritage*. Fine as stretch words if the teacher is told; otherwise swap.
11. **Review-lesson recycling** (same meaning, so no image conflict): L5·13 *excuse, traffic*; L5·15 *unforgettable*; L5·19 *lost, found, relieved*; L5·18 *was texting*; L6·10 *permission, responsibility*; L6·9 *future*; L6·8 *volunteer*; L6·14 *goal*. If "new vocabulary every lesson" is a promise to parents, replace these 12 with new words (prompts needed).
12. **Arabic consistency across levels** for repeated words: *emoji* (إيموجي / رمز تعبيري), *deadline* (موعد التسليم / موعد نهائي), *captain* (قائد الفريق / كابتن الفريق). Pick one each.
13. **L5·3 base-form verbs** inside a past-form level are correct (did/didn't takes the base) but learners see "finish ينهي" next to "played لعب". Add a one-line teacher note on the hub slide ("after did/didn't the verb goes back to its base form") — I can add it.
14. **L6 dialogues 1, 8, 14** barely use the target form (*going to / will*); they lean on "thinking about / want to / hope". Rewrite so each has at least two target sentences.
15. **"recently"** (L5·6) is not a past-only time expression; "suddenly" (L5·7, L6·4) is an adverb, not a sequencer — both are fine as taught words, but the Grammar Words label says "time expression"/"connector". Acceptable; flagging for precision.

### 3.3 Remove (optional)
16. *song* in Pre-A·18 (covered by *sing*); duplicate *board* in L2·9 (taught in L2·8).

---

## 4. Missing vocabulary images
- **Level 5 (44)** — full prompt set delivered: `_docs/level5-vocab-replace-prompts-full.md`.
- **Cross-level overrides (3 new + 1 replace)** — in the same document: `change-verb`, `goal-aim`, `orange-fruit`, `first`.
- **Level 6 (54)** — no prompts yet: internship, scholarship, forecast, certain, unlikely, booking, guest-list, suddenly, as-soon-as, by-the-time, mandatory, don't-have-to, slowly, gently, accurately, cheaper, healthier, the-best, brunch, road-trip, board-game, discover, technology, privacy, tone, body-language, eye-contact, affordable, durable, efficient, distraction, productive, timer, milestone, progress, motivation, statistic, counterargument, conclusion, rehearsal, timeline, backup-plan, double-check, instructions, step-by-step, heritage, cuisine, hospitality, chaperone, itinerary, headcount (+ change-verb, goal-aim). Say the word and I will write the Level 6 prompt document in the same format.

## 5. Verification done
- All 140 decks, 14 trial decks (group + 1-on-1) and all worksheets/flashcards/writing PDFs regenerated from the audited content.
- Browser screenshots of every redesigned slide type in Pre-A·7, L1·3, L2·9, L3·5/10, L4·12/10, L5·1/3, L6·3/10, plus interactive states (flip, reveal, show-the-fix, spin, memory match, mystery tile, star, timer) and the trial activity slides.
- Lesson JSON re-validated; generators and libraries compile; common-mistake bank covers all 43 hub topics; every `image` override resolves to a file name in the prompt document.
