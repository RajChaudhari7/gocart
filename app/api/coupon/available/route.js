import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId, has } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    // 🔹 Get all non-expired coupons
    const coupons = await prisma.coupon.findMany({
      where: {
        expiresAt: { gt: now },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const validCoupons = [];

    for (const coupon of coupons) {

      // 🔹 New User Filter
      if (coupon.forNewUser) {
        const orderCount = await prisma.order.count({
          where: { userId },
        });

        if (orderCount > 0) continue;
      }

      // 🔹 Prime Member Filter
      if (coupon.forMember) {
        const hasPrimePlan = has({ plan: "prime" });

        if (!hasPrimePlan) continue;
      }

      validCoupons.push(coupon);
    }

    return NextResponse.json({ coupons: validCoupons });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}