# Phonics Hub — Mouth-Shape Prompts for ChatGPT/DALL-E

Same treatment as `spelling-hub-mouth-prompts.md`, extended to cover the
Phonics curriculum (`phonics-hub/level1.json` and `level2.json`). Save each
image named exactly as shown and drop it into `assets/spelling/` — the
existing folder, not a new one, since mouth images are shared across both
the Spelling and Phonics hubs by letter/sound, not duplicated per hub.

## Scoping notes — read before generating

The phonics units list 54 letter/sound tiles total, but that's not 54 new
images to make:

- **5 already exist** from the Spelling Hub batch — `a`, `b`, `c`, `t`, `sh`.
  Not included below.
- **`k` and `ck`** are the exact same sound as `c` (/k/) — reuses
  `mouth-c.png` as-is, no new image.
- **4 entries are whole blended words**, not new sounds — `c-a-t`, `d-o-g`,
  `s-u-n`, `p-i-n` are demonstrations of blending already-covered individual
  letters together, not something a mouth image can add to.
- **The 17 consonant blends** (`bl, cl, fl, pl, sl, br, cr, dr, fr, gr, tr,
  sp, st, sk, sm, sn, sw`) are two sounds said in quick succession, not one
  new mouth position — a static image can't show a transition any better
  than looking at the two component letters' own images already do (e.g.
  for "bl", `mouth-b.png` then `mouth-l.png`). Recommend skipping these
  rather than generating 17 images that wouldn't actually teach anything a
  static picture can show. Flag if you'd rather have them anyway.

That leaves **26 real new images**: 20 individual letters, 3 true digraphs
(a single fused new sound, unlike a blend), and 3 long-vowel teams.

**Master style (already appended to every prompt below, same as before):**
> Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

---

## Batch 1 — Individual letters (20)

**`mouth-s.jpg`** — *the "sss" sound*
> teeth held close together, tongue tip near the ridge behind the upper teeth, a narrow gap for air to hiss through, lips slightly stretched back. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-p.jpg`** — *the "puh" sound*
> lips pressed together then popping open with a small visible puff of breath, cheeks slightly puffed. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-i.jpg`** — *the short "ih" sound (as in "it")*
> mouth slightly open, corners pulled back in a small smile, tongue high and toward the front. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-n.jpg`** — *the "nnn" sound*
> mouth slightly open, tongue tip pressed against the ridge behind the upper front teeth. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-m.jpg`** — *the "mmm" sound*
> lips gently pressed together and held closed, relaxed cheeks, a calm humming moment. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-d.jpg`** — *the "duh" sound*
> mouth slightly open, tongue tip touching just behind the upper front teeth, about to release. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-g.jpg`** — *the "guh" sound*
> mouth open, back of the tongue raised up toward the soft palate at the back of the mouth. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-o.jpg`** — *the short "oh" sound (as in "hot")*
> mouth open in a round shape, lips softly rounded, jaw dropped down. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-e.jpg`** — *the short "eh" sound (as in "egg")*
> mouth slightly open, corners relaxed and level, tongue mid-height toward the front. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-u.jpg`** — *the short "uh" sound (as in "up")*
> mouth slightly open and relaxed, lips neutral and soft, tongue central and low. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-r.jpg`** — *the "rrr" sound*
> lips slightly rounded and pushed forward, tongue curled back inside the mouth without touching anywhere. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-h.jpg`** — *the "huh" sound*
> mouth open and relaxed in a soft oval, a gentle breathy exhale, no special tongue position. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-f.jpg`** — *the "fff" sound*
> upper front teeth resting gently on the lower lip, air pushed out through the small gap. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-l.jpg`** — *the "lll" sound*
> mouth open, tongue tip touching just behind the upper front teeth, sides of the tongue relaxed and lowered. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-j.jpg`** — *the "juh" sound (as in "jump")*
> lips rounded and pushed slightly forward, tongue tip starting near the ridge behind the upper teeth then releasing softly. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-v.jpg`** — *the "vvv" sound*
> upper front teeth resting gently on the lower lip, same position as "f" but held a moment longer. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-w.jpg`** — *the "wuh" sound*
> lips rounded and pushed forward into a small circle, like blowing a gentle kiss. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-x.jpg`** — *the "ks" sound (as in "fox")*
> teeth held close together, tongue pulled back then tip moving forward, a quick double-sound shape. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-y.jpg`** — *the "yuh" sound*
> tongue raised high and close to the roof of the mouth, corners of the mouth slightly stretched, lips relaxed. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-z.jpg`** — *the "zzz" sound*
> teeth held close together, tongue tip near the ridge behind the upper teeth, same shape as "s" but buzzing. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

## Batch 2 — True digraphs: one fused new sound, not a blend (3)

**`mouth-ch.jpg`** — *the "ch" sound (as in "chip")*
> lips rounded and pushed forward, tongue tip touching the ridge behind the upper teeth then releasing with a soft puff, slightly harder release than "sh". Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-th.jpg`** — *the "th" sound (as in "think")*
> tongue tip placed gently between the upper and lower front teeth, clearly visible poking through. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-ng.jpg`** — *the "ng" sound (as in "ring")*
> mouth open, back of the tongue raised and held against the soft palate, relaxed jaw. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

## Batch 3 — Long-vowel teams (3)

**`mouth-ai.jpg`** — *the long "ay" sound (as in "rain")*
> mouth medium-open then narrowing slightly, lips gently stretched, a smooth gliding shape. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-ee.jpg`** — *the long "ee" sound (as in "tree")*
> lips stretched wide in a smile, mouth mostly closed, teeth close together and visible. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.

**`mouth-oa.jpg`** — *the long "oh" sound (as in "boat")*
> lips rounded into a small circle and pushed slightly forward, jaw relaxed and open. Simple friendly cartoon close-up of a child's mouth and lower face only (no eyes, no full face, no nose), clearly showing lip shape, teeth, and tongue position for the sound. Thick clean black outlines, warm soft skin tone, bright cheerful simple coloring consistent with a children's English-learning app, plain white background, no text or letters anywhere in the image, no watermark, square 1:1 composition, friendly and warm, aimed at Arabic-speaking kids ages 5-8.
