// Type declarations for phe-logo.js (PurpleHat Events — PhE logo in code)

export type Layout = 'mark' | 'primary' | 'horizontal' | 'stacked' | 'pill' | 'icon' | 'favicon';
export type Variant = 'primary' | 'twotone' | 'reversed' | 'twotone-reversed' | 'black' | 'white' | 'accent';
export type PresetName = 'draw-drop' | 'dot-run' | 'drop' | 'breathe' | 'pulse';
export type StrokeId = 'P' | 'h-stem' | 'h-arch' | 'E-top' | 'E-bowl';
export type DotId = 'P' | 'h' | 'E';

/** a dot's offset from rest: x/y in logo units, sx/sy scale about its ground contact, o opacity */
export interface DotPose { x: number; y: number; sx: number; sy: number; o: number; grow?: 'center' }
/** state of every part: strokes as drawn range [start, end] of their length (0..1) */
export interface Pose {
  strokes: Record<StrokeId, [number, number]>;
  dots: Record<DotId, DotPose>;
  word: { y: number; o: number };
}
export interface Cue { t: number; kind: 'land' | 'bounce' | 'tick' | 'whoosh' | 'rise'; id?: string; i?: number; v: number; dur?: number }
export interface Preset { duration: number; loop?: boolean; pose(t: number, opts?: object): Pose; cues(): Cue[] }

export interface ColorOpts { variant?: Variant; color?: string; dotColor?: string; background?: string | null }
export interface SvgOpts extends ColorOpts {
  layout?: Layout; padding?: number | 'clear'; width?: number | string; height?: number | string;
  title?: string; pose?: Pose; css?: boolean; className?: string; rounded?: boolean;
}
export interface CanvasOpts extends ColorOpts {
  layout?: Layout; padding?: number | 'clear'; x?: number; y?: number; scale?: number; width?: number; height?: number;
  pose?: Pose; wordClip?: boolean;
}
export interface AnimateOpts { speed?: number; loop?: boolean; delay?: number; respectReducedMotion?: boolean;
  onFrame?(t: number, pose: Pose): void; onCue?(cue: Cue): void; dropHeight?: number; fadeIn?: boolean }
export interface Controller { stop(): void; seek(t: number): void; finished: Promise<void> }
export interface Mounted { svg: SVGSVGElement; set(p: Pose): void; play(preset: PresetName, o?: AnimateOpts): Controller; stop(): void; destroy(): void }
export interface WordPlacement { text: string; k: number; x: number; y: number }
export interface LockupLayout { vb: [number, number, number, number]; mark: boolean; pad: number; words: WordPlacement[]; shapes: string[] }

export const GEOMETRY: {
  width: number; height: number; w: number; rd: number; gap: number; clear: number;
  strokes: { id: StrokeId; d: string; len: number }[];
  dots: { id: DotId; x: number; y: number; r: number }[];
};
export const WORDMARK: { font: { name: string; file: string }; cap: number; texts: Record<string, { d: string; ink: [number, number, number, number] }> };
export const LOCKUPS: Record<string, LockupLayout>;
export const ICON: { icon: number[]; favicon: number[] };
export const COLORS: { primary: string; accent: string; neutral: string; black: string; white: string };
export const VARIANTS: Record<Variant, { color: string; dotColor: string; background?: string }>;
export const PRESETS: Record<PresetName, Preset>;
export const STROKE_IDS: StrokeId[];
export const DOT_IDS: DotId[];

export function svgString(opts?: SvgOpts): string;
export function drawCanvas(ctx: CanvasRenderingContext2D, opts?: CanvasOpts): { scale: number; x: number; y: number; vb: number[] };
export function mount(container: Element, opts?: SvgOpts & { animate?: PresetName; loop?: boolean }): Mounted;
export function animate(target: { set(p: Pose): void } | (CanvasOpts & { canvas: HTMLCanvasElement }), preset: PresetName, opts?: AnimateOpts): Controller;
export function applyPose(refs: { strokes?: Record<string, Element | null>; dots?: Record<string, [Element | null, Element | null]>; word?: Element | null }, p: Pose): void;
export function pose(preset: PresetName, t: number, opts?: object): Pose;
export function cues(preset: PresetName): Cue[];
export function restPose(): Pose;
export function viewBox(layout?: Layout, padding?: number | 'clear'): [number, number, number, number];
export function resolve(opts?: ColorOpts): { color: string; dotColor: string; background: string | null };
export function hasMark(layout: Layout): boolean;
export function wordsOf(layout: Layout): WordPlacement[];
export function dotRestTransform(id: DotId): string;
export function wordClipTop(layout: Layout): number;
export function drop(tl: number, opts?: { H?: number; g?: number; h1?: number; e?: number; squash?: number; fadeIn?: boolean }): DotPose;
export function hop(t: number, t0: number, t1: number, x0: number, y0: number, x1: number, y1: number, apex: number): { x: number; y: number; vy: number };
export function bounceContacts(opts?: object): { t: number; hold: number; s: number; vOut: number }[];
export const ease: Record<string, (u: number) => number>;
export function seg(t: number, t0: number, t1: number): number;
export function clamp01(v: number): number;
export function lerp(a: number, b: number, u: number): number;
declare const _default: Record<string, unknown>;
export default _default;
