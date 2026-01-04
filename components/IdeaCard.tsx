
import React, { useState } from 'react';
import { SparkIdea } from '../types';
import { getTacticalDeepDive } from '../services/geminiService';
import {
  Sparkles, Users, CheckCircle2, ArrowLeft, RefreshCw,
  ExternalLink, Copy, Check, ThumbsUp, ThumbsDown,
  Wrench, Zap, Info, Loader2, Bookmark, Share2
} from 'lucide-react';
import { createShareableUrl } from '../utils/shareUtils';

interface IdeaCardProps {
  idea: SparkIdea;
  onNewIdea: () => void;
  onClose: () => void;
  onToggleBookmark: () => void;
  onUpdateIdea: (idea: SparkIdea) => void;
  isBookmarked: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onNewIdea, onClose, onToggleBookmark, onUpdateIdea, isBookmarked }) => {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isDeepDiving, setIsDeepDiving] = useState(false);
  const [hasVoted, setHasVoted] = useState(!!idea.tacticalDeepDive);

  const handleCopy = () => {
    const text = `💡 Spark Idea: ${idea.title}\n\n${idea.description}\n\nTarget Audience: ${idea.targetAudience}\n\nRoadmap:\n${idea.roadmap.map((r, i) => `${i+1}. ${r.step}: ${r.detail}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = createShareableUrl(idea);
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleThumbsUp = async () => {
    if (idea.tacticalDeepDive || isDeepDiving) return;
    setIsDeepDiving(true);
    setHasVoted(true);
    try {
      const result = await getTacticalDeepDive(idea);
      // PERSISTENCE: Update the idea object globally so it's saved in History/Favorites
      onUpdateIdea({ ...idea, tacticalDeepDive: result });
    } catch (error) {
      console.error("Deep dive generation failed", error);
    } finally {
      setIsDeepDiving(false);
    }
  };

  const handleThumbsDown = () => {
    setHasVoted(true);
    // Briefly show the feedback before starting over
    setTimeout(onNewIdea, 500);
  };

  return (
    <div className="w-full bg-white rounded-[3rem] shadow-2xl shadow-stone-200 overflow-hidden border border-stone-100 animate-in zoom-in-95 fade-in duration-500">
      <div className="bg-stone-50 px-8 py-6 flex justify-between items-center border-b border-stone-100">
        <button 
          onClick={onClose}
          className="p-2.5 hover:bg-stone-200 rounded-full transition-colors text-stone-400 hover:text-stone-600 active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleBookmark}
            className={`p-2.5 rounded-full transition-all active:scale-90 ${
              isBookmarked 
                ? 'bg-amber-100 text-amber-600 shadow-inner' 
                : 'hover:bg-stone-200 text-stone-400 hover:text-stone-600'
            }`}
            title={isBookmarked ? "Saved to Favorites" : "Save to Favorites"}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className={`p-2.5 rounded-full transition-all ${
              linkCopied
                ? 'bg-green-100 text-green-600'
                : 'hover:bg-stone-200 text-stone-400 hover:text-stone-600'
            }`}
            title={linkCopied ? "Link copied!" : "Copy shareable link"}
          >
            {linkCopied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-2.5 hover:bg-stone-200 rounded-full transition-colors text-stone-400 hover:text-stone-600"
            title="Copy as text"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
          <button 
            onClick={onNewIdea}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600 transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-8 md:p-12">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            Validated Solution
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6 leading-[1.15]">
            {idea.title}
          </h2>
          <p className="text-xl text-stone-600 leading-relaxed max-w-2xl font-light">
            {idea.description}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100 flex flex-col justify-center">
            <h3 className="text-stone-400 font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
              <Users className="w-3 h-3 text-orange-400" /> Market Niche
            </h3>
            <p className="text-stone-800 font-bold text-lg leading-tight">
              {idea.targetAudience}
            </p>
          </div>
          <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 flex flex-col justify-center">
            <h3 className="text-stone-400 font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Utility Focus
            </h3>
            <p className="text-stone-800 font-bold text-lg leading-tight">
              {idea.whyItMatters}
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-stone-100 pb-5">
            <h3 className="text-2xl font-bold text-stone-800">The Build Roadmap</h3>
            <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">Execution Plan</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {idea.roadmap.map((step, idx) => (
              <div key={idx} className="group p-6 rounded-[2rem] border border-stone-100 hover:border-amber-200 hover:bg-amber-50/20 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-stone-100 group-hover:bg-amber-500 group-hover:text-white text-stone-500 flex items-center justify-center font-bold text-lg transition-colors">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-800 mb-2 group-hover:text-amber-700 transition-colors">{step.step}</h4>
                    <p className="text-sm text-stone-500 leading-relaxed font-medium">{step.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(isDeepDiving || idea.tacticalDeepDive) && (
          <div className="mt-16 p-8 md:p-10 bg-stone-950 rounded-[2.5rem] text-white shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Wrench className="w-5 h-5 text-stone-950" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Tactical Briefing</h3>
              </div>
              <div className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20 rounded-full">
                PRN-01 Active
              </div>
            </div>

            {isDeepDiving ? (
              <div className="flex flex-col items-center py-16 space-y-6">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                <div className="text-center">
                  <p className="text-stone-400 font-mono text-xs uppercase tracking-[0.2em] mb-2">Analyzing Dependencies...</p>
                  <p className="text-stone-600 text-xs italic">Searching for best-in-class tool suggestions</p>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Info className="w-16 h-16" />
                  </div>
                  <h4 className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-400" /> Project Resource Notes
                  </h4>
                  <p className="text-amber-100 leading-relaxed font-mono text-sm">
                    {idea.tacticalDeepDive?.prn}
                  </p>
                </div>

                <div className="grid gap-4">
                  <h4 className="text-stone-500 text-[10px] font-bold uppercase tracking-widest px-2">First 24-Hour Backlog</h4>
                  <div className="grid gap-3">
                    {idea.tacticalDeepDive?.actionableItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/task cursor-default">
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover/task:bg-amber-500/20 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-stone-200 text-sm font-bold mb-0.5 group-hover/task:text-white transition-colors">{item.task}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-stone-500 uppercase">Stack:</span>
                            <span className="text-amber-400/80 text-[10px] font-mono font-bold tracking-tight">{item.toolSuggestion}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-16 pt-10 border-t border-stone-100 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex-1">
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <ExternalLink className="w-3 h-3" /> Data Sources & Context
            </h4>
            <div className="flex flex-wrap gap-3">
              {idea.sources && idea.sources.length > 0 ? (
                idea.sources.slice(0, 3).map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-stone-100"
                  >
                    {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}
                    <ExternalLink className="w-3 h-3 opacity-40" />
                  </a>
                ))
              ) : (
                <span className="text-xs text-stone-400 italic">Synthesized from knowledge base</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 bg-stone-50 p-5 rounded-[2.5rem] border border-stone-100 shadow-sm">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] pl-3">Rate Idea</span>
            <div className="flex gap-3">
              <button 
                onClick={handleThumbsDown}
                disabled={hasVoted}
                className={`p-4 rounded-2xl transition-all shadow-sm ${
                  hasVoted ? 'opacity-30' : 'hover:bg-red-50 text-stone-400 hover:text-red-500 bg-white border border-stone-100 active:scale-90'
                }`}
                title="Not for me"
              >
                <ThumbsDown className="w-6 h-6" />
              </button>
              <button 
                onClick={handleThumbsUp}
                disabled={hasVoted || !!idea.tacticalDeepDive}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-md ${
                  idea.tacticalDeepDive 
                    ? 'bg-green-500 text-white shadow-green-100' 
                    : hasVoted ? 'opacity-30' : 'bg-white hover:bg-green-50 text-stone-400 hover:text-green-600 border border-stone-100 active:scale-95'
                }`}
                title="This is brilliant - Give me the specs"
              >
                <ThumbsUp className="w-6 h-6" />
                {!idea.tacticalDeepDive && <span className="text-sm">Technical Specs</span>}
                {idea.tacticalDeepDive && <span className="text-sm">Saved to Archive</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;
