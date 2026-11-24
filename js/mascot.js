/* =====================================================================
   MASCOT ENGINE  —  draws the mascot on a <canvas> with smooth shapes.
   ---------------------------------------------------------------------
   No images: each theme in js/themes.js has a `mascot.draw(k, st)`
   function that paints the character on a 100 x 100 stage (ground at
   y = 90) using the little drawing "kit" below:

     k.shape(svgPath, fill)          any SVG path string, outlined
     k.ellipse(cx, cy, rx, ry, fill) k.circle(cx, cy, r, fill)
     k.line(svgPath, colour, width)  k.thick(svgPath, colour, width)
     k.eye(cx, cy, r, st, {iris, pupil, full, slit})
     k.blush(x, y, r)                k.rotate(px, py, angle, fn)

   `st` tells the drawing how the mascot feels right now:
     st.eyes  'open' | 'closed' | 'happy'      st.look {x, y}
     st.flap  0..1 (wings/arms up when cheering) st.mood, st.t

   const m = Mascot.create(canvasElement, { static: false });
   m.setTheme(THEMES.greek);   m.setStage(1..5);   m.setWorn(['crown']);
   m.setMood('idle' | 'sleepy' | 'hopeful');
   m.cheer();   m.celebrate();   m.poke();

   Stages:  1 sprout (small, in a nest, with a leaf)   2 young (bigger)
            3 grown   4 bright (orbiting sparkles)     5 radiant (sun rays)
   prefers-reduced-motion: no bobbing or jumping; effects become still frames.
   ===================================================================== */

