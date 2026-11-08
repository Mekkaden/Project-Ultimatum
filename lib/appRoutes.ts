// Shows the bottom tab bar. Onboarding, auth, and landing screens hide it.
export const APP_TAB_ROUTES = ["/campaign", "/diet", "/training-insights", "/settings"];

// Screens reachable from onboarding/auth/legal flows. These hide the tab bar
// but are NOT primary tabs: pressing back on them must navigate history
// (e.g. back to /auth) instead of exiting the app.
export const NON_TAB_APP_ROUTES = [
  "/settings/advanced",
  "/settings/exercises",
  "/sleep",
  "/water",
  "/supplements",
  "/doctrine",
  "/truths",
  "/arena",
  "/manual-nutrition",
  "/auto-setup",
  "/setup-mode",
  "/frequency",
  "/directive",
  "/campaign/track",
  "/downloads",
  "/faq",
  "/privacy",
  "/privacy-policy",
  "/terms-of-service",
  "/delete-account",
];

export const HIDDEN_NAV_ROUTES = [
  "/",
  "/auth",
  "/directive",
  "/frequency",
  "/setup-mode",
  "/auto-setup",
  "/manual-nutrition",
  "/privacy",
  "/privacy-policy",
  "/terms-of-service",
  "/delete-account",
  "/faq",
  "/downloads",
];

export function isPrimaryTab(pathname: string): boolean {
  return APP_TAB_ROUTES.includes(pathname);
}

export function isHiddenNavRoute(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/campaign/track") || HIDDEN_NAV_ROUTES.includes(pathname);
}

// Roots where the hardware back button exits the app. Every other route must
// pop history — exiting from a deep screen made the app "jump out" onto the
// home screen mid-navigation.
export function isBackExitRoute(pathname: string): boolean {
  return pathname === "/" || isPrimaryTab(pathname);
}
