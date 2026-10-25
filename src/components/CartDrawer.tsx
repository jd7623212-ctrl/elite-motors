import React, { useEffect } from 'react';
import { X, Trash2, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';
import { handleCarImageError } from '../utils/carImages';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onRemoveItem: (carId: string) => void;
  onProceedToCheckout: () => void;
  onExploreCars: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cartItems,
  onClose,
  onRemoveItem,
  onProceedToCheckout,
  onExploreCars,
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

  const totalDeposit = cartItems.reduce((acc, item) => acc + item.depositAmount, 0);
  const totalVehiclesValue = cartItems.reduce((acc, item) => acc + item.car.price, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111319] border-l border-white/10 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#e5b869]" />
              <h2 className="text-lg font-bold font-display text-white">
                Bolsa de Apartados & Reservas
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] text-zinc-500 mx-auto flex items-center justify-center mb-3">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="text-zinc-400 text-sm">No tienes vehículos reservados.</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Aparta el coche de tus sueños con señal reembolsable.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onExploreCars();
                  }}
                  className="mt-6 px-4 py-2 text-xs font-semibold text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.car.id}
                  className="p-4 bg-zinc-900/80 border border-white/[0.06] rounded-lg flex gap-4 items-start"
                >
                  <img
                    src={item.car.image}
                    alt={item.car.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleCarImageError(e, item.car.id)}
                    className="w-20 h-16 object-cover rounded bg-black shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold font-display text-white truncate">
                      {item.car.name}
                    </h3>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      VIN: {item.car.vin}
                    </div>
                    <div className="text-xs text-[#e5b869] font-bold mt-1 tabular-nums">
                      ${item.car.price.toLocaleString()} USD
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      Depósito de apartado: <span className="text-zinc-300 font-semibold">${item.depositAmount.toLocaleString()} USD</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.car.id)}
                    className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                    title="Eliminar de la reserva"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/[0.08] bg-zinc-950/60 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Valor total de unidades:</span>
                  <span className="font-semibold text-zinc-200 tabular-nums">
                    ${totalVehiclesValue.toLocaleString()} USD
                  </span>
                </div>
                <div className="flex justify-between text-zinc-300 text-sm font-semibold">
                  <span>Depósito de Reserva Requerido:</span>
                  <span className="text-[#e5b869] font-bold text-base tabular-nums">
                    ${totalDeposit.toLocaleString()} USD
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-white/[0.04] border border-white/10 flex items-start gap-2 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-[#e5b869] shrink-0 mt-0.5" />
                <span>
                  Depósito 100% reembolsable durante 7 días. Bloquea el VIN inmediatamente en nuestro inventario global.
                </span>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-black bg-[#e5b869] hover:bg-[#d4a34b] active:scale-[0.98] rounded cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#e5b869]/20"
              >
                <span>Proceder al Apartado</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
