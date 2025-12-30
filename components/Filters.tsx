
import React from 'react';
import { IdeaFilters, Domain, Complexity, TimeCommitment } from '../types';
import { Layout, Code, Briefcase, Heart, Globe } from 'lucide-react';

interface FiltersProps {
  filters: IdeaFilters;
  setFilters: React.Dispatch<React.SetStateAction<IdeaFilters>>;
}

const domains: { id: Domain; label: string; icon: any }[] = [
  { id: 'any', label: 'Surprise Me', icon: Globe },
  { id: 'tech', label: 'Tech & AI', icon: Code },
  { id: 'creative', label: 'Creative Arts', icon: Layout },
  { id: 'business', label: 'Startup & Biz', icon: Briefcase },
  { id: 'lifestyle', label: 'Lifestyle', icon: Heart },
];

const complexities: Complexity[] = ['simple', 'moderate', 'advanced'];
const times: { id: TimeCommitment; label: string }[] = [
  { id: 'weekend', label: 'Weekend Hack' },
  { id: 'month', label: 'One Month Build' },
  { id: 'long-term', label: 'Legacy Project' },
];

const Filters: React.FC<FiltersProps> = ({ filters, setFilters }) => {
  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60">
      {/* Domains */}
      <div className="flex flex-wrap justify-center gap-3">
        {domains.map((d) => (
          <button
            key={d.id}
            onClick={() => setFilters(prev => ({ ...prev, domain: d.id }))}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              filters.domain === d.id 
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 scale-105' 
                : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-100'
            }`}
          >
            <d.icon className="w-4 h-4" />
            {d.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Complexity */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest px-2">Complexity</label>
          <div className="flex bg-stone-100 p-1 rounded-xl">
            {complexities.map((c) => (
              <button
                key={c}
                onClick={() => setFilters(prev => ({ ...prev, complexity: c }))}
                className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
                  filters.complexity === c 
                    ? 'bg-white text-amber-600 shadow-sm' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest px-2">Time Commitment</label>
          <div className="flex bg-stone-100 p-1 rounded-xl">
            {times.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilters(prev => ({ ...prev, time: t.id }))}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  filters.time === t.id 
                    ? 'bg-white text-amber-600 shadow-sm' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
