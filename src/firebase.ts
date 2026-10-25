import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Car } from './types';
import { Invoice } from './components/InvoicingSection';

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// -------------------------------------------------------------
// FIRESTORE ERROR HANDLING PROTOCOL (SKILL REQUIREMENT)
// -------------------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Test connection on boot per Firebase skill guidelines
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'cars', 'connection_probe'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently offline or connecting...');
    }
    return false;
  }
}

export interface BuyerEvaluationRecord {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity?: string;
  carId: string;
  carName: string;
  carBrand: string;
  carPrice: number;
  depositAmount: number;
  paymentMethod: string;
  reservationCode: string;
  invoiceNumber: string;
  buyerEvaluationStatus: string;
  createdAt: string;
}

// -------------------------------------------------------------
// 1. INVOICES FIRESTORE REPO (CREATE, FETCH, DELETE REAL PERSISTENCE)
// -------------------------------------------------------------

/**
 * Saves or updates an invoice in Firestore collection /invoices
 */
export async function saveInvoiceToFirestore(invoice: Invoice): Promise<boolean> {
  try {
    const docRef = doc(db, 'invoices', invoice.id);
    await setDoc(docRef, {
      ...invoice,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error saving invoice to Firestore:', error);
    return false;
  }
}

/**
 * Fetches all invoices from Firestore collection /invoices
 */
export async function fetchInvoicesFromFirestore(): Promise<Invoice[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'invoices'));
    const invoices: Invoice[] = [];
    querySnapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        invoices.push(docSnap.data() as Invoice);
      }
    });
    return invoices;
  } catch (error) {
    console.warn('Error reading invoices from Firestore (using local fallback):', error);
    return [];
  }
}

/**
 * Deletes an invoice permanently from Firestore collection /invoices
 */
export async function deleteInvoiceFromFirestore(invoiceId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'invoices', invoiceId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting invoice ${invoiceId} from Firestore:`, error);
    return false;
  }
}

// -------------------------------------------------------------
// 2. CARS FIRESTORE REPO (CATALOG PERSISTENCE & SYNC)
// -------------------------------------------------------------

/**
 * Syncs cars catalog to Firestore collection /cars
 */
export async function syncCarsToFirestore(cars: Car[]): Promise<boolean> {
  try {
    for (const car of cars) {
      const docRef = doc(db, 'cars', car.id);
      await setDoc(docRef, car, { merge: true });
    }
    return true;
  } catch (error) {
    console.warn('Error syncing cars to Firestore:', error);
    return false;
  }
}

/**
 * Fetches cars from Firestore collection /cars
 */
export async function fetchCarsFromFirestore(): Promise<Car[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'cars'));
    const cars: Car[] = [];
    querySnapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        cars.push(docSnap.data() as Car);
      }
    });
    return cars;
  } catch (error) {
    console.warn('Error reading cars from Firestore:', error);
    return [];
  }
}

// -------------------------------------------------------------
// 3. USERS / CLIENTS FIRESTORE REPO
// -------------------------------------------------------------

export interface UserProfileDoc {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  tier: string;
  updatedAt: string;
}

export async function saveUserProfileToFirestore(user: UserProfileDoc): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, user, { merge: true });
    return true;
  } catch (error) {
    console.warn('Error saving user profile to Firestore:', error);
    return false;
  }
}

// -------------------------------------------------------------
// 4. BUYER ORDERS FIRESTORE REPO (EVALUATION IN FIREBASE STUDIOS)
// -------------------------------------------------------------

export async function saveBuyerOrderToFirebase(order: BuyerEvaluationRecord): Promise<boolean> {
  try {
    const docRef = doc(db, 'orders', order.orderId);
    await setDoc(docRef, {
      ...order,
      syncedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn('Firebase order sync warning:', error);
    return false;
  }
}
