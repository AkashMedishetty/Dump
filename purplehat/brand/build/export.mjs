// Raster + PDF exports from svg/:  node build/export.mjs
//   png/    transparent PNGs @1x/@2x/@4x of the key marks and lockups (1x = 1 logo unit per px)
//   icons/  favicon 16/32/48 + favicon.ico, apple-touch-icon 180, Android/PWA 192/512, site.webmanifest
//   pdf/    vector PDFs (Chromium print, artwork stays vector)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launch } from './browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PY = process.env.PY || '/home/user/lemomo-ai/lemo-opuscar/.venv/bin/python';
const svgOf = (n) => fs.readFileSync(path.join(ROOT, 'svg', n + '.svg'), 'utf8');
const sizeOf = (s) => { const m = s.match(/width="([\d.]+)" height="([\d.]+)"/); return [+m[1], +m[2]]; };
for (const d of ['png', 'icons', 'pdf']) fs.mkdirSync(path.join(ROOT, d), { recursive: true });

const KEY = ['phe-mark-primary', 'phe-mark-twotone', 'phe-mark-reversed', 'phe-mark-twotone-reversed', 'phe-mark-black', 'phe-mark-white', 'phe-mark-accent',
  'phe-lockup-primary', 'phe-lockup-reversed', 'phe-lockup-white', 'phe-lockup-horizontal', 'phe-lockup-horizontal-reversed', 'phe-lockup-horizontal-white',
  'phe-lockup-stacked', 'phe-lockup-stacked-reversed', 'phe-lockup-pill', 'phe-lockup-pill-reversed', 'phe-app-icon-rounded'];

const b = await launch();
async function raster(svg, w, h, scale, out) {
  const p = await b.newPage({ viewport: { width: Math.ceil(w), height: Math.ceil(h) }, deviceScaleFactor: scale });
  await p.setContent(`<html><body style="margin:0;background:transparent">${svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${w}" height="${h}"`)
    .replace('<svg ', '<svg style="display:block" ')}</body></html>`);
  await p.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: Math.ceil(w), height: Math.ceil(h) } });
  await p.close();
}
for (const n of KEY) {
  const s = svgOf(n), [w, h] = sizeOf(s);
  for (const k of [1, 2, 4]) await raster(s, w, h, k, path.join(ROOT, 'png', `${n}@${k}x.png`));
}
console.log('png:', KEY.length * 3, 'files');

const fav = svgOf('phe-favicon'), app = svgOf('phe-app-icon');
for (const s of [16, 32, 48]) await raster(fav, s, s, 1, path.join(ROOT, 'icons', `favicon-${s}.png`));
await raster(app, 180, 180, 1, path.join(ROOT, 'icons', 'apple-touch-icon.png'));
for (const s of [192, 512]) await raster(app, s, s, 1, path.join(ROOT, 'icons', `icon-${s}.png`));
fs.copyFileSync(path.join(ROOT, 'svg', 'phe-favicon.svg'), path.join(ROOT, 'icons', 'favicon.svg'));
spawnSync(PY, ['-c', `from PIL import Image; d='${path.join(ROOT, 'icons')}/'
ims=[Image.open(d+f'favicon-{s}.png').convert('RGBA') for s in (16,32,48)]
ims[2].save(d+'favicon.ico', format='ICO', sizes=[(16,16),(32,32),(48,48)], append_images=ims[:2])`], { stdio: 'inherit' });
fs.writeFileSync(path.join(ROOT, 'icons', 'site.webmanifest'), JSON.stringify({
  name: 'PurpleHat Events', short_name: 'PurpleHat', theme_color: '#2A0D6E', background_color: '#2A0D6E', display: 'standalone',
  icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }],
}, null, 2) + '\n');
console.log('icons: favicon 16/32/48 + .ico + .svg, apple-touch-icon 180, icon 192/512, site.webmanifest');

for (const n of ['phe-mark-primary', 'phe-mark-reversed', 'phe-mark-twotone', 'phe-lockup-primary', 'phe-lockup-horizontal', 'phe-lockup-reversed']) {
  const s = svgOf(n), [w, h] = sizeOf(s), p = await b.newPage();
  await p.setContent(`<html><head><style>@page{size:${w}px ${h}px;margin:0}html,body{margin:0}</style></head><body>${s.replace('<svg ', '<svg style="display:block" ')}</body></html>`);
  await p.pdf({ path: path.join(ROOT, 'pdf', n + '.pdf'), width: `${w}px`, height: `${h}px`, printBackground: true, pageRanges: '1' });
  await p.close();
}
console.log('pdf: 6 files');
await b.close();
