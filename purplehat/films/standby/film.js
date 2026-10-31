// STANDBY — a show call, drawn in code. Canvas 2D; a small perspective camera over a ballroom plan + a cue-stack window.
import { clamp, lerp, seg, ss, eio, eo, ei, back, mulberry, hash, track } from '/core/lib.js';
import { CUES, T, TOASTS, DUR, GUESTS, BEAT } from './timeline.js';

const C = {
  bg: '#0A0B0F', s1: [18, 21, 28], s2: [26, 30, 40], s3: [34, 39, 52], ink: [232, 234, 240], ink2: [138, 144, 160], lab: [92, 98, 114],
  acc: [139, 124, 255], lav: [215, 207, 255], red: [255, 77, 77], guest: [201, 211, 230], led: [196, 212, 255],
};
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${clamp(a).toFixed(4)})`;
const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const shade = (c, b) => mix3([10, 11, 15], c, clamp(b));

let cv, g, W, H, V, LAY;

// ---------- world ----------
const ROOM = { x0: -16, x1: 16, z0: -13, z1: 13 };
const STAGE = { x0: -9, x1: 9, z0: -12.6, z1: -8, h: 1.0 };
const WALL = { x0: -7, x1: 7, z: -12.45, y0: 1.4, h: 4.4, cols: 14, rows: 4 };
const DOORS = [-4, 4];
const COUNTERS = [-7.6, -5.0, 5.0, 7.6].map(x => ({ x, z: 10.6 }));
const TBL = [];
{ const rows = [-5.2, -1.6, 2.0, 5.6], cols = [-10, -6, -2, 2, 6, 10]; let k = 0;
  for (const z of rows) for (const x of cols) TBL.push({ x, z, k: k++ });
  const order = [...TBL].sort((a, b) => (a.z - b.z) || (a.x - b.x));   // land back to front, left to right
  order.forEach((tb, i) => { tb.land = T.tablesFrom + i * T.tableStep + T.tableFly; tb.i = i; });
}
const SEATS = [];
TBL.forEach(tb => { for (let j = 0; j < 10; j++) { const a = (j / 10) * Math.PI * 2 + Math.PI / 10; SEATS.push({ tb, j, x: tb.x + 1.38 * Math.cos(a), z: tb.z + 1.38 * Math.sin(a) }); } });
const FIX = Array.from({ length: 12 }, (_, i) => ({ i, x: -9.35 + i * 1.7, y: 6.9, z: -8.6 }));

// guests: seeded seat order, spawn times that start sparse and settle into a steady stream
const GST = [];
{ const r = mulberry(7), idx = SEATS.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  for (let g2 = 0; g2 < GUESTS; g2++) {
    const s = SEATS[idx[g2]], side = s.x < 0 ? 0 : 1, door = DOORS[side];
    const cs = COUNTERS.filter(c => (c.x < 0) === (side === 0)), cn = cs[g2 % 2];
    const aisle = s.tb.x + (s.x >= s.tb.x ? 2 : -2);
    const pts = [[door + (r() - .5) * 1.2, 13.8], [cn.x + (r() - .5) * .6, 11.4], [aisle, 8.7], [aisle, s.z], [s.x, s.z]];
    const t0 = T.guestsFrom + (T.guestsTo - T.guestsFrom) * Math.pow(g2 / GUESTS, 0.82);
    let len = 0; const L = [0]; for (let k = 1; k < pts.length; k++) { len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); L.push(len); }
    const a = L[1], v = 8.5, ta = a / v, dwell = 0.22, tb = (len - a) / v;
    GST.push({ s, pts, L, t0, tc: t0 + ta, t1: t0 + ta + dwell + tb, ta, tb, dwell, len });
  }
}
const seated = (s, t) => s.g && t >= s.g.t1;
GST.forEach(gg => gg.s.g = gg);
function guestPos(gg, t) {
  const at = (d) => { let k = 1; while (k < gg.L.length - 1 && gg.L[k] < d) k++; const u = (d - gg.L[k - 1]) / Math.max(1e-6, gg.L[k] - gg.L[k - 1]);
    return [lerp(gg.pts[k - 1][0], gg.pts[k][0], clamp(u)), lerp(gg.pts[k - 1][1], gg.pts[k][1], clamp(u))]; };
  if (t < gg.tc) return at(gg.L[1] * eo(seg(t, gg.t0, gg.tc)) * 0.92 + gg.L[1] * 0.08 * seg(t, gg.t0, gg.tc));
  if (t < gg.tc + gg.dwell) return at(gg.L[1]);
  return at(gg.L[1] + (gg.len - gg.L[1]) * ss(seg(t, gg.tc + gg.dwell, gg.t1)));
}

// ---------- camera ----------
const CAMK = [
  [0.0, [0, 0, -0.5, 0, 89, 47]], [1.0, [0, 0, -0.5, 0, 89, 47]], [3.0, [0, 0, -1.2, 0, 89, 44]], [7.0, [0, 0, -1.0, 0, 88, 41]],
  [11.0, [0, 0, 0.5, -14, 58, 42]], [13.0, [0, 0.5, 1.0, -19, 51, 41]], [17.0, [0, 1.0, -1.5, -25, 45, 37]], [21.5, [0, 1.2, -3.5, -21, 41, 34]],
  [24.0, [0, 1.6, -6.5, -13, 30, 30]], [27.0, [0, 2.6, -8.6, -5, 13, 25.5]], [33.0, [0, 2.6, -8.0, 3, 15, 28.5]], [40.0, [0, 2.6, -7.6, 8, 17, 31]],
];
const camTrack = track(CAMK);
let CAM;
function camera(t) {
  const [tx, ty, tz, yawD, pitD, d] = camTrack(t), y = yawD * Math.PI / 180, p = pitD * Math.PI / 180;
  const pos = [tx + d * Math.cos(p) * Math.sin(y), ty + d * Math.sin(p), tz + d * Math.cos(p) * Math.cos(y)];
  const f = [-Math.cos(p) * Math.sin(y), -Math.sin(p), -Math.cos(p) * Math.cos(y)], r = [Math.cos(y), 0, -Math.sin(y)];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  CAM = { pos, f, r, u, F: LAY.F, cx: LAY.cx, cy: LAY.cy, pitch: pitD };
}
function P(x, y, z) {
  const v = [x - CAM.pos[0], y - CAM.pos[1], z - CAM.pos[2]], dz = Math.max(0.3, v[0] * CAM.f[0] + v[1] * CAM.f[1] + v[2] * CAM.f[2]);
  return [CAM.cx + CAM.F * (v[0] * CAM.r[0] + v[1] * CAM.r[1] + v[2] * CAM.r[2]) / dz, CAM.cy - CAM.F * (v[0] * CAM.u[0] + v[1] * CAM.u[1] + v[2] * CAM.u[2]) / dz, dz];
}
const depth = (x, y, z) => P(x, y, z)[2];
function poly(pts3) { g.beginPath(); pts3.forEach((p, i) => { const q = P(...p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); }
function line3(a, b) { const p = P(...a), q = P(...b); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
function circ3(x, y, z, r, n = 28) { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; pts.push([x + r * Math.cos(a), y, z + r * Math.sin(a)]); } poly(pts); }

// ---------- light state ----------
const revealFront = t => lerp(-24, 24, eo(seg(t, 1.0, T.revealEnd)));
const litAt = (t, x) => t < 1.0 ? 0 : clamp((revealFront(t) - x) / 7);
const house = t => lerp(lerp(1, 0.36, eio(seg(t, T.half, T.half + 1.5))), 0.24, eio(seg(t, T.show, T.show + 1.2)));
const fault = t => t >= T.fault && t < T.faultEnd;
const showK = t => eo(seg(t, T.show, T.show + 0.9));

// ---------- scene ----------
function drawStage(t) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const lift = g.createRadialGradient(W * .5, H * .18, 0, W * .5, H * .18, Math.max(W, H) * .8);
  lift.addColorStop(0, '#151822'); lift.addColorStop(1, 'rgba(21,24,34,0)'); g.fillStyle = lift; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W * .82, H * .14, 0, W * .82, H * .14, Math.max(W, H) * .55);
  glow.addColorStop(0, 'rgba(59,76,202,.07)'); glow.addColorStop(1, 'rgba(59,76,202,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
}
function vignette() {
  const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.hypot(W, H) * .62);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}

function drawFloor(t) {
  const hb = house(t);
  g.lineWidth = 1;
  for (let x = ROOM.x0; x <= ROOM.x1; x++) {        // lines along z
    const a = (x % 4 === 0 ? .11 : .05) * litAt(t, x) * (0.4 + 0.6 * hb); if (a < .003) continue;
    g.strokeStyle = rgba(C.ink, a); line3([x, 0, ROOM.z0], [x, 0, ROOM.z1]);
  }
  for (let z = ROOM.z0; z <= ROOM.z1; z++) {        // lines along x, cut in 2 m pieces so the reveal front reads
    for (let x = ROOM.x0; x < ROOM.x1; x += 2) {
      const a = (z % 4 === 0 ? .11 : .05) * litAt(t, x + 1) * (0.4 + 0.6 * hb); if (a < .003) continue;
      g.strokeStyle = rgba(C.ink, a); line3([x, 0, z], [x + 2, 0, z]);
    }
  }
  // room outline with two door gaps
  const segs = [[[ROOM.x0, ROOM.z0], [ROOM.x1, ROOM.z0]], [[ROOM.x1, ROOM.z0], [ROOM.x1, ROOM.z1]], [[ROOM.x0, ROOM.z1], [ROOM.x0, ROOM.z0]],
    [[ROOM.x0, ROOM.z1], [-5, ROOM.z1]], [[-3, ROOM.z1], [3, ROOM.z1]], [[5, ROOM.z1], [ROOM.x1, ROOM.z1]]];
  g.lineWidth = 1.5;
  for (const [a, b] of segs) { const k = litAt(t, (a[0] + b[0]) / 2); if (k < .01) continue; g.strokeStyle = rgba(C.ink, .5 * k * (0.5 + 0.5 * hb)); line3([a[0], 0, a[1]], [b[0], 0, b[1]]); }
  // door leaves: swing open at Q7
  const open = eo(seg(t, T.doors, T.doors + 0.5)) * 1.25;
  for (const d of DOORS) for (const s of [-1, 1]) {
    const hx = d + s, k = litAt(t, d); if (k < .01) continue;
    g.strokeStyle = rgba(C.ink, .45 * k); line3([hx, 0, ROOM.z1], [hx - s * Math.cos(open), 0, ROOM.z1 - Math.sin(open)]);
  }
  // back wall plane (only reads once the camera tilts)
  const tilt = seg(90 - CAM.pitch, 8, 40);
  if (tilt > 0) {
    g.fillStyle = rgba([255, 255, 255], .018 * tilt * hb); poly([[ROOM.x0, 0, ROOM.z0], [ROOM.x1, 0, ROOM.z0], [ROOM.x1, 8.5, ROOM.z0], [ROOM.x0, 8.5, ROOM.z0]]); g.fill();
    g.strokeStyle = rgba(C.ink, .12 * tilt * hb); g.lineWidth = 1; line3([ROOM.x0, 8.5, ROOM.z0], [ROOM.x1, 8.5, ROOM.z0]);
    line3([ROOM.x0, 0, ROOM.z0], [ROOM.x0, 8.5, ROOM.z0]); line3([ROOM.x1, 0, ROOM.z0], [ROOM.x1, 8.5, ROOM.z0]);
  }
  // plan labels: belong to the plan view, leave as the camera tilts
  const pl = (1 - seg(90 - CAM.pitch, 4, 22)) * litAt(t, 0);
  if (pl > .01) {
    g.font = `500 ${LAY.mono}px Mono`; g.fillStyle = rgba(C.lab, .9 * pl); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    let q = P(ROOM.x0 + .4, 0, ROOM.z0 - .5); g.fillText('BALLROOM A  ·  32.0 × 26.0 M', q[0], q[1]);
    q = P(ROOM.x1 - .4, 0, ROOM.z1 + 1.3); g.textAlign = 'right'; g.fillText('FOH ↓', q[0], q[1]);
    for (const d of DOORS) { q = P(d, 0, ROOM.z1 + 1.3); g.textAlign = 'center'; g.fillText('DOOR', q[0], q[1]); }
  }
}

function ledLevel(t, ci, ri) {
  if (t < 7.3) return 0;
  const on = t >= 7.3 + ci * 0.07 ? 1 : 0; if (!on) return 0;
  let b = .30 + .16 * Math.sin(ci * .55 - t * 1.4 + ri * .4) + .08 * Math.sin(ri * 1.3 + t * .7);
  const bb = t >= T.faultEnd && t < T.faultEnd + .25 ? (t >= T.faultEnd + ci * .016 ? 1 : 0) : 1;
  if (t >= T.show) { const R = (t - T.show) * 4.2, d = Math.hypot(ci - 6.5, (ri - 1.5) * 1.15); b = .22 + .75 * Math.exp(-((d - R % 9) ** 2) / 2.2) * (1 - .4 * seg(t, T.show + 4, T.show + 8)) + .1 * Math.sin(ci * .4 - t); b *= .7 + .3 * showK(t); }
  return clamp(b) * bb;
}
function drawWall(t) {
  const k = eo(seg(t, 7.0, 7.6)); if (k <= 0) return;
  const top = WALL.y0 + WALL.h * k, z = WALL.z, cw = (WALL.x1 - WALL.x0) / WALL.cols, rh = (top - WALL.y0) / WALL.rows;
  // structure
  g.fillStyle = rgba(C.s1, .95); poly([[WALL.x0 - .15, 0, z], [WALL.x1 + .15, 0, z], [WALL.x1 + .15, top + .1, z], [WALL.x0 - .15, top + .1, z]]); g.fill();
  const F = fault(t), fr = Math.floor(t * 24);
  for (let ci = 0; ci < WALL.cols; ci++) for (let ri = 0; ri < WALL.rows; ri++) {
    const x0 = WALL.x0 + ci * cw, y0 = WALL.y0 + ri * rh; let col, a;
    if (F) { const n = hash(ci * 31 + ri * 7 + fr * 13.1); const flash = t < T.fault + 2 / 24; col = n > .55 || flash ? C.red : [40, 12, 14]; a = flash ? .95 : (n > .55 ? .35 + .5 * n : .9); }
    else { const b = ledLevel(t, ci, ri); col = shade(C.led, b * 1.25); a = 1; }
    g.fillStyle = rgba(col, a); poly([[x0 + .03, y0 + .03, z], [x0 + cw - .03, y0 + .03, z], [x0 + cw - .03, y0 + rh - .03, z], [x0 + .03, y0 + rh - .03, z]]); g.fill();
  }
  g.strokeStyle = rgba(C.ink, .22); g.lineWidth = 1; poly([[WALL.x0, WALL.y0, z], [WALL.x1, WALL.y0, z], [WALL.x1, top, z], [WALL.x0, top, z]]); g.stroke();
}
function wallSpill(t) {
  if (t < 7.4) return;
  const F = fault(t), fr = Math.floor(t * 24), k = F ? (.10 + .08 * hash(fr * 3.7)) : .045 * (1 + 2.2 * showK(t)) * clamp((t - 7.4) / .8);
  const c = P(0, 0, -7.2), e = P(7, 0, -7.2), r = Math.max(30, Math.abs(e[0] - c[0]) * 1.3);
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], r); gr.addColorStop(0, rgba(F ? C.red : C.led, k)); gr.addColorStop(1, rgba(F ? C.red : C.led, 0));
  g.fillStyle = gr; g.fillRect(c[0] - r, c[1] - r, r * 2, r * 2); g.restore();
}

function drawStageDeck(t) {
  const k = back(seg(t, 3.0, 3.45), 1.4); if (seg(t, 3.0, 3.45) <= 0) return;
  const h = STAGE.h * k, b = Math.max(.35, house(t)) , wash = showK(t);
  const { x0, x1, z0, z1 } = STAGE;
  const ln = rgba(C.ink, .38 * Math.max(.5, b));
  g.lineWidth = 1;
  // sides first, then front, then top
  if (CAM.pos[0] > x1) { g.fillStyle = rgba(shade(C.s1, .9 * b + .2)); poly([[x1, 0, z0], [x1, 0, z1], [x1, h, z1], [x1, h, z0]]); g.fill(); g.strokeStyle = ln; g.stroke(); }
  if (CAM.pos[0] < x0) { g.fillStyle = rgba(shade(C.s1, .9 * b + .2)); poly([[x0, 0, z0], [x0, 0, z1], [x0, h, z1], [x0, h, z0]]); g.fill(); g.strokeStyle = ln; g.stroke(); }
  g.fillStyle = rgba(shade(C.s1, b + .1)); poly([[x0, 0, z1], [x1, 0, z1], [x1, h, z1], [x0, h, z1]]); g.fill(); g.strokeStyle = ln; g.stroke();
  g.fillStyle = rgba(mix3(shade(C.s2, b + .15), [70, 74, 92], wash * .8)); poly([[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]]); g.fill(); g.strokeStyle = ln; g.stroke();
  g.strokeStyle = rgba(C.ink, .6 * Math.max(.5, b)); line3([x0, h, z1], [x1, h, z1]);      // lip highlight
  // lectern
  const lx = 5.6, lz = -9.3, lh = 1.1 * k;
  g.fillStyle = rgba(shade(C.s2, b + .2)); poly([[lx - .35, h, lz + .25], [lx + .35, h, lz + .25], [lx + .35, h + lh, lz + .25], [lx - .35, h + lh, lz + .25]]); g.fill(); g.strokeStyle = ln; g.stroke();
  g.fillStyle = rgba(shade(C.s3, b + .25)); poly([[lx - .35, h + lh, lz - .25], [lx + .35, h + lh, lz - .25], [lx + .35, h + lh, lz + .25], [lx - .35, h + lh, lz + .25]]); g.fill(); g.stroke();
  // spike mark at centre stage
  g.strokeStyle = rgba(C.ink, .5 * Math.max(.4, b)); line3([-.35, h, -10], [.35, h, -10]); line3([0, h, -10.35], [0, h, -9.65]);
}

function drawRig(t) {
  const k = eo(seg(t, 9.0, 9.35)); if (k <= 0) return;
  const hb = Math.max(.45, house(t)), x = 10.2 * k, z = -8.6;
  g.strokeStyle = rgba(C.ink, .42 * hb); g.lineWidth = 1;
  line3([-x, 7.45, z], [x, 7.45, z]); line3([-x, 7.05, z], [x, 7.05, z]);
  g.strokeStyle = rgba(C.ink, .2 * hb);
  for (let s = -x; s < x - .01; s += .5) line3([s, 7.05, z], [s + .25, 7.45, z]), line3([s + .25, 7.45, z], [s + .5, 7.05, z]);
  for (const f of FIX) { if (Math.abs(f.x) > x) continue; const p = P(f.x, f.y, f.z), r = Math.max(2, CAM.F * .16 / p[2]);
    g.fillStyle = rgba(shade(C.s3, hb + .3)); g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fill(); g.strokeStyle = rgba(C.ink, .5 * hb); g.stroke(); }
}
function beamTarget(f, t) {
  const h = STAGE.h;
  if (t < 10.6) { const s = eio(seg(t, 9.0, 10.6)), w = Math.sin(Math.PI * s);
    return [f.x * (0.65 + .55 * w), w > .02 ? 0 : h, lerp(-9.6, 9.5, w) + Math.sin(f.i * 1.7) * 1.2 * w]; }
  const pre = [f.x * .62, h, -9.6], show = [f.x * .14 + .25 * Math.sin(t * .8 + f.i), h, -10 + .3 * Math.cos(t * .6 + f.i * 1.3)];
  const k = showK(t); return [lerp(pre[0], show[0], k), h, lerp(pre[2], show[2], k)];
}
function beamLevel(f, t) {
  if (t < 9.0 + f.i * 0.03125) return 0;
  const sweep = t < 10.6 ? .55 : lerp(.55, .2, seg(t, 10.6, 11.2));
  return lerp(sweep, .62, showK(t)) * (fault(t) ? 1 : 1);
}
function drawBeams(t) {
  if (t < 9.0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const f of FIX) {
    const a = beamLevel(f, t); if (a <= 0) continue;
    const tg = beamTarget(f, t), hp = P(f.x, f.y - .15, f.z), tp = P(...tg), rr = .95 + .3 * showK(t), rpx = CAM.F * rr / tp[2];
    const dx = tp[0] - hp[0], dy = tp[1] - hp[1], L = Math.hypot(dx, dy);
    if (L > 6) { const nx = -dy / L, ny = dx / L;
      const gr = g.createLinearGradient(hp[0], hp[1], tp[0], tp[1]); gr.addColorStop(0, rgba([235, 240, 255], .16 * a)); gr.addColorStop(1, rgba([235, 240, 255], .035 * a));
      g.fillStyle = gr; g.beginPath(); g.moveTo(hp[0] + nx * 2, hp[1] + ny * 2); g.lineTo(tp[0] + nx * rpx, tp[1] + ny * rpx); g.lineTo(tp[0] - nx * rpx, tp[1] - ny * rpx); g.lineTo(hp[0] - nx * 2, hp[1] - ny * 2); g.closePath(); g.fill(); }
    // pool on the surface
    const pts = []; for (let i = 0; i < 24; i++) { const an = i / 24 * Math.PI * 2; pts.push(P(tg[0] + rr * Math.cos(an), tg[1] + .01, tg[2] + rr * Math.sin(an))); }
    const cx = tp[0], cy = tp[1], R = Math.max(...pts.map(q => Math.hypot(q[0] - cx, q[1] - cy)));
    const pg = g.createRadialGradient(cx, cy, 0, cx, cy, R); pg.addColorStop(0, rgba([240, 244, 255], .34 * a)); pg.addColorStop(1, rgba([240, 244, 255], 0));
    g.fillStyle = pg; g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fill();
  }
  g.restore();
}

function drawCounters(t) {
  for (let i = 0; i < COUNTERS.length; i++) {
    const c = COUNTERS[i], k = back(seg(t, 11.0 + i * 0.0625, 11.4 + i * 0.0625), 1.3); if (seg(t, 11.0 + i * .0625, 11.4 + i * .0625) <= 0) continue;
    const hb = Math.max(.4, house(t)), h = 1.0 * k, w = .9, d = .3;
    g.fillStyle = rgba(shade(C.s1, hb + .15)); poly([[c.x - w, 0, c.z + d], [c.x + w, 0, c.z + d], [c.x + w, h, c.z + d], [c.x - w, h, c.z + d]]); g.fill();
    g.strokeStyle = rgba(C.ink, .35 * hb); g.lineWidth = 1; g.stroke();
    g.fillStyle = rgba(shade(C.s2, hb + .25)); poly([[c.x - w, h, c.z - d], [c.x + w, h, c.z - d], [c.x + w, h, c.z + d], [c.x - w, h, c.z + d]]); g.fill(); g.stroke();
    // check-in blink: the screen flashes when a guest is served
    let blink = 0; for (const gg of GST) { const dt = t - gg.tc; if (dt >= 0 && dt < .2 && Math.abs(gg.pts[1][0] - c.x) < .5) blink = Math.max(blink, 1 - dt / .2); }
    const q = P(c.x, h + .02, c.z), r = Math.max(1.5, CAM.F * .12 / q[2]);
    g.fillStyle = rgba(C.ink, .25 + .7 * blink); g.beginPath(); g.arc(q[0], q[1], r, 0, Math.PI * 2); g.fill();
  }
}

function drawTables(t, walkers) {
  const hb = house(t), items = [];
  for (const tb of TBL) {
    const t0 = tb.land - T.tableFly; if (t < t0) continue;
    const u = seg(t, t0, tb.land), from = [16.5, -3.5];
    const cxz = [lerp(from[0], tb.x, eo(u)) + Math.sin(Math.PI * u) * -2.2, lerp(from[1], tb.z, eio(u)) + Math.sin(Math.PI * u) * 1.6];
    const lift = Math.sin(Math.PI * u) * 1.4, sc = u < 1 ? lerp(.6, 1, u) : 1 + .08 * Math.exp(-(t - tb.land) * 14) * Math.sin((t - tb.land) * 60);
    items.push({ d: depth(cxz[0], .75, cxz[1]), draw: () => {
      const b = Math.max(.32, hb);
      // chairs
      for (let j = 0; j < 10; j++) {
        const s = SEATS[tb.k * 10 + j], cu = seg(t, tb.land + .04 + j * .018, tb.land + .2 + j * .018); if (cu <= 0) continue;
        const occ = seated(s, t), p = P(s.x, .45, s.z), r = Math.max(1.2, CAM.F * .2 * back(cu, 1.6) / p[2]);
        g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2);
        if (occ) { const pop = Math.exp(-(t - s.g.t1) * 8); g.fillStyle = rgba(mix3(C.guest, [255, 255, 255], pop), .9 * Math.max(.55, hb) + .1 * pop); g.fill(); }
        else { g.strokeStyle = rgba(C.ink, .3 * b); g.lineWidth = 1; g.stroke(); }
      }
      g.fillStyle = rgba(shade(C.s2, b + .2)); circ3(cxz[0], .75 + lift, cxz[1], .9 * sc); g.fill();
      g.strokeStyle = rgba(C.ink, .34 * b); g.lineWidth = 1; g.stroke();
      // centrepiece candle: glows once the house goes down
      const cp = P(cxz[0], .78 + lift, cxz[1]), glow = .25 + .75 * seg(t, T.half, T.show + 1);
      g.fillStyle = rgba([255, 255, 255], .35 + .5 * glow); g.beginPath(); g.arc(cp[0], cp[1], Math.max(1, CAM.F * .07 / cp[2]), 0, Math.PI * 2); g.fill();
      if (glow > .3) { g.save(); g.globalCompositeOperation = 'lighter'; const R = CAM.F * .9 / cp[2]; const gr = g.createRadialGradient(cp[0], cp[1], 0, cp[0], cp[1], R);
        gr.addColorStop(0, rgba([255, 250, 240], .12 * glow)); gr.addColorStop(1, rgba([255, 250, 240], 0)); g.fillStyle = gr; g.fillRect(cp[0] - R, cp[1] - R, 2 * R, 2 * R); g.restore(); }
    } });
  }
  for (const w of walkers) items.push(w);
  items.sort((a, b) => b.d - a.d).forEach(it => it.draw());
}
function walkers(t) {
  const out = [];
  for (const gg of GST) {
    if (t < gg.t0 || t >= gg.t1) continue;
    const [x, z] = guestPos(gg, t), [px, pz] = guestPos(gg, Math.max(gg.t0, t - .12));
    out.push({ d: depth(x, .5, z), draw: () => {
      const p = P(x, .5, z), q = P(px, .5, pz), r = Math.max(1.4, CAM.F * .19 / p[2]);
      g.strokeStyle = rgba(C.guest, .25); g.lineWidth = r; g.lineCap = 'round'; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(p[0], p[1]); g.stroke(); g.lineCap = 'butt';
      g.fillStyle = rgba(C.guest, .95); g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fill();
    } });
  }
  return out;
}
const checkedIn = t => GST.reduce((n, gg) => n + (t >= gg.tc ? 1 : 0), 0);

// ---------- clock ----------
function clockAt(t) {
  const keys = [[0, 18 * 3600 + 30 * 60], [T.doors, 19 * 3600], [T.half, 19 * 3600 + 28 * 60], [T.show, 19 * 3600 + 30 * 60], [DUR, 19 * 3600 + 30 * 60 + (DUR - T.show)]];
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const s = lerp(keys[i][1], keys[i + 1][1], clamp((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0])));
  const hh = Math.floor(s / 3600), mm = Math.floor(s / 60) % 60, ss2 = Math.floor(s) % 60;
  return [hh, mm, ss2].map(n => String(n).padStart(2, '0')).join(':');
}

// ---------- cue window ----------
function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const visibleCues = t => CUES.filter(c => c.insert === undefined || t >= c.insert);
function cueState(c, t) {
  if (c.insert !== undefined && t < c.sb) return 'fault';
  if (t < c.sb) return 'wait'; if (t < c.go) return 'standby'; if (t < c.go + .9) return 'go'; return 'done';
}
let DOT = null;   // screen position of the live cue dot (carried into the end card)
function panelGeom(t) {
  const L = LAY.panel;
  // opening: extreme close-up on the first cue row, whip out on GO
  const k = eo(seg(t, 1.0, 1.5)), rowY = L.y + L.rowsY + L.rowH * 1.5;
  const fr = L.x + L.w * LAY.ecuX, S = lerp(LAY.ecu, 1, k), fx = lerp(W / 2, fr, k), fy = lerp(H * LAY.ecuY, rowY, k);
  return { S, ox: fx - fr * S, oy: fy - rowY * S };
}
function drawPanel(t) {
  const L = LAY.panel, pg = panelGeom(t);
  // collapse (CRT-off) at the end
  const cy1 = ei(seg(t, T.collapse, T.collapse + .22)), cx1 = ei(seg(t, T.collapse + .2, T.collapse + .36));
  if (t >= T.collapse + .36) return;
  g.save(); g.translate(pg.ox, pg.oy); g.scale(pg.S, pg.S);
  if (cy1 > 0) { const ax = L.x + L.w / 2, ay = L.y + L.rowsY + L.rowH * 2.5; g.translate(ax, ay); g.scale(lerp(1, .02, cx1), lerp(1, .006, cy1)); g.translate(-ax, -ay); }
  // window
  g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
  rr(L.x, L.y, L.w, L.h, 16); g.fillStyle = rgba(C.s1, .94); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.moveTo(L.x + 16, L.y + 1.5); g.lineTo(L.x + L.w - 16, L.y + 1.5); g.stroke();
  // title bar
  const p = L.pad; g.textBaseline = 'middle';
  g.strokeStyle = rgba(C.ink2, .9); g.lineWidth = 1.5; g.beginPath(); g.arc(L.x + p + 7, L.y + 26, 6, 0, Math.PI * 2); g.stroke();
  g.font = `600 ${L.f.lab}px Mono`; g.fillStyle = rgba(C.ink2); g.textAlign = 'left'; spaced('SHOW CALL', L.x + p + 24, L.y + 26, .14);
  g.textAlign = 'right'; g.fillStyle = rgba(C.lab); spaced('GALA · BALLROOM A', L.x + L.w - p, L.y + 26, .12);
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(L.x, L.y + 52, L.w, 1);
  // clock + counts
  g.textAlign = 'left'; g.font = `500 ${L.f.lab}px Mono`; g.fillStyle = rgba(C.lab); spaced('TIME OF DAY', L.x + p, L.y + 84, .14);
  g.font = `600 ${L.f.clock}px InterTight`; g.fillStyle = rgba(C.ink); g.textBaseline = 'alphabetic'; g.fillText(clockAt(t), L.x + p - 2, L.y + 84 + L.f.clock * 1.02);
  g.textBaseline = 'middle'; g.font = `500 ${L.f.lab}px Mono`; g.textAlign = 'right';
  const cov = t >= 5.0 ? Math.min(240, Math.round(240 * seg(t, 5.3, 6.9))) : 0, ci = checkedIn(t);
  g.fillStyle = rgba(C.lab); spaced('COVERS', L.x + L.w - p, L.y + 84, .14); spaced('IN', L.x + L.w - p, L.y + 84 + L.f.clock * .72, .14);
  g.font = `500 ${L.f.count}px Mono`; g.fillStyle = rgba(cov ? C.ink : C.lab);
  g.fillText(String(cov).padStart(3, '0'), L.x + L.w - p - L.f.lab * 6.4, L.y + 84);
  g.fillStyle = rgba(ci ? C.ink : C.lab); g.fillText(String(ci).padStart(3, '0'), L.x + L.w - p - L.f.lab * 3.0, L.y + 84 + L.f.clock * .72);
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(L.x, L.y + L.rowsY - 10, L.w, 1);
  // rows
  const vis = visibleCues(t);
  let act = 0; vis.forEach((c, i) => { if (t >= c.sb || (c.insert !== undefined && t >= c.insert)) act = i; });
  // scroll: active row rests in slot 2; spring between
  const scroll = (() => { let s = 0, prev = 0; for (let i = 0; i < vis.length; i++) { const c = vis[i], when = c.insert ?? c.sb; const target = Math.max(0, i - 2); if (t >= when) { const u = seg(t, when, when + .35); s = lerp(prev, target, back(u, 1.2)); prev = target; } } return s; })();
  const top = L.y + L.rowsY, n = L.rowsN;
  g.save(); g.beginPath(); g.rect(L.x, top - 6, L.w, n * L.rowH + 6); g.clip();
  vis.forEach((c, i) => {
    let y = top + (i - scroll) * L.rowH;
    if (c.insert !== undefined) y += 0;
    const later = vis.slice(0, i).some(o => o.insert !== undefined) ? 0 : 0;
    if (y < top - L.rowH || y > top + n * L.rowH) return;
    const st = cueState(c, t), ins = c.insert !== undefined ? back(seg(t, c.insert, c.insert + .25), 1.4) : 1;
    const fadeEdge = clamp(1 - Math.max(0, (y - top - (n - 1.4) * L.rowH) / L.rowH)) * clamp(1 - Math.max(0, (top - y) / L.rowH * 1.6));
    g.globalAlpha = fadeEdge * clamp(ins);
    const ym = y + L.rowH / 2;
    if (st === 'go') { const k = Math.exp(-(t - c.go) * 3.2); rr(L.x + 8, y + 4, L.w - 16, L.rowH - 8, 10); g.fillStyle = rgba(C.acc, .16 * k + .04); g.fill(); }
    if (st === 'standby') { rr(L.x + 8, y + 4, L.w - 16, L.rowH - 8, 10); g.fillStyle = 'rgba(255,255,255,.035)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.07)'; g.stroke(); }
    if (st === 'fault') { const k = .5 + .5 * Math.sin(t * 28); rr(L.x + 8, y + 4, L.w - 16, L.rowH - 8, 10); g.fillStyle = rgba(C.red, .1 + .06 * k); g.fill(); g.strokeStyle = rgba(C.red, .5); g.stroke(); }
    g.textAlign = 'left'; g.font = `500 ${L.f.q}px Mono`; g.fillStyle = rgba(st === 'fault' ? C.red : st === 'wait' ? C.lab : st === 'done' ? C.lab : C.ink2);
    g.fillText(c.q, L.x + p + 26, ym);
    g.font = `500 ${L.f.name}px Inter`;
    g.fillStyle = rgba(st === 'wait' ? C.lab : st === 'done' ? C.ink2 : st === 'fault' ? C.red : C.ink);
    g.fillText(st === 'fault' ? 'LED · signal lost' : c.name, L.x + p + 26 + L.f.q * 3.4, ym);
    g.textAlign = 'right'; g.font = `600 ${L.f.st}px Mono`;
    const label = { wait: '', standby: 'STANDBY', go: 'GO', done: 'DONE', fault: 'FAULT' }[st];
    g.fillStyle = rgba(st === 'go' ? C.acc : st === 'fault' ? C.red : st === 'done' ? C.lab : C.ink2); spaced(label, L.x + L.w - p, ym, .16);
    // the cue dot (the only accent): hollow + blinking on standby, squash before GO, filled on GO
    const dx = L.x + p + 8, R = L.f.dot;
    if (st === 'standby' || st === 'go') {
      let sx = 1, sy = 1; const wu = seg(t, c.go - 8 / 24, c.go);
      if (st === 'standby') { sx = 1 + .35 * ei(wu); sy = 1 - .4 * ei(wu); }
      if (st === 'go') { const u = t - c.go; if (u < 2 / 24) { sx = 1.9; sy = .45; } else { const s2 = 1 + .35 * Math.exp(-u * 9) * Math.sin(u * 40); sx = s2; sy = 2 - s2; } }
      g.save(); g.translate(dx, ym); g.scale(sx, sy);
      if (st === 'go') { g.shadowColor = rgba(C.acc, .7); g.shadowBlur = 18; g.fillStyle = rgba(C.acc); g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill(); }
      else { const on = Math.floor((t - c.sb) / BEAT) % 2 === 0; g.strokeStyle = rgba(C.acc, on ? 1 : .35); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R - 1, 0, Math.PI * 2); g.stroke();
        if (on) { g.shadowColor = rgba(C.acc, .5); g.shadowBlur = 10; g.fillStyle = rgba(C.acc, .35); g.fill(); } }
      g.restore();
      if (i === act) DOT = [pg.ox + dx * pg.S, pg.oy + ym * pg.S];
    } else if (st === 'done') { g.fillStyle = rgba(C.lab, .8); g.beginPath(); g.arc(dx, ym, 2.5, 0, Math.PI * 2); g.fill(); }
    else if (st === 'fault') { g.fillStyle = rgba(C.red); g.font = `700 ${L.f.st}px Mono`; g.textAlign = 'center'; g.fillText('!', dx, ym); }
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(255,255,255,.045)'; g.fillRect(L.x + p, y + L.rowH - .5, L.w - 2 * p, 1);
  });
  g.restore();
  // after the last GO the live dot stays on the Show row
  const last = vis[vis.length - 1]; if (t >= last.go + .9) { const i = vis.length - 1, y = top + (i - scroll) * L.rowH + L.rowH / 2, dx = L.x + p + 8;
    g.save(); g.shadowColor = rgba(C.acc, .6); g.shadowBlur = 16; g.fillStyle = rgba(C.acc); g.beginPath(); g.arc(dx, y, L.f.dot, 0, Math.PI * 2); g.fill(); g.restore();
    DOT = [pg.ox + dx * pg.S, pg.oy + y * pg.S]; }
  g.restore();
}
function spaced(s, x, y, em) {   // letter-spaced text (canvas letterSpacing where available)
  if ('letterSpacing' in g) { g.letterSpacing = (em * parseFloat(g.font.split('px')[0].split(' ').pop())) + 'px'; g.fillText(s, x, y); g.letterSpacing = '0px'; return; }
  g.fillText(s, x, y);
}

// ---------- toasts ----------
function toastBox(o, t) {
  const fs = LAY.toast; g.font = `500 ${fs}px Inter`; const tw = g.measureText(o.text).width, w = tw + fs * 2.6, h = fs * 2.1;
  return { x: LAY.toastX - w / 2, y: LAY.toastY - h, w, h, fs, tw };
}
function drawToasts(t) {
  for (const o of TOASTS) {
    if (t < o.t0 || t > o.t1) continue;
    const kin = eo(seg(t, o.t0, o.t0 + .16)), kout = ei(seg(t, o.t1 - .16, o.t1));
    const b = toastBox(o, t), sx = 1 - .9 * kout;
    g.save(); g.translate(LAY.toastX, b.y + b.h / 2 + (1 - kin) * 12); g.scale(sx, 1 - .2 * kout); g.globalAlpha = kin * (1 - kout * .6);
    g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30; g.shadowOffsetY = 10;
    rr(-b.w / 2, -b.h / 2, b.w, b.h, b.h / 2); g.fillStyle = 'rgba(12,14,19,.82)'; g.fill(); g.shadowColor = 'transparent';
    g.strokeStyle = 'rgba(255,255,255,.09)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = rgba(C.acc); g.beginPath(); g.arc(-b.w / 2 + b.fs * .95, 0, 4.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = rgba(C.ink); g.font = `500 ${b.fs}px Inter`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(o.text, -b.w / 2 + b.fs * 1.6, 1);
    g.restore();
  }
}

// ---------- end card ----------
const MARKP = ['M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z', 'M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z', 'M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z'].map(s => new Path2D(s));
const LAVP = new Path2D('M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z');
const ARCMID = [[0, -1], [0, 1], [-1, 0]];
function drawEnd(t) {
  if (t < T.collapse) return;
  const E = LAY.end, sc = E.mark / 200;
  // the room keeps running; a veil brings it down behind the type
  const veil = eio(seg(t, T.collapse + .1, T.mark + 1.2));
  const vg = g.createRadialGradient(E.cx, E.cy, 0, E.cx, E.cy, Math.max(W, H) * .75); vg.addColorStop(0, `rgba(8,9,12,${.86 * veil})`); vg.addColorStop(1, `rgba(8,9,12,${.62 * veil})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // the dot flies from the cue window to the mark's lit arc
  const mx = E.mx, my = E.my, target = [mx + 93 * sc, my];
  const fly = seg(t, T.collapse + .36, T.mark + .55), from = DOT || [W / 2, H / 2];
  const form = seg(t, T.mark + .5, T.mark + .95);
  if (fly < 1 || form <= 0) {
    const u = back(fly, 1.25), ctrl = [lerp(from[0], target[0], .5), Math.min(from[1], target[1]) - H * .12];
    const x = (1 - u) ** 2 * from[0] + 2 * (1 - u) * u * ctrl[0] + u * u * target[0], y = (1 - u) ** 2 * from[1] + 2 * (1 - u) * u * ctrl[1] + u * u * target[1];
    g.save(); g.shadowColor = rgba(C.acc, .7); g.shadowBlur = 20; g.fillStyle = rgba(C.acc); g.beginPath(); g.arc(x, y, LAY.panel.f.dot * (1 + .3 * Math.sin(Math.PI * fly)), 0, Math.PI * 2); g.fill(); g.restore();
  }
  if (form > 0) {
    g.save(); g.translate(mx, my); g.scale(sc, sc);
    // lavender arc grows out of the dot, angularly from its midpoint
    const a = Math.PI * .26 * eo(form); g.save(); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 140, -a, a); g.closePath(); g.clip();
    const pulse = t > 39.0 ? Math.exp(-(t - 39.0) * 3) : 0;
    g.shadowColor = rgba(C.acc, .55 * (1 - eo(form)) + .5 * pulse); g.shadowBlur = 30; g.fillStyle = rgba(mix3(C.acc, C.lav, eo(form))); g.fill(LAVP); g.restore();
    // three white arcs draw on, one per sixteenth
    MARKP.forEach((p2, i) => { const k = eo(seg(t, T.mark + .62 + i * .125, T.mark + 1.0 + i * .125)); if (k <= 0) return;
      const mid = Math.atan2(ARCMID[i][1], ARCMID[i][0]), a2 = Math.PI * .26 * k;
      g.save(); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 140, mid - a2, mid + a2); g.closePath(); g.clip(); g.fillStyle = '#F6F4EF'; g.fill(p2); g.restore(); });
    g.restore();
  }
  // wordmark: light reveal left → right
  const wk = seg(t, T.mark + 1.1, T.mark + 2.2);
  if (wk > 0) {
    g.font = `800 ${E.word}px Manrope`; g.textBaseline = 'middle'; g.textAlign = 'left';
    const txt = 'PurpleHat Events', tw = g.measureText(txt).width, x0 = E.wx, front = x0 - 120 + (tw + 240) * eo(wk);
    const gr = g.createLinearGradient(front - 260, 0, front, 0);
    gr.addColorStop(0, rgba([242, 240, 247], 1)); gr.addColorStop(.8, rgba([255, 255, 255], 1)); gr.addColorStop(.92, rgba([255, 255, 255], .5)); gr.addColorStop(1, rgba([242, 240, 247], .05));
    g.fillStyle = gr; if ('letterSpacing' in g) g.letterSpacing = (-0.02 * E.word) + 'px'; g.fillText(txt, x0, E.wy); if ('letterSpacing' in g) g.letterSpacing = '0px';
  }
  const tk = eo(seg(t, T.mark + 1.9, T.mark + 2.06));
  if (tk > 0) {
    g.globalAlpha = tk; g.font = `400 ${E.tag}px Inter`; g.fillStyle = rgba(C.ink2); g.textAlign = E.align; g.textBaseline = 'alphabetic';
    g.fillText('We call the show.', E.tx, E.ty + (1 - tk) * 10);
    g.font = `500 ${E.svc}px Mono`; g.fillStyle = rgba(C.lab); spaced('EVENTS · CONFERENCES · MICE · EXPERIENCES', E.tx, E.sy + (1 - tk) * 10, .14);
    g.globalAlpha = 1;
  }
}

