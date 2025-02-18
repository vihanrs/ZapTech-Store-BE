import { NextFunction, Request, Response } from "express";
import PromoCode from "../infrastructure/schemas/PromoCode";
import ValidationError from "../domain/errors/validation-error";
import { CreatePromoCodeDTO } from "../domain/dto/promocode";
import Order from "../infrastructure/schemas/Order";

export const createPromoCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = CreatePromoCodeDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid promo code data");
    }

    const promoCode = await PromoCode.create({
      code: result.data.code,
      discountPercentage: result.data.discountPercentage,
      firstOrderOnly: result.data.firstOrderOnly,
      expiresAt: result.data.expiresAt,
    });

    res.status(201).json(promoCode);
  } catch (error) {
    next(error);
  }
};

export const validatePromoCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.body;
    const userId = req.auth.userId;
    if (!code) {
      return res.status(400).json({ message: "Promo code is required" });
    }

    const promoCode = await PromoCode.findOne({
      code: code,
      isActive: true,
      expiresAt: { $gt: Date.now() },
    });

    if (!promoCode) {
      return res.status(404).json({ message: "Invalid or expired promo code" });
    }

    // Check if this is a "first order only" promo code
    if (promoCode.firstOrderOnly) {
      // Find if user has any previous completed orders
      const previousOrders = await Order.countDocuments({
        userId: userId,
      });

      if (previousOrders > 0) {
        return res.status(403).json({
          message: "This promo code is for new customers only.",
        });
      }
    }

    return res.status(200).json({
      code: promoCode.code,
      discountPercentage: promoCode.discountPercentage,
    });
  } catch (error) {
    next(error);
  }
};
