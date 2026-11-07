"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Calendar as CalendarIcon, Dumbbell } from 'lucide-react';
import { getMusclesForExercise, Muscle } from '@/lib/muscleMapping';
import { LABEL_TO_MOVEMENT } from '@/lib/exercise-aliases';

interface WorkoutSet {
  id: string;
  date: string;
  weight: number;
  reps: number;
  rir?: number | string;
  unit?: string;
  timestamp: number;
}

interface DayData {
  muscles: Set<Muscle>;
  exercises: {
    name: string;
    sets: WorkoutSet[];
  }[];
}

const SLOT_TO_EQUIPMENT = new Map<string, string>();
for (const [label, movement] of Object.entries(LABEL_TO_MOVEMENT)) {
  SLOT_TO_EQUIPMENT.set(label.toLowerCase().trim(), movement);
}

function canonicalExerciseName(name: string): string {
  return SLOT_TO_EQUIPMENT.get(name.toLowerCase().trim()) || name;
}

export function WorkoutCalendar({ onClose }: { onClose: () => void }) {
  const [workoutDays, setWorkoutDays] = useState<Record<string, DayData>>({});
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const daysMap: Record<string, DayData> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("ultimatum_history_")) {
        let rawName = key.replace("ultimatum_history_", "").replace(/_/g, " ");
        let exerciseName = canonicalExerciseName(rawName);
        
        try {
          const sets = JSON.parse(localStorage.getItem(key) || "[]") as WorkoutSet[];
          const muscles = getMusclesForExercise(exerciseName);
          
          for (const set of sets) {
            if (set.timestamp) {
              const d = new Date(set.timestamp);
              d.setHours(0, 0, 0, 0);
              const dateStr = d.toISOString();
              
              if (!daysMap[dateStr]) {
                daysMap[dateStr] = { muscles: new Set(), exercises: [] };
              }
              
              const dayData = daysMap[dateStr];
              muscles.forEach(m => dayData.muscles.add(m));
              
              let exEntry = dayData.exercises.find(e => e.name === exerciseName);
              if (!exEntry) {
                exEntry = { name: exerciseName, sets: [] };
                dayData.exercises.push(exEntry);
              }
              exEntry.sets.push(set);
            }
          }
        } catch (e) {
          // Ignore
        }
      }
    }
    
    Object.values(daysMap).forEach(day => {
      day.exercises.forEach(ex => {
        ex.sets.sort((a, b) => a.timestamp - b.timestamp);
      });
      day.exercises.sort((a, b) => a.name.localeCompare(b.name));
    });

    setWorkoutDays(daysMap);
  }, []);

  const getDotColors = (muscles: Set<Muscle>): string[] => {
    const colors = new Set<string>();
    
    if (muscles.has("chest") || muscles.has("front-delts") || muscles.has("triceps")) {
      colors.add("#ef4444");
    }
    if (muscles.has("lats") || muscles.has("biceps") || muscles.has("rear-delts") || muscles.has("traps")) {
      colors.add("#3b82f6");
    }
    if (muscles.has("quads") || muscles.has("hamstrings") || muscles.has("glutes") || muscles.has("calves")) {
      colors.add("#10b981");
    }
    if (muscles.has("abs") || muscles.has("lower-back")) {
      colors.add("#eab308");
    }
    if (colors.size === 0) {
      colors.add("#a855f7");
    }

    return Array.from(colors).slice(0, 4);
  };

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const renderMonth = (year: number, month: number) => {
    const days = getDaysInMonth(year, month);
    const firstDay = days[0].getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const blanks = Array.from({ length: startOffset });
    
    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

    return (
      <div key={`${year}-${month}`} className="mb-12">
        <h3 className="text-center text-sm font-black text-white uppercase tracking-widest mb-6">
          {monthNames[month]} {year}
        </h3>
        
        <div className="grid grid-cols-7 gap-y-4 gap-x-1 mb-2">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-y-4 gap-x-1">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="h-12" />
          ))}
          
          {days.map((date) => {
            const dateStr = date.toISOString();
            const dayData = workoutDays[dateStr];
            const dots = dayData ? getDotColors(dayData.muscles) : [];
            const isToday = new Date().setHours(0,0,0,0) === date.getTime();
            
            return (
              <div 
                key={dateStr} 
                onClick={() => {
                  if (dayData) setSelectedDateStr(dateStr);
                }}
                className={`flex flex-col items-center justify-start h-12 relative ${dayData ? 'cursor-pointer group' : ''}`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-black transition-colors ${
                  isToday 
                    ? 'bg-[#e4fcaf] text-black shadow-sm' 
                    : dayData 
                      ? 'text-white group-hover:bg-neutral-800' 
                      : 'text-neutral-600'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="flex gap-0.5 mt-1">
                  {dots.map((color, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const monthsToRender = useMemo(() => {
    const list = [];
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 6);
    
    for (let i = 0; i < 8; i++) {
      list.push({ year: d.getFullYear(), month: d.getMonth() });
      d.setMonth(d.getMonth() + 1);
    }
    return list;
  }, []);

  const totalWorkouts = Object.keys(workoutDays).length;

  return (
    <div className="fixed inset-0 z-[100] bg-[#121212] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-[#151515] border-b border-neutral-800 shrink-0 shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          <CalendarIcon size={20} strokeWidth={2.5} className="text-white" />
          <h2 className="text-lg font-black text-white tracking-[0.2em] uppercase">Calendar</h2>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors">
          <X size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Calendar Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar scroll-smooth relative" id="calendar-scroll-area">
        <div className="max-w-md mx-auto">
          {monthsToRender.map(({ year, month }) => renderMonth(year, month))}
        </div>
      </div>

      {/* Footer Stats - Removed useless chevrons, centered text */}
      <div className="px-6 py-5 bg-[#151515] border-t border-neutral-800 shrink-0 flex items-center justify-center relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
          {totalWorkouts} Workouts Logged
        </span>
      </div>

      {/* Day Detail Overlay */}
      <AnimatePresence>
        {selectedDateStr && workoutDays[selectedDateStr] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-0 z-50 bg-[#121212] flex flex-col"
          >
            {/* Detail Header */}
            <div className="flex items-center justify-between px-4 py-4 bg-[#151515] border-b border-neutral-800 shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedDateStr(null)} 
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
                <div>
                  <h2 className="text-sm font-black text-white tracking-widest uppercase">Workout Summary</h2>
                  <div className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase mt-0.5">
                    {new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar bg-[#121212]">
              <div className="max-w-md mx-auto space-y-6">
                {workoutDays[selectedDateStr].exercises.map((ex, idx) => (
                  <div key={idx} className="bg-[#181818] border border-neutral-800 rounded-3xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-800 bg-[#1a1a1a] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
                        <Dumbbell size={14} strokeWidth={2.5} />
                      </div>
                      <h3 className="font-black text-sm text-white uppercase tracking-widest truncate">
                        {ex.name}
                      </h3>
                    </div>
                    <div className="p-3">
                      {ex.sets.map((set, setIdx) => (
                        <div key={setIdx} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-2xl transition-colors">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 w-16">
                            Set {setIdx + 1}
                          </span>
                          <div className="flex items-baseline gap-1 flex-1 justify-center">
                            <span className="font-black text-white text-lg">{set.weight}</span>
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{set.unit || 'KG'}</span>
                            <span className="text-neutral-600 mx-1">×</span>
                            <span className="font-black text-white text-lg">{set.reps}</span>
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">reps</span>
                          </div>
                          <div className="w-16 flex justify-end">
                            {set.rir !== undefined && set.rir !== null ? (
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black bg-[#e4fcaf] px-2 py-1 rounded shadow-sm">
                                {set.rir} RIR
                              </span>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">
                                -
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
