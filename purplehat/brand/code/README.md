# PhE logo in code

The PurpleHat Events mark as code: one geometry, one choreography, four ways to use it.
The geometry is the same as `../logo-geom.js` and the SVG files: stroke 24, dot radius 12.75, mark 438.99 × 159.84 units.

| File | Use it for |
|---|---|
| `phe-logo.js` | ES module, no dependencies: `svgString()`, `drawCanvas()`, `mount()`, `animate()`, `pose()` |
| `phe-logo.global.js` | The same code as a plain `<script>` (sets `window.PheLogo`). Works from `file://`, CodePen, TouchDesigner's Web Render TOP |
| `phe-logo.d.ts` | Types for the module |
| `PheLogo.tsx` | React component (React 17+, server-render safe) |
| `phe-logo.css` | CSS-only animation for inline SVG |
| `phe-logo-animated.svg` | Standalone animated SVG. Plays even as `<img src>` |

## Static SVG

```js
import { svgString } from './phe-logo.js';

svgString();                                              // primary mark
svgString({ variant: 'twotone' });                        // dots in accent
svgString({ layout: 'primary', variant: 'reversed' });    // stacked lockup on primary, with clear space
svgString({ layout: 'horizontal', color: '#000' });
svgString({ layout: 'icon', rounded: true, width: 512, height: 512 });
```

Options:

- `layout`: `'mark'`, `'primary'` (stacked), `'horizontal'`, `'stacked'` (two-line), `'pill'`, `'icon'` or `'favicon'`.
- `variant`: `'primary'`, `'twotone'`, `'reversed'`, `'twotone-reversed'`, `'black'`, `'white'` or `'accent'`.
- `color`, `dotColor` and `background` override the variant. `background: null` makes it transparent.
- `padding` takes logo units, or `'clear'` for the clear space. It defaults to `'clear'` when there is a background.
- `width`, `height` and `title` set those attributes.
- `pose` freezes one animation frame, for example `pose('draw-drop', 2.7)`. Use it for thumbnails, GIF frames and OG images.
- `css: true` adds the class hooks used by `phe-logo.css`.

## Live logo in the DOM

```js
import { mount } from './phe-logo.js';

const logo = mount(document.querySelector('#logo'), { variant: 'twotone' });
await logo.play('draw-drop').finished;   // strokes draw on, dots drop on the beat, (lockups) wordmark slides up
logo.play('breathe');                    // then idle
```

### Presets

| Preset | Length | What happens |
|---|---|---|
| `'draw-drop'` | 5 s | Strokes draw on along their centre lines. The three dots drop in on the beat and bounce onto the baseline. On lockups the wordmark then slides up. |
| `'dot-run'` | 5 s | One dot bounces in from the left. Each touch-down leaves a dot behind and sprouts that letter from it. |
| `'drop'` | 1.8 s | The strokes stay put and only the dots drop in. Good for page loads. |
| `'breathe'` | 4 s, loops | The dots gently breathe, one after another. |
| `'pulse'` | 2 s, loops | A hop runs across the three dots. Good for hover and loading states. |

`play()` and `animate()` take these options:

- `speed`
- `loop`
- `delay` (seconds)
- `onFrame(t, pose)`
- `onCue(cue)`, which fires on every landing, bounce and whoosh. Use it to sync sound or haptics.
- `respectReducedMotion`, which defaults to true. One-shot presets then jump straight to the final frame.

## Canvas

```js
import { drawCanvas, pose, animate } from './phe-logo.js';

drawCanvas(ctx, { layout: 'primary', variant: 'twotone', x: 40, y: 40, width: 600 });       // static
drawCanvas(ctx, { scale: 2, pose: pose('dot-run', 1.4) });                                   // any frame
animate({ canvas, variant: 'twotone', width: 600, x: 20, y: 20 }, 'draw-drop');             // play on a canvas
```

`drawCanvas` returns `{ scale, x, y }`, so you can draw your own extras in logo units. The animation pages in `../animation/` work this way.

## React

```tsx
import { PheLogo } from './PheLogo';

<PheLogo />                                              // primary mark
<PheLogo layout="primary" variant="reversed" size={160} />
<PheLogo variant="twotone" animate="draw-drop" size={96} onComplete={() => …} />
<PheLogo animate="breathe" color="#000" dotColor="#2563EB" size={48} />
```

Props:

- `layout` and `variant`, as above.
- `color`, `dotColor` and `background` override the variant.
- `padding`, in units or `'clear'`.
- `animate`: a preset name, or `false`.
- `loop`, `speed` and `delay`.
- `size`: the height in px or any CSS length. The width follows the aspect ratio.
- `title`, `className`, `style` and `onComplete`.
- `pose`, which freezes one frame.

Copy `PheLogo.tsx`, `phe-logo.js` and `phe-logo.d.ts` into your app together. The component is type-checked with TypeScript 5.6 in strict mode.

## CSS only (no JS)

```html
<link rel="stylesheet" href="phe-logo.css">
<!-- markup: svgString({ css: true }), pasted inline -->
<svg class="phe-logo phe-css phe-idle" …>…</svg>
```

| Class | Effect |
|---|---|
| `phe-css` | Intro: the strokes draw on and the dots drop in. 5 s, the same timing as the JS. |
| `phe-css phe-idle` | The intro, then the dots keep breathing. |
| `phe-breathe` / `phe-pulse` | A loop on a static logo. |
| `style="--phe-delay: .5s"` | Starts the intro later. |

`prefers-reduced-motion` turns all of these off.

You can also use `<img src="phe-logo-animated.svg">` with no CSS file, because the styles are embedded. Browsers run CSS animations inside SVG images.

## Regenerating

The data block at the top of `phe-logo.js`, the keyframes in `phe-logo.css`, and both `phe-logo.global.js` and `phe-logo-animated.svg` are generated by `node build/build_code.mjs`. Run it from the brand root; `python build/build_all.py` also runs it. Edit the hand-written parts freely; the generator only replaces what sits between the `<generated:…>` markers.
