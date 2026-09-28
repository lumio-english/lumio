// gen_pptx_deck.js — reusable PPTX slide-builder library for converting
// Present decks to PowerPoint.
//
// STATUS: pilot only. 5 of ~21 slide types are built and verified
// (Cover, Hook, First Listen, Vocabulary, Quiz). See README.md in this
// folder for the full methodology, the interactivity design decision,
// and exactly what's built vs. still needed before this could run
// across the whole platform.
//
// Run from the REPO ROOT (the lumio/ folder), not from this
// directory -- every asset path below is relative to repo root, e.g.
// "assets/logo/lumio-logo.png", "assets/vocab/hobby.png". The two
// background PNGs this file references (bg_dark_gradient.png,
// bg_dark_content.png) live alongside this file in
// _docs/pptx-conversion/ -- regenerate them with gen_backgrounds.py
// if the color palette ever changes; this file does not regenerate
// them itself.
//
// Example usage (see also the bottom of this file):
//   const { pres, slideCover, slideHook, ... } = require("./_docs/pptx-conversion/gen_pptx_deck.js");
//   slideCover({ title: "Meet the Crew", vocab: [{en:"hang out"}, ...] }, "assets/lesson-bg/level3/01.jpg");
//   slideHook(2, 48, "BEFORE WE START", "Think of your closest friends...", "ziad-teen-happy", "38BDF8");
//   pres.writeFile({ fileName: "level3-lesson01.pptx" });

const pptxgen = require("pptxgenjs");
const path = require("path");

// ===== Coordinate system =====
// Reference canvas is 1600x900 CSS px, matching present.html's
// slideStage exactly. PPTX LAYOUT_WIDE is 13.333in x 7.5in -- exactly
// 120px per inch, so every position/size copied straight out of a
// generated slide-content/*.html file can be translated by simple
// division, not eyeballed or approximated. This was validated
// empirically against a real reference screenshot before trusting it
// for anything else (see README.md, "Coordinate calibration").
const PX = 120;
const px = (n) => n / PX;

// Font-size conversion: PPTX fontSize is in points. This canvas's
// 120px = 1in = 72pt scale means 1px = 0.6pt, and 1rem = 16px in the
// source CSS (no root font-size override found in present.html), so
// rem -> pt = rem * 16 * 0.6 = rem * 9.6. Multiply every rem value
// copied from a deck_template_*.py f-string by 9.6 to get its PPTX
// fontSize. Confirmed empirically (see README.md) -- do not trust a
// "looks about right" eyeballed size instead.
const REM = 9.6;

// ===== Palette (exact values from lib/deck_template_teen.py) =====
// Keep these in sync by hand if the source palette ever changes --
// there is no automated link between the two files.
const INK = "EDE9FB";
const INK_DIM = "A79BD1";
const CARD_BG = "FFFFFF";
const CARD_TEXT = "2B2640";
const PURPLE = "8B5CF6";
const PURPLE_DEEP = "7C3AED";
const ORANGE = "F97316";
const ORANGE_DEEP = "EA580C";
const TEAL = "14B8A6";
const TEAL_DEEP = "0D9488";
const BORDER = "4A3B7A";

const FONT_HEAD = "Fredoka";
const FONT_BODY = "Nunito";

// Fredoka and Nunito are Google Fonts, not installed on most Windows/
// Mac systems by default. PowerPoint will substitute a fallback font
// (still readable, just not the exact intended look) unless the
// presenting machine has both fonts installed. Attempting to embed
// them directly into the .pptx was considered and deliberately not
// done for this pilot -- it requires hand-editing the OOXML package
// structure, which pptxgenjs doesn't support and which carries real
// risk of producing a corrupt file. Simplest fix: install both fonts
// (free, from Google Fonts) on whatever machine will present these.

const BG_DIR = path.join(__dirname); // this folder, for the two generated background PNGs

let pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333in x 7.5in, matches the 1600x900 canvas's aspect ratio

// ===== Shared header/background helpers =====

