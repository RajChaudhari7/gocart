import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {

    const { phone, password } = await req.json()

    const driver = await prisma.driver.findUnique({
        where: { phone }
    })

    if (!driver) {
        return NextResponse.json(
            { error: "Driver not found" },
            { status: 404 }
        )
    }

    const valid = await bcrypt.compare(
        password,
        driver.password
    )

    if (!valid) {
        return NextResponse.json(
            { error: "Invalid Password" },
            { status: 401 }
        )
    }

    const token = jwt.sign(
        { driverId: driver.id },
        process.env.JWT_SECRET
    )

    return NextResponse.json({
        token,
        driver
    })
}