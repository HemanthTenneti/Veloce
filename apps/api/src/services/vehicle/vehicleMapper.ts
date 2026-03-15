import type {
  CreateVehicleRequest,
  Vehicle,
} from "@domain/vehicle";

type VehicleImageKey =
  | "thumbnail"
  | "image1"
  | "image2"
  | "image3"
  | "image4"
  | "image5"
  | "image6"
  | "image7"
  | "image8"
  | "image9"
  | "image10";

type FrappeVehicleImageKey =
  | "thumbnail"
  | "image_1"
  | "image_2"
  | "image_3"
  | "image_4"
  | "image_5"
  | "image_6"
  | "image_7"
  | "image_8"
  | "image_9"
  | "image_10";

type VehicleWritePayload = Partial<Omit<Vehicle, "id" | "createdAt" | "updatedAt">> |
  CreateVehicleRequest;

export type FrappeVehicleRecord = {
  name?: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin?: string | null;
  mileage?: number | null;
  price?: number | null;
  description?: string | null;
  status: string;
  creation?: string;
  modified?: string;
  thumbnail: string;
  image_1?: string | null;
  image_2?: string | null;
  image_3?: string | null;
  image_4?: string | null;
  image_5?: string | null;
  image_6?: string | null;
  image_7?: string | null;
  image_8?: string | null;
  image_9?: string | null;
  image_10?: string | null;
};

const vehicleImageFieldMap: Array<[VehicleImageKey, FrappeVehicleImageKey]> = [
  ["thumbnail", "thumbnail"],
  ["image1", "image_1"],
  ["image2", "image_2"],
  ["image3", "image_3"],
  ["image4", "image_4"],
  ["image5", "image_5"],
  ["image6", "image_6"],
  ["image7", "image_7"],
  ["image8", "image_8"],
  ["image9", "image_9"],
  ["image10", "image_10"],
];

export const toFrappeVehiclePayload = (
  vehicle: VehicleWritePayload,
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  if (vehicle.make !== undefined) payload.make = vehicle.make;
  if (vehicle.model !== undefined) payload.model = vehicle.model;
  if (vehicle.year !== undefined) payload.year = vehicle.year;
  if (vehicle.color !== undefined) payload.color = vehicle.color;
  if (vehicle.vin !== undefined) payload.vin = vehicle.vin || null;
  if (vehicle.mileage !== undefined) payload.mileage = vehicle.mileage;
  if (vehicle.price !== undefined) payload.price = vehicle.price;
  if (vehicle.description !== undefined)
    payload.description = vehicle.description || null;
  if (vehicle.status !== undefined) payload.status = vehicle.status;

  for (const [apiField, frappeField] of vehicleImageFieldMap) {
    if (vehicle[apiField] !== undefined) {
      payload[frappeField] = vehicle[apiField] || null;
    }
  }

  return payload;
};

export const normalizeVehicle = (record: FrappeVehicleRecord): Vehicle => ({
  id: record.name || "",
  vin: record.vin ?? null,
  make: record.make,
  model: record.model,
  year: record.year,
  color: record.color,
  mileage: record.mileage ?? null,
  price: record.price ?? null,
  description: record.description ?? null,
  thumbnail: record.thumbnail,
  image1: record.image_1 ?? null,
  image2: record.image_2 ?? null,
  image3: record.image_3 ?? null,
  image4: record.image_4 ?? null,
  image5: record.image_5 ?? null,
  image6: record.image_6 ?? null,
  image7: record.image_7 ?? null,
  image8: record.image_8 ?? null,
  image9: record.image_9 ?? null,
  image10: record.image_10 ?? null,
  status: record.status,
  createdAt: record.creation,
  updatedAt: record.modified,
});