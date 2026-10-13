/* Lumio English — no emoji anywhere: every emoji on a page is shown as a static Lumio icon (js/lumio-icons.js).
   Loaded on every page (site, student, teacher, slides, trial decks, homework, games, Hub...). It walks the page's
   text and keeps watching it (MutationObserver), so text written later by page scripts (slides loaded into the
   stage, game rounds, dashboards) is covered too, without touching those scripts.
   - emoji in MAP -> its icon; any other emoji -> the generic "sparkle" icon (so a new emoji never shows as one);
   - country flags (two regional letters) -> a small letter badge ("SA");
   - text that cannot hold an icon (dropdown options, tooltips, placeholders, page title) -> the emoji is removed.
   Plain typographic symbols are NOT emoji and stay as text: ★ ☆ ✓ ✔ ✗ ✕ ✖ ☰ → ← ↑ ↓ ↔ ↗ ↘ ♪ ♫ ♥ ❚ ⛶ ✦ ✧ © ® ™. */
(function () {
  'use strict';
  if (!window.LumioIcons) return;
  var MAP = {
    // school, lessons, work
    '🔒': 'lock', '🔐': 'lock', '🔓': 'lock', '🎥': 'video', '📹': 'video', '📺': 'video', '📖': 'book', '📘': 'book', '📗': 'book', '📙': 'book', '📕': 'book', '📔': 'cards', '📇': 'cards',
    '📝': 'pencil', '✏': 'pencil', '✎': 'pencil', '🖊': 'pencil', '🖍': 'pencil', '✍': 'write', '🎨': 'write', '📅': 'calendar', '🗓': 'calendar', '📆': 'calendar',
    '🔁': 'retry', '🔄': 'retry', '🔃': 'retry', '⏰': 'clock', '🕐': 'clock', '🕒': 'clock', '⌛': 'clock', '⏳': 'clock', '⏱': 'timer', '⏲': 'timer',
    '📄': 'sheet', '📃': 'sheet', '📋': 'sheet', '🧾': 'sheet', '📑': 'sheet', '📚': 'library', '🎓': 'grad', '🧑‍🎓': 'grad', '🏫': 'school', '🧪': 'flask', '🔬': 'flask',
    '📐': 'ruler', '📏': 'ruler', '🧩': 'puzzle', '🔡': 'blocks', '🔠': 'blocks', '🔤': 'sound', '🔢': 'blocks', '💡': 'bulb', '🧠': 'bulb',
    '📊': 'chart', '📈': 'chart', '📉': 'chart', '📂': 'folder', '📁': 'folder', '🗂': 'folder', '📥': 'inbox', '📦': 'gift',
    // rewards and feelings
    '⭐': 'star', '🌟': 'star', '💫': 'star', '✨': 'sparkle', '🎉': 'sparkle', '🎊': 'sparkle', '🎈': 'sparkle', '🔮': 'sparkle', '🪄': 'sparkle',
    '🎂': 'gift', '🎁': 'gift', '🛍': 'gift', '🎟': 'ticket', '🎫': 'ticket', '🪙': 'coin', '💰': 'coin', '💵': 'coin', '💸': 'coin', '💳': 'card',
    '🏆': 'trophy', '🥇': 'trophy', '🥈': 'trophy', '🥉': 'trophy', '🏅': 'trophy', '🎖': 'trophy', '👑': 'crown', '💯': 'medal-100', '🎯': 'medal-target',
    '🔥': 'flame', '⚡': 'bolt', '🚀': 'bolt', '💪': 'bolt', '✅': 'check', '☑': 'check', '✔️': 'check', '❤': 'heart', '🤍': 'heart', '💗': 'heart', '💖': 'heart', '💛': 'heart', '🧡': 'heart', '💙': 'heart', '💚': 'heart', '💜': 'heart',
    '🙂': 'smile', '😊': 'smile', '😀': 'smile', '😃': 'smile', '😄': 'smile', '😁': 'smile', '🥳': 'smile', '😎': 'smile', '🤩': 'smile', '😍': 'smile', '😉': 'smile',
    '😂': 'laugh', '🤣': 'laugh', '😆': 'laugh', '😢': 'sad', '😭': 'sad', '😞': 'sad', '😕': 'sad', '😟': 'sad', '😤': 'sad', '😩': 'sad', '😴': 'sad', '💀': 'sad', '😬': 'sad', '🤔': 'question', '😮': 'question', '😲': 'question',
    // hands and people
    '👋': 'wave', '👍': 'thumbs-up', '👎': 'thumbs-down', '✋': 'hand', '🖐': 'hand', '🤚': 'hand', '🙋': 'hand', '✊': 'fist', '👊': 'fist', '👏': 'clap', '🙌': 'clap',
    '👇': 'point', '👆': 'point', '👉': 'point', '👈': 'point', '☝': 'point', '👂': 'ear', '👁': 'eye', '👀': 'eye', '🔍': 'eye', '🔎': 'eye', '🕵': 'eye',
    '🤝': 'people', '👥': 'people', '🧑‍🤝‍🧑': 'people', '👪': 'people', '👨‍👩‍👧': 'people', '👤': 'user', '🧑': 'user', '👩': 'user', '👨': 'user', '👦': 'user', '👧': 'user', '🧕': 'user', '🧒': 'user',
    '👩‍🏫': 'user', '👨‍🏫': 'user', '🧑‍🏫': 'user', '🏃': 'run', '🤸': 'run', '💃': 'run', '🕺': 'run', '🤖': 'robot',
    // media and devices
    '▶': 'play', '⏯': 'play', '⏸': 'pause', '⏹': 'stop', '⏺': 'mic', '🎤': 'mic', '🎙': 'mic', '🔊': 'sound', '🔉': 'sound', '🔈': 'sound', '🎧': 'sound', '🔇': 'sound',
    '🎵': 'music', '🎶': 'music', '🎼': 'music', '🎹': 'music', '🎸': 'music', '🥁': 'music', '📷': 'camera', '📸': 'camera', '🖼': 'image', '🎬': 'video',
    '📱': 'phone', '📲': 'phone', '📞': 'phone', '☎': 'phone', '💻': 'laptop', '🖥': 'laptop', '⌨': 'laptop', '🖨': 'print', '💾': 'save', '📶': 'wifi', '🔋': 'battery', '🔌': 'battery',
    '🎮': 'pad', '🕹': 'pad', '🎲': 'dice', '🃏': 'cards', '♟': 'dice',
    // messages and tools
    '📬': 'mail', '📨': 'mail', '📩': 'mail', '📤': 'mail', '✉': 'mail', '📧': 'mail', '💬': 'speech', '🗣': 'speech', '💭': 'speech', '🗨': 'speech', '📣': 'megaphone', '📢': 'megaphone', '🔔': 'bell',
    '🔗': 'link', '📌': 'pin', '📍': 'pin', '🧷': 'pin', '📎': 'pin', '🔑': 'key', '🗝': 'key', '🗑': 'trash', '🧹': 'trash', '✂': 'scissors', '⚙': 'dots', '🛠': 'dots', '🔧': 'dots', '🔨': 'dots',
    '⬇': 'download', '⬆': 'upload', '🔀': 'shuffle', '➕': 'plus', '➖': 'minus', '🆔': 'id', '🌐': 'globe', '🌍': 'globe', '🌎': 'globe', '🌏': 'globe', '🗺': 'map', '🧭': 'compass',
    '⚠': 'warn', '🚫': 'warn', '❌': 'warn', '⛔': 'warn', '❗': 'warn', '❓': 'question', '❔': 'question', '🟣': 'dot', '🔴': 'dot', '🔵': 'dot', '🟢': 'dot', '🟡': 'dot', '🟠': 'dot', '⚪': 'dot', '⚫': 'dot',
    // nature, places, things (word pictures)
    '☀': 'sun', '🌞': 'sun', '🏖': 'sun', '🌤': 'sun', '⛅': 'rain', '🌧': 'rain', '☔': 'rain', '🌦': 'rain', '❄': 'snow', '☃': 'snow', '⛄': 'snow', '🌙': 'moon', '🌛': 'moon', '⭐️': 'star',
    '🌳': 'tree', '🌲': 'tree', '🌴': 'tree', '🌱': 'plant', '🌿': 'plant', '🍀': 'plant', '🌸': 'flower', '🌷': 'flower', '🌻': 'flower', '🌹': 'flower', '🌼': 'flower',
    '🏠': 'home', '🏡': 'home', '🏘': 'home', '🏢': 'school', '🕌': 'school', '🚗': 'car', '🚌': 'car', '🚕': 'car', '🚲': 'car', '✈': 'car', '🚂': 'car',
    '⚽': 'ball', '🏀': 'ball', '🏈': 'ball', '🎾': 'ball', '🏐': 'ball', '⚾': 'ball',
    '🍎': 'apple', '🍏': 'apple', '🍌': 'apple', '🍊': 'apple', '🍇': 'apple', '🍓': 'apple', '🍉': 'apple', '🍞': 'apple', '🥛': 'apple', '🍕': 'apple', '🍰': 'apple', '🍦': 'apple', '🍪': 'apple', '🥚': 'apple', '🍚': 'apple', '🍗': 'apple', '🥕': 'apple',
    '🦊': 'paw', '🐶': 'paw', '🐕': 'paw', '🐱': 'paw', '🐈': 'paw', '🐼': 'paw', '🦁': 'paw', '🐸': 'paw', '🐵': 'paw', '🐒': 'paw', '🐨': 'paw', '🐯': 'paw', '🐰': 'paw', '🐇': 'paw',
    '🐦': 'paw', '🦉': 'paw', '🦄': 'paw', '🐥': 'paw', '🐤': 'paw', '🐣': 'paw', '🐟': 'paw', '🐠': 'paw', '🐻': 'paw', '🐘': 'paw', '🐮': 'paw', '🐷': 'paw', '🐭': 'paw', '🐴': 'paw', '🐝': 'paw', '🦋': 'paw', '🐢': 'paw', '🦒': 'paw', '🦓': 'paw'
  };
  var KEEP = '★☆✓✔✗✕✖☰→←↑↓↔↗↘♪♫♥❚⛶✦✧©®™‼⁉';
  // one emoji: a pictographic character with its variation selector / skin tone / ZWJ continuation, or a flag
  var EMOJI = '(?:[\\u{1F1E6}-\\u{1F1FF}]{2}|\\p{Extended_Pictographic}(?:\\uFE0F|[\\u{1F3FB}-\\u{1F3FF}])*(?:\\u200D\\p{Extended_Pictographic}(?:\\uFE0F|[\\u{1F3FB}-\\u{1F3FF}])*)*)';
  var RE, TEST;
  try { RE = new RegExp(EMOJI, 'gu'); TEST = new RegExp(EMOJI, 'u'); }
  catch (e) {   // very old browsers without \p{}: the listed emoji only
    var keys = Object.keys(MAP).sort(function (a, b) { return b.length - a.length; });
    RE = new RegExp('(?:' + keys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')️?', 'g');
    TEST = new RegExp(RE.source);
  }
  function iconFor(e) {
    var base = e.replace(/[️\u{1F3FB}-\u{1F3FF}]/gu, '');
    if (MAP[e]) return MAP[e];
    if (MAP[base]) return MAP[base];
    var first = Array.from(base)[0];
    return MAP[first] || 'sparkle';
  }
  function isFlag(e) { var c = e.codePointAt(0); return c >= 0x1F1E6 && c <= 0x1F1FF; }
  function keep(e) { return e.length <= 2 && KEEP.indexOf(e.replace(/️/g, '')) !== -1 && !/️/.test(e); }
  // never touch: code, editable fields and the icons themselves
  var SKIP = 'script,style,textarea,input,svg,.lm-inl,[data-noicon],[contenteditable]';

  function needs(t) { RE.lastIndex = 0; var m; while ((m = RE.exec(t))) { if (!keep(m[0])) { RE.lastIndex = 0; return true; } } RE.lastIndex = 0; return false; }
  function swap(node) {
    var t = node.nodeValue;
    if (!t || !TEST.test(t) || !needs(t)) return;
    var el = node.parentElement;
    if (!el || el.closest(SKIP)) return;
    if (el.closest('select,option,title')) { node.nodeValue = strip(t); return; }
    var frag = document.createDocumentFragment(), last = 0, m;
    RE.lastIndex = 0;
    while ((m = RE.exec(t))) {
      if (keep(m[0])) continue;
      if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
      var s = document.createElement('span');
      s.className = 'lm-inl'; s.setAttribute('aria-hidden', 'true');
      if (isFlag(m[0])) {
        s.className = 'lm-inl lm-flag';
        s.textContent = Array.from(m[0]).map(function (c) { return String.fromCharCode(c.codePointAt(0) - 0x1F1E6 + 65); }).join('');
      } else s.innerHTML = LumioIcons.svg(iconFor(m[0]));
      frag.appendChild(s);
      last = m.index + m[0].length;
    }
    RE.lastIndex = 0;
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  function strip(v) {
    return v.replace(RE, function (e) {
      if (keep(e)) return e;
      return isFlag(e) ? Array.from(e).map(function (c) { return String.fromCharCode(c.codePointAt(0) - 0x1F1E6 + 65); }).join('') : '';
    }).replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
  }
  function scan(root) {
    if (!root) return;
    if (root.nodeType === 3) return swap(root);
    if (root.nodeType !== 1 || (root.closest && root.closest('script,style,svg,.lm-inl'))) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), list = [], n;
    while ((n = w.nextNode())) if (TEST.test(n.nodeValue)) list.push(n);
    list.forEach(swap);
  }
  // text that cannot hold an icon: tooltips, labels read aloud, placeholders, button values
  function attrs(root) {
    if (!root.querySelectorAll) return;
    var list = Array.prototype.slice.call(root.querySelectorAll('[title],[aria-label],[placeholder],input[type=button],input[type=submit],option'));
    if (root.matches && root.matches('[title],[aria-label],[placeholder]')) list.push(root);
    list.forEach(function (e) {
      ['title', 'aria-label', 'placeholder', 'value', 'label'].forEach(function (a) {
        var v = e.getAttribute(a); if (v && TEST.test(v) && needs(v)) e.setAttribute(a, strip(v));
      });
      if (e.tagName === 'OPTION' && TEST.test(e.text) && needs(e.text)) e.text = strip(e.text);
    });
  }
  var queued = [], pending = false;
  function flush() {
    pending = false; var q = queued; queued = [];
    q.forEach(function (n) { if (n.isConnected) { scan(n); if (n.nodeType === 1) attrs(n); } });
    if (TEST.test(document.title) && needs(document.title)) document.title = strip(document.title);
  }
  function start() {
    var css = document.createElement('style');
    css.textContent = '.lm-inl{display:inline-block;width:1.25em;height:1.25em;vertical-align:-.28em;line-height:0;flex-shrink:0}.lm-inl .lm-ico{width:100%;height:100%}' +
      '.lm-inl{margin-inline-end:.12em}' +
      '.lm-flag{width:auto;height:auto;line-height:1.3;font:800 .62em/1.3 system-ui,sans-serif;letter-spacing:.04em;color:#7C2D12;background:#FFEDD5;border-radius:.35em;padding:.1em .38em;vertical-align:.12em}' +
      'button .lm-inl:not(.lm-flag),a .lm-inl:not(.lm-flag),.btn .lm-inl:not(.lm-flag){background:#fff;border-radius:50%;padding:.08em;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,.15)}';
    document.head.appendChild(css);
    scan(document.body); attrs(document.body);
    if (TEST.test(document.title) && needs(document.title)) document.title = strip(document.title);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'characterData') queued.push(m.target);
        else if (m.type === 'attributes') queued.push(m.target);
        else Array.prototype.forEach.call(m.addedNodes, function (n) { queued.push(n); });
      });
      if (!pending && queued.length) { pending = true; (window.queueMicrotask || setTimeout)(flush); }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'aria-label', 'placeholder'] });
  }
  window.LumioEmoji = { strip: function (v) { return strip(String(v || '')); } };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
