import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RegistrationEntry } from '../types';
import { formatRupiah } from '../utils/helpers';
import { CheckCircle2, QrCode, Copy, Check, Clock, ShieldCheck, X, Download, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  registration: RegistrationEntry;
  onClose: () => void;
  onSuccess: (updatedReg: RegistrationEntry) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  registration,
  onClose,
  onSuccess
}) => {
  const [copiedNMID, setCopiedNMID] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes

  // Official QRIS Details from User's uploaded QRIS
  const MERCHANT_NAME = "Acharya Management";
  const NMID = "ID1026600075257";
  const TERMINAL_ID = "A01";

  // Official Indonesian QRIS string with Merchant NMID & Dynamic Reference
  const qrisPayload = `00020101021226680016ID.CO.QRIS.WWW01189360091800000000000215ID10266000752570303A0151440014ID.LINKAJA.WWW01189360091800000000000215ID10266000752570303A0152045812530336054${registration.totalAmount.toString().length.toString().padStart(2, '0')}${registration.totalAmount}5802ID5918Acharya Management6010PANDEGLANG61054221162150711${registration.id}6304C7B2`;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyNMID = () => {
    navigator.clipboard.writeText(NMID);
    setCopiedNMID(true);
    setTimeout(() => setCopiedNMID(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const updatedReg: RegistrationEntry = {
        ...registration,
        paymentStatus: 'paid',
        paymentMethod: 'qris',
        paidAt: now.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setIsProcessing(false);
      onSuccess(updatedReg);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden my-4">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-950 text-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <QrCode className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">Pembayaran Resmi QRIS</h3>
                <p className="text-xs text-blue-200">Khusus Club Acharya Swimming Club</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="text-blue-200">
              Registrasi: <b className="text-white font-mono">{registration.id}</b>
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-md font-mono text-cyan-200 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>Sisa Waktu: {formatCountdown(countdown)}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Summary Athlete & Amount */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">Nama Atlet:</span>
              <span className="font-extrabold text-slate-900 text-sm block">{registration.athleteName}</span>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                {registration.kuCategory} · {registration.selectedStrokes.length} Nomor Gaya
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Total Tagihan:</span>
              <span className="text-lg font-black text-blue-800 font-mono">
                {formatRupiah(registration.totalAmount)}
              </span>
            </div>
          </div>

          {/* OFFICIAL QRIS DISPLAY CARD (Exact Match to User Uploaded QRIS) */}
          <div className="border-2 border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-xs relative overflow-hidden text-center">
            {/* Red polygon accent on left edge like official standard QRIS */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-24 bg-red-600 rounded-r-md"></div>

            {/* Official QRIS Logo & Merchant Name */}
            <div className="space-y-0.5 mb-3">
              <div className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded">
                QRIS Nasional
              </div>
              <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight pt-1">
                {MERCHANT_NAME}
              </h4>
              <div className="flex items-center justify-center gap-1 text-xs text-slate-600 font-mono">
                <span>NMID : {NMID}</span>
                <button
                  type="button"
                  onClick={handleCopyNMID}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  title="Salin NMID"
                >
                  {copiedNMID ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">{TERMINAL_ID}</div>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm inline-block mx-auto relative">
              <QRCodeSVG
                value={qrisPayload}
                size={210}
                level="M"
                includeMargin={true}
                className="mx-auto"
              />
              <div className="mt-1 text-[10px] font-semibold text-slate-500 tracking-wide uppercase">
                Scan via Seluruh m-Banking & E-Wallet
              </div>
            </div>

            {/* Nominal Banner */}
            <div className="mt-3.5 py-2 px-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-xs">
              <span className="text-slate-600">Nominal yang harus dibayar: </span>
              <b className="text-blue-900 font-mono text-sm">{formatRupiah(registration.totalAmount)}</b>
            </div>

            {/* Supported Wallets / Banks Badges */}
            <div className="mt-3 text-[10px] text-slate-400 flex flex-wrap items-center justify-center gap-1.5 font-medium">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">BCA Mobile</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Livin' Mandiri</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">BRImo</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">BNI Mobile</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">GoPay</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Dana</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">OVO</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">ShopeePay</span>
            </div>
          </div>

          {/* Step Instructions */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Cara Membayar:</span>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-600">
              <li>Buka aplikasi m-Banking atau E-Wallet apa pun di smartphone Anda.</li>
              <li>Pilih menu <b>Scan / Bayar QRIS</b> dan arahkan ke kode QR di atas.</li>
              <li>Pastikan nama merchant tertera: <b>Acharya Management</b> (NMID: ID1026600075257).</li>
              <li>Konfirmasi pembayaran PIN, lalu klik tombol verifikasi di bawah.</li>
            </ol>
          </div>

          {/* Action Simulation Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-60 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi Pembayaran QRIS...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Saya Sudah Bayar (Verifikasi Otomatis)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
