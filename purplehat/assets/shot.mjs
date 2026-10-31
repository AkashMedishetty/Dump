import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2048, height: 1024 } });
await p.goto('file://' + process.cwd() + '/capref.html'); await p.screenshot({ path: 'PurpleHat-cap-reference.png' }); await b.close();
