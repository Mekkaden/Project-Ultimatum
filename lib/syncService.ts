import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Retries a transient Firestore/network operation with exponential backoff.
// The previous implementation gave up after a single attempt (or a 5s race),
// which is exactly how a slow first write silently lost a user's protocol.
async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 1000): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        await sleep(baseDelayMs * Math.pow(2, attempt - 1));
      }
    }
  }
  throw lastError;
}

// ─── Keys synced to/from Firestore ─────────────────────────────────────────
const SYNC_KEYS = [
  "ultimatum_frequency",
  "ultimatum_gender",
  "ultimatum_directive",
  "ultimatum_diet_plan",
  "ultimatum_calories",
  "ultimatum_protein",
  "ultimatum_fats",
  "ultimatum_carbs",
  "ultimatum_training_days",
  "ultimatum_cardio_enabled",
  "ultimatum_cardio_split",
  "ultimatum_flex_enabled",
  "ultimatum_flex_tier",
  "ultimatum_campaign_override",
  "ultimatum_custom_campaign_cache",
  "ultimatum_exercise_notes",
  "ultimatum_health_summary",
  "ultimatum_health_last_sync",
  "ultimatum_health_metrics",
  "ultimatum_water_goal",
  "ultimatum_supplements",
  "ultimatum_weight",
  "ultimatum_height",
  "ultimatum_bodyfat",
];

export async function saveUserSettingsToCloud(explicitUid?: string): Promise<void> {
  if (typeof window === "undefined") return;

  const uid = explicitUid || auth.currentUser?.uid;
  if (!uid) {
    console.warn("[SAVE PROTOCOL] No UID available — skipping cloud save.");
    return;
  }

  console.log("[SAVE PROTOCOL] Attempting to save routine and nutrition for UID:", uid);

  // Collect all non-null values from localStorage
  const data: Record<string, string> = {};
  SYNC_KEYS.forEach(key => {
    const val = localStorage.getItem(key);
    if (val !== null && val !== undefined) {
      data[key] = val;
    }
  });

  if (Object.keys(data).length === 0) {
    console.warn("[SAVE PROTOCOL] Nothing to save — localStorage has no ultimatum_ keys.");
    return;
  }

  console.log("[SAVE PROTOCOL] Keys to save:", Object.keys(data));

  const userDocRef = doc(db, "users", uid);
  try {
    // Use setDoc with merge: true to act as an upsert (create if missing, update if exists)
    await withRetry(
      () =>
        setDoc(
          userDocRef,
          {
            appDataBackup: data,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ),
      3,
      1000
    );
    console.log("[SAVE PROTOCOL SUCCESS] Data confirmed written to Firestore for UID:", uid);
    console.log("[SAVE PROTOCOL SUCCESS] Keys written:", Object.keys(data));
  } catch (error) {
    console.error("[SAVE PROTOCOL ERROR] Firestore setDoc failed after retries:", error);
    throw error;
  }
}

export async function loadUserSettingsFromCloud(explicitUid?: string): Promise<number> {
  if (typeof window === "undefined") return 0;

  const uid = explicitUid || auth.currentUser?.uid;
  if (!uid) {
    console.warn("[FETCH PROTOCOL] No UID available — cannot load from cloud.");
    return 0;
  }

  console.log("[FETCH PROTOCOL] Querying Firestore for UID:", uid);

  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await withRetry(() => getDoc(userDocRef), 3, 1000);

    if (!docSnap.exists()) {
      console.warn("[FETCH PROTOCOL RESULT] Exists: false — No Firestore document for UID:", uid);
      return 0;
    }

    const data = docSnap.data();
    const appDataBackup = data?.appDataBackup;

    if (!appDataBackup || typeof appDataBackup !== "object") {
      console.warn("[FETCH PROTOCOL RESULT] Exists: false — Document has no appDataBackup for UID:", uid);
      return 0;
    }

    const validKeys = Object.keys(appDataBackup).filter(k => SYNC_KEYS.includes(k));

    console.log("[FETCH PROTOCOL RESULT] Exists: true");
    console.log("[FETCH PROTOCOL RESULT] Valid SYNC_KEY fields found:", validKeys.length, "Keys:", validKeys);

    if (validKeys.length === 0) {
      console.warn("[FETCH PROTOCOL RESULT] Document exists but contains no recognized SYNC_KEYS.");
      return 0;
    }

    // Hydrate localStorage with every recognized key
    validKeys.forEach(key => {
      if (appDataBackup[key] !== undefined && appDataBackup[key] !== null) {
        localStorage.setItem(key, String(appDataBackup[key]));
      }
    });

    console.log("[STORE HYDRATED] State successfully updated with custom routine.");
    console.log("[STORE HYDRATED] Keys restored to localStorage:", validKeys);

    return validKeys.length;
  } catch (error) {
    console.error("[FETCH PROTOCOL ERROR] Firestore getDoc failed:", error);
    throw error;
  }
}
