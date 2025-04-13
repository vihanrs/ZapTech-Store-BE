import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
} from "../application/category";
import { isAuthenticated } from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

export const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .get(getCategories) // get categories by status (?status=active/inactive)
  .post(isAuthenticated, isAdmin, createCategory);

categoryRouter.route("/:id").put(isAuthenticated, isAdmin, updateCategory);

categoryRouter
  .route("/:id/status")
  .put(isAuthenticated, isAdmin, updateCategoryStatus); // ?status=true/false
