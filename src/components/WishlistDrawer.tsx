import React, { useEffect } from 'react';
import { X, Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { Car } from '../types';
import { handleCarImageError } from '../utils/carImages';

interface WishlistDrawerProps {
  isOpen: boolean;
  wishlistCars: Car[];
  onClose: () => void;
  onRemoveFavorite: (car: Car) => void;
  onSelectCar: (car: Car) => void;
  onAddToCart: (car: Car) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  wishlistCars,
  onClose,
  onRemoveFavorite,
  onSelectCar,
  onAddToCart,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111319] border-l border-white/10 shadow-2xl flex flex-col justify-between">
          
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-5 h-5 text-[#e5b869]" />
              <h2 className="text-lg font-bold font-display text-white">
                Vehículos Guardados
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {wishlistCars.length === 0 ? (
              <div className="text-center py-16">
                <Bookmark className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">No has guardado vehículos aún.</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Guarda tus modelos preferidos para seguir su disponibilidad.
                </p>
              </div>
            ) : (
              wishlistCars.map((car) => (
                <div
                  key={car.id}
                  className="p-4 bg-zinc-900/80 border border-white/[0.06] rounded-lg space-y-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={car.image}
                      alt={car.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleCarImageError(e, car.id)}
                      className="w-20 h-16 object-cover rounded bg-black shrink-0 cursor-pointer"
                      onClick={() => {
                        onSelectCar(car);
                        onClose();
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3
                          onClick={() => {
                            onSelectCar(car);
                            onClose();
                          }}
                          className="text-xs font-bold font-display text-white truncate cursor-pointer hover:text-[#e5b869]"
                        >
                          {car.name}
                        </h3>
                        <button
                          onClick={() => onRemoveFavorite(car)}
                          className="text-zinc-500 hover:text-red-400 p-0.5 cursor-pointer ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs text-[#e5b869] font-bold mt-1 tabular-nums">
                        ${car.price.toLocaleString()} USD
                      </div>

                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {car.horsepower} CV · {car.topSpeed} km/h
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                    <button
                      onClick={() => {
                        onSelectCar(car);
                        onClose();
                      }}
                      className="flex-1 py-1.5 text-xs text-zinc-300 bg-white/[0.06] hover:bg-white/[0.12] rounded cursor-pointer transition-colors"
                    >
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => {
                        onAddToCart(car);
                        onClose();
                      }}
                      className="flex-1 py-1.5 text-xs font-semibold text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded cursor-pointer transition-colors"
                    >
                      Apartar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/[0.08] bg-zinc-950/60">
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
