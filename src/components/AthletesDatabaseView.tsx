import React, { useState, useMemo } from 'react';
import { Athlete } from '../types';
import { calculateAgeAndKU } from '../utils/helpers';
import { Search, UserCheck, ShieldAlert, Award, Calendar, ChevronRight, School, User } from 'lucide-react';

interface AthletesDatabaseViewProps {
  athletes: Athlete[];
  onSelectAthleteForEvent: (athleteId: string) => void;
}

export const AthletesDatabaseView: React.FC<AthletesDatabaseViewProps> = ({
  athletes,
  onSelectAthleteForEvent,
}) => {
  const [filterMode, setFilterMode] = useState<'active' | 'rest' | 'all'>('active');
  const [scheduleFilter, setScheduleFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const activeCount = athletes.filter(a => a.isActive).length;
  const restCount = athletes.filter(a => !a.isActive).length;

  const schedules = useMemo(() => {
    const set = new Set<string>();
    athletes.forEach(a => {
      if (a.trainingSchedule) set.add(a.trainingSchedule);
    });
    return Array.from(set);
  }, [athletes]);

  const filtered = useMemo(() => {
    return athletes.filter(a => {
      if (filterMode === 'active' && !a.isActive) return false;
      if (filterMode === 'rest' && a.isActive) return false;
      if (scheduleFilter !== 'all' && a.trainingSchedule !== scheduleFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.fullName.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          (a.school && a.school.toLowerCase().includes(q)) ||
          (a.parentName && a.parentName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [athletes, filterMode, scheduleFilter, search]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase block">Database Resmi Perkumpulan</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif tracking-tight mt-1">
          Daftar Atlet Acharya Swimming Club
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
          Data atlet terverifikasi dari lembar data klub. Atlet dengan status <b>Rest</b> (istirahat/tidak aktif latihan) tidak diperbolehkan mendaftar kejuaraan tanpa izin pelatih.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="w-full overflow-x-auto flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold no-scrollbar">
            <button
              onClick={() => setFilterMode('active')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                filterMode === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aktif Berlatih ({activeCount})
            </button>
            <button
              onClick={() => setFilterMode('rest')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                filterMode === 'rest' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Status Rest ({restCount})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                filterMode === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({athletes.length})
            </button>
          </div>

          <select
            value={scheduleFilter}
            onChange={(e) => setScheduleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">Semua Jadwal Latihan</option>
            {schedules.map(sch => (
              <option key={sch} value={sch}>{sch}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atlet, sekolah, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Grid of Athlete Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ath => {
          const stat = calculateAgeAndKU(ath.birthDate);
          return (
            <div
              key={ath.id}
              className={`p-5 rounded-2xl border transition-all bg-white flex flex-col justify-between ${
                ath.isActive
                  ? 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                  : 'border-slate-200/60 bg-slate-50/50 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {ath.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ath.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {ath.isActive ? `Jadwal: ${ath.trainingSchedule}` : 'Status: REST'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-xs ${
                    ath.isActive ? 'bg-gradient-to-tr from-blue-700 to-cyan-500' : 'bg-slate-400'
                  }`}>
                    {ath.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {ath.fullName}
                    </h3>
                    <div className="text-[11px] text-slate-500">
                      {ath.gender} · {stat.age} Tahun
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tanggal Lahir:</span>
                    <span className="font-medium text-slate-800">{ath.birthDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kelompok Umur:</span>
                    <span className="font-bold text-blue-900 font-mono">{stat.ku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Asal Sekolah:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[140px]">{ath.school || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Orang Tua / Wali:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[140px]">{ath.parentName || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                {ath.isActive ? (
                  <button
                    onClick={() => onSelectAthleteForEvent(ath.id)}
                    className="w-full py-2 px-3 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Daftarkan ke Kejuaraan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="py-2 text-center text-[11px] text-amber-700 bg-amber-50 rounded-xl font-medium">
                    Rest: Hubungi pelatih untuk pengaktifan
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
