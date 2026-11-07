import { Muscle, getMusclesForExercise, getPrimaryMuscles, setLoad } from "./muscleMapping";
import { WeeklySetData } from "../components/WeeklySetsChart";
import { ExerciseInsight, InsightAction } from "../components/ExerciseInsightsList";
import { LABEL_TO_MOVEMENT, resolveMovementName } from "./exercise-aliases";
import { matchCatalogueExercise } from "./exercise-catalogue";
import { adjusted1RM, pickBestSet, setScore } from "./set-metrics";

// Map slot name -> prescribed equipment so history is aggregated under a stable
// exercise identifier (e.g. "Overhead Press (Front Delt Focus)" -> "Barbell
// Overhead Press"). This is what lets records/goals/insights match a user-typed
// exercise name instead of the verbose slot label.
const SLOT_TO_EQUIPMENT = new Map<string, string>();
for (const [label, movement] of Object.entries(LABEL_TO_MOVEMENT)) {
  SLOT_TO_EQUIPMENT.set(label.toLowerCase().trim(), movement);
}

function canonicalExerciseName(name: string): string {
  const mapped = SLOT_TO_EQUIPMENT.get(name.toLowerCase().trim());
  if (mapped) return mapped;
  // Keys are stored without spaces ("ez-bar_curl"), so display the catalogue's
  // own casing instead of the raw key text.
  return matchCatalogueExercise(name)?.movement?.name ?? name;
}

export type HistorySet = {
  weight?: number;
  reps?: number;
  rir?: number | string;
  timestamp?: number;
  date?: string;
  unit?: string;
};

export type ExerciseHistory = {
  exerciseName: string;
  /** False for user-created movements (no catalogue entry). */
  isCatalogueMovement: boolean;
  sets: HistorySet[];
};

// Raw history as stored: one entry per exercise key that actually exists.
export function getExerciseHistories(): ExerciseHistory[] {
  if (typeof window === "undefined") return [];
  const byExercise = new Map<string, HistorySet[]>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("ultimatum_history_")) continue;
    const raw = key.replace("ultimatum_history_", "").replace(/_/g, " ");
    const exerciseName = canonicalExerciseName(raw);
    // Progression tier names and free-text labels are not movements: they must
    // not create fake muscles in the heatmap or fake sessions in recovery.
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(parsed)) continue;
      const existing = byExercise.get(exerciseName) ?? [];
      byExercise.set(exerciseName, existing.concat(parsed));
    } catch {}
  }
  return Array.from(byExercise.entries()).map(([exerciseName, sets]) => ({
    exerciseName,
    // Custom movements are user-named, so they stay in volume totals but are
    // never used to judge recovery of a specific muscle group.
    isCatalogueMovement: !!resolveMovementName(exerciseName),
    sets,
  }));
}

// Helper to get all history from localStorage
const getAllHistory = () => {
  if (typeof window === "undefined") return {};
  const history: Record<string, any[]> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("ultimatum_history_")) {
      let exerciseName = key.replace("ultimatum_history_", "").replace(/_/g, " ");
      // Aggregate under a stable exercise id (prescribed equipment), merging
      // any duplicate slot-name entries for the same movement.
      exerciseName = canonicalExerciseName(exerciseName);
      try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(data)) {
          history[exerciseName] = (history[exerciseName] || []).concat(data);
        }
      } catch (e) {}
    }
  }
  return history;
};

// Distinct exercises (not sets) that train each muscle, so a compound does not
// count as one set per listed muscle and inflate totals.
const getExerciseMuscleContributions = () => {
  const contributions = new Map<string, Muscle[]>();
  for (const { exerciseName } of getExerciseHistories()) {
    if (!contributions.has(exerciseName)) {
      contributions.set(exerciseName, getMusclesForExercise(exerciseName));
    }
  }
  return contributions;
};

