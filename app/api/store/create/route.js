import { imagekit } from "@/configs/imageKit"
import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {
    try {
        const { userId } = getAuth(request)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()

        const name = formData.get("name")
        const username = formData.get("username")
        const description = formData.get("description")
        const email = formData.get("email")
        const contact = formData.get("contact")
        const address = formData.get("address")
        const image = formData.get("image")

        if (!name || !description || !username || !email || !contact || !address || !image) {
            return NextResponse.json({ error: "Missing Store info" }, { status: 400 })
        }

        const existingStore = await prisma.store.findFirst({
            where: { userId }
        })

        if (existingStore) {
            return NextResponse.json({ status: existingStore.status })
        }

        const usernameTaken = await prisma.store.findFirst({
            where: { username: username.toLowerCase() }
        })

        if (usernameTaken) {
            return NextResponse.json({ error: "Username already taken" }, { status: 400 })
        }

        const buffer = Buffer.from(await image.arrayBuffer())
        const upload = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos"
        })

        const logo = imagekit.url({
            path: upload.filePath,
            transformation: [{ quality: "auto" }, { format: "webp" }, { width: "512" }]
        })

        await prisma.store.create({
            data: {
                userId,
                name,
                description,
                username: username.toLowerCase(),
                email,
                contact,
                address,
                logo
            }
        })

        return NextResponse.json({ message: "Applied, waiting for approval" })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
