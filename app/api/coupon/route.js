import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// VERIFY COUPON
export async function POST(request) {
  try {
    const { userId, has } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    // 🔹 Find coupon by unique code
    const coupon = await prisma.coupon.findUnique({
      where: {
        code: code.toUpperCase(),
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    // 🔹 Expiry check
    if (coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      );
    }

    // 🔹 New User Check
    if (coupon.forNewUser) {
      const orderCount = await prisma.order.count({
        where: { userId },
      });

      if (orderCount > 0) {
        return NextResponse.json(
          { error: "Coupon valid for new users only" },
          { status: 400 }
        );
      }
    }

    // 🔹 Prime Member Check
    if (coupon.forMember) {
      const hasPrimePlan = has({ plan: "prime" });

      if (!hasPrimePlan) {
        return NextResponse.json(
          { error: "Coupon valid for prime members only" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ coupon });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}