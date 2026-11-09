# Perangane Awak: Development Specification (Web) v1.0

An educational web game that teaches 14 Javanese body-part words using an interactive 3D human model. This document merges the original design ("Kerangka Game Perangane Awak", a Word document written in Indonesian) with the developer's corrections and additions. It is the authoritative specification for the implementing agent.

## 0. How to read this document

**Language policy.**
- All code, identifiers, comments, tests, commit messages, and developer documentation: **English**.
- All text the student sees (UI labels, feedback, instructions, learning content): **Indonesian**, with Javanese vocabulary and Javanese feedback phrases, exactly as given in section 21 and in `data/vocab.json`. Never translate student-facing text to English and never invent new Javanese content.
- Messages to the human user, `FINAL_REPORT.md`, and `DEPLOY_GUIDE.md`: Indonesian (plain language).

**Provenance tags.** Every item is tagged:
- **[ORIGINAL]** comes from the original design document and is kept.
- **[PROPOSAL]** is an addition or change by the developer. It is the default until the designer approves or rejects it (see section 16 and `DECISIONS.md`).
- **[CONFIG]** is a value that lives in `src/config.ts` and can change without touching logic.

**Data files.** `data/vocab.json` (learning content) and `data/anchors.json` (3D positions of the 14 points). Schemas are in section 17.4.

## 1. Game identity [ORIGINAL]

| Component | Description |
|---|---|
| Name | Perangane Awak |
| Type | Educational game / interactive learning media |
| Content | 14 Javanese body-part words |
| Visual technology | 3D human model on screen; AR mode where the device supports it |
| Audience | Students (peserta didik) |
| Core interaction | Pick a word, then match it to a coordinate point on the 3D model |
| Result | Recap of answers, mistakes, hints used, and a final score of at most 100 |
| Platform [PROPOSAL] | **Web only**, responsive for phone and desktop, no server, no database |

## 2. Learning goals [ORIGINAL]

1. Recognize Javanese names of body parts.
2. Expand vocabulary across ngoko, krama, and krama inggil speech levels in context.
3. Connect each word to the location of the body part on the model.
4. Understand the meaning and general function of each body part.
5. Recognize each word used in a simple example sentence.

## 3. 3D model and controls

### 3.1 Character [ORIGINAL]
Adult male 3D character, proportional anatomy, plain T-shirt and shorts, no traditional clothing. Starting pose: standing upright facing forward, both hands slightly open so body parts are easy to observe.

### 3.2 Model file requirements [PROPOSAL]
- Format `.glb` at `public/model/karakter-wildan-byNesya.glb`, target under 5 MB, textures at most 2048 px, roughly 20k to 60k triangles.
- **Barefoot**, so the sole (Ampeyan) can be targeted.
- Ears, nose, lips, fingers, knees, and feet are clearly formed and visible from reasonable angles.
- No unnecessary anatomical detail.
- Static model: no animation, no rig.
- **Normalize on load** with a fixed formula: `scale = 1.75 / original_height`; center x and z on the bounding-box center; shift so minimum y = 0 (soles on the floor); the model faces +Z. All coordinates in `data/anchors.json` use this normalized space. The numbers for the current model are stored in `anchors.json` under `normalization`.

**Actual model (measured from `karakter-wildan-byNesya.glb`):** one node, one mesh, one PBR material, three 2048 px JPEG textures (base color, ORM, normal), 15,407 vertices, 19,450 triangles, about 1.5 MB, no animation, no skin, faces +Z, original height 1.717, arm span 1.132, depth 0.308, original origin at mid-body. The ORM metallic channel is near zero, so skin does not render as metal. See `MODEL_REPORT.md`. Do not alter the mesh, material, or textures without approval.

### 3.3 Model manipulation [ORIGINAL]

| Feature | Function |
|---|---|
| Zoom in / out | Enlarge or shrink the view |
| Rotate left/right | Orbit horizontally |
| Rotate up/down | Change the vertical viewing angle |
| Reset view | Return to the initial position and size |

