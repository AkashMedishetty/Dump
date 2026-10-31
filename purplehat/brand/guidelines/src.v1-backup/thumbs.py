# thumbnails for index.html + contact sheet (run after render.mjs)
import subprocess, glob, os
from PIL import Image, ImageDraw, ImageFont
os.makedirs('previews/thumbs', exist_ok=True)
def pdfthumb(pdf, out, page=1, w=700):
    subprocess.run(['pdftoppm','-png','-singlefile','-f',str(page),'-l',str(page),'-scale-to-x',str(w),'-scale-to-y','-1',pdf,out[:-4]],check=True)
for pdf in glob.glob('cards/*.pdf')+glob.glob('stationery/*.pdf')+glob.glob('slides/*.pdf'):
    pdfthumb(pdf, 'previews/thumbs/'+os.path.basename(pdf).replace('.pdf','.png'))
pdfthumb('PurpleHat-Brand-Guidelines.pdf','previews/thumbs/guidelines.png')
for p in [4,6,7,8,9,11,12,13,15,18,19,22,24,27,28,31,32]:
    pdfthumb('PurpleHat-Brand-Guidelines.pdf',f'previews/thumbs/guidelines-p{p}.png',p)
F='assets/fonts/DMSans-500.ttf'
font=ImageFont.truetype(F,22); fontb=ImageFont.truetype(F,46); fonts=ImageFont.truetype(F,26)
tiles=[('Guidelines · cover','previews/thumbs/guidelines.png')]+[(f'Guidelines · p{p}',f'previews/thumbs/guidelines-p{p}.png') for p in [4,7,8,12,13,18,19,22,28,31,32]]+[
 ('Card A mockup','cards/PhE-BusinessCard-A-mockup.png'),('Card B mockup','cards/PhE-BusinessCard-B-mockup.png'),('Card C mockup','cards/PhE-BusinessCard-C-mockup.png'),('Cards 85×55','cards/PhE-BusinessCard-85x55-overview.png'),
 ('Card A print PDF (front)','previews/thumbs/PhE-BusinessCard-A-Violet-89x51mm.png'),('Card C print PDF (front)','previews/thumbs/PhE-BusinessCard-C-Pill-Diecut-89x51mm.png'),
 ('Letterhead · envelope','stationery/PhE-Stationery-mockup.png'),('Letterhead A4 PDF','previews/thumbs/PhE-Letterhead-A4.png'),('Envelope DL PDF','previews/thumbs/PhE-Envelope-DL.png'),('Email signature','stationery/PhE-Email-Signature-preview.png'),
 ('Badge + lanyard','stationery/PhE-Badge-Lanyard-mockup.png'),('Ticket','stationery/PhE-Ticket-mockup.png'),('Tags','stationery/PhE-Tags-mockup.png'),('Tags PDF','previews/thumbs/PhE-Tags-110x42mm.png')]+[
 (os.path.basename(f).replace('PhE-Social-','Social ').replace('.png',''),f) for f in sorted(glob.glob('social/*.png'))]+[
 (os.path.basename(f).replace('PhE-','').replace('.png',''),f) for f in sorted(glob.glob('slides/PhE-Slide-*.png'))]
cols=6; cw,ch=420,300; pad=24; lab=40; top=150
rows=(len(tiles)+cols-1)//cols
W=cols*cw+(cols+1)*pad; H=top+rows*(ch+lab+pad)+pad+40
sheet=Image.new('RGB',(W,H),(244,241,235)); d=ImageDraw.Draw(sheet)
d.rectangle([0,0,W,top-6],fill=(42,13,110))
d.text((pad,34),'PurpleHat Events — brand kit contact sheet',font=fontb,fill=(244,241,235))
d.text((pad+2,92),f'{len(tiles)} items · guidelines, business cards, stationery, social, slides · all artwork drawn in code · DM Sans stand-in for Satoshi · placeholder contacts',font=fonts,fill=(201,191,238))
for i,(t,f) in enumerate(tiles):
    r,c=divmod(i,cols); x=pad+c*(cw+pad); y=top+r*(ch+lab+pad)
    d.rectangle([x,y,x+cw,y+ch],fill=(232,226,215))
    try:
        im=Image.open(f).convert('RGBA'); im.thumbnail((cw-16,ch-16))
        bg=Image.new('RGBA',im.size,(232,226,215,255)); bg.alpha_composite(im)
        sheet.paste(bg.convert('RGB'),(x+(cw-im.width)//2,y+(ch-im.height)//2))
    except Exception as e: d.text((x+10,y+10),'missing '+f,font=font,fill=(200,0,0))
    d.text((x+2,y+ch+8),t,font=font,fill=(42,13,110))
sheet.save('contact-sheet.png'); print('contact sheet',sheet.size,len(tiles))
