// Act 2 (second half) — the rush continues. Worlds 24–34, one second each, all carrying the PhE mark.
import * as K from './kit.js';
const { clamp, lerp, seg, ss, eio, eo, ei, back, mulberry, hash, TAU, rgb, hex, mix, fbm, vn2 } = K;

const papr = (W, H, c, seed) => K.paper('p' + seed, 960, 540, c, { mottle: 12, grain: 12, fibres: 900, seed });
// reusable offscreen buffers (one per world key), cleared on every use
const BUF = {};
function buf(key, w, h) {
  let c = BUF[key]; if (!c || c.width !== w || c.height !== h) c = BUF[key] = K.canvas(w, h);
  const q = c.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = 1; q.globalCompositeOperation = 'source-over'; q.filter = 'none'; q.shadowColor = 'transparent'; q.clearRect(0, 0, w, h); return q;
}
// the silhouette polylines of each part (logo units), parsed once from the M/L/Z fill strings
let FP = null;
const fillPts = () => FP || (FP = K.LOGO.parts.map(p => p.fill.split('M').filter(s => s.trim()).map(s => s.replace(/Z/g, '').split('L').map(q => q.trim().split(/\s+/).map(Number)).filter(v => v.length === 2 && isFinite(v[0])))));
// a smooth hand wobble: offset each point by spatial value noise (continuous, so lines stay lines)
function handPath(g, pts, amp, seed, close = false, every = 1) {
  g.beginPath(); let first = true;
  for (let i = 0; i < pts.length; i += every) { const [x, y] = pts[i], ox = (vn2(x * .018 + seed, y * .018) - .5) * amp, oy = (vn2(x * .018 + 40 + seed, y * .018 + 7) - .5) * amp; first ? g.moveTo(x + ox, y + oy) : g.lineTo(x + ox, y + oy); first = false; }
  if (close) g.closePath();
}
const STROKES = [0, 1, 2, 3, 4];
// a cheap blur: downsample the source by f (two steps), the caller draws it back up with smoothing
function lowres(key, src, W, H, f) { const a = buf(key + 'a', Math.ceil(W / 2), Math.ceil(H / 2)); a.drawImage(src, 0, 0, a.canvas.width, a.canvas.height);
  const b = buf(key + 'b', Math.ceil(W / f), Math.ceil(H / f)); b.imageSmoothingQuality = 'high'; b.drawImage(a.canvas, 0, 0, b.canvas.width, b.canvas.height); return b.canvas; }
const dotS = (M, k) => { const p = K.LOGO.parts[k]; return [...K.toScreen(M, p.cx, p.cy), p.r * K.logoScale(M)]; };
// a damped hop: 0 before t0, then bounces that die out (returns 0..1 height)
const hop = (t, t0, dur = .45, n = 2) => { const u = t - t0; if (u < 0 || u > dur) return 0; const x = u / dur; return Math.abs(Math.sin(x * Math.PI * n)) * Math.pow(1 - x, 1.6); };

// 24 CEL ANIME 80s — launch night: airbrushed city sky, a rooftop neon sign, flat cels, tape on a CRT
export function celAnime(g, t, { W, H, M, S, V }) {
  const hw = K.halfW(M), hh = K.halfH(M);
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#09061E'); sky.addColorStop(.42, '#24124F'); sky.addColorStop(.72, '#7A2A78'); sky.addColorStop(1, '#F07C7A'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // airbrushed stars
  for (let i = 0; i < 160; i++) { const x = hash(i * 7.13) * W, y = hash(i * 3.71 + 2) * H * .6, a = (.25 + .75 * hash(i * 1.9)) * (.55 + .45 * Math.sin(t * 7 + i)), r = (.7 + hash(i * 5.3) * 1.6) * S;
    g.fillStyle = `rgba(255,236,250,${a})`; K.circle(g, x, y, r); g.fill(); if (hash(i * 2.2) > .93) { g.fillStyle = `rgba(255,236,250,${a * .5})`; g.fillRect(x - r * 5, y - .5 * S, r * 10, S); g.fillRect(x - .5 * S, y - r * 5, S, r * 10); } }
  // the moon, airbrushed, with a soft cloud streak across it
  const mx = V ? W * .8 : W * .84, my = V ? H * .17 : H * .2, mr = 92 * S;
  let gr = g.createRadialGradient(mx, my, mr * .8, mx, my, mr * 3.4); gr.addColorStop(0, 'rgba(255,190,230,.35)'); gr.addColorStop(1, 'rgba(255,190,230,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  gr = g.createRadialGradient(mx - mr * .3, my - mr * .3, 0, mx, my, mr); gr.addColorStop(0, '#FFF6FB'); gr.addColorStop(.7, '#FFD3EA'); gr.addColorStop(1, '#F4A9D2'); g.fillStyle = gr; K.circle(g, mx, my, mr); g.fill();
  for (const [dx, dy, w, a] of [[-60, 30, 260, .45], [70, 60, 200, .35], [-140, -50, 180, .25]]) { g.save(); g.translate(mx + dx * S + t * 30 * S, my + dy * S); g.scale(1, .16); gr = g.createRadialGradient(0, 0, 0, 0, 0, w * S); gr.addColorStop(0, `rgba(120,60,140,${a})`); gr.addColorStop(1, 'rgba(120,60,140,0)'); g.fillStyle = gr; K.circle(g, 0, 0, w * S); g.fill(); g.restore(); }
  // searchlights sweeping (launch night)
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 2; i++) { const bx = W * (i ? .78 : .2), a = -Math.PI / 2 + (i ? -1 : 1) * (.35 + .18 * Math.sin(t * 2.4 + i * 2)), L = H * 1.2;
    const lg = g.createLinearGradient(bx, H, bx + Math.cos(a) * L, H + Math.sin(a) * L); lg.addColorStop(0, 'rgba(255,200,240,.22)'); lg.addColorStop(1, 'rgba(255,200,240,0)'); g.fillStyle = lg;
    K.poly(g, [[bx, H], [bx + Math.cos(a - .05) * L, H + Math.sin(a - .05) * L], [bx + Math.cos(a + .05) * L, H + Math.sin(a + .05) * L]]); g.fill(); }
  g.restore();
  // back skyline cel, rim-lit
  const roof = M.y + hh + 150 * S;
  for (let i = 0, x = -20 * S; x < W; i++) { const r = mulberry(i + 50), w = (70 + r() * 110) * S, h = H * (.24 + r() * .3) * (V ? .8 : 1);
    g.fillStyle = '#2A1446'; g.fillRect(x, H - h, w - 4 * S, h); g.fillStyle = 'rgba(255,110,200,.45)'; g.fillRect(x, H - h, 3 * S, h);
    g.fillStyle = 'rgba(255,190,120,.55)'; for (let wy = 0; wy < 22; wy++) for (let wx = 0; wx < 3; wx++) if (r() < .3) g.fillRect(x + 12 * S + wx * w / 3.3, H - h + 18 * S + wy * 30 * S, 8 * S, 12 * S);
    x += w; }
  // the sign building + lattice
  g.fillStyle = '#1A0C30'; g.fillRect(M.x - hw * .8, roof, hw * 1.6, H - roof); g.fillStyle = '#FF6FC8'; g.globalAlpha = .4; g.fillRect(M.x - hw * .8, roof, hw * 1.6, 3 * S); g.globalAlpha = 1;
  g.fillStyle = 'rgba(120,220,255,.75)'; for (let wy = 0; wy < 30; wy++) for (let wx = 0; wx < 9; wx++) if (hash(wx * 13 + wy * 7) < .35) g.fillRect(M.x - hw * .72 + wx * hw * .17, roof + 26 * S + wy * 34 * S, 10 * S, 14 * S);
  const bt = M.y + hh + 30 * S; g.strokeStyle = '#0D0618'; g.lineWidth = 7 * S;
  for (const sx of [-.62, -.2, .2, .62]) { g.beginPath(); g.moveTo(M.x + sx * hw, bt); g.lineTo(M.x + sx * hw, roof); g.stroke(); }
  g.lineWidth = 3.5 * S; for (const [a, b] of [[-.62, -.2], [-.2, .2], [.2, .62]]) { g.beginPath(); g.moveTo(M.x + a * hw, bt); g.lineTo(M.x + b * hw, roof); g.moveTo(M.x + b * hw, bt); g.lineTo(M.x + a * hw, roof); g.stroke(); }
  // backer board (a pill — the brand's shape) with neon spill
  const bx0 = M.x - hw - 46 * S, by0 = M.y - hh - 34 * S, bw = 2 * hw + 92 * S, bh = 2 * hh + 68 * S;
  K.rr(g, bx0, by0, bw, bh, bh / 2); g.fillStyle = '#120926'; g.fill(); g.strokeStyle = '#3E2470'; g.lineWidth = 4 * S; g.stroke();
  for (let i = 0; i < 9; i++) { g.fillStyle = '#2A1850'; K.circle(g, bx0 + bh / 2 + i * (bw - bh) / 8, by0 + 12 * S, 3 * S); g.fill(); }
  g.save(); g.globalCompositeOperation = 'lighter'; gr = g.createRadialGradient(M.x, M.y, 0, M.x, M.y, hw * 1.3); gr.addColorStop(0, 'rgba(255,60,200,.28)'); gr.addColorStop(1, 'rgba(255,60,200,0)'); g.fillStyle = gr; g.fillRect(M.x - hw * 1.3, M.y - hw * 1.3, hw * 2.6, hw * 2.6);
  // neon tubes: chroma ghosts, two glow passes (cached), hot core
  const glow = K.tex(`neon:${M.x | 0}:${M.y | 0}:${M.R | 0}`, W, H, (q) => { q.globalCompositeOperation = 'lighter';
    q.save(); q.translate(-5 * S, 0); K.lineMark(q, M, 'rgba(255,20,60,.28)', 12 * S, null, STROKES); q.translate(10 * S, 0); K.lineMark(q, M, 'rgba(30,120,255,.28)', 12 * S, null, STROKES); q.restore();
    for (const [b, a, lw] of [[64, .4, 24], [26, .8, 14]]) { q.shadowColor = '#FF2FC8'; q.shadowBlur = b * S; K.lineMark(q, M, `rgba(255,70,205,${a})`, lw * S, null, STROKES); } });
  g.globalAlpha = .9 + .1 * Math.sin(t * 90); g.drawImage(glow, 0, 0); g.globalAlpha = 1; g.restore();
  K.lineMark(g, M, '#FFE6F7', 5.5 * S, null, STROKES);
  // the three dots: cyan neon, flickering on one by one, then pulsing on the beat
  const pulse = 1 + .8 * Math.exp(-(((t % .5) + .5) % .5) * 7);
  K.ACC.forEach((k, i) => { const [x, y, r] = dotS(M, k), on = t < .06 + i * .12 ? (hash(Math.floor(t * 28) + i * 9.7) > .45 ? 1 : .12) : 1, a = on * Math.min(1.4, pulse) / 1.4;
    g.save(); g.globalCompositeOperation = 'lighter'; const R2 = r + 46 * S * pulse; gr = g.createRadialGradient(x, y, r * .5, x, y, R2); gr.addColorStop(0, `rgba(60,210,255,${.75 * a})`); gr.addColorStop(.35, `rgba(40,160,255,${.3 * a})`); gr.addColorStop(1, 'rgba(40,160,255,0)'); g.fillStyle = gr; g.fillRect(x - R2, y - R2, R2 * 2, R2 * 2);
    g.fillStyle = `rgba(150,240,255,${.8 * a})`; K.circle(g, x, y, r * .85); g.fill(); g.restore();
    g.fillStyle = `rgba(235,253,255,${.25 + .75 * on})`; K.circle(g, x, y, r * .45); g.fill(); });
  // front skyline cel (occludes the building's foot)
  for (let i = 0, x = -40 * S; x < W; i++) { const r = mulberry(i + 7), w = (90 + r() * 120) * S, h = H * (.07 + r() * .12) * (V ? 1.6 : 1);
    g.fillStyle = '#100720'; g.fillRect(x, H - h, w - 3 * S, h); g.fillStyle = 'rgba(120,220,255,.8)'; for (let wy = 0; wy < 12; wy++) for (let wx = 0; wx < 4; wx++) if (r() < .25) g.fillRect(x + 10 * S + wx * w / 4.4, H - h + 14 * S + wy * 26 * S, 7 * S, 10 * S);
    x += w; }
  // title + tape OSD
  g.font = `italic 800 ${64 * S}px InterTight`; g.fillStyle = '#FFE6FA'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.save(); g.shadowColor = '#FF4FD8'; g.shadowBlur = 20 * S; g.fillText('MIDNIGHT LAUNCH', 70 * S, 130 * S); g.restore();
  g.font = `${46 * S}px VT323`; g.fillStyle = '#E8FFF0'; g.textAlign = 'right'; g.fillText('▶ PLAY', W - 64 * S, 110 * S); g.fillText('SP  0:36:' + String(Math.floor(30 + t * 30) % 60).padStart(2, '0'), W - 64 * S, (V ? 168 : 158) * S);
  // tape on a CRT: a tracking band that tears sideways, scanlines, vignette
  const ty = (((t + .3) * .8) % 1) * H, bh2 = 26 * S; g.drawImage(g.canvas, 0, ty, W, bh2, 9 * S, ty, W, bh2); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, ty, W, bh2);
  g.fillStyle = 'rgba(0,0,0,.24)'; for (let y = 0; y < H; y += 3 * S) g.fillRect(0, y, W, 1.2 * S);
  K.vignette(g, W, H, .7, .3);
}

