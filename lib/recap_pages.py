# -*- coding: utf-8 -*-
"""Pagination for the end-of-lesson "Today I Learned" recap.

A recap is a list of *blocks*, each one a labelled group of items:

    ("chips",     "KEY WORDS",           [{"en": "hello"}, ...])   picture cards
    ("pills",     "SOUNDS & WORDS",      ["s /s/", "sun", ...])    text pills
    ("sentences", "SENTENCE PATTERNS",   ["Hello! I am Lumi.", ...]) 2-column grid
    ("lines",     "DIALOGUE",            ["Omar: ...", ...])        1-column list

The slide canvas is a fixed 1467x825, so a lesson whose words + example
sentences + grammar examples + dialogue no longer fit on one slide is
split across several "Today I Learned (1/3)" slides instead of being
cut down to a subset (the previous behaviour: the teen recap showed
only the first 6 words and nothing but the vocab examples).

The split is decided *before* rendering, from estimated pixel heights,
so the deck plan knows how many slides the recap takes and every
slide's "n / total" counter is right. The estimates are deliberately a
little pessimistic; the rendered result is verified in a browser by
the generator's usual Playwright check.
"""
import math


class Layout:
    """Per-track pixel geometry used only for the height estimates."""
    def __init__(self, content_h, content_w, chip_w, chip_gap, chip_h,
                 pill_h, pill_gap, pill_pad, pill_char_w,
                 sent_cols, sent_char_w, sent_line_h, sent_gap, card_pad,
                 label_h=30, block_gap=18, line_char_w=None):
        self.content_h = content_h
        self.content_w = content_w
        self.chip_w, self.chip_gap, self.chip_h = chip_w, chip_gap, chip_h
        self.pill_h, self.pill_gap, self.pill_pad, self.pill_char_w = pill_h, pill_gap, pill_pad, pill_char_w
        self.sent_cols, self.sent_char_w, self.sent_line_h, self.sent_gap = sent_cols, sent_char_w, sent_line_h, sent_gap
        self.card_pad = card_pad
        self.label_h = label_h
        self.block_gap = block_gap
        self.line_char_w = line_char_w or sent_char_w

    # ---- per-item heights -------------------------------------------------
    def chips_per_row(self):
        return max(1, (self.content_w + self.chip_gap) // (self.chip_w + self.chip_gap))

    def sent_col_w(self):
        return (self.content_w - 2 * self.card_pad - 18 * (self.sent_cols - 1)) / self.sent_cols

    def sent_lines(self, text):
        return max(1, math.ceil(len(text) * self.sent_char_w / self.sent_col_w()))

    def line_lines(self, text):
        w = self.content_w - 2 * self.card_pad
        return max(1, math.ceil(len(text) * self.line_char_w / w))


# Canvas is 1467x825 (present.html's slideStage). Kid content starts at
# y=150 and must clear the bottom edge; teen content starts ~y=160.
KID = Layout(content_h=665, content_w=1000, chip_w=110, chip_gap=12, chip_h=116,
             pill_h=32, pill_gap=8, pill_pad=30, pill_char_w=8.2,
             sent_cols=2, sent_char_w=7.6, sent_line_h=19, sent_gap=4, card_pad=16)

TEEN = Layout(content_h=650, content_w=1387, chip_w=100, chip_gap=10, chip_h=108,
              pill_h=32, pill_gap=8, pill_pad=28, pill_char_w=7.4,
              sent_cols=2, sent_char_w=7.2, sent_line_h=19, sent_gap=4, card_pad=16)


def _block_height(layout, kind, items, has_title=False):
    """Estimated height of one rendered block holding exactly `items`."""
    L = layout
    h = L.label_h
    if kind == "chips":
        rows = math.ceil(len(items) / L.chips_per_row())
        h += rows * L.chip_h + (rows - 1) * L.chip_gap
    elif kind == "pills":
        rows, x = 1, 0
        for it in items:
            w = L.pill_pad + len(it) * L.pill_char_w
            if x and x + L.pill_gap + w > L.content_w:
                rows += 1; x = w
            else:
                x = x + (L.pill_gap if x else 0) + w
        h += rows * L.pill_h + (rows - 1) * L.pill_gap
    elif kind == "sentences":
        h += 2 * L.card_pad + (26 if has_title else 0)
        for i in range(0, len(items), L.sent_cols):
            row = items[i:i + L.sent_cols]
            h += max(L.sent_lines(t) for t in row) * L.sent_line_h + L.sent_gap
    elif kind == "lines":
        h += 2 * L.card_pad + (26 if has_title else 0)
        for t in items:
            h += L.line_lines(t) * L.sent_line_h + L.sent_gap
    return h + L.block_gap


def paginate(blocks, layout):
    """Split `blocks` into pages that each fit `layout.content_h`.

    blocks: list of dicts {kind, label, items, title?}.
    Returns a list of pages; each page is a list of block dicts with an
    added "cont" flag when the block continues one from the previous
    page (rendered as "... (cont.)"). A block is only split when it does
    not fit on an otherwise-empty page's remaining space, and never
    into pieces smaller than `min_split` items so a stray single
    sentence is not orphaned on its own slide.
    """
    pages, page, used = [], [], 0
    min_split = 2

    def flush():
        nonlocal page, used
        if page:
            pages.append(page)
        page, used = [], 0

    for blk in blocks:
        items = list(blk["items"])
        if not items:
            continue
        cont = False
        while items:
            full_h = _block_height(layout, blk["kind"], items, blk.get("title") is not None)
            room = layout.content_h - used
            if full_h <= room:
                page.append({**blk, "items": items, "cont": cont}); used += full_h
                items = []
                break
            # Doesn't fit whole. Take as many items as fit in `room`; if
            # that is too few, start a fresh page first.
            n = 0
            for k in range(1, len(items) + 1):
                if _block_height(layout, blk["kind"], items[:k], blk.get("title") is not None) <= room:
                    n = k
                else:
                    break
            remaining_after = len(items) - n
            if n < min_split or (0 < remaining_after < min_split and n > min_split):
                if page:
                    flush()
                    continue
                # Empty page and still doesn't fit even min_split: take at
                # least one item so we always make progress.
                n = max(1, n)
            if 0 < remaining_after < min_split:
                n -= (min_split - remaining_after)
                n = max(1, n)
            page.append({**blk, "items": items[:n], "cont": cont})
            items = items[n:]
            cont = True
            flush()
    flush()
    return pages


def dedupe(seq):
    seen, out = set(), []
    for s in seq:
        s = (s or "").strip()
        key = s.lower()
        if s and key not in seen:
            seen.add(key); out.append(s)
    return out
