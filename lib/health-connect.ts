// Health Connect import layer.
//
// Android is the only native target in this repo. Health Connect is the OS hub
// that Fitbit, Samsung Health, Garmin, Wear OS and other writers expose to apps,
// so one bridge covers the common bands without a vendor SDK for each.
//
// This file is intentionally import-only: it never writes health data back to
// Health Connect. Existing manual entries win, and imported rows are tagged so
// they can be removed in one tap.

import { Capacitor, registerPlugin } from "@capacitor/core";

export type HealthConnectStatus = {
  available: boolean;
  reason: "available" | "web" | "unavailable" | "provider_update_required" | "not_installed";
  message: string;
};

type ValuePoint = { date: string; value: number };

type HealthSnapshot = {
  steps?: ValuePoint[];
  sleepMinutes?: ValuePoint[];
  weightKg?: ValuePoint[];
  exerciseMinutes?: ValuePoint[];
  heartRate?: ValuePoint[];
  restingHeartRate?: ValuePoint[];
};

type StoredEntry = {
  source?: string;
  date?: string;
  timestamp?: number;
  createdAt?: string;
  id?: string;
  [key: string]: unknown;
};

type HealthMetrics = Record<string, { heartRate?: number; restingHeartRate?: number }>;

/** Per-type read access, as Health Connect reports it after the sheet closes. */
export type HealthPermissionTypes = {
  steps?: boolean;
  sleep?: boolean;
  weight?: boolean;
  exercise?: boolean;
  heartRate?: boolean;
  restingHeartRate?: boolean;
};

interface HealthConnectBridge {
  status(): Promise<{ available?: boolean; reason?: string }>;
  requestReadPermissions(): Promise<{ granted?: boolean; types?: HealthPermissionTypes; count?: number }>;
  readData(options: { days: number }): Promise<HealthSnapshot>;
}

const TYPE_LABELS: Record<keyof HealthPermissionTypes, string> = {
  steps: "Steps",
  sleep: "Sleep",
  weight: "Weight",
  exercise: "Workouts",
  heartRate: "Heart rate",
  restingHeartRate: "Resting heart rate",
};

type ImportedSummary = {
  steps: number;
  sleep: number;
  weight: number;
  cardio: number;
  heart: number;
  syncedAt: string;
};

const HealthConnect = registerPlugin<HealthConnectBridge>("HealthConnect");

export const HEALTH_LAST_SYNC_KEY = "ultimatum_health_last_sync";
export const HEALTH_SUMMARY_KEY = "ultimatum_health_summary";
export const HEALTH_METRICS_KEY = "ultimatum_health_metrics";
const SOURCE = "health-connect";

export async function getHealthConnectStatus(): Promise<HealthConnectStatus> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
    return {
      available: false,
      reason: "web",
      message: "Health Connect is available in the Android app.",
    };
  }
  try {
    const result = await HealthConnect.status();
    if (result?.available) {
      return { available: true, reason: "available", message: "Health Connect is ready." };
    }
    const reason = result?.reason;
    if (reason === "provider_update_required") {
      return {
        available: false,
        reason: "provider_update_required",
        message: "Update or install Health Connect, then try again.",
      };
    }
    return {
      available: false,
      reason: "not_installed",
      message: "Health Connect is not installed on this device.",
    };
  } catch {
    return {
      available: false,
      reason: "not_installed",
      message: "The Health Connect bridge is not available in this build.",
    };
  }
}

/**
 * Ask for every read type. Resolves with the per-type result rather than a
 * pass/fail: Health Connect grants each data type separately and the user may
 * reasonably allow Steps but not Sleep, so a partial grant is a success, not
 * the all-or-nothing failure this used to report.
 */
