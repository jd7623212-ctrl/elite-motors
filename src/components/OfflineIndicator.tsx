import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#141720]/95 border border-[#e5b869]/50 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
        <WifiOff className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white">Modo Sin Conexión Activo</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <span className="text-[10px] text-zinc-300 flex items-center gap-1">
          <ShieldCheck className="w-2.5 h-2.5 text-[#e5b869]" />
          Cargando imágenes y catálogo desde Cache API & Service Worker.
        </span>
      </div>
    </div>
  );
};
