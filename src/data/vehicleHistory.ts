import { Car, VehicleHistory, MaintenanceRecord } from '../types';

export const VEHICLE_HISTORIES: Record<string, VehicleHistory> = {
  'nissan-gtr-r34': {
    ownersCount: 1,
    accidentFree: true,
    serviceHistoryComplete: true,
    carfaxVerifiedDate: '12 Septiembre 2024',
    firstRegisteredYear: 2002,
    titleStatus: 'Título Limpio de Exportación (JEVIC Certificado)',
    records: [
      {
        id: 'rec-r34-1',
        date: '14 Mayo 2003',
        mileage: 2150,
        serviceType: 'Inspección Oficial Post-Rodaje (1.000 km)',
        facility: 'Nissan Prince Tokyo Red Stage',
        verified: true,
        notes: 'Sustitución de aceite Motul 300V Competition y filtro de aceite de fábrica. Telemetría de turbos Garrett verificada.'
      },
      {
        id: 'rec-r34-2',
        date: '22 Octubre 2009',
        mileage: 14200,
        serviceType: 'Inspección Shaken Mayor Bianual',
        facility: 'Nissan Prince Kanagawa Central',
        verified: true,
        notes: 'Mantenimiento del sistema de tracción integral ATTESA E-TS Pro y diferencial trasero activo. Sustitución de bujías NGK Iridium.'
      },
      {
        id: 'rec-r34-3',
        date: '18 Noviembre 2018',
        mileage: 22800,
        serviceType: 'Programa Nismo Heritage Restoration',
        facility: 'Omori Factory Nismo Yokohama',
        verified: true,
        notes: 'Sustitución preventiva de manguitos de refrigeración de silicona Nismo, retenes de árbol de levas y bomba de combustible de alta presión.'
      },
      {
        id: 'rec-r34-4',
        date: '04 Julio 2024',
        mileage: 28350,
        serviceType: 'Certificación 150 Puntos & Prueba de Compresión',
        facility: 'Elite Motors Concierge Hub Tokio',
        verified: true,
        notes: 'Compresión de cilindros: 11.9, 11.8, 11.9, 11.9, 11.8, 11.9 bar. Grosor de pintura verificado uniforme 120-135 micras.'
      }
    ]
  },
  'toyota-supra-mk4': {
    ownersCount: 1,
    accidentFree: true,
    serviceHistoryComplete: true,
    carfaxVerifiedDate: '02 Agosto 2024',
    firstRegisteredYear: 1998,
    titleStatus: 'Título de Colección Original Japonés',
    records: [
      {
        id: 'rec-supra-1',
        date: '10 Noviembre 1999',
        mileage: 3200,
        serviceType: 'Primer Servicio Anual Toyota Genuine',
        facility: 'Netz Toyota Nagoya Central',
        verified: true,
        notes: 'Cambio de aceite Castrol RS 10W-60 y chequeo de presión de soplado de turbocompresores gemelos secuenciales.'
      },
      {
        id: 'rec-supra-2',
        date: '15 Junio 2011',
        mileage: 24100,
        serviceType: 'Mantenimiento Mayor de Tren Motriz',
        facility: 'Toyota Heritage Center Aichi',
        verified: true,
        notes: 'Sustitución de líquido de caja Getrag V160 (aceite ATF D-II oficial) y valvulina de diferencial Torsen LSD.'
      },
      {
        id: 'rec-supra-3',
        date: '05 Septiembre 2020',
        mileage: 36000,
        serviceType: 'Correa de Distribución & Bomba de Agua 2JZ',
        facility: 'HKS Kansai Service Lab',
        verified: true,
        notes: 'Sustitución de kit completo de distribución original Toyota OEM 2JZ-GTE, tensores hidráulicos y correa auxiliar.'
      },
      {
        id: 'rec-supra-4',
        date: '28 Marzo 2024',
        mileage: 39420,
        serviceType: 'Inspección de Autenticidad Estructural',
        facility: 'Elite Motors Concierge Hub Tokio',
        verified: true,
        notes: 'Verificación de tornillería de aletas original sin marcas de llave. Sellado de lunas y paneles de fábrica 100% intactos.'
      }
    ]
  },
  'ferrari-458-italia': {
    ownersCount: 1,
    accidentFree: true,
    serviceHistoryComplete: true,
    carfaxVerifiedDate: '15 Julio 2024',
    firstRegisteredYear: 2014,
    titleStatus: 'Título Limpio Europeo (Libro Ferrari Sellado)',
    records: [
      {
        id: 'rec-458-1',
        date: '12 Septiembre 2015',
        mileage: 4100,
        serviceType: 'Ferrari Genuine Maintenance 1º Año',
        facility: 'Rossocorsa Milano Concessionaria Ufficiale',
        verified: true,
        notes: 'Cambio de lubricante Shell Helix Ultra 5W-40 Ferrari Spec, filtro de aceite y actualización de software de caja F1 dual-clutch.'
      },
      {
        id: 'rec-458-2',
        date: '20 Octubre 2018',
        mileage: 10400,
        serviceType: 'Mantenimiento Mayor de Bujías & Frenos CCM',
        facility: 'Santogal Ferrari Madrid',
        verified: true,
        notes: 'Sustitución de bujías NGK Laser Iridium. Diagnóstico de discos carbonocerámicos CCM: desgaste 7% eje delantero, 5% eje trasero.'
      },
      {
        id: 'rec-458-3',
        date: '14 Mayo 2021',
        mileage: 15200,
        serviceType: 'Inspección 7º Año Ferrari Classiche',
        facility: 'Maranello Factory Assistance',
        verified: true,
        notes: 'Sustitución de correa auxiliar, líquidos de frenos DOT 5.1 racing y refrigerante motor. Diagnóstico E-Diff3 sin fallos.'
      },
      {
        id: 'rec-458-4',
        date: '10 Enero 2024',
        mileage: 18350,
        serviceType: 'Certificación 150 Puntos Elite Motors',
        facility: 'Elite Motors Concierge Madrid',
        verified: true,
        notes: 'Montaje de juego nuevo de neumáticos Michelin Pilot Sport Cup 2 Marcaje K1 Ferrari y equilibrado láser dinámico.'
      }
    ]
  },
  'porsche-911-turbo-s': {
    ownersCount: 1,
    accidentFree: true,
    serviceHistoryComplete: true,
    carfaxVerifiedDate: '01 Septiembre 2024',
    firstRegisteredYear: 2023,
    titleStatus: 'Título Oficial Porsche Approved',
    records: [
      {
        id: 'rec-992-1',
        date: '18 Agosto 2023',
        mileage: 2800,
        serviceType: 'Servicio de Intermedio de Rodaje Porsche',
        facility: 'Porsche Zentrum Stuttgart-Zuffenhausen',
        verified: true,
        notes: 'Vaciado de aceite Mobil 1 ESP x3 0W-40 de rodaje y filtro de aceite. Comprobación de turbos VTG y válvula de descarga.'
      },
      {
        id: 'rec-992-2',
        date: '14 Febrero 2024',
        mileage: 6200,
        serviceType: 'Inspección Menor Anual Oficial',
        facility: 'Porsche Center Madrid Norte',
        verified: true,
        notes: 'Sustitución de filtro de polen y carbón activo, purgado de líquido de frenos cerámicos PCCB y comprobación de sistema PASM.'
      },
      {
        id: 'rec-992-3',
        date: '11 Agosto 2024',
        mileage: 7280,
        serviceType: 'Lectura de Telemetría DME y Sobre-régimen',
        facility: 'Elite Motors Concierge Madrid',
        verified: true,
        notes: 'Reporte de sobre-régimen en centralita DME: Rango 1 = 0 encendidos, Rango 2 = 0 encendidos. Motor en estado estricto de colección.'
      }
    ]
  },
  'ford-shelby-gt500': {
    ownersCount: 1,
    accidentFree: true,
    serviceHistoryComplete: true,
    carfaxVerifiedDate: '20 Junio 2024',
    firstRegisteredYear: 2022,
    titleStatus: 'Certificado de Título Limpio Florida (USA)',
    records: [
      {
        id: 'rec-gt500-1',
        date: '15 Octubre 2022',
        mileage: 1800,
        serviceType: 'Ford Performance Break-In Service',
        facility: 'Al Packer Ford West Palm Beach, FL',
        verified: true,
        notes: 'Cambio de lubricante Motorcraft 5W-50 Full Synthetic y filtro de aceite de alto caudal. Apriete dinamométrico de llantas de carbono.'
      },
      {
        id: 'rec-gt500-2',
        date: '12 Mayo 2023',
        mileage: 4400,
        serviceType: 'Servicio de Supercargador & Diferencial Torsen',
        facility: 'Galpin Auto Sports Performance Lab',
        verified: true,
        notes: 'Inspección de polea y correa de compresor Eaton TVS 2.65L. Sustitución de lubricante sintético 75W-140 de diferencial.'
      },
      {
        id: 'rec-gt500-3',
        date: '18 Abril 2024',
        mileage: 6150,
        serviceType: 'Inspección 150 Puntos Pre-Exportación',
        facility: 'Elite Motors Concierge Miami',
        verified: true,
        notes: 'Chequeo de pastillas Brembo con espesor del 92%. Alabeo de discos de freno dentro de tolerancia micrométrica de fábrica.'
      }
    ]
  },
  'lamborghini-huracan': {
    ownersCount: 1,
    accidentFree: true,
    serviceHistoryComplete: true,
    carfaxVerifiedDate: '10 Julio 2024',
    firstRegisteredYear: 2022,
    titleStatus: 'Certificado Lamborghini Selezione Oficial',
    records: [
      {
        id: 'rec-hura-1',
        date: '25 Noviembre 2022',
        mileage: 3100,
        serviceType: 'Lamborghini First Scheduled Service',
        facility: 'Prestige Imports Lamborghini Miami',
        verified: true,
        notes: 'Sustitución de lubricante Castrol Edge Supercar 10W-60 y filtros. Calibración de software de eje trasero direccional y sistema LDVI.'
      },
      {
        id: 'rec-hura-2',
        date: '14 Diciembre 2023',
        mileage: 7800,
        serviceType: 'Inspección Mayor 2º Año Sant’Agata',
        facility: 'Lamborghini Madrid Service Center',
        verified: true,
        notes: 'Sustitución de líquido de elevación hidráulica de eje delantero (Front Lift), bujías OEM y test de diagnóstico ODIS de tracción integral.'
      },
      {
        id: 'rec-hura-3',
        date: '20 Mayo 2024',
        mileage: 9050,
        serviceType: 'Certificación Integral de Pista & Póliza Elite',
        facility: 'Elite Motors Concierge Madrid',
        verified: true,
        notes: 'Estado de discos cerámicos al 96% de vida útil. Ningún código de avería activo en centralitas de motor o cambio LDF.'
      }
    ]
  },
  'bmw-m3-e46': {
    ownersCount: 2,
    accidentFree: true,
    serviceHistoryComplete: true,
    carfaxVerifiedDate: '18 Marzo 2024',
    firstRegisteredYear: 2005,
    titleStatus: 'Título Histórico Alemán (TÜV Sello Vigente)',
    records: [
      {
        id: 'rec-m3-1',
        date: '05 Junio 2005',
        mileage: 2000,
        serviceType: 'Inspección de Rodaje M Power (Einfahrkontrolle)',
        facility: 'BMW Niederlassung München',
        verified: true,
        notes: 'Sustitución obligatoria de aceite de rodaje de motor (Castrol TWS 10W-60) y diferencial autoblocante M con aditivo FM.'
      },
      {
        id: 'rec-m3-2',
        date: '22 Abril 2015',
        mileage: 48000,
        serviceType: 'Cojinetes de Biela & VANOS Preventivo',
        facility: 'Schmiedmann M Specialist Center',
        verified: true,
        notes: 'Sustitución preventiva de cojinetes de biela con casquillos WPC tratados y tornillos ARP. Reconstrucción completa de solenoide VANOS Beisan Systems.'
      },
      {
        id: 'rec-m3-3',
        date: '12 Septiembre 2021',
        mileage: 59400,
        serviceType: 'Refuerzo de Subchasis Trasero & Silentblocks',
        facility: 'Ring Police Performance Garage',
        verified: true,
        notes: 'Instalación de placas de refuerzo estructural en anclajes de subchasis trasero y silentblocks de poliuretano Powerflex Black Series.'
      },
      {
        id: 'rec-m3-4',
        date: '02 Febrero 2024',
        mileage: 63900,
        serviceType: 'Inspección 150 Puntos & Ajuste de Válvulas S54',
        facility: 'Elite Motors Concierge Madrid',
        verified: true,
        notes: 'Ajuste micrométrico de taqués de las 24 válvulas. Presión de compresión promedio: 12.1 bar en todos los cilindros.'
      }
    ]
  }
};

