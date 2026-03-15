import { z } from "zod";

const optionalImageFields = Object.fromEntries(
  Array.from({ length: 10 }, (_, index) => [
    `image${index + 1}`,
    z.string().min(1).optional(),
  ]),
);

export const VehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1886),
  color: z.string().min(1),
  thumbnail: z.string().min(1),
  ...optionalImageFields,
  status: z.string().min(1),
  vin: z.string().min(1).optional(),
  mileage: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  description: z.string().optional(),
});

export const vehicleSchema = VehicleSchema;

export const paymentSchema = z.object({
  id: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
  status: z.enum(["pending", "completed", "failed"]),
  leadId: z.string().min(1),
});
