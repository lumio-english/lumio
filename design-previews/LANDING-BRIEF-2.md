# Lumio landing page, round 2: three BOLD concepts

The owner rejected round 1 (landing-a/b/c) as "not as creative as I thought": they were well-made but felt like normal
marketing pages with 3D added. Round 2 must feel like nothing else in kids' education: a page people screenshot and share.
The owner picked three concepts. Each is one self-contained file in `design-previews/`:

- `landing-game.html` — **Playable game page**
- `landing-cinema.html` — **Cinematic 3D story**
- `landing-tryit.html` — **Interactive try-it page**

## Rules that still apply (from LANDING-BRIEF.md)

- **Real content only**: copy, prices (with the currency switch), level names/ages, FAQ, games, stories, crew from
  `index.html`, `js/site-i18n.js`, `js/site.js`. Load `../js/site-i18n.js` for the copy. Never invent prices, claims,
  testimonials, numbers or awards. New interface words (game prompts, button labels) are fine in EN + AR.
- **Arabic first** (default, `dir="rtl"`, Tajawal), with a working EN switch.
- **Everything a parent needs is still reachable**: levels, how it works, Hub, writing practice, games, stories, crew,
  pricing, parent handbook, FAQ, free placement test / free trial (WhatsApp, same link as the real page), Log in.
  The creative concept is the *way in*; a parent who is in a hurry must always see a visible "skip to plans / book a free
  trial" path and be able to reach pricing in one tap.
- Libraries: `../vendor/three-r128.min.js`, `../vendor/gsap-3.12.5.min.js` + `../vendor/ScrollTrigger-3.12.5.min.js`,
  `../vendor/lottie-light-5.12.2.min.js` + `../assets/lottie/*.json`. Assets from `../assets/` only. Brand white + orange
  (#F97316 / #C2410C), Bricolage Grotesque / Nunito / Tajawal. Respect reduced motion; non-WebGL fallback.
- Must be excellent at 390×844 (most parents are on phones from Instagram/WhatsApp ads) and 1366×900. No horizontal scroll.
- Top strip: "Design preview · Landing round 2: <name>" linking the other two (`landing-game.html`, `landing-cinema.html`,
  `landing-tryit.html`) and `index.html`.

## Real assets worth using

- Crew art: `../assets/story/characters/<name>-<pose>.png` (lumi, hamad, noor, omar, sara, ziad; kid and `-teen-` poses:
  wave, happy, celebrate, point, think, read, run, walk, thumbs, surprised, welcome-hero...). Round avatars:
  `../assets/avatars/<id>.png`.
- Lesson data: `../js/lessons-data.js` defines `window.LUMIO_LESSONS[level][n]` with `title`, `titleAr`, `vocab`
  (`en`, `ar`, `example`). Word pictures: `../assets/vocab/<slug>.png` where slug = lower-case, apostrophes dropped,
  other non-letters → "-". Real recorded voice: `../assets/audio/<slug>.mp3` (same slug rule but apostrophes kept), e.g.
  `hello.mp3`, `red.mp3`, `cat.mp3`. Sound effects: `../assets/sfx/music-games.mp3` (only play after a tap).
- Scenes/backgrounds: `../assets/lesson-bg/`, `../assets/lesson-bg-kid/`, `../assets/scenes/`, story art in
  `../assets/story/`, screenshots `../assets/site/shot-*.jpg` (fresh), game covers `../assets/site/game-*.jpg`.
