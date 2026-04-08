import prisma from "@/lib/prisma"
import { transporter } from "@/lib/mailer"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        await prisma.emailOtp.create({
            data: { email, otp }
        })

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify your Store Email",
            html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`
        })

        return NextResponse.json({ message: "OTP sent to email" })

    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}