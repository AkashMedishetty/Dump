"""python build/montage.py out.png cols label1=img1 label2=img2 ...  -> labelled grid (frame strips, reviews)"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
out, cols, items = sys.argv[1], int(sys.argv[2]), [a.rsplit('=', 1) for a in sys.argv[3:]]
ims = [(l, Image.open(p).convert('RGBA')) for l, p in items]
w, h = ims[0][1].size; pad, lab = 12, 26
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (w + pad) + pad, rows * (h + pad + lab) + pad), (226, 222, 214))
font = ImageFont.truetype(os.path.join(HERE, '..', 'fonts', 'DMSans.ttf'), 16)
d = ImageDraw.Draw(sheet)
for i, (l, im) in enumerate(ims):
    x, y = pad + (i % cols) * (w + pad), pad + (i // cols) * (h + pad + lab)
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    sheet.paste(bg.convert('RGB'), (x, y + lab)); d.text((x, y + 4), l, fill=(42, 13, 110), font=font)
sheet.save(out)
