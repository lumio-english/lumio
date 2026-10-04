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

  // Two palettes: warm daylight for kids, midnight + glowing orange for teens (body.theme-teen-light).
  var night = false;
  function pal() {
    return night ? {
      fog: 0x0B1226, sky: 0x8FA6FF, gnd: 0x0B1226, hemi: .5, sun: .85, warm: 1.4,
      ground: 0x111C38, road: 0x24345F, roadDone: 0xF97316, sideDone: 0xEA580C, sideOpen: 0xFB923C, sideLocked: 0x33446F,
      tree: [0x1E3A6E, 0x2B4C8A], trunk: 0x3A2E4F, sparkle: 0xFFB27A,
      top: { done: '#F97316', current: '#0B1226', awaiting: '#3B2A1E', 'awaiting-hw': '#3B2A1E', locked: '#2A3966' },
      lock: '#7F90BF', badgeLocked: ['#22315A', '#9AA8D1', '#3A4C80']
    } : {
      fog: 0xF8DCC6, sky: 0xFFFFFF, gnd: 0xE9A77A, hemi: .5, sun: .8, warm: .55,
      ground: 0xF4CDB0, road: 0xD98B5A, roadDone: 0xF97316, sideDone: 0xC2410C, sideOpen: 0xFB923C, sideLocked: 0xB0927C,
      tree: [0xFB923C, 0xEA580C], trunk: 0x9A5B34, sparkle: 0xFFFFFF,
      top: { done: '#F97316', current: '#FFFFFF', awaiting: '#FFEBDB', 'awaiting-hw': '#FFEBDB', locked: '#D8BFAC' },
      lock: '#8E705B', badgeLocked: ['#FFFFFF', '#7A6352', '#C9AE9A']
    };
  }
  function stoneTexture(T, node) {
    var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d');
    var P = pal(), bg = P.top[node.state];
    x.fillStyle = bg; x.beginPath(); x.arc(128, 128, 128, 0, Math.PI * 2); x.fill();
    x.translate(128, 128); x.rotate(-Math.PI / 2); x.translate(-128, -128); // the cylinder cap maps the canvas a quarter-turn round
    x.lineWidth = 10; x.strokeStyle = 'rgba(0,0,0,.08)'; x.beginPath(); x.arc(128, 128, 100, 0, Math.PI * 2); x.stroke();
    if (node.state === 'current') { x.lineWidth = 18; x.strokeStyle = '#F97316'; x.beginPath(); x.arc(128, 128, 116, 0, Math.PI * 2); x.stroke(); }
    if (node.state === 'done') { x.strokeStyle = '#FFFFFF'; x.lineWidth = 22; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(78, 132); x.lineTo(112, 164); x.lineTo(178, 96); x.stroke(); }
    if (node.state === 'locked') { // a small padlock so locked stones read clearly, even far away
      x.fillStyle = P.lock; x.strokeStyle = P.lock; x.lineWidth = 16; x.beginPath(); x.arc(128, 112, 30, Math.PI, 0); x.stroke();
      x.beginPath(); x.moveTo(84, 112); x.arcTo(172, 112, 172, 176, 12); x.arcTo(172, 176, 84, 176, 12); x.arcTo(84, 176, 84, 112, 12); x.arcTo(84, 112, 172, 112, 12); x.fill(); }
    var t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
  }
  // number badge that always faces the camera (readable from any angle)
  function badgeTexture(T, node) {
    var c = document.createElement('canvas'); c.width = 256; c.height = 160; var x = c.getContext('2d');
    var P = pal(), bg = { done: '#F97316', current: night ? '#FFFFFF' : '#111111', awaiting: '#C2410C', 'awaiting-hw': '#C2410C', locked: P.badgeLocked[0] }[node.state];
    var fg = node.state === 'locked' ? P.badgeLocked[1] : (node.state === 'current' && night ? '#0B1226' : '#FFFFFF');
    x.fillStyle = bg; x.beginPath(); x.moveTo(40, 8); x.arcTo(248, 8, 248, 152, 40); x.arcTo(248, 152, 8, 152, 40); x.arcTo(8, 152, 8, 8, 40); x.arcTo(8, 8, 248, 8, 40); x.fill();
    if (node.state === 'locked') { x.lineWidth = 6; x.strokeStyle = P.badgeLocked[2]; x.stroke(); }
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
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    var P = pal();
    var scene = new T.Scene(); scene.fog = new T.Fog(P.fog, 20, 50);
    var cam = new T.PerspectiveCamera(42, W / H, .1, 120);
    scene.add(new T.HemisphereLight(P.sky, P.gnd, P.hemi));
    var sun = new T.DirectionalLight(night ? 0xC9D4FF : 0xFFF4E8, P.sun); sun.position.set(7, 16, 6); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); var sc = sun.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 50; sun.shadow.bias = -.0015;
    scene.add(sun); scene.add(sun.target);
    var warm = new T.PointLight(0xF97316, P.warm, 14, 1.6); scene.add(warm);

    // the winding road: lesson 1 nearest the camera, the last lesson far away
    var N = nodes.length, pts = [];
    for (var i = 0; i <= 40; i++) { var t = i / 40; pts.push(new T.Vector3(Math.sin(t * Math.PI * 3.2) * 3.4, 0, 6 - t * 30)); }
    var curve = new T.CatmullRomCurve3(pts);
    var road = new T.Mesh(new T.TubeGeometry(curve, 240, .36, 10, false), new T.MeshStandardMaterial({ color: P.road, roughness: .85 }));
    road.scale.y = .25; road.receiveShadow = true; scene.add(road);
    var ground = new T.Mesh(new T.CircleGeometry(60, 48), new T.MeshStandardMaterial({ color: P.ground, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.12; ground.receiveShadow = true; scene.add(ground);

    var stones = [], pos = [], chests = [], doneCount = 0, curIdx = 0;
    nodes.forEach(function (node, i) {
      var p = curve.getPointAt(N > 1 ? i / (N - 1) : 0); pos.push(p);
      var lit = node.state !== 'locked';
      var side = new T.MeshStandardMaterial({ color: node.state === 'done' ? P.sideDone : lit ? P.sideOpen : P.sideLocked, roughness: .55,
        emissive: night && lit ? 0xF97316 : 0x000000, emissiveIntensity: night ? (node.state === 'done' ? .35 : .5) : 0 });
      var map = stoneTexture(T, node);
      var top = new T.MeshStandardMaterial({ map: map, roughness: .45, emissive: night && lit ? 0xFFFFFF : 0x000000, emissiveMap: night && lit ? map : null, emissiveIntensity: night ? .35 : 0 });
      var m = new T.Mesh(new T.CylinderGeometry(.82, .9, .34, 40), [side, top, side]);
      m.castShadow = true; m.receiveShadow = true;
      m.position.set(p.x, still ? .17 : -.6, p.z); m.userData = { i: i, baseY: .17, lit: lit }; scene.add(m); stones.push(m);
      var bt = badgeTexture(T, node);
      var badge = new T.Sprite(new T.SpriteMaterial({ map: bt, transparent: true, depthWrite: false }));
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
        g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
        var off = p.x > 0 ? -1.7 : 1.7; g.position.set(p.x + off, 0, p.z); g.rotation.y = off > 0 ? -.5 : .5; g.userData.open = open; scene.add(g); chests.push(g);
      }
    });
    if (!curIdx && doneCount === N) curIdx = N - 1;

    // the stretch of road already travelled glows orange, up to the next lesson
    var reach = N > 1 ? Math.max(curIdx, doneCount) / (N - 1) : 0, trail = null;
    if (reach > 0) {
      var tp = []; for (var q = 0; q <= 60; q++) tp.push(curve.getPointAt(reach * q / 60));
      trail = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(tp), 160, .2, 8, false),
        new T.MeshStandardMaterial({ color: P.roadDone, emissive: 0xF97316, emissiveIntensity: night ? .9 : .25, roughness: .4 }));
      trail.scale.y = .32; trail.position.y = .02; scene.add(trail);
    }

    // a few soft trees and floating letters for depth
    var treeMat = [new T.MeshStandardMaterial({ color: P.tree[0], roughness: .8 }), new T.MeshStandardMaterial({ color: P.tree[1], roughness: .8 })], trunk = new T.MeshStandardMaterial({ color: P.trunk }), trees = [];
    for (var k = 0; k < 10; k++) {
      var tz = 2 - k * 3.1, tx = (k % 2 ? 1 : -1) * (7.5 + (k * 37 % 5) * .7);
      var tg = new T.Group(); var tr = new T.Mesh(new T.CylinderGeometry(.1, .14, .7, 8), trunk); tr.position.y = .35; tg.add(tr);
      var cone = new T.Mesh(new T.ConeGeometry(.5 + (k % 3) * .1, 1.2, 12), treeMat[k % 2]); cone.position.y = 1.1; tg.add(cone);
      tg.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
      tg.position.set(tx, 0, tz); tg.userData.ph = k * 1.3; scene.add(tg); trees.push(tg);
    }
    // drifting sparkles (fireflies at night)
    var SP = 70, spPos = new Float32Array(SP * 3), spSeed = [];
    for (var s2 = 0; s2 < SP; s2++) { spPos[s2 * 3] = (Math.random() - .5) * 20; spPos[s2 * 3 + 1] = Math.random() * 5; spPos[s2 * 3 + 2] = 6 - Math.random() * 32; spSeed.push(Math.random() * 6.28); }
    var spGeo = new T.BufferGeometry(); spGeo.setAttribute('position', new T.BufferAttribute(spPos, 3));
    var sparkles = new T.Points(spGeo, new T.PointsMaterial({ color: P.sparkle, size: night ? .16 : .12, transparent: true, opacity: night ? .9 : .75, depthWrite: false }));
    scene.add(sparkles);

    // the student's buddy stands on the next lesson
    var buddy = null, teen = /^level([3-9]|10)$/.test((window.LumioMapState || {}).level || '');
    new T.TextureLoader().load('assets/story/characters/' + (teen ? 'lumi-teen-welcome-hero.png' : 'lumi-welcome-hero.png'), function (tex) {
      buddy = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true }));
      var ar = tex.image ? tex.image.width / tex.image.height : 1; buddy.scale.set(1.8 * ar, 1.8, 1);
      var p = pos[curIdx]; buddy.position.set(p.x + (p.x > 1 ? -1.2 : 1.2), 1.45, p.z + .2); buddy.userData.x = buddy.position.x; scene.add(buddy);
    });
    var ring = new T.Mesh(new T.TorusGeometry(1.05, .06, 10, 48), new T.MeshBasicMaterial({ color: 0xF97316, transparent: true, opacity: .8 }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(pos[curIdx].x, .36, pos[curIdx].z); scene.add(ring);
    var ring2 = ring.clone(); ring2.material = ring.material.clone(); scene.add(ring2);
    warm.position.set(pos[curIdx].x, 2.2, pos[curIdx].z);

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
        var since = (now - t0) / 1000;
        ring.scale.setScalar(1 + Math.sin(tt * 3) * .06); ring.material.opacity = .55 + Math.sin(tt * 3) * .25;
        var w = (tt * .8) % 1; ring2.scale.setScalar(1 + w * 1.4); ring2.material.opacity = .7 * (1 - w); // a ripple spreading out from the next lesson
        warm.intensity = P.warm * (.8 + Math.sin(tt * 3) * .2);
        if (buddy) { var hop = Math.abs(Math.sin(tt * 2.4)); buddy.position.y = 1.3 + hop * .28; buddy.scale.y = 1.8 * (1 - (1 - hop) * .05); }
        stones.forEach(function (s, i) {
          // stones rise one after another during the intro, then breathe in a gentle wave along the road
          var rise = Math.min(1, Math.max(0, (since - i * .06) / .5)), riseE = 1 - Math.pow(1 - rise, 3);
          var wave = s.userData.lit ? Math.sin(tt * 1.8 - i * .45) * .06 : Math.sin(tt * 1.2 - i * .45) * .02;
          var goal = (i === hover ? .5 : s.userData.baseY + wave + (i === curIdx ? .08 + Math.sin(tt * 3) * .05 : 0));
          var y = -.6 + (goal + .6) * riseE; s.position.y += (y - s.position.y) * (rise < 1 ? 1 : .18);
          if (i === curIdx) s.rotation.y = tt * .6;
          if (s.userData.badge) { s.userData.badge.position.y = s.position.y + .8; s.userData.badge.material.opacity = rise; }
        });
        chests.forEach(function (g, i) { g.position.y = Math.abs(Math.sin(tt * 1.6 + i)) * (g.userData.open ? .12 : .04); g.rotation.z = Math.sin(tt * 1.6 + i) * .03; });
        trees.forEach(function (g) { g.rotation.z = Math.sin(tt * 1.1 + g.userData.ph) * .04; });
        var a = spGeo.attributes.position.array;
        for (var j = 0; j < SP; j++) { a[j * 3 + 1] += .006; a[j * 3] += Math.sin(tt + spSeed[j]) * .003; if (a[j * 3 + 1] > 5.5) a[j * 3 + 1] = 0; }
        spGeo.attributes.position.needsUpdate = true;
        if (trail) trail.material.emissiveIntensity = (night ? .8 : .2) + Math.sin(tt * 2) * (night ? .25 : .1);
      }
      sun.target.position.set(target.x, 0, target.z); sun.position.set(target.x + 7, 16, target.z + 6);
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
    night = document.body.classList.contains('theme-teen-light') || document.body.classList.contains('theme-teen');
    box.classList.toggle('night', night);
    var nodes = readNodes(); if (!nodes.length) return;
    started = true;
    box.hidden = false; document.body.classList.add('s26-has3d');
    var legend = document.createElement('div'); legend.className = 's26-maplegend'; legend.setAttribute('aria-hidden', 'true');
    legend.innerHTML = '<span><i style="background:#F97316"></i>Done</span><span><i style="background:' + (night ? '#0B1226' : '#fff') + ';box-shadow:inset 0 0 0 2px #F97316"></i>Next</span><span><i style="background:' + (night ? '#33446F' : '#B0927C') + '"></i>Locked</span>';
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
