# PurpleHat 3D logo sting — Blender 4.2 (bpy), Cycles CPU.
# usage: python scene.py <out_prefix> <frames: "a-b" or "f1,f2"> [scale%] [samples]
import bpy, bmesh, math, sys
from mathutils import Vector

args = sys.argv[1:]
OUT = args[0] if args else '//f_'
SPEC = args[1] if len(args) > 1 else '100'
PCT = int(args[2]) if len(args) > 2 else 100
SAMPLES = int(args[3]) if len(args) > 3 else 160
FPS, END = 30, 180

def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (1.0,)

PURPLE, CREAM, VISOR, INK = lin('5E44E8'), lin('F6F4EF'), lin('D7CFFF'), lin('17112B')

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = FPS; sc.frame_start = 1; sc.frame_end = END

# ---------- panels ----------
TIP = math.atan2(67.7, 73.6); TI = math.atan2(67.7, 73.6 - 125)
def panel_pts(n=72):
    pts = [(100 * math.cos(-TIP + 2 * TIP * i / n), 100 * math.sin(-TIP + 2 * TIP * i / n)) for i in range(n + 1)]
    pts += [(125 + 85 * math.cos(TI + (2 * math.pi - 2 * TI) * i / n), 85 * math.sin(TI + (2 * math.pi - 2 * TI) * i / n)) for i in range(1, n)]
    return pts
BASE = panel_pts()

def make_panel(name, q, mat, depth=0.13):
    # visor coordinates (pointing +x), rotated by q; svg y down -> blender -z. Origin at the lens centroid.
    rot = (q - 1) * math.pi / 2
    pts = []
    for x, y in BASE:
        xr, yr = x * math.cos(rot) - y * math.sin(rot), x * math.sin(rot) + y * math.cos(rot)
        pts.append((xr / 100, -yr / 100))
    cx = sum(p[0] for p in pts) / len(pts); cz = sum(p[1] for p in pts) / len(pts)
    bm = bmesh.new()
    vs = [bm.verts.new((x - cx, -depth / 2, z - cz)) for x, z in pts]
    f = bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)]: v.co.y += depth
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    ob.location = (cx, 0, cz)
    bv = ob.modifiers.new('bevel', 'BEVEL'); bv.width = 0.028; bv.segments = 6; bv.limit_method = 'ANGLE'; bv.angle_limit = math.radians(40); bv.harden_normals = True
    ob.data.materials.append(mat)
    for p in ob.data.polygons: p.use_smooth = True
    return ob

def principled(name, color, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = color
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m

m_crown = principled('crown', (0.80, 0.78, 0.74, 1.0), **{'Roughness': 0.42, 'Coat Weight': 0.3, 'Coat Roughness': 0.14, 'Subsurface Weight': 0.08, 'Subsurface Scale': 0.02})
m_visor = principled('visor', (0.72, 0.62, 1.0, 1.0), **{'Roughness': 0.28, 'Transmission Weight': 1.0, 'IOR': 1.5, 'Coat Weight': 0.8, 'Coat Roughness': 0.02, 'Emission Color': VISOR, 'Emission Strength': 0.32})
m_text = principled('text', CREAM, **{'Roughness': 0.35, 'Coat Weight': 0.3, 'Coat Roughness': 0.1, 'Alpha': 1.0})
m_ev = principled('events', VISOR, **{'Roughness': 0.5, 'Alpha': 1.0})
m_back = principled('backdrop', PURPLE, **{'Roughness': 1.0})

rig = bpy.data.objects.new('mark', None); sc.collection.objects.link(rig); rig.location = (0, 0, 0.42)
panels = {}
for q, name in [(0, 'top'), (1, 'visor'), (2, 'bottom'), (3, 'left')]:
    ob = make_panel(name, q, m_visor if q == 1 else m_crown); ob.parent = rig; panels[q] = ob

# ---------- type ----------
def text(body, size, z, mat, font, spacing=1.0, depth=0.04):
    cu = bpy.data.curves.new(body, 'FONT'); cu.body = body; cu.font = bpy.data.fonts.load(font)
    cu.size = size; cu.align_x = 'CENTER'; cu.align_y = 'CENTER'; cu.extrude = depth; cu.bevel_depth = 0.006; cu.bevel_resolution = 3; cu.space_character = spacing
    ob = bpy.data.objects.new(body, cu); sc.collection.objects.link(ob); ob.rotation_euler = (math.pi / 2, 0, 0); ob.location = (0, 0, z)
    ob.data.materials.append(mat); return ob
# wordmark is composited in 2D afterwards

# ---------- backdrop, lights, camera ----------
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 4.0, 0.3), rotation=(math.pi / 2, 0, 0)); bpy.context.object.data.materials.append(m_back)
nt = m_back.node_tree; nt.nodes.clear()
tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.13, 0.13, 0.13)
gr = nt.nodes.new('ShaderNodeTexGradient'); gr.gradient_type = 'SPHERICAL'; ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.interpolation = 'EASE'; ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[0].color = lin('24166E')
ramp.color_ramp.elements[1].position = 0.97; ramp.color_ramp.elements[1].color = lin('7C66F4')
mid = ramp.color_ramp.elements.new(0.72); mid.color = lin('5138D6')
em = nt.nodes.new('ShaderNodeEmission'); out = nt.nodes.new('ShaderNodeOutputMaterial')
nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], gr.inputs['Vector']); nt.links.new(gr.outputs['Fac'], ramp.inputs['Fac'])
nt.links.new(ramp.outputs['Color'], em.inputs['Color']); nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
world = bpy.data.worlds.new('w'); sc.world = world; world.use_nodes = True; world.node_tree.nodes['Background'].inputs['Color'].default_value = lin('0B0818'); world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.15

