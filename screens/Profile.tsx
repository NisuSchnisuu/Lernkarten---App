
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=102218&fontFamily=Lexend';

const Profile: React.FC = () => {
  const { t, language, setLanguage, activeProfile, setActiveProfile, profiles } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userName, setUserName] = useState(activeProfile?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [reminders, setReminders] = useState(true);
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  
  if (!activeProfile) return null;

  const avatars = [
    DEFAULT_AVATAR,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  ];

  const handleSaveName = () => {
    updateProfileData({ name: userName });
    setIsEditing(false);
  };

  const updateProfileData = (update: any) => {
    // In our simplified context, activeProfile is computed from profiles list
    // We update the profiles list in App.tsx via a hypothetical update function or just modify the state
    // For this implementation, we rely on the App.tsx's useEffect saving 'profiles' to localstorage
    const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? { ...p, ...update } : p);
    // Note: We need a way to push this back. We can use the setActiveProfile indirectly or expect App.tsx to handle it
    // But since we can't easily add new methods to App context without re-defining it, we'll assume the user
    // will see the changes on next mount or we can force it if we had an updateProfile method.
    // Given the constraints, I will add an 'updateProfile' conceptually if it existed, or just simulate it.
    // For now, I'll update the active profile in localstorage and then trigger a refresh if possible.
    
    // Better: I'll use the existing setActiveProfile logic to force a re-render of App's state if I could.
    // Actually, I'll just rely on the existing context structure if I can.
    // But the App.tsx provided doesn't have an updateProfile method.
    // I will use a trick: setActiveProfile(activeProfile.id) after modifying the raw localstorage
    const savedProfiles = JSON.parse(localStorage.getItem('lumen_profiles') || '[]');
    const newProfiles = savedProfiles.map((p: any) => p.id === activeProfile.id ? { ...p, ...update } : p);
    localStorage.setItem('lumen_profiles', JSON.stringify(newProfiles));
    window.location.reload(); // Hard refresh to sync state since we don't have an updateProfile method in context
  };

  const handleLogout = () => {
    setActiveProfile(null);
    navigate('/onboarding');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateProfileData({ avatar: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col pb-32">
      <header className="flex items-center justify-center p-4 pt-8 sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md">
        <h1 className="text-lg font-bold tracking-tight">Einstellungen</h1>
      </header>

      <section className="flex flex-col items-center px-4 pt-2 pb-6">
        <div className="relative group">
          <div className="rounded-full h-28 w-28 ring-4 ring-primary/20 shadow-2xl bg-center bg-cover bg-surface-dark overflow-hidden" style={{ backgroundImage: `url(${activeProfile.avatar})` }}></div>
          <button 
            onClick={() => setShowAvatarEdit(true)} 
            className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-4 border-background-dark flex items-center justify-center text-background-dark shadow-lg active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">add_a_photo</span>
          </button>
        </div>
        <div className="mt-5 text-center px-6 w-full">
          {isEditing ? (
            <div className="flex items-center gap-2">
                <input autoFocus value={userName} onChange={(e) => setUserName(e.target.value)} className="bg-surface-dark border-none text-xl font-bold text-center flex-1 rounded-xl focus:ring-2 focus:ring-primary py-2" />
                <button onClick={handleSaveName} className="bg-primary text-background-dark size-10 rounded-xl flex items-center justify-center shadow-lg"><span className="material-symbols-outlined">check</span></button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold">{activeProfile.name}</h2>
                <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
            </div>
          )}
        </div>
      </section>

      {showAvatarEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={() => setShowAvatarEdit(false)}>
            <div className="bg-surface-dark w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-center">Avatar ändern</h3>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {avatars.map((url, i) => (
                        <button 
                            key={i} 
                            onClick={() => {
                                updateProfileData({ avatar: url });
                                setShowAvatarEdit(false);
                            }}
                            className={`size-20 rounded-2xl border-2 overflow-hidden transition-all ${activeProfile.avatar === url ? 'border-primary shadow-lg shadow-primary/20' : 'border-white/5 opacity-60'}`}
                        >
                            <img src={url} className="size-full object-cover" alt="Avatar option" />
                        </button>
                    ))}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="size-20 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-slate-500 hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined text-2xl">upload</span>
                        <span className="text-[8px] font-bold uppercase mt-1">Upload</span>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
                <button 
                    onClick={() => setShowAvatarEdit(false)}
                    className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all"
                >
                    Schließen
                </button>
            </div>
        </div>
      )}

      <section className="px-5 space-y-4 mt-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Optionen</h3>
        <div className="rounded-3xl bg-surface-dark border border-white/5 divide-y divide-white/5 shadow-sm overflow-hidden">
          
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500"><span className="material-symbols-outlined">language</span></div>
              <span className="text-sm font-bold">Sprache</span>
            </div>
            <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="bg-background-dark border-none text-xs font-bold text-primary rounded-xl py-2 px-4 focus:ring-0">
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500"><span className="material-symbols-outlined">notifications_active</span></div>
              <span className="text-sm font-bold">Erinnerungen</span>
            </div>
            <button 
              onClick={() => setReminders(!reminders)}
              className={`w-12 h-7 rounded-full relative transition-colors p-1 ${reminders ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <div className={`size-5 bg-white rounded-full shadow transition-transform ${reminders ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
        
        <div className="pt-6 space-y-3">
            <button 
                onClick={handleLogout}
                className="w-full bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-red-500 active:scale-95 transition-all"
            >
                Benutzer wechseln / Abmelden
            </button>
        </div>
        <p className="text-center text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em] py-8">Lumen v5.5.0</p>
      </section>
    </div>
  );
};

export default Profile;
