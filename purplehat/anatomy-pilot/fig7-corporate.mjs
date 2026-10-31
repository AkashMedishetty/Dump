// Fig 7 · Corporate events — "The vote". Roll call on 24 delegate mics, then a live keypad vote carried by simple majority.
import { k, P, at, S, L, D, depth, byDepth, halo, slab, cyl, seg, top, faceY, plinth, writeFigure } from "./common.mjs";
const HERE = new URL(".", import.meta.url).pathname;

const MODEL = { seats: 24, quorum: 13, yes: 16, no: 6, abstain: 2 };
const T_ROLL = 0.8, ROLL = 2.4, T_VOTE = T_ROLL + ROLL + 0.5, VOTE = 4.2, T_RESULT = T_VOTE + VOTE + 0.4;
const CUES = [{ at: T_ROLL, q: "Q1", what: "roll call" }, { at: T_VOTE, q: "Q2", what: "vote open" }, { at: T_RESULT, q: "Q3", what: "result" }];
const END = T_RESULT + 2.4;

const TABLE = { x: -52, y: -26, w: 104, d: 24, r: 11 }, TZ = 7.4;
// seats: 11 along each long side, one at each end
const seatsArr = [];
for (let i = 0; i < 11; i++) { const x = -42 + i * 8.4; seatsArr.push({ x, y: TABLE.y - 5, side: "n" }); seatsArr.push({ x, y: TABLE.y + TABLE.d + 5, side: "s" }); }
seatsArr.push({ x: TABLE.x - 5, y: TABLE.y + TABLE.d / 2, side: "w" }, { x: TABLE.x + TABLE.w + 5, y: TABLE.y + TABLE.d / 2, side: "e" });
// who votes what, and when (seeded)
const rnd = ((a) => () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; })(11);
const ballots = seatsArr.map((_, i) => i).sort(() => rnd() - 0.5);
const votes = new Array(MODEL.seats);
ballots.forEach((s, n) => (votes[s] = { v: n < MODEL.yes ? 0 : n < MODEL.yes + MODEL.no ? 1 : 2, t: T_VOTE + 0.3 + rnd() * (VOTE - 0.6) }));
const rollOrder = seatsArr.map((s, i) => ({ i, a: Math.atan2(s.y - (TABLE.y + TABLE.d / 2), s.x) })).sort((a, b) => a.a - b.a).map((o, n) => ({ i: o.i, t: T_ROLL + (n / MODEL.seats) * ROLL }));
const rollT = []; rollOrder.forEach((r) => (rollT[r.i] = r.t));

function chair(s) {
  const out = [], [cx, cy] = [s.x, s.y];
  out.push(cyl(cx, cy, 2.2, 0, 0.5, { tone: "lo" }, 14), cyl(cx, cy, 0.5, 0.5, 3.4, { tone: "mid", crease: "none" }, 10));
  out.push(slab({ x: cx - 2.4, y: cy - 2.4, w: 4.8, d: 4.8, r: 1 }, 3.9, 1.2, { tone: "mid" }, 3, 0.3));
  const back = s.side === "n" ? { x: cx - 2.4, y: cy - 2.4, w: 4.8, d: 1, r: 0.4 } : s.side === "s" ? { x: cx - 2.4, y: cy + 1.4, w: 4.8, d: 1, r: 0.4 } : s.side === "w" ? { x: cx - 2.4, y: cy - 2.4, w: 1, d: 4.8, r: 0.4 } : { x: cx + 1.4, y: cy - 2.4, w: 1, d: 4.8, r: 0.4 };
  out.push(slab(back, 5.1, 6, { tone: "mid" }, 2, 0.3));
  return out.join("");
}

