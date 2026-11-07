import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Heart, Clock, Zap, Target, Edit2 } from "lucide-react";

const CARDIO_SPLITS = [
  { id: "2-day", title: "Minimalist", days: 2, minsPerDay: 45, desc: "2x 45m Intense / HIIT" },
  { id: "3-day", title: "Balanced", days: 3, minsPerDay: 50, desc: "3x 50m Zone 2 Steady" },
  { id: "4-day", title: "Athlete", days: 4, minsPerDay: 40, desc: "4x 40m Zone 2 Steady" },
  { id: "7-day", title: "Daily", days: 7, minsPerDay: 20, desc: "7x 20m Active Recovery" },
];

export default function CardioTracker() {
  const [selectedSplit, setSelectedSplit] = useState(CARDIO_SPLITS[1]);
  const [isEditingProtocol, setIsEditingProtocol] = useState(false);
  const [logMinutes, setLogMinutes] = useState("");
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [isHoveringDial, setIsHoveringDial] = useState(false);

  useEffect(() => {
    try {
      const savedSplitId = localStorage.getItem("ultimatum_cardio_split");
      if (savedSplitId) {
        const found = CARDIO_SPLITS.find(s => s.id === savedSplitId);
        if (found) {
          setSelectedSplit(found);
        }
      }
      
      const historyRaw = localStorage.getItem("ultimatum_cardio_history");
      if (historyRaw) {
        const history = JSON.parse(historyRaw);
        const now = Date.now();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const recentMins = history.reduce((sum: number, entry: any) => {
          return (now - entry.timestamp < sevenDaysMs) ? sum + Number(entry.minutes) : sum;
        }, 0);
        setWeeklyMinutes(recentMins);
      }
    } catch {}
  }, []);

  const handleSelectSplit = (split: typeof CARDIO_SPLITS[0]) => {
    setSelectedSplit(split);
    localStorage.setItem("ultimatum_cardio_split", split.id);
    setIsEditingProtocol(false);
  };

  const handleLogCardio = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(logMinutes);
    if (isNaN(mins) || mins <= 0) return;

    try {
      const historyRaw = localStorage.getItem("ultimatum_cardio_history");
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      history.push({ timestamp: Date.now(), minutes: mins });
      localStorage.setItem("ultimatum_cardio_history", JSON.stringify(history));
      
      setWeeklyMinutes(prev => prev + mins);
      setLogMinutes("");
    } catch {}
  };

  const handleUndoLast = () => {
    try {
      const historyRaw = localStorage.getItem("ultimatum_cardio_history");
      if (historyRaw) {
        const history = JSON.parse(historyRaw);
        if (history.length > 0) {
          history.pop(); // Remove last entry
          localStorage.setItem("ultimatum_cardio_history", JSON.stringify(history));
          
          // Recalculate
          const now = Date.now();
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
          const recentMins = history.reduce((sum: number, entry: any) => {
            return (now - entry.timestamp < sevenDaysMs) ? sum + Number(entry.minutes) : sum;
          }, 0);
          setWeeklyMinutes(recentMins);
        }
      }
    } catch {}
  };

  const targetMinutes = selectedSplit.days * selectedSplit.minsPerDay;
  const progressPercentage = Math.min(100, (weeklyMinutes / targetMinutes) * 100);

  // SVG Dial Math
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 z-10 relative flex flex-col items-center">
      
      {/* Dynamic Title / Selection Mode */}
      <AnimatePresence mode="wait">
        {!isEditingProtocol ? (
          <motion.div 
            key="display"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col items-center mb-12"
          >
            <div 
              onClick={() => setIsEditingProtocol(true)}
              className="group cursor-pointer flex items-center gap-2 bg-neutral-900 hover:bg-[#222] border border-[#333] px-4 py-1.5 rounded-full transition-colors mb-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 group-hover:text-white transition-colors">{selectedSplit.title} Protocol</span>
              <Edit2 size={12} className="text-neutral-500 group-hover:text-red-400" />
            </div>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">{selectedSplit.desc}</p>
          </motion.div>
        ) : (
          <motion.div 
            key="edit"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap justify-center gap-3 mb-12 w-full max-w-md"
          >
            {CARDIO_SPLITS.map(split => (
              <button
                key={split.id}
                onClick={() => handleSelectSplit(split)}
                className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  selectedSplit.id === split.id 
                    ? "bg-gradient-to-b from-red-600 to-red-900 border-red-500 text-white shadow-sm" 
                    : "bg-[#111] border-[#333] text-neutral-500 hover:text-white hover:border-[#555]"
                }`}
              >
                {split.title}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3D Dial Assembly */}
      <div 
        className="relative flex items-center justify-center w-[300px] h-[300px] mb-20"
        onMouseEnter={() => setIsHoveringDial(true)}
        onMouseLeave={() => setIsHoveringDial(false)}
      >
        {/* Glow behind the SVG */}
        <div className="absolute inset-0 bg-red-900/20 blur-[60px] rounded-full pointer-events-none transition-opacity duration-500" style={{ opacity: progressPercentage > 0 ? 0.6 : 0 }}></div>

        {/* Outer SVG Progress Ring */}
        <svg width="300" height="300" className="absolute -rotate-90 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)] pointer-events-none z-20">
          <circle
            cx="150" cy="150" r={radius}
            stroke="#161616" strokeWidth="6" fill="none"
          />
          <circle
            cx="150" cy="150" r={radius}
            stroke="url(#redGradient)" strokeWidth="6" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
          />
          <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4b4b" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
        </svg>

        {/* 3D Hardware Base (Outset) */}
        <div 
          className="w-64 h-64 rounded-full flex flex-col items-center justify-center relative z-10 backdrop-blur-md border border-white/10"
          style={{
            background: 'linear-gradient(145deg, rgba(34,34,34,0.15), rgba(17,17,17,0.05))',
            boxShadow: '15px 15px 30px rgba(0,0,0,0.5), -15px -15px 30px rgba(255,255,255,0.02), inset 1px 1px 2px rgba(255,255,255,0.1)'
          }}
        >
          {/* Inner 3D Knob (Inset) */}
          <div 
            className="w-48 h-48 rounded-full flex flex-col items-center justify-center relative border border-black/40 backdrop-blur-sm"
            style={{
              background: 'linear-gradient(145deg, rgba(17,17,17,0.05), rgba(26,26,26,0.15))',
              boxShadow: 'inset 8px 8px 16px rgba(0,0,0,0.6), inset -8px -8px 16px rgba(255,255,255,0.04)'
            }}
          >
            {/* Center Display */}
            <div className={`flex flex-col items-center transition-transform duration-300 ${isHoveringDial ? 'scale-105' : 'scale-100'}`}>
              <Heart 
                size={20} 
                className={`mb-2 transition-colors duration-500 ${progressPercentage >= 100 ? 'text-red-500' : 'text-neutral-600'}`} 
                fill={progressPercentage >= 100 ? 'currentColor' : 'none'}
              />
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  {weeklyMinutes}
                </span>
                <span className="text-sm font-black text-neutral-600">
                  / {targetMinutes}
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500 mt-2">
                Rolling Mins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Log Input */}
      <form onSubmit={handleLogCardio} className="w-full max-w-sm relative z-20 mb-24">
        <div 
          className="relative flex items-center bg-[#111] border border-[#222] rounded-full p-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus-within:border-red-900/50 transition-colors"
        >
          <input
            type="number"
            placeholder="ADD MINUTES..."
            value={logMinutes}
            onChange={(e) => setLogMinutes(e.target.value)}
            className="w-full bg-transparent px-6 py-3 text-white placeholder:text-neutral-600 focus:outline-none text-xs font-black tracking-widest uppercase text-center"
          />
          <button
            type="submit"
            disabled={!logMinutes}
            className="absolute right-1 top-1 bottom-1 px-6 bg-gradient-to-b from-red-600 to-red-800 text-white font-black uppercase tracking-widest text-[10px] rounded-full shadow-sm hover:shadow-md disabled:opacity-50 disabled:grayscale disabled:hover:shadow-none transition-all duration-300"
          >
            LOG
          </button>
        </div>
        
        {weeklyMinutes > 0 && (
          <div className="absolute -bottom-10 left-0 right-0 flex justify-center animate-in fade-in zoom-in duration-300">
            <button
              type="button"
              onClick={handleUndoLast}
              className="text-[9px] font-bold text-neutral-600 hover:text-red-400 transition-colors uppercase tracking-[0.2em]"
            >
              Undo Last Entry
            </button>
          </div>
        )}
      </form>

      {/* Streamlined Intel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-black/60 border border-[#222] rounded-3xl flex flex-col gap-3 items-center text-center shadow-lg transition-transform hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center border border-[#333]">
            <Clock className="text-neutral-400" size={16} strokeWidth={2.5} />
          </div>
          <h3 className="text-[10px] font-black text-neutral-500 tracking-[0.2em] uppercase">Dosage</h3>
          <p className="text-[11px] text-neutral-400 leading-relaxed font-bold">
            150 minutes weekly of Zone 2 steady-state, or 1-2 sessions of intense HIIT.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-black/60 border border-[#222] rounded-3xl flex flex-col gap-3 items-center text-center shadow-lg transition-transform hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center border border-[#333]">
            <Zap className="text-neutral-400" size={16} strokeWidth={2.5} />
          </div>
          <h3 className="text-[10px] font-black text-neutral-500 tracking-[0.2em] uppercase">Timing</h3>
          <p className="text-[11px] text-neutral-400 leading-relaxed font-bold">
            Never perform before lifting. Execute after weights or separately to protect CNS.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 bg-black/60 border border-[#222] rounded-3xl flex flex-col gap-3 items-center text-center shadow-lg transition-transform hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center border border-[#333]">
            <Target className="text-neutral-400" size={16} strokeWidth={2.5} />
          </div>
          <h3 className="text-[10px] font-black text-neutral-500 tracking-[0.2em] uppercase">Truth</h3>
          <p className="text-[11px] text-neutral-400 leading-relaxed font-bold">
            Fasted cardio burns no extra net fat. Total daily caloric deficit dictates fat loss.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
