"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function RestTimer(props) {
  const stateArray = useState(props.initialTime || 180);
  const timeLeft = stateArray[0];
  const setTimeLeft = stateArray[1];

  useEffect(function() {
    if (timeLeft <= 0) {
      if (props.onComplete) {
        props.onComplete();
      }
      return;
    }
    const timerId = setInterval(function() {
      setTimeLeft(function(prev) {
        return prev - 1;
      });
    }, 1000);

    return function() {
      clearInterval(timerId);
    };
  }, [timeLeft, props]);

  const percentage = (timeLeft / (props.initialTime || 180)) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-black border border-neutral-800 rounded-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-red-900/10 blur-xl rounded-full scale-150 animate-pulse"></div>
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="56" className="stroke-neutral-900 fill-none" strokeWidth="8" />
          <motion.circle 
            cx="64" cy="64" r="56" 
            className="stroke-red-600 fill-none" 
            strokeWidth="8" 
            strokeLinecap="round"
            initial={{ strokeDasharray: "351.85", strokeDashoffset: "0" }}
            animate={{ strokeDashoffset: String(351.85 - (351.85 * percentage) / 100) }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <div className="text-3xl font-black text-white tracking-widest z-10">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>
      <div className="mt-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
        Resting
      </div>
      <div className="flex items-center gap-4 mt-6 z-10 relative">
        <button 
          onClick={function() { setTimeLeft(Math.max(0, timeLeft - 30)); }}
          className="w-12 h-12 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white hover:bg-neutral-800 hover:text-red-500 transition-colors font-bold text-sm"
        >
          -30s
        </button>
        <button 
          onClick={function() { if (props.onComplete) props.onComplete(); }}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded text-xs font-black text-white uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)]"
        >
          Skip Rest
        </button>
        <button 
          onClick={function() { setTimeLeft(timeLeft + 30); }}
          className="w-12 h-12 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white hover:bg-neutral-800 hover:text-red-500 transition-colors font-bold text-sm"
        >
          +30s
        </button>
      </div>
    </div>
  );
}

