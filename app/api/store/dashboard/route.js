import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/* ------------------ HELPERS ------------------ */
const getLast6Months = () => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      name: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear(),
      month: date.getMonth(),
      earnings: 0,
      orders: 0
    });
  }
  return months;
};

/* ------------------ API ------------------ */
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

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
      select: { id: true, name: true, category: true, images: true, totalSold: true }
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
          const item = order.orderItems.find(oi => oi.productId === p.id && order.status !== "CANCELLED");
          return acc + (item ? item.quantity : 0);
        }, 0)
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);


    /* ---------- CHART DATA ---------- */
    const months = getLast6Months();

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthIndex = months.findIndex(
        m => m.month === date.getMonth() && m.year === date.getFullYear()
      );

      if (monthIndex !== -1) {
        if (order.status !== "CANCELLED") months[monthIndex].earnings += order.total;
        months[monthIndex].orders += 1;
      }
    });

    const earningsChart = months.map(m => ({ name: m.name, value: Math.round(m.earnings) }));
    const ordersChart = months.map(m => ({ name: m.name, value: m.orders }));

    /* ---------- RESPONSE ---------- */
    const dashboardData = {
      ratings,
      totalOrders: orders.length,
      totalEarnings: Math.round(
        orders
          .filter(order => order.status !== "CANCELLED")
          .reduce((acc, order) => acc + order.total, 0)
      ),
      totalProducts: products.length,
      earningsChart,
      ordersChart,
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
