# -*- coding: utf-8 -*-
"""
Full rebuild of grammar-hub/level3.json through level9.json, fixing:
1. Present Simple was missing entirely from Level 3 (should be the
   very first grammar topic taught -- Present Continuous was there
   instead, which is backwards).
2. No topic anywhere covered Present Simple negatives (don't/doesn't).
3. Real duplicates across levels: Superlatives, Imperatives,
   Present Continuous, Should/Shouldn't, Countable & Uncountable
   Nouns, How much/How many, Past Simple Questions, and Past
   Continuous all appeared twice, sometimes 3+ levels apart with no
   cross-reference.
See teacher-guide/grammar-scope-and-sequence.md for the full
academic rationale.
"""
import json

def topic(title, titleAr, explanation, explanationAr, examples):
    return {"title": title, "titleAr": titleAr, "explanation": explanation,
            "explanationAr": explanationAr, "examples": examples}

def ex(en, ar):
    return {"en": en, "ar": ar}

LEVELS = {}

# ============================================================
# LEVEL 3 -- My World (A1, foundational). Present Simple now
# leads, as it should -- every other structure in this level
# builds on "subject + verb".
# ============================================================
LEVELS["level3"] = {"levelName": "Level 3 · My World", "topics": [
  topic("Present Simple (I/you/we/they)", "المضارع البسيط (أنا/أنت/نحن/هم)",
    "We use the base verb with I, you, we, and they to talk about facts, habits, and things that are always true.",
    "نستخدم الفعل الأساسي مع I وyou وwe وthey للحديث عن حقائق وعادات وأشياء صحيحة دائما.",
    [ex("I play football.", "ألعب كرة القدم."), ex("You live in a big town.", "تعيش في مدينة كبيرة."),
     ex("We like animals.", "نحب الحيوانات."), ex("They go to school every day.", "يذهبون إلى المدرسة كل يوم.")]),
  topic("Present Simple (he/she/it + -s)", "المضارع البسيط (هو/هي/هو -- غير عاقل)",
    "With he, she, and it, we add -s (or -es) to the end of the verb.",
    "مع he وshe وit، نضيف -s (أو -es) إلى نهاية الفعل.",
    [ex("He plays football.", "هو يلعب كرة القدم."), ex("She goes to school by bus.", "هي تذهب إلى المدرسة بالحافلة."),
     ex("It rains a lot in winter.", "تمطر كثيرا في الشتاء."), ex("My dad works every day.", "والدي يعمل كل يوم.")]),
  topic("Present Simple Negatives", "نفي المضارع البسيط",
    "We use \"don't\" (I/you/we/they) or \"doesn't\" (he/she/it) before the base verb to make a negative sentence.",
    "نستخدم \"don't\" (أنا/أنت/نحن/هم) أو \"doesn't\" (هو/هي) قبل الفعل الأساسي لصنع جملة منفية.",
    [ex("I don't like broccoli.", "لا أحب البروكلي."), ex("She doesn't eat meat.", "هي لا تأكل اللحم."),
     ex("We don't go there on Fridays.", "لا نذهب هناك أيام الجمعة."), ex("He doesn't play video games.", "هو لا يلعب ألعاب الفيديو.")]),
  topic("There is / There are", "يوجد / توجد",
    "We use \"there is\" for one thing, and \"there are\" for more than one thing.",
    "نستخدم \"there is\" لشيء واحد، و\"there are\" لأكثر من شيء واحد.",
    [ex("There is a book on the table.", "يوجد كتاب على الطاولة."), ex("There are three cats in the garden.", "توجد ثلاث قطط في الحديقة."),
     ex("There isn't any milk in the fridge.", "لا يوجد حليب في الثلاجة."), ex("Are there any pencils in your bag?", "هل يوجد أقلام رصاص في حقيبتك؟")]),
  topic("This / That / These / Those", "هذا/ذلك/هؤلاء/أولئك",
    "\"This\" and \"these\" point to things near us. \"That\" and \"those\" point to things far away. \"This/that\" are singular; \"these/those\" are plural.",
    "\"This\" و\"these\" للإشارة إلى أشياء قريبة. \"That\" و\"those\" للإشارة إلى أشياء بعيدة. \"this/that\" للمفرد، و\"these/those\" للجمع.",
    [ex("This is my pencil.", "هذا قلمي."), ex("That is your bag, over there.", "تلك حقيبتك، هناك."),
     ex("These are my books.", "هذه كتبي."), ex("Those are nice shoes.", "تلك أحذية جميلة.")]),
  topic("Plural Nouns", "صيغة الجمع",
    "Most nouns add -s to become plural. Nouns ending in s/sh/ch/x add -es. Some nouns are irregular.",
    "معظم الأسماء تضيف -s لتصبح جمعا. الأسماء المنتهية بـ s/sh/ch/x تضيف -es. بعض الأسماء شاذة.",
    [ex("I have two boxes.", "لدي صندوقان."), ex("Three children are playing.", "ثلاثة أطفال يلعبون."),
     ex("She has two watches.", "لديها ساعتان."), ex("Two men are talking.", "رجلان يتحدثان.")]),
  topic("Possessive Adjectives", "صفات الملكية",
    "My, your, his, her, its, our, and their go before a noun to show who it belongs to.",
    "my وyour وhis وher وits وour وtheir تأتي قبل الاسم لتوضح ملكيته.",
    [ex("This is my bag.", "هذه حقيبتي."), ex("Is that your pencil?", "هل ذلك قلمك؟"),
     ex("This is her doll.", "هذه دميتها."), ex("This is their house.", "هذا منزلهم.")]),
  topic("Prepositions of Place", "حروف الجر المكانية",
    "Words like next to, between, behind, in front of, above, and below tell us where something is.",
    "كلمات مثل next to وbetween وbehind وin front of وabove وbelow تخبرنا بمكان شيء ما.",
    [ex("The cat is next to the box.", "القطة بجانب الصندوق."), ex("The ball is between the chairs.", "الكرة بين الكرسيين."),
     ex("The dog is behind the door.", "الكلب خلف الباب."), ex("The lamp is above the table.", "المصباح فوق الطاولة.")]),
  topic("Can / Can't (Ability)", "can / can't (القدرة)",
    "We use \"can\" to say what someone is able to do, and \"can't\" for what they are not able to do.",
    "نستخدم \"can\" لقول ما يستطيع شخص فعله، و\"can't\" لما لا يستطيع فعله.",
    [ex("I can swim.", "أستطيع السباحة."), ex("Can you climb trees?", "هل تستطيع تسلق الأشجار؟"),
     ex("She can't fly.", "هي لا تستطيع الطيران."), ex("We can play football together.", "نستطيع لعب كرة القدم معا.")]),
  topic("Wh- Questions", "أسئلة Wh",
    "Who, what, where, when, why, and how start questions that ask for specific information, not just yes/no.",
    "who وwhat وwhere وwhen وwhy وhow تبدأ أسئلة تطلب معلومة محددة، وليس فقط نعم/لا.",
    [ex("Who is that?", "من ذلك؟"), ex("Where do you live?", "أين تعيش؟"),
     ex("When is your birthday?", "متى عيد ميلادك؟"), ex("Why are you happy?", "لماذا أنت سعيد؟")]),
  topic("Comparatives (bigger, smaller)", "صيغة المقارنة",
    "We add -er to short adjectives (or use \"more\" with longer ones) to compare two things.",
    "نضيف -er للصفات القصيرة (أو نستخدم \"more\" مع الأطول) لمقارنة شيئين.",
    [ex("The elephant is bigger than the fox.", "الفيل أكبر من الثعلب."), ex("This box is smaller than that one.", "هذا الصندوق أصغر من ذلك."),
     ex("She is taller than her brother.", "هي أطول من أخيها."), ex("My bag is heavier than yours.", "حقيبتي أثقل من حقيبتك.")]),
  topic("Articles: a / an / the", "أدوات التعريف والتنكير",
    "We use \"a\" before consonant sounds and \"an\" before vowel sounds for one unspecified thing. We use \"the\" for something specific.",
    "نستخدم \"a\" قبل الأصوات الساكنة و\"an\" قبل الأصوات الصوتية لشيء غير محدد. نستخدم \"the\" لشيء محدد.",
    [ex("I have a dog.", "لدي كلب."), ex("She has an apple.", "لديها تفاحة."),
     ex("The dog is brown.", "الكلب بني."), ex("Where is the library?", "أين المكتبة؟")]),
  topic("Imperatives (Commands)", "صيغة الأمر",
    "We use the base verb alone to give commands or instructions, without a subject.",
    "نستخدم الفعل الأساسي وحده لإعطاء أوامر أو تعليمات، دون ذكر الفاعل.",
    [ex("Stop!", "توقف!"), ex("Look at the board.", "انظر إلى السبورة."),
     ex("Don't run in the classroom.", "لا تجرِ في الفصل."), ex("Please sit down.", "من فضلك اجلس.")]),
  topic("Present Continuous (I am doing)", "المضارع المستمر",
    "We use \"am/is/are + verb-ing\" for actions happening right now -- this is different from Present Simple, which is for habits and facts.",
    "نستخدم \"am/is/are + الفعل مع ing\" لأفعال تحدث الآن -- وهذا مختلف عن المضارع البسيط المستخدم للعادات والحقائق.",
    [ex("I am playing football now.", "ألعب كرة القدم الآن."), ex("She is reading a book right now.", "هي تقرأ كتابا الآن."),
     ex("They are running in the park.", "هم يجرون في الحديقة."), ex("Is he sleeping?", "هل هو نائم؟")]),
]}

