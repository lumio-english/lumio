# -*- coding: utf-8 -*-
import json, os, glob, math
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

pdfmetrics.registerFont(TTFont("NotoArabic", "/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf"))
pdfmetrics.registerFont(TTFont("NotoArabic-Bold", "/usr/share/fonts/truetype/noto/NotoSansArabic-Bold.ttf"))

PAGE_W, PAGE_H = A4
LEVEL = "pre-a"
INK = (0x43/255, 0x30/255, 0x1F/255)
ORANGE = (0xF9/255, 0x73/255, 0x16/255)
TEAL = (0x0D/255, 0x94/255, 0x88/255)
MUTED = (0x8A/255, 0x71/255, 0x60/255)
CREAM = (1, 0.953, 0.839)

os.makedirs(f"worksheets/{LEVEL}", exist_ok=True)
os.makedirs(f"flashcards/{LEVEL}", exist_ok=True)

def slug(w):
    return w.lower().replace("'", "").replace(" ", "-")

def vocab_image_path(en):
    p = f"assets/vocab/{slug(en)}.png"
    return p if os.path.exists(p) else None

# ================= WORKSHEETS =================
def draw_worksheet(c, lesson, num):
    words = [w["en"] for w in lesson["vocab"]]
    y = PAGE_H - 56
    c.setFillColorRGB(*ORANGE)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(46, y, f"{LEVEL.upper()} \u2022 Lesson {num}")
    y -= 20
    c.setFillColorRGB(*INK)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(46, y, "Lumio English")
    y -= 26
    c.setFont("Helvetica-Bold", 20)
    c.drawString(46, y, lesson["title"])
    y -= 24
    c.setFillColorRGB(*TEAL)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(46, y, "HOMEWORK SHEET")
    y -= 34

    c.setFillColorRGB(*INK)
    c.setFont("Helvetica", 11)
    c.drawString(46, y, "Name: _______________________")
    c.drawString(280, y, "Date: __________")
    c.drawString(420, y, "Class: ________")
    y -= 38

    # 1. Write each word 3 times
    c.setFont("Helvetica-Bold", 12)
    c.drawString(46, y, "1. Write each word 3 times")
    y -= 22
    c.setFont("Helvetica", 11)
    for w in words:
        c.drawString(56, y, w)
        c.setDash(2, 2)
        c.line(150, y + 3, PAGE_W - 60, y + 3)
        c.setDash()
        y -= 20
    y -= 10

    # 2. Draw a picture
    c.setFont("Helvetica-Bold", 12)
    c.drawString(46, y, f'2. Draw a picture of \u201c{words[0]}\u201d')
    y -= 12
    c.setDash(3, 3)
    c.rect(46, y - 130, PAGE_W - 92, 120, stroke=1, fill=0)
    c.setDash()
    y -= 150

    # 3. Say each word to your family
    c.setFont("Helvetica-Bold", 12)
    c.drawString(46, y, "3. Say each word to your family")
    y -= 20
    c.setFont("Helvetica", 10.5)
    line = "   \u2022   ".join(words)
    # wrap manually if too long
    max_w = PAGE_W - 92
    while c.stringWidth(line, "Helvetica", 10.5) > max_w and "   \u2022   " in line:
        parts = line.split("   \u2022   ")
        mid = len(parts) // 2
        c.drawString(56, y, "   \u2022   ".join(parts[:mid]))
        y -= 16
        line = "   \u2022   ".join(parts[mid:])
    c.drawString(56, y, line)
    y -= 30

    # FOR PARENTS box
    box_h = 60
    c.setFillColorRGB(*CREAM)
    c.roundRect(46, y - box_h, PAGE_W - 92, box_h, 10, stroke=0, fill=1)
    c.setFillColorRGB(*ORANGE)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(60, y - 20, "\u2764 FOR PARENTS")
    c.setFillColorRGB(*INK)
    c.setFont("Helvetica", 10)
    top3 = ", ".join(words[:3])
    c.drawString(60, y - 40, f"Ask your child to say these words at home: {top3}.")
    y -= box_h + 30

    c.setFont("Helvetica", 10)
    c.setFillColorRGB(*INK)
    c.drawString(46, y, "Parent signature: ____________________")
    c.drawString(320, y, "Teacher signature: ____________________")

    c.setFillColorRGB(*MUTED)
    c.setFont("Helvetica-Oblique", 9)
    c.drawCentredString(PAGE_W / 2, 34, "Lumio English \u2014 Learn, Speak, Grow")

