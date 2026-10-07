/* Lumio English — swaps the interface emoji for Lumio icons (js/lumio-icons.js).
   Runs on the student page, homework and the teacher dashboard. It walks the page's text, and keeps
   watching it (MutationObserver), so text the page scripts write later is covered too, without
   touching those scripts. Only the emoji listed in MAP are swapped: student animal avatars, flags,
   word pictures (🍎 🐟 …) and plain symbols (★ ✓ → ☰) are left as they are on purpose. */
(function () {
  'use strict';
  if (!window.LumioIcons) return;
  var MAP = {
    '🔒': 'lock', '🔐': 'lock', '🎥': 'video', '🟣': 'video', '📹': 'video', '📖': 'book', '📘': 'book', '📔': 'cards', '📇': 'cards',
    '📝': 'pencil', '✏': 'pencil', '✎': 'pencil', '✍': 'write', '📅': 'calendar', '🗓': 'calendar', '🔁': 'retry', '🔄': 'retry',
    '⏰': 'clock', '🕐': 'clock', '⏳': 'clock', '⭐': 'star', '🌟': 'star', '✨': 'sparkle', '🎉': 'sparkle', '🎈': 'sparkle', '🎂': 'gift',
    '🎁': 'gift', '🎟': 'ticket', '🎫': 'ticket', '🪙': 'coin', '💰': 'coin', '🌳': 'tree', '🌲': 'tree', '🏡': 'tree', '👋': 'wave', '📷': 'camera', '📄': 'sheet', '📋': 'sheet', '📬': 'mail', '📨': 'mail', '📤': 'mail', '💬': 'speech', '🗣': 'speech',
    '🤝': 'people', '👥': 'people', '🧑‍🤝‍🧑': 'people', '▶': 'play', '⏺': 'mic', '🎤': 'mic', '🎙': 'mic', '🔊': 'sound', '🔤': 'sound', '🔡': 'blocks', '🧩': 'puzzle',
    '📐': 'ruler', '🏆': 'trophy', '🥇': 'trophy', '🏅': 'trophy', '🎖': 'trophy', '🎓': 'grad', '🧑‍🎓': 'grad', '📚': 'library', '🔥': 'flame', '⚡': 'bolt',
    '✅': 'check', '💡': 'bulb', '🧠': 'bulb', '🎮': 'pad', '🎲': 'dice', '🎵': 'music', '🎶': 'music', '🧭': 'compass', '🎯': 'medal-target', '🚀': 'bolt', '💯': 'medal-100',
    '👤': 'user', '🧑': 'user', '👩‍🏫': 'user', '👨‍🏫': 'user', '🧑‍🏫': 'user', '👑': 'crown', '⚠': 'warn', '🚫': 'warn', '❌': 'warn', '🔑': 'key', '🗑': 'trash', '🧹': 'trash',
    '👁': 'eye', '🔍': 'eye', '💳': 'card', '📊': 'chart', '📈': 'chart', '🔔': 'bell', '🌐': 'globe', '🌍': 'globe', '📌': 'pin', '🧷': 'pin', '🔗': 'pin',
    '⬇': 'download', '⬆': 'upload', '🖨': 'print', '💾': 'save', '🧪': 'flask', '🙂': 'smile', '❤': 'heart', '🤍': 'heart', '❓': 'question',
    '📱': 'mail', '📞': 'mail', '☀': 'sun', '💪': 'bolt', '⚙': 'dots', '🛍': 'gift', '🎨': 'write', '🔮': 'sparkle'
  };
  var keys = Object.keys(MAP).sort(function (a, b) { return b.length - a.length; });
  var RE = new RegExp('(' + keys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')️?', 'g');
  var TEST = new RegExp(RE.source);
  // never touch: code, form fields, icons themselves, and avatar spots (students pick an animal emoji)
  var SKIP = 'script,style,textarea,input,select,option,svg,title,.lm-inl,[data-noicon],.sd-avatar-btn,#mpAvatar,.sd-avatar-opt,#photoPreview,.av,#teacherTagAvatar,.who,.td-avatar,[contenteditable]';

  function swap(node) {
    var t = node.nodeValue;
    if (!t || !TEST.test(t)) return;
    var el = node.parentElement;
    if (!el || el.closest(SKIP)) return;
    var frag = document.createDocumentFragment(), last = 0, m;
    RE.lastIndex = 0;
    while ((m = RE.exec(t))) {
      if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
      var s = document.createElement('span');
      s.className = 'lm-inl'; s.setAttribute('aria-hidden', 'true');
      s.innerHTML = LumioIcons.svg(MAP[m[1]]);
      frag.appendChild(s);
      last = m.index + m[0].length;
    }
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  function scan(root) {
    if (!root) return;
    if (root.nodeType === 3) return swap(root);
    if (root.nodeType !== 1 || root.closest && root.closest(SKIP)) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), list = [], n;
    while ((n = w.nextNode())) if (TEST.test(n.nodeValue)) list.push(n);
    list.forEach(swap);
  }
  // also tidy emoji in tooltips and button labels read aloud
  function attrs(root) {
    if (!root.querySelectorAll) return;
    Array.prototype.forEach.call(root.querySelectorAll('[title],[aria-label],[placeholder]'), function (e) {
      ['title', 'aria-label', 'placeholder'].forEach(function (a) {
        var v = e.getAttribute(a); if (v && TEST.test(v)) e.setAttribute(a, v.replace(RE, '').replace(/^\s+/, ''));
      });
    });
  }
  var queued = [], pending = false;
  function flush() { pending = false; var q = queued; queued = []; q.forEach(function (n) { if (n.isConnected) { scan(n); if (n.nodeType === 1) attrs(n); } }); }
  function start() {
    var css = document.createElement('style');
    css.textContent = '.lm-inl{display:inline-block;width:1.25em;height:1.25em;vertical-align:-.28em;line-height:0;flex-shrink:0}.lm-inl .lm-ico{width:100%;height:100%}' +
      '.lm-inl{margin-inline-end:.12em}' +
      'button .lm-inl,a .lm-inl,.btn .lm-inl{background:#fff;border-radius:50%;padding:.08em;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,.15)}';
    document.head.appendChild(css);
    scan(document.body); attrs(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'characterData') queued.push(m.target);
        else Array.prototype.forEach.call(m.addedNodes, function (n) { queued.push(n); });
      });
      if (!pending && queued.length) { pending = true; (window.requestAnimationFrame || setTimeout)(flush); }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
