import { COPY } from "../copy";
import { sound } from "./audio";
import type { VocabWord } from "../core/types";

export function showInstructionsModal(onClose: () => void) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="instr-title">
      <div class="modal-header">
        <h2 id="instr-title">${COPY.instructions.title}</h2>
        <button class="btn-icon close-btn" aria-label="Tutup">✕</button>
      </div>
      <div class="modal-body">
        <ol style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 10px;">
          ${COPY.instructions.steps.map((step) => `<li>${step}</li>`).join("")}
        </ol>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary close-footer-btn">${COPY.button.next}</button>
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
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
}

export function showSettingsModal(options: {
  isSoundOn: boolean;
  isLargeText: boolean;
  onToggleSound: (on: boolean) => void;
  onToggleTextSize: (large: boolean) => void;
  onRestart: () => void;
  onClose: () => void;
}) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div class="modal-header">
        <h2 id="settings-title">${COPY.settings.title}</h2>
        <button class="btn-icon close-btn" aria-label="Tutup">✕</button>
      </div>
      <div class="modal-body" style="display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
          <div>
            <div style="font-weight: 600;">${COPY.settings.sound}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Efek suara saat menjawab dan memilih</div>
          </div>
          <button id="sound-toggle-btn" class="btn btn-secondary" style="min-width: 90px;">
            ${options.isSoundOn ? COPY.settings.soundOn : COPY.settings.soundOff}
          </button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
          <div>
            <div style="font-weight: 600;">${COPY.settings.textSize}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Perbesar ukuran teks antarmuka</div>
          </div>
          <button id="text-toggle-btn" class="btn btn-secondary" style="min-width: 90px;">
            ${options.isLargeText ? COPY.settings.textLarge : COPY.settings.textNormal}
          </button>
        </div>

        <div style="padding-top: 6px;">
          <button id="restart-btn" class="btn btn-secondary" style="width: 100%; color: var(--color-wrong); border-color: var(--color-wrong);">
            ${COPY.settings.restart}
          </button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary close-footer-btn">${COPY.button.next}</button>
      </div>
    </div>
  `;

  let currentSound = options.isSoundOn;
  let currentLarge = options.isLargeText;

  const soundBtn = overlay.querySelector("#sound-toggle-btn") as HTMLButtonElement;
  soundBtn.addEventListener("click", () => {
    currentSound = !currentSound;
    soundBtn.innerText = currentSound ? COPY.settings.soundOn : COPY.settings.soundOff;
    options.onToggleSound(currentSound);
    sound.playClick();
  });

  const textBtn = overlay.querySelector("#text-toggle-btn") as HTMLButtonElement;
  textBtn.addEventListener("click", () => {
    currentLarge = !currentLarge;
    textBtn.innerText = currentLarge ? COPY.settings.textLarge : COPY.settings.textNormal;
    options.onToggleTextSize(currentLarge);
    sound.playClick();
  });

  const restartBtn = overlay.querySelector("#restart-btn") as HTMLButtonElement;
  restartBtn.addEventListener("click", () => {
    if (confirm(COPY.settings.restartConfirm)) {
      overlay.remove();
      options.onRestart();
    }
  });

  function close() {
    sound.playClick();
    overlay.remove();
    options.onClose();
  }

  overlay.querySelector(".close-btn")?.addEventListener("click", close);
  overlay.querySelector(".close-footer-btn")?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
}

export function showMaterialsModal(words: VocabWord[], onClose: () => void) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-content" style="max-width: 640px;" role="dialog" aria-modal="true" aria-labelledby="mat-title">
      <div class="modal-header">
        <h2 id="mat-title">${COPY.materials.title} (14 Bagian Tubuh)</h2>
        <button class="btn-icon close-btn" aria-label="Tutup">✕</button>
      </div>
      <div class="modal-body" style="display: flex; flex-direction: column; gap: 16px;">
        ${words
          .map((w, idx) => {
            const isUnconfirmed = w.validation_status === "needs_validation_high";
            const kramaInggilVal = isUnconfirmed ? `<em>(${COPY.materials.notAvailable})</em>` : w.krama_inggil;
            return `
            <div style="background: #ffffff; padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h3 style="margin: 0; color: var(--primary-dark); font-size: 1.15rem;">${idx + 1}. ${w.word} (${w.body_part})</h3>
                <span style="font-size: 0.8rem; background: var(--accent-light); color: var(--primary-dark); padding: 2px 8px; border-radius: 12px; font-weight: 600; text-transform: uppercase;">
                  ${w.region}
                </span>
              </div>
              <p style="margin: 8px 0; font-size: 0.9rem;">${w.definition}</p>
              
              <table class="speech-level-table" style="font-size: 0.85rem; margin: 8px 0;">
                <tr>
                  <th>${COPY.materials.ngoko}</th>
                  <th>${COPY.materials.krama}</th>
                  <th>${COPY.materials.kramaInggil}</th>
                </tr>
                <tr>
                  <td>${w.ngoko}</td>
                  <td>${w.krama}</td>
                  <td>${kramaInggilVal}</td>
                </tr>
              </table>

              <div class="example-box" style="font-size: 0.85rem; margin-top: 8px;">
                <div style="font-style: italic; color: var(--text-dark);">"${w.example.javanese}"</div>
                <div style="color: var(--text-muted); margin-top: 4px;"><strong>${COPY.materials.meaning}:</strong> ${w.example.indonesian}</div>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary close-footer-btn">${COPY.button.next}</button>
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
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
}