// 25 PIXEL RPG — gaming expo: a 320-px-wide world, indexed palette, the mark as a save point, a typing text box
export function pixelRpg(g, t, { W, H, M, S }) {
  const pw = 320, ph = Math.round(320 * H / W), sx = W / pw, sy = H / ph, q = buf('rpg', pw, ph);
  const C = { ink: '#1a1c2c', grass: '#38b764', grass2: '#a7f070', dark: '#257179', path: '#d0ad74', path2: '#a0804f', st1: '#94b0c2', st2: '#566c86', st3: '#333c57', white: '#f4f4f4', vio: '#4a2aa8', vio2: '#2A0D6E', lav: '#a884f3', blue: '#2563EB', blue2: '#41a6f6', cyan: '#73eff7', skin: '#f2c09a', red: '#b13e53', gold: '#ffcd75', trunk: '#6b4a2a' };
  const px = (x, y, c, w = 1, h = 1) => { q.fillStyle = c; q.fillRect(Math.round(x), Math.round(y), w, h); };
  q.fillStyle = C.grass; q.fillRect(0, 0, pw, ph);
  for (let y = 0; y < ph; y += 8) for (let x = 0; x < pw; x += 8) { const h = hash(x * 3.1 + y * 7.7); if (h < .22) { px(x + 2, y + 4, C.grass2); px(x + 4, y + 3, C.grass2); px(x + 6, y + 4, C.grass2); } else if (h > .9) { px(x + 3, y + 3, C.dark, 2, 1); } }
  const mx = M.x / sx, my = M.y / sy, hwp = K.halfW(M) / sx, hhp = K.halfH(M) / sy;
  const pathY = Math.round(my + hhp + 16), by = Math.min(ph - 40, Math.max(pathY + 18, Math.round(ph * .78))), bx = 8, bw = pw - 16;
  // path
  px(0, pathY, C.path, pw, 12); px(0, pathY, C.path2, pw, 1); px(0, pathY + 11, C.path2, pw, 1); for (let x = 0; x < pw; x += 7) px(x + (hash(x) * 5 | 0), pathY + 3 + (hash(x * 3) * 6 | 0), C.path2);
  // trees and flowers scattered, kept off the save point, path and text box
  const clear = (x, y, m) => (Math.abs(x - mx) < hwp + 16 + m && Math.abs(y - my) < hhp + 18 + m) || (y > pathY - 14 && y < pathY + 16) || y > by - 8 || (x < 120 && y < 30);
  for (let i = 0; i < 60; i++) { const x = Math.round(hash(i * 5.3) * pw), y = Math.round(14 + hash(i * 7.9) * (ph - 20)); if (clear(x, y, 8)) continue;
    if (i % 3) { px(x - 6, y - 10, C.ink, 13, 15); px(x - 5, y - 11, C.dark, 11, 14); px(x - 4, y - 10, '#3e8948', 8, 7); px(x - 3, y - 9, C.grass2, 3, 2); px(x - 1, y + 3, C.trunk, 3, 4); }
    else { px(x, y, [C.red, C.gold, C.white][i % 3]); px(x - 1, y + 1, C.grass2); px(x + 1, y + 1, C.grass2); } }
  // the save point: stone dais, light beams, rising sparkles
  const dx0 = Math.round(mx - hwp - 8), dx1 = Math.round(mx + hwp + 8), dy = Math.round(my + hhp + 2);
  px(dx0 + 2, dy - 1, C.st3, dx1 - dx0 - 4, 7); px(dx0, dy, C.st3, dx1 - dx0, 6); px(dx0 + 1, dy, C.st1, dx1 - dx0 - 2, 2); px(dx0 + 1, dy + 2, C.st2, dx1 - dx0 - 2, 3);
  for (let x = dx0 + 6; x < dx1 - 4; x += 12) px(x, dy + 2, C.st3, 1, 3);
  q.save(); q.globalAlpha = .18 + .06 * Math.sin(t * 12); q.fillStyle = C.lav; for (let i = 0; i < 7; i++) { const x = Math.round(lerp(dx0 + 10, dx1 - 10, i / 6)); q.fillRect(x - 2, Math.round(my - hhp - 20), 5, Math.round(hhp * 2 + 22)); } q.restore();
  for (let i = 0; i < 16; i++) { const u = ((t * .9 + hash(i * 3.3)) % 1), x = Math.round(lerp(dx0 + 4, dx1 - 4, hash(i * 9.1))), y = Math.round(dy - u * (hhp * 2 + 26)); px(x, y, (Math.floor(t * 10) + i) % 2 ? C.white : C.cyan); }
  // the mark rasterised at world resolution
  const x0 = Math.floor(mx - hwp - 3), x1 = Math.ceil(mx + hwp + 3), y0 = Math.floor(my - hhp - 3), y1 = Math.ceil(my + hhp + 3), gw = x1 - x0, gh = y1 - y0, map = new Int8Array(gw * gh).fill(-1);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const [lx, ly] = K.toLogo(M, (x0 + i + .5) * sx, (y0 + j + .5) * sy); map[j * gw + i] = K.markHit(lx, ly); }
  const at = (i, j) => (i < 0 || j < 0 || i >= gw || j >= gh) ? -1 : map[j * gw + i];
  const bob = K.ACC.map((k, n) => -Math.round(1 + 1.5 * (1 + Math.sin(t * TAU * 2 + n * 2.1)) / 2 + 4 * hop(t, .3 + n * .14, .4, 2)));
  const lift = (k) => k >= 5 ? bob[k - 5] : 0, shim = Math.floor(t * 40) % 70;
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const k = at(i, j); if (k < 0) continue; px(x0 + i + 1, y0 + j + 2 + (k >= 5 ? 1 : 0), C.dark); }   // cast shadow on the grass
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const k = at(i, j); if (k < 0) continue; const L = lift(k);
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (at(i + a, j + b) !== k) px(x0 + i + a, y0 + j + b + L, C.ink); }
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const k = at(i, j); if (k < 0) continue; const L = lift(k), top = at(i, j - 1) !== k, band = ((i + j - shim) % 70 + 70) % 70 < 3;
    if (k >= 5) px(x0 + i, y0 + j + L, top || (at(i - 1, j) !== k && at(i, j - 2) !== k) ? C.cyan : C.blue2);
    else px(x0 + i, y0 + j, band ? C.white : top ? C.lav : C.vio); }
  // sparkle crosses over the dots on the beat
  K.ACC.forEach((k, n) => { if ((Math.floor(t * 8) + n) % 3) return; const [sx2, sy2] = K.toScreen(M, K.LOGO.parts[k].cx, K.LOGO.parts[k].cy), cx = Math.round(sx2 / sx), cy = Math.round(sy2 / sy) + bob[n] - 5; px(cx, cy - 1, C.white, 1, 3); px(cx - 1, cy, C.white, 3, 1); });
  // hero walking up to the save point (2-frame walk)
  const hx = Math.round(lerp(14, dx0 - 14, eo(clamp(t * 1.3)))), hy = pathY + 1, f = Math.floor(t * 8) % 2;
  px(hx + 1, hy + 6, C.path2, 7, 1); px(hx, hy - 12, C.ink, 8, 8); px(hx + 1, hy - 11, C.skin, 6, 5); px(hx, hy - 13, C.red, 8, 3); px(hx + 5, hy - 10, C.ink); px(hx, hy - 4, C.blue, 8, 7); px(hx + 1, hy - 3, C.blue2, 3, 2); px(hx + (f ? 0 : 1), hy + 3, C.ink, 3, 3); px(hx + (f ? 5 : 4), hy + 3, C.ink, 3, 3);
  // text box
  px(bx, by, C.ink, bw, 32); px(bx + 1, by + 1, C.white, bw - 2, 1); px(bx + 1, by + 30, C.white, bw - 2, 1); px(bx + 1, by + 1, C.white, 1, 30); px(bx + bw - 2, by + 1, C.white, 1, 30); px(bx + 2, by + 2, C.st3, bw - 4, 28); px(bx + 3, by + 3, C.ink, bw - 6, 26);
  // HUD hearts
  for (let i = 0; i < 3; i++) { const x = 8 + i * 10, y = 8; px(x, y, C.red, 3, 2); px(x + 4, y, C.red, 3, 2); px(x - 1, y + 1, C.red, 9, 3); px(x, y + 4, C.red, 7, 1); px(x + 1, y + 5, C.red, 5, 1); px(x + 2, y + 6, C.red, 3, 1); px(x + 3, y + 7, C.red); px(x, y + 1, C.white); }
  g.imageSmoothingEnabled = false; g.drawImage(q.canvas, 0, 0, W, H); g.imageSmoothingEnabled = true;
  g.textAlign = 'left'; g.textBaseline = 'top'; g.font = `${6 * sx}px PressStart`; g.fillStyle = C.white; g.fillText('LV25  EXPO', 42 * sx, 9 * sy);
  const msg = 'PURPLEHAT joined your party!', n = Math.floor(clamp((t + .1) * 1.7) * msg.length);
  g.font = `${8 * sx}px PressStart`; g.fillStyle = C.white; g.fillText(msg.slice(0, n), (bx + 9) * sx, (by + 12) * sy);
  if (n === msg.length && Math.floor(t * 4) % 2) { g.fillStyle = C.gold; g.fillText('▼', (bx + bw - 16) * sx, (by + 20) * sy); }
}

