"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGoBack } from "@/lib/useGoBack";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  CalendarDays,
  Check,
  ChevronLeft,
  Dumbbell,
  Eye,
  Layers,
  Play,
  X,
} from "lucide-react";
import {
  SPLIT_LIBRARY,
  applyBuiltInSplit,
  exerciseCount,
  getActiveSplitIds,
  getActiveSplitLabel,
  trainingDayCount,
  type SplitDescriptor,
} from "@/lib/split-library";

type Tab = "resistance" | "flexibility";

const GROUP_ORDER = [
  "Hypertrophy · Male",
  "Hypertrophy · Female",
  "Strength",
  "Calisthenics",
  "Hybrid",
  "Flexibility",
];

/**
 * Turn a campaign targetRIR string into readable lines, e.g.
 *   "S1: 2-1 RIR, S2-3: 1-0 RIR"  -> ["Set 1: 2–1 RIR", "Sets 2–3: 1–0 RIR"]
 * Raw values such as "2-1-1-0" never reach the UI again: users could not tell
 * what the numbers meant.
 */
function formatTargetRir(targetRir?: string): string[] {
  const raw = (targetRir ?? "").trim();
  if (!raw) return ["No RIR target"];
  if (/failure/i.test(raw)) return ["To failure"];

  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const lines: string[] = [];

  for (const part of parts) {
    const match = part.match(/^S(\d+)\s*(?:-\s*S?(\d+))?\s*:\s*(.+?)\s*(?:RIR)?$/i);
    if (!match) {
      // Unranged values such as "1-2 RIR" or "0 RIR" keep their own wording.
      const value = part.replace(/\s*RIR\s*$/i, "").replace(/-/g, "–").trim();
      lines.push(`${value} RIR`);
      continue;
    }
    const [, first, last, value] = match;
    const label = last && last !== first ? `Sets ${first}–${last}` : `Set ${first}`;
    lines.push(`${label}: ${value.trim().replace(/-/g, "–")} RIR`);
  }

  return lines.length > 0 ? lines : [raw];
}

function splitTitle(split: SplitDescriptor): string {
  return split.campaign.title
    .replace(/^CUSTOM:\s*/i, "Custom: ")
    .replace(/^CUSTOM$/i, "Custom");
}

