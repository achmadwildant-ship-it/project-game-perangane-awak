import { createGameSceneStage } from "../scene/stage";
import anchorsJson from "../../data/anchors.json";
import vocabJson from "../../data/vocab.json";
import type { AnchorsData } from "../core/types";

export function renderAnchorCheck(container: HTMLElement) {
  container.innerHTML = `
    <div style="display: flex; height: 100vh; font-family: sans-serif; background: #1a1a1a; color: #fff;">
      <div id="check-stage" style="flex: 1; position: relative; height: 100%;">
        <div id="check-loading" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: #222; font-size: 1.2rem;">
          Memuat Model & 14 Titik...
        </div>
      </div>
      <div style="width: 340px; background: #2d2d2d; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; box-shadow: -2px 0 10px rgba(0,0,0,0.5); z-index: 20;">
        <h2 style="margin: 0; font-size: 1.2rem; color: #f59e0b;">Dev: Anchor Check</h2>
        <p style="margin: 0; font-size: 0.85rem; color: #9ca3af;">Verifikasi 14 titik dari 8 sudut pandang kamera.</p>
        
        <div>
          <label style="font-size: 0.85rem; font-weight: bold;">Sudut Pandang (8 Viewpoints):</label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-top: 6px;">
            <button class="view-btn" data-angle="0">Depan (Front)</button>
            <button class="view-btn" data-angle="45">Depan Kanan</button>
            <button class="view-btn" data-angle="90">Kanan (Right)</button>
            <button class="view-btn" data-angle="135">Belakang Kanan</button>
            <button class="view-btn" data-angle="180">Belakang (Back)</button>
            <button class="view-btn" data-angle="225">Belakang Kiri</button>
            <button class="view-btn" data-angle="270">Kiri (Left)</button>
            <button class="view-btn" data-angle="315">Depan Kiri</button>
            <button class="view-btn" data-special="ampeyan" style="grid-column: span 2; background: #4f46e5;">Bawah Kaki (Ampeyan View)</button>
          </div>
        </div>

        <hr style="border-color: #444; margin: 4px 0;" />

        <div>
          <label style="font-size: 0.85rem; font-weight: bold;">Pilih Titik untuk Disetel (Nudge):</label>
          <select id="selected-anchor" style="width: 100%; padding: 6px; margin-top: 4px; background: #3d3d3d; color: #fff; border: 1px solid #555; border-radius: 4px;">
            ${Object.keys(anchorsJson.anchors)
              .map((id) => `<option value="${id}">${id}</option>`)
              .join("")}
          </select>
        </div>

        <div id="coords-display" style="font-family: monospace; font-size: 0.8rem; background: #1e1e1e; padding: 8px; border-radius: 4px;">
          X: 0.000 | Y: 0.000 | Z: 0.000
        </div>

        <div>
          <label style="font-size: 0.85rem; font-weight: bold;">Geser Titik (Nudge ±0.005):</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 6px;">
            <button class="nudge-btn" data-axis="x" data-dir="1">+X (Kanan)</button>
            <button class="nudge-btn" data-axis="y" data-dir="1">+Y (Atas)</button>
            <button class="nudge-btn" data-axis="z" data-dir="1">+Z (Depan)</button>
            <button class="nudge-btn" data-axis="x" data-dir="-1">-X (Kiri)</button>
            <button class="nudge-btn" data-axis="y" data-dir="-1">-Y (Bawah)</button>
            <button class="nudge-btn" data-axis="z" data-dir="-1">-Z (Belakang)</button>
          </div>
        </div>

        <button id="download-json-btn" style="margin-top: auto; padding: 10px; background: #10b981; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
          Unduh anchors.json Terkini
        </button>
      </div>
    </div>
  `;

  const stageContainer = container.querySelector("#check-stage") as HTMLElement;
  const loadingEl = container.querySelector("#check-loading") as HTMLElement;
  const selectEl = container.querySelector("#selected-anchor") as HTMLSelectElement;
  const coordsDisplay = container.querySelector("#coords-display") as HTMLElement;
  const downloadBtn = container.querySelector("#download-json-btn") as HTMLButtonElement;

  // Local mutable copy of anchors
  const currentAnchorsData: AnchorsData = JSON.parse(JSON.stringify(anchorsJson));

  function getWordLabel(anchorKey: string): string {
    const word = vocabJson.words.find((w) => w.id === anchorKey || w.anchor_id === `anchor_${anchorKey}`);
    return word ? `${word.word} (${word.body_part})` : anchorKey;
  }

  function updateCoordsDisplay() {
    const key = selectEl.value;
    const a = currentAnchorsData.anchors[key];
    if (a) {
      coordsDisplay.innerText = `ID: ${key} [${getWordLabel(key)}]\nX: ${a.position[0].toFixed(4)}\nY: ${a.position[1].toFixed(4)}\nZ: ${a.position[2].toFixed(4)}`;
    }
  }

  selectEl.addEventListener("change", updateCoordsDisplay);

  createGameSceneStage({
    container: stageContainer,
    onPointClick: (id) => {
      selectEl.value = id;
      updateCoordsDisplay();
    },
  }).then((stage) => {
    loadingEl.remove();

    // Show all 14 points with short names
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
    updateCoordsDisplay();

    // 8 Viewpoints handling
    const camera = stage.cameraManager.camera;
    const controls = stage.cameraManager.controls;

    container.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const angleDeg = (btn as HTMLElement).dataset.angle;
        const special = (btn as HTMLElement).dataset.special;

        if (special === "ampeyan") {
          // Look up at soles from low angle
          camera.position.set(0.4, -0.3, 1.2);
          controls.target.set(0.12, 0.1, 0.1);
        } else if (angleDeg !== undefined) {
          const rad = (parseFloat(angleDeg) * Math.PI) / 180;
          const dist = 3.5;
          const y = 0.9;
          camera.position.set(Math.sin(rad) * dist, 1.3, Math.cos(rad) * dist);
          controls.target.set(0, y, 0);
        }
        controls.update();
      });
    });

    // Nudge handling
    container.querySelectorAll(".nudge-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const axis = (btn as HTMLElement).dataset.axis as "x" | "y" | "z";
        const dir = parseInt((btn as HTMLElement).dataset.dir || "1", 10);
        const key = selectEl.value;
        const a = currentAnchorsData.anchors[key];
        if (!a) return;

        const delta = 0.005 * dir;
        const idx = axis === "x" ? 0 : axis === "y" ? 1 : 2;
        a.position[idx] = parseFloat((a.position[idx] + delta).toFixed(4));

        refreshPoints();
        updateCoordsDisplay();
      });
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
