import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, BarChart2, Flame, Brain, Camera, Medal, Crosshair } from 'lucide-react';

interface InsightsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Card = ({ icon: Icon, title, what, how }: { icon: any, title: string, what: string | React.ReactNode, how: string | React.ReactNode }) => (
  <div className="bg-black/60 border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-4 transition-transform hover:scale-[1.02]">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
        <Icon className="text-white" size={18} />
      </div>
      <h3 className="text-white text-lg font-bold tracking-tight uppercase">{title}</h3>
    </div>
    
    <div className="flex flex-col gap-3">
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-1">What It Is</h4>
        <div className="text-neutral-400 text-sm leading-relaxed">{what}</div>
      </div>
      <div className="w-full h-px bg-white/5"></div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-1">How To Analyze</h4>
        <div className="text-neutral-400 text-sm leading-relaxed">{how}</div>
      </div>
    </div>
  </div>
);

import { useHardwareBack } from '@/lib/useHardwareBack';

export const InsightsGuideModal: React.FC<InsightsGuideModalProps> = ({ isOpen, onClose }) => {
  useHardwareBack(isOpen, onClose);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex flex-col bg-black overflow-hidden"
        >
          {/* Background image / style mimicking the other modals */}
          <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
            <img 
              src="/images/analytics-bg.jpg" 
              alt="" 
              aria-hidden="true"
              loading="eager"
              decoding="sync"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pb-32">
            <div className="p-6 md:p-8 max-w-lg mx-auto">
              
              <div className="flex justify-end mb-6">
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
                  Analytics Manual
                </h1>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-[280px] mx-auto">
                  Master your data. Understand how to interpret the signals your body is sending.
                </p>
              </div>

              <div className="flex flex-col gap-4 pb-10">
                <Card 
                  icon={Flame} 
                  title="Heatmap" 
                  what="How many working sets each muscle has done in the last 7 days, coloured against that muscle's own effective weekly range — not against a global set count."
                  how={
                    <div className="flex flex-col gap-2">
                      <p>Every muscle has its own minimum effective volume (MEV) and maximum recoverable volume (MRV). The colour tells you where you are inside that range:</p>
                      <ul className="list-disc pl-4 flex flex-col gap-1 mt-1">
                        <li><strong className="text-sky-400">Blue — Below MEV:</strong> Not enough weekly volume for the muscle to grow. Add sets.</li>
                        <li><strong className="text-emerald-400">Green — Effective:</strong> Inside the productive range. Hold here and progress the load.</li>
                        <li><strong className="text-rose-500">Red — Above MRV:</strong> Past the recoverable ceiling. Fatigue is outrunning adaptation; hold the load or cut a set.</li>
                        <li><strong className="text-neutral-500">Dark/Gray:</strong> Zero sets in the last 7 days. Untrained, not automatically a problem.</li>
                      </ul>
                      <p className="mt-1">Tap a body part to see its exact sets against its range. The list under the body shows the same for every muscle. A set counts once per muscle it trains; large lifts no longer inflate their assisting muscles.</p>
                    </div>
                  }
                />

                <Card 
                  icon={BarChart2} 
                  title="Trends" 
                  what="Total working sets per week across every muscle, plotted against a baseline and your weekly target."
                  how={
                    <div className="flex flex-col gap-2">
                      <p>This is your macro-level consistency tracker.</p>
                      <ul className="list-disc pl-4 flex flex-col gap-1 mt-1">
                        <li><strong className="text-white">This Week:</strong> Sets logged since Monday. Because the week is still running, it is projected to a full 7 days before being compared to the baseline — a quiet Monday will not read as a collapse.</li>
                        <li><strong className="text-white">Baseline:</strong> Average sets per completed week in the last 10 weeks. Rest weeks count as zero, so the baseline reflects real consistency.</li>
                        <li><strong className="text-white">Peak Week:</strong> Your highest-volume completed week in the window.</li>
                        <li><strong className="text-sky-400">Weekly Target:</strong> The dashed line — the sum of the minimum effective volume of every muscle you currently train.</li>
                        <li><strong className="text-amber-400">Amber Dot:</strong> A week where your best estimated 1RM beat every earlier week in the window.</li>
                      </ul>
                    </div>
                  }
                />

                <Card 
                  icon={Activity} 
                  title="Recovery" 
                  what="A per-muscle readiness read: how long since it last took load, how much volume it is getting this week, and whether your strength on it is holding between sessions."
                  how={
                    <div className="flex flex-col gap-2">
                      <p>Only the primary movers of an exercise are counted, so a bench press does not mark your triceps as fatigued for three days. Trend compares your last session against the previous session on the same movement, never fixed calendar weeks.</p>
                      <ul className="list-disc pl-4 flex flex-col gap-2 mt-1">
                        <li><strong>Trend:</strong> Strength change between your last two sessions. Blank (—) means there is only one session logged, so there is nothing to compare yet.</li>
                        <li><strong>Priority:</strong> HIGH means act now — either rest it or train it. LOW means it is in hand.</li>
                        <li><strong>Status:</strong>
                          <ul className="list-[circle] pl-4 flex flex-col gap-1 mt-1 text-sm">
                            <li><strong className="text-neutral-400">Never Trained:</strong> No sessions recorded for this muscle.</li>
                            <li><strong className="text-white">Recovering:</strong> Trained within the last 48 hours. Normal; not a warning.</li>
                            <li><strong className="text-white">Fresh:</strong> Outside the recovery window with no prior session to compare.</li>
                            <li><strong className="text-emerald-400">Ready:</strong> Recovered and your strength is holding. Train it.</li>
                            <li><strong className="text-rose-500">Under-Recovering:</strong> Strength dropped noticeably versus your last session. Check sleep, food, and how close to failure you are pushing — or take a deload.</li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  }
                />

                <Card 
                  icon={Brain} 
                  title="Intel" 
                  what="An aggregated view of your systemic variables: Weight Alignment, Active Minutes, Sleep Integrity and Progression Intel."
                  how="Use this to diagnose why you might not be growing or losing fat. Weight Alignment uses your own unit setting. Active Minutes is measured against the cardio protocol you selected. If your training is perfect but your weight is stagnant, the Weight Alignment module will reveal the discrepancy."
                />

                <Card 
                  icon={Camera} 
                  title="Photos" 
                  what="A time-stamped visual database of your physique progress."
                  how="The mirror lies, and the scale fluctuates. Visual evidence is the ultimate truth. Log photos in the same lighting every week to objectively analyze tissue accretion or fat loss over time."
                />

                <Card 
                  icon={Medal} 
                  title="Records" 
                  what="A matrix logging your all-time highest weight achieved for each exact repetition count, per exercise."
                  how="This is your objective strength benchmark. Before your heavy sets, check this matrix. Your goal is to beat these numbers—either by adding a fractional plate or squeezing out 1 more rep."
                />

                <Card 
                  icon={Crosshair} 
                  title="Goals" 
                  what="Your active target locking system. Define specific goals (e.g. a 100 kg Bench Press 1RM, or 20 weekly sets of Barbell Row)."
                  how="A protocol without a clear target is just exercise. Pick the exercise from the catalogue — matching is exact, so a goal on Bench Press never resolves to Close-Grip Bench Press — then set the target type and value. Progress is recalculated from your logged sets."
                />
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
