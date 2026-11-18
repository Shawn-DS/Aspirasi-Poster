"use client";
import { useEffect, useState, type RefObject } from "react";
import { viewportGeometry } from "../lib/viewport";

export function useChatViewport(root: RefObject<HTMLElement | null>, input?: RefObject<HTMLInputElement | HTMLTextAreaElement | null>) {
  const [view, setView] = useState({ keyboardOpen: false, height: 0 });
  useEffect(() => {
    const viewport = window.visualViewport;
    let baselineHeight = Math.max(window.innerHeight, viewport?.height ?? 0);
    let width = window.innerWidth;
    let settleTimer = 0;
    let blurTimer = 0;
    const mountTimers: number[] = [];
    function resetMobilePan() {
      if (window.matchMedia("(max-width: 600px)").matches) {
        window.scrollTo(0, 0);
        if (document.documentElement.scrollTop !== 0) document.documentElement.scrollTop = 0;
        if (document.body.scrollTop !== 0) document.body.scrollTop = 0;
      }
    }
    function update() {
      const focused = Boolean(input?.current && document.activeElement === input.current);
      const isMobile = window.matchMedia("(max-width: 600px)").matches;
      if (!focused) resetMobilePan();
      if (Math.abs(window.innerWidth - width) > 50) {
        width = window.innerWidth;
        baselineHeight = Math.max(window.innerHeight, viewport?.height ?? 0);
      }
      if (!focused) baselineHeight = Math.max(baselineHeight, window.innerHeight, viewport?.height ?? 0);
      const rawHeight = viewport?.height ?? window.innerHeight;
      const effectiveHeight = focused ? Math.min(rawHeight, window.innerHeight) : rawHeight;
      const geometry = viewportGeometry({ height: effectiveHeight, offsetTop: viewport?.offsetTop ?? 0, baselineHeight, inputFocused: focused });
      const kbOpen = geometry.keyboardOpen || (isMobile && focused);
      if (kbOpen) root.current?.classList.add("keyboard-open");
      else root.current?.classList.remove("keyboard-open");
      root.current?.style.setProperty("--visual-height", `${geometry.height}px`);
      root.current?.style.setProperty("--visual-top", `${geometry.top}px`);
      setView(previous => previous.keyboardOpen === kbOpen && previous.height === geometry.height ? previous : { keyboardOpen: kbOpen, height: geometry.height });
    }
    // Do not wait for animation frames: browsers can pause them while the native
    // keyboard is animating or the page is temporarily backgrounded.
    function schedule() { update(); }
    function onFocusIn() {
      window.clearTimeout(blurTimer);
      if (window.matchMedia("(max-width: 600px)").matches && input?.current && document.activeElement === input.current) {
        root.current?.classList.add("keyboard-open");
        window.scrollTo(0, 0);
      }
      schedule();
    }
    function onFocusOut() {
      window.clearTimeout(blurTimer);
      window.clearTimeout(settleTimer);
      // Wait briefly so tapping the submit button while the keyboard is open
      // fires its click event before the layout expands back.
      blurTimer = window.setTimeout(() => {
        resetMobilePan();
        schedule();
      }, 160);
      settleTimer = window.setTimeout(() => {
        if (!input?.current || document.activeElement !== input.current) resetMobilePan();
        schedule();
      }, 420);
    }
    resetMobilePan();
    update();
    for (const delay of [60, 180, 380, 650]) {
      mountTimers.push(window.setTimeout(() => { resetMobilePan(); update(); }, delay));
    }
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      window.clearTimeout(blurTimer);
      window.clearTimeout(settleTimer);
      for (const timer of mountTimers) window.clearTimeout(timer);
      viewport?.removeEventListener("resize", schedule); viewport?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("focusin", onFocusIn); document.removeEventListener("focusout", onFocusOut);
    };
  }, [root, input]);
  return view;
}
