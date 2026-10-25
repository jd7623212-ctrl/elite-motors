import React from 'react';
import { ChevronRight, ShieldCheck, Globe, Percent, Award } from 'lucide-react';
const heroShowroomImg = '/images/hero_hypercar_showroom_1791565534002.jpg';

interface HeroProps {
  onExploreClick: () => void;
  onFinancingClick: () => void;
  onTestDriveClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onFinancingClick,
  onTestDriveClick,
}) => {
  return (
    <section id="hero" className="relative pt-6 pb-16 md:pt-10 md:pb-24 overflow-hidden border-b border-white/[0.06]">
      {/* Background Image Scrim Container */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroShowroomImg}
          alt="Showroom de Elite Motors"
          onError={(e) => {
            e.currentTarget.src = '/images/hero_hypercar_showroom_1791565534002.jpg';
          }}
          className="w-full h-full object-cover object-center brightness-[0.38] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0d] via-[#090a0d]/60 to-[#090a0d]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090a0d] via-transparent to-[#090a0d]/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header Block */}
        <div className="max-w-3xl pt-8 pb-12 sm:pt-14 sm:pb-16">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#e5b869] uppercase mb-4">
            <span>Concesionario Boutique Internacional</span>
            <span aria-hidden="true">·</span>
            <span>Madrid · Miami · Tokio</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight leading-[1.08] [text-wrap:balance]">
            Excelencia Automotriz Sin Concesiones
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl font-light">
            Seleccionamos y certificamos las piezas más codiciadas de la historia del motor:
            leyendas del mercado japonés JDM, muscle cars americanos de pura potencia,
            precisión alemana y el temperamento de los superdeportivos italianos.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-black bg-[#e5b869] hover:bg-[#d4a34b] active:scale-[0.98] transition-all rounded cursor-pointer shadow-lg shadow-[#e5b869]/20"
            >
              <span>Explorar Inventario</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onFinancingClick}
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 transition-all rounded cursor-pointer backdrop-blur-sm"
            >
              Financiación
            </button>

            <button
              onClick={onTestDriveClick}
              className="inline-flex items-center justify-center px-4 py-3.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              Agendar Visita VIP
            </button>
          </div>
        </div>

        {/* 4-Column KPI Trust Strip below hero split */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-10 border-t border-white/[0.08]">
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-white/[0.06] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#e5b869] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white uppercase tracking-wider">150 Puntos</div>
                <div className="text-xs text-zinc-400 mt-0.5">Certificación Mecánica Integral</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-900/60 border border-white/[0.06] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-[#e5b869] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white uppercase tracking-wider">Transporte Cerrado</div>
                <div className="text-xs text-zinc-400 mt-0.5">Entrega Puerta a Puerta Segura</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-900/60 border border-white/[0.06] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Percent className="w-5 h-5 text-[#e5b869] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white uppercase tracking-wider">Financiación 4.9%</div>
                <div className="text-xs text-zinc-400 mt-0.5">Aprobación Inmediata Sin Fricción</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-900/60 border border-white/[0.06] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-[#e5b869] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white uppercase tracking-wider">24 Meses Garantía</div>
                <div className="text-xs text-zinc-400 mt-0.5">Cobertura de Tren Motriz Oficial</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
