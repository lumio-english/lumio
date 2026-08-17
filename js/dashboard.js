/* Lumio English — student map logic
   ------------------------------------------------------------
   Each lesson node now has two steps, not one:
     1. Prep  — the self-study interactive deck (lesson.html). Finishing
                it is exactly what Lumio.saveResult() already records,
                unchanged from before.
     2. Live  — the live class with the teacher. This is booked and later
                marked attended via LumioSchedule (see teacher.html's
                "Book a class" modal, which now asks which lesson number
                the class is for). Only "present" attendance counts.
   A lesson only counts as fully done, and only then unlocks the next
   lesson's prep, once BOTH steps are done. This file is the only place
   that combines the two into the map's unlock chain — the underlying
   prep-progress data (Lumio.progressFor) and the schedule data
   (LumioSchedule) are untouched by this, so certificates/other pages
   that read prep-completion directly still see exactly what they did
   before. */
(() => {
  const user = Lumio.requireUser();
  const level = user.level || "pre-a";
  const meta = Lumio.LEVELS.find(l => l.id === level) || { name: level, lessons: 20 };
  const prepProg = (Lumio.progressFor(user.name)[level]) || {};
  const attendedSet = (window.LumioSchedule && LumioSchedule.attendedLessonNumbers)
    ? LumioSchedule.attendedLessonNumbers(user.name, level)
    : new Set();

  document.getElementById("helloChip").textContent = `Hi, ${user.name}!`;
  document.getElementById("levelTitle").textContent = `${meta.name} adventure map`;

  const N = meta.lessons;
  const isPrepDone = n => !!prepProg[n];
  const isLiveDone = n => attendedSet.has(n);
  const isFullyDone = n => isPrepDone(n) && isLiveDone(n);

  // The map only ever advances in order — the first lesson that isn't
  // fully done (prep + attended live class) is "current". Everything
  // before it is guaranteed fully done; everything after it is locked.
  // A class marked attended out of order (e.g. lesson 7 before lesson 4)
  // doesn't skip anyone ahead — it just sits there until lessons 4-6 catch up.
  let current = N + 1; // sentinel: every lesson fully done
  for (let n = 1; n <= N; n++) {
    if (!isFullyDone(n)) { current = n; break; }
  }
  const done = current - 1; // count of lessons fully complete, in order
  const stars = Object.values(prepProg).reduce((s, r) => s + (r.stars || 0), 0);

  document.getElementById("doneCount").textContent = `${done}/${N} lessons`;
  document.getElementById("starCount").textContent = `★ ${stars}`;
  document.getElementById("levelBar").style.width = `${(done / N) * 100}%`;

  const path = document.getElementById("path");
  const cols = matchMedia("(max-width:760px)").matches ? 4 : 5;
  const LOCK_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  for (let n = 1; n <= N; n++) {
    const r = prepProg[n];
    const fullyDone = n < current; // true for every node before "current", by construction
    const isCurrentPrep = n === current && !isPrepDone(n);       // do the prep now
    const isCurrentAwaiting = n === current && isPrepDone(n) && !isLiveDone(n); // prep done, waiting on the live class
    const locked = n > current;

    // Prep is always safe to (re)open once a node isn't locked — even a
    // student who's already done it and is waiting on their live class
    // can go back in to review.
    const el = document.createElement(locked ? "div" : "a");
    let cls = "locked";
    if (fullyDone) cls = "done";
    else if (isCurrentPrep) cls = "current";
    else if (isCurrentAwaiting) cls = "awaiting";
    el.className = `node ${cls}`;
    if (!locked) el.href = `lesson.html?level=${level}&n=${n}`;

    let iconHtml, subHtml = "";
    if (locked) {
      iconHtml = LOCK_SVG;
      // The lesson right after an "awaiting" node gets a specific hint
      // about why it's still locked, rather than the generic padlock-only look.
      if (n === current + 1) el.title = `Opens after your live class for Lesson ${current}`;
    } else if (cls === "awaiting") {
      iconHtml = '<span class="n-clock">🕐</span>';
      subHtml = '<span class="n-wait-label">Class soon</span>';
      el.title = "Prep done! This unlocks the next lesson once your teacher marks your class attended.";
    } else {
      iconHtml = n;
    }
    if (fullyDone && r) {
      subHtml = `<span class="n-stars">${"★".repeat(r.stars)}<span class="star-off">${"★".repeat(3 - r.stars)}</span></span>`;
    }
    el.innerHTML = `<span>${iconHtml}</span>${subHtml}`;

    // snake layout: reverse order on every second row
    const row = Math.floor((n - 1) / cols);
    const posInRow = (n - 1) % cols;
    el.style.order = row * cols + (row % 2 === 1 ? (cols - 1 - posInRow) : posInRow);

    path.appendChild(el);
  }
})();