export function calcLocalVolumeData(): Record<Muscle, number> {
  const history = getAllHistory();
  const contributions = getExerciseMuscleContributions();
  const volumeData: Partial<Record<Muscle, number>> = {};
  
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  for (const [exerciseName, sets] of Object.entries(history)) {
    // Filter to last 7 days
    const recentSets = sets.filter((s) => (now - (s.timestamp || 0)) < sevenDaysMs);
    if (recentSets.length === 0) continue;

    const muscles = contributions.get(exerciseName) ?? getMusclesForExercise(exerciseName);
    // A set counts once per muscle it trains; the set itself is counted once,
    // never multiplied by the number of listed muscles.
    for (const muscle of muscles) {
      volumeData[muscle] = (volumeData[muscle] || 0) + recentSets.length;
    }
  }

  return volumeData as Record<Muscle, number>;
}

// Monday 00:00 of the week containing `d`.
function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

const WEEKS_SHOWN = 10;

export function calcLocalChartData(): WeeklySetData[] {
  const history = Object.values(getAllHistory());
  const thisMonday = startOfWeek(new Date());
  thisMonday.setHours(0, 0, 0, 0);

  // Build every week in the window, oldest first, so a week with no training
  // shows as 0 instead of vanishing from the chart.
  const buckets = new Map<number, { sets: number; bestE1RM: number; priorBestE1RM: number }>();
  for (let i = WEEKS_SHOWN - 1; i >= 0; i--) {
    const monday = new Date(thisMonday);
    monday.setDate(monday.getDate() - i * 7);
    buckets.set(monday.getTime(), { sets: 0, bestE1RM: 0, priorBestE1RM: 0 });
  }

  for (const sets of history) {
    for (const set of sets) {
      if (!set.timestamp) continue;
      const monday = startOfWeek(new Date(set.timestamp));
      monday.setHours(0, 0, 0, 0);
      const bucket = buckets.get(monday.getTime());
      if (!bucket) continue;
      bucket.sets += 1;
      if (Number(set.weight) > 0 && Number(set.reps) > 0) {
        const e1rm = adjusted1RM(Number(set.weight), Number(set.reps), set.rir);
        if (e1rm > bucket.bestE1RM) bucket.bestE1RM = e1rm;
      }
    }
  }

  const ordered = Array.from(buckets.entries()).sort((a, b) => a[0] - b[0]);

  // A week sets a PR when its best estimated 1RM beats every earlier week.
  let runningBest = 0;
  const rows = ordered.map(([mondayMs, bucket]) => {
    const isPR = bucket.bestE1RM > 0 && bucket.bestE1RM > runningBest + 1e-9;
    if (bucket.bestE1RM > runningBest) runningBest = bucket.bestE1RM;
    const monday = new Date(mondayMs);
    return {
      date: monday.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sets: bucket.sets,
      isPR,
      isCurrent: mondayMs === thisMonday.getTime(),
      // Calendar days elapsed in the week, not 24-hour periods: on Friday
      // afternoon this reads 5, so the projection is not pushed a day ahead.
      daysElapsed: mondayMs === thisMonday.getTime()
        ? Math.min(7, new Date().getDay() === 0 ? 7 : new Date().getDay())
        : 7,
    };
  });

  return rows;
}

export type RecoveryState = "no-data" | "fresh" | "recovering" | "ready" | "stalled" | "under-recovering";

export interface MuscleRecovery {
  status: RecoveryState;
  /** % change in estimated 1RM between the last two sessions that trained it. */
  netScore: number;
  /** Sets logged for this muscle in the last 7 days. */
  setsThisWeek: number;
  /** Hours since the muscle was last trained (null when never trained). */
  hoursSince: number | null;
  /** Muscles still recovering from a recent session. */
  priority: "low" | "high";
  hasTrend: boolean;
}

// Hours a muscle stays in the "recovering" window after a hard session.
const RECOVERY_WINDOW_HOURS = 48;
// A drop bigger than this between two sessions on the same movement is treated
// as fatigue rather than noise.
const STALL_THRESHOLD_PCT = -2.5;

