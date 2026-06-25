import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request) {

    
    try {

        const {
            phone,
            password
        } = await request.json()

        const driver =
            await prisma.driver.findFirst({
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

        const hashedPassword =
            await bcrypt.hash(password, 10)

        await prisma.driver.update({
            where: {
                id: driver.id
            },
            data: {
                password: hashedPassword
            }
        })

        return NextResponse.json({
            success: true
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