// 26 HD-2D — a fantasy ball: a pixel crest banner hung in a lit, fogged diorama, sprites on twos, tilt-shift focus
export function hd2d(g, t, { W, H, M, S, V }) {
  const q = buf('hd2d', W, H), hw = K.halfW(M), hh = K.halfH(M), hz = M.y + hh + 170 * S;
  const bg = q.createLinearGradient(0, 0, 0, hz); bg.addColorStop(0, '#120E1E'); bg.addColorStop(1, '#2E2232'); q.fillStyle = bg; q.fillRect(0, 0, W, hz);
  // back wall: stone blocks, pixel-chunky
  const bk = 28 * S; for (let j = 0; j * bk < hz; j++) for (let i = -1; i * bk * 2 < W + bk; i++) { const x = i * bk * 2 + (j % 2) * bk, y = j * bk, v = hash(i * 17 + j * 31);
    q.fillStyle = `rgba(${60 + v * 22},${46 + v * 16},${66 + v * 20},${.55})`; q.fillRect(x + 2 * S, y + 2 * S, bk * 2 - 4 * S, bk - 4 * S); }
  // floor in perspective
  for (let j = 0; ; j++) { const y0 = hz + j * j * 4 * S + j * 10 * S; if (y0 > H) break; const f = 1 + j * .18, w = 80 * S * f, hgt = (2 * j + 1) * 4 * S + 10 * S;
    for (let i = -14; i < 14; i++) { q.fillStyle = (i + j) % 2 ? '#4a3a44' : '#58464e'; q.fillRect(W / 2 + i * w, y0, w - 2 * S, hgt); } }
  // pillars with torches
  const offs = V ? [W / 2 - 46 * S] : [hw + 160 * S, hw + 400 * S];
  for (const sx of [-1, 1]) offs.forEach((o, k) => { const x = M.x + sx * o, h = hz * (.92 - k * .12); q.fillStyle = k ? '#2a2030' : '#3a2e3e'; q.fillRect(x - 32 * S, hz - h, 64 * S, h + 30 * S); q.fillStyle = 'rgba(255,255,255,.06)'; q.fillRect(x - 32 * S, hz - h, 10 * S, h + 30 * S);
    const ty = hz - h * .55, fl = .8 + .2 * Math.sin(t * 22 + k * 3 + sx); const gl = q.createRadialGradient(x, ty, 0, x, ty, 260 * S); gl.addColorStop(0, `rgba(255,160,70,${.5 * fl})`); gl.addColorStop(1, 'rgba(255,160,70,0)'); q.fillStyle = gl; q.fillRect(0, 0, W, H);
    q.fillStyle = '#6a4a2a'; q.fillRect(x - 5 * S, ty, 10 * S, 26 * S); q.fillStyle = '#ffcf6a'; q.fillRect(x - 7 * S, ty - 16 * S + Math.round(fl * 3) * S, 14 * S, 16 * S); q.fillStyle = '#fff3c0'; q.fillRect(x - 3 * S, ty - 10 * S, 6 * S, 8 * S); });
  // the banner: velvet cloth in chunky pixels, gold trim, swallowtail hem
  const px = 8 * S, bL = M.x - hw - 64 * S, bR = M.x + hw + 64 * S, bT = M.y - hh - 76 * S, bB = M.y + hh + 62 * S, tail = 46 * S, nT = 5;
  q.fillStyle = '#5a4030'; q.fillRect(bL - 30 * S, bT - 12 * S, bR - bL + 60 * S, 12 * S); q.fillStyle = '#ffcf6a'; for (const x of [bL - 36 * S, bR + 24 * S]) q.fillRect(x, bT - 16 * S, 12 * S, 20 * S);
  for (let y = bT; y < bB + tail; y += px) for (let x = bL; x < bR; x += px) {
    const u = (x - bL) / (bR - bL), w = (u * nT) % 1, hem = bB + tail * (1 - Math.abs(w - .5) * 2); if (y > hem) continue;
    const edge = x < bL + px * 2 || x >= bR - px * 2 || y > hem - px * 2, fold = Math.sin(u * TAU * 3.5) * .5 + .5, v = Math.round(fold * 3) / 3;
    q.fillStyle = edge ? (y > hem - px || x < bL + px || x >= bR - px ? '#b8862a' : '#f0c45a') : rgb(mix([46, 14, 92], [92, 44, 160], v * .8 + .1)); q.fillRect(x, y, px + .5, px + .5); }
  // the crest: the mark in gold-cream pixels with a drop shadow; dots = blue gems
  const cells = K.markCells(M, px);
  for (const c of cells) if (c.k < 5) { q.fillStyle = '#1A0838'; q.fillRect(c.x - px / 2 + px * .6, c.y - px / 2 + px * .6, px, px); }
  for (const c of cells) if (c.k < 5) { const top = K.markHitScreen(M, c.x, c.y - px) !== c.k; q.fillStyle = top ? '#FFF4D8' : ((c.i + c.j) % 7 === 0 ? '#F8E2A8' : '#EDCB86'); q.fillRect(c.x - px / 2, c.y - px / 2, px, px); }
  K.ACC.forEach((k, n) => { const [x, y, r] = dotS(M, k), lift = -hop(t, .25 + n * .15, .4, 1) * 18 * S, gs = 1 + .25 * Math.sin(t * 9 + n * 2);
    const gl = q.createRadialGradient(x, y + lift, 0, x, y + lift, r * 3.5 * gs); gl.addColorStop(0, 'rgba(90,160,255,.55)'); gl.addColorStop(1, 'rgba(90,160,255,0)'); q.fillStyle = gl; q.fillRect(x - r * 4, y - r * 4 + lift, r * 8, r * 8);
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { if (Math.abs(i) + Math.abs(j) > 3) continue; q.fillStyle = i + j <= -2 ? '#BFE0FF' : i + j >= 2 ? '#1D3FA8' : '#2F6BFF'; q.fillRect(x + i * px * .8 - px * .4, y + j * px * .8 - px * .4 + lift, px * .8 + .5, px * .8 + .5); } });
  // cool spotlight on the banner
  const sp = q.createRadialGradient(M.x, M.y - hh, 0, M.x, M.y, hw * 1.4); sp.addColorStop(0, 'rgba(210,190,255,.22)'); sp.addColorStop(1, 'rgba(210,190,255,0)'); q.fillStyle = sp; q.fillRect(0, 0, W, H);
  // sprites: dancing couples on twos, with drop shadows
  const tt = K.twos(t, 8), fy = hz + (H - hz) * .42;
  for (let i = 0; i < 6; i++) { const x = W * (.12 + i * .152) + Math.sin(tt * 3 + i) * 20 * S, y = fy + (i % 2) * 30 * S + Math.abs(Math.sin(tt * 6 + i)) * -6 * S, sp2 = 6 * S;
    q.fillStyle = 'rgba(0,0,0,.35)'; q.beginPath(); q.ellipse(x, fy + (i % 2) * 30 * S + 2 * sp2, 5 * sp2, 1.6 * sp2, 0, 0, TAU); q.fill();
    const col = ['#c84a6a', '#4a6ac8', '#e0c050'][i % 3]; q.fillStyle = col; q.fillRect(x - 4 * sp2, y - 4 * sp2, 8 * sp2, 5 * sp2); q.fillRect(x - 3 * sp2, y - 8 * sp2, 6 * sp2, 5 * sp2); q.fillStyle = '#f2c8a0'; q.fillRect(x - 2 * sp2, y - 12 * sp2, 4 * sp2, 4 * sp2); q.fillStyle = '#2a1a1a'; q.fillRect(x - 2 * sp2, y - 13 * sp2, 4 * sp2, 2 * sp2); }
  // fog
  const fog = q.createLinearGradient(0, hz - 80 * S, 0, hz + 120 * S); fog.addColorStop(0, 'rgba(180,160,220,0)'); fog.addColorStop(.5, 'rgba(180,160,220,.16)'); fog.addColorStop(1, 'rgba(180,160,220,0)'); q.fillStyle = fog; q.fillRect(0, 0, W, H);
  const C = q.canvas; g.drawImage(C, 0, 0);
  // tilt-shift: blur bands top and bottom, bloom, vignette
  const sm = lowres('hd2dS', C, W, H, 5), bl = lowres('hd2dB', C, W, H, 14);
  g.save(); g.beginPath(); g.rect(0, 0, W, M.y - hh - 150 * S); g.rect(0, H - (H - fy) * .55, W, H); g.clip(); g.drawImage(sm, 0, 0, W, H); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .22; g.drawImage(bl, 0, 0, W, H); g.restore();
  K.vignette(g, W, H, .7, .3);
}

