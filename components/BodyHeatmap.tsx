import React, { useMemo, useState } from "react";
import { Muscle, MUSCLE_WEEKLY_TARGETS, volumeZone, VolumeZone } from "@/lib/muscleMapping";
import Model from "react-body-highlighter";

interface BodyHeatmapProps {
  volumeData: Record<Muscle, number>;
}

// Each app muscle maps to exactly one region on the model, so two heads of the
// same muscle (front/side delts) are not painted on top of each other.
const APP_TO_MODEL: Record<Muscle, string> = {
  chest: "chest",
  "front-delts": "front-deltoids",
  "side-delts": "obliques",
  "rear-delts": "back-deltoids",
  lats: "upper-back",
  traps: "trapezius",
  "lower-back": "lower-back",
  abs: "abs",
  biceps: "biceps",
  triceps: "triceps",
  forearms: "forearm",
  quads: "quadriceps",
  hamstrings: "hamstring",
  glutes: "gluteal",
  calves: "calves",
};

const ZONE_COLOR: Record<VolumeZone, string> = {
  untrained: "#1C1F26",
  under: "#3B82F6",
  optimal: "#10B981",
  over: "#FF003C",
};

const MODEL_TO_APP: Record<string, Muscle> = Object.fromEntries(
  (Object.entries(APP_TO_MODEL) as [Muscle, string][]).map(([app, model]) => [model, app]),
);

const MUSCLES = Object.keys(APP_TO_MODEL) as Muscle[];

const formatMuscle = (muscle: string) => muscle.replace(/-/g, " ");

export default function BodyHeatmap({ volumeData }: BodyHeatmapProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [pinned, setPinned] = useState<string | null>(null);

  // The highlight colour is chosen per muscle from its own weekly target, not
  // from a global set count, so "green" always means "inside the effective
  // range" for that muscle.
  const colors = useMemo(() => {
    const palette: string[] = [];
    for (const muscle of MUSCLES) {
      const zone = volumeZone(volumeData[muscle] ?? 0, muscle);
      // Six identical entries per muscle keep the count in range while making
      // the zone readable in the legend.
      for (let i = 0; i < 6; i++) palette.push(ZONE_COLOR[zone]);
    }
    return palette;
  }, [volumeData]);

  const data = useMemo(() => {
    return MUSCLES.map((muscle, index) => {
      const sets = volumeData[muscle] ?? 0;
      return {
        name: muscle,
        muscles: [APP_TO_MODEL[muscle]] as any[],
        // react-body-highlighter indexes its palette by muscle order; pass the
        // muscle's own palette block so the colour matches its zone.
        frequency: index * 6 + 1,
        sets,
        _sets: sets,
      };
    });
  }, [volumeData]);

  const summary = useMemo(() => {
    return MUSCLES.map((muscle) => {
      const sets = volumeData[muscle] ?? 0;
      return { muscle, sets, zone: volumeZone(sets, muscle), ...MUSCLE_WEEKLY_TARGETS[muscle] };
    }).sort((a, b) => b.sets - a.sets);
  }, [volumeData]);

  const hasData = summary.some((m) => m.sets > 0);

  return (
    <div className="flex flex-col items-center bg-[#121212] border border-neutral-800/60 rounded-[32px] p-8 relative overflow-hidden shadow-2xl">

      <div className="flex space-x-2 bg-black/50 p-1.5 rounded-full mb-6 z-10 border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <button
          onClick={() => setView("front")}
          className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            view === "front" ? "bg-white text-black shadow-sm" : "text-white/50 hover:text-white"
          }`}
        >
          Front
        </button>
        <button
          onClick={() => setView("back")}
          className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            view === "back" ? "bg-white text-black shadow-sm" : "text-white/50 hover:text-white"
          }`}
        >
          Back
        </button>
      </div>

      {/* Zone legend, matching the colours actually used on the body */}
      <div className="w-full flex items-center justify-center gap-5 sm:gap-6 mb-6 z-10">
        {(["under", "optimal", "over"] as VolumeZone[]).map((zone) => {
          const config = {
            under: {
              label: "Below MEV",
              gradient: "radial-gradient(circle at 35% 35%, #93c5fd, #3b82f6 60%, #1d4ed8 100%)",
              shadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 6px rgba(59,130,246,0.35)",
            },
            optimal: {
              label: "Effective",
              gradient: "radial-gradient(circle at 35% 35%, #6ee7b7, #10b981 60%, #047857 100%)",
              shadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 6px rgba(16,185,129,0.35)",
            },
            over: {
              label: "Above MRV",
              gradient: "radial-gradient(circle at 35% 35%, #fda4af, #f43f5e 60%, #be123c 100%)",
              shadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 6px rgba(244,63,94,0.35)",
            },
          }[zone];

          return (
            <div key={zone} className="flex items-center gap-2 whitespace-nowrap">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  background: config.gradient,
                  boxShadow: config.shadow,
                }}
              />
              <span className="text-xs font-medium text-neutral-300 tracking-normal">
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative w-[300px] h-[450px] flex items-center justify-center">
        <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full pointer-events-none" />

        {pinned && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest pointer-events-none z-20 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            {pinned}
          </div>
        )}

        <style>{`
          .rbh polygon, .rbh path {
            transition: all 0.3s ease-in-out;
            stroke: #121212;
            stroke-width: 1px;
            stroke-linejoin: round;
            stroke-linecap: round;
          }
          .rbh polygon:hover, .rbh path:hover {
            opacity: 0.9;
            cursor: pointer;
            stroke: rgba(255,255,255,0.4);
            stroke-width: 1.5px;
          }
        `}</style>

        <Model
          data={data as any}
          style={{ width: "100%", height: "100%", filter: "drop-shadow(0 15px 35px rgba(0,0,0,0.9))" }}
          svgStyle={{ overflow: "visible" }}
          type={view === "front" ? "anterior" : "posterior"}
          highlightedColors={colors}
          bodyColor="#282D38"
          onClick={(stats: any) => {
            const muscle = MODEL_TO_APP[stats.muscle];
            if (!muscle) return;
            const sets = volumeData[muscle] ?? 0;
            const target = MUSCLE_WEEKLY_TARGETS[muscle];
            setPinned(`${formatMuscle(muscle)}: ${sets} sets (target ${target.mev}-${target.mrv})`);
            setTimeout(() => setPinned(null), 3000);
          }}
        />
      </div>

      {/* Per-muscle readout: sets vs the muscle's own target */}
      <div className="w-full mt-10 z-10">
        {hasData ? (
          <div className="flex flex-col gap-1.5">
            {summary.map(({ muscle, sets, zone, mev, mrv }) => (
              <div key={muscle} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ZONE_COLOR[zone] }} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex-1 truncate">
                  {formatMuscle(muscle)}
                </span>
                <span className="text-[10px] font-black tabular-nums text-white/80">{sets}</span>
                <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (sets / Math.max(mrv, 1)) * 100)}%`,
                      backgroundColor: ZONE_COLOR[zone],
                    }}
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/25 w-14 text-right tabular-nums">
                  {mev}-{mrv}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[11px] font-medium text-neutral-500 py-3 tracking-wide">
            No sets logged in the last 7 days
          </p>
        )}
      </div>
    </div>
  );
}
