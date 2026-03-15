import "dotenv/config";

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import {
  imageFieldNames,
  seedVehicles,
  type SeedVehicleRecord,
  type UploadedAssetManifest,
  type UploadedAssetRecord,
} from "./vehicle_seed_shared.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiBaseUrl = process.env.API_URL || "http://localhost:3000";
const manifestPath = resolve(__dirname, "../temp_assets/uploaded-assets-manifest.json");

type ExistingVehicleResponse = {
  success: boolean;
  data?: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    thumbnail: string;
  }>;
  message?: string;
  error?: string;
};

const vehicleLookupKey = (vehicle: Pick<SeedVehicleRecord, "make" | "model" | "year">): string =>
  `${vehicle.make.toLowerCase()}::${vehicle.model.toLowerCase()}::${vehicle.year}`;

const loadManifest = async (): Promise<UploadedAssetManifest> => {
  const manifestBuffer = await readFile(manifestPath, "utf8");
  return JSON.parse(manifestBuffer) as UploadedAssetManifest;
};

const getExistingVehicles = async (): Promise<Map<string, { id: string; thumbnail: string }>> => {
  const response = await fetch(`${apiBaseUrl}/api/vehicles?page=1&pageSize=100`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch existing vehicles: ${response.status} ${response.statusText} ${body}`);
  }

  const json = (await response.json()) as ExistingVehicleResponse;
  const vehicleMap = new Map<string, { id: string; thumbnail: string }>();

  for (const vehicle of json.data || []) {
    vehicleMap.set(vehicleLookupKey(vehicle), {
      id: vehicle.id,
      thumbnail: vehicle.thumbnail,
    });
  }

  return vehicleMap;
};

const buildGalleryPlaceholders = (
  currentAsset: UploadedAssetRecord,
  assets: UploadedAssetRecord[],
): string[] => {
  const otherUrls = assets
    .map(asset => asset.fileUrl)
    .filter(fileUrl => fileUrl !== currentAsset.fileUrl);
  const orderedUrls = [currentAsset.fileUrl, ...otherUrls];

  return imageFieldNames.map((_, index) => orderedUrls[index % orderedUrls.length]);
};

const seedVehicle = async (
  vehicle: SeedVehicleRecord,
  asset: UploadedAssetRecord,
  allAssets: UploadedAssetRecord[],
): Promise<{ id: string; thumbnail: string }> => {
  const placeholderUrls = buildGalleryPlaceholders(asset, allAssets);
  const payload: Record<string, string | number> = {
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    status: vehicle.status,
    vin: vehicle.vin,
    mileage: vehicle.mileage,
    price: vehicle.price,
    description: vehicle.desc,
    thumbnail: asset.fileUrl,
  };

  for (const [index, fieldName] of imageFieldNames.entries()) {
    payload[fieldName] = placeholderUrls[index] || asset.fileUrl;
  }

  const response = await fetch(`${apiBaseUrl}/api/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to seed ${vehicle.make} ${vehicle.model}: ${response.status} ${response.statusText} ${body}`,
    );
  }

  const json = (await response.json()) as {
    data?: {
      id: string;
      thumbnail: string;
    };
  };

  if (!json.data?.id) {
    throw new Error(`Seed response for ${vehicle.make} ${vehicle.model} did not include a vehicle id.`);
  }

  return {
    id: json.data.id,
    thumbnail: json.data.thumbnail,
  };
};

const main = async (): Promise<void> => {
  const manifest = await loadManifest();
  const manifestByKey = new Map(manifest.assets.map(asset => [asset.vehicleKey, asset]));
  const existingVehicles = await getExistingVehicles();

  let createdCount = 0;
  let skippedCount = 0;

  for (const vehicle of seedVehicles) {
    const existing = existingVehicles.get(vehicleLookupKey(vehicle));

    if (existing) {
      skippedCount += 1;
      console.log(`Skipped existing vehicle ${vehicle.make} ${vehicle.model} (${existing.id})`);
      continue;
    }

    const asset = manifestByKey.get(vehicle.key);

    if (!asset) {
      throw new Error(`No uploaded asset found for vehicle ${vehicle.make} ${vehicle.model} (${vehicle.key}).`);
    }

    const seeded = await seedVehicle(vehicle, asset, manifest.assets);
    createdCount += 1;
    console.log(`Seeded ${vehicle.make} ${vehicle.model} -> ${seeded.id} (${seeded.thumbnail})`);
  }

  const verificationMap = await getExistingVehicles();
  const physicalVehicleCount = seedVehicles.filter(vehicle => {
    const existing = verificationMap.get(vehicleLookupKey(vehicle));
    return Boolean(existing?.thumbnail?.startsWith("/files/"));
  }).length;

  console.log(`Created ${createdCount} vehicles, skipped ${skippedCount} existing vehicles.`);
  console.log(`${physicalVehicleCount}/${seedVehicles.length} seeded vehicles currently have physical /files thumbnails.`);

  if (physicalVehicleCount < seedVehicles.length) {
    throw new Error("Verification failed: not all seeded vehicles are using physical /files thumbnails.");
  }
};

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});