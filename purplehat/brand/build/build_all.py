"""Rebuild every deliverable from the fitted geometry.

    python build/build_all.py            # geometry, SVG set, code/, PNG/PDF/icons, contact sheet  (~1 min)
    python build/build_all.py --video    # + sound, 24 MP4s, alpha .mov/.webm, frame strips         (~10 min)

Needs: Python with numpy, shapely, fonttools, pillow (+ uharfbuzz for kerning); Node 18+; ffmpeg;
a Chromium + playwright-core (paths in build/browser.mjs, override with CHROME / PW_CORE).
"""
import os, subprocess, sys, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
def run(*cmd): print('$', ' '.join(cmd)); subprocess.run(cmd, cwd=ROOT, check=True)
py = sys.executable
run(py, 'build/gen_logo.py')
run(py, 'build/build_svg.py')
run('node', 'build/build_code.mjs')
run('node', 'build/export.mjs')
run('node', 'build/shot.mjs', 'build/contact-sheet.html', 'contact-sheet.png', '2400', '1')
if '--video' in sys.argv:
    run('node', 'build/build_video.mjs', 'cues', 'audio', 'video', 'alpha', 'strips')
shutil.rmtree(os.path.join(HERE, '__pycache__'), ignore_errors=True)
print('done')
