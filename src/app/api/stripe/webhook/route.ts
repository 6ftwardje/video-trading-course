import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Stripe signature verification failed", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  console.log("✅ Stripe event received:", event.type);

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;
    const student_id = session.client_reference_id;

    if (!student_id) {
      return new NextResponse("Missing client_reference_id", { status: 400 });
    }

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("stripe_session_id", session.id)
      .single();

    if (!existingPayment) {
      await supabase.from("payments").insert({
        student_id,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        amount: session.amount_total,
        currency: session.currency,
        status: "paid",
      });
    }

    await supabase
      .from("students")
      .update({ access_level: 2 })
      .eq("id", student_id);
  } catch (err) {
    console.error("Error processing webhook:", err);
  }

  return NextResponse.json({ received: true });
}

