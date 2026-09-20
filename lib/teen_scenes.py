"""Scene slides for the Teen Track (Levels 4-6).

One entry per lesson: the sentence shown in the caption box, the words to
highlight, and the Arabic line. The image is assets/vocab-scenes/<level>/NN.jpg;
if that file is missing the slide is simply skipped (Level 6 lesson 15 is
still to be generated).
"""

def _s(en, bold, ar): return {"en": en, "bold": bold, "ar": ar}

SCENES = {
 "level4": {
  1: _s("Does she practice every day?", ["practice", "every day"], "هل تتدرب كل يوم؟"),
  2: _s("I finish my homework after dinner.", ["finish", "after dinner"], "أنهي واجبي بعد العشاء."),
  3: _s("I rarely watch TV.", ["rarely", "watch TV"], "نادراً ما أشاهد التلفاز."),
  4: _s("The deadline is on Friday.", ["deadline", "Friday"], "الموعد النهائي يوم الجمعة."),
  5: _s("Send it to me.", ["Send"], "أرسله لي."),
  6: _s("That jacket is mine.", ["jacket", "mine"], "تلك السترة لي."),
  7: _s("Do we have any snacks?", ["any", "snacks"], "هل لدينا أي وجبات خفيفة؟"),
  8: _s("Check the price tag.", ["price tag"], "تحقق من بطاقة السعر."),
  9: _s("I save some money every week.", ["save", "money"], "أوفر بعض المال كل أسبوع."),
  10: _s("She is the most talented singer.", ["most talented"], "هي المغنية الأكثر موهبة."),
  11: _s("I would like to order a pizza.", ["would like", "order"], "أود أن أطلب بيتزا."),
  12: _s("You should try it.", ["should", "try"], "يجب أن تجربها."),
  13: _s("She posts every day.", ["posts", "every day"], "تنشر كل يوم."),
  14: _s("We support each other.", ["support", "each other"], "ندعم بعضنا البعض."),
  15: _s("There are two options.", ["two options"], "هناك خياران."),
  16: _s("I always feel nervous before tests.", ["nervous", "tests"], "أشعر دائماً بالتوتر قبل الاختبارات."),
  17: _s("My goal is to learn coding.", ["goal", "coding"], "هدفي هو تعلم البرمجة."),
  18: _s("Every country has its own culture.", ["country", "culture"], "لكل بلد ثقافته الخاصة."),
  19: _s("They find a compromise.", ["compromise"], "يتوصلون إلى حل وسط."),
  20: _s("This is my plan for next year.", ["plan", "next year"], "هذه خطتي للعام القادم."),
 },
 "level5": {
  1: _s("I played football with my friends.", ["played", "football"], "لعبت كرة القدم مع أصدقائي."),
  2: _s("We saw a great show.", ["saw", "show"], "شاهدنا عرضاً رائعاً."),
  3: _s("Did you finish your homework?", ["Did", "finish"], "هل أنهيت واجبك؟"),
  4: _s("The mall was crowded.", ["mall", "crowded"], "كان المركز التجاري مزدحماً."),
  5: _s("There was a long line.", ["long line"], "كان هناك طابور طويل."),
  6: _s("We went to the beach last summer.", ["went", "last summer"], "ذهبنا إلى الشاطئ الصيف الماضي."),
  7: _s("First, we packed our bags.", ["First", "packed"], "أولاً، حزمنا حقائبنا."),
  8: _s("I was late because I missed the bus.", ["late", "missed"], "تأخرت لأنني فاتني الباص."),
  9: _s("I was proud of my grade.", ["proud", "grade"], "كنت فخوراً بدرجتي."),
  10: _s("It was raining all morning.", ["raining", "morning"], "كانت تمطر طوال الصباح."),
  11: _s("He passed the test.", ["passed", "test"], "نجح في الاختبار."),
  12: _s("We flew to a new city.", ["flew", "city"], "سافرنا بالطائرة إلى مدينة جديدة."),
  13: _s("I broke my phone because I dropped it.", ["broke", "dropped"], "كسرت هاتفي لأنني أسقطته."),
  14: _s("There were so many gifts.", ["gifts"], "كان هناك الكثير من الهدايا."),
  15: _s("It was an unforgettable day.", ["unforgettable"], "كان يوماً لا يُنسى."),
  16: _s("I was texting while I was walking.", ["texting", "walking"], "كنت أراسل بينما كنت أمشي."),
  17: _s("Tell me about your experience.", ["experience"], "أخبرني عن تجربتك."),
  18: _s("She fell asleep before the end.", ["fell asleep", "end"], "نامت قبل النهاية."),
  19: _s("Finally, we found it.", ["Finally", "found"], "أخيراً، وجدناها."),
  20: _s("I will tell you my story.", ["tell", "story"], "سأخبركم قصتي."),
 },
 "level6": {
  1: _s("I'm going to plan a trip.", ["going to", "plan"], "سأخطط لرحلة."),
  2: _s("I predict it will rain.", ["predict", "will rain"], "أتوقع أنها ستمطر."),
  3: _s("I'm meeting my friend on Friday.", ["meeting", "Friday"], "سأقابل صديقتي يوم الجمعة."),
  4: _s("My phone rang while I was studying.", ["rang", "while"], "رنّ هاتفي بينما كنت أدرس."),
  5: _s("A uniform is required at school.", ["uniform", "required"], "الزي المدرسي مطلوب في المدرسة."),
  6: _s("He carefully carried the box.", ["carefully", "carried"], "حمل الصندوق بحذر."),
  7: _s("This book is more interesting than that one.", ["more interesting"], "هذا الكتاب أكثر تشويقاً من ذاك."),
  8: _s("I'm going to sleep in on Saturday.", ["sleep in", "Saturday"], "سأنام حتى وقت متأخر يوم السبت."),
  9: _s("I think he will succeed.", ["will succeed"], "أعتقد أنه سينجح."),
  10: _s("I have to be home by curfew.", ["have to", "curfew"], "يجب أن أكون في البيت قبل موعد العودة."),
  11: _s("She explained it clearly.", ["explained", "clearly"], "شرحتها بوضوح."),
  12: _s("This is the most useful.", ["most useful"], "هذا هو الأكثر فائدة."),
  13: _s("I was cooking while listening to music.", ["cooking", "listening"], "كنت أطبخ بينما أستمع إلى الموسيقى."),
  14: _s("I will improve my grades.", ["improve", "grades"], "سأحسّن درجاتي."),
  15: _s("That's a fair point.", ["fair point"], "هذه نقطة عادلة."),
  16: _s("I'm going to prepare for the exam.", ["prepare", "exam"], "سأستعد للامتحان."),
  17: _s("Cross the street safely.", ["Cross", "safely"], "اعبر الشارع بأمان."),
  18: _s("Our cultures are similar in some ways.", ["cultures", "similar"], "ثقافاتنا متشابهة في بعض الجوانب."),
  19: _s("The teacher handled it calmly.", ["handled", "calmly"], "تعاملت المعلمة مع الأمر بهدوء."),
  20: _s("This is my plan for the future.", ["plan", "future"], "هذه خطتي للمستقبل."),
 },
}
