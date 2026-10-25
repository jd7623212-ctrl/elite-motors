import React from 'react';
import { Bookmark, ArrowUpRight, Check, Gauge, Zap, Plus, CheckSquare, Square } from 'lucide-react';
import { Car } from '../types';
import { handleCarImageError } from '../utils/carImages';

interface CarCardProps {
  car: Car;
  isFavorite: boolean;
  isCompared: boolean;
  onSelectCar: (car: Car) => void;
  onToggleFavorite: (car: Car) => void;
  onToggleCompare: (car: Car) => void;
  onAddToCart: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  isFavorite,
  isCompared,
  onSelectCar,
  onToggleFavorite,
  onToggleCompare,
  onAddToCart,
}) => {
  return (
    <article
      onClick={() => onSelectCar(car)}
      className="group relative bg-[#13151b] border border-white/[0.08] hover:border-[#e5b869]/50 rounded-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
    >
      {/* Visual Slot - 65% height emphasis with zero broken images fallback */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] bg-zinc-950 overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => handleCarImageError(e, car.id)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle contrast gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#13151b] via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges & Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          {/* Unboxed Country / Heritage label */}
          <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10">
            {car.originLabel}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Compare Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(car);
              }}
              className={`p-1.5 rounded bg-black/60 backdrop-blur-md border border-white/10 transition-colors ${
                isCompared ? 'text-[#e5b869] border-[#e5b869]' : 'text-zinc-400 hover:text-white'
              }`}
              title={isCompared ? 'Quitar del comparador' : 'Añadir al comparador'}
              aria-label="Comparar vehículo"
            >
              {isCompared ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>

            {/* Favorite Wishlist Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(car);
              }}
              className={`p-1.5 rounded bg-black/60 backdrop-blur-md border border-white/10 transition-colors ${
                isFavorite ? 'text-[#e5b869] fill-[#e5b869]' : 'text-zinc-400 hover:text-white'
              }`}
              title={isFavorite ? 'Eliminar de favoritos' : 'Guardar en favoritos'}
              aria-label="Guardar en favoritos"
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-[#e5b869]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Content & Specifications */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Clean Unboxed Metadata Line with typographic separators */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <span>{car.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{car.year}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{car.mileage.toLocaleString()} km</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#e5b869] font-semibold text-[11px] inline-flex items-center gap-0.5">
              Historial Verificado
            </span>
          </div>

          <h3 className="mt-1.5 text-base font-semibold text-white group-hover:text-[#e5b869] transition-colors leading-snug font-display line-clamp-1">
            {car.name}
          </h3>

          <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {car.description}
          </p>

          {/* Performance Telemetry Strip */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-3 gap-2 text-center">
            <div className="bg-black/30 p-2 rounded border border-white/[0.04]">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Potencia</div>
              <div className="text-xs font-bold text-zinc-200 tabular-nums mt-0.5">
                {car.horsepower} CV
              </div>
            </div>

            <div className="bg-black/30 p-2 rounded border border-white/[0.04]">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">0-100 km/h</div>
              <div className="text-xs font-bold text-zinc-200 tabular-nums mt-0.5">
                {car.acceleration}s
              </div>
            </div>

            <div className="bg-black/30 p-2 rounded border border-white/[0.04]">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">V. Máx</div>
              <div className="text-xs font-bold text-zinc-200 tabular-nums mt-0.5">
                {car.topSpeed} km/h
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer: Price & Purchase Action */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Precio Oficial</div>
            <div className="text-lg font-bold font-display text-[#e5b869] tabular-nums">
              ${car.price.toLocaleString()} <span className="text-[10px] font-normal text-zinc-400">USD</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(car);
            }}
            type="button"
            className="px-3.5 py-2 text-xs font-semibold text-black bg-[#e5b869] hover:bg-[#d4a34b] active:scale-[0.98] transition-all rounded cursor-pointer whitespace-nowrap shadow-sm shadow-[#e5b869]/10"
          >
            Apartar ($1,500)
          </button>
        </div>
      </div>
    </article>
  );
};
