export type StrokeCategory = 'Dada' | 'Bebas' | 'Punggung' | 'Kupu-Kupu' | 'Ganti Perorangan' | 'Estafet';

export interface EventStroke {
  id: string;
  name: string; // e.g. "50m Gaya Dada"
  stroke: StrokeCategory;
  distance: number; // in meters (50, 100, 200)
  allowedKU?: string[]; // e.g. ["KU V", "KU IV", "KU III", "KU II", "KU I", "Senior"]
}

export interface SwimmingEvent {
  id: string;
  title: string;
  organizer: string;
  location: string;
  venuePool: string; // e.g. "Kolam Renang Cas Waterpark Pandeglang" / "Kolam Prestasi Banten"
  eventDate: string; // e.g. "2026-11-14"
  endDate?: string;
  registrationDeadline: string;
  feePerStroke: number; // e.g. 65000
  coachAccommodationFee: number; // e.g. 150000
  status: 'Buka' | 'Segera Ditutup' | 'Tutup' | 'Selesai';
  bannerUrl?: string;
  minBirthYear?: number; // e.g. 2010 (Tahun lahir tertua yang diperbolehkan)
  maxBirthYear?: number; // e.g. 2018 (Tahun lahir termuda yang diperbolehkan)
  availableStrokes: EventStroke[];
  notes?: string;
}

export interface Athlete {
  id: string; // ASC.0623.001
  fullName: string;
  birthDate: string; // DD/MM/YYYY or YYYY-MM-DD
  gender: 'Laki-laki' | 'Perempuan';
  school?: string;
  parentName?: string;
  parentPhone?: string;
  parentJob?: string;
  trainingSchedule: string; // e.g. "Minggu", "Sabtu", "Rest", "Private", "Kamis"
  isActive: boolean; // true if trainingSchedule !== 'Rest'
  heightCm?: string;
  photoUrl?: string;
}

export interface RegistrationEntry {
  id: string; // REG-2026-XXXX
  eventId: string;
  eventTitle: string;
  athleteId: string;
  athleteName: string;
  birthDate: string;
  age: number;
  kuCategory: string; // e.g. "KU IV (10-11 Tahun)"
  gender: 'Laki-laki' | 'Perempuan';
  parentPhone: string;
  selectedStrokes: {
    id: string;
    name: string;
    stroke: StrokeCategory;
    distance: number;
    seedTime?: string; // e.g. "00:42.50"
  }[];
  strokeFee: number;
  coachAccommodationFee: number;
  adminFee: number;
  totalAmount: number;
  paymentMethod: 'qris' | 'va_bca' | 'va_mandiri' | 'va_bni' | 'va_bri' | 'gopay';
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  paidAt?: string;
  paymentRef: string;
  createdAt: string;
}
