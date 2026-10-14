# Pre-A bonus classes - academic review log

Reviewer scope: bonus-classes/pre-a/bonus01-04.json (ages 4-6, strand Sound Explorers). Every string read; vocabulary checked against lessons/pre-a/lesson01-16 vocab lists up to each class's afterLesson. Files rewritten with json.dump(indent=2), so line formatting changed; `python3 gen_bonus_plans.py --check` reports 28 bonus classes OK.

## Bonus 1 - My Mouth Makes Music (after L4)

22 changes.

| Field / location | Before | After | Reason |
|---|---|---|---|
| builtOn[0] | hello, hi, good morning, goodbye, thank you | hello, hi, good morning, good night, goodbye, thank you | Lesson 1 also teaches good night; list completed. |
| keyTerms 'buzz' meaning | sounds like /m/, /z/ and /b/. | sounds like /m/, /n/ and /z/. | Voicing in /b/ is very brief and hard for children to feel; long voiced sounds are the honest examples. |
| linguisticsCorner.facts[4].ar | بعضو خاص في عمق الصدر اسمه المِصفار (syrinx). | بعضو خاص في عمق الصدر اسمه بالإنجليزية syrinx. | The Arabic term المِصفار could not be verified as a standard term; describe the organ and keep the English name. |
| linguisticsCorner.facts[5].en | Babies can hear the sounds of every language in the world. By about their first birthday, their ears tune in to the languages they hear at home. Learning English young keeps those ears open. | Young babies can tell apart the sounds of almost every language in the world. By about their first birthday, their ears tune in to the languages they hear at home. Hearing English while you are young helps your ears get used to its sounds. | Hedged: infants discriminate most (not literally all) contrasts; 'keeps those ears open' overclaims the research. |
| linguisticsCorner.facts[5].ar | الرضّع يستطيعون سماع أصوات كل لغات العالم، وقرب عيد ميلادهم الأول تتخصص آذانهم في اللغات التي يسمعونها في البيت. تعلّم الإنجليزية في الصغر يُبقي الأذن مفتوحة. | الرضّع الصغار يستطيعون التمييز بين أصوات كل لغات العالم تقريباً، وقرب عيد ميلادهم الأول تتخصص آذانهم في اللغات التي يسمعونها في البيت. وسماع الإنجليزية في الصغر يساعد الأذن على التعوّد على أصواتها. | Arabic matched to the hedged English. |
| arabicBridge[2].point | Children who learn Quran recitation already know the ghunna | Children who learn Quran recitation may already know the ghunna | Not every child in the group learns tajweed; hedge so no child feels left out. Ghunna claim itself verified (nasal resonance of م and ن). |
| arabicBridge[2].pointAr | الأطفال الذين يتعلمون التلاوة يعرفون الغُنّة: | قد يعرف الأطفال الذين يتعلمون تلاوة القرآن الكريم الغُنّة: | Same hedge; fuller respectful wording. |
| commonErrors[2].why | The English names of E and I are easy to swap, and Arabic has no letter names that match them. Use pictures: E-egg, I-ice cream. | The English names of E ('ee') and I ('eye') are easy to swap, especially because in many languages, and in Arabic names written in English letters (Amira, Rima), the letter i stands for an 'ee' sound. Use pictures: E-egg, I-ice cream. | Original reason ('Arabic has no letter names that match them') was not a meaningful explanation; replaced with the real source of the confusion. |
| stage 3 teacherSaysAr[0] | الشفتان تُغلقان! | الشفتان تنطبقان! | More natural Arabic for lips closing. |
| stage 3 exercise item 6 | {"prompt": "/t/ (ten)", "answer": "tongue"} | {"prompt": "/d/ (dog)", "answer": "tongue"} | ten is taught in Lesson 7, after this class (afterLesson 4); dog (Lesson 3) gives the same tongue-tip answer. |
| stage 6 purpose | Practise switching | Practice switching | American spelling (lessons use American). |
| stage 6 tips[1] | Avoid cat, goat and queen as first-sound items today: C ('see'), G ('jee') and Q ('kyoo') have names that do not match their sound in these words. Keep them for the detectives class. | Avoid cat and goat as first-sound items today: C ('see') and G ('jee') have names that do not match their sound in these words. Keep them for the detectives class. | Q's name 'kyoo' does start with /k/, the first sound of queen, so Q is not a name/sound mismatch for this task. |
| stage 7 method | Personalised speaking | Personalized speaking | American spelling. |
| stage 7 exercise item 7 | {"prompt": "Hamad", "answer": "/h/ - a soft breath (English has no ح)"} | {"prompt": "Hala", "answer": "/h/ - a soft breath (like ه)"} | Hamad starts with ح, so asking for its 'first sound' has no single right answer; Hala (هالة) starts with ه = English /h/. The ح point stays in the Arabic Bridge and the tip on special Arabic sounds. |
| stage 8 teacherSays[1] | Did you know? Babies can hear the sounds of every language in the world. Your ears are still super ears! | Did you know? Babies can hear the sounds of almost every language in the world. Young ears are great at learning new sounds! | Hedged to match the corrected fact. |
| stage 8 teacherSaysAr[1] | هل تعلم؟ الرضّع يستطيعون سماع أصوات كل لغات العالم، وآذانكم ما زالت آذاناً خارقة! | هل تعلم؟ الرضّع يستطيعون سماع أصوات كل لغات العالم تقريباً، وآذانكم الصغيرة ما زالت بارعة في تعلّم الأصوات الجديدة! | Arabic matched to the hedged English. |
| homework.tasks[1] | Find a ball, a pen and a book (or any 3 things) | Find a ball, a pen and an apple (or any 3 things) | book is taught in Lesson 16; apple is known from Lesson 3. |
| homework.tasks[2] | Colour the lips red. | Color the lips. | American spelling; red is not taught until Lesson 8. |
| differentiation.challenge[0] | Find the tricky letters whose names do not match their sounds in A-R (C, G, H, Q) and explain with a picture. | Find the tricky letters in A-R whose names do not match the first sound of their picture word (C-cat, G-goat, H-hat, and the vowels A-apple, E-egg, O-orange) and explain with a picture. | Q-queen is not a mismatch (/k/ in both); the vowel letters A, E, O are real mismatches and were missing. |
| teacherNotes[4] | numbers and colours. | numbers and colors. | American spelling. |
| Arabic strings (several) | و/b/, بـ/l/ ... | و /b/, بـ /l/ ... | Brief rule: space between a prefixed و/بـ and Latin/IPA text (14 places). |
| teacherNotes (new last item) | - | Timing: 60 minutes online is long for 4-5 year olds. Keep every stage short and moving, add a 30-second stand-and-stretch between seated stages when attention drops, and if time runs short, shorten the Arabic Bridge rather than the movement break or the exit ticket. | 60 minutes is at the edge of what 4-6 year olds manage online; gives the teacher a concrete plan for flagging attention without changing the stage timings. |

**Verified correct, no change:**

- Stage minutes 5+8+10+5+8+10+8+6 = 60.
- Place of articulation: /m b p/ bilabial, /t d n l/ tongue tip (alveolar), /k g/ back of tongue (velar), /f/ upper teeth on lower lip (labiodental).
- /m/ and /n/ are nasal; pinching the nose with lips closed stops a hum within a moment.
- Birds produce song with the syrinx, not the larynx.
- Ghunna = the nasal resonance of م and ن in tajweed; the comparison with English /m n/ is accurate and kept, now hedged ('may already know').
- Arabic has no /p/; English initial /p/ is voiceless and aspirated (puff test valid).
- English has no ح or ع; English /h/ ~ ه.
- English /t d/ are alveolar, Arabic ت د dental/denti-alveolar ('a little further back' tip is correct).
- Letter names B 'bee', M 'em', K 'kay', H 'aitch'; C 'see', G 'jee' mismatch with cat/goat.
- Answer keys: noise/word (8 items), mouth helpers (8), Arabic match (8, P has no Arabic letter), first sounds (10), names (8), exit ticket (5) - all single answers.
- Vocabulary: all exercise words are from Lessons 1-4 after the fixes (ten, book, red removed).

