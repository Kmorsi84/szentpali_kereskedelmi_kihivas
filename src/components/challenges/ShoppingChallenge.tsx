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
    // Score breakdown (max 100):
    // - All 3 shopping list essentials: up to 45 pts (15 each)
    // - Smart quantity & value (non-impulse items count, up to 35 pts)
    // - Budget efficiency (spending close to 3000 without overspending, up to 20 pts)
    // - Impulse penalty: -10 per impulse snack if essential missing
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
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-medium text-emerald-700">Kasszablokk · Ellenőrzés</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                Biztos, hogy jól gazdálkodtál a pénzeddel?
              </h2>
            </div>
            <Receipt className="w-7 h-7 text-emerald-700 shrink-0" aria-hidden="true" />
          </div>

          {/* Receipt table */}
          <div className="mt-4 divide-y divide-slate-100 text-sm">
            {selectedProducts.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 gap-3">
                <div className="min-w-0">
                  <span className="font-medium text-slate-900">{item.name}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {item.onList ? 'Listás' : item.isImpulse ? 'Impulzus cikk' : 'Hasznos plusz'}
                  </span>
                </div>
                <span className="font-mono tabular-nums font-semibold text-slate-900 shrink-0">
                  {formatFt(item.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-baseline justify-between">
            <span className="text-sm font-medium text-slate-600">
              Összesen ({selectedProducts.length} termék) · Maradt: {formatFt(remaining)}
            </span>
            <span className="font-mono tabular-nums text-xl font-bold text-slate-900">
              {formatFt(totalSpent)}
            </span>
          </div>

          {/* Self reflection prompt */}
          {!selfReflection ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-slate-700 font-medium">
                Szerinted kihoztad a legtöbbet a 3 000 Ft játékpénzből?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playPop();
                    setSelfReflection('yes');
                  }}
                  className="min-h-[48px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:border-emerald-600 hover:bg-emerald-50/40 transition-colors text-left"
                >
                  Igen, tudatosan vásároltam!
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playPop();
                    setSelfReflection('could-better');
                  }}
                  className="min-h-[48px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:border-amber-600 hover:bg-amber-50/40 transition-colors text-left"
                >
                  Lehetett volna még okosabban is
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold text-emerald-800">
                    Kereskedelmi értékelés
                  </span>
                  <span className="font-mono tabular-nums text-lg font-bold text-emerald-900">
                    {calculatedEvaluation.score} / 100 pont
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-800 leading-relaxed">
                  {calculatedEvaluation.verdict}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
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
                  className="min-h-[48px] flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" />
                  Kosár módosítása
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="min-h-[48px] flex-1 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Check className="w-4 h-4" />
                  Eredmény mentése
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const budgetPercent = Math.min(100, Math.round((totalSpent / SHOPPING_BUDGET) * 100));

  return (
    <div className="space-y-5">
      {/* Top task briefing & live 3000 Ft wallet */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">
              1. állomás · Játékpénz keret: 3 000 Ft · Tesco Partnerfeladat
            </p>
            <h2 className="mt-0.5 text-lg sm:text-xl font-bold text-slate-900">
              Válogass a polcról 3 000 Ft-ból!
            </h2>
          </div>
          <div className="flex items-baseline gap-3 sm:text-right shrink-0">
            <div>
              <span className="block text-xs text-slate-500">Elköltve</span>
              <span className="font-mono tabular-nums text-xl font-bold text-slate-900">
                {formatFt(totalSpent)}
              </span>
            </div>
            <span className="text-slate-300">/</span>
            <div>
              <span className="block text-xs text-slate-500">Maradék</span>
              <span
                className={`font-mono tabular-nums text-xl font-bold ${
                  remaining < 350 ? 'text-amber-600' : 'text-emerald-700'
                }`}
              >
                {formatFt(remaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Budget bar */}
        <div className="mt-3.5 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-200 rounded-full ${
              budgetPercent > 90 ? 'bg-amber-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>

        {/* Shopping List checklist */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
            <span className="font-semibold text-slate-700">Bevásárlólista (kötelező):</span>
            {requiredProducts.map((req) => {
              const checked = selectedIds.includes(req.id);
              return (
                <span
                  key={req.id}
                  className={`inline-flex items-center gap-1.5 font-medium ${
                    checked ? 'text-emerald-700 line-through' : 'text-slate-800'
                  }`}
                >
                  <Check
                    className={`w-3.5 h-3.5 ${checked ? 'text-emerald-600' : 'text-slate-300'}`}
                  />
                  {req.name}
                </span>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Tipp: A listán kívül pakolj be minél több hasznos alapélelmiszert úgy, hogy ne lépd túl a 3 000 Ft-ot!
          </p>
        </div>

        {warning && (
          <div
            role="alert"
            className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs sm:text-sm text-red-800"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{warning}</span>
          </div>
        )}
      </div>

      {/* Product shelf grid with price tags */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SHOP_PRODUCTS.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          const cantAfford = !isSelected && totalSpent + product.price > SHOPPING_BUDGET;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => toggleProduct(product)}
              className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all active:scale-[0.98] min-h-[156px] ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                  : cantAfford
                  ? 'border-slate-200 bg-slate-50/80 opacity-65'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <span className="text-[11px] font-medium text-slate-500 truncate">
                  {product.onList ? 'Listán' : product.category}
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isSelected
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </span>
              </div>

              <div className="my-2 flex justify-center">
                <ProductArtwork art={product.art} className="w-14 h-14" />
              </div>

              <div className="w-full">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {product.name}
                </p>
                <div className="mt-1.5 flex items-baseline justify-between gap-1">
                  <span className="text-[11px] text-slate-500">{product.unit}</span>
                  {/* Classic retail price tag */}
                  <span className="font-mono tabular-nums text-xs sm:text-sm font-bold text-slate-900 bg-amber-100/90 px-1.5 py-0.5 rounded">
                    {formatFt(product.price)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Checkout CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
            <ShoppingBasket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Kosárban: <span className="font-mono tabular-nums">{selectedIds.length} db</span> termék
            </p>
            <p className="text-xs text-slate-500">
              Összesen {formatFt(totalSpent)} · Még {formatFt(remaining)} költhető
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          className="min-h-[48px] rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
        >
          Fizetés a kasszánál
        </button>
      </div>
    </div>
  );
};
