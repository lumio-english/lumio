import json, os

LESSONS = [
  {
    "title": "My Daily Routine (Full)", "titleAr": "روتيني اليومي (كامل)",
    "goal": "I can describe my full daily routine.",
    "grammarFocus": "Present Simple routine review",
    "vocab": [
      {"en": "wake up", "ar": "يستيقظ", "example": "I wake up at seven."},
      {"en": "brush my teeth", "ar": "أنظف أسناني", "example": "I brush my teeth every morning."},
      {"en": "have breakfast", "ar": "يتناول الفطور", "example": "I have breakfast with my family."},
      {"en": "go to school", "ar": "يذهب إلى المدرسة", "example": "I go to school by bus."},
      {"en": "come home", "ar": "يعود إلى المنزل", "example": "I come home at four."},
      {"en": "go to bed", "ar": "يذهب إلى النوم", "example": "I go to bed at nine."},
    ],
  },
  {
    "title": "He Always...", "titleAr": "هو دائما...",
    "goal": "I can talk about routines using he/she.",
    "grammarFocus": "He/She + verb-s (Present Simple)",
    "vocab": [
      {"en": "wakes up", "ar": "يستيقظ (هو)", "example": "He wakes up at six."},
      {"en": "eats", "ar": "يأكل (هو)", "example": "She eats breakfast fast."},
      {"en": "sleeps", "ar": "ينام (هو)", "example": "The baby sleeps a lot."},
      {"en": "plays", "ar": "يلعب (هو)", "example": "He plays football."},
      {"en": "reads", "ar": "يقرأ (هو)", "example": "She reads every night."},
      {"en": "works", "ar": "يعمل (هو)", "example": "My dad works every day."},
    ],
  },
  {
    "title": "How Often?", "titleAr": "كم مرة؟",
    "goal": "I can say how often I do things.",
    "grammarFocus": "Adverbs of frequency",
    "vocab": [
      {"en": "always", "ar": "دائما", "example": "I always brush my teeth."},
      {"en": "usually", "ar": "عادة", "example": "I usually walk to school."},
      {"en": "sometimes", "ar": "أحيانا", "example": "Sometimes I read at night."},
      {"en": "never", "ar": "أبدا", "example": "I never eat candy for breakfast."},
      {"en": "often", "ar": "غالبا", "example": "We often play outside."},
      {"en": "rarely", "ar": "نادرا", "example": "I rarely watch TV."},
    ],
  },
  {
    "title": "At the Supermarket", "titleAr": "في السوبر ماركت",
    "goal": "I can talk about shopping.",
    "grammarFocus": "How much is...?",
    "vocab": [
      {"en": "money", "ar": "مال", "example": "I have some money."},
      {"en": "price", "ar": "سعر", "example": "What is the price?"},
      {"en": "buy", "ar": "يشتري", "example": "I want to buy an apple."},
      {"en": "sell", "ar": "يبيع", "example": "The shop sells fruit."},
      {"en": "expensive", "ar": "غالٍ", "example": "This bag is expensive."},
      {"en": "cheap", "ar": "رخيص", "example": "This pen is cheap."},
    ],
  },
  {
    "title": "How Much / How Many", "titleAr": "كم / كم عدد",
    "goal": "I can ask about quantity.",
    "grammarFocus": "How much / How many",
    "vocab": [
      {"en": "cash", "ar": "نقد", "example": "I have some cash."},
      {"en": "receipt", "ar": "إيصال", "example": "Here is your receipt."},
      {"en": "apples", "ar": "تفاح", "example": "How many apples do you want?"},
      {"en": "bread", "ar": "خبز", "example": "How much bread do we need?"},
      {"en": "eggs", "ar": "بيض", "example": "How many eggs are there?"},
      {"en": "sugar", "ar": "سكر", "example": "How much sugar do you need?"},
    ],
  },
  {
    "title": "Countable & Uncountable", "titleAr": "معدود وغير معدود",
    "goal": "I can use some and any correctly.",
    "grammarFocus": "Some / Any (intro)",
    "vocab": [
      {"en": "water", "ar": "ماء", "example": "I have some water."},
      {"en": "milk", "ar": "حليب", "example": "Is there any milk?"},
      {"en": "rice", "ar": "أرز", "example": "We need some rice."},
      {"en": "juice", "ar": "عصير", "example": "I don't have any juice."},
      {"en": "some", "ar": "بعض", "example": "I want some water."},
      {"en": "any", "ar": "أي", "example": "Do you have any bread?"},
    ],
  },
  {
    "title": "Money & Prices", "titleAr": "المال والأسعار",
    "goal": "I can talk about money and prices.",
    "grammarFocus": "Prices review",
    "vocab": [
      {"en": "coin", "ar": "عملة معدنية", "example": "I have one coin."},
      {"en": "dollar", "ar": "دولار", "example": "It costs one dollar."},
      {"en": "wallet", "ar": "محفظة", "example": "My wallet is in my bag."},
      {"en": "pay", "ar": "يدفع", "example": "I will pay for it."},
      {"en": "change", "ar": "الباقي (فكة)", "example": "Here is your change."},
      {"en": "cost", "ar": "يكلف", "example": "How much does it cost?"},
    ],
  },
  {
    "title": "At the Restaurant", "titleAr": "في المطعم",
    "goal": "I can order food at a restaurant.",
    "grammarFocus": "I would like...",
    "vocab": [
      {"en": "menu", "ar": "قائمة الطعام", "example": "Can I see the menu?"},
      {"en": "waiter", "ar": "نادل", "example": "The waiter brings our food."},
      {"en": "order", "ar": "يطلب", "example": "I would like to order pizza."},
      {"en": "plate", "ar": "طبق", "example": "The plate is empty."},
      {"en": "spoon", "ar": "ملعقة", "example": "I need a spoon."},
      {"en": "table", "ar": "طاولة", "example": "We sit at a table."},
    ],
  },
  {
    "title": "Ordering Food", "titleAr": "طلب الطعام",
    "goal": "I can have a simple ordering conversation.",
    "grammarFocus": "Ordering dialogue phrases",
    "vocab": [
      {"en": "hungry", "ar": "جائع", "example": "I am hungry."},
      {"en": "thirsty", "ar": "عطشان", "example": "I am thirsty."},
      {"en": "delicious", "ar": "لذيذ", "example": "This food is delicious."},
      {"en": "more", "ar": "المزيد", "example": "Can I have more, please?"},
      {"en": "bill", "ar": "الفاتورة", "example": "Can we have the bill?"},
      {"en": "yummy", "ar": "لذيذ (بلغة الأطفال)", "example": "Yummy! I love this."},
    ],
  },
  {
    "title": "Healthy Food", "titleAr": "الطعام الصحي",
    "goal": "I can talk about healthy eating.",
    "grammarFocus": "Should / Shouldn't eat",
    "vocab": [
      {"en": "vegetables", "ar": "خضروات", "example": "I should eat vegetables."},
      {"en": "fruit", "ar": "فاكهة", "example": "Fruit is healthy."},
      {"en": "junk food", "ar": "طعام غير صحي", "example": "I shouldn't eat junk food."},
      {"en": "vitamins", "ar": "فيتامينات", "example": "Fruit has vitamins."},
      {"en": "strong", "ar": "قوي", "example": "Healthy food makes me strong."},
      {"en": "diet", "ar": "نظام غذائي", "example": "I have a healthy diet."},
    ],
  },
  {
    "title": "My Week", "titleAr": "أسبوعي",
    "goal": "I can talk about my week.",
    "grammarFocus": "On Mondays, I...",
    "vocab": [
      {"en": "Monday", "ar": "الاثنين", "example": "On Monday, I go to school."},
      {"en": "Wednesday", "ar": "الأربعاء", "example": "I have art class on Wednesday."},
      {"en": "Friday", "ar": "الجمعة", "example": "I love Fridays."},
      {"en": "week", "ar": "أسبوع", "example": "A week has seven days."},
      {"en": "weekend", "ar": "عطلة نهاية الأسبوع", "example": "I play on the weekend."},
      {"en": "schedule", "ar": "جدول", "example": "This is my weekly schedule."},
    ],
  },
  {
    "title": "After School Activities", "titleAr": "أنشطة بعد المدرسة",
    "goal": "I can talk about what I do after school.",
    "grammarFocus": "After school, I...",
    "vocab": [
      {"en": "homework", "ar": "واجب منزلي", "example": "I do my homework after school."},
      {"en": "practice", "ar": "يتدرب", "example": "I practice piano after school."},
      {"en": "club", "ar": "نادي", "example": "I go to art club."},
      {"en": "lesson", "ar": "درس", "example": "I have a swimming lesson."},
      {"en": "rest", "ar": "يستريح", "example": "I rest after school."},
      {"en": "free time", "ar": "وقت الفراغ", "example": "I read in my free time."},
    ],
  },
  {
    "title": "Object Pronouns", "titleAr": "ضمائر المفعول به",
    "goal": "I can use me, him, her, us, them, it.",
    "grammarFocus": "Object pronouns (me, him, her, us, them, it)",
    "vocab": [
      {"en": "me", "ar": "لي (مفعول)", "example": "Give it to me."},
      {"en": "him", "ar": "له (مفعول)", "example": "I see him at school."},
      {"en": "her", "ar": "لها (مفعول)", "example": "I like her."},
      {"en": "us", "ar": "لنا (مفعول)", "example": "She helps us."},
      {"en": "them", "ar": "لهم (مفعول)", "example": "I play with them."},
      {"en": "it", "ar": "هو/هي (لغير العاقل)", "example": "I like it."},
    ],
  },
  {
    "title": "Whose Is It?", "titleAr": "لمن هذا؟",
    "goal": "I can use possessive pronouns.",
    "grammarFocus": "Possessive pronouns (mine, yours, his, hers)",
    "vocab": [
      {"en": "mine", "ar": "لي (ملكية)", "example": "This book is mine."},
      {"en": "yours", "ar": "لك (ملكية)", "example": "Is this pen yours?"},
      {"en": "hers", "ar": "لها (ملكية)", "example": "That bag is hers."},
      {"en": "ours", "ar": "لنا (ملكية)", "example": "This classroom is ours."},
      {"en": "theirs", "ar": "لهم (ملكية)", "example": "Those toys are theirs."},
      {"en": "whose", "ar": "لمن", "example": "Whose book is this?"},
    ],
  },
  {
    "title": "The Five Senses", "titleAr": "الحواس الخمس",
    "goal": "I can talk about my five senses.",
    "grammarFocus": "I can see/hear/smell/taste/touch...",
    "vocab": [
      {"en": "see", "ar": "يرى", "example": "I can see a bird."},
      {"en": "hear", "ar": "يسمع", "example": "I can hear music."},
      {"en": "smell", "ar": "يشم", "example": "I can smell flowers."},
      {"en": "taste", "ar": "يتذوق", "example": "I can taste the cake."},
      {"en": "touch", "ar": "يلمس", "example": "I can touch the soft toy."},
      {"en": "sense", "ar": "حاسة", "example": "Sight is a sense."},
    ],
  },
  {
    "title": "Describing People", "titleAr": "وصف الأشخاص",
    "goal": "I can describe what people look like.",
    "grammarFocus": "He has.../His hair is...",
    "vocab": [
      {"en": "hair", "ar": "شعر", "example": "She has long hair."},
      {"en": "tall", "ar": "طويل القامة", "example": "My brother is tall."},
      {"en": "short", "ar": "قصير القامة", "example": "My sister is short."},
      {"en": "curly", "ar": "مجعد", "example": "He has curly hair."},
      {"en": "straight", "ar": "مستقيم (الشعر)", "example": "She has straight hair."},
      {"en": "beard", "ar": "لحية", "example": "My grandpa has a beard."},
    ],
  },
  {
    "title": "Describing Personality", "titleAr": "وصف الشخصية",
    "goal": "I can describe someone's personality.",
    "grammarFocus": "She is... (personality adjectives)",
    "vocab": [
      {"en": "kind", "ar": "لطيف", "example": "My teacher is kind."},
      {"en": "funny", "ar": "مضحك", "example": "My friend is funny."},
      {"en": "smart", "ar": "ذكي", "example": "She is very smart."},
      {"en": "friendly", "ar": "ودود", "example": "He is friendly to everyone."},
      {"en": "polite", "ar": "مؤدب", "example": "Be polite to your teacher."},
      {"en": "honest", "ar": "صادق", "example": "I am always honest."},
    ],
  },
  {
    "title": "My Best Friend", "titleAr": "صديقي المفضل",
    "goal": "I can describe my best friend.",
    "grammarFocus": "My best friend is...",
    "vocab": [
      {"en": "best friend", "ar": "أفضل صديق", "example": "She is my best friend."},
      {"en": "generous", "ar": "كريم", "example": "My friend is generous."},
      {"en": "share", "ar": "يشارك", "example": "We share our toys."},
      {"en": "help", "ar": "يساعد", "example": "Friends help each other."},
      {"en": "trust", "ar": "يثق", "example": "I trust my best friend."},
      {"en": "together", "ar": "معا", "example": "We play together every day."},
    ],
  },
  {
    "title": "Reading: A Day with Lumi", "titleAr": "قراءة: يوم مع لومي",
    "goal": "I can read and understand a short story about a daily routine.",
    "grammarFocus": "Reading comprehension review",
    "vocab": [
      {"en": "story", "ar": "قصة", "example": "I read a story about Lumi."},
      {"en": "morning", "ar": "الصباح", "example": "Lumi wakes up in the morning."},
      {"en": "afternoon", "ar": "بعد الظهر", "example": "Lumi plays in the afternoon."},
      {"en": "evening", "ar": "المساء", "example": "Lumi reads in the evening."},
      {"en": "happy", "ar": "سعيد", "example": "Lumi feels happy every day."},
      {"en": "day", "ar": "يوم", "example": "It was a nice day."},
    ],
  },
  {
    "title": "Review + My Week Diary", "titleAr": "مراجعة + مذكرات أسبوعي",
    "goal": "I can talk about my routine, food, friends, and week using everything I've learned.",
    "grammarFocus": "Review of all structures from Lessons 1-19",
    "vocab": [
      {"en": "wake up", "ar": "يستيقظ", "example": "I wake up at seven."},
      {"en": "buy", "ar": "يشتري", "example": "I want to buy an apple."},
      {"en": "menu", "ar": "قائمة الطعام", "example": "Can I see the menu?"},
      {"en": "vegetables", "ar": "خضروات", "example": "I should eat vegetables."},
      {"en": "weekend", "ar": "عطلة نهاية الأسبوع", "example": "I play on the weekend."},
      {"en": "mine", "ar": "لي (ملكية)", "example": "This book is mine."},
      {"en": "kind", "ar": "لطيف", "example": "My teacher is kind."},
      {"en": "best friend", "ar": "أفضل صديق", "example": "She is my best friend."},
    ],
  },
]

OUT_DIR = "lessons/level4"
os.makedirs(OUT_DIR, exist_ok=True)

for i, L in enumerate(LESSONS, start=1):
    num = f"{i:02d}"
    lesson = {
        "id": f"level4-{num}",
        "level": "level4",
        "number": i,
        "title": L["title"],
        "titleAr": L["titleAr"],
        "goal": L["goal"],
        "grammarFocus": L["grammarFocus"],
        "vocab": L["vocab"],
        "activities": [
            {"type": "vocab"},
            {"type": "speak", "rounds": 3},
            {"type": "listen-choose", "rounds": 6},
            {"type": "match"},
            {"type": "quiz", "rounds": 4},
            {"type": "spell", "rounds": 3},
        ],
    }
    path = os.path.join(OUT_DIR, f"lesson{num}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(lesson, f, ensure_ascii=False, indent=2)
        f.write("\n")

print(f"Wrote {len(LESSONS)} lesson files to {OUT_DIR}/")
