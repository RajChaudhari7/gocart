import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { orderRateLimit, generalRateLimit } from "@/lib/ratelimit";
import { getRateLimitIdentifier } from "@/lib/getRateLimitIdentifier";
import { rateLimitResponse } from "@/lib/rateLimitResponse";

const generateNumericOrderId = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

export async function POST(request) {
  let checkoutKey = null;
  let authenticatedUserId = null;

  try {
    // AUTH

    const { userId, has } = getAuth(request);

    authenticatedUserId = userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // RATE LIMIT

    const identifier = getRateLimitIdentifier(request, userId);

    const rateLimit = await orderRateLimit.limit(`create:${identifier}`);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    // IDEMPOTENCY KEY

    const idempotencyKey = request.headers.get("idempotency-key");

    checkoutKey = idempotencyKey;

    if (!idempotencyKey) {
      return NextResponse.json(
        {
          error: "Missing checkout idempotency key",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Basic protection against someone sending
     * an absurdly large header value.
     */
    if (idempotencyKey.length > 200) {
      return NextResponse.json(
        {
          error: "Invalid checkout idempotency key",
        },
        {
          status: 400,
        },
      );
    }

    // REQUEST BODY

    const { items, addressId, paymentMethod } = await request.json();

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !addressId ||
      !paymentMethod
    ) {
      return NextResponse.json(
        {
          error: "All fields are required",
        },
        {
          status: 400,
        },
      );
    }

    // CHECK EXISTING CHECKOUT

    const existingCheckout = await prisma.checkoutRequest.findUnique({
      where: {
        idempotencyKey,
      },
    });

    if (existingCheckout) {
      // Someone must never reuse another user's key.

      if (existingCheckout.userId !== userId) {
        return NextResponse.json(
          {
            error: "Invalid checkout request",
          },
          {
            status: 403,
          },
        );
      }

      // ----------------------------------------------
      // ALREADY COMPLETED
      // ----------------------------------------------

      if (existingCheckout.status === "COMPLETED") {
        return NextResponse.json({
          success: true,

          message: "Order already placed successfully",

          orderIds: existingCheckout.orderIds,

          duplicate: true,
        });
      }

      // ----------------------------------------------
      // CURRENTLY PROCESSING
      // ----------------------------------------------

      if (existingCheckout.status === "PROCESSING") {
        return NextResponse.json(
          {
            error: "This checkout is already being processed.",

            code: "CHECKOUT_PROCESSING",
          },
          {
            status: 409,
          },
        );
      }

      // ----------------------------------------------
      // PREVIOUS ATTEMPT FAILED
      // ----------------------------------------------

      if (existingCheckout.status === "FAILED") {
        return NextResponse.json(
          {
            error: "The previous checkout attempt failed. Please try again.",

            code: "CHECKOUT_FAILED",
          },
          {
            status: 409,
          },
        );
      }
    }

    // CREATE CHECKOUT REQUEST

    try {
      await prisma.checkoutRequest.create({
        data: {
          userId,

          idempotencyKey,

          status: "PROCESSING",

          orderIds: [],
        },
      });
    } catch (error) {
      /*
       * Very important concurrency protection.
       *
       * Two identical requests could theoretically
       * reach this point at almost the same time.
       *
       * Because idempotencyKey is UNIQUE, only one
       * request can create the CheckoutRequest.
       */

      if (error?.code === "P2002") {
        const checkout = await prisma.checkoutRequest.findUnique({
          where: {
            idempotencyKey,
          },
        });

        if (
          checkout &&
          checkout.userId === userId &&
          checkout.status === "COMPLETED"
        ) {
          return NextResponse.json({
            success: true,

            message: "Order already placed successfully",

            orderIds: checkout.orderIds,

            duplicate: true,
          });
        }

        return NextResponse.json(
          {
            error: "This checkout is already being processed.",

            code: "CHECKOUT_PROCESSING",
          },
          {
            status: 409,
          },
        );
      }

      throw error;
    }

    // PRIME

    const isPrimeMember = has({
      plan: "prime",
    });

    // PLATFORM SETTINGS

    const settings = (await prisma.platformSettings.findFirst()) || {
      commissionPercent: 10,

      deliveryFee: 50,

      driverFee: 30,

      freeDeliveryAbove: 999999,
    };

    // ADDRESS VALIDATION

    /*
     * Important:
     *
     * Don't only check address.id later.
     * Make sure this address actually belongs
     * to the logged-in customer.
     */

    const address = await prisma.address.findFirst({
      where: {
        id: addressId,

        userId,
      },

      select: {
        id: true,

        latitude: true,

        longitude: true,
      },
    });

    if (!address) {
      throw new Error("Delivery address was not found.");
    }

    // ORDER IDS

    const orderIds = [];

    // TRANSACTION

    await prisma.$transaction(async (tx) => {
      const ordersByStore = new Map();

      // LOCK + VALIDATE + DECREMENT STOCK

      for (const item of items) {
        const requestedQuantity = Number(item.quantity);

        if (
          !item.id ||
          !Number.isInteger(requestedQuantity) ||
          requestedQuantity <= 0
        ) {
          throw new Error("Invalid product quantity.");
        }

        const products = await tx.$queryRaw`
          SELECT *
          FROM "Product"
          WHERE id = ${item.id}
          FOR UPDATE
        `;

        if (!products.length) {
          throw new Error("Product not found");
        }

        const product = products[0];

        // ----------------------------------------------
        // PRODUCT AVAILABILITY
        // ----------------------------------------------

        if (product.isArchived) {
          throw new Error(`${product.name} is no longer available.`);
        }

        if (product.quantity < requestedQuantity) {
          throw new Error(
            `Not enough stock for ${product.name}. Available: ${product.quantity}`,
          );
        }

        // ----------------------------------------------
        // GROUP BY STORE
        // ----------------------------------------------

        if (!ordersByStore.has(product.storeId)) {
          ordersByStore.set(product.storeId, []);
        }

        ordersByStore.get(product.storeId).push({
          id: product.id,

          quantity: requestedQuantity,

          price: Number(product.price),
        });

        // ----------------------------------------------
        // SAFE STOCK DECREMENT
        // ----------------------------------------------

        await tx.$executeRaw`
          UPDATE "Product"
          SET quantity =
            quantity - ${requestedQuantity}
          WHERE id = ${item.id}
        `;
      }

      // CREATE ONE ORDER PER STORE

      for (const [storeId, sellerItems] of ordersByStore.entries()) {
        // ----------------------------------------------
        // VERIFY STORE
        // ----------------------------------------------

        const store = await tx.store.findFirst({
          where: {
            id: storeId,

            isActive: true,

            status: "approved",
          },

          select: {
            id: true,
          },
        });

        if (!store) {
          throw new Error("One of the stores is currently unavailable.");
        }

        // ----------------------------------------------
        // PRODUCT TOTAL
        // ----------------------------------------------

        const productTotal = sellerItems.reduce(
          (sum, item) => sum + item.price * item.quantity,

          0,
        );

        // ----------------------------------------------
        // DELIVERY CHARGE
        // ----------------------------------------------

        let deliveryCharge = 0;

        if (!isPrimeMember && productTotal < settings.freeDeliveryAbove) {
          deliveryCharge = settings.deliveryFee;
        }

        // ----------------------------------------------
        // FINAL TOTAL
        // ----------------------------------------------

        const total = productTotal + deliveryCharge;

        const now = new Date();

        const numericOrderId = generateNumericOrderId();

        // ----------------------------------------------
        // CREATE ORDER
        // ----------------------------------------------

        const order = await tx.order.create({
          data: {
            id: numericOrderId,

            userId,

            storeId,

            addressId,

            deliveryLatitude: address.latitude,

            deliveryLongitude: address.longitude,

            total,

            commissionPercent: settings.commissionPercent,

            deliveryFee: deliveryCharge,

            driverFee: settings.driverFee,

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

      // MARK CHECKOUT COMPLETE

      /*
       * This is deliberately inside the SAME
       * transaction as order creation.
       *
       * That means:
       *
       * orders succeed + checkout COMPLETED
       *
       * OR
       *
       * everything rolls back.
       */

      await tx.checkoutRequest.update({
        where: {
          idempotencyKey,
        },

        data: {
          status: "COMPLETED",

          orderIds,
        },
      });
    });

    // SUCCESS

    return NextResponse.json({
      success: true,

      message: "Order Placed Successfully",

      orderIds,

      duplicate: false,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    // MARK CHECKOUT FAILED

    if (checkoutKey && authenticatedUserId) {
      try {
        await prisma.checkoutRequest.updateMany({
          where: {
            idempotencyKey: checkoutKey,

            userId: authenticatedUserId,
            status: "PROCESSING",
          },

          data: {
            status: "FAILED",
          },
        });
      } catch (checkoutError) {
        console.error("CHECKOUT FAILURE STATUS ERROR:", checkoutError);
      }
    }

    return NextResponse.json(
      {
        error: error?.message || "Something went wrong",
      },
      {
        status: 400,
      },
    );
  }
}

// ================= GET USER ORDERS =================
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // RATE LIMIT

    const identifier = getRateLimitIdentifier(request, userId);

    const rateLimit = await generalRateLimit.limit(`user-orders:${identifier}`);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,

        OR: [
          {
            paymentMethod: PaymentMethod.COD,
          },

          {
            AND: [
              {
                paymentMethod: PaymentMethod.STRIPE,
              },

              {
                isPaid: true,
              },
            ],
          },
        ],
      },

      include: {
        orderItems: {
          include: {
            product: true,
          },
        },

        address: true,

        driver: true,

        driverRating: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error("GET USER ORDERS ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load orders",
      },
      {
        status: 500,
      },
    );
  }
}
