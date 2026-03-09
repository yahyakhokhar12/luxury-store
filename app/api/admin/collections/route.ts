import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HomeCollection from "@/models/HomeCollection";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const collections = await HomeCollection.find().sort({ createdAt: -1 });
    return NextResponse.json(collections);
  } catch {
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const { title, caption, image } = await req.json();
    if (!title || !image) {
      return NextResponse.json(
        { error: "Collection title and image are required" },
        { status: 400 }
      );
    }

    const collection = await HomeCollection.create({
      title,
      caption: caption || "",
      image,
    });
    return NextResponse.json(collection, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
