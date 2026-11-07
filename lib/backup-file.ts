// Native file I/O for the JSON backup on iOS, and the last-resort reader on
// Android (backup-saf.ts is the Android path).
//
// Why the old import said "not an Ultimatum backup" for a good file:
// it read the picked document with fetch(webPath) / fetch(content://...).
// The picker reports Android documents as `content://...` URIs; a WebView fetch
// of the bridge URL is handled like a page load, so it resolved with an error
// page or threw, and the error page was handed to JSON.parse. A share receiver
// (Solid Explorer) is also what wrote the 13.42 KB "ultimatum_backup_....js..."
// in the first place: the export handed the file to the share sheet instead of
// saving it.
//
// So here: read with Filesystem.readFile, which on Android resolves
// `content://` through the ContentResolver, then fall back to the bridge only
// when the reply is checked to be JSON; never fetch a URL that can download a
// page. Pick with no type filter (a .json must stay selectable whatever MIME
// type its provider reports) and let the import validate the content.

import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { FilePicker } from "@capawesome/capacitor-file-picker";

export type PickedBackupFile = {
  name: string;
  size: number | null;
  mimeType: string | null;
  /** UTF-8 text of the file. */
  text: string;
};

/** Thrown when a file was picked but its bytes could not be read. */
export class BackupFileError extends Error {}

/** Short human message for anything thrown by a Capacitor plugin. */
export function pluginMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return "unknown error";
}

/**
 * Does this text look like the start of a JSON document? Used to reject a
 * WebView-bridge reply that is really an error page or an echoed URL (an error
 * page body contains `{` and `"` too, so a bare JSON.parse would accept it).
 * A BOM is handled by JSON.parse's caller.
 */
