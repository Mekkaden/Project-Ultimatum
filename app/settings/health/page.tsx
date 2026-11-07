"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGoBack } from "@/lib/useGoBack";
import { motion } from "framer-motion";
import {
  Activity,
  ChevronLeft,
  HeartPulse,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  clearImportedHealthData,
  connectAndSyncHealth,
  getHealthConnectStatus,
  getHealthSummary,
  syncHealthData,
  type HealthConnectStatus,
} from "@/lib/health-connect";

type Summary = {
  steps: number;
  sleep: number;
  weight: number;
  cardio: number;
  heart: number;
  syncedAt: string;
};

export default function ConnectedHealthPage() {
  const router = useRouter();
  const goBack = useGoBack("/settings");
  const [status, setStatus] = useState<HealthConnectStatus | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [busy, setBusy] = useState<"connect" | "sync" | "clear" | null>(null);
  const [message, setMessage] = useState("");

  const refresh = () => {
    setSummary(getHealthSummary());
  };

  useEffect(() => {
    getHealthConnectStatus().then(setStatus);
    // The import summary lives in localStorage; read it after mount so the
    // server-rendered shell stays deterministic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, []);

  const handleConnect = async () => {
    setBusy("connect");
    setMessage("");
    const result = await connectAndSyncHealth();
    setMessage(result.message);
    setBusy(null);
    refresh();
  };

  const handleSync = async () => {
    setBusy("sync");
    setMessage("");
    try {
      const result = await syncHealthData(30);
      const total = result.steps + result.sleep + result.weight + result.cardio + result.heart;
      setMessage(total > 0 ? `Imported ${total} health records.` : "No new records in the last 30 days.");
    } catch (error) {
      // Say why: "no permission yet" (Sync tapped without connecting first) is
      // a different problem from a provider that refused or returned nothing.
      const detail = error instanceof Error ? error.message : String(error);
      setMessage(
        detail.includes("NO_PERMISSIONS")
          ? "Tap Connect & Sync first to allow Health Connect access."
          : `Sync failed (${detail}). Check Health Connect permissions and retry.`,
      );
    } finally {
      setBusy(null);
      refresh();
    }
  };

  const handleClear = () => {
    if (!confirm("Remove all health records imported from Health Connect? Manual entries are kept.")) {
      return;
    }
    setBusy("clear");
    clearImportedHealthData();
    setMessage("Imported health data removed.");
    setBusy(null);
    refresh();
  };

  const total =
    (summary?.steps ?? 0) + (summary?.sleep ?? 0) + (summary?.weight ?? 0) +
    (summary?.cardio ?? 0) + (summary?.heart ?? 0);

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            aria-label="Back to settings"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.15em]">Connected Health</h1>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] text-neutral-500 mt-1">
              Steps, sleep, weight, cardio and heart rate
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#121212] p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <HeartPulse size={15} className="text-neutral-400 shrink-0" />
              <h2 className="text-sm font-semibold text-white truncate">Health Connect</h2>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-medium text-neutral-400">
              {status === null ? (
                <>
                  <Loader2 size={11} className="animate-spin" /> Checking
                </>
              ) : status.available ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Available
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" /> Unavailable
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed mt-3">
            {status === null
              ? "Checking this device…"
              : status.message}
          </p>
          <p className="text-[11px] text-neutral-600 leading-relaxed mt-2">
            Syncs steps, sleep, weight, workouts and heart rate from the health app on your phone.
          </p>

          {status?.available && (
            <div className="flex flex-wrap gap-2 mt-5">
              <button
                onClick={handleConnect}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-[11px] font-semibold disabled:opacity-50"
              >
                {busy === "connect" ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                Connect &amp; Sync
              </button>
              <button
                onClick={handleSync}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 text-[11px] font-semibold hover:border-neutral-600 disabled:opacity-50"
              >
                {busy === "sync" ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                Sync now
              </button>
            </div>
          )}
        </div>

        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 mb-4"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Last Import</h2>
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">
                {summary.syncedAt ? new Date(summary.syncedAt).toLocaleString() : "Never"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                ["Steps", summary.steps],
                ["Sleep", summary.sleep],
                ["Weight", summary.weight],
                ["Cardio", summary.cardio],
                ["Heart", summary.heart],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-black/50 border border-neutral-900 p-3">
                  <div className="text-lg font-black tabular-nums">{value}</div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-neutral-600">{label}</div>
                </div>
              ))}
            </div>
            {total > 0 && (
              <button
                onClick={handleClear}
                disabled={busy !== null}
                className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-900/50 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-950/20 disabled:opacity-50"
              >
                <Trash2 size={12} /> Remove imported data
              </button>
            )}
          </motion.div>
        )}

        {message && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-xs text-neutral-300">
            {message}
          </div>
        )}

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-neutral-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">What is imported</h2>
          </div>
          <ul className="space-y-2 text-[11px] text-neutral-500 leading-relaxed">
            <li>• Step totals become daily entries in the existing step tracker.</li>
            <li>• Sleep sessions become nightly duration logs.</li>
            <li>• Weight readings become weigh-in history in kilograms.</li>
            <li>• Exercise sessions become cardio minutes.</li>
            <li>• Heart rate and resting heart rate are stored as read-only daily metrics.</li>
          </ul>
          <p className="text-[9px] text-neutral-700 mt-4 leading-relaxed">
            Nothing is written back to Health Connect. Imported rows are tagged and can be removed without
            touching anything you typed manually.
          </p>
        </div>
      </div>
    </div>
  );
}
