import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Supabase client for server-side use (uses publishable key + permissive RLS policies)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const signature = req.headers.get("x-paystack-signature") || "";
  const body = await req.text();

  // Verify HMAC SHA512 signature from Paystack
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  if (hash !== signature) {
    console.error("Paystack webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  console.log("Paystack webhook event:", event.event);

  if (event.event === "charge.success") {
    const { metadata, amount, customer } = event.data;
    const userId = metadata?.userId;
    const plan = metadata?.plan;

    if (!userId) {
      return NextResponse.json({ error: "No userId in metadata" }, { status: 400 });
    }

    // Calculate expiry dates
    const now = new Date();
    const expiresAt = new Date();
    if (plan === 'weekly') {
      expiresAt.setDate(now.getDate() + 7);
    } else {
      expiresAt.setDate(now.getDate() + 31);
    }

    // Activate the user's profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        status: "active",
        is_subscribed: true,
        plan: plan || "monthly",
        subscription_started_at: now.toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    // Record the transaction
    await supabase.from("transactions").insert({
      model_id: userId,
      user_name: customer?.email || "unknown",
      type: "Subscription",
      plan: plan,
      amount: amount / 100, // Paystack sends in kobo
      status: "success",
    });

    console.log(`Profile ${userId} activated via webhook`);
  }

  return NextResponse.json({ received: true });
}
