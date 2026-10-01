// ========== Year + Last Updated (auto from file timestamp) ==========
document.getElementById('yr').textContent = new Date().getFullYear();
(function () {
  var el = document.getElementById('lastUpdated');
  if (!el) return;
  var d = new Date(document.lastModified);
  if (isNaN(d.getTime())) return;
  var opts = { year: 'numeric', month: 'short', day: 'numeric' };
  el.textContent = d.toLocaleDateString('en-US', opts);
  el.setAttribute('datetime', d.toISOString().slice(0, 10));
})();

// ========== Theme toggle (light/dark) ==========
(function () {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  var root = document.documentElement;
  function current() {
    return root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }
  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#0a0a0a' : '#f8f8f6');
  });
})();

// ========== Mobile nav ==========
var burger = document.getElementById('burger'), links = document.getElementById('links');
if (burger && links) {
  burger.addEventListener('click', function () { links.classList.toggle('open'); });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { links.classList.remove('open'); });
  });
}

// ========== Scroll progress bar ==========
var progress = document.getElementById('progress');
if (progress) {
  function onScroll() {
    var st = window.scrollY,
      h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (st / h * 100) : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ========== Reveal-on-scroll ==========
var io = new IntersectionObserver(function (es) {
  es.forEach(function (e) {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

// Timeline dot filling as job enters viewport
document.querySelectorAll('.job').forEach(function (el) {
  new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('is-in', e.isIntersecting); });
  }, { threshold: .4 }).observe(el);
});

// ========== Scroll-spy (improved) ==========
(function () {
  var navMap = {};
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#' && href.length > 1) navMap[href.slice(1)] = a;
  });
  var ids = Object.keys(navMap);
  if (!ids.length) return;
  var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  function setActive(id) {
    Object.keys(navMap).forEach(function (k) { navMap[k].classList.toggle('active', k === id); });
  }
  function onSpyScroll() {
    var y = window.scrollY + 120;
    var current = sections[0] && sections[0].id;
    sections.forEach(function (s) { if (s.offsetTop <= y) current = s.id; });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10) {
      current = sections[sections.length - 1].id;
    }
    if (current) setActive(current);
  }
  window.addEventListener('scroll', onSpyScroll, { passive: true });
  onSpyScroll();
})();

// ========== Interactive DAG tooltip ==========
(function () {
  var tooltip = document.getElementById('dagTooltip');
  if (!tooltip) return;
  var nodes = document.querySelectorAll('.dag-node');
  var wrap = tooltip.parentElement;
  function show(e, node) {
    var title = node.getAttribute('data-title') || '';
    var desc = node.getAttribute('data-desc') || '';
    tooltip.innerHTML = '<strong>' + title + '</strong>' + desc;
    tooltip.classList.add('show');
    var rect = wrap.getBoundingClientRect();
    var px = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    var py = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    var tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
    var x = Math.min(Math.max(px + 14, 10), rect.width - tw - 10);
    var y = Math.max(py - th - 14, 10);
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }
  function hide() { tooltip.classList.remove('show'); }
  nodes.forEach(function (n) {
    n.style.cursor = 'pointer';
    n.addEventListener('mouseenter', function (e) { n.classList.add('is-active'); show(e, n); });
    n.addEventListener('mousemove', function (e) { show(e, n); });
    n.addEventListener('mouseleave', function () { n.classList.remove('is-active'); hide(); });
    n.addEventListener('focus', function (e) { n.classList.add('is-active'); show({ clientX: n.getBoundingClientRect().left, clientY: n.getBoundingClientRect().top }, n); });
    n.addEventListener('blur', function () { n.classList.remove('is-active'); hide(); });
    n.setAttribute('tabindex', '0');
  });
})();

// ========== Chess.com live stat ==========
// Fetches ALL ratings/stats so you can decide which to show.
// To keep only a subset: edit the `labelMap` below (comment out lines you don't want).
(function () {
  var row = document.getElementById('chessRow');
  if (!row) return;
  var stat = document.getElementById('chessStat');
  var username = row.getAttribute('data-chess-user');
  var fallback = row.getAttribute('data-chess-fallback') || stat.textContent;
  if (!username) return;

  // Map Chess.com stats keys -> display label. Comment a line out to hide it.
  var labelMap = {
    chess_rapid: 'Rapid',
    chess_blitz: 'Blitz',
    chess_bullet: 'Bullet',
//    chess_daily: 'Daily',
//    chess960_daily: '960 Daily',
    tactics: 'Puzzles',
//    puzzle_rush: 'Puzzle Rush',
//    lessons: 'Lessons'
  };

  stat.classList.add('loading');
  stat.innerHTML = '<span class="chess-live loading"><span class="live-dot"></span>loading…</span>';

  fetch('https://api.chess.com/pub/player/' + encodeURIComponent(username) + '/stats', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(function (d) {
      var parts = [];
      Object.keys(labelMap).forEach(function (k) {
        var node = d[k];
        if (!node) return;
        var val = null;
        if (node.last && node.last.rating) val = node.last.rating;             // live games (rapid/blitz/bullet/daily)
        else if (node.highest && node.highest.rating) val = node.highest.rating; // tactics best
        else if (node.best && node.best.score) val = node.best.score;           // puzzle rush best score
        else if (node.highest && node.highest.score) val = node.highest.score;
        if (val) parts.push(labelMap[k] + ' ' + val);
      });

      if (!parts.length) { stat.textContent = fallback; stat.classList.remove('loading'); return; }

      // Log the full response so you can inspect every stat Chess.com returns.
      try { console.log('Chess.com stats for ' + username + ':', d); } catch (e) {}

      stat.innerHTML = '<span class="chess-live"><span class="live-dot"></span>' +
        parts.join(' · ') + ' ♟️</span>';
      stat.classList.remove('loading');
    })
    .catch(function (err) {
      try { console.warn('Chess.com fetch failed:', err); } catch (e) {}
      stat.textContent = fallback;
      stat.classList.remove('loading');
    });
})();
