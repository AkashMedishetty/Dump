// node build/shot.mjs <page.html|url> <out.png> [width=1600] [scale=1]  -> full-page screenshot
import { launch, fileUrl } from './browser.mjs';
const [src, out, w = '1600', s = '1'] = process.argv.slice(2);
const b = await launch();
const p = await b.newPage({ viewport: { width: +w, height: 800 }, deviceScaleFactor: +s });
await p.goto(src.includes('://') ? src : fileUrl(src)); await p.waitForTimeout(400);
await p.screenshot({ path: out, fullPage: true });
await b.close();
