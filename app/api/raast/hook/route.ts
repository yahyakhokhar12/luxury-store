import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const hookSecret = process.env.RAAST_HOOK_SECRET || "";
    const authHeader = req.headers.get("x-raast-hook-secret") || "";
    if (!hookSecret || authHeader !== hookSecret) {
      return NextResponse.json({ error: "Unauthorized hook call" }, { status: 401 });
    }

    const { orderId, raastReference, transactionId, status } = (await req.json()) as {
      orderId?: string;
      raastReference?: string;
      transactionId?: string;
      status?: "paid" | "failed" | "pending";
    };

    if (!orderId && !raastReference) {
      return NextResponse.json(
        { error: "orderId or raastReference is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const order = await Order.findOne({
      ...(orderId ? { _id: orderId } : {}),
      ...(raastReference ? { raastReference } : {}),
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status) {
      order.paymentStatus = status;
      if (status === "paid" && order.orderStatus === "placed") {
        order.orderStatus = "processing";
      }
    }
    if (transactionId) {
      order.raastTransactionId = transactionId;
    }
    await order.save();

    return NextResponse.json({ message: "Raast hook processed", orderId: order._id.toString() });
  } catch {
    return NextResponse.json({ error: "Unable to process Raast hook" }, { status: 500 });
  }
}
