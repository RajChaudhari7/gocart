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
        commissionPercent: true,
        deliveryFee: true,
        driverFee: true,
        orderItems: {
          select: {
            productId: true,
            quantity: true,
            price: true
          }
        }
      }
    });

    /* ---------- FILTERED ORDERS (YEAR + MONTH) ---------- */
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

    const settings =
      await prisma.platformSettings.findFirst() || {
        commissionPercent: 10,
        deliveryFee: 50,
        driverFee: 30,
        freeDeliveryAbove: 999999
      };

    /* ---------- TOP PRODUCTS ---------- */
    const topProducts = products
      .map((p) => ({
        ...p,
        sold: orders.reduce((acc, order) => {
          const items = order.orderItems.filter(
            (oi) => oi.productId === p.id
          );

          return acc + items.reduce((sum, i) => sum + i.quantity, 0);
        }, 0)
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    /* ---------- CHART DATA (FULL YEAR) ---------- */
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
        } else {
          const productTotal = order.orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          const sellerAmount =
            productTotal * ((100 - currentCommission) / 100);

          months[monthIndex].earnings += sellerAmount;
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



    /* ---------- KPI CALCULATIONS (FILTERED) ---------- */

    let cancelledAmount = 0;

    filteredOrders.forEach((order) => {

      if (order.status === "CANCELLED") {
        cancelledAmount += order.total;
      }
    });

    // total earnings
    const totalEarnings = filteredOrders
      .filter(
        order =>
          order.status !== "CANCELLED"

      )
      .reduce((acc, order) => {

        const productTotal = order.orderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const sellerAmount =
          productTotal * ((100 - currentCommission) / 100);

        return acc + sellerAmount;

      }, 0);

    /* ---------- MONTHLY REPORT ---------- */

    // ONLY for selected month (IMPORTANT)
    const monthlyOrders = filteredOrders;

    /* ---------- TOP PRODUCTS (MONTH) ---------- */
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

    /* ---------- DELIVERED ORDERS ---------- */
    const deliveredOrders = monthlyOrders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    /* ---------- CANCELLED DETAILS ---------- */
    const cancelledOrdersDetails = [];

    monthlyOrders.forEach((order) => {
      if (order.status === "CANCELLED") {
        order.orderItems.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);

          cancelledOrdersDetails.push({
            productName: product?.name || "Unknown",
            quantity: item.quantity,
            price: item.price
          });
        });
      }
    });



    /* ---------- RESPONSE ---------- */
    const dashboardData = {
      settings,
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

      cancelledAmount,

      orders: filteredOrders,
      topProducts,
      monthlyReport: {
        topProducts: monthlyTopProducts,
        totalSales: Math.round(totalEarnings),
        deliveredOrders,
        cancelledOrders: cancelledOrdersDetails.length,
        cancelledAmount,
        cancelledDetails: cancelledOrdersDetails,
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