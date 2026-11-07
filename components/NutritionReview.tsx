"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Minus, Plus } from "lucide-react";
import { NutritionTargets, recalculateMacros } from "@/lib/nutrition";

interface NutritionReviewProps {
  initialTargets: NutritionTargets;
  weight: number;
  onConfirm: (targets: NutritionTargets) => void;
  onBack: () => void;
}

export default function NutritionReview({
  initialTargets,
  weight,
  onConfirm,
  onBack
}: NutritionReviewProps) {
  const [currentCalories, setCurrentCalories] = useState(initialTargets.calories);
  const [targets, setTargets] = useState<NutritionTargets>(initialTargets);

  // Recalculate whenever calories change
  useEffect(() => {
    setTargets(recalculateMacros(currentCalories, weight, initialTargets.goal));
  }, [currentCalories, weight, initialTargets.goal]);

  const adjustCalories = (amount: number) => {
    setCurrentCalories(prev => Math.max(1200, prev + amount));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        <button
          onClick={onBack}
          className="text-white/60 hover:text-white mb-6 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest transition-colors"
        >
          &lt; Back
        </button>

        <h3 className="text-white font-semibold uppercase tracking-[0.2em] mb-4 drop-shadow-md">
          Nutrition Protocol
        </h3>
        <p className="text-white/80 text-sm mb-10 font-medium leading-relaxed">
          These macros are scientifically optimized for your bodyweight and goal. You can tweak your total daily calories below if you know your specific maintenance level.
        </p>

        {/* Calorie Tweaker */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-8 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/50 mb-6">Daily Calories</span>
          
          <div className="flex items-center justify-center gap-8 md:gap-12 w-full">
            <button 
              onClick={() => adjustCalories(-50)}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:bg-white hover:text-black hover:border-white transition-all shadow-sm active:scale-95"
            >
              <Minus size={24} strokeWidth={3} />
            </button>

            <div className="flex flex-col items-center min-w-[120px]">
              <motion.span 
                key={currentCalories}
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="text-4xl md:text-5xl font-light text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              >
                {currentCalories}
              </motion.span>
              <span className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">KCAL</span>
            </div>

            <button 
              onClick={() => adjustCalories(50)}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:bg-white hover:text-black hover:border-white transition-all shadow-sm active:scale-95"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Macro Display */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="bg-[#111] border border-white/10 rounded-[1.5rem] p-4 flex flex-col items-center">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Protein</span>
            <span className="text-xl md:text-2xl text-white font-medium">{targets.protein}g</span>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-[1.5rem] p-4 flex flex-col items-center">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Carbs</span>
            <span className="text-xl md:text-2xl text-white font-medium">{targets.carbs}g</span>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-[1.5rem] p-4 flex flex-col items-center">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Fats</span>
            <span className="text-xl md:text-2xl text-white font-medium">{targets.fats}g</span>
          </div>
        </div>

        <button
          onClick={() => onConfirm(targets)}
          className="w-full mt-10 py-4 bg-white/10 border border-white/30 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white hover:text-black transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
        >
          Confirm Nutrition <ChevronRight size={18} />
        </button>

      </div>
    </div>
  );
}
