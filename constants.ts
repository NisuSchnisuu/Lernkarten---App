
import { Deck, UserStats } from './types';

// Initial app state is empty for a fresh start
export const MOCK_DECKS: Deck[] = [];

export const MOCK_STATS: UserStats = {
  streak: 0,
  dailyGoal: 20,
  dailyProgress: 0,
  // Fix: replaced totalCardsMastered and totalTimeLearned with totalCardsReviewed to match UserStats interface
  totalCardsReviewed: 0,
  activityData: [0, 0, 0, 0, 0, 0, 0]
};
