import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getRequestUser } from "@/lib/server-auth";

type CheckoutItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export async function POST(req: Request) {
  try {
    const { items, customer, deliveryFee = 350 } = (await req.json()) as {
      items: CheckoutItem[];
      deliveryFee?: number;
      customer: {
        name: string;
        email: string;
        phone: string;
        address: {
          line1: string;
          city: string;
          province: string;
          postalCode: string;
        };
      };
    };
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (
      !customer?.name ||
      !customer?.email ||
      !customer?.phone ||
      !customer?.address?.line1 ||
      !customer?.address?.city ||
      !customer?.address?.province ||
      !customer?.address?.postalCode
    ) {
      return NextResponse.json({ error: "Complete customer details are required" }, { status: 400 });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + deliveryFee;
    const reqUser = getRequestUser(req);
    const raastReference = `RAAST-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;

    await connectDB();
    const order = await Order.create({
      userId: reqUser?.id || "",
      customerName: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      items: items.map((item) => ({
        productId: String(item.id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      subtotal,
      deliveryFee,
      total,
      paymentMethod: "raast",
      paymentStatus: "pending",
      orderStatus: "placed",
      raastReference,
    });

    return NextResponse.json({
      message: "Raast payment order created",
      orderId: order._id.toString(),
      raastReference,
      paymentMethod: "raast",
      raast: {
        accountTitle: process.env.RAAST_ACCOUNT_TITLE || "Luxora Store",
        iban: process.env.RAAST_IBAN || "",
        mobile: process.env.RAAST_MOBILE || "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to create Raast order" }, { status: 500 });
  }
}
