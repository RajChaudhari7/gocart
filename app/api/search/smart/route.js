import { searchAI } from "@/configs/searchAI";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const originalQuery = query.trim().toLowerCase();

    let aiSearch = {
      keywords: [originalQuery],
      category: "",
      subCategory: "",
      minPrice: 0,
      maxPrice: 999999,
      sort: "POPULAR",
    };

    // ------------------------------------------------
    // AI QUERY PARSING
    // ------------------------------------------------

    try {
      const completion = await searchAI.chat.completions.create({
        model: process.env.SEARCH_AI_MODEL || "gemini-3-flash-preview",

        messages: [
          {
            role: "system",
            content: `
You are an AI shopping assistant.

Convert the user's shopping query into JSON ONLY.

Return exactly:

{
  "keywords":[""],
  "category":"",
  "subCategory":"",
  "minPrice":0,
  "maxPrice":999999,
  "sort":"POPULAR"
}

Rules:

1. keywords should contain only important product-related words.
2. Do not add unrelated words.
3. Keep brand names and product names.
4. category and subCategory should be empty if uncertain.
5. minPrice and maxPrice should reflect price requests.
6. sort can only be:
   POPULAR
   PRICE_LOW
   PRICE_HIGH
   RATING

Return ONLY JSON.
`,
          },
          {
            role: "user",
            content: query,
          },
        ],
      });

      const raw = completion.choices?.[0]?.message?.content || "";

      const jsonMatch = raw.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        aiSearch = {
          ...aiSearch,
          ...parsed,
        };
      }
    } catch (error) {
      console.log("AI Parsing Failed:", error.message);
    }

    // ------------------------------------------------
    // NORMALIZE AI DATA
    // ------------------------------------------------

    const aiKeywords = Array.isArray(aiSearch.keywords)
      ? aiSearch.keywords
          .map((word) => String(word).trim().toLowerCase())
          .filter(Boolean)
      : [];

    /*
     * Always include the original query.
     * This protects search if the AI returns
     * incomplete keywords.
     */
    const keywords = Array.from(new Set([originalQuery, ...aiKeywords]));

    const minPrice =
      Number(aiSearch.minPrice) >= 0 ? Number(aiSearch.minPrice) : 0;

    const maxPrice =
      Number(aiSearch.maxPrice) > 0 ? Number(aiSearch.maxPrice) : 999999;

    // ------------------------------------------------
    // DATABASE SEARCH CONDITIONS
    // ------------------------------------------------

    const searchConditions = [];

    /*
     * Strong match:
     * search complete user query first.
     */
    searchConditions.push(
      {
        name: {
          contains: originalQuery,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: originalQuery,
          mode: "insensitive",
        },
      },
    );

    /*
     * Then search individual AI keywords.
     */
    keywords.forEach((keyword) => {
      searchConditions.push(
        {
          name: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          subCategory: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          keywords: {
            has: keyword,
          },
        },
      );
    });

    // ------------------------------------------------
    // FETCH ONLY MATCHING PRODUCTS
    // ------------------------------------------------

    const products = await prisma.product.findMany({
      where: {
        quantity: {
          gt: 0,
        },

        isArchived: false,

        store: {
          isActive: true,
        },

        price: {
          gte: minPrice,
          lte: maxPrice,
        },

        OR: searchConditions,
      },

      include: {
        store: true,
        rating: true,
      },

      take: 60,
    });

    // ------------------------------------------------
    // SCORE MATCHING PRODUCTS
    // ------------------------------------------------

    const scored = products.map((product) => {
      let relevanceScore = 0;

      const name = (product.name || "").toLowerCase();

      const description = (product.description || "").toLowerCase();

      const category = (product.category || "").toLowerCase();

      const subCategory = (product.subCategory || "").toLowerCase();

      const productKeywords = Array.isArray(product.keywords)
        ? product.keywords.map((keyword) =>
            String(keyword).toLowerCase().trim(),
          )
        : [];

      // Exact / strong query match
      if (name === originalQuery) {
        relevanceScore += 500;
      }

      if (name.startsWith(originalQuery)) {
        relevanceScore += 300;
      }

      if (name.includes(originalQuery)) {
        relevanceScore += 250;
      }

      if (description.includes(originalQuery)) {
        relevanceScore += 100;
      }

      // AI keyword matches
      keywords.forEach((keyword) => {
        if (name === keyword) {
          relevanceScore += 200;
        }

        if (name.startsWith(keyword)) {
          relevanceScore += 150;
        }

        if (name.includes(keyword)) {
          relevanceScore += 120;
        }

        if (description.includes(keyword)) {
          relevanceScore += 40;
        }

        if (category.includes(keyword)) {
          relevanceScore += 70;
        }

        if (subCategory.includes(keyword)) {
          relevanceScore += 80;
        }

        if (
          productKeywords.some(
            (productKeyword) =>
              productKeyword === keyword ||
              productKeyword.includes(keyword) ||
              keyword.includes(productKeyword),
          )
        ) {
          relevanceScore += 100;
        }
      });

      // Category intent from AI
      const aiCategory = String(aiSearch.category || "")
        .trim()
        .toLowerCase();

      const aiSubCategory = String(aiSearch.subCategory || "")
        .trim()
        .toLowerCase();

      if (aiCategory && category === aiCategory) {
        relevanceScore += 120;
      }

      if (aiSubCategory && subCategory === aiSubCategory) {
        relevanceScore += 150;
      }

      /*
       * Popularity is now only a secondary
       * ranking factor.
       */
      const popularityScore =
        Math.min((product.totalSales || 0) * 2, 100) +
        Math.min((product.averageRating || 0) * 10, 50) +
        Math.min((product.totalViews || 0) * 0.05, 50) +
        (product.featured ? 25 : 0);

      return {
        ...product,

        relevanceScore,

        score: relevanceScore + popularityScore,
      };
    });

    // ------------------------------------------------
    // REMOVE WEAK / UNRELATED MATCHES
    // ------------------------------------------------

    let relevantProducts = scored.filter(
      (product) => product.relevanceScore > 0,
    );

    // ------------------------------------------------
    // SORT
    // ------------------------------------------------

    switch (aiSearch.sort) {
      case "PRICE_LOW":
        relevantProducts.sort((a, b) => a.price - b.price);
        break;

      case "PRICE_HIGH":
        relevantProducts.sort((a, b) => b.price - a.price);
        break;

      case "RATING":
        relevantProducts.sort(
          (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
        );
        break;

      default:
        relevantProducts.sort((a, b) => b.score - a.score);
    }

    return NextResponse.json({
      products: relevantProducts.slice(0, 30),

      search: {
        query: originalQuery,
        keywords,
        category: aiSearch.category || "",
        subCategory: aiSearch.subCategory || "",
        minPrice,
        maxPrice,
        sort: aiSearch.sort || "POPULAR",
      },
    });
  } catch (error) {
    console.error("SMART SEARCH ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Search failed",
      },
      {
        status: 500,
      },
    );
  }
}
