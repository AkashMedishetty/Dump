import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1938, height: 800 } });
await p.goto('file://' + process.cwd() + '/sheet.html'); await p.waitForTimeout(500);
const H = await p.evaluate(() => document.body.scrollHeight);
await p.setViewportSize({ width: 1938, height: Math.ceil(H / 2) });
await p.screenshot({ path: 'sheet1.png', clip: { x: 0, y: 0, width: 1938, height: Math.ceil(H / 2) } });
await p.setViewportSize({ width: 1938, height: H });
await p.screenshot({ path: 'sheet2.png', clip: { x: 0, y: Math.floor(H / 2), width: 1938, height: H - Math.floor(H / 2) } });
await b.close();
