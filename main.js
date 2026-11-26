// Menus, "on this page" highlighting, bar animation, image zoom and table filters. No dependencies.
(function () {
  var nav = document.querySelector('.nav');

  // top menus: hover opens on desktop (CSS); click and keyboard work everywhere
  document.querySelectorAll('.menu-item').forEach(function (item) {
    var btn = item.querySelector('.menu-btn');
    if (!item.querySelector('.panel')) return;
    btn.addEventListener('click', function (e) {
      if (window.matchMedia('(hover: hover) and (min-width: 861px)').matches && btn.tagName === 'A') return;
      e.preventDefault();
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      document.querySelectorAll('.menu-item.open').forEach(function (o) { if (o !== item) o.classList.remove('open'); });
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.menu-item')) document.querySelectorAll('.menu-item.open').forEach(function (o) { o.classList.remove('open'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.menu-item.open').forEach(function (o) { o.classList.remove('open'); });
    closeZoom();
  });
  var burger = document.querySelector('.burger');
  if (burger) burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  // "on this page": highlight the section in view (sidebar + mobile chips)
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a, .toc-chips a'));
  var targets = [];
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1), el = document.getElementById(id);
    if (el && targets.indexOf(el) < 0) targets.push(el);
  });
  function spy() {
    var y = window.scrollY + window.innerHeight * 0.3, cur = null;
    targets.forEach(function (el) { if (el.getBoundingClientRect().top + window.scrollY <= y) cur = el; });
    if (!cur && targets.length) cur = targets[0];
    var id = cur ? cur.id : '';
    var parent = cur ? cur.getAttribute('data-parent') : '';
    links.forEach(function (a) {
      var h = a.getAttribute('href').slice(1);
      var on = h === id || (a.closest('.toc-chips') && h === (parent || id));
      a.classList.toggle('active', on);
      var bar = a.closest('.toc-chips');
      if (on && bar && bar.offsetParent) bar.scrollLeft = a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2;
    });
  }
  if (targets.length) { window.addEventListener('scroll', spy, { passive: true }); spy(); }

  // bars grow when they scroll into view
  var bars = Array.prototype.slice.call(document.querySelectorAll('.bars'));
  function grow() {
    var h = window.innerHeight;
    bars = bars.filter(function (b) {
      var r = b.getBoundingClientRect();
      if (r.top < h * 0.92 && r.bottom > 0) { b.classList.add('in'); return false; }
      return true;
    });
    if (!bars.length) window.removeEventListener('scroll', onScroll);
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; grow(); }); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  grow();

  // click an image to enlarge it
  var box = document.createElement('div');
  box.className = 'lightbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Enlarged image');
  box.innerHTML = '<figure><img alt=""><p></p></figure>';
  document.body.appendChild(box);
  function closeZoom() { box.classList.remove('on'); }
  box.addEventListener('click', closeZoom);
  document.querySelectorAll('.fig img').forEach(function (img) {
    img.addEventListener('click', function () {
      box.querySelector('img').src = img.currentSrc || img.src;
      box.querySelector('img').alt = img.alt;
      var cap = img.closest('figure').querySelector('figcaption');
      box.querySelector('p').textContent = cap ? cap.textContent : '';
      box.classList.add('on');
    });
  });

  // table filters (PIF summary)
  document.querySelectorAll('[data-filter-for]').forEach(function (seg) {
    var table = document.getElementById(seg.getAttribute('data-filter-for'));
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      seg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      var f = b.getAttribute('data-f');
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        tr.style.display = f === 'all' || tr.getAttribute('data-status') === f ? '' : 'none';
      });
    });
  });
})();
