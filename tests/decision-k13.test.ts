// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { GameView } from "../src/ui/game-view";
import { validateAllData } from "../src/core/data-loader";
import {
  SHOW_MODEL_CREDIT,
  MODEL_CREDIT_NAME,
  setModelCreditConfig,
  MODEL_PATH,
} from "../src/config";
import vocabJson from "../data/vocab.json";
import anchorsJson from "../data/anchors.json";

describe("Decision K-13: Model credit line control and name removal", () => {
  const { vocab, anchors } = validateAllData(vocabJson, anchorsJson);
  let container: HTMLElement;

  beforeEach(() => {
    sessionStorage.clear();
    setModelCreditConfig(false, "");
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    setModelCreditConfig(false, "");
    container.remove();
  });

  // Task 5 (a): with the default config no element in the splash screen contains "Model 3D"
  it("Task 5 (a): with default config no element in splash screen contains 'Model 3D'", () => {
    expect(SHOW_MODEL_CREDIT).toBe(false);
    expect(MODEL_CREDIT_NAME).toBe("");

    const game = new GameView(container, vocab, anchors);
    game.setScreen("splash");

    // The splash container must not contain "Model 3D"
    expect(container.innerHTML.toLowerCase()).not.toContain("model 3d");
    expect(container.querySelector("#model-credit-line")).toBeNull();
  });

  // Task 5 (b): with SHOW_MODEL_CREDIT=true and a name set, the splash shows exactly "Model 3D: {name}"
  it("Task 5 (b): with SHOW_MODEL_CREDIT=true and a name set, splash shows exactly 'Model 3D: {name}'", () => {
    const testCreditName = "Pengembang Model";
    setModelCreditConfig(true, testCreditName);

    const game = new GameView(container, vocab, anchors);
    game.setScreen("splash");

    const creditEl = container.querySelector("#model-credit-line");
    expect(creditEl).not.toBeNull();
    expect(creditEl?.textContent?.trim()).toBe(`Model 3D: ${testCreditName}`);

    // If name is empty, it should not render even if SHOW_MODEL_CREDIT is true
    setModelCreditConfig(true, "   ");
    game.setScreen("splash");
    expect(container.querySelector("#model-credit-line")).toBeNull();
    expect(container.innerHTML.toLowerCase()).not.toContain("model 3d");
  });

  // Task 5 (c): no .ts source or UI string contains "Nesya" or "Wildan" except the model file name constant
  it("Task 5 (c): no .ts source or UI string contains 'Nesya' or 'Wildan' except model file name constant", () => {
    const srcDir = path.resolve(__dirname, "../src");

    function getAllTsFiles(dir: string): string[] {
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getAllTsFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith(".ts")) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const tsFiles = getAllTsFiles(srcDir);
    expect(tsFiles.length).toBeGreaterThan(0);

    const forbiddenNames = ["Nesya", "Wildan", "nesya", "wildan"];

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const relative = path.relative(srcDir, file).replace(/\\/g, "/");

      if (relative === "config.ts") {
        // In config.ts, it must ONLY appear within the MODEL_PATH constant value
        const lines = content.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]!;
          for (const name of forbiddenNames) {
            if (line.includes(name)) {
              // Verify this line is the MODEL_PATH constant declaration
              expect(line).toContain("MODEL_PATH");
              expect(line).toContain("karakter-wildan-byNesya.glb");
            }
          }
        }
      } else {
        // In all other .ts files, it must NOT appear at all!
        for (const name of forbiddenNames) {
          expect(content, `File ${relative} contains forbidden string "${name}"`).not.toContain(name);
        }
      }
    }
  });
});

