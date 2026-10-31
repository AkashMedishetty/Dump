// Act 1 — precision and craft, one bar (2 s) each. Every world draws the PhE logo in its own material at the same place;
// the five strokes take the world's main material, the three dots its accent — and the dots are the animated hero.
import * as K from './kit.js';
const { clamp, lerp, seg, ss, eio, eo, ei, back, mulberry, hash, TAU, rgb, hex, mix, fbm, vn2 } = K;
const LG = K.LOGO, LW = K.LW, LH = K.LH, SW = K.STROKE;
const STROKES = [0, 1, 2, 3, 4], DOTS = [5, 6, 7];

// ---------- local helpers ----------
// a dot's centre and radius on screen
const dotS = (M, k) => { const p = LG.parts[k], [x, y] = K.toScreen(M, p.cx, p.cy); return [x, y, p.r * K.logoScale(M)]; };
const plen = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
// add a path along pts up to fraction a of its length; returns the end point
function partial(g, pts, a) {
  const L = plen(pts) * clamp(a); let d = 0; g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d + s >= L) { const u = s ? (L - d) / s : 0, x = lerp(pts[i - 1][0], pts[i][0], u), y = lerp(pts[i - 1][1], pts[i][1], u); g.lineTo(x, y); return [x, y]; }
    d += s; g.lineTo(pts[i][0], pts[i][1]);
  }
  return pts[pts.length - 1];
}
// resample a polyline every `step` units: [x, y, tangent angle, distance]
const RS = new Map();
function resample(k, step) {
  const key = k + ':' + step; if (RS.has(key)) return RS.get(key);
  const pts = LG.parts[k].pts, out = []; let carry = 0, dist = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], s = Math.hypot(x1 - x0, y1 - y0); if (!s) continue; const a = Math.atan2(y1 - y0, x1 - x0);
    let u = carry; while (u <= s) { out.push([lerp(x0, x1, u / s), lerp(y0, y1, u / s), a, dist + u]); u += step; }
    carry = u - s; dist += s;
  }
  RS.set(key, out); return out;
}
// the centre line of a stroke part offset sideways by d (logo units)
const OF = new Map();
function offsetPts(k, d) {
  const key = k + ':' + d; if (OF.has(key)) return OF.get(key);
  const P = resample(k, 2), out = P.map(([x, y, a]) => [x - Math.sin(a) * d, y + Math.cos(a) * d]);
  // run on past both ends so the round caps get covered too (callers clip to the part)
  if (P.length > 1) { const [x0, y0, a0] = P[0], [x1, y1, a1] = P[P.length - 1], e = SW * .6;
    for (let s = 2; s <= e; s += 2) out.unshift([x0 - Math.cos(a0) * s - Math.sin(a0) * d, y0 - Math.sin(a0) * s + Math.cos(a0) * d]);
    for (let s = 2; s <= e; s += 2) out.push([x1 + Math.cos(a1) * s - Math.sin(a1) * d, y1 + Math.sin(a1) * s + Math.cos(a1) * d]); }
  OF.set(key, out); return out;
}
// two scratch buffers the size of the frame
const BUFS = [null, null, null, null];
function buf(i, W, H) {
  let c = BUFS[i]; if (!c || c.width !== W || c.height !== H) c = BUFS[i] = K.canvas(W, H);
  const q = c.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1; q.shadowBlur = 0; q.shadowColor = 'rgba(0,0,0,0)'; q.clearRect(0, 0, W, H);
  return q;
}
// draw fn(q) in screen space, keep only what falls inside the given logo parts, composite onto g
// keep only what lies under the mask drawn by drawMask(m) (a union, drawn on its own buffer)
function keepOnly(q, W, H, drawMask) { const m = buf(2, W, H); drawMask(m); q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = 1; q.shadowBlur = 0; q.filter = 'none'; q.globalCompositeOperation = 'destination-in'; q.drawImage(BUFS[2], 0, 0); q.restore(); }
function masked(g, W, H, M, only, fn, bi = 0) {
  const q = buf(bi, W, H); fn(q);
  keepOnly(q, W, H, (m) => K.fillMark(m, M, '#fff', '#fff', { only }));
  g.drawImage(BUFS[bi], 0, 0);
}
// the silhouette outline of the given parts with no inner overlap lines (lw = visible width outside the shape)
function outline(g, W, H, M, col, lw, only = STROKES) {
  const q = buf(3, W, H); K.inMark(q, M, (b, k) => { const P = K.markPaths(); b.strokeStyle = col; b.lineWidth = 2 * lw / k; b.lineJoin = 'round'; for (const i of only) b.stroke(P[i]); });
  q.globalCompositeOperation = 'destination-out'; K.fillMark(q, M, '#000', '#000', { only }); g.drawImage(BUFS[3], 0, 0);
}
// a parabolic hop 0..1 -> 0..1..0
const hop = (u) => 4 * u * (1 - u);
// stadium (pill) path centred on (cx, cy), half sizes a (x) and b (y)
function pill(g, cx, cy, a, b) { K.rr(g, cx - a, cy - b, 2 * a, 2 * b, Math.min(a, b)); }

