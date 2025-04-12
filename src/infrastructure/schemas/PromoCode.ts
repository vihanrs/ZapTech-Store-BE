import mongoose from "mongoose";

const PromoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: [0, "Discount must be >= 0%"],
      max: [100, "Discount cannot exceed 100%"],
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    firstOrderOnly: {
      type: Boolean,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date): boolean {
          return value >= new Date();
        },
        message: "Expiration date must be in the future",
      },
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export default mongoose.model("PromoCode", PromoCodeSchema);
