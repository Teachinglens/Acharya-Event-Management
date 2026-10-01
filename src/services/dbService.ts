import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { SwimmingEvent, Athlete, RegistrationEntry } from '../types';

const EVENTS_COL = 'events';
const ATHLETES_COL = 'athletes';
const REGS_COL = 'registrations';

/**
 * Deep sanitization function to strip any `undefined` properties.
 * Firestore strictly forbids `undefined` field values and will throw an error if present.
 */
export function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Real-time listener for Swimming Events across all devices
 */
export const subscribeEvents = (
  onData: (events: SwimmingEvent[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const colRef = collection(db, EVENTS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: SwimmingEvent[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as SwimmingEvent);
          });
          onData(list);
        } else {
          onData([]);
        }
      },
      (error) => {
        console.error('Error listening to events in Firestore:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to events:', err);
    return () => {};
  }
};

/**
 * Real-time listener for Athletes across all devices
 */
export const subscribeAthletes = (
  onData: (athletes: Athlete[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const colRef = collection(db, ATHLETES_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Athlete[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Athlete);
          });
          onData(list);
        } else {
          onData([]);
        }
      },
      (error) => {
        console.error('Error listening to athletes in Firestore:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to athletes:', err);
    return () => {};
  }
};

/**
 * Real-time listener for Registrations across all devices
 */
export const subscribeRegistrations = (
  onData: (registrations: RegistrationEntry[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const colRef = collection(db, REGS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: RegistrationEntry[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as RegistrationEntry);
          });
          onData(list);
        } else {
          onData([]);
        }
      },
      (error) => {
        console.error('Error listening to registrations in Firestore:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to registrations:', err);
    return () => {};
  }
};

/**
 * Upsert Event to Firestore (syncs to all devices)
 */
export const syncSaveEvent = async (event: SwimmingEvent): Promise<void> => {
  const cleaned = cleanForFirestore(event);
  const docRef = doc(db, EVENTS_COL, event.id);
  await setDoc(docRef, cleaned, { merge: true });
};

/**
 * Bulk save all events to cloud Firestore
 */
export const syncAllEvents = async (events: SwimmingEvent[]): Promise<void> => {
  for (const ev of events) {
    await syncSaveEvent(ev);
  }
};

/**
 * Delete Event from Firestore
 */
export const syncDeleteEvent = async (eventId: string): Promise<void> => {
  const docRef = doc(db, EVENTS_COL, eventId);
  await deleteDoc(docRef);
};

/**
 * Upsert Athlete to Firestore
 */
export const syncSaveAthlete = async (athlete: Athlete): Promise<void> => {
  const cleaned = cleanForFirestore(athlete);
  const docRef = doc(db, ATHLETES_COL, athlete.id);
  await setDoc(docRef, cleaned, { merge: true });
};

/**
 * Toggle Athlete status in Firestore
 */
export const syncToggleAthleteStatus = async (
  athleteId: string, 
  isActive: boolean
): Promise<void> => {
  const docRef = doc(db, ATHLETES_COL, athleteId);
  await updateDoc(docRef, { 
    isActive,
    trainingSchedule: isActive ? 'Minggu' : 'Rest'
  });
};

/**
 * Save Registration to Firestore
 */
export const syncSaveRegistration = async (reg: RegistrationEntry): Promise<void> => {
  const cleaned = cleanForFirestore(reg);
  const docRef = doc(db, REGS_COL, reg.id);
  await setDoc(docRef, cleaned, { merge: true });
};

/**
 * Update Registration payment status in Firestore
 */
export const syncUpdateRegStatus = async (
  regId: string, 
  status: 'paid' | 'pending' | 'cancelled'
): Promise<void> => {
  const docRef = doc(db, REGS_COL, regId);
  const now = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  await updateDoc(docRef, { 
    paymentStatus: status,
    ...(status === 'paid' ? { paidAt: now } : {})
  });
};

/**
 * Delete Registration from Firestore
 */
export const syncDeleteRegistration = async (regId: string): Promise<void> => {
  const docRef = doc(db, REGS_COL, regId);
  await deleteDoc(docRef);
};

/**
 * Initial Seeding: seeds Firestore with default events and athletes if empty
 */
export const seedDatabaseIfEmpty = async (
  defaultEvents: SwimmingEvent[],
  defaultAthletes: Athlete[],
  defaultRegistrations: RegistrationEntry[]
) => {
  try {
    const eventsSnap = await getDocs(collection(db, EVENTS_COL));
    if (eventsSnap.empty) {
      console.log('Seeding default events to cloud Firestore...');
      for (const ev of defaultEvents) {
        await setDoc(doc(db, EVENTS_COL, ev.id), cleanForFirestore(ev));
      }
    }

    const athletesSnap = await getDocs(collection(db, ATHLETES_COL));
    if (athletesSnap.empty) {
      console.log('Seeding default athletes to cloud Firestore...');
      for (const ath of defaultAthletes) {
        await setDoc(doc(db, ATHLETES_COL, ath.id), cleanForFirestore(ath));
      }
    }

    const regsSnap = await getDocs(collection(db, REGS_COL));
    if (regsSnap.empty) {
      console.log('Seeding default registrations to cloud Firestore...');
      for (const reg of defaultRegistrations) {
        await setDoc(doc(db, REGS_COL, reg.id), cleanForFirestore(reg));
      }
    }
  } catch (err) {
    console.error('Error during cloud database initial seeding:', err);
  }
};
