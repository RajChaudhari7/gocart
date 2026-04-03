import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req) {
    const { phone, otp } = await req.json()

    const record = await prisma.whatsappOtp.findFirst({
        where: { phone },
        orderBy: { createdAt: "desc" }
    })

    if (!record) {
        return NextResponse.json({ error: "OTP not found" }, { status: 400 })
    }

    if (record.otp !== otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    if (new Date() > record.expiresAt) {
        return NextResponse.json({ error: "OTP expired" }, { status: 400 })
    }

    await prisma.whatsappOtp.update({
        where: { id: record.id },
        data: { verified: true }
    })

    return NextResponse.json({ success: true })
}