"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { FiRotateCcw } from "react-icons/fi";

// Exported so page.tsx can use the filter predicates — single source of truth.
// Labels here are English fallbacks only; display labels come from translations.
export const PRICE_OPTIONS: {
  label: string;
  value: string;
  filter: (p: number | null | undefined) => boolean;
}[] = [
  { label: "Under ₹50L",   value: "under-50l", filter: (p) => p != null && p < 5_000_000 },
  { label: "₹50L – ₹75L", value: "50l-75l",  filter: (p) => p != null && p >= 5_000_000 && p < 7_500_000 },
  { label: "Over ₹75L",    value: "over-75l",  filter: (p) => p != null && p >= 7_500_000 },
];

// Values are stable identifiers used for sort logic in page.tsx
export const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest",            value: "newest"     },
  { label: "Price: Low → High", value: "price-asc"  },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Year: New → Old",   value: "year-desc"  },
  { label: "Year: Old → New",   value: "year-asc"   },
];

export interface FilterState {
  make: string;
  year: string;
  color: string;
  price: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilter: (key: keyof FilterState, value: string) => void;
  onClear: () => void;
  options: {
    makes: string[];
    years: string[];
    colors: string[];
  };
  sort: string;
  onSort: (value: string) => void;
}

type DropdownKey = keyof FilterState | "sort" | null;

