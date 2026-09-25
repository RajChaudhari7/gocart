import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/sendEmail"
import { generateOtp } from "@/lib/otp"
import { calculateDistance } from "@/lib/distance"
import { getAuth } from "@clerk/nextjs/server"

const SELLER_FLOW = [
    "ORDER_PLACED",
    "ORDER_CONFIRMED",
    "ORDER_PACKING",
    "ORDER_PACKED"
]

const SELLER_RESPONSE_TIME = 60 * 1000

const FINAL_STATUSES = [
    "CANCELLED",
    "DELIVERED",
    "RETURNED"
]

/* ====
   UPDATE SELLER ORDER STATUS
==== */

export async function POST(request) {

    try {

        const { userId } =
            getAuth(request)

        const storeId =
            await authSeller(userId)

        if (!storeId) {

            return NextResponse.json(
                {
                    error:
                        "Not authorized"
                },
                {
                    status: 401
                }
            )

        }

        const {
            orderId,
            status,
            reason
        } = await request.json()

        if (
            !orderId ||
            !status
        ) {

            return NextResponse.json(
                {
                    error:
                        "Invalid request"
                },
                {
                    status: 400
                }
            )

        }

        const order =
            await prisma.order.findUnique({

                where: {
                    id: orderId
                },

                include: {

                    orderItems: {
                        include: {
                            product: true
                        }
                    },

                    user: true,

                    store: true,

                    address: true

                }

            })

        if (
            !order ||
            order.storeId !== storeId
        ) {

            return NextResponse.json(
                {
                    error:
                        "Order not found"
                },
                {
                    status: 404
                }
            )

        }

        /* 
           FINALIZED ORDER PROTECTION
         */

        if (
            FINAL_STATUSES.includes(
                order.status
            )
        ) {

            return NextResponse.json(
                {
                    error:
                        "Order status cannot be changed once finalized"
                },
                {
                    status: 400
                }
            )

        }

        /* 
           SELLER ACCEPTANCE
         */

        if (
            status ===
            "ORDER_CONFIRMED"
        ) {

            /*
             * Seller can accept only from ORDER_PLACED.
             */

            if (
                order.status !==
                "ORDER_PLACED"
            ) {

                return NextResponse.json(
                    {
                        error:
                            "Order is no longer waiting for seller acceptance"
                    },
                    {
                        status: 400
                    }
                )

            }

            /*
             * Server-side 60 second deadline.
             *
             * This is important because frontend timers
             * cannot be trusted.
             */

            const deadline =
                new Date(
                    order.createdAt
                ).getTime() +
                SELLER_RESPONSE_TIME

            if (
                Date.now() >
                deadline
            ) {

                /*
                 * Automatically cancel the expired order
                 * and restore stock atomically.
                 */

                await prisma.$transaction(
                    async tx => {

                        const currentOrder =
                            await tx.order.findUnique({

                                where: {
                                    id: orderId
                                },

                                include: {
                                    orderItems: true
                                }

                            })

                        if (
                            !currentOrder ||
                            currentOrder.status !==
                            "ORDER_PLACED"
                        ) {
                            return
                        }

                        const updated =
                            await tx.order.updateMany({

                                where: {

                                    id:
                                        orderId,

                                    status:
                                        "ORDER_PLACED"

                                },

                                data: {

                                    status:
                                        "CANCELLED",

                                    statusHistory: {

                                        ...(currentOrder.statusHistory || {}),

                                        CANCELLED:
                                            new Date().toISOString()

                                    }

                                }

                            })

                        if (
                            updated.count !==
                            1
                        ) {
                            return
                        }

                        for (
                            const item
                            of currentOrder.orderItems
                        ) {

                            await tx.product.update({

                                where: {
                                    id:
                                        item.productId
                                },

                                data: {

                                    quantity: {
                                        increment:
                                            item.quantity
                                    },

                                    inStock:
                                        true

                                }

                            })

                        }

                    }
                )

                return NextResponse.json(
                    {
                        error:
                            "Seller acceptance time has expired. Order was cancelled."
                    },
                    {
                        status: 400
                    }
                )

            }

            /*
             * Accept order.
             */

            await prisma.order.update({

                where: {
                    id: orderId
                },

                data: {

                    status:
                        "ORDER_CONFIRMED",

                    statusHistory: {

                        ...(order.statusHistory || {}),

                        ORDER_CONFIRMED:
                            new Date().toISOString()

                    }

                }

            })

            return NextResponse.json(
                {
                    message:
                        "Order accepted successfully"
                }
            )

        }

        /* 
           SELLER DECLINE
         */

        if (
            status ===
            "CANCELLED" &&
            (
                reason ===
                "SELLER_DECLINED" ||
                reason ===
                "SELLER_RESPONSE_TIMEOUT"
            )
        ) {

            /*
             * Decline is only valid while the order
             * is waiting for seller acceptance.
             */

            if (
                order.status !==
                "ORDER_PLACED"
            ) {

                return NextResponse.json(
                    {
                        error:
                            "Order is no longer available for decline"
                    },
                    {
                        status: 400
                    }
                )

            }

            try {

                await prisma.$transaction(async (tx) => {
                    const currentOrder = await tx.order.findUnique({
                        where: {
                            id: orderId
                        },

                        include: {
                            orderItems: true
                        }
                    })

                    if (currentOrder) {
                        throw new Error(
                            "Order not found"
                        )
                    }

                    if (currentOrder.status !== "ORDER_PLACED") {
                        throw new Error(
                            "Order has already been processed"
                        )
                    }

                    await tx.order.update({
                        where: {
                            id: orderId
                        },

                        data: {
                            status: "CANCELLED",

                            statusHistory: {
                                ...(currentOrder.statusHistory || {}),

                                CANCELLED: new Date().toISOString()
                            }
                        }
                    })

                    for (const item of currentOrder.orderItems) {
                        await tx.product.update({
                            where: {
                                id: item.productId
                            },

                            data: {
                                quantity: {
                                    increment: item.quantity
                                },

                                inStock: true
                            }
                        })
                    }
                })

                return NextResponse.json(
                    {
                        message:
                            "Order declined successfully"
                    }
                )

            } catch (error) {
                console.error("Seller Decline Error:", error);

                return NextResponse.json({
                    error: error?.message || "Failed to decline order"
                },
                    { status: 400 }
                )
            }

        }

        /* 
           DELIVERY OTP
         */

        let plainOtp = null

        /* 
           NORMAL SELLER STATUS FLOW
         */

        const currentIndex =
            SELLER_FLOW.indexOf(
                order.status
            )

        const newIndex =
            SELLER_FLOW.indexOf(
                status
            )

        /*
         * ORDER_PACKED is handled separately because it
         * assigns a driver.
         */

        if (
            status !==
            "ORDER_PACKED" &&
            currentIndex !== -1 &&
            newIndex !== -1
        ) {

            if (
                newIndex !==
                currentIndex + 1
            ) {

                return NextResponse.json(
                    {
                        error:
                            "Invalid status flow"
                    },
                    {
                        status: 400
                    }
                )

            }

        }

        /*
         * Prevent seller from jumping into random statuses.
         */

        const allowedSellerStatuses = [
            "ORDER_PACKING",
            "ORDER_PACKED"
        ]

        if (
            allowedSellerStatuses.includes(
                status
            )
        ) {

            if (
                status ===
                "ORDER_PACKING" &&
                order.status !==
                "ORDER_CONFIRMED"
            ) {

                return NextResponse.json(
                    {
                        error:
                            "Order must be accepted before packing"
                    },
                    {
                        status: 400
                    }
                )

            }

            if (
                status ===
                "ORDER_PACKED" &&
                order.status !==
                "ORDER_PACKING"
            ) {

                return NextResponse.json(
                    {
                        error:
                            "Order must be in packing state before it can be packed"
                    },
                    {
                        status: 400
                    }
                )

            }

        }

        /* 
           DELIVERY INITIATED
         */

        if (
            status ===
            "DELIVERY_INITIATED"
        ) {

            plainOtp =
                generateOtp()

            await prisma.order.update({

                where: {
                    id:
                        orderId
                },

                data: {

                    deliveryOtp:
                        String(
                            plainOtp
                        ),

                    deliveryOtpExpiry:
                        new Date(
                            Date.now() +
                            10 *
                            60 *
                            1000
                        ),

                    otpVerified:
                        false,

                    otpVerifyAttempts:
                        0,

                    otpResendCount:
                        0

                }

            })

        }

        /* 
           DELIVERED VALIDATION
         */

        if (
            status ===
            "DELIVERED"
        ) {

            if (
                order.status !==
                "DELIVERY_INITIATED"
            ) {

                return NextResponse.json(
                    {
                        error:
                            "Order must be in DELIVERY_INITIATED state"
                    },
                    {
                        status: 400
                    }
                )

            }

            if (
                !order.deliveryOtp
            ) {

                return NextResponse.json(
                    {
                        error:
                            "Delivery OTP not generated"
                    },
                    {
                        status: 400
                    }
                )

            }

            if (
                !order.otpVerified
            ) {

                return NextResponse.json(
                    {
                        error:
                            "Delivery OTP not verified"
                    },
                    {
                        status: 400
                    }
                )

            }

        }

        /* 
           ORDER PACKED
           FIND NEAREST DRIVER
         */

        if (
            status ===
            "ORDER_PACKED"
        ) {

            if (
                !order.store?.latitude ||
                !order.store?.longitude
            ) {

                return NextResponse.json(
                    {
                        error:
                            "Store location not configured. Please update store location first."
                    },
                    {
                        status: 400
                    }
                )

            }

            const drivers =
                await prisma.driver.findMany({

                    where: {

                        isOnline:
                            true,

                        isActive:
                            true,

                        latitude: {
                            not:
                                null
                        },

                        longitude: {
                            not:
                                null
                        }

                    }

                })

            if (
                drivers.length ===
                0
            ) {

                return NextResponse.json(
                    {
                        error:
                            "No online drivers available"
                    },
                    {
                        status: 400
                    }
                )

            }

            let nearestDriver =
                null

            let shortestDistance =
                Infinity

            for (
                const driver
                of drivers
            ) {

                const distance =
                    calculateDistance(

                        order.store.latitude,

                        order.store.longitude,

                        driver.latitude,

                        driver.longitude

                    )

                if (
                    distance <
                    shortestDistance
                ) {

                    shortestDistance =
                        distance

                    nearestDriver =
                        driver

                }

            }

            if (
                !nearestDriver
            ) {

                return NextResponse.json(
                    {
                        error:
                            "No suitable driver found"
                    },
                    {
                        status: 400
                    }
                )

            }

            await prisma.order.update({

                where: {
                    id:
                        orderId
                },

                data: {

                    driverId:
                        nearestDriver.id,

                    driverAccepted:
                        false,

                    assignmentStatus:
                        "PENDING",

                    assignmentExpiresAt:
                        new Date(
                            Date.now() +
                            60 *
                            1000
                        ),

                    assignedAt:
                        new Date(),

                    status:
                        "ORDER_PACKED",

                    statusHistory: {

                        ...(order.statusHistory || {}),

                        ORDER_PACKED:
                            new Date().toISOString()

                    }

                }

            })

            return NextResponse.json(
                {
                    message:
                        "Order packed and driver assigned successfully"
                }
            )

        }

        /* 
           NORMAL STATUS UPDATE
         */

        if (
            [
                "ORDER_PACKING"
            ].includes(
                status
            )
        ) {

            await prisma.order.update({

                where: {
                    id:
                        orderId
                },

                data: {

                    status:
                        status,

                    statusHistory: {

                        ...(order.statusHistory || {}),

                        [status]:
                            new Date().toISOString()

                    }

                }

            })

            return NextResponse.json(
                {
                    message:
                        "Order status updated successfully"
                }
            )

        }

        /* 
           DELIVERY OTP EMAIL
         */

        if (
            status ===
            "DELIVERY_INITIATED" &&
            plainOtp
        ) {

            try {

                if (
                    order.user?.email
                ) {

                    await sendEmail({

                        to:
                            order.user.email,

                        subject:
                            "Your Nandurbar Bazar Delivery OTP",

                        html: `
                            <div style="font-family:Arial,sans-serif">

                                <h2>
                                    Delivery Verification
                                </h2>

                                <p>
                                    Your delivery OTP is:
                                </p>

                                <h1>
                                    ${plainOtp}
                                </h1>

                                <p>
                                    Please share this OTP with the delivery driver.
                                </p>

                            </div>
                        `

                    })

                }

            } catch (emailError) {

                console.error(
                    "OTP EMAIL ERROR:",
                    emailError
                )

            }

        }

        /* 
           FALLBACK STATUS UPDATE
         */

        await prisma.order.update({

            where: {
                id:
                    orderId
            },

            data: {

                status:
                    status,

                statusHistory: {

                    ...(order.statusHistory || {}),

                    [status]:
                        new Date().toISOString()

                }

            }

        })

        return NextResponse.json(
            {
                message:
                    "Order status updated successfully"
            }
        )

    } catch (error) {

        console.error(
            "STORE ORDER API ERROR:",
            error
        )

        return NextResponse.json(
            {
                error:
                    error?.message ||
                    "Something went wrong"
            },
            {
                status: 400
            }
        )

    }

}


