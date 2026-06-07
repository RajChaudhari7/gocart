// /api/test-email/route.js
import { sendEmail } from "@/lib/sendEmail"
import { NextResponse } from "next/server"

export async function GET() {

    await sendEmail({
        to: "rj480036@gmail.com",
        subject: "Test Email",
        html: "<h1>Email Working</h1>"
    })

    return NextResponse.json({ success: true })
}