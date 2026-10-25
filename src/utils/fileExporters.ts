import JSZip from 'jszip';
import { CARS_DATA } from '../data/cars';
import { Invoice } from '../components/InvoicingSection';

// Raw source files for bundling the complete React codebase into the ZIP
import appTsxRaw from '../App.tsx?raw';
import mainTsxRaw from '../main.tsx?raw';
import indexCssRaw from '../index.css?raw';
import typesRaw from '../types/index.ts?raw';
import carsDataRaw from '../data/cars.ts?raw';
import inventorySectionRaw from '../components/InventorySection.tsx?raw';
import priceChartRaw from '../components/PriceDistributionChart.tsx?raw';
import financingRaw from '../components/FinancingCalculator.tsx?raw';
import invoicingSectionRaw from '../components/InvoicingSection.tsx?raw';
import invoicingAnalyticsRaw from '../components/InvoicingAnalytics.tsx?raw';
import soundRevButtonRaw from '../components/SoundRevButton.tsx?raw';
import carCardRaw from '../components/CarCard.tsx?raw';
import heroRaw from '../components/Hero.tsx?raw';
import navbarRaw from '../components/Navbar.tsx?raw';
import footerRaw from '../components/Footer.tsx?raw';
import conciergeChatWidgetRaw from '../components/ConciergeChatWidget.tsx?raw';
import carDetailModalRaw from '../components/CarDetailModal.tsx?raw';
import brandLogoRaw from '../components/BrandLogo.tsx?raw';
import carComparatorRaw from '../components/CarComparator.tsx?raw';
import cartDrawerRaw from '../components/CartDrawer.tsx?raw';
import checkoutModalRaw from '../components/CheckoutModal.tsx?raw';
import downloadFilesModalRaw from '../components/DownloadFilesModal.tsx?raw';
import showroomsSectionRaw from '../components/ShowroomsSection.tsx?raw';
import testDriveModalRaw from '../components/TestDriveModal.tsx?raw';
import wishlistDrawerRaw from '../components/WishlistDrawer.tsx?raw';
import audioEngineRaw from '../utils/audioEngine.ts?raw';
import pdfGeneratorRaw from '../utils/pdfGenerator.ts?raw';
import fileExportersRaw from '../utils/fileExporters.ts?raw';
import packageJsonRaw from '../../package.json?raw';
import serverTsRaw from '../../server.ts?raw';
import firestoreRulesRaw from '../../firestore.rules?raw';
import firebaseBlueprintRaw from '../../firebase-blueprint.json?raw';
const heroShowroomImg = '/images/hero_hypercar_showroom_1791565534002.jpg';

/**
 * Utility to extract clean, relative image filename for assets
 */
export function getCarImageFilename(carId: string, imageUrl?: string): string {
  if (imageUrl) {
    const cleanUrl = imageUrl.split('?')[0].split('#')[0];
    const parts = cleanUrl.split('/');
    const last = parts[parts.length - 1];
    if (last && (last.endsWith('.jpg') || last.endsWith('.jpeg') || last.endsWith('.png') || last.endsWith('.webp'))) {
      return last;
    }
  }
  return `${carId}.jpg`;
}

/**
 * Utility for downloading text/code files directly in the browser
 */
