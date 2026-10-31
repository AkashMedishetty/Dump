import { launch, fileUrl } from '../brand/build/browser.mjs';
const [src, prefix, ...times] = process.argv.slice(2);
const b = await launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
const errs=[]; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
await p.goto(fileUrl(src)); let last = 0;
for (const t of times) { await p.waitForTimeout((+t - last) * 1000); last = +t; await p.screenshot({ path: `${prefix}-${t}.png`, fullPage: true }); }
console.log('errors:', errs); await b.close();
