import fs from 'fs';
const W = '#F6F4EF', L = '#D7CFFF', M = '#A996FF', P = '#5E44E8', D = '#3B2AA6';
const f = (n) => String(+(+n).toFixed(2));
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const C = [];
const add = (id, name, short, idea, rule, body) => C.push({ id, name, short, idea, rule, body });

// Shared top hat (side view): crown with slight flare, band, brim
const topHat = (cx, top, w, h, brimW, col = W, band = L, brimCol = col) => {
  const x0 = cx - w / 2, x1 = cx + w / 2, fl = w * 0.04, r = 3;
  return `<path d="M${f(x0 + fl)} ${f(top + h)}L${f(x0)} ${f(top + r)}Q${f(x0)} ${f(top)} ${f(x0 + r)} ${f(top)}H${f(x1 - r)}Q${f(x1)} ${f(top)} ${f(x1)} ${f(top + r)}L${f(x1 - fl)} ${f(top + h)}Z" fill="${col}"/>` +
    (band ? `<rect x="${f(x0 + fl * 0.6)}" y="${f(top + h * 0.72)}" width="${f(w - fl * 1.2)}" height="${f(h * 0.13)}" fill="${band}"/>` : '') +
    `<rect x="${f(cx - brimW / 2)}" y="${f(top + h - 2)}" width="${f(brimW)}" height="${f(h * 0.13 + 2)}" rx="${f((h * 0.13 + 2) / 2)}" fill="${brimCol}"/>`;
};

// 1 Spotlight
add('c01', 'Spotlight', 'Spotlight', 'A top hat made of light: the beam is the crown, the pool of light is the brim.', 'The beam always fades upward.',
  `<defs><linearGradient id="g01" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${L}"/><stop offset="1" stop-color="${L}" stop-opacity="0.05"/></linearGradient></defs>` +
  `<path d="M74 54H126L134 140H66Z" fill="url(#g01)"/><ellipse cx="100" cy="52" rx="28" ry="7" fill="${W}"/><rect x="90" y="36" width="20" height="14" rx="3" fill="${W}"/><ellipse cx="100" cy="142" rx="66" ry="13" fill="${W}"/>`);
// 2 Hat trick
add('c02', 'Hat Trick', 'Hat trick', 'Three rising dots leave the hat: the magic trick, and three wins in a row.', 'Always three dots, always rising right.',
  topHat(92, 70, 64, 78, 112) + `<circle cx="104" cy="54" r="7" fill="${L}"/><circle cx="124" cy="38" r="5.5" fill="${L}"/><circle cx="146" cy="28" r="4" fill="${L}"/>`);
// 3 Hats off
add('c03', 'Hats Off', 'Hats off', 'A hat tossed in the air: celebration, and respect for the people in the room.', 'Tilted 18°, never upright.',
  `<g transform="rotate(-18 100 92)">${topHat(100, 46, 60, 74, 104)}</g><path d="M62 150Q100 162 138 150" fill="none" stroke="${L}" stroke-width="6" stroke-linecap="round"/><path d="M78 166Q100 172 122 166" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round" opacity="0.6"/>`);
// 4 Many hats
add('c04', 'Many Hats', 'Many hats', 'We wear many hats: a cap, a bowler and a top hat stacked into one figure.', 'Three hats, largest at the base.',
  `<path d="M52 166A42 42 0 0 1 136 166Z" fill="${W}"/><path d="M130 160H170A6 6 0 0 1 170 172H130Z" fill="${W}"/><rect x="52" y="164" width="84" height="8" fill="${W}"/>` +
  `<path d="M66 122A28 28 0 0 1 122 122Z" fill="${L}"/><rect x="56" y="119" width="76" height="8" rx="4" fill="${L}"/>` +
  `<rect x="78" y="52" width="32" height="40" rx="3" fill="${W}"/><rect x="70" y="88" width="48" height="7" rx="3.5" fill="${W}"/>`);
