import React, { useMemo, useState } from 'react';
import { Check, Minus, Plus, Receipt, RotateCcw, ShoppingBasket, AlertTriangle } from 'lucide-react';
import {
  SHOP_PRODUCTS,
  SHOPPING_BUDGET,
  formatFt,
  type ShopProduct,
} from '../../data/gameData';
import { ProductArtwork } from '../ProductArtwork';
import { soundEngine } from '../../utils/sound';

interface ShoppingChallengeProps {
  onComplete: (score: number, summary: string) => void;
}

export const ShoppingChallenge: React.FC<ShoppingChallengeProps> = ({ onComplete }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [phase, setPhase] = useState<'shop' | 'twist'>('shop');
  const [selfReflection, setSelfReflection] = useState<'yes' | 'could-better' | null>(null);

  const selectedProducts = useMemo(
    () => SHOP_PRODUCTS.filter((p) => selectedIds.includes(p.id)),
    [selectedIds]
  );

  const totalSpent = useMemo(
    () => selectedProducts.reduce((sum, item) => sum + item.price, 0),
    [selectedProducts]
  );

  const remaining = SHOPPING_BUDGET - totalSpent;
  const requiredProducts = useMemo(() => SHOP_PRODUCTS.filter((p) => p.onList), []);
  const boughtRequiredCount = requiredProducts.filter((p) => selectedIds.includes(p.id)).length;
  const impulseItems = selectedProducts.filter((p) => p.isImpulse);
  const usefulExtras = selectedProducts.filter((p) => !p.onList && !p.isImpulse);

  const toggleProduct = (product: ShopProduct) => {
    setWarning(null);
    if (selectedIds.includes(product.id)) {
      soundEngine.playPop();
      setSelectedIds((prev) => prev.filter((id) => id !== product.id));
      return;
    }

    if (totalSpent + product.price > SHOPPING_BUDGET) {
      soundEngine.playError();
      setWarning(
        `A(z) ${product.name} (${formatFt(product.price)}) már túllépné a 3 000 Ft-os keretedet!`
      );
      return;
    }

    soundEngine.playPop();
    setSelectedIds((prev) => [...prev, product.id]);
  };

  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      soundEngine.playError();
      setWarning('Tegyél legalább egy terméket a kosaradba a fizetés előtt!');
      return;
    }
    soundEngine.playCashRegister();
    setPhase('twist');
  };

  const calculatedEvaluation = useMemo(() => {
    const essentialScore = boughtRequiredCount * 15;
    const extraUsefulScore = Math.min(35, usefulExtras.length * 12);
    const efficiencyRatio = totalSpent / SHOPPING_BUDGET;
    const efficiencyScore =
      efficiencyRatio >= 0.85 ? 20 : efficiencyRatio >= 0.65 ? 14 : efficiencyRatio >= 0.4 ? 8 : 4;
    const impulsePenalty = impulseItems.length * (boughtRequiredCount < 3 ? 12 : 5);
    const score = Math.max(20, Math.min(100, essentialScore + extraUsefulScore + efficiencyScore - impulsePenalty));

    let verdict = '';
    if (boughtRequiredCount === 3 && impulseItems.length === 0 && selectedProducts.length >= 5) {
      verdict =
        'Kiváló pénzügyi tudatosság! Minden listán szereplő alapélelmiszert megvettél, nem dőltél be a csábító nasiknak, és szinte forintra pontosan kihasználtad a 3 000 Ft-ot.';
    } else if (boughtRequiredCount === 3 && impulseItems.length > 0) {
      verdict =
        'A bevásárlólista minden eleme megvan, viszont került a kosárba impulzus-termék is. Hasznosabb alapélelmiszerekből még több kifért volna!';
    } else if (boughtRequiredCount < 3) {
      verdict = `A bevásárlólistáról csak ${boughtRequiredCount}/3 kötelező terméket tettél be. Egy tudatos vásárló és eladó mindig a listával kezdi!`;
    } else {
      verdict =
        'Okosan válogattál a 3 000 Ft-os keretből! Még egy-két alapélelmiszer belefért volna a megmaradt keretbe.';
    }

    const summary = `${selectedProducts.length} termék · ${formatFt(totalSpent)} / 3 000 Ft`;
    return { score, verdict, summary };
  }, [boughtRequiredCount, impulseItems.length, selectedProducts.length, totalSpent, usefulExtras.length]);

  const handleFinish = () => {
    soundEngine.playCorrect();
    onComplete(calculatedEvaluation.score, calculatedEvaluation.summary);
  };

  if (phase === 'twist') {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl bg-white border border-slate-200 tactile-card overflow-hidden">
          <div className="bg-[#0F1D40] text-white px-5 py-5 sm:px-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-amber-300">Kasszablokk · Ellenőrzés</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-bold">
                Biztos, hogy jól gazdálkodtál a pénzeddel?
              </h2>
            </div>
            <Receipt className="w-7 h-7 text-amber-300 shrink-0" aria-hidden="true" />
          </div>

          <div className="p-5 sm:p-6">
            {/* Thermal receipt breakdown */}
            <div className="rounded-2xl bg-[#FAF9F6] border border-dashed border-slate-300 p-4 divide-y divide-dashed divide-slate-200 text-sm">
              {selectedProducts.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0">
                    <span className="font-semibold text-[#0B1220]">{item.name}</span>
                    <span className="ml-2 text-xs text-slate-500">
                      {item.onList ? 'Listás' : item.isImpulse ? 'Impulzus cikk' : 'Hasznos plusz'}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums font-bold text-[#0B1220] shrink-0">
                    {formatFt(item.price)}
                  </span>
                </div>
              ))}
              <div className="pt-3 flex items-baseline justify-between">
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  {selectedProducts.length} tétel · Maradt: {formatFt(remaining)}
                </span>
                <span className="font-mono tabular-nums text-xl font-bold text-[#0F1D40]">
                  {formatFt(totalSpent)}
                </span>
              </div>
            </div>

            {!selfReflection ? (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-[#0B1220] font-semibold">
                  Szerinted kihoztad a legtöbbet a 3 000 Ft játékpénzből?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playPop();
                      setSelfReflection('yes');
                    }}
                    className="min-h-[52px] rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0F1D40] hover:border-[#0F1D40] hover:bg-indigo-50/40 transition-colors text-left"
                  >
                    Igen, tudatosan vásároltam!
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playPop();
                      setSelfReflection('could-better');
                    }}
                    className="min-h-[52px] rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0F1D40] hover:border-amber-500 hover:bg-amber-50/50 transition-colors text-left"
                  >
                    Lehetett volna még okosabban is
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl bg-[#0F1D40] text-white p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs font-semibold text-amber-300">
                      Kereskedelmi értékelés
                    </span>
                    <span className="font-mono tabular-nums text-xl font-bold text-amber-300">
                      {calculatedEvaluation.score} / 100 pont
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-100 leading-relaxed">
                    {calculatedEvaluation.verdict}
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/15 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
                    <span>Kötelező lista: {boughtRequiredCount}/3</span>
                    <span aria-hidden="true">·</span>
                    <span>Hasznos plusz: {usefulExtras.length} db</span>
                    <span aria-hidden="true">·</span>
                    <span>Impulzus cikk: {impulseItems.length} db</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playPop();
                      setPhase('shop');
                      setSelfReflection(null);
                    }}
                    className="min-h-[50px] flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0F1D40] hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Kosár módosítása
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="tactile-btn min-h-[50px] flex-1 rounded-2xl bg-[#E11D48] px-5 py-3 text-sm font-bold text-white hover:bg-[#BE123C] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Check className="w-4 h-4" />
                    Eredmény mentése
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const budgetPercent = Math.min(100, Math.round((totalSpent / SHOPPING_BUDGET) * 100));

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 sm:pb-0">
      {/* Midnight Cobalt Wallet Header */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#0F1D40] text-white p-4 sm:p-6 tactile-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
          <div>
            <p className="text-[11px] sm:text-xs text-amber-300 font-medium">
              01. állomás · Keret: 3 000 Ft · Auchan Partnerfeladat
            </p>
            <h2 className="mt-0.5 text-lg sm:text-2xl font-bold">
              Válogass a polcról 3 000 Ft-ból!
            </h2>
          </div>
          <div className="flex items-baseline gap-4 sm:text-right shrink-0">
            <div>
              <span className="block text-[11px] text-slate-300">Elköltve</span>
              <span className="font-mono tabular-nums text-lg sm:text-xl font-bold text-white">
                {formatFt(totalSpent)}
              </span>
            </div>
            <span className="text-white/25">/</span>
            <div>
              <span className="block text-[11px] text-slate-300">Maradék</span>
              <span
                className={`font-mono tabular-nums text-lg sm:text-xl font-bold ${
                  remaining < 350 ? 'text-rose-300' : 'text-amber-300'
                }`}
              >
                {formatFt(remaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Budget meter */}
        <div className="mt-3 h-2.5 w-full rounded-full bg-white/15 overflow-hidden">
          <div
            className={`h-full transition-all duration-200 rounded-full ${
              budgetPercent > 90 ? 'bg-[#F43F5E]' : 'bg-amber-400'
            }`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>

        {/* Shopping List checklist */}
        <div className="mt-3 pt-3 border-t border-white/15">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm">
            <span className="font-bold text-amber-300">Lista:</span>
            {requiredProducts.map((req) => {
              const checked = selectedIds.includes(req.id);
              return (
                <span
                  key={req.id}
                  className={`inline-flex items-center gap-1 font-medium ${
                    checked ? 'text-amber-300 line-through opacity-85' : 'text-white'
                  }`}
                >
                  <Check
                    className={`w-3.5 h-3.5 ${checked ? 'text-amber-300' : 'text-white/35'}`}
                  />
                  {req.name}
                </span>
              );
            })}
          </div>
        </div>

        {warning && (
          <div
            role="alert"
            className="mt-3 flex items-center gap-2 rounded-xl bg-rose-500/20 border border-rose-400/50 px-3 py-2 text-xs sm:text-sm text-rose-100"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-300" />
            <span>{warning}</span>
          </div>
        )}
      </div>

      {/* Product shelf grid with supermarket yellow price stickers (2x5 on mobile, 5x2 on tablet/desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-3">
        {SHOP_PRODUCTS.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          const cantAfford = !isSelected && totalSpent + product.price > SHOPPING_BUDGET;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => toggleProduct(product)}
              className={`group relative flex flex-col justify-between rounded-2xl border-2 p-2.5 lg:p-3.5 text-left transition-all active:scale-[0.98] min-h-[144px] lg:min-h-[164px] ${
                isSelected
                  ? 'border-[#0F1D40] bg-[#EEF2FF]/70 shadow-[0_3px_0_0_#0F1D40]'
                  : cantAfford
                  ? 'border-slate-200 bg-slate-100/70 opacity-60'
                  : 'border-slate-200 bg-white hover:border-[#0F1D40]/50 tactile-card'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 w-full">
                <span className="text-[11px] font-semibold text-slate-500 truncate">
                  {product.onList ? 'Listás' : product.category}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-[#0F1D40] text-amber-300'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-[#0F1D40] group-hover:text-white'
                  }`}
                >
                  {isSelected ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </span>
              </div>

              <div className="my-1.5 flex justify-center">
                <ProductArtwork art={product.art} className="w-12 h-12 sm:w-14 sm:h-14" />
              </div>

              <div className="w-full">
                <p className="text-xs sm:text-sm font-bold text-[#0B1220] leading-tight">
                  {product.name}
                </p>
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                    {product.unit}
                  </span>
                  <span className="font-mono tabular-nums text-xs sm:text-sm font-bold text-[#0B1220] bg-[#FDE047] px-1.5 sm:px-2 py-0.5 rounded-md shrink-0">
                    {formatFt(product.price)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sticky Thumb-Zone Mobile Checkout Bar (static card on tablet/desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-safe sm:static sm:z-auto sm:rounded-3xl sm:border sm:p-4 sm:tactile-card">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F1D40] text-amber-300 shrink-0">
              <ShoppingBasket className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#0B1220] truncate">
                <span className="font-mono tabular-nums">{selectedIds.length} db</span> ·{' '}
                <span className="font-mono tabular-nums">{formatFt(totalSpent)}</span>
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                Maradt:{' '}
                <span
                  className={`font-mono tabular-nums font-bold ${
                    remaining < 350 ? 'text-rose-600' : 'text-[#0F1D40]'
                  }`}
                >
                  {formatFt(remaining)}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="tactile-btn min-h-[48px] rounded-2xl bg-[#E11D48] px-5 sm:px-6 py-2.5 text-sm font-bold text-white hover:bg-[#BE123C] transition-all whitespace-nowrap shrink-0"
          >
            Fizetés
          </button>
        </div>
      </div>
    </div>
  );
};
