// Validation for imported backup files.
//
// A backup is a whole-app snapshot, not a workout-log feed: it carries the
// active split, settings, and every `ultimatum_history_*` log. Importing one
// from a different split used to silently switch the user's split and scatter
// completion ticks across the wrong campaign. This module inspects a parsed file
// before anything is written, so the UI can tell the user exactly what will
// change.

const HISTORY_PREFIX = "ultimatum_history_";

export type BackupSet = {
  weight: number;
  reps: number;
  timestamp: number;
};

export type BackupPlan = {
  /** Only backup/settings keys are written; everything else is ignored. */
  data: Record<string, string>;
  settingsCount: number;
  /** exercise key -> number of valid sets found in the file. */
  history: Record<string, number>;
  historySetCount: number;
  /** Exercise keys whose JSON was unreadable or the wrong shape. */
  invalidHistoryKeys: string[];
  /** Short human description of the split stored in the backup, if present. */
  incomingSplit: string | null;
  /** Fingerprint of the split settings, for comparing with the current one. */
  incomingSplitKey: string | null;
  currentSplit: string | null;
  currentSplitKey: string | null;
  /** True when the file's split settings differ from the device's. */
  splitMismatch: boolean;
  /** True when the file would overwrite existing local workout history. */
  overwritesHistory: boolean;
};

export type BackupRejection = { ok: false; reason: string };
export type BackupApproval = { ok: true; plan: BackupPlan };

export class BackupError extends Error {}

/** Message for bytes that do not parse as JSON at all. */
export const NOT_PARSEABLE_MESSAGE =
  "That file is not an Ultimatum backup (JSON). Pick the .json file created by Export Data.";

/**
 * Parse the bytes of a picked file. A file that is not JSON at all (a share
 * sheet page, an HTML error, a renamed image, or text that was never saved as
 * UTF-8) produces a {@link BackupError} with a message a lifter can act on,
 * never a raw "Unexpected token" from JSON.parse.
 */
export function parseBackupText(text: string): unknown {
  let content = text ?? "";
  if (!content.trim()) {
    throw new BackupError("That file is empty. Pick the .json file created by Export Data.");
  }
  // Some providers prefix a BOM; JSON.parse would reject it.
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new BackupError(NOT_PARSEABLE_MESSAGE);
  }

  if (typeof parsed === "string") {
    // A backup that was saved as a JSON string ("{\"format\":...}").
    try {
      parsed = JSON.parse(parsed);
    } catch {
      throw new BackupError(NOT_PARSEABLE_MESSAGE);
    }
  }

  if (!parsed || typeof parsed !== "object") {
    throw new BackupError(NOT_PARSEABLE_MESSAGE);
  }
  return parsed;
}

/**
 * One-line description of what a rejected file actually contained, so a failed
 * import says "you picked the file info page" instead of just "not JSON".
 * Only shown to the user; never used to decide anything.
 */
