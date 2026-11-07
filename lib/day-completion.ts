// ─────────────────────────────────────────────────────────────────────────────
// Per-day completion records.
//
// The campaign cursor only says which day is *suggested* next. It cannot tell
// whether a specific day was actually trained, and it is deliberately stored
// per routine mode: resistance and flexibility are independent tracks. Sharing
// one cursor made completing resistance day 2 tick flexibility day 2, because
// the old "index < cursor" fallback treated any earlier day as trained.
//
// Records are scoped by campaign id and day identity. That keeps a 3-day split
// from inheriting the ticks of a 5-day split, and keeps flexibility records away
// from resistance records even when their day numbers line up.
//
// Records are plain localStorage entries so they ride along with the existing
// local-first sync and need no schema change.
// ─────────────────────────────────────────────────────────────────────────────

const LEGACY_PREFIX = "ultimatum_day_complete_";
const RECORD_PREFIX = "ultimatum_day_complete_v2_";
const MIGRATION_PREFIX = "ultimatum_day_complete_migrated_v2_";

export type RoutineMode = "resistance" | "flexibility";

export type DayLike = {
  id?: string;
  dayNumber?: number;
  isRestDay?: boolean;
  exercises?: { prescribedEquipment?: string; slotName?: string; name?: string }[];
};

/** Cursor key for the routine mode. Never share these between modes. */
export function cursorKeyForMode(mode: RoutineMode): string {
  return mode === "flexibility" ? "ultimatum_flex_campaign_day" : "ultimatum_campaign_day";
}

export function readCampaignDay(mode: RoutineMode): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cursorKeyForMode(mode));
    if (raw === null) return null;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCampaignDay(mode: RoutineMode, index: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(cursorKeyForMode(mode), String(Math.max(0, index)));
  } catch {}
}

function campaignScope(campaign: { id?: string } | undefined): string {
  return campaign?.id || "default";
}

function dayIdentity(day: DayLike, index: number): string {
  return String(day.id || day.dayNumber || index + 1);
}

function dayKey(scope: string, day: DayLike, index: number): string {
  return `${RECORD_PREFIX}${scope}:${dayIdentity(day, index)}`;
}

export function isDayRecorded(day: DayLike, index: number, scope = "default"): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(dayKey(scope, day, index)) === "true";
  } catch {
    return false;
  }
}

export function recordDayComplete(day: DayLike, index: number, scope = "default"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(dayKey(scope, day, index), "true");
  } catch {}
}

export function clearDayRecord(day: DayLike, index: number, scope = "default"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(dayKey(scope, day, index));
  } catch {}
}

/**
 * Copy pre-v2 records (keyed only by day id) into the scoped format exactly
 * once per campaign. Day ids are unique across the bundled campaigns, so this
 * cannot leak a flexibility tick into a resistance day.
 *
 * The old shared cursor is intentionally NOT used as a migration source: it may
 * have been advanced by the other routine mode, which is the bug this version
 * fixes.
 */
export function migrateLegacyDayRecords(
  campaign: { id?: string; days?: DayLike[] } | undefined,
): void {
  if (typeof window === "undefined" || !campaign?.days?.length) return;
  const scope = campaignScope(campaign);
  const migrationKey = `${MIGRATION_PREFIX}${scope}`;
  try {
    if (localStorage.getItem(migrationKey) === "true") return;
    campaign.days.forEach((day, index) => {
      const legacyKey = `${LEGACY_PREFIX}${dayIdentity(day, index)}`;
      if (localStorage.getItem(legacyKey) === "true") {
        recordDayComplete(day, index, scope);
      }
    });
    localStorage.setItem(migrationKey, "true");
  } catch {}
}

/**
 * True when every exercise in the day has at least one set logged on the given
 * calendar date (YYYY-MM-DD). Rest days have nothing to log, so this is false
 * for them — a rest day is complete only when explicitly marked.
 *
 * Deliberately no longer part of `isDayComplete`: having sets on the books is
 * not the same as having finished the session, and using it as completion made
 * a day look done after a single logged set. Kept for callers that want to show
 * partial progress, not completion.
 */
export function hasSetsLoggedOn(day: DayLike, dateISO: string): boolean {
  if (typeof window === "undefined") return false;
  const exercises = day.exercises ?? [];
  if (exercises.length === 0) return false;
  try {
    for (const ex of exercises) {
      const name = ex.prescribedEquipment || ex.slotName || ex.name;
      if (!name) return false;
      const key = "ultimatum_history_" + name.replace(/\s+/g, "_").toLowerCase();
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return false;
      if (!parsed.some((set: { date?: string }) => set?.date === dateISO)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Today's date in the same YYYY-MM-DD form the tracker writes on each set. */
export function todayISO(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/**
 * Whether a day is done, for the timeline.
 *
 * Completion is explicit: the user pressed "Mark Day Complete" (or the tracker's
 * equivalent). A day is never reported complete merely because sets exist for
 * its exercises today — logging a single set, or merely opening the tracker and
 * coming back, used to paint the day as done when the session had not been
 * finished. There is also no cursor fallback: a suggested next day must never
 * turn an untrained day into a completed one.
 *
 * `today` is kept in the signature so callers do not have to change, but it no
 * longer influences the answer.
 */
export function isDayComplete(
  day: DayLike,
  index: number,
  scope = "default",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _today = todayISO(),
): boolean {
  return isDayRecorded(day, index, scope);
}

/** Remove every completion record for one campaign (used when activating a split). */
export function clearCampaignProgress(campaign: { id?: string; days?: DayLike[] } | undefined): void {
  if (typeof window === "undefined" || !campaign) return;
  const scope = campaignScope(campaign);
  try {
    (campaign.days ?? []).forEach((day, index) => {
      localStorage.removeItem(dayKey(scope, day, index));
      localStorage.removeItem(`${LEGACY_PREFIX}${dayIdentity(day, index)}`);
    });
    // Mark migration complete so a cleared split cannot re-import old ticks.
    localStorage.setItem(`${MIGRATION_PREFIX}${scope}`, "true");
  } catch {}
}
