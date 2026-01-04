import { SparkIdea } from '../types';

/**
 * Compresses a SparkIdea for URL sharing by removing non-essential data
 */
interface ShareableIdea {
  t: string;  // title
  d: string;  // description
  a: string;  // targetAudience
  w: string;  // whyItMatters
  r: { s: string; d: string }[];  // roadmap (step, detail)
  s?: { t: string; u: string }[]; // sources (title, uri)
}

/**
 * Encodes a SparkIdea into a URL-safe string
 */
export function encodeIdea(idea: SparkIdea): string {
  const shareable: ShareableIdea = {
    t: idea.title,
    d: idea.description,
    a: idea.targetAudience,
    w: idea.whyItMatters,
    r: idea.roadmap.map(step => ({ s: step.step, d: step.detail })),
  };

  // Only include sources if they exist
  if (idea.sources && idea.sources.length > 0) {
    shareable.s = idea.sources.slice(0, 3).map(src => ({ t: src.title, u: src.uri }));
  }

  const json = JSON.stringify(shareable);
  // Use base64 encoding and make it URL-safe
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes a URL-safe string back into a SparkIdea
 */
export function decodeIdea(encoded: string): SparkIdea | null {
  try {
    // Restore base64 padding and characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const json = decodeURIComponent(escape(atob(base64)));
    const shareable: ShareableIdea = JSON.parse(json);

    const idea: SparkIdea = {
      id: `shared-${Date.now()}`,
      title: shareable.t,
      description: shareable.d,
      targetAudience: shareable.a,
      whyItMatters: shareable.w,
      roadmap: shareable.r.map(step => ({ step: step.s, detail: step.d })),
      timestamp: Date.now(),
    };

    if (shareable.s && shareable.s.length > 0) {
      idea.sources = shareable.s.map(src => ({ title: src.t, uri: src.u }));
    }

    return idea;
  } catch (error) {
    console.error('Failed to decode shared idea:', error);
    return null;
  }
}

/**
 * Creates a shareable URL for an idea
 */
export function createShareableUrl(idea: SparkIdea): string {
  const encoded = encodeIdea(idea);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?idea=${encoded}`;
}

/**
 * Extracts an encoded idea from the current URL
 */
export function getSharedIdeaFromUrl(): SparkIdea | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('idea');

  if (!encoded) {
    return null;
  }

  return decodeIdea(encoded);
}

/**
 * Clears the shared idea from the URL without page reload
 */
export function clearSharedIdeaFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('idea');
  window.history.replaceState({}, '', url.pathname);
}
