import { openDemo, closeServer } from '/home/user/lemomo-ai/lemo-opuscar/core/render/page.mjs';
const [dir, t] = process.argv.slice(2);
const { browser, page } = await openDemo(dir, { w: 1920, h: 1080 });
const r = await page.evaluate(t => { window.render(t); globalThis.__wc = {}; const a = performance.now(); window.render(t + .01); document.getElementById('c').getContext('2d').getImageData(0,0,1,1); return [performance.now() - a, globalThis.__wc]; }, +t);
console.log(JSON.stringify(r)); await browser.close(); closeServer();