const Mascot = (function () {
  'use strict';

  const TAU = Math.PI * 2;
  const GROUND = 90;
  const SCALE = [0, 0.72, 0.86, 1, 1, 1];
  const ACCESSORY_ORDER = ['crown', 'garland', 'flower', 'brush', 'book', 'star'];
  const SLOTS = { crown: 'head', garland: 'neck', flower: 'side', brush: 'hand', book: 'hand', star: 'chest' };

  const prefersReduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the drawing kit handed to each theme ---------- */
  function makeKit(ctx) {
    const k = {
      outline: '#222',
      lw: 2.2,
      shape(d, fill, o = {}) {
        const p = typeof d === 'string' ? new Path2D(d) : d;
        if (fill) { ctx.fillStyle = fill; ctx.fill(p); }
        if (o.stroke !== false) { ctx.lineWidth = o.lw || k.lw; ctx.strokeStyle = o.strokeColor || k.outline; ctx.stroke(p); }
      },
      ellipse(cx, cy, rx, ry, fill, o = {}) {
        const p = new Path2D();
        p.ellipse(cx, cy, rx, ry, o.rot || 0, 0, TAU);
        k.shape(p, fill, o);
      },
      circle(cx, cy, r, fill, o) { k.ellipse(cx, cy, r, r, fill, o); },
      line(d, color, w = k.lw) { ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke(new Path2D(d)); },
      thick(d, color, w) { k.line(d, k.outline, w + k.lw * 2); k.line(d, color, w); },   // an outlined "tube"
      blush(x, y, r, color = 'rgba(255,120,140,0.42)') {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.ellipse(x, y, r * 1.35, r * 0.8, 0, 0, TAU); ctx.fill();
      },
      rotate(px, py, a, fn) {
        ctx.save(); ctx.translate(px, py); ctx.rotate(a); ctx.translate(-px, -py); fn(); ctx.restore();
      },
      /* Big shiny cartoon eyes: most of the personality lives here. */
      eye(cx, cy, r, st, o = {}) {
        if (st.eyes === 'closed') { k.line(`M${cx - r} ${cy} Q${cx} ${cy + r * 0.75} ${cx + r} ${cy}`, k.outline, k.lw * 1.1); return; }
        if (st.eyes === 'happy') { k.line(`M${cx - r} ${cy + r * 0.35} Q${cx} ${cy - r * 0.95} ${cx + r} ${cy + r * 0.35}`, k.outline, k.lw * 1.2); return; }
        const lx = st.look.x * r * 0.28, ly = st.look.y * r * 0.28;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
        ctx.fillStyle = o.full ? o.iris : (o.sclera || '#ffffff');
        ctx.fill();
        ctx.clip();
        if (!o.full) { ctx.fillStyle = o.iris || '#4a3b2a'; ctx.beginPath(); ctx.arc(cx + lx, cy + ly, r * 0.66, 0, TAU); ctx.fill(); }
        ctx.fillStyle = o.pupil || '#111';
        ctx.beginPath();
        if (o.slit) ctx.ellipse(cx + lx, cy + ly, r * 0.2, r * 0.62, 0, 0, TAU);
        else ctx.arc(cx + lx, cy + ly, r * 0.36, 0, TAU);
        ctx.fill();
        const big = st.mood === 'hopeful' ? 1.45 : 1;     // sparklier eyes when hopeful
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(cx + lx - r * 0.3, cy + ly - r * 0.32, r * 0.24 * big, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + lx + r * 0.24, cy + ly + r * 0.26, r * 0.11, 0, TAU); ctx.fill();
        ctx.restore();
        ctx.lineWidth = k.lw * 0.85; ctx.strokeStyle = k.outline;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
      }
    };
    return k;
  }

  function starPath(x, y, R, r, points = 5) {
    let d = '';
    for (let i = 0; i < points * 2; i++) {
      const rad = i % 2 ? r : R, a = -Math.PI / 2 + (i * Math.PI) / points;
      d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rad).toFixed(2)} ${(y + Math.sin(a) * rad).toFixed(2)} `;
    }
    return d + 'Z';
  }
  const sparklePath = (x, y, s) => `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`;
  const heartPath = (x, y, s) => `M${x} ${y + s * 0.9} C${x - s * 1.6} ${y - s * 0.1} ${x - s * 0.9} ${y - s * 1.3} ${x} ${y - s * 0.45} C${x + s * 0.9} ${y - s * 1.3} ${x + s * 1.6} ${y - s * 0.1} ${x} ${y + s * 0.9} Z`;

  /* ---------- accessories (centred on the theme's anchor points) ---------- */
  function drawAccessory(k, name, x, y, c) {
    const a = c.a || '#d4a531', b = c.b || '#ffffff';
    if (name === 'crown') {
      if (c.style === 'wreath') {                         // laurel wreath around the head
        for (let i = 0; i <= 8; i++) {
          const ang = Math.PI * (1.12 + (0.76 * i) / 8);
          const px = x + Math.cos(ang) * 13, py = y + 11 + Math.sin(ang) * 13;
          k.ellipse(px, py, 3.8, 1.8, a, { rot: ang + Math.PI / 2 + (i % 2 ? 0.55 : -0.55), lw: 1 });
          if (i % 3 === 1) k.circle(px + Math.cos(ang) * 2.5, py + Math.sin(ang) * 2.5, 1.2, b, { lw: 0.8 });
        }
      } else {
        k.shape(`M${x - 11} ${y + 4} L${x - 11} ${y - 5} L${x - 5.5} ${y} L${x} ${y - 8} L${x + 5.5} ${y} L${x + 11} ${y - 5} L${x + 11} ${y + 4} Z`, a, { lw: 1.6 });
        k.circle(x, y + 1, 2.1, b, { lw: 1 });
        k.circle(x - 11, y - 5.5, 1.2, b, { lw: 0.8 });
        k.circle(x + 11, y - 5.5, 1.2, b, { lw: 0.8 });
      }
    } else if (name === 'garland') {
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        k.circle(x - 14 + 28 * t, y + Math.sin(Math.PI * t) * 7, 2.7, i % 2 ? b : a, { lw: 1 });
      }
    } else if (name === 'flower') {
      for (let i = 0; i < 5; i++) {
        const ang = (i * TAU) / 5 - Math.PI / 2;
        k.circle(x + Math.cos(ang) * 3.3, y + Math.sin(ang) * 3.3, 2.8, a, { lw: 1 });
      }
      k.circle(x, y, 2, b, { lw: 1 });
    } else if (name === 'brush') {
      k.thick(`M${x} ${y} L${x + 9} ${y - 14}`, '#9a6a3a', 2);
      k.thick(`M${x - 0.6} ${y + 1} L${x + 1.2} ${y - 1.8}`, '#d6d6d6', 2.6);
      k.shape(`M${x - 1.5} ${y + 0.8} Q${x - 6} ${y + 6} ${x - 5} ${y + 9} Q${x + 1} ${y + 6} ${x + 1.6} ${y + 2} Z`, c.tip || '#e05a47', { lw: 1.2 });
    } else if (name === 'book') {
      k.shape(`M${x - 8} ${y - 6} H${x + 8} V${y + 6} H${x - 8} Z`, a, { lw: 1.5 });
      k.shape(`M${x - 6} ${y - 4.5} H${x + 6} V${y + 4.5} H${x - 6} Z`, b, { lw: 0.8 });
      k.line(`M${x} ${y - 4.5} V${y + 4.5} M${x - 4.5} ${y - 2} H${x - 1.5} M${x + 1.5} ${y - 2} H${x + 4.5}`, k.outline, 0.8);
    } else if (name === 'star') {
      k.shape(starPath(x, y, 5.8, 2.6), a, { lw: 1.3 });
      k.circle(x - 1.2, y - 1.2, 0.9, b, { stroke: false });
    }
  }

  function create(canvas, opts = {}) {
    const ctx = canvas.getContext('2d');
    const k = makeKit(ctx);
    let theme = null, stage = 1, worn = [], mood = 'idle';
    let action = null;              // { type: 'cheer'|'celebrate', start, dur }
    let still = false;              // reduced-motion "effect" frame
    let particles = [];
    let raf = null, lastT = 0, visible = true;
    let nextBlink = 0, blinkUntil = 0, nextZ = 0, nextHeart = 0;
    let W = 0;
    const isStatic = !!opts.static;

    const now = () => performance.now() / 1000;
    const animated = () => !isStatic && !prefersReduced();

    /* ---------- sizing (crisp on retina screens) ---------- */
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const css = canvas.clientWidth || opts.size || 140;
      const w = Math.max(48, Math.round(css * dpr));
      if (w !== W) { canvas.width = canvas.height = w; W = w; }
      draw(now());
    }

    /* ---------- main draw ---------- */
    function draw(t) {
      if (!theme || !W) return;
      const m = theme.mascot;
      const anim = animated();
      const gold = (theme.day && theme.day.gold) || '#e2bf55';
      k.outline = m.outline || '#222';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, W);
      ctx.setTransform(W / 100, 0, 0, W / 100, 0, 0);   // work on a 100 x 100 stage
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // ---- motion & expression ----
      let jump = 0, flap = 0;
      const breathe = anim ? Math.sin((t * TAU) / (mood === 'sleepy' ? 3.6 : 2.4)) : 0;
      if (anim && action) {
        const p = (t - action.start) / action.dur;
        if (p >= 1) action = null;
        else if (action.type === 'cheer') { jump = Math.sin(Math.PI * p) * 10; flap = Math.sin(Math.PI * p); }
        else { jump = Math.sin(Math.PI * ((p * 3) % 1)) * 12; flap = Math.abs(Math.sin(Math.PI * p * 6)); }
      } else if (anim && mood === 'hopeful') {
        const ph = (t % 2.6) / 2.6;
        if (ph < 0.2) jump = Math.sin((Math.PI * ph) / 0.2) * 4;
      }
      if (still) flap = 0.7;
      let eyes = 'open';
      if (mood === 'sleepy') eyes = 'closed';
      else if (action || still) eyes = 'happy';
      else if (anim && t < blinkUntil) eyes = 'closed';
      const look = mood === 'hopeful' ? { x: 0, y: -1 }
        : mood === 'sleepy' ? { x: 0, y: 0.5 }
        : { x: anim ? Math.sin(t * 0.55) * 0.9 : 0, y: 0 };
      const st = { t, mood, eyes, look, flap, stage };

      // ---- soft glow behind ----
      const grad = ctx.createRadialGradient(50, 58, 4, 50, 58, 50);
      grad.addColorStop(0, m.glow);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 100, 100);

      // ---- stage 5: slowly turning sun rays ----
      if (stage >= 5) {
        ctx.save();
        ctx.translate(50, 56);
        ctx.rotate(anim ? t * 0.15 : 0);
        ctx.fillStyle = gold;
        ctx.globalAlpha = 0.22;
        for (let i = 0; i < 12; i++) {
          ctx.rotate(Math.PI / 6);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, -50); ctx.lineTo(-5, -50); ctx.fill();
        }
        ctx.restore();
      }

      // ---- ground shadow (shrinks when jumping) ----
      const s = SCALE[stage];
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.beginPath();
      ctx.ellipse(50, GROUND + 1.5, 26 * s * (1 - Math.min(0.45, jump / 30)), 3.2 * s, 0, 0, TAU);
      ctx.fill();

      // ---- the character (scaled by stage, breathing gently) ----
      ctx.save();
      ctx.translate(50, GROUND - jump);
      ctx.scale(s * (1 - breathe * 0.008), s * (1 + breathe * 0.014));
      ctx.translate(-50, -GROUND);
      m.draw(k, st, ctx);

      if (stage === 1) {   // a little nest and a sprout leaf
        const [hx, hy] = m.anchors.head;
        k.line(`M${hx} ${hy + 3} Q${hx + 1} ${hy - 2} ${hx} ${hy - 5}`, '#3f7a35', 1.6);
        k.ellipse(hx - 3, hy - 5.5, 3.6, 1.8, '#6cbf55', { rot: 0.5, lw: 1 });
        k.ellipse(hx + 3.2, hy - 6.5, 3.6, 1.8, '#86d16b', { rot: -0.5, lw: 1 });
        k.shape('M18 83 Q50 101 82 83 L77 93 Q50 104 23 93 Z', '#8a5a32', { lw: 1.8 });
        k.line('M25 87 Q40 92 52 89 M48 92 Q62 93 75 87 M30 91 Q38 96 46 95', '#c08a50', 1.3);
      }

      ACCESSORY_ORDER.forEach(name => {
        if (!worn.includes(name)) return;
        const anchor = m.anchors[SLOTS[name]];
        if (!anchor) return;
        let [ax, ay] = anchor;
        if (name === 'book' && worn.includes('brush')) { ax += 4; ay += 9; }   // they share the "hand" spot
        const colors = Object.assign({}, (theme.accessoryColors || {})[name] || {});
        drawAccessory(k, name, ax, ay, colors);
      });
      ctx.restore();

      // ---- stage 4+: orbiting sparkles ----
      if (stage >= 4) {
        for (let i = 0; i < 3; i++) {
          const a = (anim ? t * 0.9 : 0.6) + i * (TAU / 3);
          k.shape(sparklePath(50 + Math.cos(a) * 38, 56 + Math.sin(a) * 26, 3.2), gold, { stroke: false });
        }
      }

      // ---- particles ----
      particles.forEach(pt => {
        ctx.globalAlpha = Math.max(0, Math.min(1, (pt.life / pt.max) * 1.5));
        if (pt.kind === 'spark') k.shape(sparklePath(pt.x, pt.y, pt.s), pt.color, { stroke: false });
        else if (pt.kind === 'confetti') {
          ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.rot); ctx.fillStyle = pt.color; ctx.fillRect(-1.2, -2, 2.4, 4); ctx.restore();
        } else if (pt.kind === 'z') {
          ctx.fillStyle = pt.color;
          ctx.font = `800 ${pt.s}px 'Nunito', system-ui, sans-serif`;
          ctx.fillText('z', pt.x, pt.y);
        } else if (pt.kind === 'heart') k.shape(heartPath(pt.x, pt.y, pt.s), pt.color, { lw: 0.8 });
        ctx.globalAlpha = 1;
      });
    }

    /* ---------- particles (in stage units) ---------- */
    function spawn(kind, n) {
      const pal = theme ? (theme.day || {}) : {};
      const colors = [pal.gold || '#e2bf55', pal.accent || '#c33', pal.accent2 || '#39c', '#ffffff'];
      for (let i = 0; i < n; i++) {
        if (kind === 'spark') {
          const a = Math.random() * TAU, sp = 30 + Math.random() * 35;
          particles.push({ kind, x: 50, y: 55, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.8, max: 0.8, s: 2.6, color: colors[i % 3] });
        } else if (kind === 'confetti') {
          particles.push({ kind, x: Math.random() * 100, y: -4, vx: (Math.random() - 0.5) * 20, vy: 30 + Math.random() * 40, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 10, life: 1.8, max: 1.8, color: colors[Math.floor(Math.random() * colors.length)] });
        } else if (kind === 'z') {
          particles.push({ kind, x: 64, y: 30, vx: 5, vy: -12, life: 2.2, max: 2.2, s: 9, color: (theme && theme.mascot.outline) || '#333' });
        } else if (kind === 'heart') {
          particles.push({ kind, x: 50 + (Math.random() - 0.5) * 30, y: 30, vx: 0, vy: -10, life: 1.5, max: 1.5, s: 3.2, color: pal.accent || '#e05a7a' });
        }
      }
    }

    function update(dt) {
      particles.forEach(pt => {
        pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.life -= dt;
        if (pt.kind === 'spark') { pt.vx *= 0.92; pt.vy *= 0.92; }
        if (pt.kind === 'confetti') pt.rot += pt.vr * dt;
      });
      particles = particles.filter(pt => pt.life > 0 && pt.y < 110);
    }

    /* ---------- animation loop ---------- */
    function loop(ms) {
      raf = null;
      const t = ms / 1000;
      const dt = Math.min(0.05, lastT ? t - lastT : 0);
      lastT = t;
      if (t > nextBlink) { blinkUntil = t + 0.14; nextBlink = t + 2.5 + Math.random() * 3; }
      if (mood === 'sleepy' && t > nextZ) { spawn('z', 1); nextZ = t + 1.3; }
      if (mood === 'hopeful' && t > nextHeart) { spawn('heart', 1); nextHeart = t + 2.6; }
      if (action && action.type === 'celebrate' && Math.random() < 0.6) spawn('confetti', 1);
      update(dt);
      draw(t);
      if (visible && animated()) raf = requestAnimationFrame(loop);
    }
    function start() {
      if (raf || !animated() || !visible) { if (!animated()) draw(now()); return; }
      lastT = 0;
      raf = requestAnimationFrame(loop);
    }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }

    /* In reduced-motion mode, show a still "effect" frame, then clear it. */
    function stillEffect(kind, n) {
      particles = [];
      spawn(kind, n);
      update(0.2);   // spread particles a little so they're visible
      still = true;
      draw(now());
      setTimeout(() => { particles = []; still = false; draw(now()); }, 1400);
    }

    // pause when off-screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }).observe(canvas);
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq.addEventListener) mq.addEventListener('change', () => { stop(); start(); });
    }

    /* ---------- public API ---------- */
    const api = {
      setTheme(t) { theme = t; draw(now()); start(); return api; },
      setStage(s) { stage = Math.max(1, Math.min(5, s | 0)); draw(now()); return api; },
      setWorn(list) { worn = (list || []).slice(); draw(now()); return api; },
      setMood(m) { mood = m; draw(now()); start(); return api; },
      getMood() { return mood; },
      cheer() {
        if (!animated()) return stillEffect('spark', 8);
        action = { type: 'cheer', start: now(), dur: 0.6 };
        spawn('spark', 10); start();
      },
      celebrate() {
        if (!animated()) return stillEffect('confetti', 30);
        action = { type: 'celebrate', start: now(), dur: 2.4 };
        spawn('spark', 16); spawn('confetti', 20); start();
      },
      poke() {
        if (!animated()) return stillEffect('heart', 3);
        action = { type: 'cheer', start: now(), dur: 0.45 };
        spawn('heart', 2); start();
      },
      redraw: resize,
      destroy: stop
    };
    resize();
    return api;
  }

  return { create, ACCESSORY_ORDER, SLOTS };
})();
