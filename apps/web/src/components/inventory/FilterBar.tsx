"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { FiRotateCcw } from "react-icons/fi";

// Exported so page.tsx can use the filter predicates — single source of truth
export const PRICE_OPTIONS: {
  label: string;
  value: string;
  filter: (p: number | null | undefined) => boolean;
}[] = [
  { label: "Under £100K",   value: "under-100k", filter: (p) => p != null && p < 100_000 },
  { label: "£100K – £150K", value: "100k-150k",  filter: (p) => p != null && p >= 100_000 && p < 150_000 },
  { label: "Over £150K",    value: "over-150k",  filter: (p) => p != null && p >= 150_000 },
];

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

  // Close dropdown on outside click — listener active only while a dropdown is open
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

  // Each def carries its own items — adding a fifth filter only requires one entry here
  const filterDefs = useMemo(() => [
    { key: "make"  as keyof FilterState, name: "Make",  items: options.makes.map((m) => ({ label: m, value: m })) },
    { key: "year"  as keyof FilterState, name: "Year",  items: options.years.map((y) => ({ label: y, value: y })) },
    { key: "color" as keyof FilterState, name: "Color", items: options.colors.map((c) => ({ label: c, value: c })) },
    { key: "price" as keyof FilterState, name: "Price", items: PRICE_OPTIONS },
  ], [options]);

  const getPillLabel = (key: keyof FilterState, name: string): string => {
    const val = filters[key];
    if (!val) return name;
    if (key === "price") return PRICE_OPTIONS.find((o) => o.value === val)?.label ?? name;
    return val;
  };

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Newest";
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
            Clear Filters
          </button>

          <div
            className="hidden md:block self-stretch w-px mx-1"
            style={{ background: "var(--border)" }}
            aria-hidden="true"
          />

          {filterDefs.map(({ key, name, items }) => {
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
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.18s ease",
                    }}
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
                        Any {name}
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
                            color:
                              filters[key] === item.value
                                ? "var(--text-primary)"
                                : "var(--text-secondary)",
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
          {/* Clear Filters — mobile only (desktop version is in the pills group above) */}
          <button
            onClick={onClear}
            disabled={!hasAnyFilter}
            aria-label="Clear filters"
            className="md:hidden inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase transition-opacity"
            style={{
              color: hasAnyFilter ? "var(--text-primary)" : "var(--text-muted)",
              opacity: hasAnyFilter ? 1 : 0.45,
            }}
          >
            <FiRotateCcw size={12} />
            Clear Filters
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
              Sort: {sortLabel}
              <Icon
                icon="solar:alt-arrow-down-linear"
                width={14}
                style={{
                  transform: isSortOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.18s ease",
                }}
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
                      style={{
                        color: sort === option.value ? "var(--text-primary)" : "var(--text-secondary)",
                      }}
                    >
                      {option.label}
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
