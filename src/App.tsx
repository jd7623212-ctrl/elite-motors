import React, { useState, useEffect } from 'react';
import { CARS_DATA } from './data/cars';
import { Car, CartItem } from './types';
import { Navbar, MainSectionTab } from './components/Navbar';
import { Hero } from './components/Hero';
import { InventorySection } from './components/InventorySection';
import { CarDetailModal } from './components/CarDetailModal';
import { CarComparator } from './components/CarComparator';
import { FinancingCalculator } from './components/FinancingCalculator';
import { InvoicingSection, Invoice } from './components/InvoicingSection';
import { ShowroomsSection } from './components/ShowroomsSection';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { TestDriveModal } from './components/TestDriveModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { Footer } from './components/Footer';
import { DownloadFilesModal } from './components/DownloadFilesModal';
import { ConciergeChatWidget } from './components/ConciergeChatWidget';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  validateFirestoreConnection,
  fetchInvoicesFromFirestore,
  saveInvoiceToFirestore,
  deleteInvoiceFromFirestore,
  syncCarsToFirestore,
  fetchCarsFromFirestore
} from './firebase';
import {
  Layers,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Flame,
  Scale,
  Calculator,
  FileText,
  MapPin,
  Database,
  Download
} from 'lucide-react';

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-init-1',
    invoiceNumber: 'INV-2026-88120',
    date: '02 Octubre 2026',
    dueDate: '09 Octubre 2026',
    buyerName: 'Alexander Von Roth',
    buyerDoc: 'CH-892014-Z',
    buyerEmail: 'roth.holdings@geneva-capital.ch',
    buyerAddress: 'Rue du Rhône 42, 1204 Ginebra, Suiza',
    carName: 'Nissan Skyline GT-R V-Spec II (R34)',
    carVin: 'BNR34-402819',
    carBrand: 'Nissan',
    totalPrice: 185000,
    depositPaid: 1500,
    balanceDue: 183500,
    paymentMethod: 'Transferencia Bancaria Internacional SWIFT',
    taxAmount: 38850,
    status: 'Depósito Pagado',
  },
  {
    id: 'inv-init-2',
    invoiceNumber: 'INV-2026-77341',
    date: '28 Septiembre 2026',
    dueDate: '05 Octubre 2026',
    buyerName: 'Beatriz Montero de Alba',
    buyerDoc: 'ES-09248102B',
    buyerEmail: 'b.montero@luxurylaw.es',
    buyerAddress: 'Calle de Velázquez 88, 28001 Madrid, España',
    carName: 'Porsche 911 Turbo S (Generación 992)',
    carVin: 'WP0AD2A98PS251904',
    carBrand: 'Porsche',
    totalPrice: 238000,
    depositPaid: 1500,
    balanceDue: 236500,
    paymentMethod: 'Tarjeta Bancaria Concierge',
    taxAmount: 49980,
    status: 'Depósito Pagado',
  }
];

