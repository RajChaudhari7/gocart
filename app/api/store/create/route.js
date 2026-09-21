import { imagekit } from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const normalizeCategory = (value) => {
    if (!value) return "";

    return value
        .toString()
        .trim()
        .replace(/\s+/g, " ");
};

// create the Store
export async function POST(request) {

    try {

        const { userId } = getAuth(request)

        const formData = await request.formData()

        const name = formData.get("name")
        const username = formData.get("username")
        const description = formData.get("description")
        const email = formData.get("email")
        const contact = formData.get("contact")
        const address = formData.get("address")
        const image = formData.get("image")
        const gst = formData.get("gst")?.toString().trim().toUpperCase() || null;
        const latitude = parseFloat(formData.get("latitude"))
        const longitude = parseFloat(formData.get("longitude"))

        if (!name || !description || !username || !email || !contact || !address || !image || !latitude ||
            !longitude) {
            return NextResponse.json({ error: "Missing Store info" }, { status: 400 })
        }

        if (gst) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

            if (!gstRegex.test(gst)) {
                return NextResponse.json(
                    { error: "Invalid GST number" },
                    { status: 400 }
                );
            }

            const existingGST = await prisma.store.findFirst({
                where: { gst }
            });

            if (existingGST) {
                return NextResponse.json(
                    { error: "GST already registered" },
                    { status: 400 }
                );
            }
        }

        const existingContact = await prisma.store.findFirst({
            where: { contact }
        })

        if (existingContact) {
            return NextResponse.json(
                { error: "Contact number already registered" },
                { status: 400 }
            )
        }

        const store = await prisma.store.findFirst({
            where: { userId: userId }
        });

        if (store) {
            return NextResponse.json({ status: store.status });
        }

        const isUsernameTaken = await prisma.store.findFirst({
            where: { username: username.toLowerCase() }
        })

        if (isUsernameTaken) {
            return NextResponse.json({ error: "Username Already Taken" }, { status: 400 })
        }

        const buffer = Buffer.from(await image.arrayBuffer());

        const response = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: 'logos'
        })

        const optimizedImage = imagekit.url({
            path: response.filePath,
            transformation: [
                { quality: 'auto' },
                { format: 'webp' },
                { width: '512' }
            ]
        })

        const category = normalizeCategory(
            formData.get("category")
        );

        const customCategory = normalizeCategory(
            formData.get("customCategory")
        );

        const rawFinalCategory =
            category === "Other"
                ? customCategory
                : category;

        const finalCategory =
            normalizeCategory(rawFinalCategory);

        if (!finalCategory) {
            return NextResponse.json(
                { error: "Store category is required" },
                { status: 400 }
            );
        }

        const existingCategory = await prisma.store.findFirst({
            where: {
                category: {
                    equals: finalCategory,
                    mode: "insensitive",
                },
            },
            select: {
                category: true,
            },
        });

        const canonicalCategory =
            existingCategory?.category || finalCategory;

        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                description,
                username: username.toLowerCase(),
                email,
                contact,
                address,
                gst,
                logo: optimizedImage,
                category: canonicalCategory,
                latitude,
                longitude
            }
        })

        await prisma.user.update({
            where: { id: userId },
            data: { store: { connect: { id: newStore.id } } }
        })

        return NextResponse.json({ message: "applied , waiting for approval" })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }

}

// get store status
export async function GET(request) {

    try {

        const { userId } = getAuth(request)

        const store = await prisma.store.findFirst({
            where: { userId: userId }
        });

        if (store) {
            return NextResponse.json({ status: store.status });
        }

        return NextResponse.json({ status: "not registered" })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}