// The breath, then act 3 — paint and place, and the glass reveal. (PhE logo: 5 strokes + 3 dots = the accent)
import * as K from './kit.js';
const { clamp, lerp, seg, ss, eio, eo, ei, back, mulberry, hash, TAU, rgb, hex, mix, fbm, vn2 } = K;
const LOGO = K.LOGO, LW = K.LW, LH = K.LH, ST = K.STROKE;
const BLUE = '#2563EB', VIOLET = '#2A0D6E', WARM = '#F4F1EB';

// ---------- local helpers ----------
// a reusable scratch canvas, cleared on every call
function scratch(name, W, H) {
  const c = K.tex('s3buf:' + name, W, H, () => {}), q = c.getContext('2d');
  q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = 1; q.globalCompositeOperation = 'source-over'; q.filter = 'none'; q.shadowBlur = 0; q.shadowColor = 'rgba(0,0,0,0)';
  q.clearRect(0, 0, W, H); return [c, q];
}
// resample a polyline at a fixed step -> [{x, y, tx, ty, nx, ny}]
function resample(pts, step) {
  const out = [[pts[0][0], pts[0][1]]]; let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0); if (L === 0) continue;
    let d = step - acc; while (d <= L) { out.push([x0 + (x1 - x0) * d / L, y0 + (y1 - y0) * d / L]); d += step; }
    acc = L - (d - step);
  }
  const e = pts[pts.length - 1]; if (Math.hypot(e[0] - out[out.length - 1][0], e[1] - out[out.length - 1][1]) > step * .2) out.push([e[0], e[1]]);
  return out.map((p, i) => { const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return { x: p[0], y: p[1], tx: dx / l, ty: dy / l, nx: -dy / l, ny: dx / l }; });
}
const RS = new Map();
const partRes = (M, k, step) => { const key = M.x + ',' + M.y + ',' + M.R + ',' + k + ',' + step; if (!RS.has(key)) RS.set(key, resample(K.partLinePts(M, k), step)); return RS.get(key); };
// silhouette outline of a part (polygons, logo units), parsed from the fill path (M/L/Z only)
const OUTL = [];
function outlineUnits(k) {
  if (OUTL[k]) return OUTL[k]; const polys = []; let cur = null; const re = /([MLZ])([^MLZ]*)/g; let m;
  while ((m = re.exec(LOGO.parts[k].fill))) { const nums = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (m[1] === 'M') { cur = []; polys.push(cur); } if (m[1] !== 'Z') for (let i = 0; i + 1 < nums.length; i += 2) cur.push([nums[i], nums[i + 1]]); }
  return OUTL[k] = polys;
}
const outlineScreen = (M, k) => outlineUnits(k).map(p => p.map(([x, y]) => K.toScreen(M, x, y)));
const dotC = (M, k) => { const p = LOGO.parts[k], [x, y] = K.toScreen(M, p.cx, p.cy); return [x, y, p.r * K.logoScale(M)]; };
const pulse = (t, tb, w = .12) => Math.exp(-Math.pow((t - tb) / w, 2));
const gran = () => K.tex('s3gran', 512, 512, (q, w, h) => { const r = mulberry(77); for (let i = 0; i < 9000; i++) { q.fillStyle = `rgba(0,0,0,${.2 + r() * .6})`; q.fillRect(r() * w, r() * h, 1 + r() * 2.2, 1 + r() * 2.2); } });

// a low-resolution scratch buffer drawn in full-frame coordinates (cheap soft blurs: draw small, upscale)
function lowres(name, W, H, f) { const [C, q] = scratch(name, Math.ceil(W * f), Math.ceil(H * f)); q.scale(f, f); return [C, q]; }
const decimate = (poly, d) => { const o = [poly[0]]; for (const p of poly) { const l = o[o.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) >= d) o.push(p); } return o; };
// watercolour layer: paint shapes into a (half-res) buffer, lose some pigment to granulation, darken the edges, multiply onto the page.
// `done` = the layer has stopped changing, so its buffers are kept and reused.
const WCC = new Map();
// ds = scale of the destination (a half-res page), rect = only composite this part of the frame (multiply is costly)
function wc(g, W, H, S, paint, { alpha = .6, gr = .3, edge = .5, name = 'wc', res = .5, done = false, ds = 1, rect = null } = {}) {
  const ck = name + '@' + W + 'x' + H; let C, E;
  if (done && WCC.has(ck)) [C, E] = WCC.get(ck);
  else {
    const w = Math.ceil(W * res), h = Math.ceil(H * res); let q, e;
    [C, q] = scratch(name, w, h); q.scale(res, res); paint(q); q.setTransform(1, 0, 0, 1, 0, 0);
    q.globalCompositeOperation = 'destination-out'; q.globalAlpha = gr; q.fillStyle = q.createPattern(gran(), 'repeat'); q.fillRect(0, 0, w, h); q.globalAlpha = 1; q.globalCompositeOperation = 'source-over';
    [E, e] = scratch(name + 'E', w, h);
    if (edge > 0) { e.drawImage(C, 0, 0); e.globalCompositeOperation = 'destination-out'; e.filter = `blur(${Math.max(1, 3.5 * S * res)}px)`; e.drawImage(C, 0, 0); e.filter = 'none'; }
    if (done) { const C2 = K.canvas(w, h), E2 = K.canvas(w, h); C2.getContext('2d').drawImage(C, 0, 0); E2.getContext('2d').drawImage(E, 0, 0); WCC.set(ck, [C2, E2]); C = C2; E = E2; }
  }
  const [rx, ry, rw, rh] = rect ? [Math.max(0, rect[0]), Math.max(0, rect[1]), Math.min(W, rect[0] + rect[2]) - Math.max(0, rect[0]), Math.min(H, rect[1] + rect[3]) - Math.max(0, rect[1])] : [0, 0, W, H];
  const put = (X) => g.drawImage(X, rx * res, ry * res, rw * res, rh * res, rx * ds, ry * ds, rw * ds, rh * ds);
  g.save(); g.globalCompositeOperation = 'multiply'; g.imageSmoothingQuality = 'high'; g.globalAlpha = alpha; put(C);
  if (edge > 0) { g.globalAlpha = Math.min(1, alpha * edge); put(E); }
  g.restore();
}

// a dry brush along a polyline: bristles across the stroke, flying white where the brush runs dry
function dryBrush(g, R, p, ink, w, seed, S) {
  if (p <= 0) return; const n = R.length, m = Math.max(2, Math.min(n, Math.ceil(n * p)));
  const press = (u) => lerp(1.16, 1, ss(u / .1)) * lerp(1, .62, ss((u - .72) / .28));
  const path = (a, b) => { g.beginPath(); for (let i = a; i <= b; i++) i > a ? g.lineTo(R[i].x, R[i].y) : g.moveTo(R[i].x, R[i].y); };
  g.save(); g.strokeStyle = ink; g.lineCap = 'round'; g.lineJoin = 'round';
  // wet bleed into the paper around the stroke
  path(0, m - 1); g.globalAlpha = .05; g.lineWidth = w * 1.5; g.stroke(); g.globalAlpha = .07; g.lineWidth = w * 1.2; g.stroke();
  // the loaded body of the stroke: solid ink that runs out toward the end
  for (let c = 0; c < m - 1; c += 6) { const u = c / (n - 1), a = .92 * (1 - ss((u - .45) / .5)); if (a < .02) continue; path(c, Math.min(c + 7, m - 1)); g.globalAlpha = a; g.lineWidth = w * .6 * press(u); g.stroke(); }
  // bristles: flying white streaks, ragged edges, a ragged tail
  const B = 36;
  for (let b = 0; b < B; b++) {
    const o = b / (B - 1) - .5, uEnd = 1 - Math.abs(o) * .5 * hash(b * 7 + seed); g.beginPath(); let pen = false;
    for (let i = 0; i < m; i++) {
      const u = i / (n - 1); if (u > uEnd) break;
      const drift = (vn2(i * .02, b * .5 + seed) - .5) * .06, off = (o + drift) * w * press(u), thr = .28 + .5 * u * u + Math.abs(o) * .6 * (.3 + u);
      const nz = vn2(i * .05 + seed * 3.1, b * .35 + seed) * .7 + vn2(i * .22 + seed, b * 1.3) * .3;
      const x = R[i].x + R[i].nx * off, y = R[i].y + R[i].ny * off;
      if (nz > thr * .8) { pen ? g.lineTo(x, y) : g.moveTo(x, y); pen = true; } else pen = false;
    }
    g.globalAlpha = .5 + .45 * hash(b * 3 + seed); g.lineWidth = w / B * 2.1; g.stroke();
  }
  // the loaded tip while it is still moving
  if (p < 1) { const e = R[m - 1]; g.globalAlpha = .55; g.fillStyle = ink; K.circle(g, e.x, e.y, w * .5); g.fill(); }
  g.restore();
}

// 35 INK WASH — the retreat, the breath: blank rice paper; the PhE written in three brush beats, three cinnabar drops, a seal
export function inkWash(g, t, { W, H, M, S, V }) {
  g.drawImage(K.paper('xuan', 960, 540, [242, 236, 222], { mottle: 9, grain: 7, fibres: 4000, seed: 35 }), 0, 0, W, H);
  const hw = K.halfW(M), hh = K.halfH(M), ink = '#1B1918', cin = '#B3322A';
  // mountain: an ink bloom spreading on the paper (blurred, wet), a paler ridge behind
  const bloom = eo(seg(t, .2, 2.8));
  if (bloom > 0) { const f = .25, [C, q] = lowres('ink-mtn', W, H, f), mw = V ? W * .66 : W * .52, base = V ? H * .9 : H * .82, mh = V ? H * .17 : H * .25;
    for (const [col, sc, dx] of [['rgba(30,28,26,.35)', .8, mw * .5], ['rgba(30,28,26,.85)', 1, 0]]) { q.fillStyle = col; q.beginPath(); q.moveTo(-20 + dx, H + 10);
      for (let x = -20; x <= mw; x += 6 * S) { const u = (x + 20) / (mw + 20), s = Math.max(0, Math.sin(u * Math.PI)), y = H - (H - base) * Math.min(1, s * 4) - Math.pow(s, 1.3) * mh * sc * (.75 + .5 * fbm(x / (110 * S) + dx, 3)); q.lineTo(x + dx, lerp(H + 10, y, bloom)); }
      q.lineTo(mw + dx, H + 10); q.closePath(); q.fill(); }
    const [C2, q2] = scratch('ink-mtn2', C.width, C.height); q2.filter = `blur(${lerp(14, 5, bloom) * S * f}px)`; q2.drawImage(C, 0, 0);
    g.save(); g.imageSmoothingQuality = 'high'; g.globalAlpha = .55; g.drawImage(C2, 0, 0, W, H); g.globalAlpha = .3; g.drawImage(C, 0, 0, W, H); g.restore(); }
  // the logo in three brush beats (P · h · E), dry brush along each centre line
  const w = ST * K.logoScale(M) * 1.04, B = (k) => partRes(M, k, 2 * S);
  const strokes = [[0, .5, 1.0], [1, 1.0, 1.2], [2, 1.2, 1.5], [3, 1.5, 1.66], [4, 1.66, 2.0]];
  for (const [k, a, b] of strokes) dryBrush(g, B(k), eio(seg(t, a, b)), ink, w, k * 13 + 5, S);
  // three cinnabar drops fall on the eighths and bleed into the paper
  [[5, 2.0], [6, 2.25], [7, 2.5]].forEach(([k, tl], i) => {
    const [x, y, r] = dotC(M, k);
    if (t < tl - .3) return;
    g.save(); g.fillStyle = cin;
    if (t < tl) { const u = ei(seg(t, tl - .3, tl)), yy = lerp(y - H * .55, y, u), st = 1 + u * .5;
      g.beginPath(); g.ellipse(x, yy, r * .5, r * .7 * st, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x - r * .42, yy - r * .3); g.quadraticCurveTo(x, yy - r * 1.9 * st, x + r * .42, yy - r * .3); g.fill(); }
    else { const u = t - tl, hk = eo(seg(u, 0, 1.4));
      g.globalAlpha = .22; g.filter = `blur(${3 * S}px)`; K.circle(g, x, y, r * (1.05 + .55 * hk)); g.fill(); g.filter = 'none'; g.globalAlpha = .95;
      K.circle(g, x, y, r * (.35 + .65 * back(seg(u, 0, .14), 2.6))); g.fill();
      const sp = eo(seg(u, 0, .1)); for (let j = 0; j < 6; j++) { const a = hash(j * 7 + k) * TAU, d = r * (1.5 + hash(j * 3 + k) * 1.5) * sp; K.circle(g, x + Math.cos(a) * d, y + Math.sin(a) * d * .7, r * (.07 + .12 * hash(j + k * 5)) * sp); g.fill(); } }
    g.restore();
  });
  // a tiny figure on a dry ground stroke, walking toward the mountain
  const fy = V ? H * .9 : H * .86, fx = lerp(W * .84, W * .79, clamp(t / 4)), gk = eo(seg(t, .1, 1.2));
  if (gk > 0) dryBrush(g, resample([[W * .73, fy + 2 * S], [W * .95, fy + 5 * S]], 3 * S), gk, 'rgba(27,25,24,.45)', 5 * S, 91, S);
  const step = Math.sin(t * 5) * 3 * S;
  g.strokeStyle = ink; g.lineWidth = 3 * S; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx, fy - 30 * S); g.lineTo(fx - 3 * S + step * .4, fy); g.moveTo(fx, fy - 18 * S); g.lineTo(fx + 4 * S - step * .4, fy); g.stroke(); K.circle(g, fx, fy - 36 * S, 4.5 * S); g.fillStyle = ink; g.fill();
  // red seal, stamped after the last drop: the PhE carved out of cinnabar
  const sk = seg(t, 3.0, 3.18); if (sk > 0) {
    const s = 66 * S * lerp(1.35, 1, eo(sk)), x = V ? M.x + hw - 40 * S : M.x + hw + 86 * S, y = V ? M.y + hh + 96 * S : M.y + hh * .45;
    const seal = K.tex('s3seal', 160, 160, (q, w) => { q.fillStyle = cin; K.rr(q, 6, 6, w - 12, w - 12, 10); q.fill(); q.globalCompositeOperation = 'destination-out';
      q.lineWidth = 5; q.strokeStyle = '#000'; K.rr(q, 16, 16, w - 32, w - 32, 6); q.stroke(); K.fillMark(q, { x: w / 2, y: w / 2 + 2, R: 34 }, '#000', '#000');
      const r = mulberry(8); for (let i = 0; i < 260; i++) { q.globalAlpha = .3 + r() * .7; K.circle(q, r() * w, r() * w, .5 + r() * 1.6); q.fill(); } });
    g.save(); g.globalAlpha = .92 * Math.min(1, sk * 3); g.globalCompositeOperation = 'multiply'; g.translate(x, y); g.rotate(-.05); g.drawImage(seal, -s / 2, -s / 2, s, s); g.restore(); }
}

