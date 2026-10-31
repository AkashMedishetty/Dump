// Renders every animation frame by frame (window.render(t)) and encodes it.
//   node build/build_video.mjs [steps...] [--only=draw-drop,dot-run] [--formats=16x9,1x1] [--bgs=light]
//   steps: cues audio video alpha strips   (default: all)
// Outputs: animation/audio/*.{cues.json,wav,m4a}  animation/video/*.mp4  animation/alpha/*.{mov,webm}  animation/strips/*.png
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launch, fileUrl } from './browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = path.join(ROOT, 'animation');
const PY = process.env.PY || '/home/user/lemomo-ai/lemo-opuscar/.venv/bin/python';
const args = process.argv.slice(2), opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1]?.split(',');
const steps = args.filter((a) => !a.startsWith('--')); const want = (s) => !steps.length || steps.includes(s);
const SCENES = [
  { id: 'draw-drop', key: 'A' }, { id: 'dot-run', key: 'B' }, { id: 'people-places', key: 'C' }, { id: 'idle', key: 'idle', silent: true },
].filter((s) => !opt('only') || opt('only').includes(s.id));
const FORMATS = Object.entries({ '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080] }).filter(([k]) => !opt('formats') || opt('formats').includes(k));
const BGS = ['light', 'dark'].filter((b) => !opt('bgs') || opt('bgs').includes(b));
const FPS = 30;
for (const d of ['audio', 'video', 'alpha', 'strips']) fs.mkdirSync(path.join(A, d), { recursive: true });
const name = (s, fmt, bg) => `phe-${s.key}-${s.id}_${fmt}_${bg}`.replace('phe-idle-idle', 'phe-idle');

const browser = await launch();
async function openScene(s, w, h, bg) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(fileUrl(path.join(A, s.id + '.html')) + `?w=${w}&h=${h}&bg=${bg}&capture`);
  if (errs.length) throw new Error(`${s.id}: ${errs.join('; ')}`);
  return p;
}
const meta = {};
for (const s of SCENES) {
  const p = await openScene(s, 320, 180, 'light');
  meta[s.id] = await p.evaluate(() => ({ duration: window.DURATION, cues: window.CUES }));
  await p.close();
}

if (want('cues')) for (const s of SCENES) if (!s.silent)
  fs.writeFileSync(path.join(A, 'audio', s.id + '.cues.json'), JSON.stringify({ scene: s.id, ...meta[s.id] }, null, 1));
if (want('audio')) {
  const files = SCENES.filter((s) => !s.silent).map((s) => path.join(A, 'audio', s.id + '.cues.json'));
  const r = spawnSync(PY, [path.join(ROOT, 'build/audio.py'), ...files], { stdio: 'inherit' });
  if (r.status) throw new Error('audio failed');
}

function ffmpeg(argv) {
  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...argv], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c ? rej(new Error('ffmpeg ' + c)) : res())));
  return { ff, done };
}
const write = (ff, buf) => new Promise((res) => (ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res)));
async function capture(s, w, h, bg, sinks) {
  const p = await openScene(s, w, h, bg), n = Math.round(meta[s.id].duration * FPS), transparent = bg.startsWith('transparent');
  for (let f = 0; f < n; f++) {
    await p.evaluate((t) => window.render(t), f / FPS);
    const png = await p.screenshot({ type: 'png', omitBackground: transparent });
    for (const k of sinks) await write(k.ff, png);
  }
  for (const k of sinks) k.ff.stdin.end();
  await Promise.all(sinks.map((k) => k.done)); await p.close();
}
const IN = ['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-'];
// RGB frames -> BT.709 limited-range YUV (ffmpeg would otherwise use BT.601 and players shift the brand purple)
const CSC = (fmt) => `scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=${fmt}`;
const TAGS = ['-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv'];
const audioIn = (s) => (s.silent ? [] : ['-i', path.join(A, 'audio', s.id + '.wav')]);

async function pool(jobs, n = 3) { const q = jobs.slice(); await Promise.all(Array.from({ length: n }, async () => { while (q.length) await q.shift()(); })); }

if (want('video')) {
  const jobs = [];
  for (const s of SCENES) for (const [fmt, [w, h]] of FORMATS) for (const bg of BGS) jobs.push(async () => {
    const out = path.join(A, 'video', name(s, fmt, bg) + '.mp4'), t0 = Date.now();
    const enc = ffmpeg([...IN, ...audioIn(s), '-vf', CSC('yuv420p'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
      ...TAGS, '-r', String(FPS),
      ...(s.silent ? [] : ['-c:a', 'aac', '-b:a', '192k', '-shortest']), '-movflags', '+faststart', out]);
    await capture(s, w, h, bg, [enc]);
    console.log(`  video ${path.basename(out)}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  });
  await pool(jobs);
}

if (want('alpha')) {
  const s = SCENES.find((x) => x.id === 'draw-drop');
  if (s) for (const bg of ['transparent', 'transparent-light']) {
    const tag = bg === 'transparent' ? 'primary-ink' : 'light-ink', base = path.join(A, 'alpha', `phe-A-draw-drop_16x9_alpha_${tag}`);
    const mov = ffmpeg([...IN, ...audioIn(s), '-vf', CSC('yuva444p10le'), ...TAGS, '-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0',
      '-alpha_bits', '16', '-c:a', 'pcm_s24le', '-shortest', base + '.mov']);
    const webm = ffmpeg([...IN, ...audioIn(s), '-vf', CSC('yuva420p'), ...TAGS, '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '22', '-row-mt', '1',
      '-auto-alt-ref', '0', '-c:a', 'libopus', '-b:a', '160k', '-shortest', base + '.webm']);
    await capture(s, 1920, 1080, bg, [mov, webm]);
    console.log('  alpha', path.basename(base) + '.{mov,webm}');
  }
}

if (want('strips')) {
  const tmp = fs.mkdtempSync(path.join(A, 'strips', '.tmp-'));
  for (const s of SCENES) {
    const d = meta[s.id].duration, ts = Array.from({ length: 8 }, (_, i) => +((d * (i + 0.5)) / 8).toFixed(2));
    if (!s.silent) ts[7] = d;
    const p = await openScene(s, 640, 360, 'light'), items = [];
    for (const t of ts) {
      await p.evaluate((t) => window.render(t), t);
      const f = path.join(tmp, `${s.id}-${t}.png`); await p.screenshot({ path: f }); items.push(`${t.toFixed(2)}s=${f}`);
    }
    await p.close();
    spawnSync(PY, [path.join(ROOT, 'build/montage.py'), path.join(A, 'strips', `${name(s, 'strip', 'light').replace('_strip_light', '')}-strip.png`), '4', ...items], { stdio: 'inherit' });
  }
  fs.rmSync(tmp, { recursive: true });
  console.log('  strips done');
}
await browser.close();
