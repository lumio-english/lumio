# -*- coding: utf-8 -*-
"""Bonus Class decks (v5 look): one deck per bonus-classes/<level>/bonusNN.json.

The class file's "deck" list says which slides to show; each entry has a "type" (see BUILDERS) and an
optional "ribbon" ("Section · title": the part before " · " picks the Live Class chapter card in
js/slide-motion.js). Cover, goals, exit ticket and homework slides are built from the class data itself.
Kids (Pre-A, L1, L2) get the v3-kid storybook glass, teens (L3-L6) the v3-teen black + gold; the bonus-only
pieces are styled in css/bonus-slides.css. All interaction is inline onclick (slides cannot carry <script>):
Lumio.speak for sound, checkQuizAnswer (present.html) for one-answer quizzes, class toggles for reveals.
"""
import html as _html
import re
_re = re

CHAR = "assets/story/characters"
W, H = 1467, 825
TEEN_LEVELS = {"level3", "level4", "level5", "level6"}


def esc(s):
    return _html.escape(str(s if s is not None else ""), quote=True)


def jsq(s):
    return str(s).replace("\\", "\\\\").replace("'", "\\'").replace('"', "&quot;").replace("\n", " ")


def ico(name):
    return f'<i class="v3-ico" data-ico="{name}"></i>'


def speak_js(text):
    """'/a/' plays the recorded phonics sound (assets/audio/phonics-sound-a.mp3); anything else is spoken."""
    t = str(text)
    if len(t) > 2 and t.startswith("/") and t.endswith("/"):
        return f"typeof Lumio !== 'undefined' && Lumio.speakPhonicsSound && Lumio.speakPhonicsSound('{jsq(t[1:-1])}')"
    return f"typeof Lumio !== 'undefined' && Lumio.speak && Lumio.speak('{jsq(t)}')"


def speak_btn(text, cls="s"):
    return f'<button class="v3-btn teal round {cls} bx-say" onclick="{speak_js(text)}" aria-label="Listen">{ico("sound")}</button>'


# English inside an Arabic line (examples like "Noor is shy", "-s", "Wh-") is isolated left-to-right,
# otherwise the browser's bidi reordering scrambles the words and brackets.
_LATIN = _re.compile(r"-?[A-Za-z][A-Za-z0-9 '\u2019/+\-.,?!…]*[A-Za-z0-9?!'\u2019\-]|-?[A-Za-z]")


def ar_html(text):
    out, pos, t = [], 0, str(text)
    for m in _LATIN.finditer(t):
        out.append(esc(t[pos:m.start()]) + f'<bdi dir="ltr">{esc(m.group(0))}</bdi>')
        pos = m.end()
    return "".join(out) + esc(t[pos:])


def ar(text, cls="bx-ar"):
    return f'<div class="{cls}" dir="rtl">{ar_html(text)}</div>' if text else ""


def fit(text, base, limit):
    """A smaller font for text longer than `limit` characters (style attribute, or "")."""
    n = len(str(text))
    return "" if n <= limit else f' style="font-size:{max(1.15, round(base * (limit / n) ** 0.5, 2))}rem"'


def longest(items):
    return max(len(str(it.get("prompt", ""))) + len(str(it.get("answer", ""))) for it in items)


def et_cols(items):
    n = len(items)
    return 3 if longest(items) > 70 and n > 3 else min(n, 5)


def level_name(level):
    return level.replace("level", "Level ").replace("pre-a", "Pre-A")


