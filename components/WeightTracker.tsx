"use client";

import React, { useState, useEffect } from 'react';
import { Info, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { getAuthHeaders } from '@/lib/utils';

interface WeightLog {
  id: string;
  weight: number;
  createdAt: string;
}

interface WeightTrackerProps {
  isOfflineProp: boolean;
}

export default function WeightTracker({ isOfflineProp }: WeightTrackerProps) {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [unit, setUnit] = useState<'KG' | 'LBS'>('KG');
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNetworkFailed, setIsNetworkFailed] = useState(false);

  const effectivelyOffline = isOfflineProp || isNetworkFailed;

  useEffect(() => {
    try {
      const savedUnit = localStorage.getItem("ultimatum_weight_unit");
      if (savedUnit === "KG" || savedUnit === "LBS") {
        setUnit(savedUnit);
      }
    } catch (e) {}

    try {
      const cached = localStorage.getItem("ultimatum_weight_history");
      if (cached) {
        setWeightLogs(JSON.parse(cached));
      }
    } catch (e) {}

    async function fetchWeights() {
      if (isOfflineProp) return;
      try {
        const res = await fetch("https://www.ultimatum.website/api/weight", {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (data.weightLogs) {
            setWeightLogs(data.weightLogs);
            localStorage.setItem("ultimatum_weight_history", JSON.stringify(data.weightLogs));
          }
        }
      } catch (e) {
        setIsNetworkFailed(true);
      }
    }
    fetchWeights();
  }, [isOfflineProp]);

  const handleUnitChange = (newUnit: 'KG' | 'LBS') => {
    setUnit(newUnit);
    try {
      localStorage.setItem("ultimatum_weight_unit", newUnit);
    } catch (e) {}
  };

  async function handleLogWeight() {
    const rawNum = parseFloat(newWeight);
    if (!rawNum || isNaN(rawNum)) return;
    
    // Normalize to kg for consistent storage & analytics
    const weightInKg = unit === 'LBS'
      ? parseFloat((rawNum / 2.20462).toFixed(2))
      : rawNum;

    setIsLoggingWeight(true);
    try {
      const logData = { weight: weightInKg, dateOverride: new Date().toISOString() };
      const newLog: WeightLog = {
        id: Math.random().toString(),
        weight: weightInKg,
        createdAt: logData.dateOverride,
      };
      
      const newLogs = [...weightLogs, newLog].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setWeightLogs(newLogs);
      localStorage.setItem("ultimatum_weight_history", JSON.stringify(newLogs));
      setNewWeight("");

      if (!effectivelyOffline) {
        await fetch("https://www.ultimatum.website/api/weight", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(logData)
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingWeight(false);
    }
  }

  async function handleUndoWeight(logId: string) {
    setIsDeleting(true);
    try {
      const newLogs = weightLogs.filter(log => log.id !== logId);
      setWeightLogs(newLogs);
      localStorage.setItem("ultimatum_weight_history", JSON.stringify(newLogs));

      if (!effectivelyOffline) {
        await fetch(`https://www.ultimatum.website/api/weight?id=${logId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  }

  const weightTrend = React.useMemo(() => {
    if (weightLogs.length < 2) return null;
    const sorted = [...weightLogs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const first = sorted[0].weight;
    const last = sorted[sorted.length - 1].weight;
    const diff = last - first;
    if (diff > 0.5) return "BULKING";
    if (diff < -0.5) return "CUTTING";
    return "MAINTENANCE";
  }, [weightLogs]);

  const todaysLog = React.useMemo(() => {
    if (weightLogs.length === 0) return null;
    const today = new Date().toDateString();
    return weightLogs.find(log => new Date(log.createdAt).toDateString() === today) || null;
  }, [weightLogs]);

  const displayTodayWeight = todaysLog
    ? unit === 'LBS'
      ? parseFloat((todaysLog.weight * 2.20462).toFixed(1))
      : todaysLog.weight
    : null;

  const trendColor =
    weightTrend === 'BULKING' ? '#22c55e' :
    weightTrend === 'CUTTING' ? '#f97316' :
    '#a1a1aa';

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div
        style={{
          background: 'linear-gradient(160deg, #141414 0%, #0d0d0d 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div
          style={{
            padding: '20px 22px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: 5,
                lineHeight: 1,
              }}
            >
              Daily weigh-in
            </p>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              Weight Tracking
            </h3>
          </div>

          {/* Unit Toggle */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}
          >
            {(['KG', 'LBS'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => handleUnitChange(u)}
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: unit === u ? 'rgba(255,255,255,0.13)' : 'transparent',
                  color: unit === u ? '#fff' : 'rgba(255,255,255,0.32)',
                  lineHeight: 1,
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Weight Row ─────────────────────────────── */}
        <div
          style={{
            padding: '26px 22px 22px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Value */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1,
              }}
            >
              Today
            </span>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              {todaysLog ? (
                <>
                  <span
                    style={{
                      fontSize: 50,
                      fontWeight: 800,
                      color: '#ffffff',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                    }}
                  >
                    {displayTodayWeight}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.38)',
                      marginBottom: 3,
                    }}
                  >
                    {unit.toLowerCase()}
                  </span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogWeight()}
                    placeholder="—"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 50,
                      fontWeight: 800,
                      color: '#ffffff',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      padding: 0,
                      margin: 0,
                      width: newWeight ? `${Math.max(2.4, newWeight.length * 0.72 + 0.4)}ch` : '2.8ch',
                      caretColor: '#ffffff',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.38)',
                      marginBottom: 3,
                    }}
                  >
                    {unit.toLowerCase()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* CTA */}
          <div style={{ paddingBottom: 4 }}>
            {todaysLog ? (
              <button
                onClick={() => handleUndoWeight(todaysLog.id)}
                disabled={isDeleting}
                style={{
                  padding: '10px 16px',
                  borderRadius: 11,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {isDeleting ? <Loader2 size={13} className="animate-spin" /> : 'Undo Entry'}
              </button>
            ) : (
              <button
                onClick={handleLogWeight}
                disabled={isLoggingWeight || !newWeight}
                style={{
                  padding: '11px 20px',
                  borderRadius: 11,
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: newWeight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                  color: newWeight ? '#000000' : 'rgba(255,255,255,0.22)',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  cursor: isLoggingWeight || !newWeight ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: newWeight ? '0 2px 14px rgba(255,255,255,0.1)' : 'none',
                }}
              >
                {isLoggingWeight
                  ? <Loader2 size={13} className="animate-spin" style={{ color: '#666' }} />
                  : 'Log Weight'}
              </button>
            )}
          </div>
        </div>

        {/* ── Trend Chart ─────────────────────────────────── */}
        {weightLogs.length > 1 && (
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              padding: '18px 22px 18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                Trend
              </span>
              {weightTrend && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.7)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: `1px solid ${trendColor}30`,
                    background: `${trendColor}0a`,
                  }}
                >
                  {weightTrend}
                </span>
              )}
            </div>

            <div style={{ height: 152, width: '100%', marginLeft: -4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weightLogs.map(log => ({
                    date: new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    weight: unit === 'LBS' ? parseFloat((log.weight * 2.20462).toFixed(1)) : log.weight
                  }))}
                >
                  <XAxis
                    dataKey="date"
                    stroke="transparent"
                    tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    stroke="transparent"
                    tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                    width={36}
                    dx={-4}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#191919',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 12,
                      padding: '9px 13px',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
                    }}
                    itemStyle={{ color: '#ffffff', fontSize: 14, fontWeight: 700 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}
                    formatter={(val: any) => [`${val} ${unit.toLowerCase()}`, '']}
                    cursor={{ stroke: 'rgba(255,255,255,0.09)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={{ r: 0 }}
                    activeDot={{ r: 4, fill: '#fff', stroke: 'rgba(255,255,255,0.25)', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── 1-Entry Milestone ───────────────────────────── */}
        {weightLogs.length === 1 && (
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              padding: '14px 22px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', margin: 0, lineHeight: 1.55 }}>
              First entry recorded. Log again tomorrow to unlock trend analytics.
            </p>
          </div>
        )}

        {/* ── Protocol Note ───────────────────────────────── */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <Info size={13} style={{ color: 'rgba(255,255,255,0.22)', flexShrink: 0 }} />
          <span
            style={{
              fontSize: 11.5,
              color: 'rgba(255,255,255,0.28)',
              lineHeight: 1.5,
              letterSpacing: '0.01em',
            }}
          >
            Weigh in first thing in the morning, fasted, for accurate trend data.
          </span>
        </div>
      </div>
    </div>
  );
}
