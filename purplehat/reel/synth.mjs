// PurpleHat reel soundtrack: oscillators and filtered noise only, every sound on a visual event.
import fs from 'fs';
const SR = 48000, DUR = 24, N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
const busPad = [new Float32Array(N), new Float32Array(N)], busBass = new Float32Array(N), busSend = [new Float32Array(N), new Float32Array(N)];
let seed = 12345; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const idx = (t) => Math.round(t * SR);
function biquad(type, f, q = 0.707) {
  const w = 2 * Math.PI * f / SR, a = Math.sin(w) / (2 * q), c = Math.cos(w); let b0, b1, b2, a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
  if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; } else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; } else { b0 = a; b1 = 0; b2 = -a; }
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
}
function bq(s, x) { const y = s.b0 * x + s.b1 * s.x1 + s.b2 * s.x2 - s.a1 * s.y1 - s.a2 * s.y2; s.x2 = s.x1; s.x1 = x; s.y2 = s.y1; s.y1 = y; return y; }
function put(i, v, pan = 0, send = 0) { if (i < 0 || i >= N) return; const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4); L[i] += v * gl; R[i] += v * gr; if (send) { busSend[0][i] += v * gl * send; busSend[1][i] += v * gr * send; } }

const KICKS = [];
function kick(t, g = 1, long = false) {
  KICKS.push(t); const n = idx(long ? 1.6 : 0.42); let ph = 0;
  for (let i = 0; i < n; i++) { const s = i / SR, f = (long ? 40 : 46) + 120 * Math.exp(-s * 30); ph += 2 * Math.PI * f / SR; const env = Math.exp(-s * (long ? 2.6 : 8)) * Math.min(1, s * 800); put(idx(t) + i, Math.sin(ph) * env * g * 0.9 + (s < 0.004 ? rnd() * 0.25 * g * (1 - s / 0.004) : 0)); }
}
function hat(t, g = 1, open = false) { const h = biquad('hp', 7500), n = idx(open ? 0.25 : 0.06); for (let i = 0; i < n; i++) { const s = i / SR; put(idx(t) + i, bq(h, rnd()) * Math.exp(-s * (open ? 14 : 60)) * 0.16 * g, 0.25); } }
function clap(t, g = 1) { const b = biquad('bp', 1400, 1.2); const n = idx(0.3); for (let i = 0; i < n; i++) { const s = i / SR; const env = (s < 0.03 ? (Math.exp(-((s % 0.01) * 300))) : Math.exp(-(s - 0.03) * 18)); put(idx(t) + i, bq(b, rnd()) * env * 0.5 * g, -0.1, 0.35); } }
function crash(t, g = 1, d = 1.8) { const h = biquad('hp', 4200), n = idx(d); for (let i = 0; i < n; i++) { const s = i / SR; const v = bq(h, rnd()) * Math.exp(-s * 3.2) * 0.13 * g; put(idx(t) + i, v, Math.sin(i * 0.0007) * 0.4, 0.3); } }
function whoosh(t0, dur, g = 1, panFrom = 0.8, panTo = -0.8, f0 = 300, f1 = 5000) {
  const n = idx(dur); const b = biquad('bp', f0, 1.4);
  for (let i = 0; i < n; i++) { const u = i / n; if (i % 64 === 0) { const nb = biquad('bp', f0 * Math.pow(f1 / f0, Math.sin(u * Math.PI / 2)), 1.4); b.b0 = nb.b0; b.b1 = nb.b1; b.b2 = nb.b2; b.a1 = nb.a1; b.a2 = nb.a2; } const env = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 2); put(idx(t0) + i, bq(b, rnd()) * env * 0.55 * g, panFrom + (panTo - panFrom) * u, 0.15); }
}
function riser(t0, t1, g = 1) {
  const n = idx(t1 - t0), b = biquad('bp', 200, 2); let ph = 0;
  for (let i = 0; i < n; i++) { const u = i / n; if (i % 64 === 0) { const nb = biquad('bp', 200 * Math.pow(40, u * u), 2); Object.assign(b, { b0: nb.b0, b1: nb.b1, b2: nb.b2, a1: nb.a1, a2: nb.a2 }); } ph += 2 * Math.PI * (110 * Math.pow(8, u * u)) / SR; const env = Math.pow(u, 2.2); put(idx(t0) + i, (bq(b, rnd()) * 0.5 + Math.sin(ph) * 0.05) * env * g, Math.sin(u * 9) * 0.3, 0.2); }
}
function blip(t, m, g = 1, pan = 0) { const n = idx(0.18), f = mtof(m); for (let i = 0; i < n; i++) { const s = i / SR; put(idx(t) + i, (Math.sin(2 * Math.PI * f * s) + 0.3 * Math.sin(4 * Math.PI * f * s)) * Math.exp(-s * 28) * Math.min(1, s * 2000) * 0.16 * g, pan, 0.5); } }
function tick(t, g = 1) { const h = biquad('bp', 3200, 3); for (let i = 0; i < idx(0.02); i++) put(idx(t) + i, bq(h, rnd()) * Math.exp(-i / SR * 300) * 0.5 * g, 0.2, 0.2); }
function bell(t, m, g = 1, pan = 0) { const n = idx(3.2), f = mtof(m); for (let i = 0; i < n; i++) { const s = i / SR; const v = Math.sin(2 * Math.PI * f * s) * Math.exp(-s * 1.4) + 0.45 * Math.sin(2 * Math.PI * f * 2.76 * s) * Math.exp(-s * 3) + 0.2 * Math.sin(2 * Math.PI * f * 5.4 * s) * Math.exp(-s * 6); put(idx(t) + i, v * 0.085 * g * Math.min(1, s * 400), pan, 0.6); } }
function pad(t0, t1, notes, g = 1, lp = 1400) {
  const n = idx(t1 - t0); const fl = [biquad('lp', lp, 0.8), biquad('lp', lp, 0.8)];
  const voices = notes.flatMap((m, k) => [-7, 0, 7].map((c, j) => ({ f: mtof(m) * Math.pow(2, c / 1200), ph: (k * 0.37 + j * 0.21) % 1, side: j === 0 ? 0 : j === 1 ? 0.5 : 1 })));
  for (let i = 0; i < n; i++) {
    const s = i / SR, env = Math.min(1, s / 0.35) * Math.min(1, (t1 - t0 - s) / 0.4); let l = 0, r = 0;
    for (const v of voices) { v.ph += v.f / SR; v.ph -= Math.floor(v.ph); const x = 2 * v.ph - 1; l += x * (1 - v.side); r += x * v.side; }
    const k = idx(t0) + i; if (k >= N) break; busPad[0][k] += bq(fl[0], l) * env * 0.035 * g; busPad[1][k] += bq(fl[1], r) * env * 0.035 * g;
  }
}
function bass(t, m, d = 0.22, g = 1) { const n = idx(d), f = mtof(m), fl = biquad('lp', 520, 1.1); let ph = 0; for (let i = 0; i < n; i++) { const s = i / SR; ph += f / SR; ph -= Math.floor(ph); const x = (2 * ph - 1) * 0.6 + Math.sin(2 * Math.PI * ph) * 0.8; const k = idx(t) + i; if (k < N) busBass[k] += bq(fl, x) * Math.exp(-s * 6) * Math.min(1, s * 600) * 0.32 * g; } }

