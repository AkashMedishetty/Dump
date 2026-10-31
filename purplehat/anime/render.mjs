import fs from 'fs';
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [out = 'frames', spec = ''] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.error('PAGE', e.message));
await p.goto('file://' + process.cwd() + '/anim.html'); await p.evaluate(() => window.READY);
const total = await p.evaluate(() => window.TOTAL);
let list; if (spec.includes('-')) { const [a, c] = spec.split('-').map(Number); list = Array.from({ length: c - a + 1 }, (_, i) => a + i); } else if (spec.endsWith('s')) list = spec.slice(0, -1).split(',').map((s) => Math.round(Number(s) * 30)); else list = [...Array(total).keys()];
for (const f of list) { const u = await p.evaluate((f) => window.frame(f), f); fs.writeFileSync(`${out}/${String(f).padStart(4, '0')}.png`, Buffer.from(u.split(',')[1], 'base64')); }
await b.close(); console.log(out, list.length);
