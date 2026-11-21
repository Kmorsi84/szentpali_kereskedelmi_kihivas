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
  UserCheck,
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

  // Registration form fields
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

      setLeaderboard((prev) => {
        const entry: LeaderboardEntry = {
          id: player.id,
          name: player.name,
          className: player.className,
          school: player.school,
          totalScore: nextTotalScore,
          completedCount: nextCompletedCount,
          updatedAt: new Date().toISOString(),
        };
        const exists = prev.some((item) => item.id === player.id);
        return exists ? prev.map((item) => (item.id === player.id ? entry : item)) : [entry, ...prev];
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeChallengeMeta = activeChallengeId
    ? CHALLENGES.find((c) => c.id === activeChallengeId) ?? null
    : null;

  const showMobileBottomNav = Boolean(player) && screen !== 'challenge' && screen !== 'welcome';

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-slate-900">
      {/* Top Bar (Strict 3-Zone Contract: Brand — Concise Nav — Single Primary Action) */}
      <header className="no-print sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-6">
          {/* Zone 1: Single-line brand wordmark */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              setScreen(player ? 'hub' : 'welcome');
              setActiveChallengeId(null);
              setJustFinished(null);
            }}
            className="font-display text-base sm:text-lg font-bold tracking-tight text-emerald-900 whitespace-nowrap shrink-0 text-left"
          >
            Szentpáli Kihívás
          </button>

          {/* Zone 2: Concise single-line desktop nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {player && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setScreen('hub');
                  setActiveChallengeId(null);
                }}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                  screen === 'hub' ? 'text-emerald-800 font-semibold underline underline-offset-4' : ''
                }`}
              >
                Állomások
              </button>
            )}
            {player && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setScreen('certificate');
                  setActiveChallengeId(null);
                }}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                  screen === 'certificate'
                    ? 'text-emerald-800 font-semibold underline underline-offset-4'
                    : ''
                }`}
              >
                Oklevél
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                setScreen('leaderboard');
                setActiveChallengeId(null);
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                screen === 'leaderboard'
                  ? 'text-emerald-800 font-semibold underline underline-offset-4'
                  : ''
              }`}
            >
              Toplista
            </button>
          </nav>

          {/* Zone 3: Single contextual primary action */}
          <div className="shrink-0">
            {player ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setScreen('certificate');
                  setActiveChallengeId(null);
                }}
                className="min-h-[38px] rounded-lg bg-emerald-700 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
              >
                {completedCount >= 1 ? 'Oklevél megnyitása' : `Haladás: ${completedCount}/5`}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setScreen(screen === 'leaderboard' ? 'welcome' : 'leaderboard');
                }}
                className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
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
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              {/* Left: Intro + Fast Expo Registration Form */}
              <div className="lg:col-span-6 flex flex-col justify-between gap-6">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-800">
                    {SCHOOL_FULL_NAME}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {PROGRAM_NAME} szak · Pályaválasztási kiállítás
                  </p>
                  <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12]">
                    Mérj, csomagolj és számolj!
                  </h1>
                  <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-xl">
                    Légy te a kereskedelmi értékesítő néhány perc alatt! Teljesíts legalább 1
                    kihívást az 5 állomás közül, és szerezz matricát, cukorkát vagy névre szóló{' '}
                    <strong className="font-semibold text-slate-900">„Kis kereskedő” oklevelet</strong>.
                  </p>
                </div>

                {/* Registration Form */}
                <form
                  onSubmit={handleStartSession}
                  className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Add meg az adataidat az oklevélhez
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      A neved, osztályod és iskolád megjelenik a játékban és az okleveleden is.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="player-name"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Teljes neved
                      </label>
                      <input
                        id="player-name"
                        type="text"
                        required
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          setFormError(null);
                        }}
                        placeholder="pl. Kovács Bence"
                        className="w-full min-h-[46px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4">
                        <label
                          htmlFor="player-class"
                          className="block text-xs font-semibold text-slate-700 mb-1"
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
                          className="w-full min-h-[46px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15"
                        />
                      </div>

                      <div className="sm:col-span-8">
                        <label
                          htmlFor="player-school"
                          className="block text-xs font-semibold text-slate-700 mb-1"
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
                          placeholder="pl. Miskolci Kazinczy Általános Iskola"
                          className="w-full min-h-[46px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15"
                        />
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <p role="alert" className="text-xs font-semibold text-red-700">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full min-h-[52px] rounded-xl bg-emerald-700 px-5 py-3.5 text-base font-semibold text-white hover:bg-emerald-800 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Kihívás indítása
                  </button>
                </form>
              </div>

              {/* Right: Editorial Retail Hero Photo + Partners */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="relative flex-1 min-h-[240px] rounded-2xl overflow-hidden bg-slate-200 border border-slate-200">
                  {!heroImgFailed ? (
                    <img
                      src={IMAGES.heroRetail}
                      alt="Kereskedelmi értékesítő tanulók friss gyümölcspultnál és mérlegnél"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-full lg:h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-900 text-white p-8">
                      <Store className="w-12 h-12 mb-3 text-emerald-300" />
                      <span className="font-display text-xl font-bold">
                        Kereskedelmi értékesítő szak
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs text-emerald-200 font-medium">
                      5 gyors állomás · 2–3 perc játékidő
                    </p>
                    <p className="mt-1 text-base sm:text-lg font-bold leading-snug">
                      3 000 Ft-os bevásárlás, titkos doboz, polcrendezés, mérés és kassza
                      árkalkuláció
                    </p>
                  </div>
                </div>

                {/* Partner Showcase Strip */}
                <div className="rounded-2xl bg-white border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    Duális és együttműködő partnereink
                  </p>
                  <PartnerLogos />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HUB SCREEN (Player Profile + 5 Expo Stations) */}
        {screen === 'hub' && player && (
          <div className="space-y-6">
            {/* Player Pass Card (Displays Name, Class, School clearly!) */}
            <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-emerald-700">
                      Kiállítási résztvevő · {SCHOOL_SHORT_NAME}
                    </p>
                    <h1 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900 truncate">
                      {player.name}
                    </h1>
                    <p className="mt-0.5 text-xs sm:text-sm text-slate-600 truncate">
                      {player.school} <span aria-hidden="true">·</span>{' '}
                      <strong className="font-semibold text-slate-800">{player.className}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={muted ? 'Hang bekapcsolása' : 'Hang némítása'}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center transition-colors"
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleNewPlayer}
                    className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <UserPlus className="w-4 h-4" />
                    Új játékos
                  </button>
                </div>
              </div>

              {/* Progress + Reward metrics */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <span className="block text-xs text-slate-500">Teljesített kihívás</span>
                  <span className="font-mono tabular-nums text-xl sm:text-2xl font-bold text-slate-900">
                    {completedCount} / {CHALLENGES.length}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500">Összpontszám</span>
                  <span className="font-mono tabular-nums text-xl sm:text-2xl font-bold text-emerald-700">
                    {totalScore} <span className="text-sm font-normal text-slate-400">/ 500</span>
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 flex sm:justify-end">
                  {completedCount >= 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playPop();
                        setScreen('certificate');
                      }}
                      className="w-full sm:w-auto min-h-[44px] rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Gift className="w-4 h-4" />
                      Oklevél és jutalom
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleLaunchChallenge(nextUncompletedChallenge.id)}
                      className="w-full sm:w-auto min-h-[44px] rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Első kihívás indítása
                    </button>
                  )}
                </div>
              </div>

              {/* Clean progress bar */}
              <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / CHALLENGES.length) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {completedCount === 0
                  ? 'Teljesíts legalább 1 kihívást a matrica, cukorka és a „Kis kereskedő” oklevél feloldásához!'
                  : completedCount < CHALLENGES.length
                  ? 'Az okleveled már feloldva! Játssz tovább a magasabb rangért és a toplista éléért.'
                  : 'Minden állomást teljesítettél! Nyisd meg a Mester Kereskedő okleveledet a standnál.'}
              </p>
            </section>

            {/* 5 Stations Grid */}
            <section className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Kereskedelmi állomások
                </h2>
                {completedCount < CHALLENGES.length && (
                  <button
                    type="button"
                    onClick={() => handleLaunchChallenge(nextUncompletedChallenge.id)}
                    className="text-xs sm:text-sm font-semibold text-emerald-800 hover:underline whitespace-nowrap"
                  >
                    Következő: {nextUncompletedChallenge.shortTitle} →
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHALLENGES.map((ch) => {
                  const res = results[ch.id];
                  const isDone = Boolean(res?.completed);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleLaunchChallenge(ch.id)}
                      className={`group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all active:scale-[0.99] min-h-[168px] ${
                        isDone
                          ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400'
                          : 'border-slate-200 bg-white hover:border-emerald-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                          <span>
                            0{ch.order}. állomás <span aria-hidden="true">·</span> {ch.durationLabel}{' '}
                            <span aria-hidden="true">·</span> {ch.partnerTag}
                          </span>
                          {isDone && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          )}
                        </div>
                        <h3 className="mt-2 text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {ch.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                          {ch.subtitle}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        {isDone && res ? (
                          <span className="font-mono tabular-nums text-xs sm:text-sm font-bold text-emerald-800">
                            {res.score} / {res.maxScore} pont · Újrajátszás
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm font-semibold text-emerald-800">
                            Kihívás indítása
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Footer Partner Strip */}
            <footer className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-800">{SCHOOL_FULL_NAME}</p>
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
          <div className="space-y-5">
            {/* Compact contextual sub-header showing Back + Player Name/Class/School */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setScreen('hub');
                  setActiveChallengeId(null);
                  setJustFinished(null);
                }}
                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                Állomások
              </button>

              <p className="text-xs sm:text-sm text-slate-600 truncate max-w-full">
                <strong className="font-semibold text-slate-900">{player.name}</strong>{' '}
                <span aria-hidden="true">·</span> {player.className}{' '}
                <span aria-hidden="true">·</span> {player.school}
              </p>
            </div>

            {/* Post-challenge celebration / next-step card */}
            {justFinished ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 max-w-2xl mx-auto text-center space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-700">
                    {activeChallengeMeta.title} · Teljesítve
                  </p>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
                    Szép munka, {player.name}!
                  </h2>
                  <p className="mt-2 font-mono tabular-nums text-3xl font-bold text-emerald-700">
                    +{justFinished.score} pont
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{justFinished.summary}</p>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-950">
                  <p className="font-semibold">
                    {completedCount === 1
                      ? 'Feloldottad a „Kis kereskedő” okleveledet és a standnál járó jutalmat!'
                      : `Már ${completedCount} / ${CHALLENGES.length} állomást teljesítettél! Összpontszámod: ${totalScore} pont.`}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {completedCount < CHALLENGES.length ? (
                    <button
                      type="button"
                      onClick={() => handleLaunchChallenge(nextUncompletedChallenge.id)}
                      className="min-h-[50px] rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
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
                      className="min-h-[50px] rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
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
                    className="min-h-[50px] rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
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
                  className="min-h-[40px] text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900"
                >
                  Vissza az állomások listájához
                </button>
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
            onClearEntries={() => {
              soundEngine.playPop();
              setLeaderboard([]);
            }}
            onNewPlayer={handleNewPlayer}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar (Thumb-Zone Ergonomics, shown on phones when logged in outside active play) */}
      {showMobileBottomNav && (
        <nav
          aria-label="Mobil navigáció"
          className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe"
        >
          <div className="grid grid-cols-3 h-14 items-center">
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                setScreen('hub');
              }}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 ${
                screen === 'hub' ? 'text-emerald-700 font-semibold' : 'text-slate-500'
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
                screen === 'certificate' ? 'text-emerald-700 font-semibold' : 'text-slate-500'
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
                screen === 'leaderboard' ? 'text-emerald-700 font-semibold' : 'text-slate-500'
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
