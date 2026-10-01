import * as XLSX from 'xlsx';
import { RegistrationEntry } from '../types';

export const exportRegistrationsToExcel = (
  registrations: RegistrationEntry[],
  filterEventTitle?: string
) => {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // SHEET 1: REKAP PENDAFTARAN & TAGIHAN KEUANGAN
  // -------------------------------------------------------------
  const nowStr = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalNomor = registrations.reduce((sum, r) => sum + r.selectedStrokes.length, 0);
  const totalStrokeFee = registrations.reduce((sum, r) => sum + r.strokeFee, 0);
  const totalCoachFee = registrations.reduce((sum, r) => sum + r.coachAccommodationFee, 0);
  const totalAdminFee = registrations.reduce((sum, r) => sum + r.adminFee, 0);
  const totalAmount = registrations.reduce((sum, r) => sum + r.totalAmount, 0);
  const paidCount = registrations.filter(r => r.paymentStatus === 'paid').length;
  const pendingCount = registrations.filter(r => r.paymentStatus === 'pending').length;

  const sheet1Data: (string | number)[][] = [
    ['ACHARYA EVENT MANAGEMENT - ACHARYA SWIMMING CLUB PANDEGLANG'],
    ['REKAPITULASI RESMI PENDAFTARAN KEJUARAAN RENANG'],
    [`Tanggal Unduh Data: ${nowStr}`],
    [`Filter Event: ${filterEventTitle || 'Semua Kejuaraan'}`],
    [`Ringkasan: ${registrations.length} Atlet Terdaftar (${paidCount} Lunas, ${pendingCount} Menunggu Konfirmasi)`],
    [], // Blank line
    [
      'No',
      'No. Registrasi',
      'Nama Atlet',
      'ID Club',
      'Kategori KU',
      'L/P',
      'Usia (Thn)',
      'Event Kejuaraan',
      'Rincian Nomor Lomba & Catatan Waktu (Seed Time)',
      'Jml Nomor',
      'Biaya Nomor (Rp)',
      'Akomodasi Pelatih (Rp)',
      'Biaya Admin (Rp)',
      'Total Tagihan (Rp)',
      'Status Pembayaran',
      'WhatsApp Orang Tua',
      'Waktu Daftar',
      'Referensi'
    ],
  ];

  registrations.forEach((reg, index) => {
    // Format stroke list nicely: "50m Gaya Bebas (00:32.40); 100m Gaya Dada (NT)"
    const strokeDetail = reg.selectedStrokes
      .map(s => `${s.name}${s.seedTime ? ` [${s.seedTime}]` : ' [NT]'}`)
      .join('; ');

    const statusLabel =
      reg.paymentStatus === 'paid'
        ? 'LUNAS (TERVERIFIKASI)'
        : reg.paymentStatus === 'pending'
        ? 'MENUNGGU KONFIRMASI'
        : 'DIBATALKAN';

    sheet1Data.push([
      index + 1,
      reg.id,
      reg.athleteName,
      reg.athleteId,
      reg.kuCategory,
      reg.gender === 'Laki-laki' ? 'L' : 'P',
      reg.age,
      reg.eventTitle,
      strokeDetail,
      reg.selectedStrokes.length,
      reg.strokeFee,
      reg.coachAccommodationFee,
      reg.adminFee,
      reg.totalAmount,
      statusLabel,
      reg.parentPhone,
      reg.createdAt,
      reg.paymentRef
    ]);
  });

  // Summary row at the bottom
  sheet1Data.push([]);
  sheet1Data.push([
    '',
    '',
    'TOTAL KESELURUHAN:',
    '',
    '',
    '',
    '',
    '',
    `Total ${registrations.length} Atlet Terdaftar`,
    totalNomor,
    totalStrokeFee,
    totalCoachFee,
    totalAdminFee,
    totalAmount,
    `${paidCount} Lunas / ${pendingCount} Pending`,
    '',
    '',
    ''
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

  // Column width specifications (optimized for readability in Excel)
  ws1['!cols'] = [
    { wch: 5 },  // No
    { wch: 16 }, // No Registrasi
    { wch: 25 }, // Nama Atlet
    { wch: 12 }, // ID Club
    { wch: 14 }, // Kategori KU
    { wch: 6 },  // L/P
    { wch: 10 }, // Usia
    { wch: 32 }, // Event
    { wch: 45 }, // Nomor Lomba
    { wch: 10 }, // Jml Nomor
    { wch: 16 }, // Biaya Nomor
    { wch: 20 }, // Akomodasi
    { wch: 15 }, // Biaya Admin
    { wch: 18 }, // Total Tagihan
    { wch: 24 }, // Status Pembayaran
    { wch: 18 }, // No HP Ortu
    { wch: 18 }, // Waktu Daftar
    { wch: 16 }, // Referensi
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Rekap Pendaftaran');

  // -------------------------------------------------------------
  // SHEET 2: ENTRY LIST PER NOMOR LOMBA (MEET MANAGER / PRSI FORMAT)
  // -------------------------------------------------------------
  const sheet2Data: (string | number)[][] = [
    ['ACHARYA EVENT MANAGEMENT - ENTRY LIST PER NOMOR LOMBA'],
    ['Format Standar Technical Meeting & Perlombaan Renang'],
    [`Tanggal Unduh Data: ${nowStr}`],
    [],
    [
      'No',
      'Event Kejuaraan',
      'No. Registrasi',
      'Nama Atlet',
      'ID Club',
      'Kategori KU',
      'Gender',
      'Nomor Perlombaan',
      'Jarak (m)',
      'Seed Time',
      'Status Pendaftaran'
    ]
  ];

  let entryCounter = 1;
  registrations.forEach(reg => {
    reg.selectedStrokes.forEach(stroke => {
      sheet2Data.push([
        entryCounter++,
        reg.eventTitle,
        reg.id,
        reg.athleteName,
        reg.athleteId,
        reg.kuCategory,
        reg.gender,
        stroke.name,
        stroke.distance,
        stroke.seedTime || 'NT (No Time)',
        reg.paymentStatus === 'paid' ? 'LUNAS' : 'MENUNGGU KONFIRMASI'
      ]);
    });
  });

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!cols'] = [
    { wch: 5 },  // No
    { wch: 30 }, // Event
    { wch: 16 }, // Reg ID
    { wch: 24 }, // Nama
    { wch: 12 }, // ID
    { wch: 14 }, // KU
    { wch: 10 }, // Gender
    { wch: 26 }, // Nomor Lomba
    { wch: 10 }, // Jarak
    { wch: 14 }, // Seed Time
    { wch: 20 }, // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws2, 'Entry List Lomba');

  // Generate clean filename
  const cleanDate = new Date().toISOString().slice(0, 10);
  const fileName = `Rekap_Pendaftaran_AcharyaSC_${cleanDate}.xlsx`;

  // Write and trigger download
  XLSX.writeFile(wb, fileName);
};