/* ====
   GET SELLER ORDERS
==== */

export async function GET(request) {

    try {

        const { userId } =
            getAuth(request)

        const storeId =
            await authSeller(userId)

        if (!storeId) {

            return NextResponse.json(
                {
                    error:
                        "Not authorized"
                },
                {
                    status: 401
                }
            )

        }

        const settings =
            await prisma.platformSettings.findFirst() ||
            {
                commissionPercent:
                    10,

                deliveryFee:
                    50,

                driverFee:
                    30,

                freeDeliveryAbove:
                    999999

            }

        const orders =
            await prisma.order.findMany({

                where: {
                    storeId
                },

                include: {

                    user: true,

                    address: true,

                    store: true,

                    orderItems: {
                        include: {
                            product: true
                        }
                    },

                    returnRequests: {
                        include: {
                            items: true
                        }
                    }

                },

                orderBy: {
                    createdAt:
                        "desc"
                }

            })

        const activeOrdersCount =
            await prisma.order.count({

                where: {

                    storeId,

                    NOT: {

                        status: {
                            in: [
                                "DELIVERED",
                                "CANCELLED",
                                "RETURNED"
                            ]
                        }

                    }

                }

            })

        return NextResponse.json({

            orders,

            activeCount:
                activeOrdersCount,

            settings

        })

    } catch (error) {

        console.error(
            "GET STORE ORDERS ERROR:",
            error
        )

        return NextResponse.json(
            {
                error:
                    error?.message ||
                    "Failed to fetch orders"
            },
            {
                status: 400
            }
        )

    }

}