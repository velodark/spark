
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
}

const SavedIdeas: React.FC<SavedIdeasProps> = ({ 
  isOpen, 
  onClose, 
  favorites, 
  history, 
  onSelect, 
  onRemoveFavorite, 
  onRemoveHistory 
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
      <div className="relative w-full max-w-md bg-stone-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <div className="p-6 border-b border-stone-200 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Activity Archive
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Control */}
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'favorites' ? 'bg-white text-amber-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Saved ({favorites.length})
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'history' ? 'bg-white text-amber-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'
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
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'favorites' ? (
                  <Bookmark className="w-8 h-8 text-stone-300" />
                ) : (
                  <Clock className="w-8 h-8 text-stone-300" />
                )}
              </div>
              <p className="text-stone-500 font-medium">
                {activeTab === 'favorites' ? 'No saved sparks.' : 'No recent activity.'}
              </p>
              <p className="text-stone-400 text-sm mt-1">
                {activeTab === 'favorites' 
                  ? 'Favorite an idea to keep it forever.' 
                  : 'Start generating to fill your history.'}
              </p>
            </div>
          ) : (
            currentList.map((idea) => (
              <div 
                key={`${idea.id}-${activeTab}`}
                className="group bg-white p-5 rounded-2xl border border-stone-200 hover:border-amber-200 transition-all cursor-pointer relative"
                onClick={() => onSelect(idea)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-stone-800 group-hover:text-amber-600 transition-colors pr-8">
                    {idea.title}
                  </h4>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(idea.id);
                    }}
                    className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-stone-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                  {idea.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(idea.timestamp).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                    View Specs <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-6 bg-white border-t border-stone-200 text-center">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Browser Storage Sync</p>
        </div>
      </div>
    </div>
  );
};

export default SavedIdeas;