function tableAndKit() {
  const out = [halo(TABLE, 0, TZ, 4)];
  for (const x of [-30, 0, 30]) out.push(slab({ x: x - 3, y: TABLE.y + 8, w: 6, d: 8, r: 0.6 }, 0, TZ - 1, { tone: "lo" }));
  out.push(S(k.slabOf(TABLE, TZ - 1, 1, P, 10, 0.6), { tone: "hi", inner: L(k.sideSeam(TABLE, TZ - 0.5, P, 10), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(TABLE, 6), TZ, P, 10), { tone: "faint" }));
  // per seat: a gooseneck mic with a ring light, and a keypad
  seatsArr.forEach((s, i) => {
    const toward = s.side === "n" ? [0, 4] : s.side === "s" ? [0, -4] : s.side === "w" ? [4, 0] : [-4, 0];
    const bx = s.x + toward[0] * 1.6, by = s.y + toward[1] * 1.6;
    out.push(slab({ x: bx - 1.4, y: by - 1, w: 2.8, d: 2, r: 0.4 }, TZ, 0.5, { tone: "mid" }, 2, 0.2));
    out.push(L(seg([bx, by, TZ + 0.5], [bx - toward[0] * 0.5, by - toward[1] * 0.5, TZ + 4.4]), { tone: "mid" }));
    out.push(`<g data-mic="${i}" opacity=".2">${D([at([bx - toward[0] * 0.5, by - toward[1] * 0.5, TZ + 4.6])], { size: 0.75, tone: "hi" })}</g>`);
    const kx = bx + (toward[1] ? 3 : 0), ky = by + (toward[0] ? 3 : 0);
    out.push(slab({ x: kx - 1, y: ky - 0.8, w: 2, d: 1.6, r: 0.3 }, TZ, 0.3, { tone: "lo" }, 2, 0));
    out.push(`<g data-key="${i}" opacity="0"><path d="${k.slabOf({ x: kx - 0.7, y: ky - 0.5, w: 1.4, d: 1, r: 0.2 }, TZ + 0.3, 0.01, P, 2).top}" class="ph-k${votes[i].v}"/></g>`);
  });
  // water bottles and glasses down the middle
  for (let x = -40; x <= 40; x += 16) out.push(cyl(x, TABLE.y + TABLE.d / 2, 0.8, TZ, 3.2, { tone: "mid" }, 12), cyl(x + 3, TABLE.y + TABLE.d / 2, 0.6, TZ, 1.6, { tone: "hi" }, 12));
  return out.join("");
}

function screen() {
  const out = [], X = -30, Y = -60, W = 60, H = 29, Z = 7;
  for (const x of [X + 8, X + W - 10]) out.push(slab({ x, y: Y - 1.5, w: 2, d: 5, r: 0.3 }, 0, Z, { tone: "lo" }));
  out.push(S(k.slabOf({ x: X, y: Y, w: W, d: 2.4, r: 0.4 }, Z, H + 2, P, 2, 0.4), { tone: "mid" }));
  const f = faceY(X + 1, Y + 2.42, Z + H + 1);
  const lab = ["YES", "NO", "ABST."];
  out.push(`<g transform="${f}"><rect class="ph-screen" width="${W - 2}" height="${H}"/>
    <text x="3" y="4.2" class="ph-t">MOTION 4 · APPROVE FY27 EVENT PLAN</text>
    ${[0, 1, 2].map((v) => `<text x="3" y="${9.1 + v * 4.6}" class="ph-s">${lab[v]}</text><rect x="12" y="${6.6 + v * 4.6}" width="40" height="3" rx=".6" class="ph-track"/><rect data-res="${v}" x="12" y="${6.6 + v * 4.6}" width="0" height="3" rx=".6" class="ph-k${v}"/><text data-n="${v}" x="54" y="${9.1 + v * 4.6}" class="ph-s">0</text>`).join("")}
    <g data-carried opacity="0"><rect x="3" y="${H - 6}" width="22" height="4" rx="1" fill="#5E44E8"/><text x="5" y="${H - 3}" class="ph-t" style="fill:#F6F4EF">CARRIED</text></g>
    <text data-quorum x="${W - 4}" y="${H - 3}" class="ph-s" text-anchor="end">QUORUM —</text></g>`);
  return out.join("");
}

function room() {
  const out = [];
  // credenza with a coffee station, and two planters
  out.push(S(k.slabOf({ x: 58, y: -40, w: 10, d: 40, r: 0.6 }, 0, 8, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam({ x: 58, y: -40, w: 10, d: 40, r: 0.6 }, 4, P, 2), { tone: "faint" }) }));
  out.push(slab({ x: 60, y: -34, w: 6, d: 5, r: 0.5 }, 8, 4.4, { tone: "mid" }), cyl(62, -24, 1, 8, 1.8, { tone: "hi" }, 12), cyl(64, -22, 1, 8, 1.8, { tone: "hi" }, 12));
  for (const [x, y] of [[-80, -50], [70, 20]]) { out.push(cyl(x, y, 3, 0, 6, { tone: "mid" }, 20, 0.3)); out.push(cyl(x, y, 4.4, 6, 3.2, { tone: "hi" }, 22)); out.push(cyl(x, y, 3.2, 9.2, 3, { tone: "hi" }, 20)); }
  return out.join("");
}

const css = `.ph-k0{fill:#5E44E8}.ph-k1{fill:#17112B}.ph-k2{fill:#A996FF}.iso[data-theme="dark"] .ph-k1{fill:#e6e6e6}
.ph-track{fill:#2c2547}.ph-t{fill:#F6F4EF;font:700 2.2px ui-monospace,monospace;letter-spacing:.2px}.ph-s{fill:#bdb4ee;font:600 2.2px ui-monospace,monospace}
.screen-k1,.ph-screen + * .ph-k1{fill:#F6F4EF}`;