// 36 WATERCOLOUR — a garden wedding: washes paint themselves, a flower arch over the PhE, an aisle on the lawn
const WCPAGE = new Map();
export function watercolor(g, t, { W, H, M, S, V }) {
  const k = (a, b) => eo(seg(t, a, b)), hw = K.halfW(M), hh = K.halfH(M), lawn = V ? H * .7 : H * .79, FL = ['#d9632e', '#e8a0a8', '#f1c9b0', '#c8442a', '#b56aa8'];
  // the background washes are painted on a half-res page (watercolour is soft anyway); once they stop changing the page is kept
  const pk = W + 'x' + H, pageDone = t > 1.16;
  if (pageDone && WCPAGE.has(pk)) g.drawImage(WCPAGE.get(pk), 0, 0, W, H);
  else { const ds = .5, [PG, pg] = scratch('wcPage', Math.ceil(W * ds), Math.ceil(H * ds)); pg.drawImage(K.paper('cotton2', 960, 540, [248, 240, 226], { mottle: 10, grain: 14, seed: 36 }), 0, 0, PG.width, PG.height);
  const g0 = g; { const g = pg;
  // sky: wet-on-wet blobs (painted tiny, so the upscale is the bleed)
  wc(g, W, H, S, q => { q.fillStyle = '#6E9CCB'; for (let i = 0; i < 40; i++) { const r = mulberry(i + 3), x = r() * W, y = r() * lawn * .6, rad = (70 + r() * 150) * S * k(-.3, .7); K.circle(q, x, y, rad); q.fill(); }
    q.fillStyle = '#e8b48a'; for (let i = 0; i < 8; i++) { const r = mulberry(i + 90); K.circle(q, r() * W, lawn * (.45 + r() * .4), (60 + r() * 90) * S * k(0, .8)); q.fill(); } }, { alpha: .42, edge: 0, gr: .15, res: .08, name: 'wcS', done: t > .8 , ds });
  // lawn + far hedge
  wc(g, W, H, S, q => { q.fillStyle = '#8ea860'; q.beginPath(); q.moveTo(0, H); for (let x = 0; x <= W; x += 20 * S) q.lineTo(x, lawn + Math.sin(x * .004) * 14 * S + (1 - k(-.1, .6)) * H * .3); q.lineTo(W, H); q.fill();
    q.fillStyle = '#5e7f45'; q.beginPath(); q.moveTo(0, lawn + 10 * S); for (let x = 0; x <= W; x += 14 * S) q.lineTo(x, lawn - (22 + 18 * fbm(x / (60 * S), 2)) * S * k(0, .6)); q.lineTo(W, lawn + 10 * S); q.fill(); }, { alpha: .5, name: 'wcG', done: t > .65 , ds });
  // the aisle strewn with petals, rows of white chairs (only their lilac shadows painted)
  wc(g, W, H, S, q => { const ak = k(.05, .7), yb = lerp(lawn, H, ak); q.fillStyle = '#e9c2b4'; q.beginPath(); q.moveTo(M.x - 44 * S, lawn + 6 * S); q.lineTo(M.x + 44 * S, lawn + 6 * S);
    q.lineTo(lerp(M.x + 44 * S, M.x + 190 * S, ak), yb); q.lineTo(lerp(M.x - 44 * S, M.x - 190 * S, ak), yb); q.fill();
    q.fillStyle = '#d0607a'; for (let i = 0; i < 40; i++) { const r = mulberry(i + 400), y = lerp(lawn + 10 * S, H, r()); if (y > yb) continue; const half = lerp(44, 190, (y - lawn) / (H - lawn)) * S; K.circle(q, M.x + (r() - .5) * 2 * half, y, (2 + r() * 3) * S); q.fill(); }
    q.strokeStyle = '#9d93b8'; q.lineCap = 'round'; for (let row = 0; row < 5; row++) { const y = lawn + (30 + row * 30 + row * row * 8) * S; if (y > yb - 10 * S) continue; const sc = 1 + row * .3;
      for (let c = 0; c < 6; c++) for (const sd of [-1, 1]) { const x = M.x + sd * (lerp(64, 200, (y - lawn) / (H - lawn)) * S + 14 * S + c * 36 * S * sc) + (hash(row * 13 + c * 3 + sd) - .5) * 8 * S;
        q.lineWidth = 4 * S * sc; q.beginPath(); q.moveTo(x - 9 * S * sc, y - 16 * S * sc); q.lineTo(x - 9 * S * sc, y); q.moveTo(x + 9 * S * sc, y - 16 * S * sc); q.lineTo(x + 9 * S * sc, y); q.moveTo(x - 10 * S * sc, y - 16 * S * sc); q.lineTo(x + 10 * S * sc, y - 17 * S * sc); q.stroke();
        q.fillStyle = 'rgba(120,110,160,.5)'; q.beginPath(); q.ellipse(x + 4 * S * sc, y + 3 * S * sc, 12 * S * sc, 3.5 * S * sc, 0, 0, TAU); q.fill(); } } }, { alpha: .45, name: 'wcC', done: t > .75 , ds });
  // the arch: two posts and a wide half-ellipse over the wide logo; foliage then flowers grow up from both bases
  const ax = hw + 82 * S, acy = M.y - hh * .1, ary = hh + 128 * S;
  const arch = []; for (let i = 0; i <= 20; i++) arch.push([M.x - ax, lerp(lawn + 4 * S, acy, i / 20)]);
  for (let i = 1; i <= 60; i++) { const a = Math.PI + i / 60 * Math.PI; arch.push([M.x + Math.cos(a) * ax, acy + Math.sin(a) * ary]); }
  for (let i = 1; i <= 20; i++) arch.push([M.x + ax, lerp(acy, lawn + 4 * S, i / 20)]);
  const AR = resample(arch, 6 * S), NA = AR.length, ak = k(-.15, 1.1);
  const grown = (i) => Math.min(i, NA - 1 - i) / (NA / 2) <= ak;
  wc(g, W, H, S, q => { q.strokeStyle = '#4e6e3c'; q.lineCap = 'round'; q.lineWidth = 22 * S; q.beginPath(); let pen = false;
    for (let i = 0; i < NA; i++) { const p = AR[i], j = (fbm(i * .2, 4) - .5) * 14 * S; if (!grown(i)) { pen = false; continue; } pen ? q.lineTo(p.x + p.nx * j, p.y + p.ny * j) : q.moveTo(p.x + p.nx * j, p.y + p.ny * j); pen = true; } q.stroke();
    q.fillStyle = '#5f8a46'; for (let i = 0; i < NA; i += 2) { if (!grown(i)) continue; const p = AR[i], s = (hash(i) - .5) * 2; q.beginPath(); q.ellipse(p.x + p.nx * s * 20 * S, p.y + p.ny * s * 20 * S, 12 * S, 5 * S, Math.atan2(p.ty, p.tx) + s, 0, TAU); q.fill(); } }, { alpha: .55, name: 'wcA', done: t > 1.15 , ds });
  wc(g, W, H, S, q => { for (let i = 1; i < NA; i += 3) { if (!grown(i)) continue; const p = AR[i], s = (hash(i * 3) - .5) * 30 * S, x = p.x + p.nx * s, y = p.y + p.ny * s, fr = (8 + hash(i) * 7) * S, ph = hash(i * 9) * TAU;
    q.fillStyle = FL[i % 5]; for (let j = 0; j < 5; j++) { const a = ph + j / 5 * TAU; q.beginPath(); q.ellipse(x + Math.cos(a) * fr * .7, y + Math.sin(a) * fr * .7, fr * .62, fr * .45, a, 0, TAU); q.fill(); }
    q.fillStyle = '#7a3a1e'; K.circle(q, x, y, fr * .25); q.fill(); } }, { alpha: .62, edge: .7, name: 'wcF', res: .75, done: t > 1.15 , ds });
  }
  if (pageDone) { const keep = K.canvas(PG.width, PG.height); keep.getContext('2d').drawImage(PG, 0, 0); WCPAGE.set(pk, keep); }
  g0.drawImage(PG, 0, 0, W, H); }
  // the PhE, painted: pencil underdrawing, a variegated violet wash (wet-in-wet blooms, lifted patches), a second glaze painting itself left to right
  K.strokeMark(g, M, 'rgba(70,60,50,.35)', 1 * S);
  const paintLogo = (q) => { q.globalAlpha = .35; K.fillMark(q, { x: M.x + 2.5 * S, y: M.y + 2 * S, R: M.R }, '#4b2c8f', '#1f5fe0'); q.globalAlpha = 1; K.fillMark(q, M, '#4b2c8f', '#1f5fe0');
    q.globalCompositeOperation = 'source-atop'; const r = mulberry(360);
    for (let i = 0; i < 16; i++) { const x = M.x + (r() - .5) * 2.1 * hw, y = M.y + (r() - .5) * 2 * hh, rad = (30 + r() * 70) * S, c = ['122,63,176', '44,58,154', '160,74,154', '58,42,122'][i % 4], rg = q.createRadialGradient(x, y, 0, x, y, rad);
      rg.addColorStop(0, `rgba(${c},.65)`); rg.addColorStop(1, `rgba(${c},0)`); q.fillStyle = rg; K.circle(q, x, y, rad); q.fill(); }
    q.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 9; i++) { const x = M.x + (r() - .5) * 2.1 * hw, y = M.y + (r() - .5) * 2 * hh, rad = (25 + r() * 45) * S, rg = q.createRadialGradient(x, y, 0, x, y, rad);
      rg.addColorStop(0, 'rgba(0,0,0,.4)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = rg; K.circle(q, x, y, rad); q.fill(); } q.globalCompositeOperation = 'source-over'; };
  const LR = [M.x - hw - 30 * S, M.y - hh - 30 * S, hw * 2 + 60 * S, hh * 2 + 70 * S];
  wc(g, W, H, S, paintLogo, { alpha: .55, edge: 1.1, gr: .35, res: .75, name: 'wcL', done: true, rect: LR });
  const front = lerp(M.x - hw - 140 * S, M.x + hw + 140 * S, eo(seg(t, -.15, 1.0)));
  wc(g, W, H, S, q => { K.fillMark(q, M, '#4b2c8f', 'rgba(0,0,0,0)'); q.globalCompositeOperation = 'destination-in'; const lg = q.createLinearGradient(front - 120 * S, 0, front + 30 * S, 0); lg.addColorStop(0, '#000'); lg.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = lg; q.fillRect(0, 0, W, H); },
    { alpha: .4, edge: 1.2, gr: .3, res: .75, name: 'wcL2', done: t > 1.05, rect: LR });
  // the dots: on each beat a fresh charge of ultramarine drops in and blooms (a backrun ring)
  wc(g, W, H, S, q => { [5, 6, 7].forEach((d, i) => { const [x, y, r] = dotC(M, d), tb = .5 + i * .5, u = t - tb; if (u < 0) return; const bk = eo(seg(u, 0, .6));
    q.fillStyle = '#1f5fe0'; q.beginPath(); for (let j = 0; j <= 36; j++) { const a = j / 36 * TAU, rr = r * (1 + .5 * bk) * (.9 + .2 * fbm(Math.cos(a) * 2 + d, Math.sin(a) * 2)); j ? q.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : q.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } q.globalAlpha = .55 - .3 * bk; q.fill();
    q.globalAlpha = 1; K.circle(q, x, y, r * (1 + .25 * pulse(u, .08, .1))); q.fill(); }); }, { alpha: .65, edge: 1.4, gr: .2, res: .75, name: 'wcD', done: t > 2.15, rect: LR });
  // spatter
  g.save(); g.globalCompositeOperation = 'multiply'; for (let i = 0; i < 26; i++) { const r = mulberry(i * 5 + 1); g.fillStyle = FL[i % 5]; g.globalAlpha = .4 * k(.2, .5); K.circle(g, r() * W, r() * H, (1 + r() * 3.5) * S); g.fill(); } g.restore();
  g.fillStyle = 'rgba(80,60,40,.85)'; g.font = `600 ${32 * S}px Caveat`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.globalAlpha = k(.6, 1.0); g.fillText('golden hour — 18:40, the lawn', 70 * S, 100 * S); g.globalAlpha = 1;
}

// 37 URBAN SKETCH — a city tour: sepia fineliner that overshoots, loose watercolour off the lines; the PhE is the hanging shop sign
export function urbanSketch(g, t, { W, H, M, S, V }) {
  const PAP = K.paper('cold', 960, 540, [246, 238, 220], { mottle: 10, grain: 16, seed: 37 });
  g.drawImage(PAP, 0, 0, W, H);
  const d = clamp((t + .25) / 1.25), sep = '#4a3424', hw = K.halfW(M), hh = K.halfH(M), street = V ? H * .82 : H * .86;
  const bx0 = M.x - hw - 46 * S, bx1 = M.x + hw + 46 * S, by0 = M.y - hh - 36 * S, by1 = M.y + hh + 36 * S, bR = (by1 - by0) / 2;
  const blds = [[W * .02, W * .27, H * .24], [W * .74, W * .98, H * .2]];
  const beamY = by0 - 78 * S, bl = Math.max(0, Math.min(W * .27, bx0 - 34 * S)), br = Math.min(W, Math.max(W * .74, bx1 + 34 * S));
  // colour first, loose and slightly off the lines, leaving paper showing
  const ck = eo(seg(t, -.25, .55));
  wc(g, W, H, S, q => { const r = mulberry(370);
    q.fillStyle = '#9fbcd6'; for (let i = 0; i < 7; i++) { q.beginPath(); q.ellipse(W * (.15 + i * .12) + (r() - .5) * 60 * S, H * (.06 + r() * .1), W * .1 * ck + 1, H * (.08 + r() * .05) * ck + 1, 0, 0, TAU); q.fill(); }
    q.fillStyle = '#d8c6a0'; for (const [x0, x1, top] of blds) { K.wobble(q, [[x0 + 10 * S, top + 8 * S], [x1 + 12 * S, top + 10 * S], [x1 + 8 * S, lerp(top, street, ck)], [x0 + 14 * S, lerp(top, street, ck)]], 10 * S, x0 | 0, true); q.fill(); }
    q.fillStyle = '#c9573f'; for (const [x0, x1] of blds) { K.wobble(q, [[x0 + 8 * S, street - H * .26], [x0 + 8 * S + (x1 - x0) * .8 * ck, street - H * .26], [x0 + 8 * S + (x1 - x0) * .8 * ck, street - H * .215], [x0 + 8 * S, street - H * .215]], 5 * S, 7, true); q.fill(); }
    q.fillStyle = '#b8b0a0'; K.wobble(q, [[0, street + 6 * S], [W * ck, street + 6 * S], [W * ck, H], [0, H]], 8 * S, 3, true); q.fill();
    q.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 14; i++) { const x = r() * W, y = r() * H, rad = (30 + r() * 70) * S, rg = q.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, 'rgba(0,0,0,.8)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = rg; K.circle(q, x, y, rad); q.fill(); }
  }, { alpha: .55, edge: .8, name: 'usW', done: t > .6 });
  // fineliner: two facades, a street, the sign beam spanning it; lines overshoot their corners
  const lines = []; const L = (a, b) => lines.push([a, b]);
  for (const [x0, x1, top] of blds) { const w = x1 - x0;
    L([x0, top], [x1, top]); L([x0 - 8 * S, top - 14 * S], [x1 + 8 * S, top - 14 * S]); L([x0, top], [x0, street]); L([x1, top], [x1, street]);
    for (let f = 1; f < 5; f++) L([x0, top + f * (street - top) / 5], [x1, top + f * (street - top) / 5 - 4 * S]);
    for (let c = 0; c < 3; c++) for (let f = 0; f < 4; f++) { const wx = x0 + (c + .5) * w / 3 - 15 * S, wy = top + f * (street - top) / 5 + 20 * S; L([wx, wy], [wx + 30 * S, wy]); L([wx, wy], [wx, wy + 40 * S]); L([wx + 30 * S, wy], [wx + 30 * S, wy + 40 * S]); } }
  L([0, street], [W, street]); L([W * .36, street], [W * .3, H]); L([W * .64, street], [W * .7, H]);
  const beam = [[[bl, beamY], [br, beamY]], [[bl, beamY + 14 * S], [br, beamY + 14 * S]], [[bl, beamY + 60 * S], [bl + 60 * S, beamY + 14 * S]], [[br, beamY + 60 * S], [br - 60 * S, beamY + 14 * S]]];
  const chains = [bx0 + 86 * S, bx1 - 86 * S];
  g.strokeStyle = sep; g.lineWidth = 1.6 * S; g.lineCap = 'round';
  lines.forEach(([a, b], i) => { const u = clamp(d * lines.length * 1.3 - i * .9); if (u <= 0) return; const ex = lerp(a[0], b[0], u * 1.06), ey = lerp(a[1], b[1], u * 1.06);
    K.wobble(g, [[a[0] - (b[0] - a[0]) * .03, a[1] - (b[1] - a[1]) * .03], [ex, ey]], 2.2 * S, i * 3); g.stroke(); });
  // beam + chains (drawn early: the sign must hang from the first frame)
  const ek = clamp((t + .35) / .5);
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5; g.fillStyle = '#6b4a30'; g.fillRect(bl + 6 * S, beamY + 4 * S, (br - bl) * ek, 13 * S); g.restore();
  g.lineWidth = 1.8 * S; beam.forEach(([a, b], i) => { K.wobble(g, [a, [lerp(a[0], b[0], ek * 1.04), lerp(a[1], b[1], ek * 1.04)]], 1.8 * S, 60 + i); g.stroke(); });
  for (const cx of chains) { g.lineWidth = 1.3 * S; for (let y = beamY + 14 * S; y < by0 + 2 * S; y += 11 * S) { if ((y - beamY) / (by0 - beamY) > ek * 1.2) break; g.beginPath(); g.ellipse(cx + ((y / (11 * S)) % 2 ? 1 : -1) * .8 * S, y + 5 * S, 3.2 * S, 6 * S, 0, 0, TAU); g.stroke(); } }
  // the sign board: a pill (the brand's pattern language), paper inside so nothing shows through
  g.save(); K.rr(g, bx0, by0, bx1 - bx0, by1 - by0, bR); g.clip(); g.drawImage(PAP, 0, 0, W, H); g.restore();
  // board wash + the PhE in violet sign paint, both dropped a little off the lines
  wc(g, W, H, S, q => { q.fillStyle = '#d2b07a'; K.rr(q, bx0 + 12 * S, by0 + 9 * S, bx1 - bx0 - 4 * S, by1 - by0 - 2 * S, bR); q.fill(); K.fillMark(q, { x: M.x + 6 * S, y: M.y + 4 * S, R: M.R }, '#4a2a8a', 'rgba(0,0,0,0)'); }, { alpha: .62, edge: .9, gr: .25, res: .75, name: 'usL', done: true, rect: [bx0 - 10 * S, by0 - 10 * S, bx1 - bx0 + 40 * S, by1 - by0 + 30 * S] });
  const pill = (inset, seed) => { const pts = []; const x0 = bx0 + inset, x1 = bx1 - inset, y0 = by0 + inset, y1 = by1 - inset, r = (y1 - y0) / 2;
    for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * Math.PI; pts.push([x1 - r + Math.cos(a) * r, (y0 + y1) / 2 + Math.sin(a) * r]); }
    for (let i = 0; i <= 16; i++) { const a = Math.PI / 2 + i / 16 * Math.PI; pts.push([x0 + r + Math.cos(a) * r, (y0 + y1) / 2 + Math.sin(a) * r]); }
    K.wobble(g, pts, 2 * S, seed, true); g.stroke(); };
  g.strokeStyle = sep; g.lineWidth = 1.8 * S; pill(0, 70); g.lineWidth = 1.1 * S; pill(8 * S, 71);
  // the fineliner outline of the PhE, drawn quickly over the paint
  for (let k = 0; k < 5; k++) { const u = clamp((t + .3) * 2.2 - k * .22); if (u <= 0) continue;
    outlineScreen(M, k).map(p => decimate(p, 9 * S)).forEach((poly, j) => { const pts = poly.slice(0, Math.max(2, Math.ceil(poly.length * u))); g.strokeStyle = sep; g.lineWidth = 1.7 * S; K.wobble(g, pts, 1.8 * S, 40 + k * 7 + j, u >= 1); g.stroke(); }); }
  // the dots: fineliner rings, then a blue drop lands in each on the beat and blooms
  [5, 6, 7].forEach((dk, i) => { const [x, y, r] = dotC(M, dk), tb = .5 + i * .25, u = t - tb;
    if (u > 0) { const bk = eo(seg(u, 0, .35)); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .75; g.fillStyle = BLUE; K.circle(g, x + 3 * S, y + 2 * S, r * (1.0 + .35 * (1 - bk)) * back(seg(u, 0, .12), 2)); g.fill();
      g.globalAlpha = .35 * (1 - bk * .6); K.circle(g, x + 3 * S, y + 2 * S, r * (1.15 + .5 * bk)); g.fill(); g.restore(); }
    else if (u > -.18) { const yy = lerp(y - 120 * S, y, ei(seg(u, -.18, 0))); g.fillStyle = 'rgba(37,99,235,.7)'; g.beginPath(); g.ellipse(x, yy, r * .4, r * .6, 0, 0, TAU); g.fill(); }
    g.strokeStyle = sep; g.lineWidth = 1.6 * S; K.wobble(g, decimate(outlineScreen(M, dk)[0], 6 * S), 1.2 * S, 90 + dk, true); g.stroke(); });
  // a tour group under the sign: a guide with a little flag
  const py = V ? H * .9 : H * .935, n = 9;
  for (let i = 0; i < n; i++) { const x = M.x + (i - (n - 1) / 2) * 40 * S + (hash(i) - .5) * 14 * S, h = (34 + hash(i * 3) * 10) * S, u = clamp(d * 2 - .6 - i * .04); if (u <= 0) continue;
    g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5; g.fillStyle = ['#c9573f', '#6f8fb8', '#d9b24a', '#7b9a62'][i % 4]; g.fillRect(x - 7 * S + 3 * S, py - h * .62 + 3 * S, 14 * S, h * .45); g.restore();
    g.strokeStyle = sep; g.lineWidth = 1.4 * S; K.circle(g, x, py - h * .78, 5 * S); g.stroke(); K.wobble(g, [[x - 7 * S, py - h * .62], [x - 6 * S, py - h * .2], [x - 4 * S, py]], 1 * S, i); g.stroke(); K.wobble(g, [[x + 7 * S, py - h * .62], [x + 6 * S, py - h * .2], [x + 4 * S, py]], 1 * S, i + 20); g.stroke();
    if (i === 0) { g.beginPath(); g.moveTo(x - 10 * S, py - h * .6); g.lineTo(x - 12 * S, py - h * 1.5); g.stroke(); g.fillStyle = BLUE; g.globalAlpha = .8; g.beginPath(); g.moveTo(x - 12 * S, py - h * 1.5); g.lineTo(x + 8 * S, py - h * 1.38); g.lineTo(x - 12 * S, py - h * 1.26); g.fill(); g.globalAlpha = 1; } }
  g.fillStyle = sep; g.font = `600 ${28 * S}px Caveat`; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; g.globalAlpha = eo(seg(t, .6, 1.0)); g.fillText('old quarter, 10:20 — group of 40', W * .95, V ? H * .965 : H * .95); g.globalAlpha = 1;
}

// 38 UKIYO-E — a Japan incentive: bokashi sky, a floating torii, an indigo noren dyed with the PhE, carved sea, a boat of travellers
export function ukiyoe(g, t, { W, H, M, S, V }) {
  const pan = (t - 1) * 30 * S, hw = K.halfW(M), hh = K.halfH(M), sea = H * .66, sumi = '#2A2A30', ver = '#C8402A', cream = '#F3E9CF';
  const sky = g.createLinearGradient(0, 0, 0, sea); sky.addColorStop(0, '#1F3E6E'); sky.addColorStop(.5, '#9DB4C8'); sky.addColorStop(1, '#F1E6CC'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // moon and kasumi bands (pills: the brand's pattern language)
  const mx = V ? W * .78 : W * .13, my = V ? H * .12 : H * .2; g.fillStyle = '#F6EED6'; K.circle(g, mx, my, 64 * S); g.fill(); g.strokeStyle = sumi; g.lineWidth = 2 * S; g.stroke();
  for (const [x, y, w, c] of [[W * .02, H * .29, W * .34, '#E9C9B8'], [W * .6, H * .13, W * .3, '#EAD9C0'], [W * .66, H * .5, W * .36, '#E9C9B8']]) { const xx = x + pan * .2, h = 26 * S;
    g.fillStyle = c; K.rr(g, xx, y, w, h, h / 2); g.fill(); g.strokeStyle = 'rgba(42,42,48,.6)'; g.lineWidth = 1.5 * S; g.stroke(); }
  // distant mountain with snow cap
  const fx = (V ? W * .2 : W * .8) - pan * .3, fw = V ? W * .3 : W * .22;
  g.fillStyle = '#3E5C7A'; g.beginPath(); g.moveTo(fx - fw, sea); g.lineTo(fx, sea - fw * 1.3); g.lineTo(fx + fw, sea); g.fill();
  g.fillStyle = '#F4EFE2'; g.beginPath(); g.moveTo(fx - fw * .22, sea - fw * 1.3 * .78); g.lineTo(fx, sea - fw * 1.3); g.lineTo(fx + fw * .22, sea - fw * 1.3 * .78); for (let i = 0; i < 4; i++) g.lineTo(fx + fw * (.18 - i * .12), sea - fw * 1.3 * (.74 + (i % 2) * .05)); g.fill();
  // sea in flat blocks with carved swell lines
  g.fillStyle = '#2B5C8A'; g.fillRect(0, sea, W, H); g.fillStyle = '#1D3F66'; g.fillRect(0, sea + (H - sea) * .48, W, H);
  // the torii standing in the sea
  const px = hw + 68 * S, pw = 36 * S, kY = M.y - hh - 128 * S, nY = M.y - hh - 70 * S, ext = px + 104 * S;
  for (const sx of [-1, 1]) { const x = M.x + sx * px; g.fillStyle = ver; g.fillRect(x - pw / 2, kY, pw, H * .93 - kY); g.fillStyle = sumi; g.fillRect(x - pw / 2 - 3 * S, H * .9, pw + 6 * S, H * .03); g.strokeStyle = sumi; g.lineWidth = 2.2 * S; g.strokeRect(x - pw / 2, kY, pw, H * .9 - kY);
    g.fillStyle = 'rgba(200,64,42,.45)'; for (let i = 0; i < 6; i++) g.fillRect(x - pw / 2 + Math.sin(i * 2 + t * 3) * 6 * S, H * .935 + i * 12 * S, pw, 5 * S); }
  g.fillStyle = ver; g.fillRect(M.x - px - 50 * S, nY, (px + 50 * S) * 2, 24 * S); g.strokeStyle = sumi; g.lineWidth = 2.2 * S; g.strokeRect(M.x - px - 50 * S, nY, (px + 50 * S) * 2, 24 * S);
  g.fillStyle = ver; g.fillRect(M.x - 18 * S, kY + 30 * S, 36 * S, nY - kY - 30 * S); g.strokeRect(M.x - 18 * S, kY + 30 * S, 36 * S, nY - kY - 30 * S);
  const kas = (y, th, e, lift, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(M.x - e, y - lift); g.quadraticCurveTo(M.x, y + lift * .4, M.x + e, y - lift); g.lineTo(M.x + e - 10 * S, y - lift + th); g.quadraticCurveTo(M.x, y + th + lift * .3, M.x - e + 10 * S, y - lift + th); g.closePath(); g.fill(); g.strokeStyle = sumi; g.lineWidth = 2.2 * S; g.stroke(); };
  kas(kY + 16 * S, 16 * S, ext - 20 * S, 16 * S, ver); kas(kY, 22 * S, ext, 26 * S, '#1E1C22');
  // the noren: three indigo panels split between the letters, the PhE resist-dyed in cream; only the hem sways
  const nx0 = M.x - hw - 32 * S, nx1 = M.x + hw + 32 * S, ny0 = nY + 26 * S, ny1 = M.y + hh + 36 * S;
  const cuts = [nx0, K.toScreen(M, 164, 0)[0], K.toScreen(M, 314.5, 0)[0], nx1];
  g.fillStyle = '#5A3A22'; g.fillRect(nx0 - 14 * S, ny0 - 6 * S, nx1 - nx0 + 28 * S, 8 * S);
  for (let i = 0; i < 3; i++) { const a = cuts[i] + (i ? 2.5 * S : 0), b = cuts[i + 1] - (i < 2 ? 2.5 * S : 0), sw = Math.sin(t * 2.2 + i * 1.3) * 4 * S;
    g.save(); g.beginPath(); g.moveTo(a, ny0); g.lineTo(b, ny0); g.lineTo(b + sw, ny1 + Math.sin(t * 2 + i) * 2 * S); g.lineTo(a + sw, ny1); g.closePath();
    const nc = g.createLinearGradient(a, 0, b, 0); nc.addColorStop(0, '#1A2F5C'); nc.addColorStop(.5, '#22407A'); nc.addColorStop(1, '#1A2F5C'); g.fillStyle = nc; g.fill(); g.strokeStyle = sumi; g.lineWidth = 2 * S; g.stroke();
    g.clip(); g.globalAlpha = .12; g.strokeStyle = '#000'; g.lineWidth = 1 * S; for (let x = a; x < b; x += 5 * S) { g.beginPath(); g.moveTo(x, ny0); g.lineTo(x + sw, ny1); g.stroke(); } g.restore();
    for (let j = 0; j < 3; j++) { const lx = lerp(a, b, (j + .5) / 3); g.fillStyle = '#1A2F5C'; g.fillRect(lx - 7 * S, ny0 - 12 * S, 14 * S, 14 * S); } }
  // dye: cream PhE (with a faint blur where the dye crept), vermilion dots printed on the beats
  g.save(); g.globalAlpha = .22; for (const [dx, dy] of [[1.5, 1], [-1, 1.5]]) K.fillMark(g, { x: M.x + dx * S, y: M.y + dy * S, R: M.R }, cream, 'rgba(0,0,0,0)'); g.restore(); K.fillMark(g, M, cream, 'rgba(0,0,0,0)');
  [5, 6, 7].forEach((dk, i) => { const [x, y, r] = dotC(M, dk), pk = Math.max(pulse(t, .5 + i * .5, .1), pulse(t, 2 + i * .5, .1)), off = pk * 3 * S;
    g.fillStyle = ver; K.circle(g, x + off, y - off, r * (1 + .18 * pk)); g.fill(); g.strokeStyle = 'rgba(42,42,48,.5)'; g.lineWidth = 1.2 * S; g.stroke(); });
  // carved swell lines across the sea and over the pillar bases
  g.strokeStyle = '#E8E1CF'; g.lineWidth = 2.4 * S;
  for (let r = 0; r < 12; r++) { const y = sea + 10 * S + r * (H - sea) / 12; g.beginPath(); for (let x = -40; x < W + 40; x += 6 * S) { const yy = y + Math.sin((x + pan * (1 + r * .1)) / (60 * S) + r) * 6 * S; x === -40 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); }
  // boat of travellers (foreground, cropped boldly)
  const bx = (V ? W * .3 : W * .2) - pan * 1.5, by = H * .86 + Math.sin(t * 2) * 4 * S;
  g.fillStyle = '#5A3A22'; g.beginPath(); g.moveTo(bx - 200 * S, by); g.quadraticCurveTo(bx, by + 50 * S, bx + 220 * S, by - 20 * S); g.lineTo(bx + 200 * S, by + 10 * S); g.quadraticCurveTo(bx, by + 70 * S, bx - 190 * S, by + 20 * S); g.fill(); g.strokeStyle = sumi; g.lineWidth = 2 * S; g.stroke();
  for (let i = 0; i < 5; i++) { const x = bx - 130 * S + i * 60 * S; g.fillStyle = ['#C8402A', '#2B4C7A', '#E2B13A', '#3B6A4A', '#7A4FA0'][i]; g.beginPath(); g.moveTo(x - 16 * S, by + 4 * S); g.lineTo(x, by - 44 * S); g.lineTo(x + 16 * S, by + 4 * S); g.fill(); g.fillStyle = '#E8C8A0'; K.circle(g, x, by - 50 * S, 8 * S); g.fill(); g.fillStyle = '#C8A050'; g.beginPath(); g.moveTo(x - 18 * S, by - 52 * S); g.lineTo(x, by - 66 * S); g.lineTo(x + 18 * S, by - 52 * S); g.fill(); }
  // cartouche + seal
  const cx = V ? W * .06 : W * .88, cy = V ? H * .05 : H * .08;
  g.fillStyle = '#F2E2A8'; g.fillRect(cx, cy, 60 * S, 260 * S); g.strokeStyle = sumi; g.lineWidth = 2 * S; g.strokeRect(cx, cy, 60 * S, 260 * S);
  g.fillStyle = sumi; g.font = `${24 * S}px IMFell`; g.textAlign = 'center'; g.textBaseline = 'middle'; 'KYOTO'.split('').forEach((c, i) => g.fillText(c, cx + 30 * S, cy + 40 * S + i * 44 * S));
  g.fillStyle = '#B02E22'; g.fillRect(cx + 10 * S, cy + 280 * S, 40 * S, 40 * S);
  g.save(); g.globalAlpha = .3; g.globalCompositeOperation = 'multiply'; g.drawImage(K.paper('washi', 960, 540, [235, 225, 200], { mottle: 26, grain: 20, fibres: 3000, seed: 38 }), 0, 0, W, H); g.restore();
}

// 39 TILT-SHIFT — a street festival from above: a real place made toy-sized; the PhE painted on the stage roof, the crowd around it
const CROWD = new Map();
export function tiltShift(g, t, { W, H, M, S, V }) {
  const hw = K.halfW(M), hh = K.halfH(M);
  const sx0 = M.x - hw - 40 * S, sx1 = M.x + hw + 40 * S, sy0 = M.y - hh - 34 * S, sy1 = M.y + hh + 34 * S;            // stage roof
  const px0 = sx0 - 130 * S, px1 = sx1 + 130 * S, py0 = sy0 - 90 * S, py1 = sy1 + 170 * S, pr = 120 * S;              // plaza (a pill-cornered square)
  const city = K.tex('s3tilt:' + M.x + ',' + M.y, W, H, (q) => {
    q.fillStyle = '#7C8A72'; q.fillRect(0, 0, W, H);
    const blk = 230 * S, road = 46 * S, ox = (M.x % (blk + road)) - road / 2 - blk / 2, oy = (M.y % (blk + road)) - road / 2 - blk / 2;
    q.fillStyle = '#5A5E66'; for (let x = ox - (blk + road); x < W; x += blk + road) q.fillRect(x + blk, 0, road, H); for (let y = oy - (blk + road); y < H; y += blk + road) q.fillRect(0, y + blk, W, road);
    q.strokeStyle = 'rgba(255,255,255,.5)'; q.setLineDash([10 * S, 12 * S]); q.lineWidth = 1.5 * S;
    for (let x = ox - (blk + road); x < W; x += blk + road) { q.beginPath(); q.moveTo(x + blk + road / 2, 0); q.lineTo(x + blk + road / 2, H); q.stroke(); }
    for (let y = oy - (blk + road); y < H; y += blk + road) { q.beginPath(); q.moveTo(0, y + blk + road / 2); q.lineTo(W, y + blk + road / 2); q.stroke(); } q.setLineDash([]);
    for (let x = ox - (blk + road), i = 0; x < W; x += blk + road, i++) for (let y = oy - (blk + road), j = 0; y < H; y += blk + road, j++)
      for (let b = 0; b < 4; b++) { const r = mulberry(i * 31 + j * 7 + b), bx = x + (b % 2) * blk / 2 + 6 * S, by = y + Math.floor(b / 2) * blk / 2 + 6 * S, bw = blk / 2 - 12 * S, bh = blk / 2 - 12 * S;
        if (bx + bw > px0 - 20 * S && bx < px1 + 20 * S && by + bh > py0 - 20 * S && by < py1 + 20 * S) continue;
        q.fillStyle = 'rgba(0,0,0,.35)'; q.fillRect(bx + 10 * S, by + 10 * S, bw, bh); q.fillStyle = ['#C8735A', '#D9C9A8', '#A8B4BE', '#E2A85A', '#8A9AA8'][Math.floor(r() * 5)]; q.fillRect(bx, by, bw, bh);
        q.fillStyle = 'rgba(255,255,255,.18)'; q.fillRect(bx, by, bw, 4 * S); q.fillStyle = 'rgba(0,0,0,.12)'; q.fillRect(bx + bw * .3, by + bh * .3, bw * .2, bh * .15); }
    // plaza paving
    q.fillStyle = '#D9CFBC'; K.rr(q, px0, py0, px1 - px0, py1 - py0, pr); q.fill(); q.save(); q.clip(); q.strokeStyle = 'rgba(120,100,80,.18)'; q.lineWidth = 1 * S;
    for (let x = px0; x < px1; x += 18 * S) { q.beginPath(); q.moveTo(x, py0); q.lineTo(x, py1); q.stroke(); } for (let y = py0; y < py1; y += 18 * S) { q.beginPath(); q.moveTo(px0, y); q.lineTo(px1, y); q.stroke(); } q.restore();
    // trees ringing the plaza (open at the front)
    const per = []; const n = 46; for (let i = 0; i < n; i++) { const a = i / n * TAU, x = M.x + Math.cos(a) * (px1 - px0) * .5 * .97, y = (py0 + py1) / 2 + Math.sin(a) * (py1 - py0) * .5 * .95; if (Math.sin(a) > .75) continue;
      const cx = clamp(x, px0 + 14 * S, px1 - 14 * S), cy = clamp(y, py0 + 14 * S, py1 - 14 * S); q.fillStyle = 'rgba(0,0,0,.3)'; K.circle(q, cx + 9 * S, cy + 9 * S, 15 * S); q.fill(); q.fillStyle = '#3F7A3A'; K.circle(q, cx, cy, 15 * S); q.fill(); q.fillStyle = 'rgba(160,220,120,.35)'; K.circle(q, cx - 4 * S, cy - 4 * S, 7 * S); q.fill(); }
    // light towers
    for (const [x, y] of [[sx0 - 40 * S, sy1 + 90 * S], [sx1 + 40 * S, sy1 + 90 * S]]) { q.fillStyle = 'rgba(0,0,0,.35)'; q.fillRect(x + 6 * S, y + 6 * S, 16 * S, 16 * S); q.fillStyle = '#3A3E46'; q.fillRect(x - 8 * S, y - 8 * S, 16 * S, 16 * S); }
    // the stage roof: a white membrane, shadow to the south-east, panel seams
    q.save(); q.shadowColor = 'rgba(0,0,0,.45)'; q.shadowBlur = 8 * S; q.shadowOffsetX = 16 * S; q.shadowOffsetY = 16 * S; q.fillStyle = '#F4F1EB'; K.rr(q, sx0, sy0, sx1 - sx0, sy1 - sy0, 22 * S); q.fill(); q.restore();
    q.strokeStyle = 'rgba(0,0,0,.08)'; q.lineWidth = 1.2 * S; for (let i = 1; i < 6; i++) { const x = lerp(sx0, sx1, i / 6); q.beginPath(); q.moveTo(x, sy0 + 4 * S); q.lineTo(x, sy1 - 4 * S); q.stroke(); }
    q.strokeStyle = 'rgba(0,0,0,.18)'; q.lineWidth = 3 * S; K.rr(q, sx0 + 2 * S, sy0 + 2 * S, sx1 - sx0 - 4 * S, sy1 - sy0 - 4 * S, 20 * S); q.stroke();
    K.fillMark(q, M, VIOLET, 'rgba(0,0,0,0)');
    K.inMark(q, M, (q) => { const P = K.markPaths(), r = mulberry(390); for (let k = 0; k < 5; k++) { q.save(); q.clip(P[k]); q.fillStyle = 'rgba(244,241,235,.22)'; for (let i = 0; i < 260; i++) { K.circle(q, r() * LW, r() * LH, .4 + r() * 1.3); q.fill(); } q.fillStyle = 'rgba(255,255,255,.12)'; q.fillRect(0, 0, LW, 4); q.restore(); } });
  });
  const [C, q] = scratch('tilt', W, H); q.drawImage(city, 0, 0);
  // the painted dots: on the beats a light ring runs out of each (the crowd cheers)
  [5, 6, 7].forEach((dk, i) => { const [x, y, r] = dotC(M, dk); q.fillStyle = BLUE; K.circle(q, x, y, r); q.fill();
    for (const tb of [.5 + i * .25, 1.5 + i * .25]) { const u = t - tb; if (u < 0 || u > .6) continue; q.strokeStyle = `rgba(255,255,255,${.95 * (1 - u / .6)})`; q.lineWidth = 4 * S; K.circle(q, x, y, r * (1.2 + u * 4)); q.stroke(); q.strokeStyle = `rgba(37,99,235,${.7 * (1 - u / .6)})`; q.lineWidth = 2 * S; K.circle(q, x, y, r * (1.05 + u * 3)); q.stroke(); } });
  // crowd: packed in front of the stage, thinner at the sides; people bob on the beat
  const key = W + 'x' + H; if (!CROWD.has(key)) { const r = mulberry(39), P = [];
    while (P.length < 1700) { const x = lerp(px0 + 24 * S, px1 - 24 * S, r()), y = lerp(py0 + 24 * S, py1 - 20 * S, r());
      if (x > sx0 - 10 * S && x < sx1 + 26 * S && y > sy0 - 10 * S && y < sy1 + 26 * S) continue;
      const front = y > sy1 ? 1 - (y - sy1) / (py1 - sy1) * .5 : .14; if (r() > front) continue; P.push([x, y, Math.floor(r() * 6), r()]); } CROWD.set(key, P); }
  const beat = (t % .5) / .5, COL = ['#E8553D', '#2A5CB3', '#F2B134', '#FFFFFF', '#2E8B57', '#B56AA8'];
  for (const [x, y, c, h] of CROWD.get(key)) { const bob = h > .5 ? -Math.max(0, Math.sin(beat * Math.PI)) * 2 * S : 0, dx = Math.sin(t * 2 + h * 30) * 1.5 * S;
    q.fillStyle = 'rgba(0,0,0,.3)'; q.fillRect(x + dx + 2 * S, y + 2 * S, 4 * S, 4 * S); q.fillStyle = COL[c]; q.fillRect(x + dx - 2 * S, y - 2 * S + bob, 4 * S, 4 * S); q.fillStyle = '#E8C8A8'; q.fillRect(x + dx - 1 * S, y - 1 * S + bob, 2 * S, 2 * S); }
  // time-lapse traffic streaks on the roads
  const blk = 230 * S, road = 46 * S, ox = (M.x % (blk + road)) - road / 2 - blk / 2, oy = (M.y % (blk + road)) - road / 2 - blk / 2;
  for (let i = 0; i < 44; i++) { const lane = i % 2, horiz = i % 4 < 2, sp = (2 + hash(i) * 2) * W * .4, pos = (hash(i * 9) * W + t * sp) % (W + 200 * S);
    q.fillStyle = ['#ff5a4a', '#ffffff', '#2a6ad8', '#f2d23a'][i % 4]; let x, y, w, h;
    if (horiz) { y = oy + blk + road * (lane ? .3 : .7) + (Math.floor(i / 4) % 4) * (blk + road); x = lane ? pos - 100 * S : W - pos; w = 16 * S; h = 6 * S; }
    else { x = ox + blk + road * (lane ? .3 : .7) + (Math.floor(i / 4) % 5) * (blk + road); y = lane ? (pos % (H + 200 * S)) - 100 * S : H - pos % (H + 200 * S); w = 6 * S; h = 16 * S; }
    if (x + w > px0 && x < px1 && y + h > py0 && y < py1) continue; q.fillRect(x - w / 2, y - h / 2, w, h); }
  // cloud shadow sweeping across
  const cx = lerp(-W * .3, W * 1.3, (t + .3) / 2.6), cs = q.createRadialGradient(cx, H * .4, 0, cx, H * .4, W * .35); cs.addColorStop(0, 'rgba(0,0,30,.22)'); cs.addColorStop(1, 'rgba(0,0,30,0)'); q.fillStyle = cs; q.fillRect(0, 0, W, H);
  g.save(); g.filter = 'saturate(1.35) contrast(1.08)'; g.drawImage(C, 0, 0); g.restore();
  // tilt-shift: graduated blur top and bottom
  for (const [y0, y1, b] of [[0, H * .16, 10], [H * .16, H * .26, 4], [H * .74, H * .84, 4], [H * .84, H, 10]]) { g.save(); g.beginPath(); g.rect(0, y0, W, y1 - y0); g.clip(); g.filter = `blur(${b * S}px) saturate(1.35)`; g.drawImage(C, 0, 0); g.restore(); }
  K.vignette(g, W, H, .25, .45);
}

// 40 IMPASTO — a reception in the rain: palette-knife planes, warm lamps against cool shadow; the PhE a painted neon sign, wet reflections
const IMPG = new Map();
function impGlow(W, H, M) {
  const key = W + 'x' + H; if (IMPG.has(key)) return IMPG.get(key);
  const f = 12, w = Math.ceil(W / f), h = Math.ceil(H / f), c = K.canvas(w, h), q = c.getContext('2d'), MM = { x: M.x / f, y: M.y / f, R: M.R / f };
  q.filter = 'blur(2px)'; K.fillMark(q, MM, 'rgb(255,0,0)', 'rgb(0,0,255)'); q.globalCompositeOperation = 'lighter'; q.filter = 'blur(6px)'; q.globalAlpha = .45; K.fillMark(q, MM, 'rgb(255,0,0)', 'rgb(0,0,255)');
  const d = q.getImageData(0, 0, w, h).data, G = { w, h, f, d }; IMPG.set(key, G); return G;
}
export function impasto(g, t, { W, H, M, S, V }) {
  const hor = H * .66, hw = K.halfW(M), hh = K.halfH(M);
  const bld = [[0, .2, .34], [.2, .3, .26], [.3, .7, .14], [.7, .82, .3], [.82, 1.0, .22]];
  const lamps = [[W * .14, H * .46], [W * .86, H * .44]];
  const G = impGlow(W, H, M);
  const glow = (x, y) => { const i = clamp(Math.floor(x / G.f), 0, G.w - 1), j = clamp(Math.floor(y / G.f), 0, G.h - 1), o = (j * G.w + i) * 4; return [G.d[o] / 255, G.d[o + 2] / 255]; };
  const sceneTop = (x, y) => {
    let c = mix([28, 30, 72], [86, 52, 96], clamp(y / hor));
    for (const [x0, x1, top] of bld) if (x > x0 * W && x < x1 * W && y > top * H) { c = x0 === .3 ? [44, 30, 52] : [24, 22, 38]; const wx = (x - x0 * W) % (44 * S), wy = (y - top * H) % (52 * S);
      const inSign = Math.abs(x - M.x) < hw + 24 * S && Math.abs(y - M.y) < hh + 24 * S;
      if (!inSign && wx > 14 * S && wx < 30 * S && wy > 14 * S && wy < 34 * S && hash(Math.floor(x / (44 * S)) * 7 + Math.floor(y / (52 * S))) > .5) c = [255, 196, 110]; }
    for (const [lx, ly] of lamps) { const d = Math.hypot(x - lx, y - ly); c = mix(c, [255, 190, 90], Math.max(0, 1 - d / (150 * S)) * .85); }
    const [gs, gd] = glow(x, y); c = mix(c, [150, 100, 240], Math.min(1, gs) * .5); return mix(c, [60, 120, 255], Math.min(1, gd * 1.4) * .55); };
  const scene = (x, y) => y < hor ? sceneTop(x, y) : mix([20, 22, 38], sceneTop(x + Math.sin(y * .05) * 12 * S, hor - (y - hor) * 1.3), .6);
  // the painting itself (static): underpainting in coarse planes, then 4200 knife strokes — cached
  const PAINT = K.tex('s3imp:' + M.x + ',' + M.y, W, H, (q) => {
    const uw = 160, uh = Math.round(160 * H / W), UP = K.canvas(uw, uh), u = UP.getContext('2d');
    for (let y = 0; y < uh; y++) for (let x = 0; x < uw; x++) { u.fillStyle = rgb(scene((x + .5) * W / uw, (y + .5) * H / uh)); u.fillRect(x, y, 1, 1); }
    q.filter = `blur(${10 * S}px)`; q.drawImage(UP, -20, -20, W + 40, H + 40); q.filter = 'none';
    const r = mulberry(40);
    for (let i = 0; i < 4200; i++) { const x = r() * W, y = r() * H, c = scene(x, y), j = (r() - .5) * 30, w = (18 + r() * 34) * S, h = (8 + r() * 14) * S, a = (y > hor ? Math.PI / 2 : 0) + (r() - .5) * .9;
      q.save(); q.translate(x, y); q.rotate(a); q.fillStyle = rgb([c[0] + j, c[1] + j, c[2] + j]); K.poly(q, [[-w / 2, -h / 2], [w / 2, -h / 2 + 3 * S], [w / 2, h / 2], [-w / 2 + 4 * S, h / 2]]); q.fill();
      q.strokeStyle = `rgba(255,255,255,${.12 + r() * .1})`; q.lineWidth = 1.4 * S; q.beginPath(); q.moveTo(-w / 2, -h / 2); q.lineTo(w / 2, -h / 2 + 3 * S); q.stroke(); q.restore(); }
  });
  g.drawImage(PAINT, 0, 0);
  // neon state: the h-arch buzzes on at the start; each dot flares on its beat
  const arch = t < .62 && t > .5 && hash(Math.floor(t * 40)) > .4 ? .25 : 1;
  const dotk = [5, 6, 7].map((dk, i) => .7 + .6 * Math.max(pulse(t, .5 + i * .25, .09), pulse(t, 1.5 + i * .25, .09)));
  // wet reflections on the street: the sign smeared into vertical knife streaks
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 8; k++) { const R = k < 5 ? partRes(M, k, 9 * S) : resample(K.partLinePts(M, k), 7 * S), dk = k < 5 ? (k === 2 ? arch : 1) : dotk[k - 5];
    R.forEach((p, i) => { const ry = hor + (hor - p.y) * 1.05 + 20 * S, fade = clamp(1 - (ry - hor) / (H - hor) * .9), wob = Math.sin(ry * .06 + t * 4 + i) * 5 * S, hgt = (18 + hash(i * 7 + k) * 30) * S;
      g.fillStyle = k < 5 ? `rgba(170,120,255,${.28 * fade * dk})` : `rgba(80,140,255,${.4 * fade * dk})`; g.fillRect(p.x + wob - 4 * S, ry - hgt / 2, 8 * S, hgt); }); }
  g.restore();
  // the neon sign: soft halo, knife-laid tube, a broken white-hot core
  { const f = .25, [C, q] = lowres('impHalo', W, H, f); q.filter = `blur(${16 * S * f}px)`; q.globalAlpha = .6; K.lineMark(q, M, 'rgb(150,100,255)', ST * K.logoScale(M) * 2.2, null, [0, 1, 3, 4]);
    q.globalAlpha = .6 * arch; K.lineMark(q, M, 'rgb(150,100,255)', ST * K.logoScale(M) * 2.2, null, [2]);
    q.filter = `blur(${10 * S * f}px)`; [5, 6, 7].forEach((dk, i) => { const [x, y, r] = dotC(M, dk); q.globalAlpha = Math.min(1, .7 * dotk[i]); q.fillStyle = 'rgb(60,120,255)'; K.circle(q, x, y, r * 2.4); q.fill(); });
    g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingQuality = 'high'; g.drawImage(C, 0, 0, W, H); g.restore(); }
  K.inMark(g, M, (q) => { const P = K.markPaths(), rr = mulberry(50), dark = [40, 30, 70];
    P.forEach((p, k) => { const dot = K.isAcc(k), br = dot ? Math.min(1, dotk[k - 5]) : (k === 2 ? arch : 1); q.save(); q.clip(p);
      const pal = dot ? [[225, 236, 255], [130, 170, 255], [70, 120, 250]] : [[246, 236, 255], [205, 180, 255], [168, 130, 255]];
      q.fillStyle = rgb(mix(dark, pal[1], br)); q.fill(p);
      if (dot) { const pt = LOGO.parts[k], rg = q.createRadialGradient(pt.cx - 3, pt.cy - 3, 0, pt.cx, pt.cy, pt.r); rg.addColorStop(0, rgb(mix(dark, pal[0], br))); rg.addColorStop(1, rgb(mix(dark, pal[2], br))); q.fillStyle = rg; q.fill(p);
        for (let i = 0; i < 6; i++) { const a = rr() * TAU; q.fillStyle = rgb(mix(dark, pal[1 + (i % 2)], br)); q.save(); q.translate(pt.cx + Math.cos(a) * 7, pt.cy + Math.sin(a) * 7); q.rotate(a + 1.4); q.fillRect(-7, -2.5, 14, 5); q.restore(); } }
      else { const L = resample(LOGO.parts[k].pts, 7); L.forEach((p2) => { const side = rr() < .5 ? -1 : 1, c = mix(pal[side < 0 ? 1 : 2], pal[0], rr() * .4); q.fillStyle = rgb(mix(dark, c, br));
        q.save(); q.translate(p2.x + p2.nx * side * 6.5, p2.y + p2.ny * side * 6.5); q.rotate(Math.atan2(p2.ty, p2.tx) + (rr() - .5) * .35); K.poly(q, [[-9, -3.5], [9, -3], [9, 3.5], [-7, 3.5]]); q.fill(); q.restore(); }); }
      q.restore(); });
    q.lineCap = 'round'; q.lineJoin = 'round';
    for (let k = 0; k < 8; k++) { const dot = K.isAcc(k), br = dot ? dotk[k - 5] : (k === 2 ? arch : 1); if (br < .5) continue;
      if (dot) { const pt = LOGO.parts[k]; q.fillStyle = `rgba(245,250,255,${Math.min(1, .55 * br)})`; K.circle(q, pt.cx - 1.5, pt.cy - 1.5, pt.r * .42); q.fill(); continue; }
      q.strokeStyle = 'rgba(255,252,255,.92)'; q.lineWidth = 6; const L = resample(LOGO.parts[k].pts, 4); q.beginPath(); let pen = false;
      L.forEach((p2, i) => { if (vn2(i * .25, k * 3) < .14) { pen = false; return; } pen ? q.lineTo(p2.x, p2.y) : q.moveTo(p2.x, p2.y); pen = true; }); q.stroke(); } });
  // rain and rings in the puddles
  g.strokeStyle = 'rgba(220,225,255,.25)'; g.lineWidth = 1.2 * S; for (let i = 0; i < 160; i++) { const x = (hash(i) * W + t * 120 * S) % W, y = (hash(i + 7) * H + t * 1400 * S) % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6 * S, y + 26 * S); g.stroke(); }
  g.lineWidth = 1.4 * S; for (let i = 0; i < 18; i++) { const per = .7 + hash(i) * .5, ph = ((t + hash(i * 3) * per) % per) / per, x = hash(i * 5 + Math.floor((t + hash(i * 3) * per) / per)) * W, y = lerp(hor + 30 * S, H - 20 * S, hash(i * 11));
    g.strokeStyle = `rgba(220,225,255,${.35 * (1 - ph)})`; g.beginPath(); g.ellipse(x, y, (6 + ph * 34) * S, (2 + ph * 8) * S, 0, 0, TAU); g.stroke(); }
  K.vignette(g, W, H, .45);
}

