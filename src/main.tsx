import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker with Cache API persistence
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[PWA] Nueva versión disponible, actualizando en segundo plano...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[PWA] Elite Motors listo para funcionar 100% offline (Service Worker & Cache API activos).');
  },
});

// Suppress harmless Vite HMR WebSocket connection closures in iFrame sandbox per environment guidelines
function isBenignHmrError(str: unknown): boolean {
  if (!str) return false;
  const s = String(str).toLowerCase();
  return (
    s.includes('websocket') ||
    s.includes('without opened') ||
    s.includes('failed to connect to websocket') ||
    s.includes('vite-hmr') ||
    s.includes('vite:ws') ||
    (s.includes('[vite]') && (s.includes('websocket') || s.includes('connect') || s.includes('closed')))
  );
}

if (typeof window !== 'undefined') {
  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    try {
      const fullMsg = args.map((a: any) => (a?.stack || a?.message || String(a || ''))).join(' ');
      if (isBenignHmrError(fullMsg)) return;
    } catch (_) {}
    return origConsoleError.apply(console, args);
  };

  if (typeof window.onunhandledrejection === 'function') {
    const origHandler = window.onunhandledrejection;
    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.stack || event.reason?.message || String(event.reason || '');
      if (isBenignHmrError(msg)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
      return origHandler.call(window, event);
    };
  }

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const msg = event.reason?.stack || event.reason?.message || String(event.reason || '');
      if (isBenignHmrError(msg)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(<App />);
