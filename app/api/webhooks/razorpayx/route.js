
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpayWebhook } from "@/lib/razorpayx";

export const runtime = "nodejs";

const SUCCESS_EVENT = "payout.processed";
const REVERSED_EVENT = "payout.reversed";
const FAILURE_EVENTS = new Set([
    "payout.failed",
    "payout.rejected",
]);
const IN_PROGRESS_EVENTS = new Set([
    "payout.pending",
    "payout.queued",
    "payout.initiated",
    "payout.updated",
]);

export async function POST(request) {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const eventId = request.headers.get("x-razorpay-event-id");

    if (!signature || !verifyRazorpayWebhook(rawBody, signature)) {
        return NextResponse.json(
            { success: false, error: "Invalid webhook signature" },
            { status: 400 }
        );
    }

    let payload;

    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid JSON payload" },
            { status: 400 }
        );
    }

    const eventType = payload?.event;
    const entity = payload?.payload?.payout?.entity;

    if (!eventType || !entity?.id) {
        // A validly signed event that isn't a payout event.
        return NextResponse.json({ received: true });
    }

    const eventTime = Number(payload?.created_at || 0);
    const providerPayoutId = String(entity.id);
    const referenceId = entity.reference_id
        ? String(entity.reference_id)
        : null;

    const isSuccess = eventType === SUCCESS_EVENT;
    const isReversed = eventType === REVERSED_EVENT;
    const isFailure = FAILURE_EVENTS.has(eventType);
    const isInProgress = IN_PROGRESS_EVENTS.has(eventType);

    // Ignore unrelated payout events safely.
    if (!isSuccess && !isReversed && !isFailure && !isInProgress) {
        return NextResponse.json({ received: true });
    }

    try {
        await prisma.$transaction(
            async (tx) => {
                // Razorpay retries webhooks. A unique event ID makes
                // duplicate deliveries safe to acknowledge.
                if (eventId) {
                    await tx.razorpayWebhookEvent.create({
                        data: {
                            eventId,
                            eventType,
                            providerPayoutId,
                            providerEventAt: eventTime || null,
                        },
                    });
                }

                let payout = await tx.payout.findFirst({
                    where: {
                        provider: "RAZORPAYX",
                        providerPayoutId,
                    },
                    include: {
                        items: true,
                    },
                });

                // The API may not have saved providerPayoutId yet if the
                // webhook arrived before its HTTP response was persisted.
                if (!payout && referenceId) {
                    payout = await tx.payout.findFirst({
                        where: {
                            id: referenceId,
                            provider: "RAZORPAYX",
                        },
                        include: {
                            items: true,
                        },
                    });
                }

                if (!payout) {
                    // Throwing rolls back the event record so the provider
                    // can retry after the payout record is reconciled.
                    throw new Error(
                        `No local payout matches Razorpay payout ${providerPayoutId}`
                    );
                }

                // Ignore events older than the last event already applied.
                if (
                    eventTime &&
                    payout.providerEventAt &&
                    eventTime < payout.providerEventAt
                ) {
                    return;
                }

                // A payout can become FAILED after SUCCESS only when the
                // provider explicitly reports a reversal.
                if (
                    payout.status === "SUCCESS" &&
                    !isReversed
                ) {
                    return;
                }

                // Do not resurrect a failed/cancelled payout from a delayed
                // in-progress or processed event. Reconcile manually if the
                // provider's latest state contradicts this record.
                if (
                    ["FAILED", "CANCELLED"].includes(payout.status) &&
                    !isReversed
                ) {
                    return;
                }

                const updateData = {
                    provider: "RAZORPAYX",
                    providerPayoutId,
                    ...(eventTime
                        ? { providerEventAt: eventTime }
                        : {}),
                };

                if (isSuccess) {
                    updateData.status = "SUCCESS";
                    updateData.failureReason = null;
                    updateData.processedAt = new Date();

                    await tx.payout.update({
                        where: { id: payout.id },
                        data: updateData,
                    });

                    // Only AVAILABLE earnings can transition to PAID.
                    // Never overwrite ADJUSTED or other earning states.
                    const earningIds = payout.items.map(
                        (item) => item.sellerEarningId
                    );

                    if (earningIds.length) {
                        await tx.sellerEarning.updateMany({
                            where: {
                                id: { in: earningIds },
                                status: "AVAILABLE",
                            },
                            data: { status: "PAID" },
                        });
                    }

                    return;
                }

                if (isReversed || isFailure) {
                    updateData.status = "FAILED";
                    updateData.failureReason = isReversed
                        ? "RazorpayX reported that the payout was reversed"
                        : (
                            entity.failure_reason ||
                            entity.status_details?.description ||
                            entity.status_details?.reason ||
                            `RazorpayX event: ${eventType}`
                        );
                    updateData.processedAt = new Date();

                    await tx.payout.update({
                        where: { id: payout.id },
                        data: updateData,
                    });

                    // If money was previously marked paid, a confirmed
                    // failure/reversal releases only those PAID earnings.
                    // Preserve ADJUSTED and other states.
                    const earningIds = payout.items.map(
                        (item) => item.sellerEarningId
                    );

                    if (earningIds.length) {
                        await tx.sellerEarning.updateMany({
                            where: {
                                id: { in: earningIds },
                                status: "PAID",
                            },
                            data: { status: "AVAILABLE" },
                        });
                    }

                    return;
                }

                if (isInProgress) {
                    updateData.status = "PROCESSING";
                    updateData.failureReason = null;

                    await tx.payout.update({
                        where: { id: payout.id },
                        data: updateData,
                    });
                }
            },
            {
                isolationLevel: "Serializable",
            }
        );

        return NextResponse.json({ received: true });
    } catch (error) {
        // Duplicate event ID means Razorpay already delivered this event.
        if (error?.code === "P2002" && eventId) {
            return NextResponse.json({
                received: true,
                duplicate: true,
            });
        }

        console.error("RazorpayX webhook processing failed", {
            eventType,
            eventId: eventId || null,
            providerPayoutId,
            message: error?.message,
        });

        // Non-2xx lets Razorpay retry transient failures.
        return NextResponse.json(
            { received: false, error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
