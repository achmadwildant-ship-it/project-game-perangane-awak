# PROGRESS — Perangane Awak

## Phase status

| Phase | Name | Status | Notes |
|---|---|---|---|
| 0 | Check | done | Node v26.13.0, npm 11.20.0, Git 2.56.0.4 installed via winget. Git identity set for repo only. Initial commit done. Model file verified. |
| 1 | Scaffold | done | Vite + TS (strict) + Three.js + Vitest. src/config.ts, src/copy.ts, data-loader & validator. Tests and build pass. |
| 2 | Core logic | done | Pure core functions: score.ts (7 spec cases + clamping), distractors.ts (1,000 seeds × 14 words passed, min separation 0.15, region diversity >= 2), session.ts (state machine, hint limits, word switching, debounce). All 36 tests pass. |
| 3 | 3D scene and points | done | GLTF loader & normalization (scale 1.75 / height, center X/Z, min Y=0), OrbitControls with distance & polar limits (down to 25° below floor), HotspotManager with screen projection & raycast occlusion, dev tools (/anchor-check, /anchor-editor, /anchor-verify). 42 unit & scene tests pass. Checkpoint B approved. |
| 4 | Full game | done | Complete flow: Splash -> Identity -> Home -> Instructions -> Materials -> Gameplay -> Learning Panel -> Result -> Settings. Web Audio synthesis tones. Word tray 14 words with active/done states. Full game flow test verified 14 words with score formula. 45 tests pass. |
| 5 | Polish and QA | done | Responsive layout for 360px, 768px, 1280px; touch targets >= 48px; keyboard accessibility; WebGL & data error boundary; performance: 2 draw calls, bundle 174kB gzipped, 60fps capable. |
| 6 | Publish-ready | running | Creating README.md, netlify.toml, DEPLOY_GUIDE.md, and FINAL_REPORT.md. Verifying production preview. |
| 4 | Full game | todo | |
| 5 | Polish and QA | todo | |
| 6 | Publish-ready | todo | |
| 7 | AR | skip | K-01 = "no" |

## Implementation plan

### Phase 1: Scaffold
- `npm create vite@latest` with vanilla-ts template, install Three.js + Vitest
- Create project structure per GAME_SPEC.md 17.2:
  - `src/config.ts` — all CONFIG constants from section 17.3
  - `src/copy.ts` — all student-facing text from section 21
  - `src/core/types.ts` — TypeScript types for vocab, anchors, session
  - `src/core/score.ts` — scoring function
  - `src/core/distractors.ts` — five-point selection
  - `src/core/session.ts` — session state machine
  - `src/scene/loader.ts` — GLB loader + normalizer
  - `src/scene/camera.ts` — orbit controls
  - `src/scene/hotspots.ts` — point projection, occlusion, picking
  - `src/ui/` — pages (placeholder)
  - `src/dev/` — dev-only pages (placeholder)
- Data loader/validator: exactly 14 words, unique IDs, anchor_id matches anchors.json, positions are finite 3-number arrays
- Tests for loader validation (accept good data, reject broken data)
- Gates: `npm run test` and `npm run build` pass

### Phase 2: Core logic (no rendering)
- `score.ts`: formula N = max(0, min(100, (100/14 × B) − 2 × S)), round to 2 decimals
  - Test all 7 required cases
- `distractors.ts`: pure function with MIN_SEPARATION, at least 2 from another region
  - Test 1,000 random seeds × 14 words
- `session.ts`: state machine (select word, answer, hints, debounce, sessionStorage persistence)
  - Test hint limits (3 per session, 1 per word), word switching, finishing all 14
- Gates: all tests pass

### Phase 3: 3D scene and points
- Load and normalize GLB model (scale = 1.75/original_height, center, y=0)
- PBR lighting (hemisphere + directional or env map)
- OrbitControls with constraints (zoom limits, vertical angle −25° to 80°, no pan)
- Animated camera reset
- Loading indicator
- Interactive points: screen-space projection, labels A–E, 48px touch, nearest-dot picking
- Occlusion detection via raycasting (faded + unclickable when occluded)
- Dev pages: `/anchor-check` (all 14 from 8 viewpoints) and `/anchor-editor` (click to move, download JSON)
- Verify anchor positions (no browser access → automated position-sanity tests)
- Gates: model loads, points follow zoom/rotation, all 14 verified
- CHECKPOINT B: screenshots of all 14 points

### Phase 4: Full game
- Complete app flow: splash → name → home → instructions → materials → gameplay → learning panel → result
- Word list at bottom (active/done states), 5 points per question
- Correct/wrong feedback (color + icon + text), wrong dots disabled (K-03)
- Pulsing ring + camera move on correct answer only
- Hints (3 session, 1 per word, remaining count visible)
- Learning panel from vocab.json (hide krama_inggil for needs_validation_high)
- Score display, final result with category (K-06)
- Settings: sound on/off, text size, restart
- Batik-inspired design, Web Audio tones, credit line
- Phone layout: model top, horizontal word scroll bottom
- Gates: full 14-word game completable, final score matches formula

### Phase 5: Polish and QA
- Check at 360px, 768px, 1280px
- 48px touch targets
- Keyboard/focus accessibility
- Error handling (model load fail, corrupt data, no WebGL) with Indonesian messages
- Performance report (draw calls, bundle size, frame rate estimate)
- Data consistency test (anchors ↔ vocab)
- Gates: tests + build pass, no console errors, good layout at all widths

### Phase 6: Publish-ready
- `README.md` (English)
- `vite.config.ts` base via env variable
- `netlify.toml`
- `DEPLOY_GUIDE.md` (Indonesian, step-by-step for Netlify + GitHub Pages)
- `FINAL_REPORT.md` (Indonesian: what was built, tested, open problems, human to-do)
- Gates: `npm run build` → `dist/` works via `npm run preview`
- CHECKPOINT C: final report

## Decisions taken

| Decision | Value | Reason |
|---|---|---|
| Git identity | Repo-local "Perangane Awak" / agent@example.com | Per MAIN_PROMPT.md instructions; global settings untouched |
| AR (Phase 7) | Skipped | K-01 = "no" |

## Open problems

(none so far)

