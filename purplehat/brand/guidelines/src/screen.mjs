// Screen components (px): social templates (SVG) and 16:9 slides (HTML).
import { C, T, f2, markG, markH, lockupG, LOCK, pattern, photo, uid, icon, ICONS, esc, mark } from './lib.mjs';

const SERVICES = ['Event Management', 'Conferences & PCO', 'MICE', 'Corporate Events', 'Experiential Installations', 'Branding & Design', 'Websites & Apps'];
const SERVICE_ICONS = ['calendar', 'conference', 'globe', 'people', 'toggle', 'pen', 'app'];
export { SERVICES, SERVICE_ICONS };

const rect = (w, h, f) => `<rect width="${w}" height="${h}" fill="${f}"/>`;
const lines = (x, y, arr, o) => arr.map((l, i) => T(x, y + i * (o.lh || o.size * 1.1), l, o)).join('');
const nestIcon = (name, x, y, size, o) => icon(name, { size, ...o }).replace('<svg ', `<svg x="${x}" y="${y}" `);

export const SOCIAL = {
  'square-1': { w: 1080, h: 1080, name: 'Square — Brand words' },
  'square-2': { w: 1080, h: 1080, name: 'Square — Statement + pattern' },
  'square-3': { w: 1080, h: 1080, name: 'Square — Event announcement' },
  'portrait-1': { w: 1080, h: 1350, name: 'Portrait — Quote' },
  'portrait-2': { w: 1080, h: 1350, name: 'Portrait — Services' },
  'portrait-3': { w: 1080, h: 1350, name: 'Portrait — Speaker' },
  'story-1': { w: 1080, h: 1920, name: 'Story — Save the date' },
  'story-2': { w: 1080, h: 1920, name: 'Story — Event photo' },
  'story-3': { w: 1080, h: 1920, name: 'Story — Call to action' },
};