def make_worksheet(lesson, num):
    nn = f"{num:02d}"
    path = f"worksheets/{LEVEL}/lesson{nn}-homework.pdf"
    c = canvas.Canvas(path, pagesize=A4)
    draw_worksheet(c, lesson, num)
    c.showPage()
    c.save()
    return path

# ================= FLASHCARDS =================
def draw_card_front(c, x, y, w, h, word):
    c.setDash(3, 3)
    c.setStrokeColorRGB(*MUTED)
    c.roundRect(x, y, w, h, 8, stroke=1, fill=0)
    c.setDash()
    img_path = vocab_image_path(word["en"])
    img_size = min(w - 20, h - 46)
    img_x = x + (w - img_size) / 2
    img_y = y + h - img_size - 14
    if img_path:
        try:
            c.drawImage(ImageReader(img_path), img_x, img_y, img_size, img_size,
                        preserveAspectRatio=True, anchor="c", mask="auto")
        except Exception:
            img_path = None
    if not img_path:
        c.setFillColorRGB(*CREAM)
        c.roundRect(img_x, img_y, img_size, img_size, 10, stroke=0, fill=1)
        c.setFillColorRGB(*ORANGE)
        c.setFont("Helvetica-Bold", min(img_size * 0.5, 40))
        c.drawCentredString(x + w / 2, img_y + img_size / 2 - 12, word["en"][0].upper())
    c.setFillColorRGB(*INK)
    fontsize = 13 if len(word["en"]) <= 12 else 10
    c.setFont("Helvetica-Bold", fontsize)
    c.drawCentredString(x + w / 2, y + 12, word["en"])

def draw_card_back(c, x, y, w, h, word):
    c.setDash(3, 3)
    c.setStrokeColorRGB(*MUTED)
    c.roundRect(x, y, w, h, 8, stroke=1, fill=0)
    c.setDash()
    c.setFillColorRGB(*TEAL)
    c.setFont("NotoArabic-Bold", 20)
    c.drawCentredString(x + w / 2, y + h / 2 - 8, word["ar"])

def make_flashcards(lesson, num):
    nn = f"{num:02d}"
    words = lesson["vocab"]
    n = len(words)
    cols = min(4, max(3, math.ceil(n / 2)))
    rows = math.ceil(n / cols)
    margin_x, margin_y, top = 40, 40, 90
    gap = 12
    grid_w = PAGE_W - margin_x * 2
    grid_h = PAGE_H - top - margin_y
    card_w = (grid_w - gap * (cols - 1)) / cols
    card_h = (grid_h - gap * (rows - 1)) / rows

    path = f"flashcards/{LEVEL}/lesson{nn}-flashcards.pdf"
    c = canvas.Canvas(path, pagesize=A4)

    def header(text):
        c.setFillColorRGB(*INK)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(margin_x, PAGE_H - 50, "Lumio English \u2014 " + LEVEL.upper() + " Lesson " + str(num) + " \u2014 print double-sided, flip on long edge")

    # grid positions (row-major, top to bottom)
    positions = []
    for r in range(rows):
        for col in range(cols):
            idx = r * cols + col
            if idx >= n:
                continue
            x = margin_x + col * (card_w + gap)
            y = PAGE_H - top - (r + 1) * card_h - r * gap
            positions.append((idx, x, y))

    # PAGE 1 — fronts (image + English)
    header("front")
    for idx, x, y in positions:
        draw_card_front(c, x, y, card_w, card_h, words[idx])
    c.showPage()

    # PAGE 2 — backs (Arabic), each row mirrored so it lines up after a
    # long-edge flip when printing double-sided
    header("back")
    for r in range(rows):
        row_items = [(idx, x, y) for (idx, x, y) in positions if idx // cols == r]
        n_in_row = len(row_items)
        for pos_in_row, (idx, x, y) in enumerate(row_items):
            mirrored_col = n_in_row - 1 - pos_in_row
            mx = margin_x + mirrored_col * (card_w + gap)
            draw_card_back(c, mx, y, card_w, card_h, words[idx])
    c.showPage()
    c.save()
    return path

# ================= MAIN =================
def main():
    files = sorted(glob.glob(f"lessons/{LEVEL}/lesson*.json"))
    for f in files:
        d = json.load(open(f, encoding="utf-8"))
        num = d["number"]
        wp = make_worksheet(d, num)
        fp = make_flashcards(d, num)
        print(f"Lesson {num:02d}: {wp}, {fp}")

if __name__ == "__main__":
    main()
