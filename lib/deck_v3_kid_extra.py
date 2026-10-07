# -*- coding: utf-8 -*-
"""Class slides v3/v5, kids: the less frequent slide types (grammar rule / practice / question, common mistakes,
quick break, describing time, meet the team, skills checkpoint, Let's Move). Installed by deck_v3_kid.install()."""
import json as _json

import deck_template_v2 as T
from deck_v3_kid import _bg, header, char_img, prompt, ico, esc, jsq, CHAR


def g_rule(topic, n, total, ch, header_fn=None, colorstrip="", bg_fn=None, char_fn=None):
    if topic.get("rules"):
        right = "".join(
            f'<div class="v3t-rule"><div class="en">{esc(r["en"])}</div><div class="ar" dir="rtl">{r["ar"]}</div>'
            f'<div class="ex">{" &bull; ".join(esc(x).replace("->", "&rarr;") for x in r.get("examples", []))}</div></div>'
            for r in topic["rules"])
    else:
        right = "".join(f'<div class="v3t-ex"><div class="en">{esc(ex["en"])}</div><div class="ar" dir="rtl">{ex["ar"]}</div></div>'
                        for ex in topic.get("examples", [])[:2])
    return _bg() + header("Grammar Time! &#128221;", n, total) + f'''
    <div class="v3-paper" style="left:60px;top:140px;width:640px;bottom:70px;padding:36px 42px">
      <div class="v3-label t">{ico("puzzle")} Teacher: explain this rule</div>
      <div class="v3-word m" style="font-size:3.4rem;margin:14px 0 4px">{esc(topic["title"])}</div>
      <div class="v3-arline">{topic["titleAr"]}</div>
      <div class="v3-hr"></div>
      <div class="v3t-expl">{esc(topic["explanation"])}</div>
      <div class="v3-arline" style="margin-top:8px">{topic["explanationAr"]}</div>
    </div>
    <div class="v3-paper" style="left:730px;width:440px;top:140px;bottom:70px;padding:32px 30px;display:flex;flex-direction:column">
      <div class="v3-label">{ico("speech")} Examples</div>
      <div class="v3t-exwrap">{right}</div>
    </div>''' + char_img(ch, right=20, bottom=30, height=230)


def g_practice(topic, n, total, ch, header_fn=None, colorstrip="", bg_fn=None, char_fn=None):
    rows = ""
    for i, ex in enumerate(topic.get("examples", [])[:4], 1):
        en = ex["en"]; ar = ex.get("ar", "")
        rows += (f'<div class="v3t-rr"><div class="k">{i}</div><div style="flex:1;min-width:0"><div class="en">{esc(en)}</div>'
                 f'<div class="ar" dir="rtl">{ar}</div></div>'
                 f'<button class="v3-btn teal round s" onclick="typeof Lumio!==\'undefined\' && Lumio.speak && Lumio.speak({esc(_json.dumps(en))})" title="Listen">&#128266;</button></div>')
    steps = "".join(f'<div class="v3t-step"><div class="k">{k}</div><div>{t}<span>{a}</span></div></div>'
                    for k, t, a in [(1, "Listen", "استمعوا"), (2, "Repeat together", "ردّدوا معاً"), (3, "Say it on your own", "قولوها بمفردكم")])
    return _bg() + header("Grammar Practice &bull; Read &amp; Repeat", n, total) + f'''
    <div class="v3-paper" style="left:50px;top:132px;width:420px;bottom:70px;padding:28px 30px;display:flex;flex-direction:column">
      <div class="v3-label">The pattern</div>
      <div class="v3-word m" style="font-size:2.5rem;margin-top:8px">{esc(topic.get("title", ""))}</div>
      <div class="v3-arline">{topic.get("titleAr", "")}</div>
      <div class="v3t-expl s" style="margin-top:12px">{esc(topic.get("explanation", ""))}<div class="v3-arline" style="font-size:1rem;margin-top:4px">{topic.get("explanationAr", "")}</div></div>
      <div class="v3-hr" style="margin:16px 0 8px"></div>
      <div class="v3-label t">How we practise</div>{steps}
    </div>
    <div class="v3-paper" style="left:500px;right:50px;top:132px;bottom:70px;padding:26px 30px;display:flex;flex-direction:column;gap:12px">
      <div class="v3-label t">Read &amp; Repeat &middot; اقرؤوا وردّدوا</div>
      {rows}
      <div class="v3t-now"><div class="t">Now you &mdash; make one NEW sentence with this pattern.</div>
        <div class="s">Pairs: say it to your partner, who repeats it back. &nbsp;1-on-1: say it to your teacher, then swap &mdash; the teacher says one, you repeat.
          <span dir="rtl">الآن دوركم: كوّنوا جملة جديدة بنفس القاعدة.</span></div></div>
    </div>'''


def g_mcq(topic, q, idx, total_q, n, total, ch, header_fn=None, colorstrip="", bg_fn=None, char_fn=None):
    correct = q["answer"]
    buttons = "".join(
        f'<button class="v3-opt" data-letter="{"ABCD"[i]}" data-quiz-option="{esc(o)}" '
        f'onclick="window.checkQuizAnswer && checkQuizAnswer(this, \'{jsq(o)}\', \'{jsq(correct)}\')">{esc(o)}</button>'
        for i, o in enumerate(q["options"]))
    q_ar = f'<div class="v3-arline" style="margin-top:6px">{q["qAr"]}</div>' if q.get("qAr") else ""
    return _bg() + header(f"{esc(topic['title'])} &bull; Question {idx}/{total_q}", n, total) + f'''
    <div class="v3-paper" style="left:90px;width:900px;top:140px;padding:30px 38px">
      <div class="v3-label t">{ico("question")} Apply it</div>
      <div class="v3-quote" style="font-size:2.2rem;margin-top:10px">{esc(q["q"])}</div>{q_ar}
    </div>
    <div class="v3-opts" style="left:90px;width:900px;top:{360 if q.get("qAr") else 330}px;grid-template-columns:1fr 1fr">{buttons}</div>
    <div id="quizFeedback" style="position:absolute;left:0;right:0;top:640px;text-align:center;font-weight:900;font-size:1.2rem;color:var(--teal-d)"></div>
    ''' + char_img(ch, right=40, bottom=40, height=260)


