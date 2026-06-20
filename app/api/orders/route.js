import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const generateNumericOrderId = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

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

    let orderIds = [];
    let fullAmount = 0;
    let isShippingFeeAdded = false;

    // 🔥 TRANSACTION START
    await prisma.$transaction(async (tx) => {
      const ordersByStore = new Map();

      // ===============================
      // 🔒 STEP 1: LOCK + VALIDATE + DECREMENT
      // ===============================
      for (const item of items) {
        const products = await tx.$queryRaw`
          SELECT * FROM "Product"
          WHERE id = ${item.id}
          FOR UPDATE
        `;

        if (!products.length) {
          throw new Error("Product not found");
        }

        const product = products[0];

        if (product.quantity < item.quantity) {
          throw new Error(
            `Not enough stock for ${product.name}. Available: ${product.quantity}`
          );
        }

        // ✅ Group by store
        if (!ordersByStore.has(product.storeId)) {
          ordersByStore.set(product.storeId, []);
        }

        ordersByStore.get(product.storeId).push({
          ...item,
          price: product.price,
        });

        // 🔥 SAFE DECREMENT (inside lock)
        await tx.$executeRaw`
          UPDATE "Product"
          SET quantity = quantity - ${item.quantity}
          WHERE id = ${item.id}
        `;
      }

      // ===============================
      // 📦 STEP 2: CREATE ORDERS
      // ===============================
      for (const [storeId, sellerItems] of ordersByStore.entries()) {
        let total = sellerItems.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );

        // 🚚 Shipping logic
        if (!isPrimeMember && !isShippingFeeAdded) {
          total += 50;
          isShippingFeeAdded = true;
        }

        fullAmount += total;
        const now = new Date();

        const numericOrderId = generateNumericOrderId();

        const order = await tx.order.create({
          data: {
            id: numericOrderId,
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
      }
    });
    // 🔥 TRANSACTION END

    // ===============================
    // 💵 COD RESPONSE
    // ===============================
    return NextResponse.json({
      message: "Order Placed Successfully",
      orderIds,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
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
        driver: true,
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
