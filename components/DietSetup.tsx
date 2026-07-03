"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function DietSetup(props) {
  const stateStep = useState(1);
  const step = stateStep[0];
  const setStep = stateStep[1];

  const stateWeight = useState("");
  const weight = stateWeight[0];
  const setWeight = stateWeight[1];

  const stateAge = useState("");
  const age = stateAge[0];
  const setAge = stateAge[1];

  const stateGender = useState("male");
  const gender = stateGender[0];
  const setGender = stateGender[1];

  const stateHeight = useState("");
  const height = stateHeight[0];
  const setHeight = stateHeight[1];

  const stateGoal = useState("Maintain");
  const goal = stateGoal[0];
  const setGoal = stateGoal[1];

  const stateActivityMultiplier = useState(1.2);
  const activityMultiplier = stateActivityMultiplier[0];
  const setActivityMultiplier = stateActivityMultiplier[1];

  const stateUnit = useState("LBS");
  const unit = stateUnit[0];
  const setUnit = stateUnit[1];

  function getWeightInKg() {
    const w = parseFloat(weight) || 70;
    return unit === "LBS" ? w / 2.20462 : w;
  }

  function getWeightInLbs() {
    const w = parseFloat(weight) || 154;
    return unit === "KG" ? w * 2.20462 : w;
  }

  function calculateTDEE() {
    const wKg = getWeightInKg();
    const hCm = parseFloat(height) || 170;
    const a = parseFloat(age) || 25;
    
    let bmr = (10 * wKg) + (6.25 * hCm) - (5 * a);
    if (gender === "male") {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    
    return bmr * activityMultiplier;
  }

  function handleComplete() {
    const tdee = calculateTDEE();
    let targetCals = tdee;
    if (goal === "Cut") {
      targetCals -= 500;
    }
    if (goal === "Lean Bulk") {
      targetCals += 100;
    }
    if (goal === "Mass Bulk") {
      targetCals += 250;
    }

    const protein = getWeightInLbs(); // 1g per lb
    const fats = (targetCals * 0.25) / 9; // 25% fats
    const carbs = (targetCals - (protein * 4) - (fats * 9)) / 4;

    const finalPlan = {
      calories: Math.round(targetCals),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats)
    };

    if (props.onComplete) {
      props.onComplete(finalPlan);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-black border border-neutral-800 rounded-2xl overflow-hidden p-8">
      <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Nutrition Protocol</h2>
      <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-8">System Initialization</p>

      {step === 1 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Age</label>
              <input 
                type="number"
                value={age}
                onChange={function(e) { setAge(e.target.value); }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-4 text-xl font-black text-white outline-none focus:border-red-600 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all"
                placeholder="e.g. 25"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Gender</label>
              <div className="flex gap-2">
                <button 
                  onClick={function() { setGender("male"); }}
                  className={"flex-1 py-4 rounded-lg border text-center transition-all " + (gender === "male" ? "border-red-600 bg-red-950/20 text-white shadow-[0_0_15px_rgba(220,38,38,0.2)]" : "border-neutral-800 bg-neutral-950 text-neutral-400")}
                >
                  <div className="text-sm font-black uppercase">Male</div>
                </button>
                <button 
                  onClick={function() { setGender("female"); }}
                  className={"flex-1 py-4 rounded-lg border text-center transition-all " + (gender === "female" ? "border-red-600 bg-red-950/20 text-white shadow-[0_0_15px_rgba(220,38,38,0.2)]" : "border-neutral-800 bg-neutral-950 text-neutral-400")}
                >
                  <div className="text-sm font-black uppercase">Female</div>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Height (CM)</label>
              <input 
                type="number"
                value={height}
                onChange={function(e) { setHeight(e.target.value); }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-4 text-xl font-black text-white outline-none focus:border-red-600 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all"
                placeholder="e.g. 175"
              />
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Weight</label>
                <div className="flex bg-neutral-900 rounded p-1">
                  <button 
                    onClick={function() { setUnit("LBS"); }} 
                    className={"px-2 py-1 text-[9px] font-bold rounded transition-colors " + (unit === "LBS" ? "bg-neutral-800 text-white" : "text-neutral-500")}
                  >
                    LBS
                  </button>
                  <button 
                    onClick={function() { setUnit("KG"); }} 
                    className={"px-2 py-1 text-[9px] font-bold rounded transition-colors " + (unit === "KG" ? "bg-neutral-800 text-white" : "text-neutral-500")}
                  >
                    KG
                  </button>
                </div>
              </div>
              <input 
                type="number"
                value={weight}
                onChange={function(e) { setWeight(e.target.value); }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-4 text-xl font-black text-white outline-none focus:border-red-600 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all"
                placeholder={unit === "LBS" ? "e.g. 175" : "e.g. 80"}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Activity Level</label>
            <select 
              value={activityMultiplier}
              onChange={function(e) { setActivityMultiplier(parseFloat(e.target.value)); }}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-4 text-sm font-bold text-white outline-none focus:border-red-600 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all appearance-none"
            >
              <option value={1.2}>Sedentary (Little or no exercise)</option>
              <option value={1.375}>Lightly Active (Exercise 1-3 days/week)</option>
              <option value={1.55}>Moderately Active (Exercise 3-5 days/week)</option>
              <option value={1.725}>Active (Exercise 6-7 days/week)</option>
              <option value={1.9}>Very Active (Hard exercise 6-7 days/week)</option>
            </select>
          </div>
          <button 
            onClick={function() { if(weight && age && height) setStep(2); }}
            disabled={!weight || !age || !height}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-colors"
          >
            Next Phase
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Primary Objective</label>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={function() { setGoal("Cut"); }}
                className={"p-4 rounded-lg border text-left transition-all " + (goal === "Cut" ? "border-red-600 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.2)]" : "border-neutral-800 bg-neutral-950 hover:border-neutral-600")}
              >
                <div className="text-lg font-black text-white uppercase tracking-wider">Shred (Cut)</div>
                <div className="text-xs font-bold text-neutral-500 mt-1">Caloric Deficit (-500 kcal). Maximum fat loss.</div>
              </button>
              
              <button 
                onClick={function() { setGoal("Maintain"); }}
                className={"p-4 rounded-lg border text-left transition-all " + (goal === "Maintain" ? "border-red-600 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.2)]" : "border-neutral-800 bg-neutral-950 hover:border-neutral-600")}
              >
                <div className="text-lg font-black text-white uppercase tracking-wider">Maintain</div>
                <div className="text-xs font-bold text-neutral-500 mt-1">Maintenance Calories. Recomposition focused.</div>
              </button>

              <button 
                onClick={function() { setGoal("Lean Bulk"); }}
                className={"p-4 rounded-lg border text-left transition-all " + (goal === "Lean Bulk" ? "border-red-600 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.2)]" : "border-neutral-800 bg-neutral-950 hover:border-neutral-600")}
              >
                <div className="text-lg font-black text-white uppercase tracking-wider">Lean Bulk</div>
                <div className="text-xs font-bold text-neutral-500 mt-1">Caloric Surplus (+100 kcal). Clean tissue growth.</div>
              </button>

              <button 
                onClick={function() { setGoal("Mass Bulk"); }}
                className={"p-4 rounded-lg border text-left transition-all " + (goal === "Mass Bulk" ? "border-red-600 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.2)]" : "border-neutral-800 bg-neutral-950 hover:border-neutral-600")}
              >
                <div className="text-lg font-black text-white uppercase tracking-wider">Mass Bulk</div>
                <div className="text-xs font-bold text-neutral-500 mt-1">Caloric Surplus (+250 kcal). Maximum tissue growth.</div>
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={function() { setStep(1); }}
              className="w-1/3 py-4 bg-neutral-900 text-white font-black uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={handleComplete}
              className="w-2/3 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-lg hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all"
            >
              Initialize Plan
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
