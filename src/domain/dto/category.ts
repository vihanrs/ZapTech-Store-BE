import { z } from "zod";

export const CreateCategoryDTO = z.object({
  name: z.string().trim().min(1, "Category name cannot be empty"),
});

export const UpdateCategoryDTO = z.object({
  name: z.string().optional(),
});

// validate query params
export const UpdateCategoryStatusDTO = z.object({
  status: z.enum(["true", "false"]).transform((val) => val === "true"),
  // Converts "true"/"false" (string from query) into a real boolean because need boolean value to update directly in the database
});

export const GetCategoriesDTO = z.object({
  status: z.enum(["active", "inactive"]).optional(),
});
