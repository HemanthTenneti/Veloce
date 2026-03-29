"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

export default function InventoryCTA() {
  const t = useTranslations("InventoryCTA");

  return (
    <section className="text-white py-32 relative overflow-hidden px-6 gs-section" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div
        className="group inventory-card-perspective max-w-[1100px] mx-auto relative overflow-hidden rounded-[28px] border"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
      >
        <div className="inventory-card-shell relative p-8 md:p-12">
          <div className="inventory-card-sheen" aria-hidden="true" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/35 via-transparent to-black/5" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="eyebrow mb-6">{t("eyebrow")}</span>
            <h2 className="font-display text-4xl md:text-[4.4vw] leading-[0.92] tracking-[-0.07em] text-white mb-6 max-w-[14ch]">
              {t("heading")}
            </h2>
            <p className="font-normal text-lg mb-10 max-w-xl" style={{ color: "var(--text-secondary)" }}>
              {t("body")}
            </p>
            <Link href="/inventory" className="luxury-button luxury-button--accent">
              {t("cta")}
              <FiArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