// 41 BACKROOMS — a haunted-house build: camcorder tape, a fluorescent corridor; the only way out is lit — the PhE at its end
export function backrooms(g, t, { W, H, M, S, V }) {
  const sh = [Math.sin(t * 7) * 3 * S + Math.sin(t * 2.3) * 5 * S, Math.cos(t * 6) * 2 * S];
  g.save(); g.translate(sh[0], sh[1]);
  const hw = K.halfW(M), hh = K.halfH(M), ex = hw + 90 * S, ey = hh + 120 * S, vp = [M.x, M.y + 10 * S], ceil = '#D8CFA2', floor = '#8C7A48';
  const D = Math.max(W, H) * 1.2, L0 = vp[0] - ex, R0 = vp[0] + ex, T0 = vp[1] - ey, B0 = vp[1] + ey;
  // one-point corridor
  g.fillStyle = ceil; K.poly(g, [[-D, -D], [W + D, -D], [R0, T0], [L0, T0]]); g.fill();
  g.fillStyle = floor; K.poly(g, [[-D, H + D], [W + D, H + D], [R0, B0], [L0, B0]]); g.fill();
  g.fillStyle = '#C9B66A'; K.poly(g, [[-D, -D], [L0, T0], [L0, B0], [-D, H + D]]); g.fill();
  g.fillStyle = '#BFAC60'; K.poly(g, [[W + D, -D], [R0, T0], [R0, B0], [W + D, H + D]]); g.fill();
  // carpet stains
  g.save(); K.poly(g, [[-D, H + D], [W + D, H + D], [R0, B0], [L0, B0]]); g.clip(); for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(60,48,20,.18)'; g.beginPath(); g.ellipse(hash(i) * W, lerp(B0 + 30 * S, H, hash(i + 4)), (40 + hash(i + 2) * 90) * S, (10 + hash(i + 3) * 20) * S, 0, 0, TAU); g.fill(); } g.restore();
  // the end: a door frame, darkness, and the light coming out of it
  g.fillStyle = '#d9c97e'; g.fillRect(L0 - 14 * S, T0 - 14 * S, ex * 2 + 28 * S, ey * 2 + 14 * S);
  g.fillStyle = '#15120a'; g.fillRect(L0, T0, ex * 2, ey * 2);
  g.fillStyle = '#2a2414'; K.poly(g, [[L0, B0], [R0, B0], [vp[0] + ex * .55, vp[1] + ey * .45], [vp[0] - ex * .55, vp[1] + ey * .45]]); g.fill();
  g.fillStyle = '#0d0b06'; g.fillRect(vp[0] - ex * .55, vp[1] - ey * .62, ex * 1.1, ey * 1.07);
  const hz = g.createRadialGradient(M.x, M.y, 0, M.x, M.y, ex * 1.1); hz.addColorStop(0, 'rgba(120,100,200,.4)'); hz.addColorStop(1, 'rgba(120,100,200,0)'); g.fillStyle = hz; g.fillRect(L0, T0, ex * 2, ey * 2);
  // wallpaper stripes converging, fluorescent panels on the ceiling (one flickers)
  g.strokeStyle = 'rgba(120,100,40,.25)'; g.lineWidth = 2 * S; for (let i = 0; i < 16; i++) { const z = Math.pow(i / 16, 1.6), x = lerp(0, L0, z); g.beginPath(); g.moveTo(x, lerp(-D * .2, T0, z)); g.lineTo(x, lerp(H + D * .2, B0, z)); g.stroke(); const x2 = lerp(W, R0, z); g.beginPath(); g.moveTo(x2, lerp(-D * .2, T0, z)); g.lineTo(x2, lerp(H + D * .2, B0, z)); g.stroke(); }
  for (let i = 0; i < 5; i++) { const z = Math.pow((i + .5) / 5, 1.5), y = lerp(-H * .1, T0 - 10 * S, z), w = lerp(W * .25, ex * .5, z), h = lerp(70, 8, z) * S;
    const on = i === 2 ? (hash(Math.floor(t * 18)) > .3 ? 1 : .2) : 1; g.save(); g.fillStyle = `rgba(255,252,225,${.9 * on})`; g.shadowColor = 'rgba(255,250,200,.9)'; g.shadowBlur = 30 * S * on; g.fillRect(vp[0] - w / 2, y, w, h); g.restore(); }
  // the way out: the PhE glowing; the three dots chase P → h → E on the beats like runway lights
  const ch = [5, 6, 7].map((dk, i) => .65 + .35 * Math.max(...[0, .5, 1, 1.5, 2].map(b => pulse(t, b + i * .16, .1))));
  g.save(); g.globalCompositeOperation = 'lighter'; const sp = g.createRadialGradient(M.x, B0, 0, M.x, B0, ex * 1.4); sp.addColorStop(0, 'rgba(170,150,255,.28)'); sp.addColorStop(1, 'rgba(170,150,255,0)'); g.fillStyle = sp; g.fillRect(0, T0, W, H); g.restore();
  K.fillMark(g, M, '#FFF8EA', 'rgba(0,0,0,0)', { shadow: { c: 'rgba(200,185,255,.95)', b: 46 * S } });
  K.fillMark(g, M, '#FFFDF6', 'rgba(0,0,0,0)', { shadow: { c: 'rgba(255,255,255,.8)', b: 10 * S } });
  [5, 6, 7].forEach((dk, i) => { const [x, y, r] = dotC(M, dk); g.save(); g.shadowColor = 'rgba(80,140,255,1)'; g.shadowBlur = 40 * S * ch[i]; g.fillStyle = rgb(mix([40, 70, 160], [150, 200, 255], ch[i])); K.circle(g, x, y, r); g.fill(); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; const sg = g.createRadialGradient(x, y, r, x, y, r * 4); sg.addColorStop(0, `rgba(70,120,255,${.45 * ch[i]})`); sg.addColorStop(1, 'rgba(70,120,255,0)'); g.fillStyle = sg; K.circle(g, x, y, r * 4); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)'; K.circle(g, x - r * .25, y - r * .25, r * .35); g.fill(); g.restore(); });
  g.fillStyle = 'rgba(60,50,20,.75)'; g.font = `600 ${22 * S}px Mono`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.save();
  if (V) { g.translate(W * .12, H * .2); g.transform(1, 0, -.3, 1, 0, 0); } else { g.translate(W * .07, H * .36); g.transform(1, .12, 0, 1, 0, 0); }
  g.fillText('RULE 4: THE WAY OUT', 0, 0); g.fillText('IS ALWAYS LIT.', 0, 30 * S); g.restore();
  g.restore();
  // camcorder overlay
  g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < H; y += 4 * S) g.fillRect(0, y, W, 1.5 * S);
  const ty = ((t * .37) % 1) * H; g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, ty, W, 10 * S);
  g.font = `${36 * S}px VT323`; g.fillStyle = '#F2F2F2'; g.textAlign = 'left'; g.textBaseline = 'top';
  if (Math.floor(t * 2) % 2 === 0) { g.fillStyle = '#FF3B30'; K.circle(g, 70 * S, 74 * S, 10 * S); g.fill(); }
  g.fillStyle = '#F2F2F2'; g.fillText('REC', 92 * S, 56 * S); g.textAlign = 'right'; g.fillText('SP  0:41:' + String(Math.floor(t * 24) % 60).padStart(2, '0'), W - 60 * S, 56 * S);
  g.textAlign = 'left'; g.fillText('BUILD WEEK · DAY 3 · 03:14 AM', 70 * S, H - (V ? 210 : 120) * S);
  K.grainOver(g, W, H, t, .12, 'b'); K.vignette(g, W, H, .5);
}

