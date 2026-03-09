import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/server-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const product = await Product.findByIdAndUpdate(
      id,
      {
        ...(typeof body.name === "string" ? { name: body.name } : {}),
        ...(typeof body.category === "string" ? { category: body.category } : {}),
        ...(typeof body.image === "string" ? { image: body.image } : {}),
        ...(Array.isArray(body.images)
          ? {
              images: body.images.filter(
                (item: unknown): item is string =>
                  typeof item === "string" && item.trim().length > 0
              ),
            }
          : {}),
        ...(body.price !== undefined ? { price: Number(body.price) } : {}),
        ...(typeof body.newArrival === "boolean" ? { newArrival: body.newArrival } : {}),
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