## Bonus 2 - First Sound Detectives (after L8)

34 changes.

| Field / location | Before | After | Reason |
|---|---|---|---|
| linguisticsCorner.facts[0].en | Sun is /s/ + /u/ + /n/. | Sun is /s/ + /ʌ/ + /n/. | IPA: the vowel in sun is /ʌ/, not /u/. |
| linguisticsCorner.facts[0].ar | sun هي /s/ + /u/ + /n/. | sun هي /s/ + /ʌ/ + /n/. | IPA correction. |
| linguisticsCorner.facts[1].en | Hearing the first sound of a word is one of the first steps to reading in every language that uses an alphabet, English and Arabic too. | Hearing the first sound of a word is an important early step towards reading in languages written with letters, English and Arabic too. | Softened an absolute claim ('every language') to what the reading research supports. |
| linguisticsCorner.facts[1].ar | سماع الصوت الأول في الكلمة من أولى خطوات القراءة في كل لغة تستخدم الأبجدية، ومنها الإنجليزية والعربية. | سماع الصوت الأول في الكلمة خطوة مبكرة مهمة نحو القراءة في اللغات التي تُكتب بالحروف، ومنها الإنجليزية والعربية. | Arabic matched to the hedged English. |
| arabicBridge[1].point | In everyday Egyptian Arabic ث often becomes ت or س, so | In everyday Egyptian Arabic ث often becomes ت or س (most Gulf dialects keep ث), so | Dialect accuracy: the ث merger is Egyptian (and some other dialects), not general Gulf. |
| arabicBridge[1].pointAr | في العامية المصرية تتحول الثاء كثيراً إلى تاء أو سين، | في العامية المصرية تتحول الثاء كثيراً إلى تاء أو سين (ومعظم لهجات الخليج تحافظ على الثاء)، | Same, Arabic. |
| arabicBridge[4].pointAr | في العربية تبدأ كل كلمة بصوت ساكن، حتى أرنب تبدأ بالهمزة، وهي وقفة صغيرة في الحلق. أما الإنجليزية ففيها كلمات كثيرة تبدأ مباشرة بصوت متحرك: | في العربية تبدأ كل كلمة بصوت صامت (حرف)، حتى أرنب تبدأ بالهمزة، وهي وقفة صغيرة في الحلق. أما الإنجليزية ففيها كلمات كثيرة تبدأ مباشرة بصوت علّة (حركة): | Terminology: in Arabic grammar 'ساكن' means a consonant with sukun and 'متحرك' a consonant carrying a vowel, so they mistranslate consonant/vowel; use صامت / صوت علّة. |
| arabicBridge[5].arabic | "arabic": "خيط حرير على حيط خليل" | "arabic": "خيط حرير على حيط خليل (بالعامية)" | Dialect line labelled: حيط is colloquial for حائط. |
| arabicBridge[5].point | Arabic tongue twisters also play with similar sounds at the start of words. | Arabic tongue twisters (like this well-known colloquial one) also play with similar sounds at the start of words. | Dialect label in English. |
| arabicBridge[5].pointAr | الجمل العربية صعبة النطق تلعب | الجمل العربية الصعبة النطق (مثل هذه الجملة العامية المشهورة) تلعب | Arabic grammar (definite adjective phrase) + dialect label. |
| commonErrors[2].why | In Egyptian and some Gulf colloquial Arabic ث is often said as ت or س. | In Egyptian colloquial Arabic (and some other dialects) ث is often said as ت or س; most Gulf dialects keep ث. | Dialect accuracy (Gulf dialects such as Kuwaiti, Emirati, Qatari, Najdi keep the interdentals). |
| materials.teacher[2] | fish, four, five, cat, | fish, four, five, nine, cat, | nine is used in the Linguistics Corner exercise but its card was missing. |
| stage 2 purpose | practise isolating | practice isolating | American spelling. |
| stage 2 exercise item yellow | "answer": "/y/ (as in yes)" | "answer": "/j/ (the y sound in yes)" | IPA: the y sound is /j/. |
| stage 3 purpose | Practise matching | Practice matching | American spelling. |
| stage 3 teacherSays[3] | Show me! A ball! /b/ ball! A book! /b/ book! | Show me! A ball! /b/ ball! Something blue! /b/ blue! | book is taught in Lesson 16; blue is known from Lesson 8. |
| stage 4 exercise item three | "statue (/th/, not /s/)" | "statue (/θ/, not /s/)" | IPA. |
| stage 4 tips[0] | zebra and three are deliberate traps: they sound close to /s/ for Arabic-speaking ears. Celebrate children who freeze. | zebra and three are deliberate traps: /z/ is the buzzing partner of /s/, and three can come out as 'sree' (see the Arabic Bridge). Celebrate children who freeze. | Arabic has both س and ز, so zebra is not hard 'for Arabic-speaking ears'; stated the real reason for each trap. |
| stage 5 teacherSays[2] | Three: put your tongue out a little: /th/. | Three: put your tongue out a little: /θ/. | IPA consistency. |
| stage 5 teacherSaysAr[3] | كل كلمة عربية تبدأ بصوت ساكن، حتى أرنب تبدأ بالهمزة. أما apple فتبدأ مباشرة بصوت متحرك. | كل كلمة عربية تبدأ بصوت صامت (حرف)، حتى أرنب تبدأ بالهمزة. أما apple فتبدأ مباشرة بصوت علّة (حركة). | Terminology (ساكن/متحرك do not mean consonant/vowel). |
| stage 5 tips[0] | English r, for example, is softer than Arabic ر (no trill). | English r, for example, is softer than Arabic ر (the tongue does not tap or trill). | Arabic ر is usually a tap, sometimes a trill. |
| stage 5 tips[1] | because colloquial Arabic often turns ث into ت. | because Egyptian colloquial Arabic often turns ث into ت or س. | Name the dialect precisely; includes the س variant used in the bridge. |
| stage 6 method | (categorisation) | (categorization) | American spelling. |
| stage 6 exercise instructions | "instructions": "Say the word. Which house does it live in? Listen to the first sound, not the letter." | "instructions": "Say the word. Which house does it live in? Listen to the first sound, not the letter. The last three are trickster cases: say their first sound." | The last three items have no house (/k/, /w/, /z/); the instruction now matches the answers. |
| stage 6 exercise instructionsAr | "instructionsAr": "قل الكلمة. في أي بيت تسكن؟ استمع إلى الصوت الأول، لا إلى الحرف." | "instructionsAr": "قل الكلمة. في أي بيت تسكن؟ استمع إلى الصوت الأول، لا إلى الحرف. آخر ثلاث كلمات قضايا مخادعة: قل صوتها الأول." | Arabic matched. |
| stage 7 exercise item 'Big blue ...' | {"prompt": "Big blue ...", "answer": "ball"} | {"prompt": "Big blue ...", "answer": "ball (or another /b/ word)"} | The task asks for any word with the same first sound, so other words are defensible; key now says so. |
| stage 7 exercise item 'Six silly ...' | {"prompt": "Six silly ...", "answer": "suns"} | {"prompt": "Six silly ...", "answer": "suns (or another /s/ word)"} | The task asks for any word with the same first sound, so other words are defensible; key now says so. |
| stage 7 exercise item 'Five funny ...' | {"prompt": "Five funny ...", "answer": "fish"} | {"prompt": "Five funny ...", "answer": "fish (or another /f/ word)"} | The task asks for any word with the same first sound, so other words are defensible; key now says so. |
| stage 7 exercise item 'Ten tall ...' | {"prompt": "Ten tall ...", "answer": "trees"} | {"prompt": "Ten tall ...", "answer": "trees (or another /t/ word)"} | The task asks for any word with the same first sound, so other words are defensible; key now says so. |
| stage 7 exercise item 'Zebra zooms to ...' | {"prompt": "Zebra zooms to ...", "answer": "zero"} | {"prompt": "Zebra zooms to ...", "answer": "zero (or another /z/ word)"} | The task asks for any word with the same first sound, so other words are defensible; key now says so. |
| stage 7 teacherSaysAr[4] | جمل صعبة النطق تلعب بالأصوات: خيط حرير على حيط خليل! | جمل صعبة النطق تلعب بالأصوات، مثل هذه الجملة العامية: خيط حرير على حيط خليل! | Dialect label. |
| differentiation.challenge[2] | sun ends with /n/, bus ends with /s/. | sun ends with /n/, red ends with /d/. | bus is not taught in Pre-A; red is known (Lesson 8). |
| Arabic strings (several) | و/b/, بـ/l/ ... | و /b/, بـ /l/ ... | Brief rule: space between a prefixed و/بـ and Latin/IPA text (2 places). |
| teacherNotes (new last item) | - | Timing: 60 minutes online is long for 4-5 year olds. Keep every stage short and moving, add a 30-second stand-and-stretch between seated stages when attention drops, and if time runs short, shorten the Arabic Bridge rather than the movement break or the exit ticket. | 60 minutes is at the edge of what 4-6 year olds manage online; gives the teacher a concrete plan for flagging attention without changing the stage timings. |

