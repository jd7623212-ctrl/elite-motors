import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileCode,
  FileText,
  Database,
  Check,
  Copy,
  FolderArchive,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Invoice } from './InvoicingSection';
import { BrandLogo } from './BrandLogo';
import {
  downloadProjectZip,
  triggerFileDownload,
  getHtmlExport,
  getCssExport,
  getJsExport,
  getStandaloneSingleHtmlExport,
  getDatabaseJsonExport,
  getDatabaseSqlExport
} from '../utils/fileExporters';

interface DownloadFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
}

type TabType = 'html' | 'standalone' | 'css' | 'js' | 'dbJson' | 'dbSql';

export const DownloadFilesModal: React.FC<DownloadFilesModalProps> = ({
  isOpen,
  onClose,
  invoices,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('html');
  const [downloadedFiles, setDownloadedFiles] = useState<Record<string, boolean>>({});
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipStatusText, setZipStatusText] = useState('Generando ZIP...');
  const [zipDownloaded, setZipDownloaded] = useState(false);

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

  const handleDownloadSingle = (
    filename: string,
    content: string,
    mimeType: string,
    key: string
  ) => {
    triggerFileDownload(filename, content, mimeType);
    setDownloadedFiles((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setDownloadedFiles((prev) => ({ ...prev, [key]: false }));
    }, 2500);
  };

  const handleDownloadZip = async () => {
    try {
      setIsGeneratingZip(true);
      setZipStatusText('Preparando 45 fotografías y código...');
      await downloadProjectZip(
        invoices,
        'EliteMotors-Proyecto-Completo.zip',
        (status) => setZipStatusText(status)
      );
      setIsGeneratingZip(false);
      setZipDownloaded(true);
      setTimeout(() => {
        setZipDownloaded(false);
      }, 3500);
    } catch (err) {
      console.error('Error generating zip:', err);
      setIsGeneratingZip(false);
    }
  };

  const handleDownloadAll = () => {
    handleDownloadZip();
  };

  const getActiveCode = (): { filename: string; code: string; type: string } => {
    switch (activeTab) {
      case 'html':
        return { filename: 'index.html', code: getHtmlExport(), type: 'text/html' };
      case 'standalone':
        return {
          filename: 'index-standalone.html',
          code: getStandaloneSingleHtmlExport(),
          type: 'text/html',
        };
      case 'css':
        return { filename: 'styles.css', code: getCssExport(), type: 'text/css' };
      case 'js':
        return { filename: 'app.js', code: getJsExport(), type: 'application/javascript' };
      case 'dbJson':
        return {
          filename: 'database.json',
          code: getDatabaseJsonExport(invoices),
          type: 'application/json',
        };
      case 'dbSql':
        return {
          filename: 'database.sql',
          code: getDatabaseSqlExport(invoices),
          type: 'application/sql',
        };
    }
  };

  const currentFileData = getActiveCode();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFileData.code);
    setCopiedTab(activeTab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
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
        className="bg-[#101217] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/[0.08] flex items-start justify-between gap-4 bg-zinc-950/60 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BrandLogo size="sm" showSubtitle={false} />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#e5b869] bg-[#e5b869]/10 px-2 py-0.5 rounded border border-[#e5b869]/20 font-mono">
                Source Export v2.0
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              Descargar Archivos del Proyecto & Base de Datos
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Descarga directa en tu ordenador: todos los archivos reunidos en un único paquete comprimido <span className="text-[#e5b869] font-mono font-medium">.ZIP</span> o de forma individual para inspección de código.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Download Cards Grid */}
        <div className="p-5 sm:p-6 bg-[#0c0e12] border-b border-white/[0.06] space-y-4">
          {/* Unified ZIP Hero Banner */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#171922] via-[#1a1d26] to-[#13151b] border border-[#e5b869]/30 shadow-lg shadow-black/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-lg bg-[#e5b869]/15 border border-[#e5b869]/30 flex items-center justify-center shrink-0 text-[#e5b869]">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-white font-display">
                    Descarga Unificada en un Solo ZIP (.zip)
                  </h4>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                  Todo lo implementado y actualizado reunido en un único paquete: buscador inteligente de inventario, gráfico de precios, 44 superdeportivos con fotos y valores lógicos, módulo de Financiación, facturación VIP, bases de datos JSON/SQL, reglas Firestore y código fuente React en <span className="text-zinc-200 font-mono">src/</span>.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isGeneratingZip}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-black bg-[#e5b869] hover:bg-[#d4a34b] active:scale-[0.98] rounded-xl transition-all shadow-lg shadow-[#e5b869]/25 cursor-pointer shrink-0 disabled:opacity-60"
            >
              {isGeneratingZip ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{zipStatusText}</span>
                </>
              ) : zipDownloaded ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>¡ZIP Descargado con Éxito!</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-4 h-4 text-black" />
                  <span>Descargar Todo en un Solo ZIP</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#e5b869]" />
              <span>O Descargar Archivos Individuales (Opcional):</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* HTML */}
            <div className="p-3 bg-zinc-900/70 border border-white/[0.06] rounded-xl flex flex-col justify-between hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <FileCode className="w-4 h-4" />
                <span className="text-xs font-bold font-mono">index.html</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">Estructura & Ficha</p>
              <button
                onClick={() =>
                  handleDownloadSingle('index.html', getHtmlExport(), 'text/html', 'html')
                }
                className="w-full py-1.5 px-2 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {downloadedFiles.html ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-[#e5b869]" />}
                <span>{downloadedFiles.html ? 'Descargado' : 'Descargar'}</span>
              </button>
            </div>

            {/* Standalone All-In-One HTML */}
            <div className="p-3 bg-zinc-900/70 border border-[#e5b869]/30 rounded-xl flex flex-col justify-between hover:border-[#e5b869]/60 transition-all bg-gradient-to-b from-[#181a22] to-zinc-900/80">
              <div className="flex items-center gap-2 text-[#e5b869] mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold font-mono">index-solo.html</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-medium mb-3">Web Todo-en-Uno</p>
              <button
                onClick={() =>
                  handleDownloadSingle(
                    'index-standalone.html',
                    getStandaloneSingleHtmlExport(),
                    'text/html',
                    'standalone'
                  )
                }
                className="w-full py-1.5 px-2 bg-[#e5b869]/20 hover:bg-[#e5b869]/30 text-xs font-bold text-[#e5b869] rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#e5b869]/40"
              >
                {downloadedFiles.standalone ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-[#e5b869]" />}
                <span>{downloadedFiles.standalone ? 'Descargado' : 'Descargar'}</span>
              </button>
            </div>

            {/* CSS */}
            <div className="p-3 bg-zinc-900/70 border border-white/[0.06] rounded-xl flex flex-col justify-between hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-sky-400 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold font-mono">styles.css</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">Tema Dark Luxury</p>
              <button
                onClick={() =>
                  handleDownloadSingle('styles.css', getCssExport(), 'text/css', 'css')
                }
                className="w-full py-1.5 px-2 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {downloadedFiles.css ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-[#e5b869]" />}
                <span>{downloadedFiles.css ? 'Descargado' : 'Descargar'}</span>
              </button>
            </div>

            {/* JS */}
            <div className="p-3 bg-zinc-900/70 border border-white/[0.06] rounded-xl flex flex-col justify-between hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <FileCode className="w-4 h-4" />
                <span className="text-xs font-bold font-mono">app.js</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">Motor & Concierge</p>
              <button
                onClick={() =>
                  handleDownloadSingle('app.js', getJsExport(), 'application/javascript', 'js')
                }
                className="w-full py-1.5 px-2 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {downloadedFiles.js ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-[#e5b869]" />}
                <span>{downloadedFiles.js ? 'Descargado' : 'Descargar'}</span>
              </button>
            </div>

            {/* DB JSON */}
            <div className="p-3 bg-zinc-900/70 border border-white/[0.06] rounded-xl flex flex-col justify-between hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Database className="w-4 h-4" />
                <span className="text-xs font-bold font-mono">database.json</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">Firestore NoSQL</p>
              <button
                onClick={() =>
                  handleDownloadSingle(
                    'database.json',
                    getDatabaseJsonExport(invoices),
                    'application/json',
                    'dbJson'
                  )
                }
                className="w-full py-1.5 px-2 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {downloadedFiles.dbJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-[#e5b869]" />}
                <span>{downloadedFiles.dbJson ? 'Descargado' : 'Descargar'}</span>
              </button>
            </div>

            {/* DB SQL */}
            <div className="p-3 bg-zinc-900/70 border border-white/[0.06] rounded-xl flex flex-col justify-between hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Database className="w-4 h-4" />
                <span className="text-xs font-bold font-mono">database.sql</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">PostgreSQL & SQL</p>
              <button
                onClick={() =>
                  handleDownloadSingle(
                    'database.sql',
                    getDatabaseSqlExport(invoices),
                    'application/sql',
                    'dbSql'
                  )
                }
                className="w-full py-1.5 px-2 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {downloadedFiles.dbSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-[#e5b869]" />}
                <span>{downloadedFiles.dbSql ? 'Descargado' : 'Descargar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Code Preview Tabs Bar */}
        <div className="px-5 sm:px-6 pt-4 pb-2 bg-[#12141a] border-b border-white/[0.06] flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-semibold mr-1">Vista Previa:</span>
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 rounded font-mono transition-colors cursor-pointer ${
                activeTab === 'html' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              index.html
            </button>
            <button
              onClick={() => setActiveTab('standalone')}
              className={`px-3 py-1.5 rounded font-mono transition-colors cursor-pointer ${
                activeTab === 'standalone' ? 'bg-[#e5b869]/20 text-[#e5b869] border border-[#e5b869]/30 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              index-standalone.html
            </button>
            <button
              onClick={() => setActiveTab('css')}
              className={`px-3 py-1.5 rounded font-mono transition-colors cursor-pointer ${
                activeTab === 'css' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              styles.css
            </button>
            <button
              onClick={() => setActiveTab('js')}
              className={`px-3 py-1.5 rounded font-mono transition-colors cursor-pointer ${
                activeTab === 'js' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              app.js
            </button>
            <button
              onClick={() => setActiveTab('dbJson')}
              className={`px-3 py-1.5 rounded font-mono transition-colors cursor-pointer ${
                activeTab === 'dbJson' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              database.json
            </button>
            <button
              onClick={() => setActiveTab('dbSql')}
              className={`px-3 py-1.5 rounded font-mono transition-colors cursor-pointer ${
                activeTab === 'dbSql' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              database.sql
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded transition-colors cursor-pointer"
            >
              {copiedTab === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === activeTab ? '¡Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={() =>
                handleDownloadSingle(
                  currentFileData.filename,
                  currentFileData.code,
                  currentFileData.type,
                  activeTab
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar {currentFileData.filename}</span>
            </button>
          </div>
        </div>

        {/* Code Content Box */}
        <div className="flex-1 overflow-auto p-4 bg-[#090a0d] font-mono text-xs text-zinc-300">
          <pre className="overflow-x-auto whitespace-pre selection:bg-[#e5b869]/30">
            <code>{currentFileData.code}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <span>
            Persistencia activa en Firestore: <code className="text-[#e5b869]">ai-studio-elitemotorsconce-...</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
