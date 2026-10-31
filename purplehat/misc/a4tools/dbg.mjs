import { openDemo, closeServer } from '/home/user/lemomo-ai/lemo-opuscar/core/render/page.mjs';
const { browser, page } = await openDemo(process.argv[2], { w: 1920, h: 1080 });
console.log(JSON.stringify(await page.evaluate(async () => { const src = [...document.scripts].map(s => s.textContent).join(''); const m = await import(new URL('styles3.js', location.href).href); return m.__dbg(); })));
await browser.close(); closeServer();
