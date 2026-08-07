# -*- coding: utf-8 -*-
import sys, json, glob, os
sys.path.insert(0, "lib")
from deck_template_teen2 import build_deck_v2
from grammar_slides import match_grammar_by_lesson_focus

LEVEL = "level3"
_lessons = {}
for f in sorted(glob.glob(f"lessons/{LEVEL}/lesson*.json")):
    d = json.load(open(f, encoding="utf-8"))
    _lessons[d["number"]] = d
GRAMMAR_UNITS = match_grammar_by_lesson_focus(LEVEL, _lessons)

THEME_BY_LESSON = {
    1: "social", 2: "social", 3: "social", 4: "room", 5: "room", 6: "social",
    7: "social", 8: "school", 9: "sport", 10: "game", 11: "sport", 12: "school",
    13: "school", 14: "social", 15: "school", 16: "game", 17: "default",
    18: "default", 19: "sport", 20: "default",
}

HOOKS = {
    1: "Think of your closest friends. What's one thing you always do together?",
    2: "Do you know someone who's always busy? What do they do all day?",
    3: "What's something everyone else loves that just isn't your thing?",
    4: "What's one thing in your room that says a lot about who you are?",
    5: "Do you have a favorite piece of clothing? What makes it special?",
    6: "How many people are actually in your 'squad'? Count them up.",
    7: "Have you ever mixed up your phone with a friend's? What happened?",
    8: "Could you draw a map of your school from memory?",
    9: "What's one skill you wish you had right now?",
    10: "Are you good at guessing games? Let's find out.",
    11: "Who's the fastest person you know? What makes them so fast?",
    12: "Remember your first day somewhere new. How did it feel?",
    13: "What's one classroom rule you think is actually a good idea?",
    14: "What are you usually doing at this exact time on a school day?",
    15: "What's your go-to way to study before a big test?",
    16: "What's the last game you played with friends? Who won?",
    17: "What kind of movie do you never get tired of watching?",
    18: "Think of a topic you and a friend disagree on. What is it?",
    19: "Have you ever been nervous before a big game or event?",
    20: "What's one thing you'd want to remember about this year?",
}
CHALLENGES = {
    1: {"prompt": "Describe your crew in 3 sentences using 'we' -- without looking at your notes.", "hint": "Try to use at least 2 vocabulary words from today."},
    2: {"prompt": "Describe what a friend does every day using 'he' or 'she' in 3 sentences.", "hint": "Remember the -s ending!"},
    3: {"prompt": "Name 2 things you don't like, using today's negative form.", "hint": "Use 'don't' or 'doesn't' correctly."},
    4: {"prompt": "Describe your room using 3 sentences with 'There is' or 'There are' -- without looking at your notes.", "hint": "Try to use at least 2 different vocabulary words from today."},
    5: {"prompt": "Point to 3 things nearby and describe them using this/that/these/those.", "hint": "Remember: near vs far, one vs many."},
    6: {"prompt": "List 3 groups of people in your life using plural nouns.", "hint": "Watch out for irregular plurals!"},
    7: {"prompt": "Describe 3 things that belong to you or someone else using possessive adjectives.", "hint": "My, your, his, her, our, their."},
    8: {"prompt": "Describe where 3 places are around your own school using prepositions of place.", "hint": "Next to, behind, between, in front of."},
    9: {"prompt": "Tell a partner 2 things you can do and 1 thing you can't.", "hint": "Use 'can' and 'can't' correctly."},
    10: {"prompt": "Ask a partner 3 Wh- questions about their weekend.", "hint": "Who, what, where, when, why, how."},
    11: {"prompt": "Compare yourself to a friend using 3 comparative sentences.", "hint": "Remember the -er ending, or 'more' for longer words."},
    12: {"prompt": "Introduce an imaginary new student to the class in 3 sentences.", "hint": "Use a/an/the correctly."},
    13: {"prompt": "Give 3 classroom instructions using imperatives.", "hint": "No subject needed -- just the action!"},
    14: {"prompt": "Describe what 3 people around you are doing right now.", "hint": "Use am/is/are + verb-ing."},
    15: {"prompt": "Describe your study routine in 3 sentences.", "hint": "Use today's vocabulary words."},
    16: {"prompt": "Describe your last game night in 3 sentences.", "hint": "Use today's vocabulary words."},
    17: {"prompt": "Describe your favorite movie genre and why you like it.", "hint": "Use at least 2 vocabulary words from today."},
    18: {"prompt": "Share an opinion and give a reason, using today's structures.", "hint": "I think... because..."},
    19: {"prompt": "Retell the story of the big match in your own words, in 3 sentences.", "hint": "Use at least 2 vocabulary words from the story."},
    20: {"prompt": "Pick your favorite lesson from this level and explain why in 3 sentences.", "hint": "Try to use words from at least 2 different lessons."},
}
REAL_LIFE = {
    1: "This week, use 'hang out' or 'chat' with a friend in English at least once!",
    2: "Tonight, describe what a family member does using he/she + verb-s.",
    3: "Next time you dislike something, try saying it in English using today's structure.",
    4: "Tonight, describe your room to a family member in English. See how many words you remember!",
    5: "Next time you're shopping or getting dressed, describe your clothes using this/that/these/those.",
    6: "This week, introduce your 'squad' to someone in English.",
    7: "Next time you can't find your phone, ask 'Whose phone is this?' in English!",
    8: "Tomorrow at school, describe where 3 things are using today's prepositions.",
    9: "This week, tell someone one thing you can do that might surprise them.",
    10: "Play a real round of 20 Questions in English with a friend or family member this week.",
    11: "Next time you're playing a game, use a comparative to talk about who's winning.",
    12: "If you ever meet someone new this week, try welcoming them the way we practiced.",
    13: "Notice 3 classroom rules tomorrow and say them in English in your head.",
    14: "Right now, describe what you are doing in English -- even just in your head!",
    15: "Try one new study technique from today's lesson this week.",
    16: "Next game night, use today's words with your friends or family.",
    17: "Next time you watch a movie, describe it using today's vocabulary.",
    18: "This week, share an opinion in English with a friend or family member.",
    19: "Think about a time you were on a team. Describe it using today's words.",
    20: "Write down 3 things you learned this year, in English.",
}
DIALOGUES = {
  1: [("What do you and your crew do after school?", "ماذا تفعلون أنت وشلتك بعد المدرسة؟"),
      ("We hang out at the park and chat.", "نقضي وقتا في الحديقة ونتحدث."),
      ("Do you text each other a lot?", "هل تراسلون بعضكم كثيرا؟"),
      ("Yes, and we laugh at each other's jokes!", "نعم، ونضحك على نكات بعضنا!")],
  2: [("What does your best friend do on weekends?", "ماذا يفعل صديقك المقرب في العطلة؟"),
      ("She plays basketball and practices with her team.", "تلعب كرة السلة وتتمرن مع فريقها."),
      ("Does she study too?", "هل تدرس أيضا؟"),
      ("Yes, she studies every evening.", "نعم، تدرس كل مساء.")],
  3: [("Do you like reality shows?", "هل تحب برامج الواقع؟"),
      ("Not really, I don't like boring shows.", "ليس حقا، لا أحب البرامج الممل."),
      ("What do you think is cool?", "ما الذي تعتقد أنه رائع؟"),
      ("I think gaming videos are awesome!", "أعتقد أن فيديوهات الألعاب رائعة!")],
  4: [("What's in your room?", "ماذا يوجد في غرفتك؟"),
      ("There is a poster and a speaker on my shelf.", "يوجد ملصق وسماعة على رفي."),
      ("Is there a desk too?", "هل يوجد مكتب أيضا؟"),
      ("Yes, there is a lamp on my desk.", "نعم، يوجد مصباح على مكتبي.")],
  5: [("These sneakers are new. Do you like them?", "هذا الحذاء الرياضي جديد. هل يعجبك؟"),
      ("Yes! Are those headphones new too?", "نعم! هل تلك السماعات جديدة أيضا؟"),
      ("This hoodie is my favorite.", "هذه السترة هي المفضلة لدي."),
      ("That cap looks great on you!", "تلك القبعة تبدو رائعة عليك!")],
  6: [("How many teammates do you have?", "كم عدد زملاء فريقك؟"),
      ("I have ten teammates and two classmates on the team.", "لدي عشرة زملاء فريق وزميلا صف في الفريق."),
      ("Do your cousins play too?", "هل يلعب أبناء عمك أيضا؟"),
      ("Yes, and our neighbors come to watch!", "نعم، وجيراننا يأتون للمشاهدة!")],
  7: [("Whose phone is this?", "لمن هذا الهاتف؟"),
      ("It's my phone. Is this your charger?", "هذا هاتفي. هل هذا شاحنك؟"),
      ("Yes! Are these her earbuds?", "نعم! هل هذه سماعات أذنها؟"),
      ("No, those are his earbuds.", "لا، تلك سماعات أذنه.")],
  8: [("Where's the cafeteria?", "أين الكافيتيريا؟"),
      ("It's behind the gym, next to the library.", "إنها خلف الصالة الرياضية، بجانب المكتبة."),
      ("Is the playground in front of the gate?", "هل ساحة اللعب أمام البوابة؟"),
      ("Yes, it's between the gym and the gate.", "نعم، إنها بين الصالة الرياضية والبوابة.")],
  9: [("Can you skateboard?", "هل تستطيع التزلج بلوح؟"),
      ("Yes, I can! Can you dance?", "نعم أستطيع! هل تستطيع الرقص؟"),
      ("A little. I can draw really well though.", "قليلا. لكنني أستطيع الرسم بشكل جيد."),
      ("That's cool! I can bake, but I can't draw.", "هذا رائع! أستطيع الخبز، لكن لا أستطيع الرسم.")],
  10: [("I have a mystery for you. Can you guess?", "لدي لغز لك. هل تستطيع التخمين؟"),
       ("Give me a clue!", "أعطني دليلا!"),
       ("It's a riddle about school.", "إنها أحجية عن المدرسة."),
       ("Is the answer 'homework'? That's my secret guess!", "هل الإجابة 'واجب منزلي'؟ هذا تخميني السري!")],
  11: [("Let's have a race! Who's faster?", "لنتسابق! من الأسرع؟"),
       ("I think I'm faster than you.", "أعتقد أنني أسرع منك."),
       ("My score is higher than yours!", "نتيجتي أعلى من نتيجتك!"),
       ("She broke the record. She's the fastest!", "كسرت الرقم القياسي. إنها الأسرع!")],
  12: [("There's a newcomer in our class.", "هناك طالب جديد في صفنا."),
       ("She looks a little nervous.", "تبدو متوترة قليلا."),
       ("Let's welcome her and introduce ourselves.", "لنرحب بها ونعرّف بأنفسنا."),
       ("Good idea, she won't feel like a stranger anymore!", "فكرة جيدة، لن تشعر أنها غريبة بعد الآن!")],
  13: [("Remember to raise your hand in class.", "تذكر أن ترفع يدك في الصف."),
       ("And line up quietly at the door.", "واصطف بهدوء عند الباب."),
       ("Should we pay attention during the test?", "هل يجب أن ننتبه أثناء الاختبار؟"),
       ("Yes, and submit your homework on time!", "نعم، وسلّم واجبك في الوقت المحدد!")],
  14: [("What are you doing right now?", "ماذا تفعل الآن؟"),
       ("I am texting my friend. What about you?", "أراسل صديقي. ماذا عنك؟"),
       ("I am scrolling my phone and chilling.", "أتصفح هاتفي وأسترخي."),
       ("She is studying, but we are gaming!", "هي تدرس، لكننا نلعب ألعاب فيديو!")],
  15: [("Are you highlighting your notes?", "هل تبرز ملاحظاتك بالألوان؟"),
       ("Yes, and I am memorizing new words too.", "نعم، وأحفظ كلمات جديدة أيضا."),
       ("We have a quiz tomorrow. Are you making flashcards?", "لدينا اختبار قصير غدا. هل تصنع بطاقات تعليمية؟"),
       ("Yes! And I'm finishing my group project presentation.", "نعم! وأنهي عرضي التقديمي لمشروعي الجماعي.")],
  16: [("Pass me the controller, it's game night!", "أعطني ذراع التحكم، إنها ليلة الألعاب!"),
       ("I have a new strategy this time.", "لدي استراتيجية جديدة هذه المرة."),
       ("My teammate just leveled up!", "زميل فريقي وصل لمستوى جديد للتو!"),
       ("That's the high score! You're the champion!", "هذه أعلى نتيجة! أنت البطل!")],
  17: [("What genre do you want to watch?", "ما نوع الفيلم الذي تريد مشاهدته؟"),
       ("Let's get popcorn first!", "لنحضر الفشار أولا!"),
       ("This trailer looks amazing.", "هذا الإعلان يبدو مذهلا."),
       ("I can't wait for the sequel!", "لا أطيق الانتظار للجزء التالي!")],
  18: [("What's your opinion about the new rule?", "ما رأيك في القاعدة الجديدة؟"),
       ("I agree with it, actually.", "أوافق عليها في الحقيقة."),
       ("I disagree. What's your reason?", "أنا أختلف. ما سببك؟"),
       ("Let's decide together, it's our choice.", "لنقرر معا، إنه خيارنا.")],
  19: [("Are you nervous about the match today?", "هل أنت متوتر بشأن المباراة اليوم؟"),
       ("A little, but I know we can win.", "قليلا، لكنني أعلم أننا نستطيع الفوز."),
       ("Let's cheer for the team!", "لنشجع الفريق!"),
       ("The coach is so proud of our teamwork.", "المدرب فخور جدا بعملنا الجماعي.")],
  20: [("What did you learn this year?", "ماذا تعلمت هذا العام؟"),
       ("So much! My crew, my teammates, everything.", "الكثير! شلتي، زملاء فريقي، كل شيء."),
       ("Let's put it all in our time capsule.", "لنضع كل ذلك في كبسولة الزمن الخاصة بنا."),
       ("I'm proud of how far we've come!", "أنا فخور بمدى تقدمنا!")],
}

