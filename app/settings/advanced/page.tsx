"use client";

import { useState, useEffect, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGoBack } from "@/lib/useGoBack";
import { auth } from "@/lib/firebase";
import { 
  LogOut, ChevronLeft, Download, Upload, CloudDownload,
  Shield, FileText, Bell, BellOff, Trash2
} from "lucide-react";
import { cancelAllNotifications, requestNotificationPermissions, scheduleDailyReminders } from "@/lib/notifications";
import { montserrat } from "@/app/fonts";
import { Capacitor } from '@capacitor/core';
import { getAllProgressPhotos, addProgressPhoto } from '@/lib/db';
import {
  BackupError,
  NOT_PARSEABLE_MESSAGE,
  applyBackupPlan,
  describeBackupPlan,
  describeUnparsedText,
  parseBackupText,
  readBackupPlan,
  readPickedFile,
  type BackupPlan,
} from '@/lib/backup-import';
import {
  BackupFileError,
  exportBackupToDevice,
  pickBackupFile,
  pluginMessage,
} from '@/lib/backup-file';
import {
  hasNativeBackupIo,
  readBackupViaSaf,
  saveBackupViaSaf,
} from '@/lib/backup-saf';

export default function AdvancedSettingsPage() {
  const router = useRouter();
  const goBack = useGoBack("/settings");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Account deletion is irreversible, so it takes its own confirmation step
  // with a typed word: Google Play requires an in-app deletion route, and a
  // single stray tap must not be able to destroy an account.
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [importPlan, setImportPlan] = useState<BackupPlan | null>(null);
  // The original parsed file, kept only for the progress photos it may carry.
  const pendingEnvelope = useRef<Record<string, unknown> | null>(null);
  // Export and import both run a system dialog; a second tap must not start
  // another one while the first is open.
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    setNotificationsEnabled(localStorage.getItem("ultimatum_notifications") === "true");
  }, []);

  /**
   * Every ultimatum_* key with its stored string value. A read that throws
   * (storage disabled, quota bookkeeping) propagates so the export can say so
   * instead of writing a backup that silently lost entries.
   */
  const collectBackupData = (): Record<string, string> => {
    const data: Record<string, string> = {};
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("ultimatum_")) keys.push(key);
    }
    for (const key of keys) {
      data[key] = localStorage.getItem(key) ?? "";
    }
    return data;
  };

  // The backup is versioned so an import can never silently mis-read an older
  // file, and it carries the progress photos, which live in IndexedDB and were
  // being dropped by the old localStorage-only export.
  const handleExportData = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("export");
    try {
      await exportData();
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  const exportData = async () => {
    let data: Record<string, string>;
    try {
      data = collectBackupData();
    } catch (error) {
      // QuotaExceeded and similar: say so instead of writing a half backup.
      alert(`Export failed: your saved data could not be read (${pluginMessage(error)}).`);
      return;
    }
    if (Object.keys(data).length === 0) {
      alert(
        "Export failed: there is no Ultimatum data on this device yet, so the backup would be empty. Log a workout or finish setup first.",
      );
      return;
    }

    let photos: { id: string; date: number; base64: string }[] = [];
    try {
      photos = (await getAllProgressPhotos()).map(({ id, date, base64 }) => ({ id, date, base64 }));
    } catch (e) {
      console.warn("[backup] Progress photos could not be read:", e);
    }

    const backup = {
      format: "ultimatum-backup",
      version: 2,
      exportedAt: new Date().toISOString(),
      data,
      photos,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    // Timestamped to the second so an export never silently merges with an
    // older one saved the same day (in the file manager or in Drive).
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `ultimatum_backup_${stamp}.json`;
    const summary = `${Object.keys(data).length} settings${
      photos.length ? `, ${photos.length} progress photos` : ""
    }, ${(new TextEncoder().encode(jsonStr).length / 1024).toFixed(2)} KB`;

    if (Capacitor.isNativePlatform()) {
      // Android: the system "save as" sheet writes a real .json wherever the
      // user picks (Downloads by default), so a file manager, a USB cable, or
      // Drive's upload button all get the actual backup. The share sheet used
      // to turn it into a page on phones without a JSON-capable Files app.
      if (hasNativeBackupIo()) {
        try {
          const saved = await saveBackupViaSaf(jsonStr, fileName);
          alert(
            saved
              ? `Backup saved as ${saved.fileName} in ${saved.location}.\n\nContains ${summary}.`
              : "Export cancelled: nothing was saved.",
          );
        } catch (error) {
          alert(`Export failed: ${pluginMessage(error)}`);
        }
        return;
      }
      // iOS: no storage-access bridge yet, so write through the filesystem
      // plugin and verify what landed on disk.
      try {
        const result = await exportBackupToDevice(jsonStr, fileName);
        alert(
          `Saved ${result.fileName} in ${result.location} (${(result.sizeBytes / 1024).toFixed(2)} KB).\n\nContains ${summary}.`,
        );
      } catch (error) {
        alert(`Export failed: ${pluginMessage(error)}`);
      }
      return;
    }

    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking in the same tick could cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };


  /**
   * Validate the file, then ask before writing. A backup from another split
   * carries its own split settings and history, so importing it blind used to
   * switch the user's split and mix completion ticks. Nothing is written until
   * the user confirms in the sheet below.
   */
  const readAndStageBackup = (parsed: unknown) => {
    try {
      const plan = readBackupPlan(parsed);
      setImportPlan(plan);
    } catch (error) {
      const message =
        error instanceof BackupError ? error.message : "This file could not be read as a backup.";
      alert(`Import blocked: ${message}`);
    }
  };

  /** Parse + validate a picked file, reporting problems in plain language. */
  const importFileText = (text: string, label?: { name: string; size: number | null }) => {
    let parsed: unknown;
    try {
      parsed = parseBackupText(text);
      pendingEnvelope.current = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch (error) {
      pendingEnvelope.current = null;
      const message =
        error instanceof BackupError ? error.message : "This file could not be read as a backup.";
      // Say which file failed and what was in it, so a wrong pick (the share
      // page, a file-info page) is obvious instead of looking like a broken app.
      const readBytes = new TextEncoder().encode(text).length;
      const what =
        error instanceof BackupError && message === NOT_PARSEABLE_MESSAGE
          ? describeUnparsedText(text)
          : null;
      const details = [
        label ? `File: ${label.name}${label.size != null ? ` (${label.size.toLocaleString()} B on disk)` : ""}.` : null,
        label ? `Read ${readBytes.toLocaleString()} B as text.` : null,
        what,
      ].filter(Boolean);
      alert(`Import failed: ${message}${details.length ? `\n\n${details.join("\n")}` : ""}`);
      return;
    }
    readAndStageBackup(parsed);
  };

  const confirmImport = async () => {
    if (!importPlan) return;
    const result = applyBackupPlan(importPlan);
    let photos = 0;
    // Progress photos ride along when present in the envelope.
    const envelope = pendingEnvelope.current;
    pendingEnvelope.current = null;
    if (envelope && Array.isArray(envelope.photos)) {
      for (const photo of envelope.photos as { id?: string; date?: number; base64?: string }[]) {
        if (!photo?.id || !photo?.base64) continue;
        try {
          await addProgressPhoto({ id: photo.id, date: photo.date ?? Date.now(), base64: photo.base64 });
          photos++;
        } catch {
          // A photo that cannot be stored must not abort the settings restore.
        }
      }
    }
    setImportPlan(null);
    alert(
      `Restored ${result} settings${photos ? ` and ${photos} progress photos` : ""}. The app will now reload.`,
    );
    // Reload back onto the screen the user was on. A plain reload from a root
    // URL restores to the landing page and its gatekeeper first — the flash.
    const { reloadIntoApp } = await import("@/lib/useOfflineSession");
    reloadIntoApp("/settings/advanced");
  };

  /**
   * Import: pick a file with the platform's own dialog, read its bytes
   * natively, and only then validate. Android uses the BackupFile bridge, which
   * hands back the decoded text from the ContentResolver; no content:// URL is
   * ever fetched by the WebView (that fetch used to return an error page, which
   * the import reported as "not an Ultimatum backup").
   */
  const handleImportData = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("import");
    try {
      let label: { name: string; size: number | null } | undefined;
      let text: string | null = null;

      if (hasNativeBackupIo()) {
        const picked = await readBackupViaSaf();
        if (!picked) return; // sheet dismissed: not an error
        text = picked.text;
        label = { name: picked.name, size: null };
      } else if (Capacitor.isNativePlatform()) {
        const picked = await pickBackupFile();
        if (!picked) return;
        text = picked.text;
        label = { name: picked.name, size: picked.size };
      } else {
        // Browser: the hidden <input type="file">, resolved in pickFromBrowser.
        const picked = await pickFromBrowser();
        if (!picked) return;
        text = picked.text;
        label = { name: picked.name, size: picked.size };
      }

      importFileText(text, label);
    } catch (error) {
      const message =
        error instanceof BackupFileError || error instanceof Error
          ? error.message
          : pluginMessage(error);
      alert(`Import failed: ${message}`);
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  /** Open the hidden file input and resolve with the picked file's text. */
  const pickFromBrowser = () =>
    new Promise<{ name: string; size: number | null; text: string } | null>((resolve, reject) => {
      const input = document.getElementById("import-file-input") as HTMLInputElement | null;
      if (!input) {
        reject(new BackupFileError("the file chooser is unavailable"));
        return;
      }
      const onChange = async () => {
        input.removeEventListener("change", onChange);
        input.removeEventListener("cancel", onCancel);
        const file = input.files?.[0];
        // Allow picking the same file again after a failed attempt.
        input.value = "";
        if (!file) {
          resolve(null);
          return;
        }
        try {
          resolve({ name: file.name, size: file.size, text: await readPickedFile(file) });
        } catch (error) {
          reject(error);
        }
      };
      const onCancel = () => {
        input.removeEventListener("change", onChange);
        input.removeEventListener("cancel", onCancel);
        resolve(null);
      };
      input.addEventListener("change", onChange);
      input.addEventListener("cancel", onCancel);
      input.click();
    });

  const handleRestoreFromCloud = async () => {
    if (!auth.currentUser?.uid) {
      alert("Sign in first — cloud restore needs an account.");
      return;
    }
    try {
      const { loadUserSettingsFromCloud } = await import("@/lib/syncService");
      // A pull overwrites local settings, so make a copy first: restoring the
      // wrong account (or a stale backup) would otherwise be unrecoverable.
      const safety = `ultimatum_pre_cloud_restore_${Date.now()}`;
      const snapshot: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("ultimatum_")) snapshot[key] = localStorage.getItem(key) || "";
      }
      localStorage.setItem(safety, JSON.stringify(snapshot));

      const restored = await loadUserSettingsFromCloud();
      if (!restored) {
        alert("No saved backup found for this account. Nothing was changed.");
        return;
      }
      alert(`Cloud backup restored (${restored} settings). The app will now reload.`);
      const { reloadIntoApp } = await import("@/lib/useOfflineSession");
      reloadIntoApp("/settings/advanced");
    } catch {
      alert("Failed to restore from cloud. Check your connection and try again.");
    }
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      await cancelAllNotifications();
      localStorage.setItem("ultimatum_notifications", "false");
      setNotificationsEnabled(false);
      alert("Notifications disabled.");
    } else {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleDailyReminders();
        localStorage.setItem("ultimatum_notifications", "true");
        setNotificationsEnabled(true);
        alert("Daily reminders enabled!");
      } else {
        alert("Permission denied. You may need to enable them in your device settings.");
      }
    }
  };

  /** Wipe every ultimatum_* key from localStorage so the next sign-in starts clean. */
  const clearAllLocalData = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("ultimatum_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  };

  const handleBackupAndLogout = async () => {
    if (isLoggingOut) return; // Guard against double-taps racing the teardown
    setIsLoggingOut(true);

    try {
      // Capture UID BEFORE signOut
      const uid = auth.currentUser?.uid;

      // Best-effort cloud backup with a SHORT cap. A long block here made the
      // first tap look dead (the "logout doesn't work" bug), so we bound it
      // tightly and never let it hang sign-out.
      if (uid) {
        try {
          const { saveUserSettingsToCloud } = await import("@/lib/syncService");
          await Promise.race([
            saveUserSettingsToCloud(uid),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Sync timeout")), 5000))
          ]);
        } catch (e) {
          console.warn("Cloud sync before logout timed out or failed:", e);
        }
      }

      // 1. Invalidate Firebase Auth (awaited so the session is fully cleared
      //    before we navigate — fixes the stale-session race).
      await auth.signOut();

      // 2. Purge all storage cleanly
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("ultimatum_") || key.startsWith("pending_"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      // The instant-open marker must not survive a sign-out, or the next launch
      // would briefly show the signed-out user as signed in.
      localStorage.removeItem("ultimatum_session_active");
      sessionStorage.clear();

      // 3. Flush routing history and reset stack to root atomically
      window.location.href = "/";
    } catch (e) {
      console.error("Logout error:", e);
      window.location.href = "/";
    }
  };

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) return;
    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      const { deleteAccountAndData } = await import("@/lib/delete-account");
      const result = await deleteAccountAndData();
      if (!result.ok) {
        setDeleteError(result.message);
        setIsDeletingAccount(false);
        if (result.reason === "requires-recent-login") {
          setTimeout(() => {
            router.push("/auth");
          }, 2000);
        }
        return;
      }
      // Successful deletion -> redirect to /auth
      router.replace("/auth");
    } catch (error: any) {
      if (error?.code === "auth/requires-recent-login") {
        setDeleteError("For security, please sign out, sign back in, and tap Delete Account again.");
        setTimeout(() => {
          router.push("/auth");
        }, 2000);
      } else {
        setDeleteError(error instanceof Error ? error.message : "The account could not be deleted.");
      }
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className={`min-h-screen bg-black text-slate-50 px-6 py-12 md:py-24 relative overflow-hidden ${montserrat.className}`}>
      
      {/* Hidden file input for import */}
      <input
        type="file"
        id="import-file-input"
        accept=".json,application/json,text/plain,application/octet-stream"
        style={{ display: "none" }}
      />

      {/* Massive Soft Glowing Background Orb */}
      <div className="absolute top-[-10%] left-[10%] w-[80%] h-[40%] bg-white opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>
      
      {/* Import confirmation: shows exactly what the file will change, and
          flags a split mismatch before anything is written. */}
      <AnimatePresence>
        {importPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setImportPlan(null); pendingEnvelope.current = null; }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-6"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">
                {importPlan.splitMismatch ? "Different split detected" : "Confirm import"}
              </p>
              <h2 className="text-base font-black uppercase tracking-wider text-white mb-2">
                {importPlan.splitMismatch ? "Replace your data?" : "Restore this backup?"}
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {importPlan.splitMismatch
                  ? "This backup was made on another split. Importing overwrites your current settings"
                  : "Importing applies this backup on top of your current data"}
                {importPlan.overwritesHistory ? " and replaces workout logs for the same exercises" : ""}.
              </p>

              <ul className="mt-4 space-y-1.5">
                {describeBackupPlan(importPlan).map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[11px] text-neutral-300 leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-600 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2.5 mt-6">
                <button
                  onClick={() => { setImportPlan(null); pendingEnvelope.current = null; }}
                  className="flex-1 py-3 rounded-xl border border-neutral-800 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmImport}
                  className="flex-1 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.18em] hover:bg-neutral-200 transition-colors"
                >
                  {importPlan.splitMismatch ? "Import anyway" : "Import"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto relative z-10 flex flex-col h-full pb-32">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            <span className="text-sm font-semibold tracking-wide">Back to Settings</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-100">
            System Config
          </h1>
        </motion.div>

        <div className="space-y-3 mb-8">
          <ActionRow 
            delay={0.1} 
            title={notificationsEnabled ? "Disable Push Alerts" : "Enable Push Alerts"} 
            subtitle="Daily workout & diet reminders" 
            icon={notificationsEnabled ? BellOff : Bell} 
            onClick={handleToggleNotifications} 
          />
        </div>

        {/* Data & Backup Rows */}
        <h3 className="text-sm font-semibold text-slate-500 mb-4 ml-2">Data & Backup</h3>
        <div className="space-y-3 mb-8">
          <ActionRow
            delay={0.15}
            title="Export Data"
            subtitle={busy === "export" ? "Saving backup…" : "Save a JSON backup of everything"}
            icon={Download}
            onClick={handleExportData}
          />
          <ActionRow
            delay={0.2}
            title="Import Data"
            subtitle={busy === "import" ? "Opening file…" : "Restore from a JSON backup"}
            icon={Upload}
            onClick={handleImportData}
          />
          <ActionRow delay={0.25} title="Restore Cloud" subtitle="Download this account's saved backup" icon={CloudDownload} onClick={handleRestoreFromCloud} />
        </div>

        {/* Legal Rows */}
        <h3 className="text-sm font-semibold text-slate-500 mb-4 ml-2">Policies & Account</h3>
        <div className="space-y-3">
          <ActionRow delay={0.3} title="Terms of Service" subtitle="Agreements" icon={FileText} onClick={() => router.push("/terms-of-service")} />
          <ActionRow delay={0.35} title="Privacy Policy" subtitle="Data protection" icon={Shield} onClick={() => router.push("/privacy-policy")} />
          <ActionRow delay={0.4} title="Logout" subtitle="End session" icon={LogOut} onClick={() => setShowLogoutWarning(true)} isDestructive />
          <ActionRow
            delay={0.45}
            title="Delete Account"
            subtitle="Permanently delete your account and data"
            icon={Trash2}
            onClick={() => {
              setDeleteConfirmText("");
              setDeleteError(null);
              setShowDeleteAccount(true);
            }}
            isDestructive
          />
        </div>

      </div>

      {/* Logout Warning Modal */}
      <AnimatePresence>
        {showLogoutWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-black"
            >
              <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <LogOut size={18} className="text-white/70" />
              </div>
              
              <h2 className="text-base font-bold uppercase tracking-wider text-white mb-2">Data Loss Warning</h2>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                Logging out will clear all locally saved data — workout history, custom splits, and nutrition targets. Export your data first to preserve it.
              </p>
              
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleExportData}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 hover:text-white border border-white/15 font-bold tracking-wider text-[11px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Download size={14} className="text-neutral-400" />
                  EXPORT JSON
                </button>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setShowLogoutWarning(false)}
                    disabled={isLoggingOut}
                    className="flex-1 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-neutral-200 font-bold tracking-wider text-[11px] transition-colors disabled:opacity-50 border border-white/10"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleBackupAndLogout}
                    disabled={isLoggingOut}
                    className="flex-1 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 font-bold tracking-wider text-[11px] transition-colors disabled:opacity-50 border border-red-900/40"
                  >
                    {isLoggingOut ? "..." : "LOGOUT"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation */}
      <AnimatePresence>
        {showDeleteAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-black"
            >
              <div className="w-11 h-11 rounded-xl bg-red-950/40 flex items-center justify-center mb-4 border border-red-900/40">
                <Trash2 size={18} className="text-red-400" />
              </div>

              <h2 className="text-base font-bold uppercase tracking-wider text-white mb-2">
                PERMANENTLY DELETE ACCOUNT?
              </h2>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                This will permanently erase your identity, workout logs, nutrition history, and profile data. This action cannot be undone.
              </p>

              {deleteError && (
                <p className="text-[11px] text-red-400 mb-4 leading-relaxed font-medium">{deleteError}</p>
              )}

              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  disabled={isDeletingAccount}
                  className="flex-1 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-neutral-200 font-bold tracking-wider text-[11px] transition-colors disabled:opacity-50 border border-white/10"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="flex-1 py-3 rounded-xl bg-red-950/60 hover:bg-red-900/70 text-red-300 hover:text-red-200 font-bold tracking-wider text-[11px] transition-colors border border-red-900/50 disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  {isDeletingAccount ? "DELETING…" : "CONFIRM DELETE"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy & Terms link */}
      <div className="mt-12 text-center relative z-10">
        <Link
          href="/privacy"
          className="text-[11px] font-medium tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Privacy &amp; Terms
        </Link>
      </div>
    </div>
  );
}

function ActionRow({ delay, title, subtitle, icon: Icon, onClick, isDestructive = false }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div 
        onClick={onClick}
        className="w-full bg-[#121212] hover:bg-[#1A1A1A] cursor-pointer rounded-3xl p-3 pl-5 flex items-center justify-between transition-colors border border-neutral-800 shadow-sm"
      >
        <div className="flex flex-col">
          <span className={`font-medium text-[15px] ${isDestructive ? 'text-red-400' : 'text-slate-200'}`}>{title}</span>
          <span className="text-slate-500 text-[11px] font-medium mt-0.5">{subtitle}</span>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDestructive ? 'text-red-500' : 'text-[#A1A1AA]'}`}>
          <Icon size={16} />
        </div>
      </div>
    </motion.div>
  );
}
