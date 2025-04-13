import {
  CreateProductDTO,
  GetProductsDTO,
  UpdateProductDTO,
  UpdateProductStatusDTO,
} from "../domain/dto/product";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import Product from "../infrastructure/schemas/Product";
import stripe from "../infrastructure/stripe";

import { Request, Response, NextFunction } from "express";
import { calculateStockStatus } from "../utils/stock-status";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = GetProductsDTO.safeParse(req.query);
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || "Invalid filters";
      throw new ValidationError(`Invalid product filter: ${errorMessage}`);
    }

    const { categoryId, tag, status } = result.data;

    const filter: any = {};

    if (categoryId) filter.categoryId = categoryId;
    if (tag) filter.tags = { $in: tag.split(",") };

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    const products = await Product.find(filter)
      .populate("categoryId", "name") // Optional: populate category name
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate("categoryId", "name");
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = CreateProductDTO.safeParse(req.body);
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || "Invalid data";
      throw new ValidationError(`Invalid product data: ${errorMessage}`);
    }

    const productData = result.data;

    const existingProduct = await Product.findOne({
      name: productData.name,
    });

    if (existingProduct) {
      throw new ValidationError("Product with this name already exists");
    }

    const stockStatus = calculateStockStatus(productData.stockQuantity);

    const stripeProduct = await stripe.products.create({
      name: result.data.name,
      description: result.data.description,
      default_price_data: {
        currency: "usd",
        unit_amount: result.data.price * 100,
      },
    });

    if (!stripeProduct.default_price) {
      throw new Error("Stripe product creation failed - no price returned");
    }

    const product = await Product.create({
      ...productData,
      stockStatus,
      stripePriceId: stripeProduct.default_price,
    });
    res.status(201).json(product);
    return;
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = UpdateProductDTO.safeParse(req.body);
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || "Invalid data";
      throw new ValidationError(`Invalid product data: ${errorMessage}`);
    }

    const id = req.params.id;
    const productData = result.data;

    // check if product with the same name already exists
    if (productData.name) {
      const existingProduct = await Product.findOne({
        name: productData.name,
        _id: { $ne: id }, // exclude current product
      });

      if (existingProduct) {
        throw new ValidationError("Product with this name already exists");
      }
    }

    // If stockQuantity is provided, update stockStatus
    let stockStatus;
    if (productData.stockQuantity !== undefined) {
      stockStatus = calculateStockStatus(productData.stockQuantity);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...productData, ...(stockStatus && { stockStatus }) },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      throw new NotFoundError("Product not found");
    }

    res.status(200).send(updatedProduct);
    return;
  } catch (error) {
    next(error);
  }
};

export const updateProductStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = UpdateProductStatusDTO.safeParse(req.query);

    if (!result.success) {
      const errorMessage =
        result.error.errors[0].message || "Invalid status value";
      throw new ValidationError(`Invalid product status: ${errorMessage}`);
    }
    const id = req.params.id;
    const { status: isActive } = result.data;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );
    // {new: true} returns the updated document instead of the original document
    // {runValidators: true} validates the update against schema rules

    if (!updatedProduct) {
      throw new NotFoundError("Product not found");
    }
    res.status(200).json({
      message: `Product ${isActive ? "activated" : "deactivated"} successfully`,
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};
