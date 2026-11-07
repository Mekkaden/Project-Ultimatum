"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { montserrat } from "@/app/fonts";
import { useRouter } from "next/navigation";
import { useOfflineSession } from "@/lib/useOfflineSession";
import { ShieldAlert, TrendingUp, Target, RefreshCcw, Activity, Heart } from "lucide-react";

const DOCTRINE_PRINCIPLES = [
  {
    id: "tension",
    title: "Mechanical Tension",
    description: "This is the primary driver of muscle growth. It is achieved by training close to failure (ideally 1 rep in reserve). Moving weight without tension is cardio, not bodybuilding.",
    icon: ShieldAlert,
    color: "#4A4A50", // Dark Slate
  },
  {
    id: "progression",
    title: "Progression",
    description: "Consistent overload—increasing weight or repetitions—is essential for continued gains. Logging workouts is critical for tracking this. You cannot manage what you do not measure.",
    icon: TrendingUp,
    color: "#524C4E", // Deep Taupe
  },
  {
    id: "selection",
    title: "Exercise Selection",
    description: "Focus on exercises that target the correct movement pattern, offer stability, are joint-friendly, and allow for progressive overload. Ditch the circus acts.",
    icon: Target,
    color: "#485056", // Slate Blue-ish
  },
  {
    id: "rep-range",
    title: "Rep Range",
    description: "A range of 4–10 reps is recommended as the \"sweet spot\" for balance between loading, efficiency, and recovery. Heavier loads recruit maximal muscle fibers instantly.",
    icon: RefreshCcw,
    color: "#56504C", // Warm Espresso
  },
  {
    id: "technique",
    title: "Technique and Rest",
    description: "Lift with a fast concentric and controlled eccentric phase. Rest for 2.5–5 minutes between sets, or as long as needed to be fully recovered. Fatigue masks fitness.",
    icon: Activity,
    color: "#4B5350", // Desaturated Emerald
  },
  {
    id: "volume",
    title: "Volume",
    description: "A baseline of 3–10 direct sets per muscle group per week is recommended for those training close to failure. More is not better; better is better.",
    icon: ShieldAlert,
    color: "#504850", // Muted Plum
  },
  {
    id: "cardio",
    title: "Cardio",
    description: "It is a supplemental tool for fat loss and serves broader health benefits. 150 minutes of low-to-moderate intensity per week is a good baseline.",
    icon: Heart,
    color: "#555154", // Charcoal
  }
];

const getCoordinatesForAngle = (angle: number, radius: number) => {
  const rad = (Math.PI * angle) / 180;
  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius
  };
};

const WheelSlice = ({ index, total, innerRadius, outerRadius, gapAngle, color, isSelected, onClick, number }) => {
  const angle = 360 / total;
  const centerAngle = -90 + (index * angle);
  
  // Calculate gap
  const sweep = angle - gapAngle;
  const startAngle = centerAngle - (sweep / 2);
  const endAngle = centerAngle + (sweep / 2);
  
  const p1 = getCoordinatesForAngle(startAngle, outerRadius);
  const p2 = getCoordinatesForAngle(endAngle, outerRadius);
  const p3 = getCoordinatesForAngle(endAngle, innerRadius);
  const p4 = getCoordinatesForAngle(startAngle, innerRadius);

  const largeArcFlag = sweep > 180 ? 1 : 0;

  const path = `
    M ${p1.x} ${p1.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}
    L ${p3.x} ${p3.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y}
    Z
  `;
  
  // Center point for text
  const textRadius = innerRadius + (outerRadius - innerRadius) / 2;
  const textPos = getCoordinatesForAngle(centerAngle, textRadius);

  // If selected, translate it slightly outwards
  const offset = isSelected ? 12 : 0;
  const transform = `translate(${Math.cos(centerAngle * Math.PI/180) * offset}px, ${Math.sin(centerAngle * Math.PI/180) * offset}px)`;

  return (
    <g 
      onClick={onClick}
      style={{ transform, transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
      className="cursor-pointer group"
    >
      <path 
        d={path} 
        fill={color}
        stroke={color}
        strokeWidth={12} // Creates the beautifully rounded corners
        strokeLinejoin="round"
        className="transition-opacity duration-300 group-hover:opacity-90"
        opacity={isSelected ? 1 : 0.4}
      />
      <text 
        x={textPos.x} 
        y={textPos.y} 
        textAnchor="middle" 
        dominantBaseline="middle" 
        fill={isSelected ? "#ffffff" : "#000000"}
        className="text-xl md:text-2xl font-black pointer-events-none transition-colors duration-300"
        style={{ opacity: isSelected ? 1 : 0.5 }}
      >
        {number}
      </text>
    </g>
  );
};

export default function DoctrinePage() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedPrinciple = DOCTRINE_PRINCIPLES[selectedIndex];
  const SelectedIcon = selectedPrinciple.icon;

  const handleInitiate = () => {
    router.push("/settings");
  };

  return (
    <main className={`relative w-full bg-[#111111] pt-8 pb-32 md:py-32 overflow-hidden flex flex-col items-center min-h-[100dvh] ${montserrat.className}`}>
      
      {/* Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="w-full h-full"
        >
          <img 
            src="/new%20images/DOCTORINE.jpg" 
            alt="River Background" 
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111] via-[#111111]/80 to-[#111111]"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center max-w-4xl mx-auto px-6 h-full">
        {/* Title Section */}
        <div className="w-full mb-12 flex flex-col items-center text-center">
          <motion.h2 
            className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Doctrine
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="mt-3 text-neutral-400 text-xs md:text-sm leading-relaxed font-medium max-w-sm"
          >
            Read and assimilate the core principles. Ignorance of these laws will result in stagnation and failure.
          </motion.p>
        </div>

        {/* Interactive SVG Wheel */}
        <div className="relative w-full max-w-[320px] md:max-w-[400px] aspect-square mb-4 md:mb-8 flex items-center justify-center">
          <svg viewBox="-140 -140 280 280" className="w-full h-full overflow-visible drop-shadow-2xl">
            {DOCTRINE_PRINCIPLES.map((principle, idx) => (
              <WheelSlice
                key={principle.id}
                index={idx}
                total={DOCTRINE_PRINCIPLES.length}
                innerRadius={30}
                outerRadius={110}
                gapAngle={8}
                color={principle.color}
                isSelected={selectedIndex === idx}
                onClick={() => setSelectedIndex(idx)}
                number={idx + 1}
              />
            ))}
          </svg>
        </div>

        {/* Dynamic Content Area */}
        <div className="w-full flex-grow flex flex-col items-center justify-start min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPrinciple.id}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ willChange: "opacity, transform" }}
              className="flex flex-col items-center text-center w-full max-w-lg"
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg border border-white/5"
                style={{ backgroundColor: selectedPrinciple.color }}
              >
                <SelectedIcon size={20} className="text-white" />
              </div>
              
              <h3 className="text-xl md:text-3xl font-black text-white mb-3 uppercase tracking-widest">
                {selectedPrinciple.title}
              </h3>
              
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-medium">
                {selectedPrinciple.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Final Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-auto w-full max-w-[200px]"
        >
          <button
            className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white text-white hover:text-black font-bold uppercase tracking-widest text-xs md:text-sm rounded-full transition-all duration-300"
            onClick={handleInitiate}
          >
            Acknowledge
          </button>
        </motion.div>
      </div>
    </main>
  );
}
