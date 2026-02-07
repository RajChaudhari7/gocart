import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL, // 👈 Gemini OpenAI-compatible endpoint
});

export async function POST(req) {
  try {
    const {
      orderId,
      status,
      statusHistory,
      step,
      messages,
    } = await req.json();

    const systemPrompt = `
You are a professional e-commerce order support assistant.

Order ID: ${orderId}
Current Status: ${status}
Status History: ${JSON.stringify(statusHistory)}

Rules:
- Be short, clear, and friendly
- Explain tracking steps simply
- Reassure users if delays happen
- If Delivered, congratulate the user
`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.4,
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    return NextResponse.json(
      {
        reply:
          "Sorry 😕 I'm having trouble right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
