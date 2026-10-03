#!/usr/bin/env node
// Idea Library builder — zero dependencies.
// Reads entries/*.md, validates them against vocab.json, and writes:
//   library.json  machine-readable index (scripts, Claude, other tools)
//   INDEX.md      human/grep-readable catalogue grouped by category
//   index.html    offline search UI (open by double-clicking, no server needed)
//   artifact.html same UI prepared for publishing as a claude.ai Artifact (thumbs only)
//
// Usage:  node build.mjs            build everything
//         node build.mjs --check    validate only, write nothing
//         node build.mjs --new <id> scaffold entries/<id>.md from _template.md

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ENTRIES = path.join(ROOT, 'entries');
const VOCAB = JSON.parse(fs.readFileSync(path.join(ROOT, 'vocab.json'), 'utf8'));
const ARRAY_KEYS = new Set(['category', 'tags', 'stack', 'runs_in', 'fit', 'related', 'aliases']);
const REQUIRED = ['id', 'title', 'kind', 'category', 'hook', 'added'];
const args = process.argv.slice(2);

if (args[0] === '--new') {
  const id = args[1];
  if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) die('Usage: node build.mjs --new <kebab-case-id>');
  const dest = path.join(ENTRIES, `${id}.md`);
  if (fs.existsSync(dest)) die(`entries/${id}.md already exists`);
  const today = new Date().toISOString().slice(0, 10);
  const tpl = fs.readFileSync(path.join(ROOT, '_template.md'), 'utf8')
    .replace(/^id:.*$/m, `id: ${id}`)
    .replace(/^added:.*$/m, `added: ${today}`);
  fs.writeFileSync(dest, tpl);
  console.log(`Created entries/${id}.md`);
  process.exit(0);
}

// ---------- parse ----------
function parseEntry(file) {
  const raw = fs.readFileSync(path.join(ENTRIES, file), 'utf8').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error('missing --- frontmatter --- block');
  const meta = {};
  for (const line of m[1].split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) throw new Error(`cannot parse frontmatter line: "${line}"`);
    const [, key, val] = kv;
    if (ARRAY_KEYS.has(key)) {
      const inner = val.trim().replace(/^\[|\]$/g, '');
      meta[key] = inner ? inner.split(',').map(unquote).filter(Boolean) : [];
    } else {
      meta[key] = unquote(val);
    }
  }
  for (const k of ARRAY_KEYS) meta[k] ??= [];
  const body = m[2].trim();
  const sections = {};
  let current = '_intro';
  for (const line of body.split('\n')) {
    const h = line.match(/^##\s+(.*)$/);
    if (h) { current = h[1].trim(); sections[current] = ''; continue; }
    sections[current] = (sections[current] ?? '') + line + '\n';
  }
  for (const k of Object.keys(sections)) {
    sections[k] = sections[k].trim();
    if (!sections[k]) delete sections[k];
  }
  const links = [...new Set(body.match(/https?:\/\/[^\s)>\]]+/g) ?? [])];
  return { ...meta, file: `entries/${file}`, body, sections, links };
}

