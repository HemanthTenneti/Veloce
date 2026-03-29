"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface InventoryHeaderProps {
  total: number;
  isLoading: boolean;
}

export default function InventoryHeader({ total, isLoading }: InventoryHeaderProps) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);
  const t = useTranslations("InventoryHeader");

  useEffect(() => {
    if (isLoading) {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      return;
    }

    const target = total;
    const duration = 1200;
    let startTime: number | null = null;

    const animateCount = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.round(target * progress));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animateCount);
      }
    };

    frameRef.current = requestAnimationFrame(animateCount);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [isLoading, total]);

  return (
    <section className="w-full relative px-6 md:px-12 pt-32 pb-10 md:pt-40 md:pb-12" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="section-shell max-w-[1440px] mx-auto w-full px-7 py-8 md:px-10 md:py-10 flex flex-col gap-8 md:flex-row md:justify-between md:items-end relative z-10">
        <div>
          <span className="eyebrow mb-4">
            {t("eyebrow")}
          </span>
          <h1 className="font-display text-4xl md:text-[4vw] leading-none tracking-[-0.07em]" style={{ color: "var(--text-primary)" }}>
            {t("heading")}
          </h1>
        </div>
        <div className="text-left md:text-right">
          <div className="font-mono text-[10px] tracking-[0.26em] mb-2" style={{ color: "var(--text-muted)" }}>
            {t("vehiclesInStock")}
          </div>
          {isLoading ? (
            <div className="gt-skeleton h-14 w-24 ml-0 md:ml-auto rounded-2xl" />
          ) : (
            <div className="font-display text-5xl md:text-6xl tracking-[-0.06em]" style={{ color: "var(--text-primary)" }}>
              {count}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
