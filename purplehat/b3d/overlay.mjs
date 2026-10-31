import fs from 'fs';
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
fs.mkdirSync('overlay', { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/overlay.html'); await p.evaluate(() => window.READY);
for (let f = 1; f <= 180; f++) { const u = await p.evaluate((f) => window.frame(f), f); fs.writeFileSync(`overlay/o_${String(f).padStart(4, '0')}.png`, Buffer.from(u.split(',')[1], 'base64')); }
await b.close(); console.log('overlay done');
