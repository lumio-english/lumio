# -*- coding: utf-8 -*-
"""
Generates the Present-ready interactive HTML slide decks for Level 2,
matching the exact template system already used by pre-a / level1
(slide-content/{level}/{NN}/slide-XX.html + assets/slides/{level}/manifest.json).
"""
import json, os, re, glob

LEVEL = "level2"
OUT_DIR = f"slide-content/{LEVEL}"
MANIFEST_PATH = f"assets/slides/{LEVEL}/manifest.json"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(f"assets/slides/{LEVEL}", exist_ok=True)

CHAR = "assets/story/characters"

# Hand-authored 4-line dialogues per lesson (natural, using the lesson's
# grammar focus / vocab), Arabic included. Everything else in the deck is
# derived mechanically from the lesson JSON already built.
DIALOGUES = {
  1: [("Hello! Nice to meet you!", "مرحبا! تشرفنا!"),
      ("Nice to meet you too! What's your name?", "تشرفنا أيضا! ما اسمك؟"),
      ("My name is Lumi. Thank you for saying hello!", "اسمي لومي. شكرا لك على الترحيب!"),
      ("You're welcome! Goodbye for now!", "عفوا! مع السلامة الآن!")],
  2: [("How old are you?", "كم عمرك؟"),
      ("I am eight years old. How old are you?", "عمري ثماني سنوات. كم عمرك أنت؟"),
      ("I am seven years old. My birthday is in May.", "عمري سبع سنوات. عيد ميلادي في مايو."),
      ("Happy early birthday!", "عيد ميلاد سعيد مقدما!")],
  3: [("This is my family tree. These are my grandparents.", "هذه شجرة عائلتي. هؤلاء أجدادي."),
      ("Who is this?", "من هذا؟"),
      ("This is my uncle, and this is my aunt.", "هذا عمي، وهذه عمتي."),
      ("You have a big family!", "لديك عائلة كبيرة!")],
  4: [("Look, who is that?", "انظر، من ذلك؟"),
      ("He is my brother. He is funny.", "هو أخي. هو مضحك."),
      ("And who is she?", "ومن هي؟"),
      ("She is my sister. She is smart.", "هي أختي. هي ذكية.")],
  5: [("Is this your bag?", "هل هذه حقيبتك؟"),
      ("No, that is not my bag. This is my bag.", "لا، تلك ليست حقيبتي. هذه حقيبتي."),
      ("Whose bag is that, then?", "حقيبة من تلك إذن؟"),
      ("That is her bag, I think.", "تلك حقيبتها على ما أظن.")],
  6: [("Have you got a phone?", "هل لديك هاتف؟"),
      ("Yes, I have got a new phone. Have you got a watch?", "نعم، لدي هاتف جديد. هل لديك ساعة؟"),
      ("I have got a watch and an umbrella too!", "لدي ساعة ومظلة أيضا!"),
      ("Wow, you have got a lot of things!", "واو، لديك أشياء كثيرة!")],
  7: [("My cheek hurts a little.", "خدي يؤلمني قليلا."),
      ("Oh no! Is your chin okay?", "يا للأسف! هل ذقنك بخير؟"),
      ("Yes, my chin is fine. My elbow hurts too.", "نعم، ذقني بخير. مرفقي يؤلمني أيضا."),
      ("Let's ask the teacher for help.", "لنسأل المعلمة للمساعدة.")],
  8: [("There is a big board in our classroom.", "هناك سبورة كبيرة في فصلنا."),
      ("Is there a playground too?", "هل هناك ملعب أيضا؟"),
      ("Yes! There is a playground next to the classroom.", "نعم! هناك ملعب بجانب الفصل."),
      ("I love our classroom and playground!", "أحب فصلنا وملعبنا!")],
  9: [("Please stand up, everyone.", "من فضلكم، قفوا جميعا."),
      ("Okay! Now what?", "حسنا! والآن؟"),
      ("Now sit down and listen carefully.", "الآن اجلسوا واستمعوا بانتباه."),
      ("Should we open our books too?", "هل نفتح كتبنا أيضا؟")],
  10: [("Can you count to a hundred?", "هل تستطيع العد إلى مئة؟"),
       ("I can count by tens: twenty, thirty, forty...", "أستطيع العد بالعشرات: عشرون، ثلاثون، أربعون..."),
       ("Great! What comes after eighty?", "رائع! ماذا يأتي بعد الثمانين؟"),
       ("Ninety, then one hundred!", "تسعون، ثم مئة!")],
  11: [("When is your birthday?", "متى عيد ميلادك؟"),
       ("My birthday is in January. What month is it now?", "عيد ميلادي في يناير. ما الشهر الآن؟"),
       ("It is September. School just started.", "إنه سبتمبر. بدأت المدرسة للتو."),
       ("My favorite month is June, no school!", "شهري المفضل هو يونيو، لا مدرسة!")],
  12: [("We are having a birthday party today!", "لدينا حفلة عيد ميلاد اليوم!"),
       ("Wonderful! Are there balloons and a cake?", "رائع! هل هناك بالونات وكعكة؟"),
       ("Yes, and candles too! Every guest gets a present.", "نعم، وشموع أيضا! كل ضيف يحصل على هدية."),
       ("I can't wait for the cake!", "لا أستطيع الانتظار للكعكة!")],
  13: [("What time is it?", "كم الساعة؟"),
       ("It is three o'clock. Look at the clock!", "الساعة الثالثة تماما. انظر إلى الساعة!"),
       ("Is it afternoon or evening?", "هل هو بعد الظهر أم المساء؟"),
       ("It is the afternoon. School ends soon.", "إنه بعد الظهر. تنتهي المدرسة قريبا.")],
  14: [("What do you do every morning?", "ماذا تفعل كل صباح؟"),
       ("I wake up, then I brush my teeth.", "أستيقظ، ثم أنظف أسناني."),
       ("Do you have breakfast before school?", "هل تتناول الفطور قبل المدرسة؟"),
       ("Yes, I have breakfast, then I go to school.", "نعم، أتناول الفطور، ثم أذهب إلى المدرسة.")],
  15: [("What do you do in the evening?", "ماذا تفعل في المساء؟"),
       ("I come home, then I do my homework.", "أعود إلى المنزل، ثم أؤدي واجبي."),
       ("Do you read before bed?", "هل تقرأ قبل النوم؟"),
       ("Yes, I read a book, then I go to bed.", "نعم، أقرأ كتابا، ثم أذهب إلى النوم.")],
  16: [("What do you eat for breakfast?", "ماذا تأكل في الفطور؟"),
       ("I eat eggs for breakfast. What about lunch?", "آكل بيضا في الفطور. ماذا عن الغداء؟"),
       ("I eat healthy food for lunch, like vegetables.", "آكل طعاما صحيا في الغداء، مثل الخضار."),
       ("I drink a lot of water every day too.", "أشرب الكثير من الماء كل يوم أيضا.")],
  17: [("Do you like drawing?", "هل تحب الرسم؟"),
       ("Yes, I do! I like drawing and painting.", "نعم، أحب! أحب الرسم والتلوين."),
       ("Do you like singing?", "هل تحب الغناء؟"),
       ("No, I don't. But I like dancing!", "لا، لا أحب. لكن أحب الرقص!")],
  18: [("This is my pencil. What is that?", "هذا قلمي. ما ذلك؟"),
       ("That is your bag, over there.", "تلك حقيبتك، هناك."),
       ("And these are my books!", "وهذه كتبي!"),
       ("Those are nice books!", "تلك كتب جميلة!")],
  19: [("I have two boxes here.", "لدي صندوقان هنا."),
       ("How many children are playing outside?", "كم طفلا يلعبون في الخارج؟"),
       ("Three children are playing. Look, two babies are sleeping.", "ثلاثة أطفال يلعبون. انظر، طفلان رضيعان نائمان."),
       ("And two men are watching them.", "ورجلان يراقبانهم.")],
  20: [("Hello! Let's talk about my family and my classroom.", "مرحبا! دعنا نتحدث عن عائلتي وفصلي."),
       ("What do you eat for breakfast?", "ماذا تأكل في الفطور؟"),
       ("I eat breakfast, then I like drawing before school.", "آكل الفطور، ثم أحب الرسم قبل المدرسة."),
       ("Happy birthday, by the way! Look at the clock — time for class!", "عيد ميلاد سعيد بالمناسبة! انظر إلى الساعة — حان وقت الحصة!")],
}

