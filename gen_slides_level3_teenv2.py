# -*- coding: utf-8 -*-
import sys, json, glob, os
sys.path.insert(0, "lib")
from deck_template_teen2 import build_deck_v2, chunk_grammar_topics
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
  1: [("Honestly, what does your crew even do when you hang out?", "بصراحة، ماذا تفعل شلتك فعلاً عندما تقضون وقتاً معاً؟"),
      ("Mostly we just chat and text each other silly jokes all day.", "في الغالب نتحدث ونتراسل بنكت سخيفة طوال اليوم."),
      ("Wait, so you don't actually see each other much in person?", "لحظة، إذاً أنتم لا ترون بعضكم كثيراً شخصياً؟"),
      ("We do! We hang out after school too, but the group chat never stops.", "بلى نراهم! نقضي وقتاً بعد المدرسة أيضاً، لكن الدردشة الجماعية لا تتوقف أبداً."),
      ("That's so real. Does everyone in your crew laugh at the same jokes?", "هذا صحيح جداً. هل يضحك الجميع في شلتك على نفس النكات؟"),
      ("Not really, but that's what makes it funnier -- everyone laughs differently!", "ليس تماماً، لكن هذا ما يجعل الأمر أكثر تسلية -- كل شخص يضحك بطريقته!")],
  2: [("Does your sister actually train every single day, or is that an exaggeration?", "هل تتدرب أختك فعلاً كل يوم، أم أن هذا مبالغة؟"),
      ("No, it's real -- she practices basketball for two hours, then studies right after.", "لا، هذا حقيقي -- تتمرن على كرة السلة لساعتين، ثم تدرس مباشرة بعدها."),
      ("That's intense. Does she even have time to watch anything for fun?", "هذا مكثف. هل لديها وقت لمشاهدة أي شيء للمتعة؟"),
      ("A little. She listens to music while she studies, that's basically her break.", "قليلاً. تستمع للموسيقى أثناء الدراسة، هذه استراحتها الوحيدة تقريباً."),
      ("Honestly, that sounds exhausting. My schedule is way more relaxed.", "بصراحة، هذا يبدو متعباً. جدولي أكثر استرخاءً بكثير."),
      ("Same here -- I mostly just play video games and call it a day.", "نفس الشيء هنا -- ألعب ألعاب الفيديو غالباً وأنهي يومي.")],
  3: [("Be honest, do you actually think this show is awesome, or are you just watching it?", "كن صادقاً، هل تعتقد فعلاً أن هذا البرنامج رائع، أم أنك تشاهده فقط؟"),
      ("Honestly, it's kind of boring, but everyone says it's cool, so I keep watching.", "بصراحة، إنه ممل نوعاً ما، لكن الجميع يقول إنه رائع، لذا أستمر في المشاهدة."),
      ("That's so weird. You shouldn't watch something just because it's popular.", "هذا غريب جداً. لا يجب أن تشاهد شيئاً فقط لأنه رائج."),
      ("You're right, it's actually pretty annoying how much pressure there is to like things.", "أنت محق، إنه مزعج جداً فعلاً هذا الضغط لتحب أشياء معينة."),
      ("Exactly. I think it's totally fine to say something is lame if it's not your thing.", "بالضبط. أعتقد أنه من المقبول تماماً أن تقول إن شيئاً ما تافه إذا لم يعجبك."),
      ("Yeah, I'm done pretending. From now on I'm only watching what I actually like.", "نعم، انتهيت من التظاهر. من الآن سأشاهد فقط ما يعجبني فعلاً.")],
  4: [("Okay, be honest -- is your room actually as messy as you always say?", "حسناً، كن صادقاً -- هل غرفتك فوضوية فعلاً كما تقول دائماً؟"),
      ("Kind of! There's a poster falling off the wall and books everywhere on my shelf.", "نوعاً ما! يوجد ملصق يتساقط عن الجدار وكتب في كل مكان على رفي."),
      ("What about your desk? Is that where you do your homework?", "ماذا عن مكتبك؟ هل هناك تؤدي واجبك؟"),
      ("Not really, I usually sit on my beanbag with my speaker playing music instead.", "ليس فعلاً، أجلس عادة على كرسي الفول بجانب سماعتي التي تشغل الموسيقى بدلاً من ذلك."),
      ("That explains why your lamp is always still on when I call you at night.", "هذا يفسر لماذا يبقى مصباحك مضاءً دائماً عندما أتصل بك ليلاً."),
      ("Ha, true. My desk is basically just decoration at this point.", "هه، صحيح. مكتبي أصبح مجرد ديكور في هذه المرحلة.")],
  5: [("Okay, this or that: new sneakers or new headphones? You can only pick one.", "حسناً، هذا أو ذاك: حذاء رياضي جديد أم سماعات جديدة؟ يمكنك اختيار واحد فقط."),
      ("That's brutal, but honestly, sneakers -- mine are falling apart.", "هذا قاسٍ، لكن بصراحة، الحذاء الرياضي -- حذائي بدأ يتمزق."),
      ("Fair. What about a jacket or a hoodie for winter?", "منطقي. ماذا عن سترة أم هوديي للشتاء؟"),
      ("Hoodie, always. Jackets look nice but they're never actually comfortable.", "الهوديي دائماً. السترات تبدو جميلة لكنها ليست مريحة فعلاً أبداً."),
      ("Same. And I never wear my backpack without my cap, it's just my whole look.", "نفس الشيء. ولا أرتدي حقيبة ظهري أبداً دون قبعتي، إنها أسلوبي بالكامل."),
      ("That's very you, honestly. I could've guessed that answer.", "هذا أنت تماماً، بصراحة. كان بإمكاني تخمين هذه الإجابة.")],
  6: [("Who do you actually spend the most time with -- your teammates or your classmates?", "مع من تقضي معظم وقتك فعلاً -- زملاء فريقك أم زملاء صفك؟"),
      ("Probably my teammates, but my cousins are basically like siblings to me too.", "غالباً زملاء فريقي، لكن أبناء عمومتي هم مثل إخوتي أيضاً."),
      ("That's nice. Do your neighbors ever hang out with your family?", "هذا لطيف. هل يقضي جيرانك وقتاً مع عائلتك أحياناً؟"),
      ("All the time, actually. It kind of feels like one big group.", "طوال الوقت في الحقيقة. يبدو الأمر وكأننا مجموعة كبيرة واحدة."),
      ("Honestly, that sounds better than just having followers online who don't really know you.", "بصراحة، هذا يبدو أفضل من مجرد وجود متابعين عبر الإنترنت لا يعرفونك حقاً."),
      ("Exactly. I'd rather have five real people around me than a thousand followers.", "بالضبط. أفضل خمسة أشخاص حقيقيين حولي على ألف متابع.")],
  7: [("Wait, whose phone is this on the table? The screen's completely cracked.", "لحظة، هاتف من هذا على الطاولة؟ الشاشة مكسورة تماماً."),
      ("Oh, that's mine, don't judge me. Is that your charger next to it?", "أوه، هذا هاتفي، لا تحكم علي. هل هذا شاحنك بجانبه؟"),
      ("Yeah, and those are definitely not my earbuds -- mine are wireless.", "نعم، وهذه بالتأكيد ليست سماعاتي -- سماعاتي لاسلكية."),
      ("Those are probably my sister's. She never remembers her password either.", "غالباً هذه سماعات أختي. هي أيضاً لا تتذكر كلمة السر أبداً."),
      ("Honestly, is there an app that just organizes everyone's stuff for us?", "بصراحة، هل يوجد تطبيق ينظم أغراض الجميع لنا؟"),
      ("If there is, I need to download it immediately.", "إذا وُجد، يجب أن أحمّله فوراً.")],
  8: [("Quick, where's the nearest bathroom from the cafeteria? I'm going to be late.", "بسرعة، أين أقرب حمام من الكافيتيريا؟ سأتأخر."),
      ("Down the hallway, past the gym, right before the library.", "في نهاية الممر، بعد الصالة الرياضية، قبل المكتبة مباشرة."),
      ("Got it. Wait, is my locker actually near the playground exit?", "فهمت. لحظة، هل خزانتي فعلاً قرب مخرج ساحة اللعب؟"),
      ("Pretty much, yeah. You can't miss it, it's the one with the sticker on it.", "تقريباً، نعم. لن تخطئها، إنها الخزانة التي عليها ملصق."),
      ("Perfect, that actually makes my morning route so much easier.", "ممتاز، هذا فعلاً يجعل مسار صباحي أسهل بكثير."),
      ("Right? I wish someone had told me that back in Lesson 1.", "أليس كذلك؟ أتمنى لو أخبرني أحد بهذا في الدرس الأول.")],
  9: [("Okay, weirdly specific question: can you skateboard, or would that be a disaster?", "حسناً، سؤال محدد وغريب: هل تستطيع التزلج بلوح، أم سيكون كارثة؟"),
      ("Honestly, a disaster. But I can dance pretty well, if that counts for anything.", "بصراحة، كارثة. لكنني أستطيع الرقص بشكل جيد، إن كان هذا يُحسب."),
      ("It does! Can you also draw, or is dancing your one talent?", "بالتأكيد يُحسب! هل تستطيع الرسم أيضاً، أم أن الرقص موهبتك الوحيدة؟"),
      ("I can draw a little, but I definitely can't code, no matter how many times I try.", "أستطيع الرسم قليلاً، لكن بالتأكيد لا أستطيع البرمجة مهما حاولت."),
      ("That's fair, coding is hard. I can bake and swim though, so we balance each other out.", "هذا منطقي، البرمجة صعبة. لكنني أستطيع الخبز والسباحة، فنحن نكمل بعضنا."),
      ("Perfect, so between us we can basically do everything except skateboard.", "ممتاز، إذاً معاً نستطيع فعل كل شيء تقريباً ما عدا التزلج بلوح.")],
  10: [("Okay, I have a mystery for you. Can you guess what it is with one clue?", "حسناً، لدي لغز لك. هل تستطيع التخمين بدليل واحد فقط؟"),
       ("Depends on the clue. Is it a riddle, or an actual real-life secret?", "يعتمد على الدليل. هل هي أحجية، أم سر حقيقي من الواقع؟"),
       ("A riddle. Here's your clue: it's something you use every single day at school.", "أحجية. إليك دليلك: إنه شيء تستخدمه كل يوم في المدرسة."),
       ("Is the answer... your backpack? That feels too easy though.", "هل الإجابة... حقيبة ظهرك؟ يبدو هذا سهلاً جداً مع ذلك."),
       ("Wrong, actually! But close. I'll give you one more secret clue.", "خطأ في الواقع! لكنك قريب. سأعطيك دليلاً سرياً آخر."),
       ("Okay, now I'm actually invested. Give me everything you've got.", "حسناً، الآن أصبحت مهتماً فعلاً. أعطني كل ما لديك.")],
  11: [("Let's have a race! I'm convinced I'm faster than you.", "لنتسابق! أنا مقتنع أنني أسرع منك."),
       ("Bold claim. My opponent last time barely beat my personal record, so good luck.", "ادعاء جريء. خصمي في المرة الماضية بالكاد تجاوز رقمي القياسي الشخصي، فبالتوفيق."),
       ("We'll see about that. Winner gets bragging rights, no medal necessary.", "سنرى ذلك. الفائز يحصل على حق التفاخر، لا حاجة لميدالية."),
       ("Deal. Just don't cry when I beat your score by a mile.", "اتفقنا. فقط لا تبكِ عندما أتفوق على نتيجتك بفارق كبير."),
       ("In your dreams. I've been training for exactly this moment.", "في أحلامك. كنت أتدرب لهذه اللحظة بالذات."),
       ("Okay now I'm actually nervous. Let's just go before I change my mind.", "حسناً الآن أصبحت متوتراً فعلاً. لنذهب قبل أن أغير رأيي.")],
  12: [("Did you see the newcomer standing by the door? She looks really nervous.", "هل رأيت الطالبة الجديدة الواقفة عند الباب؟ تبدو متوترة جداً."),
       ("Yeah, being the new kid is rough. Let's go welcome her properly.", "نعم، أن تكوني الطالبة الجديدة أمر صعب. لنذهب ونرحب بها بشكل صحيح."),
       ("Good idea. I'll introduce myself first so she doesn't feel like a total stranger.", "فكرة جيدة. سأعرّف بنفسي أولاً حتى لا تشعر أنها غريبة تماماً."),
       ("I'll come with you, two friendly faces are better than one, honestly.", "سآتي معك، وجهان ودودان أفضل من واحد، بصراحة."),
       ("Exactly. Imagine walking into a new school completely alone.", "بالضبط. تخيل أن تدخل مدرسة جديدة وحيداً تماماً."),
       ("I can't. That's exactly why we're doing this right now.", "لا أستطيع تخيل ذلك. لهذا السبب بالضبط نفعل هذا الآن.")],
  13: [("Okay real talk, do you actually raise your hand, or do you just shout out answers?", "حسناً بصراحة، هل ترفع يدك فعلاً، أم تصرخ بالإجابات فقط؟"),
       ("I try to be quiet and wait, but sometimes I get too excited to participate.", "أحاول أن أكون هادئاً وأنتظر، لكن أحياناً أتحمس كثيراً للمشاركة."),
       ("Same. Did you already submit your homework, or are you cutting it close again?", "نفس الشيء. هل سلّمت واجبك بالفعل، أم أنك تؤخره كالعادة؟"),
       ("Cutting it close, as usual. I promise I do pay attention, I just forget deadlines.", "أؤخره كالعادة. أعدك أنني أنتبه فعلاً، لكنني أنسى المواعيد النهائية فقط."),
       ("Fair enough. At least we both remember to line up on time, unlike some people.", "منطقي. على الأقل كلانا يتذكر الاصطفاف في الوقت المحدد، بخلاف البعض."),
       ("True, that's basically our only reliable classroom skill at this point.", "صحيح، هذه أساساً مهارتنا الصفية الموثوقة الوحيدة حتى الآن.")],
  14: [("Be honest, what are you actually doing right now instead of studying?", "كن صادقاً، ماذا تفعل الآن فعلاً بدلاً من الدراسة؟"),
       ("Okay fine, I'm texting my cousin and scrolling at the same time.", "حسناً، أراسل ابن عمي وأتصفح هاتفي في نفس الوقت."),
       ("Classic. I'm supposed to be gaming with friends, but I'm just chilling instead.", "كلاسيكي. من المفترض أن ألعب مع أصدقائي، لكنني أسترخي فقط بدلاً من ذلك."),
       ("Sounds like neither of us is being productive today, honestly.", "يبدو أن كلانا غير منتج اليوم، بصراحة."),
       ("Correct. I'll blame it on the show I'm streaming in the background.", "صحيح. سألوم البرنامج الذي أشاهده في الخلفية."),
       ("Fair excuse. We'll both pretend to study again tomorrow.", "عذر مقبول. سنتظاهر كلانا بالدراسة مجدداً غداً.")],
  15: [("Are you actually going to highlight your notes this time, or wing the quiz again?", "هل ستبرز ملاحظاتك فعلاً هذه المرة، أم ستخوض الاختبار بلا تحضير مجدداً؟"),
       ("This time I'm serious -- I even made flashcards to memorize the vocabulary.", "هذه المرة أنا جاد -- صنعت حتى بطاقات تعليمية لحفظ المفردات."),
       ("Impressive. Please tell me you finished your part of the group project too.", "مثير للإعجاب. أرجوك أخبرني أنك أنهيت جزءك من المشروع الجماعي أيضاً."),
       ("Almost. I still need to practice my presentation before tomorrow though.", "تقريباً. ما زلت بحاجة للتدرب على عرضي التقديمي قبل الغد."),
       ("Same here, honestly. Want to practice together tonight so neither of us panics?", "نفس الشيء هنا، بصراحة. هل تريد أن نتدرب معاً الليلة حتى لا يصاب أحدنا بالذعر؟"),
       ("Yes, please. Two nervous presenters are better than one, apparently.", "نعم، أرجوك. يبدو أن مقدمين متوترين أفضل من واحد.")],
  16: [("Pass me a controller, it's officially game night and I have a new strategy.", "أعطني ذراع تحكم، إنها رسمياً ليلة الألعاب ولدي استراتيجية جديدة."),
       ("Oh, this should be interesting. Last time your strategy got us both eliminated.", "أوه، هذا سيكون مثيراً للاهتمام. آخر مرة استراتيجيتك أقصتنا كلانا."),
       ("That was one time! Tonight my teammate and I are actually going to level up.", "كانت تلك مرة واحدة! الليلة زميلي وأنا سنصل فعلاً لمستوى جديد."),
       ("Bold words. I'm still the reigning champion with the highest score, remember?", "كلام جريء. ما زلت البطل الحالي بأعلى نتيجة، أتذكر؟"),
       ("Not for long. We've been practicing specifically to beat your high score.", "ليس لوقت طويل. كنا نتدرب تحديداً لتجاوز أعلى نتيجة لك."),
       ("We'll see about that. Let the game decide who the real champion is.", "سنرى ذلك. دع اللعبة تقرر من هو البطل الحقيقي.")],
  17: [("Okay, what genre are we watching tonight? I refuse to watch another sad movie.", "حسناً، أي نوع سنشاهد الليلة؟ أرفض مشاهدة فيلم حزين آخر."),
       ("Deal, no sad movies. Get the popcorn ready while I set up the screen.", "اتفقنا، لا أفلام حزينة. جهّز الفشار بينما أعدّ الشاشة."),
       ("Already on it. Should we watch with subtitles or just listen carefully?", "أنا أفعل ذلك بالفعل. هل نشاهد بترجمة أم نستمع بعناية فقط؟"),
       ("Subtitles, definitely, your TV volume is never loud enough anyway.", "الترجمة، بالتأكيد، صوت تلفازك ليس عالياً بما يكفي أبداً على أي حال."),
       ("Fair point. And after this one, we're finally watching the sequel everyone's talking about.", "نقطة منطقية. وبعد هذا الفيلم، سنشاهد أخيراً الجزء الثاني الذي يتحدث عنه الجميع."),
       ("I saw the trailer already, it looks amazing. This is going to be a good night.", "شاهدت الإعلان بالفعل، يبدو مذهلاً. ستكون هذه ليلة رائعة.")],
  18: [("Can I get your honest opinion on something, no judgment either way?", "هل يمكنني أخذ رأيك الصريح في شيء ما، دون حكم أياً كان؟"),
       ("Sure, go for it. Just know I might completely disagree with you.", "بالتأكيد، تفضل. فقط اعلم أنني قد أختلف معك تماماً."),
       ("That's fine, I actually want a real reason, not just an easy agree.", "لا بأس، أريد سبباً حقيقياً فعلاً، وليس مجرد موافقة سهلة."),
       ("Okay then, honestly, I think you made the wrong choice. Here's why.", "حسناً إذاً، بصراحة، أعتقد أنك اتخذت الخيار الخاطئ. إليك السبب."),
       ("That's a fair point, actually. I didn't think about it that way before.", "هذه نقطة منطقية في الواقع. لم أفكر بهذه الطريقة من قبل."),
       ("See, this is why I like asking you -- you always help me decide better.", "أترى، لهذا أحب أن أسألك -- أنت دائماً تساعدني على القرار بشكل أفضل.")],
  19: [("Are you nervous about the match today, or are you feeling confident?", "هل أنت متوتر بشأن المباراة اليوم، أم تشعر بالثقة؟"),
       ("A little nervous, honestly, but our teamwork has been really solid in practice.", "متوتر قليلاً، بصراحة، لكن عملنا الجماعي كان قوياً جداً في التمرين."),
       ("That's what matters most. Even if we don't win, I'll be proud of how we played.", "هذا أهم ما في الأمر. حتى لو لم نفز، سأفخر بطريقة لعبنا."),
       ("Same here. Just promise you'll cheer loud enough for both of us.", "نفس الشيء هنا. فقط عدني أنك ستشجع بصوت عالٍ يكفي لكلينا."),
       ("Obviously. I'll be the loudest person in that entire crowd, guaranteed.", "بالطبع. سأكون أعلى صوت في كل ذلك الحشد، مضمون."),
       ("Good, because we're going to need it. Let's go make this a match to remember.", "جيد، لأننا سنحتاج ذلك. لنجعل هذه مباراة لا تُنسى.")],
  20: [("Looking back at this whole level, what are you most proud of learning?", "بالنظر إلى هذا المستوى بأكمله، بماذا تفخر أكثر أنك تعلمته؟"),
       ("Honestly, probably talking about teamwork with my teammates without translating in my head first.", "بصراحة، ربما التحدث عن العمل الجماعي مع زملائي دون ترجمة في ذهني أولاً."),
       ("Same. My opinion is that we've come a long way since Lesson 1.", "نفس الشيء. رأيي أننا قطعنا شوطاً طويلاً منذ الدرس الأول."),
       ("Definitely. Remember when just texting on your phone felt hard in English?", "بالتأكيد. أتذكر عندما كانت مجرد المراسلة على هاتفك تبدو صعبة بالإنجليزية؟"),
       ("Barely! Now I can hang out and actually joke around without overthinking it.", "بالكاد! الآن أستطيع قضاء الوقت والمزاح فعلاً دون تفكير زائد."),
       ("Exactly. Let's put that in the time capsule -- proof we leveled up, like real champions.", "بالضبط. لنضع هذا في كبسولة الزمن -- دليل أننا تطورنا، مثل الأبطال الحقيقيين.")],
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

    # Lesson 20 is this level's comprehensive review -- give it broader
    # vocab/grammar coverage than a normal lesson's fixed defaults, and
    # since match_grammar_by_lesson_focus deliberately never matches a
    # single grammar_topic for a "review" lesson (confirmed by checking
    # lesson20.json's own grammarFocus field: "Review of all structures
    # from Lessons 1-19"), which otherwise leaves the deck with zero
    # grammar content at all, feed it every topic from this level's own
    # grammar-hub instead via the new grammar_recap slide type.
    is_review = num == 20
    n_vocab_mcq = 24 if is_review else 10
    n_grammar_mcq = 16 if is_review else 10
    grammar_recap_topics = None
    if is_review:
        hub = json.load(open(f"grammar-hub/{LEVEL}.json", encoding="utf-8"))
        grammar_recap_topics = chunk_grammar_topics(hub["topics"], per_slide=5)

    slides = build_deck_v2(num, lesson, grammar_topic, dialogue, hook, notice_sentences,
                            notice_note, challenge, real_life, theme_key=theme_key, level=LEVEL,
                            discussion=discussion, n_vocab_mcq=n_vocab_mcq, n_grammar_mcq=n_grammar_mcq,
                            grammar_recap_topics=grammar_recap_topics)
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
