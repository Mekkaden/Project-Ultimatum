// Backup file I/O that does not depend on the share sheet or on a WebView fetch
// of a content:// URI.
//
// Android: BackupFilePlugin (Storage Access Framework) opens the system
// "save as" / "open" sheets, writes and reads the bytes with the
// ContentResolver, and does the UTF-8 decoding in Java. The file never passes
// through the WebView, so the error-page-as-backup bug cannot happen.
//
// Other platforms fall back to the Web file input (browser) or the picker and
// filesystem plugins (iOS), which handle their own schemes correctly.

import { Capacitor, registerPlugin } from "@capacitor/core";

import { pluginMessage } from "@/lib/backup-file";

type BackupFilePluginApi = {
  saveJson(options: { fileName: string; data: string }): Promise<{
    cancelled: boolean;
    uri?: string;
    name?: string;
  }>;
  readJson(): Promise<{ cancelled: boolean; name?: string; text?: string; size?: number }>;
};

const BackupFile = registerPlugin<BackupFilePluginApi>("BackupFile");

/** True when the native Storage Access Framework bridge is part of this build. */
export function hasNativeBackupIo(): boolean {
  // Checked on the registry handle, not Capacitor.isPluginAvailable(): this
  // Capacitor version's availability probe reads PluginHeaders, which is not
  // where native-registered classes (registerPlugin(...) in MainActivity) land.
  const handle = (Capacitor as unknown as { Plugins?: Record<string, unknown> }).Plugins?.BackupFile;
  return Capacitor.isNativePlatform() && Boolean(handle);
}

export type SavedBackup = {
  fileName: string;
  /** Human description of where it was saved. */
  location: string;
};

/**
 * Save the backup to a file the user chooses. Resolves null when the user
 * dismissed the save sheet. Throws when the file could not be written.
 */
export async function saveBackupViaSaf(json: string, fileName: string): Promise<SavedBackup | null> {
  const result = await BackupFile.saveJson({ fileName, data: json });
  if (result.cancelled) return null;
  return { fileName: result.name || fileName, location: "the folder you picked" };
}

export type ImportedBackupText = { name: string; text: string } | null;

/** Open the system "open" sheet and read the chosen file as UTF-8 text. */
export async function readBackupViaSaf(): Promise<ImportedBackupText> {
  const result = await BackupFile.readJson();
  if (result.cancelled) return null;
  if (typeof result.text !== "string") {
    throw new Error("the system returned no file content");
  }
  return { name: result.name || "picked file", text: result.text };
}

export { pluginMessage };