**Verified correct, no change:**

- Stage minutes 5+8+10+5+8+8+10+6 = 60.
- xylophone starts with /z/; one starts with /w/; cat, kite, clock all /k/.
- Egyptian ج = /g/ (gamal); many Gulf dialects ق = /g/ (gahwa); MSA has no letter for /g/.
- Egyptian colloquial ث -> ت or س (talata, sawra); most Gulf dialects keep ث.
- Arabic words begin with a consonant (أرنب with hamza); English words can begin with a vowel.
- ڤ is used informally for /v/ in loanwords.
- خيط حرير على حيط خليل is a well-known (colloquial) tongue twister contrasting خ and ح.
- Alliteration in Mickey Mouse, Donald Duck, Peppa Pig.
- Exit pairs: sun-six same, ten-red different, cat-kite same, van-five different (/v/ vs /f/).
- 'Red ... (an animal)' -> rabbit is the only known /r/ animal by Lesson 8.
- Vocabulary: Lessons 1-8 only (Lesson 9 colors not used); book removed.

## Bonus 3 - Rhyme Time and Clap the Beats (after L12)

21 changes.

| Field / location | Before | After | Reason |
|---|---|---|---|
| linguisticsCorner.facts[0].ar | عندما تتشابهان من الصوت المتحرك حتى النهاية | عندما تتشابهان من صوت العلّة (الحركة) حتى النهاية | Terminology: vowel = صوت العلّة, not صوت متحرك. |
| linguisticsCorner.facts[2].ar | في قلب كل نبضة تقريباً صوت متحرك، | في قلب كل نبضة تقريباً صوت علّة (حركة)، | Terminology. |
| linguisticsCorner.facts[4].en | Songs and nursery rhymes in every language use rhyme and beat, because they help our brains remember. That is why you can remember a song better than a list. | Songs and nursery rhymes in many languages use rhyme and a steady beat. These patterns help our memory, which is one reason a song is easier to remember than a list. | Not every language's songs use rhyme (beat is near-universal, rhyme is not); hedged. |
| linguisticsCorner.facts[4].ar | الأغاني وأناشيد الأطفال في كل اللغات تستخدم القافية والإيقاع لأنهما يساعدان الدماغ على الحفظ، ولهذا نحفظ الأغنية أسهل من قائمة كلمات. | الأغاني وأناشيد الأطفال في لغات كثيرة تستخدم القافية والإيقاع المنتظم، وهما يساعدان الذاكرة، ولهذا نحفظ الأغنية أسهل من قائمة كلمات. | Arabic matched to the hedge. |
| arabicBridge[3].point | so we must clap the English word, not the Arabic one. | so we must clap the English word, not the Arabic one. (Arabic counts here are for the Standard pausal form; in some dialects سمكة has 2 beats, so count it the way the child says it.) | Dialect accuracy: Gulf pronunciations such as سمچة (simcha/smicha) have 2 syllables, not 3. |
| arabicBridge[3].pointAr | لذلك نصفّق للكلمة الإنجليزية لا للعربية. | لذلك نصفّق للكلمة الإنجليزية لا للعربية. (الأعداد هنا للنطق الفصيح عند الوقف، وقد تختلف في بعض اللهجات: سمكة نبضتان عند بعض أهل الخليج، فنعدّها كما ينطقها الطفل.) | Same, Arabic. |
| arabicBridge[4].arabic | لا تبدأ الكلمة العربية بساكنين | لا تبدأ الكلمة في الفصحى بساكنين | Accuracy: several dialects (e.g. many Gulf and Levantine forms) do allow two consonants at the start. |
| arabicBridge[4].point | Arabic words never begin with two consonants together, so Arabic speakers often add a little vowel | Standard Arabic (and Egyptian Arabic) words never begin with two consonants together, so many Arabic speakers add a little vowel | Same correction; 'never' now true for the varieties named. |
| arabicBridge[4].pointAr | لا تبدأ الكلمة العربية بصوتين ساكنين متتاليين، لذلك يضيف المتحدث بالعربية حركة صغيرة | لا تبدأ الكلمة في الفصحى (ولا في العامية المصرية) بصوتين ساكنين متتاليين، لذلك يضيف كثير من المتحدثين بالعربية حركة صغيرة | Same, Arabic. |
| commonErrors[1].why | Arabic words cannot start with two consonants, | Standard Arabic (and Egyptian Arabic) words cannot start with two consonants, | Same dialect accuracy. |
| stage 1 tips[1] | hat, log, dish and truck are support words shown with pictures; | log, dish and truck are support words shown with pictures (hat is known from Lesson 3); | hat is Lesson 3 vocabulary, not a support word. |
| stage 2 studentsDo[0] | the heads change colour, | the heads change color, | American spelling. |
| stage 3 purpose | not just recognise them. | not just recognize them. | American spelling. |
| stage 4 studentsDo[0] | Jump for rhyme, crouch for no rhyme. | Jump for rhyme, sit down for no rhyme. | Matched to teacherSays and the exercise (sit down). |
| stage 4 tips[1] | (/th/ and /t/). | (/θ/ and /t/). | IPA. |
| stage 5 tips[0] | قطة = qiṭ-ṭa (2), سمكة = sa-ma-ka (3). | قطة = qiṭ-ṭa (2), سمكة = sa-ma-ka (3). If the family's dialect says a word differently (some Gulf speakers say سمكة with 2 beats), count it their way. | Dialect accuracy. |
| stage 7 method | Categorisation game (1-, 2- and 3-carriage trains) + personalised production | Categorization game (1-, 2- and 3-carriage trains) + personalized production | American spelling. |
| stage 7 exercise item brother | "train 2 (bro-ther)" | "train 2 (broth-er)" | Standard syllable division of brother. |
| stage 7 tips[0] | (Mu-ham-mad = 3, Fa-ti-ma = 3, Ah-mad = 2). | (Mu-ham-mad = 3, Fa-ti-ma = 3 or Fat-ma = 2, Ah-mad = 2). | Many Egyptian and Gulf families say Fatma (2 beats); consistent with 'the way the family says them'. |
| teacherNotes[1] | plus a few picture words (hat, log, dish, truck, frog, toes, bed, spoon) needed to make rhymes. | plus a few picture words (log, dish, truck, frog, toes, bed, spoon, cake, teddy) needed to make rhymes, and elephant (Lesson 13) as a preview picture word for 3 beats. | hat is known; cake (Lesson 15) and teddy were unlisted support words; elephant preview now declared. |
| teacherNotes (new last item) | - | Timing: 60 minutes online is long for 4-5 year olds. Keep every stage short and moving, add a 30-second stand-and-stretch between seated stages when attention drops, and if time runs short, shorten the Arabic Bridge rather than the movement break or the exit ticket. | 60 minutes is at the edge of what 4-6 year olds manage online; gives the teacher a concrete plan for flagging attention without changing the stage timings. |