export default function App() {
  const [cars, setCars] = useState<Car[]>(CARS_DATA);
  const [activeTab, setActiveTab] = useState<MainSectionTab>('collection');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('elitemotors_invoices');
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('elitemotors_favs');
      return saved ? JSON.parse(saved) : ['nissan-gtr-r34', 'porsche-911-turbo-s'];
    } catch {
      return ['nissan-gtr-r34'];
    }
  });

  const [comparedIds, setComparedIds] = useState<string[]>([
    'nissan-gtr-r34',
    'porsche-911-turbo-s',
    'ferrari-458-italia',
  ]);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('elitemotors_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [testDriveCar, setTestDriveCar] = useState<Car | null>(null);
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [financingTargetCar, setFinancingTargetCar] = useState<Car | null>(null);
  const [isRefreshingInvoices, setIsRefreshingInvoices] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // FIRESTORE BOOTSTRAP & SYNC (PERSISTENCIA REAL EN LA NUBE)
  // -------------------------------------------------------------
  useEffect(() => {
    const bootstrapFirestore = async () => {
      try {
        await validateFirestoreConnection();
        // Fetch cars from Firestore and sync state
        const remoteCars = await fetchCarsFromFirestore();
        if (remoteCars.length > 0) {
          const remoteMap = new Map(remoteCars.map((rc) => [rc.id, rc]));
          // Start with CARS_DATA so all 44 vehicles are always preserved
          const mergedCars = CARS_DATA.map((localCar) => {
            const remote = remoteMap.get(localCar.id);
            if (remote) {
              return {
                ...remote,
                ...localCar,
                inStock: remote.inStock !== undefined ? remote.inStock : localCar.inStock,
              };
            }
            return localCar;
          });

          // Include any extra remote cars that might have been created dynamically
          remoteCars.forEach((rc) => {
            if (!CARS_DATA.some((c) => c.id === rc.id)) {
              mergedCars.push(rc);
            }
          });

          setCars(mergedCars);
          // Sync full combined 44-car list to Firestore in background
          syncCarsToFirestore(mergedCars).catch(() => {});
        } else {
          // Initial population of Firestore
          syncCarsToFirestore(CARS_DATA).catch(() => {});
        }

        // Load invoices from Firestore
        const remoteInvoices = await fetchInvoicesFromFirestore();
        if (remoteInvoices.length > 0) {
          setInvoices(remoteInvoices);
        } else {
          // First time initialization: populate Firestore with initial invoices
          for (const inv of INITIAL_INVOICES) {
            saveInvoiceToFirestore(inv).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Firestore connection initialized in offline-first mode:', err);
      }
    };

    bootstrapFirestore();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('elitemotors_favs', JSON.stringify(favoriteIds));
    } catch {}
  }, [favoriteIds]);

  useEffect(() => {
    try {
      localStorage.setItem('elitemotors_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('elitemotors_invoices', JSON.stringify(invoices));
    } catch {}
  }, [invoices]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleFavorite = (car: Car) => {
    setFavoriteIds((prev) => {
      if (prev.includes(car.id)) {
        showToast(`Eliminado de guardados: ${car.name}`);
        return prev.filter((id) => id !== car.id);
      } else {
        showToast(`Guardado en tus favoritos: ${car.name}`);
        return [...prev, car.id];
      }
    });
  };

  const handleToggleCompare = (car: Car) => {
    setComparedIds((prev) => {
      if (prev.includes(car.id)) {
        return prev.filter((id) => id !== car.id);
      }
      if (prev.length >= 3) {
        showToast('Máximo 3 vehículos en la comparativa simultánea.');
        return prev;
      }
      showToast(`Añadido al comparador: ${car.name}`);
      return [...prev, car.id];
    });
  };

  const handleAddToCart = (car: Car) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.car.id === car.id);
      if (exists) {
        showToast(`Ya tienes reservado ${car.name} en tu bolsa.`);
        return prev;
      }
      showToast(`Vehículo añadido para reserva: ${car.name}`);
      return [
        ...prev,
        {
          car,
          reservationType: 'deposit',
          depositAmount: 1500,
          addedAt: Date.now(),
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (carId: string) => {
    setCartItems((prev) => prev.filter((item) => item.car.id !== carId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleCreateCustomInvoice = async (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    showToast(`Factura ${newInvoice.invoiceNumber} registrada en Firestore.`);
    await saveInvoiceToFirestore(newInvoice);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    showToast('Factura eliminada de Firestore correctamente.');
    await deleteInvoiceFromFirestore(invoiceId);
  };

  const handleRefreshInvoicesFromFirestore = async () => {
    setIsRefreshingInvoices(true);
    try {
      const remote = await fetchInvoicesFromFirestore();
      if (remote && remote.length > 0) {
        setInvoices(remote);
        showToast('Datos de facturación actualizados en tiempo real desde Firestore.');
      } else {
        showToast('Base de datos sincronizada con Firestore.');
      }
    } catch {
      showToast('Error al conectar con Firestore. Operando en modo local.');
    } finally {
      setIsRefreshingInvoices(false);
    }
  };

  const handleSelectTab = (tab: MainSectionTab) => {
    setActiveTab(tab);
    setSelectedCar(null);
    setIsTestDriveOpen(false);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsDownloadModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const wishlistCars = cars.filter((c) => favoriteIds.includes(c.id));
  const comparedCars = cars.filter((c) => comparedIds.includes(c.id));

  return (
    <div className="min-h-screen bg-[#090a0d] text-zinc-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#181a22] border border-[#e5b869]/60 text-white text-xs font-semibold rounded-lg shadow-2xl animate-in slide-in-from-bottom duration-200">
          {toastMessage}
        </div>
      )}

      {/* Top Bar Navigation with Active Tab Controller */}
      <Navbar
        activeTab={activeTab}
        cartCount={cartItems.length}
        wishlistCount={favoriteIds.length}
        invoicesCount={invoices.length}
        onSelectTab={handleSelectTab}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenDownloadFiles={() => setIsDownloadModalOpen(true)}
      />

      {/* Secondary Category Switcher Strip for Instant Organized Access */}
      <div className="bg-[#0e1015] border-b border-white/[0.06] py-2 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto text-xs no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mr-2 hidden sm:inline">
              Apartados:
            </span>

            <button
              onClick={() => handleSelectTab('collection')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'collection'
                  ? 'bg-[#e5b869] text-black font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Colección ({cars.length})</span>
            </button>

            <button
              onClick={() => handleSelectTab('comparator')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'comparator'
                  ? 'bg-[#e5b869] text-black font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Comparador ({comparedCars.length})</span>
            </button>

            <button
              onClick={() => handleSelectTab('financing')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'financing'
                  ? 'bg-[#e5b869] text-black font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Financiación</span>
            </button>

            <button
              onClick={() => handleSelectTab('invoicing')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'invoicing'
                  ? 'bg-[#e5b869] text-black font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Facturación ({invoices.length})</span>
            </button>

            <button
              onClick={() => handleSelectTab('showrooms')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'showrooms'
                  ? 'bg-[#e5b869] text-black font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Sedes & Showrooms</span>
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#e5b869] hover:text-white bg-[#e5b869]/10 hover:bg-[#e5b869]/20 border border-[#e5b869]/30 rounded-lg cursor-pointer transition-colors shadow-sm"
              title="Descargar archivos del proyecto y base de datos en un solo archivo ZIP"
            >
              <Download className="w-3.5 h-3.5 text-[#e5b869]" />
              <span>Descargar Proyecto (.ZIP)</span>
            </button>

            <div className="text-[11px] text-zinc-400 shrink-0 hidden xl:flex items-center gap-2 border-l border-white/10 pl-3">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-300 font-medium">Firestore en Tiempo Real</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* VIEW 1: COLECCIÓN & CATÁLOGO */}
        {activeTab === 'collection' && (
          <div className="animate-in fade-in duration-200">
            <Hero
              onExploreClick={() => {
                const el = document.getElementById('inventory');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onFinancingClick={() => handleSelectTab('financing')}
              onTestDriveClick={() => {
                setTestDriveCar(cars[0]);
                setIsTestDriveOpen(true);
              }}
            />

            <InventorySection
              cars={cars}
              favoriteIds={favoriteIds}
              comparedIds={comparedIds}
              onSelectCar={(car) => setSelectedCar(car)}
              onToggleFavorite={handleToggleFavorite}
              onToggleCompare={handleToggleCompare}
              onAddToCart={handleAddToCart}
            />
          </div>
        )}

        {/* VIEW 2: COMPARADOR DE RENDIMIENTO */}
        {activeTab === 'comparator' && (
          <div className="animate-in fade-in duration-200">
            <CarComparator
              allCars={cars}
              comparedCars={comparedCars}
              onRemoveFromCompare={(carId) =>
                setComparedIds((prev) => prev.filter((id) => id !== carId))
              }
              onAddCarToCompare={handleToggleCompare}
              onSelectCar={(car) => setSelectedCar(car)}
              onBackToCollection={() => handleSelectTab('collection')}
            />
          </div>
        )}

        {/* VIEW 3: FINANCIACIÓN */}
        {activeTab === 'financing' && (
          <div className="animate-in fade-in duration-200">
            <FinancingCalculator
              cars={cars}
              selectedCarForFinancing={financingTargetCar}
              onApplyForFinancing={({ carName, monthlyPayment }) => {
                showToast(
                  `Pre-aprobación recibida para ${carName} (~$${monthlyPayment}/mes).`
                );
              }}
            />
          </div>
        )}

        {/* VIEW 4: FACTURACIÓN & MIS COMPRAS */}
        {activeTab === 'invoicing' && (
          <div className="animate-in fade-in duration-200">
            <InvoicingSection
              invoices={invoices}
              cars={cars}
              onSelectCar={(car) => setSelectedCar(car)}
              onCreateCustomInvoice={handleCreateCustomInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onRefreshFromFirestore={handleRefreshInvoicesFromFirestore}
              isRefreshing={isRefreshingInvoices}
            />
          </div>
        )}

        {/* VIEW 5: SEDES & SHOWROOMS */}
        {activeTab === 'showrooms' && (
          <div className="animate-in fade-in duration-200">
            <ShowroomsSection
              onBookVisit={() => {
                setTestDriveCar(cars[0]);
                setIsTestDriveOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onScrollTo={(tabId) => handleSelectTab(tabId as any)}
        onOpenDownloadFiles={() => setIsDownloadModalOpen(true)}
      />

      {/* Modals & Slide-overs */}
      <CarDetailModal
        car={selectedCar}
        onClose={() => setSelectedCar(null)}
        onAddToCart={handleAddToCart}
        onBookTestDrive={(car) => {
          setTestDriveCar(car);
          setIsTestDriveOpen(true);
        }}
        onCalculateFinancing={(car) => {
          setFinancingTargetCar(car);
          handleSelectTab('financing');
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        cartItems={cartItems}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onExploreCars={() => handleSelectTab('collection')}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        cartItems={cartItems}
        onClose={() => setIsCheckoutOpen(false)}
        onClearCart={handleClearCart}
        onOrderCompleted={async (newInvoice) => {
          setInvoices((prev) => [newInvoice, ...prev]);
          await saveInvoiceToFirestore(newInvoice);
        }}
        onGoToInvoices={() => {
          handleSelectTab('invoicing');
        }}
      />

      <TestDriveModal
        isOpen={isTestDriveOpen}
        car={testDriveCar}
        onClose={() => {
          setIsTestDriveOpen(false);
          setTestDriveCar(null);
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        wishlistCars={wishlistCars}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveFavorite={handleToggleFavorite}
        onSelectCar={(car) => setSelectedCar(car)}
        onAddToCart={handleAddToCart}
      />

      <DownloadFilesModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        invoices={invoices}
      />

      {/* Offline Status & Connectivity Indicator */}
      <OfflineIndicator />

      {/* Floating Real-Time Gemini AI Concierge Chat Widget */}
      <ConciergeChatWidget />
    </div>
  );
}
