import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1290, height: 900 } });
await p.goto('file://' + process.cwd() + '/concepts-preview.html'); await p.screenshot({ path: 'concepts.png', fullPage: true }); await b.close();