**Verified correct, no change:**

- Stage minutes 5+8+8+5+7+10+10+7 = 60.
- All rhyme pairs truly rhyme: cat/hat, dog/frog/log, fish/dish, duck/truck, nose/toes, red/bed/head, kite/white, two/blue, moon/spoon, three/tree. Non-rhymes correct: cat/cake, duck/dog, bird/mom, hands/feet, pink/black, mouth/mom, fish/five.
- English syllables: cat 1, rab-bit 2, ba-by 2, el-e-phant 3, duck 1, grand-ma 2, um-brel-la 3, pur-ple 2, black 1, sis-ter 2, xy-lo-phone 3, hands 1, bird 1, yel-low 2, broth-er 2, mouth 1, ze-bra 2, Lu-mi 2, Noor 1, Lu-mi-o 3, feet 1, rabbit 2, elephant 3, wa-ter-mel-on 4, a-vo-ca-do 4, good-bye 2.
- Arabic syllables (Standard, pausal): أرنب ar-nab 2, كتاب ki-taab 2, مدرسة mad-ra-sa 3, قطة qiṭ-ṭa 2, بطة baṭ-ṭa 2, سمكة sa-ma-ka 3, فيل 1; Mu-ham-mad 3, Ah-mad 2.
- Arabic rhymes: قطة/بطة, باب/كتاب, نار/دار, قمر/شجر.
- Classical qasida is monorhyme (same rhyme letter at the end of every line).
- elephant (Lesson 13) is a declared preview picture word, as in the plan.

## Bonus 4 - Big Letters, Small Letters, Left to Right (after L16)

32 changes.

| Field / location | Before | After | Reason |
|---|---|---|---|
| linguisticsCorner.facts[0].en | so we must learn 52 shapes! Arabic has 28 letters. | so we must learn 52 shapes! Arabic has 28 letters, and most of them have four shapes! | Fairness/accuracy: Arabic letters have up to four positional forms (22 of 28 have four), so the 52-vs-28 contrast was misleading. |
| linguisticsCorner.facts[0].ar | أما العربية ففيها 28 حرفاً. | أما العربية ففيها 28 حرفاً، ولمعظمها أربعة أشكال! | Same, Arabic. |
| linguisticsCorner.facts[2].en | Long ago, the Romans carved only big letters in stone. Small letters grew slowly over hundreds of years, as people wrote faster with pens. | Long ago, the Romans carved big letters in stone. Small letters grew slowly over hundreds of years from the quicker handwriting people used with pens. | Romans also wrote everyday cursive; 'only big letters' overclaims. Lowercase grew from book and quick hands (uncial, minuscule). |
| linguisticsCorner.facts[2].ar | قديماً كان الرومان ينحتون الحروف الكبيرة فقط على الحجر، ثم نشأت الحروف الصغيرة ببطء عبر مئات السنين عندما صار الناس يكتبون بسرعة بالأقلام. | قديماً كان الرومان ينحتون الحروف الكبيرة على الحجر، ثم نشأت الحروف الصغيرة ببطء عبر مئات السنين من الخط السريع الذي كان الناس يكتبون به بالأقلام. | Arabic matched. |
| linguisticsCorner.facts[5].en | because Europe learned them from Arab mathematicians, who learned them from India. | because Europe learned them from mathematicians who wrote in Arabic (such as al-Khwarizmi), and they had learned them from India. In Arabic the numbers ١ ٢ ٣ are often called Indian numerals. | Accuracy: key scholars (e.g. al-Khwarizmi) wrote in Arabic but were not all Arabs; added the naming flip that Gulf/Egyptian parents meet (١٢٣ = الأرقام الهندية). |
| linguisticsCorner.facts[5].ar | لأن أوروبا أخذتها عن العلماء العرب الذين أخذوها بدورهم عن الهند. | لأن أوروبا أخذتها عن علماء كتبوا بالعربية (مثل الخوارزمي)، وهؤلاء أخذوها بدورهم عن الهند. أما الأرقام ١ ٢ ٣ فتُسمّى في العربية غالباً الأرقام الهندية. | Same, Arabic. |
| arabicBridge[2].point | ب alone, بـ at the start (باب), ـبـ in the middle (كتبنا), ـب at the end (كتاب). Small English b stays the same wherever it is: bag, rabbit, Bob. | ب alone, بـ at the start (باب), ـبـ in the middle (لعبة), ـب at the end (كلب). Small English b stays the same wherever it is: bag, baby, rabbit. | Script error: in كتاب the final ب follows alif (a non-joining letter), so it is written in its isolated form ب, not ـب. كلب shows a true final ـب. Bob replaced because it starts with capital B in a capital-letter class. |
| arabicBridge[2].pointAr | ب منفردة، وبـ في البداية (باب)، وـبـ في الوسط، وـب في النهاية (كتاب). أما حرف b الإنجليزي الصغير فيبقى بالشكل نفسه أينما كان: bag و rabbit و Bob. | ب منفردة، وبـ في البداية (باب)، وـبـ في الوسط (لعبة)، وـب في النهاية (كلب). أما حرف b الإنجليزي الصغير فيبقى بالشكل نفسه أينما كان: bag و baby و rabbit. | Same correction; missing middle example added. |
| arabicBridge[4].arabic | ١٢٣ (تُقرأ من اليسار أيضاً) | ١٢٣ (منزلتها الكبرى على اليسار أيضاً) | Arabic numbers can be read aloud units-first (ثلاثة وعشرون ومئة); the true point is how they are written. |
| commonErrors[0].why | Almost all young children reverse them at this age; switching between two writing directions can add to the confusion. Use the 'bed' hands trick. | Many young children reverse them at this age; switching between two writing directions may add to the confusion. Use the 'bed' hands trick. | Hedged frequency and causation claims. |
| commonErrors[4].why | a mummy letter and a baby letter. | a mommy letter and a baby letter. | American English (lessons use mom). |
| stage 2 teacherSays[0] | Meet the A family. Mummy A is big. Baby a is small. Same name: 'ay'. Same sound: /a/, apple! | Meet the A family. Mommy A is big. Baby a is small. Same name: 'ay'. Same sound: /æ/, apple! | American English; IPA for apple is /æ/. |
| stage 2 teacherSays[2] | A long, long time ago, people wrote only big letters, on stone. | A long, long time ago, the Romans carved big letters in stone. | Matched to the corrected history fact. |
| stage 2 teacherSaysAr[1] | قديماً كان الناس يكتبون الحروف الكبيرة فقط على الحجر، | قديماً كان الرومان ينحتون الحروف الكبيرة على الحجر، | Arabic matched. |
| stage 2 studentsDo[1] | Draw a mummy letter | Draw a mommy letter | American English. |
| stage 2 exercise instructions | Find the baby letter for each mummy letter. | Find the baby letter for each mommy letter. | American English. |
| stage 2 exercise item A | "a - /a/ apple" | "a - /æ/ apple" | IPA. |
| stage 3 method/purpose | Visual discrimination and categorisation | Visual discrimination and categorization | American spelling. |
| stage 3 purpose | can recognise every letter | can recognize every letter | American spelling. |
| stage 3 tips[0] | Some families are 'nearly twins' (K k, P p, U u, V v, X x, Y y): accept 'twins' and say 'almost!'. | Some families are 'nearly twins' (K k, P p, U u, Y y): accept 'twins' and say 'almost!'. V v and X x are twins, just like W w. | Consistency: W w is keyed 'twins', and V v / X x differ from it only in size too. |
| stage 3 tips[1] | single-storey | single-story | American spelling. |
| stage 5 teacherSays[4] | Look at ب. Alone: ب. At the start of باب: بـ. At the end of كتاب: ـب. It changes! English b stays the same: bag, rabbit. | Look at ب. Alone: ب. At the start of باب: بـ. In the middle of لعبة: ـبـ. At the end of كلب: ـب. It changes! English b stays the same: bag, rabbit. | Script error: final ب in كتاب is isolated (after alif), not ـب. |
| stage 5 studentsDo[2] | (باب, كتاب) | (باب, لعبة, كلب) | Words that really show the initial, medial and final forms. |
| stage 6 purpose | Practise reading direction | Practice reading direction | American spelling. |
| stage 6 teacherSays[3] | Make two fists. Thumbs up! | Make two fists, fingers facing you. Thumbs up! | The trick only works with palms/fingers towards the child (left thumb on the left = b). |
| stage 6 teacherSaysAr[2] | اصنع قبضتين وارفع إبهاميك. | اصنع قبضتين وأصابعك نحوك، وارفع إبهاميك. | Same, Arabic. |
| stage 7 nameAr | الحرف الكبير أولاً ثم الصغيرة | الحرف الكبير أولاً ثم الحروف الصغيرة | Arabic: adjective needs its noun (agreement/clarity). |
| stage 7 method | Personalised writing | Personalized writing | American spelling. |
| stage 7 teacherSaysAr[0] | والحرف الأول كبير، والباقي صغيرة. | والحرف الأول كبير، وبقية الحروف صغيرة. | Arabic agreement: الباقي (masc. sing.) with صغيرة. |
| stage 8 teacherSays[1] | People in Europe learned them from Arab scientists long ago! | People in Europe learned them long ago from scientists who wrote in Arabic! | Matched to the corrected fact. |
| stage 8 teacherSaysAr[1] | لأن أوروبا تعلّمتها من العلماء العرب قديماً! | لأن أوروبا تعلّمتها قديماً من علماء كتبوا بالعربية! | Arabic matched. |
| teacherNotes (new last item) | - | Timing: 60 minutes online is long for 4-5 year olds. Keep every stage short and moving, add a 30-second stand-and-stretch between seated stages when attention drops, and if time runs short, shorten the history part of the Linguistics Corner rather than the movement break or the exit ticket. | 60 minutes is at the edge of what 4-6 year olds manage online; gives the teacher a concrete plan for flagging attention without changing the stage timings. |

