"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InventoryHeader from "@/components/inventory/InventoryHeader";
import FilterBar, { type FilterState, PRICE_OPTIONS } from "@/components/inventory/FilterBar";
import VehicleGrid from "@/components/inventory/VehicleGrid";
import EnquiryModal from "@/components/inventory/EnquiryModal";
import { useVehicles } from "@/hooks/useVehicles";
import type { Vehicle } from "@/types/vehicle";

const EMPTY_FILTERS: FilterState = { make: "", year: "", color: "", price: "" };

export default function InventoryPage() {
  const { vehicles, error, isLoading } = useVehicles();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState("newest");
  const [enquiringVehicle, setEnquiringVehicle] = useState<Vehicle | null>(null);

  // Derive unique filter options from the full (unfiltered) vehicle list
  const filterOptions = useMemo(() => {
    const makes = [...new Set(vehicles.map((v) => v.make).filter(Boolean))].sort();
    const years = [...new Set(vehicles.map((v) => String(v.year)).filter(Boolean))].sort(
      (a, b) => Number(b) - Number(a),
    );
    const colors = [...new Set(vehicles.map((v) => v.color).filter(Boolean))].sort();
    return { makes, years, colors };
  }, [vehicles]);

  // Count only "Available" vehicles for the header (unfiltered)
  const availableCount = useMemo(
    () => vehicles.filter((v) => v.status === "Available").length,
    [vehicles],
  );

  // Client-side filtering — sub-50ms on any realistic inventory size.
  // Price logic delegates to PRICE_OPTIONS.filter — single source of truth.
  const filteredVehicles = useMemo(() => {
    const filtered = (!filters.make && !filters.year && !filters.color && !filters.price)
      ? vehicles
      : vehicles.filter((v) => {
          if (filters.make && v.make.toLowerCase() !== filters.make.toLowerCase()) return false;
          if (filters.year && String(v.year) !== filters.year) return false;
          if (filters.color && v.color.toLowerCase() !== filters.color.toLowerCase()) return false;
          if (filters.price) {
            const priceOption = PRICE_OPTIONS.find((o) => o.value === filters.price);
            if (priceOption && !priceOption.filter(v.price)) return false;
          }
          return true;
        });

    // Apply sort — "newest" is already sorted by useVehicles, clone only when resorting
    if (sort === "newest") return filtered;
    const sorted = [...filtered];
    if (sort === "price-asc")  sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "price-desc") sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    if (sort === "year-desc")  sorted.sort((a, b) => b.year - a.year);
    if (sort === "year-asc")   sorted.sort((a, b) => a.year - b.year);
    return sorted;
  }, [vehicles, filters, sort]);

  const handleFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => setFilters(EMPTY_FILTERS);

  // Stable identity — setEnquiringVehicle is a stable React state setter
  const handleModalClose = useCallback(() => setEnquiringVehicle(null), []);

  return (
    <>
      <Navbar />
      <main>
        <InventoryHeader total={availableCount} isLoading={isLoading} />
        <FilterBar
          filters={filters}
          onFilter={handleFilter}
          onClear={handleClear}
          options={filterOptions}
          sort={sort}
          onSort={setSort}
        />
        <Suspense>
          <VehicleGrid
            vehicles={filteredVehicles}
            error={error}
            isLoading={isLoading}
            onEnquire={setEnquiringVehicle}
          />
        </Suspense>
      </main>
      <Footer />
      <EnquiryModal
        vehicle={enquiringVehicle}
        onClose={handleModalClose}
      />
    </>
  );
}