function contentHeader(slide, chip, chipColor, n, total) {
  slide.addImage({ path: "assets/logo/lumio-logo.png", x: px(40), y: px(22), w: px(30), h: px(30) });
  slide.addText("LUMIO ENGLISH", {
    x: px(80), y: px(22), w: px(220), h: px(30),
    fontFace: FONT_HEAD, fontSize: 0.85 * REM, color: INK, valign: "middle", charSpacing: 0.5,
  });
  const chipW = px(Math.max(90, chip.length * 9 + 32));
  slide.addShape("roundRect", {
    x: 6.667 - chipW / 2, y: px(22), w: chipW, h: px(30),
    rectRadius: 0.05, fill: { color: chipColor, transparency: 86 }, line: { type: "none" },
  });
  slide.addText(chip, {
    x: 6.667 - chipW / 2, y: px(22), w: chipW, h: px(30),
    fontFace: FONT_HEAD, fontSize: 0.95 * REM, color: INK, align: "center", valign: "middle",
  });
  slide.addText(`${n} / ${total}`, {
    x: px(1400), y: px(22), w: px(160), h: px(30),
    fontFace: FONT_BODY, fontSize: 0.8 * REM, bold: true, color: INK_DIM, align: "right", valign: "middle",
  });
  const pct = n / total;
  slide.addShape("roundRect", {
    x: px(40), y: px(74), w: px(1520), h: px(3),
    rectRadius: 0.02, fill: { color: BORDER }, line: { type: "none" },
  });
  slide.addShape("roundRect", {
    x: px(40), y: px(74), w: px(1520 * pct), h: px(3),
    rectRadius: 0.02, fill: { color: chipColor }, line: { type: "none" },
  });
}

function cornerChar(slide, name, heightPx) {
  const h = heightPx || 300;
  const w = h * 0.72; // character art is natively ~3:4, matches CSS height:Npx + auto width
  slide.addImage({ path: `assets/story/characters/${name}.png`, x: px(1600 - 30 - w), y: px(900 - 64 - h), w: px(w), h: px(h) });
}

// ===== Slide: Cover / Title =====
// lessonBgPath: the level's lesson-background photo, e.g.
// "assets/lesson-bg/level3/01.jpg" (one per lesson, already exists
// for every lesson in the repo).
function slideCover(lesson, lessonBgPath) {
  let s = pres.addSlide();
  s.background = { path: lessonBgPath };
  s.addShape("rect", {
    x: 0, y: 0, w: 13.333, h: 7.5,
    fill: { color: "1C1038", transparency: 12 }, line: { type: "none" },
  });
  // Vertically-centered stack, computed from each element's own height
  // -- CSS's flex column + justify-content:center has no direct PPTX
  // equivalent, so the block's total height and start-y are computed
  // by hand here rather than guessed. cy is the running y cursor.
  let cy = 332;
  s.addImage({ path: "assets/logo/lumio-logo.png", x: px(800 - 22 - 90), y: px(cy), w: px(44), h: px(44) });
  s.addText("LUMIO ENGLISH", {
    x: px(800 - 22 - 90 + 54), y: px(cy + 7), w: px(300), h: px(30),
    fontFace: FONT_HEAD, fontSize: 1.1 * REM, color: "FFFFFF", charSpacing: 1, valign: "middle",
  });
  cy += 58;
  s.addShape("roundRect", {
    x: px(624), y: px(cy), w: px(1600 - 624 - 624), h: px(24),
    rectRadius: 0.06, fill: { color: PURPLE, transparency: 82 }, line: { color: PURPLE, width: 0.5, transparency: 60 },
  });
  s.addText("VOCABULARY & GRAMMAR", {
    x: px(500), y: px(cy), w: px(600), h: px(24),
    fontFace: FONT_HEAD, fontSize: 0.72 * REM, color: "FFFFFF", align: "center", valign: "middle", charSpacing: 1,
  });
  cy += 24 + 16;
  s.addText(lesson.title, {
    x: px(300), y: px(cy), w: px(1000), h: px(60),
    fontFace: FONT_HEAD, fontSize: 3.1 * REM, bold: false, color: "FFFFFF", align: "center", valign: "top",
  });
  cy += 60 + 14;
  s.addText(lesson.vocab.map(v => v.en).join("  \u00b7  "), {
    x: px(300), y: px(cy), w: px(1000), h: px(22),
    fontFace: FONT_BODY, fontSize: 1.05 * REM, bold: true, color: INK_DIM, align: "center",
  });
  cy += 22 + 22;
  const xpW = px(150);
  s.addShape("roundRect", {
    x: px(800) - xpW / 2, y: px(cy), w: xpW, h: px(26),
    rectRadius: 0.13, fill: { color: ORANGE }, line: { type: "none" },
  });
  s.addText("\u26a1 +60 XP", {
    x: px(800) - xpW / 2, y: px(cy), w: xpW, h: px(26),
    fontFace: FONT_HEAD, fontSize: 0.85 * REM, color: "FFFFFF", align: "center", valign: "middle",
  });
  return s;
}

