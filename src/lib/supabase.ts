import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ChallengeId, ChallengeResult, LeaderboardEntry } from '../types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  '';

function isValidHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export const isSupabaseConfigured =
  isValidHttpsUrl(supabaseUrl) &&
  supabaseKey.length > 10 &&
  !supabaseUrl.includes('YOUR_PROJECT_REF') &&
  !supabaseKey.includes('YOUR_SUPABASE');

const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

interface ExpoResultRow {
  id: string;
  name: string;
  class_name: string;
  school: string;
  total_score: number;
  completed_count: number;
  updated_at: string;
}

function clampText(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

export async function saveExpoResultToSupabase(
  entry: LeaderboardEntry,
  results: Partial<Record<ChallengeId, ChallengeResult>>
): Promise<boolean> {
  if (!supabase) return false;

  const safeId = clampText(entry.id, 64);
  const safeName = clampText(entry.name, 80);
  const safeClass = clampText(entry.className, 30);
  const safeSchool = clampText(entry.school, 120);
  const safeScore = Math.max(0, Math.min(500, Math.round(entry.totalScore)));
  const safeCompleted = Math.max(0, Math.min(5, Math.round(entry.completedCount)));

  if (!safeId || !safeName || !safeClass || !safeSchool) {
    return false;
  }

  try {
    const { error } = await supabase.from('expo_results').upsert(
      {
        id: safeId,
        name: safeName,
        class_name: safeClass,
        school: safeSchool,
        total_score: safeScore,
        completed_count: safeCompleted,
        challenge_details: results,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    return !error;
  } catch {
    return false;
  }
}

export async function fetchExpoLeaderboardFromSupabase(): Promise<LeaderboardEntry[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('expo_results')
      .select('id, name, class_name, school, total_score, completed_count, updated_at')
      .order('total_score', { ascending: false })
      .order('completed_count', { ascending: false })
      .limit(100);

    if (error || !Array.isArray(data)) {
      return null;
    }

    return (data as ExpoResultRow[]).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      className: String(row.class_name),
      school: String(row.school),
      totalScore: Number(row.total_score) || 0,
      completedCount: Number(row.completed_count) || 0,
      updatedAt: String(row.updated_at || new Date().toISOString()),
    }));
  } catch {
    return null;
  }
}
