/**
 *  `PRODUCT_TAGS` is a constant array of tag values used to label products
 *  (e.g., "featured", "new", etc.). We use `as const` to lock the values and
 *  tell TypeScript to treat them as exact string literals.
 */
export const PRODUCT_TAGS = [
  "featured",
  "new",
  "bestSeller",
  "limitedOffer",
] as const;

/**
 * `ProductTag` is a custom TypeScript type that is automatically created from
 *  the values inside `PRODUCT_TAGS`. It will always stay in sync with the array.
 */
export type ProductTag = (typeof PRODUCT_TAGS)[number];

/**
 * This constant is used for:
 *  - Backend schema validation (e.g., with Zod and Mongoose)
 *  - Frontend form dropdowns or checkboxes
 *  - Filtering or tagging logic
 */
