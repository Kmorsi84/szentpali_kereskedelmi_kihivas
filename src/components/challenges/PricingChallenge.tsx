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
    <div className="space-y-4 sm:space-y-5">
      {/* Midnight Cobalt Header */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#0F1D40] text-white p-4 sm:p-6 tactile-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] sm:text-xs text-amber-300 font-medium">
              04. állomás · {questionIndex + 1} / {PRICING_QUESTIONS.length}. kérdés · METRO Partnerfeladat
            </p>
            <h2 className="mt-0.5 text-lg sm:text-2xl font-bold">
              Kereskedelmi Árkalkuláció
            </h2>
          </div>
          <div className="text-right shrink-0">
            <span className="block text-[11px] text-slate-300">Helyes</span>
            <span className="font-mono tabular-nums text-lg sm:text-xl font-bold text-amber-300">
              {correctCount} / {PRICING_QUESTIONS.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2-col layout: Compact 2x2 price strip on mobile, full table on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Price Table */}
        <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 tactile-card overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3.5 border-b border-slate-200 bg-[#FAF9F6]">
            <span className="text-xs font-bold text-[#0F1D40]">Egységárak (Ft/kg)</span>
            <Calculator className="w-4 h-4 text-[#0F1D40]" aria-hidden="true" />
          </div>

          {/* Mobile compact 2x2 grid */}
          <div className="grid grid-cols-2 gap-2 p-3 lg:hidden">
            {PRICING_TABLE.map((row) => (
              <div
                key={row.product}
                className="flex items-center justify-between gap-1.5 rounded-xl bg-[#F4F5F8] px-2.5 py-2"
              >
                <span className="text-xs font-bold text-[#0B1220]">{row.product}</span>
                <span className="font-mono tabular-nums text-xs font-bold text-[#0B1220] bg-[#FDE047] px-1.5 py-0.5 rounded shrink-0">
                  {row.pricePerKg.toLocaleString('hu-HU')}
                </span>
              </div>
            ))}
          </div>

          {/* Desktop full table */}
          <table className="hidden lg:table w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                <th className="py-2.5 px-5 font-semibold">Termék</th>
                <th className="py-2.5 px-5 font-semibold text-right">Egységár</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-slate-200">
              {PRICING_TABLE.map((row) => (
                <tr key={row.product}>
                  <td className="py-3 px-5 font-bold text-[#0B1220]">{row.product}</td>
                  <td className="py-3 px-5 text-right">
                    <span className="font-mono tabular-nums font-bold text-[#0B1220] bg-[#FDE047] px-2 py-0.5 rounded-md">
                      {row.pricePerKg.toLocaleString('hu-HU')} Ft/kg
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Question Card */}
        <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 tactile-card p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <p className="text-xs font-bold text-[#E11D48]">{currentQuestion.tag}</p>
            <h3 className="mt-1 text-lg sm:text-2xl font-bold text-[#0B1220] leading-snug">
              {currentQuestion.prompt}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isRight = opt === currentQuestion.correctAnswer;
              let btnClass =
                'border-slate-200 bg-[#F4F5F8] text-[#0F1D40] hover:border-[#0F1D40] hover:bg-amber-50';
              if (isAnswered) {
                if (isRight) {
                  btnClass = 'border-[#0F1D40] bg-amber-100 text-[#0F1D40] ring-2 ring-amber-400';
                } else if (isSelected && !isRight) {
                  btnClass = 'border-rose-500 bg-rose-50 text-rose-950';
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
                  className={`min-h-[64px] rounded-2xl border-2 px-4 py-3 font-mono tabular-nums text-lg font-bold transition-all active:scale-[0.98] ${btnClass}`}
                >
                  {formatFt(opt)}
                </button>
              );
            })}
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
                className="tactile-btn w-full min-h-[50px] rounded-2xl bg-[#E11D48] px-5 text-sm font-bold text-white hover:bg-[#BE123C] transition-all inline-flex items-center justify-center gap-2"
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
