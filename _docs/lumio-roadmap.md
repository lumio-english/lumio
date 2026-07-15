# Lumio English — Roadmap to Professional / Advanced

A phased plan, roughly in the order I'd actually do it. Each phase builds on
the last — don't skip to Phase 4 while Phase 1 is still shaky, since
everything downstream depends on the data actually being real and shared.

---

## Phase 0 — Lock down what you have (1 day)

Before adding anything new, protect what's already built.

- [ ] **Export/backup button.** One button that dumps roster + progress +
      schedule to a downloadable JSON file. Cheap insurance against
      `localStorage` getting cleared (browser update, "clear site data,"
      new device). Takes an hour to build, saves you from disaster.
- [ ] **Change every default PIN** (`1111`, `2026`, student PINs) before any
      real student or teacher touches this. They're public right now —
      anyone who reads the code knows them.
- [ ] **Put the project in version control** (git + GitHub, which you're
      already using for Pages) if you haven't already committed every file
      from this chat. You now have ~10 interdependent files; losing track
      of one breaks the rest.

---

## Phase 1 — Real backend (this is the big one)

Everything currently lives in one browser's `localStorage`. That means no
two devices see the same data, and clearing browser data destroys
everything. This is the single change that turns "demo" into "usable by
actual people."

- [ ] **Google Sheets + Apps Script**, exactly as your README already
      outlines, extended to cover all three data types you now have:
      - `Progress` tab (lesson results) — README already describes this
      - `Roster` tab (students + teachers) — `lumio-profiles.js` has
        `syncNow()` stubbed and ready for this
      - `Schedule` tab (booked classes) — `lumio-schedule.js` doesn't have
        sync wired yet; same pattern, needs `pushSchedule`/`pullSchedule`
        actions added
- [ ] **Auto-sync**, not manual-only. Right now sync only fires when someone
      clicks "Sync now." Add a periodic sync (every few minutes) and a sync
      on every write (add student, book class, finish lesson), with a
      small "last synced" indicator so a teacher can trust the data is
      current.
- [ ] **Conflict handling.** Two teachers editing the roster on different
      devices at the same time will currently just overwrite each other.
      Even a simple "last write wins with a timestamp warning" is better
      than silent data loss.
- [ ] Once this works, PINs stop being "good enough security" — see Phase 2.

---

## Phase 2 — Real authentication

The PIN system is fine for a single classroom on one device. It is not
fine once data syncs across devices over the internet.

- [ ] **Hash PINs before storing/syncing** (even a simple hash) instead of
      plaintext — right now anyone with sheet access sees every PIN in the
      clear.
- [ ] **Rate-limit PIN attempts** so the 4-digit pad can't be brute-forced
      (10,000 combinations is nothing without a lockout).
- [ ] Longer term, if this grows past your own classroom: real email/password
      or OAuth for teacher accounts. Kids can stay on the simple
      avatar+PIN picker — that part's genuinely good UX for the age group,
      keep it.

---

## Phase 3 — Content completeness

The infrastructure (roster, schedule, dashboards) is now ahead of the
actual teaching content.

- [ ] **Levels 1–9** — only Pre-A has real lessons right now. Your own
      curriculum map already plans all 11 levels; this is the biggest gap
      between what the platform *can* do and what it *has*.
- [ ] **Speaking/recording activities** — flagged as not-built in your
      README. For a spoken-language product this matters a lot;
      even a simple "record yourself saying this word" with playback
      (no grading needed at first) closes a real gap.
- [ ] **Standalone practice sets** — `games/`, `homework/`, `flashcards/`,
      `tests/` are all still on your "not built" list. Some of this
      overlaps with the mini-games already in the dashboard — worth
      deciding if those replace the standalone plan or complement it.

---

## Phase 4 — Professional polish

Once the data and content are solid, this is what makes it *feel*
professional rather than homemade.

- [ ] **Mobile pass.** Everything so far has been built and tested
      desktop-first. A real pass on phone-width screens (most parents and
      many students will be on mobile) — especially the teacher dashboard's
      tables and the booking modal.
- [ ] **Accessibility basics** — keyboard navigation through the games and
      modals, proper contrast ratios, alt text audit. Matters doubly for
      an education product.
- [ ] **Consistent error/empty states.** You've got good ones in some
      places (schedule empty state, roster empty state) — sweep the rest
      of the app to match that bar everywhere.
- [ ] **Real domain + branding polish** — if this is going to be shared
      beyond you, a proper domain (not the raw GitHub Pages URL) reads as
      far more legitimate to parents and other teachers.

---

## Phase 5 — Reporting & communication

Where the "operations background + EdTech" combination you already have
really pays off.

- [ ] **Parent-facing summary** — shareable link or downloadable PDF per
      student (stars, lessons done, next class, streak). You already do
      WhatsApp outreach for phonics referrals; this slots right in.
- [ ] **Teacher analytics beyond the current KPIs** — trends over time
      (is this student's pace speeding up or slowing down?), not just
      current totals.
- [ ] **Attendance**, layered onto the Schedule feature that already
      exists — present/absent/no-show per booked class, not just
      "scheduled → completed."

---

## Phase 6 — Scale (only if you need it)

Skip this phase entirely if Lumio stays "my classroom." Only relevant if
you're picturing other teachers or schools using it independently.

- [ ] **Multi-tenant support** — right now "owner" sees everything on one
      shared roster. A second, unrelated teacher using their own copy of
      the site needs their own isolated data, not just an owner/teacher
      split within one roster.
- [ ] **Onboarding flow** for a brand-new teacher setting this up from
      scratch (currently assumes you, personally, configuring it).
- [ ] **Usage limits / billing**, if this ever becomes something you'd
      charge for.

---

## Suggested order if you want a single starting point

1. Backup/export button (Phase 0) — do this today, it's an hour of work
2. Google Sheets sync for roster + progress (Phase 1) — the real unlock
3. PIN hashing (Phase 2) — do this *before* sync goes live, not after
4. Pick whichever of Levels 1–9 vs. mobile polish matters more for your
   actual next batch of students

Everything else can wait until those four are solid.
