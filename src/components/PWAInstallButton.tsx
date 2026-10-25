import React, { useState } from 'react';
import { Download, Sparkles, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed, don't show the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 3000);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e5b869]/15 hover:bg-[#e5b869] text-[#e5b869] hover:text-black border border-[#e5b869]/40 hover:border-[#e5b869] rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer group shrink-0"
          title="Instalar Elite Motors como aplicación nativa"
          aria-label="Instalar Aplicación"
        >
          {justInstalled ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black" />
              <span>¡Instalado!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-[#e5b869] group-hover:text-black transition-transform group-hover:translate-y-0.5" />
              <span className="hidden sm:inline">Instalar App</span>
              <span className="sm:hidden">App</span>
            </>
          )}
        </button>
      </>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.06] hover:bg-[#e5b869]/20 text-zinc-300 hover:text-[#e5b869] border border-white/10 hover:border-[#e5b869]/40 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
          title="Instalar en iPhone o iPad"
          aria-label="Instalar en iOS"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#e5b869]" />
          <span className="hidden sm:inline">Instalar App</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-[#12141a] border border-[#e5b869]/40 p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#e5b869]/15 border border-[#e5b869]/30 flex items-center justify-center text-[#e5b869]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white">Instalar en iPhone / iPad</h3>
                  <p className="text-[11px] text-[#e5b869]">Acceso sin conexión y pantalla completa</p>
                </div>
              </div>

              <div className="mt-3 space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                  <span className="font-bold text-[#e5b869] font-mono">1.</span>
                  <span>Toca el botón <strong>Compartir</strong> (<span className="text-[#e5b869]">⎋</span> cuadrado con flecha hacia arriba) en la barra de Safari.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                  <span className="font-bold text-[#e5b869] font-mono">2.</span>
                  <span>Desplázate hacia abajo y selecciona <strong>"Agregar a pantalla de inicio"</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                  <span className="font-bold text-[#e5b869] font-mono">3.</span>
                  <span>Confirma pulsando <strong>"Agregar"</strong> en la esquina superior derecha.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2 bg-[#e5b869] hover:bg-[#d4a34b] text-black rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#e5b869]/20"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