def slide_common_mistakes_kid(mistakes, topic_title, n, total, ch):
    rows = ""
    for i, (wrong, right, why_en, why_ar) in enumerate(mistakes[:3], 1):
        rows += f'''<div class="v3-paper v3t-mist">
          <div class="top"><div class="k">{i}</div><div class="wrong"><span class="tag">{ico("warn")}</span>{esc(wrong)}</div>
            <button class="v3-btn s ghost" onclick="var f=document.getElementById('cmFix{i}');f.style.display='block';this.style.display='none'">Show the fix</button></div>
          <div id="cmFix{i}" style="display:none" class="fix">
            <div class="right"><span class="tag">{ico("check")}</span>{esc(right)}</div>
            <div class="why"><div>{ico("bulb")}{esc(why_en)}</div><div dir="rtl" class="ar">{why_ar}</div></div>
          </div></div>'''
    return _bg() + header("Common Mistakes", n, total) + prompt(
        f"{esc(topic_title)} &middot; Find the mistake, then tap to check.", 118,
        "Pairs: who spots it first? &middot; 1-on-1: say the correct sentence before you reveal it.") + f'''
    <div class="v3t-mists">{rows}</div>''' + char_img(ch, right=20, bottom=30, height=150)


def slide_review_break(progress, n, total, ch):
    done, out_of = progress
    pct = round(done / out_of * 100)
    a_en, a_ar = T.REVIEW_BREAK_ACTIVITIES[(done // 9 - 1) % len(T.REVIEW_BREAK_ACTIVITIES)]
    return _bg() + header("Quick Break! &#127881;", n, total) + f'''
    <div class="v3-paper" style="left:233px;width:1000px;top:150px;padding:44px 56px;text-align:center">
      <div class="v3-word m">You're doing great!</div>
      <div class="v3-quote" style="color:var(--orange-d);margin:10px 0 22px">{done} of {out_of} words done &bull; {pct}%</div>
      <div class="v3t-bar" style="height:16px;border-radius:999px;overflow:hidden;background:rgba(0,0,0,.08)"><div style="width:{pct}%;border-radius:999px;background:linear-gradient(90deg,#FFA43A,#F2600C)"></div></div>
      <div class="v3-hr"></div>
      <div class="v3-label t" style="justify-content:center">Quick break</div>
      <div class="v3-quote" style="font-size:2rem;margin-top:8px">{a_en}</div>
      <div class="v3-arline" style="text-align:center">{a_ar}</div>
    </div>''' + char_img(ch, bottom=24, height=230)


def slide_describing_time(image_rel_path, n, total):
    return f'''<div class="v3-bg" style="background-image:url('{image_rel_path}')"></div>
    <div class="v3-shade" style="background:linear-gradient(180deg,rgba(20,10,0,.55),rgba(20,10,0,0) 28%)"></div>
    {header("Describing Time", n, total)}
    ''' + prompt("Look at the picture. What do you see? Describe it in English!", 122)


def slide_meet_the_team(n, total):
    cards = ""
    for img, nm, line in T.MEET_THE_TEAM_CAST:
        cards += (f'<div class="v3t-member"><div class="pic"><img class="char" src="{CHAR}/{img}.png" alt="" onerror="this.style.display=\'none\'"></div>'
                  f'<div class="v3-paper v3t-plate"><div class="nm">{esc(nm)}</div><div class="ln">{esc(line)}</div></div></div>')
    return _bg() + header("Meet Your Friends!", n, total) + prompt("These friends will help you learn English!", 122) + f'<div class="v3t-squad" style="top:220px">{cards}</div>'


def slide_skills_check(skills, n, total, ch="lumi-celebrate"):
    ICON = {"listening": "sound", "speaking": "speech", "reading": "book", "writing": "pencil"}
    cards = "".join(
        f'<div class="v3-paper" style="position:relative;padding:20px 24px;display:flex;gap:16px;align-items:flex-start">'
        f'{ico(ICON[k])}<div><div class="v3-label">{k.title()}</div>'
        f'<div class="v3-quote" style="font-size:1.4rem;margin-top:4px">{esc(skills[k])}</div></div></div>'
        for k in ("listening", "speaking", "reading", "writing"))
    return _bg() + header("Your Skills Checkpoint! &#127775;", n, total) + prompt("Look how far you've come! Here's what you can do now:", 122) + f'''
    <div style="position:absolute;left:70px;width:900px;top:210px;display:grid;grid-template-columns:1fr 1fr;gap:18px;z-index:8">{cards}</div>''' + char_img(ch, right=40, bottom=20, height=260)


def slide_tpr_activity(instruction, n, total, ch):
    return _bg() + header("Let's Move!", n, total) + f'''
    <div class="v3-paper" style="left:120px;width:880px;top:220px;padding:46px 52px;text-align:center">
      <div class="v3-label t" style="justify-content:center">{ico("people")} Everybody, stand up!</div>
      <div class="v3-quote" style="font-size:2.8rem;margin-top:14px">{instruction}</div>
    </div>''' + char_img(ch, bottom=42, height=280)
