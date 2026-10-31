import sys; sys.argv = ['x', 'p_', 'none']
exec(open('scene.py').read())
from bpy_extras.object_utils import world_to_camera_view
for f in (120, 150, 180):
    sc.frame_set(f); xs = []; ys = []
    for q, ob in panels.items():
        dg = bpy.context.evaluated_depsgraph_get(); e = ob.evaluated_get(dg)
        for v in e.data.vertices:
            p = world_to_camera_view(sc, cam, e.matrix_world @ v.co); xs.append(p.x * 1920); ys.append((1 - p.y) * 1080)
    print(f, 'x', round(min(xs)), round(max(xs)), 'y', round(min(ys)), round(max(ys)))
