import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HomeCollection from "@/models/HomeCollection";
import { requireAdmin } from "@/lib/server-auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const { id } = await params;
    const deleted = await HomeCollection.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Collection deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
