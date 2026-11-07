import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HeartPulse, StretchHorizontal, ChevronRight } from 'lucide-react';

interface InPlaceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "cardio" | "flexibility";
  onConfigured: () => void;
}

const CARDIO_SPLITS = [
  { id: "2-day", label: "Minimalist", desc: "2x 45m Steady State" },
  { id: "3-day", label: "Balanced", desc: "3x 50m Zone 2 Steady" },
  { id: "4-day", label: "Athlete", desc: "1x HIIT, 3x Zone 2" },
  { id: "7-day", label: "Daily", desc: "7x 30m Micro-Sessions" }
];

const FLEX_TIERS = [
  { id: "BEGINNER", label: "Beginner", desc: "Tier 1 Foundation — full body" },
  { id: "INTERMEDIATE", label: "Intermediate", desc: "Tier 2 — regional split" },
  { id: "ADVANCED", label: "Advanced", desc: "Tier 3 — mobility & splits" },
  { id: "PRO", label: "Pro", desc: "Tier 4 — end poses & mastery" }
];

/** The saved cardio split, falling back to the default when unset or unknown. */
function readSavedCardio(): string {
  try {
    const saved = localStorage.getItem("ultimatum_cardio_split");
    return CARDIO_SPLITS.some((entry) => entry.id === saved) ? (saved as string) : "3-day";
  } catch {
    return "3-day";
  }
}

/** The saved flexibility tier, falling back to the default when unset or unknown. */
function readSavedFlex(): string {
  try {
    const saved = localStorage.getItem("ultimatum_flex_tier");
    return FLEX_TIERS.some((entry) => entry.id === saved) ? (saved as string) : "BEGINNER";
  } catch {
    return "BEGINNER";
  }
}

export const InPlaceConfigModal: React.FC<InPlaceConfigModalProps> = ({ isOpen, onClose, mode, onConfigured }) => {
  // Seeded from what is already saved, not from a hardcoded default. The modal
  // used to open with "3-day / BEGINNER" selected every time, so re-opening a
  // protocol showed the wrong choice and redeploying it silently replaced the
  // user's configuration.
  //
  // Each selection is an override that only exists for as long as the user is
  // choosing: while null, the value shown is the saved one, read at render, so
  // the modal is always in step with storage when it opens. No effect is
  // needed, which also keeps it from fighting the user's taps.
  const [cardioChoice, setCardioChoice] = useState<string | null>(null);
  const [flexChoice, setFlexChoice] = useState<string | null>(null);
  const selectedCardio = cardioChoice ?? readSavedCardio();
  const selectedFlex = flexChoice ?? readSavedFlex();

  const handleDeploy = () => {
    if (mode === "cardio") {
      const split = CARDIO_SPLITS.some((entry) => entry.id === selectedCardio) ? selectedCardio : "3-day";
      localStorage.setItem("ultimatum_cardio_split", split);
      localStorage.setItem("ultimatum_cardio_enabled", "true");
    } else {
      const tier = FLEX_TIERS.some((entry) => entry.id === selectedFlex) ? selectedFlex : "BEGINNER";
      localStorage.setItem("ultimatum_flex_tier", tier);
      localStorage.setItem("ultimatum_flex_enabled", "true");
    }
    setCardioChoice(null);
    setFlexChoice(null);
    onConfigured();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-[201] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black flex flex-col pointer-events-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex-shrink-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white">
                    {mode === 'cardio' ? <HeartPulse size={20} /> : <StretchHorizontal size={20} />}
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-widest text-white">
                      {mode}
                    </h2>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 mt-1 font-bold">
                      {mode === 'cardio' ? 'Cardiovascular Health' : 'Mobility & Recovery'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/10 flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[50vh] custom-scrollbar flex-1 bg-black">
                <div className="flex flex-col gap-3">
                  {mode === 'cardio' && CARDIO_SPLITS.map((split) => (
                    <button
                      key={split.id}
                      onClick={() => setCardioChoice(split.id)}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-300 ${
                        selectedCardio === split.id 
                          ? "bg-white/10 border-white shadow-sm" 
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className={`text-xs font-black uppercase tracking-widest mb-1 ${selectedCardio === split.id ? "text-white" : "text-white/70"}`}>{split.label}</span>
                      <span className={`text-[9px] uppercase tracking-widest ${selectedCardio === split.id ? "text-white/70" : "text-white/40"}`}>{split.desc}</span>
                    </button>
                  ))}

                  {mode === 'flexibility' && FLEX_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setFlexChoice(tier.id)}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-300 ${
                        selectedFlex === tier.id 
                          ? "bg-white/10 border-white shadow-sm" 
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className={`text-xs font-black uppercase tracking-widest mb-1 ${selectedFlex === tier.id ? "text-white" : "text-white/70"}`}>{tier.label}</span>
                      <span className={`text-[9px] uppercase tracking-widest ${selectedFlex === tier.id ? "text-white/70" : "text-white/40"}`}>{tier.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 bg-[#0a0a0a] flex-shrink-0">
                <button
                  onClick={handleDeploy}
                  className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 group"
                >
                  Deploy Protocol <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