# Character rotation (existing assets only)
VOCAB_CHARS = ["omar-wave", "noor-happy", "sara-clap", "omar-point", "noor-wave"]
LETTER_COLORS = ["#F97316", "#0D9488", "#F59E0B", "#2DD4BF", "#DC5C33"]

def esc(s):
    return (s or "").replace("&", "&amp;").replace('"', "&quot;")

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

# ---------- shared background snippets ----------
SPARKS = ('<div class="spark" style="left:375px;top:135px;font-size:1.6rem">&#10022;</div>'
          '<div class="spark" style="left:415px;top:105px;font-size:1.1rem">&#10022;</div>'
          '<div class="spark" style="left:392px;top:178px;font-size:1.3rem">&#10022;</div>')
WINDOW = '<div class="window"><div class="cross-v"></div><div class="cross-h"></div></div>'
SHELF_BOOKS = ('<div class="shelf"></div>'
    '<div class="book" style="left:56px;width:32px;height:78px;background:#F97316"></div>'
    '<div class="book" style="left:93px;width:28px;height:85px;background:#0D9488"></div>'
    '<div class="book" style="left:126px;width:36px;height:92px;background:#F59E0B"></div>'
    '<div class="book" style="left:167px;width:26px;height:99px;background:#2DD4BF"></div>'
    '<div class="book" style="left:198px;width:32px;height:81px;background:#DC5C33"></div>')

def bg_study():
    return f'<div class="wall"></div><div class="teal-band"></div>{SHELF_BOOKS}{WINDOW}{SPARKS}'
def bg_plain():
    return f'<div class="wall"></div><div class="teal-band"></div>{WINDOW}{SPARKS}'
def bg_bare():
    return f'<div class="wall"></div><div class="teal-band"></div>{SPARKS}'

