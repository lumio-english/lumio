# Academic review: Level 5, Story Science (Bonus Classes 1-4)

Reviewed line by line on 12 Oct 2026. I read every string in `bonus-classes/level5/bonus01.json` to `bonus04.json` and checked them against
`lessons/level5/lesson01-16.json` (vocabulary and grammar), `grammar-hub/level5.json` and the Level 5 section of `_docs/bonus-classes-plan.md`.
Files were rewritten with `json.dump(..., ensure_ascii=False, indent=2)`, so the git diff also shows a whitespace reformat. The content changes are the ones listed below.
`python3 gen_bonus_plans.py --check` returns "28 bonus classes OK". Stage minutes are unchanged, and each class still adds up to 60.

## Bonus Class 1: The Three Sounds of -ed and the Old Verbs

| Field / location | Before | After | Reason |
|---|---|---|---|
| bigIdea (EN + AR) | "Irregular verbs are old 'fossils' that ... change the vowel" | "Many irregular verbs ..." | Not all irregular verbs change their vowel by ablaut (went, had, made, bought). |
| keyTerms "voiced sound" | "b, d, g, v, z, m, n, l, r and all vowels" | "for example b, d, g, v, z, m, n, l, r, th in 'this', and all vowels" | The list was presented as complete, but it left out voiced th, w, y and ng. |
| keyTerms "voiceless sound" | "p, k, f, s, sh, ch" | "p, t, k, f, s, sh, ch, th in 'think'" | t is voiceless. Leaving it out made the definition wrong. |
| keyTerms "regular (weak) verb" / "irregular (strong) verb" | equated irregular with "strong" | "regular verb" / "irregular verb: ... sing - sang, buy - bought, go - went. Many are old 'strong' verbs ..." | In historical terms "strong" ≠ "irregular". bought, met, had and made come from weak verbs. Hall B's own tip already says this, so the key terms contradicted it. |
| Fact 0 (EN + AR) voiceless list | (p, k, f, s, sh, ch) | (p, k, f, s, sh, ch, th) | Complete for the -ed rule (bathed is voiced, but "unearthed" and "frothed" end in /θt/). |
| Fact 1 (EN + AR) | "'wantt' would sound exactly like want" | "almost exactly like" | Small hedge. A geminate or released t can be heard, but only weakly. |
| Fact 3 (EN + AR) | "About 600 years ago ... said walk-ed. The sound disappeared" | "About 600 to 700 years ago (in Chaucer's time) ... Over the next 200 years or so the extra vowel slowly disappeared" | In Middle English -ed was a full syllable (Chaucer, c. 1390). The loss spread through the 15th and 16th centuries. The Arabic text now says the same. |
| Fact 4 (EN + AR) | "Old English and its cousins (German, Dutch) had 'strong verbs'" | "Old English, like its cousins German and Dutch, had many 'strong verbs' (German and Dutch still have lots of them)" | The past tense wrongly suggested that German and Dutch no longer have strong verbs. |
| Fact 5 (EN + AR) | "Every NEW verb is regular ... Nobody says 'I tex' or 'I goog'!" | "Almost every NEW verb is regular ... Nobody invents a vowel-change past like 'I taxt' for text!" | Hedged ("snuck" and "dove" show that new strong forms do sometimes appear). Some speakers really do say "I text him yesterday" because the cluster is simplified, so the old joke was false. The Arabic now also gives healp. |
| Stage 4 teacher line 3 | "Would you say 'I tex my friend yesterday'? No!" | "Would anyone make a new past like 'I taxt my friend yesterday'? No! We say texted." | Same reason. |
| Fact 6 (EN + AR) | wend "(to travel)" / (يسافر) | "(to go on your way)" / (يمضي في طريقه) | wend means go or turn, not specifically "travel". The frequency explanation is now hedged ("that is what many linguists think"). |
| Fact 7 (EN + AR) | "at age 3 or 4" | "around age 3 or 4" | Children overregularize over a range of ages, so the old wording was too precise. |
| Arabic bridge 1 (EN + AR) | "in Arabic it is the main system" | "a central part of how words are built" | Arabic also uses affixes (-ون, -ات, prefixes). Root and pattern is central but not the whole system. |
| Arabic bridge 3 (arabic + point) | "(لم + المضارع)", "Arabic says the past with لم" | "(لم + المضارع المجزوم)", "Arabic makes a negative past with لم and then a present-form verb, المضارع المجزوم" | لم negates the past, and the verb is jussive, not just "present". |
| Stage 0 teacher line 0 (EN + AR) | "Every story is in the past" | "Most stories are told in the past" | Overclaim. Many stories are told in the present. |
| Stage 3 teacher line 0 | "the e was pronounced 600 years ago" | "about 600 years ago" | Consistent with the hedged Fact 3. |
| Stage 4 tip 2 | Hall B note only | + "meet - met is historically the same kind (like keep - kept), but students hear only a vowel change, so Hall A is fine for today." | meet is a weak verb (OE mētan/mētte). It sits in Hall A "vowel change", which is fine as a label, but the teacher should know. |
| Error clinic item 7 answer | "I ate pizza at the mall. (action = past verb, no was)" | + "'I was eating pizza' is also correct English, but that form comes in Lesson 10" | A second correction is also defensible, so the answer key now names it. |
| Stage 7 "Did you know?" (EN + AR) | "Of the 10 most common verbs, most are irregular: be, have, do, say, go, get, make, know, take, see" | "In big word counts of English, the most common verbs are nearly all irregular: be, have, do, say, go, get, make, know, think, take. One reason fossils survive ..." | Corpus top-10 lexical verbs (COCA/BNC) include think, not see. All ten are irregular, so "most" undersold it. The cause is hedged. |
| Spelling | neighbour, overgeneralisation, Recognise | neighbor, overgeneralization, Recognize | American spelling as in the lessons. |

