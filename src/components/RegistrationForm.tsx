import React, { useState, useMemo } from 'react';
import { SwimmingEvent, Athlete, RegistrationEntry, EventStroke } from '../types';
import { calculateAgeAndKU, formatRupiah, generatePaymentRef } from '../utils/helpers';
import { Waves, Calendar, User, Check, Plus, AlertCircle, Award, CheckCircle2, ChevronRight, Search, ShieldCheck } from 'lucide-react';

interface RegistrationFormProps {
  events: SwimmingEvent[];
  athletes: Athlete[];
  onCompleteRegistration: (reg: RegistrationEntry) => void;
  onSelectEventView?: (eventId: string) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  events,
  athletes,
  onCompleteRegistration,
}) => {
  // Only open events can be registered for
  const openEvents = useMemo(() => events.filter(e => e.status === 'Buka' || e.status === 'Segera Ditutup'), [events]);

  const [selectedEventId, setSelectedEventId] = useState<string>(openEvents[0]?.id || '');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [athleteSearchTerm, setAthleteSearchTerm] = useState<string>('');
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<string[]>([]);
  const [seedTimes, setSeedTimes] = useState<Record<string, string>>({});
  const [parentContact, setParentContact] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

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
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Hero Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
          <Waves className="w-3.5 h-3.5 text-blue-600" />
          <span>Formulir Pendaftaran Atlet Khusus Acharya Swimming Club</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          Pendaftaran Kejuaraan Renang
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          Pilih event resmi yang dibuat pelatih/admin, pilih atlet aktif, tentukan nomor gaya, dan lakukan verifikasi pembayaran otomatis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Pilih Event Kejuaraan */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-blue-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pilih Event Kejuaraan</h3>
                <p className="text-xs text-slate-500">Hanya event yang telah dibuat & diverifikasi oleh Admin</p>
              </div>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              {openEvents.length} Event Tersedia
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {openEvents.map(evt => {
              const isSelected = selectedEventId === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      evt.status === 'Buka' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {evt.status}
                    </span>
                    <span className="text-xs font-mono font-semibold text-blue-700">
                      {formatRupiah(evt.feePerStroke)}/no
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-2 line-clamp-2 leading-snug">
                    {evt.title}
                  </h4>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{evt.eventDate}</span>
                    </div>
                    <div className="truncate">
                      Venue: <span className="font-medium text-slate-700">{evt.venuePool}</span>
                    </div>
                    <div>
                      Akomodasi Pelatih: <b className="text-slate-800">{formatRupiah(evt.coachAccommodationFee)}</b>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Pilih Data Atlet (Hanya Atlet Aktif) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-blue-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pilih Atlet Club</h3>
                <p className="text-xs text-slate-500">Khusus anggota Acharya SC (Hanya status Aktif yang dapat bertanding)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{athletes.length} Atlet Aktif (Sheet Resmi)</span>
              </span>
            </div>
          </div>

          {/* Search or Quick Pick */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atlet Acharya SC, ID, atau sekolah..."
                value={athleteSearchTerm}
                onChange={(e) => setAthleteSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Quick Athlete Dropdown / List */}
            {athleteSearchTerm.trim() && (
              <div className="max-h-48 overflow-y-auto border border-blue-100 rounded-xl divide-y divide-slate-100 bg-slate-50/50 p-1">
                {filteredAthletes.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500">
                    Tidak ditemukan atlet dengan kata kunci tersebut.
                  </div>
                ) : (
                  filteredAthletes.map(a => (
                    <div
                      key={a.id}
                      onClick={() => handleSelectAthlete(a)}
                      className="p-2.5 hover:bg-blue-100/60 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{a.fullName}</span>
                        <span className="text-slate-500 ml-2">({a.id} · Lahir: {a.birthDate})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        a.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {a.isActive ? `Jadwal: ${a.trainingSchedule}` : 'Rest (Non-aktif)'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Athlete Selected Preview Card */}
            {currentAthlete ? (
              <div className="bg-gradient-to-r from-blue-50 via-cyan-50/40 to-white border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {currentAthlete.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-base">{currentAthlete.fullName}</h4>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
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
                  </div>
                </div>

                {/* Calculated KU Pill */}
                <div className="bg-white px-3.5 py-2 rounded-xl border border-blue-200 shadow-2xs text-right sm:shrink-0">
                  <span className="text-[10px] font-medium text-slate-400 block">Kategori Resmi:</span>
                  <span className="text-sm font-extrabold text-blue-900 block font-mono">
                    {athleteStats?.ku}
                  </span>
                  <span className="text-[11px] text-slate-500">Usia atlet: {athleteStats?.age} Tahun</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <User className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                <p className="text-xs text-slate-600 font-medium">Belum ada atlet yang dipilih.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Ketik nama di kolom pencarian atau pilih dari daftar cepat.</p>
                {/* Fast select chips for top athletes */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                  {athletes.filter(a => a.isActive).slice(0, 6).map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleSelectAthlete(a)}
                      className="px-2.5 py-1 text-xs bg-white border border-slate-200 hover:border-blue-400 rounded-md text-slate-700 hover:text-blue-700 transition-colors"
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
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-blue-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pilih Nomor Gaya Yang Diikuti</h3>
                <p className="text-xs text-slate-500">
                  Biaya per nomor: <b>{formatRupiah(currentEvent?.feePerStroke || 0)}</b>. Dapat memilih lebih dari 1 nomor.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
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
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{st.name}</span>
                        <span className="text-[11px] text-slate-500">Gaya {st.stroke} · {st.distance}m</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-blue-700">
                      {formatRupiah(currentEvent.feePerStroke)}
                    </span>
                  </div>

                  {isSelected && (
                    <div 
                      className="mt-3 pt-2.5 border-t border-blue-200/60"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="text-[10px] font-medium text-slate-500 block mb-1">
                        Best Time / Catatan Waktu (Opsional):
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 00:42.50 atau NT"
                        value={seedTimes[st.id] || ''}
                        onChange={(e) => handleSeedTimeChange(st.id, e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Ringkasan Biaya & Kontak Orang Tua */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-800">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-cyan-500 text-blue-950 font-bold text-xs flex items-center justify-center">4</span>
              <div>
                <h3 className="font-bold text-white text-base">Rincian Tagihan & Konfirmasi Pendaftaran</h3>
                <p className="text-xs text-blue-200">Invoice rekap resmi diterbitkan untuk dikonfirmasikan ke admin</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-blue-200 block">Total Biaya:</span>
              <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono tracking-tight">
                {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Breakdown itemized */}
            <div className="space-y-2 text-xs bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-slate-300">Biaya Nomor Perlombaan ({selectedStrokeIds.length} nomor):</span>
                <span className="font-mono font-semibold text-white">{formatRupiah(strokeFee)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <div>
                  <span className="text-slate-300 block">Akomodasi & Official Pelatih:</span>
                  <span className="text-[10px] text-blue-300">Hotel, transportasi, konsumsi & pendampingan pelatih</span>
                </div>
                <span className="font-mono font-semibold text-white">{formatRupiah(coachAccommodationFee)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-slate-300">Biaya Administrasi & Sistem:</span>
                <span className="font-mono font-semibold text-white">{formatRupiah(adminFee)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-cyan-300">
                <span>TOTAL TAGIHAN:</span>
                <span className="font-mono">{formatRupiah(totalAmount)}</span>
              </div>
            </div>

            {/* Parent Contact input */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">
                  Nomor WhatsApp Orang Tua / Wali untuk Konfirmasi:
                </label>
                <input
                  type="text"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  placeholder="Contoh: 085716555746"
                  className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                />
              </div>

              {formError && (
                <div className="p-3 bg-red-500/20 border border-red-400/40 rounded-xl flex items-center gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-300 hover:to-blue-200 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-sm cursor-pointer min-h-[48px]"
              >
                <ShieldCheck className="w-5 h-5 text-blue-900" />
                <span>Kirim Pendaftaran & Buat Invoice ({formatRupiah(totalAmount)})</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
              <p className="text-[11px] text-center text-blue-300/80">
                Invoice resmi akan langsung terbit untuk Anda teruskan dan konfirmasikan ke Admin Acharya SC.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Floating Summary & Action Bar */}
        {selectedStrokeIds.length > 0 && currentAthlete && (
          <div className="md:hidden fixed bottom-[58px] left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 border-t border-slate-700/80 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
            <div className="truncate">
              <span className="text-[10px] text-cyan-200 block truncate font-medium">
                {currentAthlete.fullName} · {selectedStrokeIds.length} Nomor
              </span>
              <span className="text-sm font-black text-white font-mono">
                {formatRupiah(totalAmount)}
              </span>
            </div>
            <button
              type="submit"
              className="py-2.5 px-4 bg-gradient-to-r from-cyan-400 to-blue-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95 transition-transform"
            >
              <span>Kirim Invoice</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
