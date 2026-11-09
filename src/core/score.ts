import { WRONG_PENALTY, SCORE_PER_WORD } from "../config";
import type { ScoreResult, ScoreCategory } from "./types";

/** Calculate the raw score given correct count and wrong count */
export function calculateScore(correct: number, wrong: number): ScoreResult {
  const raw = Math.max(0, Math.min(100, SCORE_PER_WORD * correct - WRONG_PENALTY * wrong));
  const display = raw.toFixed(2);
  return { raw, display };
}

/** Determine the score category */
export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 85) return { key: "best", label: "Sae Sanget" };
  if (score >= 70) return { key: "good", label: "Sae" };
  if (score >= 55) return { key: "fair", label: "Cekap" };
  return { key: "low", label: "Kedah Sinau Malih" };
}
