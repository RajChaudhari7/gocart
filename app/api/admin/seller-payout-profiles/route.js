import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server";
export async function GET(request) {
    try {

        const { userId } = getAuth(request);

        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
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

        const { searchParams } = new URL(request.url);

        const status = searchParams.get("status") || "ALL";

        const search = searchParams.get("search")?.trim() || "";

        const where = {};

        if (status === "VERIFIED") {
            where.isVerified = true;
        }

        if (status === "PENDING") {
            where.isVerified = false;
        }

        if (status === "INACTIVE") {
            where.isActive = false;
        }

        if (search) {
            where.store = {
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

        const profiles = await prisma.sellerPayoutProfile.findMany({
            where,

            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        logo: true,
                        email: true,
                        contact: true,
                    },
                },
            },

            orderBy: {
                updatedAt: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            profiles,
        });

    } catch (error) {
        console.error("Admin seller payout profiles error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch seller payout profiles",
            },

            {
                status: 500
            }
        );
    }
}

export async function PATCH(request) {
    try {

        const { userId } = getAuth(request);

        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
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

        const body = await request.json();

        const { profileId, action } = body;

        if (!profileId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Profile ID is required",
                },

                {
                    status: 400
                }
            );
        }

        if (!["VERIFIED", "DISABLE", "ENABLE"].includes(
            action
        )) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid payout profile action",
                },

                {
                    status: 400
                }
            );
        }

        const profile = await prisma.sellerPayoutProfile.findUnique({
            where: {
                id: profileId,
            },
        });

        if (!profile) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Payout profile not found",
                },

                {
                    status: 404
                }
            );
        }

        let data = {};

        if (action === "VERIFY") {
            data = {
                isVerified: true,
                isActive: true,
            };
        }

        if (action === "DISABLE") {
            data = {
                isActive: false
            };
        }

        if (action === "ENABLE") {
            data = {
                isActive: true,
            };
        }

        const updatedProfile = await prisma.sellerPayoutProfile.update({
            where: {
                id: profileId,
            },

            data,

            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        logo: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: action === "VERIFY" ? "Seller payout verified successfully"
                : action === "DISABLE"
                    ? "Seller payout profile disabled"
                    : "Seller payout profile enabled",

            profile: updatedProfile,
        });

    } catch (error) {
        console.error("Update seller payout profile error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to update payout profile",
            },

            {
                status: 500
            }
        );

    }
}