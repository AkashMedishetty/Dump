import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1938, height: 900 } });
await p.goto('file://' + process.cwd() + '/sheet.html'); await p.waitForTimeout(500);
await p.screenshot({ path: 'sheet3.png', fullPage: true }); await b.close();
