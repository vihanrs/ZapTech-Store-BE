import { NextFunction, Request, Response } from "express";
import {
  CreateCategoryDTO,
  GetCategoriesDTO,
  UpdateCategoryDTO,
  UpdateCategoryStatusDTO,
} from "../domain/dto/category";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import Category from "../infrastructure/schemas/Category";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = GetCategoriesDTO.safeParse(req.query);

    if (!result.success) {
      const errorMessage =
        result.error.errors[0]?.message || "Invalid status filter";
      throw new ValidationError(`Invalid category filter: ${errorMessage}`);
    }
    const { status } = result.data;
    const filter: any = {};
    if (status === "active") filter.isActive = true;
    else if (status === "inactive") filter.isActive = false;

    const categories = await Category.find(filter).sort({ createdAt: -1 }); //sort by createdAt descending order
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = CreateCategoryDTO.safeParse(req.body);
    if (!result.success) {
      const errorMessage =
        result.error.errors[0]?.message || "Invalid category data";
      throw new ValidationError(`Invalid category data: ${errorMessage}`);
    }
    //check if the category already exists
    const existingCategory = await Category.findOne({
      name: result.data.name,
    });
    if (existingCategory) {
      throw new ValidationError("Category already exists");
    }
    // Create a new category
    const newCategory = await Category.create(result.data);

    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = UpdateCategoryDTO.safeParse(req.body);
    if (!result.success) {
      const errorMessage = result.error.errors[0].message || "Invalid input";
      throw new ValidationError(`Invalid category data: ${errorMessage}`);
    }
    const id = req.params.id;

    // Check if new name already exists in a different category
    if (result.data.name) {
      const existingCategory = await Category.findOne({
        name: result.data.name,
        _id: { $ne: id }, // exclude the current category from the search ($ne - not equal)
      });

      if (existingCategory) {
        throw new ValidationError("Category name already exists");
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, result.data, {
      new: true,
      runValidators: true,
    });
    // {new: true} returns the updated document instead of the original document
    // {runValidators: true} validates the update against schema rules
    if (!updatedCategory) {
      throw new NotFoundError("Category not found");
    }

    res.status(200).json(updatedCategory);
    return;
  } catch (error) {
    next(error);
  }
};

export const updateCategoryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = UpdateCategoryStatusDTO.safeParse(req.query);

    if (!result.success) {
      const errorMessage =
        result.error.errors[0].message || "Invalid status value";
      throw new ValidationError(`Invalid category status: ${errorMessage}`);
    }
    const id = req.params.id;
    const { isActive } = result.data;
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );
    // {new: true} returns the updated document instead of the original document
    // {runValidators: true} validates the update against schema rules
    if (!updatedCategory) {
      throw new NotFoundError("Category not found");
    }
    res.status(200).json({
      message: `Category ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      category: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};