// ===== Slide: Hook =====
function slideHook(n, total, eyebrow, question, charName, themeColor) {
  let s = pres.addSlide();
  s.background = { path: path.join(BG_DIR, "bg_dark_content.png") };
  contentHeader(s, "Hook", themeColor, n, total);
  s.addText(eyebrow, {
    x: px(60), y: px(198), w: px(560), h: px(20),
    fontFace: FONT_HEAD, fontSize: 0.78 * REM, color: INK_DIM, charSpacing: 1.2,
  });
  s.addText(question, {
    x: px(60), y: px(222), w: px(580), h: px(200),
    fontFace: FONT_HEAD, fontSize: 2 * REM, color: "FFFFFF", valign: "top",
  });
  cornerChar(s, charName, 300);
  return s;
}

// ===== Slide: First Listen (dialogue) =====
// dialogue: array of [side, topPx, englishText, arabicText], side is
// "left" or "right", topPx is the exact y-position copied from the
// source slide-content HTML.
function slideFirstListen(n, total, dialogue, themeColor) {
  let s = pres.addSlide();
  s.background = { path: path.join(BG_DIR, "bg_dark_content.png") };
  contentHeader(s, "First Listen", themeColor, n, total);
  // Positioned at y=84, not the source HTML's ~110 -- the source
  // positions the instructional text so close to the first dialogue
  // bubble that they visually overlap there too (confirmed against
  // the actual reference screenshot before "fixing" this, since it
  // turned out to be a pre-existing minor defect in the source HTML
  // itself, not something to faithfully replicate). y=84 clears the
  // first bubble's top edge with real margin.
  s.addText("Listen first. Don't worry about understanding every word -- just get the gist.", {
    x: px(300), y: px(84), w: px(1000), h: px(24),
    fontFace: FONT_BODY, fontSize: 0.9 * REM, bold: true, color: INK_DIM, align: "center", valign: "top",
  });
  dialogue.forEach(([side, top, en, ar]) => {
    const bw = 480, bh = 84;
    const bx = side === "left" ? 60 : 1600 - 60 - bw;
    s.addShape("roundRect", {
      x: px(bx), y: px(top), w: px(bw), h: px(bh),
      rectRadius: 0.04, fill: { color: CARD_BG }, line: { type: "none" },
      shadow: { type: "outer", color: "000000", opacity: 0.25, blur: 10, offset: 4, angle: 90 },
    });
    s.addText(en, {
      x: px(bx + 18), y: px(top + 10), w: px(bw - 36), h: px(38),
      fontFace: FONT_BODY, fontSize: 0.92 * REM, bold: true, color: CARD_TEXT, valign: "top",
    });
    s.addText(ar, {
      x: px(bx + 18), y: px(top + 46), w: px(bw - 36), h: px(28),
      fontFace: FONT_BODY, fontSize: 0.76 * REM, bold: true, color: "8A8398", align: "right", rtlMode: true, valign: "top",
    });
  });
  return s;
}

