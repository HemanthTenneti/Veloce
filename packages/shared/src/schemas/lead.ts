import { z } from "zod";

// vehicleProperties format: "Color Make Model Year"
// e.g. "Red Porsche 911 GT3 Touring 2023"
export const leadSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  vehicleProperties: z.string().min(1),
  message: z.string().min(1),
  source: z.string().optional(),
  status: z.string().optional(),
});

// For create requests — id is auto-assigned by the backend
export const createLeadSchema = leadSchema.omit({ id: true });
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
