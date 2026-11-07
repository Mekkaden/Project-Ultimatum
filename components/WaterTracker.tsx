"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet } from 'lucide-react';

export default function WaterTracker() {
  const [showWaterAlert, setShowWaterAlert] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="w-full flex justify-center px-4 md:px-0">
        <button 
          onClick={() => setShowWaterAlert(true)}
          className="flex flex-col items-center justify-center gap-2 p-8 bg-black border border-blue-900/30 rounded-[32px] text-blue-500 hover:text-white hover:bg-[#111] hover:border-blue-700/50 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.8)] group w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[150px] bg-blue-500 opacity-[0.05] blur-[50px] rounded-full pointer-events-none" />
          <div className="w-16 h-16 rounded-full bg-blue-950/50 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-blue-900/50 transition-all border border-blue-900/30">
            <Droplet size={28} className="text-blue-500 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Log Water</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Smart Hydration Check</span>
        </button>
      </div>

      <AnimatePresence>
        {showWaterAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowWaterAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
              
              <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center justify-center gap-3">
                <Droplet className="text-blue-500" size={24} /> Smart Hydration Check
              </h2>
              
              <div className="text-sm font-medium text-neutral-300 leading-relaxed mb-5">
                <p className="text-sm font-bold text-white mb-3 text-center">Are you actually thirsty right now?</p>
                <div className="flex gap-3 mb-5">
                  <div className="flex-1 bg-black/40 border border-blue-900/30 rounded-xl p-3 text-center">
                    <span className="text-blue-500 font-black text-xs tracking-wider block mb-1">YES</span>
                    <span className="text-[10px] leading-tight block text-neutral-400">Drink until satisfied</span>
                  </div>
                  <div className="flex-1 bg-black/40 border border-red-900/30 rounded-xl p-3 text-center">
                    <span className="text-red-500 font-black text-xs tracking-wider block mb-1">NO</span>
                    <span className="text-[10px] leading-tight block text-neutral-400">Put the bottle down</span>
                  </div>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-neutral-800 mb-4">
                  <div className="text-center mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Urine Color Check</p>
                    <p className="text-[9px] text-neutral-400 font-medium">You can accurately gauge your current hydration state by checking the color of your urine.</p>
                  </div>
                  <ul className="space-y-3 text-[10px] leading-snug">
                    <li className="flex gap-3 items-center">
                      <div className="w-3 h-3 rounded-full bg-white/80 shrink-0 border border-neutral-600" />
                      <div><span className="font-bold text-white">Clear:</span> Overhydrated. Chill out on fluids.</div>
                    </li>
                    <li className="flex gap-3 items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-200 shrink-0 shadow-[0_0_8px_rgba(254,240,138,0.4)]" />
                      <div><span className="font-bold text-white">Lemonade:</span> Perfect. You're in the sweet spot.</div>
                    </li>
                    <li className="flex gap-3 items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 shrink-0" />
                      <div><span className="font-bold text-white">Apple Juice:</span> Dehydrated. Time to drink water.</div>
                    </li>
                    <li className="flex gap-3 items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-800 shrink-0" />
                      <div><span className="font-bold text-white">Dark Ale:</span> Severe dehydration. Water ASAP.</div>
                    </li>
                  </ul>
                </div>
                
                <p className="text-neutral-500 text-[9px] uppercase tracking-[0.2em] font-bold text-center leading-relaxed opacity-60">
                  You're a human, not a houseplant.<br/>Don't overcomplicate it.
                </p>
              </div>
              
              <button
                onClick={() => setShowWaterAlert(false)}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-colors shadow-sm hover:shadow-md"
              >
                [ Got it, I'll trust my thirst ]
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
