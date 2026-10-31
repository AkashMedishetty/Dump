// Builds the stand-alone deliverable HTML files (print + screen). Rendering to PDF/PNG is done by render.mjs.
import { C, baseCSS, write, f2, mark, markG, markH, lockup, lockupG, pattern, photo, T, appIconInner, W, H, uid } from './lib.mjs';
import { card, cardShape, cropMarks, dieLine, BLEED, PERSON, PLACEHOLDER_NOTE, tag, tagShape, TAG, ticket, ticketShape, TICKET, badge, badgeShape, BADGE, lanyard, LANYARD, envelope, DL, ROLES } from './print.mjs';
import { social, SOCIAL, slide, slideCSS, SLIDES, SERVICES } from './screen.mjs';

export const JOBS = { pdf: [], png: [] };   // consumed by render.mjs
const SLUG = 12;

/** A print PDF source: each page = one SVG of trim tw x th with bleed, crop marks and a slug line. */
function printDoc(file, title, tw, th, pages, o = {}) {
  const { slug = SLUG, marks = true } = o; const pw = tw + 2 * slug, ph = th + 2 * slug;
  const body = pages.map(p => `<div class="pg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="${-slug} ${-slug} ${pw} ${ph}" width="${pw}mm" height="${ph}mm">
${p.art}${p.overlay || ''}${marks ? cropMarks(tw, th) : ''}
${T(-BLEED, th + BLEED + 3.6, `PurpleHat Events · ${title} · ${p.label}`, { size: 1.6, fill: '#000' })}
${T(-BLEED, th + BLEED + 5.9, `Trim ${tw} × ${th} mm · bleed ${BLEED} mm · RGB proof — convert to CMYK${p.note ? ' · ' + p.note : ''}`, { size: 1.6, fill: '#000' })}
</svg></div>`).join('\n');
  write(file, `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${baseCSS('..')}
@page{size:${pw}mm ${ph}mm;margin:0}
html,body{background:#fff}.pg{width:${pw}mm;height:${ph}mm;overflow:hidden;break-after:page}.pg:last-child{break-after:auto}.pg svg{display:block}
@media screen{body{background:#ddd;padding:20px;display:flex;flex-wrap:wrap;gap:20px}.pg{background:#fff;box-shadow:0 2px 12px #0002}}
</style></head><body>${body}</body></html>`);
  JOBS.pdf.push({ html: file, pdf: file.replace(/\.html$/, '.pdf'), w: pw, h: ph });
}
/** A screen scene rendered to PNG. */
function scene(file, w, h, inner, o = {}) {
  write(file, `<!doctype html><html><head><meta charset="utf-8"><style>${baseCSS(o.rel || '..')}
html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${o.bg || '#E6E2DA'}}${o.css || ''}</style></head><body>${inner}</body></html>`);
  JOBS.png.push({ html: file, png: file.replace(/\.html$/, '.png'), w, h, scale: o.scale || 1 });
}

// --------------------------------------------------------------- mockup helpers (flat, drawn in code)
const shadow = 'filter:drop-shadow(0 18px 24px rgba(26,16,51,.18)) drop-shadow(0 3px 6px rgba(26,16,51,.12))';
export function flat(innerArt, tw, th, shape, pxPerMm, o = {}) {
  const id = uid('m');
  return `<svg viewBox="0 0 ${tw} ${th}" width="${f2(tw * pxPerMm)}" height="${f2(th * pxPerMm)}" style="${o.noShadow ? '' : shadow};overflow:visible;${o.style || ''}"><defs><clipPath id="${id}">${shape}</clipPath>${o.hole ? `<mask id="${id}h"><rect x="-5" y="-5" width="${tw + 10}" height="${th + 10}" fill="#fff"/>${o.hole}</mask>` : ''}</defs><g clip-path="url(#${id})"${o.hole ? ` mask="url(#${id}h)"` : ''}>${innerArt}</g></svg>`;
}
export const cardMock = (dir, side, tw, th, k, o = {}) => flat(card(dir, side, tw, th), tw, th, dir === 'C' ? cardShape('C', tw, th) : `<rect width="${tw}" height="${th}" rx="0.8"/>`, k, o);

