import { EXERCISE_DB_MAP } from "./gif-map";
import { EXERCISE_DB } from "./exercise-db";

// Set of valid GIF ids (from the real exercise DB). Used to validate curated
// entries so a typo'd map value can never render a 404 frame.
const VALID_IDS: Set<string> = new Set(EXERCISE_DB.map(([id]) => id));

// ─── Normalization ─────────────────────────────────────────────────────────
// Canonicalize an exercise name so "DB Seated Shoulder Press", "dumbbell
// seated shoulder presses", and "Seated DB Shoulder Press" all compare equal.
function normalize(input: string): string {
  let s = input.toLowerCase();

  // Expand abbreviations (whole-word only)
  s = s
    .replace(/\bdb\b/g, "dumbbell")
    .replace(/\bbb\b/g, "barbell")
    .replace(/\bext\b/g, "extension")
    .replace(/\brdl\b/g, "romanian deadlift")
    .replace(/\bohp\b/g, "overhead press")
    .replace(/\bromanian dl\b/g, "romanian deadlift");

  // Normalize common plurals / spelling variants
  s = s
    .replace(/\bflyes\b/g, "flye")
    .replace(/\bflys\b/g, "flye")
    .replace(/\bflies\b/g, "flye")
    .replace(/\bcurls\b/g, "curl")
    .replace(/\braises\b/g, "raise")
    .replace(/\bpresses\b/g, "press")
    .replace(/\bextensions\b/g, "extension")
    .replace(/\bsquats\b/g, "squat")
    .replace(/\bdips\b/g, "dip")
    .replace(/\bpull-ups\b/g, "pull-up")
    .replace(/\bpull ups\b/g, "pull-up")
    .replace(/\bpush-ups\b/g, "push-up")
    .replace(/\bpush ups\b/g, "push-up")
    .replace(/\bchin-ups\b/g, "chin-up")
    .replace(/\bchin ups\b/g, "chin-up")
    .replace(/\bpulldowns\b/g, "pulldown")
    .replace(/\brows\b/g, "row")
    .replace(/\bshrugs\b/g, "shrug")
    .replace(/\bcrunches\b/g, "crunch")
    .replace(/\bdelts\b/g, "shoulder")
    .replace(/\bdelt\b/g, "shoulder");

  // Strip punctuation -> single spaces
  s = s.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  return s;
}

const tokenize = (s: string) => s.split(" ").filter(Boolean);

// Generic words that shouldn't drive the fuzzy fallback score.
const STOPWORDS = new Set([
  "machine", "cable", "seated", "standing", "weighted", "heavy", "pause",
  "paused", "eccentric", "accentuated", "focus", "bias", "back", "off",
  "light", "progression", "pattern", "variation", "second", "single", "one",
  "unilateral", "myo", "reps", "the", "with", "and", "to", "at", "side",
  "bodyweight", "body", "only", "bar", "rope", "band", "banded", "knee",
]);

// ─── Curated map (pre-normalized, most-specific first) ────────────────────
const CURATED: { norm: string; id: string }[] = Object.entries(EXERCISE_DB_MAP)
  .map(([key, id]) => ({ norm: normalize(key), id }))
  .sort((a, b) => b.norm.length - a.norm.length);

// ─── Fuzzy fallback against the full 876-exercise DB ──────────────────────
function fuzzyMatch(query: string): string | null {
  const qTokens = tokenize(query).filter((t) => !STOPWORDS.has(t));
  // No discriminating tokens (e.g. "bodyweight" alone) — don't guess.
  if (qTokens.length === 0) return null;
  let bestId: string | null = null;
  let bestScore = 0;

  for (const [id, name] of EXERCISE_DB) {
    const cand = normalize(name);
    if (!cand) continue;
    const cTokens = tokenize(cand).filter((t) => !STOPWORDS.has(t));

    let score = 0;
    if (cand === query) {
      score = 1000;
    } else if (query.includes(cand)) {
      score = 900 + cand.length;
    } else if (cand.includes(query)) {
      score = 800 + query.length;
    } else if (qTokens.length && cTokens.length) {
      const set = new Set(cTokens);
      let overlap = 0;
      for (const t of qTokens) if (set.has(t)) overlap++;
      const dice = (2 * overlap) / (qTokens.length + cTokens.length);
      score = dice * 100;
    }

    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  // Require a real signal so we don't return a random GIF.
  return bestScore >= 55 ? bestId : null;
}

// ─── Public API ────────────────────────────────────────────────────────────
export function findGifId(name: string | null | undefined): string | null {
  if (!name) return null;
  const q = normalize(name);
  if (!q) return null;

  // 1. Exact normalized match in the curated map (only if the ID is valid).
  const exact = CURATED.find((c) => c.norm === q);
  if (exact && VALID_IDS.has(exact.id)) return exact.id;

  // 2. Bidirectional containment (longest key first). Forward containment
  //    (query contains key) is always safe. Reverse containment (key contains
  //    query) only applies to a specific multi-word query, otherwise a single
  //    generic word like "bodyweight" would match an arbitrary longer key.
  const qSpecific = q.includes(" ");
  for (const c of CURATED) {
    if (q.includes(c.norm) || (qSpecific && c.norm.includes(q))) {
      // Skip invalid curated entries rather than render a 404.
      if (VALID_IDS.has(c.id)) return c.id;
    }
  }

  // 3. Best-effort match against the real exercise DB (guarantees a valid ID).
  return fuzzyMatch(q);
}
