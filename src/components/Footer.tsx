import React from 'react';
import { Phone, Mail, MapPin, Shield, Award, Clock, Download } from 'lucide-react';
import { DEALERSHIP_INFO } from '../data/cars';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onScrollTo: (id: string) => void;
  onOpenDownloadFiles?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollTo, onOpenDownloadFiles }) => {
  return (
    <footer id="guarantee" className="bg-[#07080a] border-t border-white/[0.08] text-zinc-400 text-xs">
      {/* Top Value Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-white/[0.06]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#e5b869]/10 text-[#e5b869] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Garantía Mecánica Elite 24M</h4>
              <p className="mt-1 leading-relaxed text-zinc-400">
                Cobertura completa de motor, transmisión y electrónica sin límite de kilometraje en talleres oficiales autorizados.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#e5b869]/10 text-[#e5b869] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Certificación 150 Puntos</h4>
              <p className="mt-1 leading-relaxed text-zinc-400">
                Verificación de compresión de cilindros, chasis no siniestrado, telemetría y autenticidad de número de bastidor VIN.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#e5b869]/10 text-[#e5b869] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Prueba VIP de 14 Días</h4>
              <p className="mt-1 leading-relaxed text-zinc-400">
                Si el vehículo no supera tus estándares de perfección dinámica, garantizamos recompra o cambio sin comisiones ocultas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Showrooms */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Brand identity column */}
        <div className="lg:col-span-2 space-y-4">
          <BrandLogo size="lg" />
          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
            Concesionario boutique internacional especializado en adquisición, custodia y exportación de deportivos JDM legendarios, muscle cars americanos y superdeportivos europeos e italianos.
          </p>
          <div className="pt-2 text-[11px] text-zinc-500 space-y-1">
            <p>Atención Concierge: {DEALERSHIP_INFO.phone}</p>
            <p>Email: {DEALERSHIP_INFO.email}</p>
          </div>
        </div>

        {/* Showrooms locations */}
        <div className="space-y-3">
          <h5 className="font-semibold uppercase tracking-wider text-white text-xs">
            Nuestros Showrooms
          </h5>
          <ul className="space-y-2 text-xs">
            {DEALERSHIP_INFO.locations.map((loc) => (
              <li key={loc.city}>
                <span className="font-semibold text-zinc-200">{loc.city}:</span>
                <span className="block text-zinc-400 text-[11px]">{loc.address}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Nav links */}
        <div className="space-y-3">
          <h5 className="font-semibold uppercase tracking-wider text-white text-xs">
            Navegación
          </h5>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onScrollTo('collection')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Colección Completa
              </button>
            </li>
            <li>
              <button
                onClick={() => onScrollTo('comparator')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Comparador Dinámico
              </button>
            </li>
            <li>
              <button
                onClick={() => onScrollTo('financing')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Financiación
              </button>
            </li>
            <li>
              <button
                onClick={() => onScrollTo('invoicing')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Centro de Facturación & Mis Compras
              </button>
            </li>
            <li>
              <button
                onClick={() => onScrollTo('showrooms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Showrooms & Sedes Globales
              </button>
            </li>
            {onOpenDownloadFiles && (
              <li>
                <button
                  onClick={onOpenDownloadFiles}
                  className="text-[#e5b869] hover:text-[#d4a34b] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Proyecto (.ZIP)</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Legal & Service */}
        <div className="space-y-3">
          <h5 className="font-semibold uppercase tracking-wider text-white text-xs">
            Servicios VIP
          </h5>
          <ul className="space-y-2 text-[11px]">
            <li className="text-zinc-400">Transporte Marítimo & Aéreo Cerrado</li>
            <li className="text-zinc-400">Homologación ITV / EPA / TÜV</li>
            <li className="text-zinc-400">Servicio de Fideicomiso Escrow</li>
            <li className="text-zinc-400">Custodia en Cámara Climatizada</li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
        <p>© {new Date().getFullYear()} Elite Motors Luxury Group. Todos los derechos reservados.</p>
        <p>Precios expresados en USD netos. Sujetos a aranceles locales de matriculación según país de destino.</p>
      </div>
    </footer>
  );
};
