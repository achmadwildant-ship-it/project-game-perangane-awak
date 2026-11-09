/** Regions of the body for distractor selection */
export type Region = "head" | "torso" | "arm" | "leg";

/** A single vocabulary word entry from vocab.json */
export interface VocabWord {
  id: string;
  word: string;
  body_part: string;
  region: Region;
  anchor_id: string;
  ngoko: string;
  krama: string;
  krama_inggil: string;
  definition: string;
  example: {
    javanese: string;
    indonesian: string;
  };
  hint: string;
  validation_status: "needs_validation" | "needs_validation_high" | "validated";
  validation_note?: string;
}

/** vocab.json top-level structure */
export interface VocabData {
  meta: {
    title: string;
    version: string;
    word_count: number;
    [key: string]: unknown;
  };
  words: VocabWord[];
}

/** A single anchor point */
export interface AnchorPoint {
  position: [number, number, number];
  radius: number;
  status: string;
  note?: string;
}

/** anchors.json top-level structure */
export interface AnchorsData {
  version: number;
  model: string;
  unit: string;
  note: string;
  normalization: {
    original_height: number;
    scale: number;
    original_center_x: number;
    original_center_z: number;
    original_min_y: number;
  };
  anchors: Record<string, AnchorPoint>;
}

/** A labeled point shown during gameplay */
export interface GamePoint {
  id: string;
  label: string;
}

/** Per-word state in the session */
export interface WordState {
  status: "todo" | "done";
  wrong: number;
  hintUsed: boolean;
  points: GamePoint[] | null;
  disabledPointIds: string[];
}

/** Full session state */
export interface SessionState {
  name: string;
  startedAt: string;
  hintsLeft: number;
  correct: number;
  wrong: number;
  hintsUsed: number;
  words: Record<string, WordState>;
  activeWordId: string | null;
}

/** Score result */
export interface ScoreResult {
  raw: number;
  display: string;
}

/** Score category */
export interface ScoreCategory {
  key: "best" | "good" | "fair" | "low";
  label: string;
}
