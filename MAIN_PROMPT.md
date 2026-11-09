# MAIN PROMPT: build the whole Perangane Awak project

You are the implementing agent. Build this project from scratch to a publish-ready state, autonomously, following the phases below. The human user only provides the folder, the assets, and approvals at defined checkpoints.

## Sources (read all of them first)
`AGENTS.md`, `GAME_SPEC.md`, `DECISIONS.md`, `MODEL_REPORT.md`, `data/vocab.json`, `data/anchors.json`, `public/model/karakter-wildan-byNesya.glb`. If sources conflict, priority is `DECISIONS.md`, then `GAME_SPEC.md`, then `AGENTS.md`. Never guess Javanese content.

## Language
Code, comments, tests, commits, developer docs: English. Student-facing text: Indonesian exactly as in `GAME_SPEC.md` section 21, collected in `src/copy.ts`. Talk to the human user, and write `FINAL_REPORT.md` and `DEPLOY_GUIDE.md`, in plain Indonesian.

## How to work
1. Create `PROGRESS.md` in the project root: list of phases, status (todo / running / done), decisions taken, open problems. Update it at the end of every phase. If your context is cut or a new session starts, read `PROGRESS.md` and continue from the first unfinished phase.
2. Each phase has **quality gates**. A phase is not done until every gate passes. If a gate fails, fix the root cause. Never delete a test or loosen a criterion. At most three repair attempts per problem, then stop and report.
3. Run commands yourself (npm, git, tests, build). After the gates pass, `git commit` with a message that names the phase.
4. Verify visuals yourself with any browser access you have: run `npm run dev`, open pages, take screenshots, inspect them, and fix problems. If you have no browser access, say so explicitly and add automated tests instead.
5. Add no dependency beyond the stack without a written reason in `PROGRESS.md`. Create no files outside the structure in `GAME_SPEC.md` section 17.2 except the ones named here.
6. Never edit `data/vocab.json`. `data/anchors.json` may be edited only in Phase 3 to correct point positions, with each change logged in `PROGRESS.md`.

## Stop and ask the user only if
- Basic tools are still missing after the installation attempt described in Phase 0: explain in Indonesian what the user must do (restart the app or the computer, or install manually), then stop.
- Checkpoint A, B, or C below is reached.
- A decision with no default in `DECISIONS.md` blocks the work.
- A problem remains unsolved after three attempts.
Otherwise do not ask. Make the best decision, record the reason in `PROGRESS.md`, and continue.

## Phases

### Phase 0. Check
Tooling check and installation:
1. Run `node -v`, `npm -v`, `git --version`.
2. If any is missing, install it yourself. On Windows use the official winget packages only: `winget install OpenJS.NodeJS.LTS` and `winget install Git.Git` (the user will approve each command and may need to accept a Windows permission prompt). On macOS use Homebrew (`brew install node git`) if Homebrew exists. Never download installers from any source other than these official package managers.
3. A freshly installed program is often not visible in an already-open terminal. Start a new terminal session and re-check; if still not found, try the default install paths (for example `C:\Program Files\nodejs\node.exe` and `C:\Program Files\Git\cmd\git.exe`). If the tools remain unavailable, stop and ask the user (in Indonesian) to close and reopen the app or restart the computer, then say "continue".
4. If `winget` itself is unavailable, stop and give the user the manual steps in Indonesian (official Node.js LTS and Git installers from nodejs.org and git-scm.com).
5. Git identity: if `git config user.name` or `user.email` is empty, set them for this repository only (not globally) with `git config user.name "Perangane Awak"` and `git config user.email "agent@example.com"`, and mention it in the report. Never change the user's global Git settings.
6. Initialize the repository with `git init` if there is none and make an initial commit of the existing files.
Then confirm that `public/model/karakter-wildan-byNesya.glb` exists (the user adds it manually; keep that exact file name and never rename it). If the file is missing, stop and tell the user in Indonesian where to put it. Read all sources. Write a concise implementation plan for all phases and create `PROGRESS.md`.
**CHECKPOINT A:** show the plan and wait for the user's approval once. After approval do not ask again before Phase 3.

### Phase 1. Scaffold
Initialize Vite + TypeScript (strict) + Three.js + Vitest without overwriting existing files. Structure per section 17.2. `src/config.ts` with the constants in section 17.3, honoring `DECISIONS.md`. `src/copy.ts` with section 21 text. Loader and validator for `vocab.json` and `anchors.json` per section 17.4 (exactly 14 words, unique IDs, every `anchor_id` has a valid position).
Gates: `npm run test` and `npm run build` pass; the loader rejects broken data (covered by tests).

