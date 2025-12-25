
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=102218&fontFamily=Lexend';

const Onboarding: React.FC = () => {
  const { profiles, addProfile, setActiveProfile, deleteProfile } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCreate, setShowCreate] = useState(profiles.length === 0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);

  const avatars = [
    DEFAULT_AVATAR,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  ];

  const handleCreate = () => {
    if (name.trim().length < 2) {
      alert("Bitte gib einen Namen ein.");
      return;
    }
    addProfile(name, avatar);
    navigate('/');
  };

  const handleProfileSelect = (id: string) => {
    setActiveProfile(id);
    navigate('/');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen p-8 justify-center items-center bg-background-dark animate-in fade-in duration-500">
      <div className="size-16 rounded-2xl bg-primary flex items-center justify-center mb-8 shadow-2xl shadow-primary/20">
        <span className="material-symbols-outlined text-3xl text-background-dark filled">bolt</span>
      </div>
      
      {!showCreate ? (
        <div className="w-full max-w-xs flex flex-col items-center">
            <h1 className="text-2xl font-black mb-6">Wer lernt heute?</h1>
            <div className="grid grid-cols-2 gap-6 w-full mb-10">
                {profiles.map(p => (
                    <div key={p.id} className="flex flex-col items-center gap-2 group relative">
                        <button 
                            onClick={() => handleProfileSelect(p.id)}
                            className="size-24 rounded-full border-4 border-transparent hover:border-primary transition-all p-1 bg-surface-dark overflow-hidden active:scale-95 shadow-lg"
                        >
                            <img src={p.avatar} className="size-full rounded-full object-cover" alt={p.name} />
                        </button>
                        <span className="font-bold text-sm text-white/80">{p.name}</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if(confirm(`Profil ${p.name} wirklich löschen?`)) deleteProfile(p.id);
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 size-6 rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform z-10"
                        >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                    </div>
                ))}
                <button 
                    onClick={() => setShowCreate(true)}
                    className="flex flex-col items-center gap-2"
                >
                    <div className="size-24 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center hover:border-slate-500 hover:bg-white/5 transition-all">
                        <span className="material-symbols-outlined text-3xl text-slate-500">add</span>
                    </div>
                    <span className="font-bold text-sm text-slate-500">Neu</span>
                </button>
            </div>
        </div>
      ) : (
        <div className="w-full space-y-6 max-w-xs flex flex-col items-center">
          <h1 className="text-2xl font-black text-center mb-2">Profil erstellen</h1>
          <p className="text-slate-400 text-center mb-6 text-sm">Wähle einen Avatar und gib deinen Namen ein.</p>
          
          <div className="flex flex-col gap-4 items-center mb-4">
              <div className="relative">
                <img src={avatar} className="size-24 rounded-full border-4 border-primary/20 shadow-xl object-cover bg-surface-dark" alt="Avatar" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary size-8 rounded-full border-4 border-background-dark flex items-center justify-center text-background-dark active:scale-90 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
              <div className="flex gap-3 mt-2">
                {avatars.map((url, i) => (
                  <button 
                    key={i} 
                    onClick={() => setAvatar(url)}
                    className={`size-10 rounded-full border-2 transition-all overflow-hidden ${avatar === url ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                  >
                    <img src={url} className="size-full object-cover" alt="option" />
                  </button>
                ))}
              </div>
          </div>

          <div className="w-full space-y-4">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dein Name"
              className="w-full bg-surface-dark border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary transition-all text-center text-lg font-bold placeholder:text-slate-700"
            />
            <button 
              onClick={handleCreate}
              className="w-full bg-primary text-background-dark font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              Starten
            </button>
            {profiles.length > 0 && (
                <button 
                    onClick={() => setShowCreate(false)}
                    className="w-full text-slate-500 font-bold text-sm py-2"
                >
                    Abbrechen
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