// ---------- layout ----------
function layout() {
  V = H > W;
  if (!V) LAY = {
    F: 1640, cx: 700, cy: 560, ecu: 2.2, ecuX: .42, ecuY: .5, mono: 13,
    panel: { x: 1352, y: 118, w: 500, h: 846, pad: 26, rowsY: 210, rowH: 74, rowsN: 8, f: { lab: 13, clock: 64, count: 22, q: 15, name: 25, st: 14, dot: 7 } },
    toast: 38, toastX: 690, toastY: 1000,
    end: { cx: 960, cy: 540, mark: 150, mx: 600, my: 540, wx: 720, wy: 510, word: 84, tag: 34, tx: 723, ty: 600, svc: 15, sy: 652, align: 'left' },
  };
  else LAY = {
    F: 1360, cx: 540, cy: 640, ecu: 1.6, ecuX: .36, ecuY: .45, mono: 15,
    panel: { x: 70, y: 1180, w: 940, h: 660, pad: 34, rowsY: 210, rowH: 76, rowsN: 5, f: { lab: 16, clock: 72, count: 26, q: 18, name: 30, st: 17, dot: 8 } },
    toast: 40, toastX: 540, toastY: 1110,
    end: { cx: 540, cy: 900, mark: 190, mx: 540, my: 800, wx: 540, wy: 1000, word: 88, tag: 40, tx: 540, ty: 1090, svc: 18, sy: 1150, align: 'center' },
  };
  if (V) { LAY.end.wx = null; }
}

