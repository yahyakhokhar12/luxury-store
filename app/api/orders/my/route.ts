import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getRequestUser } from "@/lib/server-auth";

export async function GET(req: Request) {
  const user = getRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const orders = await Order.find({
      $and: [
        { $or: [{ userId: user.id }, { email: user.email }] },
        {
          $or: [
            { orderStatus: { $ne: "delivered" } },
            { paymentStatus: { $ne: "paid" } },
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Failed to fetch your orders" }, { status: 500 });
  }
}
