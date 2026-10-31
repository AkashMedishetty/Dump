// PurpleHat Events — Brand Guidelines (A4 landscape, HTML -> PDF)
import fs from 'fs'; import path from 'path';
import { C, FONT, baseCSS, write, f2, mark, markG, markH, markInner, lockup, lockupG, LOCK, pillLockup, pattern, photo, T, appIconInner, W, H, SW, RD, STROKES, DOTS, dot, arcsOf, icon, ICONS, contrast, hexRgb, uid, BRAND, G, ACCENT } from './lib.mjs';
import { card, PERSON, tag, TAG, ticket, ticketShape, TICKET, badge, BADGE, lanyard, envelope, DL } from './print.mjs';
import { social, SOCIAL, slide, slideCSS, SLIDES, SERVICES, SERVICE_ICONS } from './screen.mjs';
import { flat, cardMock, LH_CSS, LH_SHEET } from './deliverables.mjs';

const pages = [];
function page(section, title, body, o = {}) { pages.push({ section, title, body, ...o }); }
const svg = (w, h, inner, style = '') => `<svg viewBox="0 0 ${f2(w)} ${f2(h)}" width="${f2(w)}" height="${f2(h)}" style="display:block;overflow:visible;${style}">${inner}</svg>`;
const scaleSvg = (s, width) => s.replace(/width="(\d+)" height="(\d+)"/, (m, w, h) => `width="${width}" height="${f2(width * h / w)}" style="display:block"`);
const lab = (s, col = C.blue) => `<div class="lab" style="color:${col}">${s}</div>`;
const head = (sec, title, lead = '') => `<div class="sec">${sec}</div><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}`;
const tile = (inner, o = {}) => `<div class="tile" style="background:${o.bg || '#fff'};${o.style || ''}">${inner}${o.cap ? `<div class="tcap" style="color:${o.capc || C.g500}">${o.cap}</div>` : ''}</div>`;
const X = `<svg width="22" height="22" viewBox="0 0 22 22" class="xbad"><circle cx="11" cy="11" r="10" fill="${C.warn}"/><path d="M7.2 7.2l7.6 7.6M14.8 7.2l-7.6 7.6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
const OK = `<svg width="22" height="22" viewBox="0 0 22 22" class="xbad"><circle cx="11" cy="11" r="10" fill="${C.blue}"/><path d="M6.5 11.3l3 3 6-6.6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const bullets = arr => `<ul class="dl">${arr.map(a => `<li>${a}</li>`).join('')}</ul>`;

// ===================================================================================== openers
import { PATTERNS, patternPage } from './patterns.mjs';
import { capsule, capsuleFrame, chip, arrowIn, personOf, CAP, LOGO_GAP, GAP_RATIO, crowd, figure, stageScene, archScene, podScene, ledArt } from './capsule.mjs';
const PW = 1123, PH = 794;
const full = inner => `<svg style="position:absolute;left:0;top:0" width="${PW}" height="${PH}" viewBox="0 0 ${PW} ${PH}">${inner}</svg>`;
/** Full-bleed chapter opener. art = SVG in page px (1123 × 794). */
function opener(sec, num, title, lead, art, o = {}) {
  const bg = o.bg || C.violet, fg = o.fg || C.warm, sub = o.sub || C.v200;
  page(sec, title, `<div style="position:absolute;inset:0;background:${bg}"></div>${full(art)}
<div class="op-kick" style="color:${sub}">Chapter ${num}</div>
<div class="op-num" style="color:${fg}">${num}</div>
<h1 class="op-t" style="color:${fg}">${title}</h1>
<p class="op-l" style="color:${sub}">${lead}</p>
<div class="op-list" style="color:${o.listc || sub};${o.listStyle || ''}">%%LIST%%</div>`, { dark: true, noChrome: true, opener: true, num, chapterTitle: title });
}

// ===================================================================================== cover
{
  const mw = 560, mh = markH(mw);
  page('cover', 'Cover', `
<div style="position:absolute;inset:0;background:${C.violet}"></div>
${full(markG((PW - mw) / 2, (PH - mh) / 2 - 14, mw, { color: C.warm, dot: C.blue }))}
<div style="position:absolute;left:72px;top:64px;color:${C.warm}" class="kick">Brand Guidelines</div>
<div style="position:absolute;right:72px;top:64px;color:${C.v200};text-align:right" class="kick">Edition 2.0 · October 2026</div>
<div style="position:absolute;left:0;right:0;bottom:64px;text-align:center;color:${C.v200}" class="kick">PurpleHat Events · Events for a more connected tomorrow.</div>`, { dark: true, noChrome: true });
}

// ===================================================================================== 01 BRAND
page('contents', 'Contents', '', { contents: true });

{ // 01 opener — the equation, at architectural scale
  const y0 = 250, c = 150, L = 360, lab = (x, t) => T(x, y0 + L + 44, t, { size: 11, fill: C.v200, caps: true, ls: 0.24, anchor: 'middle', weight: 500 });
  const sw = 3; const x1 = 520, x2 = 730, x3 = 940;
  opener('01 Brand', '01', 'Brand', 'People, ideas and places — brought together until they become an experience. This is who we are, and the idea the whole identity grows from.', `
<circle cx="${x1 + c / 2}" cy="${y0 + L - c / 2}" r="${c / 2 - sw / 2}" fill="none" stroke="${C.warm}" stroke-width="${sw}"/>
${T(x1 + c + 25, y0 + L - c / 2 + 14, '+', { size: 40, fill: C.v400, weight: 300, anchor: 'middle' })}
${capsule(x2 - 10, y0, c, L, { line: C.warm, sw, noPerson: true })}
${T(x2 + c + 15, y0 + L - c / 2 + 14, '=', { size: 40, fill: C.v400, weight: 300, anchor: 'middle' })}
${capsule(x3 - 20, y0, c, L, { line: 'none', fill: C.warm, state: 'on', person: C.blue })}
${lab(x1 + c / 2, 'People')}${lab(x2 - 10 + c / 2, 'Places')}${lab(x3 - 20 + c / 2, 'Experiences')}`);
}

page('01 Brand', 'Who we are', `<div class="split">
<div>${head('01 · Brand', 'Who we are', 'PurpleHat Events is a Hyderabad-based events company. We bring people, ideas and places together — and turn the meeting into an experience people remember.')}
<p class="body">From a 40-person leadership offsite to a 4,000-delegate congress, the job is the same: make it easy for people to connect. The identity is built to say exactly that — open forms, warm colour, and a dot that marks the moment everything comes together.</p>
<div class="quote">“Events for a more<br>connected tomorrow.”</div></div>
<div><div class="lab" style="color:${C.blue};margin-bottom:14px">What we do</div>
<div class="svc">${SERVICES.map((s, i) => `<div class="svcrow">${icon(SERVICE_ICONS[i], { size: 34 })}<span class="n">${String(i + 1).padStart(2, '0')}</span><b>${s}</b><span class="d">${['Concept to curtain call — planning, production and on-ground delivery.', 'Professional Conference Organiser: programme, delegates, abstracts, speakers.', 'Meetings, incentives, conferences and exhibitions — travel, stay and venues.', 'Launches, town halls, offsites, award nights and annual days.', 'Interactive spaces, immersive rooms and installations people step into.', 'Event identities, stage design, signage and collateral.', 'Event websites, registration flows and companion apps.'][i]}</span></div>`).join('')}</div></div></div>`);

page('01 Brand', 'Concept', `
<div style="position:absolute;left:0;top:0;width:330px">${head('01 · Brand', 'People + Places = Experiences', 'The whole identity grows from one simple equation. A pill (people, gathering side by side) plus a circle (a place, a point on the map) makes a pill that holds a circle — the switch that turns a meeting into an experience.')}
<p class="body">The same open, round-ended line draws the logo, the pattern and every graphic device. Nothing is closed off; there is always room for one more.</p></div>
<div style="position:absolute;left:380px;top:40px;width:610px;height:520px;background:#fff;border-radius:18px">
${svg(610, 520, `
<rect x="40" y="150" width="170" height="86" rx="43" fill="none" stroke="${C.violet}" stroke-width="5"/>
<text x="234" y="203" font-size="34" fill="${C.violet}" class="t" font-weight="300">+</text>
<circle cx="318" cy="193" r="43" fill="none" stroke="${C.violet}" stroke-width="5"/>
<text x="384" y="203" font-size="34" fill="${C.violet}" class="t" font-weight="300">=</text>
<rect x="462" y="100" width="86" height="190" rx="43" fill="none" stroke="${C.violet}" stroke-width="5"/>
<circle cx="505" cy="247" r="30" fill="none" stroke="${C.blue}" stroke-width="5" class="anim-travel"/>
${T(125, 290, 'People', { size: 13, fill: C.violet, ls: 0.24, caps: true, anchor: 'middle', weight: 500 })}
${T(318, 290, 'Places', { size: 13, fill: C.violet, ls: 0.24, caps: true, anchor: 'middle', weight: 500 })}
${T(505, 330, 'Experiences', { size: 13, fill: C.violet, ls: 0.24, caps: true, anchor: 'middle', weight: 500 })}
<line x1="40" y1="390" x2="570" y2="390" stroke="${C.g200}"/>
${markG(40, 420, 190, { color: C.violet, dot: C.blue })}
${T(260, 440, 'In the mark, three dots sit where the lines come to rest —', { size: 13, fill: C.g700 })}
${T(260, 460, 'one each for people, places and experiences.', { size: 13, fill: C.g700 })}
${T(260, 482, 'The equation, written in letters.', { size: 13, fill: C.violet, weight: 500 })}
`)}</div>`);

page('01 Brand', 'Brand words', `<div class="split">
<div>${head('01 · Brand', 'Our words', 'Five words carry the brand. They appear as a stacked list on badges, posters and stage screens — always in this order, always with a pause between them.')}
<div class="lab" style="margin-top:26px">Personality</div>
<div class="traits">${[['Warm', 'We are hosts first.'], ['Curious', 'Every brief is a new idea.'], ['Clear', 'Plans people can follow.'], ['Connected', 'Everything links up.']].map(([a, b]) => `<div><b>${a}</b><span>${b}</span></div>`).join('')}</div></div>
<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:18px">
<div class="tile" style="background:${C.violet};padding:34px 34px;justify-content:flex-start;align-items:flex-start">
<div style="color:${C.warm};font-size:40px;line-height:1.14;font-weight:500;letter-spacing:-.02em">People<br>Ideas<br>Places<br>Experiences<br>Together</div>
<div style="width:34px;height:2px;background:${C.warm};margin:26px 0 0"></div></div>
<div style="display:flex;flex-direction:column;gap:14px">
${[['Primary line', 'Events for a more connected tomorrow.', 'Sign-offs, website, social bios, proposals.'], ['Spaces & installations', 'Ideas take shape here.', 'Venues, experiential builds, behind-the-scenes.'], ['Invitations & tickets', 'Ideas for a brighter tomorrow.', 'Tickets, invites, save-the-dates.']].map(([k, v, u]) => `<div class="tile" style="padding:20px 22px;align-items:flex-start;justify-content:flex-start;flex:1">${lab(k)}<div style="font-size:21px;color:${C.violet};font-weight:500;letter-spacing:-.01em;margin:8px 0 6px">${v}</div><div class="small">${u}</div></div>`).join('')}
</div></div></div>`);

// ===================================================================================== 02 LOGO
const ann = (x1, y1, x2, y2, txt, anchor = 'start') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.blue}" stroke-width="1"/><circle cx="${x1}" cy="${y1}" r="3.5" fill="${C.blue}"/>${T(x2 + (anchor === 'start' ? 6 : -6), y2 + 4, txt, { size: 11.5, fill: C.ink, anchor })}`;
opener('02 Logo', '02', 'Logo', 'One monoline stroke, three letters, three dots. How the PhE mark is drawn, spaced, coloured — and protected.', `
${markG(520, 300, 520, { color: C.warm, dot: C.blue })}`, { listStyle: 'max-width:340px' });

