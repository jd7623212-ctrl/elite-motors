import React, { useState, useMemo } from 'react';
import { Calculator, CheckCircle2, ChevronRight, DollarSign } from 'lucide-react';
import { Car } from '../types';

interface FinancingCalculatorProps {
  cars: Car[];
  selectedCarForFinancing: Car | null;
  onApplyForFinancing: (details: {
    carName: string;
    monthlyPayment: number;
    downPayment: number;
    termMonths: number;
  }) => void;
}

export const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({
  cars,
  selectedCarForFinancing,
  onApplyForFinancing,
}) => {
  const [selectedCarId, setSelectedCarId] = useState<string>(
    selectedCarForFinancing ? selectedCarForFinancing.id : cars[0]?.id || ''
  );
  const [customPrice, setCustomPrice] = useState<number>(
    selectedCarForFinancing ? selectedCarForFinancing.price : cars[0]?.price || 150000
  );
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 20%
  const [termMonths, setTermMonths] = useState<number>(48); // 48 months
  const [apr, setApr] = useState<number>(5.4); // 5.4% APR
  const [tradeInValue, setTradeInValue] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  // Sync if prop changes or when cars list is populated
  React.useEffect(() => {
    if (selectedCarForFinancing) {
      setSelectedCarId(selectedCarForFinancing.id);
      setCustomPrice(selectedCarForFinancing.price);
    } else if ((!selectedCarId || !cars.some((c) => c.id === selectedCarId)) && cars.length > 0) {
      setSelectedCarId(cars[0].id);
      setCustomPrice(cars[0].price);
    }
  }, [selectedCarForFinancing, cars, selectedCarId]);

  const activeCar = cars.find((c) => c.id === selectedCarId);

  const carPrice = activeCar ? activeCar.price : customPrice;
  const downPaymentAmount = Math.round((carPrice * downPaymentPercent) / 100);
  const principalAmount = Math.max(0, carPrice - downPaymentAmount - tradeInValue);

  // Monthly payment calculation
  const monthlyPayment = useMemo(() => {
    if (principalAmount <= 0) return 0;
    const monthlyRate = apr / 100 / 12;
    if (monthlyRate === 0) return principalAmount / termMonths;
    const payment =
      (principalAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    return Math.round(payment);
  }, [principalAmount, apr, termMonths]);

  const totalFinancedCost = monthlyPayment * termMonths + downPaymentAmount + tradeInValue;
  const totalInterest = Math.max(0, totalFinancedCost - carPrice);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    onApplyForFinancing({
      carName: activeCar ? activeCar.name : 'Vehículo Personalizado',
      monthlyPayment,
      downPayment: downPaymentAmount,
      termMonths,
    });
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section id="financing" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.08]">
      <div className="pb-8">
        <div className="text-xs font-semibold tracking-widest text-[#e5b869] uppercase mb-2">
          Financiación & Leasing a Medida
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
          Financiación
        </h2>
        <p className="mt-2 text-sm text-zinc-400 max-w-xl">
          Diseña tu plan de pagos mensual con tasas preferenciales desde 4.9% APR y opciones de entrega de tu vehículo actual como parte de pago.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders and Controls Column */}
        <div className="lg:col-span-7 bg-[#12141a] border border-white/[0.08] rounded-xl p-6 sm:p-8 space-y-6">
          {/* Vehicle Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Vehículo Seleccionado
            </label>
            <select
              value={selectedCarId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedCarId(id);
                const found = cars.find((c) => c.id === id);
                if (found) setCustomPrice(found.price);
              }}
              className="w-full text-sm bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
            >
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name} — ${car.price.toLocaleString()} USD
                </option>
              ))}
            </select>
          </div>

          {/* Down Payment Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="text-zinc-400 uppercase tracking-wider">Enganche / Pago Inicial ({downPaymentPercent}%)</span>
              <span className="text-[#e5b869] font-bold tabular-nums">
                ${downPaymentAmount.toLocaleString()} USD
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-[#e5b869] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
              <span>10% Mínimo</span>
              <span>30% Sugerido</span>
              <span>60%</span>
            </div>
          </div>

          {/* Loan Term Selector (Buttons) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Plazo de Financiación ({termMonths} Meses)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[24, 36, 48, 60, 72].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setTermMonths(term)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    termMonths === term
                      ? 'bg-[#e5b869] text-black border-[#e5b869] shadow-sm'
                      : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {term}m
                </button>
              ))}
            </div>
          </div>

          {/* Trade-in Value Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="text-zinc-400 uppercase tracking-wider">Auto a Cuenta (Trade-In Opcional)</span>
              <span className="text-zinc-200 font-bold tabular-nums">
                ${tradeInValue.toLocaleString()} USD
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60000"
              step="2000"
              value={tradeInValue}
              onChange={(e) => setTradeInValue(Number(e.target.value))}
              className="w-full accent-zinc-400 cursor-pointer"
            />
          </div>

          {/* APR Rate Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="text-zinc-400 uppercase tracking-wider">Tasa Preferencial APR Anual</span>
              <span className="text-zinc-200 font-bold tabular-nums">{apr.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="3.9"
              max="9.9"
              step="0.1"
              value={apr}
              onChange={(e) => setApr(Number(e.target.value))}
              className="w-full accent-[#e5b869] cursor-pointer"
            />
          </div>
        </div>

        {/* Results Card Column */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#171922] to-[#111319] border border-[#e5b869]/30 rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
              Estimación de Cuota Mensual
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-bold font-display text-[#e5b869] tabular-nums">
                ${monthlyPayment.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-zinc-400">USD / mes</span>
            </div>

            <p className="mt-2 text-xs text-zinc-400">
              Cálculo con amortización fija francesa, sin penalización por liquidación anticipada.
            </p>

            {/* Breakdown List */}
            <div className="mt-6 pt-6 border-t border-white/[0.08] space-y-3 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Precio del Vehículo:</span>
                <span className="font-semibold tabular-nums">${carPrice.toLocaleString()} USD</span>
              </div>

              <div className="flex justify-between text-zinc-300">
                <span>Enganche Pagado ({downPaymentPercent}%):</span>
                <span className="font-semibold tabular-nums">-${downPaymentAmount.toLocaleString()} USD</span>
              </div>

              {tradeInValue > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Vehículo a Cuenta:</span>
                  <span className="font-semibold tabular-nums">-${tradeInValue.toLocaleString()} USD</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-300">
                <span>Monto Neto Financiado:</span>
                <span className="font-semibold tabular-nums">${principalAmount.toLocaleString()} USD</span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Interés Total Estimado:</span>
                <span className="font-medium tabular-nums">${Math.round(totalInterest).toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            {submitted ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-center text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Solicitud de Pre-aprobación recibida. Un asesor VIP te contactará.</span>
              </div>
            ) : (
              <button
                onClick={handleApply}
                className="w-full py-3.5 text-xs font-semibold text-black uppercase tracking-wider bg-[#e5b869] hover:bg-[#d4a34b] active:scale-[0.98] rounded transition-all cursor-pointer shadow-lg shadow-[#e5b869]/20"
              >
                Solicitar Pre-Aprobación Inmediata
              </button>
            )}
            <p className="mt-2.5 text-[11px] text-zinc-500 text-center">
              Sin impacto en historial crediticio preliminar · Respuesta en 15 minutos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
