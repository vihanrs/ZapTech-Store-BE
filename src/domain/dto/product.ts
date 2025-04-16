import { z } from "zod";
import { PRODUCT_TAGS } from "../../constants/productTags";

export const CreateProductDTO = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  image: z.string().url("Image must be a valid URL"),
  stockQuantity: z.number().min(0, "Stock cannot be negative"),
  tags: z.array(z.enum(PRODUCT_TAGS)).optional(),
});

export const UpdateProductDTO = z.object({
  name: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number").optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  image: z.string().url("Image must be a valid URL").optional(),
  stockQuantity: z.number().min(0, "Stock cannot be negative").optional(),
  tags: z.array(z.enum(PRODUCT_TAGS)).optional(),
});

export const UpdateProductStatusDTO = z.object({
  status: z.enum(["true", "false"]).transform((val) => val === "true"),
  // Converts "true"/"false" (string from query) into a real boolean because need boolean value to update directly in the database
});

export const GetProductsDTO = z.object({
  categoryId: z.string().optional(),
  tag: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val
          .split(",")
          .every((t) => (PRODUCT_TAGS as readonly string[]).includes(t)),
      {
        message: "Invalid tag(s) in query",
      }
    ),

  status: z.enum(["active", "inactive"]).optional(),
});