// 27 LOW-POLY ISLAND — an offsite: pastel sky, a faceted island, the mark as a low-poly sign on posts, pieces landing with a bounce
export function lowpoly(g, t, { W, H, M, S, V }) {
  const hw = K.halfW(M), hh = K.halfH(M), r = mulberry(27);
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#FBD3C4'); sky.addColorStop(.6, '#F6E2D4'); sky.addColorStop(1, '#BFE3F0'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const tri = (a, b, c, col) => { g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 1; K.poly(g, [a, b, c]); g.fill(); g.stroke(); };
  const fan = (x, y, rad, n, cols, rot = 0, sy = 1) => { for (let i = 0; i < n; i++) { const a0 = rot + i / n * TAU, a1 = rot + (i + 1) / n * TAU; tri([x, y], [x + Math.cos(a0) * rad, y + Math.sin(a0) * rad * sy], [x + Math.cos(a1) * rad, y + Math.sin(a1) * rad * sy], cols[i % cols.length]); } };
  // faceted sun + clouds
  const sx = V ? W * .2 : W * .14, sy = V ? H * .14 : H * .2; fan(sx, sy, 86 * S, 9, ['#FFD27A', '#FFC25E', '#FFDB92'], t * .4);
  for (const [cx, cy, s] of [[W * .78, H * .16, 1], [W * .5, H * .1, .7], [W * .3, H * .3, .55]]) { const c = s * S; tri([cx - 120 * c, cy + 20 * c], [cx - 40 * c, cy - 40 * c], [cx + 10 * c, cy + 20 * c], '#FFFFFF'); tri([cx - 40 * c, cy - 40 * c], [cx + 60 * c, cy - 30 * c], [cx + 10 * c, cy + 20 * c], '#F2EEF6'); tri([cx + 60 * c, cy - 30 * c], [cx + 130 * c, cy + 20 * c], [cx + 10 * c, cy + 20 * c], '#FAF7FD'); }
  // sea in triangle strips
  const cy = M.y + hh + 200 * S, seaY = cy - 30 * S, st = 90 * S;
  for (let j = 0; seaY + j * st * .5 < H; j++) for (let i = -1; i * st < W + st; i++) { const x = i * st + (j % 2) * st / 2 + Math.sin(t * 3 + i + j) * 4 * S, y = seaY + j * st * .5, v = hash(i * 7 + j * 13);
    tri([x, y], [x + st, y], [x + st / 2, y + st * .5], rgb(mix([127, 196, 216], [168, 220, 234], v))); tri([x + st / 2, y + st * .5], [x + st, y], [x + st * 1.5, y + st * .5], rgb(mix([110, 180, 206], [150, 210, 228], hash(v * 9)))); }
  // island: faceted triangles
  const cx = M.x, iw = hw * 1.75;
  tri([cx - iw, cy], [cx - iw * .3, cy - 60 * S], [cx, cy], '#9CCB7C'); tri([cx - iw * .3, cy - 60 * S], [cx + iw * .4, cy - 70 * S], [cx, cy], '#8BBE6C'); tri([cx + iw * .4, cy - 70 * S], [cx + iw, cy], [cx, cy], '#A9D488');
  tri([cx - iw, cy], [cx, cy], [cx - iw * .2, cy + 60 * S], '#C9A77A'); tri([cx, cy], [cx + iw, cy], [cx - iw * .2, cy + 60 * S], '#B8936A'); tri([cx - iw * .2, cy + 60 * S], [cx + iw, cy], [cx + iw * .4, cy + 40 * S], '#A88360');
  // posts holding the sign
  const pt = cy - 62 * S;
  for (const [lx, ly] of [[186.5, 140], [380, 146]]) { const [x, pb] = K.toScreen(M, lx, ly), w = 16 * S; g.fillStyle = '#A07A55'; g.fillRect(x - w / 2, pb, w / 2, pt - pb); g.fillStyle = '#7E5C3E'; g.fillRect(x, pb, w / 2, pt - pb); }
  // the sign: extruded thickness, then faceted faces lit from the upper left
  g.save(); for (let d = 9; d >= 1; d--) { g.translate(0, 0); K.fillMark(g, { ...M, x: M.x + d * .6 * S, y: M.y + d * .9 * S }, '#2E1C6A', '#16348C', { only: STROKES }); } g.restore();
  const k = K.logoScale(M), fs = 22 * S, grid = [], gx0 = M.x - hw - fs, gy0 = M.y - hh - fs, ni = Math.ceil((2 * hw + 2 * fs) / fs) + 1, nj = Math.ceil((2 * hh + 2 * fs) / fs) + 1;
  for (let j = 0; j <= nj; j++) for (let i = 0; i <= ni; i++) grid.push([gx0 + i * fs + (hash(i * 13 + j * 7) - .5) * fs * .6, gy0 + j * fs + (hash(i * 5 + j * 17) - .5) * fs * .6]);
  const G = (i, j) => grid[j * (ni + 1) + i], shade = (x, y, h) => clamp(.55 - (x - M.x) / hw * .18 - (y - M.y) / hh * .22 + (h - .5) * .35);
  // facets via a manual clip in screen space
  g.save(); { const P = K.markPaths(), cl = new Path2D(), m = new DOMMatrix().translate(M.x, M.y).scale(k, k).translate(-K.LW / 2, -K.LH / 2); STROKES.forEach(i => cl.addPath(P[i], m)); g.clip(cl); }
  for (let j = 0; j < nj; j++) for (let i = 0; i < ni; i++) { const a = G(i, j), b = G(i + 1, j), c = G(i + 1, j + 1), d = G(i, j + 1);
    for (const [p, q2, s2, h] of [[a, b, c, hash(i * 3 + j * 11)], [a, c, d, hash(i * 19 + j * 5 + 1)]]) { const v = shade((p[0] + q2[0] + s2[0]) / 3, (p[1] + q2[1] + s2[1]) / 3, h); tri(p, q2, s2, rgb(mix([74, 46, 160], [176, 154, 240], v))); } }
  g.restore();
  // the dots: faceted blue gems that drop in and land with a bounce
  K.ACC.forEach((kk, n) => { const [x, y, rr] = dotS(M, kk), land = -.05 + n * .1, kd = back(seg(t, land - .28, land), 2.4), up = (1 - kd) * 150 * S + hop(t, .45 + n * .12, .35, 1) * 26 * S;
    g.fillStyle = 'rgba(40,30,90,.25)'; g.beginPath(); g.ellipse(x + 3 * S, y + rr * 1.1, rr * clamp(1 - up / (200 * S), .4), rr * .3, 0, 0, TAU); g.fill();
    fan(x + 2 * S, y - up + 3 * S, rr * 1.08, 7, ['#16348C'], -.3); fan(x, y - up, rr * 1.08, 7, ['#5B8DF5', '#2563EB', '#3B76F0', '#1E4FD0', '#2F6AEE', '#7AA4FA', '#2563EB'], -.3 + n); });
  // houses landing with a bounce
  for (let i = 0; i < 5; i++) { const lt = t - i * .1, kh = lt < -.1 ? 0 : back(seg(lt, -.1, .18), 2.2); if (kh <= 0) continue;
    const x = cx - iw * .62 + i * iw * .31, y = cy - 58 * S - Math.sin(i) * 8 * S - (1 - kh) * 140 * S, s = 40 * S;
    g.fillStyle = ['#FFFFFF', '#F7E1C8', '#FFFFFF', '#F3D1D1', '#FFFFFF'][i]; g.fillRect(x - s / 2, y - s, s, s); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, y - s, s / 2, s);
    const rc = ['#E77E6B', '#6B8BE7', '#E7B76B', '#7EC08F', '#B07EE7'][i]; tri([x - s * .62, y - s], [x, y - s * 1.6], [x, y - s], rc); tri([x, y - s * 1.6], [x + s * .62, y - s], [x, y - s], rgb(mix(hex(rc), [40, 30, 60], .2))); }
  // palm, swaying
  const px2 = cx + iw * .86, ph2 = cy - 150 * S; g.strokeStyle = '#8A6A4A'; g.lineWidth = 8 * S; g.beginPath(); g.moveTo(cx + iw * .8, cy - 10 * S); g.quadraticCurveTo(cx + iw * .86, cy - 90 * S, px2, ph2); g.stroke();
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .6 + Math.sin(t * 3) * .05; tri([px2, ph2], [px2 + Math.cos(a - .15) * 80 * S, ph2 + Math.sin(a - .15) * 80 * S + 30 * S], [px2 + Math.cos(a + .15) * 80 * S, ph2 + Math.sin(a + .15) * 80 * S + 30 * S], i % 2 ? '#6DB36A' : '#5EA35C'); }
}

// 28 ISO INFOGRAPHIC — the expo floor as a floating isometric board: three-tone blocks, thin labels, Isotype people
export function isoInfo(g, t, { W, H, M, S }) {
  g.fillStyle = '#F3EFE6'; g.fillRect(0, 0, W, H);
  const hw = K.halfW(M), hh = K.halfH(M), u = 46 * S, base = M.y + hh + 110 * S, iso = (x, y, z) => [M.x + (x - y) * u * .866, base + (x + y) * u * .5 - z * u];
  const box = (x, y, w, d, h, c) => { const [top, l, r] = c; const p = (a, b, z) => iso(a, b, z);
    g.fillStyle = l; K.poly(g, [p(x, y + d, 0), p(x + w, y + d, 0), p(x + w, y + d, h), p(x, y + d, h)]); g.fill();
    g.fillStyle = r; K.poly(g, [p(x + w, y, 0), p(x + w, y + d, 0), p(x + w, y + d, h), p(x + w, y, h)]); g.fill();
    g.fillStyle = top; K.poly(g, [p(x, y, h), p(x + w, y, h), p(x + w, y + d, h), p(x, y + d, h)]); g.fill(); };
  // board with soil strata
  box(-6, -4, 12, 8, -.6, ['#E7E1D2', '#C9B79A', '#B5A07F']); box(-6, -4, 12, 8, .0001, ['#E7E1D2', '#C9B79A', '#B5A07F']);
  g.strokeStyle = 'rgba(43,47,58,.12)'; g.lineWidth = 1; for (let i = -6; i <= 6; i += 2) { g.beginPath(); g.moveTo(...iso(i, -4, 0)); g.lineTo(...iso(i, 4, 0)); g.stroke(); } for (let j = -4; j <= 4; j += 2) { g.beginPath(); g.moveTo(...iso(-6, j, 0)); g.lineTo(...iso(6, j, 0)); g.stroke(); }
  const cols = [['#7FB3C8', '#4E7F94', '#3B6577'], ['#F2B134', '#C68B1C', '#A87514'], ['#E8553D', '#B8402C', '#963322'], ['#9A7FA8', '#735A82', '#5A456A']];
  const booths = [[-5.5, -3.5, 2, 2], [-5.5, 1.2, 2, 2], [3.5, -3.5, 2, 2], [3.5, 1.2, 2, 2], [-1.5, 2.4, 3, 1.3]];
  booths.slice(1, 4).forEach(([x, y, w, d], i) => { const k = back(seg(t, -.2 + i * .08, .1 + i * .08), 1.6); if (k > 0) box(x, y, w, d, 1.2 * k, cols[i % 4]); });
  // the hall's centre sign: two legs on footings, an extruded board front-on, the dots as blue spheres
  for (const sx of [-.55, .55]) { const lx = M.x + sx * hw, a = (lx - M.x) / (2 * u * .866); box(a - .25, -a - .25, .5, .5, .25, ['#D9D3C4', '#B9AE98', '#A3977F']); const [fx, fy] = iso(a, -a, .25);
    g.fillStyle = '#4A4F5C'; g.fillRect(lx - 7 * S, M.y + hh * .3, 7 * S, fy - M.y - hh * .3); g.fillStyle = '#343844'; g.fillRect(lx, M.y + hh * .3, 7 * S, fy - M.y - hh * .3); }
  for (let d = 12; d >= 1; d--) K.fillMark(g, { ...M, x: M.x - d * .866 * S, y: M.y + d * .5 * S }, '#170742', '#1A3C9E');
  K.fillMark(g, M, '#2A0D6E', '#2563EB', { only: STROKES });
  K.ACC.forEach((kk, n) => { const [x, y, r] = dotS(M, kk), up = hop(t, .3 + n * .14, .42, 2) * 22 * S;
    g.fillStyle = 'rgba(23,7,66,.35)'; g.beginPath(); g.ellipse(x - 4 * S, y + r * .9, r * (1 - up / (60 * S)), r * .28, 0, 0, TAU); g.fill();
    g.fillStyle = '#1A3C9E'; K.circle(g, x - 3 * S, y + 2 * S - up, r); g.fill(); g.fillStyle = '#2563EB'; K.circle(g, x, y - up, r); g.fill();
    g.fillStyle = '#6E9BFF'; g.beginPath(); g.arc(x, y - up, r * .72, Math.PI * 1.05, Math.PI * 1.6); g.arc(x, y - up, r * .4, Math.PI * 1.6, Math.PI * 1.05, true); g.fill(); });
  // front booth after the sign so it sits in front of the legs
  { const [x, y, w, d] = booths[4], k = back(seg(t, .12, .42), 1.6); if (k > 0) box(x, y, w, d, 1.2 * k, cols[0]); }
  // Isotype rows: one figure = 100 guests
  const n = Math.floor(clamp((t + .3) * 1.3) * 12); g.fillStyle = '#2B2F3A';
  g.font = `700 ${30 * S}px InterTight`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('Expo floor · Hall A', 64 * S, H * .12);
  for (let i = 0; i < n; i++) { const x = 70 * S + (i % 6) * 34 * S, y = H * .2 + Math.floor(i / 6) * 60 * S; g.fillStyle = i % 6 === 5 ? '#2563EB' : '#2B2F3A'; K.circle(g, x, y, 7 * S); g.fill(); K.rr(g, x - 9 * S, y + 10 * S, 18 * S, 30 * S, 6 * S); g.fill(); }
  g.fillStyle = '#2B2F3A'; g.font = `600 ${15 * S}px Mono`; K.track(g, '■ = 100 GUESTS / HOUR', 64 * S, H * .2 + 140 * S, .1);
  // leaders
  g.strokeStyle = '#2B2F3A'; g.lineWidth = 1.2 * S; g.fillStyle = '#2B2F3A';
  const [ax, ay] = iso(4.5, 2.2, 1.2); g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + 110 * S, ay + 70 * S); g.lineTo(ax + 250 * S, ay + 70 * S); g.stroke(); K.circle(g, ax, ay, 3 * S); g.fill();
  K.track(g, 'BOOTH C · DEMO ZONE', ax + 116 * S, ay + 60 * S, .1);
  const [ex, ey] = K.anchor(M, 3); g.beginPath(); g.moveTo(ex, ey - 20 * S); g.lineTo(ex + 60 * S, ey - 90 * S); g.lineTo(ex + 210 * S, ey - 90 * S); g.stroke(); K.circle(g, ex, ey - 20 * S, 3 * S); g.fill();
  K.track(g, 'CENTRE SIGN · 6 M', ex + 66 * S, ey - 100 * S, .1);
}