# ============================================================
# LEVEL 4 -- Every Day (A1+). Builds directly on Level 3's
# Present Simple with questions, frequency, and routines.
# ============================================================
LEVELS["level4"] = {"levelName": "Level 4 · Every Day", "topics": [
  topic("Present Simple Questions (Do / Does)", "أسئلة المضارع البسيط",
    "We use \"Do\" (I/you/we/they) or \"Does\" (he/she/it) at the start of a question, followed by the base verb.",
    "نستخدم \"Do\" (أنا/أنت/نحن/هم) أو \"Does\" (هو/هي) في بداية السؤال، متبوعة بالفعل الأساسي.",
    [ex("Do you like pizza?", "هل تحب البيتزا؟"), ex("Does she play tennis?", "هل تلعب التنس؟"),
     ex("Do they go to this school?", "هل يذهبون إلى هذه المدرسة؟"), ex("What time does he wake up?", "في أي وقت يستيقظ؟")]),
  topic("Present Simple for Routines", "المضارع البسيط للروتين اليومي",
    "We use Present Simple to describe things we do regularly, as part of our daily routine.",
    "نستخدم المضارع البسيط لوصف أشياء نفعلها بانتظام، كجزء من روتيننا اليومي.",
    [ex("I wake up at seven every day.", "أستيقظ الساعة السابعة كل يوم."), ex("She brushes her teeth every morning.", "هي تنظف أسنانها كل صباح."),
     ex("We have dinner at eight.", "نتناول العشاء الساعة الثامنة."), ex("He goes to bed at nine.", "يذهب إلى النوم الساعة التاسعة.")]),
  topic("Adverbs of Frequency", "ظروف التكرار",
    "Words like always, usually, sometimes, often, rarely, and never tell us how often something happens. They usually go before the main verb.",
    "كلمات مثل always وusually وsometimes وoften وrarely وnever تخبرنا كم مرة يحدث شيء ما. تأتي عادة قبل الفعل الرئيسي.",
    [ex("I always brush my teeth.", "أنظف أسناني دائما."), ex("We sometimes play outside.", "نلعب في الخارج أحيانا."),
     ex("He never eats candy for breakfast.", "هو لا يأكل الحلوى في الفطور أبدا."), ex("She usually walks to school.", "هي تمشي إلى المدرسة عادة.")]),
  topic("Prepositions of Time", "حروف الجر الزمنية",
    "We use \"at\" for exact times, \"on\" for days and dates, and \"in\" for months, years, and longer periods.",
    "نستخدم \"at\" للأوقات المحددة، و\"on\" للأيام والتواريخ، و\"in\" للشهور والسنوات والفترات الأطول.",
    [ex("School starts at eight o'clock.", "تبدأ المدرسة الساعة الثامنة."), ex("My birthday is on Monday.", "عيد ميلادي يوم الاثنين."),
     ex("We go on holiday in June.", "نذهب في إجازة في يونيو."), ex("I was born in 2016.", "ولدت في 2016.")]),
  topic("Object Pronouns", "ضمائر المفعول به",
    "Me, him, her, us, them, and it replace a noun that receives the action of the verb.",
    "me وhim وher وus وthem وit تحل محل اسم يستقبل فعل الفاعل.",
    [ex("Give it to me.", "أعطها لي."), ex("I see him at school.", "أراه في المدرسة."),
     ex("I like her.", "أحبها."), ex("She helps us.", "تساعدنا.")]),
  topic("Possessive Pronouns (mine, yours, his, hers)", "ضمائر الملكية",
    "Possessive pronouns replace a noun to show ownership, without repeating the noun.",
    "ضمائر الملكية تحل محل الاسم لإظهار الملكية، دون تكرار الاسم.",
    [ex("This book is mine.", "هذا الكتاب لي."), ex("Is that pen yours?", "هل ذلك القلم لك؟"),
     ex("That bag is hers.", "تلك الحقيبة لها."), ex("This classroom is ours.", "هذا الفصل لنا.")]),
  topic("Some / Any", "some / any",
    "We use \"some\" in positive sentences and \"any\" in questions and negatives, with both countable and uncountable nouns.",
    "نستخدم \"some\" في الجمل المثبتة و\"any\" في الأسئلة والنفي، مع الأسماء المعدودة وغير المعدودة.",
    [ex("I have some water.", "لدي بعض الماء."), ex("Is there any milk?", "هل يوجد حليب؟"),
     ex("We need some rice.", "نحتاج بعض الأرز."), ex("I don't have any juice.", "ليس لدي أي عصير.")]),
  topic("Countable & Uncountable Nouns", "الأسماء المعدودة وغير المعدودة",
    "Countable nouns can be counted (one apple, two apples). Uncountable nouns cannot (water, rice, sugar) and have no plural form.",
    "الأسماء المعدودة يمكن عدّها (تفاحة، تفاحتان). الأسماء غير المعدودة لا يمكن عدّها (ماء، أرز، سكر) وليس لها صيغة جمع.",
    [ex("I have three apples.", "لدي ثلاث تفاحات."), ex("There is some water.", "يوجد بعض الماء."),
     ex("We need some rice.", "نحتاج بعض الأرز."), ex("How many eggs do you have?", "كم بيضة لديك؟")]),
  topic("How much / How many", "كم (للكمية)",
    "We use \"how many\" with countable nouns and \"how much\" with uncountable nouns to ask about quantity.",
    "نستخدم \"how many\" مع الأسماء المعدودة و\"how much\" مع الأسماء غير المعدودة للسؤال عن الكمية.",
    [ex("How many apples do you want?", "كم تفاحة تريد؟"), ex("How much water do we need?", "كم من الماء نحتاج؟"),
     ex("How much does it cost?", "كم يكلف هذا؟"), ex("How many friends do you have?", "كم صديقا لديك؟")]),
  topic("Superlatives (the biggest, the best)", "صيغة التفضيل المطلق",
    "We use \"the + adjective-est\" (or \"the most + adjective\") to compare three or more things.",
    "نستخدم \"the + الصفة مع est\" (أو \"the most + الصفة\") لمقارنة ثلاثة أشياء أو أكثر.",
    [ex("The elephant is the biggest animal.", "الفيل هو أكبر حيوان."), ex("This is the smallest box.", "هذا هو أصغر صندوق."),
     ex("She is the fastest runner.", "هي أسرع عداءة."), ex("That is the most beautiful flower.", "تلك هي أجمل زهرة.")]),
  topic("Would like / Want (polite requests)", "would like / want (طلبات مهذبة)",
    "\"I would like\" is a polite way to say \"I want\", often used when ordering food or asking for something.",
    "\"I would like\" طريقة مهذبة لقول \"أريد\"، تُستخدم غالبا عند طلب الطعام أو طلب شيء ما.",
    [ex("I would like a pizza, please.", "أريد بيتزا من فضلك."), ex("What would you like to drink?", "ماذا تريد أن تشرب؟"),
     ex("She wants a new bag.", "هي تريد حقيبة جديدة."), ex("Would you like some help?", "هل تريد بعض المساعدة؟")]),
  topic("Should / Shouldn't (advice)", "should / shouldn't (النصيحة)",
    "We use \"should\" to give advice or say what is a good idea, and \"shouldn't\" for what is not a good idea.",
    "نستخدم \"should\" لتقديم نصيحة أو قول ما هي الفكرة الجيدة، و\"shouldn't\" لما ليس فكرة جيدة.",
    [ex("You should eat vegetables.", "يجب أن تأكل الخضروات."), ex("You shouldn't eat junk food every day.", "يجب ألا تأكل طعاما غير صحي كل يوم."),
     ex("He should rest today.", "يجب أن يستريح اليوم."), ex("We should help our friends.", "يجب أن نساعد أصدقاءنا.")]),
]}

