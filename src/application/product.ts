import { CreateProductDTO } from "../domain/dto/product";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import Product from "../infrastructure/schemas/Product";
import stripe from "../infrastructure/stripe";

import { Request, Response, NextFunction } from "express";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.query;
    if (!categoryId) {
      const data = await Product.find();
      res.status(200).json(data);
      return;
    }

    const data = await Product.find({ categoryId });
    res.status(200).json(data);
    return;
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.query;

    let filter: any = { isFeatured: true };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const data = await Product.find(filter);
    res.status(200).json(data);
    return;
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
      throw new ValidationError("Invalid product data");
    }

    const stripeProduct = await stripe.products.create({
      name: result.data.name,
      description: result.data.description,
      default_price_data: {
        currency: "usd",
        unit_amount: result.data.price * 100,
      },
    });

    const product = await Product.create({
      ...result.data,
      stripePriceId: stripeProduct.default_price,
    });
    res.status(201).json(product);
    return;
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
    const product = await Product.findById(id).populate("categoryId");
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(200).json(product);
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(204).send();
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
    const id = req.params.id;
    const product = await Product.findByIdAndUpdate(id, req.body);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    res.status(200).send(product);
    return;
  } catch (error) {
    next(error);
  }
};
