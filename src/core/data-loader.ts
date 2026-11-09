import { WORD_COUNT } from "../config";
import type { VocabData, AnchorsData, Region } from "./types";

/** Validation error for data files */
export class DataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataValidationError";
  }
}

/** Check that a value is a finite 3-number array */
export function isValidPosition(val: unknown): val is [number, number, number] {
  if (!Array.isArray(val) || val.length !== 3) return false;
  return val.every((n) => typeof n === "number" && Number.isFinite(n));
}

/** Validate a region string */
export function isValidRegion(val: unknown): val is Region {
  return val === "head" || val === "torso" || val === "arm" || val === "leg";
}

/** Validate vocab data structure */
export function validateVocabData(data: unknown): VocabData {
  if (!data || typeof data !== "object") {
    throw new DataValidationError("vocab.json must be an object");
  }
  const obj = data as Record<string, unknown>;

  if (!obj.words || !Array.isArray(obj.words)) {
    throw new DataValidationError("vocab.json must have a 'words' array");
  }

  const words = obj.words as unknown[];
  if (words.length !== WORD_COUNT) {
    throw new DataValidationError(
      `vocab.json must have exactly ${WORD_COUNT} words, got ${words.length}`,
    );
  }

  const ids = new Set<string>();
  for (const w of words) {
    if (!w || typeof w !== "object") {
      throw new DataValidationError("Each word entry must be an object");
    }
    const word = w as Record<string, unknown>;
    if (typeof word.id !== "string" || word.id.length === 0) {
      throw new DataValidationError("Each word must have a non-empty string 'id'");
    }
    if (ids.has(word.id)) {
      throw new DataValidationError(`Duplicate word id: ${word.id}`);
    }
    ids.add(word.id);

    if (typeof word.anchor_id !== "string" || word.anchor_id.length === 0) {
      throw new DataValidationError(`Word '${word.id}' must have a non-empty 'anchor_id'`);
    }

    if (!isValidRegion(word.region)) {
      throw new DataValidationError(
        `Word '${word.id}' has invalid region: ${String(word.region)}`,
      );
    }
  }

  return data as VocabData;
}

/** Validate anchors data structure */
export function validateAnchorsData(data: unknown): AnchorsData {
  if (!data || typeof data !== "object") {
    throw new DataValidationError("anchors.json must be an object");
  }
  const obj = data as Record<string, unknown>;

  if (!obj.anchors || typeof obj.anchors !== "object") {
    throw new DataValidationError("anchors.json must have an 'anchors' object");
  }

  const anchors = obj.anchors as Record<string, unknown>;
  const anchorKeys = Object.keys(anchors);
  if (anchorKeys.length !== WORD_COUNT) {
    throw new DataValidationError(
      `anchors.json must have exactly ${WORD_COUNT} anchors, got ${anchorKeys.length}`,
    );
  }

  for (const [id, anchor] of Object.entries(anchors)) {
    if (!anchor || typeof anchor !== "object") {
      throw new DataValidationError(`Anchor '${id}' must be an object`);
    }
    const a = anchor as Record<string, unknown>;
    if (!isValidPosition(a.position)) {
      throw new DataValidationError(
        `Anchor '${id}' must have a position as a finite 3-number array`,
      );
    }
  }

  return data as AnchorsData;
}

/** Cross-validate: every anchor_id in vocab must exist in anchors */
export function validateCrossReference(
  vocab: VocabData,
  anchors: AnchorsData,
): void {
  for (const word of vocab.words) {
    // anchor_id has prefix "anchor_", the anchors keys don't
    const anchorKey = word.anchor_id.replace(/^anchor_/, "");
    if (!(anchorKey in anchors.anchors)) {
      throw new DataValidationError(
        `Word '${word.id}' references anchor '${word.anchor_id}' but no anchor with key '${anchorKey}' exists`,
      );
    }
  }
}

/** Build a map from anchor key (no prefix) to region, for distractor selection */
export function buildAnchorRegionMap(vocab: VocabData): Record<string, Region> {
  const map: Record<string, Region> = {};
  for (const word of vocab.words) {
    const anchorKey = word.anchor_id.replace(/^anchor_/, "");
    map[anchorKey] = word.region;
  }
  return map;
}

/** Validate pre-imported data */
export function validateAllData(
  vocabRaw: unknown,
  anchorsRaw: unknown,
): { vocab: VocabData; anchors: AnchorsData } {
  const vocab = validateVocabData(vocabRaw);
  const anchors = validateAnchorsData(anchorsRaw);
  validateCrossReference(vocab, anchors);
  return { vocab, anchors };
}
