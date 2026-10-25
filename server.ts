import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Ensure HMR is disabled in dev environment per system guidelines
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Load the catalog summary into memory for context grounding
let carsCatalog: any[] = [];
let carsCatalogSummary = '';
try {
  const catalogPath = path.join(__dirname, 'src', 'data', 'carsCatalogData.json');
  if (fs.existsSync(catalogPath)) {
    const raw = fs.readFileSync(catalogPath, 'utf8');
    carsCatalog = JSON.parse(raw);
    carsCatalogSummary = carsCatalog
      .map(
        (c: any) =>
          `• ${c.name} (${c.year}) - Marca: ${c.brand} | Origen: ${c.originLabel} | Precio: $${Number(c.price).toLocaleString()} USD | Motor: ${c.engine} | Potencia: ${c.horsepower} CV | 0-100: ${c.acceleration}s | Vel. Máx: ${c.topSpeed} km/h | Transmisión: ${c.transmission} | Tracción: ${c.drivetrain} | KM: ${c.mileage.toLocaleString()} km | Stock: ${c.inStock ? 'Disponible' : 'Agotado'} | VIN: ${c.vin}`
      )
      .join('\n');
  }
} catch (e) {
  console.warn('Could not read carsCatalogData.json:', e);
}

const SYSTEM_INSTRUCTION = `Eres el Concierge y Asesor Digital VIP de "Elite Motors", el concesionario más exclusivo de superdeportivos y autos clásicos de colección (JDM Legends, American Muscle, European GT, Italian Exotic y Hypercars).

Tus responsabilidades principales son:
1. CONSULTAS DE VEHÍCULOS: Responder con precisión sobre las especificaciones mecánicas, motorización, caballos de fuerza (CV/HP), aceleración 0-100 km/h, velocidad tope, transmisión, año, precio en USD y número de bastidor (VIN).
2. REQUISITOS Y PLANES DE FINANCIACIÓN:
   - Planes de crédito privado y leasing automotriz para coleccionistas.
   - Pago inicial (enganche): Mínimo 10% hasta 50% (recomendamos 20%).
   - Plazos de pago: 12, 24, 36, 48, 60, 72 y 84 meses.
   - Tasas de interés anual (APR fija): 4.9% (Clientes VIP Private Collector), 5.4% (Preferencial Deportivos), 6.5% (Estándar).
   - Requisitos: Identificación oficial vigente (o pasaporte diplomático/internacional), comprobante de solvencia financiera o estados de cuenta bancarios, y completar el formulario de solicitud en la sección de Financiación.
   - Si el cliente pregunta una cuota estimada para un auto específico, calcula la cuota mensual aproximada usando la fórmula de amortización bancaria o indícale el valor orientativo.
   - Aceptamos recepción de vehículos de colección como parte de pago (Trade-in) previa tasación pericial.
3. DISPONIBILIDAD DE STOCK & PROCESO DE RESERVA:
   - Tenemos exactamente 44 superdeportivos certificados en inventario con disponibilidad y entrega inmediata.
   - Cada vehículo cuenta con 100% de historial Carfax certificado, cero accidentes reportados y 24 meses de garantía mecánica oficial.
   - El cliente puede apartar o congelar cualquier vehículo en línea con un depósito de reserva inicial de $1,500 USD mediante el botón "Apartar" o con facturación pro-forma personalizada.
   - Métodos de pago aceptados: Transferencia Bancaria Internacional Swift (USD / EUR), Criptoactivos auditados (USDT / BTC Concierge), y Financiación aprobada.
4. SEDES & SHOWROOMS:
   - Miami: 1100 Brickell Bay Dr, Miami, FL 33131 (Tel: +1 305 555-0199).
   - Madrid: Calle de Serrano 48, 28001 Madrid (Tel: +34 91 555 4321).
   - Tokio: 6 Chome Ginza, Chuo City, Tokyo 104-0061 (Tel: +81 3 5555 8899).
   - Atención privada y pruebas de manejo VIP con cita previa.

ESTILO Y TONO:
- Comunícate en español refinado, profesional, cordial y entusiasta por el automovilismo de alto rendimiento.
- Ofrece respuestas concisas, bien estructuradas (puedes usar viñetas y negritas para precios y datos clave).
- Cita los valores exactos de precio en USD y nombres oficiales de los modelos según el catálogo a continuación.

CATÁLOGO ACTUAL DE 44 VEHÍCULOS EN STOCK DE ELITE MOTORS:
${carsCatalogSummary}`;

