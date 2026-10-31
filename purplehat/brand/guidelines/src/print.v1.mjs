// Print components (units: mm). Origin = trim top-left; backgrounds run 3 mm into the bleed.
import { C, T, f2, markG, markH, lockupG, LOCK, pattern, photo, uid, W, H } from './lib.mjs';

export const PERSON = { name: 'Akash Medishetty', title: 'Founder', phone: '+91 00000 00000', email: 'hello@purplehat.events', web: 'purplehat.events', city: 'Hyderabad, India' };
export const PLACEHOLDER_NOTE = 'PLACEHOLDER contact details (phone, email, web) — replace before print';
export const BLEED = 3;

const bg = (tw, th, fill, b = BLEED) => `<rect x="${-b}" y="${-b}" width="${tw + 2 * b}" height="${th + 2 * b}" fill="${fill}"/>`;
const clip = (tw, th, b, inner) => { const id = uid('cl'); return `<defs><clipPath id="${id}"><rect x="${-b}" y="${-b}" width="${tw + 2 * b}" height="${th + 2 * b}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>`; };

// ================================================================= business cards
export function card(dir, side, tw = 89, th = 51) {
  const m = 5; const P = PERSON; let s = '';
  const contacts = (x, yBottom, o = {}) => {
    const lines = o.lines || [P.phone, P.email, P.web, P.city]; const lh = o.lh || 3.3; let out = '';
    lines.forEach((l, i) => {
      const y = yBottom - (lines.length - 1 - i) * lh;
      if (o.bullets) out += `<circle cx="${f2(x + 0.65)}" cy="${f2(y - 0.8)}" r="0.62" fill="${C.blue}"/>`;
      out += T(x + (o.bullets ? 2.8 : 0), y, l, { size: o.size || 2.35, fill: o.fill || C.ink, weight: 400 });
    });
    return out;
  };
  if (dir === 'A') {
    if (side === 'front') {
      s += bg(tw, th, C.warm);
      s += markG(m, m, 20, { color: C.violet });
      const px = tw - m - 8.5, py = m, ph = th - 2 * m;
      s += `<rect x="${px}" y="${py}" width="8.5" height="${ph}" rx="4.25" fill="none" stroke="${C.blue}" stroke-width="0.45"/><circle cx="${px + 4.25}" cy="${py + ph - 4.25}" r="2.9" fill="${C.blue}"/>`;
      const yb = th - m;
      s += contacts(m, yb);
      s += T(m, yb - 3 * 3.3 - 5.6, P.title, { size: 2.15, fill: C.blue, ls: 0.16, caps: true, weight: 500 });
      s += T(m, yb - 3 * 3.3 - 9.6, P.name, { size: 3.9, fill: C.violet, weight: 600, ls: -0.01 });
    } else {
      s += bg(tw, th, C.violet);
      s += clip(tw, th, BLEED, `<circle cx="${f2(tw - 14)}" cy="11" r="7.4" fill="none" stroke="${C.v600}" stroke-width="0.6"/><rect x="${f2(tw - 21.4)}" y="21.6" width="14.8" height="${th}" rx="7.4" fill="none" stroke="${C.v600}" stroke-width="0.6"/><circle cx="${f2(tw - 14)}" cy="${f2(21.6 + 7.4)}" r="4.6" fill="${C.blue}"/>`);
      const mw = tw * 0.5; s += markG(m + 1, (th - markH(mw)) / 2 - 3, mw, { color: C.warm });
      s += T(m + 1, th - m - 0.5, 'Events for a more connected tomorrow.', { size: 2.15, fill: C.v200, weight: 400 });
    }
  } else if (dir === 'B') {
    if (side === 'front') {
      s += bg(tw, th, C.warm);
      s += markG(tw - m - 16, m + 0.4, 16, { color: C.violet, dot: C.blue });
      s += T(m, m + 3.6, P.name, { size: 3.9, fill: C.violet, weight: 600, ls: -0.01 });
      s += T(m, m + 8.4, P.title, { size: 2.15, fill: C.blue, ls: 0.16, caps: true, weight: 500 });
      s += `<line x1="${m}" y1="${m + 13}" x2="${m + 6}" y2="${m + 13}" stroke="${C.violet}" stroke-width="0.35" stroke-linecap="round"/>`;
      s += contacts(m, th - m, { bullets: true });
      s += T(tw - m, th - m, 'People · Places · Experiences', { size: 1.7, fill: C.violet, ls: 0.2, caps: true, anchor: 'end', weight: 500, opacity: 0.7 });
    } else {
      s += bg(tw, th, C.warm);
      const lw = 40; const lh = lw * LOCK.primary.h / LOCK.primary.w;
      s += lockupG('primary', (tw - lw) / 2, (th - lh) / 2 - 2.5, lw, { color: C.violet, dot: C.blue });
      s += T(tw / 2, th - m, 'People · Ideas · Places · Experiences · Together', { size: 1.75, fill: C.violet, ls: 0.22, caps: true, anchor: 'middle', weight: 500 });
    }
  } else if (dir === 'C') {
    const r = th / 2;
    if (side === 'front') {
      s += bg(tw, th, C.violet);
      const cr = th * 0.27, ccx = tw - r; s += `<circle cx="${f2(ccx)}" cy="${f2(r)}" r="${f2(cr)}" fill="${C.blue}"/>`;
      s += `<rect x="3.2" y="3.2" width="${f2(tw - 6.4)}" height="${f2(th - 6.4)}" rx="${f2(r - 3.2)}" fill="none" stroke="${C.v600}" stroke-width="0.5"/>`;
      const mw = ccx - cr - 3.5 - 11; s += markG(11, r - markH(mw) / 2 - 1, mw, { color: C.warm });
    } else {
      s += bg(tw, th, C.warm);
      const cr = th * 0.27; s += `<circle cx="${f2(r)}" cy="${f2(r)}" r="${f2(cr)}" fill="none" stroke="${C.violet}" stroke-width="0.6"/>`;
      s += `<rect x="3.2" y="3.2" width="${f2(tw - 6.4)}" height="${f2(th - 6.4)}" rx="${f2(r - 3.2)}" fill="none" stroke="${C.blue}" stroke-width="0.4"/>`;
      const x = r + cr + 4; const yc = r;
      s += T(x, yc - 6.2, P.name, { size: 3.3, fill: C.violet, weight: 600, ls: -0.01 });
      s += T(x, yc - 2.4, P.title, { size: 1.9, fill: C.blue, ls: 0.16, caps: true, weight: 500 });
      s += contacts(x, yc + 9.6, { lines: [P.phone, P.email, P.web], size: 2.15, lh: 3.1 });
    }
  }
  return s;
}
export const cardShape = (dir, tw, th) => dir === 'C' ? `<rect width="${tw}" height="${th}" rx="${th / 2}"/>` : `<rect width="${tw}" height="${th}" rx="0"/>`;

