"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Dumbbell, Weight, Activity, Zap, Star } from "lucide-react";
import { Montserrat } from "next/font/google";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700", "900"] });

type Directive = "hypertrophy" | "strength" | "calisthenics" | "hybrid" | "premium" | null;

const DIRECTIVES = [
  {
    id: "hypertrophy",
    title: "THE TITAN",
    subtitle: "HYPERTROPHY",
    description: "I want to look aesthetic, build mass, and carve my physique.",
    icon: Dumbbell,
    image: "/focus/hypertrophy.webp",
    objectPosition: "center 20%",
    accentColor: "blue",
    borderColor: "border-blue-500",
    shadowColor: "hover:shadow-blue-500/20",
    activeBg: "bg-blue-500",
    activeText: "text-black",
  },
  {
    id: "strength",
    title: "THE JUGGERNAUT",
    subtitle: "STRENGTH",
    description: "I want to lift heavy fucking weight and maximize force production.",
    icon: Weight,
    image: "/focus/stregth.webp",
    objectPosition: "center bottom",
    accentColor: "red",
    borderColor: "border-red-500",
    shadowColor: "hover:shadow-red-500/20",
    activeBg: "bg-red-500",
    activeText: "text-black",
  },
  {
    id: "calisthenics",
    title: "THE MONK",
    subtitle: "CALISTHENICS",
    description: "I want to master my own bodyweight and learn elite techniques.",
    icon: Activity,
    image: "/focus/calistenics.jpg",
    objectPosition: "center center",
    accentColor: "emerald",
    borderColor: "border-emerald-500",
    shadowColor: "hover:shadow-emerald-500/20",
    activeBg: "bg-emerald-500",
    activeText: "text-black",
  },
  {
    id: "hybrid",
    title: "THE HYBRID",
    subtitle: "JACK OF ALL TRADES",
    description: "I don't know what to pick. I just want to look great, get strong, and move well.",
    icon: Zap,
    image: "/focus/hybrid.jpg",
    objectPosition: "center bottom",
    accentColor: "white",
    borderColor: "border-white",
    shadowColor: "hover:shadow-white/20",
    activeBg: "bg-white",
    activeText: "text-black",
  },
  {
    id: "premium",
    title: "THE ELITE",
    subtitle: "1:1 COACHING",
    description: "Work directly with me. Personalized plans, elite coaching, guaranteed results.",
    icon: Star,
    image: "/premium.jpg",
    objectPosition: "center center",
    accentColor: "red",
    borderColor: "border-red-500",
    shadowColor: "hover:shadow-red-500/20",
    activeBg: "bg-red-500",
    activeText: "text-white",
  },
];

interface Props {
  onComplete: (directive: string) => void;
}

export default function DirectiveSelection({ onComplete }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "cards">("intro");
  const [selected, setSelected] = useState<Directive>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [phase]); // Scroll to top when phase changes

  const handleConfirm = () => {
    if (selected) {
      onComplete(selected);
    }
  };

  return (
    <div className={`relative min-h-screen w-full bg-black flex flex-col items-center justify-center py-20 px-6 overflow-hidden ${montserrat.className}`}>
      <AnimatePresence mode="wait">
        
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-4xl flex flex-col items-center relative z-10"
          >
            {/* Text Header */}
            <div className="text-center mb-8 w-full">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                What do you truly need?
              </h2>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
                Periodization is the weapon of the elite. Choosing a focus does not mean sacrificing the rest. Hypertrophy builds strength. Strength builds density. Calisthenics builds coordination. You are simply choosing a primary directive for this training block.
              </p>
            </div>

            {/* Toji Image */}
            <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden relative border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] mb-12">
              <img 
                src="/toji.jpg" 
                alt="Toji"
                style={{ objectPosition: "center 30%" }}
                className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
            </div>

            {/* Proceed Button */}
            <button
              onClick={() => setPhase("cards")}
              className="px-10 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs md:text-sm rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] hover:bg-neutral-200 transition-all duration-300"
            >
              Select Directive
            </button>
          </motion.div>
        )}

        {phase === "cards" && (
          <motion.div
            key="cards"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-3xl flex flex-col items-center relative z-10"
          >
            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
              {DIRECTIVES.map((directive) => {
                const Icon = directive.icon;
                const isActive = selected === directive.id;

                return (
                  <div
                    key={directive.id}
                    onClick={() => setSelected(directive.id as Directive)}
                    className="w-full flex justify-center"
                  >
                    <CardContainer className="inter-var w-full h-full">
                      <CardBody className={`relative group/card cursor-pointer w-full h-full rounded-xl border-2 transition-all duration-300 flex flex-col p-3 md:p-4
                        ${isActive 
                          ? `${directive.activeBg} ${directive.borderColor} shadow-[0_0_40px_rgba(255,255,255,0.1)]` 
                          : `bg-neutral-900/40 border-neutral-800 ${directive.shadowColor} hover:${directive.borderColor}`
                        }
                      `}>
                        
                        <CardItem translateZ="100" className="w-full mb-3">
                          <div className="w-full aspect-square bg-neutral-950 rounded-xl overflow-hidden relative flex items-center justify-center border border-white/5">
                            <img src={directive.image} style={{ objectPosition: directive.objectPosition }} className="h-full w-full object-cover grayscale opacity-60 group-hover/card:opacity-100 group-hover/card:grayscale-0 transition-all duration-500" alt={directive.title} />
                          </div>
                        </CardItem>

                        <CardItem translateZ="50" className={`flex items-center gap-3 mb-2 ${isActive ? directive.activeText : "text-white"}`}>
                          <Icon size={24} strokeWidth={2} />
                          <div>
                            <div className={`text-[10px] font-bold tracking-[0.2em] mb-0.5 opacity-70 ${isActive ? directive.activeText : "text-neutral-400"}`}>
                              {directive.title}
                            </div>
                            <h3 className={`text-xl font-black uppercase tracking-wider ${isActive ? directive.activeText : "text-white"}`}>
                              {directive.subtitle}
                            </h3>
                          </div>
                        </CardItem>
                        
                        <CardItem translateZ="60" as="p" className={`text-xs leading-relaxed mt-auto ${isActive ? "text-black/80 font-medium" : "text-neutral-400 font-light"}`}>
                          {directive.description}
                        </CardItem>
                      </CardBody>
                    </CardContainer>
                  </div>
                );
              })}
            </div>

            {/* Confirmation Button */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mt-6 mb-2"
                >
                  <button
                    onClick={handleConfirm}
                    className="px-10 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs md:text-sm rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] hover:bg-neutral-200 transition-all duration-300"
                  >
                    Confirm Directive
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
