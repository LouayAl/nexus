"use client";
import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const mobile  = window.matchMedia("(max-width: 639px)");
    const tablet  = window.matchMedia("(min-width: 640px) and (max-width: 1023px)");

    const update = () => {
      if (mobile.matches)       setBp("mobile");
      else if (tablet.matches)  setBp("tablet");
      else                      setBp("desktop");
    };

    update();
    mobile.addEventListener("change", update);
    tablet.addEventListener("change", update);
    return () => {
      mobile.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
    };
  }, []);

  return bp;
}

export function useIsMobile()  { return useBreakpoint() === "mobile";  }
export function useIsTablet()  { return useBreakpoint() === "tablet";  }
export function useIsDesktop() { return useBreakpoint() === "desktop"; }

export function responsive<T>(bp: Breakpoint, mobile: T, tablet?: T, desktop?: T): T {
  if (bp === "mobile") return mobile;
  if (bp === "tablet") return tablet ?? mobile;
  return desktop ?? tablet ?? mobile;
}