/** Crop marks + slug for a trim box tw x th, slug = space around the trim. */
export function cropMarks(tw, th, o = {}) {
  const { off = BLEED + 0.5, len = 5, col = '#000', sw = 0.12 } = o; let s = `<g stroke="${col}" stroke-width="${sw}" fill="none">`;
  for (const x of [0, tw]) { s += `<line x1="${x}" y1="${-off}" x2="${x}" y2="${-off - len}"/><line x1="${x}" y1="${th + off}" x2="${x}" y2="${th + off + len}"/>`; }
  for (const y of [0, th]) { s += `<line x1="${-off}" y1="${y}" x2="${-off - len}" y2="${y}"/><line x1="${tw + off}" y1="${y}" x2="${tw + off + len}" y2="${y}"/>`; }
  return s + '</g>';
}
export function dieLine(shape) { return `<g fill="none" stroke="#EC008C" stroke-width="0.2" stroke-dasharray="1.2 0.8">${shape}</g>`; }

// ================================================================= luggage-style tags (pill, punched hole)
export const TAG = { w: 110, h: 42, hole: { x: 9.5, r: 2.6 } };
export function tag(variant, side) {
  const { w, h } = TAG; const r = h / 2; let s = '';
  const inset = (col, sw = 0.5) => `<rect x="3.4" y="3.4" width="${w - 6.8}" height="${h - 6.8}" rx="${r - 3.4}" fill="none" stroke="${col}" stroke-width="${sw}"/>`;
  if (variant === 1) {
    if (side === 'front') {
      s += bg(w, h, C.violet); s += markG(19, r - markH(46) / 2 - 1, 46, { color: C.warm });
      s += T(73, r - 1.6, 'Events for a more', { size: 2.7, fill: C.warm, weight: 400 }) + T(73, r + 2.4, 'connected tomorrow.', { size: 2.7, fill: C.warm, weight: 400 });
    } else {
      s += bg(w, h, C.warm) + inset(C.blue);
      s += `<circle cx="${w - r}" cy="${r}" r="${r - 8}" fill="none" stroke="${C.blue}" stroke-width="0.6"/>`;
      s += T(19, r - 1, 'PurpleHat Events', { size: 4.8, fill: C.violet, weight: 600, ls: -0.01 }) + T(19, r + 4.6, 'Events for a more connected tomorrow.', { size: 2.3, fill: C.blue, weight: 400 });
    }
  } else if (variant === 2) {
    if (side === 'front') {
      s += bg(w, h, C.warm) + inset(C.blue);
      s += markG(19, r - markH(42) / 2 - 1, 42, { color: C.violet, dot: C.blue });
      s += `<circle cx="${w - r}" cy="${r}" r="${r - 8}" fill="none" stroke="${C.blue}" stroke-width="0.6"/><circle cx="${w - r}" cy="${r}" r="3" fill="${C.blue}"/>`;
    } else {
      s += bg(w, h, C.violet) + inset(C.v600);
      ['People', 'Ideas', 'Places', 'Experiences'].forEach((wd, i) => { s += `<circle cx="${19 + i * 21}" cy="${r - 3.2}" r="1" fill="${i === 3 ? C.blue : C.warm}"/>` + T(19 + i * 21 - 1, r + 3, wd, { size: 2.3, fill: C.warm, ls: 0.12, caps: true, weight: 500 }); });
    }
  } else {
    if (side === 'front') {
      s += bg(w, h, C.blue); s += markG(19, r - markH(46) / 2 - 1, 46, { color: C.warm, dot: C.violet });
      s += T(w - 14, r + 1, 'PHE 2026', { size: 2.6, fill: C.warm, ls: 0.2, weight: 500, anchor: 'end' });
    } else {
      s += bg(w, h, C.warm) + inset(C.violet, 0.4);
      s += T(19, 13.5, 'This tag belongs to', { size: 2.1, fill: C.blue, caps: true, ls: 0.16, weight: 500 });
      [20.5, 27.5, 34].forEach((y, i) => { s += `<line x1="19" y1="${y}" x2="${w - 24}" y2="${y}" stroke="${C.violet}" stroke-width="0.25" opacity=".55"/>` + T(19, y - 1.2, ['Name', 'Phone', 'Event'][i], { size: 1.8, fill: C.violet, opacity: 0.6 }); });
      s += `<circle cx="${w - 13}" cy="${r}" r="4" fill="none" stroke="${C.violet}" stroke-width="0.5"/>`;
    }
  }
  return s;
}
export const tagShape = () => `<rect width="${TAG.w}" height="${TAG.h}" rx="${TAG.h / 2}"/><circle cx="${TAG.hole.x}" cy="${TAG.h / 2}" r="${TAG.hole.r}"/>`;