export default function WorkoutTracker(props) {
  const stateActiveSet = useState(1);
  const activeSet = stateActiveSet[0];
  const setActiveSet = stateActiveSet[1];

  const stateWeight = useState(0);
  const weight = stateWeight[0];
  const setWeight = stateWeight[1];

  const stateReps = useState(0);
  const reps = stateReps[0];
  const setReps = stateReps[1];

  const stateIsResting = useState(false);
  const isResting = stateIsResting[0];
  const setIsResting = stateIsResting[1];

  const stateUnit = useState("LBS");
  const unit = stateUnit[0];
  const setUnit = stateUnit[1];

  const stateHistory = useState([]);
  const history = stateHistory[0];
  const setHistory = stateHistory[1];

  const stateActiveTab = useState("TRACK");
  const activeTab = stateActiveTab[0];
  const setActiveTab = stateActiveTab[1];

  const stateCurrentDate = useState("");
  const currentDate = stateCurrentDate[0];
  const setCurrentDate = stateCurrentDate[1];

  const stateCalendarDate = useState("");
  const calendarDate = stateCalendarDate[0];
  const setCalendarDate = stateCalendarDate[1];

  const exerciseName = props.exercise ? (props.exercise.slotName || props.exercise.name) : "Incline Press";

  useEffect(function() {
    // Set Live Date on mount
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setCalendarDate(yyyy + "-" + mm + "-" + dd);

    const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' };
    setCurrentDate(today.toLocaleDateString('en-US', options).toUpperCase());

    // Load History
    const key = "ultimatum_history_" + exerciseName.replace(/\s+/g, '_').toLowerCase();
    const savedData = localStorage.getItem(key);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          
          // Pre-fill weight and reps from last set if exists
          if (parsed.length > 0) {
            const lastSet = parsed[parsed.length - 1];
            setWeight(lastSet.weight);
            setReps(lastSet.reps);
            if (lastSet.unit) setUnit(lastSet.unit);
          }
        } else {
          setHistory([parsed]);
          setWeight(parsed.weight || 0);
          setReps(parsed.reps || 0);
        }
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, [exerciseName]);

  function handleLogSet() {
    if (weight <= 0 || reps <= 0) return;
    
    const key = "ultimatum_history_" + exerciseName.replace(/\s+/g, '_').toLowerCase();
    const logData = {
      id: Date.now().toString(),
      date: currentDate,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      unit: unit,
      timestamp: Date.now()
    };
    
    setHistory(function(prev) {
      const newHistory = prev.concat(logData);
      localStorage.setItem(key, JSON.stringify(newHistory));
      return newHistory;
    });

    setIsResting(true);
  }

  function handleRestComplete() {
    setIsResting(false);
    setActiveSet(function(prev) { return prev + 1; });
  }

  function handleDateChange(e) {
    const newVal = e.target.value;
    setCalendarDate(newVal);
    if (newVal) {
      const parts = newVal.split('-');
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' };
      setCurrentDate(dateObj.toLocaleDateString('en-US', options).toUpperCase());
    }
  }

  function clearInputs() {
    setWeight("");
    setReps("");
  }

  function handleDeleteSet(idToDelete) {
    if (!idToDelete) return;
    const key = "ultimatum_history_" + exerciseName.replace(/\s+/g, '_').toLowerCase();
    setHistory(function(prev) {
      const newHistory = prev.filter(function(item) {
        return item.id !== idToDelete;
      });
      localStorage.setItem(key, JSON.stringify(newHistory));
      return newHistory;
    });
  }

  // Calculate chart data for GRAPH
  let chartData = [];
  if (history.length > 0) {
    // Group by date and calculate max 1RM per date
    const dailyData = {};
    for (let i = 0; i < history.length; i++) {
      const item = history[i];
      // Epley Formula: 1RM = Weight * (1 + Reps/30)
      const estimated1RM = item.weight * (1 + (item.reps / 30));
      
      const dateParts = item.date.split(",");
      const shortDate = dateParts.length > 1 ? dateParts[1].trim() : item.date;

      if (!dailyData[shortDate] || dailyData[shortDate] < estimated1RM) {
        dailyData[shortDate] = estimated1RM;
      }
    }

    const dates = Object.keys(dailyData);
    for (let i = 0; i < dates.length; i++) {
      chartData.push({
        date: dates[i],
        value: Math.round(dailyData[dates[i]])
      });
    }
  }

  // Filter today's sets for TRACK
  const todaysSets = history.filter(function(item) {
    return item.date === currentDate;
  });

  // Group by date for HISTORY
  const historyByDate = {};
  for (let i = 0; i < history.length; i++) {
    const item = history[i];
    if (!historyByDate[item.date]) {
      historyByDate[item.date] = [];
    }
    historyByDate[item.date].push(item);
  }
  const sortedDates = Object.keys(historyByDate).sort(function(a, b) {
    const maxA = Math.max.apply(null, historyByDate[a].map(function(item) { return item.timestamp || 0; }));
    const maxB = Math.max.apply(null, historyByDate[b].map(function(item) { return item.timestamp || 0; }));
    return maxB - maxA;
  });

  return (
    <div className="w-full max-w-2xl mx-auto bg-black border border-neutral-800 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col h-[90vh]">
      
      {/* HEADER */}
      <div className="p-4 md:p-6 border-b border-neutral-900 bg-neutral-950/80 flex flex-col justify-between shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start w-full gap-4">
          <div className="flex-1 w-full">
            <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-red-500 mb-1 flex items-center gap-2">
              {props.onClose && (
                <button onClick={props.onClose} className="text-neutral-500 hover:text-white transition-colors">◀ BACK</button>
              )}
              {props.onClose && <span>/</span>}
              TRACKING
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-white break-words">
              {exerciseName}
            </h2>
            <div className="mt-3">
              <input 
                type="date"
                value={calendarDate}
                onChange={handleDateChange}
                className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded px-3 py-1.5 text-xs font-bold uppercase tracking-widest outline-none focus:border-red-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 shrink-0">
            <div className="flex bg-neutral-900 rounded border border-neutral-800 overflow-hidden">
              <button 
                onClick={function() { setUnit("LBS"); }}
                className={"px-3 py-1.5 text-[10px] font-black tracking-widest transition-colors " + (unit === "LBS" ? "bg-white text-black" : "text-neutral-500 hover:text-white")}
              >
                LBS
              </button>
              <button 
                onClick={function() { setUnit("KG"); }}
                className={"px-3 py-1.5 text-[10px] font-black tracking-widest transition-colors " + (unit === "KG" ? "bg-white text-black" : "text-neutral-500 hover:text-white")}
              >
                KG
              </button>
            </div>
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest bg-neutral-900 px-2 py-1 rounded">
              SET {activeSet}
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-neutral-800 bg-neutral-950 shrink-0">
        <button 
          onClick={function() { setActiveTab("TRACK"); }}
          className={"flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 " + (activeTab === "TRACK" ? "border-red-500 text-white bg-neutral-900/50" : "border-transparent text-neutral-500 hover:bg-neutral-900/30 hover:text-white")}
        >
          Track
        </button>
        <button 
          onClick={function() { setActiveTab("HISTORY"); }}
          className={"flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 " + (activeTab === "HISTORY" ? "border-red-500 text-white bg-neutral-900/50" : "border-transparent text-neutral-500 hover:bg-neutral-900/30 hover:text-white")}
        >
          History
        </button>
        <button 
          onClick={function() { setActiveTab("GRAPH"); }}
          className={"flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 " + (activeTab === "GRAPH" ? "border-red-500 text-white bg-neutral-900/50" : "border-transparent text-neutral-500 hover:bg-neutral-900/30 hover:text-white")}
        >
          Graph
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-neutral-950/20 relative">
        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div 
              key="rest"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-6"
            >
              <RestTimer initialTime={180} onComplete={handleRestComplete} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="p-4 md:p-6">
          {/* TRACK TAB */}
          {activeTab === "TRACK" && (
            <motion.div 
              key="track"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stepper Inputs */}
              <div className="space-y-4">
                {/* Weight */}
                <div>
                  <div className="border-b-2 border-red-500 pb-1 mb-3">
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">WEIGHT ({unit.toLowerCase()})</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <button 
                      onClick={function() { setWeight(Math.max(0, (parseFloat(weight) || 0) - 2.5)); }}
                      className="w-14 h-12 md:w-16 shrink-0 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-2xl font-bold text-white transition-colors"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      value={weight}
                      onChange={function(e) { 
                        const val = e.target.value;
                        setWeight(val === "" ? "" : (parseFloat(val) || 0)); 
                      }}
                      className="flex-1 w-full min-w-0 h-12 bg-transparent text-3xl font-black text-white text-center outline-none border-b border-neutral-800 focus:border-red-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={function() { setWeight((parseFloat(weight) || 0) + 2.5); }}
                      className="w-14 h-12 md:w-16 shrink-0 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-2xl font-bold text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Reps */}
                <div>
                  <div className="border-b-2 border-red-500 pb-1 mb-3 mt-6">
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">REPS</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <button 
                      onClick={function() { setReps(Math.max(0, (parseInt(reps) || 0) - 1)); }}
                      className="w-14 h-12 md:w-16 shrink-0 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-2xl font-bold text-white transition-colors"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      value={reps}
                      onChange={function(e) { 
                        const val = e.target.value;
                        setReps(val === "" ? "" : (parseInt(val) || 0)); 
                      }}
                      className="flex-1 w-full min-w-0 h-12 bg-transparent text-3xl font-black text-white text-center outline-none border-b border-neutral-800 focus:border-red-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={function() { setReps((parseInt(reps) || 0) + 1); }}
                      className="w-14 h-12 md:w-16 shrink-0 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-2xl font-bold text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleLogSet}
                  disabled={!weight || !reps || parseFloat(weight) <= 0 || parseInt(reps) <= 0}
                  className="flex-[2] py-4 bg-red-600 hover:bg-red-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-lg text-sm font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] disabled:shadow-none"
                >
                  SAVE
                </button>
                <button 
                  onClick={clearInputs}
                  className="flex-1 py-4 bg-transparent border border-neutral-700 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg text-sm font-black uppercase tracking-widest transition-colors"
                >
                  CLEAR
                </button>
              </div>

              {/* Today's Logged Sets */}
              {todaysSets.length > 0 && (
                <div className="mt-8 space-y-2">
                  {todaysSets.map(function(item, idx) {
                    return (
                      <div key={item.id || ("today-" + idx)} className="flex justify-between items-center py-3 border-b border-neutral-800/50">
                        <div className="flex items-center gap-4">
                          <span className="w-6 h-6 bg-neutral-900 text-neutral-400 flex items-center justify-center rounded text-xs font-bold">{idx + 1}</span>
                          <span className="text-lg font-bold text-white">{item.weight} <span className="text-xs text-neutral-500">{item.unit.toLowerCase()}</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-bold text-white">
                            {item.reps} <span className="text-xs text-neutral-500">reps</span>
                          </div>
                          {item.id && (
                            <button 
                              onClick={function() { handleDeleteSet(item.id); }}
                              className="w-6 h-6 flex items-center justify-center rounded text-neutral-600 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Delete Set"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "HISTORY" && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {sortedDates.length > 0 ? (
                sortedDates.map(function(dateStr) {
                  return (
                    <div key={dateStr} className="space-y-2">
                      <div className="border-b-2 border-red-500 pb-1 mb-2">
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{dateStr}</span>
                      </div>
                      {historyByDate[dateStr].map(function(item, idx) {
                        return (
                          <div key={item.id || (dateStr + "-" + idx)} className="flex justify-between items-center py-2 px-2 hover:bg-white/5 rounded transition-colors">
                            <span className="text-base font-bold text-white pl-4">{item.weight} <span className="text-[10px] text-neutral-500">{item.unit.toLowerCase()}</span></span>
                            <div className="flex items-center gap-3 pr-2">
                              <span className="text-base font-bold text-white">{item.reps} <span className="text-[10px] text-neutral-500">reps</span></span>
                              {item.id && (
                                <button 
                                  onClick={function() { handleDeleteSet(item.id); }}
                                  className="w-5 h-5 flex items-center justify-center rounded text-neutral-700 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                  title="Delete Set"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">No history recorded yet</span>
                </div>
              )}
            </motion.div>
          )}

          {/* GRAPH TAB */}
          {activeTab === "GRAPH" && (
            <motion.div 
              key="graph"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 h-full flex flex-col min-h-[300px]"
            >
              <div className="flex justify-between items-center">
                <div className="text-[11px] font-black text-white uppercase tracking-widest border-b-2 border-red-500 pb-1">
                  ESTIMATED 1RM
                </div>
              </div>
              
              {chartData.length > 1 ? (
                <div className="flex-1 w-full relative min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                      <XAxis dataKey="date" stroke="#525252" tick={{ fill: '#525252', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} stroke="#525252" tick={{ fill: '#525252', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', borderColor: '#262626', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#ef4444' }}
                        cursor={{ stroke: '#404040', strokeWidth: 1 }}
                        formatter={function(value) { return [value + " " + unit, "Est. 1RM"]; }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#dc2626" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#000', stroke: '#dc2626', strokeWidth: 2 }} 
                        activeDot={{ r: 6, fill: '#dc2626', stroke: '#000', strokeWidth: 2 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center min-h-[250px]">
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest text-center">Log at least two separate days<br/>to generate graph</span>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
