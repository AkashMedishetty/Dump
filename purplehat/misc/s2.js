(() => {
  const TAU = Math.PI * 2;
  const COL = { brand: '#5e44e8', crown: '#f6f4ef', visor: '#d7cfff', ink: '#17112b', visorOnWhite: '#a996ff' };

  function circle(cx, cy, r, n = 360) {
    const p = [];
    for (let i = 0; i < n; i++) { const t = (i / n) * TAU; p.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
    return p;
  }
  function area(p) {
    let a = 0;
    for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a += x1 * y2 - x2 * y1; }
    return a / 2;
  }
  // Keep the part of the polygon where nx*x + ny*y >= d.
  function clipHalf(poly, nx, ny, d) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const A = poly[i], B = poly[(i + 1) % poly.length];
      const da = nx * A[0] + ny * A[1] - d, db = nx * B[0] + ny * B[1] - d;
      if (da >= 0) out.push(A);
      if ((da >= 0) !== (db >= 0)) { const t = da / (da - db); out.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]); }
    }
    return out;
  }
  function clipConvex(subject, clip) {
    const s = Math.sign(area(clip));
    let out = subject;
    for (let i = 0; i < clip.length && out.length; i++) {
      const A = clip[i], B = clip[(i + 1) % clip.length];
      const nx = -(B[1] - A[1]) * s, ny = (B[0] - A[0]) * s;
      out = clipHalf(out, nx, ny, nx * A[0] + ny * A[1]);
    }
    return out;
  }
  // Arc circle for a panel pointing up: it meets the unit circle at ±phi from vertical
  // and reaches in to depth h from the centre.
  function arcCircle(h, phiDeg) {
    const ph = (phiDeg * Math.PI) / 180;
    const c = (1 - h * h) / (2 * (Math.cos(ph) - h));
    return { c, r: c - h };
  }
  function panelUp({ h, phi, outerOff = 0, outerR = 1 }, g) {
    const k = arcCircle(h, phi);
    let p = clipConvex(circle(0, outerOff, outerR), circle(0, -k.c, k.r));
    const d = (g / 2) * Math.SQRT2;
    p = clipHalf(p, -1, -1, d);
    p = clipHalf(p, 1, -1, d);
    return p;
  }
  function rotate(p, deg) {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return p.map(([x, y]) => [x * c - y * s, x * s + y * c]);
  }
  const S = 100;
  const toPath = (p) => 'M' + p.map(([x, y]) => `${(x * S).toFixed(2)} ${(y * S).toFixed(2)}`).join('L') + 'Z';

  const STUDIES = [
    { id: 'a', name: 'Your concept, rebuilt', note: 'Your geometry with even panels and even seams. The visor is only a colour change, so in one colour it turns into a fourth panel.',
      crown: { h: 0.43, phi: 46 }, visor: { h: 0.43, phi: 46 }, g: 0.06, button: 0 },
    { id: 'b', name: 'Plus the button', note: 'A button where the seams meet. The centre stops reading as a sparkle and starts reading as the top of a cap.',
      crown: { h: 0.43, phi: 46 }, visor: { h: 0.43, phi: 46 }, g: 0.06, button: 0.11 },
    { id: 'c', name: 'Visor by shape', rec: true, note: 'The visor is a little deeper than the crown panels, so the front of the cap still reads in one colour, on foil or stitched.',
      crown: { h: 0.46, phi: 46 }, visor: { h: 0.35, phi: 46 }, g: 0.065, button: 0.11 },
    { id: 'd', name: 'Peak out', alt: true, note: 'The peak pushes past the circle, the way the bill of a real cap does. The most literal cap; best for stickers, merch and the last frame of an animation.',
      crown: { h: 0.46, phi: 46 }, visor: { h: 0.36, phi: 48, outerOff: 0.22, outerR: 1.34 }, g: 0.065, button: 0.11 },
  ];

  function build(st) {
    const crown = [0, 180, 270].map((deg) => toPath(rotate(panelUp(st.crown, st.g), deg)));
    const visor = toPath(rotate(panelUp(st.visor, st.g), 90));
    const all = [0, 90, 180, 270].map((deg) => rotate(panelUp(deg === 90 ? st.visor : st.crown, st.g), deg)).flat();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    all.forEach(([x, y]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    const half = Math.max(-minX, maxX, -minY, maxY) * S + 2;
    return { crown, visor, half };
  }
  function svg(geo, st, cols, size) {
    const vb = `${-geo.half} ${-geo.half} ${geo.half * 2} ${geo.half * 2}`;
    const sz = size ? ` width="${size}" height="${size}"` : '';
    const btn = st.button ? `<circle cx="0" cy="0" r="${(st.button * S).toFixed(2)}" fill="${cols.crown}"/>` : '';
    const bg = cols.bg ? `<rect x="${-geo.half}" y="${-geo.half}" width="${geo.half * 2}" height="${geo.half * 2}" fill="${cols.bg}"/>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${sz} role="img" aria-label="PurpleHat mark">${bg}${geo.crown.map((d) => `<path d="${d}" fill="${cols.crown}"/>`).join('')}<path d="${geo.visor}" fill="${cols.visor}"/>${btn}</svg>`;
  }
  const ON_PURPLE = { crown: COL.crown, visor: COL.visor };
  const ON_WHITE = { crown: COL.brand, visor: COL.visorOnWhite };
  const MONO = { crown: COL.ink, visor: COL.ink };

  const host = document.getElementById('studies');
  STUDIES.forEach((st) => {
    const geo = build(st);
    const el = document.createElement('article');
    el.className = 'study' + (st.rec ? ' rec' : '');
    const badge = st.rec ? '<span class="badge">Recommended</span>' : st.alt ? '<span class="badge alt">Secondary</span>' : '';
    const fileSvg = svg(geo, st, ON_PURPLE);
    el.innerHTML = `
      <div class="hero">${svg(geo, st, ON_PURPLE)}</div>
      <h2>${st.name}${badge}</h2>
      <p>${st.note}</p>
      <div class="tests">
        <div class="test"><span class="label">On purple</span><div class="chips purple">${[48, 32, 24, 16].map((s) => svg(geo, st, ON_PURPLE, s)).join('')}</div></div>
        <div class="test"><span class="label">On white</span><div class="chips white">${[48, 24, 16].map((s) => svg(geo, st, ON_WHITE, s)).join('')}</div></div>
        <div class="test"><span class="label">One colour</span><div class="chips white">${[48, 24, 16].map((s) => svg(geo, st, MONO, s)).join('')}</div></div>
        <div class="test"><span class="label">Profile</span><div class="chips"><div class="avatar">${svg(geo, st, ON_PURPLE)}</div></div></div>
      </div>
      <div class="actions">
        <button class="copy" type="button" id="copy-${st.id}">Copy SVG</button>
      </div>
      <details><summary>SVG code</summary><textarea id="svg-${st.id}" readonly></textarea></details>`;
    host.appendChild(el);
    const ta = el.querySelector('textarea');
    ta.value = fileSvg;
    const btn = el.querySelector('button.copy');
    btn.addEventListener('click', () => {
      const done = () => { btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = 'Copy SVG'), 1600); };
      const fallback = () => { el.querySelector('details').open = true; ta.focus(); ta.select(); btn.textContent = 'Select and copy below'; };
      try { navigator.clipboard.writeText(fileSvg).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  // Construction drawing for the recommended study.
  (function construction() {
    const st = STUDIES[2], geo = build(st);
    const stroke = 'var(--muted)';
    const kc = arcCircle(st.crown.h, st.crown.phi), kv = arcCircle(st.visor.h, st.visor.phi);
    const guides = [0, 180, 270].map((deg) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return `<circle cx="${(Math.cos(a) * kc.c * S).toFixed(1)}" cy="${(Math.sin(a) * kc.c * S).toFixed(1)}" r="${(kc.r * S).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.6"/>`;
    }).join('') + `<circle cx="${(kv.c * S).toFixed(1)}" cy="0" r="${(kv.r * S).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.6"/>`;
    const seams = `<line x1="-120" y1="-120" x2="120" y2="120" stroke="${stroke}" stroke-width="0.6" opacity="0.7"/><line x1="-120" y1="120" x2="120" y2="-120" stroke="${stroke}" stroke-width="0.6" opacity="0.7"/>`;
    const lbl = (x, y, tx, ty, text, anchor) =>
      `<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="var(--fg)" stroke-width="0.7"/><circle cx="${x}" cy="${y}" r="1.8" fill="var(--fg)"/>` +
      `<text x="${tx + (anchor === 'end' ? -4 : 4)}" y="${ty + 3.5}" text-anchor="${anchor}" font-family="JetBrains Mono, ui-monospace, monospace" font-size="10" fill="var(--fg)">${text}</text>`;
    const mark = svg(geo, st, { crown: COL.brand, visor: COL.visorOnWhite }).replace(/^<svg[^>]*>|<\/svg>$/g, '');
    document.getElementById('construction').innerHTML =
      `<svg viewBox="-200 -135 400 270" role="img" aria-label="Construction: unit circle, four arc circles, diagonal seams and centre button">
        <defs><clipPath id="frame"><rect x="-200" y="-135" width="400" height="270"/></clipPath></defs>
        <g clip-path="url(#frame)">${guides}</g>
        <circle cx="0" cy="0" r="100" fill="none" stroke="${stroke}" stroke-width="0.6" opacity="0.7"/>
        ${seams}
        <g>${mark}</g>
        ${lbl(-30, -82, -110, -112, 'CROWN PANEL', 'end')}
        ${lbl(80, 25, 112, 70, 'VISOR (FRONT)', 'start')}
        ${lbl(0, 0, -150, 40, 'BUTTON', 'end')}
        ${lbl(-70, 70, -150, 105, 'SEAM', 'end')}
        <text x="112" y="-112" text-anchor="start" font-family="JetBrains Mono, ui-monospace, monospace" font-size="9" fill="var(--muted)">FACING →</text>
      </svg>`;
  })();
})();
