"use client";

import { Suspense } from "react";
import ManualNutritionWizard from "@/components/ManualNutritionWizard";

export default function ManualNutritionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ManualNutritionWizard />
    </Suspense>
  );
}
