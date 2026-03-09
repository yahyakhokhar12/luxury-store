import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: Request) {
  try {
    const { orderId, transactionId } = (await req.json()) as {
      orderId: string;
      transactionId?: string;
    };

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.paymentStatus = "paid";
    order.paymentMethod = order.paymentMethod || "raast";
    if (transactionId) {
      order.raastTransactionId = transactionId;
    }
    if (order.orderStatus === "placed") {
      order.orderStatus = "processing";
    }
    await order.save();
    return NextResponse.json({ message: "Payment confirmed" });
  } catch {
    return NextResponse.json({ error: "Unable to confirm payment" }, { status: 500 });
  }
}
