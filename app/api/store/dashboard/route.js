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
      returned: 0
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

    const selectedMonth =
      searchParams.get("month") !== null
        ? Number(searchParams.get("month"))
        : null;

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

    /* ---------- FILTERED ORDERS ---------- */
    const filteredOrders = orders.filter((order) => {
      const istDate = new Date(
        new Date(order.createdAt).toLocaleString("en-US", {
          timeZone: "Asia/Kolkata"
        })
      );

      const orderYear = istDate.getFullYear();
      const orderMonth = istDate.getMonth();

      if (selectedMonth !== null) {
        return orderYear === selectedYear && orderMonth === selectedMonth;
      }

      return orderYear === selectedYear;
    });

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

    /* ---------- STORE INFO (UPDATED) ---------- */
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        isActive: true,
        name: true,
        logo: true
      }
    });

    /* ---------- TOP PRODUCTS (ALL TIME) ---------- */
    const topProducts = products
      .map((p) => ({
        ...p,
        sold: orders.reduce((acc, order) => {
          const items = order.orderItems.filter(
            (oi) => oi.productId === p.id && order.status !== "CANCELLED"
          );
          return acc + items.reduce((sum, i) => sum + i.quantity, 0);
        }, 0)
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    /* ---------- CHART DATA ---------- */
    const months = getAll12Months(selectedYear);

    orders.forEach((order) => {
      const istDate = new Date(
        new Date(order.createdAt).toLocaleString("en-US", {
          timeZone: "Asia/Kolkata"
        })
      );

      const orderYear = istDate.getFullYear();
      const orderMonth = istDate.getMonth();

      const monthIndex = months.findIndex(
        (m) => m.month === orderMonth && m.year === orderYear
      );

      if (monthIndex !== -1) {
        if (order.status === "CANCELLED") {
          months[monthIndex].canceled += 1;
        } else if (order.status === "RETURNED") {
          months[monthIndex].returned += 1;
        } else {
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

    const returnedChart = months.map((m) => ({
      name: m.name,
      value: m.returned
    }));

    /* ---------- KPI CALCULATIONS ---------- */
    let returnedAmount = 0;
    let cancelledAmount = 0;
    let returnedProducts = 0;

    filteredOrders.forEach((order) => {
      if (order.status === "RETURNED") {
        returnedAmount += order.total;
        returnedProducts += order.orderItems.reduce(
          (acc, item) => acc + item.quantity,
          0
        );
      }

      if (order.status === "CANCELLED") {
        cancelledAmount += order.total;
      }
    });

    const totalEarnings = filteredOrders
      .filter((o) => o.status === "DELIVERED")
      .reduce((acc, o) => acc + o.total, 0);

    /* ---------- MONTHLY REPORT ---------- */
    const monthlyOrders = filteredOrders;

    const monthlyTopProducts = products
      .map((p) => ({
        ...p,
        sold: monthlyOrders.reduce((acc, order) => {
          if (order.status === "CANCELLED") return acc;

          const item = order.orderItems.find(
            (oi) => oi.productId === p.id
          );

          return acc + (item ? item.quantity : 0);
        }, 0)
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    const deliveredOrders = monthlyOrders.filter(
      (o) => o.status === "DELIVERED"
    ).length;

    /* ---------- DETAILS ---------- */
    const cancelledDetails = [];
    const returnedDetails = [];

    monthlyOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);

        if (order.status === "CANCELLED") {
          cancelledDetails.push({
            productName: product?.name || "Unknown",
            quantity: item.quantity,
            price: item.price
          });
        }

        if (order.status === "RETURNED") {
          returnedDetails.push({
            productName: product?.name || "Unknown",
            quantity: item.quantity,
            price: item.price
          });
        }
      });
    });

    /* ---------- RESPONSE ---------- */
    const dashboardData = {
      storeIsActive: store.isActive,
      storeName: store.name,
      storeLogo: store.logo,

      ratings,

      totalOrders: filteredOrders.length,
      totalEarnings: Math.round(totalEarnings),
      totalProducts: products.length,

      earningsChart,
      ordersChart,
      canceledChart,
      returnedChart,

      returnedProducts,
      returnedAmount,
      cancelledAmount,

      orders: filteredOrders,
      topProducts,

      monthlyReport: {
        topProducts: monthlyTopProducts,
        totalSales: Math.round(totalEarnings),
        deliveredOrders,
        cancelledOrders: cancelledDetails.length,
        cancelledAmount,
        returnedAmount,
        cancelledDetails,
        returnedDetails
      }
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