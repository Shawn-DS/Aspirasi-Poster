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
    function update() {
      const focused = Boolean(input?.current && document.activeElement === input.current);
      if (Math.abs(window.innerWidth - width) > 50) {
        width = window.innerWidth;
        baselineHeight = Math.max(window.innerHeight, viewport?.height ?? 0);
      }
      if (!focused) baselineHeight = Math.max(baselineHeight, window.innerHeight, viewport?.height ?? 0);
      const geometry = viewportGeometry({ height: Math.min(viewport?.height ?? window.innerHeight, window.innerHeight), offsetTop: viewport?.offsetTop ?? 0, baselineHeight, inputFocused: focused });
      root.current?.style.setProperty("--visual-height", `${geometry.height}px`);
      root.current?.style.setProperty("--visual-top", `${geometry.top}px`);
      setView(previous => previous.keyboardOpen === geometry.keyboardOpen && previous.height === geometry.height ? previous : { keyboardOpen: geometry.keyboardOpen, height: geometry.height });
    }
    // Do not wait for animation frames: browsers can pause them while the native
    // keyboard is animating or the page is temporarily backgrounded.
    function schedule() { update(); }
    function onFocusChange() {
      schedule();
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        // Let the native keyboard animation settle, then discard any page pan.
        if ((!input?.current || document.activeElement !== input.current) && window.matchMedia("(max-width: 600px)").matches) window.scrollTo(0, 0);
        schedule();
      }, 350);
    }
    update();
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    document.addEventListener("focusin", onFocusChange);
    document.addEventListener("focusout", onFocusChange);
    return () => {
      window.clearTimeout(settleTimer);
      viewport?.removeEventListener("resize", schedule); viewport?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("focusin", onFocusChange); document.removeEventListener("focusout", onFocusChange);
    };
  }, [root, input]);
  return view;
}
