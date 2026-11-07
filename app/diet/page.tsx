"use client";

import DietModule from "../../components/DietModule";
import { motion } from "framer-motion";

export default function DietPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden pt-12 pb-24 px-4 md:px-8">
      {/* Pure Black Background */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none"></div>

      <div className="relative z-10">
        <DietModule />
      </div>
    </div>
  );
}
