"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Camera, Zap, LineChart, Mail, Video, Dumbbell } from 'lucide-react';
import TextPressure from '@/components/TextPressure';

export default function PremiumPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Shield className="text-red-500" size={28} />,
      title: "1:1 Elite Coaching",
      description: "Get personalized workout routines, diet plans, and direct access to expert coaching."
    },
    {
      icon: <Camera className="text-red-500" size={28} />,
      title: "AI Accurate Image Scanner",
      description: "Stop typing. Snap a photo of your food and our advanced vision AI logs your exact macros instantly."
    },
    {
      icon: <LineChart className="text-red-500" size={28} />,
      title: "Fatigue Management",
      description: "Unlock deep insights into your progression, predictive volume tracking, and advanced fatigue management."
    },
    {
      icon: <Video className="text-red-500" size={28} />,
      title: "Live Sessions",
      description: "1-on-1 live calls, dedicated doubt clearance sessions, and constant form check reviews."
    },
    {
      icon: <Dumbbell className="text-red-500" size={28} />,
      title: "Specialization Blocks",
      description: "Custom macrocycles focusing on your weak points. Progression models built exclusively for you."
    },
    {
      icon: <Zap className="text-red-500" size={28} />,
      title: "Dynamic Recalibration",
      description: "Your protocol dynamically adapts to your lifestyle. Missed a meal or workout? We recalibrate instantly."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
      {/* Header */}
      <div className="max-w-4xl mx-auto pt-12 px-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold mb-12"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-red-950/30 text-red-500 px-4 py-2 rounded-full border border-red-900/50 text-sm font-black uppercase tracking-[0.3em] mb-6 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
          >
            Upgrade to Premium
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full mb-6"
            style={{ position: 'relative', height: '120px' }}
          >
            <TextPressure
              text="UNLOCK YOUR ULTIMATE FORM"
              flex={true}
              alpha={false}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="#ef4444"
              strokeColor="#ff0000"
              minFontSize={24}
            />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto font-medium"
          >
            Join the elite tier and get access to our most powerful tools designed to accelerate your gains and dial in your nutrition.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              className="bg-neutral-950 border border-neutral-900 rounded-2xl p-8 hover:border-red-900/50 transition-colors group"
            >
              <div className="mb-6 group-hover:scale-110 transition-transform origin-left">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black uppercase tracking-wide mb-3">{feature.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Payment Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-3xl p-8 md:p-12 relative overflow-hidden mb-20 shadow-2xl"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10 text-center">
            <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Secure Your Spot</h2>
            <p className="text-neutral-400 text-sm mb-10">Premium membership is currently invite-only. Follow the steps below to request access.</p>
            
            <div className="space-y-6 text-left">
              <div className="bg-black/50 border border-neutral-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-3">
                  <div className="font-bold uppercase tracking-widest text-sm text-neutral-300">Send Payment via UPI</div>
                </div>
                <div className="ml-0">
                  <div className="flex flex-col gap-2 mb-4 bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-400 font-bold uppercase tracking-wider">Registration Fee</span>
                      <span className="text-white font-black tracking-widest">$60 <span className="text-neutral-500 font-medium">(₹5000)</span></span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-400 font-bold uppercase tracking-wider">Per Month</span>
                      <span className="text-white font-black tracking-widest">$36 <span className="text-neutral-500 font-medium">(₹3000)</span></span>
                    </div>
                  </div>
                  <p className="text-neutral-500 text-sm mb-3">Send the membership fee to the following UPI ID:</p>
                  <div className="inline-flex items-center gap-3 bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-lg">
                    <Zap className="text-yellow-500" size={16} />
                    <span className="font-mono font-bold text-white tracking-wider">8136965260@ybl</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/50 border border-neutral-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-3">
                  <div className="font-bold uppercase tracking-widest text-sm text-neutral-300">Confirm Your Identity</div>
                </div>
                <div className="ml-0">
                  <p className="text-neutral-500 text-sm mb-4">Send a screenshot of your successful payment to:</p>
                  <a href="mailto:richardbluedio@gmail.com" className="inline-flex items-center gap-3 bg-red-950/30 text-red-400 border border-red-900/50 hover:bg-red-900/30 hover:text-red-300 transition-colors px-4 py-3 rounded-lg w-full md:w-auto justify-center">
                    <Mail size={16} />
                    <span className="font-bold tracking-wider">richardbluedio@gmail.com</span>
                  </a>
                  <p className="text-xs text-neutral-600 font-bold uppercase tracking-widest mt-4">
                    We will review and upgrade your account shortly after receiving your email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
