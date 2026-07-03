import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProgressionModal: React.FC<ProgressionModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-[10%] md:bottom-[10%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-black/50">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Global Progression Scheme</h2>
                <p className="text-sm text-neutral-400 mt-1">Calisthenics is leverage. Pick your current tier.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-neutral-900 rounded-full hover:bg-neutral-800 hover:text-white text-neutral-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              <ProgressionCategory 
                title="1. Vertical Pull" 
                subtitle="Primary: Lats, Biceps, Scapular Retractors"
                tiers={[
                  "Active Bar Hangs (60s)",
                  "Scapular Pull-ups",
                  "Negative (Eccentric) Pull-ups",
                  "Band-Assisted Pull-ups",
                  "Strict Pull-ups / Chin-ups",
                  "L-Sit Pull-ups",
                  "Muscle-ups"
                ]}
              />

              <ProgressionCategory 
                title="2. Horizontal Pull" 
                subtitle="Primary: Mid-back, Rhomboids, Rear Delts"
                tiers={[
                  "Wall Pulls",
                  "High Incline Rows",
                  "Low Incline Rows",
                  "Horizontal Bodyweight Rows",
                  "Elevated Feet Rows",
                  "Front Lever Tuck Rows",
                  "Front Lever Rows"
                ]}
              />

              <ProgressionCategory 
                title="3. Horizontal Press" 
                subtitle="Primary: Pectorals, Anterior Deltoids, Triceps"
                tiers={[
                  "Wall Push-ups",
                  "Incline Push-ups",
                  "Knee Push-ups",
                  "Strict Push-ups",
                  "Diamond Push-ups",
                  "Archer Push-ups",
                  "Pseudo Planche Push-ups"
                ]}
              />

              <ProgressionCategory 
                title="4. Vertical Press" 
                subtitle="Primary: Anterior Deltoids, Triceps, Upper Chest"
                tiers={[
                  "Wall Plank Holds",
                  "Pike Push-up Holds",
                  "Pike Push-ups",
                  "Bench Dips",
                  "Parallel Bar Dips",
                  "Elevated Pike Push-ups",
                  "Wall Handstand Push-ups (HSPU)",
                  "Freestanding Handstand Push-ups"
                ]}
              />

              <ProgressionCategory 
                title="5. Squat Pattern" 
                subtitle="Primary: Quadriceps, Glutes"
                tiers={[
                  "Assisted Bodyweight Squats",
                  "Strict Bodyweight Squats",
                  "Bulgarian Split Squats",
                  "Assisted Pistol Squats",
                  "Pistol Squat Negatives",
                  "Strict Pistol Squats"
                ]}
              />

              <ProgressionCategory 
                title="6. Core Compression" 
                subtitle="Primary: Rectus Abdominis, Hip Flexors"
                tiers={[
                  "Lying Hollow Body Holds",
                  "Seated Single Leg Raises",
                  "Tuck L-Sit",
                  "One-Leg Extended L-Sit",
                  "Full L-Sit",
                  "V-Sit"
                ]}
              />

              <ProgressionCategory 
                title="7. Elbow Extension" 
                subtitle="Primary: Triceps Brachii"
                tiers={[
                  "Wall Tricep Extensions",
                  "High Incline Tricep Extensions",
                  "Low Incline Tricep Extensions",
                  "Floor Bodyweight Skullcrushers",
                  "Ring Tricep Extensions (High)",
                  "Ring Tricep Extensions (Low)",
                  "Tiger Bend Push-ups"
                ]}
              />

              <ProgressionCategory 
                title="8. Elbow Flexion" 
                subtitle="Primary: Biceps Brachii, Brachialis"
                tiers={[
                  "Standing Ring Bicep Curls (High Angle)",
                  "Standing Ring Bicep Curls (Low Angle)",
                  "Bodyweight Bicep Curls (Under Bar)",
                  "One-Arm Ring Curls (Assisted)",
                  "One-Arm Ring Curls",
                  "Pelican Curls (Negative)",
                  "Full Pelican Curls"
                ]}
              />

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ProgressionCategory = ({ title, subtitle, tiers }: { title: string, subtitle: string, tiers: string[] }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-bold text-white tracking-wider">{title}</h3>
      <p className="text-xs text-neutral-500 uppercase tracking-widest">{subtitle}</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {tiers.map((tier, index) => (
        <div key={index} className="flex items-center gap-3 bg-neutral-900/50 p-3 rounded-lg border border-neutral-800">
          <span className="text-neutral-500 font-mono text-sm w-4">0{index + 1}</span>
          <span className="text-neutral-200 text-sm font-medium">{tier}</span>
        </div>
      ))}
    </div>
  </div>
);
