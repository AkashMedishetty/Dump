import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + process.cwd() + '/brief.html'); await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: 'PurpleHat-AnimeSpot-ImageBrief.pdf', format: 'A4', printBackground: true });
for (let i = 0; i < 5; i++) {} await b.close();
