import { imagekit } from "@/configs/imageKit"
import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// ================= ADD PRODUCT =================
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 })
        }

        const formData = await request.formData()

        const name = formData.get("name")
        const description = formData.get("description")
        const mrp = Number(formData.get("mrp"))
        const price = Number(formData.get("price"))
        const quantity = Number(formData.get("quantity"))
        const category = formData.get("category")
        const images = formData.getAll("images")

        if (
            !name ||
            !description ||
            mrp <= 0 ||
            price <= 0 ||
            quantity < 0 ||
            !category ||
            images.length === 0
        ) {
            return NextResponse.json({ error: "Missing product details" }, { status: 400 })
        }

        const imagesUrl = await Promise.all(
            images.map(async (image) => {
                const buffer = Buffer.from(await image.arrayBuffer())
                const upload = await imagekit.upload({
                    file: buffer,
                    fileName: image.name,
                    folder: "products",
                })

                return imagekit.url({
                    path: upload.filePath,
                    transformation: [
                        { quality: "auto" },
                        { format: "webp" },
                        { width: "1024" }
                    ]
                })
            })
        )

        await prisma.product.create({
            data: {
                name,
                description,
                mrp,
                price,
                quantity,
                category,
                images: imagesUrl,
                storeId,
                inStock: quantity > 0
            }
        })

        return NextResponse.json({ message: "Product added successfully" })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

// ================= GET SELLER PRODUCTS =================
export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 })
        }

        const products = await prisma.product.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ products })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

// ================= UPDATE PRODUCT =================
export async function PUT(request) {
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 })
        }

        const { productId, price, quantity } = await request.json()

        if (!productId || price <= 0 || quantity < 0) {
            return NextResponse.json({ error: "Invalid values" }, { status: 400 })
        }

        await prisma.product.update({
            where: { id: productId, storeId },
            data: {
                price,
                quantity,
                inStock: quantity > 0
            }
        })

        return NextResponse.json({ message: "Product updated successfully" })

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
