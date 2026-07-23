"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Scrolls to `resultRef` when `isActive` transitions from true → false.
 */
export function useScrollToResult(
  isActive: boolean,
  resultRef: RefObject<HTMLElement | null>,
  enabled = true
) {
  const wasActive = useRef(false);

  useEffect(() => {
    if (!enabled) {
      wasActive.current = isActive;
      return;
    }

    if (wasActive.current && !isActive && resultRef.current) {
      const timer = window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
      wasActive.current = isActive;
      return () => window.clearTimeout(timer);
    }

    wasActive.current = isActive;
  }, [isActive, resultRef, enabled]);
}
