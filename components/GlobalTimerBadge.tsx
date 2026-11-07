"use client";

import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { globalTimerStore, TimerState } from '@/lib/timerStore';

export default function GlobalTimerBadge({ 
  onClick, 
  idleIconSize = 24,
  onlyShowWhenActive = false
}: { 
  onClick?: () => void,
  idleIconSize?: number,
  onlyShowWhenActive?: boolean
}) {
  const [mounted, setMounted] = useState(false);
  const [timerState, setTimerState] = useState<TimerState>(globalTimerStore.state);

  useEffect(() => {
    setMounted(true);
    return globalTimerStore.subscribe(setTimerState);
  }, []);

  if (!mounted) {
    if (onlyShowWhenActive) return null;
    if (onClick) {
      return (
        <button onClick={onClick} className="text-neutral-500 hover:text-white transition-colors flex items-center">
          <Timer size={idleIconSize} />
        </button>
      );
    }
    return <Timer size={idleIconSize} className="text-neutral-500" />;
  }

  const { timeLeft, initialTime, status } = timerState;

  if (status === 'idle') {
    if (onlyShowWhenActive) return null;
    
    if (onClick) {
      return (
        <button onClick={onClick} className="text-neutral-500 hover:text-white transition-colors flex items-center">
          <Timer size={idleIconSize} />
        </button>
      );
    }
    return <Timer size={idleIconSize} className="text-neutral-500" />;
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  const badge = (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
      status === 'running' 
        ? 'bg-[#111111] border border-blue-500/40 text-white shadow-sm' 
        : 'bg-[#111111] border border-white/10 text-neutral-400'
    }`}>
      <Timer size={13} className={status === 'running' ? 'text-blue-400' : 'text-neutral-400'} />
      <span className="text-xs font-mono font-bold tracking-wider">{timeStr}</span>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="transition-opacity hover:opacity-80 flex items-center">
        {badge}
      </button>
    );
  }

  return badge;
}
