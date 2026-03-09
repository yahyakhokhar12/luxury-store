import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HomeCollection from "@/models/HomeCollection";

export async function GET() {
  try {
    await connectDB();
    const collections = await HomeCollection.find().sort({ createdAt: -1 });
    return NextResponse.json(collections);
  } catch {
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
