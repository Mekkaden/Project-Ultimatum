import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SyncQueueItem {
  id?: number; // auto-incremented primary key
  actionType: string;
  payload: any;
  timestamp: string;
  synced: boolean;
}

export interface ProgressPhoto {
  id: string;
  date: number;
  base64: string;
}

interface UltimatumDB extends DBSchema {
  sync_queue: {
    key: number;
    value: SyncQueueItem;
    indexes: { 'by-timestamp': string };
  };
  progress_photos: {
    key: string;
    value: ProgressPhoto;
  };
}

let dbPromise: Promise<IDBPDatabase<UltimatumDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<UltimatumDB>('ultimatum-db', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore('sync_queue', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-timestamp', 'timestamp');
      }
      // v2: progress photos moved out of localStorage (which has a ~5MB quota).
      if (oldVersion < 2) {
        db.createObjectStore('progress_photos', { keyPath: 'id' });
      }
    },
  });
}

export async function addSyncAction(actionType: string, payload: any) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.add('sync_queue', {
    actionType,
    payload,
    timestamp: new Date().toISOString(),
    synced: false,
  });
}

export async function getPendingSyncActions() {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAll('sync_queue');
}

export async function removeSyncAction(id: number) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('sync_queue', id);
}

export async function clearSyncQueue() {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.clear('sync_queue');
}

// ─── Progress Photos (IndexedDB) ───────────────────────────────────────────
export async function getAllProgressPhotos(): Promise<ProgressPhoto[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  const photos = await db.getAll('progress_photos');
  return photos.sort((a, b) => b.date - a.date);
}

export async function addProgressPhoto(photo: ProgressPhoto): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put('progress_photos', photo);
}

/**
 * Wipes every progress photo and the pending sync queue.
 *
 * Used when an account is deleted (and by any full local reset). Progress
 * photos live in IndexedDB, not localStorage, so the localStorage sweep that
 * clears the rest of the account data would otherwise leave them behind.
 */
export async function clearAllProgressPhotos(): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.clear('progress_photos');
  await db.clear('sync_queue');
}

export async function deleteProgressPhoto(id: string): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('progress_photos', id);
}
