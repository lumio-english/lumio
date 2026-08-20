# -*- coding: utf-8 -*-
import sys, json, glob, os
sys.path.insert(0, "lib")
from deck_template_teen2 import build_deck_v2
from grammar_slides import match_grammar_by_lesson_focus

LEVEL = "level5"
_lessons = {}
for f in sorted(glob.glob(f"lessons/{LEVEL}/lesson*.json")):
    d = json.load(open(f, encoding="utf-8"))
    _lessons[d["number"]] = d
GRAMMAR_UNITS = match_grammar_by_lesson_focus(LEVEL, _lessons)

THEME_BY_LESSON = {
    1: "social", 2: "sport", 3: "school", 4: "social", 5: "game",
    6: "default", 7: "default", 8: "school", 9: "social", 10: "room",
    11: "school", 12: "sport", 13: "room", 14: "game", 15: "default",
    16: "game", 17: "social", 18: "game", 19: "school", 20: "default",
}

HOOKS = {
    1: "Think about last weekend. What's the first thing you did?",
    2: "What's the most surprising thing that happened to you recently?",
    3: "Think of a question you'd love to ask a friend about their week.",
    4: "Describe a place using only how it felt to be there.",
    5: "Was there ever a huge crowd or line somewhere you went? What was it for?",
    6: "How far back can you remember something happening? A year? A day?",
    7: "Think about the last time you told someone a story. What came first?",
    8: "Have you ever had to explain why you were late for something?",
    9: "Think of a time you felt really proud. What led up to it?",
    10: "What's something you were doing right when something unexpected happened?",
    11: "What's your go-to way to prep for a test?",
    12: "If you could retell one trip you took, which one would it be?",
    13: "Think of a small mistake that turned into a funny story later.",
    14: "What's the best party or event you've been to?",
    15: "Is there a day you'll never forget? What made it special?",
    16: "Have you ever done two things at once, like texting while walking?",
    17: "What's a question you'd want to ask a classmate about their life?",
    18: "What's the last movie or show you watched with friends?",
    19: "Have you ever lost something important? How did it feel?",
    20: "Looking back, what's one story from this year you'd want to remember?",
}
CHALLENGES = {
    1: {"prompt": "Describe your last weekend in 3 sentences using regular past verbs.", "hint": "Remember the -ed ending!"},
    2: {"prompt": "Describe yesterday using 3 irregular past verbs.", "hint": "Went, saw, ate, had, took, got -- no -ed here!"},
    3: {"prompt": "Ask a partner 3 yes/no questions about their week using 'Did'.", "hint": "Did you...? / I didn't..."},
    4: {"prompt": "Describe how 3 things were using was/were.", "hint": "Watch singular vs plural!"},
    5: {"prompt": "Describe a past place using 'there was/were' 3 times.", "hint": "Singular = was, plural = were."},
    6: {"prompt": "Say 3 sentences about your week using different time expressions.", "hint": "Yesterday, last week, two days ago..."},
    7: {"prompt": "Tell a 4-step story using first/then/next/finally.", "hint": "Keep the order clear!"},
    8: {"prompt": "Give 3 reasons for things using 'because'.", "hint": "I was late because..."},
    9: {"prompt": "Describe how you felt about 3 different past events.", "hint": "I was proud/nervous/relieved..."},
    10: {"prompt": "Describe what you were doing at 3 different times yesterday.", "hint": "I was studying/sleeping/eating..."},
    11: {"prompt": "Describe your last study session in 3 sentences.", "hint": "Use today's vocabulary words."},
    12: {"prompt": "Describe a trip you took in 4 sentences, in order.", "hint": "Packed, flew, explored, returned..."},
    13: {"prompt": "Describe something that went wrong and why, using 'because'.", "hint": "Use a past verb + because."},
    14: {"prompt": "Describe a party you went to in 3 sentences using 'there was/were'.", "hint": "Use today's vocabulary words."},
    15: {"prompt": "Tell the story of a memorable day in 4 steps.", "hint": "Woke up, got ready, left, celebrated..."},
    16: {"prompt": "Describe 2 things happening at once in the past.", "hint": "I was ___ while I was ___."},
    17: {"prompt": "Interview a partner with 3 past-tense questions.", "hint": "What was your favorite memory? Did you...?"},
    18: {"prompt": "Retell the story of the lost backpack in your own words.", "hint": "Use at least 2 vocabulary words from the story."},
    19: {"prompt": "Tell a partner about a mixed past evening (mix Past Simple and Past Continuous).", "hint": "We chose... while he was..."},
    20: {"prompt": "Tell your own true story from this year using at least 4 different grammar points from this level.", "hint": "Try to use words from at least 3 different lessons."},
}
REAL_LIFE = {
    1: "This week, tell a family member 3 things you did using regular past verbs.",
    2: "Tonight, describe your day using at least 2 irregular past verbs.",
    3: "Ask a friend 'Did you...?' about something this week.",
    4: "Describe how your day was using was/were, out loud.",
    5: "Next time you're somewhere busy, describe it with 'there was/were'.",
    6: "This week, use a time expression when telling someone about your day.",
    7: "Tell someone about your morning using first/then/next/finally.",
    8: "Next time something happens, explain why using 'because'.",
    9: "Tell someone how you felt about something that happened this week.",
    10: "Describe what you were doing at this time yesterday.",
    11: "Try a new study technique from today's lesson this week.",
    12: "Think about a real trip you took and describe it in English.",
    13: "Next time something goes wrong, explain it in English using 'because'.",
    14: "Describe your favorite party ever, in English, to a friend.",
    15: "Write down one memorable day from your life in English.",
    16: "Describe two things you did at the same time today.",
    17: "This week, interview a family member about their past.",
    18: "Think about a time you lost something -- describe what happened.",
    19: "Describe a mixed evening from your week using both past tenses.",
    20: "Write your own short 'story of the year' in English.",
}
DISCUSSIONS = {
    1: ["Talk about what you actually did last weekend, in as much detail as you can.",
        "Did you do anything last weekend that you're genuinely proud of?",
        "Do you usually spend weekends relaxing, or staying busy?",
        "Ask a partner: 'What's the last thing you cooked, or helped cook?'",
        "Was there anything you wanted to do last weekend but didn't get to?"],
    2: ["Talk about the most interesting thing that happened to you yesterday.",
        "Where did you go yesterday -- somewhere new, or somewhere familiar?",
        "What's the best thing you ate yesterday?",
        "Ask someone: 'Did you take any photos yesterday? Of what?'",
        "Was yesterday a completely normal day, or did something unusual happen?"],
    3: ["Talk about something you forgot to do recently.",
        "Have you ever missed something important because you were running late?",
        "Do you usually finish your tasks early, or right before the deadline?",
        "Ask a partner: 'Did you check your phone the moment you woke up today?'",
        "Is forgetting something once in a while normal, or a sign to get more organized?"],
    4: ["Talk about an event you went to that was way more crowded than you expected.",
        "Describe the most amazing experience you've had this year.",
        "Was there ever a class or activity you found really difficult at first?",
        "Ask someone: 'What's something that turned out way more boring than you thought?'",
        "Do you prefer quiet, calm days, or exciting, busy ones?"],
    5: ["Talk about a time you had to wait in a really long line. How did you feel?",
        "Have you ever won a prize, or surprised someone with one?",
        "What's the worst traffic or crowd situation you've ever been in?",
        "Ask a partner: 'What's a problem you solved recently, even a small one?'",
        "Do surprises usually make you happy, or do you prefer knowing what's coming?"],
    6: ["Talk about something memorable that happened last summer.",
        "What did you do last night before going to sleep?",
        "Thinking back to a while ago, what's changed the most about you since then?",
        "Ask someone: 'What's something you did two days ago that you'd already forgotten?'",
        "Do you think about the past a lot, or mostly focus on what's next?"],
    7: ["Tell a partner about your morning routine, step by step, in order.",
        "Talk about a project or task where the ending was totally different from how it started.",
        "Do you like planning things step by step, or figuring it out as you go?",
        "Ask someone: 'What's the last story you told a friend, start to finish?'",
        "Is it more satisfying to finish something long, or to start something brand new?"],
    8: ["Talk about a decision you made recently and explain your actual reason for it.",
        "Have you ever had to explain yourself when you didn't really have a good reason?",
        "Do you think it's better to give an honest excuse, or no excuse at all?",
        "Ask a partner: 'Why did you choose to study English?'",
        "Since starting this level, what's changed about how you see learning a language?"],
    9: ["Talk about a time you felt truly proud of yourself.",
        "Has anything disappointed you recently? How did you deal with it?",
        "What's something you're genuinely grateful for right now?",
        "Ask someone: 'What's the most surprised you've ever been?'",
        "Is it easy for you to talk about your feelings, or do you keep them private?"],
    10: ["Talk about what you were doing at this exact time yesterday.",
         "Think of a moment when something unexpected happened while you were doing something else.",
         "What were you doing the last time it rained where you live?",
         "Ask a partner: 'What were you doing right before class today?'",
         "Do you remember what you were doing exactly one year ago today? Try to guess!"],
    11: ["Talk about a subject or skill you really struggled with at first.",
         "What's something you've clearly improved at over time?",
         "Do you prefer reviewing what you already know, or learning something totally new?",
         "Ask someone: 'What's your proudest 'I finally got it!' moment?'",
         "Is struggling with something actually a good sign that you're learning?"],
    12: ["Talk about the best trip you've ever taken.",
         "Do you like exploring new places on your own, or with other people?",
         "What's the hardest part of packing for a trip, for you?",
         "Ask a partner: 'If you could fly anywhere tomorrow, where would you go?'",
         "Is coming home after a trip exciting, or does it feel a little sad?"],
    13: ["Talk about a mistake you made recently and how you fixed it.",
         "Have you ever broken or lost something important? What happened?",
         "Do you get stressed when you're running late, or do you stay calm?",
         "Ask someone: 'What's the funniest small disaster you've had recently?'",
         "Is it more important to avoid mistakes, or to know how to fix them?"],
    14: ["Talk about the best party you've ever been to.",
         "What matters more to you at a party -- the music, the food, or the people?",
         "Do you prefer planning a party, or just showing up to one?",
         "Ask a partner: 'What's the best gift you've ever given or received?'",
         "Would you rather have one big party with everyone, or a small one with close friends?"],
    15: ["Talk about a day in your life that was truly unforgettable.",
         "What's a small moment you still remember clearly, even though it wasn't a big event?",
         "Do you usually celebrate your achievements, or just move on to the next thing?",
         "Ask someone: 'What's the earliest memory you can remember?'",
         "What would make tomorrow an unforgettable day for you?"],
    16: ["Talk about something funny that happened while you were doing something else.",
         "What do you usually do while you're listening to music?",
         "Has anyone ever caught you laughing at something during a quiet moment?",
         "Ask a partner: 'What were you thinking about right before this class started?'",
         "Do you find it easy to focus on one thing, or do you always do two at once?"],
    17: ["Interview a partner: ask about their favorite memory from this year.",
         "Talk about a challenge you overcame that you're proud of.",
         "What's the most interesting story you've heard from a friend recently?",
         "Ask someone: 'What's been your biggest achievement so far this year?'",
         "If your life were a story, what would this chapter be called?"],
    18: ["Talk about the last movie you watched, and whether you'd recommend it.",
         "Have you ever fallen asleep during a movie? What were you watching?",
         "Do you usually pick the movie with friends, or does someone else choose?",
         "Ask a partner: 'What's a movie you've shared with a lot of people?'",
         "Is it distracting when someone's texting during a movie? How do you feel about it?"],
    19: ["Talk about a time you lost something and eventually found it.",
         "How do you usually feel when you can't find something important -- worried, or calm?",
         "Are you careful with your belongings, or do you lose things often?",
         "Ask someone: 'What's the most relieved you've ever felt?'",
         "What's your actual strategy for finding something you've lost?"],
    20: ["Looking back at this whole level, what's one story from your own life you can now tell in English?",
         "What's something you're proud of being able to say now that you couldn't before?",
         "Talk about the most unforgettable lesson from this level, and why.",
         "Ask a partner: 'If you told your own story of this level, how would it start?'",
         "What's one story you still want to be able to tell in English?"],
}

