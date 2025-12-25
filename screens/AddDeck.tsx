
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Flashcard, Deck, StudyMode } from '../types';

const AddDeck: React.FC = () => {
  const { t, addDeck } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deckImageRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [deckImageUrl, setDeckImageUrl] = useState('https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=400');
  const [studyMode, setStudyMode] = useState<StudyMode>('sequential');
  const [manualCards, setManualCards] = useState<{front: string, back: string, frontImageUrl?: string, backImageUrl?: string}[]>([{front: '', back: ''}]);
  const [errors, setErrors] = useState<{name?: boolean, category?: boolean}>({});

  const handleAddRow = () => {
    setManualCards([...manualCards, {front: '', back: ''}]);
  };

  const handleManualChange = (index: number, side: 'front' | 'back' | 'frontImageUrl' | 'backImageUrl', value: string) => {
    const newCards = [...manualCards];
    (newCards[index] as any)[side] = value;
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
        handleManualChange(index, side === 'front' ? 'frontImageUrl' : 'backImageUrl', event.target?.result as string);
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

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      const newCards = lines
        .map(line => {
          const commaIndex = line.indexOf(',');
          if (commaIndex === -1) return null;
          
          const front = line.substring(0, commaIndex).replace(/^"|"$/g, '').trim();
          const back = line.substring(commaIndex + 1).replace(/^"|"$/g, '').trim();
          
          return { front, back };
        })
        .filter(c => c !== null) as {front: string, back: string}[];
      
      if (newCards.length > 0) {
        setManualCards(newCards);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    const newErrors: {name?: boolean, category?: boolean} = {};
    if (!name.trim()) newErrors.name = true;
    if (!category.trim()) newErrors.category = true;
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const cards: Flashcard[] = manualCards
      .filter(c => c.front.trim() && c.back.trim())
      .map((c, i) => ({ 
        id: `card_${Date.now()}_${i}`, 
        front: c.front.trim(), 
        back: c.back.trim(),
        frontImageUrl: c.frontImageUrl,
        backImageUrl: c.backImageUrl
      }));

    if (cards.length === 0) {
      alert("Bitte mindestens eine Karte mit Vorder- und Rückseite hinzufügen.");
      return;
    }

    const newDeck: Deck = {
      id: `deck_${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      cardCount: cards.length,
      lastReviewed: 'Neu',
      mastery: 0,
      accentColor: ['blue', 'red', 'green', 'yellow'][Math.floor(Math.random() * 4)],
      cards,
      studyMode,
      imageUrl: deckImageUrl
    };

    addDeck(newDeck);
    navigate('/library');
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark">
      <header className="flex items-center justify-between p-4 pt-8 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-all">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h1 className="text-lg font-bold">Stapel erstellen</h1>
        <button onClick={handleSave} className="text-primary font-bold active:scale-90 transition-all">Speichern</button>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Name des Stapels</label>
              {errors.name && <span className="text-[9px] font-bold text-red-500 uppercase">Pflichtfeld</span>}
            </div>
            <input 
              type="text" 
              value={name}
              onChange={(e) => { setName(e.target.value); if(e.target.value) setErrors(p => ({...p, name: false})); }}
              placeholder="z.B. Spanisch Vokabeln"
              className={`w-full bg-background-dark border-none rounded-xl text-white placeholder:text-slate-800 focus:ring-1 transition-all ${errors.name ? 'ring-1 ring-red-500' : 'focus:ring-primary'}`}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Kategorie</label>
              {errors.category && <span className="text-[9px] font-bold text-red-500 uppercase">Pflichtfeld</span>}
            </div>
            <input 
              type="text" 
              value={category}
              onChange={(e) => { setCategory(e.target.value); if(e.target.value) setErrors(p => ({...p, category: false})); }}
              placeholder="z.B. Sprachen"
              className={`w-full bg-background-dark border-none rounded-xl text-white placeholder:text-slate-800 focus:ring-1 transition-all ${errors.category ? 'ring-1 ring-red-500' : 'focus:ring-primary'}`}
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
                  Eigenes Bild hochladen
                </button>
                <input type="file" ref={deckImageRef} className="hidden" accept="image/*" onChange={handleDeckImageUpload} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Anzeigemodus</label>
            <div className="flex bg-background-dark p-1 rounded-xl">
              <button 
                onClick={() => setStudyMode('sequential')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${studyMode === 'sequential' ? 'bg-primary text-background-dark' : 'text-slate-500'}`}
              >
                Der Reihe nach
              </button>
              <button 
                onClick={() => setStudyMode('random')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${studyMode === 'random' ? 'bg-primary text-background-dark' : 'text-slate-500'}`}
              >
                Zufällig
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Karten verwalten</h3>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              CSV Import
            </button>
            <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={handleCsvUpload} />
          </div>

          <div className="space-y-4">
            {manualCards.map((card, idx) => (
              <div key={idx} className="bg-surface-dark p-4 rounded-xl border border-white/5 relative space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold text-slate-500">KARTE {idx + 1}</span>
                  <button 
                    onClick={() => setManualCards(prev => prev.filter((_, i) => i !== idx))}
                    className="text-slate-700 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <textarea 
                      rows={1}
                      placeholder="Frage (Vorderseite)"
                      value={card.front}
                      onChange={(e) => handleManualChange(idx, 'front', e.target.value)}
                      className="w-full bg-background-dark border-none rounded-xl p-3 text-sm text-white focus:ring-primary placeholder:text-slate-700"
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        placeholder="Bild URL..."
                        value={card.frontImageUrl || ''}
                        onChange={(e) => handleManualChange(idx, 'frontImageUrl', e.target.value)}
                        className="flex-1 bg-background-dark border-none rounded-xl p-2 text-[10px] text-slate-400"
                      />
                      <button 
                        onClick={() => handleFileUpload(idx, 'front')}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/10"
                      >
                        <span className="material-symbols-outlined text-sm">image</span>
                      </button>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-white/5"></div>

                  <div className="space-y-2">
                    <textarea 
                      rows={1}
                      placeholder="Antwort (Rückseite)"
                      value={card.back}
                      onChange={(e) => handleManualChange(idx, 'back', e.target.value)}
                      className="w-full bg-background-dark border-none rounded-xl p-3 text-sm text-white focus:ring-primary placeholder:text-slate-700"
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        placeholder="Bild URL..."
                        value={card.backImageUrl || ''}
                        onChange={(e) => handleManualChange(idx, 'backImageUrl', e.target.value)}
                        className="flex-1 bg-background-dark border-none rounded-xl p-2 text-[10px] text-slate-400"
                      />
                      <button 
                        onClick={() => handleFileUpload(idx, 'back')}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/10"
                      >
                        <span className="material-symbols-outlined text-sm">image</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={handleAddRow}
              className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600 text-xs font-bold hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Karte hinzufügen
            </button>
          </div>
        </div>
      </main>

      <footer className="p-6 bg-background-dark/80 backdrop-blur-md shrink-0">
        <button 
          onClick={handleSave}
          className="w-full bg-primary text-background-dark font-bold py-4 rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
        >
          Stapel speichern
        </button>
      </footer>
    </div>
  );
};

export default AddDeck;
