/* Lumio English — public site (index.html).
   Builds the page in the visitor's language (localStorage "lumio_lang", default Arabic) and adds motion:
   a three.js letter-tile hero, a pinned "how it works" story, and GSAP scroll reveals.
   Progressive enhancement: with no WebGL, no GSAP or prefers-reduced-motion, every section still
   renders complete and readable; only the motion is skipped. */
(function () {
  'use strict';
  var G = window.gsap, ST = window.ScrollTrigger, THREE = window.THREE;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(pointer: fine)').matches;
  if (G && ST) G.registerPlugin(ST); else { G = null; ST = null; }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var WA = 'https://wa.me/201124882493';

  /* ---------- language ---------- */
  var DICT = window.LUMIO_SITE_I18N || { en: {}, ar: {} };
  var lang = document.documentElement.lang === 'en' ? 'en' : 'ar', rtl = lang === 'ar';
  var L = DICT[lang] || DICT.en;
  function t(k) { return (L[k] != null ? L[k] : (DICT.en[k] != null ? DICT.en[k] : '')); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
  $$('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); }); // trusted copy from js/site-i18n.js only
  $$('[data-i18n-label]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-label'))); });
  $$('[data-i18n-alt]').forEach(function (el) { el.setAttribute('alt', t(el.getAttribute('data-i18n-alt'))); });
  document.title = t('meta.title');
  $('#dbLes').textContent = t('db.of').replace('{n}', 9);
  $('#langBtn').addEventListener('click', function () {
    try { localStorage.setItem('lumio_lang', rtl ? 'en' : 'ar'); } catch (e) {}
    location.reload();
  });
  // nav: white bar once you leave the top of the hero
  function navTheme() { $('#nav').classList.toggle('light', window.scrollY > 40); }
  window.addEventListener('scroll', navTheme, { passive: true }); navTheme();

  /* ---------- 3D letter-tile world (hero) ---------- */
  var TILES = [['A','Apple','تفاحة'],['B','Book','كتاب'],['C','Cat','قطة'],['D','Dog','كلب'],['E','Egg','بيضة'],['F','Fish','سمكة'],['G','Garden','حديقة'],['H','Hello','مرحبا'],['S','Sun','شمس'],['M','Moon','قمر'],['R','Read','اقرأ'],['T','Tree','شجرة'],['أ','Arnab','أرنب'],['ب','Bab','باب'],['ش','Shams','شمس'],['ع','Ain','عين'],['ن','Noor','نور'],['م','Madrasa','مدرسة'],['L','Lumi','لومي'],['W','Water','ماء'],['K','Kite','طائرة ورقية'],['Z','Zebra','حمار وحشي']];
  function tileTexture(ch, i) {
    var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d');
    var bgs = [['#FFFFFF','#F97316'],['#F97316','#FFFFFF'],['#FFE3CC','#C2410C'],['#FFFFFF','#111111'],['#C2410C','#FFFFFF']];
    var p = bgs[i % bgs.length];
    x.fillStyle = p[0]; x.fillRect(0, 0, 256, 256);
    var g = x.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(0,0,0,.08)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    x.fillStyle = p[1]; x.textAlign = 'center'; x.textBaseline = 'middle';
    var arabic = /[\u0600-\u06FF]/.test(ch);
    x.font = (arabic ? '800 150px Tajawal, sans-serif' : '800 160px "Bricolage Grotesque", Nunito, sans-serif');
    x.fillText(ch, 128, arabic ? 120 : 136);
    var t = new THREE.CanvasTexture(c); t.anisotropy = 4; return { tex: t, side: p[0] };
  }
  function makeWorld(canvas, opts) {
    if (!THREE) return null;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    var scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xFFF4EA, 12, 28);
    var cam = new THREE.PerspectiveCamera(45, 1, .1, 100); cam.position.set(0, 0, 11);
    scene.add(new THREE.AmbientLight(0xFFFFFF, .55));
    var key = new THREE.DirectionalLight(0xFFFFFF, 1.1); key.position.set(4, 6, 8); scene.add(key);
    var warm = new THREE.PointLight(0xF97316, 2.2, 22); warm.position.set(3, -1, 4); scene.add(warm);
    var gold = new THREE.PointLight(0xFFFFFF, 1.1, 18); gold.position.set(-5, 3, 2); scene.add(gold);
    // a soft sun
    var sun = new THREE.Mesh(new THREE.SphereGeometry(1.5, 48, 48), new THREE.MeshStandardMaterial({ color: 0xE8590C, emissive: 0x9A3412, emissiveIntensity: .55, roughness: .75, metalness: 0 }));
    sun.position.set(opts.sunX || 3.2, .4, -2);
    // phones: no sun, so the orange headline never sits on an orange disc
    function placeSun() { var narrow = canvas.clientWidth < 700; sun.position.set(opts.sunX || 3.2, .4, -2); sun.visible = !opts.noSun && !narrow; if (halo) { halo.position.copy(sun.position); halo.visible = sun.visible; } } scene.add(sun); if (opts.noSun) sun.visible = false;
    var halo = null;
    halo = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.05, 64), new THREE.MeshBasicMaterial({ color: 0xF97316, transparent: true, opacity: .35, side: THREE.DoubleSide }));
    halo.position.copy(sun.position); scene.add(halo); placeSun(); window.addEventListener('resize', placeSun); if (opts.noSun) halo.visible = false;
    var geo = new THREE.BoxGeometry(1, 1, .24);
    var tiles = [];
    var count = opts.count || TILES.length;
    for (var i = 0; i < count; i++) {
      var d = TILES[i % TILES.length]; var tx = tileTexture(d[0], i);
      var sideMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(tx.side).multiplyScalar(.85), roughness: .45 });
      var face = new THREE.MeshStandardMaterial({ map: tx.tex, roughness: .38, metalness: .05 });
      var m = new THREE.Mesh(geo, [sideMat, sideMat, sideMat, sideMat, face, face]);
      var r = 2.2 + Math.random() * 4.8, a = Math.random() * Math.PI * 2;
      m.userData = { base: new THREE.Vector3(Math.cos(a) * r * 1.2 + (opts.biasX ? opts.biasX() : 0), (Math.random() - .5) * 6.4, -Math.random() * 9 + 2), spin: new THREE.Vector3((Math.random() - .5) * .5, (Math.random() - .5) * .6, (Math.random() - .5) * .3), phase: Math.random() * 6, data: d, burst: new THREE.Vector3() };
      var s = .55 + Math.random() * .75; m.scale.set(s, s, s);
      m.position.copy(m.userData.base); m.rotation.set(Math.random(), Math.random(), Math.random() * .4);
      scene.add(m); tiles.push(m);
    }
    var state = { mx: 0, my: 0, prog: 0, burst: 0, tint: 0, running: true };
    function size() { var w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < 700 ? 60 : 45; cam.updateProjectionMatrix(); }
    size(); window.addEventListener('resize', size);
    var t0 = performance.now();
    function frame(now) {
      if (!state.running) return;
      var t = (now - t0) / 1000;
      cam.position.x += ((state.mx * 1.2) - cam.position.x) * .04;
      cam.position.y += ((-state.my * .8) - cam.position.y) * .04;
      cam.position.z = 11 - state.prog * 9;
      cam.lookAt(0, 0, -2 - state.prog * 4);
      tiles.forEach(function (m) {
        var u = m.userData;
        if (!reduce) { m.rotation.x += u.spin.x * .01; m.rotation.y += u.spin.y * .01; }
        var bob = reduce ? 0 : Math.sin(t * .8 + u.phase) * .25;
        var spread = 1 + state.prog * 1.4 + state.burst * 3;
        m.position.set(u.base.x * spread, u.base.y * spread + bob, u.base.z + state.burst * 6);
      });
      sun.rotation.y = t * .1; halo.lookAt(cam.position); halo.scale.setScalar(1 + Math.sin(t * 1.4) * .04);
      key.color.setRGB(1, 1 - state.tint * .6, 1 - state.tint * .6);
      renderer.render(scene, cam);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    window.addEventListener('pointermove', function (e) { state.mx = e.clientX / window.innerWidth - .5; state.my = e.clientY / window.innerHeight - .5; });
    // tap / click a tile: it flips and speaks
    var ray = new THREE.Raycaster(), v = new THREE.Vector2();
    canvas.addEventListener('pointerdown', function (e) {
      var r = canvas.getBoundingClientRect(); v.x = ((e.clientX - r.left) / r.width) * 2 - 1; v.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(v, cam); var hit = ray.intersectObjects(tiles)[0]; if (!hit) return;
      var m = hit.object, d = m.userData.data;
      if (G) G.to(m.rotation, { y: m.rotation.y + Math.PI * 2, x: 0, duration: 1, ease: 'power3.out' });
      if (opts.onTip) opts.onTip(d, e.clientX - r.left, e.clientY - r.top);
    });
    return {
      state: state,
      burst: function () { if (G) G.fromTo(state, { burst: 0 }, { burst: 1, duration: 1.2, ease: 'power3.in' }); },
      reset: function () { state.burst = 0; },
      flash: function () { if (G) G.fromTo(state, { tint: 1 }, { tint: 0, duration: .9, ease: 'power2.out' }); },
      pause: function (p) { var was = state.running; state.running = !p; if (!p && !was) requestAnimationFrame(frame); }
    };
  }

  /* ---------- levels ---------- */
  $('#nodes').innerHTML = t('levels').map(function (l, i) {
    return '<div class="node' + (i % 2 ? ' r' : '') + '"><div class="disc" style="background:' + (i % 2 ? '#C2410C' : '#F97316') + '">' + esc(l[0]) + '</div><div class="card"><b>' + esc(l[1]) + '</b><div class="m">' + esc(l[2]) + '</div><p>' + esc(l[3]) + '</p></div></div>';
  }).join('');

  /* ---------- English Hub ---------- */
  var HUB_IC = [
    '<path d="M4 19V5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zm0 0a2 2 0 002 2h13"/>',
    '<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/>',
    '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
    '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    '<path d="M3 18l4-12 4 12M4.5 14h5"/><path d="M14 6v12h3.5a3 3 0 000-6H14m0 0h3a3 3 0 000-6h-3"/>',
    '<path d="M6 8.5a6 6 0 1112 0c0 3.5-3 4.5-3 7.5a3.5 3.5 0 01-6.5 1.8"/><path d="M9.5 8.5a2.5 2.5 0 015 0"/>',
    '<path d="M4 6h16M4 12h10M4 18h7"/><circle cx="18" cy="16" r="3"/>'
  ];
  $('#hublist').innerHTML = t('hub').map(function (h, i) {
    return '<div class="hitem"><div class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + HUB_IC[i] + '</svg></div><div><b>' + esc(h[0]) + '</b><span>' + esc(h[1]) + '</span></div><em>' + esc(h[2]) + '</em></div>';
  }).join('');
  // the real Hub screen recording plays only while it is on screen (saves data on phones)
  (function () {
    var vid = $('#hubdev video'); if (!vid || reduce || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause(); }); }, { threshold: .35 }).observe(vid);
  })();

  /* ---------- games ---------- */
  var GAME_IMG = ['pre-a', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6'];
  $('#gtrack').innerHTML = t('games').map(function (g, i) {
    return '<article class="gcard"><div class="poster"><img src="assets/site/game-' + GAME_IMG[i] + '.jpg" alt="" loading="lazy"><span>' + esc(g[0]) + '</span></div><div class="body"><h3>' + esc(g[1]) + '</h3><p>' + esc(g[2]) + '</p><span class="play">' + esc(t('games.play')) + (rtl ? ' ←' : ' →') + '</span></div></article>';
  }).join('');

  /* ---------- stories ---------- */
  var STORY_META = [['pre-a', 19], ['level1', 24], ['level2', 40], ['level3', 40]];
  var STORIES = t('stories').map(function (s, i) { return { lv: STORY_META[i][0], pages: STORY_META[i][1], level: s.level, title: s.title, parts: s.parts }; });
  var storyI = 0, storyPart = 0;
  $('#stabs').innerHTML = STORIES.map(function (st, i) { return '<button type="button" class="stab" data-i="' + i + '"><span><b>' + esc(st.title) + '</b><span>' + esc(st.level) + ' · ' + esc(t('st.pages').replace('{n}', st.pages)) + '</span></span><i><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></i></button>'; }).join('');
  function showStory(i, animate) {
    storyI = i; var st = STORIES[i];
    $$('#stabs .stab').forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
    function fill() {
      $('#sImg').src = 'assets/site/story-' + st.lv + '.jpg'; $('#sImg').alt = t('st.alt').replace('{title}', st.title);
      $('#sLevel').textContent = t('st.story').replace('{level}', st.level); $('#sTitle').textContent = st.title; $('#sPages').textContent = t('st.pages').replace('{n}', st.pages);
      $('#sParts').innerHTML = st.parts.map(function (p, k) { return '<div class="part' + (k <= storyPart ? ' on' : '') + '"><small>' + esc(t('st.part').replace('{n}', k + 1)) + '</small><b>' + esc(p) + '</b><span>' + esc(t('st.opens').replace('{n}', (k + 1) * 5)) + '</span></div>'; }).join('');
    }
    if (!animate || !G || reduce) { fill(); return; }
    var a = rtl ? 'inset(0 100% 0 0 round 32px)' : 'inset(0 0 0 100% round 32px)', b = rtl ? 'inset(0 0 0 100% round 32px)' : 'inset(0 100% 0 0 round 32px)';
    G.timeline().to('#sframe', { clipPath: a, duration: .45, ease: 'power3.in' }).add(fill)
      .fromTo('#sframe', { clipPath: b }, { clipPath: 'inset(0 0% 0 0% round 32px)', duration: .7, ease: 'power3.out' })
      .fromTo('#sImg', { scale: 1.15 }, { scale: 1, duration: 1.2, ease: 'power3.out' }, '-=.7')
      .from('#sParts .part', { y: 20, opacity: 0, duration: .4, stagger: .07 }, '-=.9');
  }
  $$('#stabs .stab').forEach(function (b) { b.onclick = function () { showStory(+b.getAttribute('data-i'), true); }; });
  showStory(0, false);

  /* ---------- crew (bios exactly as on the previous site) ---------- */
  var CREW = [
    { key:'lumi', img:'lumi-hero.png', glow:'#FFD3B0', en:{ role:'Lumi', title:'The Explorer', bio:"Lumi set out from Egypt to explore the world — and quickly discovered that English was the key to reaching it. He travelled through the Gulf, the one part of the world he could still explore in his own language, and made it his mission to help every Arabic-speaking child learn English the same way: one curious step at a time.", say:"Yay! Let's learn together!" }, ar:{ role:'لومي', title:'المستكشف', bio:'انطلق لومي من مصر لاستكشاف العالم — واكتشف سريعاً أن اللغة الإنجليزية هي مفتاح الوصول إليه. سافر عبر منطقة الخليج، المكان الوحيد الذي استطاع استكشافه بلغته العربية، وجعل مهمته مساعدة كل طفل يتحدث العربية على تعلم الإنجليزية بنفس الطريقة: خطوة فضولية بعد أخرى.', say:'هيا نتعلم معًا!' } },
    { key:'sara', img:'sara-wave.png', glow:'#FFD3B0', en:{ role:'Sara', title:'The Spark of Color', bio:"Sara is bright, warm, and always dressed in color — she's the face of everything joyful about learning with Lumio. Her charm and vibrant style are the platform itself: colorful, welcoming, and full of life, so every lesson feels like something to look forward to.", say:"Ready for today's lesson?" }, ar:{ role:'سارة', title:'بريق الألوان', bio:'سارة مشرقة ودافئة، وترتدي الألوان دائماً — إنها الوجه المبهج لكل ما هو ممتع في التعلم مع Lumio. سحرها وأسلوبها النابض بالحياة يعكسان المنصة نفسها: ملونة، ترحيبية، ومليئة بالحياة، فتجعل كل درس شيئاً يُنتظر بشوق.', say:'هل أنت مستعد لدرس اليوم؟' } },
    { key:'noor', img:'noor-wave.png', glow:'#FFD3B0', en:{ role:'Noor', title:'The Steady Hand', bio:'Noor has worn her hijab since she was four years old, and carries a wisdom and calm beyond her years. She’s the one who looks after every detail — the progress reports, the worksheets, the flashcards, the writing pages — the same papers a parent holds and signs at home.', say:'I love learning new words!' }, ar:{ role:'نور', title:'اليد الثابتة', bio:'ترتدي نور الحجاب منذ كانت في الرابعة من عمرها، وتحمل حكمة وهدوءاً يفوقان سنها. هي من تهتم بكل تفصيلة — تقارير التقدم، أوراق العمل، البطاقات التعليمية، صفحات الكتابة — نفس الأوراق التي يحملها ويوقعها ولي الأمر في المنزل.', say:'أحب تعلم كلمات جديدة!' } },
    { key:'hamad', img:'hamad-wave.png', glow:'#FFD3B0', en:{ role:'Hamad', title:'The Voice in Arabic', bio:'Hamad wears his thobe and ghutra with quiet pride. He represents the genuine Arabic support built into every part of Lumio — real Arabic-speaking teachers, and a curriculum that speaks a child’s own language, every step of the way.', say:'Welcome, my friend!' }, ar:{ role:'حمد', title:'الصوت بالعربية', bio:'يرتدي حمد ثوبه وغترته بفخر هادئ. يمثل الدعم العربي الحقيقي المدمج في كل جزء من Lumio — معلمون عرب حقيقيون، ومنهج يتحدث بلغة الطفل نفسها في كل خطوة.', say:'أهلا وسهلا يا صديقي!' } },
    { key:'ziad', img:'ziad-wave.png', glow:'#FFD3B0', en:{ role:'Ziad', title:'The Player', bio:'Ziad is a gamer through and through — it shows in how he dresses and how he moves. He represents everything playful about Lumio: the bonus games, the game-based challenges, and the simple idea that learning sticks best when it’s fun.', say:"Let's play a game and learn!" }, ar:{ role:'زياد', title:'اللاعب', bio:'زياد لاعب ألعاب بكل معنى الكلمة — يظهر ذلك في طريقة لبسه وحركته. يمثل كل ما هو ممتع في Lumio: الألعاب الإضافية، التحديات القائمة على اللعب، والفكرة البسيطة بأن التعلم يترسخ بشكل أفضل عندما يكون ممتعاً.', say:'هيا نلعب ونتعلم!' } },
    { key:'omar', img:'omar-thumbs.png', glow:'#FFD3B0', en:{ role:'Omar', title:'The Platform Itself', bio:'Omar wears his thobe with pride in who he is, dresses with Ziad’s easy urban style, carries Noor’s calm, and is always as put-together as Sara. He doesn’t stand for just one thing — he stands for Lumio itself, the platform that brings every one of these qualities together in one place.', say:"Let's read a story together!" }, ar:{ role:'عمر', title:'المنصة ذاتها', bio:'يرتدي عمر ثوبه بفخر بهويته، ويرتدي بأسلوب زياد الحضري السهل، ويحمل هدوء نور، وأنيق دائماً مثل سارة. لا يمثل شيئاً واحداً فقط — بل يمثل Lumio نفسها، المنصة التي تجمع كل هذه الصفات في مكان واحد.', say:'هيا نقرأ قصة معًا!' } }
  ];
  var crewI = 0, crewLang = lang, crewTimer = null;
  $('#thumbs').innerHTML = CREW.map(function (c, i) { return '<button type="button" role="tab" aria-label="' + esc(c[lang].role) + '" data-i="' + i + '"><img src="assets/site/' + c.img + '" alt=""><span class="t"></span></button>'; }).join('');
  function paintCrewLang() { $('#bEn').classList.toggle('on', crewLang === 'en'); $('#bAr').classList.toggle('on', crewLang === 'ar'); }
  function showCrew(i, animate) {
    crewI = i; var c = CREW[i], C = c[crewLang];
    $$('#thumbs button').forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', String(k === i)); });
    function fill() {
      $('#pImg').src = 'assets/site/' + c.img; $('#pImg').alt = c[lang].role; $('#portrait').style.setProperty('--glowc', c.glow);
      $('#pSay').innerHTML = esc(c.en.say) + '<small>' + esc(c.ar.say) + '</small>';
      $('#bRole').innerHTML = esc(C.role) + '<em>' + esc(C.title) + '</em>';
      $('#bText').textContent = C.bio; $('#bText').className = crewLang === 'ar' ? 'ar' : ''; $('#bText').dir = crewLang === 'ar' ? 'rtl' : 'ltr';
      $('.bio .role').dir = crewLang === 'ar' ? 'rtl' : 'ltr'; $('.bio .role').style.fontFamily = crewLang === 'ar' ? 'var(--ar)' : 'var(--display)';
    }
    if (!animate || !G || reduce) { fill(); return; }
    G.timeline()
      .to(['#pImg', '#pSay'], { y: 30, opacity: 0, duration: .25, ease: 'power2.in' })
      .to(['#bRole', '#bText'], { y: 16, opacity: 0, duration: .2, ease: 'power2.in' }, 0)
      .add(fill)
      .fromTo('#pImg', { y: 80, opacity: 0, scale: .9 }, { y: 0, opacity: 1, scale: 1, duration: .7, ease: 'power3.out' })
      .fromTo('#pSay', { y: 10, opacity: 0, scale: .8 }, { y: 0, opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)' }, '-=.4')
      .fromTo(['#bRole', '#bText'], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power3.out', stagger: .08 }, '-=.6');
  }
  function runCrewTimer() {
    if (!G || reduce) return;
    if (crewTimer) crewTimer.kill();
    var bar = $$('#thumbs .t')[crewI]; $$('#thumbs .t').forEach(function (x) { G.set(x, { width: 0 }); });
    crewTimer = G.to(bar, { width: '100%', duration: 7, ease: 'none', onComplete: function () { showCrew((crewI + 1) % CREW.length, true); runCrewTimer(); } });
  }
  $$('#thumbs button').forEach(function (b) { b.onclick = function () { showCrew(+b.getAttribute('data-i'), true); runCrewTimer(); }; });
  $('#bEn').onclick = function () { crewLang = 'en'; paintCrewLang(); showCrew(crewI, true); };
  $('#bAr').onclick = function () { crewLang = 'ar'; paintCrewLang(); showCrew(crewI, true); };
  paintCrewLang(); showCrew(0, false);

  /* ---------- pricing: same prices and currencies as the previous site ---------- */
  var CUR = ['SAR', 'USD', 'AED', 'KWD', 'OMR', 'QAR'], SYM = { SAR: 'SAR', USD: '$', AED: 'AED', KWD: 'KD', OMR: 'OMR', QAR: 'QAR' };
  var PRICE = [
    { SAR: 730.00, USD: 194.67, AED: 714.91, KWD: 59.96, OMR: 74.85, QAR: 708.59 },
    { SAR: 3499.99, USD: 933.33, AED: 3427.66, KWD: 287.47, OMR: 358.87, QAR: 3397.32 },
    { SAR: 1949.99, USD: 520.00, AED: 1909.69, KWD: 160.16, OMR: 199.94, QAR: 1892.79 }
  ];
  var PER = [null, { SAR: 583.33, USD: 155.56, AED: 571.28, KWD: 47.91, OMR: 59.81, QAR: 566.22 }, { SAR: 650.00, USD: 173.33, AED: 636.56, KWD: 53.39, OMR: 66.65, QAR: 630.93 }];
  var SAVE = [0, 20, 11], FEAT = 1, cur = 'SAR';
  var money = function (n) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var ck = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
  $('#curs').innerHTML = CUR.map(function (c) { return '<button type="button" data-cur="' + c + '" aria-pressed="' + (c === cur) + '"' + (c === cur ? ' class="on"' : '') + '>' + c + '</button>'; }).join('');
  $('#plans').innerHTML = t('plans').map(function (p, i) {
    var per = PER[i] ? '~<span><span class="sym">SAR</span> <span class="num" data-per="' + i + '">' + money(PER[i].SAR) + '</span></span> ' + esc(t('pr.perlevel')) + ' · ' + esc(t('pr.save').replace('{n}', SAVE[i])) : esc(p.per || '');
    return '<div class="plan' + (i === FEAT ? ' feat' : '') + '">' + (p.badges ? '<div class="badges">' + p.badges.map(function (b) { return '<span>' + esc(b) + '</span>'; }).join('') + '</div>' : '') +
      '<div><div class="nm">' + esc(p.name) + '</div><div class="sm">' + esc(p.sub) + '</div></div>' +
      '<div class="pr"><span class="sym">SAR</span><b class="num" data-price="' + i + '">' + money(PRICE[i].SAR) + '</b></div><div class="per">' + per + '</div>' +
      '<ul>' + p.li.map(function (x) { return '<li>' + ck + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul><a href="login.html">' + esc(t('pr.get')) + '</a></div>';
  }).join('');
  function paintPrices() {
    $$('#plans .sym').forEach(function (s) { s.textContent = SYM[cur]; });
    $$('#plans [data-price]').forEach(function (b) { b.textContent = money(PRICE[+b.getAttribute('data-price')][cur]); });
    $$('#plans [data-per]').forEach(function (b) { b.textContent = money(PER[+b.getAttribute('data-per')][cur]); });
  }
  function countPrices() {
    if (!G || reduce) return;
    $$('#plans [data-price]').forEach(function (b) { var n = PRICE[+b.getAttribute('data-price')][cur], o = { v: 0 }; G.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: function () { b.textContent = money(o.v); }, onComplete: function () { b.textContent = money(n); } }); });
  }
  $$('#curs button').forEach(function (b) { b.onclick = function () { cur = b.getAttribute('data-cur'); $$('#curs button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); }); paintPrices(); }; });

  /* ---------- FAQ ---------- */
  var fqWrap = $('#faqs');
  fqWrap.innerHTML = t('faq').map(function (f, i) { return '<div class="fq"><button type="button" aria-expanded="false" aria-controls="fqa' + i + '" id="fqq' + i + '"><span>' + esc(f[0]) + '</span><span class="ic" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></button><div class="ans" id="fqa' + i + '" role="region" aria-labelledby="fqq' + i + '"><p>' + f[1] + '</p></div></div>'; }).join(''); // answers: trusted copy with links
  $$('.fq', fqWrap).forEach(function (item, i) {
    function set(el, open) { el.classList.toggle('open', open); $('button', el).setAttribute('aria-expanded', String(open)); var a = $('.ans', el); if (G && !reduce) G.to(a, { height: open ? 'auto' : 0, duration: .5, ease: 'power3.inOut' }); else a.style.height = open ? 'auto' : '0'; }
    $('button', item).onclick = function () { var open = !item.classList.contains('open'); $$('.fq', fqWrap).forEach(function (x) { if (x !== item && x.classList.contains('open')) set(x, false); }); set(item, open); };
    if (i === 0) set(item, true);
  });

  /* ---------- WhatsApp: handbook request + free trial booking ---------- */
  $('#pbWaLink').href = WA + '?text=' + encodeURIComponent(t('pb.msg'));
  var dlg = $('#trial'), lastFocus = null, picked = -1;
  var TL = t('trialLevels'), TL_EN = DICT.en.trialLevels;
  $('#tlevels').innerHTML = TL.map(function (l, i) { return '<button type="button" data-i="' + i + '" aria-pressed="false">' + esc(l[0]) + '<small>' + esc(l[1]) + '</small></button>'; }).join('');
  function openTrial(e) { if (e) e.preventDefault(); lastFocus = document.activeElement; dlg.classList.add('open'); document.body.style.overflow = 'hidden'; var f = $('#tlevels button'); if (f) f.focus(); }
  function closeTrial() { dlg.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  $$('#openTrial, [data-trial]').forEach(function (a) { a.addEventListener('click', openTrial); });
  $('#trialClose').onclick = closeTrial;
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeTrial(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dlg.classList.contains('open')) closeTrial(); });
  $$('#tlevels button').forEach(function (b) {
    b.onclick = function () {
      picked = +b.getAttribute('data-i');
      $$('#tlevels button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      // the team reads the request in the parent's language; level names stay recognisable either way
      var l = rtl ? TL[picked] : TL_EN[picked];
      $('#trialBook').href = WA + '?text=' + encodeURIComponent(t('trial.msg').replace('{name}', l[0]).replace('{ages}', l[1]));
      $('#tpick').classList.add('show');
    };
  });
  if (location.hash === '#trial' || location.hash === '#startfree') openTrial();

  /* ---------- hero world ---------- */
  var side = rtl ? -1 : 1;
  var heroWorld = makeWorld($('#world'), { sunX: 3.4 * side, biasX: function () { return window.innerWidth > 900 ? 3.4 * side : 0; }, onTip: function (d, x, y) {
    var tip = $('#tiletip'); tip.innerHTML = esc(d[1]) + '<small>' + esc(d[2]) + '</small>'; tip.style.left = x + 'px'; tip.style.top = y + 'px';
    if (G) G.fromTo(tip, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .3, onComplete: function () { G.to(tip, { opacity: 0, delay: 1.4, duration: .3 }); } });
  } });

  /* ---------- map road ---------- */
  function buildRoad() {
    var wrap = $('#mapwrap'), svg = $('#road'); var R = wrap.getBoundingClientRect();
    var discs = $$('.node .disc', wrap).map(function (d) { var b = d.getBoundingClientRect(); return [b.left - R.left + b.width / 2, b.top - R.top + b.height / 2]; });
    if (!discs.length) return null;
    var d = 'M' + discs[0][0] + ' ' + discs[0][1];
    for (var i = 1; i < discs.length; i++) { var a = discs[i - 1], b = discs[i], my = (a[1] + b[1]) / 2; d += ' C ' + a[0] + ' ' + my + ', ' + b[0] + ' ' + my + ', ' + b[0] + ' ' + b[1]; }
    svg.setAttribute('viewBox', '0 0 ' + R.width + ' ' + R.height);
    svg.innerHTML = '<path d="' + d + '" fill="none" stroke="#E7DED1" stroke-width="12" stroke-linecap="round"/><path id="roadFill" d="' + d + '" fill="none" stroke="#F97316" stroke-width="12" stroke-linecap="round"/>';
    return $('#roadFill');
  }

  /* ---------- live student dashboard (scene 4) ---------- */
  var dbm;
  function buildDashMap() {
    dbm = { lit: null, len: 0, pts: [], lumi: null, gift: null, giftLbl: null };
    var svg = $('#dbMap'); if (!svg) return;
    var NS = 'http://www.w3.org/2000/svg', d = 'M34 222 C 110 236, 130 178, 196 186 S 340 204, 352 150 S 262 104, 192 112 S 40 104, 64 62 S 236 30, 366 46';
    function el(tag, at, parent) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); (parent || svg).appendChild(e); return e; }
    el('path', { d: d, fill: 'none', stroke: '#F3DCCB', 'stroke-width': 10, 'stroke-linecap': 'round' });
    el('path', { d: d, fill: 'none', stroke: 'rgba(194,65,12,.25)', 'stroke-width': 2, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round' });
    var lit = el('path', { d: d, fill: 'none', stroke: '#F97316', 'stroke-width': 10, 'stroke-linecap': 'round' });
    var len = lit.getTotalLength(); dbm.lit = lit; dbm.len = len;
    // nine lessons along the road: 6..14. Done: 6-9. Lesson 10 is the story chest.
    for (var k = 0; k < 9; k++) {
      var f = k / 8, pt = lit.getPointAtLength(len * f); dbm.pts.push({ x: pt.x, y: pt.y, f: f });
      var lesson = k + 6, g = el('g', { transform: 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')' });
      if (lesson === 10) {
        dbm.gift = el('circle', { r: 17, fill: '#FFFFFF', stroke: '#F97316', 'stroke-width': 3 }, g);
        dbm.giftLbl = el('g', { fill: 'none', stroke: '#F97316', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: 'translate(-9 -9) scale(.75)' }, g);
        el('path', { d: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5' }, dbm.giftLbl);
      } else {
        var done = lesson < 10;
        el('circle', { r: 13, fill: done ? '#F97316' : '#FFFFFF', stroke: done ? '#FDBA74' : '#E5CDBA', 'stroke-width': 2, 'class': 'dbn', 'data-l': lesson }, g);
        var t = el('text', { 'text-anchor': 'middle', y: 5, 'font-size': 13, 'font-weight': 800, fill: done ? '#FFFFFF' : '#B39C8A', 'font-family': 'Nunito, system-ui, sans-serif', 'class': 'dbt', 'data-l': lesson }, g); t.textContent = lesson;
      }
    }
    // Lumi stands on the next lesson; a soft pulse marks it
    var p4 = dbm.pts[4];
    dbm.lumi = el('g', { transform: 'translate(' + p4.x + ' ' + p4.y + ')' });
    var pulse = el('circle', { r: 20, fill: 'none', stroke: '#F97316', 'stroke-width': 2, opacity: .7 }, dbm.lumi);
    if (G && !reduce) G.to(pulse, { attr: { r: 30 }, opacity: 0, duration: 1.6, repeat: -1, ease: 'power1.out' });
    el('image', { href: 'assets/site/lumi-mark.png', x: -20, y: -50, width: 40, height: 40 }, dbm.lumi);
    lit.setAttribute('stroke-dasharray', len); lit.setAttribute('stroke-dashoffset', len * (1 - dbm.pts[3].f));
  }

  if (!G || !ST || reduce) { document.documentElement.classList.add("s-still"); buildRoad(); buildDashMap(); window.addEventListener('resize', buildRoad); return; }
  buildDashMap();

  /* ---------- HERO motion ---------- */
  G.from('#heroCopy h1 .line > span', { yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: .12, delay: .2 });
  G.from('.h-in', { y: 24, opacity: 0, duration: .9, ease: 'power3.out', stagger: .1, delay: .55 });
  G.from('#heroLumi', { y: 160, opacity: 0, rotate: 12, duration: 1.4, ease: 'power3.out', delay: .7, onComplete: function () { G.to('#heroLumi', { y: -16, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }); } });
  if (heroWorld) G.from(heroWorld.state, { prog: -.6, duration: 2.2, ease: 'power3.out' });
  $$('[data-count]').forEach(function (el) { var n = +el.getAttribute('data-count'), o = { v: 0 }; G.to(o, { v: n, duration: 2, delay: .9, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } }); });
  // scroll: camera flies into the tiles while the copy lifts away
  ST.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6, onUpdate: function (s) { if (heroWorld) heroWorld.state.prog = s.progress; } });
  G.to('#heroCopy', { y: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: true } });
  G.to('.hero .meta, #heroLumi', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '40% top', scrub: true } });

  // magnetic buttons
  if (fine) $$('.magnet').forEach(function (b) {
    b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); G.to(b, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: 'power3.out' }); });
    b.addEventListener('pointerleave', function () { G.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }); });
  });


  /* ---------- STORY: pinned, one scene per step ---------- */
  var scenes = $$('.scene'), bars = $$('.progress b');
  scenes.forEach(function (s, i) { if (i) G.set(s, { autoAlpha: 0 }); });
  var st = G.timeline({ scrollTrigger: { trigger: '#stage', start: 'top top', end: '+=' + (scenes.length * 90) + '%', pin: true, scrub: .8 } });
  scenes.forEach(function (s, i) {
    var dev = $('.device', s), txt = $('.txt', s);
    st.to(bars[i], { scaleY: 1, duration: 1, ease: 'none' }, i * 1.2);
    if (i === 0) { st.from(dev, { rotateY: -18, rotateX: 8, y: 60, duration: .6, ease: 'power2.out' }, 0); }
    if (i < scenes.length - 1) {
      var next = scenes[i + 1];
      st.to(txt, { y: -60, autoAlpha: 0, duration: .3 }, i * 1.2 + .9)
        .to(dev, { y: -80, rotateX: 12, scale: .92, autoAlpha: 0, duration: .3 }, i * 1.2 + .9)
        .set(next, { autoAlpha: 1 }, i * 1.2 + 1.05)
        .from($('.txt', next), { y: 60, autoAlpha: 0, duration: .3 }, i * 1.2 + 1.05)
        .from($('.n', next), { scale: 1.6, duration: .3 }, i * 1.2 + 1.05)
        .from($('.device', next), { y: 120, rotateX: -14, rotateY: 10, scale: .9, autoAlpha: 0, duration: .35 }, i * 1.2 + 1.05);
    }
  });
  // scene 4: finishing lesson 10 lights the road, opens story part 2 and moves Lumi on
  if (dbm.lit) {
    var t0 = (scenes.length - 2) * 1.2 + 1.35, p4 = dbm.pts[4], p5 = dbm.pts[5], cnt = { stars: 120, pct: 45, streak: 5 };
    st.to(dbm.lit, { attr: { 'stroke-dashoffset': dbm.len * (1 - p5.f) }, duration: .5, ease: 'none' }, t0)
      .to(dbm.gift, { attr: { fill: '#F97316', stroke: '#FDBA74' }, duration: .1 }, t0 + .22)
      .to(dbm.giftLbl, { attr: { stroke: '#FFFFFF' }, duration: .1 }, t0 + .22)
      .fromTo(dbm.lumi, { attr: { transform: 'translate(' + p4.x + ' ' + p4.y + ')' } }, { attr: { transform: 'translate(' + p5.x + ' ' + p5.y + ')' }, duration: .3, ease: 'power2.inOut' }, t0 + .2)
      .to('#dbRing', { attr: { 'stroke-dashoffset': 50 }, duration: .3 }, t0 + .2)
      .to(cnt, { stars: 140, pct: 50, streak: 6, duration: .3, onUpdate: function () { $('#dbStars').textContent = Math.round(cnt.stars); $('#dbPct').textContent = Math.round(cnt.pct); $('#dbStreak').textContent = Math.round(cnt.streak); $('#dbLes').textContent = t('db.of').replace('{n}', cnt.pct >= 49.5 ? 10 : 9); } }, t0 + .2)
      .fromTo('#dbToast', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .15 }, t0 + .3)
      .to('#dbStory', { backgroundColor: '#F97316', color: '#FFFFFF', duration: .1 }, t0 + .32)
      .to('#dbStory svg', { color: '#FFFFFF', duration: .1 }, t0 + .32);
  }
  if (fine) $('#stage').addEventListener('pointermove', function (e) { var px = e.clientX / window.innerWidth - .5, py = e.clientY / window.innerHeight - .5; G.to($$('.device'), { rotateY: px * 8, rotateX: -py * 6, duration: .8, ease: 'power3.out' }); });

  /* ---------- section headers, map, cards ---------- */
  $$('.sechead').forEach(function (h) { G.from(h.children, { y: 40, opacity: 0, duration: .9, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: h, start: 'top 85%' } }); });
  var road = buildRoad();
  if (road) { var rl = road.getTotalLength(); G.set(road, { strokeDasharray: rl, strokeDashoffset: rl }); G.to(road, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#mapwrap', start: 'top 70%', end: 'bottom 75%', scrub: .6 } }); }
  $$('.node').forEach(function (n) {
    G.from($('.disc', n), { scale: 0, duration: .8, ease: 'back.out(2)', scrollTrigger: { trigger: n, start: 'top 82%' } });
    G.from($('.card', n), { x: (n.classList.contains('r') ? 70 : -70) * (rtl ? -1 : 1), opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 82%' } });
  });
  window.addEventListener('resize', function () { var r2 = buildRoad(); if (r2) G.set(r2, { strokeDasharray: 'none', strokeDashoffset: 0 }); });
  G.from('.fcard', { y: 90, opacity: 0, duration: 1, ease: 'power3.out', stagger: .15, scrollTrigger: { trigger: '.freegrid', start: 'top 82%' } });

  /* crew: portrait parallax + reveal; auto-advance while on screen */
  G.from('#portrait', { clipPath: 'inset(100% 0 0 0 round 40px)', duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '#portrait', start: 'top 80%' } });
  G.to('#pImg', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '#crew', start: 'top bottom', end: 'bottom top', scrub: true } });
  ST.create({ trigger: '#crew', start: 'top 70%', end: 'bottom 30%', onEnter: runCrewTimer, onEnterBack: runCrewTimer, onLeave: function () { if (crewTimer) crewTimer.pause(); }, onLeaveBack: function () { if (crewTimer) crewTimer.pause(); } });

  G.from('.plan', { y: 90, opacity: 0, duration: 1, ease: 'power3.out', stagger: .14, scrollTrigger: { trigger: '#plans', start: 'top 82%', once: true, onEnter: function () { countPrices(); } } });
  G.from('.fq', { y: 30, opacity: 0, duration: .7, ease: 'power3.out', stagger: .06, scrollTrigger: { trigger: '#faqs', start: 'top 85%' } });

  /* final: headline words rise, slow drifting embers */
  G.from('#finalH', { y: 80, opacity: 0, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '.final', start: 'top 75%' } });
  (function embers() {
    var c = $('#finalFx'), x = c.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W, H, ps = [];
    function size() { var r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener('resize', size);
    for (var i = 0; i < (W < 600 ? 28 : 60); i++) ps.push({ x: Math.random() * W, y: Math.random() * H, r: .8 + Math.random() * 2.4, v: .2 + Math.random() * .6, p: Math.random() * 6 });
    (function loop(t) { x.clearRect(0, 0, W, H); ps.forEach(function (q) { q.y -= q.v; q.x += Math.sin((t || 0) / 1200 + q.p) * .3; if (q.y < -10) { q.y = H + 10; q.x = Math.random() * W; } x.globalAlpha = .4 + .4 * Math.sin((t || 0) / 500 + q.p); x.fillStyle = q.r > 2 ? '#FFFFFF' : '#FFE3CC'; x.beginPath(); x.arc(q.x, q.y, q.r, 0, Math.PI * 2); x.fill(); }); x.globalAlpha = 1; requestAnimationFrame(loop); })();
  })();


  /* hub: device tilts in, list slides in */
  G.from('#hubdev', { rotateY: -14, rotateX: 6, y: 80, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '#hubdev', start: 'top 82%' } });
  G.from('.hitem', { x: rtl ? -50 : 50, opacity: 0, duration: .7, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: '.hublist', start: 'top 82%' } });
  G.from('#hubdev .float', { scale: 0, rotate: -12, duration: .7, ease: 'back.out(2.4)', delay: .4, scrollTrigger: { trigger: '#hubdev', start: 'top 70%' } });
  /* games: on wide screens the row slides sideways as you scroll (pinned); phones swipe */
  var gmm = G.matchMedia();
  gmm.add('(min-width: 900px)', function () {
    var sc = $('#gscroll'); sc.style.overflow = 'visible';
    var tr = $('#gtrack'), dist = function () { return Math.max(0, tr.scrollWidth - window.innerWidth); };
    G.to(tr, { x: function () { return rtl ? dist() : -dist(); }, ease: 'none', scrollTrigger: { trigger: '#games', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: .7, invalidateOnRefresh: true } });
    return function () { sc.style.overflow = ''; G.set(tr, { x: 0 }); };
  });
  G.from('.gcard', { y: 70, opacity: 0, duration: .8, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '#gtrack', start: 'top 85%' } });
  /* stories: frame scales up from the page; parts fill in as the section passes */
  G.from('#sframe', { scale: .9, borderRadius: '80px', duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '#sframe', start: 'top 85%' } });
  G.from('.stab', { x: rtl ? -40 : 40, opacity: 0, duration: .7, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '#stabs', start: 'top 85%' } });
  ST.create({ trigger: '#stories', start: 'top 40%', end: 'bottom 60%', onUpdate: function (s) { var k = Math.min(3, Math.floor(s.progress * 4)); if (k !== storyPart) { storyPart = k; $$('#sParts .part').forEach(function (p, j) { p.classList.toggle('on', j <= k); }); } } });

})();
