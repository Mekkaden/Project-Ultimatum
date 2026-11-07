import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, X, Target, Info } from 'lucide-react';
import { globalWorkoutTimerStore, WorkoutTimerState } from '../lib/workoutTimerStore';
import DisciplinedAlarmOverlay from './DisciplinedAlarmOverlay';

const PRESETS = [30, 45, 60, 90, 120];

export default function DisciplinedTimer() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<WorkoutTimerState>(globalWorkoutTimerStore.state);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState("");

  useEffect(() => {
    setMounted(true);
    const unsub = globalWorkoutTimerStore.subscribe(setState);
    return unsub;
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center justify-center w-8 h-[30px] bg-tracker-bg border border-tracker-border rounded-lg text-tracker-text-soft">
        <Target size={14} strokeWidth={2.2} />
      </button>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeSubmit = () => {
    setIsEditingTime(false);
    const mins = parseInt(customTimeInput, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 999) {
      globalWorkoutTimerStore.setTime(mins * 60);
    }
  };

  const isLowTime = state.status === 'running' && state.timeLeft > 0 && state.timeLeft < 300;
  const isFinished = state.status === 'idle' && state.timeLeft === 0 && state.initialTime > 0;
  const isRunning = state.status === 'running';
  const isPaused = state.status === 'paused';
  const isActive = isRunning || isPaused;

  // Ring colours
  const ringColor = isFinished ? '#ef4444' : isLowTime ? '#facc15' : '#3b82f6';

  // Badge styling for the header trigger button (clean, minimal, neutral text with subtle status border)
  let badgeBorder = 'border-tracker-border text-tracker-text-soft hover:text-white hover:bg-tracker-card';
  if (isRunning) {
    badgeBorder = 'border-blue-500/50 bg-blue-500/[0.04] text-neutral-100';
  } else if (isPaused) {
    badgeBorder = 'border-white/20 bg-white/[0.02] text-neutral-300';
  }
  if (isLowTime) {
    badgeBorder = 'border-amber-400/60 bg-amber-400/[0.04] text-neutral-100';
  }
  if (isFinished) {
    badgeBorder = 'border-rose-500/60 bg-rose-500/[0.05] text-neutral-100 animate-pulse';
  }

  // SVG ring math (r=54 → circumference ≈ 339.3)
  const CIRCUMFERENCE = 2 * Math.PI * 54;
  const progress = state.initialTime > 0 ? state.timeLeft / state.initialTime : 1;
  const dashOffset = (1 - progress) * CIRCUMFERENCE;

  return (
    <>
      {/* Trigger badge */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center justify-center h-[30px] rounded-lg bg-tracker-bg border transition-all ${
          isActive ? 'px-2.5' : 'w-8'
        } ${badgeBorder}`}
        title="Workout Timer"
      >
        {isActive ? (
          <span className="text-[11px] font-semibold text-neutral-100 tabular-nums tracking-normal">
            {formatTime(state.timeLeft)}
          </span>
        ) : (
          <Target size={14} strokeWidth={2.2} />
        )}
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              />

              {/* Modal */}
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 360,
                  background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 28,
                  boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* ── Header ──────────────────────────────────────── */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 20px 0',
                }}>
                  <div>
                    <p style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.28)',
                      lineHeight: 1,
                      marginBottom: 5,
                    }}>
                      Session Target
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <h3 style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#ffffff',
                        letterSpacing: '-0.02em',
                        lineHeight: 1,
                        margin: 0,
                      }}>
                        Workout Timer
                      </h3>
                      <button
                        onClick={() => setShowInfo(!showInfo)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          color: 'rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                      >
                        <Info size={14} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                    }}
                  >
                    <X size={15} strokeWidth={2.5} />
                  </button>
                </div>

                {/* ── Info Panel ───────────────────────────────────── */}
                <AnimatePresence>
                  {showInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', padding: '0 20px' }}
                    >
                      <div style={{
                        marginTop: 14,
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 14,
                        fontSize: 12.5,
                        color: 'rgba(255,255,255,0.55)',
                        lineHeight: 1.6,
                      }}>
                        Standard timers only track rests between sets. The <strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>Workout Timer</strong> is an overarching countdown for your entire session — stay focused, avoid distractions, finish on time.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Preset Strip ─────────────────────────────────── */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '20px 20px 0',
                  flexWrap: 'wrap',
                }}>
                  {PRESETS.map(m => {
                    const isSelected = state.initialTime === m * 60;
                    return (
                      <button
                        key={m}
                        onClick={() => globalWorkoutTimerStore.setTime(m * 60)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 10,
                          border: isSelected
                            ? '1px solid rgba(59,130,246,0.4)'
                            : '1px solid rgba(255,255,255,0.08)',
                          background: isSelected
                            ? 'rgba(59,130,246,0.15)'
                            : 'rgba(255,255,255,0.04)',
                          color: isSelected ? '#93c5fd' : 'rgba(255,255,255,0.45)',
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '0.03em',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          lineHeight: 1,
                        }}
                      >
                        {m}m
                      </button>
                    );
                  })}
                </div>

                {/* ── Ring Timer Hero ───────────────────────────────── */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px 20px 20px',
                  position: 'relative',
                }}>
                  {/* SVG Ring */}
                  <div style={{ position: 'relative', width: 180, height: 180 }}>
                    <svg
                      viewBox="0 0 120 120"
                      style={{
                        width: '100%',
                        height: '100%',
                        transform: 'rotate(-90deg)',
                        filter: 'drop-shadow(0 0 10px rgba(59,130,246,0.25))',
                      }}
                    >
                      <defs>
                        <mask id="disciplined-timer-dots-mask">
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            stroke="white"
                            strokeWidth="5.5"
                            fill="none"
                            strokeDasharray="0.1 9.325"
                            strokeLinecap="round"
                          />
                        </mask>
                      </defs>

                      <g mask="url(#disciplined-timer-dots-mask)">
                        {/* Dotted blue track */}
                        <circle
                          cx="60"
                          cy="60"
                          r="54"
                          stroke="rgba(59,130,246,0.3)"
                          strokeWidth="5.5"
                          fill="transparent"
                          strokeDasharray="0.1 9.325"
                          strokeLinecap="round"
                        />
                        {/* Progress */}
                        {state.initialTime > 0 && (
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            stroke={ringColor}
                            strokeWidth="5.5"
                            fill="transparent"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
                          />
                        )}
                      </g>
                    </svg>

                    {/* Center content */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                    }}>
                      {isEditingTime ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                          <input
                            type="number"
                            autoFocus
                            value={customTimeInput}
                            onChange={e => setCustomTimeInput(e.target.value)}
                            onBlur={handleTimeSubmit}
                            onKeyDown={e => e.key === 'Enter' && handleTimeSubmit()}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              borderBottom: `2px solid ${ringColor}`,
                              outline: 'none',
                              fontSize: 36,
                              fontWeight: 800,
                              color: '#fff',
                              width: 72,
                              textAlign: 'center',
                              letterSpacing: '-0.03em',
                              lineHeight: 1,
                              padding: '0 0 2px',
                            }}
                          />
                          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>m</span>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            if (state.status !== 'running') {
                              setIsEditingTime(true);
                              setCustomTimeInput(Math.floor(state.initialTime / 60).toString());
                            }
                          }}
                          style={{
                            fontSize: 38,
                            fontWeight: 800,
                            letterSpacing: '-0.04em',
                            lineHeight: 1,
                            color: isFinished ? '#ef4444' : '#ffffff',
                            cursor: state.status !== 'running' ? 'text' : 'default',
                            fontVariantNumeric: 'tabular-nums',
                            fontFeatureSettings: '"tnum"',
                          }}
                        >
                          {formatTime(state.timeLeft)}
                        </div>
                      )}
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.28)',
                        lineHeight: 1,
                        marginTop: 4,
                      }}>
                        {state.status === 'running' ? 'running' : state.status === 'paused' ? 'paused' : 'ready'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Action Buttons ───────────────────────────────── */}
                <div style={{
                  padding: '0 20px 22px',
                  display: 'flex',
                  gap: 8,
                }}>
                  {state.status === 'running' ? (
                    <>
                      <button
                        onClick={() => globalWorkoutTimerStore.pause()}
                        style={{
                          flex: 1,
                          padding: '13px 0',
                          borderRadius: 14,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.07)',
                          color: '#ffffff',
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 7,
                        }}
                      >
                        <Pause size={14} fill="currentColor" />
                        Pause
                      </button>
                      <button
                        onClick={() => globalWorkoutTimerStore.cancel()}
                        style={{
                          flex: 1,
                          padding: '13px 0',
                          borderRadius: 14,
                          border: '1px solid rgba(255,255,255,0.06)',
                          background: 'rgba(255,255,255,0.03)',
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 7,
                        }}
                      >
                        <Square size={11} fill="currentColor" />
                        Stop
                      </button>
                    </>
                  ) : state.status === 'paused' ? (
                    <>
                      <button
                        onClick={() => globalWorkoutTimerStore.start()}
                        style={{
                          flex: 1,
                          padding: '13px 0',
                          borderRadius: 14,
                          border: 'none',
                          background: '#ffffff',
                          color: '#000000',
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 7,
                          boxShadow: '0 2px 12px rgba(255,255,255,0.12)',
                        }}
                      >
                        <Play size={14} fill="currentColor" />
                        Resume
                      </button>
                      <button
                        onClick={() => globalWorkoutTimerStore.cancel()}
                        style={{
                          flex: 1,
                          padding: '13px 0',
                          borderRadius: 14,
                          border: '1px solid rgba(255,255,255,0.06)',
                          background: 'rgba(255,255,255,0.03)',
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 7,
                        }}
                      >
                        <Square size={11} fill="currentColor" />
                        Stop
                      </button>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => globalWorkoutTimerStore.start()}
                        style={{
                          padding: '10px 28px',
                          borderRadius: 50,
                          border: 'none',
                          background: '#ffffff',
                          color: '#000000',
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          boxShadow: '0 2px 14px rgba(255,255,255,0.12)',
                        }}
                      >
                        <Play size={13} fill="currentColor" />
                        Start
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <DisciplinedAlarmOverlay
        isFinished={isFinished}
        onDismiss={() => globalWorkoutTimerStore.cancel()}
      />
    </>
  );
}

