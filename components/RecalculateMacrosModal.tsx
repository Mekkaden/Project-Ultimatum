"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import { calculateBaseNutrition, ActivityLevel, Objective, Gender, ACTIVITY_LEVELS, ACTIVITY_ORDER, normalizeActivityValue, calculateBMR, calculateTDEE } from '@/lib/nutrition';

export function RecalculateMacrosModal({ onClose, onSave }: { onClose: () => void, onSave: (plan: any) => void }) {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("KG");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Objective>("maintain_tone");

  // Live preview so the user sees the effect of their inputs before saving.
  const previewWeightKg = (parseFloat(weight) || 70) / (unit === "LBS" ? 2.20462 : 1);
  const previewAge = parseFloat(age) || 25;
  const previewHeight = parseFloat(height) || 170;
  const liveBmr = Math.round(calculateBMR(gender, previewAge, previewHeight, previewWeightKg));
  const liveTdee = Math.round(calculateTDEE(gender, previewAge, previewHeight, previewWeightKg, activity));

  useEffect(() => {
    setWeight(localStorage.getItem("ultimatum_weight") || "");
    setUnit(localStorage.getItem("ultimatum_weight_unit") || "KG");
    setHeight(localStorage.getItem("ultimatum_height") || "");
    setAge(localStorage.getItem("ultimatum_age") || "");
    setBodyFat(localStorage.getItem("ultimatum_bodyfat") || "");
    
    const storedGender = localStorage.getItem("ultimatum_gender");
    if (storedGender === "male" || storedGender === "female") setGender(storedGender);
    
    // Migrate old activity multiplier to new ActivityLevel
    const storedActivity = localStorage.getItem("ultimatum_activity");
    const migratedActivity = normalizeActivityValue(storedActivity);
    if (migratedActivity) setActivity(migratedActivity);
    
    // Migrate old goals to new Objectives
    const storedGoal = localStorage.getItem("ultimatum_goal");
    if (storedGoal === "Cut") setGoal("lose_slow");
    else if (storedGoal === "Maintain") setGoal("maintain_tone");
    else if (storedGoal === "Lean Bulk") setGoal("lean_muscle");
    else if (storedGoal === "Mass Bulk") setGoal("mass_bulk");
    else if (storedGoal && ["lose_slow", "lose_fast", "maintain_tone", "lean_muscle", "mass_bulk"].includes(storedGoal)) {
      setGoal(storedGoal as Objective);
    }
  }, []);

  function getWeightInKg() {
    const w = parseFloat(weight) || 70;
    return unit === "LBS" ? w / 2.20462 : w;
  }

  function handleCalculate() {
    if (!weight || !height || !age) {
      alert("Please fill in weight, height, and age.");
      return;
    }

    const wKg = getWeightInKg();
    const hCm = parseFloat(height) || 170;
    const a = parseFloat(age) || 25;
    const bf = bodyFat !== "" ? parseFloat(bodyFat) : "";
    
    const targets = calculateBaseNutrition(
      gender,
      a,
      hCm,
      wKg,
      bf,
      activity,
      goal
    );

    // Save back to local storage
    localStorage.setItem("ultimatum_age", age);
    localStorage.setItem("ultimatum_height", height);
    localStorage.setItem("ultimatum_weight", weight);
    localStorage.setItem("ultimatum_weight_unit", unit);
    localStorage.setItem("ultimatum_bodyfat", bodyFat);
    localStorage.setItem("ultimatum_gender", gender);
    localStorage.setItem("ultimatum_activity", activity);
    localStorage.setItem("ultimatum_goal", goal);

    onSave(targets);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm bg-[#121212] border border-neutral-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <RefreshCw size={20} className="text-[#e4fcaf]" />
          Auto-Recalculate
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#e4fcaf]" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#e4fcaf] appearance-none">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Height (CM)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#e4fcaf]" />
            </div>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Weight</label>
                <button onClick={() => setUnit(unit === "KG" ? "LBS" : "KG")} className="text-[9px] font-black tracking-widest bg-neutral-900 px-2 py-0.5 rounded text-[#e4fcaf]">{unit}</button>
              </div>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#e4fcaf]" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Body Fat % <span className="lowercase">(opt)</span></label>
            <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="e.g. 15" className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#e4fcaf]" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Activity Level</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              aria-describedby="activity-description"
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#e4fcaf] appearance-none"
            >
              {ACTIVITY_ORDER.map((key) => (
                <option key={key} value={key}>
                  {ACTIVITY_LEVELS[key].label}
                </option>
              ))}
            </select>
            <p id="activity-description" className="mt-2 text-[11px] leading-snug text-neutral-500">
              {ACTIVITY_LEVELS[activity].description}{" "}
              <span className="text-neutral-600">
                (x{ACTIVITY_LEVELS[activity].multiplier} activity factor)
              </span>
            </p>
            <p className="mt-2 text-[11px] text-neutral-600">
              Maintenance: <span className="font-bold text-[#e4fcaf]">{liveTdee.toLocaleString()}</span> kcal/day
              (BMR {liveBmr.toLocaleString()})
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value as Objective)} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#e4fcaf] appearance-none">
              <option value="lose_slow">Lose Fat Slowly</option>
              <option value="lose_fast">Lose Fat Aggressively</option>
              <option value="maintain_tone">Maintain</option>
              <option value="lean_muscle">Gain Lean Muscle</option>
              <option value="mass_bulk">Mass Bulk</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleCalculate}
          className="w-full mt-6 bg-[#e4fcaf] text-black font-black uppercase tracking-widest py-4 text-xs rounded-xl shadow-sm hover:brightness-105"
        >
          Calculate & Save
        </button>
      </motion.div>
    </div>
  );
}
