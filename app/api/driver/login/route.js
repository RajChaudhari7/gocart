import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request) {

    try {

        const {
            phone,
            password
        } = await request.json()

        const driver = await prisma.driver.findFirst({
            where: {
                phone
            }
        })

        if (!driver) {
            return NextResponse.json(
                {
                    error: "Driver not found"
                },
                {
                    status: 404
                }
            )
        }

        const match = await bcrypt.compare(
            password,
            driver.password
        )

        if (!match) {
            return NextResponse.json(
                {
                    error: "Invalid credentials"
                },
                {
                    status: 400
                }
            )
        }

        return NextResponse.json({
            success: true,
            driver
        })

    } catch (error) {

        return NextResponse.json(
            {
                error: error.message
            },
            {
                status: 500
            }
        )

    }

}