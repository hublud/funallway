import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(new URL("/auth/register?error=no_reference", req.url));
  }

  try {
    // Verify the transaction with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== "success") {
      console.error("Paystack verify failed:", verifyData);
      return NextResponse.redirect(new URL(`/payment/failed?reference=${reference}`, req.url));
    }

    const { metadata, amount, customer } = verifyData.data;
    const userId = metadata?.userId;
    const plan = metadata?.plan;

    if (userId) {
      // Calculate expiry dates
      const now = new Date();
      const expiresAt = new Date();
      if (plan === 'weekly') {
        expiresAt.setDate(now.getDate() + 7);
      } else {
        expiresAt.setDate(now.getDate() + 31);
      }

      // Activate profile
      await supabase
        .from("profiles")
        .update({
          status: "active",
          is_subscribed: true,
          plan: plan || "monthly",
          subscription_started_at: now.toISOString(),
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq("id", userId);

      // Log transaction
      await supabase.from("transactions").insert({
        model_id: userId,
        user_name: customer?.email || "unknown",
        type: "Subscription",
        plan: plan,
        amount: amount / 100,
        status: "success",
      });
    }

    return NextResponse.redirect(new URL("/dashboard?payment=success", req.url));
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.redirect(new URL("/payment/failed", req.url));
  }
}
