/**
 * <PheLogo /> — PurpleHat Events logo as a React component (React 17+; server-render safe).
 *
 *   <PheLogo />                                        primary mark
 *   <PheLogo layout="primary" variant="reversed" />    stacked lockup on primary, with clear space
 *   <PheLogo variant="twotone" animate="draw-drop" />  intro: strokes draw on, dots drop in on the beat
 *   <PheLogo animate="breathe" size={48} />            idle loop for headers / screens
 *   <PheLogo color="#000" dotColor="#2563EB" />        any colours
 *
 * Geometry and choreography come from ./phe-logo.js, so this matches the SVG files, the CSS version and the videos.
 */
import { useEffect, useId, useRef } from 'react';
import type { CSSProperties } from 'react';
import {
  GEOMETRY, WORDMARK, LOCKUPS, PRESETS, DOT_IDS,
  animate as runAnimation, applyPose, pose, restPose, viewBox, resolve, hasMark, wordsOf, dotRestTransform, wordClipTop,
} from './phe-logo.js';
import type { Layout, Variant, PresetName, Pose } from './phe-logo.js';

export interface PheLogoProps {
  /** 'mark' (default) | 'primary' (stacked) | 'horizontal' | 'stacked' (two-line) | 'pill' */
  layout?: Exclude<Layout, 'icon' | 'favicon'>;
  /** colourway: 'primary' | 'twotone' | 'reversed' | 'twotone-reversed' | 'black' | 'white' | 'accent' */
  variant?: Variant;
  /** stroke + wordmark colour (overrides the variant) */
  color?: string;
  /** dot colour (defaults to the variant's, or to `color`) */
  dotColor?: string;
  /** background fill; null = transparent. Reversed variants default to primary. */
  background?: string | null;
  /** padding in logo units, or 'clear' for the clear-space X (default 'clear' when there is a background) */
  padding?: number | 'clear';
  /** false (static) or a preset: 'draw-drop' | 'dot-run' | 'drop' | 'breathe' | 'pulse' */
  animate?: PresetName | false;
  /** loop the animation (loops by default for 'breathe' and 'pulse') */
  loop?: boolean;
  speed?: number;
  /** seconds before the animation starts */
  delay?: number;
  /** rendered height in px (or any CSS length); width follows the aspect ratio */
  size?: number | string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  /** called when a one-shot animation finishes */
  onComplete?: () => void;
  /** freeze a specific frame instead of animating: pose('draw-drop', 1.2) */
  pose?: Pose;
}

type DotRef = [SVGGElement | null, SVGCircleElement | null];

export function PheLogo({
  layout = 'mark', variant = 'primary', color, dotColor, background, padding, animate = false, loop, speed = 1, delay = 0,
  size, title = 'PurpleHat Events', className, style, onComplete, pose: frozen,
}: PheLogoProps) {
  const { color: fg, dotColor: dg, background: bg } = resolve({ variant, color, dotColor, background });
  const vb = viewBox(layout, padding ?? (bg ? 'clear' : 0));
  const clipId = `phe-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const strokes = useRef<Record<string, SVGPathElement | null>>({});
  const dots = useRef<Record<string, DotRef>>({});
  const word = useRef<SVGGElement | null>(null);
  const done = useRef(onComplete);
  done.current = onComplete;

  useEffect(() => {
    const refs = { strokes: strokes.current, dots: dots.current, word: word.current };
    if (frozen) { applyPose(refs, frozen); return; }
    if (!animate) { applyPose(refs, restPose()); return; }
    applyPose(refs, pose(animate, 0));
    const ctl = runAnimation({ set: (p: Pose) => applyPose(refs, p) }, animate, { loop, speed, delay });
    ctl.finished.then(() => done.current?.());
    return () => ctl.stop();
  }, [animate, loop, speed, delay, frozen, layout]);

  const words = wordsOf(layout);
  const sizeStyle: CSSProperties = size === undefined ? {} : { height: size, width: 'auto' };
  // before hydration an animated logo starts hidden, so it never flashes the end state
  const start = animate && !frozen ? pose(animate, 0) : null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={vb.map((v) => +v.toFixed(2)).join(' ')}
      role="img"
      aria-label={title}
      className={['phe-logo', className].filter(Boolean).join(' ')}
      style={{ overflow: 'visible', display: 'block', ...sizeStyle, ...style }}
    >
      <title>{title}</title>
      {bg && <rect x={vb[0]} y={vb[1]} width={vb[2]} height={vb[3]} fill={bg} />}
      {hasMark(layout) && (
        <>
          <g fill="none" stroke={fg} strokeWidth={GEOMETRY.w} strokeLinecap="round" strokeLinejoin="round">
            {GEOMETRY.strokes.map((s) => (
              <path
                key={s.id}
                ref={(el) => { strokes.current[s.id] = el; }}
                d={s.d}
                pathLength={1}
                className={`phe-part phe-${s.id}`}
                style={start ? { visibility: 'hidden' } : undefined}
              />
            ))}
          </g>
          <g fill={dg}>
            {DOT_IDS.map((id) => (
              <g
                key={id}
                ref={(el) => { (dots.current[id] ||= [null, null])[0] = el; }}
                transform={dotRestTransform(id)}
                opacity={start ? start.dots[id].o : 1}
              >
                <circle
                  ref={(el) => { (dots.current[id] ||= [null, null])[1] = el; }}
                  cx={0} cy={-GEOMETRY.rd} r={GEOMETRY.rd} className={`phe-dot phe-dot-${id}`}
                />
              </g>
            ))}
          </g>
        </>
      )}
      {(LOCKUPS[layout]?.shapes ?? []).map((d, i) => <path key={i} d={d} fill={fg} fillRule="evenodd" />)}
      {words.length > 0 && (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x={vb[0] - 1e3} y={wordClipTop(layout)} width={vb[2] + 2e3} height={1e4} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <g ref={word} fill={fg} className="phe-wordmark" opacity={start ? start.word.o : 1}>
              {words.map((w) => (
                <path key={w.text} d={WORDMARK.texts[w.text].d} transform={`translate(${w.x} ${w.y}) scale(${w.k})`} />
              ))}
            </g>
          </g>
        </>
      )}
    </svg>
  );
}

export const PHE_PRESETS = Object.keys(PRESETS) as PresetName[];
export default PheLogo;
