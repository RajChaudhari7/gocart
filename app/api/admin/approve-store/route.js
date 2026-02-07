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
            to: store.user.email,
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
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>🎉 Congratulations!</h2>
        <p>Your store <strong>${store.name}</strong> has been approved.</p>
        <p>You can now start selling your products on our platform.</p>
        <br />
        <p>Best wishes,</p>
        <p><strong>Admin Team</strong></p>
    </div>
`

const REJECT_EMAIL = (store) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Store Application Update</h2>
        <p>Unfortunately, your store <strong>${store.name}</strong> was not approved.</p>
        <p>You may contact support for further clarification.</p>
        <br />
        <p>Regards,</p>
        <p><strong>Admin Team</strong></p>
    </div>
`
