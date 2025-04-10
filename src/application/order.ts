import { NextFunction, Request, Response } from "express";
import ValidationError from "../domain/errors/validation-error";
import Order from "../infrastructure/schemas/Order";
import PromoCode from "../infrastructure/schemas/PromoCode";
import Product from "../infrastructure/schemas/Product";
import Address from "../infrastructure/schemas/Address";
import NotFoundError from "../domain/errors/not-found-error";
import { CreateOrderDTO } from "../domain/dto/order";
import mongoose from "mongoose";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Start a MongoDB session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = CreateOrderDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid order data");
    }

    // Verify stock availability and attach stripePriceId
    const itemsWithStripe = await Promise.all(
      result.data.items.map(async (item) => {
        const product = await Product.findById(item.product._id);

        if (!product) {
          throw new ValidationError(`Product ${item.product._id} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new ValidationError(
            `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}`
          );
        }

        return {
          ...item,
          product: {
            ...item.product,
            stripePriceId: product.stripePriceId, // ✅ attach it here
          },
        };
      })
    );

    const userId = req.auth.userId;

    //calculate subTotal, discount, grandTotal
    const subTotal = itemsWithStripe.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    let discount = 0;
    if (result.data.promoCode) {
      const promo = await PromoCode.findOne({
        code: result.data.promoCode,
        isActive: true,
        expiresAt: { $gt: Date.now() }, // Check if promo code is still valid
      });

      if (!promo) {
        throw new ValidationError("Invalid or expired promo code");
      }

      // Check if this is a first-order only promo code
      if (promo.firstOrderOnly) {
        // Count previous completed orders for this user
        const previousOrders = await Order.countDocuments({
          userId: userId,
        });

        if (previousOrders > 0) {
          throw new ValidationError(
            "This promo code is for new customers only."
          );
        }
      }

      // Apply discount
      discount = (promo.discountPercentage / 100) * subTotal;
    }

    const grandTotal = subTotal - discount;

    if (grandTotal < 0) {
      throw new ValidationError("Grand total cannot be negative");
    }

    // Update stock quantities
    const stockUpdatePromises = itemsWithStripe.map((item) =>
      Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stockQuantity: -item.quantity } },
        { session, new: true }
      )
    );
    await Promise.all(stockUpdatePromises);

    // Create address
    const address = await Address.create([{ ...result.data.shippingAddress }], {
      session,
    });

    // Create order
    const order = await Order.create(
      [
        {
          userId,
          items: itemsWithStripe,
          addressId: address[0]._id,
          subTotal,
          discount,
          grandTotal,
        },
      ],
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    res.status(201).json({ orderId: order[0]._id });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id)
      .populate({
        path: "addressId",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      });
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const getOrdersByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.auth.userId;
    const orders = await Order.find({ userId });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
