# Model inspection report: karakter-wildan-byNesya.glb

Original file: `karakter-wildan-byNesya.glb`. In the project it is `public/model/karakter-wildan-byNesya.glb`.

## Technical data (measured from the file)

| Item | Value |
|---|---|
| File size | about 1.43 MB (under the 5 MB target) |
| Vertices / triangles | 15,413 / 19,450 (light for phones) |
| Structure | 1 node, 1 mesh, 1 PBR material |
| Textures | 3 JPEG at 2048 px: base color (diffuse), ORM, normal |
| Animation / rig | none (static model, as required) |
| Mesh compression | none (not needed, file is small) |
| Original dimensions | width 1.132 (arm span), height 1.717, depth 0.308 |
| Original origin | mid-body (y from -0.859 to +0.859), not at the feet |
| Facing direction | +Z (correct) |
| Exporter | Khronos glTF Blender I/O v4.3.47 (re-exported from Blender) |
| ORM metallic channel | mean about 1/255, so skin does not render as metal |

## Comparison with the earlier version of the file

An earlier version of the file (exported by pygltflib, 1.5 MB) was inspected first, then the current Blender-exported version (the file name was corrected by the user after a typo). The current file has identical geometry (same bounding box; every vertex coincides with a vertex of the earlier mesh; same 19,450 triangles; 6 extra split vertices from the Blender export) and byte-identical textures. The material is now named `Material_0` and has no explicit factors, so the glTF defaults apply (metallic 1 and roughness 1, multiplied by the ORM texture whose metallic channel is near zero; the visual result is the same). Consequently the normalization numbers and the estimated anchors in `data/anchors.json` remain valid.

## Visual inspection

Rendered from front, side, back, and close-ups of head, hand, and feet.

- Plain white T-shirt and gray shorts, no traditional attributes. Matches the design.
- Barefoot with visible toes. Meets the Ampeyan requirement.
- Upright pose facing forward, both hands open with palms facing forward. Arms clearly separated from the torso, legs separated.
- Clear face: eyes, eyebrows, nose, lips and mustache; ears visible from front and side; hair and ears separated well enough.
- Knees, abdomen, chest, neck, and shoulders read naturally under the clothing.

## Issues to handle

1. **The sole (Ampeyan) faces down** and is not visible from normal angles. The initial point is on the top/side of the foot, and the camera may look slightly below the floor line (decision K-12).
2. **Hand point (Asta).** Palms face forward, so the palm is the easiest visible spot.
3. **Three 2048 px textures** are fine for mid-range phones. If weak phones lag, downscale to 1024 px.
4. **PBR material.** Without proper lighting surfaces can look dark. Use hemisphere plus directional light (noted in `AGENTS.md`).
5. **Permission and credit.** The file name names a creator (Nesya) and the character resembles a real person. Confirm written permission and how to credit (K-13), especially before publishing.
6. **This inspection used a simple software renderer**, not a real 3D viewer. Re-check in the app during Phase 3 and in a standard glTF viewer.

## Initial anchor points (estimates)

`data/anchors.json` holds estimated positions for the 14 points in normalized space (height 1.75, origin at the feet). They were computed from geometry and visual estimates, so they can be off by a few centimeters. Refine through `/anchor-editor` and verify through `/anchor-check` in Phase 3.

Feasibility test of the distractor algorithm on these positions: 14,000 random trials (1,000 per word) all succeeded at separation 0.15 without the fallback. The closest pair is Grana and Lathi (0.039), so they never appear together.
