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
            variantId: true,
            quantity: true,
            price: true,
            variant: {
              select: {
                id: true,
                size: true,
                color: true,
                weight: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                    category: true
                  }
                }
              }
            }
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
      include: {
        variants: true
      }
    });

    /* ---------- STORE ---------- */
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        isActive: true,
        name: true,
        logo: true
      }
    });

    /* ---------- TOP PRODUCTS ---------- */
    const productSales = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const product = item.variant.product;

        if (!productSales[product.id]) {
          productSales[product.id] = {
            ...product,
            sold: 0
          };
        }

        productSales[product.id].sold += item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
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

    /* ---------- KPI ---------- */
    let returnedProducts = 0;
    let returnedAmount = 0;
    let cancelledAmount = 0;

    filteredOrders.forEach((order) => {
      if (order.status === "RETURNED") {
        returnedProducts += order.orderItems.reduce(
          (acc, item) => acc + item.quantity,
          0
        );
        returnedAmount += order.total;
      }

      if (order.status === "CANCELLED") {
        cancelledAmount += order.total;
      }
    });

    const totalEarnings = filteredOrders
      .filter(
        (o) => o.status !== "CANCELLED" && o.status !== "RETURNED"
      )
      .reduce((acc, o) => acc + o.total, 0);

    /* ---------- MONTHLY DETAILS ---------- */
    const cancelledDetails = [];
    const returnedDetails = [];

    filteredOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productName = item.variant.product.name;

        if (order.status === "CANCELLED") {
          cancelledDetails.push({
            productName,
            quantity: item.quantity,
            price: item.price
          });
        }

        if (order.status === "RETURNED") {
          returnedDetails.push({
            productName,
            quantity: item.quantity,
            price: item.price
          });
        }
      });
    });

    /* ---------- RESPONSE ---------- */
    return NextResponse.json({
      dashboardData: {
        storeIsActive: store.isActive,
        storeName: store.name,
        storeLogo: store.logo,

        totalOrders: filteredOrders.length,
        totalEarnings: Math.round(totalEarnings),
        totalProducts: products.length,

        topProducts,

        returnedProducts,
        returnedAmount,
        cancelledAmount,

        monthlyReport: {
          totalSales: Math.round(totalEarnings),
          cancelledAmount,
          returnedAmount,
          cancelledDetails,
          returnedDetails
        }
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}