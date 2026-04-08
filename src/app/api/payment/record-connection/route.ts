import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { modelId, payerEmail, amount, reference } = await req.json();

    if (!modelId || !payerEmail || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    );

    const { error } = await supabase.from("transactions").insert({
      model_id: modelId,
      user_name: payerEmail,
      type: "Connection",
      plan: null,
      amount: amount,
      status: "success",
    });

    if (error) {
      console.error("Transaction insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Record connection error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
