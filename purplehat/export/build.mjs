import fs from 'fs';
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const root = '../phe-deck/project';
const deck = JSON.parse(fs.readFileSync(`${root}/deck.json`, 'utf8'));
const links = Object.values(deck.faces).map((f) => `<link rel="stylesheet" href="${f.href}">`).join('');
const css = `*{box-sizing:border-box} html,body{margin:0;padding:0;background:#222}
section{position:relative;width:1920px;height:1080px;overflow:hidden;page-break-after:always;break-after:page;display:flex;flex-direction:column}
section aside{display:none}
h1,h2,h3,p,ul,ol{margin:0} h1{font-size:96px;font-weight:600;line-height:1.1} h2{font-size:64px;font-weight:600;line-height:1.15} h3{font-size:44px;font-weight:600;line-height:1.2} p{font-size:32px;line-height:1.4}
table{border-collapse:collapse;width:100%} th,td{border-bottom:1px solid rgba(23,17,43,.18);padding:.35em .6em;text-align:left;vertical-align:top} th{font-weight:700}
svg{flex:none;display:block}`;
const blobs = JSON.parse(fs.readFileSync('blobs.json', 'utf8'));
const slides = deck.order.map((id) => fs.readFileSync(`${root}/slides/${id}.html`, 'utf8').replace(/\/_blob\/([0-9a-f]{32})/g, (m, k) => `../deck-gen/logos/${blobs[k]}.svg`));
const html = `<!doctype html><html><head><meta charset="utf-8">${links}<style>${css}</style></head><body>${slides.join('\n')}</body></html>`;
fs.writeFileSync('deck-render.html', html);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: true });
const p = await ctx.newPage();
await p.goto('file://' + process.cwd() + '/deck-render.html', { waitUntil: 'networkidle' });
await p.evaluate(async () => { const specs = ['400 24px Urbanist','500 24px Urbanist','600 24px Urbanist','700 24px Urbanist','800 24px Urbanist','400 24px "Nunito Sans"','600 24px "Nunito Sans"','700 24px "Nunito Sans"','400 24px "IBM Plex Mono"','500 24px "IBM Plex Mono"']; for (let k = 0; k < 3; k++) { await Promise.all(specs.map((f) => document.fonts.load(f).catch(() => null))); await document.fonts.ready; if (specs.every((f) => document.fonts.check(f))) break; await new Promise((r) => setTimeout(r, 1500)); } });
console.log('fonts ok:', await p.evaluate(() => ['700 40px Urbanist', '800 40px Urbanist', '400 24px "Nunito Sans"', '400 24px "IBM Plex Mono"'].map((f) => document.fonts.check(f))));
fs.rmSync('png', { recursive: true, force: true }); fs.mkdirSync('png', { recursive: true });
const secs = await p.$$('section');
for (let i = 0; i < secs.length; i++) await secs[i].screenshot({ path: `png/${String(i + 1).padStart(2, '0')}.png` });
await p.pdf({ path: 'PurpleHat-Identity.pdf', width: '1920px', height: '1080px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await b.close();
console.log('slides', secs.length);
