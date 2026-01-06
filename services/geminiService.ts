import { GoogleGenAI } from "@google/genai";
import { SparkIdea, IdeaFilters } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

// Helper to parse JSON that might be wrapped in markdown code blocks
const parseJSON = (text: string): any => {
  let cleaned = text.trim();
  // Remove markdown code block wrapper if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim());
};

export const generateSparkIdea = async (
  filters: IdeaFilters,
): Promise<SparkIdea> => {
  const ai = getAI();

  const domainContext: Record<string, string> = {
    any: "any domain - surprise me with something trending",
    tech: "developer tools, APIs, browser extensions, CLI tools, automation scripts, or niche SaaS",
    creative:
      "tools for designers, musicians, writers, video creators, or artists - think Figma plugins, audio tools, content management",
    business:
      "B2B micro-SaaS, productivity tools, invoicing, scheduling, CRM for specific niches, or workflow automation",
    lifestyle:
      "health tracking, habit apps, local community tools, hobby management, or personal finance for specific situations",
  };

  const complexityContext: Record<string, string> = {
    simple:
      "MVP buildable in a weekend with basic CRUD operations, single API integration, or a browser extension. Think: a single-purpose tool that does one thing well.",
    moderate:
      "2-4 week build with user auth, database, maybe 2-3 integrations. Think: a focused SaaS with clear monetization.",
    advanced:
      "1-3 month build with multiple user roles, complex integrations, or real-time features. Think: platform-level product.",
  };

  const timeContext: Record<string, string> = {
    weekend: "48-72 hours of focused work. Ship by Sunday night.",
    month: "4-6 weeks of part-time work (~10-15 hrs/week). Launchable MVP.",
    "long-term": "3-6 month commitment. Full product with growth potential.",
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

  console.log(
    "[Gemini] generateSparkIdea - Making request with web grounding enabled",
  );
  console.log("[Gemini] Config tools:", JSON.stringify([{ googleSearch: {} }]));

  const jsonInstruction = `

IMPORTANT: Respond with valid JSON only, no markdown formatting or code blocks.
Use this EXACT structure:
{
  "title": "Product Name",
  "description": "Two sentence description.",
  "targetAudience": "Specific audience description",
  "whyItMatters": "The pain point in their words",
  "roadmap": [
    {"step": "Step 1 title", "detail": "Detailed explanation"},
    {"step": "Step 2 title", "detail": "Detailed explanation"},
    {"step": "Step 3 title", "detail": "Detailed explanation"},
    {"step": "Step 4 title", "detail": "Detailed explanation"}
  ]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt + jsonInstruction,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  console.log("[Gemini] Response received");
  console.log(
    "[Gemini] Response candidates count:",
    response.candidates?.length || 0,
  );
  console.log(
    "[Gemini] Full groundingMetadata:",
    JSON.stringify(response.candidates?.[0]?.groundingMetadata, null, 2),
  );

  console.log("[Gemini] Raw response text:", response.text);
  const data = parseJSON(response.text || "{}");

  // Normalize roadmap to ensure it has step/detail format
  if (data.roadmap && Array.isArray(data.roadmap)) {
    data.roadmap = data.roadmap.map((item: any, idx: number) => {
      if (typeof item === "string") {
        return { step: `Step ${idx + 1}`, detail: item };
      }
      return {
        step: item.step || item.title || item.name || `Step ${idx + 1}`,
        detail:
          item.detail || item.description || item.details || item.content || "",
      };
    });
  }
  console.log(
    "[Gemini] Normalized roadmap:",
    JSON.stringify(data.roadmap, null, 2),
  );

  const groundingChunks =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks;

  console.log("[Gemini] Grounding chunks found:", groundingChunks?.length || 0);
  console.log(
    "[Gemini] Raw grounding chunks:",
    JSON.stringify(groundingChunks, null, 2),
  );

  // Extract better titles from URIs if title is generic
  const sources =
    groundingChunks
      ?.map((chunk: any) => {
        const uri = chunk.web?.uri || "";
        let title = chunk.web?.title || "";
        // If title is just a domain, try to extract something better from URI
        if (
          !title ||
          title === "reddit.com" ||
          title.match(/^[a-z]+\.(com|org|io)$/i)
        ) {
          try {
            const url = new URL(uri);
            title = url.hostname.replace("www.", "");
          } catch {
            title = "Source";
          }
        }
        return { title, uri };
      })
      .filter((s: any) => s.uri) || [];

  console.log("[Gemini] Parsed sources:", JSON.stringify(sources, null, 2));

  return {
    ...data,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    sources,
  };
};

export const getTacticalDeepDive = async (
  idea: SparkIdea,
): Promise<{
  prn: string;
  actionableItems: { task: string; toolSuggestion: string }[];
}> => {
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

  console.log(
    "[Gemini] getTacticalDeepDive - Making request with web grounding enabled",
  );
  console.log("[Gemini] Config tools:", JSON.stringify([{ googleSearch: {} }]));

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents:
      prompt +
      '\n\nIMPORTANT: Respond with valid JSON only, no markdown formatting. Use this exact structure: {"prn": "...", "actionableItems": [{"task": "...", "toolSuggestion": "..."}]}',
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  console.log("[Gemini] getTacticalDeepDive - Response received");
  console.log(
    "[Gemini] Response candidates count:",
    response.candidates?.length || 0,
  );
  console.log(
    "[Gemini] Full groundingMetadata:",
    JSON.stringify(response.candidates?.[0]?.groundingMetadata, null, 2),
  );
  console.log(
    "[Gemini] Grounding chunks found:",
    response.candidates?.[0]?.groundingMetadata?.groundingChunks?.length || 0,
  );

  console.log("[Gemini] Raw response text:", response.text);
  return parseJSON(response.text || "{}");
};