export default function SplitLibraryPage() {
  const router = useRouter();
  const goBack = useGoBack("/campaign");
  const [tab, setTab] = useState<Tab>("resistance");
  const [activeIds, setActiveIds] = useState<{ resistance: string | null; flexibility: string | null }>({
    resistance: null,
    flexibility: null,
  });
  const [preview, setPreview] = useState<SplitDescriptor | null>(null);
  const [pendingUse, setPendingUse] = useState<SplitDescriptor | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mount-only hydration from localStorage: the server cannot know the
    // active split, so this intentionally runs after the first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIds(getActiveSplitIds());
    setMounted(true);
  }, []);

  // The library is a catalogue of what ships with the app. Custom splits are
  // built in the editor, not browsed, so they are not listed here.
  const visible = useMemo(
    () => SPLIT_LIBRARY.filter((split) => split.kind === tab && split.directive !== "custom"),
    [tab],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, SplitDescriptor[]>();
    for (const split of visible) {
      const list = map.get(split.group) ?? [];
      list.push(split);
      map.set(split.group, list);
    }
    return Array.from(map.entries()).sort(
      (a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]),
    );
  }, [visible]);

  const activeId = tab === "flexibility" ? activeIds.flexibility : activeIds.resistance;

  const handleUse = (split: SplitDescriptor) => {
    const result = applyBuiltInSplit(split);
    if (!result.ok) {
      alert(result.reason);
      return;
    }
    setPendingUse(null);
    router.push("/campaign");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            aria-label="Back to campaign"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.15em]">Split Library</h1>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] text-neutral-500 mt-1">
              Inspect every protocol before you change course
            </p>
          </div>
        </div>

        <div className="flex bg-neutral-950 border border-neutral-800 rounded-full p-1 mb-8 max-w-md">
          <button
            onClick={() => setTab("resistance")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
              tab === "resistance" ? "bg-white text-black" : "text-neutral-500 hover:text-neutral-200"
            }`}
          >
            <Dumbbell size={13} /> Resistance
          </button>
          <button
            onClick={() => setTab("flexibility")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
              tab === "flexibility" ? "bg-white text-black" : "text-neutral-500 hover:text-neutral-200"
            }`}
          >
            <Accessibility size={13} /> Flexibility
          </button>
        </div>

        {mounted && !activeId && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 flex items-start gap-3">
            <div className="w-8 h-8 shrink-0 rounded-full border border-neutral-800 bg-black flex items-center justify-center">
              <Dumbbell size={13} className="text-neutral-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Currently running</p>
              <p className="text-xs text-neutral-200 mt-1">{getActiveSplitLabel(activeId)}</p>
              <p className="text-[10px] text-neutral-600 leading-relaxed mt-1">
                Built in the split editor. Choose a protocol below to replace it.
              </p>
            </div>
          </div>
        )}

        {grouped.map(([group, splits]) => (
          <section key={group} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Layers size={13} className="text-neutral-600" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{group}</h2>
              <div className="flex-1 h-px bg-neutral-900" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-700">
                {splits.length} {splits.length === 1 ? "protocol" : "protocols"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {splits.map((split) => {
                const isActive = mounted && activeId === split.id;
                const days = trainingDayCount(split.campaign);
                return (
                  <motion.div
                    key={split.id}
                    layout
                    className="relative rounded-2xl border border-neutral-800 bg-neutral-950 p-4 transition-colors hover:border-neutral-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-black uppercase tracking-wider truncate">{splitTitle(split)}</h3>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-neutral-200 border border-neutral-700 rounded px-1.5 py-0.5">
                              <Check size={9} strokeWidth={3} /> Running
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                          {split.campaign.globalRule}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-full px-2.5 py-1">
                        <CalendarDays size={10} /> {days} training days
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-full px-2.5 py-1">
                        {exerciseCount(split.campaign)} movements
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-5">
                      <button
                        onClick={() => setPreview(split)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-800 text-[10px] font-semibold text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors"
                      >
                        <Eye size={12} /> View
                      </button>
                      {!isActive && (
                        <button
                          onClick={() => setPendingUse(split)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-[10px] font-semibold hover:bg-neutral-200 transition-colors"
                        >
                          <Play size={12} /> Use split
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}

      </div>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full md:max-w-2xl max-h-[85vh] overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-t-[2rem] md:rounded-[2rem] p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-1">{preview.group}</p>
                  <h2 className="text-lg font-black uppercase tracking-wider">{splitTitle(preview)}</h2>
                  <p className="text-[10px] text-neutral-500 mt-1">{preview.campaign.globalRule}</p>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="w-9 h-9 shrink-0 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white"
                  aria-label="Close preview"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  <span className="text-neutral-300 font-semibold">RIR</span> (Reps in Reserve) is how many
                  reps you should have left before failure. Lower is harder.
                </p>
                {preview.campaign.days.map((day) => (
                  <div key={day.id} className="rounded-xl border border-neutral-800 bg-black/40 p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] font-black text-neutral-600">D{day.dayNumber}</span>
                        <h3 className="text-xs font-black uppercase tracking-widest truncate">
                          {day.isRestDay ? "Rest / Recovery" : day.title}
                        </h3>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 shrink-0">
                        {day.isRestDay ? "Rest" : `${day.exercises.length} movements`}
                      </span>
                    </div>
                    {!day.isRestDay && (
                      <div className="space-y-2">
                        {day.exercises.map((exercise, index) => (
                          <div key={`${day.id}-${index}`} className="border-b border-neutral-900/80 pb-2 last:border-b-0 last:pb-0">
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-[11px] text-neutral-200">
                                {exercise.slotName || exercise.prescribedEquipment}
                              </span>
                              <span className="text-[10px] text-neutral-500 shrink-0 text-right">
                                {exercise.sets} {exercise.sets === 1 ? "set" : "sets"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                              {formatTargetRir(exercise.targetRIR).map((line) => (
                                <span key={line} className="text-[10px] text-neutral-500">
                                  {line}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {activeId !== preview.id && (
                <button
                  onClick={() => {
                    setPreview(null);
                    setPendingUse(preview);
                  }}
                  className="mt-5 w-full py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  Use this split
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingUse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPendingUse(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-6"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2">Change protocol</p>
              <h2 className="text-base font-black uppercase tracking-wider mb-2">{splitTitle(pendingUse)}</h2>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                Switching to this split starts it at Day 1 and clears its previous completion tick marks.
                Your workout history and logged sets are not deleted.
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setPendingUse(null)}
                  className="flex-1 py-3 rounded-xl border border-neutral-800 text-neutral-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUse(pendingUse)}
                  className="flex-1 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                >
                  Use split
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
