import { SwimmingEvent, RegistrationEntry } from '../types';

export const INITIAL_EVENTS: SwimmingEvent[] = [
  {
    id: 'EVT-2026-001',
    title: 'Kejuaraan Renang Antar Perkumpulan (KRAP) Banten Open 2026',
    organizer: 'Pengprov Akuatik Indonesia Banten',
    location: 'Serang, Banten',
    venuePool: 'Kolam Renang Prestasi Olimpic Banten',
    eventDate: '2026-11-14',
    endDate: '2026-11-15',
    registrationDeadline: '2026-11-05',
    feePerStroke: 75000,
    coachAccommodationFee: 150000,
    status: 'Buka',
    minBirthYear: 2008,
    maxBirthYear: 2018,
    notes: 'Kualifikasi resmi Kejurda & Porprov. Setiap atlet wajib mendaftar melalui pelatih kepala Acharya SC.',
    availableStrokes: [
      { id: 'S1', name: '50m Gaya Bebas', stroke: 'Bebas', distance: 50 },
      { id: 'S2', name: '100m Gaya Bebas', stroke: 'Bebas', distance: 100 },
      { id: 'S3', name: '50m Gaya Dada', stroke: 'Dada', distance: 50 },
      { id: 'S4', name: '100m Gaya Dada', stroke: 'Dada', distance: 100 },
      { id: 'S5', name: '50m Gaya Punggung', stroke: 'Punggung', distance: 50 },
      { id: 'S6', name: '50m Gaya Kupu-Kupu', stroke: 'Kupu-Kupu', distance: 50 },
      { id: 'S7', name: '200m Gaya Ganti Perorangan', stroke: 'Ganti Perorangan', distance: 200 },
      { id: 'S8', name: '4x50m Estafet Gaya Bebas', stroke: 'Estafet', distance: 200 }
    ]
  },
  {
    id: 'EVT-2026-002',
    title: 'Pandeglang Aquatics Sprint Championship 2026',
    organizer: 'Pengkab Akuatik Indonesia Pandeglang & Acharya SC',
    location: 'Pandeglang, Banten',
    venuePool: 'Kolam Renang CAS Waterpark Cikole Pandeglang',
    eventDate: '2026-12-05',
    endDate: '2026-12-06',
    registrationDeadline: '2026-11-28',
    feePerStroke: 60000,
    coachAccommodationFee: 100000,
    status: 'Buka',
    minBirthYear: 2009,
    maxBirthYear: 2019,
    notes: 'Khusus nomor sprint (50m & 100m) untuk KU V s/d Senior dan KU Pemula Fun Swim.',
    availableStrokes: [
      { id: 'PS1', name: '50m Gaya Bebas', stroke: 'Bebas', distance: 50 },
      { id: 'PS2', name: '50m Gaya Dada', stroke: 'Dada', distance: 50 },
      { id: 'PS3', name: '50m Gaya Punggung', stroke: 'Punggung', distance: 50 },
      { id: 'PS4', name: '50m Gaya Kupu-Kupu', stroke: 'Kupu-Kupu', distance: 50 },
      { id: 'PS5', name: '100m Gaya Dada', stroke: 'Dada', distance: 100 },
      { id: 'PS6', name: '100m Gaya Bebas', stroke: 'Bebas', distance: 100 }
    ]
  },
  {
    id: 'EVT-2026-003',
    title: 'Piala Dispora Banten Junior Series III',
    organizer: 'Dispora Provinsi Banten',
    location: 'Tangerang, Banten',
    venuePool: 'Aquatic Stadium Benteng Taruna',
    eventDate: '2026-12-20',
    endDate: '2026-12-21',
    registrationDeadline: '2026-12-10',
    feePerStroke: 70000,
    coachAccommodationFee: 175000,
    status: 'Segera Ditutup',
    minBirthYear: 2012,
    maxBirthYear: 2018,
    notes: 'Ajang bergengsi usia dini KU III, KU IV, dan KU V.',
    availableStrokes: [
      { id: 'JS1', name: '50m Gaya Dada', stroke: 'Dada', distance: 50 },
      { id: 'JS2', name: '50m Gaya Bebas', stroke: 'Bebas', distance: 50 },
      { id: 'JS3', name: '50m Gaya Punggung', stroke: 'Punggung', distance: 50 },
      { id: 'JS4', name: '100m Gaya Bebas', stroke: 'Bebas', distance: 100 },
      { id: 'JS5', name: '100m Gaya Dada', stroke: 'Dada', distance: 100 }
    ]
  }
];

export const INITIAL_REGISTRATIONS: RegistrationEntry[] = [
  {
    id: 'REG-2026-8812',
    eventId: 'EVT-2026-001',
    eventTitle: 'Kejuaraan Renang Antar Perkumpulan (KRAP) Banten Open 2026',
    athleteId: 'ASC.0623.001',
    athleteName: 'Ghania Razan Syakirah',
    birthDate: '02/07/2017',
    age: 9,
    kuCategory: 'KU V (8-9 Tahun)',
    gender: 'Perempuan',
    parentPhone: '085716555746',
    selectedStrokes: [
      { id: 'S1', name: '50m Gaya Bebas', stroke: 'Bebas', distance: 50, seedTime: '00:46.20' },
      { id: 'S3', name: '50m Gaya Dada', stroke: 'Dada', distance: 50, seedTime: '00:52.10' }
    ],
    strokeFee: 150000,
    coachAccommodationFee: 150000,
    adminFee: 2500,
    totalAmount: 302500,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    paidAt: '2026-09-28 14:22',
    paymentRef: 'ASC-Q7X9K2',
    createdAt: '2026-09-28 14:15'
  },
  {
    id: 'REG-2026-8813',
    eventId: 'EVT-2026-001',
    eventTitle: 'Kejuaraan Renang Antar Perkumpulan (KRAP) Banten Open 2026',
    athleteId: 'ASC.0723.011',
    athleteName: 'Nafil Zaidan Krismalela',
    birthDate: '01/08/2012',
    age: 14,
    kuCategory: 'KU II (14-15 Tahun)',
    gender: 'Laki-laki',
    parentPhone: '085219517009',
    selectedStrokes: [
      { id: 'S1', name: '50m Gaya Bebas', stroke: 'Bebas', distance: 50, seedTime: '00:32.40' },
      { id: 'S2', name: '100m Gaya Bebas', stroke: 'Bebas', distance: 100, seedTime: '01:14.20' },
      { id: 'S6', name: '50m Gaya Kupu-Kupu', stroke: 'Kupu-Kupu', distance: 50, seedTime: '00:36.10' }
    ],
    strokeFee: 225000,
    coachAccommodationFee: 150000,
    adminFee: 2500,
    totalAmount: 377500,
    paymentMethod: 'va_bca',
    paymentStatus: 'paid',
    paidAt: '2026-09-29 09:30',
    paymentRef: 'ASC-B8M2P1',
    createdAt: '2026-09-29 09:12'
  }
];
