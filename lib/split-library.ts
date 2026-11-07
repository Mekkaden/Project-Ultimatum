// A single read-only catalogue of every split bundled with the app. The split
// library and the campaign resolver share this data, so "what exists" and "what
// can be activated" cannot drift apart.

import { clearCampaignProgress } from "./day-completion";
import {
  CAMPAIGN_3_DAY,
  CAMPAIGN_4_DAY,
  CAMPAIGN_5_DAY,
  CAMPAIGN_CUSTOM,
  CAMPAIGN_STRENGTH_3_DAY,
  CAMPAIGN_STRENGTH_4_DAY,
  CAMPAIGN_STRENGTH_6_DAY,
  CAMPAIGN_CALISTHENICS_3_DAY,
  CAMPAIGN_CALISTHENICS_4_DAY,
  CAMPAIGN_CALISTHENICS_6_DAY,
  CAMPAIGN_HYBRID_4_DAY,
  CAMPAIGN_HYBRID_6_DAY,
  CAMPAIGN_FEMALE_3_DAY,
  CAMPAIGN_FEMALE_4_DAY,
  CAMPAIGN_FEMALE_5_DAY,
  STRETCHING_BEGINNER_2_DAY,
  STRETCHING_INTERMEDIATE_3_DAY,
  STRETCHING_ADVANCED_4_DAY,
  STRETCHING_PRO_5_DAY,
  type Campaign,
} from "./workout-data";

export type SplitDirective = "hypertrophy" | "strength" | "calisthenics" | "hybrid" | "custom";
export type SplitKind = "resistance" | "flexibility";

export type SplitDescriptor = {
  id: string;
  campaign: Campaign;
  kind: SplitKind;
  directive: SplitDirective;
  frequency: string;
  gender: "male" | "female";
  group: string;
  flexTier?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO";
};

const resistance = (
  campaign: Campaign,
  directive: SplitDirective,
  frequency: string,
  gender: "male" | "female",
  group: string,
): SplitDescriptor => ({
  id: campaign.id,
  campaign,
  kind: "resistance",
  directive,
  frequency,
  gender,
  group,
});

const flexibility = (
  campaign: Campaign,
  flexTier: SplitDescriptor["flexTier"],
  group: string,
): SplitDescriptor => ({
  id: campaign.id,
  campaign,
  kind: "flexibility",
  directive: "hypertrophy",
  frequency: String(campaign.days.filter((day) => !day.isRestDay && day.exercises?.length).length) + "-days",
  gender: "male",
  group,
  flexTier,
});

export const SPLIT_LIBRARY: SplitDescriptor[] = [
  resistance(CAMPAIGN_3_DAY, "hypertrophy", "3-days", "male", "Hypertrophy · Male"),
  resistance(CAMPAIGN_4_DAY, "hypertrophy", "4-days", "male", "Hypertrophy · Male"),
  resistance(CAMPAIGN_5_DAY, "hypertrophy", "5-days", "male", "Hypertrophy · Male"),

  resistance(CAMPAIGN_FEMALE_3_DAY, "hypertrophy", "3-days", "female", "Hypertrophy · Female"),
  resistance(CAMPAIGN_FEMALE_4_DAY, "hypertrophy", "4-days", "female", "Hypertrophy · Female"),
  resistance(CAMPAIGN_FEMALE_5_DAY, "hypertrophy", "5-days", "female", "Hypertrophy · Female"),

  resistance(CAMPAIGN_STRENGTH_3_DAY, "strength", "3-days", "male", "Strength"),
  resistance(CAMPAIGN_STRENGTH_4_DAY, "strength", "4-days", "male", "Strength"),
  resistance(CAMPAIGN_STRENGTH_6_DAY, "strength", "6-days", "male", "Strength"),

  resistance(CAMPAIGN_CALISTHENICS_3_DAY, "calisthenics", "3-days", "male", "Calisthenics"),
  resistance(CAMPAIGN_CALISTHENICS_4_DAY, "calisthenics", "4-days", "male", "Calisthenics"),
  resistance(CAMPAIGN_CALISTHENICS_6_DAY, "calisthenics", "6-days", "male", "Calisthenics"),

  resistance(CAMPAIGN_HYBRID_4_DAY, "hybrid", "4-days", "male", "Hybrid"),
  resistance(CAMPAIGN_HYBRID_6_DAY, "hybrid", "6-days", "male", "Hybrid"),

  resistance(CAMPAIGN_CUSTOM, "custom", "custom", "male", "Custom"),

  flexibility(STRETCHING_BEGINNER_2_DAY, "BEGINNER", "Flexibility"),
  flexibility(STRETCHING_INTERMEDIATE_3_DAY, "INTERMEDIATE", "Flexibility"),
  flexibility(STRETCHING_ADVANCED_4_DAY, "ADVANCED", "Flexibility"),
  flexibility(STRETCHING_PRO_5_DAY, "PRO", "Flexibility"),
];

