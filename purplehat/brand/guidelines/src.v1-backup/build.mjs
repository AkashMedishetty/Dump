import fs from 'fs'; import path from 'path';
import { ROOT, write } from './lib.mjs';
import { buildDeliverables, JOBS } from './deliverables.mjs';
const only = process.argv[2] || 'all';
if (only === 'all' || only === 'deliv') buildDeliverables();
if (only === 'all' || only === 'guide') { const { buildGuide } = await import('./guide.mjs'); buildGuide(JOBS); }
if (only === 'all' || only === 'index') { const { buildIndex } = await import('./index.mjs'); buildIndex(JOBS); }
fs.mkdirSync(path.join(ROOT, 'src'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'src/jobs.json'), JSON.stringify(JOBS, null, 1));
console.log('pdf jobs', JOBS.pdf.length, 'png jobs', JOBS.png.length);
