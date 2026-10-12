# Level 6 Bonus Classes: academic review log (12 Oct 2026)

Scope: `bonus-classes/level6/bonus01.json` .. `bonus04.json` (ages 13-15, strand "English in the World").
Context checked: `_docs/bonus-classes-plan.md`, `lessons/level6/lesson01-16.json`, `grammar-hub/level6.json`.
All files rewritten with `json.dump(..., ensure_ascii=False, indent=2) + "\n"` (this also expands the old one-line objects; content is otherwise unchanged except as logged).
`python3 gen_bonus_plans.py --check` -> "28 bonus classes OK". Stage minutes unchanged (all four = 60). No Latin letters glued to Arabic و/ب.

---

## Bonus 1: Does English Have a Future Tense?

| Field / location | Before | After | Reason |
|---|---|---|---|
| bigIdea / bigIdeaAr | "English verbs have no future ending; English talks about..." | adds "(that is why many linguists say English has no future tense)" | Present "no future tense" as a linguists' view based on inflection, not dogma. |
| keyTerms "tense" meaning | "A change in the form of the verb itself..." | "In the strict linguistic sense: ... (Many school grammars use 'tense' more loosely.)" | Same: the definition is one school's. |
| linguisticsCorner fact 2 (en/ar) | "that French ending comes from the Latin verb 'have' (parler + ai...)"; AR "فعل 'يملك' في اللاتينية" | "these endings come from the Latin verb habere, 'to have': French parler + ai ('I have'), roughly 'I have to speak'" + matching AR | More precise: Romance futures (Spanish and French) come from infinitive + habere; names the verb. |
| fact 3 (en/ar) | "Others call will + verb 'the future tense'." | "Many school grammars and some linguists call will + verb 'the future tense'." | Fair description of the other side. |
| fact 4 | "'Going to' first meant real walking"; "Slowly it became..." | "real movement"; "Slowly, over a few hundred years, ..." | Accuracy (motion, not only walking); time scale. |
| fact 5 (en/ar) | "Some Arab grammarians say سـ is a short form of سوف. In Levantine Arabic, رح comes from رايح ... Egyptian هـ ... exactly the English 'going to' story! Many Gulf dialects use بـ" | Kufan vs Basran views named; رح "is usually traced to" رايح; Egyptian future prefix هـ / حـ (هروح، حروح) traced "by many linguists"; "very like" (not "exactly"); Gulf بـ and also راح; warning that in Egyptian/Levantine بـ (بروح) is usually present, not future | Hedge origin claims; complete dialect labelling (حـ variant, Gulf راح); prevent the false transfer "بروح = future" for Egyptian/Levantine students. |
| arabicBridge row 4 (en/ar) | "present simple only for timetables" | "mainly for timetables and schedules" | Overstated (present simple also in time clauses etc.). |
| arabicBridge row 5 arabic / point / pointAr | "هـ / رح / بـ في اللهجات"; "dialects shorten سوف and رايح" | "هـ / حـ (مصري)، رح (شامي)، بـ / راح (خليجي)"; dialects "use short future markers such as رح and هـ / حـ (probably from رايح)" | Dialects do not shorten سوف; labels added. |
| commonErrors #3 why | "present simple is only for timetables" | "mainly for timetables and schedules" | As above. |
| commonErrors #5 why | "English prefers going to. will is for opinions..." | "Not impossible, but ... strongly prefers going to. will is more typical for opinions..." | "It will rain" with evidence is not ungrammatical. |
| materials, stage 1 name/nameAr/teacherSays/teacherSaysAr/studentsDo, stage 6 name/nameAr/teacherSays, toolbox icon | "Lumi the Fortune Teller", "Crystal Ball", "قارئة المستقبل", "كرة لومي السحرية", "I see... you will..." | "Lumi's Future Forecast" (TV-style forecaster), "Forecast Studio", "نشرة لومي للمستقبل", "My forecast: I think you will..."; forecast-screen icon for will | Sensitivity: fortune-telling (عرافة/كهانة) is religiously objectionable for many Gulf/Egyptian families. Activity and language practice unchanged. |
| stage 1 teacherSays line 2 | "the person on your right" | "the next person in our group list" | Online class on Teams: there is no "right". |
| stage 1 teacherSays line 1 | Omar/Sara/Noor predictions | Sara's and Noor's lines now reflect a known plan / calendar ("you told me...", "It's in your calendar!") | A forecaster cannot know someone's arrangement; keeps going to / present continuous meanings honest. |
| stage 2 sort item "is walking tomorrow" | "helper (is) + time word (tomorrow)" | "separate helper word (is) + time word (tomorrow); the -ing alone does not mean future" | Item must fit one of the two sort categories. |
| stage 3 translate items 3 and 8 + tip | item 3 only present continuous; tip only for item 8 | both items accept present continuous or going to; tip covers both | Two defensible answers. |
| stage 4 choose-and-justify items 2, 4, 8, 9, 10 + tip | single answers | adds "also accept" (is going to travel / is joining / are going to host / is going to be / is going to meet); tip points to key | Two defensible answers in each. |
| stage 5 error item 3 answer | "Tomorrow I'm going to the dentist at 10." | adds "/ Tomorrow I'm going to go to the dentist at 10." | Second correct answer. |
| stage 5 tips | note on item 8 only | adds note that item 5 ("It will crash!") is a strong preference, not a hard error | Answer-key honesty. |
| stage 7 Did you know (en) | Mandarin uses "time words" | "time words ... and small helper words" | Mandarin also uses aspect particles (了, 过...). |
| stage 3 teacherSays line 4 | "رح comes from رايح ... Same idea, two languages!" | "Levantine رح probably comes from رايح ... A very similar idea..." | Hedge + dialect label. |
| exitTicket items 2, 3, 4 | "'m meeting" / "is going to join" / "will be" | add also-accept: 'm going to meet / 's joining / 's going to be | Two defensible answers. |
| teacherNotes last | "modal verbs (must, have to)" | "the modal must and ... have to (which behaves like a normal verb)" | Consistency with Bonus 2 (have to is not a true modal). |

