// ─────────────────────────────────────────────────────────────────────────────
// One place for "how good was this set?".
//
// The tracker used estimated 1RM for PRs, Training Insights used the heaviest
// set, and the records matrix used max weight per rep count. Three answers for
// the same session produced contradictory progression advice. Every surface now
// imports these helpers so a set is ranked the same way everywhere.
//
// ─────────────────────────────────────────────────────────────────────────────

export type SetLike = {
  weight?: number | string;
  reps?: number | string;
  rir?: number | string;
  timestamp?: number;
  date?: string;
};

// There is one ranking, not a setting. An Epley estimate with reps in reserve
// folded in keeps a heavy triple and a high-rep near-failure set comparable.
// Heaviest-weight and volume rankings each favour one style of training and made
// the app's PRs disagree between screens.

/** One-line explanation shown next to the metric. */
export const PROGRESSION_METRIC_NOTE =
  "Best set = highest estimated 1RM (weight adjusted for the reps you left in reserve). Warm-ups are ignored.";

/** Epley estimate from the reps actually performed. */
export function estimated1RM(weight: number, reps: number): number {
  if (weight > 0 && reps > 0) return weight * (1 + reps / 30);
  return reps > 0 ? reps : 0;
}

/**
 * Epley estimate with reps in reserve folded in. A 10 kg × 5 set @ 2 RIR is
 * treated like a 7-rep effort, which is the same convention the Overload Target
 * already uses (`effectiveReps = reps + rir`).
 */
export function adjusted1RM(weight: number, reps: number, rir?: number | string): number {
  const reserve = parseRir(rir);
  if (weight > 0 && reps > 0) return weight * (1 + (reps + reserve) / 30);
  return reps > 0 ? reps + reserve : 0;
}

export function parseRir(rir?: number | string): number {
  if (rir === undefined || rir === null || rir === "") return 0;
  const parsed = typeof rir === "number" ? rir : parseFloat(String(rir));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function volumeLoad(weight: number, reps: number): number {
  return weight > 0 && reps > 0 ? weight * reps : reps > 0 ? reps : 0;
}

export function setScore(set: SetLike): number {
  return adjusted1RM(Number(set.weight) || 0, Number(set.reps) || 0, set.rir);
}

/**
 * Best set by adjusted e1RM. Ties go to the heavier set, then to the one with
 * more reps.
 */
export function pickBestSet<T extends SetLike>(sets: T[]): T | null {
  let best: T | null = null;
  let bestScore = -Infinity;
  for (const set of sets) {
    const score = setScore(set);
    if (score <= 0) continue;
    if (best === null || score > bestScore + 1e-9) {
      best = set;
      bestScore = score;
      continue;
    }
    if (Math.abs(score - bestScore) > 1e-9) continue;
    const weightDiff = (Number(set.weight) || 0) - (Number(best.weight) || 0);
    const repsDiff = (Number(set.reps) || 0) - (Number(best.reps) || 0);
    if (weightDiff > 0 || (weightDiff === 0 && repsDiff > 0)) {
      best = set;
    }
  }
  return best;
}

function setTimestamp(set: SetLike): number {
  return Number(set.timestamp) || 0;
}

/**
 * Best set from the most recent calendar session. Progression targets should
 * follow the last session's best effort, not a lighter back-off set that
 * happened to be logged last.
 */
export function latestSessionBestSet<T extends SetLike>(sets: T[]): T | null {
  if (sets.length === 0) return null;

  let latest: T | null = null;
  for (const set of sets) {
    if (!latest || setTimestamp(set) > setTimestamp(latest)) latest = set;
  }
  if (!latest) return null;

  const latestDate = latest.date?.trim();
  const session = latestDate
    ? sets.filter((set) => set.date?.trim() === latestDate)
    : sets.filter((set) => {
        const ts = setTimestamp(set);
        if (!ts) return false;
        const a = new Date(ts);
        const b = new Date(setTimestamp(latest));
        return (
          a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate()
        );
      });

  return pickBestSet(session.length > 0 ? session : sets);
}