// =====================================================================================================
// 01 DARK KEYNOTE — the opening: black stage, hairline grid. A blue cue dot blinks on the beat under the P,
// squashes, and on GO it hops the baseline beat by beat; where it lands a dot stays, and its light sweeps the strokes on.
export function darkKeynote(g, t, { W, H, M, S }) {
  g.fillStyle = '#0A0B0F'; g.fillRect(0, 0, W, H);
  const lift = g.createRadialGradient(W / 2, H * .2, 0, W / 2, H * .2, Math.max(W, H) * .8); lift.addColorStop(0, '#161925'); lift.addColorStop(1, 'rgba(22,25,37,0)'); g.fillStyle = lift; g.fillRect(0, 0, W, H);
  const gl = g.createRadialGradient(W * .8, H * .15, 0, W * .8, H * .15, Math.max(W, H) * .5); gl.addColorStop(0, 'rgba(70,60,200,.08)'); gl.addColorStop(1, 'rgba(70,60,200,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
  const s = 48 * S, ox = (W / 2) % s, oy = (M.y) % s; g.lineWidth = 1;
  for (let x = ox, i = 0; x < W; x += s, i++) { g.strokeStyle = `rgba(255,255,255,${i % 4 ? .026 : .05})`; g.beginPath(); g.moveTo(x + .5, 0); g.lineTo(x + .5, H); g.stroke(); }
  for (let y = oy, i = 0; y < H; y += s, i++) { g.strokeStyle = `rgba(255,255,255,${i % 4 ? .026 : .05})`; g.beginPath(); g.moveTo(0, y + .5); g.lineTo(W, y + .5); g.stroke(); }

  const go = 1.0, sc = K.logoScale(M), hw = K.halfW(M), hh = K.halfH(M);
  const D = DOTS.map(k => dotS(M, k)), r = D[0][2];
  // --- the traveller: blink (0–1), wind-up, hop P→h (1.0–1.42), squash, hop h→E (1.5–1.92), settle
  let tx = D[0][0], ty = D[0][1], sx = 1, sy = 1, alpha = 1;
  if (t < go) {
    const on = (t % .5) < .25, wu = seg(t, go - 8 / 24, go);
    alpha = on || wu > 0 ? 1 : .32; sx = 1 + .42 * ei(wu); sy = 1 - .46 * ei(wu);
  } else if (t < 1.42) { const u = seg(t, go, 1.42); tx = lerp(D[0][0], D[1][0], u); ty = lerp(D[0][1], D[1][1], u) - M.R * .62 * hop(u); sy = 1 + .28 * Math.sin(Math.PI * u); sx = 1 - .14 * Math.sin(Math.PI * u); }
  else if (t < 1.5) { const v = seg(t, 1.42, 1.5); tx = D[1][0]; ty = D[1][1]; const q = .34 * (1 - .25 * v); sx = 1 + q; sy = 1 - q; }
  else if (t < 1.92) { const u = seg(t, 1.5, 1.92); tx = lerp(D[1][0], D[2][0], u); ty = lerp(D[1][1], D[2][1], u) - M.R * .62 * hop(u); sy = 1 + .28 * Math.sin(Math.PI * u); sx = 1 - .14 * Math.sin(Math.PI * u); }
  else { const v = seg(t, 1.92, 2.4); tx = D[2][0]; ty = D[2][1]; const q = .36 * Math.cos(v * Math.PI * 2.5) * (1 - v); sx = 1 + q; sy = 1 - q; }
  // the light front rides just ahead of the traveller, and finishes the E after the last landing
  const front = t < go ? -1e9 : t < 1.92 ? tx + 22 * sc : lerp(D[2][0] + 22 * sc, M.x + hw + 60 * S, eo(seg(t, 1.92, 2.15)));
  const lit = t >= go;
  const pulse = (k) => { let p = 0; for (const b of [2.5, 3.0]) { const d = t - b - (k - 5) * .09; if (d > 0) p += Math.exp(-d * 7); } return p; };

  const drawDot = (q, x, y, sxx, syy, a, glow) => {
    q.save(); q.globalAlpha = a; q.translate(x, y + r); q.scale(sxx, syy);
    q.shadowColor = `rgba(60,110,255,${.75})`; q.shadowBlur = (22 + 30 * glow) * S;
    const gr = q.createRadialGradient(-r * .3, -r * 1.3, r * .1, 0, -r, r * 1.05); gr.addColorStop(0, '#8FB2FF'); gr.addColorStop(.55, '#2F6BF0'); gr.addColorStop(1, '#1D4FD0');
    q.fillStyle = gr; K.circle(q, 0, -r, r); q.fill(); q.restore();
  };
  // everything that is lit, drawn by a function so the glossy stage can reflect it
  const scene = (q) => {
    // ghost of the unlit logo: barely there, breathing with the cue
    const ghost = t < go ? (.05 + .05 * ((t % .5) < .25 ? 1 : 0) + .1 * seg(t, .67, 1)) : .07;
    outline(q, W, H, M, `rgba(220,226,255,${ghost})`, 1.1 * S, [0, 1, 2, 3, 4, 5, 6, 7]);
    if (lit) {
      // the strokes, lit left of the front: warm white settling behind a hot white edge
      masked(q, W, H, M, STROKES, (b) => {
        b.save();
        const lg = b.createLinearGradient(front - M.R * 1.3, 0, front + 46 * S, 0); lg.addColorStop(0, '#F4F1EB'); lg.addColorStop(.7, '#FFFFFF'); lg.addColorStop(.85, 'rgba(225,232,255,.95)'); lg.addColorStop(1, 'rgba(200,215,255,0)');
        b.fillStyle = lg; b.fillRect(0, 0, W, H);
        // the blue light of the travelling dot spills onto the strokes nearest it
        const sp = b.createRadialGradient(tx, ty, 0, tx, ty, M.R * 1.1); sp.addColorStop(0, `rgba(90,140,255,${t < 2.3 ? .55 : .55 * (1 - seg(t, 2.3, 2.8))})`); sp.addColorStop(1, 'rgba(90,140,255,0)');
        b.fillStyle = sp; b.fillRect(0, 0, W, H);
        // a soft top light once everything is on
        const top = b.createLinearGradient(0, M.y - hh, 0, M.y + hh); top.addColorStop(0, 'rgba(255,255,255,0)'); top.addColorStop(1, `rgba(150,140,200,${.18 * seg(t, 2.2, 2.8)})`);
        b.fillStyle = top; b.fillRect(0, 0, W, H);
        b.restore();
      });
    }
    // dots left behind where the traveller has been
    if (t >= go) drawDot(q, D[0][0], D[0][1], 1 + .3 * (1 - eo(seg(t, go, go + .2))), 1 + .3 * (1 - eo(seg(t, go, go + .2))), 1, pulse(5));
    if (t >= 1.5) drawDot(q, D[1][0], D[1][1], 1 + .3 * (1 - eo(seg(t, 1.5, 1.7))), 1 + .3 * (1 - eo(seg(t, 1.5, 1.7))), 1, pulse(6));
    drawDot(q, tx, ty, sx, sy, alpha, t > 1.92 ? pulse(7) : t < go ? .3 : .6);
  };
  // glossy stage: a faint mirror of the lit logo below the baseline
  const base = K.toScreen(M, 0, LH)[1] + 4 * S;
  if (lit || t > .3) {
    const q = buf(1, W, H); q.save(); q.translate(0, 2 * base); q.scale(1, -1); scene(q); q.restore();
    q.globalCompositeOperation = 'destination-in'; const fg = q.createLinearGradient(0, base, 0, base + hh * 1.3); fg.addColorStop(0, 'rgba(0,0,0,.9)'); fg.addColorStop(.6, 'rgba(0,0,0,.25)'); fg.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = fg; q.fillRect(0, base, W, H - base);
    q.fillStyle = 'rgba(0,0,0,0)'; q.globalCompositeOperation = 'destination-out'; q.fillRect(0, 0, W, base);
    g.save(); g.globalAlpha = .12; g.drawImage(BUFS[1], 0, 0); g.restore();
  }
  // floor ripples where the dot lands (elliptical, on the stage plane)
  for (const [tl, k] of [[go, 0], [1.42, 1], [1.92, 2]]) { const u = seg(t, tl, tl + .7); if (u <= 0 || u >= 1) continue;
    g.strokeStyle = `rgba(110,150,255,${.5 * (1 - u)})`; g.lineWidth = 1.5 * S; g.beginPath(); g.ellipse(D[k][0], D[k][1] + r, r * (1.2 + 5 * eo(u)), r * (.3 + 1.2 * eo(u)), 0, 0, TAU); g.stroke(); }
  scene(g);
  // glint riding the front during the sweep
  if (lit && t < 2.25) { const gx = Math.min(front, W), gg = g.createRadialGradient(gx, M.y, 0, gx, M.y, M.R * 1.3); gg.addColorStop(0, `rgba(200,210,255,${.12 * (1 - seg(t, 2, 2.25))})`); gg.addColorStop(1, 'rgba(200,210,255,0)'); g.fillStyle = gg; g.fillRect(0, 0, W, H); }
  // stage-manager cue in the corner
  g.font = `500 ${13 * S}px Mono`; g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillStyle = t < go ? `rgba(200,205,225,${.35 + .2 * ((t % .5) < .25 ? 1 : 0)})` : 'rgba(120,160,255,.75)';
  K.track(g, t < go ? 'LX CUE 01 · STANDBY' : 'LX CUE 01 · GO', 40 * S, 52 * S, .14);
  K.vignette(g, W, H, .55);
}

// =====================================================================================================
// 02 HOLOGRAM HUD — a tech summit: one cyan, hairline slices, target boxes and rolling numbers locking onto the parts
export function hologram(g, t, { W, H, M, S }) {
  const cy = [95, 243, 255], bl = [120, 160, 255], hw = K.halfW(M), hh = K.halfH(M);
  g.fillStyle = '#03080D'; g.fillRect(0, 0, W, H);
  const bg = g.createRadialGradient(M.x, M.y, 0, M.x, M.y, Math.max(W, H) * .7); bg.addColorStop(0, 'rgba(20,70,90,.35)'); bg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // floor grid in perspective
  const fy = M.y + hh + 46 * S; g.lineWidth = 1;
  for (let i = -16; i <= 16; i++) { g.strokeStyle = rgb(cy, .08); g.beginPath(); g.moveTo(M.x + i * 22 * S, fy); g.lineTo(M.x + i * 160 * S, H); g.stroke(); }
  for (let j = 0; j < 9; j++) { const y = fy + (H - fy) * Math.pow(j / 8, 1.8); g.strokeStyle = rgb(cy, .08); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const rot = t * .9 + .4;
  g.save(); g.globalCompositeOperation = 'lighter';
  // emitters on the floor under each dot, beams up to the floating dots
  DOTS.forEach((k, i) => { const [x, y, r] = dotS(M, k), dy = Math.sin(t * 5 + i * 1.7) * 4 * S - 6 * S;
    const bm = g.createLinearGradient(0, fy, 0, y + dy); bm.addColorStop(0, rgb(bl, .28)); bm.addColorStop(1, rgb(bl, 0));
    g.fillStyle = bm; K.poly(g, [[x - r * 1.5, fy], [x - r * .5, y + dy], [x + r * .5, y + dy], [x + r * 1.5, fy]]); g.fill();
    g.strokeStyle = rgb(bl, .6); g.lineWidth = 1.2 * S; g.beginPath(); g.ellipse(x, fy, r * 1.6, r * .42, 0, 0, TAU); g.stroke(); });
  // wireframe: the logo as stacked slices turning in depth
  for (let z = -3; z <= 3; z++) { if (!z) continue;
    const MM = { x: M.x + Math.sin(rot) * z * 7 * S, y: M.y - z * 3 * S, R: M.R };
    K.strokeMark(g, MM, rgb(cy, .17), 1 * S, rgb(bl, .2)); }
  K.fillMark(g, M, rgb(cy, .07), 'rgba(0,0,0,0)', { only: STROKES });
  // horizontal raster lines inside the strokes
  K.inMark(g, M, (q, k) => { const P = K.markPaths(); q.fillStyle = rgb(cy, .25);
    for (const i of STROKES) { q.save(); q.clip(P[i]); for (let y = (t * 30) % 4; y < LH; y += 4 * S / k) q.fillRect(0, y, LW, .9 * S / k); q.restore(); } });
  outline(g, W, H, M, rgb(cy, .95), 1.6 * S);
  // the three dots float a hair above the baseline, solid light
  DOTS.forEach((k, i) => { const [x, y, r] = dotS(M, k), dy = Math.sin(t * 5 + i * 1.7) * 4 * S - 6 * S;
    const gr = g.createRadialGradient(x, y + dy, 0, x, y + dy, r * 2.6); gr.addColorStop(0, 'rgba(235,240,255,1)'); gr.addColorStop(.35, rgb(bl, .95)); gr.addColorStop(.4, rgb(bl, .35)); gr.addColorStop(1, rgb(bl, 0));
    g.fillStyle = gr; K.circle(g, x, y + dy, r * 2.6); g.fill(); });
  // scan band
  const sy = M.y - hh - 50 * S + ((t * .9) % 1) * (2 * hh + 100 * S);
  const sg = g.createLinearGradient(0, sy - 26 * S, 0, sy + 26 * S); sg.addColorStop(0, rgb(cy, 0)); sg.addColorStop(.5, rgb(cy, .2)); sg.addColorStop(1, rgb(cy, 0));
  g.fillStyle = sg; g.fillRect(M.x - hw - 60 * S, sy - 26 * S, 2 * hw + 120 * S, 52 * S);
  g.restore();
  // target boxes lock onto the letters, one per beat-third; leaders to rolling read-outs
  const T = [[[0], 'PEOPLE', '1,200', -1, -1, .1, 44], [[1, 2], 'PLACES', '03 HALLS', -1, 1, .4, 96], [[3, 4], 'EXPERIENCES', '∞  WOW', 1, -1, .7, 44]];
  g.font = `500 ${15 * S}px Mono`; g.textBaseline = 'middle'; let locks = 0;
  for (const [ks, lab, val, dx, dy, t0, drop] of T) {
    const lt = t - t0, k = ks[0]; if (lt < 0) continue; locks++;
    const bb = ks.map(i => K.partBox(M, i)), x0 = Math.min(...bb.map(b => b[0])), y0 = Math.min(...bb.map(b => b[1])), x1 = Math.max(...bb.map(b => b[2])), y1 = Math.max(...bb.map(b => b[3])), pad = lerp(70, 8, eo(seg(lt, 0, .25))) * S, c = 14 * S;
    const bx0 = x0 - pad, by0 = y0 - pad, bx1 = x1 + pad, by1 = y1 + pad;
    g.strokeStyle = rgb(cy, .9); g.lineWidth = 1.5;
    for (const [px, py, sxn, syn] of [[bx0, by0, 1, 1], [bx1, by0, -1, 1], [bx1, by1, -1, -1], [bx0, by1, 1, -1]]) { g.beginPath(); g.moveTo(px, py + syn * c); g.lineTo(px, py); g.lineTo(px + sxn * c, py); g.stroke(); }
    const sx0 = dx < 0 ? bx0 : bx1, sy0 = dy < 0 ? by0 : by1, ex = sx0 + dx * 34 * S, ey = sy0 + dy * drop * S, shelf = 150 * S, lk = eo(seg(lt, .15, .4));
    g.beginPath(); g.moveTo(sx0, sy0); g.lineTo(lerp(sx0, ex, clamp(lk * 2)), lerp(sy0, ey, clamp(lk * 2))); if (lk > .5) g.lineTo(clamp(ex + dx * shelf * (lk - .5) * 2, 30 * S, W - 30 * S), ey); g.stroke();
    if (lk > .9) { const roll = seg(lt, .4, .8), txt = val.split('').map((ch, i) => roll * val.length > i ? ch : '#%&@$0'[Math.floor(hash(i + Math.floor(t * 24) + k) * 6)]).join('');
      const tx = clamp(ex + dx * shelf, 30 * S, W - 30 * S); g.textAlign = dx < 0 ? 'left' : 'right';
      g.fillStyle = rgb(cy); g.fillText(lab, tx, ey - 13 * S); g.fillStyle = rgb(cy, .65); g.fillText(txt, tx, ey + 14 * S); }
  }
  // the dots get round reticles, pinging in sequence
  DOTS.forEach((k, i) => { const lt = t - 1.0 - i * .12; if (lt < 0) return; locks++; const [x, y, r] = dotS(M, k), dy = Math.sin(t * 5 + i * 1.7) * 4 * S - 6 * S, rr = lerp(r * 4, r * 1.9, eo(seg(lt, 0, .2)));
    g.strokeStyle = rgb(bl, .9); g.lineWidth = 1.3 * S; for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2 + t * 1.5; g.beginPath(); g.arc(x, y + dy, rr, a + .25, a + Math.PI / 2 - .25); g.stroke(); }
    const pg = seg(lt, 0, .5); if (pg < 1) { g.strokeStyle = rgb(bl, .7 * (1 - pg)); K.circle(g, x, y + dy, rr + pg * 40 * S); g.stroke(); } });
  g.fillStyle = rgb(cy, .5); g.font = `500 ${13 * S}px Mono`; g.textAlign = 'left'; K.track(g, 'SCAN 02 · SUMMIT HALL · LOCK ' + locks + '/6', 40 * S, 52 * S, .12);
  K.vignette(g, W, H, .6);
}

// =====================================================================================================
// 03 ASCII CRT — a hackathon: the logo exists only as glyph density on an amber phosphor grid; the dots hop in text rows
export function asciiCrt(g, t, { W, H, M, S }) {
  const ph = [255, 176, 0], hot = [255, 238, 190], hw = K.halfW(M), hh = K.halfH(M);
  g.fillStyle = '#0B0700'; g.fillRect(0, 0, W, H);
  const fs = 18 * S; g.font = `${fs}px VT323`; const cw = g.measureText('M').width, ch = 16 * S, ramp = ' .:-=+*#%@';
  g.textBaseline = 'middle'; g.textAlign = 'left';
  const col = (x) => Math.floor(x / cw), row = (y) => Math.floor(y / ch);
  const c0 = Math.max(0, col(M.x - hw) - 6), c1 = Math.min(col(W) , col(M.x + hw) + 6), r0 = Math.max(0, row(M.y - hh) - 6), r1 = row(M.y + hh) + 3;
  // each dot hops a few text rows on every beat, a ripple running left to right
  const hopRows = DOTS.map((k, i) => { const u = (((t - .05 - i * .09) % .5) + .5) % .5 / .3; return u < 1 ? Math.round(3.4 * hop(u)) : 0; });
  const fr = Math.floor(t * 24);
  g.save(); g.shadowColor = rgb(ph, .8); g.shadowBlur = 8 * S;
  const sub = [-.33, 0, .33];
  for (let r = r0; r <= r1; r++) {
    let line = '', dl = '';
    for (let c = c0; c <= c1; c++) {
      const x = c * cw + cw / 2, y = r * ch + ch / 2; let d = 0, dd = 0;
      for (const ox of sub) for (const oy of sub) {
        const [lx, ly] = K.toLogo(M, x + ox * cw, y + oy * ch), k = K.markHit(lx, ly); if (k >= 0 && k < 5) d++;
        for (let i = 0; i < 3; i++) { const [mx, my] = K.toLogo(M, x + ox * cw, y + oy * ch + hopRows[i] * ch); if (K.markHit(mx, my) === DOTS[i]) dd++; }
      }
      let chs = d > 0 ? ramp[Math.min(9, Math.round(d / 9 * 9))] : ' ';
      if (chs !== ' ' && hash(c * 7.1 + r * 13.3 + fr) < .03) chs = '01#%'[Math.floor(hash(c + r + fr) * 4)];
      line += chs; dl += dd > 1 ? (dd > 6 ? '@' : 'o') : ' ';
    }
    const y = r * ch + ch / 2;
    g.fillStyle = rgb(ph, .95); g.fillText(line, c0 * cw, y);
    if (dl.trim()) { g.save(); g.shadowColor = 'rgba(255,220,140,1)'; g.shadowBlur = 16 * S; g.fillStyle = rgb(hot); g.fillText(dl, c0 * cw, y); g.restore(); }
  }
  // an ASCII window around the logo: the pill-shaped "app" the hackathon is shipping
  const bc0 = col(M.x - hw) - 4, bc1 = col(M.x + hw) + 4, br0 = row(M.y - hh) - 5, br1 = row(M.y + hh) + 2, bw = bc1 - bc0;
  const draw = (s, c, r, a = .7) => { g.fillStyle = rgb(ph, a); g.fillText(s, c * cw, r * ch + ch / 2); };
  const title = '[ phe.exe ]', ttl = '.' + '-'.repeat(3) + title + '-'.repeat(Math.max(0, bw - 5 - title.length)) + '.';
  draw(ttl, bc0, br0); draw("'" + '-'.repeat(bw - 1) + "'", bc0, br1);
  for (let r = br0 + 1; r < br1; r++) { draw(r === br0 + 1 || r === br1 - 1 ? '(' : '|', bc0, r, .55); draw(r === br0 + 1 || r === br1 - 1 ? ')' : '|', bc1, r, .55); }
  const st = 'guests:1200  stage:ready  dots:' + hopRows.map(h => h ? '^' : '_').join('');
  draw(st, bc1 - st.length - 1, br1 + 1, .5);
  g.restore();
  // terminal log (top left) types, with a block cursor
  const log = ['> call show --venue hall_b', '  guests ........ 1,200', '  stage ......... ready', '  power ......... ok', '> run phe.exe'];
  g.font = `${26 * S}px VT323`; g.textBaseline = 'top'; g.fillStyle = '#0B0700'; g.fillRect(28 * S, 28 * S, 440 * S, 170 * S);
  g.fillStyle = rgb(ph); g.shadowColor = rgb(ph, .8); g.shadowBlur = 8 * S;
  let n = Math.floor(Math.max(0, t + .5) * 75), cx = 40 * S, cyy = 40 * S;
  log.forEach((l, i) => { if (n < 0) return; const s = l.slice(0, n); g.fillText(s, 40 * S, 40 * S + i * 28 * S); cx = 40 * S + g.measureText(s).width + 4 * S; cyy = 40 * S + i * 28 * S; n -= l.length; if (n >= 0 && i < log.length - 1 && n === 0) n = -1; });
  if (Math.floor(t * 4) % 2 === 0) g.fillRect(cx, cyy + 3 * S, 12 * S, 20 * S);
  g.shadowBlur = 0;
  // rolling refresh bar, scanlines, curvature vignette
  const rb = ((t * .55) % 1) * H * 1.3 - H * .15, rg = g.createLinearGradient(0, rb - 60 * S, 0, rb + 60 * S); rg.addColorStop(0, rgb(ph, 0)); rg.addColorStop(.5, rgb(ph, .05)); rg.addColorStop(1, rgb(ph, 0)); g.fillStyle = rg; g.fillRect(0, rb - 60 * S, W, 120 * S);
  g.fillStyle = 'rgba(0,0,0,.28)'; for (let y = 0; y < H; y += 3 * S) g.fillRect(0, y, W, 1.2 * S);
  K.vignette(g, W, H, .75, .3);
}

// =====================================================================================================
// 04 BLUEPRINT — the venue build: pencil construction first, then white ink drawn part by part, rig points, dimension, balloons
export function blueprint(g, t, { W, H, M, S }) {
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#16306A'); bg.addColorStop(1, '#2A58A6'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .35; g.globalCompositeOperation = 'overlay'; g.drawImage(K.paper('cyan', 960, 540, [128, 128, 128], { mottle: 40, grain: 26, seed: 4 }), 0, 0, W, H); g.restore();
  const s = 40 * S; g.lineWidth = 1;
  for (let x = (M.x % s); x < W; x += s) { g.strokeStyle = 'rgba(230,240,255,.07)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = (M.y % s); y < H; y += s) { g.strokeStyle = 'rgba(230,240,255,.07)'; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const ink = 'rgba(236,244,255,.95)', k = (a, b) => eo(seg(t, a, b)), hw = K.halfW(M), hh = K.halfH(M), sc = K.logoScale(M);
  const X = (u) => K.toScreen(M, u, 0)[0], Y = (u) => K.toScreen(M, 0, u)[1];
  // construction: cap line, x-height, baseline and stem axes in dash-dot pencil
  g.strokeStyle = 'rgba(236,244,255,.4)'; g.lineWidth = 1; g.setLineDash([14 * S, 6 * S, 3 * S, 6 * S]);
  const c1 = k(-.35, .15), ext = hw + 110 * S;
  g.font = `500 ${11 * S}px Mono`; g.fillStyle = 'rgba(236,244,255,.55)'; g.textAlign = 'right'; g.textBaseline = 'middle';
  for (const [u, lab] of [[0, 'CAP'], [57.4, 'X-HT'], [LH, 'BASE']]) { const y = Y(u); g.beginPath(); g.moveTo(M.x - ext * c1, y); g.lineTo(M.x + ext * c1, y); g.stroke(); if (c1 > .9) g.fillText(lab, M.x - ext - 8 * S, y); }
  const c2 = k(-.25, .25);
  for (const u of [12, 186.5, 334]) { const x = X(u); g.beginPath(); g.moveTo(x, M.y - (hh + 60 * S) * c2); g.lineTo(x, M.y + (hh + 60 * S) * c2); g.stroke(); }
  g.setLineDash([]);
  // compass arcs: P bowl, h arch, E bowl — swung once, centre pricked
  [[95.6, 57.5, 45.5], [243.8, 123.3, 53.9], [372.9, 108, 39.1]].forEach(([cx, cy, rr], i) => {
    const a = k(-.3 + i * .12, .3 + i * .12); if (a <= 0) return; const [x, y] = K.toScreen(M, cx, cy);
    g.strokeStyle = 'rgba(236,244,255,.32)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, rr * sc, -Math.PI / 2, -Math.PI / 2 + TAU * a); g.stroke();
    g.beginPath(); g.moveTo(x - 6 * S, y); g.lineTo(x + 6 * S, y); g.moveTo(x, y - 6 * S); g.lineTo(x, y + 6 * S); g.stroke(); });
  // pencil silhouette (readable from frame one)
  outline(g, W, H, M, 'rgba(236,244,255,.45)', 1.1 * S, [0, 1, 2, 3, 4]);
  // ink, part by part in drafting order: outline + centre line, revealed along each stroke's centre line
  const A = STROKES.map(i => k(-.2 + i * .13, .22 + i * .13));
  const q = buf(0, W, H);
  outline(q, W, H, M, ink, 2.3 * S);
  K.inMark(q, M, (b, kk) => { const L = K.markLines(); b.setLineDash([10, 4, 2, 4]); b.lineWidth = .8 * S / kk; b.strokeStyle = 'rgba(236,244,255,.6)'; for (const i of STROKES) b.stroke(L[i]); b.setLineDash([]); });
  let nib = null;
  keepOnly(q, W, H, (m) => K.inMark(m, M, (b) => { b.lineCap = 'round'; b.lineJoin = 'round'; b.lineWidth = SW * 2.4; b.strokeStyle = '#fff';
    STROKES.forEach((i, n) => { if (A[n] <= 0) return; b.beginPath(); const e = partial(b, LG.parts[i].pts, A[n]); b.stroke(); if (A[n] < 1 && !nib) nib = e; }); }));
  g.drawImage(BUFS[0], 0, 0);
  if (nib) { const [x, y] = K.toScreen(M, nib[0], nib[1]); g.fillStyle = '#FFFFFF'; g.shadowColor = 'rgba(255,255,255,.9)'; g.shadowBlur = 10 * S; K.circle(g, x, y, 3 * S); g.fill(); g.shadowBlur = 0; }
  // rig points: the three dots stamped in amber on the beat, crosshair + a ring that pulses
  DOTS.forEach((d, i) => { const a = k(.62 + i * .14, .72 + i * .14), [x, y, r] = dotS(M, d);
    g.strokeStyle = 'rgba(236,244,255,.5)'; g.lineWidth = 1; K.circle(g, x, y, r); g.stroke();
    if (a > 0) { const sc2 = back(a, 3); g.fillStyle = '#FFD25E'; g.shadowColor = 'rgba(255,210,94,.6)'; g.shadowBlur = 12 * S; K.circle(g, x, y, r * sc2); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = '#16306A'; g.lineWidth = 1.4 * S; g.beginPath(); g.moveTo(x - r * .6, y); g.lineTo(x + r * .6, y); g.moveTo(x, y - r * .6); g.lineTo(x, y + r * .6); g.stroke();
      const pr = ((t - .72 - i * .14) % .5 + .5) % .5 / .5; g.strokeStyle = `rgba(255,210,94,${.6 * (1 - pr)})`; g.lineWidth = 1.2 * S; K.circle(g, x, y, r * (1.3 + pr * 1.6)); g.stroke(); } });
  // dimension line under the logo
  const dk = k(.85, 1.25);
  if (dk > 0) { const y = M.y + hh + 62 * S, xl = M.x - hw, xr = M.x + hw; g.strokeStyle = ink; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(xl, M.y + hh + 14 * S); g.lineTo(xl, y + 10 * S); g.moveTo(xr, M.y + hh + 14 * S); g.lineTo(xr, y + 10 * S); g.stroke();
    g.beginPath(); g.moveTo(M.x - hw * dk, y); g.lineTo(M.x + hw * dk, y); g.stroke();
    if (dk > .95) for (const [x, d] of [[xl, 1], [xr, -1]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + d * 12 * S, y - 4 * S); g.lineTo(x + d * 12 * S, y + 4 * S); g.closePath(); g.fillStyle = ink; g.fill(); }
    g.font = `500 ${15 * S}px Mono`; g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'top'; g.globalAlpha = dk; K.track(g, '9 000  ·  STAGE FASCIA, HALL B', M.x, y + 12 * S, .1); g.globalAlpha = 1; }
  // balloons above the letters
  [[0, -50], [2, 20], [4, 60]].forEach(([i, off], n) => { const a = k(.95 + n * .12, 1.2 + n * .12); if (a <= 0) return; const [x0, y0] = K.partBox(M, i), [ax] = K.anchor(M, i);
    const x = ax, y = y0 + 6 * S, bx = ax + off * S, by = M.y - hh - 66 * S; g.strokeStyle = ink; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, y); g.lineTo(lerp(x, bx, a), lerp(y, by + 16 * S, a)); g.stroke(); K.circle(g, x, y, 2.5 * S); g.fillStyle = ink; g.fill();
    if (a > .95) { K.circle(g, bx, by, 16 * S); g.stroke(); g.font = `600 ${15 * S}px Mono`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n + 1), bx, by); } });
  // title block
  g.strokeStyle = 'rgba(236,244,255,.6)'; g.lineWidth = 1; const bw = 300 * S, bh = 86 * S, bx = W - bw - 40 * S, by = H - bh - 40 * S; g.strokeRect(bx, by, bw, bh);
  g.beginPath(); g.moveTo(bx, by + bh / 2); g.lineTo(bx + bw, by + bh / 2); g.stroke();
  g.font = `600 ${15 * S}px Mono`; g.fillStyle = 'rgba(236,244,255,.85)'; g.textAlign = 'left'; g.textBaseline = 'middle';
  K.track(g, 'PURPLEHAT · VENUE BUILD', bx + 14 * S, by + bh / 4, .1); K.track(g, 'FIG. 04  RIG PTS ×3  1:50', bx + 14 * S, by + bh * .75, .1);
}

