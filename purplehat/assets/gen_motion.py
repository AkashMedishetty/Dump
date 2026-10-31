import base64, html
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
SH = [
 ("K1", "K1_venue_wide", "0:00", 3, "Slow, smooth cinematic push-in toward the stage. Dust drifts through the sunbeams, crew silhouettes walk across carrying flight cases, stage lights blink on one by one, clouds drift slowly. No cuts."),
 ("K2", "K2_cap_on", "0:03", 2, "She pulls the cap down onto her head with both hands and settles the visor forward, then lifts her eyes to the horizon with a small confident smile. Wind moves her hair; the sun flares softly. Camera holds with a slight push-in."),
 ("K3a", "K3a_cable", "0:05", 1, "The hand pushes the connector home and twists it to lock with a firm, decisive motion; light glints along the metal. Shallow depth of field, very slight camera drift."),
 ("K3b", "K3b_stitch", "0:06", 1, "The needle pulls the thread through the purple fabric in one smooth stitch; the thread draws tight and the fingers smooth the seam."),
 ("K3c", "K3c_lamp", "0:07", 1, "The stage lamp is dark, flickers twice, then switches fully on and glows warmly; the light blooms and dust floats in the beam. Camera static."),
 ("K4", "K4_rain", "0:08", 4, "Heavy rain. The four crew members push the canopy up in one coordinated motion and it opens overhead; she keeps one hand raised, calm. Rain splashes off the canopy and the wet ground. Camera slowly pulls back."),
 ("K5", "K5_lanterns", "0:12", 4, "Paper lanterns rise slowly into the night sky, guests walk toward the stage, lantern light flickers, stage lights pulse purple. Camera tilts slowly upward toward the lanterns."),
 ("K6", "K6_countdown", "0:16", 3, "She counts down into her headset: three fingers, then two, then one, her lips moving with each number; light from the stage pulses across her face. Subtle handheld camera."),
 ("K7", "K7_crowd", "0:19", 4, "The stage lights burst on and a wave of purple and gold light sweeps over the crowd; people cheer, jump and raise their hands as confetti falls. Camera slowly pulls back."),
 ("K8", "K8_exhale", "0:23", 2.5, "She exhales slowly, her shoulders relax, and a small proud smile forms; stage lights shimmer in the bokeh behind her; a strand of hair moves. Camera almost still, very slow push-in."),
 ("K9", "K9_overhead", "0:25", 3.3, "Looking straight down from above. The camera rotates slowly and comes to a stop; the rings of lights twinkle and guests move around the circle. She stands still at the centre. Keep her cap exactly as in the image: four panels, lavender visor pointing right."),
]
rows = ''.join(f'''<div class="row"><img src="data:image/jpeg;base64,{b64('kthumb/'+n+'.jpg')}"><div class="rb"><div class="rt"><b>{i}</b><span>input: PH_{n}.png · used for {d:g} s at {t} · save as <code>PH_V_{i}.mp4</code></span></div><p>{html.escape(p)}</p></div></div>''' for i, n, t, d, p in SH)
half = rows.split('<div class="row">')[1:]
p1 = ''.join('<div class="row">' + r for r in half[:5]); p2 = ''.join('<div class="row">' + r for r in half[5:])
doc = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:M;src:url(Manrope-500.woff);font-weight:500}}@font-face{{font-family:M;src:url(Manrope-700.woff);font-weight:700}}@font-face{{font-family:M;src:url(Manrope-800.woff);font-weight:800}}
@page{{size:A4;margin:0}}*{{box-sizing:border-box}}body{{margin:0;font-family:M,Arial,sans-serif;color:#17112B;font-weight:500}}
.page{{width:210mm;height:297mm;padding:16mm 16mm 14mm;position:relative;page-break-after:always;overflow:hidden;background:#F6F4EF}}
.eyebrow{{font-size:9pt;letter-spacing:.22em;text-transform:uppercase;font-weight:700;color:#5E44E8}}h1{{font-size:28pt;margin:3mm 0 4mm;font-weight:800;letter-spacing:-.02em}}h2{{font-size:17pt;margin:1mm 0 4mm;font-weight:800}}
p,li{{font-size:9.6pt;line-height:1.48}}ol{{padding-left:5mm}}.box{{background:#E9E4FF;border-radius:3mm;padding:4mm 5mm;margin:3mm 0}}
.row{{display:flex;gap:4mm;border-top:1px solid #DDD7EA;padding:3mm 0}}.row img{{width:46mm;height:26mm;object-fit:cover;border-radius:2mm}}.rb{{flex:1}}
.rt{{font-size:9pt}}.rt b{{color:#5E44E8;font-size:12pt;margin-right:2mm}}.rt span{{color:#8A829C}}.rt code{{color:#5E44E8}}.rb p{{margin:1mm 0 0;font-size:9pt;line-height:1.4}}
.foot{{position:absolute;left:16mm;right:16mm;bottom:8mm;font-size:8pt;color:#8A829C;display:flex;justify-content:space-between}}
</style></head><body>
<section class="page"><div class="eyebrow">PurpleHat Events · From Above · Motion brief</div><h1>Animate the 11 keyframes</h1>
<div class="box"><p style="margin:0"><b>Goal:</b> turn each approved keyframe into a 5-second animated clip with image-to-video. The edit, music and logo match cut are already locked; these clips replace the still frames shot by shot.</p></div>
<ol><li><b>Tool:</b> image-to-video in Sora (ChatGPT), Kling, Veo (Gemini or Flow) or Runway. Kling and Veo hold faces and the cap best.</li>
<li><b>For each shot:</b> upload the input image named on its card, paste its motion prompt, and generate.</li>
<li><b>Settings:</b> 16:9, 1080p if offered (720p is fine), 5 seconds, no added text, sound off. The first frame must stay identical to the input image.</li>
<li><b>Keep:</b> Anu's face, hair and outfit, and the cap's four panels with the lavender visor. If a take changes them, regenerate it.</li>
<li><b>Generate 2–3 takes</b> per shot when you can, and send all of them, named <code>PH_V_K1_take1.mp4</code> and so on. I'll pick the best motion and trim to the timing.</li>
<li>Prefer slow, physical motion. Avoid morphing, sudden zooms, or new people appearing.</li></ol>
<p>Each card shows how long the shot is on screen. Clips run 5 s, so I can choose the best part.</p>
{p1}
<div class="foot"><span>PurpleHat Events · From Above · Motion brief</span><span>1</span></div></section>
<section class="page"><div class="eyebrow">Shots (continued)</div><h2>&nbsp;</h2>{p2}
<div class="box" style="margin-top:6mm"><p style="margin:0"><b>Shot 10</b> (the cap becoming the logo) is done in the edit, so no clip is needed. Push the clips to the <code>anime-keyframes</code> branch, in <code>assets/anime/clips/</code>, as before.</p></div>
<div class="foot"><span>PurpleHat Events · From Above · Motion brief</span><span>2</span></div></section></body></html>'''
open('motion.html', 'w').write(doc)