// ================================================================= ticket (180 x 70, perforated stub at 124)
export const TICKET = { w: 180, h: 70, stub: 124 };
export function ticket(side) {
  const { w, h, stub } = TICKET; let s = '';
  if (side === 'front') {
    s += bg(w, h, C.warm);
    s += `<rect x="-3" y="-3" width="${stub + 3}" height="${h + 6}" fill="${C.violet}"/>`;
    { const id = uid('tk'); s += `<defs><clipPath id="${id}"><rect x="-3" y="-3" width="${stub + 3}" height="${h + 6}"/></clipPath></defs><g clip-path="url(#${id})"><circle cx="${stub - 4}" cy="${h + 6}" r="26" fill="none" stroke="${C.v600}" stroke-width="0.6"/><circle cx="${stub - 4}" cy="${h + 6}" r="16" fill="none" stroke="${C.v600}" stroke-width="0.6"/></g>`; }
    s += markG(9, 9, 40, { color: C.warm });
    s += T(9, 9 + markH(40) + 5.5, 'PurpleHat Events', { size: 3.1, fill: C.warm, weight: 500 });
    s += T(9, 42, 'General', { size: 6.4, fill: C.warm, weight: 500, ls: -0.01 }) + T(9, 49.5, 'Access', { size: 6.4, fill: C.warm, weight: 500, ls: -0.01 });
    s += `<line x1="9" y1="54.5" x2="15" y2="54.5" stroke="${C.warm}" stroke-width="0.35"/>`;
    s += T(9, 60, 'Ideas for a brighter tomorrow.', { size: 2.5, fill: C.v200 });
    const cx = 62; [['Event', 'PhE Experience Summit 2026'], ['Date', 'Sat 12 Dec 2026 · 18:00'], ['Venue', 'Venue name, Hyderabad'], ['Seat', 'Open seating']].forEach(([k, v], i) => {
      s += T(cx, 15 + i * 6.2, k, { size: 1.8, fill: C.v400, caps: true, ls: 0.16, weight: 500 }) + T(cx + 12, 15 + i * 6.2, v, { size: 2.5, fill: C.warm });
    });
    // perforation + notches
    s += `<line x1="${stub}" y1="3" x2="${stub}" y2="${h - 3}" stroke="${C.stone}" stroke-width="0.35" stroke-dasharray="0.8 1.2"/>`;
    const rx = stub + 7, rw = w - stub - 14;
    s += `<circle cx="${rx + rw / 2}" cy="17" r="10.5" fill="none" stroke="${C.blue}" stroke-width="0.7"/>`;
    s += `<rect x="${rx + rw / 2 - 10.5}" y="31" width="21" height="33" rx="10.5" fill="none" stroke="${C.blue}" stroke-width="0.7"/><circle cx="${rx + rw / 2}" cy="${64 - 10.5}" r="5.2" fill="${C.blue}"/>`;
    s += T(w - 6, 50, 'PHE 2026', { size: 3.2, fill: C.violet, weight: 600, ls: 0.12, rotate: -90, anchor: 'middle' });
    s += T(rx - 0.5, 50, 'No. 000127', { size: 1.8, fill: C.violet, weight: 500, ls: 0.1, rotate: -90, anchor: 'middle', opacity: 0.7 });
  } else {
    s += bg(w, h, C.warm);
    { const id = uid('tk'); s += `<defs><clipPath id="${id}"><rect x="${stub}" y="-3" width="${w - stub + 3}" height="${h + 6}"/></clipPath></defs><g clip-path="url(#${id})"><g transform="translate(${stub + 4} 0)">${pattern(w - stub + 3, h + 3, { mode: 'grid', u: 9, sw: 0.4, color: C.blue })}</g></g>`; }
    s += markG(9, 9, 22, { color: C.violet, dot: C.blue });
    s += T(9, 25, 'Good to know', { size: 3.4, fill: C.violet, weight: 600 });
    ['Doors open 60 minutes before the start time.', 'Show this ticket (printed or on your phone) at entry.', 'One ticket admits one guest. Not for resale.', 'Accessibility needs? Talk to us before the day.', 'Terms & conditions: purplehat.events/terms (placeholder)'].forEach((l, i) => {
      s += `<circle cx="10" cy="${f2(31.4 + i * 5.3 - 0.8)}" r="0.6" fill="${C.blue}"/>` + T(12.5, 31.4 + i * 5.3, l, { size: 2.3, fill: C.ink });
    });
    s += `<line x1="${stub}" y1="3" x2="${stub}" y2="${h - 3}" stroke="${C.stone}" stroke-width="0.35" stroke-dasharray="0.8 1.2"/>`;
  }
  return s;
}
export const ticketShape = () => { const { w, h, stub } = TICKET; return `<path d="M3 0H${stub - 3}A3 3 0 0 0 ${stub + 3} 0H${w - 3}A3 3 0 0 1 ${w} 3V${h - 3}A3 3 0 0 1 ${w - 3} ${h}H${stub + 3}A3 3 0 0 0 ${stub - 3} ${h}H3A3 3 0 0 1 0 ${h - 3}V3A3 3 0 0 1 3 0Z"/>`; };