// =====================================================================================================
// 05 ART DECO — the 1930s gala: black lacquer, a pill cartouche, sunburst, setback towers; gold-leaf strokes, cobalt enamel dots
export function artDeco(g, t, { W, H, M, S, V }) {
  g.fillStyle = '#0B0907'; g.fillRect(0, 0, W, H);
  const hw = K.halfW(M), hh = K.halfH(M), px = hw + 70 * S, py = hh + 58 * S;
  const gold = (y0, y1) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#F6E3A1'); gr.addColorStop(.45, '#C9A23F'); gr.addColorStop(.55, '#8C6A1E'); gr.addColorStop(1, '#E9C86A'); return gr; };
  // sunburst rays open along the axis
  const open = eo(seg(t, -.25, .6)), n = 44, L = Math.hypot(W, H);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - n / 2 + .5) / n * TAU * open, w = Math.PI / n * .5 * open;
    const gr = g.createRadialGradient(M.x, M.y, py, M.x, M.y, L * .7); gr.addColorStop(0, `rgba(214,175,70,${i % 2 ? .5 : .26})`); gr.addColorStop(1, 'rgba(214,175,70,0)');
    g.fillStyle = gr; K.poly(g, [[M.x, M.y], [M.x + Math.cos(a - w) * L, M.y + Math.sin(a - w) * L], [M.x + Math.cos(a + w) * L, M.y + Math.sin(a + w) * L]]); g.fill();
  }
  // setback towers: flanking the cartouche in 16:9, a skyline under it in 9:16
  const tower = (x0, w, y0, i) => {
    g.fillStyle = '#14100A'; g.fillRect(x0, y0, w, H - y0);
    g.strokeStyle = gold(y0, H); g.lineWidth = 1.6 * S; g.strokeRect(x0, y0, w, H - y0);
    g.globalAlpha = .4; for (let l = 1; l < 4; l++) { const lx = x0 + w * l / 4; g.beginPath(); g.moveTo(lx, y0 + 12 * S); g.lineTo(lx, H); g.stroke(); } g.globalAlpha = 1;
    g.beginPath(); const cx = x0 + w / 2; for (let c = 0; c < 3; c++) { g.moveTo(cx - w * .35, y0 + (10 + c * 10) * S); g.lineTo(cx, y0 + c * 10 * S); g.lineTo(cx + w * .35, y0 + (10 + c * 10) * S); } g.stroke();
    // a spire light on top
    const lit = seg(t, .3 + i * .1, .4 + i * .1); if (lit > 0) { g.fillStyle = '#FFE9A8'; g.shadowColor = 'rgba(255,214,120,.9)'; g.shadowBlur = 14 * S; K.circle(g, cx, y0 - 6 * S, 3.5 * S); g.fill(); g.shadowBlur = 0; }
  };
  if (!V) {
    const x0 = px + 46 * S, room = W / 2 - x0, w = Math.min(M.R * .42, room / 4.6), gap = (room - 4 * w) / 4;
    for (const sx of [-1, 1]) [.05, .45, .78, 1].forEach((top, i) => { const d = x0 + gap * .5 + i * (w + gap), y0 = lerp(H, M.y + py * .2 - top * (py * 1.4 + 60 * S), eo(seg(t, i * .08 - .2, .4 + i * .08)));
      tower(sx > 0 ? M.x + d : M.x - d - w, w, y0, i); });
  } else {
    const w = W / 9; [.3, .6, .9, 1, .9, .6, .3].forEach((top, i) => { const y0 = lerp(H, H * .78 - top * H * .1, eo(seg(t, Math.abs(i - 3) * .07 - .2, .4 + Math.abs(i - 3) * .07))); tower(W / 2 + (i - 3.5) * w * 1.15 + w * .075, w, y0, Math.abs(i - 3)); });
  }
  // marquee bulbs around the frame, switching on in a chase
  const per = 2 * (W + H), step = 34 * S, nb = Math.floor(per / step), on = Math.floor(clamp((t + .25) / 1.2) * nb);
  for (let i = 0; i < nb; i++) { let d = i * step, x, y; const m = 18 * S;
    if (d < W) { x = d; y = m; } else if ((d -= W) < H) { x = W - m; y = d; } else if ((d -= H) < W) { x = W - d; y = H - m; } else { d -= W; x = m; y = H - d; }
    const lit = i < on && (i + Math.floor(t * 8)) % 3 !== 0; g.fillStyle = lit ? '#FFE9A8' : '#3A2E14'; if (lit) { g.shadowColor = 'rgba(255,214,120,.9)'; g.shadowBlur = 12 * S; } K.circle(g, x, y, 4.5 * S); g.fill(); g.shadowBlur = 0; }
  // the cartouche: a lacquer pill with a double gold rule and stepped fans above and below
  pill(g, M.x, M.y, px, py); g.fillStyle = '#0B0907'; g.fill();
  const cg = gold(M.y - py, M.y + py);
  g.strokeStyle = cg; g.lineWidth = 3 * S; pill(g, M.x, M.y, px, py); g.stroke();
  g.lineWidth = 1.2 * S; pill(g, M.x, M.y, px - 10 * S, py - 10 * S); g.stroke();
  for (const sy of [-1, 1]) { g.lineWidth = 1.6 * S; g.strokeStyle = cg;
    for (let i = -3; i <= 3; i++) { const yy = M.y + sy * (py + 6 * S); g.beginPath(); g.moveTo(M.x + i * 7 * S, yy); g.lineTo(M.x + i * 30 * S, yy + sy * (54 - Math.abs(i) * 9) * S); g.stroke(); }
    const yy = M.y + sy * (py + 6 * S); g.beginPath(); for (let c = 0; c < 3; c++) { g.moveTo(M.x - (36 + c * 14) * S, yy + sy * c * 9 * S); g.lineTo(M.x + (36 + c * 14) * S, yy + sy * c * 9 * S); } g.globalAlpha = .0; g.stroke(); g.globalAlpha = 1; }
  // gold-leaf strokes: leaf gradient, an engine-turned centre groove, a dark tooled edge
  K.inMark(g, M, (q) => { const P = K.markPaths(), gr = q.createLinearGradient(0, -10, 0, LH + 10);
    gr.addColorStop(0, '#FBEDB5'); gr.addColorStop(.35, '#D9B04A'); gr.addColorStop(.52, '#8C6A1E'); gr.addColorStop(.7, '#E3BE5C'); gr.addColorStop(1, '#F6E3A1');
    q.fillStyle = gr; for (const i of STROKES) q.fill(P[i]); });
  K.lineMark(g, M, 'rgba(255,246,210,.55)', 1.6 * S, null, STROKES);
  outline(g, W, H, M, '#6E5214', 1.4 * S);
  // a gleam sweeps the leaf
  const gx = lerp(M.x - hw * 1.6, M.x + hw * 1.6, seg(t, .15, 1.0));
  masked(g, W, H, M, STROKES, (b) => { const gg = b.createLinearGradient(gx - 60 * S, 0, gx + 60 * S, 0); gg.addColorStop(0, 'rgba(255,255,240,0)'); gg.addColorStop(.5, 'rgba(255,255,240,.85)'); gg.addColorStop(1, 'rgba(255,255,240,0)');
    b.save(); b.translate(gx, M.y); b.transform(1, 0, -.5, 1, 0, 0); b.translate(-gx, -M.y); b.fillStyle = gg; b.fillRect(gx - 80 * S, 0, 160 * S, H); b.restore(); });
  // cobalt enamel dots in gold bezels, each chimes (pops + twinkles) on its beat
  DOTS.forEach((k, i) => { const [x, y, r] = dotS(M, k), tb = .25 + i * .25, d = t - tb, pop = d > 0 ? 1 + .22 * Math.exp(-d * 9) * Math.cos(d * 30) : 1, R = r * pop;
    g.fillStyle = cg; K.circle(g, x, y, R * 1.18); g.fill();
    const en = g.createRadialGradient(x - R * .35, y - R * .4, R * .1, x, y, R); en.addColorStop(0, '#9DBBFF'); en.addColorStop(.45, '#2563EB'); en.addColorStop(1, '#0F2E86');
    g.fillStyle = en; K.circle(g, x, y, R * .92); g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(x - R * .32, y - R * .38, R * .22, R * .12, -.6, 0, TAU); g.fill();
    const tw = d > 0 ? Math.exp(-d * 6) : 0; if (tw > .02) { g.save(); g.translate(x + R * .6, y - R * .7); g.fillStyle = `rgba(255,248,220,${tw})`; g.beginPath();
      for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4, rr2 = j % 2 ? 3 * S : 16 * S * tw; g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } g.closePath(); g.fill(); g.restore(); } });
  g.font = `${44 * S}px Limelight`; g.fillStyle = gold(M.y + py + 60 * S, M.y + py + 110 * S); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.globalAlpha = eo(seg(t, .4, .8)); K.track(g, 'THE GALA', M.x, M.y + py + (V ? 110 : 96) * S, .3); g.globalAlpha = 1;
  K.vignette(g, W, H, .55);
}

