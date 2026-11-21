import React, { useState } from 'react';
import { Trophy, Trash2, UserPlus } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { CHALLENGES } from '../data/gameData';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  currentPlayerId?: string;
  onClearEntries: () => void;
  onNewPlayer: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  currentPlayerId,
  onClearEntries,
  onNewPlayer,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  const sorted = [...entries].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return b.completedCount - a.completedCount;
  });

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">Pályaválasztási kiállítás · Helyi eredménylista</p>
          <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
            Szentpáli Kis Kereskedő Toplista
          </h2>
        </div>
        <button
          type="button"
          onClick={onNewPlayer}
          className="min-h-[44px] rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Új játékos
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="mt-3 text-base font-semibold text-slate-900">
            Még nincs rögzített eredmény ezen az eszközön
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Teljesíts legalább egy állomást, és a neved, osztályod és iskolád máris felkerül a listára!
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {sorted.map((entry, idx) => {
              const isCurrent = entry.id === currentPlayerId;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between gap-4 px-4 sm:px-5 py-3.5 ${
                    isCurrent ? 'bg-emerald-50/60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`font-mono tabular-nums text-sm font-bold w-7 text-center shrink-0 ${
                        idx === 0
                          ? 'text-amber-600'
                          : idx === 1
                          ? 'text-slate-600'
                          : idx === 2
                          ? 'text-amber-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {idx + 1}.
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {entry.name}
                        {isCurrent && (
                          <span className="ml-2 text-xs font-semibold text-emerald-700">(Te)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {entry.school} <span aria-hidden="true">·</span> {entry.className}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono tabular-nums text-base sm:text-lg font-bold text-emerald-800">
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

          <div className="border-t border-slate-100 px-4 sm:px-5 py-3 bg-slate-50/70 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Összesen {sorted.length} kiállítási résztvevő ezen a készüléken
            </span>
            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="min-h-[36px] text-xs font-semibold text-slate-500 hover:text-red-700 inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Lista törlése
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[36px] rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Mégse
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearEntries();
                    setConfirmClear(false);
                  }}
                  className="min-h-[36px] rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Törlés megerősítése
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
