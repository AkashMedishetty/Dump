// WORLDS — 43 styles, one mark, one pulse. The mark never moves; each world redraws it, each transition opens from it.
import * as K from './kit.js';
import * as A from './styles1.js';
import * as B from './styles2a.js';
import * as B2 from './styles2b.js';
import * as C3 from './styles3.js';
import { SLOTS, DUR, CAPTIONS, END } from './timeline.js';
const { clamp, lerp, seg, eo, ei, eio, back, hash, TAU, rgb } = K;
const FN = { ...A, ...B, ...B2, ...C3 };

let W, H, V, g, cv, CX, bufA, bufB, bufM, ga, gb, gm;

// ---------- transition masks: white = incoming world ----------
function mask(q, kind, p, M, seed) {
  q.clearRect(0, 0, W, H); q.fillStyle = '#fff'; q.strokeStyle = '#fff';
  const D = Math.hypot(W, H);
  switch (kind) {
    case 'iris': { K.circle(q, M.x, M.y, lerp(M.R * .55, D, ei(p) * .35 + eo(p) * .65)); q.fill(); break; }
    case 'irisIn': { q.fillRect(0, 0, W, H); q.globalCompositeOperation = 'destination-out'; K.circle(q, M.x, M.y, lerp(D, 0, eo(p))); q.fill(); q.globalCompositeOperation = 'source-over'; break; }
    case 'curtain': { const w = W / 2 * eio(p); q.fillRect(M.x - w, 0, w * 2, H); break; }
    case 'wipe': { const x = lerp(-W * .1, W * 1.1, eio(p)); q.beginPath(); q.moveTo(0, 0); q.lineTo(x + H * .25, 0); q.lineTo(x - H * .25, H); q.lineTo(0, H); q.fill(); break; }
    case 'wipeUp': { const y = lerp(H * 1.05, -H * .05, eio(p)); q.fillRect(0, y, W, H); break; }
    case 'crt': { const h = H * ei(p) ** .8, w = W * Math.min(1, p * 3); q.fillRect(M.x - w / 2, M.y - Math.max(2, h) / 2, w, Math.max(2, h)); break; }
    case 'shutter': { for (let k = 0; k < 4; k++) { const a = [-Math.PI / 2, Math.PI, Math.PI / 2, 0][k] - Math.PI / 4; q.beginPath(); q.moveTo(M.x, M.y); q.arc(M.x, M.y, D, a, a + Math.PI / 2 * eio(p)); q.closePath(); q.fill(); } break; }
    case 'blocks': { const s = Math.round(48 * Math.min(W, H) / 1080), cols = Math.ceil(W / s), rows = Math.ceil(H / s);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = i * s + s / 2, y = j * s + s / 2, d = Math.hypot(x - M.x, y - M.y) / D * 1.6 + hash(i * 31 + j * 17 + seed) * .35; if (d < p * 1.9) q.fillRect(i * s, j * s, s, s); } break; }
    case 'ink': { const n = 90, R = lerp(M.R * .4, D * .75, eio(p)); q.beginPath();
      for (let i = 0; i <= n; i++) { const a = i / n * TAU, r = R * (.78 + .44 * K.fbm(Math.cos(a) * 1.6 + seed, Math.sin(a) * 1.6 + p * 1.5)); q.lineTo(M.x + Math.cos(a) * r, M.y + Math.sin(a) * r); } q.fill();
      for (let i = 0; i < 18; i++) { const a = hash(i + seed) * TAU, r = R * (1.05 + hash(i * 3 + seed) * .25); K.circle(q, M.x + Math.cos(a) * r, M.y + Math.sin(a) * r, R * .08 * hash(i * 7 + seed)); q.fill(); } break; }
    case 'shards': { const r = K.mulberry(seed + 5), N = 70; for (let i = 0; i < N; i++) { const a = r() * TAU, d = Math.pow(r(), .7) * D * .6, x = M.x + Math.cos(a) * d, y = M.y + Math.sin(a) * d, s = (60 + r() * 140) * Math.min(W, H) / 1080;
      if (d / (D * .6) < p * 1.35 - .1) { q.beginPath(); for (let v = 0; v < 5; v++) { const b = v / 5 * TAU + r(); q.lineTo(x + Math.cos(b) * s, y + Math.sin(b) * s); } q.fill(); } }
      if (p > .8) q.fillRect(0, 0, W, H); break; }
    case 'tear': { const x0 = lerp(-W * .15, W * 1.15, eio(p)); q.beginPath(); q.moveTo(-10, -10); for (let y = 0; y <= H + 20; y += 20) q.lineTo(x0 + (hash(y * .37 + seed) - .5) * 60 + Math.sin(y * .01) * 40, y); q.lineTo(-10, H + 10); q.fill(); break; }
    case 'bands': { const n = 8, bh = H / n; for (let i = 0; i < n; i++) { const k = eo(seg(p, i * .06, .5 + i * .06)); q.fillRect(0, i * bh, W * k, bh + 1); } break; }
    case 'rings': { for (let i = 9; i >= 0; i--) { const k = eo(seg(p, (9 - i) * .05, .5 + (9 - i) * .05)); if (k <= 0) continue; K.circle(q, M.x, M.y, k * D * (i + 1) / 10); q.fill(); q.globalCompositeOperation = i % 2 ? 'destination-out' : 'source-over'; } q.globalCompositeOperation = 'source-over'; if (p > .95) q.fillRect(0, 0, W, H); break; }
    case 'page': { const x = lerp(W * 1.2, -W * .4, eio(p)); q.beginPath(); q.moveTo(x, 0); q.lineTo(W + 10, 0); q.lineTo(W + 10, H); q.lineTo(x - H * .35, H); q.closePath(); q.fill(); break; }
    case 'line': { q.lineWidth = lerp(2, D * 1.2, ei(p)); q.lineCap = 'round'; q.beginPath(); q.moveTo(-W * .1, M.y); q.lineTo(W * 1.1, M.y); q.stroke(); break; }
    default: q.fillRect(0, 0, W, H);
  }
}

