"use client";

import { useState, useEffect } from "react";
import { useOfflineSession } from "@/lib/useOfflineSession";
import { ChevronLeft, Search, CheckCircle2, Shield, Swords, Activity, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { getArenaLevel, getNumericLevel } from "@/lib/arena-levels";
import { motion, AnimatePresence } from "framer-motion";

import { calcStatsFromStorageObj } from "@/lib/stats";
import { getAuthHeaders } from "@/lib/utils";

export default function VersusPage() {
  const router = useRouter();
  const { data: session } = useOfflineSession();
  
  const [friendCode, setFriendCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [myStats, setMyStats] = useState<any>(null);
  const [competitorStats, setCompetitorStats] = useState<any>(null);
  const [competitorEmail, setCompetitorEmail] = useState("");

  useEffect(() => {
    const storageObj: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) storageObj[key] = localStorage.getItem(key) || "";
    }
    setMyStats(calcStatsFromStorageObj(storageObj));
  }, []);

  const handleCopy = () => {
    const myId = (session?.user as any)?.id;
    if (myId) {
      navigator.clipboard.writeText(myId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCode.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`https://www.ultimatum.website/api/versus?friendId=${encodeURIComponent(friendCode)}`, {
        headers: getAuthHeaders()
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || "Failed to find competitor");
      
      if (!json.data) {
        throw new Error("Competitor hasn't synced any data yet");
      }
      
      setCompetitorEmail(json.email);
      setCompetitorStats(calcStatsFromStorageObj(json.data));
    } catch (err: any) {
      console.warn("Backend unavailable or failed. Generating offline Rival...", err.message);
      // Generate a mock rival based on my stats if offline
      setCompetitorEmail("RIVAL_GHOST_AI");
      setCompetitorStats({
        avgScore: myStats.avgScore ? myStats.avgScore + Math.floor(Math.random() * 5) - 2 : 20,
        volume: myStats.volume ? myStats.volume + Math.floor(Math.random() * 10) - 5 : 45,
        consistency: myStats.consistency ? Math.min(100, myStats.consistency + Math.floor(Math.random() * 15) - 5) : 80,
        strength: myStats.strength ? myStats.strength + Math.floor(Math.random() * 20) - 10 : 250,
        cardio: myStats.cardio ? myStats.cardio + Math.floor(Math.random() * 30) - 15 : 90
      });
      setError("Server unreachable. Loaded Offline Ghost Rival.");
    } finally {
      setLoading(false);
    }
  };

  const StatRow = ({ label, myVal, compVal, higherIsBetter = true, suffix = "" }: any) => {
    const myWin = higherIsBetter ? myVal > compVal : myVal < compVal;
    const compWin = higherIsBetter ? compVal > myVal : compVal < myVal;
    
    return (
      <div className="flex justify-between items-center py-5 border-b border-[#2C2C2E] last:border-b-0">
        <div className={`w-1/3 text-left font-bold text-xl md:text-2xl ${myWin ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" : "text-neutral-600"}`}>
          {myVal}<span className="text-[10px] ml-1 opacity-50">{suffix}</span>
        </div>
        <div className="w-1/3 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-tight">
          {label}
        </div>
        <div className={`w-1/3 text-right font-bold text-xl md:text-2xl ${compWin ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" : "text-neutral-600"}`}>
          {compVal}<span className="text-[10px] ml-1 opacity-50">{suffix}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-900 selection:text-white font-sans">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl p-4 md:p-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Swords size={32} className="text-white" />
            Versus
          </h1>
          <button
            onClick={() => router.push("/arena")}
            className="w-12 h-12 shrink-0 flex items-center justify-center bg-[#1C1C1E] rounded-full border border-[#2C2C2E] text-neutral-400 hover:text-white hover:bg-[#2C2C2E] transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pt-8 md:p-8">
        {!competitorStats ? (
          <div className="max-w-md mx-auto space-y-8 mt-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Swords size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Multiplayer</h1>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mx-auto">
                Compare your stats, consistency, and raw strength against a friend to see who is truly dominating the Arena.
              </p>
            </div>

            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[24px] p-6 shadow-2xl">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Your Friend Code</div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={(session?.user as any)?.id || "Loading..."}
                  className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-neutral-300 focus:outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="px-6 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[24px] p-6 shadow-2xl space-y-5">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Enter Competitor Code</div>
              <div className="relative">
                <input 
                  type="text" 
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value)}
                  placeholder="Paste Friend ID here..."
                  className="w-full bg-black/40 border border-white/5 focus:border-white/30 rounded-xl px-4 py-4 pl-12 text-white outline-none transition-colors"
                  required
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              </div>
              
              {error && <div className="text-red-500 text-xs font-bold uppercase tracking-widest px-1">{error}</div>}
              
              <button 
                disabled={loading}
                className="w-full bg-gradient-to-r from-neutral-200 to-white text-black font-bold uppercase tracking-widest py-4 rounded-xl transition-all hover:scale-[1.02] shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {loading ? "Scanning..." : "Initiate Duel"}
              </button>
            </form>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end border-b border-[#2C2C2E] pb-6">
                <div className="w-2/5 text-left">
                  <div className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">You</div>
                  <div className="text-3xl md:text-5xl font-bold text-white truncate drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    {getNumericLevel(myStats.avgScore)}
                  </div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-2">
                    {getArenaLevel(myStats.avgScore).rank}
                  </div>
                </div>
                
                <div className="w-1/5 text-center pb-3">
                  <div className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <Swords className="text-white" size={20} />
                  </div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">VS</div>
                </div>

                <div className="w-2/5 text-right">
                  <div className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 truncate">
                    {competitorEmail.split('@')[0]}
                  </div>
                  <div className="text-3xl md:text-5xl font-bold text-neutral-400 truncate">
                    {getNumericLevel(competitorStats.avgScore)}
                  </div>
                  <div className="text-xs font-bold text-red-400 uppercase tracking-widest mt-2">
                    {getArenaLevel(competitorStats.avgScore).rank}
                  </div>
                </div>
              </div>

              <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[32px] p-6 md:p-8 shadow-2xl mt-8">
                <StatRow 
                  label="Arena Score" 
                  myVal={myStats.avgScore} 
                  compVal={competitorStats.avgScore} 
                />
                <StatRow 
                  label="Peak Weight Lifted" 
                  myVal={myStats.maxWeight} 
                  compVal={competitorStats.maxWeight} 
                  suffix=" LBS"
                />
                <StatRow 
                  label="7-Day Total Volume" 
                  myVal={Math.round(myStats.totalTonnage)} 
                  compVal={Math.round(competitorStats.totalTonnage)} 
                  suffix=" LBS"
                />
                <StatRow 
                  label="7-Day Workouts" 
                  myVal={myStats.consistency} 
                  compVal={competitorStats.consistency} 
                  suffix=" DAYS"
                />
                <StatRow 
                  label="All-Time Workouts" 
                  myVal={myStats.totalActiveDays} 
                  compVal={competitorStats.totalActiveDays} 
                  suffix=" DAYS"
                />
              </div>
              
              <div className="pt-6">
                <button 
                  onClick={() => setCompetitorStats(null)}
                  className="w-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-colors border border-[#2C2C2E]"
                >
                  Find New Challenger
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
