import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      orderId,
      status,
      statusHistory,
      messages,
    } = await req.json();

    const prompt = `
You are an e-commerce order support assistant.

Order ID: ${orderId}
Current Status: ${status}
Status History: ${JSON.stringify(statusHistory)}

Conversation:
${messages
  .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
  .join("\n")}

Rules:
- Be clear and polite
- Answer in simple language
- Explain order steps if asked
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.OPENAI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("GEMINI RAW ERROR:", data);
      throw new Error("Gemini request failed");
    }

    return NextResponse.json({
      reply:
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I couldn’t understand that. Please try again.",
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    return NextResponse.json(
      {
        reply:
          "Sorry 😕 I’m having trouble right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