export function looksLikeJson(text: string): boolean {
  const head = (text ?? "").replace(/^\uFEFF/, "").trimStart().slice(0, 64);
  if (head.startsWith("{")) return /^\{\s*"/.test(head);
  if (head.startsWith("[")) return /^\[\s*(\{|\]|"|-|\d)/.test(head);
  return head.startsWith('"'); // a backup that was saved as a JSON string
}

/** Prefix some Android providers leave before the real body. */
function stripLengthPrefix(value: string): string {
  const match = /^\s*[\d,]+\s*(?=[{["])/.exec(value);
  return match ? value.slice(match[0].length) : value;
}

function schemeOf(uri: string): string {
  const match = /^([a-z][a-z0-9+.-]*):/i.exec(uri);
  return match ? match[1].toLowerCase() : "";
}

async function readViaFilesystem(uri: string): Promise<string> {
  const attempts: { path: string; directory?: Directory }[] =
    schemeOf(uri) === "file"
      ? [{ path: uri.replace(/^file:\/\//i, "") }]
      : [{ path: uri }];
  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      const read = await Filesystem.readFile({ ...attempt, encoding: Encoding.UTF8 });
      const value = typeof read.data === "string" ? read.data : await (read.data as Blob).text();
      if (value) return stripLengthPrefix(value);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new BackupFileError("the file could not be opened");
}

async function readViaBridge(webPath: string): Promise<string> {
  const response = await fetch(webPath);
  if (!response.ok) throw new BackupFileError(`the system returned HTTP ${response.status}`);
  const text = await response.text();
  if (!looksLikeJson(text)) throw new BackupFileError("the system returned a page instead of the file");
  return stripLengthPrefix(text);
}

/**
 * Read a picked file natively. Never resolves with an error page: every
 * candidate is checked for content, not just for not throwing.
 */
async function readPickedFile(picked: { path?: string; webPath?: string }): Promise<string> {
  const errors: string[] = [];
  if (picked.path) {
    try {
      return await readViaFilesystem(picked.path);
    } catch (error) {
      errors.push(`filesystem read failed (${pluginMessage(error)})`);
    }
  }
  if (picked.webPath) {
    try {
      return await readViaBridge(picked.webPath);
    } catch (error) {
      errors.push(`file link read failed (${pluginMessage(error)})`);
    }
  }
  throw new BackupFileError(errors.join("; ") || "no readable path was returned by the picker");
}

/**
 * Open the system picker and return the chosen backup as text. Resolves null
 * when the user backs out of the picker (that is not an error). Throws
 * {@link BackupFileError} when a file was chosen but could not be read.
 */
export async function pickBackupFile(): Promise<PickedBackupFile | null> {
  let picked: Awaited<ReturnType<typeof FilePicker.pickFiles>>["files"][number] | undefined;
  try {
    const result = await FilePicker.pickFiles({
      // No type filter: a .json must stay selectable whatever MIME type the
      // provider reports. The import itself rejects anything that is not a
      // backup, with a message saying what the file actually was.
      limit: 1,
      readData: false,
    });
    picked = result.files?.[0];
  } catch (error) {
    const code = String((error as { code?: string })?.code ?? "");
    // ERROR_PICK_FILE_CANCELED, or the picker failed to open.
    if (/cancel/i.test(code) || /cancel/i.test(pluginMessage(error))) return null;
    throw new BackupFileError(`Could not open the file picker (${pluginMessage(error)}).`);
  }
  if (!picked) return null;

  let text: string | null = null;
  let readError: unknown = null;
  try {
    text = await readPickedFile(picked);
  } catch (error) {
    readError = error;
  }
  if (text === null && picked.blob) {
    // Some providers only hand over bytes directly.
    try {
      text = await picked.blob.text();
    } catch (error) {
      readError = readError ?? error;
    }
  }
  if (text === null) {
    throw new BackupFileError(`The picked file could not be opened: ${pluginMessage(readError)}`);
  }

  return {
    name: picked.name || "picked file",
    size: typeof picked.size === "number" && picked.size > 0 ? picked.size : null,
    mimeType: picked.mimeType ?? null,
    text,
  };
}

export type NativeExportResult = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Where the copy lives, in words, for the confirmation message. */
  location: string;
  /** The backup lives only inside the app; uninstalling deletes it. */
  appOnly: boolean;
};

const BACKUP_MIME = "application/json";

/**
 * Non-Android fallback for saving the backup (iOS, and any build without the
 * BackupFile bridge -- Android normally goes through backup-saf.ts). Writes a
 * real .json plus a .txt copy (iOS Files previews .json poorly), verifying
 * both read back byte for byte before reporting success.
 */
export async function exportBackupToDevice(json: string, fileName: string): Promise<NativeExportResult> {
  const sizeBytes = new TextEncoder().encode(json).length;
  const textName = fileName.replace(/\.json$/i, "") + ".txt";
  const readBack = async (path: string) => {
    const read = await Filesystem.readFile({ path, directory: Directory.Documents, encoding: Encoding.UTF8 });
    if (typeof read.data !== "string") {
      return read.data instanceof Blob ? await read.data.text() : null;
    }
    // The iOS implementation prepends the byte length to text reads.
    return read.data.replace(/^\d+/, "");
  };

  let wroteJson = false;
  let wroteText = false;
  const errors: string[] = [];

  try {
    await Filesystem.writeFile({
      path: fileName,
      data: json,
      encoding: Encoding.UTF8,
      directory: Directory.Documents,
      recursive: true,
    });
    wroteJson = (await readBack(fileName)) === json;
    if (!wroteJson) errors.push("the .json copy did not read back intact");
  } catch (error) {
    errors.push(`.json write failed (${pluginMessage(error)})`);
  }

  try {
    await Filesystem.writeFile({
      path: textName,
      data: json,
      encoding: Encoding.UTF8,
      directory: Directory.Documents,
      recursive: true,
    });
    wroteText = (await readBack(textName)) === json;
    if (!wroteText) errors.push("the .txt copy did not read back intact");
  } catch (error) {
    errors.push(`.txt write failed (${pluginMessage(error)})`);
  }

  if (!wroteJson && !wroteText) {
    throw new BackupFileError(errors.join("; "));
  }

  return {
    fileName: wroteJson ? fileName : textName,
    mimeType: BACKUP_MIME,
    sizeBytes,
    location: "the app's Documents folder",
    appOnly: true,
  };
}