// 5 Bowler
add('c05', 'Bowler', 'Bowler', 'One semicircle and one line: a bowler hat, a sunrise and a domed venue at once.', 'The gap between dome and brim stays one stroke.',
  `<path d="M42 122A58 58 0 0 1 158 122Z" fill="${W}"/><rect x="20" y="130" width="160" height="14" rx="7" fill="${L}"/>`);
// 6 Folded
add('c06', 'Folded', 'Folded', 'A top hat folded from flat planes, like paper: crafted, designed, made by hand.', 'Only triangles, in three tints.',
  `<path d="M70 52L100 52L70 126Z" fill="${W}"/><path d="M100 52L130 52L130 126Z" fill="${L}"/><path d="M100 52L130 126L70 126Z" fill="#E9E4FF"/><path d="M70 52L100 52L70 126Z" fill="${W}"/><path d="M100 52L70 126L70 52Z" fill="${W}"/>` +
  `<path d="M100 52L130 126H70Z" fill="${M}"/><path d="M34 126H100L70 144Z" fill="${L}"/><path d="M100 126H166L130 144Z" fill="${W}"/><path d="M70 144L100 126L130 144Z" fill="${M}"/>`);
// 7 PH ligature
add('c07', 'PH Ligature', 'PH', 'P and H share one stem; the bottom of the P\u2019s bowl is the bar of the H.', 'One stroke weight, square ends.',
  `<path d="M58 152V52H86A24 24 0 0 1 86 100H58M58 100H146M146 52V152" fill="none" stroke="${W}" stroke-width="16" stroke-linejoin="miter"/>`);
// 8 Hat in the H
add('c08', 'Hat in the H', 'Hat in H', 'The bar of the H is a small top hat sitting between the two stems.', 'The brim always spans the stems.',
  `<rect x="44" y="44" width="24" height="112" rx="2" fill="${W}"/><rect x="132" y="44" width="24" height="112" rx="2" fill="${W}"/><rect x="82" y="66" width="36" height="34" rx="3" fill="${L}"/><rect x="68" y="98" width="64" height="11" fill="${L}"/>`);
// 9 P counter
add('c09', 'P Counter', 'P counter', 'A heavy P whose hole is a top hat: the hat hides inside the letter.', 'The hat counter sits on the bowl’s centre line.',
  `<path d="M50 160V40H108A42 42 0 0 1 108 124H84V160Z" fill="${W}"/><rect x="88" y="60" width="26" height="30" rx="2" fill="${P}"/><rect x="80" y="88" width="42" height="7" rx="3.5" fill="${P}"/>`);
// 10 ph lowercase
add('c10', 'Lowercase ph', 'ph', 'A friendly lowercase p and h; the h wears a small top hat.', 'Round ends, one weight, hat in lavender.',
  `<path d="M58 84V164" stroke="${W}" stroke-width="14" stroke-linecap="round"/><circle cx="81" cy="106" r="22" fill="none" stroke="${W}" stroke-width="14"/><path d="M122 62V138M122 112A20 20 0 0 1 162 112V138" fill="none" stroke="${W}" stroke-width="14" stroke-linecap="round"/><rect x="112" y="30" width="20" height="18" rx="2" fill="${L}"/><rect x="104" y="46" width="36" height="6" rx="3" fill="${L}"/>`);
