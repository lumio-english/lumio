# -*- coding: utf-8 -*-
import sys, json
sys.path.insert(0, "lib")
from deck_template_v2 import run

DIALOGUES = {
  1: [("L", "Good morning! Hello!", "صباح الخير! مرحبا!"),
      ("R", "Hi! Thank you for saying hello!", "أهلا! شكرا لك على الترحيب!"),
      ("L", "You are welcome, my friend!", "عفوا يا صديقي!"),
      ("R", "Goodbye! Good night!", "مع السلامة! تصبح على خير!")],
  2: [("L", "Hi! What is your name?", "أهلا! ما اسمك؟"),
      ("R", "My name is Noor. I am a girl. What is your name?", "اسمي نور. أنا فتاة. ما اسمك أنت؟"),
      ("L", "I am Ziad. I am a boy.", "أنا زياد. أنا ولد."),
      ("R", "Nice to meet you, my friend!", "تشرفت بك يا صديقي!")],
  3: [("L", "Look! A cat and a dog!", "انظر! قطة وكلب!"),
      ("R", "I see a goat too! It has a funny hat!", "أرى عنزة أيضا! لديها قبعة مضحكة!"),
      ("L", "Can I have an apple, please?", "هل يمكنني الحصول على تفاحة من فضلك؟"),
      ("R", "Yes! And after that, ice cream!", "نعم! وبعد ذلك، آيس كريم!")],
  4: [("L", "Look at my kite in the sky!", "انظر إلى طائرتي الورقية في السماء!"),
      ("R", "Wow! It is next to the moon! Can I try?", "واو! إنها بجانب القمر! هل يمكنني أن أجرب؟"),
      ("L", "Yes! First, drink your orange juice.", "نعم! أولا، اشرب عصير برتقالك."),
      ("R", "Thank you! I see a rabbit too!", "شكرا لك! أرى أرنبا أيضا!")],
  5: [("L", "The sun is so bright today!", "الشمس مشرقة جدا اليوم!"),
      ("R", "Yes! Let's sit under the tree.", "نعم! لنجلس تحت الشجرة."),
      ("L", "Look, a yellow van! And a zebra!", "انظر، شاحنة صفراء! وحمار وحشي!"),
      ("R", "I need water. It is hot!", "أحتاج ماء. الجو حار!")],
  6: [("L", "Let's count! One, two, three!", "لنعد! واحد، اثنان، ثلاثة!"),
      ("R", "Four, five! I counted five fingers!", "أربعة، خمسة! لقد عددت خمسة أصابع!"),
      ("L", "Great job! Let's count again.", "أحسنت! لنعد مرة أخرى."),
      ("R", "One, two, three, four, five!", "واحد، اثنان، ثلاثة، أربعة، خمسة!")],
  7: [("L", "Look at the clock! It says six!", "انظر إلى الساعة! تقول ستة!"),
      ("R", "Let's count more! Seven, eight!", "لنعد أكثر! سبعة، ثمانية!"),
      ("L", "Nine, ten! We did it!", "تسعة، عشرة! لقد فعلناها!"),
      ("R", "Yay! Ten fingers, ten toes!", "يايي! عشرة أصابع يد، وعشرة أصابع قدم!")],
  8: [("L", "I love red and blue!", "أحب الأحمر والأزرق!"),
      ("R", "My favorite is yellow and green!", "المفضل لدي هو الأصفر والأخضر!"),
      ("L", "Look at that red apple!", "انظر إلى تلك التفاحة الحمراء!"),
      ("R", "And the green tree next to it!", "والشجرة الخضراء بجانبها!")],
  9: [("L", "Look at the purple and pink flowers!", "انظر إلى الزهور الأرجوانية والوردية!"),
      ("R", "So pretty! I see a brown and white dog too!", "جميلة جدا! أرى كلبا بنيا وأبيض أيضا!"),
      ("L", "And a black cat over there!", "وقطة سوداء هناك!"),
      ("R", "This orange one is my favorite color!", "هذا اللون البرتقالي هو المفضل لدي!")],
  10: [("L", "This is my mom and my dad!", "هذه أمي وهذا أبي!"),
       ("R", "I have a brother and a sister!", "لدي أخ وأخت!"),
       ("L", "We have a new baby at home!", "لدينا طفل جديد في المنزل!"),
       ("R", "I love my grandma and grandpa too!", "أحب جدتي وجدي أيضا!")],
  11: [("L", "Touch your head and your nose!", "المس رأسك وأنفك!"),
       ("R", "Okay! Now clap your hands!", "حسنا! الآن صفق بيديك!"),
       ("L", "Can you touch your ears and mouth?", "هل يمكنك لمس أذنيك وفمك؟"),
       ("R", "Yes! And jump on your feet!", "نعم! واقفز على قدميك!")],
  12: [("L", "The cat is on the box!", "القطة على الصندوق!"),
       ("R", "And the dog is under the tree!", "والكلب تحت الشجرة!"),
       ("L", "Look, a bird and a fish!", "انظر، طائر وسمكة!"),
       ("R", "I see a rabbit and a duck too!", "أرى أرنبا وبطة أيضا!")],
  13: [("L", "The lion and the elephant are so big!", "الأسد والفيل كبيران جدا!"),
       ("R", "Look at the funny monkey!", "انظر إلى القرد المضحك!"),
       ("L", "I love the tall giraffe!", "أحب الزرافة الطويلة!"),
       ("R", "Me too! And the zebra and the camel!", "أنا أيضا! والحمار الوحشي والجمل!")],
  14: [("L", "Can I have an apple and a banana?", "هل يمكنني الحصول على تفاحة وموزة؟"),
       ("R", "Yes! Do you want bread too?", "نعم! هل تريد خبزا أيضا؟"),
       ("L", "Yes, please! And some milk.", "نعم، من فضلك! وبعض الحليب."),
       ("R", "Here is your water and egg too!", "وهذا ماؤك وبيضتك أيضا!")],
  15: [("L", "I am hungry! Can we eat rice and chicken?", "أنا جائع! هل يمكننا أكل الأرز والدجاج؟"),
       ("R", "Yes! Do you want cheese too?", "نعم! هل تريد جبنا أيضا؟"),
       ("L", "Yum! And juice, please.", "لذيذ! وعصير، من فضلك."),
       ("R", "After that, cake and ice cream!", "بعد ذلك، كعكة وآيس كريم!")],
  16: [("L", "I love going to school!", "أحب الذهاب إلى المدرسة!"),
       ("R", "Me too! I have a new book and pen.", "أنا أيضا! لدي كتاب وقلم جديدان."),
       ("L", "I have a pencil in my bag.", "لدي قلم رصاص في حقيبتي."),
       ("R", "Our teacher is so kind!", "معلمتنا لطيفة جدا!")],
  17: [("L", "Do you want to play with my ball?", "هل تريد اللعب بكرتي؟"),
       ("R", "Yes! Can I play with your car too?", "نعم! هل يمكنني اللعب بسيارتك أيضا؟"),
       ("L", "Sure! I also have a doll and a robot.", "بالطبع! لدي أيضا دمية وروبوت."),
       ("R", "I love your blocks and teddy bear!", "أحب مكعباتك ودبك المحشو!")],
  18: [("L", "Let's run and jump at the playground!", "لنجرِ ونقفز في الملعب!"),
       ("R", "Yes! Then let's sit and stand.", "نعم! ثم لنجلس ونقف."),
       ("L", "Can you clap and sing with me?", "هل يمكنك التصفيق والغناء معي؟"),
       ("R", "Yes! I know a fun song!", "نعم! أعرف أغنية ممتعة!")],
  19: [("L", "I am so happy today!", "أنا سعيد جدا اليوم!"),
       ("R", "I am a little tired and hungry.", "أنا متعب وجائع قليلا."),
       ("L", "Are you sad or scared?", "هل أنت حزين أم خائف؟"),
       ("R", "No, just hungry! Let's eat!", "لا، جائع فقط! لنأكل!")],
  20: [("L", "Hello, my friend! Thank you for coming!", "مرحبا يا صديقي! شكرا لك على قدومك!"),
       ("R", "Hi! I brought my teddy bear and a kite!", "أهلا! أحضرت دبي المحشو وطائرة ورقية!"),
       ("L", "I have a red umbrella and a happy cat!", "لدي مظلة حمراء وقطة سعيدة!"),
       ("R", "Let's count! One, two, three... to ten!", "لنعد! واحد، اثنان، ثلاثة... حتى عشرة!")],
}

