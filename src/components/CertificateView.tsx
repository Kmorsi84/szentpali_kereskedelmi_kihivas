import React, { useState } from 'react';
import { Award, CheckCircle2, Download, Gift, Printer, RotateCcw } from 'lucide-react';
import type { ChallengeId, ChallengeResult, PlayerProfile } from '../types';
import { CHALLENGES, PROGRAM_NAME, SCHOOL_FULL_NAME } from '../data/gameData';
import { PartnerLogos } from './PartnerLogos';
import { soundEngine } from '../utils/sound';

interface CertificateViewProps {
  player: PlayerProfile;
  results: Partial<Record<ChallengeId, ChallengeResult>>;
  onBackToHub: () => void;
  onNewPlayer: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  player,
  results,
  onBackToHub,
  onNewPlayer,
}) => {
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const completedList = CHALLENGES.filter((c) => results[c.id]?.completed);
  const completedCount = completedList.length;
  const totalScore = completedList.reduce((acc, c) => acc + (results[c.id]?.score ?? 0), 0);
  const maxPossible = CHALLENGES.length * 100;

  const isUnlocked = completedCount >= 1;

  const rankTitle =
    completedCount >= 5
      ? 'Mester Kereskedő'
      : completedCount >= 3
      ? 'Arany fokozatú Kis Kereskedő'
      : 'Kis Kereskedő';

  const rewardText =
    completedCount >= 5
      ? 'Mester Kereskedő Oklevél + Ajándékcsomag & Matrica a standnál'
      : completedCount >= 3
      ? 'Kis Kereskedő Oklevél + Cukorka és Matrica a standnál'
      : 'Kis Kereskedő Oklevél + Matrica vagy Cukorka a standnál';

  const todayStr = new Date().toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownloadPng = () => {
    soundEngine.playPop();
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crisp off-white certificate parchment
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Emerald outer frame
    ctx.strokeStyle = '#065F46';
    ctx.lineWidth = 14;
    ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

    // Subtle amber inner hairline
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

    // School header
    ctx.fillStyle = '#065F46';
    ctx.textAlign = 'center';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MISKOLCI SZC SZENTPÁLI ISTVÁN KERESKEDELMI ÉS VENDÉGLÁTÓ', 600, 118);
    ctx.fillText('TECHNIKUM ÉS SZAKKÉPZŐ ISKOLA', 600, 148);

    // Title
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 62px "Bricolage Grotesque", sans-serif';
    ctx.fillText('OKLEVÉL', 600, 240);

    ctx.fillStyle = '#B45309';
    ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(rankTitle, 600, 288);

    // Recipient
    ctx.fillStyle = '#475569';
    ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Elismerésül igazoljuk, hogy', 600, 352);

    ctx.fillStyle = '#0F172A';
    ctx.font = '700 46px "Bricolage Grotesque", sans-serif';
    ctx.fillText(player.name, 600, 415);

    ctx.fillStyle = '#334155';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${player.school}  ·  ${player.className}`, 600, 458);

    // Achievement
    ctx.fillStyle = '#334155';
    ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      'eredményesen teljesítette a Kereskedelmi értékesítő szak pályaválasztási kihívását:',
      600,
      522
    );

    ctx.fillStyle = '#065F46';
    ctx.font = '700 30px "JetBrains Mono", monospace';
    ctx.fillText(
      `${completedCount} / ${CHALLENGES.length} állomás  ·  ${totalScore} / ${maxPossible} pont`,
      600,
      572
    );

    // Divider
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(180, 635);
    ctx.lineTo(1020, 635);
    ctx.stroke();

    // Partners & date
    ctx.fillStyle = '#64748B';
    ctx.font = '500 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Együttműködő partnereink:  TESCO  ·  INTERSPAR  ·  COOP', 600, 685);

    ctx.fillStyle = '#475569';
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Miskolc, ${todayStr}  ·  Mérj, csomagolj és számolj!`, 600, 745);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `kis-kereskedo-oklevel-${player.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
    setDownloadStatus('Az oklevél képe letöltődött!');
    setTimeout(() => setDownloadStatus(null), 3500);
  };

  if (!isUnlocked) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 text-center max-w-xl mx-auto">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <Award className="w-7 h-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          Még csak egy lépésre vagy az oklevéltől!
        </h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Teljesíts legalább egy kihívást az 5 állomás közül, és azonnal megkapod a névre szóló{' '}
          <strong className="text-slate-900">„Kis kereskedő” okleveledet</strong>, amellyel
          matricát vagy cukorkát kérhetsz a standunknál!
        </p>
        <button
          type="button"
          onClick={onBackToHub}
          className="mt-6 min-h-[48px] rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors"
        >
          Vissza a kihívásokhoz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Reward Redemption Banner */}
      <div className="no-print rounded-2xl bg-emerald-800 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Gift className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-emerald-200 font-medium">Jutalom feloldva a standnál</p>
            <p className="text-sm sm:text-base font-bold mt-0.5">{rewardText}</p>
            <p className="text-xs text-emerald-100 mt-1">
              Mutasd meg ezt a képernyőt a Szentpáli standjánál a jutalmadért!
            </p>
          </div>
        </div>
        <div className="font-mono tabular-nums text-right shrink-0">
          <span className="text-2xl font-bold text-amber-300">{totalScore}</span>
          <span className="text-sm text-emerald-200"> / {maxPossible} pont</span>
        </div>
      </div>

      {/* Printable Certificate Card */}
      <div className="print-only-certificate rounded-3xl bg-white border-2 border-emerald-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="border border-amber-500/50 rounded-2xl p-5 sm:p-8 text-center">
          <p className="text-xs sm:text-sm font-semibold text-emerald-800 tracking-wide">
            {SCHOOL_FULL_NAME}
          </p>
          <p className="mt-1 text-xs text-slate-500">{PROGRAM_NAME} szak · Pályaválasztási kiállítás</p>

          <h2 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Oklevél
          </h2>
          <p className="mt-1.5 text-base sm:text-lg font-bold text-amber-700">{rankTitle}</p>

          <p className="mt-6 text-sm text-slate-600">Elismerésül igazoljuk, hogy</p>
          <p className="mt-1.5 font-display text-2xl sm:text-4xl font-bold text-slate-900">
            {player.name}
          </p>
          <p className="mt-1.5 text-sm sm:text-base font-medium text-slate-700">
            {player.school} <span aria-hidden="true">·</span> {player.className}
          </p>

          <p className="mt-5 text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            sikeresen helytállt a „Mérj, csomagolj és számolj!” kereskedelmi értékesítői
            kihívásban.
          </p>

          {/* Completed stations breakdown */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-2xl mx-auto">
            {completedList.map((ch) => {
              const res = results[ch.id];
              return (
                <div
                  key={ch.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 text-xs sm:text-sm"
                >
                  <span className="inline-flex items-center gap-2 font-semibold text-slate-800 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="truncate">{ch.shortTitle}</span>
                  </span>
                  <span className="font-mono tabular-nums font-bold text-emerald-800 shrink-0">
                    {res?.score ?? 0} pt
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-7 pt-5 border-t border-slate-200 flex flex-col items-center gap-3">
            <p className="text-xs text-slate-500">Együttműködő partnereink</p>
            <PartnerLogos compact />
            <p className="text-xs text-slate-400 mt-1">Miskolc, {todayStr}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="no-print space-y-3">
        {downloadStatus && (
          <p className="text-center text-sm font-semibold text-emerald-700">{downloadStatus}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="min-h-[48px] rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Mentés képként
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[48px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            Nyomtatás
          </button>
          <button
            type="button"
            onClick={onNewPlayer}
            className="min-h-[48px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            Új játékos indítása
          </button>
        </div>

        {completedCount < CHALLENGES.length && (
          <button
            type="button"
            onClick={onBackToHub}
            className="w-full min-h-[44px] rounded-xl text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
          >
            További állomások teljesítése ({completedCount}/{CHALLENGES.length})
          </button>
        )}
      </div>
    </div>
  );
};
