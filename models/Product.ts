import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  description: String,
  image: String,
  images: {
    type: [String],
    default: [],
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  newArrival: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