// 29 BRICK TOY — the family zone: the mark built from toy plates on a baseplate, round 2×2 bricks for the dots, macro focus
export function brickToy(g, t, { W, H, M, S }) {
  const desk = g.createLinearGradient(0, 0, 0, H); desk.addColorStop(0, '#8C6A4A'); desk.addColorStop(1, '#5A4030'); g.fillStyle = desk; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) { g.strokeStyle = `rgba(40,25,15,${.1 + hash(i) * .15})`; g.lineWidth = 2 * S; g.beginPath(); g.moveTo(0, i * H / 30 + Math.sin(i) * 10); g.bezierCurveTo(W * .3, i * H / 30 + 20, W * .6, i * H / 30 - 15, W, i * H / 30 + 8); g.stroke(); }
  const st = 18 * S, hw = K.halfW(M), hh = K.halfH(M), stud = (x, y, col, hi, r = st * .3) => { g.fillStyle = 'rgba(0,0,0,.28)'; K.circle(g, x + r * .25, y + r * .3, r); g.fill(); const gr = g.createRadialGradient(x - r * .4, y - r * .4, 0, x, y, r); gr.addColorStop(0, hi); gr.addColorStop(.55, col); gr.addColorStop(1, col); g.fillStyle = gr; K.circle(g, x, y, r); g.fill(); };
  // loose bricks around the edges
  const lr = mulberry(29); for (let i = 0; i < 16; i++) { const x = lr() * W, y = lr() * H, w = (lr() < .5 ? 2 : 4) * 30 * S, h = 2 * 30 * S, a = lr() * TAU, col = ['#C91A09', '#F2CD37', '#0055BF', '#237841', '#FFFFFF'][i % 5];
    if (Math.abs(x - M.x) < hw + 160 * S && Math.abs(y - M.y) < hh + 160 * S) continue;
    g.save(); g.translate(x, y); g.rotate(a); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 12 * S; g.shadowOffsetY = 6 * S; g.fillStyle = col; g.fillRect(-w / 2, -h / 2, w, h); g.restore();
    g.save(); g.translate(x, y); g.rotate(a); for (let sx = -w / 2 + 15 * S; sx < w / 2; sx += 30 * S) for (let sy = -h / 2 + 15 * S; sy < h / 2; sy += 30 * S) stud(sx, sy, col, '#ffffff', 9 * S); g.restore(); }
  // baseplate aligned to the cell grid
  const ni = Math.ceil(hw / st) + 3, nj = Math.ceil(hh / st) + 3;
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24 * S; g.shadowOffsetY = 10 * S; g.fillStyle = '#9BA19D'; K.rr(g, M.x - (ni + .5) * st, M.y - (nj + .5) * st, (2 * ni + 1) * st, (2 * nj + 1) * st, 6 * S); g.fill(); g.restore();
  for (let j = -nj; j <= nj; j++) for (let i = -ni; i <= ni; i++) { const x = M.x + i * st, y = M.y + j * st; g.fillStyle = 'rgba(0,0,0,.18)'; K.circle(g, x + 1.5 * S, y + 2 * S, st * .3); g.fill(); g.fillStyle = '#AEB4B0'; K.circle(g, x, y, st * .3); g.fill(); }
  // the mark: plates merged into 1×1…1×4 runs, dropped in bottom rows first
  const cells = []; { const ci = Math.ceil(hw * 1.05 / st), cj = Math.ceil(hh * 1.2 / st);
    for (let j = -cj; j <= cj; j++) for (let i = -ci; i <= ci; i++) { const x = M.x + i * st, y = M.y + j * st; let k = K.markHitScreen(M, x, y);
      if (k < 0) for (const [a, b] of [[.34, 0], [-.34, 0], [0, .34], [0, -.34]]) { const kk = K.markHitScreen(M, x + a * st, y + b * st); if (kk >= 0 && kk < 5) { k = kk; break; } }
      if (k >= 0 && k < 5) cells.push({ x, y, k, i, j }); } }
  const set = new Map(cells.map(c => [c.i + ',' + c.j, c])), runs = [];
  cells.sort((a, b) => a.j - b.j || a.i - b.i);
  const used = new Set(); for (const c of cells) { const key = c.i + ',' + c.j; if (used.has(key)) continue; let L = 1, maxL = 1 + Math.floor(hash(c.i * 3.7 + c.j * 9.1) * 4);
    while (L < maxL) { const nx = set.get((c.i + L) + ',' + c.j); if (!nx || nx.k !== c.k || used.has((c.i + L) + ',' + c.j)) break; L++; }
    for (let l = 0; l < L; l++) used.add((c.i + l) + ',' + c.j); runs.push({ ...c, L }); }
  const jmax = Math.max(...cells.map(c => c.j)), jmin = Math.min(...cells.map(c => c.j));
  const tone = (c) => hash(c.i * 1.3 + c.j * 7.7) < .5 ? ['#4A2AA0', '#A48BF0'] : ['#53309F', '#AE97F4'];
  for (const c of runs) { const land = lerp(-.32, .12, (jmax - c.j) / Math.max(1, jmax - jmin)) + hash(c.i * 7 + c.j) * .08, k = back(seg(t, land - .18, land), 1.4); if (k <= 0) continue;
    const sc = 1 + (1 - k) * .7, x0 = c.x - st / 2, y0 = c.y - st / 2, cx = x0 + c.L * st / 2, cy = c.y, [col, hi] = tone(c);
    g.save(); g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy); g.globalAlpha = clamp(k * 2);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x0 + 3 * S * sc, y0 + 4 * S * sc, c.L * st, st);
    g.fillStyle = col; g.fillRect(x0, y0, c.L * st - .6 * S, st - .6 * S); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x0, y0, c.L * st - .6 * S, 2 * S); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x0, y0 + st - 2.6 * S, c.L * st - .6 * S, 2 * S);
    for (let l = 0; l < c.L; l++) stud(c.x + l * st, c.y, col, hi); g.restore(); }
  // the dots: round 2×2 bricks in bright blue, each one popping up and snapping back in turn
  K.ACC.forEach((kk, n) => { const [x, y, r] = dotS(M, kk), R = Math.max(r * 1.15, st * .95), p = hop(t, .28 + n * .15, .38, 1), sc = 1 + p * .35, sh = (4 + p * 14) * S;
    g.save(); g.translate(x, y); g.scale(sc, sc); g.fillStyle = 'rgba(0,0,0,.35)'; K.circle(g, sh * .6, sh, R); g.fill();
    let gr = g.createRadialGradient(-R * .4, -R * .4, 0, 0, 0, R); gr.addColorStop(0, '#5C8CFF'); gr.addColorStop(.7, '#2563EB'); gr.addColorStop(1, '#173FA8'); g.fillStyle = gr; K.circle(g, 0, 0, R); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1.5 * S; g.beginPath(); g.arc(0, 0, R * .92, Math.PI * 1.1, Math.PI * 1.7); g.stroke();
    stud(0, 0, '#2563EB', '#CFE0FF', R * .5); g.fillStyle = 'rgba(10,30,90,.5)'; g.fillRect(-R * .2, -1 * S, R * .4, 2 * S); g.fillRect(-1 * S, -R * .2, 2 * S, R * .4); g.restore(); });
  // shallow depth of field: soften the top and bottom of the frame
  const C = buf('brick', W, H); C.drawImage(g.canvas, 0, 0);
  const sm = lowres('brickS', C.canvas, W, H, 5); g.save(); g.beginPath(); g.rect(0, 0, W, Math.max(0, M.y - hh - 190 * S)); g.rect(0, M.y + hh + 230 * S, W, H); g.clip(); g.drawImage(sm, 0, 0, W, H); g.restore();
  K.vignette(g, W, H, .5);
}

