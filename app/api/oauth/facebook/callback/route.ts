import { NextResponse } from "next/server";
import { createAuthToken, findOrCreateSocialUser } from "@/lib/social-auth";

export const runtime = "nodejs";

function getFacebookAppId() {
  return process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "";
}

function getFacebookAppSecret() {
  return process.env.FACEBOOK_APP_SECRET || "";
}

function getAppOrigin(req: Request) {
  return process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
}

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const origin = getAppOrigin(req);
  const code = reqUrl.searchParams.get("code");
  const state = reqUrl.searchParams.get("state");
  const redirectUri = `${origin}/api/oauth/facebook/callback`;
  const cookieState = req.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("facebook_oauth_state="))
    ?.replace("facebook_oauth_state=", "");

  const appId = getFacebookAppId();
  const appSecret = getFacebookAppSecret();
  if (!appId || !appSecret) {
    return NextResponse.redirect(`${origin}/auth?error=facebook_config_missing`);
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(`${origin}/auth?error=facebook_state_invalid`);
  }

  try {
    const tokenUrl = new URL("https://graph.facebook.com/v23.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl);
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect(`${origin}/auth?error=facebook_token_failed`);
    }

    const profileUrl = new URL("https://graph.facebook.com/me");
    profileUrl.searchParams.set("fields", "id,name,email");
    profileUrl.searchParams.set("access_token", tokenData.access_token);

    const profileRes = await fetch(profileUrl);
    const profile = (await profileRes.json()) as { email?: string; name?: string };
    if (!profileRes.ok || !profile.email) {
      return NextResponse.redirect(`${origin}/auth?error=facebook_email_missing`);
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
    response.cookies.set("facebook_oauth_state", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/auth?error=facebook_oauth_failed`);
  }
}
