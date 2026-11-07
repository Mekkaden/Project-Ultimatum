import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GLOBAL_PROGRESSIONS } from '@/lib/progressions';
import { useHardwareBack } from '@/lib/useHardwareBack';

interface ProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProgressionModal: React.FC<ProgressionModalProps> = ({ isOpen, onClose }) => {
  useHardwareBack(isOpen, onClose);

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
            className="fixed inset-4 md:inset-auto md:top-[5%] md:bottom-[5%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl z-50 bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-black/50">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Global Progression Scheme</h2>
                <p className="text-sm text-neutral-400 mt-1">Expanded Calisthenics & Gymnastics Mastery Tiers.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-neutral-900 rounded-full hover:bg-neutral-800 hover:text-white text-neutral-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-12">
              {Object.values(GLOBAL_PROGRESSIONS)
                // Filter out duplicate categories based on title (since some might map to the same core title)
                .filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i)
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((prog) => (
                  <ProgressionCategory 
                    key={prog.id}
                    title={prog.title} 
                    subtitle={prog.subtitle}
                    tiers={prog.tiers}
                  />
                ))
              }
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
          <span className="text-neutral-500 font-mono text-sm w-6">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-neutral-200 text-sm font-medium">{tier}</span>
        </div>
      ))}
    </div>
  </div>
);