// ================================================================= badge 100 x 140 (+ lanyard)
export const BADGE = { w: 100, h: 140 };
export const ROLES = { Delegate: C.blue, Speaker: C.violet, Crew: C.ink };
export function badge(side, o = {}) {
  const { w, h } = BADGE; const { role = 'Delegate', name = 'Delegate Name', org = 'Organisation name' } = o; const rc = ROLES[role]; let s = '';
  if (side === 'front') {
    s += bg(w, h, C.warm);
    s += markG(9, 18, 50, { color: C.violet, dot: role === 'Delegate' ? C.blue : C.violet });
    s += T(9.5, 18 + markH(50) + 7, 'PurpleHat Events', { size: 3.9, fill: C.violet, weight: 500 });
    s += T(9.5, 62, role, { size: 2.6, fill: rc, ls: 0.18, caps: true, weight: 600 });
    s += T(9.5, 72, name.split(' ')[0], { size: 7, fill: C.ink, weight: 600, ls: -0.015 }) + T(9.5, 80.5, name.split(' ').slice(1).join(' '), { size: 7, fill: C.ink, weight: 600, ls: -0.015 });
    s += T(9.5, 87.5, org, { size: 3, fill: C.g500 });
    ['Access', 'Ideas', 'People', 'Experiences'].forEach((wd, i) => { s += T(9.5, 107 + i * 5, wd, { size: 3, fill: C.violet }); });
    s += `<rect x="${w - 27}" y="58" width="17" height="44" rx="8.5" fill="none" stroke="${rc}" stroke-width="0.8"/><circle cx="${w - 18.5}" cy="117" r="8.5" fill="none" stroke="${rc}" stroke-width="0.8"/><circle cx="${w - 18.5}" cy="117" r="4" fill="${rc}"/>`;
    s += `<rect x="${w / 2 - 8}" y="6" width="16" height="3.4" rx="1.7" fill="${C.sand}"/>`; // clip slot (punched)
    s += T(w - 9, 133, 'PhE Experience Summit 2026', { size: 2.1, fill: C.g500, anchor: 'end' });
  } else {
    s += bg(w, h, rc === C.ink ? C.ink : C.violet);
    s += clip(w, h, 3, pattern(w + 6, h + 6, { mode: 'big', color: C.v600, sw: 0.7 }));
    s += `<rect x="${w / 2 - 8}" y="6" width="16" height="3.4" rx="1.7" fill="${C.v950}"/>`;
    s += `<rect x="${w / 2 - 20}" y="34" width="40" height="40" rx="7" fill="${C.warm}"/>`;
    const R = (i, j) => ((i * 7 + j * 13 + i * j) % 5) < 2; let q = '';
    for (let i = 0; i < 11; i++) for (let j = 0; j < 11; j++) { const corner = (i < 3 && j < 3) || (i > 7 && j < 3) || (i < 3 && j > 7); if (corner || R(i, j)) q += `<circle cx="${w / 2 - 15 + i * 3}" cy="${39 + j * 3}" r="1.15" fill="${C.violet}"/>`; }
    s += q + T(w / 2, 80, 'QR placeholder — scan to check in', { size: 2.2, fill: C.warm, anchor: 'middle' });
    s += T(w / 2, 104, 'Wi-Fi  PhE-Guest', { size: 3, fill: C.warm, anchor: 'middle', weight: 500 }) + T(w / 2, 110, 'Password on the welcome desk', { size: 2.4, fill: C.v200, anchor: 'middle' });
    s += markG(w / 2 - 14, 120, 28, { color: C.warm });
  }
  return s;
}
export const badgeShape = () => `<rect width="${BADGE.w}" height="${BADGE.h}" rx="5"/><rect x="${BADGE.w / 2 - 8}" y="6" width="16" height="3.4" rx="1.7"/>`;
export const LANYARD = { w: 20, h: 450 };
export function lanyard() {
  const { w, h } = LANYARD; let s = bg(w, h, C.blue);
  for (let y = 12, i = 0; y < h; y += 75, i++) {
    s += `<g transform="translate(${w / 2 + 4.2} ${y}) rotate(90)">${markG(0, 0, 32, { color: C.warm })}</g>`;
    s += `<g transform="translate(${w / 2 + 1.2} ${y + 42}) rotate(90)">${T(0, 0, 'PurpleHat Events', { size: 3.6, fill: C.warm, weight: 500 })}</g>`;
  }
  return s;
}

