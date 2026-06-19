import { openai } from "@/configs/openai";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

async function main(base64Image, mimeType) {

    const messages = [
        {
            "role": "system",
            "content": `
                You are a product listing assistant for a local e-commerce store.
                Your job is to analyze an image of a product and generate structured data.
                
                You MUST return the data in valid JSON format. Follow this exact schema: 
                {
                    "name": "A clear, concise product title",
                    "description": "A detailed 2-3 sentence product description",
                    "mrp": 1000, 
                    "price": 800,
                    "category": "String (Choose from: Electronics, Clothing, Home & Kitchen, Beauty & Health, Sports & Outdoors, Books & Media, Food & Drink, Hobbies & Crafts, Others)",
                    "subCategory": "String (A specific sub-category based on the item)",
                    "quantity": 10
                }
                Make sure 'price' is slightly less than 'mrp'. Make realistic guesses for prices in INR (₹).
            `
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Analyze this product image and return the JSON data.",
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": `data:${mimeType};base64,${base64Image}`
                    },
                },
            ],
        }
    ];

    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gemini-3-flash-preview",
        messages,
        response_format: { type: "json_object" },
    });

    const raw = response.choices[0].message.content;

    let parsed;

    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        throw new Error("AI did not return valid JSON");
    }
    
    return parsed;
}

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const isSeller = await authSeller(userId)

        if (!isSeller) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 })
        }

        const { base64Image, mimeType } = await request.json();
        
        if (!base64Image || !mimeType) {
            return NextResponse.json({ error: "Missing image data" }, { status: 400 })
        }

        const result = await main(base64Image, mimeType)
        
        return NextResponse.json({ ...result })

    } catch (error) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json(
            { error: error.code || error.message || "Failed to analyze image" }, 
            { status: 400 }
        )
    }
}