export function social(id) {
  const { w, h } = SOCIAL[id]; let s = ''; const M = 84;
  switch (id) {
    case 'square-1': {
      s += rect(w, h, '#FFFFFF');
      s += T(M, M + 20, 'PurpleHat Events', { size: 26, fill: C.blue, ls: 0.2, caps: true, weight: 500 });
      s += lines(M, 330, ['People', 'Ideas', 'Places', 'Experiences', 'Together'], { size: 92, lh: 104, fill: C.violet, weight: 500, ls: -0.02 });
      s += `<rect x="${w - M - 150}" y="${M}" width="150" height="560" rx="75" fill="none" stroke="${C.violet}" stroke-width="5"/><circle cx="${w - M - 75}" cy="${M + 560 - 75}" r="52" fill="${C.blue}"/>`;
      s += `<circle cx="${w - M - 75}" cy="${M + 560 + 40 + 75}" r="75" fill="none" stroke="${C.violet}" stroke-width="5"/>`;
      s += `<line x1="${M}" y1="900" x2="${M + 70}" y2="900" stroke="${C.blue}" stroke-width="4" stroke-linecap="round"/>`;
      s += markG(w - M - 230, h - M - markH(230), 230, { color: C.violet, dot: C.blue });
      break;
    }
    case 'square-2': {
      s += rect(w, h, C.warm);
      { const id2 = uid('sq'); s += `<defs><clipPath id="${id2}"><rect width="${w}" height="480"/></clipPath></defs><g clip-path="url(#${id2})">${pattern(w, 560, { mode: 'grid', u: 120, sw: 5, color: C.blue })}</g><line x1="${M}" y1="520" x2="${w - M}" y2="520" stroke="${C.sand}" stroke-width="2"/>`; }
      s += lines(M, 720, ['Ideas take', 'shape here.'], { size: 118, lh: 124, fill: C.violet, weight: 500, ls: -0.025 });
      s += `<line x1="${M}" y1="900" x2="${M + 70}" y2="900" stroke="${C.violet}" stroke-width="4" stroke-linecap="round"/>`;
      s += T(M, h - M, 'purplehat.events', { size: 30, fill: C.violet, weight: 500 });
      s += markG(w - M - 200, h - M - markH(200) + 6, 200, { color: C.violet, dot: C.blue });
      break;
    }
    case 'square-3': {
      s += rect(w, h, C.warm);
      s += `<g>${photo(w, 600, { seed: 11, label: 'Event photo' })}</g>`;
      s += markG(M - 20, M - 30, 180, { color: C.warm });
      s += T(M, 700, 'Save the date', { size: 30, fill: C.blue, ls: 0.18, caps: true, weight: 600 });
      s += lines(M, 790, ['PhE Experience', 'Summit 2026'], { size: 78, lh: 84, fill: C.violet, weight: 500, ls: -0.02 });
      s += T(M, h - M, '12 December 2026  ·  Hyderabad', { size: 32, fill: C.ink });
      const bx = w - M - 330, by = h - M - 64; s += `<rect x="${bx}" y="${by - 26}" width="330" height="96" rx="48" fill="${C.blue}"/>` + T(bx + 44, by + 34, 'Register', { size: 34, fill: C.white, weight: 500 }) + `<circle cx="${bx + 330 - 48}" cy="${by + 22}" r="34" fill="${C.violet}"/>` + `<path d="M${bx + 330 - 60} ${by + 22}h24m-9-9 9 9-9 9" stroke="${C.white}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;
    }
    case 'portrait-1': {
      s += rect(w, h, C.warm);
      s += `<circle cx="${w + 40}" cy="${h + 10}" r="420" fill="none" stroke="${C.blue}" stroke-width="88"/><circle cx="${w * 0.08}" cy="${h + 200}" r="300" fill="none" stroke="${C.blue}" stroke-width="88"/>`;
      s += lines(M, 250, ['Events', 'for a more', 'connected', 'tomorrow.'], { size: 112, lh: 120, fill: C.violet, weight: 500, ls: -0.025 });
      s += `<line x1="${M}" y1="${700}" x2="${M + 70}" y2="${700}" stroke="${C.violet}" stroke-width="4" stroke-linecap="round"/>`;
      s += lockupG('primary', M, 780, 260, { color: C.violet });
      break;
    }
    case 'portrait-2': {
      s += rect(w, h, C.warm);
      s += T(M, M + 26, 'What we do', { size: 30, fill: C.blue, ls: 0.2, caps: true, weight: 500 });
      s += lines(M, 250, ['Seven ways we', 'bring people together.'], { size: 64, lh: 74, fill: C.violet, weight: 500, ls: -0.02 });
      SERVICES.forEach((sv, i) => {
        const y = 440 + i * 108; s += `<line x1="${M}" y1="${y - 64}" x2="${w - M}" y2="${y - 64}" stroke="${C.sand}" stroke-width="2"/>`;
        s += nestIcon(SERVICE_ICONS[i], M, y - 50, 56, { color: C.violet, dot: C.blue, sw: 1.6 });
        s += T(M + 96, y - 6, sv, { size: 42, fill: C.violet, weight: 400 });
        s += T(w - M, y - 6, String(i + 1).padStart(2, '0'), { size: 26, fill: C.v400, anchor: 'end', weight: 500, ls: 0.1 });
      });
      s += markG(M, h - M - markH(170), 170, { color: C.violet, dot: C.blue });
      s += T(w - M, h - M - 6, 'purplehat.events', { size: 28, fill: C.g500, anchor: 'end' });
      break;
    }
    case 'portrait-3': {
      s += rect(w, h, C.warm);
      const cid = uid('pc'); const cx = w - 380, cy = 470, r = 300;
      s += `<defs><clipPath id="${cid}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs><g clip-path="url(#${cid})"><g transform="translate(${cx - r} ${cy - r})">${photo(2 * r, 2 * r, { seed: 5, crowd: false, label: '' })}<circle cx="${r}" cy="${r * 0.82}" r="${r * 0.33}" fill="#2E2C33"/><rect x="${r * 0.38}" y="${r * 1.22}" width="${r * 1.24}" height="${r}" rx="${r * 0.6}" fill="#2E2C33"/></g></g>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${r + 26}" fill="none" stroke="${C.blue}" stroke-width="5"/>`;
      s += T(cx, cy + r + 80, 'Portrait placeholder', { size: 22, fill: C.g500, anchor: 'middle', ls: 0.15, caps: true });
      s += `<rect x="${M}" y="${M}" width="96" height="340" rx="48" fill="none" stroke="${C.violet}" stroke-width="5"/><circle cx="${M + 48}" cy="${M + 48}" r="30" fill="${C.blue}"/>`;
      s += T(M, 930, 'Keynote speaker', { size: 30, fill: C.blue, ls: 0.18, caps: true, weight: 600 });
      s += lines(M, 1030, ['Speaker Name'], { size: 92, fill: C.violet, weight: 500, ls: -0.025 });
      s += T(M, 1095, 'Title, Organisation', { size: 38, fill: C.ink });
      s += T(M, h - M, '12 Dec 2026  ·  11:00  ·  Main Stage', { size: 30, fill: C.g700 });
      s += markG(w - M - 170, h - M - markH(170) + 6, 170, { color: C.violet, dot: C.blue });
      break;
    }
    case 'story-1': {
      s += rect(w, h, '#FFFFFF');
      s += markG(M, 140, 220, { color: C.violet, dot: C.blue });
      s += T(M, 560, 'PhE Experience Summit 2026', { size: 32, fill: C.blue, ls: 0.14, caps: true, weight: 500 });
      s += lines(M, 700, ['Save', 'the date.'], { size: 150, lh: 156, fill: C.violet, weight: 500, ls: -0.03 });
      const px = w - M - 220; s += `<rect x="${px}" y="980" width="220" height="660" rx="110" fill="none" stroke="${C.violet}" stroke-width="6"/><circle cx="${px + 110}" cy="${980 + 660 - 110}" r="80" fill="${C.blue}"/>`;
      [['12', 'Dec'], ['2026', 'Sat'], ['18:00', 'Doors']].forEach(([a, b], i) => { s += T(M, 1080 + i * 190, a, { size: 96, fill: C.violet, weight: 500, ls: -0.02 }) + T(M, 1080 + i * 190 + 50, b, { size: 30, fill: C.g500, ls: 0.16, caps: true }); });
      s += T(M, h - 150, 'Hyderabad', { size: 40, fill: C.violet, weight: 500 }) + T(M, h - 100, 'Venue to be announced', { size: 30, fill: C.g500 });
      break;
    }
    case 'story-2': {
      s += photo(w, h, { seed: 21, label: 'Event photo', rows: 3, focus: 0.45 });
      s += `<rect y="1080" width="${w}" height="${h - 1080}" fill="${C.warm}"/>`;
      s += `<circle cx="${w - 250}" cy="430" r="150" fill="none" stroke="${C.warm}" stroke-width="6"/><circle cx="${w - 250}" cy="430" r="40" fill="${C.blue}"/>`;
      s += lines(M, 1250, ['Ideas', 'take shape', 'here.'], { size: 120, lh: 128, fill: C.violet, weight: 500, ls: -0.025 });
      s += `<line x1="${M}" y1="1590" x2="${M + 70}" y2="1590" stroke="${C.blue}" stroke-width="4" stroke-linecap="round"/>`;
      s += markG(M, h - 150 - markH(200), 200, { color: C.violet, dot: C.blue });
      break;
    }
    case 'story-3': {
      s += rect(w, h, C.warm);
      { const gid = uid('sg'); s += `<defs><clipPath id="${gid}"><rect width="${w}" height="600"/></clipPath></defs><g clip-path="url(#${gid})">${pattern(w, 640, { mode: 'toggle', u: 110, sw: 5, color: C.violet, accent: C.blue, seed: 4 })}</g><line x1="${M}" y1="660" x2="${w - M}" y2="660" stroke="${C.sand}" stroke-width="2"/>`; }
      s += markG(M, 800, w - 2 * M, { color: C.violet, dot: C.blue });
      s += lines(M, 1260, ['Planning an event?', 'Let’s make it an', 'experience.'], { size: 76, lh: 88, fill: C.violet, weight: 500, ls: -0.02 });
      const by = 1560; s += `<rect x="${M}" y="${by}" width="${w - 2 * M}" height="150" rx="75" fill="${C.blue}"/>` + T(M + 70, by + 92, 'Talk to us', { size: 50, fill: C.white, weight: 500 }) + `<circle cx="${w - M - 75}" cy="${by + 75}" r="54" fill="${C.violet}"/><path d="M${w - M - 97} ${by + 75}h40m-15-15 15 15-15 15" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += T(w / 2, h - 110, 'hello@purplehat.events', { size: 34, fill: C.violet, anchor: 'middle' });
      break;
    }
  }
  return { w, h, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${s}</svg>` };
}

// ================================================================= slides (HTML 1920 x 1080)
export const SLIDES = ['title', 'section', 'content', 'closing'];
export function slideCSS() {
  return `.slide{width:1920px;height:1080px;position:relative;overflow:hidden;background:var(--warm);color:var(--ink)}
.slide .lbl{position:absolute;font-size:22px;letter-spacing:.22em;text-transform:uppercase;font-weight:500}
.slide h1{margin:0;font-weight:500;letter-spacing:-.03em;line-height:1.02}
.slide h2{margin:0;font-weight:500;letter-spacing:-.02em;line-height:1.08}
.slide p{margin:0}
.slide .ft{position:absolute;left:120px;right:120px;bottom:64px;display:flex;justify-content:space-between;align-items:center;font-size:20px;letter-spacing:.06em}
.slide [contenteditable]:focus{outline:2px dashed var(--blue);outline-offset:8px}
.slide ul{list-style:none;margin:0;padding:0}
.slide li{position:relative;padding-left:44px;font-size:34px;line-height:1.35;margin:0 0 26px}
.slide li:before{content:'';position:absolute;left:4px;top:.5em;width:16px;height:16px;border-radius:50%;background:var(--blue)}`;
}
export function slide(id, n = 1) {
  const ft = (dark) => `<div class="ft" style="color:${dark ? C.v200 : C.g500}"><span>PurpleHat Events · Presentation title</span><span>${dark ? '' : String(n).padStart(2, '0')}</span></div>`;
  if (id === 'title') return `<section class="slide" style="background:#FFFFFF;color:${C.violet}">
  <svg style="position:absolute;right:0;top:0" width="760" height="1080" viewBox="0 0 760 1080"><circle cx="430" cy="250" r="190" fill="none" stroke="${C.violet}" stroke-width="5"/><rect x="240" y="490" width="380" height="700" rx="190" fill="none" stroke="${C.violet}" stroke-width="5"/><circle cx="430" cy="680" r="120" fill="${C.blue}"/></svg>
  <div style="position:absolute;left:120px;top:110px">${mark({ width: 300, color: C.violet, dot: C.blue })}</div>
  <div class="lbl" style="left:120px;top:470px;color:${C.blue}" contenteditable>Client name · Proposal</div>
  <h1 contenteditable style="position:absolute;left:120px;top:530px;width:1100px;font-size:118px">Presentation title goes here</h1>
  <p contenteditable style="position:absolute;left:120px;top:830px;font-size:32px;color:${C.g500}">Presenter name · 16 October 2026</p>
  ${ft(false)}</section>`;
  if (id === 'section') return `<section class="slide">
  <div style="position:absolute;left:120px;top:110px">${mark({ width: 170, color: C.violet, dot: C.blue })}</div>
  <div contenteditable style="position:absolute;left:112px;top:300px;font-size:300px;font-weight:500;letter-spacing:-.05em;color:${C.violet};line-height:1">02</div>
  <h1 contenteditable style="position:absolute;left:120px;top:640px;width:1100px;font-size:96px;color:${C.violet}">Section title</h1>
  <p contenteditable style="position:absolute;left:124px;top:780px;font-size:32px;color:${C.g700}">One line that frames what this section is about.</p>
  <svg style="position:absolute;right:160px;top:180px" width="300" height="720" viewBox="0 0 300 720"><rect x="40" y="3" width="220" height="560" rx="110" fill="none" stroke="${C.violet}" stroke-width="5"/><circle cx="150" cy="${3 + 560 - 110}" r="80" fill="${C.blue}"/><circle cx="150" cy="650" r="60" fill="none" stroke="${C.violet}" stroke-width="5"/></svg>
  ${ft(false)}</section>`;
  if (id === 'content') return `<section class="slide">
  <div class="lbl" style="left:120px;top:100px;color:${C.blue}" contenteditable>02 · Approach</div>
  <h2 contenteditable style="position:absolute;left:120px;top:160px;width:900px;font-size:68px;color:${C.violet}">A headline that says the one thing this slide proves</h2>
  <ul contenteditable style="position:absolute;left:120px;top:440px;width:820px">
    <li>Bullets start with a blue dot — the brand’s full stop.</li>
    <li>Keep to three or four points, one line each where possible.</li>
    <li>Use Satoshi Regular 34 px for body on slides.</li>
    <li>Numbers and outcomes beat adjectives.</li>
  </ul>
  <div style="position:absolute;right:120px;top:100px;width:700px;height:820px;border-radius:350px 350px 40px 40px;overflow:hidden">
    <svg viewBox="0 0 700 820" width="700" height="820">${photo(700, 820, { seed: 8, label: 'Photo placeholder', lx: 0.3, ly: 0.1 })}</svg></div>
  ${ft(false)}</section>`;
  if (id === 'closing') return `<section class="slide" style="background:#FFFFFF;color:${C.violet}">
  <div style="position:absolute;left:120px;top:150px">${mark({ width: 520, color: C.violet, dot: C.blue })}</div>
  <h1 contenteditable style="position:absolute;left:120px;top:460px;font-size:120px">Thank you.</h1>
  <div contenteditable style="position:absolute;left:124px;top:640px;font-size:32px;line-height:1.6;color:${C.g700}">Akash Medishetty · Chief Technology Officer<br>hello@purplehat.events · +91 00000 00000<br>purplehat.events</div>
  <svg style="position:absolute;right:120px;top:200px" width="560" height="700" viewBox="0 0 560 700"><rect x="3" y="250" width="554" height="200" rx="100" fill="none" stroke="${C.violet}" stroke-width="5"/><circle cx="457" cy="350" r="70" fill="${C.blue}"/><circle cx="103" cy="100" r="80" fill="none" stroke="${C.violet}" stroke-width="5"/><circle cx="103" cy="600" r="80" fill="none" stroke="${C.violet}" stroke-width="5"/></svg>
  ${ft(false)}</section>`;
}
