"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useVehicles } from "@/hooks/useVehicles";
import {
  formatVehiclePrice,
  getVehiclePrimaryImage,
} from "@/lib/vehicleApi";

function FeaturedVehiclesSkeleton({ isDesktop, eyebrow }: { isDesktop: boolean; eyebrow: string }) {
  if (!isDesktop) {
    return (
      <section className="relative w-full py-8" style={{ backgroundColor: "#050505" }}>
        <div className="px-6 pt-6 pb-6 z-20">
           <span className="font-mono text-xs text-[#ff8c00] tracking-[0.15em] block mb-3">
             {eyebrow}
           </span>
          <div className="gt-skeleton h-8 w-48 rounded-full mb-3" />
          <div className="gt-skeleton h-8 w-56 rounded-full" />
        </div>
        <div className="flex gap-4 px-6 overflow-hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="gt-skeleton h-96 w-80 shrink-0 rounded-[28px]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden px-6 md:px-16 py-14"
      style={{ height: "100vh", backgroundColor: "#050505" }}
    >
      <div className="mb-10">
         <span className="font-mono text-xs text-[#ff8c00] tracking-[0.15em] block mb-3">
           {eyebrow}
         </span>
        <div className="gt-skeleton h-10 w-64 rounded-full mb-4" />
        <div className="gt-skeleton h-10 w-72 rounded-full" />
      </div>
      <div className="grid h-[calc(100%-8rem)] grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="gt-skeleton h-full rounded-[32px]" />
        ))}
      </div>
    </section>
  );
}

