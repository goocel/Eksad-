(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!window.gsap;
  if (!hasGsap) document.documentElement.classList.add('no-gsap');
  var EASE_CSS = 'cubic-bezier(.65,0,.35,1)';   // ease-in-out lembut (geser carousel)

  // =========================================================
  // SUBHALAMAN — satu file HTML per menu (mis. services.html berisi Automotive + 6 produk).
  // Tiap halaman = <div class="svc-page" id="kunci" data-title="...">, hanya satu yang tampil.
  // Hash URL memilih halaman (#prodms) atau anchor di dalamnya (#prodms-modules).
  // Dijalankan paling awal agar fitur lain (reveal, observer) melihat halaman yang benar.
  // =========================================================
  var pages = Array.prototype.slice.call(document.querySelectorAll('.svc-page'));
  var pageHooks = [];        // dipanggil setiap kali halaman berganti
  var curPage = null;
  function showPage(target, scroll) {
    var page = target.classList.contains('svc-page') ? target : target.closest('.svc-page');
    if (!page) return false;
    var changed = page !== curPage;
    if (changed) {
      pages.forEach(function (p) { p.hidden = p !== page; });
      curPage = page;
      if (page.getAttribute('data-title')) document.title = page.getAttribute('data-title');
      document.querySelectorAll('.svc-drop a, .m-links a').forEach(function (a) {
        a.classList.toggle('is-current', a.hash === '#' + page.id && a.pathname === location.pathname);
      });
    }
    if (scroll) {
      if (target === page) window.scrollTo({ top: 0, behavior: 'instant' });
      else if (changed) target.scrollIntoView({ behavior: 'instant' });
    }
    if (changed) pageHooks.forEach(function (fn) { fn(page); });   // setelah scroll: posisi elemen sudah final
    return true;
  }
  if (pages.length) {
    var route = function () {
      var id = decodeURIComponent(location.hash.slice(1));
      var t = id && document.getElementById(id);
      if (!t) showPage(pages[0], !!curPage && curPage !== pages[0]);   // hash bukan elemen (mis. filter blog #training) -> halaman pertama
      else if (!showPage(t, true)) { if (!curPage) showPage(pages[0], false); }   // elemen di luar halaman (#cta) -> tetap
    };
    route();
    window.addEventListener('hashchange', route);
  }

  // =========================================================
  // HERO CAROUSEL — kartu seragam, kartu tengah (aktif) membesar
  // =========================================================
  var track = document.getElementById('heroTrack');
  if (track) {   // hanya di halaman yang punya hero carousel
  var car = track.parentElement;
  var ACTIVE = 2, INTERVAL = 3000, DUR = 1000, busy = false, paused = reduce, timer;
  var W, WA, G;

  // Ukuran kartu dihitung dari ruang carousel yang tersisa, agar hero selalu muat 1 layar.
  // Proporsi persis BCG (diukur pada layar ~1900px): kartu samping 18.5% lebar, kartu tengah 30.9%,
  // jarak 6.6%, semua kartu rasio 3:4 dan sejajar tengah vertikal. Di layar sempit (HP) kartu tengah diperlebar.
  function readVars() {
    var cw = car.clientWidth;
    if (cw < 600) {
      G = 10;
      WA = Math.round(cw * 0.62);
      W = Math.round(Math.max(40, (cw - 24 - WA - 2 * G) / 2));
    } else {
      W = Math.round(cw * 0.185);
      WA = Math.round(cw * 0.309);
      G = Math.round(cw * 0.066);
    }
    var h = Math.round(W * 4 / 3), ha = Math.round(WA * 4 / 3);
    car.style.setProperty('--ha', ha + 'px');
    car.style.setProperty('--h', h + 'px');
    car.style.setProperty('--wa', WA + 'px');
    car.style.setProperty('--w', W + 'px');
    car.style.setProperty('--gap', G + 'px');
  }
  function baseX() { return car.clientWidth / 2 - (ACTIVE * (W + G) + WA / 2); }
  function setActive(i) {
    Array.prototype.forEach.call(track.children, function (c, k) {
      c.classList.toggle('is-active', k === i);
      c.classList.toggle('is-near', k === i - 1 || k === i + 1);
      c.setAttribute('tabindex', k === i ? '0' : '-1');
    });
  }
  function place(x, animate) {
    track.style.transition = animate ? 'transform ' + DUR + 'ms ' + EASE_CSS : 'none';
    track.style.transform = 'translateX(' + x + 'px)';
  }
  function next() {
    if (busy) return; busy = true;
    setActive(ACTIVE + 1);
    place(baseX() - (W + G), true);
    setTimeout(function () {
      track.appendChild(track.children[0]);   // elemen aktif kini di index ACTIVE lagi
      place(baseX(), false);
      busy = false;
    }, DUR + 20);
  }
  function prev() {
    if (busy) return; busy = true;
    track.insertBefore(track.lastElementChild, track.children[0]);
    place(baseX() - (W + G), false);          // kompensasi agar tidak melompat
    void track.offsetWidth;
    setActive(ACTIVE);
    place(baseX(), true);
    setTimeout(function () { busy = false; }, DUR + 20);
  }
  function schedule() {
    clearInterval(timer);
    if (!paused) timer = setInterval(next, INTERVAL);
  }
  // atur ukuran tanpa animasi (saat load & resize), lalu aktifkan lagi transisinya
  function layout() {
    car.classList.add('is-init');
    readVars(); place(baseX(), false);
    requestAnimationFrame(function () { requestAnimationFrame(function () { car.classList.remove('is-init'); }); });
  }
  setActive(ACTIVE); layout();
  // hitung ulang bila ruang carousel berubah (resize, font selesai dimuat, dll.)
  var rT, lastH = car.clientHeight, lastW = car.clientWidth;
  function relayout() {
    if (car.clientHeight === lastH && car.clientWidth === lastW) return;
    lastH = car.clientHeight; lastW = car.clientWidth;
    clearTimeout(rT); rT = setTimeout(layout, 60);
  }
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(car);
  else window.addEventListener('resize', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { lastH = -1; relayout(); });
  // klik kartu samping = geser ke kartu itu; hover di carousel = jeda autoplay
  track.addEventListener('click', function (e) {
    var card = e.target.closest('.c-card');
    if (!card || card.classList.contains('is-active')) return;
    e.preventDefault();
    var i = Array.prototype.indexOf.call(track.children, card);
    if (i > ACTIVE) next(); else prev();
    schedule();
  });
  car.addEventListener('mouseenter', function () { clearInterval(timer); });
  car.addEventListener('mouseleave', schedule);
  schedule();

  }

  // ---------- PRODUCT SHOWCASE ----------
  // Daftar kiri mengganti panggung kanan (hover/klik/keyboard). Ganti otomatis tiap DUR detik,
  // garis berwarna di baris aktif = progres. Berhenti saat kursor di dalam showcase.
  // Bisa lebih dari satu per file (mis. modul ProDMS & Prohace di services.html); dibungkus fungsi
  // agar variabelnya (termasuk DUR) tidak menimpa variabel carousel.
  document.querySelectorAll('.px').forEach(function (px) {
    var pxRows = Array.prototype.slice.call(px.querySelectorAll('.px-row'));
    var pxPanels = Array.prototype.slice.call(px.querySelectorAll('.px-panel'));
    var pxCur = 0, pxTimer = null, pxBar = null, pxHover = false, pxSeen = false;
    var DUR = 5;                                          // detik per produk
    var redraw = function (panel) {
      var g = panel.querySelector('.p-glyph');
      if (!g) return;
      g.removeAttribute('data-drawn');
      void g.offsetWidth;                                   // paksa reflow agar transisi gambar ulang
      requestAnimationFrame(function () { g.setAttribute('data-drawn', 'true'); });
    };
    var runBar = function () {
      if (pxBar) pxBar.kill();
      pxRows.forEach(function (r) { r.querySelector('.px-bar').style.transform = 'scaleX(0)'; });
      if (!hasGsap || reduce || !pxSeen) return;
      var bar = pxRows[pxCur].querySelector('.px-bar');
      pxBar = gsap.fromTo(bar, { scaleX: 0 }, {
        scaleX: 1, duration: DUR, ease: 'none', paused: pxHover,
        onComplete: function () { pxShow((pxCur + 1) % pxRows.length); }
      });
    };
    var pxShow = function (i, focus) {
      if (i === pxCur) { runBar(); return; }
      var prev = pxPanels[pxCur], next = pxPanels[i];
      pxRows[pxCur].classList.remove('is-active'); pxRows[pxCur].setAttribute('aria-selected', 'false'); pxRows[pxCur].tabIndex = -1;
      pxRows[i].classList.add('is-active'); pxRows[i].setAttribute('aria-selected', 'true'); pxRows[i].tabIndex = 0;
      if (focus) pxRows[i].focus();
      pxCur = i;
      if (hasGsap && !reduce) {
        gsap.killTweensOf([prev, next, next.querySelectorAll('.px-art, .px-pcat, .px-title, .px-desc, .px-more')]);
        pxPanels.forEach(function (p) { if (p !== prev && p !== next) { p.hidden = true; p.classList.remove('is-active'); } });
        gsap.to(prev, { autoAlpha: 0, y: -16, duration: 0.3, ease: 'power2.in', onComplete: function () { prev.hidden = true; prev.classList.remove('is-active'); gsap.set(prev, { clearProps: 'all' }); } });
        next.hidden = false; next.classList.add('is-active');
        gsap.set(next, { autoAlpha: 1, y: 0 });
        gsap.fromTo(next.querySelector('.px-art'), { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.9, delay: 0.2, ease: 'expo.out' });
        gsap.fromTo(next.querySelectorAll('.px-pcat, .px-title, .px-desc, .px-more'), { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.28, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' });
      } else {
        prev.hidden = true; prev.classList.remove('is-active');
        next.hidden = false; next.classList.add('is-active');
      }
      redraw(next);
      runBar();
      // HP: geser baris tab agar tab aktif selalu terlihat (tanpa menggulir halaman)
      if (window.innerWidth <= 900) {
        var list = px.querySelector('.px-list'), li = pxRows[i].parentElement;
        if (list && li) list.scrollTo({ left: Math.max(0, li.offsetLeft - 20 - (list.firstElementChild ? list.firstElementChild.offsetLeft - 20 : 0)), behavior: reduce ? 'auto' : 'smooth' });
      }
    };
    pxRows.forEach(function (r, i) {
      r.tabIndex = i === 0 ? 0 : -1;
      r.addEventListener('click', function () { pxShow(i); });
      r.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) pxShow(i); });
      r.addEventListener('keydown', function (e) {
        var k = e.key, n = pxRows.length;
        if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); pxShow((pxCur + 1) % n, true); }
        else if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); pxShow((pxCur - 1 + n) % n, true); }
        else if (k === 'Home') { e.preventDefault(); pxShow(0, true); }
        else if (k === 'End') { e.preventDefault(); pxShow(n - 1, true); }
      });
    });
    // HP: geser panel ke kiri/kanan untuk pindah produk
    var stage = px.querySelector('.px-stage'), tx = null, ty = null;
    if (stage) {
      stage.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        if (tx === null) return;
        var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty, n = pxRows.length;
        tx = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) pxShow(dx < 0 ? (pxCur + 1) % n : (pxCur - 1 + n) % n);
      }, { passive: true });
    }
    px.addEventListener('mouseenter', function () { pxHover = true; if (pxBar) pxBar.pause(); });
    px.addEventListener('mouseleave', function () { pxHover = false; if (pxBar) pxBar.resume(); });
    // mulai siklus otomatis saat showcase terlihat; jeda saat keluar layar
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!pxSeen) { pxSeen = true; runBar(); } else if (pxBar && !pxHover) pxBar.resume(); }
        else if (pxBar) pxBar.pause();
      }, { threshold: 0.35 }).observe(px);
    }
  });

  // =========================================================
  // MENU LAYAR PENUH (layout BCG) + animasi orchestrated GSAP
  // Buka : panel berkembang dari pil kiri -> elemen atas & menu kiri muncul bergiliran (back.out memantul)
  // Tutup: urutan dibalik, easing halus (power2) & ~2x lebih cepat, panel menyusut kembali ke pil
  // =========================================================
  var hdr = document.querySelector('.hdr');
  var pill = document.getElementById('island');
  var menuBtn = document.getElementById('islandBtn');
  var closeBtn = document.getElementById('menuClose');
  var searchInput = document.getElementById('megaSearch');
  var mega = document.getElementById('menuPanel');
  var topEls = mega.querySelectorAll('.mega-top .m-anim');
  var groups = mega.querySelectorAll('.m-group');
  var tabs = mega.querySelectorAll('.m-tab');
  var panels = mega.querySelectorAll('.m-panel');
  var isOpen = false, tl, lastFocus;
  // cincin fokus hanya untuk pengguna keyboard (bukan setelah klik mouse)
  var kbd = false;
  document.addEventListener('keydown', function () { kbd = true; }, true);
  document.addEventListener('pointerdown', function () { kbd = false; }, true);

  function pillClip() {
    var r = pill.getBoundingClientRect();
    return 'inset(' + r.top + 'px ' + (window.innerWidth - r.right) + 'px ' + (window.innerHeight - r.bottom) + 'px ' + r.left + 'px round 34px)';
  }
  function activePanelEls() {
    var p = mega.querySelector('.m-panel.is-active');
    return p ? [p.querySelector('.m-head')].concat(Array.prototype.slice.call(p.querySelectorAll('.m-links li'))) : [];
  }

  function openMenu(focusSearch) {
    if (isOpen) return; isOpen = true;
    lastFocus = document.activeElement || lastFocus;
    menuBtn.setAttribute('aria-expanded', 'true');
    mega.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    var focusTarget = focusSearch ? searchInput : closeBtn;
    if (!hasGsap || reduce) { hdr.style.visibility = 'hidden'; focusTarget.focus(); return; }
    if (tl) tl.kill();
    tl = gsap.timeline({ onComplete: function () { focusTarget.focus({ preventScroll: true, focusVisible: kbd }); } })
      .set(mega, { clipPath: pillClip() })
      .to(hdr, { autoAlpha: 0, duration: 0.2 }, 0)
      .to(mega, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.8, ease: 'expo.out' }, 0)
      .fromTo(closeBtn, { rotate: -90, scale: 0.6 }, { rotate: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, 0.1)
      .fromTo(topEls, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'back.out(1.7)' }, 0.18)
      .fromTo('.mega-search', { scaleX: 0.7 }, { scaleX: 1, duration: 0.7, ease: 'back.out(1.4)' }, 0.22)
      .fromTo(groups, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'back.out(1.4)' }, 0.25)
      .fromTo(activePanelEls(), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.035, ease: 'back.out(1.3)' }, 0.35);
  }

  function closeMenu() {
    if (!isOpen) return; isOpen = false;
    menuBtn.setAttribute('aria-expanded', 'false');
    var finish = function () {
      mega.hidden = true;
      document.documentElement.style.overflow = '';
      hdr.style.visibility = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true, focusVisible: kbd });
    };
    if (!hasGsap || reduce) { finish(); return; }
    if (tl) tl.kill();
    tl = gsap.timeline({ onComplete: finish })
      .to(activePanelEls(), { autoAlpha: 0, y: -8, duration: 0.18, stagger: { each: 0.015, from: 'end' }, ease: 'power2.in' }, 0)
      .to(groups, { autoAlpha: 0, y: -10, duration: 0.2, stagger: { each: 0.025, from: 'end' }, ease: 'power2.in' }, 0.04)
      .to(topEls, { autoAlpha: 0, duration: 0.15, ease: 'power2.out' }, 0.08)
      .to(mega, { clipPath: pillClip(), duration: 0.45, ease: 'power2.inOut' }, 0.12)
      .to(hdr, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 0.42);
  }

  // ganti panel kanan (Industry / Products / Services / Blog)
  function showPanel(name) {
    var target = mega.querySelector('.m-panel[data-panel="' + name + '"]');
    if (!target || target.classList.contains('is-active')) return;
    tabs.forEach(function (t) { t.classList.toggle('is-active', t.dataset.panel === name); });
    panels.forEach(function (p) { p.classList.toggle('is-active', p === target); });
    if (hasGsap && !reduce) {
      gsap.fromTo(activePanelEls(), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.03, ease: 'back.out(1.3)', overwrite: true });
    }
  }
  var hoverable = window.matchMedia('(hover: hover) and (min-width: 901px)');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { showPanel(t.dataset.panel); });
    t.addEventListener('mouseenter', function () { if (hoverable.matches) showPanel(t.dataset.panel); });
  });

  menuBtn.addEventListener('click', function () { openMenu(false); });
  // =========================================================
  // DROPDOWN "OUR SERVICES" — gaya demo GSAP "Orchestrated easeReverse"
  // Buka : panel mengembang dari tombol (back.out memantul) -> item muncul bergiliran
  // Tutup: urutan dibalik, easing halus (power2) & ~2x lebih cepat
  // =========================================================
  var svcBtn = document.getElementById('svcBtn');
  var svcDrop = document.getElementById('svcDrop');
  var svcItems = svcDrop ? svcDrop.querySelectorAll('.svc-anim') : [];
  // animasi dipasang di .svc-inner (elemen yg diberi blur), bukan pembungkusnya:
  // clip-path/opacity pada pembungkus akan mematikan efek backdrop-filter (blur kaca)
  var svcPanel = svcDrop ? svcDrop.querySelector('.svc-inner') : null;
  var svcOpen = false, svcTl, svcHoverT;

  function svcStartClip() {
    // pil kecil di tepi atas panel, sejajar dengan tombol "Our Services"
    var d = svcDrop.getBoundingClientRect(), t = svcBtn.getBoundingClientRect();
    var l = Math.max(0, t.left - d.left - 12), r = Math.max(0, d.right - t.right - 12);
    return 'inset(0px ' + r + 'px ' + Math.max(0, d.height - 44) + 'px ' + l + 'px round 999px)';
  }
  function openSvc() {
    if (svcOpen || !svcDrop) return; svcOpen = true;
    clearTimeout(svcHoverT);
    svcBtn.setAttribute('aria-expanded', 'true');
    svcDrop.hidden = false;
    if (!hasGsap || reduce) return;
    if (svcTl) svcTl.kill();
    svcTl = gsap.timeline()
      .fromTo(svcPanel, { clipPath: svcStartClip(), y: -6, autoAlpha: 1 },
                       { clipPath: 'inset(0px 0px 0px 0px round 24px)', y: 0, duration: 0.75, ease: 'back.out(1.5)' }, 0)
      .fromTo(svcItems, { autoAlpha: 0, y: 16 },
                        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.025, ease: 'back.out(1.6)' }, 0.18);
  }
  function closeSvc() {
    if (!svcOpen || !svcDrop) return; svcOpen = false;
    svcBtn.setAttribute('aria-expanded', 'false');
    if (!hasGsap || reduce) { svcDrop.hidden = true; return; }
    if (svcTl) svcTl.kill();
    svcTl = gsap.timeline({ onComplete: function () { svcDrop.hidden = true; } })
      .to(svcItems, { autoAlpha: 0, y: -8, duration: 0.16, stagger: { each: 0.008, from: 'end' }, ease: 'power2.in' }, 0)
      .to(svcPanel, { clipPath: svcStartClip(), y: -6, duration: 0.36, ease: 'power2.inOut' }, 0.1)
      .to(svcPanel, { autoAlpha: 0, duration: 0.12 }, 0.36);
  }
  if (svcBtn && svcDrop) {
    var desktopHover = window.matchMedia('(hover: hover) and (min-width: 901px)');
    svcBtn.addEventListener('click', function () { svcOpen ? closeSvc() : openSvc(); });
    [svcBtn, svcDrop].forEach(function (el) {
      el.addEventListener('mouseenter', function () { if (desktopHover.matches) { clearTimeout(svcHoverT); openSvc(); } });
      el.addEventListener('mouseleave', function () { if (desktopHover.matches) svcHoverT = setTimeout(closeSvc, 220); });
    });
    svcDrop.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeSvc); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && svcOpen) { closeSvc(); svcBtn.focus(); } });
    document.addEventListener('pointerdown', function (e) { if (svcOpen && !svcDrop.contains(e.target) && !svcBtn.contains(e.target)) closeSvc(); });
    window.addEventListener('scroll', function () { if (svcOpen && window.scrollY > 400) closeSvc(); }, { passive: true });
  }

  // header gaya Nalar: status "scrolled" setelah 24px
  function onScrollHdr() { hdr.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScrollHdr, { passive: true });
  onScrollHdr();
  closeBtn.addEventListener('click', closeMenu);
  mega.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) closeMenu(); });

  // =========================================================
  // IKON PRODUK — digambar saat kartu terlihat (min. 60%), sekali saja (teknik ala Nalar)
  // =========================================================
  var glyphs = document.querySelectorAll('.p-glyph');
  if ('IntersectionObserver' in window && !reduce) {
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.setAttribute('data-drawn', 'true'); gio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    glyphs.forEach(function (g) { gio.observe(g); });
  } else {
    glyphs.forEach(function (g) { g.setAttribute('data-drawn', 'true'); });
  }

  // =========================================================
  // NILAI — proximity scale (gaya demo GSAP): item membesar sesuai jarak kursor
  // =========================================================
  var vField = document.getElementById('valueField');
  var vItems = vField ? vField.querySelectorAll('.v-item') : [];
  if (vField && hasGsap) {
    // gaya demo GSAP, skala diperkecil agar pas: radius 180px, skala maks 1.4x, durasi 0.35s
    var RADIUS = 180, MAX_SCALE = 1.4, DURATION = 0.35;
    var section = vField.closest('section') || vField;
    var scaleTo = function (el, s) {
      gsap.to(el, { scale: s, zIndex: Math.round(s * 10), duration: reduce ? 0.15 : DURATION, ease: 'power3.out', overwrite: 'auto', force3D: false });
    };
    section.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' || window.innerWidth <= 600) return;
      vItems.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        var t = Math.max(0, 1 - d / RADIUS);
        scaleTo(el, 1 + (MAX_SCALE - 1) * t * t * (3 - 2 * t));   // smoothstep: makin dekat makin besar
      });
    });
    section.addEventListener('pointerleave', function () { vItems.forEach(function (el) { scaleTo(el, 1); }); });
  }

  // =========================================================
  // SEGITIGA PENGHUBUNG NILAI — titik sudut mengikuti ikon (ikut melayang & membesar),
  // garis bergradien digambar lalu dihapus berulang (gaya demo GSAP "Draw a path")
  // =========================================================
  var vLinks = vField && vField.querySelector('.v-links');
  if (vLinks) {
    var vBase = vLinks.querySelector('.v-link-base'), vDraw = vLinks.querySelector('.v-link-draw');
    var vmC = vLinks.querySelectorAll('.vm-c'), vmL = vLinks.querySelectorAll('.vm-l');
    var updateLinks = function () {
      if (window.innerWidth <= 600) return;
      var f = vField.getBoundingClientRect(), pts = [];
      vItems.forEach(function (it, i) {
        var ic = it.querySelector('.v-icon').getBoundingClientRect();
        var lb = (it.querySelector('.v-text') || it.querySelector('.v-label')).getBoundingClientRect();
        var cx = ic.left + ic.width / 2 - f.left, cy = ic.top + ic.height / 2 - f.top;
        pts.push(cx.toFixed(1) + ' ' + cy.toFixed(1));
        // sembunyikan garis di sekitar ikon & label agar tidak menabrak
        vmC[i].setAttribute('cx', cx); vmC[i].setAttribute('cy', cy); vmC[i].setAttribute('r', ic.width * 0.62);
        var top = cy;  // area tersembunyi menyambung dari tengah ikon sampai bawah label
        vmL[i].setAttribute('x', lb.left - f.left - 10); vmL[i].setAttribute('y', top);
        vmL[i].setAttribute('width', lb.width + 20); vmL[i].setAttribute('height', lb.bottom - f.top + 4 - top);
      });
      var d = 'M' + pts[0] + ' L' + pts[1] + ' L' + pts[2] + ' Z';
      vBase.setAttribute('d', d); vDraw.setAttribute('d', d);
    };
    // orbit = lingkaran luar segitiga (melewati ketiga ikon), dihitung dari posisi tata letak (tanpa transform)
    var orbits = vField.querySelectorAll('.v-orbit');
    var placeOrbits = function () {
      if (!orbits.length || window.innerWidth <= 600 || vItems.length < 3) return;
      var p = Array.prototype.map.call(vItems, function (it) {
        var ic = it.querySelector('.v-icon');
        return [it.offsetLeft + ic.offsetLeft + ic.offsetWidth / 2, it.offsetTop + ic.offsetTop + ic.offsetHeight / 2];
      });
      var ax = p[0][0], ay = p[0][1], bx = p[1][0], by = p[1][1], cx = p[2][0], cy = p[2][1];
      var d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
      if (!d) return;
      var a2 = ax * ax + ay * ay, b2 = bx * bx + by * by, c2 = cx * cx + cy * cy;
      var ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d;
      var uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
      var R = Math.hypot(ax - ux, ay - uy);
      orbits.forEach(function (o, i) {
        var size = i === 0 ? R * 1.15 : R * 2;          // orbit-1 = cahaya lembut di tengah, orbit-2 = lintasan
        o.style.left = ux + 'px'; o.style.top = uy + 'px'; o.style.width = size + 'px';
      });
    };
    placeOrbits();
    updateLinks();
    window.addEventListener('resize', function () { placeOrbits(); updateLinks(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeOrbits);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateLinks);
    if (hasGsap) {
      // perbarui tiap frame hanya saat section terlihat (ikon melayang & membesar)
      var linksOn = false;
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !linksOn) { gsap.ticker.add(updateLinks); linksOn = true; }
        else if (!vis && linksOn) { gsap.ticker.remove(updateLinks); linksOn = false; }
      }).observe(vField);
      if (!reduce) {
        gsap.timeline({ repeat: -1, repeatDelay: 0.35 })
          .fromTo(vDraw, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut' })
          .to(vDraw, { strokeDashoffset: -1, duration: 2.4, ease: 'power2.inOut' }, '+=0.5');
      }
    } else { vDraw.style.strokeDashoffset = 0; }
  }

  // =========================================================
  // ABOUT BENTO REVEAL — ala kartu proyek Lusion
  // Kartu "membuka" dari inset membulat + naik, foto zoom-out, lalu teks menyusul.
  // Catatan: clip-path mematikan backdrop-filter anak, jadi dibersihkan setelah selesai.
  // =========================================================
  var bento = document.querySelector('#about .bento');
  if (bento && hasGsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    var cards = gsap.utils.toArray(bento.children);
    var intro = document.querySelectorAll('#about .sec-intro > *');
    var imgs = bento.querySelectorAll('.b-photo, .b-bg');
    var texts = cards.map(function (c) {
      return c.querySelectorAll(':scope > .kicker, :scope > h3, :scope > p, .b-overlay, .value-chips span');
    });

    gsap.set(intro, { y: 50, autoAlpha: 0 });
    gsap.set(cards, { y: 120, clipPath: 'inset(10% 8% 0% 8% round 40px)' });
    gsap.set(imgs, { scale: 1.35, transition: 'none' });
    texts.forEach(function (t) { gsap.set(t, { y: 40, autoAlpha: 0 }); });

    var tl = gsap.timeline({
      paused: true,
      onComplete: function () {
        gsap.set(cards, { clearProps: 'clipPath,transform' });
        gsap.set(imgs, { clearProps: 'transform,transition' });
      }
    });
    tl.to(intro, { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', stagger: 0.12 }, 0)
      .to(cards, { y: 0, clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.4, ease: 'expo.out', stagger: 0.14 }, 0.15)
      .to(imgs, { scale: 1.03, duration: 1.8, ease: 'expo.out', stagger: 0.14 }, 0.15);
    texts.forEach(function (t, i) {
      tl.to(t, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.55 + i * 0.14);
    });

    ScrollTrigger.create({ trigger: '#about', start: 'top 75%', once: true, onEnter: function () { tl.play(); } });
  }

  // =========================================================
  // REVEAL UMUM — elemen .reveal naik + muncul saat masuk layar (dipakai halaman dalam)
  // Elemen yang masuk bersamaan muncul bergiliran (stagger). Tanpa GSAP/JS: langsung terlihat.
  // =========================================================
  // Elemen di subhalaman yang tersembunyi baru dipasang saat halamannya tampil (pageHooks).
  function initReveal(root) {
    if (!(hasGsap && window.ScrollTrigger && !reduce)) return;
    var els = Array.prototype.filter.call(root.querySelectorAll('.reveal'), function (el) {
      return !el.hasAttribute('data-rv') && !el.closest('.svc-page[hidden]');
    });
    if (!els.length) return;
    els.forEach(function (el) { el.setAttribute('data-rv', ''); });
    gsap.registerPlugin(ScrollTrigger);
    // Yang sudah di layar langsung dianimasikan (ScrollTrigger yang dibuat setelah load tidak memanggil
    // onEnter untuk elemen yang sudah aktif); sisanya menunggu scroll.
    var limit = window.innerHeight * 0.88, now = [], later = [];
    els.forEach(function (el) { (el.getBoundingClientRect().top < limit ? now : later).push(el); });
    var show = function (batch) {
      gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12, overwrite: true, clearProps: 'transform' });
    };
    gsap.set(els, { y: 40, autoAlpha: 0 });
    if (now.length) show(now);
    if (later.length) ScrollTrigger.batch(later, { start: 'top 88%', once: true, onEnter: show });
  }
  // =========================================================
  // BLOG — filter kategori + kolom selang-seling turun (gaya BCG). Hash: blog.html#event / #training / #technology
  // Kolom ganjil (1 & 3) diberi .is-low; dihitung ulang tiap filter/resize karena jumlah kolom responsif.
  // =========================================================
  var blGrid = document.getElementById('blogGrid');
  if (blGrid) {
    var blCards = Array.prototype.slice.call(blGrid.querySelectorAll('.bl-card'));
    var blBtns = Array.prototype.slice.call(document.querySelectorAll('.bl-filter [data-cat]'));
    var blCats = blBtns.map(function (b) { return b.getAttribute('data-cat'); });
    var blSearch = document.getElementById('blogSearch'), blEmpty = document.getElementById('blogEmpty');
    var blCat = 'all', blQuery = '';
    // teks yang dicari per kartu: judul + kutipan + kategori + tanggal
    var blText = blCards.map(function (c) { return (c.textContent + ' ' + c.getAttribute('data-cat')).toLowerCase().replace(/\s+/g, ' '); });
    var blLayout = function () {
      var n = getComputedStyle(blGrid).gridTemplateColumns.split(' ').length, i = 0;
      blCards.forEach(function (c) {
        if (c.hidden) { c.classList.remove('is-low'); return; }
        var col = i % n; i++;
        c.classList.toggle('is-low', n > 1 && col % 2 === 0);
      });
    };
    var blApply = function (cat, animate) {
      if (cat == null) cat = blCat;
      if (blCats.indexOf(cat) < 0) cat = 'all';
      blCat = cat;
      blBtns.forEach(function (b) {
        var on = b.getAttribute('data-cat') === cat;
        b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var words = blQuery.split(' ').filter(Boolean), vis = [];
      blCards.forEach(function (c, k) {
        var inCat = cat === 'all' || (' ' + c.getAttribute('data-cat') + ' ').indexOf(' ' + cat + ' ') >= 0;
        var inQuery = words.every(function (w) { return blText[k].indexOf(w) >= 0; });
        c.hidden = !(inCat && inQuery);
        if (!c.hidden) vis.push(c);
      });
      if (blEmpty) blEmpty.hidden = vis.length > 0;
      blLayout();
      if (animate && hasGsap && !reduce) {
        vis.forEach(function (c) { c.setAttribute('data-rv', ''); });   // jangan dianimasikan ulang oleh reveal
        gsap.fromTo(vis, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out', overwrite: true, clearProps: 'transform' });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    blBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var cat = b.getAttribute('data-cat');
        history.replaceState(null, '', cat === 'all' ? location.pathname : '#' + cat);
        blApply(cat, true);
      });
    });
    window.addEventListener('hashchange', function () {
      var h = location.hash.slice(1);
      if (!h || blCats.indexOf(h) >= 0) blApply(h, true);   // abaikan hash halaman artikel (#coretax) agar filter tidak ter-reset
    });
    if (blSearch) {
      var blT;
      blSearch.addEventListener('input', function () {
        clearTimeout(blT);
        blT = setTimeout(function () { blQuery = blSearch.value.trim().toLowerCase(); blApply(null, true); }, 180);
      });
      blSearch.addEventListener('keydown', function (e) { if (e.key === 'Escape') { blSearch.value = ''; blQuery = ''; blApply(null, true); } });
    }
    var blRaf;
    window.addEventListener('resize', function () { cancelAnimationFrame(blRaf); blRaf = requestAnimationFrame(blLayout); });
    blApply(location.hash.slice(1), false);
  }

  // =========================================================
  // CAREER — filter tabel peran (cari nama + level), hitung jumlah, empty state (career.html)
  // =========================================================
  var carBox = document.getElementById('careerRoles');
  if (carBox) {
    var carForm = carBox.querySelector('.car-filters');
    var carRows = Array.prototype.slice.call(carBox.querySelectorAll('tr[data-role]'));
    var carEmpty = carBox.querySelector('.car-empty');
    var carCount = carBox.querySelector('.car-count');
    var carTable = carBox.querySelector('table');
    var carApply = function () {
      var q = carForm.q.value.trim().toLowerCase(), lv = carForm.level.value, n = 0;
      carRows.forEach(function (r) {
        var name = r.querySelector('th').textContent.toLowerCase();
        var level = r.querySelector('.car-tag').textContent.trim();
        var ok = (!q || name.indexOf(q) > -1) && (!lv || level === lv);
        r.hidden = !ok; if (ok) n++;
      });
      carEmpty.hidden = n > 0;
      carTable.hidden = n === 0;
      carCount.textContent = n + ' of ' + carRows.length + ' roles';
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    carForm.addEventListener('input', carApply);
    carForm.addEventListener('change', carApply);
    carForm.addEventListener('reset', function () { setTimeout(carApply, 0); });
    carApply();
  }

  // =========================================================
  // CONTACT — form kontak tanpa backend (contact.html): validasi Name + Email,
  // lalu buka aplikasi email ke info@eksad.com dengan pesan terisi.
  // =========================================================
  var ctForm = document.getElementById('contactForm');
  if (ctForm) {
    var ctCheck = function (input, ok) {
      var f = input.closest('.ct-field');
      f.classList.toggle('is-invalid', !ok);
      var err = f.querySelector('.ct-error'); if (err) err.hidden = ok;
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    ctForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var el = ctForm.elements, nm = el['name'], em = el['email'];
      var okName = ctCheck(nm, nm.value.trim() !== '');
      var okMail = ctCheck(em, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim()));
      if (!okName) { nm.focus(); return; }
      if (!okMail) { em.focus(); return; }
      var body = 'Name: ' + nm.value.trim() + '\nEmail: ' + em.value.trim() +
        (el['phone'].value.trim() ? '\nPhone: ' + el['phone'].value.trim() : '') +
        '\n\n' + el['message'].value.trim();
      location.href = 'mailto:info@eksad.com?subject=' + encodeURIComponent('Contact: ' + nm.value.trim()) +
        '&body=' + encodeURIComponent(body);
    });
    ctForm.addEventListener('input', function (e) {
      if (e.target.closest('.ct-field.is-invalid')) ctCheck(e.target, e.target.value.trim() !== '');
    });
  }

  // =========================================================
  // COUNT UP — angka [data-count] menghitung dari 0 saat terlihat (mis. "500+" di services.html#prodms).
  // Pakai IntersectionObserver supaya juga jalan di subhalaman yang awalnya hidden.
  // Atribut: data-count (angka akhir), data-suffix (mis. "+"), data-duration (ms, default 1800).
  // =========================================================
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var runCount = function (el) {
      var end = parseFloat(el.getAttribute('data-count')) || 0;
      var suf = el.getAttribute('data-suffix') || '';
      var dur = parseInt(el.getAttribute('data-duration'), 10) || 1800;
      el.textContent = Math.round(end).toLocaleString('en-US') + suf;   // ukur lebar angka akhir (frame yang sama, tidak terlihat)
      el.style.display = 'inline-block';
      el.style.minWidth = el.getBoundingClientRect().width + 'px';   // teks di sebelahnya tidak bergeser
      var t0 = null;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);                  // ease-out cubic
        el.textContent = Math.round(end * e).toLocaleString('en-US') + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        runCount(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) {
      el.textContent = '0' + (el.getAttribute('data-suffix') || '');
      cio.observe(el);
    });
  }

  // =========================================================
  // VIDEO POP UP — tombol [data-video="<id YouTube>"] membuka video di overlay layar penuh.
  // Iframe dibuat saat dibuka & dihapus saat ditutup (video berhenti). Tutup: tombol ×, klik latar, Esc.
  // Catatan: YouTube bisa menolak embed dari file:// (tanpa domain); di server/hosting berjalan normal.
  // =========================================================
  var vidBtns = document.querySelectorAll('[data-video]');
  if (vidBtns.length) {
    var vm = document.createElement('div');
    vm.className = 'vid-modal'; vm.hidden = true;
    vm.setAttribute('role', 'dialog'); vm.setAttribute('aria-modal', 'true'); vm.setAttribute('aria-label', 'Video');
    vm.innerHTML = '<button type="button" class="vid-close" aria-label="Tutup video"><svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true"><path d="M3 3l16 16M19 3L3 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
      '<div class="vid-frame"></div><a class="vid-yt" target="_blank" rel="noopener">Watch on YouTube ↗</a>';
    document.body.appendChild(vm);
    var vFrame = vm.querySelector('.vid-frame'), vClose = vm.querySelector('.vid-close'), vYt = vm.querySelector('.vid-yt');
    var vLast = null;
    var vOpen = function (id, btn) {
      vLast = btn;
      vFrame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1" title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
      vYt.href = 'https://www.youtube.com/watch?v=' + id;
      vm.hidden = false;
      document.documentElement.classList.add('vid-lock');
      if (hasGsap && !reduce) {
        gsap.fromTo(vm, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
        gsap.fromTo(vFrame, { scale: 0.92, y: 24 }, { scale: 1, y: 0, duration: 0.6, ease: 'expo.out' });
      }
      vClose.focus();
    };
    var vShut = function () {
      if (vm.hidden) return;
      var done = function () {
        vm.hidden = true; vFrame.innerHTML = '';
        document.documentElement.classList.remove('vid-lock');
        if (vLast) vLast.focus();
      };
      if (hasGsap && !reduce) gsap.to(vm, { autoAlpha: 0, duration: 0.25, ease: 'power2.in', onComplete: done });
      else done();
    };
    vidBtns.forEach(function (b) {
      b.addEventListener('click', function () { vOpen(b.getAttribute('data-video'), b); });
    });
    vClose.addEventListener('click', vShut);
    vm.addEventListener('click', function (e) { if (e.target === vm) vShut(); });
    document.addEventListener('keydown', function (e) {
      if (vm.hidden) return;
      if (e.key === 'Escape') vShut();
      if (e.key === 'Tab') {                               // fokus tetap di dalam pop up
        var f = [vClose, vFrame.querySelector('iframe'), vYt].filter(Boolean);
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey ? i <= 0 : i === f.length - 1) { e.preventDefault(); f[e.shiftKey ? f.length - 1 : 0].focus(); }
      }
    });
  }

  // =========================================================
  // CLOUD ORBIT — proximity scale logo cloud (sama seperti nilai di Home), services.html#procloud
  // =========================================================
  var coField = document.getElementById('cloudOrbit');
  if (coField && hasGsap) {
    var coItems = coField.querySelectorAll('.co-item');
    var coScale = function (el, s) { gsap.to(el, { scale: s, zIndex: Math.round(s * 10), duration: reduce ? 0.15 : 0.35, ease: 'power3.out', overwrite: 'auto', force3D: false }); };
    var coSec = coField.closest('section') || coField;
    coSec.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' || window.innerWidth <= 600) return;
      coItems.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var t = Math.max(0, 1 - Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) / 180);
        coScale(el, 1 + 0.4 * t * t * (3 - 2 * t));
      });
    });
    coSec.addEventListener('pointerleave', function () { coItems.forEach(function (el) { coScale(el, 1); }); });
  }

  // =========================================================
  // KUTIPAN BERANIMASI — [data-split]: kata naik dari balik mask satu per satu (expo.out),
  // lalu frasa <em class="sa-hl"> diberi garis bawah biru→cyan yang tergambar dari kiri.
  // Dipicu IntersectionObserver (aman di subhalaman hidden). Tanpa GSAP / reduced motion: teks statis.
  // =========================================================
  var splits = document.querySelectorAll('[data-split]');
  if (splits.length && hasGsap && !reduce && 'IntersectionObserver' in window) {
    var wrapWords = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var o = document.createElement('span'); o.className = 'sa-w';
            var i = document.createElement('span'); i.className = 'sa-i'; i.textContent = w;
            o.appendChild(i); frag.appendChild(o);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) wrapWords(n);
      });
    };
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        sio.unobserve(en.target);
        var el = en.target, words = el.querySelectorAll('.sa-i'), hl = el.querySelector('.sa-hl');
        var tl = gsap.timeline();
        tl.to(el, { '--qa': 1, duration: 0.6, ease: 'power2.out' }, 0)
          .to(words, { yPercent: 0, rotate: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out', stagger: 0.07 }, 0.1);
        if (hl) {
          tl.to(hl, { '--ul': 1, duration: 0.9, ease: 'power3.inOut' }, '-=0.6');
          tl.add(function () { saRoll(el, hl); });
        }
      });
    }, { threshold: 0.5 });
    // Setelah masuk: huruf frasa .sa-hl ber-rol naik/turun bergantian, looping (sama seperti judul CTA).
    // Mask = .sa-w (per kata); salinan huruf (::before/::after, ±1.5em) masuk menggantikan huruf yang keluar.
    var saRoll = function (el, hl) {
      var ins = [];
      hl.querySelectorAll('.sa-i').forEach(function (w) {
        gsap.set(w, { clearProps: 'transform' });
        var txt = w.textContent; w.textContent = '';
        Array.prototype.forEach.call(txt, function (c) {
          var s = document.createElement('span'); s.className = 'sa-c'; s.textContent = c; s.setAttribute('data-c', c);
          w.appendChild(s); ins.push(s);
        });
      });
      var busy = [], visible = true;
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(el);
      var roll = function (c, delay) {
        if (busy.indexOf(c) > -1) return;
        busy.push(c);
        var dist = (parseFloat(getComputedStyle(el).fontSize) || 40) * 1.5;
        var down = Math.random() < 0.6;
        gsap.to(c, {
          y: down ? dist : -dist, duration: 0.75, delay: delay || 0, ease: 'power3.inOut',
          onComplete: function () { gsap.set(c, { y: 0 }); busy.splice(busy.indexOf(c), 1); }
        });
      };
      var tick = function () {
        if (visible && !el.closest('.svc-page[hidden]')) {
          var r = Math.random();
          if (r < 0.2) {
            var start = Math.floor(Math.random() * ins.length), len = 3 + Math.floor(Math.random() * 3);
            for (var k = 0; k < len && start + k < ins.length; k++) roll(ins[start + k], k * 0.06);
          } else {
            var n = r < 0.5 ? 2 : 1;
            for (var j = 0; j < n; j++) roll(ins[Math.floor(Math.random() * ins.length)], j * 0.12);
          }
        }
        gsap.delayedCall(0.7 + Math.random() * 0.7, tick);
      };
      gsap.delayedCall(0.4, tick);
    };
    splits.forEach(function (el) {
      el.setAttribute('aria-label', el.textContent.trim());
      wrapWords(el);
      el.querySelectorAll('.sa-w').forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
      gsap.set(el.querySelectorAll('.sa-i'), { yPercent: 110, rotate: 4, autoAlpha: 0 });
      var hl = el.querySelector('.sa-hl'); if (hl) gsap.set(hl, { '--ul': 0 });
      gsap.set(el, { '--qa': 0 });
      sio.observe(el);
    });
  }

  initReveal(document);
  pageHooks.push(function (page) {
    initReveal(page);
    if (window.ScrollTrigger) ScrollTrigger.refresh();   // tinggi halaman berubah: hitung ulang (reveal, footer bounce)
  });

  // =========================================================
  // FLOW STEPS — alur bernomor (mis. Why DMS di automotive.html)
  // Loop: garis progres (.flow-prog, CSS flow-fill) kartu aktif terisi; saat selesai (animationend)
  // kartu berikutnya aktif, setelah kartu terakhir kembali ke kartu 1. Langkah sebelumnya = .is-done
  // (panahnya mengalir). Hover/klik/fokus memilih kartu; hover & keluar layar = jeda (.is-paused).
  // =========================================================
  document.querySelectorAll('.flow-steps').forEach(function (list) {
    var steps = Array.prototype.slice.call(list.querySelectorAll('.flow-step'));
    if (!steps.length) return;
    var cur = 0, hover = false, seen = !('IntersectionObserver' in window);
    var set = function (i) {
      cur = i;
      steps.forEach(function (s, k) {
        s.classList.toggle('is-active', k === i);
        s.classList.toggle('is-done', k < i);
      });
    };
    var sync = function () { list.classList.toggle('is-paused', reduce || hover || !seen); };
    steps.forEach(function (s, i) {
      var prog = s.querySelector('.flow-prog');
      if (!prog) { prog = document.createElement('span'); prog.className = 'flow-prog'; prog.setAttribute('aria-hidden', 'true'); s.appendChild(prog); }
      prog.addEventListener('animationend', function (e) {
        if (e.animationName === 'flow-fill' && cur === i) set((i + 1) % steps.length);
      });
      s.addEventListener('mouseenter', function () { if (cur !== i) set(i); });
      s.addEventListener('click', function () { if (cur !== i) set(i); });
      s.addEventListener('focus', function () { if (cur !== i) set(i); });
    });
    list.addEventListener('mouseenter', function () { hover = true; sync(); });
    list.addEventListener('mouseleave', function () { hover = false; sync(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        seen = en[0].isIntersecting; sync();
      }, { threshold: 0.4 }).observe(list);
    }
    set(0); sync();
  });

  // =========================================================
  // CTA HEADLINE — huruf naik dari balik mask per baris (ala CTA Lusion)
  // =========================================================
  var ctaTitle = document.querySelector('.cta-title');
  if (ctaTitle) {
    // pecah tiap baris menjadi span per huruf
    ctaTitle.querySelectorAll('.ln').forEach(function (ln) {
      var txt = ln.textContent; ln.textContent = '';
      Array.prototype.forEach.call(txt, function (c) {
        var s = document.createElement('span'); s.className = 'ch';
        var i = document.createElement('span'); i.className = 'ch-in'; i.textContent = c; i.setAttribute('data-c', c);
        s.appendChild(i); ln.appendChild(s);
      });
    });
    if (hasGsap && window.ScrollTrigger && !reduce) {
      gsap.registerPlugin(ScrollTrigger);
      var lines = ctaTitle.querySelectorAll('.ln');
      var side = document.querySelectorAll('.cta-kicker, .cta-btn');
      gsap.set(side, { y: 30, autoAlpha: 0 });
      var ctl = gsap.timeline({ paused: true, onComplete: function () { gsap.set(side, { clearProps: 'transform' }); } });

      // --- setelah masuk: huruf acak "rol" bergantian, looping (ala Lusion) ---
      // huruf turun/naik keluar dari mask-nya lalu digantikan salinan huruf yang sama
      var startWave = function () {
        var ins = Array.prototype.slice.call(ctaTitle.querySelectorAll('.ch-in'))
          .filter(function (c) { return c.textContent.trim(); });          // lewati spasi
        gsap.set(ins, { clearProps: 'transform' });
        var busy = [], visible = true;
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(ctaTitle);
        }
        var roll = function (el, delay) {
          if (busy.indexOf(el) > -1) return;
          busy.push(el);
          var dist = (parseFloat(getComputedStyle(ctaTitle).fontSize) || 100) * 2;   // = jarak salinan (2em, lihat .ch-in::before/::after)
          var down = Math.random() < 0.6;
          gsap.to(el, {
            y: down ? dist : -dist, duration: 0.75, delay: delay || 0, ease: 'power3.inOut',
            onComplete: function () { gsap.set(el, { y: 0 }); busy.splice(busy.indexOf(el), 1); }
          });
        };
        var tick = function () {
          if (visible) {
            var r = Math.random();
            if (r < 0.2) {
              // sesekali: beberapa huruf berurutan ikut ber-rol seperti gelombang kecil
              var start = Math.floor(Math.random() * ins.length), len = 3 + Math.floor(Math.random() * 3);
              for (var k = 0; k < len && start + k < ins.length; k++) roll(ins[start + k], k * 0.06);
            } else {
              var n = r < 0.5 ? 2 : 1;
              for (var j = 0; j < n; j++) roll(ins[Math.floor(Math.random() * ins.length)], j * 0.12);
            }
          }
          gsap.delayedCall(0.7 + Math.random() * 0.7, tick);
        };
        gsap.delayedCall(0.5, tick);
      };
      ctl.to(document.querySelector('.cta-kicker'), { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }, 0);
      ctl.to(document.querySelector('.cta-btn'), { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }, 0.15);
      ScrollTrigger.create({ trigger: '#cta', start: 'top 65%', once: true, onEnter: function () { ctl.play(); startWave(); } });
    }
  }

  // =========================================================
  // CLIENT LOGOS — 2 baris marquee ala Lusion
  // Tiap baris bergerak berlawanan arah dengan kecepatan yang di-lerp (halus).
  // Scroll memberi dorongan sesuai kecepatan scroll; hover memperlambat pelan-pelan.
  // =========================================================
  var mqRows = Array.prototype.slice.call(document.querySelectorAll('.mq-row'));
  if (mqRows.length && !reduce) {
    var BASE = 90;                       // px/detik saat diam
    var rows = mqRows.map(function (row) {
      var track = row.querySelector('.mq-track');
      var orig = Array.prototype.slice.call(track.children);
      return { row: row, track: track, orig: orig, dir: +row.dataset.dir || -1, x: 0, setW: 0, speed: BASE, hover: false };
    });
    // gandakan isi sampai cukup panjang untuk loop tanpa celah
    var build = function () {
      rows.forEach(function (r) {
        while (r.track.children.length > r.orig.length) r.track.removeChild(r.track.lastChild);
        r.setW = r.track.scrollWidth;
        if (!r.setW) return;
        var need = Math.ceil((r.row.clientWidth * 2) / r.setW);
        for (var i = 0; i < need; i++) {
          r.orig.forEach(function (li) {
            var c = li.cloneNode(true);
            c.setAttribute('aria-hidden', 'true');
            c.querySelector('img').alt = '';
            r.track.appendChild(c);
          });
        }
        r.x = r.x % r.setW;
      });
    };
    rows.forEach(function (r) {
      r.row.addEventListener('mouseenter', function () { r.hover = true; });
      r.row.addEventListener('mouseleave', function () { r.hover = false; });
    });
    var lastY = window.scrollY, vel = 0, last = performance.now(), visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { rootMargin: '200px' })
        .observe(mqRows[0].parentNode);
    }
    var tick = function (now) {
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      var y = window.scrollY, dy = y - lastY; lastY = y;
      // kecepatan scroll (px/detik), di-low-pass berat supaya langkah mouse wheel tidak tersentak
      var raw = dt ? Math.max(-3000, Math.min(3000, dy / dt)) : 0;
      vel += (raw - vel) * (1 - Math.exp(-dt / 0.3));
      var boost = vel * 0.5;
      if (visible) {
        rows.forEach(function (r) {
          if (!r.setW) return;
          var want = (r.hover ? BASE * 0.2 : BASE) + boost;
          r.speed += (want - r.speed) * (1 - Math.exp(-dt * 2.5));   // inersia halus
          r.x += r.dir * r.speed * dt;
          // bungkus ke rentang [-setW, 0)
          r.x = ((r.x % r.setW) - r.setW) % r.setW;
          r.track.style.transform = 'translate3d(' + r.x.toFixed(2) + 'px,0,0)';
        });
      }
      requestAnimationFrame(tick);
    };
    var start = function () {
      build();
      // baris kedua digeser setengah slot agar selang-seling
      rows.forEach(function (r, i) { if (i % 2 && r.setW) r.x = -(r.setW / r.orig.length) / 2; });
      requestAnimationFrame(function (t) { last = t; tick(t); }); };
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(build, 150); });
  }

  // =========================================================
  // FOOTER BOUNCE (GSAP ScrollTrigger + velocity)
  // Tepi atas footer melengkung sesuai kecepatan scroll, lalu memantul kembali rata (elastic).
  // =========================================================
  var wave = document.getElementById('fWavePath');
  var waveLine = document.getElementById('fWaveLine');
  var waveGap = document.getElementById('fWaveGap');   // isi celah cekung dengan warna section di atas footer
  // CTA hanya ada di Home; di halaman lain warna celah = latar section terakhir yang tampil (dihitung ulang per subhalaman).
  var syncGap = function () {
    if (!waveGap) return;
    var secs = Array.prototype.filter.call(document.querySelectorAll('main section'), function (s) {
      return s.offsetParent !== null && !s.parentElement.closest('section');
    });
    var last = secs[secs.length - 1], bg = 'rgb(255, 255, 255)';
    if (last) {
      var c = getComputedStyle(last).backgroundColor;
      if (c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)') bg = c;
    }
    waveGap.setAttribute('fill', bg);
  };
  syncGap();
  pageHooks.push(syncGap);
  if (wave && hasGsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    var bend = { c: 0 };            // + = melengkung ke atas, - = cekung ke bawah
    var MAX = 180;                  // batas lengkungan (unit viewBox, tinggi 200)
    var draw = function () {
      wave.setAttribute('d', 'M0 100 Q500 ' + (100 - bend.c) + ' 1000 100 L1000 200 L0 200 Z');
      if (waveLine) waveLine.setAttribute('d', 'M0 100 Q500 ' + (100 - bend.c) + ' 1000 100');
      if (waveGap) waveGap.setAttribute('d', 'M0 100 Q500 ' + (100 - bend.c) + ' 1000 100 Z');
    };
    var settle = function () {
      gsap.to(bend, { c: 0, duration: 1.6, ease: 'elastic.out(1.1, 0.25)', onUpdate: draw, overwrite: true });
    };
    ScrollTrigger.create({
      trigger: '.site-footer',
      start: 'top bottom',
      end: 'bottom bottom',
      onUpdate: function (self) {
        var v = self.getVelocity();                 // px/detik, + saat scroll ke bawah
        var target = gsap.utils.clamp(-MAX, MAX, -v / 12);
        gsap.to(bend, { c: target, duration: 0.25, ease: 'power3.out', onUpdate: draw, overwrite: true, onComplete: settle });
      },
      onLeave: settle,
      onLeaveBack: settle
    });
  }
})();
