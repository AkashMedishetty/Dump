// Refreshes code/ from the geometry:  node build/build_code.mjs
//  - injects logo.json / wordmark.json / build/layouts.json into the data block of code/phe-logo.js
//  - writes code/phe-logo.global.js (same code as a classic <script>: window.PheLogo)
//  - writes the generated keyframes + timings inside code/phe-logo.css (sampled from PRESETS['draw-drop'])
//  - writes code/phe-logo-animated.svg (standalone, CSS-animated, works as <img>)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const G = rd('logo.json'), WM = rd('wordmark.json'), LAY = rd('build/layouts.json'), BR = rd('build/brand.json');

const data = {
  GEOMETRY: {
    width: G.width, height: G.height, w: G.w, rd: G.rd, gap: G.gap, clear: LAY.X,
    strokes: G.strokes.map((s) => ({ id: s.id, d: s.d, len: s.len })),
    dots: G.dots.map((d) => ({ id: d.id, x: d.x, y: d.y, r: G.rd })),
  },
  WORDMARK: { font: WM.font, cap: WM.cap, texts: Object.fromEntries(Object.entries(WM.texts).map(([k, v]) => [k, { d: v.d, ink: v.ink }])) },
  LOCKUPS: LAY.lockups,
  ICON: { icon: LAY.icon.vb, favicon: LAY.favicon.vb },
  COLORS: BR.colors,
};
const block = '// <generated:data>\n' + Object.entries(data).map(([k, v]) => `export const ${k} = ${JSON.stringify(v)};`).join('\n') + '\n// </generated:data>';
const srcPath = path.join(ROOT, 'code/phe-logo.js');
let src = fs.readFileSync(srcPath, 'utf8');
src = src.replace(/\/\/ <generated:data>[\s\S]*?\/\/ <\/generated:data>/, block);
fs.writeFileSync(srcPath, src);

// classic-script build (works from file://, TouchDesigner web render, CodePen ...)
const body = src
  .replace(/^export default (\{[\s\S]*?\});\s*$/m, 'return $1;')
  .replace(/^export (const|function|let) /gm, '$1 ');
fs.writeFileSync(path.join(ROOT, 'code/phe-logo.global.js'),
  `/*! PurpleHat Events — PhE logo (classic script build of phe-logo.js, generated). Usage: <script src="phe-logo.global.js"></script> -> window.PheLogo */\n` +
  `(function (root) {\n  root.PheLogo = (function () {\n${body}\n  })();\n})(typeof globalThis !== 'undefined' ? globalThis : window);\n`);

// ---- CSS keyframes, sampled from the JS choreography so CSS == JS
const M = await import(pathToFileURL(srcPath).href + '?v=' + Date.now());
const A = M.PRESETS['draw-drop'];
const H = 340, tf = Math.sqrt((2 * H) / 4200), contacts = M.bounceContacts(), tEnd = contacts[contacts.length - 1].t + 0.6;
const D = tf + tEnd, N = 48, f = (v, k = 3) => +v.toFixed(k);
let kf = '@keyframes phe-drop {\n';
for (let i = 0; i <= N; i++) {
  const u = i / N, q = M.drop(u * D - tf, { H });
  kf += `  ${f(u * 100, 2)}% { transform: translateY(${f(q.y, 2)}px) scale(${f(q.sx)}, ${f(q.sy)}); opacity: ${f(q.o, 2)}; }\n`;
}
kf += '}\n';
const bez = '.65, 0, .35, 1'; // easeInOutCubic
let rules = '';
for (const [id, [a, b]] of Object.entries(A.strokes)) rules += `.phe-css .phe-${id} { animation: phe-draw ${f(b - a, 2)}s cubic-bezier(${bez}) calc(var(--phe-delay) + ${f(a, 2)}s) both; }\n`;
M.DOT_IDS.forEach((id, i) => {
  rules += `.phe-css .phe-dot-${id} { animation: phe-drop ${f(D, 3)}s linear calc(var(--phe-delay) + ${f(A.beats[i] - tf, 3)}s) both; }\n`;
  rules += `.phe-css.phe-idle .phe-dot-${id} { animation: phe-drop ${f(D, 3)}s linear calc(var(--phe-delay) + ${f(A.beats[i] - tf, 3)}s) both, phe-breathe 4s ease-in-out calc(var(--phe-delay) + ${f(A.duration + i * 0.667, 3)}s) infinite; }\n`;
});
rules += `.phe-css .phe-wordmark { animation: phe-rise ${f(A.word[1] - A.word[0], 2)}s cubic-bezier(.33, 1, .68, 1) calc(var(--phe-delay) + ${A.word[0]}s) both; }\n`;
const gen = `/* <generated:keyframes> (build/build_code.mjs — sampled from PRESETS['draw-drop']) */\n${kf}${rules}/* </generated:keyframes> */`;
const cssPath = path.join(ROOT, 'code/phe-logo.css');
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/\/\* <generated:keyframes>[\s\S]*?<\/generated:keyframes> \*\//, gen);
fs.writeFileSync(cssPath, css);

// ---- standalone animated SVG (plays when used as <img>, loops via the idle breathe)
const svg = M.svgString({ css: true, variant: 'twotone', className: 'phe-idle', title: 'PurpleHat Events (animated)' });
const inner = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n{2,}/g, '\n');
fs.writeFileSync(path.join(ROOT, 'code/phe-logo-animated.svg'),
  svg.replace('<title>', `<style>${inner}</style><title>`).replace('<svg ', `<svg width="${G.width}" height="${G.height}" `) + '\n');
console.log('code/: phe-logo.js data refreshed, phe-logo.global.js, phe-logo.css keyframes, phe-logo-animated.svg');