Verified correct, no change: English inflects only for present and past; Spanish hablaré / French parlerai; Old English willan 'want' (free will, willing); going to > gonna as grammaticalization; gonna only before a verb; لن + منصوب; will/won't + base verb; "probably won't" vs "will probably" word order; won't /woʊnt/ rhymes with don't; Arabic has no present-tense copula (I going to); "I don't think it will" more natural than "I think it won't"; Mandarin has no tense inflection; sentence-builder answers; Lesson 1-4 / Lesson 8 links.

---

## Bonus 2: The Language of Rules

| Field / location | Before | After | Reason |
|---|---|---|---|
| keyTerms "prohibition" ar | "منع / تحريم" | "منع / حظر" | تحريم has a religious sense; not the right term for school/traffic rules. |
| linguisticsCorner fact 1 (en/ar) | "no -ing or past form" | "no -ing or -ed forms" | Contradicted fact 3 (could/would/should/might are old past forms). |
| fact 2 (en/ar) | "have to is NOT a modal" | "not a true modal (some grammars call it a 'semi-modal')" | Terminology varies; avoid an absolute claim. |
| fact 5 | "an old word meaning 'body, shape'" | "an old Germanic word..." | Precision (Proto-Germanic *līka-). |
| arabicBridge row 2 point / pointAr | "لا يجب ... That is fine in Arabic" | everyday لا يجب very often means "mustn't"; some careful MSA writers prefer يجب ألّا because literally لا يجب can mean "not necessary"; usage is debated | State the لا يجب question carefully as requested. |
| arabicBridge row 3 arabic / point / pointAr | "لست مضطراً أن تأتي"; dialect forms unlabelled; "Translating لا يجب word by word into 'don't have to' (or the reverse)..." | "لستَ مضطراً إلى أن تأتي"; "مش لازم (مصري) / مو لازم (خليجي)"; the trap now explains both directions: لا يجب looks like "don't have to", and مش لازم / مو لازم looks like "not must" = mustn't | Arabic: اضطُرّ takes إلى; dialect labels; the old explanation did not explain the most common real source of the error (لازم = must). |
| arabicBridge row 5 point / pointAr | "جيداً works as an adverb" / "جيداً تعمل ظرفاً" | "does the job of an English adverb" / "تؤدي هنا معنى الظرف الإنجليزي" | In Arabic grammar جيداً is not a ظرف (it is نائب عن المفعول المطلق / حال). |
| commonErrors #1 why | "The لا يجب trap" | "The لا يجب / مش لازم trap" | Matches the corrected explanation. |
| Warm-up true/false item 1 answer | "True (since 1992; only medical gum is allowed)" | "True (sale has been banned since 1992; since 2004 only therapeutic gum, such as nicotine gum, can be sold by pharmacists)" | Precise and current. |
| item 2 prompt (teacherSays + exercise) and answer | "adults have to vote"; "True (voting is compulsory)" | "adult citizens"; "compulsory for adult citizens in federal elections since 1924; people who don't vote can get a small fine" | Accuracy (citizens only, federal elections). |
| item 4 answer | "True (since 2008)" | "True (it is banned, and people who do it can be fined)" | The exact start date and area of the Venice ban changed in stages; the date was removed rather than risk an error. |
| item 6 answer | "school lunch is free" | "in Finland, school lunch has been free in basic education for decades" | Precise (free since 1948 in basic education). |
| stage 3 teacherSays line 1 | Sara wants to say "لا يجب أن تأتي، لا مشكلة" and says "You mustn't come!" | Sara thinks "مش لازم تيجي، عادي" ... "لازم = must, مش = not, so she says: 'You mustn't come!'" | In everyday Arabic لا يجب means "forbidden", so the old scene was not a convincing source of the error; the dialect literal translation is. |
| stage 3 teacherSays line 4 | "Some people use 'لا يجب' for both meanings, so it can't guide you." | "So Arabic words can't guide you word by word: 'مش لازم' means 'not necessary', but 'لا يجب' is usually used for 'forbidden'." | Consistent with the bridge. |
| stage 3 teacherSays/teacherSaysAr | "لست مضطراً" | "لستَ مضطراً" | Vowel on the ت for clarity (2nd person). |
| stage 3 translate prompts 2, 3, 7, 8 | "لست مضطراً أن تدفع، الدخول مجاني." / unlabelled dialect / "اضطررت أن أذاكر..." | "لستَ مضطراً إلى أن تدفع، فالدخول مجاني." / "(مصري) مش لازم..." / "اضطُررتُ إلى المذاكرة..." / "(خليجي) مو لازم..." | Arabic grammar (اضطُرّ إلى); dialect lines labelled. |
| stage 3 tips | "مش لازم، مو لازم، مب لازم: they map neatly onto don't have to"; "say it is ambiguous" | labelled Egyptian/Gulf; the meaning maps onto don't have to but word by word they look like "not must"; لا يجب usually means "forbidden" in everyday use, some MSA purists prefer يجب ألّا | Accuracy + consistency. |
| stage 4 gap-fill item 7 prompt + answer | "...so he ___ shake hands with the referee." -> "has to" | prompt adds "It's the rule."; answer "has to / must" | must is also correct (instructions allow it). |
| stage 5 teacherSays pairs | "... basic - basically, full - fully." | "... basic - basically, careful - carefully." | full -> fully is not covered by any of the four rules given. |
| stage 5 Rule 3 | "-le: drop e, + y" | "consonant + -le: drop the e, add y" | Precise rule (whole -> wholly is not this rule). |
| stage 5 tips | "true - truly and whole - wholly" | adds "full - fully" | Moved here as an extra exception. |
| differentiation support | dialect forms unlabelled | "(Egyptian) / (Gulf)" | Dialect labelling. |
| teacherNotes #3 | "لا يجب is widely used for prohibition, and that is normal Arabic usage" | everyday use = prohibition; in careful MSA its use is debated (some prefer يجب ألّا); do not judge either side | As requested: state carefully. |

