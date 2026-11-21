import React, { useState } from 'react';
import { Crown, RefreshCw, Trophy, Trash2, UserPlus } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { CHALLENGES } from '../data/gameData';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  currentPlayerId?: string;
  isSharedCloud?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
  onClearEntries: () => void;
  onNewPlayer: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  currentPlayerId,
  isSharedCloud = false,
  isLoading = false,
  onRefresh,
  onClearEntries,
  onNewPlayer,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  const sorted = [...entries].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return b.completedCount - a.completedCount;
  });

  const topThree = sorted.slice(0, 3);
  const restEntries = sorted.slice(3);

  return (
    <div className="space-y-5">
      {/* Midnight Cobalt Header */}
      <div className="rounded-3xl bg-[#0F1D40] text-white p-5 sm:p-6 tactile-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-amber-300 font-medium">
            Pályaválasztási kiállítás · {isSharedCloud ? 'Közös ranglista' : 'Helyi eredménylista'}
          </p>
          <h2 className="mt-0.5 text-xl sm:text-2xl font-bold">Szentpáli Kereskedő Toplista</h2>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isSharedCloud && onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Toplista frissítése"
              className="min-h-[44px] min-w-[44px] rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors inline-flex items-center justify-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            type="button"
            onClick={onNewPlayer}
            className="tactile-btn min-h-[44px] rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-[#0F1D40] hover:bg-amber-300 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Új játékos
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 tactile-card p-8 text-center">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="mt-3 text-base font-bold text-[#0B1220]">
            {isLoading ? 'Eredmények betöltése...' : 'Még nincs rögzített eredmény'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Teljesíts legalább egy állomást, és a neved, osztályod és iskolád máris felkerül a
            dobogóra!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Gamified Top 3 Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {topThree.map((entry, idx) => {
              const isCurrent = entry.id === currentPlayerId;
              const isFirst = idx === 0;
              return (
                <div
                  key={entry.id}
                  className={`rounded-3xl border-2 p-5 tactile-card flex flex-col justify-between gap-3 ${
                    isFirst
                      ? 'bg-[#0F1D40] text-white border-amber-400'
                      : isCurrent
                      ? 'bg-amber-50/70 text-[#0B1220] border-[#0F1D40]'
                      : 'bg-white text-[#0B1220] border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono tabular-nums text-xs font-bold px-2.5 py-1 rounded-lg ${
                        isFirst
                          ? 'bg-amber-400 text-[#0F1D40]'
                          : idx === 1
                          ? 'bg-slate-200 text-[#0F1D40]'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {idx + 1}. hely
                    </span>
                    {isFirst && <Crown className="w-5 h-5 text-amber-300" aria-hidden="true" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-bold truncate">
                      {entry.name}
                      {isCurrent && (
                        <span
                          className={`ml-1.5 text-xs font-bold ${
                            isFirst ? 'text-amber-300' : 'text-[#E11D48]'
                          }`}
                        >
                          (Te)
                        </span>
                      )}
                    </p>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        isFirst ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {entry.school} · {entry.className}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-current/10 flex items-baseline justify-between">
                    <span className="font-mono tabular-nums text-xl font-bold">
                      {entry.totalScore} pont
                    </span>
                    <span
                      className={`font-mono tabular-nums text-xs ${
                        isFirst ? 'text-amber-300' : 'text-slate-500'
                      }`}
                    >
                      {entry.completedCount}/{CHALLENGES.length} állomás
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remaining Ranked Participants */}
          {restEntries.length > 0 && (
            <div className="rounded-3xl bg-white border border-slate-200 tactile-card overflow-hidden">
              <div className="divide-y divide-slate-100">
                {restEntries.map((entry, idx) => {
                  const rank = idx + 4;
                  const isCurrent = entry.id === currentPlayerId;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                        isCurrent ? 'bg-amber-50/70' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="font-mono tabular-nums text-sm font-bold w-7 text-center text-slate-400 shrink-0">
                          {rank}.
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-bold text-[#0B1220] truncate">
                            {entry.name}
                            {isCurrent && (
                              <span className="ml-2 text-xs font-bold text-[#E11D48]">(Te)</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {entry.school} <span aria-hidden="true">·</span> {entry.className}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono tabular-nums text-base font-bold text-[#0F1D40]">
                          {entry.totalScore} pont
                        </p>
                        <p className="text-xs text-slate-500 font-mono tabular-nums">
                          {entry.completedCount}/{CHALLENGES.length} állomás
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer info & local-only clear */}
          <div className="flex items-center justify-between gap-3 px-2 text-xs text-slate-500">
            <span>Összesen {sorted.length} kiállítási résztvevő</span>
            {!isSharedCloud &&
              (!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="min-h-[36px] font-semibold text-slate-500 hover:text-rose-700 inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Lista törlése
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="min-h-[36px] rounded-lg px-2.5 font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Mégse
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClearEntries();
                      setConfirmClear(false);
                    }}
                    className="min-h-[36px] rounded-lg bg-rose-600 px-3 font-semibold text-white hover:bg-rose-700"
                  >
                    Törlés megerősítése
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