// ================================================================= envelope DL 220 x 110
export const DL = { w: 220, h: 110 };
export function envelope(side) {
  const { w, h } = DL; let s = '';
  if (side === 'front') {
    s += bg(w, h, C.white);
    s += lockupG('horizontal', 14, 12, 58, { color: C.violet, dot: C.blue });
    ['PurpleHat Events', 'Hyderabad, Telangana, India', 'purplehat.events  ·  hello@purplehat.events'].forEach((l, i) => { s += T(14, 31 + i * 4, l, { size: 2.5, fill: i ? C.g500 : C.violet, weight: i ? 400 : 500 }); });
    s += `<rect x="110" y="52" width="92" height="38" rx="4" fill="none" stroke="${C.g300}" stroke-width="0.3" stroke-dasharray="1.2 1"/>` + T(115, 59, 'Recipient address (window / label area)', { size: 2.2, fill: C.g400 });
    { let x = 14, i = 0, row = ''; const u = 6, y = h - 14; while (x < w - 14) { const pw = i % 2 ? u : u * 2.2; if (x + pw > w - 14) break; row += i % 2 ? `<circle cx="${f2(x + u / 2)}" cy="${y + u / 2}" r="${u / 2}"/>` : `<rect x="${f2(x)}" y="${y}" width="${f2(pw)}" height="${u}" rx="${u / 2}"/>`; x += pw + 2.2; i++; }
      s += `<g fill="none" stroke="${C.blue}" stroke-width="0.35">${row}</g>`; }
  } else {
    s += bg(w, h, C.white);
    s += `<path d="M-3 -3H${w + 3}V12L${w / 2 + 14} 56A20 20 0 0 1 ${w / 2 - 14} 56L-3 12Z" fill="${C.violet}"/>`;
    s += markG(w / 2 - 16, 26, 32, { color: C.warm });
    s += T(w / 2, h - 10, 'Events for a more connected tomorrow.', { size: 2.6, fill: C.violet, anchor: 'middle' });
  }
  return s;
}
