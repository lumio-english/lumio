# -*- coding: utf-8 -*-
import sys, json, glob, os
sys.path.insert(0, "lib")
from deck_template_teen2 import build_deck_v2
from grammar_slides import match_grammar_by_lesson_focus

LEVEL = "level6"
_lessons = {}
for f in sorted(glob.glob(f"lessons/{LEVEL}/lesson*.json")):
    d = json.load(open(f, encoding="utf-8"))
    _lessons[d["number"]] = d
GRAMMAR_UNITS = match_grammar_by_lesson_focus(LEVEL, _lessons)

THEME_BY_LESSON = {
    1: "default", 2: "default", 3: "social", 4: "room", 5: "room",
    6: "school", 7: "money", 8: "social", 9: "default", 10: "room",
    11: "school", 12: "sport", 13: "default", 14: "room", 15: "default",
    16: "school", 17: "default", 18: "default", 19: "school", 20: "default",
}

HOOKS = {
    1: "What's one plan you already have for this weekend or next week?",
    2: "What's one thing you think will be different about your life in 5 years?",
    3: "What's already on your calendar for this week?",
    4: "Has your phone ever rung at exactly the wrong moment?",
    5: "What's one thing you have to do every single day, whether you want to or not?",
    6: "Think of someone you know who does everything really carefully. Who is it?",
    7: "Think of two things you own -- which one is more expensive?",
    8: "What are you already planning to do this weekend?",
    9: "Do you think you'll be good at your future job? Why?",
    10: "What's one chore or rule you have at home?",
    11: "Who's the most clearly-spoken person you know?",
    12: "Think of two phones, movies, or games -- which is more interesting to you?",
    13: "Have you ever done two things at the exact same time, like eating and texting?",
    14: "What's one goal you already have for next year?",
    15: "Do you ever disagree with a friend about something small? What was it about?",
    16: "What's something you're already getting ready for?",
    17: "Think of an instruction you give someone often. How should it be done?",
    18: "What's a tradition or custom from your culture that you like?",
    19: "Have you ever been on a school trip that didn't go as planned?",
    20: "What's one thing you hope is true about your life a year from now?",
}
CHALLENGES = {
    1: {"prompt": "Describe 3 plans you have using 'going to'.", "hint": "I'm going to..."},
    2: {"prompt": "Make 3 predictions about your future using 'will'.", "hint": "I will... / probably... / definitely..."},
    3: {"prompt": "Describe 3 fixed plans for this week using Present Continuous.", "hint": "I'm meeting/traveling/starting..."},
    4: {"prompt": "Describe something that interrupted you in the past.", "hint": "I was ___ when/while ___."},
    5: {"prompt": "Say 3 things you have to do and 1 you don't have to do.", "hint": "I have to... / I don't have to..."},
    6: {"prompt": "Describe how you do 3 different things using adverbs of manner.", "hint": "quickly, carefully, quietly..."},
    7: {"prompt": "Compare 3 things using long comparative adjectives.", "hint": "more interesting/difficult/expensive..."},
    8: {"prompt": "Describe your weekend plans in 3 sentences.", "hint": "Use today's vocabulary words."},
    9: {"prompt": "Make 3 predictions about your classmates' futures.", "hint": "I think she will..."},
    10: {"prompt": "Describe 3 rules or responsibilities at your home.", "hint": "I have to... / I'm allowed to..."},
    11: {"prompt": "Describe how 3 people you know talk or communicate.", "hint": "honestly, politely, confidently..."},
    12: {"prompt": "Compare 2 options and say which is better, with reasons.", "hint": "This is more ___ than that."},
    13: {"prompt": "Describe 2 things you did at the same time in the past.", "hint": "I was ___ while ___."},
    14: {"prompt": "Describe 3 goals or plans for next year.", "hint": "Mix 'going to' and 'will'."},
    15: {"prompt": "Take a side in a friendly debate and explain your point of view.", "hint": "I would argue that..."},
    16: {"prompt": "Describe how you're preparing for something coming up.", "hint": "I'm going to prepare/practice/review..."},
    17: {"prompt": "Give 3 instructions using adverbs of manner.", "hint": "Do it properly/safely/neatly..."},
    18: {"prompt": "Compare your culture to another one you know about.", "hint": "Use long comparative adjectives."},
    19: {"prompt": "Retell the school trip story in your own words.", "hint": "Use at least 2 vocabulary words from the story."},
    20: {"prompt": "Describe one past achievement and one future goal.", "hint": "Try to use words from at least 3 different lessons."},
}
REAL_LIFE = {
    1: "This week, tell someone 3 real plans using 'going to'.",
    2: "Make a real prediction about tomorrow using 'will'.",
    3: "Tell someone about a fixed plan you have this week.",
    4: "Think of a real time you were interrupted -- describe it in English.",
    5: "Tell a family member something you have to do today.",
    6: "Notice how someone does something today and describe it with an adverb.",
    7: "Compare two real things you own using a long adjective.",
    8: "Tell a friend your real weekend plans.",
    9: "Share a real prediction about your future with someone.",
    10: "Talk to your family about one responsibility you have.",
    11: "Notice how someone talks today and describe it with an adverb.",
    12: "Compare two real options you're choosing between this week.",
    13: "Describe two things you did at once today.",
    14: "Write down one real plan for next year.",
    15: "Have a friendly, polite disagreement with someone this week.",
    16: "Describe what you're really preparing for right now.",
    17: "Give someone a real instruction using an adverb of manner.",
    18: "Look up one custom from another culture and compare it to yours.",
    19: "Think about a real trip that had an unexpected moment.",
    20: "Write one real goal for the next year, in English.",
}
DISCUSSIONS = {
    1: ["Talk about a real plan you have for this year -- something you're actually going to do.",
        "Is there somewhere you're planning to visit soon?",
        "Have you ever thought about joining a club or team you haven't tried yet?",
        "Ask a partner: 'What's one thing you're planning to start doing differently?'",
        "Do you prefer planning things far in advance, or deciding at the last minute?"],
    2: ["Make a prediction about something that will probably happen this week.",
        "What do you believe the future of technology will look like in ten years?",
        "Is there something you might try, but you're not sure yet?",
        "Ask someone: 'What do you definitely think will happen by the end of this year?'",
        "Do you trust your own predictions, or are you usually wrong?"],
    3: ["Talk about your actual, real plans for this weekend.",
        "Have you ever hosted something -- a party, a study group, anything at all?",
        "Is there an event you're attending soon that you're excited about?",
        "Ask a partner: 'What time are you usually leaving the house on weekends?'",
        "Do you prefer weekends with fixed plans, or completely open ones?"],
    4: ["Talk about a time something unexpected happened while you were doing something else.",
        "Has anyone ever interrupted you at exactly the wrong moment? What happened?",
        "What's something you noticed recently that most people probably missed?",
        "Ask someone: 'What's the most annoying time it's ever started raining on you?'",
        "Do you get frustrated when your plans get interrupted, or do you just go with it?"],
    5: ["Talk about a responsibility you have that you actually don't mind.",
        "Is there a rule at home or school you think should be optional instead of required?",
        "What's something you have to do every day that you wish you didn't?",
        "Ask a partner: 'What's one responsibility you're actually proud of having?'",
        "Do you think teenagers should have more responsibilities, or fewer?"],
    6: ["Talk about something you do carefully, and something you tend to rush.",
        "Are you a patient person, or do you get frustrated easily?",
        "Is there a task that comes really easily to you but is hard for other people?",
        "Ask someone: 'Do you work better quietly alone, or with some noise around you?'",
        "Does how you do something matter as much as actually getting it done?"],
    7: ["Compare two subjects you're studying -- which is more interesting, and why?",
        "What's the most exciting thing that could realistically happen to you this year?",
        "Is the most popular choice always the best one? Discuss.",
        "Ask a partner: 'What's the most comfortable place in your house?'",
        "Would you rather have something more expensive but better, or cheaper but okay?"],
    8: ["Talk about your ideal weekend, from start to finish.",
        "Have you ever volunteered for something? Would you like to?",
        "Do you prefer sleeping in, or getting up early even on weekends?",
        "Ask someone: 'Is there somewhere nearby you'd like to explore but haven't yet?'",
        "What does 'catching up' with a friend actually look like for you?"],
    9: ["Predict one thing about your own future that you're fairly confident about.",
        "Do you think you'll travel a lot in your life, or stay closer to home?",
        "What's something about the world you think will change a lot in your lifetime?",
        "Ask a partner: 'What do you think you'll achieve in the next five years?'",
        "Do you believe people can really invent something new, or has it all been done?"],
    10: ["Talk about the chores you're responsible for at home.",
         "Do you think your curfew or house rules are fair? Why or why not?",
         "What's something you're allowed to do now that you weren't a few years ago?",
         "Ask someone: 'What does being independent actually mean to you?'",
         "Is trust something you have to earn, or something you're given automatically?"],
    11: ["Talk about someone you know who always speaks really confidently.",
         "Is it more important to be honest, or to be kind, when giving your opinion?",
         "Do you get nervous speaking in front of the class? How do you deal with it?",
         "Ask a partner: 'Do you think you speak more politely to teachers or to friends?'",
         "Can you always tell when someone is being honest with you?"],
    12: ["Compare two options for something you use every day -- which is more convenient?",
         "What's the most useful thing you own, and why?",
         "Is it worth paying more for something more reliable? Discuss.",
         "Ask someone: 'What's a reasonable price for something you'd love to buy?'",
         "Do you usually pick the most convenient option, or the best one, even if it's harder?"],
    13: ["Talk about a time you were doing two things at once and it went badly.",
         "Do you think multitasking actually works, or does it just feel like it does?",
         "What's the hardest thing for you to focus on?",
         "Ask a partner: 'What were you doing the last time someone had to repeat themselves to you?'",
         "Is it possible to really focus with your phone nearby?"],
    14: ["Talk about one real goal you have for next year.",
         "What's something about yourself you'd like to improve?",
         "Do you usually keep your resolutions, or forget about them after a few weeks?",
         "Ask someone: 'What do you hope will be different about your life next year?'",
         "Is it better to set one big goal, or a few smaller ones?"],
    15: ["Share an opinion, and see if a partner can convince you to change it.",
         "Is there a topic where you can honestly see both points of view?",
         "What makes an argument actually convincing to you -- evidence, emotion, or something else?",
         "Ask someone: 'What's a fair point someone made that changed how you think?'",
         "Is it okay to agree partly with someone, or do you have to fully agree or disagree?"],
    16: ["Talk about how you usually prepare for something important, like a test or event.",
         "Do you feel more ready after practicing a lot, or does over-preparing stress you out?",
         "Is rest actually part of getting ready, in your opinion?",
         "Ask a partner: 'What's the last big thing you had to prepare for?'",
         "Do you organize everything ahead of time, or handle things as they come?"],
    17: ["Talk about something you do very efficiently, without wasting time.",
         "Is there a task you always do neatly, and one you're careless about?",
         "Do you think doing something correctly matters more than doing it quickly?",
         "Ask someone: 'What's something you had to learn to do more safely over time?'",
         "What does a day that goes 'smoothly' actually look like for you?"],
    18: ["Talk about a tradition from your own culture and what it means to you.",
         "What's the most colorful or interesting festival you've ever seen or heard about?",
         "Is your lifestyle similar to or different from your parents' at your age?",
         "Ask a partner: 'What's the most traditional thing your family still does?'",
         "Do you think cultures around the world are becoming more similar over time?"],
    19: ["Talk about the most memorable field trip or school event you've been on.",
         "Has something unexpected ever happened on a trip? How did you handle it?",
         "What's a lesson you learned the hard way?",
         "Ask someone: 'What's a trip you're excited about that hasn't happened yet?'",
         "Do unexpected moments usually make an experience better, or worse?"],
    20: ["Looking back at this whole level, what's the most memorable thing you learned?",
         "Predict: what do you think your English will sound like a year from now?",
         "Talk about one goal you have for your English going forward.",
         "Ask a partner: 'What's the most exciting plan you have for the future?'",
         "What do you want to achieve next, now that you've finished this level?"],
}

