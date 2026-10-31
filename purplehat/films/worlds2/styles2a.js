// Act 2 — print, pop and play. The rush: one second each, every world arriving on the beat (120 bpm: beats at t = 0 and .5).
// The PhE mark sits still in every world; its three dots are the animated accent (hop, stamp, catch, chase, teleport).
import * as K from './kit.js';
const { clamp, lerp, seg, ss, eio, eo, ei, back, mulberry, hash, TAU, rgb, hex, mix, fbm } = K;

const halftone = (key, ink, step, size = 512) => K.tex('ht:' + key, size, size, (q, w) => { q.fillStyle = ink; for (let y = 0; y < w; y += step) for (let x = (y / step) % 2 ? step / 2 : 0; x < w; x += step) { K.circle(q, x, y, step * .32); q.fill(); } });
const papr = (W, H, c, seed) => K.paper('p' + seed, 960, 540, c, { mottle: 12, grain: 12, fibres: 900, seed });

// ---------- local logo helpers ----------
const STK = [0, 1, 2, 3, 4], DOTS = [5, 6, 7];
const dotC = (M, k) => { const p = K.LOGO.parts[k]; return K.toScreen(M, p.cx, p.cy); };
const dotR = (M) => K.LOGO.parts[5].r * K.logoScale(M);
const strokes = (g, M, col) => K.fillMark(g, M, col, col, { only: STK });
// draw every part with its own transform (screen px offsets, rotation, scale about the part's centre): xf(i) -> {dx, dy, a, sx, sy} | null
function eachPart(g, M, xf, draw, only = null) {
  K.inMark(g, M, (g, k) => { const P = K.markPaths();
    P.forEach((p, i) => { if (only && !only.includes(i)) return; const b = K.LOGO.parts[i].bbox, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, o = xf ? xf(i) : null;
      g.save(); if (o) { g.translate(cx + (o.dx || 0) / k, cy + (o.dy || 0) / k); g.rotate(o.a || 0); g.scale(o.sx || 1, o.sy || 1); g.translate(-cx, -cy); }
      draw(g, p, i, k); g.restore(); }); });
}
// one hop of a dot: takes off at t0, lands at t0 + d, height h px; stretch in flight, squash on landing
function hop(t, t0, d, h) {
  const u = (t - t0) / d;
  if (u > 0 && u < 1) { const a = 4 * u * (1 - u), v = Math.abs(1 - 2 * u); return { dy: -h * a, sx: 1 - .14 * v, sy: 1 + .2 * v }; }
  if (u >= 1) { const q = Math.exp(-(t - t0 - d) * 24); return { dy: 0, sx: 1 + .32 * q, sy: 1 - .3 * q }; }
  const q = clamp(1 - (t0 - t) / .06); return { dy: 0, sx: 1 + .12 * q, sy: 1 - .12 * q };
}
// merge several hops into one transform for a dot of screen radius rS (bottom-anchored squash)
function hops(t, starts, d, h, rS) {
  let dy = 0, sx = 1, sy = 1; for (const s of starts) { const o = hop(t, s, d, h); dy += o.dy; sx *= o.sx; sy *= o.sy; }
  return { dy: dy + rS * (1 - sy), sx, sy };
}
const pill = (g, cx, cy, hw, hh) => K.rr(g, cx - hw, cy - hh, hw * 2, hh * 2, hh);
// point at fraction u along a pill's perimeter (clockwise from top-left of the straight)
function pillPt(u, cx, cy, hw, hh) {
  const L = hw - hh, P = 4 * L + TAU * hh; let s = ((u % 1) + 1) % 1 * P;
  if (s < 2 * L) return [cx - L + s, cy - hh]; s -= 2 * L;
  if (s < Math.PI * hh) { const a = -Math.PI / 2 + s / hh; return [cx + L + Math.cos(a) * hh, cy + Math.sin(a) * hh]; } s -= Math.PI * hh;
  if (s < 2 * L) return [cx + L - s, cy + hh]; s -= 2 * L;
  const a = Math.PI / 2 + s / hh; return [cx - L + Math.cos(a) * hh, cy + Math.sin(a) * hh];
}
const sinceBeat = (t) => t - Math.floor(t * 2) / 2;
// outer outline of the union of the parts (no seams where the h's arch meets its stem): lw px visible outside the shape.
// Drawn via a scratch canvas, so call it with g untransformed.
let SC = null;
function outline(g, M, col, lw, xf = null, only = null) {
  const W = g.canvas.width, H = g.canvas.height; if (!SC || SC.width !== W || SC.height !== H) SC = K.canvas(W, H);
  const q = SC.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, W, H);
  eachPart(q, M, xf, (q, p, i, k) => { q.lineWidth = lw * 2 / k; q.lineJoin = 'round'; q.strokeStyle = col; q.stroke(p); }, only);
  q.globalCompositeOperation = 'destination-out'; eachPart(q, M, xf, (q, p) => { q.fillStyle = '#000'; q.fill(p); }, only); q.globalCompositeOperation = 'source-over';
  g.drawImage(SC, 0, 0);
}

