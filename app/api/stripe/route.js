import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  const body = await req.text(); // ✅ RAW BODY
  const sig = headers().get("stripe-signature");

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  console.log("✅ Stripe Event:", event.type);

  // ================= HANDLE PAYMENT =================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("🔥 Webhook Metadata:", session.metadata);

    const { orderIds, userId, appId } = session.metadata || {};

    if (appId !== "globalmart") {
      console.log("❌ Invalid appId:", appId);
      return NextResponse.json({ received: true });
    }

    if (!orderIds || !userId) {
      console.log("❌ Missing metadata:", session.metadata);
      return NextResponse.json({ received: true });
    }

    const orderIdsArray = orderIds.split(",");

    // ✅ Mark orders as PAID
    await prisma.order.updateMany({
      where: {
        id: { in: orderIdsArray },
      },
      data: {
        isPaid: true,
      },
    });

    // ✅ Clear user cart
    await prisma.user.update({
      where: { id: userId },
      data: { cart: {} },
    });

    console.log("🎉 Orders marked paid:", orderIdsArray);
  }

  return NextResponse.json({ received: true });
}