# ============================================================
# LEVEL 5 -- Stories Begin (A2 early). Past Simple foundation.
# Duplicates removed: Countable/Uncountable + How much/How many
# (already at Level 4), redundant "Did you...?" question topic
# (folded into the main Past Simple Q&N topic).
# ============================================================
LEVELS["level5"] = {"levelName": "Level 5 · Stories Begin", "topics": [
  topic("Past Simple — Regular Verbs", "الماضي البسيط -- الأفعال المنتظمة",
    "We add -ed to the base verb to talk about finished actions in the past.",
    "نضيف -ed إلى الفعل الأساسي للحديث عن أفعال منتهية في الماضي.",
    [ex("I played football yesterday.", "لعبت كرة القدم بالأمس."), ex("She walked to school.", "مشت إلى المدرسة."),
     ex("We watched a movie.", "شاهدنا فيلما."), ex("They visited their grandma.", "زاروا جدتهم.")]),
  topic("Past Simple — Irregular Verbs", "الماضي البسيط -- الأفعال الشاذة",
    "Many common verbs don't follow the -ed rule and have a special past form that must be memorized.",
    "العديد من الأفعال الشائعة لا تتبع قاعدة -ed ولها صيغة ماضٍ خاصة يجب حفظها.",
    [ex("I went to the park.", "ذهبت إلى الحديقة."), ex("She ate breakfast.", "أكلت الفطور."),
     ex("We saw a movie.", "شاهدنا فيلما."), ex("They had a great day.", "قضوا يوما رائعا.")]),
  topic("Past Simple Negatives & Questions", "نفي وأسئلة الماضي البسيط",
    "We use \"didn't\" + base verb for negatives, and \"Did\" + subject + base verb for questions -- for both regular and irregular verbs.",
    "نستخدم \"didn't\" + الفعل الأساسي للنفي، و\"Did\" + الفاعل + الفعل الأساسي للأسئلة -- للأفعال المنتظمة والشاذة.",
    [ex("I didn't watch TV yesterday.", "لم أشاهد التلفاز بالأمس."), ex("Did you go to school yesterday?", "هل ذهبت إلى المدرسة بالأمس؟"),
     ex("What did you do last weekend?", "ماذا فعلت في عطلة نهاية الأسبوع الماضية؟"), ex("She didn't like the movie.", "هي لم تحب الفيلم.")]),
  topic("Was / Were", "was / were",
    "\"Was\" is the past form of \"is/am\" (I, he, she, it). \"Were\" is the past form of \"are\" (you, we, they).",
    "\"Was\" هي صيغة الماضي لـ \"is/am\". \"Were\" هي صيغة الماضي لـ \"are\".",
    [ex("I was happy yesterday.", "كنت سعيدا بالأمس."), ex("She was at school.", "كانت في المدرسة."),
     ex("We were tired.", "كنا متعبين."), ex("Were they at the party?", "هل كانوا في الحفلة؟")]),
  topic("There was / There were", "كان يوجد / كانت توجد",
    "The past forms of \"there is/are\", used to say what existed or happened in the past.",
    "صيغتا الماضي لـ \"there is/are\"، تُستخدمان لقول ما كان موجودا أو حدث في الماضي.",
    [ex("There was a book on the table.", "كان يوجد كتاب على الطاولة."), ex("There were three cats in the garden.", "كانت توجد ثلاث قطط في الحديقة."),
     ex("There wasn't any milk.", "لم يكن هناك حليب."), ex("Were there many people there?", "هل كان هناك أناس كثيرون؟")]),
  topic("Time Expressions (ago, last, yesterday)", "تعبيرات زمنية",
    "Words like yesterday, last week, and two days ago tell us when a past action happened.",
    "كلمات مثل yesterday وlast week وtwo days ago تخبرنا متى حدث فعل في الماضي.",
    [ex("I saw her yesterday.", "رأيتها بالأمس."), ex("We went there last week.", "ذهبنا هناك الأسبوع الماضي."),
     ex("He called two days ago.", "اتصل قبل يومين."), ex("They moved here last year.", "انتقلوا إلى هنا العام الماضي.")]),
  topic("Sequencing Words (first, then, next, finally)", "كلمات الترتيب الزمني",
    "We use sequencing words to show the order of events when telling a story.",
    "نستخدم كلمات الترتيب الزمني لإظهار تسلسل الأحداث عند سرد قصة.",
    [ex("First, I woke up.", "أولا، استيقظت."), ex("Then, I had breakfast.", "ثم، تناولت الفطور."),
     ex("Next, we went to the park.", "بعد ذلك، ذهبنا إلى الحديقة."), ex("Finally, we went home.", "أخيرا، ذهبنا إلى المنزل.")]),
  topic("Because (giving reasons)", "because (إعطاء الأسباب)",
    "We use \"because\" to connect a reason to an action or feeling.",
    "نستخدم \"because\" لربط سبب بفعل أو شعور.",
    [ex("I was happy because I saw my friend.", "كنت سعيدا لأنني رأيت صديقي."), ex("She was tired because she ran a lot.", "كانت متعبة لأنها جرت كثيرا."),
     ex("We stayed home because it was rainy.", "بقينا في المنزل لأن الجو كان ممطرا."), ex("Why are you sad? Because I lost my toy.", "لماذا أنت حزين؟ لأنني فقدت لعبتي.")]),
  topic("Feelings in the Past", "المشاعر في الماضي",
    "We describe how someone felt about a past event using \"was/were + feeling adjective\".",
    "نصف شعور شخص تجاه حدث ماضٍ باستخدام \"was/were + صفة الشعور\".",
    [ex("I was excited about the trip.", "كنت متحمسا للرحلة."), ex("He was scared of the dark.", "كان خائفا من الظلام."),
     ex("They were proud of their project.", "كانوا فخورين بمشروعهم."), ex("Were you nervous before the test?", "هل كنت متوترا قبل الاختبار؟")]),
  topic("Past Continuous (intro)", "الماضي المستمر (مقدمة)",
    "We use \"was/were + verb-ing\" to talk about an action that was in progress at a specific time in the past.",
    "نستخدم \"was/were + الفعل مع ing\" للتحدث عن فعل كان مستمرا في وقت محدد في الماضي.",
    [ex("I was reading a book at 8pm.", "كنت أقرأ كتابا الساعة الثامنة مساء."), ex("They were playing outside.", "كانوا يلعبون في الخارج."),
     ex("She was cooking dinner.", "كانت تطبخ العشاء."), ex("What were you doing yesterday?", "ماذا كنت تفعل بالأمس؟")]),
]}

