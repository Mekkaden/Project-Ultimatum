"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Plus, ChevronRight, Dumbbell } from "lucide-react";
import { CATALOGUE, findCatalogueMovement, movementMatchesQuery } from "@/lib/exercise-catalogue";
import { resolveMovementName } from "@/lib/exercise-aliases";
import { GLOBAL_PROGRESSIONS, PROGRESSION_MOVEMENTS } from "@/lib/progressions";

interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (slotName: string, prescribedEquipment: string, videoUrl?: string, isCustom?: boolean) => void;
}

export default function ExercisePicker({ isOpen, onClose, onSelect }: ExercisePickerProps) {
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"actions" | "movements">("actions");
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customEquipment, setCustomEquipment] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveAction(null);
      setStep("actions");
      setCustomName("");
      setCustomEquipment("");
      setIsCustom(false);
      setTimeout(() => searchRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // One row per joint action. A search matches the action name, the movements
  // inside it, or the primary muscles, so "curl" finds Biceps Curl and
  // "chest" finds Horizontal Press without listing every variant separately.
  const visibleActions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATALOGUE;
    return CATALOGUE.filter(
      (action) =>
        action.name.toLowerCase().includes(q) ||
        action.subtitle.toLowerCase().includes(q) ||
        action.movements.some((m) => movementMatchesQuery(m, q)),
    );
  }, [search]);

  const handleSelectAction = (actionName: string) => {
    setActiveAction(actionName);
    setSearch("");
    setStep("movements");
  };

  const activeMovements = activeAction
    ? (() => {
        const action = CATALOGUE.find((a) => a.name === activeAction);
        if (!action) return [];
        const q = search.trim().toLowerCase();
        if (!q) return action.movements;
        return action.movements.filter((m) => movementMatchesQuery(m, q));
      })()
    : [];

  const handleCustomConfirm = () => {
    const name = customName.trim();
    if (!name) return;
    // User-typed movement: no catalogue entry, so no form animation is ever
    // shown for it (the tracker skips the lookup for isCustom exercises).
    onSelect(name, customEquipment.trim() || name, undefined, true);
    onClose();
  };

  const handleSelectMovement = (movementName: string) => {
    const movement = findCatalogueMovement(movementName);
    const canonical = resolveMovementName(movementName) ?? movementName;
    // Calisthenics movements carry a tier list. Storing the progression key as
    // the exercise (what campaigns do) lets the tracker offer the tier picker.
    const progressionKey = Object.keys(PROGRESSION_MOVEMENTS).find(
      (key) => PROGRESSION_MOVEMENTS[key] === canonical,
    );
    onSelect(
      activeAction ?? movement?.equipment ?? canonical,
      progressionKey ?? canonical,
      progressionKey ? undefined : movement?.videoUrl,
    );
    onClose();
  };

  // Progressions are listed after the catalogue actions. Picking one prescribes
  // the key itself, which the tracker expands into its tier list.
  const visibleProgressions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return Object.keys(GLOBAL_PROGRESSIONS).filter(
      (key) =>
        !q ||
        key.toLowerCase().includes(q) ||
        GLOBAL_PROGRESSIONS[key].title.toLowerCase().includes(q),
    );
  }, [search]);

  const handleSelectProgression = (key: string) => {
    const target = PROGRESSION_MOVEMENTS[key];
    onSelect(target ?? "Calisthenics", key);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-black border-t border-neutral-800 rounded-t-3xl max-h-[88vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-neutral-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 pt-2 shrink-0">
              <div>
                <h2 className="text-base font-black uppercase tracking-widest text-white">
                  {step === "actions" ? "Pick Exercise" : activeAction ?? "Custom Exercise"}
                </h2>
                {step === "movements" && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {CATALOGUE.find((a) => a.name === activeAction)?.subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {step === "movements" && (
                  <button
                    onClick={() => { setStep("actions"); setActiveAction(null); setSearch(""); }}
                    className="text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === "actions" && (
                <motion.div
                  key="actions-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  <div className="px-5 pb-3 shrink-0">
                    <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
                      <Search size={16} className="text-neutral-500 shrink-0" />
                      <input
                        ref={searchRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search actions or exercises..."
                        className="bg-transparent text-sm text-white outline-none flex-1 placeholder-neutral-600"
                      />
                      {search && (
                        <button onClick={() => setSearch("")}>
                          <X size={14} className="text-neutral-500 hover:text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 pb-32 space-y-1">
                    <button
                      onClick={() => { setActiveAction(null); setStep("movements"); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-neutral-900/60 border border-dashed border-neutral-700 hover:border-white/30 transition-all group mb-2"
                    >
                      <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                        <Plus size={16} className="text-neutral-400 group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-neutral-300 group-hover:text-white">Custom Exercise</div>
                        <div className="text-[10px] text-neutral-600 uppercase tracking-widest">Type any name</div>
                      </div>
                    </button>

                    {visibleActions.map((action) => (
                      <button
                        key={action.name}
                        onClick={() => handleSelectAction(action.name)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 hover:bg-neutral-800/60 hover:border-neutral-700 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Dumbbell size={14} className="text-white/70" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{action.name}</div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-widest truncate">
                            {action.subtitle}
                            {` · ${action.movements.length} variations`}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-neutral-600 group-hover:text-white shrink-0" />
                      </button>
                    ))}

                    {visibleProgressions.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleSelectProgression(key)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 hover:bg-neutral-800/60 hover:border-neutral-700 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Dumbbell size={14} className="text-white/70" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">
                            {GLOBAL_PROGRESSIONS[key].title}
                          </div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-widest truncate">
                            Progression · {GLOBAL_PROGRESSIONS[key].subtitle}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-neutral-600 group-hover:text-white shrink-0" />
                      </button>
                    ))}

                    {visibleActions.length === 0 && visibleProgressions.length === 0 && (
                      <div className="text-center text-neutral-600 text-sm py-12 font-bold uppercase tracking-widest">
                        No exercises found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === "movements" && (
                <motion.div
                  key="movements-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  {activeAction === null ? (
                    <div className="flex flex-col gap-4 px-5 pt-2 flex-1">
                      <div>
                        <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Exercise Name *</label>
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="e.g. Incline DB Press Plus"
                          autoFocus
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-white/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">
                          Equipment <span className="text-neutral-700">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={customEquipment}
                          onChange={(e) => setCustomEquipment(e.target.value)}
                          placeholder="e.g. Barbell, Cable, Bodyweight"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-white/50 transition-colors"
                        />
                        <p className="text-[10px] text-neutral-600 mt-2">
                          Custom exercises use a YouTube search for the form video and never a catalogue animation.
                        </p>
                      </div>
                      <div className="pt-4">
                        <button
                          onClick={handleCustomConfirm}
                          disabled={!customName.trim()}
                          className="w-full py-4 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 text-black font-black uppercase tracking-[0.2em] rounded-full transition-all"
                        >
                          Add to Day
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="px-5 pb-3 shrink-0">
                        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
                          <Search size={16} className="text-neutral-500 shrink-0" />
                          <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Search ${activeAction} variations...`}
                            className="bg-transparent text-sm text-white outline-none flex-1 placeholder-neutral-600"
                          />
                          {search && (
                            <button onClick={() => setSearch("")}>
                              <X size={14} className="text-neutral-500 hover:text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto px-5 pb-32 space-y-2">
                        {activeMovements.map((movement) => (
                          <button
                            key={movement.name}
                            onClick={() => handleSelectMovement(movement.name)}
                            className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl border bg-neutral-900/40 border-neutral-800 text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800/60 transition-all"
                          >
                            <div className="text-left min-w-0">
                              <div className="text-sm font-bold truncate">{movement.name}</div>
                              <div className="text-[10px] text-neutral-500 uppercase tracking-widest truncate">
                                {movement.equipment} · {movement.muscles.join(", ")}
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-neutral-600 shrink-0" />
                          </button>
                        ))}
                        {activeMovements.length === 0 && (
                          <div className="text-center text-neutral-600 text-sm py-12 font-bold uppercase tracking-widest">
                            No variations found
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
