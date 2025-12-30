
import { GoogleGenAI, Type } from "@google/genai";
import { SparkIdea, IdeaFilters } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSparkIdea = async (filters: IdeaFilters): Promise<SparkIdea> => {
  const ai = getAI();
  const prompt = `Generate a grounded, practical, and highly actionable project idea.
  Domain: ${filters.domain}
  Complexity: ${filters.complexity}
  Time Commitment: ${filters.time}

  CRITICAL GUIDELINES:
  - PRACTICALITY: Focus on solving a specific, real-world friction point for a niche group.
  - FEASIBILITY: Must be buildable by 1-2 people using accessible tech (web/mobile).
  - UTILITY-FIRST: Prioritize niche SaaS, internal tools, or specialized utilities.
  - REAL MARKET: Identify an underserved audience (e.g., "Small law firms," "Indie game devs," "Local bakery owners").
  
  AVOID:
  - Sci-fi concepts, generic to-do apps, or ideas requiring massive capital.

  Format: JSON object with title, description (2 sentences), targetAudience, whyItMatters (the core pain point), and roadmap (4 steps with details).`;

  const response = await ai.models.generateContent({
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

  const data = JSON.parse(response.text || '{}');
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const sources = groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Market Context',
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
  const ai = getAI();
  const prompt = `Provide a "Tactical Deep Dive" for this project: "${idea.title}".
  
  Generate:
  1. "PRN" (Project Resource Notes): Recommend a modern, pragmatic technical stack (e.g., "React + Tailwind + Supabase for persistence and auth").
  2. 4 "Actionable Items": Highly specific Day-1 tasks (e.g., "Initialize a Vite project," "Set up the database schema for XYZ").
  
  Keep it technical, realistic, and developer-focused.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prn: { type: Type.STRING },
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

  return JSON.parse(response.text || '{}');
};
