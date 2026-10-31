import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [file, out, ...ts] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 1100 }, deviceScaleFactor: 2 });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('file://' + process.cwd() + '/' + file); await p.waitForTimeout(400); await p.evaluate(() => { window.PH_HOLD = true; }); await p.waitForTimeout(150);
await p.evaluate(() => { window.PH_HOLD = true; });
for (const t of ts) { await p.evaluate((t) => window.PH.render(+t), t); await p.locator('.iso-plate').screenshot({ path: `${out}-${t}.png` }); }
console.log('errors:', errs.length ? errs : 'none'); await b.close();
