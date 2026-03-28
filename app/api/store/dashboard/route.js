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
      canceled: 0,
      returned: 0   // ✅ added
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
    const selectedYear =
      Number(searchParams.get("year")) || new Date().getFullYear();

    const selectedMonth = searchParams.get("month") !== null
      ? Number(searchParams.get("month"))
      : null

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

    const filteredOrders = orders.filter(order => {
      const istDate = new Date(
        new Date(order.createdAt).toLocaleString("en-US", {
          timeZone: "Asia/Kolkata"
        })
      )

      const orderYear = istDate.getFullYear()
      const orderMonth = istDate.getMonth()

      if (selectedMonth !== null) {
        return orderYear === selectedYear && orderMonth === selectedMonth
      }

      return orderYear === selectedYear
    })

    /* ---------- PRODUCTS ---------- */
    const products = await prisma.product.findMany({
      where: { storeId },
      select: { id: true, name: true, category: true, images: true }
    });

    /* ---------- RATINGS ---------- */
    const ratings = await prisma.rating.findMany({
      where: { productId: { in: products.map((p) => p.id) } },
      include: { user: true, product: true }
    });

    /* ---------- TOP PRODUCTS ---------- */
    const topProducts = products
      .map((p) => ({
        ...p,
        sold: orders.reduce((acc, order) => {
          const item = order.orderItems.find(
            (oi) => oi.productId === p.id && order.status !== "CANCELLED"
          );
          return acc + (item ? item.quantity : 0);
        }, 0)
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    /* ---------- CHART DATA ---------- */
    const months = getAll12Months(selectedYear);

    let returnedProducts = 0;
    let returnedAmount = 0;

    orders.forEach((order) => {
      const istDate = new Date(
        new Date(order.createdAt).toLocaleString("en-US", {
          timeZone: "Asia/Kolkata"
        })
      );

      let filteredReturnedProducts = 0;
      let filteredReturnedAmount = 0;

      filteredOrders.forEach((order) => {
        if (order.status === "RETURNED") {
          filteredReturnedProducts += order.orderItems.reduce(
            (acc, item) => acc + item.quantity,
            0
          );

          filteredReturnedAmount += order.total;
        }
      });

      const orderYear = istDate.getFullYear();
      const orderMonth = istDate.getMonth();

      const monthIndex = months.findIndex(
        (m) => m.month === orderMonth && m.year === orderYear
      );

      if (monthIndex !== -1) {

        if (order.status === "CANCELLED") {
          months[monthIndex].canceled += 1;
        }

        /* -------- RETURNS -------- */
        else if (order.status === "RETURNED") {
          months[monthIndex].returned += 1;

          returnedProducts += order.orderItems.reduce(
            (acc, i) => acc + i.quantity,
            0
          );

          returnedAmount += order.total;
        }

        else {
          months[monthIndex].earnings += order.total;
          months[monthIndex].orders += 1;
        }
      }
    });

    const earningsChart = months.map((m) => ({
      name: m.name,
      value: Math.round(m.earnings)
    }));

    const ordersChart = months.map((m) => ({
      name: m.name,
      value: m.orders
    }));

    const canceledChart = months.map((m) => ({
      name: m.name,
      value: m.canceled
    }));

    /* ✅ NEW RETURN GRAPH */
    const returnedChart = months.map((m) => ({
      name: m.name,
      value: m.returned
    }));

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { isActive: true }
    });

    /* ---------- TOTALS ---------- */

    const totalEarnings = filteredOrders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((acc, order) => acc + order.total, 0);

    /* ---------- RESPONSE ---------- */

    const dashboardData = {
      storeIsActive: store.isActive,
      ratings,
      totalOrders: filteredOrders.length,
      totalEarnings: Math.round(totalEarnings),
      totalProducts: products.length,

      earningsChart,
      ordersChart,
      canceledChart,

      returnedChart,      // ✅ added
      returnedProducts: filteredReturnedProducts,
      returnedAmount: filteredReturnedAmount,

      orders: filteredOrders,
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