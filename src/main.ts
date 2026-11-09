import { renderAnchorCheck } from "./dev/anchor-check";
import { renderAnchorEditor } from "./dev/anchor-editor";
import { renderAnchorVerify } from "./dev/anchor-verify";
import { createGameSceneStage } from "./scene/stage";
import { COPY } from "./copy";
import anchorsJson from "../data/anchors.json";
import vocabJson from "../data/vocab.json";

const app = document.getElementById("app");

if (app) {
  const path = window.location.pathname;
  const hash = window.location.hash;

  if (path === "/anchor-verify" || hash === "#/anchor-verify" || hash === "#verify") {
    renderAnchorVerify(app);
  } else if (path === "/anchor-check" || hash === "#/anchor-check") {
    renderAnchorCheck(app);
  } else if (path === "/anchor-editor" || hash === "#/anchor-editor") {
    renderAnchorEditor(app);
  } else {
    // Default main view / scene stage preview
    app.innerHTML = `
      <div style="width: 100vw; height: 100vh; position: relative; overflow: hidden; font-family: system-ui, sans-serif;">
        <div id="loading-overlay" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f6f3ea; z-index: 50; transition: opacity 0.3s ease;">
          <h2 style="color: #78350f; margin-bottom: 8px;">${COPY.splash.title}</h2>
          <p id="loading-text" style="color: #92400e; margin: 0;">${COPY.loading}</p>
        </div>
        <div id="game-canvas-container" style="width: 100%; height: 100%;"></div>
        <div style="position: absolute; top: 12px; left: 12px; z-index: 20; display: flex; gap: 8px;">
          <a href="#/anchor-verify" style="background: #f59e0b; color: #000; font-weight: bold; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 0.8rem;">Checkpoint B: Verifikasi</a>
          <a href="#/anchor-check" style="background: rgba(0,0,0,0.6); color: #fff; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 0.8rem;">Dev: Check</a>
          <a href="#/anchor-editor" style="background: rgba(0,0,0,0.6); color: #fff; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 0.8rem;">Dev: Editor</a>
        </div>
      </div>
    `;

    const container = document.getElementById("game-canvas-container") as HTMLElement;
    const loadingOverlay = document.getElementById("loading-overlay");
    const loadingText = document.getElementById("loading-text");

    createGameSceneStage({
      container,
      onPointClick: (pointId) => {
        const word = vocabJson.words.find(
          (w) => w.id === pointId || w.anchor_id === `anchor_${pointId}`,
        );
        alert(`Titik diklik: ${word ? word.word : pointId} (${word ? word.body_part : ""})`);
      },
      onProgress: (percent) => {
        if (loadingText) loadingText.innerText = `${COPY.loading} (${percent}%)`;
      },
    }).then((stage) => {
      if (loadingOverlay) {
        loadingOverlay.style.opacity = "0";
        setTimeout(() => loadingOverlay.remove(), 300);
      }

      // Show sample 5 points from first word for initial 3D stage preview
      const points = [
        { id: "rikma", label: "A", position: anchorsJson.anchors.rikma.position as [number, number, number] },
        { id: "mustaka", label: "B", position: anchorsJson.anchors.mustaka.position as [number, number, number] },
        { id: "soca", label: "C", position: anchorsJson.anchors.soca.position as [number, number, number] },
        { id: "padharan", label: "D", position: anchorsJson.anchors.padharan.position as [number, number, number] },
        { id: "asta", label: "E", position: anchorsJson.anchors.asta.position as [number, number, number] },
      ];
      stage.hotspots.setPoints(points);
    }).catch((err) => {
      console.error(err);
      if (loadingText) loadingText.innerText = COPY.error.modelLoadFailed;
    });
  }
}
