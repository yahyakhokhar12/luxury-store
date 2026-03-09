import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const [products, users, orders] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.find().sort({ createdAt: -1 }),
    ]);

    const revenue = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    return NextResponse.json({
      products,
      users,
      orders: orders.length,
      revenue,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