DIALOGUES = {
  1: [("What are you going to do this weekend?", "ماذا ستفعل في نهاية الأسبوع؟"),
      ("I'm going to visit my cousins.", "سأزور أبناء عمي."),
      ("I'm going to join a new club!", "سأنضم إلى نادٍ جديد!"),
      ("That sounds exciting!", "يبدو ذلك مثيرا!")],
  2: [("What do you think will happen tomorrow?", "ما رأيك سيحدث غدا؟"),
      ("I predict it will rain.", "أتوقع أنها ستمطر."),
      ("Maybe, but I believe it will be sunny.", "ربما، لكنني أعتقد أنها ستكون مشمسة."),
      ("We'll definitely find out!", "سنكتشف ذلك بالتأكيد!")],
  3: [("What are you doing this weekend?", "ماذا تفعل في نهاية هذا الأسبوع؟"),
      ("I'm meeting my friend on Friday.", "سأقابل صديقي يوم الجمعة."),
      ("We're traveling next week too!", "سنسافر الأسبوع القادم أيضا!"),
      ("Have a great trip!", "أتمنى لك رحلة رائعة!")],
  4: [("My phone rang while I was studying.", "رن هاتفي بينما كنت أدرس."),
      ("I noticed him while I was walking.", "لاحظته بينما كنت أمشي."),
      ("It started raining while we were outside!", "بدأ المطر بينما كنا في الخارج!"),
      ("What bad timing!", "يا له من توقيت سيئ!")],
  5: [("I have to finish my homework.", "يجب أن أنهي واجبي."),
      ("You don't have to come if you're busy.", "لا يجب أن تأتي إذا كنت مشغولا."),
      ("It's my responsibility to help at home.", "إنها مسؤوليتي أن أساعد في المنزل."),
      ("That's very responsible of you!", "هذا مسؤول جدا منك!")],
  6: [("She finished the test quickly.", "أنهت الاختبار بسرعة."),
      ("He carefully carried the box.", "حمل الصندوق بحذر."),
      ("They walked in quietly.", "دخلوا بهدوء."),
      ("The teacher waited patiently.", "انتظر المعلم بصبر.")],
  7: [("This book is more interesting than that one.", "هذا الكتاب أكثر إثارة من ذاك."),
      ("Math is more difficult than art for me.", "الرياضيات أصعب من الفن بالنسبة لي."),
      ("She's the most popular student!", "إنها الطالبة الأكثر شهرة!"),
      ("That was the most exciting game ever.", "كانت تلك أكثر مباراة إثارة على الإطلاق.")],
  8: [("What are your weekend plans?", "ما هي خططك لنهاية الأسبوع؟"),
      ("We're going to hang out at the mall.", "سنقضي وقتا في المول."),
      ("I'm going to sleep in on Saturday!", "سأنام متأخرا يوم السبت!"),
      ("Sounds relaxing!", "يبدو مريحا!")],
  9: [("Do you think he will succeed?", "هل تعتقد أنه سينجح؟"),
      ("I believe she will achieve her goals.", "أعتقد أنها ستحقق أهدافها."),
      ("We will graduate next year!", "سنتخرج العام القادم!"),
      ("Things will change a lot after that.", "ستتغير الأمور كثيرا بعد ذلك.")],
  10: [("I have to do my chores.", "يجب أن أقوم بأعمالي المنزلية."),
       ("I have to be home by curfew.", "يجب أن أكون في المنزل بحلول موعد العودة."),
       ("I'm allowed to go out on weekends though.", "لكن يُسمح لي بالخروج في العطلات."),
       ("My parents trust me a lot.", "والداي يثقان بي كثيرا.")],
  11: [("She explained it clearly.", "شرحته بوضوح."),
       ("He answered politely.", "أجاب بأدب."),
       ("Tell me honestly what you think.", "أخبرني بصدق برأيك."),
       ("He presented confidently!", "قدم العرض بثقة!")],
  12: [("Which phone is better?", "أي هاتف أفضل؟"),
       ("This one is the most reliable option.", "هذا هو الخيار الأكثر موثوقية."),
       ("But that one is more reasonable in price.", "لكن ذاك أكثر معقولية في السعر."),
       ("I think it's worth it either way.", "أعتقد أنه يستحق الأمر على أي حال.")],
  13: [("I was cooking while listening to music.", "كنت أطبخ بينما كنت أستمع للموسيقى."),
       ("She was chatting while doing homework.", "كانت تتحدث بينما كانت تقوم بالواجب."),
       ("He was driving while talking on the phone!", "كان يقود بينما كان يتحدث على الهاتف!"),
       ("That's not very safe!", "هذا ليس آمنا جدا!")],
  14: [("What's your goal for next year?", "ما هدفك للعام القادم؟"),
       ("I'm going to challenge myself more.", "سأتحدى نفسي أكثر."),
       ("I will improve my grades too.", "سأحسن درجاتي أيضا."),
       ("I hope things will go well for both of us!", "أتمنى أن تسير الأمور بشكل جيد لكلينا!")],
  15: [("I would argue that this is better.", "أزعم أن هذا أفضل."),
       ("That's an interesting point of view.", "هذه وجهة نظر مثيرة للاهتمام."),
       ("Can you convince me with evidence?", "هل يمكنك إقناعي بدليل؟"),
       ("That's a fair point, actually.", "هذه نقطة عادلة في الواقع.")],
  16: [("I'm going to prepare for the exam.", "سأستعد للاختبار."),
       ("We're going to practice every day.", "سنتمرن كل يوم."),
       ("I'm going to review the whole unit.", "سأراجع الوحدة كاملة."),
       ("I'll be ready by Monday!", "سأكون جاهزا بحلول يوم الاثنين!")],
  17: [("Do it properly the first time.", "افعلها بشكل صحيح من المرة الأولى."),
       ("Cross the street safely.", "اعبر الشارع بأمان."),
       ("Write your name neatly.", "اكتب اسمك بترتيب."),
       ("She works efficiently, doesn't she?", "إنها تعمل بكفاءة، أليس كذلك؟")],
  18: [("This tradition is more common here.", "هذا التقليد أكثر شيوعا هنا."),
       ("That custom is more unusual to me.", "تلك العادة أكثر غرابة بالنسبة لي."),
       ("That festival is the most colorful I've seen!", "هذا المهرجان هو الأكثر ألوانا رأيته!"),
       ("Our cultures are similar in some ways.", "ثقافاتنا متشابهة في بعض النواحي.")],
  19: [("We're going on a field trip next week!", "سنذهب في رحلة ميدانية الأسبوع القادم!"),
       ("Everyone was so excited.", "كان الجميع متحمسا جدا."),
       ("Something unexpected happened, but the teacher handled it calmly.", "حدث شيء غير متوقع، لكن المعلم تعامل معه بهدوء."),
       ("It was a memorable trip in the end!", "كانت رحلة لا تُنسى في النهاية!")],
  20: [("What's your future plan?", "ما خطتك المستقبلية؟"),
       ("I'm going to achieve my goals step by step.", "سأحقق أهدافي خطوة بخطوة."),
       ("It was a memorable year with a lot of challenges.", "كان عاما لا يُنسى مليئا بالتحديات."),
       ("I believe next year will be even better!", "أعتقد أن العام القادم سيكون أفضل!")],
}

def make_notice_sentences(lesson_num, grammar_topic):
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
    discussion = DISCUSSIONS.get(num)
    notice_sentences = make_notice_sentences(num, grammar_topic)
    notice_note = grammar_topic["title"] if grammar_topic else ""

    slides = build_deck_v2(num, lesson, grammar_topic, dialogue, hook, notice_sentences,
                            notice_note, challenge, real_life, theme_key=theme_key, level=LEVEL,
                            discussion=discussion)
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