export function calcLocalRecovery(): Record<string, MuscleRecovery> {
  const histories = getExerciseHistories();
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  const stats = new Map<Muscle, { setsThisWeek: number; lastTrained: number; trend: number[] }>();

  for (const { exerciseName, isCatalogueMovement, sets } of histories) {
    // Custom names would guess a muscle from a keyword ("Seated DB Shoulder
    // Press Plus" -> delts); recovery must only speak about real movements.
    if (!isCatalogueMovement || sets.length === 0) continue;
    // Primary movers only: a bench press should not mark the triceps as
    // fatigued for three days just because they assist.
    const muscles = getPrimaryMuscles(exerciseName);
    if (muscles.length === 0) continue;

    for (const muscle of muscles) {
      const entry = stats.get(muscle) ?? { setsThisWeek: 0, lastTrained: 0, trend: [] };
      for (const set of sets) {
        const ts = Number(set.timestamp) || 0;
        if (!ts) continue;
        if (now - ts <= weekMs) entry.setsThisWeek += 1;
        if (ts > entry.lastTrained) entry.lastTrained = ts;
      }
      stats.set(muscle, entry);
    }

    // Session trend: group this movement's sets by day (a session), take the
    // best estimated 1RM of each, and compare the last two sessions. Calendar
    // windows are not used, so a Monday-to-Monday schedule cannot flip the
    // colour on timing alone.
    const byDay = new Map<string, number>();
    for (const set of sets) {
      if (!set.timestamp) continue;
      const day = new Date(set.timestamp).toISOString().slice(0, 10);
      const load = setLoad(Number(set.weight) || 0, Number(set.reps) || 0);
      if (load <= 0) continue;
      byDay.set(day, Math.max(byDay.get(day) ?? 0, load));
    }
    const sessions = Array.from(byDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, load]) => load);
    if (sessions.length >= 2) {
      const prev = sessions[sessions.length - 2];
      const last = sessions[sessions.length - 1];
      const pct = prev > 0 ? ((last - prev) / prev) * 100 : 0;
      for (const muscle of muscles) {
        stats.get(muscle)!.trend.push(pct);
      }
    }
  }

  const recoveryData: Record<string, MuscleRecovery> = {};
  const ALL_MUSCLES: Muscle[] = [
    "chest", "front-delts", "side-delts", "rear-delts", "lats", "traps", "lower-back",
    "abs", "biceps", "triceps", "forearms", "quads", "hamstrings", "glutes", "calves",
  ];

  for (const muscle of ALL_MUSCLES) {
    const entry = stats.get(muscle);
    if (!entry || !entry.lastTrained) {
      // Never trained: say so instead of colouring it as "needs volume".
      recoveryData[muscle] = {
        status: "no-data",
        netScore: 0,
        setsThisWeek: 0,
        hoursSince: null,
        priority: "low",
        hasTrend: false,
      };
      continue;
    }

    const hoursSince = (now - entry.lastTrained) / (60 * 60 * 1000);
    const hasTrend = entry.trend.length > 0;
    // Average across the movements that train this muscle this week.
    const netScore = hasTrend
      ? entry.trend.reduce((sum, v) => sum + v, 0) / entry.trend.length
      : 0;

    let status: RecoveryState;
    if (netScore < STALL_THRESHOLD_PCT) status = "under-recovering";
    else if (hoursSince < RECOVERY_WINDOW_HOURS) status = "recovering";
    else if (!hasTrend) status = "fresh";
    else status = "ready";

    recoveryData[muscle] = {
      status,
      netScore: hasTrend ? netScore : 0,
      setsThisWeek: entry.setsThisWeek,
      hoursSince,
      // Priority reflects what to do next, not just the colour: a fatigued
      // muscle and an untrained muscle both need attention first.
      priority:
        status === "under-recovering"
          ? "high"
          : status === "recovering"
            ? "low"
            : entry.setsThisWeek < 3
              ? "high"
              : "low",
      hasTrend,
    };
  }

  return recoveryData;
}

// ─── Progression Intel ─────────────────────────────────────────────────────
// Compares each exercise SESSION against the previous session on that exercise.
//
// Sets inside one session are not a progression signal: a back-off set is meant
// to be lighter than the top set, so comparing "last set" to "previous set"
// flagged every normal session as a regression. A session only counts once there
// is another session to compare it with, and a PR only counts against earlier
// history.

type SessionSummary = {
  day: string;
  /** Adjusted e1RM of the session's representative set. */
  topE1RM: number;
  topWeight: number;
  topReps: number;
  /** RIR of the set that represents the session (highest adjusted e1RM). */
  rir?: number;
  sets: number;
};

