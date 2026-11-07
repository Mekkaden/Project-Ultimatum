"use client";

import { Suspense } from "react";
import AutoSetupWizard from "@/components/AutoSetupWizard";

export default function AutoSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AutoSetupWizard />
    </Suspense>
  );
}
