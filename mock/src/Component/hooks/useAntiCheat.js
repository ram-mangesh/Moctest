import { useEffect, useRef } from "react";

/**
 * useAntiCheat
 *
 * Detects and reports cheating attempts during a mock test.
 * Calls onViolation(reason) for each detected event.
 *
 * Detections:
 *
 *  1. TAB_SWITCH / WINDOW_BLUR
 *     Student switches to another tab or app.
 *     document.visibilitychange → hidden
 *     window.blur event
 *
 *  2. SPLIT_SCREEN (Edge Copilot, Windows Snap, etc.)
 *     Window width drops by > 30% suddenly.
 *     Edge Copilot splits the browser into two panels —
 *     the exam page shrinks to ~50% width.
 *     Detection: window.resize → compare width to baseline.
 *
 *  3. COPY_PASTE
 *     Student copies question text or pastes an answer.
 *     document copy/paste/cut events.
 *
 *  4. RIGHT_CLICK
 *     Right-click context menu (access to search, inspect).
 *
 *  5. KEYBOARD_SHORTCUT
 *     Ctrl+C, Ctrl+V, Ctrl+F, Ctrl+U (view source),
 *     F12 (DevTools), Alt+Tab signal.
 *
 *  6. FULLSCREEN_EXIT
 *     Student exits fullscreen (minimise, F11, Esc).
 *     Fullscreen is required by MockTest — exiting = violation.
 *
 *  7. DEVTOOLS_OPEN (heuristic)
 *     window.outerWidth - window.innerWidth > 160 = DevTools open.
 *     Checked every 3 seconds.
 *
 * Usage:
 *   useAntiCheat({ onViolation: (reason) => handleViolation(reason) })
 *
 * Options:
 *   onViolation      — required — callback with violation reason string
 *   disableSplit     — default true  — detect split screen
 *   disableTabSwitch — default true  — detect tab/window switch
 *   disableCopy      — default true  — detect copy/paste
 *   disableDevTools  — default false — devtools heuristic (can false-positive)
 */

const SPLIT_THRESHOLD = 0.30; // >30% width reduction = split screen
const DEVTOOLS_WIDTH  = 160;  // px gap that indicates DevTools open

