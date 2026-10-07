# Games, mini games and story: version 2 (previews)

The owner wants the level games, the classroom games, the Hub mini games and the story "enhanced to be like
version 2": far richer animation and motion, the same polish as the new try-it landing page
(design-previews/landing-tryit.html — read its CSS/JS for the motion language: GSAP timelines, springy taps,
stars flying to a counter, Lottie confetti/checks, masked text reveals, Lumi idle breathing/blinking).

**Keep the same content and the same photos.** Same words, sentences, questions, story text, game rules,
levels, rewards and the same images/audio files. This is a visual + motion upgrade, not a rewrite of the
learning content. Do not invent new words or story text.

## Files (new copies; the originals stay untouched for comparison)

- Level & classroom games: `games-v2/<same-file-name>.html`, made from `games/<same-file-name>.html`.
  `games-v2/` sits at the same depth as `games/`, so every `../js/...`, `../assets/...`, `../css/...` path keeps
  working. Same URL parameters (`?level=…&n=…&from=…`), same saving/progress calls into `Lumio` (js/app.js)
  as the original, so a v2 file could replace the original later with no other change.
- Hub mini games (today inside student.html: Memory Match, Word Pop, Word Builder — see student.html around
  the `memoryOverlay`, `wordpopOverlay`, `builderOverlay` code and `pickWords`/`loadLessonVocabForGames`):
  standalone v2 pages `games-v2/memory-match.html`, `games-v2/word-pop.html`, `games-v2/word-builder.html`
  using the same word source (lesson vocab from `../js/lessons-data.js` via `?level=&n=`, with the same picture
  and emoji faces as student.html) and the same rules/scoring.
- Story: `story-v2.html` (root, next to `story.html`), made from `story.html`, same `story-content/…` pages,
  same parts/pages/unlock rules and the same art from `assets/story/`.

## Motion and quality bar

- Libraries: `vendor/gsap-3.12.5.min.js` (+ `ScrollTrigger` if useful), `vendor/lottie-light-5.12.2.min.js` with
  `assets/lottie/{star-pop,check,flame,confetti}.json`, `vendor/three-r128.min.js` only where 3D genuinely
  helps (e.g. a reward moment) — never replace the real character art with 3D models.
- Characters are always the real art from `assets/story/characters/` / `assets/site/` (no drawn stand-ins).
- Every interaction gets feedback: press/spring scale on tap, correct = glow + star flies to a counter +
  sound (existing `Lumio.sfx`/`Lumio.speak` only), wrong = gentle shake, round transitions slide/scale,
  progress bars fill smoothly, a real end-of-game celebration (Lottie confetti + stars counting up).
- Intro/start screens get an orchestrated entrance; the mascot breathes/blinks/waves when idle.
- Kids (Pre-A–L2) bright and bouncy; teens (L3–L6) keep their themes but with smoother, cooler motion.
- 60fps intent: animate transform/opacity only; respect `prefers-reduced-motion` (fully usable, calm).
- Phones first (390×844, touch) and laptop (1366×900); no horizontal scroll; tap targets ≥ 44px.
- Arabic helper text stays where the original has it.

## Verify (each file)

Static server: http://localhost:8810 serves /home/user/lumio (start `cd /home/user/lumio && python3 -m http.server 8810`
in the background only if it does not respond; never kill processes). Playwright Chromium at
/opt/pw-browsers/chromium (args `--use-gl=swiftshader --enable-unsafe-swiftshader`, block fonts.googleapis/gstatic).
Open each v2 file with the same parameters the student page uses (e.g. `?level=level1&n=3`), play it through to
the end by simulated taps at 390 (touch) and 1366: zero page errors, zero 404s, no horizontal scroll, same
content as the original (compare word lists / text), reduced-motion run clean. Screenshots ONLY in your own
folder under /tmp/claude-0/-home-user-lumio/3a03b165-7d09-5102-b9f3-cbdade375195/scratchpad/v2/<your-name>/.
Look at them critically and polish until it feels like a premium kids' app.

Rules: only create your own v2 files; do not edit originals or any other file; do not commit or run git; do not
delete anything outside your own screenshot folder.
