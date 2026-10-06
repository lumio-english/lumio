# Lumio student dashboard: 3 design directions (previews)

Lumio English is an online English school for Arab children: kids (Pre-A to Level 2, ages 4–10) and teens (Levels 3–6, ages 10–15).
Each child has a student dashboard (`student.html`). These are **preview designs** for a new student dashboard and profile:
standalone HTML pages with demo data, not wired to the real backend. The owner picks one direction; it is then built into the real page.

## Must-haves for every design

- **One self-contained HTML file** in `design-previews/` (inline CSS + JS). Use only:
  - `../vendor/three-r128.min.js` (three.js r128, global `THREE`)
  - `../vendor/gsap-3.12.5.min.js` + `../vendor/ScrollTrigger-3.12.5.min.js` (GSAP 3, global `gsap`, `ScrollTrigger`)
  - `../vendor/lottie-light-5.12.2.min.js` (lottie-web light, global `lottie`, `renderer:'svg'`) with the brand animations
    `../assets/lottie/star-pop.json`, `check.json`, `flame.json`, `confetti.json` (200×200, 30 fps, 60 frames)
  - Google Fonts allowed: Bricolage Grotesque (display), Nunito (body), Tajawal (Arabic).
  - Images from `../assets/` (logo `../assets/logo/lumio-logo.png`; mascot `../assets/story/characters/lumi-welcome-hero.png`,
    teen mascot `../assets/story/characters/lumi-teen-welcome-hero.png`; crew: `../assets/site/hamad-wave.png`, `noor-wave.png`,
    `sara-wave.png`, `ziad-wave.png`, `omar-thumbs.png`, `lumi-celebrate.png`; story covers `../assets/site/story-level1.jpg`;
    game covers `../assets/site/game-level1.jpg`). Use `onerror="this.remove()"` on images.
  - All three libraries must be used meaningfully (three.js = a real 3D element, GSAP = entrance/scroll/micro motion,
    Lottie = celebrations/states such as finished lessons, streak flame, rewards). Respect `prefers-reduced-motion`.
- **Brand**: white + orange (#F97316 / #C2410C / soft peach #FFF6EF), black only for text. Kids: bright, friendly, rounded.
  Teens: "Night + orange" (navy #0B1226, cards rgba(20,30,62,.78), white text, glowing orange). A visible **Kid / Teen toggle**
  switches the demo student and theme (kid = Lina, Level 1 · About Me, 🐼; teen = Omar, Level 4 · Smart Choices, 🦁).
- **Responsive**: perfect at 390×844 (phone, the main device) and 1366×900 (laptop). No horizontal scroll. Tap targets ≥ 44px.
  Phone gets a bottom tab bar or equally easy navigation.
- **Bilingual touches**: English UI with short Arabic helper lines where a parent might read (Tajawal, `dir="rtl"`).
- **Every student function below must appear as real UI** (a button, card, row, tab…) with a short label, and a small
  "ⓘ" or caption is fine. Buttons can show a toast "Preview only" when tapped. Nothing may be left out.
- Accessible: semantic headings, `aria-label`s on icon buttons, good contrast in both themes.
- Top of the page: a slim strip "Design preview · Direction X: <name>" with links to the other two directions
  (`a-adventure.html`, `b-studio.html`, `c-journey.html`) and to `index.html` (the overview).

## Demo data

Kid Lina, Level 1 · About Me, lesson 3 of 20 now (lessons 1–2 finished). Teen Omar, Level 4 · Smart Choices, same numbers.
- Streak 4 days. Stars 9 (teens show XP 900). Reward points 60. Sessions left 5. Subscribed.
- Lesson 1 "This is…" prep 100% ★★★, class Oct 11 attended, teacher grade A, comment "Great speaking today!", homework 90%.
- Lesson 2 "I am / You are" prep 80% ★★, absent Oct 14 then attended Oct 18, grade B+, homework 70%.
- Lesson 3 "It is a…" (NOW): prep 50% ★, class Oct 21 attended, no grade yet, homework to do.
- Lesson 4: booked Wed Oct 28, 6:00 PM Saudi time (3:00 PM your time when the device is elsewhere).
- Next class: Lesson 2-style card "Tomorrow 4:00 PM Saudi time · with Teacher Eslam · 45 min · Join link".
- Attendance 3 of 4 = 75%. Prep average 80%. Homework average 80%. Teacher grade average A-.
- Teacher Eslam ★ 4.8 (12 ratings).

## Every student function (all must be present)

**Today**
1. Today's mission card (next step: Continue / My schedule / Do homework, depending on progress)
2. Lesson prep (interactive: new words, listen & choose, match, quiz, spell it, sound it out, fill the gap, say it / record, put in order)
3. Interactive homework (drawing, recording, spelling, quiz)
4. Homework sheet (PDF)
5. Writing sheet (PDF)
6. Flashcards (PDF)
7. Lesson trail: Preparation → Live class → Homework for the current lesson

**My adventure**
8. Adventure map of the 20 lessons (3D map, with a "Show as a list" option)
9. Level progress % and lessons done (2/20)
10. Level test (30 questions, 70% to pass, 4 skills; unlocks after all lessons)
11. Certificate

**My progress**
12. Totals: lessons finished, classes attended, attendance %, prep score, homework score, teacher grade average
13. My lessons library: every unlocked lesson with prep stars/score, class (attended/absent/booked + grade + teacher comment), homework score, and buttons to go back: Replay prep, Redo homework, Flashcards, Homework sheet, Writing (+ All / Finished filter)

**Unlocked for you**
14. Lumi's Magic Map story (4 parts, unlocks with lessons)
15. Level game (e.g. Treehouse Builder for Level 1, Squad Budget for Level 4)

**My classes**
16. Next class card with Join link (locked until the previous homework is done)
17. Upcoming classes list with lesson number and Cancel (up to 30 min before)
18. Book one class: week → day → hour (Saudi time + "your time") → teacher with photo, rating, seats (max 4 per class, max 3 a week)
19. Fixed weekly schedule (pick up to 3 weekly times, book next weeks automatically)
20. Rate your teacher (1–5 stars after an attended class)
21. Sessions left pill

**English Hub** (always open)
22. Vocabulary (+ games: Word Pop, Word Builder, Memory Match)
23. Grammar
24. Idioms
25. Phonics
26. Spelling
27. Songs
28. Writing & Speaking (type or record answers to prompts, Arabic help)

**Rewards**
29. Reward points + Redeem (50 points → +1 hour)
30. Badges (First step, On a roll, Star collector, Super star, Perfectionist, Halfway there, Level up!, Dedicated)
31. Study buddies (the Lumio crew)
32. Daily streak

**More**
33. Level manual (PDF)

**Menu / account**
34. My profile: photo/avatar, age, gender, grade, country, subscription status, payments plan, level test result, teacher grades, Download my performance report
35. Messages / notifications (teacher messages, class booked, reminders, payment due)
36. Guides (how-to guides)
37. Referrals (invite friends, earn free sessions)
38. Parent guide tour (Arabic + English walkthrough)
39. Avatar picker
40. Sound effects & music on/off
41. Kid look / Teen night look (automatic by level)
42. Log out