{
  const mw = 560, k = mw / W, ox = 50, oy = 90;
  const P = (x, y) => [ox + x * k, oy + y * k];
  const st = id => STROKES.find(p => p.id === id); const [ax, ay] = P(st('P').pts[0][0], 80), [bx, by] = P(dot('dot-h').cx, dot('dot-h').cy), [dx, dy] = P(dot('dot-E').cx, dot('dot-E').cy), [ex, ey] = P(st('h-stem').pts[0][0], st('h-stem').pts[0][1]);
  page('02 Logo', 'The logo', `
<div style="position:absolute;left:0;top:0;width:310px">${head('02 · Logo', 'The PhE mark', 'P, h and E drawn with a single monoline stroke and rounded ends, resting on three dots. It is friendly at a glance, precise up close, and simple enough to animate, emboss, neon-bend or cut from a single sheet.')}
${bullets(['Always use the master artwork — never redraw or retype it.', 'The mark can stand alone; the wordmark “PurpleHat Events” is added whenever the audience may not know us yet.', 'Primary colour is PurpleHat Violet on Warm White.'])}</div>
<div style="position:absolute;left:330px;top:0;width:664px;height:638px;background:#fff;border-radius:18px;overflow:hidden">
${svg(664, 638, `${markG(ox, oy, mw, { color: C.violet })}
${ann(ax - 12 * k, ay, 30, 50, 'Monoline stroke, round caps')}
${ann(ex, ey - 12 * k, ex + 40, 50, 'Open forms — nothing closes')}
${ann(bx, by + 14, bx - 40, 380, 'Three dots on the baseline', 'end')}
${ann(dx, dy + 14, dx - 10, 400, 'E dot (new)', 'end')}
<line x1="40" y1="440" x2="624" y2="440" stroke="${C.g200}"/>
${lockupG('primary', 50, 470, 230, { color: C.violet })}
${T(320, 520, 'Primary lockup: mark + wordmark,', { size: 11.5, fill: C.g500 })}${T(320, 536, 'wordmark aligned to the P stem.', { size: 11.5, fill: C.g500 })}`)}</div>`);
}

{ // construction
  const mw = 600, k = mw / W, ox = 44, oy = 70; const g = [];
  const arcs = STROKES.flatMap(p => arcsOf(p.line));
  for (let x = 0; x <= W + 0.1; x += SW) g.push(`<line x1="${f2(ox + x * k)}" y1="${oy - 30}" x2="${f2(ox + x * k)}" y2="${f2(oy + H * k + 30)}" stroke="${C.g200}" stroke-width="0.7"/>`);
  for (let y = 0; y <= H + 0.1; y += SW) g.push(`<line x1="${ox - 20}" y1="${f2(oy + y * k)}" x2="${f2(ox + W * k + 20)}" y2="${f2(oy + y * k)}" stroke="${C.g200}" stroke-width="0.7"/>`);
  const guides = [0, 12, 57.39, 69.39, 147.09, H].map((y, i) => `<line x1="${ox - 20}" y1="${f2(oy + y * k)}" x2="${f2(ox + W * k + 20)}" y2="${f2(oy + y * k)}" stroke="${C.blue}" stroke-width="0.8" stroke-dasharray="${i % 2 ? '3 3' : '0'}" opacity=".7"/>`).join('');
  const circles = arcs.map(a => `<circle cx="${f2(ox + a.cx * k)}" cy="${f2(oy + a.cy * k)}" r="${f2(a.r * k)}" fill="none" stroke="${C.violet}" stroke-width="0.9" stroke-dasharray="4 3"/><circle cx="${f2(ox + a.cx * k)}" cy="${f2(oy + a.cy * k)}" r="2" fill="${C.violet}"/>`).join('');
  const dimW = `<g stroke="${C.ink}" stroke-width="0.8"><line x1="${ox}" y1="${oy - 44}" x2="${f2(ox + W * k)}" y2="${oy - 44}"/><line x1="${ox}" y1="${oy - 50}" x2="${ox}" y2="${oy - 38}"/><line x1="${f2(ox + W * k)}" y1="${oy - 50}" x2="${f2(ox + W * k)}" y2="${oy - 38}"/></g>${T(ox + W * k / 2, oy - 50, `${f2(W / SW)} w`, { size: 11, anchor: 'middle', fill: C.ink })}`;
  const dimH = `<g stroke="${C.ink}" stroke-width="0.8"><line x1="${f2(ox + W * k + 34)}" y1="${oy}" x2="${f2(ox + W * k + 34)}" y2="${f2(oy + H * k)}"/></g>${T(ox + W * k + 40, oy + H * k / 2, `${f2(H / SW)} w`, { size: 11, fill: C.ink })}`;
  page('02 Logo', 'Construction', `
<div style="position:absolute;left:0;top:0;width:250px">${head('02 · Logo', 'Construction', 'One unit drives everything: the stroke width, <b>w</b>. Curves are true arcs, ends are full round caps, and every dot is 1.06 w across — a hair larger than the stroke so it reads as a dot, not a line end.')}
<table class="spec">${[['Stroke', '1 w'], ['Dot diameter', `${f2(RD * 2 / SW)} w`], ['Overall', `${f2(W / SW)} × ${f2(H / SW)} w`], ['P bowl radius', `${f2(arcsOf(STROKES[0].line).at(-1).r / SW)} w`], ['h arch radius', `${f2(arcsOf(STROKES.find(p => p.id === 'h-arch').line)[0].r / SW)} w`], ['E bowl radius', `${f2(arcsOf(STROKES.find(p => p.id === 'E-bowl').line)[0].r / SW)} w`], ['Stroke → dot gap', '≈ 0.3 w']].map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</table></div>
<div style="position:absolute;left:270px;top:0;width:724px;height:638px;background:#fff;border-radius:18px">
${svg(724, 638, `<g transform="translate(0 175)">${g.join('')}${guides}${markG(ox, oy, mw, { color: '#B7B2BF' })}${circles}${dimW}${dimH}
${T(ox, oy + H * k + 62, 'Grid = 1 w squares · blue lines: cap, stroke centre, x-height, dot baseline, foot · dashed circles: construction arcs', { size: 11, fill: C.g500 })}</g>`)}</div>`);
}

{ // E dot
  const mw = 400, k = mw / W;
  const P = id => STROKES.find(s => s.id === id);
  const hl = (x, y, w, h) => `<rect x="${f2(x * k)}" y="${f2(y * k)}" width="${f2(w * k)}" height="${f2(h * k)}" fill="${C.blue}" opacity=".55" rx="2"/>`;
  const dE = dot('dot-E'), dP = dot('dot-P'), dH = dot('dot-h');
  const pS = P('P').pts[0], eE = P('E-bowl').pts.at(-1); const gapP = (dP.cy - RD) - (pS[1] + SW / 2), gapE = (dE.cx - RD) - (eE[0] + SW / 2);
  page('02 Logo', 'The E dot', `
<div style="position:absolute;left:0;top:0;width:300px">${head('02 · Logo', 'Why the E has a dot', 'In the original drawing only the P and the h ended in a dot; the E ran a full bar to the edge. At the client’s request the E’s bottom bar now stops short and finishes on a dot.')}
${bullets([`<b>One rhythm.</b> All three letters now end the same way — stroke, small gap, dot. The gap is ${f2(gapP / SW)} w under the P and ${f2(gapE / SW)} w after the E.`, '<b>Three dots, three words.</b> People · Places · Experiences — the concept, counted out on the baseline.', '<b>A better ending.</b> The mark now finishes on a dot, like a full stop — and gives motion a third beat.'])}</div>
<div style="position:absolute;left:330px;top:0;width:664px;display:grid;grid-template-rows:1fr 1fr;gap:16px;height:638px">
<div class="tile" style="flex-direction:row;gap:40px">
 <div style="text-align:center">${svg(260, markH(260), markG(0, 0, 260, { color: '#B7B2BF', eFull: true }))}<div class="tcap" style="position:static;margin-top:16px">Before — full bar, two dots</div></div>
 <svg width="40" height="20" viewBox="0 0 40 20"><path d="M2 10h34m-8-7 8 7-8 7" stroke="${C.violet}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
 <div style="text-align:center">${svg(260, markH(260), markG(0, 0, 260, { color: C.violet, dot: C.blue }))}<div class="tcap" style="position:static;margin-top:16px;color:${C.violet}">After — bar pulled in, E dot added</div></div></div>
<div class="tile">${svg(mw + 40, markH(mw) + 50, `<g transform="translate(20 10)">${markG(0, 0, mw, { color: '#CFCAD6', dot: C.blue })}
 ${hl(pS[0] - 12, pS[1] + 12, 24, gapP)}${hl(eE[0] + 12, eE[1] - 12, gapE, 24)}
 ${markG(0, 0, mw, { color: C.violet, only: ['P', 'E-bowl'], hideDots: true })}
 ${T(12 * k, markH(mw) + 30, 'stroke · gap · dot', { size: 11, fill: C.blue, anchor: 'start', ls: 0.1, caps: true, weight: 500 })}
 ${T(437.5 * k, markH(mw) + 30, 'stroke · gap · dot', { size: 11, fill: C.blue, anchor: 'end', ls: 0.1, caps: true, weight: 500 })}</g>`)}
 <div class="tcap">The same ending under the P and after the E (gaps highlighted)</div></div></div>`);
}

