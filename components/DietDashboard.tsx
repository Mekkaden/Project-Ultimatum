"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Lock, Search, Plus, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DietDashboard(props) {
  const router = useRouter();
  const plan = props.plan || { calories: 2500, protein: 180, carbs: 250, fats: 70 };
  
  const stateConsumed = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const consumed = stateConsumed[0];
  const setConsumed = stateConsumed[1];

  useEffect(() => {
    const saved = localStorage.getItem('ultimatum_daily_consumed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === new Date().toDateString()) {
          setConsumed(parsed.data);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (consumed.calories > 0 || consumed.protein > 0) {
      localStorage.setItem('ultimatum_daily_consumed', JSON.stringify({
        date: new Date().toDateString(),
        data: consumed
      }));
    }
  }, [consumed]);

  const stateActiveTab = useState("quick");
  const activeTab = stateActiveTab[0];
  const setActiveTab = stateActiveTab[1];

  const stateQA_Cals = useState("");
  const qaCals = stateQA_Cals[0];
  const setQaCals = stateQA_Cals[1];
  
  const stateQA_Pro = useState("");
  const qaPro = stateQA_Pro[0];
  const setQaPro = stateQA_Pro[1];

  const stateScanning = useState(false);
  const isScanning = stateScanning[0];
  const setIsScanning = stateScanning[1];

  const stateScanResult = useState(null);
  const scanResult = stateScanResult[0];
  const setScanResult = stateScanResult[1];

  const stateSearchQuery = useState("");
  const searchQuery = stateSearchQuery[0];
  const setSearchQuery = stateSearchQuery[1];

  const stateSearchResults = useState([]);
  const searchResults = stateSearchResults[0];
  const setSearchResults = stateSearchResults[1];

  const stateIsSearching = useState(false);
  const isSearching = stateIsSearching[0];
  const setIsSearching = stateIsSearching[1];

  async function handleSearchFood(e) {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/food-search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.foods) {
        setSearchResults(data.foods);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  }

  const stateAiTextQuery = useState("");
  const aiTextQuery = stateAiTextQuery[0];
  const setAiTextQuery = stateAiTextQuery[1];

  const stateIsParsingText = useState(false);
  const isParsingText = stateIsParsingText[0];
  const setIsParsingText = stateIsParsingText[1];

  const stateParsedTextResult = useState(null);
  const parsedTextResult = stateParsedTextResult[0];
  const setParsedTextResult = stateParsedTextResult[1];

  async function handleParseText() {
    if (!aiTextQuery.trim()) return;
    setIsParsingText(true);
    setParsedTextResult(null);
    try {
      const res = await fetch("/api/ai-text-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiTextQuery })
      });
      const data = await res.json();
      if (data.calories !== undefined) {
        setParsedTextResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsingText(false);
    }
  }

  function handleQuickAdd() {
    const cals = parseInt(qaCals) || 0;
    const pro = parseInt(qaPro) || 0;
    handleAddFood(cals, pro, 0, 0);
    setQaCals("");
    setQaPro("");
  }

  function handleAddFood(calories, protein, carbs, fats) {
    setConsumed(function(prev) {
      return {
        calories: prev.calories + calories,
        protein: prev.protein + protein,
        carbs: prev.carbs + carbs,
        fats: prev.fats + fats
      };
    });
  }

  function handleSimulateScan() {
    setIsScanning(true);
    setScanResult(null);
    
    // NOTE: In production, the secure API call (e.g., Gemini Vision API) 
    // will be implemented on the backend here. We would upload the image to S3,
    // send the URL to our Next.js API route, and have the AI parse the macros.
    
    setTimeout(function() {
      setIsScanning(false);
      setScanResult({
        name: "Grilled Chicken Salad",
        calories: 450,
        protein: 45,
        carbs: 12,
        fats: 22
      });
    }, 3000);
  }

  const calsPercent = Math.min((consumed.calories / plan.calories) * 100, 100);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="bg-black border border-neutral-800 rounded-2xl p-6 md:p-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Energy Intake</h2>
              {props.onRecalculate && (
                <button 
                  onClick={props.onRecalculate}
                  className="flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-bold text-neutral-400 uppercase tracking-widest hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <RefreshCw size={10} />
                  Recalculate
                </button>
              )}
            </div>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Daily Limit</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-white">{consumed.calories}</span>
            <span className="text-sm font-bold text-neutral-500"> / {plan.calories} kcal</span>
          </div>
        </div>
        
        <div className="w-full h-4 bg-neutral-900 rounded-full overflow-hidden relative border border-neutral-800">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: calsPercent + "%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="flex flex-col border-l-2 border-blue-500 pl-4">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Protein</span>
            <span className="text-lg font-black text-white">{consumed.protein} <span className="text-xs text-neutral-600">/ {plan.protein}g</span></span>
          </div>
          <div className="flex flex-col border-l-2 border-emerald-500 pl-4">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Carbs</span>
            <span className="text-lg font-black text-white">{consumed.carbs} <span className="text-xs text-neutral-600">/ {plan.carbs}g</span></span>
          </div>
          <div className="flex flex-col border-l-2 border-amber-500 pl-4">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Fats</span>
            <span className="text-lg font-black text-white">{consumed.fats} <span className="text-xs text-neutral-600">/ {plan.fats}g</span></span>
          </div>
        </div>
      </div>

      <div className="bg-black border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-neutral-800">
          <button 
            onClick={function() { setActiveTab("quick"); }}
            className={"flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors " + (activeTab === "quick" ? "bg-neutral-900 text-white" : "bg-black text-neutral-500 hover:bg-neutral-950")}
          >
            Quick Add
          </button>
          <button 
            onClick={function() { setActiveTab("search"); }}
            className={"flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors " + (activeTab === "search" ? "bg-neutral-900 text-white" : "bg-black text-neutral-500 hover:bg-neutral-950")}
          >
            Database
          </button>
          <button 
            onClick={function() { setActiveTab("ai-text"); }}
            className={"flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors " + (activeTab === "ai-text" ? "bg-neutral-900 text-white" : "bg-black text-neutral-500 hover:bg-neutral-950")}
          >
            AI Text
          </button>
          <button 
            onClick={function() { setActiveTab("ai"); }}
            className={"flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 " + (activeTab === "ai" ? "bg-neutral-900 text-red-500" : "bg-black text-neutral-500 hover:bg-neutral-950")}
          >
            <Lock size={12} /> AI Image Scan
          </button>
        </div>

        <div className="p-6">
          {activeTab === "quick" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row gap-4">
              <input 
                type="number"
                value={qaCals}
                onChange={function(e) { setQaCals(e.target.value); }}
                placeholder="Calories"
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white font-bold outline-none focus:border-neutral-500"
              />
              <input 
                type="number"
                value={qaPro}
                onChange={function(e) { setQaPro(e.target.value); }}
                placeholder="Protein (g)"
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white font-bold outline-none focus:border-neutral-500"
              />
              <button 
                onClick={handleQuickAdd}
                className="bg-white text-black px-6 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors"
              >
                Add
              </button>
            </motion.div>
          )}

          {activeTab === "search" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <form onSubmit={handleSearchFood} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={function(e) { setSearchQuery(e.target.value); }}
                    placeholder="Search USDA Database..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-12 pr-4 py-3 text-white font-bold outline-none focus:border-neutral-500"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="bg-white text-black px-6 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                </button>
              </form>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center text-neutral-500 py-8 text-sm font-bold uppercase tracking-widest">
                    Search for a food to begin
                  </div>
                )}
                {searchResults.map(function(food, idx) {
                  return (
                    <div 
                      key={food.id || idx}
                      onClick={function() { handleAddFood(food.calories, food.protein, food.carbs, food.fats); }}
                      className="flex justify-between items-center p-3 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-neutral-700 cursor-pointer transition-colors"
                    >
                      <div className="flex-1 pr-4">
                        <div className="text-sm font-bold text-white capitalize">{food.description.toLowerCase()}</div>
                        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1 flex gap-2 flex-wrap">
                          <span>100g</span>
                          <span>• {food.calories} kcal</span>
                          <span>• {food.protein}g Pro</span>
                          <span>• {food.carbs}g Carb</span>
                          <span>• {food.fats}g Fat</span>
                        </div>
                      </div>
                      <Plus className="text-neutral-400 flex-shrink-0 hover:text-white transition-colors" size={16} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "ai-text" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex flex-col gap-4">
                <textarea 
                  value={aiTextQuery}
                  onChange={function(e) { setAiTextQuery(e.target.value); }}
                  placeholder="E.g., I had 200g of chicken breast, a cup of rice, and a tablespoon of olive oil"
                  className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-white font-bold outline-none focus:border-neutral-500 resize-none"
                />
                <button 
                  onClick={handleParseText}
                  disabled={isParsingText || !aiTextQuery.trim()}
                  className="bg-white text-black px-6 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isParsingText ? <Loader2 size={16} className="animate-spin" /> : null}
                  Parse with AI
                </button>
              </div>

              {parsedTextResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <div className="text-xl font-black text-white uppercase tracking-wider mb-2">{parsedTextResult.foodName}</div>
                  <div className="flex gap-4 text-xs font-bold uppercase tracking-widest mb-6">
                    <span className="text-white">{parsedTextResult.calories} kcal</span>
                    <span className="text-blue-500">{parsedTextResult.protein}g Pro</span>
                    <span className="text-emerald-500">{parsedTextResult.carbs}g Carb</span>
                    <span className="text-amber-500">{parsedTextResult.fats}g Fat</span>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={function() { setParsedTextResult(null); }} className="flex-1 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-800">Discard</button>
                    <button 
                      onClick={function() { 
                        handleAddFood(parsedTextResult.calories, parsedTextResult.protein, parsedTextResult.carbs, parsedTextResult.fats);
                        setParsedTextResult(null);
                        setAiTextQuery("");
                      }} 
                      className="flex-1 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-neutral-200"
                    >
                      Log Food
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-red-950/30 text-red-500 px-3 py-1 rounded-full border border-red-900/50 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <Lock size={12} /> Premium Feature
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Unlock Your Potential</h3>
              <p className="text-sm font-bold text-neutral-400 mb-8 max-w-sm">
                Get access to 1:1 Coaching, AI Accurate Image Logging, and advanced analytics.
              </p>
              <button 
                onClick={function() { router.push("/premium"); }}
                className="bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-105"
              >
                Go Premium
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
