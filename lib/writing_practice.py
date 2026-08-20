# -*- coding: utf-8 -*-
"""
Shared "writing practice" worksheet generator, used by each level's own
gen_worksheets_flashcards_LEVEL.py script (pre-a, level1, level2, level3
only -- this is a Junior/early-Teen tracing-practice sheet, not meant for
level4-6). Mirrors the existing homework-worksheet pattern: the calling
script already has NotoArabic/NotoArabic-Bold registered and its own
color constants, which get passed in here rather than re-declared, so
there's exactly one place that owns font registration per script.

Per-word layout, drawn in a wrapping grid of columns (not a strict
single row -- vocab includes multi-word phrases like "nice to meet you"
or "artificial intelligence" that would break a fixed 6-across layout):
  - Arabic translation, centered, above the first ruled line
  - Line 1: the English word/phrase in full solid ink (the model to copy)
  - Line 2: the same word/phrase in light grey (a trace-over guide),
    with a visible gap between line 1 and line 2
  - 5 blank ruled lines beneath for the student to write it themselves

Real lesson vocab counts range from 4 to 10 words (checked across all 80
target lessons before finalizing this), so the word grid paginates
properly with c.showPage() instead of assuming everything fits on one
page -- a fixed single-page layout would silently crush or cut off the
last row on any 8+ word lesson.

After the word grid: a handful of this lesson's own example sentences
(not all of them) as copy-writing practice, each on its own ruled line
with a blank line beneath. Level 3 gets more sentences and more space
per sentence ("strengthen sentence writing"), passed in via
strengthen_sentences=True.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
import arabic_reshaper
from bidi.algorithm import get_display

PAGE_W, PAGE_H = A4
MARGIN = 40
TOP_START = PAGE_H - 56


def ar_shape(text):
    return get_display(arabic_reshaper.reshape(text))


def _fit_font(c, text, font, max_size, max_width, min_size=7):
    """Shrink font size until `text` fits max_width, never below min_size --
    handles short words at full size and long phrases gracefully instead of
    overflowing a narrow column."""
    size = max_size
    while size > min_size and c.stringWidth(text, font, size) > max_width:
        size -= 0.5
    return size


def _draw_header(c, level_label, lesson, num, INK, ORANGE, TEAL, logo_path, continued=False):
    y = TOP_START
    if logo_path:
        try:
            c.drawImage(ImageReader(logo_path), MARGIN + 4, y - 34, width=34, height=34,
                        mask="auto", preserveAspectRatio=True)
        except Exception:
            pass
    c.setFillColorRGB(*ORANGE)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(MARGIN + 48, y, f"{level_label} \u2022 Lesson {num}" + (" (continued)" if continued else ""))
    y -= 20
    c.setFillColorRGB(*INK)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(MARGIN + 48, y, "Lumio English")
    y -= 30
    c.setFont("Helvetica-Bold", 19)
    c.drawString(MARGIN, y, lesson["title"])
    y -= 24
    c.setFillColorRGB(*TEAL)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, y, "WRITING PRACTICE")
    y -= 28

    if not continued:
        c.setFillColorRGB(*INK)
        c.setFont("Helvetica", 10.5)
        c.drawString(MARGIN, y, "Name: _______________________")
        c.drawString(MARGIN + 235, y, "Date: __________")
        y -= 24
    return y


def draw_writing_practice(c, level_label, lesson, num, INK, ORANGE, TEAL, MUTED, CREAM,
                           logo_path=None, strengthen_sentences=False):
    words = lesson["vocab"]
    col_gap = 14
    cols = 3
    col_w = (PAGE_W - 2 * MARGIN - (cols - 1) * col_gap) / cols

    LINE_PITCH = 19      # model / trace lines
    BLANK_PITCH = 21     # the 5 practice lines -- slightly more generous,
                          # since that's where the actual handwriting happens
    BLANK_LINES = 5
    LABEL_H = 17
    GAP_BETWEEN_MODEL_AND_TRACE = 9
    ROW_BOTTOM_GAP = 18
    row_h = LABEL_H + LINE_PITCH + GAP_BETWEEN_MODEL_AND_TRACE + LINE_PITCH + BLANK_LINES * BLANK_PITCH + ROW_BOTTOM_GAP

    y = _draw_header(c, level_label, lesson, num, INK, ORANGE, TEAL, logo_path)
    col_i = 0

    for w in words:
        # New page if this row won't fit -- happens on real 8-10 word
        # lessons, never on the common 6-word case.
        if col_i == 0 and y - row_h < 90:
            c.showPage()
            y = _draw_header(c, level_label, lesson, num, INK, ORANGE, TEAL, logo_path, continued=True)

        x = MARGIN + col_i * (col_w + col_gap)
        cy = y

        c.setFillColorRGB(*TEAL)
        c.setFont("NotoArabic-Bold", 12)
        c.drawCentredString(x + col_w / 2, cy, ar_shape(w["ar"]))
        cy -= LABEL_H

        model_size = _fit_font(c, w["en"], "Helvetica-Bold", 14, col_w - 6)
        c.setFillColorRGB(*INK)
        c.setFont("Helvetica-Bold", model_size)
        c.drawCentredString(x + col_w / 2, cy - LINE_PITCH + 5, w["en"])
        c.setStrokeColorRGB(*MUTED)
        c.setLineWidth(0.8)
        c.line(x, cy - LINE_PITCH, x + col_w, cy - LINE_PITCH)
        cy -= LINE_PITCH + GAP_BETWEEN_MODEL_AND_TRACE

        c.setFillColorRGB(0.78, 0.78, 0.78)
        c.setFont("Helvetica-Bold", model_size)
        c.drawCentredString(x + col_w / 2, cy - LINE_PITCH + 5, w["en"])
        c.setStrokeColorRGB(*MUTED)
        c.line(x, cy - LINE_PITCH, x + col_w, cy - LINE_PITCH)
        cy -= LINE_PITCH

        for _ in range(BLANK_LINES):
            cy -= BLANK_PITCH
            c.setStrokeColorRGB(0.85, 0.85, 0.85)
            c.setLineWidth(0.7)
            c.line(x, cy, x + col_w, cy)

        col_i += 1
        if col_i == cols:
            col_i = 0
            y -= row_h
    if col_i != 0:
        y -= row_h

    # ---------- sentences ----------
    examples = [w["example"] for w in words if w.get("example")]
    n_sentences = min(len(examples), 5 if strengthen_sentences else 3)
    sentence_gap = 32 if strengthen_sentences else 26
    copy_lines = 2 if strengthen_sentences else 1
    needed = 26 + n_sentences * (14 + copy_lines * sentence_gap)

    if y - needed < 60:
        c.showPage()
        y = _draw_header(c, level_label, lesson, num, INK, ORANGE, TEAL, logo_path, continued=True)

    y -= 8
    c.setFillColorRGB(*ORANGE)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, y, "Write the sentences")
    y -= 22

    c.setFont("Helvetica", 11)
    for s in examples[:n_sentences]:
        if y < 60:
            c.showPage()
            y = _draw_header(c, level_label, lesson, num, INK, ORANGE, TEAL, logo_path, continued=True)
        c.setFillColorRGB(*INK)
        c.setFont("Helvetica-Oblique", 10.5)
        c.drawString(MARGIN, y, s)
        y -= 14
        for _ in range(copy_lines):
            c.setStrokeColorRGB(*MUTED)
            c.setDash(2, 2)
            c.line(MARGIN, y, PAGE_W - MARGIN, y)
            c.setDash()
            y -= sentence_gap

    c.setFillColorRGB(*MUTED)
    c.setFont("Helvetica-Oblique", 9)
    c.drawCentredString(PAGE_W / 2, 30, "Lumio English \u2014 Learn, Speak, Grow")
