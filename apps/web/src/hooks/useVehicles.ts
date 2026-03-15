"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useLocale } from "next-intl";
import { fetchVehicles, sortVehiclesByNewest } from "@/lib/vehicleApi";

export function useVehicles() {
  const locale = useLocale();
  const cacheKey = `vehicles-${locale}`;

  const { data, error, isLoading, mutate } = useSWR(cacheKey, () => fetchVehicles(locale), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  // Memoized on [data] so downstream useMemos (filterOptions, filteredVehicles)
  // only recompute when the raw API payload actually changes, not on every render.
  const vehicles = useMemo(() => (data ? sortVehiclesByNewest(data) : []), [data]);
  const featuredVehicles = useMemo(() => vehicles.slice(0, 3), [vehicles]);

  return {
    vehicles,
    featuredVehicles,
    total: vehicles.length,
    error,
    isLoading,
    mutate,
  };
}
