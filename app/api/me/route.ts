import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const tokenCookie = cookieHeader
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("token="));

  if (!tokenCookie) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const token = tokenCookie.replace("token=", "");

  try {
    const payload = verifyToken(token);
    await connectDB();
    const user = await User.findById(payload.id).select("name email phone address isAdmin");
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || { line1: "", city: "", province: "", postalCode: "" },
        isAdmin: Boolean(user.isAdmin),
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
