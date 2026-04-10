import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { name, email, message } = await req.json();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"SheKart Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "New Contact Message",
            html: `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#0b1220; padding:40px; color:#e5e7eb;">
    
    <div style="max-width:600px; margin:auto; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:20px; overflow:hidden;">
      
      <!-- Header -->
      <div style="padding:24px 32px; background:linear-gradient(135deg,#06b6d4,#3b82f6); color:white;">
        <h2 style="margin:0; font-size:22px;">📩 New Contact Message</h2>
        <p style="margin:6px 0 0; font-size:13px; opacity:0.9;">
          SheKart Contact Form Submission
        </p>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;">
        
        <!-- Name -->
        <div style="margin-bottom:18px;">
          <p style="margin:0; font-size:12px; color:#9ca3af;">Full Name</p>
          <p style="margin:4px 0 0; font-size:16px; font-weight:600;">${name}</p>
        </div>

        <!-- Email -->
        <div style="margin-bottom:18px;">
          <p style="margin:0; font-size:12px; color:#9ca3af;">Email Address</p>
          <p style="margin:4px 0 0; font-size:16px; font-weight:600;">${email}</p>
        </div>

        <!-- Message -->
        <div style="margin-top:20px;">
          <p style="margin:0; font-size:12px; color:#9ca3af;">Message</p>
          <div style="margin-top:8px; padding:16px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); font-size:14px; line-height:1.6;">
            ${message}
          </div>
        </div>

        <a href="mailto:${email}" 
            style="display:inline-block;margin-top:20px;padding:12px 18px;
            background:#06b6d4;color:white;border-radius:10px;
            text-decoration:none;font-size:14px;">
            Reply to User
        </a>

      </div>

      <!-- Footer -->
      <div style="padding:18px 32px; font-size:12px; color:#9ca3af; text-align:center; border-top:1px solid rgba(255,255,255,0.08);">
        © ${new Date().getFullYear()} SheKart — Premium Support System
      </div>

    </div>

  </div>
`
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}