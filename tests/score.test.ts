import { describe, it, expect } from "vitest";
import { calculateScore, getScoreCategory } from "../src/core/score";

describe("Scoring logic", () => {
  // Required test cases from GAME_SPEC.md section 12
  // B = correct, S = wrong, N = score
  const cases: [number, number, string][] = [
    [14, 0, "100.00"],
    [14, 10, "80.00"],
    [13, 1, "90.86"],
    [10, 2, "67.43"],
    [7, 3, "44.00"],
    [0, 3, "0.00"],
    [14, 60, "0.00"],
  ];

  for (const [b, s, expected] of cases) {
    it(`calculates B=${b}, S=${s} -> ${expected}`, () => {
      const result = calculateScore(b, s);
      expect(result.display).toBe(expected);
    });
  }

  it("clamps score to 0 on negative results", () => {
    const result = calculateScore(0, 50);
    expect(result.raw).toBe(0);
    expect(result.display).toBe("0.00");
  });

  it("clamps score to 100 maximum", () => {
    const result = calculateScore(14, 0);
    expect(result.raw).toBe(100);
    expect(result.display).toBe("100.00");
  });

  describe("Score categories (DECISIONS.md K-06)", () => {
    it("categorizes 85-100 as Sae Sanget", () => {
      expect(getScoreCategory(100).label).toBe("Sae Sanget");
      expect(getScoreCategory(85.0).label).toBe("Sae Sanget");
    });

    it("categorizes 70-84.99 as Sae", () => {
      expect(getScoreCategory(84.99).label).toBe("Sae");
      expect(getScoreCategory(70.0).label).toBe("Sae");
    });

    it("categorizes 55-69.99 as Cekap", () => {
      expect(getScoreCategory(69.99).label).toBe("Cekap");
      expect(getScoreCategory(55.0).label).toBe("Cekap");
    });

    it("categorizes 0-54.99 as Kedah Sinau Malih", () => {
      expect(getScoreCategory(54.99).label).toBe("Kedah Sinau Malih");
      expect(getScoreCategory(0).label).toBe("Kedah Sinau Malih");
    });
  });
});

