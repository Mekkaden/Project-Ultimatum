"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, Zap, ShieldCheck, Moon, Activity } from "lucide-react";

type SleepLog = {
  date: string;
  targetWakeTime: string;
  actualWakeTime: string;
  sunlightLogged: boolean;
  durationHours: number;
};

export default function SleepInsightsModule() {
  const [history, setHistory] = useState<SleepLog[]>([]);
  const [status, setStatus] = useState<"LOCKED" | "COMPROMISED" | "DEBT" | "NO_DATA">("NO_DATA");
  
  const loadData = useCallback(() => {
    try {
      const rawHistory = localStorage.getItem("ultimatum_sleep_history");
      const savedTargetWake = localStorage.getItem("ultimatum_target_wake_time") || "07:00";

      if (rawHistory) {
        const parsed: SleepLog[] = JSON.parse(rawHistory);
        parsed.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setHistory(parsed);
        calculateStatus(parsed, savedTargetWake);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, [loadData]);

  const calculateStatus = (logs: SleepLog[], target: string) => {
    if (logs.length === 0) {
      setStatus("NO_DATA");
      return;
    }

    if (logs.length >= 4) {
      const lastFour = logs.slice(-4);
      const allUnderSix = lastFour.every(log => log.durationHours < 6);
      if (allUnderSix) {
        setStatus("DEBT");
        return;
      }
    }

    const todayLog = logs[logs.length - 1];
    const [tHours, tMins] = target.split(":").map(Number);
    const targetMins = tHours * 60 + tMins;
    
    const [aHours, aMins] = todayLog.actualWakeTime.split(":").map(Number);
    const actualMins = aHours * 60 + aMins;

    const diff = Math.abs(targetMins - actualMins);

    if (diff > 7) {
      setStatus("COMPROMISED");
      return;
    }

    setStatus("LOCKED");
  };

  const getStatusConfig = () => {
    switch(status) {
      case "DEBT":
        return {
          title: "SEVERE SLEEP DEBT",
          color: "text-red-500",
          border: "border border-red-900/30",
          bg: "bg-red-950/20",
          icon: AlertTriangle,
        };
      case "COMPROMISED":
        return {
          title: "[ RHYTHM COMPROMISED ]",
          color: "text-white/40",
          border: "border-transparent",
          bg: "bg-transparent",
          icon: null,
        };
      case "LOCKED":
        return {
          title: "ROUTINE LOCKED",
          color: "text-emerald-500",
          border: "border border-emerald-900/30",
          bg: "bg-emerald-950/20",
          icon: ShieldCheck,
        };
      default:
        return {
          title: "AWAITING DATA",
          color: "text-neutral-500",
          border: "border border-neutral-800/50",
          bg: "bg-neutral-900/20",
          icon: Moon,
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const graphData = history.slice(-7).map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: h.durationHours
  }));

  if (history.length === 0) {
    return (
      <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-6 z-10">
        <div className="w-full md:w-auto">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-2">Sleep Engine</h3>
          <div className="text-5xl font-black tracking-tighter text-neutral-500">
            OFF <span className="text-xl text-neutral-700 tracking-normal ml-1">LINE</span>
          </div>
        </div>
        <div className="w-full md:max-w-[220px] flex flex-col md:items-end md:text-right gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed text-neutral-500">
            No sleep logs detected. Engine offline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full z-10 flex flex-col h-full">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-2">Sleep Engine</h3>
          <p className="text-5xl font-black text-white uppercase tracking-tighter">RECOVERY</p>
        </div>
        
        <div className={`flex flex-col md:items-end md:text-right gap-3 w-full md:w-auto`}>
          <div className={`flex items-center gap-2 w-full md:w-auto transition-all ${config.bg !== 'bg-transparent' ? `px-4 py-2 border ${config.border} ${config.bg}` : ''}`}>
            {StatusIcon && <StatusIcon size={14} className={config.color} strokeWidth={2.5} />}
            <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${config.color}`}>
              {config.title}
            </span>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 min-h-[150px] flex flex-col">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-4">7-Day Duration Trend (Hours)</h4>
        <div className="flex-1 w-full mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graphData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: '#000', border: '1px solid #262626', borderRadius: '0' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ display: 'none' }}
              />
              <Bar dataKey="hours" fill="#be123c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
