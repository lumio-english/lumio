# Academic review — Level 2 "Spelling Detectives" (Bonus Classes 1-4)

Reviewed string by string, 12 Oct 2026: bonus-classes/level2/bonus01.json .. bonus04.json, checked against
_docs/bonus-classes-plan.md, lessons/level2/lesson01-20.json and phonics-hub/level2.json (unit k = lesson 2k-1).
Files rewritten with json.dump(ensure_ascii=False, indent=2), so the git diff also shows reformatting of inline arrays;
content changes are only those listed below. `python3 gen_bonus_plans.py --check` -> "28 bonus classes OK".
Stage minutes unchanged: B1 5+10+8+8+10+10+5+4, B2 5+8+9+10+7+8+8+5, B3 5+8+8+10+8+9+7+5, B4 5+8+8+10+6+12+6+5 = 60 each.

## Corrections

### bonus01.json

| Field / location | Before | After | Reason |
|---|---|---|---|
| linguisticsCorner.facts[0].en | English borrowed the Latin (Roman) alphabet, which has 26 letters. But English has about 44 sounds. | English is written with the Latin (Roman) alphabet, which today has 26 letters. But English has about 44 sounds. | The Latin alphabet of the Romans had only about 23 letters; J, U and W were added much later. 'Which has 26 letters' was true only of the modern alphabet. |
| linguisticsCorner.facts[0].ar | استعارت الإنجليزية الأبجدية اللاتينية ذات الـ26 حرفاً، لكن | تُكتب الإنجليزية بالأبجدية اللاتينية، وفيها اليوم 26 حرفاً، لكن | Same correction in Arabic. |
| linguisticsCorner.facts[1].en | When printing came to England about 550 years ago, the printers' letter sets came from Europe and had no thorn, so they wrote th instead. | Writers were already starting to use th, and when printing came to England about 550 years ago, the printers' letter sets came from Europe and had no thorn. So th won. | ð had mostly gone out of use by about 1300 and th was spreading before Caxton (1476); printing finished thorn off rather than causing the change alone. |
| linguisticsCorner.facts[1].ar | هما þ وð. وعندما وصلت الطباعة إلى إنجلترا قبل نحو 550 سنة، جاءت حروف المطابع من أوروبا بلا هذين الحرفين، فصاروا يكتبون th بدلاً منهما. | هما þ و ð. وكان الكتّاب قد بدأوا يكتبون th، وعندما وصلت الطباعة إلى إنجلترا قبل نحو 550 سنة جاءت حروف المطابع من أوروبا بلا هذين الحرفين، فغلبت كتابة th. | Same correction; also space added in "و ð" (Latin letter after و). |
| linguisticsCorner.facts[2].en | Sometimes printers used y for thorn. That is why old shop signs say 'Ye Olde Shop'. It was never 'ye' - it was 'the'! | By then, handwritten þ looked a lot like y, so printers sometimes used y for it: 'ye' for 'the'. That is why shop signs that want to look old say 'Ye Olde Shop'. The word was always read 'the', not 'ye'! | Gives the real reason (þ and y had come to look alike) and corrects 'old shop signs': most 'Ye Olde' signs are modern imitations (19th-20th c.). |
| linguisticsCorner.facts[2].ar | أحياناً استخدم الطابعون الحرف y مكان thorn، ولهذا نرى لافتات قديمة مكتوب عليها Ye Olde Shop. لم تكن تُقرأ ye أبداً، بل the! | وكان þ المكتوب باليد قد صار يشبه y، فاستخدم الطابعون أحياناً y مكانه: ye بدل the. ولهذا نرى لافتات محلات تريد أن تبدو قديمة مكتوباً عليها Ye Olde Shop. لكن الكلمة كانت تُقرأ the دائماً، لا ye! | Same correction in Arabic. |
| linguisticsCorner.facts[4].en | wh used to be written hw, and people really said h + w. Today most English speakers say just w: what, when, white. | wh used to be written hw (Old English hwæt = what), and people really said h + w. Today most English speakers say just w: what, when, white. Some speakers in Scotland, Ireland and parts of the US still breathe the h. | Accurate but incomplete: the h + w pronunciation survives in some accents; added so the fact is not read as 'nobody says it'. |
| linguisticsCorner.facts[4].ar | أما اليوم فمعظم المتحدثين ينطقونها w فقط: what و when و white. | أما اليوم فمعظم المتحدثين ينطقونها w فقط: what و when و white، وما زال بعض المتحدثين في اسكتلندا وأيرلندا وأجزاء من أمريكا ينطقون h قبلها. | Same addition in Arabic. |
| arabicBridge[3].arabic | ثلاثة ← تلاتة | (عامية مصرية) ثلاثة ← تلاتة | Dialect forms must be labelled as dialect. |
| arabicBridge[3].point | may say 'tink', 'sink' or 'zis'. | may say 'tink', 'sink', 'dis' or 'zis'. | ذ → د gives 'dis'; matches the common-errors list. |
| arabicBridge[3].pointAr | tink أو sink أو zis | tink أو sink أو dis أو zis | Same in Arabic. |
| commonErrors[0].wrong | s-h-i-p read as 's-h-ip' (two sounds) | ship read as s-h-i-p (s and h said as two sounds) | Old wording was confusing (the 'wrong' form looked like the spelling). |
| commonErrors[4].why | After a short vowel at the end of a short word, the k sound is spelled ck. | In a short word, a k sound that comes right after a short vowel at the end is usually spelled ck (duck, back, sock). After a consonant we just write k (milk, pink). | Old rule was garbled (the vowel is not 'at the end'); now states the real condition and the contrast case. |
| stages[0].teacherSays[0] | Good morning, Spelling Detectives! | Hello, Spelling Detectives! | Online classes run at different times of day. |
| stages[4].teacherSays[1] | Hold the tissue in front of your mouth: thhh - the tissue moves. | Hold the tissue close to your mouth: thhh - the tissue moves a little. | The airflow for voiceless th is weak; a tissue held at a distance may not move, and children then think they failed. |
| stages[5].teacherSays[1] | Detective rule: after a short vowel at the end of a short word, we write ck. | Detective rule: at the end of a short word, right after a short vowel, the k sound is spelled ck. | Same ck-rule correction as in common errors. |
| stages[5].teacherSaysAr[1] | قاعدة: بعد حرف متحرك قصير في آخر الكلمة القصيرة نكتب ck. | قاعدة: في آخر الكلمة القصيرة، إذا جاء صوت k مباشرة بعد صوت متحرك قصير نكتبه ck. | Same correction in Arabic. |
| stages[5].teacherSays[2] | And the wh words: what, when, white. Question words love wh! | And the wh words: what, when, white. Many question words start with wh: what, when, where, why! | white is not a question word; the old line implied it was. |
| stages[5].tips (new item) | - | If a child finds who or whose: these wh words say h, not w. English spelling has surprises. | Answers the obvious counter-example to 'wh = و'. |
| stages[5].purpose | Recognise | Recognize | American spelling (as in the lessons). |
| materials.student[1] | coloured | colored | American spelling. |
| stages[1].studentsDo[2] | coloured | colored | American spelling. |
| stages[2].tips[1] | favourite | favorite | American spelling. |
| teacherNotes[0] | recognising | recognizing | American spelling. |
| stages[2].teacherSays[2] | Look at this old sign: Ye Olde Shop. People think it says 'ye'. No! The y was a thorn. | Look at this sign: Ye Olde Shop. People think it says 'ye'. No! The y is really a thorn. | Such signs are mostly modern imitations, not old signs. |
| materials.teacher[3] | Old shop sign photo 'Ye Olde Shop' and the letter þ | Photo of an old-style shop sign 'Ye Olde Shop' and the letter þ | Consistent with the corrected fact (such signs are mostly modern imitations). |

