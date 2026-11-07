"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DirectiveSelection from "@/components/DirectiveSelection";
import { returnToOnboardingIntro } from "@/lib/onboarding";

function DirectiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFastTrack = searchParams.get("fastTrack") === "true";
  const isEditing = searchParams.get("edit") === "true";

  // This is the first screen of the setup flow. Its Back goes to the screen the
  // flow started from (the landing page), never to the start of the app.
  // DirectiveSelection wires this to both its Back button and the phone's.
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    returnToOnboardingIntro("gatekeeper");
  };

  return (
    <DirectiveSelection 
      isFastTrack={isFastTrack}
      isEditing={isEditing}
      onGoBack={isEditing ? undefined : goBack}
      onComplete={(directive) => {
        console.log("Selected Directive:", directive);
      localStorage.setItem("ultimatum_directive", directive || "hypertrophy");
      localStorage.removeItem("ultimatum_campaign_override");
      localStorage.removeItem("ultimatum_custom_campaign_cache");
      if (directive === "premium") {
        alert("1:1 Elite Coaching is currently full. Please send an email to apply, or choose another directive for now.");
      } else {
        router.push(isFastTrack ? "/setup-mode?fastTrack=true" : "/setup-mode");
      }
    }} />
  );
}

export default function DirectivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <DirectiveContent />
    </Suspense>
  );
}