export default function FeaturedVehicles() {
  const { featuredVehicles, error, isLoading } = useVehicles();
  const router = useRouter();
  const t = useTranslations("FeaturedVehicles");
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const sticky = stickyRef.current;
    const track = trackRef.current;
    const header = headerRef.current;

    if (!sticky || !track || !isDesktop || isLoading || featuredVehicles.length === 0) return;

    const count = featuredVehicles.length;
    const travel = () => Math.max(track.scrollWidth - window.innerWidth, 0);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        track,
        { x: 0 },
        {
          x: () => -travel(),
          ease: "none",
          scrollTrigger: {
            trigger: sticky,
            start: "top top",
            end: () => `+=${travel()}`,
            pin: true,
            anticipatePin: 1,
            scrub: 0.3,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
            onEnter: () => { track.style.willChange = "transform"; },
            onLeave: () => { track.style.willChange = "auto"; },
            onEnterBack: () => { track.style.willChange = "transform"; },
            onLeaveBack: () => { track.style.willChange = "auto"; },
            onUpdate: (self) => {
              const active = Math.min(count - 1, Math.floor(self.progress * count));
              dotsRef.current.forEach((dot, index) => {
                if (!dot) return;
                dot.style.width = index === active ? "28px" : "6px";
                dot.style.opacity = index === active ? "1" : "0.35";
              });
            },
          },
        },
      );

      if (header) {
        gsap.to(header, {
          opacity: 0,
          y: -24,
          ease: "power2.in",
          scrollTrigger: {
            trigger: sticky,
            start: "top top",
            end: "top+=12% top",
            scrub: 1,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [featuredVehicles, isDesktop, isLoading]);

  const handleMobileScroll = (direction: "left" | "right") => {
    if (!mobileTrackRef.current) return;
    const track = mobileTrackRef.current;
    const scrollAmount = track.offsetWidth;
    const targetScroll =
      direction === "right"
        ? track.scrollLeft + scrollAmount
        : track.scrollLeft - scrollAmount;

    gsap.to(track, { scrollLeft: targetScroll, duration: 0.6, ease: "power2.inOut" });
  };

  const count = featuredVehicles.length;

  if (isLoading) {
    return <FeaturedVehiclesSkeleton isDesktop={isDesktop} eyebrow={t("eyebrow")} />;
  }

  if (error || count === 0) {
    return (
      <section className="w-full px-6 md:px-16 py-20" style={{ backgroundColor: "var(--bg-page)" }}>
        <div className="max-w-[960px] mx-auto rounded-[32px] border p-10 md:p-14" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
           <span className="font-mono text-xs text-[#ff8c00] tracking-[0.15em] block mb-3">
             {t("eyebrow")}
           </span>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
            {t("errorTitle")}
          </h2>
          <p className="max-w-2xl font-normal text-base md:text-lg" style={{ color: "var(--text-secondary)" }}>
            {t("errorBody")}
          </p>
        </div>
      </section>
    );
  }

  if (!isDesktop) {
    return (
      <section className="relative w-full bg-black py-8">
        <div className="px-6 pt-6 pb-6 z-20">
          <span className="eyebrow mb-3">{t("eyebrow")}</span>
          <h2 className="font-display text-2xl text-white leading-tight tracking-[-0.06em]">
            {t("heading1")}
            <br />
            {t("heading2")}
          </h2>
        </div>

        <div className="relative">
          <button
            onClick={() => handleMobileScroll("left")}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 luxury-chip h-11 w-11 justify-center rounded-full p-0"
          >
            <FiArrowLeft size={16} />
          </button>

          <div
            ref={mobileTrackRef}
            className="flex gap-4 px-6 overflow-x-auto scroll-smooth snap-x snap-mandatory"
            style={{ scrollBehavior: "smooth" }}
          >
            {featuredVehicles.map((car, index) => (
              <div
                key={car.id}
                className="flex-shrink-0 w-80 h-96 relative overflow-hidden rounded-[28px] snap-start"
              >
                <Image
                  fill
                  src={getVehiclePrimaryImage(car)}
                  alt={`${car.make} ${car.model}`}
                  className="object-cover"
                  sizes="320px"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <div />
                  <div>
                    <div className="font-mono text-[10px] text-white/55 tracking-[0.18em] mb-2 uppercase">
                      {String(index + 1).padStart(2, "0")} / {car.year} · {car.make}
                    </div>
                    <h3 className="font-display font-bold tracking-tight text-3xl text-white mb-2 leading-none">
                      {car.model}
                    </h3>
                    <p className="font-drama italic text-lg text-white/75 mb-3">
                      &quot;{car.description?.trim() || t("taglineFallback", { color: car.color })}&quot;
                    </p>
                    <div className="mb-3">
                      {car.marketPrice && car.carstreetPrice ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="font-mono text-xs text-white/50 line-through">
                            {car.marketPrice}
                          </div>
                          <div className="font-mono text-sm font-medium text-white">
                            {car.carstreetPrice}
                          </div>
                        </div>
                      ) : (
                        <div className="font-mono text-sm font-medium text-white">
                          {formatVehiclePrice(car.price, t("priceOnRequest"))}
                        </div>
                      )}
                    </div>
                    <button
                      className="luxury-button luxury-button--accent min-h-0 px-5 py-2 text-[0.68rem]"
                      onClick={(event) => { event.stopPropagation(); router.push(`/inventory?view=${car.id}`); }}
                    >
                      {t("moreDetails")}
                      <FiArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleMobileScroll("right")}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 luxury-chip h-11 w-11 justify-center rounded-full p-0"
          >
            <FiArrowRight size={16} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-6">
          {Array.from({ length: count }).map((_, index) => (
            <span
              key={index}
              className="h-[5px] rounded-full bg-white/35"
              style={{ width: "6px" }}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div
      ref={stickyRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", backgroundColor: "var(--bg-page)" }}
    >
      <div
        ref={headerRef}
        className="absolute top-0 left-0 w-full z-20 px-6 md:px-16 pt-14 pointer-events-none"
      >
         <span className="font-mono text-xs text-[#ff8c00] tracking-[0.15em] block mb-3">
           {t("eyebrow")}
         </span>
        <h2 className="font-display font-bold tracking-tight text-4xl md:text-[3.5vw] text-white leading-tight drop-shadow-md">
          {t("heading1")}
          <br />
          {t("heading2")}
        </h2>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <span
            key={index}
            ref={(element) => { dotsRef.current[index] = element; }}
            className="h-[5px] rounded-full bg-white"
            style={{ width: index === 0 ? "28px" : "6px", opacity: index === 0 ? 1 : 0.35 }}
          />
        ))}
      </div>

      <div
        ref={trackRef}
        className="flex h-full"
        style={{
          width: `${count * 100}vw`,
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          willChange: "auto",
        }}
      >
        {featuredVehicles.map((car, index) => (
          <div key={car.id} className="w-screen h-full relative shrink-0 overflow-hidden">
            <Image
              fill
              src={getVehiclePrimaryImage(car)}
              alt={`${car.make} ${car.model}`}
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-transparent" />

            <div className="absolute bottom-20 left-10 md:left-20 right-10 md:right-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="font-mono text-[11px] text-white/55 tracking-[0.18em] mb-3 uppercase">
                  {String(index + 1).padStart(2, "0")} / {car.year} · {car.make}
                </div>
                <h3 className="font-display font-bold tracking-tight text-5xl md:text-7xl text-white mb-4 leading-none">
                  {car.model}
                </h3>
                <p className="font-drama italic text-2xl md:text-3xl text-white/75 mb-6">
                  &quot;{car.description?.trim() || t("taglineFallback", { color: car.color })}&quot;
                </p>
                {car.marketPrice && car.carstreetPrice ? (
                  <div className="flex flex-col gap-1">
                    <div className="font-mono text-base text-white/50 line-through">
                      {car.marketPrice}
                    </div>
                    <div className="font-mono text-xl font-medium text-white">
                      {car.carstreetPrice}
                    </div>
                  </div>
                ) : (
                  <div className="font-mono text-xl font-medium text-white">
                    {formatVehiclePrice(car.price, t("priceOnRequest"))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  className="luxury-button luxury-button--accent"
                  onClick={() => router.push(`/inventory?view=${car.id}`)}
                >
                  {t("moreDetails")}
                  <FiArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
