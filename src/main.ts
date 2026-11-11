import "./ui/styles.css";
import { GameView } from "./ui/game-view";
import { validateAllData } from "./core/data-loader";
import { COPY } from "./copy";
import anchorsJson from "../data/anchors.json";
import vocabJson from "../data/vocab.json";

const app = document.getElementById("app");

if (app) {
  const hash = window.location.hash;

  // Dev-only routes: dynamic imports wrapped in DEV guard so Vite tree-shakes
  // them completely from production builds. Static string literals required.
  if (import.meta.env.DEV && (hash === "#/anchor-verify" || hash === "#verify")) {
    import("./dev/anchor-verify").then(({ renderAnchorVerify }) => renderAnchorVerify(app));
  } else if (import.meta.env.DEV && hash === "#/anchor-check") {
    import("./dev/anchor-check").then(({ renderAnchorCheck }) => renderAnchorCheck(app));
  } else if (import.meta.env.DEV && hash === "#/anchor-editor") {
    import("./dev/anchor-editor").then(({ renderAnchorEditor }) => renderAnchorEditor(app));
  } else {
    // Production (and dev non-route) path: show splash immediately, then
    // validate data. Any error is caught and shown as a friendly message.
    try {
      const { vocab, anchors } = validateAllData(vocabJson, anchorsJson);
      const game = new GameView(app, vocab, anchors);
      game.render();
    } catch (err) {
      console.error("Game initialization error:", err);
      app.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;padding:24px;text-align:center;background:#fef3c7;font-family:sans-serif;">
          <div style="font-size:3rem;margin-bottom:16px;">⚠️</div>
          <h2 style="color:#dc2626;margin:0 0 12px;">${COPY.error.dataLoadFailed}</h2>
          <p style="color:#78350f;max-width:360px;">${err instanceof Error ? err.message : String(err)}</p>
          <button onclick="location.reload()" style="margin-top:20px;padding:10px 24px;background:#b45309;color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;">Muat Ulang</button>
        </div>
      `;
    }
  }
}