def header(pagetitle, n, total):
    return f'''<div class="header">
      <div class="brand"><img src="assets/logo/lumio-logo.png"><div class="name">Lumio<small>ENGLISH</small></div></div>
      <div class="pagetitle">{pagetitle}</div>
      <div class="counter">{n} / {total}</div>
    </div>'''

COLORSTRIP = '<div class="colorstrip"><div class="c1"></div><div class="c2"></div><div class="c3"></div><div class="c4"></div><div class="c5"></div></div>'

def dots(active_i, count):
    cells = "".join(f'<div class="dot {"on" if i == active_i else ""}"></div>' for i in range(count))
    return f'<div class="dots">{cells}</div>'

def char_img(name, right=95, bottom=42, height=300):
    return (f'<div class="floorshadow" style="right:{right}px;bottom:{bottom-7}px;width:230px;height:36px"></div>'
            f'<img class="char" src="{CHAR}/{name}.png" style="right:{right}px;bottom:{bottom}px;height:{height}px">')

# ---------- slide builders ----------

def slide_title(lesson, num_words):
    subtitle = " &bull; ".join(esc(v["en"]) for v in lesson["vocab"])
    return f'''
    <div style="position:absolute;inset:0;overflow:hidden">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,#FFF3D6 0%,#FDF3E0 100%)"></div>
    <div style="position:absolute;left:80px;top:110px;width:70px;height:70px;border-radius:50%;
      background:#FDD8351F;border:3px solid #FDD835;display:flex;align-items:center;justify-content:center;
      font-size:1.8rem;box-shadow:0 10px 16px rgba(67,48,31,.14)">&#128512;</div><div style="position:absolute;left:1300px;top:90px;width:60px;height:60px;border-radius:50%;
      background:#1E88E51F;border:3px solid #1E88E5;display:flex;align-items:center;justify-content:center;
      font-size:1.5rem;box-shadow:0 10px 16px rgba(67,48,31,.14)">&#128546;</div><div style="position:absolute;left:140px;top:240px;width:50px;height:50px;border-radius:50%;
      background:#F973161F;border:3px solid #F97316;display:flex;align-items:center;justify-content:center;
      font-size:1.3rem;box-shadow:0 10px 16px rgba(67,48,31,.14)">&#128558;</div><div style="position:absolute;left:1240px;top:240px;width:64px;height:64px;border-radius:50%;
      background:#8E24AA1F;border:3px solid #8E24AA;display:flex;align-items:center;justify-content:center;
      font-size:1.6rem;box-shadow:0 10px 16px rgba(67,48,31,.14)">&#128564;</div><div style="position:absolute;left:720px;top:60px;width:46px;height:46px;border-radius:50%;
      background:#0D94881F;border:3px solid #0D9488;display:flex;align-items:center;justify-content:center;
      font-size:1.2rem;box-shadow:0 10px 16px rgba(67,48,31,.14)">&#128525;</div>
    </div>
    {SPARKS}
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div style="position:relative;display:flex;align-items:center;gap:18px;margin-bottom:10px">
        <div style="position:relative">
          <div style="position:absolute;inset:-10px;border-radius:50%;background:radial-gradient(circle,rgba(249,115,22,.35),transparent 70%)"></div>
          <img src="assets/logo/lumio-logo.png" style="position:relative;width:104px;height:104px;border-radius:50%;box-shadow:0 12px 28px rgba(67,48,31,.28);border:6px solid #fff">
        </div>
        <div style="text-align:left">
          <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:3rem;color:#43301F;line-height:1;
                      text-shadow:0 2px 10px rgba(67,48,31,.15)">Lumio</div>
          <div style="display:inline-block;margin-top:6px;background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;
                      font-weight:800;font-size:.82rem;letter-spacing:3px;padding:4px 14px;border-radius:999px">ENGLISH</div>
        </div>
      </div>
      <div style="width:100%;background:linear-gradient(90deg,rgba(127,207,196,0) 0%,#7FCFC4 20%,#7FCFC4 80%,rgba(127,207,196,0) 100%);
                  padding:14px 0;margin:16px 0;box-shadow:0 2px 0 rgba(67,48,31,.08)">
        <h1 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:3.6rem;color:#43301F;margin:0;
                   text-shadow:0 2px 8px rgba(255,255,255,.5)">{esc(lesson["title"])}</h1>
      </div>
      <div style="font-size:1.25rem;color:#8A7160;font-weight:700;margin:10px 0">{subtitle}</div>
      <div style="background:#fff;padding:11px 32px 11px 20px;border-radius:999px;box-shadow:0 8px 18px rgba(67,48,31,.14);margin-top:18px;
                  font-family:'Baloo 2',sans-serif;font-weight:800;color:#0D9488;font-size:1.1rem;display:flex;align-items:center;gap:10px">
        <span style="background:#0D9488;color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;
                     justify-content:center;font-size:.85rem">&#10003;</span>LEVEL 2 &bull; {num_words} new words</div>
    </div>
    <div style="position:absolute;right:25px;bottom:0px;width:420px;height:420px;border-radius:50%;
                background:radial-gradient(circle,rgba(249,115,22,.16),transparent 68%)"></div>
    {char_img("noor-happy", right=95, bottom=40, height=340)}
    '''

