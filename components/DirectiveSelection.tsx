"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useHardwareBack } from "@/lib/useHardwareBack";
import { returnToOnboardingIntro } from "@/lib/onboarding";
import { Dumbbell, Weight, Activity, Zap, Star, ArrowLeft, AlertTriangle } from "lucide-react";
import { montserrat } from "@/app/fonts";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";

type Directive = "hypertrophy" | "strength" | "calisthenics" | "hybrid" | null;

const DIRECTIVES = [
  {
    id: "hypertrophy",
    title: "THE TITAN",
    subtitle: "HYPERTROPHY",
    description: "I want to look aesthetic, build mass, and carve my physique.",
    icon: Dumbbell,
    image: "/NEWCOVERS/jamesbody.png",
    objectPosition: "center 20%",
    accentColor: "white",
    borderColor: "border-white/50",
    shadowColor: "hover:shadow-white/20",
    activeBg: "bg-white/10",
    activeText: "text-white",
    badge: "POPULAR",
  },
  {
    id: "strength",
    title: "THE JUGGERNAUT",
    subtitle: "STRENGTH",
    description: "I want to move serious weight and maximize absolute force production.",
    icon: Weight,
    image: "/fsdfdjfsdffdsfs/file_00000000fcc081fa81b8e034009f864d.png",
    objectPosition: "center bottom",
    accentColor: "white",
    borderColor: "border-white/50",
    shadowColor: "hover:shadow-white/20",
    activeBg: "bg-white/10",
    activeText: "text-white",
    imageClassName: "brightness-[1.4] contrast-[1.2]",
  },
  {
    id: "calisthenics",
    title: "THE MONK",
    subtitle: "CALISTHENICS",
    description: "I want to master my own bodyweight and learn elite techniques.",
    icon: Activity,
    image: "/fsdfdjfsdffdsfs/file_00000000acc481fab2988a507a2b87c9.png",
    objectPosition: "center center",
    accentColor: "white",
    borderColor: "border-white/50",
    shadowColor: "hover:shadow-white/20",
    activeBg: "bg-white/10",
    activeText: "text-white",
    imageClassName: "brightness-[1.5] contrast-[1.2]",
  },
  {
    id: "hybrid",
    title: "THE HYBRID",
    subtitle: "JACK OF ALL TRADES",
    description: "I don't know what to pick. I just want to look great, get strong, and move well.",
    icon: Zap,
    image: "/newlyyy/athelete.png",
    objectPosition: "center 20%",
    accentColor: "white",
    borderColor: "border-white/50",
    shadowColor: "hover:shadow-white/20",
    activeBg: "bg-white/10",
    activeText: "text-white",
  },
];

interface Props {
  onComplete: (directive: string) => void;
  /** Leaves the flow for the screen before it. Omitted when there is none. */
  onGoBack?: () => void;
  isFastTrack?: boolean;
  isEditing?: boolean;
}

