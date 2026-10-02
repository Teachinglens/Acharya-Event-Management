import React from 'react';
import { Waves, Shield, Calendar, UserCheck, PlusCircle, Award, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'register' | 'events' | 'athletes' | 'admin';
  setActiveTab: (tab: 'register' | 'events' | 'athletes' | 'admin') => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin,
  onOpenAdminLogin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand: Soft Aqua and Sky Blue */}
          <div 
            onClick={() => setActiveTab('register')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-400 via-teal-400 to-cyan-300 flex items-center justify-center text-white shadow-md shadow-sky-400/20 group-hover:scale-105 transition-transform shrink-0">
              <Waves className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-sky-950 font-serif leading-none truncate">
                  Acharya Swimming Club
                </span>
                <span className="hidden sm:inline-block text-xs">🐬</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-sky-600 tracking-wider uppercase block mt-1 truncate">
                Portal Pendaftaran & Kejuaraan
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links with Soft Colors */}
          <nav className="hidden md:flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-sky-100/80 text-sky-900 border border-sky-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-sky-800 hover:bg-sky-50/70'
              }`}
            >
              <span>🏊 Daftar Lomba</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-sky-100/80 text-sky-900 border border-sky-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-sky-800 hover:bg-sky-50/70'
              }`}
            >
              <span>📅 Jadwal & Event</span>
            </button>

            <button
              onClick={() => setActiveTab('athletes')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'athletes'
                  ? 'bg-sky-100/80 text-sky-900 border border-sky-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-sky-800 hover:bg-sky-50/70'
              }`}
            >
              <span>⭐ Atlet Aktif (89)</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-sky-100/80 text-sky-900 border border-sky-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-sky-800 hover:bg-sky-50/70'
              }`}
            >
              <span>🛡️ Admin Panel</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80" title="Sinkronisasi real-time ke Cloud">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cloud Aktif</span>
            </div>

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Admin
                </span>
                <button
                  onClick={() => setIsAdmin(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  Keluar Admin
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="px-3.5 py-2 text-xs sm:text-sm font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                <span>Masuk Admin</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('register')}
              className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-md shadow-sky-500/20 rounded-2xl transition-all whitespace-nowrap cursor-pointer"
            >
              + Daftar Lomba
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Ergonomic Bottom Navigation Bar for Mobile with Soft Colors */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-sky-100 shadow-[0_-4px_20px_rgba(56,189,248,0.08)] py-1 px-2 flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center min-h-[46px] rounded-2xl transition-all ${
            activeTab === 'register' ? 'text-sky-800 font-black bg-sky-100/70 border border-sky-200/60' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-lg">🏊</span>
          <span className="text-[10px] mt-0.5 font-bold">Daftar</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center min-h-[46px] rounded-2xl transition-all ${
            activeTab === 'events' ? 'text-sky-800 font-black bg-sky-100/70 border border-sky-200/60' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-lg">📅</span>
          <span className="text-[10px] mt-0.5 font-bold">Jadwal</span>
        </button>

        <button
          onClick={() => setActiveTab('athletes')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center min-h-[46px] rounded-2xl transition-all ${
            activeTab === 'athletes' ? 'text-sky-800 font-black bg-sky-100/70 border border-sky-200/60' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-lg">⭐</span>
          <span className="text-[10px] mt-0.5 font-bold">Atlet Aktif</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center min-h-[46px] rounded-2xl transition-all ${
            activeTab === 'admin' ? 'text-sky-800 font-black bg-sky-100/70 border border-sky-200/60' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-lg">🛡️</span>
          <span className="text-[10px] mt-0.5 font-bold">Admin</span>
        </button>
      </nav>
    </header>
  );
};
