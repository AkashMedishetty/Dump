import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage();
p.on('pageerror', (e) => console.log('PAGEERROR', e.message)); p.on('console', (m) => console.log('CONSOLE', m.type(), m.text()));
await p.goto('file://' + process.cwd() + '/reel-9x16.html'); await p.waitForTimeout(800);
console.log(await p.evaluate(() => typeof window.frame + ' ' + typeof window.PH));
await b.close();