Verified correct, no change: the modal list and behaviour; had to as past of must; OE motan 'may, be allowed to', past moste > must; could/would/should/might as old past forms; deontic vs epistemic must and the parallel with لا بد أن / لا بد أنك; -ly < OE -lice; must vs have to as a tendency (have to far more frequent in speech, especially in American English); all rule-scale items; all adverb answers (carefully, easily, gently, patiently, basically, happily, accurately, terribly, publicly = the exception, well, fast, hard; hardly = almost not); late/lately and hard/hardly; Singapore, Australia, Japan, UK, Finland facts as revised.

---

## Bonus 3: Where English Words Come From

| Field / location | Before | After | Reason |
|---|---|---|---|
| linguisticsCorner fact 2 (en/ar) | Persian "is related to English, not to Arabic" / "قريبة من الإنجليزية" | "a distant relative of English (both are Indo-European)" / "من أقارب الإنجليزية البعيدين" | Precision: distant relationship only. |
| fact 3 (en/ar) | "the Angles and Saxons" | "the Angles, Saxons and Jutes" | Completeness. |
| fact 4 (en/ar) | "Counting dictionary words, only about a quarter ... is Germanic; most of the rest is French and Latin ... almost all of the 100 most frequent..." | "One well-known count of a large dictionary found that only about a quarter of its words are Germanic, and more than half come from French and Latin (the exact numbers depend on the word list) ... nearly all of the 100..." | Hedge the percentages (source: Finkenstaedt and Wolff 1973, about 25% Germanic, about 28% French, about 28% Latin). |
| fact 5 (en/ar) | "Persian, which took it from Sanskrit" | "which probably took it from Sanskrit" | Hedge. |
| arabicBridge row 2 arabic | "... أمير البحر" | "... أمير (أمير الـ...)" | admiral comes from amir + the article of titles like "amir al-..."; the exact phrase is not certain. |
| arabicBridge row 2 point / pointAr | "Often the Arabic article al- came with them: algebra, alcohol, algorithm, alchemy." | "usually through other languages. Sometimes the Arabic article al- came with them: algebra, alcohol, alchemy (and algorithm, from the name al-Khwarizmi)." | Most Arabic words did not keep al-; algorithm comes from a name. |
| arabicBridge row 4 (en/ar) | "both borrowed them from Greek" | adds "(Arabic often through Syriac or Aramaic)" | Accurate route for قانون، فلسفة etc. |
| stage 1 story | "...a safari in Kenya, where he saw a giraffe ... question one was zero out of ten!" | "...a safari in Kenya, with a photo of a giraffe ... got zero on the first question!" | Logic (Hamad was reading, not on safari) and natural English. |
| stage 1 tips | "Saturday is from Latin Saturn" | "'Saturn's day', from the Roman god Saturn (Latin Saturnus)" | Precision. |
| stage 2 exercise Maltese answer | "grew from Arabic, written in Latin letters" | "grew from the Arabic of medieval Sicily and Malta, written in Latin letters, with many Italian and English words" | Precision. |
| stage 3 teacherSays layers 3-5 | travel (from travailler) was given in Layer 5 "today", spelled "Travelling"; Layer 4 listed "solution" | travel moved to Layer 3 (Norman French), spelled "Traveling"; "solution" removed; Layer 5 "from about 1600 to today" | travel and solution entered English in the 1300s from French, not in the Renaissance/modern layer; American spelling. |
| stage 3 teacherSaysAr | "travailler أي 'يعمل بجهد'" | "'يكدح / يعمل بجهد'" | Closer to "toil". |
| stage 4 detective answers | coffee, algebra, algorithm, zero, giraffe, admiral, safari | coffee: "via Turkish kahve, then Italian caffè and Dutch koffie"; algorithm: "+ later mixed with Greek arithmos"; zero: "... then French (cipher ... via Latin and French)"; giraffe: "the Arabic word itself probably came from an African language"; admiral: "probably from titles like 'amir al-...'"; safari: "'journey'" | Correct routes and hedges where etymologists are not sure. |
| stage 4 tips extra words | lemon, candy (قند), syrup, arsenal with no routes | lemon via Italian/French (Arabic from Persian); candy قندي / قند via French sucre candi, ultimately Persian, perhaps Sanskrit; syrup via Latin and French; arsenal via Italian (Venice) | Correct routes, hedge the Sanskrit link. |
| stage 5 teacherSays | "With friends: the short Germanic word." | "usually the short Germanic word" | Tendency, not a rule. |
| stage 5 exercise item 9 answer | "Could you assist me? I require more time." | adds "(accept similar formal versions)" | Open rewriting item. |
| stage 5 tips | "فصحى vs عامية is a similar choice, but English mixes the two layers..." | "choosing between فصحى and عامية is also a register choice, but in English the two layers are mixed inside one variety every day" | More careful comparison. |
| stage 7 Did you know (en/ar) | "checkmate from shāh māt ... through Arabic ... you are speaking Persian through Arabic!" | adds "and French"; "Experts disagree whether māt is Persian ('the king is stuck') or Arabic ('the king is dead')"; "speaking Persian and Arabic" | The origin of māt is debated. |
| differentiation challenge 3 | "why does 'coffee' have a different vowel from قهوة? (It changed in Turkish and Italian.)" | "why does 'coffee' sound so different from قهوة? (It changed on the way: Turkish kahve, then Italian caffè and Dutch koffie.)" | Consonants changed too (q > k, w > v > f); route matches the key. |
| teacherNotes #3 | percentages "approximate" | names the count (Finkenstaedt and Wolff 1973) and adds "Do not test the numbers." | Source + honesty. |

