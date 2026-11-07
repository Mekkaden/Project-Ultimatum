"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register service worker required for PWA install prompts
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
    }

    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can add to home screen
      // Check if user dismissed it previously
      if (!localStorage.getItem('pwa_prompt_dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl z-[100] flex items-start gap-4 animate-in slide-in-from-bottom-5">
      <div className="w-12 h-12 bg-black rounded-xl border border-neutral-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
        <img src="/icon-192.jpg" alt="Ultimatum Icon" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Install Ultimatum</h3>
        <p className="text-neutral-400 text-xs mb-3">Add to your home screen for the full native app experience.</p>
        <div className="flex gap-2">
          <button onClick={handleInstallClick} className="flex-1 bg-white text-black font-bold text-[10px] md:text-xs uppercase tracking-widest py-2 rounded-lg hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2">
            <Download size={14} />
            <span>Install App</span>
          </button>
          <button onClick={handleDismiss} className="px-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors flex justify-center items-center">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
