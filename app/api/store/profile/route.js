import { imagekit } from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { current } from "@reduxjs/toolkit";
import { NextResponse } from "next/server";

// Get Store Profile
export async function GET() {
    try {

        const { userId } = getAuth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const storeId = await authSeller(userId);

        const store = await prisma.store.findUnique({
            where: {
                id: storeId,
            },
            select: {
                id: true,
                userId: true,
                name: true,
                description: true,
                username: true,
                address: true,
                status: true,
                isActive: true,
                logo: true,
                email: true,
                gst: true,
                latitude: true,
                longitude: true,
                contact: true,
                category: true,
                customCategory: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        return NextResponse.json({ store });

    } catch (error) {
        console.error("Get Store Profile Error:", error);
        return NextResponse.json({
            error: error?.message || "Failed to load store profile",
        },
            { status: 400 }
        );
    }
}

// Update Store Profile

export async function PUT(request) {
    try {

        const { userId } = getAuth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const storeId = await authSeller(userId);

        const formData = await request.formData();

        // Form Values

        const name = formData.get("name")?.toString().trim();
        const username = formData.get("username")?.toString().trim().toLowerCase();
        const description = formData.get("description")?.toString().trim();
        const email = formData.get("email")?.toString().trim();
        const contact = formData.get("contact")?.toString().trim();
        const address = formData.get("address")?.toString().trim();

        const gstValue = formData.get("gst");
        const gst = gstValue ? gstValue.toString().trim().toUpperCase() : null;

        const categoryValue = formData.get("category");
        const category = categoryValue ? categoryValue.toString().trim() : null;

        const customCategoryValue = formData.get("customCategory");
        const customCategory = customCategoryValue ? customCategoryValue.toString().trim() : null;

        const latitudeValue = formData.get("latitude");
        const longitudeValue = formData.get("longitude");

        const latitude = latitudeValue !== null && latitudeValue !== "" ? Number(latitudeValue) : null;
        const longitude = longitudeValue !== null && longitudeValue !== "" ? Number(longitudeValue) : null;

        const image = formData.get("image");

        // Basic Validation
        if (!name || !username || !description || !email || !contact || !address) {
            return NextResponse.json({
                error: "Please fill in all required fields.",
            }, { status: 400 });
        }

        // Coordinate Validation
        if (
            latitude === null || longitude === null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return NextResponse.json({
                error: "Valid store location is required"
            },
                { status: 400 }
            );
        }

        if (latitude < -90 || latitude > 90) {
            return NextResponse.json({
                error: "Invalid latitude"
            },
                {
                    status: 400
                }
            );
        }

        if (longitude < -180 || longitude > 180) {
            return NextResponse.json(
                {
                    error: "Invalid longitude"
                },
                {
                    status: 400
                }
            );
        }

        // Get current store
        const currentStore = await prisma.store.findUnique({
            where: { id: storeId },
        });

        if (!currentStore) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // useername validation
        if (username !== currentStore.username) {
            const existingUsername = await prisma.store.findFirst({
                where: {
                    username,
                    NOT: {
                        id: storeId,
                    },
                },
            });

            if (existingUsername) {
                return NextResponse.json(
                    { error: "Username already taken" },
                    { status: 400 },
                );
            }
        }

        // contact check
        if (contact !== currentStore.contact) {
            const existingContact = await prisma.store.findFirst({
                where: {
                    contact,
                    NOT: {
                        id: storeId,
                    },
                },
            });

            if (existingContact) {
                return NextResponse.json(
                    { error: "Contact number already registered" },
                    { error: 400 }
                );
            }
        }

        // GST validation
        if (gst) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

            if (!gstRegex.test(gst)) {
                return NextResponse.json(
                    { error: "Invalid GST number" },
                    { status: 400 }
                );
            }

            if (gst !== currentStore.gst) {
                const existingGST = await prisma.store.findFirst({
                    where: {
                        gst,
                        NOT: {
                            id: storeId,
                        },
                    },
                });

                if (existingGST) {
                    return NextResponse.json(
                        { error: "GST already registered" },
                        { status: 400 }
                    );
                }
            }
        }

        // Category
        let finalCategory = category;

        if (category === "Other") {
            if (!customCategory) {
                return NextResponse.json(
                    { error: "Please enter your custom category" },
                    { status: 400 }
                );
            }

            finalCategory = customCategory;
        }

        // Logo upload
        let logo = currentStore.logo;

        if (
            image &&
            typeof image === "object" &&
            typeof image.arrayBuffer === "function" &&
            image.size > 0
        ) {
            const buffer = Buffer.from(
                await image.arrayBuffer()
            );

            const response = await imagekit.upload({
                file: buffer,
                fileName: image.name || `store-${storeId}`,
                folder: "logos",
            });

            logo = imagekit.url({
                path: response.filePath,
                transformation: [
                    {
                        quality: "auto",
                    },
                    {
                        format: "webp",
                    },
                    {
                        width: "512",
                    },
                ],
            });
        }

        const updatedStore = await prisma.store.update({
            where: {
                id: storeId,
            },
            data: {
                name,
                username,
                description,
                email,
                contact,
                address,
                gst,
                category: finalCategory,
                latitude,
                longitude,
                logo,
            },
            select: {
                id: true,
                userId: true,
                name: true,
                description: true,
                username: true,
                address: true,
                status: true,
                isActive: true,
                logo: true,
                email: true,
                gst: true,
                latitude: true,
                longitude: true,
                contact: true,
                category: true,
                customCategory: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            message: "Store profile updated successfully",
            store: updatedStore,
        });

    } catch (error) {
        console.error("Update store profile error : ", error);

        return NextResponse.json(
            { error: error?.message || "Failed to update store profile" },
            { status: 400 }
        );
    }
}