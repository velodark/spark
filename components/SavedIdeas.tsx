import React, { useState } from 'react';
import { SparkIdea } from '../types';
import { X, Trash2, Calendar, ChevronRight, Bookmark, Clock } from 'lucide-react';

interface SavedIdeasProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: SparkIdea[];
  history: SparkIdea[];
  onSelect: (idea: SparkIdea) => void;
  onRemoveFavorite: (id: string) => void;
  onRemoveHistory: (id: string) => void;
  darkMode?: boolean;
}

const SavedIdeas: React.FC<SavedIdeasProps> = ({ 
  isOpen, 
  onClose, 
  favorites, 
  history, 
  onSelect, 
  onRemoveFavorite, 
  onRemoveHistory,
  darkMode
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  if (!isOpen) return null;

  const currentList = activeTab === 'favorites' ? favorites : history;
  const onRemove = activeTab === 'favorites' ? onRemoveFavorite : onRemoveHistory;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`relative w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ${darkMode ? 'bg-stone-800' : 'bg-stone-50'}`}>
        <div className={`p-6 border-b ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-stone-100' : 'text-stone-800'}`}>
              <Clock className="w-5 h-5 text-[#FF91A4]" />
              Activity Archive
            </h3>
            <button onClick={onClose} className={`p-2 rounded-full ${darkMode ? 'hover:bg-stone-700 text-stone-400' : 'hover:bg-stone-100 text-stone-400'}`}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Control */}
          <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'favorites' 
                  ? darkMode 
                    ? 'bg-stone-600 text-[#FF91A4] shadow-sm'
                    : 'bg-white text-[#FF91A4] shadow-sm'
                  : darkMode
                    ? 'text-stone-400 hover:text-stone-300'
                    : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Saved ({favorites.length})
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'history' 
                  ? darkMode
                    ? 'bg-stone-600 text-[#FF91A4] shadow-sm'
                    : 'bg-white text-[#FF91A4] shadow-sm'
                  : darkMode
                    ? 'text-stone-400 hover:text-stone-300'
                    : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Clock className="w-4 h-4" />
              Recent ({history.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentList.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
                {activeTab === 'favorites' ? (
                  <Bookmark className={`w-8 h-8 ${darkMode ? 'text-stone-500' : 'text-stone-300'}`} />
                ) : (
                  <Clock className={`w-8 h-8 ${darkMode ? 'text-stone-500' : 'text-stone-300'}`} />
                )}
              </div>
              <p className={`font-medium ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                {activeTab === 'favorites' ? 'No saved sparks.' : 'No recent activity.'}
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                {activeTab === 'favorites' 
                  ? 'Favorite an idea to keep it forever.' 
                  : 'Start generating to fill your history.'}
              </p>
            </div>
          ) : (
            currentList.map((idea) => (
              <div 
                key={`${idea.id}-${activeTab}`}
                className={`group p-5 rounded-2xl border transition-all cursor-pointer relative ${darkMode ? 'bg-stone-700 border-stone-600 hover:border-rose-700' : 'bg-white border-stone-200 hover:border-rose-200'}`}
                onClick={() => onSelect(idea)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-bold transition-colors pr-8 ${darkMode ? 'text-stone-200 group-hover:text-[#FF91A4]' : 'text-stone-800 group-hover:text-[#FF91A4]'}`}>
                    {idea.title}
                  </h4>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(idea.id);
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${darkMode ? 'text-stone-400 hover:text-red-400 hover:bg-red-900/30' : 'text-stone-300 hover:text-red-500 hover:bg-red-50'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className={`text-xs line-clamp-2 mb-4 leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  {idea.description}
                </p>
                <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(idea.timestamp).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 group-hover:text-[#FF91A4] transition-colors">
                    View Specs <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className={`p-6 border-t text-center ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>Browser Storage Sync</p>
        </div>
      </div>
    </div>
  );
};

export default SavedIdeas;