const useAntiCheat = ({
  onViolation,
  disableSplit      = false,
  disableTabSwitch  = false,
  disableCopy       = false,
  disableDevTools   = false,
} = {}) => {

  const baseWidthRef   = useRef(window.innerWidth);
  const lastWidthRef   = useRef(window.innerWidth);
  const splitFiredRef  = useRef(false);  // debounce split alert
  const devToolsRef    = useRef(false);
  const blurTimerRef   = useRef(null);

  const fire = (reason) => {
    if (typeof onViolation === "function") onViolation(reason);
  };

  useEffect(() => {
    // Store baseline width when exam starts
    baseWidthRef.current = window.innerWidth;
    lastWidthRef.current = window.innerWidth;

    /* ── 1. TAB SWITCH via Visibility API ─────────────────────────── */
    const onVisibilityChange = () => {
      if (!disableTabSwitch && document.visibilityState === "hidden") {
        fire("Tab switched or window minimised");
      }
    };

    /* ── 2. WINDOW BLUR (Alt+Tab, clicking outside browser) ───────── */
    const onBlur = () => {
      if (disableTabSwitch) return;
      // Small delay — blur fires on DevTools too, debounce to avoid double
      blurTimerRef.current = setTimeout(() => {
        if (document.visibilityState === "visible") {
          fire("Window lost focus — possible screen switching");
        }
      }, 500);
    };

    const onFocus = () => clearTimeout(blurTimerRef.current);

    /* ── 3. SPLIT SCREEN — Edge Copilot + Windows Snap ────────────── */
    const onResize = () => {
      if (disableSplit) return;

      const currentWidth = window.innerWidth;
      const baseWidth    = baseWidthRef.current;
      const drop         = (baseWidth - currentWidth) / baseWidth;

      // Width dropped by more than 30% = split screen activated
      if (drop > SPLIT_THRESHOLD && !splitFiredRef.current) {
        splitFiredRef.current = true;
        fire(
          `Split screen detected — page width dropped from ${Math.round(baseWidth)}px ` +
          `to ${Math.round(currentWidth)}px (${Math.round(drop * 100)}% reduction). ` +
          `Edge Copilot or screen split is not allowed during the exam.`
        );
      }

      // Reset flag when width returns to normal (panel closed)
      if (drop < 0.10 && splitFiredRef.current) {
        splitFiredRef.current = false;
        // Update base to current so we catch next split
        baseWidthRef.current = currentWidth;
      }

      lastWidthRef.current = currentWidth;
    };

    /* ── 4. COPY / PASTE / CUT ────────────────────────────────────── */
    const onCopy = () => {
      if (!disableCopy) fire("Text copied during exam");
    };
    const onPaste = () => {
      if (!disableCopy) fire("Text pasted during exam");
    };
    const onCut = () => {
      if (!disableCopy) fire("Text cut during exam");
    };

    /* ── 5. RIGHT CLICK ───────────────────────────────────────────── */
    const onContextMenu = (e) => {
      e.preventDefault();
      fire("Right-click attempted during exam");
    };

    /* ── 6. KEYBOARD SHORTCUTS ────────────────────────────────────── */
    const onKeyDown = (e) => {
      const key  = e.key?.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const alt  = e.altKey;

      // Block and flag suspicious shortcuts
      if (ctrl && key === "c") { fire("Ctrl+C (copy) detected"); return; }
      if (ctrl && key === "v") { fire("Ctrl+V (paste) detected"); return; }
      if (ctrl && key === "a") { e.preventDefault(); return; } // select all — block silently
      if (ctrl && key === "f") { e.preventDefault(); fire("Ctrl+F (find) detected"); return; }
      if (ctrl && key === "u") { e.preventDefault(); fire("Ctrl+U (view source) detected"); return; }
      if (ctrl && key === "s") { e.preventDefault(); return; } // save — block silently
      if (ctrl && key === "p") { e.preventDefault(); fire("Ctrl+P (print) detected"); return; }
      if (key === "f12")        { e.preventDefault(); fire("F12 (DevTools) detected"); return; }
      if (key === "f11")        { /* fullscreen toggle — handled by fullscreen exit event */ return; }
      if (alt && key === "tab") { fire("Alt+Tab detected"); return; }

      // Windows key attempts
      if (e.metaKey && key === "tab") { fire("Window switching shortcut detected"); return; }
    };

    /* ── 7. FULLSCREEN EXIT ───────────────────────────────────────── */
    const onFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      );
      if (!isFullscreen) {
        fire("Fullscreen exited — exam requires fullscreen mode");
      }
    };

    /* ── 8. DEVTOOLS HEURISTIC (polling) ──────────────────────────── */
    let devToolsInterval = null;
    if (!disableDevTools) {
      devToolsInterval = setInterval(() => {
        const widthDiff  = window.outerWidth  - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        const open = widthDiff > DEVTOOLS_WIDTH || heightDiff > DEVTOOLS_WIDTH;
        if (open && !devToolsRef.current) {
          devToolsRef.current = true;
          fire("Developer tools appear to be open");
        }
        if (!open) devToolsRef.current = false;
      }, 3000);
    }

    /* ── Register all listeners ───────────────────────────────────── */
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur",              onBlur);
    window.addEventListener("focus",             onFocus);
    window.addEventListener("resize",            onResize);
    document.addEventListener("copy",            onCopy);
    document.addEventListener("paste",           onPaste);
    document.addEventListener("cut",             onCut);
    document.addEventListener("contextmenu",     onContextMenu);
    document.addEventListener("keydown",         onKeyDown);
    document.addEventListener("fullscreenchange",       onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange",    onFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur",              onBlur);
      window.removeEventListener("focus",             onFocus);
      window.removeEventListener("resize",            onResize);
      document.removeEventListener("copy",            onCopy);
      document.removeEventListener("paste",           onPaste);
      document.removeEventListener("cut",             onCut);
      document.removeEventListener("contextmenu",     onContextMenu);
      document.removeEventListener("keydown",         onKeyDown);
      document.removeEventListener("fullscreenchange",       onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("mozfullscreenchange",    onFullscreenChange);
      clearTimeout(blurTimerRef.current);
      if (devToolsInterval) clearInterval(devToolsInterval);
    };
  }, [onViolation, disableSplit, disableTabSwitch, disableCopy, disableDevTools]);
};

export default useAntiCheat;