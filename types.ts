
export type Domain = 'tech' | 'creative' | 'business' | 'lifestyle' | 'any';
export type Complexity = 'simple' | 'moderate' | 'advanced';
export type TimeCommitment = 'weekend' | 'month' | 'long-term';

export interface IdeaFilters {
  domain: Domain;
  complexity: Complexity;
  time: TimeCommitment;
}

export interface RoadmapStep {
  step: string;
  detail: string;
}

export interface TacticalItem {
  task: string;
  toolSuggestion: string;
}

export interface SparkIdea {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  whyItMatters: string;
  roadmap: RoadmapStep[];
  timestamp: number;
  sources?: { title: string; uri: string }[];
  tacticalDeepDive?: {
    prn: string; // Project Resource Notes
    actionableItems: TacticalItem[];
  };
}
