import "./ui/styles.css";
import { renderAnchorCheck } from "./dev/anchor-check";
import { renderAnchorEditor } from "./dev/anchor-editor";
import { renderAnchorVerify } from "./dev/anchor-verify";
import { GameView } from "./ui/game-view";
import { validateAllData } from "./core/data-loader";
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
    try {
      const { vocab, anchors } = validateAllData(vocabJson, anchorsJson);
      const game = new GameView(app, vocab, anchors);
      game.render();
    } catch (err) {
      console.error("Game initialization error:", err);
      app.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--color-wrong, #dc2626); font-family: sans-serif;">
          <h2>${COPY.error.dataLoadFailed}</h2>
          <p>${err instanceof Error ? err.message : String(err)}</p>
        </div>
      `;
    }
  }
}
