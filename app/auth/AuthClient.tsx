"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

type AuthMode = "signin" | "signup";

export default function AuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<null | "google" | "facebook">(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const oauthError = searchParams.get("error");

  const getOauthErrorMessage = (code: string | null) => {
    if (!code) return "";
    const mapping: Record<string, string> = {
      google_config_missing:
        "Google sign-in is not configured yet (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).",
      google_state_invalid: "Google sign-in was cancelled or expired. Please try again.",
      google_token_failed: "Could not verify Google sign-in. Please try again.",
      google_email_missing: "Google account did not provide an email address.",
      google_oauth_failed: "Google sign-in failed. Please try again.",
      facebook_config_missing:
        "Facebook sign-in is not configured yet (missing FACEBOOK_APP_ID / FACEBOOK_APP_SECRET).",
      facebook_state_invalid: "Facebook sign-in was cancelled or expired. Please try again.",
      facebook_token_failed: "Could not verify Facebook sign-in. Please try again.",
      facebook_email_missing: "Facebook account did not provide email permission.",
      facebook_oauth_failed: "Facebook sign-in failed. Please try again.",
    };
    return mapping[code] || "Unable to complete social sign-in.";
  };

  const onSocialClick = (provider: "google" | "facebook") => {
    setError("");
    setMessage("");
    setSocialLoading(provider);
    window.location.href =
      provider === "google" ? "/api/oauth/google/start" : "/api/oauth/facebook/start";
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signup") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            phone,
            address: { line1, city, province, postalCode },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Sign up failed");
        setMessage("Account created. Please sign in.");
        setMode("signin");
      } else {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Sign in failed");
        await refreshUser();
        router.push("/products");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            className={mode === "signin" ? "is-active" : ""}
            onClick={() => setMode("signin")}
            type="button"
          >
            Sign In
          </button>
          <button
            className={mode === "signup" ? "is-active" : ""}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <h2>{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
        <p className="muted">Secure access to your ladies eastern wear shopping profile.</p>
        {mode === "signin" && oauthError ? (
          <p className="form-error">{getOauthErrorMessage(oauthError)}</p>
        ) : null}

        <form className="auth-form" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (Pakistan format)"
                required
              />
              <input
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="Address line"
                required
              />
              <div className="auth-grid">
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
                <input
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Province"
                  required
                />
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Postal Code"
                  required
                />
              </div>
            </>
          ) : null}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            minLength={6}
            required
          />

          {error ? <p className="form-error">{error}</p> : null}
          {message ? <p className="form-success">{message}</p> : null}

          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {mode === "signin" ? (
          <div className="social-auth">
            <p className="muted">Or continue with</p>
            <div className="social-auth-grid">
              <button
                type="button"
                className="social-btn"
                disabled={socialLoading !== null}
                onClick={() => onSocialClick("google")}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M21.8 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.5c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.6 2.9-4 2.9-7Z" />
                  <path d="M12 22c2.6 0 4.9-.9 6.6-2.5l-3.1-2.4c-.9.6-2 .9-3.5.9-2.7 0-4.9-1.8-5.7-4.2H3.1v2.5A10 10 0 0 0 12 22Z" />
                  <path d="M6.3 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.7H3.1A10 10 0 0 0 2 12c0 1.6.4 3.2 1.1 4.3l3.2-2.5Z" />
                  <path d="M12 6c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0 0 12 2 10 10 0 0 0 3.1 7.7l3.2 2.5C7.1 7.8 9.3 6 12 6Z" />
                </svg>
                {socialLoading === "google" ? "Redirecting..." : "Continue with Google"}
              </button>
              <button
                type="button"
                className="social-btn"
                disabled={socialLoading !== null}
                onClick={() => onSocialClick("facebook")}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13.5 22v-8h2.7l.4-3h-3V9.1c0-.9.3-1.5 1.6-1.5h1.6V4.9C16.5 4.8 15.7 4.7 14.8 4.7c-2.7 0-4.5 1.6-4.5 4.7V11H7.6v3h2.7v8h3.2Z" />
                </svg>
                {socialLoading === "facebook" ? "Redirecting..." : "Continue with Facebook"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