// 13 SPY TITLES — four flat inks, credits as architecture, a silhouette running through them; the mark is cut black card
export function spyTitles(g, t, { W, H, M, S, V }) {
  const tt = K.twos(t, 12), hw = K.halfW(M), hh = K.halfH(M), rS = dotR(M);
  g.fillStyle = '#efe4c9'; g.fillRect(0, 0, W, H);
  const bars = [[-.6, '#1b1714', .12], [-.2, '#d2401f', .06], [.35, '#1b1714', .09], [.8, '#e2a52a', .05]];
  bars.forEach(([o, c, w], i) => { const x = M.x + (o + (tt - .5) * (i % 2 ? -.5 : .5)) * W * .5; g.fillStyle = c; g.save(); g.translate(x, M.y); g.rotate(-.32); g.fillRect(-W * w / 2, -H * 1.2, W * w, H * 2.4); g.restore(); });
  // runner footfalls drive the dots: each dot hops on every third footstep (a syncopated 16th-ish rattle)
  const ff = Math.PI / 22, xf = (i) => {
    if (i < 5) return { a: (hash(i * 7.3 + 1) - .5) * .05, dx: (hash(i * 3.1 + 2) - .5) * 6 * S, dy: (hash(i * 5.7 + 3) - .5) * 5 * S };
    const st = []; for (let j = -3; j < 12; j++) if (((j % 3) + 3) % 3 === i - 5) st.push(j * ff); return hops(tt, st, .2, 34 * S, rS);
  };
  // cut paper: a cream paper edge under every piece, then the inks (black strokes, red dots)
  eachPart(g, M, xf, (g, p, i, k) => { g.lineWidth = 11 * S / k; g.lineJoin = 'round'; g.strokeStyle = '#efe4c9'; g.stroke(p); g.fillStyle = '#efe4c9'; g.fill(p); });
  eachPart(g, M, xf, (g, p, i) => { g.fillStyle = i < 5 ? '#1b1714' : '#d2401f'; g.fill(p); });
  // silhouette mid-stride crossing the frame below the mark (lateral track)
  const gy = V ? M.y + hh + 420 * S : H * .87, x = lerp(-W * .12, W * 1.12, (tt + .2) / 1.4), st = Math.sin(tt * 22), sc = S * (V ? 1.25 : 1);
  // the runner: a cream paper edge first (so it reads over the black bars), then the black card
  const fig = (col, e) => { g.fillStyle = col; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round';
    K.circle(g, 0, -150, 16 + e / 2); g.fill(); g.lineWidth = e || 1; g.beginPath(); g.moveTo(-14, -132); g.lineTo(16, -132); g.lineTo(22, -60); g.lineTo(-12, -60); g.closePath(); g.fill(); if (e) g.stroke();
    g.lineWidth = 12 + e; g.beginPath(); g.moveTo(4, -64); g.lineTo(4 + 30 * st, -20); g.lineTo(10 + 40 * st, 20); g.moveTo(4, -64); g.lineTo(4 - 30 * st, -20); g.lineTo(-10 - 30 * st, 18); g.stroke();
    g.beginPath(); g.moveTo(8, -124); g.lineTo(8 - 32 * st, -88); g.moveTo(8, -124); g.lineTo(8 + 34 * st, -92); g.stroke(); };
  g.save(); g.translate(x, gy); g.scale(sc, sc); fig('#efe4c9', 9); fig('#1b1714', 0); g.restore();
  g.fillStyle = '#efe4c9'; g.fillRect(56 * S, 70 * S, 430 * S, 150 * S); g.fillStyle = '#1b1714'; g.font = `${86 * S}px Bebas`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; K.track(g, 'THE REVEAL', 70 * S, 196 * S, .06);
  g.font = `${22 * S}px Bebas`; g.fillStyle = '#d2401f'; K.track(g, 'A PURPLEHAT PRODUCTION', 74 * S, 110 * S, .2);
  K.grainOver(g, W, H, t, .05, 'p');
}

// 14 SILKSCREEN — a festival poster pulled one ink at a time: stepped bands; the mark is pulled across by the squeegee, off-register
export function silkscreen(g, t, { W, H, M, S, V }) {
  const hw = K.halfW(M), hh = K.halfH(M), rS = dotR(M);
  g.fillStyle = '#F3E9D2'; g.fillRect(0, 0, W, H);
  const inks = ['#FBE6B4', '#F6CD98', '#EE9A73', '#9A7FA8', '#3E7079', '#1E3B4A'], n = inks.length, bh = H * .68 / n;
  inks.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * bh, W, bh + 1); });
  // pass 1 (already on the sheet): the key ink, slipped down-right
  strokes(g, { x: M.x + 8 * S, y: M.y + 6 * S, R: M.R }, '#D9654A');
  // pass 2: cream strokes, pulled left to right
  const x1 = lerp(M.x - hw - 70 * S, M.x + hw + 70 * S, eio(seg(t, -.15, .32)));
  g.save(); g.beginPath(); g.rect(0, 0, x1, H); g.clip(); strokes(g, M, '#FFF6DE'); g.restore();
  // pass 3: the dots, a hot yellow, pulled on the beat with a narrow squeegee — each one lands with a plop
  const x2 = lerp(M.x - hw - 50 * S, M.x + hw + 50 * S, eio(seg(t, .38, .62)));
  for (const k of DOTS) { const [dx, dy] = dotC(M, k), slip = { x: M.x - 3 * S, y: M.y + 3 * S, R: M.R };
    // the key-ink dot is already there (registration mark)
    g.fillStyle = '#D9654A'; K.circle(g, dx + 8 * S, dy + 6 * S, rS); g.fill();
    if (x2 < dx - rS * .2) continue;
    const u = clamp((x2 - dx) / (80 * S)), s = lerp(1.35, 1, back(u, 2.4));
    const [sx, sy] = dotC(slip, k); g.fillStyle = '#FFD25A'; K.circle(g, sx, sy, rS * s); g.fill(); }
  // squeegees (blade + handle) while they travel
  const blade = (x, h, a) => { g.save(); g.translate(x, M.y); g.rotate(-.06); g.globalAlpha = a; g.fillStyle = '#2B2B30'; g.fillRect(-7 * S, -h, 14 * S, h * 2); g.fillStyle = '#C89B6D'; g.fillRect(-20 * S, -h - 10 * S, 40 * S, 18 * S); g.restore(); };
  const a1 = seg(t, -.15, .32), a2 = seg(t, .38, .62);
  if (a1 > 0 && a1 < 1) blade(x1, hh * 1.7, 1 - ss(seg(a1, .85, 1)));
  if (a2 > 0 && a2 < 1) blade(x2, hh * 1.7, 1 - ss(seg(a2, .85, 1)));
  // mountains, three flat inks
  const mts = [['#3E7079', .7, .9], ['#2B5560', .78, .7], ['#1E3B4A', .88, 1.1]];
  mts.forEach(([c, b, f], i) => { const k = eo(seg(t, -.35 + i * .08, .25 + i * .08)); g.fillStyle = c; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 30 * S) g.lineTo(x, lerp(H * 1.1, H * b - Math.abs(Math.sin(x / W * Math.PI * (2 + i) * f + i)) * H * .1, k)); g.lineTo(W, H); g.fill(); });
  g.fillStyle = '#FBE6B4'; g.font = `${110 * S}px Bebas`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.globalAlpha = eo(seg(t, .45, .65)); K.track(g, 'OPEN AIR', M.x, H - 44 * S, .12); g.globalAlpha = 1;
  K.grainOver(g, W, H, t, .06, 'p');
}