/**
 * Returns either the predefined history or a realistic generated history
 * matching the car's provenance, mileage, and year.
 */
export function getCarHistory(car: Car): VehicleHistory {
  if (VEHICLE_HISTORIES[car.id]) {
    return VEHICLE_HISTORIES[car.id];
  }

  // Realistic fallback generated according to car specifications
  const isOlder = car.year < 2010;
  const owners = isOlder ? 2 : 1;

  return {
    ownersCount: owners,
    accidentFree: true,
    serviceHistoryComplete: true,
    carfaxVerifiedDate: '15 Agosto 2024',
    firstRegisteredYear: car.year,
    titleStatus: `Título Limpio Oficial (${car.originCountry})`,
    records: [
      {
        id: `rec-${car.id}-1`,
        date: `10 Noviembre ${car.year + 1}`,
        mileage: Math.round(car.mileage * 0.15),
        serviceType: 'Inspección Inicial de Rodaje & Cambio de Fluidos',
        facility: `Concesionario Oficial ${car.brand}`,
        verified: true,
        notes: 'Mantenimiento preventivo según libro de servicio oficial. Sin incidencias mecánicas reportadas.'
      },
      {
        id: `rec-${car.id}-2`,
        date: `15 Junio ${Math.min(2022, car.year + 4)}`,
        mileage: Math.round(car.mileage * 0.6),
        serviceType: 'Mantenimiento Mayor Bianual de Transmisión & Frenos',
        facility: `Centro Autorizado ${car.brand} Performance`,
        verified: true,
        notes: 'Sustitución de filtros de habitáculo, bujías de alto rendimiento y líquido de frenos DOT 5.1.'
      },
      {
        id: `rec-${car.id}-3`,
        date: '10 Julio 2024',
        mileage: car.mileage,
        serviceType: 'Certificación 150 Puntos Elite Motors & Historial Carfax',
        facility: 'Elite Motors Concierge Hub',
        verified: true,
        notes: 'Verificación de kilometraje real en centralita de motor y diagnosis completa libre de fallos.'
      }
    ]
  };
}