export const LH_CSS = () => `.lh-hd{position:absolute;left:20mm;top:16mm}
.lh-addr{position:absolute;right:20mm;top:17mm;text-align:right;font-size:8pt;line-height:1.55;color:${C.g700}}
.lh-addr b{color:${C.violet};font-weight:600}
.lh-body{position:absolute;left:20mm;right:28mm;top:62mm;bottom:40mm;font-size:10pt;line-height:1.6;color:${C.ink}}
.lh-body p{margin:0 0 4mm}.lh-body .date{color:${C.g500};margin-bottom:8mm}.lh-body .sig{margin-top:8mm}
.lh-body .sig b{color:${C.violet};font-weight:600}
[contenteditable]:focus{outline:1px dashed ${C.blue};outline-offset:2mm}
.lh-foot{position:absolute;left:20mm;right:20mm;bottom:11mm;font-size:6.8pt;letter-spacing:.03em;color:${C.violet};border-top:.25mm solid ${C.v100};padding-top:3mm}
.lh-foot div{display:flex;gap:2.4mm;align-items:center;line-height:1.9}
.lh-foot i{width:1.3mm;height:1.3mm;border-radius:50%;background:${C.blue};display:inline-block}
.lh-side{position:absolute;right:9mm;top:62mm}`;
export const LH_SHEET = () => `<div class="lh-hd">${mark({ width: '44mm', color: C.violet, dot: C.blue })}</div>
<div class="lh-addr" contenteditable><b>PurpleHat Events</b><br>Hyderabad, Telangana, India<br>+91 00000 00000<br>hello@purplehat.events<br>purplehat.events</div>
<svg class="lh-side" width="8mm" height="60mm" viewBox="0 0 8 60"><rect x=".25" y=".25" width="7.5" height="40" rx="3.75" fill="none" stroke="${C.blue}" stroke-width=".4"/><circle cx="4" cy="36.25" r="2.4" fill="${C.blue}"/><circle cx="4" cy="48" r="3.75" fill="none" stroke="${C.violet}" stroke-width=".4"/></svg>
<div class="lh-body" contenteditable>
<p class="date">16 October 2026</p>
<p>Recipient Name<br>Organisation<br>Address line, City</p>
<p style="margin-top:8mm;color:${C.violet};font-weight:600">Subject: A short, specific subject line</p>
<p>Dear Recipient,</p>
<p>Thank you for thinking of PurpleHat Events. This is sample body copy set in the brand typeface at 10 pt with 16 pt leading, which keeps a letter comfortable to read at arm’s length. Replace this text with your own; the layout keeps a generous left margin aligned to the P of the logo.</p>
<p>Write the way we speak in the room: warm, clear and confident. Lead with what matters to the reader, keep paragraphs short, and end with one obvious next step.</p>
<p class="sig">Warm regards,<br><br><b>Akash Medishetty</b><br>Founder, PurpleHat Events</p>
</div>
<div class="lh-foot"><div>${SERVICES.slice(0, 4).map(s => `<span>${s}</span>`).join('<i></i>')}</div><div>${SERVICES.slice(4).map(s => `<span>${s}</span>`).join('<i></i>')}</div></div>`;

