import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        const { email, otp } = await req.json()

        const record = await prisma.emailOtp.findFirst({
            where: { email, otp },
            orderBy: { createdAt: "desc" }
        })

        if (!record) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
        }

        await prisma.emailOtp.update({
            where: { id: record.id },
            data: { verified: true }
        })

        return NextResponse.json({ message: "Email verified" })

    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}