import { describe, it, expect } from "vitest";
import {
  validateVocabData,
  validateAnchorsData,
  validateCrossReference,
  validateAllData,
  DataValidationError,
} from "../src/core/data-loader";
import vocabJson from "../data/vocab.json";
import anchorsJson from "../data/anchors.json";

describe("Data Loader & Validator", () => {
  it("validates the real vocab.json successfully", () => {
    const vocab = validateVocabData(vocabJson);
    expect(vocab.words).toHaveLength(14);
  });

  it("validates the real anchors.json successfully", () => {
    const anchors = validateAnchorsData(anchorsJson);
    expect(Object.keys(anchors.anchors)).toHaveLength(14);
  });

  it("cross-references vocab and anchors successfully", () => {
    const { vocab, anchors } = validateAllData(vocabJson, anchorsJson);
    expect(vocab.words.length).toBe(14);
    expect(Object.keys(anchors.anchors).length).toBe(14);
  });

  it("rejects vocab with wrong word count", () => {
    const badVocab = {
      words: [{ id: "one", anchor_id: "anchor_one", region: "head" }],
    };
    expect(() => validateVocabData(badVocab)).toThrow(DataValidationError);
    expect(() => validateVocabData(badVocab)).toThrow(/exactly 14 words/);
  });

  it("rejects vocab with duplicate IDs", () => {
    const words = Array.from({ length: 14 }, (_, i) => ({
      id: i === 1 ? "dup" : i === 0 ? "dup" : `word_${i}`,
      anchor_id: `anchor_${i}`,
      region: "head",
    }));
    expect(() => validateVocabData({ words })).toThrow(/Duplicate word id: dup/);
  });

  it("rejects vocab with invalid region", () => {
    const words = Array.from({ length: 14 }, (_, i) => ({
      id: `word_${i}`,
      anchor_id: `anchor_${i}`,
      region: i === 0 ? "invalid_region" : "head",
    }));
    expect(() => validateVocabData({ words })).toThrow(/invalid region/);
  });

  it("rejects anchors with invalid position", () => {
    const badAnchors = {
      anchors: {
        rikma: { position: [0, 1] }, // only 2 numbers
      },
    };
    expect(() => validateAnchorsData(badAnchors)).toThrow(DataValidationError);
  });

  it("rejects anchors with non-finite position", () => {
    const badAnchors = {
      anchors: {
        rikma: { position: [0, NaN, 1] },
      },
    };
    expect(() => validateAnchorsData(badAnchors)).toThrow(DataValidationError);
  });

  it("rejects mismatched anchor references", () => {
    const { vocab, anchors } = validateAllData(vocabJson, anchorsJson);
    const brokenVocab = {
      ...vocab,
      words: [
        { ...vocab.words[0]!, anchor_id: "anchor_nonexistent" },
        ...vocab.words.slice(1),
      ],
    };
    expect(() => validateCrossReference(brokenVocab, anchors)).toThrow(
      /references anchor 'anchor_nonexistent' but no anchor with key 'nonexistent' exists/,
    );
  });
});
