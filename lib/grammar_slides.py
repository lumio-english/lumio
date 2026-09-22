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
    examples = topic.get("examples", [])
    last_two = examples[2:4] or examples[:2]
    cards = "".join(f'''
      <div style="background:#fff;border-radius:16px;padding:20px 24px;box-shadow:0 8px 16px rgba(67,48,31,.14);max-width:560px">
        <div style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.1rem;color:#43301F">{esc(ex["en"])}</div>
        <div style="direction:rtl;text-align:right;font-size:.88rem;color:#8A7160;font-weight:700;margin-top:6px">{ex["ar"]}</div>
      </div>''' for ex in last_two)
    return (bg_plain_fn() + header_fn("Grammar Practice &bull; Read &amp; Repeat", n, total) + colorstrip + f'''
    <div style="position:absolute;left:0;right:0;top:180px;text-align:center;font-family:'Baloo 2',sans-serif;font-weight:700;
                font-size:1.05rem;color:#8A7160;margin-bottom:10px">Read each sentence together, then say it on your own!</div>
    <div style="position:absolute;left:0;right:0;top:250px;display:flex;flex-direction:column;gap:16px;align-items:center;padding:0 60px">
      {cards}
    </div>
    ''' + char_img_fn(ch, bottom=42, height=300))


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