const live = `
const CUES = ${JSON.stringify(CUES)}, END = ${END}, M = ${JSON.stringify(MODEL)}, VOTES = ${JSON.stringify(votes)}, ROLL_T = ${JSON.stringify(rollT)};
const T_VOTE = ${T_VOTE}, T_RESULT = ${T_RESULT};
const svgEl = document.querySelector(".iso-stage svg"), readout = document.querySelector("[data-readout]");
const mics = [...svgEl.querySelectorAll("[data-mic]")].sort((a, b) => a.dataset.mic - b.dataset.mic), keys = [...svgEl.querySelectorAll("[data-key]")].sort((a, b) => a.dataset.key - b.dataset.key);
const res = [...svgEl.querySelectorAll("[data-res]")].sort((a, b) => a.dataset.res - b.dataset.res), ns = [...svgEl.querySelectorAll("[data-n]")].sort((a, b) => a.dataset.n - b.dataset.n);
const carried = svgEl.querySelector("[data-carried]"), quorum = svgEl.querySelector("[data-quorum]");
res[1].setAttribute("class", "ph-k1"); res[1].style.fill = "#F6F4EF";
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
let said = "";
function render(t) {
  const present = ROLL_T.filter((x) => t >= x).length;
  mics.forEach((m, i) => { const on = t >= ROLL_T[i] && t < T_VOTE; const flash = Math.exp(-Math.max(0, t - ROLL_T[i]) * 3); m.setAttribute("opacity", t < ROLL_T[i] ? ".2" : on ? (0.45 + 0.55 * flash).toFixed(3) : ".45"); });
  const tally = [0, 0, 0];
  keys.forEach((kEl, i) => { const v = VOTES[i]; const o = sm((t - v.t) / 0.2); kEl.setAttribute("opacity", o.toFixed(3)); if (t >= v.t) tally[v.v]++; });
  const cast = tally[0] + tally[1] + tally[2];
  res.forEach((r, v) => r.setAttribute("width", (40 * tally[v] / M.seats).toFixed(2)));
  ns.forEach((n, v) => (n.textContent = String(tally[v])));
  quorum.textContent = "QUORUM " + present + "/" + M.seats;
  carried.setAttribute("opacity", sm((t - T_RESULT) / 0.5).toFixed(3));
  const pct = cast ? Math.round((tally[0] / cast) * 100) : 0;
  const text = t < CUES[0].at ? "standby · board in session"
    : t < T_VOTE ? "Q1 · roll call · " + present + "/" + M.seats + (present >= M.quorum ? " · quorum met" : "")
    : t < T_RESULT ? "Q2 · vote · " + cast + "/" + M.seats + " cast · " + pct + "% yes"
    : "Q3 · carried · " + tally[0] + " yes · " + tally[1] + " no · " + tally[2] + " abstain";
  if (text !== said) { readout.textContent = text; said = text; }
}
`;

const ordered = byDepth(seatsArr.map((s, i) => ({ s, i })), ({ s }) => [s.x, s.y]);
const far = ordered.filter(({ s }) => s.side === "n" || s.side === "w"), near = ordered.filter(({ s }) => s.side === "s" || s.side === "e");
writeFigure(HERE, "the-vote", {
  fig: "Fig 7", title: "The vote", hint: "Hover to scrub · → for the next cue", readout: "standby · board in session",
  keys: [{ mark: "lit", label: "Delegate mics and keypads: who is present and how they vote" }, { mark: "raised", label: "Board table, results screen and room at 1:100" }],
  caption: `A board meeting as a scale model. Roll call lights each of the ${MODEL.seats} delegate mics; quorum is ${MODEL.quorum}. The vote opens, keypads light as ballots come in, and the motion carries by simple majority: ${MODEL.yes} yes, ${MODEL.no} no, ${MODEL.abstain} abstain.`,
  label: "A boardroom on a precision plinth: a long table with 24 chairs, a gooseneck microphone and voting keypad at every seat, a results screen at the end of the room, a credenza with a coffee station and two planters. Mics light in a roll call, keypads light as votes are cast and the screen shows the motion carried.",
  body: [plinth("PH-07"), screen(), room(), far.map(({ s }) => chair(s)).join(""), tableAndKit(), near.map(({ s }) => chair(s)).join("")],
  css, live, cues: CUES, end: END,
  names: ["Roll call", "Vote open", "Result"], headline: "Corporate<br>events", tagline: "Every voice, counted",
  sfx: rollOrder.map((r) => ({ kind: "tick", at: r.t })).concat(votes.map((v) => ({ kind: "key", at: v.t }))).concat([{ kind: "swell", at: T_RESULT }]),
});