DIALOGUES = {
  1: [("What did you do this weekend?", "ماذا فعلت في نهاية الأسبوع؟"),
      ("I played football and watched a movie.", "لعبت كرة القدم وشاهدت فيلما."),
      ("Nice! I cleaned my room and cooked dinner.", "رائع! نظفت غرفتي وطبخت العشاء."),
      ("Sounds like a good weekend!", "يبدو أنها كانت نهاية أسبوع جيدة!")],
  2: [("I went to the mall yesterday.", "ذهبت إلى المول أمس."),
      ("What did you get?", "ماذا اشتريت؟"),
      ("I got a new phone! We also saw a great show.", "حصلت على هاتف جديد! شاهدنا أيضا عرضا رائعا."),
      ("That sounds like a great day!", "يبدو يوما رائعا!")],
  3: [("Did you finish your homework?", "هل أنهيت واجبك؟"),
      ("Yes, I did. Did you call your grandma?", "نعم فعلت. هل اتصلت بجدتك؟"),
      ("I didn't forget, don't worry!", "لم أنسَ، لا تقلق!"),
      ("Did she answer?", "هل أجابت؟")],
  4: [("How was the concert?", "كيف كان الحفل؟"),
      ("It was amazing! But the mall was crowded before.", "كان مذهلا! لكن المول كان مزدحما قبل ذلك."),
      ("Was the test difficult?", "هل كان الاختبار صعبا؟"),
      ("A little, but the classroom was quiet.", "قليلا، لكن الصف كان هادئا.")],
  5: [("There was a huge crowd at the game!", "كان هناك حشد كبير في المباراة!"),
      ("Was there a long line too?", "هل كان هناك طابور طويل أيضا؟"),
      ("Yes, but there was a big prize for the winner!", "نعم، لكن كانت هناك جائزة كبيرة للفائز!"),
      ("There were a few problems, but it was fun.", "كانت هناك بعض المشاكل، لكنه كان ممتعا.")],
  6: [("I saw him yesterday.", "رأيته أمس."),
      ("We traveled last week too.", "سافرنا الأسبوع الماضي أيضا."),
      ("She called me two days ago.", "اتصلت بي قبل يومين."),
      ("We went to the beach last summer!", "ذهبنا إلى الشاطئ الصيف الماضي!")],
  7: [("First, we packed our bags.", "أولا، حزمنا حقائبنا."),
      ("Then, we drove to the airport.", "ثم قدنا إلى المطار."),
      ("Next, we checked in and boarded the plane.", "بعد ذلك، سجلنا الدخول وصعدنا الطائرة."),
      ("Finally, we arrived! It was a great trip.", "أخيرا، وصلنا! كانت رحلة رائعة.")],
  8: [("Why were you late?", "لماذا تأخرت؟"),
      ("I was late because I missed the bus.", "تأخرت لأنني فوت الحافلة."),
      ("It was raining, so we stayed home.", "كانت تمطر، لذلك بقينا في المنزل."),
      ("That makes sense!", "هذا منطقي!")],
  9: [("I was so proud of my grade!", "كنت فخورا جدا بدرجتي!"),
      ("I was nervous before the test.", "كنت متوترا قبل الاختبار."),
      ("We were relieved when it was over.", "كنا مرتاحين عندما انتهى."),
      ("I was surprised by the results too!", "كنت متفاجئا بالنتائج أيضا!")],
  10: [("What were you doing at 8pm?", "ماذا كنت تفعل الساعة الثامنة مساء؟"),
       ("I was studying when you called.", "كنت أدرس عندما اتصلت."),
       ("It was raining all morning.", "كانت تمطر طوال الصباح."),
       ("We were waiting for the bus.", "كنا ننتظر الحافلة.")],
  11: [("How was your study session?", "كيف كانت جلسة دراستك؟"),
       ("I reviewed my notes and memorized the vocabulary.", "راجعت ملاحظاتي وحفظت المفردات."),
       ("Did you pass the test?", "هل نجحت في الاختبار؟"),
       ("Yes! My grades improved a lot.", "نعم! تحسنت درجاتي كثيرا.")],
  12: [("Tell me about your trip!", "أخبرني عن رحلتك!"),
       ("I packed my bag and flew to a new city.", "حزمت حقيبتي وطرت إلى مدينة جديدة."),
       ("We explored the old town and stayed with my aunt.", "استكشفنا البلدة القديمة وأقمنا مع خالتي."),
       ("We returned home on Sunday. It was great!", "عدنا إلى المنزل يوم الأحد. كانت رائعة!")],
  13: [("What happened to your phone?", "ماذا حدث لهاتفك؟"),
       ("I broke it because I dropped it.", "كسرته لأنني أوقعته."),
       ("I lost my keys because I was in a hurry once.", "فقدت مفاتيحي لأنني كنت مستعجلا مرة."),
       ("At least you fixed it!", "على الأقل أصلحته!")],
  14: [("How was the party?", "كيف كانت الحفلة؟"),
       ("There were a lot of guests and great music!", "كان هناك الكثير من الضيوف وموسيقى رائعة!"),
       ("Was there cake?", "هل كانت هناك كعكة؟"),
       ("Yes, a huge one, and fun games too!", "نعم، كعكة كبيرة، وألعاب ممتعة أيضا!")],
  15: [("Tell me about a day you'll never forget.", "أخبرني عن يوم لن تنساه."),
       ("First, I woke up early and got ready fast.", "أولا، استيقظت باكرا واستعديت بسرعة."),
       ("Then we left the house and celebrated together.", "ثم غادرنا المنزل واحتفلنا معا."),
       ("It was an unforgettable day!", "كان يوما لا يُنسى!")],
  16: [("What were you doing while I called?", "ماذا كنت تفعل عندما اتصلت؟"),
       ("I was texting while I was walking!", "كنت أراسل بينما كنت أمشي!"),
       ("She was listening to music while studying.", "كانت تستمع للموسيقى أثناء الدراسة."),
       ("We were watching TV while eating.", "كنا نشاهد التلفاز أثناء الأكل.")],
  17: [("Tell me about your favorite memory.", "أخبرني عن ذكراك المفضلة."),
       ("It was an adventure with my family.", "كانت مغامرة مع عائلتي."),
       ("What was your biggest achievement?", "ما كان أكبر إنجاز لك؟"),
       ("Passing that hard test was my achievement!", "اجتياز ذلك الاختبار الصعب كان إنجازي!")],
  18: [("I lost my backpack at school!", "فقدت حقيبتي في المدرسة!"),
       ("We searched everywhere for it.", "بحثنا عنها في كل مكان."),
       ("I was worried, but finally we found it!", "كنت قلقا، لكن أخيرا وجدناها!"),
       ("I felt so relieved!", "شعرت بارتياح كبير!")],
  19: [("What did you do last night?", "ماذا فعلت الليلة الماضية؟"),
       ("We chose a movie and shared popcorn.", "اخترنا فيلما وشاركنا الفشار."),
       ("He was texting while the movie played!", "كان يراسل بينما كان الفيلم يعرض!"),
       ("She fell asleep before the end!", "غفت قبل النهاية!")],
  20: [("What's your story from this year?", "ما هي قصتك من هذا العام؟"),
       ("I was proud of an unforgettable trip I took.", "كنت فخورا برحلة لا تُنسى قمت بها."),
       ("There were challenges, but I achieved my goals.", "كانت هناك تحديات، لكنني حققت أهدافي."),
       ("That's a great story!", "هذه قصة رائعة!")],
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
