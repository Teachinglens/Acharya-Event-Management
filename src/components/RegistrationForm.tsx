import React, { useState, useMemo } from 'react';
import { SwimmingEvent, Athlete, RegistrationEntry, EventStroke } from '../types';
import { calculateAgeAndKU, formatRupiah, generatePaymentRef, isAthleteEligibleForEvent } from '../utils/helpers';
import { 
  Waves, Calendar, User, Check, Plus, AlertCircle, Award, 
  CheckCircle2, ChevronRight, Search, ShieldCheck, Clock, 
  FileText, Users, Sparkles, Filter, Eye, Phone, MapPin
} from 'lucide-react';

interface RegistrationFormProps {
  events: SwimmingEvent[];
  athletes: Athlete[];
  registrations?: RegistrationEntry[];
  onCompleteRegistration: (reg: RegistrationEntry) => void;
  onSelectEventView?: (eventId: string) => void;
  onViewInvoice?: (reg: RegistrationEntry) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  events,
  athletes,
  registrations = [],
  onCompleteRegistration,
  onSelectEventView,
  onViewInvoice,
}) => {
  // Navigation between registration form & participants list
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'list'>('form');

  // Only open events can be registered for
  const openEvents = useMemo(() => events.filter(e => e.status === 'Buka' || e.status === 'Segera Ditutup'), [events]);

  const [selectedEventId, setSelectedEventId] = useState<string>(openEvents[0]?.id || '');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [athleteSearchTerm, setAthleteSearchTerm] = useState<string>('');
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<string[]>([]);
  const [seedTimes, setSeedTimes] = useState<Record<string, string>>({});
  const [parentContact, setParentContact] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Participant list filter states
  const [listEventFilter, setListEventFilter] = useState<string>('all');
  const [listSearch, setListSearch] = useState<string>('');
  const [listStatusFilter, setListStatusFilter] = useState<string>('all');

  // Filter athletes (all athletes are official active athletes from Sheet)
  const filteredAthletes = useMemo(() => {
    return athletes.filter(a => {
      if (!athleteSearchTerm.trim()) return true;
      const term = athleteSearchTerm.toLowerCase();
      return (
        a.fullName.toLowerCase().includes(term) ||
        a.id.toLowerCase().includes(term) ||
        (a.school && a.school.toLowerCase().includes(term))
      );
    });
  }, [athletes, athleteSearchTerm]);

  // Selected event
  const currentEvent = useMemo(() => events.find(e => e.id === selectedEventId) || openEvents[0], [events, selectedEventId, openEvents]);

  // Selected athlete
  const currentAthlete = useMemo(() => athletes.find(a => a.id === selectedAthleteId), [athletes, selectedAthleteId]);

  // Calculated athlete age & KU
  const athleteStats = useMemo(() => {
    if (!currentAthlete) return null;
    return calculateAgeAndKU(currentAthlete.birthDate);
  }, [currentAthlete]);

  // Check if selected athlete is eligible based on event's birth year range
  const eligibilityCheck = useMemo(() => {
    if (!currentAthlete || !currentEvent) return { eligible: true, athleteYear: 0 };
    return isAthleteEligibleForEvent(
      currentAthlete.birthDate,
      currentEvent.minBirthYear,
      currentEvent.maxBirthYear
    );
  }, [currentAthlete, currentEvent]);

  // Filtered participants list for the "Peserta Terdaftar" tab
  const filteredParticipants = useMemo(() => {
    return registrations.filter(r => {
      if (listEventFilter !== 'all' && r.eventId !== listEventFilter) return false;
      if (listStatusFilter !== 'all' && r.paymentStatus !== listStatusFilter) return false;
      if (listSearch.trim()) {
        const q = listSearch.toLowerCase();
        return (
          r.athleteName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.eventTitle.toLowerCase().includes(q) ||
          (r.kuCategory && r.kuCategory.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [registrations, listEventFilter, listStatusFilter, listSearch]);

  // Recent participants registered for the currently selected event (shown below form)
  const currentEventParticipants = useMemo(() => {
    if (!currentEvent) return [];
    return registrations.filter(r => r.eventId === currentEvent.id);
  }, [registrations, currentEvent]);

  // Calculate pricing
  const strokeFee = (currentEvent?.feePerStroke || 0) * selectedStrokeIds.length;
  const coachAccommodationFee = selectedStrokeIds.length > 0 ? (currentEvent?.coachAccommodationFee || 0) : 0;
  const adminFee = selectedStrokeIds.length > 0 ? 2500 : 0;
  const totalAmount = strokeFee + coachAccommodationFee + adminFee;

  const handleSelectAthlete = (athlete: Athlete) => {
    setSelectedAthleteId(athlete.id);
    setParentContact(athlete.parentPhone || '');
    setAthleteSearchTerm('');
    setFormError(null);
  };

  const toggleStroke = (strokeId: string) => {
    setSelectedStrokeIds(prev =>
      prev.includes(strokeId) ? prev.filter(id => id !== strokeId) : [...prev, strokeId]
    );
    setFormError(null);
  };

  const handleSeedTimeChange = (strokeId: string, time: string) => {
    setSeedTimes(prev => ({ ...prev, [strokeId]: time }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) {
      setFormError('Silakan pilih kejuaraan yang ingin diikuti.');
      return;
    }
    if (!currentAthlete) {
      setFormError('Silakan pilih atlet aktif Acharya SC dari daftar.');
      return;
    }
    if (selectedStrokeIds.length === 0) {
      setFormError('Pilih minimal 1 nomor perlombaan / gaya renang.');
      return;
    }

    const chosenStrokes = currentEvent.availableStrokes
      .filter(s => selectedStrokeIds.includes(s.id))
      .map(s => ({
        id: s.id,
        name: s.name,
        stroke: s.stroke,
        distance: s.distance,
        seedTime: seedTimes[s.id] || '',
      }));

    const regId = `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReg: RegistrationEntry = {
      id: regId,
      eventId: currentEvent.id,
      eventTitle: currentEvent.title,
      athleteId: currentAthlete.id,
      athleteName: currentAthlete.fullName,
      birthDate: currentAthlete.birthDate,
      age: athleteStats?.age || 0,
      kuCategory: athleteStats?.ku || 'KU V',
      gender: currentAthlete.gender,
      parentPhone: parentContact || currentAthlete.parentPhone || '-',
      selectedStrokes: chosenStrokes,
      strokeFee,
      coachAccommodationFee,
      adminFee,
      totalAmount,
      paymentMethod: 'qris',
      paymentStatus: 'pending',
      paymentRef: generatePaymentRef(),
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    onCompleteRegistration(newReg);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Friendly Hero Banner with Soft Gradient & Floating Swimmer Motif */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-100 via-blue-50 to-teal-50 border border-sky-100 p-6 sm:p-8 text-center shadow-xs">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-xs text-sky-800 text-xs font-bold mb-3 border border-sky-200/80 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Portal Resmi Acharya Swimming Club</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-sky-950 tracking-tight font-serif">
          Pendaftaran Kejuaraan Renang 🏊‍♂️
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-sky-800/80 max-w-xl mx-auto leading-relaxed">
          Yuk daftarkan jagoan renang Acharya SC ke kejuaraan pilihan! Nikmati proses pendaftaran yang mudah, aman, dan transparan.
        </p>

        {/* Section Switcher Tabs (Formulir vs Peserta Terdaftar) */}
        <div className="mt-6 flex items-center justify-center">
          <div className="inline-flex p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-sky-200 shadow-xs max-w-md w-full">
            <button
              type="button"
              onClick={() => setActiveSubTab('form')}
              className={`flex-1 py-2 sm:py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'form'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm'
                  : 'text-sky-800 hover:text-sky-950 hover:bg-sky-50'
              }`}
            >
              <span>📝 Formulir Pendaftaran</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('list')}
              className={`flex-1 py-2 sm:py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'list'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm'
                  : 'text-sky-800 hover:text-sky-950 hover:bg-sky-50'
              }`}
            >
              <span>📋 Peserta Terdaftar</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeSubTab === 'list' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
              }`}>
                {registrations.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: DAFTAR PESERTA YANG SUDAH BERHASIL MENDAFTAR       */}
      {/* ========================================================= */}
      {activeSubTab === 'list' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header & Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/90 p-4 rounded-2xl border border-sky-100 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl shrink-0">
                🏊‍♂️
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Total Pendaftar Tim</span>
                <span className="text-xl sm:text-2xl font-black text-sky-950 font-mono">
                  {filteredParticipants.length} <span className="text-xs font-normal text-slate-500 font-sans">atlet</span>
                </span>
              </div>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">
                ✅
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Terverifikasi Lunas</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                  {filteredParticipants.filter(r => r.paymentStatus === 'paid').length}{' '}
                  <span className="text-xs font-normal text-slate-500 font-sans">atlet</span>
                </span>
              </div>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-amber-100 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0">
                ⏳
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Menunggu Verifikasi</span>
                <span className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
                  {filteredParticipants.filter(r => r.paymentStatus !== 'paid').length}{' '}
                  <span className="text-xs font-normal text-slate-500 font-sans">atlet</span>
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white/90 p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <select
                value={listEventFilter}
                onChange={(e) => setListEventFilter(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-xl border border-sky-200 bg-sky-50/40 text-slate-700 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="all">Semua Kejuaraan ({registrations.length})</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>

              <select
                value={listStatusFilter}
                onChange={(e) => setListStatusFilter(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-xl border border-sky-200 bg-sky-50/40 text-slate-700 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="all">Semua Status Pembayaran</option>
                <option value="paid">Lunas Terverifikasi</option>
                <option value="pending">Menunggu Verifikasi</option>
              </select>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atlet, nomor reg, KU..."
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-sky-200 bg-white focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>
          </div>

          {/* Participants Cards List */}
          {filteredParticipants.length === 0 ? (
            <div className="bg-white/80 p-12 text-center rounded-3xl border border-sky-100 space-y-3">
              <div className="text-4xl">🏊</div>
              <h3 className="text-base font-bold text-slate-800 font-serif">Belum Ada Peserta yang Sesuai</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan lakukan pendaftaran baru melalui tab <b>Formulir Pendaftaran</b> di atas.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('form')}
                className="mt-2 px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                + Buka Formulir Pendaftaran
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredParticipants.map(reg => {
                const isPaid = reg.paymentStatus === 'paid';
                return (
                  <div 
                    key={reg.id}
                    className="bg-white/95 rounded-3xl border border-sky-100 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
                  >
                    <div>
                      {/* Top row: Reg ID & Status Badge */}
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                          {reg.id}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isPaid 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          <span>{isPaid ? 'Terverifikasi Lunas' : 'Menunggu Verifikasi'}</span>
                        </span>
                      </div>

                      {/* Athlete Details */}
                      <div className="flex items-start gap-3 mt-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-500 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                          {reg.athleteName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug truncate">
                            {reg.athleteName}
                          </h4>
                          <div className="text-xs text-sky-800 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                            <span>ID: <b>{reg.athleteId}</b></span>
                            <span>·</span>
                            <span>{reg.kuCategory}</span>
                            <span>·</span>
                            <span>Lahir: <b>{reg.birthDate}</b></span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                            🏆 {reg.eventTitle}
                          </p>
                        </div>
                      </div>

                      {/* Selected Strokes Pills */}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">Nomor Lomba ({reg.selectedStrokes.length} Gaya):</span>
                          <span className="font-mono text-slate-700 font-semibold">{formatRupiah(reg.totalAmount)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {reg.selectedStrokes.map(st => (
                            <span 
                              key={st.id} 
                              className="text-[10px] font-medium bg-sky-50 text-sky-900 border border-sky-200/80 px-2 py-0.5 rounded-md"
                            >
                              🏊 {st.name} {st.seedTime ? `(${st.seedTime})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Lihat Bukti Pendaftaran */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400">
                        Daftar: {reg.createdAt}
                      </span>
                      {onViewInvoice && (
                        <button
                          type="button"
                          onClick={() => onViewInvoice(reg)}
                          className="px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-600" />
                          <span>Lihat Invoice</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: FORMULIR PENDAFTARAN ATLET                         */}
      {/* ========================================================= */}
      {activeSubTab === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <b className="block">Periksa Kembali Isian Formulir:</b>
                <span>{formError}</span>
              </div>
            </div>
          )}

          {/* Step 1: Pilih Event Kejuaraan */}
          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  1
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pilih Event Kejuaraan</h3>
                  <p className="text-xs text-slate-500">Pilih agenda kejuaraan resmi yang diikuti klub</p>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200/80 px-3 py-1 rounded-full">
                {openEvents.length} Event Buka
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {openEvents.map(evt => {
                const isSelected = selectedEventId === evt.id;
                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      setSelectedEventId(evt.id);
                      setFormError(null);
                    }}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-gradient-to-br from-sky-50/90 to-blue-50/50 shadow-xs ring-2 ring-sky-400/20'
                        : 'border-slate-200 hover:border-sky-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        evt.status === 'Buka' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {evt.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-sky-800">
                        {formatRupiah(evt.feePerStroke)}/no
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mt-2 line-clamp-2 leading-snug">
                      {evt.title}
                    </h4>

                    {/* Eligible Birth Year Display */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-sky-900 bg-white/80 p-2 rounded-xl border border-sky-100">
                      <Award className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-semibold">
                        Tahun Lahir: {evt.minBirthYear && evt.maxBirthYear
                          ? `${evt.minBirthYear} - ${evt.maxBirthYear}`
                          : evt.minBirthYear
                          ? `≥ ${evt.minBirthYear}`
                          : evt.maxBirthYear
                          ? `≤ ${evt.maxBirthYear}`
                          : 'Semua Usia'}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>{evt.eventDate}</span>
                      </div>
                      <div className="truncate">
                        Venue: <span className="font-medium text-slate-700">{evt.venuePool}</span>
                      </div>
                      <div>
                        Akomodasi: <b className="text-slate-800">{formatRupiah(evt.coachAccommodationFee)}</b>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Pilih Data Atlet (Hanya Atlet Aktif) */}
          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pilih Atlet Club</h3>
                  <p className="text-xs text-slate-500">Khusus 89 atlet aktif Acharya SC terverifikasi Sheet resmi</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{athletes.length} Atlet Aktif Sheet Resmi</span>
                </span>
              </div>
            </div>

            {/* Event Age Criteria Notice */}
            {currentEvent && (currentEvent.minBirthYear || currentEvent.maxBirthYear) && (
              <div className="mb-4 p-3 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-sky-950">
                <Award className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  Kriteria Tahun Lahir untuk <b>{currentEvent.title}</b>: Kelahiran{' '}
                  <b>
                    {currentEvent.minBirthYear && currentEvent.maxBirthYear
                      ? `${currentEvent.minBirthYear} s/d ${currentEvent.maxBirthYear}`
                      : currentEvent.minBirthYear
                      ? `minimal ${currentEvent.minBirthYear}`
                      : `maksimal ${currentEvent.maxBirthYear}`}
                  </b>
                </span>
              </div>
            )}

            {/* Search or Quick Pick */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik nama atlet untuk mencari (contoh: Ghania, Sakha, Najwa)..."
                  value={athleteSearchTerm}
                  onChange={(e) => setAthleteSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-sky-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 bg-white"
                />
              </div>

              {/* Quick Athlete Dropdown / List */}
              {athleteSearchTerm.trim() && (
                <div className="max-h-52 overflow-y-auto border border-sky-200 rounded-2xl divide-y divide-slate-100 bg-sky-50/30 p-1.5 shadow-xs">
                  {filteredAthletes.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500">
                      Tidak ditemukan atlet dengan kata kunci tersebut.
                    </div>
                  ) : (
                    filteredAthletes.map(a => {
                      const elig = isAthleteEligibleForEvent(a.birthDate, currentEvent?.minBirthYear, currentEvent?.maxBirthYear);
                      return (
                        <div
                          key={a.id}
                          onClick={() => handleSelectAthlete(a)}
                          className="p-3 hover:bg-sky-100/70 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{a.fullName}</span>
                            <span className="text-slate-500 ml-2">({a.id} · Lahir: {a.birthDate})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {elig.eligible ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Sesuai Usia
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Di Luar Rentang Usia
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800">
                              {a.trainingSchedule}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Athlete Selected Preview Card */}
              {currentAthlete ? (
                <div className="bg-gradient-to-r from-sky-50 via-blue-50/60 to-white border border-sky-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                      {currentAthlete.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-base">{currentAthlete.fullName}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          AKTIF ({currentAthlete.trainingSchedule})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                        <span>ID: <b>{currentAthlete.id}</b></span>
                        <span>·</span>
                        <span>Lahir: <b>{currentAthlete.birthDate}</b></span>
                        <span>·</span>
                        <span>Gender: <b>{currentAthlete.gender}</b></span>
                        <span>·</span>
                        <span>Sekolah: <b>{currentAthlete.school || '-'}</b></span>
                      </div>

                      {/* Age eligibility feedback */}
                      {!eligibilityCheck.eligible && (
                        <div className="mt-2 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            Perhatian: {eligibilityCheck.reason} ({currentEvent?.minBirthYear} - {currentEvent?.maxBirthYear}).
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Calculated KU Card */}
                  <div className="bg-white px-4 py-2.5 rounded-2xl border border-sky-200 shadow-2xs text-right sm:shrink-0">
                    <span className="text-[10px] font-medium text-slate-400 block">Kategori Resmi:</span>
                    <span className="text-sm font-extrabold text-sky-950 block font-mono">
                      {athleteStats?.ku}
                    </span>
                    <span className="text-[11px] text-slate-500">Usia atlet: {athleteStats?.age} Tahun</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-sky-200 rounded-2xl bg-sky-50/30">
                  <User className="w-8 h-8 mx-auto text-sky-300 mb-1" />
                  <p className="text-xs text-slate-700 font-bold">Belum ada atlet yang dipilih.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Ketik nama di kolom pencarian atau pilih dari daftar cepat di bawah ini:</p>
                  {/* Fast select chips for top athletes */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                    {athletes.slice(0, 6).map(a => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleSelectAthlete(a)}
                        className="px-3 py-1.5 text-xs bg-white border border-sky-200 hover:border-sky-400 hover:bg-sky-50 rounded-xl text-slate-700 hover:text-sky-900 transition-colors shadow-2xs cursor-pointer"
                      >
                        + {a.fullName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Nomor Gaya Perlombaan */}
          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  3
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pilih Nomor Gaya Yang Diikuti</h3>
                  <p className="text-xs text-slate-500">
                    Biaya per nomor: <b>{formatRupiah(currentEvent?.feePerStroke || 0)}</b>. Boleh memilih lebih dari 1 nomor.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200/80 px-3 py-1 rounded-full">
                {selectedStrokeIds.length} Nomor Dipilih
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentEvent?.availableStrokes.map(st => {
                const isSelected = selectedStrokeIds.includes(st.id);
                return (
                  <div
                    key={st.id}
                    onClick={() => toggleStroke(st.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 shadow-xs ring-2 ring-sky-400/20'
                        : 'border-slate-200 bg-white hover:border-sky-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                          isSelected ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{st.name}</span>
                          <span className="text-[11px] text-slate-500">Gaya {st.stroke} · {st.distance}m</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-sky-800">
                        {formatRupiah(currentEvent.feePerStroke)}
                      </span>
                    </div>

                    {isSelected && (
                      <div 
                        className="mt-3 pt-2.5 border-t border-sky-200/60"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="text-[10px] font-medium text-slate-500 block mb-1">
                          Catatan Waktu Terbaik / Seed Time (Opsional):
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: 00:42.50 atau NT"
                          value={seedTimes[st.id] || ''}
                          onChange={(e) => handleSeedTimeChange(st.id, e.target.value)}
                          className="w-full px-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Ringkasan Biaya & Kontak Orang Tua (Soft Child-Friendly Colors) */}
          <div className="bg-gradient-to-br from-sky-50 via-blue-50/60 to-indigo-50/50 text-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-sky-200">
            <div className="flex items-center justify-between pb-4 border-b border-sky-200/80 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  4
                </span>
                <div>
                  <h3 className="font-bold text-sky-950 text-base">Rincian Tagihan & Konfirmasi</h3>
                  <p className="text-xs text-sky-700">Invoice resmi diterbitkan otomatis dan dapat diunduh</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Total Tagihan:</span>
                <span className="text-xl sm:text-2xl font-black text-sky-900 font-mono tracking-tight">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Breakdown itemized */}
              <div className="space-y-2 text-xs bg-white/80 p-4 rounded-2xl border border-sky-100 shadow-2xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Nomor Perlombaan ({selectedStrokeIds.length} nomor):</span>
                  <span className="font-mono font-bold text-slate-900">{formatRupiah(strokeFee)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <div>
                    <span className="text-slate-600 block">Akomodasi & Official Pelatih:</span>
                    <span className="text-[10px] text-slate-400">Hotel, transportasi, & pendampingan lomba</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatRupiah(coachAccommodationFee)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Biaya Administrasi:</span>
                  <span className="font-mono font-bold text-slate-900">{formatRupiah(adminFee)}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-sky-900">
                  <span>TOTAL PEMBAYARAN:</span>
                  <span className="font-mono text-base">{formatRupiah(totalAmount)}</span>
                </div>
              </div>

              {/* Parent Contact input */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    No. WhatsApp Orang Tua / Wali untuk Konfirmasi:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 08123456789"
                      value={parentContact}
                      onChange={(e) => setParentContact(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white/70 rounded-xl border border-sky-100 text-[11px] text-slate-600 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Setelah menekan tombol daftar, bukti invoice resmi beserta QRIS & petunjuk pembayaran akan langsung tampil di layar dan tersimpan otomatis.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!currentEvent || !currentAthlete || selectedStrokeIds.length === 0}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Award className="w-4 h-4" />
                  <span>Daftarkan Sekarang ({formatRupiah(totalAmount)})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Real-Time Preview of Participants in this Event */}
          {currentEventParticipants.length > 0 && (
            <div className="bg-white/90 rounded-3xl p-5 border border-sky-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏊</span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Peserta Terdaftar di {currentEvent.title} ({currentEventParticipants.length} Atlet)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setListEventFilter(currentEvent.id);
                    setActiveSubTab('list');
                  }}
                  className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Semua Peserta</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentEventParticipants.slice(0, 3).map(p => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{p.athleteName}</div>
                      <div className="text-[10px] text-slate-500">{p.kuCategory} · {p.selectedStrokes.length} Gaya</div>
                    </div>
                    {onViewInvoice && (
                      <button
                        type="button"
                        onClick={() => onViewInvoice(p)}
                        className="text-[10px] text-sky-700 font-bold hover:underline cursor-pointer"
                      >
                        Lihat
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
