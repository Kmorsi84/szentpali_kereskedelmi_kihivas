import React, { useState } from 'react';
import { ArrowRight, Calculator, CheckCircle2, XCircle } from 'lucide-react';
import { PRICING_QUESTIONS, PRICING_TABLE, formatFt } from '../../data/gameData';
import { soundEngine } from '../../utils/sound';

interface PricingChallengeProps {
  onComplete: (score: number, summary: string) => void;
}

export const PricingChallenge: React.FC<PricingChallengeProps> = ({ onComplete }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = PRICING_QUESTIONS[questionIndex];
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === currentQuestion.correctAnswer;

  const handleSelect = (val: number) => {
    if (isAnswered) return;
    setSelectedOption(val);
    if (val === currentQuestion.correctAnswer) {
      soundEngine.playCorrect();
      setCorrectCount((prev) => prev + 1);
    } else {
      soundEngine.playError();
    }
  };

  const handleNext = () => {
    soundEngine.playPop();
    if (questionIndex + 1 < PRICING_QUESTIONS.length) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      const score = Math.round((correctCount / PRICING_QUESTIONS.length) * 100);
      soundEngine.playCashRegister();
      onComplete(score, `${correctCount} / ${PRICING_QUESTIONS.length} kasszafeladat hibátlan`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">
              4. állomás · {questionIndex + 1} / {PRICING_QUESTIONS.length}. kérdés · Tesco Partnerfeladat
            </p>
            <h2 className="mt-0.5 text-lg sm:text-xl font-bold text-slate-900">
              Kereskedelmi Árkalkuláció a Kasszánál
            </h2>
          </div>
          <div className="text-right shrink-0">
            <span className="block text-xs text-slate-500">Helyes</span>
            <span className="font-mono tabular-nums text-lg font-bold text-emerald-700">
              {correctCount} / {PRICING_QUESTIONS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop 2-col layout: Unit Price Table on left, Active Cash Register Question on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Price Table */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <span className="text-xs font-semibold text-slate-700">Napi egységár-táblázat</span>
            <Calculator className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                <th className="py-2.5 px-4 font-medium">Termék</th>
                <th className="py-2.5 px-4 font-medium text-right">Egységár</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PRICING_TABLE.map((row) => (
                <tr key={row.product}>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{row.product}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-emerald-800">
                    {row.pricePerKg.toLocaleString('hu-HU')} Ft/kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Question Card */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-amber-700">{currentQuestion.tag}</p>
            <h3 className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {currentQuestion.prompt}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isRight = opt === currentQuestion.correctAnswer;
              let btnClass =
                'border-slate-200 bg-white text-slate-900 hover:border-emerald-600 hover:bg-emerald-50/30';
              if (isAnswered) {
                if (isRight) {
                  btnClass = 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600';
                } else if (isSelected && !isRight) {
                  btnClass = 'border-red-500 bg-red-50 text-red-950';
                } else {
                  btnClass = 'border-slate-200 bg-slate-50 text-slate-400 opacity-65';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelect(opt)}
                  className={`min-h-[60px] rounded-xl border px-4 py-3 font-mono tabular-nums text-lg font-bold transition-all active:scale-[0.98] ${btnClass}`}
                >
                  {formatFt(opt)}
                </button>
              );
            })}
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
                      ? 'Pontos számolás!'
                      : `A helyes összeg: ${formatFt(currentQuestion.correctAnswer)}`}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full min-h-[48px] rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
              >
                {questionIndex + 1 < PRICING_QUESTIONS.length
                  ? 'Következő kasszafeladat'
                  : 'Árkalkuláció befejezése'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
