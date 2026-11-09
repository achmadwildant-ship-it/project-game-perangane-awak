import {
  MAX_HINTS_PER_SESSION,
  MAX_HINTS_PER_WORD,
  WORD_COUNT,
  CLICK_DEBOUNCE_MS,
} from "../config";
import type { SessionState, WordState, GamePoint } from "./types";

const SESSION_KEY = "perangane-awak-session";

/** Create a fresh session state */
export function createSession(name: string, wordIds: string[]): SessionState {
  const words: Record<string, WordState> = {};
  for (const id of wordIds) {
    words[id] = {
      status: "todo",
      wrong: 0,
      hintUsed: false,
      points: null,
      disabledPointIds: [],
    };
  }
  return {
    name,
    startedAt: new Date().toISOString(),
    hintsLeft: MAX_HINTS_PER_SESSION,
    correct: 0,
    wrong: 0,
    hintsUsed: 0,
    words,
    activeWordId: null,
  };
}

/** Save session to sessionStorage */
export function saveSession(session: SessionState): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage might be unavailable in some environments
  }
}

/** Load session from sessionStorage */
export function loadSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

/** Clear session from sessionStorage */
export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

/** Validate player name: trimmed, not empty, max length */
export function validateName(name: string, maxLength: number): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLength) return trimmed.slice(0, maxLength);
  return trimmed;
}

/** Select a word as active */
export function selectWord(session: SessionState, wordId: string): SessionState {
  if (!(wordId in session.words)) return session;
  return { ...session, activeWordId: wordId };
}

/** Store generated points for a word */
export function setWordPoints(
  session: SessionState,
  wordId: string,
  points: GamePoint[],
): SessionState {
  const wordState = session.words[wordId];
  if (!wordState) return session;
  return {
    ...session,
    words: {
      ...session.words,
      [wordId]: { ...wordState, points },
    },
  };
}

/** Record a correct answer */
export function answerCorrect(session: SessionState, wordId: string): SessionState {
  const wordState = session.words[wordId];
  if (!wordState || wordState.status === "done") return session;
  return {
    ...session,
    correct: session.correct + 1,
    words: {
      ...session.words,
      [wordId]: { ...wordState, status: "done" },
    },
  };
}

/** Record a wrong answer */
export function answerWrong(
  session: SessionState,
  wordId: string,
  pointId: string,
  disableWrongDots: boolean,
): SessionState {
  const wordState = session.words[wordId];
  if (!wordState || wordState.status === "done") return session;
  const newDisabled = disableWrongDots
    ? [...wordState.disabledPointIds, pointId]
    : wordState.disabledPointIds;
  return {
    ...session,
    wrong: session.wrong + 1,
    words: {
      ...session.words,
      [wordId]: {
        ...wordState,
        wrong: wordState.wrong + 1,
        disabledPointIds: newDisabled,
      },
    },
  };
}

/** Use a hint for the active word */
export function useHint(session: SessionState, wordId: string): SessionState | null {
  const wordState = session.words[wordId];
  if (!wordState) return null;
  if (session.hintsLeft <= 0) return null;
  if (wordState.hintUsed && MAX_HINTS_PER_WORD <= 1) return null;
  if (wordState.status === "done") return null;

  return {
    ...session,
    hintsLeft: session.hintsLeft - 1,
    hintsUsed: session.hintsUsed + 1,
    words: {
      ...session.words,
      [wordId]: { ...wordState, hintUsed: true },
    },
  };
}

/** Check if session is complete (all words done) */
export function isSessionComplete(session: SessionState): boolean {
  const doneCount = Object.values(session.words).filter(
    (w) => w.status === "done",
  ).length;
  return doneCount >= WORD_COUNT;
}

/** Simple debounce tracker */
export function createDebouncer(delayMs: number = CLICK_DEBOUNCE_MS): () => boolean {
  let lastTime = 0;
  return () => {
    const now = Date.now();
    if (now - lastTime < delayMs) return false;
    lastTime = now;
    return true;
  };
}
