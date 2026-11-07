import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Target, CalendarDays, CalendarClock, MoreHorizontal, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Habit {
  id: string;
  title: string;
  completedDates: string[];
  createdAt: number;
  type: 'daily' | 'weekly';
  category?: string;
  duration?: number;
  reminder?: boolean;
  reminderTime?: string;
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitType, setNewHabitType] = useState<'daily' | 'weekly'>('daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitCategory, setNewHabitCategory] = useState('GENERAL');
  const [newHabitDuration, setNewHabitDuration] = useState<number | ''>(0);
  const [newHabitReminder, setNewHabitReminder] = useState(false);
  const [newHabitReminderTime, setNewHabitReminderTime] = useState('07:30');
  const todayStr = new Date().toLocaleDateString('en-CA');

  const categories = ['GENERAL', 'WORKOUT', 'DIET', 'READING', 'STUDY', 'FINANCE'];
  const durationPresets = [15, 30, 60];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ultimatum_habits');
      if (saved) {
        // Handle migration of old data by defaulting to 'daily'
        const parsedHabits = JSON.parse(saved).map((h: any) => ({
          ...h,
          type: h.type || 'daily'
        }));
        setHabits(parsedHabits);
      }
    } catch (e) {}
  }, []);

  const saveHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem('ultimatum_habits', JSON.stringify(newHabits));
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      title: newHabitTitle.trim(),
      completedDates: [],
      createdAt: Date.now(),
      type: newHabitType,
      category: newHabitCategory,
      duration: newHabitDuration === '' ? 30 : newHabitDuration,
      reminder: newHabitReminder,
      reminderTime: newHabitReminder ? newHabitReminderTime : undefined
    };

    if (newHabitReminder && newHabitReminderTime) {
      import('@/lib/notifications').then(({ scheduleHabitReminder }) => {
        scheduleHabitReminder(newHabit.id, newHabit.title, newHabitReminderTime);
      });
    }

    saveHabits([...habits, newHabit]);
    setNewHabitTitle('');
    setIsModalOpen(false);
  };

  const toggleHabit = (id: string) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        const isDoneToday = h.completedDates.includes(todayStr);
        return {
          ...h,
          completedDates: isDoneToday 
            ? h.completedDates.filter(d => d !== todayStr) 
            : [...h.completedDates, todayStr]
        };
      }
      return h;
    });
    saveHabits(updated);
  };

  const deleteHabit = (id: string) => {
    const toDelete = habits.find(h => h.id === id);
    if (toDelete?.reminder) {
      import('@/lib/notifications').then(({ cancelHabitReminder }) => {
        cancelHabitReminder(toDelete.id);
      });
    }
    saveHabits(habits.filter(h => h.id !== id));
  };

  const dailyHabits = habits.filter(h => h.type === 'daily');
  const weeklyHabits = habits.filter(h => h.type === 'weekly');

  const completedTodayCount = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const totalCount = habits.length;
  const missedCount = totalCount - completedTodayCount;

  const progressPercent = totalCount === 0 ? 0 : (completedTodayCount / totalCount) * 100;
  const missedPercent = totalCount === 0 ? 0 : (missedCount / totalCount) * 100;

  // 7-Day Activity Logic
  const last7DaysInfo = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: d.toLocaleDateString('en-CA'),
      dayLetter: ['S','M','T','W','T','F','S'][d.getDay()]
    };
  });

  const activityData = last7DaysInfo.map(info => {
    return habits.filter(h => h.completedDates.includes(info.dateStr)).length;
  });

  const maxActivity = Math.max(1, ...activityData);

  const renderHabitList = (list: Habit[], emptyMsg: string) => (
    <div className="space-y-3 relative">
      <AnimatePresence mode="popLayout">
        {list.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-10 text-center rounded-3xl bg-black/40 backdrop-blur-md shadow-[inset_4px_4px_10px_rgba(0,0,0,0.8),inset_-2px_-2px_10px_rgba(255,255,255,0.03)] relative overflow-hidden border border-white/5"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(228,252,175,0.03),transparent_70%)]"></div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2 drop-shadow-md">Zero Directives</h3>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 max-w-[220px] leading-relaxed drop-shadow-sm">
              {emptyMsg}
            </p>
          </motion.div>
        ) : (
          list.map(habit => {
            const isDone = habit.completedDates.includes(todayStr);
            const currentStreak = habit.completedDates.length;

            return (
              <motion.div 
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => toggleHabit(habit.id)}
                className={`group relative flex items-center justify-between p-4 rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md
                  ${isDone 
                    ? 'bg-black/20 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.8),inset_-2px_-2px_10px_rgba(255,255,255,0.02)] border border-[#e4fcaf]/10' 
                    : 'bg-white/5 shadow-[4px_4px_12px_rgba(0,0,0,0.5),-2px_-2px_8px_rgba(255,255,255,0.03)] border border-white/5 hover:bg-white/10'}`}
              >
                {/* Subtle Background Glow when done */}
                {isDone && <div className="absolute inset-0 bg-gradient-to-r from-[#e4fcaf]/10 to-transparent"></div>}
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="flex-shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="text-[#e4fcaf] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" size={22} strokeWidth={2.5} />
                    ) : (
                      <Circle className="text-neutral-700 group-hover:text-neutral-500 transition-colors" size={22} strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold uppercase tracking-[0.1em] text-xs transition-all duration-300 ${isDone ? 'text-[#e4fcaf]/40' : 'text-neutral-200 drop-shadow-sm'}`}>
                      {habit.title}
                    </span>
                    {(habit.category || habit.duration) && (
                      <div className={`flex items-center gap-2 mt-1 transition-opacity ${isDone ? 'opacity-30' : 'opacity-100'}`}>
                        {habit.category && (
                          <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">[{habit.category}]</span>
                        )}
                        {habit.duration && (
                          <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">{habit.duration}M</span>
                        )}
                        {habit.reminder && (
                          <div className="flex items-center gap-1 bg-[#e4fcaf]/10 px-1.5 py-0.5 rounded">
                            <Bell size={10} className="text-[#e4fcaf]" />
                            <span className="text-[8px] font-black text-[#e4fcaf] uppercase tracking-widest">{habit.reminderTime}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest hidden md:block">
                      Total
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest hidden md:block">
                      {currentStreak}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                    className="text-neutral-700 hover:text-red-500 transition-colors p-2 -mr-2 bg-black/0 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );


  return (
    <>

    <div className="w-full max-w-xl mx-auto space-y-12 animate-in fade-in duration-700 px-4 md:px-0 pb-32">
      
      {/* Daily Habits List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={16} className="text-[#e4fcaf]" />
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">Daily Directives</h2>
        </div>
        {renderHabitList(dailyHabits, "No daily directives assigned.")}
      </div>

      {/* Weekly Habits List */}
      <div>
        <div className="flex items-center gap-2 mb-4 mt-8">
          <CalendarClock size={16} className="text-[#e4fcaf]" />
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">Weekly Directives</h2>
        </div>
        {renderHabitList(weeklyHabits, "No weekly directives assigned.")}
      </div>

      {/* Add Habit Button */}
      <div className="pt-6 border-t border-neutral-800/50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-auto mx-auto px-8 bg-[#e4fcaf] text-black hover:bg-[#d4f58c] font-black uppercase tracking-widest text-xs py-3.5 rounded-full flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-95 active:scale-90"
        >
          <Plus size={18} strokeWidth={3} />
          New Directive
        </button>
      </div>

      {/* Analytics Dashboard (Moved to Bottom) */}
      <div className="grid grid-cols-2 gap-4 mt-16 pt-16 border-t border-neutral-800/50">
        
        {/* Completed Tasks Card */}
        <div className="bg-black border border-[#222] rounded-[32px] p-5 flex flex-col items-center justify-between relative shadow-2xl">
          <div className="w-full flex justify-between items-start mb-6">
            <h3 className="text-[11px] font-black uppercase text-neutral-400 leading-tight">Completed<br/>Tasks</h3>
            <MoreHorizontal size={14} className="text-neutral-600" />
          </div>
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              <circle cx="56" cy="56" r="46" stroke="#161616" strokeWidth="8" fill="none" />
              <circle 
                cx="56" cy="56" r="46" 
                stroke="white" 
                strokeWidth="8" 
                fill="none" 
                strokeLinecap="round" 
                strokeDasharray="289" 
                strokeDashoffset={289 - (progressPercent / 100) * 289} 
                className="transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="text-center flex flex-col items-center">
              <div className="text-xl font-black text-white">{Math.round(progressPercent)}%</div>
              <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-1">{completedTodayCount}/{totalCount}</div>
            </div>
          </div>
          <button className="mt-6 px-5 py-2 bg-[#141414] border border-[#222] rounded-full text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors w-full">Details</button>
        </div>

        {/* Missed Tasks Card */}
        <div className="bg-black border border-[#222] rounded-[32px] p-5 flex flex-col items-center justify-between relative shadow-2xl">
          <div className="w-full flex justify-between items-start mb-6">
            <h3 className="text-[11px] font-black uppercase text-neutral-400 leading-tight">Pending<br/>Tasks</h3>
            <MoreHorizontal size={14} className="text-neutral-600" />
          </div>
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="56" cy="56" r="46" stroke="#161616" strokeWidth="8" fill="none" />
              <circle 
                cx="56" cy="56" r="46" 
                stroke="#555" 
                strokeWidth="8" 
                fill="none" 
                strokeLinecap="round" 
                strokeDasharray="289" 
                strokeDashoffset={289 - (missedPercent / 100) * 289} 
                className="transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="text-center flex flex-col items-center">
              <div className="text-xl font-black text-white">{Math.round(missedPercent)}%</div>
              <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-1">{missedCount}/{totalCount}</div>
            </div>
          </div>
          <button className="mt-6 px-5 py-2 bg-[#141414] border border-[#222] rounded-full text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors w-full">Details</button>
        </div>

        {/* 7-Day Activity Card */}
        <div className="col-span-2 bg-black border border-[#222] rounded-[32px] p-6 flex flex-col relative shadow-2xl">
          <div className="w-full flex justify-between items-start mb-8">
            <h3 className="text-[11px] font-black uppercase text-neutral-400">7-Day Activity</h3>
            <MoreHorizontal size={14} className="text-neutral-600" />
          </div>
          <div className="flex items-end justify-between h-24 w-full px-2 gap-3">
            {activityData.map((val, i) => (
              <div key={i} className="flex flex-col items-center justify-end w-full h-full group">
                <div className="w-full bg-[#161616] rounded-md relative flex items-end overflow-hidden h-full group-hover:bg-[#222] transition-colors">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxActivity) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="w-full bg-gradient-to-t from-emerald-900 to-[#e4fcaf] rounded-md shadow-[0_0_10px_rgba(217,249,157,0.3)]"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2">
            {last7DaysInfo.map((info, i) => (
               <span key={i} className="text-[9px] font-black text-neutral-600 uppercase flex-1 text-center">{info.dayLetter}</span>
            ))}
          </div>
        </div>
      </div>

    </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-neutral-800 md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#111]">
                <h2 className="text-sm font-black text-white uppercase tracking-widest">New Directive</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 pb-28 md:pb-6 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleAddHabit} className="flex flex-col gap-6">
                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">Habit Name</label>
                    <input
                      type="text"
                      value={newHabitTitle}
                      onChange={(e) => setNewHabitTitle(e.target.value)}
                      placeholder="e.g. Morning Run"
                      className="w-full bg-[#161616] border border-white/5 px-4 py-3.5 rounded-xl text-sm font-medium text-white outline-none placeholder:text-neutral-600 focus:border-[#e4fcaf]/30 transition-colors"
                    />
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewHabitCategory(cat)}
                          className={`px-4 py-2 text-[10px] font-bold tracking-wider rounded-lg border transition-colors ${
                            newHabitCategory === cat
                              ? "bg-[#e4fcaf]/10 text-[#e4fcaf] border-[#e4fcaf]/20"
                              : "bg-white/5 text-neutral-500 border-white/5 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">Schedule</label>
                    <div className="flex bg-[#161616] rounded-xl p-1 border border-white/5">
                      <button
                        type="button"
                        onClick={() => setNewHabitType('daily')}
                        className={`flex-1 py-2.5 text-[11px] font-bold tracking-wider rounded-lg transition-colors ${
                          newHabitType === 'daily' ? 'bg-[#222] text-[#e4fcaf]' : 'text-neutral-500 hover:text-white'
                        }`}
                      >
                        Daily
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewHabitType('weekly')}
                        className={`flex-1 py-2.5 text-[11px] font-bold tracking-wider rounded-lg transition-colors ${
                          newHabitType === 'weekly' ? 'bg-[#222] text-[#e4fcaf]' : 'text-neutral-500 hover:text-white'
                        }`}
                      >
                        Weekly
                      </button>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">Target Duration</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setNewHabitDuration(0)}
                        className={`flex-1 px-3 py-2.5 text-[10px] font-bold tracking-wider rounded-lg border transition-colors ${
                          newHabitDuration === 0
                            ? "bg-[#e4fcaf]/10 text-[#e4fcaf] border-[#e4fcaf]/20"
                            : "bg-white/5 text-neutral-500 border-white/5 hover:text-white"
                        }`}
                      >
                        None
                      </button>
                      {durationPresets.map(dur => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setNewHabitDuration(dur)}
                          className={`flex-1 px-3 py-2.5 text-[10px] font-bold tracking-wider rounded-lg border transition-colors ${
                            newHabitDuration === dur
                              ? "bg-[#e4fcaf]/10 text-[#e4fcaf] border-[#e4fcaf]/20"
                              : "bg-white/5 text-neutral-500 border-white/5 hover:text-white"
                          }`}
                        >
                          {dur} min
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        value={newHabitDuration}
                        onChange={(e) => setNewHabitDuration(e.target.value ? parseInt(e.target.value) : '')}
                        placeholder="Custom"
                        className="w-20 bg-[#161616] border border-white/5 px-3 py-2.5 rounded-xl text-[11px] font-bold text-center text-white tracking-widest outline-none placeholder:text-neutral-600 focus:border-[#e4fcaf]/20 transition-colors"
                      />
                      <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">MIN</span>
                    </div>
                  </div>

                  {/* Reminder */}
                  <div className="flex flex-col gap-2 mt-2 bg-[#161616] border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell size={14} className={newHabitReminder ? "text-[#e4fcaf]" : "text-neutral-600"} />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Push Reminder</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewHabitReminder(!newHabitReminder)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors ${newHabitReminder ? 'bg-[#e4fcaf]' : 'bg-[#333]'}`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${newHabitReminder ? 'bg-black translate-x-5' : 'bg-neutral-500 translate-x-0'}`} />
                      </button>
                    </div>
                    {newHabitReminder && (
                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Trigger Time</span>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-black border border-white/10 rounded-lg overflow-hidden focus-within:border-[#e4fcaf]/30 transition-colors px-1">
                            <input 
                              type="text" 
                              inputMode="numeric"
                              value={newHabitReminderTime.split(':')[0] === "" ? "" : (parseInt(newHabitReminderTime.split(':')[0]) % 12 || 12)}
                              onChange={(e) => {
                                 if (e.target.value === "") {
                                   setNewHabitReminderTime(`:${newHabitReminderTime.split(':')[1]}`);
                                   return;
                                 }
                                 let newH12 = parseInt(e.target.value);
                                 if (isNaN(newH12)) return;
                                 if (newH12 > 12) newH12 = 12;
                                 if (newH12 < 1) newH12 = 1;
                                 const isPM = parseInt(newHabitReminderTime.split(':')[0] || "0") >= 12;
                                 let newH24 = newH12;
                                 if (isPM && newH12 < 12) newH24 += 12;
                                 if (!isPM && newH12 === 12) newH24 = 0;
                                 setNewHabitReminderTime(`${newH24.toString().padStart(2, '0')}:${newHabitReminderTime.split(':')[1]}`);
                              }}
                              onFocus={(e) => e.target.select()}
                              onBlur={() => {
                                 const parts = newHabitReminderTime.split(':');
                                 if (parts[0] === "") setNewHabitReminderTime(`12:${parts[1]}`);
                              }}
                              className="w-8 text-center bg-transparent py-1.5 text-xs font-black text-white outline-none appearance-none"
                            />
                            <span className="text-white/30 font-black mb-0.5">:</span>
                            <input 
                              type="text"
                              inputMode="numeric"
                              value={newHabitReminderTime.split(':')[1] === "" ? "" : newHabitReminderTime.split(':')[1]}
                              onChange={(e) => {
                                 if (e.target.value === "") {
                                   setNewHabitReminderTime(`${newHabitReminderTime.split(':')[0]}:`);
                                   return;
                                 }
                                 let newMin = parseInt(e.target.value);
                                 if (isNaN(newMin)) return;
                                 if (newMin > 59) newMin = 59;
                                 if (newMin < 0) newMin = 0;
                                 setNewHabitReminderTime(`${newHabitReminderTime.split(':')[0]}:${newMin.toString().padStart(2, '0')}`);
                              }}
                              onFocus={(e) => e.target.select()}
                              onBlur={() => {
                                 const parts = newHabitReminderTime.split(':');
                                 if (parts[1] === "") setNewHabitReminderTime(`${parts[0]}:00`);
                              }}
                              className="w-8 text-center bg-transparent py-1.5 text-xs font-black text-white outline-none appearance-none"
                            />
                          </div>
                          
                          <div className="flex bg-black border border-white/10 rounded-lg overflow-hidden p-0.5">
                            <button 
                              type="button"
                              onClick={() => {
                                 const h24 = parseInt(newHabitReminderTime.split(':')[0]);
                                 if (h24 >= 12) {
                                   setNewHabitReminderTime(`${(h24 - 12).toString().padStart(2, '0')}:${newHabitReminderTime.split(':')[1]}`);
                                 }
                              }}
                              className={`px-2 py-1.5 text-[9px] font-black tracking-widest rounded-md transition-colors ${parseInt(newHabitReminderTime.split(':')[0]) < 12 ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}
                            >AM</button>
                            <button 
                              type="button"
                              onClick={() => {
                                 const h24 = parseInt(newHabitReminderTime.split(':')[0]);
                                 if (h24 < 12) {
                                   setNewHabitReminderTime(`${(h24 + 12).toString().padStart(2, '0')}:${newHabitReminderTime.split(':')[1]}`);
                                 }
                              }}
                              className={`px-2 py-1.5 text-[9px] font-black tracking-widest rounded-md transition-colors ${parseInt(newHabitReminderTime.split(':')[0]) >= 12 ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}
                            >PM</button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!newHabitTitle.trim() || newHabitDuration === '' || newHabitDuration < 0}
                    className="w-full py-4 mt-2 bg-[#e4fcaf] text-black disabled:opacity-30 disabled:bg-[#333] disabled:text-neutral-600 font-black tracking-widest uppercase text-xs rounded-xl transition-colors shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    Create Habit
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
