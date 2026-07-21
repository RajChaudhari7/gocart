import { NextResponse } from "next/server";
import { summaryAI } from "@/configs/summaryAI";

export const runtime = "nodejs";

const MAX_PRODUCTS = 10;
const MAX_INSIGHTS = 10;
const MAX_CHART_ITEMS = 20;

const SUPPORTED_LANGUAGES = [
    "English",
    "Hindi",
    "Gujarati",
    "Marathi",
    "Tamil",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Bengali",
    "Punjabi",
];

const cleanArray = (value, limit) => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.slice(0, limit);
};

const extractJson = (text) => {
    if (!text || typeof text !== "string") {
        throw new Error("AI returned an empty response");
    }

    const cleanedText = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleanedText);
    } catch {
        const firstBrace = cleanedText.indexOf("{");
        const lastBrace = cleanedText.lastIndexOf("}");

        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error("AI response did not contain valid JSON");
        }

        return JSON.parse(
            cleanedText.slice(firstBrace, lastBrace + 1)
        );
    }
};

const normalizeSummary = (value) => {
    const score = Number(value?.score);

    return {
        summary:
            typeof value?.summary === "string"
                ? value.summary.trim()
                : "No summary was generated.",

        strengths: cleanArray(value?.strengths, 5).map(String),

        concerns: cleanArray(value?.concerns, 5).map(String),

        recommendations: cleanArray(
            value?.recommendations,
            5
        ).map(String),

        score: Number.isFinite(score)
            ? Math.min(100, Math.max(0, Math.round(score)))
            : 0,
    };
};

export async function POST(request) {
    try {
        if (!process.env.SUMMARY_AI_API_KEY) {
            return NextResponse.json(
                {
                    success: false,
                    error: "SUMMARY_AI_API_KEY is not configured",
                },
                {
                    status: 500,
                }
            );
        }

        if (!process.env.SUMMARY_AI_MODEL) {
            return NextResponse.json(
                {
                    success: false,
                    error: "SUMMARY_AI_MODEL is not configured",
                },
                {
                    status: 500,
                }
            );
        }

        const body = await request.json();

        const {
            stats,
            highlights = {},
            topProducts = [],
            insights = [],
            charts = {},
            filters = {},
            language = "English",
        } = body;



        const selectedLanguage = SUPPORTED_LANGUAGES.includes(language)
            ? language
            : "English";

        if (!stats || typeof stats !== "object") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Analytics statistics are required",
                },
                {
                    status: 400,
                }
            );
        }

        const analyticsData = {
            filters,

            stats,

            highlights: {
                bestSeller: highlights?.bestSeller ?? null,
                mostViewedProduct:
                    highlights?.mostViewedProduct ?? null,
            },

            topProducts: cleanArray(
                topProducts,
                MAX_PRODUCTS
            ),

            insights: cleanArray(
                insights,
                MAX_INSIGHTS
            ),

            charts: {
                salesByCategory: cleanArray(
                    charts?.salesByCategory,
                    MAX_CHART_ITEMS
                ),

                monthlySales: cleanArray(
                    charts?.monthlySales,
                    MAX_CHART_ITEMS
                ),
            },
        };

        const prompt = `
You are an expert ecommerce business analyst.

Analyze the seller's product analytics and provide a practical
business review for the seller.

The seller has selected this response language:

${selectedLanguage}

Important rules:

1. Use only the supplied analytics data.
2. Do not invent products, sales, revenue, ratings, or trends.
3. Consider the currently selected filters.
4. Mention weak performance carefully and professionally.
5. Recommendations must be specific and actionable.
6. Keep the main summary below 150 words.
7. Return only valid JSON.
8. Do not use markdown.
9. The score must be an integer from 0 to 100.
10. Write the summary, strengths, concerns, and recommendations entirely in ${selectedLanguage}.
11. Do not translate product names, category names, brand names, numbers, percentages, dates, or currency values.
12. Keep JSON property names exactly in English:
    summary, strengths, concerns, recommendations, score.
13. Use natural, simple, seller-friendly ${selectedLanguage}.
14. Do not mix English sentences with ${selectedLanguage}, except for product names and technical names already present in the analytics.

Return exactly this JSON structure:

{
  "summary": "Overall performance summary written in ${selectedLanguage}",
  "strengths": [
    "Strength written in ${selectedLanguage}"
  ],
  "concerns": [
    "Concern written in ${selectedLanguage}"
  ],
  "recommendations": [
    "Recommendation written in ${selectedLanguage}"
  ],
  "score": 75
}

Seller analytics:

${JSON.stringify(analyticsData, null, 2)}
`;

        const completion =
            await summaryAI.chat.completions.create({
                model: process.env.SUMMARY_AI_MODEL,

                messages: [
                    {
                        role: "system",
                        content: `
                                You produce accurate ecommerce analytics summaries.
                                Always return valid JSON.
                                Follow the requested response language exactly.
                                Keep JSON property names in English.
                                Do not translate product names or numerical values.
                                `,
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],

                temperature: 0.3,
            });

        const content =
            completion.choices?.[0]?.message?.content;

        const parsedSummary = extractJson(content);
        const normalizedSummary =
            normalizeSummary(parsedSummary);

        return NextResponse.json({
            success: true,
            language: selectedLanguage,
            generatedAt: new Date().toISOString(),
            ...normalizedSummary,
        });
    } catch (error) {
        console.error(
            "Product analytics AI summary error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error?.message ||
                    "Failed to generate AI review summary",
            },
            {
                status: 500,
            }
        );
    }
}