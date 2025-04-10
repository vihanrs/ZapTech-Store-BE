import express from "express";
import {
  getProducts,
  createProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  getFeaturedProducts,
} from "../application/product";
import { isAuthenticated } from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

export const productRouter = express.Router();

productRouter
  .route("/")
  .get(getProducts)
  .post(isAuthenticated, isAdmin, createProduct);
productRouter.route("/featured").get(getFeaturedProducts);
productRouter
  .route("/:id")
  .get(getProduct)
  .delete(isAuthenticated, isAdmin, deleteProduct)
  .patch(isAuthenticated, isAdmin, updateProduct);
