import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PAYOUT_STATUSES = [
    "PENDING",
    "PROCESSING",
    "SUCCESS",
    "FAILED",
    "CANCELLED",
];

function errorResponse(message, status = 400) {
    return NextResponse.json({ success: false, message }, { status });
}

async function requireAdmin(request) {
    const { userId } = getAuth(request);

    if (!userId) return false;

    return Boolean(await authAdmin(userId));
}

export async function GET(request) {
    try {

        if (!(await requireAdmin(request))) {
            return errorResponse("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";
        const status = searchParams.get("status") || "ALL";

        if (status !== "ALL" && !PAYOUT_STATUSES.includes(status)) {
            return errorResponse("Invalid payout status");
        }

        const driverWhere = search ?
            {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search } },
                ],
            }


            : {};

        const [drivers, payouts, availableAggregate, pendingAggregate, paidAggregate] = await Promise.all([
            prisma.driver.findMany({
                where: driverWhere,
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    earnings: {
                        where: { status: "AVAILABLE" },
                        orderBy: { createdAt: "desc" },
                        select: {
                            id: true,
                            orderId: true,
                            amount: true,
                            type: true,
                            description: true,
                            createdAt: true,
                            status: true,
                        },
                    },
                },

                orderBy: { name: "asc" },
            }),

            prisma.payout.findMany({
                where: {
                    recipientType: "DRIVER",
                    ...(status !== "ALL" ? { status } : {}),
                    ...(search ? { driver: { is: driverWhere } } : {}),
                },
                include: {
                    driver: {
                        select: { id: true, name: true, phone: true },
                    },
                    items: {
                        include: {
                            driverEarning: {
                                select: { id: true, orderId: true, type: true },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 200,
            }),

            prisma.driverEarning.aggregate({
                where: { status: "AVAILABLE", driver: { is: driverWhere } },
                _sum: { amount: true },
                _count: { id: true },
            }),

            prisma.payout.aggregate({
                where: {
                    recipientType: "DRIVER",
                    status: { in: ["PENDING", "PROCESSING"] },
                    ...(search ? { driver: { is: driverWhere } } : {}),
                },
                _sum: { amount: true },
            }),

            prisma.payout.aggregate({
                where: {
                    recipientType: "DRIVER",
                    status: "SUCCESS",
                    ...(search ? { driver: { is: driverWhere } } : {}),
                },
                _sum: { amount: true },
            }),
        ]);

        const payables = drivers.map((driver) => ({
            ...driver,
            availableAmount: driver.earnings.reduce(
                (sum, earning) => sum + earning.amount,
                0
            ),

            availableCount: driver.earnings.length,
        }));

        return NextResponse.json({
            success: true,
            payables,
            payouts,
            summary: {
                availableAmount: availableAggregate._sum.amount ?? 0,
                availableCount: availableAggregate._count.id,
                inProgressAmount: pendingAggregate._sum.amount ?? 0,
                paidAmount: paidAggregate._sum.amount ?? 0,
            },
        });
    } catch (error) {
        console.error("GET driver payables error:", error);
        return errorResponse("Failed to load driver payables", 500);
    }
}

export async function POST(request) {
    try {

        if (!(await requireAdmin(request))) {
            return errorResponse("Unauthorized", 401);
        }

        const body = await request.json();
        const driverId = typeof body.driverId === "string" ? body.driverId.trim() : "";
        const transactionReference = typeof body.transactionReference === "string" ? body.transactionReference.trim() : "";
        const note = typeof body.note === "string" ? body.note.trim() : "";
        const earningIds = Array.isArray(body.earningIds) ? [...new Set(
            body.earningIds.filter(
                (id) => typeof id === "string" && id.trim()
            )
        )] : [];

        if (!driverId) return errorResponse("Driver is required");
        if (!transactionReference) {
            return errorResponse("Bank / UPI transaction reference is required");
        }

        if (transactionReference.length > 150) {
            return errorResponse("Transaction reference is too long");
        }
        if (note.length > 500) {
            return errorResponse("Note must be 500 character or fewer");
        }

        const payout = await prisma.$transaction(async (tx) => {
            const earnings = await tx.driverEarning.findMany({
                where: {
                    id: { in: earningIds },
                    driverId,
                    status: "AVAILABLE",
                },
                select: {
                    id: true,
                    amount: true,
                    orderId: true,
                    type: true,
                },
            });

            if (earnings.length !== earningIds.length) {
                throw new Error("SOme selected earnings are unavailable , already paid, or belong to another driver");
            }

            const amount = earnings.reduce(
                (sum, earning) => sum + earning.amount,
                0
            );

            if (!Number.isFinite(amount) || amount < 0) {
                throw new Error("The payout amount is invalid");
            }

            const created = await tx.payout.create({
                data: {
                    recipientType: "DRIVER",
                    driverId,
                    amount,
                    status: "SUCCESS",
                    provider: "MANUAL",
                    providerPayoutId: transactionReference,
                    failureReason: note || null,
                    processedAt: new Date(),
                    items: {
                        create: earnings.map((earning) => ({
                            driverEarningId: earning.id,
                            amount: earning.amount,
                        })),
                    },
                },
                include: {
                    driver: {
                        select: { id: true, name: true, phone: true },
                    },
                },
            });

            const updated = await tx.driverEarning.updateMany({
                where: {
                    id: { in: earningIds },
                    driverId,
                    status: "AVAILABLE",
                },
                data: { status: "PAID" },
            });

            if (updated.count !== earnings.length) {
                throw new Error("Earnings changed during payout recording. No changes were committed; refresh and try again ");
            }

            return created;
        },
            {
                isolationLevel: "Serializable"
            });

        return NextResponse.json(
            { success: true, payout, message: "Manual payout recorded" },
            { status: 201 }
        );

    } catch (error) {
        console.error("POST driver payables error:", error);
        if (error?.code === "P2034" || error?.code === "P2002") {
            return errorResponse("A concurrent payout update was detected. Refresh the page and try again", 409);
        }

        return errorResponse(
            error.message || "Failed to record driver payout", 400
        );
    }
}