// 15 RISOGRAPH — a city run zine: two fluorescent inks overprinted, halftone, plates that never line up (and kick on the beat)
export function risograph(g, t, { W, H, M, S }) {
  const tt = K.twos(t, 12), rS = dotR(M), blue = '#0078BF', pink = '#FF48B0';
  g.drawImage(papr(W, H, [244, 238, 226], 15), 0, 0, W, H);
  const kick = Math.exp(-sinceBeat(t) * 12), f = Math.floor(tt * 12);
  const bx = (5 + 16 * kick + (hash(f * 3.1) - .5) * 3) * S, by = (-3 - 7 * kick + (hash(f * 5.3) - .5) * 3) * S;
  g.save(); g.globalCompositeOperation = 'multiply';
  // BLUE plate: ground, buildings, a halftone shadow of the mark, and the three dots (solid)
  g.save(); g.translate(bx, by);
  g.fillStyle = g.createPattern(halftone('b', blue, 7), 'repeat'); g.fillRect(-20 * S, H * .7, W + 40 * S, H * .3);
  for (let i = 0; i < 9; i++) { const x = i * W / 8 - 40 * S, h = (120 + hash(i) * 220) * S; g.fillStyle = blue; g.globalAlpha = .5; g.fillRect(x, H * .7 - h, W / 11, h); }
  g.globalAlpha = 1;
  const pat = g.createPattern(halftone('b2', blue, 5), 'repeat');
  K.fillMark(g, { x: M.x + 9 * S, y: M.y + 8 * S, R: M.R }, pat, pat, { only: STK });
  eachPart(g, M, (i) => hops(t, [-.5, 0, .5, 1].map(b => b + (i - 5) * .09), .24, 36 * S, rS), (g, p) => { g.fillStyle = blue; g.fill(p); }, DOTS);
  g.restore();
  // PINK plate: sky halftone, the strokes solid, the runner
  g.save(); g.translate(-2 * S, 1 * S);
  g.fillStyle = g.createPattern(halftone('p', pink, 6), 'repeat'); g.fillRect(0, 0, W, H * .33);
  strokes(g, M, pink);
  const x = lerp(W * .12, W * .88, t), st = Math.sin(tt * 26);
  g.save(); g.translate(x, H * .7); g.scale(S, S); g.strokeStyle = pink; g.lineWidth = 9; g.lineCap = 'round';
  K.circle(g, 0, -88, 10); g.fillStyle = pink; g.fill(); g.beginPath(); g.moveTo(0, -76); g.lineTo(4, -40); g.lineTo(4 + 18 * st, -16); g.lineTo(8 + 22 * st, 0); g.moveTo(4, -40); g.lineTo(4 - 18 * st, -16); g.lineTo(-6 - 16 * st, 0);
  g.moveTo(2, -70); g.lineTo(2 + 20 * st, -52); g.moveTo(2, -70); g.lineTo(2 - 20 * st, -54); g.stroke(); g.restore();
  g.restore();
  g.restore();
  g.font = `${70 * S}px ArchivoBlack`; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.globalCompositeOperation = 'multiply'; g.fillStyle = blue; g.fillText('CITY RUN', 64 * S + bx, 120 * S + by); g.fillStyle = pink; g.fillText('CITY RUN', 64 * S, 120 * S); g.globalCompositeOperation = 'source-over';
  K.grainOver(g, W, H, t, .07, 'p');
}

// 16 HALFTONE DOSSIER — the brief as a case file: heavy headline, dots as shading, a stamp that slams (and the dots jump)
export function dossier(g, t, { W, H, M, S }) {
  const hw = K.halfW(M), hh = K.halfH(M), rS = dotR(M), T0 = .4;
  g.drawImage(papr(W, H, [236, 226, 200], 16), 0, 0, W, H);
  g.fillStyle = '#D9C49A'; K.rr(g, W * .06, H * .1, W * .88, H * .86, 10 * S); g.fill(); g.fillRect(W * .06, H * .06, W * .2, H * .08);
  g.drawImage(papr(W, H, [242, 234, 214], 17), W * .09, H * .14, W * .82, H * .78);
  // the stamp's thud shakes the page
  const thud = t > T0 ? Math.exp(-(t - T0) * 16) : 0, shk = Math.sin(t * 90) * 4 * S * thud;
  const MM = { x: M.x + shk, y: M.y - shk * .5, R: M.R };
  // halftone pill behind the mark (people + places)
  g.save(); pill(g, M.x, M.y + hh * .08, hw * 1.13, hh * 1.5); g.clip(); g.fillStyle = g.createPattern(halftone('r', '#E2483C', 9), 'repeat'); g.fillRect(0, 0, W, H); g.restore();
  strokes(g, { x: MM.x + 6 * S, y: MM.y + 6 * S, R: M.R }, '#2A3A8C');
  strokes(g, MM, '#1B1A22');
  // dots: yellow highlighter discs with an ink ring; they jump when the stamp lands
  eachPart(g, MM, (i) => hops(t, [T0 + (i - 5) * .035], .2, 30 * S, rS), (g, p, i, k) => { g.fillStyle = '#F2D23A'; g.fill(p); g.lineWidth = 3.2 * S / k; g.strokeStyle = '#1B1A22'; g.stroke(p); }, DOTS);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = `${96 * S}px ArchivoBlack`;
  g.fillStyle = '#E2483C'; g.fillText('THE BRIEF', W * .12 + 6 * S, H * .25 + 6 * S); g.fillStyle = '#1B1A22'; g.fillText('THE BRIEF', W * .12, H * .25);
  g.font = `600 ${16 * S}px Mono`; K.track(g, 'EXHIBIT 16 · CLIENT: CONFIDENTIAL · DATE: TBC', W * .12, H * .3, .12);
  // typed lines and a redaction bar
  for (let i = 0; i < 3; i++) { const y = H * (.77 + i * .045), w = W * (.3 - i * .05); g.fillStyle = 'rgba(27,26,34,.35)'; g.fillRect(W * .12, y, w, 3 * S); }
  g.fillStyle = '#1B1A22'; g.fillRect(W * .12 + W * .08, H * .815 - 9 * S, W * .12, 20 * S);
  const st = seg(t, T0 - .1, T0), sc = st < 1 ? lerp(2.2, 1, ei(st)) : 1 + .04 * thud;
  if (t > T0 - .1) { g.save(); g.translate(M.x + hw * .58, M.y + hh + 100 * S); g.rotate(-.14); g.scale(sc, sc); g.globalAlpha = .88 * clamp(st * 3);
    g.globalCompositeOperation = 'multiply'; g.strokeStyle = '#C8282E'; g.lineWidth = 6 * S; K.rr(g, -150 * S, -44 * S, 300 * S, 88 * S, 8 * S); g.stroke(); g.fillStyle = '#C8282E'; g.font = `${54 * S}px ArchivoBlack`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('APPROVED', 0, 4 * S); g.restore(); }
}

