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
                    : REJECT_EMAIL(store)
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
<div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">

        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(90deg,#22c55e,#16a34a);padding:22px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:22px;">GlobalMart</h1>
              <p style="color:#dcfce7;margin:6px 0 0;font-size:13px;">Store Approved ✅</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 25px;text-align:center;">
              
              <h2 style="color:#111827;margin-bottom:10px;">
                🎉 Congratulations, ${store.name}!
              </h2>

              <p style="color:#6b7280;font-size:14px;line-height:1.6;margin-bottom:20px;">
                Your store has been successfully approved. You can now start listing products and selling on GlobalMart.
              </p>

              <!-- CTA Button -->
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/store"
                 style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
                 Go to Dashboard
              </a>

              <p style="margin-top:20px;color:#9ca3af;font-size:12px;">
                Start uploading products and grow your business 🚀
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px;text-align:center;background:#f9fafb;">
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

const REJECT_EMAIL = (store) => `
<div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">

        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(90deg,#ef4444,#dc2626);padding:22px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:22px;">GlobalMart</h1>
              <p style="color:#fee2e2;margin:6px 0 0;font-size:13px;">Application Update</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 25px;text-align:center;">
              
              <h2 style="color:#111827;margin-bottom:10px;">
                Store Not Approved
              </h2>

              <p style="color:#6b7280;font-size:14px;line-height:1.6;margin-bottom:20px;">
                Unfortunately, your store <strong>${store.name}</strong> was not approved at this time.
              </p>

              <p style="color:#6b7280;font-size:14px;line-height:1.6;margin-bottom:20px;">
                This may be due to incomplete or incorrect information. You can update your details and reapply.
              </p>

              <!-- CTA -->
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact"
                 style="display:inline-block;padding:12px 24px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
                 Contact Support
              </a>

              <p style="margin-top:20px;color:#9ca3af;font-size:12px;">
                Need help? Our team is here for you.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px;text-align:center;background:#f9fafb;">
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