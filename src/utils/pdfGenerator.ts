import jsPDF from 'jspdf';
import { Invoice } from '../components/InvoicingSection';
import { Car } from '../types';

/**
 * Generates and downloads an ultra-luxury, vector-sharp PDF invoice for Elite Motors.
 */
export function generateInvoicePDF(invoice: Invoice, carDetails?: Car | null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Top Luxury Banner
  doc.setFillColor(9, 10, 13); // Dark slate background #090a0d
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold accent bar
  doc.setFillColor(229, 184, 105); // #e5b869 champagne gold
  doc.rect(0, 41, pageWidth, 2.5, 'F');

  // Brand Logo Mark: "ELITE MOTORS"
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('ELITE', 16, 20);

  doc.setTextColor(229, 184, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('MOTORS', 40, 20);

  doc.setFontSize(8.5);
  doc.setTextColor(180, 180, 185);
  doc.text('CONCESIONARIO BOUTIQUE & COLECCIÓN INTERNACIONAL', 16, 27);
  doc.text('Madrid · Miami · Tokio | concierge@elitemotors.luxury | +34 910 882 300', 16, 33);

  // Invoice Number Badge in Header Right
  doc.setFillColor(24, 27, 34);
  doc.roundedRect(pageWidth - 75, 12, 60, 20, 2, 2, 'F');

  doc.setTextColor(229, 184, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('FACTURA PROFORMA', pageWidth - 70, 19);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(invoice.invoiceNumber, pageWidth - 70, 26);

  // 2. Invoice Meta & Two-Column Parties Info
  let currentY = 54;

  // Left Box: Issuer Details (Elite Motors)
  doc.setFillColor(248, 248, 250);
  doc.roundedRect(16, currentY, 86, 38, 2, 2, 'F');
  doc.setDrawColor(220, 222, 228);
  doc.roundedRect(16, currentY, 86, 38, 2, 2, 'S');

  doc.setTextColor(120, 120, 128);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('EMISOR FISCAL & CUSTODIA', 21, currentY + 7);

  doc.setTextColor(30, 32, 38);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Elite Motors Luxury Group S.L.', 21, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 72, 80);
  doc.text('NIF / CIF: ES-B88291042', 21, currentY + 19);
  doc.text('Avenida de la Ilustración 100, Distrito Norte', 21, currentY + 24);
  doc.text('28046 Madrid, España', 21, currentY + 29);
  doc.text('Registro Mercantil de Madrid, Tomo 34.912, Folio 88', 21, currentY + 34);

  // Right Box: Buyer Details
  doc.setFillColor(248, 248, 250);
  doc.roundedRect(108, currentY, 86, 38, 2, 2, 'F');
  doc.setDrawColor(220, 222, 228);
  doc.roundedRect(108, currentY, 86, 38, 2, 2, 'S');

  doc.setTextColor(120, 120, 128);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS FISCALES DEL COMPRADOR', 113, currentY + 7);

  doc.setTextColor(30, 32, 38);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.buyerName, 113, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 72, 80);
  doc.text(`Identificación / Tax ID: ${invoice.buyerDoc}`, 113, currentY + 19);
  doc.text(`Email: ${invoice.buyerEmail}`, 113, currentY + 24);
  doc.text(`Destino: ${invoice.buyerAddress}`, 113, currentY + 29);
  doc.text(`Fecha Emisión: ${invoice.date}`, 113, currentY + 34);

  currentY += 46;

  // 3. Vehicle Dossier Spotlight Box
  doc.setFillColor(15, 17, 23);
  doc.roundedRect(16, currentY, 178, 48, 3, 3, 'F');

  // Decorative small gold line
  doc.setFillColor(229, 184, 105);
  doc.rect(20, currentY + 6, 3, 16, 'F');

  doc.setTextColor(229, 184, 105);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('EXPEDIENTE DE VEHÍCULO ASIGNADO & CERTIFICACIÓN', 26, currentY + 11);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(invoice.carName, 26, currentY + 19);

  // Technical Specs Strip inside the box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(190, 192, 200);

  const engineText = carDetails ? carDetails.engine : 'Motorización de Alto Rendimiento Homologada';
  const hpText = carDetails ? `${carDetails.horsepower} CV` : 'Potencia Oficial';
  const speedText = carDetails ? `${carDetails.topSpeed} km/h` : 'Velocidad Punta';
  const yearText = carDetails ? `${carDetails.year}` : '2024';
  const colorText = carDetails ? carDetails.exteriorColor : 'Acabado Original';

  doc.text(`• Bastidor (VIN Oficial): ${invoice.carVin}`, 26, currentY + 28);
  doc.text(`• Motor / Arquitectura: ${engineText}`, 26, currentY + 34);
  doc.text(`• Año Fabricación: ${yearText}   |   Potencia: ${hpText}   |   V. Máx: ${speedText}`, 26, currentY + 40);
  doc.text(`• Color: ${colorText}   |   Garantía Oficial Elite: 24 Meses Incluida`, 26, currentY + 45);

  currentY += 56;

  // 4. Financial Table Breakdown
  doc.setFillColor(240, 242, 246);
  doc.rect(16, currentY, 178, 8, 'F');

  doc.setTextColor(70, 72, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CONCEPTO / DESCRIPCIÓN', 20, currentY + 5.5);
  doc.text('ESTADO', 105, currentY + 5.5);
  doc.text('TOTAL (USD)', pageWidth - 42, currentY + 5.5, { align: 'right' });

  currentY += 9;

  // Line 1: Vehicle Price
  doc.setTextColor(20, 22, 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Adquisición de ${invoice.carName}`, 20, currentY + 5);
  doc.text('Vehículo Bloqueado', 105, currentY + 5);
  doc.text(`$${invoice.totalPrice.toLocaleString()} USD`, pageWidth - 20, currentY + 5, { align: 'right' });

  doc.setDrawColor(230, 232, 238);
  doc.line(16, currentY + 9, pageWidth - 16, currentY + 9);
  currentY += 11;

  // Line 2: Inspection and Freight (Complementary)
  doc.text('Inspección Técnica de 150 Puntos & Transporte Cerrado', 20, currentY + 5);
  doc.text('Certificado', 105, currentY + 5);
  doc.text('$0 USD (Cortesía)', pageWidth - 20, currentY + 5, { align: 'right' });

  doc.line(16, currentY + 9, pageWidth - 16, currentY + 9);
  currentY += 11;

  // Line 3: Deposit Paid
  doc.setTextColor(16, 140, 70); // Emerald
  doc.setFont('helvetica', 'bold');
  doc.text('Señal de Apartado / Reserva Fiduciaria Abonada', 20, currentY + 5);
  doc.text('Abonado en Cuenta', 105, currentY + 5);
  doc.text(`-$${invoice.depositPaid.toLocaleString()} USD`, pageWidth - 20, currentY + 5, { align: 'right' });

  doc.line(16, currentY + 9, pageWidth - 16, currentY + 9);
  currentY += 16;

  // 5. Total Balance Due Box
  doc.setFillColor(248, 248, 250);
  doc.roundedRect(pageWidth - 95, currentY, 79, 32, 2, 2, 'F');
  doc.setDrawColor(229, 184, 105);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth - 95, currentY, 79, 32, 2, 2, 'S');

  doc.setTextColor(90, 92, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Base Imponible:', pageWidth - 90, currentY + 7);
  doc.text(`$${invoice.totalPrice.toLocaleString()} USD`, pageWidth - 20, currentY + 7, { align: 'right' });

  doc.text('Señal de Reserva:', pageWidth - 90, currentY + 13);
  doc.setTextColor(16, 140, 70);
  doc.text(`-$${invoice.depositPaid.toLocaleString()} USD`, pageWidth - 20, currentY + 13, { align: 'right' });

  doc.setDrawColor(220, 222, 228);
  doc.line(pageWidth - 92, currentY + 17, pageWidth - 18, currentY + 17);

  doc.setTextColor(15, 17, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('SALDO PENDIENTE:', pageWidth - 90, currentY + 24);

  doc.setTextColor(185, 135, 45); // Darker luxury gold
  doc.setFontSize(12);
  doc.text(`$${invoice.balanceDue.toLocaleString()} USD`, pageWidth - 20, currentY + 24, { align: 'right' });

  // Left Note: Payment method & bank instructions
  doc.setTextColor(60, 62, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('MÉTODO DE PAGO UTILIZADO:', 16, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90, 92, 100);
  doc.text(`• Modalidad: ${invoice.paymentMethod}`, 16, currentY + 13);
  doc.text('• Cuenta Custodia Fiduciaria: ES91 0049 1500 0512 3456 7890 (JPMorgan / Santander)', 16, currentY + 18);
  doc.text(`• Código de Referencia: RES-${invoice.carVin.slice(0, 8)}`, 16, currentY + 23);
  doc.text('• Vencimiento del Bloqueo: 7 días hábiles a partir de la emisión', 16, currentY + 28);

  currentY += 40;

  // 6. Security Footer & Certification Stamp
  doc.setDrawColor(220, 222, 228);
  doc.line(16, currentY, pageWidth - 16, currentY);
  currentY += 6;

  doc.setFillColor(248, 248, 250);
  doc.roundedRect(16, currentY, 178, 24, 2, 2, 'F');

  // Digital Stamp
  doc.setTextColor(120, 122, 130);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFICACIÓN ELECTRÓNICA & AUTENTICIDAD TRIBUTARIA', 22, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Documento emitido electrónicamente según normativa europea e internacional de facturación.`, 22, currentY + 11);
  doc.text(`CSV (Código Seguro de Verificación): 884-ELITE-${invoice.invoiceNumber}-SECURE`, 22, currentY + 16);
  doc.text('Registrado en la red fiduciaria oficial de Elite Motors Luxury Dealership S.L.', 22, currentY + 20);

  // Signatures on right
  doc.setTextColor(30, 32, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('DEPARTAMENTO DE CONCIERGE & FINANZAS', pageWidth - 20, currentY + 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 122, 130);
  doc.text('Firma Digital Fiduciaria Certificada', pageWidth - 20, currentY + 17, { align: 'right' });

  // Save / Trigger Download
  const cleanFileName = `Factura_EliteMotors_${invoice.invoiceNumber}.pdf`;
  doc.save(cleanFileName);
}
