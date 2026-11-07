// Navigation helpers for the initial setup flow.
//
// Setup screens are reached with router.push, so the history stack holds the
// setup itself. Everything else must therefore not be pushed on top of it:
// pressing Back from /campaign, /settings, /diet, … would walk back into the
// onboarding the user just finished, and from there out of the app entirely.
//
// `enterOnboarding` deliberately uses location.replace: it makes the wizard a
// fresh history root (no entry behind it for Back to unwind into the gatekeeper
// or a previous wizard attempt) while staying in the same task and origin, so
// the login round-trip that replaces the stack with / replaces it with this
// root instead of losing the wizard.

export const ONBOARDING_ROUTE = "/directive?fastTrack=true";

/**
 * Session marker for the walkthrough step the landing screen should reopen on
 * ("What do you truly need?" is the `philosophy` walkthrough, not the landing
 * screen). Kept in one place because both /  and the Problem page write it.
 */
export const ONBOARDING_STEP_KEY = "ultimatum_onboarding_step";

export type OnboardingReturnStep = "philosophy" | "gatekeeper" | "protocol";

/** Reopen the onboarding intro at `step`, as a fresh root entry. */
export function returnToOnboardingIntro(step: OnboardingReturnStep = "philosophy"): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ONBOARDING_STEP_KEY, step);
    sessionStorage.removeItem("ultimatum_post_auth_target");
  } catch {}
  window.location.replace("/");
}

/** Starts (or restarts) setup with nothing behind it in the history stack. */
export function enterOnboarding(route: string = ONBOARDING_ROUTE): void {
  if (typeof window === "undefined") return;
  window.location.replace(route);
}

/**
 * Hard-Task restart of setup. The finished wizard may still be referenced by
 * the gatekeeper's history entry, so the root stack the error trap shows is
 * rebuilt from the landing page; a quick Back there then cannot reopen it.
 */
export function restartOnboarding(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("ultimatum_post_auth_target");
  } catch {}
  // Safe: after clearing the setup keys, "/" (and the app's own crash handler)
  // only ever offers "Enter" or "Reset Setup", which is the way back here.
  window.location.replace("/");
}

/** Whether pressing Back would leave the app instead of going to a screen. */
export function hasScreenBehind(): boolean {
  if (typeof window === "undefined") return false;
  return window.history.length > 1;
}
