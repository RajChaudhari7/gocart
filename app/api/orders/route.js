import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
// import Stripe from "stripe"; // Stripe commented out
import Razorpay from "razorpay";

// to create a new order
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

    let coupon = null;

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      });
      if (!coupon) {
        return NextResponse.json({ error: "Coupon not found" }, { status: 400 });
      }
    }

    if (couponCode && coupon.forNewUser) {
      const userOrders = await prisma.order.findMany({ where: { userId } });
      if (userOrders.length > 0) {
        return NextResponse.json({ error: "Coupon valid for new users only" }, { status: 400 });
      }
    }

    const isPrimeMember = has({ plan: "prime" });

    if (couponCode && coupon.forMember) {
      if (!isPrimeMember) {
        return NextResponse.json({ error: "Coupon valid for prime members only" }, { status: 400 });
      }
    }

    // group orders by storeId
    const ordersByStore = new Map();

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      const storeId = product.storeId;

      if (!ordersByStore.has(storeId)) ordersByStore.set(storeId, []);
      ordersByStore.get(storeId).push({ ...item, price: product.price });
    }

    let orderIds = [];
    let fullAmount = 0;
    let isShippingFeeAdded = false;

    // create separate orders per store
    for (const [storeId, sellerItems] of ordersByStore.entries()) {
      let total = sellerItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

      if (couponCode) total -= (total * coupon.discount) / 100;

      if (!isPrimeMember && !isShippingFeeAdded) {
        total += 50; // shipping fee
        isShippingFeeAdded = true;
      }

      fullAmount += parseFloat(total.toFixed(2));

      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
          total: parseFloat(total.toFixed(2)),
          paymentMethod,
          isCouponUsed: coupon ? true : false,
          coupon: coupon ? coupon : {},
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
    }

    const origin = request.headers.get("origin");

    /*
    // Stripe Payment - Commented Out
    if (paymentMethod === "STRIPE") {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: { name: "Order" },
              unit_amount: Math.round(fullAmount * 100)
            },
            quantity: 1
          }
        ],
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        mode: "payment",
        success_url: `${origin}/loading?nextUrl=orders`,
        cancel_url: `${origin}/cart`,
        metadata: { orderIds: orderIds.join(","), userId, appId: "globalmart" }
      });
      return NextResponse.json({ session });
    }
    */

    // Razorpay Payment
    if (paymentMethod === "RAZORPAY") {
      const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      const options = {
        amount: Math.round(fullAmount * 100), // in paise
        currency: "INR",
        receipt: `order_rcpt_${orderIds.join("_")}`,
        payment_capture: 1 // auto capture
      };

      const razorpayOrder = await razorpay.orders.create(options);

      return NextResponse.json({ razorpayOrder, orderIds });
    }

    // COD or other payment methods
    await prisma.user.update({ where: { id: userId }, data: { cart: {} } });

    return NextResponse.json({ message: "Order Placed Successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}
