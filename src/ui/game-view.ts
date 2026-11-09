import { COPY } from "../copy";
import { sound } from "./audio";
import { showInstructionsModal, showSettingsModal, showMaterialsModal } from "./modals";
import { showLearningPanel } from "./learning-panel";
import { showResultModal } from "./result-modal";
import { createGameSceneStage, type GameSceneStage } from "../scene/stage";
import {
  createSession,
  saveSession,
  loadSession,
  clearSession,
  validateName,
  selectWord,
  setWordPoints,
  answerCorrect,
  answerWrong,
  useHint,
  isSessionComplete,
  createDebouncer,
} from "../core/session";
import { selectPoints } from "../core/distractors";
import { calculateScore } from "../core/score";
import { buildAnchorRegionMap } from "../core/data-loader";
import { MAX_NAME_LENGTH, DISABLE_WRONG_DOTS, CLICK_DEBOUNCE_MS } from "../config";
import type { VocabData, AnchorsData, SessionState, GamePoint } from "../core/types";
import * as THREE from "three";

export type ScreenState = "splash" | "identity" | "home" | "gameplay";

export class GameView {
  private container: HTMLElement;
  private vocab: VocabData;
  private anchors: AnchorsData;
  private regionMap: Record<string, any>;
  private session: SessionState | null = null;
  private currentScreen: ScreenState = "splash";
  private stage: GameSceneStage | null = null;
  private isSoundOn: boolean = true;
  private isLargeText: boolean = false;
  private debouncer = createDebouncer(CLICK_DEBOUNCE_MS);

  constructor(container: HTMLElement, vocab: VocabData, anchors: AnchorsData) {
    this.container = container;
    this.vocab = vocab;
    this.anchors = anchors;
    this.regionMap = buildAnchorRegionMap(vocab);

    // Try loading existing session
    const existing = loadSession();
    if (existing && existing.name) {
      this.session = existing;
      this.currentScreen = "home";
    }
  }

  public render() {
    this.container.innerHTML = "";
    if (this.currentScreen === "splash") {
      this.renderSplash();
    } else if (this.currentScreen === "identity") {
      this.renderIdentity();
    } else if (this.currentScreen === "home") {
      this.renderHome();
    } else if (this.currentScreen === "gameplay") {
      this.renderGameplay();
    }
  }