Verified correct, no change: Indo-European / West Germanic (German, Dutch, Frisian); Afro-Asiatic / Semitic (Hebrew, Aramaic, Amharic, Maltese); Turkish = Turkic (Arabic script until 1928); Persian pedar/mādar/barādar; Hebrew shalosh, em; Old Norse sky, egg, knife, they, trust, window < vindauga; Norman Conquest 1066, about 300 years of French among the rulers; court, government, manners (< Latin manus), curfew (< couvre-feu "cover fire"); independent and technology (1600s); emoji, tsunami (Japanese), shampoo (Hindi); sugar (Sanskrit > Persian > Arabic > Medieval Latin/Italian > French > English), cotton (قطن via Old French coton), algebra (الجبر, al-Khwarizmi's 9th-century book in Baghdad, Latin translations in Spain; Spanish algebrista = bone-setter), algorithm (al-Khwarizmi), zero and cipher (صفر), alcohol (الكحل), sofa (صُفّة via Turkish and French), magazine (مخازن via Italian magazzino, French magasin; false friend), syrup (شراب), arsenal (دار الصناعة); cow/beef, sheep/mutton, calf/veal, deer/venison (already flagged as simplified, Walter Scott's Ivanhoe noted); buy/purchase, help/assist, ask/inquire, start/commence, need/require, enough/sufficient (each Germanic vs French/Latin); kingly/royal/regal, ask/question/interrogate, rise/mount/ascend; hybrids (affordable, useful, clearly, body language, unreliable, kindly); exit ticket.