export function render(t) {
  t = clamp(t, 0, DUR);
  camera(t);
  drawStage(t);
  drawFloor(t);
  wallSpill(t);
  drawWall(t);
  drawStageDeck(t);
  drawCounters(t);
  drawTables(t, walkers(t));
  drawBeams(t);
  drawRig(t);
  vignette();
  drawPanel(t);
  drawToasts(t);
  if (V && LAY.end.wx === null) { g.font = `800 ${LAY.end.word}px Manrope`; LAY.end.wx = 540 - g.measureText('PurpleHat Events').width / 2 - 2; }
  drawEnd(t);
}

export function texts(t) {
  const out = [];
  for (const o of TOASTS) if (t >= o.t0 + .16 && t <= o.t1 - .16) { const b = toastBox(o, t); out.push({ id: o.id, text: o.text, x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h }); }
  const E = LAY.end;
  if (t >= T.mark + 2.2) out.push({ id: 'word', text: 'PurpleHat Events', x0: 0, y0: E.wy - 40, x1: W - 1, y1: E.wy + 40 });
  if (t >= T.mark + 2.06) { out.push({ id: 'tag', text: 'We call the show.', x0: 0, y0: E.ty - 40, x1: W - 1, y1: E.ty + 4 }); out.push({ id: 'svc', text: 'EVENTS · CONFERENCES · MICE · EXPERIENCES', x0: 0, y0: E.sy - 20, x1: W - 1, y1: E.sy + 4 }); }
  return out;
}

