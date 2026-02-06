import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/sendEmail"
import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"

// ================= STATUS FLOW =================
const STATUS_FLOW = [
  "ORDER_PLACED",
  "PACKED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
]

// ================= UPDATE ORDER STATUS =================
export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const storeId = await authSeller(userId)

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    const { orderId, status } = await request.json()
    if (!orderId || !status) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // ================= FETCH ORDER =================
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        store: true,
        orderItems: {
          include: { product: true }
        }
      }
    })

    if (!order || order.storeId !== storeId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (["CANCELLED", "DELIVERED"].includes(order.status)) {
      return NextResponse.json(
        { error: "Finalized orders cannot be updated" },
        { status: 400 }
      )
    }

    const currentIndex = STATUS_FLOW.indexOf(order.status)
    const newIndex = STATUS_FLOW.indexOf(status)

    if (newIndex === -1 || newIndex <= currentIndex) {
      return NextResponse.json(
        { error: "Invalid status flow" },
        { status: 400 }
      )
    }

    // ================= DB TRANSACTION =================
    await prisma.$transaction(async (tx) => {

      // ✅ RESTOCK ON CANCEL (NOT REMOVED)
      if (status === "CANCELLED") {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: { increment: item.quantity },
              inStock: true
            }
          })
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          statusHistory: {
            ...(order.statusHistory || {}),
            [status]: new Date().toISOString()
          }
        }
      })
    })

    // ================= PDF INVOICE =================
    const invoicePath = path.join(
      process.cwd(),
      "tmp",
      `invoice-${orderId}.pdf`
    )

    fs.mkdirSync(path.dirname(invoicePath), { recursive: true })

    const doc = new PDFDocument({ margin: 40 })
    doc.pipe(fs.createWriteStream(invoicePath))

    doc.fontSize(20).text(order.store.name || "Store", { align: "left" })
    doc.fontSize(10).text("INVOICE", { align: "right" })

    doc.moveDown()
    doc.text(`Order ID: ${orderId}`)
    doc.text(`Status: ${status}`)
    doc.text(`Date: ${new Date().toLocaleDateString()}`)

    doc.moveDown()
    doc.text(`Billed To:`)
    doc.text(order.user?.name || "Customer")
    doc.text(order.user?.email)

    doc.moveDown().text("Order Items:")

    let total = 0
    order.orderItems.forEach((item) => {
      const lineTotal = item.price * item.quantity
      total += lineTotal
      doc.text(
        `${item.product?.name} | Qty: ${item.quantity} | ₹${lineTotal}`
      )
    })

    doc.moveDown()
    doc.fontSize(14).text(`Grand Total: ₹${total}`, { align: "right" })

    doc.end()

    // ================= EMAIL =================
    if (order.user?.email) {
      await sendEmail({
        to: order.user.email,
        subject: `Invoice – Order #${orderId}`,
        html: `
        <div style="font-family:Arial;padding:20px">
          <img src="${order.store.logo || ""}" height="50" />
          <h2>${order.store.name}</h2>
          <p>Your order status is <b>${status}</b></p>
          <p>Invoice attached as PDF.</p>
          <p>Thank you for shopping with us.</p>
        </div>
        `,
        attachments: [
          {
            filename: `invoice-${orderId}.pdf`,
            path: invoicePath
          }
        ]
      })
    }

    return NextResponse.json({
      message: "Order status updated & invoice sent"
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// ================= GET SELLER ORDERS =================
export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    const storeId = await authSeller(userId)

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { storeId },
      include: {
        user: true,
        address: true,
        store: true,
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const activeCount = await prisma.order.count({
      where: {
        storeId,
        NOT: { status: { in: ["DELIVERED", "CANCELLED"] } }
      }
    })

    return NextResponse.json({ orders, activeCount })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
