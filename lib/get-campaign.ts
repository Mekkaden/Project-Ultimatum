import {
  CAMPAIGN_3_DAY, CAMPAIGN_4_DAY, CAMPAIGN_5_DAY, CAMPAIGN_CUSTOM,
  CAMPAIGN_STRENGTH_3_DAY, CAMPAIGN_STRENGTH_4_DAY, CAMPAIGN_STRENGTH_6_DAY,
  CAMPAIGN_CALISTHENICS_3_DAY, CAMPAIGN_CALISTHENICS_4_DAY, CAMPAIGN_CALISTHENICS_6_DAY,
  CAMPAIGN_HYBRID_4_DAY, CAMPAIGN_HYBRID_6_DAY,
  CAMPAIGN_FEMALE_3_DAY, CAMPAIGN_FEMALE_4_DAY, CAMPAIGN_FEMALE_5_DAY,
  STRETCHING_BEGINNER_2_DAY, STRETCHING_BEGINNER_3_DAY,
  STRETCHING_INTERMEDIATE_3_DAY,
  STRETCHING_ADVANCED_4_DAY,
  STRETCHING_PRO_5_DAY,
  Campaign
} from "./workout-data";

function applyMaxSetsRule(campaign: Campaign): Campaign {
  // Deep clone to avoid mutating the constant data
  const normalized = JSON.parse(JSON.stringify(campaign)) as Campaign;
  
  normalized.days.forEach(day => {
    if (day.isRestDay || !day.exercises) return;
    
    let currentTotal = day.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    
    // Iteratively reduce until total sets <= 14
    while (currentTotal > 14) {
      // Find the first exercise with 4 sets
      let exToReduce = day.exercises.find(ex => ex.sets === 4);
      if (exToReduce) {
        if (exToReduce.targetRIR && exToReduce.targetRIR.includes(",")) {
          const parts = exToReduce.targetRIR.split(",").map(p => p.trim());
          if (parts.length === 4) exToReduce.targetRIR = parts.slice(1).join(", ");
        }
        exToReduce.sets = 3;
        currentTotal--;
        continue;
      }
      
      // If no 4-set exercises, find one with 3 sets
      exToReduce = day.exercises.find(ex => ex.sets === 3);
      if (exToReduce) {
        if (exToReduce.targetRIR && exToReduce.targetRIR.includes(",")) {
          const parts = exToReduce.targetRIR.split(",").map(p => p.trim());
          if (parts.length === 3) exToReduce.targetRIR = parts.slice(1).join(", ");
        }
        exToReduce.sets = 2;
        currentTotal--;
        continue;
      }
      
      // If we can't reduce any 4s or 3s, break to prevent infinite loop
      break;
    }
    
    day.totalSets = currentTotal;
  });
  
  return normalized;
}

/**
 * SSR-safe fallbacks: static campaign objects that match what getLocalCampaign /
 * getLocalFlexibilityCampaign return when localStorage is unavailable (server render).
 * Use these as the initial useState value in client components so that server
 * and client produce identical HTML, eliminating hydration mismatches.
 */
export const SSR_CAMPAIGN_FALLBACK: Campaign = applyMaxSetsRule(CAMPAIGN_5_DAY);
export const SSR_FLEX_CAMPAIGN_FALLBACK: Campaign = STRETCHING_BEGINNER_2_DAY;