def area(name, loc, target, size, energy, color=(1, 1, 1), shape='SQUARE', size_y=None):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = energy; l.color = color; l.shape = shape; l.size = size
    if size_y: l.size_y = size_y
    ob = bpy.data.objects.new(name, l); sc.collection.objects.link(ob); ob.location = loc
    d = Vector(target) - Vector(loc); ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); return ob
area('key', (-3.2, -4.0, 3.6), (0, 0, 0.2), 4.5, 110, (1.0, 0.97, 0.94)); area('front', (1.2, -7.0, 1.6), (0, 0, 0.3), 6.0, 420, (1.0, 0.98, 0.96))
area('fill', (4.2, -3.0, -0.6), (0, 0, 0), 3.0, 70, (0.8, 0.76, 1.0))
area('rim', (0.6, 2.2, 2.4), (0, 0, 0.3), 1.2, 260, (0.85, 0.8, 1.0)); area('rim2', (-1.5, 2.0, -2.0), (0, 0, 0.3), 1.2, 140, (0.7, 0.6, 1.0))
strip = area('strip', (-5, -2.6, 1.2), (0, 0, 0.3), 0.12, 700, (1, 1, 1), 'RECTANGLE', 7.0)

cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 60; cam_d.dof.use_dof = True; cam_d.dof.aperture_fstop = 2.2
cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
focus = bpy.data.objects.new('focus', None); sc.collection.objects.link(focus); focus.location = (0, 0, 0.0); cam_d.dof.focus_object = focus
track = cam.constraints.new('TRACK_TO'); aim = bpy.data.objects.new('aim', None); sc.collection.objects.link(aim); aim.location = (0, 0, -0.05); track.target = aim

# ---------- animation ----------
def key(ob, path, frame, value, interp='EXPO', easing='EASE_OUT'):
    setattr(ob, path, value) if not isinstance(path, tuple) else None
    ob.keyframe_insert(path, frame=frame)
    for fc in (ob.animation_data.action.fcurves if ob.animation_data and ob.animation_data.action else []):
        if fc.data_path == path:
            for kp in fc.keyframe_points:
                if int(kp.co.x) == frame: kp.interpolation = interp; kp.easing = easing

def fly(ob, f0, f1, offset, rot, interp='EXPO'):
    home = ob.location.copy()
    ob.location = home + Vector(offset); ob.rotation_euler = rot; key(ob, 'location', f0, ob.location, interp); key(ob, 'rotation_euler', f0, ob.rotation_euler, interp)
    ob.location = home; ob.rotation_euler = (0, 0, 0); key(ob, 'location', f1, home); key(ob, 'rotation_euler', f1, (0, 0, 0))