export async function requestHealthPermissions(): Promise<{
  ok: boolean;
  types: HealthPermissionTypes;
  message: string;
}> {
  let result: Awaited<ReturnType<HealthConnectBridge["requestReadPermissions"]>>;
  try {
    result = await HealthConnect.requestReadPermissions();
  } catch (error) {
    return {
      ok: false,
      types: {},
      message: `The permission screen could not be opened (${
        error instanceof Error ? error.message : String(error)
      }).`,
    };
  }

  const types = result?.types ?? {};
  const allowed = (Object.keys(TYPE_LABELS) as (keyof HealthPermissionTypes)[]).filter((key) => types[key]);
  if (allowed.length === 0) {
    return {
      ok: false,
      types,
      message:
        "No data types were allowed. Open the Health Connect settings screen and switch on the ones you want to import, then try again.",
    };
  }

  const denied = (Object.keys(TYPE_LABELS) as (keyof HealthPermissionTypes)[]).filter((key) => !types[key]);
  const list = (keys: (keyof HealthPermissionTypes)[]) => keys.map((key) => TYPE_LABELS[key]).join(", ");
  return {
    ok: true,
    types,
    message:
      denied.length === 0
        ? "All data types are connected."
        : `Connected: ${list(allowed)}. Not allowed: ${list(denied)}.`,
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function dateKeyFromTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function noonTimestamp(dateISO: string): number {
  const date = new Date(`${dateISO}T12:00:00`);
  return Number.isFinite(date.getTime()) ? date.getTime() : Date.now();
}

function hasAnyEntryOnDate(entries: StoredEntry[], dateISO: string): boolean {
  return entries.some((entry) => {
    if (entry?.source === SOURCE) {
      if (entry.date) return entry.date === dateISO;
      return dateKeyFromTimestamp(Number(entry.timestamp) || 0) === dateISO;
    }
    return dateKeyFromTimestamp(Number(entry.timestamp) || Number(entry.createdAt) || 0) === dateISO;
  });
}

/**
 * Pull the last N days from Health Connect and merge into the local-first
 * stores. Manual entries are preserved; imported rows replace older imported
 * rows for the same day, so repeated syncs are idempotent.
 */
export async function syncHealthData(days = 30): Promise<ImportedSummary> {
  if (typeof window === "undefined") {
    return { steps: 0, sleep: 0, weight: 0, cardio: 0, heart: 0, syncedAt: "" };
  }

  const snapshot = (await HealthConnect.readData({ days })) as HealthSnapshot;

  let stepsAdded = 0;
  let sleepAdded = 0;
  let weightAdded = 0;
  let cardioAdded = 0;
  let heartAdded = 0;

  const steps = readJson<StoredEntry[]>("ultimatum_steps_history", []);
  for (const point of snapshot.steps ?? []) {
    const date = point.date;
    if (!date) continue;
    const imported = steps.find(
      (entry) =>
        entry.source === SOURCE &&
        (entry.date === date ||
          dateKeyFromTimestamp(Number(entry.timestamp) || 0) === date),
    );
    if (imported) {
      imported.steps = Math.round(point.value);
      imported.timestamp = noonTimestamp(date);
      stepsAdded++;
      continue;
    }
    if (hasAnyEntryOnDate(steps, date)) continue;
    steps.push({ timestamp: noonTimestamp(date), steps: Math.round(point.value), source: SOURCE });
    stepsAdded++;
  }
  writeJson("ultimatum_steps_history", steps);

  const sleep = readJson<StoredEntry[]>("ultimatum_sleep_history", []);
  for (const point of snapshot.sleepMinutes ?? []) {
    const date = point.date;
    if (!date) continue;
    const existing = sleep.find((entry) => entry?.date === date);
    if (existing && existing.source !== SOURCE) continue;
    const next = {
      date,
      targetWakeTime: existing?.targetWakeTime ?? "07:00",
      actualWakeTime: existing?.actualWakeTime ?? "07:00",
      sunlightLogged: existing?.sunlightLogged ?? false,
      durationHours: Math.round((point.value / 60) * 100) / 100,
      source: SOURCE,
    };
    const index = sleep.findIndex((entry) => entry?.date === date);
    if (index >= 0) sleep[index] = next;
    else sleep.push(next);
    sleepAdded++;
  }
  writeJson("ultimatum_sleep_history", sleep);

  const weight = readJson<StoredEntry[]>("ultimatum_weight_history", []);
  for (const point of snapshot.weightKg ?? []) {
    const date = point.date;
    if (!date) continue;
    const imported = weight.find(
      (entry) => entry.id === `health-${date}` || (entry.source === SOURCE && entry.date === date),
    );
    if (imported) {
      imported.weight = Math.round(point.value * 100) / 100;
      imported.createdAt = new Date(noonTimestamp(date)).toISOString();
      weightAdded++;
      continue;
    }
    if (hasAnyEntryOnDate(weight, date)) continue;
    weight.push({
      id: `health-${date}`,
      weight: Math.round(point.value * 100) / 100,
      createdAt: new Date(noonTimestamp(date)).toISOString(),
      source: SOURCE,
    });
    weightAdded++;
  }
  writeJson("ultimatum_weight_history", weight);

  const cardio = readJson<StoredEntry[]>("ultimatum_cardio_history", []);
  for (const point of snapshot.exerciseMinutes ?? []) {
    const date = point.date;
    if (!date) continue;
    const imported = cardio.find(
      (entry) =>
        entry.source === SOURCE &&
        (entry.date === date ||
          dateKeyFromTimestamp(Number(entry.timestamp) || 0) === date),
    );
    if (imported) {
      imported.minutes = Math.round(point.value);
      imported.timestamp = noonTimestamp(date);
      cardioAdded++;
      continue;
    }
    if (hasAnyEntryOnDate(cardio, date)) continue;
    cardio.push({ timestamp: noonTimestamp(date), minutes: Math.round(point.value), source: SOURCE });
    cardioAdded++;
  }
  writeJson("ultimatum_cardio_history", cardio);

  const metrics = readJson<HealthMetrics>(HEALTH_METRICS_KEY, {});
  for (const point of snapshot.heartRate ?? []) {
    if (!point.date) continue;
    metrics[point.date] = { ...(metrics[point.date] ?? {}), heartRate: Math.round(point.value) };
    heartAdded++;
  }
  for (const point of snapshot.restingHeartRate ?? []) {
    if (!point.date) continue;
    metrics[point.date] = { ...(metrics[point.date] ?? {}), restingHeartRate: Math.round(point.value) };
    heartAdded++;
  }
  writeJson(HEALTH_METRICS_KEY, metrics);

  const summary: ImportedSummary = {
    steps: stepsAdded,
    sleep: sleepAdded,
    weight: weightAdded,
    cardio: cardioAdded,
    heart: heartAdded,
    syncedAt: new Date().toISOString(),
  };
  writeJson(HEALTH_SUMMARY_KEY, summary);
  try {
    localStorage.setItem(HEALTH_LAST_SYNC_KEY, summary.syncedAt);
  } catch {}
  return summary;
}

export async function connectAndSyncHealth(): Promise<{ ok: boolean; message: string }> {
  const status = await getHealthConnectStatus();
  if (!status.available) return { ok: false, message: status.message };

  const permission = await requestHealthPermissions();
  if (!permission.ok) {
    return { ok: false, message: permission.message };
  }

  try {
    const summary = await syncHealthData(30);
    const total =
      summary.steps + summary.sleep + summary.weight + summary.cardio + summary.heart;
    const imported =
      total > 0 ? `Imported ${total} health records.` : "No new records in the last 30 days.";
    return { ok: true, message: `${permission.message} ${imported}` };
  } catch (error) {
    // Name the actual failure: "sync failed" hid everything from a missing
    // permission to a provider that returned no data.
    const detail = error instanceof Error ? error.message : String(error);
    if (detail.includes("NO_PERMISSIONS")) {
      return { ok: false, message: "Health Connect has no allowed data types for this app yet." };
    }
    return { ok: false, message: `Connected, but the import failed (${detail}).` };
  }
}

/** Remove imported health rows without touching manually entered data. */
export function clearImportedHealthData(): void {
  if (typeof window === "undefined") return;
  const clean = (key: string) => {
    const entries = readJson<StoredEntry[]>(key, []);
    const filtered = entries.filter(
      (entry) => entry?.source !== SOURCE && !String(entry?.id ?? "").startsWith("health-"),
    );
    writeJson(key, filtered);
  };
  clean("ultimatum_steps_history");
  clean("ultimatum_sleep_history");
  clean("ultimatum_weight_history");
  clean("ultimatum_cardio_history");
  try {
    localStorage.removeItem(HEALTH_METRICS_KEY);
    localStorage.removeItem(HEALTH_SUMMARY_KEY);
    localStorage.removeItem(HEALTH_LAST_SYNC_KEY);
  } catch {}
}

export function getHealthSummary(): ImportedSummary | null {
  return readJson<ImportedSummary | null>(HEALTH_SUMMARY_KEY, null);
}

export function getHealthMetrics(): HealthMetrics {
  return readJson<HealthMetrics>(HEALTH_METRICS_KEY, {});
}