  // 1. Splash Screen
  private renderSplash() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 24px; text-align: center; background: radial-gradient(circle at center, #fef3c7 0%, #f6f3ea 100%);">
        <div style="max-width: 440px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 20px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-gold), var(--primary-light)); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(180,83,9,0.25);">
            <span style="font-size: 2.2rem;">👤</span>
          </div>
          <div>
            <h1 style="margin: 0; font-size: 2.3rem; color: var(--primary-dark); font-weight: 800; letter-spacing: -0.02em;">
              ${COPY.splash.title}
            </h1>
            <p style="margin: 10px 0 0; font-size: 1.1rem; color: var(--text-muted); line-height: 1.4;">
              ${COPY.splash.subtitle}
            </p>
          </div>
          
          <button id="splash-enter-btn" class="btn btn-primary" style="width: 100%; font-size: 1.15rem; margin-top: 10px;">
            ${COPY.splash.enter} →
          </button>

          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 20px;">
            ${COPY.credit.replace("{name}", "Nesya")}
          </div>
        </div>
      </div>
    `;

    this.container.querySelector("#splash-enter-btn")?.addEventListener("click", () => {
      sound.playClick();
      if (this.session && this.session.name) {
        this.currentScreen = "home";
      } else {
        this.currentScreen = "identity";
      }
      this.render();
    });
  }

  // 2. Player Identity Screen
  private renderIdentity() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 24px; background: var(--bg-warm);">
        <div style="max-width: 420px; width: 100%; background: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--radius-lg); padding: 28px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 20px;">
          <div>
            <h2 style="margin: 0; color: var(--primary-dark); font-size: 1.5rem;">Identitas Pemain</h2>
            <p style="margin: 6px 0 0; color: var(--text-muted); font-size: 0.9rem;">
              Masukkan namamu untuk memulai sesi belajar.
            </p>
          </div>

          <div>
            <label for="player-name-input" style="display: block; font-weight: 600; font-size: 0.95rem; margin-bottom: 8px;">
              ${COPY.name.label}
            </label>
            <input 
              id="player-name-input" 
              type="text" 
              maxlength="${MAX_NAME_LENGTH}" 
              placeholder="Contoh: Budi Santoso"
              value="${this.session?.name || ""}"
              style="width: 100%; min-height: 48px; padding: 10px 14px; border: 2px solid var(--border-color); border-radius: var(--radius-md); font-size: 1rem; outline: none;"
            />
            <div id="name-error-msg" style="color: var(--color-wrong); font-size: 0.85rem; font-weight: 500; margin-top: 6px; display: none;">
              ${COPY.name.error}
            </div>
          </div>

          <button id="start-game-btn" class="btn btn-primary" style="width: 100%; font-size: 1.1rem;">
            ${COPY.button.start}
          </button>
        </div>
      </div>
    `;

    const input = this.container.querySelector("#player-name-input") as HTMLInputElement;
    const errorEl = this.container.querySelector("#name-error-msg") as HTMLElement;
    const startBtn = this.container.querySelector("#start-game-btn") as HTMLButtonElement;

    input.focus();

    const handleStart = () => {
      const valid = validateName(input.value, MAX_NAME_LENGTH);
      if (!valid) {
        errorEl.style.display = "block";
        input.style.borderColor = "var(--color-wrong)";
        return;
      }

      errorEl.style.display = "none";
      sound.playClick();

      // Create new session
      const wordIds = this.vocab.words.map((w) => w.id);
      this.session = createSession(valid, wordIds);
      saveSession(this.session);

      this.currentScreen = "home";
      this.render();
    };

    startBtn.addEventListener("click", handleStart);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleStart();
    });
  }

  // 3. Home Screen
  private renderHome() {
    const studentName = this.session?.name || "Siswa";
    const doneCount = this.session
      ? Object.values(this.session.words).filter((w) => w.status === "done").length
      : 0;

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 24px; background: var(--bg-warm);">
        <div style="max-width: 440px; width: 100%; display: flex; flex-direction: column; gap: 16px;">
          <div style="background: var(--bg-card); border: 2px solid var(--primary-light); border-radius: var(--radius-lg); padding: 20px 24px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            <div style="font-size: 0.9rem; color: var(--text-muted);">Sugeng rawuh,</div>
            <h2 style="margin: 4px 0 8px; color: var(--primary-dark); font-size: 1.6rem;">${studentName}</h2>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--primary-light);">
              Progres: ${doneCount} dari 14 bagian tubuh selesai
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button id="home-play-btn" class="btn btn-primary" style="font-size: 1.15rem; padding: 14px;">
              ▶ ${COPY.home.play}
            </button>
            <button id="home-instr-btn" class="btn btn-secondary">
              📖 ${COPY.home.instructions}
            </button>
            <button id="home-mat-btn" class="btn btn-secondary">
              📚 ${COPY.home.materials}
            </button>
            <button id="home-settings-btn" class="btn btn-secondary">
              ⚙ ${COPY.home.settings}
            </button>
          </div>

          <button id="change-name-btn" style="background: none; border: none; color: var(--text-muted); font-size: 0.85rem; cursor: pointer; text-decoration: underline; margin-top: 8px;">
            Ganti Nama Pemain
          </button>
        </div>
      </div>
    `;

    this.container.querySelector("#home-play-btn")?.addEventListener("click", () => {
      sound.playClick();
      this.currentScreen = "gameplay";
      this.render();
    });

    this.container.querySelector("#home-instr-btn")?.addEventListener("click", () => {
      sound.playClick();
      showInstructionsModal(() => {});
    });

    this.container.querySelector("#home-mat-btn")?.addEventListener("click", () => {
      sound.playClick();
      showMaterialsModal(this.vocab.words, () => {});
    });

    this.container.querySelector("#home-settings-btn")?.addEventListener("click", () => {
      sound.playClick();
      showSettingsModal({
        isSoundOn: this.isSoundOn,
        isLargeText: this.isLargeText,
        onToggleSound: (on) => {
          this.isSoundOn = on;
          sound.setEnabled(on);
        },
        onToggleTextSize: (large) => {
          this.isLargeText = large;
          document.body.classList.toggle("large-text", large);
        },
        onRestart: () => {
          if (this.session) {
            clearSession();
            const wordIds = this.vocab.words.map((w) => w.id);
            this.session = createSession(this.session.name, wordIds);
            saveSession(this.session);
            this.render();
          }
        },
        onClose: () => {},
      });
    });

    this.container.querySelector("#change-name-btn")?.addEventListener("click", () => {
      sound.playClick();
      this.currentScreen = "identity";
      this.render();
    });
  }

  // 4. Gameplay View
  private renderGameplay() {
    if (!this.session) return;

    // Pick first unfinished word if no active word
    if (!this.session.activeWordId) {
      const firstTodo = this.vocab.words.find(
        (w) => this.session!.words[w.id]?.status !== "done",
      );
      this.session = selectWord(this.session, firstTodo ? firstTodo.id : this.vocab.words[0]!.id);
      saveSession(this.session);
    }

    const currentWord = this.vocab.words.find((w) => w.id === this.session!.activeWordId)!;
    const score = calculateScore(this.session.correct, this.session.wrong);

    this.container.innerHTML = `
      <div style="width: 100vw; height: 100vh; position: relative; overflow: hidden; display: flex; flex-direction: column;">
        
        <!-- Top HUD Header -->
        <header style="position: absolute; top: 0; left: 0; right: 0; height: 64px; background: rgba(246, 243, 234, 0.95); backdrop-filter: blur(6px); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 30;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="game-home-btn" class="btn btn-secondary" style="min-height: 40px; padding: 6px 12px; font-size: 0.9rem;" title="${COPY.button.home}">
              🏠 <span class="hide-sm">${COPY.button.home}</span>
            </button>
            <button id="reset-view-btn" class="btn btn-secondary" style="min-height: 40px; padding: 6px 12px; font-size: 0.9rem;" title="${COPY.button.resetView}">
              🔄 <span class="hide-sm">${COPY.button.resetView}</span>
            </button>
          </div>

          <!-- Active Question Banner (Center) -->
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">
              Cari bagian tubuh:
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary-dark);">
              ${currentWord.word} <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-muted);">(${currentWord.body_part})</span>
            </div>
          </div>

          <!-- Stats (Score & Hints) -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="text-align: right;">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${COPY.game.score}</div>
              <div id="live-score-text" style="font-size: 1.15rem; font-weight: 700; color: var(--primary-dark);">${score.display}</div>
            </div>

            <button id="game-hint-btn" class="btn btn-secondary" style="min-height: 40px; padding: 6px 12px; display: flex; align-items: center; gap: 4px; font-size: 0.85rem;" title="${COPY.button.hint}">
              💡 <span>${COPY.button.hint} (${this.session.hintsLeft})</span>
            </button>

            <button id="game-settings-btn" class="btn-icon" style="width: 40px; height: 40px;" title="Pengaturan">
              ⚙
            </button>
          </div>
        </header>

        <!-- Feedback Banner Container -->
        <div id="feedback-container"></div>

        <!-- 3D Canvas Stage Container -->
        <div id="game-stage-container" style="flex: 1; width: 100%; position: relative;"></div>

        <!-- Bottom Word Tray -->
        <div class="word-tray">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 4px;">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary-dark); text-transform: uppercase;">
              ${COPY.game.wordListTitle} (${this.session.correct}/14 Selesai)
            </span>
          </div>
          <div class="word-list" id="word-pill-list"></div>
        </div>
      </div>
    `;

    // Render word pills
    this.renderWordPills();

    // Attach Header Listeners
    this.container.querySelector("#game-home-btn")?.addEventListener("click", () => {
      sound.playClick();
      this.currentScreen = "home";
      this.render();
    });

    this.container.querySelector("#reset-view-btn")?.addEventListener("click", () => {
      sound.playClick();
      if (this.stage) {
        this.stage.cameraManager.resetView();
      }
    });

    this.container.querySelector("#game-hint-btn")?.addEventListener("click", () => {
      this.handleHintClick();
    });

    this.container.querySelector("#game-settings-btn")?.addEventListener("click", () => {
      sound.playClick();
      showSettingsModal({
        isSoundOn: this.isSoundOn,
        isLargeText: this.isLargeText,
        onToggleSound: (on) => {
          this.isSoundOn = on;
          sound.setEnabled(on);
        },
        onToggleTextSize: (large) => {
          this.isLargeText = large;
          document.body.classList.toggle("large-text", large);
        },
        onRestart: () => {
          if (this.session) {
            clearSession();
            const wordIds = this.vocab.words.map((w) => w.id);
            this.session = createSession(this.session.name, wordIds);
            saveSession(this.session);
            this.render();
          }
        },
        onClose: () => {},
      });
    });

    // Initialize 3D Scene Stage
    const stageContainer = this.container.querySelector("#game-stage-container") as HTMLElement;
    createGameSceneStage({
      container: stageContainer,
      onPointClick: (pointId) => {
        this.handlePointClick(pointId);
      },
    }).then((stage) => {
      this.stage = stage;
      this.updateActiveWordPoints();
    });
  }

  private renderWordPills() {
    const listEl = this.container.querySelector("#word-pill-list");
    if (!listEl || !this.session) return;

    listEl.innerHTML = "";
    for (const w of this.vocab.words) {
      const state = this.session.words[w.id];
      const isActive = w.id === this.session.activeWordId;
      const isDone = state?.status === "done";

      const btn = document.createElement("button");
      btn.className = `word-pill ${isActive ? "active" : ""} ${isDone ? "done" : ""}`;
      btn.innerHTML = `${isDone ? "✓ " : ""}${w.word}`;
      btn.setAttribute("aria-label", `${w.word} (${w.body_part})`);

      btn.addEventListener("click", () => {
        if (!this.debouncer()) return;
        sound.playClick();
        this.session = selectWord(this.session!, w.id);
        saveSession(this.session);
        this.renderGameplay();
      });

      listEl.appendChild(btn);
    }
  }

  private updateActiveWordPoints() {
    if (!this.stage || !this.session || !this.session.activeWordId) return;

    const wordId = this.session.activeWordId;
    const wordState = this.session.words[wordId];
    if (!wordState) return;

    const currentWord = this.vocab.words.find((w) => w.id === wordId)!;
    const anchorKey = currentWord.anchor_id.replace(/^anchor_/, "");

    // Get or generate the 5 points for this word (once per session per word)
    let points: GamePoint[];
    if (wordState.points && wordState.points.length === 5) {
      points = wordState.points;
    } else {
      points = selectPoints(
        anchorKey,
        currentWord.region,
        this.anchors.anchors,
        this.regionMap,
      );
      this.session = setWordPoints(this.session, wordId, points);
      saveSession(this.session);
    }

    // Map game points to 3D positions
    const hotspotsData = points.map((p) => {
      const anchor = this.anchors.anchors[p.id]!;
      return {
        id: p.id,
        label: p.label,
        position: anchor.position as [number, number, number],
      };
    });

    this.stage.hotspots.setPoints(hotspotsData);
    this.stage.hotspots.setDisabledPoints(wordState.disabledPointIds);

    // If word is already answered, highlight the correct point
    if (wordState.status === "done") {
      this.stage.hotspots.setHighlightPoint(anchorKey);
    } else {
      this.stage.hotspots.setHighlightPoint(null);
    }
  }

  private handlePointClick(clickedId: string) {
    if (!this.debouncer()) return;
    if (!this.session || !this.session.activeWordId) return;

    const wordId = this.session.activeWordId;
    const wordState = this.session.words[wordId];
    if (!wordState || wordState.status === "done") return;

    const currentWord = this.vocab.words.find((w) => w.id === wordId)!;
    const correctAnchorId = currentWord.anchor_id.replace(/^anchor_/, "");

    if (clickedId === correctAnchorId) {
      // 1. Correct Answer
      sound.playCorrect();
      this.session = answerCorrect(this.session, wordId);
      saveSession(this.session);

      // Highlight correct dot
      this.stage?.hotspots.setHighlightPoint(clickedId);

      // Smooth camera move toward answered body part (Anti-leak rule: ONLY AFTER correct answer!)
      const correctAnchor = this.anchors.anchors[correctAnchorId]!;
      const targetVec = new THREE.Vector3(...correctAnchor.position);
      this.stage?.cameraManager.focusOnPoint(targetVec, 700);

      this.showFeedback(true, COPY.feedback.correct);

      // Open learning panel after short delay
      setTimeout(() => {
        showLearningPanel(currentWord, () => {
          // Check if all 14 words are complete
          if (isSessionComplete(this.session!)) {
            const finalScore = calculateScore(this.session!.correct, this.session!.wrong);
            showResultModal(
              this.session!,
              finalScore,
              () => {
                // Play again
                clearSession();
                const wordIds = this.vocab.words.map((w) => w.id);
                this.session = createSession(this.session!.name, wordIds);
                saveSession(this.session);
                this.renderGameplay();
              },
              () => {
                // Return Home
                this.currentScreen = "home";
                this.render();
              },
            );
          } else {
            // Auto advance to next unfinished word
            const nextUnfinished = this.vocab.words.find(
              (w) => this.session!.words[w.id]?.status !== "done",
            );
            if (nextUnfinished) {
              this.session = selectWord(this.session!, nextUnfinished.id);
              saveSession(this.session);
            }
            this.renderGameplay();
          }
        });
      }, 700);
    } else {
      // 2. Wrong Answer
      sound.playWrong();
      this.session = answerWrong(this.session, wordId, clickedId, DISABLE_WRONG_DOTS);
      saveSession(this.session);

      this.showFeedback(false, COPY.feedback.wrong);

      if (this.stage && DISABLE_WRONG_DOTS) {
        this.stage.hotspots.setDisabledPoints(this.session.words[wordId]!.disabledPointIds);
      }

      // Update live score display
      const score = calculateScore(this.session.correct, this.session.wrong);
      const scoreEl = this.container.querySelector("#live-score-text") as HTMLElement | null;
      if (scoreEl) scoreEl.innerText = score.display;
    }
  }

  private handleHintClick() {
    if (!this.session || !this.session.activeWordId) return;
    const wordId = this.session.activeWordId;
    const currentWord = this.vocab.words.find((w) => w.id === wordId)!;

    const updated = useHint(this.session, wordId);
    if (!updated) {
      if (this.session.hintsLeft <= 0) {
        alert("Bantuan kamu sudah habis untuk sesi permainan ini (maksimal 3 kali).");
      } else if (this.session.words[wordId]?.hintUsed) {
        alert("Bantuan untuk kata ini sudah pernah digunakan (maksimal 1 kali per kata).");
      }
      return;
    }

    sound.playHint();
    this.session = updated;
    saveSession(this.session);

    // Update remaining hint button text
    const hintBtn = this.container.querySelector("#game-hint-btn span") as HTMLElement | null;
    if (hintBtn) {
      hintBtn.innerText = `${COPY.button.hint} (${this.session.hintsLeft})`;
    }

    // Display Hint modal / popup
    alert(`💡 Bantuan untuk "${currentWord.word}":\n\n${currentWord.hint}`);
  }

  private showFeedback(isCorrect: boolean, text: string) {
    const feedbackBox = this.container.querySelector("#feedback-container");
    if (!feedbackBox) return;

    feedbackBox.innerHTML = `
      <div class="feedback-banner ${isCorrect ? "feedback-correct" : "feedback-wrong"}">
        <span>${isCorrect ? "✓" : "✗"}</span>
        <span>${text}</span>
      </div>
    `;

    setTimeout(() => {
      feedbackBox.innerHTML = "";
    }, 2800);
  }
}
