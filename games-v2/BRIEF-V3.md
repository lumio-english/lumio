# Games and story, round 3 (the owner rejected round 2)

Owner's words about the v2 previews: "the quality is poor and the motion and the animation is boring, also there are
bugs in the content and the photos". Round 2 only added an intro screen to the old flat layouts. Round 3 rebuilds each
game as a premium kids' app scene. The bar is `games-v2/lumis-pocket.html` (already rebuilt): open it, play it, and
read its code before you start. Match or beat it.

## Non-negotiable
- **Same learning content**: same words, sentences, questions, rules, rounds, word banks, level/lesson logic, URL
  parameters (`?level=&n=&from=`), back/exit links (`backHref`, trial-tab close) as the original `games/<file>.html`
  (or, for the Hub mini games, the student.html overlays). Do not invent words. Same pictures (`assets/vocab/…`) and
  the real character art (`assets/story/characters/…`). Never draw a stand-in character.
- **Fix content and photo bugs** you find while doing it: pictures that don't match the word, missing/broken pictures,
  letter-tile fallbacks where a real picture exists under another name, cropped/stretched/dark/tiny photos, prompts
  that don't match options, two correct answers, wrong Arabic, text overflow. List every fix in your final report.
- Built on the shared kit: `games-v2/kit/play.css` + `games-v2/kit/play.js` (`window.LP`). **Do not edit the kit
  files** (other people use them at the same time). Put game-specific CSS/JS in your page. If the kit has a bug, work
  around it locally and report it.

## The kit (read kit/play.js; summary)
- `LP.init({theme:'kid'|'teen', scene:{bg, particles, tint, pos}, hud:{rounds, exitHref}})` → painted scene
  (slow drift + pointer parallax + light + particles: motes, fireflies, stars, leaves, petals, bubbles, snow, neon),
  glass HUD (exit, segmented progress, star counter), sound toggle. `LP.sceneTo(bg)` crossfades to another painting.
- Backgrounds to use: `assets/story/backgrounds/*.jpg` (cafeteria, celebration, classroom, family-interior, forest,
  forest-stream, game-night-room, gym, hangout-spot, library, map, map-closeup, school-hallway-teen, sports-field,
  teen-room, toys, treehouse-planning, treehouse-building, treehouse-finished, village), `assets/lesson-bg-kid/*.jpg`
  (animals, bedroom, classroom, closet, family-home, kitchen, market, park, party, playroom, school, weather-sky),
  `assets/lesson-bg/level3..6/NN.jpg` (teen lesson scenes). Pick the one that fits the game's world.
- `LP.actor(host,{char:'lumi'|'noor'|'omar'|'sara'|'ziad'|'hamad'|'lumi-teen'…, pose, cheer, oops, height})` → real art
  with idle breathing; `.set(pose)`, `.cheer()`, `.oops()`, `.nod()`, `.enter()`. Poses = file names
  `assets/story/characters/<char>-<pose>.png` (teens: `lumi-teen-*`, `hamad-teen-*`, etc.; ls the folder).
- `LP.picCard(word,{label,img,text})`, `LP.deal(cards, fromEl)`, `LP.good(card)` (ring, badge, burst, star flies to
  HUD, streak), `LP.bad(card)`, `LP.clear(cards, keep)`, `LP.banner(big, small)`, `LP.round(i)`, `LP.fill(i)`,
  `LP.addStar(fromEl)`, `LP.burst(x,y,opts)`, `LP.rain()`, `LP.sfx('tap'|'pop'|'deal'|'flip'|'whoosh'|'correct'|'wrong'|
  'star'|'coin'|'tick'|'win'|'rise'|'boom')`, `LP.say(text, speakerBtn)` (site voice), `LP.title({...})` → Promise,
  `LP.results({score,total,note,actor,exitHref,exitLabel,onReplay})`, `LP.center(el)`, `LP.esc`, `LP.wait(ms)`,
  `LP.ICON.*`, `LP.RM` (reduced motion). Classes: `.lp-stage`, `.lp-panel`, `.lp-bubble` + `.lp-speak`, `.lp-cards c2/c3/c4
  [wrap2]`, `.lp-card`, `.lp-word`, `.lp-btn [alt|teal]`, `.lp-chip`.
- Set `LP.answer = <correct word/id>` when a round is ready and `LP.answer = null` while it is being set up — the
  automated play-through tests read it. Scripts load in this order: gsap, lottie, ../js/app.js, ../js/lessons-data.js,
  kit/play.js.

## Each game must have
- Its own world: painted background chosen for the theme, the right characters in the scene acting (idle, cheer,
  oops, talk), and one signature mechanic animation that makes it feel like THAT game (e.g. the treehouse visibly gets
  built piece by piece over the painting; calendar pages really tear off; chat messages really type; coins really drop
  into a jar; clues get pinned with yarn; visions swirl out of the crystal ball; balloons float with physics; the puppy
  runs to fetch). Not just a grid of cards on a gradient.
- Title screen (`LP.title`), round banners, dealt cards, real feedback on every tap, results (`LP.results`).
- Kids (Pre-A–Level 2): bright, bouncy, big pictures. Teens (Level 3–6): `theme:'teen'`, cooler and cinematic, still
  playful — teen characters (`*-teen-*` art), no baby look.
- Phone first (390×844 touch) and laptop (1366×900): no horizontal scroll, nothing under the HUD or the sound button,
  tap targets ≥ 44px, text never clipped. Laptop layout must use the space well (not a phone column in a void).
- `prefers-reduced-motion`: fully playable and calm. Arabic helper text stays where the original has it (dir="rtl").
- Zero console errors, zero 404s.

## Verify
Server: http://localhost:8810 serves /home/user/lumio (if it doesn't answer, start
`cd /home/user/lumio && python3 -m http.server 8810` in the background; never kill processes). Playwright Chromium:
executable_path '/opt/pw-browsers/chromium', args ['--use-gl=swiftshader','--enable-unsafe-swiftshader'], block
fonts.googleapis/gstatic. The title button pulses, so click it with force=True after ~3s. A ready-made play-through
script for Lumi's Pocket is at /tmp/claude-0/-home-user-lumio/3a03b165-7d09-5102-b9f3-cbdade375195/scratchpad/v3/play_lp.py
(copy and adapt it). Play every game to the end at 390×844 and 1366×900, with several lessons per level, plus a
reduced-motion run. Screenshot title, rounds, right/wrong feedback, results; look at the PNGs critically (make contact
sheets with PIL) and iterate until it looks like a top-tier kids' app. Screenshots only in your own folder
/tmp/claude-0/-home-user-lumio/3a03b165-7d09-5102-b9f3-cbdade375195/scratchpad/v3/<your-name>/.

Rules: edit only your assigned files; no git; don't delete anything outside your screenshot folder.
