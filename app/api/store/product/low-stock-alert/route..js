import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req) {
    try {
        const body = await req.json()

        const { productName, quantity, sellerEmail } = body

        // ✅ VALIDATION
        if (!productName || quantity === undefined || !sellerEmail) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        console.log("📩 Sending stock alert to:", sellerEmail)

        // ✅ TRANSPORTER (GMAIL FIXED)
        const transporter = nodemailer.createTransport({
            service: "gmail", // ✅ better than host/port for Gmail
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // ⚠️ MUST be App Password
            },
        })

        // ✅ VERIFY CONNECTION (IMPORTANT DEBUG)
        await transporter.verify()
        console.log("✅ SMTP connection successful")

        // ✅ EMAIL CONTENT (PREMIUM DESIGN)
        const isOutOfStock = quantity === 0

        const mailOptions = {
            from: `"🚨 Stock Alert" <${process.env.EMAIL_USER}>`,
            to: sellerEmail,
            subject: `${isOutOfStock ? "❌ Out of Stock" : "⚠️ Low Stock"} - ${productName}`,
            html: `
                <div style="font-family: Inter, Arial; background:#f9fafb; padding:30px;">
                    <div style="max-width:500px; margin:auto; background:white; padding:25px; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.05);">

                        <h2 style="margin:0; color:${isOutOfStock ? "#dc2626" : "#f59e0b"};">
                            ${isOutOfStock ? "❌ Out of Stock" : "⚠️ Low Stock Alert"}
                        </h2>

                        <p style="color:#374151; margin-top:10px;">
                            Your product stock requires attention.
                        </p>

                        <div style="margin-top:20px; padding:15px; background:#f3f4f6; border-radius:10px;">
                            <p><b>📦 Product:</b> ${productName}</p>
                            <p><b>📊 Current Stock:</b> ${quantity}</p>
                        </div>

                        <p style="margin-top:20px; font-size:15px;">
                            ${
                                isOutOfStock
                                    ? "This product is currently <b style='color:#dc2626;'>out of stock</b>."
                                    : "Stock is running low. Consider restocking soon."
                            }
                        </p>

                        <div style="margin-top:25px;">
                            <a href="#" 
                               style="display:inline-block; padding:10px 18px; background:#4f46e5; color:white; border-radius:8px; text-decoration:none; font-weight:600;">
                                Restock Now
                            </a>
                        </div>

                        <hr style="margin:25px 0;" />

                        <p style="font-size:12px; color:#9ca3af; text-align:center;">
                            This is an automated notification from your store system.
                        </p>

                    </div>
                </div>
            `
        }

        // ✅ SEND MAIL
        const info = await transporter.sendMail(mailOptions)

        console.log("✅ Email sent:", info.messageId)

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("❌ EMAIL ERROR:", error)

        return NextResponse.json(
            { error: error.message || "Email failed" },
            { status: 500 }
        )
    }
}