import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Use a getter for the client to ensure it's not pre-rendered with missing env vars
const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for webhooks
  );
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
       console.error("PAYSTACK_SECRET_KEY is not defined");
       return new Response("Configuration Error", { status: 500 });
    }

    // 1. Verify Paystack Signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid Webhook Signature");
      return new Response("Invalid Signature", { status: 400 });
    }

    const event = JSON.parse(body);

    // 2. Only handle successful charge events
    if (event.event === "charge.success") {
      const { metadata, amount, customer, fees } = event.data;
      const userId = metadata?.userId;
      const plan = metadata?.plan;

      if (userId) {
        const supabase = getSupabase();
        
        // Calculate expiry dates
        const now = new Date();
        const expiresAt = new Date();
        if (plan === 'weekly') {
          expiresAt.setDate(now.getDate() + 7);
        } else {
          expiresAt.setDate(now.getDate() + 31);
        }

        // 3. Activate profile (background process)
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            status: "active",
            is_subscribed: true,
            plan: plan || "monthly",
            subscription_started_at: now.toISOString(),
            subscription_expires_at: expiresAt.toISOString(),
          })
          .eq("id", userId);

        if (profileError) console.error("Webhook Profile Update Error:", profileError);

        // 4. Log transaction
        const { error: txError } = await supabase.from("transactions").insert({
          model_id: userId,
          user_name: customer?.email || "unknown",
          type: "Subscription (Webhook)",
          plan: plan,
          amount: amount / 100,
          status: "success",
        });
        
        if (txError) console.error("Webhook Transaction Logging Error:", txError);
      }
    }

    return new Response("Webhook Received", { status: 200 });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
