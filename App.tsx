
import React, { useState, useEffect } from 'react';
import { generateSparkIdea } from './services/geminiService';
import { SparkIdea, IdeaFilters } from './types';
import IdeaCard from './components/IdeaCard';
import Filters from './components/Filters';
import SavedIdeas from './components/SavedIdeas';
import { Sparkles, History as HistoryIcon, Github, Share2 } from 'lucide-react';
import { getSharedIdeaFromUrl, clearSharedIdeaFromUrl } from './utils/shareUtils';

const App: React.FC = () => {
  const [currentIdea, setCurrentIdea] = useState<SparkIdea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSharedIdea, setIsSharedIdea] = useState(false);

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
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // Check for shared idea in URL on mount
  useEffect(() => {
    const sharedIdea = getSharedIdeaFromUrl();
    if (sharedIdea) {
      setCurrentIdea(sharedIdea);
      setIsSharedIdea(true);
      clearSharedIdeaFromUrl();
    }
  }, []);

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
    setIsSharedIdea(false);
    try {
      const idea = await generateSparkIdea(filters);
      setCurrentIdea(idea);
      setHistory(prev => [idea, ...prev].slice(0, 20)); // Keep history at 20 items
    } catch (error) {
      console.error("Spark failed:", error);
      alert("The spark flickered out... please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates an existing idea with new data (like a technical deep dive).
   * This ensures the updated data is reflected in history and favorites.
   */
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
    <div className="min-h-screen relative flex flex-col items-center p-4 md:p-8 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-amber-100 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-[120px] opacity-40"></div>
      </div>

      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="p-2.5 bg-amber-500 rounded-xl shadow-lg shadow-amber-200 group-hover:rotate-12 transition-all duration-500">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-800">Spark</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-stone-200 rounded-full text-stone-600 hover:bg-stone-50 transition-all shadow-sm active:scale-95"
          >
            <HistoryIcon className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Archive</span>
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {favorites.length + history.length}
            </span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col items-center">
        {!currentIdea && !isLoading && (
          <div className="text-center py-16 md:py-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight">
              Practical ideas.<br />Real roadmaps.<br /><span className="text-amber-600 italic">Built for builders.</span>
            </h2>
            <p className="text-lg text-stone-500 max-w-md mx-auto leading-relaxed">
              Skip the fluff. Get a grounded, actionable project idea tailored to your stack and timeline.
            </p>
          </div>
        )}

        {!currentIdea && !isLoading && (
          <div className="w-full mb-8 animate-in fade-in duration-1000 delay-300">
            <Filters filters={filters} setFilters={setFilters} />
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <p className="text-stone-500 font-medium animate-pulse text-xl">Engineering your next build...</p>
          </div>
        )}

        {currentIdea && !isLoading && (
          <div className="w-full">
            {isSharedIdea && (
              <div className="mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-500">
                <Share2 className="w-4 h-4" />
                <span>Shared idea - save it to your favorites!</span>
              </div>
            )}
            <IdeaCard
              idea={currentIdea}
              onNewIdea={handleSpark}
              onClose={() => {
                setCurrentIdea(null);
                setIsSharedIdea(false);
              }}
              onToggleBookmark={() => toggleBookmark(currentIdea)}
              onUpdateIdea={updateIdea}
              isBookmarked={isBookmarked}
            />
          </div>
        )}

        {!currentIdea && !isLoading && (
          <button
            onClick={handleSpark}
            className="group relative flex items-center justify-center gap-3 px-14 py-7 spark-gradient text-white rounded-[2rem] text-2xl font-bold shadow-2xl shadow-orange-300 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
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
      />

      <footer className="mt-auto pt-16 pb-8 text-stone-400 text-sm flex items-center gap-8">
        <span className="font-medium">© 2024 Spark Labs</span>
        <a href="https://github.com" className="hover:text-amber-500 transition-colors flex items-center gap-2">
          <Github className="w-4 h-4" /> Open Source
        </a>
      </footer>
    </div>
  );
};

export default App;
