"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Heart, Activity, BarChart2 } from "lucide-react";
import GlobalTimerBadge from "./GlobalTimerBadge";
import { globalTimerStore } from "@/lib/timerStore";
import { isHiddenNavRoute } from "@/lib/appRoutes";
import { useKeyboardOpen } from "@/lib/useKeyboardOpen";

export default function GlobalNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOffline, setIsOffline] = useState(() => (typeof navigator === "undefined" ? false : !navigator.onLine));
  // While typing, the keyboard owns the bottom of the screen. The tab bar is
  // pinned there, so it would otherwise sit on the keys and on the field being
  // edited (and its spacer would keep reserving space it no longer needs).
  const keyboardOpen = useKeyboardOpen();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Hide navigation on onboarding/landing/auth and during active tracking.
  if (isHiddenNavRoute(pathname)) return null;

  const navItems = [
    { name: "Routine", path: "/campaign", icon: Home },
    { name: "Nutrition", path: "/diet", icon: Heart },
    { name: "Insights", path: "/training-insights", icon: BarChart2 },
    { name: "Vitals", path: "/settings", icon: Activity },
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind the fixed nav. Collapses
          with the nav so the layout does not keep a gap while typing. */}
      <div
        className={`w-full md:h-0 transition-[height] duration-200 ${keyboardOpen ? "h-0" : "h-24"}`}
        aria-hidden="true"
      ></div>

      <nav
        aria-hidden={keyboardOpen}
        className={`global-nav-container fixed left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max z-50 transition-all duration-300 ${
          keyboardOpen
            ? "bottom-2 translate-y-24 opacity-0 pointer-events-none"
            : "bottom-6 translate-y-0 opacity-100"
        }`}
      >
        {isOffline && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-950/80 border border-red-900 text-red-500 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur flex items-center gap-2 shadow-sm whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            Offline Mode
          </div>
        )}
        
        {/* Floating Global Timer Badge */}
        <div className="absolute -top-10 right-2">
          <GlobalTimerBadge 
            onlyShowWhenActive 
            onClick={() => globalTimerStore.openModal()} 
          />
        </div>

        <div className="bg-[#050505] border border-[#222] rounded-full p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.9)] max-w-[340px] mx-auto w-full">
          <ul className="flex items-center justify-between w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <li key={item.path} className="flex-1 flex justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isActive) return;
                      // Client-side navigation only. The previous offline branch
                      // used window.location.href, a full page reload that
                      // re-mounted the whole shell (the "flash" on tab switch).
                      router.push(item.path);
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex flex-col items-center justify-center gap-1 py-2 px-1 w-full rounded-full transition-all duration-300 outline-none select-none ${
                      isActive 
                        ? "text-white bg-neutral-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[#333]" 
                        : "text-neutral-500 hover:text-white hover:bg-[#111] border border-transparent"
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : ""} />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                      {item.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
