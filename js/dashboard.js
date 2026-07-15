/* Lumio English — student map logic */
(() => {
  const user = Lumio.requireUser();
  const level = user.level || "pre-a";
  const meta = Lumio.LEVELS.find(l => l.id === level) || { name: level, lessons: 20 };
  const prog = (Lumio.progressFor(user.name)[level]) || {};

  document.getElementById("helloChip").textContent = `Hi, ${user.name}!`;
  document.getElementById("levelTitle").textContent = `${meta.name} adventure map`;

  const N = meta.lessons;
  const done = Object.keys(prog).length;
  const stars = Object.values(prog).reduce((s, r) => s + (r.stars || 0), 0);
  const current = Math.min(done + 1, N);

  document.getElementById("doneCount").textContent = `${done}/${N} lessons`;
  document.getElementById("starCount").textContent = `★ ${stars}`;
  document.getElementById("levelBar").style.width = `${(done / N) * 100}%`;

  const path = document.getElementById("path");
  const cols = matchMedia("(max-width:760px)").matches ? 4 : 5;

  for (let n = 1; n <= N; n++) {
    const r = prog[n];
    const isDone = !!r;
    const isCurrent = n === current && !isDone;
    const locked = n > current;

    const el = document.createElement(locked ? "div" : "a");
    el.className = `node ${isDone ? "done" : isCurrent ? "current" : "locked"}`;
    if (!locked) el.href = `lesson.html?level=${level}&n=${n}`;
    el.innerHTML = `<span>${locked ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' : n}</span>` +
      (isDone ? `<span class="n-stars">${"★".repeat(r.stars)}<span class="star-off">${"★".repeat(3 - r.stars)}</span></span>` : "");

    // snake layout: reverse order on every second row
    const row = Math.floor((n - 1) / cols);
    const posInRow = (n - 1) % cols;
    el.style.order = row * cols + (row % 2 === 1 ? (cols - 1 - posInRow) : posInRow);

    path.appendChild(el);
  }
})();
