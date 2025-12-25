import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Language, TranslationSchema, Deck, UserStats, UserProfile } from './types';
import { TRANSLATIONS } from './translations';
import Home from './screens/Home';
import Library from './screens/Library';
import Stats from './screens/Stats';
import Profile from './screens/Profile';
import Quiz from './screens/Quiz';
import AddDeck from './screens/AddDeck';
import DeckDetail from './screens/DeckDetail';
import EditDeck from './screens/EditDeck';
import Onboarding from './screens/Onboarding';

// Define and export playAppSound to resolve "no exported member" error in Home.tsx and Quiz.tsx
export const playAppSound = (type: 'click' | 'correct' | 'incorrect' | 'flip', enabled: boolean) => {
  if (!enabled) return;
  const sounds: Record<string, string> = {
    click: 'https://www.soundjay.com/buttons/sounds/button-16.mp3',
    correct: 'https://www.soundjay.com/buttons/sounds/button-09.mp3',
    incorrect: 'https://www.soundjay.com/buttons/sounds/button-10.mp3',
    flip: 'https://www.soundjay.com/buttons/sounds/button-11.mp3'
  };
  const audio = new Audio(sounds[type]);
  audio.volume = 0.2;
  audio.play().catch(() => {});
};

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSchema;
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  setActiveProfile: (profileId: string | null) => void;
  addProfile: (name: string, avatar: string) => void;
  deleteProfile: (id: string) => void;
  decks: Deck[];
  addDeck: (deck: Deck) => void;
  deleteDeck: (id: string) => void;
  updateDeck: (deck: Deck) => void;
  stats: UserStats;
  updateProgress: (cardsReviewed: number, knownCount: number, totalCount: number, deckId?: string) => void;
  hasUnreadNotifications: boolean;
  setHasUnreadNotifications: (val: boolean) => void;
  // Add audioEnabled to context so it can be used in Home.tsx and Quiz.tsx
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const BottomNav: React.FC = () => {
  const { t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: t.home, icon: 'dashboard', path: '/' },
    { label: t.decks, icon: 'style', path: '/library' },
    { label: t.stats, icon: 'bar_chart', path: '/stats' },
    { label: t.settings, icon: 'settings', path: '/profile' }
  ];

  const hideNav = location.pathname.startsWith('/quiz') || 
                  location.pathname === '/add-deck' || 
                  location.pathname === '/onboarding' ||
                  location.pathname.startsWith('/deck/') ||
                  location.pathname.startsWith('/edit-deck/');

  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#0d1c14]/90 border-t border-white/5 pb-8 pt-3 px-6 z-40 backdrop-blur-lg">
      <ul className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <button 
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive ? 'text-primary' : 'text-slate-400'}`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lumen_lang') as Language) || 'de');
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('lumen_profiles');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => localStorage.getItem('lumen_active_profile_id') || null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  // Persist audio state
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('lumen_audio');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => localStorage.setItem('lumen_lang', language), [language]);
  useEffect(() => localStorage.setItem('lumen_profiles', JSON.stringify(profiles)), [profiles]);
  useEffect(() => localStorage.setItem('lumen_audio', JSON.stringify(audioEnabled)), [audioEnabled]);
  useEffect(() => {
    if (activeProfileId) {
      localStorage.setItem('lumen_active_profile_id', activeProfileId);
    } else {
      localStorage.removeItem('lumen_active_profile_id');
    }
  }, [activeProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const addProfile = (name: string, avatar: string) => {
    const newProfile: UserProfile = {
      id: `u_${Date.now()}`,
      name,
      avatar,
      decks: [],
      stats: {
        streak: 0,
        dailyGoal: 20,
        dailyProgress: 0,
        totalCardsReviewed: 0,
        activityData: [0, 0, 0, 0, 0, 0, 0]
      }
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) setActiveProfileId(null);
  };

  const updateActiveProfileData = (update: Partial<UserProfile>) => {
    if (!activeProfileId) return;
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...update } : p));
  };

  const addDeck = (newDeck: Deck) => {
    if (!activeProfile) return;
    const updatedDecks = [newDeck, ...activeProfile.decks];
    updateActiveProfileData({ decks: updatedDecks });
    setHasUnreadNotifications(true);
  };

  const deleteDeck = (id: string) => {
    if (!activeProfile) return;
    updateActiveProfileData({ decks: activeProfile.decks.filter(d => d.id !== id) });
  };

  const updateDeck = (updated: Deck) => {
    if (!activeProfile) return;
    updateActiveProfileData({ decks: activeProfile.decks.map(d => d.id === updated.id ? updated : d) });
  };

  const updateProgress = (cardsReviewed: number, knownCount: number, totalCount: number, deckId?: string) => {
    if (!activeProfile) return;
    const today = new Date().toISOString().split('T')[0];
    const prev = activeProfile.stats;

    let newStreak = prev.streak;
    if (!prev.lastStudyDate) {
      newStreak = 1;
    } else {
      const last = new Date(prev.lastStudyDate);
      const diff = Math.floor((new Date(today).getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) newStreak += 1;
      else if (diff > 1) newStreak = 1;
    }

    const isSameDay = prev.lastStudyDate === today;
    const newDailyProgress = isSameDay ? prev.dailyProgress + cardsReviewed : cardsReviewed;
    
    const newActivity = [...prev.activityData];
    newActivity[6] = (newActivity[6] || 0) + cardsReviewed;

    const newStats: UserStats = {
      ...prev,
      streak: newStreak,
      dailyProgress: newDailyProgress,
      totalCardsReviewed: prev.totalCardsReviewed + cardsReviewed,
      lastStudyDate: today,
      activityData: newActivity
    };

    let updatedDecks = [...activeProfile.decks];
    if (deckId && deckId !== 'all') {
      const mastery = Math.round((knownCount / totalCount) * 100);
      updatedDecks = updatedDecks.map(d => d.id === deckId ? { 
        ...d, 
        mastery, 
        lastReviewed: today 
      } : d);
    }

    updateActiveProfileData({ stats: newStats, decks: updatedDecks });
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, t: TRANSLATIONS[language], 
      profiles, activeProfile, setActiveProfile: setActiveProfileId, addProfile, deleteProfile,
      decks: activeProfile?.decks || [], addDeck, deleteDeck, updateDeck,
      stats: activeProfile?.stats || { streak: 0, dailyGoal: 20, dailyProgress: 0, totalCardsReviewed: 0, activityData: [0, 0, 0, 0, 0, 0, 0] },
      updateProgress, hasUnreadNotifications, setHasUnreadNotifications,
      audioEnabled, setAudioEnabled
    }}>
      <HashRouter>
        <div className="min-h-screen max-w-md mx-auto relative bg-background-dark overflow-x-hidden text-white selection:bg-primary selection:text-background-dark">
          {!activeProfileId ? (
            <Routes>
              <Route path="*" element={<Onboarding />} />
            </Routes>
          ) : (
            <>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/quiz/:deckId" element={<Quiz />} />
                <Route path="/add-deck" element={<AddDeck />} />
                <Route path="/deck/:id" element={<DeckDetail />} />
                <Route path="/edit-deck/:id" element={<EditDeck />} />
                <Route path="/onboarding" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <BottomNav />
            </>
          )}
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;