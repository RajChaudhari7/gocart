import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req) {
    try {
        const { productName, quantity, storeEmail } = await req.json()

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })

        await transporter.sendMail({
            from: `"Stock Alert" <${process.env.EMAIL_USER}>`,
            to: storeEmail,
            subject: `⚠️ Low Stock Alert - ${productName}`,
            html: `
                <div style="font-family: Arial; padding:20px;">
                    <h2 style="color:#dc2626;">Stock Alert 🚨</h2>

                    <p><b>Product:</b> ${productName}</p>
                    <p><b>Current Stock:</b> ${quantity}</p>

                    ${quantity === 0
                    ? `<p style="color:red; font-weight:bold;">❌ Out of Stock</p>`
                    : `<p style="color:orange; font-weight:bold;">⚠️ Low Stock</p>`
                }

                    <p style="margin-top:15px;">
                        👉 Please <b>restock this product</b> immediately.
                    </p>

                    <hr/>
                    <p style="font-size:12px; color:gray;">
                        This is an automated notification from your store.
                    </p>
                </div>
            `
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Email failed" }, { status: 500 })
    }
}