import base64, html
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
CAP = b64('PurpleHat-cap-reference.png'); STILL = b64('still3d.png')
MARK = '''<svg viewBox="-110 -110 220 220" width="{s}" height="{s}"><circle r="110" fill="#5E44E8"/>
<path d="M-67.7 -73.6A100 100 0 0 1 67.7 -73.6A85 85 0 0 1 -67.7 -73.6Z" fill="#F6F4EF"/>
<path d="M73.6 -67.7A100 100 0 0 1 73.6 67.7A85 85 0 0 1 73.6 -67.7Z" fill="#D7CFFF"/>
<path d="M67.7 73.6A100 100 0 0 1 -67.7 73.6A85 85 0 0 1 67.7 73.6Z" fill="#F6F4EF"/>
<path d="M-73.6 67.7A100 100 0 0 1 -73.6 -67.7A85 85 0 0 1 -73.6 67.7Z" fill="#F6F4EF"/></svg>'''
STYLE = "Japanese anime feature-film still, hand-painted backgrounds, cinematic lighting, purple-and-amber palette, 16:9 landscape, no text, no logos, no watermarks."
CHAR = "ANU — an original character: South Indian woman, late twenties, event production lead. Purple PurpleHat cap (exactly as the cap reference, visor forward), black crew t-shirt, wireless headset around her neck, lanyard, rolled sleeves, dark cargo trousers, trainers. Calm under pressure, quiet confident smile."
SHOTS = [
 ("A1", "PH_A1_cap.png", "Cap turnaround", "Attach: cap reference", "Product turnaround of one baseball cap, built exactly as the attached top-view reference: a purple crown (#5E44E8) of four curved panels with stitched seams meeting around an open centre, and the lavender panel (#D7CFFF) is the stiff front visor. No text, logo or top button. Three views on a plain light background: three-quarter front, side, and straight down from above."),
 ("A2", "PH_A2_anu_sheet.png", "Character sheet", "Attach: cap reference + A1", "Character turnaround sheet of ANU: " + CHAR + " Front, side and back full-body views, plus three head close-ups: focused, laughing, quietly moved. Plain light background. This sheet is the reference for every later image."),
 ("K1", "PH_K1_venue_wide.png", "Shot 1 · 0:00", "Attach: none needed", "Wide shot at golden hour of an outdoor event venue half-built: lighting trusses, an empty stage, crew silhouettes carrying flight cases, dust floating in long sunbeams. No main character."),
 ("K2", "PH_K2_cap_on.png", "Shot 2 · 0:03", "Attach: A1 + A2", "Close-up of Anu (same character as the sheet) pulling the purple cap on, visor forward, golden-hour light on her face, wind lifting her hair."),
 ("K3a", "PH_K3a_cable.png", "Shot 3 · 0:05", "Attach: none needed", "Macro insert: a hand clicking a heavy stage cable into its connector, warm rim light, shallow depth of field."),
 ("K3b", "PH_K3b_stitch.png", "Shot 3 · 0:06", "Attach: A1", "Macro insert: hands stitching two panels of purple fabric together with a visible running stitch, warm light."),
 ("K3c", "PH_K3c_lamp.png", "Shot 3 · 0:07", "Attach: none needed", "Macro insert: a single warm stage lamp switching on in the dusk, glowing filament, soft bloom."),
 ("K4", "PH_K4_rain.png", "Shot 4 · 0:08", "Attach: A1 + A2", "Sudden rain at the venue. Anu raises one hand calmly while four crew members behind her unfurl a large canopy in one motion. Rain streaks, wet reflections, determined mood."),
 ("K5", "PH_K5_lanterns.png", "Shot 5 · 0:12", "Attach: none needed", "Blue hour: the first guests arrive along a path as glowing paper lanterns rise into the sky; the stage behind is lit in purple."),
 ("K6", "PH_K6_countdown.png", "Shot 6 · 0:16", "Attach: A1 + A2", "Backstage in darkness, Anu speaks into her headset and counts down on her fingers (three), stage light spilling across her face."),
 ("K7", "PH_K7_crowd.png", "Shot 7 · 0:19", "Attach: none needed", "Reverse shot from the stage: a wave of purple and gold light sweeps across a crowd of joyful faces, confetti in the air."),
 ("K8", "PH_K8_exhale.png", "Shot 8 · 0:23", "Attach: A1 + A2", "Anu alone in the dark at the side of the stage, exhaling with a small proud smile, soft bokeh of stage lights behind her."),
 ("K9", "PH_K9_overhead.png", "Shot 9 · 0:25", "Attach: cap reference + A1 + A2", "Straight down from high above: Anu stands at the centre of a festival ground at night. We see only the top of her cap, built exactly as the cap reference with the lavender visor pointing to the right of frame, surrounded by concentric rings of warm lights and tiny guests."),
]
cards = ''.join(f'''<div class="card"><div class="cid">{i}</div><div class="cbody"><div class="ctop"><b>{html.escape(t)}</b><span>{html.escape(a)}</span><code>{f}</code></div>
<p class="prompt">{html.escape(STYLE)} {html.escape(p)}</p></div></div>''' for i, f, t, a, p in SHOTS)
doc = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:M;src:url(Manrope-500.woff);font-weight:500}}@font-face{{font-family:M;src:url(Manrope-700.woff);font-weight:700}}@font-face{{font-family:M;src:url(Manrope-800.woff);font-weight:800}}
@page{{size:A4;margin:0}}*{{box-sizing:border-box}}body{{margin:0;font-family:M,Arial,sans-serif;color:#17112B;font-weight:500}}
.page{{width:210mm;height:297mm;padding:18mm 18mm 16mm;position:relative;page-break-after:always;overflow:hidden;background:#F6F4EF}}
.cover{{background:#5E44E8;color:#F6F4EF;display:flex;flex-direction:column;justify-content:space-between}}
.eyebrow{{font-size:9pt;letter-spacing:.22em;text-transform:uppercase;font-weight:700;color:#5E44E8}}.cover .eyebrow{{color:#D7CFFF}}
h1{{font-size:38pt;line-height:1.02;margin:6mm 0 0;font-weight:800;letter-spacing:-.02em}}h2{{font-size:20pt;margin:2mm 0 5mm;font-weight:800;letter-spacing:-.01em}}
h3{{font-size:11pt;margin:6mm 0 2mm;font-weight:800}}p,li{{font-size:10pt;line-height:1.5}}ol,ul{{padding-left:5mm;margin:1mm 0}}
.foot{{position:absolute;left:18mm;right:18mm;bottom:9mm;font-size:8pt;color:#8A829C;display:flex;justify-content:space-between}}.cover .foot{{color:#D7CFFF}}
.sw{{display:flex;gap:4mm;margin-top:3mm}}.sw div{{flex:1;border-radius:3mm;padding:12mm 3mm 3mm;font-size:8.5pt;font-weight:700}}
.card{{display:flex;gap:4mm;border-top:1px solid #DDD7EA;padding:3.2mm 0}}.cid{{width:12mm;font-weight:800;font-size:13pt;color:#5E44E8}}.cbody{{flex:1}}
.ctop{{display:flex;gap:3mm;align-items:baseline;font-size:9.5pt;flex-wrap:wrap}}.ctop span{{color:#8A829C;font-size:8.5pt}}.ctop code{{margin-left:auto;font-size:8pt;color:#5E44E8}}
.prompt{{margin:1.2mm 0 0;font-size:9pt;line-height:1.42;color:#2c2540}}img{{display:block;max-width:100%}}
.box{{background:#E9E4FF;border-radius:3mm;padding:4mm 5mm;margin:3mm 0}}
</style></head><body>
<section class="page cover"><div><div class="eyebrow">PurpleHat Events · Image brief</div><h1>From Above<br>— anime spot</h1>
<p style="font-size:12pt;max-width:140mm;margin-top:6mm;color:#E9E4FF">Everything needed to generate the character, the cap and the ten keyframes for a 30-second anime brand film. Read it all before generating the first image.</p></div>
<div style="display:flex;align-items:center;gap:8mm">{MARK.format(s=170)}<div style="font-size:30pt;font-weight:800;letter-spacing:-.02em">PurpleHat<div style="font-size:10pt;letter-spacing:.5em;font-weight:500;color:#D7CFFF;margin-top:2mm">EVENTS</div></div></div>
<div class="foot"><span>Brief v1 · 4 Oct 2026</span><span>13 images · 16:9</span></div></section>

<section class="page"><div class="eyebrow">01 · How to work</div><h2>Instructions for the image generator</h2>
<div class="box"><p style="margin:0"><b>Goal:</b> 13 consistent images: a cap turnaround (A1), a character sheet (A2) and keyframes K1–K9 for a 30-second anime film. The same woman and the same cap must appear in every image where she is present.</p></div>
<ol>
<li>Generate in the order listed on pages 4–5: A1, then A2, then K1 → K9. Do them one at a time in this same conversation.</li>
<li>For each image, use the prompt exactly as written. Each prompt already starts with the shared style line.</li>
<li>Use the images listed under “Attach” as references. A1 and A2 become references once they exist.</li>
<li>16:9 landscape, highest quality. No text, letters, logos or watermarks anywhere in any image.</li>
<li>The cap must always follow the cap reference on page 3: four curved purple panels with stitched seams, a lavender front visor, and no button or logo on top.</li>
<li>Anu must keep the same face, skin tone, hairstyle and outfit in every image.</li>
<li>Save each result with the file name shown on its card, as the original PNG.</li>
</ol>
<h3>Style</h3><p>{html.escape(STYLE)} Think of a premium animated feature: painterly skies, soft volumetric light, warm amber highlights against deep purple shadows, gentle film grain. Emotional, quiet and confident, not cute or chibi.</p>
<h3>Avoid</h3><ul><li>Text, signage with words, logos and watermarks</li><li>Extra fingers and warped hands; distorted faces in wide shots</li><li>Changing the cap's design or colours</li><li>Neon cyberpunk, 3D or plastic CGI looks, or photo-realism</li></ul>
<h3>Character</h3><p>{html.escape(CHAR)}</p>
<div class="foot"><span>PurpleHat Events · From Above</span><span>2</span></div></section>

<section class="page"><div class="eyebrow">02 · Brand</div><h2>The logo is the cap, seen from above</h2>
<p>The PurpleHat mark is the top of a cap: four panels joined by seams, with the lavender panel as the front visor. In the film, the final shot looks straight down at Anu's cap and turns into this logo, so the cap must match it.</p>
<img src="data:image/png;base64,{CAP}" style="border-radius:3mm;margin:4mm 0;border:1px solid #DDD7EA">
<div class="sw"><div style="background:#5E44E8;color:#F6F4EF">Purple<br>#5E44E8 · cap crown</div><div style="background:#D7CFFF;color:#17112B">Lavender<br>#D7CFFF · visor</div><div style="background:#F6F4EF;color:#17112B;border:1px solid #DDD7EA">Cream<br>#F6F4EF · light</div><div style="background:#17112B;color:#F6F4EF">Ink<br>#17112B · shadow</div></div>
<h3>The finished logo animation (for mood)</h3><img src="data:image/png;base64,{STILL}" style="border-radius:3mm;width:120mm">
<div class="foot"><span>PurpleHat Events · From Above</span><span>3</span></div></section>

<section class="page"><div class="eyebrow">03 · Prompts</div><h2>Generate in this order</h2>{''.join(cards.split('</div></div>')[i] + '</div></div>' for i in range(7))}
<div class="foot"><span>PurpleHat Events · From Above</span><span>4</span></div></section>
<section class="page"><div class="eyebrow">03 · Prompts (continued)</div><h2>&nbsp;</h2>{''.join(cards.split('</div></div>')[i] + '</div></div>' for i in range(7, len(SHOTS)))}
<h3 style="margin-top:8mm">After the keyframes</h3><p>Shot 10, the match cut from the overhead cap to the logo, is built in the edit from K9 and the real logo, so no image is needed. The keyframes are then animated with image-to-video (Wan 2.2, Kling or Veo), so wide, clean compositions with clear subjects animate best.</p>
<div class="foot"><span>PurpleHat Events · From Above</span><span>5</span></div></section>
</body></html>'''
open('brief.html', 'w').write(doc)
