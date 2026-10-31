import { openDemo, closeServer } from '/home/user/lemomo-ai/lemo-opuscar/core/render/page.mjs';
const [dir, a, b, w, h] = process.argv.slice(2);
const { browser, page } = await openDemo(dir, { w: +w, h: +h });
for (let f = Math.round(+a * 24); f < +b * 24; f++) {
  const r = await page.evaluate(async t => { try { await window.render(t); return null; } catch (e) { return e.stack; } }, f / 24);
  if (r) { console.log('t=' + (f / 24).toFixed(4) + '\n' + r); break; }
}
await browser.close(); closeServer?.(); process.exit(0);
