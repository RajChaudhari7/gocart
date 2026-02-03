import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request) {
  try {
    const { userId, has } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, addressId, couponCode, paymentMethod } =
      await request.json();

    if (!items || !items.length || !addressId || !paymentMethod) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const isPrimeMember = has({ plan: "prime" });

    const ordersByStore = new Map();

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!ordersByStore.has(product.storeId)) {
        ordersByStore.set(product.storeId, []);
      }

      ordersByStore
        .get(product.storeId)
        .push({ ...item, price: product.price });
    }

    let orderIds = [];
    let fullAmount = 0;
    let isShippingFeeAdded = false;

    for (const [storeId, sellerItems] of ordersByStore.entries()) {
      let total = sellerItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      if (!isPrimeMember && !isShippingFeeAdded) {
        total += 50;
        isShippingFeeAdded = true;
      }

      fullAmount += total;

      const now = new Date();

      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
          total,
          paymentMethod,

          // ✅ STATUS + HISTORY
          status: "ORDER_PLACED",
          statusHistory: {
            ORDER_PLACED: now.toISOString(),
          },

          orderItems: {
            create: sellerItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      orderIds.push(order.id);
    }

    if (paymentMethod === "STRIPE") {
      const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
      const origin = request.headers.get("origin");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: { name: "Order" },
              unit_amount: Math.round(fullAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/loading?nextUrl=orders`,
        cancel_url: `${origin}/cart`,
        metadata: { orderIds: orderIds.join(","), userId },
      });

      return NextResponse.json({ session });
    }

    return NextResponse.json({ message: "Order Placed Successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const orders = await prisma.order.findMany({
      where: {
        userId,
        OR: [
          { paymentMethod: PaymentMethod.COD },
          {
            AND: [
              { paymentMethod: PaymentMethod.STRIPE },
              { isPaid: true },
            ],
          },
        ],
      },
      include: {
        orderItems: {
          include: { product: true },
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
