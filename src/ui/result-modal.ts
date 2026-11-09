import { COPY } from "../copy";
import { sound } from "./audio";
import { getScoreCategory } from "../core/score";
import type { SessionState, ScoreResult } from "../core/types";

export function showResultModal(
  session: SessionState,
  score: ScoreResult,
  onPlayAgain: () => void,
  onHome: () => void,
) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const category = getScoreCategory(score.raw);
  const appreciationMsg = COPY.result.message.replace("{name}", session.name);
  const creditMsg = COPY.credit.replace("{name}", "Nesya");

  let badgeColor = "#15803d";
  let badgeBg = "#dcfce7";
  if (category.key === "good") {
    badgeColor = "#0369a1";
    badgeBg = "#e0f2fe";
  } else if (category.key === "fair") {
    badgeColor = "#b45309";
    badgeBg = "#fef3c7";
  } else if (category.key === "low") {
    badgeColor = "#b91c1c";
    badgeBg = "#fee2e2";
  }

  overlay.innerHTML = `
    <div class="modal-content" style="text-align: center; max-width: 500px;" role="dialog" aria-modal="true" aria-labelledby="result-title">
      <div class="modal-header" style="justify-content: center; background: linear-gradient(135deg, #fef3c7, #fde68a);">
        <h2 id="result-title" style="color: var(--primary-dark); font-size: 1.5rem;">Hasil Permainan</h2>
      </div>

      <div class="modal-body" style="display: flex; flex-direction: column; gap: 16px; align-items: center; padding: 24px;">
        <p style="font-size: 1.05rem; font-weight: 600; color: var(--text-dark); margin: 0;">
          ${appreciationMsg}
        </p>

        <div style="background: var(--bg-warm); border: 2px dashed var(--primary-light); border-radius: var(--radius-lg); padding: 18px; width: 100%;">
          <div style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">
            Skor Akhir
          </div>
          <div style="font-size: 3.2rem; font-weight: 800; color: var(--primary-dark); line-height: 1.1; margin: 6px 0;">
            ${score.display}
          </div>
          <div style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 1.1rem; background: ${badgeBg}; color: ${badgeColor}; margin-top: 4px;">
            ${category.label}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%;">
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Benar</div>
            <div style="font-size: 1.4rem; font-weight: 700; color: var(--color-correct);">${session.correct}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Salah</div>
            <div style="font-size: 1.4rem; font-weight: 700; color: var(--color-wrong);">${session.wrong}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Bantuan</div>
            <div style="font-size: 1.4rem; font-weight: 700; color: #4338ca;">${session.hintsUsed} / 3</div>
          </div>
        </div>

        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
          ${creditMsg}
        </div>
      </div>

      <div class="modal-footer" style="justify-content: center; gap: 14px;">
        <button id="home-btn" class="btn btn-secondary">
          ${COPY.button.home}
        </button>
        <button id="play-again-btn" class="btn btn-primary">
          ${COPY.button.playAgain}
        </button>
      </div>
    </div>
  `;

  overlay.querySelector("#play-again-btn")?.addEventListener("click", () => {
    sound.playClick();
    overlay.remove();
    onPlayAgain();
  });

  overlay.querySelector("#home-btn")?.addEventListener("click", () => {
    sound.playClick();
    overlay.remove();
    onHome();
  });

  document.body.appendChild(overlay);
}
