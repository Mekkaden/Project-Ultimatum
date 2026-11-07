import { registerPlugin } from '@capacitor/core';

const RestTimerNative = registerPlugin<any>('RestTimerNative');

export type TimerStatus = 'idle' | 'running' | 'paused';

export type TimerState = {
  timeLeft: number;
  initialTime: number;
  status: TimerStatus;
  vibrate: boolean;
  isOpen: boolean;
};

type Listener = (state: TimerState) => void;

class TimerStore {
  state: TimerState = {
    timeLeft: 180,
    initialTime: 180,
    status: 'idle',
    vibrate: typeof window !== 'undefined' ? localStorage.getItem('rt_vibrate') !== 'false' : true,
    isOpen: false,
  };
  
  endTime: number = 0;
  interval: NodeJS.Timeout | null = null;
  listeners: Set<Listener> = new Set();
  
  constructor() {
    this._hydrate();
  }

  private _hydrate() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('rt_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.endTime = parsed.endTime || 0;
        
        const newState = { ...this.state, ...parsed.state };
        // if running, check if we still have time left based on absolute endTime
        if (newState.status === 'running') {
          const remaining = Math.max(0, Math.ceil((this.endTime - Date.now()) / 1000));
          if (remaining > 0) {
            newState.timeLeft = remaining;
            this.state = newState;
            this._startInterval();
          } else {
            newState.status = 'idle';
            newState.timeLeft = newState.initialTime > 0 ? newState.initialTime : 180;
            this.state = newState;
          }
        } else {
          this.state = newState;
        }
      }
    } catch(e) {}
  }

  private _save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('rt_state', JSON.stringify({
        state: this.state,
        endTime: this.endTime
      }));
    } catch(e) {}
  }
  
  subscribe(l: Listener) {
    this.listeners.add(l);
    l(this.state);
    return () => this.listeners.delete(l);
  }
  
  private updateState(newState: Partial<TimerState>) {
    this.state = { ...this.state, ...newState };
    this._save();
    this.listeners.forEach(l => l(this.state));
  }
  
  setVibrate(v: boolean) {
    if (typeof window !== 'undefined') localStorage.setItem('rt_vibrate', String(v));
    this.updateState({ vibrate: v });
  }

  openModal() {
    const updates: Partial<TimerState> = { isOpen: true };
    if (this.state.status === 'idle' && this.state.timeLeft <= 0) {
      updates.timeLeft = this.state.initialTime > 0 ? this.state.initialTime : 180;
    }
    this.updateState(updates);
  }

  closeModal() {
    const updates: Partial<TimerState> = { isOpen: false };
    if (this.state.status === 'idle') {
      updates.timeLeft = this.state.initialTime > 0 ? this.state.initialTime : 180;
    }
    this.updateState(updates);
  }
  
  adjustTime(delta: number) {
    let newVal = Math.min(600, Math.max(0, this.state.timeLeft + delta));
    let nextState: Partial<TimerState> = { timeLeft: newVal };
    
    if (this.state.status === 'running') {
      this.endTime = Date.now() + newVal * 1000;
      this._scheduleNative(newVal, this.state.vibrate);
    } else if (this.state.status === 'idle') {
      nextState.initialTime = newVal;
    }
    this.updateState(nextState);
  }

  setTime(val: number) {
    if (val > 600) val = 600;
    if (val < 0) val = 0;
    let nextState: Partial<TimerState> = { timeLeft: val };
    
    if (this.state.status === 'running') {
      this.endTime = Date.now() + val * 1000;
      this._scheduleNative(val, this.state.vibrate);
    } else if (this.state.status === 'idle') {
      nextState.initialTime = val;
    }
    this.updateState(nextState);
  }
  
  start() {
    let newTimeLeft = this.state.timeLeft;
    if (this.state.timeLeft <= 0) {
      newTimeLeft = this.state.initialTime > 0 ? this.state.initialTime : 180;
    }
    this.endTime = Date.now() + newTimeLeft * 1000;
    this._scheduleNative(newTimeLeft, this.state.vibrate);
    this._startInterval();
    this.updateState({ status: 'running', timeLeft: newTimeLeft });
  }
  
  pause() {
    this._cancelNative();
    this._stopInterval();
    this.updateState({ status: 'paused' });
  }
  
  cancel() {
    this._cancelNative();
    this._stopInterval();
    this.updateState({ status: 'idle', timeLeft: this.state.initialTime });
  }
  
  private _startInterval() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((this.endTime - Date.now()) / 1000));
      
      let nextState: Partial<TimerState> = { timeLeft: remaining };
      if (remaining <= 0) {
        this._stopInterval();
        nextState.status = 'idle';
        
        // Ensure foreground vibration triggers consistently
        if (this.state.vibrate && typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([500, 200, 500, 200, 500]);
        }
        
        // Auto-close only on natural finish
        if (this.state.isOpen) {
          setTimeout(() => this.closeModal(), 1500);
        }
      }
      this.updateState(nextState);
    }, 200);
  }
  
  private _stopInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  private async _scheduleNative(duration: number, vibrate: boolean) {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
      try {
        await RestTimerNative.startTimer({
          duration,
          vibrate,
          sound: false
        });
      } catch (e) {}
    }
  }
  
  private async _cancelNative() {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
      try {
        await RestTimerNative.stopTimer();
      } catch (e) {}
    }
  }
}

// Singleton instance
export const globalTimerStore = new TimerStore();
