import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/sendEmail"

export async function GET() {
    await sendEmail({
        to: "rajchaudharii1403@gmail.com",
        subject: "Nodemailer Test ✅",
        html: "<h2>Email is working 🎉</h2>"
    })

    return NextResponse.json({ message: "Test email sent" })
}