export function buildDeliverables() {
  // ============ business cards (3 directions x 2 sizes) ============
  for (const [tw, th] of [[89, 51], [85, 55]]) for (const dir of ['A', 'B', 'C']) {
    const pages = [
      { label: 'Front (name side)', art: card(dir, 'front', tw, th), note: 'PLACEHOLDER phone · email · web' },
      { label: 'Back (brand side)', art: card(dir, 'back', tw, th) },
    ];
    if (dir === 'C') pages.push({ label: 'DIE LINE — pill die-cut, magenta = cut, not printed', art: `<rect x="-3" y="-3" width="${tw + 6}" height="${th + 6}" fill="#fff"/>`, overlay: dieLine(cardShape('C', tw, th)) });
    const name = { A: 'Violet', B: 'Warm-White', C: 'Pill-Diecut' }[dir];
    printDoc(`cards/PhE-BusinessCard-${dir}-${name}-${tw}x${th}mm.html`, `Business card ${dir} (${name.replace('-', ' ')})`, tw, th, pages);
  }
  // card mockups
  const DIRN = { A: 'Direction A — Violet', B: 'Direction B — Warm white, blue dots', C: 'Direction C — Pill die-cut' };
  for (const dir of ['A', 'B', 'C']) {
    const k = 12;
    scene(`cards/PhE-BusinessCard-${dir}-mockup.html`, 2400, 1500, `<div style="position:absolute;left:150px;top:110px;font-size:30px;letter-spacing:.2em;text-transform:uppercase;color:${C.violet};font-weight:500">${DIRN[dir]}</div>
<div style="position:absolute;left:150px;top:160px;font-size:24px;color:${C.g500}">89 × 51 mm · front + back · ${PLACEHOLDER_NOTE.toLowerCase()}</div>
<div style="position:absolute;left:170px;top:420px;transform:rotate(-4deg)">${cardMock(dir, 'back', 89, 51, k)}</div>
<div style="position:absolute;left:1240px;top:640px;transform:rotate(3deg)">${cardMock(dir, 'front', 89, 51, k)}</div>`, { bg: '#E6E2DA' });
  }
  scene('cards/PhE-BusinessCard-85x55-overview.html', 2400, 1500, `<div style="position:absolute;left:150px;top:100px;font-size:30px;letter-spacing:.2em;text-transform:uppercase;color:${C.violet};font-weight:500">85 × 55 mm variants — A · B · C</div>
${['A', 'B', 'C'].map((d, i) => `<div style="position:absolute;left:${150 + i * 720}px;top:240px">${cardMock(d, 'back', 85, 55, 7.2)}</div><div style="position:absolute;left:${150 + i * 720}px;top:740px">${cardMock(d, 'front', 85, 55, 7.2)}</div>`).join('')}
<div style="position:absolute;left:150px;bottom:90px;font-size:22px;color:${C.g500}">${PLACEHOLDER_NOTE}</div>`);

  // ============ letterhead (A4, editable HTML -> PDF) ============
  write('stationery/PhE-Letterhead-A4.html', `<!doctype html><html><head><meta charset="utf-8"><title>PurpleHat Events — Letterhead (A4)</title><style>${baseCSS('..')}
@page{size:210mm 297mm;margin:0}
html{background:#ddd}body{margin:0}
.sheet{width:210mm;height:297mm;position:relative;background:#fff;overflow:hidden;margin:0 auto}
@media screen{body{padding:24px 0}.sheet{box-shadow:0 4px 30px #0003}.hint{display:block}}
.hint{display:none;width:210mm;margin:0 auto 12px;font:13px/1.4 var(--font);color:#555}
@media print{.hint{display:none!important}}
@media screen and (max-width:800px){.hint{display:none}body{padding:0}.sheet{box-shadow:none}}
${LH_CSS()}
</style></head><body>
<div class="hint">Editable letterhead: click into the text to edit, then print to PDF (A4, margins: none, background graphics: on). Production version must use Satoshi.</div>
<div class="sheet">${LH_SHEET()}
</div></body></html>`);
  JOBS.pdf.push({ html: 'stationery/PhE-Letterhead-A4.html', pdf: 'stationery/PhE-Letterhead-A4.pdf', w: 210, h: 297 });

  // ============ envelope DL ============
  printDoc('stationery/PhE-Envelope-DL.html', 'Envelope DL', DL.w, DL.h, [{ label: 'Front', art: envelope('front') }, { label: 'Back (flap)', art: envelope('back') }]);

  // ============ badge + lanyard ============
  printDoc('stationery/PhE-Badge-100x140mm.html', 'Event badge', BADGE.w, BADGE.h, [
    { label: 'Front — Delegate', art: badge('front', { role: 'Delegate' }) },
    { label: 'Front — Speaker', art: badge('front', { role: 'Speaker', name: 'Speaker Name' }) },
    { label: 'Front — Crew', art: badge('front', { role: 'Crew', name: 'Crew Name', org: 'PurpleHat Events' }) },
    { label: 'Back', art: badge('back', {}) },
    { label: 'DIE LINE — rounded corners r5 + clip slot', art: `<rect x="-3" y="-3" width="${BADGE.w + 6}" height="${BADGE.h + 6}" fill="#fff"/>`, overlay: dieLine(badgeShape()) },
  ]);
  printDoc('stationery/PhE-Lanyard-20x450mm.html', 'Lanyard strap (repeat x2 for 900 mm)', LANYARD.w, LANYARD.h, [{ label: 'Strap artwork', art: lanyard() }]);

  // ============ ticket ============
  printDoc('stationery/PhE-Ticket-180x70mm.html', 'Event ticket', TICKET.w, TICKET.h, [
    { label: 'Front', art: ticket('front'), note: 'sample event details' }, { label: 'Back', art: ticket('back') },
    { label: 'DIE LINE — notched perforation at 124 mm', art: `<rect x="-3" y="-3" width="${TICKET.w + 6}" height="${TICKET.h + 6}" fill="#fff"/>`, overlay: dieLine(ticketShape()) + `<line x1="${TICKET.stub}" y1="3" x2="${TICKET.stub}" y2="${TICKET.h - 3}" stroke="#00A0E0" stroke-width=".2" stroke-dasharray=".6 .6"/>` },
  ]);

  // ============ tags ============
  const tp = []; for (const v of [1, 2, 3]) for (const side of ['front', 'back']) tp.push({ label: `Tag ${v} — ${side}`, art: tag(v, side) });
  tp.push({ label: 'DIE LINE — pill + Ø5.2 mm hole', art: `<rect x="-3" y="-3" width="${TAG.w + 6}" height="${TAG.h + 6}" fill="#fff"/>`, overlay: dieLine(tagShape()) });
  printDoc('stationery/PhE-Tags-110x42mm.html', 'Luggage tags', TAG.w, TAG.h, tp);

  // ============ stationery mockup scenes ============
  const holeTag = `<circle cx="${TAG.hole.x}" cy="${TAG.h / 2}" r="${TAG.hole.r}" fill="#000"/>`;
  const tagMock = (v, side, k, rot, x, y) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${rot}deg)">${flat(tag(v, side), TAG.w, TAG.h, `<rect width="${TAG.w}" height="${TAG.h}" rx="${TAG.h / 2}"/>`, k, { hole: holeTag })}</div>`;
  scene('stationery/PhE-Tags-mockup.html', 2400, 1500, [
    tagMock(1, 'back', 9, -18, -120, 40), tagMock(2, 'front', 9, 14, 1100, -60), tagMock(3, 'back', 9, 8, 1500, 1050), tagMock(2, 'back', 9, -10, -200, 1150),
    tagMock(1, 'front', 11, -22, 520, 520), tagMock(3, 'front', 9, 12, 1350, 480), tagMock(1, 'back', 9, 4, 200, 1000), tagMock(2, 'front', 9, -6, 1650, 250)].join(''), { bg: '#E9E5DD' });

  const holeBadge = `<rect x="${BADGE.w / 2 - 8}" y="6" width="16" height="3.4" rx="1.7" fill="#000"/>`;
  const bMock = (role, name, x, y, rot, org) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${rot}deg);transform-origin:50% 0">
  <svg width="70" height="430" viewBox="0 0 70 430" style="position:absolute;left:${BADGE.w * 5.2 / 2 - 35}px;top:-400px"><rect x="22" y="0" width="26" height="360" fill="${C.blue}"/>${[60, 220].map(y => `<g transform="translate(41 ${y}) rotate(90)">${markG(0, 0, 90, { color: C.warm })}</g>`).join('')}<rect x="27" y="352" width="16" height="40" rx="4" fill="#1d1d24"/><path d="M35 392v22" stroke="#1d1d24" stroke-width="6"/><rect x="23" y="408" width="24" height="22" rx="6" fill="none" stroke="#1d1d24" stroke-width="5"/></svg>
  ${flat(badge('front', { role, name, org }), BADGE.w, BADGE.h, `<rect width="${BADGE.w}" height="${BADGE.h}" rx="5"/>`, 5.2, { hole: holeBadge })}</div>`;
  scene('stationery/PhE-Badge-Lanyard-mockup.html', 2400, 1500, bMock('Delegate', 'Delegate Name', 260, 520, -3) + bMock('Speaker', 'Speaker Name', 960, 470, 1, 'Organisation name') + bMock('Crew', 'Crew Name', 1660, 540, 3, 'PurpleHat Events'), { bg: '#D9D6DE' });

  const tShape = ticketShape();
  scene('stationery/PhE-Ticket-mockup.html', 2400, 1500, `<div style="position:absolute;left:240px;top:170px;transform:rotate(-3deg)">${flat(ticket('front'), TICKET.w, TICKET.h, tShape, 10.5)}</div>