Additions [PROPOSAL]: constrain the camera (minimum and maximum distance; vertical angle from about 25 degrees below the floor line, so soles can be seen, up to about 80 degrees above; pan disabled); animated smooth reset; support two-finger touch on phones and mouse on desktop.

**Anti-leak rule [PROPOSAL]:** after a word is selected the camera must never move automatically toward the answer. It may move toward the answer only after a correct answer.

### 3.4 AR note [ORIGINAL]
An interactive 3D model on screen is not automatically AR. AR is a separate feature. On the web it uses WebXR `immersive-ar`, which only some devices and browsers support (mainly Android with Chrome; iPhone generally not). Decision [PROPOSAL]: **3D-on-screen is the main and mandatory mode. AR is optional, built last, and the AR button appears only if support is detected.** AR is built only if `DECISIONS.md` K-01 is "yes".

## 4. Vocabulary and interaction objects [ORIGINAL]

| No | Word | Body part (Indonesian) | No | Word | Body part (Indonesian) |
|---|---|---|---|---|---|
| 1 | Rikma | Rambut | 8 | Padharan | Perut |
| 2 | Mustaka | Kepala | 9 | Asta | Tangan |
| 3 | Soca | Mata | 10 | Racikan | Kaki |
| 4 | Grana | Hidung | 11 | Jaja | Dada |
| 5 | Lathi | Bibir/mulut | 12 | Ampeyan | Telapak kaki |
| 6 | Jangga | Leher | 13 | Jengku | Lutut |
| 7 | Talingan | Telinga | 14 | Pamidhangan | Bahu |

All content is in `data/vocab.json`. Entries whose `validation_status` is `needs_validation_high` (Racikan and Ampeyan) hold unconfirmed assumptions: **never show their krama inggil value to students** (the word itself stays in the game and stays selectable). A reference dictionary must be chosen by the designer.

## 5. App flow [ORIGINAL]

1. Splash screen
2. Player identity
3. Home
4. Instructions and Materials
5. Gameplay (3D / AR model)
6. Learning panel after a correct answer
7. Final result
8. Play again or return home

## 6. Player identity [ORIGINAL]

Name field is required and must not contain only whitespace. "Start" is disabled when the name is empty. The name persists for the session. On replay the student keeps the previous name or changes it.

Additions [PROPOSAL]: trim whitespace, maximum 30 characters, store in `sessionStorage` (no server).

## 7. Core gameplay

### 7.1 Steps [ORIGINAL]
1. The student selects one of 14 words from the list at the bottom of the screen. The selected word becomes the active word. While a question is active, the UI must show ONLY the Javanese word (e.g. "Rikma"), never its Indonesian meaning (DECISIONS.md K-14).
2. The system shows five points: one correct and four distractors.
3. Distractors and visual markers (order/labels) are randomized per question. The anatomical positions themselves are never randomized.
4. The student may zoom and rotate freely at any time, including while points are visible.
5. The student taps one point.
6. The system compares the **point ID**, not the displayed number.
7. Wrong: warning, points deducted, the student may retry the same word.
8. Correct: the question locks, points are added, the body part is highlighted, the learning panel appears.
9. After the panel closes the student moves on until all 14 words are done.

### 7.2 Additions [PROPOSAL]
- The student may switch to another word before answering correctly. Mistakes already made stay recorded.
- The five-point set for a word is generated **once per session** and stored, so it does not change when the student switches words and returns.
- Rapid double taps are not counted twice (400 ms debounce).
- Session state is kept in `sessionStorage`, so a page reload does not erase progress.

### 7.3 Session state (shape)
```
session = {
  name, startedAt,
  hintsLeft: 3,
  correct: 0,            // B
  wrong: 0,              // S
  hintsUsed: 0,
  words: {
    [id]: { status: "todo" | "done", wrong: 0, hintUsed: false,
            points: [{ id, label }], disabledPointIds: [id] }
  }
}
```

## 8. Coordinate points