// =====================================================================================================
// 06 STAINED GLASS — an awards hall: a long leaded transom shaped around the logo; amber glass strokes, three blue jewels
export function stainedGlass(g, t, { W, H, M, S }) {
  g.fillStyle = '#0D0B0A'; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .5; g.drawImage(K.paper('stone', 640, 360, [40, 36, 33], { mottle: 30, grain: 30, seed: 6, scale: .4 }), 0, 0, W, H); g.restore();
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2 * S; for (let y = 0, r = 0; y < H; y += 46 * S, r++) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for (let x = (r % 2) * 60 * S; x < W; x += 120 * S) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 46 * S); g.stroke(); } }
  const hw = K.halfW(M), hh = K.halfH(M), px = Math.min(hw + 96 * S, W / 2 - 30 * S), py = hh + 84 * S;
  const sun = lerp(-1, 1, (t + .3) / 2.6), litX = M.x + sun * px * 1.15;   // the sun's patch slides across the window: light is the clock
  const pal = [[34, 62, 150], [150, 24, 38], [28, 54, 130], [120, 30, 50], [30, 110, 80], [90, 40, 130]];
  const L = (x) => .22 + .78 * Math.exp(-(((x - litX) / (px * .5)) ** 2));
  // stone surround: a moulded pill with a sill
  g.fillStyle = '#4a433c'; pill(g, M.x, M.y, px + 34 * S, py + 34 * S); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 3 * S; pill(g, M.x, M.y, px + 34 * S, py + 34 * S); g.stroke();
  g.strokeStyle = 'rgba(190,170,150,.35)'; g.lineWidth = 2 * S; pill(g, M.x, M.y, px + 22 * S, py + 22 * S); g.stroke();
  g.fillStyle = '#3d3732'; g.fillRect(M.x - px - 60 * S, M.y + py + 30 * S, 2 * px + 120 * S, 22 * S); g.fillStyle = 'rgba(200,180,160,.25)'; g.fillRect(M.x - px - 60 * S, M.y + py + 30 * S, 2 * px + 120 * S, 3 * S);
  // diamond quarries, each pane its own pot-metal colour, lit by the sun patch
  g.save(); pill(g, M.x, M.y, px, py); g.clip();
  g.fillStyle = '#120f0d'; g.fillRect(M.x - px, M.y - py, 2 * px, 2 * py);
  const qw = 44 * S, qh = 62 * S, ni = Math.ceil(px / qw) + 1, nj = Math.ceil(py / qh) + 1;
  for (let j = -nj * 2; j <= nj * 2; j++) for (let i = -ni; i <= ni; i++) {
    const cx = M.x + i * qw + (j % 2 ? qw / 2 : 0), cy = M.y + j * qh / 2, c = pal[Math.floor(hash(Math.abs(i) * 3.1 + Math.abs(j) * 7.7) * 6)], l = L(cx) * (.85 + .15 * vn2(cx * .01, cy * .01));
    g.fillStyle = rgb(mix([12, 10, 10], c, l)); K.poly(g, [[cx, cy - qh / 2], [cx + qw / 2, cy], [cx, cy + qh / 2], [cx - qw / 2, cy]]); g.fill();
    g.fillStyle = `rgba(255,255,255,${.06 * l})`; K.poly(g, [[cx, cy - qh / 2], [cx + qw / 2, cy], [cx, cy - qh * .1]]); g.fill();
  }
  g.strokeStyle = '#151210'; g.lineWidth = 4 * S;
  for (let j = -nj * 2; j <= nj * 2; j++) for (let i = -ni; i <= ni; i++) { const cx = M.x + i * qw + (j % 2 ? qw / 2 : 0), cy = M.y + j * qh / 2; K.poly(g, [[cx, cy - qh / 2], [cx + qw / 2, cy], [cx, cy + qh / 2], [cx - qw / 2, cy]]); g.stroke(); }
  // a clear border light inside the frame
  g.strokeStyle = '#151210'; g.lineWidth = 5 * S; pill(g, M.x, M.y, px - 26 * S, py - 26 * S); g.stroke();
  g.restore();
  // the logo: amber pot-metal glass with streaks, a halo of clear quarry around each letter
  K.strokeMark(g, M, rgb(mix([40, 34, 26], [230, 220, 190], L(M.x))), 20 * S, 'rgba(0,0,0,0)');
  masked(g, W, H, M, STROKES, (b) => {
    const gr = b.createLinearGradient(M.x - hw, 0, M.x + hw, 0); for (let i = 0; i <= 10; i++) { const x = M.x - hw + i / 10 * 2 * hw, l = L(x); gr.addColorStop(i / 10, rgb(mix([70, 42, 10], [255, 214, 120], l))); }
    b.fillStyle = gr; b.fillRect(0, 0, W, H);
    b.globalAlpha = .35; b.drawImage(K.tex('streak', 512, 128, (q, w, h) => { for (let y = 0; y < h; y++) { const v = fbm(y * .08, 3.3, 3); q.fillStyle = `rgba(${v > .5 ? '255,250,220' : '60,30,0'},${Math.abs(v - .5) * .9})`; q.fillRect(0, y, w, 1); } }), M.x - hw, M.y - hh, 2 * hw, 2 * hh); b.globalAlpha = 1;
  });
  outline(g, W, H, M, '#141110', 5 * S);
  // the dots: faceted cobalt jewels; each flares when the sun reaches it
  DOTS.forEach((k) => { const [x, y, r] = dotS(M, k), l = L(x);
    g.fillStyle = '#141110'; K.circle(g, x, y, r + 4 * S); g.fill();
    const jw = g.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r); jw.addColorStop(0, rgb(mix([60, 80, 140], [190, 215, 255], l))); jw.addColorStop(.5, rgb(mix([12, 30, 90], [37, 99, 235], l))); jw.addColorStop(1, rgb(mix([5, 12, 40], [16, 50, 150], l)));
    g.fillStyle = jw; K.circle(g, x, y, r); g.fill();
    const fl = Math.exp(-(((x - litX) / (px * .12)) ** 2));
    if (fl > .03) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.fillStyle = `rgba(170,200,255,${.9 * fl})`;
      for (const a of [0, Math.PI / 2]) { g.save(); g.rotate(a + .3); g.beginPath(); g.ellipse(0, 0, r * 3.2 * fl, r * .14, 0, 0, TAU); g.fill(); g.restore(); }
      const hg = g.createRadialGradient(0, 0, 0, 0, 0, r * 3); hg.addColorStop(0, `rgba(120,160,255,${.6 * fl})`); hg.addColorStop(1, 'rgba(120,160,255,0)'); g.fillStyle = hg; K.circle(g, 0, 0, r * 3); g.fill(); g.restore(); } });
  // the window's iron frame
  g.strokeStyle = '#141110'; g.lineWidth = 12 * S; pill(g, M.x, M.y, px, py); g.stroke();
  // god rays falling to the floor + coloured pools
  g.save(); g.globalCompositeOperation = 'lighter';
  const fy = H * .97, shift = sun * W * .12 + W * .1;
  for (let i = 0; i < 9; i++) { const x0 = M.x + (i - 4) / 4 * px * .85, x1 = x0 + shift + (i - 4) * 22 * S, c = pal[i % 5], a = .1 * L(x0) + .02;
    const gr = g.createLinearGradient(0, M.y + py, 0, fy); gr.addColorStop(0, rgb(c, a)); gr.addColorStop(1, rgb(c, a * .3));
    g.fillStyle = gr; K.poly(g, [[x0 - 20 * S, M.y + py], [x0 + 20 * S, M.y + py], [x1 + 46 * S, fy], [x1 - 46 * S, fy]]); g.fill();
    g.fillStyle = rgb(c, a * 1.6); g.beginPath(); g.ellipse(x1, fy, 70 * S, 14 * S, 0, 0, TAU); g.fill(); }
  g.restore();
  K.vignette(g, W, H, .7, .25);
}

