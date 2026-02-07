import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req) {
  try {
    const {
      orderId,
      status,
      statusHistory,
      messages,
    } = await req.json();

    const systemPrompt = `
You are an e-commerce order support assistant.

Order ID: ${orderId}
Current Status: ${status}
Status History: ${JSON.stringify(statusHistory)}

Answer clearly and politely.
Explain tracking steps if asked.
`;

    // 🔥 USE RESPONSES API (Gemini-compatible)
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.4,
    });

    return NextResponse.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("GEMINI ERROR:", error);

    return NextResponse.json(
      {
        reply:
          "Sorry 😕 I couldn’t fetch the details right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