// 30 PAPER POP-UP — a pop-up stage: V-fold arches spring up, the mark as a cut-paper sign, the dots on paper springs
export function paperPopup(g, t, { W, H, M, S, V }) {
  const hw = K.halfW(M), hh = K.halfH(M), base = M.y + hh + 95 * S;
  g.fillStyle = '#6B4F3A'; g.fillRect(0, 0, W, H);
  // back page standing up (printed night sky) and the floor page
  const pT = Math.max(H * .05, base - (V ? 900 : 640) * S);
  g.fillStyle = '#E8DDC8'; g.fillRect(W * .04, pT, W * .92, base - pT); g.fillStyle = '#2B3A72'; g.fillRect(W * .06, pT + 18 * S, W * .88, base - pT - 18 * S);
  for (let i = 0; i < 40; i++) { g.fillStyle = '#F4E9C8'; const x = W * .07 + hash(i * 3.3) * W * .86, y = pT + 30 * S + hash(i * 5.1) * (base - pT - 60 * S); K.circle(g, x, y, (2 + hash(i) * 3) * S); g.fill(); }
  g.fillStyle = '#F4EBDD'; K.poly(g, [[W * .04, base], [W / 2, base + 10 * S], [W / 2, H * 1.02], [W * .0, H * 1.02]]); g.fill(); g.fillStyle = '#EADFCB'; K.poly(g, [[W * .96, base], [W / 2, base + 10 * S], [W / 2, H * 1.02], [W, H * 1.02]]); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2 * S; g.beginPath(); g.moveTo(W / 2, base + 10 * S); g.lineTo(W / 2, H); g.stroke();
  g.fillStyle = 'rgba(60,40,30,.13)'; for (const side of [0, 1]) for (let l = 0; l < 14; l++) { const y = base + 70 * S + l * 30 * S, x0 = side ? W / 2 + 70 * S : W * .1 + l * 4 * S, x1 = side ? W * .9 - l * 4 * S : W / 2 - 70 * S; if (y > H - 50 * S) break; g.fillRect(x0, y, (x1 - x0) * (l % 5 === 4 ? .55 : 1), 6 * S); }
  g.fillStyle = 'rgba(60,40,30,.35)'; g.font = `italic ${26 * S}px IMFellItalic`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText('Act I', W * .3, base + 52 * S); g.fillText('— 30 —', W * .7, base + 52 * S);
  const lamp = g.createRadialGradient(W * .3, 0, 0, W * .3, 0, H * 1.2); lamp.addColorStop(0, 'rgba(255,230,180,.3)'); lamp.addColorStop(1, 'rgba(0,0,0,.3)'); g.fillStyle = lamp; g.fillRect(0, 0, W, H);
  const pop = (i) => eo(seg(t, -.35 + i * .1, -.05 + i * .1));
  // arches (back to front), each rotating up from the fold
  [['#9A6FB0', hw * 1.3], ['#C78BD0', hw * 1.16]].forEach(([c, r], i) => { const k = pop(i); if (k <= 0) return; g.save(); g.translate(M.x, base); g.scale(1, k); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 14 * S; g.shadowOffsetY = 6 * S;
    g.fillStyle = c; g.beginPath(); g.arc(0, 0, r, Math.PI, 0); g.lineTo(r - 50 * S, 0); g.arc(0, 0, r - 50 * S, 0, Math.PI, true); g.closePath(); g.fill(); g.restore(); });
  // the sign: cut paper with a white die-cut border, rising on its fold
  const k = back(seg(t, -.4, .1), 1.4), sk = lerp(.15, 1, k);
  g.save(); g.translate(0, base); g.scale(1, sk); g.translate(0, -base);
  for (const lx of [80, 390]) { const [x] = K.toScreen(M, lx, 0); g.fillStyle = '#D8CCB6'; K.poly(g, [[x - 26 * S, M.y + hh * .5], [x + 26 * S, M.y + hh * .5], [x + 40 * S, base], [x - 40 * S, base]]); g.fill(); g.fillStyle = '#C6B89E'; K.poly(g, [[x, M.y + hh * .5], [x + 26 * S, M.y + hh * .5], [x + 40 * S, base], [x, base]]); g.fill(); }
  g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 18 * S; g.shadowOffsetY = 12 * S; K.inMark(g, M, (q, kk) => { const P = K.markPaths(); q.strokeStyle = q.fillStyle = '#FFFDF7'; q.lineWidth = 22 * S / kk; q.lineJoin = 'round'; STROKES.forEach(i => { q.stroke(P[i]); q.fill(P[i]); }); }); g.restore();
  K.fillMark(g, M, '#3A1E86', '#2563EB', { only: STROKES });
  K.inMark(g, M, (q) => { const P = K.markPaths(); STROKES.forEach(i => { q.save(); q.clip(P[i]); const lg = q.createLinearGradient(0, 0, 0, K.LH); lg.addColorStop(0, 'rgba(255,255,255,.12)'); lg.addColorStop(1, 'rgba(0,0,0,.18)'); q.fillStyle = lg; q.fillRect(0, 0, K.LW, K.LH); q.restore(); }); });
  g.restore();
  // the dots: paper discs on accordion springs — they boing in turn
  K.ACC.forEach((kk, n) => { const [x, y0, r] = dotS(M, kk), y = base - (base - y0) * sk, u = t - (.25 + n * .14), up = u > 0 ? Math.exp(-u * 5) * Math.abs(Math.sin(u * 13)) * 60 * S : 0, yy = y - up;
    if (up > 2 * S) { g.strokeStyle = '#E8DCC4'; g.lineWidth = 6 * S; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y + r); for (let z = 1; z <= 6; z++) g.lineTo(x + (z % 2 ? -1 : 1) * r * .7, lerp(y + r, yy, z / 6)); g.stroke(); }
    g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 12 * S; g.shadowOffsetY = 8 * S + up * .15; g.fillStyle = '#FFFDF7'; K.circle(g, x, yy, r + 11 * S); g.fill(); g.restore();
    g.fillStyle = '#2563EB'; K.circle(g, x, yy, r); g.fill(); g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.arc(x, yy, r, Math.PI, Math.PI * 1.5); g.lineTo(x, yy); g.fill(); });
  // cut-paper actor with a white border, bobbing
  const ax = V ? W * .2 : M.x - hw - 150 * S, ay = (V ? base + 360 * S : base) + Math.sin(t * 10) * 4 * S;
  g.save(); g.translate(ax, ay); g.scale(S, S); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 12; g.shadowOffsetY = 8;
  g.fillStyle = '#fff'; K.rr(g, -46, -200, 92, 200, 40); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = '#E8553D'; K.rr(g, -36, -120, 72, 112, 26); g.fill(); g.fillStyle = '#F2C8A0'; K.circle(g, 0, -150, 30); g.fill(); g.fillStyle = '#2a1a1a'; K.circle(g, -10, -152, 4); g.fill(); K.circle(g, 10, -152, 4); g.fill(); g.restore();
  // speech bubble typing on
  const msg = 'Curtain up!', n = Math.floor(clamp((t - .15) * 2.5) * msg.length);
  if (n > 0) { const bw = 236 * S, bx = V ? ax - 20 * S : ax - bw + 40 * S, by = ay - 300 * S; g.fillStyle = '#fff'; K.rr(g, bx, by, bw, 64 * S, 30 * S); g.fill(); K.poly(g, [[ax - 10 * S, by + 60 * S], [ax + 12 * S, by + 60 * S], [ax, by + 84 * S]]); g.fill();
    g.fillStyle = '#2a1a1a'; g.font = `${30 * S}px Lilita`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(msg.slice(0, n), bx + 24 * S, by + 33 * S); }
}

// 31 LIVING SCREENCAST — the event app: a crisp hi-res interface, the mark as the app logo, a low-res mascot acting it out
export function screencast(g, t, { W, H, M, S, V }) {
  const hw = K.halfW(M), hh = K.halfH(M);
  g.fillStyle = '#E9ECF2'; g.fillRect(0, 0, W, H);
  const x = V ? W * .05 : W * .12, y = H * .08, w = V ? W * .9 : W * .76, h = H * .84;
  g.save(); g.shadowColor = 'rgba(20,30,60,.18)'; g.shadowBlur = 40 * S; g.shadowOffsetY = 16 * S; g.fillStyle = '#fff'; K.rr(g, x, y, w, h, 16 * S); g.fill(); g.restore();
  g.fillStyle = '#F4F5F8'; K.rr(g, x, y, w, 52 * S, 16 * S); g.fill(); g.fillRect(x, y + 30 * S, w, 22 * S);
  for (const [i, c] of [[0, '#FF5F57'], [1, '#FEBC2E'], [2, '#28C840']]) { g.fillStyle = c; K.circle(g, x + 26 * S + i * 22 * S, y + 26 * S, 7 * S); g.fill(); }
  g.fillStyle = '#E1E4EA'; K.rr(g, x + w * .28, y + 14 * S, w * .44, 24 * S, 12 * S); g.fill(); g.fillStyle = '#6A7180'; g.font = `500 ${14 * S}px Inter`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('app.purplehat.events', x + w / 2, y + 27 * S);
  // nav + hero copy
  g.textAlign = 'left'; g.fillStyle = '#1E1B2E'; g.font = `700 ${36 * S}px InterTight`; g.fillText('Summit 2026', x + 48 * S, y + 112 * S);
  g.fillStyle = '#6A7180'; g.font = `400 ${18 * S}px Inter`; g.fillText('Two days. One badge. Zero queues.', x + 48 * S, y + 148 * S);
  g.font = `500 ${16 * S}px Inter`; g.textAlign = 'right'; g.fillStyle = '#6A7180'; g.fillText(V ? 'Agenda   Venue' : 'Agenda     Speakers     Venue', x + w - 48 * S, y + 108 * S);
  // soft brand pattern behind the logo: a pill holding a circle
  g.fillStyle = '#F2F0FB'; K.rr(g, M.x - hw - 60 * S, M.y - hh - 44 * S, 2 * hw + 120 * S, 2 * hh + 88 * S, hh + 44 * S); g.fill();
  // the logo; the three dots double as the app's loading indicator while the click goes through
  K.fillMark(g, M, '#2A0D6E', '#2563EB', { only: STROKES });
  const loading = t > .45 && t < .82;
  K.ACC.forEach((k, n) => { const [dx, dy, r] = dotS(M, k), up = loading ? Math.max(0, Math.sin((t - .45) * TAU * 2.6 - n * 1.1)) * 16 * S : hop(t, .82 + n * .04, .25, 1) * 8 * S;
    g.fillStyle = loading && up > 2 * S ? '#5B8DF5' : '#2563EB'; K.circle(g, dx, dy - up, r); g.fill(); });
  const bx = M.x - 110 * S, by = M.y + hh + 86 * S, pressed = t > .45 && t < .6, done = t > .82;
  g.save(); if (!pressed) { g.shadowColor = 'rgba(37,99,235,.35)'; g.shadowBlur = 18 * S; g.shadowOffsetY = 6 * S; }
  g.fillStyle = done ? '#16A34A' : pressed ? '#1D4ED8' : '#2563EB'; K.rr(g, bx, by + (pressed ? 2 * S : 0), 220 * S, 56 * S, 28 * S); g.fill(); g.restore();
  g.fillStyle = '#fff'; g.font = `600 ${20 * S}px Inter`; g.textAlign = 'center'; g.fillText(done ? '✓  Registered' : loading && !pressed ? 'Registering…' : 'Register', bx + 110 * S, by + 29 * S + (pressed ? 2 * S : 0));
  // agenda cards
  const cy = by + 100 * S, cw = (w - 96 * S - 2 * 24 * S) / 3;
  if (cy + 120 * S < y + h) [['09:30', 'Keynote'], ['11:00', 'Workshops'], ['19:30', 'Gala night']].forEach(([tm, nm], i) => { const cx = x + 48 * S + i * (cw + 24 * S), k = eo(seg(t, .05 + i * .07, .3 + i * .07));
    g.globalAlpha = k; g.fillStyle = '#F6F7FA'; K.rr(g, cx, cy + (1 - k) * 20 * S, cw, 110 * S, 14 * S); g.fill(); g.fillStyle = '#2563EB'; K.rr(g, cx + 20 * S, cy + 20 * S + (1 - k) * 20 * S, 64 * S, 26 * S, 13 * S); g.fill();
    g.fillStyle = '#fff'; g.font = `600 ${13 * S}px Mono`; g.textAlign = 'center'; g.fillText(tm, cx + 52 * S, cy + 34 * S + (1 - k) * 20 * S); g.fillStyle = '#1E1B2E'; g.font = `600 ${20 * S}px Inter`; g.textAlign = 'left'; g.fillText(nm, cx + 20 * S, cy + 78 * S + (1 - k) * 20 * S); g.globalAlpha = 1; });
  // cursor
  const cx = lerp(x + w * .82, bx + 150 * S, eo(seg(t, -.2, .4))), cy2 = lerp(y + h * .16, by + 34 * S, eo(seg(t, -.2, .4))) + (pressed ? 2 * S : 0);
  if (pressed) { g.strokeStyle = 'rgba(37,99,235,.5)'; g.lineWidth = 2 * S; K.circle(g, cx, cy2, 10 * S + (t - .45) * 160 * S); g.stroke(); }
  g.fillStyle = '#111'; K.poly(g, [[cx, cy2], [cx, cy2 + 26 * S], [cx + 7 * S, cy2 + 20 * S], [cx + 13 * S, cy2 + 32 * S], [cx + 18 * S, cy2 + 30 * S], [cx + 12 * S, cy2 + 18 * S], [cx + 21 * S, cy2 + 18 * S]]); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5 * S; g.stroke();
  // low-res mascot (a pixel PhE-dot blob) hopping beside the button, cheering when it's done
  const q = buf('mascot', 16, 16); q.fillStyle = '#2A0D6E'; q.fillRect(3, 5, 10, 9); q.fillRect(5, 3, 6, 2); q.fillStyle = '#fff'; q.fillRect(5, 7, 2, 2); q.fillRect(9, 7, 2, 2); q.fillStyle = '#1E1B2E'; q.fillRect(6, 8, 1, 1); q.fillRect(10, 8, 1, 1);
  q.fillStyle = '#2563EB'; q.fillRect(6, 11, 4, 1); if (done) { q.fillStyle = '#2A0D6E'; q.fillRect(1, 2, 2, 4); q.fillRect(13, 2, 2, 4); } else { q.fillStyle = '#2A0D6E'; q.fillRect(1, 9, 2, 3); q.fillRect(13, 9, 2, 3); }
  const hopY = Math.abs(Math.sin(K.twos(t, 12) * 9)) * 40 * S; g.imageSmoothingEnabled = false; g.drawImage(q.canvas, bx - 84 * S, by - 8 * S - hopY, 64 * S, 64 * S); g.imageSmoothingEnabled = true;
}

