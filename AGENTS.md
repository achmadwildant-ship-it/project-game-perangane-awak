# Project rules: Perangane Awak

## Context
An educational web game that teaches 14 Javanese body-part words with an interactive 3D human model. Sources of truth, in priority order: `DECISIONS.md`, `GAME_SPEC.md`, this file. Data: `data/vocab.json`, `data/anchors.json`. Model: `public/model/karakter-wildan-byNesya.glb`. Read all of them at the start of every task. If the spec and a request conflict, ask instead of guessing.

## Language policy
- Code, identifiers, comments, tests, commit messages, developer docs: English.
- Everything the student sees: Indonesian with Javanese terms, exactly as in `GAME_SPEC.md` section 21 and `data/vocab.json`. Collect all UI text in `src/copy.ts`. Never invent Javanese vocabulary, equivalents, or example sentences.
- Messages to the human user, `FINAL_REPORT.md`, `DEPLOY_GUIDE.md`: Indonesian, plain language.

## Stack
Vite, TypeScript (strict), Three.js, Vitest. No UI framework, no backend, no database. All constants live in `src/config.ts`.

## Structure
```
src/config.ts   src/copy.ts
src/core/    pure logic, no DOM or Three.js (score, distractors, session, types)
src/scene/   Three.js: loader, camera, hotspots
src/ui/      pages and components
src/dev/     anchor-editor, anchor-check (dev only, excluded from production build)
data/        vocab.json, anchors.json
public/model/karakter-wildan-byNesya.glb
tests/
```

## Model facts (do not change without approval)
The model file name is fixed: `public/model/karakter-wildan-byNesya.glb`. Reference it only through `MODEL_PATH` in `src/config.ts`. The user adds the file manually; never rename, move, or regenerate it.

`public/model/karakter-wildan-byNesya.glb`: one mesh, one PBR material, three 2048 px textures, about 19k triangles, no animation, faces +Z. On load normalize: `scale = 1.75 / original_height`, center x and z on the bounding-box center, minimum y = 0. `data/anchors.json` uses that normalized space and holds estimated initial positions to be verified in Phase 3. Do not compress, replace the material, or edit the mesh. Use lighting that makes the PBR material look natural (hemisphere light plus one directional light, or a simple generated environment map); surfaces must never look dark or metallic.

## Working rules
1. One phase per step. Follow `MAIN_PROMPT.md`. Keep `PROGRESS.md` current.
2. Never edit `data/vocab.json`. Edit `data/anchors.json` only in Phase 3 to correct point positions, and log each change in `PROGRESS.md`.
3. Score, distractor selection, and session logic are pure functions in `src/core/` with tests. The scoring test cases are in `GAME_SPEC.md` section 12.
4. Check answers by point ID, never by label or display index.
5. Read every tunable value from `src/config.ts`. Never duplicate constants.
6. Never show the krama inggil value of an entry with `validation_status` = `needs_validation_high`.
7. The camera must not move toward the answer before a correct answer.
8. Points must stay attached to the model during zoom and rotation, and must not be clickable when occluded by model geometry.
9. Touch targets at least 48 px. Verify at widths 360 px and 1280 px.
10. AR must never break the 3D-on-screen mode. The AR button appears only if support is detected, and only if `DECISIONS.md` K-01 is "yes".
11. Add no dependency without a written reason in `PROGRESS.md`.
12. Run `npm run test` and `npm run build` before declaring a phase done. Report what was tested and what was not. Never delete or weaken a test to make it pass. Before declaring any phase or revision done, `npm run verify` must pass, including the dev-server check and the dist/ leak check (`node scripts/check-dist.js` — must report zero matches for anchor-editor, anchor-verify, anchor-check).
13. Commit after each phase passes its gates.

## Code style
TypeScript strict, lowercase-hyphen file names, short comments in English, no dead code, small pure functions, explicit types at module boundaries.
