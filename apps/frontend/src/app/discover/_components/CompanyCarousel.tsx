"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EntreprisePublic } from "@/lib/api";
import { resolveAvatarUrl } from "@/lib/avatar";

const CAROUSEL_SET_KEYS = [
  "carousel-set-a",
  "carousel-set-b",
  "carousel-set-c",
];

export function CompanyCarousel({
  entreprises,
}: {
  entreprises: EntreprisePublic[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLFieldSetElement>(null);
  const setRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const scrollPosRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);
  const autoScrollVelocityRef = useRef<number>(-1.5);
  const isDraggingRef = useRef<boolean>(false);
  const isCarouselVisibleRef = useRef<boolean>(true);
  const isCarouselIntersectingRef = useRef<boolean>(true);
  const loopWidthRef = useRef<number>(0);

  const wrapScrollPosition = useCallback((position: number) => {
    const loopWidth = loopWidthRef.current;
    if (loopWidth <= 0) return position;

    if (position <= -loopWidth) {
      return position + loopWidth;
    }

    if (position > 0) {
      return position - loopWidth;
    }

    return position;
  }, []);

  const applyScrollPosition = useCallback(
    (position: number) => {
      scrollPosRef.current = wrapScrollPosition(position);

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${scrollPosRef.current}px)`;
      }
    },
    [wrapScrollPosition],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
  };

  const handleMouseMove = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current) return;

      const deltaX = clientX - lastXRef.current;
      velocityRef.current = deltaX;
      lastXRef.current = clientX;

      applyScrollPosition(scrollPosRef.current + deltaX);
    },
    [applyScrollPosition],
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      handleMouseMove(e.clientX);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const measureLoop = () => {
      loopWidthRef.current = setRef.current?.offsetWidth ?? 0;
      applyScrollPosition(scrollPosRef.current);
    };

    measureLoop();

    const resizeObserver = new ResizeObserver(measureLoop);
    if (setRef.current) resizeObserver.observe(setRef.current);
    window.addEventListener("resize", measureLoop);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureLoop);
    };
  }, [applyScrollPosition]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateVisibility = () => {
      isCarouselVisibleRef.current =
        isCarouselIntersectingRef.current &&
        document.visibilityState === "visible";
    };

    const observer = new IntersectionObserver(([entry]) => {
      isCarouselIntersectingRef.current = entry.isIntersecting;
      updateVisibility();
    });

    observer.observe(container);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  // Start animation loop once on mount
  useEffect(() => {
    let frameId = 0;
    let timeoutId = 0;

    const scheduleNextFrame = (callback: FrameRequestCallback) => {
      if (isCarouselVisibleRef.current) {
        frameId = requestAnimationFrame(callback);
        return;
      }

      timeoutId = window.setTimeout(() => callback(performance.now()), 250);
    };

    const animate = () => {
      let newPos = scrollPosRef.current;

      if (isDraggingRef.current) {
        // During drag, movement comes directly from pointer movement.
      } else if (Math.abs(velocityRef.current) > 0.5) {
        // Momentum scrolling is active
        newPos += velocityRef.current;
        velocityRef.current *= 0.93;
      } else {
        // Auto-scroll
        newPos += autoScrollVelocityRef.current;
      }

      applyScrollPosition(newPos);
      scheduleNextFrame(animate);
    };

    scheduleNextFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [applyScrollPosition]);

  return (
    <section
      style={{
        background: "linear-gradient(180deg, #FAFAF8 0%, white 100%)",
        padding: "72px 0 80px",
        borderTop: "1px solid rgba(16,64,107,0.07)",
        overflow: "hidden",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 52, padding: "0 64px" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#5A7A96",
            marginBottom: 10,
          }}
        >
          Ils nous font confiance
        </div>
        <h2
          className="font-display"
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#10406B",
            letterSpacing: "-0.02em",
          }}
        >
          Entreprises partenaires
        </h2>
      </div>

      <fieldset
        ref={containerRef}
        aria-label="Carousel des entreprises partenaires"
        style={{
          border: 0,
          overflow: "hidden",
          padding: 0,
          position: "relative",
          minInlineSize: 0,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Fade edges */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 140,
            background: "linear-gradient(90deg, white, transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 140,
            background: "linear-gradient(-90deg, white, transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <div
          ref={trackRef}
          style={{
            display: "flex",
            width: "max-content",
            willChange: "transform",
          }}
        >
          {CAROUSEL_SET_KEYS.map((setKey, setIndex) => (
            <div
              key={setKey}
              ref={setIndex === 0 ? setRef : undefined}
              style={{ display: "flex", flexShrink: 0 }}
            >
              {entreprises.map((co) => {
                const logoSrc = resolveAvatarUrl(co.logoUrl);
                return (
                  <div
                    key={`${setKey}-${co.id}`}
                    className="carousel-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      padding: "20px 44px",
                      borderRight: "1px solid rgba(16,64,107,0.06)",
                      borderRadius: 20,
                      flexShrink: 0,
                      cursor: "pointer",
                      transition: "background 0.2s",
                      userSelect: "none",
                    }}
                  >
                    {/* Logo or initial */}
                    <div
                      style={{
                        width: 90,
                        height: 56,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: logoSrc
                          ? "white"
                          : "linear-gradient(135deg, #10406B, #2284C0)",
                        border: logoSrc
                          ? "1px solid rgba(16,64,107,0.1)"
                          : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        fontWeight: 800,
                        color: "white",
                        fontFamily: "'Fraunces',serif",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(16,64,107,0.1)",
                      }}
                    >
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={co.nom}
                          draggable={false}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            padding: 4,
                            pointerEvents: "none",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        co.nom.charAt(0)
                      )}
                    </div>

                    {/* Name + sector */}
                    <div style={{ pointerEvents: "none" }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#0D2137",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {co.nom}
                      </div>
                      {co.secteur && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#5A7A96",
                            marginTop: 2,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {co.secteur}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
