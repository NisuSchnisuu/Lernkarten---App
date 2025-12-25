import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';

const Library: React.FC = () => {
  // Fix: replace user with activeProfile from AppContext
  const { t, decks, activeProfile } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Alle');

  const categories = ['Alle', 'Sprachen', 'Science', 'Coding', 'Biology'];

  const filteredDecks = decks.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                          d.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Alle' || d.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen flex-col">
      <header className="px-5 pt-12 pb-4 bg-background-dark z-10 sticky top-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.library}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{decks.length} Stapel insgesamt</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => navigate('/profile')}
                className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary/20 p-0.5 active:scale-90 transition-all"
             >
                {/* Use activeProfile?.avatar instead of user?.avatar */}
                <img src={activeProfile?.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
             </button>
          </div>
        </div>

        <div className="relative group mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Stapel oder Thema suchen..."
            className="w-full bg-surface-dark border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex shrink-0 items-center justify-center rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                activeCategory === cat ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'bg-surface-dark text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 px-5 space-y-4 pt-2">
        {filteredDecks.length > 0 ? filteredDecks.map((deck) => (
          <div 
            key={deck.id}
            onClick={() => navigate(`/deck/${deck.id}`)}
            className="group flex flex-col gap-3 rounded-2xl bg-surface-dark p-4 shadow-sm border border-white/5 transition-all active:scale-[0.98] hover:bg-[#23382c]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-opacity-20 ${
                  deck.accentColor === 'green' ? 'bg-primary text-primary' : 
                  deck.accentColor === 'red' ? 'bg-red-500 text-red-400' :
                  deck.accentColor === 'blue' ? 'bg-blue-500 text-blue-400' : 'bg-yellow-500 text-yellow-400'
                }`}>
                  <span className="material-symbols-outlined filled">style</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-bold leading-tight">{deck.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{deck.category}</span>
                    <span className="text-slate-700">•</span>
                    <span className="text-[10px] font-bold text-primary">{deck.cards.length} {t.cardsCount}</span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-600">chevron_right</span>
            </div>
            
            <div className="mt-1">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{t.mastery}</span>
                <span className="text-[10px] font-bold text-primary">{deck.mastery}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-dark">
                <div 
                  className="h-full rounded-full bg-primary transition-all duration-700" 
                  style={{ width: `${deck.mastery}%` }}
                ></div>
              </div>
            </div>
          </div>
        )) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-600">
                <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                <p className="font-bold">Keine Stapel gefunden</p>
                <p className="text-xs px-10">Versuch es mit einem anderen Suchbegriff oder erstelle einen neuen Stapel.</p>
            </div>
        )}
      </main>

      <button 
        onClick={() => navigate('/add-deck')}
        className="fixed bottom-28 right-6 h-14 w-14 flex items-center justify-center rounded-full bg-primary text-background-dark shadow-xl shadow-primary/30 active:scale-90 transition-all z-20"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>
    </div>
  );
};

export default Library;