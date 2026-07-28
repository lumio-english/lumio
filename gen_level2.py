import json, os

LESSONS = [
  {
    "title": "Greetings & Introductions", "titleAr": "التحيات والتعارف",
    "goal": "I can greet people and introduce myself.",
    "grammarFocus": "Hello, my name is... / Nice to meet you!",
    "vocab": [
      {"en": "hello", "ar": "مرحبا", "example": "Hello! My name is Lumi."},
      {"en": "goodbye", "ar": "مع السلامة", "example": "Goodbye, see you later!"},
      {"en": "please", "ar": "من فضلك", "example": "Please, sit down."},
      {"en": "thank you", "ar": "شكرا", "example": "Thank you very much!"},
      {"en": "sorry", "ar": "آسف", "example": "Sorry, excuse me."},
      {"en": "nice to meet you", "ar": "تشرفنا", "example": "Nice to meet you!"},
    ],
  },
  {
    "title": "How Old Are You?", "titleAr": "كم عمرك؟",
    "goal": "I can say how old I am.",
    "grammarFocus": "How old are you? I am ... years old.",
    "vocab": [
      {"en": "old", "ar": "كبير في السن", "example": "My grandpa is old."},
      {"en": "young", "ar": "صغير في السن", "example": "The baby is young."},
      {"en": "age", "ar": "العمر", "example": "What is your age?"},
      {"en": "years old", "ar": "سنة (من العمر)", "example": "I am eight years old."},
      {"en": "birthday", "ar": "عيد الميلاد", "example": "My birthday is in May."},
      {"en": "grow up", "ar": "يكبر", "example": "I grow up every year."},
    ],
  },
  {
    "title": "My Family Tree", "titleAr": "شجرة عائلتي",
    "goal": "I can name people in my extended family.",
    "grammarFocus": "This is my... / I have got a...",
    "vocab": [
      {"en": "parents", "ar": "الوالدان", "example": "My parents love me."},
      {"en": "grandparents", "ar": "الأجداد", "example": "I visit my grandparents."},
      {"en": "uncle", "ar": "عم / خال", "example": "My uncle is tall."},
      {"en": "aunt", "ar": "عمة / خالة", "example": "My aunt is kind."},
      {"en": "cousin", "ar": "ابن العم / الخال", "example": "My cousin is my friend."},
      {"en": "twins", "ar": "توأم", "example": "My sisters are twins."},
    ],
  },
  {
    "title": "He is / She is", "titleAr": "هو / هي",
    "goal": "I can describe boys and girls using he and she.",
    "grammarFocus": "He is... / She is...",
    "vocab": [
      {"en": "he", "ar": "هو", "example": "He is my brother."},
      {"en": "she", "ar": "هي", "example": "She is my sister."},
      {"en": "man", "ar": "رجل", "example": "The man is my father."},
      {"en": "woman", "ar": "امرأة", "example": "The woman is my mother."},
      {"en": "brother", "ar": "أخ", "example": "My brother is funny."},
      {"en": "sister", "ar": "أخت", "example": "My sister is smart."},
    ],
  },
  {
    "title": "My & Your", "titleAr": "لي ولك",
    "goal": "I can talk about who things belong to.",
    "grammarFocus": "This is my.../ Is this your...?",
    "vocab": [
      {"en": "my", "ar": "لي / ـي", "example": "This is my bag."},
      {"en": "your", "ar": "لك / ـك", "example": "Is this your pencil?"},
      {"en": "his", "ar": "له", "example": "This is his book."},
      {"en": "her", "ar": "لها", "example": "This is her doll."},
      {"en": "our", "ar": "لنا", "example": "This is our classroom."},
      {"en": "their", "ar": "لهم", "example": "This is their house."},
    ],
  },
  {
    "title": "Have Got (I have...)", "titleAr": "لدي (أملك...)",
    "goal": "I can talk about things I have.",
    "grammarFocus": "I have got.../ Have you got...?",
    "vocab": [
      {"en": "phone", "ar": "هاتف", "example": "I have got a phone."},
      {"en": "watch", "ar": "ساعة يد", "example": "I have got a new watch."},
      {"en": "glasses", "ar": "نظارة", "example": "My dad wears glasses."},
      {"en": "wallet", "ar": "محفظة", "example": "My mom has a wallet."},
      {"en": "key", "ar": "مفتاح", "example": "I have got a key."},
      {"en": "umbrella", "ar": "مظلة", "example": "I have got an umbrella."},
      {"en": "camera", "ar": "كاميرا", "example": "I have got a camera."},
    ],
  },
  {
    "title": "Body & Face Review+", "titleAr": "الجسم والوجه (مراجعة+)",
    "goal": "I can name more parts of my face and body.",
    "grammarFocus": "My ... is/are...",
    "vocab": [
      {"en": "eyebrow", "ar": "حاجب", "example": "My eyebrow is brown."},
      {"en": "chin", "ar": "ذقن", "example": "Touch your chin."},
      {"en": "cheek", "ar": "خد", "example": "My cheek is soft."},
      {"en": "neck", "ar": "رقبة", "example": "My neck is long."},
      {"en": "elbow", "ar": "مرفق", "example": "Bend your elbow."},
      {"en": "knee", "ar": "ركبة", "example": "My knee hurts a little."},
    ],
  },
  {
    "title": "My Classroom", "titleAr": "فصلي الدراسي",
    "goal": "I can name places and people at school.",
    "grammarFocus": "There is / There are a...",
    "vocab": [
      {"en": "classroom", "ar": "الفصل الدراسي", "example": "My classroom is big."},
      {"en": "playground", "ar": "الملعب", "example": "We play in the playground."},
      {"en": "principal", "ar": "مدير المدرسة", "example": "The principal is kind."},
      {"en": "student", "ar": "طالب", "example": "I am a student."},
      {"en": "lesson", "ar": "درس", "example": "This is an English lesson."},
      {"en": "board", "ar": "السبورة", "example": "Look at the board."},
    ],
  },
  {
    "title": "Classroom Commands", "titleAr": "تعليمات الفصل",
    "goal": "I can understand and follow classroom instructions.",
    "grammarFocus": "Classroom commands (imperatives)",
    "vocab": [
      {"en": "stand up", "ar": "قف", "example": "Stand up, please."},
      {"en": "sit down", "ar": "اجلس", "example": "Sit down, please."},
      {"en": "listen", "ar": "استمع", "example": "Listen to the teacher."},
      {"en": "look", "ar": "انظر", "example": "Look at the board."},
      {"en": "open your book", "ar": "افتح كتابك", "example": "Open your book, please."},
      {"en": "raise your hand", "ar": "ارفع يدك", "example": "Raise your hand to answer."},
    ],
  },
  {
    "title": "Numbers 20-100", "titleAr": "الأرقام 20-100",
    "goal": "I can count from twenty to one hundred.",
    "grammarFocus": "Counting by tens 20-100",
    "vocab": [
      {"en": "twenty", "ar": "عشرون", "example": "I have twenty stars."},
      {"en": "thirty", "ar": "ثلاثون", "example": "My mom is thirty years old."},
      {"en": "forty", "ar": "أربعون", "example": "The bus number is forty."},
      {"en": "fifty", "ar": "خمسون", "example": "There are fifty students."},
      {"en": "eighty", "ar": "ثمانون", "example": "My book has eighty pages."},
      {"en": "hundred", "ar": "مئة", "example": "I can count to a hundred."},
    ],
  },
  {
    "title": "Months of the Year", "titleAr": "شهور السنة",
    "goal": "I can name the months of the year.",
    "grammarFocus": "My birthday is in...",
    "vocab": [
      {"en": "January", "ar": "يناير", "example": "My birthday is in January."},
      {"en": "month", "ar": "شهر", "example": "A month has thirty days."},
      {"en": "year", "ar": "سنة", "example": "A year has twelve months."},
      {"en": "June", "ar": "يونيو", "example": "School ends in June."},
      {"en": "September", "ar": "سبتمبر", "example": "School starts in September."},
      {"en": "December", "ar": "ديسمبر", "example": "We have a holiday in December."},
    ],
  },
  {
    "title": "My Birthday", "titleAr": "عيد ميلادي",
    "goal": "I can talk about my birthday.",
    "grammarFocus": "When is your birthday? It's in...",
    "vocab": [
      {"en": "birthday party", "ar": "حفلة عيد ميلاد", "example": "I have a birthday party."},
      {"en": "cake", "ar": "كعكة", "example": "We eat cake."},
      {"en": "candle", "ar": "شمعة", "example": "Blow out the candles."},
      {"en": "present", "ar": "هدية", "example": "I got a nice present."},
      {"en": "balloon", "ar": "بالون", "example": "We have red balloons."},
      {"en": "guest", "ar": "ضيف", "example": "My friends are guests."},
    ],
  },
  {
    "title": "Telling Time (o'clock)", "titleAr": "معرفة الوقت (تماما)",
    "goal": "I can tell the time.",
    "grammarFocus": "What time is it? It's ... o'clock.",
    "vocab": [
      {"en": "clock", "ar": "ساعة الحائط", "example": "Look at the clock."},
      {"en": "o'clock", "ar": "تماما (بالساعة)", "example": "It is three o'clock."},
      {"en": "half past", "ar": "والنصف", "example": "It is half past four."},
      {"en": "morning", "ar": "الصباح", "example": "I wake up in the morning."},
      {"en": "afternoon", "ar": "بعد الظهر", "example": "I play in the afternoon."},
      {"en": "night", "ar": "الليل", "example": "I sleep at night."},
    ],
  },
  {
    "title": "My Daily Morning", "titleAr": "صباحي اليومي",
    "goal": "I can talk about my morning routine.",
    "grammarFocus": "I wake up at.../ I ... every morning.",
    "vocab": [
      {"en": "wake up", "ar": "يستيقظ", "example": "I wake up at seven."},
      {"en": "brush my teeth", "ar": "أنظف أسناني", "example": "I brush my teeth every morning."},
      {"en": "get dressed", "ar": "يرتدي ملابسه", "example": "I get dressed for school."},
      {"en": "have breakfast", "ar": "يتناول الفطور", "example": "I have breakfast with my family."},
      {"en": "put on my shoes", "ar": "يرتدي حذاءه", "example": "I put on my shoes before school."},
      {"en": "go to school", "ar": "يذهب إلى المدرسة", "example": "I go to school by bus."},
    ],
  },
  {
    "title": "My Daily Evening", "titleAr": "مسائي اليومي",
    "goal": "I can talk about my evening routine.",
    "grammarFocus": "In the evening, I...",
    "vocab": [
      {"en": "come home", "ar": "يعود إلى المنزل", "example": "I come home at four."},
      {"en": "do homework", "ar": "يؤدي واجبه", "example": "I do my homework."},
      {"en": "take a shower", "ar": "يستحم", "example": "I take a shower at night."},
      {"en": "have dinner", "ar": "يتناول العشاء", "example": "We have dinner together."},
      {"en": "read a book", "ar": "يقرأ كتابا", "example": "I read a book before bed."},
      {"en": "go to bed", "ar": "يذهب إلى النوم", "example": "I go to bed at nine."},
    ],
  },
  {
    "title": "Food I Eat Every Day", "titleAr": "طعامي اليومي",
    "goal": "I can talk about what I eat every day.",
    "grammarFocus": "I eat.../ I drink...",
    "vocab": [
      {"en": "breakfast", "ar": "الفطور", "example": "I eat eggs for breakfast."},
      {"en": "lunch", "ar": "الغداء", "example": "I eat rice for lunch."},
      {"en": "dinner", "ar": "العشاء", "example": "I eat soup for dinner."},
      {"en": "snack", "ar": "وجبة خفيفة", "example": "I have a snack after school."},
      {"en": "healthy food", "ar": "طعام صحي", "example": "Vegetables are healthy food."},
      {"en": "water", "ar": "ماء", "example": "I drink water every day."},
    ],
  },
  {
    "title": "Do You Like...?", "titleAr": "هل تحب...؟",
    "goal": "I can ask and answer about likes and hobbies.",
    "grammarFocus": "Do you like...? Yes, I do. / No, I don't.",
    "vocab": [
      {"en": "drawing", "ar": "الرسم", "example": "I like drawing."},
      {"en": "singing", "ar": "الغناء", "example": "She likes singing."},
      {"en": "reading", "ar": "القراءة", "example": "He likes reading books."},
      {"en": "dancing", "ar": "الرقص", "example": "We like dancing."},
      {"en": "painting", "ar": "التلوين", "example": "I like painting pictures."},
      {"en": "cooking", "ar": "الطبخ", "example": "My mom likes cooking."},
    ],
  },
  {
    "title": "This/That/These/Those", "titleAr": "هذا/ذلك/هؤلاء/أولئك",
    "goal": "I can point to things near and far.",
    "grammarFocus": "This/That/These/Those + noun",
    "vocab": [
      {"en": "this", "ar": "هذا / هذه (قريب، مفرد)", "example": "This is my pencil."},
      {"en": "that", "ar": "ذلك / تلك (بعيد، مفرد)", "example": "That is your bag."},
      {"en": "these", "ar": "هؤلاء (قريب، جمع)", "example": "These are my books."},
      {"en": "those", "ar": "أولئك (بعيد، جمع)", "example": "Those are your shoes."},
      {"en": "here", "ar": "هنا", "example": "Come here, please."},
      {"en": "there", "ar": "هناك", "example": "The ball is over there."},
    ],
  },
  {
    "title": "Plurals (s/es)", "titleAr": "الجمع (s/es)",
    "goal": "I can make singular words plural.",
    "grammarFocus": "Singular and plural nouns (-s/-es and irregular)",
    "vocab": [
      {"en": "boxes", "ar": "صناديق", "example": "I have two boxes."},
      {"en": "children", "ar": "أطفال", "example": "Three children are playing."},
      {"en": "feet", "ar": "أقدام", "example": "Wash your feet."},
      {"en": "watches", "ar": "ساعات", "example": "He has two watches."},
      {"en": "babies", "ar": "أطفال رضّع", "example": "The babies are sleeping."},
      {"en": "men", "ar": "رجال", "example": "Two men are talking."},
    ],
  },
  {
    "title": "Review + My Poster Project", "titleAr": "مراجعة + مشروع ملصقي",
    "goal": "I can talk about myself, my family, my day, and my school using everything I've learned.",
    "grammarFocus": "Review of all structures from Lessons 1-19",
    "vocab": [
      {"en": "hello", "ar": "مرحبا", "example": "Hello, nice to meet you."},
      {"en": "birthday", "ar": "عيد الميلاد", "example": "Happy birthday!"},
      {"en": "parents", "ar": "الوالدان", "example": "I love my parents."},
      {"en": "classroom", "ar": "الفصل الدراسي", "example": "My classroom is fun."},
      {"en": "breakfast", "ar": "الفطور", "example": "I eat a big breakfast."},
      {"en": "drawing", "ar": "الرسم", "example": "I like drawing."},
      {"en": "children", "ar": "أطفال", "example": "The children are playing."},
      {"en": "clock", "ar": "ساعة الحائط", "example": "Look at the clock."},
    ],
  },
]

OUT_DIR = "lessons/level2"
os.makedirs(OUT_DIR, exist_ok=True)

for i, L in enumerate(LESSONS, start=1):
    num = f"{i:02d}"
    lesson = {
        "id": f"level2-{num}",
        "level": "level2",
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
