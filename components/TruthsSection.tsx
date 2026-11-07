"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Smartphone, TrendingDown, Scale, Dna, Flame, ArrowRight, ArrowLeft } from "lucide-react";
import { useHardwareBack } from "@/lib/useHardwareBack";

const TRUTHS = [
  {
    id: 1,
    title: "Social Media Physiques <span class='text-neutral-500'>Lie</span>",
    body: "Most of what you see online is a heavily fabricated illusion. You are measuring your reality against a highlight reel of strategic lighting, post-workout pumps, calculated angles, and undeclared pharmaceutical assistance masquerading as 'TRT'. Use these influencers as inspiration if you must, but never use them as the benchmark for your own natural progress.",
    icon: Smartphone,
  },
  {
    id: 2,
    title: "The Reality Of <span class='text-neutral-500'>Diminishing Returns</span>",
    body: "Hypertrophy is a game of diminishing returns. The vast majority of your natural potential is unlocked in the beginning. An optimized protocol can yield 50% of your lifetime gains in the first year, pushing to 85-90% by year five. Beyond that, fighting for a single pound of tissue annually is normal. It isn't a plateau; it's simply the biological reality of advanced training.",
    icon: TrendingDown,
  },
  {
    id: 3,
    title: "The Natural <span class='text-neutral-500'>Dichotomy</span>",
    body: "As a natural lifter, you cannot simultaneously possess massive muscular size and shredded conditioning. You must choose your sacrifice. Alternatively, you can hover in the athletic sweet spot (12-15% body fat) where you maintain respectable size, visible definition, and your overall sanity year-round.",
    icon: Scale,
  },
  {
    id: 4,
    title: "Your DNA <span class='text-neutral-500'>Is The Blueprint</span>",
    body: "Your DNA dictates the rules of engagement. It determines your rate of muscle accretion, your maximum muscular potential, how well you handle body fat, and the architectural look of your frame—from muscle insertions to bone structure. However, let's be clear: a relentless work ethic paired with intelligent programming can forge an elite physique on almost anyone.",
    icon: Dna,
  },
  {
    id: 5,
    title: "The Perpetual <span class='text-neutral-500'>Hunger</span>",
    body: "Perpetual dissatisfaction is part of the territory. The hedonic treadmill guarantees that the moment you hit a goal, your baseline shifts and you immediately crave more. Acknowledge this psychological trap. Keep pushing for greatness, but learn to detach and occasionally look back to appreciate the incredible distance you've already covered.",
    icon: Flame,
  }
];

export default function TruthsSection({ isSettingsMode = false }: { isSettingsMode?: boolean }) {
  const router = useRouter();
  const [activeId, setActiveId] = useState(3);

  const activeTruth = TRUTHS.find(t => t.id === activeId) || TRUTHS[2];

  // In settings this screen only serves as a reference: Back returns to the
  // settings it was opened from. When it is part of the initial flow, Back
  // steps back to the gatekeeper; "Continue" moves on to the directive.
  const goBack = () => {
    // Normally there is a screen behind this one (the gatekeeper in onboarding,
    // Settings from the menu). A restored Session can replay /truths as the
    // first entry instead, and Back there would quit the app, so that case is
    // sent to the screen this page belongs to.
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    router.replace(isSettingsMode ? "/settings" : "/");
  };
  useHardwareBack(true, goBack);

  return (
    <section className="relative w-full bg-black min-h-[100dvh] flex flex-col items-center justify-between overflow-hidden">
      
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
          src="/fsdfdjfsdffdsfs/pexels-ciro-palomba-1275986148-31675725.jpg" 
          className="w-full h-full object-cover" 
          alt="Harsh Truths Background" 
        />
        {/* Gradients to blend into black at top and bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent opacity-80 h-32" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Back — the only way out of this screen, on screen and on the phone */}
      <button
        type="button"
        onClick={goBack}
        aria-label={isSettingsMode ? "Back to Settings" : "Back"}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {isSettingsMode ? "Settings" : "Back"}
        </span>
      </button>

      {/* Title Section (Top) */}
      <div className="w-full px-6 pt-16 flex flex-col justify-center items-center relative z-20 text-center">
        <motion.h2 
          className="text-2xl md:text-4xl font-black font-sans text-white tracking-widest pb-1 uppercase"
          animate={{ 
            filter: ["drop-shadow(0px 0px 10px rgba(255,255,255,0.1))", "drop-shadow(0px 0px 20px rgba(255,255,255,0.2))", "drop-shadow(0px 0px 10px rgba(255,255,255,0.1))"] 
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          Harsh Truths
        </motion.h2>
        <p className="text-neutral-400 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mt-1">
          Acknowledge reality before beginning.
        </p>
      </div>

      {/* Interactive Container (Bottom) */}
      <div className="relative w-full max-w-[500px] mx-auto z-20 mt-auto flex flex-col justify-end px-4 pb-4 md:pb-12">
        
        {/* The Glassmorphism Content Area */}
        <div className="relative w-full backdrop-blur-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-start pt-10 px-5 pb-6 md:pb-10 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
           
          {/* The Arc Buttons positioned relative to the top of this card */}
          <div className="absolute -top-12 left-0 right-0 h-32 pointer-events-none flex justify-center z-50">
            {TRUTHS.map((truth, i) => {
              const isActive = activeId === truth.id;
              const Icon = truth.icon;
              
              // Tightly grouped arc coordinates
              let x = 0;
              let y = 0;
              if (i === 2) { x = 0; y = -15; }
              else if (i === 1) { x = -75; y = 5; }
              else if (i === 3) { x = 75; y = 5; }
              else if (i === 0) { x = -140; y = 45; }
              else if (i === 4) { x = 140; y = 45; }

              return (
                <motion.button
                  key={truth.id}
                  onClick={() => setActiveId(truth.id)}
                  // Width is 56px (w-14). Half width is 28px. 
                  // We subtract 28px from the left calc to center it perfectly without using CSS transform.
                  // This fixes the bug where tailwind scale class overrides the transform: translateX.
                  className={`absolute w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto backdrop-blur-xl border
                    ${isActive 
                      ? "bg-white text-black border-white shadow-md z-30" 
                      : "bg-black/60 text-neutral-400 border-white/10 hover:border-white/30 hover:bg-black/80 hover:text-white z-10"}
                  `}
                  style={{
                    left: `calc(50% + ${x}px - 28px)`,
                    top: `${y}px`,
                  }}
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  whileHover={!isActive ? { scale: 1.05 } : {}}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={isActive ? 22 : 18} strokeWidth={isActive ? 2.5 : 1.5} />
                </motion.button>
              );
            })}
          </div>

          {/* Tiny Indicator line */}
          <div className="w-10 h-[3px] bg-white/20 rounded-full mb-6" />

          {/* Content */}
          <div className="flex-1 w-full flex flex-col items-center text-center justify-start min-h-[160px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, scale: 0.98, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -5 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center"
              >
                <h3 
                  className="text-sm md:text-lg font-black uppercase tracking-widest text-white mb-2 md:mb-4"
                  dangerouslySetInnerHTML={{ __html: activeTruth.title }}
                />
                <p className="text-[12px] md:text-sm leading-relaxed text-neutral-300 font-medium">
                  {activeTruth.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!isSettingsMode) router.push("/directive");
            }}
            className={`mt-6 px-8 py-4 bg-white text-black rounded-full text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow w-full max-w-[240px] ${isSettingsMode ? "hidden" : "flex"}`}
          >
            Continue <ArrowRight size={16} strokeWidth={3} />
          </motion.button>

        </div>
      </div>
    </section>
  );
}
