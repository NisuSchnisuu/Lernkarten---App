
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, playAppSound } from '../App';

const Home: React.FC = () => {
  const { t, decks, activeProfile, stats, hasUnreadNotifications, setHasUnreadNotifications, audioEnabled } = useApp();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const progressPercent = Math.min(100, Math.round((stats.dailyProgress / stats.dailyGoal) * 100));

  const handleOpenNotifications = () => {
    playAppSound('click', audioEnabled);
    setShowNotifications(true);
    setHasUnreadNotifications(false);
  };

  if (!activeProfile) return null;

  return (
    <div className="flex flex-col pb-32">
      <header className="sticky top-0 z-30 bg-background-dark/90 backdrop-blur-md px-4 py-4 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/profile')}
            className="bg-center bg-no-repeat bg-cover rounded-full size-12 ring-2 ring-primary/20 p-0.5 active:scale-95 transition-all"
            style={{ backgroundImage: `url(${activeProfile.avatar})` }}
          ></button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lumen Flashcards</span>
            <h1 className="text-xl font-bold leading-tight">Hallo, {activeProfile.name}!</h1>
          </div>
        </div>
        <button 
          onClick={handleOpenNotifications}
          className="flex items-center justify-center size-10 rounded-full bg-surface-dark text-white active:scale-90 relative"
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          {hasUnreadNotifications && <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full ring-2 ring-background-dark animate-pulse"></span>}
        </button>
      </header>

      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowNotifications(false)}>
            <div className="w-full max-w-sm bg-surface-dark rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-top-4" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Benachrichtigungen</h3>
                    <button onClick={() => setShowNotifications(false)} className="material-symbols-outlined text-slate-500">close</button>
                </div>
                <div className="p-6 text-center space-y-2">
                    {decks.length === 0 ? <p className="text-slate-500 text-xs">Keine neuen Stapel vorhanden.</p> : <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20"><p className="text-primary font-bold text-sm">Zeit zu lernen!</p><p className="text-xs text-primary/80">Du hast {decks.length} Stapel bereit.</p></div>}
                </div>
            </div>
        </div>
      )}

      <section className="px-4 py-2 mt-2 grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-surface-dark p-5 border border-white/5 flex flex-col justify-between h-36">
          <div className="size-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-500 text-2xl filled">local_fire_department</span>
          </div>
          <div>
            <p className="text-4xl font-black text-white">{stats.streak}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Tagesserie</p>
          </div>
        </div>

        <div className="rounded-3xl bg-surface-dark p-5 border border-white/5 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tagesziel</span>
            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{progressPercent}%</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-black">{stats.dailyProgress}</span>
              <span className="text-xs font-bold text-slate-600">/ {stats.dailyGoal}</span>
            </div>
            <div className="h-2 w-full bg-background-dark rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-700 shadow-[0_0_10px_rgba(19,236,109,0.3)]" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 px-4">
        <h3 className="text-lg font-bold px-1 mb-4">Deine Kartenstapel</h3>
        {decks.length === 0 ? (
          <div className="py-12 text-center bg-surface-dark/30 rounded-3xl border border-dashed border-white/5 flex flex-col items-center">
            <span className="material-symbols-outlined text-slate-700 text-5xl mb-4">style</span>
            <p className="text-slate-500 text-sm mb-6 px-10">Du hast noch keine Stapel erstellt.</p>
            <button onClick={() => navigate('/add-deck')} className="bg-primary text-background-dark font-bold px-8 py-3 rounded-2xl active:scale-95 shadow-lg shadow-primary/20">Stapel erstellen</button>
          </div>
        ) : (
          <div className="space-y-4">
            {decks.slice(0, 5).map((deck) => (
              <div key={deck.id} onClick={() => navigate(`/deck/${deck.id}`)} className="bg-surface-dark rounded-3xl overflow-hidden border border-white/5 flex active:scale-[0.98] transition-all group">
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary">{deck.category}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{deck.mastery}% Erfolg</span>
                  </div>
                  <h4 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{deck.name}</h4>
                  <p className="text-xs text-primary font-bold mt-4 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm filled">style</span>{deck.cards.length} Karten</p>
                </div>
                <div className="w-28 bg-cover bg-center shrink-0 border-l border-white/5" style={{ backgroundImage: `url(${deck.imageUrl})` }}></div>
              </div>
            ))}
          </div>
        )}
      </section>

      {decks.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 px-6 z-20 max-w-md mx-auto pointer-events-none">
            <button 
                onClick={() => {
                    playAppSound('click', audioEnabled);
                    navigate('/quiz/all');
                }} 
                className="pointer-events-auto w-full h-14 bg-primary text-background-dark rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined filled">play_circle</span>
                Alles Üben ({decks.reduce((acc, d) => acc + d.cards.length, 0)})
            </button>
        </div>
      )}
    </div>
  );
};

export default Home;