// =====================================================================================================
// 07 PAPER LANTERN — a night festival shadow box: the logo is burnt through the back card, lantern light pours out of the cut;
// the three dots are cut-out windows with red candle light, each flickering on its own
export function paperLantern(g, t, { W, H, M, S }) {
  const hw = K.halfW(M), hh = K.halfH(M);
  // back card: deep indigo paper, thinner (and lit from behind) around the logo
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0b1230'); sky.addColorStop(1, '#2c3c70'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .35; g.globalCompositeOperation = 'overlay'; g.drawImage(K.paper('card', 960, 540, [128, 128, 128], { mottle: 26, grain: 18, fibres: 1200, seed: 17 }), 0, 0, W, H); g.restore();
  const fl = .9 + .1 * Math.sin(t * 11) * Math.sin(t * 6.7);
  g.save(); g.translate(M.x, M.y); g.scale(1, .55); const gl = g.createRadialGradient(0, 0, hw * .2, 0, 0, hw * 1.9); gl.addColorStop(0, `rgba(255,190,105,${.42 * fl})`); gl.addColorStop(.45, `rgba(240,150,80,${.16 * fl})`); gl.addColorStop(1, 'rgba(240,150,80,0)'); g.fillStyle = gl; g.fillRect(-W, -H * 2, W * 2, H * 4); g.restore();
  // pinprick stars in the card
  for (let i = 0; i < 70; i++) { const r = mulberry(300 + i), x = r() * W, y = r() * H * .62, tw = .5 + .5 * Math.sin(t * (2 + r() * 4) + i);
    if (Math.abs(x - M.x) < hw + 40 * S && Math.abs(y - M.y) < hh + 40 * S) continue;
    g.fillStyle = `rgba(255,220,160,${.35 + .5 * tw})`; g.shadowColor = 'rgba(255,200,120,.9)'; g.shadowBlur = 6 * S; K.circle(g, x, y, (1 + r() * 1.4) * S); g.fill(); } g.shadowBlur = 0;
  // the cut: light through the logo-shaped hole (hot centre, amber edges), a scorched rim
  K.fillMark(g, M, 'rgba(255,150,60,1)', 'rgba(0,0,0,0)', { only: STROKES, shadow: { c: `rgba(255,170,80,${.95 * fl})`, b: 46 * S } });
  masked(g, W, H, M, STROKES, (b) => { const gr = b.createRadialGradient(M.x, M.y + hh * .3, 0, M.x, M.y, hw * 1.05); gr.addColorStop(0, '#FFF6DA'); gr.addColorStop(.55, '#FFDFA0'); gr.addColorStop(1, '#FFB260');
    b.fillStyle = gr; b.fillRect(0, 0, W, H); b.globalAlpha = .18; b.drawImage(K.paper('rice2', 480, 270, [128, 128, 128], { mottle: 60, grain: 20, fibres: 600, seed: 21 }), 0, 0, W, H); });
  outline(g, W, H, M, 'rgba(120,45,10,.75)', 2.2 * S);
  // dots: round windows with red candle light, each flickering on its own beat
  DOTS.forEach((k, i) => { const [x, y, r] = dotS(M, k), f = .78 + .22 * Math.sin(t * (9 + i * 2.3) + i * 2) * Math.sin(t * (5.1 + i) + i), pulse = Math.exp(-((((t - .25 - i * .25) % 1.5) + 1.5) % 1.5) * 5);
    const hl = g.createRadialGradient(x, y, 0, x, y, r * (4 + 2 * pulse)); hl.addColorStop(0, `rgba(255,80,40,${.45 * f})`); hl.addColorStop(1, 'rgba(255,80,40,0)'); g.fillStyle = hl; K.circle(g, x, y, r * (4 + 2 * pulse)); g.fill();
    const c = g.createRadialGradient(x, y + r * .2, 0, x, y, r); c.addColorStop(0, '#FFE2B0'); c.addColorStop(.45, `rgb(255,${100 + 60 * f},60)`); c.addColorStop(1, '#D8331C');
    g.fillStyle = c; g.shadowColor = 'rgba(255,70,30,.95)'; g.shadowBlur = (16 + 20 * pulse) * S; K.circle(g, x, y, r * (1 + .12 * pulse)); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = 'rgba(110,30,10,.8)'; g.lineWidth = 1.6 * S; K.circle(g, x, y, r * (1 + .12 * pulse)); g.stroke(); });
  // floating lanterns rise (between the back card and the front layers), steering clear of the logo
  for (let i = 0; i < 16; i++) { const r = mulberry(40 + i), x = r() * W, y = H - ((t * (40 + r() * 50) * S + r() * H) % (H * 1.1)), s = (8 + r() * 10) * S;
    if (Math.abs(x - M.x) < hw + 30 * S && Math.abs(y - M.y) < hh + 40 * S) continue;
    g.save(); g.shadowColor = 'rgba(255,170,80,.9)'; g.shadowBlur = 16 * S; g.fillStyle = 'rgba(255,190,110,.9)'; K.rr(g, x - s / 2, y - s * .7, s, s * 1.3, s * .3); g.fill(); g.restore(); }
  // layers of cut card, darker toward the front, each throwing a soft shadow on the next
  const cols = ['#24345f', '#1b284b', '#14203d', '#0e1532', '#0a0f24'], drift = Math.sin(t * .8) * 6 * S;
  cols.forEach((c, Ln) => {
    const base = H * (.76 + Ln * .055), amp = (52 - Ln * 6) * S, par = drift * (Ln + 1) * .5;
    g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 18 * S; g.shadowOffsetY = -4 * S; g.fillStyle = c;
    g.beginPath(); g.moveTo(-20, H);
    for (let x = -20; x <= W + 20; x += 10 * S) { const nn = fbm((x + par) / (260 * S) + Ln * 7, Ln); g.lineTo(x + par, base - nn * amp * 2.2 + (Ln === 1 ? -Math.max(0, 1 - Math.abs(x - W * .14) / (140 * S)) * 120 * S : 0)); }
    g.lineTo(W + 20, H); g.closePath(); g.fill();
    if (Ln === 3) { for (const px of [W * .13, W * .87]) { for (let f = 0; f < 3; f++) { const y = base - 40 * S - f * 52 * S, w = (120 - f * 22) * S;
      g.beginPath(); g.moveTo(px - w, y); g.quadraticCurveTo(px - w * .4, y - 14 * S, px, y - 22 * S); g.quadraticCurveTo(px + w * .4, y - 14 * S, px + w, y); g.lineTo(px + w * .55, y); g.lineTo(px + w * .55, y + 44 * S); g.lineTo(px - w * .55, y + 44 * S); g.lineTo(px - w * .55, y); g.closePath(); g.fill();
      g.save(); g.shadowBlur = 14 * S; g.shadowColor = 'rgba(255,190,100,.9)'; g.fillStyle = 'rgba(255,200,120,.9)'; for (let wi = -1; wi <= 1; wi++) g.fillRect(px + wi * 22 * S - 6 * S, y + 14 * S, 12 * S, 18 * S); g.restore(); g.fillStyle = c; } } }
    g.restore();
  });
  g.strokeStyle = '#05070f'; g.lineWidth = 34 * S; g.strokeRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,220,170,.12)'; g.lineWidth = 2 * S; g.strokeRect(17 * S, 17 * S, W - 34 * S, H - 34 * S);
  K.vignette(g, W, H, .5);
}

// =====================================================================================================
// 08 SHADOW PUPPET — a cultural night: oil-lamp light on cotton; the logo is carved translucent hide on a rod,
// lace-punched along every stroke; the dots are indigo hide discs on their own rods; two figures present it
export function shadowPuppet(g, t, { W, H, M, S, V }) {
  const fl = .92 + .08 * Math.sin(t * 13) * Math.sin(t * 7.3), hw = K.halfW(M), hh = K.halfH(M);
  g.fillStyle = '#2a1206'; g.fillRect(0, 0, W, H);
  const lamp = g.createRadialGradient(M.x, M.y * .9, 0, M.x, M.y, Math.max(W, H) * .65); lamp.addColorStop(0, `rgba(255,214,150,${fl})`); lamp.addColorStop(.5, `rgba(226,140,60,${.85 * fl})`); lamp.addColorStop(1, 'rgba(90,30,8,1)');
  g.fillStyle = lamp; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .25; g.globalCompositeOperation = 'multiply'; g.drawImage(K.paper('cotton', 640, 360, [200, 190, 175], { mottle: 30, grain: 40, seed: 8 }), 0, 0, W, H); g.restore();
  const tt = K.twos(t, 12);
  // the main rod holds the logo from below the h
  const [hx] = K.anchor(M, 1); g.strokeStyle = 'rgba(30,10,4,.6)'; g.lineWidth = 3 * S; g.beginPath(); g.moveTo(hx, M.y + hh * .8); g.lineTo(hx + 30 * S, H + 10); g.stroke();
  // carved hide: soft cast shadow (the hide is a hair off the screen), translucent dyed red, edged dark
  K.fillMark(g, { x: M.x + 6 * S, y: M.y + 5 * S, R: M.R }, 'rgba(40,10,2,.25)', 'rgba(0,0,0,0)', { only: STROKES });
  K.fillMark(g, M, 'rgba(168,36,14,.84)', 'rgba(0,0,0,0)', { only: STROKES });
  masked(g, W, H, M, STROKES, (b) => { const gr = b.createLinearGradient(0, M.y - hh, 0, M.y + hh); gr.addColorStop(0, 'rgba(255,170,90,.22)'); gr.addColorStop(1, 'rgba(60,0,0,.2)'); b.fillStyle = gr; b.fillRect(0, 0, W, H); });
  K.inMark(g, M, (q, k) => {
    q.fillStyle = 'rgba(255,222,160,.92)';
    for (const i of STROKES) { const P = resample(i, 11); P.forEach(([x, y, a], j) => { if (j === 0 || j === P.length - 1) return;
      if (j % 3 === 1) { q.save(); q.translate(x, y); q.rotate(a); q.beginPath(); q.ellipse(0, 0, 3.6, 1.2, 0, 0, TAU); q.fill(); q.restore(); }
      else { const nx = -Math.sin(a) * 6, ny = Math.cos(a) * 6; K.circle(q, x + nx, y + ny, 1.7); q.fill(); K.circle(q, x - nx, y - ny, 1.7); q.fill(); } }); }
  });
  outline(g, W, H, M, 'rgba(40,8,2,.9)', 2.4 * S);
  // dots: indigo hide discs on thin rods, each bobbing on twos with its own phase
  DOTS.forEach((k, i) => { const [x, y, r] = dotS(M, k), dy = Math.round(Math.sin(tt * 6 + i * 2.1) * 3) * 2 * S - Math.max(0, Math.sin((tt - .25 - i * .25) * Math.PI * 2)) * 8 * S;
    g.strokeStyle = 'rgba(30,10,4,.55)'; g.lineWidth = 2 * S; g.beginPath(); g.moveTo(x, y + dy + r); g.lineTo(x - 20 * S + i * 20 * S, H + 10); g.stroke();
    g.fillStyle = 'rgba(40,20,10,.25)'; K.circle(g, x + 5 * S, y + dy + 4 * S, r * 1.15); g.fill();
    g.fillStyle = 'rgba(40,52,150,.86)'; K.circle(g, x, y + dy, r * 1.15); g.fill(); g.strokeStyle = 'rgba(20,8,30,.9)'; g.lineWidth = 2 * S; g.stroke();
    g.fillStyle = 'rgba(255,222,160,.92)'; K.circle(g, x, y + dy, r * .22); g.fill(); for (let j = 0; j < 6; j++) { const a = j / 6 * TAU + .3; K.circle(g, x + Math.cos(a) * r * .66, y + dy + Math.sin(a) * r * .66, r * .11); g.fill(); } });
  // two profile figures on rods, hands raised to present the logo; moving on twos
  for (const sx of [-1, 1]) {
    const bx = V ? M.x + sx * W * .26 : M.x + sx * (hw + 150 * S), by = V ? M.y + hh + 300 * S : M.y + hh * .9, sc = V ? 1.05 : 1;
    const bob = Math.sin(tt * 3 + sx) * 6 * S;
    g.save(); g.translate(bx, by + bob); g.scale(sx * S * sc, S * sc);
    const col = sx < 0 ? 'rgba(30,60,40,.88)' : 'rgba(110,30,20,.88)';
    g.fillStyle = col;
    g.beginPath(); g.moveTo(-40, -60); g.quadraticCurveTo(-70, 60, -80, 190); g.lineTo(60, 190); g.quadraticCurveTo(40, 60, 30, -60); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(0, -100, 34, 40, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-30, -130); g.lineTo(10, -190); g.lineTo(36, -130); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-34, -100); g.lineTo(-52, -92); g.lineTo(-34, -84); g.fill();
    g.fillStyle = 'rgba(255,215,150,.9)'; for (let i = 0; i < 12; i++) { K.circle(g, -30 + (i % 4) * 18, 10 + Math.floor(i / 4) * 40, 4); g.fill(); }
    K.circle(g, -12, -108, 4); g.fill();
    const reach = .5 + .5 * Math.sin(tt * 2.2 + (sx > 0 ? 1 : 0)), hx2 = V ? -70 : -150, hy2 = V ? -220 - 30 * reach : -120 - 20 * reach;
    g.strokeStyle = col; g.lineWidth = 14; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-20, -40); g.lineTo(-80, V ? -110 - 30 * reach : -60 - 30 * reach); g.lineTo(hx2, hy2); g.stroke();
    g.fillStyle = col; K.circle(g, hx2, hy2, 11); g.fill();
    g.strokeStyle = 'rgba(30,10,4,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(hx2, hy2); g.lineTo(-170, 520); g.moveTo(0, -60); g.lineTo(10, 520); g.stroke();
    g.restore();
  }
  g.strokeStyle = '#1a0a03'; g.lineWidth = 30 * S; g.strokeRect(0, 0, W, H);
  K.vignette(g, W, H, .55, .3, '40,10,0');
}