### Phase 2. Core logic (no rendering)
Pure functions in `src/core/` with tests: scoring (the seven cases in section 12 plus clamping), five-point selection per section 8.3, session state machine (select word, answer correct/wrong, session and per-word hint limits, finishing 14 words, `sessionStorage` persistence, debounce).
Gates: all tests pass, including 1,000 random seeds for each of the 14 words (five points, exactly one correct, unique IDs, minimum separation honored, at least two from another region).

### Phase 3. 3D scene and points
- Load `karakter-wildan-byNesya.glb`, normalize per section 3.2, natural PBR lighting, clean background, loading indicator.
- Camera: zoom, horizontal and vertical rotation, animated reset, distance and angle limits (down to 25 degrees below the floor line), pan disabled, two-finger touch and mouse.
- Interactive points: screen projection, labels A to E, touch area at least 48 px, nearest-dot picking, occlusion by ray casting (occluded dots faded and not clickable).
- Dev-only page `/anchor-check`: render all 14 points with names from eight viewpoints, with a control to nudge a point. Dev-only page `/anchor-editor`: choose an ID, click the model surface to move the point, download `anchors.json`. Neither ships in the production build.
- **Verify the points yourself:** for each anchor, set a suitable camera, take a screenshot, and judge whether the point sits on the correct body part per `GAME_SPEC.md` section 8.3. Fix misplaced positions in `anchors.json`. Repeat until all 14 are correct or three attempts per point are used.
Gates: the model looks right from all angles; points stay attached during zoom and rotation; all 14 points verified.
**CHECKPOINT B:** produce one compact page with screenshots of all 14 points with captions, and ask the user to approve or name the points to move.

### Phase 4. Full game
The complete flow of section 5: splash, player identity (validation per section 6), home, instructions, materials, gameplay, learning panel, final result, settings. Complete mechanics per sections 7 to 13: 14-word list at the bottom with active and done states, five points, feedback for correct/wrong (color plus icon plus text), wrong dots disabled per config, pulsing ring and smooth camera move only after a correct answer, hints (session and per-word limits, remaining count visible), learning panel from `vocab.json` (hide the krama inggil of `needs_validation_high` entries, show the Indonesian meaning of the example sentence), score and progress, final result with category, play-again button, credit line.
Design direction per `GAME_SPEC.md` section 14: warm batik-inspired palette, clear type, large buttons, student-friendly, high contrast, no external assets. Optional sound via simple Web Audio tones (no audio files). On phones: model on top, horizontally scrolling word list at the bottom.
Gate: one full 14-word game can be completed in a browser (prove it with a flow test or browser script) and the final score matches the formula.

### Phase 5. Polish and QA
Check widths 360, 768, 1280 px with screenshots; 48 px touch targets; keyboard and focus on buttons; error handling (model fails to load, corrupt data, WebGL unavailable) with friendly Indonesian messages; performance: report draw calls, bundle size, and an estimated frame rate; a test that `anchors.json` and `vocab.json` match; main flow tests. Fix what you find.
Gates: tests and build pass; no console errors during a full game; good layout at all three widths.

### Phase 6. Publish-ready
Short `README.md` (English: run, structure, how to replace the model and points). `vite.config.ts` with a `base` set by an environment variable. A simple `netlify.toml`. `DEPLOY_GUIDE.md` (Indonesian, plain language, step by step) for Netlify (drag the `dist/` folder) and GitHub Pages. `FINAL_REPORT.md` (Indonesian): what was built, what was and was not tested, open problems, and the list of things only humans can do (validate vocabulary with a Javanese expert, confirm model permission and credit, test on real phones, test with students, publish).
Gate: `npm run build` produces a `dist/` that works through `npm run preview`.
**CHECKPOINT C:** report the final result and the human to-do list.

### Phase 7. AR (only if `DECISIONS.md` K-01 = "yes")
WebXR `immersive-ar` with support detection; the AR button appears only if supported; placement via hit test; the same point and scoring logic; full fallback to the on-screen 3D mode. If K-01 is "no", skip and note it in `PROGRESS.md`.

## Report format at the end of every phase
Three lines in Indonesian: what is done, evidence that the gates passed (test/build results, screenshots), and open problems. Be brief.
