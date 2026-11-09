import { describe, it, expect, beforeEach } from "vitest";
import {
  createSession,
  validateName,
  selectWord,
  setWordPoints,
  answerCorrect,
  answerWrong,
  useHint,
  isSessionComplete,
  createDebouncer,
} from "../src/core/session";

describe("Session state machine", () => {
  const wordIds = [
    "rikma", "mustaka", "soca", "grana", "lathi", "jangga", "talingan",
    "padharan", "asta", "racikan", "jaja", "ampeyan", "jengku", "pamidhangan",
  ];

  it("creates a fresh session with correct defaults", () => {
    const session = createSession("Budi", wordIds);
    expect(session.name).toBe("Budi");
    expect(session.hintsLeft).toBe(3);
    expect(session.correct).toBe(0);
    expect(session.wrong).toBe(0);
    expect(session.hintsUsed).toBe(0);
    expect(session.activeWordId).toBeNull();
    expect(Object.keys(session.words).length).toBe(14);
    expect(session.words.rikma?.status).toBe("todo");
    expect(session.words.rikma?.wrong).toBe(0);
    expect(session.words.rikma?.hintUsed).toBe(false);
  });

  describe("Name validation", () => {
    it("accepts valid names", () => {
      expect(validateName("Budi", 30)).toBe("Budi");
      expect(validateName("  Siti  ", 30)).toBe("Siti");
    });

    it("rejects empty or whitespace-only names", () => {
      expect(validateName("", 30)).toBeNull();
      expect(validateName("   ", 30)).toBeNull();
    });

    it("truncates names longer than max length", () => {
      const longName = "A".repeat(40);
      const result = validateName(longName, 30);
      expect(result).toHaveLength(30);
    });
  });

  describe("Gameplay transitions", () => {
    it("allows selecting a word", () => {
      let session = createSession("Budi", wordIds);
      session = selectWord(session, "rikma");
      expect(session.activeWordId).toBe("rikma");
    });

    it("allows switching words before answering (K-05)", () => {
      let session = createSession("Budi", wordIds);
      session = selectWord(session, "rikma");
      session = answerWrong(session, "rikma", "wrong_point", true);
      // Switch to mustaka
      session = selectWord(session, "mustaka");
      expect(session.activeWordId).toBe("mustaka");
      // Check that rikma wrong attempt stays recorded
      expect(session.words.rikma?.wrong).toBe(1);
      expect(session.wrong).toBe(1);
    });

    it("stores points for a word", () => {
      let session = createSession("Budi", wordIds);
      const dummyPoints = [
        { id: "rikma", label: "A" },
        { id: "mustaka", label: "B" },
      ];
      session = setWordPoints(session, "rikma", dummyPoints);
      expect(session.words.rikma?.points).toEqual(dummyPoints);
    });

    it("records a correct answer and marks word done", () => {
      let session = createSession("Budi", wordIds);
      session = answerCorrect(session, "rikma");
      expect(session.correct).toBe(1);
      expect(session.words.rikma?.status).toBe("done");

      // Repeated correct calls should be idempotent
      session = answerCorrect(session, "rikma");
      expect(session.correct).toBe(1);
    });

    it("records wrong answers and disables wrong dots (K-03)", () => {
      let session = createSession("Budi", wordIds);
      session = answerWrong(session, "rikma", "point_b", true);
      expect(session.wrong).toBe(1);
      expect(session.words.rikma?.wrong).toBe(1);
      expect(session.words.rikma?.disabledPointIds).toContain("point_b");

      // Second wrong answer
      session = answerWrong(session, "rikma", "point_c", true);
      expect(session.wrong).toBe(2);
      expect(session.words.rikma?.wrong).toBe(2);
      expect(session.words.rikma?.disabledPointIds).toEqual(["point_b", "point_c"]);
    });

    it("manages hints correctly (max 3 session, max 1 per word)", () => {
      let session = createSession("Budi", wordIds);

      // Hint on first word
      const s1 = useHint(session, "rikma");
      expect(s1).not.toBeNull();
      session = s1!;
      expect(session.hintsLeft).toBe(2);
      expect(session.hintsUsed).toBe(1);
      expect(session.words.rikma?.hintUsed).toBe(true);

      // Second hint on same word should fail (K-04: max 1 per word)
      const s2 = useHint(session, "rikma");
      expect(s2).toBeNull();

      // Hint on second word succeeds
      const s3 = useHint(session, "mustaka");
      expect(s3).not.toBeNull();
      session = s3!;
      expect(session.hintsLeft).toBe(1);

      // Hint on third word succeeds
      const s4 = useHint(session, "soca");
      expect(s4).not.toBeNull();
      session = s4!;
      expect(session.hintsLeft).toBe(0);

      // Fourth hint fails because session limit reached
      const s5 = useHint(session, "grana");
      expect(s5).toBeNull();
    });

    it("detects session completion when all 14 are done", () => {
      let session = createSession("Budi", wordIds);
      expect(isSessionComplete(session)).toBe(false);

      for (const id of wordIds) {
        session = answerCorrect(session, id);
      }
      expect(isSessionComplete(session)).toBe(true);
    });
  });

  describe("Debouncer", () => {
    it("debounces rapid calls", async () => {
      const debounce = createDebouncer(50);
      expect(debounce()).toBe(true);
      expect(debounce()).toBe(false); // Immediate next call is rejected
      await new Promise((r) => setTimeout(r, 60));
      expect(debounce()).toBe(true); // After delay, accepted
    });
  });
});

