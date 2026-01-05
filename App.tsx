import React, { useState, useEffect } from 'react';
import { generateSparkIdea } from './services/geminiService';
import { SparkIdea, IdeaFilters } from './types';
import IdeaCard from './components/IdeaCard';
import Filters from './components/Filters';
import SavedIdeas from './components/SavedIdeas';
import { Sparkles, History as HistoryIcon, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [currentIdea, setCurrentIdea] = useState<SparkIdea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [history, setHistory] = useState<SparkIdea[]>([]);
  const [favorites, setFavorites] = useState<SparkIdea[]>([]);
  
  const [filters, setFilters] = useState<IdeaFilters>({
    domain: 'any',
    complexity: 'moderate',
    time: 'month'
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('spark_history');
    const savedFavorites = localStorage.getItem('spark_favorites');
    const savedDarkMode = localStorage.getItem('spark_dark_mode');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
  }, []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('spark_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Sync to localStorage whenever history or favorites change
  useEffect(() => {
    localStorage.setItem('spark_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('spark_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSpark = async () => {
    setIsLoading(true);
    setCurrentIdea(null);
    try {
      const idea = await generateSparkIdea(filters);
      setCurrentIdea(idea);
      setHistory(prev => [idea, ...prev].slice(0, 20));
    } catch (error) {
      console.error("Spark failed:", error);
      alert("The spark flickered out... please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateIdea = (updatedIdea: SparkIdea) => {
    setCurrentIdea(updatedIdea);
    setHistory(prev => prev.map(i => i.id === updatedIdea.id ? updatedIdea : i));
    setFavorites(prev => prev.map(i => i.id === updatedIdea.id ? updatedIdea : i));
  };

  const toggleBookmark = (idea: SparkIdea) => {
    setFavorites(prev => {
      const isBookmarked = prev.some(item => item.id === idea.id);
      if (isBookmarked) {
        return prev.filter(item => item.id !== idea.id);
      } else {
        return [idea, ...prev];
      }
    });
  };

  const handleRemoveFromHistory = (id: string) => {
    setHistory(prev => prev.filter(idea => idea.id !== id));
  };

  const handleRemoveFromFavorites = (id: string) => {
    setFavorites(prev => prev.filter(idea => idea.id !== id));
  };

  const isBookmarked = currentIdea ? favorites.some(f => f.id === currentIdea.id) : false;

  return (
    <div className={`min-h-screen relative flex flex-col items-center p-4 md:p-8 overflow-x-hidden ${darkMode ? 'bg-stone-900 text-stone-100' : ''}`}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-40 ${darkMode ? 'bg-rose-900' : 'bg-rose-200'}`}></div>
        <div className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-40 ${darkMode ? 'bg-red-900' : 'bg-red-100'}`}></div>
      </div>

      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <button onClick={() => setCurrentIdea(null)} className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2.5 bg-[#FF91A4] rounded-xl shadow-lg shadow-[#FFCDD4] group-hover:rotate-12 transition-all duration-500">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-stone-100' : 'text-stone-800'}`}>Spark</h1>
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-all ${darkMode ? 'bg-stone-800 text-yellow-400 hover:bg-stone-700' : 'bg-white/80 text-stone-600 hover:bg-stone-50 border border-stone-200'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-full transition-all shadow-sm active:scale-95 ${darkMode ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700' : 'bg-white/80 border border-stone-200 text-stone-600 hover:bg-stone-50'}`}
          >
            <HistoryIcon className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Archive</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${darkMode ? 'bg-rose-900 text-rose-300' : 'bg-rose-100 text-rose-700'}`}>
              {favorites.length + history.length}
            </span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col items-center">
        {!currentIdea && !isLoading && (
          <div className="text-center py-16 md:py-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className={`text-4xl md:text-6xl font-serif leading-tight ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              Practical ideas.<br />Real roadmaps.<br /><span className="text-[#FF91A4] italic">Built for builders.</span>
            </h2>
            <p className={`text-lg max-w-md mx-auto leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              Skip the fluff. Get a grounded, actionable project idea tailored to your stack and timeline.
            </p>
          </div>
        )}

        {!currentIdea && !isLoading && (
          <div className="w-full mb-8 animate-in fade-in duration-1000 delay-300">
            <Filters filters={filters} setFilters={setFilters} darkMode={darkMode} />
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-rose-100 border-t-[#FF91A4] rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#FF91A4] animate-pulse" />
            </div>
            <p className={`font-medium animate-pulse text-xl ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Engineering your next build...</p>
          </div>
        )}

        {currentIdea && !isLoading && (
          <div className="w-full">
            <IdeaCard 
              idea={currentIdea} 
              onNewIdea={handleSpark} 
              onClose={() => setCurrentIdea(null)}
              onToggleBookmark={() => toggleBookmark(currentIdea)}
              onUpdateIdea={updateIdea}
              isBookmarked={isBookmarked}
              darkMode={darkMode}
            />
          </div>
        )}

        {!currentIdea && !isLoading && (
          <button
            onClick={handleSpark}
            className="group relative flex items-center justify-center gap-3 px-14 py-7 spark-gradient text-white rounded-[2rem] text-2xl font-bold shadow-2xl shadow-rose-300 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Sparkles className="w-7 h-7" />
            <span>Generate Spark</span>
          </button>
        )}
      </main>

      <SavedIdeas 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        favorites={favorites}
        history={history}
        onSelect={(idea) => {
          setCurrentIdea(idea);
          setIsDrawerOpen(false);
        }}
        onRemoveFavorite={handleRemoveFromFavorites}
        onRemoveHistory={handleRemoveFromHistory}
        darkMode={darkMode}
      />

      <footer className={`mt-auto pt-16 pb-8 text-sm flex items-center gap-8 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
        <span className="font-medium">© 2025 Spark Labs</span>
      </footer>
    </div>
  );
};

export default App;