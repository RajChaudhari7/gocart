import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import twilio from "twilio"

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)

export async function POST(req) {
    try {
        const { phone } = await req.json()

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        const expires = new Date(Date.now() + 5 * 60 * 1000)

        await prisma.whatsappOtp.create({
            data: {
                phone,
                otp,
                expiresAt: expires
            }
        })

        await client.messages.create({
            body: `Your GlobalMart verification code is ${otp}`,
            from: "+16812756313", // ✅ your Twilio number
            to: `+91${phone}`
        })

        return NextResponse.json({
            success: true,
            message: "OTP sent via SMS"
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
    }
}