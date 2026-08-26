# -*- coding: utf-8 -*-
import sys, json, glob, os
sys.path.insert(0, "lib")
from deck_template_teen2 import build_deck_v2, chunk_grammar_topics
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
  1: [("So what did you actually do this weekend? Anything interesting happen?", "إذاً ماذا فعلت فعلاً في عطلة نهاية الأسبوع؟ هل حدث شيء مثير؟"),
      ("Not really exciting, honestly. I played video games and watched a movie.", "ليس مثيراً حقاً، بصراحة. لعبت ألعاب فيديو وشاهدت فيلماً."),
      ("That sounds relaxing at least. I cleaned my whole room and cooked dinner.", "هذا يبدو مريحاً على الأقل. نظفت غرفتي بالكامل وطهيت العشاء."),
      ("Wow, productive weekend. Did anyone help you with all of that?", "واو، عطلة منتجة. هل ساعدك أحد في كل ذلك؟"),
      ("My little brother helped a little, mostly by getting in the way, but still.", "أخي الصغير ساعد قليلاً، معظم الوقت كان يعرقلني، لكن على أي حال."),
      ("That counts! We also walked to the park after, so it wasn't a total waste.", "هذا يُحسب! نحن أيضاً مشينا إلى الحديقة بعدها، فلم يكن هدراً كاملاً.")],
  2: [("Guess what happened to me yesterday, you're not going to believe it.", "خمن ماذا حدث لي أمس، لن تصدق."),
      ("Okay, tell me everything. Where did you even go?", "حسناً، أخبرني بكل شيء. إلى أين ذهبت أصلاً؟"),
      ("I went downtown and saw something I never expected to see there.", "ذهبت وسط المدينة ورأيت شيئاً لم أتوقع رؤيته هناك أبداً."),
      ("What was it? And please tell me you took a picture.", "ما هو؟ وأرجوك أخبرني أنك التقطت صورة."),
      ("I did! I also got a free sample and ate the weirdest snack ever.", "فعلت! وحصلت أيضاً على عينة مجانية وأكلت أغرب وجبة خفيفة على الإطلاق."),
      ("Honestly, your yesterday sounds way more interesting than mine.", "بصراحة، يومك أمس يبدو أكثر إثارة بكثير من يومي.")],
  3: [("Did you finish the assignment, or did you completely forget about it?", "هل أنهيت الواجب، أم نسيته تماماً؟"),
      ("I almost forgot, honestly, but I checked my planner last night just in time.", "كدت أنسى، بصراحة، لكنني تحققت من مفكرتي الليلة الماضية في الوقت المناسب."),
      ("Lucky. I missed the deadline last week because I forgot to check my email.", "محظوظ. فاتني الموعد النهائي الأسبوع الماضي لأنني نسيت التحقق من بريدي."),
      ("That's rough. Did you at least call the teacher to explain what happened?", "هذا صعب. هل اتصلت على الأقل بالمعلمة لتشرحي ما حدث؟"),
      ("I tried, but she didn't answer, so I just emailed an apology instead.", "حاولت، لكنها لم ترد، فأرسلت اعتذاراً عبر البريد الإلكتروني بدلاً من ذلك."),
      ("Smart move. Always have a backup plan when the first one doesn't work.", "خطوة ذكية. اجعل دائماً لديك خطة بديلة عندما لا تنجح الأولى.")],
  4: [("How was the concert last night? Was it as amazing as everyone said?", "كيف كان الحفل الليلة الماضية؟ هل كان مذهلاً كما قال الجميع؟"),
      ("Honestly, it was incredibly crowded, but the music itself was amazing.", "بصراحة، كان مزدحماً بشكل لا يصدق، لكن الموسيقى نفسها كانت مذهلة."),
      ("That sounds exciting. Was it difficult to actually see the stage though?", "هذا يبدو مثيراً. لكن هل كان من الصعب رؤية المسرح فعلاً؟"),
      ("A little, but not boring at all. Worth every uncomfortable moment, honestly.", "قليلاً، لكن لم يكن مملاً أبداً. يستحق كل لحظة غير مريحة، بصراحة."),
      ("I'm kind of jealous now. My weekend was way more quiet in comparison.", "أشعر بالغيرة الآن نوعاً ما. عطلتي كانت أكثر هدوءاً بكثير بالمقارنة."),
      ("Quiet isn't always bad though. Sometimes boring weekends are exactly what you need.", "الهدوء ليس سيئاً دائماً مع ذلك. أحياناً عطلات نهاية الأسبوع المملة هي بالضبط ما تحتاجه.")],
  5: [("Remember that huge crowd we got stuck in last year? What a nightmare.", "أتذكر ذلك الحشد الضخم الذي علقنا فيه العام الماضي؟ يا له من كابوس."),
      ("Don't remind me. The line alone took almost an hour, and then the traffic.", "لا تذكرني. الطابور وحده استغرق ساعة تقريباً، ثم الازدحام المروري."),
      ("At least we ended up winning that surprise prize at the end of it all.", "على الأقل انتهى بنا الأمر بالفوز بتلك الجائزة المفاجئة في نهاية كل ذلك."),
      ("True, that made the whole problem worth it, looking back now.", "صحيح، هذا جعل المشكلة بأكملها تستحق، بالنظر إليها الآن."),
      ("Honestly, it's a funny memory now, even though it wasn't funny back then.", "بصراحة، إنها ذكرى مضحكة الآن، رغم أنها لم تكن مضحكة وقتها."),
      ("That's usually how it works. Bad moments become good stories eventually.", "هكذا يعمل الأمر عادة. اللحظات السيئة تصبح قصصاً جيدة في النهاية.")],
  6: [("What's something interesting that happened to you a while ago that you still think about?", "ما هو شيء مثير حدث لك منذ فترة وما زلت تفكر فيه؟"),
      ("Honestly, something from last summer still randomly pops into my head sometimes.", "بصراحة، شيء من الصيف الماضي ما زال يخطر في بالي عشوائياً أحياناً."),
      ("Same, but for me it was something smaller, like just two days ago actually.", "نفس الشيء، لكن بالنسبة لي كان شيئاً أصغر، مثل قبل يومين فقط في الواقع."),
      ("Really? What happened two days ago that was so memorable?", "حقاً؟ ماذا حدث قبل يومين وكان لا يُنسى؟"),
      ("Nothing huge, just a really good conversation last night that stuck with me.", "لا شيء كبير، فقط محادثة جيدة جداً الليلة الماضية بقيت معي."),
      ("That's the thing about memories -- sometimes the small ones matter more than yesterday's.", "هذا ما يميز الذكريات -- أحياناً الصغيرة منها تهم أكثر من ذكريات الأمس.")],
  7: [("Can you tell me what actually happened at practice? Start from the beginning.", "هل يمكنك إخباري بما حدث فعلاً في التمرين؟ ابدأ من البداية."),
      ("Okay, so first we warmed up, then we ran through the whole routine twice.", "حسناً، أولاً قمنا بالإحماء، ثم راجعنا الروتين بأكمله مرتين."),
      ("What happened next? Did the coach say anything about the mistakes?", "ماذا حدث بعد ذلك؟ هل قال المدرب شيئاً عن الأخطاء؟"),
      ("After that, yeah, but honestly it was helpful feedback, not harsh at all.", "بعد ذلك، نعم، لكن بصراحة كانت ملاحظات مفيدة، ليست قاسية إطلاقاً."),
      ("That's good. So how did it finally end? Did everyone feel better?", "هذا جيد. إذاً كيف انتهى الأمر أخيراً؟ هل شعر الجميع بتحسن؟"),
      ("In the end, yeah, everyone left feeling like we actually improved something real.", "في النهاية، نعم، غادر الجميع بشعور أننا حسّنا شيئاً حقيقياً فعلاً.")],
  8: [("Can you explain why you were late again? I want the real reason this time.", "هل يمكنك تفسير سبب تأخرك مجدداً؟ أريد السبب الحقيقي هذه المرة."),
      ("Honestly, since my alarm didn't go off, I just completely overslept.", "بصراحة، بما أن المنبه لم يرن، فقد نمت أكثر من اللازم تماماً."),
      ("That's a valid reason, not really an excuse. Did you at least text someone?", "هذا سبب وجيه، ليس عذراً فعلاً. هل راسلت أحداً على الأقل؟"),
      ("I did, so at least everyone knew I was on my way and not just ignoring it.", "فعلت، فعلى الأقل عرف الجميع أنني في طريقي ولا أتجاهل الأمر."),
      ("Good, because showing up late without warning is way worse, honestly.", "جيد، لأن الحضور متأخراً دون تحذير أسوأ بكثير، بصراحة."),
      ("I know, that's exactly why I made sure to explain myself properly this time.", "أعرف، لهذا بالضبط تأكدت من تفسير الأمر بشكل صحيح هذه المرة.")],
  9: [("How did you feel right after the results came out? Be honest.", "كيف شعرت مباشرة بعد ظهور النتائج؟ كن صادقاً."),
      ("Nervous the whole time, but honestly relieved once I actually saw my score.", "متوتراً طوال الوقت، لكن بصراحة شعرت بالارتياح بمجرد رؤية درجتي."),
      ("That makes sense. Were you disappointed with any part of it though?", "هذا منطقي. هل شعرت بخيبة أمل من أي جزء منها مع ذلك؟"),
      ("A little, but mostly just surprised it went better than I expected at all.", "قليلاً، لكن في الغالب فوجئت أنها سارت أفضل مما توقعت إطلاقاً."),
      ("I'm proud of you either way. That took real effort, not just luck.", "أنا فخور بك على أي حال. تطلب هذا جهداً حقيقياً، وليس مجرد حظ."),
      ("Thank you, honestly. I'm grateful you were there cheering me on the whole time.", "شكراً لك، بصراحة. أنا ممتن لأنك كنت هناك تشجعني طوال الوقت.")],
  10: [("What were you doing when I called you last night? You never picked up.", "ماذا كنت تفعل عندما اتصلت بك الليلة الماضية؟ لم ترد أبداً."),
       ("Sorry, I was studying and completely lost track of everything around me.", "آسف، كنت أدرس وفقدت تماماً تتبع كل شيء حولي."),
       ("That's fair. It was raining so hard outside, I figured you were just inside.", "هذا معقول. كانت تمطر بغزارة في الخارج، افترضت أنك كنت بالداخل فقط."),
       ("Exactly, and my parents were talking in the kitchen while my mom was cooking.", "بالضبط، ووالداي كانا يتحدثان في المطبخ بينما كانت أمي تطهو."),
       ("Sounds cozy, honestly. We were just waiting around for the rain to stop.", "يبدو دافئاً، بصراحة. نحن كنا فقط ننتظر توقف المطر."),
       ("Next time text me first, I promise I'll actually answer if I'm not buried in books.", "المرة القادمة راسلني أولاً، أعدك أنني سأرد فعلاً إن لم أكن غارقاً في الكتب.")],
  11: [("Tell me your actual study story. How did you go from struggling to passing?", "أخبرني بقصة دراستك الحقيقية. كيف انتقلت من الصعوبة إلى النجاح؟"),
       ("Honestly, I reviewed my notes every single night, even when I didn't feel like it.", "بصراحة، راجعت ملاحظاتي كل ليلة، حتى عندما لم أكن أرغب في ذلك."),
       ("That's dedication. Did you memorize everything, or just understand the concepts?", "هذا تفانٍ. هل حفظت كل شيء، أم فهمت المفاهيم فقط؟"),
       ("A mix, but mostly I practiced explaining it out loud until it made sense.", "مزيج، لكن في الغالب تدربت على شرحها بصوت عالٍ حتى صارت منطقية."),
       ("That actually explains why you improved so much between the two tests.", "هذا فعلاً يفسر سبب تحسنك كثيراً بين الاختبارين."),
       ("It does. Struggling at first wasn't fun, but it made passing feel so much better.", "هذا صحيح. المعاناة في البداية لم تكن ممتعة، لكنها جعلت النجاح يبدو أفضل بكثير.")],
  12: [("So how was the trip? Tell me everything from the moment you packed.", "إذاً كيف كانت الرحلة؟ أخبرني بكل شيء منذ لحظة حزمت فيها الحقيبة."),
       ("Honestly chaotic. We packed way too much and almost missed our flight.", "فوضوية بصراحة. حزمنا أكثر من اللازم بكثير وكدنا نفوت رحلتنا."),
       ("Classic. Once you flew out and arrived though, was it worth the stress?", "كلاسيكي. لكن بمجرد أن طرتم ووصلتم، هل كان يستحق كل ذلك التوتر؟"),
       ("Completely. We explored so much more than I expected in just one week.", "تماماً. استكشفنا أكثر بكثير مما توقعت في أسبوع واحد فقط."),
       ("That sounds amazing. How long did you actually stay before you returned?", "هذا يبدو مذهلاً. كم من الوقت بقيتم فعلاً قبل أن تعودوا؟"),
       ("Only five days, but it honestly felt like a much longer trip than that.", "خمسة أيام فقط، لكنها بصراحة شعرت وكأنها رحلة أطول بكثير من ذلك.")],
  13: [("Okay, what actually went wrong today? You look completely exhausted.", "حسناً، ماذا حدث فعلاً اليوم؟ تبدو منهكاً تماماً."),
       ("Where do I even start. I spilled coffee on my notes right before class.", "من أين أبدأ حتى. سكبت القهوة على ملاحظاتي مباشرة قبل الحصة."),
       ("That's rough. Did anything else go wrong, or was that the only disaster?", "هذا صعب. هل حدث خطأ آخر، أم كانت تلك الكارثة الوحيدة؟"),
       ("I also lost my bus pass and showed up late because of it, honestly.", "فقدت أيضاً بطاقة الحافلة وحضرت متأخراً بسببها، بصراحة."),
       ("At least tell me you fixed something today, one small win at least.", "على الأقل أخبرني أنك أصلحت شيئاً اليوم، فوز صغير واحد على الأقل."),
       ("Barely. I fixed my broken headphones, so I guess today wasn't a total mistake.", "بالكاد. أصلحت سماعاتي المكسورة، فأعتقد أن اليوم لم يكن خطأ كاملاً.")],
  14: [("How was the party? Did as many guests show up as you were hoping?", "كيف كانت الحفلة؟ هل حضر ضيوف بقدر ما كنت تأمل؟"),
       ("Even more, honestly. The decorations looked amazing once everyone arrived.", "أكثر حتى، بصراحة. بدت الزينة مذهلة بمجرد وصول الجميع."),
       ("Nice! Was the music good, or did someone take control of the playlist?", "رائع! هل كانت الموسيقى جيدة، أم تحكم أحدهم بقائمة التشغيل؟"),
       ("Both, actually. We played games for hours before we even got to the cake.", "كلاهما في الواقع. لعبنا ألعاباً لساعات قبل أن نصل حتى إلى الكعكة."),
       ("Sounds like a great night. Did you get any interesting gifts?", "يبدو أنها ليلة رائعة. هل حصلت على هدايا مثيرة للاهتمام؟"),
       ("A few, but honestly the games and the people mattered way more than the gifts.", "قليلاً، لكن بصراحة الألعاب والأشخاص كانوا أهم بكثير من الهدايا.")],
  15: [("Tell me about the most unforgettable day you've had this year.", "أخبرني عن أكثر يوم لا يُنسى مررت به هذا العام."),
       ("Honestly, the day I woke up and just knew something good was coming.", "بصراحة، اليوم الذي استيقظت فيه وعرفت فقط أن شيئاً جيداً قادم."),
       ("That's a good feeling. What happened after you got ready and left the house?", "هذا شعور جيد. ماذا حدث بعد أن استعددت وغادرت المنزل؟"),
       ("We ended up celebrating something completely unexpected with the whole family.", "انتهى بنا الأمر نحتفل بشيء غير متوقع تماماً مع العائلة كلها."),
       ("That sounds special. Is that a day you'll actually remember for years?", "هذا يبدو مميزاً. هل هذا يوم ستتذكره فعلاً لسنوات؟"),
       ("Definitely. Some days you just know you'll never forget, and that was one.", "بالتأكيد. بعض الأيام تعرف فقط أنك لن تنساها أبداً، وكان ذلك أحدها.")],
  16: [("What were you doing during the surprise announcement? I saw your face.", "ماذا كنت تفعل أثناء الإعلان المفاجئ؟ رأيت وجهك."),
       ("Honestly, I was thinking about something completely unrelated at that exact moment.", "بصراحة، كنت أفكر في شيء غير مرتبط تماماً في تلك اللحظة بالذات."),
       ("That explains the confused look. What was everyone else doing while you zoned out?", "هذا يفسر النظرة المرتبكة. ماذا كان يفعل الآخرون بينما كنت شارداً؟"),
       ("They were watching closely, but I was laughing at something on my phone instead.", "كانوا يشاهدون بانتباه، لكنني كنت أضحك على شيء في هاتفي بدلاً من ذلك."),
       ("Classic you. Were you even listening when they said the actual news?", "أنت دائماً هكذا. هل كنت تستمع حتى عندما قالوا الخبر الفعلي؟"),
       ("Barely, but I caught the important part while everyone else was still talking about it.", "بالكاد، لكنني التقطت الجزء المهم بينما كان الجميع ما زالوا يتحدثون عنه.")],
  17: [("If I interviewed you right now, what's your favorite memory from this year?", "لو أجريت معك مقابلة الآن، ما هي ذكراك المفضلة من هذا العام؟"),
       ("Honestly, probably the challenge I overcame during that group project earlier.", "بصراحة، ربما التحدي الذي تغلبت عليه خلال ذلك المشروع الجماعي سابقاً."),
       ("That's a good answer. What about your biggest personal achievement so far?", "هذه إجابة جيدة. ماذا عن أكبر إنجاز شخصي لك حتى الآن؟"),
       ("Learning to speak up more, actually. That felt like a real adventure for me.", "تعلم التحدث بصوت أعلى، في الواقع. شعرت وكأنها مغامرة حقيقية بالنسبة لي."),
       ("That's a great story, honestly. More people should hear that experience.", "هذه قصة رائعة، بصراحة. يجب أن يسمع المزيد من الناس تلك التجربة."),
       ("Thanks, maybe I'll actually tell it properly one day instead of just summarizing it.", "شكراً، ربما سأرويها بشكل صحيح يوماً ما بدلاً من مجرد تلخيصها.")],
  18: [("How was movie night? Did you actually pick something good this time?", "كيف كانت ليلة الأفلام؟ هل اخترت شيئاً جيداً فعلاً هذه المرة؟"),
       ("I chose a comedy, and honestly we laughed way more than I expected.", "اخترت فيلماً كوميدياً، وبصراحة ضحكنا أكثر بكثير مما توقعت."),
       ("Nice. Did anyone fall asleep halfway through, like always happens?", "جميل. هل نام أحد في منتصفه، كما يحدث دائماً؟"),
       ("Of course, my brother did, while he was still texting someone the whole time.", "بالطبع، أخي فعل ذلك، بينما كان ما زال يراسل أحدهم طوال الوقت."),
       ("Classic. Would you actually recommend it, or was it just okay?", "كالعادة. هل توصي به فعلاً، أم كان مجرد مقبول؟"),
       ("I'd recommend it, honestly. We even shared the ending with a friend who missed it.", "أوصي به، بصراحة. حتى شاركنا النهاية مع صديق فاتته.")],
  19: [("You look stressed. What happened, did you lose something important?", "تبدو متوتراً. ماذا حدث، هل فقدت شيئاً مهماً؟"),
       ("My backpack, actually. I searched everywhere and started getting really worried.", "حقيبة ظهري، في الواقع. بحثت في كل مكان وبدأت أقلق حقاً."),
       ("That's terrifying. Did you eventually find it, or is it still missing?", "هذا مرعب. هل وجدتها في النهاية، أم أنها ما زالت مفقودة؟"),
       ("Found it, thankfully, under a bench where I'd forgotten I sat down.", "وجدتها، لحسن الحظ، تحت مقعد كنت قد نسيت أنني جلست عليه."),
       ("I bet you felt so relieved. That could've ruined your entire week.", "أراهن أنك شعرت بارتياح كبير. كان يمكن أن يفسد ذلك أسبوعك بأكمله."),
       ("Completely. I'm being way more careful with my stuff from now on, honestly.", "تماماً. سأكون أكثر حذراً بكثير مع أغراضي من الآن فصاعداً، بصراحة.")],
  20: [("If you told your own story from this whole level, how would it start?", "لو رويت قصتك الخاصة من هذا المستوى بأكمله، كيف ستبدأ؟"),
       ("Honestly, I'd say I went from nervous to excited because I finally understood past tense.", "بصراحة، سأقول إنني انتقلت من التوتر إلى الحماس لأنني فهمت أخيراً زمن الماضي."),
       ("That's a great start. What's the most unforgettable part of your story?", "هذه بداية رائعة. ما هو الجزء الأكثر تميزاً في قصتك؟"),
       ("Probably realizing I could actually tell a whole story without stopping to translate.", "ربما إدراكي أنني أستطيع فعلاً رواية قصة كاملة دون التوقف للترجمة."),
       ("That's something to be proud of, genuinely. Your story really did improve a lot.", "هذا شيء تفخر به، فعلاً. قصتك تحسنت كثيراً بالفعل."),
       ("Thanks. I can't wait to see how the next chapter of this story goes.", "شكراً. لا أطيق الانتظار لأرى كيف سيسير الفصل التالي من هذه القصة.")],
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

    is_review = num == 20
    n_vocab_mcq = 24 if is_review else 10
    n_grammar_mcq = 16 if is_review else 10
    grammar_recap_topics = None
    if is_review:
        hub = json.load(open(f"grammar-hub/{LEVEL}.json", encoding="utf-8"))
        grammar_recap_topics = chunk_grammar_topics(hub["topics"], per_slide=5)

    describing_time_image = None
    if num in (6, 11, 16, 20):
        img_path = f"assets/describing-time/{LEVEL}/lesson{num:02d}.jpg"
        if os.path.exists(img_path):
            describing_time_image = img_path

    slides = build_deck_v2(num, lesson, grammar_topic, dialogue, hook, notice_sentences,
                            notice_note, challenge, real_life, theme_key=theme_key, level=LEVEL,
                            discussion=discussion, n_vocab_mcq=n_vocab_mcq, n_grammar_mcq=n_grammar_mcq,
                            grammar_recap_topics=grammar_recap_topics,
                            describing_time_image=describing_time_image)
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
