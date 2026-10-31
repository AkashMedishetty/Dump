// brand/guidelines/index.html — links every deliverable (thumbs are made by thumbs.py after rendering)
import fs from 'fs'; import path from 'path';
import { C, baseCSS, write, mark, ROOT, BRAND } from './lib.mjs';
import { SOCIAL } from './screen.mjs';

export const SECTIONS = () => {
  const ls = d => { try { return fs.readdirSync(path.join(ROOT, d)).sort(); } catch (e) { return []; } };
  const cards = ls('cards'); const st = ls('stationery'); const so = ls('social'); const sl = ls('slides');
  let svgs = []; try { svgs = fs.readdirSync(path.join(BRAND, 'svg')).filter(f => f.endsWith('.svg')).sort(); } catch (e) { }
  return [
    ['Brand guidelines', 'A4 landscape, 35 pages. Print-ready PDF + the HTML it is rendered from (animated in a browser).', [
      { t: 'Brand Guidelines (PDF)', f: 'PurpleHat-Brand-Guidelines.pdf', th: 'previews/thumbs/guidelines.png' },
      { t: 'Brand Guidelines (HTML)', f: 'PurpleHat-Brand-Guidelines.html', th: 'previews/thumbs/guidelines-p6.png' }]],
    ['Business cards', '89 × 51 mm and 85 × 55 mm, 3 mm bleed, crop marks, front + back (+ die line for C). Contact details are placeholders.', [
      ...['A', 'B', 'C'].map(d => ({ t: `Direction ${d} — mockup`, f: `cards/PhE-BusinessCard-${d}-mockup.png`, th: `cards/PhE-BusinessCard-${d}-mockup.png` })),
      { t: '85 × 55 mm overview', f: 'cards/PhE-BusinessCard-85x55-overview.png', th: 'cards/PhE-BusinessCard-85x55-overview.png' },
      ...cards.filter(f => f.endsWith('.pdf')).map(f => ({ t: f.replace('PhE-BusinessCard-', 'Card ').replace('.pdf', ' (PDF)'), f: `cards/${f}`, th: `previews/thumbs/${f.replace('.pdf', '.png')}` }))]],
    ['Stationery & event print', 'Letterhead (editable HTML + PDF), DL envelope, email signature, badge + lanyard, ticket, luggage tags.', [
      { t: 'Letterhead A4 (editable HTML)', f: 'stationery/PhE-Letterhead-A4.html', th: 'previews/thumbs/PhE-Letterhead-A4.png' },
      ...st.filter(f => f.endsWith('.pdf')).map(f => ({ t: f.replace('PhE-', '').replace('.pdf', ' (PDF)'), f: `stationery/${f}`, th: `previews/thumbs/${f.replace('.pdf', '.png')}` })),
      { t: 'Email signature (HTML)', f: 'stationery/PhE-Email-Signature.html', th: 'stationery/PhE-Email-Signature-preview.png' },
      ...st.filter(f => /mockup\.png$/.test(f)).map(f => ({ t: f.replace('PhE-', '').replace('.png', ''), f: `stationery/${f}`, th: `stationery/${f}` }))]],
    ['Social templates', '1080 × 1080, 1080 × 1350 and 1080 × 1920 — PNG (and the HTML/SVG source next to each).', so.filter(f => f.endsWith('.png')).map(f => ({ t: f.replace('PhE-Social-', '').replace('.png', ''), f: `social/${f}`, th: `social/${f}` }))],
    ['Presentation 16:9', 'Editable HTML template, PDF and PNG of each slide.', [
      { t: 'Template (HTML, editable)', f: 'slides/PhE-Presentation-16x9.html', th: 'slides/PhE-Slide-1-title.png' },
      { t: 'Template (PDF)', f: 'slides/PhE-Presentation-16x9.pdf', th: 'slides/PhE-Slide-2-section.png' },
      ...sl.filter(f => /^PhE-Slide.*\.png$/.test(f)).map(f => ({ t: f.replace('PhE-', '').replace('.png', ''), f: `slides/${f}`, th: `slides/${f}` }))]],
    ['Logo master files', 'From brand/svg/ (maintained separately).', svgs.map(f => ({ t: f, f: `../svg/${f}`, th: `../svg/${f}`, svg: true }))],
    ['Overview', '', [{ t: 'Contact sheet of all deliverables', f: 'contact-sheet.png', th: 'contact-sheet.png' }]],
  ];
};

export function buildIndex() {
  const secs = SECTIONS();
  write('index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PurpleHat Events — Brand kit</title><style>${baseCSS('.')}
body{background:${C.warm};color:${C.ink}}
header{background:${C.violet};color:${C.warm};padding:48px 6vw 40px}
header p{color:${C.v200};max-width:720px;line-height:1.55;margin:18px 0 0;font-size:15px}
main{padding:20px 6vw 80px}
h2{font-size:24px;font-weight:500;color:${C.violet};letter-spacing:-.01em;margin:44px 0 4px}
.d{color:${C.g500};font-size:14px;margin:0 0 16px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
a.c{display:block;background:#fff;border-radius:14px;overflow:hidden;text-decoration:none;color:${C.ink};box-shadow:0 1px 4px rgba(26,16,51,.08);transition:transform .2s}
a.c:hover{transform:translateY(-2px)}
a.c .im{height:150px;background:${C.sand};display:flex;align-items:center;justify-content:center;overflow:hidden}
a.c .im img{max-width:100%;max-height:100%;object-fit:contain}
a.c .im.svg{background:#fff;padding:18px}
a.c span{display:block;padding:10px 12px;font-size:12.5px;line-height:1.35}
.note{background:#fff;border-left:4px solid ${C.blue};border-radius:10px;padding:16px 18px;font-size:14px;line-height:1.55;max-width:900px;margin-top:28px}
</style></head><body>
<header>${mark({ width: 220, color: C.warm, dot: C.blue })}
<h1 style="margin:28px 0 0;font-weight:500;font-size:40px;letter-spacing:-.02em">Brand kit</h1>
<p>Brand guidelines, business cards, stationery and templates for PurpleHat Events. Everything here is drawn in code from the master logo geometry (brand/logo-geom.js).</p></header>
<main>
<div class="note"><b>Before production:</b> (1) all files are set in DM Sans as a stand-in — swap to <b>Satoshi</b> (Fontshare) in the final artwork; (2) phone, email and website are <b>placeholders</b>; (3) PDFs are RGB vector proofs — convert to CMYK / Pantone with your printer and proof against a swatch book (colour values are approximate).</div>
${secs.map(([h, d, items]) => `<h2>${h}</h2>${d ? `<p class="d">${d}</p>` : ''}<div class="g">${items.map(i => `<a class="c" href="${i.f}"><div class="im${i.svg ? ' svg' : ''}"><img src="${i.th}" alt="" loading="lazy"></div><span>${i.t}</span></a>`).join('')}</div>`).join('\n')}
</main></body></html>`);
}
