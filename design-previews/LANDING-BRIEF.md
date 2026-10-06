# Lumio public landing page: 3 design directions (previews)

The public home page is `index.html` (copy in `js/site-i18n.js`, EN + AR; Arabic is the default for visitors, toggle to English; behaviour in `js/site.js`, styles in `css/site.css`). Audience: Arab parents (Saudi Arabia, Gulf, Egypt) choosing an online English school for children aged 4–15, mostly on phones, often via WhatsApp/Instagram ads.

These are **preview designs**, one self-contained HTML file each in `design-previews/`:
`landing-a.html`, `landing-b.html`, `landing-c.html`. The owner will pick one; it is then built into the real `index.html`.

## Must-haves

- **Real content only.** Read `index.html` and `js/site-i18n.js` and use the real copy, numbers, prices, level names/ages, FAQ answers, game and story names. Never invent prices, claims, testimonials, student counts or awards. If a section needs something that does not exist (e.g. reviews), leave it out.
- **Every current section, in a new design:** nav (logo, section links, language switch EN/عربي, Log in), hero with the main call to action (free trial / placement test as on the real page), "how it works" (one lesson, four moments), levels path (Pre-A to Level 6 with ages), English Hub (7 sections), **Writing practice** (new: Hub prompts typed or recorded, a writing sheet per lesson Pre-A to Level 3, spelling in every homework), games (one per level), stories (Lumi's Magic Map), start free, the Lumio crew (characters), pricing, parent handbook, FAQ, final call to action, footer, WhatsApp floating button (use the same link as the real page).
- **Bilingual:** a working EN / عربي switch that flips text and `dir="rtl"` (Tajawal for Arabic). Arabic is the default. Take the Arabic copy from `js/site-i18n.js`.
- **Libraries (all three, used meaningfully):** `../vendor/three-r128.min.js`, `../vendor/gsap-3.12.5.min.js` + `../vendor/ScrollTrigger-3.12.5.min.js`, `../vendor/lottie-light-5.12.2.min.js` with `../assets/lottie/star-pop.json`, `check.json`, `flame.json`, `confetti.json`. Respect `prefers-reduced-motion`; provide a non-WebGL fallback.
- **Assets** from `../assets/` only (logo `../assets/logo/lumio-logo.png`, characters in `../assets/story/characters/` and `../assets/site/`, screenshots `../assets/site/shot-*.jpg`, story and game covers `../assets/site/story-*.jpg`, `game-*.jpg`, demo videos if the real page uses them). `onerror="this.remove()"` on images.
- **Brand:** white + orange (#F97316 / #C2410C / peach #FFF6EF), black only for text, fonts Bricolage Grotesque (display), Nunito (body), Tajawal (Arabic) from Google Fonts.
- **Responsive:** flawless at 390×844 and 1366×900, in both languages. No horizontal scroll, tap targets ≥ 44px.
- **Top strip:** "Design preview · Landing <A/B/C>: <name>" with links to the other two landing directions and to `index.html` (the design overview).
- Links to the real app pages (login.html, placement-test.html, etc.) should point to `../<page>` so they work from the preview folder.
