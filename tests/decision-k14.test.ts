// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { GameView } from "../src/ui/game-view";
import { validateAllData } from "../src/core/data-loader";
import { createSession, selectWord, saveSession } from "../src/core/session";
import vocabJson from "../data/vocab.json";
import anchorsJson from "../data/anchors.json";

describe("Decision K-14: Active prompt shows ONLY Javanese word", () => {
  const { vocab, anchors } = validateAllData(vocabJson, anchorsJson);
  let container: HTMLElement;

  beforeEach(() => {
    sessionStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  // Task 2 (a): the active-word element text equals exactly vocab "word" for all 14 words
  it("Task 2 (a): active-word element text equals exactly vocab 'word' for all 14 words", () => {
    const wordIds = vocab.words.map((w) => w.id);

    for (const w of vocab.words) {
      sessionStorage.clear();
      let session = createSession("Budi", wordIds);
      session = selectWord(session, w.id);
      saveSession(session);

      const game = new GameView(container, vocab, anchors);
      game.setScreen("gameplay");

      const activeWordEl = container.querySelector("#active-word-text");
      expect(activeWordEl).not.toBeNull();
      // Must equal exactly the Javanese word (e.g. "Rikma"), nothing else!
      expect(activeWordEl?.textContent?.trim()).toBe(w.word);
    }
  });

  // Task 2 (b): no gameplay element contains the word's body_part
  it("Task 2 (b): no gameplay element contains the word's body_part", () => {
    const wordIds = vocab.words.map((w) => w.id);

    for (const w of vocab.words) {
      sessionStorage.clear();
      let session = createSession("Budi", wordIds);
      session = selectWord(session, w.id);
      saveSession(session);

      const game = new GameView(container, vocab, anchors);
      game.setScreen("gameplay");

      // Check all elements in the gameplay container
      const activeWordEl = container.querySelector("#active-word-text");
      expect(activeWordEl).not.toBeNull();
      const activeWordText = activeWordEl?.textContent?.toLowerCase() || "";
      expect(activeWordText).not.toContain(w.body_part.toLowerCase());

      // Check all word pills (text, title, aria-label)
      const pills = container.querySelectorAll(".word-pill");
      expect(pills.length).toBe(14);
      pills.forEach((pill) => {
        const text = pill.textContent?.toLowerCase() || "";
        const title = pill.getAttribute("title")?.toLowerCase() || "";
        const ariaLabel = pill.getAttribute("aria-label")?.toLowerCase() || "";

        expect(text).not.toContain(w.body_part.toLowerCase());
        expect(title).not.toContain(w.body_part.toLowerCase());
        expect(ariaLabel).not.toContain(w.body_part.toLowerCase());
      });

      // Split body_part if it contains slashes (e.g. "Bibir/mulut")
      const subParts = w.body_part.toLowerCase().split("/").map((p) => p.trim());
      for (const part of subParts) {
        expect(activeWordText).not.toContain(part);
        pills.forEach((pill) => {
          const text = pill.textContent?.toLowerCase() || "";
          const title = pill.getAttribute("title")?.toLowerCase() || "";
          const ariaLabel = pill.getAttribute("aria-label")?.toLowerCase() || "";

          expect(text).not.toContain(part);
          expect(title).not.toContain(part);
          expect(ariaLabel).not.toContain(part);
        });
      }
    }
  });

  // Task 2 (c): every hint in vocab.json does not contain its own entry's body_part, compared case-insensitively
  it("Task 2 (c): every hint in vocab.json does not contain its own entry's body_part, case-insensitively", () => {
    for (const w of vocab.words) {
      const hintLower = w.hint.toLowerCase();
      const bodyPartLower = w.body_part.toLowerCase();

      // Direct comparison
      expect(hintLower).not.toContain(bodyPartLower);

      // Check all sub-parts (e.g. "Bibir/mulut" -> ["bibir", "mulut"])
      const subParts = bodyPartLower.split("/").map((p) => p.trim());
      for (const part of subParts) {
        expect(hintLower).not.toContain(part);
      }
    }
  });
});
