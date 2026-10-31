import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1300, height: 900 } });
await p.goto('file://' + process.cwd() + '/preview.html');
await p.screenshot({ path: 'preview.png', fullPage: true });
await b.close();
