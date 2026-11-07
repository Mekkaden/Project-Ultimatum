"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, Info } from "lucide-react";
import { montserrat } from "@/app/fonts";
import { useExercises } from "@/lib/useExercises";
import { getActionForMovement } from "@/lib/exercise-catalogue";

export default function ExercisesLibraryPage() {
  const router = useRouter();
  const { allExercises } = useExercises();
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = allExercises.filter(ex => {
    if (ex.isCustom) {
      return ex.prescribedEquipment.toLowerCase().includes(searchQuery.toLowerCase());
    }
    const action = getActionForMovement(ex.prescribedEquipment) ?? ex.slotName;
    return `${action} ${ex.prescribedEquipment} ${(ex.muscles ?? []).join(" ")}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <div className={`min-h-screen bg-black text-slate-50 flex flex-col ${montserrat.className}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-neutral-900 px-4 py-4 md:px-8">
        <div className="flex items-center gap-4 max-w-4xl mx-auto w-full">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-colors shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">Movement Database</h1>
            <p className="text-xs text-neutral-500 font-medium">System library & custom exercises</p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col gap-6">
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-neutral-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-11 pr-4 py-4 text-sm outline-none focus:border-neutral-600 transition-colors"
          />
        </div>

        <div className="text-center text-neutral-500 text-xs italic">
          Custom exercises added in manual mode will automatically appear here.
        </div>

        {/* Exercise List */}
        <div className="flex flex-col gap-3 pb-24">
          <AnimatePresence mode="popLayout">
            {filteredExercises.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center py-12 text-neutral-500 text-sm"
              >
                No exercises found.
              </motion.div>
            ) : (
              filteredExercises.map((ex, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                  key={ex.id || `${ex.slotName}-${ex.prescribedEquipment}`}
                  className="bg-black border border-neutral-800 rounded-2xl p-4 flex items-center justify-between group hover:border-neutral-700 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-200">
                        {ex.isCustom
                          ? ex.prescribedEquipment
                          : `${ex.prescribedEquipment} · ${getActionForMovement(ex.prescribedEquipment) ?? ex.slotName}`}
                      </span>
                      {ex.isCustom && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-blue-900/30 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {ex.videoUrl && (
                    <a 
                      href={ex.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
                    >
                      <Info size={14} />
                    </a>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
