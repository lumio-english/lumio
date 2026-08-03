# -*- coding: utf-8 -*-
"""Isolated pilot: Teen Track skin applied to Level 3 Lesson 1 only,
written to a separate namespace so it doesn't touch the live lessons."""
import sys, json
sys.path.insert(0, "lib")
from deck_template_teen import build_deck
from grammar_slides import compute_grammar_lesson_map

GRAMMAR_UNITS = compute_grammar_lesson_map("level3")

DIALOGUES = {
  1: [("Look, there is a library in my town!", "انظر، هناك مكتبة في مدينتي!"),
      ("Is there a zoo too?", "هل هناك حديقة حيوان أيضا؟"),
      ("Yes! There is a zoo and a museum.", "نعم! هناك حديقة حيوان ومتحف."),
      ("I love my town!", "أحب مدينتي!")],
  2: [("What is your dad's job?", "ما وظيفة والدك؟"),
      ("He is a doctor. What about your mom?", "هو طبيب. ماذا عن والدتك؟"),
      ("She is a teacher. My uncle is a firefighter!", "هي معلمة. عمي رجل إطفاء!"),
      ("Wow, your family has great jobs!", "واو، عائلتك لديها وظائف رائعة!")],
  3: [("What does your sister do?", "ماذا تعمل أختك؟"),
      ("She is an engineer. What does your brother do?", "هي مهندسة. ماذا يعمل أخوك؟"),
      ("He is a pilot. He flies planes!", "هو طيار. إنه يقود الطائرات!"),
      ("That's an exciting job!", "هذه وظيفة مثيرة!")],
  4: [("How do we get to the park?", "كيف نصل إلى الحديقة؟"),
      ("We can go by bike or by bus.", "يمكننا الذهاب بالدراجة أو بالحافلة."),
      ("I like riding my bike!", "أحب ركوب دراجتي!"),
      ("Let's go by bike today!", "لنذهب بالدراجة اليوم!")],
  5: [("How do you go to school?", "كيف تذهب إلى المدرسة؟"),
      ("I go by taxi. How about you?", "أذهب بسيارة الأجرة. ماذا عنك؟"),
      ("I walk. It's not far.", "أنا أمشي. إنها ليست بعيدة."),
      ("Walking is good exercise!", "المشي تمرين جيد!")],
  6: [("What are you doing?", "ماذا تفعل؟"),
      ("I am running in the park. What are you doing?", "أنا أجري في الحديقة. ماذا تفعل أنت؟"),
      ("I am eating my lunch.", "أنا آكل غدائي."),
      ("Enjoy your lunch!", "استمتع بغدائك!")],
  7: [("What is your hobby?", "ما هي هوايتك؟"),
      ("I like cycling. What about you?", "أحب ركوب الدراجة. ماذا عنك؟"),
      ("I like photography and fishing.", "أحب التصوير وصيد السمك."),
      ("Those are fun hobbies!", "هذه هوايات ممتعة!")],
  8: [("Can you play basketball?", "هل تستطيع لعب كرة السلة؟"),
      ("Yes, I can! Can you play tennis?", "نعم أستطيع! هل تستطيع لعب التنس؟"),
      ("A little. Let's have a race first!", "قليلا. لنتسابق أولا!"),
      ("Our team can win!", "فريقنا يستطيع الفوز!")],
  9: [("Can you swim?", "هل تستطيع السباحة؟"),
      ("Yes, I can swim. Can you climb trees?", "نعم أستطيع السباحة. هل تستطيع تسلق الأشجار؟"),
      ("Yes! And I can sing too.", "نعم! وأستطيع الغناء أيضا."),
      ("You can do so many things!", "تستطيع فعل أشياء كثيرة!")],
  10: [("Look, a tiger!", "انظر، نمر!"),
       ("That tiger is so strong.", "ذلك النمر قوي جدا."),
       ("This monkey is climbing the tree!", "هذا القرد يتسلق الشجرة!"),
       ("Wild animals are amazing.", "الحيوانات البرية مذهلة.")],
  11: [("The elephant is bigger than the fox.", "الفيل أكبر من الثعلب."),
       ("Yes, and the fox is smaller than the wolf.", "نعم، والثعلب أصغر من الذئب."),
       ("Look at the zebra's stripes!", "انظر إلى خطوط الحمار الوحشي!"),
       ("These wild animals are not in cages here.", "هذه الحيوانات البرية ليست في أقفاص هنا.")],
  12: [("There is a sheep on the farm!", "هناك خروف في المزرعة!"),
       ("There are chickens too. Look!", "هناك دجاجات أيضا. انظر!"),
       ("The cow gives us milk.", "البقرة تعطينا الحليب."),
       ("I love visiting the farm!", "أحب زيارة المزرعة!")],
  13: [("Look at its long arms!", "انظر إلى ذراعيه الطويلة!"),
       ("That's an octopus! It has eight arms.", "هذا أخطبوط! لديه ثمانية أذرع."),
       ("Their tank has a shark too.", "خزانهم فيه سمكة قرش أيضا."),
       ("The dolphin is my favorite sea animal.", "الدولفين هو حيواني البحري المفضل.")],
  14: [("What is your favorite season?", "ما هو فصلك المفضل؟"),
       ("I like summer, it's warm. What about you?", "أحب الصيف، إنه دافئ. ماذا عنك؟"),
       ("I like spring. Flowers grow in spring.", "أحب الربيع. تنمو الزهور في الربيع."),
       ("Every season is beautiful!", "كل فصل جميل!")],
  15: [("What's the weather like today?", "كيف هو الطقس اليوم؟"),
       ("It is sunny and a little windy.", "إنه مشمس وعاصف قليلا."),
       ("Yesterday it was rainy and cloudy.", "بالأمس كان ممطرا وغائما."),
       ("I hope it's not stormy tomorrow!", "أتمنى ألا تكون عاصفة غدا!")],
  16: [("What do you wear in winter?", "ماذا ترتدي في الشتاء؟"),
       ("I wear a scarf and gloves.", "أرتدي وشاحا وقفازات."),
       ("I wear boots when it's rainy.", "أرتدي حذاء طويلا عندما يكون ممطرا."),
       ("And a swimsuit in summer!", "وملابس سباحة في الصيف!")],
  17: [("Where is the cat?", "أين القطة؟"),
       ("It is next to the box, between the chairs.", "إنها بجانب الصندوق، بين الكرسيين."),
       ("I see it! It's in front of the table.", "أراها! إنها أمام الطاولة."),
       ("Now it's behind the door!", "الآن هي خلف الباب!")],
  18: [("Who is that?", "من ذلك؟"),
       ("That's my new friend. Where does he live?", "هذا صديقي الجديد. أين يعيش؟"),
       ("He lives near the park. When is his birthday?", "يعيش قرب الحديقة. متى عيد ميلاده؟"),
       ("It's in June! How do you know him?", "إنه في يونيو! كيف تعرفه؟")],
  19: [("What is your favorite place?", "ما هو مكانك المفضل؟"),
       ("I like the restaurant near the airport.", "أحب المطعم قرب المطار."),
       ("The library is quiet, but the zoo is loud!", "المكتبة هادئة، لكن حديقة الحيوان صاخبة!"),
       ("I like both places!", "أحب كلا المكانين!")],
  20: [("Let's make a map of our town!", "لنصنع خريطة لمدينتنا!"),
       ("Good idea! We can draw the library and the zoo.", "فكرة جيدة! يمكننا رسم المكتبة وحديقة الحيوان."),
       ("Don't forget the farm with the cow and sheep!", "لا تنس المزرعة مع البقرة والخروف!"),
       ("This will be a great project!", "سيكون هذا مشروعا رائعا!")],
}

lesson = json.load(open("lessons/level3/lesson01.json", encoding="utf-8"))
import deck_template_teen
deck_template_teen.DIALOGUES = DIALOGUES
slides = build_deck(1, lesson, None, GRAMMAR_UNITS.get(1))

import os
out_dir = "slide-content/_pilot-teen-level3-01/01"
os.makedirs(out_dir, exist_ok=True)
for old in __import__("glob").glob(out_dir + "/slide-*.html"):
    os.remove(old)
for i, html in enumerate(slides, start=1):
    with open(f"{out_dir}/slide-{i:02d}.html", "w", encoding="utf-8") as f:
        f.write(html)

os.makedirs("assets/slides/_pilot-teen-level3-01", exist_ok=True)
with open("assets/slides/_pilot-teen-level3-01/manifest.json", "w", encoding="utf-8") as f:
    json.dump({"01": len(slides)}, f)

print(f"Pilot deck: {len(slides)} slides -> {out_dir}")
