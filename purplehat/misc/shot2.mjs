import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + process.cwd() + '/purplehat-mark.html');
await p.waitForTimeout(600);
await p.screenshot({ path: 'mark-full.png', fullPage: true });
// Big zoom of one mark to inspect smoothness and symmetry
const tile = await p.$('.tile svg');
const svg = await tile.evaluate(e => e.outerHTML);
const z = await b.newPage({ viewport: { width: 900, height: 900 } });
await z.setContent(`<body style="margin:0;background:#5e44e8">${svg.replace('<svg', '<svg width="900" height="900"')}</body>`);
await z.screenshot({ path: 'mark-zoom.png' });
console.log('errors:', errs);
await b.close();
