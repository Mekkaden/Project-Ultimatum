"use client";

import { useEffect, useState } from "react";

/**
 * True while the on-screen keyboard is open.
 *
 * The WebView is configured with `resize: "body"` / `adjustResize`, so the
 * keyboard shrinks the viewport rather than floating over a frozen layout.
 * Anything pinned to the bottom of the screen (the floating tab bar) has to
 * know the keyboard took that space, otherwise it ends up sitting on top of the
 * keys and covering the field the user is typing into.
 *
 * `window.visualViewport` is the reliable signal in a WebView: `innerHeight`
 * only changes with the window, while the visual viewport shrinks for the
 * keyboard as well.
 */
export function useKeyboardOpen(threshold = 140): boolean {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const viewport = window.visualViewport;
    if (!viewport) return;

    // The largest height seen is the keyboard-less height. Comparing against a
    // remembered maximum (rather than a snapshot at mount) keeps the answer
    // correct when the viewport legitimately resizes, e.g. rotating the phone.
    let maxHeight = viewport.height;

    const update = () => {
      if (viewport.height > maxHeight) maxHeight = viewport.height;
      const covered = maxHeight - viewport.height;
      const focused = isTextEntry(document.activeElement);
      setKeyboardOpen(focused && covered > threshold);
    };

    // Focusing lands slightly before the keyboard finishes sliding in, and
    // blurring lands slightly before it slides out; both re-run update() so the
    // state settles on the right value instead of flashing.
    const onFocus = () => update();
    const onBlur = () => {
      onFocus();
      // After blur the viewport may still be shrunk for a frame or two.
      window.setTimeout(update, 250);
    };

    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("focusin", onFocus);
    window.addEventListener("focusout", onBlur);
    update();

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("focusin", onFocus);
      window.removeEventListener("focusout", onBlur);
    };
  }, [threshold]);

  return keyboardOpen;
}

function isTextEntry(element: Element | null): boolean {
  if (!element) return false;
  const tag = element.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag !== "INPUT") return Boolean((element as HTMLElement).isContentEditable);
  const type = (element as HTMLInputElement).type;
  // Pickers and checkboxes open no keyboard and must not hide the nav.
  return !["checkbox", "radio", "button", "submit", "reset", "range", "color", "file"].includes(type);
}
