(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero: static bed of grey arrows, SW → NE ----------
     Density comes from data-density on the canvas so per-page
     differences are deliberate and visible in the markup. */
  var canvas = document.getElementById('vectorCanvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    var GREY = '#b4bac1';
    var ANG = -Math.PI / 4;
    var DENSITY = parseFloat(canvas.getAttribute('data-density')) || 0.1;

    function arrow(x, y, ang, len, color, alpha, w, head) {
      var ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
      ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color;
      ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
      if (head) {
        var a1 = ang + Math.PI * 0.82, a2 = ang - Math.PI * 0.82;
        ctx.beginPath(); ctx.moveTo(ex, ey);
        ctx.lineTo(ex + Math.cos(a1) * head, ey + Math.sin(a1) * head);
        ctx.lineTo(ex + Math.cos(a2) * head, ey + Math.sin(a2) * head);
        ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function draw() {
      var r = canvas.getBoundingClientRect();
      var W = r.width, H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var gap = Math.max(72, Math.min(W, H) * DENSITY);
      var len = gap * 0.5;
      var head = Math.max(4, len * 0.26);
      var cols = Math.ceil(W / gap) + 2, rows = Math.ceil(H / gap) + 2;
      var offx = (W - (cols - 1) * gap) / 2;
      var offy = (H - (rows - 1) * gap) / 2;
      var hx = Math.cos(ANG) * len / 2, hy = Math.sin(ANG) * len / 2;
      for (var iy = 0; iy < rows; iy++) {
        for (var ix = 0; ix < cols; ix++) {
          var cx = offx + ix * gap, cy = offy + iy * gap;
          arrow(cx - hx, cy - hy, ANG, len, GREY, 0.5, 1.3, head);
        }
      }
    }
    draw();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(draw, 120); });
  }

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- Spine fill on view ---------- */
  var spine = document.querySelector('.spine');
  var fill = document.getElementById('spineFill');
  var shead = document.getElementById('spineHead');
  if (spine && fill && !reduce) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { fill.classList.add('go'); if (shead) shead.classList.add('go'); sio.unobserve(en.target); }
      });
    }, { threshold: 0.55 });
    sio.observe(spine);
  } else if (fill) { fill.classList.add('go'); if (shead) shead.classList.add('go'); }

  /* ---------- Animated chart fills: to data-target (% width) once in view ----------
     Discovered by selector, so a new chart on a future page needs no JS edit. */
  var charts = document.querySelectorAll('.barchart, .stackchart, .budget');
  if (charts.length) {
    var animateFills = function (root) {
      root.querySelectorAll('[data-target]').forEach(function (el) {
        var pct = parseFloat(el.getAttribute('data-target')) || 0;
        el.style.width = pct + '%';
      });
      root.querySelectorAll('.bval, .segval').forEach(function (v) { v.style.opacity = '1'; });
    };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateFills(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    charts.forEach(function (el) { reduce ? animateFills(el) : cio.observe(el); });
  }

  /* ---------- Bar CTA: fill with accent once the hero is out of view ---------- */
  var barCta = document.querySelector('.bar-cta');
  var heroEl = document.querySelector('.hero, .cs-hero');
  if (barCta && heroEl) {
    var hio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // hero no longer intersecting (scrolled past) -> solid CTA
        barCta.classList.toggle('is-solid', !en.isIntersecting);
      });
    }, { threshold: 0, rootMargin: '-64px 0px 0px 0px' });
    hio.observe(heroEl);
  }
})();