### bonus02.json

| Field / location | Before | After | Reason |
|---|---|---|---|
| titleAr | تجمّعات الحروف الساكنة | تجمّعات الأصوات الصامتة | Consonant = صامت in Arabic linguistics (as fixed in Level 1); ساكن means 'carrying sukun'. |
| bigIdea | Arabic words never start that way | Standard Arabic words never start that way | Some spoken dialects (e.g. Levantine كْتير) do allow initial clusters; the claim holds for Standard (and Egyptian) Arabic. |
| bigIdeaAr | بصوتين ساكنين أو ثلاثة معاً | بصوتين صامتين أو ثلاثة معاً | Term صامت for consonant. |
| bigIdeaAr | أما الكلمة العربية فلا تبدأ هكذا أبداً | أما الكلمة العربية الفصيحة فلا تبدأ هكذا أبداً | Same hedge as English. |
| objectives[0].ar | والتجمّع الساكن (bl صوتان) | وتجمّع الصوامت (bl صوتان) | Term: 'التجمّع الصامت' would read as 'silent cluster', so تجمّع الصوامت. |
| keyTerms[0].ar | تجمّع ساكن | تجمّع صوامت (أصوات صامتة متتالية) | Consistent term. |
| linguisticsCorner.facts[0].en | In Arabic, a syllable always starts | In Standard Arabic, a syllable always starts | Hedge to Standard Arabic (dialects differ). |
| linguisticsCorner.facts[0].ar | في العربية يبدأ المقطع دائماً بصوت ساكن واحد ثم حركة | في العربية الفصحى يبدأ المقطع دائماً بصوت صامت واحد ثم حركة | Hedge + term. |
| linguisticsCorner.facts[0].ar | بصوتين ساكنين في البداية | بصوتين صامتين في البداية | Term. |
| linguisticsCorner.facts[1].en | Arabic solves this with hamzat al-wasl: اِسْم، اِسْتَمَعَ. The little 'i' in front lets you start. Arabic speakers do the same in English: i-sport, e-student, i-school. | Arabic solves this with hamzat al-wasl. Words like اسْم and اسْتَمَعَ begin with a letter that has sukun, so when you START with them you add a helping hamza with a vowel: 'ism', 'istama'a'. In the middle of a sentence the helper disappears: وَاسْتَمَعَ is said 'wa-stama'a'. Arabic speakers do the same in English: i-sport, e-student, i-school. | Old text called it just 'a little i'. Hamzat al-wasl is a hamza + vowel used only when you begin with the word, and it drops in connected speech; the vowel is not always i (اُكْتُبْ، الـ). |
| linguisticsCorner.facts[1].ar | تحلّ العربية ذلك بهمزة الوصل: اِسْم، اِسْتَمَعَ. الكسرة الصغيرة في البداية تسمح لك بالبدء. | تحلّ العربية ذلك بهمزة الوصل: كلمات مثل «اسْم» و«اسْتَمَعَ» تبدأ بحرف ساكن، والعربية لا تبدأ بساكن، فإذا بدأنا بها نطقنا همزة متحركة قبلها: «اِسْم». وفي وسط الكلام تسقط في النطق: «وَاسْتَمَعَ» تُقرأ «وَسْتَمَعَ». | Same correction in Arabic. |
| linguisticsCorner.facts[2].en | And many at the end: texts. | And up to four at the end: texts (k-s-t-s). | Precise and checkable: /teksts/ ends in four consonants. |
| linguisticsCorner.facts[2].ar | تسمح الإنجليزية بثلاثة أصوات ساكنة في بداية الكلمة: string و splash و spring، وبأكثر من ذلك في آخرها: texts. | تسمح الإنجليزية بما يصل إلى ثلاثة أصوات صامتة في بداية الكلمة: string و splash و spring، وبما يصل إلى أربعة في آخرها: texts (k-s-t-s). | Same + matches 'up to'; term. |
| linguisticsCorner.facts[4].en | the n slides back towards ng. | the n slides back toward ng (in tajwid this is part of ikhfa'). | American spelling; tajwid link is accurate (noon sakinah before ك/ق = ikhfa'). |
| linguisticsCorner.facts[4].ar | فتنزلق النون إلى الخلف نحو ng. | فتنزلق النون إلى الخلف نحو ng (وهذا من الإخفاء في التجويد). | Same. |
| arabicBridge[0].pointAr | العربية تحتاج حركة بين الساكنين | العربية تحتاج حركة بين الصامتين | Term. |
| arabicBridge[1].point | exactly like hamzat al-wasl in اِسْم. | much like the helping hamza (hamzat al-wasl) in اِسْم. | Similar, not identical: hamzat al-wasl is a hamza + vowel used only at the start of speech. |
| arabicBridge[1].pointAr | مع s وصوت ساكن بعدها يضيف متحدث العربية الحركة قبل s عادة، تماماً مثل همزة الوصل | مع s وصوت صامت بعدها يضيف متحدث العربية الحركة قبل s عادة، كما في همزة الوصل | Same + term. |
| arabicBridge[3].pointAr | كثيراً ما يضيف متحدثو العربية جيماً قاسية: king-g. | كثيراً ما يضيف متحدثو العربية صوت g منفصلاً في الآخر: king-g. | ج is /dʒ/ in MSA and the Gulf but /g/ in Egypt, so 'جيم قاسية' is unclear. |
| commonErrors[5].wrong | gilasses / feelag | gilasses / filag | Consistent with fi-lag in the exercise; 'feelag' suggested a long ee. |
| stages[1].nameAr | حرف مزدوج أم تجمّع ساكن؟ | حرف مزدوج أم تجمّع صوامت؟ | Term. |
| stages[1].teacherSaysAr[0] | هذا تجمّع ساكن. | هذا تجمّع صوامت. | Term. |
| stages[1].exercise.instructionsAr | و C للتجمّع الساكن. | و C لتجمّع الصوامت. | Term. |
| stages[2].purpose | Understand that the extra vowel is a smart Arabic rule, not a mistake of intelligence, and decide where it sneaks in. | Understand that the extra vowel comes from Arabic syllable rules, not from carelessness, and decide where it sneaks in. | Unnatural wording ('a mistake of intelligence'). |
| stages[2].teacherSays[0] | Arabic never starts a word with two consonants together. | Standard Arabic never starts a word with two consonants together. | Hedge (dialects differ). |
| stages[2].teacherSays[1] | When it needs to, Arabic adds a little i in front: اِسْم، اِسْتَمَعَ. That is hamzat al-wasl! | When a word starts with sukun, Arabic adds a helper in front: اِسْم، اِسْتَمَعَ. That is hamzat al-wasl! | Accurate description of hamzat al-wasl. |
| stages[2].teacherSaysAr[0] | المقطع العربي يبدأ بساكن واحد ثم حركة، ولا تبدأ الكلمة العربية بساكنين. | المقطع العربي يبدأ بصوت صامت واحد ثم حركة، ولا تبدأ الكلمة العربية الفصيحة بساكن. | 'يبدأ بساكن ثم حركة' mixed the two senses of ساكن; the traditional rule is 'لا يُبتدأ بساكن'. |
| stages[2].tips[1] | Pattern for the teacher: s + consonant usually gets a vowel BEFORE it; other clusters get a vowel IN THE MIDDLE. | Pattern for the teacher: s + p, t or k (sport, student, school) usually gets a vowel BEFORE it; most other clusters (including sl: su-lide) get a vowel IN THE MIDDLE. This is a tendency, not a law, and it varies by speaker and dialect. | The old pattern ('s + consonant -> before') contradicted the exercise item su-lide; the research describes tendencies, not rules. |
| stages[4].tips[1] | In some English accents a light g is heard; we teach the standard clean ng. | In some English accents (for example in parts of northern England) a light g is heard; we teach the more common ng with no g. | Do not rank accents as 'standard'. |
| stages[7].teacherSays[0] | Write C for clean or S for sneaky vowel. | Write G (green tick) if the word is clean, or R (red ghost) if something sneaky got in. | C already meant 'cluster' in stage 2; letters now match the green/red cards. king-g has an extra g, not a vowel, so 'something sneaky' covers it. |
| stages[7].studentsDo[0] | Judge 5 words (C or S). | Judge 5 words (G or R). | Same. |
| stages[7].teacherSaysAr[0] | ثلاثة أصوات ساكنة في أولها | ثلاثة أصوات صامتة في أولها | Term. |
| exitTicket.instructions | Listen. Is the word clean (C) or does it have a sneaky vowel (S)? | Listen. Is the word clean (G, green tick) or did something sneaky get in (R, red ghost)? | Same as stage 7. |
| exitTicket.instructionsAr | استمع: هل الكلمة نظيفة (C) أم فيها حركة متسللة (S)؟ | استمع: هل الكلمة نظيفة (G، العلامة الخضراء) أم دخلها صوت متسلل (R، الشبح الأحمر)؟ | Same. |
| exitTicket.items[0].answer | S | R | New answer letters (G/R). |
| exitTicket.items[1].answer | C | G | New answer letters (G/R). |
| exitTicket.items[2].answer | S | R | New answer letters (G/R). |
| exitTicket.items[3].answer | C | G | New answer letters (G/R). |
| exitTicket.items[4].answer | S (extra g) | R (sneaky extra g) | New answer letters (G/R). |
| homework.ar | تبدأ أسماؤها بتجمّع ساكن | تبدأ أسماؤها بتجمّع صوامت | Term. |
| assessment.successCriteria[1] | (Arabic syllables never start with two consonants) | (Standard Arabic syllables never start with two consonants) | Hedge. |
| teacherNotes[0] | Arabic speakers insert it before s + consonant (prothesis: i-sport) and between other consonants (anaptyxis: bi-lack). | Arabic speakers often insert it before s + consonant (prothesis: i-sport) and between other consonants (anaptyxis: bi-lack). Where the vowel goes varies by speaker and dialect. | Tendency, not rule. |
| teacherNotes (new item) | - | Dialect note: Standard Arabic and Egyptian Arabic never start a word with two consonants. Some spoken dialects do (Levantine كْتير 'a lot', many North African words and some Gulf words), but learners from these regions still often add vowels to English clusters, because combinations like bl, sp and str are new to them. | Makes the 'Arabic never starts with two consonants' claim honest for children from dialects with initial clusters. |

