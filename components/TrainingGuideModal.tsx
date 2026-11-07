import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Battery, Target, RefreshCw, HeartPulse, Activity, ListTodo, StretchHorizontal, ArrowDown, Info } from 'lucide-react';

interface TrainingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "resistance" | "cardio" | "habits" | "flexibility";
}

const Card = ({ icon: Icon, title, description }: { icon: any, title: string, description: string | React.ReactNode }) => (
  <div className="bg-black/60 border border-white/10 rounded-[2.5rem] p-6 flex items-start gap-4 transition-transform hover:scale-[1.02]">
    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
      <Icon className="text-white" size={18} />
    </div>
    <div className="flex flex-col gap-1.5 pt-0.5">
      <h3 className="text-white text-lg font-semibold tracking-tight">{title}</h3>
      <div className="text-neutral-400 text-[14px] leading-relaxed pr-2">{description}</div>
    </div>
  </div>
);

import { useHardwareBack } from '@/lib/useHardwareBack';

export const TrainingGuideModal: React.FC<TrainingGuideModalProps> = ({ isOpen, onClose, mode = "resistance" }) => {
  useHardwareBack(isOpen, onClose);
  const [activeTab, setActiveTab] = React.useState<"tutorial" | "concepts" | "calisthenics">("tutorial");
  const [isCalisthenicsProtocol, setIsCalisthenicsProtocol] = React.useState(false);
  
  // Reset tab when mode changes or modal opens
  React.useEffect(() => {
    setActiveTab("tutorial");
    const directive = localStorage.getItem("ultimatum_directive");
    if (directive === "calisthenics") {
      setIsCalisthenicsProtocol(true);
    }
  }, [isOpen, mode]);
  const renderResistanceContent = () => (
    <div className="flex flex-col gap-4 pb-20">
      <div className="flex bg-white/5 backdrop-blur-xl p-1 rounded-full mb-2 border border-white/10 w-full max-w-sm mx-auto">
        <button 
          onClick={() => setActiveTab('tutorial')}
          className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'tutorial' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Tutorial
        </button>
        <button 
          onClick={() => setActiveTab('concepts')}
          className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'concepts' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Concepts
        </button>
        {isCalisthenicsProtocol && (
          <button 
            onClick={() => setActiveTab('calisthenics')}
            className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'calisthenics' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            Calisthenics
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'tutorial' ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'tutorial' ? 10 : -10 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4"
        >
          {activeTab === 'tutorial' ? (
            <>
              <Card 
                icon={Target} 
                title="The Routine Interface" 
                description="This is your routine page. Use this interface to log your workouts and meticulously track your progress over time." 
              />
              <Card 
                icon={TrendingUp} 
                title="Crucial Data" 
                description="Logging your workout accurately is essential—it directly feeds the Insights panel, which generates your analytics and progress metrics." 
              />
              <Card 
                icon={ListTodo} 
                title="How to Execute" 
                description="First, click on your current day and tap 'Get Started'. Then, choose your first exercise." 
              />
              <Card 
                icon={Activity} 
                title="Log Your Sets" 
                description="For each set, precisely log your Weight, Reps, and RIR (Reps In Reserve). Use the built-in Rest Timer between sets, then tap 'Save'." 
              />
            </>
          ) : activeTab === 'concepts' ? (
            <>
              <Card 
                icon={TrendingUp} 
                title="Double Progression" 
                description={<>Start with 4 reps with a given weight. Increase your reps session-by-session up to 10 reps. Once you hit 10 reps, add weight and drop back to 4 reps. Repeat indefinitely.</>} 
              />
              <Card 
                icon={ArrowDown} 
                title="Top & Back-off Sets" 
                description="After your warmups, your 1st working set (Top Set) should be the heaviest. For subsequent sets (Back-off Sets), reduce the weight by ~10-15% so you can maintain the target rep range." 
              />
              <Card 
                icon={Battery} 
                title="What is RIR?" 
                description={<>
                  RIR (Reps In Reserve) measures how many more reps you could physically complete before muscular failure.<br/><br/>
                  <strong className="text-white/90">Failure</strong>: You failed midway through the rep.<br/>
                  <strong className="text-white/90">0 RIR</strong>: No more reps possible, but you completed the last one.<br/>
                  <strong className="text-white/90">1 RIR</strong>: You could grind out exactly 1 more rep.<br/>
                  <strong className="text-white/90">2 RIR</strong>: You could do exactly 2 more reps.
                </>} 
              />
              <Card 
                icon={Target} 
                title="Precision Logging" 
                description="Log exact weight and reps. Don't cheat your RIR. Tap 'Track' only after completing all sets." 
              />
            </>
          ) : (
            <>
              <Card 
                icon={RefreshCw} 
                title="The Tier System" 
                description="Calisthenics progression isn't about adding weight—it's about manipulating leverage. Every movement category is divided into ascending difficulty tiers (e.g., Push-ups → Diamond Push-ups → Archer Push-ups)." 
              />
              <Card 
                icon={TrendingUp} 
                title="Progression Trigger" 
                description="When you first select a movement, you start at Tier 1. Focus on increasing your reps each session. Once you can comfortably perform 15-20 perfect reps across all sets, you graduate to the next tier." 
              />
              <Card 
                icon={Target} 
                title="Execution Over Ego" 
                description="Unlike weights, bad form in calisthenics completely alters the intended muscle stimulus. Range of motion and strict control are non-negotiable. Only count perfect reps." 
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const renderCardioContent = () => (
    <div className="flex flex-col gap-4 pb-20">
      <div className="flex bg-white/5 backdrop-blur-xl p-1 rounded-full mb-2 border border-white/10 w-full max-w-sm mx-auto">
        <button 
          onClick={() => setActiveTab('tutorial')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'tutorial' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Tutorial
        </button>
        <button 
          onClick={() => setActiveTab('concepts')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'concepts' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Concepts
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'tutorial' ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'tutorial' ? 10 : -10 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4"
        >
          {activeTab === 'tutorial' ? (
            <>
              <Card 
                icon={Target} 
                title="The Cardio Interface" 
                description="This is your dedicated cardio tracker. There are no sets or reps to worry about—just pure duration." 
              />
              <Card 
                icon={Activity} 
                title="How to Execute" 
                description="Simply complete your cardio session, enter the total number of minutes you performed, and hit save." 
              />
              <Card 
                icon={TrendingUp} 
                title="Crucial Data" 
                description="Logging your minutes accurately directly feeds the Insights panel so you can monitor your weekly volume goals." 
              />
            </>
          ) : (
            <>
              <Card 
                icon={HeartPulse} 
                title="The Directive (Zone 2)" 
                description="The primary goal is accumulating weekly minutes of steady-state cardio (Zone 2). You should be working hard enough to sweat, but still able to hold a conversation. Consistency and total weekly volume matter vastly more than high intensity." 
              />
              <Card 
                icon={Activity} 
                title="What Qualifies" 
                description={<>Any sustained, uninterrupted activity that keeps your heart rate elevated.<br/><br/><strong className="text-white/90">Examples:</strong> Brisk incline walking, cycling, swimming, or rowing. Avoid stopping and starting; maintain a continuous pace.</>} 
              />
              <Card 
                icon={Target} 
                title="Timing & Interference" 
                description={<>Cardio can blunt muscle growth if programmed poorly.<br/><br/><strong className="text-white/90">Rule 1:</strong> Never do cardio immediately before lifting. It drains systemic energy.<br/><strong className="text-white/90">Rule 2:</strong> Do it immediately after lifting, or ideally, on complete rest days.</>} 
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const renderHabitsContent = () => (
    <div className="flex flex-col gap-4 pb-20">
      <div className="flex bg-white/5 backdrop-blur-xl p-1 rounded-full mb-2 border border-white/10 w-full max-w-sm mx-auto">
        <button 
          onClick={() => setActiveTab('tutorial')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'tutorial' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Tutorial
        </button>
        <button 
          onClick={() => setActiveTab('concepts')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'concepts' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Concepts
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'tutorial' ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'tutorial' ? 10 : -10 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4"
        >
          {activeTab === 'tutorial' ? (
            <>
              <Card 
                icon={Target} 
                title="The To-Do Interface" 
                description="This is your daily directive interface. Create your active protocols by clicking on the '+ NEW DIRECTIVE' button." 
              />
              <Card 
                icon={Activity} 
                title="Execution" 
                description="Once you complete a task, check it off. Your daily directives reset automatically the next day." 
              />
            </>
          ) : (
            <>
              <Card 
                icon={ListTodo} 
                title="Daily Directives" 
                description="Add custom tasks and protocols to your daily feed. Check them off daily to build momentum." 
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const renderFlexibilityContent = () => (
    <div className="flex flex-col gap-4 pb-20">
      <div className="flex bg-white/5 backdrop-blur-xl p-1 rounded-full mb-2 border border-white/10 w-full max-w-sm mx-auto">
        <button 
          onClick={() => setActiveTab('tutorial')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'tutorial' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Tutorial
        </button>
        <button 
          onClick={() => setActiveTab('concepts')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'concepts' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Concepts
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'tutorial' ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'tutorial' ? 10 : -10 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4"
        >
          {activeTab === 'tutorial' ? (
            <>
              <Card 
                icon={Target} 
                title="The Flexibility Interface" 
                description="This is your dedicated stretching protocol. It provides structured mobility routines tailored to different skill levels." 
              />
              <Card 
                icon={Activity} 
                title="How to Execute" 
                description="Simply click on 'Get Started' for your current day, follow the prescribed stretches, and log your completion." 
              />
            </>
          ) : (
            <>
              <Card 
                icon={StretchHorizontal} 
                title="Contract & Relax" 
                description={<><strong className="text-white/90">1. Contract</strong>: Flex the stretched muscle for 5 seconds.<br/><strong className="text-white/90">2. Relax & Restretch</strong>: Sink deeper for 5 deep breaths.</>} 
              />
              <Card 
                icon={Info} 
                title="Lifting is Stretching" 
                description="If you execute your strength movements with a full, deep range of motion, you are actively stretching your muscles under load. Do not obsess over dedicated flexibility sessions if your lifting mechanics are pristine, though light stretching remains an excellent tool for general mobility and joint health." 
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex flex-col bg-black overflow-hidden"
        >
          {/* Decoded eagerly so the backdrop is painted with the panel instead of
              appearing a moment after it. */}
          <img
            src="/lock in/fdfds.avif"
            className="absolute inset-0 w-full h-full object-cover grayscale-[60%] opacity-60 pointer-events-none -z-10"
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="sync"
          />
          {/* Increased vignette effect */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, transparent 10%, rgba(0,0,0,0.9) 110%)" }} />

          <button 
            onClick={onClose}
            className="absolute top-8 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-lg"
          >
            <X size={18} />
          </button>

          <div className="relative z-10 flex-1 flex flex-col px-6 pt-16 h-full overflow-hidden">
            {/* Header Pill Removed */}


            {/* No staggered entrance: the content is present when the panel
                fades in, which keeps opening the guide instant. */}
            <h1 className="text-[2.75rem] leading-none font-semibold text-white tracking-tight mb-4">
              {mode === 'resistance' && "Training Directive"}
              {mode === 'cardio' && "Cardio Directive"}
              {mode === 'habits' && "Habits Directive"}
              {mode === 'flexibility' && "Flex Directive"}
            </h1>
            
            <p className="text-white/70 text-[16px] leading-relaxed mb-10 pr-4 font-medium">
              Master your protocols. Follow the directive exactly as prescribed.
            </p>

            {/* Scrollable Content */}
            <div 
              className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)] pb-10"
            >
              {mode === "resistance" && renderResistanceContent()}
              {mode === "cardio" && renderCardioContent()}
              {mode === "habits" && renderHabitsContent()}
              {mode === "flexibility" && renderFlexibilityContent()}
            </div>
            

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

