import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const normalizeTaxonomy = (value) => {
    if (!value) return "";

    return value
        .toString()
        .trim()
        .replace(/\s+/g, " ");
};

export async function GET(request) {
    try {
        // ================= AUTHENTICATION =================
        const { userId } = getAuth(request);

        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json(
                { error: "Not authorized" },
                { status: 401 }
            );
        }

        // ================= GET EXISTING TAXONOMY =================
        // We read all active products so custom categories/subcategories
        // created by sellers can be reused across the platform.
        const products = await prisma.product.findMany({
            where: {
                isArchived: false,
            },
            select: {
                category: true,
                subCategory: true,
            },
        });

        // ================= BUILD UNIQUE TAXONOMY =================
        const categoryMap = new Map();

        products.forEach(({ category, subCategory }) => {
            const cleanCategory = normalizeTaxonomy(category);

            if (!cleanCategory) return;

            const categoryKey = cleanCategory.toLowerCase();

            if (!categoryMap.has(categoryKey)) {
                categoryMap.set(categoryKey, {
                    name: cleanCategory,
                    subCategories: new Map(),
                });
            }

            const categoryData = categoryMap.get(categoryKey);

            const cleanSubCategory =
                normalizeTaxonomy(subCategory);

            if (!cleanSubCategory) return;

            const subCategoryKey =
                cleanSubCategory.toLowerCase();

            if (
                !categoryData.subCategories.has(
                    subCategoryKey
                )
            ) {
                categoryData.subCategories.set(
                    subCategoryKey,
                    cleanSubCategory
                );
            }
        });

        // ================= FORMAT RESPONSE =================
        const categories = Array.from(
            categoryMap.values()
        )
            // "Others" is only a UI option for adding custom taxonomy.
            // It should never become an actual taxonomy value.
            .filter(
                (category) =>
                    category.name.toLowerCase() !== "others"
            )
            .map((category) => ({
                name: category.name,

                subCategories: Array.from(
                    category.subCategories.values()
                ).sort((a, b) =>
                    a.localeCompare(b)
                ),
            }))
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            );

        return NextResponse.json({
            success: true,
            categories,
        });

    } catch (error) {
        console.error(
            "TAXONOMY API ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error: "Failed to load taxonomy",
            },
            { status: 500 }
        );
    }
}