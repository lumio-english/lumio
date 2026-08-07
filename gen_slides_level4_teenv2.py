# -*- coding: utf-8 -*-
import sys, json, glob, os
sys.path.insert(0, "lib")
from deck_template_teen2 import build_deck_v2
from grammar_slides import match_grammar_by_lesson_focus

LEVEL = "level4"
_lessons = {}
for f in sorted(glob.glob(f"lessons/{LEVEL}/lesson*.json")):
    d = json.load(open(f, encoding="utf-8"))
    _lessons[d["number"]] = d
GRAMMAR_UNITS = match_grammar_by_lesson_focus(LEVEL, _lessons)

THEME_BY_LESSON = {
    1: "social", 2: "room", 3: "social", 4: "school", 5: "social", 6: "room",
    7: "room", 8: "money", 9: "money", 10: "sport", 11: "room", 12: "default",
    13: "social", 14: "sport", 15: "default", 16: "school", 17: "default",
    18: "default", 19: "school", 20: "default",
}

HOOKS = {
    1: "Do you know someone who seems busy 24/7? What do they always seem to be doing?",
    2: "What does your schedule actually look like on a normal day?",
    3: "How often do you really check your phone? Be honest.",
    4: "What's coming up on your calendar this month?",
    5: "What's your favorite way to stay in touch with friends?",
    6: "Have you ever argued about whose stuff is whose?",
    7: "What's always in your fridge or pantry at home?",
    8: "Do you check the price before you buy something? Always?",
    9: "Do you save money, spend it right away, or a bit of both?",
    10: "Who's the most talented person you know, and at what?",
    11: "Next time you're at a restaurant, what would you order?",
    12: "Has anyone ever given you advice that actually helped?",
    13: "How much of your day happens online, honestly?",
    14: "Think of a time teamwork made something way easier.",
    15: "What's the hardest decision you've made recently?",
    16: "What's something that makes you nervous, and how do you handle it?",
    17: "If you could have any career, what would it be?",
    18: "If you could visit any country, where would you go?",
    19: "Have you ever disagreed with teammates on a project? What happened?",
    20: "What's one goal you have for next year?",
}
CHALLENGES = {
    1: {"prompt": "Ask a partner 3 yes/no questions about their routine using Do/Does.", "hint": "Remember: Does + he/she/it, Do + I/you/we/they."},
    2: {"prompt": "Describe your own daily routine in 3 sentences.", "hint": "Use today's vocabulary words."},
    3: {"prompt": "Describe how often you do 3 different things.", "hint": "Daily, weekly, rarely, constantly, occasionally, never."},
    4: {"prompt": "Describe your week using 3 prepositions of time.", "hint": "Before, after, on, in, at."},
    5: {"prompt": "Describe how you'd contact 3 different people using object pronouns.", "hint": "Him, her, them, us, it."},
    6: {"prompt": "Point to 3 things and say who they belong to using possessive pronouns.", "hint": "Mine, yours, his, hers, ours, theirs."},
    7: {"prompt": "Ask a partner if they have any of 3 different foods.", "hint": "Some for yes-statements, any for questions/negatives."},
    8: {"prompt": "Ask about the price and quantity of 3 things.", "hint": "How much for uncountable, how many for countable."},
    9: {"prompt": "Describe your own saving habits in 3 sentences.", "hint": "Use today's vocabulary words."},
    10: {"prompt": "Describe the most talented person you know using superlatives.", "hint": "The most, the best, the biggest."},
    11: {"prompt": "Politely order 3 things using 'I'd like'.", "hint": "I'd like... / I would like..."},
    12: {"prompt": "Give a partner 3 pieces of advice using should/shouldn't.", "hint": "You should... / You shouldn't..."},
    13: {"prompt": "Describe your own online habits in 3 sentences.", "hint": "Use today's vocabulary words."},
    14: {"prompt": "Describe 3 ways you can be a good teammate.", "hint": "Use today's vocabulary words."},
    15: {"prompt": "Describe a real decision you need to make, in 3 sentences.", "hint": "Use today's vocabulary words."},
    16: {"prompt": "Describe how you feel before a test and why.", "hint": "Use today's feeling words."},
    17: {"prompt": "Describe your future goal in 3 sentences.", "hint": "Use today's vocabulary words."},
    18: {"prompt": "Describe a culture or country you'd like to explore.", "hint": "Use today's vocabulary words."},
    19: {"prompt": "Retell the story of the group project in your own words.", "hint": "Use at least 2 vocabulary words from the story."},
    20: {"prompt": "Describe one plan you have for next year in 3 sentences.", "hint": "Try to use words from at least 2 different lessons."},
}
REAL_LIFE = {
    1: "This week, ask someone 'Do you...?' or 'Does he/she...?' in English.",
    2: "Tonight, describe your actual routine to a family member in English.",
    3: "This week, tell someone how often you do something, in English.",
    4: "This week, describe your schedule using today's prepositions.",
    5: "Next time you message a friend, think of the sentence in English first.",
    6: "Next time something is yours or someone else's, say so in English.",
    7: "Next time you're in the kitchen, name 3 things using today's words.",
    8: "Next time you go shopping, ask 'How much is that?' in English.",
    9: "This week, talk about your own savings plan in English.",
    10: "This week, tell someone about the most talented person you know.",
    11: "Next time you order food, try using 'I'd like' in English.",
    12: "This week, give someone real advice using should/shouldn't.",
    13: "Next time you're online, describe what you're doing in English.",
    14: "This week, thank a teammate using today's vocabulary.",
    15: "Next time you face a choice, describe it in English.",
    16: "Next time you feel nervous or confident, say so in English.",
    17: "This week, tell someone about your future goal in English.",
    18: "This week, look up one fact about a culture that interests you.",
    19: "Think about your own group project experiences and describe one.",
    20: "Write down one real goal for next year, in English.",
}
DIALOGUES = {
  1: [("Does she even sleep? She's always studying!", "هل تنام حتى؟ إنها دائما تدرس!"),
      ("Does she wake up early too?", "هل تستيقظ باكرا أيضا؟"),
      ("Yes, but do you ever relax?", "نعم، لكن هل تسترخي أبدا؟"),
      ("I do! I chill every weekend.", "بالفعل! أسترخي كل عطلة أسبوع.")],
  2: [("What's your schedule like today?", "كيف هو جدولك اليوم؟"),
      ("Busy! I have a workout, then homework.", "مزدحم! لدي تمرين رياضي، ثم واجب منزلي."),
      ("Do you have a deadline too?", "هل لديك موعد نهائي أيضا؟"),
      ("Yes, and my bedtime is still 10 pm!", "نعم، ووقت نومي لا يزال العاشرة مساء!")],
  3: [("How often do you check your messages?", "كم مرة تتحقق من رسائلك؟"),
      ("Constantly, honestly!", "باستمرار، بصراحة!"),
      ("I rarely check mine.", "أنا نادرا ما أتحقق من رسائلي."),
      ("I occasionally forget my phone completely.", "أحيانا أنسى هاتفي تماما.")],
  4: [("Do you have an appointment before the weekend?", "هل لديك موعد قبل عطلة نهاية الأسبوع؟"),
      ("Yes, right after school.", "نعم، بعد المدرسة مباشرة."),
      ("Is your deadline before the holiday?", "هل موعدك النهائي قبل العطلة؟"),
      ("Yes, everything is due before the break.", "نعم، كل شيء مستحق قبل الاستراحة.")],
  5: [("Send it to me when you're done.", "أرسلها لي عندما تنتهي."),
      ("I'll call him first, then reply to her.", "سأتصل به أولا، ثم أرد عليها."),
      ("Let's invite them to video chat.", "لندعوهم لمكالمة فيديو."),
      ("Good idea, let's meet them online tonight.", "فكرة جيدة، لنقابلهم عبر الإنترنت الليلة.")],
  6: [("Are these earbuds yours?", "هل سماعات الأذن هذه لك؟"),
      ("No, that jacket is mine, not the earbuds.", "لا، تلك السترة لي، وليست السماعات."),
      ("Is this notebook hers?", "هل هذا الدفتر لها؟"),
      ("Yes, and that wallet is his.", "نعم، وتلك المحفظة له.")],
  7: [("Do we have any snacks left?", "هل لدينا أي وجبات خفيفة متبقية؟"),
      ("There are some leftovers in the fridge.", "هناك بعض بقايا الطعام في الثلاجة."),
      ("Do we need any groceries?", "هل نحتاج أي مشتريات؟"),
      ("Yes, we need some ingredients for dinner.", "نعم، نحتاج بعض المكونات للعشاء.")],
  8: [("How much is your allowance?", "كم مصروفك؟"),
      ("Not much, so I check every price tag.", "ليس كثيرا، لذا أتحقق من كل بطاقة سعر."),
      ("Is there a discount today?", "هل يوجد خصم اليوم؟"),
      ("Yes! Keep the receipt for your budget.", "نعم! احتفظ بالإيصال لميزانيتك.")],
  9: [("How do you save money?", "كيف تدخر المال؟"),
      ("I earn some doing chores, then I save it.", "أكسب بعضه من الأعمال المنزلية، ثم أدخره."),
      ("Do you ever spend it all?", "هل تنفقه كله أبدا؟"),
      ("Rarely -- I'd rather lend it to my sister!", "نادرا -- أفضل أن أقرضه لأختي!")],
  10: [("Who's the most talented singer you know?", "من أكثر مغني موهوب تعرفه؟"),
       ("My cousin -- she's the most skilled too.", "ابنة عمي -- وهي الأكثر مهارة أيضا."),
       ("That was the most impressive performance!", "كان ذلك الأداء الأكثر إبهارا!"),
       ("She's definitely the most popular singer at school.", "إنها بالتأكيد أكثر مغنية شهرة في المدرسة.")],
  11: [("What would you like to order?", "ماذا تريد أن تطلب؟"),
       ("I'd like a pizza, please. What do you recommend?", "أريد بيتزا من فضلك. بماذا توصي؟"),
       ("I prefer the pasta, actually.", "أفضل المعكرونة في الحقيقة."),
       ("Good choice! I suggest we share both.", "خيار جيد! أقترح أن نتشارك الاثنين.")],
  12: [("Can I give you some advice?", "هل يمكنني إعطاؤك نصيحة؟"),
       ("Sure, what's your suggestion?", "بالتأكيد، ما اقتراحك؟"),
       ("You should practice a little every day.", "يجب أن تتمرن قليلا كل يوم."),
       ("That's a great tip, thank you!", "هذه نصيحة رائعة، شكرا لك!")],
  13: [("Did you see her new post?", "هل رأيت منشورها الجديد؟"),
       ("Yes, I left a comment on it.", "نعم، تركت تعليقا عليه."),
       ("I shared it too. Are you online now?", "شاركته أيضا. هل أنت متصل الآن؟"),
       ("Yes, I just got a notification about it!", "نعم، وصلني إشعار بشأنه للتو!")],
  14: [("We should cooperate more on this project.", "يجب أن نتعاون أكثر في هذا المشروع."),
       ("I agree. Everyone should contribute.", "أوافق. يجب أن يساهم الجميع."),
       ("Let's support and encourage each other.", "لندعم ونشجع بعضنا."),
       ("Great teamwork makes a great leader!", "العمل الجماعي الرائع يصنع قائدا رائعا!")],
  15: [("I need to decide soon. There are two options.", "أحتاج أن أقرر قريبا. هناك خياران."),
       ("Consider the consequence of each one.", "فكر في نتيجة كل خيار."),
       ("Maybe we can find a compromise.", "ربما نستطيع إيجاد حل وسط."),
       ("Good idea. It's a big choice either way.", "فكرة جيدة. إنه خيار كبير على أي حال.")],
  16: [("I always feel nervous before a test.", "أشعر دائما بالتوتر قبل الاختبار."),
       ("I usually feel confident, but sometimes anxious.", "أشعر عادة بالثقة، لكن أحيانا بالقلق."),
       ("Try to stay calm under pressure.", "حاول أن تبقى هادئا تحت الضغط."),
       ("I feel relieved and proud after it's over!", "أشعر بالارتياح والفخر بعد انتهائه!")],
  17: [("What's your goal for the future?", "ما هدفك للمستقبل؟"),
       ("My dream is to have a career in art.", "حلمي أن أحصل على مهنة في الفن."),
       ("That's a great ambition. Art is your passion?", "هذا طموح رائع. الفن شغفك؟"),
       ("Yes, and I want to achieve it!", "نعم، وأريد تحقيقه!")],
  18: [("Every country has its own culture.", "لكل دولة ثقافتها الخاصة."),
       ("And its own traditions and language.", "وتقاليدها ولغتها الخاصة."),
       ("I want to explore new places and customs.", "أريد استكشاف أماكن وعادات جديدة."),
       ("It would be an amazing journey!", "ستكون رحلة مذهلة!")],
  19: [("Our group project deadline is Friday.", "الموعد النهائي لمشروعنا الجماعي هو الجمعة."),
       ("At first, we disagree about the plan.", "في البداية، نختلف حول الخطة."),
       ("But then we find a compromise.", "لكننا نجد حلا وسطا بعد ذلك."),
       ("Teamwork saves the day -- we're so proud!", "العمل الجماعي ينقذ الموقف -- نحن فخورون جدا!")],
  20: [("What are your plans for next year?", "ما خططك للعام القادم؟"),
       ("I want to save more and try new things.", "أريد أن أدخر أكثر وأجرب أشياء جديدة."),
       ("Let's write down our future goals.", "لنكتب أهدافنا المستقبلية."),
       ("This has been an amazing journey together!", "كانت هذه رحلة مذهلة معا!")],
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
