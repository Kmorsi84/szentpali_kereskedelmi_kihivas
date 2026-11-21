import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Hand, XCircle } from 'lucide-react';
import { IMAGES, MYSTERY_ITEMS, type MysteryItem } from '../../data/gameData';
import { ProductArtwork } from '../ProductArtwork';
import { soundEngine } from '../../utils/sound';

interface MysteryBoxChallengeProps {
  onComplete: (score: number, summary: string) => void;
}

function pickRandomRounds(items: MysteryItem[], count: number): MysteryItem[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export const MysteryBoxChallenge: React.FC<MysteryBoxChallengeProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<'digital' | 'booth'>('digital');
  const rounds = useMemo(() => pickRandomRounds(MYSTERY_ITEMS, 3), []);
  const [roundIndex, setRoundIndex] = useState(0);
  const [revealedClues, setRevealedClues] = useState(1);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  const currentItem = rounds[roundIndex];

  const options = useMemo(() => {
    const distractors = MYSTERY_ITEMS.filter((item) => item.id !== currentItem.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [currentItem, ...distractors].sort((a, b) => a.name.localeCompare(b.name, 'hu'));
  }, [currentItem]);

  const handleRevealMore = () => {
    if (revealedClues < 3) {
      soundEngine.playPop();
      setRevealedClues((prev) => prev + 1);
    }
  };

  const handleGuess = (itemId: string) => {
    if (selectedGuess) return;
    setSelectedGuess(itemId);
    const isCorrect = itemId === currentItem.id;
    if (isCorrect) {
      soundEngine.playCorrect();
      // Reward fewer clues needed: 1 clue = 34 pts, 2 clues = 30 pts, 3 clues = 26 pts (max ~100 across 3 rounds)
      const roundPts = mode === 'booth' ? 34 : revealedClues === 1 ? 34 : revealedClues === 2 ? 30 : 27;
      setScore((prev) => Math.min(100, prev + roundPts));
      setCorrectCount((prev) => prev + 1);
    } else {
      soundEngine.playError();
    }
  };

  const handleNext = () => {
    soundEngine.playPop();
    if (roundIndex + 1 < rounds.length) {
      setRoundIndex((prev) => prev + 1);
      setRevealedClues(1);
      setSelectedGuess(null);
    } else {
      const finalScore = correctCount === 3 && score >= 90 ? 100 : score;
      onComplete(finalScore, `${correctCount} / ${rounds.length} titkos termék felismerve`);
    }
  };

  const isAnswered = selectedGuess !== null;
  const isCorrect = selectedGuess === currentItem.id;

  return (
    <div className="space-y-5">
      {/* Header + Mode Switch */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">
              2. állomás · {roundIndex + 1} / {rounds.length}. kör · Coop Partnerfeladat
            </p>
            <h2 className="mt-0.5 text-lg sm:text-xl font-bold text-slate-900">
              Felismered, mit rejt a titkos doboz?
            </h2>
          </div>
          <div
            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 self-start sm:self-auto"
            role="group"
            aria-label="Játékmód"
          >
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                setMode('digital');
              }}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'digital'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Telefonos tapintás
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                setMode('booth');
              }}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'booth'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stand valódi doboza
            </button>
          </div>
        </div>
      </div>

      {/* Main layout: Mystery box visual + clues on left, answer options on right on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Mystery Box Stage */}
        <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col">
          <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
            {!imageFailed ? (
              <img
                src={IMAGES.mysteryBox}
                alt="Titkos doboz tapintó nyílással"
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 p-6">
                <Hand className="w-10 h-10 mb-2" />
                <span className="text-sm font-medium">Titkos doboz</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
              <div>
                <p className="text-xs text-slate-200">Vajon felismered, mit vásárolnál?</p>
                <p className="text-base font-bold">
                  {isAnswered ? currentItem.name : 'Nyúlj be képzeletben a dobozba'}
                </p>
              </div>
              {isAnswered && (
                <div className="rounded-xl bg-white/95 p-1.5 shadow-sm">
                  <ProductArtwork art={currentItem.art} className="w-11 h-11" />
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
            {mode === 'booth' ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">
                  Valódi doboz mód a kiállítási standon
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Dugj be egy kezet a standon lévő titkos dobozba, tapogasd meg alaposan a terméket,
                  majd válaszd ki a jobb oldali kártyák közül, mit érzel! Ha segítség kell, nézd meg az első nyomot:
                </p>
                <p className="text-sm text-emerald-800 font-medium pt-1">
                  Tipp: {currentItem.clues[0]}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Tapintási nyomok ({revealedClues} / 3)
                  </span>
                  {revealedClues < 3 && !isAnswered && (
                    <button
                      type="button"
                      onClick={handleRevealMore}
                      className="min-h-[36px] inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-200 transition-colors whitespace-nowrap"
                    >
                      <Hand className="w-3.5 h-3.5" />
                      Még jobban megtapintom
                    </button>
                  )}
                </div>

                <ol className="space-y-2.5 text-sm text-slate-700">
                  {currentItem.clues.slice(0, revealedClues).map((clue, idx) => (
                    <li
                      key={idx}
                      className="rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 leading-relaxed"
                    >
                      {clue}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Right: 4 tactile item choices + feedback */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex-1 flex flex-col">
            <p className="text-sm font-semibold text-slate-900">
              Melyik bolti termék van a dobozban?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 flex-1">
              {options.map((opt) => {
                const chosen = selectedGuess === opt.id;
                const rightOption = opt.id === currentItem.id;
                let styleClass =
                  'border-slate-200 bg-white hover:border-emerald-600 hover:bg-emerald-50/30 text-slate-900';
                if (isAnswered) {
                  if (rightOption) {
                    styleClass = 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600';
                  } else if (chosen && !rightOption) {
                    styleClass = 'border-red-500 bg-red-50 text-red-950';
                  } else {
                    styleClass = 'border-slate-200 bg-slate-50/70 opacity-55 text-slate-600';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleGuess(opt.id)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all active:scale-[0.98] min-h-[124px] ${styleClass}`}
                  >
                    <ProductArtwork art={opt.art} className="w-14 h-14" />
                    <span className="text-sm font-semibold text-center">{opt.name}</span>
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div
                className={`mt-4 rounded-xl border p-4 ${
                  isCorrect
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/80 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <p className="font-semibold">
                      {isCorrect
                        ? `Telitalálat! Ez bizony ${currentItem.name.toLowerCase()}.`
                        : `A helyes válasz: ${currentItem.name}.`}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {currentItem.retailFact}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-4 w-full min-h-[48px] rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
                >
                  {roundIndex + 1 < rounds.length ? 'Következő titkos termék' : 'Állomás befejezése'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
