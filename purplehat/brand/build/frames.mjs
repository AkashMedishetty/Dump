// node build/frames.mjs <scene.html> <out-prefix> <w> <h> <bg> t1 t2 ...   -> one PNG per time (debug / strips)
import { launch, fileUrl } from './browser.mjs';
const [src, prefix, w, h, bg, ...ts] = process.argv.slice(2);
const b = await launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(fileUrl(src) + `?w=${w}&h=${h}&bg=${bg}&capture`);
for (const t of ts) { await p.evaluate((t) => window.render(t), +t); await p.screenshot({ path: `${prefix}-${t}.png`, omitBackground: bg.startsWith('transparent') }); }
if (errs.length) console.log('errors', errs);
await b.close();