# ============================================================
# LEVEL 6 -- Growing Up (A2). Future forms + Past Continuous
# fully developed (was only "intro" at Level 5). Duplicates
# removed: plain "Present Continuous" re-intro, "Should/
# Shouldn't" (already Level 4).
# ============================================================
LEVELS["level6"] = {"levelName": "Level 6 · Growing Up", "topics": [
  topic("Going to (Future Plans)", "going to (خطط المستقبل)",
    "We use \"am/is/are + going to + verb\" to talk about plans and intentions for the future.",
    "نستخدم \"am/is/are + going to + الفعل\" للحديث عن خطط ونوايا للمستقبل.",
    [ex("I am going to visit my grandma.", "سأزور جدتي."), ex("She is going to study tonight.", "ستدرس الليلة."),
     ex("We are going to travel this summer.", "سنسافر هذا الصيف."), ex("Are you going to come to the party?", "هل ستأتي إلى الحفلة؟")]),
  topic("Will (Future Predictions)", "will (توقعات المستقبل)",
    "We use \"will + base verb\" to make predictions or promises about the future, often without a fixed plan.",
    "نستخدم \"will + الفعل الأساسي\" لتوقع أو الوعد بشيء في المستقبل، غالبا دون خطة ثابتة.",
    [ex("It will rain tomorrow.", "ستمطر غدا."), ex("I will help you.", "سأساعدك."),
     ex("She will be a great doctor.", "ستكون طبيبة رائعة."), ex("They won't be late.", "لن يتأخروا.")]),
  topic("Present Continuous for Future Plans", "المضارع المستمر للخطط المستقبلية",
    "We can also use the Present Continuous to talk about fixed, arranged plans in the near future.",
    "يمكننا أيضا استخدام المضارع المستمر للحديث عن خطط مؤكدة ومرتبة في المستقبل القريب.",
    [ex("I am meeting my friend tomorrow.", "سألتقي بصديقي غدا."), ex("We are having a party on Saturday.", "سنقيم حفلة يوم السبت."),
     ex("She is starting a new class next week.", "ستبدأ صفا جديدا الأسبوع القادم."), ex("Are you coming to school tomorrow?", "هل ستأتي إلى المدرسة غدا؟")]),
  topic("Past Continuous (full)", "الماضي المستمر (كامل)",
    "Past Continuous often appears with Past Simple to show one action interrupting another that was already in progress.",
    "غالبا ما يظهر الماضي المستمر مع الماضي البسيط ليوضح فعلا قاطع فعلا آخر كان مستمرا بالفعل.",
    [ex("I was watching TV when you called.", "كنت أشاهد التلفاز عندما اتصلت."), ex("She was sleeping when the phone rang.", "كانت نائمة عندما رن الهاتف."),
     ex("While we were walking, it started to rain.", "بينما كنا نمشي، بدأ المطر."), ex("What were you doing at 7pm yesterday?", "ماذا كنت تفعل الساعة السابعة مساء بالأمس؟")]),
  topic("Have to / Don't have to", "have to / don't have to",
    "\"Have to\" shows something is necessary. \"Don't have to\" shows something is not necessary (but still okay to do).",
    "\"Have to\" توضح أن شيئا ضروري. \"Don't have to\" توضح أن شيئا غير ضروري (لكن لا بأس بفعله).",
    [ex("I have to finish my homework.", "يجب أن أنهي واجبي."), ex("You don't have to come if you're tired.", "لا يجب أن تأتي إذا كنت متعبا."),
     ex("She has to wake up early.", "يجب أن تستيقظ باكرا."), ex("We don't have to wear a uniform today.", "لا يجب أن نرتدي الزي اليوم.")]),
  topic("Adverbs of Manner", "ظروف الطريقة",
    "Adverbs of manner (usually adjective + -ly) describe how an action is done.",
    "ظروف الطريقة (عادة صفة + -ly) تصف كيف يتم فعل ما.",
    [ex("She sings beautifully.", "تغني بشكل جميل."), ex("He runs quickly.", "يجري بسرعة."),
     ex("They worked carefully.", "عملوا بعناية."), ex("Please speak quietly.", "من فضلك تحدث بهدوء.")]),
  topic("Comparatives & Superlatives with Long Adjectives", "المقارنة والتفضيل مع الصفات الطويلة",
    "For longer adjectives (usually 2+ syllables), we use \"more\" for comparatives and \"the most\" for superlatives, instead of -er/-est.",
    "للصفات الأطول (عادة مقطعان أو أكثر)، نستخدم \"more\" للمقارنة و\"the most\" للتفضيل، بدلا من -er/-est.",
    [ex("This book is more interesting than that one.", "هذا الكتاب أكثر إثارة للاهتمام من ذاك."), ex("She is the most beautiful singer.", "هي أجمل مغنية."),
     ex("Math is more difficult than art.", "الرياضيات أصعب من الفن."), ex("This is the most expensive toy.", "هذه أغلى لعبة.")]),
]}