**Verified correct, no change:**

- Stage minutes 5+8+9+5+9+9+8+7 = 60.
- 26 English letters / 52 case shapes; Arabic 28 letters; Arabic has no capitals.
- Six Arabic letters never join the following letter: ا د ذ ر ز و.
- Positional forms ب بـ ـبـ ـب and ت تـ ـتـ ـت given in the correct order.
- Upper case / lower case from printers' type cases.
- Arabic books open on the side where English books end.
- Multi-digit numbers in Arabic script are written with the highest place value on the left (١٢٣).
- Hindu-Arabic numerals reached Europe through Arabic-language mathematics, originally from India.
- Twins/different key (10 items) and capital/small match (8 items) correct; exit distractors fine.
- Teams sends the teacher's video unmirrored, so facing the camera reverses left/right for children (tip correct); self-view is mirrored (tip correct).
- English cursive can join letters (tip correct).
- 'bed' hand trick works with fingers facing the child (now stated).
- b/d reversal normal until about age 7 (common guidance, hedged 'about').

## Could not verify / owner or native-speaker decisions

1. **60 minutes for ages 4-6 online.** Each class already has short stages and a movement break, so I kept the timings and added a teacher note on how to trim. For 4-year-olds, 60 minutes is at the upper limit of what is realistic. The owner should decide whether Pre-A bonus classes should run 45 minutes, or 60 minutes with a second movement break.
2. **Arabic term for the syrinx.** I removed المِصفار because I could not confirm it as a standard term. A native editor can restore it if it is attested.
3. **Gulf syllable counts.** The count for سمكة (and other words) changes by dialect. The notes now say to count the way the child says the word. A Gulf-dialect speaker should check the hedge.
4. **elephant in Bonus 3** (taught in Lesson 13, after this class) is kept as a declared preview because the plan names it. Alternative: use a known 3-beat word such as um-brel-la or xy-lo-phone as the headline example.
5. **Tajweed reference (ghunna, Bonus 1).** It is accurate and respectful, and is now hedged with 'may'. The owner should confirm that a Quran reference is wanted in a mixed-background English class. The neutral fallback is the humming nose sound of م and ن.
6. **Tongue twister خيط حرير على حيط خليل** is now labelled colloquial (it is Levantine in flavour). The owner may prefer a Gulf or Egyptian twister.
7. **Lumi.** Lumi is described as a chick or bird in the bonus files. I did not check this against the brand bible.
8. **Bonus 4 numerals note.** I added that ١٢٣ are often called الأرقام الهندية in Arabic. This is useful for parents, but the owner may find it too much detail for the children's slide.

## 45-minute redesign + US IPA (12 Oct)

Owner rule (BRIEF.md, 12 Oct 2026): Pre-A bonus classes are 45 minutes; IPA is General American (Cambridge US style). Each class went from 8 stages (60 min) to 7 stages (45 min). All 4 objectives are kept in every class. I cut the weakest or longest parts and merged overlapping activities instead of squeezing everything in. Every class keeps one movement break, a Linguistics Corner, the Arabic Bridge, the 5-item exit ticket (unchanged) and its best activities. `durationMinutes` is now 45 in all four files. `gen_bonus_plans.py --check` reports "28 bonus classes OK". Backups of the 60-minute versions are in the session scratchpad (prea45/).

Stage tables use "S1, S2 ..." for the new stage order. "Old Sn" means the stage number in the 60-minute version.

### IPA (all four classes)

| Field / location | Before | After | Reason |
|---|---|---|---|
| B1 linguisticsCorner.facts[1].en/.ar | /k/ and /g/ | /k/ and /ɡ/ | The brief's Cambridge US style uses the IPA letter ɡ (as in /ɡoʊ/), not the keyboard g. |
| B2 arabicBridge[3].english/.point/.pointAr (5 places) | /g/ | /ɡ/ | Same. |
| B2 S2 exercise item green; S2 tips[0] | /g/ | /ɡ/ | Same. |
| B4 S2 exercise item G | g - /g/ goat | g - /ɡ/ goat | Same. |

**Checked and already General American, no change:** sun /s/ + /ʌ/ + /n/ (US /sʌn/); apple /æ/; egg /e/ (Cambridge US writes /eɡ/); queen /kw/; yellow /j/; three /θ/; /r/ is the phonemic symbol Cambridge uses for American r. The other symbols are consonants that are the same in both accents. No British-only vowels (ɒ, əʊ, eə, ɪə, ʊə, non-rhotic forms) appear in Pre-A. Letter names in quotes ('bee', 'aitch', 'jee') are respellings, not IPA. Z is never named, so the 'zee'/'zed' question does not come up. Stretched teaching sounds such as /mmm/ and /sss/ are classroom notation and are kept on purpose.