### 8.1 Point data [PROPOSAL]
Each body part's coordinates are stored in `data/anchors.json` in the normalized model space. They are created with the dev tool `/anchor-editor` (select an ID, click the model surface, save). Points therefore do not need to exist inside the `.glb`, and replacing the model only means redoing the points.

### 8.2 Rules [ORIGINAL, adjusted]
- Every body part has one primary point bound to the 3D model, following zoom and rotation.
- Five points are shown: one correct and four distractors chosen randomly from other valid body parts.
- Points must not be so close that they are hard to tell apart or overlap.
- A point that is occluded by model geometry or not selectable from the current viewpoint is not clickable.
- After a correct answer the point is disabled and the learning panel opens.

### 8.3 Changes to the original design [PROPOSAL]
**Clothing.** The original forbids points on clothing-covered areas. But Jaja (chest), Padharan (abdomen), and Pamidhangan (shoulder) are covered by the T-shirt. New rule: a point may sit on the clothing surface above the intended body part. A point hidden behind *other model geometry* from the current camera stays unclickable.

**Areas, not pixel points.** Visual dot diameter about 30 px, touch area at least 48 px. Selection uses the nearest projected dot within range (the finger need not be exact).

**Occlusion detection.** Every frame, cast a ray from the camera to each point. If the ray hits model surface before reaching the point (distance shorter than point distance minus a tolerance), the dot is rendered faded and is not clickable.

**Distractor selection.** Pure function in `src/core/`, unit-tested:
1. Candidates: the 13 body parts other than the correct one.
2. Drop candidates closer than `MIN_SEPARATION` (0.15) to the correct point [CONFIG].
3. Pick four at random such that every pair of picks is at least `MIN_SEPARATION` apart, and at least two picks come from a `region` different from the correct answer's region.
4. If that fails, lower the separation step by step to `MIN_SEPARATION_FALLBACK` (0.10) [CONFIG] and log the event in development.
5. Label the five points A to E (or 1 to 5) in random order. Labels are only visual markers and are never used for scoring.

Anatomy note: the head region has six close points (Rikma, Mustaka, Soca, Grana, Lathi, Talingan). The separation rule guarantees that at most one or two of them appear together. Verified with the current `anchors.json`: 14,000 random trials (1,000 per word) all succeeded at 0.15 without fallback. The closest pair is Grana and Lathi (0.039), so they never appear together.

**Initial placement guide:**

| ID | Location on the model |
|---|---|
| rikma | Hair surface at the top of the head |
| mustaka | Forehead and upper side of the head |
| soca | Eye (choose one eye, consistently) |
| grana | Tip of the nose |
| lathi | Lips |
| jangga | Front base of the neck |
| talingan | Ear |
| padharan | Abdomen above the navel, on the shirt |
| asta | Palm of the hand (palms face forward) |
| racikan | To be settled after vocabulary validation (initial: front of the shin) |
| jaja | Chest, on the shirt |
| ampeyan | Top or arch side of the foot visible from a low side angle (the sole faces down, see K-12) |
| jengku | Knee |
| pamidhangan | Shoulder tip |

## 9. Answer attempts and feedback [ORIGINAL]

| Condition | System response |
|---|---|
| Correct | Dot turns green, success animation/text, points added, body part highlighted, learning content shown |
| Wrong | Dot turns red briefly, warning, points deducted, the student may retry the same question |
| Hint | Hint shown, remaining hints decrease by one, no point deduction |

Texts: see section 21.

**Wrong dots [PROPOSAL, CONFIG `DISABLE_WRONG_DOTS`]:** the original says the dot turns red briefly. Proposal: after a wrong tap the dot turns red and is then **disabled**, so it cannot be tapped again and penalized repeatedly. If the designer wants the original behavior exactly (red briefly, tappable again, counted every time), set the config value to `false`.

**Highlighting the body part [PROPOSAL]:** a pulsing ring at the answer point and a smooth camera move toward it, only after a correct answer (anti-leak rule).

