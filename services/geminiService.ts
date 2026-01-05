import { GoogleGenAI, Type } from "@google/genai";
import { SparkIdea, IdeaFilters } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSparkIdea = async (filters: IdeaFilters): Promise<SparkIdea> => {
  const ai = getAI();
  
  const domainContext: Record<string, string> = {
    any: "any domain - surprise me with something trending",
    tech: "developer tools, APIs, browser extensions, CLI tools, automation scripts, or niche SaaS",
    creative: "tools for designers, musicians, writers, video creators, or artists - think Figma plugins, audio tools, content management",
    business: "B2B micro-SaaS, productivity tools, invoicing, scheduling, CRM for specific niches, or workflow automation",
    lifestyle: "health tracking, habit apps, local community tools, hobby management, or personal finance for specific situations"
  };

  const complexityContext: Record<string, string> = {
    simple: "MVP buildable in a weekend with basic CRUD operations, single API integration, or a browser extension. Think: a single-purpose tool that does one thing well.",
    moderate: "2-4 week build with user auth, database, maybe 2-3 integrations. Think: a focused SaaS with clear monetization.",
    advanced: "1-3 month build with multiple user roles, complex integrations, or real-time features. Think: platform-level product."
  };

  const timeContext: Record<string, string> = {
    weekend: "48-72 hours of focused work. Ship by Sunday night.",
    month: "4-6 weeks of part-time work (~10-15 hrs/week). Launchable MVP.",
    "long-term": "3-6 month commitment. Full product with growth potential."
  };

  const prompt = `You are a startup idea researcher. Search Reddit (r/SideProject, r/startups, r/indiehackers, r/Entrepreneur, r/SaaS), Product Hunt, Hacker News, and IndieHackers.com for REAL problems people are actively complaining about or requesting solutions for.

RESEARCH FOCUS:
- Domain: ${domainContext[filters.domain]}
- Complexity: ${complexityContext[filters.complexity]}
- Timeline: ${timeContext[filters.time]}

FIND IDEAS THAT:
1. Solve a SPECIFIC pain point mentioned in real online discussions
2. Target a NARROW audience (e.g., "Etsy sellers who ship internationally" not "e-commerce")
3. Have EXISTING demand - people are actively looking for solutions or using clunky workarounds
4. Can be built by 1-2 developers with standard web/mobile tech
5. Have clear monetization ($10-50/month subscription or one-time purchase)

AVOID:
- AI wrappers with no unique value
- Generic productivity apps (todo lists, note apps, habit trackers)
- Ideas requiring massive datasets or ML expertise
- Two-sided marketplaces (hard to bootstrap)
- Anything requiring regulatory approval (fintech, health)
- "Uber for X" or "Airbnb for Y" concepts

OUTPUT REQUIREMENTS:
- title: Catchy but descriptive product name
- description: 2 sentences explaining what it does and the core value prop
- targetAudience: SPECIFIC niche (job title + situation, e.g., "Freelance video editors who juggle multiple client projects")
- whyItMatters: The exact pain point in their words - what are they complaining about?
- roadmap: 4 concrete steps to ship this, with specific technologies and tasks

Base your idea on REAL discussions you find. Be specific and practical.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
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
      tools: [{ googleSearch: {} }]
    },
  });

  const data = JSON.parse(response.text || '{}');
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
  const ai = getAI();
  const prompt = `Provide a "Tactical Deep Dive" for this project: "${idea.title}" targeting "${idea.targetAudience}".
  
  Search for the best current tools and frameworks for this specific use case.
  
  Generate:
  1. "PRN" (Project Resource Notes): Recommend a SPECIFIC modern tech stack. Include exact libraries, not just "React" but "React + Zustand for state + React Query for data fetching". Justify each choice for this specific project.
  
  2. 4 "Actionable Items": Hyper-specific Day-1 tasks that a developer can start RIGHT NOW. Include:
     - Exact commands to run
     - Specific files to create
     - APIs to sign up for
     - Database schemas to design
  
  Be opinionated and specific. No generic advice.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
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
      tools: [{ googleSearch: {} }]
    },
  });

  return JSON.parse(response.text || '{}');
};