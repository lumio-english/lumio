# -*- coding: utf-8 -*-
"""
Grammar rule-teaching slides, shared by the Level 3+ deck generators.
Mirrors the phonics slide pair (explain slide + practice slide) added
to Level 1 & 2, but sourced from grammar-hub/{level}.json instead.
"""
import json


def esc(s):
    return (s or "").replace("&", "&amp;").replace('"', "&quot;")


def match_grammar_by_lesson_focus(level, lessons):
    """For curricula where each lesson's own grammarFocus field names a
    specific grammar-hub topic (rather than relying on generic even
    spacing), match by word-overlap score against the FULL topic title
    (not just a shared prefix -- 'Present Simple (he/she/it+s)' and
    'Present Simple (I/you/we/they)' share a prefix but are different
    topics, so prefix-only matching picks the wrong one every time).
    Lessons whose focus doesn't cleanly match a topic (e.g. 'review'
    lessons) get none -- better than forcing a mismatched topic."""
    import re
    data = json.load(open(f"grammar-hub/{level}.json", encoding="utf-8"))
    topics = data["topics"]

    def words(s):
        return set(re.findall(r"[a-z']+", s.lower()))

    mapping = {}
    for lesson_num, lesson in lessons.items():
        focus = (lesson.get("grammarFocus") or "").lower()
        if not focus or "review" in focus:
            continue
        focus_words = words(focus)
        best, best_score = None, 0
        for t in topics:
            t_words = words(t["title"])
            score = len(focus_words & t_words)
            if score > best_score:
                best, best_score = t, score
        if best and best_score >= 2:  # require at least 2 shared significant words
            mapping[lesson_num] = best
    return mapping


def compute_grammar_lesson_map(level, num_lessons=20):
    """Spread every grammar-hub topic evenly across the level's lessons,
    returning {lesson_num: topic_dict}. With 13 topics over 20 lessons
    this lands on lessons 1,3,4,6,7,9,10,12,14,15,17,18,20."""
    data = json.load(open(f"grammar-hub/{level}.json", encoding="utf-8"))
    topics = data["topics"]
    n = len(topics)
    mapping = {}
    for i, topic in enumerate(topics):
        lesson_num = round(1 + i * (num_lessons - 1) / (n - 1)) if n > 1 else 1
        mapping[lesson_num] = topic
    return mapping


def slide_grammar_rule(topic, n, total, ch, header_fn, colorstrip, bg_study_fn, char_img_fn):
    examples = topic.get("examples", [])
    first_two = examples[:2]
    # Optional "rules": a list of sub-rules, each {en, ar, examples:[str]} --
    # used for lessons with several cases to cover on one slide (Plurals:
    # -s, -es, -y -> -ies, irregular). Scrolls inside the card if long.
    rule_blocks = ""
    if topic.get("rules"):
        blocks = "".join(f'''
        <div style="background:#fff;border-radius:12px;padding:10px 14px;margin-bottom:8px">
          <div style="font-size:.9rem;color:#43301F;font-weight:800">{esc(r["en"])}</div>
          <div style="direction:rtl;text-align:right;font-size:.8rem;color:#8A7160;font-weight:700;margin:2px 0 4px">{r["ar"]}</div>
          <div style="font-size:.85rem;color:#0D9488;font-weight:700">{" &bull; ".join(esc(x).replace("->", "&rarr;") for x in r.get("examples", []))}</div>
        </div>''' for r in topic["rules"])
        rule_blocks = f'<div style="max-height:300px;overflow-y:auto;padding-right:6px">{blocks}</div>'
    ex_cards = "".join(f'''
      <div style="background:#fff;border-radius:12px;padding:10px 16px;margin-bottom:8px">
        <div style="font-size:.92rem;color:#43301F;font-weight:700">{esc(ex["en"])}</div>
        <div style="direction:rtl;text-align:right;font-size:.82rem;color:#8A7160;font-weight:700;margin-top:2px">{ex["ar"]}</div>
      </div>''' for ex in first_two)
    return (bg_study_fn() + header_fn("Grammar Time! &#128221;", n, total) + colorstrip + f'''
    <div class="card" style="position:absolute;left:46px;top:150px;width:820px;padding:30px 36px">
      <div style="font-size:.78rem;font-weight:800;color:#0D9488;letter-spacing:1.5px;margin-bottom:8px">TEACHER: EXPLAIN THIS RULE</div>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;color:#43301F;margin-bottom:2px">{esc(topic["title"])}</div>
      <div style="direction:rtl;text-align:right;font-size:.9rem;color:#8A7160;font-weight:700;margin-bottom:14px">{topic["titleAr"]}</div>
      <div style="font-size:.9rem;color:#43301F;line-height:1.6;margin-bottom:6px">{esc(topic["explanation"])}</div>
      <div style="direction:rtl;text-align:right;font-size:.85rem;color:#8A7160;line-height:1.6;margin-bottom:16px">{topic["explanationAr"]}</div>
      {rule_blocks or ex_cards}
    </div>
    ''' + char_img_fn(ch, bottom=42, height=310))