# ============================================================
# LEVEL 7 -- Wide World (A2+/B1 early). Present Perfect and
# conditionals -- unchanged, no duplicates found here.
# ============================================================
LEVELS["level7"] = {"levelName": "Level 7 · Wide World", "topics": [
  topic("Present Perfect", "المضارع التام",
    "We use \"have/has + past participle\" for past actions with a connection to now, or when the exact time isn't important.",
    "نستخدم \"have/has + التصريف الثالث\" لأفعال ماضية لها صلة بالحاضر، أو عندما لا يكون الوقت الدقيق مهما.",
    [ex("I have finished my homework.", "لقد أنهيت واجبي."), ex("She has visited Paris.", "لقد زارت باريس."),
     ex("We have seen this movie.", "لقد شاهدنا هذا الفيلم."), ex("Have you ever tried sushi?", "هل جربت السوشي من قبل؟")]),
  topic("Present Perfect vs Past Simple", "المضارع التام مقابل الماضي البسيط",
    "Use Past Simple for a finished time (yesterday, last week). Use Present Perfect when the time isn't stated or still connects to now.",
    "استخدم الماضي البسيط لوقت منتهٍ (أمس، الأسبوع الماضي). استخدم المضارع التام عندما لا يُذكر الوقت أو لا يزال متصلا بالحاضر.",
    [ex("I visited London in 2019.", "زرت لندن في 2019."), ex("I have visited London.", "لقد زرت لندن."),
     ex("She lost her keys yesterday.", "فقدت مفاتيحها بالأمس."), ex("She has lost her keys.", "لقد فقدت مفاتيحها.")]),
  topic("Present Perfect with For and Since", "المضارع التام مع for و since",
    "\"For\" is used with a period of time (for two years). \"Since\" is used with a starting point (since 2020).",
    "\"For\" تُستخدم مع فترة زمنية (for two years). \"Since\" تُستخدم مع نقطة بداية (since 2020).",
    [ex("I have lived here for five years.", "أعيش هنا منذ خمس سنوات."), ex("She has known him since 2018.", "تعرفه منذ 2018."),
     ex("We have studied English for two years.", "ندرس الإنجليزية منذ سنتين."), ex("He has been sick since Monday.", "هو مريض منذ الاثنين.")]),
  topic("First Conditional", "الشرط الأول",
    "\"If + present simple, will + base verb\" describes a real, possible situation and its likely result.",
    "\"If + مضارع بسيط، will + فعل أساسي\" تصف موقفا حقيقيا وممكنا ونتيجته المحتملة.",
    [ex("If it rains, I will stay home.", "إذا أمطرت، سأبقى في المنزل."), ex("If you study, you will pass the test.", "إذا درست، ستنجح في الاختبار."),
     ex("If she calls, I will answer.", "إذا اتصلت، سأرد."), ex("We will be late if we don't hurry.", "سنتأخر إذا لم نسرع.")]),
  topic("Second Conditional", "الشرط الثاني",
    "\"If + past simple, would + base verb\" describes an unreal or unlikely situation and its imagined result.",
    "\"If + ماضٍ بسيط، would + فعل أساسي\" تصف موقفا غير حقيقي أو غير محتمل ونتيجته المتخيلة.",
    [ex("If I had a million dollars, I would travel the world.", "لو كان لدي مليون دولار، لسافرت حول العالم."), ex("If I were you, I would apologize.", "لو كنت مكانك، لاعتذرت."),
     ex("She would be happier if she had a pet.", "ستكون أسعد لو كان لديها حيوان أليف."), ex("What would you do if you won the lottery?", "ماذا ستفعل لو فزت باليانصيب؟")]),
  topic("Used to", "used to",
    "\"Used to + base verb\" describes a past habit or state that is no longer true.",
    "\"used to + فعل أساسي\" تصف عادة أو حالة ماضية لم تعد صحيحة.",
    [ex("I used to be afraid of the dark.", "كنت أخاف من الظلام في الماضي."), ex("She used to live in Cairo.", "كانت تعيش في القاهرة."),
     ex("We used to play together every day.", "كنا نلعب معا كل يوم."), ex("Did you use to like vegetables?", "هل كنت تحب الخضروات؟")]),
  topic("Question Tags", "أسئلة التأكيد",
    "A short question added to the end of a statement, to check or confirm information.",
    "سؤال قصير يُضاف إلى نهاية جملة، للتحقق من معلومة أو تأكيدها.",
    [ex("You like pizza, don't you?", "تحب البيتزا، أليس كذلك؟"), ex("She isn't here, is she?", "هي ليست هنا، أليس كذلك؟"),
     ex("It's cold today, isn't it?", "الجو بارد اليوم، أليس كذلك؟"), ex("You can swim, can't you?", "تستطيع السباحة، أليس كذلك؟")]),
  topic("Too / Enough", "too / enough",
    "\"Too\" (before an adjective) means more than needed, in a negative way. \"Enough\" (after an adjective) means the right amount.",
    "\"Too\" (قبل الصفة) تعني أكثر من اللازم، بشكل سلبي. \"Enough\" (بعد الصفة) تعني الكمية المناسبة.",
    [ex("This box is too heavy for me.", "هذا الصندوق ثقيل جدا بالنسبة لي."), ex("Is the water warm enough?", "هل الماء دافئ بما يكفي؟"),
     ex("She is too tired to play.", "هي متعبة جدا لتلعب."), ex("I don't have enough money.", "ليس لدي ما يكفي من المال.")]),
]}