export default function DirectiveSelection({ onComplete, onGoBack, isFastTrack, isEditing }: Props) {
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

  const isIntro = phase === "intro";

  // "What do you truly need?" is the first screen a new user reads. Leaving it
  // must not strand them: Back returns to the screen that opened it (the
  // gatekeeper, or Settings when re-configuring) whether it comes from the
  // button or the phone. Once the directive cards are open, Back steps back to
  // the intro rather than skipping over it.
  const goBack = useCallback(() => {
    if (isEditing) {
      router.push("/settings");
      return true;
    }
    if (onGoBack && isIntro) {
      // Abandoning the flow (the landing page). Persisting a directive here
      // would later make the app believe setup is half-done.
      try {
        sessionStorage.removeItem("ultimatum_onboarding_step");
      } catch {}
      onGoBack();
      return true;
    }
    if (!isIntro) {
      setPhase("intro");
      return true;
    }
    const inOnboarding =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("fastTrack") === "true";
    if (!inOnboarding) return false; // Let a normal history pop happen.
    // The screen that opened this one is the onboarding intro ("What do you
    // truly need?"). Reading the Doctrine replaced the root entry with this
    // page, so history cannot pop back to it: reopen it explicitly.
    returnToOnboardingIntro("philosophy");
    return true;
  }, [isEditing, isIntro, onGoBack, router]);

  useHardwareBack(true, goBack);

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-center py-20 px-6 pb-64 md:pb-36 overflow-y-auto ${montserrat.className}`}>
      {/* Background Image with Grayscale */}
      <img src="/onboarding/photo-1591741543032-bf439b4fd46c.avif" className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0" alt="Background" />
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/60 pointer-events-none z-[1]"></div>
      {(isEditing || onGoBack || !isIntro) && (
        <button
          type="button"
          onClick={() => {
            goBack();
          }}
          aria-label={isEditing ? "Back to Settings" : isIntro ? "Back" : "Back to the introduction"}
          className="absolute top-6 left-6 z-[200] flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">
            {isEditing ? "Back to Settings" : "Back"}
          </span>
        </button>
      )}
      
      <AnimatePresence mode="wait">
        
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ willChange: "opacity" }}
            className="w-full max-w-4xl flex flex-col items-center relative z-10"
          >
            {/* Text Header */}
            <div className="text-center mb-8 w-full">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                What do you truly need?
              </h2>
              {isEditing && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 max-w-xl mx-auto flex gap-3 items-start text-left">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed uppercase tracking-widest">
                    Warning: Changing your primary directive will completely alter your protocol trajectory. Proceed with caution.
                  </p>
                </div>
              )}
              <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-3xl mx-auto drop-shadow-md font-medium">
                Periodization is the weapon of the elite. Choosing a focus does not mean sacrificing the rest. Hypertrophy builds strength. Strength builds density. Calisthenics builds coordination. You are simply choosing a primary directive for this training block.
              </p>
            </div>


            {/* Proceed Button */}
            <button
              onClick={() => setPhase("cards")}
              className="px-10 py-4 bg-white/10 border border-white/30 text-white font-bold uppercase tracking-[0.2em] text-xs md:text-sm rounded-full shadow-sm hover:shadow-md hover:bg-white hover:text-black transition-all duration-300"
            >
              Select Directive
            </button>
          </motion.div>
        )}

        {phase === "cards" && (
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            style={{ willChange: "opacity" }}
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
                      <CardBody className={`relative group/card cursor-pointer w-full h-full rounded-[2rem] border transition-all duration-[800ms] ease-out flex flex-col p-4 md:p-6 backdrop-blur-md
                        ${isActive 
                          ? `${directive.activeBg} ${directive.borderColor} shadow-xl scale-[1.02]` 
                          : `bg-black/40 border-white/10 hover:bg-black/60 hover:border-white/30 shadow-lg scale-100`
                        }
                      `}>
                        
                        <CardItem translateZ="100" className="w-full mb-4">
                          <div className="w-full aspect-square bg-black/50 rounded-[1.5rem] overflow-hidden relative flex items-center justify-center border border-white/10">
                            <img src={directive.image} style={{ objectPosition: directive.objectPosition }} className={`h-full w-full object-cover opacity-90 group-hover/card:opacity-100 transition-all duration-500 ${(directive as any).imageClassName || ""}`} alt={directive.title} />
                            {directive.badge && (
                              <div className="absolute top-3 right-3 px-2 py-0.5 bg-red-500/20 backdrop-blur-md text-white text-[9px] font-black tracking-widest uppercase rounded border border-red-500/30 shadow-sm">
                                {directive.badge}
                              </div>
                            )}
                          </div>
                        </CardItem>

                        <CardItem translateZ="50" className={`flex items-center gap-3 mb-2 ${isActive ? directive.activeText : "text-white"}`}>
                          <Icon size={24} strokeWidth={2} />
                          <div>
                            <div className={`text-[10px] font-bold tracking-[0.2em] mb-0.5 opacity-70 ${isActive ? directive.activeText : "text-neutral-300"}`}>
                              {directive.title}
                            </div>
                            <h3 className={`text-xl font-black uppercase tracking-wider ${isActive ? directive.activeText : "text-white"}`}>
                              {directive.subtitle}
                            </h3>
                          </div>
                        </CardItem>
                        
                        <CardItem translateZ="60" as="p" className={`text-xs leading-relaxed mt-auto ${isActive ? "text-white/90 font-medium" : "text-neutral-300 font-medium"}`}>
                          {directive.description}
                        </CardItem>
                      </CardBody>
                    </CardContainer>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Confirmation Button */}
      <AnimatePresence>
        {phase === "cards" && selected && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed bottom-28 md:bottom-12 left-1/2 -translate-x-1/2 z-[100] w-[80%] max-w-[250px]"
          >
            <button
              onClick={handleConfirm}
              className="px-6 py-3 w-full bg-white text-black font-bold uppercase tracking-[0.2em] text-xs md:text-sm rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_10px_50px_rgba(255,255,255,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Confirm</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
