"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getLenis } from "@/lib/lenisStore";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const lastScrollRef = useRef(0);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [locale, setLocale] = useState<string>("en");
  const t = useTranslations("Navbar");
  const tSwitch = useTranslations("LanguageSwitcher");

  const isInventory = pathname === "/inventory";

  // Detect current locale from URL on client
  useEffect(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const potentialLocale = segments[0];
    if ((routing.locales as readonly string[]).includes(potentialLocale)) {
      setLocale(potentialLocale);
    } else {
      setLocale(routing.defaultLocale);
    }
  }, [pathname]);

  const switchLocale = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
  };

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onScroll = () => {
      const currentScroll = window.scrollY;
      setScrolled(currentScroll > 50);

      if (currentScroll > lastScrollRef.current && currentScroll > 100) {
        nav.style.transform = "translateY(-100%)";
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      } else if (currentScroll < lastScrollRef.current) {
        nav.style.transform = "translateY(0)";
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        if (currentScroll > 100) {
          scrollTimerRef.current = setTimeout(() => {
            nav.style.transform = "translateY(-100%)";
          }, 3000);
        }
      }
      lastScrollRef.current = currentScroll;
    };

    const lenis = getLenis();
    if (lenis) {
      lenis.on("scroll", onScroll);
      return () => { lenis.off("scroll", onScroll); };
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, []);

  const navBgClass = isInventory || scrolled ? "opacity-100" : "opacity-100";
  const otherLocale = locale === "en" ? "es" : "en";

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${navBgClass}`}
      style={{ backgroundColor: "transparent" }}
    >
      {/* Mobile Layout */}
      <div className="md:hidden max-w-[1440px] mx-auto px-4 pt-4">
        <div
          className="section-shell flex flex-col items-center justify-center gap-3 px-5 py-4 backdrop-blur-xl"
          style={{ backgroundColor: isInventory || scrolled ? "var(--nav-bg)" : "rgba(8, 9, 11, 0.58)" }}
        >
          <Link
            href="/"
            className="font-display text-[1.2rem] font-semibold tracking-[-0.06em]"
            style={{ color: "var(--text-primary)" }}
          >
            VELOCE.
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`nav-link font-normal text-[0.72rem] tracking-[0.18em] uppercase ${pathname === "/" ? "active" : ""}`}
              style={{ color: "var(--text-primary)" }}
            >
              {t("home")}
            </Link>
            <Link
              href="/inventory"
              className={`nav-link font-normal text-[0.72rem] tracking-[0.18em] uppercase ${pathname === "/inventory" ? "active" : ""}`}
              style={{ color: "var(--text-primary)" }}
            >
              {t("inventory")}
            </Link>
            <button
              onClick={() => switchLocale(otherLocale)}
              className="font-mono text-[0.65rem] tracking-[0.18em] uppercase px-2 py-1 rounded border transition-colors"
              style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
              aria-label={`Switch to ${tSwitch(otherLocale as "en" | "es")}`}
            >
              {tSwitch(otherLocale as "en" | "es")}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block max-w-[1440px] mx-auto px-6 md:px-8 lg:px-10 pt-5">
        <div
          className="section-shell flex items-center justify-between px-6 py-4 backdrop-blur-xl"
          style={{ backgroundColor: isInventory || scrolled ? "var(--nav-bg)" : "rgba(8, 9, 11, 0.54)" }}
        >
          <Link
            href="/"
            className="font-display text-[1.35rem] font-semibold tracking-[-0.08em]"
            style={{ color: "var(--text-primary)" }}
          >
            VELOCE.
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className={`nav-link font-normal text-[0.72rem] tracking-[0.22em] uppercase ${pathname === "/" ? "active" : ""}`}
              style={{ color: "var(--text-primary)" }}
            >
              {t("home")}
            </Link>
            <Link
              href="/inventory"
              className={`nav-link font-normal text-[0.72rem] tracking-[0.22em] uppercase ${pathname === "/inventory" ? "active" : ""}`}
              style={{ color: "var(--text-primary)" }}
            >
              {t("inventory")}
            </Link>
            <button
              onClick={() => switchLocale(otherLocale)}
              className="font-mono text-[0.65rem] tracking-[0.22em] uppercase px-2.5 py-1 rounded border transition-colors hover:border-white/40"
              style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
              aria-label={`Switch to ${tSwitch(otherLocale as "en" | "es")}`}
            >
              {tSwitch(otherLocale as "en" | "es")}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
