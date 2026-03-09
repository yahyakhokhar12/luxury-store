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

type CustomerDetails = {
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      items: CheckoutItem[];
      customer: CustomerDetails;
      deliveryFee?: number;
    };

    const { items, customer } = body;
    const deliveryFee = Number(body.deliveryFee ?? 350);

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
      paymentMethod: "cod",
      paymentStatus: "cod_pending",
      orderStatus: "placed",
    });

    return NextResponse.json({
      message: "COD order placed successfully",
      orderId: order._id.toString(),
    });
  } catch {
    return NextResponse.json({ error: "Unable to place COD order" }, { status: 500 });
  }
}
