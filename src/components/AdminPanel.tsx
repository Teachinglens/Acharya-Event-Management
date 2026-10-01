import React, { useState, useMemo } from 'react';
import { SwimmingEvent, Athlete, RegistrationEntry, EventStroke, StrokeCategory } from '../types';
import { formatRupiah, calculateAgeAndKU } from '../utils/helpers';
import { exportRegistrationsToExcel } from '../utils/excelExport';
import { 
  Plus, Edit, Trash2, Calendar, Users, DollarSign, Download, Filter, 
  Search, CheckCircle2, XCircle, AlertCircle, Eye, Printer, Award, 
  FileSpreadsheet, ListPlus, X, AlertTriangle, Layers, Cloud, RefreshCw, Check
} from 'lucide-react';

interface AdminPanelProps {
  events: SwimmingEvent[];
  athletes: Athlete[];
  registrations: RegistrationEntry[];
  onAddEvent: (evt: SwimmingEvent) => void;
  onUpdateEvent: (evt: SwimmingEvent) => void;
  onDeleteEvent: (id: string) => void;
  onAddAthlete: (athlete: Athlete) => void;
  onToggleAthleteStatus: (id: string) => void;
  onUpdateRegStatus: (regId: string, status: 'paid' | 'pending' | 'cancelled') => void;
  onDeleteRegistration: (id: string) => void;
  onViewRegCard: (reg: RegistrationEntry) => void;
  onForceSyncCloud?: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  events,
  athletes,
  registrations,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onAddAthlete,
  onToggleAthleteStatus,
  onUpdateRegStatus,
  onDeleteRegistration,
  onViewRegCard,
  onForceSyncCloud,
}) => {
  const [adminTab, setAdminTab] = useState<'registrations' | 'events' | 'athletes'>('registrations');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSyncCloud = async () => {
    if (!onForceSyncCloud) return;
    setIsSyncing(true);
    try {
      await onForceSyncCloud();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to sync to cloud:', e);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Filter states
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [athleteFilterTab, setAthleteFilterTab] = useState<'active' | 'rest' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Confirmation States
  const [eventToDelete, setEventToDelete] = useState<SwimmingEvent | null>(null);
  const [regToDelete, setRegToDelete] = useState<RegistrationEntry | null>(null);

  // New Event Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SwimmingEvent | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventOrganizer, setNewEventOrganizer] = useState('Acharya SC & Pengkab Pandeglang');
  const [newEventVenue, setNewEventVenue] = useState('Kolam Renang Cas Waterpark Pandeglang');
  const [newEventLocation, setNewEventLocation] = useState('Pandeglang, Banten');
  const [newEventDate, setNewEventDate] = useState('2026-11-20');
  const [newEventDeadline, setNewEventDeadline] = useState('2026-11-10');
  const [newEventFee, setNewEventFee] = useState<number>(65000);
  const [newEventAccommodation, setNewEventAccommodation] = useState<number>(150000);
  const [newEventStatus, setNewEventStatus] = useState<'Buka' | 'Segera Ditutup' | 'Tutup' | 'Selesai'>('Buka');
  const [newEventNotes, setNewEventNotes] = useState('');
  
  // Event Strokes state (Input Manual Nomor Perlombaan)
  const [currentEventStrokes, setCurrentEventStrokes] = useState<EventStroke[]>([]);
  const [manualStrokeName, setManualStrokeName] = useState('50m Gaya Dada');
  const [manualStrokeCategory, setManualStrokeCategory] = useState<StrokeCategory>('Dada');
  const [manualStrokeDistance, setManualStrokeDistance] = useState<number>(50);

  // Quick stroke manage modal directly for an event
  const [managingStrokesEvent, setManagingStrokesEvent] = useState<SwimmingEvent | null>(null);

  // New Athlete Modal State
  const [showAthleteModal, setShowAthleteModal] = useState(false);
  const [newAthName, setNewAthName] = useState('');
  const [newAthBirth, setNewAthBirth] = useState('');
  const [newAthGender, setNewAthGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [newAthSchool, setNewAthSchool] = useState('');
  const [newAthParent, setNewAthParent] = useState('');
  const [newAthPhone, setNewAthPhone] = useState('');
  const [newAthSchedule, setNewAthSchedule] = useState('Minggu');

  // Stats calculation
  const totalRegistrations = registrations.length;
  const paidRegistrations = registrations.filter(r => r.paymentStatus === 'paid');
  const totalRevenue = paidRegistrations.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const activeAthletesCount = athletes.filter(a => a.isActive).length;
  const restAthletesCount = athletes.filter(a => !a.isActive).length;

  // Filtered registrations
  const filteredRegs = useMemo(() => {
    return registrations.filter(r => {
      if (selectedEventFilter !== 'all' && r.eventId !== selectedEventFilter) return false;
      if (selectedStatusFilter !== 'all' && r.paymentStatus !== selectedStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.athleteName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.athleteId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [registrations, selectedEventFilter, selectedStatusFilter, searchQuery]);

  // Filtered Athletes
  const filteredAthletes = useMemo(() => {
    return athletes.filter(a => {
      if (athleteFilterTab === 'active' && !a.isActive) return false;
      if (athleteFilterTab === 'rest' && a.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.fullName.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          (a.school && a.school.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [athletes, athleteFilterTab, searchQuery]);

  // Handle adding a manual stroke to the modal list
  const handleAddManualStroke = () => {
    const name = manualStrokeName.trim() || `${manualStrokeDistance}m Gaya ${manualStrokeCategory}`;
    const newStroke: EventStroke = {
      id: `st-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      stroke: manualStrokeCategory,
      distance: Number(manualStrokeDistance) || 50,
    };
    setCurrentEventStrokes(prev => [...prev, newStroke]);
  };

  const handleRemoveStroke = (id: string) => {
    setCurrentEventStrokes(prev => prev.filter(s => s.id !== id));
  };

  // Preset Template loader
  const handleLoadPresetStrokes = (type: 'sprint50' | 'standard100' | 'fullPackage' | 'clear') => {
    if (type === 'clear') {
      setCurrentEventStrokes([]);
      return;
    }
    if (type === 'sprint50') {
      const sprintStrokes: EventStroke[] = [
        { id: `sp-1-${Date.now()}`, name: '50m Gaya Bebas', stroke: 'Bebas', distance: 50 },
        { id: `sp-2-${Date.now()}`, name: '50m Gaya Dada', stroke: 'Dada', distance: 50 },
        { id: `sp-3-${Date.now()}`, name: '50m Gaya Punggung', stroke: 'Punggung', distance: 50 },
        { id: `sp-4-${Date.now()}`, name: '50m Gaya Kupu-Kupu', stroke: 'Kupu-Kupu', distance: 50 },
      ];
      setCurrentEventStrokes(prev => [...prev, ...sprintStrokes]);
    } else if (type === 'standard100') {
      const st100: EventStroke[] = [
        { id: `st100-1-${Date.now()}`, name: '100m Gaya Bebas', stroke: 'Bebas', distance: 100 },
        { id: `st100-2-${Date.now()}`, name: '100m Gaya Dada', stroke: 'Dada', distance: 100 },
        { id: `st100-3-${Date.now()}`, name: '100m Gaya Punggung', stroke: 'Punggung', distance: 100 },
        { id: `st100-4-${Date.now()}`, name: '100m Gaya Kupu-Kupu', stroke: 'Kupu-Kupu', distance: 100 },
      ];
      setCurrentEventStrokes(prev => [...prev, ...st100]);
    } else if (type === 'fullPackage') {
      const full: EventStroke[] = [
        { id: `f-1-${Date.now()}`, name: '50m Gaya Bebas', stroke: 'Bebas', distance: 50 },
        { id: `f-2-${Date.now()}`, name: '100m Gaya Bebas', stroke: 'Bebas', distance: 100 },
        { id: `f-3-${Date.now()}`, name: '200m Gaya Bebas', stroke: 'Bebas', distance: 200 },
        { id: `f-4-${Date.now()}`, name: '50m Gaya Dada', stroke: 'Dada', distance: 50 },
        { id: `f-5-${Date.now()}`, name: '100m Gaya Dada', stroke: 'Dada', distance: 100 },
        { id: `f-6-${Date.now()}`, name: '50m Gaya Punggung', stroke: 'Punggung', distance: 50 },
        { id: `f-7-${Date.now()}`, name: '50m Gaya Kupu-Kupu', stroke: 'Kupu-Kupu', distance: 50 },
        { id: `f-8-${Date.now()}`, name: '200m Gaya Ganti Perorangan', stroke: 'Ganti Perorangan', distance: 200 },
        { id: `f-9-${Date.now()}`, name: '4x50m Estafet Gaya Bebas', stroke: 'Estafet', distance: 200 },
      ];
      setCurrentEventStrokes(full);
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    // Fallback if no strokes are specified
    const strokesToSave = currentEventStrokes.length > 0 ? currentEventStrokes : [
      { id: 'st1', name: '50m Gaya Bebas', stroke: 'Bebas' as StrokeCategory, distance: 50 },
      { id: 'st2', name: '50m Gaya Dada', stroke: 'Dada' as StrokeCategory, distance: 50 },
    ];

    if (editingEvent) {
      const updated: SwimmingEvent = {
        ...editingEvent,
        title: newEventTitle,
        organizer: newEventOrganizer,
        venuePool: newEventVenue,
        location: newEventLocation,
        eventDate: newEventDate,
        registrationDeadline: newEventDeadline,
        feePerStroke: Number(newEventFee),
        coachAccommodationFee: Number(newEventAccommodation),
        status: newEventStatus,
        notes: newEventNotes,
        availableStrokes: strokesToSave,
      };
      onUpdateEvent(updated);
    } else {
      const newEvt: SwimmingEvent = {
        id: `EVT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        title: newEventTitle,
        organizer: newEventOrganizer,
        venuePool: newEventVenue,
        location: newEventLocation,
        eventDate: newEventDate,
        registrationDeadline: newEventDeadline,
        feePerStroke: Number(newEventFee),
        coachAccommodationFee: Number(newEventAccommodation),
        status: newEventStatus,
        notes: newEventNotes,
        availableStrokes: strokesToSave,
      };
      onAddEvent(newEvt);
    }

    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleOpenEditEvent = (evt: SwimmingEvent) => {
    setEditingEvent(evt);
    setNewEventTitle(evt.title);
    setNewEventOrganizer(evt.organizer);
    setNewEventVenue(evt.venuePool);
    setNewEventLocation(evt.location);
    setNewEventDate(evt.eventDate);
    setNewEventDeadline(evt.registrationDeadline);
    setNewEventFee(evt.feePerStroke);
    setNewEventAccommodation(evt.coachAccommodationFee);
    setNewEventStatus(evt.status);
    setNewEventNotes(evt.notes || '');
    setCurrentEventStrokes(evt.availableStrokes || []);
    setShowEventModal(true);
  };

  const handleOpenNewEvent = () => {
    setEditingEvent(null);
    setNewEventTitle('');
    setNewEventOrganizer('Acharya SC & Pengkab Pandeglang');
    setNewEventVenue('Kolam Renang CAS Waterpark Pandeglang');
    setNewEventLocation('Pandeglang, Banten');
    setNewEventDate('2026-11-20');
    setNewEventDeadline('2026-11-10');
    setNewEventFee(65000);
    setNewEventAccommodation(150000);
    setNewEventStatus('Buka');
    setNewEventNotes('');
    setCurrentEventStrokes([
      { id: 'st1', name: '50m Gaya Bebas', stroke: 'Bebas', distance: 50 },
      { id: 'st2', name: '100m Gaya Bebas', stroke: 'Bebas', distance: 100 },
      { id: 'st3', name: '50m Gaya Dada', stroke: 'Dada', distance: 50 },
      { id: 'st4', name: '100m Gaya Dada', stroke: 'Dada', distance: 100 },
      { id: 'st5', name: '50m Gaya Punggung', stroke: 'Punggung', distance: 50 },
      { id: 'st6', name: '50m Gaya Kupu-Kupu', stroke: 'Kupu-Kupu', distance: 50 }
    ]);
    setShowEventModal(true);
  };

  const handleConfirmDeleteEvent = () => {
    if (eventToDelete) {
      onDeleteEvent(eventToDelete.id);
      setEventToDelete(null);
    }
  };

  const handleSaveAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthName.trim() || !newAthBirth.trim()) return;

    const newId = `ASC.0926.${athletes.length + 1}`.padStart(3, '0');
    const athlete: Athlete = {
      id: newId,
      fullName: newAthName.trim(),
      birthDate: newAthBirth.trim(),
      gender: newAthGender,
      school: newAthSchool.trim() || 'Pandeglang',
      parentName: newAthParent.trim() || '-',
      parentPhone: newAthPhone.trim() || '-',
      trainingSchedule: newAthSchedule,
      isActive: newAthSchedule.toLowerCase() !== 'rest',
    };

    onAddAthlete(athlete);
    setShowAthleteModal(false);
    setNewAthName('');
    setNewAthBirth('');
  };

  // Export Excel (.xlsx) rapi & resmi untuk Meet Manager / PRSI
  const handleExportExcel = () => {
    const selectedEventObj = events.find(e => e.id === selectedEventFilter);
    const eventFilterTitle = selectedEventObj ? selectedEventObj.title : 'Semua Kejuaraan';
    exportRegistrationsToExcel(filteredRegs, eventFilterTitle);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner and KPI Metric Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-xs">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Admin Management Dashboard</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
            Panel Pengelola Acharya SC
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola event kejuaraan, input manual nomor perlombaan, database atlet aktif/rest, dan verifikasi pendaftaran atlet.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {onForceSyncCloud && (
            <button
              onClick={handleSyncCloud}
              disabled={isSyncing}
              className="px-3.5 py-2 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
              title="Kirim dan sinkronkan semua event ke Cloud Firestore agar HP lain langsung terupdate"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : syncSuccess ? 'Tersinkronkan ke Semua HP!' : 'Sinkronkan ke Semua HP'}</span>
            </button>
          )}

          {adminTab === 'events' && (
            <button
              onClick={handleOpenNewEvent}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Event Baru</span>
            </button>
          )}

          {adminTab === 'athletes' && (
            <button
              onClick={() => setShowAthleteModal(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Atlet Baru</span>
            </button>
          )}

          {adminTab === 'registrations' && (
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer shrink-0"
              title="Download file Excel resmi berisi rekap keuangan dan entry list lomba"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Rekap Excel (.xlsx)</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Pendaftar Tim</div>
          <div className="text-xl sm:text-2xl font-black text-blue-900 font-mono mt-1">
            {totalRegistrations} <span className="text-xs font-normal text-slate-500 font-sans">atlet</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {paidRegistrations.length} Sudah Terverifikasi Lunas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Dana Masuk Gateway</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Nomor gaya + akomodasi pelatih</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Database Atlet Aktif</div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 font-mono mt-1">
            {activeAthletesCount} <span className="text-xs font-normal text-slate-500 font-sans">siap lomba</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {restAthletesCount} Status Rest (non-aktif)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Event Perlombaan</div>
          <div className="text-xl sm:text-2xl font-black text-purple-700 font-mono mt-1">
            {events.length} <span className="text-xs font-normal text-slate-500 font-sans">kejuaraan</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {events.filter(e => e.status === 'Buka').length} Pendaftaran dibuka
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full overflow-x-auto flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold no-scrollbar">
        <button
          onClick={() => { setAdminTab('registrations'); setSearchQuery(''); }}
          className={`px-3.5 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            adminTab === 'registrations' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rekap Pendaftaran ({registrations.length})
        </button>
        <button
          onClick={() => { setAdminTab('events'); setSearchQuery(''); }}
          className={`px-3.5 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            adminTab === 'events' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Kelola Jadwal & Event ({events.length})
        </button>
        <button
          onClick={() => { setAdminTab('athletes'); setSearchQuery(''); }}
          className={`px-3.5 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            adminTab === 'athletes' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Data Atlet Master ({athletes.length})
        </button>
      </div>

      {/* TAB 1: REGISTRATIONS MANAGEMENT */}
      {adminTab === 'registrations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row gap-2.5 sm:gap-3 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">Semua Kejuaraan</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">Semua Status Bayar</option>
                <option value="paid">Lunas (Paid)</option>
                <option value="pending">Menunggu (Pending)</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari atlet atau kode reg..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer shrink-0"
                title="Download Rekap Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh Excel</span>
              </button>
            </div>
          </div>

          {/* Mobile Card View (For Phones) */}
          <div className="md:hidden divide-y divide-slate-100 p-2 space-y-2">
            {filteredRegs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada data pendaftaran yang sesuai kriteria.
              </div>
            ) : (
              filteredRegs.map(reg => (
                <div key={reg.id} className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {reg.id}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      reg.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : reg.paymentStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {reg.paymentStatus === 'paid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {reg.paymentStatus === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                      {reg.paymentStatus === 'paid' ? 'LUNAS' : reg.paymentStatus === 'pending' ? 'MENUNGGU' : 'BATAL'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{reg.athleteName}</h4>
                    <p className="text-[11px] text-slate-500">
                      {reg.athleteId} · {reg.kuCategory} · {reg.gender}
                    </p>
                    <p className="text-[11px] font-medium text-blue-900 mt-0.5 truncate">
                      {reg.eventTitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {reg.selectedStrokes.map(s => (
                      <span key={s.id} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        {s.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Biaya:</span>
                      <span className="font-mono font-black text-blue-900 text-sm">
                        {formatRupiah(reg.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewRegCard(reg)}
                        className="p-2 text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg min-h-[36px] flex items-center gap-1"
                        title="Lihat / Cetak Kartu"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">Cetak</span>
                      </button>

                      {reg.paymentStatus !== 'paid' ? (
                        <button
                          onClick={() => onUpdateRegStatus(reg.id, 'paid')}
                          className="px-2.5 py-2 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 min-h-[36px]"
                        >
                          Verifikasi
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateRegStatus(reg.id, 'pending')}
                          className="p-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:text-amber-600 min-h-[36px]"
                          title="Ubah ke Pending"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setRegToDelete(reg)}
                        className="p-2 text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg min-h-[36px]"
                        title="Hapus Pendaftaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">No Reg</th>
                  <th className="py-3 px-4">Nama Atlet</th>
                  <th className="py-3 px-4">Kategori KU</th>
                  <th className="py-3 px-4">Kejuaraan</th>
                  <th className="py-3 px-4">Nomor Gaya</th>
                  <th className="py-3 px-4 text-right">Total Biaya</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data pendaftaran yang sesuai kriteria.
                    </td>
                  </tr>
                ) : (
                  filteredRegs.map(reg => (
                    <tr key={reg.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{reg.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{reg.athleteName}</div>
                        <div className="text-[11px] text-slate-500">{reg.athleteId} · {reg.gender}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-700">{reg.kuCategory}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate text-slate-800 font-medium" title={reg.eventTitle}>
                          {reg.eventTitle}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {reg.selectedStrokes.map(s => (
                            <span key={s.id} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(reg.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          reg.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : reg.paymentStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {reg.paymentStatus === 'paid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {reg.paymentStatus === 'pending' && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                          {reg.paymentStatus === 'paid' ? 'LUNAS' : reg.paymentStatus === 'pending' ? 'MENUNGGU' : 'BATAL'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewRegCard(reg)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Lihat / Cetak Kartu"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {reg.paymentStatus !== 'paid' ? (
                            <button
                              onClick={() => onUpdateRegStatus(reg.id, 'paid')}
                              className="px-2 py-1 text-[10px] font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              title="Tandai Lunas"
                            >
                              Verifikasi
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateRegStatus(reg.id, 'pending')}
                              className="p-1 text-slate-400 hover:text-amber-600"
                              title="Ubah ke Pending"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setRegToDelete(reg)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Hapus Pendaftaran Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EVENTS & JADWAL MANAGEMENT */}
      {adminTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-xl text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <b>Manajemen Jadwal & Nomor:</b> Anda dapat mengedit detail event, menginput nomor perlombaan secara manual atau dari template, dan menghapus event kejuaraan.
              </span>
            </div>
            <button
              onClick={handleOpenNewEvent}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              + Tambah Event
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(evt => {
              const regCount = registrations.filter(r => r.eventId === evt.id).length;
              return (
                <div key={evt.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        evt.status === 'Buka' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : evt.status === 'Segera Ditutup'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        Status: {evt.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditEvent(evt)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Event & Nomor Perlombaan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEventToDelete(evt)}
                          className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Event Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mt-2.5 leading-snug">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{evt.organizer}</p>

                    <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Jadwal Event:</span>
                        <span className="font-semibold text-slate-800">{evt.eventDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Batas Daftar:</span>
                        <span className="font-semibold text-red-600">{evt.registrationDeadline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Biaya per Nomor:</span>
                        <span className="font-mono font-bold text-blue-700">{formatRupiah(evt.feePerStroke)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Akomodasi Pelatih:</span>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(evt.coachAccommodationFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Venue Kolam:</span>
                        <span className="text-right truncate max-w-[160px] font-medium">{evt.venuePool}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-700">
                          Nomor Perlombaan ({evt.availableStrokes.length} Nomor)
                        </span>
                        <button
                          onClick={() => handleOpenEditEvent(evt)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          + Kelola Nomor
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50/70 rounded-lg border border-slate-100">
                        {evt.availableStrokes.map(s => (
                          <span key={s.id} className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200/50 px-1.5 py-0.5 rounded font-medium">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Atlet Terdaftar:</span>
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {regCount} Peserta
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MASTER DATA ATLET */}
      {adminTab === 'athletes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setAthleteFilterTab('active')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                  athleteFilterTab === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border text-slate-600'
                }`}
              >
                Aktif ({activeAthletesCount})
              </button>
              <button
                onClick={() => setAthleteFilterTab('rest')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                  athleteFilterTab === 'rest' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border text-slate-600'
                }`}
              >
                Status Rest ({restAthletesCount})
              </button>
              <button
                onClick={() => setAthleteFilterTab('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                  athleteFilterTab === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border text-slate-600'
                }`}
              >
                Semua ({athletes.length})
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atlet, sekolah, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Mobile Cards for Athletes */}
          <div className="md:hidden divide-y divide-slate-100 p-2 space-y-2">
            {filteredAthletes.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada data atlet yang sesuai.
              </div>
            ) : (
              filteredAthletes.map(ath => {
                const stat = calculateAgeAndKU(ath.birthDate);
                return (
                  <div key={ath.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {ath.id}
                      </span>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ath.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {ath.isActive ? `Jadwal: ${ath.trainingSchedule}` : 'Rest (Non-aktif)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{ath.fullName}</h4>
                        <p className="text-[11px] text-slate-500">
                          {ath.birthDate} ({stat.age} thn) · {stat.ku}
                        </p>
                        <p className="text-[11px] text-slate-600 truncate max-w-[200px]">
                          {ath.school || '-'}
                        </p>
                      </div>

                      <button
                        onClick={() => onToggleAthleteStatus(ath.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shrink-0 min-h-[36px] ${
                          ath.isActive 
                            ? 'border-amber-300 text-amber-700 bg-white hover:bg-amber-50' 
                            : 'border-emerald-400 text-emerald-700 bg-white hover:bg-emerald-50 font-bold'
                        }`}
                      >
                        {ath.isActive ? 'Set Rest' : 'Aktifkan'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">ID Anggota</th>
                  <th className="py-3 px-4">Nama Atlet</th>
                  <th className="py-3 px-4">Tgl Lahir / KU</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Asal Sekolah</th>
                  <th className="py-3 px-4">Jadwal Latihan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAthletes.map(ath => {
                  const stat = calculateAgeAndKU(ath.birthDate);
                  return (
                    <tr key={ath.id} className="hover:bg-blue-50/20">
                      <td className="py-2.5 px-4 font-mono font-semibold text-blue-700">{ath.id}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900">{ath.fullName}</div>
                        <div className="text-[11px] text-slate-400">Ortu: {ath.parentName || '-'} ({ath.parentPhone || '-'})</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div>{ath.birthDate}</div>
                        <div className="text-[11px] text-blue-800 font-semibold">{stat.ku} ({stat.age} thn)</div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">{ath.gender}</td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-[150px] truncate">{ath.school || '-'}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{ath.trainingSchedule}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ath.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {ath.isActive ? 'Aktif' : 'Rest (Non-aktif)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => onToggleAthleteStatus(ath.id)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                            ath.isActive 
                              ? 'border-amber-300 text-amber-700 hover:bg-amber-50' 
                              : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {ath.isActive ? 'Jadikan Rest' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: DELETE EVENT CONFIRMATION (REPLACES BROWSER CONFIRM TO PREVENT IFRAME BLOCKS) */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Event Kejuaraan?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 my-4 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 text-sm">{eventToDelete.title}</div>
              <div className="text-slate-600">Jadwal: <b>{eventToDelete.eventDate}</b> · Venue: {eventToDelete.venuePool}</div>
              <div className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2 font-medium">
                Peringatan: Terdapat {registrations.filter(r => r.eventId === eventToDelete.id).length} atlet yang terdaftar pada event ini.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEvent}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Event Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE REGISTRATION CONFIRMATION */}
      {regToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Data Pendaftaran?</h3>
                <p className="text-xs text-slate-500">Tindakan ini akan menghapus data pendaftaran atlet ini.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 my-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">No. Registrasi:</span>
                <span className="font-mono font-bold text-blue-700">{regToDelete.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Atlet:</span>
                <span className="font-bold text-slate-900">{regToDelete.athleteName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kejuaraan:</span>
                <span className="font-medium text-slate-800 truncate max-w-[200px]">{regToDelete.eventTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nomor Lomba:</span>
                <span className="font-medium text-slate-800">{regToDelete.selectedStrokes.length} Nomor</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                <span className="text-slate-600">Total Biaya:</span>
                <span className="font-mono text-blue-900">{formatRupiah(regToDelete.totalAmount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRegToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRegistration(regToDelete.id);
                  setRegToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Pendaftaran</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT EVENT & INPUT MANUAL NOMOR PERLOMBAAN */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  {editingEvent ? 'Edit Event & Kelola Nomor Perlombaan' : 'Buat Event Kejuaraan Baru'}
                </h3>
                <p className="text-xs text-slate-500">Atur parameter lomba, jadwal, dan input nomor gaya yang dipertandingkan.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-5 text-xs">
              {/* Event basic details */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  1. Informasi Umum Kejuaraan
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Kejuaraan / Event</label>
                  <input
                    type="text"
                    required
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Contoh: Kejuaraan Renang Antar Perkumpulan (KRAP) Banten Open 2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Penyelenggara Resmi</label>
                    <input
                      type="text"
                      value={newEventOrganizer}
                      onChange={(e) => setNewEventOrganizer(e.target.value)}
                      placeholder="Acharya SC / Pengkab Akuatik"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Status Pendaftaran</label>
                    <select
                      value={newEventStatus}
                      onChange={(e) => setNewEventStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="Buka">Buka (Pendaftaran Aktif)</option>
                      <option value="Segera Ditutup">Segera Ditutup</option>
                      <option value="Tutup">Tutup</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tanggal Mulai Perlombaan</label>
                    <input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Batas Akhir Pendaftaran (Deadline)</label>
                    <input
                      type="date"
                      value={newEventDeadline}
                      onChange={(e) => setNewEventDeadline(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Biaya per Nomor Gaya (Rp)</label>
                    <input
                      type="number"
                      value={newEventFee}
                      onChange={(e) => setNewEventFee(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Akomodasi & Official Pelatih (Rp)</label>
                    <input
                      type="number"
                      value={newEventAccommodation}
                      onChange={(e) => setNewEventAccommodation(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Venue Kolam Renang</label>
                    <input
                      type="text"
                      value={newEventVenue}
                      onChange={(e) => setNewEventVenue(e.target.value)}
                      placeholder="Contoh: Kolam Prestasi Cas Waterpark"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Kota / Lokasi</label>
                    <input
                      type="text"
                      value={newEventLocation}
                      onChange={(e) => setNewEventLocation(e.target.value)}
                      placeholder="Pandeglang, Banten"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* INPUT MANUAL NOMOR PERLOMBAAN SECTION */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ListPlus className="w-4 h-4 text-blue-600" />
                      <span>2. Input Manual Nomor Perlombaan ({currentEventStrokes.length} Nomor)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tambahkan nomor gaya satu per satu atau gunakan preset template resmi.
                    </p>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleLoadPresetStrokes('sprint50')}
                      className="px-2 py-1 text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors"
                    >
                      + 4 Gaya 50m
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadPresetStrokes('standard100')}
                      className="px-2 py-1 text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors"
                    >
                      + 4 Gaya 100m
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadPresetStrokes('fullPackage')}
                      className="px-2 py-1 text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors"
                    >
                      + Paket Lengkap
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadPresetStrokes('clear')}
                      className="px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-colors"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                {/* Manual Input Form Row */}
                <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/70 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nama Nomor Perlombaan
                      </label>
                      <input
                        type="text"
                        value={manualStrokeName}
                        onChange={(e) => setManualStrokeName(e.target.value)}
                        placeholder="e.g. 50m Gaya Dada, 4x50m Estafet Mix"
                        className="w-full px-2.5 py-1.5 bg-white text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Kategori Gaya
                      </label>
                      <select
                        value={manualStrokeCategory}
                        onChange={(e) => {
                          const cat = e.target.value as StrokeCategory;
                          setManualStrokeCategory(cat);
                          setManualStrokeName(`${manualStrokeDistance}m Gaya ${cat}`);
                        }}
                        className="w-full px-2 py-1.5 bg-white text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="Bebas">Bebas</option>
                        <option value="Dada">Dada</option>
                        <option value="Punggung">Punggung</option>
                        <option value="Kupu-Kupu">Kupu-Kupu</option>
                        <option value="Ganti Perorangan">Ganti Perorangan</option>
                        <option value="Estafet">Estafet</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Jarak (m)
                      </label>
                      <select
                        value={manualStrokeDistance}
                        onChange={(e) => {
                          const d = Number(e.target.value);
                          setManualStrokeDistance(d);
                          setManualStrokeName(`${d}m Gaya ${manualStrokeCategory}`);
                        }}
                        className="w-full px-2 py-1.5 bg-white text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-medium font-mono"
                      >
                        <option value={25}>25m</option>
                        <option value={50}>50m</option>
                        <option value={100}>100m</option>
                        <option value={200}>200m</option>
                        <option value={400}>400m</option>
                        <option value={800}>800m</option>
                        <option value={1500}>1500m</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddManualStroke}
                        className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* List of Current Strokes */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/70 px-3 py-2 font-semibold text-slate-700 flex items-center justify-between border-b border-slate-200">
                    <span>Daftar Nomor Yang Dibuka Pada Event Ini:</span>
                    <span className="font-mono text-blue-700">{currentEventStrokes.length} Nomor Terdaftar</span>
                  </div>

                  {currentEventStrokes.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                      Belum ada nomor perlombaan. Tambahkan secara manual di atas atau pilih preset.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white">
                      {currentEventStrokes.map((s, idx) => (
                        <div key={s.id} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-mono text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900">{s.name}</span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {s.stroke} · {s.distance}m
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveStroke(s.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Hapus nomor ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20"
                >
                  Simpan Event & Nomor Lomba
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ATHLETE */}
      {showAthleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 font-serif">Tambah Data Atlet Acharya SC</h3>
            <form onSubmit={handleSaveAthlete} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap Atlet</label>
                <input
                  type="text"
                  required
                  value={newAthName}
                  onChange={(e) => setNewAthName(e.target.value)}
                  placeholder="Nama lengkap atlet..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal Lahir (DD/MM/YYYY)</label>
                  <input
                    type="text"
                    required
                    value={newAthBirth}
                    onChange={(e) => setNewAthBirth(e.target.value)}
                    placeholder="Contoh: 15/05/2015"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={newAthGender}
                    onChange={(e) => setNewAthGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Jadwal Latihan (Keterangan Aktif)</label>
                <select
                  value={newAthSchedule}
                  onChange={(e) => setNewAthSchedule(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Minggu">Minggu (Aktif)</option>
                  <option value="Sabtu">Sabtu (Aktif)</option>
                  <option value="Kamis">Kamis (Aktif)</option>
                  <option value="Private">Private (Aktif)</option>
                  <option value="Rest">Rest (Tidak Aktif)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Asal Sekolah</label>
                <input
                  type="text"
                  value={newAthSchool}
                  onChange={(e) => setNewAthSchool(e.target.value)}
                  placeholder="Contoh: SDN Saruni 1 Pandeglang"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Orang Tua</label>
                  <input
                    type="text"
                    value={newAthParent}
                    onChange={(e) => setNewAthParent(e.target.value)}
                    placeholder="Nama bapak/ibu"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">No WhatsApp</label>
                  <input
                    type="text"
                    value={newAthPhone}
                    onChange={(e) => setNewAthPhone(e.target.value)}
                    placeholder="08xxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAthleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Simpan Atlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
