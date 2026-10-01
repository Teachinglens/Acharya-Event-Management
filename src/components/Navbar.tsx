import React from 'react';
import { Waves, Shield, Calendar, UserCheck, PlusCircle, Award } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Zone 1: Single text element wordmark */}
          <div 
            onClick={() => setActiveTab('register')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Waves className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="truncate">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-blue-950 font-serif block leading-none truncate">
                Acharya Event Management
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-blue-600 tracking-wider uppercase block mt-0.5 truncate">
                Master Pendaftaran Kejuaraan
              </span>
            </div>
          </div>

          {/* Zone 2: Clean 4-6 text navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Daftar Kejuaraan</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'events'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Jadwal & Event</span>
            </button>

            <button
              onClick={() => setActiveTab('athletes')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'athletes'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Database Atlet Aktif</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Admin Panel</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Terhubung secara live ke Cloud Database">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cloud Real-time</span>
            </div>

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Admin Aktif
                </span>
                <button
                  onClick={() => setIsAdmin(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Keluar Admin
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Masuk Admin</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('register')}
              className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-sm shadow-blue-500/30 rounded-lg transition-all whitespace-nowrap"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Ergonomic Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-blue-100 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] py-1 px-2 flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center min-h-[46px] rounded-xl transition-all ${
            activeTab === 'register' ? 'text-blue-700 font-bold bg-blue-50/80' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className={`w-5 h-5 ${activeTab === 'register' ? 'text-blue-600 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium">Daftar</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center min-h-[46px] rounded-xl transition-all ${
            activeTab === 'events' ? 'text-blue-700 font-bold bg-blue-50/80' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'events' ? 'text-blue-600 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium">Jadwal</span>
        </button>

        <button
          onClick={() => setActiveTab('athletes')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center min-h-[46px] rounded-xl transition-all ${
            activeTab === 'athletes' ? 'text-blue-700 font-bold bg-blue-50/80' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className={`w-5 h-5 ${activeTab === 'athletes' ? 'text-blue-600 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium">Atlet Aktif</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center min-h-[46px] rounded-xl transition-all ${
            activeTab === 'admin' ? 'text-blue-700 font-bold bg-blue-50/80' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className={`w-5 h-5 ${activeTab === 'admin' ? 'text-blue-600 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium">Admin</span>
        </button>
      </nav>
    </header>
  );
};
