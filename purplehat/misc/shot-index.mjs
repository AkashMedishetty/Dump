import { chromium } from '/home/user/lemomo-ai/lemo-opuscar/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
const errs=[]; p.on('requestfailed', r => errs.push(r.url()));
await p.goto('file:///tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/guidelines/index.html'); await p.waitForTimeout(800);
await p.evaluate(()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager')}); await p.waitForTimeout(800);
await p.screenshot({ path: '/tmp/claude-0/-home-user-Dump/4404b19b-f333-5ac2-87a9-ea7d3eab202a/scratchpad/brand/guidelines/previews/index-shot.png', fullPage: false });
const broken = await p.evaluate(()=>[...document.images].filter(i=>i.complete && i.naturalWidth===0).map(i=>i.src));
console.log('failed', errs, 'broken', broken); await b.close();
