import { z } from "zod";

export const CreatePromoCodeDTO = z.object({
  code: z.string(),
  discountPercentage: z.number(),
  firstOrderOnly: z.boolean(),
  expiresAt: z.string(),
});