def make_notice_sentences(lesson_num, grammar_topic):
    """Grammar topic's own examples (all correctly use the pattern) plus
    one sentence borrowed from a different lesson's vocab (genuinely
    doesn't use this lesson's pattern) for real contrast in the tap
    task -- no hand-authoring needed, built entirely from data already
    on hand."""
    sentences = []
    if grammar_topic:
        for ex in grammar_topic.get("examples", [])[:4]:
            sentences.append(ex["en"])
    other_lesson_num = 1 if lesson_num != 1 else 2
    other = _lessons.get(other_lesson_num)
    if other and other["vocab"]:
        sentences.append(other["vocab"][0]["example"])
    return sentences

os.makedirs(f"slide-content/{LEVEL}", exist_ok=True)
manifest = {}
for num in sorted(_lessons.keys()):
    lesson = _lessons[num]
    grammar_topic = GRAMMAR_UNITS.get(num)
    dialogue = DIALOGUES.get(num, [])
    theme_key = THEME_BY_LESSON.get(num, "default")
    hook = HOOKS.get(num, f"Let's talk about {lesson['title'].lower()}.")
    challenge = CHALLENGES.get(num)
    real_life = REAL_LIFE.get(num)
    notice_sentences = make_notice_sentences(num, grammar_topic)
    notice_note = grammar_topic["title"] if grammar_topic else ""

    slides = build_deck_v2(num, lesson, grammar_topic, dialogue, hook, notice_sentences,
                            notice_note, challenge, real_life, theme_key=theme_key)
    nn = f"{num:02d}"
    lesson_dir = f"slide-content/{LEVEL}/{nn}"
    os.makedirs(lesson_dir, exist_ok=True)
    for old in glob.glob(lesson_dir + "/slide-*.html"):
        os.remove(old)
    for i, html in enumerate(slides, start=1):
        with open(f"{lesson_dir}/slide-{i:02d}.html", "w", encoding="utf-8") as f:
            f.write(html)
    manifest[nn] = len(slides)
    print(f"{LEVEL} lesson {nn}: {len(slides)} slides [{theme_key}]" + (" [+grammar]" if grammar_topic else ""))

os.makedirs(f"assets/slides/{LEVEL}", exist_ok=True)
with open(f"assets/slides/{LEVEL}/manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=0)
print("Manifest written:", f"assets/slides/{LEVEL}/manifest.json")