// ---------- score ----------
const B = 0.5;
// intro
pad(0, 4.0, [50, 57, 60, 64, 69], 0.8, 900);           // Dm9 colour, filtered
[0.1, 0.2, 0.3].forEach((t, i) => whoosh(t, 0.9, 0.35, [-0.6, 0, 0.4][i], [0.3, 0, -0.3][i], 400, 2200));
riser(0.7, 2.0, 0.5); whoosh(1.55, 0.5, 0.8, 0.9, 0, 500, 6000);
kick(2.0, 1.1, true); crash(2.0, 1.0); bell(2.0, 74, 0.8, -0.2); bell(2.02, 81, 0.5, 0.3);
riser(2.45, 4.0, 1.0); whoosh(3.3, 0.75, 0.6, -0.4, 0.4, 300, 7000);
kick(4.0, 1.2, true); crash(4.0, 1.1);
// groove, bars from 4 s; progression Dm – Bb – F – C
const CH = [[50, 53, 57, 60, 64], [46, 50, 53, 57, 62], [41, 48, 53, 57, 64], [48, 52, 55, 60, 62]];
const ROOT = [38, 34, 41, 36];
for (let bar = 0; bar < 8; bar++) {
  const t0 = 4 + bar * 2, c = bar % 4; pad(t0, t0 + 2.02, CH[c].map((m) => m + 12), 1, 1600 + bar * 120);
  for (let b = 0; b < 4; b++) {
    const t = t0 + b * B; if (!(bar === 0 && b === 0)) kick(t, 0.95);
    hat(t + B / 2, 1, b === 3 && bar % 2 === 1); if (bar > 0) hat(t + B / 4, 0.35); if (bar > 0) hat(t + 3 * B / 4, 0.35);
    if (b === 1 || b === 3) clap(t, bar === 0 ? 0.6 : 0.9);
    bass(t + B / 2, ROOT[c] + (b === 3 ? 12 : 0)); if (bar > 1) bass(t + B * 0.75, ROOT[c], 0.12, 0.6);
  }
}
// "Stitched" — a running stitch of ticks under the word
for (let i = 0; i < 12; i++) tick(5.15 + i * 0.058, 0.7);
bell(5.0, 69, 0.6, -0.3);
// wipes right → left, accent on landing
for (const b of [6, 8, 10, 12, 14, 16, 18, 20]) { whoosh(b - 0.36, 0.6, 0.9, 0.85, -0.85, 350, 6500); if (b < 20) crash(b, 0.45, 1.0); }
// scene sounds
[0, 0.42, 0.84, 1.26].forEach((d, i) => blip(8 + d, 79 + i * 5, 0.9, 0.3));             // pixels resolve
for (let r = 0; r < 13; r++) tick(10 + 0.08 + r * 0.045, 0.35);                          // seats fill
for (let i = 0; i < 14; i++) blip(12 + 0.06 + i * 0.045 + 0.85, 86 + (i % 3) * 3, 0.25, (i % 2 ? 0.5 : -0.5)); // arrivals
const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const inv = (y) => { let a = 0, b = 1; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; io(m) < y ? (a = m) : (b = m); } return a; };
for (let i = 0; i < 6; i++) blip(18 + 0.3 + 1.3 * inv(i / 5) + 0.05, [74, 76, 77, 79, 81, 86][i], 0.9, 0.35);   // run-of-show ticks
// outro: drop the beat, rise, land
riser(20.2, 21.0, 0.8); whoosh(20.55, 0.45, 0.8, 0.9, 0, 500, 6000);
kick(21.0, 1.2, true); crash(21.0, 1.0, 2.4);
pad(21.0, 24.0, [50, 54, 57, 62, 66, 69], 1.2, 2200);
bell(21.0, 74, 1, -0.25); bell(21.04, 78, 0.8, 0.25); bell(21.08, 81, 0.7, 0); bell(22.0, 86, 0.35, 0.4);

