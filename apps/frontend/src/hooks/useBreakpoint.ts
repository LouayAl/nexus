"use client";

import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640)  setBp("mobile");
      else if (w < 1024) setBp("tablet");
      else setBp("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bp;
}

export function useIsMobile() {
  const bp = useBreakpoint();
  return bp === "mobile";
}

export function useIsTablet() {
  const bp = useBreakpoint();
  return bp === "tablet";
}

export function useIsDesktop() {
  const bp = useBreakpoint();
  return bp === "desktop";
}

// Helper to pick value based on breakpoint
export function responsive<T>(bp: Breakpoint, mobile: T, tablet?: T, desktop?: T): T {
  if (bp === "mobile") return mobile;
  if (bp === "tablet")  return tablet ?? mobile;
  return desktop ?? tablet ?? mobile;
}