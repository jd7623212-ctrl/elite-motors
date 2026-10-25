import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { BarChart3, DollarSign, TrendingUp, Car, Sparkles, ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react';
import { Car as CarType } from '../types';

interface PriceDistributionChartProps {
  cars: CarType[];
  onSelectPriceRange?: (min: number, max: number | null) => void;
  selectedRange?: { min: number; max: number | null } | null;
  onClearPriceFilter?: () => void;
}

interface PriceBracket {
  key: string;
  label: string;
  shortLabel: string;
  min: number;
  max: number | null;
  count: number;
  avgPrice: number;
  sampleCars: string[];
}

export const PriceDistributionChart: React.FC<PriceDistributionChartProps> = ({
  cars,
  onSelectPriceRange,
  selectedRange,
  onClearPriceFilter,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredBracket, setHoveredBracket] = useState<string | null>(null);

  // 1. Filtrar únicamente vehículos en stock
  const inStockCars = useMemo(() => {
    return cars.filter((c) => c.inStock !== false);
  }, [cars]);

  // 2. Calcular estadísticas clave de precios en stock
  const stats = useMemo(() => {
    if (inStockCars.length === 0) {
      return { total: 0, min: 0, max: 0, avg: 0, median: 0 };
    }

    const prices = inStockCars.map((c) => c.price).sort((a, b) => a - b);
    const total = inStockCars.length;
    const min = prices[0];
    const max = prices[prices.length - 1];
    const sum = prices.reduce((acc, p) => acc + p, 0);
    const avg = Math.round(sum / total);
    const midIndex = Math.floor(prices.length / 2);
    const median =
      prices.length % 2 !== 0
        ? prices[midIndex]
        : Math.round((prices[midIndex - 1] + prices[midIndex]) / 2);

    return { total, min, max, avg, median };
  }, [inStockCars]);

  // 3. Estructurar la distribución en 5 tramos de precio
  const bracketDefinitions = useMemo(
    () => [
      { key: 'b1', label: 'Menos de $75,000', shortLabel: '< $75k', min: 0, max: 75000 },
      { key: 'b2', label: '$75,000 - $100,000', shortLabel: '$75k - $100k', min: 75000, max: 100000 },
      { key: 'b3', label: '$100,000 - $150,000', shortLabel: '$100k - $150k', min: 100000, max: 150000 },
      { key: 'b4', label: '$150,000 - $200,000', shortLabel: '$150k - $200k', min: 150000, max: 200000 },
      { key: 'b5', label: 'Más de $200,000', shortLabel: '> $200k', min: 200000, max: null },
    ],
    []
  );

  const distributionData = useMemo<PriceBracket[]>(() => {
    return bracketDefinitions.map((def) => {
      const matchingCars = inStockCars.filter((car) => {
        if (def.max === null) {
          return car.price >= def.min;
        }
        return car.price >= def.min && car.price < def.max;
      });

      const count = matchingCars.length;
      const sum = matchingCars.reduce((acc, c) => acc + c.price, 0);
      const avgPrice = count > 0 ? Math.round(sum / count) : 0;
      const sampleCars = matchingCars.slice(0, 3).map((c) => c.name);

      return {
        key: def.key,
        label: def.label,
        shortLabel: def.shortLabel,
        min: def.min,
        max: def.max,
        count,
        avgPrice,
        sampleCars,
      };
    });
  }, [inStockCars, bracketDefinitions]);

  // Custom Recharts Tooltip
  const CustomPriceTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: PriceBracket = payload[0].payload;
      return (
        <div className="bg-[#12141a]/95 border border-[#e5b869]/40 backdrop-blur-md p-3.5 rounded-xl shadow-2xl max-w-xs text-xs z-50">
          <div className="flex items-center justify-between gap-3 mb-1.5 pb-1.5 border-b border-white/10">
            <span className="font-bold text-white font-display">{data.label}</span>
            <span className="font-mono text-[#e5b869] font-bold tabular-nums">
              {data.count} {data.count === 1 ? 'unidad' : 'unidades'}
            </span>
          </div>

          <div className="space-y-1 text-zinc-300">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Precio promedio:</span>
              <span className="font-mono font-semibold text-emerald-400">
                ${data.avgPrice.toLocaleString()} USD
              </span>
            </div>

            {data.sampleCars.length > 0 && (
              <div className="pt-1.5 mt-1.5 border-t border-white/[0.06]">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
                  Ejemplos en este rango:
                </span>
                <ul className="text-[11px] text-zinc-300 space-y-0.5 list-disc list-inside">
                  {data.sampleCars.map((name, i) => (
                    <li key={i} className="truncate">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-2 pt-1.5 border-t border-white/[0.08] text-[10px] text-[#e5b869] italic flex items-center gap-1">
            <Filter className="w-2.5 h-2.5" />
            <span>Haz clic en la barra para filtrar este rango</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (inStockCars.length === 0) return null;

  return (
    <div className="mt-6 bg-[#0f1117] border border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all">
      {/* Top Header / Collapse Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/70 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#e5b869]/10 border border-[#e5b869]/20 flex items-center justify-center text-[#e5b869] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-display">
                Distribución de Precios en Stock
              </h3>
              <span className="text-[10px] font-mono uppercase bg-[#e5b869]/15 text-[#e5b869] px-2 py-0.5 rounded border border-[#e5b869]/25 font-bold">
                Recharts Analytics
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Análisis visual del valor de mercado de los {inStockCars.length} vehículos disponibles en inventario
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {selectedRange && onClearPriceFilter && (
            <button
              onClick={onClearPriceFilter}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#e5b869] hover:bg-[#e5b869]/10 rounded border border-[#e5b869]/30 transition-colors cursor-pointer"
              title="Quitar filtro de precio"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer Rango</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg border border-white/10 transition-colors cursor-pointer"
            aria-label={isExpanded ? 'Ocultar gráfico' : 'Mostrar gráfico'}
          >
            <span>{isExpanded ? 'Ocultar Gráfica' : 'Ver Gráfica'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/[0.06]">
              <div className="text-[11px] text-zinc-400 flex items-center justify-between mb-1">
                <span>Vehículos en Stock</span>
                <Car className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold font-display text-white tabular-nums">
                {stats.total}{' '}
                <span className="text-xs text-zinc-400 font-normal">unidades</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/[0.06]">
              <div className="text-[11px] text-zinc-400 flex items-center justify-between mb-1">
                <span>Precio Promedio</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#e5b869]" />
              </div>
              <div className="text-lg sm:text-xl font-bold font-display text-[#e5b869] tabular-nums">
                ${stats.avg.toLocaleString()}{' '}
                <span className="text-[10px] text-zinc-400 font-normal">USD</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/[0.06]">
              <div className="text-[11px] text-zinc-400 flex items-center justify-between mb-1">
                <span>Precio Mediana</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold font-display text-emerald-400 tabular-nums">
                ${stats.median.toLocaleString()}{' '}
                <span className="text-[10px] text-zinc-400 font-normal">USD</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/[0.06]">
              <div className="text-[11px] text-zinc-400 flex items-center justify-between mb-1">
                <span>Rango Mín. - Máx.</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-sm sm:text-base font-bold font-display text-zinc-200 tabular-nums truncate">
                ${stats.min.toLocaleString()} - ${stats.max.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Gráfico de Barras con Recharts */}
          <div className="p-4 bg-zinc-950/70 rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>Cantidad de Vehículos por Rango de Precio</span>
              </span>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">
                Pasa el cursor o haz clic en las barras para interactuar
              </span>
            </div>

            <div className="h-60 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distributionData}
                  margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length && onSelectPriceRange) {
                      const data: PriceBracket = e.activePayload[0].payload;
                      onSelectPriceRange(data.min, data.max);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="inventoryGoldBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e5b869" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#b38634" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="inventoryActiveGoldBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f5d491" stopOpacity={1} />
                      <stop offset="100%" stopColor="#e5b869" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262832" vertical={false} />
                  <XAxis
                    dataKey="shortLabel"
                    stroke="#828594"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#333745' }}
                  />
                  <YAxis
                    stroke="#828594"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#333745' }}
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(dataMax + 2, 8)]}
                  />
                  <Tooltip content={<CustomPriceTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
                  <Bar
                    dataKey="count"
                    name="Vehículos en Stock"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                    onMouseEnter={(data: any) => setHoveredBracket(data?.key ? String(data.key) : null)}
                    onMouseLeave={() => setHoveredBracket(null)}
                  >
                    {distributionData.map((entry) => {
                      const isSelected =
                        selectedRange &&
                        selectedRange.min === entry.min &&
                        selectedRange.max === entry.max;
                      const isHovered = hoveredBracket === entry.key;

                      return (
                        <Cell
                          key={entry.key}
                          fill={
                            isSelected
                              ? 'url(#inventoryActiveGoldBar)'
                              : isHovered
                              ? '#f3cf85'
                              : 'url(#inventoryGoldBar)'
                          }
                          stroke={isSelected ? '#ffffff' : '#e5b869'}
                          strokeWidth={isSelected ? 2 : 1}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Click to filter chips below chart */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-zinc-400 mr-1">Filtrar por rango:</span>
                {distributionData.map((bracket) => {
                  const isSelected =
                    selectedRange &&
                    selectedRange.min === bracket.min &&
                    selectedRange.max === bracket.max;

                  return (
                    <button
                      key={bracket.key}
                      onClick={() => {
                        if (isSelected && onClearPriceFilter) {
                          onClearPriceFilter();
                        } else if (onSelectPriceRange) {
                          onSelectPriceRange(bracket.min, bracket.max);
                        }
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-[#e5b869] text-black font-semibold border-[#e5b869]'
                          : 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border-white/10'
                      }`}
                    >
                      <span>{bracket.label}</span>
                      <span className="ml-1 opacity-70">({bracket.count})</span>
                    </button>
                  );
                })}
              </div>

              {selectedRange && onClearPriceFilter && (
                <button
                  onClick={onClearPriceFilter}
                  className="text-xs text-[#e5b869] hover:underline cursor-pointer"
                >
                  Restablecer filtro
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