**Verified correct, no change (Class 1).** Every -ed item was checked against the sound at the end of the base verb.
- /t/: walked, helped, watched, baked, cooked, finished, missed, checked, stopped, danced (/s/), fixed (/ks/).
- /d/: played, cleaned, called, answered, delivered, replied, lived, scrolled.
- /ɪd/: visited, rested, attended, needed, wanted, texted, downloaded.
- Spelling notes are correct: stop → stopped, reply → replied.
- Diary count is 10 (walked, watched, bought, played, was, helped, cooked, visited, wanted, needed).
- IPA is correct: /beɪkt/, /dænst/, /fɪkst/, /wɔːkt/, /wɒtʃt/, /helpt/, /pleɪd/, /kliːnd/.
- beloved, learned (adjective) and blessed keep /ɪd/.
- help: OE strong verb, past healp. went is the old past of wend.
- Hall answers: sang, saw, took, found, ate and got are strong verbs. bought and thought are -ought weak verbs with a vowel change. go - went is suppletion. The Hall B tip is accurate.
- كَتَبَ/كُتِبَ is the active/passive pair. كِتاب/كُتُب is a broken plural. Both are framed as "similar idea, not the same system".
- لعبتُ/لعبتَ/لعبتْ/لعبوا are correct.
- The translation answers in stage 3 are correct.
- 12 sort items, 10 hall items, 8 clinic items and 5 exit-ticket items match the success criteria.
- Timing: 5+11+8+7+10+7+7+5 = 60.

## Bonus Class 2: How Stories Are Built (the story mountain)