### bonus03.json

| Field / location | Before | After | Reason |
|---|---|---|---|
| bigIdea | Every English vowel letter has a short sound | In phonics, each vowel letter has a short sound | Simplification flagged as such (vowel letters have more than two sounds: father, said). |
| bigIdeaAr | لكل حرف متحرك في الإنجليزية صوت قصير | في دروس الأصوات نقول: لكل حرف متحرك في الإنجليزية صوت قصير | Same. |
| keyTerms[4].term | glide (diphthong) | sliding vowel (diphthong) | In phonetics 'glide' means a semivowel (w, y); a vowel that slides is a diphthong. |
| keyTerms[4].ar | صوت منزلق | صوت منزلق (صائت مزدوج) | Add the Arabic technical term. |
| linguisticsCorner.facts[0].en | About 600 years ago, the e at the end | More than 600 years ago (in the 1300s), the e at the end | Final -e was still spoken in Chaucer's time (1300s) and mostly lost by about 1400. |
| linguisticsCorner.facts[0].ar | قبل نحو 600 سنة كان | قبل أكثر من 600 سنة (في القرن الرابع عشر) كان | Same. |
| linguisticsCorner.facts[1].en | over about 200 years the long vowels moved | over about 300 years (roughly 1400 to 1700) the long vowels moved | The Great Vowel Shift is usually dated roughly 1400-1700. |
| linguisticsCorner.facts[1].ar | وعلى مدى نحو 200 سنة | وعلى مدى نحو 300 سنة (من نحو 1400 إلى 1700) | Same. |
| linguisticsCorner.facts[3].en | Linguists call these glides (diphthongs). | Linguists call these diphthongs (sliding vowels). | Term (see key terms). |
| linguisticsCorner.facts[3].ar | يسمّيها علماء اللغة أصواتاً منزلقة. | يسمّيها علماء اللغة الصوائت المزدوجة (الأصوات المنزلقة). | Term. |
| arabicBridge[0].english | short a / i / u in cap, kit, cub | short a and i in cap, kit; short u in cub | Separates the u, which is not like damma. |
| arabicBridge[0].point | English short vowels are close to Arabic harakat. The difference: English always writes them as a full letter. | English short a and i are close to fatha and kasra. Careful: the short u in cub, sun and cup is NOT a damma; it is a quick, relaxed 'uh' (damma is nearer the u in put). And English writes its short vowels as full letters. | English /ʌ/ (cub) is an open-mid central/back unrounded vowel, not [u]; equating it with damma teaches 'coob'. 'Always' removed (Level 1 review: gym, rhythm). |
| arabicBridge[0].pointAr | الأصوات القصيرة الإنجليزية قريبة من الحركات العربية، والفرق أن الإنجليزية تكتبها دائماً حرفاً كاملاً. | الصوتان القصيران a و i في الإنجليزية قريبان من الفتحة والكسرة. لكن انتبه: u القصيرة في cub و sun و cup ليست ضمة، بل صوت سريع مرتخٍ يشبه «أَ» (والضمة أقرب إلى u في put). والإنجليزية تكتب هذه الأصوات حروفاً كاملة. | Same in Arabic. |
| arabicBridge[1].point | closer to 'kayp' (كيب) | closer to 'kayp' (كَيْب) | Vowel marks show the slide; bare كيب reads 'keeb'. |
| arabicBridge[1].pointAr | بل أقرب إلى «كيب» | بل أقرب إلى «كَيْب» | Same. |
| arabicBridge[2].point | has the same slide as English long i: a -> y. Arabic already has this sound! | has almost the same slide as English long i: a -> y. Arabic already has a very similar sound! | English /aɪ/ and Arabic /aj/ are close but not identical. |
| arabicBridge[2].pointAr | فيها الانزلاق نفسه الذي في long i الإنجليزية: من a إلى y. العربية تملك هذا الصوت! | فيها انزلاق قريب جداً من long i الإنجليزية: من a إلى y. العربية تملك صوتاً قريباً جداً منه! | Same. |
| arabicBridge[3].point | Egyptian and Gulf speech have pure long e and o (beet, yoom). | Egyptian and many Gulf dialects say these words with a pure, steady long e and o (beet, yoom). | Hedged: not every Gulf variety; wording clarifies 'pure' = no slide. |
| arabicBridge[3].pointAr | في اللهجات المصرية والخليجية صوتا | في اللهجة المصرية وكثير من اللهجات الخليجية صوتا | Same. |
| commonErrors[3].why | Long o becomes Arabic waw (oo). | Long o becomes a flat o (like dialect يوم) or an Arabic waw (oo). | 'hoom' is usually the pure dialect o, as the Arabic bridge itself says. |
| commonErrors[5].wrong | rayn read as ra-in; boat read as bo-at | rain read as ra-in; boat read as bo-at | Typo/confusing form 'rayn'. |
| stages[1].teacherSays[0] | Short vowels are like harakat: cap is like fatha, kit like kasra, cub like damma. | Short vowels are close to harakat: cap is close to fatha, kit to kasra. But cub is NOT damma: it is a quick 'uh'! | Same /ʌ/ correction. |
| stages[2].teacherSays[0] | Long, long ago - 600 years ago - | Long, long ago - more than 600 years ago - | Dating (see facts). |
| stages[2].teacherSaysAr[0] | قبل 600 سنة كانت | قبل أكثر من 600 سنة كانت | Same. |
| stages[2].tips[1] | '600 years ago' | 'more than 600 years ago' | Same. |
| stages[3].tips (new item) | - | Long u has two versions: 'you' in cube and cute, and 'oo' in June and rule (and tube for many Americans). Both count as long u. | cube /kjuː/ vs June /dʒuːn/, tube /tuːb/ in American English: the 'says its name' rule only fits some long-u words. |
| stages[5].tips[0] | Words come from the Lesson 9 and 11 phonics units, so the clusters are familiar. | Most words come from the Lesson 7, 9 and 11 phonics units (frog, drum, crab, tree, slide, smile, snail, swim); grape, snake, stop and stone are new words with the same clusters. | grape, snake, stone and stop are not in the phonics units; slide is from Lesson 7. |
| stages[6].nameAr | بطاقة عيد ميلاد بـE السحرية | بطاقة عيد ميلاد مع E السحرية | Latin letter glued to بـ. |
| stages[6].tips[0] | June shows long u; | June shows long u (here it sounds 'oo'); | Accuracy: June is /dʒuːn/, no 'you'. |
| stages[7].teacherSays[1] | Did you know? 600 years ago, | Did you know? More than 600 years ago, | Dating. |
| stages[7].teacherSaysAr[0] | هل تعلم؟ قبل 600 سنة | هل تعلم؟ قبل أكثر من 600 سنة | Dating. |
| differentiation.challenge[0] | Why? (Old spellings again!) | Why? English words almost never end in v, so have, give and love keep an e; come is an old spelling. | The real reason for have/give/love is the 'no final v' convention, not only age. |
| teacherNotes[0] | and long u is /juː/. | long u is /juː/ (cube) or /uː/ (June), and long e /iː/ hardly slides. | Completeness/accuracy. |
| teacherNotes[3] | present them as 'old spellings' so the rule stays useful without being false. | present them as 'old spellings' (and, for have, give and love, 'English words don't end in v') so the rule stays useful without being false. | Same as challenge. |
| teacherNotes (new item) | - | History is simplified for children: final -e mostly stopped being said in the 1300s-1400s; the Great Vowel Shift ran roughly 1400-1700; printing (Caxton, 1476) and later dictionaries fixed spelling slowly, mostly by the 1700s. 'nah-muh' and 'kee-tuh' are approximate Middle English. | States the real dates behind the simplified story. |

### bonus04.json

| Field / location | Before | After | Reason |
|---|---|---|---|
| all ba-LLOON / baLLOON (8 strings) | LLOON | LOON | balloon is /bəˈluːn/: the double l is one sound. 'ba-LLOON' invites a doubled l; stress mark now ba-LOON everywhere. |
| stages[1].exercise.items[4].answer | 2 (bal-loon) | 2 (ba-loon) | Spoken syllables, consistent with ba-LOON. |
| all /iz/ (21 strings) | /iz/ | /ɪz/ | IPA: the vowel is /ɪ/ (cards and kid labels 'IZ' unchanged). |
| objectives[3].ar | و/z/ في pens و/ɪz/ | و /z/ في pens و /ɪz/ | Space after و before Latin/IPA. |
| keyTerms[2].meaning | the a's in banana (buh-NA-nuh) | the first and last a in banana (buh-NA-nuh) | Only two of the three a's are schwa. |
| linguisticsCorner.facts[3].en | Arabic has stress too, but it is softer and every syllable keeps a full vowel. Even Arabic dialects differ: many Egyptians say ma-DRA-sa | Arabic has stress too, but Arabic does not squash its weak syllables into a lazy 'uh' the way English does. Even Arabic dialects differ: many Egyptians (especially in Cairo) say mad-RA-sa | 'Softer' is not measurable; the real difference is English vowel reduction. Syllable division is mad-ra-sa (Cairene madrása). |
| linguisticsCorner.facts[3].ar | في العربية نبر أيضاً لكنه أخفّ، وكل مقطع يحتفظ بحركته كاملة. | في العربية نبر أيضاً، لكن العربية لا تضغط مقاطعها الضعيفة إلى «أَ» كسولة كما تفعل الإنجليزية. | Same. |
| linguisticsCorner.facts[3].ar | كثير من المصريين يقولون | كثير من المصريين (خاصة في القاهرة) يقولون | Same hedge. |
| linguisticsCorner.facts[4].en | and an extra beat after hissing sounds (boxes). | and an extra beat after hissing and hushing sounds (boxes, dishes, watches). | sh, ch, j sounds also take the extra beat. |
| arabicBridge[1].point | like the Arabic sound plurals -ات and -ون. | like the Arabic sound plurals -ات and -ون/-ين. | Masculine sound plural has -ون/-ين. |
| arabicBridge[1].pointAr | وجمع المذكر السالم -ون. | وجمع المذكر السالم -ون/-ين. | Same. |
| arabicBridge[3].point | Arabic has a dual and uses a singular noun after 11 and above. | Arabic has a dual (كتابان), uses a plural after 3 to 10 (ثلاثة كتب), and a singular after 11 to 99 (عشرون كتاباً, singular accusative tamyiz) and after 100 and 1,000 (مئة كتاب). | 'After 11 and above' was too broad (e.g. مئة وثلاثة كتب follows the last number); full picture of Arabic number-noun agreement. |
| arabicBridge[3].pointAr | في العربية مثنّى، ونستخدم المفرد بعد الأعداد من 11 فما فوق. | في العربية مثنّى (كتابان)، ونستخدم الجمع بعد الأعداد من 3 إلى 10 (ثلاثة كتب)، والمفرد المنصوب (تمييزاً) بعد الأعداد من 11 إلى 99 (عشرون كتاباً)، والمفرد المجرور بعد مئة وألف (مئة كتاب). | Same. |
| commonErrors[4].why | Arabic uses a singular after many numbers (عشرون كتاباً) | Arabic uses a singular after 11-99 and after 100 (عشرون كتاباً، مئة كتاب) | Precise. |
| commonErrors[5].why | Two hissing sounds cannot sit together, so English adds | English does not put two hissing sounds together at the end of a word, so it adds | 'Cannot' overclaims (they occur across words); the rule is about the plural ending. |
| stages[1].tips[1] | Breakfast is often said 'brek-fust' | Breakfast is said 'brek-fust' | That is its normal pronunciation, not a variant. |
| stages[2].teacherSays[4] | Many Egyptians say ma-DRA-sa; | Many Egyptians say mad-RA-sa; | Syllable division. |
| stages[3].teacherSays[2] | you might pay 30 riyals instead of 13! | you might pay 30 instead of 13! | Currency-neutral (Gulf riyals / Egyptian pounds); matches the Arabic line. |
| stages[3].tips[0] | balloon and o'clock are good exceptions to notice. | balloon is a good exception to notice, and o'clock (not a noun) is oO too. | o'clock is not a noun. |
| stages[3].tips[2] | 'It's thirteen minutes past' vs 'It's half past'. | 'It's thirteen minutes past three' vs 'It's three thirty'. | The old pair did not contain thirty. |
| stages[4].teacherSays[3] | English says twenty books - plural. Always add -s! | English says twenty books - plural. With every number from 2 up, use the plural! | 'Always add -s' is false for men, feet, children (taught in the same stage). |
| stages[5].teacherSays[3] | words ending in s, x, sh, ch get -es | words ending in s, x, z, sh, ch get -es | z also takes -es (quizzes); completes the rule. |
| stages[5].teacherSaysAr[1] | بـ s أو x أو sh أو ch | بـ s أو x أو z أو sh أو ch | Same. |
| stages[5].tips[1] | native listeners forgive it | native listeners usually forgive it | Hedge. |
| stages[5].tips[1] | Prioritise | Prioritize | American spelling. |
| stages[7].studentsDo[1] | favourite | favorite | American spelling. |
| teacherNotes[1] | Stress = more loudness, length and higher pitch, plus full vowel quality. | Stress = more loudness and length, a pitch change (usually higher in a word said alone), plus full vowel quality. | Pitch on stressed syllables is not always higher (e.g. in questions or low falls). |
| teacherNotes (new item) | - | Syllabic consonants: in candle (CAN-dle) the second beat has no clear vowel; the l itself makes the beat. If a child asks, say the l 'acts like a vowel' here. | candle is used in the stress task; 'each syllable has one vowel sound' has this exception. |

## Verified correct, no change

**Bonus 1 (digraphs)**
- Digraph = two letters, one sound; cluster contrast is used consistently in B1/B2 (keyTerms, stage 2 sort in B2).
- Letter/sound counts: ship, fish, chip, shop, much, dish, chin = 4 letters / 3 sounds; lunch = 5 / 4.
- th classification (every item): voiceless /θ/ think, three, thank you, bath, thin; voiced /ð/ this, that, the, mother, brother. Tip "little words the, this, that, they use ð" is correct.
- Sort (12 items) each has exactly one digraph; exit ticket and fill-the-gap answers correct (dictated, so the gaps are unambiguous). Challenge: chick/shock/check/thick = 2 digraphs each; tch in watch/match is a trigraph.
- Ye = þe; þ thorn, ð eth; printing in England 1476 (~550 years before 2026); "alphabet" = alpha + beta and أبجدية from أ ب ج د; φ for ph (Greek words); Old English hw -> Middle English wh; most speakers now merge wh/w.
- Egyptian ث -> ت/س, ذ -> د/ز (تلاتة، دهب، زكي) is accurate and is now labelled as dialect; Gulf/Iraqi چ for /tʃ/ (چاي، چم) is accurate.
- مجهور / مهموس for voiced / voiceless match tajwid usage for ث (مهموس) and ذ (مجهور).

**Bonus 2 (clusters)**
- Standard Arabic syllables are CV(V)(C): no word-initial clusters; final CC allowed in pause (كلْب، بنْت).
- Epenthesis terms: prothesis (i-sport) and anaptyxis (bi-lack) correct; Japanese sutoraiku, Spanish es-tudent correct.
- English onsets up to 3 (string, splash, spring, scream); texts /teksts/ ends in 4; strengths /streŋθs/ 3 + 3.
- ng = /ŋ/ (velar nasal), one sound; n before k assimilates to [ŋ] (think, pink, thank; Arabic منك، أنكر = ikhfa').
- n vs ng items (king, kin, ring, thin, thing, sun, sung, long) correct; thin/thing and sun/sung are true minimal pairs.
- Add-a-sound answers (black, clap, flag, play, slip, glad, clock, stop, sport, snail) and clap counts (black/please/flag 1; glasses, student, classroom, playground, eyebrow 2) correct.
- Lesson links: th/ng Lesson 5, L-blends Lesson 7, R-blends Lesson 9, S-blends Lesson 11 match the phonics hub.

**Bonus 3 (long vowels)**
- Every magic-e pair follows CVC -> CVCe: cap/cape, tap/tape, mad/made, kit/kite, pin/pine, hop/hope, not/note, cub/cube, tub/tube; challenge fin/fine, cut/cute, rid/ride. Exceptions (have, give, love, come, said) are explicitly flagged as exceptions.
- Vowel-team items rain, snail (ai), tree, green, sleep (ee), boat, coat (oa) all follow "first vowel talks"; sprint items (frog, grape, drum, smile, crab, snake, tree, stop, slide, snail, stone, swim) all classified correctly; exit ticket correct.
- Middle English final -e was pronounced (name ≈ naːmə); Caxton 1476; long a/i/o are diphthongs /eɪ aɪ oʊ~əʊ/; one sound many spellings (a-e, ai, ay).
- Arabic: كَتَبَ/كاتِب, دَرَسَ/دارِس length contrast; silent alif after waw al-jama'a (كتبوا); بَيْت with /aj/ in MSA; Egyptian and most Gulf بيت/يوم with [eː]/[oː].
- June, July (Lesson 11) and cake (Lesson 12) are known words; July = long i spelled y.

**Bonus 4 (syllables, stress, -s)**
- Syllable counts: cake, lunch 1; dinner, breakfast, balloon, homework, toothbrush 2; pajamas, afternoon, November 3.
- Every stress mark checked: BREAKfast, baLOON, HOMEwork, o'CLOCK, CANdle, paJAmas, afterNOON (secondary on af-), MIDnight, sepTEMber, thirTEEN, THIRty, fifTEEN/FIFty, BIRTHday; PREsent (noun) / preSENT (verb); REcord/reCORD, DEsert/deSERT; WAtermelon, TELevision; stress shift THIRteen MINutes is real.
- Every plural classified correctly: /s/ books, clocks, cakes, minutes, cats, snacks; /z/ dogs, pens, balloons, candles, keys, bags (and days, trees); /ɪz/ boxes, watches, buses, oranges, dishes, lunches, glasses. Teacher-note rule (sibilants -> /ɪz/, other voiceless -> /s/, other voiced + vowels -> /z/) correct.
- Schwa is the most frequent English vowel and has no letter of its own; banana = bə-NA-nə.
- Arabic plurals: سيارات (sound feminine), كُتُب، أولاد (broken), كتابان (dual); عشرون كتاباً (singular accusative tamyiz), مئة كتاب (singular genitive). English irregulars man/men, foot/feet, child/children match Lesson 19 vocabulary.
- madrasa: Cairene madRAsa vs MADrasa elsewhere is a textbook contrast; described without ranking.
- Lesson links: vowel teams Lesson 13, sight words Lesson 15, plurals Lesson 19 match the phonics hub and lessons.

## Could not verify / for the owner or a native speaker
1. **Gulf initial clusters (B2 teacher note).** I am confident for Levantine (كْتير) and North African Arabic; I wrote "some Gulf words" for the Gulf. A Gulf native speaker should confirm or remove the Gulf mention.
2. **Gulf stress of مدرسة (B4).** Initial stress MADrasa is the usual description for non-Cairene dialects; a Gulf teacher should confirm it matches what the children say at home before it is used as a class activity.
3. **"Many Gulf speakers say چ" (B1).** True for Kuwait, Bahrain, Iraq, parts of Saudi Arabia and the UAE; less so for some Najdi/Hijazi speakers. Fine as written ("many"), but the teacher should not expect every Gulf child to recognise چم.
4. **فِلاج (B2 Arabic bridge)** writes the g of flag with ج, which Egyptian readers say as g but Gulf readers say as j. Left unchanged (common practice); the owner may prefer فِلاگ or a Latin transcription.
5. **Egyptian ج = /g/ (not in these files).** Egyptian children may say "gam" for jam (Lesson 1 phonics). Not part of these classes, but worth a tip in Bonus 1 or Lesson 1 if the owner wants.
6. **Level-wide Arabic term for vowels.** These files use حرف/صوت متحرك for "vowel"; the Level 1 review moved consonants to صامت (applied here in B2). If the owner wants صائت for vowels too, it should be changed across all levels at once.
