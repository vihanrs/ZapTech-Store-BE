import { Request, Response, NextFunction } from "express";
import { PRODUCT_TAGS } from "../constants/productTags";

export const getProductTags = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json(PRODUCT_TAGS);
};