Accessibility [PROPOSAL]: correct/wrong must not rely on color alone; add an icon (check/cross) and text.

## 10. Hints [ORIGINAL]

- At most three uses per session, only while a word is being worked on.
- A hint describes traits, function, or location without directly pointing to the answer.
- Each use reduces the remaining count by one and never reduces points.
- Remaining hints are always visible.
- Example for Mustaka: "Bagian tubuh ini berada di atas leher dan menjadi tempat tumbuhnya rambut."

Addition [PROPOSAL, CONFIG]: at most one hint per word so the three hints are spread out. Hint text comes from each entry's `hint` in `vocab.json`.

## 11. Learning panel [ORIGINAL]

Contents: body-part name, general definition, ngoko form, krama form, krama inggil form (if available and appropriate), example sentence.

Rule [ORIGINAL]: do not force three different equivalents. If two levels are identical, show them as they are (for example "sama dengan ngoko"). If an equivalent is unconfirmed, do not show it.

Additions [PROPOSAL]: show the Indonesian meaning of the example sentence; a "Lanjut" button closes the panel; the panel can be reopened from the Materials menu.

## 12. Scoring [ORIGINAL]

| Component | Rule |
|---|---|
| Words | 14 |
| Correct | 100/14, about 7.14 per word (once per word) |
| Wrong | minus 2 for every wrong tap |
| Hint | no deduction |
| Score | 0 to 100 |

```
N = max(0, min(100, (100/14 × B) − 2 × S))
```

B = number of words answered correctly, S = number of wrong taps. Display rounded to two decimals; store the unrounded value.

Required test cases [PROPOSAL]:

| B | S | N |
|---|---|---|
| 14 | 0 | 100.00 |
| 14 | 10 | 80.00 |
| 13 | 1 | 90.86 |
| 10 | 2 | 67.43 |
| 7 | 3 | 44.00 |
| 0 | 3 | 0.00 |
| 14 | 60 | 0.00 |

## 13. Final result [ORIGINAL]

Student name, final score, correct count, wrong count, hints used, and an appreciation message or learning category. Example message: "Selamat, [Nama Siswa]! Kamu telah menyelesaikan permainan Perangane Awak."

Categories [PROPOSAL, pending approval; see `DECISIONS.md` K-06]:

| Score | Category |
|---|---|
| 85 to 100 | Sae Sanget |
| 70 to 84.99 | Sae |
| 55 to 69.99 | Cekap |
| 0 to 54.99 | Kedah Sinau Malih |

Result storage [PROPOSAL]: on screen only for the session. If teachers or research need a record, add an "Unduh hasil (CSV)" button with no server (only if `DECISIONS.md` K-07 says so).

## 14. User interface [ORIGINAL]

| Page | Main elements |
|---|---|
| Splash | Title/logo, enter button |
| Player identity | Name field, start button |
| Home | Play, instructions, materials, settings |
| Instructions | How to pick a word, pick a point, control the model, use hints, understand scoring |
| Materials | List of words and explanations |
| Gameplay | 3D/AR model, active word (Javanese word only without Indonesian meaning per K-14), five points, zoom/rotate controls, hint button, progress, score |
| Learning panel | Definition, speech levels, example sentence, continue button |
| Final result | Name, score, answer statistics, hints used, play-again button |

Settings menu [PROPOSAL]: sound on/off, text size (normal/large), restart session.

Phone layout [PROPOSAL]: model fills the upper area; the 14-word list scrolls horizontally at the bottom; hint button and remaining-hint indicator in a corner; test widths 360 px to 1280 px.

Design direction [PROPOSAL]: warm palette inspired by batik (deep brown, cream, gold), clear typography, large buttons, student-friendly, good contrast, no external assets. Optional sound through simple Web Audio tones (no audio files). Credit line in the splash or result page: "Model 3D: [name]" using the name in `DECISIONS.md` (K-13).

## 15. Requirements

**Functional [ORIGINAL]**

