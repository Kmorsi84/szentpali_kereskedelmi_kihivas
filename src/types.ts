export type ChallengeId = 'shopping' | 'mystery' | 'shelf' | 'pricing' | 'produce';

export type AppScreen =
  | 'welcome'
  | 'hub'
  | 'challenge'
  | 'certificate'
  | 'leaderboard';

export interface PlayerProfile {
  id: string;
  name: string;
  className: string;
  school: string;
  startedAt: string;
}

export interface ChallengeResult {
  challengeId: ChallengeId;
  completed: boolean;
  score: number;
  maxScore: number;
  summary: string;
  completedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  className: string;
  school: string;
  totalScore: number;
  completedCount: number;
  updatedAt: string;
}

export interface ChallengeMeta {
  id: ChallengeId;
  order: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  durationLabel: string;
  maxScore: number;
  partnerTag: 'Auchan' | 'METRO' | 'Interspar' | 'Unió Coop';
}
