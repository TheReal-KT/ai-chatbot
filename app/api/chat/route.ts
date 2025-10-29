import { google } from '@ai-sdk/google'; 
import {
    convertToModelMessages,
    streamText,
    stepCountIs,
    tool,
    UIMessage,
} from 'ai'; 
import { z } from 'zod';
import YahooFinance from 'yahoo-finance2';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const systemInstructionText = [
        'You are a helpful assistant that is able to search the internet for information, and answer questions',
        'depending on user needs.',
        'Available tools:', 
        '- google search with help of SerpAPI',
        '- create new tasks based off user requests',
        '- get current stock price in USD',
        'You are to ensure to not mislead the user with information and only use the tools provided.',
    ].join('\n');

    const result = await streamText({ 
        model: google('gemini-2.5-flash'),
        messages: convertToModelMessages([
          { role: 'system', parts: [{ type: 'text', text: systemInstructionText }] },
          ...messages,
        ]),
        stopWhen: stepCountIs(8),
        tools: {
            googleSearch: tool({
                description: 'Search the internet for information.',
                inputSchema: z.object({
                    query: z.string().describe('Search query.'),
                }),
                execute: async ({ query }) => {
                    const apiKey = process.env.SERPAPI_API_KEY
                    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKey}`;
                    const response = await fetch(url); 
                    const data = await response.json();
                    return { results: data };
                },
            }),
            createTask: tool({
                description: 'Create a new task based off user request.',
                inputSchema: z.object({
                    task: z.string().describe('Task description.'),
                }),
                execute: async ({ task }) => {
                    return {
                        task,
                    };
                },
            }),
            getStockPrice: tool({
                description: 'Get current stock price in USD.',
                inputSchema: z.object({
                    stock: z.string().describe('Ticker symbol, e.g., "AAPL"'),
                }),
                execute: async ({ stock }) => {
                    const symbol = stock.trim().toUpperCase();
                    const yahoo = new YahooFinance(); 
                    const quote = await yahoo.quote(symbol);
                    const price = quote?.regularMarketPrice;
                    return {
                        stock: symbol,
                        price: price?.toFixed(2),
                        currency: 'USD',
                    };
                },
            }),
        },
    })
    return result.toUIMessageStreamResponse(); 
}
