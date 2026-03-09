import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export type RequestUser = {
  id: string;
  email: string;
  isAdmin: boolean;
};

function tokenFromCookieHeader(cookieHeader: string) {
  const tokenCookie = cookieHeader
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("token="));

  if (!tokenCookie) return null;
  return tokenCookie.replace("token=", "");
}

export function getRequestUser(req: Request): RequestUser | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const token = tokenFromCookieHeader(cookieHeader);
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    return {
      id: payload.id,
      email: payload.email,
      isAdmin: Boolean(payload.isAdmin),
    };
  } catch {
    return null;
  }
}

export function requireAdmin(req: Request) {
  const user = getRequestUser(req);
  if (!user || !user.isAdmin) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, errorResponse: null as NextResponse | null };
}
