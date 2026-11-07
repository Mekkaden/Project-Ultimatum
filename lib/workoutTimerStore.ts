import { registerPlugin } from '@capacitor/core';
import { TimerStatus } from './timerStore';

const RestTimerNative = registerPlugin<any>('RestTimerNative');

export type WorkoutTimerState = {
  timeLeft: number;
  initialTime: number; // e.g. 60 mins = 3600
  status: TimerStatus;
  isOpen: boolean;
};

type Listener = (state: WorkoutTimerState) => void;

class WorkoutTimerStore {
  state: WorkoutTimerState = {
    timeLeft: 3600, // 60 mins default
    initialTime: 3600,
    status: 'idle',
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
      const saved = localStorage.getItem('workout_rt_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.endTime = parsed.endTime || 0;
        
        const newState = { ...this.state, ...parsed.state };
        
        if (newState.status === 'running') {
          const remaining = Math.max(0, Math.ceil((this.endTime - Date.now()) / 1000));
          if (remaining > 0) {
            newState.timeLeft = remaining;
            this.state = newState;
            this._startInterval();
          } else {
            newState.status = 'idle';
            newState.timeLeft = 0; // finished
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
      localStorage.setItem('workout_rt_state', JSON.stringify({
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
  
  private updateState(newState: Partial<WorkoutTimerState>) {
    this.state = { ...this.state, ...newState };
    this._save();
    this.listeners.forEach(l => l(this.state));
  }

  openModal() {
    this.updateState({ isOpen: true });
  }

  closeModal() {
    this.updateState({ isOpen: false });
  }

  setTime(valInSeconds: number) {
    if (valInSeconds < 0) valInSeconds = 0;
    
    let nextState: Partial<WorkoutTimerState> = { timeLeft: valInSeconds };
    
    if (this.state.status === 'running') {
      this.endTime = Date.now() + valInSeconds * 1000;
    } else if (this.state.status === 'idle') {
      nextState.initialTime = valInSeconds;
    }
    this.updateState(nextState);
  }
  
  start() {
    let newTimeLeft = this.state.timeLeft;
    if (this.state.timeLeft <= 0) {
      newTimeLeft = this.state.initialTime > 0 ? this.state.initialTime : 3600;
    }
    this.endTime = Date.now() + newTimeLeft * 1000;
    this._startInterval();
    this.updateState({ status: 'running', timeLeft: newTimeLeft });
    
    // Start native background notification
    if (typeof window !== 'undefined') {
      RestTimerNative.startWorkoutSession({ duration: newTimeLeft }).catch(() => {});
    }
  }
  
  pause() {
    this._stopInterval();
    this.updateState({ status: 'paused' });
    
    if (typeof window !== 'undefined') {
      RestTimerNative.stopWorkoutSession().catch(() => {});
    }
  }
  
  cancel() {
    this._stopInterval();
    this.updateState({ status: 'idle', timeLeft: this.state.initialTime });
    
    if (typeof window !== 'undefined') {
      RestTimerNative.stopWorkoutSession().catch(() => {});
    }
  }
  
  private _startInterval() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((this.endTime - Date.now()) / 1000));
      
      let nextState: Partial<WorkoutTimerState> = { timeLeft: remaining };
      
      if (remaining <= 0) {
        this._stopInterval();
        nextState.status = 'idle';
        
        // Vibrate when finished if in foreground
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([1000, 500, 1000, 500, 1000]);
        }
      }
      this.updateState(nextState);
    }, 1000); // 1-second ticks is fine for UI
  }
  
  private _stopInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

export const globalWorkoutTimerStore = new WorkoutTimerStore();
