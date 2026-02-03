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

    const { items, addressId, paymentMethod } = await request.json();

    if (!items?.length || !addressId || !paymentMethod) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const isPrimeMember = has({ plan: "prime" });
    const ordersByStore = new Map();

    let orderIds = [];
    let fullAmount = 0;
    let isShippingFeeAdded = false;

    // 🔥 EVERYTHING INSIDE ONE TRANSACTION
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Lock + validate + group
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        if (product.quantity < item.quantity) {
          throw new Error(
            `Not enough stock for ${product.name}. Available: ${product.quantity}`
          );
        }

        if (!ordersByStore.has(product.storeId)) {
          ordersByStore.set(product.storeId, []);
        }

        ordersByStore
          .get(product.storeId)
          .push({ ...item, price: product.price });
      }

      // 2️⃣ Create orders + decrement stock atomically
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

        const order = await tx.order.create({
          data: {
            userId,
            storeId,
            addressId,
            total,
            paymentMethod,
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

        // 🔥 DECREMENT STOCK SAFELY
        for (const item of sellerItems) {
          await tx.product.update({
            where: { id: item.id },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }
    });

    // ---------------- STRIPE ----------------
    if (paymentMethod === "STRIPE") {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
        metadata: {
          orderIds: orderIds.join(","),
          userId,
          appId: "globalmart", // ✅ REQUIRED FOR WEBHOOK
        },
      });

      return NextResponse.json({ session });
    }

    // ---------------- COD ----------------
    return NextResponse.json({ message: "Order Placed Successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// ================= GET USER ORDERS =================
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
              { isPaid: true }, // ✅ Stripe only when paid
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
