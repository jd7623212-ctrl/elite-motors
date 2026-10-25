import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  Sparkles,
  Filter,
  X,
  Compass,
  Zap,
  Flame,
  Gauge,
  Check,
  Layers,
  SlidersHorizontal,
  Tag,
  Cpu,
  Car as CarIcon
} from 'lucide-react';
import { Car } from '../types';
import { CarCard } from './CarCard';
import { PriceDistributionChart } from './PriceDistributionChart';

interface InventorySectionProps {
  cars: Car[];
  favoriteIds: string[];
  comparedIds: string[];
  onSelectCar: (car: Car) => void;
  onToggleFavorite: (car: Car) => void;
  onToggleCompare: (car: Car) => void;
  onAddToCart: (car: Car) => void;
}

interface OriginCategoryItem {
  id: string;
  label: string;
  count: number;
  country?: string;
  badge?: string;
}

export interface EngineFilterOption {
  id: string;
  label: string;
  shortLabel: string;
  keywords: string[];
}

export const ENGINE_FILTER_OPTIONS: EngineFilterOption[] = [
  { id: 'all', label: 'Todos los Motores', shortLabel: 'Todos', keywords: [] },
  { id: 'v8', label: 'Motor V8 (Supercharged / Atmosférico / Turbo)', shortLabel: 'V8', keywords: ['v8'] },
  { id: 'v10', label: 'Motor V10', shortLabel: 'V10', keywords: ['v10'] },
  { id: 'v12', label: 'Motor V12', shortLabel: 'V12', keywords: ['v12'] },
  { id: 'boxer', label: 'Motor Bóxer (Flat-6 / Flat-4)', shortLabel: 'Bóxer', keywords: ['boxer', 'bóxer'] },
  { id: 'twin-turbo', label: 'Twin-Turbo / Biturbo', shortLabel: 'Twin-Turbo', keywords: ['twin-turbo', 'biturbo', 'bi-turbo', 'turbo'] },
  { id: 'v6', label: 'Motor V6 (VTEC / Twin-Turbo / EcoBoost)', shortLabel: 'V6', keywords: ['v6'] },
  { id: 'inline6', label: '6 en Línea (RB26 / 2JZ / S58 / S54)', shortLabel: '6 en Línea', keywords: ['6 en línea', 'inline', 'rb26', '2jz', 's58', 's54', '6 cilindros'] },
  { id: 'rotativo', label: 'Rotativo Wankel (13B-REW)', shortLabel: 'Rotativo', keywords: ['rotativo', 'wankel', '13b'] },
  { id: 'w16', label: 'W16 Quad-Turbo', shortLabel: 'W16', keywords: ['w16'] },
];

const POPULAR_SEARCH_TERMS = [
  // Marcas
  { label: 'Porsche', query: 'Porsche', type: 'marca' },
  { label: 'Ferrari', query: 'Ferrari', type: 'marca' },
  { label: 'Nissan', query: 'Nissan', type: 'marca' },
  { label: 'BMW', query: 'BMW', type: 'marca' },
  { label: 'Lamborghini', query: 'Lamborghini', type: 'marca' },
  { label: 'Toyota', query: 'Toyota', type: 'marca' },
  { label: 'Chevrolet', query: 'Chevrolet', type: 'marca' },
  // Modelos
  { label: 'Skyline R34', query: 'Skyline', type: 'modelo' },
  { label: 'Supra', query: 'Supra', type: 'modelo' },
  { label: '911 Turbo', query: '911', type: 'modelo' },
  { label: 'Hellcat', query: 'Hellcat', type: 'modelo' },
  { label: 'Chiron', query: 'Chiron', type: 'modelo' },
  // Motores
  { label: 'V8', query: 'V8', type: 'motor' },
  { label: 'V10', query: 'V10', type: 'motor' },
  { label: 'V12', query: 'V12', type: 'motor' },
  { label: 'Twin-Turbo', query: 'Twin-Turbo', type: 'motor' },
  { label: 'Bóxer', query: 'Boxer', type: 'motor' },
  { label: 'Rotativo', query: 'Rotativo', type: 'motor' },
];

