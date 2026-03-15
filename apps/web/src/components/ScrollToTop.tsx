"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Icon } from "@iconify/react";
import { getLenis } from "@/lib/lenisStore";

export default function ScrollToTop() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    gsap.set(btn, { opacity: 0, y: 16, pointerEvents: "none" });

    const threshold = window.innerHeight;

    const onScroll = () => {
      const past = window.scrollY > threshold;

      if (past && !visibleRef.current) {
        visibleRef.current = true;
        gsap.to(btn, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", pointerEvents: "auto", overwrite: true });
      } else if (!past && visibleRef.current) {
        visibleRef.current = false;
        gsap.to(btn, { opacity: 0, y: 16, duration: 0.3, ease: "power2.in", pointerEvents: "none", overwrite: true });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const lenis = getLenis();
    if (lenis) {
      // Use Lenis's own scrollTo — this is the only way that works with Lenis
      lenis.scrollTo(0, { duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    } else {
      // Fallback for pages without Lenis
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      aria-label="Scroll to top"
      className="fixed bottom-8 right-6 md:right-10 z-50 w-12 h-12 rounded-full bg-[#CC0000] hover:bg-[#FF2222] text-white flex items-center justify-center shadow-lg transition-colors duration-200"
      style={{ willChange: "transform, opacity" }}
    >
      <Icon icon="solar:arrow-up-linear" width={20} />
    </button>
  );
}
