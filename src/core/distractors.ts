import { POINT_COUNT, MIN_SEPARATION, MIN_SEPARATION_FALLBACK, MIN_DISTRACTORS_OTHER_REGION } from "../config";
import type { AnchorPoint, GamePoint, Region } from "./types";

/** Squared Euclidean distance between two 3D positions */
function distanceSq(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

/** Shuffle array in place (Fisher-Yates) */
function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

interface CandidateInfo {
  id: string;
  region: Region;
  position: [number, number, number];
}

/**
 * Select 5 points: 1 correct + 4 distractors.
 * Rules:
 * - Drop candidates closer than minSep to the correct point
 * - Every pair of selected distractors must be at least minSep apart
 * - At least MIN_DISTRACTORS_OTHER_REGION distractors from a region different from the correct answer
 * - If fails, lower separation step by step to MIN_SEPARATION_FALLBACK
 * - Labels A-E in random order
 */
export function selectPoints(
  correctId: string,
  correctRegion: Region,
  anchors: Record<string, AnchorPoint>,
  wordRegions: Record<string, Region>,
  rng: () => number = Math.random,
): GamePoint[] {
  const correctPos = anchors[correctId]?.position;
  if (!correctPos) {
    throw new Error(`Anchor not found for id: ${correctId}`);
  }

  // Build candidate list (all anchors except the correct one)
  const allCandidates: CandidateInfo[] = [];
  for (const [id, anchor] of Object.entries(anchors)) {
    if (id === correctId) continue;
    const region = wordRegions[id];
    if (!region) continue;
    allCandidates.push({ id, region, position: anchor.position });
  }

  const distractorCount = POINT_COUNT - 1;

  // Try with decreasing separation thresholds
  const separationSteps = [MIN_SEPARATION];
  for (let s = MIN_SEPARATION - 0.01; s >= MIN_SEPARATION_FALLBACK - 0.001; s -= 0.01) {
    separationSteps.push(Math.round(s * 100) / 100);
  }

  for (const minSep of separationSteps) {
    const minSepSq = minSep * minSep;

    // Filter candidates that are far enough from the correct point
    const eligible = allCandidates.filter(
      (c) => distanceSq(c.position, correctPos) >= minSepSq,
    );

    // Separate into same-region and other-region
    const otherRegion = eligible.filter((c) => c.region !== correctRegion);
    const sameRegion = eligible.filter((c) => c.region === correctRegion);

    // Reusable buffers for attempts
    const otherCopy = [...otherRegion];
    const sameCopy = [...sameRegion];

    // Try multiple random orderings
    for (let attempt = 0; attempt < 50; attempt++) {
      shuffle(otherCopy, rng);
      shuffle(sameCopy, rng);

      const selected: CandidateInfo[] = [];
      let otherCount = 0;

      // Greedy pick: other-region first to meet the minimum
      for (let i = 0; i < otherCopy.length && selected.length < distractorCount; i++) {
        const candidate = otherCopy[i]!;
        if (!selected.some((s) => distanceSq(s.position, candidate.position) < minSepSq)) {
          selected.push(candidate);
          otherCount++;
        }
      }

      for (let i = 0; i < sameCopy.length && selected.length < distractorCount; i++) {
        const candidate = sameCopy[i]!;
        if (!selected.some((s) => distanceSq(s.position, candidate.position) < minSepSq)) {
          selected.push(candidate);
        }
      }

      if (
        selected.length === distractorCount &&
        otherCount >= MIN_DISTRACTORS_OTHER_REGION
      ) {
        // Success: build the labeled point array
        const allPoints: { id: string }[] = [
          { id: correctId },
          { id: selected[0]!.id },
          { id: selected[1]!.id },
          { id: selected[2]!.id },
          { id: selected[3]!.id },
        ];
        shuffle(allPoints, rng);

        const labels = ["A", "B", "C", "D", "E"] as const;
        return allPoints.map((p, i) => ({
          id: p.id,
          label: labels[i]!,
        }));
      }
    }

    // Log fallback in dev mode
    if (minSep < MIN_SEPARATION && typeof console !== "undefined") {
      console.warn(
        `[distractors] Falling back to separation ${minSep} for ${correctId}`,
      );
    }
  }

  throw new Error(
    `Failed to select distractors for ${correctId} even at minimum fallback separation`,
  );
}
