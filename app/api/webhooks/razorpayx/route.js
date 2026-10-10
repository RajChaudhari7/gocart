
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function validSignature(rawBody, signature) {
    const secret = process.env.RAZORPAYX_WEBHOOK_SECRET;

    if (!secret || !signature) return false;

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

        if (!payoutEntity?.id) {
            return NextResponse.json({ received: true });
        }

        const eventName = event.event;

        const isSuccess = eventName === "payout.processed";
        const isFailure = [
            "payout.failed",
            "payout.reversed",
            "payout.rejected",
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
            // reference_id is the internal payout ID we send to RazorpayX.
            let payout = await tx.payout.findFirst({
                where: {
                    provider: "RAZORPAYX",
                    OR: [
                        { providerPayoutId: payoutEntity.id },
                        ...(payoutEntity.reference_id
                            ? [{ id: payoutEntity.reference_id }]
                            : []),
                    ],
                },
                include: { items: true },
            });

            if (!payout) {
                // Acknowledge valid but currently unmatched events. Log and
                // reconcile them operationally rather than inventing a record.
                console.error("Unmatched RazorpayX payout webhook", {
                    providerPayoutId: payoutEntity.id,
                    referenceId: payoutEntity.reference_id,
                    eventName,
                });
                return;
            }

            // Never overwrite a terminal state due to delayed webhook delivery.
            if (["SUCCESS", "FAILED", "CANCELLED"].includes(payout.status)) {
                return;
            }

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
                        ? payoutEntity.failure_reason ||
                        payoutEntity.error?.description ||
                        `RazorpayX event: ${eventName}`
                        : null,
                    processedAt: isSuccess || isFailure ? new Date() : null,
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
            } else if (isFailure) {
                await tx.sellerEarning.updateMany({
                    where: {
                        id: { in: earningIds },
                        status: "PAID",
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
