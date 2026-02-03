import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // 🔥 HANDLE CHECKOUT SESSION (NOT PAYMENT INTENT)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const { orderIds, userId, appId } = session.metadata || {};

      if (appId !== "globalmart") {
        return NextResponse.json({ received: true });
      }

      const orderIdsArray = orderIds.split(",");

      // ✅ MARK ORDERS AS PAID
      await Promise.all(
        orderIdsArray.map((orderId) =>
          prisma.order.update({
            where: { id: orderId },
            data: { isPaid: true },
          })
        )
      );

      // ✅ CLEAR USER CART
      await prisma.user.update({
        where: { id: userId },
        data: { cart: {} },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export const config = {
  api: { bodyParser: false },
};
