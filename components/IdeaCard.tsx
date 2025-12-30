
import React, { useState } from 'react';
import { SparkIdea } from '../types';
import { getTacticalDeepDive } from '../services/geminiService';
import { 
  Sparkles, Users, CheckCircle2, ArrowLeft, RefreshCw, 
  ExternalLink, Copy, Check, ThumbsUp, ThumbsDown, 
  Wrench, Zap, Info, Loader2, Bookmark
} from 'lucide-react';

interface IdeaCardProps {
  idea: SparkIdea;
  onNewIdea: () => void;
  onClose: () => void;
  onToggleBookmark: () => void;
  isBookmarked: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onNewIdea, onClose, onToggleBookmark, isBookmarked }) => {
  const [copied, setCopied] = useState(false);
  const [isDeepDiving, setIsDeepDiving] = useState(false);
  const [deepDive, setDeepDive] = useState<SparkIdea['tacticalDeepDive'] | null>(idea.tacticalDeepDive || null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleCopy = () => {
    const text = `💡 Spark Idea: ${idea.title}\n\n${idea.description}\n\nTarget Audience: ${idea.targetAudience}\n\nWhy it matters: ${idea.whyItMatters}\n\nRoadmap:\n${idea.roadmap.map((r, i) => `${i+1}. ${r.step}: ${r.detail}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThumbsUp = async () => {
    if (deepDive || isDeepDiving) return;
    setIsDeepDiving(true);
    setHasVoted(true);
    try {
      const result = await getTacticalDeepDive(idea);
      setDeepDive(result);
    } catch (error) {
      console.error("Deep dive failed", error);
    } finally {
      setIsDeepDiving(false);
    }
  };

  const handleThumbsDown = () => {
    setHasVoted(true);
    setTimeout(onNewIdea, 500);
  };

  return (
    <div className="w-full bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200 overflow-hidden border border-stone-100 animate-in zoom-in-95 fade-in duration-500">
      {/* Top Banner */}
      <div className="bg-stone-50 px-8 py-6 flex justify-between items-center border-b border-stone-100">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-400 hover:text-stone-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleBookmark}
            className={`p-2 rounded-full transition-all ${
              isBookmarked 
                ? 'bg-amber-100 text-amber-600 shadow-sm' 
                : 'hover:bg-stone-200 text-stone-400 hover:text-stone-600'
            }`}
            title={isBookmarked ? "Remove from favorites" : "Save to favorites"}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-400 hover:text-stone-600 relative"
            title="Copy as text"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
          <button 
            onClick={onNewIdea}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full font-semibold hover:bg-amber-600 transition-colors shadow-sm shadow-amber-100"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">New Spark</span>
          </button>
        </div>
      </div>

      <div className="p-8 md:p-12">
        {/* Title and Description */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3" />
            Build This Next
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6 leading-tight">
            {idea.title}
          </h2>
          <p className="text-xl text-stone-600 leading-relaxed max-w-2xl">
            {idea.description}
          </p>
        </div>

        {/* Quick Context Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
            <h3 className="text-stone-400 font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
              <Users className="w-3 h-3 text-orange-400" /> Target Audience
            </h3>
            <p className="text-stone-800 font-semibold leading-tight">
              {idea.targetAudience}
            </p>
          </div>
          <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100">
            <h3 className="text-stone-400 font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Key Value
            </h3>
            <p className="text-stone-800 font-semibold leading-tight">
              {idea.whyItMatters}
            </p>
          </div>
        </div>

        {/* Roadmap */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="text-xl font-bold text-stone-800">
              The Path to Launch
            </h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">MVP Roadmap</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {idea.roadmap.map((step, idx) => (
              <div key={idx} className="group p-6 rounded-2xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 group-hover:bg-amber-100 text-stone-500 group-hover:text-amber-600 flex items-center justify-center font-bold text-sm transition-colors">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-800 mb-1 group-hover:text-stone-900 transition-colors">{step.step}</h4>
                    <p className="text-sm text-stone-500 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Deep Dive Section */}
        {(isDeepDiving || deepDive) && (
          <div className="mt-12 p-8 bg-stone-900 rounded-[2rem] text-white shadow-xl animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Wrench className="w-6 h-6 text-amber-400" />
                Tactical Deep Dive
              </h3>
              <div className="px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest border border-amber-500/30 rounded-full">
                PRN Generated
              </div>
            </div>

            {isDeepDiving ? (
              <div className="flex flex-col items-center py-12 space-y-4">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-stone-400 animate-pulse">Analyzing technical requirements...</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                  <h4 className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Info className="w-3 h-3" /> Project Resource Notes (PRN)
                  </h4>
                  <p className="text-stone-200 leading-relaxed font-medium">
                    {deepDive?.prn}
                  </p>
                </div>

                <div className="grid gap-4">
                  <h4 className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-2">Priority Action Items</h4>
                  {deepDive?.actionableItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-stone-200 text-sm font-semibold mb-1">{item.task}</p>
                        <p className="text-stone-400 text-xs">
                          <span className="text-amber-500/70 mr-1 italic">Try:</span> {item.toolSuggestion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voting & Sources Bar */}
        <div className="mt-12 pt-8 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ExternalLink className="w-3 h-3" /> Context & Market
            </h4>
            <div className="flex flex-wrap gap-3">
              {idea.sources?.slice(0, 3).map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                >
                  {source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title}
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-3xl border border-stone-100">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest px-2">Is this useful?</span>
            <div className="flex gap-2">
              <button 
                onClick={handleThumbsDown}
                disabled={hasVoted}
                className={`p-3 rounded-2xl transition-all ${
                  hasVoted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 text-stone-400 hover:text-red-500 active:scale-90 bg-white shadow-sm border border-stone-100'
                }`}
              >
                <ThumbsDown className="w-5 h-5" />
              </button>
              <button 
                onClick={handleThumbsUp}
                disabled={hasVoted || !!deepDive}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all ${
                  deepDive 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : hasVoted ? 'opacity-50 cursor-not-allowed' : 'bg-white hover:bg-green-50 text-stone-400 hover:text-green-600 shadow-sm border border-stone-100 active:scale-90'
                }`}
              >
                <ThumbsUp className={`w-5 h-5 ${deepDive ? 'text-white' : ''}`} />
                {!deepDive && <span className="text-xs font-bold">Deep Dive</span>}
                {deepDive && <span className="text-xs font-bold">Excellent</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;