export function triggerFileDownload(filename: string, content: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Packs all project source files, standalone runnable website, all 45 high-definition vehicle photographs,
 * databases, and complete React components into a single unified .zip file.
 */
export async function downloadProjectZip(
  invoices: Invoice[],
  filename: string = 'EliteMotors-Proyecto-Completo.zip',
  onProgress?: (status: string) => void
): Promise<void> {
  const zip = new JSZip();

  if (onProgress) onProgress('Preparando archivos de aplicación web...');

  // 1. Standalone Ready-to-Run Web Application
  zip.file('index.html', getHtmlExport());
  zip.file('styles.css', getCssExport());
  zip.file('app.js', getJsExport());

  // 1b. Standalone All-In-One Single HTML (One-click double click preview anywhere)
  zip.file('index-standalone.html', getStandaloneSingleHtmlExport());

  // 2. High-Definition Vehicle Photographs (Enables 100% Offline Viewing)
  if (onProgress) onProgress('Empaquetando 45 fotografías de alta fidelidad...');
  const imagesFolder = zip.folder('images');
  const srcAssetsImagesFolder = zip.folder('src/assets/images');

  const imageFetchTasks = CARS_DATA.map(async (car) => {
    try {
      const filename = getCarImageFilename(car.id, car.image);
      const res = await fetch(car.image);
      if (res.ok) {
        const blob = await res.blob();
        if (imagesFolder) imagesFolder.file(filename, blob);
        if (srcAssetsImagesFolder) srcAssetsImagesFolder.file(filename, blob);
      }
    } catch (err) {
      console.warn(`Could not bundle image for ${car.name}:`, err);
    }
  });

  // Bundle hero showroom photo
  imageFetchTasks.push(
    (async () => {
      try {
        const res = await fetch(heroShowroomImg);
        if (res.ok) {
          const blob = await res.blob();
          const heroFilename = getCarImageFilename('hero_hypercar_showroom', heroShowroomImg);
          if (imagesFolder) imagesFolder.file(heroFilename, blob);
          if (srcAssetsImagesFolder) srcAssetsImagesFolder.file(heroFilename, blob);
        }
      } catch (err) {
        console.warn('Could not bundle hero showroom image:', err);
      }
    })()
  );

  await Promise.allSettled(imageFetchTasks);

  // 3. Complete Enterprise Databases (NoSQL & Relational)
  if (onProgress) onProgress('Exportando bases de datos SQL y JSON...');
  zip.file('database.json', getDatabaseJsonExport(invoices));
  zip.file('database.sql', getDatabaseSqlExport(invoices));

  // 4. Cloud Firestore Security Rules & Architecture Blueprint
  zip.file('firestore.rules', firestoreRulesRaw || getFirestoreRulesFallback());
  zip.file('firebase-blueprint.json', firebaseBlueprintRaw || getFirebaseBlueprintFallback());

  // 5. Complete React + TypeScript Source Code Folder
  if (onProgress) onProgress('Empaquetando código fuente React + TypeScript...');
  const srcFolder = zip.folder('src');
  if (srcFolder) {
    srcFolder.file('App.tsx', appTsxRaw);
    srcFolder.file('main.tsx', mainTsxRaw);
    srcFolder.file('index.css', indexCssRaw);

    const typesFolder = srcFolder.folder('types');
    if (typesFolder) typesFolder.file('index.ts', typesRaw);

    const dataFolder = srcFolder.folder('data');
    if (dataFolder) dataFolder.file('cars.ts', carsDataRaw);

    const compFolder = srcFolder.folder('components');
    if (compFolder) {
      compFolder.file('InventorySection.tsx', inventorySectionRaw);
      compFolder.file('PriceDistributionChart.tsx', priceChartRaw);
      compFolder.file('FinancingCalculator.tsx', financingRaw);
      compFolder.file('InvoicingSection.tsx', invoicingSectionRaw);
      compFolder.file('InvoicingAnalytics.tsx', invoicingAnalyticsRaw);
      compFolder.file('SoundRevButton.tsx', soundRevButtonRaw);
      compFolder.file('CarCard.tsx', carCardRaw);
      compFolder.file('Hero.tsx', heroRaw);
      compFolder.file('Navbar.tsx', navbarRaw);
      compFolder.file('Footer.tsx', footerRaw);
      compFolder.file('ConciergeChatWidget.tsx', conciergeChatWidgetRaw);
      compFolder.file('CarDetailModal.tsx', carDetailModalRaw);
      compFolder.file('BrandLogo.tsx', brandLogoRaw);
      compFolder.file('CarComparator.tsx', carComparatorRaw);
      compFolder.file('CartDrawer.tsx', cartDrawerRaw);
      compFolder.file('CheckoutModal.tsx', checkoutModalRaw);
      compFolder.file('DownloadFilesModal.tsx', downloadFilesModalRaw);
      compFolder.file('ShowroomsSection.tsx', showroomsSectionRaw);
      compFolder.file('TestDriveModal.tsx', testDriveModalRaw);
      compFolder.file('WishlistDrawer.tsx', wishlistDrawerRaw);
    }

    const utilsFolder = srcFolder.folder('utils');
    if (utilsFolder) {
      utilsFolder.file('audioEngine.ts', audioEngineRaw);
      utilsFolder.file('pdfGenerator.ts', pdfGeneratorRaw);
      utilsFolder.file('fileExporters.ts', fileExportersRaw);
    }
  }

  // 6. Full-Stack Server & Package.json configuration
  zip.file('server.ts', serverTsRaw);
  zip.file('package.json', packageJsonRaw);

  // 7. Comprehensive Documentation
  zip.file('README.md', getReadmeMarkdown());
  zip.file('LEEME.txt', getLeemeText());

  if (onProgress) onProgress('Generando archivo ZIP...');
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generates the complete, standalone HTML web application
 */
export function getHtmlExport(): string {
  const heroImgFilename = getCarImageFilename('hero_hypercar_showroom', heroShowroomImg);

  return `<!doctype html>
<html lang="es" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Elite Motors – Concesionario de Superdeportivos & Clásicos</title>
    <meta name="description" content="Catálogo exclusivo de 44 superdeportivos legendarios: JDM, American Muscle, European GT, Italian Exotic y Hypercars con tasaciones de mercado lógicas, simulador de audio, financiación y asistente virtual offline." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <!-- Top Navigation -->
    <header class="navbar">
      <div class="nav-container">
        <a href="#" class="brand-logo">
          <div class="brand-badge">EM</div>
          <div class="brand-text">
            <span class="brand-title">ELITE MOTORS</span>
            <span class="brand-subtitle">CONCIERGE DEPORTIVO</span>
          </div>
        </a>

        <nav class="nav-links">
          <a href="#inventario">Inventario & Buscador</a>
          <a href="#distribucion-precios">Gráfico de Precios</a>
          <a href="#financiacion">Financiación VIP</a>
          <a href="#facturacion">Facturación VIP</a>
          <a href="#contacto">Showrooms</a>
        </nav>

        <div class="nav-cta">
          <a href="#financiacion" class="btn-gold-sm">Cotizar Financiación</a>
        </div>
      </div>
    </header>

    <!-- Hero Section with Offline-Resilient Background -->
    <section class="hero" style="background-image: linear-gradient(180deg, rgba(9,10,13,0.72) 0%, rgba(9,10,13,0.96) 100%), url('./images/${heroImgFilename}'); background-size: cover; background-position: center;">
      <div class="hero-content">
        <div class="hero-badge">Colección Oficial 2026 • 44 Superdeportivos en Stock</div>
        <h1 class="hero-title">
          La Colección Definitiva de <span class="gold-gradient-text">Superdeportivos & Leyendas</span>
        </h1>
        <p class="hero-description">
          44 piezas exclusivas de alta ingeniería: JDM Legends, American Muscle, European GT, Italian Exotic y Hypercars con valores lógicos de mercado, inspección certificada y entrega personalizada.
        </p>

        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">44</div>
            <div class="stat-label">Autos en Stock</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">100%</div>
            <div class="stat-label">Verificación Certificada</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">5</div>
            <div class="stat-label">Categorías Globales</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">4.9%</div>
            <div class="stat-label">Tasa Financiación VIP</div>
          </div>
        </div>

        <div class="hero-actions">
          <a href="#inventario" class="btn-gold">Explorar Catálogo (44)</a>
          <a href="#distribucion-precios" class="btn-outline">Ver Gráfico de Precios</a>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-container">
      <!-- Section 1: Inventario & Buscador Inteligente -->
      <section id="inventario" class="section">
        <div class="section-header">
          <div class="section-tag">Catálogo en Tiempo Real</div>
          <h2 class="section-title">Inventario de Superdeportivos</h2>
          <p class="section-subtitle">
            Buscador multi-campo para filtrar por marca, modelo, categoría (JDM, Muscle...), tipo de motor (V8, V12, Turbo) o transmisión. Haz clic en cualquier auto para abrir su ficha técnica completa.
          </p>
        </div>

        <!-- Search Bar Hero -->
        <div class="search-box-wrapper">
          <div class="search-input-container">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              id="search-input"
              class="search-input"
              placeholder="Buscar por marca (Ferrari, Nissan, Porsche...), modelo (GT-R, 911), tipo de motor (V8, V12, Twin-Turbo), transmisión..."
              autocomplete="off"
            />
            <button id="search-clear-btn" class="search-clear-btn" title="Limpiar búsqueda" style="display: none;">✕</button>
            <div class="search-counter" id="search-counter">44 vehículos encontrados</div>
          </div>

          <!-- Quick Filter Suggestion Chips -->
          <div class="quick-chips">
            <span class="quick-chips-label">Filtros Rápidos:</span>
            <button class="chip-btn active" data-query="">Todos</button>
            <button class="chip-btn" data-query="JDM">JDM</button>
            <button class="chip-btn" data-query="Muscle">American Muscle</button>
            <button class="chip-btn" data-query="European GT">European GT</button>
            <button class="chip-btn" data-query="Italian Exotic">Italian Exotic</button>
            <button class="chip-btn" data-query="Hypercar">Hypercars</button>
            <button class="chip-btn" data-query="Porsche">Porsche</button>
            <button class="chip-btn" data-query="Ferrari">Ferrari</button>
            <button class="chip-btn" data-query="Nissan">Nissan</button>
            <button class="chip-btn" data-query="BMW">BMW</button>
            <button class="chip-btn" data-query="V8">V8</button>
            <button class="chip-btn" data-query="V12">V12</button>
          </div>

          <!-- Origin Filter Tabs and Sorting Bar -->
          <div class="filter-controls-row">
            <div class="origin-tabs" id="origin-tabs">
              <button class="origin-tab active" data-origin="all">Todos (44)</button>
              <button class="origin-tab" data-origin="jdm">JDM Legends (10)</button>
              <button class="origin-tab" data-origin="american">American Muscle (9)</button>
              <button class="origin-tab" data-origin="european">European GT (11)</button>
              <button class="origin-tab" data-origin="italian">Italian Exotic (9)</button>
              <button class="origin-tab" data-origin="hypercar">Hypercars (5)</button>
            </div>

            <div class="sort-select-wrapper">
              <label for="sort-select">Ordenar por:</label>
              <select id="sort-select" class="sort-select">
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="year-desc">Año: Más Reciente</option>
                <option value="power-desc">Potencia: Mayor CV</option>
                <option value="accel-asc">Aceleración: 0-100 km/h</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 2: Interactive Price Distribution Chart -->
        <div id="distribucion-precios" class="price-chart-card">
          <div class="chart-header">
            <div>
              <div class="chart-badge">Análisis Visual de Mercado</div>
              <h3 class="chart-title">Distribución de Precios en Stock</h3>
              <p class="chart-desc">
                Distribución en 5 tramos de precio. Haz clic en cualquier barra para filtrar el inventario.
              </p>
            </div>
            <button id="clear-price-filter-btn" class="btn-outline-sm" style="display: none;">
              Restablecer Filtro de Precio
            </button>
          </div>

          <!-- Stats Summary -->
          <div class="chart-stats-grid">
            <div class="chart-stat-box">
              <span class="stat-box-title">Precio Mínimo</span>
              <span class="stat-box-val" id="chart-min-val">$48,000 USD</span>
              <span class="stat-box-sub">Abarth 695 / GR Yaris</span>
            </div>
            <div class="chart-stat-box">
              <span class="stat-box-title">Precio Promedio</span>
              <span class="stat-box-val" id="chart-avg-val">$132,600 USD</span>
              <span class="stat-box-sub">Media del stock verificado</span>
            </div>
            <div class="chart-stat-box">
              <span class="stat-box-title">Precio Máximo</span>
              <span class="stat-box-val" id="chart-max-val">$3,400,000 USD</span>
              <span class="stat-box-sub">Jesko / Chiron / Huayra</span>
            </div>
            <div class="chart-stat-box">
              <span class="stat-box-title">Total en Stock</span>
              <span class="stat-box-val" id="chart-total-val">44 Autos</span>
              <span class="stat-box-sub">Disponibilidad inmediata</span>
            </div>
          </div>

          <!-- Interactive Bars Chart Container -->
          <div class="bars-container" id="chart-bars-container">
            <!-- Rendered dynamically by JavaScript -->
          </div>
        </div>

        <!-- Vehicles Grid -->
        <div class="cars-grid" id="cars-grid">
          <!-- Rendered dynamically by JavaScript -->
        </div>
      </section>

      <!-- Section 3: Financiación VIP -->
      <section id="financiacion" class="section financing-section">
        <div class="section-header">
          <div class="section-tag">Adquisición a Medida</div>
          <h2 class="section-title">Financiación VIP</h2>
          <p class="section-subtitle">
            Estructuración financiera personalizada con amortización transparente y tasas preferenciales para coleccionistas.
          </p>
        </div>

        <div class="financing-grid">
          <!-- Controls Form -->
          <div class="financing-form-card">
            <h3 class="form-title">Configuración de Cuota</h3>

            <!-- Car Selector -->
            <div class="form-group">
              <label for="fin-car-select">Vehículo a Financiar:</label>
              <select id="fin-car-select" class="form-control">
                <!-- Populated dynamically -->
              </select>
            </div>

            <!-- Price Display -->
            <div class="form-group">
              <label for="fin-price-input">Precio del Vehículo (USD):</label>
              <input type="number" id="fin-price-input" class="form-control" value="115000" min="10000" step="5000" />
            </div>

            <!-- Down payment -->
            <div class="form-group">
              <div class="flex-between">
                <label>Pago Inicial (Enganche):</label>
                <span class="gold-text font-bold" id="fin-down-amount">$23,000 USD (20%)</span>
              </div>
              <input type="range" id="fin-down-range" min="10" max="60" value="20" class="range-slider" />
              <div class="quick-percentages">
                <button type="button" class="btn-pct" data-pct="10">10%</button>
                <button type="button" class="btn-pct active" data-pct="20">20%</button>
                <button type="button" class="btn-pct" data-pct="30">30%</button>
                <button type="button" class="btn-pct" data-pct="50">50%</button>
              </div>
            </div>

            <!-- Term Months -->
            <div class="form-group">
              <label>Plazo de Financiación (Meses):</label>
              <div class="term-buttons" id="term-buttons">
                <button type="button" class="btn-term" data-term="24">24m</button>
                <button type="button" class="btn-term" data-term="36">36m</button>
                <button type="button" class="btn-term active" data-term="48">48m</button>
                <button type="button" class="btn-term" data-term="60">60m</button>
                <button type="button" class="btn-term" data-term="72">72m</button>
                <button type="button" class="btn-term" data-term="84">84m</button>
              </div>
            </div>

            <!-- APR -->
            <div class="form-group">
              <label for="fin-apr-select">Tasa de Interés Anual (APR):</label>
              <select id="fin-apr-select" class="form-control">
                <option value="4.9" selected>4.9% – Cliente Privado VIP</option>
                <option value="5.4">5.4% – Preferencial Deportivos</option>
                <option value="6.5">6.5% – Estándar Concesionario</option>
              </select>
            </div>
          </div>

          <!-- Summary Result Card -->
          <div class="financing-result-card">
            <div class="result-header">
              <span class="result-subtitle">Cuota Mensual Estimada</span>
              <div class="monthly-payment-amount" id="fin-monthly-val">$2,115 <span class="per-month">/ mes</span></div>
            </div>

            <div class="result-breakdown">
              <div class="breakdown-row">
                <span>Precio del Vehículo:</span>
                <span id="breakdown-price" class="font-mono text-white">$115,000 USD</span>
              </div>
              <div class="breakdown-row">
                <span>Pago Inicial (20%):</span>
                <span id="breakdown-down" class="font-mono text-white">$23,000 USD</span>
              </div>
              <div class="breakdown-row">
                <span>Monto a Financiar:</span>
                <span id="breakdown-principal" class="font-mono text-white">$92,000 USD</span>
              </div>
              <div class="breakdown-row">
                <span>Plazo:</span>
                <span id="breakdown-term" class="font-mono text-white">48 meses</span>
              </div>
              <div class="breakdown-row">
                <span>Intereses Totales Estimados:</span>
                <span id="breakdown-interest" class="font-mono text-emerald-400">+$9,520 USD</span>
              </div>
              <div class="breakdown-row total-row">
                <span>Costo Total Financiado:</span>
                <span id="breakdown-total" class="font-mono text-[#e5b869] font-bold">$124,520 USD</span>
              </div>
            </div>

            <button type="button" id="btn-request-financing" class="btn-gold-full">
              Solicitar Aprobación Financiera
            </button>
            <p class="result-disclaimer">
              * Aprobación garantizada en menos de 24h para clientes verificados. Tasas fijas en USD.
            </p>
          </div>
        </div>
      </section>

      <!-- Section 4: Facturación VIP & Órdenes -->
      <section id="facturacion" class="section">
        <div class="section-header">
          <div class="section-tag">Gestión Pro-Forma & Pagos</div>
          <h2 class="section-title">Facturación & Órdenes VIP</h2>
          <p class="section-subtitle">
            Emisión de facturas pro-forma, recibos de depósito y control de reservas en tiempo real.
          </p>
        </div>

        <div class="invoicing-wrapper">
          <!-- Create Invoice Form -->
          <div class="invoice-form-card">
            <h3 class="form-title">Emitir Nueva Factura VIP</h3>
            <form id="new-invoice-form" class="invoice-form-grid">
              <div class="form-group">
                <label for="inv-buyer-name">Nombre Completo del Comprador:</label>
                <input type="text" id="inv-buyer-name" class="form-control" placeholder="Ej: Alexander Von Roth" required />
              </div>

              <div class="form-group">
                <label for="inv-buyer-email">Correo Electrónico:</label>
                <input type="email" id="inv-buyer-email" class="form-control" placeholder="roth@geneva-capital.ch" required />
              </div>

              <div class="form-group">
                <label for="inv-car-select">Vehículo a Facturar:</label>
                <select id="inv-car-select" class="form-control" required>
                  <!-- Populated dynamically -->
                </select>
              </div>

              <div class="form-group">
                <label for="inv-deposit">Depósito / Anticipo Pagado (USD):</label>
                <input type="number" id="inv-deposit" class="form-control" value="25000" min="1000" step="1000" required />
              </div>

              <div class="form-group full-width">
                <label for="inv-payment-method">Método de Pago:</label>
                <select id="inv-payment-method" class="form-control">
                  <option value="Transferencia Bancaria Swift">Transferencia Bancaria Internacional Swift (USD / EUR)</option>
                  <option value="Criptoactivo Verificado (USDT / BTC)">Criptoactivo Verificado (USDT / BTC Concierge)</option>
                  <option value="Financiación Aprobada Elite Motors">Financiación Aprobada Elite Motors</option>
                  <option value="Escrow Bancario Suizo">Escrow Bancario Suizo / Notarial</option>
                </select>
              </div>

              <div class="form-group full-width">
                <button type="submit" class="btn-gold">Generar Factura Pro-Forma</button>
              </div>
            </form>
          </div>

          <!-- Invoices List -->
          <div class="invoices-list-card">
            <div class="flex-between mb-4">
              <h3 class="form-title mb-0">Facturas Pro-Forma Emitidas</h3>
              <span class="badge-emerald" id="invoices-count-badge">2 Facturas Activas</span>
            </div>

            <div class="invoices-container" id="invoices-container">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>
      </section>

      <!-- Section 5: Showrooms & Contact -->
      <section id="contacto" class="section showroom-section">
        <div class="section-header">
          <div class="section-tag">Red de Concierge Global</div>
          <h2 class="section-title">Showrooms & Atención Privada</h2>
        </div>

        <div class="showrooms-grid">
          <div class="showroom-card">
            <h4 class="showroom-city">Miami Brickell</h4>
            <p class="showroom-address">1100 Brickell Bay Dr, Miami, FL 33131</p>
            <div class="showroom-phone">+1 (305) 555-0199</div>
            <div class="showroom-hours">Lun - Sáb: 10:00 - 19:00 (Cita Previa)</div>
          </div>

          <div class="showroom-card">
            <h4 class="showroom-city">Madrid Salamanca</h4>
            <p class="showroom-address">Calle de Serrano 48, 28001 Madrid</p>
            <div class="showroom-phone">+34 91 555 4321</div>
            <div class="showroom-hours">Lun - Vie: 09:30 - 20:00</div>
          </div>

          <div class="showroom-card">
            <h4 class="showroom-city">Tokyo Ginza</h4>
            <p class="showroom-address">6 Chome Ginza, Chuo City, Tokyo 104-0061</p>
            <div class="showroom-phone">+81 3 5555 8899</div>
            <div class="showroom-hours">Mar - Dom: 11:00 - 19:30</div>
          </div>
        </div>
      </section>
    </main>

    <!-- Car Detail Modal (Ficha Técnica & Galería Completa) -->
    <div id="car-detail-modal" class="modal-backdrop" style="display: none;">
      <div class="modal-dialog">
        <button id="modal-close-btn" class="modal-close-btn" title="Cerrar (Esc)">✕</button>
        <div id="modal-content" class="modal-content">
          <!-- Populated dynamically by showCarDetailModal() -->
        </div>
      </div>
    </div>

    <!-- Floating Concierge Chat Widget (Offline AI Assistant) -->
    <div class="concierge-widget-wrapper">
      <!-- Floating Trigger Button -->
      <button id="chat-toggle-btn" class="chat-toggle-btn" title="Asistente Concierge Elite Motors">
        <span class="chat-icon">💬</span>
        <span class="chat-badge-text">Concierge IA</span>
        <span class="chat-online-dot"></span>
      </button>

      <!-- Chat Window Dialog -->
      <div id="chat-dialog" class="chat-dialog" style="display: none;">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">EM</div>
            <div>
              <div class="chat-title">Concierge Elite Motors</div>
              <div class="chat-status"><span class="status-dot"></span> En Línea • Motor Autónomo Offline</div>
            </div>
          </div>
          <button id="chat-close-btn" class="chat-header-close" title="Minimizar">✕</button>
        </div>

        <!-- 3 Fast Auto-Consultation Buttons -->
        <div class="chat-fast-actions">
          <button class="chat-fast-btn" data-prompt="¿Qué modelos destacados y especificaciones mecánicas tienen en la colección?">
            🏎️ Vehículos & Specs
          </button>
          <button class="chat-fast-btn" data-prompt="¿Cuáles son los requisitos, enganche y condiciones de financiación?">
            💳 Requisitos Financiación
          </button>
          <button class="chat-fast-btn" data-prompt="¿Cuál es la disponibilidad actual de stock y cómo apartar un vehículo?">
            📦 Stock Disponible
          </button>
        </div>

        <!-- Messages Container -->
        <div id="chat-messages" class="chat-messages">
          <!-- Initial message populated by app.js -->
        </div>

        <!-- Quick Chips Horizontal Scroll -->
        <div class="chat-chips-scroll">
          <button class="chat-chip" data-query="¿Qué autos JDM tienen en stock?">Autos JDM</button>
          <button class="chat-chip" data-query="¿Tienen el Porsche GT3 RS en stock?">Porsche GT3 RS</button>
          <button class="chat-chip" data-query="¿Cuál es el auto más rápido de 0 a 100?">Más Rápido (0-100)</button>
          <button class="chat-chip" data-query="¿Cuáles son los requisitos de financiación?">Requisitos Crédito</button>
          <button class="chat-chip" data-query="¿Puedo apartar un auto con $1,500 USD?">Apartar con $1,500</button>
        </div>

        <!-- Chat Input Form -->
        <form id="chat-form" class="chat-form">
          <input type="text" id="chat-input" class="chat-input" placeholder="Pregunta sobre vehículos, financiación o stock..." autocomplete="off" />
          <button type="submit" class="chat-send-btn">➤</button>
        </form>
      </div>
    </div>

    <!-- Audio Toast -->
    <div id="audio-toast" class="audio-toast">
      <span style="font-size: 1.25rem;">🔊</span>
      <span id="audio-toast-text">Sonido de Motor</span>
    </div>

    <!-- Action Toast -->
    <div id="action-toast" class="action-toast">
      <span style="font-size: 1.25rem;">✓</span>
      <span id="action-toast-text">Acción completada</span>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="brand-badge">EM</div>
          <span class="brand-title">ELITE MOTORS CONCIERGE</span>
        </div>
        <p class="footer-copy">
          © 2026 Elite Motors. Todos los derechos reservados. Colección de 44 superdeportivos con número de bastidor (VIN) único, certificación mecánica y valores lógicos de mercado.
        </p>
      </div>
    </footer>

    <!-- Application Script -->
    <script src="app.js"></script>
  </body>
</html>`;
}

/**
 * Generates the complete, high-fidelity Dark Luxury CSS stylesheet
 */
export function getCssExport(): string {
  return `/* ============================================================
   ELITE MOTORS - HOJA DE ESTILOS DARK LUXURY THEME COMPLETA
   ============================================================ */

:root {
  --bg-primary: #090a0d;
  --bg-surface: #12141a;
  --bg-card: #181b24;
  --bg-hover: #222634;
  --gold-primary: #e5b869;
  --gold-hover: #d4a34b;
  --gold-glow: rgba(229, 184, 105, 0.25);
  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-gold: rgba(229, 184, 105, 0.35);
  --font-display: 'Outfit', sans-serif;
  --font-sans: 'Plus Jakarta Sans', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}

/* Typography & Helpers */
.gold-gradient-text {
  background: linear-gradient(135deg, #fce5b8 0%, #e5b869 50%, #b8862d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.gold-text { color: var(--gold-primary); }
.font-bold { font-weight: 700; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }

/* Navbar */
.navbar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(9, 10, 13, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
}
.nav-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}
.brand-badge {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e5b869 0%, #a87928 100%);
  color: #000;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px var(--gold-glow);
}
.brand-text {
  display: flex;
  flex-direction: column;
}
.brand-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  color: #fff;
}
.brand-subtitle {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--gold-primary);
  font-weight: 600;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}
.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.2s;
}
.nav-links a:hover {
  color: #fff;
}

/* Buttons */
.btn-gold {
  background: linear-gradient(135deg, #e5b869 0%, #c99335 100%);
  color: #000;
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 14px var(--gold-glow);
}
.btn-gold:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(229, 184, 105, 0.4);
}
.btn-gold-sm {
  padding: 0.4rem 1rem;
  font-size: 0.75rem;
  background: var(--gold-primary);
  color: #000;
  border-radius: 6px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-gold-sm:hover {
  background: var(--gold-hover);
}
.btn-gold-full {
  width: 100%;
  background: linear-gradient(135deg, #e5b869 0%, #c99335 100%);
  color: #000;
  padding: 0.85rem;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  box-shadow: 0 4px 14px var(--gold-glow);
}
.btn-gold-full:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(229, 184, 105, 0.4);
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: #fff;
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-outline-sm {
  padding: 0.4rem 0.85rem;
  font-size: 0.75rem;
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline:hover, .btn-outline-sm:hover {
  border-color: var(--gold-primary);
  color: var(--gold-primary);
}

/* Hero */
.hero {
  position: relative;
  padding: 5rem 1.5rem 4.5rem;
  text-align: center;
  border-bottom: 1px solid var(--border-subtle);
}
.hero-content {
  max-width: 900px;
  margin: 0 auto;
}
.hero-badge {
  display: inline-block;
  padding: 0.35rem 1rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold-primary);
  background: rgba(229, 184, 105, 0.1);
  border: 1px solid var(--border-gold);
  margin-bottom: 1.5rem;
}
.hero-title {
  font-family: var(--font-display);
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.25rem;
}
.hero-description {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2.5rem;
}
.hero-stats {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}
.stat-item {
  text-align: center;
}
.stat-number {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--gold-primary);
}
.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Main Layout */
.main-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}
.section {
  margin-bottom: 5rem;
}
.section-header {
  margin-bottom: 2rem;
}
.section-tag {
  color: var(--gold-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.section-title {
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.5rem;
}
.section-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  max-width: 750px;
}

/* Search Box & Filters */
.search-box-wrapper {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  background: #0d0f14;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
}
.search-input-container:focus-within {
  border-color: var(--gold-primary);
  box-shadow: 0 0 0 3px var(--gold-glow);
}
.search-icon {
  font-size: 1.15rem;
  margin-right: 0.75rem;
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  font-family: inherit;
}
.search-clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
.search-clear-btn:hover {
  color: #fff;
}
.search-counter {
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(229, 184, 105, 0.12);
  color: var(--gold-primary);
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  white-space: nowrap;
  margin-left: 0.5rem;
}

/* Quick chips */
.quick-chips {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  overflow-x: auto;
  padding-bottom: 0.35rem;
}
.quick-chips-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}
.chip-btn {
  background: #181b24;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.chip-btn:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}
.chip-btn.active {
  background: var(--gold-primary);
  color: #000;
  font-weight: 700;
  border-color: var(--gold-primary);
}

/* Controls row */
.filter-controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.origin-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.origin-tab {
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.origin-tab:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
}
.origin-tab.active {
  background: rgba(229, 184, 105, 0.12);
  color: var(--gold-primary);
  border-color: var(--border-gold);
}
.sort-select-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.sort-select {
  background: #0d0f14;
  border: 1px solid var(--border-subtle);
  color: #fff;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  outline: none;
  cursor: pointer;
}

/* Price Distribution Chart Card */
.price-chart-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}
.chart-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--gold-primary);
  letter-spacing: 0.1em;
  margin-bottom: 0.25rem;
}
.chart-title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  color: #fff;
}
.chart-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.chart-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.chart-stat-box {
  background: #0d0f14;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 0.85rem 1rem;
}
.stat-box-title {
  display: block;
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}
.stat-box-val {
  display: block;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--gold-primary);
}
.stat-box-sub {
  display: block;
  font-size: 0.7rem;
  color: var(--text-secondary);
}

/* SVG / Flex Bars */
.bars-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.85rem;
  padding-top: 1rem;
  align-items: flex-end;
  min-height: 190px;
}
.chart-bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}
.chart-bar-col:hover, .chart-bar-col.active {
  background: rgba(229, 184, 105, 0.08);
}
.bar-fill-track {
  width: 100%;
  height: 120px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  position: relative;
}
.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #fce5b8 0%, #e5b869 40%, #b8862d 100%);
  border-radius: 6px 6px 0 0;
  transition: height 0.4s ease;
}
.chart-bar-col.active .bar-fill {
  box-shadow: 0 0 15px var(--gold-glow);
}
.bar-count-badge {
  font-size: 0.8rem;
  font-weight: 800;
  color: #fff;
}
.bar-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-align: center;
}
.bar-sublabel {
  font-size: 0.65rem;
  color: var(--text-muted);
  text-align: center;
}

/* Cars Grid */
.cars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}
.car-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}
.car-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-gold);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7), 0 0 20px -5px var(--gold-glow);
}
.car-image-wrapper {
  position: relative;
  width: 100%;
  height: 210px;
  background: #050608;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.car-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.car-card:hover .car-image {
  transform: scale(1.05);
}
.car-category-pill {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  backdrop-filter: blur(8px);
  z-index: 2;
}
.car-category-pill.jdm { color: #34d399; border-color: rgba(52, 211, 153, 0.3); }
.car-category-pill.american { color: #fbbf24; border-color: rgba(251, 191, 36, 0.3); }
.car-category-pill.european { color: #60a5fa; border-color: rgba(96, 165, 250, 0.3); }
.car-category-pill.italian { color: #f43f5e; border-color: rgba(244, 63, 94, 0.3); }
.car-category-pill.hypercar { color: #c084fc; border-color: rgba(192, 132, 252, 0.3); }

.car-year-pill {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  z-index: 2;
}

/* Offline SVG Placeholder Badge */
.car-svg-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 40%, #1e2230 0%, #0d0f15 100%);
  border-bottom: 1px solid var(--border-gold);
  padding: 1rem;
  text-align: center;
}

.car-card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.car-brand-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--gold-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
}
.car-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.75rem;
}
.car-specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}
.spec-box {
  font-size: 0.7rem;
}
.spec-box-label {
  display: block;
  color: var(--text-muted);
}
.spec-box-value {
  display: block;
  font-weight: 700;
  color: #fff;
}
.car-sound-btn {
  width: 100%;
  background: rgba(229, 184, 105, 0.1);
  border: 1px solid var(--border-gold);
  color: var(--gold-primary);
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
}
.car-sound-btn:hover {
  background: var(--gold-primary);
  color: #000;
}
.car-card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
  gap: 0.5rem;
}
.car-price-tag {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--gold-primary);
}
.car-card-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Financing Section */
.financing-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 2.5rem;
}
.financing-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
}
.financing-form-card {
  background: #0d0f14;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 1.75rem;
}
.form-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1.25rem;
}
.form-group {
  margin-bottom: 1.25rem;
}
.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}
.form-control {
  width: 100%;
  background: #181b24;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: #fff;
  padding: 0.65rem 0.85rem;
  font-size: 0.85rem;
  outline: none;
  font-family: inherit;
}
.form-control:focus {
  border-color: var(--gold-primary);
}
.range-slider {
  width: 100%;
  margin-top: 0.5rem;
  accent-color: var(--gold-primary);
  cursor: pointer;
}
.quick-percentages {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.btn-pct {
  flex: 1;
  background: #181b24;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 0.35rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-pct:hover, .btn-pct.active {
  background: rgba(229, 184, 105, 0.15);
  color: var(--gold-primary);
  border-color: var(--border-gold);
}
.term-buttons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.4rem;
}
.btn-term {
  background: #181b24;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 0.5rem 0.25rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}
.btn-term:hover, .btn-term.active {
  background: var(--gold-primary);
  color: #000;
  font-weight: 700;
  border-color: var(--gold-primary);
}

.financing-result-card {
  background: #0d0f14;
  border: 1px solid var(--border-gold);
  border-radius: 14px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
}
.result-header {
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 1.25rem;
  margin-bottom: 1.25rem;
}
.result-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.35rem;
}
.monthly-payment-amount {
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 900;
  color: var(--gold-primary);
}
.per-month {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 400;
}
.result-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.breakdown-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.total-row {
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.75rem;
  color: #fff;
  font-weight: 700;
}
.result-disclaimer {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 1rem;
  text-align: center;
}

/* Invoicing Section */
.invoicing-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.invoice-form-card, .invoices-list-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 1.75rem;
}
.invoice-form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
.invoices-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 0.5rem;
}
.invoice-card {
  background: #0d0f14;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 1rem;
}
.invoice-card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.invoice-number {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gold-primary);
}
.invoice-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.invoice-car {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
}
.invoice-buyer {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}
.invoice-financials {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.5rem;
}

/* Badges */
.badge-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

/* Showrooms */
.showrooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
.showroom-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 1.5rem;
}
.showroom-city {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}
.showroom-address {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}
.showroom-phone {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--gold-primary);
  margin-bottom: 0.25rem;
}
.showroom-hours {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Footer */
.footer {
  border-top: 1px solid var(--border-subtle);
  padding: 2.5rem 1.5rem;
  background: #06070a;
}
.footer-container {
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.footer-copy {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Modal Styling */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
}
.modal-dialog {
  background: #101217;
  border: 1px solid var(--border-gold);
  border-radius: 20px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px -10px var(--gold-glow);
}
.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}
.modal-close-btn:hover {
  background: var(--gold-primary);
  color: #000;
}
.modal-content {
  padding: 2rem;
}
.modal-car-hero {
  position: relative;
  height: 320px;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 1.75rem;
  background: #050608;
}
.modal-car-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.modal-specs-table {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.4);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  margin-bottom: 1.5rem;
}
.modal-highlights-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.6rem;
  margin-bottom: 1.75rem;
}
.modal-highlight-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: #d4d4d8;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border-left: 2px solid var(--gold-primary);
}

/* Floating Concierge Chat Widget (Bottom Right) */
.concierge-widget-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 90;
}
.chat-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #181b24 0%, #101217 100%);
  border: 1.5px solid var(--border-gold);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7), 0 0 20px -5px var(--gold-glow);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-toggle-btn:hover {
  transform: translateY(-2px) scale(1.03);
  border-color: var(--gold-primary);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(229, 184, 105, 0.4);
}
.chat-icon { font-size: 1.25rem; }
.chat-badge-text {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--gold-primary);
  letter-spacing: 0.03em;
}
.chat-online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulseDot 2s infinite;
}
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.chat-dialog {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 380px;
  max-width: calc(100vw - 32px);
  height: 540px;
  max-height: calc(100vh - 120px);
  background: #0d0f14;
  border: 1px solid var(--border-gold);
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px -10px var(--gold-glow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: chatSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes chatSlideUp {
  from { opacity: 0; transform: translateY(15px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.chat-header {
  padding: 0.85rem 1rem;
  background: #13161f;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-header-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.chat-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--gold-primary);
  color: #000;
  font-weight: 900;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  color: #fff;
}
.chat-status {
  font-size: 0.65rem;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
}
.chat-header-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}
.chat-header-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.chat-fast-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.35rem;
  padding: 0.5rem;
  background: #101217;
  border-bottom: 1px solid var(--border-subtle);
}
.chat-fast-btn {
  background: rgba(229, 184, 105, 0.08);
  border: 1px solid rgba(229, 184, 105, 0.2);
  color: var(--gold-primary);
  padding: 0.4rem 0.25rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chat-fast-btn:hover {
  background: var(--gold-primary);
  color: #000;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.chat-bubble {
  max-width: 85%;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  font-size: 0.8rem;
  line-height: 1.45;
  animation: fadeInMsg 0.3s ease;
}
@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.chat-bubble.bot {
  background: #181b24;
  color: #e4e4e7;
  border: 1px solid var(--border-subtle);
  align-self: flex-start;
  border-bottom-left-radius: 2px;
}
.chat-bubble.user {
  background: var(--gold-primary);
  color: #000;
  font-weight: 600;
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}

/* Typing indicator */
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 0.75rem;
  background: #181b24;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  align-self: flex-start;
}
.typing-dot {
  width: 6px;
  height: 6px;
  background: var(--gold-primary);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out;
}
.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.chat-chips-scroll {
  display: flex;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: #101217;
  border-top: 1px solid var(--border-subtle);
  overflow-x: auto;
}
.chat-chip {
  background: #181b24;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.68rem;
  white-space: nowrap;
  cursor: pointer;
}
.chat-chip:hover {
  color: #fff;
  border-color: var(--border-gold);
}

.chat-form {
  display: flex;
  padding: 0.65rem;
  background: #090a0d;
  border-top: 1px solid var(--border-subtle);
  gap: 0.5rem;
}
.chat-input {
  flex: 1;
  background: #181b24;
  border: 1px solid var(--border-subtle);
  color: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  outline: none;
}
.chat-input:focus {
  border-color: var(--gold-primary);
}
.chat-send-btn {
  background: var(--gold-primary);
  color: #000;
  border: none;
  width: 34px;
  border-radius: 8px;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Audio & Action Toasts */
.audio-toast, .action-toast {
  position: fixed;
  bottom: 24px;
  left: 24px;
  background: #101217;
  border: 1px solid var(--border-gold);
  color: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1000;
}
.audio-toast.show, .action-toast.show {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive Media Queries */
@media (max-width: 900px) {
  .nav-links { display: none; }
  .financing-grid, .invoicing-wrapper { grid-template-columns: 1fr; }
  .bars-container { overflow-x: auto; min-width: 480px; }
  .hero-title { font-size: 2rem; }
  .chat-dialog { width: calc(100vw - 32px); bottom: 70px; right: 0; }
}
`;
}

/**
 * Generates the complete, standalone JavaScript client application with full offline interactivity
 */
export function getJsExport(): string {
  const carsForExport = CARS_DATA.map((c) => {
    const filename = getCarImageFilename(c.id, c.image);
    return {
      ...c,
      image: `./images/${filename}`,
      imageFilename: filename,
    };
  });

  const carsJson = JSON.stringify(carsForExport, null, 2);

  return `/**
 * ============================================================
 * ELITE MOTORS - MOTOR JAVASCRIPT & APLICACIÓN WEB AUTÓNOMA
 * Catálogo 44 Autos, Ficha Técnica, Buscador, Gráfico Recharts,
 * Financiación VIP, Facturación, Motor Acústico & Concierge IA
 * ============================================================
 */

// 1. Catálogo Completo Sincronizado de 44 Superdeportivos con Rutas Locales
const CARS_DATA = ${carsJson};

// 2. Manejador de Error de Imagen con Respaldo SVG Vectorial de Alta Definición
window.handleCarImageError = function(imgEl, carId) {
  if (imgEl.dataset.fallbackTried === 'alt-path') {
    // Si la ruta local no existe (ej. abierto sin carpeta images), inyectar badge SVG
    const car = CARS_DATA.find(c => c.id === carId);
    if (!car) return;
    const parent = imgEl.parentElement;
    if (parent) {
      imgEl.style.display = 'none';
      if (!parent.querySelector('.car-svg-placeholder')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'car-svg-placeholder';
        placeholder.innerHTML = \`
          <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">🏎️</div>
          <div style="font-family: var(--font-display); font-weight: 800; font-size: 1.05rem; color: #fff;">\${car.name}</div>
          <div style="font-size: 0.75rem; color: var(--gold-primary); font-weight: 700; margin-top: 0.2rem;">\${car.brand.toUpperCase()} • \${car.year}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.35rem;">\${car.engine} • \${car.horsepower} CV</div>
        \`;
        parent.appendChild(placeholder);
      }
    }
    return;
  }

  // Intento 1: Probar ruta alternativa en carpeta images/
  imgEl.dataset.fallbackTried = 'alt-path';
  const filename = imgEl.src.split('/').pop().split('?')[0];
  imgEl.src = 'images/' + filename;
};

// 3. Motor Acústico Web Audio API (Generador de Rugido por Síntesis)
class AudioSynthesizer {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playRev(soundType = 'v8-muscle', carName = '') {
    this.init();
    if (!this.ctx) return;

    showAudioToast("Rugido de Motor: " + (carName || soundType.toUpperCase()));

    const now = this.ctx.currentTime;
    const duration = 2.4;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.35, now + 0.15);
    masterGain.gain.setValueAtTime(0.35, now + 1.2);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    masterGain.connect(this.ctx.destination);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.9);
    filter.frequency.exponentialRampToValueAtTime(650, now + duration);
    filter.connect(masterGain);

    let baseFreq = 50;
    let peakFreq = 220;

    switch (soundType) {
      case 'v8-muscle': baseFreq = 42; peakFreq = 180; break;
      case 'inline6-turbo': baseFreq = 54; peakFreq = 260; break;
      case 'flat6-twin': baseFreq = 62; peakFreq = 290; break;
      case 'v10-screamer': baseFreq = 72; peakFreq = 340; break;
      case 'v12-screamer': baseFreq = 80; peakFreq = 380; break;
      case 'v6-biturbo': baseFreq = 48; peakFreq = 210; break;
    }

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.9);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq, now + duration);
    osc1.connect(filter);
    osc1.start();
    osc1.stop(now + duration);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2, now);
    osc2.frequency.exponentialRampToValueAtTime(peakFreq * 2, now + 0.9);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + duration);
    osc2.connect(filter);
    osc2.start();
    osc2.stop(now + duration);
  }
}

const audioEngine = new AudioSynthesizer();

function showAudioToast(text) {
  const toast = document.getElementById('audio-toast');
  const toastText = document.getElementById('audio-toast-text');
  if (!toast || !toastText) return;
  toastText.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

function showActionToast(text) {
  const toast = document.getElementById('action-toast');
  const toastText = document.getElementById('action-toast-text');
  if (!toast || !toastText) return;
  toastText.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

// 4. Estado Global de la Aplicación
let currentSearchQuery = '';
let currentOrigin = 'all';
let currentSortBy = 'featured';
let currentPriceBracket = null; // { min, max }
let localInvoices = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-0042',
    date: '2026-10-10',
    buyerName: 'Alexander Von Roth',
    buyerEmail: 'roth.holdings@geneva-capital.ch',
    carName: 'Porsche 911 GT3 RS Weissach',
    carVin: 'WP0AF2A97RS192837',
    totalPrice: 245000,
    depositPaid: 50000,
    balanceDue: 195000,
    paymentMethod: 'Transferencia Bancaria Swift'
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-0043',
    date: '2026-10-12',
    buyerName: 'Beatriz Montero de Alba',
    buyerEmail: 'b.montero@luxurylaw.es',
    carName: 'Nissan Skyline GT-R V-Spec II R34',
    carVin: 'BNR34-401928',
    totalPrice: 115000,
    depositPaid: 25000,
    balanceDue: 90000,
    paymentMethod: 'Criptoactivo Verificado (USDT / BTC)'
  }
];

const PRICE_BRACKETS = [
  { key: 'b1', label: 'Menos de $75,000', shortLabel: '< $75k', min: 0, max: 75000 },
  { key: 'b2', label: '$75,000 - $100,000', shortLabel: '$75k - $100k', min: 75000, max: 100000 },
  { key: 'b3', label: '$100,000 - $150,000', shortLabel: '$100k - $150k', min: 100000, max: 150000 },
  { key: 'b4', label: '$150,000 - $200,000', shortLabel: '$150k - $200k', min: 150000, max: 200000 },
  { key: 'b5', label: 'Más de $200,000', shortLabel: '> $200k', min: 200000, max: null }
];

function formatMoney(amount) {
  return '$' + Number(amount).toLocaleString('en-US') + ' USD';
}

// 5. Filtrado y Ordenamiento Multi-Campo
function getFilteredCars() {
  return CARS_DATA.filter(car => {
    if (currentOrigin !== 'all' && car.origin !== currentOrigin) {
      return false;
    }

    if (currentPriceBracket) {
      if (currentPriceBracket.max !== null) {
        if (car.price < currentPriceBracket.min || car.price >= currentPriceBracket.max) return false;
      } else {
        if (car.price < currentPriceBracket.min) return false;
      }
    }

    if (currentSearchQuery.trim() !== '') {
      const q = currentSearchQuery.toLowerCase().trim();
      const corpus = [
        car.name,
        car.brand,
        car.model,
        car.originLabel,
        car.engine,
        car.engineType || '',
        car.transmission,
        car.vin,
        car.description || ''
      ].join(' ').toLowerCase();

      const terms = q.split(/\\s+/);
      const matchesAll = terms.every(term => corpus.includes(term));
      if (!matchesAll) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (currentSortBy) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'year-desc': return b.year - a.year;
      case 'power-desc': return b.horsepower - a.horsepower;
      case 'accel-asc': return a.acceleration - b.acceleration;
      default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });
}

// 6. Gráfico de Distribución de Precios
function renderPriceChart() {
  const container = document.getElementById('chart-bars-container');
  const clearBtn = document.getElementById('clear-price-filter-btn');
  if (!container) return;

  const prices = CARS_DATA.map(c => c.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  document.getElementById('chart-min-val').textContent = formatMoney(minPrice);
  document.getElementById('chart-max-val').textContent = formatMoney(maxPrice);
  document.getElementById('chart-avg-val').textContent = formatMoney(avgPrice);
  document.getElementById('chart-total-val').textContent = CARS_DATA.length + ' Autos';

  if (clearBtn) {
    clearBtn.style.display = currentPriceBracket ? 'inline-flex' : 'none';
  }

  const counts = PRICE_BRACKETS.map(def => {
    const matching = CARS_DATA.filter(c => {
      if (def.max === null) return c.price >= def.min;
      return c.price >= def.min && c.price < def.max;
    });
    return matching.length;
  });

  const maxCount = Math.max(...counts, 1);

  container.innerHTML = PRICE_BRACKETS.map((def, idx) => {
    const count = counts[idx];
    const heightPct = Math.max(15, Math.round((count / maxCount) * 100));
    const isActive = currentPriceBracket && currentPriceBracket.min === def.min && currentPriceBracket.max === def.max;

    return \`
      <div class="chart-bar-col \${isActive ? 'active' : ''}" data-idx="\${idx}" title="\${def.label}: \${count} autos">
        <span class="bar-count-badge">\${count}</span>
        <div class="bar-fill-track">
          <div class="bar-fill" style="height: \${heightPct}%;"></div>
        </div>
        <span class="bar-label">\${def.shortLabel}</span>
        <span class="bar-sublabel">\${def.min === 0 ? '< $75k' : def.max ? def.label : '> $200k'}</span>
      </div>
    \`;
  }).join('');

  container.querySelectorAll('.chart-bar-col').forEach(col => {
    col.addEventListener('click', () => {
      const idx = Number(col.getAttribute('data-idx'));
      const bracket = PRICE_BRACKETS[idx];
      if (currentPriceBracket && currentPriceBracket.min === bracket.min && currentPriceBracket.max === bracket.max) {
        currentPriceBracket = null;
      } else {
        currentPriceBracket = bracket;
      }
      renderPriceChart();
      renderCarsGrid();
    });
  });
}

// 7. Renderizado de la Cuadrícula de Autos
function renderCarsGrid() {
  const grid = document.getElementById('cars-grid');
  const counter = document.getElementById('search-counter');
  if (!grid) return;

  const filtered = getFilteredCars();

  if (counter) {
    counter.textContent = \`\${filtered.length} vehículo\${filtered.length === 1 ? '' : 's'} encontrado\${filtered.length === 1 ? '' : 's'}\`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = \`
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-surface); border-radius: 16px; border: 1px dashed var(--border-subtle);">
        <div style="font-size: 2.5rem; margin-bottom: 1rem;">🏎️</div>
        <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: #fff; margin-bottom: 0.5rem;">No se encontraron vehículos coincidentes</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">Prueba a cambiar los términos de búsqueda o a eliminar los filtros activos.</p>
        <button id="reset-filters-btn" class="btn-gold-sm">Restablecer Filtros</button>
      </div>
    \`;
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        currentSearchQuery = '';
        currentOrigin = 'all';
        currentPriceBracket = null;
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.chip-btn').forEach(b => b.classList.toggle('active', b.dataset.query === ''));
        document.querySelectorAll('.origin-tab').forEach(b => b.classList.toggle('active', b.dataset.origin === 'all'));
        renderPriceChart();
        renderCarsGrid();
      });
    }
    return;
  }

  grid.innerHTML = filtered.map(car => {
    return \`
      <div class="car-card" data-id="\${car.id}">
        <div class="car-image-wrapper">
          <img
            src="\${car.image}"
            alt="\${car.name}"
            class="car-image"
            loading="lazy"
            onerror="window.handleCarImageError(this, '\${car.id}')"
          />
          <span class="car-category-pill \${car.origin}">\${car.originLabel || car.origin.toUpperCase()}</span>
          <span class="car-year-pill">\${car.year}</span>
        </div>

        <div class="car-card-body">
          <div class="car-brand-name">\${car.brand}</div>
          <h3 class="car-title">\${car.name}</h3>

          <div class="car-specs-grid">
            <div class="spec-box">
              <span class="spec-box-label">Motor</span>
              <span class="spec-box-value">\${car.engine}</span>
            </div>
            <div class="spec-box">
              <span class="spec-box-label">Potencia</span>
              <span class="spec-box-value">\${car.horsepower} CV</span>
            </div>
            <div class="spec-box">
              <span class="spec-box-label">0-100 km/h</span>
              <span class="spec-box-value">\${car.acceleration}s</span>
            </div>
            <div class="spec-box">
              <span class="spec-box-label">Vel. Máx</span>
              <span class="spec-box-value">\${car.topSpeed} km/h</span>
            </div>
          </div>

          <!-- Botón de Rugido de Motor -->
          <button class="car-sound-btn" data-sound="\${car.audioSoundType}" data-name="\${car.name}">
            🔊 Escuchar Rugido (\${car.audioSoundType || 'Motor'})
          </button>

          <div class="car-card-footer">
            <div class="car-price-tag">\${formatMoney(car.price)}</div>
            <div class="car-card-actions">
              <button class="btn-outline-sm btn-view-detail" data-id="\${car.id}">
                Ficha Técnica
              </button>
              <button class="btn-gold-sm btn-quote-fin" data-id="\${car.id}">
                Financiar
              </button>
            </div>
          </div>
        </div>
      </div>
    \`;
  }).join('');

  // Click en la tarjeta completa para abrir modal de detalle
  grid.querySelectorAll('.car-card').forEach(card => {
    card.addEventListener('click', () => {
      const carId = card.getAttribute('data-id');
      showCarDetailModal(carId);
    });
  });

  // Botón Ficha Técnica
  grid.querySelectorAll('.btn-view-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const carId = btn.getAttribute('data-id');
      showCarDetailModal(carId);
    });
  });

  // Botón Sonido de Motor
  grid.querySelectorAll('.car-sound-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sound = btn.getAttribute('data-sound');
      const name = btn.getAttribute('data-name');
      audioEngine.playRev(sound, name);
    });
  });

  // Botón Financiar
  grid.querySelectorAll('.btn-quote-fin').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const carId = btn.getAttribute('data-id');
      selectCarInFinancing(carId);
    });
  });
}

// 8. Modal de Detalle del Auto (Ficha Técnica & Galería Completa)
function showCarDetailModal(carId) {
  const car = CARS_DATA.find(c => c.id === carId);
  if (!car) return;

  const modal = document.getElementById('car-detail-modal');
  const content = document.getElementById('modal-content');
  if (!modal || !content) return;

  const highlightsHtml = (car.highlights || [
    'Certificación mecánica integral de 180 puntos',
    'Inspección de chasis y motor documentada',
    'Título limpio y kilometraje verificado en origen',
    'Disponible para entrega internacional o en showroom'
  ]).map(h => \`<li class="modal-highlight-item"><span>✓</span> \${h}</li>\`).join('');

  content.innerHTML = \`
    <div class="modal-car-hero">
      <img
        src="\${car.image}"
        alt="\${car.name}"
        onerror="window.handleCarImageError(this, '\${car.id}')"
      />
      <span class="car-category-pill \${car.origin}" style="top: 16px; left: 16px;">\${car.originLabel || car.origin.toUpperCase()}</span>
      <span class="car-year-pill" style="top: 16px; right: 16px;">\${car.year}</span>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--gold-primary); text-transform: uppercase;">\${car.brand} • \${car.originCountry || 'Exótico'}</div>
        <h2 style="font-family: var(--font-display); font-size: 1.85rem; font-weight: 800; color: #fff;">\${car.name}</h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem; max-width: 650px;">\${car.description || 'Superdeportivo de alta ingeniería certificado por Elite Motors.'}</p>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Valor de Mercado</span>
        <div style="font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--gold-primary);">\${formatMoney(car.price)}</div>
      </div>
    </div>

    <!-- Especificaciones Técnicas Detalladas -->
    <h4 style="font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Ficha Técnica Oficial</h4>
    <div class="modal-specs-table">
      <div>
        <span class="spec-box-label">Motor</span>
        <span class="spec-box-value">\${car.engine}</span>
      </div>
      <div>
        <span class="spec-box-label">Tipo de Motor</span>
        <span class="spec-box-value">\${car.engineType || 'Combustión'}</span>
      </div>
      <div>
        <span class="spec-box-label">Potencia</span>
        <span class="spec-box-value">\${car.horsepower} CV / HP</span>
      </div>
      <div>
        <span class="spec-box-label">Par Motor</span>
        <span class="spec-box-value">\${car.torque || '500'} Nm</span>
      </div>
      <div>
        <span class="spec-box-label">0 a 100 km/h</span>
        <span class="spec-box-value">\${car.acceleration} segundos</span>
      </div>
      <div>
        <span class="spec-box-label">Velocidad Máxima</span>
        <span class="spec-box-value">\${car.topSpeed} km/h</span>
      </div>
      <div>
        <span class="spec-box-label">Transmisión</span>
        <span class="spec-box-value">\${car.transmission}</span>
      </div>
      <div>
        <span class="spec-box-label">Tracción</span>
        <span class="spec-box-value">\${car.drivetrain || 'RWD'}</span>
      </div>
      <div>
        <span class="spec-box-label">Kilometraje</span>
        <span class="spec-box-value">\${Number(car.mileage).toLocaleString()} km</span>
      </div>
      <div>
        <span class="spec-box-label">Color Exterior</span>
        <span class="spec-box-value">\${car.exteriorColor || 'Exclusivo'}</span>
      </div>
      <div>
        <span class="spec-box-label">Color Interior</span>
        <span class="spec-box-value">\${car.interiorColor || 'Cuero Deportivo'}</span>
      </div>
      <div>
        <span class="spec-box-label">Número de Bastidor (VIN)</span>
        <span class="spec-box-value" style="font-family: var(--font-mono); color: var(--gold-primary);">\${car.vin}</span>
      </div>
    </div>

    <!-- Puntos Clave de Inspección -->
    <h4 style="font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">Puntos Clave & Certificación</h4>
    <ul class="modal-highlights-list">
      \${highlightsHtml}
    </ul>

    <!-- Acciones del Modal -->
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
      <button id="modal-sound-btn" class="btn-outline" style="gap: 0.5rem;">
        🔊 Rugido de Motor
      </button>
      <button id="modal-finance-btn" class="btn-gold" style="gap: 0.5rem;">
        💳 Cotizar Financiación
      </button>
      <button id="modal-invoice-btn" class="btn-outline" style="gap: 0.5rem;">
        📄 Factura Proforma
      </button>
    </div>
  \`;

  document.getElementById('modal-sound-btn')?.addEventListener('click', () => {
    audioEngine.playRev(car.audioSoundType, car.name);
  });

  document.getElementById('modal-finance-btn')?.addEventListener('click', () => {
    closeCarDetailModal();
    selectCarInFinancing(car.id);
  });

  document.getElementById('modal-invoice-btn')?.addEventListener('click', () => {
    closeCarDetailModal();
    const invSelect = document.getElementById('inv-car-select');
    if (invSelect) {
      invSelect.value = car.id;
      document.getElementById('facturacion')?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeCarDetailModal() {
  const modal = document.getElementById('car-detail-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function selectCarInFinancing(carId) {
  const select = document.getElementById('fin-car-select');
  if (select) {
    select.value = carId;
    const selected = CARS_DATA.find(c => c.id === carId);
    if (selected) {
      const priceInput = document.getElementById('fin-price-input');
      if (priceInput) priceInput.value = selected.price;
      updateFinancingCalculator();
    }
    document.getElementById('financiacion')?.scrollIntoView({ behavior: 'smooth' });
    showActionToast('Vehículo cargado en el módulo de financiación.');
  }
}

// 9. Módulo de Financiación VIP
function initFinancingModule() {
  const carSelect = document.getElementById('fin-car-select');
  const priceInput = document.getElementById('fin-price-input');
  const downRange = document.getElementById('fin-down-range');
  const aprSelect = document.getElementById('fin-apr-select');
  const termButtons = document.getElementById('term-buttons');
  const requestBtn = document.getElementById('btn-request-financing');

  if (!carSelect || !priceInput || !downRange) return;

  carSelect.innerHTML = CARS_DATA.map(c => \`
    <option value="\${c.id}">\${c.name} - \${formatMoney(c.price)}</option>
  \`).join('');

  carSelect.value = CARS_DATA[0].id;
  priceInput.value = CARS_DATA[0].price;

  carSelect.addEventListener('change', () => {
    const selected = CARS_DATA.find(c => c.id === carSelect.value);
    if (selected) {
      priceInput.value = selected.price;
      updateFinancingCalculator();
    }
  });

  priceInput.addEventListener('input', updateFinancingCalculator);
  downRange.addEventListener('input', updateFinancingCalculator);
  if (aprSelect) aprSelect.addEventListener('change', updateFinancingCalculator);

  document.querySelectorAll('.btn-pct').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-pct').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      downRange.value = btn.getAttribute('data-pct');
      updateFinancingCalculator();
    });
  });

  if (termButtons) {
    termButtons.querySelectorAll('.btn-term').forEach(btn => {
      btn.addEventListener('click', () => {
        termButtons.querySelectorAll('.btn-term').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateFinancingCalculator();
      });
    });
  }

  if (requestBtn) {
    requestBtn.addEventListener('click', () => {
      const selected = CARS_DATA.find(c => c.id === carSelect.value);
      showActionToast('¡Solicitud de Financiación Enviada con Éxito!');
      alert('¡SOLICITUD FINANCIERA VIP REGISTRADA!\\n\\nVehículo: ' + (selected ? selected.name : 'Personalizado') + '\\nCuota: ' + document.getElementById('fin-monthly-val').textContent.trim() + '\\n\\nUn Concierge Financiero de Elite Motors se comunicará en menos de 2 horas.');
    });
  }

  updateFinancingCalculator();
}

function updateFinancingCalculator() {
  const priceInput = document.getElementById('fin-price-input');
  const downRange = document.getElementById('fin-down-range');
  const aprSelect = document.getElementById('fin-apr-select');
  const downAmountLabel = document.getElementById('fin-down-amount');
  const monthlyLabel = document.getElementById('fin-monthly-val');

  if (!priceInput || !downRange || !monthlyLabel) return;

  const price = Math.max(1000, Number(priceInput.value) || 0);
  const downPct = Number(downRange.value) || 20;
  const apr = Number(aprSelect ? aprSelect.value : 4.9);

  const activeTermBtn = document.querySelector('.btn-term.active');
  const termMonths = activeTermBtn ? Number(activeTermBtn.getAttribute('data-term')) : 48;

  const downAmount = Math.round((price * downPct) / 100);
  const principal = Math.max(0, price - downAmount);

  let monthlyPayment = 0;
  if (principal > 0) {
    const rate = (apr / 100) / 12;
    if (rate === 0) {
      monthlyPayment = Math.round(principal / termMonths);
    } else {
      monthlyPayment = Math.round(
        (principal * rate * Math.pow(1 + rate, termMonths)) / (Math.pow(1 + rate, termMonths) - 1)
      );
    }
  }

  const totalFinanced = (monthlyPayment * termMonths) + downAmount;
  const totalInterest = Math.max(0, totalFinanced - price);

  if (downAmountLabel) downAmountLabel.textContent = formatMoney(downAmount) + ' (' + downPct + '%)';
  monthlyLabel.innerHTML = formatMoney(monthlyPayment) + ' <span class="per-month">/ mes</span>';

  const bPrice = document.getElementById('breakdown-price');
  const bDown = document.getElementById('breakdown-down');
  const bPrincipal = document.getElementById('breakdown-principal');
  const bTerm = document.getElementById('breakdown-term');
  const bInterest = document.getElementById('breakdown-interest');
  const bTotal = document.getElementById('breakdown-total');

  if (bPrice) bPrice.textContent = formatMoney(price);
  if (bDown) bDown.textContent = formatMoney(downAmount);
  if (bPrincipal) bPrincipal.textContent = formatMoney(principal);
  if (bTerm) bTerm.textContent = termMonths + ' meses';
  if (bInterest) bInterest.textContent = '+' + formatMoney(totalInterest);
  if (bTotal) bTotal.textContent = formatMoney(totalFinanced);
}

// 10. Módulo de Facturación VIP
function initInvoicingModule() {
  const invCarSelect = document.getElementById('inv-car-select');
  const invForm = document.getElementById('new-invoice-form');

  if (invCarSelect) {
    invCarSelect.innerHTML = CARS_DATA.map(c => \`
      <option value="\${c.id}">\${c.name} - \${formatMoney(c.price)}</option>
    \`).join('');
  }

  if (invForm) {
    invForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const buyerName = document.getElementById('inv-buyer-name').value;
      const buyerEmail = document.getElementById('inv-buyer-email').value;
      const carId = document.getElementById('inv-car-select').value;
      const deposit = Number(document.getElementById('inv-deposit').value) || 25000;
      const method = document.getElementById('inv-payment-method').value;

      const car = CARS_DATA.find(c => c.id === carId);
      if (!car) return;

      const newInv = {
        id: 'inv-' + Date.now(),
        invoiceNumber: 'INV-2026-00' + (localInvoices.length + 44),
        date: new Date().toISOString().split('T')[0],
        buyerName,
        buyerEmail,
        carName: car.name,
        carVin: car.vin,
        totalPrice: car.price,
        depositPaid: deposit,
        balanceDue: Math.max(0, car.price - deposit),
        paymentMethod: method
      };

      localInvoices.unshift(newInv);
      renderInvoicesList();
      invForm.reset();
      showActionToast('¡Factura ' + newInv.invoiceNumber + ' generada con éxito!');
    });
  }

  renderInvoicesList();
}

function renderInvoicesList() {
  const container = document.getElementById('invoices-container');
  const badge = document.getElementById('invoices-count-badge');
  if (!container) return;

  if (badge) badge.textContent = localInvoices.length + ' Facturas Activas';

  container.innerHTML = localInvoices.map(inv => \`
    <div class="invoice-card">
      <div class="invoice-card-header">
        <span class="invoice-number">\${inv.invoiceNumber}</span>
        <span class="invoice-date">\${inv.date}</span>
      </div>
      <div class="invoice-car">\${inv.carName}</div>
      <div class="invoice-buyer">\${inv.buyerName} • \${inv.buyerEmail}</div>
      <div class="invoice-financials">
        <div>
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">Depósito Abonado</span>
          <span style="font-size: 0.85rem; color: #10b981; font-weight: 700;">\${formatMoney(inv.depositPaid)}</span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">Balance Pendiente</span>
          <span style="font-size: 0.85rem; color: var(--gold-primary); font-weight: 700;">\${formatMoney(inv.balanceDue)}</span>
        </div>
      </div>
    </div>
  \`).join('');
}

// 11. Asistente Virtual Concierge Offline (Widget Flotante Esquina Inferior Derecha)
function initConciergeChat() {
  const toggleBtn = document.getElementById('chat-toggle-btn');
  const closeBtn = document.getElementById('chat-close-btn');
  const dialog = document.getElementById('chat-dialog');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messagesBox = document.getElementById('chat-messages');

  if (!toggleBtn || !dialog || !messagesBox) return;

  // Toggle abrir / cerrar chat
  toggleBtn.addEventListener('click', () => {
    const isHidden = dialog.style.display === 'none';
    dialog.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      if (messagesBox.children.length === 0) {
        addBotMessage("👋 **¡Bienvenido a Elite Motors Concierge!**\\n\\nSoy su asistente digital privado para la colección exclusiva de **44 superdeportivos**. Puedo brindarle información en tiempo real sobre:\\n- 🏎️ **Vehículos & Especificaciones** (Potencia, motor, 0-100)\\n- 💳 **Requisitos de Financiación** (Tasas desde 4.9%)\\n- 📦 **Disponibilidad de Stock & Reservas**\\n\\n¿En qué pieza de la colección tiene interés hoy?");
      }
      setTimeout(() => input?.focus(), 100);
    }
  });

  closeBtn?.addEventListener('click', () => {
    dialog.style.display = 'none';
  });

  // Botones de consulta rápida superior (3 categorías)
  document.querySelectorAll('.chat-fast-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      if (prompt) handleUserQuery(prompt);
    });
  });

  // Chips de preguntas frecuentes inferiores
  document.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query) handleUserQuery(query);
    });
  });

  // Enviar mensaje con formulario
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input?.value?.trim();
    if (query) {
      input.value = '';
      handleUserQuery(query);
    }
  });

  function addUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';
    bubble.textContent = text;
    messagesBox.appendChild(bubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function addBotMessage(markdown) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot';
    // Formateador simple de markdown a HTML
    let html = markdown
      .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
      .replace(/\\n/g, '<br/>');
    bubble.innerHTML = html;
    messagesBox.appendChild(bubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'chat-typing-indicator';
    indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    messagesBox.appendChild(indicator);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  function handleUserQuery(query) {
    addUserMessage(query);
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const reply = generateOfflineConciergeReply(query);
      addBotMessage(reply);
    }, 450);
  }

  // Motor Inteligente de Conocimiento Automotriz Offline
  function generateOfflineConciergeReply(query) {
    const q = query.toLowerCase();

    // 1. Financiación y requisitos
    if (q.includes('financ') || q.includes('requisito') || q.includes('cuota') || q.includes('tasa') || q.includes('crédito') || q.includes('interés') || q.includes('enganche')) {
      return "💳 **Estructura Financiera VIP Elite Motors**:\\n\\n- **Tasa Anual Preferencial:** Desde 4.9% APR para clientes calificados.\\n- **Pago Inicial / Enganche:** Mínimo recomendado del 20% del valor del vehículo.\\n- **Plazos Flexibles:** De 24 a 84 meses con amortización transparente.\\n\\n**Requisitos de Admisión:**\\n1. Documento de Identidad Oficial (DNI, Pasaporte o Green Card).\\n2. Verificación de fondos o estados bancarios recientes.\\n3. Comprobante de domicilio fiscal.\\n\\n*Puede utilizar el simulador interactivo en la sección **Financiación VIP** para calcular su cuota exacta al instante.*";
    }

    // 2. Reserva o apartado de vehículo
    if (q.includes('apartar') || q.includes('reserva') || q.includes('1500') || q.includes('1,500') || q.includes('depósito')) {
      return "🔒 **Política de Bloqueo & Reserva Exclusiva**:\\n\\n- Puede apartar cualquier vehículo del catálogo con un **depósito de cortesía de $1,500 USD**.\\n- Este pago congela el vehículo por **14 días naturales**, garantizando que ninguna otra persona pueda adquirirlo.\\n- Depósito 100% acreditable al balance final o reembolsable si el vehículo no supera su inspección presencial.\\n\\n*Métodos aceptados: Tarjeta VIP, Transferencia Swift y Criptoactivos (USDT / BTC).*";
    }

    // 3. Vehículo más rápido
    if (q.includes('rápido') || q.includes('velocidad') || q.includes('0 a 100') || q.includes('top speed') || q.includes('aceler')) {
      return "⚡ **Líderes de Desempeño en Stock**:\\n\\n1. **Koenigsegg Jesko Attack:** 1,600 CV • 0-100 en **2.5s** • Vel. Máx: **480 km/h** ($3,400,000 USD)\\n2. **Bugatti Chiron Pur Sport:** 1,500 CV • 0-100 en **2.4s** • Vel. Máx: **420 km/h** ($3,200,000 USD)\\n3. **Porsche 911 GT3 RS Weissach:** 525 CV Atmosférico • 0-100 en **3.2s** ($245,000 USD)\\n4. **Nissan GT-R Nismo (R35):** 600 CV AWD • 0-100 en **2.7s** ($178,000 USD)\\n\\nTodos cuentan con certificado de telemetría y pruebas en pista.";
    }

    // 4. JDM Legends
    if (q.includes('jdm') || q.includes('japón') || q.includes('skyline') || q.includes('supra') || q.includes('rx7') || q.includes('rx-7') || q.includes('nsx')) {
      return "🇯🇵 **Colección JDM Legends (10 Vehículos en Stock)**:\\n\\n- **Nissan Skyline GT-R V-Spec II (R34):** 2.6L RB26DETT • 327 CV • Midnight Purple III ($115,000 USD)\\n- **Toyota Supra RZ Turbo (MK4):** 3.0L 2JZ-GTE • 330 CV • Super White ($95,000 USD)\\n- **Mazda RX-7 Spirit R Type-A (FD3S):** 1.3L Rotativo 13B-REW • 280 CV ($78,000 USD)\\n- **Honda NSX-R (NA2):** 3.2L V6 VTEC Atmosférico • 290 CV ($185,000 USD)\\n- **Subaru Impreza 22B STi:** 2.2L Turbo Boxer • 280 CV ($145,000 USD)\\n\\n*Todos con exportación legal y documentación original verificada en Japón.*";
    }

    // 5. American Muscle
    if (q.includes('muscle') || q.includes('mustang') || q.includes('hellcat') || q.includes('viper') || q.includes('corvette') || q.includes('camaro')) {
      return "🇺🇸 **Colección American Muscle & V8 (9 Vehículos)**:\\n\\n- **Dodge Viper ACR Extreme Aero:** 8.4L V10 • 645 CV ($175,000 USD)\\n- **Ford GT Gulf Heritage:** 5.4L Supercharged V8 • 550 CV ($285,000 USD)\\n- **Dodge Challenger SRT Hellcat Redeye:** 6.2L Hemi Supercharged • 797 CV ($88,000 USD)\\n- **Chevrolet Corvette Z06 C8:** 5.5L Flat-Plane V8 • 670 CV ($128,000 USD)\\n- **Shelby Cobra 427 S/C:** 7.0L Big Block V8 • 485 CV ($210,000 USD)";
    }

    // 6. European GT & Italian Exotics
    if (q.includes('porsche') || q.includes('ferrari') || q.includes('lamborghini') || q.includes('bmw') || q.includes('gt3')) {
      return "🇮🇹🇩🇪 **European GT & Italian Exotics Destacados**:\\n\\n- **Porsche 911 GT3 RS (992):** 4.0L Boxer 6 Atmosférico • 525 CV ($245,000 USD)\\n- **Ferrari 488 Pista:** 3.9L Biturbo V8 • 720 CV ($265,000 USD)\\n- **Ferrari 812 Superfast:** 6.5L V12 Atmosférico • 800 CV ($295,000 USD)\\n- **Lamborghini Aventador SVJ:** 6.5L V12 • 770 CV ($310,000 USD)\\n- **BMW M3 E46 CSL:** 3.2L S54 • 360 CV Carbono ($98,000 USD)\\n\\n*Disponibles para prueba estática o inspección en nuestros Showrooms de Miami, Madrid y Tokyo.*";
    }

    // 7. Autos accesibles (<$75k)
    if (q.includes('barato') || q.includes('económico') || q.includes('menos de') || q.includes('menor precio')) {
      return "💎 **Opciones de Entrada a la Colección (Menos de $80,000 USD)**:\\n\\n- **Abarth 695 Biposto Record:** 1.4L Turbo • 190 CV ($48,000 USD)\\n- **Toyota GR Yaris Circuit Pack:** 1.6L Turbo AWD • 261 CV ($54,000 USD)\\n- **Honda S2000 CR Club Racer:** 2.2L VTEC • 240 CV ($68,000 USD)\\n- **Mazda RX-7 Spirit R:** 1.3L Twin Rotativo • 280 CV ($78,000 USD)\\n\\n*Todos aptos para financiación VIP con cuotas desde $850 USD/mes.*";
    }

    // Coincidencia con nombre o marca de auto
    const matchedCar = CARS_DATA.find(c =>
      q.includes(c.brand.toLowerCase()) ||
      q.includes(c.model.toLowerCase()) ||
      q.includes(c.name.toLowerCase())
    );

    if (matchedCar) {
      return \`🏎️ **\${matchedCar.name}** (\${matchedCar.year})\\n\\n- **Precio Oficial:** \${formatMoney(matchedCar.price)}\\n- **Motor:** \${matchedCar.engine} (\${matchedCar.horsepower} CV)\\n- **Desempeño:** 0-100 en \${matchedCar.acceleration}s • Vel. Máx: \${matchedCar.topSpeed} km/h\\n- **Transmisión:** \${matchedCar.transmission}\\n- **Kilometraje:** \${Number(matchedCar.mileage).toLocaleString()} km certificados\\n- **VIN:** \`\${matchedCar.vin}\`\\n\\n*Estado: Disponible para entrega inmediata. Puede abrir su Ficha Técnica o pulsar 'Financiar' para ver la amortización.* \`;
    }

    // Respuesta general de concierge
    return "🛎️ **Concierge Elite Motors**:\\n\\nDisponemos de **44 superdeportivos exclusivos** divididos en 5 categorías de prestigio: *JDM Legends, American Muscle, European GT, Italian Exotic e Hypercars*.\\n\\n¿Desea información sobre algún modelo en particular, detalles de la financiación al 4.9% o los requisitos para reservar su unidad?";
  }
}

// 12. Inicialización General al Cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  renderPriceChart();
  renderCarsGrid();
  initFinancingModule();
  initInvoicingModule();
  initConciergeChat();

  // Búsqueda en tiempo real
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('search-clear-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchQuery.length > 0 ? 'inline-block' : 'none';
      }
      renderCarsGrid();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      currentSearchQuery = '';
      if (searchInput) searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      renderCarsGrid();
    });
  }

  // Chips de sugerencia rápida
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSearchQuery = btn.getAttribute('data-query');
      if (searchInput) searchInput.value = currentSearchQuery;
      if (clearSearchBtn) clearSearchBtn.style.display = currentSearchQuery ? 'inline-block' : 'none';
      renderCarsGrid();
    });
  });

  // Filtros por Origen
  document.querySelectorAll('.origin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.origin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentOrigin = tab.getAttribute('data-origin');
      renderCarsGrid();
    });
  });

  // Selector de Ordenamiento
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSortBy = e.target.value;
      renderCarsGrid();
    });
  }

  // Botón Limpiar Filtro de Precio
  const clearPriceFilterBtn = document.getElementById('clear-price-filter-btn');
  if (clearPriceFilterBtn) {
    clearPriceFilterBtn.addEventListener('click', () => {
      currentPriceBracket = null;
      renderPriceChart();
      renderCarsGrid();
    });
  }

  // Cierre de modal con botón y tecla Escape
  document.getElementById('modal-close-btn')?.addEventListener('click', closeCarDetailModal);
  document.getElementById('car-detail-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'car-detail-modal') closeCarDetailModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCarDetailModal();
  });

  console.log('Elite Motors Web Application Engine v2.0 Cargado con éxito: 44 superdeportivos, audio sintetizado, asistente offline y soporte autónomo.');
});
`;
}

/**
 * Generates an all-in-one, completely standalone single HTML file
 * with CSS and JavaScript embedded so it runs anywhere with a simple double-click!
 */
export function getStandaloneSingleHtmlExport(): string {
  const html = getHtmlExport();
  const css = getCssExport();
  const js = getJsExport();

  // Replace external css and js links with embedded tags
  let standalone = html.replace(
    '<link rel="stylesheet" href="styles.css" />',
    `<style>\n${css}\n</style>`
  );

  standalone = standalone.replace(
    '<script src="app.js"></script>',
    `<script>\n${js}\n</script>`
  );

  return standalone;
}

/**
 * Generates the full database JSON export (Firestore collections & config)
 */
export function getDatabaseJsonExport(invoices: Invoice[]): string {
  const dbExport = {
    meta: {
      engine: 'Cloud Firestore Enterprise',
      databaseId: 'ai-studio-elitemotorsconce-21a8220b-6591-4f01-97d7-5c5eca3f449d',
      region: 'us-east1',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      totalCars: CARS_DATA.length,
      totalInvoices: invoices.length,
    },
    collections: {
      cars: CARS_DATA.map((c) => ({
        id: c.id,
        name: c.name,
        brand: c.brand,
        model: c.model,
        year: c.year,
        price: c.price,
        origin: c.origin,
        originLabel: c.originLabel,
        originCountry: c.originCountry,
        engine: c.engine,
        engineType: c.engineType,
        horsepower: c.horsepower,
        torque: c.torque,
        acceleration: c.acceleration,
        topSpeed: c.topSpeed,
        transmission: c.transmission,
        drivetrain: c.drivetrain,
        mileage: c.mileage,
        exteriorColor: c.exteriorColor,
        interiorColor: c.interiorColor,
        vin: c.vin,
        imageFilename: getCarImageFilename(c.id, c.image),
        audioSoundType: c.audioSoundType,
        description: c.description,
        highlights: c.highlights,
        inStock: c.inStock,
        featured: c.featured,
      })),
      invoices: invoices,
      users: [
        {
          uid: 'usr-client-01',
          displayName: 'Alexander Von Roth',
          email: 'roth.holdings@geneva-capital.ch',
          phone: '+41 22 819 9000',
          tier: 'Platinum Private Collector',
          vipDiscountPercent: 5,
          updatedAt: '2026-10-10T10:00:00Z',
        },
        {
          uid: 'usr-client-02',
          displayName: 'Beatriz Montero de Alba',
          email: 'b.montero@luxurylaw.es',
          phone: '+34 91 555 4321',
          tier: 'VIP Concierge Elite',
          vipDiscountPercent: 3,
          updatedAt: '2026-10-12T14:30:00Z',
        },
      ],
    },
  };

  return JSON.stringify(dbExport, null, 2);
}

/**
 * Generates the relational SQL database export (PostgreSQL, MySQL, SQLite compatible)
 */
export function getDatabaseSqlExport(invoices: Invoice[]): string {
  const carsInsertValues = CARS_DATA.map((c) => {
    const escName = c.name.replace(/'/g, "''");
    const escBrand = c.brand.replace(/'/g, "''");
    const escModel = c.model.replace(/'/g, "''");
    const escEngine = c.engine.replace(/'/g, "''");
    const escTrans = c.transmission.replace(/'/g, "''");
    const escImage = getCarImageFilename(c.id, c.image).replace(/'/g, "''");
    return `('${c.id}', '${escName}', '${escBrand}', '${escModel}', ${c.year}, ${c.price}, '${c.origin}', '${escEngine}', ${c.horsepower}, ${c.acceleration}, ${c.topSpeed}, '${escTrans}', '${c.vin}', '${escImage}', ${c.inStock ? 'TRUE' : 'FALSE'}, ${c.featured ? 'TRUE' : 'FALSE'})`;
  }).join(',\n');

  const invoicesInsertValues = invoices.length > 0 ? invoices.map((inv) => {
    const escBuyer = inv.buyerName.replace(/'/g, "''");
    const escEmail = inv.buyerEmail.replace(/'/g, "''");
    const escCar = inv.carName.replace(/'/g, "''");
    const escMethod = inv.paymentMethod.replace(/'/g, "''");
    return `('${inv.id}', '${inv.invoiceNumber}', '${inv.date}', '${escBuyer}', '${escEmail}', '${escCar}', '${inv.carVin}', ${inv.totalPrice}, ${inv.depositPaid}, ${inv.balanceDue}, '${escMethod}')`;
  }).join(',\n') : '';

  return `-- ============================================================
-- ELITE MOTORS CONCIERGE - ESQUEMA DE BASE DE DATOS RELACIONAL
-- Compatible con PostgreSQL 14+, MySQL 8.0+ y SQLite 3
-- Total de vehículos en catálogo: ${CARS_DATA.length}
-- ============================================================

CREATE TABLE IF NOT EXISTS cars (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  origin VARCHAR(50) NOT NULL,
  engine VARCHAR(255) NOT NULL,
  horsepower INT NOT NULL,
  acceleration NUMERIC(4, 2) NOT NULL,
  top_speed INT NOT NULL,
  transmission VARCHAR(100) NOT NULL,
  vin VARCHAR(64) UNIQUE NOT NULL,
  image_filename VARCHAR(255) NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(64) PRIMARY KEY,
  invoice_number VARCHAR(64) UNIQUE NOT NULL,
  date DATE NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  car_name VARCHAR(255) NOT NULL,
  car_vin VARCHAR(64) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  deposit_paid NUMERIC(12, 2) NOT NULL,
  balance_due NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(64) PRIMARY KEY,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  tier VARCHAR(100) DEFAULT 'VIP Collector',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSERCIÓN DE LOS 44 SUPERDEPORTIVOS EN STOCK
INSERT INTO cars (id, name, brand, model, year, price, origin, engine, horsepower, acceleration, top_speed, transmission, vin, image_filename, in_stock, featured)
VALUES
${carsInsertValues}
ON CONFLICT (id) DO NOTHING;

${invoicesInsertValues ? `-- INSERCIÓN DE FACTURAS REGISTRADAS
INSERT INTO invoices (id, invoice_number, date, buyer_name, buyer_email, car_name, car_vin, total_price, deposit_paid, balance_due, payment_method)
VALUES
${invoicesInsertValues}
ON CONFLICT (id) DO NOTHING;` : ''}

-- INSERCIÓN DE USUARIOS VIP
INSERT INTO users (uid, display_name, email, phone, tier)
VALUES
('usr-client-01', 'Alexander Von Roth', 'roth.holdings@geneva-capital.ch', '+41 22 819 9000', 'Platinum Private Collector'),
('usr-client-02', 'Beatriz Montero de Alba', 'b.montero@luxurylaw.es', '+34 91 555 4321', 'VIP Concierge Elite')
ON CONFLICT (uid) DO NOTHING;
`;
}

/**
 * Detailed Readme in Markdown for the complete project
 */
function getReadmeMarkdown(): string {
  return `# Elite Motors Concierge - Paquete Completo de Proyecto

Este archivo ZIP contiene la implementación integral del concesionario digital **Elite Motors**, preparado para su ejecución **100% autónoma y sin conexión a internet**:

## 1. Aplicación Web Standalone (Listo para Ejecutar con Doble Clic)
- **\`index.html\`**: Página web completa y responsiva. Puedes hacer doble clic y abrirla directamente en cualquier navegador (Google Chrome, Firefox, Safari, Edge).
- **\`index-standalone.html\`**: Versión todo-en-uno que incluye los estilos y scripts integrados internamente.
- **\`styles.css\`**: Hoja de estilos con arquitectura de diseño Dark Luxury, paleta dorada (\`#e5b869\`) y componentes optimizados.
- **\`app.js\`**: Motor JavaScript interactivo con:
  - **Catálogo de 44 Superdeportivos**: Modelos reales con fotografías en alta definición ubicadas en la carpeta \`images/\`.
  - **Ficha Técnica Modal**: Ventana emergente con especificaciones mecánicas detalladas, lista de certificación y cotización directa al hacer clic en cualquier vehículo.
  - **Buscador Inteligente de Inventario**: Filtrado en tiempo real por marca, modelo, categoría (JDM, Muscle, European GT, Italian Exotic, Hypercars), tipo de motor (V8, V12, Biturbo) y transmisión.
  - **Gráfico de Distribución de Precios**: Visualización interactiva en 5 tramos de precio con estadísticas (Mínimo, Promedio, Máximo) y clic para filtrar.
  - **Simulador Acústico de Motor (Web Audio API)**: Generación de rugidos de motor en tiempo real por síntesis acústica sin necesidad de archivos de audio externos.
  - **Módulo de Financiación VIP**: Calculadora de cuotas mensuales personalizada con plazos de 24 a 84 meses, deslizador de enganche y amortización en tiempo real.
  - **Módulo de Facturación VIP**: Emisión de facturas pro-forma con registro de comprador, depósito y balance pendiente.
  - **Asistente Virtual Concierge Offline (Esquina Inferior Derecha)**: Widget flotante con 3 botones de consulta rápida, preguntas frecuentes y motor de inteligencia automotriz autónomo que responde consultas sobre vehículos, financiación y stock sin necesidad de conexión ni servidores.

## 2. Carpeta de Fotografías (\`images/\`)
Incluye las 45 fotografías en alta resolución de todos los superdeportivos y del showroom. Al descomprimir el ZIP, las imágenes se enlazan automáticamente. En caso de abrir el HTML sin la carpeta de imágenes, el sistema activa un respaldo gráfico vectorial (SVG) que muestra la ficha sin iconos rotos.

## 3. Bases de Datos & Backend
- **\`database.json\`**: Base de datos NoSQL completa con colecciones para Cloud Firestore o MongoDB.
- **\`database.sql\`**: Esquema relacional DDL (CREATE TABLE) e inserciones DML con los 44 vehículos, facturas y usuarios para PostgreSQL, MySQL o SQLite.
- **\`firestore.rules\`**: Reglas de seguridad probadas y desplegadas para Cloud Firestore.
- **\`firebase-blueprint.json\`**: Esquema arquitectónico de entidades de base de datos.
- **\`server.ts\`**: Servidor Express full-stack con proxy para la API de Gemini 3.8 Flash.

## 4. Código Fuente React + TypeScript (\`src/\`)
Suite completa de componentes React y TypeScript para desarrollo con Vite:
- \`src/App.tsx\`
- \`src/components/\` (todos los componentes: buscador, ficha modal, calculadora, facturación, concierge chat, etc.)
- \`src/data/cars.ts\` (colección de los 44 superdeportivos)
- \`package.json\`

© 2026 Elite Motors Concierge. Todos los derechos reservados.
`;
}

/**
 * LEEME.txt informativo en texto plano
 */
function getLeemeText(): string {
  return `====================================================================
ELITE MOTORS - PAQUETE COMPLETO DE ARCHIVOS UNIFICADOS (ZIP)
====================================================================

Este paquete contiene todo lo implementado y actualizado en la web:

1. index.html           -> Aplicación web lista para doble clic y ejecución directa en tu navegador.
2. index-standalone.html-> Versión todo-en-uno con estilos y scripts incluidos en el mismo archivo.
3. styles.css           -> Arquitectura de estilos Dark Luxury y paleta dorada.
4. app.js               -> Motor JavaScript interactivo:
                           - Ficha técnica completa al hacer clic en cualquier vehículo.
                           - Buscador en tiempo real (marca, modelo, tipo de motor, transmisión).
                           - Gráfico de distribución de precios interactivo.
                           - 44 superdeportivos con fotografías en alta resolución.
                           - Generador acústico de rugido de motor (Web Audio API).
                           - Sección de Financiación con cálculo de cuotas en tiempo real.
                           - Facturación VIP y órdenes de compra.
                           - Asistente Concierge IA offline en la esquina inferior derecha.
5. images/              -> Carpeta con las 45 fotografías de vehículos y showroom.
6. database.json        -> Base de datos NoSQL completa (44 autos, facturas, clientes, órdenes).
7. database.sql         -> Base de datos SQL completa con tablas e inserción de todos los vehículos.
8. firestore.rules      -> Reglas de seguridad para Firebase Firestore.
9. server.ts            -> Servidor backend para Node.js / Express con Gemini API.
10. src/                -> Código fuente completo en React + TypeScript y componentes Vite.

© Elite Motors Concierge - Todos los derechos reservados.
`;
}

function getFirestoreRulesFallback(): string {
  return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cars/{carId} { allow read, write: if true; }
    match /invoices/{invoiceId} { allow read, write: if true; }
    match /users/{userId} { allow read, write: if true; }
    match /orders/{orderId} { allow read, write: if true; }
  }
}
`;
}

function getFirebaseBlueprintFallback(): string {
  return JSON.stringify({ version: '1.0', collections: ['cars', 'invoices', 'users', 'orders'] }, null, 2);
}
