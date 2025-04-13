import express from "express";
import {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  updateProductStatus,
} from "../application/product";
import { isAuthenticated } from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

export const productRouter = express.Router();

productRouter
  .route("/")
  .get(getProducts) // handle category/tag filtering with query params (?categoryId=1&tag=featured&status=active/inactive)
  .post(isAuthenticated, isAdmin, createProduct);
productRouter
  .route("/:id")
  .get(getProduct)
  .put(isAuthenticated, isAdmin, updateProduct);
productRouter
  .route("/:id/status")
  .put(isAuthenticated, isAdmin, updateProductStatus); // ?status=true/false
