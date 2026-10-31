import fs from 'fs';
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
// node render.mjs <out> <a-b | t1,t2 (seconds, with s suffix) | f1,f2> [sub]
const [out = 'frames', spec = '', subArg] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', (e) => console.error('PAGE', e.message)); p.on('console', (m) => m.type() === 'error' && console.error('CONSOLE', m.text()));
await p.goto('file://' + process.cwd() + '/reel.html'); await p.evaluate(() => window.READY);
const total = await p.evaluate(() => window.TOTAL);
let list;
if (spec.includes('-')) { const [a, c] = spec.split('-').map(Number); list = Array.from({ length: c - a + 1 }, (_, i) => a + i); }
else if (spec.endsWith('s')) list = spec.slice(0, -1).split(',').map((s) => Math.round(Number(s) * 60));
else if (spec) list = spec.split(',').map(Number); else list = [...Array(total).keys()];
const sub = subArg ? Number(subArg) : undefined;
for (const f of list) {
  const url = await p.evaluate(([f, sub]) => window.frame(f, sub), [f, sub]);
  fs.writeFileSync(`${out}/${String(f).padStart(5, '0')}.png`, Buffer.from(url.split(',')[1], 'base64'));
}
await b.close(); console.log(out, list.length);
