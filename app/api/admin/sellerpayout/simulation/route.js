
import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const ALLOWED_OUTCOMES = [
    "SUCCESS",
    "PROCESSING",
    "FAILED",
    "REVERSED",
];

function errorResponse(message, status = 400) {
    return NextResponse.json(
        { success: false, error: message },
        { status }
    );
}

export async function POST(request) {
    try {
        // Keep simulation disabled unless explicitly enabled.
        if (process.env.ENABLE_PAYOUT_SIMULATION !== "true") {
            return errorResponse(
                "Payout simulation is disabled",
                404
            );
        }

        const { userId } = getAuth(request);

        if (!userId || !(await authAdmin(userId))) {
            return errorResponse("Unauthorized", 401);
        }

        let body;

        try {
            body = await request.json();
        } catch {
            return errorResponse("Invalid JSON request body");
        }

        const { storeId, outcome, requestId } = body || {};

        if (
            typeof storeId !== "string" ||
            !storeId.trim()
        ) {
            return errorResponse("A valid store ID is required");
        }

        if (!ALLOWED_OUTCOMES.includes(outcome)) {
            return errorResponse(
                "Outcome must be SUCCESS, PROCESSING, FAILED, or REVERSED"
            );
        }

        // The frontend should generate one UUID per simulation attempt
        // and reuse it if that same attempt must be retried.
        if (
            typeof requestId !== "string" ||
            !/^[a-zA-Z0-9_-]{8,100}$/.test(requestId)
        ) {
            return errorResponse("A valid simulation request ID is required");
        }

        const idempotencyKey = `TESTSIM-${requestId}`;

        // Idempotent retry: return the existing test record.
        const existing = await prisma.payout.findUnique({
            where: { idempotencyKey },
        });

        if (existing) {
            if (
                existing.provider !== "TEST_SIMULATION" ||
                existing.storeId !== storeId
            ) {
                return errorResponse(
                    "This request ID has already been used",
                    409
                );
            }

            return NextResponse.json({
                success: true,
                repeatedRequest: true,
                message: "Existing simulation record returned",
                payout: existing,
            });
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { id: true, name: true },
        });

        if (!store) {
            return errorResponse("Store not found", 404);
        }

        // Read available earnings for display/testing purposes only.
        // No earnings are reserved, updated, or marked as paid.
        const earnings = await prisma.sellerEarning.findMany({
            where: {
                storeId,
                status: "AVAILABLE",
                payoutItems: {
                    none: {
                        payout: {
                            status: {
                                in: ["PENDING", "PROCESSING"],
                            },
                        },
                    },
                },
            },
            select: {
                id: true,
                netAmount: true,
            },
        });

        const amountPaise = earnings.reduce((sum, earning) => {
            return sum + Math.round(
                Number(earning.netAmount || 0) * 100
            );
        }, 0);

        if (!Number.isSafeInteger(amountPaise) || amountPaise < 100) {
            return errorResponse(
                "Available seller earnings must total at least ₹1 for a simulation"
            );
        }

        // REVERSED is not part of the Prisma PayoutStatus enum.
        // Represent it as FAILED and explain the simulated outcome.
        const status = outcome === "REVERSED"
            ? "FAILED"
            : outcome;

        const note = outcome === "REVERSED"
            ? "TEST SIMULATION: simulated reversed payout; stored as FAILED because REVERSED is not a supported database status."
            : `TEST SIMULATION: simulated ${outcome} outcome. No real money was moved. Seller earnings were not changed.`;

        try {
            const payout = await prisma.payout.create({
                data: {
                    recipientType: "SELLER",
                    storeId,
                    amount: amountPaise / 100,
                    status,
                    provider: "TEST_SIMULATION",
                    idempotencyKey,
                    failureReason:
                        outcome === "FAILED" ||
                            outcome === "REVERSED"
                            ? note
                            : null,
                    processedAt:
                        status === "PROCESSING"
                            ? null
                            : new Date(),
                },
            });

            return NextResponse.json({
                success: true,
                message: `Test payout simulation created: ${outcome}`,
                simulatedOutcome: outcome,
                payout,
            }, { status: 201 });
        } catch (error) {
            // Protect against concurrent retries with the same unique key.
            if (error?.code === "P2002") {
                const duplicate = await prisma.payout.findUnique({
                    where: { idempotencyKey },
                });

                if (
                    duplicate?.provider === "TEST_SIMULATION" &&
                    duplicate.storeId === storeId
                ) {
                    return NextResponse.json({
                        success: true,
                        repeatedRequest: true,
                        message: "Existing simulation record returned",
                        payout: duplicate,
                    });
                }

                return errorResponse(
                    "This simulation request ID has already been used",
                    409
                );
            }

            throw error;
        }
    } catch (error) {
        console.error("Payout simulation error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to create payout simulation",
            },
            { status: 500 }
        );
    }
}
