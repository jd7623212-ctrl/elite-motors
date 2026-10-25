import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Landmark,
  Coins,
  FileCheck,
  ArrowRight,
  Printer,
  Download,
  Copy,
  Check,
  QrCode,
  Lock,
  FileText
} from 'lucide-react';
import { CartItem } from '../types';
import { Invoice } from './InvoicingSection';
import { saveBuyerOrderToFirebase } from '../firebase';
import { generateInvoicePDF } from '../utils/pdfGenerator';

interface CheckoutModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onClearCart: () => void;
  onOrderCompleted?: (invoice: Invoice) => void;
  onGoToInvoices?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cartItems,
  onClose,
  onClearCart,
  onOrderCompleted,
  onGoToInvoices,
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [docNumber, setDocNumber] = useState('');
  
  // Payment methods
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wire' | 'crypto' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Result state
  const [reservationCode, setReservationCode] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

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

  const totalDeposit = cartItems.reduce((acc, item) => acc + item.depositAmount, 0);
  const primaryCar = cartItems[0]?.car;

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    if (!cardHolder) setCardHolder(name);
    setStep('payment');
  };

  const handleFillDemoCard = () => {
    setCardNumber('4532 8920 1194 8830');
    setCardExpiry('12/28');
    setCardCvc('894');
    setCardHolder(name || 'ALEXANDER VON ROTH');
  };

  const handleCopyCrypto = () => {
    navigator.clipboard.writeText('0x71C49A2884B105F992482e1850d99214D8832a7B');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);

    const code = `ELITE-RES-${Math.floor(100000 + Math.random() * 900000)}`;
    const invNum = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setReservationCode(code);
    setInvoiceNumber(invNum);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNum,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
      dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
      buyerName: name,
      buyerDoc: docNumber || 'ES-X8921045M',
      buyerEmail: email,
      buyerAddress: city ? `${city}, Envíos Climatizados VIP` : 'Dirección Registrada del Comprador',
      carName: primaryCar ? primaryCar.name : 'Superdeportivo Elite',
      carVin: primaryCar ? primaryCar.vin : 'VIN-CERTIFIED',
      carBrand: primaryCar ? primaryCar.brand : 'Elite Motors',
      totalPrice: primaryCar ? primaryCar.price : 150000,
      depositPaid: totalDeposit,
      balanceDue: Math.max(0, (primaryCar ? primaryCar.price : 150000) - totalDeposit),
      paymentMethod:
        paymentMethod === 'card'
          ? 'Tarjeta Bancaria Concierge'
          : paymentMethod === 'wire'
          ? 'Transferencia Bancaria Internacional SWIFT'
          : paymentMethod === 'crypto'
          ? 'Criptoactivos USDT / BTC'
          : 'PayPal Express Checkout',
      taxAmount: Math.round((primaryCar ? primaryCar.price : 150000) * 0.21),
      status: 'Depósito Pagado',
    };

    setCreatedInvoice(newInvoice);

    // Save buyer order to Firebase Firestore for Studio review & evaluations
    await saveBuyerOrderToFirebase({
      orderId: code,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      customerCity: city,
      carId: primaryCar ? primaryCar.id : 'unknown',
      carName: primaryCar ? primaryCar.name : 'Vehículo Elite',
      carBrand: primaryCar ? primaryCar.brand : 'Marca',
      carPrice: primaryCar ? primaryCar.price : 0,
      depositAmount: totalDeposit,
      paymentMethod,
      reservationCode: code,
      invoiceNumber: invNum,
      buyerEvaluationStatus: 'Cliente VIP Aprobado - Expediente en Firebase Studios',
      createdAt: new Date().toISOString(),
    });

    if (onOrderCompleted) {
      onOrderCompleted(newInvoice);
    }

    setIsProcessing(false);
    setStep('confirmation');
    onClearCart();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
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
        className="relative w-full max-w-xl bg-[#12141a] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Buyer Details */}
        {step === 'details' && (
          <div>
            <div className="text-xs font-semibold tracking-wider text-[#e5b869] uppercase mb-1">
              Paso 1 de 2 · Reserva Oficial & Facturación
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              Datos del Titular de la Compra
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              El vehículo quedará bloqueado exclusivamente a tu nombre en nuestro sistema global.
            </p>

            <form onSubmit={handleNextToPayment} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Nombre Completo del Titular</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Carlos Mendoza Valdés"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Correo Electrónico Oficial</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@ejemplo.com"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">DNI / Pasaporte / Tax ID</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="Ej. 50493821K o Pasaporte"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Ciudad & País de Entrega</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. Madrid / Miami / Tokio"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#e5b869]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex justify-between items-center">
                <div className="text-zinc-400 text-xs">
                  Monto de señal:{' '}
                  <span className="text-[#e5b869] font-bold text-sm tabular-nums">
                    ${totalDeposit.toLocaleString()} USD
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Continuar a Métodos de Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Functional Payment Gateway */}
        {step === 'payment' && (
          <div>
            <div className="text-xs font-semibold tracking-wider text-[#e5b869] uppercase mb-1">
              Paso 2 de 2 · Pasarela de Pago Segura
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              Métodos de Pago Homologados
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Abono de depósito reembolsable:{' '}
              <strong className="text-[#e5b869]">${totalDeposit.toLocaleString()} USD</strong> en cuenta de custodia.
            </p>

            {/* Payment Method Selector Tabs */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-[#e5b869] text-black border-[#e5b869]'
                    : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px]">Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wire')}
                className={`py-2 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'wire'
                    ? 'bg-[#e5b869] text-black border-[#e5b869]'
                    : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span className="text-[10px]">Transferencia</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                className={`py-2 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'crypto'
                    ? 'bg-[#e5b869] text-black border-[#e5b869]'
                    : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span className="text-[10px]">Cripto USDT</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`py-2 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'paypal'
                    ? 'bg-[#e5b869] text-black border-[#e5b869]'
                    : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span className="text-[10px]">PayPal VIP</span>
              </button>
            </div>

            {/* Sub-form 1: Credit / Debit Card Gateway */}
            {paymentMethod === 'card' && (
              <div className="mt-4 p-4 bg-zinc-900/90 border border-white/10 rounded-lg space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                    Tarjeta de Crédito / Débito Concierge
                  </span>
                  <button
                    type="button"
                    onClick={handleFillDemoCard}
                    className="text-[10px] text-[#e5b869] hover:underline cursor-pointer"
                  >
                    Llenar tarjeta Demo
                  </button>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Número de Tarjeta</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 ···· ···· 8830"
                    maxLength={19}
                    className="w-full bg-zinc-950 border border-white/10 rounded p-2.5 text-white font-mono text-xs focus:outline-none focus:border-[#e5b869]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Caducidad (MM/AA)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full bg-zinc-950 border border-white/10 rounded p-2.5 text-white font-mono text-xs focus:outline-none focus:border-[#e5b869]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Código de Seguridad CVC</label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full bg-zinc-950 border border-white/10 rounded p-2.5 text-white font-mono text-xs focus:outline-none focus:border-[#e5b869]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Titular de la Tarjeta</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="NOMBRE TAL CUAL FIGURA EN LA TARJETA"
                    className="w-full bg-zinc-950 border border-white/10 rounded p-2.5 text-white uppercase text-xs focus:outline-none focus:border-[#e5b869]"
                  />
                </div>
              </div>
            )}

            {/* Sub-form 2: Bank Wire SWIFT */}
            {paymentMethod === 'wire' && (
              <div className="mt-4 p-4 bg-zinc-900/90 border border-white/10 rounded-lg space-y-2.5 text-xs">
                <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-2">
                  Datos Bancarios para Transferencia Internacional
                </span>
                <div className="p-2.5 bg-zinc-950 rounded border border-white/[0.06] space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Banco:</span>
                    <span className="text-white font-semibold">JPMorgan Chase / Banco Santander</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Beneficiario:</span>
                    <span className="text-white">Elite Motors Luxury Group S.L.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">IBAN:</span>
                    <span className="text-[#e5b869] font-bold">ES91 0049 1500 0512 3456 7890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SWIFT / BIC:</span>
                    <span className="text-white">BSCHESMMXXX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Concepto:</span>
                    <span className="text-emerald-400 font-bold">RES-{primaryCar?.vin || 'VIN'}</span>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Tras realizar la transferencia bancaria, el VIN quedará bloqueado automáticamente durante 72h a la espera de conciliación.
                </p>
              </div>
            )}

            {/* Sub-form 3: Crypto Payment */}
            {paymentMethod === 'crypto' && (
              <div className="mt-4 p-4 bg-zinc-900/90 border border-white/10 rounded-lg space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                    Pago con USDT / USDC (Red Ethereum & Tron)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">0% Comisiones de Red</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded border border-white/[0.06]">
                  <div className="bg-white p-1 rounded shrink-0">
                    <QrCode className="w-12 h-12 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-zinc-500 block">Billetera Oficial de Depósito:</span>
                    <div className="font-mono text-[11px] text-[#e5b869] truncate">
                      0x71C49A2884B105F992482e1850d99214D8832a7B
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCrypto}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] text-zinc-300 hover:text-white cursor-pointer"
                    >
                      {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAddress ? 'Dirección Copiada' : 'Copiar Billetera'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-form 4: PayPal Express */}
            {paymentMethod === 'paypal' && (
              <div className="mt-4 p-5 bg-zinc-900/90 border border-white/10 rounded-lg text-center space-y-3">
                <p className="text-xs text-zinc-300">
                  Paga tu apartado con la protección de comprador de PayPal Express o Apple Pay / Google Pay.
                </p>
                <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded text-blue-400 text-xs font-semibold">
                  PayPal Buyer Protection™ y Fideicomiso Habilitado
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Atrás
              </button>

              <button
                onClick={handleConfirmOrder}
                disabled={isProcessing}
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-[#e5b869] hover:bg-[#d4a34b] active:scale-[0.98] rounded cursor-pointer transition-all shadow-md shadow-[#e5b869]/20 flex items-center gap-2"
              >
                {isProcessing ? (
                  <span>Procesando Depósito y Factura...</span>
                ) : (
                  <>
                    <span>Confirmar Pago de ${totalDeposit.toLocaleString()} USD</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Official Confirmation & Invoice Generated */}
        {step === 'confirmation' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-[#e5b869]/20 border border-[#e5b869]/40 rounded-full flex items-center justify-center text-[#e5b869] mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-xs font-semibold text-[#e5b869] uppercase tracking-wider">
              Transacción Aprobada & Expediente Registrado
            </div>
            <h2 className="text-2xl font-bold font-display text-white mt-1">
              Vehículo Reservado con Éxito
            </h2>
            <p className="mt-2 text-xs text-zinc-300 max-w-md mx-auto">
              Se ha emitido tu factura oficial con número fiscal, se bloqueó el VIN y se sincronizó el expediente con Firebase Studios para evaluación del comprador.
            </p>

            {/* Official voucher card */}
            <div className="mt-6 p-4 bg-zinc-950 border border-white/10 rounded-lg text-left text-xs space-y-2 max-w-md mx-auto font-mono">
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-500 font-sans">Factura Proforma:</span>
                <span className="font-bold text-[#e5b869]">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-500 font-sans">Código de Reserva:</span>
                <span className="font-bold text-white">{reservationCode}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-500 font-sans">Comprador Registrado:</span>
                <span className="text-zinc-200">{name}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-500 font-sans">Vehículo:</span>
                <span className="text-zinc-200">{primaryCar?.name || 'Automóvil Elite'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Evaluación Firebase:</span>
                <span className="text-emerald-400 font-semibold font-sans">Registrado para Auditoría</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {createdInvoice && (
                <button
                  onClick={() => generateInvoicePDF(createdInvoice, primaryCar)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-[#e5b869] hover:bg-[#d4a34b] rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#e5b869]/20"
                >
                  <Download className="w-4 h-4 text-black" />
                  <span>Descargar Factura PDF</span>
                </button>
              )}

              {onGoToInvoices && (
                <button
                  onClick={() => {
                    onClose();
                    onGoToInvoices();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#e5b869]" />
                  <span>Ver en Facturación</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-zinc-300 bg-white/[0.06] hover:bg-white/[0.12] rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white rounded transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
