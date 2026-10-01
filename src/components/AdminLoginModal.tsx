import React, { useState } from 'react';
import { Shield, KeyRound, X, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: "acharya" or "1234"
    if (pin.trim() === 'acharya' || pin.trim() === '1234' || pin.trim() === 'admin') {
      onLoginSuccess();
      setError(false);
      setPin('');
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-blue-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Login Pengurus / Admin</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs text-slate-500">
            Akses khusus pelatih dan administrator Acharya Swimming Club untuk mengelola jadwal event, data atlet, dan verifikasi biaya.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kata Sandi / PIN Admin
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                placeholder="Masukkan Kata Sandi / PIN Admin"
                autoComplete="off"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Kata sandi atau PIN tidak sesuai. Silakan hubungi admin utama jika lupa akses.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
            >
              Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
