import React from 'react';
import { MapPin, Phone, Mail, Clock, Shield, Globe, Award, Calendar, ArrowRight } from 'lucide-react';
import { DEALERSHIP_INFO } from '../data/cars';

interface ShowroomsSectionProps {
  onBookVisit: () => void;
}

export const ShowroomsSection: React.FC<ShowroomsSectionProps> = ({ onBookVisit }) => {
  return (
    <section id="showrooms-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="pb-8 border-b border-white/[0.08] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-widest text-[#e5b869] uppercase mb-1">
            Presencia Global & Custodia
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
            Nuestros Showrooms & Sedes Oficiales
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Espacios climatizados de alta seguridad diseñados para inspección visual, pruebas en circuito cerrado y entrega confidencial.
          </p>
        </div>

        <button
          onClick={onBookVisit}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded transition-all cursor-pointer self-start md:self-auto shadow-md shadow-[#e5b869]/20"
        >
          <Calendar className="w-4 h-4" />
          <span>Agendar Visita VIP</span>
        </button>
      </div>

      {/* Showroom Cards Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEALERSHIP_INFO.locations.map((loc, idx) => (
          <div
            key={loc.city}
            className="bg-[#12141a] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#e5b869]/40 transition-colors"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#e5b869]">
                  Showroom 0{idx + 1}
                </span>
                <span className="text-[10px] text-zinc-400 bg-white/[0.06] px-2 py-0.5 rounded border border-white/10">
                  Cámara Climatizada
                </span>
              </div>

              <h3 className="text-2xl font-bold font-display text-white">
                Sede {loc.city}
              </h3>

              <div className="mt-4 space-y-3 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#e5b869] shrink-0 mt-0.5" />
                  <span>{loc.address}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>{loc.phone}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Lunes a Sábado · 09:00 - 20:00 h (Cita previa)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/80 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">Pista privada anexa</span>
              <button
                onClick={onBookVisit}
                className="text-xs text-[#e5b869] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Solicitar cita</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Global Standards Banner */}
      <div className="mt-12 p-8 bg-zinc-900/60 border border-white/[0.08] rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4">
          <Globe className="w-8 h-8 text-[#e5b869] shrink-0" />
          <div>
            <h4 className="font-semibold text-white text-sm">Transporte Global Cerrado</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Transporte en remolque cerrado climatizado o flete aéreo charter con seguro a todo riesgo con cobertura de valor total garantizado.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-[#e5b869] shrink-0" />
          <div>
            <h4 className="font-semibold text-white text-sm">Custodia & Homologación</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Gestión integral de matriculación, ITV en España, Title en USA, y exportación JEVIC en Japón sin intermediarios externos.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Award className="w-8 h-8 text-[#e5b869] shrink-0" />
          <div>
            <h4 className="font-semibold text-white text-sm">Garantía Mecánica Elite 24M</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Respaldo total de motor y transmisión en talleres certificados oficiales para cualquier unidad de nuestro catálogo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
