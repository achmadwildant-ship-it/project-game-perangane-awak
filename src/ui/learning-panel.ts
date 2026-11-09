import { COPY } from "../copy";
import { sound } from "./audio";
import type { VocabWord } from "../core/types";

export function showLearningPanel(word: VocabWord, onClose: () => void) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const isUnconfirmed = word.validation_status === "needs_validation_high";
  const kramaInggilDisplay = isUnconfirmed
    ? `<em>(${COPY.materials.notAvailable})</em>`
    : word.krama_inggil;

  overlay.innerHTML = `
    <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="learn-title">
      <div class="modal-header" style="background: linear-gradient(135deg, #fef3c7, #fde68a);">
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary-dark); text-transform: uppercase; letter-spacing: 0.05em;">
            Materi Pembelajaran
          </div>
          <h2 id="learn-title" style="margin: 2px 0 0; color: var(--primary-dark); font-size: 1.4rem;">
            ${word.word} (${word.body_part})
          </h2>
        </div>
        <button class="btn-icon close-btn" aria-label="Tutup">✕</button>
      </div>

      <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary-dark); margin-bottom: 4px;">
            ${COPY.materials.definition}
          </div>
          <p style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: var(--text-dark);">
            ${word.definition}
          </p>
        </div>

        <div>
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary-dark); margin-bottom: 6px;">
            Unggah-Ungguh Basa (Tingkat Tutur)
          </div>
          <table class="speech-level-table">
            <thead>
              <tr>
                <th>${COPY.materials.ngoko}</th>
                <th>${COPY.materials.krama}</th>
                <th>${COPY.materials.kramaInggil}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${word.ngoko}</strong></td>
                <td><strong>${word.krama}</strong></td>
                <td><strong>${kramaInggilDisplay}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary-dark); margin-bottom: 4px;">
            ${COPY.materials.example}
          </div>
          <div class="example-box">
            <div style="font-style: italic; font-size: 1rem; color: var(--primary-dark); font-weight: 500;">
              "${word.example.javanese}"
            </div>
            <div style="color: var(--text-muted); margin-top: 6px; font-size: 0.9rem;">
              <strong>${COPY.materials.meaning}:</strong> ${word.example.indonesian}
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-primary close-footer-btn" style="min-width: 120px;">
          ${COPY.button.next} →
        </button>
      </div>
    </div>
  `;

  function close() {
    sound.playClick();
    overlay.remove();
    onClose();
  }

  overlay.querySelector(".close-btn")?.addEventListener("click", close);
  overlay.querySelector(".close-footer-btn")?.addEventListener("click", close);

  document.body.appendChild(overlay);
}