def slide_welcome(lesson, n, total, num_words):
    return (bg_study() + header("Welcome to Lumio English", n, total) + COLORSTRIP + f'''
    <div class="card" style="position:absolute;left:46px;top:200px;width:820px;padding:40px 46px;text-align:center">
      <div style="font-size:1.6rem;font-weight:700;color:#43301F;margin-bottom:20px">Hello, little star! &#127775;</div>
      <div style="background:#FFF3D6;border-radius:18px;padding:22px 28px">
        <div style="font-size:.8rem;font-weight:800;color:#C2530A;letter-spacing:1.5px;margin-bottom:6px">TEACHER SAYS</div>
        <div style="font-family:'Baloo 2',sans-serif;font-style:italic;font-weight:700;font-size:1.35rem;color:#43301F">
          &ldquo;Hello! Today we learn {num_words} new words!&rdquo;</div>
      </div>
    </div>
    ''' + char_img("lumi-wave-book"))

def slide_goals(lesson, n, total, num_words):
    items = [f"Say {num_words} new words", f"Practice: {esc(lesson['grammarFocus'])}", "Play games and earn stars &#11088;"]
    rows = "".join(f'''
      <div style="display:flex;align-items:center;gap:16px;padding:13px 0">
        <span style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#FFF3D6,#FFE0B8);color:#C2530A;
                     font-weight:800;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">{i+1}</span>
        <span style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.3rem;color:#43301F">{it}</span>
      </div>''' for i, it in enumerate(items))
    return (bg_study() + header("Today's Goals", n, total) + COLORSTRIP + f'''
    <div class="card" style="position:absolute;left:46px;top:190px;width:820px;padding:36px 42px">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.7rem;color:#43301F;margin-bottom:18px">By the end, you will:</div>
      {rows}
    </div>
    ''' + char_img("sara-explain", bottom=42, height=300))

def slide_warmup(lesson, n, total):
    items = ["Stand up and stretch!", "Say hello to a friend.", "Clap your hands three times!"]
    rows = "".join(f'''
      <div style="display:flex;align-items:center;gap:16px;padding:13px 0">
        <span style="font-size:1.6rem">&#10024;</span>
        <span style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.3rem;color:#43301F">{it}</span>
      </div>''' for it in items)
    return (bg_study() + header("Warm-up", n, total) + COLORSTRIP + f'''
    <div class="card" style="position:absolute;left:46px;top:200px;width:820px;padding:38px 42px">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.8rem;color:#43301F;margin-bottom:20px">Let's get ready!</div>
      {rows}
    </div>
    ''' + char_img("omar-point", bottom=42, height=300))