### Bonus Class 1: My Mouth Makes Music

New plan: S1 Warm-up + Noise or Word? 5 · S2 Linguistics Corner: Mouth Helpers 9 · S3 Movement 4 · S4 Arabic Bridge 7 · S5 Name or Sound? game 8 · S6 My Name Sound 7 · S7 Exit 5 = 45.

| Field / location | Before | After | Reason |
|---|---|---|---|
| durationMinutes | 60 | 45 | Owner rule. |
| Old S1 Warm-up (5) + Old S2 Linguistics Corner: Noise or Word? (8) | Two stages, 13 min: hello song, close-eyes guessing of 3 noises, clap-back rhythm, then 8 noise/word items, a dog-cannot-talk line, a Lumi-has-no-lips line, and children making their own noise and word | S1 "Warm-up: Hello Song and the Sound Box (Noise or Word?)", 5 min: hello song, then the sound box becomes the noise-or-word game (6 items: clap, hello, knock, cat, bell/spoon on cup, moon) | The noise/word point is simple and was the weakest use of 8 minutes. Merging it into the sound-box hook keeps objective 1 and frees time. The close-eyes guessing, the clap-back rhythm, the dog/bird lines and the own-noise turn are cut. The cough and whistle items are replaced by the bell/cup that is already in the teacher materials. |
| S1 teacherSays / teacherSaysAr / studentsDo / tips | (from the old S1 + S2) | Rewritten for the merged stage: 5 EN lines, 4 AR lines, 3 studentsDo, 3 tips (hide your mouth behind a card; keep it at 'noise' and 'word') | Matches the merged activity. |
| Old S3 → S2 name | Meet the Mouth Helpers: Lips, Teeth, Tongue | Linguistics Corner: Meet the Mouth Helpers (Lips, Teeth, Tongue) | The mouth helpers are the class's real Linguistics Corner content (linguisticsCorner facts 1-3), so the Linguistics Corner label moves here. |
| S2 nameAr | تعرّف على مساعدي الفم: الشفتان والأسنان واللسان | ركن اللغويات: تعرّف على مساعدي الفم (الشفتان والأسنان واللسان) | Same. |
| S2 minutes | 10 | 9 | Time. |
| S2 studentsDo[2] | Hold a tissue or paper in front of the mouth: it moves for /p/, not much for /b/. | Hold a hand (or a light tissue) in front of the mouth: feel the puff for /p/, not much for /b/. | The hand test is quicker and needs nothing. The tissue stays optional. |
| S2 exercise items | 8 (/m/ /b/ /p/ /f/ /l/ /d/ /n/ /k/) | 6 (/m/ /b/ /p/ /f/ /l/ /k/) | Time. /d/ and /n/ repeat the tongue-tip answer of /l/. All three helpers, the nose hum and the /p/ puff are still covered. |
| Old S4 → S3 Movement minutes | 5 | 4 | Time. |
| S3 studentsDo | 3 items, including "One child calls a sound; the others do its movement." | That item removed | Fits 4 minutes. |
| Old S5 → S4 Arabic Bridge minutes | 8 | 7 | Time. |
| S4 studentsDo[0] | for B, M, N, L, F, D, K, P | for B, M, N, L, F, P | Matches the shorter exercise. |
| S4 studentsDo[1] | (B-ب, M-م, N-ن, L-ل, F-ف, D-د, K-ك) | (B-ب, M-م, N-ن, L-ل, F-ف) | Same. |
| S4 exercise items | 8 (B M N L F D K P) | 6 (B M N L F P) | Time. P (no Arabic letter) is kept. arabicBridge[2] (ghunna) is untouched and verbatim, as instructed. |
| Old S6 → S5 game minutes | 10 | 8 | Time. |
| S5 studentsDo | 4 items, including "Take a turn being Lumi and say a letter name or sound for the group." | That item moved to a new tip: "If there is time left, let one child be Lumi... skip this when time is short." | Optional extra, so it can be dropped first. |
| S5 exercise items | 10 (ball moon fish dog lion nose hat pen rabbit kite) | 8 (ball moon fish lion nose hat pen kite) | Time. dog and rabbit add no new contrast. hat (/h/ vs 'aitch') and pen (/p/ vs /b/) are kept. |
| Old S7 → S6 My Name Sound minutes | 8 | 7 | Time. |
| S6 method | Personalized speaking + drawing (multisensory) | Personalized speaking + sky writing (multisensory) | Drawing a self-portrait takes 3-4 minutes for this age, and drawing is already in the homework. |
| S6 teacherSays[3] | Draw a big picture of you. Write or copy your first letter next to it. | Look at your first letter on the slide. Write it in the air with your finger. Big! | Same. |
| S6 teacherSaysAr[3] | ارسم نفسك واكتب أول حرف من اسمك بجانب الرسمة. | انظر إلى أول حرف من اسمك على الشاشة، واكتبه في الهواء بإصبعك. كبيراً! | Same. |
| S6 studentsDo[3] | Draw themselves and copy the first letter of their name (teacher shows it on the slide). | Sky-write the first letter of their name with a finger (the teacher shows it on the slide). | Same. |
| S6 exercise items | 8 (Lumi Sara Ziad Noor Mona Badr Hala Fatima) | 6 (Lumi Sara Ziad Noor Badr Fatima) | Time. Mona is only the teacher's model name (tip). Hala's /h/ is already in the game. Lips, teeth, tongue, buzz and nose hum are all still covered. |
| Old S8 → S7 Exit minutes | 6 | 5 | Time. The exit ticket (5 items) is unchanged. |
| S7 studentsDo[0] | Answer 5 quick picture items one by one... | Answer the 5 quick exit-ticket items one by one... | Accuracy: item 5 is a name-or-sound item, not a picture. |
| materials.student | ... "Paper and crayons" | removed | Nothing is drawn in class any more (drawing is homework). |
| assessment.successCriteria[0] | at least 6 of 8 noise-or-word items | at least 5 of 6 noise-or-word items | Matches the 6 items now in the exercise. |
| assessment.successCriteria[1] | at least 7 of 10 pictures | at least 6 of 8 pictures | Matches the 8 items now in the exercise. |
| teacherNotes (Timing) | Timing: 60 minutes online is long for 4-5 year olds... shorten the Arabic Bridge rather than the movement break or the exit ticket. | Timing: this class is 45 minutes (5 + 9 + 4 + 7 + 8 + 7 + 5)... If the group is slow, trim in this order: do 6 pictures instead of 8 in the Name or Sound game, skip the friend's-name turn in My Name Sound, then match only B, M and P in the Arabic Bridge. Never cut the movement break or the exit ticket. | New length, with a trim order. |
| homework | (unchanged) | (unchanged) | It refers to nothing that was cut. |

### Bonus Class 2: First Sound Detectives

New plan: S1 Warm-up 5 · S2 Linguistics Corner: Catch the First Sound 8 · S3 I Spy + Trickster Cases 9 · S4 Movement 4 · S5 Arabic Bridge 7 · S6 Silly Sound Chants 7 · S7 Exit 5 = 45.

