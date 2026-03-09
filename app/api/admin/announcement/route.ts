import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";
import { requireAdmin } from "@/lib/server-auth";

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

export async function GET(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const announcement = await Announcement.findOne({ key: "main" });
    if (!announcement) return NextResponse.json(fallback);

    return NextResponse.json({
      items: announcement.items || fallback.items,
      ctaLabel: announcement.ctaLabel || fallback.ctaLabel,
      ctaHref: announcement.ctaHref || fallback.ctaHref,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch announcement settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const body: unknown = await req.json();
    const bodyObj =
      body && typeof body === "object" ? (body as Record<string, unknown>) : {};

    const rawItems = Array.isArray(bodyObj.items) ? bodyObj.items : [];
    const items = rawItems
      .map((item: unknown) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
      .slice(0, 12);

    if (items.length === 0) {
      return NextResponse.json({ error: "At least one announcement item is required" }, { status: 400 });
    }

    const ctaLabel =
      typeof bodyObj.ctaLabel === "string" && bodyObj.ctaLabel.trim()
        ? bodyObj.ctaLabel.trim()
        : "Shop Now";
    const ctaHref =
      typeof bodyObj.ctaHref === "string" && bodyObj.ctaHref.trim()
        ? bodyObj.ctaHref.trim()
        : "/products";

    await Announcement.findOneAndUpdate(
      { key: "main" },
      { key: "main", items, ctaLabel, ctaHref },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Announcement updated" });
  } catch {
    return NextResponse.json({ error: "Failed to update announcement settings" }, { status: 500 });
  }
}
