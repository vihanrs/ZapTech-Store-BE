import mongoose from "mongoose";
import { PRODUCT_TAGS } from "../../constants/productTags";
import { STOCK_STATUS } from "../../constants/stockStatus";

const ProductSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"],
    },
    stripePriceId: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    tags: {
      type: [String],
      enum: PRODUCT_TAGS,
      default: [],
    },
    stockStatus: {
      type: String,
      enum: STOCK_STATUS,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // timestamps to track createdAt and updatedAt.
);

export default mongoose.model("Product", ProductSchema);
