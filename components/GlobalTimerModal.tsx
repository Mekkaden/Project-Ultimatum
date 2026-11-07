"use client";

import React, { useState, useEffect } from 'react';
import { globalTimerStore, TimerState } from '@/lib/timerStore';

export default function GlobalTimerModal() {
  const [timerState, setTimerState] = useState<TimerState>(globalTimerStore.state);

  useEffect(() => {
    return globalTimerStore.subscribe(setTimerState);
  }, []);

  // Auto-close on complete is now handled directly inside timerStore to avoid input bugs

  const toggleVibrate = () => globalTimerStore.setVibrate(!timerState.vibrate);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      globalTimerStore.setTime(0);
      return;
    }
    const clean = raw.replace(/^0+/, '');
    globalTimerStore.setTime(parseInt(clean === '' ? '0' : clean, 10));
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 transition-opacity duration-300 ${timerState.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="relative w-full max-w-sm">
        <button 
          onClick={() => globalTimerStore.closeModal()}
          className="absolute -top-12 right-0 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 w-10 h-10 rounded-full flex items-center justify-center border border-neutral-800 transition-colors font-bold"
        >
          ✕
        </button>
        
        <div className="bg-[#151515]/95 backdrop-blur-xl w-[90%] max-w-[320px] mx-auto shadow-2xl rounded-2xl overflow-hidden flex flex-col font-sans border border-white/10">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-center relative">
            <h2 className="text-white text-xs font-bold uppercase tracking-[0.2em]">Rest Timer</h2>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-blue-500/40 rounded-full" />
          </div>

          <div className="p-5 flex flex-col pb-6">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => globalTimerStore.adjustTime(-1)}
                className="w-11 h-11 bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-300 text-2xl font-light hover:bg-neutral-800 hover:text-white transition-all rounded-xl active:scale-95"
              >
                −
              </button>
              
              <div className="flex-1 flex justify-center border-b border-white/10 mx-4">
                <input 
                  type="number" 
                  value={timerState.timeLeft === 0 ? "" : timerState.timeLeft}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-center text-5xl font-black text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pb-1 tracking-tighter"
                />
              </div>

              <button 
                onClick={() => globalTimerStore.adjustTime(1)}
                className="w-11 h-11 bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-300 text-2xl font-light hover:bg-neutral-800 hover:text-white transition-all rounded-xl active:scale-95"
              >
                +
              </button>
            </div>

            <div className="flex flex-col gap-5 px-4 mb-4">
              <label className="flex items-center justify-between cursor-pointer group w-full">
                <span className={`text-[12px] tracking-wider uppercase font-bold transition-colors ${timerState.vibrate ? 'text-white' : 'text-neutral-500'}`}>VIBRATE</span>
                <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${timerState.vibrate ? 'bg-blue-600/50 border border-blue-400/30' : 'bg-neutral-800 border border-white/5'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute shadow-md ${timerState.vibrate ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                <input type="checkbox" className="hidden" checked={timerState.vibrate} onChange={toggleVibrate} />
              </label>
            </div>
          </div>

          <div className="px-5 py-5 bg-black/30 border-t border-white/5">
            {timerState.status === 'running' ? (
              <div className="flex gap-2.5">
                <button 
                  onClick={() => globalTimerStore.pause()}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs tracking-wider rounded-xl transition-all uppercase border border-white/10 active:scale-95"
                >
                  PAUSE
                </button>
                <button 
                  onClick={() => globalTimerStore.cancel()}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 font-bold text-xs tracking-wider rounded-xl transition-all uppercase active:scale-95"
                >
                  CANCEL
                </button>
              </div>
            ) : timerState.status === 'paused' ? (
              <div className="flex gap-2.5">
                <button 
                  onClick={() => globalTimerStore.start()}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs tracking-wider rounded-xl transition-all uppercase border border-white/10 active:scale-95"
                >
                  RESUME
                </button>
                <button 
                  onClick={() => globalTimerStore.cancel()}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 font-bold text-xs tracking-wider rounded-xl transition-all uppercase active:scale-95"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <button 
                onClick={() => globalTimerStore.start()}
                className="w-full py-3.5 bg-white text-black hover:bg-neutral-200 font-bold text-xs tracking-[0.15em] rounded-xl transition-all uppercase shadow-sm active:scale-[0.99]"
              >
                START TIMER
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
