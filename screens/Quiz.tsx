
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../App';
import { StudyMode } from '../types';

const Quiz: React.FC = () => {
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const { decks, updateProgress } = useApp();
  const navigate = useNavigate();
  
  const selectedMode = (searchParams.get('mode') as StudyMode) || 'sequential';
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState({ known: 0, unsure: 0, forgotten: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const deck = useMemo(() => {
    let baseDeck;
    if (deckId === 'all') {
      const allCards = decks.flatMap(d => d.cards);
      baseDeck = { id: 'all', name: 'Alle wiederholen', cards: allCards };
    } else {
      baseDeck = decks.find(d => d.id === deckId);
    }
    
    if (!baseDeck) return null;

    const cards = selectedMode === 'random' 
      ? [...baseDeck.cards].sort(() => Math.random() - 0.5)
      : [...baseDeck.cards];

    return { ...baseDeck, cards };
  }, [deckId, decks, selectedMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!deck || !deck.cards || deck.cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 text-center bg-background-dark">
        <h2 className="text-xl font-bold mb-4 text-red-400">Keine Karten gefunden</h2>
        <button onClick={() => navigate('/library')} className="bg-primary text-background-dark px-6 py-2 rounded-xl font-bold">Zurück</button>
      </div>
    );
  }

  const currentCard = deck.cards[currentIndex];
  const progress = ((currentIndex + 1) / deck.cards.length) * 100;

  const handleRating = (type: 'known' | 'unsure' | 'forgotten') => {
    setResults(prev => ({ ...prev, [type]: prev[type] + 1 }));
    
    if (currentIndex < deck.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(p => p + 1), 150);
    } else {
      const finalKnown = results.known + (type === 'known' ? 1 : 0);
      updateProgress(deck.cards.length, finalKnown, deck.cards.length, deck.id);
      setIsFinished(true);
    }
  };

  const getDynamicFontSize = (text: string) => {
    const len = text.length;
    if (len < 20) return 'text-3xl lg:text-4xl';
    if (len < 50) return 'text-2xl lg:text-3xl';
    if (len < 100) return 'text-xl lg:text-2xl';
    if (len < 200) return 'text-lg';
    return 'text-sm';
  };

  if (isFinished) {
    return (
      <div className="flex flex-col h-screen bg-background-dark p-6 text-center justify-center animate-in zoom-in duration-300">
        <span className="material-symbols-outlined text-7xl text-primary filled mb-6 drop-shadow-[0_0_15px_rgba(19,236,109,0.4)]">workspace_premium</span>
        <h2 className="text-3xl font-bold mb-2">Großartige Arbeit!</h2>
        <p className="text-slate-400 mb-10">Du hast {deck.cards.length} Karten gelernt.</p>
        
        <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-surface-dark p-4 rounded-2xl border border-green-500/10">
                <p className="text-green-500 font-bold text-2xl">{results.known}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Gewusst</p>
            </div>
            <div className="bg-surface-dark p-4 rounded-2xl border border-yellow-500/10">
                <p className="text-yellow-500 font-bold text-2xl">{results.unsure}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Unsicher</p>
            </div>
            <div className="bg-surface-dark p-4 rounded-2xl border border-red-500/10">
                <p className="text-red-500 font-bold text-2xl">{results.forgotten}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Vergessen</p>
            </div>
        </div>
        
        <button onClick={() => navigate('/')} className="w-full bg-primary text-background-dark py-5 rounded-2xl font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all text-lg">
          Weiter zum Start
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background-dark">
      <header className="flex items-center justify-between p-4 pt-8 pb-2 z-10 relative">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-2xl text-slate-400">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-bold truncate max-w-[150px]">{deck.name}</h2>
          <span className="text-[10px] font-bold text-slate-500">{currentIndex + 1} / {deck.cards.length}</span>
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 -mr-2 rounded-full hover:bg-white/10 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-slate-400">more_horiz</span>
          </button>
          {showMenu && (
            <div className="absolute top-12 right-0 w-48 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-150">
              <button 
                onClick={() => {
                  let dId = deckId === 'all' ? decks.find(d => d.cards.some(c => c.id === currentCard.id))?.id : deckId;
                  let idx = decks.find(d => d.id === dId)?.cards.findIndex(c => c.id === currentCard.id);
                  navigate(`/edit-deck/${dId}?index=${idx}`);
                }}
                className="w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                Karte Bearbeiten
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="px-4 mb-4">
        <div className="h-1.5 w-full bg-surface-dark rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(19,236,109,0.5)]" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        <div 
          className={`flip-card w-full h-full max-h-[600px] cursor-pointer ${isFlipped ? 'flipped' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="flip-card-inner">
            {/* Front */}
            <div className="flip-card-front bg-surface-dark border border-white/5 flex flex-col overflow-hidden shadow-2xl rounded-3xl">
              {currentCard.frontImageUrl && (
                <div className="h-44 shrink-0 w-full bg-black/20 relative flex items-center justify-center p-4 overflow-hidden border-b border-white/5">
                  <img src={currentCard.frontImageUrl} alt="Front" className="h-full w-full object-contain" />
                </div>
              )}
              <div className="flex-1 flex flex-col p-8 text-center overflow-y-auto custom-scrollbar">
                <div className="my-auto">
                    <h3 className={`font-bold leading-tight whitespace-pre-wrap ${getDynamicFontSize(currentCard.front)}`}>{currentCard.front}</h3>
                    {currentCard.hint && <p className="text-xs text-slate-500 italic mt-6 flex items-center justify-center gap-1.5"><span className="material-symbols-outlined text-xs">lightbulb</span>{currentCard.hint}</p>}
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="flip-card-back bg-[#1e3326] border-2 border-primary/20 flex flex-col overflow-hidden shadow-2xl rounded-3xl">
              {currentCard.backImageUrl && (
                <div className="h-44 shrink-0 w-full bg-black/40 relative flex items-center justify-center p-4 overflow-hidden border-b border-white/5">
                  <img src={currentCard.backImageUrl} alt="Back" className="h-full w-full object-contain" />
                </div>
              )}
              <div className="flex-1 p-8 flex flex-col items-center text-center overflow-y-auto custom-scrollbar">
                <div className="my-auto w-full">
                    <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Antwort</span>
                    <p className={`text-white font-medium leading-relaxed whitespace-pre-wrap ${getDynamicFontSize(currentCard.back)}`}>{currentCard.back}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={`p-6 pb-12 transition-all duration-300 transform ${isFlipped ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <button onClick={(e) => { e.stopPropagation(); handleRating('forgotten'); }} className="flex flex-col items-center justify-center p-4 h-24 rounded-2xl bg-surface-dark border border-red-500/20 active:scale-95 transition-all group">
              <span className="material-symbols-outlined text-red-500 mb-1 group-active:scale-125 transition-transform">cancel</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Falsch</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleRating('unsure'); }} className="flex flex-col items-center justify-center p-4 h-24 rounded-2xl bg-surface-dark border border-yellow-500/20 active:scale-95 transition-all group">
              <span className="material-symbols-outlined text-yellow-500 mb-1 group-active:scale-125 transition-transform">help</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Unsicher</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleRating('known'); }} className="flex flex-col items-center justify-center p-4 h-24 rounded-2xl bg-primary active:scale-95 transition-all shadow-xl shadow-primary/20 group">
              <span className="material-symbols-outlined text-background-dark mb-1 font-bold group-active:scale-125 transition-transform">check_circle</span>
              <span className="text-[10px] font-bold text-background-dark uppercase">Gewusst</span>
            </button>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;
