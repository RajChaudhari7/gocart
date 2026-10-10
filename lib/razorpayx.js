
import "server-only";
import crypto from "node:crypto";

const BASE_URL = "https://api.razorpay.com/v1";

function getCredentials() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("RazorpayX API credentials are missing");
    }

    return { keyId, keySecret };
}

export async function razorpayRequest(
    path,
    { method = "GET", body, idempotencyKey } = {}
) {
    const { keyId, keySecret } = getCredentials();

    const headers = {
        Authorization:
            "Basic " +
            Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
        "Content-Type": "application/json",
    };

    if (idempotencyKey) {
        headers["X-Payout-Idempotency"] = idempotencyKey;
    }

    let response;

    try {
        response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            cache: "no-store",
        });
    } catch {
        const error = new Error(
            "RazorpayX network error; the request outcome may be unknown."
        );
        error.outcomeUnknown = true;
        throw error;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(
            data?.error?.description ||
            data?.error?.reason ||
            `RazorpayX request failed (${response.status})`
        );

        error.providerRejected = true;
        error.providerStatus = response.status;
        error.providerError = data?.error;
        throw error;
    }

    return data;
}

export async function getOrCreateSellerFundAccount(store, profile) {
    if (profile.providerFundAccountId) {
        return profile.providerFundAccountId;
    }

    if (!profile.isActive || !profile.isVerified) {
        throw new Error("Seller payout profile must be active and verified");
    }

    if (!profile.accountHolderName?.trim()) {
        throw new Error("Seller bank account holder name is required");
    }

    if (profile.method === "BANK") {
        if (!profile.accountNumber?.trim() || !profile.ifsc?.trim()) {
            throw new Error("Seller bank account number and IFSC are required");
        }
    } else if (profile.method === "UPI") {
        if (!profile.upiId?.trim()) {
            throw new Error("Seller UPI ID is required");
        }
    } else {
        throw new Error("Unsupported seller payout method");
    }

    const { default: prisma } = await import("@/lib/prisma");

    let contactId = profile.providerContactId;

    if (!contactId) {
        const phone = String(store.contact || "").replace(/\D/g, "");

        const contact = await razorpayRequest("/contacts", {
            method: "POST",
            body: {
                name: profile.accountHolderName.trim(),
                ...(store.email ? { email: store.email } : {}),
                ...(phone ? { contact: phone } : {}),
                type: "vendor",
                reference_id: `store_${store.id}`.slice(0, 40),
            },
        });

        if (!contact?.id) {
            throw new Error("RazorpayX did not return a contact ID");
        }

        contactId = contact.id;

        // Persist immediately so a later fund-account failure doesn't
        // force creation of another contact on the next attempt.
        await prisma.sellerPayoutProfile.update({
            where: { storeId: store.id },
            data: {
                provider: "RAZORPAYX",
                providerContactId: contactId,
            },
        });
    }

    const fundAccountBody = {
        contact_id: contactId,
        account_type: profile.method === "BANK" ? "bank_account" : "vpa",
        ...(profile.method === "BANK"
            ? {
                bank_account: {
                    name: profile.accountHolderName.trim(),
                    ifsc: profile.ifsc.trim().toUpperCase(),
                    account_number: profile.accountNumber.trim(),
                },
            }
            : {
                vpa: {
                    address: profile.upiId.trim(),
                },
            }),
    };

    const fundAccount = await razorpayRequest("/fund_accounts", {
        method: "POST",
        body: fundAccountBody,
    });

    if (!fundAccount?.id) {
        throw new Error("RazorpayX did not return a fund account ID");
    }

    await prisma.sellerPayoutProfile.update({
        where: { storeId: store.id },
        data: {
            provider: "RAZORPAYX",
            providerContactId: contactId,
            providerFundAccountId: fundAccount.id,
        },
    });

    return fundAccount.id;
}

export function verifyRazorpayWebhook(rawBody, signature) {
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
