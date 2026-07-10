import OpenAI from "openai";

export const searchAI = new OpenAI({
    apiKey: process.env.SEARCH_AI_API_KEY,
    baseURL: process.env.SEARCH_AI_BASE_URL,
});