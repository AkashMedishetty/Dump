import fs from 'fs';
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [page, fmt, out, spec] = process.argv.slice(2);
const [W, H] = fmt === '9x16' ? [1080, 1920] : [1920, 1080];
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: W, height: H } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('file://' + process.cwd() + '/' + page); await p.evaluate(() => window.READY); await p.waitForTimeout(150);
const total = await p.evaluate(() => window.TOTAL);
let list; if (spec && spec.endsWith('s')) list = spec.slice(0, -1).split(',').map((s) => Math.round(+s * 30)); else if (spec) { const [a, c] = spec.split('-').map(Number); list = Array.from({ length: Math.min(c, total - 1) - a + 1 }, (_, i) => a + i); } else list = [...Array(total).keys()];
for (const f of list) { await p.evaluate((f) => window.frame(f), f); await p.screenshot({ path: `${out}/${String(f).padStart(4, '0')}.png`, clip: { x: 0, y: 0, width: W, height: H } }); }
console.log(page, list.length, 'errors:', errs.length ? errs : 'none'); await b.close();