def slide_recap(prev_words, n, total):
    cards = ""
    for w in prev_words[:3]:
        cards += f'''
        <button onclick="this.querySelector('.recap-answer').style.display='flex';
                       this.querySelector('.recap-question').style.display='none';
                       typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')" style="border:none;cursor:pointer;font-family:inherit;width:230px;height:270px;
                    background:#fff;border-radius:22px;box-shadow:0 14px 28px rgba(67,48,31,.18);padding:18px;
                    display:flex;flex-direction:column;align-items:center;position:relative">
          <div style="width:100%;height:150px;border-radius:16px;overflow:hidden;background:#FFFCF6;border:4px solid #FFE0B8;margin-bottom:12px"><img src="assets/vocab/{slug(w["en"])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
          <div class="recap-question" style="display:flex;flex-direction:column;align-items:center;gap:6px">
            <div style="font-size:.75rem;font-weight:800;color:#F97316;letter-spacing:1px">TAP TO REMEMBER</div>
            <div style="font-size:1.6rem">&#129300;</div>
          </div>
          <div class="recap-answer" style="display:none;flex-direction:column;align-items:center;gap:4px">
            <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.3rem;color:#43301F">{esc(w["en"])}</div>
            <div style="color:#0D9488;font-weight:800;font-size:1rem">{w["ar"]}</div>
          </div>
        </button>'''
    return (bg_plain() + header("Quick Recap &bull; Do you remember?", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:0;right:0;top:190px;display:flex;justify-content:center;gap:28px">{cards}</div>
    <div style="position:absolute;left:0;right:0;bottom:52px;text-align:center;font-family:'Baloo 2',sans-serif;
                font-weight:700;font-size:1.05rem;color:#8A7160">From last lesson &mdash; tap each card to check!</div>
    ''' + char_img("noor-think", right=60, bottom=250, height=200))

def slide_words_today(lesson, n, total, num_words):
    rows = "".join(f'''
      <div style="display:flex;justify-content:space-between;align-items:center;padding:15px 0;border-bottom:1.5px solid #F5EEE1">
        <span style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.4rem;color:#43301F">{esc(w["en"])}</span>
        <span style="font-size:1.25rem;color:#0D9488;font-weight:800">{w["ar"]}</span>
      </div>''' for w in lesson["vocab"])
    return (bg_study() + header("Words for Today", n, total) + COLORSTRIP + f'''
    <div class="card" style="position:absolute;left:46px;top:162px;width:820px;padding:36px 42px;">
      <h1 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.2rem;color:#43301F;margin-bottom:20px;
                 display:flex;align-items:center;gap:14px">
        <span style="background:linear-gradient(135deg,#FFF3D6,#FFE0B8);color:#C2530A;width:58px;height:58px;border-radius:50%;display:flex;
                     align-items:center;justify-content:center;font-size:1.6rem;box-shadow:0 4px 10px rgba(194,83,10,.15)">&#128218;</span>
        {num_words} new words</h1>
      {rows}
    </div>
    ''' + char_img("lumi-wave-book", bottom=42, height=310))

def letter_tiles(word):
    if " " in word or len(word) > 10:
        return ""
    tiles = ""
    for i, ch in enumerate(word):
        color = LETTER_COLORS[i % len(LETTER_COLORS)]
        tiles += f'''
      <div style="width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;
                  font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.35rem;color:#fff;
                  background:{color};
                  box-shadow:0 3px 0 rgba(0,0,0,.14), 0 6px 12px rgba(67,48,31,.16)">{ch.upper()}</div>'''
    return f'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">{tiles}</div>'

def slide_vocab(w, idx, n, total, num_words, ch):
    quote = w.get("example", w["en"])
    return (bg_plain() + header(f"Vocabulary &bull; {esc(w['en'])}", n, total) + dots(idx, num_words) + COLORSTRIP + f'''
    <div class="card" style="position:absolute;left:46px;top:180px;width:450px;padding:24px;background:#fff">
      <div style="width:100%;aspect-ratio:1/1;border-radius:22px;overflow:hidden;margin-bottom:20px;
                     box-shadow:0 12px 26px rgba(67,48,31,.22);border:7px solid #fff;outline:4px solid #FFDCA8;background:#fff">
                     <img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.parentElement.style.background='#FFF3D6'; this.remove()"></div>
      {letter_tiles(w["en"])}
    </div>
    <div class="card" style="position:absolute;left:518px;top:180px;width:620px;padding:36px 42px;">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:3.1rem;color:#43301F">{esc(w["en"])}</div>
      <div style="display:inline-block;margin-top:12px;padding:9px 24px;background:linear-gradient(135deg,#DDF6F0,#C8F0E7);color:#0D9488;
                  border-radius:999px;font-weight:800;font-size:1.15rem">{w["ar"]}</div>
      <div style="border-top:1.5px solid #F5EEE1;margin:24px 0 18px"></div>
      <div style="font-size:.82rem;font-weight:800;color:#F97316;letter-spacing:1.8px;margin-bottom:8px">SAY IT</div>
      <div style="font-family:'Baloo 2',sans-serif;font-style:italic;font-weight:700;font-size:1.4rem;color:#43301F;margin-bottom:24px">&ldquo;{esc(quote)}&rdquo;</div>
      <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')" style="cursor:pointer;border:none;display:inline-block;
                  background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:800;font-family:inherit;
                  padding:15px 32px;border-radius:999px;font-size:1.05rem;box-shadow:0 8px 18px rgba(249,115,22,.4)">&#9654; Listen &rarr; Repeat &times;3</button>
    </div>
    <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}')" style="position:absolute;left:46px;bottom:32px;z-index:20;
                cursor:pointer;border:none;background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:800;font-family:inherit;
                padding:13px 28px;border-radius:999px;font-size:1.02rem;box-shadow:0 8px 18px rgba(249,115,22,.35)">&#9654; Listen</button>
    ''' + char_img(ch, right=84, bottom=28, height=250))

def slide_practice(w, n, total, ch):
    quote = w.get("example", w["en"])
    return (bg_plain() + header(f"Practice &bull; {esc(w['en'])}", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:0;right:0;top:190px;display:flex;justify-content:center;gap:36px">
      <div class="card" style="width:280px;height:280px;overflow:hidden;padding:0"><img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
      <div class="card" style="width:500px;padding:36px 42px;display:flex;flex-direction:column;justify-content:center">
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.7rem;color:#43301F;margin-bottom:14px">Can you say it?</div>
        <div style="font-family:'Baloo 2',sans-serif;font-style:italic;font-weight:700;font-size:1.6rem;color:#F97316">&ldquo;{esc(quote)}&rdquo;</div>
      </div>
    </div>
    ''' + char_img(ch, bottom=32, height=260))

def slide_dialogue(lines, n, total):
    bubbles = ""
    y = 165
    for i, (en, ar) in enumerate(lines):
        left = i % 2 == 0
        side = "left" if left else "right"
        tri = "left" if left else "right"
        bubbles += f'''
        <div style="position:absolute;{side}:150px;top:{y}px;max-width:520px;background:#fff;border-radius:20px;
                    padding:14px 20px;box-shadow:0 10px 22px rgba(67,48,31,.16);z-index:6">
          <div style="position:absolute;top:20px;{tri}:-10px;border-{'right' if left else 'left'}-color:#fff;width:0;height:0;border:10px solid transparent"></div>
          <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.08rem;color:#43301F">{esc(en)}</div>
          <div style="direction:rtl;text-align:right;font-size:.86rem;color:#8A7160;font-weight:700;margin-top:3px">{ar}</div>
        </div>'''
        y += 106 + (0 if i % 2 == 0 else 0)
    y_positions = [165, 271, 378, 484]
    bubbles = ""
    for i, (en, ar) in enumerate(lines):
        left = i % 2 == 0
        side = "left" if left else "right"
        tri = "left" if left else "right"
        bubbles += f'''
        <div style="position:absolute;{side}:150px;top:{y_positions[i]}px;max-width:520px;background:#fff;border-radius:20px;
                    padding:14px 20px;box-shadow:0 10px 22px rgba(67,48,31,.16);z-index:6">
          <div style="position:absolute;top:20px;{tri}:-10px;border-{'right' if left else 'left'}-color:#fff;width:0;height:0;border:10px solid transparent"></div>
          <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.08rem;color:#43301F">{esc(en)}</div>
          <div style="direction:rtl;text-align:right;font-size:.86rem;color:#8A7160;font-weight:700;margin-top:3px">{ar}</div>
        </div>'''
    return (bg_plain() + header("Dialogue &bull; Let's talk!", n, total) + COLORSTRIP + bubbles + f'''
    <img class="char" src="{CHAR}/noor-wave.png" style="left:280px;bottom:0px;height:230px;
        position:absolute;z-index:5;filter:drop-shadow(0 16px 22px rgba(67,48,31,.3))">
    <img class="char" src="{CHAR}/sara-clap.png" style="right:280px;bottom:0px;height:230px;
        position:absolute;z-index:5;filter:drop-shadow(0 16px 22px rgba(67,48,31,.3));transform:scaleX(-1)">
    ''')

def tokenize_sentence(sentence):
    m = re.match(r"^(.*?)([.!?]+)$", sentence.strip())
    if m:
        words, punct = m.group(1).strip(), m.group(2)
    else:
        words, punct = sentence.strip(), ""
    return words.split(" "), punct

def slide_sentence_builder(sentence, n, total, ch):
    words, punct = tokenize_sentence(sentence)
    import random as _r
    order = list(range(len(words)))
    _r.Random(n).shuffle(order)
    slots = "".join(f'<div class="sb-slot" data-index="{i}"></div>' for i in range(len(words)))
    punct_tile = f'<div class="sb-tile sb-punct" style="cursor:default">{punct}</div>' if punct else ""
    tray = "".join(f'<div class="sb-tile" draggable="false" data-word="{esc(words[i])}">{esc(words[i])}</div>' for i in order)
    return (bg_plain() + header("Build the Sentence", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;left:0;right:0;top:190px;text-align:center">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;color:#43301F;margin-bottom:8px">
        Put the words in the right order!</div>
      <div style="font-size:.95rem;color:#8A7160;font-weight:700">Drag the tiles into the boxes below.</div>
    </div>

    <div id="sbSlots" data-correct="{esc(sentence.strip())}" style="position:absolute;left:0;right:0;top:300px;display:flex;justify-content:center;gap:12px;min-height:80px;flex-wrap:wrap">
      {slots}{punct_tile}
    </div>

    <div id="sbTray" style="position:absolute;left:0;right:0;top:430px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;padding:0 60px">
      {tray}
    </div>

    <div id="sbFeedback" style="position:absolute;left:0;right:0;top:560px;text-align:center;font-family:'Baloo 2',sans-serif;
                font-weight:800;font-size:1.3rem;min-height:40px"></div>

    <button onclick="window.checkSentenceBuilder && checkSentenceBuilder()"
            style="position:absolute;left:46px;bottom:32px;z-index:20;cursor:pointer;border:none;font-family:inherit;
            background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:800;padding:13px 28px;border-radius:999px;
            font-size:1.02rem;box-shadow:0 8px 18px rgba(249,115,22,.35)">&#10003; Check my sentence</button>
    ''' + char_img(ch, bottom=24, height=230) + '''
    <style>
      .sb-slot { width:120px; height:64px; border:3px dashed #E5DDD0; border-radius:14px; background:rgba(255,255,255,.5); }
      .sb-slot.sb-filled { border-style:solid; border-color:#FFDCA8; background:#fff; }
      .sb-tile { min-width:90px; height:64px; padding:0 18px; background:#fff; border-radius:14px; display:flex; align-items:center;
                  justify-content:center; font-family:'Baloo 2',sans-serif; font-weight:800; font-size:1.25rem; color:#43301F;
                  box-shadow:0 8px 16px rgba(67,48,31,.18); cursor:grab; touch-action:none; user-select:none; }
      .sb-tile.sb-dragging { opacity:.4; }
      .sb-tile.sb-punct { background:transparent; box-shadow:none; font-size:2rem; min-width:20px; padding:0; }
    </style>
    ''')

def slide_listen_repeat(lesson, n, total, ch):
    rows = "".join(f'''
      <div style="padding:12px 0;border-bottom:1.5px solid #F5EEE1;display:flex;align-items:center;gap:14px">
        <span style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#FFF3D6,#FFE0B8);color:#C2530A;font-weight:800;
                     display:flex;align-items:center;justify-content:center;font-size:.95rem">{i+1}</span>
        <span style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.3rem;color:#43301F">{esc(w["en"])}</span>
      </div>''' for i, w in enumerate(lesson["vocab"]))
    return (bg_study() + header("Listen and Repeat", n, total) + COLORSTRIP + f'''
    <div class="card" style="position:absolute;left:46px;top:162px;width:820px;padding:36px 42px;">
      <h1 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.2rem;color:#43301F;margin-bottom:20px">My turn, your turn!</h1>
      {rows}
    </div>
    ''' + char_img(ch, bottom=42, height=310))

def slide_your_turn(w, idx, total_rounds, n, total, ch):
    return (bg_plain() + header(f"Your Turn &bull; Round {idx} of {total_rounds}", n, total) + COLORSTRIP + f'''
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:40px;padding-bottom:60px">
      <div class="card" style="width:300px;height:300px;overflow:hidden;padding:0"><img src="assets/vocab/{slug(w['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
      <div class="card" style="width:400px;padding:44px 40px;text-align:center">
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.1rem;color:#43301F">What is this?</div>
        <div style="font-size:1rem;color:#8A7160;font-weight:700;margin-top:14px">Ask your student to say it, then tap below to hear it.</div>
      </div>
    </div>
    <button onclick="typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{esc(w["en"])}'); if(typeof Lumio !== 'undefined' && Lumio.confetti) Lumio.confetti(40); this.textContent='{esc(w["en"])} \\u2014 {w["ar"]}'; this.style.background='linear-gradient(135deg,#4ADE80,#16A34A)'"
            style="position:absolute;left:46px;bottom:32px;z-index:20;cursor:pointer;border:none;font-family:inherit;
            background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;font-weight:800;padding:13px 28px;border-radius:999px;
            font-size:1.02rem;box-shadow:0 8px 18px rgba(249,115,22,.35)">&#9654; Reveal answer</button>
    ''' + char_img(ch, bottom=32, height=250))

def slide_quiz(target, distractors, idx, total_q, n, total):
    import random as _r
    opts = distractors + [target]
    _r.Random(n * 7 + idx).shuffle(opts)
    positions = [(610, 260), (890, 260), (610, 364), (890, 364)]
    buttons = ""
    for o, (l, t) in zip(opts, positions):
        buttons += f'''
      <button onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{esc(o["en"])}', '{esc(target["en"])}')"
              style="position:absolute;left:{l}px;top:{t}px;width:260px;height:84px;
                  background:#fff;border:2.5px solid #F0E9DD;border-radius:16px;display:flex;align-items:center;justify-content:center;
                  font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.25rem;color:#43301F;cursor:pointer" data-quiz-option="{esc(o["en"])}">{esc(o["en"])}</button>'''
    return (bg_plain() + header(f"Quiz &bull; {idx}/{total_q}", n, total) + COLORSTRIP + f'''
    <div class="card" style="position:absolute;left:280px;top:190px;width:280px;height:280px;overflow:hidden;padding:0"><img src="assets/vocab/{slug(target['en'])}.png" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'"></div>
    <div style="position:absolute;left:610px;top:190px;width:540px;font-family:'Baloo 2',sans-serif;font-weight:800;
                font-size:1.9rem;color:#43301F">What is this?</div>
    {buttons}
    ''')

def slide_reward(n, total):
    return (bg_plain() + header("Reward Time", n, total) + COLORSTRIP + '''
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div style="font-size:5rem;margin-bottom:10px">&#127881;</div>
      <h1 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2.6rem;color:#43301F;margin-bottom:14px">Great job!</h1>
      <div style="font-size:2.4rem;letter-spacing:6px;margin-bottom:16px">&#11088;&#11088;&#11088;&#11088;&#11088;</div>
      <div style="background:#fff;padding:12px 30px;border-radius:999px;box-shadow:0 8px 18px rgba(67,48,31,.14);
                  font-family:'Baloo 2',sans-serif;font-weight:800;color:#0D9488;font-size:1.2rem">You earned 5 stars!</div>
    </div>
    ''' + char_img("noor-happy", right=110, bottom=54, height=330))

def slide_homework(num, n, total):
    items = [f"Play Lesson {num} on Lumio English", "Finish your homework sheet", "Say each word to your family"]
    rows = "".join(f'''
      <div style="display:flex;align-items:center;gap:16px;padding:12px 0">
        <span style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#DDF6F0,#C8F0E7);color:#0D9488;
                     font-weight:800;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">{i+1}</span>
        <span style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.3rem;color:#43301F">{it}</span>
      </div>''' for i, it in enumerate(items))
    return (bg_bare() + header("Homework &amp; Goodbye", n, total) + COLORSTRIP + f'''
    <div class="card" style="position:absolute;left:46px;top:170px;width:820px;padding:32px 42px">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.6rem;color:#43301F;margin-bottom:16px">See you next time!</div>
      {rows}
      <div style="margin-top:18px;padding-top:16px;border-top:1.5px solid #F5EEE1;font-family:'Baloo 2',sans-serif;
                  font-style:italic;font-weight:700;font-size:1.15rem;color:#F97316">&ldquo;You worked hard today &mdash; be proud of yourself!&rdquo;</div>
    </div>
    <div style="position:absolute;right:70px;bottom:30px;display:flex;gap:-20px">
      <div class="floorshadow" style="right:280px;bottom:-7px;width:230px;height:36px"></div>
    <img class="char" src="{CHAR}/lumi-wave-book.png" style="right:280px;bottom:0px;height:260px">
      <div class="floorshadow" style="right:140px;bottom:-7px;width:230px;height:36px"></div>
    <img class="char" src="{CHAR}/sara-explain.png" style="right:140px;bottom:0px;height:260px">
      <div class="floorshadow" style="right:10px;bottom:-7px;width:230px;height:36px"></div>
    <img class="char" src="{CHAR}/omar-wave.png" style="right:10px;bottom:0px;height:260px">
    </div>''')

# ---------- deck assembly ----------

def build_deck(lesson_num, lesson, prev_lesson):
    V = len(lesson["vocab"])
    slides = []  # list of html strings, filled in two passes (need total first)

    def add(builder_fn):
        slides.append(builder_fn)

    plan = []
    plan.append(("title", None))
    plan.append(("welcome", None))
    plan.append(("goals", None))
    plan.append(("warmup", None))
    if prev_lesson:
        plan.append(("recap", None))
    plan.append(("words_today", None))
    for i, w in enumerate(lesson["vocab"]):
        plan.append(("vocab", (w, i)))
        plan.append(("practice", (w, i)))
    plan.append(("dialogue", None))
    plan.append(("sentence", None))
    plan.append(("listen_repeat", None))
    your_turn_n = min(3, V)
    for i in range(your_turn_n):
        plan.append(("your_turn", (lesson["vocab"][i], i + 1)))
    plan.append(("quiz", 1))
    plan.append(("quiz", 2))
    plan.append(("reward", None))
    plan.append(("homework", None))

    total = len(plan)
    html_slides = []
    for pos, (kind, data) in enumerate(plan):
        n = pos + 1
        if kind == "title":
            html_slides.append(slide_title(lesson, V))
        elif kind == "welcome":
            html_slides.append(slide_welcome(lesson, n, total, V))
        elif kind == "goals":
            html_slides.append(slide_goals(lesson, n, total, V))
        elif kind == "warmup":
            html_slides.append(slide_warmup(lesson, n, total))
        elif kind == "recap":
            html_slides.append(slide_recap(prev_lesson["vocab"], n, total))
        elif kind == "words_today":
            html_slides.append(slide_words_today(lesson, n, total, V))
        elif kind == "vocab":
            w, i = data
            ch = VOCAB_CHARS[i % len(VOCAB_CHARS)]
            html_slides.append(slide_vocab(w, i, n, total, V, ch))
        elif kind == "practice":
            w, i = data
            ch = VOCAB_CHARS[i % len(VOCAB_CHARS)]
            html_slides.append(slide_practice(w, n, total, ch))
        elif kind == "dialogue":
            html_slides.append(slide_dialogue(DIALOGUES[lesson_num], n, total))
        elif kind == "sentence":
            html_slides.append(slide_sentence_builder(lesson["vocab"][0]["example"], n, total, "sara-teach-board"))
        elif kind == "listen_repeat":
            html_slides.append(slide_listen_repeat(lesson, n, total, "sara-clap"))
        elif kind == "your_turn":
            w, idx = data
            html_slides.append(slide_your_turn(w, idx, your_turn_n, n, total, "omar-wave"))
        elif kind == "quiz":
            idx = data
            target = lesson["vocab"][1 if idx == 1 else min(3, V - 1)]
            distractors = [x for x in lesson["vocab"] if x["en"] != target["en"]][:3]
            html_slides.append(slide_quiz(target, distractors, idx, 2, n, total))
        elif kind == "reward":
            html_slides.append(slide_reward(n, total))
        elif kind == "homework":
            html_slides.append(slide_homework(lesson_num, n, total))

    return html_slides


def main():
    lesson_files = sorted(glob.glob(f"lessons/{LEVEL}/lesson*.json"))
    lessons = {}
    for f in lesson_files:
        d = json.load(open(f, encoding="utf-8"))
        lessons[d["number"]] = d

    manifest = {}
    for num in sorted(lessons):
        lesson = lessons[num]
        prev_lesson = lessons.get(num - 1)
        html_slides = build_deck(num, lesson, prev_lesson)
        nn = f"{num:02d}"
        lesson_dir = os.path.join(OUT_DIR, nn)
        os.makedirs(lesson_dir, exist_ok=True)
        for i, html in enumerate(html_slides, start=1):
            path = os.path.join(lesson_dir, f"slide-{i:02d}.html")
            with open(path, "w", encoding="utf-8") as f:
                f.write(html)
        manifest[nn] = len(html_slides)
        print(f"Lesson {nn}: {len(html_slides)} slides")

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=0)
    print("Manifest written:", MANIFEST_PATH)

if __name__ == "__main__":
    main()
