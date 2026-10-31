import { openDemo, closeServer } from '/home/user/lemomo-ai/lemo-opuscar/core/render/page.mjs';
const [dir, size] = process.argv.slice(2); const [w, h] = (size || '1920x1080').split('x').map(Number);
const { browser, page } = await openDemo(dir, { w, h, q: 't=37' });
const ts = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];
for (const t of ts) {
  const ms = await page.evaluate(t => { window.render(t); const a = performance.now(); for (let i = 0; i < 4; i++) window.render(t + i * .05); return (performance.now() - a) / 4; }, t);
  console.log(t, ms.toFixed(0) + 'ms');
}
await browser.close(); closeServer();