// 11 Stencil PHE
const stP = (x, y) => `<rect x="${x}" y="${y}" width="14" height="80" fill="${W}"/><path fill-rule="evenodd" d="M${x + 18} ${y}H${x + 24}A22 22 0 0 1 ${x + 24} ${y + 44}H${x + 18}ZM${x + 18} ${y + 14}H${x + 24}A8 8 0 0 1 ${x + 24} ${y + 30}H${x + 18}Z" fill="${W}"/>`;
const stH = (x, y) => `<rect x="${x}" y="${y}" width="14" height="80" fill="${W}"/><rect x="${x + 34}" y="${y}" width="14" height="80" fill="${W}"/><rect x="${x + 18}" y="${y + 33}" width="12" height="14" fill="${L}"/>`;
const stE = (x, y) => `<rect x="${x}" y="${y}" width="14" height="80" fill="${W}"/><rect x="${x + 18}" y="${y}" width="22" height="14" fill="${W}"/><rect x="${x + 18}" y="${y + 33}" width="17" height="14" fill="${W}"/><rect x="${x + 18}" y="${y + 66}" width="22" height="14" fill="${W}"/>`;
add('c11', 'Stencil PHE', 'Stencil', 'P, H and E cut from a stencil. The gaps are the seams of the cap.', 'Every gap is 4 units, every stroke 14.',
  stP(24, 60) + stH(80, 60) + stE(140, 60));
// 12 Seal
add('c12', 'PHE Seal', 'Seal', 'Initials cut out of a solid disc, like a wax seal on an invitation.', 'Letters always centred, never outlined.',
  `<circle cx="100" cy="100" r="72" fill="${W}"/><circle cx="100" cy="100" r="62" fill="none" stroke="${L}" stroke-width="3"/><path d="M58 122V78H72A11 11 0 0 1 72 100H58M88 78V122M112 78V122M88 100H112M146 80H128V120H146M128 100H142" fill="none" stroke="${P}" stroke-width="7"/>`);
// 13 Curtain call
add('c13', 'Curtain Call', 'Curtain', 'Two curtains part, and the opening between them is a top hat.', 'The hat is always the empty space.',
  `<rect x="24" y="26" width="152" height="12" rx="4" fill="${L}"/><path d="M28 38H80V124H52V142H28Z" fill="${W}"/><path d="M172 38H120V124H148V142H172Z" fill="${W}"/>` +
  [40, 54, 68, 132, 146, 160].map((x) => `<path d="M${x} 42V${x < 100 ? (x > 50 ? 120 : 138) : (x < 150 ? 120 : 138)}" stroke="${P}" stroke-width="2" opacity="0.25"/>`).join('') +
  `<rect x="28" y="150" width="144" height="6" rx="3" fill="${L}"/>`);
// 14 Audience
let dots = '';
for (let y = 48; y <= 150; y += 12) for (let x = 34; x <= 166; x += 12) {
  const inCrown = x >= 70 && x <= 130 && y <= 122, inBrim = y >= 130 && y <= 146 && x >= 40 && x <= 160;
  if (inCrown || inBrim) dots += `<circle cx="${x}" cy="${y}" r="4.2" fill="${inBrim ? L : W}"/>`;
}
add('c14', 'Audience', 'Audience', 'Seats in rows make the hat. The crowd is the brand.', 'Dots on a 12-unit grid, never touching.', dots);
// 15 Ticket
add('c15', 'Ticket', 'Ticket', 'An event ticket with a top hat printed on the admit side.', 'Notches and perforation always present.',
  `<path fill-rule="evenodd" d="M36 60H164A6 6 0 0 1 170 66V90A10 10 0 0 0 170 110V134A6 6 0 0 1 164 140H36A6 6 0 0 1 30 134V110A10 10 0 0 0 30 90V66A6 6 0 0 1 36 60Z" fill="${W}"/><path d="M126 66V134" stroke="${P}" stroke-width="2.5" stroke-dasharray="4 4"/>` +
  topHat(78, 76, 30, 34, 50, P, L, P) + `<rect x="138" y="82" width="20" height="5" rx="2.5" fill="${L}"/><rect x="138" y="96" width="14" height="5" rx="2.5" fill="${L}"/><rect x="138" y="110" width="20" height="5" rx="2.5" fill="${L}"/>`);
