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
            from: `"GlobalMart" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify Your GlobalMart Store Email",
            html: `
    <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
            <tr>
                <td align="center">
                    
                    <!-- Main Card -->
                    <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.05);overflow:hidden;">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background:linear-gradient(90deg,#4f46e5,#6366f1);padding:20px;text-align:center;">
                                <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">
                                    GlobalMart
                                </h1>
                                <p style="color:#e0e7ff;margin:5px 0 0;font-size:13px;">
                                    Launch Your Store 🚀
                                </p>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding:30px 25px;text-align:center;">
                                
                                <h2 style="margin:0 0 10px;color:#111827;">
                                    Verify Your Email
                                </h2>

                                <p style="color:#6b7280;font-size:14px;line-height:1.6;margin-bottom:25px;">
                                    Use the OTP below to verify your email and continue setting up your store on GlobalMart.
                                </p>

                                <!-- OTP Box -->
                                <div style="
                                    display:inline-block;
                                    background:#f1f5f9;
                                    padding:15px 25px;
                                    border-radius:10px;
                                    font-size:28px;
                                    font-weight:bold;
                                    letter-spacing:6px;
                                    color:#4f46e5;
                                    margin-bottom:20px;
                                ">
                                    ${otp}
                                </div>

                                <p style="color:#9ca3af;font-size:12px;margin-top:10px;">
                                    This OTP is valid for <strong>5 minutes</strong>.
                                </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding:20px;text-align:center;background:#f9fafb;">
                                <p style="font-size:12px;color:#9ca3af;margin:0;">
                                    Didn’t request this? You can safely ignore this email.
                                </p>
                                <p style="font-size:12px;color:#9ca3af;margin:5px 0 0;">
                                    © ${new Date().getFullYear()} GlobalMart. All rights reserved.
                                </p>
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>
    </div>
    `
        })

        return NextResponse.json({ message: "OTP sent to email" })

    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}