| Field / location | Before | After | Reason |
|---|---|---|---|
| durationMinutes | 60 | 45 | Owner rule. |
| S1 Warm-up | 5 min | unchanged | Already short. |
| S2 Linguistics Corner exercise items | 10 (sun moon zebra red yellow water nine dog van green) | 8 (sun moon zebra red yellow water van green) | Time. nine and dog repeat /n/-type and stop sounds. van (/v/) and green (/ɡ/) are kept. Minutes stay at 8. |
| Old S3 I Spy (10) + Old S6 Detective Cases: Sort the Pictures and Catch the Tricksters (8) | Two stages, 18 min: I spy (8 clues) + object hunt + child as spy, then sorting 6 number pictures into /s/ /t/ /f/ houses + 3 trickster cases | S3 "I Spy with Lumi and the Trickster Cases" (nameAr لعبة أرى بعيني مع لومي وقضايا المخادعين), 9 min: I spy (5 clues: tree, zebra, clock, fish, van), one 10-second object hunt for /b/, then the 3 trickster cases (cat/kite, one, xylophone) | The sorting houses repeated the I-spy skill (matching words to a first sound) and were the weakest 8 minutes. The trickster discovery is "the heart of the class" (tip), so it is kept in full. The child-as-spy turn and the moon/water/lion clues are cut. |
| S3 method / purpose / teacherSays / teacherSaysAr / studentsDo / exercise / tips | (from the old S3 + S6) | Rewritten for the merged stage. The exercise is point-and-say, 8 items (5 I spy + 3 trickster cases). The instructions add "Trickster cases: say the first sound you hear." Tips: one hunt round of 10-15 seconds; accept Arabic object names; trickster tips kept | Matches the merged activity. |
| Old S4 → S4 Movement minutes | 5 | 4 | Time. |
| S4 teacherSays[3] / teacherSaysAr[2] / studentsDo[1] | Second round: "New sound: /t/. Touch your toes if it starts with /t/!" | removed | Fits 4 minutes. The 8-item /s/ round, with its zebra and three traps, is kept. |
| Old S5 → S5 Arabic Bridge minutes | 8 | 7 | Time. |
| S5 teacherSays[4] / teacherSaysAr[3] | The hamza line (Arabic words always start with a consonant... apple starts right away with a vowel) | removed from the script. New tip: "The vowel-start point (apple vs أرنب with its hamza) is in the Arabic Bridge table; use it only if a child asks." | Not practised in any exercise. The teacher keeps it as background (arabicBridge[4] unchanged). |
| S5 exercise items | 10 (sun moon lion zero red yellow water three tree van) | 8 (sun moon red yellow water three tree van) | Time. three/tree and van, the real contrasts, are kept. |
| Old S7 → S6 Silly Sound Chants minutes | 10 | 7 | Time. This was the longest seated stage. |
| S6 teacherSays[2] | More chants: Six silly suns! ... Ten tall trees! (stretch up) Zebra zooms to zero! (run on the spot) | ...Ten tall trees! (stretch up) | Time. |
| S6 teacherSaysAr[4] | وفي العربية أيضاً جمل صعبة النطق... خيط حرير على حيط خليل! | removed. New tip: "Only if there is time left: try the Arabic tongue twister from the Arabic Bridge table..." | Time. It is also the item the earlier review flagged (Levantine flavour). It stays in arabicBridge[5] as optional background. |
| S6 studentsDo | Chant each line 3 times...; make a name chant... then draw it; try the Arabic tongue twister... | Chant each line 2 times...; make a name chant (no drawing); tongue-twister item removed | Time. |
| S6 exercise items | 8 (Big blue / Six silly / Five funny / Ten tall / Zebra zooms to / Lumi likes / Red ... / Ziad's ...) | 5 (Big blue / Six silly / Five funny / Ten tall / Ziad's ...) | Time. The name chant (objective 3) is kept. |
| S6 tips[2] | 'tall', 'funny', 'silly', 'zooms' and 'likes' are support words... | 'tall', 'funny' and 'silly' are support words... | zooms and likes are no longer used. |
| Old S8 → S7 Exit minutes | 6 | 5 | Time. The exit ticket is unchanged. |
| materials.teacher[2] (picture cards) | 28 cards incl. six, seven, ten, two, four, five, nine, zero, blue, nose, lion, dog | 16 cards: sun, fish, clock, moon, zebra, red, yellow, water, van, green, tree, three, cat, kite, one, xylophone | Only the cards the 45-minute plan uses. The number sort is gone, and the movement words are said aloud with no cards. |
| materials.student | ... "Paper and crayons" | removed | Nothing is drawn in class any more. |
| homework.en | ...draw them in one 'sound house'. | ...draw them together in one big house. | The 'sound house' sort was cut, so the homework now explains itself. |
| homework.ar | وارسمها في 'بيت صوت' واحد. | وارسمها معاً داخل بيت كبير. | Same. |
| differentiation.challenge[0] | Fill a sound house alone: a number, a thing and a name... | Find a number, a thing and a name that share a first sound... | Same. |
| assessment.successCriteria[0] | at least 7 of 10 pictures | at least 6 of 8 pictures | Matches the 8 items. |
| assessment.successCriteria[1] | Finds the picture for at least 6 of 8 I-spy clues. | Finds the picture for at least 4 of 5 I-spy clues and gives the first sound of at least 2 of 3 trickster cases. | Matches the merged exercise. |
| assessment.successCriteria[2] | Sorts at least 6 of 9 pictures into the right sound house. | Points to the matching Arabic letter (or crosses arms) for at least 6 of 8 words. | The sort was cut. Objective 4 (Arabic letter with the same first sound) had no criterion before. |
| teacherNotes (Timing) | Timing: 60 minutes online is long... | Timing: this class is 45 minutes (5 + 8 + 9 + 4 + 7 + 7 + 5)... trim in this order: skip the object hunt in I Spy (picture scene only), do 3 chants instead of 5, then match 6 words instead of 8 in the Arabic Bridge (keep three, tree and van). Never cut the trickster cases, the movement break or the exit ticket. | New length, with a trim order. |

### Bonus Class 3: Rhyme Time and Clap the Beats

New plan: S1 Warm-up rap 4 · S2 Linguistics Corner: What Is a Rhyme? 7 · S3 Rhyme Match 7 · S4 Movement 4 · S5 Arabic Bridge 6 · S6 Syllable Gym and Name Trains 12 · S7 Exit 5 = 45.

