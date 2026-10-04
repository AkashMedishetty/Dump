---
id: libigl-arap
title: libigl ARAP — drag a shape and it bends like paper
kind: library
url: https://github.com/libigl/libigl
demo: https://libigl.github.io/tutorial/#as-rigid-as-possible
author: Alec Jacobson, Daniele Panozzo and libigl contributors
license: MPL-2.0
license_notes: Core is MPL-2.0 (file-level copyleft — changes to libigl's own files must be shared; using it in our code is fine). Optional "copyleft" modules (CGAL, TetGen) are GPL, and the "restricted" Triangle module uses Shewchuk's non-commercial licence — keep both out of client work and triangulate with something else.
pin: 7100764c2a2833284a8bdfa9b948d2b3bf124624
category: [geometry-algorithms, animation-rigging]
tags: [arap, as-rigid-as-possible, mesh-deformation, triangle-mesh, puppet, geometry-processing, cpp, eigen]
stack: [C++, Eigen]
runs_in: [desktop, cli]
fit: [digital-doodles-wall, avatar-arcade, mural-wall, reels-content, touchdesigner]
aliases: [ARAP, as-rigid-as-possible deformation, igl, Sorkine and Alexa 2007, shape manipulation]
hook: Pull one hand of a flat figure and the whole body follows naturally, bending without stretching — like paper.
source: Instagram @index.opensource
source_ref: IMG_libigl-arap-reel (Instagram reel, Oct 2026)
image: assets/IMG_libigl-arap-reel.jpg
thumb: assets/thumbs/libigl-arap.jpg
added: 2026-10-04
status: verified
related: [animated-drawings, fullik-fabrik-ik, ten-minute-physics, index-opensource-instagram]
---

## What it is

libigl is a widely used C++ geometry-processing library (header-only by default, built on Eigen). One of its best-known tools is **as-rigid-as-possible (ARAP) deformation**: turn a shape into a triangle mesh, pin or drag a few points, and the rest of the shape moves so every little triangle stays as close to its original shape as it can. The reel shows a paper-doll figure: pull one hand and the arm, shoulder and body follow believably, with the triangles coloured by how much each one turned.

## How it works

ARAP (Sorkine & Alexa, 2007) alternates two cheap steps a few times per frame:

1. **Local step:** for each vertex (or triangle), compare its edges now with its edges at rest and find the best-fitting rotation (a small SVD per element). Each piece is allowed to rotate but not to stretch.
2. **Global step:** with those rotations fixed, solve one sparse linear system (the cotangent Laplacian) for all vertex positions, keeping the dragged "handle" points where the user put them. The matrix never changes, so it is factorised once up front and every solve is fast.

Repeat local → global 5–10 times per frame and the shape settles. In libigl: `igl::arap_precomputation(V, F, dim, b, data)` once, then `igl::arap_solve(handle_positions, data, U)` every frame (`tutorial/405_AsRigidAsPossible`; `503_ARAPParam` uses the same idea to flatten 3D surfaces). The same file also offers a dynamics mode (velocity, external forces, stiffness) for a springy, physical feel.

For a 2D figure the pipeline is: outline → triangulate the inside → ARAP with a few handles. The 2D version is small enough to port to JavaScript or Python in a few hundred lines.

## Ideas for us

- **Digital Doodles Wall:** a child draws a figure, we triangulate the drawing and they "grab" its hand with hand tracking to make it wave or dance. Unlike Animated Drawings, it needs no skeleton, so it also works for animals, letters and blobs.
- **Avatar Arcade:** drive a paper-cut avatar from body tracking — map wrists, head and feet to ARAP handles for a puppet that bends instead of snapping at joints.
- **Mural Wall:** let visitors stretch and wiggle parts of a projected illustration (a logo, a mascot) by pointing at them.
- **Reels:** the "pull one hand" shot with triangles coloured by rotation is a strong 10-second explainer clip.
- **TouchDesigner:** precompute in a Python script (libigl has Python bindings — not checked this time) or port the 2D solver into a Script SOP.

## Notes

- **Verified 2026-10-04:** read the README, `include/igl/arap.h` (MPL-2.0 header, ARAPData with dynamics and Young's modulus options) and the tutorial list (405, 503). Pinned `main` at `7100764` (2026-09-04). Stars and activity were not checked (GitHub API access was not available in this session).
- The reel showed a GitHub page at commit `f68f01c`, which is not the `main` head we fetched; the link and the features match.
- **Licensing:** stick to the MPL-2.0 core. The Triangle library behind `igl::triangle` is non-commercial, so for client installations triangulate with a permissive library instead (for example a constrained Delaunay library) or write our own.
- ARAP preserves shape but not area or volume perfectly; for very large pulls add more handles, or the figure can fold over itself.