// 17 SWISS MOTION — the conference identity: grid, one typeface, one signal colour (the dots), snaps on the beat
export function swiss(g, t, { W, H, M, S, V }) {
  const red = '#E30613', rS = dotR(M);
  g.fillStyle = '#F2F0EA'; g.fillRect(0, 0, W, H);
  const col = W / 12; g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = 1; for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(i * col, 0); g.lineTo(i * col, H); g.stroke(); }
  const [, by] = dotC(M, 5); g.beginPath(); g.moveTo(0, by); g.lineTo(W, by); g.stroke();
  const k1 = back(seg(t, -.1, .25), 1.3), k2 = back(seg(t, .25, .55), 1.3);
  g.fillStyle = '#141414'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = `700 ${190 * S}px InterTight`; g.letterSpacing = (-.05 * 190 * S) + 'px';
  g.save(); g.beginPath(); g.rect(0, 0, W, H * .3); g.clip(); g.fillText('Confer', col * .5, lerp(H * .5, H * .26, k1)); g.restore();
  g.save(); g.beginPath(); g.rect(0, H * .72, W, H); g.clip(); g.fillText('ence.', col * .5 + (V ? 0 : col * 6), lerp(H * 1.3, H * .92, k2)); g.restore(); g.letterSpacing = '0px';
  // signal in: a red rule runs along the baseline into the first dot
  const [px] = dotC(M, 5), [ex, ey] = dotC(M, 7), r1 = eo(seg(t, -.15, .1));
  const rx0 = lerp(0, px, eio(seg(t, .08, .3))), rx1 = px * r1;
  if (rx1 > rx0 + 1) { g.fillStyle = red; g.fillRect(rx0, by - 1.5 * S, rx1 - rx0, 3 * S); }
  strokes(g, M, '#141414');
  // dots snap on each beat, one per 16th: big -> exact size with a hard back-ease
  const sc = (i) => { let s = 1; for (const b of [0, .5]) { const t0 = b + (i - 5) * .125, u = seg(t, t0, t0 + .2); if (t >= t0 && u < 1) s = lerp(1.9, 1, back(u, 2.2)); } return { sx: s, sy: s }; };
  eachPart(g, M, sc, (g, p) => { g.fillStyle = red; g.fill(p); }, DOTS);
  // signal out: a rule from the last dot to the frame edge, with the session time
  const r2 = eo(seg(t, .55, .8));
  if (r2 > 0) { g.fillStyle = red; g.fillRect(ex + rS * 1.6, ey - 1.5 * S, (W - ex - rS * 1.6) * r2, 3 * S);
    g.globalAlpha = r2; g.font = `500 ${16 * S}px Mono`; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; K.track(g, 'HALL A · 09:30', W - col * .5, ey - 14 * S, .1); g.globalAlpha = 1; }
  g.font = `500 ${16 * S}px Mono`; g.fillStyle = '#141414'; g.textAlign = 'left'; K.track(g, '2026 · 3 DAYS · 1 HALL · 40 SPEAKERS', col * .5 + 4 * S, H * .66, .1);
}

// 18 PICTOGRAM — games day: a square-grid core graphic of discs and half-discs; the mark is the same kit (round caps + discs)
// and the athlete is drawn in its exact stroke; the three dots are balls bouncing on the beat
export function pictogram(g, t, { W, H, M, S, V }) {
  const pal = ['#2563EB', '#2AA772', '#F2B134', '#E8553D', '#7A4FB0'], ink = '#1B1B1B';
  const hw = K.halfW(M), hh = K.halfH(M), k = K.logoScale(M), rS = dotR(M);
  const ax = V ? M.x : M.x + hw + 175 * S, ay = V ? M.y + hh + 330 * S : M.y + hh * .35, as = k / 1.35;
  g.fillStyle = '#F4F2EC'; g.fillRect(0, 0, W, H);
  const s = 90 * S, rows = Math.ceil(H / s) + 1, cols = Math.ceil(W / s) + 2, pw = hw + 80 * S, ph = hh + 80 * S;
  for (let j = 0; j < rows; j++) { const off = (j % 2 ? 1 : -1) * eo(seg(t, -.3 + j * .03, .4 + j * .03)) * s * 2;
    for (let i = -3; i < cols; i++) { const x = i * s + off, y = j * s, cx = x + s / 2, cy = y + s / 2, kk = Math.floor(hash(i * 13 + j * 7) * 5), shape = Math.floor(hash(i * 3 + j * 11) * 3);
      if (cx < 520 * S && cy < 160 * S) continue;
      g.fillStyle = pal[kk]; if (shape === 0) { K.circle(g, cx, cy, s * .42); g.fill(); } else if (shape === 1) { g.beginPath(); g.arc(cx, y + s * .95, s * .45, Math.PI, 0); g.fill(); } else { g.fillRect(x + s * .1, y + s * .1, s * .8, s * .8); } } }
  // the mark on a cream pill (people + places)
  g.fillStyle = '#F4F2EC'; pill(g, M.x, M.y, pw, ph); g.fill(); K.circle(g, ax, ay - 40 * as, 150 * as); g.fill();
  strokes(g, M, ink);
  eachPart(g, M, (i) => hops(t, [-.5, 0, .5, 1].map(b => b - .25 + (i - 5) * .1), .32, 54 * S, rS), (g, p, i) => { g.fillStyle = pal[0]; g.fill(p); }, DOTS);
  // athlete pictogram: round-capped bars in the logo's own stroke width + disc head, sprinting
  const ph2 = t * 9 + .9, lw = K.STROKE * 1.35, D = (o, l, an) => [o[0] + Math.sin(an) * l, o[1] + Math.cos(an) * l];
  g.save(); g.translate(ax, ay); g.scale(as, as); g.strokeStyle = ink; g.lineWidth = lw; g.lineCap = 'round';
  g.lineJoin = 'round'; K.circle(g, 26, -126, 22); g.fillStyle = ink; g.fill(); g.beginPath(); g.moveTo(12, -86); g.lineTo(-4, -16); g.stroke();
  g.beginPath();
  for (const p of [ph2, ph2 + Math.PI]) { const th = .85 * Math.sin(p), kn = D([-4, -16], 44, th), ft = D(kn, 44, th - 1.2 * (.5 - .5 * Math.cos(p)));   // legs: thigh + bent shin
    g.moveTo(-4, -16); g.lineTo(kn[0], kn[1]); g.lineTo(ft[0], ft[1]);
    const ua = -.9 * Math.sin(p), el = D([10, -80], 34, ua), hd = D(el, 32, ua + 1.5); g.moveTo(10, -80); g.lineTo(el[0], el[1]); g.lineTo(hd[0], hd[1]); }   // arms swing opposite
  g.stroke(); g.restore();
  g.fillStyle = ink; g.font = `800 ${60 * S}px InterTight`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('GAMES DAY', 60 * S, 118 * S);
}

