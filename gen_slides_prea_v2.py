# -*- coding: utf-8 -*-
import sys, json
sys.path.insert(0, "lib")
from deck_template_v2 import run

DIALOGUES = {
  1: [("Hello! Good morning!", "مرحبا! صباح الخير!"),
      ("Hi! Thank you!", "أهلا! شكرا لك!")],
  2: [("What is your name?", "ما اسمك؟"),
      ("I am a girl. You are my friend!", "أنا فتاة. أنت صديقي!")],
  3: [("Look! A cat and a dog!", "انظر! قطة وكلب!"),
      ("I see an apple and an egg too!", "أرى تفاحة وبيضة أيضا!")],
  4: [("The kite is next to the moon!", "الطائرة الورقية بجانب القمر!"),
      ("A rabbit is drinking juice!", "أرنب يشرب عصيرا!")],
  5: [("The sun is up in the sky!", "الشمس في السماء!"),
      ("I see a yellow zebra under the tree!", "أرى حمارا وحشيا أصفر تحت الشجرة!")],
  6: [("One, two, three!", "واحد، اثنان، ثلاثة!"),
      ("Four, five! Let's count!", "أربعة، خمسة! لنعد!")],
  7: [("Six, seven, eight!", "ستة، سبعة، ثمانية!"),
      ("Nine, ten! We did it!", "تسعة، عشرة! لقد فعلناها!")],
  8: [("I love red and blue!", "أحب الأحمر والأزرق!"),
      ("My favorite is yellow and green!", "المفضل لدي هو الأصفر والأخضر!")],
  9: [("Look at the purple and pink flowers!", "انظر إلى الزهور الأرجوانية والوردية!"),
      ("The cat is black and white!", "القطة سوداء وبيضاء!")],
  10: [("This is my mom and dad!", "هذه أمي وأبي!"),
       ("My brother and sister are here too!", "أخي وأختي هنا أيضا!")],
  11: [("Touch your head and nose!", "المس رأسك وأنفك!"),
       ("Now clap your hands!", "الآن صفق بيديك!")],
  12: [("The cat and the dog are playing!", "القطة والكلب يلعبان!"),
       ("Look, a duck and a rabbit!", "انظر، بطة وأرنب!")],
  13: [("The lion is big!", "الأسد كبير!"),
       ("The elephant and the giraffe are big too!", "الفيل والزرافة كبيران أيضا!")],
  14: [("I like apples and bananas!", "أحب التفاح والموز!"),
       ("I drink milk and water every day!", "أشرب الحليب والماء كل يوم!")],
  15: [("I want rice and chicken!", "أريد أرزا ودجاجا!"),
       ("Can I have cake and ice cream too?", "هل يمكنني الحصول على كعكة وآيس كريم أيضا؟")],
  16: [("This is my school bag!", "هذه حقيبة مدرستي!"),
       ("I have a book and a pencil!", "لدي كتاب وقلم رصاص!")],
  17: [("I love my teddy bear!", "أحب دبي المحشو!"),
       ("Let's play with the ball and the blocks!", "لنلعب بالكرة والمكعبات!")],
  18: [("Run and jump!", "اجرِ واقفز!"),
       ("Now sit down and clap!", "الآن اجلس وصفق!")],
  19: [("I am happy today!", "أنا سعيد اليوم!"),
       ("Are you tired or hungry?", "هل أنت متعب أم جائع؟")],
  20: [("Hello! I remember three, red, and mom!", "مرحبا! أتذكر ثلاثة، أحمر، وأمي!"),
       ("I remember lion, book, happy, and jump too!", "أتذكر أسد، كتاب، سعيد، وقفز أيضا!")],
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
