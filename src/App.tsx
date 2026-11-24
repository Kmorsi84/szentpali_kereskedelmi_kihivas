import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Compass,
  Gift,
  Play,
  Store,
  Trophy,
  UserPlus,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type {
  AppScreen,
  ChallengeId,
  ChallengeResult,
  LeaderboardEntry,
  PlayerProfile,
} from './types';
import {
  CHALLENGES,
  IMAGES,
  PROGRAM_NAME,
  SCHOOL_FULL_NAME,
  SCHOOL_SHORT_NAME,
} from './data/gameData';
import { PartnerLogos } from './components/PartnerLogos';
import { ShoppingChallenge } from './components/challenges/ShoppingChallenge';
import { MysteryBoxChallenge } from './components/challenges/MysteryBoxChallenge';
import { ShelfAndPackChallenge } from './components/challenges/ShelfAndPackChallenge';
import { PricingChallenge } from './components/challenges/PricingChallenge';
import { ProduceQuizChallenge } from './components/challenges/ProduceQuizChallenge';
import { CertificateView } from './components/CertificateView';
import { LeaderboardView } from './components/LeaderboardView';
import { soundEngine } from './utils/sound';
import {
  fetchExpoLeaderboardFromSupabase,
  isSupabaseConfigured,
  saveExpoResultToSupabase,
  syncLocalEntriesToSupabase,
} from './lib/supabase';