fly(panels[3], 1, 64, (-1.6, 2.4, 0.2), (math.radians(70), math.radians(-40), math.radians(25)))
fly(panels[0], 6, 70, (0.3, 2.8, 1.5), (math.radians(-80), math.radians(30), math.radians(-20)))
fly(panels[2], 11, 76, (-0.2, 2.6, -1.5), (math.radians(85), math.radians(25), math.radians(30)))
fly(panels[1], 46, 92, (6.5, -1.6, 0.3), (math.radians(20), math.radians(-70), math.radians(-35)))

rig.rotation_euler = (math.radians(14), 0, math.radians(-38)); key(rig, 'rotation_euler', 1, rig.rotation_euler, 'QUART', 'EASE_IN_OUT')
rig.rotation_euler = (0, 0, 0); key(rig, 'rotation_euler', 118, rig.rotation_euler, 'QUART', 'EASE_IN_OUT')
rig.location = (0, 0, 0.0); key(rig, 'location', 1, rig.location, 'QUART', 'EASE_IN_OUT'); key(rig, 'location', 100, rig.location, 'QUART', 'EASE_IN_OUT')
rig.location = (0, 0, 0.42); key(rig, 'location', 126, rig.location)

cam.location = (0.0, -12.6, 1.1); key(cam, 'location', 1, cam.location, 'SINE', 'EASE_IN_OUT')
cam.location = (0.0, -11.0, 0.6); key(cam, 'location', END, cam.location, 'SINE', 'EASE_IN_OUT')
focus.location = (0, 0, 0); key(focus, 'location', 1, focus.location); key(focus, 'location', 120, focus.location)
strip.location = (-5.5, -2.6, 1.2); key(strip, 'location', 96, strip.location, 'SINE', 'EASE_IN_OUT')
strip.location = (5.5, -2.6, 1.2); key(strip, 'location', 150, strip.location, 'SINE', 'EASE_IN_OUT')
for f, e in [(1, 0), (90, 0), (100, 12), (146, 12), (156, 0)]:
    strip.data.energy = e; strip.data.keyframe_insert('energy', frame=f)

# type: rises 0.25 and fades in
for ob, f0, mat in []:
    z = ob.location.z; ob.location.z = z - 0.25; key(ob, 'location', f0, ob.location)
    ob.location.z = z; key(ob, 'location', f0 + 36, ob.location)
    a = mat.node_tree.nodes['Principled BSDF'].inputs['Alpha']
    a.default_value = 0.0; a.keyframe_insert('default_value', frame=f0)
    a.default_value = 1.0; a.keyframe_insert('default_value', frame=f0 + 30)
    a.default_value = 0.0 if False else a.default_value

# ---------- render ----------
r = sc.render; r.engine = 'CYCLES'; r.resolution_x = 1920; r.resolution_y = 1080; r.resolution_percentage = PCT
r.use_motion_blur = True; r.motion_blur_shutter = 0.5
cy = sc.cycles; cy.device = 'CPU'; cy.samples = SAMPLES; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.015
cy.use_denoising = True; cy.denoiser = 'OPENIMAGEDENOISE'; cy.max_bounces = 10; cy.transmission_bounces = 10; cy.glossy_bounces = 6; cy.caustics_reflective = False; cy.caustics_refractive = False; cy.transparent_max_bounces = 24; r.use_persistent_data = True
cy.film_exposure = 1.0
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
r.image_settings.file_format = 'PNG'; r.image_settings.color_depth = '16'
bpy.context.preferences.addons['cycles'].preferences.compute_device_type = 'NONE'
r.threads_mode = 'AUTO'

if SPEC == 'none': frames = []
elif '-' in SPEC: a, b = map(int, SPEC.split('-')); frames = range(a, b + 1)
else: frames = [int(x) for x in SPEC.split(',')]
for f in frames:
    sc.frame_set(f); r.filepath = f'{OUT}{f:04d}.png'; bpy.ops.render.render(write_still=True)
    print('rendered', f, flush=True)
