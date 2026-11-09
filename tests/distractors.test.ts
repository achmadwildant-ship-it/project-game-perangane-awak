import { describe, it, expect } from "vitest";
import { selectPoints } from "../src/core/distractors";
import { buildAnchorRegionMap } from "../src/core/data-loader";
import { MIN_SEPARATION } from "../src/config";
import vocabJson from "../data/vocab.json";
import anchorsJson from "../data/anchors.json";

function distance(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Simple deterministic PRNG for reproducible test runs
function makePrng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

describe("Distractor selection", () => {
  const anchors = anchorsJson.anchors;
  // @ts-expect-error typed loosely for test input
  const wordRegions = buildAnchorRegionMap(vocabJson);

  // Quality gate from MAIN_PROMPT.md:
  // 1,000 random seeds for each of the 14 words:
  // - exactly 5 points
  // - exactly one correct point
  // - unique IDs
  // - minimum separation honored
  // - at least 2 from another region
  it("passes 1,000 trials for each of the 14 words", () => {
    const wordEntries = Object.entries(wordRegions);
    expect(wordEntries.length).toBe(14);

    for (const [anchorId, region] of wordEntries) {
      for (let seed = 0; seed < 1000; seed++) {
        const rng = makePrng(seed * 1000 + 7);
        const points = selectPoints(anchorId, region, anchors, wordRegions, rng);

        // 1. Exactly 5 points
        expect(points.length).toBe(5);

        // 2. Exactly one correct
        const correctPoints = points.filter((p) => p.id === anchorId);
        expect(correctPoints.length).toBe(1);

        // 3. Unique IDs
        const ids = new Set(points.map((p) => p.id));
        expect(ids.size).toBe(5);

        // 4. Unique labels A-E
        const labels = points.map((p) => p.label).sort();
        expect(labels).toEqual(["A", "B", "C", "D", "E"]);

        // 5. At least 2 from another region
        const otherRegionCount = points
          .filter((p) => p.id !== anchorId)
          .filter((p) => wordRegions[p.id] !== region).length;
        expect(otherRegionCount).toBeGreaterThanOrEqual(2);

        // 6. Minimum separation between every pair (at MIN_SEPARATION or fallback)
        // With current anchor positions, all should meet 0.15
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            const p1 = anchors[points[i]!.id]!.position as [number, number, number];
            const p2 = anchors[points[j]!.id]!.position as [number, number, number];
            const d = distance(p1, p2);
            expect(d).toBeGreaterThanOrEqual(MIN_SEPARATION - 0.001);
          }
        }
      }
    }
  });

  it("throws if anchor ID does not exist", () => {
    expect(() =>
      selectPoints("nonexistent", "head", anchors, wordRegions),
    ).toThrow(/Anchor not found/);
  });
});
