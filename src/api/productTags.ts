import express from "express";
import { getProductTags } from "../application/productTags";

export const productTagRouter = express.Router();

productTagRouter.get("/", getProductTags);
