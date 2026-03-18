import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req) {

  try {

    const { userId } = getAuth(req)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { orderId, products } = await req.json()

    if (!orderId || !products?.length) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    // ================= GET ORDER =================

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // ================= SECURITY CHECK =================

    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access to order" },
        { status: 403 }
      )
    }

    // ================= STATUS CHECK =================

    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "Only delivered orders can be returned" },
        { status: 400 }
      )
    }

    if (!order.deliveredAt) {
      return NextResponse.json(
        { error: "Delivery date missing" },
        { status: 400 }
      )
    }

    // ================= 7 DAY RETURN WINDOW =================

    const deliveredDate = new Date(order.deliveredAt)
    const now = new Date()

    const diffDays =
      (now - deliveredDate) / (1000 * 60 * 60 * 24)

    if (diffDays > 7) {
      return NextResponse.json(
        { error: "Return window expired (7 days)" },
        { status: 400 }
      )
    }

    // ================= GENERATE OTP =================

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const returnReq = await prisma.returnRequest.create({
      data: {
        orderId,
        userId,
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        items: {
          create: products.map(p => ({
            productId: p,
            quantity: 1
          }))
        }
      }
    })

    // ================= SEND EMAIL OTP =================

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      to: user.email,
      subject: "Return Verification OTP",
      text: `Your return OTP is ${otp}. It is valid for 10 minutes.`
    })

    return NextResponse.json({
      message: "OTP sent successfully",
      returnId: returnReq.id
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )

  }

}