// 19 GAME SHOW — a brand activation: candy sunburst, the mark as a marquee sign, the dots as chaser lights, PERFECT!
export function gameShow(g, t, { W, H, M, S, V }) {
  const hw = K.halfW(M), hh = K.halfH(M), rS = dotR(M), ink = '#2B1B4D', rot = t * .6, n = 20;
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#FFB870' : '#FFA85A'; g.beginPath(); g.moveTo(M.x, M.y); g.arc(M.x, M.y, Math.hypot(W, H), rot + i / n * TAU, rot + (i + 1) / n * TAU); g.closePath(); g.fill(); }
  const sb = sinceBeat(t), sq = 1 + .06 * Math.exp(-sb * 12), perfect = t > .55, step = Math.floor(t * 8 + 64);
  // the sign: a pill with marquee bulbs chasing on 16ths
  const pw = (hw + 96 * S) * sq, ph = (hh + 84 * S) * sq;
  g.fillStyle = ink; pill(g, M.x, M.y + 12 * S, pw, ph); g.fill();
  g.fillStyle = '#7B3FE4'; g.strokeStyle = ink; g.lineWidth = 8 * S; pill(g, M.x, M.y, pw, ph); g.fill(); g.stroke();
  const nb = 38; for (let i = 0; i < nb; i++) { const [x, y] = pillPt(i / nb, M.x, M.y, pw - 24 * S, ph - 24 * S), on = perfect ? step % 2 === 0 : (i + step) % 3 === 0;
    g.fillStyle = on ? '#FFF3A0' : '#B48A3C'; if (on) { g.shadowColor = '#FFE24A'; g.shadowBlur = 14 * S; } K.circle(g, x, y, 6 * S); g.fill(); g.shadowBlur = 0; }
  const MM = { ...M, R: M.R * sq };
  strokes(g, { x: M.x, y: M.y + 10 * S, R: MM.R }, ink); outline(g, MM, ink, 6 * S, null, STK); strokes(g, MM, '#FFFFFF');
  // dots: chaser lights (one lit per 16th), all strobing once the verdict lands
  eachPart(g, MM, (i) => { const on = perfect ? true : (step % 3) === i - 5; return { sx: on ? 1.18 : 1, sy: on ? 1.18 : 1 }; }, (g, p, i, k) => {
    const on = perfect ? step % 2 === 0 || true : (step % 3) === i - 5; g.fillStyle = on ? '#FFE24A' : '#FF8AC4';
    if (on) { g.shadowColor = '#FFE24A'; g.shadowBlur = 24 * S; } g.fill(p); g.shadowBlur = 0; g.lineWidth = 5 * S / k; g.strokeStyle = ink; g.stroke(p); }, DOTS);
  // mascot: a round blob with big eyes, jumps on the beat
  const j = Math.abs(Math.sin(t * Math.PI * 2)), mx = V ? M.x - 250 * S : M.x - pw - 120 * S, my = (V ? M.y + ph + 200 * S : M.y + hh * .9) - j * 70 * S;
  g.save(); g.translate(mx, my); g.scale(S * (1 + .1 * (1 - j)), S * (1 - .1 * (1 - j)));
  g.fillStyle = '#5ED3C4'; g.strokeStyle = ink; g.lineWidth = 8; K.circle(g, 0, 0, 70); g.fill(); g.stroke();
  g.fillStyle = '#fff'; for (const ex of [-24, 24]) { K.circle(g, ex, -12, 18); g.fill(); g.stroke(); g.fillStyle = ink; K.circle(g, ex + 6, -10, 8); g.fill(); g.fillStyle = '#fff'; }
  g.beginPath(); g.arc(0, 18, 22, .2, Math.PI - .2); g.stroke(); g.restore();
  if (perfect) { const k = back(seg(t, .55, .75), 2); g.save(); g.translate(V ? M.x : M.x + hw * .75, M.y - ph - (V ? 110 : 60) * S); g.rotate(-.1); g.scale(k, k);
    g.font = `${92 * S}px Lilita`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 16 * S; g.strokeStyle = ink; g.strokeText('PERFECT!', 0, 0); g.fillStyle = '#FFE24A'; g.fillText('PERFECT!', 0, 0); g.restore(); }
}

