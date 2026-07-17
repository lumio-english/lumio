/* Lumio English — login page logic. Change TEACHER_PIN before sharing. */
const TEACHER_PIN = "2026";

(() => {
  const $ = (id) => document.getElementById(id);
  const paneS = $("paneStudent"), paneT = $("paneTeacher");
  const tabS = $("tabStudent"), tabT = $("tabTeacher");

  // Fill levels (only levels with lesson files are selectable)
  const sel = $("slevel");
  Lumio.LEVELS.forEach(l => {
    const o = document.createElement("option");
    o.value = l.id;
    const ready = Lumio.AVAILABLE_LEVELS.includes(l.id);
    o.textContent = l.name + (ready ? "" : " — coming soon");
    o.disabled = !ready;
    sel.appendChild(o);
  });

  const show = (which) => {
    paneS.style.display = which === "s" ? "" : "none";
    paneT.style.display = which === "t" ? "" : "none";
    tabS.classList.toggle("btn-sun", which === "s");
    tabT.classList.toggle("btn-sun", which === "t");
  };
  tabS.onclick = () => show("s");
  tabT.onclick = () => show("t");
  if (Lumio.qs("role") === "teacher") show("t");

  $("goStudent").onclick = () => {
    const name = $("sname").value.trim();
    if (!name) return Lumio.toast("Please write your name");
    Lumio.login(name, sel.value);
    location.href = "student.html";
  };
  $("sname").addEventListener("keydown", e => { if (e.key === "Enter") $("goStudent").click(); });

  $("goTeacher").onclick = () => {
    if ($("tpin").value === TEACHER_PIN) {
      sessionStorage.setItem("lumio_teacher", "1");
      location.href = "teacher.html";
    } else Lumio.toast("Wrong PIN");
  };
  $("tpin").addEventListener("keydown", e => { if (e.key === "Enter") $("goTeacher").click(); });
})();