// =====================================================================================================
// 09 PAPERCUT RED — a new-year gala: a long fold-symmetric window flower (a scalloped pill), its border cut yin-style,
// the PhE cut out of the solid red field (yang) so the rice paper shows through; three gold-dyed paper dots flutter down
// onto the baseline on the beat; swallows fly on twos.
function stadiumPt(a, r, s) {    // a = half straight length, r = end radius; s in [0,1) of the perimeter from top-centre, clockwise
  const P = 4 * a + TAU * r; let d = ((s % 1) + 1) % 1 * P;
  if (d < a) return [d, -r, 0, -1]; d -= a;
  if (d < Math.PI * r) { const th = -Math.PI / 2 + d / r; return [a + Math.cos(th) * r, Math.sin(th) * r, Math.cos(th), Math.sin(th)]; } d -= Math.PI * r;
  if (d < 2 * a) return [a - d, r, 0, 1]; d -= 2 * a;
  if (d < Math.PI * r) { const th = Math.PI / 2 + d / r; return [-a + Math.cos(th) * r, Math.sin(th) * r, Math.cos(th), Math.sin(th)]; } d -= Math.PI * r;
  return [-a + d, -r, 0, -1];
}
const stadiumLen = (a, r) => 4 * a + TAU * r;
export function papercut(g, t, { W, H, M, S, V }) {
  g.drawImage(K.paper('rice', 960, 540, [240, 228, 205], { mottle: 14, grain: 10, fibres: 2500, seed: 9 }), 0, 0, W, H);
  const hw = K.halfW(M), hh = K.halfH(M), open = eo(seg(t, -.3, .35));
  const A = Math.min(hw + 190 * S, W / 2 - 22 * S), B = hh + 172 * S, a = A - B, gs = lerp(.9, 1, open);   // the panel unfolds a touch
  const ox = M.x, oy = M.y;
  // ---- the panel, built on its own sheet: red paper, then the cuts
  const q = buf(0, W, H);
  q.save(); q.translate(ox, oy); q.scale(gs, gs);
  // scalloped outer edge
  const per = stadiumLen(a, B), nS = Math.round(per / (34 * S) / 4) * 4, step = 1 / (nS * 10);
  q.beginPath(); for (let i = 0; i <= nS * 10; i++) { const s = i * step + .5 / nS, [x, y, nx, ny] = stadiumPt(a, B, s), b = Math.abs(Math.sin(Math.PI * (i / 10))) * 13 * S - 6 * S; q.lineTo(x + nx * b, y + ny * b); } q.closePath();
  q.save(); q.clip(); q.drawImage(K.paper('redp', 960, 540, [196, 18, 44], { mottle: 22, grain: 14, fibres: 1600, seed: 19 }), -ox / gs, -oy / gs, W / gs, H / gs); q.restore();
  q.globalCompositeOperation = 'destination-out'; q.fillStyle = '#000';
  // 1) a row of punched holes just inside the scallops
  { const r0 = B - 24 * S, n = Math.round(stadiumLen(a, r0) / (30 * S) / 4) * 4; for (let i = 0; i < n; i++) { const [x, y] = stadiumPt(a, r0, (i + .5) / n); K.circle(q, x, y, 4.2 * S); q.fill(); } }
  // 2) sawtooth band
  { const r0 = B - 44 * S, n = Math.round(stadiumLen(a, r0) / (14 * S) / 4) * 4; for (let i = 0; i < n; i++) { const [x, y, nx, ny] = stadiumPt(a, r0, i / n), tx = -ny, ty = nx, w = 5.5 * S;
    K.poly(q, [[x - tx * w + nx * 5 * S, y - ty * w + ny * 5 * S], [x + tx * w + nx * 5 * S, y + ty * w + ny * 5 * S], [x - nx * 7 * S, y - ny * 7 * S]]); q.fill(); } }
  // 3) crescents (moons opening outward) alternating with swirl-drops, fold-symmetric
  { const r0 = B - 82 * S, n = Math.round(stadiumLen(a, r0) / (46 * S) / 4) * 4;
    for (let i = 0; i < n; i++) { const [x, y, nx, ny] = stadiumPt(a, r0, (i + .5) / n), ang = Math.atan2(ny, nx);
      q.save(); q.translate(x, y); q.rotate(ang);
      if (i % 2 === 0) { q.beginPath(); q.arc(0, 0, 15 * S, -Math.PI / 2 - .9, Math.PI / 2 + .9, false); q.arc(-7 * S, 0, 13 * S, Math.PI / 2 + .55, -Math.PI / 2 - .55, true); q.closePath(); q.fill(); }
      else { const sgn = 1; q.beginPath(); q.moveTo(-14 * S, 0); q.quadraticCurveTo(-2 * S, -12 * S, 10 * S, -3 * S); q.arc(8 * S, 2 * S, 5 * S, -1.2, 2.2); q.quadraticCurveTo(2 * S, 6 * S, -14 * S, 0); q.closePath(); q.fill();
        q.beginPath(); q.moveTo(-14 * S, 0); q.quadraticCurveTo(-2 * S, 12 * S * sgn, 10 * S, 3 * S); q.arc(8 * S, -2 * S, 5 * S, 1.2, -2.2, true); q.quadraticCurveTo(2 * S, -6 * S, -14 * S, 0); q.closePath(); q.fill(); }
      q.restore(); } }
  // 4) an inner slit ring with four paper bridges (so the centre stays attached)
  { const r0 = B - 118 * S, n = 400, wdt = 3.2 * S; for (let i = 0; i < n; i++) { const s = i / n, m = (s * 4 + .125) % 1; if (m < .04 || m > .96) continue;
      const [x, y] = stadiumPt(a, r0, s); K.circle(q, x, y, wdt); q.fill(); } }
  // 5) paired leaf cuts at the two ends of the inner field
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { q.save(); q.translate(sx * (hw + 40 * S), sy * 16 * S); q.rotate(sx * sy * .5 + (sx < 0 ? Math.PI : 0));
    q.beginPath(); q.moveTo(-14 * S, 0); q.quadraticCurveTo(0, -11 * S, 16 * S, 0); q.quadraticCurveTo(0, 11 * S, -14 * S, 0); q.fill(); q.restore(); }
  for (const sx of [-1, 1]) { K.circle(q, sx * (hw + 30 * S), 0, 5 * S); q.fill(); }
  q.restore();
  // 6) the PhE itself, cut out of the solid field (dots are NOT cut: gold paper pieces land there)
  q.globalCompositeOperation = 'destination-out';
  K.fillMark(q, M, '#000', 'rgba(0,0,0,0)', { only: STROKES });
  // fold creases (the sheet was folded in four before cutting)
  q.globalCompositeOperation = 'source-atop';
  for (const [x0, y0, x1, y1] of [[ox, oy - B * gs - 20 * S, ox, oy + B * gs + 20 * S], [ox - A * gs - 20 * S, oy, ox + A * gs + 20 * S, oy]]) {
    q.strokeStyle = 'rgba(255,255,255,.10)'; q.lineWidth = 1.5 * S; q.beginPath(); q.moveTo(x0, y0); q.lineTo(x1, y1); q.stroke();
    q.strokeStyle = 'rgba(60,0,0,.12)'; q.beginPath(); q.moveTo(x0 + 1.5 * S, y0 + 1.5 * S); q.lineTo(x1 + 1.5 * S, y1 + 1.5 * S); q.stroke(); }
  q.globalCompositeOperation = 'source-over';
  // lay the panel on the rice paper with a soft drop shadow (shows inside the cut letters too)
  g.save(); g.shadowColor = 'rgba(80,0,0,.45)'; g.shadowBlur = 9 * S; g.shadowOffsetY = 7 * S; g.shadowOffsetX = 3 * S; g.drawImage(BUFS[0], 0, 0); g.restore();
  // ---- three gold-dyed paper dots flutter down onto the baseline, one per beat, then sit (on twos)
  const tt = K.twos(t, 12);
  DOTS.forEach((k, i) => { const [x, y, r] = dotS(M, k), tl = .12 + i * .25, u = clamp((tt - (tl - .55)) / .55), fall = 1 - u;
    const dy = -fall * fall * M.R * .95, dx = Math.sin(fall * 9 + i) * fall * 26 * S, flip = u < 1 ? Math.cos(fall * 14 + i) : 1, land = tt > tl ? Math.exp(-(tt - tl) * 10) * Math.sin((tt - tl) * 40) * .18 : 0;
    const cx = x + dx, cy = y + dy;
    g.save(); g.fillStyle = `rgba(90,10,0,${.3 - .2 * fall})`; g.filter = 'none'; g.beginPath(); g.ellipse(x + dx * .5 + (2 + 10 * fall) * S, y + (4 + 16 * fall) * S, r * (1 + .3 * fall), r * Math.max(.2, Math.abs(flip)) * (1 + .3 * fall), 0, 0, TAU); g.fill(); g.restore();
    g.save(); g.translate(cx, cy); g.rotate(fall * 2 + i); g.scale(1 + land, Math.max(.12, Math.abs(flip)) * (1 - land)); g.rotate(-(fall * 2 + i));
    const gd = g.createRadialGradient(-r * .3, -r * .3, 0, 0, 0, r * 1.05); gd.addColorStop(0, flip >= 0 ? '#FBD872' : '#E2A933'); gd.addColorStop(.7, flip >= 0 ? '#E9B53A' : '#C88E22'); gd.addColorStop(1, '#B07C1C');
    g.fillStyle = gd; K.circle(g, 0, 0, r * 1.05); g.fill();
    // a tiny four-petal cut in each gold piece
    g.fillStyle = '#A80C26'; for (let j = 0; j < 4; j++) { g.save(); g.rotate(j * Math.PI / 2 + Math.PI / 4); g.beginPath(); g.ellipse(r * .4, 0, r * .3, r * .15, 0, 0, TAU); g.fill(); g.restore(); } K.circle(g, 0, 0, r * .1); g.fill();
    g.restore();
  });
  // ---- swallows (jointed red cut-outs) on twos: in the side margins (16:9) or above and below the panel (9:16)
  const red = '#C8102E';
  const sw = V ? [[M.x - 210 * S, M.y - B - 230 * S, 1], [M.x + 230 * S, M.y - B - 330 * S, -1], [M.x + 190 * S, M.y + B + 240 * S, -1], [M.x - 240 * S, M.y + B + 330 * S, 1]]
               : [[M.x - A - (W / 2 - A) * .5, M.y - 150 * S, 1], [M.x - A - (W / 2 - A) * .45, M.y + 170 * S, -1], [M.x + A + (W / 2 - A) * .5, M.y - 120 * S, -1], [M.x + A + (W / 2 - A) * .5, M.y + 190 * S, 1]];
  sw.forEach(([cx, cy, dir], i) => { const a2 = tt * 2.2 * dir + i * 1.7, rx = Math.min(130 * S, V ? 260 * S : (W / 2 - A) * .38), ry = 70 * S, x = cx + Math.cos(a2) * rx, y = cy + Math.sin(a2) * ry, head = a2 + dir * Math.PI / 2;
    g.save(); g.translate(x, y); g.rotate(head + Math.PI / 2); g.scale(S * 1.25, S * 1.25); g.shadowColor = 'rgba(80,0,0,.3)'; g.shadowBlur = 6; g.shadowOffsetY = 4; g.fillStyle = red;
    const flap = Math.sin(tt * 18 + i * 2) * .6;
    g.beginPath(); g.moveTo(0, -20); g.quadraticCurveTo(8, -14, 6, -4); g.quadraticCurveTo(28, -14 + flap * 22, 50, 2 + flap * 6); g.quadraticCurveTo(26, 2, 6, 6); g.lineTo(10, 30); g.lineTo(2, 16); g.lineTo(0, 22); g.lineTo(-2, 16); g.lineTo(-10, 30); g.lineTo(-6, 6);
    g.quadraticCurveTo(-26, 2, -50, 2 + flap * 6); g.quadraticCurveTo(-28, -14 + flap * 22, -6, -4); g.quadraticCurveTo(-8, -14, 0, -20); g.closePath(); g.fill();
    g.shadowColor = 'rgba(0,0,0,0)'; g.fillStyle = '#F0E4CD'; K.circle(g, 0, -13, 1.8); g.fill();
    g.beginPath(); g.moveTo(-30, -2 + flap * 10); g.lineTo(-14, -2); g.lineTo(-30, 1 + flap * 10); g.fill(); g.beginPath(); g.moveTo(30, -2 + flap * 10); g.lineTo(14, -2); g.lineTo(30, 1 + flap * 10); g.fill();
    g.restore(); });
  K.grainOver(g, W, H, t, .04, 'pc');
}