def slide_grammar_practice(topic, n, total, ch, header_fn, colorstrip, bg_plain_fn, char_img_fn):
    """Read & Repeat: the rule on the left (title, pattern, 3 steps), up to
    four numbered example sentences on the right, each with its own
    Listen button (EN + AR). Same layout on kid and teen decks -- the
    header/background functions carry the theme."""
    examples = topic.get("examples", [])[:4]
    rows = ""
    for i, ex in enumerate(examples, 1):
        en = ex["en"]; ar = ex.get("ar", "")
        rows += f'''
        <div style="display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:14px;background:#FFFCF6;border:1.5px solid #F0E6D6">
          <div style="width:34px;height:34px;border-radius:50%;background:#F97316;color:#fff;font-weight:800;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Baloo 2',sans-serif">{i}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.12rem;color:#43301F;line-height:1.25">{esc(en)}</div>
            <div style="direction:rtl;text-align:right;font-size:.86rem;color:#8A7160;font-weight:700;margin-top:3px">{ar}</div>
          </div>
          <button onclick="typeof Lumio!=='undefined' && Lumio.speak && Lumio.speak({esc(json.dumps(en))})" title="Listen"
                  style="cursor:pointer;border:none;width:42px;height:42px;border-radius:50%;background:#0D9488;color:#fff;font-size:1.05rem;flex-shrink:0;box-shadow:0 4px 10px rgba(13,148,136,.3)">&#128266;</button>
        </div>'''
    steps = "".join(f'<div style="display:flex;align-items:center;gap:10px;margin-top:8px"><div style="width:26px;height:26px;border-radius:50%;background:{c};color:#fff;font-weight:800;font-size:.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">{k}</div><div style="font-weight:800;font-size:.88rem;color:#43301F">{t}<span style="display:block;font-weight:700;font-size:.76rem;color:#8A7160">{a}</span></div></div>'
                    for k, c, t, a in [(1, "#0D9488", "Listen", "استمعوا"), (2, "#F97316", "Repeat together", "ردّدوا معاً"), (3, "#2451B8", "Say it on your own", "قولوها بمفردكم")])
    return (bg_plain_fn() + header_fn("Grammar Practice &bull; Read &amp; Repeat", n, total) + colorstrip + f'''
    <div style="position:absolute;left:46px;right:46px;top:132px;bottom:70px;display:flex;gap:22px;z-index:5">
      <div style="width:380px;flex-shrink:0;background:#fff;border-radius:20px;padding:22px 24px;box-shadow:0 10px 24px rgba(67,48,31,.14);display:flex;flex-direction:column">
        <div style="font-size:.7rem;font-weight:800;letter-spacing:1.5px;color:#F97316">THE PATTERN</div>
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.3rem;color:#43301F;line-height:1.15;margin-top:4px">{esc(topic.get("title", ""))}</div>
        <div style="direction:rtl;text-align:right;font-weight:800;font-size:.95rem;color:#8A7160;margin-top:2px">{topic.get("titleAr", "")}</div>
        <div style="margin-top:12px;padding:12px 14px;border-radius:12px;background:#FFF3D6;font-weight:700;font-size:.9rem;color:#43301F;line-height:1.4">{esc(topic.get("explanation", ""))}
          <div style="direction:rtl;text-align:right;font-size:.84rem;color:#8A7160;margin-top:4px">{topic.get("explanationAr", "")}</div></div>
        <div style="margin-top:16px;padding-top:12px;border-top:1.5px dashed #F0E6D6"><div style="font-size:.7rem;font-weight:800;letter-spacing:1.5px;color:#2451B8;margin-bottom:4px">HOW WE PRACTISE</div>{steps}</div>
      </div>
      <div style="flex:1;background:#fff;border-radius:20px;padding:18px 20px;box-shadow:0 10px 24px rgba(67,48,31,.14);display:flex;flex-direction:column;gap:10px;overflow:hidden">
        <div style="font-size:.7rem;font-weight:800;letter-spacing:1.5px;color:#0D9488;margin-bottom:2px">READ &amp; REPEAT &middot; اقرؤوا وردّدوا</div>
        {rows}
        <div style="margin-top:auto;display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:14px;background:linear-gradient(135deg,#E6FBF8,#DDF6F0);border:1.5px solid #BFEFE6">
          <div style="font-size:1.5rem">&#128172;</div>
          <div style="flex:1">
            <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.02rem;color:#0F766E">Now you &mdash; make one NEW sentence with this pattern.</div>
            <div style="font-size:.8rem;color:#4B6B66;font-weight:700;margin-top:2px">Pairs: say it to your partner, who repeats it back. &nbsp;1-on-1: say it to your teacher, then swap &mdash; the teacher says one, you repeat.
              <span style="display:block;direction:rtl;text-align:right;color:#8A7160">الآن دوركم: كوّنوا جملة جديدة بنفس القاعدة.</span></div>
          </div>
        </div>
      </div>
    </div>
    ''')


