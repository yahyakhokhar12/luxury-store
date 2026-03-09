import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const { name, price, category, image, images, newArrival } = await req.json();
    const normalizedImages = Array.isArray(images)
      ? images.filter((item: unknown): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
    const primaryImage = image || normalizedImages[0];
    if (!name || !price || !category || !primaryImage) {
      return NextResponse.json({ error: "All product fields are required" }, { status: 400 });
    }

    const product = await Product.create({
      name,
      price: Number(price),
      category,
      image: primaryImage,
      images: normalizedImages.length > 0 ? normalizedImages : [primaryImage],
      newArrival: Boolean(newArrival),
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
