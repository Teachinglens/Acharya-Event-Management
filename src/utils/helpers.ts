// Helper functions for Swimming Club Management

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Calculate age and Kelompok Umur (KU) based on PRSI / Aquatics standard
export function calculateAgeAndKU(birthDateStr: string, referenceDateStr?: string): { age: number; ku: string; birthDateFormatted: string } {
  if (!birthDateStr) return { age: 0, ku: 'Unknown', birthDateFormatted: '-' };

  // Parse DD/MM/YYYY or YYYY-MM-DD
  let day = 1;
  let month = 1;
  let year = 2010;

  if (birthDateStr.includes('/')) {
    const parts = birthDateStr.split('/');
    if (parts.length >= 3) {
      day = parseInt(parts[0], 10) || 1;
      month = parseInt(parts[1], 10) || 1;
      year = parseInt(parts[2], 10) || 2010;
    }
  } else if (birthDateStr.includes('-')) {
    const parts = birthDateStr.split('-');
    if (parts.length >= 3) {
      year = parseInt(parts[0], 10) || 2010;
      month = parseInt(parts[1], 10) || 1;
      day = parseInt(parts[2], 10) || 1;
    }
  }

  const birth = new Date(year, month - 1, day);
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date(2026, 8, 30); // Default local 2026
  
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }

  // PRSI / World Aquatics Age Group (KU) standards:
  // Senior: 19 thn ke atas
  // KU I: 16 - 18 thn
  // KU II: 14 - 15 thn
  // KU III: 12 - 13 thn
  // KU IV: 10 - 11 thn
  // KU V: 8 - 9 thn
  // KU VI / Pemula: < 8 thn
  let ku = 'KU V (8-9 Tahun)';
  if (age >= 19) ku = 'Senior (19+ Tahun)';
  else if (age >= 16) ku = 'KU I (16-18 Tahun)';
  else if (age >= 14) ku = 'KU II (14-15 Tahun)';
  else if (age >= 12) ku = 'KU III (12-13 Tahun)';
  else if (age >= 10) ku = 'KU IV (10-11 Tahun)';
  else if (age >= 8) ku = 'KU V (8-9 Tahun)';
  else ku = 'KU VI / Pemula (Di bawah 8 Tahun)';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const birthDateFormatted = `${pad(day)}/${pad(month)}/${year}`;

  return { age: Math.max(0, age), ku, birthDateFormatted };
}

export function generatePaymentRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'ASC-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
