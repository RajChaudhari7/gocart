import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/* ------------------ HELPERS ------------------ */
const getAll12Months = (year) => {
  const months = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date(year, i, 1);
    months.push({
      key: `${year}-${i}`,
      name: date.toLocaleString("default", { month: "short" }),
      year,
      month: i,
      earnings: 0,
      orders: 0,
      canceled: 0
    });
  }

  return months;
};

/* ------------------ API ------------------ */
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    const { searchParams } = new URL(request.url);
    const selectedYear = Number(searchParams.get("year")) || new Date().getFullYear();

    /* ---------- ORDERS ---------- */
    const orders = await prisma.order.findMany({
      where: { storeId },
      select: {
        id: true,
        total: true,
        createdAt: true,
        status: true,
        orderItems: {
          select: {
            productId: true,
            quantity: true,
            price: true
          }
        }
      }
    });

    /* ---------- PRODUCTS ---------- */
    const products = await prisma.product.findMany({
      where: { storeId },
      select: { id: true, name: true, category: true, images: true }
    });

    /* ---------- RATINGS ---------- */
    const ratings = await prisma.rating.findMany({
      where: { productId: { in: products.map(p => p.id) } },
      include: { user: true, product: true }
    });

    /* ---------- TOP PRODUCTS ---------- */
    const topProducts = products
      .map(p => ({
        ...p,
        sold: orders.reduce((acc, order) => {
          const item = order.orderItems.find(
            oi => oi.productId === p.id && order.status !== "CANCELLED"
          );
          return acc + (item ? item.quantity : 0);
        }, 0)
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    /* ---------- CHART DATA (12 MONTHS - IST SAFE) ---------- */
    const months = getAll12Months(selectedYear);

    orders.forEach(order => {
      // 🔥 FORCE IST TIMEZONE
      const istDate = new Date(
        new Date(order.createdAt).toLocaleString("en-US", {
          timeZone: "Asia/Kolkata"
        })
      );

      const orderYear = istDate.getFullYear();
      const orderMonth = istDate.getMonth();

      const monthIndex = months.findIndex(
        m => m.month === orderMonth && m.year === orderYear
      );

      if (monthIndex !== -1) {
        if (order.status === "CANCELLED") {
          months[monthIndex].canceled += 1;
        } else {
          months[monthIndex].earnings += order.total;
          months[monthIndex].orders += 1;
        }
      }
    });

    const earningsChart = months.map(m => ({
      name: m.name,
      value: Math.round(m.earnings)
    }));

    const ordersChart = months.map(m => ({
      name: m.name,
      value: m.orders
    }));

    const canceledChart = months.map(m => ({
      name: m.name,
      value: m.canceled
    }));

    /* ---------- TOTALS (IST SAFE) ---------- */
    const totalEarnings = orders
      .filter(order => order.status !== "CANCELLED")
      .reduce((acc, order) => acc + order.total, 0);

    /* ---------- RESPONSE ---------- */
    const dashboardData = {
      ratings,
      totalOrders: orders.length,
      totalEarnings: Math.round(totalEarnings),
      totalProducts: products.length,
      earningsChart,
      ordersChart,
      canceledChart,
      orders,
      topProducts
    };

    return NextResponse.json({ dashboardData });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