// Fallback intelligent responder based directly on the validated catalog & financing policies
function generateCatalogKnowledgeResponse(query: string): string {
  const q = query.toLowerCase();

  // 1. Check for specific car match
  const matchedCars = carsCatalog.filter((c) => {
    const searchTerms = [c.name, c.brand, c.model, c.vin].join(' ').toLowerCase();
    return q.split(/\s+/).some((term) => term.length > 2 && searchTerms.includes(term));
  });

  // 2. Financing queries
  if (
    q.includes('financi') ||
    q.includes('requisito') ||
    q.includes('crédito') ||
    q.includes('credito') ||
    q.includes('cuota') ||
    q.includes('interés') ||
    q.includes('interes') ||
    q.includes('tasa') ||
    q.includes('meses') ||
    q.includes('leasing')
  ) {
    let carSpecificFinancing = '';
    if (matchedCars.length > 0) {
      const targetCar = matchedCars[0];
      const down20 = Math.round(targetCar.price * 0.2);
      const principal = targetCar.price - down20;
      const rateMonthly = 0.054 / 12;
      const termMonths = 48;
      const monthlyEst = Math.round(
        (principal * rateMonthly * Math.pow(1 + rateMonthly, termMonths)) /
          (Math.pow(1 + rateMonthly, termMonths) - 1)
      );

      carSpecificFinancing = `\n\n📌 **Estimación para ${targetCar.name} ($${Number(targetCar.price).toLocaleString()} USD):**\n• Pago Inicial sugerido (20%): **$${down20.toLocaleString()} USD**\n• Plazo de 48 meses con tasa preferencial del 5.4% APR: **~$${monthlyEst.toLocaleString()} USD / mes**\n• Puedes personalizar el enganche y plazo en nuestra sección de **Financiación**.`;
    }

    return `En **Elite Motors** ofrecemos planes de crédito privado y leasing a medida para vehículos de alto rendimiento:\n\n• **Pago Inicial:** Desde el 10% hasta el 50% del valor del vehículo (recomendamos un 20%).\n• **Plazos Disponibles:** 12, 24, 36, 48, 60, 72 y 84 meses.\n• **Tasas de Interés Fijas:** 4.9% APR (Clientes VIP Platinum), 5.4% APR (Preferencial Deportivos), 6.5% APR (Estándar).\n• **Requisitos Básicos:**\n  1. Identificación oficial o pasaporte vigente.\n  2. Comprobante de solvencia financiera o estados de cuenta.\n  3. Solicitud de pre-aprobación completada en nuestro portal.\n• **Vehículo como Parte de Pago (Trade-In):** Tasamos tu vehículo de colección actual para abonarlo al enganche.${carSpecificFinancing}`;
  }

  // 3. Stock / Availability queries
  if (
    q.includes('stock') ||
    q.includes('disponib') ||
    q.includes('cuántos') ||
    q.includes('cuantos') ||
    q.includes('inventario') ||
    q.includes('entrega')
  ) {
    return `Actualmente contamos con **44 superdeportivos certificados en stock** para entrega inmediata global, divididos en 5 categorías icónicas:\n\n• **JDM Legends (10 autos):** Skyline GT-R R34, Supra A80, RX-7 Spirit R, NSX-R, LFA Nürburgring, 22B STi, Evo VI Tommi Mäkinen, GT-R Nismo, S2000 CR, GR Yaris.\n• **American Muscle (9 autos):** Shelby GT500, Challenger Hellcat Redeye, Corvette Z06 C8, Viper ACR, Ford GT Gulf, Camaro ZL1 1LE, Shelby Cobra 427, Corvette C2 Split Window, CT5-V Blackwing.\n• **European GT (11 autos):** Porsche 911 Turbo S & GT3 RS, BMW M3 CSL & M4 CSL & M5 CS, AMG GT Black Series, Mercedes 190E Evo II, Audi R8 V10, RS6 GT, Aston Martin DBS 770, Lotus Exige Cup 430.\n• **Italian Exotic (9 autos):** Ferrari 458 Italia, 488 Pista, 812 Superfast, Lamborghini Huracán EVO & Aventador SVJ, Maserati MC20, Alfa Romeo Giulia QV, GranTurismo Trofeo, Abarth 695 Biposto.\n• **Hypercars (5 autos):** Bugatti Chiron Pur Sport, Koenigsegg Jesko Attack, Pagani Huayra BC, McLaren 720S Spider.\n\nTodos cuentan con **inspección técnica de 150 puntos, historial Carfax verificado y 24 meses de garantía oficial**.`;
  }

  // 4. Booking / Apartar queries
  if (q.includes('apartar') || q.includes('reserva') || q.includes('comprar') || q.includes('deposito') || q.includes('depósito')) {
    return `Para asegurar cualquier vehículo de la colección:\n\n1. **Depósito de Apartado Online:** Puedes congelar el auto durante 7 días hábiles con un depósito inicial de **$1,500 USD** desde el botón *"Apartar"* de la ficha técnica.\n2. **Facturación Pro-Forma:** En la sección *"Facturación VIP"*, puedes emitir la orden de compra con balance contable y contrato formal.\n3. **Métodos de Pago Aceptados:**\n   • Transferencia Bancaria Internacional Swift (USD o EUR)\n   • Criptoactivos verificados (USDT / BTC Concierge)\n   • Financiación directa pre-aprobada con entrega blindada a domicilio.`;
  }

  // 5. Specific category queries
  if (q.includes('jdm')) {
    const jdmCars = carsCatalog.filter((c) => c.origin === 'jdm');
    const list = jdmCars.map((c) => `• **${c.name}** ($${Number(c.price).toLocaleString()} USD) - ${c.horsepower} CV | ${c.engine}`).join('\n');
    return `Nuestra colección de **JDM Legends** en stock incluye 10 piezas de colección histórica:\n\n${list}\n\nTodos conservan especificaciones originales y kilometraje certificado.`;
  }

  if (q.includes('muscle') || q.includes('americano')) {
    const muscleCars = carsCatalog.filter((c) => c.origin === 'american');
    const list = muscleCars.map((c) => `• **${c.name}** ($${Number(c.price).toLocaleString()} USD) - ${c.horsepower} CV | ${c.engine}`).join('\n');
    return `Nuestra colección de **American Muscle** incluye 9 íconos de potencia V8:\n\n${list}\n\nTodos cuentan con verificación de chasis y entrega inmediata.`;
  }

  if (q.includes('italian') || q.includes('italiano') || q.includes('ferrari') || q.includes('lamborghini')) {
    const italianCars = carsCatalog.filter((c) => c.origin === 'italian');
    const list = italianCars.map((c) => `• **${c.name}** ($${Number(c.price).toLocaleString()} USD) - ${c.horsepower} CV | ${c.engine}`).join('\n');
    return `Nuestra colección de **Italian Exotics** en stock incluye:\n\n${list}\n\nCon historial de servicio en concesionarios oficiales de Maranello y Sant'Agata.`;
  }

  if (q.includes('hypercar') || q.includes('bugatti') || q.includes('jesko') || q.includes('pagani')) {
    const hyperCars = carsCatalog.filter((c) => c.origin === 'hypercar');
    const list = hyperCars.map((c) => `• **${c.name}** ($${Number(c.price).toLocaleString()} USD) - ${c.horsepower} CV | ${c.engine}`).join('\n');
    return `Nuestra división de **Hypercars** de producción limitada en stock incluye:\n\n${list}\n\nVehículos de museo homologados para calle con entrega privada en cualquier parte del mundo.`;
  }

  // 6. Direct car matches
  if (matchedCars.length > 0) {
    const c = matchedCars[0];
    return `**${c.name} (${c.year})** - En Stock Disponible:\n\n• **Precio Oficial:** $${Number(c.price).toLocaleString()} USD\n• **Motor:** ${c.engine}\n• **Potencia:** ${c.horsepower} CV / HP\n• **Par Motor:** ${c.torque} Nm\n• **Aceleración (0-100 km/h):** ${c.acceleration} segundos\n• **Velocidad Máxima:** ${c.topSpeed} km/h\n• **Transmisión:** ${c.transmission} (${c.drivetrain})\n• **Kilometraje:** ${Number(c.mileage).toLocaleString()} km certificados\n• **Número de Bastidor (VIN):** \`${c.vin}\`\n• **Historial:** 100% Verificado Carfax sin accidentes.\n\n¿Deseas calcular una cuota de financiación o agendar una prueba de manejo VIP para este vehículo?`;
  }

  // General helpful response
  return `Con gusto te asisto. En **Elite Motors** contamos con **44 superdeportivos certificados** en stock:\n\n• **Catálogo:** JDM Legends, American Muscle, European GT, Italian Exotic y Hypercars (con precios lógicos desde $42,000 USD hasta $285,000 USD).\n• **Financiación:** Plazos de 12 a 84 meses, pago inicial desde el 10% y tasas desde el 4.9% APR fija.\n• **Disponibilidad:** 100% de unidades en inventario para entrega inmediata con garantía oficial de 24 meses.\n\n¿Hay algún modelo en particular que te interese o deseas información sobre planes de pago?`;
}

