// One timeline for picture, score, foley and checks. 120 bpm: beat 0.5 s, bar 2 s.
export const BPM = 120, BEAT = 0.5, BAR = 2.0, DUR = 40.0;

// The show call. Each cue: standby one half-bar before, GO on a bar line.
export const CUES = [
  { q: 'Q1', name: 'Worklights', go: 1.0, sb: 0.0 },
  { q: 'Q2', name: 'Stage', go: 3.0 },
  { q: 'Q3', name: 'Rounds · 24 × 10', go: 5.0 },
  { q: 'Q4', name: 'LED wall', go: 7.0 },
  { q: 'Q5', name: 'Rig · 12 heads', go: 9.0 },
  { q: 'Q6', name: 'Registration', go: 11.0 },
  { q: 'Q7', name: 'Doors', go: 13.0 },
  { q: 'Q7.5', name: 'LED · B-feed', go: 18.0, sb: 17.5, insert: 17.0 },
  { q: 'Q8', name: 'House to half', go: 22.0 },
  { q: 'Q9', name: 'Show', go: 24.0 },
];
CUES.forEach(c => { if (c.sb === undefined) c.sb = c.go - 1.0; });

export const T = {
  revealEnd: 2.3,
  tablesFrom: 5.0, tableStep: 0.0625, tableFly: 0.34,
  doors: 13.0, guestsFrom: 13.25, guestsTo: 20.6, walk: 3.1,
  fault: 17.0, faultEnd: 18.0,           // LED wall loses signal; digital zero for the score 17.0–17.5
  half: 22.0, hush: 23.0, show: 24.0,    // near-silence 23.0–24.0, the first sound after it is the show downbeat
  collapse: 33.0, mark: 33.5, end: 40.0,
};

export const TOASTS = [
  { id: 'saw', text: 'Nobody in the room saw that.', t0: 18.4, t1: 21.9 },
  { id: 'hear', text: 'You’ll never hear the call.', t0: 27.6, t1: 31.6 },
];

export const GUESTS = 240, TABLES = 24, SEATS = 10;
