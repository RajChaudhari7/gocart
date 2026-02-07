import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const body = await req.json();
  const { orderId, status, statusHistory, step, messages } = body;

  const systemPrompt = `
You are a helpful e-commerce order support assistant.

Order ID: ${orderId}
Current Status: ${status}
Status History: ${JSON.stringify(statusHistory)}

If the user clicks a tracking step, explain it clearly.
Be friendly, short, and reassuring.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  return NextResponse.json({
    reply: completion.choices[0].message.content,
  });
}