{ // clear space & min size
  const mw = 420, k = mw / W, D = RD * 2 * 2 * k; // 2 dot diameters
  const box = (x, y, w, h) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="none" stroke="${C.blue}" stroke-width="1" stroke-dasharray="4 3"/>`;
  const unit = (cx, cy) => `<circle cx="${f2(cx - D / 4)}" cy="${f2(cy)}" r="${f2(D / 4)}" fill="${C.blue}" opacity=".35"/><circle cx="${f2(cx + D / 4)}" cy="${f2(cy)}" r="${f2(D / 4)}" fill="${C.blue}" opacity=".35"/>`;
  const ox = 40 + D, oy = 40 + D;
  page('02 Logo', 'Clear space & minimum size', `
<div style="position:absolute;left:0;top:0;width:290px">${head('02 · Logo', 'Clear space & minimum size', 'Give the mark room to breathe: keep clear space of two dot diameters (2D) on every side — no text, edges or other logos inside it.')}
<table class="spec"><tr><td>Clear space</td><td>2 D (≈ 2.1 w)</td></tr><tr><td>Mark — print</td><td>min. 15 mm wide</td></tr><tr><td>Mark — screen</td><td>min. 64 px wide</td></tr><tr><td>Lockup — print</td><td>min. 28 mm wide</td></tr><tr><td>Lockup — screen</td><td>min. 120 px wide</td></tr><tr><td>Below 32 px</td><td>use the app icon / favicon</td></tr></table></div>
<div style="position:absolute;left:320px;top:0;width:674px;height:330px;background:#fff;border-radius:18px">
${svg(674, 330, `${box(ox - D, oy - D, mw + 2 * D, markH(mw) + 2 * D)}<rect x="${f2(ox)}" y="${f2(oy)}" width="${mw}" height="${f2(markH(mw))}" fill="none" stroke="${C.g300}" stroke-width=".7"/>${markG(ox, oy, mw, { color: C.violet })}
${unit(ox - D / 2, oy - D / 2)}${unit(ox + mw + D / 2, oy - D / 2)}${unit(ox - D / 2, oy + markH(mw) + D / 2)}${unit(ox + mw + D / 2, oy + markH(mw) + D / 2)}
${T(ox + mw + D + 26, oy + 20, '2D', { size: 22, fill: C.blue, weight: 500 })}${T(ox + mw + D + 26, oy + 40, 'two dot', { size: 11, fill: C.g500 })}${T(ox + mw + D + 26, oy + 54, 'diameters', { size: 11, fill: C.g500 })}`)}</div>
<div style="position:absolute;left:320px;top:346px;width:674px;height:292px;background:#fff;border-radius:18px">
${svg(674, 292, `${[[200, '200 px · 50 mm'], [120, '120 px · 30 mm'], [64, '64 px · 15 mm (min.)']].map(([w, l], i) => { const x = [30, 270, 430][i]; return markG(x, 120 - markH(w) / 2, w, { color: C.violet }) + T(x, 190, l, { size: 11, fill: i === 2 ? C.blue : C.g500, weight: i === 2 ? 500 : 400 }); }).join('')}
${markG(586, 113, 36, { color: C.violet })}<line x1="578" y1="106" x2="630" y2="132" stroke="${C.warn}" stroke-width="2"/>${T(578, 190, 'Too small', { size: 11, fill: C.warn })}
<line x1="30" y1="222" x2="644" y2="222" stroke="${C.g200}"/>
<g transform="translate(30 238)">${appIconInner(36)}</g><g transform="translate(80 244)">${appIconInner(24, { r: 0.24 })}</g><g transform="translate(116 248)">${appIconInner(16, { r: 0.25 })}</g>
${T(150, 262, 'App icon & favicon (../svg/phe-app-icon.svg, phe-favicon.svg) take over below 32 px.', { size: 11, fill: C.g500 })}`)}</div>`);
}

page('02 Logo', 'Logo variations', `
<div style="position:absolute;left:0;top:0;width:994px">${head('02 · Logo', 'Variations & lockups')}</div>
<div class="grid3" style="position:absolute;left:0;right:0;top:92px;bottom:0">
${tile(lockup('primary', { width: 250, color: C.violet }), { cap: 'Primary lockup — default for everything' })}
${tile(mark({ width: 260, color: C.violet }), { cap: 'Mark — when the name is already known' })}
${tile(lockup('horizontal', { width: 280, color: C.violet }), { cap: 'Horizontal — headers, narrow bands, signatures' })}
${tile(lockup('stacked', { width: 200, color: C.violet }), { cap: 'Stacked — badges, tall formats' })}
${tile(pillLockup({ width: 260, color: C.violet }), { cap: 'Pill lockup — tags, stickers, buttons (no mark)' })}
${tile(`<div style="display:flex;gap:26px;align-items:center">${svg(110, 110, appIconInner(110))}${svg(56, 56, appIconInner(56, { r: 0.24 }))}${svg(28, 28, appIconInner(28, { r: 0.25 }))}</div>`, { cap: 'App icon & favicon' })}
</div>`);

page('02 Logo', 'Colourways', (() => {
  const cw = [
    ['Primary', C.warm, { color: C.violet }, 'Violet on Warm White'],
    ['Reversed', C.violet, { color: C.warm }, 'Warm White on Violet'],
    ['Two-tone', C.warm, { color: C.violet, dot: C.blue }, 'Violet, Electric Blue dots'],
    ['On blue', C.blue, { color: C.white }, 'White on Electric Blue'],
    ['Mono', C.white, { color: '#000' }, 'Black — 1-colour print, fax, emboss'],
    ['On image', null, { color: C.warm }, 'Warm White on purple-graded photo'],
  ];
  return `<div style="position:absolute;left:0;top:0;width:994px">${head('02 · Logo', 'Colourways & backgrounds', 'Use the mark in one colour — or with the dots picked out in Electric Blue. Choose the version that gives the strongest contrast with the background.')}</div>
<div class="grid3" style="position:absolute;left:0;right:0;top:150px;height:300px">
${cw.map(([n, bg, o, d]) => `<div class="tile" style="background:${bg || C.v950};${bg === C.white || bg === C.warm ? `border:1px solid ${C.sand}` : ''}">${bg ? '' : `<svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">${photo(320, 150, { seed: 14, label: '' })}</svg>`}<div style="position:relative">${mark({ width: 200, ...o })}</div><div class="tcap" style="color:${[C.violet, C.blue, null].includes(bg) ? C.v200 : C.g500}">${n} — ${d}${bg ? ` · ${contrast(o.color, bg).toFixed(1)}:1` : ''}</div></div>`).join('')}</div>
<div style="position:absolute;left:0;right:0;top:476px;bottom:0;display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
${[[C.blue, { color: C.violet }, 'Violet on blue'], [C.violet, { color: C.blue }, 'Blue on violet'], [C.v400, { color: C.warm }, 'Light on mid-tone'], [null, { color: C.violet }, 'On a busy pattern']].map(([bg, o, n]) => `<div class="tile" style="background:${bg || C.warm}">${bg ? '' : `<svg viewBox="0 0 240 150" style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="xMidYMid slice">${pattern(240, 150, { mode: 'mix', u: 26, sw: 2, color: C.blue })}</svg>`}<div style="position:relative">${mark({ width: 150, ...o })}</div><div class="tcap" style="color:${bg === C.violet ? C.v200 : bg === C.blue ? C.white : C.ink};${bg ? '' : `background:${C.warm};border-radius:8px;padding:3px 6px;left:10px;right:auto`}">${X} ${n}${bg ? ` · ${contrast(o.color, bg).toFixed(1)}:1` : ''}</div></div>`).join('')}</div>`;
})());

page('02 Logo', 'Misuse', (() => {
  const t = (inner, n) => `<div class="tile" style="background:#fff">${inner}<div class="tcap" style="color:${C.ink}">${X} ${n}</div></div>`;
  const m = o => mark({ width: 170, color: C.violet, ...o });
  return `<div style="position:absolute;left:0;top:0;width:994px">${head('02 · Logo', 'Please don’t', 'The mark only works when it is left exactly as drawn. These are the most common mistakes — all drawn here from the real artwork.')}</div>
<div style="position:absolute;left:0;right:0;top:140px;bottom:0;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:1fr 1fr;gap:14px">
${t(m({ width: 120, style: 'transform:scaleX(1.45) scaleY(.8)' }), 'Stretch or squash')}
${t(`<svg viewBox="0 0 ${W} ${H}" style="width:170px;height:${f2(170 * H / W)}px;overflow:visible"><defs><linearGradient id="mg" x1="0" x2="1"><stop offset="0" stop-color="#FF7A00"/><stop offset="1" stop-color="#E5007E"/></linearGradient></defs>${markInner({ color: 'url(#mg)', dotFill: '#22B573' })}</svg>`, 'Recolour or add gradients')}
${t(m({ style: 'filter:drop-shadow(6px 8px 4px rgba(0,0,0,.45)) drop-shadow(0 0 10px #8B5CF6)' }), 'Add shadows, glows or effects')}
${t(m({ style: 'transform:rotate(-14deg)' }), 'Rotate or set on a slant')}
${t(`<svg viewBox="0 0 ${W} ${H}" style="width:170px;height:${f2(170 * H / W)}px;overflow:visible">${markInner({ color: C.violet, outline: true, outlineW: 4 })}</svg>`, 'Outline the mark')}
${t(`<div style="display:flex;align-items:flex-end;gap:4px">${m({ width: 120 })}<span style="font-size:20px;color:${C.violet};font-weight:500;line-height:1">Summit<br>2026</span></div>`, 'Crowd it — respect clear space')}
${t(`<svg viewBox="0 0 ${W} ${H}" style="width:170px;height:${f2(170 * H / W)}px;overflow:visible">${markInner({ color: C.violet, dotDy: { 'dot-P': -110, 'dot-h': 0, 'dot-E': -134 } })}</svg>`, 'Move, add or remove dots')}
${t(`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">${m({ width: 150 })}<span style="font-family:Georgia,serif;font-style:italic;font-size:21px;color:${C.violet}">PurpleHat Events</span></div>`, 'Retype the wordmark')}
</div>`;
})());

// ===================================================================================== 03 IDENTITY
const SW_ = [
  ['PurpleHat Violet', C.violet, 'C95 M100 Y0 K25', 'Pantone 2685 C', 'Primary. Logo, headlines, large fields.'],
  ['Electric Blue', C.blue, ACCENT.cmyk, ACCENT.pms, 'Accent. Dots, links, highlights, CTAs.'],
  ['Warm White', C.warm, 'C3 M4 Y8 K0', 'Natural-white stock / Warm Gray 1 C 20%', 'Neutral. Backgrounds, paper.'],
  ['Night Ink', C.ink, 'C85 M90 Y40 K60', 'Pantone 5255 C', 'Body text, fine detail, mono print.'],
];
page('04 Identity', 'Colour palette', `
<div style="position:absolute;left:0;top:0;width:994px">${head('04 · Identity system', 'Colour', 'Three colours from the board, plus an ink for text. Lead with Warm White and Violet; use Electric Blue sparingly — it is the spark, not the room.')}</div>
<div style="position:absolute;left:0;right:0;top:150px;height:350px;display:grid;grid-template-columns:1.4fr 1.15fr 1fr .8fr;gap:14px">
${SW_.map(([n, h, cmyk, pms, use]) => `<div class="sw" style="background:${h};color:${contrast(h, C.white) > 4.5 ? C.warm : C.ink};${h === C.warm ? `border:1px solid ${C.sand}` : ''}"><div class="swn">${n}</div><div class="swd"><b>${h}</b><br>RGB ${hexRgb(h).join(' ')}<br>${cmyk} *<br>${pms} *<br><span style="opacity:.75">${use}</span></div></div>`).join('')}</div>
<div style="position:absolute;left:0;right:0;top:520px">
<div class="lab" style="margin-bottom:8px">Proportion</div>
<div style="display:flex;height:34px;border-radius:17px;overflow:hidden;border:1px solid ${C.sand}"><div style="flex:55;background:${C.warm}"></div><div style="flex:28;background:${C.violet}"></div><div style="flex:10;background:${C.blue}"></div><div style="flex:7;background:${C.ink}"></div></div>
<div style="display:flex;font-size:11px;color:${C.g500};margin-top:6px"><span style="flex:55">Warm White ≈ 55%</span><span style="flex:28">Violet ≈ 28%</span><span style="flex:10">Blue ≈ 10%</span><span style="flex:7">Ink ≈ 7%</span></div>
<p class="small" style="margin-top:14px">* CMYK and Pantone values are approximate starting points derived from the screen colours. Always proof against a physical swatch book and the printer’s profile before a print run.</p></div>`);

{
  const ramp = (name, arr) => `<div class="ramp"><div class="rn">${name}</div>${arr.map(([n, h]) => `<div class="rc" style="background:${h};color:${contrast(h, C.white) > 3.2 ? '#fff' : C.ink}"><b>${n}</b><span>${h}</span></div>`).join('')}</div>`;
  const pairs = [[C.violet, C.warm], [C.ink, C.warm], [C.warm, C.violet], [C.blue, C.warm], [C.white, C.blue], [C.v200, C.violet], [C.g500, C.warm], [C.blue, C.violet]];
  page('04 Identity', 'Extended palette', `
<div style="position:absolute;left:0;top:0;width:994px">${head('04 · Identity system', 'Extended palette & accessibility')}</div>
<div style="position:absolute;left:0;top:80px;width:620px;display:flex;flex-direction:column;gap:10px">
${ramp('Violet', [['950', C.v950], ['900 · Primary', C.violet], ['800', C.v800], ['600', C.v600], ['400', C.v400], ['200', C.v200], ['100', C.v100]])}
${ramp('Blue', [['800', C.b800], ['600 · Accent', C.blue], ['400', C.b400], ['200', C.b200], ['100', C.b100]])}
${ramp('Neutral', [['Paper', C.paper], ['Warm White', C.warm], ['Sand', C.sand], ['Stone', C.stone]])}
${ramp('Ink & UI greys', [['Ink', C.ink], ['700', C.g700], ['500', C.g500], ['400', C.g400], ['300', C.g300], ['200', C.g200]])}
<p class="small">Tints and shades are for UI states, charts, dividers and secondary surfaces — never to recolour the logo.</p></div>
<div style="position:absolute;left:650px;top:80px;width:344px">
<div class="lab" style="margin-bottom:10px">Text contrast (WCAG 2.x)</div>
<table class="acc">${pairs.map(([f, b]) => { const c = contrast(f, b); return `<tr><td><span class="chip" style="background:${b};color:${f}">Aa</span></td><td>${f} on ${b}</td><td><b>${c.toFixed(1)}:1</b></td><td>${c >= 7 ? 'AAA' : c >= 4.5 ? 'AA' : c >= 3 ? 'Large only' : 'Graphic only'}</td></tr>`; }).join('')}</table>
<p class="small" style="margin-top:10px">Body text needs 4.5:1. Electric Blue on Violet is for graphics (dots, shapes) only — never for text.</p></div>`);
}

page('04 Identity', 'Typeface', `
<div class="note" style="position:absolute;right:0;top:0;width:330px"><b>Stand-in notice.</b> The brand typeface is <b>Satoshi</b> (Indian Type Foundry, via Fontshare — free for commercial use under the ITF Free Font Licence; check current terms at fontshare.com). It could not be downloaded in the environment that produced this document, so every specimen here is set in <b>DM Sans</b>, the closest freely available match. All production files must use Satoshi.</div>
<div style="position:absolute;left:0;top:0;width:600px">${head('04 · Identity system', 'Typography', 'Satoshi — a clean, modern geometric sans with a friendly, approachable tone. Its round letters echo the mark without copying it.')}</div>
<div style="position:absolute;left:0;top:190px;font-size:200px;line-height:.9;color:${C.violet};font-weight:500;letter-spacing:-.04em">Aa</div>
<div style="position:absolute;left:300px;top:200px;width:694px;font-size:24px;line-height:1.35;color:${C.violet};letter-spacing:-.01em">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 &amp; @ ₹ % ( ) · — “ ” !?</div>
<div style="position:absolute;left:0;right:0;top:400px;display:grid;grid-template-columns:repeat(5,1fr);gap:12px">
${[[300, 'Light', 'Large display only'], [400, 'Regular', 'Body copy'], [500, 'Medium', 'Headlines, wordmark'], [700, 'Bold', 'Emphasis, names'], [900, 'Black', 'Numbers, rare punch']].map(([w, n, u]) => `<div class="tile" style="padding:18px;align-items:flex-start;justify-content:flex-start;height:200px"><div style="font-size:54px;font-weight:${w};color:${C.violet};letter-spacing:-.02em;line-height:1">Ag</div><div style="margin-top:auto;font-size:13px;font-weight:${w};color:${C.ink}">Satoshi ${n}</div><div class="small">${w} · ${u}</div></div>`).join('')}</div>`);

page('04 Identity', 'Type scale', `
<div style="position:absolute;left:0;top:0;width:300px">${head('04 · Identity system', 'Type scale & usage', 'A simple scale with a 1.33 ratio. Headlines in Medium with tight tracking, body in Regular, labels in Medium caps with wide tracking — exactly as on the board.')}
${bullets(['Sentence case for headlines. CAPS only for short labels.', 'Left-aligned, ragged right. Never justify.', 'End statements with a full stop — it is the brand’s dot.', 'System fallback: DM Sans, then Arial.'])}</div>
<div style="position:absolute;left:330px;top:0;right:0;bottom:0;background:#fff;border-radius:18px;padding:22px 28px">
<table class="scale">${[['Display', 64, 68, 500, '-0.03em', 'Ideas take shape.'], ['H1', 44, 50, 500, '-0.02em', 'A connected tomorrow'], ['H2', 32, 38, 500, '-0.015em', 'Conferences & PCO'], ['H3', 22, 28, 500, '-0.01em', 'Delegate registration opens Monday'], ['Body L', 17, 26, 400, '0', 'We bring people, ideas and places together.'], ['Body', 14, 22, 400, '0', 'Doors open at 6 pm. Come early for chai and introductions.'], ['Small', 11.5, 17, 400, '0', 'Terms apply. Programme subject to change.'], ['Label', 10, 14, 500, '0.22em', 'PEOPLE · IDEAS · PLACES']].map(([n, s, l, w, ls, ex]) => `<tr><td class="sn">${n}<span>${s}/${l} · ${w === 500 ? 'Medium' : 'Regular'}${ls !== '0' ? ' · ' + ls : ''}</span></td><td><div style="font-size:${s}px;line-height:${l}px;font-weight:${w};letter-spacing:${ls};color:${n === 'Label' ? C.blue : C.violet};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:520px">${ex}</div></td></tr>`).join('')}</table>
<p class="small" style="margin-top:8px">Sizes in px for screen; for print read as pt × 0.75 (e.g. Body 14 px ≈ 10.5 pt).</p></div>`);

page('04 Identity', 'The dot system', (() => {
  const dd = 16; const blue = C.blue;
  return `
<div style="position:absolute;left:0;top:0;width:300px">${head('04 · Identity system', 'The dot system', 'The three dots are the most ownable part of the identity. Lifted out of the mark, a dot becomes a bullet, a separator, a status light, a loader and a full stop.')}
<p class="body">Keep dots perfectly round and solid. One accent dot per composition is in Electric Blue; the rest follow the main colour.</p></div>
<div style="position:absolute;left:330px;top:0;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:14px">
${tile(mark({ width: 125, color: '#D8D4DE', dot: blue }), { cap: 'Source — the three baseline dots' })}
${tile(`<div style="font-size:15px;line-height:2;color:${C.ink}">${['Registration', 'Keynote', 'Networking'].map(x => `<div><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${blue};margin-right:12px"></span>${x}</div>`).join('')}</div>`, { cap: 'Bullets' })}
${tile(`<div style="font-size:11px;letter-spacing:.2em;color:${C.violet};font-weight:500;line-height:2.2;text-align:center">PEOPLE <span style="color:${blue}">●</span> PLACES<br><span style="color:${blue}">●</span> EXPERIENCES <span style="color:${blue}">●</span></div>`, { cap: 'Separators' })}
${tile(`<div style="display:flex;gap:12px">${[1, .55, .25].map((o, i) => `<span class="ld" style="width:${dd}px;height:${dd}px;border-radius:50%;background:${C.violet};opacity:${o};animation-delay:${i * 0.15}s"></span>`).join('')}</div>`, { cap: 'Loader — three dots, staggered' })}
${tile(`<div style="display:flex;flex-direction:column;gap:12px">${[1, 0].map(on => `<div style="width:84px;height:40px;border-radius:20px;border:2.5px solid ${C.violet};position:relative"><div style="position:absolute;top:5px;${on ? 'right' : 'left'}:5px;width:25px;height:25px;border-radius:50%;background:${on ? blue : 'transparent'};border:${on ? 0 : '2.5px solid ' + C.violet};box-sizing:border-box"></div></div>`).join('')}</div>`, { cap: 'Toggle — off / on (experience)' })}
${tile(`<div style="font-size:42px;font-weight:500;color:${C.violet};letter-spacing:-.02em;line-height:1.05">Let’s meet<span style="color:${blue}">.</span></div>`, { cap: 'Full stop — the dot in a headline' })}
</div>`;
})());

page('04 Identity', 'Pattern system', `
<div style="position:absolute;left:0;top:0;width:280px">${head('04 · Identity system', 'Pattern system', 'Pills and circles — people and places — set in rows. Patterns are generated from a single module <b>u</b>, so they scale cleanly from a ticket to a stage.')}
<table class="spec"><tr><td>Module</td><td>u (circle Ø = pill height)</td></tr><tr><td>Pill length</td><td>1.8–3.3 u</td></tr><tr><td>Gap</td><td>0.32 u</td></tr><tr><td>Stroke</td><td>u ÷ 16 — u ÷ 50</td></tr><tr><td>Colours</td><td>Blue on Warm · Violet-600 on Violet</td></tr></table>
${bullets(['Outline only; fill at most one shape (the accent dot).', 'Fade patterns out under text and logos.', 'Crop shapes at the edge, never inside.'])}</div>
<div style="position:absolute;left:310px;top:0;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px">
${[['grid', C.warm, C.blue, 'Rhythm'], ['big', C.violet, C.v200, 'Scale'], ['mix', C.warm, C.blue, 'Flow'], ['toggle', C.warm, C.violet, 'Switch']].map(([m, bg, col, n], i) => `<div class="tile" style="background:${bg};padding:0;overflow:hidden">${svg(165, 600, pattern(165, 600, { mode: m, u: m === 'big' ? 60 : 34, sw: 2.2, color: col, accent: C.blue, seed: 3 + i }))}<div class="tcap" style="background:${bg === C.violet ? C.violet : C.warm};color:${bg === C.violet ? C.v200 : C.violet};padding:4px 10px;border-radius:10px;left:10px;bottom:10px">${n}</div></div>`).join('')}
</div>`);

{ // motion principles
  const fw = 142, mw = 118, k = mw / W;
  const frame = (inner, i, label) => `<g transform="translate(${i * (fw + 10)} 0)"><rect width="${fw}" height="104" rx="10" fill="#fff"/><g transform="translate(12 30)">${inner}</g>${T(12, 94, label, { size: 9.5, fill: C.g500 })}</g>`;
  const ghost = (id, dy, n = 3) => { const d = dot(id); let s = ''; for (let i = 1; i <= n; i++) s += `<circle cx="${d.cx}" cy="${d.cy + dy - i * 22}" r="${RD}" fill="${C.blue}" opacity="${(0.25 / i).toFixed(2)}"/>`; return s; };
  const mk = (o, extra = '') => `<g transform="scale(${k.toFixed(4)})">${markInner({ color: C.violet, dot: C.blue, ...o })}${extra}</g>`;
  const rows = [
    ['Drop', 'Dots fall onto the baseline, one after another (P → h → E).', [mk({ hideDots: true }), mk({ only: ['P', 'h-stem', 'h-arch', 'E-top', 'E-bowl', 'dot-P'], dotDy: { 'dot-P': -60 } }, ghost('dot-P', -60)), mk({ only: ['P', 'h-stem', 'h-arch', 'E-top', 'E-bowl', 'dot-P', 'dot-h'], dotDy: { 'dot-h': -40 } }, ghost('dot-h', -40)), mk({ dotDy: { 'dot-E': -30 } }, ghost('dot-E', -30)), mk({})], ['0 ms', '120 ms', '210 ms', '300 ms', '480 ms']],
    ['Bounce', 'On landing a dot squashes, rebounds twice, and settles. Never more than two bounces.', [mk({ dotDy: { 'dot-E': 0 } }), mk({ dotDy: { 'dot-E': -36 } }), mk({}), mk({ dotDy: { 'dot-E': -12 } }), mk({})], ['land', '+160 ms', '+280 ms', '+360 ms', 'rest']],
    ['Pulse', 'A dot breathes 1 → 1.25 → 1 to mark a live moment: recording, “now on stage”, loading.', [mk({}), mk({ dotScale: 1.12 }), mk({ dotScale: 1.25 }), mk({ dotScale: 1.12 }), mk({})], ['0', '300 ms', '600 ms', '900 ms', '1200 ms']],
    ['Travel', 'A dot slides through a pill — the experience toggle switching on.', [0, .25, .5, .75, 1].map(t => `<rect x="0" y="0" width="${mw}" height="44" rx="22" fill="none" stroke="${C.violet}" stroke-width="2.5"/><circle cx="${22 + t * (mw - 44)}" cy="22" r="15" fill="${t === 1 ? C.blue : 'none'}" stroke="${t === 1 ? C.blue : C.violet}" stroke-width="2.5"/>`), ['off', '', '', '', 'on']],
  ];

// full-page pattern systems
PATTERNS.forEach(([name, fn, use], i) => page('04 Identity', `Pattern · ${name}`, `${patternPage(fn)}
<div class="pt-cap"><span class="n">P${String(i + 1).padStart(2, '0')}</span><b>${name}</b><span>${use}</span></div>`, { noChrome: true }));

  page('04 Identity', 'Motion principles', `
<div style="position:absolute;left:0;top:0;width:200px">${head('04 · Identity system', 'Motion', 'The dots are the animation device. Letters stay calm and draw on once; dots do the moving — they drop, bounce, pulse and travel.')}
<div class="livemark" style="margin-top:20px">${mark({ width: 180, color: C.violet, dot: C.blue, cls: 'anim-mark' })}<div class="small" style="margin-top:6px">Live in the HTML version.</div></div></div>
<div style="position:absolute;left:230px;top:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:space-between">
${rows.map(([n, d, fr, labels]) => `<div><div style="display:flex;gap:12px;align-items:baseline;margin-bottom:6px"><div style="font-size:16px;color:${C.violet};font-weight:500;width:60px">${n}</div><div class="small">${d}</div></div>${svg(5 * (fw + 10) - 10, 104, fr.map((f, i) => frame(f, i, labels[i])).join(''))}</div>`).join('')}</div>`);
}

{ // motion timing
  const curve = (x1, y1, x2, y2, n, col, val) => `<div class="tile" style="padding:14px;align-items:flex-start;justify-content:flex-start">${svg(140, 110, `<rect x="0" y="0" width="140" height="100" fill="none" stroke="${C.g200}"/><path d="M0 100 C ${x1 * 140} ${100 - y1 * 100} ${x2 * 140} ${100 - y2 * 100} 140 0" fill="none" stroke="${col}" stroke-width="2.5"/><line x1="0" y1="100" x2="${x1 * 140}" y2="${100 - y1 * 100}" stroke="${C.g300}"/><line x1="140" y1="0" x2="${x2 * 140}" y2="${100 - y2 * 100}" stroke="${C.g300}"/><circle cx="${x1 * 140}" cy="${100 - y1 * 100}" r="3" fill="${col}"/><circle cx="${x2 * 140}" cy="${100 - y2 * 100}" r="3" fill="${col}"/>`)}<div style="font-size:13px;color:${C.violet};font-weight:500;margin-top:6px">${n}</div><div class="small mono">${val}</div></div>`;
  const tl = [['Strokes draw on', 0, 700, C.violet], ['P dot drops', 560, 1040, C.blue], ['h dot drops', 650, 1130, C.blue], ['E dot drops', 740, 1220, C.blue], ['Bounce ×2', 1040, 1400, C.b400], ['E dot pulse', 1500, 2100, C.v400], ['Wordmark fades up', 1200, 1600, C.g400]];
  const X0 = 130, SC = 0.3;
  page('04 Identity', 'Motion timing', `
<div style="position:absolute;left:0;top:0;width:994px">${head('04 · Identity system', 'Motion: timing & easing')}</div>
<div style="position:absolute;left:0;top:80px;width:994px;height:250px;background:#fff;border-radius:18px;padding:18px 22px">
<div class="lab" style="margin-bottom:8px">Logo sting · 2.1 s</div>
${svg(950, 200, `${[0, 500, 1000, 1500, 2000].map(t => `<line x1="${X0 + t * SC}" y1="0" x2="${X0 + t * SC}" y2="180" stroke="${C.g200}"/>${T(X0 + t * SC, 196, t + ' ms', { size: 10, fill: C.g500, anchor: 'middle' })}`).join('')}
${tl.map(([n, a, b, c], i) => `${T(0, 14 + i * 24, n, { size: 11, fill: C.ink })}<rect x="${X0 + a * SC}" y="${4 + i * 24}" width="${(b - a) * SC}" height="14" rx="7" fill="${c}"/>`).join('')}
<g transform="translate(${X0 + 2150 * SC} 30)">${markG(0, 0, 150, { color: C.violet, dot: C.blue })}${T(0, 90, 'Rest frame', { size: 10, fill: C.g500 })}</g>`)}</div>
<div style="position:absolute;left:0;top:350px;width:640px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
${curve(.22, 1, .36, 1, 'Ease out — arrive', C.violet, 'cubic-bezier(.22,1,.36,1)')}${curve(.55, 0, 1, .45, 'Ease in — drop', C.blue, 'cubic-bezier(.55,0,1,.45)')}${curve(.65, 0, .35, 1, 'In-out — travel', C.v600, 'cubic-bezier(.65,0,.35,1)')}${curve(.45, 0, .55, 1, 'Sine — pulse', C.b400, 'cubic-bezier(.45,0,.55,1)')}</div>
<div style="position:absolute;left:660px;top:350px;right:0">
<table class="spec"><tr><td>micro</td><td>120 ms · hovers, taps</td></tr><tr><td>short</td><td>240 ms · toggles, bounce</td></tr><tr><td>base</td><td>400 ms · panels, cards</td></tr><tr><td>long</td><td>700 ms · stroke draw-on</td></tr><tr><td>hero</td><td>1200 ms · pulse loop</td></tr><tr><td>stagger</td><td>90 ms between dots</td></tr></table>
${bullets(['Never spin, flip or wobble the letters.', 'Only dots bounce — max two rebounds.', 'Honour “reduce motion”: show the rest frame.'])}</div>`);
}

page('04 Identity', 'Iconography', (() => {
  const big = 'idea';
  return `<div style="position:absolute;left:0;top:0;width:290px">${head('04 · Identity system', 'Iconography', 'Simple line icons on a 24 px grid that share the logo’s DNA: one stroke weight, round caps and joins, open forms — and one solid dot as the accent.')}
<table class="spec"><tr><td>Grid</td><td>24 × 24 px, 2 px padding</td></tr><tr><td>Stroke</td><td>1.75 px @ 24 px</td></tr><tr><td>Caps / joins</td><td>Round / round</td></tr><tr><td>Accent</td><td>One Electric Blue dot</td></tr><tr><td>Colour</td><td>Violet, Ink or Warm White</td></tr></table></div>
<div style="position:absolute;left:320px;top:0;width:260px;height:290px" class="tile">${svg(220, 220, `${Array.from({ length: 25 }, (_, i) => `<line x1="${i * 220 / 24}" y1="0" x2="${i * 220 / 24}" y2="220" stroke="${C.g200}" stroke-width=".6"/><line x1="0" y1="${i * 220 / 24}" x2="220" y2="${i * 220 / 24}" stroke="${C.g200}" stroke-width=".6"/>`).join('')}<rect x="${220 / 12}" y="${220 / 12}" width="${220 * 20 / 24}" height="${220 * 20 / 24}" fill="none" stroke="${C.b200}"/>${icon(big, { size: 220, sw: 1.75 }).replace('<svg ', '<svg x="0" y="0" ')}`)}<div class="tcap">Keyline grid</div></div>
<div style="position:absolute;left:600px;top:0;right:0;height:290px;background:${C.violet};border-radius:18px;display:grid;grid-template-columns:repeat(4,1fr);align-items:center;justify-items:center;padding:20px">${['calendar', 'pin', 'ticket', 'chat', 'people', 'toggle', 'app', 'camera'].map(n => icon(n, { size: 44, color: C.warm, dot: C.b400 })).join('')}</div>
<div style="position:absolute;left:320px;right:0;top:310px;bottom:0;display:grid;grid-template-columns:repeat(6,1fr);gap:10px">
${Object.keys(ICONS).map(n => `<div class="tile" style="padding:14px 8px 34px">${icon(n, { size: 46 })}<div class="tcap" style="text-align:center;left:6px;right:6px">${ICONS[n].n}</div></div>`).join('')}</div>`;
})());

page('04 Identity', 'Photography', `
<div style="position:absolute;left:0;top:0;width:300px">${head('04 · Identity system', 'Photography & imagery', 'Real people, mid-moment, in light. Every image is graded towards PurpleHat Violet so a wall of event photos still reads as one brand.')}
<div class="lab" style="margin-top:16px">Grade recipe</div>
<table class="spec"><tr><td>Shadows</td><td>toward ${C.v950}</td></tr><tr><td>Midtones</td><td>violet split-tone, sat −15</td></tr><tr><td>Highlights</td><td>warm, toward ${C.warm}</td></tr><tr><td>Accent light</td><td>keep blues (${C.blue})</td></tr><tr><td>Off-palette hues</td><td>desaturate reds/greens</td></tr><tr><td>Text overlay</td><td>Violet 950 → 0%, bottom-up</td></tr></table>
<p class="small" style="margin-top:10px">Frames on this page are drawn placeholders, not photographs — replace with commissioned event photography.</p></div>
<div style="position:absolute;left:320px;top:0;right:0;height:300px;display:grid;grid-template-columns:1.5fr 1fr;gap:12px">
<div class="tile" style="padding:0;overflow:hidden">${svg(400, 300, photo(400, 300, { seed: 31, label: 'Hero — crowd & light', rows: 3 }))}</div>
<div style="display:grid;grid-template-rows:1fr 1fr;gap:12px">
<div class="tile" style="padding:0;overflow:hidden">${svg(260, 144, photo(260, 144, { seed: 32, label: 'Stage moment', tone: 'blue', rows: 2 }))}</div>
<div class="tile" style="padding:0;overflow:hidden">${svg(260, 144, photo(260, 144, { seed: 33, label: 'Detail / install', crowd: false }))}</div></div></div>
<div style="position:absolute;left:320px;top:316px;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:12px">
<div class="tile" style="padding:0;overflow:hidden">${svg(220, 170, photo(220, 170, { seed: 34, tone: 'warm', label: 'Ungraded' }))}<div class="tcap" style="color:${C.ink}">${X} Raw, mixed colour</div></div>
<div class="tile" style="padding:0;overflow:hidden">${svg(220, 170, photo(220, 170, { seed: 34, label: 'Graded' }))}<div class="tcap" style="color:${C.ink}">${OK} Graded to violet</div></div>
<div class="tile" style="align-items:flex-start;justify-content:flex-start;padding:18px"><div class="lab">Do</div><div class="small" style="margin:4px 0 10px">Candid people, real venues, light beams, hands, faces lit by screens, wide crowd shots, close details of builds.</div><div class="lab" style="color:${C.warn}">Don’t</div><div class="small" style="margin-top:4px">Stock handshakes, staged thumbs-up, AI-generated crowds, heavy HDR, filters that turn skin purple.</div></div></div>`);

page('04 Identity', 'Layout grids', (() => {
  const cols = (x, y, w, h, n, m, g, col = C.blue) => { const cw = (w - 2 * m - (n - 1) * g) / n; let s = ''; for (let i = 0; i < n; i++) s += `<rect x="${f2(x + m + i * (cw + g))}" y="${f2(y + m)}" width="${f2(cw)}" height="${f2(h - 2 * m)}" fill="${col}" opacity=".12"/>`; return s; };
  return `<div style="position:absolute;left:0;top:0;width:994px">${head('04 · Identity system', 'Layout grids', 'Generous margins, a strong left edge aligned to the P’s stem, and content that hangs from the top. One module (the margin) sets the rhythm in every format.')}</div>
<div style="position:absolute;left:0;right:0;top:150px;bottom:0;display:grid;grid-template-columns:.8fr .9fr 1.6fr;gap:14px">
<div class="tile">${svg(200, 283, `<rect width="200" height="283" fill="#fff" stroke="${C.g200}"/>${cols(0, 0, 200, 283, 12, 19, 4.7)}${markG(19, 17, 42, { color: C.violet, dot: C.blue })}<rect x="19" y="62" width="110" height="5" rx="2.5" fill="${C.violet}"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="19" y="${80 + i * 9}" width="${150 - (i % 3) * 18}" height="3" rx="1.5" fill="${C.g300}"/>`).join('')}<rect x="19" y="262" width="162" height="2" fill="${C.v100}"/>`)}<div class="tcap">A4 · 12 col · 20 mm margins · 5 mm gutter</div></div>
<div class="tile">${svg(216, 270, `<rect width="216" height="270" fill="${C.violet}"/>${cols(0, 0, 216, 270, 6, 17, 6, C.warm)}<rect x="17" y="60" width="140" height="11" rx="5.5" fill="${C.warm}"/><rect x="17" y="78" width="110" height="11" rx="5.5" fill="${C.warm}"/>${markG(17, 230, 46, { color: C.warm })}`)}<div class="tcap">Social 4:5 · 6 col · 84 px margins</div></div>
<div class="tile">${svg(400, 225, `<rect width="400" height="225" fill="${C.warm}" stroke="${C.g200}"/>${cols(0, 0, 400, 225, 12, 25, 6)}<rect x="25" y="30" width="60" height="4" rx="2" fill="${C.blue}"/><rect x="25" y="42" width="170" height="12" rx="6" fill="${C.violet}"/><rect x="25" y="58" width="130" height="12" rx="6" fill="${C.violet}"/>${[0, 1, 2].map(i => `<circle cx="29" cy="${100 + i * 16}" r="3" fill="${C.blue}"/><rect x="38" y="${97 + i * 16}" width="${130 - i * 15}" height="5" rx="2.5" fill="${C.g300}"/>`).join('')}<path d="M250 200V95a72 72 0 0 1 144 0V200z" fill="${C.v600}" opacity=".8"/>`)}<div class="tcap">Slides 16:9 · 12 col · 120 px margins (at 1920)</div></div>
</div>`;
})());

// ===================================================================================== 04 APPLICATIONS
{ // the Signature card: hero page with callouts + finishing spec, then the alternates
  const kB = 6.1, kN = 4.1, bx = 360, by = 6, nx = 640, ny = 360;
  const mk = (n, x, y) => `<div style="position:absolute;left:${f2(x - 11)}px;top:${f2(y - 11)}px;width:22px;height:22px;border-radius:11px;background:${C.white};border:1.5px solid ${C.blue};color:${C.blue};font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px ${C.warm}">${n}</div>`;
  const SPEC = [
    ['1', 'The person', 'One Electric Blue dot, switched ON in its toggle: the brand’s whole idea at 6.2 mm. Pigment foil matched to Pantone 2727 C.'],
    ['2', 'The ripple', '34 capsule contours in Violet (Pantone 2685 C), letterpress. Spacing breathes ±18% on a sine and the field leans back to where the person came from; hairlines thicken from 0.13 to 0.35 mm outward.'],
    ['3', 'The place', 'The PhE mark rests in a capsule-shaped clearing in the field, letterpress Violet with foil dots.'],
    ['4', 'The edge', 'Triplex board: 2 × 350 gsm natural white + an Electric Blue core (≈ 1,050 gsm). Every edge shows a line of blue; 2.5 mm die-cut corners.'],
    ['5', 'The rhythm', 'The rule under the title is the logo’s own stroke → gap → dot, at logo proportion.'],
    ['6', 'The echo', 'A miniature of the brand side, cropped by the corner: the ripple starts here.'],
  ];
  page('05 Applications', 'Business cards', `
<div style="position:absolute;left:0;top:0;width:330px">${head('05 · Applications', 'The Signature card', 'One person, switched on, sending ripples through a room. The card is the brand idea you can hold — made with three inks, one foil and a blue edge.')}
<div style="margin-top:6px">${SPEC.map(([n, k, v]) => `<div style="display:grid;grid-template-columns:26px 1fr;gap:8px;padding:7px 0;border-top:1px solid ${C.sand}"><span style="width:18px;height:18px;border-radius:9px;border:1.3px solid ${C.blue};color:${C.blue};font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;margin-top:1px">${n}</span><div><b style="font-size:11.5px;color:${C.violet};font-weight:600">${k}</b><div class="small" style="margin-top:2px;line-height:1.45">${v}</div></div></div>`).join('')}</div></div>
<div style="position:absolute;left:${bx - 18}px;top:-18px;right:0;bottom:0;background:${C.sand};border-radius:18px"></div>
<div style="position:absolute;left:${bx + 8}px;top:${by + 16}px">${cardMock('A', 'back', 89, 51, kB)}</div>
<div style="position:absolute;left:${nx}px;top:${ny + 18}px">${cardMock('A', 'front', 89, 51, kN)}</div>
${mk(1, bx + 8 + 62.3 * kB + 18, by + 16 + 25.5 * kB - 24)}${mk(2, bx + 8 + 84 * kB, by + 16 + 7 * kB)}${mk(3, bx + 8 + 5 * kB, by + 16 + 34 * kB)}${mk(4, bx + 8 + 30 * kB, by + 16 + 51 * kB + 14)}
${mk(5, nx + 21 * kN, ny + 18 + 18.6 * kN)}${mk(6, nx + 76 * kN, ny + 18 + 37 * kN)}
<div class="small" style="position:absolute;left:${bx + 8}px;top:${ny + 40}px;width:250px;line-height:1.5">89 × 51 mm (also 85 × 55 mm), 3 mm bleed, die line supplied: cards/PhE-BusinessCard-A-Signature-Ripple-*.pdf.<br><br>Name, title and contact lines are set from one baseline grid; phone, email and web are placeholders — replace before print.</div>`);
  page('05 Applications', 'Business cards — alternates', `
<div style="position:absolute;left:0;top:0;width:994px">${head('05 · Applications', 'Alternates', 'For short runs and quick turnarounds. Same sizes and bleed as the Signature card; B prints on any good uncoated stock, C needs a capsule die-cut.')}</div>
<div style="position:absolute;left:0;right:0;top:150px;bottom:0;display:grid;grid-template-columns:repeat(2,1fr);gap:14px">
${['B', 'C'].map(d => `<div class="tile" style="background:${C.sand};gap:22px;padding-bottom:40px">${cardMock(d, 'back', 89, 51, 4.2)}${cardMock(d, 'front', 89, 51, 4.2)}<div class="tcap" style="color:${C.violet}"><b>${d}</b> — ${{ B: 'Warm White, blue dots', C: 'Capsule die-cut toggle' }[d]}</div></div>`).join('')}</div>`);
}

page('05 Applications', 'Letterhead & email', `
<div style="position:absolute;left:0;top:0;width:280px">${head('05 · Applications', 'Letterhead, envelope & email', 'Quiet and useful: the mark top-left, details top-right, and our services as a footer line, separated by blue dots.')}
<div class="small">Files: stationery/PhE-Letterhead-A4 (.html editable, .pdf), PhE-Envelope-DL.pdf, PhE-Email-Signature.html</div></div>
<div style="position:absolute;left:300px;top:0;width:340px;height:638px;background:${C.sand};border-radius:18px;overflow:hidden"><div style="position:absolute;left:28px;top:24px;width:794px;height:1123px;zoom:.358;box-shadow:0 10px 40px #0003;background:#fff;overflow:hidden">${LH_SHEET()}</div></div>
<div style="position:absolute;left:656px;top:0;right:0;height:410px;background:${C.sand};border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">${flat(envelope('front'), DL.w, DL.h, `<rect width="${DL.w}" height="${DL.h}"/>`, 1.38)}${flat(envelope('back'), DL.w, DL.h, `<rect width="${DL.w}" height="${DL.h}"/>`, 1.38)}</div>
<div style="position:absolute;left:656px;top:426px;right:0;bottom:0;background:#fff;border-radius:18px;padding:24px 22px;overflow:hidden">
<div class="lab" style="margin-bottom:12px">Email signature</div>
<div style="display:flex;gap:14px;align-items:flex-start">
<div style="border-right:2px solid ${C.v100};padding-right:14px">${mark({ width: 92, color: C.violet, dot: C.blue })}</div>
<div style="font-size:11px;line-height:1.55"><div style="font-size:13px;font-weight:600;color:${C.violet}">Akash Medishetty</div><div style="font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:${C.blue};font-weight:500">Chief Technology Officer · PurpleHat Events</div><div style="margin-top:4px"><span style="color:${C.blue}">●</span> +91 00000 00000<br><span style="color:${C.blue}">●</span> hello@purplehat.events<br><span style="color:${C.blue}">●</span> purplehat.events · Hyderabad</div></div></div></div>`);

page('05 Applications', 'Badges & tickets', `
<div style="position:absolute;left:0;top:0;width:994px">${head('05 · Applications', 'Badges, lanyards & tickets', 'Roles are colour-coded by the toggle on the badge: Electric Blue for delegates, Violet for speakers, Ink for crew. The ticket’s stub carries the pill-and-circle.')}</div>
<div style="position:absolute;left:0;top:140px;width:520px;bottom:0;background:#D9D6DE;border-radius:18px;overflow:hidden">
<div style="position:absolute;left:28px;top:0;display:flex;gap:16px">
${[['Delegate', 'Delegate Name', 'Organisation name'], ['Speaker', 'Speaker Name', 'Organisation name'], ['Crew', 'Crew Name', 'PurpleHat Events']].map(([r, n, o]) => `<div style="display:flex;flex-direction:column;align-items:center"><div style="width:16px;height:80px;background:${C.blue}"></div><div style="width:10px;height:18px;background:#1d1d24;border-radius:3px"></div>${flat(badge('front', { role: r, name: n, org: o }), BADGE.w, BADGE.h, `<rect width="${BADGE.w}" height="${BADGE.h}" rx="5"/>`, 1.45, { hole: `<rect x="${BADGE.w / 2 - 8}" y="6" width="16" height="3.4" rx="1.7" fill="#000"/>` })}</div>`).join('')}</div>
<div style="position:absolute;left:28px;bottom:22px;display:flex;gap:16px;align-items:flex-end">${flat(badge('back'), BADGE.w, BADGE.h, `<rect width="${BADGE.w}" height="${BADGE.h}" rx="5"/>`, 1.2)}<div style="width:280px;height:30px;transform:rotate(0)">${flat(`<g transform="rotate(-90) translate(-20 0)">${lanyard()}</g>`, 330, 20, `<rect width="330" height="20" rx="2"/>`, 0.85)}</div></div></div>
<div style="position:absolute;left:536px;top:140px;right:0;bottom:0;background:#D9D6DE;border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px">${flat(ticket('front'), TICKET.w, TICKET.h, ticketShape(), 2.35)}${flat(ticket('back'), TICKET.w, TICKET.h, ticketShape(), 2.35)}</div>`);

page('05 Applications', 'Tags', `
<div style="position:absolute;left:0;top:0;width:300px">${head('05 · Applications', 'Tags', 'Pill-shaped tags (110 × 42 mm, Ø 5.2 mm hole) for luggage, gift bags, welcome kits and installations. Three colourways; the back of the blue tag is a write-on luggage tag.')}
<div class="small">File: stationery/PhE-Tags-110x42mm.pdf (6 sides + die line)</div></div>
<div style="position:absolute;left:320px;top:0;right:0;bottom:0;background:${C.sand};border-radius:18px;display:grid;grid-template-columns:1fr 1fr;align-items:center;justify-items:center;padding:20px">
${[1, 2, 3].flatMap(v => ['front', 'back'].map(s => flat(tag(v, s), TAG.w, TAG.h, `<rect width="${TAG.w}" height="${TAG.h}" rx="${TAG.h / 2}"/>`, 2.65, { hole: `<circle cx="${TAG.hole.x}" cy="${TAG.h / 2}" r="${TAG.hole.r}" fill="#000"/>` }))).join('')}</div>`);

page('05 Applications', 'Signage', (() => {
  const roll = `<svg viewBox="0 0 170 430" width="170" height="430"><rect x="0" y="0" width="170" height="400" fill="${C.violet}"/>${T(14, 40, 'Events', { size: 19, fill: C.warm, weight: 500 })}${T(14, 62, 'for a more', { size: 19, fill: C.warm, weight: 500 })}${T(14, 84, 'connected', { size: 19, fill: C.warm, weight: 500 })}${T(14, 106, 'tomorrow.', { size: 19, fill: C.warm, weight: 500 })}<g transform="translate(14 140)"><clipPath id="rbc"><path d="M0 200V71a71 71 0 0 1 142 0V200z"/></clipPath><g clip-path="url(#rbc)">${photo(142, 200, { seed: 40, label: '' })}</g></g>${markG(14, 358, 90, { color: C.warm })}<rect x="-10" y="400" width="190" height="16" rx="4" fill="#B9B4C2"/><rect x="40" y="416" width="90" height="6" rx="3" fill="#9893A3"/></svg>`;
  const way = (txt, dir, bg, fg) => `<div style="display:flex;align-items:center;height:56px;border-radius:28px;background:${bg};padding:0 8px 0 24px;gap:18px;min-width:290px;justify-content:space-between"><span style="font-size:20px;color:${fg};font-weight:500">${txt}</span><span style="width:42px;height:42px;border-radius:50%;background:${C.blue};display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 20 20" style="transform:rotate(${dir}deg)"><path d="M3 10h13m-5-5 5 5-5 5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>`;
  return `<div style="position:absolute;left:0;top:0;width:280px">${head('05 · Applications', 'Event signage & standees', 'Signs speak in pills: the label sits in the pill, direction rides in the blue dot. Big formats use the pattern at scale with the mark low and to the left.')}</div>
<div style="position:absolute;left:0;top:300px;width:280px;height:338px" class="tile">${roll}<div class="tcap">Roll-up standee · 850 × 2000 mm</div></div>
<div style="position:absolute;left:300px;top:0;right:0;height:300px;border-radius:18px;overflow:hidden;background:${C.violet}">${svg(694, 300, `${pattern(694, 300, { mode: 'big', color: C.v600, sw: 3 })}<rect x="207" y="40" width="280" height="158" rx="8" fill="${C.v950}"/>${markG(257, 92, 180, { color: C.warm, dot: C.blue })}${T(347, 180, 'Screen', { size: 10, fill: C.v400, anchor: 'middle', caps: true, ls: .2 })}<rect x="0" y="236" width="694" height="64" fill="#0A0320" opacity=".55"/>${T(30, 274, 'Stage backdrop · LED / fabric · 16 : 7', { size: 11, fill: C.v200 })}`)}</div>
<div style="position:absolute;left:300px;top:316px;width:340px;bottom:0;background:${C.sand};border-radius:18px;display:flex;flex-direction:column;gap:14px;align-items:center;justify-content:center">${way('Registration', 0, C.violet, C.warm)}${way('Hall A', -90, C.warm, C.violet)}${way('Breakout 2', 180, C.violet, C.warm)}${way('Exit', 90, C.ink, C.warm)}<div class="small">Wayfinding pills · direction in the dot</div></div>
<div style="position:absolute;left:656px;top:316px;right:0;bottom:0;background:${C.warm};border:1px solid ${C.sand};border-radius:18px;display:flex;gap:16px;align-items:flex-end;justify-content:center;padding-bottom:30px">
<svg viewBox="0 0 120 290" width="120" height="290"><rect x="0" y="0" width="120" height="270" rx="60" fill="${C.blue}"/>${T(60, 120, 'Ideas', { size: 17, fill: C.warm, anchor: 'middle', weight: 500 })}${T(60, 140, 'take shape', { size: 17, fill: C.warm, anchor: 'middle', weight: 500 })}${T(60, 160, 'here.', { size: 17, fill: C.warm, anchor: 'middle', weight: 500 })}${markG(25, 210, 70, { color: C.warm })}<rect x="30" y="270" width="60" height="20" rx="4" fill="#9893A3"/></svg>
<svg viewBox="0 0 150 290" width="150" height="290"><rect x="0" y="0" width="150" height="270" rx="10" fill="${C.violet}"/><circle cx="75" cy="70" r="44" fill="none" stroke="${C.warm}" stroke-width="3"/><circle cx="75" cy="70" r="14" fill="${C.blue}"/>${T(18, 160, 'Welcome', { size: 20, fill: C.warm, weight: 500 })}${T(18, 182, 'to the Summit.', { size: 14, fill: C.v200 })}${markG(18, 236, 70, { color: C.warm })}<rect x="45" y="270" width="60" height="20" rx="4" fill="#9893A3"/></svg>
<div class="tcap">Pill totem · welcome standee</div></div>`;
})());

page('05 Applications', 'Social media', `
<div style="position:absolute;left:0;top:0;width:994px">${head('05 · Applications', 'Social media templates', 'Nine templates: 3 × square, 3 × 4:5, 3 × story. Big type, one idea per post, the mark always in a corner.')}</div>
<div style="position:absolute;left:0;top:106px;display:flex;gap:12px">${['square-1', 'square-2', 'square-3'].map(id => `<div class="sh">${scaleSvg(social(id).svg, 200)}</div>`).join('')}</div>
<div style="position:absolute;left:0;top:322px;display:flex;gap:12px">${['portrait-1', 'portrait-2', 'portrait-3'].map(id => `<div class="sh">${scaleSvg(social(id).svg, 200)}</div>`).join('')}</div>
<div style="position:absolute;right:0;top:106px;display:flex;gap:12px">${['story-1', 'story-2', 'story-3'].map(id => `<div class="sh">${scaleSvg(social(id).svg, 110)}</div>`).join('')}</div>
<div style="position:absolute;right:0;top:322px;width:354px;bottom:0;display:flex;flex-direction:column;gap:10px;justify-content:flex-end">
${[['Type first', 'Headlines of 3–6 words in Satoshi Medium, sentence case, ending with a full stop.'], ['One accent', 'One Electric Blue element per post: a dot, a toggle or a button.'], ['Real moments', 'Graded event photography for recaps; pills and dots for announcements.']].map(([a, b]) => `<div class="tile" style="align-items:flex-start;justify-content:flex-start;padding:14px 18px;flex:none">${lab(a)}<div class="body" style="margin:6px 0 0">${b}</div></div>`).join('')}
<div class="small">1080 × 1080 · 1080 × 1350 · 1080 × 1920 — PNGs + HTML sources in /social.</div></div>`);

page('05 Applications', 'Presentations & web', `
<div style="position:absolute;left:0;top:0;width:994px">${head('05 · Applications', 'Presentations & website')}</div>
<div style="position:absolute;left:0;top:80px;width:470px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
${SLIDES.map((id, i) => `<div style="width:230px;height:129px;overflow:hidden;border-radius:6px;box-shadow:0 2px 8px #0002"><div style="width:1920px;height:1080px;transform:scale(${230 / 1920});transform-origin:0 0">${slide(id, i + 1)}</div></div>`).join('')}
<div class="small" style="grid-column:span 2">16:9 template: title, section, content and closing (slides/PhE-Presentation-16x9.html — editable text).</div></div>
<div style="position:absolute;left:490px;top:80px;right:0;bottom:0;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px #0002">
<div style="height:28px;background:${C.g200};display:flex;align-items:center;gap:6px;padding:0 12px"><i class="wd"></i><i class="wd"></i><i class="wd"></i><div style="margin-left:14px;flex:1;height:16px;border-radius:8px;background:#fff;font-size:9px;color:${C.g500};padding:2px 10px">purplehat.events (placeholder)</div></div>
<div style="height:60px;display:flex;align-items:center;padding:0 26px;gap:24px;background:${C.warm}">${mark({ width: 74, color: C.violet, dot: C.blue })}<div style="flex:1"></div>${['Services', 'Work', 'About', 'Journal'].map(x => `<span style="font-size:12px;color:${C.violet}">${x}</span>`).join('')}<span style="display:flex;align-items:center;gap:8px;height:32px;border-radius:16px;background:${C.violet};color:${C.warm};font-size:12px;padding:0 4px 0 14px;white-space:nowrap">Plan an event<i style="width:24px;height:24px;border-radius:50%;background:${C.blue};display:inline-block"></i></span></div>
<div style="position:relative;height:calc(100% - 88px);background:${C.warm}">
<div style="position:absolute;left:26px;top:34px;width:250px"><div class="lab" style="font-size:9px">Hyderabad · Since day one</div><div style="font-size:36px;line-height:1.05;letter-spacing:-.025em;color:${C.violet};font-weight:500;margin-top:10px">Events for a more connected tomorrow.</div><div style="font-size:12px;line-height:1.5;color:${C.g700};margin-top:14px">Conferences, MICE, corporate events and experiential installations — designed around people.</div>
<div style="display:flex;gap:10px;margin-top:18px"><span style="height:34px;border-radius:17px;background:${C.violet};color:${C.warm};font-size:12px;display:flex;align-items:center;padding:0 16px">Talk to us</span><span style="height:34px;border-radius:17px;border:1.5px solid ${C.violet};color:${C.violet};font-size:12px;display:flex;align-items:center;padding:0 16px">See our work</span></div></div>
<div style="position:absolute;right:20px;top:24px;width:200px;height:440px;border-radius:100px 100px 14px 14px;overflow:hidden">${svg(200, 440, photo(200, 440, { seed: 51, label: '' }))}</div></div></div>`);

page('05 Applications', 'Merchandise', (() => {
  const tote = `<svg viewBox="0 0 220 280" width="220" height="280"><path d="M60 70V45a50 50 0 0 1 100 0v25" fill="none" stroke="${C.stone}" stroke-width="9"/><path d="M28 70h164l10 200H18z" fill="${C.warm}" stroke="${C.sand}" stroke-width="2"/>${markG(50, 130, 120, { color: C.violet, dot: C.blue })}${T(110, 220, 'Events for a more connected tomorrow.', { size: 7.6, fill: C.violet, anchor: 'middle' })}</svg>`;
  const tee = (bg, inner) => `<svg viewBox="0 0 240 260" width="240" height="260"><path d="M80 18c10 14 70 14 80 0l52 22 26 52-38 16-12-20v160H52V88l-12 20-38-16 26-52z" fill="${bg}"/><path d="M80 18c10 14 70 14 80 0" fill="none" stroke="#0003" stroke-width="3"/>${inner}</svg>`;
  const cap = `<svg viewBox="0 0 240 200" width="240" height="200"><path d="M30 130c0-70 40-104 90-104s90 34 90 104z" fill="${C.violet}"/><path d="M120 26v104" stroke="#0003" stroke-width="1.5"/><path d="M14 128c40 30 172 30 212 0 6 10-2 22-14 26-50 16-134 16-184 0-12-4-20-16-14-26z" fill="${C.v950}"/><circle cx="120" cy="28" r="6" fill="${C.v950}"/>${markG(76, 72, 88, { color: C.warm })}</svg>`;
  const stickers = `<svg viewBox="0 0 240 200" width="240" height="200"><rect x="10" y="20" width="160" height="56" rx="28" fill="${C.warm}" stroke="${C.blue}" stroke-width="3"/>${T(90, 54, 'PurpleHat Events', { size: 14, fill: C.violet, anchor: 'middle', weight: 500 })}<circle cx="200" cy="48" r="28" fill="${C.blue}"/><rect x="20" y="100" width="120" height="60" rx="30" fill="${C.violet}"/><circle cx="110" cy="130" r="20" fill="${C.blue}"/><circle cx="190" cy="140" r="40" fill="${C.violet}"/>${markG(158, 130, 64, { color: C.warm })}</svg>`;
  return `<div style="position:absolute;left:0;top:0;width:994px">${head('05 · Applications', 'Merchandise', 'Few, good things. Violet and Warm White garments, one placement, generous space. Print the mark large or tiny — never medium and centred by default.')}</div>
<div style="position:absolute;left:0;right:0;top:150px;bottom:0;display:grid;grid-template-columns:repeat(5,1fr);gap:12px">
${tile(tote, { cap: 'Tote — natural canvas, 2-colour screen print', bg: C.sand })}
${tile(tee(C.violet, markG(140, 70, 40, { color: C.warm })), { cap: 'Tee front — chest mark', bg: '#E4E0EC' })}
${tile(tee(C.warm, `<g>${['People', 'Ideas', 'Places', 'Experiences', 'Together'].map((w, i) => T(78, 100 + i * 22, w, { size: 17, fill: C.violet, weight: 500 })).join('')}<circle cx="80" cy="222" r="5" fill="${C.blue}"/></g>`), { cap: 'Tee back — brand words', bg: '#E4E0EC' })}
${tile(cap, { cap: 'Cap — warm-white embroidery', bg: C.sand })}
${tile(stickers, { cap: 'Sticker set — pill, dot, toggle', bg: '#fff' })}
</div>`;
})());

// ===================================================================================== 05 VOICE
page('06 Voice', 'Tone of voice', `
<div style="position:absolute;left:0;top:0;width:994px">${head('06 · Voice', 'Tone of voice', 'We sound like a good host: warm, clear and quietly confident. We talk to people, not at “attendees”.')}</div>
<div style="position:absolute;left:0;right:0;top:140px;height:210px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
${[['Warm, not casual', 'Friendly and welcoming — but always respectful of people’s time.'], ['Clear, not clever', 'Say the useful thing first: what, when, where, what next.'], ['Confident, not loud', 'Specifics over superlatives. Let the work and the numbers speak.'], ['Together, not about us', '“You” and “we”, people before process. Credit partners.']].map(([a, b], i) => `<div class="tile" style="align-items:flex-start;justify-content:flex-start;padding:22px;background:${i === 0 ? C.violet : '#fff'}"><div style="font-size:12px;color:${i === 0 ? C.b200 : C.blue};font-weight:600">0${i + 1}</div><div style="font-size:20px;line-height:1.15;font-weight:500;color:${i === 0 ? C.warm : C.violet};margin:10px 0 8px;letter-spacing:-.01em">${a}</div><div class="small" style="color:${i === 0 ? C.v200 : C.g700}">${b}</div></div>`).join('')}</div>
<div style="position:absolute;left:0;right:0;top:366px;bottom:0;background:#fff;border-radius:18px;padding:18px 24px">
<table class="say"><tr><th>${OK} We say</th><th>${X} Instead of</th></tr>
${[['Your team, one room, one shared moment.', 'We deliver world-class, best-in-class event solutions.'], ['Doors open at 6. Come early for chai.', 'Attendees are requested to kindly report at the venue by 18:00 hrs.'], ['We’ll handle venue, travel and stay — you focus on your people.', 'End-to-end turnkey MICE management services.'], ['Ideas take shape here.', 'Unleashing synergies through immersive experiential paradigms.']].map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</table></div>`);

page('06 Voice', 'Voice in use', `
<div style="position:absolute;left:0;top:0;width:994px">${head('06 · Voice', 'Voice in use')}</div>
<div style="position:absolute;left:0;right:0;top:80px;bottom:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;gap:12px">
${[['Headlines', ['Ideas take shape here.', 'Bring everyone. We’ll handle the rest.', '400 delegates. One conversation.']], ['Calls to action', ['Talk to us', 'Plan an event', 'Save your seat', 'See the programme']], ['Social captions', ['Day one, done. 1,200 people, 38 sessions and one very long chai queue. Thank you, Hyderabad. ●', 'Behind the scenes: 600 metres of LED, 14 hours, one crew. Doors at 9.']], ['Email openers', ['Thanks for thinking of us — here’s how we’d approach it.', 'Quick update on Thursday: everything’s on track.']], ['Event-day signage', ['Registration ahead →', 'Quiet room — phones on silent, please.', 'Lunch is served in Hall B.']], ['Words we like / avoid', [`<b style="color:${C.blue}">Like:</b> people, together, room, moment, host, shape, connect, simple`, `<b style="color:${C.warn}">Avoid:</b> synergy, world-class, leverage, paradigm, ASAP, “kindly do the needful”`]]].map(([h, items]) => `<div class="tile" style="align-items:flex-start;justify-content:flex-start;padding:20px 22px">${lab(h)}<div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">${items.map(x => `<div style="font-size:${h === 'Calls to action' ? 13 : 15}px;line-height:1.4;color:${C.ink}">${h === 'Calls to action' ? `<span style="display:inline-flex;align-items:center;gap:8px;height:28px;border-radius:14px;background:${C.violet};color:${C.warm};padding:0 4px 0 12px;font-size:12px">${x}<i style="width:20px;height:20px;border-radius:50%;background:${C.blue};display:inline-block"></i></span>` : x}</div>`).join('')}</div></div>`).join('')}</div>`);

page('07 Resources', 'Files & contacts', (() => {
  let svgs = []; try { svgs = fs.readdirSync(path.join(BRAND, 'svg')).filter(f => f.endsWith('.svg')).sort(); } catch (e) { }
  return `<div style="position:absolute;left:0;top:0;width:500px">${head('07 · Resources', 'Files & contacts')}</div>
<div style="position:absolute;left:0;top:80px;width:470px;bottom:0;background:#fff;border-radius:18px;padding:20px 24px">
<div class="lab">Logo master files · brand/svg/</div>
<div class="files">${svgs.map(f => `<span>${f}</span>`).join('')}</div>
<div class="lab" style="margin-top:16px">Deliverables · brand/guidelines/</div>
<div class="files">${['PurpleHat-Brand-Guidelines.pdf', 'cards/ — 6 print PDFs + mockups', 'stationery/ — letterhead, envelope, badge, lanyard, ticket, tags, email signature', 'social/ — 9 templates', 'slides/ — 16:9 template (HTML, PDF, PNG)', 'index.html — everything linked'].map(f => `<span>${f}</span>`).join('')}</div></div>
<div style="position:absolute;left:490px;top:80px;right:0;bottom:0;background:${C.violet};border-radius:18px;padding:30px 34px;color:${C.warm}">
${mark({ width: 200, color: C.warm, dot: C.blue })}
<div style="font-size:26px;font-weight:500;margin-top:30px;letter-spacing:-.01em">Questions about the brand?</div>
<div style="font-size:14px;line-height:1.7;color:${C.v200};margin-top:12px">Akash Medishetty · Chief Technology Officer<br>PurpleHat Events, Hyderabad, India<br>hello@purplehat.events *<br>+91 00000 00000 *<br>purplehat.events *</div>
<div style="font-size:11px;color:${C.v400};margin-top:16px">* Placeholder contact details — replace before publishing.</div>
<div style="position:absolute;left:34px;right:34px;bottom:28px;font-size:11px;line-height:1.6;color:${C.v400}">Brand Guidelines v1.0 · October 2026. Specimens set in DM Sans as a stand-in for Satoshi. All illustrations, mockups and photo placeholders in this document are drawn in code from the master logo geometry.</div></div>`;
})());

page('back', 'Back cover', `<div style="position:absolute;inset:0;background:${C.violet}"></div>
<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-60%)">${mark({ width: 300, color: C.warm, dot: C.blue })}</div>
<div style="position:absolute;left:0;right:0;bottom:70px;text-align:center;color:${C.v200};font-size:14px">Events for a more connected tomorrow.</div>`, { dark: true, noChrome: true });

// ===================================================================================== render
export function buildGuide(JOBS) {
  // contents
  const groups = {}; pages.forEach((p, i) => { if (!['cover', 'contents', 'back'].includes(p.section)) (groups[p.section] ||= []).push([p.title, i + 1]); });
  const contents = `<div style="position:absolute;left:0;top:0;width:994px">${head('Contents', 'Contents')}</div>
<div style="position:absolute;left:0;right:0;top:110px;display:grid;grid-template-columns:repeat(${Object.keys(groups).length},1fr);gap:22px">
${Object.entries(groups).map(([g, items]) => `<div><div style="font-size:30px;color:${C.blue};font-weight:500">${g.slice(0, 2)}</div><div style="font-size:15px;color:${C.violet};font-weight:500;margin:4px 0 14px;padding-bottom:10px;border-bottom:1px solid ${C.sand}">${g.slice(3)}</div>${items.map(([t, n]) => `<div class="ci"><span>${t}</span><b>${String(n).padStart(2, '0')}</b></div>`).join('')}</div>`).join('')}</div>`;
  const html = pages.map((p, i) => {
    const n = i + 1; let body = p.contents ? contents : p.body;
    if (p.opener) body = body.replace('%%LIST%%', (groups[p.section] || []).filter(([t]) => t !== p.title).map(([t, k]) => `<div style="display:flex;justify-content:space-between;gap:18px;border-top:1px solid rgba(244,241,235,.16);padding:3px 0"><span>${t}</span><span>${String(k).padStart(2, '0')}</span></div>`).join(''));
    const chrome = p.noChrome ? '' : `<div class="run"><span>PurpleHat Events — Brand Guidelines</span><span>${p.section === 'contents' ? '' : p.section.replace(/^(\d\d) /, '$1 · ')}</span></div><div class="pn"><span class="pd"></span>${String(n).padStart(2, '0')}</div>`;
    return `<section class="page${p.dark ? ' dark' : ''}" id="p${n}">${chrome}<div class="content${p.noChrome ? ' full' : ''}">${body}</div></section>`;
  }).join('\n');
  write('PurpleHat-Brand-Guidelines.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PurpleHat Events — Brand Guidelines</title>
<style>${baseCSS('.')}
${slideCSS()}
${LH_CSS()}
@page{size:297mm 210mm;margin:0}
html{background:#CFCBD6}
.page{width:297mm;height:210mm;position:relative;overflow:hidden;background:${C.warm};break-after:page;color:${C.ink}}
.page:last-child{break-after:auto}
@media screen{body{padding:24px 0}.page{margin:0 auto 24px;box-shadow:0 6px 30px rgba(26,16,51,.18);border-radius:4px}}
.content{position:absolute;left:64px;right:64px;top:88px;bottom:66px}
.content.full{inset:0}
.op-kick{position:absolute;left:72px;top:64px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;font-weight:500}
.op-num{position:absolute;left:64px;top:118px;font-size:200px;line-height:.9;font-weight:500;letter-spacing:-.06em}
.op-t{position:absolute;left:72px;top:330px;margin:0;font-size:60px;line-height:1;letter-spacing:-.03em}
.op-l{position:absolute;left:72px;top:412px;width:360px;font-size:15px;line-height:1.5;margin:0}
.op-list{position:absolute;left:72px;bottom:60px;width:360px;font-size:11px;line-height:1.7;letter-spacing:.02em}
.pt-cap{position:absolute;left:40px;bottom:36px;display:flex;align-items:center;gap:14px;padding:12px 20px 12px 14px;border-radius:40px;background:#FFFFFF;box-shadow:0 8px 30px rgba(26,16,51,.18)}
.pt-cap .n{font-size:10px;letter-spacing:.2em;color:${C.blue};font-weight:600}.pt-cap b{font-size:16px;color:${C.violet};font-weight:500;letter-spacing:-.01em}.pt-cap span{font-size:11px;color:${C.g500}}
.run{position:absolute;left:64px;right:64px;top:34px;display:flex;justify-content:space-between;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:${C.g500};font-weight:500}
.pn{position:absolute;right:64px;bottom:30px;font-size:10px;color:${C.violet};font-weight:500;letter-spacing:.1em;display:flex;align-items:center;gap:8px}
.pd{width:7px;height:7px;border-radius:50%;background:${C.blue};display:inline-block}
.kick{font-size:11px;letter-spacing:.24em;text-transform:uppercase;font-weight:500}
.sec{font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:${C.blue};font-weight:500;margin-bottom:10px}
h1{margin:0 0 14px;font-size:34px;line-height:1.08;font-weight:500;letter-spacing:-.025em;color:${C.violet}}
.lead{font-size:14.5px;line-height:1.5;color:${C.g700};margin:0 0 14px}
.body{font-size:12.5px;line-height:1.55;color:${C.g700};margin:0 0 12px}
.small{font-size:10.5px;line-height:1.45;color:${C.g500}}
.mono{font-family:ui-monospace,Menlo,monospace;font-size:9.5px}
.lab{font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:${C.blue};font-weight:600}
.split{display:grid;grid-template-columns:320px 1fr;gap:44px;height:100%}
.quote{font-size:28px;line-height:1.15;color:${C.violet};font-weight:500;letter-spacing:-.02em;margin-top:30px;padding-left:18px;border-left:3px solid ${C.blue}}
.svc{display:flex;flex-direction:column;justify-content:space-between;height:calc(100% - 30px);background:#fff;border-radius:18px;padding:6px 22px}
.svcrow{display:grid;grid-template-columns:40px 30px 190px 1fr;align-items:center;gap:10px;padding:13.5px 0;border-bottom:1px solid ${C.g200}}
.svcrow:last-child{border:0}.svcrow .n{font-size:10px;color:${C.g400};font-weight:500;letter-spacing:.1em}.svcrow b{font-size:14.5px;color:${C.violet};font-weight:500}.svcrow .d{font-size:11px;line-height:1.4;color:${C.g500}}
.traits{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.traits div{background:#fff;border-radius:12px;padding:12px 14px}.traits b{display:block;font-size:15px;color:${C.violet};font-weight:500}.traits span{font-size:11px;color:${C.g500}}
.tile{position:relative;background:#fff;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 20px 36px;overflow:hidden;min-height:0}
.tile>svg{max-width:100%;height:auto}
.tcap{position:absolute;left:16px;bottom:12px;right:16px;font-size:10.5px;line-height:1.3;color:${C.g500};display:flex;align-items:center;gap:7px}
.xbad{flex:none;width:16px;height:16px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;gap:14px}
ul.dl{list-style:none;padding:0;margin:8px 0 0}ul.dl li{position:relative;padding-left:18px;font-size:12px;line-height:1.5;color:${C.g700};margin-bottom:8px}ul.dl li:before{content:'';position:absolute;left:2px;top:.52em;width:7px;height:7px;border-radius:50%;background:${C.blue}}
table.spec{border-collapse:collapse;width:100%;margin-top:12px;font-size:11.5px}table.spec td{padding:6px 0;border-bottom:1px solid ${C.sand}}table.spec td:last-child{text-align:right;color:${C.violet};font-weight:500}
.sw{border-radius:16px;padding:20px;display:flex;flex-direction:column;justify-content:space-between}.swn{font-size:20px;font-weight:500;letter-spacing:-.01em}.swd{font-size:11px;line-height:1.6}.swd b{font-size:15px}
.ramp{display:grid;grid-template-columns:90px repeat(7,1fr);gap:4px;align-items:stretch}.rn{font-size:11px;color:${C.violet};font-weight:500;align-self:center}
.rc{height:66px;border-radius:8px;padding:8px;display:flex;flex-direction:column;justify-content:flex-end;font-size:9px;line-height:1.3}.rc b{font-weight:600}
table.acc{border-collapse:collapse;width:100%;font-size:11px}table.acc td{padding:5px 4px;border-bottom:1px solid ${C.sand}}
.chip{display:inline-flex;width:34px;height:24px;border-radius:12px;align-items:center;justify-content:center;font-weight:600;font-size:12px;border:1px solid ${C.sand}}
.note{background:#fff;border-left:4px solid ${C.blue};border-radius:10px;padding:16px 18px;font-size:12px;line-height:1.55;color:${C.g700}}
table.scale{border-collapse:collapse;width:100%}table.scale td{padding:9px 0;border-bottom:1px solid ${C.g200};vertical-align:middle}
.sn{width:120px;font-size:12px;color:${C.violet};font-weight:600}.sn span{display:block;font-size:9.5px;color:${C.g500};font-weight:400;margin-top:2px}
table.say{border-collapse:collapse;width:100%;font-size:13.5px}table.say th{text-align:left;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${C.g500};font-weight:600;padding:4px 0 8px}table.say th svg{vertical-align:middle;margin-right:6px}
table.say td{padding:9px 16px 9px 0;border-top:1px solid ${C.g200};width:50%}table.say td:first-child{color:${C.violet};font-weight:500}table.say td:last-child{color:${C.g500};text-decoration:line-through;text-decoration-color:${C.warn}66}
.ci{display:flex;justify-content:space-between;font-size:12.5px;padding:5px 0;color:${C.ink}}.ci b{color:${C.blue};font-weight:500;font-size:11px}
.files{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.files span{font-size:10px;background:${C.warm};border-radius:10px;padding:3px 9px;color:${C.violet}}
.sh{border-radius:6px;overflow:hidden;box-shadow:0 2px 10px rgba(26,16,51,.15)}
.wd{width:9px;height:9px;border-radius:50%;background:#fff;display:inline-block}
.ld{display:inline-block}
@media screen and (prefers-reduced-motion:no-preference){
 .anim-mark circle{animation:drop 1.4s cubic-bezier(.55,0,1,.45) both, settle 2.4s .9s infinite cubic-bezier(.45,0,.55,1);transform-box:fill-box;transform-origin:50% 100%}
 .anim-mark circle:nth-child(2){animation-delay:.09s,1s}.anim-mark circle:nth-child(3){animation-delay:.18s,1.1s}
 .anim-pulse{animation:pulse 2.4s infinite cubic-bezier(.45,0,.55,1);transform-box:fill-box;transform-origin:center}
 .ld{animation:ld 1.2s infinite cubic-bezier(.45,0,.55,1)}
 .anim-travel{animation:travel 3s infinite cubic-bezier(.65,0,.35,1)}
}
@keyframes drop{0%{transform:translateY(-300%);opacity:0}60%{transform:translateY(0);opacity:1}72%{transform:translateY(-40%) scale(1.05,.95)}84%{transform:translateY(0)}92%{transform:translateY(-12%)}100%{transform:translateY(0)}}
@keyframes settle{0%,100%{scale:1}50%{scale:1.18}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
@keyframes ld{0%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}
@keyframes travel{0%,20%{transform:translateY(0)}50%,70%{transform:translateY(-104px)}100%{transform:translateY(0)}}
@media print{.anim-mark circle,.anim-pulse,.ld,.anim-travel{animation:none!important}}
</style></head><body>
${html}
</body></html>`);
  JOBS.pdf.push({ html: 'PurpleHat-Brand-Guidelines.html', pdf: 'PurpleHat-Brand-Guidelines.pdf', w: 297, h: 210 });
  JOBS.guidePages = pages.length;
  console.log('guide pages', pages.length);
}