// ===== Slide: Vocabulary (with embedded, clickable audio) =====
// imgSlug: the vocab image's filename without extension or path,
// e.g. "hang-out" for assets/vocab/hang-out.png.
// audioPath: real repo-relative path, e.g. "assets/audio/hang-out.mp3",
// or null/undefined if no recording exists yet for this word -- the
// Listen button still renders, it just won't have embedded audio.
function slideVocab(n, total, word, ar, example, imgSlug, audioPath, themeColor) {
  let s = pres.addSlide();
  s.background = { path: path.join(BG_DIR, "bg_dark_content.png") };
  contentHeader(s, `Vocabulary \u00b7 ${word}`, themeColor, n, total);
  s.addShape("roundRect", {
    x: px(40), y: px(184), w: px(410), h: px(410),
    rectRadius: 0.03, fill: { color: CARD_BG }, line: { color: "000000", transparency: 94, width: 0.75 },
    shadow: { type: "outer", color: "000000", opacity: 0.28, blur: 14, offset: 6, angle: 90 },
  });
  s.addImage({
    path: `assets/vocab/${imgSlug}.png`, x: px(60), y: px(204), w: px(370), h: px(370),
    sizing: { type: "contain", w: px(370), h: px(370) },
  });
  const tx = 40 + 410 + 22;
  s.addShape("roundRect", {
    x: px(tx), y: px(184), w: px(560), h: px(300),
    rectRadius: 0.03, fill: { color: CARD_BG }, line: { color: "000000", transparency: 94, width: 0.75 },
    shadow: { type: "outer", color: "000000", opacity: 0.28, blur: 14, offset: 6, angle: 90 },
  });
  s.addText(word, {
    x: px(tx + 36), y: px(184 + 32), w: px(500), h: px(46),
    fontFace: FONT_HEAD, fontSize: 2.4 * REM, color: CARD_TEXT, valign: "top",
  });
  const arW = px(Math.max(140, ar.length * 13 + 36));
  s.addShape("roundRect", {
    x: px(tx + 36), y: px(184 + 88), w: arW, h: px(30),
    rectRadius: 0.05, fill: { color: "E6FBF8" }, line: { type: "none" },
  });
  s.addText(ar, {
    x: px(tx + 36), y: px(184 + 88), w: arW, h: px(30),
    fontFace: FONT_BODY, fontSize: 1 * REM, bold: true, color: TEAL_DEEP, align: "center", valign: "middle", rtlMode: true,
  });
  s.addText("EXAMPLE", {
    x: px(tx + 36), y: px(184 + 148), w: px(300), h: px(18),
    fontFace: FONT_HEAD, fontSize: 0.75 * REM, color: ORANGE_DEEP, charSpacing: 1.2,
  });
  s.addText(`\u201c${example}\u201d`, {
    x: px(tx + 36), y: px(184 + 170), w: px(480), h: px(40),
    fontFace: FONT_BODY, fontSize: 1.15 * REM, bold: true, italic: true, color: CARD_TEXT, valign: "top",
  });
  const btnW = px(150), btnH = px(46);
  s.addShape("roundRect", {
    x: px(tx + 36), y: px(184 + 224), w: btnW, h: btnH,
    rectRadius: 0.15, fill: { color: ORANGE }, line: { type: "none" },
  });
  s.addText("\u25b6 Listen", {
    x: px(tx + 36), y: px(184 + 224), w: btnW, h: btnH,
    fontFace: FONT_HEAD, fontSize: 0.9 * REM, color: "FFFFFF", align: "center", valign: "middle",
  });
  if (audioPath) {
    s.addMedia({
      type: "audio", path: audioPath,
      x: px(tx + 36) + btnW - 0.35, y: (184 + 224) / PX + btnH / 2 - 0.175, w: 0.35, h: 0.35,
    });
  }
  s.addShape("roundRect", {
    x: px(1600 - 40 - 150), y: px(900 - 26 - 48), w: px(150), h: px(48),
    rectRadius: 0.2, fill: { color: "FFFFFF", transparency: 94 }, line: { type: "none" },
  });
  s.addImage({ path: "assets/story/characters/omar-teen-wave.png", x: px(1600 - 40 - 150 + 5), y: px(900 - 26 - 48 + 5), w: px(38), h: px(38) });
  s.addText("guide", {
    x: px(1600 - 40 - 150 + 48), y: px(900 - 26 - 48), w: px(90), h: px(48),
    fontFace: FONT_HEAD, fontSize: 0.72 * REM, color: INK_DIM, valign: "middle",
  });
  return s;
}

