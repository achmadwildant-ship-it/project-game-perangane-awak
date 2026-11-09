import { describe, it, expect } from "vitest";
import {
  createSession,
  selectWord,
  setWordPoints,
  answerCorrect,
  answerWrong,
  useHint,
  isSessionComplete,
} from "../src/core/session";
import { selectPoints } from "../src/core/distractors";
import { calculateScore, getScoreCategory } from "../src/core/score";
import { validateAllData, buildAnchorRegionMap } from "../src/core/data-loader";
import { DISABLE_WRONG_DOTS } from "../src/config";
import vocabJson from "../data/vocab.json";
import anchorsJson from "../data/anchors.json";

describe("Phase 4 Quality Gate: Full 14-Word Game Flow", () => {
  const { vocab, anchors } = validateAllData(vocabJson, anchorsJson);
  const regionMap = buildAnchorRegionMap(vocab);
  const wordIds = vocab.words.map((w) => w.id);

  it("completes a full 14-word game with perfect score (14 correct, 0 wrong)", () => {
    let session = createSession("Ananda Siti", wordIds);

    for (let i = 0; i < vocab.words.length; i++) {
      const word = vocab.words[i]!;
      const anchorKey = word.anchor_id.replace(/^anchor_/, "");

      session = selectWord(session, word.id);
      expect(session.activeWordId).toBe(word.id);

      // Distractors generated once
      const points = selectPoints(anchorKey, word.region, anchors.anchors, regionMap);
      session = setWordPoints(session, word.id, points);

      // Student answers correctly
      session = answerCorrect(session, word.id);
      expect(session.words[word.id]?.status).toBe("done");
    }

    expect(isSessionComplete(session)).toBe(true);
    expect(session.correct).toBe(14);
    expect(session.wrong).toBe(0);

    const score = calculateScore(session.correct, session.wrong);
    expect(score.raw).toBe(100);
    expect(score.display).toBe("100.00");

    const category = getScoreCategory(score.raw);
    expect(category.label).toBe("Sae Sanget");
  });

  it("completes a full 14-word game with mistakes and hints, matching formula exactly", () => {
    let session = createSession("Budi", wordIds);

    // Scenario:
    // - Answer all 14 words correctly eventually
    // - Make 5 wrong taps across the game (S = 5)
    // - Use all 3 hints (H = 3)
    // Expected score: max(0, min(100, 100 - 2 * 5)) = 90.00 -> Sae Sanget

    let hintsUsedCount = 0;
    let wrongAttemptsCount = 0;

    for (let i = 0; i < vocab.words.length; i++) {
      const word = vocab.words[i]!;
      const anchorKey = word.anchor_id.replace(/^anchor_/, "");

      session = selectWord(session, word.id);

      // Generate 5 points
      const points = selectPoints(anchorKey, word.region, anchors.anchors, regionMap);
      session = setWordPoints(session, word.id, points);

      // On word 0, 1, 2: use a hint
      if (i < 3) {
        const hintRes = useHint(session, word.id);
        expect(hintRes).not.toBeNull();
        session = hintRes!;
        hintsUsedCount++;
      }

      // On word 3: make 2 wrong taps before correct answer
      if (i === 3) {
        const wrongPoint1 = points.find((p) => p.id !== anchorKey)!.id;
        session = answerWrong(session, word.id, wrongPoint1, DISABLE_WRONG_DOTS);
        wrongAttemptsCount++;

        const wrongPoint2 = points.find((p) => p.id !== anchorKey && p.id !== wrongPoint1)!.id;
        session = answerWrong(session, word.id, wrongPoint2, DISABLE_WRONG_DOTS);
        wrongAttemptsCount++;

        expect(session.words[word.id]?.disabledPointIds).toContain(wrongPoint1);
        expect(session.words[word.id]?.disabledPointIds).toContain(wrongPoint2);
      }

      // On word 7: make 3 wrong taps before correct answer
      if (i === 7) {
        const wrongDistractors = points.filter((p) => p.id !== anchorKey);
        for (let k = 0; k < 3; k++) {
          session = answerWrong(session, word.id, wrongDistractors[k]!.id, DISABLE_WRONG_DOTS);
          wrongAttemptsCount++;
        }
      }

      // Finally tap correct answer
      session = answerCorrect(session, word.id);
    }

    expect(isSessionComplete(session)).toBe(true);
    expect(session.correct).toBe(14);
    expect(session.wrong).toBe(5);
    expect(session.hintsUsed).toBe(3);
    expect(session.hintsLeft).toBe(0);

    // Score: 100/14 * 14 - 2 * 5 = 100 - 10 = 90.00
    const finalScore = calculateScore(session.correct, session.wrong);
    expect(finalScore.raw).toBe(90);
    expect(finalScore.display).toBe("90.00");

    const category = getScoreCategory(finalScore.raw);
    expect(category.label).toBe("Sae Sanget");
  });

  it("verifies partial game score calculation (e.g. 10 correct, 2 wrong)", () => {
    // Spec case from section 12: B=10, S=2 -> 67.43
    const score = calculateScore(10, 2);
    expect(score.display).toBe("67.43");
    expect(getScoreCategory(score.raw).label).toBe("Cekap");
  });
});