| Code | Feature | Requirement |
|---|---|---|
| F-01 | Name input | Required before a session starts |
| F-02 | 3D model | Male, T-shirt and shorts, clear and proportional anatomy |
| F-03 | Model controls | Zoom, rotate, reset view |
| F-04 | Word selection | One active word at a time |
| F-05 | Random points | Five points: one correct, four distractors |
| F-06 | Answer check | By point ID, not display number |
| F-07 | Retry | A wrong answer does not end the question |
| F-08 | Hint | At most three per session, no leaking |
| F-09 | Learning content | Shown only after a correct answer |
| F-10 | Scoring | Record correct/wrong, compute score automatically |
| F-11 | Final result | Name and recap |
| F-12 | AR mode | Optional; camera access and placement; falls back to 3D mode |

**Non-functional [PROPOSAL]**

| Code | Requirement |
|---|---|
| N-01 | Reasonable initial load on mobile data; loading indicator while the model downloads |
| N-02 | Smooth (target 30 fps or more) on a mid-range Android phone |
| N-03 | Touch targets at least 48 px; readable text; adequate color contrast |
| N-04 | Score logic and point selection are pure functions with automated tests |
| N-05 | No server and no database; static learning data |
| N-06 | All student-facing text and learning content live in data files or one UI-copy module, never scattered through logic |

## 16. Open decisions and changes from the Word document

Authoritative values live in `DECISIONS.md`. Summary:

| Code | Item | Default |
|---|---|---|
| K-01 | AR mode | No (3D on screen only) |
| K-02 | Points on clothing | Allowed on the clothing surface |
| K-03 | Wrong dots disabled | Yes |
| K-04 | At most one hint per word | Yes |
| K-05 | Switch word before answering | Allowed |
| K-06 | Result categories | Table in section 13 |
| K-07 | Score storage/export | On-screen only |
| K-08 | Settings contents | Sound, text size, restart |
| K-09 | Reference dictionary | Not set |
| K-10 | Racikan and Ampeyan | Unconfirmed; krama inggil hidden |
| K-11 | Rounding | Two decimals |
| K-12 | Ampeyan point (sole faces down) | Top/side of foot; camera may look 25 degrees below floor |
| K-13 | Model permission and credit | Not confirmed; show credit line |

## 17. Technical architecture [PROPOSAL]

### 17.1 Stack
Vite, TypeScript (strict), Three.js, Vitest. Playwright is optional for flow tests (use browser-driven checks if available instead). No UI framework, no backend.

### 17.2 Structure
```
perangane-awak/
  AGENTS.md  GAME_SPEC.md  MAIN_PROMPT.md  DECISIONS.md  MODEL_REPORT.md
  PROGRESS.md        (created and maintained by the agent)
  data/
    vocab.json
    anchors.json
  public/model/karakter-wildan-byNesya.glb
  src/
    config.ts        all [CONFIG] constants
    copy.ts          all student-facing Indonesian text (section 21)
    core/            pure logic, no DOM, no Three.js
      score.ts  distractors.ts  session.ts  types.ts
    scene/           Three.js
      loader.ts      load and normalize the model
      camera.ts      controls and limits
      hotspots.ts    projection, occlusion, picking
    ui/              pages and components
    dev/             dev-only pages (excluded from production build)
      anchor-editor.ts  anchor-check.ts
  tests/
```

### 17.3 `src/config.ts`
```
MODEL_PATH = "/model/karakter-wildan-byNesya.glb"   // file in public/model/, keep this exact file name
WORD_COUNT = 14
WRONG_PENALTY = 2
MAX_HINTS_PER_SESSION = 3
MAX_HINTS_PER_WORD = 1
POINT_COUNT = 5
MIN_SEPARATION = 0.15
MIN_SEPARATION_FALLBACK = 0.10
MIN_DISTRACTORS_OTHER_REGION = 2
TOUCH_TARGET_PX = 48
DISABLE_WRONG_DOTS = true
CLICK_DEBOUNCE_MS = 400
```
Values must honor `DECISIONS.md` (for example K-03, K-04).