export function describeUnparsedText(text: string): string {
  const trimmed = (text ?? "").replace(/^\uFEFF/, "").trim();
  if (!trimmed) return "The file is empty.";
  const head = trimmed.slice(0, 400);
  if (/^<(!doctype|html|\?xml)/i.test(head)) {
    return "It is a web page, not a backup file (phones sometimes save a 'share' page instead of the file).";
  }
  if (/^%PDF/i.test(head)) return "It is a PDF.";
  if (/^[\u0080-\u00ff]{8,}/.test(trimmed.replace(/\s/g, "").slice(0, 32))) {
    return "Its text is not UTF-8, so it was probably stored as binary.";
  }
  const bytes = new TextEncoder().encode(trimmed).length;
  const kb = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(2)} KB`;
  return `Only ${kb} could be read, starting with "${trimmed.replace(/<\/?[^>]+>/g, "").slice(0, 32).replace(/\s+/g, " ")}".`;
}

/** Read a picked file as UTF-8 text, whatever the platform gave us. */
export async function readPickedFile(file: File): Promise<string> {
  if (typeof file.text === "function") return file.text();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new BackupError("That file could not be read. Try picking it again."));
    reader.readAsText(file);
  });
}

function readSplitKey(data: Record<string, string>): string | null {
  if (data.ultimatum_directive === "custom" || data.ultimatum_frequency === "custom") {
    return "custom";
  }
  if (!data.ultimatum_directive && !data.ultimatum_frequency) return null;
  return [
    data.ultimatum_directive || "hypertrophy",
    data.ultimatum_frequency || "5-days",
    data.ultimatum_gender || "male",
  ].join(":");
}

function describeSplitKey(key: string | null): string | null {
  if (!key) return null;
  const [directive, frequency, gender] = key.split(":");
  const days = (frequency ?? "").replace("-days", "");
  if (directive === "custom" || frequency === "custom") {
    return days ? `Custom Split · ${days} Days` : "Custom Split";
  }
  const name = directive.charAt(0).toUpperCase() + directive.slice(1);
  const who = directive === "hypertrophy" && gender === "female" ? " · Female" : "";
  return days ? `${name} · ${days} Days${who}` : name;
}

function isValidSet(value: unknown): value is BackupSet {
  if (!value || typeof value !== "object") return false;
  const set = value as Record<string, unknown>;
  const weight = Number(set.weight);
  const reps = Number(set.reps);
  const timestamp = Number(set.timestamp);
  return (
    Number.isFinite(weight) &&
    weight >= 0 &&
    Number.isFinite(reps) &&
    reps > 0 &&
    Number.isFinite(timestamp) &&
    timestamp > 0
  );
}

/**
 * Parse and validate a backup file. Throws a {@link BackupError} with a message
 * safe to show the user when the file is not an Ultimatum backup at all.
 * Never writes to storage.
 */
export function readBackupPlan(parsed: unknown): BackupPlan {
  if (!parsed || typeof parsed !== "object") {
    throw new BackupError("This file is not a valid JSON backup.");
  }

  const envelope = parsed as Record<string, unknown>;
  const isEnvelope = envelope.format === "ultimatum-backup";

  if (typeof envelope.format === "string" && envelope.format !== "ultimatum-backup") {
    throw new BackupError(
      `That JSON file is not an Ultimatum backup (it is a "${envelope.format}" file).`,
    );
  }

  // A campaign/split export is a different document type entirely.
  if (!isEnvelope && Array.isArray(envelope.days)) {
    throw new BackupError("This file is a workout split, not a backup. Use the Split Library to activate splits.");
  }

  const rawData = isEnvelope ? envelope.data : envelope;
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
    throw new BackupError("This backup has no settings data.");
  }

  const data: Record<string, string> = {};
  const history: Record<string, number> = {};
  const invalidHistoryKeys: string[] = [];
  let settingsCount = 0;

  for (const [key, value] of Object.entries(rawData as Record<string, unknown>)) {
    if (!key.startsWith("ultimatum_") || typeof value !== "string") continue;

    if (key.startsWith(HISTORY_PREFIX)) {
      const exercise = key.slice(HISTORY_PREFIX.length);
      try {
        const logs = JSON.parse(value);
        if (!Array.isArray(logs)) throw new Error("not an array");
        const valid = logs.filter(isValidSet);
        // A log key that parses but holds no usable set is dropped, not written.
        if (valid.length > 0) {
          history[exercise] = valid.length;
          data[key] = JSON.stringify(valid);
        } else {
          invalidHistoryKeys.push(exercise);
        }
      } catch {
        invalidHistoryKeys.push(exercise);
      }
      continue;
    }

    data[key] = value;
    settingsCount++;
  }

  const historySetCount = Object.values(history).reduce((sum, count) => sum + count, 0);
  if (settingsCount === 0 && historySetCount === 0) {
    throw new BackupError("The file contains no Ultimatum data.");
  }

  // A file that only carries split keys has no history or preferences worth
  // importing; merging it would just switch the user's split under an empty
  // confirmation.
  const hasOnlySplitSettings = Object.keys(data).every(
    (key) =>
      key === "ultimatum_directive" ||
      key === "ultimatum_frequency" ||
      key === "ultimatum_gender",
  );
  if (historySetCount === 0 && hasOnlySplitSettings) {
    throw new BackupError("The file contains no Ultimatum data.");
  }

  const incomingSplitKey = readSplitKey(data);
  const currentSplitKey =
    typeof window === "undefined"
      ? null
      : readSplitKey({
          ultimatum_directive: localStorage.getItem("ultimatum_directive") ?? "",
          ultimatum_frequency: localStorage.getItem("ultimatum_frequency") ?? "",
          ultimatum_gender: localStorage.getItem("ultimatum_gender") ?? "",
        });

  let overwritesHistory = false;
  if (typeof window !== "undefined") {
    overwritesHistory = Object.keys(history).some(
      (exercise) => localStorage.getItem(`${HISTORY_PREFIX}${exercise}`) !== null,
    );
  }

  return {
    data,
    settingsCount,
    history,
    historySetCount,
    invalidHistoryKeys,
    incomingSplit: describeSplitKey(incomingSplitKey),
    incomingSplitKey,
    currentSplit: describeSplitKey(currentSplitKey),
    currentSplitKey,
    splitMismatch:
      incomingSplitKey !== null && currentSplitKey !== null && incomingSplitKey !== currentSplitKey,
    overwritesHistory,
  };
}

/** Human summary used in the confirmation sheet. */
export function describeBackupPlan(plan: BackupPlan): string[] {
  const exercises = Object.keys(plan.history).length;
  const lines = [
    `${plan.settingsCount} ${plan.settingsCount === 1 ? "setting" : "settings"}`,
    `${plan.historySetCount} logged ${plan.historySetCount === 1 ? "set" : "sets"} across ${exercises} ${
      exercises === 1 ? "exercise" : "exercises"
    }`,
  ];
  if (plan.splitMismatch) {
    lines.push(`Split changes from ${plan.currentSplit ?? "unknown"} to ${plan.incomingSplit ?? "unknown"}`);
  } else if (plan.incomingSplit) {
    lines.push(`Split stays ${plan.incomingSplit}`);
  }
  if (plan.overwritesHistory) {
    lines.push("Existing workout logs for the same exercises will be replaced");
  }
  if (plan.invalidHistoryKeys.length > 0) {
    const count = plan.invalidHistoryKeys.length;
    lines.push(`${count} unreadable exercise ${count === 1 ? "log" : "logs"} will be skipped`);
  }
  return lines;
}

/** Write a validated plan. Only called after the user confirms. */
export function applyBackupPlan(plan: BackupPlan): number {
  if (typeof window === "undefined") return 0;
  let written = 0;
  for (const [key, value] of Object.entries(plan.data)) {
    localStorage.setItem(key, value);
    written++;
  }
  return written;
}
