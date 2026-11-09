# Perangane Awak (3D Javanese Body Parts Educational Game)

An educational interactive web game teaching 14 Javanese body-part words using a 3D character model.

## Features
- **Interactive 3D Model**: Real-time 3D character with orbit controls, natural PBR lighting, and smooth animated viewpoints.
- **Raycast Occlusion Hotspots**: Points that are hidden behind the body automatically fade out and become unclickable.
- **Dynamic Distractor Engine**: Every question selects 5 points (1 correct and 4 distractors) with minimum spatial separation (0.15 units) and regional diversity.
- **Complete Educational Flow**: Splash screen, player identity input, home menu, instructions, materials review, full gameplay HUD, learning panel with Javanese example sentences and Indonesian translations, and final scorecard.
- **Synthesized Audio**: Sound effects generated entirely via the Web Audio API without external audio assets.
- **Built-in Developer Tools**: Dedicated routes for anchor visualization (`/#anchor-check`), click-to-surface point editing (`/#anchor-editor`), and verification screenshot gallery (`/#anchor-verify`).

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Run Tests
```bash
npm run test
```

### Production Build
```bash
npm run build
```
Output is generated in `dist/`.

### Preview Production Build
```bash
npm run preview
```

## Project Structure
```
perangane-awak/
├── data/
│   ├── vocab.json          # 14 Javanese vocabulary entries & metadata
│   └── anchors.json        # Normalized 3D coordinates for all 14 body parts
├── public/
│   └── model/
│       └── karakter-wildan-byNesya.glb # Character 3D GLTF/GLB model
├── src/
│   ├── config.ts           # All tunable constants & thresholds
│   ├── copy.ts             # All student-facing Indonesian & Javanese text
│   ├── main.ts             # Application entry point and router
│   ├── core/               # Pure business logic (no DOM, no Three.js)
│   │   ├── types.ts        # TypeScript interfaces and types
│   │   ├── score.ts        # Scoring formula and category evaluation
│   │   ├── distractors.ts  # 5-point random distractor selection algorithm
│   │   ├── session.ts      # Session state machine and persistence
│   │   └── data-loader.ts  # JSON data loader and schema validator
│   ├── scene/              # Three.js 3D rendering engine
│   │   ├── loader.ts       # GLTF loader and normalization
│   │   ├── camera.ts       # OrbitControls and smooth animated camera
│   │   ├── hotspots.ts     # Screen projection, raycast occlusion, touch picking
│   │   └── stage.ts        # Scene setup, natural lighting, animation loop
│   ├── ui/                 # UI components and pages
│   │   ├── audio.ts        # Web Audio API sound synthesizer
│   │   ├── styles.css      # Warm batik-inspired responsive styling
│   │   ├── modals.ts       # Instructions, Materials, and Settings modals
│   │   ├── learning-panel.ts # Post-answer educational explanation modal
│   │   ├── result-modal.ts # Final score breakdown and play-again modal
│   │   └── game-view.ts    # Main gameplay UI coordinator
│   └── dev/                # Developer-only tools
│       ├── anchor-check.ts # 8-viewpoint anchor inspection & nudging
│       ├── anchor-editor.ts# Surface-click anchor coordinate editor
│       └── anchor-verify.ts# Visual 14-point screenshot gallery
└── tests/                  # Vitest automated test suites
```

## How to Replace the 3D Model and Update Points
1. Place your new `.glb` file inside `public/model/` (keep the file size under 5 MB for optimal mobile loading).
2. Update `MODEL_PATH` in `src/config.ts` if the file name changes.
3. Open `http://localhost:5173/#/anchor-editor` in your browser.
4. Select each body part from the dropdown and click on the corresponding surface of your new 3D model.
5. Click **"Unduh anchors.json yang Diperbarui"** to download the new coordinate file and replace `data/anchors.json`.
6. Run `npm run test` to ensure all 14 points meet the separation and spatial bounds requirements.