// 16 Arena
add('c16', 'Arena', 'Arena', 'Rows of seats around a stage, seen from the side: also a bowler hat.', 'Seat rows dashed, stage solid.',
  `<path d="M74 140A26 26 0 0 1 126 140Z" fill="${W}"/>` + [44, 62, 80].map((r, i) => `<path d="M${100 - r} 140A${r} ${r} 0 0 1 ${100 + r} 140" fill="none" stroke="${i === 1 ? L : W}" stroke-width="8" stroke-dasharray="${i === 0 ? '8 5' : i === 1 ? '9 6' : '10 7'}"/>`).join('') + `<rect x="14" y="146" width="172" height="9" rx="4.5" fill="${L}"/>`);
// 17 Confetti
let conf = '';
const cols = [W, L, M, W, L];
let n = 0;
for (let y = 56; y <= 146; y += 7) for (let x = 36; x <= 164; x += 8) {
  const inCrown = x >= 70 && x <= 130 && y <= 124, inBrim = y >= 132 && y <= 146 && x >= 40 && x <= 160;
  if (!inCrown && !inBrim) continue;
  const jx = x + (rnd() - 0.5) * 5, jy = y + (rnd() - 0.5) * 4, a = Math.floor(rnd() * 180), c = cols[n++ % 5];
  conf += `<rect x="${f(jx - 3.5)}" y="${f(jy - 1.8)}" width="7" height="3.6" rx="1" fill="${c}" transform="rotate(${a} ${f(jx)} ${f(jy)})"/>`;
}
for (let i = 0; i < 9; i++) { const x = 76 + rnd() * 52, y = 22 + rnd() * 26, a = Math.floor(rnd() * 180);
  conf += `<rect x="${f(x - 3.5)}" y="${f(y - 1.8)}" width="7" height="3.6" rx="1" fill="${cols[i % 5]}" transform="rotate(${a} ${f(x)} ${f(y)})"/>`; }
add('c17', 'Confetti', 'Confetti', 'A hat made of confetti, with a few pieces still flying out.', 'Pieces only in the four brand colours.', conf);
// 18 Pin
add('c18', 'Venue Pin', 'Pin', 'A map pin whose hole is a top hat: we find, book and build the venue.', 'The hat sits in the pin’s round head.',
  `<ellipse cx="100" cy="166" rx="22" ry="5" fill="${L}" opacity="0.6"/><path d="M100 162C80 132 54 114 54 84A46 46 0 0 1 146 84C146 114 120 132 100 162Z" fill="${W}"/><rect x="86" y="58" width="28" height="30" rx="2" fill="${P}"/><rect x="76" y="86" width="48" height="8" rx="4" fill="${P}"/>`);
// 19 Seven seats
let seats = `<circle cx="100" cy="100" r="34" fill="${W}"/>`;
for (let k = 0; k < 7; k++) { const a = k * 360 / 7, rad = a * Math.PI / 180, x = 100 + 60 * Math.cos(rad), y = 100 + 60 * Math.sin(rad);
  seats += `<rect x="${f(x - 11)}" y="${f(y - 11)}" width="22" height="22" rx="6" fill="${k === 0 ? L : W}" transform="rotate(${f(a)} ${f(x)} ${f(y)})"/>`; }
add('c19', 'Seven Seats', 'Seats', 'A round table seen from above with seven seats: one per service, Event Management in lavender.', 'Seven seats, equal spacing, lead at the front.', seats);
// 20 Speech
add('c20', 'Speech Hat', 'Speech', 'A speech bubble wearing a top hat: conferences, talks and keynotes.', 'Hat always on the bubble’s top edge.',
  `<path d="M58 74H142A18 18 0 0 1 160 92V126A18 18 0 0 1 142 144H84L62 162V144H58A18 18 0 0 1 40 126V92A18 18 0 0 1 58 74Z" fill="${W}"/>` + topHat(100, 36, 36, 36, 62, L, P) + `<circle cx="78" cy="110" r="6" fill="${P}"/><circle cx="100" cy="110" r="6" fill="${P}"/><circle cx="122" cy="110" r="6" fill="${P}"/>`);
