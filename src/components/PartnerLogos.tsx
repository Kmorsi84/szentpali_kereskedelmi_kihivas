import React, { useState } from 'react';

export interface PartnerItem {
  id: string;
  name: string;
  logoSrc: string;
}

export const RETAIL_PARTNERS: PartnerItem[] = [
  {
    id: 'auchan',
    name: 'Auchan',
    logoSrc: '/assets/aistudio/auchan_nagy_keretes_4d7a1bae.jpg',
  },
  {
    id: 'metro',
    name: 'METRO',
    logoSrc: '/assets/aistudio/metro_8c3dfdd6.png',
  },
  {
    id: 'interspar',
    name: 'INTERSPAR',
    logoSrc: '/assets/aistudio/interspar_bee23085.png',
  },
  {
    id: 'coop',
    name: 'Unió Coop Zrt.',
    logoSrc: '/assets/aistudio/coop_6ae5cae9.png',
  },
];

interface PartnerLogosProps {
  compact?: boolean;
}

export const PartnerLogos: React.FC<PartnerLogosProps> = ({ compact = false }) => {
  const [failedMap, setFailedMap] = useState<Record<string, boolean>>({});

  return (
    <div
      className={
        compact
          ? 'flex flex-wrap items-center justify-center sm:justify-end gap-3'
          : 'grid grid-cols-2 sm:grid-cols-4 gap-2.5'
      }
    >
      {RETAIL_PARTNERS.map((partner) => {
        const failed = Boolean(failedMap[partner.id]);
        return (
          <div
            key={partner.id}
            title={partner.name}
            className={
              compact
                ? 'flex items-center justify-center rounded-xl bg-white border border-slate-200 px-2.5 py-1.5 h-12 min-w-[96px]'
                : 'flex items-center justify-center rounded-2xl bg-white border border-slate-200 px-3 py-2.5 h-16'
            }
          >
            {!failed ? (
              <img
                src={partner.logoSrc}
                alt={`${partner.name} logó`}
                referrerPolicy="no-referrer"
                onError={() =>
                  setFailedMap((prev) => ({
                    ...prev,
                    [partner.id]: true,
                  }))
                }
                className={
                  compact
                    ? 'max-h-8 max-w-[104px] w-auto object-contain'
                    : 'max-h-11 max-w-full w-auto object-contain'
                }
              />
            ) : (
              <span className="font-display font-bold text-xs sm:text-sm text-[#0F1D40] whitespace-nowrap">
                {partner.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
