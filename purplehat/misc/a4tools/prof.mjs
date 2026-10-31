import { openDemo, closeServer } from '/home/user/lemomo-ai/lemo-opuscar/core/render/page.mjs';
const [dir, size, ...ts] = process.argv.slice(2); const [w, h] = size.split('x').map(Number);
const { browser, page } = await openDemo(dir, { w, h });
for (const t of ts) {
  const r = await page.evaluate(t => { window.render(t); const a = performance.now(); for (let i = 0; i < 3; i++) window.render(t + i * 0.04); const b = performance.now(); const c = document.getElementById('c').getContext('2d'); c.getImageData(0,0,1,1); return ((performance.now() - a) / 3).toFixed(0); }, +t);
  console.log(t, r + 'ms');
}
await browser.close(); closeServer();