function unquote(s) {
  s = s.trim();
  return /^(['"]).*\1$/.test(s) ? s.slice(1, -1) : s;
}

// ---------- validate ----------
const files = fs.readdirSync(ENTRIES).filter(f => f.endsWith('.md')).sort();
const errors = [];
const warnings = [];
const entries = [];
for (const f of files) {
  try { entries.push(parseEntry(f)); } catch (e) { errors.push(`${f}: ${e.message}`); }
}
const ids = new Set();
const urls = new Map();
for (const e of entries) {
  const where = e.file;
  for (const k of REQUIRED) if (!e[k] || (Array.isArray(e[k]) && !e[k].length)) errors.push(`${where}: missing "${k}"`);
  if (e.id && `entries/${e.id}.md` !== where) errors.push(`${where}: id "${e.id}" must match the filename`);
  if (ids.has(e.id)) errors.push(`${where}: duplicate id "${e.id}"`);
  ids.add(e.id);
  if (e.kind && !VOCAB.kinds[e.kind]) errors.push(`${where}: unknown kind "${e.kind}" (see vocab.json)`);
  if (e.status && !VOCAB.statuses[e.status]) errors.push(`${where}: unknown status "${e.status}"`);
  for (const c of e.category) if (!VOCAB.categories[c]) errors.push(`${where}: unknown category "${c}" (add it to vocab.json first)`);
  for (const c of e.fit) if (!VOCAB.fit[c]) warnings.push(`${where}: fit "${c}" not in vocab.json`);
  for (const c of e.runs_in) if (!VOCAB.runs_in.includes(c)) warnings.push(`${where}: runs_in "${c}" not in vocab.json`);
  if (e.added && !/^\d{4}-\d{2}-\d{2}$/.test(e.added)) errors.push(`${where}: added must be YYYY-MM-DD`);
  // Full screenshots are kept out of the public repo (gitignored), so only warn when no picture at all is available.
  const pics = ['thumb', 'image'].filter(k => e[k]);
  if (pics.length && !pics.some(k => fs.existsSync(path.join(ROOT, e[k])))) warnings.push(`${where}: ${pics.map(k => e[k]).join(' / ')} not found`);
  if (e.url) {
    const key = e.url.toLowerCase().replace(/\/+$/, '');
    if (urls.has(key)) warnings.push(`${where}: same url as ${urls.get(key)} — duplicate idea?`);
    urls.set(key, where);
  }
}
for (const e of entries) for (const r of e.related) if (!ids.has(r)) warnings.push(`${e.file}: related "${r}" does not exist`);

warnings.forEach(w => console.warn(`warn  ${w}`));
if (errors.length) {
  errors.forEach(e => console.error(`ERROR ${e}`));
  die(`\n${errors.length} error(s) — nothing written.`);
}

entries.sort((a, b) => b.added.localeCompare(a.added) || a.title.localeCompare(b.title));
// Back-links: if A lists B as related, B shows A too.
const byId = Object.fromEntries(entries.map(e => [e.id, e]));
for (const e of entries) for (const r of e.related) if (byId[r] && !byId[r].related.includes(e.id)) byId[r].related.push(e.id);

if (args.includes('--check')) {
  console.log(`OK — ${entries.length} entries valid.`);
  process.exit(0);
}

// ---------- library.json ----------
const tagCounts = {};
for (const e of entries) for (const t of e.tags) tagCounts[t] = (tagCounts[t] ?? 0) + 1;
const library = {
  generated: new Date().toISOString(),
  count: entries.length,
  vocab: VOCAB,
  tags: Object.fromEntries(Object.entries(tagCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
  entries,
};
fs.writeFileSync(path.join(ROOT, 'library.json'), JSON.stringify(library, null, 2) + '\n');

// ---------- INDEX.md ----------
const cell = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
let md = `# Idea Library — Index\n\n_Generated by \`node build.mjs\` — do not edit by hand. ${entries.length} entries._\n\n`;
md += `Open [index.html](index.html) for search & filters. Add ideas: see [README.md](README.md).\n\n`;
md += `## Categories\n\n`;
for (const [c, desc] of Object.entries(VOCAB.categories)) {
  const n = entries.filter(e => e.category.includes(c)).length;
  if (n) md += `- [${c}](#${c}) (${n}) — ${desc.split(' — ')[1] ?? desc}\n`;
}
for (const [c, desc] of Object.entries(VOCAB.categories)) {
  const list = entries.filter(e => e.category[0] === c);
  if (!list.length) continue;
  md += `\n## ${c}\n\n_${desc}_\n\n| Idea | Hook | Kind | License | Stack | Tags |\n|---|---|---|---|---|---|\n`;
  for (const e of list) {
    md += `| [${cell(e.title)}](${e.file}) | ${cell(e.hook)} | ${e.kind} | ${cell(e.license)} | ${cell(e.stack.join(', '))} | ${cell(e.tags.join(', '))} |\n`;
  }
}
md += `\n## Tag index\n\n`;
for (const t of Object.keys(library.tags).sort()) {
  md += `- **${t}**: ${entries.filter(e => e.tags.includes(t)).map(e => `[${e.id}](${e.file})`).join(', ')}\n`;
}
md += `\n## Fits our projects\n\n`;
for (const f of Object.keys(VOCAB.fit)) {
  const list = entries.filter(e => e.fit.includes(f));
  if (list.length) md += `- **${f}**: ${list.map(e => `[${e.id}](${e.file})`).join(', ')}\n`;
}
fs.writeFileSync(path.join(ROOT, 'INDEX.md'), md);

// ---------- index.html ----------
const tpl = fs.readFileSync(path.join(ROOT, 'viewer.template.html'), 'utf8');
const json = JSON.stringify(library).replace(/</g, '\\u003c');
fs.writeFileSync(path.join(ROOT, 'index.html'), tpl.replace('/*__LIBRARY__*/null', json));

// ---------- artifact.html (publishable copy) ----------
// Same viewer, minus the document skeleton (the host adds its own), local-only controls,
// and full phone screenshots (they show third-party comment names) wherever a cropped thumb exists.
const pub = { ...library, entries: entries.map(e => ({ ...e, image: e.thumb ? '' : e.image })) };
const artifact = tpl
  .replace(/<!doctype html>\s*<html[^>]*>\s*<head>\s*(<meta[^>]*>\s*)*/i, '')
  .replace(/<\/head>\s*<body>/i, '')
  .replace(/<\/body>\s*<\/html>\s*$/i, '')
  .replace("/*__MODE__*/'local'", "'artifact'")
  .replace('/*__LIBRARY__*/null', JSON.stringify(pub).replace(/</g, '\\u003c'));
fs.writeFileSync(path.join(ROOT, 'artifact.html'), artifact);

console.log(`Built ${entries.length} entries → library.json, INDEX.md, index.html, artifact.html`);
if (warnings.length) console.log(`${warnings.length} warning(s) above.`);

function die(msg) { console.error(msg); process.exit(1); }
