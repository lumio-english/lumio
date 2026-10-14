# Academic review — Level 1 (Sound Lab), Bonus Classes 2, 3 and 4

Reviewed 12 Oct 2026, every string in `bonus-classes/level1/bonus02.json`, `bonus03.json`, `bonus04.json`.
Bonus Class 1 is reviewed separately in `level1-bonus01.md`. Its conventions are kept here: the Arabic gender of a character
follows the English pronoun ("Quick E … he" → E السريع), consonant = صامت, and there are no "English always writes the vowel" overclaims.
Context checked: lessons 1-16 vocab, phonics hub units 1-8 (unit k = Lesson 2k-1), and the bonus plan.
`python3 gen_bonus_plans.py --check` → "28 bonus classes OK". Stage minutes are unchanged (60 each). All three files were rewritten with `json.dump(..., ensure_ascii=False, indent=2)`, so the diff also shows formatting.

---

## Bonus Class 2 — Sounds Arabic Doesn't Have: P, V and the Buzz

| Field / location | Before | After | Reason |
|---|---|---|---|
| builtOn[0] | colours | colors | American spelling (lessons use "What color is it?"). |
| objectives[2] en + ar | top teeth on my lip / على شفتي | top teeth on my **bottom** lip / على شفتي **السفلى** | Place of articulation for /v/ is labiodental with the lower lip. |
| linguisticsCorner fact 3 en + ar | "p and b … The only difference is the buzz." | "The big difference is the buzz: b buzzes, p does not … (English p, t and k also have a puff: see the next fact.)" | In English, word-initial /p/ vs /b/ differ in aspiration as well as voicing (initial /b/ is often only weakly voiced). "Only" was false. |
| fact 4 en + ar | (ended at spin/pin) | added: "English listeners notice this puff even more than the buzz, so a clear puff is the best way to make pin sound different from bin." | Aspiration (VOT) is the main cue English listeners use for initial p/b. This is why the tissue test is the right tool. |
| fact 5 en + ar | "tongue … never touches the top of the mouth"; "In British English the r at the end of car is not said at all" | "the tongue **tip** … does not touch the top of the mouth"; Arabic ر: "the tongue tip hits the bump just behind the top teeth"; "In **standard** British English the r at the end of car is **usually** not said; in American English it is. Both are correct." | In English /ɹ/ the sides of the tongue touch the upper side teeth. Only the tip stays free. Some British accents (Scottish, West Country) are rhotic. The Arabic ر is an alveolar tap/trill. |
| arabicBridge p (en + ar) | پ (ب with three dots) | … three dots **underneath** / من تحتها | Precision: پ has its dots below. |
| arabicBridge f/v (en + ar) | ڤ (ف with three dots) | … three dots **on top** / من فوقها | Precision. |
| arabicBridge g (en + ar) | "Egyptians say ج as g" / المصريون ينطقون الجيم g | "In Cairo and much of Egypt ج is said as g" / في القاهرة ومعظم مصر | Upper Egyptian (Sa'idi) Arabic generally does not use g for ج. The dialect claim was over-general. The Gulf ق = g claim stays ("often"). |
| arabicBridge r (en + ar) | "English r does not touch anything" | "In English r the tongue tip touches nothing: tip up and pulled back …" | Same accuracy fix as fact 5. |
| arabicBridge o/u (en + ar) | "o in hot: mouth open and lips round"; Arabic لا أحد منهما ضمة | "mouth wide open (lips a little round in British English, an open 'ah' in American English)"; Arabic لكنّ أيّاً منهما ليس ضمة | Accent note: British /ɒ/ is rounded, American /ɑ/ is not. "لا أحد منهما" is unidiomatic for things. |
| commonErrors (pall) | practising | practicing | American spelling. |
| commonErrors (rrred) | "English r never touches" | "The tip of English r touches nothing" | Accuracy. |
| commonErrors (hot/hut) | "Both o and u are heard as damma. Round O rounds the lips; Grumpy U keeps them relaxed." | "Both letters are often read as damma. Round O opens the jaw wide (round lips in British English); Grumpy U is short and relaxed, lips not round." | Hedged and true for both accents. |
| stage 1 teacherSaysAr | و E السريعة | و E السريع | Quick E is "he" (consistent with the Bonus 1 review). |
| stage 2 studentsDo[2] | "the mouth does not move differently" | "the mouth looks the same for both" | Natural English. |
| stage 3 teacherSays[1] | In Egypt ج says g | In Egyptian Arabic, ج says g | Labelled as dialect. |
| stage 3 teacherSaysAr[0] | في العربية ت ود، س وز، ك و g … | في العربية التاء والدال، والسين والزاي، والكاف وصوت g … | Letters joined to و ("ت ود") read badly; spelled out. |
| stages 4, 6, homework (Arabic) | P النفّاخة / O المستديرة متفاجئة: فمها / U المتذمّرة تقول | P النفّاخ يطفئ / O المستدير متفاجئ: فمه / U المتذمّر يقول (all 7 occurrences, including nameAr and exercise instructionsAr) | Puffy P, Round O and Grumpy U are "he" in the English. Bouncy B ("she") stays B القافزة. |
| stage 4 studentsDo[3] | "Say pizza, pink, apple, peas with a strong puff." | "Say pizza, pink and peas with a strong puff, then apple (p in the middle: lips close, no buzz, only a small puff)." | The p in apple starts an unstressed syllable, so it is barely aspirated. Asking for a strong puff was phonetically wrong. |
| stage 4 tips[0] | (end sounds by ear) | + "A clue: the vowel is a little longer before b (cab) than before p (cap)." | True (pre-fortis clipping), and it gives the teacher a real cue for the cap/cab items. |
| stage 5 teacherSays[3] | sev-en, e-lev-en, twel-ve, fi-ve | sev-en, e-lev-en, twelve, five | twelve and five have one syllable. The split taught the final silent e as a sound. |
| stage 5 tips[1], teacherNotes[1] | practised | practiced | American spelling. |
| stage 6 teacherSays[1] | a short, lazy 'uh' | a short, relaxed 'uh' | "Lazy" is Lazy A's name; it would confuse the two characters. |
| stage 6 teacherSays[4] | the tongue pulls back and touches nothing | the tongue tip pulls back … | Accuracy. |
| stage 6 tips[0] | "British o in hot has rounded lips; American o is more open, like 'ah'." | + "with no rounding" and "If you use the American o, skip the 'round lips' mirror check and contrast a wide-open jaw (hot) with a short, relaxed 'uh' (hut)." | The "round lips" mirror check fails for teachers with an American accent. |
| stage 6 tips[1] | Round O … but with round lips | … with round lips in British English | Accent note. |
| stage 6 tips[2] | "never ask children to 'roll' or 'not roll' in words they cannot feel" | "'don't roll it' is hard for a child to follow. Let them feel the difference instead: tap ر, then pull the tongue tip back for r." | Unclear sentence rewritten. |
| stage 7 studentsDo[3] | favourite | favorite | American spelling. |
| stage 8 teacherSays[0] | Write the sound you hear | Write the letter for the sound you hear | Children write letters (matches exitTicket instructions). |
| differentiation.challenge[1] | (pin: the puff disappears after s.) | (pin: after s the puff almost disappears.) | Matches fact 4. Some aspiration can remain. |

**Verified correct, no change (B2):** p/b, t/d, k/g, f/v, s/z are voiceless/voiced pairs with the same place of articulation. Voiced = b d g v z m n + all vowels. Aspiration after word-initial p t k, reduced after s (spin). The vocal folds vibrate hundreds of times per second (children's F0 is about 250-300 Hz, so "your" voice is right). Standard Arabic has no /p/ or /v/, and has ب ف ت د س ز ك. Persian/Urdu پ; ڤ for v (ڤيتامين). Gulf ق = g (often). English lacks ع ح خ ض ق. Damma is close to the u in put. All answer keys: sort 10/10, p/b 10/10, f/v 8/8, o/u 10/10, which-word 8/8, exit ticket 5/5. All minimal pairs are real minimal pairs (pin/bin, pig/big, pat/bat, pet/bet, cap/cab, fan/van, hot/hut, cot/cut, dog/dug, not/nut, lock/luck). The tap/dab challenge changes two sounds on purpose ("Which sounds change?"). Vocab: pizza, apple (L7), peas, fish (L8), pink, red (L6), eleven, twelve (L5). Minutes 4+9+6+9+7+10+9+6 = 60. Lazy A / Quick E / Smiley I gestures and the Vowel Elevator match Bonus 1.

---

## Bonus Class 3 — Blending Builders: Sounds Into Words

| Field / location | Before | After | Reason |
|---|---|---|---|
| bigIdea en + ar | "English writes every vowel"; Arabic والكتابة … الإنجليزية تكتب كل حركة | "English writes its vowels as letters"; والتهجئة (الكتابة) … تكتب الحركات حروفاً | "Every vowel" is an overclaim (Bonus 1 review made the same fix). "Spelling" is translated as التهجئة. |
| objectives[3] en + ar | "explain why English always writes the vowel and Arabic often does not" | "explain why the vowel letter matters: English writes it, and Arabic often leaves short vowels out" | Same overclaim. The new wording is also a better objective (the reason is reading, not history). |
| keyTerms "sound box" ar | صندوق الصوت | صناديق الأصوات (صندوق لكل صوت) | Bonus 2 uses صندوق الصوت for the voice box (larynx). Two meanings in two classes would clash. |
| keyTerms "CVC word" ar | كلمة ساكن-حركة-ساكن | كلمة صامت-حركة-صامت | Consonant = صامت (Bonus 1 convention). ساكن means "with sukun". |
| fact 1 en + ar | "Linguists find the bricks of a language exactly like this." | "Linguists use this same trick to find the bricks of a language." | The minimal-pair test is a real method, but "exactly" overstated it. |
| fact 5 en | "(the same family as Arabic أ ب) and added letters for vowels" | "(from the same family as Arabic أ ب) and used some of them for vowels" | The Greeks reused Phoenician consonant letters (aleph → alpha) as vowels. They did not simply add new ones. |
| fact 5 ar | الكتابة العربية «أبجدية» … الحروف الساكنة … وأضافوا حروفاً للحركات | يسمّي العلماء الكتابة العربية «أبجد» (abjad) … الحروف الصامتة … واستعملوا بعضها للحركات | In Arabic, «أبجدية» just means "alphabet", so the sentence said nothing. "Abjad" is the technical term. Terminology and history fixed. |
| arabicBridge[0] en + ar | "In everyday Arabic the short vowels are not written … In English the vowel is always a letter" | "… are usually not written … (children's books and the Quran do show them). In English the vowel is written as a letter inside the word." | Accurate. Children meet harakat in school books and the Mushaf. "Always" removed. |
| arabicBridge[1] en + ar | "so English writes it and you must read it" | "English writes the vowel, so you must read it." | Removed an implied false cause (English does not write vowels *because* of ambiguity). |
| commonErrors (direction) | "pit (for tip), dog read as 'god'" / right "tip, dog" | "pit (for tip), nap (for pan)" / "tip, pan" | Sensitivity: "god" as a reading error is not suitable for Muslim/Christian families. nap/pan shows the same reversal. |
| stage 1 purpose | Practise | Practice | American spelling. |
| stage 2 teacherSays[2] | "Why? Because c and k together make one sound, so they live …" | "Why? c and k together make one sound, so they live …" | "Because … so" is ungrammatical. |
| stage 3 teacherSays[2] | "That is why English never hides the vowel. It is always there, in the middle of the word, as a full letter." | "English does not hide the vowel like that. In words like cat, hot and sun it is always there, in the middle, as a full letter." | Removed the false cause. "In the middle" is true only for CVC words (up, egg). |
| stage 3 teacherSays[4] | "added vowel letters" | "used some of them for vowels" | Same as fact 5. |
| stage 3 teacherSaysAr[0] | فتكتب الحركة دائماً | فتكتب الحركة حرفاً | Same overclaim. |
| stage 3 exercise p_t | pat, pet, pit, pot | + "(put is a word too, but its u is not Grumpy U)" | Answer key must cover every real word a child can give. |
| stage 3 exercise c_p | cap, cup | + "(cop is a word too)" | Same. |
| stage 3 tips[0] | bog, bid and bud are bonus words | + cop; + how to handle put | Matches the key. |
| stage 4 teacherSays[2] | b-e-d... bbed... bed! | b-e-d... be-d... bed! | b is a stop and cannot be stretched ("bbed" contradicts the line itself). |
| stage 4 studentsDo[2] | 'Dad has a hot cup.' | 'Dad got a hot cup.' | In "has", s says /z/, so it is not decodable with what has been taught. The teacher note says all words are decodable. |
| stage 4 tips[2] | "watch the slide arrow rather than your arm; their self-view may be mirrored" | Children use their RIGHT arm (tap with the left hand) so shoulder → wrist goes left to right; the teacher uses the LEFT arm so it looks left to right on screen | With the left arm (the usual default) the child's tap goes right to left, the exact habit Arabic readers must unlearn. |
| stage 4 studentsDo[0] | Arm-tap each word | Arm-tap each word on the right arm | Same. |
| stage 5 tips[2] | "Accept 'k' for the cup sound only if the child hears it right; then show …" | "If a child writes k for the first sound of cup, praise the hearing (the sound is right), then show that cup is spelled with c …" | Original was unclear. |
| stage 6 tips[0] | "are the hardest; they are exactly where Arabic speakers need practice" | "are usually the hardest, and they are where Arabic speakers need the most practice" | Hedged. |
| stage 8 studentsDo[1] | 'b-y-e!' | 'b-ye!' (2 sounds) | Robot talk is sounds, not letters: bye = /b/ + /aɪ/. |
| assessment.successCriteria[3] | why English writes every vowel | why the vowel letter matters | Matches the new objective. |
| teacherNotes[0] | (all words decodable …) | + "Only the challenge puzzle uses x (ox), which is not taught yet." | Honest note. |
| teacherNotes[3] | tricky words that cannot be blended (the, was, said) | tricky words with a part that cannot be blended | s and d in said do blend (matches Bonus 4's heart-word method). |

**Verified correct, no change (B3):** Phoneme counts: cat 3, up 2, duck 3 (4 letters), sun 3, egg 2 (3 letters), bell 3 (4 letters), on 2, sock 3 (4 letters). Sound boxes: c|u|p, h|a|t, b|e|d, s|u|n, d|o|g, f|a|n, d|u|ck, r|e|d. Sound chain cat→cap→map→mop→hop→hot→hut→hug→bug→bun→sun: each step changes exactly one sound and gives a real word. Missing-vowel sets: h_t 4, b_g 5, b_d 4, s_t 3. Oral blending 6/6, read-and-blend 10/10, dictation 6/6. Challenge words frog, lamp, stop each have 4 sounds; ox has 3 sounds (o-k-s). Stretchy (continuants) vs bouncy (stops p b t d k g). English has about 44 phonemes and 26 letters (with "about"). MSA has 28 consonants + 3 short + 3 long vowels (about 34). Abjad. Phoenician → Greek; alpha/beta ← aleph/beth, cognate with ألف/باء; "distant cousins". كتب = كَتَبَ/كُتُب/كُتِبَ. ck never starts a word. Decodability: every class word uses the letters taught by Lesson 11. Minutes 5+9+7+10+10+9+5+5 = 60.

---

## Bonus Class 4 — Tricky Words and Sentence Rules

| Field / location | Before | After | Reason |
|---|---|---|---|
| Whole file (bigIdea, objective 4, keyTerm, bridge, errors, materials, stages 5-8, guided-writing keys, homework): 16 places | full stop / Full stop / full stops | period / Period / periods; key term now "period", meaning adds "(In British English it is called a full stop.)" | The course uses American English (Mom, color). An American-English course should teach the American term. Owner may reverse (see open questions). |
| objectives[0] en + ar | "English spelling is very old" / لأن تهجئة الإنجليزية قديمة جداً | "many English spellings are very old" / لأن كثيراً من التهجئات الإنجليزية قديمة جداً | Hedged: most English spellings are regular. The class itself says so. |
| fact 1 en + ar | "Long ago people said every letter." | "Long ago, people said almost every letter they wrote." / كل حرف تقريباً | Old/Middle English spelling was close to the sounds, not perfectly. |
| fact 2 en + ar | "More than 1,000 years ago people really said the k: 'k-nee-f'." | "Hundreds of years ago people really said the k: 'k-neef'. The k sound slowly disappeared (it was gone by about 300 years ago) …" | knife (cnīf) is first recorded around 1100, so "more than 1,000 years" is borderline. The k was lost in the 1600s. 'k-neef' is one syllable. |
| fact 4 en + ar | "Printers later used y in its place, so 'Ye Olde Shop' on old signs really means 'The Old Shop'." | "Early printers had no þ in their type, so they used y, which looked a bit like it. That is why 'Ye Olde Shop' on old-style signs is really read 'The Old Shop'." | Gives the real reason (no þ in the imported type; þ looked like y in late handwriting). "Ye Olde" signs are mostly modern imitations, and "ye" was always read "the". |
| fact 5 en + ar | "About 100 words make up roughly half of everything we read" | "About 100 very common words make up roughly half of all the words we read" | The corpus figure (about 100 most frequent words ≈ 50% of running words in written English) counts word tokens, not "everything". Hedges kept. |
| arabicBridge capitals en + ar | "its letters change shape by their place in the word instead" / بل تتغيّر | "… and its letters change shape …" / وتتغيّر | Letter shapes by position do not do the job of capitals, so "instead" implied a false equivalence. |
| arabicBridge ? and , ar | علامة الاستفهام والفاصلة فيها مقلوبتان | تتّجه علامة الاستفهام والفاصلة فيها إلى الجهة الأخرى | ؟ is mirrored (معكوسة), not upside down (مقلوبة). Wording now matches the English "face the other way". |
| commonErrors (said/was) right | was = woz | was = woz (or wuz) | American /wʌz/; matches the stage 3 tip. |
| commonErrors (ze/de) why | "Saying ذ as z or d, as in some spoken dialects." | "Saying the ذ sound as z or d, as happens in some spoken Arabic dialects (for example Egyptian)." | Labelled dialect, no ranking. |
| stage 1 studentsDo[0] | blend 4 decodable words | 3 | The teacher line has 3 (hot, cat, run). |
| stage 1 tips[0] | "('sa-id? Who is Sa-id?')" | "('sa-id? Is that a word? No!') … Some children may read said like the Arabic name سعيد: praise the logic, then show the heart part. Do not joke about anyone's name." | Sensitivity: Saeed/Said is a common name in the class's families. The joke could single out a child. |
| stage 2 teacherSays[0] + ar | said every letter; 'k-nee-f' | said almost every letter; 'k-neef' | Same as facts 1-2. |
| stage 2 teacherSays[3] | "Old signs say 'Ye Olde Shop' … þ was printed like y." | "Some old-style shop signs say … The old letter þ (thorn) was printed as y." | Same as fact 4. |
| stage 2 exercise item 8 | box (blend it) | bed (blend it) | x is not taught in Level 1, so "box" was not clearly decodable for these children. |
| stage 2 tips[0] | the big vowel change | the Great Vowel Shift, about 1400 to 1700 | Gives the teacher the real term. |
| stage 3 teacherSays[2] | "e is short and lazy: 'thuh'" | "e says a short, relaxed 'uh', like Grumpy U: 'thuh'" | "Lazy" belongs to Lazy A; schwa is close to Grumpy U. |
| stage 3 teacherSays[5] | "you: the whole word is tricky. Learn it like a picture: y-o-u." | "you: y is normal, like in yellow. ou is tricky: it says oo. Put the heart over ou." | The heart-word method marks only the irregular part. y = /j/ is regular (yellow, L6). |
| stage 3 exercise "you" | the whole word | ou (says oo) | Same. |
| stage 3 tips[2] | "Gulf children usually say ذ naturally …; Egyptian children know it from Quran recitation and fusha." | "most Gulf dialects keep ذ in everyday speech; Egyptian children know it from Standard Arabic (fusha) at school and, for many, from Quran recitation." | Accurate dialect statement. Not every Egyptian family is Muslim (Coptic families), so it is hedged and respectful. |
| stage 3 teacherSaysAr[0] | E السريعة … نحفظه بالقلب | E السريع … نحفظه عن ظهر قلب | Quick E is "he"; correct idiom for "learn by heart". |
| stage 4 name + nameAr | Flash, Snap and Look-Say-Cover-Write / الوميض والمطابقة | Flash, Fill the Gap and Look-Say-Cover-Write / الوميض وأكمل الفراغ | No Snap game exists in the stage; the third activity is fill-the-gap. |
| stage 4 instructionsAr | (no word bank) | اختر من بنك الكلمات … | Matches the English. |
| stage 4 item 2 | Can ___ swim? | Can ___ swim? Yes, I can. | "he" (in the bank) also fitted. The answer line makes "you" the only answer. |
| stage 4 item 4 | Mom ___, 'Sit down.' | Mom ___, "Sit down." | American quotation marks. |
| stage 4 item 5 | (it is my dog) | (It is my dog.) | Capital and period in a class about sentence rules. |
| stage 4 item 8 | Where is ___ ball? → the | ___ sun is hot. → The | "my" (in the bank) also fitted. |
| stage 4 tips[0] | two answers start a sentence (My, He) | three … (My, He, The) | Matches the new item. |
| stage 5 teacherSays[1] | "Instead, Arabic letters change shape: ب ـبـ ـب." | "But Arabic letters change shape by their place in the word: بـ ـبـ ـب." | Correct initial/medial/final forms (the first was the isolated form). Same "instead" fix as the bridge. |
| stage 5 teacherSays[2] | "its question mark faces left" | "its question mark is flipped, like in a mirror" | "Faces left" is ambiguous. ؟ is the mirror image of ?. |
| stage 5 nameAr | و? و؟ | و ? و ؟ | House rule: space after و before Latin. |
| stage 6 teacherSaysAr[0] | قف طويلاً | قف منتصباً | Natural Arabic for "stand tall". |
| stage 6 tips[1] | "Questions in Level 1 start with Can, Where, What, How: if the sentence starts with one of these, it needs a question mark." | "Level 1 questions usually start with Can, Where, What or How. Ask 'Is this sentence asking something?' If yes, it needs a question mark." | The old rule was false ("What a big dog!", "How nice!") and taught a surface trick. |
| stage 7 item 6 | He said, '___' | He said, "___" (key: He said, "I can run.") | American quotation marks. |
| stage 8 teacherSays[1] + ar | "Old signs in England say …; printers used y" / اللافتات القديمة … تقول … ye تعني the | "Some old-style signs …; early printers used y" / بعض اللافتات ذات الطراز القديم … ye هي في الحقيقة the | Same as fact 4. |
| homework en + ar | "with capitals, spaces and full stops" | "… periods or question marks (one must be a question)" | Task 3 asks for a question, so the summary contradicted it. |
| teacherNotes[2] | "knife had a pronounced k in Old English (cnif); … þ was replaced by y …" | Full note: cnīf (late OE, from Old Norse), k said until about the 1600s; Caxton's first press in England 1476; Great Vowel Shift about 1400-1700; type without þ; "ye" always read "the"; most "Ye Olde" signs are modern imitations | Gives the teacher the accurate detail behind the simplified story. |

**Verified correct, no change (B4):** Caxton brought printing to England in 1476 (Westminster). Spelling fixed gradually while vowels kept changing (GVS). Thorn þ for "the" and its replacement by y. About 100 words ≈ half of running text (hedged). Arabic has no capitals. ؟ is mirrored and ، is turned. Harakat are usually unwritten (B3). Arabic tricky spellings: هذا/لكن (long ā not written, dagger alif), الشمس (sun-letter ل written, not said), عمرو (silent و). English th in the/this/that = ذ /ð/. Words almost never end in v (have, give: silent e). of: f = /v/. come: o = /ʌ/. Heart parts: said ai = /e/, was a = /ɒ/ (or /ʌ/) and s = /z/, to o = /uː/, he e = /iː/, go o = /oʊ/, my y = /aɪ/, have final e silent. Sorting 8/8 and sentence-doctor 8/8 correct, each with one fix-set. Exit ticket 5/5. The 8 objective tricky words = word bank = homework cards. Lessons 13-16 content (days, can, in/on/under, pets) matches builtOn; group 7 sight words I, the, a, to, go. Minutes 5+9+10+8+7+9+7+5 = 60.

---

## Could not verify / for the owner or a native speaker

1. **"period" vs "full stop" (Bonus 4).** I switched to the American term to match the course's American English, with "full stop" given as the British name in the key term. Many Gulf schools follow British curricula and say "full stop". Pre-A Bonus 4 and Level 4 still say "full stop". The owner should choose one term for all levels.
2. **Phonics hub (not in my scope):** `phonics-hub/level1.json` gives o as "كصوت الضمة القصيرة" and u as "كصوت الضمة القصيرة". Bonus 2 teaches that neither is damma. Recommend fixing the hub (o in hot ≈ open 'آ'/rounded, u in hut ≈ short relaxed 'أَ'). Otherwise parents see two conflicting explanations.
3. **Accent of the teacher/recordings for o in hot.** The plan now covers both British (rounded) and American (unrounded "ah"), but the owner should confirm which accent the slides' audio will use, so the "Round O" mirror check matches.
4. **Gulf dialect detail:** "in the Gulf ق is often g" and "most Gulf dialects keep ذ" are true for Kuwaiti, Saudi (Najdi), Emirati, Qatari and Omani speech. Some urban or other varieties differ. A Gulf native speaker could confirm the wording reads naturally.
5. **ڤ vs ڥ:** ڤ (three dots above) is used for v in the Levant, the Gulf and Iraq. Moroccan/Algerian usage is ڥ (three dots below). Fine for Gulf/Egypt families as written.
6. **Arabic character names in Bonus 2** were changed to masculine for Puffy P, Round O and Grumpy U to follow the Bonus 1 rule (Arabic gender = English pronoun). If the owner prefers all letters feminine in Arabic, Bonus 1 and Bonus 2 should be changed together.
