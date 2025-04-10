import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stripePriceId: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    required: false,
    default: false,
  },
});

export default mongoose.model("Product", ProductSchema);
