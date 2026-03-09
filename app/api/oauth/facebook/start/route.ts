import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getFacebookAppId() {
  return process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "";
}

function getAppOrigin(req: Request) {
  return process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
}

export async function GET(req: Request) {
  const appId = getFacebookAppId();
  const origin = getAppOrigin(req);
  if (!appId) {
    return NextResponse.redirect(`${origin}/auth?error=facebook_config_missing`);
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${origin}/api/oauth/facebook/callback`;
  const authUrl = new URL("https://www.facebook.com/v23.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "email,public_profile");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("facebook_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
