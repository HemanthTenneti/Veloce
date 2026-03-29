"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { FiArrowUpRight, FiX } from "react-icons/fi";
import gsap from "gsap";
import { Flip } from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "@/lib/lenisStore";
import {
  formatVehicleMileage,
  formatVehiclePrice,
  getVehicleGallery,
  getVehiclePrimaryImage,
  normalizeVehicleStatus,
} from "@/lib/vehicleApi";
import type { Vehicle } from "@/types/vehicle";

interface VehicleGridProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  error?: unknown;
  onEnquire?: (vehicle: Vehicle) => void;
}

function VehicleGridSkeleton() {
  return (
    <section className="py-16 px-6 md:px-12 w-full" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[28px] border"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
          >
            <div className="gt-skeleton h-[260px] w-full" />
            <div className="space-y-4 p-6">
              <div className="gt-skeleton h-3 w-28 rounded-full" />
              <div className="gt-skeleton h-8 w-3/4 rounded-full" />
              <div className="gt-skeleton h-5 w-full rounded-full" />
              <div className="gt-skeleton h-5 w-5/6 rounded-full" />
              <div className="gt-skeleton h-px w-full" />
              <div className="flex items-center justify-between gap-4">
                <div className="gt-skeleton h-8 w-28 rounded-full" />
                <div className="gt-skeleton h-10 w-28 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function VehicleGrid({ vehicles, error, isLoading, onEnquire }: VehicleGridProps) {
  const t = useTranslations("VehicleGrid");

  const getDescription = (car: Vehicle): string =>
    car.description?.trim() || t("taglineFallback", { color: car.color });

  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const revealTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const initialRevealTweenRef = useRef<gsap.core.Tween | null>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const gridLockedHeightRef = useRef<number | null>(null);
  const reduceMotionRef = useRef(false);
  const lastAutoExpandedViewRef = useRef<string | null>(null);
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const [isTransitionLockActive, setIsTransitionLockActive] = useState(false);
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null);
  const [galleryReadyVehicleId, setGalleryReadyVehicleId] = useState<string | null>(null);
  const [activeGalleryImageByVehicle, setActiveGalleryImageByVehicle] = useState<Record<string, string>>({});

  const translateStatus = (rawStatus: string): string => {
    const normalized = normalizeVehicleStatus(rawStatus);
    const statusMap: Record<string, string> = {
      AVAILABLE: t("statusAvailable"),
      SOLD: t("statusSold"),
      RESERVED: t("statusReserved"),
    };
    return statusMap[normalized] ?? normalized;
  };

  useEffect(() => {
    gsap.registerPlugin(Flip, ScrollTrigger);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => { reduceMotionRef.current = mediaQuery.matches; };

    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", updateReducedMotion);
      revealTimelineRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (expandedVehicleId && !vehicles.some((vehicle) => vehicle.id === expandedVehicleId)) {
      const resetId = window.setTimeout(() => {
        setExpandedVehicleId(null);
        setGalleryReadyVehicleId(null);
      }, 0);
      return () => { window.clearTimeout(resetId); };
    }
  }, [expandedVehicleId, vehicles]);

  useEffect(() => {
    document.body.classList.toggle("inv-transition-lock", isTransitionLockActive);
    return () => { document.body.classList.remove("inv-transition-lock"); };
  }, [isTransitionLockActive]);

  useEffect(() => {
    if (!viewParam) { lastAutoExpandedViewRef.current = null; return; }
    if (isLoading || vehicles.length === 0 || lastAutoExpandedViewRef.current === viewParam) return;
    const target = vehicles.find((vehicle) => vehicle.id === viewParam);
    if (!target) return;
    lastAutoExpandedViewRef.current = viewParam;
    toggleVehicle(viewParam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, vehicles, viewParam]);

  useEffect(() => {
    if (isLoading || vehicles.length === 0 || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll<HTMLElement>(".inv-card");
    if (!cards.length) return;

    initialRevealTweenRef.current?.kill();
    initialRevealTweenRef.current = gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 32, willChange: "transform,opacity" },
      {
        autoAlpha: 1,
        y: 0,
        duration: reduceMotionRef.current ? 0.01 : 0.72,
        ease: "power3.out",
        force3D: true,
        stagger: reduceMotionRef.current ? 0 : 0.07,
        clearProps: "opacity,transform,will-change",
      },
    );

    const refreshId = requestAnimationFrame(() => { ScrollTrigger.refresh(); });
    return () => {
      cancelAnimationFrame(refreshId);
      initialRevealTweenRef.current?.kill();
    };
  }, [isLoading, vehicles]);

  useLayoutEffect(() => {
    const state = flipStateRef.current;
    if (!state || !gridRef.current) return;

    const activeCard = expandedVehicleId ? cardRefs.current[expandedVehicleId] : null;
    const lenis = getLenis();

    const ctx = gsap.context(() => {
      Flip.from(state, {
        duration: reduceMotionRef.current ? 0.01 : 0.9,
        ease: "expo.inOut",
        nested: true,
        scale: false,
        simple: true,
        prune: true,
        force3D: true,
        onStart: () => {
          revealTimelineRef.current?.kill();
          setGalleryReadyVehicleId(null);
          setIsTransitionLockActive(true);
          gridLockedHeightRef.current = gridRef.current?.offsetHeight ?? null;
          if (gridRef.current && gridLockedHeightRef.current) {
            gsap.set(gridRef.current, { minHeight: `${gridLockedHeightRef.current}px`, willChange: "min-height,transform,opacity" });
          }
          gsap.set(gridRef.current?.querySelectorAll(".inv-card") ?? [], { willChange: "transform,opacity" });
          lenis?.stop();
        },
        onComplete: () => {
          setIsTransitionLockActive(false);
          lenis?.start();

          if (!activeCard || !expandedVehicleId) {
            gsap.set(gridRef.current?.querySelectorAll(".inv-card") ?? [], { clearProps: "will-change" });
            if (gridRef.current) gsap.set(gridRef.current, { clearProps: "min-height,will-change" });
            gridLockedHeightRef.current = null;
            return;
          }

          const cardRect = activeCard.getBoundingClientRect();
          const cardTop = window.scrollY + cardRect.top;
          const viewportOffset = Math.max((window.innerHeight - cardRect.height) * 0.5, 24);
          const targetScrollY = Math.max(cardTop - viewportOffset, 0);

          if (lenis && !reduceMotionRef.current) {
            lenis.scrollTo(targetScrollY, { duration: 0.85, easing: (p: number) => 1 - Math.pow(1 - p, 4) });
          } else {
            window.scrollTo({ top: targetScrollY, behavior: reduceMotionRef.current ? "auto" : "smooth" });
          }

          const detailNodes = activeCard.querySelectorAll("[data-detail-fade]");
          const galleryNodes = activeCard.querySelectorAll("[data-gallery-item]");

          gsap.set(detailNodes, { willChange: "transform,opacity" });
          gsap.set(galleryNodes, { willChange: "transform,opacity" });

          revealTimelineRef.current = gsap.timeline({
            defaults: { ease: "expo.out", force3D: true },
            onComplete: () => {
              gsap.set(gridRef.current?.querySelectorAll(".inv-card") ?? [], { clearProps: "will-change" });
              if (gridRef.current) gsap.set(gridRef.current, { clearProps: "min-height,will-change" });
              gsap.set([...detailNodes, ...galleryNodes], { clearProps: "will-change" });
              gridLockedHeightRef.current = null;
            },
          });

          revealTimelineRef.current
            .fromTo(detailNodes, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: reduceMotionRef.current ? 0.01 : 0.45, stagger: reduceMotionRef.current ? 0 : 0.05 })
            .fromTo(galleryNodes, { autoAlpha: 0, y: 28, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: reduceMotionRef.current ? 0.01 : 0.55, stagger: reduceMotionRef.current ? 0 : 0.06 }, 0.12);

          setGalleryReadyVehicleId(expandedVehicleId);
        },
      });
    }, gridRef);

    flipStateRef.current = null;
    return () => ctx.revert();
  }, [expandedVehicleId]);

  const toggleVehicle = (vehicleId: string) => {
    if (!gridRef.current) return;
    flipStateRef.current = Flip.getState(gridRef.current.querySelectorAll(".inv-card"));

    const nextVehicleId = expandedVehicleId === vehicleId ? null : vehicleId;
    const targetCard = cardRefs.current[vehicleId];
    const lenis = getLenis();

    if (expandedVehicleId && expandedVehicleId !== vehicleId) {
      setActiveGalleryImageByVehicle((prev) => { const next = { ...prev }; delete next[expandedVehicleId]; return next; });
    }

    if (nextVehicleId) {
      const vehicle = vehicles.find((e) => e.id === vehicleId);
      if (vehicle) {
        setActiveGalleryImageByVehicle((prev) => ({ ...prev, [vehicleId]: getVehiclePrimaryImage(vehicle) }));
      }
    } else {
      setActiveGalleryImageByVehicle((prev) => { const next = { ...prev }; delete next[vehicleId]; return next; });
    }

    setGalleryReadyVehicleId(null);
    if (nextVehicleId && targetCard && lenis && !reduceMotionRef.current) lenis.stop();
    setExpandedVehicleId(nextVehicleId);
  };

  if (isLoading) return <VehicleGridSkeleton />;

  if (error) {
    return (
      <section className="py-16 px-6 md:px-12 w-full" style={{ backgroundColor: "var(--bg-page)" }}>
        <div className="max-w-[1440px] mx-auto rounded-[32px] border p-8 md:p-12" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
          <span className="font-mono text-xs text-[#ff8c00] tracking-[0.15em] block mb-3">{t("liveInventory")}</span>
          <h2 className="font-display text-3xl md:text-5xl tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>
            {t("errorTitle")}
          </h2>
          <p className="max-w-2xl text-base md:text-lg" style={{ color: "var(--text-secondary)" }}>
            {t("errorBody")}
          </p>
        </div>
      </section>
    );
  }

  if (vehicles.length === 0) {
    return (
      <section className="py-16 px-6 md:px-12 w-full" style={{ backgroundColor: "var(--bg-page)" }}>
        <div className="max-w-[1440px] mx-auto rounded-[32px] border p-8 md:p-12" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
          <h2 className="font-display text-3xl md:text-5xl tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>
            {t("emptyTitle")}
          </h2>
          <p className="max-w-2xl text-base md:text-lg" style={{ color: "var(--text-secondary)" }}>
            {t("emptyBody")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 md:px-12 w-full" style={{ backgroundColor: "var(--bg-page)" }}>
      <div
        ref={gridRef}
        className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        style={{ contain: "layout paint", overflowAnchor: "none" }}
      >
        {vehicles.map((car) => {
          const isExpanded = expandedVehicleId === car.id;
          const gallery = getVehicleGallery(car);
          const isGalleryReady = galleryReadyVehicleId === car.id;
          const defaultPrimaryImage = getVehiclePrimaryImage(car);
          const activePrimaryImage = activeGalleryImageByVehicle[car.id] ?? defaultPrimaryImage;

          return (
            <article
              key={car.id}
              ref={(el) => { cardRefs.current[car.id] = el; }}
              className={`group inv-card vehicle-card inventory-card-perspective relative overflow-hidden rounded-[28px] border ${isExpanded ? "sm:col-span-2 xl:col-span-3" : "cursor-pointer"}`}
              data-vehicle-id={car.id}
              data-expanded={isExpanded ? "true" : "false"}
              role="button"
              onClick={isExpanded ? undefined : () => toggleVehicle(car.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleVehicle(car.id); } }}
              tabIndex={0}
              aria-expanded={isExpanded}
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", willChange: "transform, opacity" }}
            >
              {isExpanded && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleVehicle(car.id); }}
                  className="absolute right-4 top-4 z-30 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 transition-colors hover:text-white"
                  aria-label={t("closeDetails")}
                >
                  <FiX size={12} />
                </button>
              )}

              <div
                className={`inventory-card-shell relative h-full overflow-hidden ${isExpanded ? "lg:grid lg:min-h-[44rem] lg:grid-cols-[minmax(0,1.55fr)_minmax(380px,0.92fr)]" : "flex flex-col"}`}
                style={{
                  background: isExpanded
                    ? "radial-gradient(circle at top right, rgba(223,228,232,0.08), transparent 35%), linear-gradient(180deg, rgba(255,255,255,0.03), transparent 58%), var(--bg-card)"
                    : "var(--bg-card)",
                  willChange: "transform, opacity",
                }}
              >
                <div className="inventory-card-sheen" aria-hidden="true" />
                <div className={`relative overflow-hidden ${isExpanded ? "min-h-[24rem] lg:h-full lg:min-h-[44rem]" : "aspect-[16/10]"}`}>
                  <Image
                    fill
                    src={isExpanded ? activePrimaryImage : defaultPrimaryImage}
                    alt={`${car.make} ${car.model}`}
                    className="zoom-img object-cover object-center brightness-[0.9] transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    loading="lazy"
                    style={{ willChange: "transform, opacity" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/18 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/18 via-transparent to-black/10" />

                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3 z-10">
                    <span className="metal-status">{translateStatus(car.status)}</span>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between gap-4">
                    <div>
                      <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/55 mb-2">
                        {car.year} · {car.make}
                      </div>
                      <h3 className="font-display text-[2rem] md:text-[2.6rem] tracking-[-0.06em] text-white leading-none">
                        {car.model}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className={`relative flex flex-col ${isExpanded ? "justify-between p-7 md:p-10" : "p-6"}`}>
                  <div className="mb-4 font-drama text-lg italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    &quot;{getDescription(car)}&quot;
                  </div>

                  <div className="mb-5 flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-2">
                      <Icon icon="solar:route-linear" width={14} />
                      {formatVehicleMileage(car.mileage, t("mileageTbc"))}
                    </span>
                    <span className="flex items-center gap-2">
                      <Icon icon="solar:pallete-2-linear" width={14} />
                      {car.color}
                    </span>
                    <span className="flex items-center gap-2">
                      <Icon icon="solar:calendar-linear" width={14} />
                      {car.year}
                    </span>
                  </div>

                  <div className="mb-6">
                    {car.marketPrice && car.carstreetPrice ? (
                      <div className="flex flex-col gap-1">
                        <div className="font-mono text-sm text-[#999] line-through">
                          {car.marketPrice}
                        </div>
                        <div className="font-display text-2xl md:text-3xl tracking-[-0.05em] text-[#E0E3E6]">
                          {car.carstreetPrice}
                        </div>
                      </div>
                    ) : (
                      <div className="font-display text-2xl md:text-3xl tracking-[-0.05em] text-[#E0E3E6]">
                        {formatVehiclePrice(car.price, t("priceOnRequest"))}
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <>
                      <button
                        type="button"
                        data-detail-fade
                        onClick={(e) => { e.stopPropagation(); onEnquire?.(car); }}
                        className="luxury-button luxury-button--accent mb-8 w-full"
                        style={{ willChange: "transform, opacity" }}
                        aria-label={`${t("enquireNow")} — ${car.year} ${car.make} ${car.model}`}
                        data-testid="enquire-now-btn"
                      >
                        {t("enquireNow")}
                        <FiArrowUpRight size={17} />
                      </button>

                      {/* Vehicle Specifications Section */}
                      <div className="mb-8" data-detail-fade>
                        <h4 className="mb-4 font-mono text-[10px] tracking-[0.34em] uppercase" style={{ color: "#DEE3E8" }}>
                          Vehicle Specifications
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {car.regYear && (
                            <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                              <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>Registration Year</div>
                              <div className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{car.regYear}</div>
                            </div>
                          )}
                          {car.makeYear && (
                            <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                              <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>Make Year</div>
                              <div className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{car.makeYear}</div>
                            </div>
                          )}
                          {car.kmDriven && (
                            <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                              <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>KM Driven</div>
                              <div className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{car.kmDriven} km</div>
                            </div>
                          )}
                          {car.fuelType && (
                            <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                              <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>Fuel Type</div>
                              <div className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{car.fuelType}</div>
                            </div>
                          )}
                          {car.transmission && (
                            <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                              <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>Transmission</div>
                              <div className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{car.transmission}</div>
                            </div>
                          )}
                          {car.numOwners && (
                            <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                              <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>Owners</div>
                              <div className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{car.numOwners}</div>
                            </div>
                          )}
                          {car.regState && (
                            <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                              <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>Reg. State</div>
                              <div className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{car.regState}</div>
                            </div>
                          )}
                          {car.mileageText && (
                            <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                              <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>Mileage</div>
                              <div className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{car.mileageText}</div>
                            </div>
                          )}
                          {car.topSpeed && (
                            <div className="rounded-xl border p-3 col-span-2" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                              <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>Top Speed</div>
                              <div className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{car.topSpeed}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-1" data-detail-fade>
                        <h4 className="mb-5 font-mono text-[10px] tracking-[0.34em] uppercase" style={{ color: "#DEE3E8" }}>
                          {t("visualDetails")}
                        </h4>

                        {isGalleryReady ? (
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            {gallery.map((imageUrl, index) => {
                              const isActiveImage = activePrimaryImage === imageUrl;
                              return (
                                <button
                                  key={`${car.id}-${index}`}
                                  type="button"
                                  data-gallery-item
                                  onClick={(e) => { e.stopPropagation(); setActiveGalleryImageByVehicle((prev) => ({ ...prev, [car.id]: imageUrl })); }}
                                  className={`group/image relative overflow-hidden rounded-[20px] border text-left transition-colors ${isActiveImage ? "ring-1 ring-[#D8DDE2]" : ""}`}
                                  style={{
                                    borderColor: isActiveImage ? "rgba(216,221,226,0.55)" : "rgba(255,255,255,0.14)",
                                    backgroundColor: "rgba(255,255,255,0.03)",
                                    willChange: "transform, opacity",
                                  }}
                                  aria-label={`Set primary image to frame ${index + 1}`}
                                  aria-pressed={isActiveImage}
                                >
                                  <div className="relative aspect-[4/3] overflow-hidden">
                                    <Image
                                      fill
                                      src={imageUrl}
                                      alt={`${car.make} ${car.model} image ${index + 1}`}
                                      className="object-cover transition-transform duration-700 group-hover/image:scale-[1.05]"
                                      sizes="(max-width: 640px) 50vw, 33vw"
                                      loading="lazy"
                                      style={{ willChange: "transform, opacity" }}
                                    />
                                  </div>
                                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/75 via-black/20 to-transparent px-3 py-3">
                                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/80">
                                      {t("frame", { n: String(index + 1).padStart(2, "0") })}
                                    </span>
                                    <Icon icon="solar:camera-minimalistic-linear" width={14} className="text-white/70" />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-live="polite">
                            {Array.from({ length: Math.min(gallery.length, 10) }).map((_, index) => (
                              <div
                                key={`${car.id}-gallery-skeleton-${index}`}
                                className="gt-skeleton aspect-[4/3] rounded-[20px]"
                                data-gallery-item
                                style={{ willChange: "transform, opacity" }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-16 text-center flex flex-col items-center gap-3">
        <div className="font-display text-xl md:text-2xl tracking-[-0.05em]" style={{ color: "var(--text-primary)" }}>
          {t("syncStatus", { count: vehicles.length })}
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
          {t("openCard")}
        </div>
      </div>
    </section>
  );
}
