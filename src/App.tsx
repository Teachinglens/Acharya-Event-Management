/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SwimmingEvent, Athlete, RegistrationEntry } from './types';
import { RAW_ATHLETE_DATA } from './data/initialAthletes';
import { INITIAL_EVENTS, INITIAL_REGISTRATIONS } from './data/initialEvents';
import { Navbar } from './components/Navbar';
import { RegistrationForm } from './components/RegistrationForm';
import { EventScheduleView } from './components/EventScheduleView';
import { AthletesDatabaseView } from './components/AthletesDatabaseView';
import { AdminPanel } from './components/AdminPanel';
import { RegistrationCard } from './components/RegistrationCard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Waves, Award, CheckCircle, Shield, Heart } from 'lucide-react';

export default function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<'register' | 'events' | 'athletes' | 'admin'>('register');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Core Data States with localStorage persistence
  const [events, setEvents] = useState<SwimmingEvent[]>(() => {
    const saved = localStorage.getItem('asc_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    const saved = localStorage.getItem('asc_athletes');
    return saved ? JSON.parse(saved) : RAW_ATHLETE_DATA;
  });

  const [registrations, setRegistrations] = useState<RegistrationEntry[]>(() => {
    const saved = localStorage.getItem('asc_registrations');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });

  // Modal state for viewing invoice / registration card
  const [viewingCardReg, setViewingCardReg] = useState<RegistrationEntry | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('asc_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('asc_athletes', JSON.stringify(athletes));
  }, [athletes]);

  useEffect(() => {
    localStorage.setItem('asc_registrations', JSON.stringify(registrations));
  }, [registrations]);

  // Handlers
  const handleCompleteRegistration = (newReg: RegistrationEntry) => {
    setRegistrations(prev => [newReg, ...prev]);
    // Directly display the Official Registration Invoice to confirm to Admin
    setViewingCardReg(newReg);
  };

  const handleAddEvent = (evt: SwimmingEvent) => {
    setEvents(prev => [evt, ...prev]);
  };

  const handleUpdateEvent = (evt: SwimmingEvent) => {
    setEvents(prev => prev.map(e => (e.id === evt.id ? evt : e)));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleAddAthlete = (ath: Athlete) => {
    setAthletes(prev => [ath, ...prev]);
  };

  const handleToggleAthleteStatus = (id: string) => {
    setAthletes(prev =>
      prev.map(a => {
        if (a.id === id) {
          const willBeActive = !a.isActive;
          return {
            ...a,
            isActive: willBeActive,
            trainingSchedule: willBeActive ? 'Minggu' : 'Rest'
          };
        }
        return a;
      })
    );
  };

  const handleUpdateRegStatus = (regId: string, status: 'paid' | 'pending' | 'cancelled') => {
    setRegistrations(prev =>
      prev.map(r => {
        if (r.id === regId) {
          return {
            ...r,
            paymentStatus: status,
            paidAt: status === 'paid' ? new Date().toLocaleDateString('id-ID') : undefined
          };
        }
        return r;
      })
    );
  };

  const handleDeleteRegistration = (regId: string) => {
    setRegistrations(prev => prev.filter(r => r.id !== regId));
  };

  const handleSelectAthleteForEvent = (athleteId: string) => {
    setActiveTab('register');
  };

  const handleSelectEventToRegister = (eventId: string) => {
    setActiveTab('register');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOpenAdminLogin={() => setShowAdminLogin(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-28 sm:pb-16">
        {activeTab === 'register' && (
          <RegistrationForm
            events={events}
            athletes={athletes}
            onCompleteRegistration={handleCompleteRegistration}
            onSelectEventView={(id) => setActiveTab('events')}
          />
        )}

        {activeTab === 'events' && (
          <EventScheduleView
            events={events}
            onSelectEventToRegister={handleSelectEventToRegister}
          />
        )}

        {activeTab === 'athletes' && (
          <AthletesDatabaseView
            athletes={athletes}
            onSelectAthleteForEvent={handleSelectAthleteForEvent}
          />
        )}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminPanel
              events={events}
              athletes={athletes}
              registrations={registrations}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              onAddAthlete={handleAddAthlete}
              onToggleAthleteStatus={handleToggleAthleteStatus}
              onUpdateRegStatus={handleUpdateRegStatus}
              onDeleteRegistration={handleDeleteRegistration}
              onViewRegCard={(reg) => setViewingCardReg(reg)}
            />
          ) : (
            <div className="max-w-md mx-auto py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">Akses Panel Pengurus Terkunci</h2>
              <p className="text-xs text-slate-500 mt-2">
                Panel ini khusus untuk administrator dan pelatih Acharya Swimming Club untuk mengatur perlombaan dan pendaftaran.
              </p>
              <button
                onClick={() => setShowAdminLogin(true)}
                className="mt-6 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-2"
              >
                <span>Buka Kunci Akses Admin (PIN)</span>
              </button>
            </div>
          )
        )}
      </main>

      {/* Modal: Official Registration Invoice & Card View */}
      {viewingCardReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl my-6">
            <RegistrationCard
              registration={viewingCardReg}
              onClose={() => setViewingCardReg(null)}
            />
          </div>
        </div>
      )}

      {/* Modal: Admin Login */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setActiveTab('admin');
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-blue-100 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800">Acharya Swimming Club Pandeglang</span>
            <span>·</span>
            <span>Master Pendaftaran Kejuaraan Resmi</span>
          </div>
          <div>
            Data Atlet Aktif Terverifikasi · Sistem Gateway QRIS & VA Terintegrasi
          </div>
        </div>
      </footer>
    </div>
  );
}
