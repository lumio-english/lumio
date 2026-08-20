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
DISCUSSIONS = {
    1: ["Talk about your own crew -- who's in it, and how did you all become friends?",
        "Do you prefer hanging out in person or chatting online? Why?",
        "What's the funniest joke someone in your group has ever told?",
        "Ask a classmate: 'How many times a day do you text your friends?'",
        "Can a crew be just one or two close friends, or do you need a bigger group?"],
    2: ["Talk about someone you know who's always busy -- what does their day actually look like?",
        "Do you think practicing something every single day is the real secret to getting good at it?",
        "What do you watch or listen to the most in your free time?",
        "Ask a partner: 'What does your best friend do every weekend?'",
        "Is there ever a difference between what you say you do and what you actually do?"],
    3: ["Talk about something everyone else seems to love that just isn't your thing.",
        "What's something people call 'cool' that you secretly think is a little weird?",
        "Is there a show, game, or trend you find really annoying? Why?",
        "Ask someone: 'What's the most awesome thing that happened to you this week?'",
        "Do you think what's considered 'cool' changes as you get older?"],
    4: ["Describe your room -- what's the one item in it that says the most about who you are?",
        "If you could add one thing to your room right now, what would it be?",
        "Is your room usually messy or organized? Why do you think that is?",
        "Ask a partner: 'What's on the walls of your room?'",
        "Do you think a person's room reflects their personality? Discuss."],
    5: ["Talk about your personal style -- is there one item you always wear?",
        "This or that: sneakers or sandals? Hoodie or jacket? Explain your pick.",
        "Do you think what people wear says something about who they are?",
        "Ask someone: 'What's your favorite piece of clothing, and why?'",
        "Would you rather own one really nice item or five cheaper ones?"],
    6: ["Talk about the different groups of people in your life -- teammates, classmates, family.",
        "Which matters more to you: a few close friends or a lot of followers online?",
        "Do you get along better with your siblings and cousins, or with your classmates?",
        "Ask a partner: 'Who are you closest to -- a neighbor, a cousin, or a classmate?'",
        "What does 'having each other's back' actually look like in real life?"],
    7: ["Talk about how much time you spend on your phone every day -- is it too much?",
        "What's one app you honestly couldn't live without?",
        "Do you think it's okay to share your password with a close friend?",
        "Ask someone: 'What's the most annoying thing about a dying phone battery?'",
        "Would you rather lose your phone for a whole day, or lose your favorite app forever?"],
    8: ["Describe your school to someone who's never seen it.",
        "What's your favorite place in your school, and why?",
        "Is the cafeteria or the library a better place to spend free time? Discuss.",
        "Ask a partner: 'Can you draw our school's layout from memory?'",
        "If you could change one thing about your school, what would it be?"],
    9: ["Talk about a skill you're proud of, and how you learned it.",
        "Is there a skill you wish you had right now? What is it?",
        "Do you think talent matters more than practice, or the other way around?",
        "Ask someone: 'Can you do something that would actually surprise me?'",
        "Is there a skill you gave up on? Would you ever go back to it?"],
    10: ["Talk about a mystery or secret you once figured out.",
         "Are you good at guessing games? What makes someone good at them?",
         "Do you like keeping secrets, or do you always want to tell someone?",
         "Ask a partner a riddle and see if they can guess it.",
         "What's more fun: knowing the answer right away, or figuring it out slowly?"],
    11: ["Talk about the fastest or most competitive person you know.",
         "Do you enjoy competing against other people, or do you prefer just having fun?",
         "Have you ever broken a personal record at something? What was it?",
         "Ask someone: 'Who would win a race between you and your best friend?'",
         "Is winning always the most important part of a competition? Discuss."],
    12: ["Talk about a time you were the new person somewhere. How did it feel?",
         "What's the best way to welcome someone who doesn't know anyone yet?",
         "Do you find it easy or hard to talk to strangers?",
         "Ask a partner: 'If a new student joined our class tomorrow, what would you say to them?'",
         "Why do you think some people find it harder than others to make new friends?"],
    13: ["Talk about a classroom rule you think is actually a really good idea.",
         "Is there a rule at school you think should be different? Why?",
         "Do you find it easy to pay attention in class, or does your mind wander?",
         "Ask someone: 'What happens at your house if you don't follow the rules?'",
         "Do you think rules are more about respect, or about control?"],
    14: ["Talk about what you're usually doing at this exact time on a normal day.",
         "Right now, in this moment, what would you rather be doing?",
         "Do you think you spend more time scrolling, or actually talking to people?",
         "Ask a partner: 'What are you doing later today?'",
         "Is 'chilling' actually relaxing, or does it sometimes feel like wasted time?"],
    15: ["Talk about your best way to study before a big test.",
         "Do you prefer studying alone or with a group? Why?",
         "What's the hardest part about giving a presentation in front of the class?",
         "Ask someone: 'What's your best memorization trick?'",
         "Has a group project ever gone badly for you? What happened?"],
    16: ["Talk about your favorite game and why you love it.",
         "Do you play better alone, or with a teammate?",
         "What's more satisfying: getting a high score, or actually winning as a team?",
         "Ask a partner: 'What's your best strategy when you're losing a game?'",
         "Do video games actually teach real skills, or are they just for fun? Discuss."],
    17: ["Talk about your favorite movie genre and why you like it.",
         "Do you prefer watching a trailer first, or going in with no idea what happens?",
         "Is a sequel ever actually better than the original movie?",
         "Ask someone: 'What movie could you watch again and again?'",
         "Would you rather watch a movie alone or with a big group?"],
    18: ["Share an opinion you have that not everyone agrees with.",
         "Talk about a time you had to make a hard choice. What did you decide?",
         "Is it okay to change your opinion after hearing someone else's reason?",
         "Ask a partner: 'Do you agree or disagree that homework should be optional? Why?'",
         "What's harder: deciding something for yourself, or convincing someone else?"],
    19: ["Talk about a match or competition you watched or played in that you'll never forget.",
         "Have you ever felt really nervous right before something important? What happened?",
         "Is teamwork more important than individual talent when it comes to winning?",
         "Ask someone: 'What's something you're really proud of?'",
         "How do you usually celebrate after a win?"],
    20: ["Looking back at this whole level, what's the one thing you're most proud of learning?",
         "If you made a time capsule about your English this year, what would you put in it?",
         "Talk about how your English has changed since you started this level.",
         "Ask a partner: 'What's your opinion -- which lesson in this level was the hardest?'",
         "What's one goal you have for your English for next year?"],
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