// ---------- the carried counter + captions ----------
function chrome(t, slot, idx) {
  const S = CX.S, x = V ? 64 * S : 56 * S, y = H - (V ? 120 : 56) * S;
  // a small pill so it reads on every world, light or dark
  const label = SLOTS[idx].label, num = String(idx + 1).padStart(2, '0');
  g.font = `600 ${15 * S}px Mono`; const lw = g.measureText(label.toUpperCase()).width + label.length * 15 * S * .12;
  const w = 118 * S + lw, h = 40 * S;
  g.save(); g.globalAlpha = .9; K.rr(g, x, y - h / 2, w, h, h / 2); g.fillStyle = 'rgba(10,11,15,.62)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.stroke(); g.restore();
  g.fillStyle = '#2563EB'; K.circle(g, x + 20 * S, y, 5 * S); g.fill();
  g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#F2F0F7'; g.font = `600 ${15 * S}px Mono`; K.track(g, `${num}/43`, x + 34 * S, y + 1, .08);
  g.fillStyle = 'rgba(242,240,247,.7)'; K.track(g, label.toUpperCase(), x + 104 * S, y + 1, .12);
}
function captions(t) {
  for (const c of CAPTIONS) {
    if (t < c.t0 || t > c.t1) continue;
    const k = eo(seg(t, c.t0, c.t0 + .2)) * (1 - ei(seg(t, c.t1 - .2, c.t1))), S = CX.S;
    g.save(); g.globalAlpha = k; g.font = `600 ${(V ? 64 : 58) * S}px InterTight`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const y = V ? CX.M.y + CX.M.R * 1.75 : CX.M.y + CX.M.R * 1.62, tw = g.measureText(c.text).width;
    K.rr(g, W / 2 - tw / 2 - 34 * S, y - 46 * S + (1 - k) * 10 * S, tw + 68 * S, 92 * S, 46 * S); g.fillStyle = 'rgba(10,11,15,.7)'; g.fill();
    g.fillStyle = '#F2F0F7'; g.letterSpacing = (-.02 * 58 * S) + 'px'; g.fillText(c.text, W / 2, y + (1 - k) * 10 * S + 2 * S); g.letterSpacing = '0px'; g.restore();
  }
}
// ---------- end card (dark keynote again: the bookend) ----------
function endCard(t) {
  const u = t - END.t0; if (u < 0) return;
  const S = CX.S, M = CX.M;
  // the brand's own world: Warm White, a faint violet line pattern of pills + circles
  const veil = eo(seg(u, 0, .6));
  g.fillStyle = `rgba(244,241,235,${veil})`; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .08 * veil; g.strokeStyle = '#2A0D6E'; g.lineWidth = 2 * S; const u0 = 120 * S;
  for (let j = -1; j < H / u0 + 1; j++) for (let i = -1; i < W / (u0 * 3) + 1; i++) { const x = i * u0 * 3 + (j % 2) * u0 * 1.5 + ((u * 18 * S) % (u0 * 3)), y = j * u0;
    K.rr(g, x, y + u0 * .2, u0 * 1.6, u0 * .6, u0 * .3); g.stroke(); K.circle(g, x + u0 * 2.2, y + u0 * .5, u0 * .3); g.stroke(); }
  g.restore();
  // the logo settles up and smaller; then the three dots hop, one per beat (the dots are the animation device)
  const k = eio(seg(u, .3, 1.1)), my = lerp(M.y, V ? H * .4 : H * .38, k), mr = lerp(M.R, M.R * .62, k), MM = { x: M.x, y: my, R: mr };
  K.fillMark(g, MM, '#2A0D6E', 'rgba(0,0,0,0)', { only: [0, 1, 2, 3, 4] });
  const ks = K.logoScale(MM);
  [5, 6, 7].forEach((p, i) => { const d = K.LOGO.parts[p], [x, y] = K.toScreen(MM, d.cx, d.cy), ht = u - (1.1 + i * .25);
    const hop = ht > 0 && ht < .5 ? Math.sin(Math.PI * ht / .5) * 34 * S : 0, sq = ht > .5 && ht < .62 ? 1 - .25 * Math.sin(Math.PI * (ht - .5) / .12) : 1;
    g.save(); g.translate(x, y - hop + d.r * ks * (1 - sq)); g.scale(1 / Math.sqrt(sq), sq); g.fillStyle = '#2563EB'; g.shadowColor = 'rgba(37,99,235,.55)'; g.shadowBlur = (ht > .5 && ht < 1 ? 30 * (1 - (ht - .5) * 2) : 0) * S;
    K.circle(g, 0, 0, d.r * ks); g.fill(); g.restore(); });
  const base = my + K.halfH(MM);
  const wk = seg(u, 1.6, 2.4);
  if (wk > 0) { g.font = `500 ${(V ? 88 : 84) * S}px Brand`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const tw = g.measureText('PurpleHat Events').width, front = W / 2 - tw / 2 - 100 * S + (tw + 200 * S) * eo(wk), lg = g.createLinearGradient(front - 240 * S, 0, front, 0);
    lg.addColorStop(0, '#2A0D6E'); lg.addColorStop(.85, '#2563EB'); lg.addColorStop(1, 'rgba(37,99,235,0)'); g.save(); g.beginPath(); g.rect(0, 0, front, H); g.clip(); g.fillStyle = '#2A0D6E'; g.letterSpacing = (-.02 * 84 * S) + 'px'; g.fillText('PurpleHat Events', W / 2, base + (V ? 110 : 92) * S); g.letterSpacing = '0px'; g.restore(); }
  const tk = eo(seg(u, 2.2, 2.45));
  if (tk > 0) { g.globalAlpha = tk; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `400 ${(V ? 40 : 34) * S}px Brand`; g.fillStyle = 'rgba(42,13,110,.78)'; g.fillText('Events for a more connected tomorrow.', W / 2, base + (V ? 196 : 166) * S + (1 - tk) * 10 * S);
    g.font = `600 ${(V ? 18 : 16) * S}px Mono`; g.fillStyle = 'rgba(42,13,110,.5)'; K.track(g, '43 WORLDS · ONE CALL', W / 2, base + (V ? 262 : 222) * S, .2); g.globalAlpha = 1; }
}
// ---------- frame ----------
function drawWorld(q, idx, t) {
  const s = SLOTS[idx], fn = FN[s.fn];
  q.save(); q.clearRect(0, 0, W, H);
  if (fn) fn(q, t - s.t0, CX); else { q.fillStyle = '#333'; q.fillRect(0, 0, W, H); q.fillStyle = '#fff'; q.font = '40px Mono'; q.fillText(s.fn, 100, 100); }
  q.restore();
}
export function render(t) {
  t = clamp(t, 0, DUR);
  // which slot, and are we inside a transition into the next one?
  let i = SLOTS.findIndex(s => t < s.t1); if (i < 0) i = SLOTS.length - 1;
  const s = SLOTS[i], nx = SLOTS[i + 1];
  drawWorld(ga, i, t);
  let shown = i;
  if (nx && t > nx.t0 - nx.tr / 2) {
    const p = clamp((t - (nx.t0 - nx.tr / 2)) / nx.tr);
    drawWorld(gb, i + 1, t); mask(gm, nx.tx, p, CX.M, i * 13);
    gb.globalCompositeOperation = 'destination-in'; gb.drawImage(bufM, 0, 0); gb.globalCompositeOperation = 'source-over';
    ga.drawImage(bufB, 0, 0); if (p > .5) shown = i + 1;
  }
  g.drawImage(bufA, 0, 0);
  if (t < END.t0 + .4) chrome(t, s, shown);
  captions(t);
  endCard(t);
}
export function texts(t) {
  const out = [];
  for (const c of CAPTIONS) if (t >= c.t0 + .2 && t <= c.t1 - .2) out.push({ id: c.id, text: c.text, x0: 0, y0: 0, x1: W - 1, y1: H - 1 });
  const u = t - END.t0;
  if (u >= 2.4) out.push({ id: 'word', text: 'PurpleHat Events', x0: 0, y0: 0, x1: W - 1, y1: H - 1 });
  if (u >= 2.45) { out.push({ id: 'tag', text: 'Events for a more connected tomorrow.', x0: 0, y0: 0, x1: W - 1, y1: H - 1 }); }
  return out;
}
export function setup(canvas) {
  cv = canvas; W = innerWidth; H = innerHeight; V = H > W; cv.width = W; cv.height = H; g = cv.getContext('2d');
  const S = Math.min(W, H) / 1080;
  CX = { W, H, V, S, M: V ? { x: W / 2, y: H * .44, R: 250 * S } : { x: W / 2, y: H * .47, R: 190 * S } };
  [bufA, bufB, bufM] = [K.canvas(W, H), K.canvas(W, H), K.canvas(W, H)]; [ga, gb, gm] = [bufA, bufB, bufM].map(c => c.getContext('2d'));
  const q = new URLSearchParams(location.search);
  window.DUR = DUR; window.render = render; window.TEXTS = texts;
  window.EV = SLOTS.map((s, i) => ({ t: s.t0, type: 'world', i, fn: s.fn, tx: s.tx, dur: s.t1 - s.t0 }));
  render(+(q.get('t') || 0));
}
