# Converting Present decks to PPTX — methodology guide

**Status: pilot only.** 5 of roughly 21 slide types are built and
verified (Cover, Hook, First Listen, Vocabulary, Quiz). This document
captures the approach, the decisions behind it, and every real gotcha
found while building the pilot, so the remaining slide types and the
remaining ~139 lessons can be built the same way instead of
re-discovering the same things twice.

Piloted on Level 3, Lesson 1 ("Meet the Crew").

## Why this exists

Eslam asked to convert Present's materials from HTML to PPTX while
keeping every interactive element (quiz choices, audio, etc.). Before
building anything, the tool possibilities were checked carefully:

- **PPTX cannot do real click-to-check interactivity** the way the
  current HTML/JS decks do (click an answer, get instant per-choice
  feedback, track a score). That requires either JavaScript (which
  PPTX files can't run at all) or VBA macros, which are Windows-only,
  blocked by default in most schools/organizations for security
  reasons, and not something `pptxgenjs` or `python-pptx` can author.
  This is a hard format limitation, not a tooling gap to work around.
- **Audio genuinely works.** PPTX supports embedded audio with a
  click-to-play icon, and it looks and behaves natively in PowerPoint.
- **Gradients don't work.** `pptxgenjs` has no gradient-fill option on
  shapes or slide backgrounds at all. Any gradient has to be a
  pre-rendered image used as a background picture instead.

Given the above, the interactivity design settled on was a
**two-slide reveal pattern**: build the question slide, then build an
identical second slide with the correct answer highlighted. The
teacher clicks "Next" once to reveal it — no animation triggers, no
VBA, just standard slide navigation, so it behaves identically in
PowerPoint, Keynote, Google Slides, and LibreOffice. This was a
deliberate trade-off Eslam explicitly signed off on before any slides
were built.

## Files in this folder

- **`gen_pptx_deck.js`** — the actual reusable library. Exports `pres`
  (the shared pptxgenjs presentation object) plus one function per
  built slide type (`slideCover`, `slideHook`, `slideFirstListen`,
  `slideVocab`, `slideQuiz`) and a couple of shared helpers
  (`contentHeader`, `cornerChar`) that every content slide type reuses
  for its top bar. Run from the **repo root** — every asset path
  inside it (vocab images, character art, audio, the logo) is written
  relative to repo root, e.g. `assets/vocab/hobby.png`, not relative
  to this folder.
- **`gen_backgrounds.py`** — regenerates the two background PNGs
  `gen_pptx_deck.js` depends on (see below). Only needs re-running if
  the dark-theme palette in `lib/deck_template_teen.py` ever changes.
- **`bg_dark_gradient.png`, `bg_dark_content.png`** — the pre-generated
  output of the script above, committed directly so nobody has to
  regenerate them just to use the library.

## Coordinate system

The reference canvas is `1600x900` CSS px, matching `present.html`'s
`slideStage` exactly. PPTX's `LAYOUT_WIDE` is `13.333in x 7.5in` —
**exactly 120px per inch**, so any position or size value copied
straight out of a generated `slide-content/*.html` file's inline
styles can be translated with simple division, not eyeballed:

```js
const PX = 120;
const px = (n) => n / PX;
// e.g. a CSS "left:600px" becomes px(600) as the PPTX x-coordinate
```

### Font sizing

PPTX's `fontSize` is in points. Given the 120px = 1in = 72pt scale
above, `1px = 0.6pt`. The source CSS uses `rem` units with no root
`font-size` override anywhere in `present.html`, so `1rem = 16px`
(the browser default). Combining both:

```
rem → pt = rem × 16 × 0.6 = rem × 9.6
```

So a CSS `font-size:1.1rem` becomes `fontSize: 1.1 * 9.6` in
`pptxgenjs`. **This was not assumed — it was calibrated empirically**
against a real reference screenshot before being trusted for anything
else. The process: build a slide with eyeballed/guessed sizes first,
render it to an image, stack it directly against the reference
screenshot at the same pixel scale, and measure the actual size gap.
The first attempt (before this calibration) used sizes roughly 40%
too large across the board — logo, title, badges, everything visibly
oversized compared to the reference — until this formula was derived
and reapplied. Do this calibration step again if the platform's CSS
base font-size or DPI assumptions ever change; don't just trust the
formula blindly forever.

### Vertical centering

CSS's `display:flex; flex-direction:column; justify-content:center`
(used by the Cover slide, among others) has **no direct PPTX
equivalent** — there's no "auto-center this stack of elements"
primitive. The workaround used throughout: compute each element's
real rendered height by hand, sum them (plus their CSS margins) to
get the total block height, then compute the starting y so the whole
block sits centered in the 900px-tall canvas. See the `cy` running
cursor in `slideCover()` for a worked example. This has to be redone
per slide type whenever a new one needs vertical centering — it's not
automated.

## Known defects found and fixed during the pilot

These are worth knowing about specifically because they were subtle —
each one looked like something else at first.

### 1. Text silently clipped due to box-height + center-anchor

A text box given too little `h` for its actual wrapped content, with
the default center vertical anchor, doesn't overflow visibly the way
a browser would — LibreOffice/PowerPoint centers the overflow around
the box's *declared* midpoint, which pushes part of the text above
the box's visible top edge. The `First Listen` slide's instructional
line ("Listen first...") first rendered with its opening word
invisible this way. **Fix: always give text boxes a generous `h` for
however many lines they might wrap to, and set `valign: "top"`
explicitly** rather than relying on the (auto-centered) default,
unless a box is truly guaranteed single-line.

### 2. A genuine z-order/position collision, traced back to the source

After fixing #1, the same text was *still* partially covered — this
time because the instructional text (`y:110`) and the first dialogue
bubble (also `y:110`, drawn afterward and thus on top in z-order)
were positioned to overlap. Checked the actual reference screenshot
before "fixing" this, and confirmed **the same overlap exists in the
live HTML/CSS deck too** — this is a pre-existing minor layout bug in
the source, not something introduced by the conversion. Decision: fix
it in the PPTX version anyway (moved the text to `y:84`) rather than
faithfully reproduce a bug, since "same quality" should mean matching
the *intended* design, not an accidental defect. If this comes up
again elsewhere, use the same judgment call: check the reference
first, and don't blindly replicate something that's clearly a bug in
the original.

### 3. Gradient banding

The first version of the dark gradient background (generated with
simple per-pixel linear interpolation, integer-rounded) showed
visible banding/stepping in the smooth purple-to-near-black transition
once rendered. Fixed by adding a small amount of random per-pixel
dither noise before rounding to 8-bit color (see `gen_backgrounds.py`,
`base_gradient()`). Any newly generated gradient background should use
the same dithering approach, not a naive interpolation.

### 4. Shell string-escaping corrupted generated JS

Early in the pilot, JS code containing template literals
(`` `${...}` ``) was generated via `bash_tool` running
`python3 -c "..."` with the JS as a Python string — the shell's own
`$()`/`${}` interpolation silently mangled parts of the output (e.g.
`${imgName}.png` became a literal empty string, because the shell
tried to expand it as its own variable). **Fix: write JS (or any code
containing `$`/backtick syntax) with the file-writing tools directly
(`create_file`/`str_replace`), never by piping it through a shell
command line.** This cost real time to diagnose the first time it
happened (a `NameError` several function-calls away from the actual
corruption, not an obvious syntax error at the point of damage).

## Verification methodology used throughout

For every slide type built, before moving to the next one:

1. Generate a small standalone test `.pptx` with just that slide (or
   a couple of slides) via a throwaway script — never commit test
   files themselves.
2. Validate the file: `python3 /mnt/skills/public/pptx/scripts/office/validate.py <file>.pptx`
3. Convert to images for a real visual check (LibreOffice headless,
   which is what will actually render the file for anyone opening
   it, not just trust the XML looks right):
   ```
   python3 /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf <file>.pptx
   pdftoppm -jpeg -r 150 <file>.pdf <prefix>
   ```
4. **Stack the rendered image directly against the real reference
   screenshot at matching scale** (not eyeballed side-by-side) —
   this is what caught the ~40%-oversized-fonts issue and the two
   text-overlap defects above. A quick way to do this:
   ```python
   from PIL import Image
   ref = Image.open("reference.png")          # 1600x900
   test = Image.open("rendered.jpg").resize((1600, 900))
   combo = Image.new("RGB", (1600, 1810), "white")
   combo.paste(ref, (0, 0)); combo.paste(test, (0, 910))
   combo.save("side_by_side.png")
   ```
5. Only after a visual match is confirmed, move to the next slide
   type — don't build several slide types before checking any of
   them, since fixing a systemic issue (like the font-size formula)
   after multiple slide types are already built means redoing all of
   them.

## Reference screenshots

The pilot used real `present.html` screenshots of Level 3 Lesson 1 as
the ground truth throughout. These were **not saved anywhere
persistent** (they lived only in the sandbox scratch space for that
session). To resume or extend this work, regenerate them the same
way: load the real deck in `present.html` via Playwright, screenshot
each slide, and use those as the comparison target — don't trust
memory or guess at what a slide "should" look like.

## What's NOT done yet

- **16 more slide types** for the teen track alone: Practice, Pair
  Check, Quick Check-In, Grammar Time intro, Notice the Pattern,
  Build the Sentence, Grammar Practice, Common Mistake, Your Turn,
  Challenge, Real Life Connection, Discussion Time, Recap, Session
  Complete, Grammar Recap, Describing Time. Most of these are
  variations on the same "white card on the dark background" pattern
  already proven by the slide types that exist — the remaining work
  is faster than what's done, not slower.
- **The entire young track** (Pre-A, Level 1, Level 2) uses a
  completely different visual system (`lib/deck_template_v2.py` —
  warm cream background, Baloo 2 font, rounded pastel cards, no
  dark-theme gradient at all). None of this pilot's dark-theme
  background/palette work transfers directly; it needs its own
  equivalent pass, following the same methodology (calibrate against
  a real reference screenshot, verify visually before moving on) but
  building a fresh palette and set of slide-type functions.
- **Font embedding** was considered and explicitly not attempted (see
  the note in `gen_pptx_deck.js`) — Fredoka/Nunito need to be
  installed on whatever machine presents these, or PowerPoint
  substitutes a fallback font. This is a real, known limitation to
  flag to Eslam again once real deployment is being planned, not
  something silently fixed here.
- **Scaling to all ~140 lessons** once every slide type is built: this
  will mean writing a proper generator script (mirroring the existing
  `gen_slides_level*.py` pattern) that reads each lesson's real JSON
  data and calls the right sequence of `slideXxx()` functions — the
  pilot only ever hand-wrote one lesson's worth of slide calls
  directly in a test script, it never built that generator layer.
