import fs from 'fs';
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const arg = process.argv[2] || '';
const only = arg.includes('-') ? (([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => a + i))(arg.split('-').map(Number)) : arg ? arg.split(',').map(Number) : null;
fs.mkdirSync(process.env.OUT || 'frames', { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/anim.html');
const total = await p.evaluate(() => window.TOTAL);
const list = only || [...Array(total).keys()];
for (const f of list) {
  const url = await p.evaluate((f) => window.frame(f), f);
  fs.writeFileSync(`${process.env.OUT || 'frames'}/${String(f).padStart(4, '0')}.png`, Buffer.from(url.split(',')[1], 'base64'));
}
await b.close(); console.log(process.env.OUT || 'frames', list.length);
