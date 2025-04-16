import { StockStatus } from "../constants/stockStatus";

export function calculateStockStatus(stockQuantity: number): StockStatus {
  if (stockQuantity === 0) return "out-of-stock";
  if (stockQuantity <= 10) return "low-stock";
  return "available";
}
