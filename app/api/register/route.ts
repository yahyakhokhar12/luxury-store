import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password, phone, address } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminCount = await User.countDocuments({ isAdmin: true });

    await User.create({
      name,
      email,
      phone: phone || "",
      address: {
        line1: address?.line1 || "",
        city: address?.city || "",
        province: address?.province || "",
        postalCode: address?.postalCode || "",
      },
      password: hashedPassword,
      isAdmin: adminCount === 0,
    });

    return NextResponse.json({
      message: "User registered successfully",
      isAdmin: adminCount === 0,
    });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
