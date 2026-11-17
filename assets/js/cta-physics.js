/* =========================================================
   CTA — tumpukan bentuk berbasis fisika (terinspirasi lusion.co)
   Bentuk diambil dari identitas EKSAD: kotak membulat (pola logo),
   bingkai kotak, gugus 2x2 kotak kecil, dan ikon logo EKSAD (huruf "E" dalam belah ketupat).
   Butuh Matter.js (dimuat dari cdnjs sebelum file ini).
   ========================================================= */
(function () {
  var stage = document.getElementById('cta');
  var canvas = stage && stage.querySelector('.cta-canvas');
  if (!stage || !canvas || !window.Matter) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var M = window.Matter, Engine = M.Engine, Bodies = M.Bodies, Composite = M.Composite, Body = M.Body;
  var ctx = canvas.getContext('2d');
  var engine = Engine.create({ gravity: { x: 0, y: 1 } });
  var world = engine.world;
  var W = 0, H = 0, DPR = 1, walls = [], shapes = [], started = false, running = false, raf = 0;
  var pointer = { x: -9999, y: -9999, active: false, vx: 0, vy: 0, rawX: 0, rawY: 0 };
  // pola ikon logo EKSAD (dibaca dari logo): "." = celah putih yang membentuk huruf E
  var E_GRID = ['#########', '#########', '##.###.##', '##.#.#.##', '##.#.#.##', '##.#.#.##', '###...###', '#########', '#########'];

  // palet: dominan abu kebiruan + navy, aksen warna brand EKSAD
  var MUTED = ['#c9d4e3', '#b4c3d7', '#9aacc4', '#7e91ad', '#d6dfeb'];
  var DARK = '#0d1b2e';
  var ACCENT = ['#1B5EAB', '#29B6E8', '#E8222E', '#5fd0f5', '#1B5EAB'];
  function pickColor() {
    var r = Math.random();
    if (r < 0.58) return MUTED[(Math.random() * MUTED.length) | 0];
    if (r < 0.78) return DARK;
    return ACCENT[(Math.random() * ACCENT.length) | 0];
  }

  function resize() {
    var r = stage.getBoundingClientRect();
    W = Math.round(r.width); H = Math.round(r.height);
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (walls.length) Composite.remove(world, walls);
    var t = 200;
    walls = [
      Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true }),          // lantai
      Bodies.rectangle(-t / 2, H / 2 - 600, t, H * 3, { isStatic: true }),       // dinding kiri
      Bodies.rectangle(W + t / 2, H / 2 - 600, t, H * 3, { isStatic: true })     // dinding kanan
    ];
    Composite.add(world, walls);
  }

  function baseSize() { return Math.max(16, Math.min(38, W / 44)); }

  function makeShape(x, y) {
    var s = baseSize() * (0.8 + Math.random() * 0.5);
    var r = Math.random(), type, body;
    var opts = { restitution: 0.3, friction: 0.3, frictionAir: 0.008, density: 0.0016, angle: Math.random() * Math.PI };
    if (r < 0.34) { type = 'square'; body = Bodies.rectangle(x, y, s, s, Object.assign({ chamfer: { radius: s * 0.2 } }, opts)); }
    else if (r < 0.54) { type = 'ring'; body = Bodies.rectangle(x, y, s, s, Object.assign({ chamfer: { radius: s * 0.22 } }, opts)); }
    else if (r < 0.74) { type = 'pixels'; body = Bodies.rectangle(x, y, s, s, Object.assign({ chamfer: { radius: s * 0.08 } }, opts)); }
    else { type = 'e'; s *= 1.25; opts.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.6; body = Bodies.rectangle(x, y, s, s, Object.assign({ chamfer: { radius: s * 0.04 } }, opts)); }
    body.plugin = { type: type, size: s, color: pickColor(), brand: type === 'e' && Math.random() < 0.6 };
    return body;
  }

  function spawn() {
    var n = W < 600 ? 60 : W < 1100 ? 110 : 170;
    var i = 0;
    var timer = setInterval(function () {
      if (i >= n) { clearInterval(timer); return; }
      var b = makeShape(W * 0.06 + Math.random() * W * 0.88, -60 - Math.random() * 220);
      shapes.push(b); Composite.add(world, b); i++;
    }, 22);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < shapes.length; i++) {
      var b = shapes[i], p = b.plugin, s = p.size, h = s / 2;
      ctx.save();
      ctx.translate(b.position.x, b.position.y);
      ctx.rotate(b.angle);
      ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
      if (p.type === 'square') {
        roundRect(-h, -h, s, s, s * 0.2); ctx.fill();
      } else if (p.type === 'ring') {
        var lw = s * 0.26;
        ctx.lineWidth = lw; roundRect(-h + lw / 2, -h + lw / 2, s - lw, s - lw, s * 0.16); ctx.stroke();
      } else if (p.type === 'pixels') {
        var g = s * 0.1, q = (s - g) / 2;
        roundRect(-h, -h, q, q, q * 0.18); ctx.fill();
        roundRect(-h + q + g, -h, q, q, q * 0.18); ctx.fill();
        roundRect(-h, -h + q + g, q, q, q * 0.18); ctx.fill();
        roundRect(-h + q + g, -h + q + g, q, q, q * 0.18); ctx.fill();
      } else {
        // ikon logo EKSAD: belah ketupat 9x9 kotak dengan celah membentuk huruf "E"
        var cell = s / 9, gap = cell * 0.16, k = cell - gap;
        if (p.brand) {
          var gr = ctx.createLinearGradient(-h, -h, h, h);
          gr.addColorStop(0, '#16B7E6'); gr.addColorStop(1, '#1B5EAB');
          ctx.fillStyle = gr;
        }
        ctx.beginPath();
        for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) {
          if (E_GRID[r].charAt(c) === '#') ctx.rect(-h + c * cell + gap / 2, -h + r * cell + gap / 2, k, k);
        }
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // kursor = "ombak": bentuk di sekitar kursor terangkat & terlempar searah sapuan, lalu jatuh lagi
  function wave() {
    // haluskan kecepatan kursor (px per frame)
    pointer.vx = pointer.vx * 0.75 + pointer.rawX * 0.25;
    pointer.vy = pointer.vy * 0.75 + pointer.rawY * 0.25;
    pointer.rawX = 0; pointer.rawY = 0;
    if (!pointer.active) return;
    var speed = Math.sqrt(pointer.vx * pointer.vx + pointer.vy * pointer.vy);
    var R = Math.max(150, baseSize() * 6.5);
    var energy = Math.min(speed / 14, 1);          // 0 = diam, 1 = sapuan cepat
    for (var i = 0; i < shapes.length; i++) {
      var b = shapes[i], dx = b.position.x - pointer.x, dy = b.position.y - pointer.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d > R || d < 0.1) continue;
      var t = 1 - d / R; t = t * t * (3 - 2 * t);    // smoothstep: kuat di tengah, halus di tepi
      var m = b.mass;
      var fx = ((dx / d) * 0.0016 + pointer.vx * 0.00045 * energy) * t * m;
      var fy = ((dy / d) * 0.0016 + pointer.vy * 0.00025 * energy - 0.0065 * energy) * t * m;
      Body.applyForce(b, b.position, { x: fx, y: fy });
      Body.setAngularVelocity(b, b.angularVelocity + (pointer.vx * 0.0009 * t * energy));
      // batasi kecepatan agar tetap terasa seperti ombak, bukan meledak
      var v = b.velocity, vs = Math.sqrt(v.x * v.x + v.y * v.y);
      if (vs > 22) Body.setVelocity(b, { x: v.x / vs * 22, y: v.y / vs * 22 });
    }
  }

  function loop() {
    wave();
    Engine.update(engine, 1000 / 60);
    draw();
    raf = requestAnimationFrame(loop);
  }
  function play() { if (!running) { running = true; raf = requestAnimationFrame(loop); } }
  function pause() { running = false; cancelAnimationFrame(raf); }

  stage.addEventListener('pointermove', function (e) {
    var r = stage.getBoundingClientRect();
    var nx = e.clientX - r.left, ny = e.clientY - r.top;
    if (pointer.active) { pointer.rawX += nx - pointer.x; pointer.rawY += ny - pointer.y; }
    pointer.x = nx; pointer.y = ny; pointer.active = true;
  });
  stage.addEventListener('pointerleave', function () { pointer.active = false; });

  resize();
  var rT; window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(resize, 150); });

  // mulai saat section terlihat, jeda saat tidak terlihat (hemat baterai)
  new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        if (!started) { started = true; spawn(); }
        play();
      } else pause();
    });
  }, { threshold: 0.2 }).observe(stage);
})();
