import React, { useState } from 'react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  // Fix: add audioEnabled and setAudioEnabled to context destructuring
  const { t, language, setLanguage, activeProfile, setActiveProfile, audioEnabled, setAudioEnabled } = useApp();
  const navigate = useNavigate();
  const [userName, setUserName] = useState(activeProfile?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [reminders, setReminders] = useState(true);

  if (!activeProfile) return null;

  const handleSaveName = () => {
    setIsEditing(false);
  };

  const handleLogout = () => {
    setActiveProfile(null);
    navigate('/onboarding');
  };

  return (
    <div className="flex flex-col pb-32">
      <header className="flex items-center justify-center p-4 pt-8 sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md">
        <h1 className="text-lg font-bold tracking-tight">Einstellungen</h1>
      </header>

      <section className="flex flex-col items-center px-4 pt-2 pb-6">
        <div className="relative">
          <div className="rounded-full h-28 w-28 ring-4 ring-primary/20 shadow-2xl bg-center bg-cover bg-surface-dark" style={{ backgroundImage: `url(${activeProfile.avatar})` }}></div>
          <button 
            onClick={() => isEditing ? handleSaveName() : setIsEditing(true)} 
            className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-4 border-background-dark flex items-center justify-center text-background-dark shadow-lg active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">{isEditing ? 'check' : 'edit'}</span>
          </button>
        </div>
        <div className="mt-5 text-center px-6 w-full">
          {isEditing ? (
            <input autoFocus value={userName} onChange={(e) => setUserName(e.target.value)} className="bg-surface-dark border-none text-xl font-bold text-center w-full rounded-xl focus:ring-2 focus:ring-primary py-2" />
          ) : (
            <h2 className="text-2xl font-bold">{activeProfile.name}</h2>
          )}
        </div>
      </section>

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

          {/* Add toggle for Sound Effects */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500"><span className="material-symbols-outlined">volume_up</span></div>
              <span className="text-sm font-bold">Soundeffekte</span>
            </div>
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`w-12 h-7 rounded-full relative transition-colors p-1 ${audioEnabled ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <div className={`size-5 bg-white rounded-full shadow transition-transform ${audioEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
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
        <p className="text-center text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em] py-8">Lumen v5.2.0</p>
      </section>
    </div>
  );
};

export default Profile;