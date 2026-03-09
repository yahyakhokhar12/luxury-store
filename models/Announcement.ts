import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "main" },
    items: { type: [String], default: [] },
    ctaLabel: { type: String, default: "Shop Now" },
    ctaHref: { type: String, default: "/products" },
  },
  { timestamps: true }
);

export default mongoose.models.Announcement ||
  mongoose.model("Announcement", AnnouncementSchema);