// =====================================================================================================
// 10 WOODCUT — a manifesto summit: a black block, light only where the knife has cut; the PhE carved white with gouge
// ridges along each stroke; one colour, for what burns: the three dots, glowing like embers
export function woodcut(g, t, { W, H, M, S }) {
  g.fillStyle = '#0c0b0a'; g.fillRect(0, 0, W, H);
  const cut = eo(seg(t, -.25, 1.0)), paperC = '#EDE6D6', hw = K.halfW(M), hh = K.halfH(M), sc = K.logoScale(M);
  g.strokeStyle = paperC; g.lineCap = 'round';
  // radiating gouges from a pill around the logo, growing with the cut
  const ax = hw + 56 * S, ay = hh + 50 * S, N = 170;
  for (let i = 0; i < N; i++) { const a = i / N * TAU + hash(i * 1.3) * .02, c = Math.cos(a), s = Math.sin(a), r0 = 1 / Math.pow(Math.pow(Math.abs(c) / ax, 4) + Math.pow(Math.abs(s) / ay, 4), .25);
    const len = (0.4 + .6 * hash(i * 3.1)) * Math.max(W, H) * .6 * cut, w = (2.8 - 1.9 * hash(i)) * S;
    g.lineWidth = w; g.beginPath(); g.moveTo(M.x + c * r0, M.y + s * r0); g.lineTo(M.x + c * (r0 + len), M.y + s * (r0 + len)); g.stroke(); }
  // a carved pill border hugging the logo (two knife lines)
  g.lineWidth = 2.4 * S; pill(g, M.x, M.y, ax - 16 * S, ay - 16 * S); g.stroke(); g.lineWidth = 1.2 * S; pill(g, M.x, M.y, ax - 26 * S, ay - 26 * S); g.stroke();
  // crowd at the bottom: heads and shoulders as white-line hatching
  for (let i = 0; i < 18; i++) { const r = mulberry(i * 5 + 3), x = (i + .5) / 18 * W + (r() - .5) * 30 * S, s2 = (58 + r() * 26) * S, y = H - s2 * 1.1 + r() * 20 * S;
    g.fillStyle = '#0c0b0a'; K.circle(g, x, y, s2 * .42); g.fill(); g.beginPath(); g.ellipse(x, y + s2 * 1.25, s2 * .95, s2 * .9, 0, Math.PI, 0); g.lineTo(x + s2, H); g.lineTo(x - s2, H); g.fill();
    g.strokeStyle = paperC; g.lineWidth = 2.2 * S; for (let h = 0; h < 3; h++) { g.beginPath(); g.arc(x, y, s2 * .42 - h * 4 * S, -2.6 + h * .2, -.6 - h * .2); g.stroke(); }
    g.beginPath(); g.ellipse(x, y + s2 * 1.25, s2 * .95 - 3 * S, s2 * .9 - 3 * S, 0, Math.PI + .3, -.3); g.stroke(); }
  // the strokes carved: paper white, with uncut ridges left along the stroke direction (broken, like a gouge)
  K.fillMark(g, M, paperC, 'rgba(0,0,0,0)', { only: STROKES });
  K.inMark(g, M, (q, k) => { const P = K.markPaths(); q.strokeStyle = '#0c0b0a'; q.lineCap = 'round';
    for (const i of STROKES) { q.save(); q.clip(P[i]);
      for (const d of [-7.5, 0.5, 7.5]) { const pts = offsetPts(i, d), r = mulberry(i * 31 + Math.round(d * 10) + 7); q.lineWidth = (d === .5 ? 1.2 : 1.9) * 1.4 / k * S;
        let on = r() < .5, j = 0; while (j < pts.length - 1) { const n = 3 + Math.floor(r() * 12); if (on) { q.beginPath(); q.moveTo(pts[j][0], pts[j][1]); for (let m = 1; m <= n && j + m < pts.length; m++) q.lineTo(pts[j + m][0], pts[j + m][1]); q.stroke(); } j += n; on = !on || r() < .2; } }
      q.restore(); } });
  // nicked edges
  outline(g, W, H, M, 'rgba(12,11,10,.8)', 1.2 * S);
  // the one colour: three dots burning, flaring one after another, sparks lifting off
  DOTS.forEach((k, i) => { const [x, y, r] = dotS(M, k), fl = .75 + .25 * Math.sin(t * 19 + i * 2) * Math.sin(t * 7 + i), flare = Math.exp(-((((t - .1 - i * .25) % 1) + 1) % 1) * 4);
    g.save(); g.shadowColor = `rgba(255,90,20,${.7 + .3 * flare})`; g.shadowBlur = (20 + 30 * flare) * S * fl;
    const c = g.createRadialGradient(x, y - r * .2, 0, x, y, r * (1 + .1 * flare)); c.addColorStop(0, `rgb(255,${150 + 80 * flare},${80 + 60 * flare})`); c.addColorStop(.6, '#E0461E'); c.addColorStop(1, '#A82612');
    g.fillStyle = c; K.circle(g, x, y, r * (1 + .1 * flare)); g.fill(); g.restore();
    for (let s2 = 0; s2 < 6; s2++) { const rr = mulberry(i * 50 + s2), life = ((t * (.8 + rr() * .6) + rr()) % 1), sx2 = x + (rr() - .5) * r * 2 + Math.sin(life * 6 + s2) * 6 * S, sy2 = y - r - life * 120 * S;
      g.fillStyle = `rgba(255,${120 + rr() * 80},40,${(1 - life) * .9})`; g.fillRect(sx2, sy2, 2.4 * S, 2.4 * S); } });
  K.grainOver(g, W, H, t, .12, 'w');
}