| Field / location | Before | After | Reason |
|---|---|---|---|
| bigIdea (EN + AR) | "Almost every good story ... climbs the same mountain" | "Most stories ... climb a similar mountain" | Overclaim. teacherNotes already say "a thinking tool, not a law". |
| Fact 0 (EN + AR) | "Aristotle said a story needs a beginning, a middle and an end. In 1863 ... Freytag drew this as a pyramid with five parts. Schools today call it the story mountain." | "Aristotle wrote that a good plot has ... Freytag described the shape of a play as a pyramid with five parts (in sad plays his last part was the 'catastrophe'). Schools today use a simpler version called the story mountain." | Aristotle wrote about the plot of tragedy (Poetics). Freytag (Die Technik des Dramas, 1863) analysed five-act drama, and his fifth part is "catastrophe", not "resolution". The story mountain is a later school adaptation. |
| Fact 2 (EN + AR), Labov | "Their stories had the same parts, plus one more: the 'evaluation'" | Names Labov's components: orientation, complicating action, resolution, plus abstract, coda and evaluation | Labov & Waletzky (1967) / Labov (1972) did not find "the same parts plus one". Their model is different (it has no climax or falling action) and has six components. Arabic terms: التوجيه، الحدث المعقِّد، الحل، الملخّص، الخاتمة، التقييم. |
| Fact 5 (EN + AR) | "The most famous cliffhangers in the world are Arabic" | "Some of the most famous cliffhangers in world literature are in an Arabic classic" | Overclaim. The frame story and many tales also come from Persian and Indian sources. "An Arabic classic" (the text as we know it) is accurate. |
| Stage 6 "Did you know?" (EN + AR) | "The most famous storyteller in the world is Arab: Shahrazad ... was overtaken by morning" | "One of the most famous storytellers in world literature is Shahrazad, in the Arabic classic ... each night ends with the same line: 'Morning came upon Shahrazad, and she stopped her story.'" | In the story Shahrazad is the daughter of the Persian king's vizier, so calling her "Arab" is inaccurate. The translation of وأدرك شهرزادَ الصباحُ is also improved. |
| Stage 1 teacher line 1 | "Freytag drew this shape in 1863. Aristotle said it simpler, 2,300 years ago" | "described a shape like this for plays in 1863. Aristotle said it more simply, about 2,300 years ago" | Accuracy (see Fact 0) and grammar ("more simply"). |
| Stage 1 item 7 answer | "5 resolution (the lesson / coda)" | "5 resolution (Labov would call this the coda: it brings us back to now)" | Uses the coda term correctly ("Now Hamad always checks ..." returns to the present). |
| Arabic bridge 1 | "(خاتمة مصرية شعبية)" | "(خاتمة شعبية باللهجة المصرية)" + EN "(this Arabic one is Egyptian dialect)" | Dialect lines must be clearly labelled as dialect. |
| Arabic bridge 2 (EN + AR) | "Arabic grammar already knows the difference"; "sounds childish"; AR list without immediately | "Arabic grammar books already describe the difference"; "sounds weak in writing"; AR now lists immediately, as the EN does | The فـ = ترتيب وتعقيب / ثم = ترتيب وتراخي rule is a grammarians' description, and usage is looser. "Childish" was judgmental. The AR now matches the EN. |
| Common error 3 why | "كان هناك stays the same" | "often stays the same" | MSA can say كانت هناك + feminine noun, so "always" was too strong. |
| Ordering task (Ziad's story) | B "After that, we went to the gift shop ..." (4), G "Then we walked around ..." (3); tip "B and G could swap" | B "At the end of the visit, we went to the gift shop ..." (7), G "Then we walked into the big hall ..." (3), A 4, H 5, F 6; tip gives the order C, E, G, A, H, F, B, D | The old key had two defensible orders (gift shop before or after the blackout). The answer is now unique. |
| Stage 5 Arabic | "أرمي حجر القصة" / "بطاقات الحجر" | "أرمي نرد القصة" / "بطاقات النرد" | "Dice" is نرد. حجر alone does not mean dice. |
| teacherNotes 0 | "every story uses words from Lessons 1-8" | "the stories mostly use words from Lessons 1-8. Quickly gloss the few new nouns (science fair, volcano, vinegar, judges, gift shop, key ring)." | The old note was false: these nouns are not in Lessons 1-8. |
| Spelling | colour (2x), organiser, favourite | color, organizer, favorite | American spelling. |

**Verified correct, no change (Class 2).**
- Time traps: قبل يومين → two days ago, not "before two days". في الأسبوع الماضي → last week, not "in last week". last/next/this + time take no preposition.
- Because ... so double linker: the لأنّ ... فـ explanation is correct.
- because vs because of.
- كان يا ما كان، في قديم الزمان، وسالف العصر والأوان (rhyme زمان/أوان).
- وأدرك شهرزادَ الصباحُ فسكتت عن الكلام المباح (case endings correct).
- The gap-fill has 8 items and an 8-word bank, one answer each. Accepting Finally/Next is noted.
- Labelling key (setting / rising ×2 / climax / falling / resolution ×2).
- The exit ticket is correct.
- Timing: 5+10+7+10+8+12+8 = 60.

## Bonus Class 3: Background and Action (was doing vs did)

| Field / location | Before | After | Reason |
|---|---|---|---|
| keyTerms "tense" | "When something happens: past, present." | "Where an action sits in time. English verbs show past or present: walked, walk." | Tense is the grammatical marking of time, not the time itself. The new wording is still simple. |
| Fact 2 (EN + AR) | "(for example Paul Hopper) noticed the same thing everywhere" | "(for example Paul Hopper, in 1979) noticed the same thing in language after language" | "Everywhere" is an overclaim. Hopper's 1979 paper is the source. |
| Arabic bridge 1 (EN + AR), habit trap | "The same Arabic form also means a past HABIT. For habits English does NOT use was playing" | "can also mean a past HABIT (something that happened again and again). For a past habit English usually does NOT use was playing; it uses the past simple or used to." | كان + المضارع is either past progressive or past habitual. English past continuous for habits is possible in special cases (a temporary period, or "always" complaints), so the rule is hedged with "usually". |
| Stage 3 purpose / teacher line 0 | "كان + المضارع = was/were + -ing"; "كان يلعب = he was playing" | "≈ ... for one moment in progress"; "كان يلعب (at one moment) = he was playing" | Not an identity. It matches only the progressive reading. |
| Stage 3 item 5 (translation) | "كانت نور تتمرّن على البيانو كل يوم قبل الامتحان" → "Noor practiced ..." | "... كل يوم عندما كانت صغيرة" → "Noor practiced (used to practice) the piano every day when she was little." | "Was practicing every day before the exam" (a temporary habit) is natural English, so the old item had two answers. The new item is a clear long-term habit. |
| Stage 3 tip 0 | about item 5 | "would" is also correct for past habits; was + -ing for a habit only in special cases | Gives the teacher the full and accurate picture. |
| Stage 1 item 5 (B/E classify) | "Her boarding pass wasn't there!" → "E (the discovery ...)" | "She shouted, 'Where is my boarding pass?'" → E | "wasn't there" is a state, so by the class's own rule it could be B. It is now a clear event. The tip was rewritten to cover item 1 (state + continuous = background). |
| Stage 1 item 7 | "holding a small paper" | "holding a small piece of paper" | "paper" is uncountable here. |
| Stage 2 item 3 | "Was Omar already in the shelter when it started?" | "Was Omar already running when the storm started?" → "no (he started running after the storm started)" | Now a true minimal pair with item 4 ("Was Omar already running?" → yes). |
| Interrupted! answers (items 2, 4, 6, 7) | "when" version only | + "while" version | The game gives 2 points for both versions, so the key needs both. |
| Error clinic item 6 | "When the bus arrived, we were talking." | + "/ While we were talking, the bus arrived." | Both corrections are defensible. |
| Stage 6 model | "a huge flash of thunder" | "a huge clap of thunder" | Thunder is a sound. The flash is lightning. |
| Spelling | Mum (3x), colour | Mom, color | American usage, as in the Level 1 review. |

**Verified correct, no change (Class 3).**
- Tense vs aspect is explained correctly.
- "When Sara arrived, we ate / were eating" (after / before).
- State verbs (know, like, want, need, believe) "usually" not in -ing.
- Arabic ماضٍ/مضارع as partly aspectual is hedged ("many linguists").
- while usually + long action, when usually + short event (hedged).
- Every translation and exit-ticket answer is correct.
- All forms are in Lessons 9-12 or glossed.
- Timing: 5+10+9+8+9+6+8+5 = 60.

## Bonus Class 4: Speak Like a Storyteller (the music of English)

| Field / location | Before | After | Reason |
|---|---|---|---|
| Fact 0 (EN + AR), stress-timing | "English is called a stress-timed language ... the three sentences take almost the same three beats" | "is often called ... tend to come at fairly regular beats ... we say the longer ones faster to keep a similar rhythm. (Measurements show the beats are only roughly regular.)" | Isochrony is not supported by measurement (Roach 1982, Dauer 1983), so the claim is hedged. |
| Fact 1 (EN + AR) | "several studies place Arabic close to English" | "stress-timed (like English) or syllable-timed (like Spanish or French) ... Arabic was traditionally put in the stress-timed box with English, and many studies still place it near English, although dialects differ" | Abercrombie (1967) already classed Arabic as stress-timed. Rhythm metrics (e.g. Ghazali et al. 2002) show differences between dialects. |
| Stage 1 teacher line 3 (EN + AR) | "Linguists once said Arabic and English have different beats. Newer studies show ..." | "Some people think Arabic and English have very different beats. In fact, many linguists put Arabic close to English here. So your beat is probably fine" | Historically false: linguists traditionally grouped Arabic with English. |
| Fact 2 (EN + AR) | "sound 'heavy' or 'flat'" | "sound heavy and slow" | "Flat" refers to intonation, which is a different issue. |
| Fact 4 (EN + AR) | "English listeners listen for the strong words" | "pay most attention to the strong words" | Hedged. Listeners still process function words. |
| Fact 5, stage 2 items 2 and 9, exit item 3 | strong /wɒz/, /frɒm/ | + "(US /wʌz/)", "(US /frʌm/)"; tip now lists the US forms /wɚ/, /wʌz/, /frʌm/ | The lessons use American English, so both standards are given. |
| Linking respellings (fact 6, stage 4 line 0, items 3 and 8) | 'lot-sof', 'ful-lof' | 'lot-səv', 'fu-ləv' | The weak form of "of" is /əv/ and ends in v, not f. "full" has one l. |
| Arabic bridge 2 (EN + AR) + stage 3 line 3 | "في is always fi"; "English small words lose their vowel" | "they keep a clear vowel: في is fi (or fil- before ال)"; "usually change their vowel to /ə/" | "Always fi" contradicted the class's own example في البيت → fil-bayt (the long ī shortens). English weak forms mostly reduce the vowel to schwa rather than lose it. |
| Arabic bridge 3 (EN + AR) | "Arabic words also have a stressed syllable" | + "(which syllable is stressed can differ between Arabic dialects)" | For example Cairene madrása vs Levantine mádrase. Stated without ranking the dialects. |
| Stage 3 teacher line 0 | "The hamza disappears" | "The hamzat al-wasl disappears" | Precise term. Hamzat al-qaṭʿ never drops. |
| Stage 3 teacherSaysAr 2 | "الجديد الوحيد" | "الجديد الأهم" | Word stress is also new (taught in the same stage), so "the only new thing" was false. |
| Common error 4 / watchFor 3 | wrong "baLOON" vs right "balLOON" | wrong "BALloon" | The "wrong" and "right" forms put stress on the same syllable, so the item showed no error. |
| Weak-or-strong exercise + exit item 3 | target word in CAPITALS ("The party WAS amazing.") | target word in [brackets] ("The party [was] amazing."); instructions EN/AR and student task updated | In this class, CAPITALS mean stress, so a capitalized WAS signalled "strong" when the key said weak. The old studentsDo also said "underlined". |
| Script line 4 | "I thought they forgot my birthday ..." | "Nobody said 'Happy birthday', and I was so disappointed." (answer: NObody SAID 'HAPpy BIRTHday' // ...) | Standard English needs the past perfect ("had forgotten"), which has not been taught. The new line uses only taught grammar. |
| Stage 0 teacher line 2 (EN + AR) | "Which one sounds English?" | "Which one sounds more natural?" | Clearer, and it does not suggest the robot reading is "not English". |
| Spelling | kinaesthetic, capitalise, Practise, Mum/MUM | kinesthetic, capitalize, Practice, Mom/MOM | American spelling. |

**Verified correct, no change (Class 4).**
- Weak forms: was /wəz/, were /wə/ (US /wɚ/), to /tə/, and /ən/, of /əv/, a /ə/, can /kən/.
- Strong forms in final position: was, to, can, from.
- Schwa is the most common English vowel, can be spelled with any vowel letter (about, taken, pencil, today, supply) and is never stressed.
- Content vs function words. didn't counts as a content word.
- Stress in every find-the-stress item, including CELebrate/celeBRAtion, balLOON, decoRAtion, anniVERsary and COUsin.
- Linking: woke_up, an_hour (silent h), picked_up (the /t/ of -ed carries to the next word), came_in, left_at_eight.
- Arabic: في البيت → fil-bayt (hamzat al-wasl drops in درج الكلام); الشمس → aš-šams (sun letter assimilates the lām).
- Tajweed: الوقف والابتداء can change meaning. It is presented respectfully and with a tip that not every student has studied it.
- "Let's eat, Grandma!" pause pair.
- Contrastive stress challenge.
- Timing: 5+10+8+7+10+13+7 = 60.

## Could not verify / for the owner or a native speaker
1. **IPA standard.** The files use British-style dictionary IPA (/wɒtʃt/, /wɔːkt/, /ˈpɑːti/) while the lessons use American spelling. I added US variants only where a weak/strong contrast is tested. The owner should decide whether all IPA in the level should be General American.
2. **film vs movie.** The bonus classes say "film" (diary, error clinic, exit ticket). Lesson vocab examples mostly say "movie". Both are American English. Change only if you want strict consistency with the lessons.
3. **Egyptian dialect ending** «وعاشوا في تبات ونبات، وخلّفوا صبيان وبنات». This is the common Egyptian folk-tale formula, now labelled as Egyptian dialect. A Gulf-based teacher may want to add a Gulf ending if one is commonly used.
4. **Piano in Class 3 translation item 5.** Kept, because it is culturally ordinary in Gulf and Egyptian families. Swap it for a sport if the owner prefers to avoid music references.
5. **Arabic rhythm research** is genuinely mixed and varies by dialect. The text is now hedged ("many linguists", "probably"). A phonetician could tighten the wording further if wanted.
