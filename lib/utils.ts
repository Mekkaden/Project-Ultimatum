import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAllowedFrequencyIds(directive: string | null): string[] {
  switch (directive) {
    case "strength":
    case "calisthenics":
      return ["3-days", "4-days", "6-days", "custom"];
    case "hybrid":
      return ["4-days", "6-days", "custom"];
    case "hypertrophy":
      return ["3-days", "4-days", "5-days", "custom"];
    default:
      return ["3-days", "4-days", "5-days", "6-days", "custom"];
  }
}

export function getAllowedFrequencyNumbers(directive: string | null): number[] {
  return getAllowedFrequencyIds(directive)
    .filter(id => id !== "custom")
    .map(id => parseInt(id.split("-")[0], 10));
}

export function getAuthHeaders(): HeadersInit {
  let token = "";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("ultimatum_cached_session");
      if (cached) {
        token = JSON.parse(cached).access_token || "";
      }
    } catch (e) {}
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}
