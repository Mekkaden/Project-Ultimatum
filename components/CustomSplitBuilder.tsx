"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Dumbbell, AlertTriangle, ChevronRight, X, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useSession } from "next-auth/react";
import type { Campaign, WorkoutDay, Exercise } from "../lib/workout-data";

export default function CustomSplitBuilder({ 
  onDeploy, 
  onCancel,
  initialCampaign 
}: { 
  onDeploy: (campaign: Campaign) => void, 
  onCancel?: () => void,
  initialCampaign?: Campaign 
}) {
  const { data: session } = useSession();
  const [isDeploying, setIsDeploying] = useState(false);
  const [days, setDays] = useState<WorkoutDay[]>(
    initialCampaign?.days && initialCampaign.days.length > 0
      ? initialCampaign.days
      : [
          {
            id: `custom-d1-${Date.now()}`,
            dayNumber: 1,
            isRestDay: false,
            title: "Custom Day 1",
            totalSets: 0,
            exercises: []
          }
        ]
  );

  const addDay = () => {
    setDays([...days, {
      id: `custom-d${days.length + 1}-${Date.now()}`,
      dayNumber: days.length + 1,
      isRestDay: false,
      title: `Custom Day ${days.length + 1}`,
      totalSets: 0,
      exercises: []
    }]);
  };

  const removeDay = (dayIndex: number) => {
    const newDays = [...days];
    newDays.splice(dayIndex, 1);
    // Re-number days
    newDays.forEach((day, idx) => day.dayNumber = idx + 1);
    setDays(newDays);
  };

  const addExercise = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises.push({
      slotName: "",
      prescribedEquipment: "",
      sets: 3,
      targetRIR: "1-2",
      substitutions: []
    });
    setDays(newDays);
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setDays(newDays);
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, field: keyof Exercise, value: any) => {
    const newDays = [...days];
    newDays[dayIndex].exercises[exerciseIndex] = {
      ...newDays[dayIndex].exercises[exerciseIndex],
      [field]: field === "sets" ? parseInt(value) || 0 : value
    };
    setDays(newDays);
  };

  const updateDayTitle = (dayIndex: number, title: string) => {
    const newDays = [...days];
    newDays[dayIndex].title = title;
    setDays(newDays);
  };

  const handleDeploy = async () => {
    if (!session?.user?.email) return;

    // Validate empty split
    const hasAtLeastOneExercise = days.some(day => day.exercises.length > 0);
    if (!hasAtLeastOneExercise) {
      alert("Error: Cannot deploy an empty custom split. Please add at least one exercise.");
      return;
    }
    
    // Calculate total sets for each day
    const finalizedDays = days.map(day => ({
      ...day,
      totalSets: day.exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0)
    }));

    const customCampaign: Campaign = {
      id: "custom-code-split",
      title: "CUSTOM: OFF GRID",
      globalRule: "You dictate the rules. Total fatigue management is on you.",
      days: finalizedDays
    };

    setIsDeploying(true);
    try {
      // Save to Supabase using the HTTPS client to bypass firewall blocking
      const { error } = await supabase
        .from("User")
        .update({ customSplitData: customCampaign })
        .eq("email", session.user.email);

      if (error) {
        console.error("Failed to deploy:", error);
        alert("Failed to deploy protocol. Check console.");
      } else {
        // Success
        onDeploy(customCampaign);
      }
    } catch (e) {
      console.error(e);
      alert("Network error deploying protocol.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="mb-8 border border-red-900/50 bg-red-950/20 p-6 rounded-xl flex items-start gap-4">
        <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" />
        <div>
          <h2 className="text-red-500 font-bold uppercase tracking-widest mb-2">Builder Mode Active</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            You are now constructing an off-grid protocol. There are no guardrails here. Add your training days, specify your exercises, and set your parameters. When ready, deploy the protocol to your active campaign.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {days.map((day, dIdx) => (
          <motion.div 
            key={day.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
              <input 
                type="text"
                value={day.title}
                onChange={(e) => updateDayTitle(dIdx, e.target.value)}
                className="bg-transparent text-xl font-bold text-white outline-none border-b border-transparent focus:border-white/20 px-1 py-1 w-64"
                placeholder="Day Title (e.g. Upper Body)"
              />
              <button 
                onClick={() => removeDay(dIdx)}
                className="text-neutral-500 hover:text-red-500 transition-colors"
                title="Remove Day"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {day.exercises.map((ex, eIdx) => (
                <div key={eIdx} className="grid grid-cols-12 gap-4 items-end bg-black/40 p-3 rounded-lg border border-neutral-800/50">
                  <div className="col-span-12 md:col-span-8">
                    <div className="flex items-center gap-2 mb-1 ml-1">
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Movement</label>
                      {ex.videoUrl && (
                        <a 
                          href={ex.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-red-500 hover:text-red-400 transition-colors"
                          title="Watch Form Guide"
                        >
                          <PlayCircle size={14} className="inline-block" />
                        </a>
                      )}
                    </div>
                    <input 
                      type="text" 
                      value={ex.slotName}
                      onChange={(e) => updateExercise(dIdx, eIdx, "slotName", e.target.value)}
                      placeholder="Exercise Name"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white outline-none focus:border-neutral-600"
                    />
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 ml-1">Sets</label>
                    <input 
                      type="number" 
                      value={ex.sets}
                      onChange={(e) => updateExercise(dIdx, eIdx, "sets", e.target.value)}
                      placeholder="Sets"
                      min={1}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white outline-none focus:border-neutral-600"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-1">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 ml-1">RIR</label>
                    <input 
                      type="text" 
                      value={ex.targetRIR}
                      onChange={(e) => updateExercise(dIdx, eIdx, "targetRIR", e.target.value)}
                      placeholder="RIR"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white outline-none focus:border-neutral-600"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end pb-2">
                    <button onClick={() => removeExercise(dIdx, eIdx)} className="text-neutral-600 hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => addExercise(dIdx)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
            >
              <Plus size={14} /> Add Exercise
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button 
          onClick={addDay}
          className="flex items-center gap-2 px-6 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-sm font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
        >
          <Plus size={16} /> Add Day
        </button>

        <div className="flex items-center gap-4">
          {onCancel && (
            <button 
              onClick={onCancel}
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors duration-300"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className="flex items-center gap-3 px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeploying ? (
              "Deploying..."
            ) : (
              <>
                Deploy Protocol <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
