import { z } from "zod";

export const CreatePromoCodeDTO = z.object({
  code: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase()),
  discountPercentage: z
    .number()
    .min(0, "Discount must be at least 0%")
    .max(100, "Discount cannot exceed 100%"),
  firstOrderOnly: z.boolean(),
  expiresAt: z.coerce.date().refine((date) => date > new Date(), {
    message: "Expiration date must be in the future",
  }),
});

export const UpdatePromoCodeDTO = z.object({
  discountPercentage: z
    .number()
    .min(0, "Discount must be at least 0%")
    .max(100, "Discount cannot exceed 100%")
    .optional(),
  firstOrderOnly: z.boolean().optional(),
  expiresAt: z.coerce
    .date()
    .refine((date) => date > new Date(), {
      message: "Expiration date must be in the future",
    })
    .optional(),
  // coerce.date() converts string "2025-06-30T00:00:00Z" to JavaScript Date object
});

// validate query params
export const UpdatePromoCodeStatusDTO = z.object({
  isActive: z.enum(["true", "false"]).transform((val) => val === "true"),
  // Converts "true"/"false" (string from query) into a real boolean because need boolean value to update directly in the database
});

export const ValidatePromoCodeDTO = z.object({
  code: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase()),
});

export const GetPromoCodesDTO = z.object({
  status: z.enum(["active", "inactive"]).optional(),
});
