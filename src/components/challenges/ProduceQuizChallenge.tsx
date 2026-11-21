import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Leaf, XCircle } from 'lucide-react';
import { PRODUCE_QUIZ_ITEMS } from '../../data/gameData';
import { soundEngine } from '../../utils/sound';

interface ProduceQuizChallengeProps {
  onComplete: (score: number, summary: string) => void;
}

export const ProduceQuizChallenge: React.FC<ProduceQuizChallengeProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const current = PRODUCE_QUIZ_ITEMS[index];
  const isAnswered = selected !== null;
  const isCorrect = selected === current.correctName;

  const handleChoose = (option: string) => {
    if (isAnswered) return;
    setSelected(option);
    if (option === current.correctName) {
      soundEngine.playCorrect();
      setCorrectCount((prev) => prev + 1);
    } else {
      soundEngine.playError();
    }
  };

  const handleNext = () => {
    soundEngine.playPop();
    if (index + 1 < PRODUCE_QUIZ_ITEMS.length) {
      setIndex((prev) => prev + 1);
      setSelected(null);
    } else {
      const score = Math.round((correctCount / PRODUCE_QUIZ_ITEMS.length) * 100);
      soundEngine.playCashRegister();
      onComplete(score, `${correctCount} / ${PRODUCE_QUIZ_ITEMS.length} zöldség-gyümölcs felismerve`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">
              5. állomás · {index + 1} / {PRODUCE_QUIZ_ITEMS.length}. kép · Interspar Partnerfeladat
            </p>
            <h2 className="mt-0.5 text-lg sm:text-xl font-bold text-slate-900">
              Milyen gyümölcsöt, zöldséget látsz a képen?
            </h2>
          </div>
          <span className="font-mono tabular-nums text-sm font-bold text-emerald-700 shrink-0">
            {current.pluCode}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* High-res studio produce photo */}
        <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col">
          <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden">
            {!brokenImages[current.id] ? (
              <img
                src={current.image}
                alt="Felismerendő friss zöldség vagy gyümölcs"
                referrerPolicy="no-referrer"
                onError={() =>
                  setBrokenImages((prev) => ({
                    ...prev,
                    [current.id]: true,
                  }))
                }
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-800 p-6">
                <Leaf className="w-10 h-10 mb-2" />
                <span className="text-sm font-semibold">Zöldség-Gyümölcs pult</span>
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Kassza mérleg azonosítás</span>
            <span className="font-mono tabular-nums">{current.pluCode}</span>
          </div>
        </div>

        {/* 4 Choices + Retail Freshness Tip */}
        <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              Válaszd ki a helyes megnevezést a mérleghez:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.options.map((opt) => {
                const isSelected = selected === opt;
                const isRight = opt === current.correctName;
                let cls =
                  'border-slate-200 bg-white text-slate-900 hover:border-emerald-600 hover:bg-emerald-50/30';
                if (isAnswered) {
                  if (isRight) {
                    cls = 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600';
                  } else if (isSelected && !isRight) {
                    cls = 'border-red-500 bg-red-50 text-red-950';
                  } else {
                    cls = 'border-slate-200 bg-slate-50 text-slate-400 opacity-65';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleChoose(opt)}
                    className={`min-h-[56px] rounded-xl border px-4 py-3 text-left text-base font-semibold transition-all active:scale-[0.98] ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {isAnswered && (
            <div
              className={`rounded-xl border p-4 space-y-3 ${
                isCorrect
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-start gap-2.5 text-sm">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">
                    {isCorrect
                      ? `Helyes! Ez ${current.correctName.toLowerCase()}.`
                      : `A képen látható áru: ${current.correctName}.`}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {current.tip}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full min-h-[48px] rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
              >
                {index + 1 < PRODUCE_QUIZ_ITEMS.length ? 'Következő kép' : 'Kvíz lezárása'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
