import fs from 'fs';
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', (e) => console.error('PAGE', e.message));
await p.goto('file://' + process.cwd() + '/reel.html'); await p.evaluate(() => window.READY);
const r = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const x = c.getContext('2d'); draw(x, 4.6); const d = x.getImageData(540, 400, 1, 1).data; return [Array.from(d), c.toDataURL()]; });
console.log(r[0]); fs.writeFileSync('dbg.png', Buffer.from(r[1].split(',')[1], 'base64'));
await b.close();
