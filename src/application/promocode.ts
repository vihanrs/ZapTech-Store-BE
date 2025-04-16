import { NextFunction, Request, Response } from "express";
import PromoCode from "../infrastructure/schemas/PromoCode";
import ValidationError from "../domain/errors/validation-error";
import {
  CreatePromoCodeDTO,
  GetPromoCodesDTO,
  UpdatePromoCodeDTO,
  UpdatePromoCodeStatusDTO,
  ValidatePromoCodeDTO,
} from "../domain/dto/promocode";
import Order from "../infrastructure/schemas/Order";

export const getPromoCodes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = GetPromoCodesDTO.safeParse(req.query);

    if (!result.success) {
      const errorMessage =
        result.error.errors[0]?.message || "Invalid status filter";
      throw new ValidationError(`Invalid promo code filter: ${errorMessage}`);
    }

    const { status } = result.data;

    const filter: any = {};
    if (status === "active") filter.isActive = true;
    else if (status === "inactive") filter.isActive = false;

    const promoCodes = await PromoCode.find(filter).sort({ createdAt: -1 }); //sort by createdAt descending order

    res.status(200).json(promoCodes);
  } catch (error) {
    next(error);
  }
};

export const createPromoCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = CreatePromoCodeDTO.safeParse(req.body);

    if (!result.success) {
      const errorMessage = result.error.errors[0].message || "Invalid input";
      throw new ValidationError(`Invalid promo code data: ${errorMessage}`);
    }

    //chcek if the promo code already exists
    const existingPromoCode = await PromoCode.findOne({
      code: result.data.code,
    });
    if (existingPromoCode) {
      throw new ValidationError("Promo code already exists");
    }

    // Create a new promo code
    const newPromoCode = await PromoCode.create(result.data);

    res.status(201).json(newPromoCode);
  } catch (error) {
    next(error);
  }
};

export const updatePromoCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = UpdatePromoCodeDTO.safeParse(req.body);

    if (!result.success) {
      const errorMessage = result.error.errors[0].message || "Invalid input";
      throw new ValidationError(`Invalid promo code data: ${errorMessage}`);
    }

    const id = req.params.id;

    const updatedPromoCode = await PromoCode.findByIdAndUpdate(
      id,
      result.data,
      { new: true, runValidators: true }
    );

    // {new: true} returns the updated document instead of the original document
    // {runValidators: true} validates the update against schema rules

    if (!updatedPromoCode) {
      throw new ValidationError("Promo code not found");
    }
    res.status(200).json(updatedPromoCode);
  } catch (error) {
    next(error);
  }
};

export const updatePromoCodeStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = UpdatePromoCodeStatusDTO.safeParse(req.query);

    if (!result.success) {
      const errorMessage =
        result.error.errors[0].message || "Invalid status value";
      throw new ValidationError(`Invalid promo code status: ${errorMessage}`);
    }

    const id = req.params.id;
    const isActive = result.data.status;

    const updatedPromoCode = await PromoCode.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );
    // {new: true} returns the updated document instead of the original document
    // {runValidators: true} validates the update against schema rules

    if (!updatedPromoCode) {
      throw new ValidationError("Promo code not found");
    }
    res.status(200).json({
      message: `Promo code ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      promoCode: updatedPromoCode,
    });
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
    const result = ValidatePromoCodeDTO.safeParse(req.query);

    if (!result.success) {
      const errorMessage = result.error.errors[0].message || "Invalid input";
      throw new ValidationError(`Invalid promo code data: ${errorMessage}`);
    }

    const code = result.data.code;
    const userId = req.auth.userId;

    const promoCode = await PromoCode.findOne({
      code: code,
      isActive: true,
      expiresAt: { $gt: Date.now() },
    });

    if (!promoCode) {
      throw new ValidationError("Invalid or expired promo code");
    }

    // Check if this is a "first order only" promo code
    if (promoCode.firstOrderOnly) {
      // Find if user has any previous completed orders
      const previousOrders = await Order.countDocuments({
        userId: userId,
      });

      if (previousOrders > 0) {
        throw new ValidationError(
          "This promo code is only available for first-time customers."
        );
      }
    }

    res.status(200).json({
      code: promoCode.code,
      discountPercentage: promoCode.discountPercentage,
    });
  } catch (error) {
    next(error);
  }
};
