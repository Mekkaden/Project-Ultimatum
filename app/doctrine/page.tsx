"use client";

import { motion } from "framer-motion";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldAlert, TrendingUp, Target, RefreshCcw, Activity, Heart, ArrowRight } from "lucide-react";
import DecryptedText from "../../components/DecryptedText";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700", "900"] });

const DOCTRINE_PRINCIPLES = [
  {
    id: "tension",
    title: "Mechanical Tension",
    description: "This is the primary driver of muscle growth. It is achieved by training close to failure (ideally 1 rep in reserve). Moving weight without tension is cardio, not bodybuilding.",
    icon: ShieldAlert,
    accent: "text-red-500",
    border: "border-red-900/50"
  },
  {
    id: "progression",
    title: "Progression",
    description: "Consistent overload—increasing weight or repetitions—is essential for continued gains. Logging workouts is critical for tracking this. You cannot manage what you do not measure.",
    icon: TrendingUp,
    accent: "text-blue-500",
    border: "border-blue-900/50"
  },
  {
    id: "selection",
    title: "Exercise Selection",
    description: "Focus on exercises that target the correct movement pattern, offer stability, are joint-friendly, and allow for progressive overload. Ditch the circus acts.",
    icon: Target,
    accent: "text-emerald-500",
    border: "border-emerald-900/50"
  },
  {
    id: "rep-range",
    title: "Rep Range",
    description: "A range of 4–10 reps is recommended as the \"sweet spot\" for balance between loading, efficiency, and recovery. Heavier loads recruit maximal muscle fibers instantly.",
    icon: RefreshCcw,
    accent: "text-white",
    border: "border-neutral-700"
  },
  {
    id: "technique",
    title: "Technique and Rest",
    description: "Lift with a fast concentric and controlled eccentric phase. Rest for 2.5–5 minutes between sets, or as long as needed to be fully recovered. Fatigue masks fitness.",
    icon: Activity,
    accent: "text-purple-500",
    border: "border-purple-900/50"
  },
  {
    id: "volume",
    title: "Volume",
    description: "A baseline of 3–10 direct sets per muscle group per week is recommended for those training close to failure. More is not better; better is better.",
    icon: ShieldAlert,
    accent: "text-orange-500",
    border: "border-orange-900/50"
  },
  {
    id: "cardio",
    title: "Cardio",
    description: "It is a supplemental tool for fat loss and serves broader health benefits. 150 minutes of low-to-moderate intensity per week is a good baseline.",
    icon: Heart,
    accent: "text-pink-500",
    border: "border-pink-900/50"
  }
];

export default function DoctrinePage() {
  const router = useRouter();
  const { status } = useSession();

  const handleInitiate = () => {
    router.push("/campaign");
  };

  return (
    <main className={`relative min-h-screen w-full bg-black text-white py-24 px-6 overflow-x-hidden ${montserrat.className}`}>
      
      {/* Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src="/rivercover.jpg" 
          alt="River Background" 
          className="w-full h-full object-cover object-center grayscale mix-blend-overlay"
        />
        {/* Smooth cinematic gradients to blend into the black background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black"></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20 w-full"
        >
          <div className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            <DecryptedText
              text="THE DOCTRINE"
              speed={60}
              maxIterations={15}
              characters="01!@#$%^&*?"
              animateOn="view"
            />
          </div>
          <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light">
            Read and assimilate the core principles of Project Ultimatum. Ignorance of these laws will result in stagnation, injury, and failure.
          </p>
        </motion.div>

        {/* Principles Feed */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-24">
          {DOCTRINE_PRINCIPLES.map((principle, index) => {
            const Icon = principle.icon;
            
            return (
              <motion.div
                key={principle.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
                className={`w-full h-full bg-neutral-900/40 backdrop-blur-md border ${principle.border} rounded-xl p-5 flex flex-col gap-4 items-start shadow-xl hover:bg-neutral-900/60 transition-colors duration-300 ${index === DOCTRINE_PRINCIPLES.length - 1 ? 'md:col-span-2 md:w-1/2 md:mx-auto' : ''}`}
              >
                <div className={`p-3 rounded-lg bg-black/50 border border-white/5 flex-shrink-0 ${principle.accent}`}>
                  <Icon size={24} strokeWidth={2} />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-1">
                    Principle 0{index + 1}
                  </div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-wider mb-2 text-white">
                    {principle.title}
                  </h3>
                  <p className="text-neutral-400 leading-relaxed text-xs md:text-sm font-medium">
                    {principle.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full flex justify-center pb-20"
        >
          <button
            onClick={handleInitiate}
            className="group relative px-8 md:px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-sm md:text-base rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] hover:bg-neutral-200 transition-all duration-300 flex items-center gap-4 overflow-hidden"
          >
            <span>I Understand - Initiate Campaign</span>
            <ArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
          </button>
        </motion.div>

      </div>
    </main>
  );
}
