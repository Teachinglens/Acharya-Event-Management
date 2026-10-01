import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { RegistrationEntry } from '../types';
import { formatRupiah } from '../utils/helpers';
import { 
  Printer, CheckCircle, Waves, Award, Clock, Phone, 
  MessageCircle, Copy, Check, FileText, X, Download, ArrowRight, Loader2 
} from 'lucide-react';

interface RegistrationCardProps {
  registration: RegistrationEntry;
  onClose?: () => void;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({ registration, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const ADMIN_PHONE = "6285716555746"; // Official Coach / Admin Phone

  // Direct PNG Image Download using html2canvas (Works 100% in iFrames and Mobile)
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      // Capture element with high resolution
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imageUri = canvas.toDataURL('image/png');

      // Trigger download
      const link = document.createElement('a');
      link.download = `Invoice_AcharyaSC_${registration.id}_${registration.athleteName.replace(/\s+/g, '_')}.png`;
      link.href = imageUri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to capture card as image:', err);
      // Fallback: try print
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('window.print() not available in this context, triggering image download:', e);
      handleDownloadImage();
    }
  };

  // Pre-filled WhatsApp message for Admin Confirmation
  const strokesListText = registration.selectedStrokes
    .map((s, idx) => `${idx + 1}. ${s.name}${s.seedTime ? ` (Seed: ${s.seedTime})` : ''}`)
    .join('\n');

  const waMessage = `*KONFIRMASI PENDAFTARAN KEJUARAAN RENANG*
*ACHARYA SWIMMING CLUB*

Halo Admin/Pelatih Acharya SC, saya ingin mengonfirmasi pendaftaran atlet berikut:
• *No. Registrasi:* ${registration.id}
• *Nama Atlet:* ${registration.athleteName}
• *ID Anggota:* ${registration.athleteId}
• *Kategori KU:* ${registration.kuCategory}
• *Tanggal Lahir / Usia:* ${registration.birthDate} (${registration.age} Tahun)
• *Event Kejuaraan:* ${registration.eventTitle}

*Nomor Lomba Yang Diikuti (${registration.selectedStrokes.length} Nomor):*
${strokesListText}

*Rincian Biaya:*
- Biaya Nomor Gaya: ${formatRupiah(registration.strokeFee)}
- Akomodasi Pelatih: ${formatRupiah(registration.coachAccommodationFee)}
- Total Tagihan: *${formatRupiah(registration.totalAmount)}*

Mohon untuk dicek dan divalidasi kepesertaannya. Terima kasih!`;