def slide_grammar_mcq(topic, q, idx, total_q, n, total, ch, header_fn, colorstrip, bg_plain_fn, char_img_fn):
    """One multiple-choice question per slide, for in-class application
    after the rule + practice slides (e.g. 10 telling-time questions).
    q = {"q": str, "qAr": str (optional), "options": [4 str], "answer": str}."""
    correct = q["answer"]
    positions = [(120, 300), (470, 300), (120, 400), (470, 400)]
    buttons = "".join(f'''
      <button onclick="window.checkQuizAnswer && checkQuizAnswer(this, '{esc(o)}', '{esc(correct)}')"
              style="position:absolute;left:{l}px;top:{t}px;width:330px;height:80px;background:#fff;border:3px solid #F0E9DD;border-radius:16px;
                     padding:8px 14px;cursor:pointer;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.05rem;color:#43301F;text-align:center" data-quiz-option="{esc(o)}">{esc(o)}</button>'''
        for o, (l, t) in zip(q["options"], positions))
    q_ar = f'<div style="direction:rtl;text-align:right;font-size:.9rem;color:#8A7160;font-weight:700;margin-top:6px">{q["qAr"]}</div>' if q.get("qAr") else ""
    return (bg_plain_fn() + header_fn(f"{esc(topic['title'])} &bull; Question {idx}/{total_q}", n, total) + colorstrip + f'''
    <div class="card" style="position:absolute;left:100px;top:150px;width:730px;padding:20px 26px">
      <div style="font-size:.78rem;font-weight:800;color:#0D9488;letter-spacing:1.5px;margin-bottom:6px">APPLY IT</div>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.25rem;color:#43301F">{esc(q["q"])}</div>
      {q_ar}
    </div>
    {buttons}
    <div id="quizFeedback" style="position:absolute;left:0;right:0;top:500px;text-align:center;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.1rem;color:#0D9488"></div>
    ''' + char_img_fn(ch, right=40, bottom=40, height=260))
