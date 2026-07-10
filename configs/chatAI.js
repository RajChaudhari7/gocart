import OpenAI from "openai";

export const chatAI = new OpenAI({
    apiKey: process.env.CHAT_AI_API_KEY,
    baseURL: process.env.CHAT_AI_BASE_URL,
});