// API Route: Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Elite Motors Concierge API',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Helper to attempt Gemini generation with model fallback on high demand spikes
async function queryGeminiWithFallback(
  formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
): Promise<string | null> {
  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

  for (const model of models) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 3500)
      );

      const geminiPromise = ai.models.generateContent({
        model,
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const response = await Promise.race([geminiPromise, timeoutPromise]);
      if (response && response.text) {
        return response.text;
      }
    } catch (e: any) {
      // If 503 high-demand or transient error, quietly proceed to fallback model
      continue;
    }
  }
  return null;
}

// API Route: Concierge Chat with Gemini & Grounded Catalog Knowledge
app.post('/api/concierge-chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El mensaje es requerido.' });
    }

    if (process.env.GEMINI_API_KEY) {
      const formattedContents: Array<{
        role: 'user' | 'model';
        parts: Array<{ text: string }>;
      }> = [];

      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          if (item.text && (item.role === 'user' || item.role === 'model')) {
            formattedContents.push({
              role: item.role,
              parts: [{ text: item.text }],
            });
          }
        }
      }

      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const geminiText = await queryGeminiWithFallback(formattedContents);
      if (geminiText) {
        return res.json({ reply: geminiText });
      }
    }

    // Serve accurate grounded knowledge response from validated 44-car inventory & financing policy
    const localReply = generateCatalogKnowledgeResponse(message);
    return res.json({ reply: localReply });
  } catch (error: any) {
    console.error('Error handling concierge chat:', error);
    const safeReply = generateCatalogKnowledgeResponse(req.body?.message || '');
    return res.json({ reply: safeReply });
  }
});

// Start Full-Stack Server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite middlewares in development with HMR disabled (environment constraint)
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Elite Motors Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
