import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request) {
  try {
    const { userId, has } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, addressId, couponCode, paymentMethod } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0 || !addressId || !paymentMethod) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Fetch and validate coupon
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 400 });
      if (coupon.expiresAt < new Date()) return NextResponse.json({ error: "Coupon expired" }, { status: 400 });

      // Check user eligibility
      if (coupon.forNewUser) {
        const userOrders = await prisma.order.count({ where: { userId } });
        if (userOrders > 0) return NextResponse.json({ error: "Coupon valid for new users only" }, { status: 400 });
      }
      const isPrimeMember = has({ plan: "prime" });
      if (coupon.forMember && !isPrimeMember) return NextResponse.json({ error: "Coupon valid for prime members only" }, { status: 400 });
    }

    const isPrimeMember = has({ plan: "prime" });

    // Group items by store
    const ordersByStore = new Map();
    for (const item of items) {
      if (!item.id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: `Invalid item or quantity: ${item.id}` }, { status: 400 });
      }

      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 });
      if (item.quantity > product.quantity) {
        return NextResponse.json({ error: `Insufficient stock for product: ${product.name}` }, { status: 400 });
      }

      const storeId = product.storeId;
      if (!ordersByStore.has(storeId)) ordersByStore.set(storeId, []);
      ordersByStore.get(storeId).push({ ...item, price: product.price });
    }

    let orderIds: string[] = [];
    let fullAmount = 0;
    let isShippingFeeAdded = false;

    // Use a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      for (const [storeId, sellerItems] of ordersByStore.entries()) {
        let total = sellerItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        if (couponCode) total -= (total * coupon.discount) / 100;
        if (!isPrimeMember && !isShippingFeeAdded) {
          total += 50; // shipping fee
          isShippingFeeAdded = true;
        }

        fullAmount += parseFloat(total.toFixed(2));

        // Create order with items
        const order = await tx.order.create({
          data: {
            userId,
            storeId,
            addressId,
            total: parseFloat(total.toFixed(2)),
            paymentMethod,
            isCouponUsed: coupon ? true : false,
            coupon: coupon || {},
            orderItems: {
              create: sellerItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
              }))
            }
          }
        });

        orderIds.push(order.id);

        // Decrement product stock
        for (const item of sellerItems) {
          await tx.product.update({
            where: { id: item.id },
            data: { quantity: { decrement: item.quantity } }
          });
        }
      }

      // Clear user's cart for COD or other payments
      if (paymentMethod !== PaymentMethod.RAZORPAY) {
        await tx.user.update({ where: { id: userId }, data: { cart: {} } });
      }
    });

    // Validate amount
    if (fullAmount <= 0) {
      return NextResponse.json({ error: "Order total must be greater than 0" }, { status: 400 });
    }

    // Razorpay payment integration
    if (paymentMethod === PaymentMethod.RAZORPAY) {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return NextResponse.json({ error: "Razorpay keys are not configured" }, { status: 500 });
      }

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      const options = {
        amount: Math.round(fullAmount * 100), // in paise
        currency: "INR",
        receipt: `order_rcpt_${orderIds.join("_")}`,
        payment_capture: 1,
        notes: { orderIds: orderIds.join(","), userId }
      };

      const razorpayOrder = await razorpay.orders.create(options);
      return NextResponse.json({ razorpayOrder, orderIds });
    }

    return NextResponse.json({ message: "Order Placed Successfully", orderIds });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