// 20 MICROGAME — one word, one second, one action: CATCH! The mark is tossed up from its place and drops into two gloves;
// its loose dots fly higher and plop back in after it, one per 16th
export function microgame(g, t, { W, H, M, S, V }) {
  const hw = K.halfW(M), hh = K.halfH(M), rS = dotR(M), ink = '#120530', drop = H * .11, TC = .42, toss = (t, t1) => { const u = seg(t, 0, t1); return 4 * u * (1 - u); };
  g.fillStyle = '#2a0f5c'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? '#34136f' : '#2a0f5c'; g.save(); g.translate(W / 2, H / 2); g.rotate(-.5); g.fillRect(-W * 2 + i * 120 * S + (t * 300 * S) % (240 * S), -H * 2, 60 * S, H * 4); g.restore(); }
  const fall = 1 - toss(t, TC), caught = t > TC ? Math.exp(-(t - TC) * 14) * Math.sin((t - TC) * 40) : 0;
  const off = -drop * (1 - fall) + caught * 10 * S, tilt = .08 * Math.sin(seg(t, 0, TC) * TAU);
  const ML = { x: M.x, y: M.y + off, R: M.R };
  // shadow on the "floor" grows as it lands
  g.fillStyle = 'rgba(10,2,30,.35)'; g.beginPath(); g.ellipse(M.x, M.y + hh + 34 * S, hw * lerp(.7, 1, fall), 14 * S, 0, 0, TAU); g.fill();
  g.save(); g.translate(M.x, ML.y); g.rotate(tilt); g.translate(-M.x, -ML.y);
  strokes(g, { x: ML.x, y: ML.y + 9 * S, R: M.R }, 'rgba(0,0,0,.4)'); strokes(g, ML, '#ffffff');
  g.restore();
  // the dots are loose: they fall a beat behind and land one per 16th, with a squash
  for (const k of DOTS) { const d = k - 5, land = .5 + d * .1, [x, y0] = dotC(M, k), y = y0 - (drop * 1.3 + d * 40 * S) * toss(t, land);
    const q = t > land ? Math.exp(-(t - land) * 20) : 0, sx = 1 + .4 * q, sy = 1 - .35 * q;
    g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(x, y + 9 * S + rS * (1 - sy), rS * sx, rS * sy, 0, 0, TAU); g.fill();
    g.fillStyle = '#ffc928'; g.beginPath(); g.ellipse(x, y + rS * (1 - sy), rS * sx, rS * sy, 0, 0, TAU); g.fill();
    if (t > land && t < land + .25) { const r = (t - land) / .25; g.strokeStyle = `rgba(255,201,40,${1 - r})`; g.lineWidth = 4 * S; K.circle(g, x, y, rS * (1.3 + r * 2.5)); g.stroke(); } }
  // gloves close in from the sides and catch it
  const c = eo(seg(t, .26, TC));
  for (const sx of [-1, 1]) { const x = M.x + sx * lerp(W * .6, hw + 62 * S, c); g.save(); g.translate(x, ML.y - 10 * S); g.scale(-sx * S * (V ? .85 : 1), S * (V ? .85 : 1));
    g.fillStyle = '#ff2e88'; g.strokeStyle = ink; g.lineWidth = 8; for (let f = 0; f < 3; f++) { K.rr(g, -30, -58 + f * 40, 80, 34, 17); g.fill(); g.stroke(); }
    K.rr(g, -150, -80, 130, 160, 52); g.fill(); g.stroke(); K.rr(g, -60, -104, 70, 34, 17); g.fill(); g.stroke(); g.fillStyle = '#ffffff'; g.fillRect(-170, -60, 26, 120); g.strokeRect(-170, -60, 26, 120); g.restore(); }
  g.font = `${150 * S}px Lilita`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; const pop = back(seg(t, -.05, .2), 2.5);
  g.save(); g.translate(M.x, H * .14); g.scale(pop, pop); g.lineWidth = 18 * S; g.strokeStyle = ink; g.strokeText('CATCH!', 0, 0); g.fillStyle = '#ffc928'; g.fillText('CATCH!', 0, 0); g.restore();
  // bomb + fuse timer, burning right to left
  const fx0 = V ? 110 * S : 470 * S, fx1 = W - 70 * S, fy = H - 58 * S, fx = lerp(fx1, fx0, clamp(t));
  g.strokeStyle = '#1fd1d1'; g.lineWidth = 8 * S; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx0, fy); g.lineTo(fx, fy); g.stroke();
  g.fillStyle = ink; K.circle(g, fx0 - 30 * S, fy, 30 * S); g.fill(); g.strokeStyle = '#1fd1d1'; g.lineWidth = 4 * S; g.stroke(); g.fillStyle = 'rgba(255,255,255,.5)'; K.circle(g, fx0 - 40 * S, fy - 10 * S, 7 * S); g.fill();
  g.save(); g.translate(fx, fy); g.rotate(t * 20); g.fillStyle = '#ffc928'; g.beginPath(); for (let i = 0; i < 16; i++) { const r = (i % 2 ? 7 : 17 + 5 * Math.sin(t * 70)) * S, a = i / 16 * TAU; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); g.restore();
}

