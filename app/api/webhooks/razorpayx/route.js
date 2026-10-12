
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


function validSignature(rawBody, signature) {
    const secret = process.env.RAZORPAYX_WEBHOOK_SECRET;

    if (
        !secret ||
        !signature ||
        !/^[a-f0-9]{64}$/i.test(signature)
    ) {
        return false;
    }

    const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest();

    const received = Buffer.from(signature, "hex");

    return (
        received.length === expected.length &&
        crypto.timingSafeEqual(received, expected)
    );
}


export async function POST(request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        if (!validSignature(rawBody, signature)) {
            return NextResponse.json(
                { success: false, error: "Invalid webhook signature" },
                { status: 400 }
            );
        }

        const event = JSON.parse(rawBody);
        const payoutEntity = event?.payload?.payout?.entity;
        const eventName = event?.event;

        if (!payoutEntity?.id || !eventName) {
            return NextResponse.json({ received: true });
        }

        const isSuccess = eventName === "payout.processed";
        const isReversed = eventName === "payout.reversed";

        const isFailure = [
            "payout.failed",
            "payout.rejected",
            "payout.reversed",
        ].includes(eventName);

        const isInProgress = [
            "payout.pending",
            "payout.queued",
            "payout.initiated",
            "payout.updated",
        ].includes(eventName);

        if (!isSuccess && !isFailure && !isInProgress) {
            return NextResponse.json({ received: true });
        }

        await prisma.$transaction(async (tx) => {
            // Prefer the provider's unique payout ID.
            let payout = await tx.payout.findFirst({
                where: {
                    provider: "RAZORPAYX",
                    providerPayoutId: payoutEntity.id,
                },
                include: { items: true },
            });

            // Fall back to our internal payout ID.

            if (!payout && payoutEntity.reference_id) {
                payout = await tx.payout.findFirst({
                    where: {
                        provider: "RAZORPAYX",
                        id: payoutEntity.reference_id,
                    },
                    include: { items: true },
                });
            }


            if (!payout) {
                console.error("Unmatched RazorpayX payout webhook", {
                    providerPayoutId: payoutEntity.id,
                    referenceId: payoutEntity.reference_id ?? null,
                    eventName,
                });

                // Let the provider retry while we investigate the mismatch.
                throw new Error(
                    `Unmatched RazorpayX payout: ${payoutEntity.id}`
                );
            }


            const terminalStatuses = [
                "SUCCESS",
                "FAILED",
                "CANCELLED",
            ];

            if (terminalStatuses.includes(payout.status)) {
                console.warn("Ignoring webhook for terminal payout", {
                    internalPayoutId: payout.id,
                    providerPayoutId: payoutEntity.id,
                    currentStatus: payout.status,
                    eventName,
                });

                return;
            }


            // Do not let an old in-progress event undo a terminal state.
            if (
                payout.status === "SUCCESS" &&
                isInProgress
            ) {
                return;
            }

            const statusDetails = payoutEntity.status_details;

            const failureReason =
                statusDetails?.description ||
                statusDetails?.reason ||
                payoutEntity.failure_reason ||
                payoutEntity.error?.description ||
                `RazorpayX event: ${eventName}; status: ${payoutEntity.status || "unknown"
                }`;


            const nextStatus = isSuccess
                ? "SUCCESS"
                : isFailure
                    ? "FAILED"
                    : "PROCESSING";

            await tx.payout.update({
                where: { id: payout.id },
                data: {
                    providerPayoutId: payoutEntity.id,
                    status: nextStatus,
                    failureReason: isFailure
                        ? failureReason
                        : null,
                    processedAt:
                        isSuccess || isFailure
                            ? new Date()
                            : null,
                },
            });

            const earningIds = payout.items.map(
                (item) => item.sellerEarningId
            );

            if (isSuccess) {
                await tx.sellerEarning.updateMany({
                    where: {
                        id: { in: earningIds },
                        status: { not: "PAID" },
                    },
                    data: { status: "PAID" },
                });
            } else if (isReversed) {
                // The provider reports that the transfer was reversed.
                // Reconcile previously paid earnings so they can be paid again.
                await tx.sellerEarning.updateMany({
                    where: {
                        id: { in: earningIds },
                        status: "PAID",
                    },
                    data: { status: "AVAILABLE" },
                });
            } else if (isFailure) {
                await tx.sellerEarning.updateMany({
                    where: {
                        id: { in: earningIds },
                        status: { not: "PAID" },
                    },
                    data: { status: "AVAILABLE" },
                });
            }
        });

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("RazorpayX webhook error:", error);

        return NextResponse.json(
            { success: false, error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