// 32 DATAVIZ — the numbers: the mark pencilled as a chart of the evening — blue-pencil parts over a red-pencil time axis
export function dataviz(g, t, { W, H, M, S, V }) {
  g.drawImage(papr(W, H, [246, 240, 226], 32), 0, 0, W, H);
  g.strokeStyle = 'rgba(30,60,140,.10)'; g.lineWidth = 1; for (let y = H * .1; y < H; y += 32 * S) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } for (let x = 16 * S; x < W; x += 32 * S) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  const hw = K.halfW(M), hh = K.halfH(M), k = K.logoScale(M), BL = '#2A5CB3', RD = '#C8363A';
  // axes: the logo's baseline is the time axis (the three dots sit on it), a buzz axis on the left
  const [, ay] = K.toScreen(M, 0, 143), ax0 = M.x - hw - 50 * S, ax1 = M.x + hw + 80 * S, axk = eo(seg(t, -.4, -.05));
  g.strokeStyle = '#3a3a44'; g.lineWidth = 2 * S; g.lineCap = 'round';
  handPath(g, [[ax0, ay + 1], [lerp(ax0, ax1, axk), ay - 1]], 3 * S, 2); g.stroke();
  handPath(g, [[ax0, ay], [ax0, lerp(ay, M.y - hh - 40 * S, axk)]], 3 * S, 5); g.stroke();
  if (axk > .95) { g.beginPath(); g.moveTo(ax1 - 14 * S, ay - 8 * S); g.lineTo(ax1, ay - 1); g.lineTo(ax1 - 14 * S, ay + 7 * S); g.stroke(); g.beginPath(); g.moveTo(ax0 - 8 * S, M.y - hh - 26 * S); g.lineTo(ax0, M.y - hh - 40 * S); g.lineTo(ax0 + 7 * S, M.y - hh - 26 * S); g.stroke(); }
  g.font = `600 ${26 * S}px Caveat`; g.fillStyle = '#3a3a44'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText('time →', ax1, ay + 34 * S);
  g.save(); g.translate(ax0 - 22 * S, M.y - hh * .2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText('buzz', 0, 0); g.restore();
  // the strokes: blue-pencil hatching swept in left to right, sketchy double outline
  const sweep = lerp(-20, K.LW + 20, eio(seg(t, -.45, .3)));
  K.inMark(g, M, (q) => { const P = K.markPaths();
    STROKES.forEach(i => { q.save(); q.clip(P[i]); q.beginPath(); q.rect(-10, -10, sweep + 10, K.LH + 20); q.clip(); q.strokeStyle = i === 2 ? 'rgba(42,92,179,.9)' : 'rgba(42,92,179,.75)'; q.lineWidth = 1.5 / k;
      for (let s = -K.LH; s < K.LW; s += 4.2) { q.beginPath(); q.moveTo(s + (hash(s) - .5) * 2, K.LH + 4); q.lineTo(s + K.LH * .62, -4); q.stroke(); }
      if (i === 2) { q.lineWidth = 1.2 / k; for (let s = 0; s < K.LW + K.LH; s += 6) { q.beginPath(); q.moveTo(s, -4); q.lineTo(s - K.LH * .62, K.LH + 4); q.stroke(); } }
      q.restore(); });
    q.strokeStyle = BL; q.lineWidth = 1.8 / k; STROKES.forEach(i => { q.stroke(P[i]); q.save(); q.translate(.8, -.6); q.globalAlpha = .45; q.stroke(P[i]); q.restore(); }); });
  // the dots: red-pencil data points on the time axis, filled in on the beat with a ring
  const ticks = ['7 pm', '9 pm', '11 pm'];
  K.ACC.forEach((kk, n) => { const [x, y, r] = dotS(M, kk), f = back(seg(t, .12 + n * .14, .3 + n * .14), 2), ring = seg(t, .12 + n * .14, .5 + n * .14);
    g.strokeStyle = RD; g.lineWidth = 1.8 * S; K.circle(g, x, y, r); g.stroke();
    if (f > 0) { g.save(); g.beginPath(); g.arc(x, y, r * f, 0, TAU); g.clip(); g.strokeStyle = RD; g.lineWidth = 2.2 * S; for (let s = -r; s < r; s += 3.2 * S) { g.beginPath(); g.moveTo(x + s - r, y + r); g.lineTo(x + s + r, y - r); g.stroke(); } g.restore(); }
    if (ring > 0 && ring < 1) { g.strokeStyle = `rgba(200,54,58,${1 - ring})`; g.lineWidth = 1.5 * S; K.circle(g, x, y, r * (1.2 + ring * 1.4)); g.stroke(); }
    g.strokeStyle = '#3a3a44'; g.lineWidth = 1.6 * S; g.beginPath(); g.moveTo(x, y + r + 4 * S); g.lineTo(x, y + r + 14 * S); g.stroke();
    g.fillStyle = RD; g.font = `700 ${28 * S}px Caveat`; g.textAlign = 'center'; g.fillText(ticks[n], x, y + r + 36 * S); });
  // labels with leaders: each letter is a share of the evening
  const L = [[0, 'talks · 30%', -.2], [2, 'networking · 25%', .1], [3, 'the show · 45%', .2]];
  g.font = `600 ${30 * S}px Caveat`;
  L.forEach(([p, txt, dx], i) => { const a = seg(t, -.1 + i * .12, .15 + i * .12); if (a <= 0) return; const [px, py] = K.anchor(M, p), b = K.partBox(M, p), lx = px + dx * hw * .3, ly = M.y - hh - (V ? 70 : 60) * S - (i === 1 ? 26 * S : 0);
    g.globalAlpha = a; g.strokeStyle = '#3a3a44'; g.lineWidth = 1.4 * S; handPath(g, [[px, b[1] - 6 * S], [lx, ly + 14 * S]], 2 * S, i * 3); g.stroke(); K.circle(g, px, b[1] - 6 * S, 3 * S); g.fillStyle = '#3a3a44'; g.fill();
    g.fillStyle = BL; g.textAlign = 'center'; g.fillText(txt, lx, ly); g.globalAlpha = 1; });
  // pinned note
  if (t > .35) { const kn = back(seg(t, .35, .55), 1.6), nx = V ? M.x + hw * .45 : M.x + hw + 170 * S, ny = V ? M.y - hh - 290 * S : M.y - hh - 70 * S;
    g.save(); g.translate(nx, ny); g.rotate(.05); g.scale(kn, kn); g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 10 * S; g.shadowOffsetY = 5 * S;
    g.fillStyle = '#FFF3A8'; g.fillRect(-120 * S, -60 * S, 240 * S, 120 * S); g.shadowColor = 'transparent'; g.fillStyle = RD; K.circle(g, 0, -60 * S, 8 * S); g.fill();
    g.fillStyle = '#2a2a2a'; g.font = `600 ${30 * S}px Caveat`; g.textAlign = 'center'; g.fillText('the part people', 0, -14 * S); g.fillText(V ? 'remember ↓' : 'remember ↙', 0, 22 * S); g.restore(); }
  g.fillStyle = '#2a2a2a'; g.font = `700 ${40 * S}px InterTight`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('Where the evening goes', 70 * S, 100 * S);
  g.fillStyle = '#5a5a66'; g.font = `600 ${28 * S}px Caveat`; g.textAlign = 'center'; g.fillText('n = 1,240 guests · 3 venues · one night', M.x, ay + (V ? 150 : 130) * S);
}