// 21 RUBBER HOSE — a party: black-and-white ink; the P's bowl gets pie-cut eyes, the mark sprouts hose arms and gloves,
// and the three dots are its tapping feet
export function rubberHose(g, t, { W, H, M, S, V }) {
  const ink = '#1a1714', hw = K.halfW(M), hh = K.halfH(M), rS = dotR(M);
  g.fillStyle = '#E9E2CF'; g.fillRect(0, 0, W, H);
  const tt = K.twos(t, 12), bob = Math.sin(tt * Math.PI * 4) * 14 * S, sway = Math.sin(tt * Math.PI * 2) * .07;
  for (let j = 0; j < 6; j++) for (let i = -12; i < 12; i++) { if ((i + j) % 2) continue; const y0 = H * .78 + j * j * 6 * S, y1 = H * .78 + (j + 1) * (j + 1) * 6 * S, f0 = 1 + j * .35, f1 = 1 + (j + 1) * .35, w = 90 * S;
    g.fillStyle = ink; K.poly(g, [[W / 2 + i * w * f0, y0], [W / 2 + (i + 1) * w * f0, y0], [W / 2 + (i + 1) * w * f1, y1], [W / 2 + i * w * f1, y1]]); g.fill(); }
  g.save(); g.translate(M.x, M.y + bob); g.rotate(sway); g.translate(-M.x, -M.y);
  // hose arms from the P's stem and the E's bowl, white gloves waving on the beat
  const sh = [K.toScreen(M, 2, 74), K.toScreen(M, 448, 72)];
  [-1, 1].forEach((sx, n) => { const [ax, ay] = sh[n], w = Math.abs(Math.sin(tt * 6 + sx));
    const hx = V ? ax + sx * (30 - 40 * w) * S : M.x + sx * (hw + 120 * S), hy = V ? M.y - hh - (130 + 90 * w) * S : M.y - M.R * (.35 + .55 * w);
    g.strokeStyle = ink; g.lineWidth = 15 * S; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(ax + sx * 90 * S, ay + 60 * S, hx, hy); g.stroke();
    g.save(); g.translate(hx, hy); g.rotate(sx * (.3 - .5 * w)); g.fillStyle = '#fff'; g.strokeStyle = ink; g.lineWidth = 5 * S;
    g.fillRect(-16 * S, 22 * S, 32 * S, 18 * S); g.strokeRect(-16 * S, 22 * S, 32 * S, 18 * S);
    g.beginPath(); g.ellipse(-sx * 30 * S, 4 * S, 12 * S, 18 * S, sx * .6, 0, TAU); g.fill(); g.stroke(); K.circle(g, 0, 0, 32 * S); g.fill(); g.stroke(); for (const fx of [-12, 0, 12]) { g.beginPath(); g.moveTo(fx * S, -30 * S); g.lineTo(fx * S, -10 * S); g.stroke(); } g.restore(); });
  strokes(g, M, ink);
  // pie-cut eyes in the P's bowl, glancing to the beat, one blink
  const look = Math.sin(tt * Math.PI * 2) * 4, blink = t > .74 && t < .84 ? .12 : 1;
  K.inMark(g, M, (g, k) => { for (const ex of [52, 89]) { g.fillStyle = '#fff'; g.strokeStyle = ink; g.lineWidth = 2.6; g.beginPath(); g.ellipse(ex, 56, 11.5, 17 * blink, 0, 0, TAU); g.fill(); g.stroke();
    if (blink < 1) continue; const px = ex + 3 + look, py = 60; g.fillStyle = ink; g.beginPath(); g.ellipse(px, py, 6.2, 11, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(px, py); g.arc(px, py, 7, -1.25, -.55); g.closePath(); g.fill(); } });
  // the dots are shoes: they tap in turn on every 16th
  const taps = (i) => { const st = []; for (let j = -3; j < 12; j++) if (((j % 3) + 3) % 3 === i - 5) st.push(j * .125); return st; };
  eachPart(g, M, (i) => hops(tt, taps(i), .12, 20 * S, rS), (g, p, i, k) => { g.fillStyle = '#fff'; g.fill(p); g.lineWidth = 4.5 * S / k; g.strokeStyle = ink; g.stroke(p); }, DOTS);
  g.restore();
  for (let i = 0; i < 5; i++) { const x = W * (.15 + i * .18), y = H * .2 + Math.sin(tt * 8 + i) * 20 * S; g.fillStyle = ink; g.beginPath(); g.ellipse(x, y, 14 * S, 10 * S, -.4, 0, TAU); g.fill(); g.fillRect(x + 11 * S, y - 50 * S, 4 * S, 50 * S); }
  K.grainOver(g, W, H, t, .14, 'r'); K.vignette(g, W, H, .85, .28, '20,16,12');
}

// 22 MIDCENTURY TOON — the town hall: colour planes, an ink line printed off-register, a presenter tapping each dot with a pointer
export function midcentury(g, t, { W, H, M, S, V }) {
  const hw = K.halfW(M), hh = K.halfH(M), rS = dotR(M), ink = '#2a2420';
  g.fillStyle = '#E8DCC0'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#5E9C94'; g.fillRect(0, 0, W * .38, H); g.fillStyle = '#E3A33B'; g.fillRect(W * .62, H * .1, W * .3, H * .5); g.fillStyle = '#D9654A'; K.circle(g, W * .82, H * .8, 120 * S); g.fill();
  // easel and board (colour plane offset from its line)
  const bw = hw + 60 * S, bh = hh + 58 * S, floor = V ? M.y + bh + 520 * S : H * .93;
  g.strokeStyle = ink; g.lineWidth = 5 * S; g.lineCap = 'round'; g.beginPath();
  g.moveTo(M.x - bw * .55, M.y + bh - 4 * S); g.lineTo(M.x - bw * .75, floor); g.moveTo(M.x + bw * .55, M.y + bh - 4 * S); g.lineTo(M.x + bw * .75, floor); g.moveTo(M.x, M.y - bh); g.lineTo(M.x, floor - 30 * S); g.stroke();
  g.fillStyle = '#F5EFE0'; K.rr(g, M.x - bw + 9 * S, M.y - bh + 7 * S, bw * 2, bh * 2, 16 * S); g.fill();
  g.strokeStyle = ink; g.lineWidth = 3 * S; K.rr(g, M.x - bw, M.y - bh, bw * 2, bh * 2, 16 * S); g.stroke();
  // presenter: trapezoid body, oval head, an arm and a pointer that taps the dots in turn (16ths after the downbeat)
  const px = V ? M.x - 250 * S : M.x - bw - 190 * S, py = V ? floor : H * .87, sh = [px + 18 * S, py - 150 * S];
  const taps = [.16, .29, .42], dp = DOTS.map(k => dotC(M, k)), rest = [dp[0][0] - 60 * S, dp[0][1] + 90 * S];
  let tip = rest; if (t > taps[0] - .12) { const i = taps.findIndex(x => t < x); const j = i < 0 ? 2 : i;
    const from = j === 0 ? rest : dp[j - 1], u = j === 0 ? eo(seg(t, taps[0] - .12, taps[0])) : eio(seg(t, taps[j - 1] + .03, taps[j])); tip = [lerp(from[0], dp[j][0], u), lerp(from[1], dp[j][1], u) + rS * 1.2 * (1 - Math.abs(2 * u - 1)) * -1 * (j > 0)]; }
  const back2 = eio(seg(t, .62, .85)); tip = [lerp(tip[0], dp[2][0] + 20 * S, back2 * 0), lerp(tip[1], tip[1] - 160 * S, back2)];
  const ang = Math.atan2(tip[1] - sh[1], tip[0] - sh[0]), hand = [sh[0] + Math.cos(ang) * 95 * S, sh[1] + Math.sin(ang) * 95 * S];
  g.fillStyle = '#2E4A7A'; K.poly(g, [[px - 50 * S, py], [px + 50 * S, py], [px + 28 * S, py - 170 * S], [px - 28 * S, py - 170 * S]]); g.fill();
  g.fillStyle = '#F0C8A0'; g.beginPath(); g.ellipse(px + 6 * S, py - 205 * S, 28 * S, 36 * S, 0, 0, TAU); g.fill(); g.strokeStyle = ink; g.lineWidth = 3 * S; g.beginPath(); g.ellipse(px, py - 207 * S, 28 * S, 36 * S, 0, 0, TAU); g.stroke();
  g.lineWidth = 8 * S; g.beginPath(); g.moveTo(sh[0], sh[1]); g.lineTo(hand[0], hand[1]); g.stroke();
  // the mark: navy plane + tomato dots printed slipped, the ink line on register
  const pulse = (i) => { const tp = taps[i - 5], q = t > tp ? Math.exp(-(t - tp) * 12) : 0; return { sx: 1 + .5 * q, sy: 1 + .5 * q }; };
  strokes(g, { x: M.x + 7 * S, y: M.y + 5 * S, R: M.R }, '#2E4A7A');
  eachPart(g, { x: M.x + 7 * S, y: M.y + 5 * S, R: M.R }, pulse, (g, p) => { g.fillStyle = '#D9654A'; g.fill(p); }, DOTS);
  outline(g, M, ink, 2.6 * S, (i) => i < 5 ? null : pulse(i));
  g.strokeStyle = ink; g.lineWidth = 3 * S; g.beginPath(); g.moveTo(hand[0], hand[1]); g.lineTo(tip[0], tip[1]); g.stroke(); g.fillStyle = ink; K.circle(g, tip[0], tip[1], 4 * S); g.fill();
  g.fillStyle = ink; g.font = `600 ${28 * S}px IMFellItalic`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('No. 22 — How a town hall runs itself.', 60 * S, 92 * S);
}

// 23 SCI-FI TOON — a portal party: a green swirl portal behind the mark, boiling thick outlines, the dots teleport on the beat
export function scifiToon(g, t, { W, H, M, S, V }) {
  const tt = K.twos(t, 8), fr = Math.floor(tt * 8), boil = (s) => (hash(fr * 7 + s) - .5) * 5 * S, hw = K.halfW(M), hh = K.halfH(M), rS = dotR(M), ink = '#0E0820';
  g.fillStyle = '#1B1035'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { g.fillStyle = '#fff'; K.circle(g, hash(i) * W, hash(i + 9) * H * .7, (hash(i + 3) * 2 + .5) * S); g.fill(); }
  g.fillStyle = '#3B2A6B'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 40 * S) g.lineTo(x, H * .8 + Math.sin(x * .01) * 20 * S); g.lineTo(W, H); g.fill();
  // portal: a lumpy ellipse, layered greens, swirl arms, all boiling
  const rx = hw * 1.22, ry = hh * 2.25, blob = (sc, ph) => { g.beginPath(); for (let i = 0; i <= 72; i++) { const a = i / 72 * TAU, w = 1 + .03 * Math.sin(a * 4 + ph) + .02 * Math.sin(a * 7 - ph * 1.7) + .01 * Math.sin(a * 13 + fr * 2.1);
    g.lineTo(M.x + Math.cos(a) * rx * sc * w, M.y + Math.sin(a) * ry * sc * w); } g.closePath(); };
  g.save(); g.shadowColor = '#7BFF7A'; g.shadowBlur = 60 * S; g.fillStyle = '#2FCB62'; blob(1, tt * 3); g.fill(); g.restore();
  g.save(); blob(1, tt * 3); g.clip();
  for (let i = 1; i < 10; i++) { g.fillStyle = i % 2 ? '#B6FF6A' : (i > 6 ? '#1FAE55' : '#3EE07A'); blob(1 - i / 10, tt * 3 + i * 1.3 - tt * 4); g.fill(); }
  g.lineCap = 'round'; for (let j = 0; j < 6; j++) { g.strokeStyle = j % 2 ? 'rgba(230,255,190,.85)' : 'rgba(25,140,70,.7)'; g.lineWidth = (j % 2 ? 6 : 10) * S; g.beginPath();
    for (let s = 0; s <= 40; s++) { const r = s / 40, a = j / 6 * TAU + r * 3.6 - tt * 7; g.lineTo(M.x + Math.cos(a) * rx * r, M.y + Math.sin(a) * ry * r); } g.stroke(); }
  g.restore();
  g.strokeStyle = ink; g.lineWidth = 8 * S; g.save(); g.translate(boil(5), boil(6)); blob(1, tt * 3); g.stroke(); g.restore();
  // goo flecks flung from the rim
  for (let i = 0; i < 7; i++) { const a = hash(i * 3.3) * TAU, d = 1.05 + ((t * .8 + hash(i * 7.1)) % 1) * .5, x = M.x + Math.cos(a) * rx * d, y = M.y + Math.sin(a) * ry * d;
    g.fillStyle = '#B6FF6A'; g.strokeStyle = ink; g.lineWidth = 4 * S; K.circle(g, x, y, (7 + hash(i) * 8) * S); g.fill(); g.stroke(); }
  // the mark: boiled fill, thick boiled outline
  const MF = { x: M.x + boil(1), y: M.y + boil(2), R: M.R }, MO = { x: M.x + boil(3), y: M.y + boil(4), R: M.R };
  strokes(g, { x: MF.x, y: MF.y + 9 * S, R: M.R }, 'rgba(14,8,32,.55)'); strokes(g, MF, '#F2F0FF');
  outline(g, MO, ink, 7 * S, null, STK);
  // the dots teleport: shrink into a spark on the beat and pop back out (one per 16th)
  const tp = (i) => { const t0 = .42 + (i - 5) * .07, a = ei(seg(t, t0, t0 + .07)), b = back(seg(t, t0 + .1, t0 + .26), 2.4), s = t < t0 + .1 ? 1 - a : b; return { sx: Math.max(.001, s), sy: Math.max(.001, s), _s: s, _t0: t0 }; };
  eachPart(g, MF, tp, (g, p, i, k) => { g.fillStyle = '#FF4FA3'; g.fill(p); g.lineWidth = 6 * S / k; g.strokeStyle = ink; g.stroke(p); }, DOTS);
  for (const k of DOTS) { const o = tp(k), [x, y] = dotC(MF, k), u = seg(t, o._t0 + .03, o._t0 + .2); if (u > 0 && u < 1) { g.save(); g.translate(x, y); g.rotate(u * 6); g.strokeStyle = '#B6FF6A'; g.lineWidth = 4 * S; g.lineCap = 'round';
    for (let a = 0; a < 4; a++) { g.beginPath(); g.arc(0, 0, rS * (1.6 - u), a * TAU / 4, a * TAU / 4 + 1.1); g.stroke(); } g.restore(); } }
  // a gadget (household junk): a ray-gun shaped mic on the floor
  const gx = V ? M.x + 130 * S : M.x + hw + 160 * S;
  g.fillStyle = '#E86A5A'; g.strokeStyle = ink; g.lineWidth = 6 * S; K.rr(g, gx + boil(7), H * .8 - 40 * S, 140 * S, 50 * S, 20 * S); g.fill(); g.stroke();
  g.fillStyle = '#F2F0FF'; K.rr(g, gx + 130 * S + boil(8), H * .8 - 30 * S, 40 * S, 30 * S, 10 * S); g.fill(); g.stroke();
}