// =====================================================================================================
// 11 ENGRAVING — a heritage launch: an intaglio plate; contour hatching runs along every stroke, cross-hatch in the shade,
// a hatched cast shadow, roundel callouts; the three dots are stippled and a hand-laid blue wash blooms on them in turn
export function engraving(g, t, { W, H, M, S }) {
  g.drawImage(K.paper('plate', 960, 540, [238, 230, 212], { mottle: 10, grain: 8, fibres: 1500, seed: 11 }), 0, 0, W, H);
  g.strokeStyle = 'rgba(120,100,70,.4)'; g.lineWidth = 2 * S; g.strokeRect(W * .08, H * .07, W * .84, H * .86); g.strokeStyle = 'rgba(255,255,255,.6)'; g.strokeRect(W * .08 + 3, H * .07 + 3, W * .84, H * .86);
  const ink = '#1E1A16', k = eo(seg(t, -.3, 1.0)), hw = K.halfW(M), hh = K.halfH(M), sc = K.logoScale(M);
  // hatched cast shadow down-right of the letters
  { const q = buf(0, W, H), o = 7 * S; q.strokeStyle = ink; q.lineWidth = .9 * S; q.globalAlpha = .8;
    for (let x = M.x - hw - H; x < M.x + hw + 40 * S; x += 4.2 * S) { q.beginPath(); q.moveTo(x, M.y - hh - 20 * S); q.lineTo(x + (2 * hh + 40 * S), M.y + hh + 20 * S); q.stroke(); }
    q.globalAlpha = 1; keepOnly(q, W, H, (m) => K.fillMark(m, { x: M.x + o, y: M.y + o, R: M.R }, '#000', '#000', { only: STROKES }));
    q.globalCompositeOperation = 'destination-out'; K.fillMark(q, M, '#000', '#000'); g.save(); g.globalAlpha = k; g.drawImage(BUFS[0], 0, 0); g.restore(); }
  // contour hatching inside each stroke: lines that run along the stroke, cut progressively by the burin
  K.inMark(g, M, (q, kk) => { const P = K.markPaths(); q.strokeStyle = ink; q.lineCap = 'butt';
    for (const i of STROKES) { q.save(); q.clip(P[i]);
      for (let d = -11, n = 0; d <= 11.01; d += 2.2, n++) { const pts = offsetPts(i, d), sh = (d + 11) / 22; q.lineWidth = (.55 + .9 * sh) * S / kk; q.beginPath(); partial(q, pts, clamp(k * 1.25 - n * .025)); q.stroke(); }
      // cross-hatch on the shaded side once the contour lines are in
      const ck = seg(t, .45, 1.2); if (ck > 0) { const R = resample(i, 3.2); q.lineWidth = .5 * S / kk; q.globalAlpha = .7;
        R.forEach(([x, y, a], j) => { if (j / R.length > ck) return; const nx = -Math.sin(a), ny = Math.cos(a); q.beginPath(); q.moveTo(x + nx * 2, y + ny * 2); q.lineTo(x + nx * 12, y + ny * 12); q.stroke(); }); q.globalAlpha = 1; }
      q.restore(); }
  });
  outline(g, W, H, M, ink, 1.5 * S);
  // dots: stippled spheres, then a blue wash laid by hand, one after another
  DOTS.forEach((d, i) => { const [x, y, r] = dotS(M, d), wsh = eo(seg(t, .55 + i * .22, 1.0 + i * .22));
    if (wsh > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(92,130,220,${.75 * wsh})`; g.beginPath();
      for (let j = 0; j <= 40; j++) { const a = j / 40 * TAU, rr = r * (1.0 + .32 * wsh) * (.88 + .24 * vn2(Math.cos(a) * 2 + i * 9, Math.sin(a) * 2)); g.lineTo(x + 1.5 * S + Math.cos(a) * rr, y - 1 * S + Math.sin(a) * rr); }
      g.closePath(); g.fill(); g.strokeStyle = `rgba(50,80,170,${.35 * wsh})`; g.lineWidth = 1.2 * S; g.stroke(); g.restore(); }
    const r2 = mulberry(70 + i); g.fillStyle = ink; for (let j = 0; j < 110; j++) { const a = r2() * TAU, rr = Math.sqrt(r2()) * r, dark = (Math.cos(a - .8) * rr / r + 1) / 2; if (r2() > .25 + .75 * dark) continue; K.circle(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr, .9 * S); g.fill(); }
    g.strokeStyle = ink; g.lineWidth = 1.3 * S; K.circle(g, x, y, r); g.stroke(); });
  // numbered roundels and leader lines
  const rd = (n, x, y, bx, by, a) => { if (a <= 0) return; g.strokeStyle = ink; g.lineWidth = .8 * S; g.beginPath(); g.moveTo(x, y); g.lineTo(lerp(x, bx, a), lerp(y, by, a)); g.stroke();
    if (a > .95) { K.circle(g, bx, by, 15 * S); g.fillStyle = 'rgba(238,230,212,.9)'; g.fill(); g.stroke(); g.font = `italic ${17 * S}px IMFellItalic`; g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, bx, by + 1 * S); } };
  const [p0, p1] = K.partBox(M, 0), [ax0] = K.anchor(M, 0); rd('i', ax0 - 40 * S, p1 + 8 * S, ax0 - 90 * S, M.y - hh - 52 * S, eo(seg(t, .6, .85)));
  const [hx, hy] = K.anchor(M, 2), [, h1] = K.partBox(M, 2); rd('ii', hx, h1 + 6 * S, hx + 10 * S, M.y - hh - 52 * S, eo(seg(t, .7, .95)));
  const [ex] = K.anchor(M, 4), [, e1] = K.partBox(M, 3); rd('iii', ex + 30 * S, e1 + 4 * S, ex + 90 * S, M.y - hh - 52 * S, eo(seg(t, .8, 1.05)));
  { const a = eo(seg(t, .9, 1.2)), by = M.y + hh + 48 * S, [dx] = dotS(M, 6); if (a > 0) DOTS.forEach((dk) => { const [x, y, r] = dotS(M, dk); g.strokeStyle = ink; g.lineWidth = .8 * S; g.beginPath(); g.moveTo(x, y + r + 2 * S); g.lineTo(lerp(x, dx, a), lerp(y + r, by - 15 * S, a)); g.stroke(); });
    rd('iv', dx, by - 15 * S, dx, by, a); }
  g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = `${30 * S}px IMFell`; K.track(g, 'PLATE XI', M.x, H * .07 + 50 * S, .3);
  g.font = `italic ${28 * S}px IMFellItalic`; g.fillText('Signum purpureum, quinque lineis et tribus punctis.', M.x, M.y + hh + 120 * S);
  g.font = `italic ${14 * S}px IMFellItalic`; g.textAlign = 'left'; g.fillText('PurpleHat del.', W * .08 + 16 * S, H * .93 - 12 * S); g.textAlign = 'right'; g.fillText('sculp. MMXXVI', W * .92 - 16 * S, H * .93 - 12 * S);
}

// =====================================================================================================
// 12 SILENT FILM — an awards night, 1920s: a flickering 4:3 print between velvet curtains; the logo stands on the stage,
// its three dots hand-tinted (stencil colour, never quite in register) and hopping like a vaudeville bow; then the intertitle,
// still carrying the logo
export function silentFilm(g, t, { W, H, M, S, V }) {
  g.fillStyle = '#120405'; g.fillRect(0, 0, W, H);
  const hw = K.halfW(M), hh = K.halfH(M), fr = Math.floor(t * 24);
  const fw = V ? W * .94 : Math.min(H * .86, W * .72 * .75) * 4 / 3, fh = fw * .75;
  const fx = W / 2 - fw / 2 + Math.sin(t * 9) * 1.5 * S, fy = M.y - fh * .5 + Math.cos(t * 7) * 1.5 * S;
  const fl = .86 + .14 * hash(fr * 1.7);
  const jx = (hash(fr * 3.3) - .5) * 3 * S, jy = (hash(fr * 5.1) - .5) * 3 * S;      // gate weave: the whole picture jitters
  const MM = { x: M.x + jx, y: M.y + jy, R: M.R };
  // stencil tint: off-register by a few px, wobbling frame to frame
  const tint = (bx, by, col) => DOTS.forEach((k, i) => { const [x, y, r] = dotS(MM, k), dy = bowY(i); g.fillStyle = col; K.circle(g, x + bx + (hash(fr + i) - .5) * 3 * S, y + dy + by + (hash(fr * 2 + i) - .5) * 3 * S, r * 1.08); g.fill(); });
  const bowY = (i) => { const u = seg(t, .15 + i * .2, .45 + i * .2); return -hop(u) * 34 * S; };
  g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
  const title = t > 1.15;
  if (!title) {
    g.fillStyle = rgb([200 * fl, 196 * fl, 186 * fl]); g.fillRect(fx, fy, fw, fh);
    // back drape, spotlight, stage boards
    for (let i = 0; i < 16; i++) { g.fillStyle = `rgba(30,26,24,${.1 + .08 * (i % 2)})`; g.fillRect(fx + i * fw / 16, fy, fw / 32, fh); }
    const sp = g.createRadialGradient(MM.x, MM.y, 0, MM.x, MM.y, fh * .62); sp.addColorStop(0, 'rgba(255,255,250,.42)'); sp.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = sp; g.fillRect(fx, fy, fw, fh);
    const st = MM.y + hh + 34 * S; g.fillStyle = 'rgba(40,36,34,.85)'; g.fillRect(fx, st, fw, fh); g.strokeStyle = 'rgba(20,18,16,.8)'; g.lineWidth = 2 * S;
    for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(fx + i * fw / 13, st); g.lineTo(fx + (i - 6.5) * fw / 6 + fw / 2, fy + fh); g.stroke(); }
    // footlights
    for (let i = 0; i < 9; i++) { const x = fx + (i + .5) * fw / 9; const fg = g.createRadialGradient(x, st, 0, x, st, 40 * S); fg.addColorStop(0, `rgba(255,255,240,${.5 * fl})`); fg.addColorStop(1, 'rgba(255,255,240,0)'); g.fillStyle = fg; K.circle(g, x, st, 40 * S); g.fill(); }
    // the logo as a painted flat on stage (black-and-white), with its cast shadow on the drape
    K.fillMark(g, { x: MM.x + 14 * S, y: MM.y + 8 * S, R: M.R }, 'rgba(20,16,14,.28)', 'rgba(0,0,0,0)', { only: STROKES });
    K.fillMark(g, MM, rgb([36 * fl, 32 * fl, 30 * fl]), 'rgba(0,0,0,0)', { only: STROKES });
    K.inMark(g, MM, (q) => { q.strokeStyle = 'rgba(200,196,186,.25)'; q.lineWidth = .9; const P = K.markPaths(); for (const i of STROKES) { q.save(); q.clip(P[i]); for (let h = -LH; h < LW; h += 5) { q.beginPath(); q.moveTo(h, 0); q.lineTo(h + 40, LH); q.stroke(); } q.restore(); } });
    // dots: grey in the print, hopping one after another like a bow…
    DOTS.forEach((k, i) => { const [x, y, r] = dotS(MM, k); g.fillStyle = 'rgba(20,16,14,.3)'; g.beginPath(); g.ellipse(x, y + r, r * (1 - .3 * -bowY(i) / (34 * S)), r * .25, 0, 0, TAU); g.fill();
      g.fillStyle = rgb([175 * fl, 172 * fl, 168 * fl]); K.circle(g, x, y + bowY(i), r); g.fill(); g.strokeStyle = 'rgba(30,26,24,.7)'; g.lineWidth = 1.5 * S; g.stroke(); });
    // …and hand-tinted blue by stencil
    g.save(); g.globalCompositeOperation = 'multiply'; tint(1.5 * S, -1 * S, `rgba(80,130,240,${.85})`); g.restore();
    g.save(); g.globalCompositeOperation = 'screen'; tint(0, 0, 'rgba(40,70,170,.35)'); g.restore();
    // presenter in a top hat, to the right of the E: bows on the beat, arm out to the logo
    const bow = Math.max(0, Math.sin((t - .5) * Math.PI * 2)) * .35, sc = V ? .8 : 1, px = MM.x + Math.min(hw + 125 * S, fw / 2 - 60 * S), py = st;
    g.save(); g.translate(px, py); g.scale(sc, sc); g.fillStyle = 'rgba(25,22,20,.95)';
    g.fillRect(-16 * S, -110 * S, 12 * S, 110 * S); g.fillRect(4 * S, -110 * S, 12 * S, 110 * S);
    g.rotate(-bow); g.beginPath(); g.moveTo(-28 * S, -110 * S); g.lineTo(28 * S, -110 * S); g.lineTo(22 * S, -220 * S); g.lineTo(-22 * S, -220 * S); g.fill();
    g.save(); g.translate(-18 * S, -205 * S); g.rotate(-.9 + .25 * Math.sin(t * 3)); g.fillRect(-6 * S, 0, 12 * S, 80 * S); g.restore();
    K.circle(g, 0, -248 * S, 26 * S); g.fill(); g.fillRect(-20 * S, -320 * S, 40 * S, 52 * S); g.fillRect(-32 * S, -272 * S, 64 * S, 6 * S);
    g.restore();
  } else {
    // intertitle: ornate border, white on black, the logo between the lines
    g.fillStyle = '#0d0c0b'; g.fillRect(fx, fy, fw, fh);
    g.strokeStyle = 'rgba(230,226,215,.85)'; g.lineWidth = 2 * S; g.strokeRect(fx + 30 * S, fy + 30 * S, fw - 60 * S, fh - 60 * S); g.strokeRect(fx + 38 * S, fy + 38 * S, fw - 76 * S, fh - 76 * S);
    for (const [cx, cy] of [[fx + 38 * S, fy + 38 * S], [fx + fw - 38 * S, fy + 38 * S], [fx + 38 * S, fy + fh - 38 * S], [fx + fw - 38 * S, fy + fh - 38 * S]]) { g.fillStyle = 'rgba(230,226,215,.85)'; K.circle(g, cx, cy, 6 * S); g.fill(); }
    K.fillMark(g, MM, rgb([236 * fl, 232 * fl, 222 * fl]), 'rgba(0,0,0,0)', { only: STROKES });
    DOTS.forEach((k) => { const [x, y, r] = dotS(MM, k); g.fillStyle = rgb([236 * fl, 232 * fl, 222 * fl]); K.circle(g, x, y, r); g.fill(); });
    g.save(); g.globalCompositeOperation = 'multiply'; DOTS.forEach((k, i) => { const [x, y, r] = dotS(MM, k); g.fillStyle = 'rgba(90,140,250,.95)'; K.circle(g, x + 1.5 * S + (hash(fr + i) - .5) * 3 * S, y - 1 * S, r * 1.08); g.fill(); }); g.restore();
    g.fillStyle = 'rgba(236,232,222,.95)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `italic ${44 * S}px IMFellItalic`; g.fillText('Ladies & gentlemen—', M.x, M.y - hh - 70 * S); g.font = `${46 * S}px IMFell`; g.fillText('the show.', M.x, M.y + hh + 70 * S);
  }
  // scratches, dust, flicker
  for (let i = 0; i < 4; i++) { const r = hash(fr * 3 + i); if (r < .5) continue; g.strokeStyle = `rgba(255,255,255,${.12 + .2 * r})`; g.lineWidth = 1; const x = fx + hash(i + fr) * fw; g.beginPath(); g.moveTo(x, fy); g.lineTo(x + 4, fy + fh); g.stroke(); }
  for (let i = 0; i < 6; i++) { const r = mulberry(fr * 7 + i); if (r() < .5) continue; g.fillStyle = r() < .5 ? 'rgba(0,0,0,.6)' : 'rgba(255,255,255,.5)'; K.circle(g, fx + r() * fw, fy + r() * fh, (1 + r() * 2.5) * S); g.fill(); }
  K.grainOver(g, W, H, t, .18, 's');
  const iv = g.createRadialGradient(M.x, M.y, fh * .3, M.x, M.y, fh * .8); iv.addColorStop(0, 'rgba(0,0,0,0)'); iv.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = iv; g.fillRect(fx, fy, fw, fh);
  g.restore();
  // velvet curtains framing the screen
  for (const sx of [-1, 1]) { const x0 = sx < 0 ? 0 : fx + fw, w = sx < 0 ? fx : W - fx - fw; if (w <= 0) continue;
    for (let i = 0; i < 9; i++) { const xx = x0 + (i / 9) * w, gr = g.createLinearGradient(xx, 0, xx + w / 9, 0); gr.addColorStop(0, '#3a0610'); gr.addColorStop(.5, '#8a1424'); gr.addColorStop(1, '#2a040b'); g.fillStyle = gr; g.fillRect(xx, 0, w / 9 + 1, H); } }
  const val = g.createLinearGradient(0, 0, 0, fy); val.addColorStop(0, '#5a0a16'); val.addColorStop(1, '#2a040b'); g.fillStyle = val; g.fillRect(0, 0, W, Math.max(0, fy - 4 * S));
  if (fy + fh < H) { const vb = g.createLinearGradient(0, fy + fh, 0, H); vb.addColorStop(0, '#2a040b'); vb.addColorStop(1, '#5a0a16'); g.fillStyle = vb; g.fillRect(0, fy + fh + 4 * S, W, H - fy - fh); }
}
