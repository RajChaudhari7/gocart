import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ==============================
// ➕ ADD ADDRESS
// ==============================
export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { address } = await request.json();

        // 🔥 VALIDATION
        const requiredFields = [
            "name",
            "email",
            "street",
            "city",
            "state",
            "zip",
            "country",
            "phone"
        ];

        for (let field of requiredFields) {
            if (!address[field] || address[field].toString().trim() === "") {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // 📌 Phone validation
        if (!/^\d{10}$/.test(address.phone)) {
            return NextResponse.json(
                { error: "Invalid phone number" },
                { status: 400 }
            );
        }

        // 📌 PIN validation (India)
        if (address.country === "India" && !/^\d{6}$/.test(address.zip)) {
            return NextResponse.json(
                { error: "Invalid PIN code" },
                { status: 400 }
            );
        }

        // 🔥 CLEAN + NORMALIZE DATA
        const cleanAddress = {
            userId,
            name: address.name.trim(),
            email: address.email.toLowerCase().trim(),
            street: address.street.trim(),
            city: address.city.trim(),
            state: address.state.trim(),
            zip: address.zip.trim(),
            country: address.country.trim(),
            phone: address.phone.trim(),
        };

        // 🔥 SAVE
        const newAddress = await prisma.address.create({
            data: cleanAddress
        });

        return NextResponse.json({
            newAddress,
            message: "Address added successfully"
        });

    } catch (error) {
        console.error("Add address error:", error);

        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}


// ==============================
// 📦 GET ALL ADDRESSES
// ==============================
export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ addresses });

    } catch (error) {
        console.error("Fetch address error:", error);

        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}