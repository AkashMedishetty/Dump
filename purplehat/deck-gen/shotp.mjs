import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1716, height: 900 } });
await p.goto('file://' + process.cwd() + '/pro-preview.html'); await p.screenshot({ path: 'pro.png', fullPage: true }); await b.close();
