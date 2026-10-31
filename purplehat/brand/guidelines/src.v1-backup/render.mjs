// node render.mjs [filter]  — renders jobs.json (PDF via Chromium print, PNG via screenshot)
import fs from 'fs'; import path from 'path';
import { chromium } from '/home/user/lemomo-ai/lemo-opuscar/node_modules/playwright-core/index.mjs';
const ROOT = process.env.GUIDE_OUT ? path.resolve(process.env.GUIDE_OUT) : path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const jobs = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/jobs.json')));
const filt = process.argv[2] ? new RegExp(process.argv[2]) : null; const kind = process.argv[3] || 'both';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs = [];
async function open(ctx, rel) { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(rel + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(rel + ': ' + m.text()); }); await p.goto('file://' + path.join(ROOT, rel)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150); return p; }
if (kind !== 'png') for (const j of jobs.pdf) {
  if (filt && !filt.test(j.html)) continue;
  const ctx = await b.newContext(); const p = await open(ctx, j.html);
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: path.join(ROOT, j.pdf), printBackground: true, preferCSSPageSize: true });
  await ctx.close(); console.log('pdf', j.pdf);
}
if (kind !== 'pdf') for (const j of jobs.png) {
  if (filt && !filt.test(j.html)) continue;
  const ctx = await b.newContext({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: j.scale || 1 }); const p = await open(ctx, j.html);
  await p.waitForTimeout(j.wait || 100);
  await p.screenshot({ path: path.join(ROOT, j.png), omitBackground: true, clip: { x: 0, y: 0, width: j.w, height: j.h } });
  await ctx.close(); console.log('png', j.png);
}
await b.close(); if (errs.length) console.log('ERRORS', errs);
