import React from 'react';
import { ShoppingBag, Bookmark, FileText, Menu, X, Download } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';

export type MainSectionTab = 'collection' | 'comparator' | 'financing' | 'invoicing' | 'showrooms';

interface NavbarProps {
  activeTab: MainSectionTab;
  cartCount: number;
  wishlistCount: number;
  invoicesCount: number;
  onSelectTab: (tab: MainSectionTab) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenDownloadFiles?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  cartCount,
  wishlistCount,
  invoicesCount,
  onSelectTab,
  onOpenCart,
  onOpenWishlist,
  onOpenDownloadFiles,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks: { id: MainSectionTab; label: string; count?: number }[] = [
    { id: 'collection', label: 'Colección' },
    { id: 'comparator', label: 'Comparador' },
    { id: 'financing', label: 'Financiación' },
    { id: 'invoicing', label: 'Facturación', count: invoicesCount },
    { id: 'showrooms', label: 'Showrooms & Sedes' },
  ];

  const handleTabClick = (tabId: MainSectionTab) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090a0d]/95 backdrop-blur-md border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4 sm:gap-8">
        
        {/* Zone 1: Luxury Shield & Monogram Brand Logo */}
        <button
          onClick={() => handleTabClick('collection')}
          className="shrink-0 text-left cursor-pointer transition-opacity hover:opacity-90 focus:outline-none"
          title="Elite Motors - Supercar Atelier"
        >
          <BrandLogo size="md" />
        </button>

        {/* Zone 2: 4-5 concise single-line text navigation links with active state indicator */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-zinc-300">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleTabClick(link.id)}
              className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === link.id
                  ? 'text-[#e5b869] font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{link.label}</span>
              {link.count !== undefined && link.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#e5b869]/20 text-[#e5b869] font-mono">
                  {link.count}
                </span>
              )}
              {activeTab === link.id && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#e5b869] rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary action lockup */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* In-App PWA Install Action */}
          <PWAInstallButton />

          {/* Download Files Project Center */}
          {onOpenDownloadFiles && (
            <button
              onClick={onOpenDownloadFiles}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded cursor-pointer transition-all"
              title="Descargar archivos del proyecto y base de datos en un solo archivo ZIP"
            >
              <Download className="w-3.5 h-3.5 text-[#e5b869]" />
              <span>Descargar Proyecto (.ZIP)</span>
            </button>
          )}

          {/* Wishlist */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/[0.04]"
            title="Mis Guardados"
            aria-label="Vehículos Guardados"
          >
            <Bookmark className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-zinc-800 border border-white/20 text-[#e5b869] text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart / Reservations */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-[#e5b869] hover:bg-[#d4a34b] active:scale-[0.98] transition-all rounded cursor-pointer whitespace-nowrap shrink-0 shadow-lg shadow-[#e5b869]/10"
          >
            <ShoppingBag className="w-4 h-4 text-black" />
            <span className="hidden sm:inline">Reservas</span>
            <span className="bg-black text-[#e5b869] px-1.5 py-0.5 rounded text-[11px] font-bold tabular-nums">
              {cartCount}
            </span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0f14] border-b border-white/10 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleTabClick(link.id)}
              className={`w-full text-left py-2.5 px-3 rounded text-sm font-medium transition-colors flex items-center justify-between ${
                activeTab === link.id
                  ? 'bg-[#e5b869]/10 text-[#e5b869] font-bold'
                  : 'text-zinc-300 hover:bg-white/[0.04]'
              }`}
            >
              <span>{link.label}</span>
              {link.count !== undefined && link.count > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#e5b869]/20 text-[#e5b869] font-mono">
                  {link.count}
                </span>
              )}
            </button>
          ))}

          {onOpenDownloadFiles && (
            <button
              onClick={() => {
                onOpenDownloadFiles();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded text-sm font-medium text-[#e5b869] hover:bg-white/[0.04] transition-colors flex items-center gap-2 border-t border-white/[0.06] pt-3 mt-2"
            >
              <Download className="w-4 h-4 text-[#e5b869]" />
              <span>Descargar Proyecto (.ZIP)</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
