import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Shield } from 'lucide-react';
import { Car } from '../types';
import { DEALERSHIP_INFO } from '../data/cars';

interface TestDriveModalProps {
  isOpen: boolean;
  car: Car | null;
  onClose: () => void;
}

export const TestDriveModal: React.FC<TestDriveModalProps> = ({
  isOpen,
  car,
  onClose,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00');
  const [location, setLocation] = useState(DEALERSHIP_INFO.locations[0].city);
  const [deliveryType, setDeliveryType] = useState<'showroom' | 'private-track'>('showroom');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      {/* Floating Viewport-Level Close Button */}
      <button
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] flex items-center gap-1.5 px-3 py-2 bg-[#12141a]/95 hover:bg-[#e5b869] text-white hover:text-black border border-white/20 hover:border-[#e5b869] rounded-xl shadow-2xl backdrop-blur-md transition-all cursor-pointer group"
        title="Cerrar (Esc)"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#e5b869] group-hover:text-black transition-transform group-hover:rotate-90 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider font-sans">
          Cerrar
        </span>
        <span className="text-[10px] text-zinc-400 group-hover:text-black/70 font-mono hidden sm:inline">
          (Esc)
        </span>
      </button>

      <div
        className="relative w-full max-w-lg bg-[#12141a] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#e5b869]">
              Cita Confirmada
            </div>
            <h2 className="text-2xl font-bold font-display text-white mt-1">
              Prueba de Manejo Programada
            </h2>
            <p className="mt-2 text-xs text-zinc-300 max-w-sm mx-auto">
              Te esperamos el <strong className="text-white">{date || 'próximo día hábil'}</strong> a las{' '}
              <strong className="text-white">{time}</strong> en nuestro showroom de{' '}
              <strong className="text-white">{location}</strong>.
            </p>
            <div className="mt-6">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-semibold text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs font-semibold tracking-wider text-[#e5b869] uppercase mb-1">
              Servicio VIP Concierge
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              Agendar Visita & Prueba Dinámica
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              {car ? (
                <>Prueba personalizada para el <strong className="text-zinc-200">{car.name}</strong>.</>
              ) : (
                'Acceso exclusivo a nuestro showroom privado con un especialista de producto.'
              )}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre y apellidos"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Fecha Deseada</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Hora</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                  >
                    <option value="10:00">10:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Sede de la Experiencia</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                >
                  {DEALERSHIP_INFO.locations.map((loc) => (
                    <option key={loc.city} value={loc.city}>
                      Showroom {loc.city} ({loc.address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-white/[0.04] border border-white/10 rounded-lg flex items-center gap-2 text-zinc-400">
                <Shield className="w-4 h-4 text-[#e5b869] shrink-0" />
                <span>Requiere permiso de conducir vigente para pruebas en vía pública o pista.</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-black bg-[#e5b869] hover:bg-[#d4a34b] active:scale-[0.98] rounded cursor-pointer transition-all shadow-md shadow-[#e5b869]/20"
                >
                  Confirmar Reserva VIP
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
