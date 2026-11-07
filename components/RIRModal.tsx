"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import { useHardwareBack } from '@/lib/useHardwareBack';

export default function RIRModal() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleClose = () => {
    localStorage.setItem('has_seen_rir_tutorial', 'true');
    setShow(false);
  };
  
  useHardwareBack(show, handleClose);

  useEffect(() => {
    setMounted(true);
    const hasSeen = localStorage.getItem('has_seen_rir_tutorial');
    if (hasSeen !== 'true') {
      setShow(true);
    }
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl z-10 flex flex-col items-center"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-1 mt-2">What is RIR?</h2>
            <p className="text-emerald-500 font-bold text-sm mb-6">(Reps In Reserve)</p>

            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black mb-6 border border-neutral-800">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/gAZAattkPFA?start=12&rel=0&showinfo=0" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>

            <p className="text-neutral-300 text-sm text-center mb-4 leading-relaxed">
              RIR is how many more reps you could do before reaching absolute failure. 
            </p>
            
            <div className="w-full space-y-2 mb-6">
              <p className="text-neutral-400 text-sm"><strong className="text-white">3 RIR:</strong> You stopped 3 reps shy of failure.</p>
              <p className="text-neutral-400 text-sm"><strong className="text-white">1 RIR:</strong> You stopped 1 rep shy of failure.</p>
              <p className="text-neutral-400 text-sm"><strong className="text-white">0 RIR:</strong> Absolute failure. You couldn't do another rep.</p>
            </div>
            
            <p className="text-neutral-500 text-xs text-center italic mb-6">
              Hitting the Target RIR ensures you train hard enough to grow, but not so hard you overtrain.
            </p>

            <button 
              onClick={handleClose}
              className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-neutral-200 transition-colors"
            >
              GOT IT, LET'S LIFT
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
