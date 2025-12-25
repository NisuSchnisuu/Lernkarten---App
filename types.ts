
export type Language = 'en' | 'de';
export type StudyMode = 'sequential' | 'random';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  hint?: string;
}

export interface Deck {
  id: string;
  name: string;
  category: string;
  cardCount: number;
  lastReviewed: string;
  mastery: number;
  imageUrl?: string;
  accentColor: string;
  cards: Flashcard[];
  studyMode: StudyMode;
}

export interface UserStats {
  streak: number;
  dailyGoal: number;
  dailyProgress: number;
  lastStudyDate?: string; // ISO string
  totalCardsReviewed: number;
  activityData: number[]; // Reviews per day for the last 7 days
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  decks: Deck[];
  stats: UserStats;
}

export interface TranslationSchema {
  greeting: string;
  dueForReview: string;
  reviewAll: string;
  dayStreak: string;
  dailyGoal: string;
  library: string;
  home: string;
  decks: string;
  stats: string;
  settings: string;
  profile: string;
  lastReviewed: string;
  mastery: string;
  cardsCount: string;
  new: string;
  term: string;
  answer: string;
  showAnswer: string;
  gotIt: string;
  notSure: string;
  didntKnow: string;
  language: string;
  appearance: string;
  darkMode: string;
  logout: string;
  memberSince: string;
  totalProgress: string;
  details: string;
  timeLearned: string;
  learningActivity: string;
  active: string;
  vsLastWeek: string;
  dailyReminder: string;
  soundEffects: string;
  editAccount: string;
}
