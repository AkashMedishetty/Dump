import fs from 'fs';
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const opentype = require('../deck-gen/node_modules/opentype.js');
const F = (n) => opentype.loadSync('../deck-gen/fonts/' + n + '.woff');
function glyphs(font, str, size, track) {
  const gs = font.stringToGlyphs(str); let x = 0; const out = [];
  gs.forEach((g, i) => {
    const p = g.getPath(0, 0, size); out.push({ d: p.toPathData(2), x, w: g.advanceWidth * size / font.unitsPerEm });
    let adv = g.advanceWidth * size / font.unitsPerEm; if (i < gs.length - 1) adv += font.getKerningValue(g, gs[i + 1]) * size / font.unitsPerEm;
    x += adv + (i < gs.length - 1 ? track * size : 0);
  });
  const bb = font.getPath(str, 0, 0, size).getBoundingBox();
  return { glyphs: out, width: x, capTop: bb.y1 };
}
const name = glyphs(F('Manrope-700'), 'PurpleHat', 168, -0.03);
const ev = glyphs(F('Manrope-500'), 'EVENTS', 38, 0.5);
fs.writeFileSync('glyphs.json', JSON.stringify({ name, ev }));
console.log(name.width, name.capTop, ev.width);