<div style="position:absolute;left:520px;top:900px;transform:rotate(2deg)">${flat(ticket('back'), TICKET.w, TICKET.h, tShape, 9)}</div>`, { bg: '#D9D6DE' });

  scene('stationery/PhE-Stationery-mockup.html', 2400, 1600, `
<div style="position:absolute;left:180px;top:120px;width:794px;height:1123px;transform:scale(1.18);transform-origin:0 0;${shadow}"><div style="width:210mm;height:297mm;position:relative;background:#fff;overflow:hidden">${LH_SHEET()}</div></div>
<div style="position:absolute;left:1180px;top:260px;transform:rotate(-2deg)">${flat(envelope('front'), DL.w, DL.h, `<rect width="${DL.w}" height="${DL.h}" rx="1"/>`, 5)}</div>
<div style="position:absolute;left:1240px;top:900px;transform:rotate(3deg)">${flat(envelope('back'), DL.w, DL.h, `<rect width="${DL.w}" height="${DL.h}" rx="1"/>`, 4.4)}</div>
<div style="position:absolute;left:1980px;top:1220px;transform:rotate(-6deg)">${cardMock('A', 'back', 89, 51, 4.2)}</div>`, { bg: '#E6E2DA', css: LH_CSS() });

  // ============ email signature ============
  write('stationery/PhE-Email-Signature.html', `<!doctype html><html><head><meta charset="utf-8"><title>PurpleHat Events — Email signature</title>
