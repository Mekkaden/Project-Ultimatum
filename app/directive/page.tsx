"use client";

import { useRouter } from "next/navigation";
import DirectiveSelection from "@/components/DirectiveSelection";

export default function DirectivePage() {
  const router = useRouter();

  return (
    <DirectiveSelection onComplete={(directive) => {
      console.log("Selected Directive:", directive);
      localStorage.setItem("ultimatum_directive", directive || "hypertrophy");
      if (directive === "premium") {
        router.push("/premium");
      } else {
        router.push("/frequency");
      }
    }} />
  );
}
