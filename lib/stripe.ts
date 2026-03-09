import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeSecret() {
  const secret = (process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY || "").trim();
  const invalidValues = new Set(["", "your_stripe_secret", "sk_test_replace_me"]);
  return invalidValues.has(secret) ? null : secret;
}

export function getStripeClient() {
  if (stripeClient) return stripeClient;

  const secret = getStripeSecret();
  if (!secret) {
    throw new Error("Missing valid Stripe secret. Set STRIPE_SECRET or STRIPE_SECRET_KEY.");
  }

  stripeClient = new Stripe(secret, {
    apiVersion: "2026-02-25.clover",
  });

  return stripeClient;
}
