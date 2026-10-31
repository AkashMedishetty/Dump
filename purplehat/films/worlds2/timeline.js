// The order of worlds, how long each lives, and how each one arrives. 120 bpm: a bar is 2 s.
const L = [
  // act 1 — precision and craft (a bar each)
  ['darkKeynote', 'Dark keynote · launch', 3.5, null],
  ['hologram', 'Hologram HUD · tech summit', 2, 'rings'],
  ['asciiCrt', 'ASCII CRT · hackathon', 2, 'crt'],
  ['blueprint', 'Blueprint · venue build', 2, 'blocks'],
  ['artDeco', 'Art deco · gala', 2, 'curtain'],
  ['stainedGlass', 'Stained glass · awards', 2, 'shards'],
  ['paperLantern', 'Paper lantern · night fest', 2, 'iris'],
  ['shadowPuppet', 'Shadow puppet · culture night', 2, 'shutter'],
  ['papercut', 'Papercut · new-year gala', 2, 'tear'],
  ['woodcut', 'Woodcut · summit', 2, 'wipe'],
  ['engraving', 'Engraving · heritage launch', 2, 'wipeUp'],
  ['silentFilm', 'Silent film · premiere', 2, 'irisIn'],
  // act 2 — print, pop and play (the rush: a beat-pair each)
  ['spyTitles', 'Spy titles · reveal', 1, 'wipe'],
  ['silkscreen', 'Silkscreen · festival', 1, 'bands'],
  ['risograph', 'Risograph · city run', 1, 'wipeUp'],
  ['dossier', 'Halftone dossier · the brief', 1, 'page'],
  ['swiss', 'Swiss motion · conference', 1, 'wipe'],
  ['pictogram', 'Pictogram · games day', 1, 'shutter'],
  ['gameShow', 'Game show · activation', 1, 'rings'],
  ['microgame', 'Microgame · catch!', 1, 'iris'],
  ['rubberHose', 'Rubber hose · party', 1, 'irisIn'],
  ['midcentury', 'Midcentury toon · town hall', 1, 'bands'],
  ['scifiToon', 'Sci-fi toon · portal', 1, 'iris'],
  ['celAnime', 'Cel anime 80s · launch night', 1, 'crt'],
  ['pixelRpg', 'Pixel RPG · gaming expo', 1, 'blocks'],
  ['hd2d', 'HD-2D · fantasy ball', 1, 'iris'],
  ['lowpoly', 'Low-poly island · offsite', 1, 'shutter'],
  ['isoInfo', 'Iso infographic · expo floor', 1, 'wipe'],
  ['brickToy', 'Brick toy · family zone', 1, 'blocks'],
  ['paperPopup', 'Paper pop-up · stage', 1, 'page'],
  ['screencast', 'Living screencast · event app', 1, 'wipeUp'],
  ['dataviz', 'Dataviz · the numbers', 1, 'bands'],
  ['whiteboard', 'Whiteboard · workshop', 1, 'wipe'],
  ['crayonBook', 'Crayon book · kids day', 1, 'page'],
  // the breath
  ['inkWash', 'Ink wash · retreat', 4, 'ink'],
  // act 3 — paint and place (a bar each)
  ['watercolor', 'Watercolour · garden wedding', 2, 'ink'],
  ['urbanSketch', 'Urban sketch · city tour', 2, 'page'],
  ['ukiyoe', 'Ukiyo-e · Japan incentive', 2, 'wipe'],
  ['tiltShift', 'Tilt-shift · street festival', 2, 'iris'],
  ['impasto', 'Impasto · rain reception', 2, 'tear'],
  ['backrooms', 'Backrooms · haunted house', 2, 'crt'],
  ['oneLine', 'One line · the idea', 2, 'line'],
  ['glassProduct', 'Glass product · the reveal', 9.5, 'iris'],
];
let t = 0;
export const SLOTS = L.map(([fn, label, d, tx], i) => { const s = { fn, label, t0: t, t1: t + d, tx, tr: d <= 1 ? .3 : d >= 4 ? .8 : .5, i }; t += d; return s; });
export const DUR = t;
const at = (fn) => SLOTS.find(s => s.fn === fn);
export const END = { t0: at('glassProduct').t0 + 3.0 };
export const CAPTIONS = [
  { id: 'one', text: 'One call.', t0: 1.1, t1: 3.75 },
  { id: 'any', text: 'Any world you can imagine.', t0: at('inkWash').t0 + .35, t1: at('inkWash').t0 + 3.95 },
];