// 33 WHITEBOARD — the workshop: a marker writes the mark along its centre lines, words and arrows around it
export function whiteboard(g, t, { W, H, M, S, V }) {
  g.fillStyle = '#F7F8F9'; g.fillRect(0, 0, W, H);
  const gl = g.createLinearGradient(W * .2, 0, W * .5, H); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(.5, 'rgba(255,255,255,.7)'); gl.addColorStop(.52, 'rgba(230,234,240,.4)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(60,70,90,.06)'; g.lineWidth = 30 * S; g.beginPath(); g.moveTo(W * .1, H * .8); g.bezierCurveTo(W * .3, H * .6, W * .5, H * .9, W * .8, H * .7); g.stroke();
  const hw = K.halfW(M), hh = K.halfH(M), BL = '#1F4FA8', RD = '#D2342F', MW = 15 * S;
  // ghost of the last session's drawing, half-erased
  K.ACC.forEach(kk => { const [x, y, r] = dotS(M, kk); g.strokeStyle = 'rgba(35,38,44,.18)'; g.lineWidth = 2 * S; g.setLineDash([4 * S, 5 * S]); K.circle(g, x, y, r * 1.1); g.stroke(); g.setLineDash([]); });
  // the marker tour: strokes first (ending by t≈.15), then three dot taps on the beat
  const T = K.markTourPts(M, 0).filter(p => p[2] < 5), n = Math.floor(clamp((t + .62) / .62) * T.length);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const draw = (col, lw, off) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (let i = 0; i < n; i++) { const [x, y, k] = T[i]; (i === 0 || T[i - 1][2] !== k) ? g.moveTo(x + off, y + off) : g.lineTo(x + off, y + off); } g.stroke(); };
  draw('rgba(31,79,168,.92)', MW, 0); draw('rgba(255,255,255,.16)', MW * .3, -MW * .18);
  const taps = K.ACC.map((k, i) => .28 + i * .16);
  K.ACC.forEach((kk, i) => { if (t < taps[i]) return; const [x, y, r] = dotS(M, kk), p = back(seg(t, taps[i], taps[i] + .08), 2.5);
    g.fillStyle = RD; g.beginPath(); for (let a = 0; a <= 16; a++) { const an = a / 16 * TAU, rr = r * p * (1 + (hash(a + i * 20) - .5) * .12); a ? g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr) : g.moveTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } g.fill();
    g.fillStyle = 'rgba(255,255,255,.25)'; K.circle(g, x - r * .3, y - r * .3, r * .25 * p); g.fill(); });
  // the marker: blue while writing, red while tapping
  const writing = n < T.length, ti = taps.findIndex((tt, i) => t > tt - .14 && t < tt + .06);
  let mp = null, mc = BL; if (writing) mp = T[Math.max(0, n - 1)]; else if (ti >= 0) { const [x, y] = dotS(M, K.ACC[ti]), lift = Math.abs(t - taps[ti]) < .03 ? 0 : clamp((taps[ti] - t) / .14) * 40 * S; mp = [x, y - lift]; mc = RD; }
  if (mp) { g.save(); g.translate(mp[0], mp[1]); g.rotate(-.6); g.fillStyle = mc; K.rr(g, 8 * S, -15 * S, 160 * S, 30 * S, 9 * S); g.fill(); g.fillStyle = '#E8ECF2'; g.fillRect(40 * S, -15 * S, 80 * S, 30 * S); g.fillStyle = mc; g.font = `700 ${14 * S}px Inter`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MARKER', 80 * S, 1 * S);
    g.fillStyle = '#1C2333'; K.poly(g, [[0, 0], [10 * S, -9 * S], [10 * S, 9 * S]]); g.fill(); g.restore(); }
  // words around the mark, joined by marker arrows: plan → build → run → wow!
  const P = V ? [[M.x - hw * .55, M.y - hh - 150 * S], [M.x + hw * .5, M.y - hh - 150 * S], [M.x - hw * .45, M.y + hh + 170 * S], [M.x + hw * .5, M.y + hh + 170 * S]]
    : [[M.x - hw - 160 * S, M.y - 30 * S], [M.x - hw * .35, M.y - hh - 120 * S], [M.x + hw * .55, M.y - hh - 120 * S], [M.x + hw + 160 * S, M.y + 30 * S]];
  const words = ['plan', 'build', 'run', 'wow!'], wt = [-.15, .05, .2, .62];
  g.font = `700 ${46 * S}px Caveat`; g.textAlign = 'center'; g.textBaseline = 'middle';
  words.forEach((w, i) => { const a = clamp((t - wt[i]) / .12); if (a <= 0) return; const [x, y] = P[i]; g.save(); g.beginPath(); const tw = g.measureText(w).width; g.rect(x - tw / 2 - 4, y - 40 * S, (tw + 8) * a, 80 * S); g.clip();
    g.fillStyle = i === 3 ? RD : '#23262c'; g.fillText(w, x, y); g.restore();
    if (i === 3 && a >= 1) { g.strokeStyle = RD; g.lineWidth = 4 * S; g.lineCap = 'round'; const u = eo(seg(t, wt[3] + .12, wt[3] + .25)); handPath(g, [[x - tw / 2, y + 30 * S], [x - tw / 2 + tw * u, y + 26 * S]], 4 * S, 9); g.stroke(); }
    if (i > 0 && !(V && i === 2)) { const [x0, y0] = P[i - 1], a2 = clamp((t - wt[i] + .08) / .12); if (a2 <= 0) return; const mx2 = (x0 + x) / 2, my2 = Math.min(y0, y) - 50 * S, d0 = 50 * S;
      const pts = []; for (let s = 0; s <= 20; s++) { const u = .18 + s / 20 * .64 * a2, x1 = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * mx2 + u * u * x, y1 = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * my2 + u * u * y; pts.push([x1, y1]); }
      g.strokeStyle = '#23262c'; g.lineWidth = 4 * S; g.lineCap = 'round'; handPath(g, pts, 3 * S, i * 7); g.stroke();
      if (a2 >= 1) { const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 3], an = Math.atan2(ey - py, ex - px); g.beginPath(); g.moveTo(ex + Math.cos(an + 2.5) * 18 * S, ey + Math.sin(an + 2.5) * 18 * S); g.lineTo(ex, ey); g.lineTo(ex + Math.cos(an - 2.5) * 18 * S, ey + Math.sin(an - 2.5) * 18 * S); g.stroke(); } } });
  // magnets
  for (const [x, y, c] of [[W * .08, H * .12, '#c8363a'], [W * .9, H * .1, '#2e8b57']]) { g.fillStyle = 'rgba(0,0,0,.15)'; K.circle(g, x + 3 * S, y + 4 * S, 16 * S); g.fill(); g.fillStyle = c; K.circle(g, x, y, 16 * S); g.fill(); }
}

// 34 CRAYON BOOK — family day: wax crayon on toothy paper, wobbly boiling outlines, a watercolour wash
export function crayonBook(g, t, { W, H, M, S, V }) {
  g.drawImage(K.paper('tooth', 960, 540, [250, 246, 236], { mottle: 8, grain: 30, seed: 34 }), 0, 0, W, H);
  const hw = K.halfW(M), hh = K.halfH(M), ground = V ? M.y + hh + 380 * S : H * .74, boil = Math.floor(t * 12);
  // watercolour wash first: sky and grass with blotchy edges, the grass flooding in
  const wash = eo(seg(t, -.1, .7));
  g.save(); g.globalCompositeOperation = 'multiply';
  g.globalAlpha = .4; const sky = g.createLinearGradient(0, 0, 0, ground); sky.addColorStop(0, '#7FB6E6'); sky.addColorStop(1, '#D9EEF8'); g.fillStyle = sky;
  g.beginPath(); g.moveTo(W * .02, H * .03); for (let x = W * .02; x <= W * .98; x += 20 * S) g.lineTo(x, H * .03 + fbm(x * .01, 1) * 20 * S); for (let x = W * .98; x >= W * .02; x -= 20 * S) g.lineTo(x, ground - 30 * S + fbm(x * .008, 3) * 50 * S); g.fill();
  g.globalAlpha = .5 * clamp(wash * 1.5); g.fillStyle = '#9BD07A'; g.beginPath(); g.moveTo(W * .02, ground); const gx = W * .02 + W * .96 * wash; for (let x = W * .02; x <= gx; x += 20 * S) g.lineTo(x, ground - 10 * S + fbm(x * .01, 7) * 30 * S); g.lineTo(gx + 30 * S, H * .97); g.lineTo(W * .02, H * .97); g.fill(); g.restore();
  // crayon layer drawn to a buffer, then the paper tooth knocks holes in it
  const q = buf('crayon', W, H);
  const crayon = (pts, col, w, seed, close = false) => { q.strokeStyle = col; q.lineCap = 'round'; q.lineJoin = 'round'; for (let p = 0; p < 3; p++) { q.globalAlpha = .6; q.lineWidth = w * (1 - p * .22); q.save(); q.translate(0, 0); handPath(q, pts, 9 * S, seed + p * 3.1, close); q.restore(); q.stroke(); } q.globalAlpha = 1; };
  // the mark: purple scribble-fill (zigzags along each part) then a wobbly outline that boils on twos
  const k = K.logoScale(M);
  K.inMark(q, M, () => { const P = K.markPaths(); STROKES.forEach(i => { const f = clamp((t + .55) * 2.4 - i * .18); if (f <= 0) return; const b = K.LOGO.parts[i].bbox, r = mulberry(i + 7);
    q.save(); q.clip(P[i]); q.lineJoin = 'round'; const bh = b[3] - b[1];
    for (const [col, al, lw, sp, sl] of [['#6A3FC4', .85, 3.6, 5.2, .9], ['#8E6BE6', .55, 2.6, 9, -.5]]) { q.strokeStyle = col; q.globalAlpha = al; q.lineWidth = lw * S / k; q.beginPath();
      const n = Math.ceil((b[2] - b[0] + bh * 1.2) / sp * f); for (let s = 0; s < n; s++) { const top = s % 2, d = b[0] - bh * Math.max(0, sl) + s * sp + (r() - .5) * 7; q.lineTo(d + (top ? bh * sl : 0) + (r() - .5) * 6, top ? b[1] - 2 - r() * 8 : b[3] + 2 + r() * 8); } q.stroke(); }
    q.restore(); }); });
  const FPs = fillPts(); STROKES.forEach(i => FPs[i].forEach((poly, j) => { const pts = poly.filter((_, n) => n % 5 === 0).map(([x, y]) => K.toScreen(M, x, y)); crayon(pts, '#3E1F8F', 4.5 * S, boil * 7 + i * 11 + j, true); }));
  // the dots: blue crayon spirals that hop like kids at a party
  K.ACC.forEach((kk, n) => { const [x, y, r] = dotS(M, kk), up = hop(t, .25 + n * .13, .42, 2) * 34 * S, sp = [];
    for (let a = 0; a < 26; a++) { const u = a / 25, an = u * TAU * 3.2 + n; sp.push([x + Math.cos(an) * r * u * 1.05, y - up + Math.sin(an) * r * u * 1.05]); }
    crayon(sp, '#2563EB', 5 * S, boil * 5 + n * 13); crayon(Array.from({ length: 13 }, (_, a) => [x + Math.cos(a / 12 * TAU) * r * 1.1, y - up + Math.sin(a / 12 * TAU) * r * 1.1]), '#1740B0', 3.5 * S, boil * 3 + n, true);
    if (up > 6 * S) { q.strokeStyle = '#8A8A8A'; q.globalAlpha = .6; q.lineWidth = 3 * S; for (const s of [-1, 1]) { q.beginPath(); q.moveTo(x + s * r * .9, y + r * 1.2); q.lineTo(x + s * r * 1.5, y + r * 1.5); q.stroke(); } q.globalAlpha = 1; } });
  // a tent and two kids
  const tx = V ? W * .2 : W * .2, tw = 150 * S, ty = ground - 230 * S;
  crayon([[tx - tw, ground], [tx, ty], [tx + tw, ground]], '#E8553D', 8 * S, 3 + boil, true); crayon([[tx, ty], [tx, ground]], '#B8402C', 5 * S, 4 + boil); crayon([[tx, ty], [tx - 10 * S, ty - 50 * S], [tx + 40 * S, ty - 40 * S]], '#2563EB', 5 * S, 5 + boil);
  for (const [x, c] of (V ? [[W * .66, '#2A5CB3'], [W * .84, '#C8363A']] : [[W * .76, '#2A5CB3'], [W * .84, '#C8363A']])) { const y = ground - Math.abs(Math.sin(t * 8 + x)) * 20 * S;
    crayon([[x, y - 120 * S], [x, y - 40 * S]], c, 8 * S, (x | 0) + boil); crayon([[x - 30 * S, y], [x, y - 40 * S], [x + 30 * S, y]], c, 7 * S, (x | 0) + 1 + boil); crayon([[x - 40 * S, y - 100 * S], [x, y - 90 * S], [x + 40 * S, y - 110 * S]], c, 7 * S, (x | 0) + 2 + boil);
    crayon(Array.from({ length: 13 }, (_, i) => [x + Math.cos(i / 12 * TAU) * 24 * S, y - 146 * S + Math.sin(i / 12 * TAU) * 24 * S]), '#3A2A1A', 4 * S, 5 + boil, true); }
  // sun scribble in the corner
  crayon(Array.from({ length: 16 }, (_, i) => [W * .9 + Math.cos(i / 15 * TAU) * 50 * S, H * .14 + Math.sin(i / 15 * TAU) * 50 * S]), '#F2C43B', 8 * S, 9 + boil, true);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; crayon([[W * .9 + Math.cos(a) * 66 * S, H * .14 + Math.sin(a) * 66 * S], [W * .9 + Math.cos(a) * 96 * S, H * .14 + Math.sin(a) * 96 * S]], '#F2A93B', 6 * S, 20 + i + boil); }
  // wax tooth: knock speckles out of the crayon
  const tooth = K.tex('crayonTooth', 384, 384, (c, w, h) => { const id = c.createImageData(w, h), d = id.data, r = mulberry(77); for (let i = 0; i < d.length; i += 4) { const v = r(); d[i] = d[i + 1] = d[i + 2] = 0; d[i + 3] = v < .3 ? 255 : v < .45 ? 120 : 0; } c.putImageData(id, 0, 0); });
  q.globalCompositeOperation = 'destination-out'; q.globalAlpha = 1; q.fillStyle = q.createPattern(tooth, 'repeat'); q.fillRect(0, 0, W, H); q.globalCompositeOperation = 'source-over';
  g.drawImage(q.canvas, 0, 0);
}
