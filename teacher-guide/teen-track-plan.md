# Teen Track — Full Skin Plan (Level 3+)

## Why a full skin, not a tweak
Level 3+ currently runs the identical visual/tonal identity as Pre-A/
Level 1/2 — same mascot-forward framing, same "Amazing! Three stars!
🎉" copy, same bubble/sparkle aesthetic calibrated for a 5-year-old.
For a 9-13+ audience, that reads as babyish regardless of how good
the content underneath is. Fixing this means changing what the
material *looks and sounds like*, not just what's in it.

## Design system

**Typography** — Baloo 2 (rounded bubble font) is dropped entirely
from Teen Track. Fredoka (already loaded in the font stack, unused
until now) becomes the heading font — geometric, clean, reads as
"modern app" not "storybook." Nunito stays for body text, already
neutral enough to work for both tracks.

**Color** — Same brand hues (orange #F97316, teal #0D9488), rebalanced.
Junior washes whole cards in pastel cream/orange. Teen flips the
ratio: dark charcoal/navy backgrounds (#1E1B2E-ish) as the dominant
surface, orange/teal used only as sharp accents (buttons, progress,
highlights) — closer to how Duolingo/Kahoot use color than to a
nursery palette.

**Shape** — Junior uses heavy pill/bubble radii (24-28px) and floating
sparkle decorations everywhere. Teen uses tighter corners (10-12px),
no sparkles, thin 1px hairline borders instead of soft drop-shadowed
cards — a "dashboard" feel, not a "toy" feel.

**Characters** — Lumi/Omar/Noor/Sara stay (no budget for a new teen
art set right now), but shrink and move to a corner "guide" badge
instead of a large illustrated figure taking up a third of the slide.
Present, not performing.

**Gamification copy** — Stars are replaced with XP + streak language
everywhere it's user-facing. "Amazing! Three stars! 🎉" → "+80 XP ·
Nice work." Underlying grading logic (stars 1-3 in localStorage)
stays untouched — Teen Track just displays a star→XP conversion
instead of reskinning the whole progress-storage system.

**Tone** — Cut exclamation-mark density and cheerleading. "Can you
say it?" → "Say it out loud." "Let's Learn!" → "Today's Goal."
Direct and confident, not encouraging-toward-a-toddler.

## Step-by-step build

1. **Design tokens + new template module** — `lib/deck_template_teen.py`,
   parallel to `deck_template_v2.py`, same slide *types* (title, goal,
   vocab, practice, dialogue, sentence builder, sound&spot, your turn,
   grammar, quiz, recap, reward), new skin throughout. Phonics stays
   Junior-only (already Level 1-2 scoped), so Teen Track has no
   phonics slide type at all.
2. **Pilot on one lesson** (Level 3, Lesson 1) — same review-before-
   rollout pattern as the very first restructure. You look at it live
   before I touch the other 39.
3. **Roll out to all Level 3 & 4 lessons** (40 lessons) once approved.
4. **Carry it forward as the template for Level 5+** — this becomes
   the standard for every level going forward, not a one-off.
5. *(Separate, later phase — not started yet)*: dashboard-level accents
   for Level 3+ users (student.html, hub-present.html) so the "skin
   change" feeling extends past just the lesson decks. Flagging this
   now so it's on the roadmap, not forgetting it.

Starting step 1 now.