# ============================================================
# LEVEL 8 -- Think & Talk (B1). Duplicates removed: Past
# Continuous topics (now fully covered at Level 6).
# ============================================================
LEVELS["level8"] = {"levelName": "Level 8 · Think & Talk", "topics": [
  topic("Modal Verbs — Advice & Obligation", "أفعال الوجوب والنصيحة",
    "Should, must, and have to all relate to advice or obligation, but with different strength -- should is softest, must/have to are strongest.",
    "should وmust وhave to كلها متعلقة بالنصيحة أو الوجوب، لكن بدرجات مختلفة -- should الأخف، وmust/have to الأقوى.",
    [ex("You should drink more water.", "يجب أن تشرب المزيد من الماء."), ex("You must wear a seatbelt.", "يجب أن ترتدي حزام الأمان."),
     ex("I have to finish this today.", "يجب أن أنهي هذا اليوم."), ex("You mustn't be late.", "يجب ألا تتأخر.")]),
  topic("Passive Voice (Simple Introduction)", "المبني للمجهول (مقدمة)",
    "We use \"is/are + past participle\" when the focus is on the action or the receiver, not who did it.",
    "نستخدم \"is/are + التصريف الثالث\" عندما يكون التركيز على الفعل أو من وقع عليه الفعل، وليس من قام به.",
    [ex("The cake is made by my mom.", "الكعكة صنعتها أمي."), ex("The letter was sent yesterday.", "أُرسلت الرسالة بالأمس."),
     ex("English is spoken in many countries.", "تُتحدث الإنجليزية في دول كثيرة."), ex("This bridge was built in 1990.", "بُني هذا الجسر عام 1990.")]),
  topic("Gerunds & Infinitives", "المصدر الفعلي والمصدر مع to",
    "Some verbs are followed by -ing (gerund: enjoy swimming), others by \"to + verb\" (infinitive: want to swim). There's no single rule -- it depends on the verb.",
    "بعض الأفعال تُتبع بـ -ing (enjoy swimming)، وأخرى بـ \"to + فعل\" (want to swim). لا توجد قاعدة واحدة -- يعتمد على الفعل.",
    [ex("I enjoy reading books.", "أستمتع بقراءة الكتب."), ex("She wants to travel.", "تريد أن تسافر."),
     ex("We finished eating.", "انتهينا من الأكل."), ex("They decided to leave early.", "قرروا المغادرة مبكرا.")]),
  topic("As...As Comparisons", "as...as (المقارنة بالتساوي)",
    "\"As + adjective + as\" shows that two things are equal in some way.",
    "\"as + صفة + as\" توضح أن شيئين متساويان بطريقة ما.",
    [ex("She is as tall as her brother.", "هي بنفس طول أخيها."), ex("This book is as good as that one.", "هذا الكتاب جيد مثل ذاك."),
     ex("He isn't as fast as me.", "هو ليس سريعا مثلي."), ex("Is it as cold as yesterday?", "هل هو بارد مثل الأمس؟")]),
  topic("Might / May (Possibility)", "might / may (الاحتمال)",
    "\"Might\" and \"may\" show something is possible but not certain.",
    "\"might\" و\"may\" توضحان أن شيئا ممكنا لكن غير مؤكد.",
    [ex("It might rain later.", "قد تمطر لاحقا."), ex("She may come to the party.", "قد تأتي إلى الحفلة."),
     ex("We might go to the beach this weekend.", "قد نذهب إلى الشاطئ نهاية هذا الأسبوع."), ex("He may not know the answer.", "قد لا يعرف الإجابة.")]),
  topic("Reflexive Pronouns", "الضمائر الانعكاسية",
    "Myself, yourself, himself, herself, itself, ourselves, and themselves are used when the subject and object of a verb are the same person.",
    "myself وyourself وhimself وherself وitself وourselves وthemselves تُستخدم عندما يكون فاعل الفعل ومفعوله نفس الشخص.",
    [ex("I hurt myself.", "آذيت نفسي."), ex("She made this cake herself.", "صنعت هذه الكعكة بنفسها."),
     ex("They enjoyed themselves at the party.", "استمتعوا بأنفسهم في الحفلة."), ex("Look at yourself in the mirror.", "انظر إلى نفسك في المرآة.")]),
]}