// 21 Hatbox
add('c21', 'Hatbox', 'Hatbox', 'A round hatbox tied with ribbon: every event is a gift being opened.', 'Lid, ribbon and bow, always.',
  `<path d="M44 90V146A56 20 0 0 0 156 146V90Z" fill="#E9E4FF"/><path d="M94 108V165.5H106V108Z" fill="${M}"/><path d="M44 72V90A56 20 0 0 0 156 90V72Z" fill="${L}"/><ellipse cx="100" cy="72" rx="56" ry="20" fill="${W}"/><path d="M94 90.5V108L106 108V90.5Z" fill="${M}"/>` +
  `<ellipse cx="88" cy="62" rx="14" ry="7" fill="none" stroke="${M}" stroke-width="5" transform="rotate(-20 88 62)"/><ellipse cx="112" cy="62" rx="14" ry="7" fill="none" stroke="${M}" stroke-width="5" transform="rotate(20 112 62)"/><circle cx="100" cy="66" r="5" fill="${M}"/>`);
// 22 Party hat
add('c22', 'Party Hat', 'Party', 'The party hat: pure celebration, for launches and private events.', 'Stripes run one way, pom-pom on top.',
  `<defs><clipPath id="c22c"><path d="M100 44L142 154H58Z"/></clipPath></defs><path d="M100 44L142 154H58Z" fill="${W}"/><g clip-path="url(#c22c)">` + [0, 1, 2, 3, 4, 5].map((i) => `<rect x="20" y="${60 + i * 22}" width="160" height="9" fill="${L}" transform="rotate(-24 100 100)"/>`).join('') + `</g><circle cx="100" cy="40" r="11" fill="${L}"/><rect x="52" y="150" width="96" height="10" rx="5" fill="${M}"/><circle cx="46" cy="70" r="4" fill="${L}"/><circle cx="154" cy="84" r="3.5" fill="${W}"/><rect x="146" y="48" width="8" height="4" rx="1" fill="${L}" transform="rotate(30 150 50)"/>`);
// 23 Pixel hat
const grid = ['....XXXX....', '...XXXXXX...', '...XXXXXX...', '...XXXXXX...', '...XXXXXX...', '...LLLLLL...', '...XXXXXX...', 'XXXXXXXXXXXX', '.XXXXXXXXXX.'];
let pix = '';
grid.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') pix += `<rect x="${28 + c * 12}" y="${46 + r * 12}" width="11" height="11" rx="1.5" fill="${ch === 'L' ? L : W}"/>`; }));
add('c23', 'Pixel Hat', 'Pixel', 'An 8-bit top hat on a pixel grid: our websites, apps and software.', 'Square pixels, one-unit gutters.', pix);
// 24 Saturn
add('c24', 'Saturn', 'Saturn', 'The brim becomes a ring around the crown: every event is its own world.', 'Ring tilted 12°, passing in front.',
  `<path d="M38 118A62 16 0 0 1 162 118" fill="none" stroke="${L}" stroke-width="8" transform="rotate(-12 100 118)"/><path d="M74 128V60Q74 52 82 52H118Q126 52 126 60V128Z" fill="${W}"/><path d="M38 118A62 16 0 0 0 162 118" fill="none" stroke="${L}" stroke-width="8" transform="rotate(-12 100 118)"/>`);
// 25 Awards
add('c25', 'Awards', 'Awards', 'Three top hats on a winners\u2019 podium: awards nights, and being first choice.', 'The winner always stands in the middle.',
  `<rect x="28" y="118" width="46" height="40" rx="3" fill="${L}"/><rect x="77" y="98" width="46" height="60" rx="3" fill="${W}"/><rect x="126" y="130" width="46" height="28" rx="3" fill="${L}"/>` +
  topHat(51, 86, 24, 30, 36) + topHat(100, 58, 28, 38, 42, L, P, L) + topHat(149, 98, 24, 30, 36));