export default function FilterBar({ filters, onFilter, onClear, options, sort, onSort }: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("FilterBar");

  // Stable mappings from value → translation key
  const sortKeyMap: Record<string, string> = {
    newest:      "sortNewest",
    "price-asc":  "sortPriceAsc",
    "price-desc": "sortPriceDesc",
    "year-desc":  "sortYearDesc",
    "year-asc":   "sortYearAsc",
  } as const;

  const priceKeyMap: Record<string, string> = {
    "under-50l": "priceUnder50l",
    "50l-75l":  "price50l75l",
    "over-75l":  "priceOver75l",
  };

  const getTranslatedPriceLabel = (value: string): string => {
    const key = priceKeyMap[value];
    return key ? t(key as Parameters<typeof t>[0]) : value;
  };

  const getTranslatedSortLabel = (value: string): string => {
    const key = sortKeyMap[value];
    return key ? t(key) : value;
  };

  useEffect(() => {
    if (!openDropdown) return;
    const onPointerDown = (e: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openDropdown]);

  const toggle = (key: DropdownKey) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const select = (key: keyof FilterState, value: string) => {
    onFilter(key, value);
    setOpenDropdown(null);
  };

  const hasAnyFilter = Object.values(filters).some(Boolean);

  const filterDefs = useMemo(() => [
    {
      key: "make"  as keyof FilterState,
      name: t("make"),
      anyLabel: t("anyMake"),
      items: options.makes.map((m) => ({ label: m, value: m })),
    },
    {
      key: "year"  as keyof FilterState,
      name: t("year"),
      anyLabel: t("anyYear"),
      items: options.years.map((y) => ({ label: y, value: y })),
    },
    {
      key: "color" as keyof FilterState,
      name: t("color"),
      anyLabel: t("anyColor"),
      items: options.colors.map((c) => ({ label: c, value: c })),
    },
    {
      key: "price" as keyof FilterState,
      name: t("price"),
      anyLabel: t("anyPrice"),
      items: PRICE_OPTIONS.map((o) => ({ label: getTranslatedPriceLabel(o.value), value: o.value })),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [options, t]);

  const getPillLabel = (key: keyof FilterState, name: string): string => {
    const val = filters[key];
    if (!val) return name;
    if (key === "price") return getTranslatedPriceLabel(val);
    return val;
  };

  const sortLabel = getTranslatedSortLabel(sort);
  const isSortOpen = openDropdown === "sort";

  return (
    <div
      ref={barRef}
      data-testid="filter-bar"
      className="sticky top-0 z-40 py-4 px-6 md:px-12 w-full"
      style={{ backgroundColor: "rgba(8, 9, 11, 0.82)", backdropFilter: "blur(20px)" }}
    >
      <div className="section-shell max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4 py-4 md:px-5">
        {/* LEFT — clear button then filter pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onClear}
            disabled={!hasAnyFilter}
            data-testid="clear-filters"
            className="hidden md:inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase transition-opacity"
            style={{
              color: hasAnyFilter ? "var(--text-primary)" : "var(--text-muted)",
              opacity: hasAnyFilter ? 1 : 0.45,
            }}
          >
            <FiRotateCcw size={12} />
            {t("clearFilters")}
          </button>

          <div
            className="hidden md:block self-stretch w-px mx-1"
            style={{ background: "var(--border)" }}
            aria-hidden="true"
          />

          {filterDefs.map(({ key, name, anyLabel, items }) => {
            const isActive = Boolean(filters[key]);
            const isOpen = openDropdown === key;

            return (
              <div key={key} className="relative">
                <button
                  onClick={() => toggle(key)}
                  data-testid={`filter-${key}`}
                  className="filter-pill luxury-chip inline-flex items-center gap-1.5 transition-colors"
                  style={{
                    borderColor: isActive ? "var(--border-strong)" : "var(--border)",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                  aria-expanded={isOpen}
                  aria-haspopup="listbox"
                >
                  {getPillLabel(key, name)}
                  <Icon
                    icon="solar:alt-arrow-down-linear"
                    width={14}
                    style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.18s ease" }}
                  />
                </button>

                {isOpen && items.length > 0 && (
                  <ul
                    role="listbox"
                    className="absolute left-0 top-full mt-1.5 z-50 min-w-[160px] overflow-hidden rounded-2xl border py-1.5 shadow-xl"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      borderColor: "var(--border-strong)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <li>
                      <button
                        role="option"
                        aria-selected={!filters[key]}
                        onClick={() => select(key, "")}
                        data-testid={`filter-${key}-any`}
                        className="w-full px-4 py-2 text-left font-mono text-[10px] tracking-[0.18em] uppercase transition-colors hover:bg-white/5"
                        style={{ color: !filters[key] ? "var(--text-primary)" : "var(--text-muted)" }}
                      >
                        {anyLabel}
                      </button>
                    </li>
                    {items.map((item) => (
                      <li key={item.value}>
                        <button
                          role="option"
                          aria-selected={filters[key] === item.value}
                          onClick={() => select(key, item.value)}
                          data-testid={`filter-${key}-${item.value}`}
                          className="w-full px-4 py-2 text-left font-mono text-[10px] tracking-[0.18em] uppercase transition-colors hover:bg-white/5"
                          style={{
                            color: filters[key] === item.value ? "var(--text-primary)" : "var(--text-secondary)",
                          }}
                        >
                          {item.label}
                          {filters[key] === item.value && (
                            <span className="ml-2 opacity-70">✓</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT — sort (top row on mobile, right side on desktop) */}
        <div className="order-first md:order-last flex items-center justify-between md:justify-start w-full md:w-auto md:ml-auto gap-3">
          {/* Clear Filters — mobile only */}
          <button
            onClick={onClear}
            disabled={!hasAnyFilter}
            aria-label={t("clearFilters")}
            className="md:hidden inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase transition-opacity"
            style={{
              color: hasAnyFilter ? "var(--text-primary)" : "var(--text-muted)",
              opacity: hasAnyFilter ? 1 : 0.45,
            }}
          >
            <FiRotateCcw size={12} />
            {t("clearFilters")}
          </button>
          <div className="relative">
            <button
              onClick={() => toggle("sort")}
              data-testid="sort-button"
              className="luxury-chip inline-flex items-center gap-1.5"
              style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
              aria-expanded={isSortOpen}
              aria-haspopup="listbox"
            >
              {t("sort")}: {sortLabel}
              <Icon
                icon="solar:alt-arrow-down-linear"
                width={14}
                style={{ transform: isSortOpen ? "rotate(180deg)" : "none", transition: "transform 0.18s ease" }}
              />
            </button>

            {isSortOpen && (
              <ul
                role="listbox"
                className="absolute right-0 top-full mt-1.5 z-50 min-w-[180px] overflow-hidden rounded-2xl border py-1.5 shadow-xl"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-strong)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <li key={option.value}>
                    <button
                      role="option"
                      aria-selected={sort === option.value}
                      onClick={() => { onSort(option.value); setOpenDropdown(null); }}
                      data-testid={`sort-${option.value}`}
                      className="w-full px-4 py-2 text-left font-mono text-[10px] tracking-[0.18em] uppercase transition-colors hover:bg-white/5"
                      style={{ color: sort === option.value ? "var(--text-primary)" : "var(--text-secondary)" }}
                    >
                      {getTranslatedSortLabel(option.value)}
                      {sort === option.value && (
                        <span className="ml-2 opacity-70">✓</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
