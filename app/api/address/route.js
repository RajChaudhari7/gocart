import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import * as z from "zod";

// Zod schema for validation
const addressSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().regex(/^\d{6}$/, "Zip code must be 6 digits"),
  country: z.string().min(1),
  phone: z.string().min(1), // Further phone validation can be done in frontend
});

// ---------------- POST ----------------
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Validate request body
    const parsed = addressSchema.safeParse(body.address);
    if (!parsed.success) {
      const errors = parsed.error.errors.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    // Add userId
    const addressData = { ...parsed.data, userId };

    const newAddress = await prisma.address.create({
      data: addressData,
    });

    return NextResponse.json({ newAddress, message: "Address added successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// ---------------- GET ----------------
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
