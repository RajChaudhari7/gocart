import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Razorpay sends order_id in payload.payment.entity.order_id
    const paymentEntity = event.payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;

    // Fetch orders from DB using razorpayData -> orderIds
    const orders = await prisma.order.findMany({
      where: { razorpayData: { path: ["order_id"], equals: razorpayOrderId } },
    });

    if (!orders.length) {
      return NextResponse.json({ received: true, message: "No orders found for this Razorpay order" });
    }

    // Only handle captured and failed payments
    switch (event.event) {
      case "payment.captured":
        await Promise.all(
          orders.map(order =>
            prisma.order.update({
              where: { id: order.id },
              data: { isPaid: true, razorpayData: paymentEntity },
            })
          )
        );

        // Clear user's cart
        await prisma.user.update({
          where: { id: orders[0].userId },
          data: { cart: {} },
        });
        break;

      case "payment.failed":
        await Promise.all(
          orders.map(order =>
            prisma.order.update({
              where: { id: order.id },
              data: { isPaid: false, razorpayData: paymentEntity },
            })
          )
        );
        break;

      default:
        console.log("Unhandled Razorpay event type:", event.event);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Disable Next.js body parser for Razorpay webhook
export const config = {
  api: { bodyParser: false },
};
