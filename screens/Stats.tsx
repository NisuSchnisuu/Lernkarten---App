
import React from 'react';
import { useApp } from '../App';

const Stats: React.FC = () => {
  const { decks, stats } = useApp();

  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const avgMastery = decks.length > 0 
    ? Math.round(decks.reduce((acc, d) => acc + d.mastery, 0) / decks.length)
    : 0;

  return (
    <div className="flex flex-col pb-32">
      <header className="sticky top-0 z-30 bg-background-dark/90 backdrop-blur-md px-4 py-4 pt-8 border-b border-white/5">
        <h1 className="text-xl font-bold text-center">Lernstatistik</h1>
      </header>

      {/* Main KPI Grid */}
      <section className="px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-dark p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Erfolg</span>
            <span className="text-xl font-bold text-primary">{avgMastery}%</span>
          </div>
          <div className="bg-surface-dark p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gelernte Karten</span>
            <span className="text-xl font-bold text-white">{stats.totalCardsReviewed}</span>
          </div>
          <div className="bg-surface-dark p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stapel</span>
            <span className="text-xl font-bold text-white">{decks.length}</span>
          </div>
        </div>
      </section>

      {/* Activity Chart Container */}
      <section className="px-4 mb-6">
        <div className="bg-surface-dark rounded-3xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-widest text-[10px]">Lernaktivität</h3>
          <div className="flex items-end justify-between h-32 gap-3 mt-4">
            {stats.activityData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div 
                  className="w-full rounded-t-lg bg-primary/50 group-hover:bg-primary transition-all" 
                  style={{ height: `${Math.min(100, (val / (stats.dailyGoal || 20)) * 100)}%` }}
                ></div>
                <span className="text-[10px] font-medium text-slate-600">
                  {['M', 'D', 'M', 'D', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
          {stats.totalCardsReviewed === 0 && (
            <p className="text-[10px] text-slate-500 text-center mt-6">Fange an zu lernen, um deine Aktivität zu sehen!</p>
          )}
        </div>
      </section>

      {/* Category Breakdown */}
      {decks.length > 0 && (
        <section className="px-4 mb-6">
            <h3 className="text-[10px] font-bold text-slate-500 mb-4 px-1 uppercase tracking-widest">Mastery nach Stapel</h3>
            <div className="space-y-3">
            {decks.map(deck => (
                <div key={deck.id} className="bg-surface-dark p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold">{deck.name}</span>
                    <span className="text-xs font-bold text-primary">{deck.mastery}%</span>
                </div>
                <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden">
                    <div 
                        className="h-full rounded-full bg-primary" 
                        style={{ width: `${deck.mastery}%` }}
                    ></div>
                </div>
                </div>
            ))}
            </div>
        </section>
      )}
    </div>
  );
};

export default Stats;