// Flexibility programmes set their own volume: "sets" here means C–R cycles
// per movement, not hypertrophy work sets. applyMaxSetsRule caps a day at 14
// work sets and would strip every routine down to one cycle per stretch, so it
// is deliberately not applied here.
export function getLocalFlexibilityCampaign(): Campaign {
  if (typeof window === "undefined") return STRETCHING_BEGINNER_2_DAY;

  const flexTier = localStorage.getItem("ultimatum_flex_tier") || "BEGINNER";

  // Tier -> split is fixed by the programme design:
  //   Tier 1 Foundation     2- or 3-day full body
  //   Tier 2 Intermediate   3-day regional split
  //   Tier 3 Advanced       4-day mobility & splits
  //   Tier 4 Pro Mastery    5-day end poses
  let activeCampaign: Campaign = STRETCHING_BEGINNER_2_DAY;
  if (flexTier === "BEGINNER") {
    activeCampaign = STRETCHING_BEGINNER_2_DAY;
  } else if (flexTier === "INTERMEDIATE") {
    activeCampaign = STRETCHING_INTERMEDIATE_3_DAY;
  } else if (flexTier === "ADVANCED") {
    activeCampaign = STRETCHING_ADVANCED_4_DAY;
  } else if (flexTier === "PRO") {
    activeCampaign = STRETCHING_PRO_5_DAY;
  }

  return activeCampaign;
}

export function getLocalCampaign(): Campaign {
  if (typeof window === "undefined") return applyMaxSetsRule(CAMPAIGN_5_DAY);
  
  // Check if user has an active edit override
  const overrideCache = localStorage.getItem("ultimatum_campaign_override");
  if (overrideCache) {
    try {
      const overrideCamp = JSON.parse(overrideCache);
      return applyMaxSetsRule(overrideCamp);
    } catch (e) {
      // Fall through to default logic on parse error
    }
  }

  const savedFreq = localStorage.getItem("ultimatum_frequency");
  const savedDirective = localStorage.getItem("ultimatum_directive") || "hypertrophy";
  const savedGender = localStorage.getItem("ultimatum_gender") || "male";
  let activeCampaign = CAMPAIGN_5_DAY;

  if (savedDirective === "strength") {
    if (savedFreq === "3-days") activeCampaign = CAMPAIGN_STRENGTH_3_DAY;
    else if (savedFreq === "4-days") activeCampaign = CAMPAIGN_STRENGTH_4_DAY;
    else if (savedFreq === "6-days") activeCampaign = CAMPAIGN_STRENGTH_6_DAY;
    else if (savedFreq === "custom") activeCampaign = CAMPAIGN_CUSTOM;
  } else if (savedDirective === "calisthenics") {
    if (savedFreq === "3-days") activeCampaign = CAMPAIGN_CALISTHENICS_3_DAY;
    else if (savedFreq === "4-days") activeCampaign = CAMPAIGN_CALISTHENICS_4_DAY;
    else if (savedFreq === "6-days") activeCampaign = CAMPAIGN_CALISTHENICS_6_DAY;
    else if (savedFreq === "custom") activeCampaign = CAMPAIGN_CUSTOM;
  } else if (savedDirective === "hybrid") {
    if (savedFreq === "4-days") activeCampaign = CAMPAIGN_HYBRID_4_DAY;
    else if (savedFreq === "6-days") activeCampaign = CAMPAIGN_HYBRID_6_DAY;
  } else {
    // Hypertrophy
    if (savedGender === "female") {
      if (savedFreq === "3-days") activeCampaign = CAMPAIGN_FEMALE_3_DAY;
      else if (savedFreq === "4-days") activeCampaign = CAMPAIGN_FEMALE_4_DAY;
      else if (savedFreq === "5-days") activeCampaign = CAMPAIGN_FEMALE_5_DAY;
      else if (savedFreq === "custom") activeCampaign = CAMPAIGN_CUSTOM;
    } else {
      if (savedFreq === "3-days") activeCampaign = CAMPAIGN_3_DAY;
      else if (savedFreq === "4-days") activeCampaign = CAMPAIGN_4_DAY;
      else if (savedFreq === "custom") activeCampaign = CAMPAIGN_CUSTOM;
    }
  }

  // If the active campaign is the custom stub, try to load the actual deployed custom split from cache
  if (activeCampaign.id === "custom-code-split") {
    const cachedCustom = localStorage.getItem("ultimatum_custom_campaign_cache");
    if (cachedCustom) {
      try {
        activeCampaign = JSON.parse(cachedCustom);
      } catch (e) {
        // Fallback to stub if parsing fails
      }
    }
  }
  
  return applyMaxSetsRule(activeCampaign);
}
