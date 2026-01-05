import React from 'react';
import { IdeaFilters, Domain, Complexity, TimeCommitment } from '../types';
import { Layout, Code, Briefcase, Heart, Globe } from 'lucide-react';

interface FiltersProps {
  filters: IdeaFilters;
  setFilters: React.Dispatch<React.SetStateAction<IdeaFilters>>;
  darkMode?: boolean;
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

const Filters: React.FC<FiltersProps> = ({ filters, setFilters, darkMode }) => {
  return (
    <div className={`w-full flex flex-col gap-6 md:gap-8 backdrop-blur-md p-6 rounded-3xl border ${darkMode ? 'bg-stone-800/40 border-stone-700' : 'bg-white/40 border-white/60'}`}>
      {/* Domains */}
      <div className="flex flex-wrap justify-center gap-3">
        {domains.map((d) => (
          <button
            key={d.id}
            onClick={() => setFilters(prev => ({ ...prev, domain: d.id }))}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              filters.domain === d.id 
                ? 'bg-[#FF91A4] text-white shadow-lg shadow-rose-200 scale-105' 
                : darkMode 
                  ? 'bg-stone-700 text-stone-300 hover:bg-stone-600 border border-stone-600'
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
          <label className={`text-xs font-bold uppercase tracking-widest px-2 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>Complexity</label>
          <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
            {complexities.map((c) => (
              <button
                key={c}
                onClick={() => setFilters(prev => ({ ...prev, complexity: c }))}
                className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
                  filters.complexity === c 
                    ? darkMode 
                      ? 'bg-stone-600 text-[#FF91A4] shadow-sm'
                      : 'bg-white text-[#FF91A4] shadow-sm'
                    : darkMode
                      ? 'text-stone-400 hover:text-stone-300'
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
          <label className={`text-xs font-bold uppercase tracking-widest px-2 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>Time Commitment</label>
          <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
            {times.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilters(prev => ({ ...prev, time: t.id }))}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  filters.time === t.id 
                    ? darkMode
                      ? 'bg-stone-600 text-[#FF91A4] shadow-sm'
                      : 'bg-white text-[#FF91A4] shadow-sm'
                    : darkMode
                      ? 'text-stone-400 hover:text-stone-300'
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