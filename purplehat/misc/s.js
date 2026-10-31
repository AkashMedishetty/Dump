(() => {
  const cv = document.getElementById('stage');
  const ctx = cv.getContext('2d');
  const off = document.createElement('canvas');
  const octx = off.getContext('2d', { willReadFrequently: true });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nameInput = document.getElementById('guest-name');
  const hint = document.getElementById('hint');

  // Warm "spotlight" amber is a small share; the rest is the purple range.
  const COLORS = ['rgba(255,186,96,0.9)', 'rgba(216,198,255,0.8)', 'rgba(160,112,255,0.85)', 'rgba(106,64,218,0.9)'];
  const SHARE = [0.06, 0.24, 0.45, 0.25];
  const CUES = [
    { mode: 'haze', name: 'Haze', note: 'House lights down' },
    { mode: 'hat', name: 'The hat', note: 'Standby' },
    { mode: 'reveal', name: 'Reveal', note: 'PurpleHat' },
    { mode: 'name', name: 'Your name', note: 'In lights' },
  ];

  let W = 0, H = 0, N = 0;
  let X, Y, VX, VY, TX, TY, S, R, groups = [];
  let mode = 'haze', cue = 0, lastCueAt = performance.now(), autoPausedUntil = 0, firstAuto = true;
  let mx = -1e4, my = -1e4, pointerOn = false;
  const RAD = 120, RAD2 = RAD * RAD;

  function alloc(n) {
    X = new Float32Array(n); Y = new Float32Array(n); VX = new Float32Array(n); VY = new Float32Array(n);
    TX = new Float32Array(n); TY = new Float32Array(n); S = new Float32Array(n); R = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      X[i] = Math.random() * W; Y[i] = Math.random() * H;
      TX[i] = X[i]; TY[i] = Y[i];
      S[i] = Math.random() < 0.12 ? 2.3 : 1.1 + Math.random() * 0.7;
      R[i] = Math.random() * 1000;
    }
    groups = []; let start = 0;
    SHARE.forEach((s, gi) => {
      const end = gi === SHARE.length - 1 ? n : start + Math.round(n * s);
      groups.push([start, end]); start = end;
    });
  }

  function resize() {
    const r = cv.getBoundingClientRect();
    const nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
    if (nw === W && nh === H) return;
    const ow = W, oh = H;
    W = nw; H = nh;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    off.width = W; off.height = H;
    const n = Math.round(Math.min(reduce ? 2400 : 5200, Math.max(1600, (W * H) / 140)));
    if (n !== N || !ow) { N = n; alloc(N); }
    else for (let i = 0; i < N; i++) { X[i] *= W / ow; Y[i] *= H / oh; }
    setTargets();
  }

  function drawHat(c) {
    const s = Math.min(W * 0.62, H * 0.8), cx = W / 2;
    const top = H / 2 - s * 0.4, brimY = H / 2 + s * 0.26;
    const tw = s * 0.29, bw = s * 0.25, rr = s * 0.045;
    c.beginPath();
    c.moveTo(cx - bw, brimY);
    c.lineTo(cx - tw, top + rr);
    c.quadraticCurveTo(cx - tw, top, cx - tw + rr, top);
    c.lineTo(cx + tw - rr, top);
    c.quadraticCurveTo(cx + tw, top, cx + tw, top + rr);
    c.lineTo(cx + bw, brimY);
    c.closePath(); c.fill();
    c.beginPath(); c.ellipse(cx, brimY, s * 0.5, s * 0.075, 0, 0, Math.PI * 2); c.fill();
    // The hatband is a gap in the light.
    c.globalCompositeOperation = 'destination-out';
    c.fillRect(cx - tw - 4, brimY - s * 0.17, tw * 2 + 8, s * 0.04);
    c.globalCompositeOperation = 'source-over';
  }

  function drawWord(c, text) {
    const fam = '"Big Shoulders Display", "Arial Narrow", Impact, sans-serif';
    let size = Math.min(H * 0.5, 420);
    c.font = `900 ${size}px ${fam}`;
    const w = c.measureText(text).width, maxW = W * 0.88;
    if (w > maxW) { size *= maxW / w; c.font = `900 ${size}px ${fam}`; }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, W / 2, H / 2 + size * 0.04);
  }

  function guestName() { return (nameInput.value.trim() || 'Your brand').toUpperCase().slice(0, 18); }

  function setTargets() {
    if (!N || mode === 'haze') return;
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, W, H);
    octx.fillStyle = '#fff';
    if (mode === 'hat') drawHat(octx);
    else drawWord(octx, mode === 'reveal' ? 'PURPLEHAT' : guestName());
    const data = octx.getImageData(0, 0, W, H).data;
    const step = 2, pts = [];
    for (let y = 0; y < H; y += step)
      for (let x = 0; x < W; x += step)
        if (data[(y * W + x) * 4 + 3] > 128) pts.push(x, y);
    const m = pts.length / 2;
    if (!m) return;
    const idx = new Uint32Array(m);
    for (let i = 0; i < m; i++) idx[i] = i;
    const take = Math.min(N, m);
    for (let i = 0; i < take; i++) { const j = i + ((Math.random() * (m - i)) | 0); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    for (let i = 0; i < N; i++) {
      const k = idx[i % take] * 2;
      TX[i] = pts[k] + Math.random() * step; TY[i] = pts[k + 1] + Math.random() * step;
    }
  }

  // Cue desk
  const cuesEl = document.getElementById('cues');
  const hudCue = document.getElementById('hud-cue');
  CUES.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'cue'; b.id = 'cue-' + (i + 1);
    b.innerHTML = `<span class="n"><span>Cue 0${i + 1}</span><span class="st"></span></span><span class="t">${c.name}</span>`;
    b.addEventListener('click', () => go(i, true));
    cuesEl.appendChild(b);
  });
  function renderDesk() {
    [...cuesEl.children].forEach((b, i) => {
      const live = i === cue, next = i === (cue + 1) % CUES.length;
      b.setAttribute('aria-pressed', live ? 'true' : 'false');
      b.classList.toggle('standby', next);
      b.querySelector('.st').textContent = live ? '● Go' : next ? 'Standby' : '';
    });
    hudCue.textContent = `Cue 0${cue + 1} · ${CUES[cue].name}`;
  }

  function go(i, manual) {
    cue = (i + CUES.length) % CUES.length;
    mode = CUES[cue].mode;
    setTargets();
    if (mode !== 'haze' && !reduce) for (let k = 0; k < N; k++) { VX[k] += (Math.random() - 0.5) * 7; VY[k] += (Math.random() - 0.5) * 7; }
    lastCueAt = performance.now();
    if (manual) pause(14000);
    renderDesk();
  }
  function pause(ms) { autoPausedUntil = performance.now() + ms; }
  function hideHint() { hint.classList.add('gone'); }

  document.getElementById('go').addEventListener('click', () => go(cue + 1, true));
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target !== nameInput && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); go(cue + 1, true); }
  });
  document.getElementById('name-form').addEventListener('submit', (e) => { e.preventDefault(); go(3, true); });
  let nameTimer;
  nameInput.addEventListener('input', () => {
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => { if (cue === 3) { setTargets(); pause(20000); } else go(3, true); }, 220);
  });

  function setPointer(e) {
    const r = cv.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top; pointerOn = true;
  }
  cv.addEventListener('pointermove', (e) => { setPointer(e); pause(6000); hideHint(); });
  cv.addEventListener('pointerleave', () => { pointerOn = false; });
  cv.addEventListener('pointercancel', () => { pointerOn = false; });
  cv.addEventListener('pointerdown', (e) => {
    setPointer(e); hideHint(); pause(8000);
    for (let i = 0; i < N; i++) {
      const dx = X[i] - mx, dy = Y[i] - my, d = Math.hypot(dx, dy);
      if (d < 190 && d > 0.01) { const f = (1 - d / 190) * 16; VX[i] += (dx / d) * f; VY[i] += (dy / d) * f; }
    }
  });

  // Auto-run the cue sheet when nobody is touching it.
  setInterval(() => {
    const now = performance.now();
    if (now < autoPausedUntil) return;
    if (now - lastCueAt > (firstAuto ? 2400 : 5600)) { firstAuto = false; go(cue + 1, false); }
  }, 300);

  // Timecode at 25 fps, the way a show control desk reads it.
  const tcEl = document.getElementById('tc'), t0 = performance.now();
  const p2 = (n) => String(n).padStart(2, '0');
  function tick() {
    const ms = performance.now() - t0, s = Math.floor(ms / 1000);
    tcEl.textContent = `${p2(Math.floor(s / 3600))}:${p2(Math.floor(s / 60) % 60)}:${p2(s % 60)}:${p2(Math.floor((ms % 1000) / 40))}`;
  }

  let t = 0;
  function frame() {
    t += 1;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = reduce ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.26)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    const haze = mode === 'haze', k = 0.017, damp = 0.86;
    for (let i = 0; i < N; i++) {
      let x = X[i], y = Y[i], vx = VX[i], vy = VY[i];
      if (haze) {
        const a = Math.sin(x * 0.0042 + t * 0.004 + R[i] * 0.0006) * Math.cos(y * 0.0051 - t * 0.003) * Math.PI * 2;
        vx = (vx + Math.cos(a) * 0.06) * 0.965;
        vy = (vy + Math.sin(a) * 0.06 - 0.005) * 0.965;
      } else {
        const jx = reduce ? 0 : Math.sin(t * 0.05 + R[i]) * 0.8, jy = reduce ? 0 : Math.cos(t * 0.043 + R[i]) * 0.8;
        vx = (vx + (TX[i] + jx - x) * k) * damp;
        vy = (vy + (TY[i] + jy - y) * k) * damp;
      }
      if (pointerOn && !reduce) {
        const dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
        if (d2 < RAD2 && d2 > 0.01) {
          const d = Math.sqrt(d2), f = (1 - d / RAD) * (haze ? 0.9 : 2.2);
          vx += (dx / d) * f - (dy / d) * f * 0.9;
          vy += (dy / d) * f + (dx / d) * f * 0.9;
        }
      }
      x += vx; y += vy;
      if (haze) {
        if (x < -6) x += W + 12; else if (x > W + 6) x -= W + 12;
        if (y < -6) y += H + 12; else if (y > H + 6) y -= H + 12;
      }
      X[i] = x; Y[i] = y; VX[i] = vx; VY[i] = vy;
    }
    for (let g = 0; g < groups.length; g++) {
      ctx.fillStyle = COLORS[g];
      const [a, b] = groups[g];
      for (let i = a; i < b; i++) ctx.fillRect(X[i], Y[i], S[i], S[i]);
    }
    tick();
    requestAnimationFrame(frame);
  }

  const fontReady = document.fonts && document.fonts.load
    ? Promise.race([document.fonts.load('900 100px "Big Shoulders Display"'), new Promise((r) => setTimeout(r, 1500))])
    : Promise.resolve();
  fontReady.catch(() => {}).then(() => {
    resize();
    new ResizeObserver(resize).observe(cv);
    renderDesk();
    requestAnimationFrame(frame);
  });
})();
