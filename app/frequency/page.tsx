"use client";

import { Suspense } from "react";
import FrequencySelection from "@/components/FrequencySelection";

export default function FrequencyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <FrequencySelection />
    </Suspense>
  );
}
