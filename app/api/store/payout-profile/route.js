import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {

        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },

                {
                    status: 401
                }
            );
        }

        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Seller store not found",
                },
                {
                    status: 401
                }
            );
        }

        const profile = await prisma.sellerPayoutProfile.findUnique({
            where: {
                storeId,
            },
        });

        return NextResponse.json(
            {
                success: true,
                profile,
            }
        );

    } catch (error) {
        console.error("Get seller payout profile error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch payout profile"
            },

            {
                status: 500
            }
        );
    }
}

export async function PUT(request) {
    try {

        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },

                {
                    status: 401
                }
            );
        }

        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Seller store not found",
                },

                {
                    status: 401
                }
            );
        }

        const body = await request.json();

        const { method, accountHolderName, accountNumber, ifsc, upiId } = body;

        if (!method || !["BANK", "UPI"].includes(method)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Valid payout method is required",
                },

                {
                    status: 400
                }
            );
        }

        if (!accountHolderName?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Accout holdername is required",
                },

                {
                    status: 400
                }
            );
        }

        if (method === "BANK") {
            if (!accountNumber?.trim()) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Account number is required",
                    },

                    {
                        status: 400
                    }
                );
            }

            if (!ifsc?.trim()) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "IFSC is required",
                    },

                    {
                        status: 400
                    }
                );
            }
        }

        if (method === "UPI") {
            if (!upiId?.trim()) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "UPI ID is rquired",
                    },

                    {
                        status: 400
                    }
                );
            }
        }

        const profile = await prisma.sellerPayoutProfile.upsert({
            where: {
                storeId,
            },

            update: {
                method,

                accountHolderName: accountHolderName.trim(),

                accountNumber: method === "BANK" ? accountNumber?.trim() || null : null,

                ifsc: method === "BANK" ? ifsc?.trim().toUpperCase() || null : null,

                upiId: method === "UPI" ? upiId?.trim().toLowerCase() || null : null,

                isVerified: false,
                isActive: true,
            },

            create: {
                storeId,
                method,

                accountHolderName: accountHolderName.trim(),

                accountNumber: method === "BANK" ? accountNumber?.trim() || null : null,

                ifsc: method === "BANK" ? ifsc?.trim().toUpperCase() || null : null,

                upiId: method === "UPI" ? upiId?.trim().toLowerCase() || null : null,

                isVerified: false,
                isActive: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Payout profile saved. Admin verification is required.",
            profile,
        });

    } catch (error) {
        console.error("Save seller payout profile error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to save payout profile",
            },

            {
                status: 500
            }
        );
    }
} 