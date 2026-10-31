// Motion helpers: easing curves, analytic springs, squash/stretch impulses.
// Everything is a pure function of time (no state), so render(t) stays deterministic.
export const PI = Math.PI, TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const mix2 = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];

// cubic-bezier(x1,y1,x2,y2) like CSS, tabulated once for speed.
export function bezier(x1, y1, x2, y2) {
  const N = 2048, lut = new Float32Array(N + 1);
  const bx = t => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  const by = t => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  for (let i = 0; i <= N; i++) {
    const x = i / N; let lo = 0, hi = 1;
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (bx(m) < x) lo = m; else hi = m; }
    lut[i] = by((lo + hi) / 2);
  }
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; const f = x * N, i = f | 0, r = f - i; return lut[i] + (lut[i + 1] - lut[i]) * r; };
}
// Material-style curves
export const emph = bezier(0.2, 0.0, 0.0, 1.0);      // emphasized
export const decel = bezier(0.05, 0.7, 0.1, 1.0);    // emphasized decelerate (enter)
export const accel = bezier(0.3, 0.0, 0.8, 0.15);    // emphasized accelerate (exit)
export const inout = bezier(0.65, 0.0, 0.35, 1.0);   // symmetric
export const outq = bezier(0.0, 0.0, 0.2, 1.0);      // standard decel
export const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const bump = t => (t <= 0 || t >= 1 ? 0 : Math.sin(PI * t));        // 0→1→0
export const bump2 = t => { const b = bump(t); return b * b; };

// Damped spring step response 0→1. f = natural frequency (Hz), z = damping ratio,
// v0 = initial velocity in "targets per second" (lets a move launch fast, like a shot).
export function spring(t, f = 2.2, z = 0.5, v0 = 0) {
  if (t <= 0) return 0;
  const w = TAU * f;
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z), e = Math.exp(-z * w * t);
    return 1 - e * (Math.cos(wd * t) + ((z * w - v0) / wd) * Math.sin(wd * t));
  }
  const e = Math.exp(-w * t); return 1 - e * (1 + (w - v0) * t);
}
// Impulse response of a damped oscillator: 0 at t=0, quick peak, ringing decay. Used for squash.
export function wobble(t, f = 5, z = 0.4) {
  if (t <= 0) return 0;
  const w = TAU * f, wd = w * Math.sqrt(1 - z * z);
  return Math.exp(-z * w * t) * Math.sin(wd * t) / Math.exp(-z * w * (Math.atan(Math.sqrt(1 - z * z) / z) / wd)) / Math.sin(Math.atan(Math.sqrt(1 - z * z) / z));
}
// Sum of tweens: v(t) = v0 + Σ (vk - vk-1) * ease((t-a)/(b-a))
export function tweens(v0, list) {
  return t => { let v = v0, prev = v0; for (const [a, b, val, e] of list) { v += (val - prev) * (e || inout)(seg(t, a, b)); prev = val; } return v; };
}
export function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function mixCol(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b); t = clamp(t);
  return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
}
export function rgba(h, a) { const c = hexToRgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
// deterministic hash noise
export const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
