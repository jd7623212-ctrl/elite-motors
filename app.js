/**
 * ============================================================
 * ELITE MOTORS - MOTOR JAVASCRIPT PRINCIPAL (SPA & FIRESTORE)
 * ============================================================
 */

// 1. Catálogo de Vehículos
export const VEHICLES = [
  { id: 'nissan-gtr-r34', name: 'Nissan Skyline GT-R V-Spec II (R34)', brand: 'Nissan', year: 2002, price: 185000, origin: 'jdm', hp: 327, vin: 'BNR34-402819' },
  { id: 'toyota-supra-mk4', name: 'Toyota Supra RZ Twin-Turbo (A80 MK4)', brand: 'Toyota', year: 1998, price: 145000, origin: 'jdm', hp: 330, vin: 'JZA80-008124' },
  { id: 'ford-mustang-shelby-gt500', name: 'Ford Mustang Shelby GT500 Predator', brand: 'Ford', year: 2022, price: 118000, origin: 'american', hp: 760, vin: '1FA6P8SJ4N550189' },
  { id: 'dodge-challenger-hellcat', name: 'Dodge Challenger SRT Hellcat Redeye', brand: 'Dodge', year: 2023, price: 105000, origin: 'american', hp: 797, vin: '2C3CDZL97PH618902' },
  { id: 'porsche-911-turbo-s', name: 'Porsche 911 Turbo S (Generación 992)', brand: 'Porsche', year: 2023, price: 238000, origin: 'european', hp: 650, vin: 'WP0AD2A98PS251904' },
  { id: 'bmw-m3-e46', name: 'BMW M3 Coupe (Generación E46)', brand: 'BMW', year: 2004, price: 79000, origin: 'european', hp: 343, vin: 'WBABL91070JR90124' },
  { id: 'ferrari-458-italia', name: 'Ferrari 458 Italia', brand: 'Ferrari', year: 2014, price: 245000, origin: 'italian', hp: 570, vin: 'ZFF68NHA7E0198240' },
  { id: 'lamborghini-huracan-evo', name: 'Lamborghini Huracán EVO LP 640-4', brand: 'Lamborghini', year: 2022, price: 285000, origin: 'italian', hp: 640, vin: 'ZHWE22ZF1NLA14902' }
];

// 2. Sintetizador de Escape Web Audio API
export class ExhaustAudioEngine {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
  }
  playRev(soundType = 'inline6-turbo') {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = soundType.includes('v8') ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.4);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.25);
  }
}

// 3. Calculadora de Financiación VIP
export function calculateLuxuryLoan({ vehiclePrice, downPayment, months = 36, annualRate = 4.9 }) {
  const principal = Math.max(0, vehiclePrice - downPayment);
  const monthlyRate = (annualRate / 100) / 12;
  const monthlyPayment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) / (Math.pow(1 + monthlyRate, months) - 1);
  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round((monthlyPayment * months) - principal),
    principal
  };
}

// 4. Gestor de Descarga de Archivos
export function downloadProjectFile(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
