"use client";

import { motion } from "framer-motion";
import { montserrat } from "@/app/fonts";
import { useRouter } from "next/navigation";
import { useGoBack } from "@/lib/useGoBack";
import { ArrowLeft, MessageCircleQuestion } from "lucide-react";
import DecryptedText from "../../components/DecryptedText";

const faqs: { q: string; a: string; link?: string }[] = [];

export default function FAQPage() {
  const router = useRouter();
  const goBack = useGoBack("/settings");

  return (
    <div className={`min-h-screen bg-black text-white px-6 py-12 md:py-24 relative overflow-hidden ${montserrat.className}`}>
      
      {/* Background elements for premium feel */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-3xl mx-auto relative z-10 flex flex-col h-full">
        
        {/* Top Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 group"
          >
            <div className="p-2 rounded-full bg-neutral-900 border border-neutral-800 group-hover:bg-neutral-800 transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to Settings</span>
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
              <MessageCircleQuestion size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                <DecryptedText
                  text="F.A.Q."
                  speed={70}
                  maxIterations={15}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                  animateOn="view"
                />
              </h1>
              <div className="text-xs md:text-sm text-neutral-500 font-medium tracking-widest uppercase mt-1">
                Frequently Asked Questions
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pb-24"
        >
          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + (idx * 0.1) }}
                className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-6 transition-colors hover:border-neutral-700 hover:bg-neutral-900/80 shadow-lg"
              >
                <h3 className="text-base md:text-lg font-bold text-white mb-3 tracking-wide">{faq.q}</h3>
                <p className="text-sm md:text-base text-neutral-400 leading-relaxed font-medium">{faq.a}</p>
                {faq.link && (
                  <a 
                    href={faq.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 mt-4 text-xs md:text-sm text-emerald-500 hover:text-emerald-400 transition-colors font-bold tracking-widest uppercase border border-emerald-900/50 bg-emerald-950/30 px-4 py-2 rounded-lg"
                  >
                    Watch Video Explanation &rarr;
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