| Field / location | Before | After | Reason |
|---|---|---|---|
| durationMinutes | 60 | 45 | Owner rule. |
| S1 Warm-up minutes | 5 | 4 | Time. Content unchanged. The hat should be ready before class (materials). |
| S2 Linguistics Corner minutes | 8 | 7 | Time. |
| S2 exercise items | 9 (cat-hat, dog-frog, cat-cake, fish-dish, duck-dog, nose-toes, red-bed, bird-mom, two-blue) | 7 (cat-hat, dog-frog, cat-cake, fish-dish, nose-toes, bird-mom, two-blue) | Time. cat-cake (rhyme vs same start) and two-blue (sound, not spelling) are kept. |
| S3 Rhyme Match minutes | 8 | 7 | Time. |
| S3 exercise items | 8 (...A dog on a log; My teddy is red, he is in my bed) | 6 (cat/hat, fish/dish, duck/truck, nose/toes, kite/white, two/blue) | Time. The log line is already in the warm-up rap. The teddy/bed line needed an extra picture word. |
| S4 Movement minutes | 5 | 4 | Time. All 6 items kept. |
| S5 Arabic Bridge minutes | 7 | 6 | Time. Content unchanged. |
| Old S6 Clap the Beats: Syllable Gym (10) + Old S7 Beat Trains: Sort the Words and Clap Our Names (10) | Two stages, 20 min: 12 clap-and-count words, then a 10-word train sort, a train drawing and a group beat chant | S6 "Clap the Beats: Syllable Gym and Name Trains" (nameAr صفّق للنبضات: رياضة المقاطع وقطارات الأسماء), 12 min: clap, chin test, robot walk, black as 1 beat, then each child claps their own and friends' names and says which train they ride | The train sort repeated the clap-and-count skill. The drawing and group chant were the longest low-yield parts. The name clapping (objective 4, the strongest motivation) is kept. |
| S6 method / purpose / teacherSays / teacherSaysAr / studentsDo / tips | (from the old S6 + S7) | Rewritten for the merged stage (6 EN, 6 AR lines). The tips keep: hyphens for the teacher only, chin test, elephant preview, family name forms (Mu-ham-mad, Fat-ma), every child gets a turn | Matches the merged activity. |
| S6 exercise items | 12 (cat rab-bit ba-by el-e-phant duck grand-ma um-brel-la pur-ple black sis-ter xy-lo-phone hands) | 8 (cat rab-bit ba-by el-e-phant black um-brel-la pur-ple hands) | Time. 1-, 2- and 3-beat words, black (cluster trap) and purple (/p/) are kept. The 10-item train-sort exercise is removed with the sort. |
| Old S8 → S7 Exit minutes | 7 | 5 | Time. The exit ticket is unchanged. |
| materials.teacher[2] (picture cards) | ... red, bed, ... sister, grandma, ... yellow, ... xylophone | those 6 removed | They are no longer used on cards. bed is only said aloud in the movement break. |
| materials.student | "Paper and crayons" first | removed | Nothing is drawn in class any more. Drawing a beat train stays in the homework, and the name trains are on the slide. |
| assessment.successCriteria[0] | at least 7 of 9 rhyme pairs | at least 5 of 7 rhyme pairs | Matches the 7 items. |
| assessment.successCriteria[1] | at least 5 of 8 rhyming lines | at least 4 of 6 rhyming lines | Matches the 6 items. |
| assessment.successCriteria[2] | at least 9 of 12 words | at least 6 of 8 words | Matches the 8 items. |
| teacherNotes[1] | (log, dish, truck, frog, toes, bed, spoon, cake, teddy) | (log, dish, truck, frog, toes, bed, spoon, cake) | teddy is no longer used. |
| teacherNotes (Timing) | Timing: 60 minutes online is long... | Timing: this class is 45 minutes (4 + 7 + 7 + 4 + 6 + 12 + 5)... trim in this order: skip the robot walk (keep clapping and the chin test), skip the Arabic poetry line in the Arabic Bridge, then do 4 rhyming lines instead of 6. Never cut the name clapping, the movement break or the exit ticket. | New length, with a trim order. |
| homework | (unchanged) | (unchanged) | "Draw a beat train" still matches the name trains on the slide. |

### Bonus Class 4: Big Letters, Small Letters, Left to Right

New plan: S1 Warm-up song 4 · S2 Linguistics Corner: One Letter, Two Shapes (with a quick twins/different gesture) 8 · S3 Movement: Sky Writing 4 · S4 Arabic Bridge 8 · S5 Left-to-Right Train and the 'bed' Trick 8 · S6 My Name Card 8 · S7 Exit 5 = 45.

| Field / location | Before | After | Reason |
|---|---|---|---|
| durationMinutes | 60 | 45 | Owner rule. |
| S1 Warm-up minutes | 5 | 4 | Time. Content unchanged. |
| Old S3 Twins or Different? Letter Family Sort (9 min, 10-item sort) | full stage | removed. Its key idea is now a one-minute gesture inside S2 (see the next rows) | It repeated the matching skill of S2 and was the weakest 9 minutes. The twins idea is kept as a quick gesture. |
| S2 teacherSays (new [2]) | - | Some families are twins: big O, small o. Hands together! Some are different: big A, small a. Hands apart! | Brings in the twins idea. |
| S2 teacherSaysAr (new [1]) | - | بعض العائلات توائم: O و o لهما الشكل نفسه، فضمّ يديك. وبعضها مختلف: A و a، فافتح يديك. | Same. |
| S2 studentsDo (new [1]) | - | Show 'twins' (hands together) or 'different' (hands apart) for O o, A a, S s and G g. | Same. |
| S2 exercise items | 8 (A B M E R G D Q) | 6 (A B E R G Q) | Time. M looks alike in both forms, and D is practised in S5. |
| S2 tips | [0] (A a, B b, E e, R r, G g, D d, Q q); [1] history tip | [0] (A a, B b, E e, R r, G g, Q q); [1] history tip; [2] the print-font tip from the old twins stage (single-story a and g) | Matches the items. The font tip still matters for the slide. |
| S3 Movement minutes | 5 | 4 | Time. |
| S4 Arabic Bridge minutes | 9 | 8 | Time. |
| S4 exercise items | 8 | 6 (left to right; no big letters; letter changes shape; letters stand apart in a book; most letters join; a name starts with a big letter) | Removed "We write from right to left" (the mirror of item 1) and "Letters have big and small shapes" (the mirror of "no big letters"). |
| S5 Left-to-Right Train minutes | 9 | 8 | Time. |
| S5 studentsDo[3] | Circle b or d at the start of picture words on paper. | removed | Time. The bed trick is practised orally with the hands. |
| S5 exercise items | 8 (bag dog book bread dad banana duck cake) | 6 (bag dog book dad banana cake) | Time. Both b and d are kept, plus the cake trickster. |
| S6 My Name Card minutes | 8 | 8 | Unchanged. This is objective 4. |
| S6 studentsDo[1] | Decorate the name card and show it to the camera. | Hold the name card up to the camera. | Decorating is cut for time. The door name card is in the homework. |
| S6 exercise items | 7 (sara bAg dook koob ziad MILK nOOr) | 5 (sara bAg dook koob nOOr) | Time. ziad repeats sara. MILK was removed because the class's own tip said it is 'not wrong' on signs, so its answer was not the only defensible one (brief, point 4). |
| S6 tips | 3, incl. "MILK in all capitals is not 'wrong' on a sign or a box..." | that tip removed | The item is gone. |
| Old S8 → S7 Exit minutes | 7 | 5 | Time. The exit ticket is unchanged. |
| assessment.successCriteria[0] | at least 6 of 8 big letters | at least 5 of 6 big letters | Matches the 6 items. |
| assessment.successCriteria[1] | Sorts at least 7 of 10 families as twins or different. | Answers at least 5 of 6 'Arabic or English?' items correctly. | The sort was cut. Objective 3 (two ways Arabic differs) had no criterion before. |
| teacherNotes (Timing) | Timing: 60 minutes online is long... shorten the history part of the Linguistics Corner... | Timing: this class is 45 minutes (4 + 8 + 4 + 8 + 8 + 8 + 5)... trim in this order: shorten the history story to one sentence about the printers' boxes, fix only 3 of Lumi's mistakes, then do 4 'Arabic or English?' items instead of 6. Never cut the name writing, the movement break or the exit ticket. | New length, with a trim order. |
| homework | (unchanged) | (unchanged) | It refers to nothing that was cut. |

**Verified, no change:** stage minutes add up to 45 in all four classes. The 5-item exit tickets still match the objectives, and the success-criteria counts match the remaining exercise items. Each class keeps exactly one movement break (B4 also has the stand/crouch song). No string in Pre-A still says 60 minutes. B1 arabicBridge[2] (Holy Quran / ghunna) is byte-identical to the owner's reviewer version.

**For the owner:**
1. **IPA ɡ across levels.** Pre-A now uses /ɡ/ as the brief does. Level 4 bonus01 still has one /g/. Other reviewers may want to align it.
2. **B4 student materials** still list "Food or school things from home (optional)". No stage used them, before or after this change. I left the line as it was. It can be deleted.
3. **Optional extras** (B1 child-as-Lumi turn, B2 Arabic tongue twister, B2 hamza point) are now "only if time" tips. This avoids squeezing them into 45 minutes. The owner may prefer to drop them completely.