export const InventorySection: React.FC<InventorySectionProps> = ({
  cars,
  favoriteIds,
  comparedIds,
  onSelectCar,
  onToggleFavorite,
  onToggleCompare,
  onAddToCart,
}) => {
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedEngineType, setSelectedEngineType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc' | 'power-desc' | 'accel-asc'>('featured');
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number | null } | null>(null);

  // Dynamic extraction of categories and live vehicle counts based directly on the current cars state
  const categories = useMemo<OriginCategoryItem[]>(() => {
    const originMap = new Map<string, OriginCategoryItem>();

    cars.forEach((car) => {
      const key = car.origin || 'other';
      const existing = originMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        originMap.set(key, {
          id: key,
          label: car.originLabel || key.toUpperCase(),
          count: 1,
          country: car.originCountry,
        });
      }
    });

    // Order priority if available
    const customOrder: Record<string, number> = {
      jdm: 1,
      american: 2,
      european: 3,
      italian: 4,
      hypercar: 5,
    };

    const sortedOrigins = Array.from(originMap.values()).sort((a, b) => {
      const orderA = customOrder[a.id] || 99;
      const orderB = customOrder[b.id] || 99;
      return orderA - orderB;
    });

    return [
      {
        id: 'all',
        label: 'Todos los Tipos',
        count: cars.length,
        badge: 'Catálogo',
      },
      ...sortedOrigins,
    ];
  }, [cars]);

  // Dynamic extraction of available brands with real vehicle counts
  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    cars.forEach((c) => {
      brandMap.set(c.brand, (brandMap.get(c.brand) || 0) + 1);
    });
    return Array.from(brandMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([brand, count]) => ({ brand, count }));
  }, [cars]);

  // Dynamic counts for each engine option
  const engineOptionCounts = useMemo(() => {
    return ENGINE_FILTER_OPTIONS.map((opt) => {
      if (opt.id === 'all') return { ...opt, count: cars.length };
      const count = cars.filter((c) => {
        const text = `${c.engine} ${c.engineType || ''}`.toLowerCase();
        return opt.keywords.some((k) => text.includes(k));
      }).length;
      return { ...opt, count };
    });
  }, [cars]);

  // Ensure selectedOrigin remains valid if cars state changes
  useEffect(() => {
    if (selectedOrigin !== 'all' && !cars.some((c) => c.origin === selectedOrigin)) {
      setSelectedOrigin('all');
    }
  }, [cars, selectedOrigin]);

  // Filter and sort the cars in real-time by brand, model, engine type, origin, price, and search text
  const filteredCars = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    const queryWords = rawQuery.split(/\s+/).filter(Boolean);

    return cars
      .filter((car) => {
        // 1. Origin category filter
        if (selectedOrigin !== 'all' && car.origin !== selectedOrigin) {
          return false;
        }

        // 2. Specific Brand filter
        if (selectedBrand !== 'all' && car.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        // 3. Specific Engine Type filter
        if (selectedEngineType !== 'all') {
          const opt = ENGINE_FILTER_OPTIONS.find((o) => o.id === selectedEngineType);
          if (opt && opt.keywords.length > 0) {
            const engineText = `${car.engine} ${car.engineType || ''}`.toLowerCase();
            const matchesEngine = opt.keywords.some((k) => engineText.includes(k));
            if (!matchesEngine) return false;
          }
        }

        // 4. Real-time Search query filter (matches brand, model, engine, engineType, year, color, vin, etc.)
        if (queryWords.length > 0) {
          const originAliases =
            car.origin === 'american'
              ? 'muscle american muscle v8'
              : car.origin === 'jdm'
              ? 'jdm japones japon turbo'
              : car.origin === 'european'
              ? 'european gt aleman britanico'
              : car.origin === 'italian'
              ? 'italian exotic italiano superdeportivo'
              : car.origin === 'hypercar'
              ? 'hypercar supercar hiperdeportivo exótico'
              : '';

          const searchableText = `${car.name} ${car.brand} ${car.model} ${car.origin} ${car.originLabel || ''} ${car.originCountry || ''} ${car.engine} ${car.engineType || ''} ${car.exteriorColor || ''} ${car.transmission || ''} ${car.drivetrain || ''} ${car.vin} ${car.year} ${originAliases}`.toLowerCase();

          // Every word entered must match somewhere in the car's metadata
          const matchesAll = queryWords.every((word) => searchableText.includes(word));
          if (!matchesAll) {
            return false;
          }
        }

        // 5. Price range filter (from Recharts bar chart)
        if (selectedPriceRange) {
          if (selectedPriceRange.max === null) {
            if (car.price < selectedPriceRange.min) return false;
          } else {
            if (car.price < selectedPriceRange.min || car.price >= selectedPriceRange.max) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'year-desc':
            return b.year - a.year;
          case 'year-asc':
            return a.year - b.year;
          case 'power-desc':
            return b.horsepower - a.horsepower;
          case 'accel-asc':
            return a.acceleration - b.acceleration;
          case 'featured':
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });
  }, [cars, selectedOrigin, searchQuery, sortBy, selectedPriceRange]);

  const activeCategoryObject = categories.find((c) => c.id === selectedOrigin);

  // Icon helper per car category
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'all':
        return <Layers className="w-3.5 h-3.5" />;
      case 'jdm':
        return <Compass className="w-3.5 h-3.5" />;
      case 'american':
        return <Flame className="w-3.5 h-3.5" />;
      case 'european':
        return <Gauge className="w-3.5 h-3.5" />;
      case 'italian':
        return <Zap className="w-3.5 h-3.5" />;
      case 'hypercar':
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <section id="inventory" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#e5b869] uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catálogo Oficial de Colección</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
            Colección Disponible
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-xl">
            Cada vehículo cuenta con historial Carfax certificado, inspección técnica rigurosa de 150 puntos y garantía mecánica extendida.
          </p>
        </div>

        {/* Live count stats strip */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 px-3.5 py-2 rounded-lg border border-white/[0.08] self-start md:self-auto shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Mostrando <strong className="text-[#e5b869] font-bold tabular-nums">{filteredCars.length}</strong> de{' '}
            <strong className="text-zinc-200 tabular-nums">{cars.length}</strong> unidades
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BARRA DE BÚSQUEDA Y FILTROS POR MARCA, MODELO Y TIPO DE MOTOR */}
      {/* ============================================================ */}
      <div className="mt-8 bg-[#12141a] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
        {/* 1. Barra de Búsqueda Principal de Alta Visibilidad */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label
              htmlFor="inventory-search-input"
              className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#e5b869]" />
              <span>Búsqueda en Tiempo Real: Marca, Modelo o Tipo de Motor</span>
            </label>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Filtro instantáneo en vivo</span>
            </div>
          </div>

          {/* Campo de Texto de Búsqueda */}
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-[#e5b869] pointer-events-none" />
            <input
              id="inventory-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por marca (Ferrari, Nissan, Porsche...), modelo (Skyline, 911, Hellcat...) o tipo de motor (V8, V10, Twin-Turbo, Bóxer)..."
              className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base bg-[#0a0c10] border border-white/15 focus:border-[#e5b869] focus:ring-2 focus:ring-[#e5b869]/20 focus:outline-none rounded-xl text-white placeholder-zinc-500 transition-all shadow-inner font-sans"
              aria-label="Buscar vehículos por marca, modelo o tipo de motor"
            />

            <div className="absolute right-3 flex items-center gap-2">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Limpiar búsqueda"
                  aria-label="Limpiar campo de búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-zinc-400 bg-white/[0.06] border border-white/10 px-2.5 py-1 rounded">
                {filteredCars.length} {filteredCars.length === 1 ? 'auto' : 'autos'}
              </span>
            </div>
          </div>

          {/* Selectores Rápidos de Marca y Tipo de Motor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Selector de Marca */}
            <div className="flex items-center gap-2.5 bg-[#0a0c10] border border-white/10 hover:border-white/20 focus-within:border-[#e5b869] rounded-xl px-3.5 py-2.5 transition-all">
              <Tag className="w-4 h-4 text-[#e5b869] shrink-0" />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="inventory-brand-select"
                  className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider leading-none mb-1"
                >
                  Filtrar por Marca
                </label>
                <select
                  id="inventory-brand-select"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer border-none p-0"
                >
                  <option value="all" className="bg-[#12141a] text-white">
                    Todas las marcas ({cars.length})
                  </option>
                  {availableBrands.map(({ brand, count }) => (
                    <option key={brand} value={brand} className="bg-[#12141a] text-white">
                      {brand} ({count})
                    </option>
                  ))}
                </select>
              </div>
              {selectedBrand !== 'all' && (
                <button
                  onClick={() => setSelectedBrand('all')}
                  className="p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer shrink-0"
                  title="Quitar filtro de marca"
                  aria-label="Quitar filtro de marca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selector de Tipo de Motor */}
            <div className="flex items-center gap-2.5 bg-[#0a0c10] border border-white/10 hover:border-white/20 focus-within:border-[#e5b869] rounded-xl px-3.5 py-2.5 transition-all">
              <Cpu className="w-4 h-4 text-[#e5b869] shrink-0" />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="inventory-engine-select"
                  className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider leading-none mb-1"
                >
                  Filtrar por Tipo de Motor
                </label>
                <select
                  id="inventory-engine-select"
                  value={selectedEngineType}
                  onChange={(e) => setSelectedEngineType(e.target.value)}
                  className="w-full bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer border-none p-0"
                >
                  {engineOptionCounts.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-[#12141a] text-white">
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>
              {selectedEngineType !== 'all' && (
                <button
                  onClick={() => setSelectedEngineType('all')}
                  className="p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer shrink-0"
                  title="Quitar filtro de motor"
                  aria-label="Quitar filtro de motor"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Atajos Rápidos de Búsqueda (Chips categorizados) */}
          <div className="pt-2 flex flex-col gap-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
                Atajos:
              </span>
              {POPULAR_SEARCH_TERMS.map((term) => {
                const isMatch = searchQuery.toLowerCase().includes(term.query.toLowerCase());
                return (
                  <button
                    key={term.query}
                    onClick={() => {
                      if (isMatch) {
                        setSearchQuery('');
                      } else {
                        setSearchQuery(term.query);
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer border ${
                      isMatch
                        ? 'bg-[#e5b869]/25 text-[#e5b869] border-[#e5b869]/60 shadow-sm'
                        : 'bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:text-white hover:bg-white/[0.08] hover:border-white/20'
                    }`}
                    title={`Filtrar por ${term.label} (${term.type})`}
                  >
                    <span>{term.label}</span>
                    <span
                      className={`text-[9px] uppercase px-1 rounded font-mono ${
                        isMatch
                          ? 'bg-[#e5b869]/20 text-[#e5b869]'
                          : 'bg-white/[0.06] text-zinc-400'
                      }`}
                    >
                      {term.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Barra de Categorías (Pills) & Selector de Ordenamiento */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Categorías (Pills) */}
          <div className="flex-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 shrink-0 mr-1 hidden sm:inline">
                Tipo:
              </span>
              {categories.map((cat) => {
                const isSelected = selectedOrigin === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedOrigin(cat.id)}
                    className={`group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-[#e5b869] text-black font-semibold border-[#e5b869] shadow-md shadow-[#e5b869]/20 ring-1 ring-[#e5b869]'
                        : 'bg-[#181b24] text-zinc-300 border-white/[0.08] hover:border-[#e5b869]/40 hover:text-white hover:bg-[#1e222d]'
                    }`}
                    aria-pressed={isSelected}
                    title={`Filtrar por ${cat.label}`}
                  >
                    <span className={isSelected ? 'text-black' : 'text-[#e5b869]'}>
                      {getCategoryIcon(cat.id)}
                    </span>
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums transition-colors ${
                        isSelected
                          ? 'bg-black/20 text-black'
                          : 'bg-white/10 text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    >
                      {cat.count}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Ordenamiento */}
          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
            <label
              htmlFor="inventory-sort-dropdown"
              className="text-xs text-zinc-300 font-medium flex items-center gap-1.5 shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#e5b869]" />
              <span className="hidden sm:inline">Ordenar:</span>
            </label>
            <select
              id="inventory-sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-medium bg-zinc-900 border border-white/10 hover:border-[#e5b869]/40 focus:border-[#e5b869] focus:outline-none rounded-lg text-zinc-100 cursor-pointer transition-colors shadow-sm"
              aria-label="Selector de ordenamiento de vehículos"
            >
              <option value="featured">Destacados de Colección</option>
              <option value="price-asc">Precio: Menor a Mayor ($)</option>
              <option value="price-desc">Precio: Mayor a Menor ($)</option>
              <option value="year-desc">Año: Más Reciente</option>
              <option value="year-asc">Año: Más Clásico / Antiguo</option>
              <option value="power-desc">Mayor Potencia (CV / HP)</option>
              <option value="accel-asc">Aceleración: 0-100 km/h más rápido</option>
            </select>
          </div>
        </div>

        {/* 3. Indicador de Filtros Activos & Limpieza Rápida */}
        {(selectedOrigin !== 'all' ||
          selectedBrand !== 'all' ||
          selectedEngineType !== 'all' ||
          searchQuery.trim() !== '' ||
          selectedPriceRange !== null) && (
          <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-400">Filtros activos:</span>

              {/* Filtro de Búsqueda de Texto */}
              {searchQuery.trim() !== '' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-zinc-200 border border-white/20 text-[11px] font-medium">
                  <span>Búsqueda: "{searchQuery}"</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-white cursor-pointer"
                    title="Quitar término de búsqueda"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Filtro de Marca */}
              {selectedBrand !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e5b869]/15 text-[#e5b869] border border-[#e5b869]/30 text-[11px] font-medium">
                  <Tag className="w-3 h-3" />
                  <span>Marca: {selectedBrand}</span>
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className="hover:text-white cursor-pointer"
                    title="Quitar filtro de marca"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Filtro de Tipo de Motor */}
              {selectedEngineType !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-medium">
                  <Cpu className="w-3 h-3" />
                  <span>
                    Motor: {ENGINE_FILTER_OPTIONS.find((o) => o.id === selectedEngineType)?.shortLabel}
                  </span>
                  <button
                    onClick={() => setSelectedEngineType('all')}
                    className="hover:text-white cursor-pointer"
                    title="Quitar filtro de motor"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Filtro de Tipo de Vehículo */}
              {selectedOrigin !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e5b869]/15 text-[#e5b869] border border-[#e5b869]/30 text-[11px] font-medium">
                  <span>Tipo: {activeCategoryObject?.label}</span>
                  <button
                    onClick={() => setSelectedOrigin('all')}
                    className="hover:text-white cursor-pointer"
                    title="Quitar filtro de tipo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Filtro de Rango de Precio */}
              {selectedPriceRange && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
                  <span>
                    Precio: {selectedPriceRange.max ? `$${selectedPriceRange.min.toLocaleString()} - $${selectedPriceRange.max.toLocaleString()}` : `> $${selectedPriceRange.min.toLocaleString()}`}
                  </span>
                  <button
                    onClick={() => setSelectedPriceRange(null)}
                    className="hover:text-white cursor-pointer"
                    title="Quitar filtro de precio"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <span className="text-zinc-400 text-[11px]">
                ({filteredCars.length} {filteredCars.length === 1 ? 'vehículo encontrado' : 'vehículos encontrados'})
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedOrigin('all');
                setSelectedBrand('all');
                setSelectedEngineType('all');
                setSearchQuery('');
                setSelectedPriceRange(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#e5b869] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer Filtros</span>
            </button>
          </div>
        )}
      </div>

      {/* Gráfico de Barras Recharts: Distribución de Precios en Stock */}
      <PriceDistributionChart
        cars={cars}
        selectedRange={selectedPriceRange}
        onSelectPriceRange={(min, max) => setSelectedPriceRange({ min, max })}
        onClearPriceFilter={() => setSelectedPriceRange(null)}
      />

      {/* Product Grid - 3 columns desktop, 2 columns tablet */}
      {filteredCars.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              isFavorite={favoriteIds.includes(car.id)}
              isCompared={comparedIds.includes(car.id)}
              onSelectCar={onSelectCar}
              onToggleFavorite={onToggleFavorite}
              onToggleCompare={onToggleCompare}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 py-16 text-center bg-zinc-900/40 border border-white/[0.06] rounded-xl max-w-xl mx-auto px-6">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 text-zinc-400 flex items-center justify-center mx-auto mb-4">
            <Filter className="w-5 h-5 text-zinc-500" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            Sin resultados para los filtros seleccionados
          </h3>
          <p className="text-zinc-400 text-xs">
            No se encontraron vehículos que coincidan con
            {searchQuery ? ` la búsqueda "${searchQuery}"` : ''}
            {selectedPriceRange ? ` en el rango de precio seleccionado` : ''}
            {selectedOrigin !== 'all' ? ` en la categoría ${activeCategoryObject?.label || selectedOrigin}` : ''}.
          </p>
          <button
            onClick={() => {
              setSelectedOrigin('all');
              setSelectedBrand('all');
              setSelectedEngineType('all');
              setSearchQuery('');
              setSelectedPriceRange(null);
            }}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded cursor-pointer transition-all shadow-md shadow-[#e5b869]/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Búsqueda y Ver Todos ({cars.length})</span>
          </button>
        </div>
      )}
    </section>
  );
};
