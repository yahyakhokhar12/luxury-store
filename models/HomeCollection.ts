import mongoose from "mongoose";

const HomeCollectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    caption: { type: String, default: "" },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.HomeCollection ||
  mongoose.model("HomeCollection", HomeCollectionSchema);
