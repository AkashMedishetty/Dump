import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage();
console.log(await p.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); if (!g) return 'no webgl2'; return [g.getParameter(g.VERSION), !!g.getExtension('EXT_color_buffer_float'), g.getParameter(g.MAX_TEXTURE_SIZE)].join(' | '); }));
await b.close();
