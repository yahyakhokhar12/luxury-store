import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  address: {
    line1: { type: String, default: "" },
    city: { type: String, default: "" },
    province: { type: String, default: "" },
    postalCode: { type: String, default: "" },
  },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.User || 
  mongoose.model("User", UserSchema);
