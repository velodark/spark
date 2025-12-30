
import { GoogleGenAI, Type } from "@google/genai";
import { SparkIdea, IdeaFilters } from "../types";

const ai = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSparkIdea = async (filters: IdeaFilters): Promise<SparkIdea> => {
  const model = ai().models;
  const prompt = `Generate a grounded, practical, and highly actionable project idea.
  Domain: ${filters.domain}
  Complexity: ${filters.complexity}
  Time Commitment: ${filters.time}

  CRITICAL GUIDELINES:
  - PRACTICALITY: Focus on solving a specific, annoying friction point in a real-world workflow or daily life.
  - FEASIBILITY: The idea must be buildable by 1-2 people using existing, accessible technology.
  - UTILITY-FIRST: Prioritize tools, micro-SaaS, or niche services over "high-concept" or sci-fi ideas.
  - REAL MARKET: Identify a specific, underserved group.
  
  AVOID:
  - Far-fetched or extremely generic ideas.

  Provide:
  1. A catchy but descriptive Title.
  2. A 2-3 sentence clear description.
  3. "Target Audience": Exactly who is this for?
  4. "Why it matters": The specific problem it solves.
  5. A 4-step roadmap to bring a V1 (MVP) to life.`;

  const response = await model.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          whyItMatters: { type: Type.STRING },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING },
                detail: { type: Type.STRING }
              },
              required: ['step', 'detail']
            }
          }
        },
        required: ['title', 'description', 'targetAudience', 'whyItMatters', 'roadmap']
      },
    },
  });

  const jsonStr = response.text || '{}';
  const data = JSON.parse(jsonStr);
  
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const sources = groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri || ''
  })).filter((s: any) => s.uri) || [];

  return {
    ...data,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    sources
  };
};

export const getTacticalDeepDive = async (idea: SparkIdea): Promise<{prn: string, actionableItems: {task: string, toolSuggestion: string}[]}> => {
  const model = ai().models;
  const prompt = `Provide a "Tactical Deep Dive" for the following project idea: "${idea.title} - ${idea.description}".
  
  Generate:
  1. "PRN" (Project Resource Notes): A concise technical summary of the core stack or resources needed (e.g., "Supabase for Auth/DB, Vercel for Hosting").
  2. 4 "Actionable Items": Highly specific "Day 1" tasks. Each should include a specific tool suggestion.
  
  Ensure the suggestions are modern, cost-effective, and pragmatic.`;

  const response = await model.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prn: { type: Type.STRING, description: "Technical resource summary" },
          actionableItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                toolSuggestion: { type: Type.STRING }
              },
              required: ['task', 'toolSuggestion']
            }
          }
        },
        required: ['prn', 'actionableItems']
      },
    },
  });

  const jsonStr = response.text || '{}';
  return JSON.parse(jsonStr);
};
