/**
 *  `STOCK_STATUS` is a constant array of status values used to maintain stock label
 *  (e.g., "available", "out-of-stock", etc.). use `as const` to lock the values and
 *  tell TypeScript to treat them as exact string literals.
 */
export const STOCK_STATUS = ["available", "low-stock", "out-of-stock"] as const;

/**
 * `StockStatus` is a custom TypeScript type that is automatically created from
 *  the values inside `STOCK_STATUS`. It will always stay in sync with the array.
 */
export type StockStatus = (typeof STOCK_STATUS)[number];

/**
 * This constant is used for:
 *  - Backend schema validation (e.g., with Zod and Mongoose)
 *  - Frontend form dropdowns or checkboxes
 *  - Filtering or tagging logic
 */
