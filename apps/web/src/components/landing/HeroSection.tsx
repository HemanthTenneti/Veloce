"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import SplineViewer from "@/components/SplineViewer";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [splinePaused, setSplinePaused] = useState(false);
  const t = useTranslations("HeroSection");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gs-reveal",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.6,
          transform: "translate3d(0, 0, 0)",
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom+=200",
      end: "bottom top-=200",
      onEnter: () => setSplinePaused(false),
      onLeave: () => setSplinePaused(true),
      onEnterBack: () => setSplinePaused(false),
      onLeaveBack: () => setSplinePaused(true),
    });

    return () => { trigger.kill(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100dvh] flex items-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0 spline-bg w-full h-full" />
      <div className="hero-fog z-10" />

      <div className="hidden lg:block absolute inset-0 z-[11] w-full h-full">
        <SplineViewer paused={splinePaused} />
      </div>

      <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 pointer-events-none">
        <div className="flex-1 min-w-0 hero-content pt-28 md:pt-32 max-w-[42rem]">
          <span className="eyebrow mb-5 gs-reveal">
            {t("eyebrow")}
          </span>
          <h1
            className="font-display text-[12vw] md:text-[5.3vw] leading-[0.88] tracking-[-0.07em] mb-3 gs-reveal"
            style={{ color: "var(--text-primary)" }}
          >
            {t("h1")}
          </h1>
          <h2
            className="font-drama italic text-[13vw] md:text-[6.2vw] leading-[0.82] mb-8 tracking-[-0.05em] gs-reveal"
            style={{ color: "var(--text-primary)" }}
          >
            {t("h2")}
          </h2>
          <p
            className="font-normal text-base md:text-[1.05rem] max-w-xl mb-10 leading-7 gs-reveal"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("body")}
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4 gs-reveal pointer-events-auto">
            <Link href="/inventory" className="luxury-button luxury-button--accent">
              {t("browseInventory")}
              <FiArrowUpRight size={16} />
            </Link>
            <a href="#site-footer" className="luxury-button luxury-button--ghost">
              {t("contactUs")}
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gs-reveal">
        <div
          className="w-[1px] h-12 relative overflow-hidden"
          style={{ backgroundColor: "var(--scroll-cue-line)" }}
        >
          <div
            className="absolute top-0 left-0 w-full h-1/2 animate-[slideDown_1.5s_ease-in-out_infinite]"
            style={{ backgroundColor: "var(--scroll-cue-tick)" }}
          />
        </div>
      </div>
    </section>
  );
}
