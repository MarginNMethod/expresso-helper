/* Bambino — app shell: router with per-tab stacks, iOS-like transitions, renderers, tools.
   Vanilla JS, no build step. Content comes from window.CONTENT (content.js). */
(function () {
  'use strict';

  var TABS = ['comecar', 'bebidas', 'preparar', 'entender'];
  var TAB_ICON = { comecar: 'flag', bebidas: 'cup', preparar: 'timer', entender: 'book' };
  var TAB_DEFAULT = { comecar: 'Começar', bebidas: 'Bebidas', preparar: 'Preparar', entender: 'Entender' };
  var EASE = 'cubic-bezier(.32,.72,0,1)';
  var DUR = 350;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isStandalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    /[?&]swipe=1/.test(location.search);
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var uid = 0;

  /* ------------------------------------------------------------------ utils */
  function C() { return window.CONTENT || {}; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Allow-list: <strong>, <em>, <b>, <i>, <br>. Everything else is escaped.
  function rich(s) {
    return typo(esc(s).replace(/&lt;(\/?)(strong|em|b|i)&gt;/g, '<$1$2>').replace(/&lt;br\s*\/?&gt;/g, '<br>'));
  }
  /* Typographic pass (content stays clean): keep a number with its unit ("220 V", "25 s"),
     keep ranges together ("150–180 ml", "1:1 a 1:1,5") and never start a line with "→". */
  var UNIT_RE = new RegExp('(\\d)[ \u00a0](?=(?:kVA|VA|kW|V|W|A|Hz|kg|mg\\/L|mg|g|ml|mL|L|ppm|°C|ºC|°|min|s|h|mm|cm|m|%|bar|dias?|semanas?|meses|horas?)(?![0-9A-Za-zÀ-ÿ]))', 'g');
  var RANGE_RE = /\d[\d.,:]*(?:–| a )\d[\d.,:]*(?: (?:[^\s<]+))?/g;
  function typo(h) {
    return String(h)
      .replace(UNIT_RE, '$1 ')
      .replace(/(\d) a (?=\d)/g, '$1 a ')
      .replace(/ → (?=\d)/g, ' → ')
      .replace(RANGE_RE, function (m) { return m.length > 18 ? m : '<span class="nowrap">' + m + '</span>'; });
  }
  function slug(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function fmt(n, d) {
    return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  }
  function firstSentence(t) { var m = String(t || '').match(/^.*?[.!?](?=\s|$)/); return m ? m[0] : String(t || ''); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ic(name, opts) { return window.icon ? window.icon(name, opts) : ''; }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function frag(nodes) {
    var f = document.createDocumentFragment();
    nodes.forEach(function (n) { if (n) f.appendChild(n); });
    return f;
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  function animate(node, kf, opts) {
    if (!node.animate) {
      var last = kf[kf.length - 1];
      for (var p in last) node.style[p] = last[p];
      return Promise.resolve();
    }
    var a = node.animate(kf, Object.assign({ duration: DUR, easing: EASE, fill: 'forwards' }, opts || {}));
    return a.finished.then(function () {
      var last = kf[kf.length - 1];
      for (var p in last) if (p !== 'offset') node.style[p] = last[p];
      try { a.cancel(); } catch (e) { /* noop */ }
    }, function () {});
  }

  /* ------------------------------------------------------------- content lookups */
  function tabTitle(t) { var m = C().meta || {}; return (m.tabs && m.tabs[t]) || TAB_DEFAULT[t]; }
  function comecarArticles() {
    var c = C().comecar || {};
    var out = arr(c.alerts).slice();
    arr(c.sections).forEach(function (s) { out = out.concat(arr(s.items)); });
    return out;
  }
  function entenderArticles() {
    var out = [];
    arr((C().entender || {}).sections).forEach(function (s) { out = out.concat(arr(s.items)); });
    return out;
  }
  function allDrinks() {
    var out = [];
    arr((C().bebidas || {}).groups).forEach(function (g) { out = out.concat(arr(g.items)); });
    return out;
  }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i]; return null; }
  function findArticleAnywhere(id) {
    var p = C().preparar || {};
    return byId(entenderArticles(), id) || byId(comecarArticles(), id) || (p.leite && p.leite.id === id ? p.leite : null);
  }
  /* Resolve a content link (e.g. "entender/agua", "bebidas/latte", "preparar/ratio") to {title, icon}. */
  function describeLink(target) {
    var parts = String(target).split('#')[0].split('/').filter(Boolean);
    var t = parts[0], id = parts[parts.length - 1];
    if (TABS.indexOf(t) < 0) { t = null; id = parts[0]; }
    if (parts.length === 1 && t) return { title: tabTitle(t), icon: TAB_ICON[t] };
    var p = C().preparar || {};
    if (t === 'bebidas' || (!t && byId(allDrinks(), id))) { var d = byId(allDrinks(), id); if (d) return { title: d.name, drink: d }; }
    if (t === 'preparar' || !t) {
      if (id === 'ratio') return { title: 'Calculadora de proporção', icon: 'scale' };
      if (id === 'timer') return { title: 'Cronômetro do shot', icon: 'timer' };
      if (id === 'diagnostico') return { title: 'Diagnóstico do espresso', icon: 'wrench' };
      if (id === 'leite' && p.leite) return { title: p.leite.title, icon: p.leite.icon || 'milk' };
      var dg = byId(arr(p.diagnostico), id); if (dg) return { title: dg.sintoma, icon: 'wrench' };
    }
    if (id === 'manual') { var m = (C().comecar || {}).manual || {}; return { title: m.title || 'Manual', icon: 'quiz' }; }
    var a = findArticleAnywhere(id);
    if (a) return { title: a.title, icon: a.icon, sub: a.subtitle };
    return null;
  }

  /* ================================================================ ROUTER */
  var app, tabbar;
  var stacks = {};      // tab -> [page]
  var lastHash = {};    // tab -> hash
  var active = null;
  var histMirror = [];
  var busy = false;
  var flags = { skipAnim: false, internalBack: false };

  function parseHash() {
    var raw = decodeURIComponent((location.hash || '').replace(/^#\/?/, ''));
    var i = raw.indexOf('#');
    var path = i >= 0 ? raw.slice(0, i) : raw;
    var anchor = i >= 0 ? raw.slice(i + 1) : '';
    var segs = path.split('/').filter(Boolean);
    if (TABS.indexOf(segs[0]) < 0) {
      segs = ['comecar']; anchor = '';
      // Unknown route: show Começar and make the URL match what is on screen.
      if (location.hash !== '#/comecar') history.replaceState(null, '', '#/comecar');
    }
    return { tab: segs[0], segs: segs, anchor: anchor };
  }
  function keyOf(segs) { return segs.join('/'); }
  function hashOf(key, anchor) { return '#/' + key + (anchor ? '#' + anchor : ''); }

  function childPath(fromKey, target) {
    var t = String(target);
    var hashI = t.indexOf('#');
    var anchor = hashI >= 0 ? t.slice(hashI + 1) : '';
    var parts = (hashI >= 0 ? t.slice(0, hashI) : t).split('/').filter(Boolean);
    var from = fromKey.split('/');
    var tab = from[0];
    var segs;
    if (TABS.indexOf(parts[0]) >= 0) {
      var tt = parts[0];
      var rest = parts.slice(1);
      if (!rest.length) return { tabRoot: tt };
      segs = rest.map(function (r) { return tt === tab ? r : tt + '.' + r; });
    } else {
      segs = parts;
    }
    var last = from[from.length - 1];
    var next;
    if (segs.length === 1 && (last === segs[0] || last.split('.').pop() === segs[0].split('.').pop()) && from.length > 1) next = from; // same page: just scroll
    else next = from.concat(segs);
    if (next.length > 9) next = [tab].concat(segs);
    return { key: next.join('/'), anchor: anchor };
  }

  function go(fromKey, target) {
    if (busy) return;
    var r = childPath(fromKey, target);
    if (r.tabRoot) { selectTab(r.tabRoot, true); return; }
    var h = hashOf(r.key, r.anchor);
    if (h === location.hash) { var top = topPage(); if (top && r.anchor && top.def.anchor) top.def.anchor(r.anchor); return; }
    histMirror.push(h);
    location.hash = h;
  }
  /* Navigate to a page by its canonical URL (e.g. #/entender/regioes-brasil) instead of stacking it. */
  function goCanonical(target) {
    if (busy) return;
    var h = '#/' + String(target).replace(/^#?\/?/, '');
    if (h === location.hash) return;
    histMirror.push(h);
    location.hash = h;
  }
  function back() {
    var st = stacks[active];
    if (busy || !st || st.length < 2) return;
    var parentHash = hashOf(st[st.length - 2].key);
    flags.internalBack = true;
    if (histMirror.length >= 2 && histMirror[histMirror.length - 2].split('#').slice(0, 2).join('#') === parentHash) {
      history.back();
    } else {
      histMirror[histMirror.length - 1] = parentHash;
      location.replace(parentHash);
    }
  }
  function selectTab(tab, toRoot) {
    var target = toRoot ? hashOf(tab) : (lastHash[tab] || hashOf(tab));
    if (target === location.hash) return;
    histMirror[histMirror.length - 1] = target;
    location.replace(target);
  }
  function topPage() { var s = stacks[active]; return s && s[s.length - 1]; }

  function onRoute() {
    var r = parseHash();
    var h = location.hash || '#/comecar';
    if (histMirror[histMirror.length - 1] !== h) {
      if (histMirror[histMirror.length - 2] === h) histMirror.pop(); else histMirror.push(h);
    }
    var tab = r.tab;
    var tabChanged = tab !== active;
    if (tabChanged) showTab(tab);
    var st = stacks[tab];
    var target = r.segs.map(function (_, i) { return keyOf(r.segs.slice(0, i + 1)); });
    var cur = st.map(function (p) { return p.key; });
    var i = 0;
    while (i < cur.length && i < target.length && cur[i] === target[i]) i++;
    var canAnim = booted && !tabChanged && !mqReduce.matches && !flags.skipAnim;
    // A pop the browser already animated (Safari swipe in a tab) must not replay.
    if (target.length < cur.length && !flags.internalBack && !isStandalone && isTouch) canAnim = false;
    flags.skipAnim = false; flags.internalBack = false;

    if (i === cur.length && target.length === cur.length + 1) {
      pushPage(tab, target[target.length - 1], r.segs, canAnim);
    } else if (i === target.length && cur.length > target.length) {
      popTo(tab, target.length, canAnim);
    } else if (canAnim && i >= 1 && i === cur.length - 1 && target.length === cur.length) {
      // Sibling at the same depth (canonical link such as the Brasil chip): slide it over the current page.
      var old = st.pop();
      if (old.def.onHide) old.def.onHide();
      pushPage(tab, target[target.length - 1], r.segs, true, old);
    } else if (!(i === cur.length && i === target.length)) {
      popTo(tab, Math.max(i, 1), false);
      if (!st.length) pushPage(tab, target[0], r.segs.slice(0, 1), false);
      for (var k = st.length; k < target.length; k++) pushPage(tab, target[k], r.segs.slice(0, k + 1), canAnim && k === target.length - 1);
    }
    lastHash[tab] = hashOf(target[target.length - 1]);
    updateTabbar();
    var top = st[st.length - 1];
    document.title = top && top.def.title && st.length > 1 ? top.def.title + ' · ' + appName() : appName();
    if (r.anchor && top && top.def.anchor) setTimeout(function () { top.def.anchor(r.anchor); }, canAnim ? DUR + 30 : 60);
  }
  function appName() { return (C().meta && C().meta.appName) || 'Bambino'; }

  function showTab(tab) {
    if (active && stacks[active]) stackEl(active).classList.add('off');
    active = tab;
    var se = stackEl(tab);
    se.classList.remove('off');
    se.removeAttribute('inert');
    TABS.forEach(function (t) { if (t !== tab) stackEl(t).setAttribute('inert', ''); });
    if (!stacks[tab].length) pushPage(tab, tab, [tab], false);
  }
  function stackEl(tab) { return app.querySelector('.stack[data-tab="' + tab + '"]'); }

  function updateTabbar() {
    tabbar.querySelectorAll('.tab').forEach(function (b) {
      var on = b.dataset.tab === active;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.innerHTML = ic(TAB_ICON[b.dataset.tab], { filled: on, size: 26 }) + '<span>' + esc(tabTitle(b.dataset.tab)) + '</span>';
    });
  }

  /* --------------------------------------------------------------- pages */
  function resolveSeg(tab, seg) {
    if (seg.indexOf('.') > 0) {
      var p = seg.split('.');
      if (TABS.indexOf(p[0]) >= 0) return resolveIn(p[0], p.slice(1).join('.'));
    }
    return resolveIn(tab, seg);
  }
  function resolveIn(t, id) {
    var c = C();
    if (id === t) return ROOTS[t]();
    if (t === 'comecar') {
      if (id === 'manual') return manualPage();
      var a = byId(comecarArticles(), id); if (a) return articlePage(a);
    }
    if (t === 'bebidas') { var d = byId(allDrinks(), id); if (d) return drinkPage(d); }
    if (t === 'preparar') {
      var p = c.preparar || {};
      if (id === 'ratio') return ratioPage();
      if (id === 'timer') return timerPage();
      if (id === 'leite' && p.leite) return articlePage(p.leite);
      if (id === 'diagnostico') return diagListPage();
      var dg = byId(arr(p.diagnostico), id); if (dg) return diagPage(dg);
    }
    if (t === 'entender') { var e = byId(entenderArticles(), id); if (e) return articlePage(e); }
    // Fallbacks: allow any article / drink id from any tab.
    var any = findArticleAnywhere(id); if (any) return articlePage(any);
    var dd = byId(allDrinks(), id); if (dd) return drinkPage(dd);
    if (id === 'manual') return manualPage();
    return notFoundPage();
  }

  function pushPage(tab, key, segs, anim, over) {
    var st = stacks[tab];
    var def = segs.length === 1 ? ROOTS[tab]() : resolveSeg(tab, segs[segs.length - 1]);
    var prev = st[st.length - 1];
    var page = buildPage(tab, key, def, prev);
    st.push(page);
    stackEl(tab).appendChild(page.el);
    page.measure();
    if (def.onShow) def.onShow();
    if (over) {
      // Replace `over` (already removed from the stack) with a push animation; prev stays hidden beneath.
      busy = true; document.body.classList.add('animating');
      over.el.classList.remove('off');
      transition(page.el, over.el, 'push', 0).then(function () {
        if (over.def.destroy) over.def.destroy();
        over.el.remove();
        busy = false; document.body.classList.remove('animating');
      });
    } else if (prev) {
      if (anim) {
        busy = true; document.body.classList.add('animating');
        transition(page.el, prev.el, 'push', 0).then(function () {
          prev.el.classList.add('off'); prev.el.setAttribute('inert', '');
          busy = false; document.body.classList.remove('animating');
        });
      } else {
        prev.el.classList.add('off'); prev.el.setAttribute('inert', '');
      }
      if (prev.def.onHide) prev.def.onHide();
    }
    return page;
  }
  function popTo(tab, len, anim) {
    var st = stacks[tab];
    if (st.length <= len) return;
    var top = st[st.length - 1];
    var under = st[len - 1];
    var removed = st.splice(len);
    removed.forEach(function (p) { if (p.def.onHide) p.def.onHide(); if (p.def.destroy) p.def.destroy(); });
    under.el.classList.remove('off'); under.el.removeAttribute('inert');
    if (under.def.onShow) under.def.onShow();
    function cleanup() { removed.forEach(function (p) { p.el.remove(); }); }
    if (anim) {
      busy = true; document.body.classList.add('animating');
      removed.slice(0, -1).forEach(function (p) { p.el.classList.add('off'); });
      transition(top.el, under.el, 'pop', 0).then(function () {
        cleanup(); busy = false; document.body.classList.remove('animating');
      });
    } else {
      cleanup();
      under.el.style.transform = '';
    }
  }

  /* Push/pop with parallax. progress: 0..1 already travelled (for gesture completion). */
  function transition(topEl, underEl, dir, progress, cancel) {
    var W = app.clientWidth;
    var dimU = underEl.querySelector(':scope > .page-dim');
    var p = progress || 0;
    topEl.classList.add('moving');
    var dur = DUR;
    if (p) dur = Math.max(160, DUR * (cancel ? p : 1 - p));
    var a, b, c;
    if (dir === 'push') {
      a = animate(topEl, [{ transform: 'translateX(' + W + 'px)' }, { transform: 'translateX(0px)' }], { duration: dur });
      b = animate(underEl, [{ transform: 'translateX(0px)' }, { transform: 'translateX(' + (-0.3 * W) + 'px)' }], { duration: dur });
      c = animate(dimU, [{ opacity: 0 }, { opacity: 1 }], { duration: dur });
    } else if (cancel) {
      a = animate(topEl, [{ transform: 'translateX(' + (p * W) + 'px)' }, { transform: 'translateX(0px)' }], { duration: dur });
      b = animate(underEl, [{ transform: 'translateX(' + (-0.3 * W * (1 - p)) + 'px)' }, { transform: 'translateX(' + (-0.3 * W) + 'px)' }], { duration: dur });
      c = animate(dimU, [{ opacity: 1 - p }, { opacity: 1 }], { duration: dur });
    } else {
      a = animate(topEl, [{ transform: 'translateX(' + (p * W) + 'px)' }, { transform: 'translateX(' + W + 'px)' }], { duration: dur });
      b = animate(underEl, [{ transform: 'translateX(' + (-0.3 * W * (1 - p)) + 'px)' }, { transform: 'translateX(0px)' }], { duration: dur });
      c = animate(dimU, [{ opacity: 1 - p }, { opacity: 0 }], { duration: dur });
    }
    return Promise.all([a, b, c]).then(function () {
      topEl.classList.remove('moving');
      underEl.style.transform = '';
      dimU.style.opacity = '';
      if (dir === 'push' || cancel) topEl.style.transform = '';
    });
  }

  function buildPage(tab, key, def, prev) {
    var pg = el('section', 'page');
    pg.dataset.key = key;
    pg.setAttribute('aria-label', def.title || '');
    var nav = el('header', 'nav');
    // Back label: the full previous title when it fits, otherwise "Voltar". Never an ellipsis (see fitNav).
    var fullBack = prev ? String(prev.def.shortTitle || prev.def.title || 'Voltar').replace(/<[^>]+>/g, '') : '';
    nav.innerHTML = '<div class="nav-bg"></div><div class="nav-bar"><div class="nav-left">' +
      (prev ? '<a class="nav-back" href="' + hashOf(prev.key) + '" data-back aria-label="Voltar para ' + esc(prev.def.title || '') + '">' +
        ic('chevron-left', { stroke: 2.6 }) + '<span>' + esc(fullBack) + '</span></a>' : '') +
      '</div><div class="nav-title" aria-hidden="true"><span>' + esc((def.title || '').length > 24 && def.shortTitle ? def.shortTitle : (def.title || '')) + '</span></div><div class="nav-right"></div></div>';
    if (def.large === false) nav.classList.add('inline');
    var scroller = el('div', 'scroller');
    var content = el('div', 'content');
    scroller.appendChild(content);
    var ctx = { tab: tab, key: key, page: pg, scroller: scroller, content: content };
    def.ctx = ctx;
    var band = def.band;
    if (band) { nav.classList.add('on-band', 'tone-' + band.tone); pg.classList.add('bag'); }
    if (band) content.appendChild(bandHead(def));
    else if (def.large !== false) {
      var head = el('div', 'page-head');
      head.appendChild(el('h1', 'large-title', rich(def.title || '')));
      if (def.subtitle) head.appendChild(el('p', 'page-sub', rich(def.subtitle)));
      content.appendChild(head);
    }
    var body = def.build(ctx);
    if (body) content.appendChild(body);
    pg.appendChild(scroller);
    pg.appendChild(nav);
    pg.appendChild(el('div', 'page-dim'));

    var lt = content.querySelector('.large-title');
    var threshold = 0;
    var barEl = nav.querySelector('.nav-bar'), rightEl = nav.querySelector('.nav-right');
    var titleEl = nav.querySelector('.nav-title'), titleTxt = titleEl.querySelector('span');
    var backEl = nav.querySelector('.nav-back'), backSpan = backEl && backEl.querySelector('span');
    var backW = null; // measured widths {full, voltar}; reset when text size changes
    /* iOS rule: while the large title shows (inline title hidden), the back button may use the whole bar.
       Once collapsed, it gets the space beside the centred title; if the previous title does not fit, "Voltar". */
    function fitNav() {
      if (!barEl.clientWidth) return;
      var cs = getComputedStyle(barEl);
      var padL = parseFloat(cs.paddingLeft) || 0, padR = parseFloat(cs.paddingRight) || 0;
      var barW = barEl.clientWidth - padL - padR;
      var rightW = rightEl.offsetWidth;
      var used = 0;
      if (backEl) {
        if (!backW) {
          backSpan.textContent = fullBack; var wf = backEl.offsetWidth;
          backSpan.textContent = 'Voltar'; var wv = backEl.offsetWidth;
          backW = { full: wf, voltar: wv };
        }
        var collapsed = nav.classList.contains('solid') || nav.classList.contains('inline');
        var avail = collapsed ? (barW - titleTxt.scrollWidth) / 2 - 8 : barW - rightW - 8;
        var label = backW.full <= avail ? fullBack : 'Voltar';
        if (backSpan.textContent !== label) backSpan.textContent = label;
        used = label === fullBack ? backW.full : backW.voltar;
      }
      var side = Math.max(used, rightW) + 6;
      titleEl.style.left = (padL + side) + 'px';
      titleEl.style.right = (padR + side) + 'px';
    }
    function measure() { threshold = lt ? lt.offsetTop + lt.offsetHeight - 6 : 0; backW = null; fitNav(); onScroll(); }
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var solid = lt ? scroller.scrollTop > threshold : scroller.scrollTop > 0;
        if (def.large === false) solid = scroller.scrollTop > 2;
        if (nav.classList.contains('solid') !== solid) { nav.classList.toggle('solid', solid); fitNav(); }
      });
    }
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return { key: key, el: pg, def: def, scroller: scroller, measure: measure, nav: nav };
  }

  /* A flat colour block that opens a screen, like the front of a coffee bag: title, one drawing or number, one line. */
  function bandHead(def) {
    var b = def.band;
    var h = el('div', 'band tone-' + b.tone);
    h.innerHTML = '<h1 class="large-title band-title">' + rich(def.title || '') + '</h1>' +
      (b.art ? '<div class="band-art">' + b.art + '</div>' : '') +
      (b.num ? '<p class="band-num"><span>' + rich(b.num) + '</span>' + (b.unit ? '<small>' + rich(b.unit) + '</small>' : '') + '</p>' : '') +
      (b.line ? '<p class="band-line">' + rich(b.line) + '</p>' : '');
    return h;
  }

  /* ---------------------------------------------------- global interaction */
  var PRESS_SEL = '.pressable, .btn, .tile, .feature, .chip, .nav-back, .tab, .round-btn, .stepper button, .gl-letter-btn, .link-accent, .step-btn, .preset-card, .pill, .rb, .search-clear, .steps-reset';
  function setupPress() {
    var cur = null, sx = 0, sy = 0, timer = 0;
    function clear() { clearTimeout(timer); if (cur) cur.classList.remove('pressed'); cur = null; }
    document.addEventListener('pointerdown', function (e) {
      var t = e.target.closest(PRESS_SEL);
      if (!t || t.disabled) return;
      clear(); cur = t; sx = e.clientX; sy = e.clientY;
      var inScroll = t.closest('.scroller');
      timer = setTimeout(function () { if (cur) cur.classList.add('pressed'); }, inScroll && e.pointerType === 'touch' ? 70 : 0);
    }, true);
    document.addEventListener('pointermove', function (e) {
      if (cur && (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10)) clear();
    }, true);
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      document.addEventListener(ev, function () {
        var c = cur; clearTimeout(timer);
        if (c) { c.classList.add('pressed'); setTimeout(function () { c.classList.remove('pressed'); }, 90); }
        cur = null;
      }, true);
    });
    document.addEventListener('scroll', clear, true);
  }

  function setupClicks() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-back]');
      if (b) { e.preventDefault(); back(); return; }
      var g = e.target.closest('[data-go]');
      if (g) {
        e.preventDefault();
        var pg = g.closest('.page');
        if (pg) go(pg.dataset.key, g.dataset.go);
        else if (g.closest('.sheet')) { closeAllSheets(); var tp = topPage(); go(tp.key, g.dataset.go); }
        return;
      }
      var a = e.target.closest('a[href^="#"]');
      if (a && !a.dataset.raw) { e.preventDefault(); }
    });
  }

  /* Interactive edge-swipe back (standalone only; Safari has its own). */
  function setupSwipe() {
    if (!isStandalone) return;
    var g = null;
    app.addEventListener('touchstart', function (e) {
      if (busy || e.touches.length !== 1) return;
      var t = e.touches[0];
      var st = stacks[active];
      if (!st || st.length < 2 || t.clientX > 24) return;
      g = { x0: t.clientX, y0: t.clientY, t0: performance.now(), dx: 0, dir: 0, top: st[st.length - 1], under: st[st.length - 2], lastX: t.clientX, lastT: performance.now(), v: 0 };
    }, { passive: true });
    app.addEventListener('touchmove', function (e) {
      if (!g) return;
      var t = e.touches[0];
      var dx = t.clientX - g.x0, dy = t.clientY - g.y0;
      if (!g.dir) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          g.dir = 1;
          g.under.el.classList.remove('off');
          g.top.el.classList.add('moving');
          busy = true;
        } else if (Math.abs(dy) > 8) { g = null; return; }
        else return;
      }
      e.preventDefault();
      var W = app.clientWidth;
      g.dx = clamp(dx, 0, W);
      var now = performance.now();
      g.v = (t.clientX - g.lastX) / Math.max(1, now - g.lastT);
      g.lastX = t.clientX; g.lastT = now;
      var p = g.dx / W;
      g.top.el.style.transform = 'translateX(' + g.dx + 'px)';
      g.under.el.style.transform = 'translateX(' + (-0.3 * W * (1 - p)) + 'px)';
      g.under.el.querySelector(':scope > .page-dim').style.opacity = String(1 - p);
    }, { passive: false });
    function end() {
      if (!g) return;
      var s = g; g = null;
      if (!s.dir) return;
      var W = app.clientWidth, p = s.dx / W;
      var complete = p > 0.4 || (s.v > 0.35 && s.dx > 30);
      if (complete) {
        transition(s.top.el, s.under.el, 'pop', p).then(function () {
          s.top.el.style.visibility = 'hidden';
          busy = false; flags.skipAnim = true; back();
        });
      } else {
        transition(s.top.el, s.under.el, 'pop', p, true).then(function () {
          s.under.el.classList.add('off'); busy = false;
        });
      }
    }
    app.addEventListener('touchend', end);
    app.addEventListener('touchcancel', end);
  }

  /* ================================================================ SHEETS */
  var openSheets = [];
  function openSheet(build, opts) {
    opts = opts || {};
    var bd = el('div', 'sheet-backdrop');
    var sh = el('div', 'sheet');
    sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
    if (opts.label) sh.setAttribute('aria-label', opts.label);
    var grab = el('div', 'sheet-grab'); grab.setAttribute('aria-hidden', 'true');
    var body = el('div', 'sheet-body');
    sh.appendChild(grab); sh.appendChild(body);
    var closed = false;
    var reduce = mqReduce.matches;
    function close(reason) {
      if (closed) return; closed = true;
      openSheets = openSheets.filter(function (x) { return x !== api; });
      document.removeEventListener('keydown', onKey);
      var cur = getComputedStyle(sh).transform;
      Promise.all([
        animate(bd, [{ opacity: getComputedStyle(bd).opacity }, { opacity: 0 }], { duration: reduce ? 1 : 250, easing: 'linear' }),
        animate(sh, [{ transform: cur === 'none' ? 'translateY(0)' : cur }, { transform: 'translateY(100%)' }], { duration: reduce ? 1 : 300 })
      ]).then(function () { bd.remove(); sh.remove(); app.removeAttribute('inert'); if (opts.onClose) opts.onClose(reason); });
    }
    var api = { close: close, body: body };
    build(body, close);
    document.body.appendChild(bd); document.body.appendChild(sh);
    app.setAttribute('inert', '');
    animate(bd, [{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? 1 : 300, easing: 'linear' });
    animate(sh, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: reduce ? 1 : 420 });
    bd.addEventListener('click', function () { close('backdrop'); });
    function onKey(e) { if (e.key === 'Escape') close('escape'); }
    document.addEventListener('keydown', onKey);
    // Focus the dialog itself (not a button) so VoiceOver lands inside it without drawing a focus ring on touch.
    sh.tabIndex = -1;
    setTimeout(function () { sh.focus({ preventScroll: true }); }, 50);
    // drag to dismiss
    var d = null;
    sh.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('.sheet-grab') && body.scrollTop > 0) return;
      if (e.target.closest('button, a')) return;
      d = { y0: e.clientY, t0: performance.now(), dy: 0 };
      sh.setPointerCapture && sh.setPointerCapture(e.pointerId);
    });
    sh.addEventListener('pointermove', function (e) {
      if (!d) return;
      d.dy = Math.max(0, e.clientY - d.y0);
      sh.style.transform = 'translateY(' + d.dy + 'px)';
    });
    function up() {
      if (!d) return;
      var v = d.dy / Math.max(1, performance.now() - d.t0);
      var s = d; d = null;
      if (s.dy > 110 || (v > 0.6 && s.dy > 24)) close('drag');
      else if (s.dy > 0) animate(sh, [{ transform: 'translateY(' + s.dy + 'px)' }, { transform: 'translateY(0)' }], { duration: 300 });
    }
    sh.addEventListener('pointerup', up); sh.addEventListener('pointercancel', up);
    openSheets.push(api);
    return api;
  }
  function closeAllSheets() { openSheets.slice().forEach(function (s) { s.close('nav'); }); }

  /* ============================================================ COMPONENTS */
  var SQ_TINT = { flame: 'terracotta', bean: 'brown', drop: 'slate', thermometer: 'gold', leaf: 'olive', sprout: 'olive',
    globe: 'slate', map: 'slate', clock: 'brown', scale: 'brown', cup: 'brown', milk: 'slate', nose: 'green', book: 'brown',
    quiz: 'gold', warning: 'gold', wrench: 'slate', bolt: 'gold', list: 'slate', timer: 'green', steam: 'slate', compass: 'terracotta' };

  function rowLink(o) {
    // o: {go, title, sub, lead (html), value, cls, strong}
    var r = el(o.go ? 'a' : 'div', 'row' + (o.go ? ' pressable' : '') + (o.cls ? ' ' + o.cls : ''));
    if (o.go) { r.setAttribute('href', '#'); r.dataset.go = o.go; }
    r.innerHTML = (o.lead || '') +
      '<div class="row-main"><div class="row-title' + (o.strong ? ' strong' : '') + '">' + rich(o.title) + '</div>' +
      (o.sub ? '<div class="row-sub' + (o.subBody ? ' body' : '') + '">' + rich(o.sub) + '</div>' : '') +
      (o.meta ? '<div class="row-meta">' + o.meta + '</div>' : '') + '</div>' +
      (o.value ? '<div class="row-value">' + rich(o.value) + '</div>' : '') +
      (o.go ? ic('chevron-right', { cls: 'chev', stroke: 2.4 }) : '');
    return r;
  }
  function sq(name, tint) {
    if (!window.icon || !window.icon.has(name)) return '';
    return '<span class="sq t-' + (tint || SQ_TINT[name] || 'brown') + '">' + ic(name, { stroke: 2 }) + '</span>';
  }
  function group(rows, cls) {
    var g = el('div', 'group' + (cls ? ' ' + cls : ''));
    rows.forEach(function (r) { if (r) g.appendChild(r); });
    return g;
  }
  function secH(text, small) { return el('h2', 'sec-h' + (small ? ' small' : ''), rich(text)); }
  function norm(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function flatText(o) {
    var out = [];
    (function walk(v, k) {
      if (typeof v === 'string') { if (k !== 'type' && k !== 'tone' && k !== 'icon' && k !== 'id') out.push(v.replace(/<[^>]+>/g, '')); }
      else if (Array.isArray(v)) v.forEach(function (x) { walk(x, k); });
      else if (v && typeof v === 'object') Object.keys(v).forEach(function (kk) { walk(v[kk], kk); });
    })(o, '');
    return out.join(' ');
  }
  /* iOS-style search field (client-side filtering). onChange(value) on every input. */
  function searchField(label, onChange) {
    var w = el('div', 'searchbar');
    w.innerHTML = ic('search', { size: 18, cls: 'search-ic' }) +
      '<input type="search" class="search-in" placeholder="' + esc(label) + '" aria-label="' + esc(label) + '" enterkeyhint="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">' +
      '<button type="button" class="search-clear" aria-label="Limpar busca" hidden>' + ic('xmark', { size: 14, stroke: 2.6 }) + '</button>';
    var input = w.querySelector('input'), clear = w.querySelector('.search-clear');
    function fire() { clear.hidden = !input.value; onChange(input.value); }
    input.addEventListener('input', fire);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') input.blur(); });
    clear.addEventListener('click', function () { input.value = ''; fire(); input.focus({ preventScroll: true }); });
    w.clear = function () { input.value = ''; clear.hidden = true; onChange(''); };
    return w;
  }
  function emptyState(title, text, onClear) {
    var d = el('div', 'empty search-empty');
    d.setAttribute('role', 'status');
    d.innerHTML = ic('search') + '<div class="empty-title">' + esc(title) + '</div><p>' + esc(text) + '</p>';
    if (onClear) {
      var b = el('button', 'btn tinted', 'Limpar busca'); b.type = 'button'; b.style.marginTop = '16px'; b.style.maxWidth = '240px';
      b.addEventListener('click', onClear); d.appendChild(b);
    }
    return d;
  }

  function segmented(options, value, onChange, label) {
    var s = el('div', 'seg');
    s.setAttribute('role', 'radiogroup');
    if (label) s.setAttribute('aria-label', label);
    var thumb = el('div', 'seg-thumb');
    s.appendChild(thumb);
    var btns = options.map(function (o, i) {
      var b = el('button', '', esc(o.label));
      b.type = 'button'; b.setAttribute('role', 'radio');
      b.addEventListener('click', function () { set(o.value, true); });
      s.appendChild(b);
      return b;
    });
    function set(v, fire) {
      var idx = -1;
      options.forEach(function (o, i) { var on = o.value === v; if (on) idx = i; btns[i].setAttribute('aria-checked', on ? 'true' : 'false'); });
      thumb.style.opacity = idx < 0 ? '0' : '1';
      thumb.style.width = 'calc((100% - 4px) / ' + options.length + ')';
      thumb.style.transform = 'translateX(' + (Math.max(idx, 0) * 100) + '%)';
      if (fire && onChange) onChange(v);
    }
    set(value, false);
    s.set = set;
    return s;
  }
  function stepper(onMinus, onPlus, label) {
    var s = el('div', 'stepper');
    s.setAttribute('role', 'group'); s.setAttribute('aria-label', label || '');
    var m = el('button', '', ic('minus')); m.type = 'button'; m.setAttribute('aria-label', 'Diminuir');
    var p = el('button', '', ic('plus')); p.type = 'button'; p.setAttribute('aria-label', 'Aumentar');
    m.addEventListener('click', onMinus); p.addEventListener('click', onPlus);
    s.appendChild(m); s.appendChild(p);
    s.minus = m; s.plus = p;
    return s;
  }
  function slider(o) {
    // o: {min,max,step,value,onInput,label,format}
    var s = el('div', 'slider');
    s.tabIndex = 0;
    s.setAttribute('role', 'slider');
    s.setAttribute('aria-label', o.label || '');
    s.setAttribute('aria-valuemin', o.min); s.setAttribute('aria-valuemax', o.max);
    s.innerHTML = '<div class="slider-track"><div class="slider-fill"></div></div><div class="slider-thumb"></div>';
    var fill = s.querySelector('.slider-fill'), thumb = s.querySelector('.slider-thumb');
    var val = o.value;
    function pos(v) { return (v - o.min) / (o.max - o.min); }
    function render() {
      var p = pos(val);
      // keep the 28px thumb inside the track
      thumb.style.left = 'calc(14px + (100% - 28px) * ' + p + ')';
      fill.style.width = 'calc(14px + (100% - 28px) * ' + p + ')';
      s.setAttribute('aria-valuenow', val);
      s.setAttribute('aria-valuetext', o.format ? o.format(val) : String(val));
    }
    function setFromX(x) {
      var r = s.getBoundingClientRect();
      var p = clamp((x - r.left - 14) / (r.width - 28), 0, 1);
      var v = o.min + p * (o.max - o.min);
      v = Math.round(v / o.step) * o.step;
      v = +clamp(v, o.min, o.max).toFixed(3);
      if (v !== val) { val = v; render(); o.onInput(val); }
    }
    var dragging = false;
    s.addEventListener('pointerdown', function (e) { dragging = true; s.setPointerCapture(e.pointerId); setFromX(e.clientX); });
    s.addEventListener('pointermove', function (e) { if (dragging) setFromX(e.clientX); });
    s.addEventListener('pointerup', function () { dragging = false; });
    s.addEventListener('pointercancel', function () { dragging = false; });
    s.addEventListener('keydown', function (e) {
      var d = 0;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') d = o.step;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') d = -o.step;
      if (d) { e.preventDefault(); val = +clamp(val + d, o.min, o.max).toFixed(3); render(); o.onInput(val); }
    });
    s.set = function (v) { val = v; render(); };
    render();
    return s;
  }

  /* ---------------------------------------------------------------- Cup SVG */
  var LAYER = {
    espresso: { c: 'var(--espresso)', n: 'Espresso' },
    crema: { c: 'var(--crema)', n: 'Crema' },
    milk: { c: 'var(--milk)', n: 'Leite vaporizado' },
    foam: { c: 'var(--foam)', n: 'Espuma' },
    water: { c: 'var(--water)', n: 'Água' },
    americano: { c: 'var(--americano)', n: 'Café diluído' },
    ice: { c: 'var(--ice)', n: 'Gelo' },
    chocolate: { c: 'var(--chocolate)', n: 'Chocolate' },
    icecream: { c: 'var(--icecream)', n: 'Sorvete' }
  };
  function maxNum(s) {
    var m = String(s || '').match(/\d+(?:[.,]\d+)?/g);
    if (!m) return 0;
    return Math.max.apply(null, m.map(function (x) { return parseFloat(x.replace(',', '.')); }));
  }
  function cupShape(d) {
    var cup = String(d.cup || '').toLowerCase();
    var vol = maxNum(d.volume);
    var iced = arr(d.layers).some(function (l) { return l.kind === 'ice'; });
    if (/copo|taça|taca|vidro/.test(cup) || iced) {
      if (vol && vol <= 200) return { kind: 'glass-s', path: 'M58 52 L142 52 L133 156 C132.6 161 130 163 125 163 L75 163 C70 163 67.4 161 67 156 Z', top: 52, bottom: 163, glass: true };
      return { kind: 'glass', path: 'M50 14 L150 14 L138 158 C137.6 163 135 165 130 165 L70 165 C65 165 62.4 163 62 158 Z', top: 14, bottom: 165, glass: true };
    }
    if (vol && vol <= 100) return { kind: 'demi', path: 'M64 78 L136 78 C136 114 130 142 112 142 L88 142 C70 142 64 114 64 78 Z', top: 78, bottom: 142, handle: 'M134.5 90 C155 89 156 120 129 123', saucer: 'M46 151 Q100 162 154 151' };
    if (vol && vol > 260) return { kind: 'mug', path: 'M50 36 L150 36 L146 144 C145.8 150 142 154 136 154 L64 154 C58 154 54.2 150 54 144 Z', top: 36, bottom: 154, handle: 'M148.5 58 C182 58 182 118 146 118' };
    return { kind: 'cup', path: 'M40 58 L160 58 C160 106 146 144 112 144 L88 144 C54 144 40 106 40 58 Z', top: 58, bottom: 144, handle: 'M155 76 C184 74 184 116 145 118', saucer: 'M26 152 Q100 168 174 152' };
  }
  function cupSVG(d, mini) {
    var sh = cupShape(d);
    var id = 'cup' + (++uid);
    var fill = clamp(d.fill == null ? 85 : +d.fill, 0, 100);
    var top = sh.top, bottom = sh.bottom;
    var liquidTop = bottom - (bottom - top) * fill / 100;
    var allLayers = arr(d.layers);
    var floats = allLayers.filter(function (l) { return l.float; });
    var layers = allLayers.filter(function (l) { return !l.float; });
    var total = layers.reduce(function (s, l) { return s + (+l.pct || 0); }, 0) || 100;
    var y = bottom, rects = '', lines = '', ice = '';
    layers.forEach(function (l, i) {
      var hgt = (bottom - liquidTop) * (+l.pct || 0) / total;
      var y0 = y - hgt;
      var L = LAYER[l.kind] || LAYER.espresso;
      rects += '<rect x="0" y="' + y0.toFixed(1) + '" width="200" height="' + (hgt + 0.6).toFixed(1) + '" fill="' + L.c + '"/>';
      if (l.kind === 'ice' && !mini) {
        for (var k = 0, n = Math.max(1, Math.round(hgt / 28)); k < n * 3; k++) {
          var cx = 70 + (k % 3) * 24 + (Math.floor(k / 3) % 2) * 10, cy = y0 + 6 + Math.floor(k / 3) * 26;
          if (cy + 20 > y) continue;
          ice += '<rect x="' + cx + '" y="' + cy.toFixed(1) + '" width="22" height="20" rx="4" transform="rotate(' + ((k * 37) % 20 - 10) + ' ' + (cx + 11) + ' ' + (cy + 10).toFixed(1) + ')" fill="rgba(255,255,255,.55)" stroke="var(--water)" stroke-width="1.5"/>';
        }
      }
      if (i > 0 && !mini) lines += '<line x1="0" x2="200" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--layer-line)" stroke-width="1"/>';
      y = y0;
    });
    var sw = mini ? 9 : 3;
    var stroke = 'var(--cup-stroke)';
    var vb = mini ? '20 6 172 172' : '0 0 200 172';
    // Floating layers: a scoop of ice cream rising above the rim, ice cubes bobbing at the surface.
    var top2 = '';
    floats.forEach(function (l) {
      if (mini) return;
      if (l.kind === 'icecream') {
        var sy = liquidTop - 30;
        top2 += '<circle cx="100" cy="' + sy.toFixed(1) + '" r="27" fill="' + LAYER.icecream.c + '" stroke="var(--layer-line)" stroke-width="1"/>' +
          '<path d="M76 ' + (sy + 14).toFixed(1) + ' q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0" fill="none" stroke="var(--layer-line)" stroke-width="1"/>';
      } else if (l.kind === 'ice') {
        [[78, -16, -12], [104, -22, 8], [118, -4, 14], [88, 6, -6]].forEach(function (c) {
          top2 += '<rect x="' + c[0] + '" y="' + (liquidTop + c[1]).toFixed(1) + '" width="24" height="22" rx="4" transform="rotate(' + c[2] + ' ' + (c[0] + 12) + ' ' + (liquidTop + c[1] + 11).toFixed(1) + ')" fill="rgba(255,255,255,.6)" stroke="var(--water)" stroke-width="1.5"/>';
        });
      }
    });
    var label = mini ? '' : ' role="img" aria-label="' + esc('Corte da bebida ' + (d.name || '') + ', de cima para baixo: ' + allLayers.slice().reverse().map(function (l) { return (LAYER[l.kind] || {}).n; }).join(', ')) + '"';
    return '<svg viewBox="' + vb + '"' + label + (mini ? ' aria-hidden="true" class="mini-cup"' : '') + '>' +
      '<defs><clipPath id="' + id + '"><path d="' + sh.path + '"/></clipPath></defs>' +
      (sh.glass ? '<path d="' + sh.path + '" fill="var(--fill)"/>' : '') +
      '<g clip-path="url(#' + id + ')">' + rects + lines + ice + '<path d="' + sh.path + '" fill="none" stroke="var(--liquid-edge)" stroke-width="3"/></g>' + top2 +
      (sh.saucer && !mini ? '<path d="' + sh.saucer + '" fill="none" stroke="' + stroke + '" stroke-width="' + sw + '" stroke-linecap="round"/>' : '') +
      (sh.handle ? '<path d="' + sh.handle + '" fill="none" stroke="' + stroke + '" stroke-width="' + sw + '" stroke-linecap="round"/>' : '') +
      '<path d="' + sh.path + '" fill="none" stroke="' + stroke + '" stroke-width="' + sw + '" stroke-linejoin="round"' + (sh.glass ? ' stroke-opacity=".8"' : '') + '/>' +
      '</svg>';
  }
  function legendHTML(d) {
    var seen = {}, order = [];
    arr(d.layers).forEach(function (l) {
      if (!seen[l.kind]) { seen[l.kind] = 0; order.push(l.kind); }
      seen[l.kind] += +l.pct || 0;
    });
    return '<div class="legend">' + order.reverse().map(function (k) {
      var L = LAYER[k] || LAYER.espresso;
      return '<span><i style="background:' + L.c + '"></i>' + esc(L.n) + '</span>';
    }).join('') + '</div>';
  }
  function statsHTML(d) {
    var cup = String(d.cup || '');
    var items = [['Proporção', d.ratio], ['Espresso', d.espresso], ['Volume', d.volume], ['Recipiente', cup.charAt(0).toUpperCase() + cup.slice(1)]];
    return '<div class="stats"><div class="stats-grid">' + items.map(function (x) {
      return '<div class="stat"><div class="stat-k">' + x[0] + '</div><div class="stat-v">' + rich(x[1] || '—') + '</div></div>';
    }).join('') + '</div></div>';
  }

  /* ========================================================== BLOCK RENDERERS */
  function renderBlocks(blocks, ctx) {
    var out = document.createDocumentFragment();
    var prose = null;
    arr(blocks).forEach(function (b) {
      if (!b || !b.type) return;
      var fn = BLOCKS[b.type];
      if (!fn) return;
      var isProse = PROSE_TYPES.indexOf(b.type) >= 0;
      var node = fn(b, ctx);
      if (!node) return;
      if (isProse) {
        if (!prose) { prose = el('div', 'prose blk'); out.appendChild(prose); }
        prose.appendChild(node);
      } else {
        prose = null;
        out.appendChild(node);
      }
    });
    return out;
  }
  var PROSE_TYPES = ['p', 'h', 'list'];
  var BLOCKS = {
    p: function (b) { return el('p', b.lead ? 'p lead' : 'p', rich(b.text)); },
    art: function (b) { var draw = window.ART && window.ART[b.name]; return draw ? figure(draw(), b.caption, 'art') : null; },
    leader: function (b) {
      var d = el('dl', 'blk leader');
      d.innerHTML = arr(b.items).map(function (it) { return '<div class="ld"><dt>' + rich(it.label) + '</dt><span class="dots" aria-hidden="true"></span><dd>' + rich(it.value) + '</dd></div>'; }).join('');
      return d;
    },
    rule: function (b) { return el('p', 'blk rule', rich(b.text)); },
    more: function (b, ctx) {
      var d = el('details', 'blk more');
      d.appendChild(el('summary', '', '<span>' + rich(b.title) + '</span>' + ic('chevron-right', { cls: 'chev', stroke: 2.4 })));
      d.appendChild(renderBlocks(b.blocks, ctx));
      return d;
    },
    h: function (b) { var e = el('h2', 'h', rich(b.text)); if (b.id) { e.id = 'a-' + b.id; e.dataset.anchor = b.id; } return e; },
    list: function (b) {
      var l = el(b.ordered ? 'ol' : 'ul', 'list');
      arr(b.items).forEach(function (t) { l.appendChild(el('li', '', rich(typeof t === 'string' ? t : (t.text || '')))); });
      return l;
    },
    steps: function (b) {
      var l = el('ol', 'steps');
      arr(b.items).forEach(function (s, i) {
        if (typeof s === 'string') s = { text: s };
        var li = el('li', 'step');
        li.innerHTML = '<span class="step-n" aria-hidden="true">' + (i + 1) + '</span><div class="row-main">' +
          (s.title ? '<div class="step-title">' + rich(s.title) + '</div>' : '') +
          (s.text ? '<div class="step-text">' + rich(s.text) + '</div>' : '') + '</div>';
        l.appendChild(li);
      });
      return l;
    },
    table: function (b) {
      var w = el('div', 'blk tbl');
      var head = arr(b.head), rows = arr(b.rows);
      var cols = Math.max(head.length, rows.reduce(function (m, r) { return Math.max(m, arr(r).length); }, 0));
      if (cols <= 2) {
        if (rows.some(function (r) { return String(r[1] || '').length > 26; })) w.classList.add('kvgrid');
        if (head.length) w.appendChild(el('div', 'tbl-head', '<span>' + rich(head[0] || '') + '</span><span>' + rich(head[1] || '') + '</span>'));
        w.appendChild(group(rows.map(function (r) {
          var row = el('div', 'row');
          row.innerHTML = '<div class="row-main"><div class="row-title">' + rich(r[0]) + '</div></div><div class="row-value wrap">' + rich(r[1] == null ? '' : r[1]) + '</div>';
          return row;
        })));
      } else if (cols === 3 && head.concat.apply(head, rows).every(function (c) { return String(c == null ? '' : c).replace(/<[^>]+>/g, '').length <= 22; })) {
        // Short cells: a real 3-column grid (no column label repeated on every row).
        w.classList.add('tgrid');
        var tt = el('div', 'tg-table');
        tt.appendChild(el('div', 'tg-head', [0, 1, 2].map(function (i) { return '<span>' + rich(head[i] || '') + '</span>'; }).join('')));
        var g3 = el('div', 'group');
        rows.forEach(function (r) {
          // .tg-k (column label) is only shown when the card is too narrow for three columns (large text).
          g3.appendChild(el('div', 'tg-row', [0, 1, 2].map(function (i) { var cell = rich(r[i] == null ? '—' : r[i]); if (i === 0 && !/\s/.test(String(r[0])) && String(r[0]).length <= 16) cell = '<span class="nowrap">' + cell + '</span>'; return '<div>' + (i && head[i] ? '<span class="tg-k">' + rich(head[i]) + '</span>' : '') + cell + '</div>'; }).join('')));
        });
        tt.appendChild(g3);
        w.appendChild(tt);
      } else {
        w.classList.add('tbl3');
        if (head[0]) w.appendChild(el('div', 'tbl-head', '<span>' + rich(head[0]) + '</span>'));
        w.appendChild(group(rows.map(function (r) {
          var row = el('div', 'row');
          var kv = '';
          for (var i = 1; i < cols; i++) kv += '<div><div class="k">' + rich(head[i] || '') + '</div><div class="v">' + rich(r[i] == null ? '—' : r[i]) + '</div></div>';
          row.innerHTML = '<div class="row-title strong">' + rich(r[0]) + '</div><div class="tbl3-kv"' + (cols > 3 ? ' style="grid-template-columns:repeat(' + (cols - 1) + ',1fr)"' : '') + '>' + kv + '</div>';
          return row;
        })));
      }
      if (b.caption) w.appendChild(el('p', 'caption', rich(b.caption)));
      return w;
    },
    spec: function (b) {
      var w = el('div', 'blk spec');
      if (b.title) w.appendChild(el('h3', 'sec-h small', rich(b.title)));
      var items = arr(b.items).length ? b.items : arr(b.rows);
      if (items.some(function (it) { return String(it.value != null ? it.value : it.v).length > 22; })) w.classList.add('kvgrid');
      w.appendChild(group(items.map(function (it) {
        var r = el('div', 'row');
        r.innerHTML = '<div class="row-title">' + rich(it.label != null ? it.label : it.k) + '</div><div class="row-value">' + rich(it.value != null ? it.value : it.v) + '</div>';
        return r;
      })));
      if (b.caption || b.note) w.appendChild(el('p', 'caption', rich(b.caption || b.note)));
      return w;
    },
    callout: function (b) {
      var tone = ({ info: 'info', warning: 'warning', tip: 'tip' })[b.tone] || 'info';
      var icn = tone === 'warning' ? 'warning' : tone === 'tip' ? 'lightbulb' : 'info';
      var c = el('aside', 'callout ' + tone + (b.title ? '' : ' notitle'));
      var tile = '<span class="ctile" aria-hidden="true">' + ic(icn, { stroke: 2 }) + '</span>';
      c.innerHTML = b.title
        ? '<div class="callout-head">' + tile + '<span>' + rich(b.title) + '</span></div><p class="callout-text">' + rich(b.text) + '</p>'
        : tile + '<p class="callout-text">' + rich(b.text) + '</p>';
      return c;
    },
    compare: function (b) {
      var items = arr(b.items);
      var short = items.length === 2 && items.every(function (i) { return String(i.text || '').length < 90 && String(i.label || '').length < 18; });
      var w = el('div', 'compare' + (short ? ' two' : ''));
      items.forEach(function (i) {
        w.appendChild(el('div', 'cmp', '<div class="cmp-label">' + rich(i.label) + '</div><div class="cmp-text">' + rich(i.text) + '</div>'));
      });
      return w;
    },
    scale: function (b) {
      var v = clamp(+b.value || 0, 0, 100);
      var m = el('div', 'meter');
      m.setAttribute('role', 'img');
      m.setAttribute('aria-label', (b.label || '') + ': ' + v + ' de 100, entre ' + (b.left || '') + ' e ' + (b.right || ''));
      m.innerHTML = '<div class="meter-top"><div class="meter-label">' + rich(b.label) + '</div></div>' +
        '<div class="track"><div class="track-fill" style="width:' + v + '%"></div><div class="track-knob" style="left:' + v + '%"></div></div>' +
        '<div class="meter-ends"><span>' + rich(b.left) + '</span><span>' + rich(b.right) + '</span></div>' +
        (b.note ? '<p class="meter-note">' + rich(b.note) + '</p>' : '');
      return m;
    },
    range: function (b) {
      var min = +b.min, max = +b.max;
      var low = b.low, high = b.high;
      if ((low == null || high == null) && arr(b.bands).length) { low = b.bands[0].from; high = b.bands[0].to; }
      var unit = b.unit ? (/^%/.test(b.unit) ? b.unit : '\u00a0' + b.unit) : '';
      function pct(v) { return clamp((v - min) / ((max - min) || 1) * 100, 0, 100); }
      var m = el('div', 'meter');
      var bandTxt = low != null ? fmt(low, low % 1 ? 1 : 0) + '–' + fmt(high, high % 1 ? 1 : 0) + unit : '';
      m.setAttribute('role', 'img');
      m.setAttribute('aria-label', (b.label || '') + (bandTxt ? ': faixa ideal ' + bandTxt : '') + ', escala de ' + min + ' a ' + max + unit);
      var markers = arr(b.markers);
      var html = '<div class="meter-top"><div class="meter-label">' + rich(b.label) + '</div>' + (bandTxt ? '<div class="range-band-label">' + esc(bandTxt) + '</div>' : '') + '</div>' +
        '<div class="track">' + (low != null ? '<div class="range-band" style="left:' + pct(low) + '%;width:' + (pct(high) - pct(low)) + '%"></div>' : '') +
        markers.map(function (mk) { return '<div class="range-pin" style="left:' + pct(+mk.value) + '%"></div>'; }).join('') + '</div>' +
        '<div class="range-axis" aria-hidden="true"><span class="range-tick edge-l" style="left:0">' + fmt(min) + unit + '</span><span class="range-tick edge-r" style="left:100%">' + fmt(max) + unit + '</span></div>';
      if (markers.length) {
        html += '<ul class="range-markers">' + markers.map(function (mk) {
          return '<li><b>' + fmt(+mk.value, (+mk.value) % 1 ? 1 : 0) + unit + '</b><span>' + rich(mk.label) + '</span></li>';
        }).join('') + '</ul>';
      }
      if (b.note) html += '<p class="meter-note">' + rich(b.note) + '</p>';
      m.innerHTML = html;
      return m;
    },
    timeline: function (b) {
      var items = arr(b.items).length ? b.items : arr(b.points).map(function (p) { return { label: p.day, text: p.label }; });
      var l = el('ol', 'timeline');
      items.forEach(function (it) {
        l.appendChild(el('li', 'tl-item', '<div class="tl-label">' + rich(it.label) + '</div>' + (it.text ? '<div class="tl-text">' + rich(it.text) + '</div>' : '')));
      });
      return l;
    },
    roastbar: function (b) {
      var levels = arr(b.levels).length ? b.levels : [
        { label: 'Verde', color: '#A9A57C' }, { label: 'Clara', color: '#A8713F' }, { label: 'Média', color: '#7A4A27' },
        { label: 'Média-<wbr>escura', color: '#52301A' }, { label: 'Escura', color: '#2C1A10' }];
      var f = el('figure', 'figure');
      f.setAttribute('role', 'img');
      f.setAttribute('aria-label', 'Barra de cores da torra: ' + levels.map(function (l) { return String(l.label).replace(/<[^>]+>/g, ''); }).join(', ') + '. Primeiro crack entre verde e clara, segundo crack entre média-escura e escura.');
      var n = levels.length;
      f.innerHTML = '<div class="roast-cracks" aria-hidden="true"><span class="roast-crack" style="left:' + (100 / n) + '%">1º crack</span><span class="roast-crack" style="left:' + (100 * (n - 1) / n) + '%">2º crack</span></div>' +
        '<div class="roast-swatches" aria-hidden="true">' + levels.map(function (l) { return '<span style="background:' + l.color + '"></span>'; }).join('') + '</div>' +
        '<div class="roast-labels" aria-hidden="true">' + levels.map(function (l) { return '<span>' + l.label + '</span>'; }).join('') + '</div>' +
        '<div class="roast-ends" aria-hidden="true"><span>' + rich(b.left || 'Mais acidez e notas de fruta') + '</span><span>' + rich(b.right || 'Mais corpo e amargor') + '</span></div>' +
        (b.caption ? '<figcaption class="fig-cap">' + rich(b.caption) + '</figcaption>' : '');
      return f;
    },
    cherry: function (b) { return figure(cherrySVG(), b.caption, 'cherry'); },
    compass: function (b) { var f = figure(compassSVG(b), b.caption); f.classList.add('compass'); return f; },
    worldmap: function (b, ctx) { return worldMap(b, ctx); },
    region: function (b) {
      var c = el('article', 'region kvgrid');
      c.dataset.region = b.id || slug(b.name);
      if (b.id) { c.id = 'a-' + b.id; c.dataset.anchor = b.id; }
      c.dataset.regionName = slug(b.name);
      var notes = arr(b.notes);
      c.innerHTML = '<div class="region-head"><h2 class="region-name">' + rich(b.name) + '</h2>' + (b.country && slug(b.country) !== slug(b.name) ? '<div class="region-country">' + rich(b.country) + '</div>' : '') + '</div>' +
        (b.altitude ? '<div class="row"><div class="row-title">Altitude</div><div class="row-value num">' + rich(b.altitude) + '</div></div>' : '') +
        (b.process ? '<div class="row"><div class="row-title">Processo</div><div class="row-value">' + rich(b.process) + '</div></div>' : '') +
        (notes.length ? '<div class="region-notes"><div class="k">Notas</div><div class="notes">' + notes.map(function (n) { return '<span class="note-tag">' + rich(n) + '</span>'; }).join('') + '</div></div>' : '') +
        (b.espresso ? '<div class="region-esp"><div class="k">No espresso</div><p>' + rich(b.espresso) + '</p></div>' : '');
      return c;
    },
    glossary: function (b, ctx) { return glossary(b, ctx); },
    myth: function (b) {
      var c = el('div', 'myth');
      c.innerHTML = '<div class="myth-part myth-m">' + ic('xmark', { stroke: 2 }) + '<div><div class="myth-k">Mito</div><p class="myth-t">' + rich(b.myth) + '</p></div></div>' +
        '<div class="myth-part myth-v">' + ic('check', { stroke: 2.2 }) + '<div><div class="myth-k">Verdade</div><p class="myth-t">' + rich(b.truth) + '</p></div></div>';
      return c;
    }
  };
  function figure(svg, caption, cls) {
    var f = el('figure', 'figure' + (cls ? ' ' + cls : ''));
    f.innerHTML = svg + (caption ? '<figcaption class="fig-cap">' + rich(caption) + '</figcaption>' : '');
    return f;
  }

  function cherrySVG() {
    var cx = 108, cy = 108;
    var labels = [
      ['Casca', 'vermelha, madura', 152, 24],
      ['Polpa', 'doce, carnuda', 172, 62],
      ['Mucilagem', 'camada pegajosa', 164, 92],
      ['Pergaminho', 'casquinha clara', 160, 124],
      ['Película prateada', 'pele fina do grão', 153, 141],
      ['Grão', 'o que vira café', 136, 160]
    ];
    var ly = [22, 58, 94, 130, 166, 202];
    var bean = function (dir) {
      // D-shaped bean; flat side towards the centre
      var x0 = cx + dir * 3;
      var x1 = cx + dir * 46;
      return 'M' + x0 + ' ' + (cy - 50) + ' C' + x1 + ' ' + (cy - 50) + ' ' + x1 + ' ' + (cy + 50) + ' ' + x0 + ' ' + (cy + 50) + ' Z';
    };
    var beanP = function (dir, off) {
      var x0 = cx + dir * (3 - off);
      var x1 = cx + dir * (46 + off * 1.3);
      return 'M' + x0 + ' ' + (cy - 50 - off) + ' C' + x1 + ' ' + (cy - 50 - off) + ' ' + x1 + ' ' + (cy + 50 + off) + ' ' + x0 + ' ' + (cy + 50 + off) + ' Z';
    };
    var crease = function (dir) { var x = cx + dir * 22; return 'M' + (x + dir * 2) + ' ' + (cy - 30) + ' C' + (x - dir * 6) + ' ' + (cy - 8) + ' ' + (x + dir * 6) + ' ' + (cy + 8) + ' ' + (x - dir * 2) + ' ' + (cy + 30); };
    var s = '<svg viewBox="0 0 356 222" role="img" aria-label="Corte de uma cereja de café, de fora para dentro: casca, polpa, mucilagem, pergaminho, película prateada e grão. Cada cereja tem dois grãos com o lado plano virado um para o outro.">' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="88" ry="96" fill="#B23A31"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="82" ry="90" fill="#EFC7A9"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="62" ry="70" fill="#E9D79E" opacity=".95"/>' +
      '<path d="' + beanP(-1, 5) + '" fill="#EEE5CF" stroke="#C2B080" stroke-width="1.2"/>' +
      '<path d="' + beanP(1, 5) + '" fill="#EEE5CF" stroke="#C2B080" stroke-width="1.2"/>' +
      '<path d="' + beanP(-1, 1.6) + '" fill="#DADBD3" stroke="#B9BBB2" stroke-width=".8"/>' +
      '<path d="' + beanP(1, 1.6) + '" fill="#DADBD3" stroke="#B9BBB2" stroke-width=".8"/>' +
      '<path d="' + bean(-1) + '" fill="#9EAA72"/><path d="' + bean(1) + '" fill="#9EAA72"/>' +
      '<path d="' + crease(-1) + '" stroke="#76814F" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<path d="' + crease(1) + '" stroke="#76814F" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    labels.forEach(function (l, i) {
      var y = ly[i];
      s += '<path class="svg-line" d="M' + l[2] + ' ' + l[3] + ' L204 ' + (y - 4) + ' L210 ' + (y - 4) + '"/>' +
        '<circle cx="' + l[2] + '" cy="' + l[3] + '" r="2" fill="var(--label)"/>' +
        '<text class="svg-label" x="214" y="' + y + '" font-weight="600">' + l[0] + '</text>' +
        '<text class="svg-sub" x="214" y="' + (y + 13) + '">' + l[1] + '</text>';
    });
    return s + '</svg>';
  }

  function compassSVG(b) {
    var L = Object.assign({ left: 'Azedo', leftSub: 'subextraído', right: 'Amargo', rightSub: 'superextraído', top: 'Forte', topSub: 'concentrado', bottom: 'Fraco', bottomSub: 'aguado', center: 'Equilibrado' }, b.labels || {});
    ['top', 'bottom', 'left', 'right'].forEach(function (k) {
      if (typeof b[k] !== 'string' || !b[k]) return;
      var str = b[k].replace(/<[^>]+>/g, '');
      var m = str.match(/^(.*?)\s*(?:\s\/\s|\s[–—-]\s|\(|:\s|,\s)\s*(.*?)\)?$/);
      if (m && m[1] && m[2]) { L[k] = m[1]; L[k + 'Sub'] = m[2]; } else { L[k] = str; L[k + 'Sub'] = ''; }
    });
    if (typeof b.center === 'string' && b.center) L.center = b.center.replace(/<[^>]+>/g, '');
    var W = 320, H = 300, cx = 160, cy = 150;
    var pillW = Math.round(String(L.center).length * 7.8 + 20);
    function t(x, y, txt, cls, anchor, w) { return '<text class="' + cls + '" x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '"' + (w ? ' font-weight="600"' : '') + '>' + esc(txt) + '</text>'; }
    var q = b.quadrants || ['Azedo e fraco: falta extração e falta café', 'Amargo e fraco: passou do ponto, mas diluído', 'Azedo e forte: concentrado, mas cru', 'Amargo e forte: extraiu demais'];
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Bússola de extração. Eixo horizontal: ' + esc(L.left) + ' (' + esc(L.leftSub) + ') à esquerda, ' + esc(L.right) + ' (' + esc(L.rightSub) + ') à direita. Eixo vertical: ' + esc(L.top) + ' em cima, ' + esc(L.bottom) + ' embaixo. O alvo é o centro: ' + esc(L.center) + '.">' +
      '<rect x="40" y="36" width="240" height="228" rx="14" fill="var(--fill)"/>' +
      '<line x1="40" y1="' + cy + '" x2="280" y2="' + cy + '" stroke="var(--label3)" stroke-width="1"/>' +
      '<line x1="' + cx + '" y1="36" x2="' + cx + '" y2="264" stroke="var(--label3)" stroke-width="1"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="30" fill="var(--success)" opacity=".18"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="30" fill="none" stroke="var(--success)" stroke-width="1.5"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="var(--success)"/>' +
      // Centre label in a pill below the target circle, clear of the axes and the quadrant text.
      '<rect class="svg-pill" x="' + (cx - pillW / 2) + '" y="' + (cy + 30 + 6) + '" width="' + pillW + '" height="22" rx="11"/>' +
      t(cx, cy + 30 + 22, L.center, 'svg-label', 'middle', true) +
      t(cx, 20, L.top, 'svg-label', 'middle', true) + t(cx, 32, L.topSub, 'svg-sub') +
      t(cx, 282, L.bottom, 'svg-label', 'middle', true) + t(cx, 295, L.bottomSub, 'svg-sub') +
      '<g transform="translate(22 ' + cy + ') rotate(-90)">' + t(0, 0, L.left, 'svg-label', 'middle', true) + t(0, 12, L.leftSub, 'svg-sub') + '</g>' +
      '<g transform="translate(298 ' + cy + ') rotate(90)">' + t(0, 0, L.right, 'svg-label', 'middle', true) + t(0, 12, L.rightSub, 'svg-sub') + '</g>' +
      quadText(q[2], 96, 64) + quadText(q[3], 224, 64) + quadText(q[0], 96, 222) + quadText(q[1], 224, 222) +
      '</svg>';
    function quadText(s, x, y) {
      var words = String(s).split(' '), lines = [''], max = 17;
      words.forEach(function (w) { if ((lines[lines.length - 1] + ' ' + w).trim().length > max) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); });
      return lines.slice(0, 4).map(function (ln, i) { return t(x, y + i * 13, ln, 'svg-sub'); }).join('');
    }
  }

  /* -------- World map: dot-matrix land from coarse lon/lat outlines -------- */
  var LAND = [
    [[-168, 66], [-160, 70], [-140, 70], [-125, 70], [-95, 72], [-80, 70], [-65, 60], [-60, 52], [-53, 47], [-66, 45], [-70, 42], [-76, 37], [-76, 35], [-81, 31], [-80, 25], [-82, 26], [-84, 30], [-90, 29], [-97, 27], [-97, 22], [-94, 18.5], [-90, 21], [-87, 21], [-88, 16], [-83, 15], [-83, 10], [-79, 9], [-77, 8], [-80, 7.5], [-85, 10], [-88, 13], [-92, 14.5], [-96, 16], [-105, 20], [-106, 23], [-110, 24], [-112, 29], [-115, 30], [-117, 33], [-121, 35], [-124, 40], [-124, 48], [-130, 54], [-137, 59], [-150, 60], [-158, 57], [-165, 61]],
    [[-80, 9], [-77, 8], [-72, 12], [-63, 10.5], [-60, 8], [-52, 5], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -15], [-41, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -41], [-65, -45], [-68, -50], [-69, -55], [-74, -52], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -6], [-80, -2], [-78, 2], [-77, 7]],
    [[-17, 21], [-17, 15], [-15, 11], [-13, 8], [-8, 4.5], [-2, 5], [5, 6], [9, 4], [9.5, 1], [12, -5], [13, -12], [12, -17], [15, -27], [18, -34], [20, -35], [26, -34], [32, -29], [35, -24], [35, -19], [40, -15], [40, -10], [39, -5], [41, -2], [44, 2], [51, 11], [43, 12], [39, 17], [35, 24], [32, 31], [25, 32], [20, 31], [10, 34], [10, 37], [0, 36], [-6, 36], [-10, 30], [-13, 27]],
    [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
    [[-6, 36], [-9, 37], [-9, 43], [-2, 43.5], [-4.5, 48], [2, 51], [8, 54], [9, 57], [6, 62], [14, 67], [22, 70.5], [30, 70], [40, 66], [44, 68], [60, 69], [70, 73], [80, 73], [100, 78], [115, 74], [130, 71], [150, 71], [170, 70], [180, 66], [178, 63], [163, 60], [160, 54], [156, 51], [150, 59], [140, 58], [135, 54], [141, 47], [135, 43], [129, 35], [126, 35], [126, 39], [121, 40], [121, 37], [120, 32], [122, 30], [119, 25], [113, 22], [108, 21], [106, 17], [109, 12], [105, 9], [103, 10], [100, 13], [99, 9], [103, 1.5], [101, 2.5], [98, 8], [97, 16], [94, 16], [92, 22], [87, 21.5], [80, 15], [80, 10], [77, 8], [73, 16], [72, 21], [66, 25], [57, 25.5], [59, 22], [55, 17], [52, 16], [44, 12.6], [43, 14], [39, 21], [35, 28], [34.5, 29.5], [34, 31], [35.5, 34], [36, 36.5], [30, 36.5], [27, 37], [26, 40], [23, 40], [21, 38], [19.5, 41.5], [13, 45.5], [12.5, 44], [16, 41], [18, 40], [16, 38], [12.5, 38], [14, 41], [11, 42.5], [9, 44.3], [6, 43], [3, 43.3], [0, 39], [-0.5, 38], [-2, 36.7]],
    [[-5, 50], [1, 51], [0, 53], [-2, 56], [-3, 58.5], [-6, 58], [-5, 55], [-3, 54], [-5, 52]],
    [[130, 31], [131, 34], [135, 34], [140, 35], [142, 40], [141, 45], [144, 44], [140, 41], [139, 38], [136, 36], [133, 35.5], [130, 33.5]],
    [[95, 5.5], [98, 4], [104, -2], [106, -6], [102, -4], [97, 1]],
    [[109, 1.5], [111, -3], [116, -4], [119, 1], [117, 7], [113, 3]],
    [[105, -6], [114, -7], [114.5, -8.7], [106, -7.5]],
    [[119, -5], [120, 1], [124, 1.5], [121, -1], [122, -5]],
    [[131, -1], [141, -2.5], [150, -10], [143, -9], [138, -8], [135, -4]],
    [[120, 18], [122, 18], [126, 7], [122, 7]],
    [[114, -22], [114, -34], [118, -35], [124, -33], [131, -31.5], [138, -35], [141, -38], [147, -39], [150, -37], [153, -31], [153, -25], [146, -19], [142, -11], [141, -17], [136, -12], [130, -11.5], [126, -14], [122, -17.5]],
    [[-85, 22], [-80, 23], [-74, 20], [-78, 20]],
    [[-74, 19.5], [-68.5, 18.5], [-71, 17.8]],
    [[80, 9.8], [81.8, 7.5], [81, 6], [79.8, 7]],
    [[-158.3, 21.6], [-157.6, 21.3], [-155.9, 20.2], [-155, 19.5], [-155.7, 18.9], [-156, 19.8]]
  ];
  var MAP = { lon0: -112, lon1: 150, lat0: 30, lat1: -32, ky: 1.75 };
  function pip(x, y, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  var landDots = null;
  function mapDots() {
    if (landDots) return landDots;
    var step = 3.1, out = [];
    for (var X = 0; X <= (MAP.lon1 - MAP.lon0); X += step) {
      for (var Y = 0; Y <= (MAP.lat0 - MAP.lat1) * MAP.ky; Y += step) {
        var lon = MAP.lon0 + X, lat = MAP.lat0 - Y / MAP.ky;
        for (var k = 0; k < LAND.length; k++) if (pip(lon, lat, LAND[k])) { out.push([X, Y, Math.abs(lat) <= 23.44]); break; }
      }
    }
    landDots = out;
    return out;
  }
  function project(r) {
    var lon, lat;
    if (r.lon != null && r.lat != null) { lon = +r.lon; lat = +r.lat; }
    else { lon = (+r.x) * 3.6 - 180; lat = 90 - (+r.y) * 1.8; } // x,y = equirectangular world %
    return [clamp(lon - MAP.lon0, 2, MAP.lon1 - MAP.lon0 - 2), clamp((MAP.lat0 - lat) * MAP.ky, 2, (MAP.lat0 - MAP.lat1) * MAP.ky - 2)];
  }
  function worldMap(b, ctx) {
    var W = MAP.lon1 - MAP.lon0, H = (MAP.lat0 - MAP.lat1) * MAP.ky;
    var regions = arr(b.regions);
    var dots = mapDots().map(function (d) { return '<circle class="map-land' + (d[2] ? ' belt' : '') + '" cx="' + d[0].toFixed(1) + '" cy="' + d[1].toFixed(1) + '" r="1.05"/>'; }).join('');
    var tropic = function (lat) { return (MAP.lat0 - lat) * MAP.ky; };
    var pts = regions.map(function (r) { return project(r); });
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H.toFixed(1) + '" aria-hidden="true">' +
      dots +
      '<line class="map-tropic" x1="0" x2="' + W + '" y1="' + tropic(23.44) + '" y2="' + tropic(23.44) + '"/>' +
      '<line class="map-tropic" x1="0" x2="' + W + '" y1="' + tropic(-23.44) + '" y2="' + tropic(-23.44) + '"/>' +
      regions.map(function (r, i) {
        return '<circle class="map-hit" cx="' + pts[i][0].toFixed(1) + '" cy="' + pts[i][1].toFixed(1) + '" r="18"/>';
      }).join('') +
      regions.map(function (r, i) {
        return '<circle class="map-dot" data-i="' + i + '" cx="' + pts[i][0].toFixed(1) + '" cy="' + pts[i][1].toFixed(1) + '" r="3.6"><title>' + esc(r.name) + '</title></circle>';
      }).join('') + '</svg>';
    var f = el('figure', 'figure map-wrap');
    f.innerHTML = svg +
      '<div class="map-legend" aria-hidden="true"><span><i style="background:var(--crema)"></i>Cinturão do café, entre os trópicos</span><span><i style="background:var(--accent);border-radius:50%"></i>Regiões abaixo</span></div>' +
      '<div class="map-chips"></div>' +
      (b.caption ? '<figcaption class="fig-cap">' + rich(b.caption) + '</figcaption>' : '');
    var chips = f.querySelector('.map-chips');
    regions.forEach(function (r, i) {
      var c = el('button', 'chip', rich(r.name)); c.type = 'button';
      c.addEventListener('click', function () { jump(i); });
      chips.appendChild(c);
    });
    var svgEl = f.querySelector('svg');
    function jump(i) {
      var r = regions[i]; if (!r) return;
      var tgt = r.link || r.target;
      if (tgt && tgt.indexOf('/') >= 0) { goCanonical(tgt); return; }
      if (tgt) r = Object.assign({}, r, { id: tgt });
      svgEl.querySelectorAll('.map-dot').forEach(function (d) { d.classList.toggle('sel', +d.dataset.i === i); d.setAttribute('r', +d.dataset.i === i ? 5 : 3.6); });
      var page = ctx.page;
      var target = (r.id && page.querySelector('[data-anchor="' + r.id + '"]')) || page.querySelector('.region[data-region="' + (r.id || '') + '"]') ||
        page.querySelector('.region[data-region-name="' + slug(r.name) + '"]') ||
        page.querySelector('.region[data-region="' + slug(r.name) + '"]');
      if (!target) {
        var all = page.querySelectorAll('.region');
        for (var k = 0; k < all.length; k++) { var nm = all[k].dataset.regionName; if (nm.indexOf(slug(r.name)) >= 0 || slug(r.name).indexOf(nm) >= 0) { target = all[k]; break; } }
      }
      if (target) {
        var sc = ctx.scroller;
        var navH = page.querySelector('.nav').offsetHeight;
        var y = target.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - navH - 12;
        sc.scrollTo({ top: y, behavior: mqReduce.matches ? 'auto' : 'smooth' });
        target.classList.add('flash');
        setTimeout(function () { target.classList.remove('flash'); }, 1400);
      }
    }
    svgEl.addEventListener('click', function (e) {
      if (!regions.length) return;
      var pt = svgEl.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      var m = svgEl.getScreenCTM(); if (!m) return;
      var p = pt.matrixTransform(m.inverse());
      var best = -1, bd = Infinity;
      pts.forEach(function (q, i) { var d = Math.hypot(q[0] - p.x, q[1] - p.y); if (d < bd) { bd = d; best = i; } });
      // ~22px hit radius in screen space
      var scale = svgEl.getBoundingClientRect().width / W;
      if (bd * scale <= 22) jump(best); // 44 pt hit diameter around each dot (chips below are the accessible control)
    });
    return f;
  }

  /* ------------------------------------------------------------ Glossary */
  function glossary(b, ctx) {
    var w = el('div', 'blk gl');
    var items = arr(b.items).slice().sort(function (a, c) { return String(a.termo).localeCompare(String(c.termo), 'pt-BR', { sensitivity: 'base' }); });
    var groups = {}, order = [];
    items.forEach(function (it) {
      var L = String(it.termo || '?').normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0).toUpperCase();
      if (!/[A-Z]/.test(L)) L = '#';
      if (!groups[L]) { groups[L] = []; order.push(L); }
      groups[L].push(it);
    });
    var sf = searchField('Buscar termo', function (v) { filterGl(v); });
    sf.classList.add('gl-search');
    w.appendChild(sf);
    var empty = emptyState('Nenhum termo encontrado', 'Tente outra palavra ou limpe a busca.', function () { sf.clear(); });
    empty.hidden = true;
    var nav = null;
    if (order.length > 5) {
      nav = el('div', 'gl-letters');
      nav.setAttribute('aria-label', 'Ir para a letra');
      order.forEach(function (L) {
        var bt = el('button', 'gl-letter-btn', L); bt.type = 'button';
        bt.addEventListener('click', function () { scrollToEl(ctx, w.querySelector('[data-letter="' + L + '"]'), 0); });
        nav.appendChild(bt);
      });
      w.appendChild(nav);
    }
    w.appendChild(empty);
    var secs = [];
    order.forEach(function (L) {
      var sec = el('div', 'gl-sec');
      var hh = el('h2', 'sec-h small gl-h', L); hh.dataset.letter = L;
      sec.appendChild(hh);
      secs.push(sec);
      w.appendChild(sec);
      sec.appendChild(group(groups[L].map(function (it) {
        var r = el('div', 'row');
        r.id = 'g-' + (it.id || slug(it.termo));
        r.dataset.term = it.id || slug(it.termo);
        r.dataset.q = norm(it.termo + ' ' + it.def);
        r.innerHTML = '<div class="row-title">' + rich(it.termo) + '</div><div class="row-sub body secondary">' + rich(it.def) + '</div>';
        return r;
      })));
    });
    function filterGl(v) {
      var q = norm(v.trim()), any = false;
      secs.forEach(function (sec) {
        var vis = 0;
        sec.querySelectorAll('.row').forEach(function (r) { var ok = !q || r.dataset.q.indexOf(q) >= 0; r.hidden = !ok; r.classList.toggle('first-vis', ok && !vis); if (ok) vis++; });
        sec.hidden = !vis; if (vis) any = true;
      });
      if (nav) nav.hidden = !!q;
      empty.hidden = any;
    }
    return w;
  }
  function scrollToEl(ctx, target, extra) {
    if (!target) return;
    var sc = ctx.scroller;
    var navH = ctx.page.querySelector('.nav').offsetHeight;
    var y = target.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - navH - (extra || 0);
    sc.scrollTo({ top: Math.max(0, y), behavior: mqReduce.matches ? 'auto' : 'smooth' });
  }
  function glossaryAnchor(ctx, a) {
    var s = slug(a);
    var t = ctx.page.querySelector('[data-term="' + a + '"]') || ctx.page.querySelector('[data-term="' + s + '"]');
    if (!t) {
      var all = ctx.page.querySelectorAll('[data-term]');
      for (var i = 0; i < all.length; i++) if (slug(all[i].dataset.term).indexOf(s) === 0) { t = all[i]; break; }
    }
    if (!t) return;
    scrollToEl(ctx, t, 44);
    t.classList.add('flash');
    setTimeout(function () { t.classList.remove('flash'); }, 1600);
  }

  /* ================================================================ PAGES */
  function nextLinks(rel) {
    var w = el('nav', 'blk next-links');
    w.setAttribute('aria-label', 'Continue lendo');
    arr(rel).forEach(function (t) {
      var d = describeLink(t);
      if (!d) return;
      var link = el('a', 'pressable', '<span>' + rich(d.title) + '</span>' + ic('chevron-right', { cls: 'chev', stroke: 2.4 }));
      link.href = '#'; link.dataset.go = t;
      w.appendChild(link);
    });
    return w;
  }
  function articlePage(a) {
    return {
      title: a.title, subtitle: a.subtitle, band: a.band,
      build: function (ctx) {
        var f = document.createDocumentFragment();
        f.appendChild(renderBlocks(a.blocks, ctx));
        if (a.espresso) {
          var box = el('aside', 'espresso-box');
          box.innerHTML = '<div class="eb-head"><span class="sq">' + ic('cup', { stroke: 2 }) + '</span><h2 class="eb-title">O que isso muda no seu espresso</h2></div>' + String(a.espresso).split('\n').map(function (t) { return '<p>' + rich(t) + '</p>'; }).join('');
          f.appendChild(box);
        }
        f.appendChild(a.band ? nextLinks(a.related) : relatedList(a.related));
        return f;
      },
      anchor: function (x) {
        var t = this.ctx.page.querySelector('[data-anchor="' + x + '"]');
        if (t) { scrollToEl(this.ctx, t, 12); return; }
        glossaryAnchor(this.ctx, x);
      }
    };
  }
  function relatedList(rel) {
    var rows = arr(rel).map(function (t) {
      var d = describeLink(t);
      if (!d) return null;
      return rowLink({ go: t, title: d.title, lead: d.drink ? cupSVG(d.drink, true) : (d.icon ? ic(d.icon, { cls: 'glyph' }) : '') });
    }).filter(Boolean);
    if (!rows.length) return document.createDocumentFragment();
    var w = el('div', 'related');
    w.appendChild(secH('Veja também', true));
    w.appendChild(group(rows, 'with-glyph'));
    return w;
  }

  function notFoundPage() {
    return {
      title: 'Não encontrado', large: false,
      build: function (ctx) {
        var d = el('div', 'empty');
        d.innerHTML = ic('book') + '<div class="empty-title">Esta página não existe</div><p>O link pode estar desatualizado.</p>';
        var w = el('div', 'btn-wrap');
        var b = el('a', 'btn tinted', 'Voltar para ' + esc(tabTitle(ctx.tab)));
        b.href = '#'; b.dataset.go = ctx.tab;
        w.appendChild(b);
        return frag([d, w]);
      }
    };
  }

  var ROOTS = {
    comecar: function () {
      return {
        title: tabTitle('comecar'),
        build: function (ctx) {
          var c = C().comecar || {};
          var f = [];
          arr(c.alerts).forEach(function (al) {
            var k = al.home || {};
            var v = el('a', 'block tone-volt pressable', '<span class="block-num">' + rich(k.num || al.title) + '</span>' +
              '<span class="block-line">' + rich(k.line || al.subtitle || '') + '</span>' +
              '<span class="block-go">' + rich(k.go || 'Abrir') + ic('chevron-right', { stroke: 2.8 }) + '</span>');
            v.href = '#'; v.dataset.go = al.id;
            f.push(v);
          });
          var m = c.manual;
          if (m) {
            var card = arr(m.cards)[0] || {};
            var t = el('a', 'block tone-ink pressable', '<span class="block-title">' + rich(m.title) + '</span>' +
              (card.ele ? '<span class="block-quote">' + rich(card.ele) + '</span>' : '') +
              '<span class="block-go">' + arr(m.cards).length + ' respostas na ponta da língua' + ic('chevron-right', { stroke: 2.8 }) + '</span>');
            t.href = '#'; t.dataset.go = 'manual';
            f.push(t);
          }
          var n = 0;
          arr(c.sections).forEach(function (s) {
            f.push(el('h2', 'list-h', rich(s.title)));
            var ol = el('ol', 'plain-list');
            arr(s.items).forEach(function (a) {
              n++;
              var li = el('li', '', '<a class="pressable" href="#" data-go="' + esc(a.id) + '"><span class="pl-n" aria-hidden="true">' + n + '</span><span class="pl-t">' + rich(a.title) + '</span>' + ic('chevron-right', { cls: 'chev', stroke: 2.4 }) + '</a>');
              ol.appendChild(li);
            });
            f.push(ol);
          });
          return frag(f);
        }
      };
    },
    bebidas: function () {
      return {
        title: tabTitle('bebidas'),
        build: function (ctx) {
          var b = C().bebidas || {};
          var groups = arr(b.groups);
          var f = [];
          if (b.intro) f.push(el('p', 'intro', rich(b.intro)));
          var st = { q: '', g: 'all' };
          var sf = searchField('Buscar bebida', function (v) { st.q = v; paint(); });
          f.push(sf);
          // Filter chips: one per group (five labels do not fit a native segmented control at 375 pt / 130 % text).
          var chips = el('div', 'filter-chips');
          chips.setAttribute('role', 'radiogroup'); chips.setAttribute('aria-label', 'Filtrar por tipo');
          var opts = [{ id: 'all', label: 'Todos' }].concat(groups.map(function (g, i) { return { id: String(i), label: g.title }; }));
          var chipEls = opts.map(function (o) {
            var c = el('button', 'chip', esc(o.label)); c.type = 'button'; c.setAttribute('role', 'radio');
            c.addEventListener('click', function () { st.g = o.id; paint(); });
            chips.appendChild(c); return c;
          });
          f.push(chips);
          var host = el('div', 'list-host');
          f.push(host);
          function ratioChip(r) {
            var m = String(r || '').match(/1:\d+(?:,\d+)?(?:\s+a\s+1:\d+(?:,\d+)?)?/);
            return m ? m[0] : '';
          }
          function row(d) {
            var meta = '';
            var rc = ratioChip(d.ratio);
            if (rc) meta += '<span class="meta-chip">' + rich(rc) + '</span>';
            if (d.volume) meta += '<span class="meta-chip">' + rich(d.volume) + '</span>';
            var r = rowLink({ go: d.id, title: d.name, sub: d.short, meta: meta, lead: cupSVG(d, true) });
            attachLongPress(r, function () { quickView(d, ctx); });
            return r;
          }
          function paint() {
            chipEls.forEach(function (c, i) { c.setAttribute('aria-checked', opts[i].id === st.g ? 'true' : 'false'); });
            host.innerHTML = '';
            var q = norm(st.q.trim()), any = false;
            groups.forEach(function (g, gi) {
              if (st.g !== 'all' && st.g !== String(gi)) return;
              var items = arr(g.items).filter(function (d) { return !q || norm([d.name, d.aka, d.short, d.ratio, d.volume, d.cup].join(' ')).indexOf(q) >= 0; });
              if (!items.length) return;
              any = true;
              host.appendChild(secH(g.title));
              host.appendChild(group(items.map(row), 'with-cup'));
            });
            if (!any) host.appendChild(emptyState('Nenhuma bebida encontrada', 'Tente outro nome ou escolha “Todos”.', function () { st.q = ''; st.g = 'all'; sf.clear(); paint(); }));
            else host.appendChild(el('p', 'caption', 'Toque e segure uma bebida para uma prévia rápida.'));
          }
          paint();
          return frag(f);
        }
      };
    },
    preparar: function () {
      return {
        title: tabTitle('preparar'),
        build: function (ctx) {
          var p = C().preparar || {};
          var f = [];
          if (p.intro) f.push(el('p', 'intro', rich(p.intro)));
          var tiles = el('div', 'tiles');
          var t1 = el('a', 'tile'); t1.href = '#'; t1.dataset.go = 'ratio';
          var t2 = el('a', 'tile'); t2.href = '#'; t2.dataset.go = 'timer';
          tiles.appendChild(t1); tiles.appendChild(t2);
          function paint() {
            var r = ratioState();
            t1.innerHTML = '<div class="tile-top">' + sq('scale') + '</div><div class="tile-title">Proporção</div><div class="tile-val">' + fmt(r.dose, r.dose % 1 ? 1 : 0) + '\u00a0g → ' + fmt(r.dose * r.ratio, 0) + '\u00a0g</div><div class="tile-sub">Pó → bebida, 1:' + fmt(r.ratio, 1) + '</div>';
            var tm = p.timer || {};
            var last = store.get('bambino.lastShot', null);
            t2.innerHTML = '<div class="tile-top">' + sq('timer') + '</div><div class="tile-title">Cronômetro</div><div class="tile-val">' + (last ? fmt(last, 1) + '\u00a0s' : fmt(tm.targetMin || 25) + '–' + fmt(tm.targetMax || 30) + '\u00a0s') + '</div><div class="tile-sub">' + (last ? 'Último shot' : 'Faixa de referência') + '</div>';
          }
          paint();
          this.onShow = paint;
          f.push(tiles);
          var rows = [];
          if (p.leite) rows.push(rowLink({ go: 'leite', title: p.leite.title, sub: p.leite.subtitle, lead: sq(p.leite.icon && window.icon.has(p.leite.icon) ? p.leite.icon : 'milk', 'slate') }));
          if (arr(p.diagnostico).length) rows.push(rowLink({ go: 'diagnostico', title: p.diagnosticoTitle || 'Diagnóstico do espresso', sub: p.diagnosticoSub || 'Azedo, amargo, rápido ou lento: o que mudar', lead: sq('wrench', 'terracotta') }));
          if (rows.length) { f.push(secH('Guias')); f.push(group(rows, 'with-sq')); }
          return frag(f);
        }
      };
    },
    entender: function () {
      return {
        title: tabTitle('entender'),
        build: function () {
          var e = C().entender || {};
          var secs = arr(e.sections);
          var f = [];
          if (e.intro) f.push(el('p', 'intro', rich(e.intro)));
          var st = { q: '', s: 0 };
          var index = {};
          var rawText = {};
          secs.forEach(function (sec) { arr(sec.items).forEach(function (a) { rawText[a.id] = flatText(a.blocks); index[a.id] = norm(a.title + ' ' + a.subtitle + ' ' + rawText[a.id]); }); });
          function snippet(a, q) {
            if (norm(a.title + ' ' + a.subtitle).indexOf(q) >= 0) return '';
            var raw = rawText[a.id], i = norm(raw).indexOf(q);
            if (i < 0) return '';
            var from = Math.max(0, i - 28), to = Math.min(raw.length, i + q.length + 36);
            return (from ? '…' : '') + esc(raw.slice(from, i)) + '<mark>' + esc(raw.slice(i, i + q.length)) + '</mark>' + esc(raw.slice(i + q.length, to)) + (to < raw.length ? '…' : '');
          }
          var sf = searchField('Buscar em Entender', function (v) { st.q = v; paint(); });
          f.push(sf);
          var segWrap = el('div', 'seg-wrap');
          var seg = segmented(secs.map(function (s2, i) { return { label: s2.title, value: i }; }), 0, function (v) { st.s = v; paint(); }, 'Seção');
          segWrap.appendChild(seg);
          f.push(segWrap);
          var host = el('div', 'list-host');
          f.push(host);
          function list(items, q) {
            return group(items.map(function (a) {
              var name = a.icon && window.icon.has(a.icon) ? a.icon : 'book';
              var sn = q ? snippet(a, q) : '';
              var r = rowLink({ go: a.id, title: a.title, sub: a.subtitle, lead: sq(name) });
              if (sn) r.querySelector('.row-main').appendChild(el('div', 'row-snip', 'Encontrado em: ' + sn));
              return r;
            }), 'with-sq');
          }
          function paint() {
            host.innerHTML = '';
            var q = norm(st.q.trim());
            segWrap.hidden = !!q;
            if (!q) {
              var g1 = list(arr((secs[st.s] || {}).items));
              g1.style.marginTop = '16px';
              host.appendChild(g1);
              return;
            }
            var any = false;
            secs.forEach(function (sec) {
              var items = arr(sec.items).filter(function (a) { return index[a.id].indexOf(q) >= 0; });
              if (!items.length) return;
              any = true;
              host.appendChild(secH(sec.title));
              host.appendChild(list(items, q));
            });
            if (!any) host.appendChild(emptyState('Nada encontrado', 'Tente outra palavra, como “torra” ou “água”.', function () { sf.clear(); }));
          }
          paint();
          return frag(f);
        }
      };
    }
  };

  /* ---------------------------------------------------------------- Drinks */
  /* Checkable recipe steps. Checked state is kept per drink in localStorage (store has try/catch). */
  function drinkSteps(d) {
    var KEY = 'bambino.steps.' + d.id;
    var steps = arr(d.steps);
    var saved = store.get(KEY, []);
    var done = steps.map(function (_, i) { return !!(Array.isArray(saved) && saved[i]); });
    var w = el('div', 'steps-wrap');
    var head = el('div', 'steps-head');
    head.innerHTML = '<h2 class="sec-h">Como fazer</h2>';
    var reset = el('button', 'steps-reset', 'Recomeçar'); reset.type = 'button';
    head.appendChild(reset);
    w.appendChild(head);
    var count = el('p', 'steps-count'); count.setAttribute('aria-live', 'polite');
    w.appendChild(count);
    var ol = el('ol', 'steps check');
    var btns = steps.map(function (t, i) {
      var li = el('li', 'step');
      var b = el('button', 'step-btn'); b.type = 'button'; b.setAttribute('role', 'checkbox');
      var txt = typeof t === 'string' ? '<span class="step-text">' + rich(t) + '</span>' :
        (t.title ? '<span class="step-title">' + rich(t.title) + '</span>' : '') + '<span class="step-text">' + rich(t.text || '') + '</span>';
      b.innerHTML = '<span class="step-n" aria-hidden="true"></span><span class="step-body">' + txt + '</span>';
      b.addEventListener('click', function () { done[i] = !done[i]; store.set(KEY, done); paint(); });
      li.appendChild(b); ol.appendChild(li);
      return b;
    });
    if (d.tip) {
      var tl = el('li', 'step-tip');
      tl.innerHTML = '<span class="ctile" aria-hidden="true">' + ic('lightbulb', { stroke: 2 }) + '</span><p>' + rich(d.tip) + '</p>';
      ol.appendChild(tl);
    }
    w.appendChild(ol);
    function paint() {
      var n = 0;
      btns.forEach(function (b, i) {
        b.classList.toggle('done', done[i]);
        b.setAttribute('aria-checked', done[i] ? 'true' : 'false');
        b.querySelector('.step-n').innerHTML = done[i] ? ic('check', { stroke: 3, size: 16 }) : String(i + 1);
        if (done[i]) n++;
      });
      count.textContent = n ? n + ' de ' + steps.length + ' passos feitos' : 'Toque em um passo para marcar como feito';
      reset.hidden = !n;
    }
    reset.addEventListener('click', function () { done = done.map(function () { return false; }); store.set(KEY, done); paint(); });
    paint();
    return w;
  }
  function drinkPage(d) {
    var band = null;
    if (d.band) {
      var art = cupSVG(d);
      if (!arr(d.layers).some(function (l) { return l.float; })) { var cut = Math.max(0, cupShape(d).top - 16); art = art.replace('viewBox="0 0 200 172"', 'viewBox="0 ' + cut + ' 200 ' + (172 - cut) + '"'); }
      band = Object.assign({ art: art + legendHTML(d) }, d.band);
    }
    return {
      title: d.name, subtitle: d.aka, band: band,
      build: function (ctx) {
        var f = [];
        if (band) {
          f.push(BLOCKS.leader({ items: [{ label: 'Espresso', value: d.espresso }, { label: 'Xícara', value: String(d.cup || '').replace(/^x[ií]cara de /i, '') }] }));
          if (arr(d.steps).length) f.push(drinkSteps(d));
          f.push(nextLinks(d.related));
          return frag(f);
        }
        var hero = el('div', 'drink-hero');
        hero.innerHTML = '<div class="drink-cup">' + cupSVG(d) + '</div>' + legendHTML(d) + (d.short ? '<p class="drink-short">' + rich(d.short) + '</p>' : '');
        f.push(hero);
        var st = el('div', ''); st.innerHTML = statsHTML(d); f.push(st.firstChild);
        if (arr(d.steps).length) f.push(drinkSteps(d));
        else if (d.tip) f.push(BLOCKS.callout({ tone: 'tip', text: d.tip }));
        f.push(relatedList(d.related));
        return frag(f);
      }
    };
  }
  function attachLongPress(node, fn) {
    var t = 0, sx = 0, sy = 0, fired = false;
    node.addEventListener('touchstart', function (e) {
      fired = false; sx = e.touches[0].clientX; sy = e.touches[0].clientY;
      t = setTimeout(function () { fired = true; fn(); }, 480);
    }, { passive: true });
    node.addEventListener('touchmove', function (e) {
      if (Math.abs(e.touches[0].clientX - sx) > 8 || Math.abs(e.touches[0].clientY - sy) > 8) clearTimeout(t);
    }, { passive: true });
    node.addEventListener('touchend', function (e) { clearTimeout(t); if (fired) e.preventDefault(); });
    node.addEventListener('click', function (e) { if (fired) { e.preventDefault(); e.stopPropagation(); fired = false; } }, true);
    node.addEventListener('contextmenu', function (e) { e.preventDefault(); if (!fired) fn(); });
  }
  function quickView(d, ctx) {
    openSheet(function (body, close) {
      body.innerHTML = '<div class="sheet-title">' + rich(d.name) + '</div>' +
        '<div class="drink-hero" style="margin-top:12px"><div class="drink-cup">' + cupSVG(d) + '</div>' + legendHTML(d) + '</div>' + statsHTML(d);
      var b = el('button', 'btn', 'Ver o preparo'); b.type = 'button';
      b.addEventListener('click', function () { close('go'); go(ctx.key, d.id); });
      body.appendChild(b);
    }, { label: d.name });
  }

  /* ---------------------------------------------------------------- Manual */
  function manualPage() {
    var m = (C().comecar || {}).manual || {};
    return {
      title: m.title || 'Manual', shortTitle: 'Manual', subtitle: m.subtitle,
      build: function (ctx) {
        var f = [];
        if (m.intro) f.push(el('p', 'intro', rich(m.intro)));
        var cards = arr(m.cards);
        if (cards.length) {
          f.push(secH(m.cardsTitle || 'Ele diz, você responde'));
          var wrap = el('div', 'cards');
          wrap.setAttribute('aria-label', 'Cartões, deslize para o lado');
          cards.forEach(function (c, i) {
            var card = el('article', 'mcard');
            card.setAttribute('aria-label', 'Cartão ' + (i + 1) + ' de ' + cards.length);
            card.innerHTML = '<div class="mcard-k">Ele diz</div><p class="mcard-ele">' + rich(String(c.ele || '').replace(/^["“]|["”]$/g, '')) + '</p>' +
              '<div class="mcard-sep"></div><div class="mcard-k">Você responde</div><p class="mcard-voce">' + rich(c.voce) + '</p>' +
              (c.porque ? '<p class="mcard-porque"><b>Porquê:</b> ' + rich(c.porque) + '</p>' : '') +
              (c.link ? '<a class="link-accent" href="#" data-go="' + esc(c.link) + '">Entender melhor' + ic('chevron-right', { stroke: 2.4 }) + '</a>' : '');
            wrap.appendChild(card);
          });
          f.push(wrap);
          var pager = el('div', 'pager');
          pager.innerHTML = '<span class="pager-count" aria-live="polite">1 de ' + cards.length + '</span>' + (cards.length <= 14 ? '<span class="dots" aria-hidden="true">' + cards.map(function (_, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</span>' : '');
          f.push(pager);
          var cnt = pager.querySelector('.pager-count'), dots = pager.querySelectorAll('.dots i');
          var cur = 0;
          wrap.addEventListener('scroll', function () {
            var first = wrap.firstElementChild; if (!first) return;
            var w = first.getBoundingClientRect().width + 12;
            var i = clamp(Math.round(wrap.scrollLeft / w), 0, cards.length - 1);
            if (wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 4) i = cards.length - 1;
            if (i !== cur) {
              cur = i; cnt.textContent = (i + 1) + ' de ' + cards.length;
              dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
            }
          }, { passive: true });
        }
        if (arr(m.quiz).length) {
          f.push(secH(m.quizTitle || 'Quiz rápido'));
          f.push(quiz(m.quiz));
        }
        var pal = arr(m.palavras);
        if (pal.length) {
          f.push(secH(m.palavrasTitle || 'Palavras pra soltar na conversa'));
          f.push(group(pal.map(function (p) {
            return rowLink({ go: p.link, title: p.termo, sub: p.significado, strong: true });
          })));
        }
        return frag(f);
      }
    };
  }

  function quiz(qs) {
    var KEY = 'bambino.quiz.v1';
    var saved = store.get(KEY, null);
    var answers = saved && Array.isArray(saved.answers) && saved.n === qs.length ? saved.answers.slice() : [];
    var w = el('div', 'quiz');
    function save() { store.set(KEY, { n: qs.length, answers: answers }); }
    function score() { return answers.reduce(function (s, a, i) { return s + (a === +qs[i].correct ? 1 : 0); }, 0); }
    function progress(cur) {
      return '<div class="quiz-progress" aria-hidden="true">' + qs.map(function (q, i) {
        var a = answers[i];
        var c = a == null ? (i === cur ? 'cur' : '') : (a === +q.correct ? 'ok' : 'no');
        return '<i class="' + c + '"></i>';
      }).join('') + '</div>';
    }
    function render() {
      w.innerHTML = '';
      var card = el('div', 'quiz-card');
      var i = answers.length;
      if (i >= qs.length) {
        var s = score();
        var marks = '<ol class="quiz-marks" aria-label="Resultado por pergunta">' + qs.map(function (q2, n) {
          var good = answers[n] === +q2.correct;
          return '<li class="' + (good ? 'ok' : 'no') + '" aria-label="Pergunta ' + (n + 1) + ': ' + (good ? 'certa' : 'errada') + '"><span class="qm">' + ic(good ? 'check' : 'xmark') + '</span><b>' + (n + 1) + '</b></li>';
        }).join('') + '</ol>';
        var msg = s === qs.length ? 'Gabaritou. Pode puxar o assunto na próxima roda de café.' :
          s >= qs.length - 1 ? 'Quase tudo. Refaça o quiz para rever a explicação da que errou.' :
            s >= Math.ceil(qs.length / 2) ? 'Bom começo. Releia os cartões acima e tente de novo.' :
              'Ainda não. Passe pelos cartões com calma e refaça: ninguém nasce sabendo.';
        card.innerHTML = '<div class="quiz-done"><div class="overline">Resultado</div><div class="quiz-score" aria-live="polite">' + s + '<small> de ' + qs.length + '</small></div><p class="quiz-msg">' + msg + '</p>' + marks + '</div>';
        var bw = el('div', ''); bw.style.padding = '0 16px 16px';
        var b = el('button', 'btn tinted', ic('reset', { size: 20 }) + 'Refazer o quiz'); b.type = 'button';
        b.addEventListener('click', function () { answers = []; save(); render(); });
        bw.appendChild(b); card.appendChild(bw);
        w.appendChild(card);
        return;
      }
      var q = qs[i];
      var top = el('div', 'quiz-top');
      top.innerHTML = progress(i) + '<div class="overline">Pergunta ' + (i + 1) + ' de ' + qs.length + '</div><p class="quiz-q" id="qq' + (++uid) + '">' + rich(q.q) + '</p>';
      card.appendChild(top);
      var opts = el('div', 'quiz-opts');
      opts.setAttribute('role', 'radiogroup');
      opts.setAttribute('aria-labelledby', top.querySelector('.quiz-q').id);
      var rows = arr(q.options).map(function (o, k) {
        var r = el('button', 'row pressable');
        r.type = 'button'; r.setAttribute('role', 'radio'); r.setAttribute('aria-checked', 'false');
        r.innerHTML = '<span class="quiz-mark"></span><div class="row-main"><div class="row-title">' + rich(o) + '</div></div>';
        r.addEventListener('click', function () { pick(k); });
        opts.appendChild(r);
        return r;
      });
      opts.style.setProperty('--sep-inset', '52px');
      card.appendChild(opts);
      w.appendChild(card);
      var picked = false;
      function pick(k) {
        if (picked) return; picked = true;
        var ok = k === +q.correct;
        rows.forEach(function (r, j) {
          r.disabled = true;
          r.classList.remove('pressable');
          r.setAttribute('aria-checked', j === k ? 'true' : 'false');
          if (j === +q.correct) { r.classList.add('correct'); r.querySelector('.quiz-mark').innerHTML = ic('check'); }
          else if (j === k) { r.classList.add('wrong'); r.querySelector('.quiz-mark').innerHTML = ic('xmark'); }
          else r.classList.add('dimmed');
        });
        answers.push(k); save();
        var last = answers.length >= qs.length;
        setTimeout(function () {
          openSheet(function (body, close) {
            body.innerHTML = '<div class="sheet-title ' + (ok ? 'ok' : 'no') + '">' + ic(ok ? 'check' : 'info', { stroke: 2.2 }) + '<span>' + (ok ? 'Isso mesmo' : 'Não exatamente') + '</span></div>' +
              (!ok ? '<p class="sheet-text"><strong>Resposta:</strong> ' + rich(q.options[+q.correct]) + '</p>' : '') +
              (q.explain ? '<p class="sheet-text">' + rich(q.explain) + '</p>' : '');
            var b = el('button', 'btn', last ? 'Ver resultado' : 'Próxima pergunta'); b.type = 'button';
            b.addEventListener('click', function () { close('next'); });
            body.appendChild(b);
          }, { label: ok ? 'Resposta certa' : 'Resposta errada', onClose: function () { render(); } });
        }, 260);
      }
    }
    render();
    return w;
  }

  /* ---------------------------------------------------------------- Ratio */
  function parseRatio(r) {
    if (typeof r === 'number') return r;
    var nums = String(r || '').replace(/,/g, '.').match(/\d+(?:\.\d+)?/g);
    if (!nums) return 2;
    // "1:2" -> 2, "1:1–1:1.5" -> 1.25
    var vals = [];
    for (var i = 0; i + 1 < nums.length; i += 2) vals.push(+nums[i + 1] / +nums[i]);
    if (!vals.length) return +nums[0];
    return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
  }
  function ratioCfg() {
    var r = (C().preparar || {}).ratio || {};
    return {
      presets: arr(r.presets).map(function (p) { return { id: p.id, name: p.name, ratio: parseRatio(p.ratio), note: p.note }; }),
      defaultDose: +r.defaultDose || 16, doseMin: +r.doseMin || 7, doseMax: +r.doseMax || 22,
      ratioMin: +r.ratioMin || 1, ratioMax: +r.ratioMax || 3,
      mlFactor: Array.isArray(r.mlFactor) ? r.mlFactor : [1.2, 1.5],
      scaleNote: r.scaleNote, mlNote: r.mlNote, note: r.note
    };
  }
  function ratioState() {
    var cfg = ratioCfg();
    var s = store.get('bambino.ratio', null) || {};
    var def = cfg.presets.filter(function (p) { return /normal|espresso/.test(p.id || ''); })[0] || cfg.presets[0];
    return {
      dose: clamp(+s.dose || cfg.defaultDose, cfg.doseMin, cfg.doseMax),
      ratio: clamp(+s.ratio || (def ? def.ratio : 2), cfg.ratioMin, cfg.ratioMax),
      preset: s.preset !== undefined ? s.preset : (def ? def.id : null)
    };
  }
  function ratioPage() {
    return {
      title: 'Calculadora de proporção', shortTitle: 'Proporção',
      build: function (ctx) {
        var cfg = ratioCfg();
        var st = ratioState();
        var f = [];
        var res = el('div', 'tool-card');
        res.innerHTML = '<div class="result-k">Bebida na xícara</div><div class="result-big" aria-live="polite"><span class="yv"></span><small>g</small></div>' +
          '<div class="result-sub"></div>' +
          '<div class="result-hint">' + ic('scale') + '<span class="ml"></span></div>';
        f.push(res);
        var yv = res.querySelector('.yv'), sub = res.querySelector('.result-sub'), ml = res.querySelector('.ml');

        // Preset cards: name + ratio, the selected one filled.
        var cards = [], presetNote = null;
        if (cfg.presets.length) {
          var pw = el('div', 'presets');
          pw.setAttribute('role', 'radiogroup'); pw.setAttribute('aria-label', 'Estilo');
          cfg.presets.forEach(function (p) {
            var c = el('button', 'preset-card'); c.type = 'button'; c.setAttribute('role', 'radio');
            c.innerHTML = '<span class="pc-n">' + esc(p.name) + '</span><span class="pc-r">1:' + fmt(p.ratio, p.ratio % 1 ? 1 : 0) + '</span>';
            c.addEventListener('click', function () { st.ratio = clamp(p.ratio, cfg.ratioMin, cfg.ratioMax); st.preset = p.id; rs.set(st.ratio); update(); });
            cards.push({ id: p.id, el: c }); pw.appendChild(c);
          });
          f.push(pw);
          presetNote = el('p', 'foot preset-note');
          f.push(presetNote);
        }

        // Dose card: label left, value + stepper right, slider below.
        var dCard = el('div', 'slider-card');
        var dTop = el('div', 'ctl-top', '<span class="ctl-label">Pó (dose)</span>');
        var dVal = el('span', 'ctl-val');
        var stp = stepper(function () { setDose(st.dose - 0.5); }, function () { setDose(st.dose + 0.5); }, 'Dose em gramas');
        var right = el('div', 'ctl-right');
        right.appendChild(dVal); right.appendChild(stp);
        dTop.appendChild(right);
        dCard.appendChild(dTop);
        var ds = slider({ min: cfg.doseMin, max: cfg.doseMax, step: 0.5, value: st.dose, label: 'Dose de pó', format: function (v) { return fmt(v, 1) + ' gramas'; }, onInput: function (v) { st.dose = v; update(); } });
        dCard.appendChild(ds);
        dCard.appendChild(el('div', 'slider-ends', '<span>' + fmt(cfg.doseMin) + '\u00a0g</span><span>' + fmt(cfg.doseMax) + '\u00a0g</span>'));
        f.push(dCard);

        // Ratio card
        var rCard = el('div', 'slider-card');
        var rTop = el('div', 'ctl-top', '<span class="ctl-label">Proporção</span>');
        var rVal = el('span', 'ctl-val'); rTop.appendChild(rVal);
        rCard.appendChild(rTop);
        var rs = slider({ min: cfg.ratioMin, max: cfg.ratioMax, step: 0.1, value: st.ratio, label: 'Proporção', format: function (v) { return '1 para ' + fmt(v, 1); }, onInput: function (v) {
          st.ratio = v;
          var match = cfg.presets.filter(function (p) { return Math.abs(p.ratio - v) < 0.05; })[0];
          st.preset = match ? match.id : null;
          update();
        } });
        rCard.appendChild(rs);
        rCard.appendChild(el('div', 'slider-ends', '<span>1:' + fmt(cfg.ratioMin, 0) + '</span><span>1:' + fmt(cfg.ratioMax, 0) + '</span>'));
        f.push(rCard);
        if (cfg.note) f.push(el('p', 'caption', rich(cfg.note)));
        if (!cfg.note) f.push(BLOCKS.callout({ tone: 'info', title: 'Pese, não meça em ml', text: cfg.scaleNote || 'Use uma balança de cozinha com precisão de <strong>0,1 g</strong>: coloque a xícara em cima, zere e pare o shot quando chegar no número. A crema ocupa volume, então mililitros enganam.' }));

        function setDose(v) { st.dose = clamp(Math.round(v * 2) / 2, cfg.doseMin, cfg.doseMax); ds.set(st.dose); update(); }
        function update() {
          var y = st.dose * st.ratio;
          yv.textContent = fmt(y, 0);
          sub.textContent = fmt(st.dose, st.dose % 1 ? 1 : 0) + '\u00a0g de pó × 1:' + fmt(st.ratio, 1);
          ml.innerHTML = cfg.mlNote ? rich(cfg.mlNote.replace('{min}', fmt(y * cfg.mlFactor[0])).replace('{max}', fmt(y * cfg.mlFactor[1]))) :
            '≈ ' + fmt(y * cfg.mlFactor[0]) + '–' + fmt(y * cfg.mlFactor[1]) + ' ml na xícara: a crema infla o volume. Conte pelo peso.';
          dVal.textContent = fmt(st.dose, 1) + '\u00a0g';
          rVal.textContent = '1:' + fmt(st.ratio, 1);
          stp.minus.disabled = st.dose <= cfg.doseMin; stp.plus.disabled = st.dose >= cfg.doseMax;
          cards.forEach(function (c) { c.el.setAttribute('aria-checked', c.id === st.preset ? 'true' : 'false'); });
          if (presetNote) {
            var p = cfg.presets.filter(function (x) { return x.id === st.preset; })[0];
            presetNote.innerHTML = p && p.note ? rich(p.note) : 'Proporção personalizada.';
          }
          store.set('bambino.ratio', st);
        }
        update();
        return frag(f);
      }
    };
  }

  /* ---------------------------------------------------------------- Timer */
  var shot = { running: false, finished: false, t0: 0, elapsed: 0, raf: 0, lock: null };
  function timerPage() {
    var tm = (C().preparar || {}).timer || {};
    var tmin = +tm.targetMin || 25, tmax = +tm.targetMax || 30;
    var scaleMax = Math.max(40, Math.ceil((tmax + 12) / 5) * 5);
    var def = {
      title: 'Cronômetro do shot', shortTitle: 'Cronômetro',
      build: function (ctx) {
        var f = [];
        var target = +store.get('bambino.timerTarget', 0) || 0;
        var band = (tmax - tmin) / scaleMax * 100, bandStart = tmin / scaleMax * 100;
        var face = el('div', 'timer-face');
        face.innerHTML = '<div class="timer-ring"><svg viewBox="0 0 100 100" aria-hidden="true">' +
          '<g transform="rotate(-90 50 50)">' +
          '<circle class="ring-track" cx="50" cy="50" r="45" pathLength="100"/>' +
          '<circle class="ring-band" cx="50" cy="50" r="45" pathLength="100" stroke-dasharray="' + band.toFixed(2) + ' 100" stroke-dashoffset="' + (-bandStart).toFixed(2) + '"/>' +
          '<circle class="ring-prog" cx="50" cy="50" r="45" pathLength="100" stroke-dasharray="0 100"/></g>' +
          '<line class="ring-target" x1="50" y1="2" x2="50" y2="10" transform="rotate(0 50 50)" hidden/></svg>' +
          '<div class="ring-center">' + ic('cup', { size: 26, cls: 'ring-cup' }) +
          '<div class="timer-digits" role="timer" aria-label="Tempo do shot"><span class="tv">0,0</span><small>s</small></div></div></div>' +
          '<div class="timer-status" aria-live="polite"></div>' +
          '<div class="timer-legend" aria-hidden="true"><i></i>Faixa de referência ' + tmin + '–' + tmax + '\u00a0s</div>';
        f.push(face);

        // Quick-select pills: choose a target time (marked on the ring) or none.
        var pills = el('div', 'pills');
        pills.setAttribute('role', 'radiogroup'); pills.setAttribute('aria-label', 'Alvo de tempo');
        var popts = [{ v: 0, l: 'Sem alvo' }, { v: tmin, l: tmin + '\u00a0s' }, { v: tmax, l: tmax + '\u00a0s' }];
        var pillEls = popts.map(function (o) {
          var b = el('button', 'pill', esc(o.l)); b.type = 'button'; b.setAttribute('role', 'radio');
          b.addEventListener('click', function () { target = o.v; store.set('bambino.timerTarget', target); lastZone = 'x'; paint(); });
          pills.appendChild(b); return b;
        });
        f.push(pills);

        function rb(cls, icon, label, big) {
          var b = el('button', 'rb ' + cls); b.type = 'button';
          b.innerHTML = '<span class="rb-c' + (big ? ' big' : '') + '">' + ic(icon, { size: big ? 34 : 26 }) + '</span><span class="rb-l">' + label + '</span>';
          return b;
        }
        var btns = el('div', 'timer-btns');
        var reset = rb('reset', 'reset', 'Zerar'), main = rb('start', 'play', 'Iniciar', true), stopB = rb('stop', 'stop', 'Parar');
        btns.appendChild(reset); btns.appendChild(main); btns.appendChild(stopB);
        f.push(btns);
        if (tm.note || !arr(tm.tips).length) f.push(BLOCKS.callout({ tone: 'info', text: tm.note || 'Com café já moído e cesto pressurizado, o tempo diz pouco: o cesto segura a pressão sozinho. Use a faixa de ' + tmin + '–' + tmax + ' s como referência e decida pelo peso na xícara e pelo sabor.' }));
        if (arr(tm.tips).length) {
          f.push(secH(tm.tipsTitle || 'Como usar'));
          var l = BLOCKS.list({ items: tm.tips });
          var pw = el('div', 'prose'); pw.appendChild(l); f.push(pw);
        }
        if (arr((C().preparar || {}).diagnostico).length) {
          f.push(el('div', 'spacer'));
          f.push(group([rowLink({ go: 'diagnostico', title: 'O shot saiu estranho?', sub: 'Abra o diagnóstico', lead: sq('wrench', 'terracotta') })], 'with-sq'));
        }
        var tv = face.querySelector('.tv'), status = face.querySelector('.timer-status'), prog = face.querySelector('.ring-prog'), tick = face.querySelector('.ring-target');
        var mainIc = main.querySelector('.rb-c'), mainL = main.querySelector('.rb-l');
        var lastZone = '';
        function zoneOf(s) { return s < tmin ? 'under' : s <= tmax ? 'in' : 'over'; }
        function elapsedNow() { return shot.running ? (performance.now() - shot.t0) / 1000 : shot.elapsed; }
        function paint() {
          var s = elapsedNow();
          tv.textContent = fmt(Math.floor(s * 10) / 10, 1);
          prog.setAttribute('stroke-dasharray', Math.min(100, s / scaleMax * 100).toFixed(2) + ' 100'); prog.style.opacity = s > 0 ? '1' : '0';
          var z = (shot.running || s > 0) ? zoneOf(s) : '';
          var hit = target && s >= target ? 1 : 0;
          var key = z + (shot.running ? 'r' : shot.finished ? 'f' : 'p') + hit;
          if (key !== lastZone) {
            lastZone = key;
            prog.setAttribute('class', 'ring-prog ' + z);
            status.className = 'timer-status ' + z;
            var txt = !z ? 'Toque em Iniciar ao apertar o botão da máquina' :
              z === 'under' ? (shot.running ? 'Abaixo de ' + tmin + ' s' : 'Parou antes de ' + tmin + ' s') :
                z === 'in' ? 'Dentro da faixa de ' + tmin + '–' + tmax + ' s' : 'Passou de ' + tmax + ' s';
            if (z && !shot.running && !shot.finished) txt = 'Pausado em ' + fmt(s, 1) + '\u00a0s';
            if (hit) txt += '. Alvo de ' + target + ' s atingido';
            status.textContent = txt;
          }
          if (target) { tick.removeAttribute('hidden'); tick.setAttribute('transform', 'rotate(' + (target / scaleMax * 360) + ' 50 50)'); } else tick.setAttribute('hidden', '');
          pillEls.forEach(function (b, i) { b.setAttribute('aria-checked', popts[i].v === target ? 'true' : 'false'); });
          main.className = 'rb ' + (shot.running ? 'pause' : 'start');
          mainIc.innerHTML = ic(shot.running ? 'pause' : 'play', { size: 34 });
          mainL.textContent = shot.running ? 'Pausar' : (s > 0 && !shot.finished ? 'Continuar' : 'Iniciar');
          main.setAttribute('aria-label', shot.running ? 'Pausar cronômetro' : (s > 0 && !shot.finished ? 'Continuar cronômetro' : 'Iniciar cronômetro'));
          reset.disabled = shot.running || s === 0;
          stopB.disabled = !(shot.running || (s > 0 && !shot.finished));
        }
        function loop() { paint(); if (shot.running) shot.raf = requestAnimationFrame(loop); }
        main.addEventListener('click', function () {
          if (shot.running) {
            shot.running = false; shot.elapsed = (performance.now() - shot.t0) / 1000;
            cancelAnimationFrame(shot.raf); releaseLock();
          } else {
            if (shot.finished) { shot.elapsed = 0; shot.finished = false; lastZone = 'x'; }
            shot.running = true; shot.t0 = performance.now() - shot.elapsed * 1000;
            requestLock(); loop();
          }
          paint();
        });
        stopB.addEventListener('click', function () {
          if (shot.running) { shot.running = false; shot.elapsed = (performance.now() - shot.t0) / 1000; cancelAnimationFrame(shot.raf); }
          releaseLock();
          shot.finished = shot.elapsed > 0;
          if (shot.finished) store.set('bambino.lastShot', Math.round(shot.elapsed * 10) / 10);
          paint();
        });
        reset.addEventListener('click', function () { shot.elapsed = 0; shot.finished = false; lastZone = 'x'; paint(); });
        def.repaint = function () { if (shot.running) loop(); else paint(); };
        paint();
        return frag(f);
      },
      onShow: function () { if (def.repaint) def.repaint(); }
    };
    return def;
  }
  function requestLock() {
    try {
      if ('wakeLock' in navigator && navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request('screen').then(function (l) { shot.lock = l; }, function () { /* silent */ });
      }
    } catch (e) { /* silent */ }
  }
  function releaseLock() { try { if (shot.lock) shot.lock.release(); } catch (e) { /* silent */ } shot.lock = null; }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && shot.running) requestLock(); });

  /* ---------------------------------------------------------------- Diagnosis */
  function diagListPage() {
    var p = C().preparar || {};
    return {
      title: p.diagnosticoTitle || 'Diagnóstico do espresso', shortTitle: 'Diagnóstico',
      subtitle: p.diagnosticoIntro,
      build: function (ctx) {
        var f = [];
        if (arr(p.diagnosticoBlocks).length) f.push(renderBlocks(p.diagnosticoBlocks, ctx));
        else f.push(BLOCKS.compass(p.compass || {}));
        f.push(secH('Como saiu o seu?'));
        f.push(group(arr(p.diagnostico).map(function (d) {
          return rowLink({ go: d.id, title: d.sintoma, sub: arr(d.sinais)[0] });
        })));
        return frag(f);
      }
    };
  }
  function diagPage(d) {
    return {
      title: d.sintoma, shortTitle: 'Diagnóstico',
      subtitle: d.resumo,
      build: function (ctx) {
        var f = [];
        if (arr(d.sinais).length) {
          f.push(secH('Sinais', true));
          f.push(group(arr(d.sinais).map(function (s) { var r = el('div', 'row'); r.innerHTML = '<div class="row-title">' + rich(s) + '</div>'; return r; })));
        }
        if (arr(d.causas).length) {
          f.push(secH('Causas prováveis', true));
          f.push(group(arr(d.causas).map(function (s) { var r = el('div', 'row'); r.innerHTML = '<div class="row-title">' + rich(s) + '</div>'; return r; })));
        }
        if (arr(d.ajustes).length) {
          f.push(secH('O que ajustar, nesta ordem', true));
          var s = BLOCKS.steps({ items: d.ajustes }); s.style.marginTop = '0'; f.push(s);
        }
        if (d.nota) f.push(BLOCKS.callout({ tone: 'tip', text: d.nota }));
        f.push(relatedList(d.related));
        return frag(f);
      }
    };
  }

  /* ================================================================ BOOT */
  var booted = false;
  function start() {
    app = document.getElementById('app');
    tabbar = document.getElementById('tabbar');
    var inner = el('div', 'tabbar-inner');
    inner.setAttribute('role', 'tablist');
    TABS.forEach(function (t) {
      stacks[t] = [];
      var s = el('div', 'stack off'); s.dataset.tab = t; s.setAttribute('role', 'tabpanel');
      app.appendChild(s);
      var b = el('button', 'tab'); b.type = 'button'; b.dataset.tab = t; b.setAttribute('role', 'tab');
      b.addEventListener('click', function () {
        if (busy) return;
        if (t === active) {
          var st = stacks[t];
          if (st.length > 1) { flags.internalBack = true; selectTab(t, true); }
          else st[0].scroller.scrollTo({ top: 0, behavior: mqReduce.matches ? 'auto' : 'smooth' });
        } else selectTab(t, false);
      });
      inner.appendChild(b);
    });
    tabbar.appendChild(inner);
    setupPress(); setupClicks(); setupSwipe();
    histMirror = [location.hash || '#/comecar'];
    if (!location.hash) { history.replaceState(null, '', '#/comecar'); histMirror = ['#/comecar']; }
    window.addEventListener('hashchange', onRoute);
    onRoute();
    booted = true;
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', function () { navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function () {}); });
    }
  }
  function ready() { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start(); }
  ready();
})();