<style>${baseCSS('..')} body{background:#fff;padding:40px;font-family:var(--font)} .note{max-width:640px;font-size:13px;line-height:1.5;color:#555;border-top:1px solid #ddd;margin-top:40px;padding-top:16px}</style></head><body>
<!-- ===== COPY FROM HERE (email-safe table, inline styles). Host email-mark@2x.png on purplehat.events and replace the src. ===== -->
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Satoshi,'DM Sans',Arial,Helvetica,sans-serif;color:${C.ink}">
  <tr>
    <td style="padding:0 20px 0 0;vertical-align:top;border-right:2px solid ${C.v100}"><img src="email-mark@2x.png" width="120" height="43" alt="PurpleHat Events" style="display:block;border:0;width:120px;height:auto"></td>
    <td style="padding:0 0 0 20px;vertical-align:top">
      <div style="font-size:16px;line-height:20px;font-weight:600;color:${C.violet}">Akash Medishetty</div>
      <div style="font-size:11px;line-height:18px;letter-spacing:1.6px;text-transform:uppercase;color:${C.blue};font-weight:500">Founder · PurpleHat Events</div>
      <div style="font-size:13px;line-height:20px;margin-top:8px"><span style="color:${C.blue}">&#9679;</span>&nbsp; +91 00000 00000<br><span style="color:${C.blue}">&#9679;</span>&nbsp; <a href="mailto:hello@purplehat.events" style="color:${C.ink};text-decoration:none">hello@purplehat.events</a><br><span style="color:${C.blue}">&#9679;</span>&nbsp; <a href="https://purplehat.events" style="color:${C.ink};text-decoration:none">purplehat.events</a> · Hyderabad</div>
      <div style="margin-top:10px"><span style="display:inline-block;border:1.5px solid ${C.violet};border-radius:20px;padding:3px 12px;font-size:11px;line-height:16px;color:${C.violet}">Events for a more connected tomorrow.</span></div>
    </td>
  </tr>
</table>
<!-- ===== COPY TO HERE ===== -->
<div class="note"><b>How to install:</b> open this file in a browser, select the signature block and paste into Gmail / Outlook signature settings. Before use: host <code>email-mark@2x.png</code> (240×86, in this folder) on the company website and replace the image src with its absolute URL; replace the placeholder phone, email and web. The font falls back to Arial in mail apps that don’t have Satoshi.</div>
</body></html>`);
  scene('stationery/email-mark@2x.html', 240, 86, `<svg viewBox="-2 -2 ${W + 4} ${H + 4}" width="240" height="86" style="display:block">${markG(0, 0, W, { color: C.violet, dot: C.blue })}</svg>`, { bg: 'transparent' });
  scene('stationery/PhE-Email-Signature-preview.html', 1000, 300, `<iframe src="PhE-Email-Signature.html" style="width:1000px;height:300px;border:0;background:#fff"></iframe>`, { bg: '#fff' });

  // ============ social templates ============
  for (const id of Object.keys(SOCIAL)) { const s = social(id); scene(`social/PhE-Social-${id}-${s.w}x${s.h}.html`, s.w, s.h, s.svg, { bg: '#fff' }); }

  // ============ slides ============
  const deck = SLIDES.map((id, i) => slide(id, i + 1)).join('\n');
  write('slides/PhE-Presentation-16x9.html', `<!doctype html><html><head><meta charset="utf-8"><title>PurpleHat Events — Presentation template (16:9)</title><style>${baseCSS('..')}${slideCSS()}
@page{size:1920px 1080px;margin:0}
html{background:#222}body{margin:0}
@media screen{body{padding:30px 0;display:flex;flex-direction:column;align-items:center;gap:30px}.slide{zoom:.5}}
@media print{.slide{break-after:page}}
</style></head><body>${deck}</body></html>`);
  JOBS.pdf.push({ html: 'slides/PhE-Presentation-16x9.html', pdf: 'slides/PhE-Presentation-16x9.pdf', wpx: 1920, hpx: 1080 });
  SLIDES.forEach((id, i) => scene(`slides/PhE-Slide-${i + 1}-${id}.html`, 1920, 1080, slide(id, i + 1), { css: slideCSS() }));

  // app icon PNG (for index)
  scene('assets/img/app-icon.html', 512, 512, `<svg viewBox="0 0 512 512" width="512" height="512">${appIconInner(512)}</svg>`, { bg: 'transparent', rel: '../..' });
}