# ============================================================
# LEVEL 9 -- Express Yourself (B1). Unchanged, no duplicates
# found -- the natural capstone of the tense/structure system.
# ============================================================
LEVELS["level9"] = {"levelName": "Level 9 · Express Yourself", "topics": [
  topic("Reported Speech", "الكلام المنقول",
    "When we report what someone said, we usually shift the tense back one step (present becomes past, etc.).",
    "عندما ننقل ما قاله شخص ما، نحول الزمن عادة خطوة للخلف (المضارع يصبح ماضيا، إلخ).",
    [ex("\"I am tired,\" she said. -> She said she was tired.", "\"أنا متعبة\"، قالت. -> قالت إنها كانت متعبة."), ex("\"I will help,\" he said. -> He said he would help.", "\"سأساعد\"، قال. -> قال إنه سيساعد."),
     ex("\"We like pizza,\" they said. -> They said they liked pizza.", "\"نحب البيتزا\"، قالوا. -> قالوا إنهم يحبون البيتزا."), ex("\"I have finished,\" she said. -> She said she had finished.", "\"لقد انتهيت\"، قالت. -> قالت إنها انتهت.")]),
  topic("Relative Clauses (who, which, that)", "الجمل الموصولة",
    "Who, which, and that connect extra information to a noun. \"Who\" is for people, \"which\" for things, \"that\" for either.",
    "who وwhich وthat تربط معلومة إضافية باسم. \"who\" للأشخاص، و\"which\" للأشياء، و\"that\" للاثنين.",
    [ex("The girl who lives next door is my friend.", "الفتاة التي تعيش بجانبنا صديقتي."), ex("The book which I read was great.", "الكتاب الذي قرأته كان رائعا."),
     ex("This is the dog that barks a lot.", "هذا هو الكلب الذي ينبح كثيرا."), ex("I know the boy who won the race.", "أعرف الولد الذي فاز بالسباق.")]),
  topic("Third Conditional", "الشرط الثالث",
    "\"If + past perfect, would have + past participle\" describes an unreal past situation and its imagined (but impossible now) result.",
    "\"If + ماضٍ تام، would have + التصريف الثالث\" تصف موقفا ماضيا غير حقيقي ونتيجته المتخيلة (المستحيلة الآن).",
    [ex("If I had studied, I would have passed.", "لو كنت درست، لكنت نجحت."), ex("If it hadn't rained, we would have gone out.", "لو لم تمطر، لكنا خرجنا."),
     ex("She would have called if she had known.", "كانت ستتصل لو عرفت."), ex("If they had left earlier, they wouldn't have missed the bus.", "لو غادروا مبكرا، لما فاتتهم الحافلة.")]),
  topic("Reported Questions", "الأسئلة المنقولة",
    "When reporting a question, the word order changes to a statement, and we don't use a question mark.",
    "عند نقل سؤال، يتغير ترتيب الكلمات إلى جملة خبرية، ولا نستخدم علامة استفهام.",
    [ex("\"Where do you live?\" -> She asked where I lived.", "\"أين تعيش؟\" -> سألت أين أعيش."), ex("\"Are you happy?\" -> He asked if I was happy.", "\"هل أنت سعيد؟\" -> سأل إن كنت سعيدا."),
     ex("\"What is your name?\" -> They asked what my name was.", "\"ما اسمك؟\" -> سألوا ما اسمي."), ex("\"Can you help?\" -> She asked if I could help.", "\"هل يمكنك المساعدة؟\" -> سألت إن كان بإمكاني المساعدة.")]),
  topic("Common Phrasal Verbs", "الأفعال المركبة الشائعة",
    "A phrasal verb is a verb + preposition/particle whose meaning is often different from the individual words.",
    "الفعل المركب هو فعل + حرف جر/أداة، ومعناه غالبا مختلف عن معنى الكلمات منفردة.",
    [ex("Please turn off the light.", "من فضلك أطفئ الضوء."), ex("I need to look after my sister.", "أحتاج إلى الاعتناء بأختي."),
     ex("Can you give up sugar?", "هل تستطيع التخلي عن السكر؟"), ex("They set up a new club.", "أسسوا ناديا جديدا.")]),
  topic("Wish / If Only", "wish / if only",
    "We use \"wish\" or \"if only\" + past simple to talk about something we want to be different now.",
    "نستخدم \"wish\" أو \"if only\" + ماضٍ بسيط للحديث عن شيء نريده مختلفا الآن.",
    [ex("I wish I had a pet.", "أتمنى لو كان لدي حيوان أليف."), ex("If only I knew the answer.", "ليتني أعرف الإجابة."),
     ex("She wishes she could fly.", "تتمنى لو كانت تستطيع الطيران."), ex("I wish it wasn't raining.", "أتمنى لو لم تكن تمطر.")]),
  topic("Past Perfect", "الماضي التام",
    "\"Had + past participle\" describes an action that happened before another action in the past.",
    "\"had + التصريف الثالث\" تصف فعلا حدث قبل فعل آخر في الماضي.",
    [ex("I had finished my homework before dinner.", "كنت قد أنهيت واجبي قبل العشاء."), ex("She had left when I arrived.", "كانت قد غادرت عندما وصلت."),
     ex("We had never seen snow before that trip.", "لم نكن قد رأينا الثلج قبل تلك الرحلة."), ex("Had you eaten before the movie?", "هل كنت قد أكلت قبل الفيلم؟")]),
  topic("Linking Words (although, however, despite)", "أدوات الربط",
    "Words like although, however, and despite connect contrasting ideas in a sentence or between sentences.",
    "كلمات مثل although وhowever وdespite تربط أفكارا متناقضة داخل جملة أو بين جمل.",
    [ex("Although it was raining, we played outside.", "على الرغم من أنها كانت تمطر، لعبنا في الخارج."), ex("I was tired. However, I finished my homework.", "كنت متعبا. ومع ذلك، أنهيت واجبي."),
     ex("Despite the cold, she went swimming.", "رغم البرد، ذهبت للسباحة."), ex("He is young; however, he is very smart.", "هو صغير؛ ومع ذلك، فهو ذكي جدا.")]),
]}

for level, content in LEVELS.items():
    data = {"level": level, "levelName": content["levelName"], "topics": content["topics"]}
    with open(f"grammar-hub/{level}.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(level, "->", len(content["topics"]), "topics")
