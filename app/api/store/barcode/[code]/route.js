import { NextResponse } from "next/server"

export async function GET(req, { params }) {
    try {
        const { code } = params

        // OpenFoodFacts (FREE, no auth)
        const res = await fetch(
            `https://world.openfoodfacts.org/api/v0/product/${code}.json`
        )

        const data = await res.json()

        if (!data.product) {
            return NextResponse.json(
                { error: "Product not found for this barcode" },
                { status: 404 }
            )
        }

        const product = data.product

        return NextResponse.json({
            name: product.product_name || "",
            description:
                product.ingredients_text ||
                product.generic_name ||
                "",
            category: product.categories_tags?.[0]?.replace("en:", "") || "Others",
            image: product.image_url || null,
        })

    } catch (error) {
        return NextResponse.json(
            { error: "Barcode lookup failed" },
            { status: 500 }
        )
    }
}
