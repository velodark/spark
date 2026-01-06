import React, { useState } from "react";
import { SparkIdea } from "../types";
import { getTacticalDeepDive } from "../services/geminiService";
import {
  Sparkles,
  Users,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Wrench,
  Zap,
  Info,
  Loader2,
  Bookmark,
} from "lucide-react";

interface IdeaCardProps {
  idea: SparkIdea;
  onNewIdea: () => void;
  onClose: () => void;
  onToggleBookmark: () => void;
  onUpdateIdea: (idea: SparkIdea) => void;
  isBookmarked: boolean;
  darkMode?: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onNewIdea,
  onClose,
  onToggleBookmark,
  onUpdateIdea,
  isBookmarked,
  darkMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDeepDiving, setIsDeepDiving] = useState(false);
  const [hasVoted, setHasVoted] = useState(!!idea.tacticalDeepDive);

  const handleCopy = () => {
    const text = `💡 Spark Idea: ${idea.title}\n\n${idea.description}\n\nTarget Audience: ${idea.targetAudience}\n\nRoadmap:\n${idea.roadmap.map((r, i) => `${i + 1}. ${r.step}: ${r.detail}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThumbsUp = async () => {
    if (idea.tacticalDeepDive || isDeepDiving) return;
    setIsDeepDiving(true);
    setHasVoted(true);
    // Also save to favorites when user likes the idea
    if (!isBookmarked) {
      onToggleBookmark();
    }
    try {
      const result = await getTacticalDeepDive(idea);
      onUpdateIdea({ ...idea, tacticalDeepDive: result });
    } catch (error) {
      console.error("Deep dive generation failed", error);
    } finally {
      setIsDeepDiving(false);
    }
  };

  const handleThumbsDown = () => {
    setHasVoted(true);
    setTimeout(onNewIdea, 500);
  };

  return (
    <div
      className={`w-full rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500 ${darkMode ? "bg-stone-800 shadow-stone-900 border border-stone-700" : "bg-white shadow-stone-200 border border-stone-100"}`}
    >
      <div
        className={`px-8 py-6 flex justify-between items-center border-b ${darkMode ? "bg-stone-800 border-stone-700" : "bg-stone-50 border-stone-100"}`}
      >
        <button
          onClick={onClose}
          className={`p-2.5 rounded-full transition-colors active:scale-90 ${darkMode ? "hover:bg-stone-700 text-stone-400 hover:text-stone-200" : "hover:bg-stone-200 text-stone-400 hover:text-stone-600"}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleBookmark}
            className={`p-2.5 rounded-full transition-all active:scale-90 ${
              isBookmarked
                ? "bg-rose-100 text-[#FF91A4] shadow-inner"
                : darkMode
                  ? "hover:bg-stone-700 text-stone-400 hover:text-stone-200"
                  : "hover:bg-stone-200 text-stone-400 hover:text-stone-600"
            }`}
            title={isBookmarked ? "Saved to Favorites" : "Save to Favorites"}
          >
            <Bookmark
              className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
            />
          </button>
          <button
            onClick={handleCopy}
            className={`p-2.5 rounded-full transition-colors ${darkMode ? "hover:bg-stone-700 text-stone-400 hover:text-stone-200" : "hover:bg-stone-200 text-stone-400 hover:text-stone-600"}`}
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onNewIdea}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF91A4] text-white rounded-full font-bold hover:bg-[#e8637a] transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-8 md:p-12">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 text-[#FF91A4] rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            Validated Solution
          </div>
          <h2
            className={`text-4xl md:text-5xl font-serif mb-6 leading-[1.15] ${darkMode ? "text-stone-100" : "text-stone-900"}`}
          >
            {idea.title}
          </h2>
          <p
            className={`text-xl leading-relaxed max-w-2xl font-light ${darkMode ? "text-stone-300" : "text-stone-600"}`}
          >
            {idea.description}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <div
            className={`p-6 rounded-3xl border flex flex-col justify-center ${darkMode ? "bg-rose-900/20 border-rose-800" : "bg-rose-50/50 border-rose-100"}`}
          >
            <h3
              className={`font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2 ${darkMode ? "text-stone-400" : "text-stone-400"}`}
            >
              <Users className="w-3 h-3 text-[#FF91A4]" /> Market Niche
            </h3>
            <p
              className={`font-bold text-lg leading-tight ${darkMode ? "text-stone-200" : "text-stone-800"}`}
            >
              {idea.targetAudience}
            </p>
          </div>
          <div
            className={`p-6 rounded-3xl border flex flex-col justify-center ${darkMode ? "bg-stone-700/50 border-stone-600" : "bg-stone-50 border-stone-100"}`}
          >
            <h3
              className={`font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2 ${darkMode ? "text-stone-400" : "text-stone-400"}`}
            >
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Utility Focus
            </h3>
            <p
              className={`font-bold text-lg leading-tight ${darkMode ? "text-stone-200" : "text-stone-800"}`}
            >
              {idea.whyItMatters}
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <div
            className={`flex items-center justify-between border-b pb-5 ${darkMode ? "border-stone-700" : "border-stone-100"}`}
          >
            <h3
              className={`text-2xl font-bold ${darkMode ? "text-stone-100" : "text-stone-800"}`}
            >
              The Build Roadmap
            </h3>
            <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
              Execution Plan
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {idea.roadmap.map((step, idx) => (
              <div
                key={idx}
                className={`group p-6 rounded-[2rem] border transition-all duration-300 ${darkMode ? "border-stone-700 hover:border-rose-700 hover:bg-rose-900/10" : "border-stone-100 hover:border-rose-200 hover:bg-rose-50/20"}`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg transition-colors ${darkMode ? "bg-stone-700 group-hover:bg-[#FF91A4] group-hover:text-white text-stone-400" : "bg-stone-100 group-hover:bg-[#FF91A4] group-hover:text-white text-stone-500"}`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h4
                      className={`font-bold mb-2 transition-colors ${darkMode ? "text-stone-200 group-hover:text-[#FF91A4]" : "text-stone-800 group-hover:text-[#FF91A4]"}`}
                    >
                      {step.step}
                    </h4>
                    <p
                      className={`text-sm leading-relaxed font-medium ${darkMode ? "text-stone-400" : "text-stone-500"}`}
                    >
                      {step.detail}
                    </p>
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
                <div className="p-2 bg-[#FF91A4] rounded-lg">
                  <Wrench className="w-5 h-5 text-stone-950" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Tactical Briefing
                </h3>
              </div>
              <div className="px-3 py-1 bg-[#FF91A4]/10 text-[#FF91A4] text-[10px] font-bold uppercase tracking-widest border border-[#FF91A4]/20 rounded-full">
                PRN-01 Active
              </div>
            </div>

            {isDeepDiving ? (
              <div className="flex flex-col items-center py-16 space-y-6">
                <Loader2 className="w-10 h-10 text-[#FF91A4] animate-spin" />
                <div className="text-center">
                  <p className="text-stone-400 font-mono text-xs uppercase tracking-[0.2em] mb-2">
                    Analyzing Dependencies...
                  </p>
                  <p className="text-stone-600 text-xs italic">
                    Searching for best-in-class tool suggestions
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Info className="w-16 h-16" />
                  </div>
                  <h4 className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#FF91A4]" /> Project Resource
                    Notes
                  </h4>
                  <p className="text-rose-100 leading-relaxed font-mono text-sm">
                    {idea.tacticalDeepDive?.prn}
                  </p>
                </div>

                <div className="grid gap-4">
                  <h4 className="text-stone-500 text-[10px] font-bold uppercase tracking-widest px-2">
                    First 24-Hour Backlog
                  </h4>
                  <div className="grid gap-3">
                    {idea.tacticalDeepDive?.actionableItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/task cursor-default"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#FF91A4]/10 flex items-center justify-center group-hover/task:bg-[#FF91A4]/20 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-[#FF91A4]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-stone-200 text-sm font-bold mb-0.5 group-hover/task:text-white transition-colors">
                            {item.task}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-stone-500 uppercase">
                              Stack:
                            </span>
                            <span className="text-[#FF91A4] text-[10px] font-mono font-bold tracking-tight">
                              {item.toolSuggestion}
                            </span>
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

        <div
          className={`mt-16 pt-10 border-t flex flex-col md:flex-row md:items-end justify-between gap-10 ${darkMode ? "border-stone-700" : "border-stone-100"}`}
        >
          <div className="flex-1">
            <h4
              className={`text-[10px] font-bold uppercase tracking-widest mb-5 flex items-center gap-2 ${darkMode ? "text-stone-500" : "text-stone-400"}`}
            >
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${darkMode ? "bg-stone-700 hover:bg-stone-600 text-stone-300 border-stone-600" : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-100"}`}
                  >
                    {source.title.length > 20
                      ? source.title.substring(0, 20) + "..."
                      : source.title}
                    <ExternalLink className="w-3 h-3 opacity-40" />
                  </a>
                ))
              ) : (
                <span
                  className={`text-xs italic ${darkMode ? "text-stone-500" : "text-stone-400"}`}
                >
                  Synthesized from knowledge base
                </span>
              )}
            </div>
          </div>

          <div
            className={`flex items-center gap-5 p-5 rounded-[2.5rem] border shadow-sm ${darkMode ? "bg-stone-700 border-stone-600" : "bg-stone-50 border-stone-100"}`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.2em] pl-3 ${darkMode ? "text-stone-400" : "text-stone-400"}`}
            >
              Rate Idea
            </span>
            <div className="flex gap-3">
              <button
                onClick={handleThumbsDown}
                disabled={hasVoted}
                className={`p-4 rounded-2xl transition-all shadow-sm ${
                  hasVoted
                    ? "opacity-30"
                    : darkMode
                      ? "hover:bg-red-900/30 text-stone-400 hover:text-red-400 bg-stone-600 border border-stone-500 active:scale-90"
                      : "hover:bg-red-50 text-stone-400 hover:text-red-500 bg-white border border-stone-100 active:scale-90"
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
                    ? "bg-green-500 text-white shadow-green-100"
                    : hasVoted
                      ? "opacity-30"
                      : darkMode
                        ? "bg-stone-600 hover:bg-green-900/30 text-stone-400 hover:text-green-400 border border-stone-500 active:scale-95"
                        : "bg-white hover:bg-green-50 text-stone-400 hover:text-green-600 border border-stone-100 active:scale-95"
                }`}
                title="This is brilliant - Give me the specs"
              >
                <ThumbsUp className="w-6 h-6" />
                {!idea.tacticalDeepDive && (
                  <span className="text-sm">Technical Specs</span>
                )}
                {idea.tacticalDeepDive && (
                  <span className="text-sm">Saved to Archive</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;