// 42 ONE LINE — the idea: a single ink line enters, makes a stage step, writes the whole PhE without lifting, leaves
const OLP = new Map();
function oneLinePath(M, W, H, S) {
  const key = W + 'x' + H; if (OLP.has(key)) return OLP.get(key);
  const T = (x, y) => K.toScreen(M, x, y), pts = [], hw = K.halfW(M), hh = K.halfH(M);
  const WL = 5.5 * S, WH = 1.8 * S, WS = 4 * S, yF = M.y + hh + 120 * S, yT = yF - 46 * S, xL = M.x - hw - 170 * S, xR = M.x + hw + 170 * S, step = 3 * S;
  const last = () => pts[pts.length - 1];
  const add = (x, y, w, b) => pts.push([x, y, w, b]);
  const line = (x, y, w, b = 0) => { const [x0, y0] = last(), n = Math.max(1, Math.ceil(Math.hypot(x - x0, y - y0) / step)); for (let i = 1; i <= n; i++) add(lerp(x0, x, i / n), lerp(y0, y, i / n), w, b); };
  const bez = (c1, c2, e, w, b = 0) => { const [x0, y0] = last(), n = 40; for (let i = 1; i <= n; i++) { const u = i / n, v = 1 - u; add(v * v * v * x0 + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * e[0], v * v * v * y0 + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * e[1], w, b); } };
  const follow = (list, w, b = 0) => list.forEach(([x, y]) => line(x, y, w, b));
  const loop = (k, a0, a1, w) => { const p = LOGO.parts[k], r = p.r * .55, n = Math.ceil(Math.abs(a1 - a0) / TAU * 40); for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); line(...T(p.cx + Math.cos(a) * r, p.cy + Math.sin(a) * r), w, 1); } };
  const P = (k) => LOGO.parts[k].pts.map(([x, y]) => T(x, y)), dP = LOGO.parts[5], dH = LOGO.parts[6], dE = LOGO.parts[7];
  add(-30 * S, yF, WS, 0); line(xL, yF, WS); line(xL, yT, WS);
  const [dpx, dpy] = T(dP.cx, dP.cy); line(dpx + 50 * S, yT, WS);
  bez([dpx + 20 * S, yT], T(dP.cx + dP.r * 1.6, dP.cy + 4), T(dP.cx + dP.r * .55, dP.cy), WH);
  const mark = {}; mark.a = pts.length;
  loop(5, 0, -TAU - Math.PI / 2, WL);                                      // dot P: a small loop, leaving from its top
  line(...T(12, 106), WH); follow(P(0), WL); mark.P = pts.length;          // up the stem, round the bowl
  bez(T(68, 103), T(150, 162), T(187, 144), WH);                          // swoop under to the foot of the h
  follow([T(187, 144), T(187, 12), T(187, 123), T(190, 123)], WL);         // up the stem, back down (retrace is invisible)
  follow(P(2), WL); line(...T(dH.cx, dH.cy - dH.r * .55), WH);               // the arch, then down into the dot
  loop(6, -Math.PI / 2, -Math.PI / 2 + TAU + Math.PI / 4, WL);
  bez(T(318, 118), T(322, 30), T(335, 13), WH);                            // up to the E's top bar
  follow([T(438, 13), T(335, 13)], WL); mark.E = pts.length;
  const bw = LOGO.parts[4].pts, iL = bw.reduce((m, p, i) => p[0] < bw[m][0] ? i : m, 0);
  line(...T(bw[iL][0], bw[iL][1]), WH);                                    // the one visible joint: down the E's spine
  follow(bw.slice(0, iL + 1).reverse().map(([x, y]) => T(x, y)), WL); follow(bw.slice(0, iL + 1).map(([x, y]) => T(x, y)), WL); follow(bw.slice(iL).map(([x, y]) => T(x, y)), WL);
  line(...T(dE.cx - dE.r * .55, dE.cy), WH); loop(7, Math.PI, Math.PI + TAU + Math.PI / 2, WL); mark.D = pts.length;
  const [dex, dey] = T(dE.cx, dE.cy + dE.r * .55); bez([dex, dey + 30 * S], [dex + 10 * S, yT], [dex + 60 * S, yT], WH);
  line(xR, yT, WS); line(xR, yF, WS); line(W + 30 * S, yF, WS); mark.end = pts.length;
  // ease the pen pressure between hairline and full stroke
  const sm = pts.map((p, i) => { let s = 0, n = 0; for (let j = Math.max(0, i - 5); j <= Math.min(pts.length - 1, i + 5); j++) { s += pts[j][2]; n++; } return s / n; });
  pts.forEach((p, i) => p[2] = sm[i]);
  const R = { pts, mark }; OLP.set(key, R); return R;
}
export function oneLine(g, t, { W, H, M, S }) {
  g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, W, H);
  const { pts, mark } = oneLinePath(M, W, H, S);
  const keys = [[-1.0, 0], [-.3, mark.P], [0, mark.E], [.35, mark.D], [.9, mark.end]];
  let n = 0; if (t >= keys[keys.length - 1][0]) n = mark.end; else for (let i = 0; i < keys.length - 1; i++) if (t < keys[i + 1][0]) { n = Math.floor(lerp(keys[i][1], keys[i + 1][1], clamp((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0])))); break; }
  g.lineCap = 'round'; g.lineJoin = 'round';
  // batch runs of equal colour and similar width
  let i = 1; while (i < n) { const b = pts[i][3], w = pts[i][2]; g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); let j = i; while (j < n && pts[j][3] === b && Math.abs(pts[j][2] - w) < .25 * S) { g.lineTo(pts[j][0], pts[j][1]); j++; }
    g.strokeStyle = b ? BLUE : '#1D1A17'; g.lineWidth = w; g.stroke(); i = j === i ? i + 1 : j; }
  if (n > 0 && n < pts.length) { const [x, y] = pts[Math.max(0, n - 1)]; g.fillStyle = '#1D1A17'; K.circle(g, x, y, 5 * S); g.fill(); }
  // after the line leaves, the three loops fill with ink on the beat and pop
  [5, 6, 7].forEach((dk, i) => { const u = seg(t, 1.0 + i * .25, 1.25 + i * .25); if (u <= 0) return; const p = LOGO.parts[dk], [x, y] = K.toScreen(M, p.cx, p.cy), r = p.r * K.logoScale(M);
    g.fillStyle = BLUE; K.circle(g, x, y, r * back(u, 3)); g.fill(); });
}

