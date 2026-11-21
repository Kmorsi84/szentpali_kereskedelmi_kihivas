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
      {/* Midnight Cobalt Header */}
      <div className="rounded-3xl bg-[#0F1D40] text-white p-5 sm:p-6 tactile-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-amber-300 font-medium">
              05. állomás · {index + 1} / {PRODUCE_QUIZ_ITEMS.length}. kép · Interspar Partnerfeladat
            </p>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold">
              Milyen gyümölcsöt, zöldséget látsz a képen?
            </h2>
          </div>
          <span className="font-mono tabular-nums text-xs sm:text-sm font-bold text-[#0F1D40] bg-[#FDE047] px-2.5 py-1 rounded-lg shrink-0">
            {current.pluCode}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Studio Produce Photo */}
        <div className="lg:col-span-6 rounded-3xl bg-white border border-slate-200 tactile-card overflow-hidden flex flex-col">
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
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F1D40] text-amber-300 p-6">
                <Leaf className="w-10 h-10 mb-2" />
                <span className="text-sm font-bold">Zöldség-Gyümölcs pult</span>
              </div>
            )}
          </div>
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Kassza mérleg azonosítás</span>
            <span className="font-mono tabular-nums font-bold text-[#0F1D40]">
              {current.pluCode}
            </span>
          </div>
        </div>

        {/* 4 Choices + Tip */}
        <div className="lg:col-span-6 rounded-3xl bg-white border border-slate-200 tactile-card p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-bold text-[#0F1D40]">
              Válaszd ki a helyes megnevezést a mérleghez:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.options.map((opt) => {
                const isSelected = selected === opt;
                const isRight = opt === current.correctName;
                let cls =
                  'border-slate-200 bg-[#F4F5F8] text-[#0B1220] hover:border-[#0F1D40] hover:bg-amber-50';
                if (isAnswered) {
                  if (isRight) {
                    cls = 'border-[#0F1D40] bg-amber-100 text-[#0F1D40] ring-2 ring-amber-400';
                  } else if (isSelected && !isRight) {
                    cls = 'border-rose-500 bg-rose-50 text-rose-950';
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
                    className={`min-h-[60px] rounded-2xl border-2 px-4 py-3 text-left text-base font-bold transition-all active:scale-[0.98] ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {isAnswered && (
            <div
              className={`rounded-2xl border-2 p-4 space-y-3 ${
                isCorrect
                  ? 'bg-amber-50 border-amber-300 text-[#0F1D40]'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-2.5 text-sm">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-[#0F1D40] shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
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
                className="tactile-btn w-full min-h-[50px] rounded-2xl bg-[#E11D48] px-5 text-sm font-bold text-white hover:bg-[#BE123C] transition-all inline-flex items-center justify-center gap-2"
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
