import React, { useEffect } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { BookAppointmentModal } from './components/patient/BookAppointmentModal';
import { LandingPage } from './components/landing/LandingPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { PatientBookAppointment } from './components/patient/PatientBookAppointment';
import { PatientHistory } from './components/patient/PatientHistory';
import { PatientSettings } from './components/patient/PatientSettings';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { DoctorPatientHistory } from './components/doctor/DoctorPatientHistory';
import { DoctorSettings } from './components/doctor/DoctorSettings';
import { ReceptionistDashboard } from './components/receptionist/ReceptionistDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TechnicianDashboard } from './components/technician/TechnicianDashboard';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainHospitalApp: React.FC = () => {
  const { activeTab, currentRole, currentUser } = useHospital();

  // Scroll to top on portal tab switch (Logged-In Portal Users)
  useEffect(() => {
    if (currentUser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab, currentUser]);

  const renderActiveView = () => {
    // 1. GUEST MODE: Render Public Landing Page
    if (!currentUser) {
      return <LandingPage />;
    }

    // 2. AUTHENTICATED MODE: Strictly confined to the 5 Dedicated Role Portals
    switch (currentRole) {
      case 'admin':
        return <AdminDashboard />;

      case 'technician':
        return <TechnicianDashboard />;

      case 'doctor':
        return <DoctorDashboard />;

      case 'receptionist':
        return <ReceptionistDashboard />;

      case 'patient':
        return <PatientDashboard />;

      default:
        return <PatientDashboard />;
    }
  };

  const isGuestMode = !currentUser;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#0284C7] selection:text-white antialiased">
      {/* Apple-Smooth Header (Adaptive Guest / Dedicated Portal Bar) */}
      <Header />

      {/* Main Content Area */}
      <main className={`flex-1 w-full transition-all duration-300 ease-out ${
        isGuestMode 
          ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-22 pb-12' 
          : 'w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-22 pb-8'
      }`}>
        <ErrorBoundary>
          {renderActiveView()}
        </ErrorBoundary>
      </main>

      {/* Footer is displayed on GUEST MODE ONLY */}
      {isGuestMode && <Footer />}

      {/* Global Modals */}
      <AuthModal />
      <BookAppointmentModal />
    </div>
  );
};

export default function App() {
  return (
    <HospitalProvider>
      <MainHospitalApp />
    </HospitalProvider>
  );
}
