"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Scroll-to-top button (PRD §58).
 * Appears after 300px scroll, honors prefers-reduced-motion.
 */
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const scrollToTop = () => {
    if (reducedMotion) {
      window.scrollTo({ top: 0 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 left-6 z-50 flex size-11 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-soft-lg",
        "transition-all duration-200 hover:scale-105 hover:shadow-soft-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "opacity-0 pointer-events-none",
        "data-[visible=true]:opacity-100 data-[visible=true]:pointer-events-auto",
      )}
      data-visible={visible}
      aria-label="بازگشت به بالا"
    >
      <ChevronUp className="size-5" aria-hidden />
    </button>
  );
}