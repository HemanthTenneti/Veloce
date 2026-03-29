"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";

export default function ReserveCTA() {
  const t = useTranslations("ReserveCTA");

  return (
    <section className="pt-24 pb-24 px-6 md:px-12 gs-section relative z-10" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <article
          className="group inventory-card-perspective relative overflow-hidden rounded-[28px] border"
          style={{ borderColor: "rgba(255, 140, 0, 0.26)", backgroundColor: "rgba(255, 140, 0, 0.22)" }}
        >
          <div className="inventory-card-shell relative p-10 md:p-12">
            <div className="inventory-card-sheen" aria-hidden="true" />
            <div className="absolute inset-0 pointer-events-none bg-black/18" />

            <div className="relative z-10">
              <div className="font-display text-[0.92rem] italic tracking-[0.04em] mb-8" style={{ color: "var(--text-secondary)" }}>
                {t("reserveLabel")}
              </div>
              <h2 className="font-display font-semibold tracking-[-0.06em] text-3xl md:text-[2.5rem] text-white mb-8 leading-[0.95]">
                {t("reserveHeading")}
              </h2>
              <ul className="font-mono text-sm space-y-3" style={{ color: "var(--text-secondary)" }}>
                <li className="flex items-center gap-3">
                  <Icon icon="solar:check-circle-linear" width={16} className="text-[#c9cdd1]" />
                  {t("deposit")}
                </li>
                <li className="flex items-center gap-3">
                  <Icon icon="solar:check-circle-linear" width={16} className="text-[#c9cdd1]" />
                  {t("vehicleHeld")}
                </li>
                <li className="flex items-center gap-3">
                  <Icon icon="solar:check-circle-linear" width={16} className="text-[#c9cdd1]" />
                  {t("confirmation")}
                </li>
                <li className="flex items-center gap-3">
                  <Icon icon="solar:check-circle-linear" width={16} className="text-[#c9cdd1]" />
                  {t("checkout")}
                </li>
              </ul>
            </div>
          </div>
        </article>

        <article
          className="group inventory-card-perspective relative overflow-hidden rounded-[28px] border"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
        >
          <div className="inventory-card-shell relative p-10 md:p-12">
            <div className="inventory-card-sheen" aria-hidden="true" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.03] via-transparent to-black/25" />

            <div className="relative z-10">
              <div className="font-display text-[0.92rem] italic tracking-[0.04em] mb-8" style={{ color: "var(--text-secondary)" }}>
                {t("showroomLabel")}
              </div>
              <h2 className="font-display font-semibold tracking-[-0.06em] text-3xl md:text-[2.5rem] text-white mb-8 leading-[0.95]">
                {t("showroomHeading")}
              </h2>
              <ul className="font-mono text-sm space-y-3" style={{ color: "var(--text-secondary)" }}>
                <li className="flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                  <Icon icon="solar:clock-circle-linear" width={16} className="text-[#c9cdd1]" />
                  {t("hours")}
                </li>
                <li className="flex items-center gap-3">
                  <Icon icon="solar:map-point-linear" width={16} className="text-[#c9cdd1]" />
                  {t("address1")}
                </li>
                <li className="flex items-center gap-3">
                  <Icon icon="solar:map-point-linear" width={16} className="text-[#c9cdd1]" />
                  {t("address2")}
                </li>
                <li className="flex items-center gap-3 mt-4" style={{ color: "var(--text-primary)" }}>
                  <Icon icon="solar:key-linear" width={16} className="text-[#c9cdd1]" />
                  {t("testDrives")}
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
