"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useOfflineSession } from "@/lib/useOfflineSession";
import { 
  BookOpen, Settings as SettingsIcon, LogOut, ChevronRight, User, 
  Heart, Moon, Cloud, Mail, Download, Upload, CloudDownload, Swords, 
  Activity, Shield, FileText, Play, CheckCircle2,
  Footprints, RotateCcw, Dumbbell, HeartPulse, Trash2
} from "lucide-react";
import Link from "next/link";
import { montserrat } from "@/app/fonts";
import { useState, useEffect } from "react";
import { scheduleDailyReminders, cancelAllNotifications } from "@/lib/notifications";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useOfflineSession();
  
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [stepInput, setStepInput] = useState<string>("");
  const [showDirectiveWarning, setShowDirectiveWarning] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) return;
    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      const { deleteAccountAndData } = await import("@/lib/delete-account");
      const result = await deleteAccountAndData();
      if (!result.ok) {
        setDeleteError(result.message);
        setIsDeletingAccount(false);
        if (result.reason === "requires-recent-login") {
          setTimeout(() => {
            router.push("/auth");
          }, 2000);
        }
        return;
      }
      router.replace("/auth");
    } catch (error: any) {
      if (error?.code === "auth/requires-recent-login") {
        setDeleteError("For security, please sign out, sign back in, and tap Delete Account again.");
        setTimeout(() => {
          router.push("/auth");
        }, 2000);
      } else {
        setDeleteError(error instanceof Error ? error.message : "The account could not be deleted.");
      }
      setIsDeletingAccount(false);
    }
  };


  useEffect(() => {
    try {
      const notifs = localStorage.getItem("ultimatum_notifications_enabled");
      if (notifs === "false") {
        setNotificationsEnabled(false);
      }
      
      const historyRaw = localStorage.getItem("ultimatum_steps_history");
      if (historyRaw) {
        const history = JSON.parse(historyRaw);
        const todayStr = new Date().toDateString();
        const todayEntry = history.find((h: any) => new Date(h.timestamp).toDateString() === todayStr);
        if (todayEntry) setTodaySteps(todayEntry.steps);
      }
    } catch {}
  }, []);

  const handleLogSteps = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(stepInput);
    if (isNaN(val) || val <= 0) return;

    try {
      const historyRaw = localStorage.getItem("ultimatum_steps_history");
      let history = historyRaw ? JSON.parse(historyRaw) : [];
      const todayStr = new Date().toDateString();
      
      const existingIdx = history.findIndex((h: any) => new Date(h.timestamp).toDateString() === todayStr);
      let newTotal = val;
      if (existingIdx >= 0) {
        history[existingIdx].steps += val;
        newTotal = history[existingIdx].steps;
      } else {
        history.push({ timestamp: Date.now(), steps: val });
      }
      localStorage.setItem("ultimatum_steps_history", JSON.stringify(history));
      setTodaySteps(newTotal);
      setStepInput("");
    } catch {}
  };

  const handleClearSteps = () => {
    try {
      const historyRaw = localStorage.getItem("ultimatum_steps_history");
      if (!historyRaw) return;
      let history = JSON.parse(historyRaw);
      const todayStr = new Date().toDateString();
      history = history.filter((h: any) => new Date(h.timestamp).toDateString() !== todayStr);
      localStorage.setItem("ultimatum_steps_history", JSON.stringify(history));
      setTodaySteps(0);
    } catch {}
  };

  const handleToggleNotifications = async () => {
    try {
      const newVal = !notificationsEnabled;
      setNotificationsEnabled(newVal);
      localStorage.setItem("ultimatum_notifications_enabled", String(newVal));
      
      if (newVal) {
        await scheduleDailyReminders();
      } else {
        await cancelAllNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`min-h-screen bg-black text-slate-50 px-6 py-12 md:py-24 relative overflow-hidden ${montserrat.className}`}>
      
      {/* Massive Soft Glowing Background Orb */}
      <div className="absolute top-[-10%] left-[10%] w-[80%] h-[40%] bg-slate-300 opacity-[0.05] blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-xl mx-auto relative z-10 flex flex-col h-full pb-32">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Activity size={16} className="text-slate-300" />
            <span className="text-sm font-semibold tracking-wide">system</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-100">
            System Vitals &<br/>Config
          </h1>
        </motion.div>

        {/* Main Grid: Sleep Engine & Directive */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onClick={() => router.push("/arena")}
            className="col-span-1 bg-[#121212] border border-neutral-800 rounded-[32px] p-5 flex flex-col justify-between aspect-[3/4] cursor-pointer hover:bg-[#1A1A1A] transition-colors relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-slate-100 leading-tight">
                Enter<br/>Arena
              </h3>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shadow-[0_0_15px_rgba(226,232,240,0.2)]">
                <Swords size={16} className="text-[#020617]" />
              </div>
            </div>
            
            <div className="mt-4 flex flex-col gap-2">
              <div className="bg-[#222222] rounded-xl py-2 px-3 flex items-center gap-2">
                <User size={14} className="text-white" />
                <span className="text-white text-xs font-bold">Profile</span>
              </div>
              <div className="bg-black/30 rounded-xl py-2 px-3 flex items-center gap-2 border border-white/5">
                <Activity size={14} className="text-slate-400" />
                <span className="text-slate-400 text-xs font-medium">Stats</span>
              </div>
            </div>
          </motion.div>

          {/* Right Card - Sleep Engine (Dark Slate Blue) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => router.push("/sleep")}
            className="col-span-1 bg-[#121212] border border-neutral-800 rounded-[32px] p-5 flex flex-col justify-between aspect-[3/4] cursor-pointer hover:bg-[#1A1A1A] transition-all relative overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="relative z-10">
              <h3 className="text-lg font-medium text-slate-100 leading-tight">
                Sleep<br/>Engine
              </h3>
              <p className="text-slate-400 text-[11px] font-medium mt-1">Circadian Protocol</p>
            </div>
            
            {/* Night Sky Design */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
              {/* Moon */}
              <div className="absolute top-6 right-6 text-slate-100/10 group-hover:text-indigo-200/30 transition-colors duration-700 group-hover:scale-110">
                <Moon size={48} fill="currentColor" strokeWidth={0.5} />
              </div>
              
              {/* Clouds */}
              <div className="absolute -bottom-4 -right-4 text-slate-600/20 group-hover:text-indigo-400/20 transition-all duration-700 group-hover:-translate-x-2">
                <Cloud size={80} fill="currentColor" strokeWidth={0} />
              </div>
              <div className="absolute bottom-4 -left-8 text-slate-500/20 group-hover:text-slate-400/20 transition-all duration-700 delay-75 group-hover:translate-x-2">
                <Cloud size={100} fill="currentColor" strokeWidth={0} />
              </div>
              <div className="absolute -bottom-10 left-4 text-slate-700/30 group-hover:text-indigo-500/20 transition-all duration-700 delay-150 group-hover:-translate-y-2">
                <Cloud size={140} fill="currentColor" strokeWidth={0} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Daily Steps - Smooth Horizontal Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-4"
        >
          <div className="w-full bg-[#121212] border border-neutral-800 rounded-[24px] p-2 flex items-center justify-between shadow-lg shadow-black/40">
            <div className="flex flex-col pl-4">
              <span className="text-slate-200 font-medium text-base">Daily Steps</span>
              <span className="text-slate-500 text-[12px] font-medium flex gap-1 mt-0.5">
                <span className="text-slate-300 font-semibold">{todaySteps.toLocaleString()}</span>
                <span>/ 10,000</span>
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {todaySteps > 0 && (
                <button
                  type="button"
                  onClick={handleClearSteps}
                  className="w-10 h-10 rounded-[16px] bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 mr-1"
                >
                  <RotateCcw size={16} className="text-white/50" />
                </button>
              )}
              <form onSubmit={handleLogSteps} className="flex items-center">
                <input
                  type="number"
                  placeholder="0"
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  className="w-16 bg-transparent text-slate-200 text-right pr-2 focus:outline-none font-medium placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  className="w-12 h-12 rounded-[20px] bg-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0 shadow-[0_0_15px_rgba(226,232,240,0.1)]"
                >
                  <PlusIcon size={20} className="text-[#020617]" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Notifications Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="w-full bg-[#121212] border border-neutral-800 rounded-[24px] p-4 flex items-center justify-between shadow-lg shadow-black/40">
            <div className="flex flex-col">
              <span className="text-slate-200 font-medium text-base flex items-center gap-2">
                Daily Reminders
              </span>
              <span className="text-slate-500 text-[11px] font-medium mt-0.5 max-w-[200px]">
                Minimal prompts for food & workout logging.
              </span>
            </div>
            
            <button
              onClick={handleToggleNotifications}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${notificationsEnabled ? 'bg-white' : 'bg-neutral-800'}`}
            >
              <div 
                className={`w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6 bg-black' : 'translate-x-0 bg-neutral-500'}`}
              />
            </button>
          </div>
        </motion.div>

        {/* Change Directive */}
        <div className="mb-8">
          <ActionRow 
            delay={0.3} 
            title="CHANGE DIRECTIVE" 
            subtitle="Update your protocol" 
            icon={SettingsIcon} 
            onClick={() => setShowDirectiveWarning(true)} 
          />
        </div>

        {/* Action Rows */}
        <div className="space-y-3 mb-8">
          <ActionRow delay={0.35} title="View Doctrine" subtitle="Core principles" icon={BookOpen} onClick={() => router.push("/doctrine")} />
          <ActionRow delay={0.38} title="Workout Splits" subtitle="View, use or export every protocol" icon={Dumbbell} onClick={() => router.push("/splits")} />
          <ActionRow delay={0.4} title="Harsh Truths" subtitle="Reality check" icon={BookOpen} onClick={() => router.push("/truths")} />
          <ActionRow delay={0.42} title="Movement Database" subtitle="Exercise library & custom movements" icon={Activity} onClick={() => router.push("/settings/exercises")} />
          <ActionRow delay={0.44} title="Connected Health" subtitle="Health Connect, bands & watches" icon={HeartPulse} onClick={() => router.push("/settings/health")} />
          <ActionRow delay={0.45} title="System Config" subtitle="Backup & Policies" icon={SettingsIcon} onClick={() => router.push("/settings/advanced")} />
          <ActionRow
            delay={0.48}
            title="DELETE ACCOUNT"
            subtitle="Permanently erase account and data"
            icon={Trash2}
            onClick={() => {
              setDeleteError(null);
              setShowDeleteAccount(true);
            }}
            isDestructive
          />
        </div>

        {/* Privacy & Terms Link */}
        <div className="mt-4 text-center">
          <Link
            href="/privacy"
            className="text-[11px] font-medium tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Privacy &amp; Terms
          </Link>
        </div>

      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-black"
            >
              <div className="w-11 h-11 rounded-xl bg-red-950/40 flex items-center justify-center mb-4 border border-red-900/40">
                <Trash2 size={18} className="text-red-400" />
              </div>

              <h2 className="text-base font-bold uppercase tracking-wider text-white mb-2">
                PERMANENTLY DELETE ACCOUNT?
              </h2>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                This will permanently erase your identity, workout logs, nutrition history, and profile data. This action cannot be undone.
              </p>

              {deleteError && (
                <p className="text-[11px] text-red-400 mb-4 leading-relaxed font-medium">{deleteError}</p>
              )}

              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  disabled={isDeletingAccount}
                  className="flex-1 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-neutral-200 font-bold tracking-wider text-[11px] transition-colors disabled:opacity-50 border border-white/10"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="flex-1 py-3 rounded-xl bg-red-950/60 hover:bg-red-900/70 text-red-300 hover:text-red-200 font-bold tracking-wider text-[11px] transition-colors border border-red-900/50 disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  {isDeletingAccount ? "DELETING…" : "CONFIRM DELETE"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directive Change Warning Modal */}
      <AnimatePresence>
        {showDirectiveWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-black"
            >
              <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <SettingsIcon size={20} className="text-white/70" />
              </div>
              
              <h2 className="text-base font-bold uppercase tracking-wider text-white mb-2">Change Directive?</h2>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                Warning: Overriding your current protocol will fundamentally change your goals, workout splits, and nutrition targets. <span className="text-white font-medium">This cannot be undone.</span>
              </p>
              
              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowDirectiveWarning(false)}
                  className="flex-1 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-neutral-200 font-bold tracking-wider text-[11px] transition-colors border border-white/10"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => router.push("/directive?fastTrack=true")}
                  className="flex-1 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 font-bold tracking-wider text-[11px] transition-colors border border-red-900/40"
                >
                  OVERRIDE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function ActionRow({ delay, title, subtitle, icon: Icon, onClick, isDestructive = false }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div 
        onClick={onClick}
        className="w-full bg-[#121212] hover:bg-[#1A1A1A] cursor-pointer rounded-3xl p-3 pl-5 flex items-center justify-between transition-colors border border-neutral-800 shadow-sm"
      >
        <div className="flex flex-col">
        <span className={`font-medium text-[15px] ${isDestructive ? 'text-white/70' : 'text-slate-200'}`}>{title}</span>
          <span className="text-slate-500 text-[11px] font-medium mt-0.5">{subtitle}</span>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDestructive ? 'text-white/50' : 'text-neutral-400'}`}>
          <Icon size={16} />
        </div>
      </div>
    </motion.div>
  );
}

function PlusIcon({ className, size = 24 }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
}