class Deck:
    def __init__(self, d):
        self.d = d
        self.level = d["level"]
        self.teen = self.level in TEEN_LEVELS
        self.n = d["bonusNumber"]
        self.slides = []          # (ribbon, inner_html, wants_header)

    # ------------------------------------------------------------ shell
    def wrap(self, inner, ribbon, idx, total, header=True):
        kind = "v3-teen" if self.teen else "v3-kid"
        bg = (f'<div class="v3-bg v3-mesh m{(self.n + 1) % 4}"></div><div class="v3-shade"></div>')
        top = ""
        if header:
            parts = re.split(r"\s*·\s*", ribbon or "", maxsplit=1)
            title = (f'<b>{esc(parts[0])}</b> &middot; <i>{esc(parts[1])}</i>' if len(parts) == 2
                     else f'<b>{esc(ribbon)}</b>') if ribbon else ""
            rib = f'<div class="pagetitle v3-ribbon">{title}</div>' if ribbon else "<div></div>"
            top = (f'<div class="v3-top"><div class="v3-lesson"><img src="assets/logo/lumio-logo.png" alt="Lumio English">'
                   f'<span><small>{level_name(self.level)}</small>Bonus Class {self.n}</span></div>{rib}'
                   f'<div class="counter v3-page">{ico("star")}{idx} / {total}</div></div>')
        return f'<div class="v3 {kind} bx">{bg}{top}{inner}</div>'

    def host(self, pose, right=70, bottom=8, height=420, left=None):
        if not pose:
            return ""
        if self.teen and not pose.startswith(("lumi-teen", "hamad-teen", "noor-teen", "omar-teen", "sara-teen", "ziad-teen")):
            pose = {"lumi-point": "lumi-teen-point", "lumi-celebrate": "lumi-teen-celebrate",
                    "lumi-read": "lumi-teen-read", "lumi-surprised": "lumi-teen-surprised"}.get(pose, "lumi-teen-explain")
        side = f"left:{left}px" if left is not None else f"right:{right}px"
        fside = f"left:{(left or 0) - 18}px" if left is not None else f"right:{right - 18}px"
        return (f'<div class="v3-floor" style="{fside};bottom:{max(0, bottom - 12)}px;width:{int(height * .6)}px"></div>'
                f'<img class="char v3-host" src="{CHAR}/{pose}.png" style="{side};bottom:{bottom}px;height:{height}px" alt="" '
                f'onerror="this.style.display=\'none\'; this.previousElementSibling.style.display=\'none\'">')

    def add(self, ribbon, inner, header=True):
        self.slides.append((ribbon, inner, header))

    # ------------------------------------------------------------ auto slides
    def cover(self):
        d = self.d
        skills = "".join(f'<span class="v3-chip">{esc(s)}</span>' for s in d["skillFocus"][:4])
        inner = (f'<div class="v3-glow" style="left:80px;top:10px;width:900px;height:900px"></div>'
                 f'<div style="position:absolute;left:80px;top:54px;width:900px;text-align:center;z-index:5">'
                 f'<img src="assets/logo/lumio-logo.png" alt="" style="height:120px"></div>'
                 f'<div class="v3-paper bx-cover" style="left:80px;top:210px;width:900px">'
                 f'<div class="bx-badge">{ico("star")} {esc(d["label"])} &middot; {esc(d["strand"])}</div>'
                 f'<div class="v3-label">{level_name(self.level)} &middot; class {d["classPosition"]} of 24 &middot; {d["durationMinutes"]} minutes</div>'
                 f'<div class="v3-word bx-title">{esc(d["title"])}</div>{ar(d["titleAr"], "bx-ar big")}'
                 f'<div class="bx-chips">{skills}</div></div>'
                 + self.host("lumi-hero" if not self.teen else "lumi-teen-happy", right=90, height=460))
        self.add("", inner, header=False)

    def goals(self):
        d = self.d
        rows = "".join(f'<li><span class="n">{i}</span><div><b>{esc(o["en"])}</b>{ar(o["ar"])}</div></li>'
                       for i, o in enumerate(d["objectives"], 1))
        inner = (f'<div class="v3-paper" style="left:60px;top:140px;width:900px">'
                 f'<div class="v3-label">{ico("compass")} Today I can...</div><ol class="bx-goals">{rows}</ol></div>'
                 f'<div class="v3-paper bx-big" style="left:990px;top:170px;width:400px">'
                 f'<div class="v3-label t">{ico("bulb")} Big idea</div><div class="v3-quote"{fit(d["bigIdea"], 1.65, 200)}>{esc(d["bigIdea"])}</div></div>')
        self.add("Let's learn · today's goals", inner)

    def exit_ticket(self):
        et = self.d["exitTicket"]
        items = "".join(
            f'<div class="bx-rev" onclick="this.classList.toggle(\'open\')"><span class="n">{i}</span>'
            f'{speak_btn(it["prompt"]) if self.say_items else ""}<div class="q">{esc(it["prompt"]) if not self.say_items else ""}</div>'
            f'<div class="a">{esc(it["answer"])}</div></div>'
            for i, it in enumerate(et["items"], 1))
        inner = (self.instructions(et.get("instructions"), et.get("instructionsAr"), 150)
                 + f'<div class="bx-revs cols{et_cols(et["items"])}{" long" if longest(et["items"]) > 70 else ""}" style="top:300px">{items}</div>'
                 + f'<div class="bx-hint">Teacher: tap a card to show the answer</div>')
        self.add("Quiz · exit ticket", inner)

    def homework(self):
        hw = self.d["homework"]
        tasks = "".join(f'<li>{ico("check")} {esc(t)}</li>' for t in hw.get("tasks", [])[:4])
        inner = (f'<div class="v3-paper{" bx-long" if len(hw["en"]) + len(hw["ar"]) > 480 else ""}" style="left:60px;top:150px;width:930px">'
                 f'<div class="v3-label">{ico("gift")} Your bonus mission</div>'
                 f'<div class="v3-quote bx-hw">{esc(hw["en"])}</div>{ar(hw["ar"])}<ul class="bx-tasks">{tasks}</ul></div>'
                 + self.host("lumi-celebrate", right=80, height=440))
        self.add("Homework · bonus mission", inner)

    # ------------------------------------------------------------ helpers
    def instructions(self, en, ar_text, top):
        if not en:
            return ""
        return (f'<div class="v3-prompt bx-ins" style="top:{top}px"><div><span style="display:flex;flex-direction:column;'
                f'align-items:center;gap:2px">{esc(en)}{f"<small dir=rtl>{esc(ar_text)}</small>" if ar_text else ""}</span></div></div>')

    # ------------------------------------------------------------ authored slide types
    def s_concept(self, s):
        bullets = "".join(f'<li>{esc(b)}</li>' for b in s.get("bullets", []))
        big = f'<div class="v3-word bx-bigtext">{esc(s["big"])}</div>' if s.get("big") else ""
        width = 960 if s.get("host") else 1320
        inner = (f'<div class="v3-paper bx-concept" style="left:60px;top:150px;width:{width}px">'
                 f'{f"<div class=v3-label>{ico(s.get("icon", "bulb"))} {esc(s["title"])}</div>" if s.get("title") else ""}'
                 f'{big}{f"<div class=v3-quote>{esc(s["text"])}</div>" if s.get("text") else ""}'
                 f'{f"<ul class=bx-list>{bullets}</ul>" if bullets else ""}{ar(s.get("ar"))}</div>'
                 + self.host(s.get("host"), height=430))
        self.add(s.get("ribbon"), inner)

    def s_cards(self, s):
        cards = s["cards"]
        k = len(cards)
        out = []
        for c in cards:
            words = "".join(
                f'<button class="bx-word" onclick="{speak_js(w)}">{esc(w)}</button>' for w in c.get("words", []))
            big = (f'<button class="bx-sym" onclick="{speak_js(c["say"])}">{esc(c["big"])}</button>' if c.get("say")
                   else f'<div class="bx-sym">{esc(c["big"])}</div>') if c.get("big") else ""
            out.append(f'<div class="bx-card" style="--c:{c.get("color", "#F97316")}">{big}'
                       f'<div class="h">{esc(c["head"])}</div>{f"<div class=sub>{esc(c["sub"])}</div>" if c.get("sub") else ""}'
                       f'{ar(c.get("ar"))}{f"<div class=bx-words>{words}</div>" if words else ""}</div>')
        top = 150
        title = ""
        if s.get("title"):
            title = f'<div class="bx-h1" style="top:{top}px">{esc(s["title"])}</div>'
            top += 70
        inner = title + f'<div class="bx-cards cols{k}" style="top:{top}px">{"".join(out)}</div>'
        self.add(s.get("ribbon"), inner)

    def s_ladder(self, s):
        steps = s["steps"]
        rows = []
        for i, st in enumerate(steps):
            say = speak_btn(st["say"]) if st.get("say") else ""
            rows.append(f'<div class="bx-step" style="--i:{i};--c:{st.get("color", "#F97316")}">{say}'
                        f'<div class="lab">{esc(st["label"])}</div><div class="sub">{esc(st.get("sub", ""))}</div>'
                        f'{ar(st.get("ar"))}</div>')
        inner = (f'<div class="bx-h1" style="top:150px">{esc(s.get("title", ""))}</div>'
                 f'<div class="bx-ladder{" many" if len(steps) > 4 else ""}" style="top:{215 if len(steps) > 4 else 230}px">{"".join(rows)}</div>'
                 + (f'<div class="v3-paper bx-side" style="right:60px;top:250px;width:420px">'
                    f'<div class="v3-label t">{ico("bulb")} {esc(s.get("noteTitle", "Remember"))}</div>'
                    f'<div class="v3-quote">{esc(s["note"])}</div>{ar(s.get("noteAr"))}</div>' if s.get("note") else ""))
        self.add(s.get("ribbon"), inner)

    def s_listen(self, s):
        rounds = s["rounds"]
        for i, r in enumerate(rounds, 1):
            opts = "".join(
                f'<button class="v3-opt bx-opt" data-letter="{"ABCD"[j]}" data-quiz-option="{esc(o)}" '
                f'onclick="window.checkQuizAnswer && checkQuizAnswer(this, \'{jsq(o)}\', \'{jsq(r["answer"])}\')">'
                f'<span class="bx-optw">{esc(o)}</span>'
                f'{f"<small>{esc(s.get("labels", {}).get(o, ""))}</small>" if s.get("labels", {}).get(o) else ""}</button>'
                for j, o in enumerate(r["options"]))
            cols = 3 if len(r["options"]) == 3 else 2
            show = f'<div class="v3-word bx-show">{esc(r["show"])}</div>' if r.get("show") else ""
            inner = (f'<div class="v3-paper bx-listen" style="left:70px;top:170px;width:380px;height:470px">'
                     f'<div class="v3-quote" style="font-size:1.9rem">{esc(s.get("question", "Listen. Which one?"))}</div>{show}'
                     f'<button class="v3-btn teal round bx-bigsay" onclick="{speak_js(r["say"])}">{ico("sound")}</button>'
                     f'<div class="v3-label t">Tap to hear</div></div>'
                     f'<div class="v3-opts bx-opts" style="left:500px;right:70px;top:200px;grid-template-columns:repeat({cols},1fr)">{opts}</div>')
            self.add(f'{s.get("ribbon", "Listen · which one?")} · {i}/{len(rounds)}' if "·" not in s.get("ribbon", "")
                     else f'{s["ribbon"]} {i}/{len(rounds)}', inner)

    def s_reveal(self, s):
        items = s["items"]
        per = s.get("perSlide", 8)
        chunks = [items[i:i + per] for i in range(0, len(items), per)]
        for ci, chunk in enumerate(chunks, 1):
            cards = "".join(
                f'<div class="bx-rev" onclick="this.classList.toggle(\'open\')"><span class="n">{(ci - 1) * per + i}</span>'
                f'{speak_btn(it["say"]) if it.get("say") else ""}<div class="q">{esc(it["prompt"])}</div>'
                f'<div class="a">{esc(it["answer"])}</div></div>'
                for i, it in enumerate(chunk, 1))
            cols = 4 if len(chunk) > 6 else (3 if len(chunk) > 4 else len(chunk))
            rib = s.get("ribbon", "Practice · try it")
            if len(chunks) > 1:
                rib = f"{rib} {ci}/{len(chunks)}"
            inner = (self.instructions(s.get("instructions"), s.get("instructionsAr"), 150)
                     + f'<div class="bx-revs cols{cols}" style="top:{290 if s.get("instructions") else 170}px">{cards}</div>'
                     + '<div class="bx-hint">Tap a card to check</div>')
            self.add(rib, inner)

    def s_sort(self, s):
        boxes = s["boxes"]
        colors = s.get("colors", ["#F97316", "#0D9488", "#1E4FA3", "#BE123C"])
        heads = "".join(f'<div class="bx-bin" style="--c:{colors[i % len(colors)]}"><b>{esc(b)}</b></div>'
                        for i, b in enumerate(boxes))
        chips = "".join(
            f'<button class="bx-chip" style="--c:{colors[boxes.index(it["box"]) % len(colors)]}" '
            f'onclick="this.classList.add(\'open\');{speak_js(it.get("say", it["text"]))}">{esc(it["text"])}'
            f'<small>{esc(it["box"])}</small></button>' for it in s["items"])
        inner = (self.instructions(s.get("instructions"), s.get("instructionsAr"), 150)
                 + f'<div class="bx-bins cols{len(boxes)}" style="top:290px">{heads}</div>'
                 + f'<div class="bx-chips2" style="top:440px">{chips}</div>'
                 + '<div class="bx-hint">Say it, decide, then tap to check</div>')
        self.add(s.get("ribbon", "Practice · sort it"), inner)

    def s_swap(self, s):
        rows = []
        for r in s["frames"]:
            pre, post = r["frame"].split("_")
            btns = "".join(
                f'<button class="bx-v" style="--c:{s.get("colors", {}).get(v, "#F97316")}" '
                f'onclick="var r=this.closest(\'.bx-swaprow\');r.querySelector(\'.slot\').textContent=\'{jsq(v)}\';'
                f'r.querySelector(\'.slot\').style.setProperty(\'--c\',\'{s.get("colors", {}).get(v, "#F97316")}\');'
                f'{speak_js(r["words"][v]) if r["words"].get(v) else ""}">{esc(v)}</button>'
                for v in s["vowels"])
            rows.append(f'<div class="bx-swaprow"><div class="bx-frame"><span>{esc(pre)}</span>'
                        f'<span class="slot">?</span><span>{esc(post)}</span></div><div class="bx-vs">{btns}</div></div>')
        inner = (f'<div class="bx-h1" style="top:150px">{esc(s.get("title", "Swap the vowel"))}</div>'
                 f'<div class="bx-swap" style="top:225px">{"".join(rows)}</div>' + self.host(s.get("host"), height=380))
        self.add(s.get("ribbon", "Practice · swap it"), inner)

    def s_chant(self, s):
        lines = "".join(
            f'<div class="bx-line">{speak_btn(l["en"])}<div><div class="en">{esc(l["en"])}</div>{ar(l.get("ar"))}</div></div>'
            for l in s["lines"])
        inner = (f'<div class="v3-paper bx-chant{" many" if sum(1.5 if l.get("ar") else 1 for l in s["lines"]) + (1 if s.get("tip") else 0) > 5.5 else ""}" style="left:60px;top:150px;width:{960 if s.get("host") else 1340}px">'
                 f'<div class="v3-label">{ico("music")} {esc(s.get("title", "Say it with me"))}</div>{lines}'
                 f'{f"<div class=bx-tip>{esc(s["tip"])}</div>" if s.get("tip") else ""}</div>'
                 + self.host(s.get("host"), height=430))
        self.add(s.get("ribbon", "Practice · say it"), inner)

    def s_compare(self, s):
        cols = s["columns"]
        head = "".join(f'<th{" dir=rtl" if c.get("rtl") else ""}>{esc(c["head"])}</th>' for c in cols)
        body = "".join(
            "<tr>" + "".join((f'<td dir=rtl class=r>{ar_html(cell)}</td>' if cols[j].get("rtl") else f'<td>{esc(cell)}</td>') for j, cell in enumerate(row)) + "</tr>"
            for row in s["rows"])
        inner = (f'<div class="bx-h1" style="top:150px">{esc(s.get("title", ""))}</div>'
                 f'<div class="v3-paper bx-table" style="left:60px;top:230px;width:{1000 if s.get("host") else 1340}px">'
                 f'<table><tr>{head}</tr>{body}</table>'
                 f'{f"<div class=bx-tip>{esc(s["note"])}</div>" if s.get("note") else ""}{ar(s.get("noteAr"))}</div>'
                 + self.host(s.get("host"), height=400))
        self.add(s.get("ribbon", "Arabic bridge · compare"), inner)

    def s_fact(self, s):
        inner = (f'<div class="v3-glow" style="left:260px;top:60px;width:900px;height:900px"></div>'
                 f'<div class="v3-paper bx-fact" style="left:100px;top:190px;width:820px">'
                 f'<div class="v3-label">{ico("sparkle")} {esc(s.get("title", "Did you know?"))}</div>'
                 f'<div class="v3-quote">{esc(s["text"])}</div>{ar(s.get("ar"))}</div>'
                 + self.host(s.get("host", "lumi-surprised"), right=80, height=440))
        self.add(s.get("ribbon", "Did you know · fact"), inner)

    def s_tasks(self, s):
        steps = "".join(f'<li><span class="n">{i}</span><div>{esc(t)}</div></li>' for i, t in enumerate(s["steps"], 1))
        inner = (f'<div class="v3-paper" style="left:60px;top:150px;width:{960 if s.get("host") else 1340}px">'
                 f'<div class="v3-label">{ico(s.get("icon", "pencil"))} {esc(s.get("title", "Your turn"))}</div>'
                 f'<ol class="bx-goals">{steps}</ol>{ar(s.get("ar"))}</div>' + self.host(s.get("host"), height=430))
        self.add(s.get("ribbon", "Your turn · task"), inner)

    BUILDERS = {"concept": s_concept, "cards": s_cards, "ladder": s_ladder, "listen": s_listen, "reveal": s_reveal,
                "sort": s_sort, "swap": s_swap, "chant": s_chant, "compare": s_compare, "fact": s_fact, "tasks": s_tasks}

    def build(self):
        d = self.d
        # exit ticket items in Pre-A/L1/L2 are mostly words to hear; teens read them
        self.say_items = not self.teen and all(len(str(i["prompt"]).split()) <= 2 for i in d["exitTicket"]["items"])
        self.cover()
        self.goals()
        for s in d["deck"]:
            fn = self.BUILDERS.get(s["type"])
            if not fn:
                raise ValueError(f"{d['id']}: unknown slide type {s['type']!r}")
            fn(self, s)
        self.exit_ticket()
        self.homework()
        total = len(self.slides)
        return [self.wrap(inner, rib, i, total, hdr) for i, (rib, inner, hdr) in enumerate(self.slides, 1)]
