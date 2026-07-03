"use client";

import React, { useState, useEffect } from 'react';
import DietSetup from './DietSetup';
import DietDashboard from './DietDashboard';
import { useSession } from "next-auth/react";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";

export default function DietModule(props) {
  const { data: session, status } = useSession();
  
  const stateComplete = useState(false);
  const isComplete = stateComplete[0];
  const setIsComplete = stateComplete[1];

  const statePlan = useState(null);
  const plan = statePlan[0];
  const setPlan = statePlan[1];
  
  const stateLoading = useState(true);
  const isLoading = stateLoading[0];
  const setIsLoading = stateLoading[1];

  useEffect(() => {
    async function loadDietProfile() {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        setIsLoading(false);
        return;
      }
      
      if (session?.user?.email) {
        const { data, error } = await supabase
          .from("User")
          .select("dietPlan")
          .eq("email", session.user.email)
          .single();
          
        if (data && data.dietPlan) {
          setPlan(data.dietPlan);
          setIsComplete(true);
        }
      }
      setIsLoading(false);
    }
    
    loadDietProfile();
  }, [session, status]);

  async function handleSetupComplete(generatedPlan) {
    setPlan(generatedPlan);
    setIsComplete(true);
    
    if (session?.user?.email) {
      await supabase
        .from("User")
        .update({ dietPlan: generatedPlan })
        .eq("email", session.user.email);
    }
  }

  if (isLoading || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
        <div className="text-sm font-bold text-white uppercase tracking-[0.2em] animate-pulse">Accessing Database...</div>
      </div>
    );
  }

  if (!isComplete) {
    return <DietSetup onComplete={handleSetupComplete} />;
  }

  return <DietDashboard plan={plan} onRecalculate={() => setIsComplete(false)} />;
}
