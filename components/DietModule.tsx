"use client";

import React, { useState, useEffect, useRef } from 'react';
import DietSetup from './DietSetup';
import DietDashboard from './DietDashboard';
import WeightTracker from './WeightTracker';
import Link from 'next/link';
import { Droplet, Pill } from 'lucide-react';
import { useOfflineSession } from "../lib/useOfflineSession";
import { Loader2, WifiOff } from "lucide-react";

const DIET_PLAN_CACHE_KEY = "ultimatum_diet_plan";

export default function DietModule() {
  const { data: session, status, isOffline } = useOfflineSession();
  
  const [isComplete, setIsComplete] = useState(false);
  const [plan, setPlan] = useState<Record<string, any> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const hasLoaded = useRef(false);

  useEffect(() => {
    // Don't run until session status is resolved
    if (status === "loading") return;
    // Prevent running more than once (avoid isOffline re-triggering)
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    async function loadDietProfile() {
      // --- OFFLINE PATH: serve from localStorage cache ---
      if (isOffline || status === "unauthenticated") {
        const cached = localStorage.getItem(DIET_PLAN_CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setPlan(parsed);
            setIsComplete(true);
          } catch {}
        }
        setIsLoading(false);
        return;
      }
      
      // --- ONLINE + AUTHENTICATED PATH ---
      if (session?.user?.email) {
        // First, try to serve from local cache immediately (fast load)
        const cached = localStorage.getItem(DIET_PLAN_CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setPlan(parsed);
            setIsComplete(true);
            setIsLoading(false);
          } catch {}
        }

        // Then load from cloud to get the latest and populate localStorage
        // This is the correct hydration path — loadUserSettingsFromCloud writes
        // ultimatum_diet_plan to localStorage, which we then read and parse.
        try {
          const { loadUserSettingsFromCloud } = await import("@/lib/syncService");
          const keysRestored = await loadUserSettingsFromCloud();
          if (keysRestored > 0) {
            const freshCache = localStorage.getItem(DIET_PLAN_CACHE_KEY);
            if (freshCache) {
              try {
                const parsedPlan = JSON.parse(freshCache);
                setPlan(parsedPlan);
                setIsComplete(true);
                console.log("[DietModule] Plan hydrated from Firestore via syncService.");
              } catch (e) {
                console.error("[DietModule] Failed to parse diet plan from localStorage after cloud load:", e);
              }
            } else {
              console.warn("[DietModule] Cloud load succeeded but ultimatum_diet_plan not found in restored keys.");
            }
          }
        } catch (err) {
          console.error("[DietModule] Firestore load failed — using local cache only:", err);
        }
      }
      setIsLoading(false);
    }
    
    loadDietProfile();
  }, [status]); // Only re-run when auth status is resolved — NOT on isOffline changes

  async function handleSetupComplete(generatedPlan: Record<string, any>) {
    setPlan(generatedPlan);
    setIsComplete(true);
    // Cache locally immediately so it's available without network
    localStorage.setItem(DIET_PLAN_CACHE_KEY, JSON.stringify(generatedPlan));
    
    if (session?.user?.id) {
      try {
        // Use syncService directly — /api/sync route is dead in static APK builds
        const { saveUserSettingsToCloud } = await import("@/lib/syncService");
        await saveUserSettingsToCloud(session.user?.id);
        console.log("[DietModule] Diet plan saved to Firestore via syncService.");
      } catch (saveErr) {
        console.error("[DietModule] DIET PLAN CLOUD SAVE FAILED — data is local only:", saveErr);
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <div className="text-sm font-bold text-white uppercase tracking-[0.2em] animate-pulse">
          {isOffline ? "Loading Local Data..." : "Accessing Database..."}
        </div>
      </div>
    );
  }

  if (!isComplete) {
    return <DietSetup onComplete={handleSetupComplete} />;
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <DietDashboard plan={plan as any} isOffline={isOffline} onUpdatePlan={handleSetupComplete} />
      <WeightTracker isOfflineProp={isOffline} />
      
      {/* Hydration & Supplements Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg mx-auto">
        <Link 
          href="/water"
          className="col-span-1 group relative overflow-hidden bg-black border border-blue-900/30 rounded-[32px] p-6 flex flex-col items-center justify-center transition-all hover:border-blue-700/50 hover:bg-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-40"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[100px] bg-blue-500 opacity-[0.05] blur-[40px] rounded-full pointer-events-none group-hover:opacity-[0.1] transition-opacity" />
          <div className="w-12 h-12 rounded-full bg-blue-950/50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-900/50 transition-all border border-blue-900/30">
            <Droplet size={20} className="text-blue-500 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.1em] text-white">Hydration</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mt-1">Water Protocol</span>
        </Link>

        <Link 
          href="/supplements"
          className="col-span-1 group relative overflow-hidden bg-black border border-white/10 rounded-[32px] p-6 flex flex-col items-center justify-center transition-all hover:border-white/30 hover:bg-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-40"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[100px] bg-white/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-white/20 transition-colors" />
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-white/10 transition-all border border-white/10">
            <Pill size={20} className="text-neutral-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.1em] text-white">Supplements</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mt-1">Daily Stack</span>
        </Link>
      </div>
      
      {/* Nutrition Premium Image Card */}
      <div className="relative w-full h-[300px] md:h-[400px] rounded-[32px] overflow-hidden shadow-2xl border border-white/5 group mt-4">
        <img 
          src="/new%20images/nutrition2.jpg" 
          alt="Nutrition" 
          className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute bottom-8 left-6 md:bottom-10 md:left-10">
          <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-[0.2em] mb-2">
            NUTRITION
          </h3>
          <p className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-[0.1em] max-w-[90%] md:max-w-[70%] leading-relaxed">
            OPTIMIZE YOUR INTERNAL SYSTEM. <br className="md:hidden" /> NO COMPROMISES.
          </p>
        </div>
      </div>
    </div>
  );
}
