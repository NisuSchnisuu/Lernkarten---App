
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../App';
import { Flashcard, Deck, StudyMode } from '../types';

const EditDeck: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const highlightedIndex = searchParams.get('index') ? parseInt(searchParams.get('index')!) : null;
  const deckImageRef = useRef<HTMLInputElement>(null);
  
  const { decks, updateDeck } = useApp();
  const navigate = useNavigate();
  
  const existingDeck = decks.find(d => d.id === id);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [deckImageUrl, setDeckImageUrl] = useState('');
  const [manualCards, setManualCards] = useState<(Flashcard & {expanded?: boolean})[]>([]);

  useEffect(() => {
    if (existingDeck) {
      setName(existingDeck.name);
      setCategory(existingDeck.category);
      setDeckImageUrl(existingDeck.imageUrl || '');
      setManualCards(existingDeck.cards.map((c, i) => ({ 
        ...c, 
        expanded: i === highlightedIndex 
      })));
      
      if (highlightedIndex !== null) {
        setTimeout(() => {
          const el = document.getElementById(`card-edit-${highlightedIndex}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    } else {
      navigate('/library');
    }
  }, [existingDeck, navigate, highlightedIndex]);

  const handleAddRow = () => {
    const newCard: Flashcard & {expanded?: boolean} = {
      id: `card_${Date.now()}`,
      front: '',
      back: '',
      frontImageUrl: '',
      backImageUrl: '',
      expanded: true
    };
    setManualCards([...manualCards, newCard]);
  };

  const handleCardChange = (index: number, field: keyof Flashcard, value: string) => {
    const newCards = [...manualCards];
    (newCards[index] as any)[field] = value;
    setManualCards(newCards);
  };

  const handleFileUpload = (index: number, side: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        handleCardChange(index, side === 'front' ? 'frontImageUrl' : 'backImageUrl', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleDeckImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDeckImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !category.trim()) {
      alert("Bitte Name und Kategorie angeben.");
      return;
    }

    const cards: Flashcard[] = manualCards
      .filter(c => c.front.trim() && c.back.trim())
      .map(c => {
        const { expanded, ...pureCard } = c;
        return pureCard;
      });

    if (cards.length === 0) {
      alert("Stapel muss mindestens eine Karte enthalten.");
      return;
    }

    if (existingDeck) {
      const updated: Deck = {
        ...existingDeck,
        name: name.trim(),
        category: category.trim(),
        cardCount: cards.length,
        imageUrl: deckImageUrl,
        cards
      };
      updateDeck(updated);
      navigate(`/deck/${id}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark">
      <header className="flex items-center justify-between p-4 pt-8 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-all">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h1 className="text-lg font-bold">Stapel bearbeiten</h1>
        <button onClick={handleSave} className="text-primary font-bold active:scale-90 transition-all">Fertig</button>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Stapel Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background-dark border-none rounded-xl text-white focus:ring-1 focus:ring-primary py-3"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Kategorie</label>
            <input 
              type="text" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background-dark border-none rounded-xl text-white focus:ring-1 focus:ring-primary py-3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Titelbild</label>
            <div className="flex items-center gap-3">
              <div className="size-16 rounded-xl bg-background-dark border border-white/5 overflow-hidden shrink-0">
                <img src={deckImageUrl} className="size-full object-cover" alt="Preview" />
              </div>
              <div className="flex-1 space-y-2">
                <input 
                  type="text" 
                  value={deckImageUrl} 
                  onChange={(e) => setDeckImageUrl(e.target.value)} 
                  placeholder="Bild URL..."
                  className="w-full bg-background-dark border-none rounded-lg text-[10px] text-slate-400 py-1.5"
                />
                <button 
                  onClick={() => deckImageRef.current?.click()}
                  className="text-[10px] font-bold text-primary flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">upload</span>
                  Bild ändern
                </button>
                <input type="file" ref={deckImageRef} className="hidden" accept="image/*" onChange={handleDeckImageUpload} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-20">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Karten ({manualCards.length})</h3>
          {manualCards.map((card, idx) => (
            <div 
              key={card.id} 
              id={`card-edit-${idx}`}
              className={`bg-surface-dark rounded-2xl border transition-all duration-300 overflow-hidden ${card.expanded ? 'border-primary/30 ring-1 ring-primary/10' : 'border-white/5'}`}
            >
              <div 
                className="p-4 flex gap-4 items-center cursor-pointer" 
                onClick={() => {
                  const newCards = [...manualCards];
                  newCards[idx].expanded = !newCards[idx].expanded;
                  setManualCards(newCards);
                }}
              >
                <div className="size-10 rounded-xl bg-background-dark flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                  {card.frontImageUrl ? <img src={card.frontImageUrl} className="size-full object-contain" /> : <span className="text-[10px] font-bold text-slate-700">{idx+1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-white">{card.front || 'Keine Frage'}</p>
                </div>
                <span className={`material-symbols-outlined transition-transform ${card.expanded ? 'rotate-180' : ''}`}>expand_more</span>
              </div>

              {card.expanded && (
                <div className="px-4 pb-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
                  <div className="h-[1px] w-full bg-white/5"></div>
                  
                  {/* Front Side */}
                  <div className="space-y-3 p-3 bg-black/20 rounded-xl">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">Vorderseite</p>
                    <textarea 
                      rows={2}
                      value={card.front}
                      onChange={(e) => handleCardChange(idx, 'front', e.target.value)}
                      placeholder="Frage..."
                      className="w-full bg-background-dark border-none rounded-xl text-sm text-white focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={card.frontImageUrl || ''}
                        onChange={(e) => handleCardChange(idx, 'frontImageUrl', e.target.value)}
                        placeholder="Bild URL..."
                        className="flex-1 bg-background-dark border-none rounded-xl text-[10px] text-slate-300 focus:ring-primary"
                      />
                      <button onClick={() => handleFileUpload(idx, 'front')} className="p-2 bg-white/5 rounded-xl"><span className="material-symbols-outlined text-sm">image</span></button>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="space-y-3 p-3 bg-black/20 rounded-xl">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Rückseite</p>
                    <textarea 
                      rows={3}
                      value={card.back}
                      onChange={(e) => handleCardChange(idx, 'back', e.target.value)}
                      placeholder="Antwort..."
                      className="w-full bg-background-dark border-none rounded-xl text-sm text-white focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={card.backImageUrl || ''}
                        onChange={(e) => handleCardChange(idx, 'backImageUrl', e.target.value)}
                        placeholder="Bild URL..."
                        className="flex-1 bg-background-dark border-none rounded-xl text-[10px] text-slate-300 focus:ring-primary"
                      />
                      <button onClick={() => handleFileUpload(idx, 'back')} className="p-2 bg-white/5 rounded-xl"><span className="material-symbols-outlined text-sm">image</span></button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => setManualCards(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 p-2 bg-red-500/10 rounded-lg active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Karte Löschen
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button 
            onClick={handleAddRow}
            className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs font-bold hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Karte hinzufügen
          </button>
        </div>
      </main>

      <footer className="p-6 bg-background-dark/80 backdrop-blur-md shrink-0">
        <button onClick={handleSave} className="w-full bg-primary text-background-dark font-bold py-4 rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
          Änderungen Speichern
        </button>
      </footer>
    </div>
  );
};

export default EditDeck;
