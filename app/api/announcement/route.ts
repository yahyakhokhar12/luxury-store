import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";

const fallback = {
  items: [
    "Light layers, bold statements",
    "Summer collection just dropped",
    "Flat shipping in major cities",
    "Raast and COD available",
  ],
  ctaLabel: "Shop Now",
  ctaHref: "/products",
};

export async function GET() {
  try {
    await connectDB();
    const announcement = await Announcement.findOne({ key: "main" });
    if (!announcement) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json({
      items: announcement.items || fallback.items,
      ctaLabel: announcement.ctaLabel || fallback.ctaLabel,
      ctaHref: announcement.ctaHref || fallback.ctaHref,
    });
  } catch {
    return NextResponse.json(fallback);
  }
}
