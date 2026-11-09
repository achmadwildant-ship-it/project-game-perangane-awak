import * as THREE from "three";
import { createGameSceneStage } from "../scene/stage";
import anchorsJson from "../../data/anchors.json";
import vocabJson from "../../data/vocab.json";
import type { AnchorsData } from "../core/types";

export function renderAnchorEditor(container: HTMLElement) {
  container.innerHTML = `
    <div style="display: flex; height: 100vh; font-family: sans-serif; background: #18181b; color: #fff;">
      <div id="editor-stage" style="flex: 1; position: relative; height: 100%;">
        <div id="editor-loading" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: #222; font-size: 1.2rem;">
          Memuat Editor & Model 3D...
        </div>
      </div>
      <div style="width: 360px; background: #27272a; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; box-shadow: -2px 0 12px rgba(0,0,0,0.6); z-index: 20;">
        <h2 style="margin: 0; font-size: 1.3rem; color: #38bdf8;">Dev: Anchor Editor</h2>
        <p style="margin: 0; font-size: 0.85rem; color: #a1a1aa;">
          Pilih ID anggota badan, lalu <strong>klik langsung pada permukaan model 3D</strong> untuk memindahkan titik secara presisi.
        </p>

        <div>
          <label style="font-size: 0.85rem; font-weight: bold; color: #e4e4e7;">Pilih Bagian Tubuh (14 Kata):</label>
          <select id="editor-select-anchor" style="width: 100%; padding: 8px; margin-top: 6px; background: #3f3f46; color: #fff; border: 1px solid #52525b; border-radius: 6px; font-size: 0.95rem;">
            ${vocabJson.words
              .map((w) => {
                const key = w.anchor_id.replace(/^anchor_/, "");
                return `<option value="${key}">${w.word} — ${w.body_part} (${key})</option>`;
              })
              .join("")}
          </select>
        </div>

        <div id="editor-info-box" style="background: #18181b; padding: 12px; border-radius: 6px; border: 1px solid #3f3f46;">
          <div style="font-weight: bold; font-size: 0.9rem; color: #fbbf24;" id="editor-target-name">Rikma (Rambut)</div>
          <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 4px;" id="editor-target-desc">Area: Rambut di puncak kepala</div>
          <div style="font-family: monospace; font-size: 0.85rem; color: #38bdf8; margin-top: 8px;" id="editor-coords-text">
            X: 0.000 | Y: 0.000 | Z: 0.000
          </div>
        </div>

        <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 6px; padding: 10px; font-size: 0.8rem; color: #d4d4d8;">
          <strong style="color: #4ade80;">Cara Menggunakan:</strong>
          <ol style="margin: 6px 0 0 16px; padding: 0;">
            <li>Pilih anggota tubuh dari menu di atas.</li>
            <li>Klik bagian permukaan model 3D yang tepat.</li>
            <li>Titik akan otomatis menempel di permukaan mesh.</li>
            <li>Setelah puas, unduh berkas <code>anchors.json</code>.</li>
          </ol>
        </div>

        <button id="editor-download-btn" style="margin-top: auto; padding: 12px; background: #059669; hover: background: #10b981; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.95rem;">
          Unduh anchors.json yang Diperbarui
        </button>
      </div>
    </div>
  `;

  const stageContainer = container.querySelector("#editor-stage") as HTMLElement;
  const loadingEl = container.querySelector("#editor-loading") as HTMLElement;
  const selectEl = container.querySelector("#editor-select-anchor") as HTMLSelectElement;
  const targetNameEl = container.querySelector("#editor-target-name") as HTMLElement;
  const targetDescEl = container.querySelector("#editor-target-desc") as HTMLElement;
  const coordsTextEl = container.querySelector("#editor-coords-text") as HTMLElement;
  const downloadBtn = container.querySelector("#editor-download-btn") as HTMLButtonElement;

  const currentAnchorsData: AnchorsData = JSON.parse(JSON.stringify(anchorsJson));

  function updateInfo() {
    const key = selectEl.value;
    const word = vocabJson.words.find((w) => w.anchor_id === `anchor_${key}` || w.id === key);
    const a = currentAnchorsData.anchors[key];

    if (word && a) {
      targetNameEl.innerText = `${word.word} (${word.body_part})`;
      targetDescEl.innerText = `Region: ${word.region.toUpperCase()} | ${word.definition.slice(0, 70)}...`;
      coordsTextEl.innerText = `X: ${a.position[0].toFixed(4)} | Y: ${a.position[1].toFixed(4)} | Z: ${a.position[2].toFixed(4)}`;
    }
  }

  selectEl.addEventListener("change", updateInfo);

  createGameSceneStage({
    container: stageContainer,
    onPointClick: (id) => {
      selectEl.value = id;
      updateInfo();
    },
  }).then((stage) => {
    loadingEl.remove();

    function refreshPoints() {
      const allPoints = Object.entries(currentAnchorsData.anchors).map(([id, a]) => {
        const shortName = id.slice(0, 3).toUpperCase();
        return {
          id,
          label: shortName,
          position: a.position as [number, number, number],
        };
      });
      stage.hotspots.setPoints(allPoints);
    }

    refreshPoints();
    updateInfo();

    // Raycast surface click to position the active anchor
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    stageContainer.addEventListener("pointerdown", (event) => {
      // Only proceed on primary button click (left click)
      if (event.button !== 0) return;

      const rect = stageContainer.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, stage.cameraManager.camera);
      const hits = raycaster.intersectObjects(stage.loadedModel.meshes, false);

      if (hits.length > 0) {
        const hit = hits[0]!;
        const hitPoint = hit.point;

        const currentKey = selectEl.value;
        const targetAnchor = currentAnchorsData.anchors[currentKey];

        if (targetAnchor) {
          // Update anchor position to the hit surface coordinates in world/normalized space
          targetAnchor.position = [
            parseFloat(hitPoint.x.toFixed(4)),
            parseFloat(hitPoint.y.toFixed(4)),
            parseFloat(hitPoint.z.toFixed(4)),
          ];
          targetAnchor.status = "edited";

          refreshPoints();
          updateInfo();
        }
      }
    });

    // Download JSON
    downloadBtn.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAnchorsData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "anchors.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  });
}

