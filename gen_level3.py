import json, os

LESSONS = [
  {
    "title": "My Town", "titleAr": "مدينتي",
    "goal": "I can name places in my town.",
    "grammarFocus": "There is / There are + place",
    "vocab": [
      {"en": "library", "ar": "مكتبة", "example": "There is a library in my town."},
      {"en": "zoo", "ar": "حديقة حيوان", "example": "We visit the zoo on weekends."},
      {"en": "museum", "ar": "متحف", "example": "There is a museum near my house."},
      {"en": "beach", "ar": "شاطئ", "example": "There is a beach in my town."},
      {"en": "mountain", "ar": "جبل", "example": "I can see a mountain from here."},
      {"en": "farm", "ar": "مزرعة", "example": "There is a farm outside town."},
    ],
  },
  {
    "title": "Jobs Around Town", "titleAr": "وظائف في المدينة",
    "goal": "I can name jobs people do.",
    "grammarFocus": "He is a... / She is a...",
    "vocab": [
      {"en": "doctor", "ar": "طبيب", "example": "The doctor helps sick people."},
      {"en": "teacher", "ar": "معلم", "example": "My teacher is kind."},
      {"en": "police officer", "ar": "شرطي", "example": "The police officer helps us."},
      {"en": "firefighter", "ar": "رجل إطفاء", "example": "The firefighter is brave."},
      {"en": "farmer", "ar": "مزارع", "example": "The farmer works on the farm."},
      {"en": "chef", "ar": "طاهٍ", "example": "The chef cooks delicious food."},
    ],
  },
  {
    "title": "What Does She Do?", "titleAr": "ماذا تعمل؟",
    "goal": "I can ask and answer about jobs.",
    "grammarFocus": "What does he/she do?",
    "vocab": [
      {"en": "engineer", "ar": "مهندس", "example": "My uncle is an engineer."},
      {"en": "pilot", "ar": "طيار", "example": "The pilot flies the plane."},
      {"en": "nurse", "ar": "ممرضة", "example": "The nurse helps the doctor."},
      {"en": "driver", "ar": "سائق", "example": "The driver drives the bus."},
      {"en": "job", "ar": "وظيفة", "example": "What is your mom's job?"},
      {"en": "work", "ar": "يعمل", "example": "My dad works every day."},
    ],
  },
  {
    "title": "Getting Around", "titleAr": "التنقل",
    "goal": "I can name ways to travel.",
    "grammarFocus": "I go by...",
    "vocab": [
      {"en": "car", "ar": "سيارة", "example": "We go by car."},
      {"en": "bus", "ar": "حافلة", "example": "I go to school by bus."},
      {"en": "bike", "ar": "دراجة", "example": "He rides his bike."},
      {"en": "train", "ar": "قطار", "example": "The train is fast."},
      {"en": "plane", "ar": "طائرة", "example": "We travel by plane."},
      {"en": "boat", "ar": "قارب", "example": "The boat is on the sea."},
    ],
  },
  {
    "title": "How Do You Go to School?", "titleAr": "كيف تذهب إلى المدرسة؟",
    "goal": "I can talk about how I travel.",
    "grammarFocus": "How do you go to...?",
    "vocab": [
      {"en": "taxi", "ar": "سيارة أجرة", "example": "We take a taxi."},
      {"en": "ship", "ar": "سفينة", "example": "The ship is very big."},
      {"en": "walk", "ar": "يمشي", "example": "I walk to school."},
      {"en": "motorcycle", "ar": "دراجة نارية", "example": "My uncle has a motorcycle."},
      {"en": "fast", "ar": "سريع", "example": "The train is fast."},
      {"en": "slow", "ar": "بطيء", "example": "The boat is slow."},
    ],
  },
  {
    "title": "What Are You Doing?", "titleAr": "ماذا تفعل؟",
    "goal": "I can say what I am doing now.",
    "grammarFocus": "I am ...ing (Present Continuous)",
    "vocab": [
      {"en": "running", "ar": "يجري", "example": "I am running fast."},
      {"en": "jumping", "ar": "يقفز", "example": "She is jumping high."},
      {"en": "eating", "ar": "يأكل", "example": "He is eating lunch."},
      {"en": "drinking", "ar": "يشرب", "example": "I am drinking water."},
      {"en": "sleeping", "ar": "ينام", "example": "The baby is sleeping."},
      {"en": "swimming", "ar": "يسبح", "example": "We are swimming today."},
    ],
  },
  {
    "title": "Hobbies & Fun", "titleAr": "الهوايات والمرح",
    "goal": "I can talk about my hobbies.",
    "grammarFocus": "I like + verb-ing",
    "vocab": [
      {"en": "cycling", "ar": "ركوب الدراجة", "example": "I like cycling."},
      {"en": "photography", "ar": "التصوير", "example": "My sister likes photography."},
      {"en": "football", "ar": "كرة القدم", "example": "I like playing football."},
      {"en": "fishing", "ar": "صيد السمك", "example": "My dad likes fishing."},
      {"en": "gardening", "ar": "البستنة", "example": "My grandma likes gardening."},
      {"en": "collecting", "ar": "جمع الأشياء", "example": "I like collecting stamps."},
    ],
  },
  {
    "title": "Sports Day", "titleAr": "يوم رياضي",
    "goal": "I can name sports and ask about ability.",
    "grammarFocus": "Can you play...?",
    "vocab": [
      {"en": "basketball", "ar": "كرة السلة", "example": "Can you play basketball?"},
      {"en": "tennis", "ar": "التنس", "example": "She plays tennis well."},
      {"en": "volleyball", "ar": "الكرة الطائرة", "example": "We play volleyball at school."},
      {"en": "race", "ar": "سباق", "example": "Let's have a race!"},
      {"en": "team", "ar": "فريق", "example": "I am on the blue team."},
      {"en": "win", "ar": "يفوز", "example": "Our team can win!"},
    ],
  },
  {
    "title": "Can You...?", "titleAr": "هل تستطيع...؟",
    "goal": "I can talk about what I can and can't do.",
    "grammarFocus": "Can / Can't (ability)",
    "vocab": [
      {"en": "climb", "ar": "يتسلق", "example": "I can climb the tree."},
      {"en": "swim", "ar": "يسبح", "example": "Can you swim?"},
      {"en": "dance", "ar": "يرقص", "example": "She can dance well."},
      {"en": "sing", "ar": "يغني", "example": "I can sing a song."},
      {"en": "cook", "ar": "يطبخ", "example": "My mom can cook."},
      {"en": "ride a bike", "ar": "يركب دراجة", "example": "I can ride a bike."},
    ],
  },
  {
    "title": "Wild Animals", "titleAr": "الحيوانات البرية",
    "goal": "I can name wild animals.",
    "grammarFocus": "This/That/These/Those (review)",
    "vocab": [
      {"en": "tiger", "ar": "نمر", "example": "The tiger is strong."},
      {"en": "bear", "ar": "دب", "example": "That bear is big."},
      {"en": "monkey", "ar": "قرد", "example": "The monkey climbs trees."},
      {"en": "snake", "ar": "ثعبان", "example": "This snake is long."},
      {"en": "wolf", "ar": "ذئب", "example": "The wolf lives in the forest."},
      {"en": "giraffe", "ar": "زرافة", "example": "The giraffe has a long neck."},
    ],
  },
  {
    "title": "Zoo Adventure", "titleAr": "مغامرة في حديقة الحيوان",
    "goal": "I can compare animals.",
    "grammarFocus": "Comparatives (bigger, smaller)",
    "vocab": [
      {"en": "fox", "ar": "ثعلب", "example": "The fox is quick."},
      {"en": "zebra", "ar": "حمار وحشي", "example": "The zebra has stripes."},
      {"en": "wild", "ar": "بري", "example": "Lions are wild animals."},
      {"en": "cage", "ar": "قفص", "example": "The bird is in a cage."},
      {"en": "bigger", "ar": "أكبر", "example": "The elephant is bigger than the fox."},
      {"en": "smaller", "ar": "أصغر", "example": "The fox is smaller than the wolf."},
    ],
  },
  {
    "title": "On the Farm", "titleAr": "في المزرعة",
    "goal": "I can name farm animals.",
    "grammarFocus": "There is a... / There are...",
    "vocab": [
      {"en": "sheep", "ar": "خروف", "example": "There is a sheep on the farm."},
      {"en": "goat", "ar": "ماعز", "example": "The goat eats grass."},
      {"en": "chicken", "ar": "دجاجة", "example": "There are chickens in the farm."},
      {"en": "pig", "ar": "خنزير", "example": "The pig is pink."},
      {"en": "donkey", "ar": "حمار", "example": "The donkey carries bags."},
      {"en": "cow", "ar": "بقرة", "example": "The cow gives us milk."},
    ],
  },
  {
    "title": "Sea Animals", "titleAr": "حيوانات البحر",
    "goal": "I can name sea animals.",
    "grammarFocus": "Possessive adjectives (its, their)",
    "vocab": [
      {"en": "shark", "ar": "سمكة قرش", "example": "The shark has sharp teeth."},
      {"en": "whale", "ar": "حوت", "example": "The whale is huge."},
      {"en": "dolphin", "ar": "دولفين", "example": "The dolphin is smart."},
      {"en": "octopus", "ar": "أخطبوط", "example": "The octopus has eight arms."},
      {"en": "crab", "ar": "سلطعون", "example": "The crab walks sideways."},
      {"en": "jellyfish", "ar": "قنديل البحر", "example": "The jellyfish is soft."},
    ],
  },
  {
    "title": "Seasons of the Year", "titleAr": "فصول السنة",
    "goal": "I can name the four seasons.",
    "grammarFocus": "In summer, I...",
    "vocab": [
      {"en": "spring", "ar": "الربيع", "example": "Flowers grow in spring."},
      {"en": "summer", "ar": "الصيف", "example": "It is hot in summer."},
      {"en": "autumn", "ar": "الخريف", "example": "Leaves fall in autumn."},
      {"en": "winter", "ar": "الشتاء", "example": "It is cold in winter."},
      {"en": "season", "ar": "فصل", "example": "My favorite season is summer."},
      {"en": "warm", "ar": "دافئ", "example": "Spring days are warm."},
    ],
  },
  {
    "title": "What's the Weather?", "titleAr": "كيف هو الطقس؟",
    "goal": "I can describe the weather.",
    "grammarFocus": "What's the weather like?",
    "vocab": [
      {"en": "sunny", "ar": "مشمس", "example": "It is sunny today."},
      {"en": "cloudy", "ar": "غائم", "example": "It is cloudy outside."},
      {"en": "rainy", "ar": "ممطر", "example": "It is rainy today."},
      {"en": "windy", "ar": "عاصف", "example": "It is windy outside."},
      {"en": "snowy", "ar": "مثلج", "example": "It is snowy in winter."},
      {"en": "stormy", "ar": "عاصفة", "example": "It is stormy tonight."},
    ],
  },
  {
    "title": "Clothes for the Weather", "titleAr": "ملابس الطقس",
    "goal": "I can talk about clothes for each season.",
    "grammarFocus": "I wear... when it's...",
    "vocab": [
      {"en": "scarf", "ar": "وشاح", "example": "I wear a scarf in winter."},
      {"en": "gloves", "ar": "قفازات", "example": "I wear gloves when it's cold."},
      {"en": "boots", "ar": "حذاء طويل", "example": "I wear boots in the rain."},
      {"en": "sweater", "ar": "سترة صوفية", "example": "I wear a sweater in autumn."},
      {"en": "swimsuit", "ar": "ملابس سباحة", "example": "I wear a swimsuit in summer."},
      {"en": "raincoat", "ar": "معطف مطر", "example": "I wear a raincoat when it's rainy."},
    ],
  },
  {
    "title": "Where Is It?", "titleAr": "أين هو؟",
    "goal": "I can describe where things are.",
    "grammarFocus": "Prepositions of place (next to, between)",
    "vocab": [
      {"en": "next to", "ar": "بجانب", "example": "The cat is next to the box."},
      {"en": "between", "ar": "بين", "example": "The ball is between the chairs."},
      {"en": "behind", "ar": "خلف", "example": "The dog is behind the door."},
      {"en": "in front of", "ar": "أمام", "example": "She stands in front of the class."},
      {"en": "above", "ar": "فوق", "example": "The lamp is above the table."},
      {"en": "below", "ar": "تحت", "example": "The bag is below the chair."},
    ],
  },
  {
    "title": "Big Questions", "titleAr": "أسئلة مهمة",
    "goal": "I can ask questions with who, what, where, when, why, how.",
    "grammarFocus": "Wh- Questions",
    "vocab": [
      {"en": "who", "ar": "من", "example": "Who is that?"},
      {"en": "what", "ar": "ماذا", "example": "What is your name?"},
      {"en": "where", "ar": "أين", "example": "Where do you live?"},
      {"en": "when", "ar": "متى", "example": "When is your birthday?"},
      {"en": "why", "ar": "لماذا", "example": "Why are you happy?"},
      {"en": "how", "ar": "كيف", "example": "How are you today?"},
    ],
  },
  {
    "title": "My Favorite Place", "titleAr": "مكاني المفضل",
    "goal": "I can describe my favorite place in town.",
    "grammarFocus": "Review: there is/are + adjectives",
    "vocab": [
      {"en": "airport", "ar": "مطار", "example": "The airport is very busy."},
      {"en": "restaurant", "ar": "مطعم", "example": "We ate at a restaurant."},
      {"en": "full", "ar": "ممتلئ", "example": "The library is full today."},
      {"en": "empty", "ar": "فارغ", "example": "The park is empty now."},
      {"en": "loud", "ar": "صاخب", "example": "The zoo is loud."},
      {"en": "quiet", "ar": "هادئ", "example": "The library is quiet."},
    ],
  },
  {
    "title": "Review + My Town Map Project", "titleAr": "مراجعة + مشروع خريطة مدينتي",
    "goal": "I can talk about my town, jobs, animals, and weather using everything I've learned.",
    "grammarFocus": "Review of all structures from Lessons 1-19",
    "vocab": [
      {"en": "library", "ar": "مكتبة", "example": "There is a library in my town."},
      {"en": "doctor", "ar": "طبيب", "example": "The doctor helps sick people."},
      {"en": "bus", "ar": "حافلة", "example": "I go to school by bus."},
      {"en": "swimming", "ar": "يسبح", "example": "We are swimming today."},
      {"en": "tiger", "ar": "نمر", "example": "The tiger is strong."},
      {"en": "sunny", "ar": "مشمس", "example": "It is sunny today."},
      {"en": "between", "ar": "بين", "example": "The ball is between the chairs."},
      {"en": "cow", "ar": "بقرة", "example": "The cow gives us milk."},
    ],
  },
]

OUT_DIR = "lessons/level3"
os.makedirs(OUT_DIR, exist_ok=True)

for i, L in enumerate(LESSONS, start=1):
    num = f"{i:02d}"
    lesson = {
        "id": f"level3-{num}",
        "level": "level3",
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
