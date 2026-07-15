# 🌟 Lumio English — Learn · Speak · Grow

A kid-friendly English learning platform with games, audio, stars, a level map and printable certificates. Built for Arabic-speaking young learners (every word has an Arabic translation).

## ✅ What's included in v1

| Piece | Status |
|---|---|
| Home page (`index.html`) | ✅ |
| Student login + level picker (`login.html`) | ✅ |
| Teacher login (PIN) + dashboard with KPIs, progress table, CSV export (`teacher.html`) | ✅ |
| Student adventure map with locked/current/done lessons + stars (`student.html`) | ✅ |
| Universal lesson engine (`lesson.html` + `js/lesson.js`) | ✅ |
| **Pre-A level: all 20 lessons** (`lessons/pre-a/`) | ✅ |
| Printable certificate (`certificates.html`) | ✅ |
| Full 11-level curriculum map (`teacher-guide/curriculum-map.md`) | ✅ |
| Your characters & logo wired in (`assets/`) | ✅ |
| **20 Zoom-ready PowerPoint decks** (`powerpoints/pre-a/`) | ✅ |
| Polished v2 design system (gradients, soft depth, refined type) | ✅ |

Every lesson runs 5 activities automatically from its JSON:
**Vocab flashcards → Listen & tap → Match pairs → Quiz → Spell it**, with text-to-speech (including the iOS Safari fixes), sounds, confetti and a 1–3 star result saved to progress.

## ▶️ Run it locally

**Just double-click `index.html`** — no server or Python needed. All lessons are bundled
into `js/lessons-data.js`, so everything works offline straight from the folder.

(When you edit or add lesson JSON files, either re-run the bundling step or just test on
GitHub Pages, where the JSON files load directly.)

## 🚀 Deploy to GitHub Pages (same as your 51Talk setup)

1. Create a repo, push this folder.
2. Settings → Pages → Deploy from branch → `main` / root.
3. Done — share the link with students.

## ✏️ Adding levels & lessons

Lesson files are plain JSON — no code changes needed:

```json
{
  "id": "pre-b-01", "level": "pre-b", "number": 1,
  "title": "This is...", "titleAr": "هذا...", "goal": "...",
  "vocab": [
    { "en": "this", "ar": "هذا", "emoji": "👉", "example": "This is a cat." }
  ],
  "activities": [
    { "type": "vocab" },
    { "type": "speak", "rounds": 3 },
    { "type": "listen-choose", "rounds": 5 },
    { "type": "match" },
    { "type": "quiz", "rounds": 4, "questions": [
      { "q": "____ is a cat.", "options": ["This","Cat","Is","A"], "answer": "This" } ] },
    { "type": "spell", "rounds": 3 }
  ]
}
```

**`speak`** (new): student records themselves saying each word, then plays
it back next to the native pronunciation to self-compare. It's
practice-only, not graded — real pronunciation scoring would need a
speech-recognition API this project doesn't have — so it never drags a
lesson's star rating down. If the browser has no microphone or the
student doesn't allow access, it shows a friendly "just listen and
repeat out loud" fallback instead of blocking the lesson. `rounds`
controls how many vocab words it picks.

1. Put `lesson01.json … lesson20.json` in `lessons/{level-id}/`.
2. Add the level id to `AVAILABLE_LEVELS` in `js/app.js`.
3. It appears unlocked in the login level picker automatically.
4. **If you're testing locally by double-clicking `index.html`** (no
   server), lessons load from the bundled `js/lessons-data.js` instead
   of the raw JSON files — that bundle needs regenerating whenever you
   edit a lesson, or your changes won't show up locally (they'll still
   work fine on GitHub Pages either way, since that reads the JSON
   files directly).

The full lesson-by-lesson plan for all 11 levels is in `teacher-guide/curriculum-map.md`.

## 🔐 Teacher PIN

Default is `2026` — change `TEACHER_PIN` in `js/auth.js`.

## ⚠️ v1 limitation & the upgrade path

v1 stores progress in each device's **localStorage**, so the teacher dashboard only shows students who used that same device/browser. To track all students centrally, add the same backend pattern as your 51Talk platform:

1. Google Sheet with a `Progress` tab (`name, level, lesson, stars, score, total, date`).
2. Apps Script Web App with `doPost` (save result) and `doGet` (fetch progress).
3. In `js/app.js`, make `saveResult()` also `fetch()` the Apps Script URL, and make `teacher.html` read from `doGet` instead of localStorage.

## 📁 Not built yet (planned)

`profile.html`, `progress.html` (the map covers this for now), standalone `homework/`, `workbook/`, `flashcards/`, `tests/`, and levels Pre-B → Level 9 content.

## 🖥️ Teaching live on Zoom / Google Meet

Each lesson has a matching professional deck in `powerpoints/pre-a/` (≈22–28 slides):
branded cover → class rules → today's plan → warm-up song → "New words!" divider
→ one slide per word (big visual, word, Arabic, "Say it" sentence, progress dots, character co-host)
→ "Let's practice!" divider → "Your turn!" question/answer rounds → quick quiz with A/B/C/D chat voting
(answers only in speaker notes) → wrap-up with word-chip recap + homework → goodbye slide with the
whole character cast waving. Your characters (Lumi, Sara, Noor, Omar) appear on every single slide.

Tips: share the slides, keep the speaker notes open on your side (every slide has teaching instructions),
and after class tell students to play the same lesson number on the site for stars.
