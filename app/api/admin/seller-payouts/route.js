
import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import {
    getOrCreateSellerFundAccount,
    razorpayRequest,
} from "@/lib/razorpayx";

const ACTIVE_PAYOUT_STATUSES = ["PENDING", "PROCESSING"];
const TERMINAL_PAYOUT_STATUSES = ["SUCCESS", "FAILED", "CANCELLED"];

const PAYOUT_STATUSES = [
    "ALL",
    "PENDING",
    "PROCESSING",
    "SUCCESS",
    "FAILED",
    "CANCELLED",
];

class ApiError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

function apiErrorResponse(error, fallbackMessage) {
    const status = error instanceof ApiError ? error.status : 500;

    if (status === 500) {
        console.error(fallbackMessage, error);
    }

    return NextResponse.json(
        {
            success: false,
            error: error.message || fallbackMessage,
        },
        { status }
    );
}

async function requireAdmin(request) {
    const { userId } = getAuth(request);

    if (!userId || !(await authAdmin(userId))) {
        throw new ApiError("Unauthorized", 401);
    }
}

function storeSearchFilter(search) {
    if (!search) return {};

    return {
        OR: [
            {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                username: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ],
    };
}

function roundToPaise(amount) {
    return Math.round(Number(amount) * 100);
}

function serializeStoreSelect() {
    return {
        id: true,
        name: true,
        username: true,
        logo: true,
        email: true,
        contact: true,
    };
}

// ---------------------------------------------------------
// GET: Payout history, available seller earnings and summary
// ---------------------------------------------------------

export async function GET(request) {
    try {
        await requireAdmin(request);

        const { searchParams } = new URL(request.url);
        const requestedStatus = searchParams.get("status") || "ALL";
        const search = searchParams.get("search")?.trim() || "";

        const status = requestedStatus.toUpperCase();

        if (!PAYOUT_STATUSES.includes(status)) {
            throw new ApiError("Invalid payout status filter", 400);
        }

        const payoutWhere = {
            recipientType: "SELLER",
            ...(status !== "ALL" ? { status } : {}),
            ...(search
                ? {
                    store: storeSearchFilter(search),
                }
                : {}),
        };

        const payouts = await prisma.payout.findMany({
            where: payoutWhere,
            include: {
                store: {
                    select: serializeStoreSelect(),
                },
                items: {
                    include: {
                        sellerEarning: {
                            select: {
                                id: true,
                                netAmount: true,
                                status: true,
                                createdAt: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 200,
        });

        const sellerEarnings = await prisma.sellerEarning.findMany({
            where: {
                status: "AVAILABLE",

                // An earning already attached to an active payout
                // cannot be included in another payout.
                payoutItems: {
                    none: {
                        payout: {
                            status: {
                                in: ACTIVE_PAYOUT_STATUSES,
                            },
                        },
                    },
                },

                ...(search
                    ? {
                        store: storeSearchFilter(search),
                    }
                    : {}),
            },
            include: {
                store: {
                    select: serializeStoreSelect(),
                },
                order: {
                    select: {
                        id: true,
                        total: true,
                        createdAt: true,
                        deliveredAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const payable = sellerEarnings.reduce(
            (sum, earning) => sum + Number(earning.netAmount || 0),
            0
        );

        const payableByStore = {};
        const sellerPayablesMap = {};

        for (const earning of sellerEarnings) {
            const storeId = earning.storeId;
            const amount = Number(earning.netAmount || 0);

            payableByStore[storeId] =
                (payableByStore[storeId] || 0) + amount;

            if (!sellerPayablesMap[storeId]) {
                sellerPayablesMap[storeId] = {
                    storeId,
                    store: earning.store,
                    amount: 0,
                    earningCount: 0,
                    lastEarningAt: earning.createdAt,
                };
            }

            sellerPayablesMap[storeId].amount += amount;
            sellerPayablesMap[storeId].earningCount += 1;

            if (
                new Date(earning.createdAt) >
                new Date(sellerPayablesMap[storeId].lastEarningAt)
            ) {
                sellerPayablesMap[storeId].lastEarningAt =
                    earning.createdAt;
            }
        }

        const sellerPayables = Object.values(sellerPayablesMap);

        const allPayouts = await prisma.payout.groupBy({
            by: ["status"],
            where: {
                recipientType: "SELLER",
            },
            _sum: {
                amount: true,
            },
            _count: {
                id: true,
            },
        });

        const summary = {
            payable,
            total: 0,
            pending: 0,
            processing: 0,
            success: 0,
            failed: 0,
            cancelled: 0,
            totalCount: 0,
            pendingCount: 0,
            processingCount: 0,
            successCount: 0,
            failedCount: 0,
            cancelledCount: 0,
        };

        for (const item of allPayouts) {
            const amount = Number(item._sum.amount || 0);
            const count = Number(item._count.id || 0);

            summary.total += amount;
            summary.totalCount += count;

            if (item.status === "PENDING") {
                summary.pending += amount;
                summary.pendingCount += count;
            } else if (item.status === "PROCESSING") {
                summary.processing += amount;
                summary.processingCount += count;
            } else if (item.status === "SUCCESS") {
                summary.success += amount;
                summary.successCount += count;
            } else if (item.status === "FAILED") {
                summary.failed += amount;
                summary.failedCount += count;
            } else if (item.status === "CANCELLED") {
                summary.cancelled += amount;
                summary.cancelledCount += count;
            }
        }

        return NextResponse.json({
            success: true,
            payouts,
            sellerPayables,
            sellerEarnings,
            payableByStore,
            summary,
        });
    } catch (error) {
        return apiErrorResponse(error, "Failed to fetch seller payouts");
    }
}

// ---------------------------------------------------------
// POST: Create or safely resume a RazorpayX seller payout
// ---------------------------------------------------------

export async function POST(request) {
    let payoutId = null;

    try {
        await requireAdmin(request);

        let body;

        try {
            body = await request.json();
        } catch {
            throw new ApiError("Invalid JSON request body", 400);
        }

        const { storeId, provider = "RAZORPAYX" } = body || {};

        if (!storeId || typeof storeId !== "string") {
            throw new ApiError("A valid store ID is required", 400);
        }

        if (provider !== "RAZORPAYX") {
            throw new ApiError(
                "Use the separate manual payout workflow for offline payments",
                400
            );
        }

        if (!process.env.RAZORPAYX_ACCOUNT_NUMBER) {
            throw new ApiError(
                "RAZORPAYX_ACCOUNT_NUMBER is not configured",
                500
            );
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: {
                payoutProfile: true,
            },
        });

        if (!store) {
            throw new ApiError("Store not found", 404);
        }

        const profile = store.payoutProfile;

        if (!profile || !profile.isActive || !profile.isVerified) {
            throw new ApiError(
                "Seller payout profile must be active and verified",
                400
            );
        }

        // If a payout is already in progress, never create a second one.
        let payout = await prisma.payout.findFirst({
            where: {
                recipientType: "SELLER",
                storeId,
                provider: "RAZORPAYX",
                status: {
                    in: ACTIVE_PAYOUT_STATUSES,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (payout?.providerPayoutId) {
            return NextResponse.json({
                success: true,
                message: "This seller already has an active RazorpayX payout",
                payout,
                alreadySubmitted: true,
            });
        }

        if (payout && !payout.idempotencyKey) {
            // Preserve the existing payout record and give it one stable key.
            payout = await prisma.payout.update({
                where: { id: payout.id },
                data: {
                    idempotencyKey: crypto.randomUUID(),
                },
            });
        }

        // If there is no unresolved payout, reserve available earnings
        // and create a payout record in one serializable transaction.
        if (!payout) {
            payout = await prisma.$transaction(
                async (tx) => {
                    const concurrentPayout = await tx.payout.findFirst({
                        where: {
                            recipientType: "SELLER",
                            storeId,
                            provider: "RAZORPAYX",
                            status: {
                                in: ACTIVE_PAYOUT_STATUSES,
                            },
                        },
                    });

                    if (concurrentPayout) {
                        throw new ApiError(
                            "A payout for this seller is already in progress. Refresh and check its status.",
                            409
                        );
                    }

                    const earnings = await tx.sellerEarning.findMany({
                        where: {
                            storeId,
                            status: "AVAILABLE",
                            payoutItems: {
                                none: {
                                    payout: {
                                        status: {
                                            in: ACTIVE_PAYOUT_STATUSES,
                                        },
                                    },
                                },
                            },
                        },
                        orderBy: {
                            createdAt: "asc",
                        },
                    });

                    if (!earnings.length) {
                        throw new ApiError(
                            "No available seller earnings to pay",
                            400
                        );
                    }

                    // Round each earning to paise before totaling it.
                    const earningAmounts = earnings.map((earning) => ({
                        earning,
                        amountPaise: roundToPaise(earning.netAmount || 0),
                    }));

                    const totalPaise = earningAmounts.reduce(
                        (sum, item) => sum + item.amountPaise,
                        0
                    );

                    if (
                        !Number.isSafeInteger(totalPaise) ||
                        totalPaise < 100
                    ) {
                        throw new ApiError(
                            "Eligible seller earnings must total at least ₹1",
                            400
                        );
                    }

                    const created = await tx.payout.create({
                        data: {
                            recipientType: "SELLER",
                            storeId,
                            amount: totalPaise / 100,
                            status: "PENDING",
                            provider: "RAZORPAYX",
                            idempotencyKey: crypto.randomUUID(),
                        },
                    });

                    await tx.payoutItem.createMany({
                        data: earningAmounts.map((item) => ({
                            payoutId: created.id,
                            sellerEarningId: item.earning.id,
                            amount: item.amountPaise / 100,
                        })),
                    });

                    return created;
                },
                {
                    isolationLevel: "Serializable",
                }
            );
        }

        payoutId = payout.id;

        // A pending payout without a provider ID may mean that a previous
        // request timed out. Retry it only with its original idempotency key.
        if (!payout.idempotencyKey) {
            throw new Error(
                "Payout is missing its idempotency key; manual reconciliation is required"
            );
        }

        const fundAccountId = await getOrCreateSellerFundAccount(
            store,
            profile
        );

        const amountPaise = roundToPaise(payout.amount);

        if (
            !Number.isSafeInteger(amountPaise) ||
            amountPaise < 100
        ) {
            throw new ApiError("Payout amount is invalid", 400);
        }

        const mode = profile.method === "UPI" ? "UPI" : "IMPS";

        let providerPayout;

        try {
            providerPayout = await razorpayRequest("/payouts", {
                method: "POST",
                idempotencyKey: payout.idempotencyKey,
                body: {
                    account_number:
                        process.env.RAZORPAYX_ACCOUNT_NUMBER,
                    fund_account_id: fundAccountId,
                    amount: amountPaise,
                    currency: "INR",
                    mode,
                    purpose: "payout",
                    queue_if_low_balance: true,
                    reference_id: payout.id.slice(0, 40),
                    narration: "Seller payout",
                },
            });
        } catch (error) {
            // A definite provider-side 4xx rejection is recorded as failed,
            // except for timeout/conflict/rate-limit cases that may need
            // reconciliation or a safe retry using the same key.
            const providerStatus = Number(error.providerStatus);

            const definiteRejection =
                error.providerRejected &&
                providerStatus >= 400 &&
                providerStatus < 500 &&
                ![408, 409, 429].includes(providerStatus);

            if (definiteRejection) {
                await prisma.payout.updateMany({
                    where: {
                        id: payout.id,
                        status: {
                            in: ACTIVE_PAYOUT_STATUSES,
                        },
                    },
                    data: {
                        status: "FAILED",
                        failureReason:
                            error.message || "RazorpayX rejected the payout",
                        processedAt: new Date(),
                    },
                });

                throw new ApiError(
                    error.message || "RazorpayX rejected the payout",
                    502
                );
            }

            // Keep the payout record and its idempotency key intact.
            // The next attempt must resume this same logical payout.
            console.error("RazorpayX outcome needs reconciliation", {
                payoutId: payout.id,
                providerStatus: error.providerStatus || null,
                message: error.message,
            });

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "The payout outcome is not confirmed. Check payout status before retrying.",
                    outcomeUnknown: true,
                    payoutId: payout.id,
                },
                { status: 202 }
            );
        }

        if (!providerPayout?.id) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "RazorpayX did not return a payout ID. Reconciliation is required.",
                    outcomeUnknown: true,
                    payoutId: payout.id,
                },
                { status: 202 }
            );
        }

        const providerStatus = String(
            providerPayout.status || ""
        ).toLowerCase();

        const confirmedFailure = [
            "failed",
            "rejected",
        ].includes(providerStatus);

        // Do not mark earnings PAID here. The verified webhook is the
        // authoritative confirmation path for successful payouts.
        const updatedPayout = await prisma.$transaction(async (tx) => {
            const current = await tx.payout.findUnique({
                where: {
                    id: payout.id,
                },
            });

            if (!current) {
                throw new Error("Payout record not found");
            }

            // A webhook may have arrived before this API response was saved.
            if (TERMINAL_PAYOUT_STATUSES.includes(current.status)) {
                return current;
            }

            return tx.payout.update({
                where: {
                    id: current.id,
                },
                data: {
                    provider: "RAZORPAYX",
                    providerPayoutId: providerPayout.id,
                    status: confirmedFailure ? "FAILED" : "PROCESSING",
                    failureReason: confirmedFailure
                        ? providerPayout.failure_reason ||
                        `RazorpayX status: ${providerStatus}`
                        : null,
                    processedAt: confirmedFailure ? new Date() : null,
                },
            });
        });

        return NextResponse.json({
            success: true,
            message: confirmedFailure
                ? "RazorpayX reported that the payout failed"
                : "Payout submitted; awaiting provider confirmation",
            payout: updatedPayout,
            providerStatus,
        });
    } catch (error) {
        const response = apiErrorResponse(
            error,
            "Failed to submit RazorpayX payout"
        );

        // Return the payout ID when available so the admin can reconcile it.
        if (payoutId) {
            const responseBody = {
                success: false,
                error: error.message || "Failed to submit payout",
                payoutId,
                outcomeUnknown: Boolean(error.outcomeUnknown),
            };

            return NextResponse.json(responseBody, {
                status:
                    error instanceof ApiError
                        ? error.status
                        : 500,
            });
        }

        return response;
    }
}

// ---------------------------------------------------------
// PATCH: Mark a manually transferred seller payout as paid
// ---------------------------------------------------------

export async function PATCH(request) {
    try {
        await requireAdmin(request);

        let body;

        try {
            body = await request.json();
        } catch {
            throw new ApiError("Invalid JSON request body", 400);
        }

        const { payoutId, action, transactionId } = body || {};

        if (!payoutId || typeof payoutId !== "string") {
            throw new ApiError("Payout ID is required", 400);
        }

        if (action !== "MARK_PAID") {
            throw new ApiError("Invalid payout action", 400);
        }

        if (
            typeof transactionId !== "string" ||
            !transactionId.trim()
        ) {
            throw new ApiError("UTR/transaction ID is required", 400);
        }

        const result = await prisma.$transaction(
            async (tx) => {
                const payout = await tx.payout.findUnique({
                    where: {
                        id: payoutId,
                    },
                    include: {
                        items: {
                            include: {
                                sellerEarning: true,
                            },
                        },
                        store: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                            },
                        },
                    },
                });

                if (!payout) {
                    throw new ApiError("Payout not found", 404);
                }

                if (payout.recipientType !== "SELLER") {
                    throw new ApiError(
                        "This payout does not belong to a seller",
                        400
                    );
                }

                if (payout.provider === "RAZORPAYX") {
                    throw new ApiError(
                        "RazorpayX payouts can only be completed through provider confirmation",
                        400
                    );
                }

                if (payout.status === "SUCCESS") {
                    throw new ApiError(
                        "This payout has already been marked as paid",
                        409
                    );
                }

                if (payout.status !== "PENDING") {
                    throw new ApiError(
                        `Cannot mark payout as paid from ${payout.status} status`,
                        400
                    );
                }

                if (!payout.items.length) {
                    throw new ApiError(
                        "Payout has no earning items",
                        400
                    );
                }

                for (const item of payout.items) {
                    if (item.sellerEarning.status !== "AVAILABLE") {
                        throw new ApiError(
                            `Seller earning ${item.sellerEarningId} is no longer available`,
                            409
                        );
                    }
                }

                const earningIds = payout.items.map(
                    (item) => item.sellerEarningId
                );

                // Conditional update protects against earnings being claimed
                // by another transaction before this manual confirmation.
                const earningUpdate = await tx.sellerEarning.updateMany({
                    where: {
                        id: {
                            in: earningIds,
                        },
                        status: "AVAILABLE",
                    },
                    data: {
                        status: "PAID",
                    },
                });

                if (earningUpdate.count !== earningIds.length) {
                    throw new ApiError(
                        "One or more seller earnings are no longer available",
                        409
                    );
                }

                return tx.payout.update({
                    where: {
                        id: payout.id,
                    },
                    data: {
                        status: "SUCCESS",
                        provider: "MANUAL",
                        providerPayoutId: transactionId.trim(),
                        processedAt: new Date(),
                    },
                    include: {
                        store: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                            },
                        },
                    },
                });
            },
            {
                isolationLevel: "Serializable",
            }
        );

        return NextResponse.json({
            success: true,
            message: "Manual seller payout marked as paid successfully",
            payout: result,
        });
    } catch (error) {
        return apiErrorResponse(
            error,
            "Failed to mark seller payout as paid"
        );
    }
}
