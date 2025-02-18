import express from "express";
import { createPromoCode, validatePromoCode } from "../application/promocode";
import { isAuthenticated } from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

export const promoCodeRouter = express.Router();

promoCodeRouter.route("/").post(isAuthenticated, isAdmin, createPromoCode);
promoCodeRouter.route("/validate").post(isAuthenticated, validatePromoCode);

export default promoCodeRouter;