// 26 Rabbit
add('c26', 'Rabbit', 'Rabbit', 'Two ears rise from the hat: we pull off the surprise.', 'Ears in lavender, hat in white.',
  `<ellipse cx="88" cy="58" rx="9" ry="26" fill="${L}" transform="rotate(-12 88 58)"/><ellipse cx="112" cy="58" rx="9" ry="26" fill="${L}" transform="rotate(12 112 58)"/>` + topHat(100, 78, 64, 72, 112, W, M));
// 27 Host
add('c27', 'The Host', 'Host', 'A figure in a top hat and bow tie: the host who welcomes every guest.', 'Head, hat and shoulders only.',
  `<path d="M54 166A46 40 0 0 1 146 166Z" fill="${W}"/><circle cx="100" cy="98" r="22" fill="${W}"/><path d="M90 126L100 131L90 136ZM110 126L100 131L110 136Z" fill="${P}"/><rect x="84" y="44" width="32" height="30" rx="3" fill="${L}"/><rect x="74" y="72" width="52" height="7" rx="3.5" fill="${L}"/>`);
// 28 Sound wave
let bars = '';
const hs = [16, 16, 84, 92, 88, 96, 86, 16, 16];
hs.forEach((h, i) => { const x = 36 + i * 14.5; bars += `<rect x="${f(x)}" y="${150 - h}" width="10" height="${h}" rx="5" fill="${h < 20 ? L : W}"/>`; });
add('c28', 'Sound Wave', 'Wave', 'Audio bars that rise into a hat: music, applause and live experiences.', 'Bars bottom-aligned, rounded ends.', bars);
// 29 Badge
add('c29', 'Lanyard Badge', 'Badge', 'A conference badge with a hat on it: PCO, delegates and registration.', 'Lanyard always visible above.',
  `<path d="M84 58L68 22M116 58L132 22" stroke="${L}" stroke-width="8" stroke-linecap="round"/><rect x="58" y="54" width="84" height="110" rx="12" fill="${W}"/><rect x="88" y="62" width="24" height="7" rx="3.5" fill="${P}"/>` + topHat(100, 84, 26, 30, 44, P, null, P) + `<rect x="72" y="132" width="56" height="7" rx="3.5" fill="${L}"/><rect x="82" y="146" width="36" height="6" rx="3" fill="${L}"/>`);
// 30 Door
add('c30', 'Welcome Door', 'Door', 'An arched doorway on a step is also a bowler hat: come in.', 'Arch, two doors, one wide step.',
  `<path d="M64 148V96A36 36 0 0 1 136 96V148Z" fill="${W}"/><path d="M100 60V148" stroke="${P}" stroke-width="3"/><circle cx="92" cy="114" r="3.5" fill="${P}"/><circle cx="108" cy="114" r="3.5" fill="${P}"/><rect x="34" y="146" width="132" height="12" rx="6" fill="${L}"/>`);

const svg = (c, size) => `<svg aria-label="${c.name}" viewBox="0 0 200 200" width="200" height="200" style="width:${size}px;height:${size}px">${c.body.replace(/id="(g01|c22c)"/g, (m, g) => `id="${g}${size}"`).replace(/url\(#(g01|c22c)\)/g, (m, g) => `url(#${g}${size})`)}</svg>`;
fs.writeFileSync('concepts.json', JSON.stringify(C.map((c) => ({ ...c, s180: svg(c, 180), s120: svg(c, 120) })), null, 1));
fs.writeFileSync('concepts-preview.html', `<body style="margin:0;background:#efedf3;display:grid;grid-template-columns:repeat(6,200px);gap:10px;padding:10px;font:12px sans-serif">` + C.map((c) => `<div style="background:${P};height:220px;color:#fff;padding:4px">${c.id} ${c.name}<br>${svg(c, 180)}</div>`).join('') + '</body>');
console.log(C.length, 'concepts; sizes:', C.map((c) => c.body.length).join(','));
