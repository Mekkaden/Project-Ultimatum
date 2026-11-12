"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2, RefreshCw, WifiOff, Mic, Pencil, X, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAuthHeaders } from '@/lib/utils';
import { RecalculateMacrosModal } from '@/components/RecalculateMacrosModal';
import { searchUsdaFoods, type FoodResult } from '@/lib/usda';

interface ParsedMacros {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DietPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  goal?: string;
}

interface DietDashboardProps {
  plan?: DietPlan;
  isOffline?: boolean;
  onUpdatePlan?: (newPlan: DietPlan) => void;
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: number;
  dateString: string;
  mealType?: string;
}

export default function DietDashboard({ plan: planProp, isOffline: isOfflineProp, onUpdatePlan }: DietDashboardProps) {
  const router = useRouter();
  const plan: DietPlan = planProp || { calories: 2500, protein: 180, carbs: 250, fats: 70 };
  
  const [foodHistory, setFoodHistory] = useState<FoodEntry[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ultimatum_food_history');
    if (saved) {
      try {
        const parsed: FoodEntry[] = JSON.parse(saved);
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recent = parsed.filter(entry => entry.timestamp > sevenDaysAgo);
        setFoodHistory(recent);
        if (recent.length !== parsed.length) {
          localStorage.setItem('ultimatum_food_history', JSON.stringify(recent));
        }
      } catch (e) {}
    }
    setIsHistoryLoaded(true);
  }, []);

  useEffect(() => {
    if (isHistoryLoaded) {
      localStorage.setItem('ultimatum_food_history', JSON.stringify(foodHistory));
    }
  }, [foodHistory, isHistoryLoaded]);

  const consumed = React.useMemo(() => {
    const today = new Date().toDateString();
    return foodHistory
      .filter(entry => entry.dateString === today)
      .reduce((acc, entry) => {
        acc.calories += entry.calories;
        acc.protein += entry.protein;
        acc.carbs += entry.carbs;
        acc.fats += entry.fats;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [foodHistory]);

  const stateActiveTab = useState("quick");
  const activeTab = stateActiveTab[0];
  const setActiveTab = stateActiveTab[1];

  const stateQA_Cals = useState("");
  const qaCals = stateQA_Cals[0];
  const setQaCals = stateQA_Cals[1];
  
  const [qaName, setQaName] = useState("");
  
  const stateQA_Pro = useState("");
  const qaPro = stateQA_Pro[0];
  const setQaPro = stateQA_Pro[1];

  const stateQA_Carbs = useState("");
  const qaCarbs = stateQA_Carbs[0];
  const setQaCarbs = stateQA_Carbs[1];

  const stateQA_Fats = useState("");
  const qaFats = stateQA_Fats[0];
  const setQaFats = stateQA_Fats[1];

  const stateScanning = useState(false);
  const isScanning = stateScanning[0];
  const setIsScanning = stateScanning[1];

  const stateScanResult = useState(null);
  const scanResult = stateScanResult[0];
  const setScanResult = stateScanResult[1];

  const stateSearchQuery = useState("");
  const searchQuery = stateSearchQuery[0];
  const setSearchQuery = stateSearchQuery[1];

  const [isNetworkFailed, setIsNetworkFailed] = useState(false);
  const effectivelyOffline = isOfflineProp || isNetworkFailed;

  const [searchResults, setSearchResults] = useState<FoodResult[]>([]);

  const stateIsSearching = useState(false);
  const isSearching = stateIsSearching[0];
  const setIsSearching = stateIsSearching[1];

  const [searchError, setSearchError] = useState<string | null>(null);

  async function handleSearchFood(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setIsSearching(true);
    setIsNetworkFailed(false);
    setSearchError(null);
    try {
      // Queried directly from the device: the static export has no server to
      // run /api/food-search (that route returned "Query parameter is required").
      const foods = await searchUsdaFoods(query);
      setSearchResults(foods);
      if (foods.length === 0) {
        setSearchError(`No foods found for "${query}".`);
      }
    } catch (err) {
      console.error("[food-search]", err);
      setSearchResults([]);
      if (!navigator.onLine) {
        setIsNetworkFailed(true);
      } else {
        setSearchError(err instanceof Error ? err.message : "Search failed. Please try again.");
      }
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

  const [parsedTextResult, setParsedTextResult] = useState<ParsedMacros | null>(null);
  const [showEditMacros, setShowEditMacros] = useState(false);
  const [editForm, setEditForm] = useState({
    calories: String(plan.calories),
    protein: String(plan.protein),
    fats: String(plan.fats),
    carbs: String(plan.carbs)
  });
  const [showRecalculate, setShowRecalculate] = useState(false);

  const handleSaveMacros = () => {
    if (!onUpdatePlan) return;
    const newPlan: DietPlan = {
      ...plan,
      calories: parseInt(editForm.calories) || plan.calories,
      protein: parseInt(editForm.protein) || plan.protein,
      fats: parseInt(editForm.fats) || plan.fats,
      carbs: parseInt(editForm.carbs) || plan.carbs,
    };
    onUpdatePlan(newPlan);
    setShowEditMacros(false);
  };

  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

  const [isListening, setIsListening] = useState(false);

  // Voice logging needs the microphone. The Android build does not declare
  // RECORD_AUDIO (no workout feature uses it), so the button is hidden there and
  // this guard stops any stray call from reaching getUserMedia and crashing.
  const voiceSupported =
    typeof window !== "undefined" &&
    !(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.() &&
    Boolean(
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
        (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
          .webkitSpeechRecognition,
    );

  async function toggleListen() {
    if (isListening) return;
    if (!voiceSupported) {
      alert("Voice logging is not available in this build. Please type the entry instead.");
      return;
    }
    
    // Request microphone permission natively via browser media devices to trigger Capacitor Android prompt
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately as we just needed the permission prompt
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Mic permission denied", err);
      alert("Microphone permission was denied. Please allow it in your device settings.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join("");
      setAiTextQuery(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please allow it in the URL bar.");
      } else {
        alert(`Speech recognition failed (${event.error}). Note: Brave browser often blocks this feature by default for privacy.`);
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  }

  const [isScanningImage, setIsScanningImage] = useState(false);
  const [imageScanResult, setImageScanResult] = useState<ParsedMacros | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningImage(true);
    setImageScanResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const res = await fetch("https://www.ultimatum.website/api/ai-image-scan", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type })
        });
        if (!res.ok) throw new Error("Failed to scan image");
        const data = await res.json();
        setImageScanResult(data);
      } catch (err) {
        console.error(err);
        alert("Error scanning image. Please try again.");
      } finally {
        setIsScanningImage(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleParseText() {
    if (!aiTextQuery.trim()) return;
    setIsParsingText(true);
    setParsedTextResult(null);
    setIsNetworkFailed(false);
    try {
      const res = await fetch("https://www.ultimatum.website/api/ai-text-log", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: aiTextQuery })
      });
      if (!res.ok) throw new Error("Network request failed");
      const data = await res.json();
      if (data.calories !== undefined) {
        setParsedTextResult(data);
      }
    } catch (e) {
      console.error(e);
      setIsNetworkFailed(true);
      alert("Network Error: Could not reach the server. You may be offline despite your device indicating otherwise.");
    } finally {
      setIsParsingText(false);
    }
  }

  function handleQuickAdd() {
    const cals = parseInt(qaCals) || 0;
    const pro = parseInt(qaPro) || 0;
    const carbs = parseInt(qaCarbs) || 0;
    const fats = parseInt(qaFats) || 0;
    
    if (cals <= 0) {
      alert("Calories are required to log a quick add entry.");
      return;
    }
    
    handleAddFood(cals, pro, carbs, fats, qaName.trim() || "Quick Add");
    setQaName("");
    setQaCals("");
    setQaPro("");
    setQaCarbs("");
    setQaFats("");
  }

  function handleAddFood(calories: number, protein: number, carbs: number, fats: number, name: string = "Quick Add") {
    const entry: FoodEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      calories,
      protein,
      carbs,
      fats,
      timestamp: Date.now(),
      dateString: new Date().toDateString(),
      mealType: selectedMealType || undefined
    };
    
    setFoodHistory(prev => [entry, ...prev]);
  }

  function handleDeleteEntry(id: string) {
    setFoodHistory(prev => {
      const newHistory = prev.filter(entry => entry.id !== id);
      if (newHistory.length === 0) {
        localStorage.removeItem('ultimatum_food_history');
      }
      return newHistory;
    });
  }

  const calsPercent = Math.min((consumed.calories / plan.calories) * 100, 100);
  const remainingCals = Math.max(0, plan.calories - consumed.calories);

  // Format date like "Monday, May 22"
  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 md:space-y-8">
      
      {showRecalculate && (
        <RecalculateMacrosModal 
          onClose={() => setShowRecalculate(false)} 
          onSave={(newPlan) => {
            if (onUpdatePlan) onUpdatePlan(newPlan);
            setShowRecalculate(false);
          }} 
        />
      )}

      {/* Edit Macros Modal */}
      <AnimatePresence>
        {showEditMacros && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowEditMacros(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#121212] border border-neutral-800 rounded-3xl p-6 shadow-2xl"
            >
              <button 
                onClick={() => setShowEditMacros(false)}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-6">Edit Targets</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Calories</label>
                  <input
                    type="number"
                    value={editForm.calories}
                    onChange={(e) => setEditForm({ ...editForm, calories: e.target.value })}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e4fcaf] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Protein (g)</label>
                  <input
                    type="number"
                    value={editForm.protein}
                    onChange={(e) => setEditForm({ ...editForm, protein: e.target.value })}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e4fcaf] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Fats (g)</label>
                    <input
                      type="number"
                      value={editForm.fats}
                      onChange={(e) => setEditForm({ ...editForm, fats: e.target.value })}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e4fcaf] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Carbs (g)</label>
                    <input
                      type="number"
                      value={editForm.carbs}
                      onChange={(e) => setEditForm({ ...editForm, carbs: e.target.value })}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e4fcaf] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveMacros}
                className="w-full mt-6 bg-[#e4fcaf] text-black font-black uppercase tracking-widest py-3 text-[10px] rounded-xl flex items-center justify-center gap-2 hover:brightness-105 transition-colors shadow-sm"
              >
                <Save size={14} />
                Save Changes
              </button>
              
              <button 
                onClick={() => { setShowEditMacros(false); setShowRecalculate(true); }}
                className="w-full mt-3 bg-neutral-900 border border-neutral-800 text-white font-black uppercase tracking-widest py-3 text-[10px] rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
              >
                <RefreshCw size={14} />
                Auto-Recalculate
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Dashboard Header */}
      <div className="rounded-[28px] p-5 md:p-6 relative overflow-hidden shadow-2xl bg-[#121212] border border-neutral-800">
        <div className="flex justify-between items-start relative z-10 mb-5">
          <div>
            <h2 className="text-lg md:text-xl font-black text-[#CCFF00] tracking-tight leading-tight">
              {todayFormatted.split(',')[0]},<br/>
              <span className="text-white">{todayFormatted.split(',')[1]}</span>
            </h2>
          </div>
          {onUpdatePlan && (
            <button 
              onClick={() => setShowEditMacros(true)}
              className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all shadow-lg"
            >
              <Pencil size={15} />
            </button>
          )}
        </div>

        {/* Macros Pill Row */}
        <div className="flex justify-between items-center gap-2 mb-6 relative z-10 overflow-x-auto pb-1 custom-scrollbar">
          <div className="min-w-[64px] flex-1 bg-neutral-900 border border-neutral-800 rounded-full py-2 px-2 flex flex-col items-center justify-center shadow-lg">
            <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Calories</span>
            <span className="text-xs font-black mt-0.5 leading-none text-white">{consumed.calories}</span>
          </div>
          <div className="min-w-[64px] flex-1 bg-neutral-900 border border-neutral-800 rounded-full py-2 px-2 flex flex-col items-center justify-center shadow-lg">
            <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Protein</span>
            <span className="text-xs font-black mt-0.5 leading-none text-white">{consumed.protein}g</span>
          </div>
          <div className="min-w-[64px] flex-1 bg-neutral-900 border border-neutral-800 rounded-full py-2 px-2 flex flex-col items-center justify-center shadow-lg">
            <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Fats</span>
            <span className="text-xs font-black mt-0.5 leading-none text-white">{consumed.fats}g</span>
          </div>
          <div className="min-w-[64px] flex-1 bg-neutral-900 border border-neutral-800 rounded-full py-2 px-2 flex flex-col items-center justify-center shadow-lg">
            <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Carbs</span>
            <span className="text-xs font-black mt-0.5 leading-none text-white">{consumed.carbs}g</span>
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center z-10 mb-1 mt-1">
          <svg viewBox="0 0 192 192" className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            <defs>
              <mask id="gauge-mask">
                <circle 
                  cx="96" cy="96" r="80" 
                  stroke="white" 
                  strokeWidth="14" 
                  fill="none" 
                  strokeDasharray="4 6" 
                />
              </mask>
            </defs>
            
            <g mask="url(#gauge-mask)">
              {/* Background track */}
              <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.15)" strokeWidth="14" fill="none" />
              
              {/* Progress */}
              <circle 
                cx="96" cy="96" r="80" 
                stroke="#CCFF00" 
                strokeWidth="14" 
                fill="none" 
                strokeDasharray={2 * Math.PI * 80} 
                strokeDashoffset={2 * Math.PI * 80 - (Math.min((consumed.calories / plan.calories) * 100, 100) / 100) * (2 * Math.PI * 80)} 
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]" 
              />

              {/* Excess Progress */}
              {consumed.calories > plan.calories && (
                <circle 
                  cx="96" cy="96" r="80" 
                  stroke="#ef4444" 
                  strokeWidth="14" 
                  fill="none" 
                  strokeDasharray={2 * Math.PI * 80} 
                  strokeDashoffset={2 * Math.PI * 80 - (Math.min(((consumed.calories - plan.calories) / plan.calories) * 100, 100) / 100) * (2 * Math.PI * 80)} 
                  className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                />
              )}
            </g>
          </svg>
          
          <div className="text-center flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-full w-28 h-28 shadow-xl z-20">
            <div className="text-lg font-black text-white tracking-tight">{consumed.calories} <span className="text-[9px] text-neutral-500 font-bold">kcal</span></div>
            {consumed.calories > plan.calories ? (
              <div className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-0.5">{consumed.calories - plan.calories} over</div>
            ) : (
              <div className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">{plan.calories - consumed.calories} left</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#121212] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-3 md:flex md:flex-row border-b border-neutral-800">
          <button 
            onClick={function() { setActiveTab("quick"); }}
            className={"md:flex-1 py-3 md:py-4 text-[9px] md:text-xs font-bold uppercase tracking-widest transition-colors border-r border-b md:border-b-0 border-neutral-800 " + (activeTab === "quick" ? "bg-neutral-900 text-white" : "bg-black text-neutral-500 hover:bg-neutral-950")}
          >
            Quick Add
          </button>
          <button 
            onClick={function() { setActiveTab("history"); }}
            className={`md:flex-1 py-3 md:py-4 text-[9px] md:text-xs font-bold uppercase tracking-widest transition-colors border-r border-b md:border-b-0 border-neutral-800 ${activeTab === "history" ? "bg-neutral-900 text-white" : "bg-black text-neutral-500 hover:bg-neutral-950"}`}
          >
            History
          </button>
          <button 
            onClick={function() { setActiveTab("search"); }}
            disabled={effectivelyOffline}
            className={`md:flex-1 py-3 md:py-4 text-[9px] md:text-xs font-bold uppercase tracking-widest transition-colors border-b md:border-b-0 md:border-r border-neutral-800 ${activeTab === "search" ? "bg-neutral-900 text-white" : "bg-black text-neutral-500 hover:bg-neutral-950"} ${effectivelyOffline ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            Database
          </button>
          <button 
            onClick={function() { setActiveTab("ai-text"); }}
            className={`col-span-1 md:col-span-auto md:flex-1 py-3 md:py-4 text-[9px] md:text-xs font-bold uppercase tracking-widest transition-colors border-r border-neutral-800 md:border-none flex items-center justify-center gap-1.5 ${activeTab === "ai-text" ? "bg-neutral-900 text-white" : "bg-black text-neutral-500 hover:bg-neutral-950"}`}
          >
            <span>AI Text</span>
            <span className="text-white font-bold text-[9px] md:text-[10px] lowercase">pro</span>
          </button>
          <button 
            onClick={function() { setActiveTab("ai"); }}
            className={`col-span-2 md:col-span-auto md:flex-1 py-3 md:py-4 text-[9px] md:text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 ${activeTab === "ai" ? "bg-neutral-900 text-white" : "bg-black text-neutral-500 hover:bg-neutral-950"}`}
          >
            <span>AI Scan</span>
            <span className="text-white font-bold text-[9px] md:text-[10px] lowercase">pro</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab !== "history" && (
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <button 
                onClick={() => setSelectedMealType("")}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${selectedMealType === "" ? "bg-[#e4fcaf] text-black shadow-sm" : "bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white"}`}
              >
                Any Time
              </button>
              {mealTypes.map(meal => (
                <button 
                  key={meal}
                  onClick={() => setSelectedMealType(meal)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${selectedMealType === meal ? "bg-[#e4fcaf] text-black shadow-sm" : "bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white"}`}
                >
                  {meal}
                </button>
              ))}
            </div>
          )}

          {activeTab === "history" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {foodHistory.length === 0 ? (
                <div className="text-center text-neutral-500 py-8 text-sm font-bold uppercase tracking-widest">
                  No food logged in the past 7 days
                </div>
              ) : (
                Object.entries(
                  foodHistory.reduce((acc, entry) => {
                    if (!acc[entry.dateString]) acc[entry.dateString] = [];
                    acc[entry.dateString].push(entry);
                    return acc;
                  }, {} as Record<string, FoodEntry[]>)
                ).map(([dateStr, entries]) => (
                  <div key={dateStr} className="space-y-3">
                    <div className="sticky top-0 z-10 py-1.5 bg-[#121212]/95 backdrop-blur-md flex items-center">
                      <span className="text-[9px] font-black tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-neutral-400 shadow-sm">
                        {dateStr}
                      </span>
                    </div>
                    {entries.map(entry => (
                      <div key={entry.id} className="flex justify-between items-center p-4 bg-neutral-900/40 hover:bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 rounded-2xl transition-all shadow-sm">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-bold text-white capitalize">{entry.name.toLowerCase()}</div>
                            {entry.mealType && (
                              <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
                                {entry.mealType}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1.5 flex gap-2 flex-wrap items-center">
                            <span className="text-white font-extrabold">{entry.calories} kcal</span>
                            <span>•</span>
                            <span>{entry.protein}g Pro</span>
                            <span>•</span>
                            <span>{entry.carbs}g Carb</span>
                            <span>•</span>
                            <span>{entry.fats}g Fat</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-all flex-shrink-0"
                          title="Delete entry"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </motion.div>
          )}
          {activeTab === "quick" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <input 
                type="number"
                value={qaCals}
                onChange={function(e) { setQaCals(e.target.value); }}
                placeholder="Calories *"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white font-bold outline-none focus:border-neutral-500"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input 
                  type="text"
                  value={qaName}
                  onChange={function(e) { setQaName(e.target.value); }}
                  placeholder="Food Name (opt.)"
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white font-bold outline-none focus:border-neutral-500"
                />
                <input 
                  type="number"
                  value={qaPro}
                  onChange={function(e) { setQaPro(e.target.value); }}
                  placeholder="Protein (opt.)"
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white font-bold outline-none focus:border-neutral-500"
                />
                <input 
                  type="number"
                  value={qaCarbs}
                  onChange={function(e) { setQaCarbs(e.target.value); }}
                  placeholder="Carbs (opt.)"
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white font-bold outline-none focus:border-neutral-500"
                />
                <input 
                  type="number"
                  value={qaFats}
                  onChange={function(e) { setQaFats(e.target.value); }}
                  placeholder="Fats (opt.)"
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white font-bold outline-none focus:border-neutral-500"
                />
              </div>
              <button 
                onClick={handleQuickAdd}
                className={`w-full px-6 py-4 rounded-[16px] font-black uppercase tracking-[0.2em] transition-all text-sm ${parseInt(qaCals) > 0 ? "bg-[#e4fcaf] text-black shadow-sm hover:brightness-105 hover:scale-[1.02] active:scale-95" : "bg-[rgba(255,255,255,0.05)] text-neutral-600 border border-white/5"}`}
              >
                Log Food
              </button>
            </motion.div>
          )}

          {activeTab === "search" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {effectivelyOffline ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <WifiOff className="text-neutral-500 mb-4" size={32} />
                  <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">Offline</h3>
                  <p className="text-xs font-bold text-neutral-500 mb-4">
                    Database search requires an active internet connection. Use Quick Add instead.
                  </p>
                  <button 
                    onClick={() => setIsNetworkFailed(false)}
                    className="text-xs font-bold uppercase tracking-widest text-white border border-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-900"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : (
                <>
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
                    {searchError && (
                      <div className="text-center text-red-400 py-6 px-4 text-xs font-bold uppercase tracking-widest">
                        {searchError}
                      </div>
                    )}
                    {searchResults.length === 0 && !isSearching && !searchError && (
                      <div className="text-center text-neutral-500 py-8 text-sm font-bold uppercase tracking-widest">
                        Search for a food to begin
                      </div>
                    )}
                    {searchResults.map(function(food, idx) {
                      return (
                        <div 
                          key={food.id || idx}
                          onClick={function() { handleAddFood(food.calories, food.protein, food.carbs, food.fats, food.description); }}
                          className="flex justify-between items-center p-4 bg-neutral-900/40 hover:bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700 rounded-2xl cursor-pointer transition-all shadow-sm"
                        >
                          <div className="flex-1 pr-4">
                            <div className="text-sm font-bold text-white capitalize">{food.description.toLowerCase()}</div>
                            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1.5 flex gap-2 flex-wrap items-center">
                              <span className="text-white font-extrabold">100g</span>
                              <span>•</span>
                              <span>{food.calories} kcal</span>
                              <span>•</span>
                              <span>{food.protein}g Pro</span>
                              <span>•</span>
                              <span>{food.carbs}g Carb</span>
                              <span>•</span>
                              <span>{food.fats}g Fat</span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-400 group-hover:text-white transition-colors">
                            <Plus size={16} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === "ai-text" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-14 px-4 text-center">
              <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white mb-2">
                LOCKED
              </h3>
              <p className="text-xs text-neutral-500 font-medium max-w-xs mx-auto leading-relaxed">
                This feature is currently locked. Use Quick Add or Database search to log your nutrition.
              </p>
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-14 px-4 text-center">
              <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white mb-2">
                LOCKED
              </h3>
              <p className="text-xs text-neutral-500 font-medium max-w-xs mx-auto leading-relaxed">
                This feature is currently locked. Use Quick Add or Database search to log your nutrition.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
