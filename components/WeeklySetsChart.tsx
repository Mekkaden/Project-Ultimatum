"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export interface WeeklySetData {
  date: string;
  sets: number;
  /** True for the week that contains today; it is still accumulating. */
  isCurrent?: boolean;
  /** Days elapsed in the current week (1-7), used to project the full week. */
  daysElapsed?: number;
  /** Best estimated 1RM in the week beat every earlier week. */
  isPR?: boolean;
}

interface WeeklySetsChartProps {
  data: WeeklySetData[];
  /** Average sets per completed week in the window, used as the baseline. */
  baselineSets: number;
  /** Weekly working-set target for the selected scope. */
  targetSets?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2D2D3A] px-3 py-2 rounded-lg shadow-xl border border-white/10 text-xs font-medium">
        <p className="text-white/60 mb-1">{label}</p>
        <p className="text-indigo-400 font-bold text-sm">
          {payload[0].value} sets
        </p>
        {payload[0].payload?.isCurrent && (
          <p className="text-white/40 text-[10px] mt-0.5">week in progress</p>
        )}
        {payload[0].payload?.isPR && (
          <p className="text-amber-400 text-[10px] mt-0.5 font-bold">new PR week</p>
        )}
      </div>
    );
  }
  return null;
};

export default function WeeklySetsChart({
  data,
  baselineSets,
  targetSets,
}: WeeklySetsChartProps) {
  const [showGuide, setShowGuide] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="py-16 border border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-center px-6">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500 mb-3">No Volume Data</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 max-w-xs leading-relaxed">
          Log a few sets and your weekly trend will build here automatically.
        </p>
      </div>
    );
  }

  // The last bucket is the week in progress. Comparing its partial total to a
  // full-week baseline makes every Monday look like a collapse, so project it
  // to a full week before comparing.
  const current = data[data.length - 1];
  const completed = data.slice(0, -1).filter((d) => d.sets > 0);
  const isPartial = !!current?.isCurrent && (current?.daysElapsed ?? 7) < 7;
  const projectedCurrent = isPartial
    ? Math.round((current.sets / Math.max(1, current.daysElapsed ?? 7)) * 7)
    : current?.sets ?? 0;

  const completedWeeks = data.slice(0, -1);
  const peakWeek = completedWeeks.reduce((max, d) => Math.max(max, d.sets), 0);
  const totalSets = data.reduce((sum, d) => sum + d.sets, 0);

  const hasBaseline = completed.length > 0;
  const isUp = projectedCurrent > baselineSets;
  const maxSets = Math.max(...data.map((d) => d.sets), baselineSets, targetSets ?? 0);

  return (
    <div className="w-full flex flex-col">
      {/* Brutalist Stats Header */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-[#121212] border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-2xl rounded-full pointer-events-none" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">
            {current?.isCurrent ? "This Week" : "Latest Week"}
          </p>
          <div className="flex items-end gap-1 text-white">
            <span className="text-3xl font-black leading-none">{current?.sets ?? 0}</span>
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">
              {isPartial ? `/ ${current.daysElapsed} days` : "sets"}
            </span>
          </div>
          {isPartial && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 mt-1">
              ≈ {projectedCurrent} projected
            </p>
          )}
        </div>

        <div className="bg-[#121212] border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Baseline</p>
          <div className="flex items-end gap-1 text-neutral-300">
            <span className="text-2xl font-black leading-none">{hasBaseline ? baselineSets : "—"}</span>
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mb-0.5">sets / wk</span>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 mt-1">
            {hasBaseline ? `vs ${isUp ? "+" : ""}${projectedCurrent - baselineSets}` : "not enough history"}
          </p>
        </div>

        <div className="bg-[#121212] border border-neutral-800 rounded-xl p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Peak Week</p>
          <div className="flex items-end gap-1 text-[#3B82F6]">
            <span className="text-2xl font-black leading-none">{peakWeek}</span>
            <span className="text-[10px] text-[#3B82F6]/50 font-bold uppercase tracking-widest mb-0.5">max</span>
          </div>
        </div>

        <div className="bg-[#121212] border border-neutral-800 rounded-xl p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Weekly Target</p>
          <div className="flex items-end gap-1 text-neutral-300">
            <span className="text-2xl font-black leading-none">{targetSets ? `${targetSets}+` : "—"}</span>
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mb-0.5">sets</span>
          </div>
        </div>
      </div>

      <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-4 mt-2">
        <p className="text-xs text-white/50 mb-4 font-medium">
          Working sets per week · {totalSets} logged in window
        </p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#ffffff40', fontSize: 10 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#ffffff40', fontSize: 10 }}
                domain={[0, Math.ceil(maxSets / 5) * 5 + 5]}
              />
              <Tooltip content={<CustomTooltip />} />
              {hasBaseline && (
                <ReferenceLine y={baselineSets} stroke="#ffffff30" strokeDasharray="3 3" />
              )}
              {!!targetSets && (
                <ReferenceLine y={targetSets} stroke="#3B82F6" strokeDasharray="4 4" strokeOpacity={0.6} />
              )}
              <Area
                type="monotone"
                dataKey="sets"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSets)"
                activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  if (!payload?.isPR) return <g key={`dot-${index}`} />;
                  return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill="#F59E0B" stroke="#000" strokeWidth={1.5} />;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Guide Button & Section */}
      <div className="mt-8 border-t border-neutral-800 pt-6">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full py-3 flex items-center justify-between text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
        >
          <span>Intel / Metrics Guide</span>
          <span>{showGuide ? "—" : "+"}</span>
        </button>

        {showGuide && (
          <div className="mt-4 flex flex-col gap-3 font-sans">
            <div className="bg-[#121212] border border-neutral-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-white block mb-1">This Week</span>
              <p className="text-xs text-neutral-400 font-normal leading-relaxed">
                Working sets logged since Monday. A week still in progress is projected to a full
                7 days before it is compared to the baseline, so a quiet Monday does not read as a collapse.
              </p>
            </div>

            <div className="bg-[#121212] border border-neutral-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-white block mb-1">Baseline</span>
              <p className="text-xs text-neutral-400 font-normal leading-relaxed">
                Average working sets per completed week in the last 10 weeks. Weeks with no training
                are included as zero, so the baseline reflects real consistency.
              </p>
            </div>

            <div className="bg-[#121212] border border-neutral-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-white block mb-1">Peak Week</span>
              <p className="text-xs text-neutral-400 font-normal leading-relaxed">
                Your highest-volume completed week in the window — the ceiling of your recent work
                capacity.
              </p>
            </div>

            <div className="bg-[#121212] border border-neutral-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-white block mb-1">Weekly Target</span>
              <p className="text-xs text-neutral-400 font-normal leading-relaxed">
                Sum of the minimum effective weekly sets for every muscle you train, from the
                hypertrophy volume guidelines. Dashed line on the chart.
              </p>
            </div>

            <div className="bg-[#121212] border border-neutral-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-white block mb-1">Amber Dot</span>
              <p className="text-xs text-neutral-400 font-normal leading-relaxed">
                A week whose best estimated 1RM beat every earlier week in the window.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