---

## Bonus 4: The Art of Persuasion

| Field / location | Before | After | Reason |
|---|---|---|---|
| keyTerms rhetoric | "'public speaker'" | "'public speaker, orator'" | Precision. |
| linguisticsCorner fact 2 (en/ar) | "البلاغة, with three sciences" / "بعلومها الثلاثة"; "علم البيان (images: simile, metaphor)" | "Later scholars divided it into three sciences" / "وقد قسّمها العلماء المتأخرون إلى ثلاثة علوم"; adds "kinaya" | The three-science division came later (al-Sakkaki, al-Qazwini), after al-Jahiz; البيان includes الكناية (already in the AR). |
| fact 3 (en/ar) | "Ibn Rushd's commentary was later translated into Latin and helped Europe rediscover Aristotle." | "Ibn Rushd's commentaries on Aristotle, including the 'Rhetoric', were later translated into Latin and were widely studied in medieval Europe." | "Rediscover" overstates it for the Rhetoric (it was also translated directly from Greek). |
| fact 4 (en/ar) | "often sound rude or childish ... sounds clever" / "فظاً أو طفولياً ... ذكياً" | "can sound rude or careless ... usually sounds more convincing" / "فظاً أو متسرعاً ... أكثر إقناعاً" | Less judgmental, more accurate. |
| fact 5 (en/ar) | "'Veni, vidi, vici'" | "Julius Caesar's 'Veni, vidi, vici'" / "قول يوليوس قيصر" | Attribution. |
| arabicBridge row 1 point / pointAr | "Arab scholars studied Aristotle and built their own rich theory of eloquence" | "scholars writing in Arabic studied Aristotle, and Arabic also has its own rich theory of eloquence (البلاغة)" | al-Farabi was probably not ethnically Arab; البلاغة was not built on Aristotle. |
| arabicBridge row 2 arabic | "إنّ / لقد / بالتأكيد / والله / لا شك أن" | "إنّ / لقد / بالتأكيد / لا شك أن" | Sensitivity: do not present a religious oath as a rhetorical trick. |
| arabicBridge row 4 point / pointAr; commonErrors #1 why | "موافق is an adjective" | "works like an adjective (it is an active participle, اسم فاعل)" / "اسم فاعل يُستعمل كالصفة" | Arabic grammar accuracy. |
| arabicBridge row 5 arabic | "ناقشنا حول المشكلة / ناقشنا المشكلة" | "ناقشنا المشكلة (ويشيع أيضاً: ناقشنا حول المشكلة)" | Shows the standard form first. |
| arabicBridge row 6 (en/ar) | "Arabic writing often links long chains with و; English prefers..." | "traditionally tends to ... English writing tends to prefer..." | Hedge (contrastive-rhetoric claim; teacher note already says it is a tendency). |
| commonErrors #4 right | "That's a fair point, however..." | "That's a fair point, but..." | Comma splice with however. |
| stage 1 teacherSays/teacherSaysAr | "2,300 years ago" | "more than 2,300 years ago" | About 2,350 years (Rhetoric c. 350-330 BC). |
| stage 2 teacherSays line 3 | "Arab philosophers like al-Farabi and Ibn Rushd ... Ibn Rushd's commentary even helped Europe rediscover Aristotle!" | "Philosophers who wrote in Arabic, like al-Farabi and Ibn Rushd, ... Ibn Rushd's commentaries on Aristotle were even translated into Latin and studied all over Europe!" | Accuracy (as above). |
| stage 3 rewrite item 1 answer | "Phones can probably be a big distraction..." | "Phones can be a big distraction for many students. / It seems that phones are often a big distraction for students." | "can probably be" is unnatural. |
| stage 4 teacherSays + rubric item 5 | "I agree partly, however..." | "I agree partly, but..." | Comma splice; "agree partly" kept because it is Lesson 15 vocabulary. |
| stage 4 gap-fill items 5 and 7 + tip | "On the other hand" / "However" | "On the other hand / However" and "However / On the other hand"; tip names the two gaps | Both markers are defensible in both gaps. |
| stage 5 order exercise item 5 | "5 - Example (pathos)" | adds "(sentences 4 and 5 can come in either order)" | Two defensible orders. |
| stage 6 teacherSaysAr | "لست مضطراً أن توافق" | "لستَ مضطراً إلى أن توافق" | Arabic grammar (اضطُرّ إلى). |
| stage 7 Did you know (en/ar) | "simply called him 'The Commentator'" / "سمّوه 'الشارح'" | "often simply called him..." / "كثيراً ما سمّوه 'الشارح'" | Light hedge (true for Aquinas, Dante and the Latin schools generally). |

