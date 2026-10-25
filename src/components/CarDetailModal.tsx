import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  ArrowRight,
  Gauge,
  Clock,
  UserCheck,
  AlertCircle,
  FileCheck2,
  Download,
  Building2,
  History,
  Check
} from 'lucide-react';
import { Car } from '../types';
import { getCarHistory } from '../data/vehicleHistory';
import { handleCarImageError } from '../utils/carImages';

interface CarDetailModalProps {
  car: Car | null;
  onClose: () => void;
  onAddToCart: (car: Car) => void;
  onBookTestDrive: (car: Car) => void;
  onCalculateFinancing: (car: Car) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  onClose,
  onAddToCart,
  onBookTestDrive,
  onCalculateFinancing,
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'history'>('specs');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (car) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [car]);

  if (!car) return null;

  const history = getCarHistory(car);

  const handleDownloadCarfax = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Floating Screen-Level Close Button - Always visible on screen in viewport */}
      <button
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] flex items-center gap-1.5 px-3 py-2 bg-[#12141a]/95 hover:bg-[#e5b869] text-white hover:text-black border border-white/20 hover:border-[#e5b869] rounded-xl shadow-2xl backdrop-blur-md transition-all cursor-pointer group"
        title="Cerrar ficha técnica (Esc)"
        aria-label="Cerrar ficha técnica"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#e5b869] group-hover:text-black transition-transform group-hover:rotate-90 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider font-sans">
          Cerrar
        </span>
        <span className="text-[10px] text-zinc-400 group-hover:text-black/70 font-mono hidden sm:inline">
          (Esc)
        </span>
      </button>

      {/* Modal Dialog Card constrained to screen height */}
      <div
        className="relative w-full max-w-4xl bg-[#12141a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Pinned Header with Car Info and Close Button */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3 bg-[#0d0f14]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#e5b869]/15 text-[#e5b869] border border-[#e5b869]/30 shrink-0">
              {car.originLabel}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white font-display truncate">
              {car.name}
            </h3>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-block text-xs font-mono text-[#e5b869] font-bold tabular-nums">
              ${car.price.toLocaleString()} USD
            </span>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 rounded-lg transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4 text-[#e5b869]" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Visual Slot */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-zinc-950 overflow-hidden">
            <img
              src={car.image}
              alt={car.name}
              referrerPolicy="no-referrer"
              onError={(e) => handleCarImageError(e, car.id)}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-transparent to-black/40" />

            <div className="absolute top-4 left-6 z-10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-zinc-300 bg-black/70 backdrop-blur-md px-3 py-1 rounded border border-white/10">
                {car.originLabel} · {car.originCountry}
              </span>

              {/* Verified History Top Badge */}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e5b869] bg-black/75 backdrop-blur-md px-3 py-1 rounded border border-[#e5b869]/40">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e5b869]" />
                <span>Historial 100% Verificado</span>
              </span>
            </div>
          </div>


          <div className="absolute top-4 left-6 z-10 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-300 bg-black/70 backdrop-blur-md px-3 py-1 rounded border border-white/10">
              {car.originLabel} · {car.originCountry}
            </span>

            {/* Verified History Top Badge */}
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e5b869] bg-black/75 backdrop-blur-md px-3 py-1 rounded border border-[#e5b869]/40">
              <ShieldCheck className="w-3.5 h-3.5 text-[#e5b869]" />
              <span>Historial 100% Verificado</span>
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {/* Header Title & Pricing */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <span>{car.brand}</span>
                <span aria-hidden="true">·</span>
                <span>Año {car.year}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{car.mileage.toLocaleString()} km verificados</span>
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold font-display text-white">
                {car.name}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-400">
                <span className="font-mono text-zinc-500">VIN: {car.vin}</span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 0 Accidentes Reportados
                </span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span className="text-zinc-300">
                  {history.ownersCount === 1 ? '1 Único Dueño' : `${history.ownersCount} Propietarios`}
                </span>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Precio de Contado</div>
              <div className="text-3xl font-bold font-display text-[#e5b869] tabular-nums">
                ${car.price.toLocaleString()} <span className="text-xs font-normal text-zinc-400">USD</span>
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                O desde <span className="text-zinc-200 font-semibold tabular-nums">${Math.round(car.price / 48)}/mes</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation Controls (Segmented Tabs) */}
          <div className="mt-6 flex items-center gap-2 border-b border-white/[0.08] pb-4">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Ficha Técnica & Motor
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#e5b869] text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-[#e5b869] hover:bg-white/[0.04]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Historial Verificado & Mantenimiento</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-black/20 rounded font-mono font-bold">
                {history.records.length} Registros
              </span>
            </button>
          </div>

          {/* TAB 1: Specs View */}
          {activeTab === 'specs' && (
            <div className="animate-in fade-in duration-150">
              {/* Core Specs Grid */}
              <div className="py-6 border-b border-white/[0.08]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e5b869] mb-4">
                  Ficha Técnica de Homologación
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 bg-zinc-900/60 rounded border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-500 block">Potencia</span>
                    <span className="font-semibold text-zinc-200 tabular-nums">{car.horsepower} CV / HP</span>
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-500 block">Aceleración 0-100</span>
                    <span className="font-semibold text-zinc-200 tabular-nums">{car.acceleration} segundos</span>
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-500 block">Velocidad Máxima</span>
                    <span className="font-semibold text-zinc-200 tabular-nums">{car.topSpeed} km/h</span>
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-500 block">Par Motor</span>
                    <span className="font-semibold text-zinc-200 tabular-nums">{car.torque} Nm</span>
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-500 block">Arquitectura Motor</span>
                    <span className="font-semibold text-zinc-200 text-xs line-clamp-1">{car.engine}</span>
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-500 block">Transmisión</span>
                    <span className="font-semibold text-zinc-200 text-xs line-clamp-1">{car.transmission}</span>
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-500 block">Tracción</span>
                    <span className="font-semibold text-zinc-200">{car.drivetrain}</span>
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-500 block">Color Exterior</span>
                    <span className="font-semibold text-zinc-200 text-xs line-clamp-1">{car.exteriorColor}</span>
                  </div>
                </div>
              </div>

              {/* Description & Curated Highlights */}
              <div className="py-6 border-b border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                    Descripción & Proveniencia
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {car.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                    Puntos Notables Certificados
                  </h3>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    {car.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#e5b869] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Verified History & Maintenance Section */}
          {activeTab === 'history' && (
            <div className="py-6 border-b border-white/[0.08] space-y-6 animate-in fade-in duration-150">
              {/* Provenance & Ownership Overview (4 high-trust metric cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-zinc-900/80 rounded-lg border border-white/[0.08] flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-[#e5b869] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Titularidad</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {history.ownersCount === 1 ? '1 Único Dueño' : `${history.ownersCount} Propietarios`}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Custodia privada documentada</div>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-900/80 rounded-lg border border-white/[0.08] flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Siniestralidad</div>
                    <div className="text-sm font-bold text-white mt-0.5">0 Accidentes</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Estructura y chasis al 100%</div>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-900/80 rounded-lg border border-white/[0.08] flex items-start gap-3">
                  <FileCheck2 className="w-5 h-5 text-[#e5b869] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Libro de Servicio</div>
                    <div className="text-sm font-bold text-white mt-0.5">Sellado Oficial</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Facturas y sellos verificados</div>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-900/80 rounded-lg border border-white/[0.08] flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#e5b869] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Estado Legal</div>
                    <div className="text-sm font-bold text-white mt-0.5">Título Limpio</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{history.titleStatus}</div>
                  </div>
                </div>
              </div>

              {/* Maintenance Records Chronological Timeline */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e5b869]">
                      Historial Cronológico de Mantenimiento & Certificaciones
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Verificación cruzada con bases de datos de concesionarios oficiales e informe Carfax ({history.carfaxVerifiedDate}).
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadCarfax}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded cursor-pointer transition-all self-start sm:self-auto"
                    title="Descargar informe de historial Carfax verificado"
                  >
                    {downloadSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Informe Generado</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-[#e5b869]" />
                        <span>Descargar Dossier Carfax (PDF)</span>
                      </>
                    )}
                  </button>
                </div>

                {downloadSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs flex items-center gap-2 mb-4 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Dossier oficial de verificación VIN ({car.vin}) emitido con éxito. Sellos Carfax y Elite Motors adjuntos.</span>
                  </div>
                )}

                <div className="space-y-3">
                  {history.records.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 bg-zinc-900/60 rounded-lg border border-white/[0.06] hover:border-white/15 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#e5b869]" />
                          <h4 className="text-xs font-bold text-white font-display">
                            {rec.serviceType}
                          </h4>
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            Verificado
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            {rec.date}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-zinc-300 font-semibold tabular-nums">
                            {rec.mileage.toLocaleString()} km
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-start gap-2 text-xs">
                        <Building2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-zinc-300">{rec.facility}</div>
                          <p className="mt-1 text-zinc-400 leading-relaxed text-[11px]">
                            {rec.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-[#e5b869]" />
              <span>Garantía oficial de 24 meses y transporte blindado</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 rounded cursor-pointer transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5 text-[#e5b869]" />
                <span>Volver al Catálogo</span>
              </button>

              <button
                onClick={() => {
                  onCalculateFinancing(car);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-zinc-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded cursor-pointer transition-colors text-center"
              >
                Calcular Préstamo
              </button>

              <button
                onClick={() => {
                  onBookTestDrive(car);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded cursor-pointer transition-colors text-center"
              >
                Agendar Prueba VIP
              </button>

              <button
                onClick={() => {
                  onAddToCart(car);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-black bg-[#e5b869] hover:bg-[#d4a34b] active:scale-[0.98] rounded cursor-pointer transition-all shadow-md shadow-[#e5b869]/20 text-center"
              >
                Apartar ($1,500 USD)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
