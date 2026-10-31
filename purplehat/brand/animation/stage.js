/* PurpleHat Events — animation stage (classic script; needs ../code/phe-logo.global.js first).
 *
 * Every scene page is deterministic: window.render(t) draws the frame at t seconds, nothing depends on wall time.
 *   ?w=1920&h=1080      frame size in px (default 1920x1080)
 *   ?bg=light|dark|transparent|transparent-light
 *   ?capture            no playback loop (the renderer calls window.render(t) frame by frame)
 *   ?t=2.5              freeze on a frame
 * Exposes window.DURATION, window.CUES (sound/sync cues), window.FPS.
 * Live mode listens for postMessage {phe: 'play'|'pause'|'seek', t} and posts {phe: 'time', t, loop}.
 */
(function () {
  const Q = new URLSearchParams(location.search);
  const W = +Q.get('w') || 1920, H = +Q.get('h') || 1080, CAPTURE = Q.has('capture');
  const C = PheLogo.COLORS;
  const THEMES = {
    light: { bg: C.neutral, fg: C.primary, dot: C.accent, alt: C.neutral },
    dark: { bg: C.primary, fg: C.neutral, dot: C.accent, alt: C.primary },
    transparent: { bg: null, fg: C.primary, dot: C.accent, alt: C.neutral },
    'transparent-light': { bg: null, fg: C.neutral, dot: C.neutral, alt: C.primary },
  };
  const theme = THEMES[Q.get('bg') || 'light'] || THEMES.light;
  if (Q.get('dots') === 'mono') theme.dot = theme.fg;

  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  document.documentElement.style.background = 'transparent';
  document.body.style.cssText = 'margin:0;overflow:hidden;background:' + (CAPTURE ? 'transparent' : theme.bg || '#888');
  cv.style.cssText = 'display:block;' + (CAPTURE ? '' : 'width:100vw;height:100vh;object-fit:contain;');
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');

  /** lockup placement: centred, sized by aspect ratio. Returns px-per-unit scale and the viewBox origin in px. */
  function place(layout) {
    const vb = PheLogo.viewBox(layout), a = W / H;
    const frac = a > 1.3 ? 0.40 : a < 0.8 ? 0.70 : 0.60;
    const scale = Math.min((W * frac) / vb[2], (H * 0.5) / vb[3]);
    const x = (W - vb[2] * scale) / 2 - vb[0] * scale, y = (H - vb[3] * scale) / 2 - vb[1] * scale;
    return { scale, x, y, vb,
      top: -y / scale, left: -x / scale, right: (W - x) / scale, bottom: (H - y) / scale }; // frame edges in logo units
  }

  const Stage = { W, H, theme, ctx, canvas: cv, place, capture: CAPTURE };
  Stage.define = function (scene) {
    window.DURATION = scene.duration; window.FPS = 30; window.CUES = scene.cues || [];
    window.render = function (t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (theme.bg) { ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, W, H); }
      scene.draw(ctx, t, theme);
    };
    if (Q.has('t')) { window.render(+Q.get('t')); return; }
    if (CAPTURE) { window.render(0); return; }
    // live playback: loop with a short hold on the last frame
    const hold = scene.loop ? 0 : 1.2, period = scene.duration + hold;
    let playing = true, t = 0, last = null, loopN = 0;
    addEventListener('message', (e) => {
      const m = e.data || {};
      if (m.phe === 'play') playing = true;
      if (m.phe === 'pause') playing = false;
      if (m.phe === 'seek') { t = Math.max(0, Math.min(period, +m.t)); window.render(Math.min(t, scene.duration)); }
      if (m.phe === 'restart') { t = 0; playing = true; }
    });
    const tick = (now) => {
      if (last !== null && playing) {
        t += (now - last) / 1000;
        if (t >= period) { t -= period; loopN++; parent !== window && parent.postMessage({ phe: 'loop', n: loopN }, '*'); }
      }
      last = now;
      window.render(Math.min(t, scene.duration));
      if (parent !== window) parent.postMessage({ phe: 'time', t, duration: scene.duration }, '*');
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  window.Stage = Stage;
})();
