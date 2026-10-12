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