// 43 GLASS PRODUCT — the reveal: the PhE as a glass object in a black studio; a comet runs inside the tubes, three blue glass beads light on the beats
const GTOUR = [];
function glassTour() { if (GTOUR.length) return GTOUR; for (let k = 0; k < 5; k++) resample(LOGO.parts[k].pts, 2).forEach(p => GTOUR.push([p.x, p.y])); return GTOUR; }
export function glassProduct(g, t, { W, H, M, S, V }) {
  const hw = K.halfW(M), hh = K.halfH(M), ks = K.logoScale(M), floorY = M.y + hh + 3 * S;
  g.fillStyle = '#040406'; g.fillRect(0, 0, W, H);
  const sw = g.createRadialGradient(M.x, M.y - hh, 0, M.x, M.y - hh, Math.max(W, H) * .62); sw.addColorStop(0, '#1b1b26'); sw.addColorStop(1, '#040406'); g.fillStyle = sw; g.fillRect(0, 0, W, H);
  // strip lights left and right (and their streaks on the gloss floor)
  const lx = Math.min(hw + 200 * S, W / 2 - 40 * S);
  for (const sx of [-1, 1]) { const x = M.x + sx * lx, gr = g.createLinearGradient(x - 26 * S, 0, x + 26 * S, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(235,240,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x - 26 * S, floorY - hh * 5.2, 52 * S, hh * 5.2 - 20 * S); }
  // floor
  const fl = g.createLinearGradient(0, floorY, 0, H); fl.addColorStop(0, '#0e0e15'); fl.addColorStop(1, '#030304'); g.fillStyle = fl; g.fillRect(0, floorY, W, H - floorY);
  // ---- the glass object, built in a buffer ----
  const [G, q] = scratch('glass', W, H), [F, f] = scratch('glassFx', W, H);
  const sweep = lerp(-80, LW + 80, eio(seg(t, .25, 1.8))), sweep2 = lerp(-80, LW + 80, eio(seg(t, 2.1, 3.6)));
  K.inMark(q, M, (q) => { const P = K.markPaths(), L = K.markLines(); q.lineCap = 'round'; q.lineJoin = 'round';
    for (let k = 0; k < 5; k++) { q.save(); q.clip(P[k]);
      const body = q.createLinearGradient(0, 0, 0, LH); body.addColorStop(0, 'rgba(98,90,150,.55)'); body.addColorStop(1, 'rgba(30,22,58,.8)'); q.fillStyle = body; q.fill(P[k]);
      q.strokeStyle = 'rgba(190,200,255,.16)'; q.lineWidth = ST; q.stroke(L[k]);
      q.strokeStyle = 'rgba(6,6,14,.45)'; q.lineWidth = ST * .5; q.stroke(L[k]);                                  // the see-through core of a thick tube
      q.save(); q.translate(2.6, 3.6); q.strokeStyle = 'rgba(150,165,255,.45)'; q.lineWidth = 2; q.stroke(L[k]); q.restore();   // light focused through the tube
      q.save(); q.translate(-4.6, -5.4); q.strokeStyle = 'rgba(255,255,255,.85)'; q.lineWidth = 2.4; q.shadowColor = 'rgba(255,255,255,.9)'; q.shadowBlur = 7 * S; q.stroke(L[k]); q.restore(); // specular
      q.restore(); }
    // thick-glass inner contour
    const [I, ii] = scratch('glassIn', W, H); ii.setTransform(q.getTransform()); ii.lineCap = 'round'; ii.lineJoin = 'round';
    for (let k = 0; k < 5; k++) { ii.globalCompositeOperation = 'source-over'; ii.strokeStyle = '#fff'; ii.lineWidth = ST - 5; ii.stroke(L[k]); ii.globalCompositeOperation = 'destination-out'; ii.lineWidth = ST - 7.4; ii.stroke(L[k]); }
    q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = .28; q.drawImage(I, 0, 0); q.restore();
    // rims: white edge, with dispersion fringes
    for (const [c, ox] of [['255,80,90', -1.3], ['90,255,150', 0], ['90,130,255', 1.3]]) { q.save(); q.globalCompositeOperation = 'lighter'; q.translate(ox * S / ks, ox * .6 * S / ks); q.strokeStyle = `rgba(${c},.5)`; q.lineWidth = 1.3 * S / ks; for (let k = 0; k < 5; k++) q.stroke(P[k]); q.restore(); }
    q.strokeStyle = 'rgba(255,255,255,.7)'; q.lineWidth = 1 * S / ks; for (let k = 0; k < 5; k++) q.stroke(P[k]);
  });
  // light sweep + a comet travelling inside the strokes (masked to the glass, added as light)
  K.inMark(f, M, (f) => {
    for (const [sx, a] of [[sweep, .55], [sweep2, .3]]) { const rg = f.createLinearGradient(sx - 34, 0, sx + 34, 0); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(.5, `rgba(255,255,255,${a})`); rg.addColorStop(1, 'rgba(255,255,255,0)'); f.fillStyle = rg; f.fillRect(sx - 40, -20, 80, LH + 40); }
    const TT = glassTour(), N = TT.length, head = Math.floor(((t + .1) / 2.6 % 1) * N);
    for (let i = 0; i < 60; i++) { const j = head - i * 2; if (j < 0) break; const [x, y] = TT[j], a = Math.exp(-i * .07);
      f.fillStyle = i === 0 ? 'rgba(255,255,255,1)' : `rgba(${lerp(220, 70, i / 60)},${lerp(230, 120, i / 60)},255,${.75 * a})`; K.circle(f, x, y, i === 0 ? 7 : 6 - i * .06); f.fill(); }
    f.save(); f.globalCompositeOperation = 'lighter'; const [x, y] = TT[head]; const hg = f.createRadialGradient(x, y, 0, x, y, 26); hg.addColorStop(0, 'rgba(160,190,255,.9)'); hg.addColorStop(1, 'rgba(160,190,255,0)'); f.fillStyle = hg; K.circle(f, x, y, 26); f.fill(); f.restore();
  });
  f.globalCompositeOperation = 'destination-in'; f.drawImage(G, 0, 0); f.globalCompositeOperation = 'source-over';
  q.save(); q.globalCompositeOperation = 'lighter'; q.drawImage(F, 0, 0); q.restore();
  // the three dots: blue glass beads that light up P → h → E on the beats, then breathe
  const lit = [5, 6, 7].map((dk, i) => { const tb = .5 + i * .5; return clamp(.25 + .75 * eo(seg(t, tb - .05, tb + .2)) + .5 * pulse(t, tb, .1) + .08 * Math.sin(t * 3 + i) * seg(t, tb, tb + .5)); });
  K.inMark(q, M, (q) => { [5, 6, 7].forEach((dk, i) => { const p = LOGO.parts[dk], L = lit[i], r = p.r * (1 + .1 * pulse(t, .5 + i * .5, .1));
    const bg = q.createRadialGradient(p.cx - r * .35, p.cy - r * .4, 0, p.cx, p.cy, r); bg.addColorStop(0, rgb(mix([90, 120, 200], [225, 236, 255], L))); bg.addColorStop(.45, rgb(mix([18, 40, 110], [37, 99, 235], L))); bg.addColorStop(1, rgb(mix([6, 12, 40], [10, 40, 130], L)));
    q.fillStyle = bg; K.circle(q, p.cx, p.cy, r); q.fill();
    q.save(); q.globalCompositeOperation = 'lighter'; const core = q.createRadialGradient(p.cx + r * .15, p.cy + r * .2, 0, p.cx, p.cy, r); core.addColorStop(0, `rgba(120,170,255,${.8 * L * L})`); core.addColorStop(1, 'rgba(120,170,255,0)'); q.fillStyle = core; K.circle(q, p.cx, p.cy, r); q.fill();
    q.strokeStyle = 'rgba(200,220,255,.6)'; q.lineWidth = 1.2 * S / ks; q.beginPath(); q.arc(p.cx, p.cy, r - .8, .1, Math.PI * .9); q.stroke(); q.restore();
    q.fillStyle = 'rgba(255,255,255,.9)'; q.beginPath(); q.ellipse(p.cx - r * .38, p.cy - r * .42, r * .26, r * .16, -.6, 0, TAU); q.fill(); }); });
  // reflection in the gloss floor, then fade it out
  g.save(); g.translate(0, floorY * 2); g.scale(1, -1); g.globalAlpha = .3; g.drawImage(G, 0, 0); g.restore();
  const fade = g.createLinearGradient(0, floorY, 0, floorY + hh * 2.4); fade.addColorStop(0, 'rgba(6,6,9,.15)'); fade.addColorStop(1, 'rgba(4,4,6,1)'); g.fillStyle = fade; g.fillRect(0, floorY, W, H - floorY);
  // caustics: the tubes focus a thin violet echo of the logo on the floor; each bead throws a hot blue spot
  { const f = .5, [C, c] = lowres('glassCau', W, H, f); c.filter = `blur(${2.5 * S * f}px)`; c.translate(M.x, floorY + 18 * S); c.scale(ks * 1.06, ks * .17); c.translate(-LW / 2, 0);
    c.strokeStyle = 'rgba(150,120,255,.4)'; c.lineWidth = 3; c.lineCap = 'round'; const LL = K.markLines(); for (let k = 0; k < 5; k++) c.stroke(LL[k]);
    g.save(); g.globalCompositeOperation = 'lighter'; g.drawImage(C, 0, 0, W, H); g.restore(); }
  g.save(); g.globalCompositeOperation = 'lighter'; [5, 6, 7].forEach((dk, i) => { const [x, y, r] = dotC(M, dk), cx = x + 8 * S, cy = floorY + 30 * S, cg = g.createRadialGradient(cx, cy, 0, cx, cy, r * 3.2);
    cg.addColorStop(0, `rgba(110,160,255,${.75 * lit[i]})`); cg.addColorStop(1, 'rgba(110,160,255,0)'); g.fillStyle = cg; g.beginPath(); g.ellipse(cx, cy, r * 3.2, r * .7, 0, 0, TAU); g.fill(); });
  for (const sx of [-1, 1]) { const x = M.x + sx * lx, sg = g.createLinearGradient(0, floorY, 0, floorY + hh * 1.6); sg.addColorStop(0, 'rgba(220,228,255,.22)'); sg.addColorStop(1, 'rgba(220,228,255,0)'); g.fillStyle = sg; g.fillRect(x - 14 * S, floorY, 28 * S, hh * 1.6); }
  g.restore();
  // contact line and soft shadow where the glass meets the floor
  const cl = g.createLinearGradient(M.x - hw * 1.2, 0, M.x + hw * 1.2, 0); cl.addColorStop(0, 'rgba(180,190,255,0)'); cl.addColorStop(.5, 'rgba(180,190,255,.25)'); cl.addColorStop(1, 'rgba(180,190,255,0)'); g.fillStyle = cl; g.fillRect(M.x - hw * 1.2, floorY, hw * 2.4, 1.2 * S);
  // the object
  g.drawImage(G, 0, 0);
  // bead halos + a faint bloom over everything bright
  g.save(); g.globalCompositeOperation = 'lighter'; [5, 6, 7].forEach((dk, i) => { const [x, y, r] = dotC(M, dk), R = r * (2.6 + 1.6 * pulse(t, .5 + i * .5, .14)), hg = g.createRadialGradient(x, y, r * .6, x, y, R);
    hg.addColorStop(0, `rgba(70,120,255,${.5 * lit[i]})`); hg.addColorStop(1, 'rgba(70,120,255,0)'); g.fillStyle = hg; K.circle(g, x, y, R); g.fill(); });
  { const f = .25, [B, b] = lowres('glassBloom', W, H, f); b.filter = `blur(${12 * S * f}px)`; b.drawImage(G, 0, 0); g.globalAlpha = .4; g.imageSmoothingQuality = 'high'; g.drawImage(B, 0, 0, W, H); } g.restore();
  // title, ultra-thin and wide
  const tk = eo(seg(t, .6, 1.2)); if (tk > 0 && t < 3.2) { g.save(); g.globalAlpha = tk * (1 - seg(t, 2.6, 3.0)); g.font = `200 ${64 * S}px InterTight`; g.fillStyle = '#E8E8EE'; g.textAlign = 'center'; g.textBaseline = 'middle'; K.track(g, 'THE REVEAL', M.x, M.y - M.R * 1.7, .5); g.restore(); }
}
