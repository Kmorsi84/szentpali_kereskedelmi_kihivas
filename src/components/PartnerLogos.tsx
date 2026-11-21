import React from 'react';

interface PartnerLogosProps {
  compact?: boolean;
}

export const PartnerLogos: React.FC<PartnerLogosProps> = ({ compact = false }) => {
  return (
    <div className={compact ? 'flex flex-wrap items-center gap-x-5 gap-y-2' : 'grid grid-cols-3 gap-3'}>
      {/* Tesco */}
      <div
        className={
          compact
            ? 'flex items-center gap-1.5'
            : 'flex flex-col items-center justify-center rounded-xl bg-white border border-slate-200 px-3 py-3'
        }
      >
        <span className="font-display font-bold tracking-wider text-[#00539F] text-sm sm:text-base">
          TESCO
        </span>
        {!compact && (
          <div className="mt-1 flex gap-0.5" aria-hidden="true">
            <span className="h-1 w-2.5 bg-[#EE1C2E]" />
            <span className="h-1 w-2.5 bg-[#EE1C2E]" />
            <span className="h-1 w-2.5 bg-[#EE1C2E]" />
          </div>
        )}
      </div>

      {/* Interspar */}
      <div
        className={
          compact
            ? 'flex items-center gap-1.5'
            : 'flex flex-col items-center justify-center rounded-xl bg-white border border-slate-200 px-3 py-3'
        }
      >
        <span className="font-display font-bold tracking-tight text-sm sm:text-base">
          <span className="text-[#007A3D]">INTER</span>
          <span className="text-[#E30613]">SPAR</span>
        </span>
        {!compact && (
          <div className="mt-1 flex gap-0.5" aria-hidden="true">
            <span className="h-1 w-4 bg-[#007A3D]" />
            <span className="h-1 w-4 bg-[#E30613]" />
          </div>
        )}
      </div>

      {/* Coop */}
      <div
        className={
          compact
            ? 'flex items-center gap-1.5'
            : 'flex flex-col items-center justify-center rounded-xl bg-white border border-slate-200 px-3 py-3'
        }
      >
        <span className="font-display font-bold tracking-wide text-[#006B3F] text-sm sm:text-base">
          coop
        </span>
        {!compact && (
          <div className="mt-1 flex gap-0.5" aria-hidden="true">
            <span className="h-1 w-8 bg-[#F59E0B]" />
          </div>
        )}
      </div>
    </div>
  );
};
