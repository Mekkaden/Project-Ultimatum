"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, ArrowLeft, Plus, Minus, Edit2, Check } from 'lucide-react';
import Link from 'next/link';
import { montserrat } from '@/app/fonts';

export default function WaterTrackerPage() {
  const [intake, setIntake] = useState(0);
  const [goal, setGoal] = useState(3000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goal.toString());
  const [incrementAmount, setIncrementAmount] = useState(250);

  useEffect(() => {
    try {
      const savedIntake = localStorage.getItem('ultimatum_water_intake');
      const savedGoal = localStorage.getItem('ultimatum_water_goal');
      const savedDate = localStorage.getItem('ultimatum_water_date');
      
      const today = new Date().toDateString();
      if (savedDate === today) {
        if (savedIntake) setIntake(parseInt(savedIntake));
      } else {
        localStorage.setItem('ultimatum_water_date', today);
        localStorage.setItem('ultimatum_water_intake', '0');
      }
      
      if (savedGoal) {
        setGoal(parseInt(savedGoal));
        setGoalInput(savedGoal);
      }
    } catch {}
  }, []);

  const saveIntake = (newIntake: number) => {
    const val = Math.max(0, newIntake);
    setIntake(val);
    localStorage.setItem('ultimatum_water_intake', val.toString());
  };

  const handleSaveGoal = () => {
    const val = parseInt(goalInput);
    if (!isNaN(val) && val > 0) {
      setGoal(val);
      localStorage.setItem('ultimatum_water_goal', val.toString());
    } else {
      setGoalInput(goal.toString());
    }
    setIsEditingGoal(false);
  };

  const fillPercentage = Math.min(100, (intake / goal) * 100);

  return (
    <div className={`min-h-screen bg-black text-white relative overflow-x-hidden ${montserrat.className}`}>
      {/* Background Image */}
      <div className="fixed inset-0 z-0 bg-black">
        <img 
          src="/water-bg.jpg" 
          alt="Water Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-saturate-50 z-0"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 max-w-lg mx-auto flex flex-col h-full min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/diet" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10">
            <ArrowLeft size={20} className="text-neutral-300" />
          </Link>
        </div>

        {/* Cylinder & Goal Section */}
        <div className="flex flex-col items-center flex-1 mt-4">
          
          {/* Glass Cylinder */}
          <div className="relative w-48 h-80 rounded-[40px] border-2 border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] mb-8 flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>
            
            {/* Liquid */}
            <motion.div 
              className="w-full bg-gradient-to-t from-blue-600 to-blue-400 opacity-90 relative"
              initial={{ height: 0 }}
              animate={{ height: `${fillPercentage}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            >
              {/* Liquid surface highlight */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 rounded-t-[50%] blur-[1px]"></div>
              
              {/* Bubbles animation effect (optional) */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </motion.div>

            {/* Cylinder Highlights */}
            <div className="absolute inset-y-0 left-4 w-2 bg-gradient-to-r from-white/20 to-transparent blur-sm pointer-events-none rounded-full my-4"></div>
            <div className="absolute inset-y-0 right-4 w-1 bg-gradient-to-l from-white/10 to-transparent blur-sm pointer-events-none rounded-full my-4"></div>
            
            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none drop-shadow-2xl">
              <span className="text-5xl font-black tracking-tighter text-white">{intake}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-200 mt-1">mL</span>
            </div>
          </div>

          {/* Goal Display / Edit */}
          <div className="flex items-center gap-3 mb-10 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest px-2">Goal:</div>
            {isEditingGoal ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-20 bg-black/50 border border-blue-500/50 rounded-lg px-2 py-1 text-white text-sm font-bold outline-none text-center"
                />
                <button onClick={handleSaveGoal} className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded-lg transition-colors">
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">{goal} mL</span>
                <button onClick={() => setIsEditingGoal(true)} className="p-1.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors">
                  <Edit2 size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="w-full flex items-center justify-center gap-6 mb-12">
            <button 
              onClick={() => saveIntake(intake - incrementAmount)}
              className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md active:scale-95"
            >
              <Minus size={24} />
            </button>
            
            <button 
              onClick={() => saveIntake(intake + incrementAmount)}
              className="w-24 h-24 rounded-full bg-blue-600 border border-blue-400 flex flex-col items-center justify-center text-white hover:bg-blue-500 transition-all active:scale-95 shadow-md hover:shadow-lg"
            >
              <Plus size={32} />
              <span className="text-[10px] font-bold mt-1">+{incrementAmount}</span>
            </button>
          </div>

        </div>

        {/* The Truth Section */}
        <div className="w-full bg-black/60 border border-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 mt-auto shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-500/30">
              <Droplet size={14} className="text-blue-500" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Protocol</h3>
          </div>
          
          <p className="text-xs text-neutral-300 font-medium leading-relaxed mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
            <span className="text-white font-bold block mb-1">Tracking is optional.</span>
            Only use this tracker if you suffer from chronic fatigue, severe dehydration, or struggle with natural thirst cues. Otherwise, just drink when you're thirsty.<br/><br/>
            <span className="text-white font-bold block mb-1">Why the urine check?</span>
            Because thirst signals can be delayed or inaccurate. Your urine color is the single most objective, real-time metric of your true hydration status.
          </p>

          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3">Urine Color Check</p>
            <ul className="space-y-4 text-xs font-medium">
              <li className="flex gap-4 items-center">
                <div className="w-4 h-4 rounded-full bg-white/90 shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                <div className="text-neutral-400"><span className="font-bold text-white">Clear:</span> Overhydrated. Chill out on fluids.</div>
              </li>
              <li className="flex gap-4 items-center">
                <div className="w-4 h-4 rounded-full bg-yellow-200 shrink-0 shadow-[0_0_10px_rgba(254,240,138,0.5)]" />
                <div className="text-neutral-400"><span className="font-bold text-white">Lemonade:</span> Perfect. You're in the sweet spot.</div>
              </li>
              <li className="flex gap-4 items-center">
                <div className="w-4 h-4 rounded-full bg-yellow-500 shrink-0" />
                <div className="text-neutral-400"><span className="font-bold text-white">Apple Juice:</span> Dehydrated. Time to drink water.</div>
              </li>
              <li className="flex gap-4 items-center">
                <div className="w-4 h-4 rounded-full bg-amber-800 shrink-0" />
                <div className="text-neutral-400"><span className="font-bold text-white">Dark Ale:</span> Severe dehydration. Water ASAP.</div>
              </li>
            </ul>
          </div>
          
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>
          
          <p className="text-neutral-500 text-[10px] uppercase tracking-[0.2em] font-black text-center leading-relaxed">
            You're a human, not a houseplant.<br/><span className="text-white">Don't overcomplicate it.</span>
          </p>
        </div>

      </div>
    </div>
  );
}