// ===== Slide: Quiz (Vocabulary Check / Grammar Check) =====
// Two-slide reveal pattern instead of real click-to-check
// interactivity, which PPTX cannot do without VBA macros (Windows-
// only, typically blocked by default in schools, and not something
// pptxgenjs or python-pptx can author). Call this twice per question:
// once with reveal=false (the question, as students see it first),
// then again with reveal=true (identical layout, correct option
// highlighted green with a checkmark, wrong ones dimmed). This is
// standard slide navigation only -- no animation triggers -- so it
// behaves identically in PowerPoint, Keynote, Google Slides, and
// LibreOffice, and the teacher just clicks Next once to reveal.
// imgSlug is optional -- pass null for a text-only question (e.g. most
// Grammar Check questions, which show a sentence with a blank rather
// than a picture).
function slideQuiz(n, total, chipLabel, imgSlug, prompt, options, correctIdx, themeColor, reveal) {
  let s = pres.addSlide();
  s.background = { path: path.join(BG_DIR, "bg_dark_content.png") };
  contentHeader(s, chipLabel, themeColor, n, total);
  if (imgSlug) {
    s.addShape("roundRect", {
      x: px(60), y: px(200), w: px(260), h: px(260),
      rectRadius: 0.03, fill: { color: CARD_BG }, line: { color: "000000", transparency: 94, width: 0.75 },
      shadow: { type: "outer", color: "000000", opacity: 0.28, blur: 14, offset: 6, angle: 90 },
    });
    s.addImage({
      path: `assets/vocab/${imgSlug}.png`, x: px(70), y: px(210), w: px(240), h: px(240),
      sizing: { type: "contain", w: px(240), h: px(240) },
    });
  }
  s.addText(prompt, {
    x: px(600), y: px(150), w: px(600), h: px(40),
    fontFace: FONT_HEAD, fontSize: 1.5 * REM, color: INK, valign: "top",
  });
  const positions = [[600, 210], [880, 210], [600, 300], [880, 300]];
  options.forEach((opt, i) => {
    const [ox, oy] = positions[i];
    const isCorrect = i === correctIdx;
    let fill = CARD_BG, lineColor = "EEF0F4", textColor = CARD_TEXT;
    if (reveal && isCorrect) { fill = "DCFCE7"; lineColor = "16A34A"; textColor = "166534"; }
    else if (reveal) { fill = "FAFAFA"; lineColor = "EEF0F4"; textColor = "9CA3AF"; }
    s.addShape("roundRect", {
      x: px(ox), y: px(oy), w: px(250), h: px(76),
      rectRadius: 0.03, fill: { color: fill }, line: { color: lineColor, width: reveal && isCorrect ? 2 : 0.75 },
    });
    s.addText((reveal && isCorrect ? "\u2713  " : "") + opt, {
      x: px(ox), y: px(oy), w: px(250), h: px(76),
      fontFace: FONT_HEAD, fontSize: 1.05 * REM, color: textColor, align: "center", valign: "middle",
    });
  });
  return s;
}

module.exports = {
  pres, px, PX, REM, contentHeader, cornerChar,
  slideCover, slideHook, slideFirstListen, slideVocab, slideQuiz,
  INK, INK_DIM, CARD_BG, CARD_TEXT, PURPLE, PURPLE_DEEP, ORANGE, ORANGE_DEEP,
  TEAL, TEAL_DEEP, BORDER, FONT_HEAD, FONT_BODY,
};
