import React from 'react';
import type { ProductArtId } from '../data/gameData';

interface ProductArtworkProps {
  art: ProductArtId;
  className?: string;
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({ art, className = 'w-14 h-14' }) => {
  switch (art) {
    case 'bread':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="40" rx="24" ry="14" fill="#D97706" />
          <path d="M10 38C10 24 20 18 32 18C44 18 54 24 54 38Z" fill="#F59E0B" />
          <path d="M19 25L25 32M30 22L35 30M41 24L45 31" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="32" cy="46" rx="21" ry="4" fill="#B45309" opacity="0.25" />
        </svg>
      );
    case 'milk':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M20 22L32 10L44 22V54H20V22Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M20 22L32 10L38 22H20Z" fill="#EFF6FF" />
          <rect x="20" y="30" width="24" height="14" fill="#2563EB" />
          <circle cx="32" cy="37" r="4" fill="#FFFFFF" />
          <rect x="27" y="8" width="10" height="4" rx="1.5" fill="#1D4ED8" />
        </svg>
      );
    case 'apple':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path
            d="M32 22C25 16 14 20 14 33C14 45 23 54 30 53C31.5 52.8 32.5 52.8 34 53C41 54 50 45 50 33C50 20 39 16 32 22Z"
            fill="#DC2626"
          />
          <ellipse cx="23" cy="31" rx="3.5" ry="7" fill="#FCA5A5" opacity="0.45" transform="rotate(-15 23 31)" />
          <path d="M32 21C32 15 35 12 37 10" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M33 15C38 11 45 12 46 17C41 19 36 18 33 15Z" fill="#16A34A" />
        </svg>
      );
    case 'lemon':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path
            d="M12 34C12 24 22 18 32 18C42 18 52 24 52 34C52 44 42 50 32 50C22 50 12 44 12 34Z"
            fill="#FACC15"
          />
          <circle cx="11" cy="34" r="3.5" fill="#EAB308" />
          <circle cx="53" cy="34" r="3.5" fill="#EAB308" />
          <path d="M33 18C38 11 46 11 48 16C43 19 37 19 33 18Z" fill="#16A34A" />
          <ellipse cx="26" cy="27" rx="6" ry="2.5" fill="#FEF9C3" opacity="0.7" />
        </svg>
      );
    case 'pasta':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect x="15" y="12" width="34" height="42" rx="5" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <rect x="15" y="12" width="34" height="8" rx="3" fill="#B91C1C" />
          <rect x="20" y="25" width="24" height="22" rx="3" fill="#FFFFFF" opacity="0.85" />
          <path d="M24 31C26 29 29 33 31 31C33 29 36 33 38 31" stroke="#D97706" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M24 38C26 36 29 40 31 38C33 36 36 40 38 38" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M26 44C28 42 31 45 33 43C35 41 38 45 40 43" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'eggs':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect x="10" y="30" width="44" height="20" rx="4" fill="#D6D3D1" stroke="#A8A29E" strokeWidth="2" />
          <ellipse cx="21" cy="30" rx="6" ry="9" fill="#FEF3C7" stroke="#E7E5E4" strokeWidth="1.5" />
          <ellipse cx="32" cy="29" rx="6" ry="9.5" fill="#FDE68A" stroke="#E7E5E4" strokeWidth="1.5" />
          <ellipse cx="43" cy="30" rx="6" ry="9" fill="#FEF3C7" stroke="#E7E5E4" strokeWidth="1.5" />
          <rect x="10" y="34" width="44" height="16" rx="3" fill="#C7C2BE" />
        </svg>
      );
    case 'toothpaste':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M12 24L44 20V44L12 40V24Z" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
          <rect x="44" y="27" width="8" height="10" rx="2" fill="#1D4ED8" />
          <path d="M16 30H38" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round" />
          <path d="M16 36H30" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'sponge':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect x="12" y="22" width="40" height="22" rx="5" fill="#FACC15" />
          <rect x="12" y="18" width="40" height="9" rx="3" fill="#15803D" />
          <circle cx="21" cy="33" r="2" fill="#CA8A04" />
          <circle cx="31" cy="37" r="2.5" fill="#CA8A04" />
          <circle cx="42" cy="32" r="2" fill="#CA8A04" />
          <circle cx="37" cy="39" r="1.5" fill="#CA8A04" />
        </svg>
      );
    case 'peas':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect x="16" y="12" width="32" height="42" rx="6" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="2" />
          <rect x="16" y="12" width="32" height="9" rx="3" fill="#047857" />
          <circle cx="25" cy="32" r="4" fill="#EAB308" />
          <circle cx="34" cy="30" r="4" fill="#FACC15" />
          <circle cx="39" cy="38" r="4" fill="#EAB308" />
          <circle cx="28" cy="41" r="4" fill="#FACC15" />
          <circle cx="34" cy="45" r="3.5" fill="#CA8A04" />
        </svg>
      );
    case 'beans':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect x="16" y="12" width="32" height="42" rx="6" fill="#FEE2E2" stroke="#991B1B" strokeWidth="2" />
          <rect x="16" y="12" width="32" height="9" rx="3" fill="#7F1D1D" />
          <ellipse cx="26" cy="32" rx="5" ry="3.2" fill="#991B1B" transform="rotate(-25 26 32)" />
          <ellipse cx="38" cy="34" rx="5" ry="3.2" fill="#B91C1C" transform="rotate(20 38 34)" />
          <ellipse cx="30" cy="43" rx="5" ry="3.2" fill="#7F1D1D" transform="rotate(15 30 43)" />
        </svg>
      );
    case 'chips':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M16 14H48L45 52H19L16 14Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
          <circle cx="32" cy="33" r="10" fill="#FACC15" />
          <path d="M26 33C29 29 35 29 38 33" stroke="#B45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <rect x="16" y="12" width="32" height="5" fill="#991B1B" />
        </svg>
      );
    case 'drink':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect x="26" y="10" width="12" height="5" rx="1.5" fill="#0F172A" />
          <path d="M27 15H37L42 26V52C42 54 40 55 38 55H26C24 55 22 54 22 52V26L27 15Z" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
          <rect x="22" y="30" width="20" height="12" fill="#FFF7ED" />
          <circle cx="32" cy="36" r="3.5" fill="#EA580C" />
        </svg>
      );
    case 'toy':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M14 38L19 26H43L50 38V46H14V38Z" fill="#2563EB" />
          <path d="M22 28H33V35H19L22 28Z" fill="#BFDBFE" />
          <path d="M35 28H42L45 35H35V28Z" fill="#BFDBFE" />
          <circle cx="22" cy="46" r="6" fill="#1E293B" />
          <circle cx="22" cy="46" r="2.5" fill="#CBD5E1" />
          <circle cx="42" cy="46" r="6" fill="#1E293B" />
          <circle cx="42" cy="46" r="2.5" fill="#CBD5E1" />
        </svg>
      );
    case 'butter':
    default:
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect x="12" y="22" width="40" height="22" rx="4" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
          <rect x="18" y="28" width="28" height="10" rx="2" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );
  }
};