  const waUrl = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(waMessage)}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(waMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPaid = registration.paymentStatus === 'paid';

  return (
    <div className="bg-white rounded-2xl border border-blue-200/80 shadow-2xl overflow-hidden max-w-2xl mx-auto print:border-none print:shadow-none animate-in fade-in zoom-in duration-150">
      {/* Top Action Bar (hidden in print) */}
      <div className="bg-slate-100/90 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <FileText className="w-4 h-4 text-blue-700 shrink-0" />
          <span className="text-xs font-bold text-slate-800">
            {isPaid ? 'Kartu Peserta Resmi' : 'Invoice Rekap Pendaftaran'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Main Action: Simpan / Unduh Gambar (PNG) - Guaranteed to work in iframes and phones */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Simpan lembar invoice sebagai gambar PNG jernih"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Simpan / Unduh Gambar</span>
              </>
            )}
          </button>

          {/* Cetak Browser Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            title="Cetak melalui printer browser"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Printable / Capturable Card Area */}
      <div 
        ref={cardRef}
        id="printable-invoice"
        className="p-4 sm:p-8 bg-white relative text-slate-900"
      >
        {/* Subtle watermark background */}
        <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none text-blue-900">
          <Waves className="w-64 h-64" />
        </div>

        {/* Club Letterhead Header */}
        <div className="flex items-center justify-between border-b-2 border-blue-600 pb-3 sm:pb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <Waves className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-blue-950 font-serif tracking-tight leading-none">
                ACHARYA SWIMMING CLUB
              </h2>
              <p className="text-[10px] sm:text-xs text-blue-600 font-semibold tracking-wider mt-1">
                KABUPATEN PANDEGLANG - BANTEN · PENGKAB AKUATIK INDONESIA
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] sm:text-[10px] text-slate-400 block font-mono">NO. REGISTRASI</span>
            <span className="text-xs sm:text-sm font-extrabold text-blue-800 font-mono tracking-tight block">
              {registration.id}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-0.5">
              {registration.createdAt}
            </span>
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className={`my-3 sm:my-4 rounded-xl p-3 sm:p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
          isPaid 
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/90 border-amber-200 text-amber-900'
        }`}>
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
              Status Pendaftaran:
            </span>
            <div className="flex items-center gap-1.5 font-black text-xs sm:text-base mt-0.5">
              {isPaid ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-800">TERVERIFIKASI LUNAS</span>
                  <span className="text-[11px] font-normal text-slate-500">({registration.paidAt})</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-amber-800">MENUNGGU KONFIRMASI ADMIN</span>
                </>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1">
              {isPaid 
                ? 'Pendaftaran resmi telah disetujui pelatih dan siap digunakan sebagai tanda masuk kejuaraan.'
                : 'Pendaftaran telah dicatat di sistem. Konfirmasikan invoice ini ke Admin via WhatsApp untuk proses validasi.'}
            </p>
          </div>

          <div className="text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-200/60">
            <span className="text-[10px] sm:text-[11px] text-slate-500 block">Total Tagihan:</span>
            <span className="text-base sm:text-xl font-black text-blue-900 font-mono">
              {formatRupiah(registration.totalAmount)}
            </span>
          </div>
        </div>

        {/* WhatsApp Confirmation Action Card (Prominent when pending, hidden in print) */}
        {!isPaid && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-xl bg-emerald-50/90 border border-emerald-300 print:hidden space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Konfirmasikan Pendaftaran ke Admin Acharya SC:</span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed">
              Kirimkan rincian invoice ini langsung ke kontak resmi WhatsApp Admin/Pelatih agar kepesertaan atlet divalidasi ke database kejuaraan.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Konfirmasi via WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="py-2.5 px-3 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Championship Event Title */}
        <div className="mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Event Kejuaraan:
          </span>
          <h3 className="text-sm sm:text-lg font-bold text-slate-900 leading-snug mt-0.5">
            {registration.eventTitle}
          </h3>
        </div>

        {/* Athlete Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50/70 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 shadow-2xs mb-3 sm:mb-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Nama Atlet</span>
            <span className="font-bold text-slate-900 block truncate">{registration.athleteName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">ID Anggota</span>
            <span className="font-mono font-semibold text-blue-700 block">{registration.athleteId}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Tanggal Lahir / Umur</span>
            <span className="font-medium text-slate-800 block">
              {registration.birthDate} ({registration.age} thn)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Kelompok Umur (KU)</span>
            <span className="font-bold text-blue-900 block">{registration.kuCategory}</span>
          </div>
        </div>

        {/* Selected Strokes Table */}
        <div className="mb-3 sm:mb-4">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>Nomor Perlombaan Yang Didaftarkan ({registration.selectedStrokes.length} Nomor):</span>
            <span className="text-[11px] text-slate-500 font-normal">Subtotal: {formatRupiah(registration.strokeFee)}</span>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2 px-2.5 sm:px-3">No</th>
                  <th className="py-2 px-2.5 sm:px-3">Nomor Perlombaan / Gaya</th>
                  <th className="py-2 px-2.5 sm:px-3">Jarak</th>
                  <th className="py-2 px-2.5 sm:px-3 text-right">Seed Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registration.selectedStrokes.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5 sm:px-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-2.5 sm:px-3 font-semibold text-slate-900">{st.name}</td>
                    <td className="py-2 px-2.5 sm:px-3 text-slate-600">{st.distance} Meter</td>
                    <td className="py-2 px-2.5 sm:px-3 text-right font-mono text-slate-700">
                      {st.seedTime || 'NT (No Time)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Itemized Cost Breakdown */}
        <div className="border-t border-slate-200 pt-3 text-xs space-y-1 text-slate-600">
          <div className="flex justify-between">
            <span>Biaya Pendaftaran Nomor ({registration.selectedStrokes.length} x tarif):</span>
            <span className="font-mono font-medium">{formatRupiah(registration.strokeFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>Akomodasi & Official Pelatih:</span>
            <span className="font-mono font-medium">{formatRupiah(registration.coachAccommodationFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>Biaya Administrasi Sistem:</span>
            <span className="font-mono font-medium">{formatRupiah(registration.adminFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-100">
            <span>TOTAL TAGIHAN:</span>
            <span className="font-mono text-blue-700 text-base">{formatRupiah(registration.totalAmount)}</span>
          </div>
        </div>

        {/* Footer Reference */}
        <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1.5">
          <div>
            <p className="font-semibold text-slate-700">Kontak Admin Acharya SC: 0857-1655-5746</p>
            <p className="text-[10px] text-slate-400">Bukti sah pendaftaran kejuaraan untuk verifikasi kepesertaan tim.</p>
          </div>
          <div className="font-mono text-xs font-bold text-slate-700 sm:text-right">
            REF: {registration.paymentRef}
          </div>
        </div>
      </div>
    </div>
  );
};
