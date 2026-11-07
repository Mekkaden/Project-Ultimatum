#!/bin/bash
# Print what Android says Ultimatum is currently allowed to read from Health Connect.
#
# "granted=false" for every type after tapping Allow on the phone means the
# system never persisted the grant (Health Connect not connected, or the
# package flagged as side-loaded) — not a bug in the app's sync code.
#
# Usage:  ./scripts/health-perms.sh            (phone plugged in, USB debugging on)
#         ./scripts/health-perms.sh --watch     (re-prints every second while you grant)

ADB="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
PKG="com.ultimatum.app"
TYPES="READ_STEPS READ_SLEEP READ_WEIGHT READ_EXERCISE READ_HEART_RATE READ_RESTING_HEART_RATE"

if ! "$ADB" get-state >/dev/null 2>&1; then
  echo "No device/emulator connected. Enable USB debugging and run 'adb devices'."
  exit 1
fi

show() {
  echo "--- $(date '+%H:%M:%S') ---"
  for t in $TYPES; do
    r=$("$ADB" shell dumpsys package "$PKG" 2>/dev/null | grep "android.permission.health.$t:" )
    echo "${r:-android.permission.health.$t: NOT GRANTED}"
  done
  hc=$("$ADB" shell pm list packages 2>/dev/null | grep -c "com.google.android.apps.healthdata")
  echo "Health Connect (play-store) installed: $([ "$hc" -gt 0 ] && echo yes || echo no)"
  echo "Health Connect SDK status from the app:"
  "$ADB" logcat -d -s Capacitor/Console:* 2>/dev/null | grep -i "health" | tail -5
}

if [ "$1" = "--watch" ]; then
  while true; do clear; show; sleep 1; done
fi
show
