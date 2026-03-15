"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Custom hook that registers all GSAP / ScrollTrigger animations
 * for the landing page.
 */
export function useGsapAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.set([".inv-card", ".inventory-card-shell", ".zoom-img", "[data-detail-fade]", "[data-gallery-item]"], {
      willChange: "transform, opacity",
      force3D: true,
    });

    // 1. Section scroll reveals (gs-section)
    //    - force3D pushes transforms to GPU compositor
    //    - "play none none reverse" lets sections re-animate when scrolling back
    const sections = gsap.utils.toArray<HTMLElement>(".gs-section");
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 40, force3D: true, willChange: "transform,opacity" },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          force3D: true,
          clearProps: "will-change",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // 2. Scan line bottom
    ScrollTrigger.create({
      trigger: "#scan-line-bottom",
      start: "top 90%",
      onEnter: () =>
        gsap.to("#scan-line-bottom", {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.out",
          force3D: true,
          willChange: "transform,opacity",
          clearProps: "will-change",
        }),
    });

    // 3. Stack card blur → focus scrub
    //    Use willChange management to avoid permanent GPU memory usage
    const stackCards = gsap.utils.toArray<HTMLElement>(".stack-card");
    stackCards.forEach((card, i) => {
      if (i > 0 && window.innerWidth > 768) {
        gsap.set(card, { opacity: 0.5, scale: 0.95, filter: "blur(4px)" });
        gsap.to(card, {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          force3D: true,
          scrollTrigger: {
            trigger: card,
            start: "top 75%",
            end: "top 40%",
            scrub: 0.5,
            onEnter: () => { card.style.willChange = "transform, opacity, filter"; },
            onLeave: () => { card.style.willChange = "auto"; },
            onEnterBack: () => { card.style.willChange = "transform, opacity, filter"; },
            onLeaveBack: () => { card.style.willChange = "auto"; },
          },
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.set([".inv-card", ".inventory-card-shell", ".zoom-img", "[data-detail-fade]", "[data-gallery-item]"], {
        clearProps: "will-change",
      });
    };
  }, []);
}
