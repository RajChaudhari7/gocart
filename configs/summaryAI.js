import OpenAI from "openai";

export const summaryAI = new OpenAI({
    apiKey: process.env.SUMMARY_AI_API_KEY,
    baseURL: process.env.SUMMARY_AI_BASE_URL,
});