import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  ShieldCheck,
  CreditCard,
  QrCode,
  Calendar,
  Search,
  Check,
  Trash2,
  AlertTriangle,
  Database
} from 'lucide-react';
import { Car } from '../types';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { InvoicingAnalytics } from './InvoicingAnalytics';
import { BrandLogo } from './BrandLogo';
import { handleCarImageError } from '../utils/carImages';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  buyerName: string;
  buyerDoc: string;
  buyerEmail: string;
  buyerAddress: string;
  carName: string;
  carVin: string;
  carBrand: string;
  totalPrice: number;
  depositPaid: number;
  balanceDue: number;
  paymentMethod: string;
  taxAmount: number;
  status: 'Depósito Pagado' | 'Factura Emitida' | 'En Custodia';
}

interface InvoicingSectionProps {
  invoices: Invoice[];
  cars: Car[];
  onSelectCar: (car: Car) => void;
  onCreateCustomInvoice: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
  onRefreshFromFirestore?: () => void;
  isRefreshing?: boolean;
}

export const InvoicingSection: React.FC<InvoicingSectionProps> = ({
  invoices,
  cars,
  onSelectCar,
  onCreateCustomInvoice,
  onDeleteInvoice,
  onRefreshFromFirestore,
  isRefreshing = false,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
    invoices.length > 0 ? invoices[0] : null
  );

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState(cars[0]?.id || '');
  const [buyerName, setBuyerName] = useState('');
  const [buyerDoc, setBuyerDoc] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta Bancaria Concierge');
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Sync selected invoice if list changes or selected was removed
  React.useEffect(() => {
    if (!selectedInvoice && invoices.length > 0) {
      setSelectedInvoice(invoices[0]);
    } else if (selectedInvoice && !invoices.some((i) => i.id === selectedInvoice.id)) {
      setSelectedInvoice(invoices.length > 0 ? invoices[0] : null);
    }
  }, [invoices, selectedInvoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    const relatedCar =
      cars.find(
        (c) => c.vin === invoice.carVin || c.name === invoice.carName || c.brand === invoice.carBrand
      ) || null;

    generateInvoicePDF(invoice, relatedCar);
    setDownloadSuccessId(invoice.id);
    setTimeout(() => {
      setDownloadSuccessId(null);
    }, 3000);
  };

  const handleConfirmDelete = () => {
    if (!invoiceToDelete) return;
    if (onDeleteInvoice) {
      onDeleteInvoice(invoiceToDelete.id);
    }
    setInvoiceToDelete(null);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const car = cars.find((c) => c.id === selectedCarId) || cars[0];
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
      dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
      buyerName: buyerName || 'Cliente VIP Elite',
      buyerDoc: buyerDoc || 'ES-X8921045M',
      buyerEmail: buyerEmail || 'cliente@elitemotors.luxury',
      buyerAddress: buyerAddress || 'Paseo de la Castellana 200, Madrid',
      carName: car.name,
      carVin: car.vin,
      carBrand: car.brand,
      totalPrice: car.price,
      depositPaid: 1500,
      balanceDue: car.price - 1500,
      paymentMethod,
      taxAmount: Math.round(car.price * 0.21),
      status: 'Depósito Pagado',
    };

    onCreateCustomInvoice(newInvoice);
    setSelectedInvoice(newInvoice);
    setIsCreatingNew(false);
  };

  const activeCarDetails = selectedInvoice
    ? cars.find(
        (c) =>
          c.vin === selectedInvoice.carVin ||
          c.name === selectedInvoice.carName ||
          c.brand === selectedInvoice.carBrand
      )
    : null;

  return (
    <section id="invoicing-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#e5b869] uppercase mb-1">
            <span>Gestión Tributaria & Documental</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> Sincronizado en Firestore
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
            Centro de Facturación & Mis Compras
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Facturas proforma oficiales, comprobantes de pago de apartado y exportación en formato PDF profesional de alta definición con eliminación directa en la base de datos de Firestore.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{showAnalytics ? 'Ocultar Gráficas' : 'Ver Panel de Métricas'}</span>
          </button>

          <button
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded transition-all cursor-pointer shadow-md"
          >
            {isCreatingNew ? 'Ver Mis Facturas' : '+ Emitir Nueva Factura Proforma'}
          </button>
        </div>
      </div>

      {downloadSuccessId && (
        <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Factura descargada en PDF con éxito con logo oficial y especificaciones técnicas completas.</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-300">Descarga iniciada</span>
        </div>
      )}

      {/* Panel de Visualización Recharts (Volumen de ventas mensual y Total recaudado de Firestore) */}
      {showAnalytics && !isCreatingNew && (
        <div className="mt-8">
          <InvoicingAnalytics
            invoices={invoices}
            onRefreshFromFirestore={onRefreshFromFirestore}
            isLoading={isRefreshing}
          />
        </div>
      )}

      {isCreatingNew ? (
        <div className="mt-8 bg-[#12141a] border border-white/10 rounded-xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl">
          <h3 className="text-xl font-bold font-display text-white mb-2">
            Emitir Factura Oficial Proforma
          </h3>
          <p className="text-xs text-zinc-400 mb-6">
            Ingresa los datos fiscales para generar la factura electrónica vinculada a tu vehículo y persistida en Firestore.
          </p>

          <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Vehículo a Facturar</label>
              <select
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
              >
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name} (${car.price.toLocaleString()} USD)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Razón Social / Nombre Completo</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Ej. Inversiones Automotrices S.L. / Alejandro Ruiz"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">DNI / CIF / Tax ID</label>
                <input
                  type="text"
                  required
                  value={buyerDoc}
                  onChange={(e) => setBuyerDoc(e.target.value)}
                  placeholder="Ej. B-88910245 o 50493821K"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Email de Envío Factura</label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="facturacion@empresa.com"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Dirección Fiscal Completa</label>
              <input
                type="text"
                required
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
                placeholder="Calle, número, código postal, ciudad y país"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Método de Liquidación</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
              >
                <option value="Tarjeta Bancaria Concierge">Tarjeta Bancaria Concierge (Visa/Amex)</option>
                <option value="Transferencia Bancaria Internacional SWIFT">Transferencia Bancaria SWIFT</option>
                <option value="Criptoactivo USDT (Red TRC20/ERC20)">Criptoactivos USDT / BTC</option>
                <option value="PayPal Express Checkout">PayPal Express VIP</option>
              </select>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 font-semibold text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded cursor-pointer"
              >
                Generar Factura Proforma
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Invoices List Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
              <span>Expedientes en Firestore ({invoices.length})</span>
              <span className="text-[10px] text-zinc-500 font-normal">Gestionar o eliminar</span>
            </h3>

            {invoices.length === 0 ? (
              <div className="p-8 bg-zinc-900/60 rounded-lg border border-white/[0.08] text-center text-xs text-zinc-400 space-y-2">
                <p>No tienes facturas activas en Firestore.</p>
                <p className="text-[11px] text-zinc-500">
                  Todas las facturas eliminadas han sido removidas de la base de datos en la nube.
                </p>
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="mt-3 px-3 py-1.5 text-xs text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded font-semibold cursor-pointer"
                >
                  Emitir Nueva Factura
                </button>
              </div>
            ) : (
              invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedInvoice?.id === inv.id
                      ? 'bg-[#181b24] border-[#e5b869] shadow-lg'
                      : 'bg-zinc-900/60 border-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-[#e5b869]">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {inv.status}
                    </span>
                  </div>

                  <h4 className="mt-2 text-xs font-semibold text-white line-clamp-1 font-display">
                    {inv.carName}
                  </h4>

                  <div className="mt-2 pt-2 border-t border-white/[0.04] flex justify-between items-center text-[11px] text-zinc-400">
                    <span>{inv.date}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-200 tabular-nums mr-1">
                        ${inv.totalPrice.toLocaleString()} USD
                      </span>

                      {/* Download PDF Quick Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPDF(inv);
                        }}
                        className="p-1 text-zinc-400 hover:text-[#e5b869] hover:bg-white/[0.06] rounded transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete from Firestore Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInvoiceToDelete(inv);
                        }}
                        className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Eliminar factura de Firestore"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active Invoice Document Preview */}
          {selectedInvoice && (
            <div className="lg:col-span-8 bg-[#12141a] border border-white/10 rounded-xl p-6 sm:p-10 shadow-2xl relative">
              {/* Document Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#e5b869]" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                      Factura Oficial Proforma
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Ref: {selectedInvoice.invoiceNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInvoiceToDelete(selectedInvoice)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded cursor-pointer transition-colors"
                    title="Eliminar esta factura permanentemente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Factura</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(selectedInvoice)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded cursor-pointer transition-all shadow-md shadow-[#e5b869]/20"
                  >
                    {downloadSuccessId === selectedInvoice.id ? (
                      <>
                        <Check className="w-4 h-4 text-black" />
                        <span>¡PDF Descargado!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-black" />
                        <span>Descargar Archivo PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Invoice Printable Sheet */}
              <div id="printable-invoice" className="space-y-6 text-xs text-zinc-300">
                {/* Header Lockup */}
                <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-white/[0.08]">
                  <div>
                    <BrandLogo size="md" />
                    <p className="text-[11px] text-zinc-400 mt-2">
                      Elite Motors Luxury Dealership S.L. · CIF: B-88291042
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Avenida de la Ilustración 100, Distrito Financiero, 28046 Madrid, España
                    </p>
                    <p className="text-[11px] text-zinc-400">concierge@elitemotors.luxury · +34 910 882 300</p>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-xs font-mono font-bold text-[#e5b869] text-base">
                      {selectedInvoice.invoiceNumber}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Fecha: <span className="text-zinc-200">{selectedInvoice.date}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Vencimiento Reserva: <span className="text-zinc-200">{selectedInvoice.dueDate}</span>
                    </div>
                    <div className="mt-2 inline-block text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Estado: {selectedInvoice.status}
                    </div>
                  </div>
                </div>

                {/* Buyer & Seller Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-zinc-950/60 rounded-lg border border-white/[0.06]">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block mb-1">
                      Facturado a:
                    </span>
                    <div className="font-bold text-white text-sm">{selectedInvoice.buyerName}</div>
                    <div className="text-zinc-400 text-xs mt-0.5">Identificación: {selectedInvoice.buyerDoc}</div>
                    <div className="text-zinc-400 text-xs">{selectedInvoice.buyerAddress}</div>
                    <div className="text-zinc-400 text-xs">{selectedInvoice.buyerEmail}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block mb-1">
                      Método & Términos de Pago:
                    </span>
                    <div className="font-medium text-zinc-200">{selectedInvoice.paymentMethod}</div>
                    <div className="text-zinc-400 text-xs mt-1">
                      Cuenta Escrow Fideicomiso: ES91 0049 1500 0512 3456 7890
                    </div>
                    <div className="text-zinc-400 text-xs">SWIFT / BIC: BSCHESMMXXX</div>
                  </div>
                </div>

                {/* Vehicle Dossier Details Highlight inside preview */}
                {activeCarDetails && (
                  <div className="p-4 bg-zinc-900/80 rounded-lg border border-[#e5b869]/20 flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={activeCarDetails.image}
                      alt={activeCarDetails.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleCarImageError(e, activeCarDetails.id)}
                      className="w-28 h-20 object-cover rounded bg-black shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="text-[10px] uppercase tracking-wider text-[#e5b869] font-semibold">
                        Vehículo Asignado · {activeCarDetails.originLabel}
                      </div>
                      <h4 className="font-bold text-white text-sm truncate font-display">
                        {activeCarDetails.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {activeCarDetails.engine} · {activeCarDetails.horsepower} CV · {activeCarDetails.topSpeed} km/h
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1 font-mono">
                        <span>Año: {activeCarDetails.year}</span>
                        <span>·</span>
                        <span>Color: {activeCarDetails.exteriorColor}</span>
                        <span>·</span>
                        <span>Garantía: 24 Meses</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Itemized Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5">Concepto / Vehículo</th>
                        <th className="py-2.5">Bastidor (VIN)</th>
                        <th className="py-2.5 text-right">Base Imponible</th>
                        <th className="py-2.5 text-right">Depósito Pagado</th>
                        <th className="py-2.5 text-right">Saldo Pendiente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      <tr>
                        <td className="py-3 font-semibold text-white">
                          {selectedInvoice.carName}
                          <span className="block text-[10px] text-zinc-400 font-normal">
                            Inspección 150 puntos & Transporte Puerta a Puerta Incluido
                          </span>
                        </td>
                        <td className="py-3 font-mono text-zinc-300 text-[11px]">{selectedInvoice.carVin}</td>
                        <td className="py-3 text-right font-medium tabular-nums">
                          ${selectedInvoice.totalPrice.toLocaleString()} USD
                        </td>
                        <td className="py-3 text-right text-emerald-400 font-semibold tabular-nums">
                          -${selectedInvoice.depositPaid.toLocaleString()} USD
                        </td>
                        <td className="py-3 text-right font-bold text-[#e5b869] tabular-nums">
                          ${selectedInvoice.balanceDue.toLocaleString()} USD
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded">
                      <QrCode className="w-12 h-12 text-black" />
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      <span className="block font-semibold text-zinc-200">Sello de Validación Tributaria</span>
                      <span>Código CSV: 884-ELITE-V2026-X99</span>
                      <span className="block text-emerald-400">Documento homologado con firma electrónica</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal Vehículo:</span>
                      <span className="tabular-nums">${selectedInvoice.totalPrice.toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Señal Abonada:</span>
                      <span className="tabular-nums">-${selectedInvoice.depositPaid.toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between text-zinc-300 border-t border-white/10 pt-2 font-bold text-sm">
                      <span>Saldo Final al Entrega:</span>
                      <span className="text-[#e5b869] tabular-nums">
                        ${selectedInvoice.balanceDue.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal to Delete Invoice from Firestore */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#12141a] border border-white/10 rounded-xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-display">
                  ¿Eliminar Factura de Firestore?
                </h4>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {invoiceToDelete.invoiceNumber} · {invoiceToDelete.carName}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Esta factura se eliminará de forma permanente de la colección <strong className="text-white font-mono">/invoices</strong> de tu base de datos Firestore en Firebase Studios.
            </p>

            <div className="flex justify-end items-center gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:scale-[0.98] rounded cursor-pointer transition-all shadow-md shadow-red-600/30"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
