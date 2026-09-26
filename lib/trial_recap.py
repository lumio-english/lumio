# -*- coding: utf-8 -*-
"""End-of-trial "Today I Learned" recap for all seven trial decks.

A trial generator registers everything it teaches *as it builds* --
remember_word() from its load_word(), remember_sentence() from its
scene / sentence-builder slides, remember_actions() for the TPR /
copy-cat action words -- and then asks for the recap slides. That
way the recap can never drift from the deck: the previous versions
either had no recap at all (Pre-A / L1 / L2, whose finish slide
listed a hand-typed 12-word sample) or read the word list back out
of the generator's source with a regex that silently missed the last
vocabulary group (L3-L6) and never listed a single sentence.

Slides are paginated by lib/recap_pages.py exactly like the regular
lesson recaps, so a trial deck's total slide count depends on its
content; the generators therefore build twice (see two_pass_build).
"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import recap_pages

WORDS, SENTENCES, ACTIONS = [], [], []


def reset():
    WORDS.clear(); SENTENCES.clear(); ACTIONS.clear()


def remember_word(w):
    if w and w.get("en") and all(x["en"] != w["en"] for x in WORDS):
        WORDS.append(w)
    return w


def remember_sentence(s):
    if s: SENTENCES.append(s)
    return s


def remember_actions(*actions):
    for a in actions:
        if a and a not in ACTIONS: ACTIONS.append(a)


def _action_block(label="ACTIONS WE DID"):
    return [{"kind": "pills", "label": label, "items": list(ACTIONS)}] if ACTIONS else []


# ---------------- kid track (Pre-A / L1 / L2) ----------------
def kid_slides(n_start, total):
    import deck_template_v2 as v2
    pages = v2.today_i_learned_pages({"vocab": list(WORDS)}, scene_sentences=list(SENTENCES),
                                     extra_blocks=_action_block())
    return [v2.slide_today_i_learned(pg, i, len(pages), n_start + i - 1, total)
            for i, pg in enumerate(pages, 1)]


# ---------------- teen track (L3-L6) ----------------
def teen_slides(level, grammar_line, dialogue_lines, n_start, total):
    """Page 1 keeps the trial's parent-friendly word grid (every word with
    its Arabic) plus the grammar line; the following page(s) list every
    sentence the class met -- each word's example sentence, the
    sentence-builder sentence and the dialogue lines."""
    import deck_template_teen as v1
    from deck_template_teen import esc, ORANGE_DEEP, TEAL_DEEP, CARD_TEXT, INK_DIM
    blocks = [{"kind": "sentences", "label": "SENTENCE PATTERNS",
               "items": recap_pages.dedupe([w.get("example") for w in WORDS] + list(SENTENCES)),
               "title": grammar_line}]
    if dialogue_lines:
        blocks.append({"kind": "lines", "label": "DIALOGUE", "items": recap_pages.dedupe(dialogue_lines)})
    pages = recap_pages.paginate(blocks, recap_pages.TEEN)
    count = 1 + len(pages)

    def title(i):
        return "Today you learned &#127775;" if count == 1 else f"Today you learned &#127775; &middot; {i}/{count}"

    chips = "".join(
        f'<div style="background:#fff;border-radius:14px;padding:10px 16px;box-shadow:0 6px 14px rgba(0,0,0,.08);text-align:center">'
        f'<div style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:1.05rem;color:{CARD_TEXT}">{esc(w["en"])}</div>'
        f'<div dir="rtl" style="font-weight:700;font-size:.95rem;color:{TEAL_DEEP};margin-top:2px">{esc(w.get("ar", ""))}</div></div>'
        for w in WORDS)
    first = (v1.bg_base() + v1.header(title(1), n_start, total) + f'''
    <div data-recap-body style="position:absolute;left:60px;right:60px;top:130px">
      <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.8rem;letter-spacing:1.5px;color:{ORANGE_DEEP};margin-bottom:10px">
        WORDS &nbsp;&middot;&nbsp; <span dir="rtl">الكلمات</span></div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px">{chips}</div>
      <div style="margin-top:22px;background:#fff;border-radius:16px;padding:16px 22px;box-shadow:0 8px 18px rgba(0,0,0,.08)">
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:.8rem;letter-spacing:1.5px;color:{TEAL_DEEP};margin-bottom:6px">GRAMMAR YOU USED TODAY</div>
        <div style="font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.15rem;color:{CARD_TEXT}">{esc(grammar_line)}</div>
        <div style="font-size:.95rem;color:{INK_DIM};margin-top:6px">This was one class. The full level has 20 lessons, a bonus game, printable worksheets and flashcards, and a story.</div>
      </div>
    </div>''')
    out = [first]
    for i, pg in enumerate(pages, 2):
        body = "".join(v1._recap_block_html(b) for b in pg)
        out.append(v1.bg_base() + v1.header(title(i), n_start + i - 1, total) + f'''
    <div data-recap-body style="position:relative;z-index:5;padding:40px 40px 0">{body}</div>
    ''')
    return out


def two_pass_build(build_fn, set_total, first_total):
    """Recap length depends on content, so build once to learn the true
    slide count, set the module's TOTAL, and build again so every
    slide's "n / total" counter is right."""
    reset(); set_total(first_total)
    slides = build_fn()
    if len(slides) != first_total:
        reset(); set_total(len(slides))
        slides = build_fn()
    assert len(slides) == len(slides)
    return slides
