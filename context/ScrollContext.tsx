"use client";

import Lenis from "lenis";
import React, { useEffect, useTransition } from "react";

const SmoothScrollerContext = React.createContext<Lenis | null>(null);

export const useSmoothScroller = () => React.useContext(SmoothScrollerContext);

const ScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const [lenis, setLenis] = React.useState<Lenis | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, startTransition] = useTransition();

  useEffect(() => {
    // Initialize Lenis
    const lenisInstance = new Lenis({
      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Animation frame function
    let animationFrameId: number;

    const raf = (time: number) => {
      lenisInstance.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };

    animationFrameId = requestAnimationFrame(raf);

    // Wrap setState in startTransition to avoid sync updates
    startTransition(() => {
      setLenis(lenisInstance);
    });

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      lenisInstance.destroy();
    };
  }, []);

  return (
    <SmoothScrollerContext.Provider value={lenis}>
      {children}
    </SmoothScrollerContext.Provider>
  );
};

export default ScrollProvider;
