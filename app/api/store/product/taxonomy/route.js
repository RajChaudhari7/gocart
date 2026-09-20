import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const normalizeTaxonomy = (value) => {
    if (!value) return "";

    return value.toString().trim().replace(/\s+/g, " ");
};

export async function GET(request) {
    try {

        const { userId } = getAuth(request);

        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json(
                { error: "Not authorized" },
                { status: 401 }
            );
        }

        // get exisitng taxonomy
        const products = await prisma.product.findMany({
            where: {
                isArchived: false,
            },
            select: {
                category: true,
                subCategory: true,
            },
        });

        // build unique taxonomy
        const categoryMap = new Map();

        products.forEach(({ category, subCategory }) => {
            const cleanCategory = normalizeTaxonomy(category);

            if (!cleanCategory) return;

            const categoryKey = cleanCategory.toLowerCase();

            if (!categoryKey.has(categoryKey)) {
                categoryMap.set(categoryKey, {
                    name: cleanCategory,
                    subCategories: new Map(),
                });
            }

            const categoryData = categoryMap.get(categoryKey);

            const cleanSubCategory = normalizeTaxonomy(subCategory);

            if (!cleanSubCategory) return;

            const subCategoryKey = cleanSubCategory.toLowerCase();

            if (!categoryData.subCategories.has(
                subCategoryKey
            )) {
                categoryData.subCategories.set(
                    subCategoryKey,
                    cleanSubCategory
                );
            }
        });

        // Format Response
        const categories = Array.from(
            categoryMap.values()
        )

            .filter((category) => category.name.toLowerCase() !== "others").map((category) => ({
                name: category.name,

                subCategories: Array.from(
                    category.subCategories.values()
                ).sort((a, b) => a.name.localCompare(b)),
            })).sort((a, b) => a.name.localCompare(b.name));

        return NextResponse.json({
            success: true,
            categories,
        });

    } catch (error) {
        console.error("Taxonomy api error", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to load memory",
            },
            { status: 500 }
        );

    }
}