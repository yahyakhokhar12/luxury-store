import { NextResponse } from "next/server";
import { createAuthToken, findOrCreateSocialUser } from "@/lib/social-auth";

export const runtime = "nodejs";

function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
}

function getGoogleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}

function getAppOrigin(req: Request) {
  return process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
}

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const origin = getAppOrigin(req);
  const code = reqUrl.searchParams.get("code");
  const state = reqUrl.searchParams.get("state");
  const redirectUri = `${origin}/api/oauth/google/callback`;
  const cookieState = req.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("google_oauth_state="))
    ?.replace("google_oauth_state=", "");

  const clientId = getGoogleClientId();
  const clientSecret = getGoogleClientSecret();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/auth?error=google_config_missing`);
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(`${origin}/auth?error=google_state_invalid`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect(`${origin}/auth?error=google_token_failed`);
    }

    const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = (await profileRes.json()) as { email?: string; name?: string };
    if (!profileRes.ok || !profile.email) {
      return NextResponse.redirect(`${origin}/auth?error=google_email_missing`);
    }

    const user = await findOrCreateSocialUser({
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
    });
    const token = createAuthToken(user);

    const response = NextResponse.redirect(`${origin}/products`);
    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    response.cookies.set("google_oauth_state", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/auth?error=google_oauth_failed`);
  }
}
