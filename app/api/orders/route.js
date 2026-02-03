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

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !addressId ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon not found" },
          { status: 400 }
        );
      }
    }

    if (couponCode && coupon.forNewUser) {
      const userOrders = await prisma.order.findMany({ where: { userId } });
      if (userOrders.length > 0) {
        return NextResponse.json(
          { error: "Coupon valid for new users only" },
          { status: 400 }
        );
      }
    }

    const isPrimeMember = has({ plan: "prime" });

    if (couponCode && coupon.forMember && !isPrimeMember) {
      return NextResponse.json(
        { error: "Coupon valid for prime members only" },
        { status: 400 }
      );
    }

    const ordersByStore = new Map();
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });
      const storeId = product.storeId;

      if (!ordersByStore.has(storeId)) ordersByStore.set(storeId, []);
      ordersByStore.get(storeId).push({ ...item, price: product.price });
    }

    let orderIds = [];
    let fullAmount = 0;
    let isShippingFeeAdded = false;

    for (const [storeId, sellerItems] of ordersByStore.entries()) {
      let total = sellerItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      if (couponCode) total -= (total * coupon.discount) / 100;

      if (!isPrimeMember && !isShippingFeeAdded) {
        total += 50;
        isShippingFeeAdded = true;
      }

      fullAmount += parseFloat(total.toFixed(2));

      const now = new Date();

      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
          total: parseFloat(total.toFixed(2)),
          paymentMethod,
          isCouponUsed: !!coupon,
          coupon: coupon ? coupon : {},

          // ✅ INITIAL STATUS + HISTORY
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

      for (const item of sellerItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.id },
        });
        const newQuantity = product.quantity - item.quantity;

        await prisma.product.update({
          where: { id: item.id },
          data: {
            quantity: newQuantity < 0 ? 0 : newQuantity,
            inStock: newQuantity > 0,
          },
        });
      }

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
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        mode: "payment",
        success_url: `${origin}/loading?nextUrl=orders`,
        cancel_url: `${origin}/cart`,
        metadata: {
          orderIds: orderIds.join(","),
          userId,
          appId: "globalmart",
        },
      });

      return NextResponse.json({ session });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { cart: {} },
    });

    return NextResponse.json({ message: "Order Placed Successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
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
