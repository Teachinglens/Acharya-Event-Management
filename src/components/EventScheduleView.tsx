import React, { useState } from 'react';
import { SwimmingEvent } from '../types';
import { formatRupiah } from '../utils/helpers';
import { Calendar, MapPin, Clock, Trophy, ChevronRight, CheckCircle, Users, Award, ShieldAlert } from 'lucide-react';

interface EventScheduleViewProps {
  events: SwimmingEvent[];
  onSelectEventToRegister: (eventId: string) => void;
}

export const EventScheduleView: React.FC<EventScheduleViewProps> = ({
  events,
  onSelectEventToRegister
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase block">Jadwal & Agenda Perlombaan</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif tracking-tight mt-1">
          Kalender Kejuaraan Renang 2026
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
          Daftar kejuaraan resmi yang diikuti tim Acharya Swimming Club Pandeglang. Pastikan atlet mendaftar sebelum batas akhir pendaftaran.
        </p>
      </div>

      {/* Main Grid: Left Event List, Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Event List Cards */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Daftar Kejuaraan Aktif ({events.length})
          </div>
          {events.map(evt => {
            const isSelected = evt.id === selectedEventId;
            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-white shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white/70 hover:bg-white hover:border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    evt.status === 'Buka'
                      ? 'bg-emerald-100 text-emerald-800'
                      : evt.status === 'Segera Ditutup'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {evt.status}
                  </span>
                  <span className="text-xs font-mono font-semibold text-blue-700">
                    {evt.eventDate}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {evt.title}
                </h3>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-sky-800">
                  <Award className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="font-medium">
                    Tahun Lahir: {evt.minBirthYear && evt.maxBirthYear
                      ? `${evt.minBirthYear} - ${evt.maxBirthYear}`
                      : evt.minBirthYear
                      ? `≥ ${evt.minBirthYear}`
                      : evt.maxBirthYear
                      ? `≤ ${evt.maxBirthYear}`
                      : 'Semua Tahun Lahir'}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[150px]">{evt.venuePool}</span>
                  <span className="font-mono text-blue-900 font-semibold">{formatRupiah(evt.feePerStroke)}/no</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Event Guide & Stroke Matrix */}
        {activeEvent && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 tracking-wider uppercase block">Detail Kejuaraan & Jadwal Sesi</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight font-serif mt-0.5">
                  {activeEvent.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Penyelenggara: {activeEvent.organizer}</p>
              </div>

              <button
                onClick={() => onSelectEventToRegister(activeEvent.id)}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Daftar Kejuaraan Ini</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100">
                <span className="text-slate-500 block text-[11px]">Tanggal Lomba:</span>
                <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>{activeEvent.eventDate}</span>
                </div>
              </div>

              <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100">
                <span className="text-slate-500 block text-[11px]">Batas Pendaftaran:</span>
                <div className="font-bold text-amber-700 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{activeEvent.registrationDeadline}</span>
                </div>
              </div>

              <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100">
                <span className="text-slate-500 block text-[11px]">Tahun Lahir:</span>
                <div className="font-bold text-sky-900 mt-0.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-sky-600" />
                  <span>
                    {activeEvent.minBirthYear && activeEvent.maxBirthYear
                      ? `${activeEvent.minBirthYear} - ${activeEvent.maxBirthYear}`
                      : activeEvent.minBirthYear
                      ? `≥ ${activeEvent.minBirthYear}`
                      : activeEvent.maxBirthYear
                      ? `≤ ${activeEvent.maxBirthYear}`
                      : 'Semua Usia'}
                  </span>
                </div>
              </div>

              <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100">
                <span className="text-slate-500 block text-[11px]">Tarif per Nomor:</span>
                <div className="font-mono font-bold text-sky-800 mt-0.5">
                  {formatRupiah(activeEvent.feePerStroke)}
                </div>
              </div>

              <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100">
                <span className="text-slate-500 block text-[11px]">Akomodasi Pelatih:</span>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {formatRupiah(activeEvent.coachAccommodationFee)}
                </div>
              </div>
            </div>

            {/* Venue pool card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3 text-xs">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">{activeEvent.venuePool}</div>
                <div className="text-slate-500 mt-0.5">{activeEvent.location}</div>
                {activeEvent.notes && (
                  <div className="mt-2 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-semibold text-blue-900">Catatan Pelatih: </span>
                    {activeEvent.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Available Strokes Matrix */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 text-sm">Nomor Perlombaan Resmi</h4>
                <span className="text-xs text-slate-500 font-mono">{activeEvent.availableStrokes.length} Nomor</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeEvent.availableStrokes.map((st, i) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-mono font-bold text-[10px] flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{st.name}</div>
                        <div className="text-[11px] text-slate-400">Gaya {st.stroke} · {st.distance} Meter</div>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-blue-700">
                      {formatRupiah(activeEvent.feePerStroke)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules and Eligibility info */}
            <div className="bg-blue-50/40 border border-blue-200/70 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
                <Award className="w-4 h-4 text-blue-700" />
                <span>Ketentuan Partisipasi Atlet Acharya SC:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Atlet harus berstatus <b>Aktif</b> (memiliki jadwal latihan rutin, bukan status rest).</li>
                <li>Kelompok umur (KU) dihitung otomatis oleh sistem berdasarkan tanggal lahir resmi.</li>
                <li>Biaya akomodasi pelatih mencakup penginapan, makan, serta pendampingan teknis pelatih kepala selama hari perlombaan.</li>
                <li>Pembayaran otomatis langsung terhubung ke gateway QRIS / Virtual Account resmi Club.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
