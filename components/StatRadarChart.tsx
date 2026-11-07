"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getArenaLevel, getNumericLevel, getLevelProgress } from "@/lib/arena-levels";

import { calcStatsFromStorageObj } from "@/lib/stats";

interface StatData {
  str: number;
  hyp: number;
  vol: number;
  con: number;
  dis: number;
  eng: number;
  avgScore: number;
}

const calculateStats = (): StatData => {
  try {
    // Read local storage into an object to feed into the global stats calc
    const storageObj: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        storageObj[key] = localStorage.getItem(key) || "";
      }
    }
    
    const stats = calcStatsFromStorageObj(storageObj);
    
    // Scale all points to 100 for the radar chart bounds
    return {
      str: Math.round((stats.forcePoints / 15) * 100),
      vol: Math.round((stats.tonnagePoints / 15) * 100),
      hyp: Math.round((stats.hypertrophyPoints / 15) * 100),
      con: Math.round((stats.consistencyPoints / 15) * 100),
      dis: Math.round((stats.fuelPoints / 25) * 100),
      eng: Math.round((stats.enginePoints / 15) * 100),
      avgScore: stats.avgScore,
    };
  } catch {
    return { str: 20, hyp: 20, vol: 20, con: 20, dis: 20, eng: 20, avgScore: 20 };
  }
};

export default function StatRadarChart({
  color = "#ffffff",
  variant = "card",
}: {
  color?: string;
  variant?: "card" | "polygon";
}) {
  const [stats, setStats] = useState<StatData | null>(null);

  useEffect(() => {
    setStats(calculateStats());
  }, []);

  if (!stats)
    return (
      <div className="h-64 flex items-center justify-center text-neutral-600 font-black uppercase tracking-widest text-xs">
        Calibrating...
      </div>
    );

  const labels = ["STR", "VOL", "HYP", "CON", "DIS", "ENG"];
  const values = [stats.str, stats.vol, stats.hyp, stats.con, stats.dis, stats.eng];
  const avgScore = stats.avgScore;

  const arenaLevel = getArenaLevel(avgScore);
  const numericLevel = getNumericLevel(avgScore);
  const { pct, pointsToNext, nextRank } = getLevelProgress(avgScore);

  const size = 260;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getPoints = (radiusScale: number, dataArray: number[]) =>
    dataArray
      .map((val, i) => {
        const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
        const r = maxRadius * radiusScale * (val / 100);
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");

  const activePoints = getPoints(1, values);

  if (variant === "polygon") {
    return (
      <svg width={size} height={size} className="overflow-visible mt-4">
        <defs>
          <filter id="glow-p">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {gridLevels.map((level, i) => (
          <polygon
            key={i}
            points={getPoints(level, Array(labels.length).fill(100))}
            fill="none"
            stroke="neutral-900"
            strokeWidth="1.5"
          />
        ))}

        {labels.map((_, i) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const x = center + maxRadius * Math.cos(angle);
          const y = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="neutral-900"
              strokeWidth="1.5"
            />
          );
        })}

        <motion.polygon
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          points={activePoints}
          fill={color}
          fillOpacity="0.15"
          stroke={color}
          strokeWidth="3"
          filter="url(#glow-p)"
          style={{ transformOrigin: "center" }}
        />

        {values.map((val, i) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const r = maxRadius * (val / 100);
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return (
            <motion.circle
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              cx={x}
              cy={y}
              r="4"
              fill="#fff"
              stroke={color}
              strokeWidth="2"
              filter="url(#glow-p)"
            />
          );
        })}

        {labels.map((label, i) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const labelRadius = maxRadius + 20;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          return (
            <text
              key={i}
              x={x}
              y={y}
              fill="#888"
              fontSize="10"
              fontWeight="900"
              textAnchor="middle"
              alignmentBaseline="middle"
              className="tracking-widest"
              style={{ textShadow: "0 0 10px rgba(0,0,0,1)" }}
            >
              {label}
            </text>
          );
        })}
      </svg>
    );
  }

  // Card variant — full stat display with level
  return (
    <div className="relative flex flex-col items-center justify-center bg-black rounded-3xl p-4 border border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
      <div className="absolute top-4 left-6 flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
          Arena
        </span>
      </div>

      <svg width={size} height={size} className="overflow-visible mt-4">
        <defs>
          <filter id="glow-c">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {gridLevels.map((level, i) => (
          <polygon
            key={i}
            points={getPoints(level, Array(labels.length).fill(100))}
            fill="none"
            stroke="neutral-900"
            strokeWidth="1.5"
          />
        ))}

        {labels.map((_, i) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const x = center + maxRadius * Math.cos(angle);
          const y = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="neutral-900"
              strokeWidth="1.5"
            />
          );
        })}

        <motion.polygon
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          points={activePoints}
          fill={color}
          fillOpacity="0.15"
          stroke={color}
          strokeWidth="3"
          filter="url(#glow-c)"
          style={{ transformOrigin: "center" }}
        />

        {values.map((val, i) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const r = maxRadius * (val / 100);
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return (
            <motion.circle
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              cx={x}
              cy={y}
              r="4"
              fill="#fff"
              stroke={color}
              strokeWidth="2"
              filter="url(#glow-c)"
            />
          );
        })}

        {labels.map((label, i) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const labelRadius = maxRadius + 20;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          return (
            <text
              key={i}
              x={x}
              y={y}
              fill="#888"
              fontSize="10"
              fontWeight="900"
              textAnchor="middle"
              alignmentBaseline="middle"
              className="tracking-widest"
              style={{ textShadow: "0 0 10px rgba(0,0,0,1)" }}
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Level + Score footer */}
      <div className="w-full mt-3 space-y-3 px-2">
        {/* XP bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: arenaLevel.color }}
            >
              {arenaLevel.rank}
            </span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Lv. {numericLevel}
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              className="h-full rounded-full"
              style={{
                background: arenaLevel.color,
                boxShadow: `0 0 8px ${arenaLevel.glowColor}`,
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[9px] text-neutral-700 font-bold">
              Score {avgScore}
            </span>
            {nextRank && (
              <span className="text-[9px] text-neutral-600 font-bold">
                +{pointsToNext} pts → {nextRank.rank}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
