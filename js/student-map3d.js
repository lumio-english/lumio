/* Lumio English — 3D adventure map (2026 redesign).
   Draws the student's level as a winding path of stepping stones in three.js (self-hosted, vendor/).
   Source of truth is the classic map js/dashboard.js already built (#path .node, one per lesson in order):
   each stone copies that node's state (done / current / awaiting / awaiting-hw / locked), stars, link and hint,
   so the rules for what is open never live in two places. Story chests sit at lessons 5, 10, 15 and 20.
   The classic grid stays in the page: it is shown when WebGL or three.js is unavailable, and behind
   the "Show as a list" button. The scene only renders while it is on screen. */
(function () {
  'use strict';
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var box, canvas, tip, toggle, started = false;

  function webglOK() {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; }
  }
  function readNodes() {
    return Array.prototype.slice.call(document.querySelectorAll('#path .node')).map(function (el, i) {
      var cls = ['done', 'current', 'awaiting', 'awaiting-hw', 'locked'].filter(function (c) { return el.classList.contains(c); })[0] || 'locked';
      var st = el.querySelector('.n-stars'), stars = 0;
      if (st) { var off = st.querySelector('.star-off'); stars = (st.textContent.match(/★/g) || []).length - (off ? (off.textContent.match(/★/g) || []).length : 0); }
      return { n: i + 1, state: cls, stars: stars, href: el.getAttribute('href'), hint: el.getAttribute('title') || '' };
    });
  }
  function loadThree(cb) {
    if (window.THREE) return cb(true);
    var s = document.createElement('script');
    s.src = 'vendor/three-r128.min.js';
    s.onload = function () { cb(!!window.THREE); };
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }
  function fallback() { if (box) box.hidden = true; document.body.classList.remove('s26-has3d'); }

  function stoneTexture(T, node) {
    var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d');
    var bg = { done: '#F97316', current: '#FFFFFF', awaiting: '#FFEBDB', 'awaiting-hw': '#FFEBDB', locked: '#FFF6EF' }[node.state];
    var fg = { done: '#FFFFFF', current: '#C2410C', awaiting: '#C2410C', 'awaiting-hw': '#C2410C', locked: '#D6BFAE' }[node.state];
    x.fillStyle = bg; x.beginPath(); x.arc(128, 128, 128, 0, Math.PI * 2); x.fill();
    if (node.state === 'current') { x.lineWidth = 16; x.strokeStyle = '#F97316'; x.beginPath(); x.arc(128, 128, 118, 0, Math.PI * 2); x.stroke(); }
    var t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
  }
  // number badge that always faces the camera (readable from any angle)
  function badgeTexture(T, node) {
    var c = document.createElement('canvas'); c.width = 256; c.height = 160; var x = c.getContext('2d');
    var bg = { done: '#F97316', current: '#111111', awaiting: '#C2410C', 'awaiting-hw': '#C2410C', locked: '#FFFFFF' }[node.state];
    var fg = node.state === 'locked' ? '#B39C8A' : '#FFFFFF';
    x.fillStyle = bg; x.beginPath(); x.moveTo(40, 8); x.arcTo(248, 8, 248, 152, 40); x.arcTo(248, 152, 8, 152, 40); x.arcTo(8, 152, 8, 8, 40); x.arcTo(8, 8, 248, 8, 40); x.fill();
    if (node.state === 'locked') { x.lineWidth = 6; x.strokeStyle = '#F3DCCB'; x.stroke(); }
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '800 92px "Bricolage Grotesque", Nunito, sans-serif';
    x.fillText(String(node.n), 128, node.stars ? 66 : 84);
    if (node.stars) { x.font = '800 36px sans-serif'; x.fillStyle = '#FFE3CC'; x.fillText('★'.repeat(node.stars) + '☆'.repeat(3 - node.stars), 128, 126); }
    var t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
  }
  function labelFor(node) {
    if (node.state === 'done') return 'Lesson ' + node.n + ' · done ' + '★'.repeat(node.stars || 0);
    if (node.state === 'current') return 'Lesson ' + node.n + ' · your next lesson';
    if (node.state === 'awaiting') return 'Lesson ' + node.n + ' · prep done, class soon';
    if (node.state === 'awaiting-hw') return 'Lesson ' + node.n + ' · homework time';
    return node.hint || ('Lesson ' + node.n + ' · locked');
  }

  function build(nodes) {
    var T = window.THREE, W = box.clientWidth, H = box.clientHeight;
    var renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return fallback(); }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W, H, false);
    var scene = new T.Scene(); scene.fog = new T.Fog(0xFFF6EF, 18, 46);
    var cam = new T.PerspectiveCamera(42, W / H, .1, 120);
    scene.add(new T.HemisphereLight(0xFFFFFF, 0xFFD9BA, .95));
    var sun = new T.DirectionalLight(0xFFFFFF, .75); sun.position.set(6, 14, 8); scene.add(sun);
    var warm = new T.PointLight(0xF97316, .8, 30); warm.position.set(-6, 4, 2); scene.add(warm);

    // the winding road: lesson 1 nearest the camera, the last lesson far away
    var N = nodes.length, pts = [];
    for (var i = 0; i <= 40; i++) { var t = i / 40; pts.push(new T.Vector3(Math.sin(t * Math.PI * 3.2) * 3.4, 0, 6 - t * 30)); }
    var curve = new T.CatmullRomCurve3(pts);
    var road = new T.Mesh(new T.TubeGeometry(curve, 200, .32, 8, false), new T.MeshStandardMaterial({ color: 0xF3DCCB, roughness: .9 }));
    road.scale.y = .25; scene.add(road);
    var ground = new T.Mesh(new T.CircleGeometry(60, 48), new T.MeshStandardMaterial({ color: 0xFFF1E6, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.12; scene.add(ground);

    var stones = [], pos = [], doneCount = 0, curIdx = 0;
    nodes.forEach(function (node, i) {
      var p = curve.getPointAt(N > 1 ? i / (N - 1) : 0); pos.push(p);
      var side = new T.MeshStandardMaterial({ color: node.state === 'done' ? 0xEA580C : node.state === 'locked' ? 0xF3E3D6 : 0xFDBA74, roughness: .6 });
      var top = new T.MeshStandardMaterial({ map: stoneTexture(T, node), roughness: .5 });
      var m = new T.Mesh(new T.CylinderGeometry(.82, .9, .34, 40), [side, top, side]);
      m.position.set(p.x, .17, p.z); m.userData = { i: i, baseY: .17 }; scene.add(m); stones.push(m);
      var badge = new T.Sprite(new T.SpriteMaterial({ map: badgeTexture(T, node), transparent: true, depthWrite: false }));
      badge.scale.set(.95, .6, 1); badge.position.set(p.x, .95, p.z); badge.renderOrder = 2; scene.add(badge); m.userData.badge = badge;
      if (node.state === 'done') doneCount++;
      if (node.state !== 'done' && node.state !== 'locked' && !curIdx) curIdx = i;
      // story chests after lessons 5, 10, 15, 20
      if (node.n % 5 === 0) {
        var open = node.state === 'done';
        var g = new T.Group(), chestMat = new T.MeshStandardMaterial({ color: open ? 0xF97316 : 0xC2410C, roughness: .5 }), band = new T.MeshStandardMaterial({ color: 0xFFFFFF, roughness: .4 });
        var base = new T.Mesh(new T.BoxGeometry(.9, .5, .62), chestMat); base.position.y = .25; g.add(base);
        var lid = new T.Mesh(new T.BoxGeometry(.92, .22, .64), chestMat); lid.position.set(0, .61, open ? -.22 : 0); lid.rotation.x = open ? -1.0 : 0; g.add(lid);
        var b1 = new T.Mesh(new T.BoxGeometry(.12, .52, .64), band); b1.position.y = .26; g.add(b1);
        if (open) { var glow = new T.Mesh(new T.SphereGeometry(.22, 16, 16), new T.MeshBasicMaterial({ color: 0xFFE3CC })); glow.position.y = .55; g.add(glow); }
        var off = p.x > 0 ? -1.7 : 1.7; g.position.set(p.x + off, 0, p.z); g.rotation.y = off > 0 ? -.5 : .5; scene.add(g);
      }
    });
    if (!curIdx && doneCount === N) curIdx = N - 1;

    // a few soft trees and floating letters for depth
    var treeMat = [new T.MeshStandardMaterial({ color: 0xFDBA74, roughness: .8 }), new T.MeshStandardMaterial({ color: 0xF97316, roughness: .8 })], trunk = new T.MeshStandardMaterial({ color: 0xE7C3A6 });
    for (var k = 0; k < 10; k++) {
      var tz = 2 - k * 3.1, tx = (k % 2 ? 1 : -1) * (7.5 + (k * 37 % 5) * .7);
      var tg = new T.Group(); var tr = new T.Mesh(new T.CylinderGeometry(.1, .14, .7, 8), trunk); tr.position.y = .35; tg.add(tr);
      var cone = new T.Mesh(new T.ConeGeometry(.5 + (k % 3) * .1, 1.2, 12), treeMat[k % 2]); cone.position.y = 1.1; tg.add(cone);
      tg.position.set(tx, 0, tz); scene.add(tg);
    }

    // the student's buddy stands on the next lesson
    var buddy = null, teen = /^level([3-9]|10)$/.test((window.LumioMapState || {}).level || '');
    new T.TextureLoader().load('assets/story/characters/' + (teen ? 'lumi-teen-welcome-hero.png' : 'lumi-welcome-hero.png'), function (tex) {
      buddy = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true }));
      var ar = tex.image ? tex.image.width / tex.image.height : 1; buddy.scale.set(1.8 * ar, 1.8, 1);
      var p = pos[curIdx]; buddy.position.set(p.x + (p.x > 1 ? -1.2 : 1.2), 1.45, p.z + .2); scene.add(buddy);
    });
    var ring = new T.Mesh(new T.TorusGeometry(1.05, .06, 10, 48), new T.MeshBasicMaterial({ color: 0xF97316, transparent: true, opacity: .8 }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(pos[curIdx].x, .36, pos[curIdx].z); scene.add(ring);

    // camera: starts high over the whole level, then flies to the next lesson
    var target = new T.Vector3(), az = 0, azGoal = 0, t0 = 0, intro = still ? 0 : 2600;
    var focus = pos[curIdx], over = new T.Vector3(0, 0, -9);
    function camAt(k) {
      var e = 1 - Math.pow(1 - k, 3);
      target.lerpVectors(over, focus, e);
      var tall = cam.aspect < 1, dist = (tall ? 17 : 16) - e * (tall ? 7.5 : 5.5), h = (tall ? 19 : 17) - e * (tall ? 9 : 8.5);
      cam.position.set(target.x + Math.sin(az) * dist, h, target.z + Math.cos(az) * dist);
      cam.lookAt(cam.aspect < 1 ? target.x : target.x * .6, 0, target.z - (cam.aspect < 1 ? -0.2 : 3));
    }

    // picking: tap a stone to see it; tap "Open" to go to the lesson
    var ray = new T.Raycaster(), v = new T.Vector2(), hover = -1, down = null;
    function pick(e) {
      var r = canvas.getBoundingClientRect(); v.x = ((e.clientX - r.left) / r.width) * 2 - 1; v.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(v, cam); var hit = ray.intersectObjects(stones.concat(stones.map(function (s) { return s.userData.badge; }).filter(Boolean)))[0]; if (!hit) return -1; var o = hit.object; return o.userData.i != null ? o.userData.i : stones.findIndex(function (s) { return s.userData.badge === o; });
    }
    function showTip(i) {
      var node = nodes[i]; if (!node) return;
      tip.innerHTML = '';
      tip.appendChild(document.createTextNode(labelFor(node)));
      if (node.href) { var a = document.createElement('a'); a.href = node.href; a.textContent = ' · Open →'; tip.appendChild(a); tip.style.pointerEvents = 'auto'; }
      else tip.style.pointerEvents = 'none';
      tip.classList.add('show'); clearTimeout(showTip.t); showTip.t = setTimeout(function () { tip.classList.remove('show'); tip.style.pointerEvents = 'none'; }, 4200);
    }
    canvas.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY, az: azGoal }; });
    window.addEventListener('pointerup', function (e) {
      if (!down) return; var moved = Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y); var d = down; down = null;
      if (moved < 8 && e.target === canvas) { var i = pick(e); if (i > -1) showTip(i); }
      else if (d) { /* keep the turned view */ }
    });
    canvas.addEventListener('pointermove', function (e) {
      if (down) { azGoal = Math.max(-.7, Math.min(.7, down.az - (e.clientX - down.x) / 300)); return; }
      if (e.pointerType === 'mouse') { var i = pick(e); if (i !== hover) { hover = i; canvas.style.cursor = i > -1 ? 'pointer' : 'grab'; } }
    });
    canvas.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showTip(curIdx); } });
    canvas.tabIndex = 0;

    // render only while on screen
    var visible = !('IntersectionObserver' in window), raf = 0; // drawing starts when the map is on screen
    function frame(now) {
      raf = 0; if (!visible) return;
      if (!t0) t0 = now;
      var k = intro ? Math.min(1, (now - t0) / intro) : 1;
      az += (azGoal - az) * .08; camAt(k);
      var tt = now / 1000;
      if (!still) {
        ring.scale.setScalar(1 + Math.sin(tt * 3) * .06); ring.material.opacity = .55 + Math.sin(tt * 3) * .25;
        if (buddy) buddy.position.y = 1.35 + Math.sin(tt * 2.2) * .12;
        stones.forEach(function (s, i) { var goal = i === hover ? .45 : s.userData.baseY; s.position.y += (goal - s.position.y) * .15; if (s.userData.badge) s.userData.badge.position.y = s.position.y + .78; });
      }
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[es.length - 1].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }, { threshold: .05 }).observe(box); // latest entry wins: several can arrive at once
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', function () { var w = box.clientWidth, h = box.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); });
  }

  function init() {
    if (started) return;
    box = document.getElementById('map3d'); canvas = document.getElementById('map3dCanvas'); tip = document.getElementById('map3dTip'); toggle = document.getElementById('map3dToggle');
    if (!box || !canvas || !webglOK()) return;
    var nodes = readNodes(); if (!nodes.length) return;
    started = true;
    box.hidden = false; document.body.classList.add('s26-has3d');
    var legend = document.createElement('div'); legend.className = 's26-maplegend'; legend.setAttribute('aria-hidden', 'true');
    legend.innerHTML = '<span><i style="background:#F97316"></i>Done</span><span><i style="background:#fff;box-shadow:inset 0 0 0 2px #F97316"></i>Next</span><span><i style="background:#F3E3D6"></i>Locked</span>';
    box.appendChild(legend);
    toggle.addEventListener('click', function () { var on = document.body.classList.toggle('s26-list'); toggle.textContent = on ? 'Show the 3D map' : 'Show as a list'; });
    var go = function () { loadThree(function (ok) { if (!ok) return fallback(); try { build(nodes); } catch (e) { if (window.console) console.warn('3D map skipped:', e); fallback(); } }); };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[es.length - 1].isIntersecting) { io.disconnect(); go(); } }, { rootMargin: '500px 0px' });
      io.observe(box);
    } else go();
  }
  if (window.LumioMapState) init();
  document.addEventListener('lumio-map-ready', init);
})();
