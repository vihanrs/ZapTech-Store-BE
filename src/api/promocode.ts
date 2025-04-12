import express from "express";
import {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  updatePromoCodeStatus,
  validatePromoCode,
} from "../application/promocode";
import { isAuthenticated } from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

export const promoCodeRouter = express.Router();

promoCodeRouter
  .route("/")
  .get(getPromoCodes) // get promocodes by status (?status=active/inactive)
  .post(isAuthenticated, isAdmin, createPromoCode);
promoCodeRouter.route("/validate").get(isAuthenticated, validatePromoCode);
promoCodeRouter.route("/:id").put(isAuthenticated, isAdmin, updatePromoCode);
promoCodeRouter
  .route("/:id/status")
  .put(isAuthenticated, isAdmin, updatePromoCodeStatus);

export default promoCodeRouter;