// ---------- mix ----------
const duck = new Float32Array(N); for (let i = 0; i < N; i++) { const t = i / SR; let d = 0; for (const k of KICKS) if (t >= k && t - k < 0.4) d = Math.max(d, Math.exp(-(t - k) / 0.11)); duck[i] = 1 - 0.65 * d; }
for (let i = 0; i < N; i++) { L[i] += (busPad[0][i] + busBass[i]) * duck[i]; R[i] += (busPad[1][i] + busBass[i]) * duck[i]; busSend[0][i] += busPad[0][i] * 0.4; busSend[1][i] += busPad[1][i] * 0.4; }
// small Schroeder reverb on the send bus
function reverb(inp, sp) {
  const out = new Float32Array(N), combs = [1557, 1617, 1491, 1422].map((d) => ({ d: Math.round((d + sp) * SR / 44100), b: null, i: 0, f: 0 })), aps = [556, 441].map((d) => ({ d: Math.round((d + sp) * SR / 44100), b: null, i: 0 }));
  for (const c of combs) c.b = new Float32Array(c.d); for (const a of aps) a.b = new Float32Array(a.d);
  for (let n = 0; n < N; n++) { let s = 0; for (const c of combs) { const y = c.b[c.i]; c.f = y * 0.6 + c.f * 0.4; c.b[c.i] = inp[n] * 0.3 + c.f * 0.82; c.i = (c.i + 1) % c.d; s += y; } for (const a of aps) { const y = a.b[a.i]; a.b[a.i] = s + y * 0.5; s = y - s * 0.5; a.i = (a.i + 1) % a.d; } out[n] = s; }
  return out;
}
const rvL = reverb(busSend[0], 0), rvR = reverb(busSend[1], 23);
let peak = 0; const outL = new Float32Array(N), outR = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const fadeOut = Math.min(1, (N - i) / (SR * 1.2));
  outL[i] = Math.tanh((L[i] + rvL[i] * 0.22) * 1.1) * fadeOut; outR[i] = Math.tanh((R[i] + rvR[i] * 0.22) * 1.1) * fadeOut;
  peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
}
const gain = 0.89 / peak, buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outL[i] * gain)) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outR[i] * gain)) * 32767), 46 + i * 4); }
fs.writeFileSync('score.wav', buf); console.log('peak', peak.toFixed(3), 'gain', gain.toFixed(3));
