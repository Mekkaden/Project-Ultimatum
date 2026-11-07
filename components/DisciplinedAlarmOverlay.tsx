"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Outfit } from "next/font/google";

import { useHardwareBack } from '@/lib/useHardwareBack';

// Outfit is already downloaded by the app shell; this instance only names the
// family so the finish screen shares the app's typeface instead of the
// system fallback it used before.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

interface DisciplinedAlarmOverlayProps {
  isFinished: boolean;
  onDismiss: () => void;
}

/**
 * Full-screen "session complete" screen shown when the workout timer ends.
 *
 * It is a photo-led screen: the frame is shown close to full strength and the
 * only dimming is a soft gradient behind the text, so the athlete stays legible
 * instead of the flat 70% black wash this used to have. Copy sits low, near the
 * thumb, and everything is set in Outfit.
 */
export default function DisciplinedAlarmOverlay({ isFinished, onDismiss }: DisciplinedAlarmOverlayProps) {
  // Back closes the screen exactly like the button does; the timer has already
  // finished, so leaving it open on Back would only strand the user.
  useHardwareBack(isFinished, () => onDismiss());

  useEffect(() => {
    if (!isFinished) return;

    let audioCtx: AudioContext | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      const playBeep = () => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);

        if (window.navigator?.vibrate) {
          window.navigator.vibrate([400, 200, 400]);
        }
      };

      intervalId = setInterval(playBeep, 1000);
      playBeep();
    } catch {
      console.warn("AudioContext not supported or blocked");
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, [isFinished]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isFinished && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 z-[9999] flex flex-col justify-end overflow-hidden bg-black pointer-events-auto ${outfit.className}`}
        >
          {/* The photo: covered, biased so the rider stays in frame on tall
              phones. No blur: the image is crisp, and the gradients below are
              what keep the type readable. The 1px upscale hides the seam the
              cover crop can leave at the edges. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-no-repeat scale-[1.01]"
            style={{
              backgroundImage: "url('/session-complete-bg.png')",
              backgroundPosition: "center 45%",
            }}
          />
          {/* Top shade keeps the status bar readable; bottom shade carries the copy. */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-transparent" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

          <motion.div
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
            className="relative z-10 w-full px-6 pb-10 pt-24"
          >
            {/* Finishing is an achievement, not a warning: a check, not a triangle. */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
                <Check size={22} strokeWidth={3.5} className="text-black" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/70">
                Target time reached
              </span>
            </div>

            <h1 className="text-[clamp(2.6rem,12vw,3.6rem)] font-black uppercase leading-[0.9] tracking-[-0.02em] text-white">
              Session
              <br />
              complete
            </h1>

            <p className="mt-4 max-w-[19rem] text-sm font-medium leading-relaxed text-white/65">
              You hit the target. Wrap it up and recover.
            </p>

            <button
              onClick={onDismiss}
              className="mt-7 ml-auto block min-w-[9.5rem] px-9 py-2.5 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
