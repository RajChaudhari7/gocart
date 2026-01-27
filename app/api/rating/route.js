import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// add new rating
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const formData = await request.formData();

        const orderId = formData.get('orderId');
        const productId = formData.get('productId');
        const rating = parseInt(formData.get('rating'));
        const review = formData.get('review');
        const photoFile = formData.get('photo');

        const order = await prisma.order.findUnique({
            where: { id: orderId, userId },
        });

        if (!order) return NextResponse.json({ error: "Order Not found" }, { status: 404 });

        const isAlreadyRated = await prisma.rating.findFirst({ where: { productId, orderId } });
        if (isAlreadyRated) return NextResponse.json({ error: "Product Already Rated" }, { status: 400 });

        // Save photo to local storage (for simplicity)
        let photoPath = null;
        if (photoFile && photoFile.size > 0) {
            const buffer = Buffer.from(await photoFile.arrayBuffer());
            const fileName = `${Date.now()}-${photoFile.name}`;
            const uploadDir = path.join(process.cwd(), "public", "reviews");
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            fs.writeFileSync(path.join(uploadDir, fileName), buffer);
            photoPath = `/reviews/${fileName}`;
        }

        const response = await prisma.rating.create({
            data: {
                userId,
                productId,
                orderId,
                rating,
                review,
                photo: photoPath,
            },
        });

        return NextResponse.json({ message: "Rating Added successfully", rating: response });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}

// get all ratings for a user
export async function GET(request) {

    try {

        const { userId } = getAuth(request)

        if (!userId) {
            return NextResponse.json({ error: "UnAuthorized" }, { status: 401 })
        }

        const ratings = await prisma.rating.findMany({
            where: { userId }
        })

        return NextResponse.json({ ratings })


    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }

}