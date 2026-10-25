import React from 'react';
import { X, Check, Gauge, Zap, Plus, ArrowRight } from 'lucide-react';
import { Car } from '../types';
import { handleCarImageError } from '../utils/carImages';

interface CarComparatorProps {
  allCars: Car[];
  comparedCars: Car[];
  onRemoveFromCompare: (carId: string) => void;
  onAddCarToCompare: (car: Car) => void;
  onSelectCar: (car: Car) => void;
  onBackToCollection?: () => void;
}

export const CarComparator: React.FC<CarComparatorProps> = ({
  allCars,
  comparedCars,
  onRemoveFromCompare,
  onAddCarToCompare,
  onSelectCar,
  onBackToCollection,
}) => {
  // Find min & max for proportional bars
  const maxHorsepower = Math.max(...allCars.map((c) => c.horsepower), 800);
  const maxSpeed = Math.max(...allCars.map((c) => c.topSpeed), 350);

  // Remaining cars that can be added
  const availableToAdd = allCars.filter(
    (c) => !comparedCars.some((comp) => comp.id === c.id)
  );

  return (
    <section id="comparator" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.08]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8">
        <div>
          <div className="text-xs font-semibold tracking-widest text-[#e5b869] uppercase mb-2">
            Telemetría Comparativa
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
            Comparador de Rendimiento
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-xl">
            Analiza especificaciones dinámicas frente a frente: potencia, curva de aceleración y arquitectura mecánica.
          </p>
        </div>

        {onBackToCollection && (
          <button
            onClick={onBackToCollection}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>← Volver al Inventario</span>
          </button>
        )}
      </div>

      {comparedCars.length === 0 ? (
        <div className="p-10 text-center bg-zinc-900/40 border border-white/[0.06] rounded-xl max-w-xl mx-auto">
          <p className="text-zinc-400 text-sm">
            No has seleccionado vehículos para comparar. Selecciona vehículos en la colección o agrega uno aquí abajo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {allCars.slice(0, 3).map((car) => (
              <button
                key={car.id}
                onClick={() => onAddCarToCompare(car)}
                className="px-3 py-1.5 text-xs bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded text-zinc-200 transition-colors cursor-pointer"
              >
                + Comparar {car.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="text-[11px] text-zinc-400 flex sm:hidden items-center gap-1.5 mb-2 px-1">
            <ArrowRight className="w-3.5 h-3.5 text-[#e5b869] animate-pulse" />
            <span>Desliza con el dedo horizontalmente para comparar los vehículos</span>
          </div>
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[700px] grid grid-cols-4 gap-4">
            {/* Metric Labels Column */}
            <div className="space-y-4 pt-48 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <div className="py-3 border-b border-white/[0.06]">Precio Oficial</div>
              <div className="py-3 border-b border-white/[0.06]">Potencia Máxima</div>
              <div className="py-3 border-b border-white/[0.06]">Aceleración (0-100)</div>
              <div className="py-3 border-b border-white/[0.06]">Velocidad Punta</div>
              <div className="py-3 border-b border-white/[0.06]">Par Motor</div>
              <div className="py-3 border-b border-white/[0.06]">Tracción / Eje</div>
              <div className="py-3 border-b border-white/[0.06]">Transmisión</div>
              <div className="py-3 border-b border-white/[0.06]">Año / Origen</div>
            </div>

            {/* Compared Car Columns */}
            {comparedCars.map((car) => {
              const hpPercent = Math.round((car.horsepower / maxHorsepower) * 100);
              const speedPercent = Math.round((car.topSpeed / maxSpeed) * 100);

              return (
                <div
                  key={car.id}
                  className="bg-[#12141a] border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between"
                >
                  {/* Top Vehicle Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold uppercase text-[#e5b869] tracking-wider">
                        {car.originLabel}
                      </span>
                      <button
                        onClick={() => onRemoveFromCompare(car.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Quitar del comparador"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="aspect-[16/10] bg-black rounded-lg overflow-hidden mb-3">
                      <img
                        src={car.image}
                        alt={car.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => handleCarImageError(e, car.id)}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="font-display font-bold text-sm text-white line-clamp-1">
                      {car.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{car.engine}</p>
                  </div>

                  {/* Metrics Table */}
                  <div className="space-y-4 pt-6 text-xs text-zinc-200">
                    {/* Price */}
                    <div className="py-3 border-b border-white/[0.06] font-display font-bold text-[#e5b869] text-base tabular-nums">
                      ${car.price.toLocaleString()} USD
                    </div>

                    {/* Horsepower */}
                    <div className="py-3 border-b border-white/[0.06]">
                      <div className="flex justify-between font-bold tabular-nums">
                        <span>{car.horsepower} CV</span>
                      </div>
                      <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-[#e5b869] h-full rounded-full transition-all duration-500"
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Acceleration */}
                    <div className="py-3 border-b border-white/[0.06] font-semibold tabular-nums">
                      {car.acceleration} segundos
                    </div>

                    {/* Top Speed */}
                    <div className="py-3 border-b border-white/[0.06]">
                      <div className="flex justify-between font-bold tabular-nums">
                        <span>{car.topSpeed} km/h</span>
                      </div>
                      <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-zinc-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${speedPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Torque */}
                    <div className="py-3 border-b border-white/[0.06] font-semibold tabular-nums">
                      {car.torque} Nm
                    </div>

                    {/* Drivetrain */}
                    <div className="py-3 border-b border-white/[0.06] font-semibold">
                      {car.drivetrain}
                    </div>

                    {/* Transmission */}
                    <div className="py-3 border-b border-white/[0.06] text-[11px] text-zinc-300 line-clamp-1">
                      {car.transmission}
                    </div>

                    {/* Year / Origin */}
                    <div className="py-3 border-b border-white/[0.06] text-[11px] text-zinc-400">
                      {car.year} · {car.originCountry}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-4">
                    <button
                      onClick={() => onSelectCar(car)}
                      className="w-full py-2 text-xs font-semibold text-center text-zinc-200 bg-white/[0.06] hover:bg-white/[0.12] rounded transition-colors cursor-pointer"
                    >
                      Ver Ficha Completa
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Slot to add another car if less than 3 */}
            {comparedCars.length < 3 && (
              <div className="border border-dashed border-white/15 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-zinc-950/40">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-[#e5b869] mb-3">
                  <Plus className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold uppercase text-zinc-300">
                  Agregar Vehículo
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1 mb-4">
                  Selecciona otro modelo para la comparativa directa
                </p>

                <select
                  onChange={(e) => {
                    const car = allCars.find((c) => c.id === e.target.value);
                    if (car) onAddCarToCompare(car);
                  }}
                  defaultValue=""
                  className="w-full text-xs bg-zinc-900 border border-white/10 rounded px-2.5 py-2 text-zinc-300 focus:outline-none focus:border-[#e5b869]"
                >
                  <option value="" disabled>
                    Elegir del inventario...
                  </option>
                  {availableToAdd.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.name} (${car.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </section>
  );
};
