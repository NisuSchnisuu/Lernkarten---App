
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { StudyMode } from '../types';

const DeckDetail: React.FC = () => {
  const { id } = useParams();
  const { decks, deleteDeck, t } = useApp();
  const navigate = useNavigate();
  const [showModeSelection, setShowModeSelection] = useState(false);
  
  const deck = decks.find(d => d.id === id);

  if (!deck) {
    return (
        <div className="p-10 text-center flex flex-col items-center gap-4">
            <p>Stapel nicht gefunden.</p>
            <button onClick={() => navigate('/library')} className="bg-primary text-background-dark p-2 rounded">Zurück</button>
        </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm("Möchtest du diesen Stapel wirklich löschen?")) {
        deleteDeck(deck.id);
        navigate('/library');
    }
  };

  const handleStartLearning = (mode: StudyMode) => {
    navigate(`/quiz/${deck.id}?mode=${mode}`);
  };

  const handleExport = () => {
    const csvContent = deck.cards.map(c => `${c.front},${c.back}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${deck.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark">
      <header className="relative h-64 shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${deck.imageUrl})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background-dark"></div>
        
        <div className="absolute top-8 left-4 right-4 flex justify-between items-center">
            <button onClick={() => navigate('/library')} className="size-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-all">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex gap-2">
                <button onClick={() => navigate(`/edit-deck/${deck.id}`)} className="size-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">edit</span>
                </button>
                <button onClick={handleExport} className="size-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">download</span>
                </button>
                <button onClick={handleDelete} className="size-10 rounded-full bg-red-500/20 backdrop-blur-md flex items-center justify-center border border-red-500/30 text-red-400 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>

        <div className="absolute bottom-4 left-6">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-opacity-20 ${
                deck.accentColor === 'blue' ? 'bg-blue-500 text-blue-300' : 
                deck.accentColor === 'red' ? 'bg-red-500 text-red-300' : 'bg-primary text-primary'
            }`}>{deck.category}</span>
            <h1 className="text-3xl font-bold mt-2 text-white drop-shadow-md">{deck.name}</h1>
            <p className="text-slate-400 text-xs font-medium mt-1">{deck.cards.length} Karten • {deck.mastery}% Meisterschaft</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Kartenliste</h3>
        {deck.cards.map((card, idx) => (
            <div key={card.id} className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-primary/60">Karte {idx + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Vorderseite</p>
                        <p className="text-sm font-medium">{card.front}</p>
                    </div>
                    <div className="space-y-1 border-l border-white/5 pl-4">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Rückseite</p>
                        <p className="text-sm text-slate-300">{card.back}</p>
                    </div>
                </div>
            </div>
        ))}
        <div className="h-24"></div>
      </main>

      {showModeSelection && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-surface-dark rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 border border-white/5">
                <h3 className="text-xl font-bold mb-2 text-center">Lernmodus wählen</h3>
                <p className="text-slate-400 text-sm mb-8 text-center">Wie möchtest du heute lernen?</p>
                <div className="grid gap-4">
                    <button 
                        onClick={() => handleStartLearning('sequential')}
                        className="flex items-center gap-4 bg-background-dark p-5 rounded-2xl border border-white/10 hover:border-primary/50 transition-all group active:scale-95"
                    >
                        <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <span className="material-symbols-outlined">format_list_numbered</span>
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Der Reihe nach</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black">Sequential</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => handleStartLearning('random')}
                        className="flex items-center gap-4 bg-background-dark p-5 rounded-2xl border border-white/10 hover:border-primary/50 transition-all group active:scale-95"
                    >
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">shuffle</span>
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Zufällig</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black">Randomized</p>
                        </div>
                    </button>
                </div>
                <button 
                    onClick={() => setShowModeSelection(false)}
                    className="w-full mt-6 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                >
                    Abbrechen
                </button>
            </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark pt-10">
        <div className="max-w-md mx-auto">
            <button 
                onClick={() => setShowModeSelection(true)}
                className="w-full bg-primary text-background-dark font-bold py-4 rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined filled">play_circle</span>
                Diesen Stapel lernen
            </button>
        </div>
      </footer>
    </div>
  );
};

export default DeckDetail;
