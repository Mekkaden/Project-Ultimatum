"use client";

import React from "react";
import { ChevronDown, Activity, Trophy, AlertTriangle, TrendingUp, TrendingDown, Target, Repeat, GripHorizontal, Crosshair, ArrowUp, ArrowDown } from "lucide-react";

export type InsightAction = 
  | "Hold progression"
  | "Work on form"
  | "Repeat this weight"
  | "Stay consistent"
  | "Swap exercise variation"
  | "Tighten execution"
  | "Add weight"
  | "Add reps"
  | "Add RIR"
  | "Drop weight";

export interface ExerciseInsight {
  exerciseName: string;
  /** Change vs the previous session, e.g. "+2.5KG", "-1 reps". Empty when N/A. */
  progression: string;
  isPositive: boolean;
  isNegative: boolean;
  isPR?: boolean;
  /** Effort of the session's top set, only when RIR was logged. */
  rpe?: number;
  action: InsightAction;
  /** Which comparison produced this row. */
  comparison?: "vs-previous-session" | "first-session";
  previousDay?: string;
}

interface ExerciseInsightsListProps {
  insights: ExerciseInsight[];
}

const getActionIcon = (action: InsightAction) => {
  const iconClass = "w-3.5 h-3.5 text-neutral-400 shrink-0";
  switch (action) {
    case "Hold progression": return <GripHorizontal className={iconClass} />;
    case "Work on form": return <AlertTriangle className={iconClass} />;
    case "Repeat this weight": return <Repeat className={iconClass} />;
    case "Stay consistent": return <TrendingUp className={iconClass} />;
    case "Swap exercise variation": return <Repeat className={iconClass} />;
    case "Tighten execution": return <Crosshair className={iconClass} />;
    case "Add weight": return <ArrowUp className={iconClass} />;
    case "Add reps": return <ArrowUp className={iconClass} />;
    case "Add RIR": return <Target className={iconClass} />;
    case "Drop weight": return <ArrowDown className={iconClass} />;
    default: return <Target className={iconClass} />;
  }
};

export default function ExerciseInsightsList({ insights }: ExerciseInsightsListProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-6 border-b border-neutral-800 gap-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Exercise Insights</h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 text-right">
          {insights.length} exercises · vs last session
        </span>
      </div>

      <div className="flex flex-col">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex flex-col py-6 border-b border-neutral-800 gap-3">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <span className="font-black text-lg text-white uppercase tracking-wider">{insight.exerciseName}</span>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Progression Stat */}
                {insight.progression && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 border rounded-md ${
                    insight.isPositive 
                      ? "text-emerald-400 border-emerald-900/50 bg-emerald-950/25" 
                      : insight.isNegative 
                      ? "text-[#E28090] border-[#4D1C26] bg-[#221014]" 
                      : "text-neutral-400 border-neutral-800 bg-neutral-900/60"
                  }`}>
                    {insight.isPositive ? <ArrowUp className="w-2.5 h-2.5 shrink-0 stroke-[2.5]" /> : null}
                    {insight.isNegative ? <ArrowDown className="w-2.5 h-2.5 shrink-0 stroke-[2.5]" /> : null}
                    {insight.progression}
                  </span>
                )}
                
                {/* Effort of the session's top set. Training to failure is a
                    choice, not an error, so this is never shown in warning red. */}
                {insight.rpe !== undefined && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-wider font-bold border rounded-md bg-neutral-900/60 border-neutral-800 text-neutral-300">
                    <Activity className="w-3 h-3 text-neutral-400 shrink-0" strokeWidth={2.5} />
                    RPE {insight.rpe}
                    {insight.rpe >= 10 && <span className="text-neutral-500">· failure</span>}
                  </div>
                )}
                
                {/* PR / Warning Badge */}
                {insight.isPR && (
                  <div className="inline-flex items-center gap-1.5 text-[#FFD700] bg-amber-950/20 border border-amber-900/40 rounded-md px-2 py-1 text-[10px] uppercase tracking-wider font-bold">
                    <Trophy className="w-3 h-3 shrink-0" />
                    PR
                  </div>
                )}
                {insight.action === "Swap exercise variation" && !insight.isPR && (
                  <div className="inline-flex items-center gap-1.5 bg-neutral-900/60 border border-amber-900/40 text-amber-500 px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    STALE
                  </div>
                )}
              </div>
            </div>

            {/* Action / Tag */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-400 text-[10px] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-2">
                {getActionIcon(insight.action)}
                <span>{insight.action}</span>
              </span>
              {insight.comparison === "first-session" && (
                <span className="text-neutral-600 normal-case tracking-normal">
                  first session logged — train it again to see a trend
                </span>
              )}
              {insight.comparison === "vs-previous-session" && insight.previousDay && (
                <span className="text-neutral-600 normal-case tracking-normal">
                  compared with {insight.previousDay}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
