"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { montserrat } from "@/app/fonts";

export default function TermsOfServicePage() {
  const router = useRouter();

  const eligibilitySections = [
    "You must be at least 16 years old to use Project Ultimatum.",
    "Users under 18 must have consent from a parent or legal guardian.",
    "By creating an account, you confirm that you have the legal capacity to enter this agreement."
  ];

  const accountSections = [
    {
      title: "REGISTRATION",
      content: "You are responsible for providing accurate account information and keeping it current."
    },
    {
      title: "SECURITY",
      content: "You must safeguard login credentials and notify us promptly of unauthorized access."
    },
    {
      title: "SUSPENSION",
      content: "We may suspend or terminate accounts that violate these Terms or applicable law."
    },
    {
      title: "RESPONSIBILITY",
      content: "You are responsible for activity conducted through your account unless reported as unauthorized."
    }
  ];

  const permittedUseSections = [
    {
      title: "SERVICE SCOPE",
      content: "Project Ultimatum provides tools for fitness tracking, nutrition logging, analytics, and optional trainer connectivity. Features may change as the product evolves."
    },
    {
      title: "PROHIBITED CONDUCT",
      content: "You may not reverse engineer, scrape, or disrupt platform security. You may not use the service for unlawful, fraudulent, or harmful activity, harass users, or misrepresent your identity.",
      isList: true,
      items: [
        "Reverse engineering, scraping, or attempting to disrupt platform security.",
        "Using the service for unlawful, fraudulent, or harmful activity.",
        "Harassing users or uploading abusive, infringing, or inappropriate content.",
        "Misrepresenting identity or impersonating another person or organization."
      ]
    }
  ];

  return (
    <div className={`min-h-screen bg-black text-white relative overflow-hidden pb-32 ${montserrat.className}`}>
      
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-white opacity-[0.03] blur-[150px] rounded-[100%] pointer-events-none"></div>

      {/* Top Nav */}
      <div className="relative z-10 w-full p-6 flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="w-12 h-12 flex items-center justify-center bg-black/20 backdrop-blur-xl border border-white/10 rounded-full text-neutral-400 hover:text-white hover:bg-black/40 transition-colors shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 mt-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] leading-tight mb-6">
            <span className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">Terms of</span>
            <br />
            <span className="text-neutral-500">Service</span>
          </h1>
          <p className="text-neutral-400 text-xs md:text-sm font-medium max-w-2xl mx-auto leading-relaxed">
            These terms govern access to and use of the Project Ultimatum application and related services. By using Ultimatum, you agree to this agreement.
          </p>
          <p className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.3em] mt-8">
            Effective date: August 28, 2026
          </p>
        </motion.div>

        {/* Content Section 1: Agreement (Overview) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-[#050505] border border-neutral-900 rounded-3xl p-8 md:p-10 shadow-2xl text-center">
            <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white mb-4">Agreement</h2>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed font-medium">
              Project Ultimatum ("we," "us," or "our") provides a hardcore fitness platform for workout tracking, nutrition logging, and health metrics. If you do not agree to these Terms, do not access or use the application.
            </p>
          </div>
        </motion.div>

        {/* Content Section 2: Eligibility */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center mb-8">
            <span className="text-neutral-500">1.</span> <span className="text-white">Eligibility</span>
          </h2>
          <div className="bg-[#050505] border border-neutral-900 rounded-3xl p-8 shadow-2xl">
            <ul className="space-y-4 text-xs font-medium text-neutral-400 list-disc list-outside pl-4">
              {eligibilitySections.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Content Section 3: Accounts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center mb-8">
            <span className="text-neutral-500">2.</span> <span className="text-white">Accounts</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountSections.map((section, idx) => (
              <div key={idx} className="bg-black border border-neutral-900 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
                <h3 className="text-xs font-black uppercase tracking-[0.1em] text-white mb-2">{section.title}</h3>
                <p className="text-neutral-400 text-xs leading-relaxed font-medium">{section.content}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Content Section 4: Permitted Use */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center mb-8">
            <span className="text-neutral-500">3.</span> <span className="text-white">Permitted Use</span>
          </h2>
          <div className="flex flex-col gap-4">
            {permittedUseSections.map((section, idx) => (
              <div key={idx} className="bg-black border border-neutral-900 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
                <h3 className="text-xs font-black uppercase tracking-[0.1em] text-white mb-4">{section.title}</h3>
                {section.isList ? (
                  <ul className="space-y-3 text-xs font-medium text-neutral-400 list-disc list-outside pl-4">
                    {section.items?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-400 text-xs leading-relaxed font-medium">{section.content}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Content Section 5: Health Disclaimer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center mb-8">
            <span className="text-neutral-500">4.</span> <span className="text-white">Health Disclaimer</span>
          </h2>
          <div className="bg-[#050505] border border-neutral-900 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-[0.1em] text-red-500 mb-4">NOT MEDICAL ADVICE</h3>
            <p className="text-neutral-400 text-xs leading-relaxed mb-4 font-medium">
              Project Ultimatum is a hardcore fitness and wellness tool. It does not provide medical diagnosis, treatment, or professional health advice.
            </p>
            <ul className="space-y-3 text-xs font-medium text-neutral-400 list-disc list-outside pl-4">
              <li>Consult a qualified healthcare provider before starting or changing an exercise or nutrition program.</li>
              <li>Physical activity carries inherent risk. You participate at your own discretion and responsibility.</li>
              <li>Stop activity and seek medical attention if you experience pain, dizziness, or other adverse symptoms.</li>
            </ul>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
