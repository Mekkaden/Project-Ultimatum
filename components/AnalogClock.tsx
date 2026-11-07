"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AnalogClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-black/60 backdrop-blur-md shadow-[inset_0_4px_20px_rgba(0,0,0,0.8),_0_2px_15px_rgba(255,255,255,0.02)] border border-white/5 flex items-center justify-center shrink-0" />
    );
  }

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDegrees = seconds * 6;
  const minuteDegrees = minutes * 6 + seconds * 0.1;
  const hourDegrees = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-black/60 backdrop-blur-md shadow-[inset_0_8px_32px_rgba(0,0,0,1),_0_2px_10px_rgba(255,255,255,0.02)] border border-white/5 flex items-center justify-center shrink-0">
      {/* Markers */}
      <div className="absolute top-3 w-[2px] h-3 bg-white/20 rounded-full" />
      <div className="absolute bottom-3 w-[2px] h-3 bg-white/20 rounded-full" />
      <div className="absolute left-3 w-3 h-[2px] bg-white/20 rounded-full" />
      <div className="absolute right-3 w-3 h-[2px] bg-white/20 rounded-full" />

      <div className="absolute top-[18%] left-[18%] w-1 h-1 bg-white/10 rounded-full" />
      <div className="absolute top-[18%] right-[18%] w-1 h-1 bg-white/10 rounded-full" />
      <div className="absolute bottom-[18%] left-[18%] w-1 h-1 bg-white/10 rounded-full" />
      <div className="absolute bottom-[18%] right-[18%] w-1 h-1 bg-white/10 rounded-full" />

      {/* Hands */}
      <motion.div 
        className="absolute w-1.5 h-10 md:h-12 bg-white rounded-full origin-bottom"
        style={{ rotate: hourDegrees, bottom: "50%" }}
        transition={{ type: "tween", duration: 0.1 }}
      />
      
      <motion.div 
        className="absolute w-1 h-16 md:h-20 bg-neutral-400 rounded-full origin-bottom"
        style={{ rotate: minuteDegrees, bottom: "50%" }}
        transition={{ type: "tween", duration: 0.1 }}
      />
      
      <motion.div 
        className="absolute w-[2px] h-16 md:h-20 bg-[#0ea5e9] rounded-full origin-bottom shadow-[0_0_8px_rgba(14,165,233,0.8)]"
        style={{ rotate: secondDegrees, bottom: "50%" }}
        transition={{ type: "tween", duration: 0.1 }}
      />

      {/* Center Dot */}
      <div className="absolute w-3 h-3 bg-white rounded-full z-10 shadow-md flex items-center justify-center">
        <div className="w-1 h-1 bg-[#0ea5e9] rounded-full" />
      </div>
    </div>
  );
}
