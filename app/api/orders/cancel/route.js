import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "Order already cancelled" }, { status: 400 });
    }

    // 🔥 SAFE TRANSACTION
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Restore stock safely (atomic)
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: item.quantity, // ✅ SAFE
            },
          },
        });
      }

      // 2️⃣ Update order status + history
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          statusHistory: {
            ...(order.statusHistory || {}),
            CANCELLED: new Date().toISOString(),
          },
        },
      });
    });

    return NextResponse.json({
      message: "Order cancelled & stock restored",
      orderId: order.id,
      restoredAmount: order.total,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 500 }
    );
  }
}