function summariseSessions(sets: HistorySet[]): SessionSummary[] {
  const byDay = new Map<string, HistorySet[]>();
  for (const set of sets) {
    const ts = Number(set.timestamp) || 0;
    if (!ts) continue;
    const day = new Date(ts).toISOString().slice(0, 10);
    const bucket = byDay.get(day) ?? [];
    bucket.push(set);
    byDay.set(day, bucket);
  }

  return Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, daySets]): SessionSummary | null => {
      // The session is represented by its best set by RIR-adjusted e1RM. This
      // is exactly the rule the PR badge uses, so insights cannot disagree with
      // the tracker about which set was the session's best.
      const topSet = pickBestSet(daySets);
      if (!topSet) {
        return null;
      }
      const topWeight = Number(topSet.weight) || 0;
      const topReps = Number(topSet.reps) || 0;
      const rir =
        topSet.rir !== undefined && topSet.rir !== null && topSet.rir !== "" && !isNaN(Number(topSet.rir))
          ? Number(topSet.rir)
          : undefined;
      return {
        day,
        topE1RM: setScore(topSet),
        topWeight,
        topReps,
        rir,
        sets: daySets.length,
      };
    })
    .filter((session): session is SessionSummary => session !== null && session.topE1RM > 0);
}

export function calcLocalInsights(): ExerciseInsight[] {
  const history = getAllHistory();
  const insights: ExerciseInsight[] = [];

  for (const [exerciseName, sets] of Object.entries(history)) {
    if (!Array.isArray(sets) || sets.length === 0) continue;

    const sessions = summariseSessions(sets);
    if (sessions.length === 0) continue;

    const current = sessions[sessions.length - 1];
    const previous = sessions.length >= 2 ? sessions[sessions.length - 2] : null;
    const unit = (sets[sets.length - 1].unit as string) || "KG";

    // The RPE badge only exists when the user actually logged RIR, and it
    // describes the top set of the session, not an arbitrary last set.
    const rpe =
      current.rir !== undefined ? Math.max(1, Math.min(10, 10 - current.rir)) : undefined;

    if (!previous) {
      // One session is not a trend. Say so instead of inventing an arrow.
      insights.push({
        exerciseName,
        progression: "",
        isPositive: false,
        isNegative: false,
        isPR: false,
        rpe,
        action: "Stay consistent",
        comparison: "first-session",
      });
      continue;
    }

    const bestBefore = sessions
      .slice(0, -1)
      .reduce((max, session) => Math.max(max, session.topE1RM), 0);
    const isPR = current.topE1RM > bestBefore + 1e-9;

    const weightDiff = current.topWeight - previous.topWeight;
    const repsDiff = current.topReps - previous.topReps;
    const effortDiff = current.topE1RM - previous.topE1RM;

    // Material change only: a percent of e1RM, never a flat 0.5 kg that any
    // plate change trips.
    const threshold = Math.max(0.02 * previous.topE1RM, 0.5);

    let progression = "";
    let isPositive = false;
    let isNegative = false;
    let action: InsightAction = "Stay consistent";

    if (effortDiff > threshold) {
      isPositive = true;
      progression =
        weightDiff > 0 ? `+${round1(weightDiff)}${unit}` : repsDiff > 0 ? `+${repsDiff} reps` : "up";
      action = isPR ? "Add weight" : "Add reps";
    } else if (effortDiff < -threshold) {
      isNegative = true;
      progression =
        weightDiff < 0 ? `${round1(weightDiff)}${unit}` : repsDiff < 0 ? `${repsDiff} reps` : "down";
      action = "Repeat this weight";
    } else if (isPR) {
      // Equal performance but a fresh best: hold and consolidate.
      action = "Hold progression";
    }

    insights.push({
      exerciseName,
      progression,
      isPositive,
      isNegative,
      isPR,
      rpe,
      action,
      comparison: "vs-previous-session",
      previousDay: previous.day,
    });
  }

  // Concrete changes first, then PRs, then "first session" rows.
  return insights.sort(
    (a, b) =>
      Number(b.isPositive || b.isNegative) - Number(a.isPositive || a.isNegative) ||
      Number(!!b.isPR) - Number(!!a.isPR),
  );
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calcLocalDietAlignment() {
  if (typeof window === "undefined") return null;

  // Use the actual weight history (array of {weight, createdAt}) rather than a
  // single snapshot, so the trend is real.
  let logs: { weight: number; createdAt: string }[] = [];
  try {
    const raw = localStorage.getItem("ultimatum_weight_history");
    logs = raw ? JSON.parse(raw) : [];
  } catch {}

  if (!Array.isArray(logs) || logs.length < 2) {
    const current = logs.length ? Number(logs[logs.length - 1].weight) : null;
    return {
      goal: "Maintain",
      status: "insufficient",
      message: "Log your weight at least twice to see the trend.",
      diff: 0,
      startWeight: current,
      currentWeight: current,
    };
  }

  const sorted = logs.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const startWeight = Number(sorted[0].weight);
  const currentWeight = Number(sorted[sorted.length - 1].weight);
  const diff = Math.round((currentWeight - startWeight) * 10) / 10;

  // Goal is driven by the nutrition objective, not the training directive.
  let dietPlan: any = {};
  try { dietPlan = JSON.parse(localStorage.getItem("ultimatum_diet_plan") || "{}"); } catch {}
  const objective = dietPlan.goal || "";

  let goal = "Maintain";
  let status = "success";
  let message = "Weight is stable.";

  if (objective === "lose_slow" || objective === "lose_fast") {
    goal = "Cut";
    if (diff <= 0) { status = "success"; message = "On track — weight trending down."; }
    else { status = "warning"; message = "Gaining on a cut — tighten intake."; }
  } else if (objective === "mass_bulk" || objective === "lean_muscle") {
    goal = "Bulk";
    if (diff >= 0) { status = "success"; message = "On track — weight trending up."; }
    else { status = "warning"; message = "Losing on a bulk — increase intake."; }
  } else {
    goal = "Maintain";
    if (Math.abs(diff) <= 0.5) { status = "success"; message = "Weight is stable."; }
    else { status = "warning"; message = "Drifting from maintenance."; }
  }

  return { goal, status, message, diff, startWeight, currentWeight };
}
// Records Logic
export function calcLocalRecordsMatrix(): Record<string, Record<number, {weight: number, unit: string}>> {
  const history = getAllHistory();
  const records: Record<string, Record<number, {weight: number, unit: string}>> = {};
  
  for (const [exerciseName, sets] of Object.entries(history)) {
    const formattedName = exerciseName.replace(/_/g, ' ').toUpperCase();
    records[formattedName] = {};
    for (let i = 1; i <= 15; i++) {
      records[formattedName][i] = { weight: 0, unit: 'KG' };
    }
    
    for (const set of sets) {
      const reps = set.reps;
      const weight = set.weight;
      if (reps >= 1 && reps <= 15) {
        if (weight > records[formattedName][reps].weight) {
          records[formattedName][reps] = { weight, unit: set.unit || 'KG' };
        }
      }
    }
  }
  
  // Clean up exercises with no records
  const finalRecords: Record<string, Record<number, {weight: number, unit: string}>> = {};
  for (const [exerciseName, repRecords] of Object.entries(records)) {
    const hasRecords = Object.values(repRecords).some(r => r.weight > 0);
    if (hasRecords) {
      finalRecords[exerciseName] = repRecords;
    }
  }

  return finalRecords;
}

// Goals Logic
export interface TrainingGoal {
  id: string;
  exerciseName: string;
  targetType: "1RM" | "Weight for Reps" | "Volume";
  targetValue: number;
  targetReps?: number;
  createdAt: number;
}

export function getLocalGoals(): TrainingGoal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("ultimatum_training_goals") || "[]");
  } catch (e) {
    return [];
  }
}

export function saveLocalGoal(goal: TrainingGoal) {
  if (typeof window === "undefined") return;
  const current = getLocalGoals();
  current.push(goal);
  localStorage.setItem("ultimatum_training_goals", JSON.stringify(current));
}

export function deleteLocalGoal(id: string) {
  if (typeof window === "undefined") return;
  const current = getLocalGoals();
  localStorage.setItem("ultimatum_training_goals", JSON.stringify(current.filter(g => g.id !== id)));
}