/** Human name for the active split, including a user's custom split. */
export function getActiveSplitLabel(activeId: string | null): string {
  const split = SPLIT_LIBRARY.find((entry) => entry.id === activeId);
  return split?.campaign.title ?? "Circular Strength Custom Split";
}

export function trainingDayCount(campaign: Campaign): number {
  return campaign.days.filter((day) => !day.isRestDay && day.exercises?.length > 0).length;
}

export function exerciseCount(campaign: Campaign): number {
  return campaign.days.reduce((total, day) => total + (day.isRestDay ? 0 : day.exercises?.length ?? 0), 0);
}

function normalizeDirective(value: string | null): SplitDirective {
  if (value === "strength" || value === "calisthenics" || value === "hybrid" || value === "custom") {
    return value;
  }
  return "hypertrophy";
}

/** The split the app is currently configured to use, per routine track. */
export function getActiveSplitIds(): { resistance: string | null; flexibility: string | null } {
  if (typeof window === "undefined") return { resistance: null, flexibility: null };
  try {
    const flexEnabled = localStorage.getItem("ultimatum_flex_enabled") === "true";
    const flexTier = (localStorage.getItem("ultimatum_flex_tier") || "BEGINNER") as SplitDescriptor["flexTier"];
    const directive = normalizeDirective(localStorage.getItem("ultimatum_directive"));
    const frequency = localStorage.getItem("ultimatum_frequency") || "5-days";
    const gender = (localStorage.getItem("ultimatum_gender") || "male") as "male" | "female";

    const flex = flexEnabled
      ? SPLIT_LIBRARY.find(
          (split) => split.kind === "flexibility" && split.flexTier === flexTier,
        )
      : undefined;

    const resistance = SPLIT_LIBRARY.find(
      (split) =>
        split.kind === "resistance" &&
        split.directive === directive &&
        split.frequency === frequency &&
        (directive !== "hypertrophy" || split.gender === gender),
    );

    return { resistance: resistance?.id ?? null, flexibility: flex?.id ?? null };
  } catch {
    return { resistance: null, flexibility: null };
  }
}

export type ApplySplitResult = { ok: true } | { ok: false; reason: string };

/**
 * Activate a split. Progress is scoped per campaign already, so switching does
 * not inherit another split's ticks. The caller must confirm before calling,
 * because the cursor starts at Day 1 for the newly selected split.
 */
export function applyBuiltInSplit(split: SplitDescriptor): ApplySplitResult {
  if (typeof window === "undefined") return { ok: false, reason: "Unavailable" };
  if (split.directive === "custom") {
    return { ok: false, reason: "Custom splits are built in the editor, not activated from the library." };
  }

  try {
    if (split.kind === "flexibility") {
      clearCampaignProgress(split.campaign);
      localStorage.setItem("ultimatum_flex_enabled", "true");
      if (split.flexTier) localStorage.setItem("ultimatum_flex_tier", split.flexTier);
      localStorage.removeItem("ultimatum_flex_campaign_day");
      sessionStorage.setItem("ultimatum_routine_mode", "flexibility");
      return { ok: true };
    }

    clearCampaignProgress(split.campaign);
    localStorage.setItem("ultimatum_directive", split.directive);
    localStorage.setItem("ultimatum_frequency", split.frequency);
    localStorage.setItem("ultimatum_gender", split.gender);
    localStorage.removeItem("ultimatum_campaign_override");
    localStorage.removeItem("ultimatum_custom_campaign_cache");
    localStorage.removeItem("ultimatum_campaign_day");
    sessionStorage.setItem("ultimatum_routine_mode", "resistance");
    return { ok: true };
  } catch {
    return { ok: false, reason: "Could not save the split on this device." };
  }
}
