import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
}

function getAppOrigin(req: Request) {
  return process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
}

export async function GET(req: Request) {
  const clientId = getGoogleClientId();
  const origin = getAppOrigin(req);
  if (!clientId) {
    return NextResponse.redirect(`${origin}/auth?error=google_config_missing`);
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${origin}/api/oauth/google/callback`;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