const STORAGE_KEYS = {
  player: 'szentpali_expo_player_v1',
  results: 'szentpali_expo_results_v1',
  leaderboard: 'szentpali_expo_leaderboard_v1',
};

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [player, setPlayer] = useState<PlayerProfile | null>(() =>
    safeReadJson<PlayerProfile | null>(STORAGE_KEYS.player, null)
  );
  const [results, setResults] = useState<Partial<Record<ChallengeId, ChallengeResult>>>(() =>
    safeReadJson<Partial<Record<ChallengeId, ChallengeResult>>>(STORAGE_KEYS.results, {})
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() =>
    safeReadJson<LeaderboardEntry[]>(STORAGE_KEYS.leaderboard, [])
  );

  const [screen, setScreen] = useState<AppScreen>(() =>
    safeReadJson<PlayerProfile | null>(STORAGE_KEYS.player, null) ? 'hub' : 'welcome'
  );
  const [activeChallengeId, setActiveChallengeId] = useState<ChallengeId | null>(null);
  const [justFinished, setJustFinished] = useState<{
    challengeId: ChallengeId;
    score: number;
    summary: string;
  } | null>(null);
  const [muted, setMuted] = useState(false);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [classInput, setClassInput] = useState('');
  const [schoolInput, setSchoolInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (player) {
        localStorage.setItem(STORAGE_KEYS.player, JSON.stringify(player));
      } else {
        localStorage.removeItem(STORAGE_KEYS.player);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [player]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.results, JSON.stringify(results));
    } catch {
      // Ignore storage quota errors
    }
  }, [results]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(leaderboard));
    } catch {
      // Ignore storage quota errors
    }
  }, [leaderboard]);

  const refreshCloudLeaderboard = async () => {
    if (!isSupabaseConfigured) return;
    setIsLoadingLeaderboard(true);
    const remoteEntries = await fetchExpoLeaderboardFromSupabase();
    if (remoteEntries) {
      setLeaderboard(remoteEntries);
    }
    setIsLoadingLeaderboard(false);
  };

  // Auto-sync any locally cached results (e.g. from offline play or prior local-only session) to Supabase on load
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const runInitialSync = async () => {
      const localPlayer = safeReadJson<PlayerProfile | null>(STORAGE_KEYS.player, null);
      const localResults = safeReadJson<Partial<Record<ChallengeId, ChallengeResult>>>(
        STORAGE_KEYS.results,
        {}
      );
      const localEntries = safeReadJson<LeaderboardEntry[]>(STORAGE_KEYS.leaderboard, []);

      if (localPlayer) {
        const localCompleted = CHALLENGES.filter((c) => localResults[c.id]?.completed).length;
        const localScore = CHALLENGES.reduce(
          (acc, c) => acc + (localResults[c.id]?.score ?? 0),
          0
        );
        await saveExpoResultToSupabase(
          {
            id: localPlayer.id,
            name: localPlayer.name,
            className: localPlayer.className,
            school: localPlayer.school,
            totalScore: localScore,
            completedCount: localCompleted,
            updatedAt: new Date().toISOString(),
          },
          localResults
        );
      }

      if (localEntries.length > 0) {
        await syncLocalEntriesToSupabase(localEntries);
      }

      void refreshCloudLeaderboard();
    };

    void runInitialSync();
  }, []);

  useEffect(() => {
    if (screen === 'leaderboard' && isSupabaseConfigured) {
      void refreshCloudLeaderboard();
    }
  }, [screen]);

  const completedCount = useMemo(
    () => CHALLENGES.filter((c) => results[c.id]?.completed).length,
    [results]
  );

  const totalScore = useMemo(
    () => CHALLENGES.reduce((acc, c) => acc + (results[c.id]?.score ?? 0), 0),
    [results]
  );

  const nextUncompletedChallenge = useMemo(
    () => CHALLENGES.find((c) => !results[c.id]?.completed) ?? CHALLENGES[0],
    [results]
  );

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
    if (!next) {
      soundEngine.playPop();
    }
  };

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedClass = classInput.trim();
    const trimmedSchool = schoolInput.trim();

    if (!trimmedName || !trimmedClass || !trimmedSchool) {
      soundEngine.playError();
      setFormError('Kérjük, add meg a nevedet, az osztályodat és az iskoládat is!');
      return;
    }

    soundEngine.playCorrect();
    const newPlayer: PlayerProfile = {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: trimmedName,
      className: trimmedClass,
      school: trimmedSchool,
      startedAt: new Date().toISOString(),
    };
    setPlayer(newPlayer);
    setResults({});
    setJustFinished(null);
    setActiveChallengeId(null);
    setFormError(null);
    setScreen('hub');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const initialEntry: LeaderboardEntry = {
      id: newPlayer.id,
      name: newPlayer.name,
      className: newPlayer.className,
      school: newPlayer.school,
      totalScore: 0,
      completedCount: 0,
      updatedAt: newPlayer.startedAt,
    };

    setLeaderboard((prev) => [initialEntry, ...prev.filter((item) => item.id !== newPlayer.id)]);

    if (isSupabaseConfigured) {
      void saveExpoResultToSupabase(initialEntry, {});
    }
  };

  const handleNewPlayer = () => {
    soundEngine.playPop();
    setPlayer(null);
    setResults({});
    setActiveChallengeId(null);
    setJustFinished(null);
    setNameInput('');
    setClassInput('');
    setSchoolInput('');
    setFormError(null);
    setScreen('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchChallenge = (id: ChallengeId) => {
    soundEngine.playPop();
    setActiveChallengeId(id);
    setJustFinished(null);
    setScreen('challenge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChallengeComplete = (challengeId: ChallengeId, score: number, summary: string) => {
    const updatedResults: Partial<Record<ChallengeId, ChallengeResult>> = {
      ...results,
      [challengeId]: {
        challengeId,
        completed: true,
        score,
        maxScore: 100,
        summary,
        completedAt: new Date().toISOString(),
      },
    };
    setResults(updatedResults);
    setJustFinished({ challengeId, score, summary });

    if (player) {
      const nextCompletedCount = CHALLENGES.filter((c) => updatedResults[c.id]?.completed).length;
      const nextTotalScore = CHALLENGES.reduce(
        (acc, c) => acc + (updatedResults[c.id]?.score ?? 0),
        0
      );

      const entry: LeaderboardEntry = {
        id: player.id,
        name: player.name,
        className: player.className,
        school: player.school,
        totalScore: nextTotalScore,
        completedCount: nextCompletedCount,
        updatedAt: new Date().toISOString(),
      };

      setLeaderboard((prev) => {
        const exists = prev.some((item) => item.id === player.id);
        return exists ? prev.map((item) => (item.id === player.id ? entry : item)) : [entry, ...prev];
      });

      if (isSupabaseConfigured) {
        void saveExpoResultToSupabase(entry, updatedResults).then((saved) => {
          if (saved) {
            void refreshCloudLeaderboard();
          }
        });
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeChallengeMeta = activeChallengeId
    ? CHALLENGES.find((c) => c.id === activeChallengeId) ?? null
    : null;

  const showMobileBottomNav = Boolean(player) && screen !== 'challenge' && screen !== 'welcome';

  // Circular SVG progress ring math for the Cobalt Expo Pass
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - completedCount / CHALLENGES.length);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F8] text-[#0B1220]">
      {/* Midnight Cobalt Top Bar (Strict 3-Zone Contract) */}
      <header className="no-print sticky top-0 z-30 h-13 sm:h-14 bg-[#0F1D40]/95 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              setScreen(player ? 'hub' : 'welcome');
              setActiveChallengeId(null);
              setJustFinished(null);
            }}
            className="min-h-[44px] inline-flex items-center font-display text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 text-left"
          >
            Szentpáli Kihívás
          </button>

          {/* Zone 2: Clean Desktop Navigation Links (shown once registered to avoid duplicating right CTA) */}
          {player && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setScreen('hub');
                  setActiveChallengeId(null);
                }}
                className={`min-h-[40px] hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                  screen === 'hub' ? 'text-amber-300 font-bold underline underline-offset-4' : ''
                }`}
              >
                Állomások
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setScreen('certificate');
                  setActiveChallengeId(null);
                }}
                className={`min-h-[40px] hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                  screen === 'certificate'
                    ? 'text-amber-300 font-bold underline underline-offset-4'
                    : ''
                }`}
              >
                Oklevél
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setScreen('leaderboard');
                  setActiveChallengeId(null);
                }}
                className={`min-h-[40px] hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                  screen === 'leaderboard'
                    ? 'text-amber-300 font-bold underline underline-offset-4'
                    : ''
                }`}
              >
                Toplista
              </button>
            </nav>
          )}

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0">
            {player ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setScreen('certificate');
                  setActiveChallengeId(null);
                }}
                className="min-h-[38px] rounded-xl bg-amber-400 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-[#0F1D40] hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
              >
                {completedCount >= 1 ? (
                  <>
                    <span className="sm:hidden">Oklevél</span>
                    <span className="hidden sm:inline">Oklevél megnyitása</span>
                  </>
                ) : (
                  `${completedCount}/5 kész`
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setScreen(screen === 'leaderboard' ? 'welcome' : 'leaderboard');
                }}
                className="min-h-[38px] rounded-xl bg-white/10 px-3.5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition-colors whitespace-nowrap shrink-0"
              >
                {screen === 'leaderboard' ? 'Regisztráció' : 'Toplista'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 ${
          showMobileBottomNav ? 'pb-24 md:pb-10' : 'pb-10'
        }`}
      >
        {/* WELCOME / REGISTRATION SCREEN */}
        {screen === 'welcome' && (
          <div className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
              {/* Left: Bold Midnight Cobalt Editorial Poster + Retail Photo (compact on mobile so form is immediately visible) */}
              <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-[#0F1D40] text-white overflow-hidden tactile-card flex flex-col justify-between">
                <div className="p-5 sm:p-8 space-y-2 sm:space-y-3">
                  <p className="text-[11px] sm:text-sm font-bold text-amber-300 leading-snug">
                    {SCHOOL_FULL_NAME}
                  </p>
                  <p className="text-xs text-slate-300">
                    {PROGRAM_NAME} szak · Pályaválasztási kiállítás · 2–3 perc
                  </p>
                  <h1 className="pt-0.5 text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
                    Mérj, csomagolj és számolj!
                  </h1>
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
                    Légy te a kereskedelmi értékesítő! Teljesíts legalább 1 villámkihívást az 5
                    állomás közül, és szerezz matricát, cukorkát vagy névre szóló{' '}
                    <strong className="font-bold text-amber-300">„Kis kereskedő” oklevelet</strong>.
                  </p>
                </div>

                <div className="hidden sm:block relative h-56 lg:h-64 w-full bg-[#162A5C] overflow-hidden mt-2">
                  {!heroImgFailed ? (
                    <img
                      src={IMAGES.heroRetail}
                      alt="Kereskedelmi értékesítő tanulók friss gyümölcspultnál és mérlegnél"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-amber-300 p-8">
                      <Store className="w-12 h-12 mb-2" />
                      <span className="font-display text-xl font-bold">
                        Kereskedelmi értékesítő szak
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1D40]/90 via-[#0F1D40]/20 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200 font-medium">
                    <span>3 000 Ft-os bevásárlás · Titkos doboz · Polc & Mérés · Kassza · PLU</span>
                  </div>
                </div>
              </div>

              {/* Right: Crisp Tactile Expo Pass Registration Card + Partners */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                <form
                  onSubmit={handleStartSession}
                  className="flex-1 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 tactile-card p-5 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5"
                >
                  <div>
                    <p className="text-xs font-bold text-[#E11D48]">Kiállítási belépőkártya</p>
                    <h2 className="mt-0.5 text-xl sm:text-2xl font-extrabold text-[#0F1D40]">
                      Indulhat a kihívás!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      A neved, osztályod és iskolád megjelenik a játékban, a toplistán és az
                      okleveleden is.
                    </p>

                    <div className="mt-4 space-y-3">
                      <div>
                        <label
                          htmlFor="player-name"
                          className="block text-xs font-bold text-[#0F1D40] mb-1"
                        >
                          Teljes neved
                        </label>
                        <input
                          id="player-name"
                          type="text"
                          autoComplete="name"
                          required
                          value={nameInput}
                          onChange={(e) => {
                            setNameInput(e.target.value);
                            setFormError(null);
                          }}
                          placeholder="pl. Kovács Bence"
                          className="w-full min-h-[48px] rounded-2xl border-2 border-slate-200 bg-[#F4F5F8] px-4 py-2.5 text-base font-medium text-[#0B1220] placeholder:text-slate-400 focus:border-[#0F1D40] focus:bg-white focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-12 gap-2.5 sm:gap-3">
                        <div className="col-span-4">
                          <label
                            htmlFor="player-class"
                            className="block text-xs font-bold text-[#0F1D40] mb-1"
                          >
                            Osztályod
                          </label>
                          <input
                            id="player-class"
                            type="text"
                            required
                            value={classInput}
                            onChange={(e) => {
                              setClassInput(e.target.value);
                              setFormError(null);
                            }}
                            placeholder="pl. 8.a"
                            className="w-full min-h-[48px] rounded-2xl border-2 border-slate-200 bg-[#F4F5F8] px-3 sm:px-4 py-2.5 text-base font-medium text-[#0B1220] placeholder:text-slate-400 focus:border-[#0F1D40] focus:bg-white focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="col-span-8">
                          <label
                            htmlFor="player-school"
                            className="block text-xs font-bold text-[#0F1D40] mb-1"
                          >
                            Iskolád neve
                          </label>
                          <input
                            id="player-school"
                            type="text"
                            required
                            value={schoolInput}
                            onChange={(e) => {
                              setSchoolInput(e.target.value);
                              setFormError(null);
                            }}
                            placeholder="pl. Miskolci Kazinczy Ált. Isk."
                            className="w-full min-h-[48px] rounded-2xl border-2 border-slate-200 bg-[#F4F5F8] px-3.5 sm:px-4 py-2.5 text-base font-medium text-[#0B1220] placeholder:text-slate-400 focus:border-[#0F1D40] focus:bg-white focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {formError && (
                      <p role="alert" className="mt-3 text-xs font-bold text-rose-600">
                        {formError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="tactile-btn w-full min-h-[54px] rounded-2xl bg-[#E11D48] px-5 py-3.5 text-base font-bold text-white hover:bg-[#BE123C] transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Kihívás indítása
                  </button>
                </form>

                {/* Partner Showcase Strip */}
                <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200 tactile-card p-4">
                  <p className="text-xs font-bold text-slate-500 mb-2.5">
                    Együttműködő kereskedelmi partnereink
                  </p>
                  <PartnerLogos />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HUB SCREEN (Midnight Cobalt Expo Pass + 5 Station Ticket Cards) */}
        {screen === 'hub' && player && (
          <div className="space-y-6">
            {/* Midnight Cobalt Player Pass with Progress Ring */}
            <section className="rounded-3xl bg-[#0F1D40] text-white p-5 sm:p-7 tactile-card">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
                <div className="flex items-center gap-4 min-w-0">
                  {/* SVG Circular Progress Ring */}
                  <div className="relative flex h-16 w-16 items-center justify-center shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
                      <circle
                        cx="32"
                        cy="32"
                        r={ringRadius}
                        stroke="rgba(255,255,255,0.16)"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r={ringRadius}
                        stroke="#FBBF24"
                        strokeWidth="6"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <span className="absolute font-mono tabular-nums text-sm font-bold text-amber-300">
                      {completedCount}/{CHALLENGES.length}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-300">
                      Kiállítási belépőkártya · {SCHOOL_SHORT_NAME}
                    </p>
                    <h1 className="mt-0.5 text-xl sm:text-2xl font-extrabold truncate">
                      {player.name}
                    </h1>
                    <p className="mt-0.5 text-xs sm:text-sm text-slate-300 truncate">
                      <strong className="font-bold text-white">{player.className}</strong>{' '}
                      <span aria-hidden="true">·</span> {player.school}
                    </p>
                  </div>
                </div>

                {/* Right controls & total score */}
                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 lg:justify-end">
                  <div className="rounded-2xl bg-white/10 px-3.5 sm:px-4 py-2 text-right">
                    <span className="block text-[11px] text-slate-300">Összpontszám</span>
                    <span className="font-mono tabular-nums text-lg sm:text-xl font-bold text-amber-300 whitespace-nowrap">
                      {totalScore} <span className="text-xs font-normal text-slate-300">/ 500</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={muted ? 'Hang bekapcsolása' : 'Hang némítása'}
                    className="min-h-[44px] min-w-[44px] rounded-xl bg-white/10 text-white hover:bg-white/20 inline-flex items-center justify-center transition-colors shrink-0"
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleNewPlayer}
                    className="min-h-[44px] rounded-xl bg-white/10 px-3.5 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    Új játékos
                  </button>
                </div>
              </div>

              {/* Action Strip inside Pass */}
              <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-slate-200">
                  {completedCount === 0
                    ? 'Teljesíts legalább 1 kihívást a matrica, cukorka és a „Kis kereskedő” oklevél feloldásához!'
                    : completedCount < CHALLENGES.length
                    ? 'Az okleveled már feloldva! Játssz tovább a Mester Kereskedő rangért és a toplista éléért.'
                    : 'Minden állomást teljesítettél! Nyisd meg a Mester Kereskedő okleveledet a standnál.'}
                </p>

                {completedCount >= 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playPop();
                      setScreen('certificate');
                    }}
                    className="tactile-btn min-h-[46px] rounded-2xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-[#0F1D40] hover:bg-amber-300 transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Gift className="w-4 h-4" />
                    Oklevél és jutalom
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLaunchChallenge(nextUncompletedChallenge.id)}
                    className="tactile-btn min-h-[46px] rounded-2xl bg-[#E11D48] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#BE123C] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Első kihívás indítása
                  </button>
                )}
              </div>
            </section>

            {/* 5 Retail Station Cards */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F1D40]">
                  Kereskedelmi állomások
                </h2>
                {completedCount < CHALLENGES.length && (
                  <button
                    type="button"
                    onClick={() => handleLaunchChallenge(nextUncompletedChallenge.id)}
                    className="min-h-[44px] inline-flex items-center text-xs sm:text-sm font-bold text-[#E11D48] hover:underline whitespace-nowrap shrink-0"
                  >
                    Következő: {nextUncompletedChallenge.shortTitle} →
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHALLENGES.map((ch, idx) => {
                  const res = results[ch.id];
                  const isDone = Boolean(res?.completed);
                  const isLastOddOnTablet = idx === CHALLENGES.length - 1;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleLaunchChallenge(ch.id)}
                      className={`group flex flex-col justify-between rounded-3xl border-2 p-5 text-left transition-all active:scale-[0.99] min-h-[172px] sm:min-h-[184px] tactile-card ${
                        isLastOddOnTablet ? 'md:col-span-2 lg:col-span-1' : ''
                      } ${
                        isDone
                          ? 'border-[#0F1D40] bg-amber-50/45 hover:bg-amber-50/75'
                          : 'border-slate-200 bg-white hover:border-[#0F1D40]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={`font-mono tabular-nums text-2xl font-bold leading-none ${
                              isDone ? 'text-[#0F1D40]' : 'text-slate-300 group-hover:text-[#E11D48]'
                            } transition-colors`}
                          >
                            0{ch.order}
                          </span>
                          <span className="text-xs font-medium text-slate-500 text-right">
                            {ch.durationLabel} <span aria-hidden="true">·</span> {ch.partnerTag}
                          </span>
                        </div>
                        <h3 className="mt-3 text-lg font-extrabold text-[#0B1220] group-hover:text-[#0F1D40] transition-colors">
                          {ch.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                          {ch.subtitle}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        {isDone && res ? (
                          <span className="inline-flex items-center gap-2 font-mono tabular-nums text-xs sm:text-sm font-bold text-[#0F1D40]">
                            <CheckCircle2 className="w-4 h-4 text-[#0F1D40]" />
                            <span className="bg-[#FDE047] px-2 py-0.5 rounded">
                              {res.score} / {res.maxScore} pt
                            </span>
                            <span className="font-sans font-semibold text-slate-500">
                              Újrajátszás
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm font-bold text-[#E11D48]">
                            Állomás indítása
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F1D40] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Footer Partner Strip */}
            <footer className="rounded-3xl bg-white border border-slate-200 tactile-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#0F1D40]">{SCHOOL_FULL_NAME}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {PROGRAM_NAME} szak · Együttműködő partnereink
                </p>
              </div>
              <PartnerLogos compact />
            </footer>
          </div>
        )}

        {/* ACTIVE CHALLENGE SCREEN */}
        {screen === 'challenge' && player && activeChallengeMeta && (
          <div className="space-y-3.5 sm:space-y-5">
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setScreen('hub');
                  setActiveChallengeId(null);
                  setJustFinished(null);
                }}
                className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#0F1D40] hover:border-[#0F1D40] transition-colors whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                Állomások
              </button>

              <p className="text-xs sm:text-sm text-slate-600 truncate min-w-0 text-right">
                <strong className="font-bold text-[#0F1D40]">{player.name}</strong>{' '}
                <span aria-hidden="true">·</span> {player.className}
                <span className="hidden sm:inline">
                  {' '}
                  <span aria-hidden="true">·</span> {player.school}
                </span>
              </p>
            </div>

            {justFinished ? (
              <div className="rounded-3xl bg-white border-2 border-[#0F1D40] tactile-card overflow-hidden max-w-2xl mx-auto">
                <div className="bg-[#0F1D40] text-white p-6 sm:p-8 text-center">
                  <p className="text-xs font-bold text-amber-300">
                    {activeChallengeMeta.title} · Teljesítve
                  </p>
                  <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold">
                    Szép munka, {player.name}!
                  </h2>
                  <p className="mt-3 font-mono tabular-nums text-4xl font-bold text-amber-300">
                    +{justFinished.score} pont
                  </p>
                  <p className="mt-1.5 text-sm text-slate-200">{justFinished.summary}</p>
                </div>

                <div className="p-6 sm:p-8 text-center space-y-5">
                  <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-4 text-sm text-[#0F1D40] font-semibold">
                    {completedCount === 1
                      ? 'Feloldottad a „Kis kereskedő” okleveledet és a standnál járó jutalmat!'
                      : `Már ${completedCount} / ${CHALLENGES.length} állomást teljesítettél! Összpontszámod: ${totalScore} pont.`}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {completedCount < CHALLENGES.length ? (
                      <button
                        type="button"
                        onClick={() => handleLaunchChallenge(nextUncompletedChallenge.id)}
                        className="tactile-btn min-h-[52px] rounded-2xl bg-[#E11D48] px-5 py-3 text-sm font-bold text-white hover:bg-[#BE123C] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        Következő: {nextUncompletedChallenge.shortTitle}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playCashRegister();
                          setScreen('certificate');
                        }}
                        className="tactile-btn min-h-[52px] rounded-2xl bg-[#E11D48] px-5 py-3 text-sm font-bold text-white hover:bg-[#BE123C] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <Award className="w-4 h-4" />
                        Mester Oklevél megnyitása
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playPop();
                        setScreen('certificate');
                      }}
                      className="min-h-[52px] rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0F1D40] hover:border-[#0F1D40] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Award className="w-4 h-4" />
                      Oklevél megtekintése
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playPop();
                      setScreen('hub');
                      setActiveChallengeId(null);
                      setJustFinished(null);
                    }}
                    className="min-h-[40px] text-xs sm:text-sm font-bold text-slate-500 hover:text-[#0F1D40]"
                  >
                    Vissza az állomások listájához
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {activeChallengeId === 'shopping' && (
                  <ShoppingChallenge
                    onComplete={(score, summary) =>
                      handleChallengeComplete('shopping', score, summary)
                    }
                  />
                )}
                {activeChallengeId === 'mystery' && (
                  <MysteryBoxChallenge
                    onComplete={(score, summary) =>
                      handleChallengeComplete('mystery', score, summary)
                    }
                  />
                )}
                {activeChallengeId === 'shelf' && (
                  <ShelfAndPackChallenge
                    onComplete={(score, summary) =>
                      handleChallengeComplete('shelf', score, summary)
                    }
                  />
                )}
                {activeChallengeId === 'pricing' && (
                  <PricingChallenge
                    onComplete={(score, summary) =>
                      handleChallengeComplete('pricing', score, summary)
                    }
                  />
                )}
                {activeChallengeId === 'produce' && (
                  <ProduceQuizChallenge
                    onComplete={(score, summary) =>
                      handleChallengeComplete('produce', score, summary)
                    }
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* CERTIFICATE SCREEN */}
        {screen === 'certificate' && player && (
          <CertificateView
            player={player}
            results={results}
            onBackToHub={() => {
              soundEngine.playPop();
              setScreen('hub');
            }}
            onNewPlayer={handleNewPlayer}
          />
        )}

        {/* LEADERBOARD SCREEN */}
        {screen === 'leaderboard' && (
          <LeaderboardView
            entries={leaderboard}
            currentPlayerId={player?.id}
            isSharedCloud={isSupabaseConfigured}
            isLoading={isLoadingLeaderboard}
            onRefresh={() => void refreshCloudLeaderboard()}
            onClearEntries={() => {
              soundEngine.playPop();
              setLeaderboard([]);
            }}
            onNewPlayer={handleNewPlayer}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      {showMobileBottomNav && (
        <nav
          aria-label="Mobil navigáció"
          className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F1D40]/95 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom)] text-white"
        >
          <div className="grid grid-cols-3 h-14 items-center">
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                setScreen('hub');
              }}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 ${
                screen === 'hub' ? 'text-amber-300 font-bold' : 'text-slate-300'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[11px] leading-none">Állomások</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                setScreen('certificate');
              }}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 ${
                screen === 'certificate' ? 'text-amber-300 font-bold' : 'text-slate-300'
              }`}
            >
              <Award className="w-5 h-5" />
              <span className="text-[11px] leading-none">Oklevél</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                setScreen('leaderboard');
              }}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 ${
                screen === 'leaderboard' ? 'text-amber-300 font-bold' : 'text-slate-300'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[11px] leading-none">Toplista</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
