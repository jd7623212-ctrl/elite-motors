export type CarOrigin = 'jdm' | 'american' | 'european' | 'italian' | 'hypercar';

export interface MaintenanceRecord {
  id: string;
  date: string;
  mileage: number;
  serviceType: string;
  facility: string;
  verified: boolean;
  notes: string;
}

export interface VehicleHistory {
  ownersCount: number;
  accidentFree: boolean;
  serviceHistoryComplete: boolean;
  carfaxVerifiedDate: string;
  firstRegisteredYear: number;
  titleStatus: string;
  records: MaintenanceRecord[];
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  origin: CarOrigin;
  originLabel: string;
  originCountry: string;
  engine: string;
  engineType: string;
  horsepower: number; // in CV / HP
  torque: number; // in Nm
  acceleration: number; // 0-100 km/h in seconds
  topSpeed: number; // in km/h
  transmission: string;
  drivetrain: 'RWD' | 'AWD' | 'FWD';
  mileage: number; // in km
  exteriorColor: string;
  interiorColor: string;
  vin: string;
  image: string;
  audioSoundType: 'inline6-turbo' | 'v8-muscle' | 'flat6-twin' | 'v10-screamer' | 'v6-biturbo' | 'v12-screamer';
  description: string;
  highlights: string[];
  inStock: boolean;
  featured: boolean;
  history?: VehicleHistory;
}

export interface CartItem {
  car: Car;
  reservationType: 'deposit' | 'full';
  depositAmount: number;
  addedAt: number;
}

export interface FinancingState {
  carPrice: number;
  downPaymentPercent: number;
  termMonths: number;
  interestRate: number; // annual percentage
  tradeInValue: number;
}