SKILLS_CHECKPOINTS = {
  6: {
    "listening": "recognize greetings, their name words, all 26 letter sounds, and numbers 1-5",
    "speaking": "say hello and goodbye, tell someone their name, and count from 1 to 5",
    "reading": "recognize all 26 uppercase and lowercase letters by sight",
    "writing": "trace the uppercase and lowercase letters A-Z",
  },
  11: {
    "listening": "recognize numbers 6-10, colors, family words, and body parts",
    "speaking": "count all the way to 10, name their favorite color, and name family members",
    "reading": "match printed number words and color words to the right picture",
    "writing": "copy simple number words and color words",
  },
  16: {
    "listening": "recognize animal names, food names, and school items",
    "speaking": "name their favorite animal, say what food they like, and name school items",
    "reading": "read simple two- or three-word phrases like \u201cred apple\u201d or \u201cbig lion\u201d",
    "writing": "copy short animal, food, and school words",
  },
  20: {
    "listening": "understand almost all the Pre-A words and phrases from this whole level",
    "speaking": "speak in short phrases about family, animals, food, feelings, and more",
    "reading": "read familiar words and short phrases on their own",
    "writing": "write familiar words from memory, not just by tracing",
  },
}

# Introduces one Spelling Hub rule per checkpoint lesson, in the same
# order they appear in spelling-hub/pre-a.json -- reuses the existing
# checkpoint lessons (6, 11, 16, 20) rather than adding new special
# lesson numbers, so the rules land at points already marked as
# milestones for both teacher and parent.
with open("spelling-hub/pre-a.json", encoding="utf-8") as f:
    _spelling_data = json.load(f)
SPELLING_RULES = dict(zip([6, 11, 16, 20], _spelling_data["rules"]))

run("pre-a", DIALOGUES, None, None, has_phonics=False, skills_data=SKILLS_CHECKPOINTS, spelling_rules=SPELLING_RULES)
