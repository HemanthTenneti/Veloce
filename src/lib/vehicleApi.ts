import type { Vehicle } from "@/types/vehicle";
import { HARDCODED_VEHICLES } from "./hardcodedVehicles";

const FALLBACK_VEHICLE_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%230c0c0c'/%3E%3Cstop offset='1' stop-color='%23212121'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23g)'/%3E%3Ccircle cx='920' cy='180' r='220' fill='rgba(255,255,255,0.06)'/%3E%3Cpath d='M210 520h760' stroke='rgba(255,255,255,0.16)' stroke-width='6' stroke-linecap='round'/%3E%3Cpath d='M310 510c70-120 170-180 300-180 128 0 228 60 304 180' fill='none' stroke='rgba(255,255,255,0.2)' stroke-width='10' stroke-linecap='round'/%3E%3C/svg%3E";

const galleryKeys = [
  "thumbnail",
  "image1",
  "image2",
  "image3",
  "image4",
  "image5",
  "image6",
  "image7",
  "image8",
  "image9",
  "image10",
] as const satisfies ReadonlyArray<keyof Vehicle>;

/**
 * Fetch vehicles - returns hardcoded data from media folder
 * Returns immediately for snappy UX (no artificial delay)
 */
export async function fetchVehicles(): Promise<Vehicle[]> {
  return HARDCODED_VEHICLES;
}

export function toFrappeAssetUrl(fileUrl?: string | null): string | null {
  if (!fileUrl) return null;
  const normalized = fileUrl.trim();

  if (!normalized) return null;

  // Already an absolute URL pointing at a non-Frappe host — return unchanged
  if (/^https?:\/\//i.test(normalized)) return normalized;

  // Return path as-is (now pointing to /media folder in public directory)
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function getVehiclePrimaryImage(vehicle: Vehicle): string {
  return toFrappeAssetUrl(vehicle.thumbnail) || FALLBACK_VEHICLE_IMAGE;
}

export function getVehicleGallery(vehicle: Vehicle): string[] {
  const gallery = galleryKeys
    .map((key) => toFrappeAssetUrl(vehicle[key]))
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(gallery)).slice(0, 10);
}



export function formatVehiclePrice(price?: number | null, priceOnRequest?: string): string {
  if (price == null) return priceOnRequest ?? "Price on request";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatVehicleMileage(mileage?: number | null, mileageTbc?: string): string {
  if (mileage == null) return mileageTbc ?? "Mileage TBC";

  return `${new Intl.NumberFormat("en-US").format(mileage)} mi`;
}

export function sortVehiclesByNewest(vehicles: Vehicle[]): Vehicle[] {
  return [...vehicles].sort((left, right) => {
    const leftDate = Date.parse(left.updatedAt || left.createdAt || "") || 0;
    const rightDate = Date.parse(right.updatedAt || right.createdAt || "") || 0;

    if (leftDate !== rightDate) {
      return rightDate - leftDate;
    }

    return right.year - left.year;
  });
}

export function normalizeVehicleStatus(status: string): string {
  return status.replace(/[_-]+/g, " ").toUpperCase();
}