Verified correct, no change: Aristotle's Rhetoric (4th century BC) and ethos/pathos/logos definitions; al-Jahiz (9th century), al-Bayan wa al-Tabyin; علم المعاني / البيان / البديع definitions (AR); al-Farabi and Ibn Rushd studied and commented on the Rhetoric; Latin translation of Ibn Rushd's Middle Commentary (Hermannus Alemannus, 13th century); Ibn Rushd of Córdoba called "The Commentator"; Veni, vidi, vici; although/but, I agree, discuss + object, on the other hand, in conclusion vs at the end; classify answers (two labels accepted); the WHO "60 minutes a day" for teenagers behind item 4; Malala Yousafzai's 2013 UN speech; fictional FocusTimer statistics already flagged; stage minutes.

---

## Could not verify / owner or native speaker to decide

1. **Fortune-teller theme (Bonus 1).** I replaced "Lumi the Fortune Teller / Crystal Ball / قارئة المستقبل / كرة سحرية" with "Lumi's Future Forecast / Forecast Studio" for religious sensitivity. If the owner thinks a playful crystal ball is fine for this age group, it can be restored (the slides are not built yet).
2. **Gulf future markers.** بـ (بروح، بسير) and راح (راح أروح) are both written as "used by many / some Gulf speakers". A Gulf native speaker should confirm what is normal in the students' own areas (for example, Saudi vs Emirati vs Kuwaiti usage).
3. **Egyptian هـ / حـ < رايح.** This is the usual explanation in the literature, but it is hedged ("many linguists trace"). It is not presented as certain.
4. **لا يجب.** The text now says: everyday usage = prohibition; in careful MSA some prefer يجب ألّا; the question is debated. An Arabic editor may want a different wording for parents.
5. **Venice pigeon ban.** I removed the date "since 2008" because the ban was introduced in stages (St Mark's Square first, later wider areas) and I could not confirm the exact current rule. "Banned, with fines" is safe.
6. **Persuasion homework topic** ("Teenagers should have a part-time job") is unchanged; in some Gulf families this may be unusual for 13-15 year olds, but it is a debate motion, not advice. Owner may prefer another motion.
7. The rewrite of the JSON with `indent=2` expands the formerly one-line objects; this is only formatting.
