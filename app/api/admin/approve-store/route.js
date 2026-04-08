import prisma from "@/lib/prisma"
import { authAdmin } from "@/middlewares/authAdmin"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/sendEmail"

// ===============================
// POST → Approve / Reject Seller
// ===============================
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Not authorized" },
                { status: 401 }
            )
        }

        const { storeId, status } = await request.json()

        if (!storeId || !status) {
            return NextResponse.json(
                { error: "Missing storeId or status" },
                { status: 400 }
            )
        }

        // 🔍 Get store with user email
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: { user: true }
        })

        if (!store) {
            return NextResponse.json(
                { error: "Store not found" },
                { status: 404 }
            )
        }

        // 🔄 Update store status
        if (status === "approved") {
            await prisma.store.update({
                where: { id: storeId },
                data: {
                    status: "approved",
                    isActive: true
                }
            })
        }

        if (status === "rejected") {
            await prisma.store.update({
                where: { id: storeId },
                data: {
                    status: "rejected",
                    isActive: false
                }
            })
        }

        // 📧 Send Email to Store Owner
        await sendEmail({
            to: store.email,
            type:"store",
            subject:
                status === "approved"
                    ? "🎉 Your Store Has Been Approved"
                    : "❌ Your Store Application Was Rejected",
            html:
                status === "approved"
                    ? APPROVE_EMAIL(store)
                    : REJECT_EMAIL(store,"GST details mismatch")
        })

        return NextResponse.json({
            message: `Store ${status} successfully`
        })

    } catch (error) {
        console.error("Approve store error:", error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

// ===============================
// GET → Pending + Rejected Stores
// ===============================
export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Not authorized" },
                { status: 401 }
            )
        }

        const stores = await prisma.store.findMany({
            where: {
                status: { in: ["pending", "rejected"] }
            },
            include: {
                user: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return NextResponse.json({ stores })

    } catch (error) {
        console.error("Get stores error:", error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

// ===============================
// 📧 Email Templates
// ===============================
const APPROVE_EMAIL = (store) => `
<div style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr>
      <td align="center">

        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:26px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:0.5px;">
                GlobalMart
              </h1>
              <p style="color:#e0e7ff;margin-top:6px;font-size:13px;">
                Your Store is Live 🚀
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px;text-align:center;">

              <!-- Store Logo -->
              ${store.logo ? `
              <img src="${store.logo}" 
                   alt="Store Logo" 
                   style="width:72px;height:72px;border-radius:12px;object-fit:cover;margin-bottom:15px;border:1px solid #e5e7eb;" />
              ` : ""}

              <h2 style="color:#111827;margin-bottom:8px;">
                Hi ${store.user?.name || "Seller"} 👋
              </h2>

              <p style="color:#6b7280;font-size:14px;margin-bottom:20px;">
                Great news! Your store <strong>${store.name}</strong> has been successfully approved.
              </p>

              <!-- Info Box -->
              <div style="background:#f9fafb;border-radius:10px;padding:15px;text-align:left;margin-bottom:20px;">
                <p style="margin:4px 0;font-size:13px;color:#374151;">
                  <strong>Store Name:</strong> ${store.name}
                </p>
                <p style="margin:4px 0;font-size:13px;color:#374151;">
                  <strong>Category:</strong> ${store.category || "N/A"}
                </p>
                <p style="margin:4px 0;font-size:13px;color:#374151;">
                  <strong>Status:</strong> <span style="color:#16a34a;font-weight:600;">Approved</span>
                </p>
              </div>

              <!-- CTA -->
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/store"
                 style="display:inline-block;padding:14px 26px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">
                 Go to Dashboard
              </a>

              <p style="margin-top:18px;color:#9ca3af;font-size:12px;">
                Start adding products and grow your business with GlobalMart.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px;text-align:center;background:#f9fafb;">
              <p style="font-size:12px;color:#9ca3af;margin:0;">
                Need help? Contact our support team anytime.
              </p>
              <p style="font-size:12px;color:#9ca3af;margin-top:5px;">
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

const REJECT_EMAIL = (store, reason = "Incomplete or invalid details") => `
<div style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr>
      <td align="center">

        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:26px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">
                GlobalMart
              </h1>
              <p style="color:#fee2e2;margin-top:6px;font-size:13px;">
                Application Update
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px;text-align:center;">

              <h2 style="color:#111827;margin-bottom:10px;">
                Hi ${store.user?.name || "Seller"} 👋
              </h2>

              <p style="color:#6b7280;font-size:14px;margin-bottom:20px;">
                We reviewed your store <strong>${store.name}</strong>, but unfortunately it was not approved.
              </p>

              <!-- Reason Box -->
              <div style="background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:10px;padding:14px;margin-bottom:20px;text-align:left;">
                <strong>Reason:</strong><br/>
                ${reason}
              </div>

              <p style="color:#6b7280;font-size:14px;margin-bottom:20px;">
                You can update your details and reapply anytime.
              </p>

              <!-- CTA -->
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact"
                 style="display:inline-block;padding:14px 26px;background:#111827;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">
                 Contact Support
              </a>

              <p style="margin-top:18px;color:#9ca3af;font-size:12px;">
                We're here to help you succeed on GlobalMart 💙
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px;text-align:center;background:#f9fafb;">
              <p style="font-size:12px;color:#9ca3af;margin:0;">
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