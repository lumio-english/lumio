# What's in this download

This is everything I've built or touched, all in one place. A few things
to know before you unzip it over your existing project:

## ✅ Included here
- `index.html`, `login.html`, `teacher.html`, `student.html` — latest
  versions, all bug fixes applied
- `certificates.html`, `lesson.html`, `present.html`, `README.md` —
  your originals, unchanged, included so the folder is complete
- `js/app.js`, `js/auth.js`, `js/dashboard.js`, `js/lesson.js`,
  `js/present.js`, `js/lessons-data.js` — your real files, exactly as
  you last uploaded them, unchanged
- `js/lumio-profiles.js`, `js/lumio-schedule.js`, `js/lumio-backup.js`
  — the new shared modules (roster, scheduling, backup), latest
  versions with PIN hashing and full sync
- `_docs/` — not part of the website itself:
  - `AppsScript-Code.gs` — paste into Google Apps Script (see the setup guide)
  - `SETUP-GOOGLE-SHEETS-SYNC.md` — step-by-step sync setup
  - `lumio-roadmap.md` — the phased "make it more professional" plan

## ❌ Not included (I never received these)
- `assets/` — your logo, character art, vocab images
- `lessons/` — the lesson JSON files
- `powerpoints/` — your Zoom-ready decks
- `css/style.css` — your stylesheet

**Just copy these files into your existing project folder** (don't
replace the whole folder) — that merges the updates in without
touching your assets, lessons, or styles.

## Still open from last time
The "Not on the list? Start without a profile" fallback on the login
page can log in as any student by name with no PIN, since your real
`auth.js` doesn't validate that path itself. Say the word and I'll
lock that down.
