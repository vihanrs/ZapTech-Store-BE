import moment from "moment";
import mongoose from "mongoose";

const PromoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
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
      get: (v: Date): string => moment(v).format("YYYY-MM-DD"),
    },
  },
  { toJSON: { getters: true } }
);

export default mongoose.model("PromoCode", PromoCodeSchema);