export function events() {
  const EV = [];
  for (const c of CUES) { EV.push({ t: c.sb, type: 'standby', q: c.q }); EV.push({ t: c.go, type: 'go', q: c.q }); }
  EV.push({ t: 1.0, type: 'whip' });
  for (const tb of TBL) EV.push({ t: tb.land, type: 'land', i: tb.i });
  for (let i = 0; i < 4; i++) EV.push({ t: 11.0 + i * .0625 + .3, type: 'counter', i });
  EV.push({ t: 3.0, type: 'stage' }, { t: 7.0, type: 'wall' }, { t: 9.0, type: 'rig' }, { t: T.doors, type: 'doors' });
  for (const gg of GST) EV.push({ t: gg.tc, type: 'checkin', x: gg.pts[1][0] / 16 });
  for (const gg of GST) EV.push({ t: gg.t1, type: 'seat', x: gg.s.x / 16 });
  EV.push({ t: T.fault, type: 'fault' }, { t: T.faultEnd, type: 'bfeed' }, { t: T.half, type: 'half' }, { t: T.show, type: 'show' });
  for (const o of TOASTS) EV.push({ t: o.t0, type: 'toast', id: o.id }, { t: o.t1 - .16, type: 'toastout', id: o.id });
  EV.push({ t: T.collapse, type: 'collapse' }, { t: T.collapse + .36, type: 'fly' }, { t: T.mark + .5, type: 'mark' }, { t: T.mark + 1.1, type: 'sweep' }, { t: 39.0, type: 'bell' });
  return EV.sort((a, b) => a.t - b.t);
}

export function setup(canvas) {
  cv = canvas; W = innerWidth; H = innerHeight; cv.width = W; cv.height = H; g = cv.getContext('2d');
  layout();
  window.DUR = DUR; window.render = render; window.TEXTS = texts; window.EV = events();
  render(0);
}
