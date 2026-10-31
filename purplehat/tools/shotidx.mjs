import { launch, fileUrl } from '../brand/build/browser.mjs';
const [src, out, w = '1400', wait = '4000', full = '1'] = process.argv.slice(2);
const b = await launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto(fileUrl(src)); 
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
await p.waitForTimeout(+wait);
await p.screenshot({ path: out, fullPage: full === '1' }); console.log('errors', errs); await b.close();