### 17.4 Data schemas
`data/vocab.json`:
```
{ meta: {...},
  words: [ { id, word, body_part, region ("head"|"torso"|"arm"|"leg"), anchor_id,
             ngoko, krama, krama_inggil, definition,
             example: { javanese, indonesian }, hint,
             validation_status ("needs_validation"|"needs_validation_high"|"validated"),
             validation_note? } ] }
```
`data/anchors.json`:
```
{ version, model, unit, note,
  normalization: { original_height, scale, original_center_x, original_center_z, original_min_y },
  anchors: { [id]: { position: [x, y, z], radius, status, note? } } }
```
The loader must validate: exactly 14 words, unique IDs, every `anchor_id` present in `anchors`, every position a finite 3-number array. Reject invalid data with a clear error.

## 18. Testing

1. **Unit (automated):** scoring formula (table in section 12), clamping at 0 and 100; distractor selection for each of the 14 words over 1,000 random seeds (always five points, exactly one correct, unique IDs, minimum separation honored, at least two from another region); name validation; hint limits; session transitions.
2. **Flow (automated or browser-driven):** empty name rejected; wrong answer deducts; correct answer opens the learning panel; hints decrease and stop at zero; final result matches the formula.
3. **Model/data:** a test asserts `anchors.json` has 14 positions matching the IDs in `vocab.json` and that the loader rejects broken data.
4. **Manual device checks (human):** phone 360 px, tablet, desktop; two-finger touch; dot legibility; model looks right from every angle.
5. **User testing (human):** a few students; note confusion. For research, add expert validation of content and media.

## 19. Deployment

The build output is a static site (`npm run build`, folder `dist/`). Host on Netlify, Vercel, or GitHub Pages. For GitHub Pages at `username.github.io/repo-name`, set `base: '/repo-name/'` through an environment variable in `vite.config.ts`. HTTPS is required (cameras and AR). No server and no database.

## 20. Final gameplay summary [ORIGINAL, adjusted]

The student enters a name and picks one of 14 body-part words. Five points appear on the 3D male model wearing a T-shirt and shorts. The student rotates, zooms in, and zooms out freely, then taps the point they think matches. A wrong answer costs two points and the student may retry. A correct answer adds about 7.14 points, highlights the body part, and opens a learning panel with the definition, speech-level equivalents, and an example sentence. Up to three hints, with no point cost. After all 14 words the system shows the name, answer recap, and a final score from 0 to 100.

## 21. Student-facing text (Indonesian, use exactly)

| Key | Text |
|---|---|
| feedback.correct | Sugeng! Wangsulan panjenengan leres! |
| feedback.wrong | Adhuh! Wangsulan panjenengan dereng leres. Coba malih. |
| result.message | Selamat, {name}! Kamu telah menyelesaikan permainan Perangane Awak. |
| result.category.best | Sae Sanget |
| result.category.good | Sae |
| result.category.fair | Cekap |
| result.category.low | Kedah Sinau Malih |
| button.start | Mulai Permainan |
| button.next | Lanjut |
| button.hint | Bantuan |
| button.reset_view | Reset Tampilan |
| button.play_again | Main Lagi |
| button.home | Beranda |
| home.play | Mulai Bermain |
| home.instructions | Petunjuk |
| home.materials | Materi |
| home.settings | Pengaturan |
| name.label | Nama siswa |
| name.error | Nama wajib diisi. |
| hint.remaining | Bantuan tersisa: {n} |
| credit | Model 3D: {name} |
| prompt.heading | Cari bagian tubuh: |

Rule K-14: During active question, prompt and word list show ONLY the Javanese word (e.g. "Rikma"), never its Indonesian meaning (never "Rikma (Rambut)"). Indonesian meaning is allowed only in the learning panel after a correct answer and on the Materials page.

Any other label the UI needs (instructions page text, settings labels, error messages) must be short, friendly Indonesian written by the agent and collected in `src/copy.ts`.
