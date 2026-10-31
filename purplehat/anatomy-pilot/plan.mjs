// timeline plan: offsets of each clip in the xfade chain
import { readFileSync, writeFileSync } from "node:fs";
const S = JSON.parse(readFileSync("segments.json", "utf8")), X = 0.5, STING_FROM = 1.0, STING_LEN = 6.0 - STING_FROM;
let off = 0; const clips = [{ name: "intro", len: S.intro }];
S.order.forEach((id, i) => clips.push({ name: id, len: S.lens[i] })); clips.push({ name: "sting", len: STING_LEN });
clips.forEach((c, i) => { c.off = i === 0 ? 0 : clips[i - 1].off + clips[i - 1].len - X; });
const total = clips[clips.length - 1].off + clips[clips.length - 1].len;
const segs = S.order.map((id, i) => { const p = JSON.parse(readFileSync(`parts-${id}.json`, "utf8")); const c = clips[i + 1]; return { i, id, off: c.off, len: c.len, cues: p.cues, sfx: p.sfx || [] }; });
writeFileSync("plan.json", JSON.stringify({ clips, segs, total, x: X, intro: S.intro, lead: S.lead, start: S.start, stingOff: clips[clips.length - 1].off, stingFrom: STING_FROM }));
console.log("total", total.toFixed(2), clips.map((c) => c.name + "@" + c.off.toFixed(2)).join(" "));
