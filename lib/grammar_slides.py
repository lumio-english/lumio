# -*- coding: utf-8 -*-
"""
Grammar rule-teaching slides, shared by the Level 3+ deck generators.
Mirrors the phonics slide pair (explain slide + practice slide) added
to Level 1 & 2, but sourced from grammar-hub/{level}.json instead.
"""
import json


def esc(s):
    return (s or "").replace("&", "&amp;").replace('"', "&quot;")


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
      {ex_cards}
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
