import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, Package, Scale, Sparkles, XCircle } from 'lucide-react';
import {
  IMAGES,
  PACKAGING_QUESTION,
  SHELF_CATEGORIES,
  SHELF_ITEMS,
  WEIGHING_TASKS,
  formatFt,
  type ShelfCategoryId,
} from '../../data/gameData';
import { ProductArtwork } from '../ProductArtwork';
import { soundEngine } from '../../utils/sound';

interface ShelfAndPackChallengeProps {
  onComplete: (score: number, summary: string) => void;
}

type Step = 'shelf' | 'weigh' | 'pack';

export const ShelfAndPackChallenge: React.FC<ShelfAndPackChallengeProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('shelf');

  const [shelfQueueIndex, setShelfQueueIndex] = useState(0);
  const [placedByShelf, setPlacedByShelf] = useState<Record<ShelfCategoryId, string[]>>({
    fresh: [],
    dry: [],
    home: [],
  });
  const [shelfCorrect, setShelfCorrect] = useState(0);
  const [shelfFeedback, setShelfFeedback] = useState<string | null>(null);

  const weighingTask = useMemo(
    () => WEIGHING_TASKS[Math.floor(Math.random() * WEIGHING_TASKS.length)],
    []
  );
  const [currentGrams, setCurrentGrams] = useState(0);
  const [weighSubmitted, setWeighSubmitted] = useState(false);
  const [weighScore, setWeighScore] = useState(0);
  const [scaleImgFailed, setScaleImgFailed] = useState(false);

  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  const currentShelfItem = SHELF_ITEMS[shelfQueueIndex];

  const handleShelfSelect = (shelfId: ShelfCategoryId) => {
    if (!currentShelfItem) return;
    const isRight = currentShelfItem.targetShelf === shelfId;
    if (isRight) {
      soundEngine.playCorrect();
      setShelfCorrect((prev) => prev + 1);
      setShelfFeedback(`Helyes! A(z) ${currentShelfItem.name} a megfelelő polcra került.`);
    } else {
      soundEngine.playError();
      setShelfFeedback(
        `Figyelem: a(z) ${currentShelfItem.name} ide való: ${currentShelfItem.hint}.`
      );
    }

    setPlacedByShelf((prev) => ({
      ...prev,
      [currentShelfItem.targetShelf]: [...prev[currentShelfItem.targetShelf], currentShelfItem.name],
    }));

    if (shelfQueueIndex + 1 < SHELF_ITEMS.length) {
      setShelfQueueIndex((prev) => prev + 1);
    } else {
      setTimeout(() => {
        setStep('weigh');
      }, 450);
    }
  };

  const adjustWeight = (delta: number) => {
    if (weighSubmitted) return;
    soundEngine.playPop();
    setCurrentGrams((prev) => Math.max(0, Math.min(600, prev + delta)));
  };

  const handleConfirmWeight = () => {
    const diff = Math.abs(currentGrams - weighingTask.targetGrams);
    setWeighSubmitted(true);
    if (diff <= weighingTask.toleranceGrams) {
      soundEngine.playCorrect();
      setWeighScore(35);
    } else if (diff <= 40) {
      soundEngine.playPop();
      setWeighScore(22);
    } else {
      soundEngine.playError();
      setWeighScore(10);
    }
  };

  const handlePickPackaging = (optId: string) => {
    if (selectedPackId) return;
    setSelectedPackId(optId);
    const chosen = PACKAGING_QUESTION.options.find((o) => o.id === optId);
    if (chosen?.isBest) {
      soundEngine.playCorrect();
    } else {
      soundEngine.playError();
    }
  };

  const handleFinishAll = () => {
    const shelfPts = Math.round((shelfCorrect / SHELF_ITEMS.length) * 40);
    const packChosen = PACKAGING_QUESTION.options.find((o) => o.id === selectedPackId);
    const packPts = packChosen?.isBest ? 25 : 10;
    const totalScore = Math.min(100, shelfPts + weighScore + packPts);
    soundEngine.playCashRegister();
    onComplete(
      totalScore,
      `Polc: ${shelfCorrect}/${SHELF_ITEMS.length} · Mérés: ${currentGrams} g · Csomagolás kész`
    );
  };

  const stepLabels: { id: Step; label: string }[] = [
    { id: 'shelf', label: '1. Polcrendezés' },
    { id: 'weigh', label: '2. Mérés' },
    { id: 'pack', label: '3. Csomagolás' },
  ];

  return (
    <div className="space-y-5">
      {/* Midnight Cobalt Header */}
      <div className="rounded-3xl bg-[#0F1D40] text-white p-5 sm:p-6 tactile-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-amber-300 font-medium">
              03. állomás · Interspar Partnerfeladat
            </p>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold">
              Polcrendezés, Mérés és Kreatív Csomagolás
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            {stepLabels.map((s, i) => (
              <React.Fragment key={s.id}>
                <span
                  className={
                    step === s.id
                      ? 'text-amber-300 underline underline-offset-4 decoration-2'
                      : 'text-slate-400'
                  }
                >
                  {s.label}
                </span>
                {i < stepLabels.length - 1 && (
                  <span className="text-white/25" aria-hidden="true">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 1: Fast Shelf Sorting */}
      {step === 'shelf' && currentShelfItem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 tactile-card p-4 sm:p-6 flex flex-row lg:flex-col items-center lg:justify-center gap-4 lg:text-center">
            <div className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-2xl sm:rounded-3xl bg-[#F4F5F8] border-2 border-slate-200 shrink-0">
              <ProductArtwork art={currentShelfItem.art} className="w-14 h-14 sm:w-20 sm:h-20" />
            </div>
            <div className="min-w-0 flex-1 lg:flex-none">
              <p className="text-xs font-bold text-[#0F1D40]">
                Beérkező áru ({shelfQueueIndex + 1} / {SHELF_ITEMS.length})
              </p>
              <h3 className="mt-0.5 text-lg sm:text-2xl font-bold text-[#0B1220]">
                {currentShelfItem.name}
              </h3>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
                Koppints a megfelelő polcra!
              </p>
              {shelfFeedback && (
                <p className="mt-2.5 text-xs font-semibold text-[#0F1D40] bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  {shelfFeedback}
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-2.5 sm:space-y-3">
            {SHELF_CATEGORIES.map((shelf, index) => {
              const itemsOnShelf = placedByShelf[shelf.id];
              return (
                <button
                  key={shelf.id}
                  type="button"
                  onClick={() => handleShelfSelect(shelf.id)}
                  className="w-full min-h-[76px] sm:min-h-[92px] rounded-2xl sm:rounded-3xl border-2 border-slate-200 bg-white p-3.5 sm:p-5 text-left hover:border-[#0F1D40] hover:bg-indigo-50/30 active:scale-[0.99] transition-all tactile-card flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono font-bold text-slate-400">0{index + 1}. SOR</p>
                    <p className="text-sm sm:text-lg font-bold text-[#0B1220] mt-0.5">
                      {shelf.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{shelf.subtitle}</p>
                    {itemsOnShelf.length > 0 && (
                      <p className="mt-1.5 text-xs font-bold text-[#0F1D40] truncate">
                        Polcon: {itemsOnShelf.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-xl bg-[#0F1D40] px-3 py-2 text-xs font-bold text-amber-300">
                    Ide teszem
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Dry Goods Weighing */}
      {step === 'weigh' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 tactile-card overflow-hidden flex flex-col">
            <div className="h-32 sm:h-auto sm:aspect-[4/3] w-full bg-slate-100 overflow-hidden">
              {!scaleImgFailed ? (
                <img
                  src={IMAGES.dryGoodsScale}
                  alt="Száraztészta, vörösbab és sárgaborsó digitális mérleggel"
                  referrerPolicy="no-referrer"
                  onError={() => setScaleImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Scale className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-xs font-bold text-[#E11D48]">Mérési feladat · Kimért szárazáru</p>
              <h3 className="mt-0.5 text-base sm:text-lg font-bold text-[#0B1220]">
                Mérj ki pontosan {weighingTask.targetGrams} g {weighingTask.itemName.toLowerCase()}t!
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Egységár:{' '}
                <span className="font-mono tabular-nums font-bold text-[#0F1D40]">
                  {formatFt(weighingTask.unitPricePerKg)}/kg
                </span>{' '}
                · Tűrés: ±{weighingTask.toleranceGrams} g
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 tactile-card p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5">
            {/* Digital Retail Scale Console */}
            <div className="rounded-2xl bg-[#0B1220] p-5 text-white border-2 border-[#1E3368]">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>DIGITÁLIS MÉRLEG</span>
                <span className="tabular-nums text-amber-300">
                  CÉL: {weighingTask.targetGrams} g
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <div>
                  <span className="font-mono tabular-nums text-4xl sm:text-5xl font-bold tracking-tight text-amber-300">
                    {currentGrams}
                  </span>
                  <span className="ml-1.5 font-mono text-lg text-slate-300">g</span>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] text-slate-400">Számított ár</span>
                  <span className="font-mono tabular-nums text-xl font-bold text-white">
                    {formatFt(Math.round((currentGrams / 1000) * weighingTask.unitPricePerKg))}
                  </span>
                </div>
              </div>

              <div className="mt-4 h-3 w-full rounded-full bg-white/15 overflow-hidden relative">
                <div
                  className="h-full bg-amber-400 transition-all duration-150 rounded-full"
                  style={{ width: `${Math.min(100, (currentGrams / 500) * 100)}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-[#F43F5E]"
                  style={{ left: `${(weighingTask.targetGrams / 500) * 100}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>

            {!weighSubmitted ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { label: '+100 g', delta: 100 },
                    { label: '+50 g', delta: 50 },
                    { label: '+10 g', delta: 10 },
                    { label: '−10 g', delta: -10 },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => adjustWeight(btn.delta)}
                      className="min-h-[54px] rounded-2xl border-2 border-slate-200 bg-[#F4F5F8] font-mono tabular-nums text-sm font-bold text-[#0F1D40] hover:border-[#0F1D40] hover:bg-amber-50 active:scale-[0.96] transition-all"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playPop();
                      setCurrentGrams(0);
                    }}
                    className="min-h-[50px] rounded-2xl border-2 border-slate-200 px-4 text-sm font-bold text-[#0F1D40] hover:bg-slate-50 whitespace-nowrap"
                  >
                    Tára (0 g)
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmWeight}
                    className="tactile-btn min-h-[50px] flex-1 rounded-2xl bg-[#E11D48] px-5 text-sm font-bold text-white hover:bg-[#BE123C] transition-all whitespace-nowrap"
                  >
                    Mérés rögzítése
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-[#0F1D40] shrink-0 mt-0.5" />
                  <div className="text-sm text-[#0B1220]">
                    <p className="font-bold">
                      Kimért tömeg: <span className="font-mono tabular-nums">{currentGrams} g</span>{' '}
                      (Cél: {weighingTask.targetGrams} g)
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-700">
                      {Math.abs(currentGrams - weighingTask.targetGrams) <= weighingTask.toleranceGrams
                        ? 'Hajszálpontos mérés! Így dolgozik egy profi kereskedelmi értékesítő.'
                        : 'Jó közelítés! A gyakorlatban a digitális tárázás segít a grammra pontos kimérésben.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playPop();
                    setStep('pack');
                  }}
                  className="tactile-btn w-full min-h-[50px] rounded-2xl bg-[#0F1D40] px-5 text-sm font-bold text-amber-300 hover:bg-[#162A5C] inline-flex items-center justify-center gap-2"
                >
                  Tovább a csomagoláshoz
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Creative Packaging */}
      {step === 'pack' && (
        <div className="rounded-3xl bg-white border border-slate-200 tactile-card p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F1D40] text-amber-300 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#E11D48]">Kreatív csomagolási kihívás</p>
              <h3 className="mt-0.5 text-lg sm:text-xl font-bold text-[#0B1220]">
                {PACKAGING_QUESTION.scenario}
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {PACKAGING_QUESTION.options.map((opt) => {
              const isSelected = selectedPackId === opt.id;
              const isAnswered = selectedPackId !== null;
              let cardClass =
                'border-slate-200 bg-white hover:border-[#0F1D40] hover:bg-indigo-50/30';
              if (isAnswered) {
                if (opt.isBest) {
                  cardClass = 'border-[#0F1D40] bg-amber-50 ring-2 ring-amber-400';
                } else if (isSelected && !opt.isBest) {
                  cardClass = 'border-rose-400 bg-rose-50/80';
                } else {
                  cardClass = 'border-slate-200 bg-slate-50 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handlePickPackaging(opt.id)}
                  className={`w-full min-h-[70px] rounded-2xl border-2 p-4 text-left transition-all ${cardClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm sm:text-base font-bold text-[#0B1220]">{opt.title}</p>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">{opt.detail}</p>
                    </div>
                    {isAnswered && opt.isBest && (
                      <CheckCircle2 className="w-5 h-5 text-[#0F1D40] shrink-0 mt-0.5" />
                    )}
                    {isAnswered && isSelected && !opt.isBest && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedPackId && (
            <div className="rounded-2xl bg-[#F4F5F8] border border-slate-200 p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-sm text-[#0B1220]">
                <Sparkles className="w-4 h-4 text-[#0F1D40] shrink-0 mt-0.5" />
                <p>
                  {PACKAGING_QUESTION.options.find((o) => o.id === selectedPackId)?.feedback}
                </p>
              </div>
              <button
                type="button"
                onClick={handleFinishAll}
                className="tactile-btn w-full min-h-[50px] rounded-2xl bg-[#E11D48] px-5 text-sm font-bold text-white hover:bg-[#BE123C] transition-all inline-flex items-center justify-center gap-2"
              >
                Állomás lezárása és pontok mentése
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
