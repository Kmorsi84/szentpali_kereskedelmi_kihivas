import React, { useState } from 'react';
import { Award, CheckCircle2, Download, Gift, Printer, RotateCcw } from 'lucide-react';
import type { ChallengeId, ChallengeResult, PlayerProfile } from '../types';
import { CHALLENGES, PROGRAM_NAME, SCHOOL_FULL_NAME } from '../data/gameData';
import { PartnerLogos, RETAIL_PARTNERS } from './PartnerLogos';
import { soundEngine } from '../utils/sound';

const SCHOOL_LOGO_SRC = '/assets/aistudio/footer_logo_529f3ff54c_49445e63.png';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

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
  const [schoolLogoFailed, setSchoolLogoFailed] = useState(false);

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

  const handleDownloadPng = async () => {
    soundEngine.playPop();
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 880;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [schoolLogoImg, ...partnerImgs] = await Promise.all([
      loadImage(SCHOOL_LOGO_SRC),
      ...RETAIL_PARTNERS.map((p) => loadImage(p.logoSrc)),
    ]);

    // Crisp off-white paper canvas
    ctx.fillStyle = '#FAF9F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Royal Cobalt top ribbon banner
    ctx.fillStyle = '#0F1D40';
    ctx.fillRect(28, 28, canvas.width - 56, 162);

    // Outer Royal Cobalt border
    ctx.strokeStyle = '#0F1D40';
    ctx.lineWidth = 12;
    ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

    // Sunburst Gold accent inner line
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 204, canvas.width - 96, canvas.height - 252);

    // Szentpáli school crest inside top banner (left & balanced with header text)
    if (schoolLogoImg) {
      const targetH = 114;
      const aspect = schoolLogoImg.naturalWidth / Math.max(1, schoolLogoImg.naturalHeight);
      const targetW = targetH * aspect;
      const logoX = 76;
      const logoY = 28 + (162 - targetH) / 2;

      // Subtle light circular backing so the dark blue shield stands out cleanly
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.beginPath();
      ctx.roundRect(logoX - 10, logoY - 8, targetW + 20, targetH + 16, 16);
      ctx.fill();
      ctx.drawImage(schoolLogoImg, logoX, logoY, targetW, targetH);
    }

    // School header text on dark banner
    const headerCenterX = schoolLogoImg ? 645 : 600;
    ctx.fillStyle = '#FDE047';
    ctx.textAlign = 'center';
    ctx.font = '700 22px "Outfit", sans-serif';
    ctx.fillText('MISKOLCI SZC SZENTPÁLI ISTVÁN KERESKEDELMI ÉS VENDÉGLÁTÓ', headerCenterX, 98);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 20px "DM Sans", sans-serif';
    ctx.fillText(
      'TECHNIKUM ÉS SZAKKÉPZŐ ISKOLA  ·  KERESKEDELMI ÉRTÉKESÍTŐ SZAK',
      headerCenterX,
      140
    );

    // Title
    ctx.fillStyle = '#0F1D40';
    ctx.font = '800 66px "Outfit", sans-serif';
    ctx.fillText('OKLEVÉL', 600, 286);

    ctx.fillStyle = '#E11D48';
    ctx.font = '700 28px "Outfit", sans-serif';
    ctx.fillText(rankTitle, 600, 332);

    // Recipient
    ctx.fillStyle = '#475569';
    ctx.font = '400 22px "DM Sans", sans-serif';
    ctx.fillText('Elismerésül igazoljuk, hogy', 600, 390);

    ctx.fillStyle = '#0B1220';
    ctx.font = '800 48px "Outfit", sans-serif';
    ctx.fillText(player.name, 600, 452);

    ctx.fillStyle = '#334155';
    ctx.font = '600 24px "DM Sans", sans-serif';
    ctx.fillText(`${player.school}  ·  ${player.className}`, 600, 496);

    // Achievement
    ctx.fillStyle = '#334155';
    ctx.font = '400 21px "DM Sans", sans-serif';
    ctx.fillText(
      'eredményesen teljesítette a „Mérj, csomagolj és számolj!” pályaválasztási kihívást:',
      600,
      552
    );

    ctx.fillStyle = '#0F1D40';
    ctx.font = '700 30px "Space Mono", monospace';
    ctx.fillText(
      `${completedCount} / ${CHALLENGES.length} állomás  ·  ${totalScore} / ${maxPossible} pont`,
      600,
      604
    );

    // Divider
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(180, 650);
    ctx.lineTo(1020, 650);
    ctx.stroke();

    // Partners label & logos
    ctx.fillStyle = '#64748B';
    ctx.font = '600 16px "DM Sans", sans-serif';
    ctx.fillText('Együttműködő kereskedelmi partnereink', 600, 682);

    const loadedPartners = partnerImgs.filter((img): img is HTMLImageElement => Boolean(img));
    if (loadedPartners.length > 0) {
      const boxW = 148;
      const boxH = 52;
      const gap = 22;
      const totalW = loadedPartners.length * boxW + (loadedPartners.length - 1) * gap;
      let startX = (canvas.width - totalW) / 2;
      const boxY = 700;

      loadedPartners.forEach((img) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(startX, boxY, boxW, boxH, 10);
        ctx.fill();
        ctx.stroke();

        const pad = 8;
        const availW = boxW - pad * 2;
        const availH = boxH - pad * 2;
        const scale = Math.min(availW / img.naturalWidth, availH / img.naturalHeight);
        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        ctx.drawImage(
          img,
          startX + (boxW - drawW) / 2,
          boxY + (boxH - drawH) / 2,
          drawW,
          drawH
        );
        startX += boxW + gap;
      });
    } else {
      ctx.fillStyle = '#475569';
      ctx.font = '600 19px "DM Sans", sans-serif';
      ctx.fillText('AUCHAN  ·  METRO  ·  INTERSPAR  ·  UNIÓ COOP', 600, 730);
    }

    ctx.fillStyle = '#64748B';
    ctx.font = '500 18px "DM Sans", sans-serif';
    ctx.fillText(`Miskolc, ${todayStr}`, 600, 796);

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
      <div className="rounded-3xl bg-white border border-slate-200 tactile-card p-6 sm:p-8 text-center max-w-xl mx-auto">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F1D40] text-amber-300">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-[#0B1220]">
          Még csak egy lépésre vagy az oklevéltől!
        </h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Teljesíts legalább egy kihívást az 5 állomás közül, és azonnal megkapod a névre szóló{' '}
          <strong className="text-[#0B1220]">„Kis kereskedő” okleveledet</strong>, amellyel
          matricát vagy cukorkát kérhetsz a standunknál!
        </p>
        <button
          type="button"
          onClick={onBackToHub}
          className="tactile-btn mt-6 min-h-[50px] rounded-2xl bg-[#E11D48] px-6 py-3 text-sm font-bold text-white hover:bg-[#BE123C] transition-colors"
        >
          Vissza a kihívásokhoz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Reward Redemption Banner */}
      <div className="no-print rounded-3xl bg-[#0F1D40] text-white p-5 sm:p-6 tactile-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-[#0F1D40] shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-amber-300 font-bold">Jutalom feloldva a standnál</p>
            <p className="text-sm sm:text-base font-bold mt-0.5">{rewardText}</p>
            <p className="text-xs text-slate-300 mt-1">
              Mutasd meg ezt a képernyőt a Szentpáli standjánál a jutalmadért!
            </p>
          </div>
        </div>
        <div className="font-mono tabular-nums text-right shrink-0">
          <span className="text-2xl font-bold text-amber-300">{totalScore}</span>
          <span className="text-sm text-slate-300"> / {maxPossible} pont</span>
        </div>
      </div>

      {/* Formal Royal Cobalt & Gold Diploma Card */}
      <div className="print-only-certificate rounded-3xl bg-[#FAF9F6] border-2 border-[#0F1D40] overflow-hidden tactile-card">
        <div className="bg-[#0F1D40] text-white px-5 py-5 sm:px-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          {!schoolLogoFailed && (
            <div className="rounded-2xl bg-white/95 p-2 shadow-sm shrink-0">
              <img
                src={SCHOOL_LOGO_SRC}
                alt="Miskolci SZC Szentpáli István Technikum címere"
                referrerPolicy="no-referrer"
                onError={() => setSchoolLogoFailed(true)}
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
          <div>
            <p className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide">
              {SCHOOL_FULL_NAME}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {PROGRAM_NAME} szak · Pályaválasztási kiállítás
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="border-2 border-amber-400/70 rounded-2xl bg-white p-5 sm:p-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F1D40]">
              OKLEVÉL
            </h2>
            <p className="mt-1.5 text-base sm:text-lg font-bold text-[#E11D48]">{rankTitle}</p>

            <p className="mt-6 text-sm text-slate-500">Elismerésül igazoljuk, hogy</p>
            <p className="mt-1.5 font-display text-2xl sm:text-4xl font-extrabold text-[#0B1220]">
              {player.name}
            </p>
            <p className="mt-1.5 text-sm sm:text-base font-semibold text-slate-700">
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
                    className="flex items-center justify-between gap-2 rounded-xl bg-[#F4F5F8] border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm"
                  >
                    <span className="inline-flex items-center gap-2 font-bold text-[#0B1220] min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-[#0F1D40] shrink-0" />
                      <span className="truncate">{ch.shortTitle}</span>
                    </span>
                    <span className="font-mono tabular-nums font-bold text-[#0F1D40] bg-[#FDE047] px-2 py-0.5 rounded shrink-0">
                      {res?.score ?? 0} pt
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 pt-5 border-t border-slate-200 flex flex-col items-center gap-3">
              <p className="text-xs font-medium text-slate-500">Együttműködő partnereink</p>
              <PartnerLogos compact />
              <p className="text-xs text-slate-400 mt-1">Miskolc, {todayStr}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="no-print space-y-3">
        {downloadStatus && (
          <p className="text-center text-sm font-bold text-[#0F1D40]">{downloadStatus}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => void handleDownloadPng()}
            className="tactile-btn min-h-[50px] rounded-2xl bg-[#E11D48] px-4 py-3 text-sm font-bold text-white hover:bg-[#BE123C] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Mentés képként
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[50px] rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0F1D40] hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            Nyomtatás
          </button>
          <button
            type="button"
            onClick={onNewPlayer}
            className="min-h-[50px] rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0F1D40] hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            Új játékos indítása
          </button>
        </div>

        {completedCount < CHALLENGES.length && (
          <button
            type="button"
            onClick={onBackToHub}
            className="w-full min-h-[44px] rounded-xl text-sm font-bold text-[#0F1D40] hover:bg-indigo-50/70 transition-colors"
          >
            További állomások teljesítése ({completedCount}/{CHALLENGES.length})
          </button>
        )}
      </div>
    </div>
  );
};
