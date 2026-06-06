import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request) {
    try {
        const body = await request.json()

        const {
            name,
            phone,
            vehicle,
            vehicleNo,
            password
        } = body

        if (!name || !phone || !password) {
            return NextResponse.json(
                {
                    error: "Name, phone and password are required"
                },
                {
                    status: 400
                }
            )
        }

        // check existing phone
        const existingDriver = await prisma.driver.findFirst({
            where: {
                phone
            }
        })

        if (existingDriver) {
            return NextResponse.json(
                {
                    error: "Driver already exists"
                },
                {
                    status: 400
                }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const driver = await prisma.driver.create({
            data: {
                name,
                phone,
                password: hashedPassword,
                vehicle,
                vehicleNo
            }
        })

        return NextResponse.json({
            success: true,
            driver
        })
    } catch (error) {
        console.log(error)

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

export async function GET() {
    try {
        const drivers = await prisma.driver.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(drivers);
    } catch (error) {
        return NextResponse.json(
            {
                error: error.message
            },
            {
                status: 500
            }
        );
    }
}